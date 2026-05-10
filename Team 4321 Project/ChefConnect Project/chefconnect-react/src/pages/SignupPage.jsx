import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    if (!form.username.trim())          return 'Please enter a username.';
    if (form.username.trim().length < 2) return 'Username must be at least 2 characters.';
    if (!form.email.trim())             return 'Please enter your email.';
    if (!EMAIL_RE.test(form.email))     return 'Please enter a valid email address.';
    if (!form.password)                 return 'Please choose a password.';
    if (form.password.length < 6)       return 'Password must be at least 6 characters.';
    if (!form.confirmPassword)          return 'Please confirm your password.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
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
        `http://localhost:8000/register?username=${encodeURIComponent(form.username)}&email=${encodeURIComponent(form.email)}&password_hash=${encodeURIComponent(form.password)}&role=customer`,
        { method: 'POST' }
      );

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || 'Sign up failed. That username or email may already be in use.');
        return;
      }

      const data = await res.json();
      localStorage.setItem('user_id',  data.user_id);
      localStorage.setItem('username', form.username);
      localStorage.setItem('email',    form.email);
      localStorage.setItem('role',     'customer');
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
            Your kitchen.<br />
            Their craft.<br />
            <em>Your table.</em>
          </p>
          <span className={styles.quoteAuthor}>— Welcome to ChefConnect</span>
        </div>
        <ul className={styles.benefits}>
          <li><span>✓</span> Book certified local chefs in minutes</li>
          <li><span>✓</span> Save the chefs you love for next time</li>
          <li><span>✓</span> Cancel free up to 24 hours in advance</li>
        </ul>
      </aside>

      {/* Form panel */}
      <section className={styles.formPanel}>
        <div className={styles.formInner}>
          <h1 className={styles.heading}>Create your account</h1>
          <p className={styles.sub}>
            Already have an account?{' '}
            <Link to="/login" className={styles.inlineLink}>Log in</Link>
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
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="e.g. marcus_t"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div className={styles.group}>
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className={styles.group}>
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className={styles.group}>
              <label htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className={styles.submit}
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className={styles.legalNote}>
            By signing up you agree to our Terms and Privacy Policy.
            Looking to cook for others?{' '}
            <Link to="/register" className={styles.inlineLink}>Become a chef</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
