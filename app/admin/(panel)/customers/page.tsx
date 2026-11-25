import Link from "next/link";
import { redirect } from "next/navigation";
import { listOrderRows } from "@/lib/server/admin-data";
import { db } from "@/lib/server/db";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate, lkr, normalizePhone } from "@/lib/format";
import type { Customer, CustomerMeasurement, Payment } from "@/lib/types";

export const metadata = { title: "Customers" };

async function openCustomer(form: FormData) {
  "use server";
  const phone = normalizePhone(String(form.get("phone") ?? ""));
  if (phone.length >= 9) redirect(`/admin/customers/${phone}`);
}

export default async function Customers({ searchParams }: PageProps<"/admin/customers">) {
  const q = String((await searchParams).q ?? "").toLowerCase().trim();
  const [rows, measurements, payments, customers] = await Promise.all([
    listOrderRows(),
    db.list<CustomerMeasurement>("customer_measurements"),
    db.list<Payment>("payments", { eq: { status: "approved" } }),
    db.list<Customer>("customers"),
  ]);
  const paidByOrder = new Map<string, number>();
  for (const p of payments) paidByOrder.set(p.order_id, (paidByOrder.get(p.order_id) ?? 0) + p.amount);
  const measured = new Map(measurements.map((m) => [m.phone, m]));

  const groups = new Map<string, { phone: string; name: string; rows: typeof rows }>();
  for (const r of rows) {
    if (!r.order.customer_phone) continue;
    const g = groups.get(r.order.customer_phone) ?? { phone: r.order.customer_phone, name: r.order.customer_name, rows: [] };
    g.rows.push(r);
    if (!g.name) g.name = r.order.customer_name;
    groups.set(r.order.customer_phone, g);
  }
  for (const m of measurements) if (!groups.has(m.phone)) groups.set(m.phone, { phone: m.phone, name: m.name, rows: [] });
  for (const c of customers) {
    const g = groups.get(c.phone);
    if (g) g.name = c.name || g.name;
    else groups.set(c.phone, { phone: c.phone, name: c.name, rows: [] });
  }
  let list = [...groups.values()];
  if (q) list = list.filter((g) => `${g.name} ${g.phone}`.toLowerCase().includes(q));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-green-900 md:text-4xl">Customers</h1>
        <p className="mt-1 text-sm text-muted">Each customer&apos;s WhatsApp number is their ID — orders, measurements, quotations and invoices all hang off it.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <form className="flex w-full gap-2 md:w-auto" action="/admin/customers">
          <input name="q" defaultValue={q} placeholder="Search name or number…" className="input h-11 min-w-0 flex-1 rounded-full" />
          <button className="btn-secondary">Search</button>
        </form>
        <form className="flex w-full gap-2 md:w-auto" action={openCustomer}>
          <input name="phone" type="tel" inputMode="tel" placeholder="07X XXX XXXX" className="input h-11 min-w-0 flex-1 rounded-full" aria-label="Customer WhatsApp number" />
          <button className="btn-secondary h-11 shrink-0">Open number</button>
        </form>
      </div>
      <div className="card divide-y divide-line">
        {list.map((g) => {
          const paid = g.rows.reduce((a, r) => a + (paidByOrder.get(r.order.id) ?? 0), 0);
          const m = measured.get(g.phone);
          return (
            <div key={g.phone} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
              <Link href={`/admin/customers/${g.phone}`} className="w-60 shrink-0">
                <p className="font-medium text-green-900 hover:underline">{g.name || "Unnamed"}</p>
                <p className="text-xs text-muted">+{g.phone}</p>
              </Link>
              <div className="flex w-56 shrink-0 flex-wrap gap-2 text-xs">
                <span className={`rounded-full px-2.5 py-0.5 ${m && Object.keys(m.values).length ? "bg-ink text-white" : "bg-surface text-muted"}`}>
                  {m && Object.keys(m.values).length ? `Measured ${m.taken_on ? formatDate(m.taken_on) : ""}` : "No measurements"}
                </span>
                {paid > 0 && <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-orchid">Paid {lkr(paid)}</span>}
              </div>
              <ul className="flex flex-1 flex-wrap gap-2">
                {g.rows.map((r) => (
                  <li key={r.order.id}>
                    <Link href={`/admin/orders/${r.order.code}`} className="chip gap-2">
                      {r.order.code} <StatusBadge status={r.order.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {!list.length && <p className="p-6 text-sm text-muted">No customers yet.</p>}
      </div>
    </div>
  );
}
