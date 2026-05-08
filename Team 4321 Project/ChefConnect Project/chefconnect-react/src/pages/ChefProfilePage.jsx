import BookingWidget from '../components/BookingWidget';
import styles from './ChefProfilePage.module.css';

/*  Fake data */
const CHEF = {
  id: 1,
  emoji: '👩🏾‍🍳',
  name: 'Anika Osei',
  subtitle: 'West African & Caribbean · Brooklyn, NY · Cuisine Chef & Pantry Chef',
  rating: 4.9,
  reviewCount: 48,
  bookingCount: 124,
  experience: 3,
  bio: 'I grew up cooking West African and Caribbean food with my grandmother. I specialise in Jollof, Egusi soup, Ackee & Saltfish, Oxtail, and can work with whatever ingredients you already have at home. Let me bring the flavours of home to your table.',
  dishes: ['Jollof Rice', 'Egusi Soup', 'Ackee & Saltfish', 'Oxtail Stew', 'Suya Skewers', 'Puff Puff'],
  availability: [
    { day: 'Mon', hours: null },
    { day: 'Tue', hours: '4–9pm' },
    { day: 'Wed', hours: '4–9pm' },
    { day: 'Thu', hours: null },
    { day: 'Fri', hours: '3–10pm' },
    { day: 'Sat', hours: 'All day' },
    { day: 'Sun', hours: '12–7pm' },
  ],
  reviews: [
    { id: 1, user: 'Marcus T.',  rating: 5, comment: 'Anika made the best Jollof I\'ve ever had outside of Lagos. She came in, checked my pantry, and worked with what I had. Absolutely amazing experience for my family dinner.' },
    { id: 2, user: 'Sandra K.',  rating: 5, comment: 'We requested a full Caribbean spread for 8 people — oxtail, rice & peas, plantains — everything was perfect. Anika was professional, clean, and so warm with our guests.' },
    { id: 3, user: 'Jamal F.',   rating: 4, comment: 'Great pantry chef experience. Told her what I had and she made something completely different than I expected — in the best way. Will book again.' },
  ],
};

function Stars({ rating }) {
  return (
    <span className={styles.stars}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    </span>
  );
}

export default function ChefProfilePage() {
  // In production: const { id } = useParams(); then fetch /api/chefs/${id}

  return (
    <main className={styles.page}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.avatar}>{CHEF.emoji}</div>
        <div className={styles.info}>
          <h1 className={styles.name}>{CHEF.name}</h1>
          <p className={styles.subtitle}>{CHEF.subtitle}</p>

          <div className={styles.stats}>
            <div className={styles.stat}><strong>{CHEF.rating}</strong><small>Rating</small></div>
            <div className={styles.stat}><strong>{CHEF.reviewCount}</strong><small>Reviews</small></div>
            <div className={styles.stat}><strong>{CHEF.bookingCount}</strong><small>Bookings</small></div>
            <div className={styles.stat}><strong>{CHEF.experience} yrs</strong><small>Experience</small></div>
          </div>

          <p className={styles.bio}>{CHEF.bio}</p>
        </div>
      </header>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.left}>

          {/* Availability */}
          <section className={styles.section}>
            <h2>Availability</h2>
            <div className={styles.availGrid}>
              {CHEF.availability.map(a => (
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
            <div className={styles.dishes}>
              {CHEF.dishes.map(d => (
                <span key={d} className={styles.dish}>{d}</span>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className={styles.section}>
            <h2>Reviews</h2>
            <div className={styles.reviews}>
              {CHEF.reviews.map(r => (
                <div key={r.id} className={styles.reviewCard}>
                  <div className={styles.reviewTop}>
                    <span className={styles.reviewer}>{r.user}</span>
                    <Stars rating={r.rating} />
                  </div>
                  <p className={styles.reviewText}>{r.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Booking Widget */}
        <BookingWidget chefName={CHEF.name} />
      </div>
    </main>
  );
}
