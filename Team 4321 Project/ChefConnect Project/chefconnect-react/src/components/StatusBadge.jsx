import styles from './StatusBadge.module.css';

const STATUS_MAP = {
  confirmed:  'confirmed',
  completed:  'completed',
  pending:    'pending',
  cancelled:  'cancelled',
};

/**
 * StatusBadge
 */
export default function StatusBadge({ status }) {
  const key = STATUS_MAP[status?.toLowerCase()] ?? 'pending';

  const labels = {
    confirmed: 'Confirmed',
    completed: 'Completed',
    pending:   'Pending Review',
    cancelled: 'Cancelled',
  };

  return (
    <span className={`${styles.badge} ${styles[key]}`}>
      {labels[key]}
    </span>
  );
}
