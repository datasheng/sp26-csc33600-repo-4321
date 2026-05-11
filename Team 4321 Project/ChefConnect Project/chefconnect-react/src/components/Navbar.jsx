import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { user, isChef, logout } = useAuth();

  // User menu (signed in state)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when route changes or when clicking outside
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    function onClickAway(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, [menuOpen]);

  // Active-link helpers
  const isBrowse    = pathname === '/' || pathname.startsWith('/chef/');
  const isDashboard = pathname === '/dashboard' || pathname === '/chef-dashboard';
  const isChefReg   = pathname === '/register';

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        Chef<span>Connect</span>
      </Link>

      <div className={styles.links}>
        <Link to="/" className={isBrowse ? styles.active : ''}>
          Browse Chefs
        </Link>

        {/* Dashboard link adapts to role */}
        <Link to="/dashboard" className={isDashboard ? styles.active : ''}>
          {isChef ? 'Chef Dashboard' : 'My Dashboard'}
        </Link>

        {/* "Become a Chef" only makes sense for visitors and customers */}
        {!isChef && (
          <Link to="/register" className={isChefReg ? styles.active : ''}>
            Become a Chef
          </Link>
        )}
      </div>

      <div className={styles.right}>
        {user ? (
          /* Signed-in: avatar + menu */
          <div className={styles.userMenu} ref={menuRef}>
            <button
              className={styles.userBtn}
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <span className={styles.userAvatar}>
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
              <span className={styles.userName}>{user.name || user.email}</span>
              <span className={styles.userCaret} aria-hidden="true">▾</span>
            </button>

            {menuOpen && (
              <div className={styles.dropdown} role="menu">
                <div className={styles.dropdownHeader}>
                  <strong>{user.name || user.email}</strong>
                  <small>{isChef ? 'Chef Account' : 'Customer Account'}</small>
                </div>
                <Link to="/dashboard" className={styles.dropdownItem} role="menuitem">
                  {isChef ? 'Chef Dashboard' : 'My Dashboard'}
                </Link>
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                  onClick={handleLogout}
                  role="menuitem"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Signed-out: log in / sign up */
          <>
            <Link to="/login"><button className="btn-ghost">Log In</button></Link>
            <Link to="/signup"><button className="btn-primary">Sign Up</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}
