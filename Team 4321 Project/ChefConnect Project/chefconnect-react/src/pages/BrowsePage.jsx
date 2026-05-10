import { useEffect, useState, useCallback } from 'react';
import ChefCard from '../components/ChefCard';
import { fetchChefs } from '../data/chefs';
import styles from './BrowsePage.module.css';

const CUISINES = [
  'All', 'Caribbean', 'West African', 'Japanese', 'Italian', 'Indian',
  'Latin American', 'Mexican', 'Korean', 'Middle Eastern',
];

export default function BrowsePage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery]               = useState('');
  const [serviceType, setServiceType]   = useState('Cuisine Chef');

  const [chefs, setChefs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const loadChefs = useCallback(() => {
    setLoading(true);
    setError('');

    fetchChefs()
      .then(setChefs)
      .catch(() => setError('Could not load chefs. Make sure the backend is running at http://localhost:8000.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadChefs();
  }, [loadChefs]);

  const filtered = chefs.filter(chef => {
    const matchesCuisine = activeFilter === 'All' ||
      chef.tags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase()));
    const matchesQuery = query === '' ||
      chef.name.toLowerCase().includes(query.toLowerCase()) ||
      chef.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    return matchesCuisine && matchesQuery;
  });

  return (
    <main className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroTag}>Professional Cooking At Home</span>
          <h1 className={styles.heroHeading}>
            A private chef for <em>every table,</em> every culture.
          </h1>
          <p className={styles.heroCopy}>
            Book a certified local chef to cook your cultural favourites right in your kitchen
            — or let them work with what you have.
          </p>

          <div className={styles.searchBar}>
            <select value={serviceType} onChange={e => setServiceType(e.target.value)}>
              <option>Cuisine Chef</option>
              <option>Pantry Chef</option>
            </select>
            <input
              type="text"
              placeholder="Search by cuisine, dish, or neighbourhood…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button>Search</button>
          </div>
        </div>
      </section>

      {/* Browse Body */}
      <section className={styles.body}>
        <p className={styles.sectionLabel}>Filter by cuisine</p>

        <div className={styles.filters}>
          {CUISINES.map(c => (
            <button
              key={c}
              className={`${styles.chip} ${activeFilter === c ? styles.chipActive : ''}`}
              onClick={() => setActiveFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <div className={styles.spinner} aria-hidden="true" />
            <p>Loading chefs…</p>
          </div>
        ) : error ? (
          <div className={styles.stateBox}>
            <h3 className={styles.errorTitle}>Could not load chefs</h3>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={loadChefs}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>No chefs match your search. Try a different filter.</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map(chef => <ChefCard key={chef.id} chef={chef} />)}
          </div>
        )}
      </section>
    </main>
  );
}
