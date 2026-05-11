import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ChefDashboardPage.module.css';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Overview' },
  { icon: '📅', label: 'My Bookings' },
  { icon: '🧑‍🍳', label: 'My Profile' },
  { icon: '🕐', label: 'My Availability' },
  { icon: '🍽️', label: 'My Menu' },
  { icon: '⭐', label: 'My Reviews' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CUISINE_TAGS = [
  'West African', 'Caribbean', 'Italian', 'Japanese', 'Indian',
  'Mexican', 'Korean', 'Middle Eastern', 'Latin American', 'Chinese',
  'Vegan / Plant-based', 'French', 'Greek', 'Ethiopian', 'Thai',
];

function money(n) { return `$${Number(n || 0).toFixed(2)}`; }

export default function ChefDashboardPage({ user }) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('Overview');
  const [toast, setToast] = useState('');

  // Data
  const [bookings, setBookings]       = useState([]);
  const [reviews, setReviews]         = useState([]);
  const [dishes, setDishes]           = useState([]);
  const [availability, setAvailability] = useState([]);
  const [chefProfile, setChefProfile] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [pantriesByBooking, setPantriesByBooking] = useState({});

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadAll() {
    setLoading(true);
    try {
      // Find chef_id from chefs list by matching user_id
      const chefsRes = await fetch('http://localhost:8000/chefs');
      const chefsData = await chefsRes.json();
      const chefs = chefsData.chefs ?? [];
      const myChef = chefs.find(c => String(c.username) === String(user.username));
      if (myChef) {
        setChefProfile(myChef);
        const chefId = myChef.chef_id;

        const [bookRes, revRes, dishRes] = await Promise.all([
          fetch(`http://localhost:8000/chefs/${chefId}/bookings`).then(r => r.json()),
          fetch(`http://localhost:8000/chefs/${chefId}/reviews`).then(r => r.json()),
          fetch(`http://localhost:8000/chefs/${chefId}/dishes`).then(r => r.json()),
        ]);

        setBookings(bookRes.bookings ?? []);
        setReviews(revRes.reviews ?? []);
        setDishes(dishRes.dishes ?? []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleBookingStatus(bookingId, status) {
    try {
      await fetch(`http://localhost:8000/bookings/${bookingId}/status?status=${status}`, { method: 'PUT' });
      setBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, status } : b));
      setToast(`Booking ${status}.`);
    } catch {
      setToast('Could not update booking.');
    }
  }
  async function fetchPantryForBooking(bookingId, customerId) {
  if (pantriesByBooking[bookingId]) return;   // already loaded, skip
  try {
    const res = await fetch(`http://localhost:8000/users/${customerId}/pantry`);
    const data = await res.json();
    setPantriesByBooking(prev => ({ ...prev, [bookingId]: data.pantry ?? [] }));
  } catch {
    setPantriesByBooking(prev => ({ ...prev, [bookingId]: [] }));
  }
}

  function renderPanel() {
    if (loading) return <div className={styles.stateBox}><div className={styles.spinner} /><p>Loading dashboard…</p></div>;

    switch (activeNav) {
      case 'My Bookings':
        return <BookingsPanel bookings={bookings} onStatus={handleBookingStatus} />;
      case 'My Profile':
        return <ProfilePanel user={user} chef={chefProfile} onSave={(bio, specialty) => {
          if (chefProfile) {
            fetch(`http://localhost:8000/chefs/${chefProfile.chef_id}/profile?bio=${encodeURIComponent(bio)}&specialty=${encodeURIComponent(specialty)}`, { method: 'PUT' })
              .then(() => { setToast('Profile updated!'); loadAll(); })
              .catch(() => setToast('Could not save profile.'));
          }
        }} />;
      case 'My Availability':
        return <AvailabilityPanel availability={availability} chefId={chefProfile?.chef_id} onAdd={(day, start, end) => {
          fetch(`http://localhost:8000/chefs/${chefProfile.chef_id}/availability?day_of_week=${encodeURIComponent(day)}&start_time=${encodeURIComponent(start)}&end_time=${encodeURIComponent(end)}`, { method: 'POST' })
            .then(() => { setToast('Availability added!'); })
            .catch(() => setToast('Could not add availability.'));
        }} />;
      case 'My Menu':
        return <MenuPanel dishes={dishes} chefId={chefProfile?.chef_id} onAdd={(name, desc, price) => {
          fetch(`http://localhost:8000/chefs/${chefProfile.chef_id}/dishes?dish_name=${encodeURIComponent(name)}&description=${encodeURIComponent(desc)}&price=${price}`, { method: 'POST' })
            .then(() => { setToast('Dish added!'); loadAll(); })
            .catch(() => setToast('Could not add dish.'));
        }} />;
      case 'My Reviews':
        return <ReviewsPanel reviews={reviews} />;
      case 'Overview':
      default:
        return (
      <OverviewPanel
      user={user}
      chef={chefProfile}
      bookings={bookings}
      reviews={reviews}
      onNav={setActiveNav}
      pantriesByBooking={pantriesByBooking}
      fetchPantryForBooking={fetchPantryForBooking}
  />
);
    }
  }

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>{user?.username?.slice(0,2).toUpperCase() ?? '?'}</div>
          <strong>{user?.username ?? '...'}</strong>
          <small>Chef Account</small>
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

      {toast && <div className={styles.toast}>{toast}</div>}
    </main>
  );
}

