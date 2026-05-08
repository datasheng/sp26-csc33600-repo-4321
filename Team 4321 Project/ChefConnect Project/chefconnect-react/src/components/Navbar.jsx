import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        Chef<span>Connect</span>
      </Link>

      <div className={styles.links}>
        <Link to="/"          className={pathname === '/'          ? styles.active : ''}>Browse Chefs</Link>
        <Link to="/chef/1"    className={pathname.startsWith('/chef') ? styles.active : ''}>Chef Profile</Link>
        <Link to="/dashboard" className={pathname === '/dashboard'  ? styles.active : ''}>My Dashboard</Link>
        <Link to="/register"  className={pathname === '/register'   ? styles.active : ''}>Become a Chef</Link>
      </div>

      <div className={styles.right}>
        <Link to="/login"><button className="btn-ghost">Log In</button></Link>
        <Link to="/register"><button className="btn-primary">Sign Up</button></Link>
      </div>
    </nav>
  );
}
