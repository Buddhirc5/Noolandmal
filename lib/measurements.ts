import type { Catalog, Selections } from "./types";

export const MEASURE_FIELDS = [
  ["bust", "Bust"],
  ["waist", "Waist"],
  ["hip", "Hip"],
  ["length", "Shoulder to hem"],
] as const;

/** One-line description of how we'll get the customer's measurements, for WhatsApp and the admin. */
export function describeMeasurements(sel: Pick<Selections, "size" | "measurements">, catalog: Pick<Catalog, "sizes">): string {
  const label = catalog.sizes.find((s) => s.key === sel.size)?.label ?? sel.size;
  if (sel.size !== "own" || !sel.measurements) return label;
  const m = sel.measurements;
  const parts = [
    m.chart ? `size ${m.chart}` : null,
    ...MEASURE_FIELDS.map(([k, l]) => (m[k] ? `${l.toLowerCase()} ${m[k]} cm` : null)),
  ].filter(Boolean);
  return parts.length ? `${label}: ${parts.join(", ")}` : label;
}
