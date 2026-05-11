import { createContext, useContext, useEffect, useState, useCallback } from 'react';

/* ──────────────────────────────────────────────────────────────
 * AuthContext
 * --------------------------------------------------------------
 * Frontend-only stand-in for a real auth backend.
 *
 * Tracks:
 *   • `user`           — who is currently signed in (session)
 *   • customer accounts — saved by SignupPage
 *   • chef profiles    — saved by RegisterPage (Become a Chef)
 *
 * Both registries persist in localStorage so a signed-up customer
 * (or a registered chef) is still recognised after a refresh, which
 * is the whole point of the gated login flows.
 *
 * IMPORTANT: passwords are stored in plaintext here purely because
 * this is a frontend prototype. When the real backend lands:
 *   • Signup        → POST /api/auth/signup (server hashes the pw)
 *   • Login         → POST /api/auth/login  (server verifies hash)
 *   • Become a Chef → POST /api/chefs/register
 * The provider's surface (login, signup, registerChefProfile,
 * hasChefProfile) doesn't need to change — only the function
 * bodies do.
 * ────────────────────────────────────────────────────────────── */

const AuthContext = createContext(null);

// localStorage keys, namespaced so we don't collide with other apps
const LS_CUSTOMERS = 'chefconnect:customers';
const LS_CHEFS     = 'chefconnect:chefs';

function normalise(email) {
  return (email || '').trim().toLowerCase();
}

/** Read a registry from localStorage; tolerate missing/corrupt data. */
function loadRegistry(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch {
    return {};
  }
}

function saveRegistry(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or storage disabled — fail silently */
  }
}

export function AuthProvider({ children }) {
  // Hydrate registries once. The lazy initialiser avoids reading
  // localStorage on every re-render.
  const [customers,    setCustomers]    = useState(() => loadRegistry(LS_CUSTOMERS));
  const [chefProfiles, setChefProfiles] = useState(() => loadRegistry(LS_CHEFS));

  // Session — kept in memory only (signing back in after a refresh
  // is intentional: it proves the gated login actually works).
  const [user, setUser] = useState(null);

  // Persist registries whenever they change
  useEffect(() => { saveRegistry(LS_CUSTOMERS, customers);    }, [customers]);
  useEffect(() => { saveRegistry(LS_CHEFS,     chefProfiles); }, [chefProfiles]);

  /* ── Lookup helpers ────────────────────────────────────── */

  const hasCustomerAccount = useCallback(
    (email) => Boolean(customers[normalise(email)]),
    [customers]
  );

  const hasChefProfile = useCallback(
    (email) => Boolean(chefProfiles[normalise(email)]),
    [chefProfiles]
  );

  /* ── Registration ──────────────────────────────────────── */

  /**
   * Customer signup. Returns { ok: true } or { ok: false, error }.
   * Refuses duplicates so people don't silently overwrite an account.
   */
  const registerCustomerAccount = useCallback(({ name, email, password }) => {
    const key = normalise(email);
    if (!key) return { ok: false, error: 'Please enter your email.' };

    if (customers[key]) {
      return {
        ok: false,
        error: 'An account with that email already exists. Try logging in instead.',
      };
    }

    setCustomers(prev => ({
      ...prev,
      [key]: {
        email: key,
        name:  (name || '').trim(),
        password,        // plaintext for now — see file-level note
        createdAt: Date.now(),
      },
    }));
    return { ok: true };
  }, [customers]);

  /**
   * Chef profile registration (called from Become a Chef step 4).
   * The profile includes a password chosen on step 1.
   */
  const registerChefProfile = useCallback((profile) => {
    const key = normalise(profile.email);
    if (!key) return { ok: false, error: 'Please enter your email.' };

    if (chefProfiles[key]) {
      return {
        ok: false,
        error: 'A chef profile already exists for that email.',
      };
    }

    setChefProfiles(prev => ({
      ...prev,
      [key]: { ...profile, email: key, createdAt: Date.now() },
    }));
    return { ok: true };
  }, [chefProfiles]);

  /* ── Login ─────────────────────────────────────────────── */

  /**
   * Gated login.
   *
   * Customer role:
   *   - email not in customers   → 'Account not found. Please sign up first.'
   *   - password mismatch        → 'Incorrect password.'
   *   - otherwise                → ok
   *
   * Chef role:
   *   - email not in chefs       → 'Please complete the Become a Chef registration first.'
   *   - password mismatch        → 'Incorrect password.'
   *   - otherwise                → ok
   *
   * On failure, also flags `needsSignup` / `needsRegistration` so
   * the LoginPage can show the right CTA without re-parsing strings.
   */
  const login = useCallback(
    ({ email, password, role = 'customer' }) => {
      const key = normalise(email);

      if (role === 'customer') {
        const account = customers[key];
        if (!account) {
          return {
            ok: false,
            error: 'Account not found. Please sign up first.',
            needsSignup: true,
          };
        }
        if (account.password !== password) {
          return { ok: false, error: 'Incorrect password.' };
        }
        setUser({ email: key, role: 'customer', name: account.name || key.split('@')[0] });
        return { ok: true };
      }

      // role === 'chef'
      const chef = chefProfiles[key];
      if (!chef) {
        return {
          ok: false,
          error: 'Please complete the Become a Chef registration first.',
          needsRegistration: true,
        };
      }
      if (chef.password !== password) {
        return { ok: false, error: 'Incorrect password.' };
      }
      const chefName = `${chef.firstName || ''} ${chef.lastName || ''}`.trim() || key.split('@')[0];
      setUser({ email: key, role: 'chef', name: chefName });
      return { ok: true };
    },
    [customers, chefProfiles]
  );

  /**
   * After signup, immediately sign the user in. Kept as a separate
   * call so the signup page can decide whether to auto-login or
   * bounce to the login page.
   */
  const signup = useCallback(({ email, role = 'customer', name }) => {
    const key = normalise(email);
    setUser({
      email: key,
      role,
      name: (name || key.split('@')[0]).trim(),
    });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = {
    user,
    isCustomer: user?.role === 'customer',
    isChef:     user?.role === 'chef',
    login,
    signup,
    logout,
    hasCustomerAccount,
    hasChefProfile,
    registerCustomerAccount,
    registerChefProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
