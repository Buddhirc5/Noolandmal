import Link from "next/link";
import { analytics } from "@/lib/server/studio";
import { listDesigns } from "@/lib/server/catalog";
import { ColumnChart, FunnelBars } from "@/components/admin/Charts";
import { CHART } from "@/lib/chart-colors";
import { lkr, cn } from "@/lib/format";

export const metadata = { title: "Analytics" };
const RANGES = [7, 30, 90] as const;

export default async function Analytics({ searchParams }: PageProps<"/admin/analytics">) {
  const sp = await searchParams;
  const days = RANGES.find((r) => String(r) === sp.days) ?? 30;
  const [a, designs] = await Promise.all([analytics(days), listDesigns({ includeUnpublished: true })]);
  const name = new Map(designs.map((d) => [d.slug, d.name]));
  const kpis = [
    ["Visitors", a.visitors.toLocaleString("en-LK")],
    ["Page views", a.pageViews.toLocaleString("en-LK")],
    ["Codes made", a.funnel[2].value.toLocaleString("en-LK")],
    ["Orders (all)", a.orders.toLocaleString("en-LK")],
    ["Money received", lkr(a.income)],
  ];
  const rows = a.daily.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    full: new Date(d.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    values: { visitors: d.visitors },
  }));
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-green-900">Analytics</h1>
          <p className="mt-1 text-sm text-muted">Who came to the site, what they looked at, and how many became orders.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-surface p-1" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <Link key={r} href={`/admin/analytics?days=${r}`} className={cn("rounded-full px-4 py-1.5 text-sm", r === days ? "bg-ink text-white" : "text-ink hover:bg-surface-2")}>
              {r} days
            </Link>
          ))}
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {kpis.map(([l, v]) => (
          <div key={l} className="card p-5">
            <p className="text-sm text-muted">{l}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums">{v}</p>
          </div>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="font-semibold text-green-900">Visitors per day</h2>
        <p className="mb-5 text-xs text-muted">Unique visitors to the website, Sri Lanka time.</p>
        <ColumnChart rows={rows} series={[{ key: "visitors", name: "Visitors", color: CHART.pink }]} label="Visitors per day" tickEvery={days <= 7 ? 1 : days <= 30 ? 5 : 15} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold text-green-900">From visit to order</h2>
          <p className="mb-5 text-xs text-muted">Last {days} days. “Viewed a design” is a share of visitors; the steps after it are a share of codes made.</p>
          <FunnelBars steps={a.funnel} />
          {a.manualOrders > 0 && <p className="mt-4 text-xs text-muted">Plus {a.manualOrders} order{a.manualOrders === 1 ? "" : "s"} you added yourself.</p>}
        </section>

        <section className="card overflow-hidden p-0">
          <div className="p-5 pb-3">
            <h2 className="font-semibold text-green-900">Designs people look at</h2>
            <p className="text-xs text-muted">Page views and codes made per design.</p>
          </div>
          {a.designs.length ? (
            <table className="w-full text-sm">
              <thead className="border-y border-line text-left text-xs text-muted">
                <tr>
                  <th className="px-5 py-2 font-medium">Design</th>
                  <th className="px-5 py-2 text-right font-medium">Views</th>
                  <th className="px-5 py-2 text-right font-medium">Codes</th>
                  <th className="px-5 py-2 text-right font-medium">Code rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {a.designs.slice(0, 15).map((d) => (
                  <tr key={d.slug}>
                    <td className="px-5 py-2.5">
                      <Link href={`/collection/${d.slug}`} target="_blank" className="hover:underline">
                        {name.get(d.slug) ?? d.slug}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{d.views}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{d.codes}</td>
                    <td className="px-5 py-2.5 text-right text-muted tabular-nums">{d.views ? `${Math.round((d.codes / d.views) * 100)}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-5 pt-0 text-sm text-muted">No design views yet in this period.</p>
          )}
        </section>
      </div>

      <details className="card p-5 text-sm">
        <summary className="cursor-pointer font-medium text-ink">Visitors per day as a table</summary>
        <table className="mt-3 w-full max-w-sm">
          <tbody className="divide-y divide-line">
            {a.daily.map((d) => (
              <tr key={d.date}>
                <td className="py-1.5 text-muted">{d.date}</td>
                <td className="py-1.5 text-right tabular-nums">{d.visitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
