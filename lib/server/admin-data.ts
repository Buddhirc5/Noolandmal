import "server-only";
import { db } from "./db";
import { listDesigns, loadSettings } from "./catalog";
import { weekKey } from "./orders";
import type { Configuration, CustomRequest, MeasurementBooking, MeasurementSlot, Order, Payment, Quote } from "@/lib/types";

export interface OrderRow {
  order: Order;
  title: string;
  estimate: string | null;
  quote: Quote | null;
  pendingSlips: number;
}

export async function listOrderRows(): Promise<OrderRow[]> {
  const [orders, configs, requests, quotes, payments, designs] = await Promise.all([
    db.list<Order>("orders", { order: { column: "created_at", ascending: false } }),
    db.list<Configuration>("configurations"),
    db.list<CustomRequest>("custom_requests"),
    db.list<Quote>("quotes"),
    db.list<Payment>("payments", { eq: { status: "pending" } }),
    listDesigns({ includeUnpublished: true }),
  ]);
  const cfg = new Map(configs.map((c) => [c.id, c]));
  const req = new Map(requests.map((r) => [r.id, r]));
  const dname = new Map(designs.map((d) => [d.id, d.name]));
  return orders.map((o) => {
    const c = o.configuration_id ? cfg.get(o.configuration_id) : undefined;
    const r = o.custom_request_id ? req.get(o.custom_request_id) : undefined;
    const q = quotes.filter((x) => x.order_id === o.id && x.status !== "superseded").sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0] ?? null;
    return {
      order: o,
      title: c ? (dname.get(c.design_id) ?? c.design_slug) : r ? `Custom: ${r.occasion || "request"}` : o.title || o.code,
      estimate: c ? `from ${c.price_min.toLocaleString("en-LK")}` : r?.budget ?? null,
      quote: q,
      pendingSlips: payments.filter((p) => p.order_id === o.id).length,
    };
  });
}

export async function dashboardStats() {
  const [rows, settings, bookings, slots] = await Promise.all([
    listOrderRows(),
    loadSettings(),
    db.list<MeasurementBooking>("measurement_bookings", { eq: { status: "booked" } }),
    db.list<MeasurementSlot>("measurement_slots"),
  ]);
  const thisWeek = weekKey(new Date());
  const slotById = new Map(slots.map((s) => [s.id, s]));
  const bookedThisWeek = bookings.filter((b) => {
    const s = slotById.get(b.slot_id);
    return s && weekKey(new Date(s.starts_at)) === thisWeek;
  }).length;
  const byStatus: Record<string, number> = {};
  for (const r of rows) byStatus[r.order.status] = (byStatus[r.order.status] ?? 0) + 1;
  return {
    rows,
    newRequests: rows.filter((r) => r.order.status === "quote_requested"),
    pendingSlips: rows.reduce((a, r) => a + r.pendingSlips, 0),
    bookedThisWeek,
    capacity: settings.weekly_capacity,
    byStatus,
    drafts: rows.filter((r) => r.order.status === "draft").length,
  };
}
