import Image from "next/image";
import { listGallery } from "@/lib/server/gallery";
import Link from "next/link";
import { FannedPhotos } from "@/components/home/FannedPhotos";
import { Parallax } from "@/components/motion/Parallax";
import { ScrollWords } from "@/components/motion/ScrollWords";
import { CountUp } from "@/components/motion/CountUp";
import { StepsCarousel, type Step } from "@/components/home/StepsCarousel";
import { Testimonials } from "@/components/home/Testimonials";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accent } from "@/components/ui/Accent";
import { Faq } from "@/components/ui/Faq";
import { DesignCard } from "@/components/DesignCard";
import { JsonLd, faqLd } from "@/components/JsonLd";
import { getT } from "@/lib/i18n-server";
import { listDesignCards, loadCatalog } from "@/lib/server/catalog";
import { faqs } from "@/data/faq";
import { site, testimonials } from "@/config/site";

const img = (slug: string, view: "front" | "back" | "detail" | "angle") => `/catalog/${slug}/${view}.webp`;

export default async function HomePage() {
  const t = await getT();
  const [cards, catalog, allGallery] = await Promise.all([listDesignCards(), loadCatalog(), listGallery()]);
  const gallery = [...allGallery.filter((g) => g.featured), ...allGallery.filter((g) => !g.featured)];
  const bySlug = new Map(cards.map((c) => [c.design.slug, c]));
  const featured = cards.filter((c) => c.design.featured).slice(0, 6);

  // Hero fan: preferred looks first, then any published design with photos; the first one sits in the middle
  const fanSlugs = ["champagne-lace-high-neck-saree", "navy-sequin-fan-party-dress", "botanical-bow-shoulder-mini", "lilac-ruffle-saree", "aqua-one-shoulder-cape-gown"];
  const pool = [...fanSlugs.map((s) => bySlug.get(s)), ...cards].filter((c, i, a): c is (typeof cards)[number] => Boolean(c && c.design.images.length) && a.indexOf(c) === i).slice(0, 5);
  const fanItems = pool.map((c) => ({ src: c.design.images[0], alt: c.design.name, href: `/collection/${c.design.slug}` }));
  const order = fanItems.length === 5 ? [3, 1, 0, 2, 4] : fanItems.map((_, i) => i);
  const fan = order.map((i) => fanItems[i]).filter(Boolean);

  const steps: Step[] = [
    { title: t("how.1.t"), body: t("how.1.d"), image: img("navy-sequin-fan-party-dress", "angle"), alt: "Navy sequin party dress" },
    { title: t("how.2.t"), body: t("how.2.d"), image: img("lilac-ruffle-saree", "detail"), alt: "Lace blouse and ruffled saree close-up" },
    { title: t("how.3.t"), body: t("how.3.d"), image: img("cocoa-linen-peplum-top", "detail"), alt: "Linen peplum top seams" },
    { title: t("how.4.t"), body: t("how.4.d"), image: img("champagne-lace-high-neck-saree", "angle"), alt: "Champagne lace saree" },
  ];

  const craft = [
    { src: img("navy-sequin-fan-party-dress", "detail"), title: "Sequins, sewn by hand", body: "Every ray of sequins is placed and stitched one by one." },
    { src: img("champagne-lace-high-neck-saree", "detail"), title: "Scalloped lace", body: "Gold-thread embroidery finished with a hand-cut border." },
    { src: img("blush-leaf-tulle-gown", "detail"), title: "Sculpted appliqué", body: "Satin leaves shaped and layered in our Colombo studio." },
  ];

  const homeFaqs = faqs.filter((f) => f.home);

  return (
    <>
      {/* HERO — full-bleed studio photograph under the floating nav */}
      <section className="relative -mt-[68px] overflow-hidden pt-[68px] text-white sm:-mt-[80px] sm:pt-[80px]">
        <Parallax speed={0.25} className="absolute inset-0">
          <Image src="/brand/hero-studio.webp" alt="" fill priority quality={70} sizes="100vw" className="scale-110 object-cover object-[50%_42%]" />
        </Parallax>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/55" aria-hidden />
        <Parallax speed={0.35} fade={1.4} className="relative">
        <div className="container-x pt-14 text-center sm:pt-24">
          <p className="animate-page-in text-[12px] font-medium tracking-[0.2em] text-white/85 uppercase">{t("hero.eyebrow")}</p>
          <h1 className="animate-page-in mx-auto mt-5 max-w-4xl [animation-delay:80ms] text-[2.9rem] leading-[1] font-semibold tracking-[-0.04em] [text-shadow:0_2px_24px_rgb(0_0_0/0.25)] [text-wrap:balance] sm:text-[5.2rem]">
            <Accent text={t("hero.title")} />
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-7 text-white/90">{t("hero.sub")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/collection" className="btn h-[52px] w-full max-w-xs bg-white px-8 text-[16px] text-ink hover:bg-ivory sm:w-auto">
              {t("cta.start")}
            </Link>
            <Link href="/custom" className="btn h-[52px] w-full max-w-xs border border-white/30 bg-white/10 px-8 text-[16px] text-white backdrop-blur-md hover:bg-white/20 sm:w-auto">
              {t("cta.dream")}
            </Link>
          </div>
        </div>
        </Parallax>
        <div className="relative mt-14 -mb-16 sm:mt-20 sm:-mb-24">
          <Parallax speed={0.12}>
            <FannedPhotos items={fan} />
          </Parallax>
        </div>
      </section>

      {/* White sheet sliding over the hero */}
      <div className="relative z-10 -mt-12 rounded-t-[40px] bg-paper pb-4 shadow-[0_-24px_48px_-24px_rgb(0_0_0/0.35)] sm:-mt-16 sm:rounded-t-[56px]">
      {/* STATEMENT */}
      <section className="container-x pt-20 text-center sm:pt-24">
        <p className="eyebrow">{t("toolkit.eyebrow")}</p>
        <ScrollWords text={t("toolkit.title")} className="mx-auto mt-5 max-w-4xl text-[2rem] leading-[1.15] font-semibold tracking-[-0.03em] text-ink [text-wrap:balance] sm:text-[3rem]" />
      </section>

      {/* HOW IT WORKS */}
      <section className="container-x pt-24 md:pt-32" id="how">
        <SectionHeading eyebrow={t("how.eyebrow")} title={t("how.title")} sub="No account and no forms. Everything happens on your phone and on WhatsApp." />
        <div className="mt-14">
          <StepsCarousel label={t("how.eyebrow")} steps={steps} />
        </div>
      </section>

      {/* COLLECTION */}
      <section className="container-x pt-24 md:pt-32">
        <SectionHeading eyebrow={t("collection.eyebrow")} title={t("collection.title")} sub="Every design is a starting point. Open one to choose your colour and how we take your measurements." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
          {featured.map((c) => (
            <DesignCard key={c.design.id} item={c} palette={catalog.palette} fromLabel={t("collection.from")} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/collection" className="btn-primary h-[52px] px-8 text-[16px]">
            {t("collection.viewAll")}
          </Link>
        </div>
      </section>

      {/* CRAFT */}
      <section className="container-x pt-24 md:pt-32">
        <SectionHeading eyebrow="The details" title="Finished by *hand*" sub="Close-ups from the studio — the work that goes into every order." />
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-2" data-reveal-stagger>
          {craft.map((c, i) => (
            <figure key={c.src} className={`group relative overflow-hidden rounded-[28px] bg-surface ${i === 0 ? "aspect-[4/5] md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[560px]" : "aspect-[4/3]"}`}>
              <Image src={c.src} alt={c.title} fill sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-6 pt-16 text-white">
                <p className="text-[19px] font-semibold tracking-[-0.01em]">{c.title}</p>
                <p className="mt-1 text-[14px] text-white/85">{c.body}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CUSTOM REQUEST */}
      <section className="container-x pt-24 md:pt-32">
        <div className="card grid items-center gap-10 overflow-hidden p-6 md:grid-cols-2 md:p-12" data-reveal>
          <div>
            <p className="eyebrow">{t("custom.eyebrow")}</p>
            <h2 className="h-display mt-4 text-[2.4rem] leading-[1.05] sm:text-5xl">
              <Accent text={t("custom.title")} />
            </h2>
            <p className="mt-5 text-[16px] leading-7 text-muted">{t("custom.sub")}</p>
            <Link href="/custom" className="btn-primary mt-8 h-[52px] px-8 text-[16px]">
              Send a link or photo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[img("noir-sequin-sash-gown", "back"), img("sage-bloom-lehenga-set", "back")].map((src, i) => (
              <div key={src} className={`relative aspect-[3/4] overflow-hidden rounded-[24px] bg-surface-2 ${i === 1 ? "mt-10" : ""}`}>
                <Image src={src} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="container-x pt-24 md:pt-32">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-surface" data-reveal="scale">
            <Image src="/brand/roshini-shyama.webp" alt={`${site.designer}, designer and founder`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-top" />
          </div>
          <div>
            <SectionHeading eyebrow={t("story.eyebrow")} title={t("story.title")} align="left" />
            <p className="mt-6 text-[17px] leading-8 text-ink/80">{t("story.body")}</p>
            <Link href="/designer" className="btn-secondary mt-6">
              Meet {site.designer.split(" ")[0]}
            </Link>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8">
              {[
                [site.designerYears, "Years of experience"],
                [site.designerPieces, "Pieces made"],
                ["1–3 wks", "Typical making time"],
              ].map(([n, l]) => (
                <div key={l}>
                  <CountUp value={n} className="block text-[2rem] sm:text-[2.4rem] leading-none font-semibold tracking-[-0.03em] text-ink" />
                  <p className="mt-2 text-[13px] text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {gallery.length > 0 && (
        <section className="container-x pt-24 md:pt-32">
          <div className="grid items-end gap-6 md:grid-cols-2">
            <SectionHeading eyebrow="Gallery" title="Made for *real* customers" align="left" />
            <p className="text-[16px] leading-7 text-muted md:text-right">
              Finished pieces from the studio.{" "}
              <Link href="/gallery" className="font-semibold text-ink underline-offset-4 hover:underline">
                See the gallery
              </Link>
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4" data-reveal-stagger>
            {gallery
              .flatMap((g) => g.images.map((src) => ({ src, g })))
              .slice(0, 4)
              .map(({ src, g }, i) => (
                <Link key={src} href={`/gallery/${g.slug}`} className={`group relative aspect-[3/4] overflow-hidden rounded-[24px] bg-surface ${i % 2 ? "md:mt-10" : ""}`}>
                  <Image src={src} alt={g.title} fill sizes="(max-width: 768px) 50vw, 25vw" quality={65} className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="container-x pt-24 md:pt-32">
        <SectionHeading eyebrow={t("testimonials.eyebrow")} title={t("testimonials.title")} />
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

      {/* CLOSING — full-bleed photo band, like the hero */}
      <section className="pt-24 md:pt-32">
        <div className="relative mx-3 overflow-hidden rounded-[36px] sm:mx-5" data-reveal="scale">
          <Parallax speed={-0.15} mode="center" className="absolute inset-x-0 -inset-y-24">
            <Image src="/brand/hero-studio.webp" alt="" fill quality={60} sizes="100vw" className="object-cover object-[50%_60%]" />
          </Parallax>
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/70" aria-hidden />
          <div className="relative px-6 py-24 text-center text-white md:py-36">
            <p className="text-[12px] font-medium tracking-[0.2em] text-white/80 uppercase">Designed by {site.designer}</p>
            <h2 className="mx-auto mt-5 max-w-3xl text-[2.8rem] leading-[1.02] font-semibold tracking-[-0.04em] [text-wrap:balance] sm:text-7xl">
              <Accent text={t("closing.title")} />
            </h2>
            <p className="mx-auto mt-5 max-w-md text-white/80">{t("closing.sub")}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/collection" className="btn h-[52px] w-full max-w-xs bg-white px-8 text-[16px] text-ink hover:bg-ivory sm:w-auto">
                {t("cta.start")}
              </Link>
              <Link href="/custom" className="btn h-[52px] w-full max-w-xs border border-white/30 bg-white/10 px-8 text-[16px] text-white backdrop-blur-md hover:bg-white/20 sm:w-auto">
                {t("cta.dream")}
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
