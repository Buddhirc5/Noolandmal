import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DesignCard } from "@/components/DesignCard";
import { GridView } from "@/components/collection/GridView";
import { CollectionFilters } from "@/components/collection/Filters";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd, breadcrumbLd } from "@/components/JsonLd";
import { listDesignCards, loadCatalog } from "@/lib/server/catalog";
import { categories, occasions } from "@/config/site";

export const metadata: Metadata = {
  title: "Collection — made-to-order dresses, sarees & crochet",
  description: "Browse Nool & Mal designs: occasion gowns, frocks, pre-draped sarees, blouses, crochet tops and kids' frocks. Customise colours and details and see the price live.",
  alternates: { canonical: "/collection" },
};

const PRICES = [
  { value: "under-10k", label: "Under 10k", min: 0, max: 9999 },
  { value: "10k-25k", label: "10k – 25k", min: 10000, max: 25000 },
  { value: "25k-45k", label: "25k – 45k", min: 25001, max: 45000 },
  { value: "45k-plus", label: "45k +", min: 45001, max: Infinity },
];
const PER_PAGE = 9;

export default async function CollectionPage({ searchParams }: PageProps<"/collection">) {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const [cards, catalog] = await Promise.all([listDesignCards(), loadCatalog()]);

  const category = get("category");
  const occasion = get("occasion");
  const fabric = get("fabric");
  const price = PRICES.find((p) => p.value === get("price"));
  const q = get("q")?.toLowerCase().trim();

  const fromPrice = (c: (typeof cards)[number]) => c.design.base_price;
  const filtered = cards.filter((c) => {
    const d = c.design;
    if (category && d.category !== category) return false;
    if (occasion && !d.occasions.includes(occasion)) return false;
    if (fabric && !d.fabric_keys.includes(fabric)) return false;
    if (price) {
      const p = fromPrice(c);
      if (p < price.min || p > price.max) return false;
    }
    if (q) {
      const hay = [d.name, d.description, d.category, ...d.occasions, ...c.fabrics.map((f) => f.name)].join(" ").toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(get("page")) || 1));
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pageHref = (n: number) => {
    const p = new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]);
    p.set("page", String(n));
    return `/collection?${p}`;
  };

  const usedCategories = categories.filter((c) => cards.some((x) => x.design.category === c.key));
  const usedFabrics = catalog.fabrics.filter((f) => f.active && cards.some((x) => x.design.fabric_keys.includes(f.key)));

  return (
    <div className="container-x py-10 md:py-16">
      <SectionHeading as="h1" eyebrow="The collection" title="Choose a design to make yours" sub="Every design is a starting point. Open one to change colours, fabric and details — the price updates as you go." />
      <div className="mt-8">
        <Suspense fallback={<div className="skeleton h-12" />}>
          <CollectionFilters
            categories={usedCategories.map((c) => ({ value: c.key, label: c.label }))}
            occasions={occasions.map((o) => ({ value: o, label: o }))}
            fabrics={usedFabrics.map((f) => ({ value: f.key, label: f.name }))}
            prices={PRICES.map(({ value, label }) => ({ value, label }))}
          />
        </Suspense>
      </div>
      {shown.length ? (
        <GridView count={filtered.length}>
          {shown.map((c, i) => (
            <DesignCard key={c.design.id} item={c} palette={catalog.palette} priority={i < 4} headingLevel="h2" />
          ))}
        </GridView>
      ) : (
        <div className="card mt-4 flex flex-col items-center p-12 text-center">
          <p className="font-serif text-2xl text-green-900">No designs match those filters</p>
          <p className="mt-2 max-w-sm text-sm text-muted">Try clearing a filter — or send us a photo of what you have in mind and we&apos;ll make it for you.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/collection" className="btn-secondary">
              Clear filters
            </Link>
            <Link href="/custom" className="btn-primary">
              Send a custom request
            </Link>
          </div>
        </div>
      )}
      {pages > 1 && (
        <nav className="mt-10 flex justify-center gap-2" aria-label="Pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={pageHref(n)} aria-current={n === page ? "page" : undefined} className={`chip min-w-11 justify-center ${n === page ? "chip-active" : ""}`}>
              {n}
            </Link>
          ))}
        </nav>
      )}
      <JsonLd data={breadcrumbLd([{ name: "Home", url: "/" }, { name: "Collection", url: "/collection" }])} />
    </div>
  );
}