/* ── Overview ── */
function OverviewPanel({ user, chef, bookings, reviews, onNav, pantriesByBooking = {}, fetchPantryForBooking }) {
  const totalBookings = bookings.length;
  const avgRating     = reviews.length ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(2) : '—';
  const pending       = bookings.filter(b => b.status === 'pending').length;

  const stats = [
    { label: 'Total Bookings', value: totalBookings },
    { label: 'Avg Rating',     value: avgRating },
    { label: 'Pending',        value: pending },
    { label: 'Reviews',        value: reviews.length },
  ];

  const upcoming = bookings.filter(b => b.status === 'pending' || b.status === 'accepted').slice(0, 3);

  return (
    <>
      <div className={styles.greeting}>
        <h1>Welcome back, {user?.username ?? '...'} 👨‍🍳</h1>
        <p>Here's a summary of your ChefConnect activity.</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className={styles.sectionHead}>
        <p className={styles.tableLabel}>Upcoming bookings</p>
        <span className={styles.countPill}>{upcoming.length}</span>
      </div>

      {upcoming.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyTitle}>No upcoming bookings</p>
          <p className={styles.emptyText}>When customers book you, they'll appear here.</p>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {upcoming.map(b => (
          <BookingCard
          key={b.booking_id}
          booking={b}
          pantry={pantriesByBooking[b.booking_id]}
          onLoadPantry={fetchPantryForBooking ? () => fetchPantryForBooking(b.booking_id, b.customer_id) : undefined}
  />
))}
        </div>
      )}

      <div className={styles.sectionHead} style={{ marginTop: '2rem' }}>
        <p className={styles.tableLabel}>Recent reviews</p>
        <span className={styles.countPill}>{reviews.length}</span>
      </div>
      {reviews.slice(0, 2).map(r => <ReviewCard key={r.review_id} review={r} />)}
    </>
  );
}

