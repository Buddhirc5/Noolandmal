"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { Spinner, useAction } from "./ui";
import { uploadDesignAssetAction } from "@/app/admin/actions";
import { deleteGalleryItemAction, saveGalleryItemAction } from "@/app/admin/customer-actions";
import { compressImage } from "@/lib/compress";
import { occasions } from "@/config/site";
import type { GalleryItem } from "@/lib/types";

type Form = Omit<GalleryItem, "created_at" | "slug" | "id"> & { id: string | null };
const blank: Form = { id: null, title: "", occasion: "", story: "", design_slug: null, images: [], published: true, featured: false, sort: 0, made_on: null };

export function GalleryEditor({ initial, designs }: { initial?: GalleryItem; designs: { slug: string; name: string }[] }) {
  const a = useAction();
  const up = useAction();
  const file = useRef<HTMLInputElement>(null);
  const [v, setV] = useState<Form>(initial ? { ...initial } : blank);
  const [uploading, setUploading] = useState(false);

  async function add(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    for (const f of Array.from(files).slice(0, 12 - v.images.length)) {
      const fd = new FormData();
      fd.set("file", await compressImage(f, 2000, 0.85));
      fd.set("kind", "photo");
      const url = await new Promise<string | null>((resolve) => up.run(() => uploadDesignAssetAction(fd), (r) => resolve((r.data as { url: string }).url)));
      if (url) setV((x) => ({ ...x, images: [...x.images, url] }));
    }
    setUploading(false);
    if (file.current) file.current.value = "";
  }
  const move = (i: number, d: number) =>
    setV((x) => {
      const imgs = [...x.images];
      [imgs[i], imgs[i + d]] = [imgs[i + d], imgs[i]];
      return { ...x, images: imgs };
    });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        a.run(() => saveGalleryItemAction(v), () => !initial && setV(blank));
      }}
    >
      <div>
        <span className="label">Photos — the first one is the cover</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {v.images.map((src, i) => (
            <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-[14px] bg-surface">
              <img src={src} alt="" className="size-full object-cover" />
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => move(i, -1)} className="flex size-8 items-center justify-center rounded-full bg-paper/90 disabled:opacity-0">
                  <ArrowLeft className="size-3.5" aria-hidden />
                </button>
                <button type="button" aria-label="Move right" disabled={i === v.images.length - 1} onClick={() => move(i, 1)} className="flex size-8 items-center justify-center rounded-full bg-paper/90 disabled:opacity-0">
                  <ArrowRight className="size-3.5" aria-hidden />
                </button>
              </div>
              <button type="button" aria-label="Remove photo" onClick={() => setV((x) => ({ ...x, images: x.images.filter((_, j) => j !== i) }))} className="absolute top-1 right-1 flex size-8 items-center justify-center rounded-full bg-paper/90">
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          ))}
          {v.images.length < 12 && (
            <button type="button" onClick={() => file.current?.click()} disabled={uploading} className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-[14px] border-2 border-dashed border-line text-sm text-muted">
              {uploading ? <Spinner /> : <Plus className="size-5" aria-hidden />}
              {uploading ? "Uploading…" : "Add photos"}
            </button>
          )}
        </div>
        <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple className="sr-only" tabIndex={-1} aria-label="Upload photos" onChange={(e) => add(e.target.files)} />
        <up.Feedback />
      </div>
      <label className="block text-sm">
        <span className="label">Title</span>
        <input className="input h-12" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder="e.g. Blush satin gown with plum leaf appliqué" required />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="label">Occasion</span>
          <select className="input h-12" value={v.occasion} onChange={(e) => setV({ ...v, occasion: e.target.value })}>
            <option value="">—</option>
            {[...occasions, "Evening"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="label">Made on</span>
          <input className="input h-12" type="date" value={v.made_on ?? ""} onChange={(e) => setV({ ...v, made_on: e.target.value || null })} />
        </label>
      </div>
      <label className="block text-sm">
        <span className="label">The story</span>
        <textarea className="input" rows={4} value={v.story} onChange={(e) => setV({ ...v, story: e.target.value })} placeholder="Fabric, details, what made it special. Mention the customer only with their permission." />
      </label>
      <label className="block text-sm">
        <span className="label">Based on a catalogue design <span className="font-normal text-muted">(optional)</span></span>
        <select className="input h-12" value={v.design_slug ?? ""} onChange={(e) => setV({ ...v, design_slug: e.target.value || null })}>
          <option value="">None — custom piece</option>
          {designs.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="size-5 accent-[var(--color-pink)]" checked={v.published} onChange={(e) => setV({ ...v, published: e.target.checked })} /> Show on the website
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="size-5 accent-[var(--color-pink)]" checked={v.featured} onChange={(e) => setV({ ...v, featured: e.target.checked })} /> Feature on the home page
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary h-12" disabled={a.pending || uploading}>
          {a.pending && <Spinner />} {initial ? "Save changes" : "Add to gallery"}
        </button>
        {initial && (
          <button type="button" className="text-sm text-muted hover:text-danger" onClick={() => confirm("Remove this piece from the gallery?") && a.run(() => deleteGalleryItemAction(initial.id))}>
            Delete
          </button>
        )}
        <a.Feedback />
      </div>
    </form>
  );
}
