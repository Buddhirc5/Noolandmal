import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { guides } from "@/data/guides";

export const metadata: Metadata = {
  title: "Guides — custom dresses in Sri Lanka",
  description: "Practical guides on made-to-order dress prices, tailoring timelines and planning outfits for weddings and homecomings in Sri Lanka.",
  alternates: { canonical: "/guides" },
};

export default function Guides() {
  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader eyebrow="Guides" title="Good to know" />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="card card-hover p-6">
            <h2 className="font-serif text-2xl font-semibold text-green-900">{g.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{g.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
