import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import styles from './DashboardPage.module.css';



const NAV_ITEMS = [
  { icon: '🏠',   label: 'Dashboard' },
  { icon: '📅',   label: 'My Bookings' },
  { icon: '🥘',   label: 'Pantry Profile' },
  { icon: '⭐',   label: 'My Reviews' },
  { icon: '💳',   label: 'Payments' },
  { icon: '⚙️',   label: 'Settings' },
];


const SEED_REVIEWS = [
  
];

const SEED_PAYMENT_METHODS = [
  
];


const SEED_NOTIFS = {
  bookingUpdates: true,
  promotions:     false,
  weeklyDigest:   true,
};

const RATING_LABELS = ['Tap to rate', 'Bad', 'Poor', 'Okay', 'Good', 'Excellent'];

function money(n) { return `$${n.toFixed(2)}`; }

/* ──────────────────────────────────────────────────────────────
 * Main component
 * ────────────────────────────────────────────────────────────── */

export default function DashboardPage( { user }) {
  const navigate = useNavigate();
  const [activeNav,      setActiveNav]     = useState('Dashboard');
 
  // Data state
  const [bookings,       setBookings]      = useState([]);
  const [reviews,        setReviews]       = useState([]);   
  const [paymentMethods, setPaymentMethods]= useState(SEED_PAYMENT_METHODS);
  const [pantry,         setPantry]        = useState([]);   
  const [notifs,         setNotifs]        = useState(SEED_NOTIFS);

  // UI state
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [toast,            setToast]            = useState('');
  const [reviewModal,      setReviewModal]      = useState(null);
  const [rescheduleModal,  setRescheduleModal]  = useState(null);

 useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:8000/users/${user.user_id}/bookings`)
      .then(r => r.json())
      .then(data => {
        const raw = Array.isArray(data) ? data : (data.bookings ?? []);
        // CHANGED: build a set of chef_ids the user has already reviewed
        const reviewedChefIds = new Set(reviews.map(r => r.chefId));
        const mapped = raw.map(b => ({
          ...b,
          id:       b.booking_id,
          chef:     b.chef_name,
          date:     b.booking_date,
          time:     typeof b.booking_time === 'string' ? b.booking_time.slice(0,5) : '',
          amount:   parseFloat(b.total_amount) || 0,
          upcoming: b.status === 'pending' || b.status === 'accepted',
          reviewed: reviewedChefIds.has(b.chef_id),   // CHANGED: true if user has reviewed this chef
          emoji:    '🧑‍🍳',
          cuisine:  '',
        }));
        setBookings(mapped);
        setLoading(false);
      })
      .catch(() => {
        setBookings([]);
        setLoading(false);
      });
  }, [user, reviews]);   // CHANGED: also re-runs when reviews load, so reviewed flag is accurate

  useEffect(() => {
  if (!user) return;
  fetch(`http://localhost:8000/users/${user.user_id}/pantry`)
    .then(r => r.json())
    .then(data => setPantry(data.pantry ?? []))
    .catch(() => setPantry([]));
}, [user]);

  useEffect(() => {
  if (!user) return;
  fetch(`http://localhost:8000/users/${user.user_id}/payment-methods`)
    .then(r => r.json())
    .then(data => {
      const cards = data.payment_methods ?? [];
      setPaymentMethods(cards);
    })
    .catch(() => {
      setPaymentMethods([]);
    });
}, [user]);

  /* Scroll to top when switching panels */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if ((activeNav === 'My Bookings' || activeNav === 'Dashboard') && user) {
      fetch(`http://localhost:8000/users/${user.user_id}/bookings`)
        .then(r => r.json())
        .then(data => {
          const raw = Array.isArray(data) ? data : (data.bookings ?? []);
          // CHANGED: same reviewed cross-reference as the main fetch
          const reviewedChefIds = new Set(reviews.map(r => r.chefId));
          const mapped = raw.map(b => ({
            ...b,
            id:       b.booking_id,
            chef:     b.chef_name,
            date:     b.booking_date,
            time:     typeof b.booking_time === 'string' ? b.booking_time.slice(0,5) : '',
            amount:   parseFloat(b.total_amount) || 0,
            upcoming: b.status === 'pending' || b.status === 'accepted',
            reviewed: reviewedChefIds.has(b.chef_id),   // CHANGED
            emoji:    '🧑‍🍳',
            cuisine:  '',
          }));
          setBookings(mapped);
        })
        .catch(() => {});
    }
  }, [activeNav, user, reviews]);   // CHANGED: also depends on reviews


