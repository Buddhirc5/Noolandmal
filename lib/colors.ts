import type { PaletteColor } from "./types";
import { HEX_RE } from "./pricing";

export function colorHex(value: string | undefined, palette: PaletteColor[], fallback = "#cccccc"): string {
  if (!value) return fallback;
  if (HEX_RE.test(value)) return value;
  return palette.find((p) => p.key === value)?.hex ?? fallback;
}

export function colorName(value: string | undefined, palette: PaletteColor[]): string {
  if (!value) return "—";
  if (HEX_RE.test(value)) return `Custom ${value.toUpperCase()}`;
  return palette.find((p) => p.key === value)?.name ?? value;
}

export const SHEEN: Record<string, number> = {
  satin: 0.32,
  "silk-blend": 0.28,
  "sequin-net": 0.25,
  tulle: 0.12,
  crepe: 0.1,
  jersey: 0.12,
  brocade: 0.2,
  cotton: 0.06,
  linen: 0.04,
  "crochet-cotton": 0.04,
};
