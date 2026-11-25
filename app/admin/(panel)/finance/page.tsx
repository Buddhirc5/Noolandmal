import { financeByMonth, lkDate } from "@/lib/server/studio";
import { ColumnChart } from "@/components/admin/Charts";
import { CHART } from "@/lib/chart-colors";
import { DeleteExpense, ExpenseForm } from "@/components/admin/ExpenseForm";
import { formatDate, lkr, cn } from "@/lib/format";
import { EXPENSE_CATEGORIES } from "@/lib/types";

export const metadata = { title: "Money & profit" };

const monthLabel = (m: string, long = false) => new Date(`${m}-15`).toLocaleDateString("en-GB", long ? { month: "long", year: "numeric" } : { month: "short" });

export default async function Finance() {
  const f = await financeByMonth(12);
  const today = lkDate(new Date());
  const cur = f.months.at(-1)!;
  const catName = Object.fromEntries(EXPENSE_CATEGORIES);
  const recent = f.expenses.slice(0, 40);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-green-900">Money &amp; profit</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Money in is every advance and balance you record on an order. Add what you spend — fabric, accessories, transport — and the profit works itself out, month by month.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [`Received · ${monthLabel(cur.month, true)}`, cur.income],
          [`Spent · ${monthLabel(cur.month, true)}`, cur.expenses],
          [`Profit · ${monthLabel(cur.month, true)}`, cur.profit],
          ["Profit · last 12 months", f.totals.profit],
        ].map(([l, v], i) => (
          <div key={l as string} className={cn("card p-5", i === 2 && "bg-ink text-white")}>
            <p className={cn("text-sm", i === 2 ? "text-white/70" : "text-muted")}>{l}</p>
            <p className={cn("mt-2 text-3xl font-semibold tracking-tight tabular-nums", (v as number) < 0 && "text-danger")}>{lkr(v as number)}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-green-900">Add an expense</h2>
        <ExpenseForm today={today} />
      </section>

      <section className="card p-5">
        <h2 className="font-semibold text-green-900">Received and spent, by month</h2>
        <p className="mb-5 text-xs text-muted">Last 12 months, in rupees. Hover a month for exact figures; profit is in the table below.</p>
        <ColumnChart
          rows={f.months.map((m) => ({ label: monthLabel(m.month), full: monthLabel(m.month, true), values: { income: m.income, expenses: m.expenses } }))}
          series={[
            { key: "income", name: "Received", color: CHART.pink },
            { key: "expenses", name: "Spent", color: CHART.blue },
          ]}
          label="Money received and spent per month"
          currency
          height={240}
        />
      </section>

      <section className="card overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Month</th>
              <th className="px-5 py-3 text-right font-medium">Orders paid</th>
              <th className="px-5 py-3 text-right font-medium">Received</th>
              <th className="px-5 py-3 text-right font-medium">Spent</th>
              <th className="px-5 py-3 text-right font-medium">Profit</th>
              <th className="px-5 py-3 font-medium">Biggest cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[...f.months].reverse().map((m) => {
              const top = Object.entries(m.byCategory).sort((a, b) => b[1] - a[1])[0];
              return (
                <tr key={m.month}>
                  <td className="px-5 py-2.5 font-medium">{monthLabel(m.month, true)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{m.orders}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{lkr(m.income)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{lkr(m.expenses)}</td>
                  <td className={cn("px-5 py-2.5 text-right font-semibold tabular-nums", m.profit < 0 && "text-danger")}>{lkr(m.profit)}</td>
                  <td className="px-5 py-2.5 text-muted">{top ? `${catName[top[0]] ?? top[0]} · ${lkr(top[1])}` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-line font-semibold">
            <tr>
              <td className="px-5 py-3">12 months</td>
              <td className="px-5 py-3 text-right tabular-nums">{f.totals.orders}</td>
              <td className="px-5 py-3 text-right tabular-nums">{lkr(f.totals.income)}</td>
              <td className="px-5 py-3 text-right tabular-nums">{lkr(f.totals.expenses)}</td>
              <td className="px-5 py-3 text-right tabular-nums">{lkr(f.totals.profit)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-green-900">Recent expenses</h2>
        {recent.length ? (
          <div className="card divide-y divide-line">
            {recent.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <span className="w-28 text-muted">{formatDate(e.spent_on)}</span>
                <span className="w-44">{catName[e.category] ?? e.category}</span>
                <span className="min-w-0 flex-1 truncate text-muted">{e.note || "—"}</span>
                <b className="tabular-nums">{lkr(e.amount)}</b>
                <DeleteExpense id={e.id} />
              </div>
            ))}
          </div>
        ) : (
          <p className="card p-6 text-center text-sm text-muted">No expenses yet. Add your first one above.</p>
        )}
      </section>
    </div>
  );
}
