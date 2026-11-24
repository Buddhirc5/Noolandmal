import type { Metadata } from "next";
import Image from "next/image";
import { ReelStack, type Reel } from "@/components/creators/ReelStack";
import { CreatorForm } from "@/components/creators/CreatorForm";
import { Faq } from "@/components/ui/Faq";
import { Accent } from "@/components/ui/Accent";
import { CountUp } from "@/components/motion/CountUp";
import { JsonLd } from "@/components/JsonLd";
import { creatorProgram as cp, site } from "@/config/site";
import { listDesignCards } from "@/lib/server/catalog";

export const metadata: Metadata = {
  title: "Creator programme — wear it, film it",
  description: `Creators with ${cp.minFollowers} followers get ${cp.discountPercent}% off a made-to-order Nool & Mal piece for one honest video of ${cp.videoLength}. No scripts, no view targets.`,
  alternates: { canonical: "/creators" },
};

const views = (slug: string, list = ["front", "angle", "detail", "back"]) => list.map((v) => `/catalog/${slug}/${v}.webp`);
const md = (v: string) => `/catalog/pleated-midi-dress/${v}/front.webp`;

const reels: Reel[] = [
  { label: "The fitting", caption: "pinned to fit", images: views("blush-draped-chiffon-gown", ["detail", "front", "angle", "back"]) },
  { label: "The reveal", caption: "first look", images: views("pearl-organza-midi-dress") },
  { label: "The twirl", caption: "three ways", images: [md("high-neck-halter"), md("off-shoulder-fold"), md("v-wrap-halter"), "/catalog/pleated-midi-dress/high-neck-halter/angle.webp"] },
];

const faqs = [
  {
    q: "What is the Nool & Mal creator programme?",
    a: `Creators get ${cp.discountPercent}% off one made-to-order piece. In return, you post one simple video wearing it, on one platform of your choice.`,
  },
  {
    q: "Who can join?",
    a: `Anyone in Sri Lanka with ${cp.minFollowers} followers on Instagram, TikTok, YouTube or Facebook. Fashion, lifestyle, beauty, weddings, campus life — if you enjoy showing what you wear, we'd love to hear from you.`,
  },
  {
    q: "What does 'one simple video' mean?",
    a: `One public video of about ${cp.videoLength} — a Reel, TikTok, Short or Facebook video. A get-ready-with-me, your fitting, the first time you try it on, or a twirl at your event are all perfect. It doesn't need heavy editing.`,
  },
  {
    q: "Do I have to say only good things?",
    a: "No. Speak in your own voice, in English, Sinhala, Tamil or a mix. We never send scripts or ask for fake praise — just share your real experience of the fitting, the fabric and the finish.",
  },
  {
    q: "Do I need to say the video is a partnership?",
    a: `Yes. Please add ${cp.hashtag} (or #ad) to your caption and tag ${cp.handle}, so your followers know you received a discount.`,
  },
  {
    q: "How does the discount work?",
    a: `Once you're approved, order any design as usual. Your quotation shows the ${cp.discountPercent}% partner discount. You pay the advance and balance as normal, and post your video within ${cp.postWithinDays} days of collecting your piece.`,
  },
  {
    q: "Is there a minimum number of views?",
    a: "No view targets and no follower growth targets. Whether your video gets 300 views or 300,000, your discount is yours.",
  },
  {
    q: "Will you ask for more posts later?",
    a: "No. One video on one platform completes your part. If you'd like to make more, we'll happily talk — but it's never expected.",
  },
];

