import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import styles from './ChefDashboardPage.module.css';

/* ──────────────────────────────────────────────────────────────
 * Mock data — replace with API calls when chef routes are ready.
 * ────────────────────────────────────────────────────────────── */

const CHEF_USER = {
  name:     'Anika Osei',
  initials: 'AO',
  email:    'anika.osei@example.com',
  emoji:    '👩🏾‍🍳',
  cuisine:  'West African & Caribbean',
  location: 'Brooklyn, NY',
  rating:   4.9,
  reviewCount: 48,
  rate:     85,
};

const STATS = [
  { label: 'Pending Requests',    value: '3',      sub: '2 awaiting your reply' },
  { label: 'Upcoming Bookings',   value: '5',      sub: 'next: tomorrow 6:30 PM' },
  { label: 'Earnings (This Mo.)', value: '$2,840', sub: '↑ 18% vs. last month' },
  { label: 'Average Rating',      value: '4.9 ★',  sub: '48 total reviews' },
];

const NAV_ITEMS = [
  { icon: '🏠',  label: 'Overview' },
  { icon: '📨', label: 'Booking Requests' },
  { icon: '📅', label: 'Upcoming Bookings' },
  { icon: '👤', label: 'My Profile' },
  { icon: '🗓️', label: 'Availability' },
  { icon: '💰', label: 'Earnings' },
  { icon: '⭐', label: 'Reviews' },
];

const SEED_REQUESTS = [
  {
    id: 'rq1',
    customer:       'Marcus T.',
    customerEmail:  'marcus.t@example.com',
    customerInit:   'MT',
    date:           'May 12, 2026',
    time:           '7:00 PM',
    hours:          3,
    serviceType:    'Cuisine Chef',
    guests:         6,
    address:        '142 Putnam Ave, Brooklyn NY',
    specialRequest: 'Birthday dinner for my mother — would love a Jollof feast with sides. No shellfish please, one guest has an allergy.',
    amount:         255,
    receivedAgo:    '2 hours ago',
  },
  {
    id: 'rq2',
    customer:       'Sandra K.',
    customerEmail:  'sandra.k@example.com',
    customerInit:   'SK',
    date:           'May 15, 2026',
    time:           '6:00 PM',
    hours:          2,
    serviceType:    'Pantry Chef',
    guests:         2,
    address:        '88 Lafayette Ave, Brooklyn NY',
    specialRequest: 'Quiet anniversary dinner. Anything you can make from what we have — we trust your judgment.',
    amount:         170,
    receivedAgo:    '5 hours ago',
  },
  {
    id: 'rq3',
    customer:       'Jamal F.',
    customerEmail:  'jamal.f@example.com',
    customerInit:   'JF',
    date:           'May 22, 2026',
    time:           '5:30 PM',
    hours:          4,
    serviceType:    'Cuisine Chef',
    guests:         10,
    address:        '23 Halsey St, Brooklyn NY',
    specialRequest: 'Office dinner for my team. Mix of dishes please. Two vegetarians.',
    amount:         340,
    receivedAgo:    'yesterday',
  },
];

const SEED_UPCOMING = [
  { id: 'up1', customer: 'Elena R.',  customerInit: 'ER', date: 'May 10, 2026', time: '6:30 PM', amount: 198.50, status: 'confirmed', serviceType: 'Cuisine Chef', guests: 4 },
  { id: 'up2', customer: 'David W.',  customerInit: 'DW', date: 'May 13, 2026', time: '7:30 PM', amount: 246.00, status: 'confirmed', serviceType: 'Cuisine Chef', guests: 6 },
  { id: 'up3', customer: 'Tomás P.',  customerInit: 'TP', date: 'May 19, 2026', time: '6:00 PM', amount: 178.00, status: 'pending',   serviceType: 'Pantry Chef',  guests: 2 },
  { id: 'up4', customer: 'Hannah L.', customerInit: 'HL', date: 'May 24, 2026', time: '7:00 PM', amount: 312.50, status: 'confirmed', serviceType: 'Cuisine Chef', guests: 8 },
];

