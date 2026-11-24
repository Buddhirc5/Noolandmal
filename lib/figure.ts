// Parametric dress "fashion flat" on a dress form. Each design is a list of
// layers (slot + variant + colour region); add-on options can override a slot
// (e.g. sleeves → puff) or add an extra (e.g. extra → bow). The builder returns
// plain shape descriptors that render to React (live preview) or to an SVG
// string (Open Graph images). Real raster layers uploaded in admin bypass this.
import type { LayerSpec } from "./types";

export interface Shape {
  d: string;
  region: string | null; // colour region; null = fixed colour
  fill?: string;
  opacity?: number;
  line?: boolean; // stroke-only path
  width?: number;
  texture?: "lace" | "sequin" | "knit" | "tulle" | "embroidery" | "print";
  sheen?: boolean;
  /** draw only the texture pattern (in the region colour) over what's below — no solid fill */
  patternOnly?: boolean;
}

export interface FigureLayer {
  slot: string;
  variant: string;
  region_key: string;
}

export const VIEWBOX = { w: 300, h: 600 };
const CX = 150;
const WAIST = 205;
const HIP = 265;

export const LENGTHS: Record<string, number> = {
  none: WAIST,
  mini: 320,
  knee: 390,
  midi: 455,
  maxi: 535,
  floor: 565,
  train: 565,
};