export default async function Creators() {
  const cards = await listDesignCards();
  const designNames = cards.map((c) => c.design.name);

  const ticks = [`${cp.minFollowers} followers`, `One video, ${cp.videoLength}`, "Your own voice", "No view targets", "No extra posts later", `${cp.discountPercent}% off your piece`];

  const steps = [
    ["Apply", "Tell us where you post. We look at every profile ourselves and reply on WhatsApp."],
    ["Choose & get measured", "Pick any design and colour. Roshini measures you at the studio — or use our size chart."],
    ["Wear it, film it", `Film your fitting, your reveal or your night out. About ${cp.videoLength}, on one platform.`],
    ["Post & tag", `Add ${cp.hashtag}, tag ${cp.handle} and send us the link. That's it.`],
  ];

  return (
    <div className="overflow-x-clip">
      {/* HERO */}
      <section className="container-x pt-10 text-center md:pt-16">
        <p className="inline-flex rounded-full bg-surface px-4 py-1.5 text-[13px] font-medium text-ink">Creator programme</p>
        <h1 className="h-display mx-auto mt-5 max-w-3xl text-[2.9rem] leading-[1.02] sm:text-[4.4rem]">
          <Accent text="Wear it. Film it. *Love it.*" />
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-8 text-muted">
          Post one honest video ({cp.videoLength}) wearing a piece Roshini made for you, and get {cp.discountPercent}% off it. No scripts, no fake praise, no view targets.
        </p>
        <ul className="mx-auto mt-7 flex max-w-2xl flex-wrap justify-center gap-2">
          {ticks.map((t) => (
            <li key={t} className="flex items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-[14px] text-ink">
              <span className="size-1.5 rounded-full bg-pink" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <a href="#apply" className="btn-primary mt-8 h-[52px] px-8 text-[16px]">
          Apply in a minute
        </a>
        <div className="mt-14">
          <ReelStack reels={reels} />
        </div>
      </section>

      {/* WHAT YOU GET — bento */}
      <section className="container-x pt-20 md:pt-28">
        <p className="eyebrow text-center">What you get</p>
        <h2 className="h-display mx-auto mt-4 max-w-2xl text-center text-[2.3rem] leading-[1.05] sm:text-5xl">
          <Accent text="Made for you, *shared by you*" />
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-2" data-reveal-stagger>
          <div className="relative overflow-hidden rounded-[32px] bg-ink p-8 text-white md:row-span-2">
            <div className="absolute -right-16 -bottom-20 size-72 rounded-full bg-pink/40 blur-3xl" aria-hidden />
            <p className="relative text-[13px] tracking-[0.16em] text-white/60 uppercase">Partner discount</p>
            <CountUp value={`${cp.discountPercent}%`} className="relative mt-4 block text-[6rem] leading-none font-semibold tracking-[-0.05em] sm:text-[8rem]" />
            <p className="relative mt-4 max-w-xs text-[17px] leading-7 text-white/80">off your made-to-order piece — any design, any colour.</p>
          </div>
          <div className="relative min-h-[220px] overflow-hidden rounded-[32px] bg-surface md:col-span-2">
            <Image src="/catalog/satin-halter-a-line-gown/colours/maroon.webp" alt="" fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover object-[50%_20%]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
            <div className="relative max-w-sm p-8 text-white">
              <h3 className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">Featured by Nool &amp; Mal</h3>
              <p className="mt-2 text-[15px] leading-6 text-white/80">We share the best videos on our Instagram and website, with full credit to you.</p>
            </div>
          </div>
          <div className="rounded-[32px] bg-rose-50 p-8">
            <h3 className="text-[1.25rem] font-semibold tracking-[-0.02em] text-mulberry">First look</h3>
            <p className="mt-2 text-[15px] leading-6 text-orchid">See new designs before anyone else, and help choose what we make next.</p>
          </div>
          <div className="rounded-[32px] bg-surface p-8">
            <h3 className="text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">Made by {site.designer.split(" ")[0]}</h3>
            <p className="mt-2 text-[15px] leading-6 text-muted">{site.designerYears} years of dressmaking, a real fitting, and a piece cut to your measurements.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-x pt-20 md:pt-28">
        <p className="eyebrow text-center">How it works</p>
        <h2 className="h-display mx-auto mt-4 max-w-2xl text-center text-[2.3rem] leading-[1.05] sm:text-5xl">
          <Accent text="Four steps to your *video*" />
        </h2>
        <ol className="relative mt-12 grid gap-4 md:grid-cols-4" data-reveal-stagger>
          {steps.map(([t, d], i) => (
            <li key={t} className="card relative p-6">
              <span className="flex size-10 items-center justify-center rounded-full bg-pink text-[15px] font-semibold text-white tabular-nums">{i + 1}</span>
              <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.01em] text-ink">{t}</h3>
              <p className="mt-2 text-[15px] leading-7 text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* OUR PROMISE */}
      <section className="container-x pt-20 md:pt-28">
        <div className="grid items-center gap-10 overflow-hidden rounded-[36px] bg-mulberry p-8 text-white md:grid-cols-2 md:p-14" data-reveal>
          <div>
            <p className="text-[12px] font-medium tracking-[0.16em] text-pink-light uppercase">Our promise</p>
            <h2 className="mt-4 text-[2.2rem] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-5xl">
              Your voice. <em className="accent text-pink-light">Your way.</em>
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-7 text-white/75">We&apos;d rather have one real video than a hundred scripted ones. Here&apos;s what we will never ask of you.</p>
          </div>
          <ul className="space-y-3">
            {["Scripts or lines to read", "Fake praise or only-positive reviews", "Minimum views or follower growth", "Editing rounds or re-shoots", "Extra posts, stories or cross-posting"].map((t) => (
              <li key={t} className="flex items-center justify-between gap-4 rounded-[20px] bg-white/8 px-5 py-4 text-[16px]">
                <span>{t}</span>
                <span className="shrink-0 text-[13px] font-medium text-pink-light">Never</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* APPLY */}
      <section id="apply" className="container-x scroll-mt-28 pt-20 md:pt-28">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div className="md:sticky md:top-28">
            <p className="eyebrow">Apply</p>
            <h2 className="h-display mt-4 text-[2.3rem] leading-[1.05] sm:text-5xl">
              <Accent text="Join the *programme*" />
            </h2>
            <p className="mt-5 text-[16px] leading-7 text-muted">
              Takes less than a minute. We reply on WhatsApp — if it&apos;s a fit, we&apos;ll help you choose your piece and book your measurements.
            </p>
            <div className="relative mt-8 hidden aspect-[4/5] overflow-hidden rounded-[28px] bg-surface md:block">
              <Image src="/catalog/navy-sequin-fan-party-dress/front.webp" alt="" fill sizes="40vw" className="object-cover object-top" />
            </div>
          </div>
          <div className="card p-6 sm:p-8">
            <CreatorForm designs={designNames} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x pt-20 pb-4 md:pt-28">
        <h2 className="h-display text-center text-[2.3rem] leading-[1.05] sm:text-5xl">
          <Accent text="Questions, *answered*" />
        </h2>
        <div className="mx-auto mt-12 max-w-3xl">
          <Faq items={faqs} />
        </div>
      </section>

      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    </div>
  );
}
