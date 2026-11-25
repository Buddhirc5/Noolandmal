import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand } from "@/components/ui/CtaBand";
import { listGallery } from "@/lib/server/gallery";

export const metadata: Metadata = {
  title: "Gallery — dresses made for real customers",
  description: "Finished made-to-order dresses, gowns and sarees from the Nool & Mal studio in Kotte, Sri Lanka — each one cut and fitted for a real customer.",
  alternates: { canonical: "/gallery" },
};

export default async function Gallery() {
  const items = await listGallery();
  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader eyebrow="Gallery" title="Made for *real* customers" sub="Every piece here was cut, sewn and fitted for one person. Tap any piece for the full story." />
      {items.length ? (
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
          {items.map((g, i) => (
            <li key={g.id}>
              <Link href={`/gallery/${g.slug}`} className="group card lift block overflow-hidden p-2.5">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-surface-2">
                  <Image src={g.images[0]} alt={g.title} fill priority={i < 3} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={70} className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
                  {g.images.length > 1 && <span className="badge absolute top-3 right-3 bg-paper/95">{g.images.length} photos</span>}
                </div>
                <div className="px-2.5 pt-4 pb-2">
                  {g.occasion && <p className="text-[12px] font-medium tracking-[0.14em] text-muted uppercase">{g.occasion}</p>}
                  <h2 className="mt-1 text-xl leading-tight font-semibold tracking-[-0.02em] text-ink">{g.title}</h2>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-12 text-center text-muted">New pieces coming soon.</p>
      )}
      <CtaBand title="Want one made for *you*?" />
    </div>
  );
}
