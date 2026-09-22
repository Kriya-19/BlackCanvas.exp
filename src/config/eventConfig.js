/**
 * ─────────────────────────────────────────────────────────────
 *  BLACKCANVAS — single source of truth
 *  Edit event details, copy and ticket prices here.
 *  Nothing else in the codebase needs to change.
 * ─────────────────────────────────────────────────────────────
 */

export const BRAND = {
  name: "BLACKCANVAS",
  instagram: "@blackcanvas.live",
};

export const EVENT = {
  title: "WILD NIGHT",
  tagline: "One night. Zero plans. Maximum chaos.",

  // Shown on the event page under "About"
  about:
    "WILD NIGHT is BLACKCANVAS's first drop of the season — an unscripted night of sound, strangers turning into friends, and a lineup we're keeping under wraps until doors open. No dress code, no schedule, just the room deciding what happens next.",

  date: "Sat, 26 Sep 2026",
  time: "8:00 PM – 10:00 PM",
  venue: {
    name: "Studio 101",
    area: "Kandivali West, Mumbai",
    mapUrl: "https://share.google/3h14rMG8MiWdTGLm9",
  },

  included: [
    "Entry to the event + all the chaos that comes with it 🖤",
    "Complimentary beverages to keep you going 🍹",
    "Good music, good people & a night you’ll definitely remember",
    "A few surprises along the way 👀",
  ],

  limitedSpotsText: "Limited Spots, Register Now!",

  // Poster is rendered as generative art in <PosterArt /> — swap for a real
  // photo by dropping an image into /public and setting posterImageUrl below.
  posterImageUrl: "/wild-night-poster.png",
};

/**
 * TICKETS — id must be unique and stable (used as the order/summary key).
 * price is in INR, whole rupees. maxPerOrder caps the quantity stepper.
 */
export const TICKETS = [
  {
    id: "early-bird",
    name: "Early Bird",
    price: 400,
    tagline: "Limited quantity. Once they're gone, they're gone.",
    maxPerOrder: 6,
  },
  // {
  //   id: "general",
  //   name: "General",
  //   price: 799,
  //   tagline: "Standard entry, all night access.",
  //   maxPerOrder: 6,
  // },
];

export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";
