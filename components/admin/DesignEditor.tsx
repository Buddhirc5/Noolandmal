"use client";
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { Spinner, useAction } from "./ui";
import { saveDesignAction, uploadDesignAssetAction } from "@/app/admin/actions";
import { DressFigure } from "@/components/customiser/DressFigure";
import { RasterPreview } from "@/components/customiser/RasterPreview";
import { VARIANTS } from "@/lib/figure";
import { colorHex } from "@/lib/colors";
import { categories, occasions } from "@/config/site";
import type { Catalog, Design, DesignLayer, DesignRegion } from "@/lib/types";

type RegionRow = Omit<DesignRegion, "id" | "design_id">;
type LayerRow = Omit<DesignLayer, "id" | "design_id">;
type DesignForm = Omit<Design, "id" | "created_at" | "updated_at">;

export function DesignEditor({ id, design, regions: r0, layers: l0, catalog }: { id: string | null; design: DesignForm; regions: RegionRow[]; layers: LayerRow[]; catalog: Catalog }) {
  const router = useRouter();
  const a = useAction();
  const up = useAction();
  const [d, setD] = useState<DesignForm>(design);
  const [regions, setRegions] = useState<RegionRow[]>(r0);
  const [layers, setLayers] = useState<LayerRow[]>(l0);
  const photoInput = useRef<HTMLInputElement>(null);
  const [layerUploadIdx, setLayerUploadIdx] = useState<number | null>(null);
  const layerInput = useRef<HTMLInputElement>(null);
  const colourInput = useRef<HTMLInputElement>(null);
  const [colourKey, setColourKey] = useState(catalog.palette[0]?.key ?? "");

  const set = <K extends keyof DesignForm>(k: K, v: DesignForm[K]) => setD((x) => ({ ...x, [k]: v }));
  const toggle = (k: "fabric_keys" | "addon_groups" | "default_options" | "occasions", v: string) =>
    setD((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : [...x[k], v] }));

  const colorOf = (key: string) => colorHex(regions.find((r) => r.key === key)?.default_color, catalog.palette);
  const raster = layers.filter((l) => l.image_url).map((l, i) => ({ ...l, id: String(i), design_id: "" }));

  async function upload(file: File, kind: "photo" | "layer") {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("kind", kind);
    return new Promise<string | null>((resolve) => up.run(() => uploadDesignAssetAction(fd), (r) => resolve((r.data as { url: string }).url)));
  }

  return (
    <form
      className="grid gap-6 xl:grid-cols-[1fr_320px]"
      onSubmit={(e) => {
        e.preventDefault();
        a.run(
          () => saveDesignAction(id, d, regions, layers),
          (r) => {
            const newId = (r.data as { id: string }).id;
            if (!id) router.replace(`/admin/designs/${newId}`);
          },
        );
      }}
    >
      <div className="space-y-6">
        <section className="card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="font-semibold text-green-900 sm:col-span-2">Basics</h2>
          <label className="text-sm">
            <span className="label">Name</span>
            <input className="input" required value={d.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="label">URL slug</span>
            <input className="input font-mono text-sm" required value={d.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
          </label>
          <label className="text-sm">
            <span className="label">Category</span>
            <select className="input" value={d.category} onChange={(e) => set("category", e.target.value)}>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="label">Badge (optional)</span>
            <input className="input" value={d.badge ?? ""} onChange={(e) => set("badge", e.target.value || null)} placeholder="New, Bridal…" />
          </label>
          <label className="text-sm">
            <span className="label">Base price (LKR)</span>
            <input className="input" type="number" min={0} step={100} value={d.base_price} onChange={(e) => set("base_price", Number(e.target.value) || 0)} />
          </label>
          <label className="text-sm">
            <span className="label">Fabric metres (for per-metre add-ons)</span>
            <input className="input" type="number" min={0} step={0.1} value={d.fabric_metres} onChange={(e) => set("fabric_metres", Number(e.target.value) || 0)} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="label">Description</span>
            <textarea className="input" rows={3} value={d.description} onChange={(e) => set("description", e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-4 text-sm sm:col-span-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4 accent-green-900" checked={d.published} onChange={(e) => set("published", e.target.checked)} /> Published
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4 accent-green-900" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured on home page
            </label>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="label">Occasions</legend>
            <div className="flex flex-wrap gap-2">
              {occasions.map((o) => (
                <button key={o} type="button" className={`chip ${d.occasions.includes(o) ? "chip-active" : ""}`} aria-pressed={d.occasions.includes(o)} onClick={() => toggle("occasions", o)}>
                  {o}
                </button>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-semibold text-green-900">Fabrics & add-ons</h2>
          <fieldset>
            <legend className="label">Allowed fabrics (click the dot to set the default)</legend>
            <div className="flex flex-wrap gap-2">
              {catalog.fabrics.map((f) => {
                const on = d.fabric_keys.includes(f.key);
                return (
                  <span key={f.key} className={`chip gap-2 ${on ? "chip-active" : ""}`}>
                    <button type="button" onClick={() => toggle("fabric_keys", f.key)} aria-pressed={on}>
                      {f.name}
                    </button>
                    {on && (
                      <button type="button" onClick={() => set("default_fabric", f.key)} aria-label={`Make ${f.name} the default`} className={`size-3 rounded-full border border-white ${d.default_fabric === f.key ? "bg-gold" : ""}`} />
                    )}
                  </span>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="label">Add-on groups offered</legend>
            <div className="flex flex-wrap gap-2">
              {catalog.groups.map((g) => (
                <button key={g.key} type="button" className={`chip ${d.addon_groups.includes(g.key) ? "chip-active" : ""}`} aria-pressed={d.addon_groups.includes(g.key)} onClick={() => toggle("addon_groups", g.key)}>
                  {g.name}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="label">Included by default (should cost 0 — priced into the base)</legend>
            <div className="flex flex-wrap gap-2">
              {catalog.options
                .filter((o) => d.addon_groups.includes(o.group_key))
                .map((o) => (
                  <button key={o.key} type="button" className={`chip text-xs ${d.default_options.includes(o.key) ? "chip-active" : ""}`} aria-pressed={d.default_options.includes(o.key)} onClick={() => toggle("default_options", o.key)}>
                    {o.name}
                    {o.price ? ` (${o.price > 0 ? "+" : ""}${o.price})` : ""}
                  </button>
                ))}
            </div>
          </fieldset>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="font-semibold text-green-900">Colour regions</h2>
          <p className="text-sm text-muted">Each region gets its own colour picker in the customiser. Layers below refer to these keys (main, accent, overlay…).</p>
          {regions.map((r, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input className="input w-32 font-mono text-sm" value={r.key} aria-label="Region key" onChange={(e) => setRegions(regions.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))} />
              <input className="input w-48" value={r.label} aria-label="Region label" onChange={(e) => setRegions(regions.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <span className="size-7 rounded-full ring-1 ring-black/10" style={{ background: colorHex(r.default_color, catalog.palette) }} />
              <select className="input w-40" value={r.default_color} aria-label="Default colour" onChange={(e) => setRegions(regions.map((x, j) => (j === i ? { ...x, default_color: e.target.value } : x)))}>
                {catalog.palette.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-ghost px-2" aria-label="Remove region" onClick={() => setRegions(regions.filter((_, j) => j !== i))}>
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
          <button type="button" className="btn-ghost" onClick={() => setRegions([...regions, { key: `region${regions.length + 1}`, label: "New region", default_color: catalog.palette[0]?.key ?? "ivory", sort: regions.length }])}>
            + Add region
          </button>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="font-semibold text-green-900">Preview layers</h2>
          <p className="text-sm text-muted">
            Build the preview from parametric parts (bodice, sleeves, skirt, length, texture, extras), or upload real garment layers: transparent PNGs of each part in white/grey — they&apos;re tinted with the region colour. If any image layer exists, the image stack is used instead of the drawn figure.
          </p>
          {layers.map((l, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <select className="input w-28" value={l.slot} aria-label="Slot" onChange={(e) => setLayers(layers.map((x, j) => (j === i ? { ...x, slot: e.target.value, variant: VARIANTS[e.target.value]?.[0] ?? "" } : x)))}>
                {Object.keys(VARIANTS).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {l.slot === "image" ? (
                <span className="flex items-center gap-2">
                  {l.image_url && <img src={l.image_url} alt="" className="size-10 rounded border border-line object-contain" />}
                  <button
                    type="button"
                    className="btn-secondary min-h-9"
                    onClick={() => {
                      setLayerUploadIdx(i);
                      layerInput.current?.click();
                    }}
                  >
                    {up.pending && layerUploadIdx === i ? <Spinner /> : <ImagePlus className="size-4" aria-hidden />} PNG
                  </button>
                </span>
              ) : (
                <select className="input w-40" value={l.variant} aria-label="Variant" onChange={(e) => setLayers(layers.map((x, j) => (j === i ? { ...x, variant: e.target.value } : x)))}>
                  {(VARIANTS[l.slot] ?? []).map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              )}
              <select className="input w-36" value={l.region_key} aria-label="Colour region" onChange={(e) => setLayers(layers.map((x, j) => (j === i ? { ...x, region_key: e.target.value } : x)))}>
                {l.slot === "image" && <option value="">(not tinted)</option>}
                {regions.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
              <input className="input w-20" type="number" value={l.z} aria-label="Layer order" title="Layer order" onChange={(e) => setLayers(layers.map((x, j) => (j === i ? { ...x, z: Number(e.target.value) || 0 } : x)))} />
              <button type="button" className="btn-ghost px-2" aria-label="Remove layer" onClick={() => setLayers(layers.filter((_, j) => j !== i))}>
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
          <input
            ref={layerInput}
            type="file"
            accept="image/png"
            className="sr-only"
            tabIndex={-1}
            aria-label="Upload layer PNG"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f || layerUploadIdx === null) return;
              const url = await upload(f, "layer");
              if (url) setLayers((ls) => ls.map((x, j) => (j === layerUploadIdx ? { ...x, image_url: url } : x)));
              e.target.value = "";
            }}
          />
          <button type="button" className="btn-ghost" onClick={() => setLayers([...layers, { slot: "extra", variant: "bow", region_key: regions[0]?.key ?? "main", z: layers.length, image_url: null, opacity: 1 }])}>
            + Add layer
          </button>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="font-semibold text-green-900">Photos</h2>
          <p className="text-sm text-muted">The first photo is the collection thumbnail. Photos are resized and their metadata removed.</p>
          <div className="flex flex-wrap gap-3">
            {d.images.map((src, i) => (
              <div key={src} className="w-28 space-y-1">
                <img src={src} alt={`Photo ${i + 1}`} className="aspect-[4/5] w-full rounded-xl border border-line object-cover" />
                <div className="flex justify-between">
                  <button type="button" className="btn-ghost min-h-8 px-1.5" aria-label="Move left" disabled={i === 0} onClick={() => set("images", swap(d.images, i, i - 1))}>
                    <ArrowLeft className="size-3.5" aria-hidden />
                  </button>
                  <button type="button" className="btn-ghost min-h-8 px-1.5 text-danger" aria-label="Remove photo" onClick={() => set("images", d.images.filter((x) => x !== src))}>
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                  <button type="button" className="btn-ghost min-h-8 px-1.5" aria-label="Move right" disabled={i === d.images.length - 1} onClick={() => set("images", swap(d.images, i, i + 1))}>
                    <ArrowRight className="size-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => photoInput.current?.click()} className="flex aspect-[4/5] w-28 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gold text-xs text-green-900">
              {up.pending ? <Spinner /> : <ImagePlus className="size-5" aria-hidden />} Add photo
            </button>
            <input
              ref={photoInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-label="Upload photo"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await upload(f, "photo");
                if (url) setD((x) => ({ ...x, images: [...x.images, url] }));
                e.target.value = "";
              }}
            />
          </div>
          <up.Feedback />
        </section>
        <section className="card space-y-4 p-5">
          <h2 className="font-semibold text-ink">Photos by colour</h2>
          <p className="text-sm text-muted">Upload photos of this design made in a specific colour. When a customer picks that colour for the main fabric, these photos replace the default ones.</p>
          <div className="flex flex-wrap items-center gap-2">
            <select className="input w-56" value={colourKey} onChange={(e) => setColourKey(e.target.value)} aria-label="Colour">
              {catalog.palette.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                  {d.color_images?.[c.key]?.length ? ` (${d.color_images[c.key].length})` : ""}
                </option>
              ))}
            </select>
            <button type="button" className="btn-secondary" onClick={() => colourInput.current?.click()} disabled={up.pending}>
              {up.pending ? <Spinner /> : null} Add photo in {catalog.palette.find((c) => c.key === colourKey)?.name}
            </button>
            <input
              ref={colourInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-label="Upload colour photo"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await upload(f, "photo");
                if (url) setD((x) => ({ ...x, color_images: { ...(x.color_images ?? {}), [colourKey]: [...(x.color_images?.[colourKey] ?? []), url] } }));
                e.target.value = "";
              }}
            />
          </div>
          {Object.entries(d.color_images ?? {})
            .filter(([, list]) => list.length)
            .map(([key, list]) => (
              <div key={key}>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
                  <span className="size-4 rounded-full ring-1 ring-black/10" style={{ background: colorHex(key, catalog.palette) }} />
                  {catalog.palette.find((c) => c.key === key)?.name ?? key}
                </p>
                <div className="flex flex-wrap gap-3">
                  {list.map((src) => (
                    <div key={src} className="w-24 space-y-1">
                      <img src={src} alt="" className="aspect-[4/5] w-full rounded-[14px] object-cover" />
                      <button type="button" className="btn-ghost min-h-8 w-full px-1.5 text-xs text-danger" onClick={() => setD((x) => ({ ...x, color_images: { ...x.color_images, [key]: x.color_images[key].filter((u) => u !== src) } }))}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
        <div className="card overflow-hidden">
          <div className="relative aspect-[3/5] bg-[#F5F5F7]">
            {raster.length ? (
              <RasterPreview layers={raster} colorOf={colorOf} />
            ) : (
              <DressFigure layers={layers.filter((l) => !l.image_url)} colorOf={colorOf} idPrefix="ed" className="absolute inset-0 size-full" />
            )}
          </div>
          <p className="p-3 text-xs text-muted">Live preview with default colours.</p>
        </div>
        <button className="btn-primary h-12 w-full" disabled={a.pending}>
          {a.pending && <Spinner />} Save design
        </button>
        <a.Feedback />
        {id && (
          <a href={`/collection/${d.slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">
            View on site ↗
          </a>
        )}
      </aside>
    </form>
  );
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  const a = [...arr];
  [a[i], a[j]] = [a[j], a[i]];
  return a;
}
