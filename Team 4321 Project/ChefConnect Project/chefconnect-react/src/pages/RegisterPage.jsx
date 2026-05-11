import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RegisterPage.module.css';
 
const CUISINE_TAGS = [
  'West African', 'Caribbean', 'Italian', 'Japanese', 'Indian',
  'Mexican', 'Korean', 'Middle Eastern', 'Latin American', 'Chinese',
  'Vegan / Plant-based', 'Pantry Chef', 'Cuisine Chef',
];
 
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
 
const CHEF_EMOJIS = ['🧑🏻‍🍳', '👨🏻‍🍳', '👩🏻‍🍳', '🧑🏼‍🍳', '👨🏼‍🍳', '👩🏼‍🍳', '🧑🏽‍🍳', '👨🏽‍🍳', '👩🏽‍🍳', '🧑🏾‍🍳', '👨🏾‍🍳', '👩🏾‍🍳', '🧑🏿‍🍳', '👨🏿‍🍳', '👩🏿‍🍳',];
 
const MEMBERSHIP_PLANS = [
  {
    id: 'basic',
    name: 'Basic Chef',
    price: 'Free',
    perks: ['Listed in search results', 'Up to 20 bookings/month', 'Standard support'],
  },
  {
    id: 'premium',
    name: 'Premium Chef',
    price: '$19/mo',
    perks: ['Boosted in search results', 'Unlimited bookings', 'Priority support'],
  },
];
 
