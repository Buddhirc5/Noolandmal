import "server-only";
import { db } from "./db";
import { loadCatalog, loadSettings, getDesignBundle } from "./catalog";
import { putFile } from "./storage";
import { processImage } from "./images";
import { computePrice, validateSelections } from "@/lib/pricing";
import { generateAccessKey, generateCode, safeEqual, type CodePrefix } from "@/lib/codes";
import { normalizePhone, toISODate } from "@/lib/format";
import type {
  Configuration,
  CustomRequest,
  MeasurementBooking,
  MeasurementSlot,
  Order,
  OrderStatus,
  Payment,
  Quote,
  RequestFile,
  Selections,
} from "@/lib/types";

export class ServiceError extends Error {
  constructor(
    message: string,
    public status = 400,
    public details?: string[],
  ) {
    super(message);
  }
}

async function uniqueCode(prefix: CodePrefix): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = generateCode(prefix);
    if (!(await db.get("orders", { code }))) return code;
  }
  throw new ServiceError("Could not allocate a code, please retry", 503);
}

export async function logEvent(type: string, code: string | null, guestId: string | null, meta: Record<string, unknown> = {}) {
  try {
    await db.insert("events", { type, code, guest_id: guestId, meta });
  } catch (e) {
    console.error("event log failed", e);
  }
}

export async function audit(actor: string, action: string, entity: string, entityId: string | null, detail: Record<string, unknown> = {}) {
  await db.insert("admin_audit_log", { actor, action, entity, entity_id: entityId, detail });
}

// ── Configurations (customiser) ─────────────────────────────────────────
export async function createConfiguration(input: {
  slug: string;
  selections: Selections;
  clientTotal: number;
  guestId: string | null;
  userId: string | null;
  name: string;
  phone: string;
  promoCode?: string | null;
}): Promise<{ config: Configuration; order: Order }> {
  const bundle = await getDesignBundle(input.slug);
  if (!bundle) throw new ServiceError("Design not found", 404);
  const catalog = await loadCatalog();
  const v = validateSelections(catalog, bundle.design, bundle.regions, input.selections);
  if (!v.ok) throw new ServiceError("Some choices aren't available", 422, v.errors);
  // Server is the source of truth for price. If the browser's figure differs
  // (stale catalogue or tampering) we refuse and send back the right price.
  const price = computePrice(catalog, bundle.design, input.selections);
  if (Math.round(input.clientTotal) !== price.total) {
    throw new ServiceError("The price has changed. Please review the updated estimate.", 409, [String(price.total)]);
  }
  const code = await uniqueCode("NM");
  const config = await db.insert<Configuration>("configurations", {
    code,
    design_id: bundle.design.id,
    design_slug: bundle.design.slug,
    guest_id: input.guestId,
    user_id: input.userId,
    selections: input.selections,
    price_min: price.min,
    price_max: price.max,
    price_total: price.total,
    price_breakdown: price,
    notes: input.selections.notes,
    needed_by: input.selections.neededBy,
  });
  const order = await db.insert<Order>("orders", {
    code,
    access_key: generateAccessKey(),
    kind: "design",
    configuration_id: config.id,
    custom_request_id: null,
    guest_id: input.guestId,
    user_id: input.userId,
    customer_name: input.name,
    customer_phone: input.phone ? normalizePhone(input.phone) : "",
    status: "draft",
    status_history: [{ status: "draft", at: new Date().toISOString() }],
    fulfilment: "pickup",
    district: null,
    delivery_address: null,
    internal_notes: "",
    whatsapp_clicked_at: null,
    paid_in_full: false,
  });
  if (input.phone) await import("./customers").then((m) => m.ensureCustomer(input.phone, input.name)).catch(() => null);
  if (input.promoCode) await import("./promos").then((m) => m.attachPromo(order.id, input.promoCode, input.phone ? normalizePhone(input.phone) : null)).catch(() => null);
  await logEvent("configuration_saved", code, input.guestId, { slug: input.slug, total: price.total });
  return { config, order };
}

export async function getConfiguration(code: string) {
  return db.get<Configuration>("configurations", { code });
}

