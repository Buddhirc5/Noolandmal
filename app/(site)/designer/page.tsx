import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/ui/CtaBand";
import { Accent } from "@/components/ui/Accent";
import { CountUp } from "@/components/motion/CountUp";
import { JsonLd } from "@/components/JsonLd";
import { site, testimonials } from "@/config/site";

export const metadata: Metadata = {
  title: `${site.designer} — designer & founder`,
  description: `Meet ${site.designer}, the designer behind Nool & Mal: ${site.designerYears} years of dressmaking and more than ${site.designerPieces} pieces made for customers across Sri Lanka.`,
  alternates: { canonical: "/designer" },
  openGraph: { images: [{ url: "/brand/roshini-shyama.webp", width: 1000, height: 1094, alt: site.designer }] },
};

const img = (slug: string, view: string) => `/catalog/${slug}/${view}.webp`;

export default function Designer() {
  const stats = [
    [site.designerYears, "Years of experience"],
    [site.designerPieces, "Pieces made for customers"],
    ["1", "Fitting with every order"],
  ];
  return (
    <div className="pb-4">
      <section className="container-x pt-10 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-[0.95fr_1.05fr] md:gap-16">
          <div className="relative aspect-[1000/1094] overflow-hidden rounded-[32px] bg-surface" data-reveal="scale">
            <Image src="/brand/roshini-shyama.webp" alt={`${site.designer} in the Nool & Mal studio`} fill priority sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">The designer</p>
            <h1 className="h-display mt-4 text-[2.9rem] leading-[1.02] sm:text-[4rem]">
              <Accent text={`${site.designer.split(" ")[0]} *${site.designer.split(" ").slice(1).join(" ")}*`} />
            </h1>
            <p className="mt-6 text-[18px] leading-8 text-ink/80">
              For more than twenty years, {site.designer.split(" ")[0]} has been cutting, sewing and finishing clothes by hand for women across Sri Lanka — from first-day-at-work office wear to homecoming gowns and bridal sarees.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8">
              {stats.map(([n, l]) => (
                <div key={l}>
                  <CountUp value={n} className="block text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink sm:text-[2.6rem]" />
                  <p className="mt-2 text-[13px] leading-5 text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-x pt-24 md:pt-32">
        <div className="mx-auto max-w-3xl space-y-6 text-[17px] leading-8 text-ink/80" data-reveal>
          <h2 className="h-display text-[2.2rem] leading-tight text-ink sm:text-[2.8rem]">
            <Accent text="Twenty years, *two thousand* fittings" />
          </h2>
          <p>
            {site.designer.split(" ")[0]} learned to sew as a girl and has never really stopped. Over two decades she has made more than {site.designerPieces} pieces — each one cut to a single customer&apos;s measurements, never from a production line.
          </p>
          <p>
            That experience shows in the details customers keep coming back for: a bodice that sits flat without pulling, a drape that falls the same way on both sides, pearls and lace placed by hand so they stay put through a long evening.
          </p>
          <p>
            Every order still passes through her hands. She takes or checks your measurements, cuts the pattern herself and does the fitting — so the person you speak to at the start is the person who finishes your dress. Most pieces are ready in one to three weeks.
          </p>
        </div>
      </section>

      <section className="container-x pt-24 md:pt-32">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4" data-reveal-stagger>
          {[img("blush-draped-chiffon-gown", "detail"), img("pearl-organza-midi-dress", "detail"), img("champagne-lace-high-neck-saree", "detail"), img("navy-sequin-fan-party-dress", "detail")].map((src, i) => (
            <div key={src} className={`relative aspect-[3/4] overflow-hidden rounded-[24px] bg-surface-2 ${i % 2 ? "md:mt-12" : ""}`}>
              <Image src={src} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pt-24 md:pt-32">
        <p className="eyebrow text-center">Well trusted by customers</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3" data-reveal-stagger>
          {testimonials.map((t) => (
            <figure key={t.name} className="card flex flex-col p-7">
              <blockquote className="flex-1 text-[16px] leading-7 text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 text-[14px]">
                <span className="font-semibold text-ink">{t.name}</span>
                <span className="text-muted"> · {t.occasion}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-10 text-center text-[15px] text-muted">
          Visit {site.designer.split(" ")[0]} at the studio in {site.studio.city} —{" "}
          <Link href="/contact" className="font-semibold text-ink underline-offset-4 hover:underline">
            directions and opening hours
          </Link>
          .
        </p>
      </section>

      <div className="container-x">
        <CtaBand title={`Have ${site.designer.split(" ")[0]} make *yours*`} />
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.designer,
          jobTitle: "Fashion designer and dressmaker",
          image: `${site.url}/brand/roshini-shyama.webp`,
          url: `${site.url}/designer`,
          worksFor: { "@type": "Organization", name: site.name, url: site.url },
          workLocation: { "@type": "Place", address: { "@type": "PostalAddress", streetAddress: site.studio.street, addressLocality: site.studio.city, addressCountry: "LK" } },
        }}
      />
    </div>
  );
}
