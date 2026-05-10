import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookingWidget from '../components/BookingWidget';
import { fetchChefById } from '../data/chefs';
import styles from './ChefProfilePage.module.css';

function Stars({ rating }) {
  return (
    <span className={styles.stars}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    </span>
  );
}

export default function ChefProfilePage() {
  const { id } = useParams();

  const [chef, setChef]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setChef(null);

    fetchChefById(id)
      .then(setChef)
      .catch(err => setError(err.message ?? 'Could not load chef profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Loading state ─────────────────────────────────────── */
  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.statePanel}>
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.stateText}>Loading chef profile…</p>
        </div>
      </main>
    );
  }

  /* ── Error / not-found state ───────────────────────────── */
  if (error || !chef) {
    return (
      <main className={styles.page}>
        <div className={styles.statePanel}>
          <h2 className={styles.stateTitle}>{error || 'Chef not found'}</h2>
          <p className={styles.stateText}>
            The chef you're looking for may have moved or is no longer
            taking bookings.
          </p>
          <Link to="/" className={styles.stateBtn}>
            ← Back to browse
          </Link>
        </div>
      </main>
    );
  }

  /* ── Loaded ────────────────────────────────────────────── */
  return (
    <main className={styles.page}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.avatar}>{chef.emoji}</div>
        <div className={styles.info}>
          <h1 className={styles.name}>{chef.name}</h1>
          <p className={styles.subtitle}>{chef.subtitle}</p>

          <div className={styles.stats}>
            <div className={styles.stat}><strong>{chef.rating}</strong><small>Rating</small></div>
            <div className={styles.stat}><strong>{chef.reviewCount}</strong><small>Reviews</small></div>
            <div className={styles.stat}><strong>{chef.bookingCount}</strong><small>Bookings</small></div>
            <div className={styles.stat}><strong>{chef.experience} yrs</strong><small>Experience</small></div>
          </div>

          <p className={styles.bio}>{chef.bio}</p>
        </div>
      </header>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.left}>

          {/* Availability */}
          <section className={styles.section}>
            <h2>Availability</h2>
            <div className={styles.availGrid}>
              {chef.availability.map(a => (
                <div key={a.day} className={`${styles.dayBox} ${a.hours ? styles.open : ''}`}>
                  <span className={styles.dayName}>{a.day}</span>
                  <span className={styles.dayHours}>{a.hours ?? '—'}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Signature Dishes */}
          <section className={styles.section}>
            <h2>Signature Dishes</h2>
            {chef.dishes.length === 0 ? (
              <p className={styles.emptyText}>No dishes listed yet.</p>
            ) : (
              <div className={styles.dishes}>
                {chef.dishes.map(d => (
                  <span key={d} className={styles.dish}>{d}</span>
                ))}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section className={styles.section}>
            <h2>Reviews</h2>
            {chef.reviews.length === 0 ? (
              <p className={styles.emptyText}>No reviews yet — be the first to book!</p>
            ) : (
              <div className={styles.reviews}>
                {chef.reviews.map(r => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewTop}>
                      <span className={styles.reviewer}>{r.user}</span>
                      <Stars rating={r.rating} />
                    </div>
                    <p className={styles.reviewText}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Booking Widget */}
        <BookingWidget chef={chef} />
      </div>
    </main>
  );
}
