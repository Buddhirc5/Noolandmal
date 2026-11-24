import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadSettings } from "@/lib/server/catalog";

export const metadata: Metadata = { title: "Terms of order", alternates: { canonical: "/terms" } };

export default async function Terms() {
  const s = await loadSettings();
  return (
    <div className="container-x max-w-3xl py-12 md:py-16">
      <PageHeader eyebrow="Terms" title="Terms of order" sub="Plain-language terms for made-to-order garments. (Draft — have these reviewed before launch.)" />
      <div className="prose-nm mt-10">
        <h2>Estimates and quotations</h2>
        <p>Prices shown on the website are estimates. Your order is confirmed only when we send a quotation and you pay the advance. Quotations are valid for {s.quote_valid_days} days.</p>
        <h2>Advance and balance</h2>
        <p>
          A {s.advance_percent}% advance confirms your order and lets us buy fabric. The balance is due before collection or delivery. Payments are made by bank transfer using your design code as the reference.
        </p>
        <h2>Changes and cancellations</h2>
        <p>You can change your design free of charge until cutting begins. Because every piece is made for you, the advance is non-refundable once fabric has been purchased or cut, except where we cannot complete your order.</p>
        <h2>Colours and fabrics</h2>
        <p>On-screen previews are a guide. Fabric colours vary between dye lots and screens; we share swatch photos on WhatsApp before cutting where possible.</p>
        <h2>Fit and alterations</h2>
        <p>Every order includes a fitting. Alterations needed to match the measurements we took are free. Changes in measurements after the fitting may be charged.</p>
        <h2>Delivery and collection</h2>
        <p>Collect from the studio or choose island-wide delivery for the fee shown in your quote. Please collect within 30 days of your order being ready.</p>
      </div>
    </div>
  );
}
