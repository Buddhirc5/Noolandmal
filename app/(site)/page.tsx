import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Link2, Search, Upload } from "lucide-react";
import { HeroPhone, type HeroPreset } from "@/components/home/HeroPhone";
import { StepsCarousel } from "@/components/home/StepsCarousel";
import { Marquee } from "@/components/home/Marquee";
import { Testimonials } from "@/components/home/Testimonials";
import { BookingMock, ChatMock, CodeMock, NeedleMock, PriceMock, SwatchMock } from "@/components/home/Mockups";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accent } from "@/components/ui/Accent";
import { Faq } from "@/components/ui/Faq";
import { DesignCard } from "@/components/DesignCard";
import { DressFigure } from "@/components/customiser/DressFigure";
import { JsonLd, faqLd } from "@/components/JsonLd";
import { getT } from "@/lib/i18n-server";
import { listDesignCards, loadCatalog } from "@/lib/server/catalog";
import { computePrice, defaultSelections } from "@/lib/pricing";
import { colorHex } from "@/lib/colors";
import { faqs } from "@/data/faq";
import { occasions, testimonials } from "@/config/site";

export default async function HomePage() {
  const t = await getT();
  const [cards, catalog] = await Promise.all([listDesignCards(), loadCatalog()]);
  const featured = cards.filter((c) => c.design.featured).slice(0, 6);
  const hero = cards.find((c) => c.design.slug === "blush-leaf-tulle-gown") ?? cards[0];
  const pal = (k: string) => colorHex(k, catalog.palette);

  // Hero phone presets: real prices from the live catalogue
  const presetDefs: [string, Record<string, string>, string][] = [
    ["Blush & Plum", { main: "blush", accent: "plum", overlay: "blush" }, "satin"],
    ["Sage & Deep Green", { main: "sage", accent: "deep-green", overlay: "mint" }, "satin"],
    ["Ivory & Gold", { main: "ivory", accent: "gold", overlay: "ivory" }, "silk-blend"],
    ["Navy & Dusty Rose", { main: "navy", accent: "dusty-rose", overlay: "navy" }, "crepe"],
  ];
  const presets: HeroPreset[] = hero
    ? presetDefs.map(([name, colors, fabric]) => {
        const sel = { ...defaultSelections(hero.design, hero.regions, catalog), colors, fabric };
        const p = computePrice(catalog, hero.design, sel);
        return { name, colors: Object.fromEntries(Object.entries(colors).map(([r, k]) => [r, pal(k)])), min: p.min, max: p.max };
      })
    : [];

  // Lookbook collage behind the hero
  const collage = cards.filter((c) => c.design.images.length).flatMap((c) => [c.design.images[0], c.design.images[3] ?? c.design.images[0]]);
  const columns = [0, 1, 2, 3].map((col) => collage.filter((_, i) => i % 4 === col).slice(0, 3));

  const frock = cards.find((c) => c.design.slug === "everyday-aline-cotton-frock");
  const homeFaqs = faqs.filter((f) => f.home);

  const steps = [
    { title: t("how.1.t"), body: t("how.1.d"), visual: <SwatchMock compact /> },
    { title: t("how.2.t"), body: t("how.2.d"), visual: <CodeMock /> },
    { title: t("how.3.t"), body: t("how.3.d"), visual: <BookingMock /> },
    { title: t("how.4.t"), body: t("how.4.d"), visual: <NeedleMock /> },
  ];

  return (
    <>
      {/* HERO — full bleed, slides under the floating nav */}
      <section className="relative -mt-[68px] overflow-hidden bg-night pt-[68px] text-white sm:-mt-[80px] sm:pt-[80px]">
        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 gap-2.5 p-2.5 opacity-60 sm:grid-cols-4 sm:gap-3 sm:p-3" aria-hidden>
          {columns.map((col, ci) => (
            <div key={ci} className={`flex flex-col gap-3 ${ci % 2 ? "-mt-24" : "mt-6"} ${ci > 2 ? "hidden sm:flex" : ""}`}>
              {col.map((src) => (
                <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
                  <Image src={src} alt="" fill quality={50} sizes="(max-width: 640px) 33vw, 25vw" className="object-cover" />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgb(20_32_28/0.55),rgb(20_32_28/0.92)_70%)]" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-night" aria-hidden />

        <div className="relative container-x flex flex-col items-center pt-16 text-center sm:pt-24">
          <p className="animate-fade-up text-[12px] font-medium tracking-[0.22em] text-white/80 uppercase">{t("hero.eyebrow")}</p>
          <h1 className="mt-5 max-w-4xl text-[3rem] leading-[0.98] font-semibold tracking-[-0.04em] [text-wrap:balance] sm:text-[5.2rem]">
            <Accent text={t("hero.title")} />
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-7 text-white/85">{t("hero.sub")}</p>

          <form action="/collection" className="mt-8 flex w-full max-w-xl animate-fade-up items-center gap-2 rounded-full border border-white/15 bg-white/10 p-1.5 pl-5 backdrop-blur-md [animation-delay:140ms]" role="search">
            <Search className="size-4 shrink-0 text-white/70" aria-hidden />
            <label htmlFor="hero-q" className="sr-only">
              Search designs
            </label>
            <input id="hero-q" name="q" type="search" placeholder={t("hero.search")} className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-white placeholder:text-white/60 focus:outline-none" />
            <button className="btn shrink-0 bg-white px-5 text-ink hover:bg-ivory">
              <span className="hidden sm:inline">{t("cta.start")}</span>
              <span className="sm:hidden">{t("cta.short")}</span>
              <ArrowUpRight className="size-4" aria-hidden />
            </button>
          </form>
          <Link href="/custom" className="mt-5 animate-fade-up text-sm text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white [animation-delay:180ms]">
            {t("cta.dream")} →
          </Link>

          {hero && (
            <div className="mt-12 -mb-28 animate-fade-up [animation-delay:200ms] sm:-mb-40">
              <HeroPhone title={hero.design.name} layers={hero.layers} presets={presets} />
            </div>
          )}
        </div>
      </section>

      {/* White sheet sliding over the hero */}
      <div className="relative z-10 -mt-10 rounded-t-[40px] bg-paper pt-20 shadow-[0_-20px_40px_-20px_rgb(20_32_28/0.35)] sm:-mt-14 sm:rounded-t-[56px] sm:pt-28">
        {/* TOOLKIT STATEMENT */}
        <section className="container-x text-center">
          <p className="eyebrow">{t("toolkit.eyebrow")}</p>
          <p className="mx-auto mt-5 max-w-4xl text-[2rem] leading-[1.15] font-semibold tracking-[-0.03em] text-ink [text-wrap:balance] sm:text-[3.1rem]">
            <Accent text={t("toolkit.title")} />
          </p>
        </section>

        <div className="mt-20">
          <Marquee items={[...occasions]} />
        </div>

        {/* HOW IT WORKS — carousel */}
        <section className="container-x pt-24 md:pt-32" id="how">
          <SectionHeading eyebrow={t("how.eyebrow")} title={t("how.title")} sub="No account, no forms to print. Everything happens on your phone and on WhatsApp." />
          <div className="mt-14">
            <StepsCarousel label={t("how.eyebrow")} steps={steps} />
          </div>
          <div className="mt-8 text-center">
            <Link href="/how-it-works" className="btn-secondary">
              The full process <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* FEATURED COLLECTION */}
        <section className="container-x pt-24 md:pt-32">
          <SectionHeading eyebrow={t("collection.eyebrow")} title={t("collection.title")} sub="Every design is a starting point. Open one to change colours, fabric and details." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c, i) => (
              <DesignCard key={c.design.id} item={c} palette={catalog.palette} priority={i < 2} fromLabel={t("collection.from")} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/collection" className="btn-primary h-12 px-7">
              {t("collection.viewAll")} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* FEATURES WITH MOCKUPS */}
        <section className="container-x pt-24 md:pt-32">
          <SectionHeading eyebrow={t("features.eyebrow")} title={t("features.title")} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [t("features.colour.t"), t("features.colour.d"), <SwatchMock key="s" />],
              [t("features.price.t"), t("features.price.d"), <PriceMock key="p" />],
              [t("features.wa.t"), t("features.wa.d"), <ChatMock key="c" />],
              [t("features.measure.t"), t("features.measure.d"), <BookingMock key="b" />],
            ].map(([title, body, mock]) => (
              <article key={title as string} className="card flex flex-col items-center px-5 pt-7 pb-7 text-center">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink">{title}</h3>
                <div className="mt-5 flex min-h-52 w-full items-center justify-center">{mock}</div>
                <p className="mt-5 text-[15px] leading-6 text-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CUSTOMISER PREVIEW */}
        {frock && (
          <section className="container-x pt-24 md:pt-32">
            <div className="card grid items-center gap-8 overflow-hidden p-6 md:grid-cols-2 md:p-12">
              <div className="order-2 md:order-1">
                <p className="eyebrow">See it before it&apos;s sewn</p>
                <h2 className="h-display mt-4 text-[2.4rem] leading-[1.05] sm:text-5xl">
                  <Accent text="Change *everything*. Watch it change." />
                </h2>
                <p className="mt-5 text-[16px] leading-7 text-muted">
                  Swap colours for each part of the dress, choose your fabric, add sleeves, pockets, lace or a crocheted hem. Options that don&apos;t go together are explained, and the itemised price is always one tap away.
                </p>
                <Link href={`/collection/${frock.design.slug}`} className="btn-primary mt-8 h-12 px-7">
                  Try the customiser <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </div>
              <div className="order-1 grid grid-cols-3 gap-3 md:order-2">
                {[
                  ["sky", "ivory"],
                  ["terracotta", "cream"],
                  ["deep-green", "gold"],
                ].map(([m, a]) => (
                  <div key={m} className="rounded-[22px] bg-paper p-1.5">
                    <DressFigure layers={frock.layers} colorOf={(r) => pal(r === "main" ? m : a)} idPrefix={`pv-${m}`} className="h-auto w-full" title={`${frock.design.name} in ${m}`} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CUSTOM REQUEST */}
        <section className="container-x pt-24 md:pt-32">
          <SectionHeading eyebrow={t("custom.eyebrow")} title={t("custom.title")} sub={t("custom.sub")} />
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-3">
            <div className="card p-6 text-center">
              <Link2 className="mx-auto size-6 text-gold-600" aria-hidden />
              <p className="mt-3 text-lg font-semibold tracking-tight text-ink">Paste a link</p>
              <div className="mt-4 truncate rounded-full bg-paper px-4 py-2.5 text-xs text-muted">pinterest.com/pin/dream-dress…</div>
            </div>
            <div className="card p-6 text-center">
              <Upload className="mx-auto size-6 text-gold-600" aria-hidden />
              <p className="mt-3 text-lg font-semibold tracking-tight text-ink">Upload photos</p>
              <div className="mt-4 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="aspect-square flex-1 rounded-xl bg-[linear-gradient(135deg,var(--color-rose-50),var(--color-gold-50))]" />
                ))}
              </div>
            </div>
            <div className="card flex items-center justify-center p-4">
              <ChatMock />
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link href="/custom" className="btn-primary h-12 px-7">
              {t("cta.dream")} <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* STORY */}
        <section id="story" className="container-x pt-24 md:pt-32">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
              <Image src="/catalog/blush-leaf-tulle-gown/detail.webp" alt="Close-up of a hand-sculpted satin leaf appliqué" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div>
              <SectionHeading eyebrow={t("story.eyebrow")} title={t("story.title")} align="left" />
              <p className="mt-6 text-[17px] leading-8 text-ink/80">{t("story.body")}</p>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-8">
                {[
                  ["100%", "Made to order"],
                  ["1", "Fitting included"],
                  ["3 wks", "Typical lead time"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <p className="font-serif text-5xl leading-none text-ink">{n}</p>
                    <p className="mt-2 text-xs text-muted">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="container-x pt-24 md:pt-32">
          <SectionHeading eyebrow={t("testimonials.eyebrow")} title={t("testimonials.title")} sub="Real dresses, real occasions — from homecomings to weddings." />
          <div className="mt-12">
            <Testimonials items={testimonials} />
          </div>
        </section>

        {/* FAQ */}
        <section className="container-x pt-24 md:pt-32">
          <SectionHeading eyebrow={t("faq.eyebrow")} title={t("faq.title")} sub="Clear answers about prices, timing, measurements and payment." />
          <div className="mx-auto mt-12 max-w-3xl">
            <Faq items={homeFaqs} />
            <p className="mt-8 text-center text-[15px] text-muted">
              Have more questions?{" "}
              <Link href="/faq" className="font-semibold text-ink underline-offset-4 hover:underline">
                Read the full FAQ
              </Link>
            </p>
          </div>
          <JsonLd data={faqLd(homeFaqs)} />
        </section>

        {/* CLOSING CTA */}
        <section className="container-x pt-24 md:pt-32">
          <div className="relative overflow-hidden rounded-[40px] bg-night px-6 py-16 text-center text-white md:py-24">
            <svg className="pointer-events-none absolute -top-16 -right-16 size-80 opacity-10" viewBox="0 0 48 48" aria-hidden>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="24" cy="14.2" rx="6.6" ry="9.4" transform={`rotate(${a} 24 24)`} fill="none" stroke="#fff" strokeWidth="1" />
              ))}
            </svg>
            <h2 className="mx-auto max-w-2xl text-[2.6rem] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-6xl">
              <Accent text={t("closing.title")} />
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/75">{t("closing.sub")}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/collection" className="btn-gold h-12 px-7">
                {t("cta.start")} <ArrowUpRight className="size-4" aria-hidden />
              </Link>
              <Link href="/custom" className="btn h-12 border border-white/25 px-7 text-white hover:bg-white/10">
                {t("cta.dream")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
