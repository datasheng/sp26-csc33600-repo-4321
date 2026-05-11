import { useNavigate } from 'react-router-dom';
import styles from './ChefCard.module.css';

/**
 * ChefCard
 */
const SERVICE_TYPE_TAGS = new Set(['cuisine chef', 'pantry chef', 'both']);

function getServiceLabel(tags) {
  const hasCuisine = tags.some(t => t.toLowerCase() === 'cuisine chef');
  const hasPantry  = tags.some(t => t.toLowerCase() === 'pantry chef');
  const hasBoth    = tags.some(t => t.toLowerCase() === 'both');
  if (hasBoth || (hasCuisine && hasPantry)) return 'Cuisine & Pantry';
  if (hasCuisine) return 'Cuisine Chef';
  if (hasPantry)  return 'Pantry Chef';
  return null;
}

export default function ChefCard({ chef }) {
  const navigate = useNavigate();
  const cuisineTags  = chef.tags.filter(t => !SERVICE_TYPE_TAGS.has(t.toLowerCase()));
  const serviceLabel = getServiceLabel(chef.tags);

  return (
    <div className={styles.card} onClick={() => navigate(`/chef/${chef.id}`)}>
      <div className={styles.imgBox}>
        <span className={styles.emoji}>{chef.emoji}</span>
        {chef.badge && <span className={styles.badge}>{chef.badge}</span>}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{chef.name}</h3>
        <p className={styles.meta}>{chef.location} · {chef.experience} yrs experience</p>

        {serviceLabel && (
          <p className={styles.serviceType}>{serviceLabel}</p>
        )}

        <div className={styles.tags}>
          {cuisineTags.map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.rating}>
            ★ {chef.rating} <span>({chef.reviewCount} reviews)</span>
          </span>
          <span className={styles.price}>from ${chef.price}/hr</span>
        </div>
      </div>
    </div>
  );
}
