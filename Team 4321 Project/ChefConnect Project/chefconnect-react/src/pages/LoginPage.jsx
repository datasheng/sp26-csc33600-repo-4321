import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  function validate() {
    if (!email.trim())         return 'Please enter your email.';
    if (!EMAIL_RE.test(email)) return 'Please enter a valid email address.';
    if (!password)             return 'Please enter your password.';
    if (password.length < 6)   return 'Password must be at least 6 characters.';
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    /* ── Backend stub ──────────────────────────────────────────
     * Replace with real fetch when API is ready, e.g.:
     *
     *   const res = await fetch('/api/auth/login', {...});
     *   if (!res.ok) setError('Invalid email or password.');
     *   else navigate('/dashboard');
     * ──────────────────────────────────────────────────────── */
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  }

  return (
    <main className={styles.page}>
      {/* Brand panel — dark, warm, editorial */}
      <aside className={styles.brandPanel}>
        <Link to="/" className={styles.brandLogo}>
          Chef<span>Connect</span>
        </Link>

        <div className={styles.brandQuote}>
          <p className={styles.quoteText}>
            “The kitchen is where I find my grandmother again.”
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
            Don’t have an account?{' '}
            <Link to="/signup" className={styles.inlineLink}>Sign up</Link>
          </p>

          {/* Error region — always rendered for screen-readers */}
          <div
            role="alert"
            aria-live="polite"
            className={`${styles.errorBox} ${error ? styles.errorVisible : ''}`}
          >
            {error}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.group}>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
