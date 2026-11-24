"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Info, Minus, Palette, Plus, Sparkles } from "lucide-react";
import { DressFigure } from "./DressFigure";
import { RasterPreview } from "./RasterPreview";
import { QuoteDialog } from "./QuoteDialog";
import { Breakdown } from "./Breakdown";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { computePrice, conflictReason, estimateReadyDate, isCustomColor, toggleOption } from "@/lib/pricing";
import { luminance, resolveLayers } from "@/lib/figure";
import { colorHex, colorName, SHEEN } from "@/lib/colors";
import { encodeSelections } from "@/lib/selections";
import { formatDate, lkr, toISODate, cn } from "@/lib/format";
import type { Catalog, DesignBundle, LayerSpec, Selections } from "@/lib/types";

export interface CustomiserProps {
  bundle: DesignBundle;
  catalog: Catalog;
  initial: Selections;
  queueWeeks: number;
  savedCode?: string;
  syncUrl?: boolean;
}

export function Customiser({ bundle, catalog, initial, queueWeeks, savedCode, syncUrl = true }: CustomiserProps) {
  const { design, regions, layers } = bundle;
  const [sel, setSel] = useState<Selections>(initial);
  const [view, setView] = useState<number>(-1); // -1 = colour preview, else photo index
  const [notice, setNotice] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [today] = useState(() => new Date());

  const price = useMemo(() => computePrice(catalog, design, sel, today), [catalog, design, sel, today]);
  const fabric = catalog.fabrics.find((f) => f.key === sel.fabric);
  const optionByKey = useMemo(() => new Map(catalog.options.map((o) => [o.key, o])), [catalog.options]);
  const groups = catalog.groups.filter((g) => design.addon_groups.includes(g.key));
  const regionKeys = regions.map((r) => r.key);
  const figureLayers = useMemo(() => {
    const overrides = sel.options.map((k) => optionByKey.get(k)?.layer).filter(Boolean) as LayerSpec[];
    return resolveLayers(
      layers.filter((l) => !l.image_url).map((l) => ({ slot: l.slot, variant: l.variant, region_key: l.region_key })),
      overrides,
      regionKeys,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, sel.options, optionByKey]);
  const rasterLayers = layers.filter((l) => l.image_url);
  const colorOf = (region: string) => colorHex(sel.colors[region], catalog.palette);

  // keep the URL shareable
  useEffect(() => {
    if (!syncUrl) return;
    const id = setTimeout(() => {
      const url = `${window.location.pathname}?${encodeSelections(sel)}`;
      window.history.replaceState(window.history.state, "", url);
    }, 250);
    return () => clearTimeout(id);
  }, [sel, syncUrl]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 5000);
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
        swapped.push(`${r.label}: ${colorName(v, catalog.palette)} → ${colorName(colors[r.key], catalog.palette)}`);
      }
    }
    if (swapped.length) setNotice(`Some colours aren't available in ${f.name}, so we switched them (${swapped.join("; ")}).`);
    setSel((s) => ({ ...s, fabric: key, colors }));
  };

  const minDate = toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
  const ready = estimateReadyDate(today, catalog.settings.standard_lead_days, queueWeeks);

  const summaryColours = regions.map((r) => `${r.label}: ${colorName(sel.colors[r.key], catalog.palette)}`);

  return (
    <div className="pb-28 lg:pb-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        {/* PREVIEW */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card relative overflow-hidden bg-[#F1ECE4]">
            <div className="relative aspect-[4/5] w-full">
              {view === -1 ? (
                rasterLayers.length ? (
                  <RasterPreview layers={rasterLayers} colorOf={colorOf} />
                ) : (
                  <DressFigure
                    layers={figureLayers}
                    colorOf={colorOf}
                    sheen={SHEEN[sel.fabric] ?? 0.15}
                    className="absolute inset-0 m-auto h-[94%] w-full"
                    title={`${design.name} preview in ${summaryColours.join(", ")}`}
                    idPrefix="cz"
                  />
                )
              ) : (
                <Image src={design.images[view]} alt={`${design.name} photo ${view + 1} of ${design.images.length} (original colours)`} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" priority />
              )}
              <span className="absolute top-3 left-3 rounded-full bg-paper/90 px-3 py-1 text-xs text-muted backdrop-blur">
                {view === -1 ? "Live colour preview" : "Photo · original colours"}
              </span>
            </div>
            {design.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto border-t border-line bg-paper p-3" role="tablist" aria-label="Preview views">
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === -1}
                  onClick={() => setView(-1)}
                  className={cn("flex h-20 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border text-[10px]", view === -1 ? "border-green-900 ring-1 ring-green-900" : "border-line")}
                >
                  <Palette className="size-4 text-green-900" aria-hidden />
                  Your colours
                </button>
                {design.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    role="tab"
                    aria-selected={view === i}
                    onClick={() => setView(i)}
                    className={cn("relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border", view === i ? "border-green-900 ring-1 ring-green-900" : "border-line")}
                  >
                    <Image src={src} alt={`Photo ${i + 1}`} fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden /> The preview is a guide to colour and shape. We share real fabric swatches on WhatsApp before cutting.
          </p>
        </div>

        {/* CONTROLS */}
        <div>
          {savedCode && (
            <div className="mb-5 rounded-2xl border border-gold/50 bg-gold-50 px-4 py-3 text-sm text-green-900">
              Viewing saved design <b>{savedCode}</b>. Changes create a new code when you request a quote.
            </div>
          )}
          <p className="eyebrow">{design.category.replace("-", " ")}</p>
          <h1 className="h-display mt-2 text-4xl leading-tight sm:text-5xl">{design.name}</h1>
          <p className="mt-3 text-[15px] leading-7 text-muted">{design.description}</p>

          {notice && (
            <div role="status" className="mt-4 flex gap-2 rounded-2xl border border-gold/50 bg-gold-50 p-3 text-sm text-ink">
              <Info className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
              {notice}
            </div>
          )}

          {/* 1. Colours */}
          <Section n={1} title="Colours">
            {regions.map((r) => {
              const v = sel.colors[r.key];
              const custom = v && isCustomColor(v);
              return (
                <fieldset key={r.key} className="mb-5 last:mb-0">
                  <legend className="mb-2 flex w-full items-center justify-between text-sm">
                    <span className="font-medium text-ink">{r.label}</span>
                    <span className="text-muted">{colorName(v, catalog.palette)}</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {catalog.palette
                      .filter((c) => c.active)
                      .map((c) => {
                        const ok = available(c.key);
                        const on = v === c.key;
                        return (
                          <button
                            key={c.key}
                            type="button"
                            disabled={!ok}
                            aria-pressed={on}
                            aria-label={`${c.name}${ok ? "" : ` (not available in ${fabric?.name})`}`}
                            title={ok ? c.name : `Not available in ${fabric?.name}`}
                            onClick={() => setSel((s) => ({ ...s, colors: { ...s.colors, [r.key]: c.key } }))}
                            className={cn(
                              "relative size-9 rounded-full ring-1 ring-black/10 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:scale-100",
                              on && "ring-2 ring-green-900 ring-offset-2 ring-offset-paper",
                            )}
                            style={{ background: c.hex }}
                          >
                            {on && <Check className={cn("absolute inset-0 m-auto size-4", luminance(c.hex) > 0.45 ? "text-ink" : "text-white")} aria-hidden />}
                          </button>
                        );
                      })}
                    <label
                      className={cn(
                        "relative flex size-9 cursor-pointer items-center justify-center rounded-full bg-[conic-gradient(#e33,#ec3,#3c6,#3cc,#36e,#c3e,#e33)] ring-1 ring-black/10",
                        custom && "ring-2 ring-green-900 ring-offset-2",
                      )}
                      title={`Custom colour (+${lkr(catalog.settings.custom_color_fee)})`}
                    >
                      <span className="sr-only">Custom colour for {r.label}</span>
                      <input
                        type="color"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        value={custom ? v : colorHex(v, catalog.palette)}
                        onChange={(e) => setSel((s) => ({ ...s, colors: { ...s.colors, [r.key]: e.target.value.toLowerCase() } }))}
                      />
                      {custom && <span className="size-5 rounded-full border-2 border-white" style={{ background: v }} />}
                    </label>
                  </div>
                </fieldset>
              );
            })}
            <p className="text-xs text-muted">Custom colours are sourced to match: +{lkr(catalog.settings.custom_color_fee)} each.</p>
          </Section>

          {/* 2. Fabric */}
          <Section n={2} title="Fabric">
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Fabric">
              {catalog.fabrics
                .filter((f) => f.active && design.fabric_keys.includes(f.key))
                .map((f) => {
                  const on = f.key === sel.fabric;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setFabric(f.key)}
                      className={cn("rounded-2xl border p-3.5 text-left transition-colors", on ? "border-green-900 bg-green-50" : "border-line bg-paper hover:border-green-700")}
                    >
                      <span className="flex items-center justify-between gap-2 text-sm font-medium text-ink">
                        {f.name}
                        <span className="text-xs font-normal text-muted">{f.price_modifier ? `+${lkr(f.price_modifier)}` : "Included"}</span>
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted">{f.note}</span>
                    </button>
                  );
                })}
            </div>
          </Section>

          {/* 3. Add-ons */}
          {groups.length > 0 && (
            <Section n={3} title="Details & add-ons">
              <div className="space-y-6">
                {groups.map((g) => {
                  const opts = catalog.options.filter((o) => o.group_key === g.key && o.active);
                  const blocked = opts
                    .filter((o) => !sel.options.includes(o.key))
                    .map((o) => ({ o, reason: conflictReason(o.key, sel.options.filter((k) => optionByKey.get(k)?.group_key !== g.key || g.selection === "multi"), catalog.rules) }))
                    .filter((x) => x.reason);
                  return (
                    <fieldset key={g.key}>
                      <legend className="mb-1 text-sm font-medium text-ink">
                        {g.name} <span className="font-normal text-muted">· {g.selection === "multi" ? "choose any" : "choose one"}</span>
                      </legend>
                      {g.description && <p className="mb-2 text-xs text-muted">{g.description}</p>}
                      <div className="flex flex-wrap gap-2">
                        {opts.map((o) => {
                          const on = sel.options.includes(o.key);
                          const reason = blocked.find((b) => b.o.key === o.key)?.reason;
                          const amount = o.price_type === "per_metre" ? Math.round(o.price * design.fabric_metres) : o.price;
                          return (
                            <button
                              key={o.key}
                              type="button"
                              aria-pressed={on}
                              disabled={Boolean(reason)}
                              title={reason ?? o.description ?? undefined}
                              onClick={() => setSel((s) => ({ ...s, options: toggleOption(catalog, s.options, o.key) }))}
                              className={cn("chip min-h-10 disabled:cursor-not-allowed disabled:opacity-45", on && "chip-active")}
                            >
                              {on && <Check className="size-3.5" aria-hidden />}
                              {o.name}
                              {amount !== 0 && <span className={cn("text-xs", on ? "text-white/75" : "text-muted")}>{amount > 0 ? `+${amount.toLocaleString("en-LK")}` : amount.toLocaleString("en-LK")}</span>}
                            </button>
                          );
                        })}
                      </div>
                      {blocked.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-muted">
                          {blocked.map(({ o, reason }) => (
                            <li key={o.key} className="flex gap-1.5">
                              <Info className="mt-0.5 size-3 shrink-0" aria-hidden />
                              <span>
                                <b className="font-medium text-ink/80">{o.name}:</b> {reason}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </fieldset>
                  );
                })}
              </div>
            </Section>
          )}

          {/* 4. Size */}
          <Section n={groups.length ? 4 : 3} title="Size">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
              {catalog.sizes.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  role="radio"
                  aria-checked={sel.size === s.key}
                  onClick={() => setSel((x) => ({ ...x, size: s.key }))}
                  className={cn("chip min-h-10 min-w-12 justify-center", sel.size === s.key && "chip-active")}
                >
                  {s.label}
                  {s.modifier > 0 && <span className={cn("text-xs", sel.size === s.key ? "text-white/75" : "text-muted")}>+{s.modifier.toLocaleString("en-LK")}</span>}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              {catalog.sizes.find((s) => s.key === sel.size)?.note || "We take exact measurements at your appointment — size helps us estimate fabric."}
            </p>
          </Section>

          {/* 5. Quantity & date */}
          <Section n={groups.length ? 5 : 4} title="Quantity & date">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="label" id="qty-label">
                  Quantity
                </span>
                <div className="inline-flex items-center rounded-full border border-line bg-paper" role="group" aria-labelledby="qty-label">
                  <button type="button" className="btn-ghost size-11 px-0" aria-label="Decrease quantity" disabled={sel.qty <= 1} onClick={() => setSel((s) => ({ ...s, qty: s.qty - 1 }))}>
                    <Minus className="size-4" aria-hidden />
                  </button>
                  <span className="w-8 text-center tabular-nums" aria-live="polite">
                    {sel.qty}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost size-11 px-0"
                    aria-label="Increase quantity"
                    disabled={sel.qty >= catalog.settings.max_quantity}
                    onClick={() => setSel((s) => ({ ...s, qty: s.qty + 1 }))}
                  >
                    <Plus className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
              <div>
                <label className="label" htmlFor="needed-by">
                  Needed by <span className="font-normal text-muted">(optional)</span>
                </label>
                <input
                  id="needed-by"
                  type="date"
                  className="input"
                  min={minDate}
                  value={sel.neededBy ?? ""}
                  onChange={(e) => setSel((s) => ({ ...s, neededBy: e.target.value || null }))}
                />
              </div>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-muted">
                Estimated ready around <b className="font-medium text-ink">{formatDate(ready)}</b> ({catalog.settings.standard_lead_days} days standard lead time
                {queueWeeks ? ` + ${queueWeeks} week${queueWeeks > 1 ? "s" : ""} queue` : ""}).
              </p>
              {price.tooSoon ? (
                <p role="alert" className="flex gap-2 rounded-xl bg-rose-50 p-3 text-[#8a2f2a]">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> That&apos;s very soon — under {catalog.settings.rush_min_days} days. We&apos;ll confirm on WhatsApp whether it&apos;s possible.
                </p>
              ) : price.rush ? (
                <p role="status" className="flex gap-2 rounded-xl bg-gold-50 p-3 text-ink">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden /> Shorter than our {catalog.settings.standard_lead_days}-day lead time: a {catalog.settings.rush_fee_percent}% rush fee applies.
                </p>
              ) : null}
            </div>
          </Section>

          {/* 6. Notes */}
          <Section n={groups.length ? 6 : 5} title="Notes">
            <label htmlFor="notes" className="sr-only">
              Special requests
            </label>
            <textarea
              id="notes"
              rows={3}
              maxLength={1000}
              className="input min-h-24"
              placeholder="Anything else? e.g. modest neckline, add a slit, match my saree…"
              value={sel.notes}
              onChange={(e) => setSel((s) => ({ ...s, notes: e.target.value }))}
            />
          </Section>

          {/* Desktop price card */}
          <div className="card mt-8 hidden p-6 lg:block">
            <PriceSummary price={price} open={showBreakdown} onToggle={() => setShowBreakdown((o) => !o)} rangePercent={catalog.settings.range_percent} />
            <button type="button" className="btn-primary mt-5 h-12 w-full text-[15px]" onClick={() => setQuoteOpen(true)}>
              <Sparkles className="size-4" aria-hidden /> Get quote &amp; design code
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur lg:hidden">
        {showBreakdown && (
          <div className="max-h-[50vh] overflow-y-auto border-b border-line px-4 py-4">
            <Breakdown price={price} />
          </div>
        )}
        <div className="flex items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setShowBreakdown((o) => !o)} aria-expanded={showBreakdown}>
            <span className="flex items-center gap-1 text-[11px] text-muted">
              Estimated · tap for details <ChevronDown className={cn("size-3 transition-transform", showBreakdown && "rotate-180")} aria-hidden />
            </span>
            <span className="block truncate font-serif text-xl font-semibold text-green-900">
              LKR <AnimatedNumber value={price.min} />–<AnimatedNumber value={price.max} />
            </span>
          </button>
          <button type="button" className="btn-primary h-12 shrink-0 px-6" onClick={() => setQuoteOpen(true)}>
            Get quote
          </button>
        </div>
      </div>

      <QuoteDialog
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        bundle={bundle}
        catalog={catalog}
        selections={sel}
        price={price}
        figureLayers={figureLayers}
      />
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-line pt-6" aria-labelledby={`sec-${n}`}>
      <h2 id={`sec-${n}`} className="mb-4 flex items-baseline gap-3 text-lg font-semibold text-green-900">
        <span className="font-serif text-2xl text-gold-600">{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function PriceSummary({ price, open, onToggle, rangePercent }: { price: ReturnType<typeof computePrice>; open: boolean; onToggle: () => void; rangePercent: number }) {
  return (
    <div>
      <p className="text-sm text-muted">Estimated price</p>
      <p className="font-serif text-4xl font-semibold text-green-900" aria-live="polite">
        LKR <AnimatedNumber value={price.min} /> – <AnimatedNumber value={price.max} />
      </p>
      <p className="mt-1 text-xs text-muted">Final quote confirmed on WhatsApp (estimate ±{rangePercent}%).</p>
      <button type="button" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-green-700" onClick={onToggle} aria-expanded={open}>
        {open ? "Hide" : "Show"} price breakdown <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="mt-3 rounded-2xl bg-ivory p-4">
          <Breakdown price={price} />
        </div>
      )}
    </div>
  );
}
