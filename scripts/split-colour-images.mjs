// Splits 2x2 colour collages (top-left, top-right, bottom-left, bottom-right) into
// per-colour photos at public/catalog/<slug>/colours/<colour-key>.webp
// Usage: node scripts/split-colour-images.mjs <srcDir>
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const MAP = {
  "94c556ef-image.jpg": ["satin-halter-a-line-gown", ["maroon", "champagne", "sage", "navy"]],
  "3f9fd69f-image.jpg": ["cocoa-tiered-maxi-skirt-set", ["maroon", "cream", "sage", "navy"]],
  "961fd6ba-image.jpg": ["maroon-tie-back-column-dress", ["maroon", "cream", "sage", "navy"]],
  "ec5ff5a4-image.jpg": ["aqua-one-shoulder-cape-gown", ["maroon", "champagne", "sage", "navy"]],
  "41d850ac-image.jpg": ["sage-bloom-lehenga-set", ["maroon", "ivory", "mint", "navy"]],
  "84c03d88-image.jpg": ["mauve-lace-drape-saree", ["royal-blue", "emerald", "red", "champagne"]],
  "3f693e2c-image.jpg": ["noir-sequin-sash-gown", ["maroon", "emerald", "royal-blue", "gold"]],
  "5bc868bd-image.jpg": ["blush-leaf-tulle-gown", ["purple", "teal", "dusty-rose", "navy"]],
  "f56d08b2-image.jpg": ["cocoa-linen-peplum-top", ["sage", "blush", "lilac", "sky"]],
};
const src = process.argv[2];
if (!src) throw new Error("usage: split-colour-images.mjs <srcDir>");

function gutter(profile, from, to) {
  let best = [0, -1], cur = null;
  for (let i = from; i <= to; i++) {
    if (profile[i] > 0.97) { cur = cur ? [cur[0], i] : [i, i]; if (cur[1] - cur[0] > best[1] - best[0]) best = cur; } else cur = null;
  }
  return best[1] >= 0 ? best : [Math.floor((from + to) / 2), Math.floor((from + to) / 2)];
}

for (const [file, [slug, keys]] of Object.entries(MAP)) {
  const p = path.join(src, file);
  if (!fs.existsSync(p)) { console.warn("missing", file); continue; }
  const { data, info } = await sharp(p).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const white = (x, y) => { const i = (y * W + x) * C; return data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238; };
  const col = new Float32Array(W), row = new Float32Array(H);
  for (let x = Math.floor(W * 0.4); x < W * 0.6; x++) { let n = 0; for (let y = 0; y < H; y += 2) n += white(x, y); col[x] = n / (H / 2); }
  for (let y = Math.floor(H * 0.4); y < H * 0.6; y++) { let n = 0; for (let x = 0; x < W; x += 2) n += white(x, y); row[y] = n / (W / 2); }
  const [gx0, gx1] = gutter(col, Math.floor(W * 0.4), Math.floor(W * 0.6));
  const [gy0, gy1] = gutter(row, Math.floor(H * 0.4), Math.floor(H * 0.6));
  const pad = 6;
  const boxes = [
    { left: pad, top: pad, width: gx0 - 2 * pad, height: gy0 - 2 * pad },
    { left: gx1 + pad, top: pad, width: W - gx1 - 2 * pad, height: gy0 - 2 * pad },
    { left: pad, top: gy1 + pad, width: gx0 - 2 * pad, height: H - gy1 - 2 * pad },
    { left: gx1 + pad, top: gy1 + pad, width: W - gx1 - 2 * pad, height: H - gy1 - 2 * pad },
  ];
  const dir = path.join("public/catalog", slug, "colours");
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < 4; i++) {
    await sharp(p).rotate().extract(boxes[i]).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(dir, `${keys[i]}.webp`));
  }
  console.log(slug, keys.join(", "), "| gutters", gx0, gx1, gy0, gy1);
}
