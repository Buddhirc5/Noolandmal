import Link from "next/link";
import { dashboardStats } from "@/lib/server/admin-data";
import { OrderTable } from "@/components/admin/OrderTable";
import { STATUS_INFO } from "@/lib/status";
import { ORDER_STATUSES } from "@/lib/types";

export default async function Dashboard() {
  const s = await dashboardStats();
  const cards = [
    { label: "New quote requests", value: s.newRequests.length, href: "/admin/requests?status=quote_requested", tone: "bg-rose-50" },
    { label: "Slips awaiting approval", value: s.pendingSlips, href: "/admin/payments", tone: "bg-gold-50" },
    { label: "Measurements this week", value: `${s.bookedThisWeek} / ${s.capacity}`, href: "/admin/schedule", tone: "bg-green-50" },
    { label: "Saved drafts (no WhatsApp yet)", value: s.drafts, href: "/admin/requests?status=draft", tone: "bg-paper" },
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-semibold tracking-tight text-green-900">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`card card-hover p-5 ${c.tone}`}>
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-green-900">{c.value}</p>
          </Link>
        ))}
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-green-900">Orders by status</h2>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((st) => (
            <Link key={st} href={`/admin/requests?status=${st}`} className="chip">
              {STATUS_INFO[st].label} <b className="font-semibold">{s.byStatus[st] ?? 0}</b>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-green-900">Waiting for a quote</h2>
          <Link href="/admin/requests" className="text-sm text-green-700">
            All requests →
          </Link>
        </div>
        <OrderTable rows={s.newRequests.slice(0, 10)} empty="No open quote requests." />
      </section>
    </div>
  );
}
