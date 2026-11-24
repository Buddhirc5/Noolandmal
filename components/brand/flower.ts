// Geometry for the Nool & Mal flower: five looped-thread petals (rings) around a gold centre.
export const FLOWER_GREEN = "#1F4D40";
export const FLOWER_GOLD = "#C9A66B";

/** Returns SVG markup for the icon in a 48×48 box. */
export function flowerSvgInner(stroke = FLOWER_GREEN, dot = FLOWER_GOLD, strokeWidth = 2): string {
  const petals = [0, 72, 144, 216, 288]
    .map((a) => `<ellipse cx="24" cy="14.2" rx="6.6" ry="9.4" transform="rotate(${a} 24 24)" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"/>`)
    .join("");
  return `${petals}<circle cx="24" cy="24" r="2.6" fill="${dot}"/>`;
}

export function flowerSvg(size = 48, stroke = FLOWER_GREEN, dot = FLOWER_GOLD, background?: string): string {
  const bg = background ? `<rect width="48" height="48" rx="10" fill="${background}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">${bg}${flowerSvgInner(stroke, dot)}</svg>`;
}
