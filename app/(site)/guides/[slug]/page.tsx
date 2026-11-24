import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/ui/CtaBand";
import { JsonLd, breadcrumbLd } from "@/components/JsonLd";
import { guides } from "@/data/guides";
import { site } from "@/config/site";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = guides.find((x) => x.slug === slug);
  if (!g) return {};
  return { title: g.title, description: g.description, alternates: { canonical: `/guides/${g.slug}` }, openGraph: { type: "article" } };
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const g = guides.find((x) => x.slug === slug);
  if (!g) notFound();
  return (
    <article className="container-x max-w-3xl py-12 md:py-16">
      <Link href="/guides" className="text-sm text-muted hover:text-green-900">
        ← Guides
      </Link>
      <h1 className="h-display mt-4 text-5xl leading-[1.05]">{g.title}</h1>
      <p className="mt-3 text-sm text-muted">Updated {formatDate(g.updated)}</p>
      <div className="prose-nm mt-6">
        {g.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </section>
        ))}
      </div>
      <CtaBand />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.description,
          dateModified: g.updated,
          author: { "@type": "Organization", name: site.name },
          publisher: { "@id": `${site.url}/#business` },
          mainEntityOfPage: `${site.url}/guides/${g.slug}`,
        }}
      />
      <JsonLd data={breadcrumbLd([{ name: "Home", url: "/" }, { name: "Guides", url: "/guides" }, { name: g.title, url: `/guides/${g.slug}` }])} />
    </article>
  );
}
