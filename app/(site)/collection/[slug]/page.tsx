import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Customiser } from "@/components/customiser/Customiser";
import { JsonLd, breadcrumbLd } from "@/components/JsonLd";
import { getDesignBundle, loadCatalog, publicCatalog, queueWeeks } from "@/lib/server/catalog";
import { computePrice, defaultSelections } from "@/lib/pricing";
import { decodeSelections } from "@/lib/selections";
import { site } from "@/config/site";

export async function generateMetadata({ params }: PageProps<"/collection/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const b = await getDesignBundle(slug);
  if (!b) return { title: "Design not found" };
  return {
    title: `${b.design.name} — customise & get a quote`,
    description: `${b.design.description} Made to order in Sri Lanka from LKR ${b.design.base_price.toLocaleString("en-LK")}.`,
    alternates: { canonical: `/collection/${slug}` },
    openGraph: { images: b.design.images[0] ? [{ url: b.design.images[0] }] : undefined },
  };
}

export default async function DesignPage({ params, searchParams }: PageProps<"/collection/[slug]">) {
  const { slug } = await params;
  const [bundle, catalog, weeks] = await Promise.all([getDesignBundle(slug), loadCatalog(), queueWeeks()]);
  if (!bundle) notFound();
  const base = defaultSelections(bundle.design, bundle.regions, catalog);
  const sp = await searchParams;
  const initial = decodeSelections(sp as Record<string, string>, base);

  // Product structured data with the price range across fabrics
  const fabricMods = catalog.fabrics.filter((f) => bundle.design.fabric_keys.includes(f.key)).map((f) => f.price_modifier);
  const low = computePrice(catalog, bundle.design, { ...base, fabric: bundle.design.fabric_keys[fabricMods.indexOf(Math.min(...fabricMods))] ?? base.fabric }).min;
  const high = computePrice(catalog, bundle.design, base).max;
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bundle.design.name,
    description: bundle.design.description,
    image: bundle.design.images.map((i) => `${site.url}${i}`),
    brand: { "@type": "Brand", name: site.name },
    category: bundle.design.category,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "LKR",
      lowPrice: Math.min(low, high),
      highPrice: Math.max(low, high),
      availability: "https://schema.org/MadeToOrder",
      seller: { "@id": `${site.url}/#business` },
    },
  };

  return (
    <div className="container-x py-6 md:py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <a href="/collection" className="hover:text-green-900">
          Collection
        </a>{" "}
        / <span className="text-ink">{bundle.design.name}</span>
      </nav>
      <Customiser bundle={bundle} catalog={publicCatalog(catalog)} initial={initial} queueWeeks={weeks} />
      <JsonLd data={product} />
      <JsonLd data={breadcrumbLd([{ name: "Home", url: "/" }, { name: "Collection", url: "/collection" }, { name: bundle.design.name, url: `/collection/${slug}` }])} />
    </div>
  );
}
