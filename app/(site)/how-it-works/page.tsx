import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand } from "@/components/ui/CtaBand";
import { BookingMock, ChatMock, CodeMock, NeedleMock, PriceMock, SwatchMock } from "@/components/home/Mockups";
import { loadSettings } from "@/lib/server/catalog";

export const metadata: Metadata = {
  title: "How it works — from design to fitting",
  description: "How ordering a made-to-order dress from Nool & Mal works: customise online, get a WhatsApp quote, pay an advance, get measured, and collect your dress.",
  alternates: { canonical: "/how-it-works" },
};

export default async function HowItWorks() {
  const s = await loadSettings();
  const steps = [
    ["Choose a design and make it yours", "Pick from the collection and change the colour of each part, the fabric, neckline, sleeves, length and details. Options that can't be combined are explained. The estimated price updates with every choice.", <SwatchMock key="1" />],
    ["See an honest estimate", `You see an itemised price and a range (±${s.range_percent}%). Final prices are confirmed by a person because every dress is a little different.`, <PriceMock key="2" />],
    ["Get your design code", "Tap “Get quote” to save your design and receive a code like NM-7K4Q2. Your design link works on any device — share it with family before you decide.", <CodeMock key="3" />],
    ["Send it on WhatsApp", "WhatsApp opens with your code and a summary ready to send. We reply with your quotation, usually within a day.", <ChatMock key="4" />],
    ["Pay the advance and book measurements", `Accept the quote, pay a ${s.advance_percent}% advance by bank transfer using your code as the reference and upload the slip. Then book a measurement slot at the studio or a home visit in Colombo.`, <BookingMock key="5" />],
    ["We sew, you track", `Cutting, sewing and a fitting — follow each step on your order page. Standard lead time is about ${Math.round(s.standard_lead_days / 7)} weeks. Pay the balance, then collect or get it delivered.`, <NeedleMock key="6" />],
  ] as const;
  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader eyebrow="How it works" title="From your idea to your fitting" sub="Everything works without an account. You'll always know the price, the date and what happens next." />
      <ol className="mt-14 space-y-6">
        {steps.map(([t, d, mock], i) => (
          <li key={t} className="card grid items-center gap-6 overflow-hidden md:grid-cols-[1fr_320px]">
            <div className="p-6 md:p-8">
              <p className="font-serif text-4xl text-gold-600">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-1 text-xl font-semibold text-green-900">{t}</h2>
              <p className="mt-2 max-w-xl text-[15px] leading-7 text-muted">{d}</p>
            </div>
            <div className="flex h-full items-center justify-center bg-ivory/70 p-6">{mock}</div>
          </li>
        ))}
      </ol>
      <CtaBand />
    </div>
  );
}
