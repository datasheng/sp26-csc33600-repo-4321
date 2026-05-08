import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './BookingConfirmationPage.module.css';

/**
 * BookingConfirmationPage
 * --------------------------------------------------------------
 * Reached from the BookingWidget after a successful submit.
 * Reads booking details from `location.state.booking`.
 *
 * If state is missing (user navigated here directly), redirect
 * to the dashboard.
 */
export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const booking   = state?.booking;

  useEffect(() => {
    if (!booking) navigate('/dashboard', { replace: true });
  }, [booking, navigate]);

  if (!booking) return null;

  const {
    chefEmoji,
    chefName,
    chefId,
    serviceType,
    date,
    time,
    hours,
    address,
    specialRequest,
    rate,
    subtotal,
    commission,
    bookingFee,
    total,
    referenceId,
  } = booking;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>

        {/* Top eyebrow */}
        <span className={styles.eyebrow}>Booking confirmed</span>

        {/* Big terracotta check */}
        <div className={styles.checkCircle} aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className={styles.heading}>
          Your booking with <em>{chefName}</em> is confirmed.
        </h1>
        <p className={styles.sub}>
          A confirmation email is on its way. Your chef will reach out
          before the date to coordinate the menu.
        </p>

        {/* Receipt card */}
        <div className={styles.receipt}>
          <div className={styles.receiptHeader}>
            <div className={styles.chefLine}>
              <span className={styles.chefEmoji}>{chefEmoji}</span>
              <div>
                <strong>{chefName}</strong>
                <small>Reference #{referenceId}</small>
              </div>
            </div>
            <span className={styles.statusPill}>Confirmed</span>
          </div>

          <div className={styles.divider} />

          <dl className={styles.details}>
            <div className={styles.detailRow}>
              <dt>Date</dt>
              <dd>{date}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>Time</dt>
              <dd>{time}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>Service</dt>
              <dd>{serviceType}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>Duration</dt>
              <dd>{hours} hours</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>Address</dt>
              <dd>{address}</dd>
            </div>
            {specialRequest && (
              <div className={styles.detailRow}>
                <dt>Notes</dt>
                <dd className={styles.notes}>{specialRequest}</dd>
              </div>
            )}
          </dl>

          <div className={styles.divider} />

          <div className={styles.priceBlock}>
            <div className={styles.priceRow}>
              <span>{hours} hrs × ${rate}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.priceRow}>
              <span>Platform commission</span>
              <span>${commission.toFixed(2)}</span>
            </div>
            <div className={styles.priceRow}>
              <span>Booking fee</span>
              <span>${bookingFee.toFixed(2)}</span>
            </div>
            <div className={`${styles.priceRow} ${styles.priceTotal}`}>
              <span>Total charged</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate('/dashboard')}
          >
            Go to my dashboard →
          </button>
          <Link to={`/chef/${chefId}`} className={styles.ghostBtn}>
            Back to chef profile
          </Link>
        </div>

        <p className={styles.fineprint}>
          Need to change something? You can cancel free up to 24 hours
          before your booking from your dashboard.
        </p>
      </div>
    </main>
  );
}
