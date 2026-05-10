import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';

const STEPS = ['Account', 'Chef Profile', 'Availability', 'Membership'];

const CUISINES = [
  'West African', 'Caribbean', 'Italian', 'Japanese', 'Indian',
  'Mexican', 'Korean', 'Middle Eastern', 'Latin American', 'Chinese', 'Vegan / Plant-based',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCuisines, setSelectedCuisines] = useState(['West African']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1 — account fields
  const [account, setAccount] = useState({
    username: '', email: '', password: '', role: 'customer',
  });

  // Step 2+ — chef profile fields
  const [form, setForm] = useState({
    firstName: '', lastName: '', bio: '',
    serviceType: 'Both', experience: '', rate: '', location: '',
  });

  function toggleCuisine(c) {
    setSelectedCuisines(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  }

  function handleAccountChange(e) {
    setAccount(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Called when user clicks Continue on Step 1
  async function handleStep1Continue() {
    setError('');
    if (!account.username || !account.email || !account.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/register?username=${encodeURIComponent(account.username)}&email=${encodeURIComponent(account.email)}&password_hash=${encodeURIComponent(account.password)}&role=${account.role}`,
        { method: 'POST' }
      );

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || 'Registration failed. Username or email may already exist.');
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Save to localStorage so the rest of the app knows who's logged in
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('username', account.username);
      localStorage.setItem('email', account.email);
      localStorage.setItem('role', account.role);

      if (account.role === 'customer') {
        // Customers don't need the chef profile steps
        navigate('/dashboard');
      } else {
        // Chefs continue through the remaining steps
        setStep(2);
      }
    } catch (err) {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  // Called only when a chef finishes all steps
  async function handleFinalSubmit() {
    // At this point the User + Chef rows already exist from Step 1.
    // You can add additional chef profile API calls here if your backend supports them.
    navigate('/dashboard');
  }

  function handleContinue() {
    if (step < STEPS.length) {
      setStep(s => s + 1);
    } else {
      handleFinalSubmit();
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>
          {account.role === 'chef' ? 'Become a Chef' : 'Create an Account'}
        </h1>
        <p className={styles.sub}>
          {account.role === 'chef'
            ? 'Fill in your profile and start accepting bookings in your neighbourhood.'
            : 'Join ChefConnect to book personal chefs near you.'}
        </p>

        {/* Step indicator */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`${styles.step} ${i + 1 < step ? styles.done : ''} ${i + 1 === step ? styles.active : ''}`}
            >
              {i + 1} · {s}
            </div>
          ))}
        </div>

        <div className={styles.form}>

          {/* ── Step 1: Account ── */}
          {step === 1 && (
            <>
              <div className={styles.group}>
                <label>I want to…</label>
                <select name="role" value={account.role} onChange={handleAccountChange}>
                  <option value="customer">Book a chef (Customer)</option>
                  <option value="chef">Cook for others (Chef)</option>
                </select>
              </div>

              <div className={styles.group}>
                <label>Username</label>
                <input
                  name="username"
                  value={account.username}
                  onChange={handleAccountChange}
                  placeholder="e.g. marcus_t"
                  autoComplete="username"
                />
              </div>

              <div className={styles.group}>
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={account.email}
                  onChange={handleAccountChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className={styles.group}>
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  value={account.password}
                  onChange={handleAccountChange}
                  placeholder="Choose a password"
                  autoComplete="new-password"
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.actions}>
                <button
                  className="btn-primary"
                  onClick={handleStep1Continue}
                  disabled={loading}
                >
                  {loading
                    ? 'Creating account…'
                    : account.role === 'chef'
                      ? `Continue → ${STEPS[1]}`
                      : 'Create Account'}
                </button>
              </div>

              <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                Already have an account?{' '}
                <a href="/login" style={{ color: 'var(--color-primary, #c0392b)' }}>Log in</a>
              </p>
            </>
          )}

          {/* ── Step 2: Chef Profile ── */}
          {step === 2 && (
            <>
              <div className={styles.row}>
                <div className={styles.group}>
                  <label>First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Anika" />
                </div>
                <div className={styles.group}>
                  <label>Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Osei" />
                </div>
              </div>

              <div className={styles.group}>
                <label>Short Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell customers about your cooking background, specialties, and style…"
                />
              </div>

              <div className={styles.group}>
                <label>Specialty Cuisines</label>
                <div className={styles.cuisinePicker}>
                  {CUISINES.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.cuisineChip} ${selectedCuisines.includes(c) ? styles.cuisineSelected : ''}`}
                      onClick={() => toggleCuisine(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.group}>
                <label>Service Type</label>
                <select name="serviceType" value={form.serviceType} onChange={handleChange}>
                  <option value="cuisine">Cuisine Chef only (I bring ingredients)</option>
                  <option value="pantry">Pantry Chef only (use client's ingredients)</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.group}>
                  <label>Years of Experience</label>
                  <input name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="3" />
                </div>
                <div className={styles.group}>
                  <label>Hourly Rate ($)</label>
                  <input name="rate" type="number" value={form.rate} onChange={handleChange} placeholder="85" />
                </div>
              </div>

              <div className={styles.group}>
                <label>Service Area</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="Brooklyn, NY" />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.actions}>
                <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>
                  ← Back
                </button>
                <button className="btn-primary" onClick={handleContinue}>
                  {step === STEPS.length ? 'Submit Application' : `Continue → ${STEPS[step]}`}
                </button>
              </div>
            </>
          )}

          {/* ── Steps 3 & 4: Availability + Membership (placeholders) ── */}
          {step >= 3 && (
            <>
              <p style={{ color: '#666', margin: '2rem 0' }}>
                {step === 3
                  ? 'Availability setup coming soon — you can add slots from your dashboard.'
                  : 'Membership options coming soon.'}
              </p>
              <div className={styles.actions}>
                <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>
                  ← Back
                </button>
                <button className="btn-primary" onClick={handleContinue}>
                  {step === STEPS.length ? 'Finish & Go to Dashboard' : `Continue → ${STEPS[step]}`}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </main>
  );
}
