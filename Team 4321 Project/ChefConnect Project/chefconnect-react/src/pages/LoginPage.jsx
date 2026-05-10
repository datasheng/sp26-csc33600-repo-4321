import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  function validate() {
    if (!username.trim()) return 'Please enter your username.';
    if (!password)        return 'Please enter your password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const msg = validate();
    if (msg) { setError(msg); return; }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
        { method: 'POST' }
      );

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || 'Invalid username or password.');
        return;
      }

      const data = await res.json();
      localStorage.setItem('user_id',  data.user_id);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email',    data.email ?? '');
      localStorage.setItem('role',     data.role ?? 'customer');
      navigate('/dashboard');

    } catch (err) {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      {/* Brand panel */}
      <aside className={styles.brandPanel}>
        <Link to="/" className={styles.brandLogo}>
          Chef<span>Connect</span>
        </Link>
        <div className={styles.brandQuote}>
          <p className={styles.quoteText}>
            "The kitchen is where I find my grandmother again."
          </p>
          <span className={styles.quoteAuthor}>— Anika, ChefConnect chef</span>
        </div>
        <p className={styles.brandFoot}>
          Sign in to manage your bookings, save favourite chefs, and
          get back to the table.
        </p>
      </aside>

      {/* Form panel */}
      <section className={styles.formPanel}>
        <div className={styles.formInner}>
          <h1 className={styles.heading}>Welcome back</h1>
          <p className={styles.sub}>
            Don't have an account?{' '}
            <Link to="/signup" className={styles.inlineLink}>Sign up</Link>
          </p>

          <div
            role="alert"
            aria-live="polite"
            className={`${styles.errorBox} ${error ? styles.errorVisible : ''}`}
          >
            {error}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.group}>
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                placeholder="your_username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div className={styles.group}>
              <div className={styles.labelRow}>
                <label htmlFor="login-password">Password</label>
                <a href="#" className={styles.forgotLink}>Forgot?</a>
              </div>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={styles.submit}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <p className={styles.legalNote}>
            By logging in you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}