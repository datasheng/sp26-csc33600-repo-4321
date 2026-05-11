import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [role, setRole]         = useState('customer'); // 'customer' | 'chef'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Gate-failure flags drive the CTA shown in the error box.
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [needsSignup,       setNeedsSignup]       = useState(false);

  // The signup wizard sends location.state.justSignedUp = { email },
  // and the chef wizard sends location.state.justRegistered = { email }.
  // Both pre-fill the form and show a green confirmation banner.
  const justRegistered = location.state?.justRegistered;
  const justSignedUp   = location.state?.justSignedUp;
  const [info, setInfo] = useState('');
  useEffect(() => {
    if (justRegistered) {
      setRole('chef');
      setEmail(justRegistered.email || '');
      setInfo('Chef profile created. Sign in to access your chef dashboard.');
    } else if (justSignedUp) {
      setRole('customer');
      setEmail(justSignedUp.email || '');
      setInfo('Account created. Sign in with the email and password you just chose.');
    } else {
      return;
    }
    // Clear the location state so refreshing the login page doesn't re-trigger
    window.history.replaceState({}, '', location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switching role tab should always reset gate-failure flags.
  function handleRoleChange(next) {
    setRole(next);
    setError('');
    setNeedsRegistration(false);
    setNeedsSignup(false);
  }

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
    setNeedsRegistration(false);
    setNeedsSignup(false);
    setInfo('');

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    /* ── Backend stub ──────────────────────────────────────────
     * When the API is ready:
     *
     *   const res  = await fetch('/api/auth/login', { ... });
     *   const data = await res.json();
     *   if (res.status === 404)      setError('Account not found. Please sign up first.'); setNeedsSignup(true);
     *   else if (res.status === 401) setError('Incorrect password.');
     *   else if (role === 'chef' && !data.hasChefProfile) {
     *     setError('Please complete the Become a Chef registration first.');
     *     setNeedsRegistration(true);
     *   } else { /* set session * / navigate('/dashboard'); }
     *
     * Until then the auth context owns the customer + chef registries
     * (localStorage-backed) and returns those error messages directly.
     * ──────────────────────────────────────────────────────── */
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const result = login({ email, password, role });
      if (!result.ok) {
        setError(result.error);
        setNeedsRegistration(Boolean(result.needsRegistration));
        setNeedsSignup(Boolean(result.needsSignup));
        return;
      }
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

          {/* Post-registration info — shown once after completing Become a Chef */}
          {info && (
            <div className={styles.infoBox} role="status">
              {info}
            </div>
          )}

          {/* Error region — always rendered for screen-readers */}
          <div
            role="alert"
            aria-live="polite"
            className={`${styles.errorBox} ${error ? styles.errorVisible : ''}`}
          >
            {error}
            {needsRegistration && (
              <Link to="/register" className={styles.errorAction}>
                Become a Chef →
              </Link>
            )}
            {needsSignup && (
              <Link to="/signup" className={styles.errorAction}>
                Sign up →
              </Link>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Role picker — until the API can tell us which kind of
                account this email belongs to, the user picks. */}
            <div className={styles.roleTabs} role="tablist" aria-label="Account type">
              <button
                type="button"
                role="tab"
                aria-selected={role === 'customer'}
                className={`${styles.roleTab} ${role === 'customer' ? styles.roleTabActive : ''}`}
                onClick={() => handleRoleChange('customer')}
              >
                I’m a Customer
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === 'chef'}
                className={`${styles.roleTab} ${role === 'chef' ? styles.roleTabActive : ''}`}
                onClick={() => handleRoleChange('chef')}
              >
                I’m a Chef
              </button>
            </div>

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
