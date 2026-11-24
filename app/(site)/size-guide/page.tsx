import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand } from "@/components/ui/CtaBand";
import { howToMeasure, sizeChart, toInches } from "@/data/size-chart";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Women's size chart",
  description: "Nool & Mal women's size chart from XS to 3XL — bust, waist and hip in centimetres and inches, with how to measure yourself at home.",
  alternates: { canonical: "/size-guide" },
};

const cols = [
  ["bust", "Bust"],
  ["waist", "Waist"],
  ["hip", "Hip"],
] as const;

export default function SizeGuide() {
  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader
        eyebrow="Size guide"
        title="Find your *size*"
        sub="Body measurements for our standard sizes. Every piece is still checked at your fitting, so a centimetre or two either way is fine."
      />

      <div className="mx-auto mt-12 max-w-4xl" data-reveal>
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[15px]">
              <caption className="sr-only">Women&apos;s body measurements by size, in centimetres and inches</caption>
              <thead>
                <tr className="border-b border-line bg-surface text-[13px] text-muted">
                  <th scope="col" className="px-5 py-4 font-medium">Size</th>
                  <th scope="col" className="px-5 py-4 font-medium">UK</th>
                  {cols.map(([, label]) => (
                    <th key={label} scope="col" className="px-5 py-4 font-medium">
                      {label}
                      <span className="block text-[12px] font-normal">cm / in</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((r) => (
                  <tr key={r.size} className="border-b border-line last:border-0">
                    <th scope="row" className="px-5 py-4 font-semibold text-ink">{r.size}</th>
                    <td className="px-5 py-4 text-muted">{r.uk}</td>
                    {cols.map(([k]) => (
                      <td key={k} className="px-5 py-4 text-ink tabular-nums">
                        {r[k]} <span className="text-muted">/ {toInches(r[k])}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 text-center text-[14px] text-muted">
          Between sizes? Choose the larger one — we take it in at the fitting. Or send us your exact measurements when you order.
        </p>
      </div>

      <section className="mx-auto mt-20 max-w-4xl">
        <h2 className="h-display text-center text-[2rem] leading-tight sm:text-[2.6rem]">How to measure</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2" data-reveal-stagger>
          {howToMeasure.map(([t, d], i) => (
            <li key={t} className="card p-6">
              <p className="text-[13px] font-medium text-pink tabular-nums">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-[19px] font-semibold tracking-[-0.01em] text-ink">{t}</h3>
              <p className="mt-2 text-[15px] leading-7 text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center text-[15px] text-muted">
          Prefer we measure you?{" "}
          <Link href="/how-it-works" className="font-semibold text-ink underline-offset-4 hover:underline">
            Every order includes a measurement appointment
          </Link>{" "}
          — or{" "}
          <a href={waLink("Hi Nool & Mal, I have a question about sizing. ")} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline-offset-4 hover:underline">
            ask us on WhatsApp
          </a>
          .
        </p>
      </section>

      <CtaBand />
    </div>
  );
}
