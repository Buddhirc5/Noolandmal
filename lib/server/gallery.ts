import "server-only";
import { db } from "./db";
import { audit, ServiceError } from "./orders";
import type { GalleryItem } from "@/lib/types";

const bySort = (a: GalleryItem, b: GalleryItem) => a.sort - b.sort || (a.created_at < b.created_at ? 1 : -1);

export async function listGallery(opts: { all?: boolean } = {}) {
  const rows = await db.list<GalleryItem>("gallery_items");
  return rows.filter((r) => opts.all || r.published).sort(bySort);
}

export function getGalleryItem(slug: string) {
  return db.get<GalleryItem>("gallery_items", { slug });
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "piece";

export async function saveGalleryItem(input: Omit<GalleryItem, "id" | "created_at" | "slug"> & { id: string | null }, actor: string) {
  if (!input.images.length) throw new ServiceError("Add at least one photo");
  if (input.id) {
    const { id, ...patch } = input;
    await db.update("gallery_items", { id }, patch);
    await audit(actor, "gallery.update", "gallery", id);
    return (await db.get<GalleryItem>("gallery_items", { id }))!;
  }
  let slug = slugify(input.title);
  for (let n = 2; await getGalleryItem(slug); n++) slug = `${slugify(input.title)}-${n}`;
  const { id: _id, ...row } = input;
  void _id;
  const item = await db.insert<GalleryItem>("gallery_items", { ...row, slug });
  await audit(actor, "gallery.create", "gallery", slug);
  return item;
}

export async function deleteGalleryItem(id: string, actor: string) {
  await db.remove("gallery_items", { id });
  await audit(actor, "gallery.delete", "gallery", id);
}