const SEED_REVIEWS = [
  { id: 'r1', customer: 'Marcus T.', customerInit: 'MT', rating: 5, comment: "Anika made the best Jollof I've ever had outside of Lagos. She came in, checked my pantry, and worked with what I had. Absolutely amazing experience for my family dinner.", date: 'Apr 28, 2026' },
  { id: 'r2', customer: 'Sandra K.', customerInit: 'SK', rating: 5, comment: 'We requested a full Caribbean spread for 8 people — oxtail, rice & peas, plantains — everything was perfect. Anika was professional, clean, and so warm with our guests.', date: 'Apr 15, 2026' },
  { id: 'r3', customer: 'Jamal F.',  customerInit: 'JF', rating: 4, comment: 'Great pantry chef experience. Told her what I had and she made something completely different than I expected — in the best way. Will book again.', date: 'Mar 30, 2026' },
];

const SEED_AVAILABILITY = [
  { day: 'Monday',    open: false, from: '17:00', to: '21:00' },
  { day: 'Tuesday',   open: true,  from: '16:00', to: '21:00' },
  { day: 'Wednesday', open: true,  from: '16:00', to: '21:00' },
  { day: 'Thursday',  open: false, from: '17:00', to: '21:00' },
  { day: 'Friday',    open: true,  from: '15:00', to: '22:00' },
  { day: 'Saturday',  open: true,  from: '11:00', to: '22:00' },
  { day: 'Sunday',    open: true,  from: '12:00', to: '19:00' },
];

const SEED_PROFILE = {
  bio: "I grew up cooking West African and Caribbean food with my grandmother. I specialise in Jollof, Egusi soup, Ackee & Saltfish, Oxtail, and can work with whatever ingredients you already have at home.",
  serviceType: 'Both',
  cuisines: ['West African', 'Caribbean', 'Pantry Chef'],
  dishes:   'Jollof Rice, Egusi Soup, Ackee & Saltfish, Oxtail Stew, Suya Skewers, Puff Puff',
  experience: 3,
  rate: 85,
  serviceArea: 'Brooklyn, NY',
};

const CUISINE_OPTIONS = [
  'West African', 'Caribbean', 'Italian', 'Japanese', 'Indian',
  'Mexican', 'Korean', 'Middle Eastern', 'Latin American', 'Chinese',
  'Vegan / Plant-based', 'Pantry Chef',
];

const SEED_EARNINGS = {
  monthTotal: 2840,
  pending:    595,
  paid:       2245,
  bestMonth:  3120,
  payouts: [
    { id: 'p1', period: 'May 1 — May 7, 2026', bookings: 3, amount: 595.00, status: 'pending'  },
    { id: 'p2', period: 'Apr 24 — Apr 30, 2026', bookings: 4, amount: 738.50, status: 'paid' },
    { id: 'p3', period: 'Apr 17 — Apr 23, 2026', bookings: 3, amount: 524.00, status: 'paid' },
    { id: 'p4', period: 'Apr 10 — Apr 16, 2026', bookings: 4, amount: 612.25, status: 'paid' },
    { id: 'p5', period: 'Apr 3 — Apr 9, 2026',   bookings: 2, amount: 370.00, status: 'paid' },
  ],
  // Last 6 months for the bar chart
  monthlyHistory: [
    { month: 'Dec', amount: 1820 },
    { month: 'Jan', amount: 2140 },
    { month: 'Feb', amount: 2310 },
    { month: 'Mar', amount: 2680 },
    { month: 'Apr', amount: 2410 },
    { month: 'May', amount: 2840 },
  ],
};

function money(n) { return `$${n.toFixed(2)}`; }
function moneyShort(n) { return `$${n.toLocaleString()}`; }

/* ──────────────────────────────────────────────────────────────
 * Main component
 * ────────────────────────────────────────────────────────────── */

