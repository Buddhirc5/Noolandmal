// Pure pricing + validation shared by the browser (live estimate) and the
// server (authoritative recalculation on save). No I/O in this file.
import type {
  AddonOption,
  Catalog,
  Design,
  DesignRegion,
  PriceLine,
  PriceResult,
  Selections,
} from "./types";

export const HEX_RE = /^#[0-9a-f]{6}$/i;
const DAY = 86_400_000;

export function isCustomColor(v: string) {
  return HEX_RE.test(v);
}

/** Round to the nearest 100 rupees (prices are quoted in round numbers). */
export function round100(n: number) {
  return Math.round(n / 100) * 100;
}

export function daysBetween(from: Date, toISO: string) {
  const to = new Date(toISO + "T00:00:00");
  const f = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((to.getTime() - f.getTime()) / DAY);
}

export function optionMap(options: AddonOption[]) {
  return new Map(options.map((o) => [o.key, o]));
}

/** Returns the reason an option can't be combined with the current selection, or null. */
export function conflictReason(
  key: string,
  selected: string[],
  rules: Catalog["rules"],
): string | null {
  for (const r of rules) {
    if (r.option_a === key && selected.includes(r.option_b)) return r.reason;
    if (r.option_b === key && selected.includes(r.option_a)) return r.reason;
  }
  return null;
}

/**
 * Toggle an option respecting group selection type. Single-select groups
 * replace the previous choice; options that conflict with the new choice are
 * dropped (the UI explains why before this happens, so this is a safety net).
 */
export function toggleOption(catalog: Catalog, selected: string[], key: string): string[] {
  const opts = optionMap(catalog.options);
  const opt = opts.get(key);
  if (!opt) return selected;
  const group = catalog.groups.find((g) => g.key === opt.group_key);
  // tapping a chosen option removes it (single groups fall back to "as designed")
  if (selected.includes(key)) return selected.filter((k) => k !== key);
  let next = selected;
  if (group?.selection === "single") {
    next = next.filter((k) => opts.get(k)?.group_key !== opt.group_key);
  }
  if (conflictReason(key, next, catalog.rules)) return selected;
  return [...next, key];
}

