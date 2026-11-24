import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand } from "@/components/ui/CtaBand";
import { listDesignCards, loadCatalog } from "@/lib/server/catalog";
import { categories, site } from "@/config/site";
import { lkr } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pricing & quotes — how much a custom dress costs in Sri Lanka",
  description: "Nool & Mal starting prices for made-to-order dresses, gowns, sarees and tops in Sri Lanka. Colours cost nothing extra; fabric, details and dates are confirmed in one final WhatsApp quotation.",
  alternates: { canonical: "/pricing" },
};

export default async function Pricing() {
  const [cards, c] = await Promise.all([listDesignCards(), loadCatalog()]);
  const s = c.settings;
  const groups = categories
    .map((cat) => {
      const items = cards.filter((x) => x.design.category === cat.key).sort((a, b) => a.design.base_price - b.design.base_price);
      return items.length ? { cat, from: items[0].design.base_price, items } : null;
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);

  const steps = [
    ["Starting price", "Every design shows the price for the design as photographed. Choosing a colour costs nothing extra."],
    ["Chat on WhatsApp", "Send your design code. We talk through fabric, extra details, colour availability and your date."],
    ["One final quotation", `${site.designer.split(" ")[0]} sends one quotation. Once it's agreed, nothing changes — pay the advance and confirm your appointment.`],
  ];

  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader eyebrow="Pricing & quotes" title="Clear prices, confirmed by a *person*" sub="See the starting price of every design. Your final price comes in one WhatsApp quotation, before you pay anything." />

      <ol className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3" data-reveal-stagger>
        {steps.map(([t, d], i) => (
          <li key={t} className="card p-6">
            <p className="text-[13px] font-medium text-pink tabular-nums">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-2 text-[19px] font-semibold tracking-[-0.01em] text-ink">{t}</h2>
            <p className="mt-2 text-[15px] leading-7 text-muted">{d}</p>
          </li>
        ))}
      </ol>

      <section className="mt-20">
        <h2 className="h-display text-center text-[2.2rem] leading-tight sm:text-[2.8rem]">Price guide</h2>
        <p className="mx-auto mt-3 max-w-md text-center text-[15px] text-muted">Starting prices in Sri Lankan rupees, for the design as photographed.</p>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {groups.map(({ cat, from, items }) => (
            <section key={cat.key} className="card overflow-hidden p-0" data-reveal>
              <div className="flex items-end justify-between gap-4 px-6 pt-6 pb-4">
                <h3 className="text-[1.35rem] leading-tight font-semibold tracking-[-0.02em] text-ink">{cat.label}</h3>
                <p className="shrink-0 text-right text-[13px] text-muted">
                  from <span className="block text-[17px] font-semibold text-ink tabular-nums">{lkr(from)}</span>
                </p>
              </div>
              <ul className="border-t border-black/5">
                {items.map((x) => (
                  <li key={x.design.id} className="border-b border-black/5 last:border-0">
                    <Link href={`/collection/${x.design.slug}`} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2 sm:px-6">
                      <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[12px] bg-surface-2">
                        {x.design.images[0] && <Image src={x.design.images[0]} alt="" fill sizes="48px" className="object-cover object-top" />}
                      </span>
                      <span className="min-w-0 flex-1 text-[15px] leading-snug font-medium text-ink">{x.design.name}</span>
                      <span className="shrink-0 text-[15px] text-ink tabular-nums">{lkr(x.design.base_price)}</span>
                      <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-5 md:grid-cols-2">
        <div className="card p-6 sm:p-8">
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-ink">What&apos;s agreed in your quotation</h2>
          <ul className="mt-4 space-y-3 text-[15px] leading-7 text-ink/80">
            {[
              "Fabric — your preferred fabric, or the closest available alternative.",
              "Extra details or changes to the design, where they're possible.",
              "Your date. Most pieces take 1–3 weeks; detailed patterns 3–6 weeks. Rush orders may cost extra.",
              "Colours — any colour at no extra cost, subject to availability.",
            ].map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-pink" aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6 sm:p-8">
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-ink">Paying for your order</h2>
          <ul className="mt-4 space-y-3 text-[15px] leading-7 text-ink/80">
            {[
              `Quotations are valid for ${s.quote_valid_days} days.`,
              `Pay a ${s.advance_percent}% advance by bank transfer to confirm, using your design code as the reference.`,
              "The balance is paid before collection or delivery.",
              "A fitting is included with every studio order.",
            ].map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-pink" aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-[15px] font-semibold text-ink">Delivery fees</h3>
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[14px]">
            {s.delivery_fees.map((d) => (
              <div key={d.district} className="flex justify-between gap-2">
                <dt className="text-muted">{d.district}</dt>
                <dd className="text-ink tabular-nums">{lkr(d.fee)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13px] text-muted">Collecting from the studio in Kotte is free.</p>
        </div>
      </section>

      <p className="mt-8 text-center text-[15px] text-muted">
        Read the full{" "}
        <Link href="/terms" className="font-semibold text-ink underline-offset-4 hover:underline">
          terms and conditions
        </Link>
        .
      </p>
      <CtaBand />
    </div>
  );
}
