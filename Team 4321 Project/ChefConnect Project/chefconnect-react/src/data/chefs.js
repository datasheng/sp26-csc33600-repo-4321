/* ────────────────────────────────────────────────────────────
 * Chef data — connected to the backend
 *
 * The backend doesn't store every field the UI needs (emoji,
 * badge, tags, subtitle, experience, bookingCount), so we keep
 * a small static supplement keyed by chef_id and merge it with
 * the live API response.
 *
 * If the backend adds those fields later, remove them from
 * CHEF_SUPPLEMENT and the merge functions below.
 * ──────────────────────────────────────────────────────────── */

const BASE_URL = 'http://localhost:8000';

/* ── Static fields the backend doesn't store ──────────────── */
const CHEF_SUPPLEMENT = {
  1: { emoji: '👩🏾‍🍳', badge: 'Premium', experience: 3,  bookingCount: 124, price: 85,  location: 'Brooklyn, NY',  tags: ['West African', 'Caribbean', 'Pantry Chef'] },
  2: { emoji: '👨🏻‍🍳', badge: null,      experience: 7,  bookingCount: 210, price: 110, location: 'Manhattan, NY', tags: ['Italian', 'Mediterranean'] },
  3: { emoji: '👩🏽‍🍳', badge: 'New',     experience: 2,  bookingCount: 41,  price: 70,  location: 'Queens, NY',    tags: ['Indian', 'South Asian', 'Vegan'] },
  4: { emoji: '👨🏿‍🍳', badge: null,      experience: 5,  bookingCount: 38,  price: 90,  location: 'Bronx, NY',     tags: ['Ghanaian', 'Jollof Specialist'] },
  5: { emoji: '👩🏻‍🍳', badge: null,      experience: 10, bookingCount: 156, price: 150, location: 'Manhattan, NY', tags: ['Japanese', 'Omakase', 'Sushi'] },
  6: { emoji: '👨🏽‍🍳', badge: 'Premium', experience: 6,  bookingCount: 88,  price: 95,  location: 'Queens, NY',    tags: ['Mexican', 'Colombian', 'Pantry Chef'] },
};

/* ── Day-of-week helpers ───────────────────────────────────── */
const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAY_ABBREV = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

// Converts "16:00:00" → 4, "09:00:00" → 9
function parseHour(timeStr) {
  if (!timeStr && timeStr !== 0) return 0;
  if (typeof timeStr === 'number') {
    return Math.floor(timeStr / 3600);
  }
  return parseInt(String(timeStr).split(':')[0], 10);
}

// Converts hour number → "4pm", "11am", "12pm"
function formatHour(h) {
  if (h === 0)  return '12am';
  if (h === 12) return '12pm';
  if (h < 12)   return `${h}am`;
  return `${h - 12}pm`;
}

// Converts {day_of_week, start_time, end_time} slots
// into the [{day:'Mon', hours:'4–9pm'}, ...] shape the UI expects
function buildAvailability(slots) {
  const map = {};
  for (const slot of slots) {
    const abbrev = DAY_ABBREV[slot.day_of_week.toLowerCase()];
    if (!abbrev) continue;
    const startH = parseHour(slot.start_time);
    const endH   = parseHour(slot.end_time);
    const hours = (startH <= 9 && endH >= 20)
      ? 'All day'
      : `${formatHour(startH)}–${formatHour(endH)}`;
    map[abbrev] = hours;
  }
  return DAY_ORDER.map(day => ({ day, hours: map[day] ?? null }));
}

