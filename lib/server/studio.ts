import "server-only";
// Studio back-office: WhatsApp is where Roshini talks to customers and takes
// payment; these helpers let her record what happened so the admin stays the
// source of truth for orders, measurements, money in and money out.
import { db } from "./db";
import { audit, currentQuote, ServiceError, setStatus } from "./orders";
import { listOrderRows } from "./admin-data";
import { ensureCustomer } from "./customers";
import { generateAccessKey, generateCode } from "@/lib/codes";
import { normalizePhone } from "@/lib/format";
import type { CustomerMeasurement, EventRow, Expense, ExpenseCategory, MeasurementKey, Order, OrderStatus, Payment } from "@/lib/types";

const TZ = "Asia/Colombo";
/** YYYY-MM-DD in Sri Lanka time. */
export const lkDate = (iso: string | Date) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
export const lkMonth = (iso: string | Date) => lkDate(iso).slice(0, 7);

const ACTIVE: OrderStatus[] = ["advance_paid", "measurement_booked", "measured", "cutting", "sewing", "fitting", "ready"];
const DONE: OrderStatus[] = ["delivered", "collected"];

// ── Tickets ─────────────────────────────────────────────────────────────
export async function markReceived(order: Order, actor: string) {
  await db.update<Order>("orders", { id: order.id }, { received_at: new Date().toISOString() });
  if (order.status === "draft") await setStatus(order, "quote_requested", actor);
  await audit(actor, "order.received", "order", order.code);
}

export async function createManualOrder(
  input: { name: string; phone: string; title: string; details: string; neededBy: string | null; designId: string | null },
  actor: string,
): Promise<Order> {
  let code = generateCode("NM");
  for (let i = 0; i < 6 && (await db.get("orders", { code })); i++) code = generateCode("NM");
  const now = new Date().toISOString();
  const order = await db.insert<Order>("orders", {
    code,
    access_key: generateAccessKey(),
    kind: "manual",
    title: input.title,
    details: input.details,
    needed_by: input.neededBy,
    received_at: now,
    configuration_id: null,
    custom_request_id: null,
    guest_id: null,
    user_id: null,
    customer_name: input.name,
    customer_phone: input.phone ? normalizePhone(input.phone) : "",
    status: "quote_requested",
    status_history: [{ status: "quote_requested", at: now, by: actor }],
    fulfilment: "pickup",
    district: null,
    delivery_address: null,
    internal_notes: input.designId ? `Based on catalogue design ${input.designId}` : "",
    whatsapp_clicked_at: null,
    paid_in_full: false,
  });
  await ensureCustomer(input.phone, input.name);
  await audit(actor, "order.create_manual", "order", code, { title: input.title });
  return order;
}

// ── Payments received on WhatsApp ───────────────────────────────────────
export async function recordPayment(order: Order, input: { type: "advance" | "final"; amount: number; paidOn: string }, actor: string) {
  const q = await currentQuote(order.id);
  await db.insert<Payment>("payments", {
    order_id: order.id,
    quote_id: q?.id ?? null,
    type: input.type,
    amount: input.amount,
    slip_path: "",
    method: "whatsapp",
    paid_on: input.paidOn,
    status: "approved",
    reject_reason: null,
    reviewed_by: actor,
    reviewed_at: new Date().toISOString(),
  });
  if (q && q.status === "issued") await db.update("quotes", { id: q.id }, { status: "accepted", accepted_at: new Date().toISOString() });
  if (input.type === "advance" && ["draft", "quote_requested", "quoted"].includes(order.status)) await setStatus(order, "advance_paid", actor);
  if (input.type === "final") await db.update<Order>("orders", { id: order.id }, { paid_in_full: true });
  await audit(actor, "payment.record", "order", order.code, { type: input.type, amount: input.amount });
}