export function defaultSelections(design: Design, regions: DesignRegion[], catalog: Catalog): Selections {
  const colors: Record<string, string> = {};
  for (const r of regions) colors[r.key] = r.default_color;
  return {
    version: null,
    colors,
    fabric: design.default_fabric,
    options: design.default_options.filter((k) => catalog.options.some((o) => o.key === k && o.active)),
    size: catalog.sizes.find((s) => s.key === "M")?.key ?? catalog.sizes[0]?.key ?? "M",
    qty: 1,
    neededBy: null,
    notes: "",
  };
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Checks a selection against the catalog. Used by the server before saving. */
export function validateSelections(
  catalog: Catalog,
  design: Design,
  regions: DesignRegion[],
  sel: Selections,
): ValidationResult {
  const errors: string[] = [];
  if (sel.version && !(design.versions ?? []).some((v) => v.key === sel.version)) errors.push("That version of the design isn't available.");
  const fabric = catalog.fabrics.find((f) => f.key === sel.fabric && f.active);
  if (!fabric || !design.fabric_keys.includes(sel.fabric)) errors.push(`Fabric "${sel.fabric}" is not available for this design.`);

  for (const r of regions) {
    const v = sel.colors[r.key];
    if (!v) {
      errors.push(`Choose a colour for ${r.label}.`);
      continue;
    }
    if (isCustomColor(v)) continue;
    const c = catalog.palette.find((p) => p.key === v && p.active);
    if (!c) errors.push(`Unknown colour "${v}".`);
    else if (fabric?.available_colors && !fabric.available_colors.includes(v))
      errors.push(`${c.name} isn't available in ${fabric.name}.`);
  }
  for (const k of Object.keys(sel.colors)) {
    if (!regions.some((r) => r.key === k)) errors.push(`Unknown colour region "${k}".`);
  }

  const opts = optionMap(catalog.options);
  const seenSingle = new Set<string>();
  for (const k of sel.options) {
    const o = opts.get(k);
    if (!o || !o.active) {
      errors.push(`Unknown option "${k}".`);
      continue;
    }
    if (!design.addon_groups.includes(o.group_key)) errors.push(`${o.name} is not offered on this design.`);
    const g = catalog.groups.find((x) => x.key === o.group_key);
    if (g?.selection === "single") {
      if (seenSingle.has(g.key)) errors.push(`Only one ${g.name.toLowerCase()} option can be chosen.`);
      seenSingle.add(g.key);
    }
    const reason = conflictReason(k, sel.options.filter((x) => x !== k), catalog.rules);
    if (reason) errors.push(reason);
  }
  if (new Set(sel.options).size !== sel.options.length) errors.push("Duplicate options.");

  if (!catalog.sizes.some((s) => s.key === sel.size)) errors.push(`Unknown size "${sel.size}".`);
  if (!Number.isInteger(sel.qty) || sel.qty < 1 || sel.qty > catalog.settings.max_quantity)
    errors.push(`Quantity must be between 1 and ${catalog.settings.max_quantity}.`);
  if (sel.notes.length > 1000) errors.push("Notes are too long (max 1000 characters).");
  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}

/**
 * price = base + fabric + Σ add-ons + size + custom-colour fees (+ rush %), × quantity.
 * The range shown to customers is total ± settings.range_percent, rounded to 100.
 */
export function computePrice(
  catalog: Catalog,
  design: Design,
  sel: Selections,
  today: Date = new Date(),
): PriceResult {
  const s = catalog.settings;
  const lines: PriceLine[] = [{ label: `${design.name} (base)`, amount: design.base_price, kind: "base" }];

  const version = sel.version ? (design.versions ?? []).find((v) => v.key === sel.version) : undefined;
  if (version && version.price !== 0) lines.push({ label: version.name, amount: version.price, kind: "version" });

  const fabric = catalog.fabrics.find((f) => f.key === sel.fabric);
  if (fabric && fabric.price_modifier !== 0)
    lines.push({ label: `Fabric: ${fabric.name}`, amount: fabric.price_modifier, kind: "fabric" });

  const opts = optionMap(catalog.options);
  for (const k of sel.options) {
    const o = opts.get(k);
    if (!o || o.price === 0) continue;
    const amount = o.price_type === "per_metre" ? Math.round(o.price * design.fabric_metres) : o.price;
    lines.push({
      label: o.price_type === "per_metre" ? `${o.name} (${design.fabric_metres} m)` : o.name,
      amount,
      kind: "addon",
    });
  }

  const size = catalog.sizes.find((x) => x.key === sel.size);
  if (size && size.modifier !== 0) lines.push({ label: `Size ${size.label}`, amount: size.modifier, kind: "size" });

  const customCount = new Set(Object.values(sel.colors).filter(isCustomColor).map((h) => h.toLowerCase())).size;
  if (customCount > 0 && s.custom_color_fee > 0)
    lines.push({
      label: `Custom colour sourcing × ${customCount}`,
      amount: s.custom_color_fee * customCount,
      kind: "colour",
    });

  const unit = lines.reduce((a, l) => a + l.amount, 0);
  const quantity = Math.max(1, Math.floor(sel.qty || 1));
  const subtotal = unit * quantity;

  let rush = false;
  let tooSoon = false;
  let leadDays = Infinity;
  if (sel.neededBy) {
    leadDays = daysBetween(today, sel.neededBy);
    rush = leadDays < s.standard_lead_days;
    tooSoon = leadDays < s.rush_min_days;
  }
  const rushFee = rush ? round100((subtotal * s.rush_fee_percent) / 100) : 0;
  if (rushFee) lines.push({ label: `Rush (${s.rush_fee_percent}%)`, amount: rushFee, kind: "rush" });

  const total = subtotal + rushFee;
  const delta = (total * s.range_percent) / 100;
  return {
    lines,
    unit,
    quantity,
    subtotal,
    rushFee,
    total,
    min: Math.max(0, round100(total - delta)),
    max: round100(total + delta),
    rush,
    tooSoon,
    leadDays: Number.isFinite(leadDays) ? leadDays : -1,
  };
}

/** Estimated ready date: lead time plus any weeks already queued at capacity. */
export function estimateReadyDate(today: Date, leadDays: number, queueWeeks: number) {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  d.setDate(d.getDate() + leadDays + queueWeeks * 7);
  return d;
}
