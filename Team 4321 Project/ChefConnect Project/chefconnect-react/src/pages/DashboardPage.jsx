import { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import styles from './DashboardPage.module.css';

/*  Fake data  */
const USER = { name: 'David M.', initials: 'DM' };

const STATS = [
  { label: 'Total Bookings', value: '7',      sub: '↑ 2 this month' },
  { label: 'Total Spent',    value: '$1,240',  sub: '↑ $198.50 pending' },
  { label: 'Reviews Left',   value: '5',       sub: '2 awaiting review' },
  { label: 'Saved Chefs',    value: '3',       sub: '' },
];

const BOOKINGS = [
  { id: 1, emoji: '👩🏾‍🍳', chef: 'Anika Osei',    cuisine: 'West African', date: 'May 10, 2026', amount: '$198.50', status: 'confirmed' },
  { id: 2, emoji: '👨🏻‍🍳', chef: 'Marco Ferretti', cuisine: 'Italian',      date: 'Apr 28, 2026', amount: '$246.00', status: 'completed' },
  { id: 3, emoji: '👩🏽‍🍳', chef: 'Priya Nair',     cuisine: 'Indian',       date: 'Apr 15, 2026', amount: '$156.00', status: 'completed' },
  { id: 4, emoji: '👨🏿‍🍳', chef: 'Kwame Asante',  cuisine: 'Ghanaian',     date: 'Mar 30, 2026', amount: '$178.50', status: 'pending'   },
];

const NAV_ITEMS = [
  { icon: '🏠', label: 'Dashboard' },
  { icon: '📅', label: 'My Bookings' },
  { icon: '🧑‍🍳', label: 'Saved Chefs' },
  { icon: '🥘', label: 'Pantry Profile' },
  { icon: '⭐', label: 'My Reviews' },
  { icon: '💳', label: 'Payments' },
  { icon: '⚙️', label: 'Settings' },
];

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('Dashboard');

  return (
    <main className={styles.page}>
      {/*  Sidebar  */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>{USER.initials}</div>
          <strong>{USER.name}</strong>
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
              {item.label === 'Dashboard' && <span className={styles.dot} />}
            </button>
          ))}
        </nav>
      </aside>

      {/*  Main  */}
      <div className={styles.main}>
        <div className={styles.greeting}>
          <h1>Good evening, {USER.name.split(' ')[0]} 👋</h1>
          <p>Here's a summary of your ChefConnect activity.</p>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {STATS.map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue}>{s.value}</span>
              {s.sub && <span className={styles.statSub}>{s.sub}</span>}
            </div>
          ))}
        </div>

        {/* Bookings table */}
        <p className={styles.tableLabel}>Recent bookings</p>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.tableHead}`}>
            <div className={styles.colChef}>Chef</div>
            <div className={styles.colDate}>Date</div>
            <div className={styles.colAmount}>Amount</div>
            <div className={styles.colStatus}>Status</div>
          </div>
          {BOOKINGS.map(b => (
            <div key={b.id} className={styles.row}>
              <div className={styles.colChef}>
                <div className={styles.miniAvatar}>{b.emoji}</div>
                <div>
                  <strong>{b.chef}</strong>
                  <small>{b.cuisine}</small>
                </div>
              </div>
              <div className={styles.colDate}>{b.date}</div>
              <div className={styles.colAmount}>{b.amount}</div>
              <div className={styles.colStatus}>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