// ── Custom requests ─────────────────────────────────────────────────────
export async function createCustomRequest(input: {
  name: string;
  phone: string;
  occasion: string;
  neededBy: string | null;
  budget: string | null;
  referenceUrl: string | null;
  notes: string;
  sizeNotes: string;
  files: File[];
  guestId: string | null;
  userId: string | null;
}): Promise<{ request: CustomRequest; order: Order; fileCount: number }> {
  // Validate & process every photo before writing anything
  const processed = [];
  for (const f of input.files) processed.push(await processImage(f));

  const code = await uniqueCode("CR");
  const request = await db.insert<CustomRequest>("custom_requests", {
    code,
    guest_id: input.guestId,
    user_id: input.userId,
    name: input.name,
    phone: normalizePhone(input.phone),
    reference_url: input.referenceUrl,
    notes: input.notes,
    occasion: input.occasion,
    budget: input.budget,
    needed_by: input.neededBy,
    size_notes: input.sizeNotes,
    status: "new",
  });
  let i = 0;
  for (const p of processed) {
    const path = `${code}/${Date.now()}-${i++}.${p.ext}`;
    await putFile("references", path, p.data, p.contentType);
    await db.insert<RequestFile>("request_files", { custom_request_id: request.id, path, content_type: p.contentType, size: p.data.length });
  }
  const now = new Date().toISOString();
  const order = await db.insert<Order>("orders", {
    code,
    access_key: generateAccessKey(),
    kind: "custom",
    configuration_id: null,
    custom_request_id: request.id,
    guest_id: input.guestId,
    user_id: input.userId,
    customer_name: input.name,
    customer_phone: normalizePhone(input.phone),
    status: "quote_requested",
    status_history: [{ status: "quote_requested", at: now }],
    fulfilment: "pickup",
    district: null,
    delivery_address: null,
    internal_notes: "",
    whatsapp_clicked_at: null,
    paid_in_full: false,
  });
  await logEvent("custom_request_created", code, input.guestId, { photos: processed.length, link: Boolean(input.referenceUrl) });
  return { request, order, fileCount: processed.length };
}

// ── Orders ──────────────────────────────────────────────────────────────
export async function getOrder(code: string) {
  return db.get<Order>("orders", { code });
}

export function canAccess(order: Order, ctx: { key?: string | null; guestId?: string | null; userId?: string | null; admin?: string | null }) {
  if (ctx.admin) return true;
  if (ctx.key && safeEqual(ctx.key, order.access_key)) return true;
  if (ctx.guestId && order.guest_id && ctx.guestId === order.guest_id) return true;
  if (ctx.userId && order.user_id && ctx.userId === order.user_id) return true;
  return false;
}

export async function setStatus(order: Order, status: OrderStatus, by?: string): Promise<Order> {
  if (order.status === status) return order;
  const history = [...(order.status_history ?? []), { status, at: new Date().toISOString(), ...(by ? { by } : {}) }];
  const [o] = await db.update<Order>("orders", { id: order.id }, { status, status_history: history });
  return o;
}

export async function markWhatsAppClicked(code: string, guestId: string | null, kind: string) {
  const order = await getOrder(code);
  if (!order) throw new ServiceError("Not found", 404);
  let o = order;
  if (order.status === "draft") o = await setStatus(order, "quote_requested");
  await db.update<Order>("orders", { id: order.id }, { whatsapp_clicked_at: new Date().toISOString() });
  await logEvent("whatsapp_click", code, guestId, { kind, status: "sent_to_whatsapp" });
  return o;
}

// ── Quotes ──────────────────────────────────────────────────────────────
export async function currentQuote(orderId: string): Promise<Quote | null> {
  const quotes = await db.list<Quote>("quotes", { eq: { order_id: orderId }, order: { column: "created_at", ascending: false } });
  return quotes.find((q) => q.status !== "superseded") ?? null;
}