const mirror = (d: string) =>
  d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${(2 * CX - Number(x)).toFixed(1)},${y}`);

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;

// ── Bodices ─────────────────────────────────────────────────────────────
const SIDES = "L196,118 Q192,160 183,205 L117,205 Q108,160 104,118";
const BODICES: Record<string, string> = {
  strapless: "M104,118 Q150,104 196,118 Q192,160 183,205 L117,205 Q108,160 104,118 Z",
  sweetheart: "M104,118 Q126,102 150,124 Q174,102 196,118 Q192,160 183,205 L117,205 Q108,160 104,118 Z",
  "v-neck": `M112,76 L134,72 L150,140 L166,72 L188,76 ${SIDES} Z`,
  scoop: `M108,78 L128,74 Q150,116 172,74 L192,78 ${SIDES} Z`,
  boat: `M102,80 Q150,92 198,80 ${SIDES} Z`,
  square: `M106,78 L124,76 L124,112 L176,112 L176,76 L194,78 ${SIDES} Z`,
  "one-shoulder": "M104,126 L184,72 L198,80 L196,118 Q192,160 183,205 L117,205 Q108,160 104,126 Z",
  halter: "M104,118 L140,64 L160,64 L196,118 Q192,160 183,205 L117,205 Q108,160 104,118 Z",
  "off-shoulder": "M84,100 Q150,120 216,100 L212,116 Q202,118 196,126 Q192,160 183,205 L117,205 Q108,160 104,126 Q98,118 88,116 Z",
  "crop-v": "M112,76 L134,72 L150,134 L166,72 L188,76 L196,118 L191,180 Q150,188 109,180 L104,118 Z",
  "sweetheart-crop": "M100,84 Q112,78 122,82 L124,104 Q138,100 150,118 Q162,100 176,104 L178,82 Q188,78 200,84 L196,118 L192,178 Q150,186 108,178 L104,118 Z",
};
const STRAPS: Record<string, string[]> = {
  sweetheart: ["M110,113 L114,76", mirror("M110,113 L114,76")],
};

// ── Sleeves (left side; mirrored for right) ───────────────────────────────
const SLEEVES: Record<string, string> = {
  cap: "M101,80 Q86,86 83,106 L104,114 Z",
  puff: "M101,80 C76,76 68,110 84,124 L104,116 Z",
  elbow: "M101,80 L84,98 L72,190 L91,194 L104,120 Z",
  long: "M101,80 L84,98 L60,292 L79,296 L104,120 Z",
  sheer: "M101,80 L84,98 L58,292 L80,296 L104,120 Z",
};

// ── Skirts ───────────────────────────────────────────────────────────────
function skirtPath(shape: string, H: number): { d: string; hemHalf: number } {
  switch (shape) {
    case "column": {
      return {
        d: `M117,205 L183,205 Q198,240 196,${HIP} L188,${H} Q150,${H + 4} 112,${H} L104,${HIP} Q102,240 117,205 Z`,
        hemHalf: 38,
      };
    }
    case "mermaid": {
      if (H < 450) return skirtPath("column", H);
      const k = H - 125;
      return {
        d: `M117,205 L183,205 Q198,240 196,${HIP} L186,${k} Q204,${H - 40} 224,${H} Q150,${H + 8} 76,${H} Q96,${H - 40} 114,${k} L104,${HIP} Q102,240 117,205 Z`,
        hemHalf: 74,
      };
    }
    case "ball": {
      const w = 60 + (H - WAIST) * 0.26;
      return {
        d: `M117,205 L183,205 C204,240 ${CX + w - 6},${H - 70} ${CX + w},${H} Q150,${H + 14} ${CX - w},${H} C${CX - w + 6},${H - 70} 96,240 117,205 Z`,
        hemHalf: w,
      };
    }
    case "none":
      return { d: "", hemHalf: 0 };
    case "aline":
    case "tiered":
    default: {
      const w = 33 + (H - WAIST) * 0.27;
      return {
        d: `M117,205 L183,205 Q${CX + w - 10},${(WAIST + H) / 2} ${CX + w},${H} Q150,${H + 10} ${CX - w},${H} Q${CX - w + 10},${(WAIST + H) / 2} 117,205 Z`,
        hemHalf: w,
      };
    }
  }
}

function leaf(x: number, y: number, angle: number, size: number) {
  const r = (angle * Math.PI) / 180;
  const p = (dx: number, dy: number) => {
    const X = x + (dx * Math.cos(r) - dy * Math.sin(r)) * size;
    const Y = y + (dx * Math.sin(r) + dy * Math.cos(r)) * size;
    return `${X.toFixed(1)},${Y.toFixed(1)}`;
  };
  return `M${p(0, 0)} Q${p(6, -10)} ${p(0, -26)} Q${p(-6, -10)} ${p(0, 0)} Z`;
}

function flower(x: number, y: number, r: number) {
  let d = "";
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 * Math.PI) / 180;
    d += circle(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, r * 0.75) + " ";
  }
  return d.trim();
}

/** Deterministic pseudo-random sequence so flower scatter is stable. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const FORM_COLOR = "#E6DFD4";

export function dressForm(): Shape[] {
  return [
    { d: "M147,300 L153,300 L153,584 L147,584 Z", region: null, fill: "#CFC6B8" },
    { d: "M112,588 Q150,576 188,588 Q150,596 112,588 Z", region: null, fill: "#CFC6B8" },
    { d: circle(150, 34, 9), region: null, fill: "#CFC6B8" },
    { d: "M140,42 L160,42 L161,68 L139,68 Z", region: null, fill: FORM_COLOR },
    {
      d: "M102,80 Q150,62 198,80 L196,118 Q192,160 183,205 Q198,240 196,265 Q150,284 104,265 Q102,240 117,205 Q108,160 104,118 Z",
      region: null,
      fill: FORM_COLOR,
    },
  ];
}

/**
 * Resolve the effective layer list: design layers, with option layers replacing
 * the same slot (bodice/sleeves/skirt/length/texture) or adding extras.
 */
export function resolveLayers(base: FigureLayer[], overrides: LayerSpec[], regionKeys?: string[]): FigureLayer[] {
  const out = base.map((l) => ({ ...l }));
  const mainRegion = out.find((l) => l.slot === "skirt")?.region_key ?? out.find((l) => l.slot === "bodice")?.region_key ?? "main";
  // "overlay|accent" = first region the design actually has, else the main fabric
  const pick = (pref: string | undefined, fallback: string) => {
    if (!pref) return fallback;
    const prefs = pref.split("|");
    if (!regionKeys) return prefs[0];
    return prefs.find((p) => regionKeys.includes(p)) ?? (regionKeys.includes(fallback) ? fallback : mainRegion);
  };
  for (const o of overrides) {
    if (o.slot === "extra") {
      if (!out.some((l) => l.slot === "extra" && l.variant === o.variant))
        out.push({ slot: "extra", variant: o.variant, region_key: pick(o.region_key ?? "accent", mainRegion) });
      continue;
    }
    const existing = out.find((l) => l.slot === o.slot);
    if (existing) {
      existing.variant = o.variant;
      if (o.region_key) existing.region_key = pick(o.region_key, existing.region_key);
    } else {
      const region = pick(o.region_key, out.find((l) => l.slot === "bodice")?.region_key ?? mainRegion);
      out.push({ slot: o.slot, variant: o.variant, region_key: region });
    }
  }
  return out;
}

export function buildFigure(layers: FigureLayer[]): Shape[] {
  const get = (slot: string) => layers.find((l) => l.slot === slot);
  const extras = layers.filter((l) => l.slot === "extra");
  const has = (v: string) => extras.find((e) => e.variant === v);

  const bodice = get("bodice");
  const sleeves = get("sleeves");
  const skirt = get("skirt");
  const lengthKey = get("length")?.variant ?? "floor";
  const H = skirt?.variant === "none" ? WAIST : (LENGTHS[lengthKey] ?? LENGTHS.floor);
  const mainRegion = bodice?.region_key ?? skirt?.region_key ?? "main";

  const back: Shape[] = [];
  const body: Shape[] = [];
  const front: Shape[] = [];

  // train sits behind everything
  if (lengthKey === "train" && skirt && skirt.variant !== "none") {
    back.push({ d: `M110,${H - 60} Q60,${H} 40,${H + 22} L260,${H + 22} Q240,${H} 190,${H - 60} Z`, region: skirt.region_key, sheen: true });
  }
  const cape = has("cape");
  if (cape) back.push({ d: `M184,72 L204,80 Q236,300 252,${H + 10} L196,${H + 10} Q200,300 190,120 Z`, region: cape.region_key, opacity: 0.42, texture: "tulle" });

  const sk = skirt ? skirtPath(skirt.variant, H) : { d: "", hemHalf: 0 };
  if (skirt && sk.d) {
    body.push({ d: sk.d, region: skirt.region_key, sheen: true });
    if (skirt.variant === "tiered") {
      for (const f of [0.36, 0.68]) {
        const y = WAIST + (H - WAIST) * f;
        const half = 33 + (y - WAIST) * 0.27;
        front.push({ d: `M${CX - half + 2},${y} Q150,${y + 6} ${CX + half - 2},${y}`, region: null, fill: "rgba(0,0,0,0.22)", line: true, width: 1.4 });
      }
    }
    // soft folds
    if (H - WAIST > 150) {
      for (const dx of [-0.55, -0.15, 0.3, 0.6]) {
        front.push({
          d: `M${CX + dx * 30},${WAIST + 40} Q${CX + dx * 40},${(WAIST + H) / 2} ${CX + dx * sk.hemHalf * 0.85},${H - 4}`,
          region: null,
          fill: "rgba(0,0,0,0.07)",
          line: true,
          width: 1.2,
        });
      }
    }
  }

  const ovs = has("overlay-skirt");
  if (ovs) {
    const Ho = LENGTHS.floor;
    const w = 46 + (Ho - WAIST) * 0.28;
    front.push({
      d: `M114,206 L186,206 Q${CX + w - 12},${(WAIST + Ho) / 2} ${CX + w + 14},${Ho + 6} Q150,${Ho + 16} ${CX - w},${Ho} Q${CX - w + 12},${(WAIST + Ho) / 2} 114,206 Z`,
      region: ovs.region_key,
      opacity: 0.45,
      texture: "tulle",
    });
  }

  if (bodice) {
    body.push({ d: BODICES[bodice.variant] ?? BODICES.strapless, region: bodice.region_key, sheen: true });
    for (const s of STRAPS[bodice.variant] ?? []) front.push({ d: s, region: bodice.region_key, line: true, width: 3 });
    if (bodice.variant === "halter") front.push({ d: "M140,64 Q150,58 160,64", region: bodice.region_key, line: true, width: 4 });
  }

  if (sleeves && sleeves.variant !== "none" && SLEEVES[sleeves.variant]) {
    const d = SLEEVES[sleeves.variant];
    const sheer = sleeves.variant === "sheer";
    for (const p of [d, mirror(d)])
      body.push({ d: p, region: sleeves.region_key, opacity: sheer ? 0.45 : 1, texture: sheer ? "tulle" : undefined, sheen: !sheer });
  }

  const peplum = has("peplum");
  if (peplum) front.push({ d: "M116,204 L184,204 Q196,226 204,246 Q150,258 96,246 Q104,226 116,204 Z", region: peplum.region_key, sheen: true });

  const cardigan = has("cardigan");
  if (cardigan) {
    const panel = "M101,80 L128,76 Q134,150 140,222 L101,226 Q98,160 104,118 Z";
    const sleeve = "M101,80 L82,96 L64,282 L86,288 L104,122 Z";
    for (const p of [panel, mirror(panel), sleeve, mirror(sleeve)]) front.push({ d: p, region: cardigan.region_key, texture: "knit" });
    for (const y of [132, 160, 188]) front.push({ d: circle(138, y, 3), region: null, fill: "#3B2A20" });
  }

  const leaves = has("leaves");
  if (leaves) {
    const spots: [number, number, number, number][] = [
      [128, 214, -28, 1.5], [140, 196, -18, 1.6], [152, 176, -8, 1.55], [162, 156, 4, 1.5], [170, 136, 12, 1.4],
      [176, 118, 22, 1.25], [134, 232, -48, 1.25], [158, 190, 28, 1.2], [148, 158, -34, 1.1],
    ];
    for (const [x, y, a, s] of spots) front.push({ d: leaf(x, y, a, s), region: leaves.region_key, sheen: true });
  }

  const sash = has("sash-drape");
  if (sash) {
    front.push({ d: "M116,197 L184,197 L185,213 L115,213 Z", region: sash.region_key, sheen: true });
    front.push({ d: `M160,206 L182,206 Q190,${(H + 206) / 2} 200,${H} L168,${H} Q166,${(H + 206) / 2} 160,206 Z`, region: sash.region_key, sheen: true });
  }

  const saree = has("saree-drape");
  if (saree) {
    front.push({ d: "M100,82 L124,74 Q170,140 196,206 L196,236 Q160,250 128,262 Q118,170 100,82 Z", region: saree.region_key, opacity: 0.82, texture: "lace" });
    front.push({ d: `M124,214 L172,214 L${CX + 46},${H} L${CX - 40},${H} Z`, region: saree.region_key, opacity: 0.7, texture: "lace" });
    front.push({ d: `M196,82 Q212,240 222,${Math.min(H, 470)} L204,${Math.min(H, 470)} Q198,240 190,110 Z`, region: saree.region_key, opacity: 0.55, texture: "lace" });
  }

  const insert = has("lace-insert");
  if (insert && H > 400) front.push({ d: `M146,${H - 190} L154,${H - 190} L176,${H} L124,${H} Z`, region: insert.region_key, texture: "lace" });

  const ties = has("ties");
  if (ties) {
    front.push({ d: "M104,118 Q96,250 94,392", region: ties.region_key, line: true, width: 2.5 });
    front.push({ d: "M196,118 Q204,250 206,392", region: ties.region_key, line: true, width: 2.5 });
  }

  const flowers = has("flowers-scatter");
  if (flowers) {
    const r = rng(7);
    const n = 34;
    for (let i = 0; i < n; i++) {
      const y = 90 + r() * (H - 100);
      let half: number;
      if (y < 118) half = 40;
      else if (y < WAIST) half = 44 - (y - 118) * 0.1;
      else half = Math.max(30, sk.hemHalf * ((y - WAIST) / Math.max(1, H - WAIST))) + 20;
      const x = CX + (r() * 2 - 1) * (half - 10);
      if (bodice?.variant === "crop-v" && y > 182 && y < 206) continue;
      front.push({ d: flower(x, y, 3 + r() * 3.5), region: flowers.region_key, sheen: true });
    }
  }

  const flower3d = has("flower-3d");
  if (flower3d) front.push({ d: flower(126, 120, 9), region: flower3d.region_key, sheen: true }, { d: circle(126, 120, 3.5), region: null, fill: "#C9A66B" });

  const belt = has("belt");
  if (belt) {
    front.push({ d: "M116,198 L184,198 L185,212 L115,212 Z", region: belt.region_key, sheen: true });
    front.push({ d: "M144,197 L156,197 L156,213 L144,213 Z", region: null, fill: "#C9A66B", opacity: 0.9 });
  }

  const bow = has("bow");
  if (bow) {
    front.push({ d: "M150,205 L124,192 L126,218 Z M150,205 L176,192 L174,218 Z", region: bow.region_key, sheen: true });
    front.push({ d: "M146,206 L138,250 L146,248 L150,210 L154,248 L162,250 L154,206 Z", region: bow.region_key });
    front.push({ d: circle(150, 205, 5), region: bow.region_key });
  }

  const shoulderBow = has("shoulder-bow");
  if (shoulderBow) {
    // tie knotted at the open shoulder (left), tails falling down the arm
    front.push({ d: "M100,112 L82,100 L80,126 Z M100,112 L118,96 L112,124 Z", region: shoulderBow.region_key, sheen: true });
    front.push({ d: "M97,114 Q88,170 84,236 L92,238 Q96,172 103,116 Z", region: shoulderBow.region_key, sheen: true });
    front.push({ d: circle(100, 112, 5), region: shoulderBow.region_key });
  }

  const stole = has("stole");
  if (stole) {
    const drape = "M100,92 Q78,160 70,300 Q78,306 88,300 Q92,190 108,132 Z";
    for (const d of [drape, mirror(drape)]) front.push({ d, region: stole.region_key, opacity: 0.5, texture: "tulle" });
  }

  const hemLace = has("hem-lace");
  if (hemLace && skirt && sk.d) {
    const h = sk.hemHalf;
    front.push({ d: `M${CX - h + 3},${H - 18} Q150,${H - 10} ${CX + h - 3},${H - 18} L${CX + h},${H} Q150,${H + 10} ${CX - h},${H} Z`, region: hemLace.region_key, texture: "lace" });
  }

  const crochet = has("crochet-hem");
  if (crochet && skirt && sk.d) {
    const h = sk.hemHalf;
    let d = "";
    const n = Math.max(6, Math.round(h / 7));
    for (let i = 0; i < n; i++) {
      const x = CX - h + ((i + 0.5) * 2 * h) / n;
      d += circle(x, H + 2, (h / n) * 0.95) + " ";
    }
    front.push({ d: d.trim(), region: crochet.region_key, texture: "knit" });
  }

  const beads = has("beads");
  if (beads) {
    const r = rng(3);
    let d = "";
    for (let i = 0; i < 46; i++) {
      const y = 112 + r() * 92;
      const half = 44 - (y - 118) * 0.12;
      d += circle(CX + (r() * 2 - 1) * (half - 6), y, 1.4) + " ";
    }
    front.push({ d: d.trim(), region: beads.region_key });
  }

  const buttons = has("buttons");
  if (buttons) for (const y of [128, 150, 172, 194]) front.push({ d: circle(150, y, 3), region: buttons.region_key, sheen: true });

  const pockets = has("pockets");
  if (pockets && skirt && sk.d && H > 300) {
    front.push({ d: "M112,232 Q118,252 116,272", region: null, fill: "rgba(0,0,0,0.3)", line: true, width: 1.5 });
    front.push({ d: "M188,232 Q182,252 184,272", region: null, fill: "rgba(0,0,0,0.3)", line: true, width: 1.5 });
  }

  // fabric texture over the main region (sequin net, lace, knit, embroidery)
  const texture = get("texture");
  if (texture && texture.variant !== "none") {
    for (const s of [...body]) {
      if (s.region === texture.region_key && !s.line)
        front.unshift({ d: s.d, region: texture.region_key, texture: texture.variant as Shape["texture"], opacity: 1 });
    }
  }
  const sparkle = has("sparkle");
  if (sparkle) for (const s of [...body]) if (s.region === mainRegion && !s.line) front.unshift({ d: s.d, region: sparkle.region_key, texture: "sequin", patternOnly: true });
  const emb = has("embroidery");
  if (emb && bodice) front.push({ d: BODICES[bodice.variant] ?? BODICES.strapless, region: emb.region_key, texture: "print", patternOnly: true });
  // all-over print / embroidery in the accent colour across the main fabric
  const print = has("print");
  if (print) for (const s of [...body]) if (s.region === mainRegion && !s.line) front.unshift({ d: s.d, region: print.region_key, texture: "print", patternOnly: true });

  return [...dressForm(), ...back, ...body, ...front];
}

// ── Colour helpers ───────────────────────────────────────────────────────
export function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function shade(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const m = (c: number) => Math.round((t - c) * p + c);
  return `#${((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1)}`;
}

