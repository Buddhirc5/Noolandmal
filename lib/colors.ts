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


/** Relative luminance (WCAG) of a #rrggbb colour, 0 = black, 1 = white. */
export function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
}
