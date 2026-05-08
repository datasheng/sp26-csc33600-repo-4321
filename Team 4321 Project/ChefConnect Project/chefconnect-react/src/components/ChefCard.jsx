import { useNavigate } from 'react-router-dom';
import styles from './ChefCard.module.css';

/**
 * ChefCard
 */
export default function ChefCard({ chef }) {
  const navigate = useNavigate();

  return (
    <div className={styles.card} onClick={() => navigate(`/chef/${chef.id}`)}>
      <div className={styles.imgBox}>
        <span className={styles.emoji}>{chef.emoji}</span>
        {chef.badge && <span className={styles.badge}>{chef.badge}</span>}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{chef.name}</h3>
        <p className={styles.meta}>{chef.location} · {chef.experience} yrs experience</p>

        <div className={styles.tags}>
          {chef.tags.map(tag => (
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
