"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { QuoteDialog } from "./QuoteDialog";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { computePrice, conflictReason, estimateReadyDate, isCustomColor, toggleOption } from "@/lib/pricing";
import { colorHex, colorName, luminance } from "@/lib/colors";
import { encodeSelections } from "@/lib/selections";
import { formatDate, toISODate, cn } from "@/lib/format";
import { MEASURE_FIELDS } from "@/lib/measurements";
import { sizeChart } from "@/data/size-chart";
import { features } from "@/config/site";
import { photosFor } from "@/lib/photos";
import type { Catalog, DesignBundle, Measurements, Selections } from "@/lib/types";

export interface CustomiserProps {
  bundle: DesignBundle;
  catalog: Catalog;
  initial: Selections;
  queueWeeks: number;
  savedCode?: string;
  syncUrl?: boolean;
}

export function Customiser({ bundle, catalog, initial, queueWeeks, savedCode, syncUrl = true }: CustomiserProps) {
  const { design, regions } = bundle;
  const [sel, setSel] = useState<Selections>(initial);
  const [photo, setPhoto] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [today] = useState(() => new Date());

  const price = useMemo(() => computePrice(catalog, design, sel, today), [catalog, design, sel, today]);
  const fabric = catalog.fabrics.find((f) => f.key === sel.fabric);
  const optionByKey = useMemo(() => new Map(catalog.options.map((o) => [o.key, o])), [catalog.options]);
  const groups = features.addons ? catalog.groups.filter((g) => design.addon_groups.includes(g.key)) : [];
  const gallery = photosFor(bundle, sel);
  const images = gallery.images;
  const current = images[Math.min(photo, images.length - 1)];
  const primaryRegion = regions.find((r) => r.key === gallery.primary);
  const colourDiffers = !gallery.exact && primaryRegion && sel.colors[primaryRegion.key] !== primaryRegion.default_color;

  useEffect(() => setPhoto(0), [gallery.key]);

  // keep the URL shareable
  useEffect(() => {
    if (!syncUrl) return;
    const id = setTimeout(() => {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}?${encodeSelections(sel)}`);
    }, 250);
    return () => clearTimeout(id);
  }, [sel, syncUrl]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(id);
  }, [notice]);

  const photographed = Object.entries(design.color_images ?? {}).filter(([k, v]) => v.length && catalog.palette.some((p) => p.key === k && p.active) && (!fabric?.available_colors || fabric.available_colors.includes(k)));
  const setColour = (region: string, key: string) => setSel((s) => ({ ...s, colors: { ...s.colors, [region]: key } }));

  const available = (key: string) => !fabric?.available_colors || fabric.available_colors.includes(key);

  const setFabric = (key: string) => {
    const f = catalog.fabrics.find((x) => x.key === key);
    if (!f) return;
    const colors = { ...sel.colors };
    const swapped: string[] = [];
    for (const r of regions) {
      const v = colors[r.key];
      if (v && !isCustomColor(v) && f.available_colors && !f.available_colors.includes(v)) {
        colors[r.key] = f.available_colors[0];
        swapped.push(`${colorName(v, catalog.palette)} to ${colorName(colors[r.key], catalog.palette)}`);
      }
    }
    if (swapped.length) setNotice(`${f.name} isn't made in every colour, so we changed ${swapped.join(" and ")}.`);
    setSel((s) => ({ ...s, fabric: key, colors }));
  };

  const minDate = toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
  // most pieces take 1–3 weeks: earliest is the standard lead, latest two weeks after
  const readyFrom = estimateReadyDate(today, catalog.settings.standard_lead_days, queueWeeks);
  const readyTo = estimateReadyDate(today, catalog.settings.standard_lead_days + 14, queueWeeks);
  const fabrics = catalog.fabrics.filter((f) => f.active && design.fabric_keys.includes(f.key));

  return (
    <div className="pb-28 lg:pb-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
        {/* GALLERY */}
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-surface">
            {current && <Image key={current} src={current} alt={`${design.name}, photo ${photo + 1} of ${images.length}`} fill priority quality={70} sizes="(max-width: 1024px) 100vw, 55vw" className="animate-photo-in object-cover" />}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto p-1 [scrollbar-width:none]" role="tablist" aria-label="Photos">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  role="tab"
                  aria-selected={photo === i}
                  aria-label={`Photo ${i + 1}`}
                  onClick={() => setPhoto(i)}
                  className={cn("relative h-24 w-[76px] shrink-0 overflow-hidden rounded-[18px] bg-surface transition-opacity", photo === i ? "ring-2 ring-ink ring-offset-2" : "opacity-70 hover:opacity-100")}
                >
                  <Image src={src} alt="" fill sizes="76px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          {colourDiffers && primaryRegion && (
            <p className="mt-3 text-[13px] leading-5 text-muted">
              Photos show {colorName(primaryRegion.default_color, catalog.palette)}. Yours will be made in {colorName(sel.colors[primaryRegion.key], catalog.palette)} — we share real fabric swatches on WhatsApp before cutting.
            </p>
          )}
        </div>

        {/* DETAILS */}
        <div className="min-w-0">
          {savedCode && (
            <div className="mb-6 rounded-[20px] bg-surface px-5 py-4 text-sm text-ink">
              Saved design <b className="font-semibold">{savedCode}</b>. Changing anything creates a new code when you request a quote.
            </div>
          )}
          <p className="eyebrow">{design.category.replace("-", " ")}</p>
          <h1 className="h-display mt-3 text-[2.4rem] leading-[1.05] sm:text-5xl">{design.name}</h1>
          <p className="mt-4 text-[16px] leading-7 text-muted">{design.description}</p>

          <div className="mt-6 rounded-[24px] bg-surface p-5">
            <p className="text-[13px] text-muted">Starting price</p>
            <p className="mt-1 text-[1.9rem] leading-tight font-semibold tracking-[-0.02em] text-ink" aria-live="polite">
              LKR <AnimatedNumber value={price.total} />
            </p>
            <p className="mt-2 text-[13px] leading-5 text-muted">
              Choose a colour at no extra cost. Fabric, extra details and your date are agreed on WhatsApp, then we send your final quotation.
            </p>
          </div>

          {notice && (
            <p role="status" className="mt-5 rounded-[18px] bg-gold-50 px-4 py-3 text-sm text-ink">
              {notice}
            </p>
          )}

          {/* Version — photographed variations, chosen by photo */}
          {design.versions.length > 0 && (
            <Group title="Version">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Version">
                {[{ key: null as string | null, name: "As shown", price: 0, images: design.images }, ...design.versions].map((v) => {
                  const on = sel.version === v.key;
                  return (
                    <button
                      key={v.key ?? "default"}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setSel((s) => ({ ...s, version: v.key }))}
                      className="group text-left transition-transform active:scale-[0.97]"
                    >
                      <span className={cn("relative block aspect-[4/5] overflow-hidden rounded-[18px] bg-surface transition-[box-shadow,transform] duration-300 group-hover:-translate-y-0.5", on ? "ring-2 ring-ink ring-offset-2" : "ring-1 ring-black/5")}>
                        {v.images[0] && <Image src={v.images[0]} alt="" fill sizes="120px" className="object-cover" />}
                      </span>
                      <span className="mt-2 block text-[13px] leading-tight font-medium text-ink">{v.name}</span>
                      <span className="block text-[12px] text-muted">{v.price ? `${v.price > 0 ? "+" : "−"}${Math.abs(v.price).toLocaleString("en-LK")}` : "Included"}</span>
                    </button>
                  );
                })}
              </div>
            </Group>
          )}

          {/* Colour */}
          <Group title="Colour">
            {photographed.length > 0 && primaryRegion && (
              <div className="mb-6">
                <p className="mb-3 text-[15px] text-muted">Photographed in</p>
                <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pt-1 pb-1 [scrollbar-width:none]" role="radiogroup" aria-label="Colours with photos">
                  {photographed.map(([key, photos]) => {
                    const on = sel.colors[primaryRegion.key] === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setColour(primaryRegion.key, key)}
                        className="group w-[76px] shrink-0 text-left transition-transform active:scale-[0.97]"
                      >
                        <span className={cn("relative block aspect-[3/4] overflow-hidden rounded-[16px] bg-surface transition-transform duration-300 group-hover:-translate-y-0.5", on ? "ring-2 ring-ink ring-offset-2" : "ring-1 ring-black/5")}>
                          <Image src={photos[0]} alt="" fill sizes="76px" className="object-cover" />
                        </span>
                        <span className="mt-1.5 flex items-center gap-1.5 text-[12px] leading-tight text-ink">
                          <span className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: colorHex(key, catalog.palette) }} />
                          <span className="truncate">{colorName(key, catalog.palette)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {regions.map((r) => {
              const v = sel.colors[r.key];
              const custom = v && isCustomColor(v);
              return (
                <fieldset key={r.key} className="mb-6 last:mb-0">
                  <legend className="mb-3 flex w-full items-baseline justify-between gap-3 text-[15px]">
                    <span className="text-muted">{r.label}</span>
                    <span className="font-medium text-ink">{colorName(v, catalog.palette)}</span>
                  </legend>
                  <div className="flex flex-wrap gap-2.5">
                    {catalog.palette
                      .filter((c) => c.active && available(c.key))
                      .map((c) => {
                        const on = v === c.key;
                        return (
                          <button
                            key={c.key}
                            type="button"
                            aria-pressed={on}
                            aria-label={c.name}
                            title={c.name}
                            onClick={() => setColour(r.key, c.key)}
                            className={cn("relative size-10 rounded-full ring-1 ring-black/10 transition-transform active:scale-95", on && "ring-2 ring-ink ring-offset-[3px] ring-offset-paper")}
                            style={{ background: c.hex }}
                          >
                            {on && <Check className={cn("absolute inset-0 m-auto size-4", luminance(c.hex) > 0.45 ? "text-ink" : "text-white")} strokeWidth={2.5} aria-hidden />}
                            {r.key === primaryRegion?.key && design.color_images?.[c.key]?.length ? (
                              <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-paper bg-pink" title="Photo available" />
                            ) : null}
                          </button>
                        );
                      })}
                    <label
                      className={cn("relative flex size-10 cursor-pointer items-center justify-center rounded-full bg-[conic-gradient(#e46,#eb4,#5c7,#4bd,#57e,#c5e,#e46)] ring-1 ring-black/10", custom && "ring-2 ring-ink ring-offset-[3px]")}
                      title="Custom colour"
                    >
                      <span className="sr-only">Custom colour for {r.label}</span>
                      <input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={custom ? v : colorHex(v, catalog.palette)} onChange={(e) => setSel((s) => ({ ...s, colors: { ...s.colors, [r.key]: e.target.value.toLowerCase() } }))} />
                      {custom && <span className="size-6 rounded-full border-2 border-white" style={{ background: v }} />}
                    </label>
                  </div>
                </fieldset>
              );
            })}
            {photographed.length > 0 && <p className="mb-2 flex items-center gap-1.5 text-[13px] text-muted"><span className="size-2.5 rounded-full bg-pink" /> Pink dot: we have a photo in this colour.</p>}
            <p className="text-[13px] leading-5 text-muted">Any colour, no extra cost — use the colour wheel for an exact shade. We confirm the fabric is available in your colour before sending the quotation.</p>
          </Group>

          {/* Fabric */}
          <Group title="Preferred fabric">
            <div className="overflow-hidden rounded-[22px] bg-surface" role="radiogroup" aria-label="Fabric">
              {fabrics.map((f, i) => {
                const on = f.key === sel.fabric;
                return (
                  <button
                    key={f.key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setFabric(f.key)}
                    className={cn("flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2", i > 0 && "border-t border-black/5")}
                  >
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border-2", on ? "border-ink bg-ink" : "border-ink/25")}>{on && <span className="size-2 rounded-full bg-white" />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium text-ink">{f.name}</span>
                      <span className="block text-[13px] leading-5 text-muted">{f.note}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[13px] leading-5 text-muted">Fabric can change the final price, and some fabrics sell out — we&apos;ll confirm both in your quotation.</p>
          </Group>

          {/* Add-ons (switched off until a later update) */}
          {groups.length > 0 && (
            <Group title="Details">
              <div className="space-y-6">
                {groups.map((g) => {
                  const opts = catalog.options.filter((o) => o.group_key === g.key && o.active);
                  return (
                    <fieldset key={g.key}>
                      <legend className="mb-3 text-[15px] text-muted">{g.name}</legend>
                      <div className="flex flex-wrap gap-2">
                        {opts.map((o) => {
                          const on = sel.options.includes(o.key);
                          const reason = on ? null : conflictReason(o.key, sel.options.filter((k) => optionByKey.get(k)?.group_key !== g.key || g.selection === "multi"), catalog.rules);
                          const amount = o.price_type === "per_metre" ? Math.round(o.price * design.fabric_metres) : o.price;
                          return (
                            <button key={o.key} type="button" aria-pressed={on} disabled={Boolean(reason)} title={reason ?? undefined} onClick={() => setSel((s) => ({ ...s, options: toggleOption(catalog, s.options, o.key) }))} className={cn("chip min-h-11 disabled:opacity-40", o.image_url && "py-1 pl-1", on && "chip-active")}>
                              {o.image_url && (
                                <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-surface">
                                  <Image src={o.image_url} alt="" fill sizes="36px" className="object-cover" />
                                </span>
                              )}
                              {o.name}
                              {amount !== 0 && <span className={cn("text-xs", on ? "text-white/70" : "text-muted")}>{amount > 0 ? `+${amount.toLocaleString("en-LK")}` : amount.toLocaleString("en-LK")}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            </Group>
          )}

          {/* Measurements */}
          <Group title="Measurements" action={<Link href="/size-guide" target="_blank" className="text-[14px] font-medium text-pink underline-offset-4 hover:underline">Size chart</Link>}>
            <div className="overflow-hidden rounded-[22px] bg-surface" role="radiogroup" aria-label="Measurements">
              {catalog.sizes.map((o, i) => {
                const on = sel.size === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSel((x) => ({ ...x, size: o.key }))}
                    className={cn("flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2", i > 0 && "border-t border-black/5")}
                  >
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border-2", on ? "border-ink bg-ink" : "border-ink/25")}>{on && <span className="size-2 rounded-full bg-white" />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium text-ink">{o.label}</span>
                      {o.note && <span className="block text-[13px] leading-5 text-muted">{o.note}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            {sel.size === "own" && <OwnMeasurements value={sel.measurements} onChange={(m) => setSel((x) => ({ ...x, measurements: m }))} />}
            <p className="mt-3 text-[13px] leading-5 text-muted">Once we&apos;ve measured you, we keep your measurements on file — for your next order, just message us on WhatsApp.</p>
          </Group>

          {/* Quantity & date */}
          <Group title="Quantity and date">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-[18px] bg-surface py-2 pr-2 pl-4">
                <span className="text-[15px] text-ink" id="qty-label">
                  Quantity
                </span>
                <div className="flex items-center gap-1" role="group" aria-labelledby="qty-label">
                  <button type="button" className="flex size-11 items-center justify-center rounded-full bg-paper text-ink disabled:opacity-35" aria-label="Decrease quantity" disabled={sel.qty <= 1} onClick={() => setSel((s) => ({ ...s, qty: s.qty - 1 }))}>
                    <Minus className="size-4" aria-hidden />
                  </button>
                  <span className="w-8 text-center text-[16px] font-medium tabular-nums" aria-live="polite">
                    {sel.qty}
                  </span>
                  <button type="button" className="flex size-11 items-center justify-center rounded-full bg-paper text-ink disabled:opacity-35" aria-label="Increase quantity" disabled={sel.qty >= catalog.settings.max_quantity} onClick={() => setSel((s) => ({ ...s, qty: s.qty + 1 }))}>
                    <Plus className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
              <label className="flex items-center justify-between gap-3 rounded-[18px] bg-surface py-2 pr-3 pl-4">
                <span className="text-[15px] text-ink">Needed by</span>
                <input type="date" className="min-h-11 min-w-0 bg-transparent text-right text-[15px] text-ink focus:outline-none" min={minDate} value={sel.neededBy ?? ""} onChange={(e) => setSel((s) => ({ ...s, neededBy: e.target.value || null }))} />
              </label>
            </div>
            <p className="mt-3 text-[13px] leading-5 text-muted">
              Most pieces take 1–3 weeks, so usually ready between {formatDate(readyFrom)} and {formatDate(readyTo)}. Detailed patterns can take 3–6 weeks.
              {price.tooSoon
                ? " That date is very close — we'll confirm on WhatsApp whether it's possible."
                : price.rush
                  ? " A rush date may cost extra — we'll confirm in your quotation."
                  : ""}
            </p>
          </Group>

          {/* Notes */}
          <Group title="Notes">
            <label htmlFor="notes" className="sr-only">
              Special requests
            </label>
            <textarea id="notes" rows={3} maxLength={1000} className="input min-h-28 rounded-[18px] border-0 bg-surface" placeholder="Anything we should know — a slit, a modest neckline, matching a saree…" value={sel.notes} onChange={(e) => setSel((s) => ({ ...s, notes: e.target.value }))} />
          </Group>

          <button type="button" className="btn-primary mt-10 hidden h-14 w-full text-[16px] lg:flex" onClick={() => setQuoteOpen(true)}>
            Get my quote
          </button>
          <p className="mt-3 hidden text-center text-[13px] text-muted lg:block">You&apos;ll get a design code to send us on WhatsApp.</p>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-3 bottom-3 z-30 rounded-[24px] bg-green-900/95 text-white shadow-[0_16px_40px_-12px_rgb(0_0_0/0.45)] backdrop-blur lg:hidden">
        <div className="flex items-center gap-3 py-2.5 pr-2.5 pl-5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-white/65">Starting price</p>
            <p className="truncate text-[17px] font-semibold tabular-nums">
              LKR <AnimatedNumber value={price.total} />
            </p>
          </div>
          <button type="button" className="btn h-12 shrink-0 bg-white px-6 text-ink hover:bg-ivory" onClick={() => setQuoteOpen(true)}>
            Get quote
          </button>
        </div>
      </div>

      <QuoteDialog open={quoteOpen} onClose={() => setQuoteOpen(false)} bundle={bundle} catalog={catalog} selections={sel} price={price} photo={images[0] ?? null} />
    </div>
  );
}

function Group({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  const id = `g-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section className="mt-9" aria-labelledby={id}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 id={id} className="text-[19px] font-semibold tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const emptyMeasurements: Measurements = { chart: null, bust: null, waist: null, hip: null, length: null };

function OwnMeasurements({ value, onChange }: { value: Measurements | null; onChange: (m: Measurements) => void }) {
  const m = value ?? emptyMeasurements;
  return (
    <div className="mt-4 rounded-[22px] bg-surface p-5">
      <p className="text-[15px] font-medium text-ink">Your size from the chart</p>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7" role="radiogroup" aria-label="Chart size">
        {sizeChart.map((r) => {
          const on = m.chart === r.size;
          return (
            <button
              key={r.size}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange({ ...m, chart: on ? null : r.size })}
              className={cn("min-h-11 rounded-[14px] text-[14px] font-medium transition-colors", on ? "bg-ink text-white" : "bg-paper text-ink hover:bg-surface-2")}
            >
              {r.size}
            </button>
          );
        })}
      </div>
      <p className="mt-5 text-[15px] font-medium text-ink">
        Or your measurements <span className="font-normal text-muted">(cm, optional)</span>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MEASURE_FIELDS.map(([k, label]) => (
          <label key={k} className="block">
            <span className="mb-1 block text-[13px] text-muted">{label}</span>
            <input
              type="number"
              inputMode="decimal"
              min={20}
              max={250}
              className="input h-11 rounded-[14px] border-0 bg-paper"
              value={m[k] ?? ""}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                onChange({ ...m, [k]: Number.isFinite(n) ? n : null });
              }}
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-[13px] leading-5 text-muted">
        Not sure how?{" "}
        <Link href="/size-guide" target="_blank" className="font-medium text-ink underline underline-offset-4">
          See how to measure
        </Link>
        .
      </p>
    </div>
  );
}
