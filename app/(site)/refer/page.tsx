import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { Faq } from "@/components/ui/Faq";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { referral, site } from "@/config/site";
import { lkr } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Refer a friend",
  description: `Share your Nool & Mal referral code: your friend gets ${lkr(referral.friendDiscount)} off their first made-to-order piece, and you get ${lkr(referral.reward)} off your next one.`,
  alternates: { canonical: "/refer" },
};

export default function Refer() {
  const steps = [
    ["Get your code", "Your personal code is printed on your quotation and invoice — or just ask us on WhatsApp."],
    ["Share it", "Send it to a friend, sister or cousin who's planning something special."],
    ["You both save", `They get ${lkr(referral.friendDiscount)} off their first order. Once they've paid, you get ${lkr(referral.reward)} off your next one.`],
  ];
  const faqs = [
    { q: "Where do I enter a code?", a: "When you tap “Get my quote” on any design, choose “Have a discount or referral code?” and type it in. You can also mention it on WhatsApp." },
    { q: "When do I get my reward?", a: `As soon as your friend pays the advance for their first order, ${lkr(referral.reward)} credit is added to your number. We take it off your next quotation.` },
    { q: "Is there a limit?", a: "No limit — refer as many friends as you like and the credit adds up." },
    { q: "Can I use my own code?", a: "Referral codes are for friends' first orders, so you can't use your own. Look out for our seasonal discount codes on Instagram instead." },
  ];
  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader eyebrow="Refer a friend" title={`Share the love, *both* save`} sub={`Your friend gets ${lkr(referral.friendDiscount)} off their first piece. You get ${lkr(referral.reward)} off your next one.`} />
      <div className="mx-auto mt-12 grid max-w-5xl items-center gap-8 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-surface" data-reveal="scale">
          <Image src="/gallery/blush-plum-leaf-gown/front.webp" alt="A finished blush satin gown from the studio" fill priority sizes="(max-width: 768px) 100vw, 45vw" className="object-cover object-top" />
        </div>
        <div>
        <ol className="space-y-4" data-reveal-stagger>
          {steps.map(([t, d], i) => (
            <li key={t} className="card flex gap-4 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-pink font-semibold text-white">{i + 1}</span>
              <span>
                <span className="block text-[18px] font-semibold text-ink">{t}</span>
                <span className="mt-1 block text-[15px] leading-7 text-muted">{d}</span>
              </span>
            </li>
          ))}
        </ol>
          <a href={waLink(`Hi ${site.name}, could you send me my referral code?`)} target="_blank" rel="noopener noreferrer" className="btn-wa mt-4 h-12 w-full">
            <WhatsAppIcon className="size-5" /> Ask for my code
          </a>
        </div>
      </div>
      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="h-display text-center text-[2rem] sm:text-[2.6rem]">Good to know</h2>
        <div className="mt-8">
          <Faq items={faqs} />
        </div>
      </div>
    </div>
  );
}