/*: fetch user's reviews so they persist across logins */
  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:8000/users/${user.user_id}/reviews`)
      .then(r => r.json())
      .then(data => {
        // Map backend shape to the shape ReviewsPanel expects
        const mapped = (data.reviews ?? []).map(r => ({
          id:          'r' + r.review_id,
          chefId:      r.chef_id,
          chefName:    r.chef_name,
          chefEmoji:   '🧑‍🍳',
          rating:      Number(r.rating),
          comment:     r.comment ?? '',
          dateWritten: r.created_at
            ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '',
          bookingDate: '', 
        }));
        setReviews(mapped);
      })
      .catch(() => setReviews([]));
  }, [user]);

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Handlers ── */

  function handleCancel(id) {
    fetch(`http://localhost:8000/bookings/${id}/status?status=cancelled&user_id=${user.user_id}`, {
      method: 'PUT',
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setToast(data.error);
          return;
        }
        setBookings(prev =>
          prev.map(b => b.id === id ? { ...b, status: 'cancelled', upcoming: false } : b)
        );
        setToast('Booking cancelled.');
      })
      .catch(() => setToast('Could not cancel booking. Please try again.'));
  }

  function handleOpenReschedule(booking) {
    setRescheduleModal({ bookingId: booking.id, currentDate: booking.date, currentTime: booking.time });
  }

  async function handleSubmitReschedule({ date, time }) {
    if (!rescheduleModal) return;
    try {
      const res = await fetch(
        `http://localhost:8000/bookings/${rescheduleModal.bookingId}/reschedule` +
        `?user_id=${user.user_id}` +
        `&booking_date=${encodeURIComponent(date)}` +
        `&booking_time=${encodeURIComponent(time + ':00')}`,
        { method: 'PUT' }
      );
      const data = await res.json();
      if (data.error) { setToast(data.error); return; }
      setRescheduleModal(null);
      setToast('Booking rescheduled!');
      // Re-fetch bookings so the dashboard reflects the new date/time
      const fresh = await fetch(`http://localhost:8000/users/${user.user_id}/bookings`).then(r => r.json());
      const raw = Array.isArray(fresh) ? fresh : (fresh.bookings ?? []);
      setBookings(raw.map(b => ({
        ...b,
        id:       b.booking_id,
        chef:     b.chef_name,
        date:     b.booking_date,
        time:     typeof b.booking_time === 'string' ? b.booking_time.slice(0,5) : '',
        amount:   parseFloat(b.total_amount) || 0,
        upcoming: b.status === 'pending' || b.status === 'accepted',
        reviewed: false,
        emoji:    '🧑‍🍳',
        cuisine:  '',
      })));
    } catch {
      setToast('Could not reschedule. Please try again.');
    }
  }

  function handleOpenReview(booking) {
    setReviewModal({
      bookingId:   booking.id,
      chefId:      booking.chef_id,
      chefName:    booking.chef,
      chefEmoji:   booking.emoji,
      bookingDate: booking.date,
    });
  }

 async function handleSubmitReview({ rating, comment }) {
    if (!reviewModal) return;
    const { bookingId, chefId, chefName, chefEmoji, bookingDate } = reviewModal;

    try {
      const url = `http://localhost:8000/reviews` +
        `?chef_id=${chefId}` +
        `&user_id=${user.user_id}` +
        `&rating=${rating}` +
        `&comment=${encodeURIComponent(comment)}`;
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();

      if (data.detail) {
        setToast(data.detail);
        return;
      }

      // This way the review has the real review_id, created_at, etc.
      const refreshed = await fetch(`http://localhost:8000/users/${user.user_id}/reviews`).then(r => r.json());
      const mapped = (refreshed.reviews ?? []).map(r => ({
        id:          'r' + r.review_id,
        chefId:      r.chef_id,
        chefName:    r.chef_name,
        chefEmoji:   '🧑‍🍳',
        rating:      Number(r.rating),
        comment:     r.comment ?? '',
        dateWritten: r.created_at
          ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '',
        bookingDate: '',
      }));
      setReviews(mapped);

      // Mark this booking AND any other bookings with the same chef as reviewed
      setBookings(prev => prev.map(b => b.chef_id === chefId ? { ...b, reviewed: true } : b));
      setReviewModal(null);
      setToast('Review submitted. Thanks!');
    } catch {
      setToast('Could not submit review. Please try again.');
    }
  }

  function handleDeleteReview(reviewId) {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    setToast('Review deleted.');
  }

  function handleRemoveCard(pmId) {
    setPaymentMethods(prev => prev.filter(p => p.id !== pmId));
    setToast('Card removed.');
  }

  function handleMakeDefault(pmId) {
    setPaymentMethods(prev => prev.map(p => ({ ...p, isDefault: p.id === pmId })));
    setToast('Default card updated.');
  }

  function handleAddCard() {
    setToast('Card form will open once payments are wired up.');
  }