/** Texture pattern definitions; `tone` is the region colour. */
export function patternDefs(id: string, tone: string, texture: NonNullable<Shape["texture"]>): string {
  const light = shade(tone, luminance(tone) > 0.5 ? -0.25 : 0.45);
  switch (texture) {
    case "lace":
      return `<pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M6 1 Q9 6 6 11 Q3 6 6 1Z M0 6 Q3 9 0 12 M12 0 Q9 3 12 6" fill="none" stroke="${light}" stroke-width="0.9" opacity="0.9"/><circle cx="6" cy="6" r="1.1" fill="${light}"/></pattern>`;
    case "sequin":
      return `<pattern id="${id}" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.9" fill="#fff" opacity="0.55"/><circle cx="5.5" cy="5" r="0.7" fill="${light}" opacity="0.9"/></pattern>`;
    case "knit":
      return `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0 L3 4 L6 0" fill="none" stroke="${shade(tone, -0.18)}" stroke-width="0.8"/></pattern>`;
    case "tulle":
      return `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0 L4 4 M4 0 L0 4" stroke="${shade(tone, -0.2)}" stroke-width="0.3" opacity="0.6"/></pattern>`;
    case "print":
      return `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M9 2 C13 6 13 11 9 15 C5 11 5 6 9 2Z" fill="${tone}" opacity="0.85"/><path d="M0 9 Q4 7 6 11" fill="none" stroke="${tone}" stroke-width="1"/><circle cx="15" cy="16" r="1.6" fill="${tone}"/></pattern>`;
    case "embroidery":
      return `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M8 3 C11 6 11 10 8 13 C5 10 5 6 8 3Z" fill="none" stroke="${light}" stroke-width="0.8"/><circle cx="2" cy="14" r="1" fill="${light}"/></pattern>`;
  }
}

