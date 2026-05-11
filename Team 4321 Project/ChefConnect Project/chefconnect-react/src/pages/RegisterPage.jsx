import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './RegisterPage.module.css';

/* ──────────────────────────────────────────────────────────────
 * Become a Chef wizard
 *
 * Four steps with distinct fields:
 *
 *   1. Account       — first/last name, email, password, phone
 *   2. Chef Profile  — bio, cuisines, service type, experience, rate, area
 *   3. Availability  — days of week, time window, max bookings, travel
 *   4. Membership    — plan choice, terms checkbox, final submit
 *
 * On successful submit we:
 *   - record the chef profile in the auth context's registry
 *   - bounce the user to /login with state.justRegistered so the
 *     login page can greet them and pre-fill the email
 *
 * After the backend lands, the final submit POSTs to /api/chefs/register
 * before redirecting; the rest of the flow stays the same.
 * ────────────────────────────────────────────────────────────── */

const STEPS = ['Account', 'Chef Profile', 'Availability', 'Membership'];

const CUISINES = [
  'West African', 'Caribbean', 'Italian', 'Japanese', 'Indian',
  'Mexican', 'Korean', 'Middle Eastern', 'Latin American', 'Chinese',
  'Vegan / Plant-based',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    priceNote: 'Forever',
    blurb: 'Get listed, accept bookings, build reviews.',
    perks: ['Up to 4 bookings / month', 'Standard support', '15% platform commission'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    priceNote: '/month',
    blurb: 'For chefs running a busy weekly schedule.',
    perks: ['Unlimited bookings', 'Priority placement in search', '10% platform commission', 'Same-day payouts'],
    recommended: true,
  },
  {
    id: 'master',
    name: 'Master',
    price: '$79',
    priceNote: '/month',
    blurb: 'For full-time private chefs with a roster.',
    perks: ['Everything in Pro', '7% platform commission', 'Custom branded profile', 'Dedicated account manager'],
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\s\-\d]{7,}$/;

/* Build the initial form once so re-renders don't reset values. */
function makeInitialForm() {
  return {
    // Step 1
    firstName: '', lastName: '', email: '', password: '', phone: '',
    // Step 2
    bio: '', cuisines: ['West African'], serviceType: 'Both',
    experience: '', rate: '', serviceArea: '',
    // Step 3
    availableDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    timeFrom: '17:00', timeTo: '21:00',
    maxBookings: '3', travelDistance: '5',
    // Step 4
    plan: 'pro', agreedToTerms: false,
  };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerChefProfile, hasChefProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(makeInitialForm);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    update(name, type === 'checkbox' ? checked : value);
  }
  function toggleCuisine(c) {
    setForm(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(c)
        ? prev.cuisines.filter(x => x !== c)
        : [...prev.cuisines, c],
    }));
  }
  function toggleDay(d) {
    setForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(d)
        ? prev.availableDays.filter(x => x !== d)
        : [...prev.availableDays, d],
    }));
  }

  /* ── Per-step validation ───────────────────────────────── */
  function validateStep(n) {
    if (n === 1) {
      if (!form.firstName.trim())          return 'Please enter your first name.';
      if (!form.lastName.trim())           return 'Please enter your last name.';
      if (!form.email.trim())              return 'Please enter your email.';
      if (!EMAIL_RE.test(form.email))      return 'Please enter a valid email address.';
      if (hasChefProfile(form.email))      return 'A chef profile already exists for that email. Try logging in instead.';
      if (!form.password)                  return 'Please choose a password.';
      if (form.password.length < 6)        return 'Password must be at least 6 characters.';
      if (!form.phone.trim())              return 'Please enter a phone number so customers can reach you.';
      if (!PHONE_RE.test(form.phone))      return 'Please enter a valid phone number.';
    }
    if (n === 2) {
      if (form.bio.trim().length < 30)     return 'Tell customers a little more about yourself — at least 30 characters.';
      if (form.cuisines.length === 0)      return 'Pick at least one specialty cuisine.';
      if (!form.experience || +form.experience < 0) return 'Please enter years of experience.';
      if (!form.rate || +form.rate <= 0)   return 'Please enter your hourly rate.';
      if (!form.serviceArea.trim())        return 'Please enter the area you cook in.';
    }
    if (n === 3) {
      if (form.availableDays.length === 0) return 'Pick at least one day you are available.';
      if (!form.timeFrom || !form.timeTo)  return 'Please set the hours you are available.';
      if (form.timeFrom >= form.timeTo)    return 'End time must be after start time.';
      if (!form.maxBookings || +form.maxBookings < 1)  return 'Please set a max bookings per week.';
      if (!form.travelDistance || +form.travelDistance < 1) return 'Please set how far you will travel.';
    }
    if (n === 4) {
      if (!form.plan)              return 'Please choose a membership plan.';
      if (!form.agreedToTerms)     return 'Please agree to the terms before submitting.';
    }
    return '';
  }

  /* ── Navigation ────────────────────────────────────────── */
  function goBack() {
    setError('');
    setStep(s => Math.max(1, s - 1));
  }

  function goNext() {
    const msg = validateStep(step);
    if (msg) { setError(msg); return; }
    setError('');
    setStep(s => Math.min(STEPS.length, s + 1));
  }

  function submitApplication() {
    const msg = validateStep(4);
    if (msg) { setError(msg); return; }

    /* Backend stub: when /api/chefs/register exists, POST the form here
     * before recording the profile + navigating. */
    setLoading(true);
    setTimeout(() => {
      registerChefProfile({
        email:        form.email,
        password:     form.password,
        firstName:    form.firstName.trim(),
        lastName:     form.lastName.trim(),
        phone:        form.phone,
        bio:          form.bio.trim(),
        cuisines:     form.cuisines,
        serviceType:  form.serviceType,
        experience:   +form.experience,
        rate:         +form.rate,
        serviceArea:  form.serviceArea.trim(),
        availability: {
          days: form.availableDays,
          from: form.timeFrom,
          to:   form.timeTo,
        },
        maxBookings:    +form.maxBookings,
        travelDistance: +form.travelDistance,
        plan:           form.plan,
      });
      setLoading(false);

      // Bounce to login with a pre-filled email and a confirmation banner.
      navigate('/login', {
        state: { justRegistered: { email: form.email } },
      });
    }, 700);
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>Become a Chef</h1>
        <p className={styles.sub}>
          Step {step} of {STEPS.length} — {STEPS[step - 1]}
        </p>

        {/* Step indicator */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => {
            const n = i + 1;
            return (
              <div
                key={s}
                className={`${styles.step} ${n < step ? styles.done : ''} ${n === step ? styles.active : ''}`}
              >
                <span className={styles.stepNum}>{n}</span>
                <span className={styles.stepLabel}>{s}</span>
              </div>
            );
          })}
        </div>

        {/* Error banner */}
        {error && (
          <div className={styles.errorBox} role="alert">
            {error}
          </div>
        )}

        {/* Form body — different per step */}
        <div className={styles.form}>
          {step === 1 && <StepAccount      form={form} onChange={handleChange} />}
          {step === 2 && <StepChefProfile  form={form}
                                           onChange={handleChange}
                                           toggleCuisine={toggleCuisine} />}
          {step === 3 && <StepAvailability form={form}
                                           onChange={handleChange}
                                           toggleDay={toggleDay} />}
          {step === 4 && <StepMembership   form={form}
                                           onChange={handleChange}
                                           onPickPlan={(id) => update('plan', id)} />}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className="btn-ghost"
              onClick={goBack}
              disabled={step === 1 || loading}
            >
              ← Back
            </button>

            {step < STEPS.length ? (
              <button
                type="button"
                className="btn-primary"
                onClick={goNext}
                disabled={loading}
              >
                Continue → {STEPS[step]}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={submitApplication}
                disabled={loading}
              >
                {loading ? 'Submitting…' : 'Submit Application'}
              </button>
            )}
          </div>

          <p className={styles.legalFoot}>
            Already a chef on ChefConnect?{' '}
            <Link to="/login" className={styles.inlineLink}>Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Step 1 — Account
 * ────────────────────────────────────────────────────────────── */