async function handleAddPantryItem(name, quantity) {
  if (!name.trim()) return;
  try {
    const url = `http://localhost:8000/users/${user.user_id}/pantry` +
      `?ingredient_name=${encodeURIComponent(name.trim())}` +
      `&quantity=${encodeURIComponent(quantity.trim() || '')}`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();
    if (data.detail) {
      setToast(data.detail);
      return;
    }
    const refreshed = await fetch(`http://localhost:8000/users/${user.user_id}/pantry`).then(r => r.json());
    setPantry(refreshed.pantry ?? []);
    setToast('Ingredient added.');
  } catch {
    setToast('Could not add ingredient.');
  }
}

async function handleRemovePantryItem(pantryId) {
  try {
    await fetch(`http://localhost:8000/users/${user.user_id}/pantry/${pantryId}`, { method: 'DELETE' });
    setPantry(prev => prev.filter(item => item.pantry_id !== pantryId));
    setToast('Ingredient removed.');
  } catch {
    setToast('Could not remove ingredient.');
  }
}

  function toggleNotif(key) { setNotifs(prev => ({ ...prev, [key]: !prev[key] })); }
  function saveSettings() { setToast('Notification preferences saved.'); }
  function notImplemented() { setToast('This will be available once the backend is connected.'); }

  /* ── Panel router ── */

  function renderPanel() {
    if (loading) return <PanelLoader />;
    if (error)   return <PanelError message={error} />;

    switch (activeNav) {
      case 'My Bookings':
        return <BookingsPanel bookings={bookings} onCancel={handleCancel} onReschedule={handleOpenReschedule} onLeaveReview={handleOpenReview} />;
      case 'Pantry Profile':
       return <PantryPanel pantry={pantry} onAdd={handleAddPantryItem} onRemove={handleRemovePantryItem} />;
      case 'My Reviews':
        return <ReviewsPanel bookings={bookings} reviews={reviews} onLeaveReview={handleOpenReview} onDeleteReview={handleDeleteReview} />;
      case 'Payments':
        return <PaymentsPanel paymentMethods={paymentMethods} transactions={bookings} onRemoveCard={handleRemoveCard} onMakeDefault={handleMakeDefault} onAddCard={handleAddCard} />;
      case 'Settings':
        return <SettingsPanel user={user} notifs={notifs} toggleNotif={toggleNotif} onSave={saveSettings} onEditField={notImplemented} />;
      case 'Dashboard':
      default:
        return <OverviewPanel user={user} bookings={bookings} onCancel={handleCancel} onReschedule={handleOpenReschedule} onLeaveReview={handleOpenReview} />;
    }
  }

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>{user?.initials ?? '?'}</div>
          <strong>{user?.username ?? 'Loading...'}</strong>
          <small>Customer Account</small>
        </div>
        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.label}
              className={`${styles.navLink} ${activeNav === item.label ? styles.navActive : ''}`}
              onClick={() => setActiveNav(item.label)}
            >
              <span>{item.icon}</span>
              {item.label}
              {activeNav === item.label && <span className={styles.dot} />}
            </button>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        {renderPanel()}
      </div>

      {reviewModal && (
        <ReviewModal
          chefName={reviewModal.chefName}
          chefEmoji={reviewModal.chefEmoji}
          bookingDate={reviewModal.bookingDate}
          onClose={() => setReviewModal(null)}
          onSubmit={handleSubmitReview}
        />
      )}

      {rescheduleModal && (
        <RescheduleModal
          currentDate={rescheduleModal.currentDate}
          currentTime={rescheduleModal.currentTime}
          onClose={() => setRescheduleModal(null)}
          onSubmit={handleSubmitReschedule}
        />
      )}

      {toast && <div className={styles.toast} role="status">{toast}</div>}
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Panels
 * ────────────────────────────────────────────────────────────── */

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function OverviewPanel({ user, bookings, onCancel, onReschedule, onLeaveReview }) {
  const upcoming = bookings.filter(b => b.upcoming);
  const past     = bookings.filter(b => !b.upcoming);

  const stats = [
    { label: 'Total Bookings', value: bookings.length, sub: '' },
    { label: 'Total Spent', value: `$${bookings.filter(b => b.status !== 'cancelled' && b.status !== 'declined').reduce((s,b) => s+(b.amount||0), 0).toFixed(2)}`, sub: '' },
  ];

  return (
    <>
      <div className={styles.greeting}>
        <h1>{greeting()}, {user?.username ?? '...'} 👋</h1>
        <p>Here's a summary of your ChefConnect activity.</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
            {s.sub && <span className={styles.statSub}>{s.sub}</span>}
          </div>
        ))}
      </div>

      <SectionHeader label="Upcoming bookings" count={upcoming.length} />
      {upcoming.length === 0 ? <EmptyBookings /> : (
        <div className={styles.bookingList}>
          {upcoming.map(b => (
            <UpcomingBookingCard key={b.id} booking={b} onCancel={onCancel} onReschedule={onReschedule} />
          ))}
        </div>
      )}

      <SectionHeader label="Past bookings" count={past.length} spaced />
      {past.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>No past bookings yet.</p>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {past.map(b => <PastBookingCard key={b.id} booking={b} onLeaveReview={onLeaveReview} />)}
        </div>
      )}
    </>
  );
}

