import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand } from "@/components/ui/CtaBand";
import { loadSettings } from "@/lib/server/catalog";

export const metadata: Metadata = {
  title: "How it works — from design to fitting",
  description: "How ordering a made-to-order dress from Nool & Mal works: choose a design, get a WhatsApp quote, pay an advance, get measured, and collect your dress.",
  alternates: { canonical: "/how-it-works" },
};

const img = (slug: string, view: string) => `/catalog/${slug}/${view}.webp`;

export default async function HowItWorks() {
  const s = await loadSettings();
  const steps = [
    ["Choose a design and make it yours", "Pick from the collection, then choose your colour and tell us how we'll get your measurements — at the studio, from your last visit, or your size from our chart.", img("navy-sequin-fan-party-dress", "front")],
    ["See the starting price", "Each design shows its starting price. Colours cost nothing extra. Extra details and rush dates are talked through on WhatsApp, and Roshini sends you one final quotation.", img("lilac-ruffle-saree", "detail")],
    ["Get your design code", "Tap “Get quote” to save your design and receive a code like NM-7K4Q2. Your design link works on any device, so you can share it with family before you decide.", img("botanical-bow-shoulder-mini", "angle")],
    ["Send it on WhatsApp", "WhatsApp opens with your code and a summary ready to send. We reply with your quotation, usually within a day.", img("champagne-lace-high-neck-saree", "front")],
    ["Pay the advance and book a fitting", `Accept the quote, pay a ${s.advance_percent}% advance by bank transfer using your code as the reference, and upload the slip. Then book a measurement appointment at the studio. Measured with us before? We keep your measurements on file, so you don't need to come in again.`, img("cocoa-linen-peplum-top", "front")],
    ["Roshini sews, you follow along", `Cutting, sewing and a fitting — follow each step on your order page. Most pieces take 1–3 weeks; detailed patterns can take 3–6 weeks. Pay the balance, then collect or have it delivered.`, img("navy-silver-peplum-drape-saree", "angle")],
  ] as const;
  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader eyebrow="How it works" title="From your idea to your *fitting*" sub="No account needed. You always know the price, the date and what happens next." />
      <ol className="mt-16 space-y-5">
        {steps.map(([t, d, src], i) => (
          <li key={t} className="card grid items-center gap-6 p-3 md:grid-cols-[1fr_340px] md:gap-10">
            <div className="order-2 px-4 pb-4 md:order-1 md:px-8 md:py-6">
              <p className="font-mono text-[12px] tracking-[0.12em] text-muted">STEP {String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 text-[1.6rem] leading-tight font-semibold tracking-[-0.02em] text-ink">{t}</h2>
              <p className="mt-3 max-w-xl text-[16px] leading-7 text-muted">{d}</p>
            </div>
            <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-[22px] bg-surface-2 md:order-2">
              <Image src={src} alt="" fill sizes="(max-width: 768px) 100vw, 340px" className="object-cover object-top" />
            </div>
          </li>
        ))}
      </ol>
      <CtaBand />
    </div>
  );
}
