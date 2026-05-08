import { useState } from 'react';
import ChefCard from '../components/ChefCard';
import styles from './BrowsePage.module.css';

//  Fajke data 
const ALL_CHEFS = [
  { id: 1, emoji: '👩🏾‍🍳', name: 'Anika Osei',    location: 'Brooklyn, NY',   experience: 3,  tags: ['West African','Caribbean','Pantry Chef'], rating: 4.9, reviewCount: 48, price: 85,  badge: 'Premium' },
  { id: 2, emoji: '👨🏻‍🍳', name: 'Marco Ferretti', location: 'Manhattan, NY',  experience: 7,  tags: ['Italian','Mediterranean'],                 rating: 4.8, reviewCount: 91, price: 110 },
  { id: 3, emoji: '👩🏽‍🍳', name: 'Priya Nair',     location: 'Queens, NY',     experience: 2,  tags: ['Indian','South Asian','Vegan'],             rating: 4.7, reviewCount: 22, price: 70,  badge: 'New' },
  { id: 4, emoji: '👨🏿‍🍳', name: 'Kwame Asante',  location: 'Bronx, NY',      experience: 5,  tags: ['Ghanaian','Jollof Specialist'],             rating: 5.0, reviewCount: 17, price: 90  },
  { id: 5, emoji: '👩🏻‍🍳', name: 'Yuki Tanaka',   location: 'Manhattan, NY',  experience: 10, tags: ['Japanese','Omakase','Sushi'],               rating: 4.9, reviewCount: 63, price: 150 },
  { id: 6, emoji: '👨🏽‍🍳', name: 'Diego Vargas',  location: 'Queens, NY',     experience: 6,  tags: ['Mexican','Colombian','Pantry Chef'],        rating: 4.8, reviewCount: 39, price: 95,  badge: 'Premium' },
];

const CUISINES = ['All', 'Caribbean', 'West African', 'Japanese', 'Italian', 'Indian', 'Latin American', 'Middle Eastern', 'Korean'];

export default function BrowsePage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [serviceType, setServiceType] = useState('Cuisine Chef');

  const filtered = ALL_CHEFS.filter(chef => {
    const matchesCuisine = activeFilter === 'All' || chef.tags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase()));
    const matchesQuery   = query === '' || chef.name.toLowerCase().includes(query.toLowerCase()) || chef.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
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

        {filtered.length === 0 ? (
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
