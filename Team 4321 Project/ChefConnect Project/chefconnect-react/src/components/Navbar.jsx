import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar({ user, onLogout }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isBrowse    = pathname === '/' || pathname.startsWith('/chef');
  const isDashboard = pathname === '/dashboard';
  const isChefReg   = pathname === '/register';

  function handleLogout() {
    onLogout();
    navigate('/');
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        Chef<span>Connect</span>
      </Link>

      <div className={styles.links}>
        <Link to="/"          className={isBrowse    ? styles.active : ''}>Browse Chefs</Link>
        <Link to="/dashboard" className={isDashboard ? styles.active : ''}>My Dashboard</Link>
        {user && user.role !== 'Chef' && <Link to="/register" className={isChefReg ? styles.active : ''}>Become a Chef</Link>}
      </div>

      <div className={styles.right}>
        {user ? (
          <>
            <span>Hi, {user.username}</span>
            <button className="btn-ghost" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login"><button className="btn-ghost">Log In</button></Link>
            <Link to="/signup"><button className="btn-primary">Sign Up</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}