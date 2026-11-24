export const revalidate = 3600;

import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { listDesigns } from "@/lib/server/catalog";
import { guides } from "@/data/guides";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const designs = await listDesigns();
  const alt = (path: string) => ({ languages: { en: `${site.url}${path}`, si: `${site.url}${path}?lang=si`, ta: `${site.url}${path}?lang=ta` } });
  const pages = ["/", "/collection", "/custom", "/how-it-works", "/pricing", "/faq", "/designer", "/size-guide", "/guides", "/contact", "/track", "/terms", "/privacy"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7, alternates: alt(p) })),
    ...designs.map((d) => ({ url: `${site.url}/collection/${d.slug}`, lastModified: d.updated_at, priority: 0.8, alternates: alt(`/collection/${d.slug}`) })),
    ...guides.map((g) => ({ url: `${site.url}/guides/${g.slug}`, lastModified: g.updated, priority: 0.6 })),
  ];
}
