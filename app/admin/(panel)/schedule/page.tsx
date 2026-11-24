import Link from "next/link";
import { db } from "@/lib/server/db";
import { loadSettings } from "@/lib/server/catalog";
import { weekKey } from "@/lib/server/orders";
import { DeleteSlot, SlotGenerator } from "@/components/admin/SchedulePanel";
import { formatDate, formatDateTime } from "@/lib/format";
import type { MeasurementBooking, MeasurementSlot, Order } from "@/lib/types";

export const metadata = { title: "Measurements" };

export default async function Schedule() {
  const [slots, bookings, orders, settings] = await Promise.all([
    db.list<MeasurementSlot>("measurement_slots", { order: { column: "starts_at" } }),
    db.list<MeasurementBooking>("measurement_bookings", { eq: { status: "booked" } }),
    db.list<Order>("orders"),
    loadSettings(),
  ]);
  const now = new Date();
  const upcoming = slots.filter((s) => new Date(s.starts_at) > new Date(now.getTime() - 86400000));
  const orderById = new Map(orders.map((o) => [o.id, o]));
  const weeks = new Map<string, MeasurementSlot[]>();
  for (const s of upcoming) {
    const k = weekKey(new Date(s.starts_at));
    weeks.set(k, [...(weeks.get(k) ?? []), s]);
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-semibold text-green-900">Measurement schedule</h1>
        <p className="mt-1 text-sm text-muted">
          Weekly capacity: <b>{settings.weekly_capacity}</b> orders (change it in Catalog → Settings). When a week is full, customers are offered the next week.
        </p>
      </div>
      <SlotGenerator />
      {[...weeks].map(([wk, list]) => {
        const booked = list.flatMap((s) => bookings.filter((b) => b.slot_id === s.id));
        return (
          <section key={wk} className="card p-5">
            <h2 className="flex items-center justify-between font-semibold text-green-900">
              Week of {formatDate(wk)}
              <span className={`badge ${booked.length >= settings.weekly_capacity ? "" : "bg-green-50 text-green-900"}`}>
                {booked.length} / {settings.weekly_capacity} booked
              </span>
            </h2>
            <ul className="mt-3 divide-y divide-line text-sm">
              {list.map((s) => {
                const bs = bookings.filter((b) => b.slot_id === s.id);
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 py-2">
                    <span className="w-44">{formatDateTime(s.starts_at)}</span>
                    <span className="badge">{s.mode === "home" ? "Home visit" : "Studio"}</span>
                    <span className="text-muted">
                      {bs.length}/{s.capacity}
                    </span>
                    {bs.map((b) => {
                      const o = orderById.get(b.order_id);
                      return (
                        <Link key={b.id} href={`/admin/orders/${o?.code}`} className="text-green-700 underline">
                          {o?.code} {o?.customer_name}
                        </Link>
                      );
                    })}
                    {!bs.length && (
                      <span className="ml-auto">
                        <DeleteSlot id={s.id} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {!weeks.size && <p className="card p-6 text-sm text-muted">No upcoming slots. Create some from the template above.</p>}
    </div>
  );
}