export async function removePayment(paymentId: string, actor: string) {
  const p = await db.get<Payment>("payments", { id: paymentId });
  if (!p || p.method !== "whatsapp") throw new ServiceError("Only payments recorded here can be removed", 400);
  await db.remove("payments", { id: paymentId });
  if (p.type === "final") await db.update<Order>("orders", { id: p.order_id }, { paid_in_full: false });
  await audit(actor, "payment.remove", "payment", p.id, { amount: p.amount });
}

export function paymentsTotal(payments: Payment[]) {
  return payments.filter((p) => p.status === "approved").reduce((a, p) => a + p.amount, 0);
}

// ── Measurements ────────────────────────────────────────────────────────
export async function getMeasurements(phone: string) {
  if (!phone) return null;
  return db.get<CustomerMeasurement>("customer_measurements", { phone });
}

export async function saveMeasurements(input: { phone: string; name: string; values: Partial<Record<MeasurementKey, number>>; notes: string; takenOn: string | null }, actor: string) {
  const phone = normalizePhone(input.phone);
  const existing = await getMeasurements(phone);
  const row = { name: input.name, values: input.values, notes: input.notes, taken_on: input.takenOn, updated_at: new Date().toISOString() };
  await ensureCustomer(phone, input.name);
  if (existing) await db.update("customer_measurements", { id: existing.id }, row);
  else await db.insert("customer_measurements", { phone, ...row });
  await audit(actor, "measurements.save", "customer", phone);
}

// ── Expenses ────────────────────────────────────────────────────────────
export async function addExpense(input: { spentOn: string; category: ExpenseCategory; amount: number; note: string }, actor: string) {
  await db.insert<Expense>("expenses", { spent_on: input.spentOn, category: input.category, amount: input.amount, note: input.note });
  await audit(actor, "expense.add", "expense", null, input);
}

export async function deleteExpense(id: string, actor: string) {
  await db.remove("expenses", { id });
  await audit(actor, "expense.delete", "expense", id);
}

// ── Finance ─────────────────────────────────────────────────────────────
export interface MonthRow {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  profit: number;
  orders: number;
  byCategory: Record<string, number>;
}

export async function financeByMonth(months = 12) {
  const [payments, expenses, orders] = await Promise.all([
    db.list<Payment>("payments", { eq: { status: "approved" } }),
    db.list<Expense>("expenses", { order: { column: "spent_on", ascending: false } }),
    db.list<Order>("orders"),
  ]);
  const keys: string[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) keys.push(lkMonth(new Date(now.getFullYear(), now.getMonth() - i, 15)));
  const rows = new Map<string, MonthRow>(keys.map((k) => [k, { month: k, income: 0, expenses: 0, profit: 0, orders: 0, byCategory: {} }]));
  for (const p of payments) {
    const r = rows.get((p.paid_on ?? lkDate(p.created_at)).slice(0, 7));
    if (r) r.income += p.amount;
  }
  for (const e of expenses) {
    const r = rows.get(e.spent_on.slice(0, 7));
    if (!r) continue;
    r.expenses += e.amount;
    r.byCategory[e.category] = (r.byCategory[e.category] ?? 0) + e.amount;
  }
  // an order "counts" in the month its advance (or first payment) arrived
  const firstPay = new Map<string, string>();
  for (const p of payments) {
    const d = p.paid_on ?? lkDate(p.created_at);
    const prev = firstPay.get(p.order_id);
    if (!prev || d < prev) firstPay.set(p.order_id, d);
  }
  for (const o of orders) {
    const d = firstPay.get(o.id);
    const r = d ? rows.get(d.slice(0, 7)) : undefined;
    if (r) r.orders += 1;
  }
  for (const r of rows.values()) r.profit = r.income - r.expenses;
  const list = [...rows.values()];
  return {
    months: list,
    expenses,
    totals: {
      income: list.reduce((a, r) => a + r.income, 0),
      expenses: list.reduce((a, r) => a + r.expenses, 0),
      profit: list.reduce((a, r) => a + r.profit, 0),
      orders: list.reduce((a, r) => a + r.orders, 0),
    },
  };
}

