import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadSettings } from "@/lib/server/catalog";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "Nool & Mal terms for made-to-order clothing: starting prices and quotations, colour and fabric availability, making times, rush orders, advance payments, measurements and fittings.",
  alternates: { canonical: "/terms" },
};

export default async function Terms() {
  const s = await loadSettings();
  const sections: [string, string[]][] = [
    [
      "Prices and quotations",
      [
        "Prices on the website are starting prices for each design as shown. Extra details, fabric upgrades and other changes are discussed on WhatsApp and priced in your quotation.",
        "Choosing a colour does not cost extra.",
        `Once we send your final quotation, the price and details do not change. Quotations are valid for ${s.quote_valid_days} days.`,
      ],
    ],
    [
      "Availability",
      [
        "Colours are not always available. We confirm whether your colour can be made before sending your quotation, and suggest the closest match if not.",
        "Fabrics and materials are sometimes out of stock. If so, we will offer an alternative before you pay.",
        "Not every change to a design is always possible. We will tell you honestly what can and can't be done for the style you choose.",
      ],
    ],
    [
      "Making time",
      [
        "Most pieces take 1 to 3 weeks from your measurement appointment.",
        "Depending on the pattern and detail, some pieces take 3 to 6 weeks or more. Your quotation states the expected date.",
        "Rush orders, needed sooner than the usual making time, may carry an extra charge. Any rush charge is included in your quotation.",
      ],
    ],
    [
      "Confirming your order",
      [
        `When you are happy with the final quotation, pay the ${s.advance_percent}% advance by bank transfer using your design code as the reference, then confirm your measurement appointment date.`,
        "Your order is confirmed once we have received the advance. The balance is due before collection or delivery.",
      ],
    ],
    [
      "Measurements and fitting",
      [
        "We take your measurements at the studio. If you can't come in, you can choose a size from our size chart or send us your own measurements; fit is then based on what you give us.",
        "Once you have been measured with us, your measurements are kept on record with Roshini Shyama. For future orders there is no need to come in again — just contact us on WhatsApp and send the design you want.",
        "Every studio order includes a fitting. Alterations needed to match the measurements we took are free. Changes after the fitting may be charged.",
      ],
    ],
    [
      "Changes and cancellations",
      [
        "You can make small changes until cutting begins. Because every piece is made for you, the advance is non-refundable once fabric has been bought or cut, unless we cannot complete your order.",
      ],
    ],
    [
      "Colour accuracy",
      [
        "Photos and on-screen colours are a guide. Fabric colours vary a little between dye lots and screens, so we can share real fabric photos on WhatsApp before cutting.",
      ],
    ],
    [
      "Delivery and collection",
      [
        "Collect from the studio, or choose island-wide delivery for the fee shown in your quotation. Please collect within 30 days of your order being ready.",
      ],
    ],
  ];
  return (
    <div className="container-x max-w-3xl py-12 md:py-16">
      <PageHeader eyebrow="Terms" title="Terms and *conditions*" sub="Plain-language terms for clothing made to order at Nool & Mal." />
      <div className="mt-12 space-y-4" data-reveal-stagger>
        {sections.map(([title, points], i) => (
          <section key={title} className="card p-6 sm:p-8">
            <p className="text-[13px] font-medium text-pink tabular-nums">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-2 text-[1.35rem] leading-tight font-semibold tracking-[-0.02em] text-ink">{title}</h2>
            <ul className="mt-4 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-7 text-ink/80">
                  <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-pink" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