function StepAccount({ form, onChange }) {
  return (
    <>
      <p className={styles.stepIntro}>
        Tell us who you are. This is the account you’ll use to log in.
      </p>

      <div className={styles.row}>
        <div className={styles.group}>
          <label htmlFor="r-first">First Name</label>
          <input
            id="r-first" name="firstName"
            value={form.firstName} onChange={onChange}
            placeholder="Anika" autoComplete="given-name"
          />
        </div>
        <div className={styles.group}>
          <label htmlFor="r-last">Last Name</label>
          <input
            id="r-last" name="lastName"
            value={form.lastName} onChange={onChange}
            placeholder="Osei" autoComplete="family-name"
          />
        </div>
      </div>

      <div className={styles.group}>
        <label htmlFor="r-email">Email</label>
        <input
          id="r-email" name="email" type="email"
          value={form.email} onChange={onChange}
          placeholder="you@example.com" autoComplete="email"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <label htmlFor="r-password">Password</label>
          <input
            id="r-password" name="password" type="password"
            value={form.password} onChange={onChange}
            placeholder="At least 6 characters" autoComplete="new-password"
          />
        </div>
        <div className={styles.group}>
          <label htmlFor="r-phone">Phone</label>
          <input
            id="r-phone" name="phone" type="tel"
            value={form.phone} onChange={onChange}
            placeholder="(555) 123-4567" autoComplete="tel"
          />
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Step 2 — Chef Profile
 * ────────────────────────────────────────────────────────────── */
function StepChefProfile({ form, onChange, toggleCuisine }) {
  return (
    <>
      <p className={styles.stepIntro}>
        Customers see this on your chef page. Be specific — what makes
        your cooking yours?
      </p>

      <div className={styles.group}>
        <label htmlFor="r-bio">Short Bio</label>
        <textarea
          id="r-bio" name="bio"
          value={form.bio} onChange={onChange}
          placeholder="I grew up cooking West African food with my grandmother. I specialise in Jollof, Egusi soup, and Suya…"
        />
      </div>

      <div className={styles.group}>
        <label>Specialty Cuisines</label>
        <div className={styles.cuisinePicker}>
          {CUISINES.map(c => (
            <button
              key={c}
              type="button"
              className={`${styles.cuisineChip} ${form.cuisines.includes(c) ? styles.cuisineSelected : ''}`}
              onClick={() => toggleCuisine(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <label htmlFor="r-service">Service Type</label>
        <select
          id="r-service" name="serviceType"
          value={form.serviceType} onChange={onChange}
        >
          <option value="cuisine">Cuisine Chef only (I bring ingredients)</option>
          <option value="pantry">Pantry Chef only (use client's ingredients)</option>
          <option value="Both">Both</option>
        </select>
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <label htmlFor="r-exp">Years of Experience</label>
          <input
            id="r-exp" name="experience" type="number" min="0"
            value={form.experience} onChange={onChange}
            placeholder="3"
          />
        </div>
        <div className={styles.group}>
          <label htmlFor="r-rate">Hourly Rate ($)</label>
          <input
            id="r-rate" name="rate" type="number" min="0"
            value={form.rate} onChange={onChange}
            placeholder="85"
          />
        </div>
      </div>

      <div className={styles.group}>
        <label htmlFor="r-area">Service Area</label>
        <input
          id="r-area" name="serviceArea"
          value={form.serviceArea} onChange={onChange}
          placeholder="Brooklyn, NY"
        />
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Step 3 — Availability
 * ────────────────────────────────────────────────────────────── */
function StepAvailability({ form, onChange, toggleDay }) {
  return (
    <>
      <p className={styles.stepIntro}>
        When are you available to cook? You can fine-tune day-by-day
        hours later from your chef dashboard.
      </p>

      <div className={styles.group}>
        <label>Available Days</label>
        <div className={styles.dayPicker}>
          {DAYS.map(d => (
            <button
              key={d}
              type="button"
              className={`${styles.dayChip} ${form.availableDays.includes(d) ? styles.dayChipActive : ''}`}
              onClick={() => toggleDay(d)}
              aria-pressed={form.availableDays.includes(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <label htmlFor="r-from">Available From</label>
          <input
            id="r-from" name="timeFrom" type="time"
            value={form.timeFrom} onChange={onChange}
          />
        </div>
        <div className={styles.group}>
          <label htmlFor="r-to">Available Until</label>
          <input
            id="r-to" name="timeTo" type="time"
            value={form.timeTo} onChange={onChange}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <label htmlFor="r-max">Max Bookings per Week</label>
          <input
            id="r-max" name="maxBookings" type="number" min="1" max="30"
            value={form.maxBookings} onChange={onChange}
            placeholder="3"
          />
        </div>
        <div className={styles.group}>
          <label htmlFor="r-travel">Travel Distance (miles)</label>
          <input
            id="r-travel" name="travelDistance" type="number" min="1" max="100"
            value={form.travelDistance} onChange={onChange}
            placeholder="5"
          />
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Step 4 — Membership
 * ────────────────────────────────────────────────────────────── */
function StepMembership({ form, onChange, onPickPlan }) {
  return (
    <>
      <p className={styles.stepIntro}>
        Pick a plan to get started. You can upgrade or downgrade
        anytime from your dashboard.
      </p>

      <div className={styles.planGrid}>
        {PLANS.map(p => {
          const selected = form.plan === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPickPlan(p.id)}
              className={`${styles.planCard} ${selected ? styles.planSelected : ''}`}
              aria-pressed={selected}
            >
              {p.recommended && (
                <span className={styles.planBadge}>Recommended</span>
              )}
              <span className={styles.planName}>{p.name}</span>
              <span className={styles.planPriceRow}>
                <span className={styles.planPrice}>{p.price}</span>
                <span className={styles.planPriceNote}>{p.priceNote}</span>
              </span>
              <span className={styles.planBlurb}>{p.blurb}</span>
              <ul className={styles.planPerks}>
                {p.perks.map(perk => (
                  <li key={perk}>
                    <span className={styles.planTick}>✓</span> {perk}
                  </li>
                ))}
              </ul>
              <span className={styles.planChoose}>
                {selected ? 'Selected' : 'Choose plan'}
              </span>
            </button>
          );
        })}
      </div>

      <label className={styles.termsRow}>
        <input
          type="checkbox" name="agreedToTerms"
          checked={form.agreedToTerms}
          onChange={onChange}
        />
        <span>
          I agree to the ChefConnect{' '}
          <a href="#" className={styles.inlineLink}>Chef Terms of Service</a>
          {' '}and acknowledge the platform commission for my plan.
        </span>
      </label>

      <div className={styles.summary}>
        <p className={styles.summaryTitle}>Quick summary</p>
        <dl className={styles.summaryGrid}>
          <div><dt>Name</dt><dd>{form.firstName} {form.lastName}</dd></div>
          <div><dt>Email</dt><dd>{form.email || '—'}</dd></div>
          <div><dt>Service area</dt><dd>{form.serviceArea || '—'}</dd></div>
          <div><dt>Hourly rate</dt><dd>{form.rate ? `$${form.rate}/hr` : '—'}</dd></div>
          <div><dt>Days</dt><dd>{form.availableDays.join(', ') || '—'}</dd></div>
          <div><dt>Plan</dt><dd>{PLANS.find(p => p.id === form.plan)?.name || '—'}</dd></div>
        </dl>
      </div>
    </>
  );
}