export async function issueQuote(
  order: Order,
  input: { amount: number; advancePercent: number; deliveryFee: number; validDays: number; note: string; fulfilment: "pickup" | "delivery"; district: string | null },
  actor: string,
): Promise<Quote> {
  const prev = await db.list<Quote>("quotes", { eq: { order_id: order.id } });
  for (const q of prev) if (q.status !== "superseded") await db.update("quotes", { id: q.id }, { status: "superseded" });
  const total = input.amount + input.deliveryFee;
  const valid = new Date();
  valid.setDate(valid.getDate() + input.validDays);
  const quote = await db.insert<Quote>("quotes", {
    order_id: order.id,
    amount: input.amount,
    advance_percent: input.advancePercent,
    advance_amount: Math.round((total * input.advancePercent) / 100 / 100) * 100,
    delivery_fee: input.deliveryFee,
    valid_until: toISODate(valid),
    status: "issued",
    note: input.note,
    accepted_at: null,
  });
  await db.update<Order>("orders", { id: order.id }, { fulfilment: input.fulfilment, district: input.district });
  if (["draft", "quote_requested", "quoted"].includes(order.status)) await setStatus(order, "quoted", actor);
  await audit(actor, "quote.issue", "order", order.code, { amount: input.amount, delivery: input.deliveryFee });
  return quote;
}

export async function acceptQuote(order: Order): Promise<Quote> {
  const q = await currentQuote(order.id);
  if (!q) throw new ServiceError("No quote to accept", 404);
  if (q.valid_until < toISODate(new Date()) && q.status === "issued") throw new ServiceError("This quote has expired — message us for an updated one.", 410);
  if (q.status === "accepted") return q;
  const [u] = await db.update<Quote>("quotes", { id: q.id }, { status: "accepted", accepted_at: new Date().toISOString() });
  await logEvent("quote_accepted", order.code, null);
  return u;
}

// ── Payments ────────────────────────────────────────────────────────────
export async function submitSlip(order: Order, type: "advance" | "final", file: File): Promise<Payment> {
  const q = await currentQuote(order.id);
  if (!q || q.status !== "accepted") throw new ServiceError("Please accept the quote first.", 409);
  const pending = await db.list<Payment>("payments", { eq: { order_id: order.id, type, status: "pending" } });
  if (pending.length) throw new ServiceError("A slip is already waiting for review.", 409);
  if (type === "advance" && (await db.list<Payment>("payments", { eq: { order_id: order.id, type: "advance", status: "approved" } })).length)
    throw new ServiceError("Your advance is already confirmed.", 409);
  const img = await processImage(file, 2400);
  const path = `${order.code}/${type}-${Date.now()}.${img.ext}`;
  await putFile("slips", path, img.data, img.contentType);
  const total = q.amount + q.delivery_fee;
  const amount = type === "advance" ? q.advance_amount : total - q.advance_amount;
  const p = await db.insert<Payment>("payments", {
    order_id: order.id,
    quote_id: q.id,
    type,
    amount,
    slip_path: path,
    status: "pending",
    reject_reason: null,
    reviewed_by: null,
    reviewed_at: null,
  });
  await logEvent("slip_uploaded", order.code, null, { type });
  return p;
}

export async function reviewPayment(paymentId: string, approve: boolean, reason: string | null, actor: string) {
  const p = await db.get<Payment>("payments", { id: paymentId });
  if (!p) throw new ServiceError("Payment not found", 404);
  if (p.status !== "pending") throw new ServiceError("Already reviewed", 409);
  await db.update<Payment>("payments", { id: p.id }, {
    status: approve ? "approved" : "rejected",
    reject_reason: approve ? null : reason || "Slip could not be verified",
    reviewed_by: actor,
    reviewed_at: new Date().toISOString(),
  });
  const order = await db.get<Order>("orders", { id: p.order_id });
  if (order && approve) {
    if (p.type === "advance" && ["draft", "quote_requested", "quoted"].includes(order.status)) await setStatus(order, "advance_paid", actor);
    if (p.type === "final") await db.update<Order>("orders", { id: order.id }, { paid_in_full: true });
    await import("./promos").then((m) => m.rewardReferrer(order)).catch(() => null);
  }
  await audit(actor, approve ? "payment.approve" : "payment.reject", "payment", p.id, { order: order?.code, type: p.type, reason });
}

