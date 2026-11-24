import Link from "next/link";
import { db } from "@/lib/server/db";
import { signedUrl } from "@/lib/server/storage";
import { PaymentCard } from "@/components/admin/OrderPanels";
import type { Order, Payment } from "@/lib/types";

export const metadata = { title: "Payments" };

export default async function Payments() {
  const [payments, orders] = await Promise.all([db.list<Payment>("payments", { order: { column: "created_at", ascending: false } }), db.list<Order>("orders")]);
  const byId = new Map(orders.map((o) => [o.id, o]));
  const pending = payments.filter((p) => p.status === "pending");
  const recent = payments.filter((p) => p.status !== "pending").slice(0, 20);
  const urls = new Map(await Promise.all(payments.map(async (p) => [p.id, await signedUrl("slips", p.slip_path, 900)] as const)));
  const Item = ({ p }: { p: Payment }) => (
    <div>
      <Link href={`/admin/orders/${byId.get(p.order_id)?.code}`} className="mb-1 inline-block text-sm font-medium text-green-900 hover:underline">
        {byId.get(p.order_id)?.code} · {byId.get(p.order_id)?.customer_name || "—"}
      </Link>
      <PaymentCard payment={p} slipUrl={urls.get(p.id)!} />
    </div>
  );
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-green-900">Payment slips</h1>
        <p className="mt-1 text-sm text-muted">Check the amount and the reference (design code) against your bank statement before approving.</p>
      </div>
      <section className="space-y-4">
        <h2 className="font-semibold text-green-900">Awaiting review ({pending.length})</h2>
        {pending.length ? pending.map((p) => <Item key={p.id} p={p} />) : <p className="card p-6 text-sm text-muted">No slips waiting.</p>}
      </section>
      {recent.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold text-green-900">Recently reviewed</h2>
          {recent.map((p) => (
            <Item key={p.id} p={p} />
          ))}
        </section>
      )}
    </div>
  );
}