/** Serialises a figure to a standalone SVG string (used for OG images & thumbnails). */
export function figureToSvg(shapes: Shape[], colorOf: (region: string) => string, opts: { background?: string; sheen?: number } = {}): string {
  const defs: string[] = [
    `<linearGradient id="sheen" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="${0.05 + (opts.sheen ?? 0.15)}"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${0.1 + (opts.sheen ?? 0.15) / 2}"/></linearGradient>`,
  ];
  const seen = new Set<string>();
  const body: string[] = [];
  shapes.forEach((s) => {
    const color = s.region ? colorOf(s.region) : (s.fill ?? "#000");
    const op = s.opacity ?? 1;
    if (s.line) {
      body.push(`<path d="${s.d}" fill="none" stroke="${color}" stroke-width="${s.width ?? 2}" stroke-linecap="round" opacity="${op}"/>`);
      return;
    }
    if (!s.patternOnly) body.push(`<path d="${s.d}" fill="${color}" opacity="${op}" stroke="rgba(0,0,0,0.16)" stroke-width="0.8"/>`);
    if (s.texture) {
      const pid = `p-${s.texture}-${color.replace("#", "")}`;
      if (!seen.has(pid)) {
        seen.add(pid);
        defs.push(patternDefs(pid, color.startsWith("#") ? color : "#888888", s.texture));
      }
      body.push(`<path d="${s.d}" fill="url(#${pid})" opacity="${Math.min(1, op + 0.3)}"/>`);
    }
    if (s.sheen) body.push(`<path d="${s.d}" fill="url(#sheen)"/>`);
  });
  const bg = opts.background ? `<rect width="100%" height="100%" fill="${opts.background}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX.w} ${VIEWBOX.h}"><defs>${defs.join("")}</defs>${bg}${body.join("")}</svg>`;
}

/** Variants the parametric preview understands, per slot (used by the admin design editor). */
export const VARIANTS: Record<string, string[]> = {
  bodice: Object.keys(BODICES),
  sleeves: ["none", ...Object.keys(SLEEVES)],
  skirt: ["column", "mermaid", "aline", "ball", "tiered", "none"],
  length: ["mini", "knee", "midi", "maxi", "floor", "train"],
  texture: ["none", "lace", "sequin", "knit", "tulle", "embroidery", "print"],
  extra: ["overlay-skirt", "leaves", "shoulder-bow", "print", "sash-drape", "saree-drape", "lace-insert", "ties", "flowers-scatter", "flower-3d", "belt", "bow", "stole", "cape", "cardigan", "peplum", "hem-lace", "crochet-hem", "beads", "buttons", "pockets", "sparkle", "embroidery"],
  image: [""],
};
