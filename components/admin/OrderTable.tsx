import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime, lkr } from "@/lib/format";
import type { OrderRow } from "@/lib/server/admin-data";

export function OrderTable({ rows, empty = "Nothing here yet." }: { rows: OrderRow[]; empty?: string }) {
  if (!rows.length) return <p className="card p-8 text-center text-sm text-muted">{empty}</p>;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-line text-left text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Design / request</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Estimate / quote</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map(({ order, title, estimate, quote, pendingSlips }) => (
            <tr key={order.id} className="hover:bg-ivory/60">
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${order.code}`} className="font-medium text-green-900 underline-offset-2 hover:underline">
                  {order.code}
                </Link>
                {order.kind === "manual" ? (
                  <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted">added by studio</span>
                ) : order.received_at ? (
                  <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[10px] text-white">received</span>
                ) : ["draft", "quote_requested"].includes(order.status) ? (
                  <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-orchid">{order.whatsapp_clicked_at ? "sent · not received" : "not sent yet"}</span>
                ) : null}
              </td>
              <td className="px-4 py-3">{title}</td>
              <td className="px-4 py-3">
                {order.customer_name || <span className="text-muted">—</span>}
                {order.customer_phone && <span className="block text-xs text-muted">+{order.customer_phone}</span>}
              </td>
              <td className="px-4 py-3 tabular-nums">
                {quote ? <b className="font-medium">{lkr(quote.amount + quote.delivery_fee)}</b> : estimate ? <span className="text-muted">{estimate}</span> : "—"}
                {pendingSlips > 0 && <span className="badge ml-2">slip to review</span>}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-xs text-muted">{formatDateTime(order.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
