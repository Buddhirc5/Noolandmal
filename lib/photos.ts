import type { DesignBundle, Selections } from "./types";

/**
 * Which photos to show: the chosen version's photos, else photos of the design in the
 * chosen main colour, else the design's own photos. Only uploaded photos are ever shown.
 */
/** Colour photos available for the current version (or the design itself). */
export function colourPhotosFor(bundle: DesignBundle, version: string | null) {
  const v = version ? bundle.design.versions.find((x) => x.key === version) : undefined;
  return (v ? v.color_images : bundle.design.color_images) ?? {};
}

export function photosFor(bundle: DesignBundle, sel: Pick<Selections, "version" | "colors">) {
  const { design, regions } = bundle;
  const primary = regions.find((r) => r.key === "main")?.key ?? regions[0]?.key;
  const chosen = primary ? sel.colors[primary] : undefined;
  const version = sel.version ? design.versions.find((v) => v.key === sel.version) : undefined;
  // a chosen version uses its own colour photos; otherwise the design's
  const colourPhotos = chosen ? (version ? version.color_images?.[chosen] : design.color_images?.[chosen]) : undefined;
  const images = colourPhotos?.length ? colourPhotos : version?.images.length ? version.images : design.images;
  return { images, exact: Boolean(colourPhotos?.length), primary, chosen, key: `${sel.version ?? ""}|${chosen ?? ""}` };
}
