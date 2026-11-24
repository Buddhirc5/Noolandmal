import Link from "next/link";
import { listOrderRows } from "@/lib/server/admin-data";
import { STATUS_INFO } from "@/lib/status";
import { lkr } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const metadata = { title: "Orders" };
const COLUMNS: OrderStatus[] = ["quoted", "advance_paid", "measurement_booked", "measured", "cutting", "sewing", "fitting", "ready", "delivered", "collected"];

export default async function Orders() {
  const rows = await listOrderRows();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl font-semibold text-green-900">Orders board</h1>
        <p className="mt-1 text-sm text-muted">Quoted orders through to delivery. Open a card to change its status. New requests live in the inbox.</p>
      </div>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
        {COLUMNS.map((col) => {
          const items = rows.filter((r) => r.order.status === col);
          return (
            <section key={col} className="w-64 shrink-0" aria-label={STATUS_INFO[col].label}>
              <h2 className="mb-2 flex items-center justify-between text-sm font-semibold text-green-900">
                {STATUS_INFO[col].label} <span className="rounded-full bg-paper px-2 text-xs text-muted ring-1 ring-line">{items.length}</span>
              </h2>
              <div className="min-h-24 space-y-2 rounded-2xl bg-line/40 p-2">
                {items.map(({ order, title, quote, pendingSlips }) => (
                  <Link key={order.id} href={`/admin/orders/${order.code}`} className="card card-hover block p-3 text-sm">
                    <span className="font-medium text-green-900">{order.code}</span>
                    <span className="block truncate text-xs text-muted">{title}</span>
                    <span className="mt-1 flex items-center justify-between text-xs">
                      <span>{order.customer_name || "—"}</span>
                      {quote && <span className="tabular-nums">{lkr(quote.amount + quote.delivery_fee)}</span>}
                    </span>
                    {pendingSlips > 0 && <span className="badge mt-2">slip to review</span>}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