export default function RegisterPage({ onLogin }) {
  const navigate = useNavigate();
 
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    accountHolder: '',
    routingNumber: '',
   accountNumber: '',
    bankName: '',
  });
  const [selectedEmoji, setSelectedEmoji]     = useState('👨‍🍳');
  const [selectedTags, setSelectedTags]       = useState([]);
  const [availability, setAvailability]       = useState({});
  const [membership, setMembership]           = useState('basic');
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
 
  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }
 
  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }
 
  function toggleDay(day) {
    setAvailability(prev => {
      if (prev[day]) {
        const next = { ...prev };
        delete next[day];
        return next;
      }
      return { ...prev, [day]: { start: '09:00', end: '17:00' } };
    });
  }
 
  function updateTime(day, field, value) {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }
 
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
 
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in your username, email, and password.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!form.accountHolder.trim() || !form.routingNumber.trim() || !form.accountNumber.trim()) {
      setError('Please fill in your payout info so we know where to send your earnings.');
      return;
    }
 
    setLoading(true);
    try {
      // 1. Register user as chef
      const res = await fetch(
      'http://localhost:8000/register' +
        `?username=${encodeURIComponent(form.username)}` +
       `&email=${encodeURIComponent(form.email)}` +
        `&password_hash=${encodeURIComponent(form.password)}` +
        `&role=chef` +
        `&account_holder=${encodeURIComponent(form.accountHolder)}` +
        `&routing_number=${encodeURIComponent(form.routingNumber)}` +
        `&account_number=${encodeURIComponent(form.accountNumber)}` +
        `&bank_name=${encodeURIComponent(form.bankName)}`,
        { method: 'POST' }
      );
 
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || 'Registration failed. Username or email may already exist.');
        setLoading(false);
        return;
      }
 
      const data = await res.json();
      const chefId = data.chef_id;
 
      // 2. Update chef profile (bio + specialty)
      if (form.bio || selectedTags.length > 0) {
        await fetch(
          `http://localhost:8000/chefs/${chefId}/profile` +
          `?user_id=${data.user_id}` +
          `&bio=${encodeURIComponent(form.bio)}` +
          `&specialty=${encodeURIComponent(selectedTags.join(', '))}`,
          { method: 'PUT' }
        ).catch(() => {});
      }
 
      // 3. Add availability slots
      for (const [day, times] of Object.entries(availability)) {
        await fetch(
          `http://localhost:8000/chefs/${chefId}/availability?day_of_week=${encodeURIComponent(day)}&start_time=${encodeURIComponent(times.start + ':00')}&end_time=${encodeURIComponent(times.end + ':00')}`,
          { method: 'POST' }
        ).catch(() => {});
      }
 
      // 4. Log in
      if (onLogin) {
        onLogin({
          user_id:  data.user_id,
          username: form.username,
          email:    form.email,
          role:     'Chef',
        });
      }
 
      navigate('/dashboard');
    } catch {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
 
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.heading}>Want to become a chef?</h1>
          <p className={styles.sub}>Here's how — fill in your details and start taking bookings.</p>
        </div>
 
        <form onSubmit={handleSubmit} noValidate className={styles.form}>
 
          {/* ── Account ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Account</h2>
 
            <div className={styles.group}>
              <label>Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. chef_anika"
                autoComplete="username"
              />
            </div>
 
            <div className={styles.group}>
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
 
            <div className={styles.group}>
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>
          </section>
 
          {/* ── Chef Profile ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Chef Profile</h2>
 
            {/* Emoji picker */}
            <div className={styles.group}>
              <label>Pick your chef emoji</label>
              <div className={styles.emojiGrid}>
                {CHEF_EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    className={`${styles.emojiBtn} ${selectedEmoji === e ? styles.emojiSelected : ''}`}
                    onClick={() => setSelectedEmoji(e)}
                    aria-label={`Select emoji ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
 
            {/* Bio */}
            <div className={styles.group}>
              <label>Your description</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell customers about your cooking background, specialties, and style…"
                rows={4}
              />
            </div>
 
            {/* Tags */}
            <div className={styles.group}>
              <label>Cuisine tags</label>
              <div className={styles.tagGrid}>
                {CUISINE_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`${styles.tag} ${selectedTags.includes(tag) ? styles.tagSelected : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </section>
 
          {/* ── Availability ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Availability</h2>
            <p className={styles.sectionHint}>Select the days you're available and set your hours.</p>
 
            <div className={styles.availList}>
              {DAYS.map(day => {
                const active = !!availability[day];
                return (
                  <div key={day} className={`${styles.dayRow} ${active ? styles.dayRowActive : ''}`}>
                    <button
                      type="button"
                      className={`${styles.dayToggle} ${active ? styles.dayToggleOn : ''}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </button>
                    {active && (
                      <div className={styles.timeInputs}>
                        <input
                          type="time"
                          value={availability[day].start}
                          onChange={e => updateTime(day, 'start', e.target.value)}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={availability[day].end}
                          onChange={e => updateTime(day, 'end', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
 
          {/* ── Membership ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Choose Your Plan</h2>
 
            <div className={styles.planGrid}>
              {MEMBERSHIP_PLANS.map(plan => (
                <button
                  key={plan.id}
                  type="button"
                  className={`${styles.planCard} ${membership === plan.id ? styles.planSelected : ''}`}
                  onClick={() => setMembership(plan.id)}
                >
                  <div className={styles.planTop}>
                    <span className={styles.planName}>{plan.name}</span>
                    <span className={styles.planPrice}>{plan.price}</span>
                  </div>
                  <ul className={styles.planPerks}>
                    {plan.perks.map(p => <li key={p}>✓ {p}</li>)}
                  </ul>
                </button>
              ))}
            </div>
          </section>
 <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Payout Info</h2>
            <p className={styles.sectionHint}>This is where we'll send your earnings.</p>

            <div className={styles.group}>
              <label>Account Holder Name</label>
              <input
                name="accountHolder"
                value={form.accountHolder}
                onChange={handleChange}
                placeholder="Full name on the bank account"
              />
            </div>

            <div className={styles.group}>
              <label>Bank Name</label>
              <input
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                placeholder="e.g. Chase, Bank of America"
              />
            </div>

            <div className={styles.group}>
              <label>Routing Number</label>
              <input
                name="routingNumber"
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={form.routingNumber}
                onChange={handleChange}
                placeholder="9-digit routing number"
              />
            </div>

            <div className={styles.group}>
              <label>Account Number</label>
              <input
                name="accountNumber"
                type="text"
                inputMode="numeric"
                value={form.accountNumber}
                onChange={handleChange}
                placeholder="Bank account number"
              />
            </div>
          </section>
          {error && <p className={styles.error}>{error}</p>}
 
          <div className={styles.actions}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating your profile…' : 'Join as a Chef →'}
            </button>
          </div>
 
          <p className={styles.loginNote}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
 
        </form>
      </div>
    </main>
  );
}