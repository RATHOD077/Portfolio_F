// "Start a project" planner (/start): the choices a visitor makes and the rough
// price/time estimate it shows. Edit the numbers here to match your rates — the
// planner, the estimate and the brief you receive all update automatically.
//
// Prices are in rupees: [lowest, highest] for a typical project.

export const BRIEF = {
  // Set to false to hide prices and only collect the brief.
  showEstimate: true,

  types: [
    {
      id: 'website',
      label: 'Website',
      hint: 'Business site, portfolio or landing page',
      price: [15000, 35000],
      weeks: [1, 3],
    },
    {
      id: 'store',
      label: 'Online store',
      hint: 'Products, cart, payments and orders',
      price: [35000, 80000],
      weeks: [3, 6],
    },
    {
      id: 'webapp',
      label: 'Web app / dashboard',
      hint: 'Logins, roles, reports and admin tools',
      price: [50000, 150000],
      weeks: [4, 10],
    },
    {
      id: 'mobile',
      label: 'Mobile app',
      hint: 'Android app in Flutter (iOS possible)',
      price: [50000, 150000],
      weeks: [4, 10],
    },
    {
      id: 'web-mobile',
      label: 'Website + app',
      hint: 'One backend for your site and your app',
      price: [90000, 250000],
      weeks: [6, 14],
    },
    {
      id: 'other',
      label: 'Something else',
      hint: 'Fixes, new features, an API, automation',
      price: [8000, 50000],
      weeks: [1, 4],
    },
  ],

  features: [
    { id: 'accounts', label: 'User accounts & login', price: [5000, 15000] },
    { id: 'payments', label: 'Online payments (UPI / cards)', price: [8000, 20000] },
    { id: 'admin', label: 'Admin panel to edit content', price: [8000, 25000] },
    { id: 'booking', label: 'Bookings / appointments', price: [10000, 25000] },
    { id: 'notify', label: 'WhatsApp, email or push alerts', price: [5000, 15000] },
    { id: 'ai', label: 'AI features (chatbot, smart search)', price: [15000, 40000] },
    { id: 'languages', label: 'More than one language', price: [5000, 15000] },
    { id: 'design', label: 'I need the design too', price: [10000, 30000] },
  ],

  // `factor` scales the price: rushing costs more, flexible dates can cost less.
  timelines: [
    { id: 'asap', label: 'As soon as possible', factor: 1.25 },
    { id: 'month', label: 'Within a month', factor: 1 },
    { id: 'quarter', label: 'In 1–3 months', factor: 1 },
    { id: 'flexible', label: "I'm flexible", factor: 0.95 },
  ],

  budgets: ['Under ₹20k', '₹20k – ₹50k', '₹50k – ₹1L', '₹1L – ₹2.5L', '₹2.5L+', 'Not sure yet'],
};

/** Rounds to a "friendly" amount: nearest 1,000 below 50k, nearest 5,000 above. */
const friendly = (amount) => {
  const step = amount < 50000 ? 1000 : 5000;
  return Math.round(amount / step) * step;
};

/** ₹35,000 / ₹1,50,000 (Indian digit grouping). */
export const formatRupees = (amount) => `₹${amount.toLocaleString('en-IN')}`;

/**
 * Rough estimate for the choices made so far, or null before a type is picked.
 * Returns the price range, the time range in weeks, and the lines it's made of.
 */
export function estimateBrief({ type, features = [], timeline }) {
  const base = BRIEF.types.find((t) => t.id === type);
  if (!base) return null;

  const extras = BRIEF.features.filter((f) => features.includes(f.id));
  const factor = BRIEF.timelines.find((t) => t.id === timeline)?.factor ?? 1;

  const low = (base.price[0] + extras.reduce((sum, f) => sum + f.price[0], 0)) * factor;
  const high = (base.price[1] + extras.reduce((sum, f) => sum + f.price[1], 0)) * factor;

  // Each extra feature adds roughly half a week to a week.
  const weeksMin = base.weeks[0] + Math.floor(extras.length / 2);
  const weeksMax = base.weeks[1] + extras.length;

  return {
    min: friendly(low),
    max: friendly(high),
    weeksMin,
    weeksMax,
    lines: [
      { label: base.label, price: base.price },
      ...extras.map((f) => ({ label: f.label, price: f.price })),
    ],
    rush: factor > 1,
  };
}

/** The brief as plain text — sent to the contact inbox and on WhatsApp. */
export function briefText({ type, features = [], timeline, budget, details, reply, phone }, estimate) {
  const typeLabel = BRIEF.types.find((t) => t.id === type)?.label ?? 'Not chosen';
  const featureLabels = BRIEF.features.filter((f) => features.includes(f.id)).map((f) => f.label);
  const timelineLabel = BRIEF.timelines.find((t) => t.id === timeline)?.label ?? 'Not chosen';

  const lines = [
    'PROJECT BRIEF (from the website planner)',
    '',
    `What: ${typeLabel}`,
    `Features: ${featureLabels.length ? featureLabels.join(', ') : 'None picked'}`,
    `Timeline: ${timelineLabel}`,
    `Budget: ${budget || 'Not chosen'}`,
  ];
  if (estimate && BRIEF.showEstimate) {
    lines.push(
      `Planner estimate: ${formatRupees(estimate.min)} – ${formatRupees(estimate.max)}, ${estimate.weeksMin}–${estimate.weeksMax} weeks`
    );
  }
  if (reply) lines.push(`Preferred reply: ${reply}${phone ? ` — ${phone}` : ''}`);
  if (details?.trim()) lines.push('', 'Details:', details.trim());
  return lines.join('\n');
}
