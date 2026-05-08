import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BookingWidget.module.css';

const HOURLY_RATE   = 85;
const COMMISSION    = 0.15;
const BOOKING_FEE   = 3;


export default function BookingWidget({ chefName }) {
  const navigate = useNavigate();
  const [hours, setHours] = useState(2);

  const subtotal    = HOURLY_RATE * hours;
  const commission  = +(subtotal * COMMISSION).toFixed(2);
  const total       = +(subtotal + commission + BOOKING_FEE).toFixed(2);

  function handleBook(e) {
    e.preventDefault();
    navigate('/dashboard');
  }

  return (
    <aside className={styles.card}>
      <h3 className={styles.title}>Book {chefName}</h3>

      <form onSubmit={handleBook}>
        <div className={styles.group}>
          <label>Service Type</label>
          <select>
            <option>Cuisine Chef — I bring all ingredients</option>
            <option>Pantry Chef — use my ingredients</option>
          </select>
        </div>

        <div className={styles.group}>
          <label>Date &amp; Time</label>
          <input type="datetime-local" required />
        </div>

        <div className={styles.group}>
          <label>Duration (hours)</label>
          <select value={hours} onChange={e => setHours(Number(e.target.value))}>
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
            <option value={4}>4 hours</option>
          </select>
        </div>

        <div className={styles.group}>
          <label>Your Address</label>
          <input type="text" placeholder="123 Main St, Brooklyn NY" required />
        </div>

        <div className={styles.group}>
          <label>Special Request</label>
          <textarea placeholder="Dietary restrictions, dishes you'd like, pantry notes…" />
        </div>

        <div className={styles.breakdown}>
          <div className={styles.row}>
            <span>{hours} hrs × ${HOURLY_RATE}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.row}>
            <span>Platform commission (15%)</span>
            <span>${commission.toFixed(2)}</span>
          </div>
          <div className={styles.row}>
            <span>Booking fee</span>
            <span>${BOOKING_FEE.toFixed(2)}</span>
          </div>
          <div className={`${styles.row} ${styles.total}`}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button type="submit" className={styles.bookBtn}>
          Confirm Booking →
        </button>
      </form>
    </aside>
  );
}
