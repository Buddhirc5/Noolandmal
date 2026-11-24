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
  /** E.164 without "+". PLACEHOLDER */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "94770000000",
  /** Display phone for tel: links. PLACEHOLDER */
  phoneDisplay: "+94 77 000 0000",
  instagram: "https://instagram.com/noolandmal", // PLACEHOLDER
  email: "hello@noolandmal.lk", // PLACEHOLDER
  /** PLACEHOLDER studio address & map pin */
  studio: {
    street: "Studio address to be confirmed",
    city: "Colombo",
    region: "Western Province",
    country: "LK",
    lat: 6.9271,
    lng: 79.8612,
    mapUrl: "https://maps.google.com/?q=Colombo",
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

export type Locale = (typeof site.locales)[number];

export const navLinks = [
  { href: "/collection", key: "nav.collection" },
  { href: "/how-it-works", key: "nav.how" },
  { href: "/custom", key: "nav.custom" },
  { href: "/pricing", key: "nav.pricing" },
  { href: "/faq", key: "nav.faq" },
] as const;

/** SAMPLE testimonials — replace with real customer quotes (with permission) before launch. */
export const testimonials = [
  {
    quote:
      "I changed the colours three times before deciding and the price updated every time. The final dress fit perfectly after one fitting.",
    name: "Sample customer",
    occasion: "Homecoming",
  },
  {
    quote:
      "I only had a Pinterest photo. They understood exactly what I wanted and the crochet details were beautiful.",
    name: "Sample customer",
    occasion: "Engagement",
  },
  {
    quote: "Getting a quotation on WhatsApp was so easy. Clear price, clear dates, no surprises.",
    name: "Sample customer",
    occasion: "Wedding guest",
  },
];

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
