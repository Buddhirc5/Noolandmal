import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGalleryItem, listGallery } from "@/lib/server/gallery";
import { getDesignBundle } from "@/lib/server/catalog";
import { JsonLd } from "@/components/JsonLd";
import { PhotoGrid } from "@/components/ui/PhotoGrid";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { site } from "@/config/site";
import { waLink } from "@/lib/whatsapp";

export async function generateMetadata({ params }: PageProps<"/gallery/[slug]">): Promise<Metadata> {
  const g = await getGalleryItem((await params).slug);
  if (!g || !g.published) return { title: "Gallery" };
  return {
    title: `${g.title} — made to order`,
    description: g.story.slice(0, 155),
    alternates: { canonical: `/gallery/${g.slug}` },
    openGraph: { images: [{ url: g.images[0] }] },
  };
}

export default async function GalleryPiece({ params }: PageProps<"/gallery/[slug]">) {
  const g = await getGalleryItem((await params).slug);
  if (!g || !g.published) notFound();
  const [design, others] = await Promise.all([g.design_slug ? getDesignBundle(g.design_slug) : null, listGallery()]);
  const more = others.filter((x) => x.id !== g.id).slice(0, 3);
  return (
    <div className="container-x py-10 md:py-14">
      <Link href="/gallery" className="text-sm text-muted hover:text-ink">
        ← Gallery
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <PhotoGrid images={g.images} alt={g.title} />
        <div className="lg:sticky lg:top-28 lg:self-start">
          {g.occasion && <p className="eyebrow">{g.occasion}</p>}
          <h1 className="h-display mt-3 text-[2.3rem] leading-[1.05] sm:text-5xl">{g.title}</h1>
          <p className="mt-5 text-[17px] leading-8 text-ink/80">{g.story}</p>
          <p className="mt-4 text-sm text-muted">Made to order by {site.designer} in our Kotte studio.</p>
          <div className="mt-8 space-y-3">
            {design && (
              <Link href={`/collection/${design.design.slug}`} className="btn-primary h-12 w-full">
                Start from the {design.design.name}
              </Link>
            )}
            <a href={waLink(`Hi Nool & Mal, I loved the "${g.title}" in your gallery (${site.url}/gallery/${g.slug}). Could you make something like it for me?`)} target="_blank" rel="noopener noreferrer" className="btn-wa h-12 w-full">
              <WhatsAppIcon className="size-5" /> Ask for one like this
            </a>
            <Link href="/custom" className="btn-secondary h-12 w-full">
              Send your own idea
            </Link>
          </div>
        </div>
      </div>
      {more.length > 0 && (
        <section className="mt-20">
          <h2 className="h-display text-[2rem]">More from the studio</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {more.map((m) => (
              <li key={m.id}>
                <Link href={`/gallery/${m.slug}`} className="card lift block overflow-hidden p-2">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-surface-2">
                    <Image src={m.images[0]} alt={m.title} fill sizes="(max-width: 640px) 100vw, 33vw" quality={65} className="object-cover object-top" />
                  </div>
                  <p className="px-2 pt-3 pb-1 font-medium">{m.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: g.title,
          description: g.story,
          image: g.images.map((i) => `${site.url}${i}`),
          creator: { "@type": "Person", name: site.designer },
          publisher: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />
    </div>
  );
}