function BookingsPanel({ bookings, onCancel, onReschedule, onLeaveReview }) {
  const [filter, setFilter] = useState('all');

  const counts = {
    all:       bookings.length,
    upcoming:  bookings.filter(b => b.upcoming).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const filtered = bookings.filter(b => {
    if (filter === 'all')       return true;
    if (filter === 'upcoming')  return b.upcoming;
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'upcoming',  label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <>
      <PanelHeader title="My Bookings" sub="All your past and upcoming chef bookings in one place." />
      <div className={styles.filterRow}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`${styles.filterChip} ${filter === f.key ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className={styles.filterCount}>{counts[f.key]}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? <EmptyBookings /> : (
        <div className={styles.bookingList}>
          {filtered.map(b =>
            b.upcoming
              ? <UpcomingBookingCard key={b.id} booking={b} onCancel={onCancel} onReschedule={onReschedule} />
              : <PastBookingCard key={b.id} booking={b} onLeaveReview={onLeaveReview} />
          )}
        </div>
      )}
    </>
  );
}


function PantryPanel({ pantry, onAdd, onRemove }) {
  const [newName, setNewName]         = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  function submit(e) {
    e?.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName, newQuantity);
    setNewName('');
    setNewQuantity('');
  }

  return (
    <>
      <PanelHeader title="Pantry Profile" sub="Add ingredients you have at home. Chefs you book will see this to plan around what's in your kitchen." />

      <div className={styles.formCard}>
        <h3 className={styles.formCardTitle}>Add an ingredient</h3>
        <div className={styles.formGroup}>
          <label htmlFor="pantry-name" className={styles.formLabel}>Ingredient</label>
          <input
            id="pantry-name"
            className={styles.formInput || ''}
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Rice, olive oil, chicken thighs…"
            onKeyDown={e => { if (e.key === 'Enter') submit(e); }}
            style={{ padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="pantry-qty" className={styles.formLabel}>Quantity (optional)</label>
          <input
            id="pantry-qty"
            type="text"
            value={newQuantity}
            onChange={e => setNewQuantity(e.target.value)}
            placeholder="e.g. 2 lbs, half a bag, a few"
            onKeyDown={e => { if (e.key === 'Enter') submit(e); }}
            style={{ padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
          />
        </div>
        <div className={styles.formActions}>
          <button className={styles.savePrimary} onClick={submit}>Add to pantry</button>
        </div>
      </div>

      <SectionHeader label="Your pantry" count={pantry.length} spaced />
      {pantry.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyTitle}>Your pantry is empty</p>
          <p className={styles.emptyText}>Add what you have at home so chefs can cook around it.</p>
        </div>
      ) : (
        <div className={styles.formCard}>
          {pantry.map(item => (
            <div
              key={item.pantry_id}
              className={styles.settingsRow}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <span className={styles.settingsRowLabel}>{item.ingredient_name}</span>
                {item.quantity && <span className={styles.settingsRowValue}>{item.quantity}</span>}
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => onRemove(item.pantry_id)}
                aria-label={`Remove ${item.ingredient_name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ReviewsPanel({ bookings, reviews, onLeaveReview, onDeleteReview }) {
  const awaiting = bookings.filter(b => b.status === 'completed' && !b.reviewed);
  return (
    <>
      <PanelHeader title="My Reviews" sub="Reviews you've written and bookings still waiting for your feedback." />
      <SectionHeader label="Awaiting your review" count={awaiting.length} />
      {awaiting.length === 0 ? (
        <div className={styles.emptyBox}><p className={styles.emptyText}>You're all caught up — nothing waiting for review.</p></div>
      ) : (
        <div className={styles.bookingList}>
          {awaiting.map(b => (
            <div key={b.id} className={styles.bookingCard}>
              <div className={styles.cardLeft}>
                <div className={styles.miniAvatar}>{b.emoji}</div>
                <div><strong>{b.chef}</strong><small>{b.cuisine}</small></div>
              </div>
              <div className={styles.cardMid}>
                <div className={styles.dateBlock}><span className={styles.dateMain}>{b.date}</span><span className={styles.dateSub}>{b.time}</span></div>
                <div className={styles.amountBlock}><span className={styles.amountMain}>{money(b.amount)}</span></div>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.savePrimary} onClick={() => onLeaveReview(b)}>Write review</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <SectionHeader label="Your reviews" count={reviews.length} spaced />
      {reviews.length === 0 ? (
        <div className={styles.emptyBox}><p className={styles.emptyText}>You haven't written any reviews yet.</p></div>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map(r => (
            <div key={r.id} className={styles.writtenReview}>
              <div className={styles.writtenReviewTop}>
                <div className={styles.cardLeft}>
                  <div className={styles.miniAvatar}>{r.chefEmoji}</div>
                  <div><strong>{r.chefName}</strong><small>Booked {r.bookingDate}</small></div>
                </div>
                <StarsDisplay rating={r.rating} />
              </div>
              <p className={styles.writtenReviewText}>"{r.comment}"</p>
              <div className={styles.writtenReviewFoot}>
                <span className={styles.writtenReviewDate}>Written {r.dateWritten}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function PaymentsPanel({ paymentMethods, transactions, onRemoveCard, onMakeDefault, onAddCard }) {
  return (
    <>
      <PanelHeader title="Payments" sub="Manage your saved cards and review your transaction history." />
      <SectionHeader label="Payment methods" count={paymentMethods.length} />
      <div className={styles.cardsList}>
        {paymentMethods.map(p => (
          <div key={p.id} className={styles.payCard}>
            <div className={styles.payCardLeft}>
              <div className={styles.payCardChip} aria-hidden="true">💳</div>
              <div><strong>{p.brand} •••• {p.last4}</strong><small>Expires {p.exp}</small></div>
            </div>
            <div className={styles.payCardRight}>
              {p.isDefault
                ? <span className={styles.defaultBadge}>Default</span>
                : <button className={styles.linkBtn} onClick={() => onMakeDefault(p.id)}>Make default</button>}
              <button className={styles.removeBtn} onClick={() => onRemoveCard(p.id)} aria-label="Remove card">×</button>
            </div>
          </div>
        ))}
        <button className={styles.addCardBtn} onClick={onAddCard}>+ Add new card</button>
      </div>
      <SectionHeader label="Recent transactions" count={transactions.length} spaced />
      {transactions.length === 0 ? (
        <div className={styles.emptyBox}><p className={styles.emptyText}>No transactions yet.</p></div>
      ) : (
        <div className={styles.txTable}>
          <div className={`${styles.txRow} ${styles.txHead}`}>
            <div>Description</div><div>Date</div><div>Amount</div><div>Status</div>
          </div>
          {transactions.map(t => (
            <div key={t.id} className={styles.txRow}>
              <div className={styles.txDesc}>
                <span className={styles.miniAvatarSm}>{t.emoji}</span>
                <div><strong>{t.chef}</strong><small>{t.cuisine}</small></div>
              </div>
              <div className={styles.txCell}>{t.date}</div>
              <div className={styles.txCell}>{money(t.amount)}</div>
              <div className={styles.txCell}><StatusBadge status={t.status} /></div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function SettingsPanel({ user, notifs, toggleNotif, onSave, onEditField }) {
  return (
    <>
      <PanelHeader title="Settings" sub="Manage your account and how we get in touch." />
      <div className={styles.formCard}>
        <h3 className={styles.formCardTitle}>Account</h3>
        <div className={styles.settingsRow}>
          <div>
            <span className={styles.settingsRowLabel}>Username</span>
            <span className={styles.settingsRowValue}>{user?.username ?? '—'}</span>
          </div>
          <button className={styles.linkBtn} onClick={onEditField}>Edit</button>
        </div>
        <div className={styles.settingsRow}>
          <div>
            <span className={styles.settingsRowLabel}>Email</span>
            <span className={styles.settingsRowValue}>{user?.email ?? '—'}</span>
          </div>
          <button className={styles.linkBtn} onClick={onEditField}>Edit</button>
        </div>
        <div className={styles.settingsRow}>
          <div>
            <span className={styles.settingsRowLabel}>Password</span>
            <span className={styles.settingsRowValue}>••••••••</span>
          </div>
          <button className={styles.linkBtn} onClick={onEditField}>Change</button>
        </div>
      </div>
      <div className={styles.formCard}>
        <h3 className={styles.formCardTitle}>Notifications</h3>
        <ToggleRow label="Booking updates" desc="Confirmations, reminders, cancellations." checked={notifs.bookingUpdates} onChange={() => toggleNotif('bookingUpdates')} />
        <ToggleRow label="Promotions and offers" desc="Discounts, seasonal specials, and chef spotlights." checked={notifs.promotions} onChange={() => toggleNotif('promotions')} />
        <ToggleRow label="Weekly digest" desc="A weekly summary of new chefs in your area." checked={notifs.weeklyDigest} onChange={() => toggleNotif('weeklyDigest')} />
        <div className={styles.formActions}>
          <button className={styles.savePrimary} onClick={onSave}>Save preferences</button>
        </div>
      </div>
      <div className={`${styles.formCard} ${styles.dangerCard}`}>
        <h3 className={styles.formCardTitle}>Danger zone</h3>
        <p className={styles.dangerText}>Permanently delete your account and all associated data. This cannot be undone.</p>
        <button className={styles.dangerBtn} onClick={onEditField}>Delete my account</button>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────────────────────── */

function PanelHeader({ title, sub }) {
  return (
    <div className={styles.panelHeader}>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
  );
}

function SectionHeader({ label, count, spaced }) {
  return (
    <div className={`${styles.sectionHead} ${spaced ? styles.sectionHeadSpaced : ''}`}>
      <p className={styles.tableLabel}>{label}</p>
      <span className={styles.countPill}>{count}</span>
    </div>
  );
}

function UpcomingBookingCard({ booking, onCancel, onReschedule }) {
  const isCancelled = booking.status === 'cancelled';
  return (
    <div className={styles.bookingCard}>
      <div className={styles.cardLeft}>
        <div className={styles.miniAvatar}>{booking.emoji}</div>
        <div><strong>{booking.chef}</strong><small>{booking.cuisine}</small></div>
      </div>
      <div className={styles.cardMid}>
        <div className={styles.dateBlock}>
          <span className={styles.dateMain}>{booking.date}</span>
          <span className={styles.dateSub}>{booking.time}</span>
        </div>
        <div className={styles.amountBlock}>
          <span className={styles.amountMain}>{money(booking.amount)}</span>
          <StatusBadge status={booking.status} />
        </div>
      </div>
      <div className={styles.cardActions}>
        <button className={styles.btnReschedule} onClick={onReschedule} disabled={isCancelled}>Reschedule</button>
        <button className={styles.btnCancel} onClick={() => onCancel(booking.id)} disabled={isCancelled}>Cancel</button>
      </div>
    </div>
  );
}

function PastBookingCard({ booking, onLeaveReview }) {
  const showReview = booking.status === 'completed' && !booking.reviewed;
  const reviewed   = booking.status === 'completed' && booking.reviewed;
  return (
    <div className={`${styles.bookingCard} ${styles.bookingPast}`}>
      <div className={styles.cardLeft}>
        <div className={styles.miniAvatar}>{booking.emoji}</div>
        <div><strong>{booking.chef}</strong><small>{booking.cuisine}</small></div>
      </div>
      <div className={styles.cardMid}>
        <div className={styles.dateBlock}>
          <span className={styles.dateMain}>{booking.date}</span>
          <span className={styles.dateSub}>{booking.time}</span>
        </div>
        <div className={styles.amountBlock}>
          <span className={styles.amountMain}>{money(booking.amount)}</span>
          <StatusBadge status={booking.status} />
        </div>
      </div>
      <div className={styles.cardActions}>
        {showReview && <button className={styles.btnGhost} onClick={() => onLeaveReview(booking)}>Leave a review</button>}
        {reviewed && <span className={styles.reviewedTag}>Reviewed ✓</span>}
        {!showReview && !reviewed && <span className={styles.pastNote}>—</span>}
      </div>
    </div>
  );
}


function StarsDisplay({ rating }) {
  return (
    <span className={styles.starsDisplay} aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className={styles.toggleRow}>
      <div>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleDesc}>{desc}</span>
      </div>
      <button type="button" className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`} role="switch" aria-checked={checked} aria-label={label} onClick={onChange}>
        <span className={styles.toggleKnob} />
      </button>
    </div>
  );
}

function EmptyBookings() {
  return (
    <div className={styles.emptyBox}>
      <p className={styles.emptyTitle}>No bookings found</p>
      <p className={styles.emptyText}>Find someone who cooks the food you love and book your first chef.</p>
      <Link to="/" className={styles.emptyBtn}>Browse chefs</Link>
    </div>
  );
}

function PanelLoader() {
  return (
    <div className={styles.stateBox}>
      <div className={styles.spinner} aria-hidden="true" />
      <p>Loading dashboard…</p>
    </div>
  );
}

function PanelError({ message }) {
  return (
    <div className={styles.stateBox}>
      <h4>Could not load dashboard</h4>
      <p>{message}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Review Modal
 * ────────────────────────────────────────────────────────────── */

function RescheduleModal({ currentDate, currentTime, onClose, onSubmit }) {
  const [date, setDate] = useState(currentDate || '');
  const [time, setTime] = useState(currentTime || '');
  const [error, setError] = useState('');

  function submit() {
    if (!date || !time) { setError('Please pick a new date and time.'); return; }
    onSubmit({ date, time });
  }

  function handleKey(e) { if (e.key === 'Escape') onClose(); }
  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Reschedule booking">
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">×</button>
        <span className={styles.modalEyebrow}>Reschedule booking</span>
        <div className={styles.modalGroup}>
          <label className={styles.modalLabel}>New date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%', fontSize: '1rem' }}
          />
        </div>
        <div className={styles.modalGroup}>
          <label className={styles.modalLabel}>New time</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%', fontSize: '1rem' }}
          />
        </div>
        {error && <div className={styles.modalError} role="alert">{error}</div>}
        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose}>Cancel</button>
          <button className={styles.modalSubmit} onClick={submit}>Confirm reschedule</button>
        </div>
      </div>
    </div>
  );
}


function ReviewModal({ chefName, chefEmoji, bookingDate, onClose, onSubmit }) {
  const [rating,  setRating]  = useState(0);
  const [hover,   setHover]   = useState(0);
  const [comment, setComment] = useState('');
  const [error,   setError]   = useState('');

  function submit() {
    setError('');
    if (rating === 0) { setError('Please choose a star rating.'); return; }
    if (comment.trim().length < 10) { setError('Please write at least 10 characters about your experience.'); return; }
    onSubmit({ rating, comment: comment.trim() });
  }

  function handleKey(e) { if (e.key === 'Escape') onClose(); }

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ratingShown = hover || rating;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Leave a review for ${chefName}`}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">×</button>
        <span className={styles.modalEyebrow}>Leave a review</span>
        <div className={styles.modalChef}>
          <div className={styles.modalChefAvatar}>{chefEmoji}</div>
          <div><strong>{chefName}</strong><small>Booking on {bookingDate}</small></div>
        </div>
        <div className={styles.modalGroup}>
          <label className={styles.modalLabel}>Your rating</label>
          <div className={styles.starInput}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" className={`${styles.starBtn} ${ratingShown >= n ? styles.starBtnFilled : ''}`} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>★</button>
            ))}
            <span className={styles.starInputLabel}>{RATING_LABELS[ratingShown]}</span>
          </div>
        </div>
        <div className={styles.modalGroup}>
          <label htmlFor="rev-comment" className={styles.modalLabel}>Your review</label>
          <textarea id="rev-comment" className={styles.modalTextarea} placeholder="What was the food like? How was the chef? Would you book them again?" value={comment} onChange={e => setComment(e.target.value)} rows={5} />
          <small className={styles.modalCounter}>{comment.length} characters</small>
        </div>
        {error && <div className={styles.modalError} role="alert">{error}</div>}
        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose}>Cancel</button>
          <button className={styles.modalSubmit} onClick={submit}>Submit review</button>
        </div>
      </div>
    </div>
  );
}
