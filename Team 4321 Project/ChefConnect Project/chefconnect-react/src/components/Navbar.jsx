import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { pathname } = useLocation();

  // Treat any /chef/:id path as the "Browse" tab being active —
  // we no longer surface a static "/chef/1" link in the nav.
  const isBrowse    = pathname === '/' || pathname.startsWith('/chef');
  const isDashboard = pathname === '/dashboard';
  const isChefReg   = pathname === '/register';

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        Chef<span>Connect</span>
      </Link>

      <div className={styles.links}>
        <Link to="/"          className={isBrowse    ? styles.active : ''}>Browse Chefs</Link>
        <Link to="/dashboard" className={isDashboard ? styles.active : ''}>My Dashboard</Link>
        <Link to="/register"  className={isChefReg   ? styles.active : ''}>Become a Chef</Link>
      </div>

      <div className={styles.right}>
        <Link to="/login"><button className="btn-ghost">Log In</button></Link>
        <Link to="/signup"><button className="btn-primary">Sign Up</button></Link>
      </div>
    </nav>
  );
}