/* ── Merge backend chef object with static supplement ─────── */
function toDisplayName(username) {
  return username
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function mergeChef(apiChef) {
  const id  = apiChef.chef_id ?? apiChef.id;
  const sup = CHEF_SUPPLEMENT[id] ?? {};

  const name     = toDisplayName(apiChef.username ?? `chef_${id}`);
  const specialty = apiChef.specialty ?? '';
  const location  = sup.location ?? '';
  const subtitle  = [specialty, location].filter(Boolean).join(' · ');

  return {
    id,
    name,
    bio:         apiChef.bio        ?? '',
    rating:      apiChef.rating     ?? 0,
    reviewCount: apiChef.review_count ?? 0,
    price:       sup.price          ?? 0,
    location,
    subtitle,
    ...sup,
    dishes:       [],
    availability: DAY_ORDER.map(day => ({ day, hours: null })),
    reviews:      [],
  };
}

/* ── Merge dish from backend ──────────────────────────────── */
function mergeDish(apiDish) {
  return apiDish.dish_name ?? apiDish.name ?? 'Unknown dish';
}

/* ── Merge review from backend ────────────────────────────── */
function mergeReview(apiReview) {
  return {
    id:      apiReview.review_id ?? apiReview.id,
    user:    apiReview.username  ?? 'Verified User',
    rating:  apiReview.rating,
    comment: apiReview.comment,
  };
}

/* ════════════════════════════════════════════════════════════
 *  Public API
 * ════════════════════════════════════════════════════════════ */

/**
 * Fetch the full list of chefs for the Browse page.
 * Returns an array shaped like the old CHEFS array.
 */
export async function fetchChefs() {
  const res = await fetch(`${BASE_URL}/chefs`);
  if (!res.ok) throw new Error('Failed to load chefs');
  const data = await res.json();
  // Backend may return { chefs: [...] } or just [...]
  const list = Array.isArray(data) ? data : (data.chefs ?? []);
  return list.map(mergeChef);
}

/**
 * Fetch a single chef's full profile — including dishes,
 * availability, and reviews — for the Chef Profile page.
 */
export async function fetchChefById(id) {
  // Fetch all three in parallel
  const [chefRes, dishRes, reviewRes, availRes] = await Promise.allSettled([
    fetch(`${BASE_URL}/chefs`),
    fetch(`${BASE_URL}/chefs/${id}/dishes`),
    fetch(`${BASE_URL}/chefs/${id}/reviews`),
    fetch(`${BASE_URL}/chefs/${id}/availability`),
  ]);

  // Chef — find by id from the /chefs list
  if (chefRes.status !== 'fulfilled' || !chefRes.value.ok) {
    throw new Error('Chef not found');
  }
  const chefList = await chefRes.value.json();
  const list = Array.isArray(chefList) ? chefList : (chefList.chefs ?? []);
  const apiChef = list.find(c => String(c.chef_id ?? c.id) === String(id));
  if (!apiChef) throw new Error('Chef not found');

  const chef = mergeChef(apiChef);

  // Dishes
  if (dishRes.status === 'fulfilled' && dishRes.value.ok) {
    const dishData = await dishRes.value.json();
    const dishList = Array.isArray(dishData) ? dishData : (dishData.dishes ?? []);
    chef.dishes = dishList.map(mergeDish);
  }

  // Reviews
  if (reviewRes.status === 'fulfilled' && reviewRes.value.ok) {
    const reviewData = await reviewRes.value.json();
    const reviewList = Array.isArray(reviewData) ? reviewData : (reviewData.reviews ?? []);
    chef.reviews      = reviewList.map(mergeReview);
    chef.reviewCount  = reviewList.length;
  }

  // Availability (endpoint may not exist — that's fine)
  if (availRes.status === 'fulfilled' && availRes.value.ok) {
    const availData = await availRes.value.json();
    const availList = Array.isArray(availData) ? availData : (availData.availability ?? []);
    if (availList.length > 0) {
      chef.availability = buildAvailability(availList);
    }
  }

  return chef;
}

///////////////////////////////////////////////////////////////////////////////
/* ── Legacy static export — keeps other files working ─────── */
export const CHEFS = [
  {
    id: 1, emoji: '👩🏾‍🍳', name: 'Anika Osei', location: 'Brooklyn, NY',
    experience: 3, tags: ['West African', 'Caribbean', 'Pantry Chef'],
    rating: 4.9, reviewCount: 48, bookingCount: 124, price: 85, badge: 'Premium',
    subtitle: 'West African & Caribbean · Brooklyn, NY · Cuisine Chef & Pantry Chef',
    bio: "I grew up cooking West African and Caribbean food with my grandmother. I specialise in Jollof, Egusi soup, Ackee & Saltfish, Oxtail, and can work with whatever ingredients you already have at home.",
    dishes: ['Jollof Rice', 'Egusi Soup', 'Ackee & Saltfish', 'Oxtail Stew', 'Suya Skewers', 'Puff Puff'],
    availability: [
      { day: 'Mon', hours: null }, { day: 'Tue', hours: '4–9pm' },
      { day: 'Wed', hours: '4–9pm' }, { day: 'Thu', hours: null },
      { day: 'Fri', hours: '3–10pm' }, { day: 'Sat', hours: 'All day' },
      { day: 'Sun', hours: '12–7pm' },
    ],
    reviews: [
      { id: 1, user: 'Marcus T.', rating: 5, comment: "Anika made the best Jollof I've ever had outside of Lagos." },
      { id: 2, user: 'Sandra K.', rating: 5, comment: 'Everything was perfect. Anika was professional, clean, and so warm.' },
      { id: 3, user: 'Jamal F.',  rating: 4, comment: 'Great pantry chef experience. Will book again.' },
    ],
  },
  {
    id: 2, emoji: '👨🏻‍🍳', name: 'Marco Ferretti', location: 'Manhattan, NY',
    experience: 7, tags: ['Italian', 'Mediterranean'],
    rating: 4.8, reviewCount: 91, bookingCount: 210, price: 110, badge: null,
    subtitle: 'Italian & Mediterranean · Manhattan, NY · Cuisine Chef',
    bio: "Trained in Bologna, I bring a slow-food approach to handmade pasta, regional Italian classics, and Mediterranean fish dishes.",
    dishes: ['Tagliatelle al Ragù', 'Cacio e Pepe', 'Saltimbocca', 'Branzino al Forno', 'Tiramisù', 'Focaccia di Recco'],
    availability: [
      { day: 'Mon', hours: '5–10pm' }, { day: 'Tue', hours: '5–10pm' },
      { day: 'Wed', hours: null }, { day: 'Thu', hours: '5–10pm' },
      { day: 'Fri', hours: '5–11pm' }, { day: 'Sat', hours: 'All day' },
      { day: 'Sun', hours: '12–9pm' },
    ],
    reviews: [
      { id: 1, user: 'Elena R.', rating: 5, comment: "Marco rolled fresh tagliatelle on my counter. Worth every dollar." },
      { id: 2, user: 'David W.', rating: 5, comment: 'Calm, polished, never in the way.' },
      { id: 3, user: 'Tomás P.', rating: 4, comment: 'Beautiful food and great stories.' },
    ],
  },
  {
    id: 3, emoji: '👩🏽‍🍳', name: 'Priya Nair', location: 'Queens, NY',
    experience: 2, tags: ['Indian', 'South Asian', 'Vegan'],
    rating: 4.7, reviewCount: 22, bookingCount: 41, price: 70, badge: 'New',
    subtitle: 'Indian & South Asian · Queens, NY · Vegan-friendly',
    bio: "Kerala-born, NYC-based. I cook the way my mother and aunts taught me — coconut, curry leaves, tamarind, and proper masala technique.",
    dishes: ['Kerala Fish Curry', 'Masala Dosa', 'Chana Masala', 'Vegan Biryani', 'Paneer Butter Masala', 'Gulab Jamun'],
    availability: [
      { day: 'Mon', hours: '5–9pm' }, { day: 'Tue', hours: null },
      { day: 'Wed', hours: '5–9pm' }, { day: 'Thu', hours: '5–9pm' },
      { day: 'Fri', hours: null }, { day: 'Sat', hours: '11am–9pm' },
      { day: 'Sun', hours: '11am–9pm' },
    ],
    reviews: [
      { id: 1, user: 'Asha M.', rating: 5, comment: 'Most authentic Kerala fish curry I have had in NYC.' },
      { id: 2, user: 'Ben K.',  rating: 4, comment: 'Vegan biryani for a dinner party of 10 — everyone went back for seconds.' },
      { id: 3, user: 'Riya S.', rating: 5, comment: 'Priya is warm, organised, and a beautiful cook.' },
    ],
  },
  {
    id: 4, emoji: '👨🏿‍🍳', name: 'Kwame Asante', location: 'Bronx, NY',
    experience: 5, tags: ['Ghanaian', 'Jollof Specialist'],
    rating: 5.0, reviewCount: 17, bookingCount: 38, price: 90, badge: null,
    subtitle: 'Ghanaian · Bronx, NY · Jollof specialist',
    bio: "Born in Kumasi, raised between Accra and the Bronx. Jollof is my obsession — I will defend the Ghanaian version against all comers.",
    dishes: ['Ghanaian Jollof Rice', 'Waakye', 'Banku & Tilapia', 'Kelewele', 'Red Red', 'Chichinga Skewers'],
    availability: [
      { day: 'Mon', hours: null }, { day: 'Tue', hours: null },
      { day: 'Wed', hours: '5–10pm' }, { day: 'Thu', hours: '5–10pm' },
      { day: 'Fri', hours: '5–11pm' }, { day: 'Sat', hours: 'All day' },
      { day: 'Sun', hours: '12–9pm' },
    ],
    reviews: [
      { id: 1, user: 'Akua D.', rating: 5, comment: 'The jollof had the bottom-of-the-pot smoke and everything.' },
      { id: 2, user: 'Lola J.', rating: 5, comment: 'The kelewele alone was worth it — sweet, spicy, perfect.' },
    ],
  },
  {
    id: 5, emoji: '👩🏻‍🍳', name: 'Yuki Tanaka', location: 'Manhattan, NY',
    experience: 10, tags: ['Japanese', 'Omakase', 'Sushi'],
    rating: 4.9, reviewCount: 63, bookingCount: 156, price: 150, badge: null,
    subtitle: 'Japanese · Manhattan, NY · Omakase & Sushi',
    bio: 'Trained for seven years in Tokyo before moving to New York. I do quiet, precise omakase dinners in your home.',
    dishes: ['Edomae Sushi', 'Chirashi', 'Agedashi Tofu', 'Miso Black Cod', 'Wagyu Tataki', 'Matcha Mochi'],
    availability: [
      { day: 'Mon', hours: null }, { day: 'Tue', hours: '6–10pm' },
      { day: 'Wed', hours: '6–10pm' }, { day: 'Thu', hours: '6–10pm' },
      { day: 'Fri', hours: '6–11pm' }, { day: 'Sat', hours: '5–11pm' },
      { day: 'Sun', hours: null },
    ],
    reviews: [
      { id: 1, user: 'Noah B.',   rating: 5, comment: 'Yuki turned my kitchen into a tiny omakase counter for six people.' },
      { id: 2, user: 'Hannah L.', rating: 5, comment: 'Best fish I have eaten outside of Japan.' },
    ],
  },
  {
    id: 6, emoji: '👨🏽‍🍳', name: 'Diego Vargas', location: 'Queens, NY',
    experience: 6, tags: ['Mexican', 'Colombian', 'Pantry Chef'],
    rating: 4.8, reviewCount: 39, bookingCount: 88, price: 95, badge: 'Premium',
    subtitle: 'Mexican & Colombian · Queens, NY · Cuisine Chef & Pantry Chef',
    bio: 'Half Mexican, half Colombian, all New Yorker. I cook from both sides of my family — fresh tortillas, slow moles, arepas, sancocho.',
    dishes: ['Mole Poblano', 'Arepas con Queso', 'Sancocho', 'Tacos al Pastor', 'Bandeja Paisa', 'Tres Leches'],
    availability: [
      { day: 'Mon', hours: '5–10pm' }, { day: 'Tue', hours: '5–10pm' },
      { day: 'Wed', hours: null }, { day: 'Thu', hours: '5–10pm' },
      { day: 'Fri', hours: '5–11pm' }, { day: 'Sat', hours: 'All day' },
      { day: 'Sun', hours: '12–9pm' },
    ],
    reviews: [
      { id: 1, user: 'Carla V.', rating: 5, comment: 'Diego built a full Colombian Sunday lunch from what I had. Magic.' },
      { id: 2, user: 'Mark P.',  rating: 5, comment: 'Fresh tortillas, three salsas, total pro.' },
      { id: 3, user: 'Sofía R.', rating: 4, comment: 'Excellent flavors — he adjusted instantly when I asked.' },
    ],
  },
];