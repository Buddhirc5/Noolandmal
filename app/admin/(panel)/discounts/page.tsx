import { listDiscountCodes } from "@/lib/server/promos";
import { db } from "@/lib/server/db";
import { DiscountCodeForm } from "@/components/admin/DiscountCodeForm";
import { formatDate, lkr, cn } from "@/lib/format";
import { referral } from "@/config/site";
import type { ReferralReward } from "@/lib/types";

export const metadata = { title: "Discount codes" };

export default async function Discounts() {
  const [codes, rewards] = await Promise.all([listDiscountCodes(), db.list<ReferralReward>("referral_rewards", { order: { column: "created_at", ascending: false } })]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-green-900 md:text-4xl">Discounts &amp; referrals</h1>
        <p className="mt-1 text-sm text-muted">Customers enter codes when they get a quote. The discount is filled into your quotation automatically.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-green-900">Discount codes</h2>
        {codes.length ? (
          codes.map((c) => (
            <details key={c.id} className="card p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="font-mono text-[17px] font-semibold">{c.code}</span>
                  <span className="block text-sm text-muted">
                    {c.kind === "percent" ? `${c.value}% off` : `${lkr(c.value)} off`}
                    {c.min_total ? ` · over ${lkr(c.min_total)}` : ""}
                    {c.ends_on ? ` · until ${formatDate(c.ends_on)}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-right text-sm">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", c.active ? "bg-ink text-white" : "bg-surface text-muted")}>{c.active ? "Active" : "Off"}</span>
                  <span className="mt-1 block text-xs text-muted">
                    Used {c.uses}
                    {c.max_uses ? ` / ${c.max_uses}` : ""}
                  </span>
                </span>
              </summary>
              <div className="mt-4 border-t border-line pt-4">
                <DiscountCodeForm initial={c} />
              </div>
            </details>
          ))
        ) : (
          <p className="card p-5 text-sm text-muted">No codes yet. Create your first one below.</p>
        )}
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-semibold text-green-900">New code</h2>
        <DiscountCodeForm />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-green-900">Referral rewards</h2>
          <p className="text-sm text-muted">
            Every customer has their own code (on their customer page and invoices). A friend gets {lkr(referral.friendDiscount)} off their first order; the customer earns {lkr(referral.reward)} credit once the friend pays.
          </p>
        </div>
        {rewards.length ? (
          <div className="card divide-y divide-line">
            {rewards.map((r) => (
              <a key={r.id} href={`/admin/customers/${r.referrer_phone}`} className="flex items-center justify-between gap-3 p-4 text-sm">
                <span>
                  <b className="font-semibold">+{r.referrer_phone}</b> referred {r.order_code}
                  <span className="block text-xs text-muted">{formatDate(r.created_at)}</span>
                </span>
                <span className="text-right">
                  <b className="tabular-nums">{lkr(r.amount)}</b>
                  <span className="block text-xs text-muted">{r.status === "used" ? `used on ${r.used_in}` : "available"}</span>
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="card p-5 text-sm text-muted">No referral rewards yet.</p>
        )}
      </section>
    </div>
  );
}