// ── Measurement booking ─────────────────────────────────────────────────
export function weekKey(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  return toISODate(x);
}

export interface SlotView extends MeasurementSlot {
  remaining: number;
  weekFull: boolean;
}

export async function availableSlots(): Promise<SlotView[]> {
  const settings = await loadSettings();
  const now = new Date();
  const slots = (await db.list<MeasurementSlot>("measurement_slots", { order: { column: "starts_at" } })).filter((s) => new Date(s.starts_at) > now);
  const bookings = (await db.list<MeasurementBooking>("measurement_bookings", { eq: { status: "booked" } }));
  const perSlot = new Map<string, number>();
  const perWeek = new Map<string, number>();
  const allSlots = await db.list<MeasurementSlot>("measurement_slots");
  const allById = new Map(allSlots.map((s) => [s.id, s]));
  for (const b of bookings) {
    perSlot.set(b.slot_id, (perSlot.get(b.slot_id) ?? 0) + 1);
    const s = allById.get(b.slot_id);
    if (s) {
      const wk = weekKey(new Date(s.starts_at));
      perWeek.set(wk, (perWeek.get(wk) ?? 0) + 1);
    }
  }
  return slots.map((s) => ({
    ...s,
    remaining: Math.max(0, s.capacity - (perSlot.get(s.id) ?? 0)),
    weekFull: (perWeek.get(weekKey(new Date(s.starts_at))) ?? 0) >= settings.weekly_capacity,
  }));
}

export async function bookSlot(order: Order, slotId: string, mode: "studio" | "home", address: string | null) {
  if (!["advance_paid", "measurement_booked"].includes(order.status)) throw new ServiceError("Booking opens once your advance is confirmed.", 409);
  const slots = await availableSlots();
  const slot = slots.find((s) => s.id === slotId);
  if (!slot) throw new ServiceError("That slot is no longer available.", 409);
  if (slot.remaining <= 0 || slot.weekFull) throw new ServiceError("That week is fully booked — please choose the next available week.", 409);
  if (mode === "home" && !address) throw new ServiceError("Please add your address for a home visit.", 422);
  const existing = await db.list<MeasurementBooking>("measurement_bookings", { eq: { order_id: order.id, status: "booked" } });
  for (const b of existing) await db.update("measurement_bookings", { id: b.id }, { status: "cancelled" });
  const booking = await db.insert<MeasurementBooking>("measurement_bookings", { slot_id: slotId, order_id: order.id, mode, address, status: "booked" });
  await setStatus(order, "measurement_booked");
  await logEvent("measurement_booked", order.code, null, { slot: slot.starts_at, mode });
  return booking;
}

export async function orderBooking(orderId: string) {
  const b = (await db.list<MeasurementBooking>("measurement_bookings", { eq: { order_id: orderId, status: "booked" } }))[0];
  if (!b) return null;
  const slot = await db.get<MeasurementSlot>("measurement_slots", { id: b.slot_id });
  return { booking: b, slot };
}

/** Admin: create slots from a weekly template for the next N weeks (skips duplicates). */
export async function generateSlots(template: { weekday: number; time: string; mode: "studio" | "home"; capacity: number }[], weeks: number, actor: string) {
  const existing = new Set((await db.list<MeasurementSlot>("measurement_slots")).map((s) => s.starts_at));
  const start = new Date();
  let created = 0;
  for (let d = 1; d <= weeks * 7; d++) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + d);
    for (const t of template) {
      if (day.getDay() !== t.weekday) continue;
      // times are Colombo local (UTC+05:30)
      const iso = new Date(`${toISODate(day)}T${t.time}:00+05:30`).toISOString();
      if (existing.has(iso)) continue;
      await db.insert("measurement_slots", { starts_at: iso, mode: t.mode, capacity: t.capacity });
      created++;
    }
  }
  await audit(actor, "slots.generate", "measurement_slots", null, { weeks, created });
  return created;
}
