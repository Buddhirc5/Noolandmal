// Shared by the quote dialog, the server and the admin's document form.
export interface PromoResult {
  ok: true;
  code: string;
  kind: "discount" | "referral";
  /** "percent" codes take a share of the subtotal; "fixed" take rupees */
  type: "percent" | "fixed";
  value: number;
  /** e.g. "10% off" or "LKR 1,000 off your first order" */
  label: string;
  minTotal: number;
  referrerPhone?: string;
}
export type PromoCheck = PromoResult | { ok: false; error: string };

export const normalizeCode = (raw: string) => raw.trim().toUpperCase().replace(/\s+/g, "");
export const CODE_RE = /^[A-Z0-9-]{3,20}$/;

/** Rupees off a subtotal (percent rounded to the nearest 100; never more than the subtotal). */
export function promoDiscount(p: Pick<PromoResult, "type" | "value" | "minTotal">, subtotal: number) {
  if (subtotal <= 0 || subtotal < p.minTotal) return 0;
  const raw = p.type === "percent" ? Math.round((subtotal * p.value) / 100 / 100) * 100 : p.value;
  return Math.min(raw, subtotal);
}
