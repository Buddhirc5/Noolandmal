import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Faq } from "@/components/ui/Faq";
import { CtaBand } from "@/components/ui/CtaBand";
import { JsonLd, faqLd } from "@/components/JsonLd";
import { faqs } from "@/data/faq";

export const metadata: Metadata = {
  title: "FAQ — custom dresses, prices, timing and payment",
  description: "Answers about made-to-order dresses at Nool & Mal: cost, tailoring time, measurements, payment by bank transfer, delivery in Sri Lanka and alterations.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader eyebrow="FAQ" title="Questions, answered" sub="Can't find what you need? Message us on WhatsApp — a real person replies." />
      <div className="mt-10 max-w-3xl">
        <Faq items={faqs} />
      </div>
      <JsonLd data={faqLd(faqs)} />
      <CtaBand />
    </div>
  );
}
