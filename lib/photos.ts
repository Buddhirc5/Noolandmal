import type { DesignBundle, Selections } from "./types";

/**
 * Which photos to show: the chosen version's photos, else photos of the design in the
 * chosen main colour, else the design's own photos. Only uploaded photos are ever shown.
 */
export function photosFor(bundle: DesignBundle, sel: Pick<Selections, "version" | "colors">) {
  const { design, regions } = bundle;
  const primary = regions.find((r) => r.key === "main")?.key ?? regions[0]?.key;
  const chosen = primary ? sel.colors[primary] : undefined;
  const version = sel.version ? design.versions.find((v) => v.key === sel.version) : undefined;
  const colourPhotos = chosen ? design.color_images?.[chosen] : undefined;
  const images = version?.images.length ? version.images : colourPhotos?.length ? colourPhotos : design.images;
  return { images, exact: Boolean(colourPhotos?.length), primary, chosen, key: `${sel.version ?? ""}|${chosen ?? ""}` };
}
