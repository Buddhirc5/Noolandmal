import Link from "next/link";
import { analytics, financeByMonth, lkDate, ticketCounts } from "@/lib/server/studio";
import { ReceivedButton } from "@/components/admin/ReceivedButton";
import { OrderTable } from "@/components/admin/OrderTable";
import { formatDateTime, lkr } from "@/lib/format";

export default async function Dashboard() {
  const [t, fin, week] = await Promise.all([ticketCounts(), financeByMonth(1), analytics(7)]);
  const month = fin.months[0];
  const tickets = [
    { label: "Codes not received yet", value: t.notReceived.length, href: "/admin/requests?view=not_received", hint: "Customer made a code — check WhatsApp" },
    { label: "Received — send quotation", value: t.toQuote.length, href: "/admin/requests?view=to_quote", hint: "Write the quote and send it" },
    { label: "Quoted — waiting for advance", value: t.quoted.length, href: "/admin/requests?status=quoted", hint: "Follow up on WhatsApp" },
    { label: "In progress", value: t.active.length, href: "/admin/orders", hint: "Paid, measuring or sewing" },
    { label: "Balance to collect", value: t.awaitingBalance.length, href: "/admin/requests?view=balance", hint: "Ready or handed over, not fully paid" },
  ];
  const monthName = new Date(`${month.month}-15`).toLocaleDateString("en-GB", { month: "long" });
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-green-900">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">WhatsApp is where you talk and get paid — tick things off here.</p>
        </div>
        <Link href="/admin/orders/new" className="btn-primary">
          New order
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {tickets.map((c) => (
          <Link key={c.label} href={c.href} className="card card-hover p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-ink tabular-nums">{c.value}</p>
            <p className="mt-1 text-xs text-muted">{c.hint}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          [`Received in ${monthName}`, lkr(month.income)],
          [`Spent in ${monthName}`, lkr(month.expenses)],
          [`Profit in ${monthName}`, lkr(month.profit)],
          ["Visitors, last 7 days", week.visitors.toLocaleString("en-LK")],
        ].map(([l, v], i) => (
          <Link key={l} href={i === 3 ? "/admin/analytics" : "/admin/finance"} className={`card card-hover p-5 ${i === 2 ? "bg-ink text-white" : ""}`}>
            <p className={`text-sm ${i === 2 ? "text-white/70" : "text-muted"}`}>{l}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{v}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-green-900">Codes waiting to be received</h2>
          <Link href="/admin/requests" className="text-sm text-green-700">
            Codes inbox →
          </Link>
        </div>
        {t.notReceived.length ? (
          <div className="card divide-y divide-line">
            {t.notReceived.slice(0, 12).map(({ order, title }) => (
              <div key={order.id} className="flex flex-wrap items-center gap-3 p-4">
                <Link href={`/admin/orders/${order.code}`} className="font-mono text-sm font-semibold text-ink underline-offset-2 hover:underline">
                  {order.code}
                </Link>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {title}
                  <span className="text-muted"> · {order.customer_name || "no name"} · {formatDateTime(order.created_at)}</span>
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${order.whatsapp_clicked_at ? "bg-rose-50 text-orchid" : "bg-surface text-muted"}`}>
                  {order.whatsapp_clicked_at ? "opened WhatsApp" : "code only"}
                </span>
                <ReceivedButton code={order.code} />
              </div>
            ))}
          </div>
        ) : (
          <p className="card p-6 text-center text-sm text-muted">All caught up — no codes waiting.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-green-900">Received — quotation to send</h2>
        <OrderTable rows={t.toQuote.slice(0, 10)} empty="Nothing waiting for a quotation." />
      </section>
      <p className="text-xs text-muted">Today in Sri Lanka: {lkDate(new Date())}</p>
    </div>
  );
}