// ── Analytics ───────────────────────────────────────────────────────────
export async function analytics(days: number) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const [events, rows, payments] = await Promise.all([db.list<EventRow>("events"), listOrderRows(), db.list<Payment>("payments", { eq: { status: "approved" } })]);
  const inRange = events.filter((e) => e.created_at >= since);
  const views = inRange.filter((e) => e.type === "page_view");
  const visitors = new Set(views.map((e) => e.guest_id ?? e.id));

  // daily unique visitors
  const dayKeys: string[] = [];
  for (let i = days - 1; i >= 0; i--) dayKeys.push(lkDate(new Date(Date.now() - i * 86_400_000)));
  const perDay = new Map<string, Set<string>>(dayKeys.map((k) => [k, new Set()]));
  for (const v of views) perDay.get(lkDate(v.created_at))?.add(v.guest_id ?? v.id);
  const daily = dayKeys.map((d) => ({ date: d, visitors: perDay.get(d)!.size }));

  // design interest: product page views vs codes made
  const designViews = new Map<string, number>();
  for (const v of views) {
    const m = String((v.meta as { path?: string })?.path ?? "").match(/^\/collection\/([a-z0-9-]+)/);
    if (m) designViews.set(m[1], (designViews.get(m[1]) ?? 0) + 1);
  }
  const designCodes = new Map<string, number>();
  for (const e of inRange.filter((x) => x.type === "configuration_saved")) {
    const slug = String((e.meta as { slug?: string })?.slug ?? "");
    if (slug) designCodes.set(slug, (designCodes.get(slug) ?? 0) + 1);
  }
  const slugs = new Set([...designViews.keys(), ...designCodes.keys()]);
  const designs = [...slugs].map((slug) => ({ slug, views: designViews.get(slug) ?? 0, codes: designCodes.get(slug) ?? 0 })).sort((a, b) => b.views + b.codes * 5 - (a.views + a.codes * 5));

  const recent = rows.filter((r) => r.order.created_at >= since);
  const online = recent.filter((r) => r.order.kind !== "manual");
  const paidOrderIds = new Set(payments.map((p) => p.order_id));
  const funnel = [
    { label: "Visitors", value: visitors.size },
    { label: "Viewed a design", value: new Set(views.filter((v) => String((v.meta as { path?: string })?.path ?? "").startsWith("/collection/")).map((v) => v.guest_id ?? v.id)).size },
    { label: "Made a code", value: online.length },
    { label: "Sent on WhatsApp", value: online.filter((r) => r.order.whatsapp_clicked_at || r.order.received_at).length },
    { label: "Received by studio", value: online.filter((r) => r.order.received_at).length },
    { label: "Confirmed (paid)", value: online.filter((r) => paidOrderIds.has(r.order.id)).length },
  ];
  const income = payments.filter((p) => (p.paid_on ?? lkDate(p.created_at)) >= lkDate(since)).reduce((a, p) => a + p.amount, 0);
  return {
    pageViews: views.length,
    visitors: visitors.size,
    daily,
    designs,
    funnel,
    orders: recent.length,
    manualOrders: recent.filter((r) => r.order.kind === "manual").length,
    income,
  };
}

export async function ticketCounts() {
  const rows = await listOrderRows();
  const open = rows.filter((r) => !["cancelled", ...DONE].includes(r.order.status));
  return {
    rows,
    notReceived: open.filter((r) => !r.order.received_at && ["draft", "quote_requested"].includes(r.order.status)),
    toQuote: open.filter((r) => r.order.received_at && r.order.status === "quote_requested"),
    quoted: open.filter((r) => r.order.status === "quoted"),
    active: open.filter((r) => ACTIVE.includes(r.order.status)),
    awaitingBalance: rows.filter((r) => !r.order.paid_in_full && ["ready", ...DONE].includes(r.order.status)),
  };
}