/* ── Bookings ── */
function BookingsPanel({ bookings, onStatus, pantriesByBooking = {}, fetchPantryForBooking }) {                                                 
  const [filter, setFilter] = useState('all');

  const filters = ['all', 'pending', 'accepted', 'declined', 'completed'];
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <>
      <div className={styles.panelHeader}>
        <h1>My Bookings</h1>
        <p>Manage incoming and past bookings from customers.</p>
      </div>

      <div className={styles.filterRow}>
        {filters.map(f => (
          <button key={f} className={`${styles.filterChip} ${filter === f ? styles.filterChipActive : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyBox}><p className={styles.emptyText}>No bookings found.</p></div>
      ) : (
        <div className={styles.bookingList}>
          {filtered.map(b => (
            <BookingCard
              key={b.booking_id}
              booking={b}
              onStatus={onStatus}
              pantry={pantriesByBooking[b.booking_id]}
              onLoadPantry={fetchPantryForBooking ? () => fetchPantryForBooking(b.booking_id, b.customer_id) : undefined}
              //          ^^^ CHANGED: guard against fetchPantryForBooking being undefined too
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ── Profile ── */
function ProfilePanel({ user, chef, onSave }) {
  const [bio, setBio]           = useState(chef?.bio ?? '');
  const [specialty, setSpecialty] = useState(chef?.specialty ?? '');
  useEffect(() => {
    if (chef) {
      setBio(chef.bio ?? '');
      setSpecialty(chef.specialty ?? '');
    }
  }, [chef]);
  const tags = specialty.split(',').map(t => t.trim()).filter(Boolean);

  function toggleTag(tag) {
    const current = specialty.split(',').map(t => t.trim()).filter(Boolean);
    const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    setSpecialty(next.join(', '));
  }

  return (
    <>
      <div className={styles.panelHeader}>
        <h1>My Profile</h1>
        <p>Update your bio and cuisine specialties.</p>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formGroup}>
          <label>Bio</label>
          <textarea className={styles.formTextarea} value={bio} onChange={e => setBio(e.target.value)} rows={5} placeholder="Tell customers about your cooking background…" />
        </div>

        <div className={styles.formGroup}>
          <label>Cuisine Specialties</label>
          <div className={styles.tagGrid}>
            {CUISINE_TAGS.map(tag => (
              <button key={tag} type="button"
                className={`${styles.tag} ${tags.includes(tag) ? styles.tagSelected : ''}`}
                onClick={() => toggleTag(tag)}
              >{tag}</button>
            ))}
          </div>
        </div>

        <div className={styles.formActions}>
          <button className={styles.savePrimary} onClick={() => onSave(bio, specialty)}>Save changes</button>
        </div>
      </div>
    </>
  );
}

/* ── Availability ── */
function AvailabilityPanel({ chefId, onAdd }) {
  const [day, setDay]     = useState('Monday');
  const [start, setStart] = useState('09:00');
  const [end, setEnd]     = useState('17:00');

  function submit() {
    onAdd(day, start + ':00', end + ':00');
  }

  return (
    <>
      <div className={styles.panelHeader}>
        <h1>My Availability</h1>
        <p>Add or update the times you're available to cook.</p>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formGroup}>
          <label>Day</label>
          <select className={styles.formSelect} value={day} onChange={e => setDay(e.target.value)}>
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className={styles.timeRow}>
          <div className={styles.formGroup}>
            <label>Start time</label>
            <input type="time" className={styles.formInput} value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>End time</label>
            <input type="time" className={styles.formInput} value={end} onChange={e => setEnd(e.target.value)} />
          </div>
        </div>
        <div className={styles.formActions}>
          <button className={styles.savePrimary} onClick={submit}>Add availability</button>
        </div>
      </div>
    </>
  );
}

/* ── Menu ── */
function MenuPanel({ dishes, onAdd }) {
  const [name, setName]   = useState('');
  const [desc, setDesc]   = useState('');
  const [price, setPrice] = useState('');

  function submit() {
    if (!name || !price) return;
    onAdd(name, desc, parseFloat(price));
    setName(''); setDesc(''); setPrice('');
  }

  return (
    <>
      <div className={styles.panelHeader}>
        <h1>My Menu</h1>
        <p>Add dishes customers can request when booking you.</p>
      </div>

      <div className={styles.formCard}>
        <h3 className={styles.formCardTitle}>Add a dish</h3>
        <div className={styles.formGroup}>
          <label>Dish name</label>
          <input className={styles.formInput} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jollof Rice" />
        </div>
        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea className={styles.formTextarea} value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Describe the dish…" />
        </div>
        <div className={styles.formGroup}>
          <label>Price ($)</label>
          <input className={styles.formInput} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="25.00" />
        </div>
        <div className={styles.formActions}>
          <button className={styles.savePrimary} onClick={submit}>Add dish</button>
        </div>
      </div>

      <div className={styles.sectionHead} style={{ marginTop: '2rem' }}>
        <p className={styles.tableLabel}>Current menu</p>
        <span className={styles.countPill}>{dishes.length}</span>
      </div>

      {dishes.length === 0 ? (
        <div className={styles.emptyBox}><p className={styles.emptyText}>No dishes yet — add your first one above.</p></div>
      ) : (
        <div className={styles.dishGrid}>
          {dishes.map(d => (
            <div key={d.dish_id} className={styles.dishCard}>
              <div className={styles.dishTop}>
                <strong>{d.dish_name}</strong>
                <span className={styles.dishPrice}>${Number(d.price).toFixed(2)}</span>
              </div>
              {d.description && <p className={styles.dishDesc}>{d.description}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Reviews ── */
function ReviewsPanel({ reviews }) {
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(2)
    : null;

  return (
    <>
      <div className={styles.panelHeader}>
        <h1>My Reviews</h1>
        <p>Feedback from customers who've booked you.</p>
      </div>

      {avg && (
        <div className={styles.ratingBanner}>
          <span className={styles.ratingBig}>{avg}</span>
          <span className={styles.ratingStars}>{'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}</span>
          <span className={styles.ratingCount}>from {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className={styles.emptyBox}><p className={styles.emptyText}>No reviews yet — get your first booking!</p></div>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map(r => <ReviewCard key={r.review_id} review={r} />)}
        </div>
      )}
    </>
  );
}

/* ── Shared sub-components ── */
function BookingCard({ booking, onStatus, pantry, onLoadPantry }) {
  const isPending = booking.status === 'pending';
  const [showPantry, setShowPantry] = useState(false);   

  function togglePantry() {
    setShowPantry(s => !s);
    if (!showPantry && onLoadPantry) onLoadPantry();
  }

  return (
    <div className={styles.bookingCard}>
      <div className={styles.cardLeft}>
        <div className={styles.miniAvatar}>{booking.customer_name?.slice(0,2).toUpperCase() ?? '?'}</div>
        <div>
          <strong>{booking.customer_name ?? 'Customer'}</strong>
          <small>{booking.booking_date} at {typeof booking.booking_time === 'string' ? booking.booking_time.slice(0,5) : ''}</small>
        </div>
      </div>
      <div className={styles.cardMid}>
        {booking.customer_requests && (
          <div className={styles.requestBox}>
            <span className={styles.requestLabel}>Special request:</span>
            <p className={styles.requests}>"{booking.customer_requests}"</p>
          </div>
        )}

        {/* pantry toggle button */}
        {onLoadPantry && (
          <button
            type="button"
            onClick={togglePantry}
            style={{
              marginTop: '0.5rem',
              background: 'none',
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '0.35rem 0.7rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {showPantry ? '▾ Hide pantry' : '▸ View customer pantry'}
          </button>
        )}

        {/* pantry list (only shows when expanded) */}
        {showPantry && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.6rem 0.8rem',
            background: '#fafafa',
            borderRadius: '8px',
            border: '1px solid #eee',
          }}>
            {pantry === undefined ? (
              <small>Loading pantry…</small>
            ) : pantry.length === 0 ? (
              <small>Customer hasn't added any pantry ingredients yet.</small>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {pantry.map(item => (
                  <li key={item.pantry_id} style={{ padding: '0.2rem 0', fontSize: '0.9rem' }}>
                    <strong>{item.ingredient_name}</strong>
                    {item.quantity && <span style={{ color: '#888' }}> — {item.quantity}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className={styles.cardRight}>
        <span className={`${styles.statusBadge} ${styles['status_' + booking.status]}`}>{booking.status}</span>
        {onStatus && (
          <div className={styles.cardActions}>
            {isPending && <>
              <button className={styles.btnAccept} onClick={() => onStatus(booking.booking_id, 'accepted')}>Accept</button>
              <button className={styles.btnDecline} onClick={() => onStatus(booking.booking_id, 'declined')}>Decline</button>
            </>}
            {booking.status === 'accepted' && (
              <button className={styles.btnDecline} onClick={() => onStatus(booking.booking_id, 'cancelled')}>Cancel</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  const rating = Number(review.rating);
  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewTop}>
        <div className={styles.cardLeft}>
          <div className={styles.miniAvatar}>{review.reviewer_name?.slice(0,2).toUpperCase() ?? '?'}</div>
          <div>
            <strong>{review.reviewer_name ?? 'Customer'}</strong>
            <small>{review.created_at?.slice(0,10)}</small>
          </div>
        </div>
        <span className={styles.reviewStars}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
      </div>
      {review.comment && <p className={styles.reviewText}>{review.comment}</p>}
    </div>
  );
}