"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Minus, Plus } from "lucide-react";
import { QuoteDialog } from "./QuoteDialog";
import { Breakdown } from "./Breakdown";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { computePrice, conflictReason, estimateReadyDate, isCustomColor, toggleOption } from "@/lib/pricing";
import { luminance } from "@/lib/figure";
import { colorHex, colorName } from "@/lib/colors";
import { encodeSelections } from "@/lib/selections";
import { formatDate, lkr, toISODate, cn } from "@/lib/format";
import { features } from "@/config/site";
import type { Catalog, DesignBundle, Selections } from "@/lib/types";

export interface CustomiserProps {
  bundle: DesignBundle;
  catalog: Catalog;
  initial: Selections;
  queueWeeks: number;
  savedCode?: string;
  syncUrl?: boolean;
}

/** Photos for the current main colour if the studio has uploaded them, else the design photos. */
export function photosFor(bundle: DesignBundle, colors: Record<string, string>) {
  const { design, regions } = bundle;
  const primary = regions.find((r) => r.key === "main")?.key ?? regions[0]?.key;
  const chosen = primary ? colors[primary] : undefined;
  const variant = chosen ? design.color_images?.[chosen] : undefined;
  return { images: variant?.length ? variant : design.images, exact: Boolean(variant?.length), primary, chosen };
}

export function Customiser({ bundle, catalog, initial, queueWeeks, savedCode, syncUrl = true }: CustomiserProps) {
  const { design, regions } = bundle;
  const [sel, setSel] = useState<Selections>(initial);
  const [photo, setPhoto] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [today] = useState(() => new Date());

  const price = useMemo(() => computePrice(catalog, design, sel, today), [catalog, design, sel, today]);
  const fabric = catalog.fabrics.find((f) => f.key === sel.fabric);
  const optionByKey = useMemo(() => new Map(catalog.options.map((o) => [o.key, o])), [catalog.options]);
  const groups = features.addons ? catalog.groups.filter((g) => design.addon_groups.includes(g.key)) : [];
  const gallery = photosFor(bundle, sel.colors);
  const images = gallery.images;
  const current = images[Math.min(photo, images.length - 1)];
  const primaryRegion = regions.find((r) => r.key === gallery.primary);
  const colourDiffers = !gallery.exact && primaryRegion && sel.colors[primaryRegion.key] !== primaryRegion.default_color;

  useEffect(() => setPhoto(0), [gallery.chosen]);

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
  const ready = estimateReadyDate(today, catalog.settings.standard_lead_days, queueWeeks);
  const fabrics = catalog.fabrics.filter((f) => f.active && design.fabric_keys.includes(f.key));

  return (
    <div className="pb-28 lg:pb-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
        {/* GALLERY */}
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-surface">
            {current && <Image key={current} src={current} alt={`${design.name}, photo ${photo + 1} of ${images.length}`} fill priority quality={70} sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />}
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
            <p className="text-[13px] text-muted">Estimated price</p>
            <p className="mt-1 text-[1.9rem] leading-tight font-semibold tracking-[-0.02em] text-ink" aria-live="polite">
              LKR <AnimatedNumber value={price.min} /> – <AnimatedNumber value={price.max} />
            </p>
            <p className="mt-1 text-[13px] text-muted">Final price confirmed on WhatsApp.</p>
            <button type="button" className="mt-2 inline-flex min-h-11 items-center gap-1 text-[14px] font-medium text-ink" onClick={() => setShowBreakdown((o) => !o)} aria-expanded={showBreakdown}>
              {showBreakdown ? "Hide" : "See"} how it&apos;s calculated <ChevronDown className={cn("size-4 transition-transform", showBreakdown && "rotate-180")} aria-hidden />
            </button>
            {showBreakdown && (
              <div className="mt-2 rounded-[18px] bg-paper p-4">
                <Breakdown price={price} />
              </div>
            )}
          </div>

          {notice && (
            <p role="status" className="mt-5 rounded-[18px] bg-gold-50 px-4 py-3 text-sm text-ink">
              {notice}
            </p>
          )}

          {/* Colour */}
          <Group title="Colour">
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
                            onClick={() => setSel((s) => ({ ...s, colors: { ...s.colors, [r.key]: c.key } }))}
                            className={cn("relative size-10 rounded-full ring-1 ring-black/10 transition-transform active:scale-95", on && "ring-2 ring-ink ring-offset-[3px] ring-offset-paper")}
                            style={{ background: c.hex }}
                          >
                            {on && <Check className={cn("absolute inset-0 m-auto size-4", luminance(c.hex) > 0.45 ? "text-ink" : "text-white")} strokeWidth={2.5} aria-hidden />}
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
            <p className="text-[13px] text-muted">Need an exact shade? Use the colour wheel — custom colours are matched for {lkr(catalog.settings.custom_color_fee)} each.</p>
          </Group>

          {/* Fabric */}
          <Group title="Fabric">
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
                    <span className="shrink-0 text-[13px] text-muted tabular-nums">{f.price_modifier ? `+${f.price_modifier.toLocaleString("en-LK")}` : "Included"}</span>
                  </button>
                );
              })}
            </div>
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
                            <button key={o.key} type="button" aria-pressed={on} disabled={Boolean(reason)} title={reason ?? undefined} onClick={() => setSel((s) => ({ ...s, options: toggleOption(catalog, s.options, o.key) }))} className={cn("chip min-h-11 disabled:opacity-40", on && "chip-active")}>
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

          {/* Size */}
          <Group title="Size">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" role="radiogroup" aria-label="Size">
              {catalog.sizes.map((s) => {
                const on = sel.size === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSel((x) => ({ ...x, size: s.key }))}
                    className={cn("min-h-12 rounded-[16px] text-[14px] font-medium transition-colors", on ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-2")}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[13px] leading-5 text-muted">
              {(() => {
                const s = catalog.sizes.find((x) => x.key === sel.size);
                return s?.modifier ? `${s.note} (+${lkr(s.modifier)}). ` : s?.note ? `${s.note}. ` : "";
              })()}
              Exact measurements are taken at your fitting appointment.
            </p>
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
              Usually ready around {formatDate(ready)}.
              {price.tooSoon
                ? " That date is very close — we'll confirm on WhatsApp whether it's possible."
                : price.rush
                  ? ` Sooner than ${catalog.settings.standard_lead_days} days adds a ${catalog.settings.rush_fee_percent}% rush fee.`
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
            <p className="text-[11px] text-white/65">Estimate</p>
            <p className="truncate text-[17px] font-semibold tabular-nums">
              LKR <AnimatedNumber value={price.min} />–<AnimatedNumber value={price.max} />
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

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const id = `g-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section className="mt-9" aria-labelledby={id}>
      <h2 id={id} className="mb-4 text-[19px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}
