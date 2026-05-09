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
  // dt is a "datetime-local" string like "2026-05-12T18:30"
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatTime(dt) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
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

  function handleBook(e) {
    e.preventDefault();
    setError('');

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    /* Backend stub. When the API is ready, POST to /api/bookings here.
     * For now we forward all the data to the confirmation page. */
    const booking = {
      referenceId:    makeReferenceId(),
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

        <button type="submit" className={styles.bookBtn}>
          Confirm Booking →
        </button>
      </form>
    </aside>
  );
}
