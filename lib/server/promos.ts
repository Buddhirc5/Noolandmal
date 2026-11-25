import "server-only";
// Discount codes (made by the studio) and referral codes (one per customer).
import { db } from "./db";
import { audit, ServiceError } from "./orders";
import { lkDate } from "./studio";
import { referral } from "@/config/site";
import { CODE_RE, normalizeCode, type PromoCheck } from "@/lib/promo";
import { lkr } from "@/lib/format";
import type { Customer, DiscountCode, Order, Payment, ReferralReward } from "@/lib/types";

// ── Referral codes ──────────────────────────────────────────────────────
/** e.g. "Hasara Perera", 94771234567 -> HASARA567 (unique). */
export async function makeReferralCode(name: string, phone: string) {
  const base = (name.split(/\s+/)[0] || "FRIEND").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "FRIEND";
  let code = `${base}${phone.slice(-3)}`;
  for (let i = 0; (await db.get("customers", { referral_code: code })) || (await db.get("discount_codes", { code })); i++) code = `${base}${phone.slice(-3)}${i + 2}`;
  return code;
}

export async function ensureReferralCode(c: Customer): Promise<string> {
  if (c.referral_code) return c.referral_code;
  const code = await makeReferralCode(c.name, c.phone);
  await db.update("customers", { id: c.id }, { referral_code: code });
  return code;
}

// ── Checking a code ─────────────────────────────────────────────────────
async function timesUsed(code: string) {
  return (await db.list<Order>("orders", { eq: { promo_code: code } })).filter((o) => o.status !== "draft" || o.whatsapp_clicked_at).length;
}

async function hasPaidOrders(phone: string) {
  const orders = await db.list<Order>("orders", { eq: { customer_phone: phone } });
  if (!orders.length) return false;
  const pays = await db.list<Payment>("payments", { in: { column: "order_id", values: orders.map((o) => o.id) } });
  return pays.some((p) => p.status === "approved");
}

/** Validates a discount or referral code for a customer (phone optional). */
export async function checkPromo(raw: string, phone?: string | null): Promise<PromoCheck> {
  const code = normalizeCode(raw);
  if (!CODE_RE.test(code)) return { ok: false, error: "That code doesn't look right." };
  const today = lkDate(new Date());

  const d = await db.get<DiscountCode>("discount_codes", { code });
  if (d) {
    if (!d.active) return { ok: false, error: "That code is no longer active." };
    if (d.starts_on && today < d.starts_on) return { ok: false, error: "That code isn't active yet." };
    if (d.ends_on && today > d.ends_on) return { ok: false, error: "That code has expired." };
    if (d.max_uses && (await timesUsed(code)) >= d.max_uses) return { ok: false, error: "That code has been fully used." };
    const label = d.kind === "percent" ? `${d.value}% off` : `${lkr(d.value)} off`;
    return { ok: true, code, kind: "discount", type: d.kind, value: d.value, minTotal: d.min_total, label: d.min_total ? `${label} orders over ${lkr(d.min_total)}` : label };
  }

  const owner = await db.get<Customer>("customers", { referral_code: code });
  if (owner) {
    if (phone && phone === owner.phone) return { ok: false, error: "You can't use your own referral code — share it with a friend." };
    if (phone && (await hasPaidOrders(phone))) return { ok: false, error: "Referral codes are for a friend's first order." };
    return { ok: true, code, kind: "referral", type: "fixed", value: referral.friendDiscount, minTotal: 0, label: `${lkr(referral.friendDiscount)} off your first order`, referrerPhone: owner.phone };
  }
  return { ok: false, error: "We couldn't find that code." };
}

/** Saves a (re-validated) code onto an order. Invalid codes are ignored, never fatal. */
export async function attachPromo(orderId: string, raw: string | null | undefined, phone: string | null) {
  if (!raw) return null;
  const r = await checkPromo(raw, phone);
  if (!r.ok) return null;
  await db.update("orders", { id: orderId }, { promo_code: r.code, promo_kind: r.kind, promo_label: r.label, referrer_phone: r.kind === "referral" ? r.referrerPhone : null });
  return r;
}

/** Re-reads an order's code as it was applied (for the admin's quotation). */
export async function promoForOrder(order: Order): Promise<PromoCheck | null> {
  if (!order.promo_code) return null;
  if (order.promo_kind === "referral") return { ok: true, code: order.promo_code, kind: "referral", type: "fixed", value: referral.friendDiscount, minTotal: 0, label: order.promo_label ?? "", referrerPhone: order.referrer_phone ?? undefined };
  const d = await db.get<DiscountCode>("discount_codes", { code: order.promo_code });
  if (!d) return null;
  return { ok: true, code: d.code, kind: "discount", type: d.kind, value: d.value, minTotal: d.min_total, label: order.promo_label ?? "" };
}

// ── Rewards ─────────────────────────────────────────────────────────────
/** Called when a payment is confirmed: the referrer earns their credit on the friend's first payment. */
export async function rewardReferrer(order: Order) {
  if (order.promo_kind !== "referral" || !order.referrer_phone) return;
  if (await db.get("referral_rewards", { order_code: order.code })) return;
  await db.insert<ReferralReward>("referral_rewards", {
    referrer_phone: order.referrer_phone,
    referred_phone: order.customer_phone,
    order_code: order.code,
    amount: referral.reward,
    status: "earned",
    used_in: null,
  });
}

export async function creditFor(phone: string) {
  const rows = await db.list<ReferralReward>("referral_rewards", { eq: { referrer_phone: phone } });
  return { rows, available: rows.filter((r) => r.status === "earned").reduce((a, r) => a + r.amount, 0) };
}

/** Marks all available credit as spent on a document. */
export async function useCredit(phone: string, docNumber: string) {
  for (const r of await db.list<ReferralReward>("referral_rewards", { eq: { referrer_phone: phone, status: "earned" } })) {
    await db.update("referral_rewards", { id: r.id }, { status: "used", used_in: docNumber });
  }
}

// ── Admin: discount codes ───────────────────────────────────────────────
export async function saveDiscountCode(input: Omit<DiscountCode, "id" | "created_at"> & { id?: string | null }, actor: string) {
  const code = normalizeCode(input.code);
  if (!CODE_RE.test(code)) throw new ServiceError("Codes use 3–20 letters, numbers or dashes");
  if (input.kind === "percent" && (input.value < 1 || input.value > 90)) throw new ServiceError("Percent codes are between 1% and 90%");
  const clash = await db.get<DiscountCode>("discount_codes", { code });
  if (clash && clash.id !== input.id) throw new ServiceError(`${code} already exists`);
  if (await db.get("customers", { referral_code: code })) throw new ServiceError(`${code} is a customer's referral code`);
  const { id, ...row } = { ...input, code };
  if (id) await db.update("discount_codes", { id }, row);
  else await db.insert("discount_codes", row);
  await audit(actor, id ? "discount.update" : "discount.create", "discount_code", code);
}

export async function listDiscountCodes() {
  const [codes, orders] = await Promise.all([db.list<DiscountCode>("discount_codes", { order: { column: "created_at", ascending: false } }), db.list<Order>("orders")]);
  return codes.map((c) => ({ ...c, uses: orders.filter((o) => o.promo_code === c.code && (o.status !== "draft" || o.whatsapp_clicked_at)).length }));
}
