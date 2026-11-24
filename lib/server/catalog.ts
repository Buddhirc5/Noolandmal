import "server-only";
import { cache } from "react";
import { db } from "./db";
import { settings as defaultSettings } from "@/data/seed";
import type {
  AddonGroup,
  AddonOption,
  AddonRule,
  Catalog,
  Design,
  DesignBundle,
  DesignRegion,
  Fabric,
  PaletteColor,
  Settings,
  SizeOption,
} from "@/lib/types";

const bySort = <T extends { sort: number }>(a: T, b: T) => a.sort - b.sort;

export const loadSettings = cache(async (): Promise<Settings> => {
  const row = await db.get<{ id: number; data: Partial<Settings> }>("price_settings", { id: 1 });
  return { ...defaultSettings, ...(row?.data ?? {}) };
});

/** Price rules and options. Read per request so admin edits apply without a deploy. */
export const loadCatalog = cache(async (): Promise<Catalog> => {
  const [palette, fabrics, groups, options, rules, sizes, settings] = await Promise.all([
    db.list<PaletteColor>("palette_colors"),
    db.list<Fabric>("fabrics"),
    db.list<AddonGroup>("addon_groups"),
    db.list<AddonOption>("addon_options"),
    db.list<AddonRule>("addon_rules"),
    db.list<SizeOption>("size_options"),
    loadSettings(),
  ]);
  return {
    palette: palette.sort(bySort),
    fabrics: fabrics.sort(bySort),
    groups: groups.sort(bySort),
    options: options.sort(bySort),
    rules,
    sizes: sizes.sort(bySort),
    settings,
  };
});

/** Older rows may predate the photo fields. */
function withDefaults(d: Design): Design {
  return { ...d, images: d.images ?? [], color_images: d.color_images ?? {}, versions: d.versions ?? [] };
}

export const listDesigns = cache(async (opts: { includeUnpublished?: boolean } = {}): Promise<Design[]> => {
  const rows = await db.list<Design>("designs", opts.includeUnpublished ? {} : { eq: { published: true } });
  return rows.map(withDefaults).sort(bySort);
});

export const listAllRegions = cache(async () => db.list<DesignRegion>("design_regions"));

export const getDesignBundle = cache(async (slug: string, includeUnpublished = false): Promise<DesignBundle | null> => {
  const design = await db.get<Design>("designs", { slug });
  if (!design || (!design.published && !includeUnpublished)) return null;
  const regions = await db.list<DesignRegion>("design_regions", { eq: { design_id: design.id } });
  return { design: withDefaults(design), regions: regions.sort(bySort) };
});

export async function getDesignBundleById(id: string): Promise<DesignBundle | null> {
  const design = await db.get<Design>("designs", { id });
  if (!design) return null;
  return getDesignBundle(design.slug, true);
}

/** Number of full production weeks already booked (for "estimated ready" dates). */
export const queueWeeks = cache(async (): Promise<number> => {
  const settings = await loadSettings();
  const active = ["advance_paid", "measurement_booked", "measured", "cutting", "sewing", "fitting"];
  const orders = await db.list<{ status: string }>("orders", { in: { column: "status", values: active } });
  return Math.floor(orders.length / Math.max(1, settings.weekly_capacity));
});

/** Designs with their regions/layers, for cards and grids. */
export async function listDesignCards(opts: { includeUnpublished?: boolean } = {}) {
  const [designs, regions, catalog] = await Promise.all([listDesigns(opts), listAllRegions(), loadCatalog()]);
  return designs.map((d) => ({
    design: d,
    regions: regions.filter((r) => r.design_id === d.id).sort(bySort),
    fabrics: catalog.fabrics.filter((f) => d.fabric_keys.includes(f.key)),
  }));
}
export type DesignCardData = Awaited<ReturnType<typeof listDesignCards>>[number];

/** Catalogue safe to send to the browser (no bank details). */
export function publicCatalog(c: Catalog): Catalog {
  return { ...c, settings: { ...c.settings, bank: { accountName: "", bank: "", branch: "", accountNumber: "" } } };
}
