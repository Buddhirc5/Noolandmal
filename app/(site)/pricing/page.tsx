import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand } from "@/components/ui/CtaBand";
import { listDesignCards, loadCatalog } from "@/lib/server/catalog";
import { categories } from "@/config/site";
import { lkr } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pricing & quotes — how much a custom dress costs in Sri Lanka",
  description: "Nool & Mal price guide: made-to-order frocks, gowns, sarees, blouses, crochet tops and kids' frocks in Sri Lanka. What affects the price, advance payments, rush fees and delivery.",
  alternates: { canonical: "/pricing" },
};

export default async function Pricing() {
  const [cards, c] = await Promise.all([listDesignCards(), loadCatalog()]);
  const s = c.settings;
  const rows = categories
    .map((cat) => {
      const items = cards.filter((x) => x.design.category === cat.key);
      if (!items.length) return null;
      const froms = items.map((x) => x.design.base_price + Math.min(...x.fabrics.map((f) => f.price_modifier)));
      return { cat, from: Math.min(...froms), to: Math.max(...items.map((x) => x.design.base_price + Math.max(...x.fabrics.map((f) => f.price_modifier)))), items };
    })
    .filter(Boolean) as { cat: (typeof categories)[number]; from: number; to: number; items: typeof cards }[];
  const fab = c.fabrics.filter((f) => f.active);
  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader eyebrow="Pricing & quotes" title="Clear prices, confirmed by a person" sub={`Every design shows a live estimate as you customise it. We confirm the final price on WhatsApp — usually within ${s.range_percent}% of the estimate.`} />

      <section className="mt-12">
        <h2 className="font-serif text-3xl font-semibold text-green-900">Price guide</h2>
        <div className="card mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] text-[15px]">
            <thead className="border-b border-line text-left text-xs text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Typical starting price</th>
                <th className="px-5 py-3 font-medium">Designs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.cat.key}>
                  <td className="px-5 py-3 font-medium text-green-900">{r.cat.label}</td>
                  <td className="px-5 py-3 tabular-nums">
                    {lkr(r.from)} – {lkr(r.to)}
                  </td>
                  <td className="px-5 py-3 text-sm">
                    {r.items.map((x, i) => (
                      <span key={x.design.id}>
                        {i > 0 && ", "}
                        <Link href={`/collection/${x.design.slug}`} className="text-green-700 underline underline-offset-2">
                          {x.design.name}
                        </Link>
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">Base design plus fabric, before optional extras. Prices in Sri Lankan rupees.</p>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-green-900">What changes the price</h2>
          <ul className="prose-nm">
            <li>
              <b>Fabric</b> — from included cotton up to {lkr(Math.max(...fab.map((f) => f.price_modifier)))} extra for {fab.sort((a, b) => b.price_modifier - a.price_modifier)[0]?.name.toLowerCase()}.
            </li>
            <li>
              <b>Details</b> — sleeves, embroidery, lace, beadwork, crocheted hems, bows and capes are priced individually.
            </li>
            <li>
              <b>Lining</b> — priced per metre of fabric the design uses.
            </li>
            <li>
              <b>Size</b> — larger sizes use more fabric (from {lkr(Math.min(...c.sizes.filter((x) => x.modifier > 0).map((x) => x.modifier)))}).
            </li>
            <li>
              <b>Custom colours</b> — {lkr(s.custom_color_fee)} each for sourcing a colour outside our palette.
            </li>
            <li>
              <b>Rush dates</b> — {s.rush_fee_percent}% if you need it in less than {s.standard_lead_days} days.
            </li>
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-green-900">Paying for your order</h2>
          <ul className="prose-nm">
            <li>Quotes are valid for {s.quote_valid_days} days.</li>
            <li>
              Pay a <b>{s.advance_percent}% advance</b> by bank transfer to confirm. Use your design code as the reference and upload the slip on your quote page.
            </li>
            <li>The balance is paid before collection or delivery.</li>
            <li>One fitting is included in every order.</li>
          </ul>
          <h3 className="mt-5 text-sm font-semibold text-green-900">Delivery fees</h3>
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {s.delivery_fees.map((d) => (
              <div key={d.district} className="flex justify-between gap-2">
                <dt className="text-muted">{d.district}</dt>
                <dd className="tabular-nums">{lkr(d.fee)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-muted">Studio pickup in {`Colombo`} is free.</p>
        </div>
      </section>
      <CtaBand />
    </div>
  );
}