export default function ChefDashboardPage() {
  const [activeNav, setActiveNav] = useState('Overview');

  const [requests,     setRequests]     = useState([]);
  const [upcoming,     setUpcoming]     = useState([]);
  const [reviews,      setReviews]      = useState([]);
  const [availability, setAvailability] = useState(SEED_AVAILABILITY);
  const [profile,      setProfile]      = useState(SEED_PROFILE);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState('');

  /* Initial mock fetch */
  useEffect(() => {
    setLoading(true);
    setError('');
    const t = setTimeout(() => {
      setRequests(SEED_REQUESTS);
      setUpcoming(SEED_UPCOMING);
      setReviews(SEED_REVIEWS);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  /* Scroll to top on panel switch */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeNav]);

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Handlers ──────────────────────────────────────────── */

  function handleAccept(reqId) {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;
    setRequests(prev => prev.filter(r => r.id !== reqId));
    setUpcoming(prev => [
      {
        id: 'up_' + reqId,
        customer:     req.customer,
        customerInit: req.customerInit,
        date:         req.date,
        time:         req.time,
        amount:       req.amount,
        status:       'confirmed',
        serviceType:  req.serviceType,
        guests:       req.guests,
      },
      ...prev,
    ]);
    setToast(`Accepted booking from ${req.customer}.`);
  }

  function handleDecline(reqId) {
    const req = requests.find(r => r.id === reqId);
    setRequests(prev => prev.filter(r => r.id !== reqId));
    setToast(req ? `Declined ${req.customer}'s request.` : 'Request declined.');
  }

  function handleMessage(label) {
    setToast(`Messaging ${label} will open once chat is wired up.`);
  }

  function toggleDayOpen(day) {
    setAvailability(prev =>
      prev.map(d => d.day === day ? { ...d, open: !d.open } : d)
    );
  }
  function setDayTime(day, field, value) {
    setAvailability(prev =>
      prev.map(d => d.day === day ? { ...d, [field]: value } : d)
    );
  }
  function saveAvailability() {
    setToast('Availability saved.');
  }

  function updateProfileField(field, value) {
    setProfile(prev => ({ ...prev, [field]: value }));
  }
  function toggleProfileCuisine(c) {
    setProfile(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(c)
        ? prev.cuisines.filter(x => x !== c)
        : [...prev.cuisines, c],
    }));
  }
  function saveProfile() {
    setToast('Profile saved.');
  }

  /* ── Panel router ──────────────────────────────────────── */

  function renderPanel() {
    if (loading) return <PanelLoader />;
    if (error)   return <PanelError message={error} />;

    switch (activeNav) {
      case 'Booking Requests':
        return <RequestsPanel
          requests={requests}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onMessage={handleMessage}
        />;
      case 'Upcoming Bookings':
        return <UpcomingPanel
          upcoming={upcoming}
          onMessage={handleMessage}
        />;
      case 'My Profile':
        return <ProfilePanel
          profile={profile}
          onChange={updateProfileField}
          onToggleCuisine={toggleProfileCuisine}
          onSave={saveProfile}
        />;
      case 'Availability':
        return <AvailabilityPanel
          availability={availability}
          onToggleDay={toggleDayOpen}
          onSetTime={setDayTime}
          onSave={saveAvailability}
        />;
      case 'Earnings':
        return <EarningsPanel earnings={SEED_EARNINGS} />;
      case 'Reviews':
        return <ReviewsPanel reviews={reviews} chef={CHEF_USER} />;
      case 'Overview':
      default:
        return <OverviewPanel
          requests={requests}
          upcoming={upcoming}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onGoToRequests={() => setActiveNav('Booking Requests')}
        />;
    }
  }

  return (
    <main className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>{CHEF_USER.emoji}</div>
          <strong>{CHEF_USER.name}</strong>
          <small>Chef · {CHEF_USER.location}</small>

          {/* Role indicator: makes it crystal clear which dashboard you're on */}
          <span className={styles.roleTag}>Chef Account</span>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(item => {
            const active = activeNav === item.label;
            const showBadge = item.label === 'Booking Requests' && requests.length > 0;
            return (
              <button
                key={item.label}
                className={`${styles.navLink} ${active ? styles.navActive : ''}`}
                onClick={() => setActiveNav(item.label)}
              >
                <span>{item.icon}</span>
                {item.label}
                {showBadge && (
                  <span className={styles.navBadge}>{requests.length}</span>
                )}
                {active && !showBadge && <span className={styles.dot} />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main panel */}
      <div className={styles.main}>
        {renderPanel()}
      </div>

      {toast && (
        <div className={styles.toast} role="status">{toast}</div>
      )}
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Panels
 * ────────────────────────────────────────────────────────────── */

function OverviewPanel({ requests, upcoming, onAccept, onDecline, onGoToRequests }) {
  const topRequests = requests.slice(0, 2);
  const topUpcoming = upcoming.slice(0, 3);

  return (
    <>
      <div className={styles.greeting}>
        <h1>Good morning, {CHEF_USER.name.split(' ')[0]} 👋</h1>
        <p>Here’s what’s on your plate today.</p>
      </div>

      <div className={styles.statsGrid}>
        {STATS.map(s => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
            {s.sub && <span className={styles.statSub}>{s.sub}</span>}
          </div>
        ))}
      </div>

      <SectionHeader label="New booking requests" count={requests.length} action={
        requests.length > 2 && (
          <button className={styles.linkBtn} onClick={onGoToRequests}>
            View all →
          </button>
        )
      } />

      {topRequests.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>No pending requests right now. Nice work — you’re all caught up.</p>
        </div>
      ) : (
        <div className={styles.requestList}>
          {topRequests.map(r => (
            <RequestCard
              key={r.id}
              request={r}
              onAccept={onAccept}
              onDecline={onDecline}
              compact
            />
          ))}
        </div>
      )}

      <SectionHeader label="Upcoming bookings" count={upcoming.length} spaced />
      {topUpcoming.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>No confirmed bookings yet.</p>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {topUpcoming.map(b => (
            <UpcomingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </>
  );
}

function RequestsPanel({ requests, onAccept, onDecline, onMessage }) {
  return (
    <>
      <PanelHeader
        title="Booking Requests"
        sub="Customers waiting for your reply. Accept to add the booking to your schedule, or decline if you can't make it work."
      />

      {requests.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyTitle}>No pending requests</p>
          <p className={styles.emptyText}>
            When customers book you, their requests will show up here.
          </p>
        </div>
      ) : (
        <div className={styles.requestList}>
          {requests.map(r => (
            <RequestCard
              key={r.id}
              request={r}
              onAccept={onAccept}
              onDecline={onDecline}
              onMessage={onMessage}
            />
          ))}
        </div>
      )}
    </>
  );
}

function UpcomingPanel({ upcoming, onMessage }) {
  const confirmed = upcoming.filter(b => b.status === 'confirmed');
  const pending   = upcoming.filter(b => b.status === 'pending');

  return (
    <>
      <PanelHeader
        title="Upcoming Bookings"
        sub="Confirmed gigs on your calendar. Reach out to the customer ahead of time to plan the menu."
      />

      <SectionHeader label="Confirmed" count={confirmed.length} />
      {confirmed.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>No confirmed bookings yet.</p>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {confirmed.map(b => (
            <UpcomingCard key={b.id} booking={b} onMessage={onMessage} />
          ))}
        </div>
      )}

      <SectionHeader label="Pending" count={pending.length} spaced />
      {pending.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>Nothing pending — every upcoming booking is confirmed.</p>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {pending.map(b => (
            <UpcomingCard key={b.id} booking={b} onMessage={onMessage} />
          ))}
        </div>
      )}
    </>
  );
}

function ProfilePanel({ profile, onChange, onToggleCuisine, onSave }) {
  return (
    <>
      <PanelHeader
        title="My Profile"
        sub="This is what customers see when they open your chef page. Keep it up to date."
      />

      {/* Preview card showing how the profile looks live */}
      <div className={styles.previewCard}>
        <div className={styles.previewAvatar}>{CHEF_USER.emoji}</div>
        <div>
          <strong>{CHEF_USER.name}</strong>
          <span className={styles.previewSub}>
            {profile.cuisines.slice(0, 3).join(' · ')} · {profile.serviceArea}
          </span>
          <span className={styles.previewMeta}>
            ★ {CHEF_USER.rating} ({CHEF_USER.reviewCount} reviews) · ${profile.rate}/hr
          </span>
        </div>
      </div>

      <div className={styles.formCard}>
        <h3 className={styles.formCardTitle}>About you</h3>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="cd-bio">Short Bio</label>
          <textarea
            id="cd-bio"
            className={styles.formTextarea}
            value={profile.bio}
            onChange={e => onChange('bio', e.target.value)}
            placeholder="Tell customers about your cooking background, specialties, and style…"
            rows={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Specialty Cuisines</label>
          <div className={styles.chipPicker}>
            {CUISINE_OPTIONS.map(c => (
              <button
                key={c}
                type="button"
                className={`${styles.pickerChip} ${profile.cuisines.includes(c) ? styles.pickerChipActive : ''}`}
                onClick={() => onToggleCuisine(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="cd-dishes">Signature Dishes</label>
          <p className={styles.formHelp}>Comma-separated. Customers see this as a list on your profile.</p>
          <textarea
            id="cd-dishes"
            className={styles.formTextarea}
            value={profile.dishes}
            onChange={e => onChange('dishes', e.target.value)}
            placeholder="Jollof Rice, Egusi Soup, Ackee & Saltfish…"
            rows={3}
          />
        </div>
      </div>

      <div className={styles.formCard}>
        <h3 className={styles.formCardTitle}>Service & pricing</h3>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="cd-service">Service Type</label>
            <select
              id="cd-service"
              className={styles.formInput}
              value={profile.serviceType}
              onChange={e => onChange('serviceType', e.target.value)}
            >
              <option value="cuisine">Cuisine Chef only (I bring ingredients)</option>
              <option value="pantry">Pantry Chef only (use client's ingredients)</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="cd-area">Service Area</label>
            <input
              id="cd-area"
              type="text"
              className={styles.formInput}
              value={profile.serviceArea}
              onChange={e => onChange('serviceArea', e.target.value)}
              placeholder="Brooklyn, NY"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="cd-exp">Years of Experience</label>
            <input
              id="cd-exp"
              type="number"
              className={styles.formInput}
              value={profile.experience}
              onChange={e => onChange('experience', e.target.value)}
              placeholder="3"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="cd-rate">Hourly Rate ($)</label>
            <input
              id="cd-rate"
              type="number"
              className={styles.formInput}
              value={profile.rate}
              onChange={e => onChange('rate', e.target.value)}
              placeholder="85"
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button className={styles.savePrimary} onClick={onSave}>
            Save profile
          </button>
        </div>
      </div>
    </>
  );
}

function AvailabilityPanel({ availability, onToggleDay, onSetTime, onSave }) {
  return (
    <>
      <PanelHeader
        title="Availability"
        sub="Set the days and hours you’re available to cook. Customers can only book you during these windows."
      />

      <div className={styles.formCard}>
        <h3 className={styles.formCardTitle}>Weekly schedule</h3>

        <div className={styles.availList}>
          {availability.map(d => (
            <div key={d.day} className={`${styles.availRow} ${!d.open ? styles.availRowClosed : ''}`}>
              <div className={styles.availLeft}>
                <button
                  type="button"
                  className={`${styles.toggle} ${d.open ? styles.toggleOn : ''}`}
                  role="switch"
                  aria-checked={d.open}
                  aria-label={`${d.day} availability`}
                  onClick={() => onToggleDay(d.day)}
                >
                  <span className={styles.toggleKnob} />
                </button>
                <span className={styles.availDay}>{d.day}</span>
              </div>

              <div className={styles.availTimes}>
                {d.open ? (
                  <>
                    <input
                      type="time"
                      value={d.from}
                      onChange={e => onSetTime(d.day, 'from', e.target.value)}
                      className={styles.timeInput}
                      aria-label={`${d.day} start time`}
                    />
                    <span className={styles.timeDash}>—</span>
                    <input
                      type="time"
                      value={d.to}
                      onChange={e => onSetTime(d.day, 'to', e.target.value)}
                      className={styles.timeInput}
                      aria-label={`${d.day} end time`}
                    />
                  </>
                ) : (
                  <span className={styles.closedLabel}>Unavailable</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.formActions}>
          <button className={styles.savePrimary} onClick={onSave}>
            Save availability
          </button>
        </div>
      </div>
    </>
  );
}

function EarningsPanel({ earnings }) {
  const max = Math.max(...earnings.monthlyHistory.map(m => m.amount));

  return (
    <>
      <PanelHeader
        title="Earnings"
        sub="Track what you’ve earned and what’s on its way."
      />

      {/* Summary cards */}
      <div className={styles.earningsSummary}>
        <div className={styles.earningCard}>
          <span className={styles.earningLabel}>This month</span>
          <span className={styles.earningValue}>{moneyShort(earnings.monthTotal)}</span>
          <span className={styles.earningSub}>↑ 18% vs. last month</span>
        </div>
        <div className={styles.earningCard}>
          <span className={styles.earningLabel}>Pending payout</span>
          <span className={styles.earningValue}>{moneyShort(earnings.pending)}</span>
          <span className={styles.earningSub}>Releases May 14</span>
        </div>
        <div className={styles.earningCard}>
          <span className={styles.earningLabel}>Paid out</span>
          <span className={styles.earningValue}>{moneyShort(earnings.paid)}</span>
          <span className={styles.earningSub}>This month</span>
        </div>
        <div className={styles.earningCard}>
          <span className={styles.earningLabel}>Best month</span>
          <span className={styles.earningValue}>{moneyShort(earnings.bestMonth)}</span>
          <span className={styles.earningSub}>March 2026</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className={styles.formCard}>
        <h3 className={styles.formCardTitle}>Last 6 months</h3>
        <div className={styles.chart}>
          {earnings.monthlyHistory.map(m => {
            const heightPct = (m.amount / max) * 100;
            const isCurrent = m === earnings.monthlyHistory[earnings.monthlyHistory.length - 1];
            return (
              <div key={m.month} className={styles.chartCol}>
                <div className={styles.chartBarWrap}>
                  <span className={styles.chartBarValue}>{moneyShort(m.amount)}</span>
                  <div
                    className={`${styles.chartBar} ${isCurrent ? styles.chartBarCurrent : ''}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className={styles.chartMonth}>{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payouts table */}
      <SectionHeader label="Recent payouts" count={earnings.payouts.length} spaced />
      <div className={styles.txTable}>
        <div className={`${styles.txRow} ${styles.txHead}`}>
          <div>Period</div>
          <div>Bookings</div>
          <div>Amount</div>
          <div>Status</div>
        </div>
        {earnings.payouts.map(p => (
          <div key={p.id} className={styles.txRow}>
            <div className={styles.txCell}>{p.period}</div>
            <div className={styles.txCell}>{p.bookings} bookings</div>
            <div className={styles.txCell}>{money(p.amount)}</div>
            <div className={styles.txCell}>
              <StatusBadge status={p.status === 'paid' ? 'completed' : p.status} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ReviewsPanel({ reviews, chef }) {
  // Compute rating distribution
  const dist = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
  }));
  const total = reviews.length || 1;

  return (
    <>
      <PanelHeader
        title="Customer Reviews"
        sub="What customers are saying about your cooking."
      />

      {/* Summary card */}
      <div className={styles.ratingSummary}>
        <div className={styles.ratingBig}>
          <span className={styles.ratingNumber}>{chef.rating}</span>
          <StarsDisplay rating={Math.round(chef.rating)} large />
          <span className={styles.ratingCount}>{chef.reviewCount} reviews</span>
        </div>

        <div className={styles.ratingDist}>
          {dist.map(d => {
            const pct = (d.count / total) * 100;
            return (
              <div key={d.stars} className={styles.distRow}>
                <span className={styles.distLabel}>{d.stars} ★</span>
                <div className={styles.distBar}>
                  <div className={styles.distFill} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.distCount}>{d.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <SectionHeader label="All reviews" count={reviews.length} />
      {reviews.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>No reviews yet.</p>
        </div>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map(r => (
            <div key={r.id} className={styles.writtenReview}>
              <div className={styles.writtenReviewTop}>
                <div className={styles.cardLeft}>
                  <div className={styles.miniAvatar}>{r.customerInit}</div>
                  <div>
                    <strong>{r.customer}</strong>
                    <small>{r.date}</small>
                  </div>
                </div>
                <StarsDisplay rating={r.rating} />
              </div>
              <p className={styles.writtenReviewText}>“{r.comment}”</p>
            </div>
          ))}
        </div>
      )}
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

function SectionHeader({ label, count, spaced, action }) {
  return (
    <div className={`${styles.sectionHead} ${spaced ? styles.sectionHeadSpaced : ''}`}>
      <p className={styles.tableLabel}>{label}</p>
      <span className={styles.countPill}>{count}</span>
      {action && <div className={styles.sectionHeadAction}>{action}</div>}
    </div>
  );
}

function RequestCard({ request, onAccept, onDecline, onMessage, compact }) {
  return (
    <div className={`${styles.requestCard} ${compact ? styles.requestCardCompact : ''}`}>
      <div className={styles.requestTop}>
        <div className={styles.requestCustomer}>
          <div className={styles.miniAvatar}>{request.customerInit}</div>
          <div>
            <strong>{request.customer}</strong>
            <small>Received {request.receivedAgo}</small>
          </div>
        </div>
        <span className={styles.requestAmount}>{money(request.amount)}</span>
      </div>

      <div className={styles.requestMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Date</span>
          <span className={styles.metaValue}>{request.date}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Time</span>
          <span className={styles.metaValue}>{request.time}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Duration</span>
          <span className={styles.metaValue}>{request.hours} hours</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Service</span>
          <span className={styles.metaValue}>{request.serviceType}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Guests</span>
          <span className={styles.metaValue}>{request.guests}</span>
        </div>
        <div className={`${styles.metaItem} ${styles.metaItemWide}`}>
          <span className={styles.metaLabel}>Address</span>
          <span className={styles.metaValue}>{request.address}</span>
        </div>
      </div>

      {!compact && request.specialRequest && (
        <div className={styles.requestNote}>
          <span className={styles.requestNoteLabel}>Special request</span>
          <p>{request.specialRequest}</p>
        </div>
      )}

      <div className={styles.requestActions}>
        {!compact && onMessage && (
          <button
            className={styles.btnGhost}
            onClick={() => onMessage(request.customer)}
          >
            Message customer
          </button>
        )}
        <button
          className={styles.btnDecline}
          onClick={() => onDecline(request.id)}
        >
          Decline
        </button>
        <button
          className={styles.btnAccept}
          onClick={() => onAccept(request.id)}
        >
          Accept booking
        </button>
      </div>
    </div>
  );
}

function UpcomingCard({ booking, onMessage }) {
  return (
    <div className={styles.bookingCard}>
      <div className={styles.cardLeft}>
        <div className={styles.miniAvatar}>{booking.customerInit}</div>
        <div>
          <strong>{booking.customer}</strong>
          <small>{booking.serviceType} · {booking.guests} guests</small>
        </div>
      </div>
      <div className={styles.dateBlock}>
        <span className={styles.dateMain}>{booking.date}</span>
        <span className={styles.dateSub}>{booking.time}</span>
      </div>
      <div className={styles.amountBlock}>
        <span className={styles.amountMain}>{money(booking.amount)}</span>
        <StatusBadge status={booking.status} />
      </div>
      <div className={styles.cardActions}>
        {onMessage && (
          <button
            className={styles.btnGhost}
            onClick={() => onMessage(booking.customer)}
          >
            Message
          </button>
        )}
      </div>
    </div>
  );
}

function StarsDisplay({ rating, large }) {
  return (
    <span
      className={`${styles.starsDisplay} ${large ? styles.starsDisplayLarge : ''}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
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
