import { useState } from 'react';
import styles from './RegisterPage.module.css';

const STEPS = ['Account', 'Chef Profile', 'Availability', 'Membership'];

const CUISINES = [
  'West African', 'Caribbean', 'Italian', 'Japanese', 'Indian',
  'Mexican', 'Korean', 'Middle Eastern', 'Latin American', 'Chinese', 'Vegan / Plant-based',
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);          // 1-based
  const [selectedCuisines, setSelectedCuisines] = useState(['West African']);
  const [form, setForm] = useState({
    firstName: '', lastName: '', bio: '',
    serviceType: 'Both', experience: '', rate: '', location: '',
  });

  function toggleCuisine(c) {
    setSelectedCuisines(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>Become a Chef</h1>
        <p className={styles.sub}>Fill in your profile and start accepting bookings in your neighbourhood.</p>

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

        {/* ── Step 2: Chef Profile (active in prototype) ── */}
        <div className={styles.form}>
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

          <div className={styles.actions}>
            <button
              className="btn-ghost"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              ← Back
            </button>
            <button
              className="btn-primary"
              onClick={() => setStep(s => Math.min(STEPS.length, s + 1))}
            >
              {step === STEPS.length ? 'Submit Application' : `Continue → ${STEPS[step]}`}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
