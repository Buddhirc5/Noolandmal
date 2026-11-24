import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Link2, Upload } from "lucide-react";
import { HeroPhone, type HeroPreset } from "@/components/home/HeroPhone";
import { StepsCarousel } from "@/components/home/StepsCarousel";
import { Marquee } from "@/components/home/Marquee";
import { BookingMock, ChatMock, CodeMock, NeedleMock, PriceMock, SwatchMock } from "@/components/home/Mockups";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-12 pt-10 pb-16 md:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
          <div className="animate-fade-up">
            <p className="eyebrow">{t("hero.eyebrow")}</p>
            <h1 className="h-display mt-4 text-[3.1rem] leading-[0.98] sm:text-7xl">{t("hero.title")}</h1>
            <p className="mt-6 max-w-xl text-[17px] leading-8 text-muted">{t("hero.sub")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/collection" className="btn-primary h-12 px-7 text-[15px]">
                {t("cta.start")} <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/custom" className="btn-secondary h-12 px-7 text-[15px]">
                {t("cta.dream")}
              </Link>
            </div>
            <p className="mt-8 flex items-center gap-3 text-sm text-muted">
              <span className="flex -space-x-2" aria-hidden>
                {["#1F4D40", "#D9A5A0", "#C9A66B", "#9ED9D2"].map((c) => (
                  <span key={c} className="size-6 rounded-full border-2 border-ivory" style={{ background: c }} />
                ))}
              </span>
              {t("hero.trust")}
            </p>
          </div>
          {hero && (
            <div className="animate-fade-up [animation-delay:120ms]">
              <HeroPhone title={hero.design.name} layers={hero.layers} presets={presets} />
            </div>
          )}
        </div>
      </section>

      <Marquee items={[...occasions]} />

      {/* HOW IT WORKS */}
      <section className="container-x py-20 md:py-28" id="how">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow={t("how.eyebrow")} title={t("how.title")} />
          <Link href="/how-it-works" className="btn-ghost self-start md:self-auto">
            Learn more <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-10">
          <StepsCarousel steps={steps} />
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-paper py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow={t("features.eyebrow")} title={t("features.title")} align="center" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [t("features.colour.t"), t("features.colour.d"), <SwatchMock key="s" />],
              [t("features.price.t"), t("features.price.d"), <PriceMock key="p" />],
              [t("features.wa.t"), t("features.wa.d"), <ChatMock key="c" />],
              [t("features.measure.t"), t("features.measure.d"), <BookingMock key="b" />],
            ].map(([title, body, mock]) => (
              <article key={title as string} className="card card-hover flex flex-col overflow-hidden bg-ivory/40">
                <div className="flex min-h-56 items-center justify-center p-5">{mock}</div>
                <div className="border-t border-line bg-paper p-5">
                  <h3 className="font-semibold text-green-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTION */}
      <section className="container-x py-20 md:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow={t("collection.eyebrow")} title={t("collection.title")} />
          <Link href="/collection" className="btn-secondary self-start md:self-auto">
            {t("collection.viewAll")} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c, i) => (
            <DesignCard key={c.design.id} item={c} palette={catalog.palette} priority={i < 2} fromLabel={t("collection.from")} />
          ))}
        </div>
      </section>

      {/* CUSTOMISER PREVIEW */}
      {frock && (
        <section className="container-x">
          <div className="card grid overflow-hidden md:grid-cols-2">
            <div className="relative flex items-center justify-center bg-[#F1ECE4] p-6">
              <div className="grid w-full max-w-sm grid-cols-3 gap-3">
                {[
                  ["sky", "ivory"],
                  ["terracotta", "cream"],
                  ["deep-green", "gold"],
                ].map(([m, a]) => (
                  <div key={m} className="rounded-2xl bg-paper p-1">
                    <DressFigure layers={frock.layers} colorOf={(r) => pal(r === "main" ? m : a)} idPrefix={`pv-${m}`} className="h-auto w-full" title={`${frock.design.name} in ${m}`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 md:p-12">
              <p className="eyebrow">See it before it&apos;s sewn</p>
              <h2 className="h-display mt-3 text-4xl leading-tight">Change everything. Watch it change.</h2>
              <p className="mt-4 text-[15px] leading-7 text-muted">
                Swap colours for each part of the dress, choose your fabric, add sleeves, pockets, lace or a crocheted hem. Incompatible choices are explained, not hidden — and the
                itemised price is always one tap away.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-2 text-sm text-ink">
                {["24 curated colours", "10 fabrics", "50+ add-ons", "Shareable design link"].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-gold" /> {x}
                  </li>
                ))}
              </ul>
              <Link href={`/collection/${frock.design.slug}`} className="btn-primary mt-8">
                Try the customiser <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CUSTOM REQUEST TEASER */}
      <section className="container-x py-20 md:py-28">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow={t("custom.eyebrow")} title={t("custom.title")} sub={t("custom.sub")} />
            <Link href="/custom" className="btn-primary mt-8">
              {t("cta.dream")} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <Link2 className="size-5 text-gold-600" aria-hidden />
              <p className="mt-3 font-semibold text-green-900">Paste a link</p>
              <div className="mt-3 truncate rounded-xl border border-line bg-ivory px-3 py-2 text-xs text-muted">pinterest.com/pin/dream-dress…</div>
            </div>
            <div className="card p-5">
              <Upload className="size-5 text-gold-600" aria-hidden />
              <p className="mt-3 font-semibold text-green-900">Upload photos</p>
              <div className="mt-3 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="aspect-square flex-1 rounded-lg bg-[linear-gradient(135deg,var(--color-rose-50),var(--color-gold-50))]" />
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <ChatMock />
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="bg-paper py-20 md:py-28">
        <div className="container-x grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
            <Image src="/catalog/blush-leaf-tulle-gown/detail.webp" alt="Close-up of a hand-sculpted satin leaf appliqué" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <SectionHeading eyebrow={t("story.eyebrow")} title={t("story.title")} />
            <p className="mt-6 text-[17px] leading-8 text-ink/85">{t("story.body")}</p>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-8">
              {[
                ["100%", "Made to order"],
                ["1", "Fitting included"],
                ["3 wks", "Typical lead time"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="font-serif text-4xl font-semibold text-green-900">{n}</p>
                  <p className="mt-1 text-xs text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-x py-20 md:py-28">
        <SectionHeading eyebrow={t("testimonials.eyebrow")} title={t("testimonials.title")} align="center" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((q, i) => (
            <figure key={i} className="card flex flex-col p-7">
              <span className="font-serif text-7xl leading-none text-gold" aria-hidden>
                &ldquo;
              </span>
              <blockquote className="-mt-4 flex-1 text-[15px] leading-7 text-ink/85">{q.quote}</blockquote>
              <figcaption className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
                <span className="font-medium text-green-900">{q.name}</span>
                <span className="badge">{q.occasion}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x grid gap-10 pb-20 md:grid-cols-[0.8fr_1.2fr] md:pb-28">
        <div>
          <SectionHeading eyebrow={t("faq.eyebrow")} title={t("faq.title")} />
          <Link href="/faq" className="btn-ghost mt-6 -ml-4">
            All questions <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <Faq items={homeFaqs} />
        <JsonLd data={faqLd(homeFaqs)} />
      </section>

      {/* CLOSING CTA */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-[28px] bg-green-900 px-6 py-16 text-center text-white md:py-20">
          <svg className="pointer-events-none absolute -top-16 -right-16 size-72 opacity-10" viewBox="0 0 48 48" aria-hidden>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="24" cy="14.2" rx="6.6" ry="9.4" transform={`rotate(${a} 24 24)`} fill="none" stroke="#fff" strokeWidth="1" />
            ))}
          </svg>
          <h2 className="font-serif text-4xl font-semibold sm:text-5xl">{t("closing.title")}</h2>
          <p className="mx-auto mt-4 max-w-md text-white/75">{t("closing.sub")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/collection" className="btn-gold h-12 px-7">
              {t("cta.start")}
            </Link>
            <Link href="/custom" className="btn h-12 border border-white/30 px-7 text-white hover:bg-white/10">
              {t("cta.dream")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
