/**
 * Single place for business details. Everything marked PLACEHOLDER must be
 * replaced with real values before launch (see README → "Before launch").
 */
export const site = {
  name: "Nool & Mal",
  tagline: "Made to order · Sri Lanka",
  description:
    "Nool & Mal is a family-run made-to-order fashion label in Colombo, Sri Lanka. Design your dress online, change colours and details, see a live price estimate and get a quotation on WhatsApp.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  /** E.164 without "+" */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "94776344267",
  /** Display phone for tel: links */
  phoneDisplay: "+94 77 634 4267",
  instagram: "https://instagram.com/noolandmal", // PLACEHOLDER
  email: "hello@noolandmal.lk", // PLACEHOLDER
  designer: "Roshini Shyama",
  designerYears: "20+",
  designerPieces: "6000+",
  /** Studio address & map pin */
  studio: {
    street: "No 85, Senanayake Mawatha",
    city: "Sri Jayawardenepura Kotte",
    region: "Western Province",
    country: "LK",
    lat: 6.888937,
    lng: 79.891813,
    plusCode: "6JRXVVQR+HP",
    mapUrl: "https://maps.app.goo.gl/2sV6Z4YYoxkryc8u8",
    hours: "Mon–Sat, 9.30am – 6.00pm (by appointment)",
  },
  /** PLACEHOLDER bank details shown on quote pages (also editable in Admin → Catalog → Settings) */
  bank: {
    accountName: "Nool & Mal (placeholder)",
    bank: "Bank name",
    branch: "Branch",
    accountNumber: "0000 0000 0000",
  },
  currency: "LKR",
  locales: ["en", "si", "ta"] as const,
  defaultLocale: "en" as const,
};

/** Feature switches. Add-ons (sleeves, ornaments…) return in a later update, shown as photo buttons. */
export const features = {
  addons: false,
};

export type Locale = (typeof site.locales)[number];

export const navLinks = [
  { href: "/collection", key: "nav.collection" },
  { href: "/how-it-works", key: "nav.how" },
  { href: "/custom", key: "nav.custom" },
  { href: "/gallery", key: "nav.gallery" },
  { href: "/pricing", key: "nav.pricing" },
  { href: "/faq", key: "nav.faq" },
] as const;

export const testimonials = [
  {
    quote:
      "Roshini made my homecoming dress in just under two weeks. The fitting was so careful — she pinned everything twice and it sat perfectly on the day. The fabric and finishing were even better than the photo.",
    name: "Hasara",
    occasion: "Homecoming",
  },
  {
    quote:
      "I needed a dress for my sister's engagement and only had ten days. It was ready on time, the colour was exactly what we chose, and after one fitting it felt like it was made on me — because it was.",
    name: "Sithumi",
    occasion: "Engagement",
  },
  {
    quote:
      "I've had three dresses made now. Every time the measurements are spot on, the date they give is the date I get it, and the small details are done by hand. I won't buy ready-made for occasions again.",
    name: "Dinithi",
    occasion: "Wedding guest",
  },
];

/**
 * Creator programme ("Nool & Mal Partners"). Business terms are PLACEHOLDERS —
 * confirm the discount and rules with Roshini before promoting the page.
 */
export const creatorProgram = {
  discountPercent: 25,
  minFollowers: "1,000+",
  videoLength: "30–60 seconds",
  postWithinDays: 14,
  hashtag: "#noolandmalpartner",
  handle: "@noolandmal",
};

/** Referral programme. PLACEHOLDER amounts — confirm with Roshini. */
export const referral = {
  /** off the friend's first order */
  friendDiscount: 1000,
  /** credit for the customer who referred them, once the friend pays */
  reward: 1000,
};

export const occasions = ["Wedding", "Homecoming", "Engagement", "Party", "Office", "Casual", "Festival", "Kids"] as const;

export const categories = [
  { key: "dress", label: "Dresses" },
  { key: "frock", label: "Frocks" },
  { key: "saree-blouse", label: "Saree & blouses" },
  { key: "crochet-top", label: "Crochet tops" },
  { key: "kids", label: "Kids" },
  { key: "bridal", label: "Bridal & occasion" },
  { key: "sets", label: "Sets & separates" },
] as const;
