import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BookingWidget.module.css';

const COMMISSION  = 0.15;
const BOOKING_FEE = 3;

const SERVICE_OPTIONS = [
  'Cuisine Chef — I bring all ingredients',
  'Pantry Chef — use my ingredients',
];

function formatDate(dt) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatTime(dt) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function makeReferenceId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function BookingWidget({ chef }) {
  const navigate = useNavigate();

  const [serviceType, setServiceType]       = useState(SERVICE_OPTIONS[0]);
  const [dateTime, setDateTime]             = useState('');
  const [hours, setHours]                   = useState(2);
  const [address, setAddress]               = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);

  const rate       = chef?.price ?? 85;
  const subtotal   = rate * hours;
  const commission = +(subtotal * COMMISSION).toFixed(2);
  const total      = +(subtotal + commission + BOOKING_FEE).toFixed(2);

  function validate() {
    if (!dateTime)        return 'Please pick a date and time.';
    const picked = new Date(dateTime);
    if (Number.isNaN(picked.getTime())) return 'Please pick a valid date and time.';
    if (picked.getTime() < Date.now())  return 'Please pick a date in the future.';
    if (!address.trim())  return 'Please enter your address.';
    if (address.trim().length < 5) return 'Please enter a complete address.';
    return '';
  }

 async function handleBook(e) {
  e.preventDefault();
  setError('');

  const msg = validate();
  if (msg) { setError(msg); return; }

  // Get logged in user
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    setError('You must be logged in to book a chef.');
    return;
  }

  const bookingDate = dateTime.split('T')[0];        
  const bookingTime = dateTime.split('T')[1] + ':00'; // "18:30:00"

  try {
    const res = await fetch(
      `http://localhost:8000/bookings?chef_id=${chef.id}&user_id=${user.user_id}&booking_date=${bookingDate}&booking_time=${bookingTime}&customer_requests=${encodeURIComponent(specialRequest.trim())}`,
      { method: 'POST' }
    );

    if (!res.ok) {
      const err = await res.json();
      setError(err.detail || 'Booking failed. That slot may already be taken.');
      return;
    }

    const data = await res.json();

    const booking = {
      referenceId:    data.booking_id,
      chefId:         chef.id,
      chefName:       chef.name,
      chefEmoji:      chef.emoji,
      serviceType,
      date:           formatDate(dateTime),
      time:           formatTime(dateTime),
      hours,
      address:        address.trim(),
      specialRequest: specialRequest.trim(),
      rate,
      subtotal,
      commission,
      bookingFee:     BOOKING_FEE,
      total,
    };

    navigate('/booking/confirmation', { state: { booking } });

  } catch {
    setError('Could not connect to server. Is the backend running?');
  }
}
  return (
    <aside className={styles.card}>
      <h3 className={styles.title}>Book {chef?.name ?? 'this chef'}</h3>
      <p className={styles.priceLine}>From <strong>${rate}</strong>/hr</p>

      {error && (
        <div role="alert" className={styles.errorBox}>
          {error}
        </div>
      )}

      <form onSubmit={handleBook} noValidate>
        <div className={styles.group}>
          <label htmlFor="bw-service">Service Type</label>
          <select
            id="bw-service"
            value={serviceType}
            onChange={e => setServiceType(e.target.value)}
          >
            {SERVICE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div className={styles.group}>
          <label htmlFor="bw-datetime">Date &amp; Time</label>
          <input
            id="bw-datetime"
            type="datetime-local"
            value={dateTime}
            onChange={e => setDateTime(e.target.value)}
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="bw-hours">Duration (hours)</label>
          <select
            id="bw-hours"
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
          >
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
            <option value={4}>4 hours</option>
            <option value={5}>5 hours</option>
          </select>
        </div>

        <div className={styles.group}>
          <label htmlFor="bw-address">Your Address</label>
          <input
            id="bw-address"
            type="text"
            placeholder="123 Main St, Brooklyn NY"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="bw-notes">Special Request</label>
          <textarea
            id="bw-notes"
            placeholder="Dietary restrictions, dishes you'd like, pantry notes…"
            value={specialRequest}
            onChange={e => setSpecialRequest(e.target.value)}
          />
        </div>

        <div className={styles.breakdown}>
          <div className={styles.row}>
            <span>{hours} hrs × ${rate}</span>
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

        <button type="submit" className={styles.bookBtn} disabled={loading}>
          {loading ? 'Booking…' : 'Confirm Booking →'}
        </button>
      </form>
    </aside>
  );
}
