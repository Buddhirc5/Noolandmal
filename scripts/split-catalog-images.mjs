// Splits 2x2 lookbook collages into four panels (front, back, detail, angle).
// Usage: node scripts/split-catalog-images.mjs <srcDir> [outDir]
// Map of source file -> design slug lives in MAP below; edit it when adding collages.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const MAP = {
  "353bc4ff-image.jpg": "blush-leaf-tulle-gown",
  "2384b9fe-image.jpg": "noir-sequin-sash-gown",
  "c2e22212-image.jpg": "mauve-lace-drape-saree",
  "a1f34377-image.jpg": "maroon-tie-back-column-dress",
  "78b447b0-image.jpg": "sage-bloom-lehenga-set",
  "75b9c876-image.jpg": "aqua-one-shoulder-cape-gown",
  "71970717-image.jpg": "cocoa-tiered-maxi-skirt-set",
  "1f9539fa-image.jpg": "navy-sequin-fan-party-dress",
  "721bea82-image.jpg": "navy-silver-peplum-drape-saree",
  "41e00773-image.jpg": "champagne-lace-high-neck-saree",
  "70033e8f-image.jpg": "cocoa-linen-peplum-top",
  "6f73a09f-image.jpg": "botanical-bow-shoulder-mini",
  "36bdf447-image.jpg": "lilac-ruffle-saree",
};
const VIEWS = ["front", "back", "detail", "angle"];
const [src, out = "public/catalog"] = process.argv.slice(2);
if (!src) { console.error("usage: split-catalog-images.mjs <srcDir> [outDir]"); process.exit(1); }

function findGutter(profile, from, to) {
  // longest run of "white" lines in [from,to]; returns [start,end]
  let best = [0, -1], cur = null;
  for (let i = from; i <= to; i++) {
    if (profile[i] > 0.97) { cur = cur ? [cur[0], i] : [i, i]; if (cur[1] - cur[0] > best[1] - best[0]) best = cur; }
    else cur = null;
  }
  return best[1] >= 0 ? best : [Math.floor((from + to) / 2), Math.floor((from + to) / 2)];
}

for (const [file, slug] of Object.entries(MAP)) {
  const p = path.join(src, file);
  if (!fs.existsSync(p)) { console.warn("missing", p); continue; }
  const img = sharp(p);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const white = (x, y) => { const i = (y * W + x) * C; return data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238; };
  const col = new Float32Array(W), row = new Float32Array(H);
  for (let x = Math.floor(W * 0.4); x < W * 0.6; x++) { let n = 0; for (let y = 0; y < H; y += 2) n += white(x, y); col[x] = n / (H / 2); }
  for (let y = Math.floor(H * 0.4); y < H * 0.6; y++) { let n = 0; for (let x = 0; x < W; x += 2) n += white(x, y); row[y] = n / (W / 2); }
  const [gx0, gx1] = findGutter(col, Math.floor(W * 0.4), Math.floor(W * 0.6));
  const [gy0, gy1] = findGutter(row, Math.floor(H * 0.4), Math.floor(H * 0.6));
  const pad = 6;
  const boxes = [
    { left: pad, top: pad, width: gx0 - 2 * pad, height: gy0 - 2 * pad },
    { left: gx1 + pad, top: pad, width: W - gx1 - 2 * pad, height: gy0 - 2 * pad },
    { left: pad, top: gy1 + pad, width: gx0 - 2 * pad, height: H - gy1 - 2 * pad },
    { left: gx1 + pad, top: gy1 + pad, width: W - gx1 - 2 * pad, height: H - gy1 - 2 * pad },
  ];
  const dir = path.join(out, slug);
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < 4; i++) {
    // .rotate() applies EXIF orientation; sharp drops all metadata (incl. GPS) by default
    await sharp(p).rotate().extract(boxes[i]).resize({ width: 900, withoutEnlargement: true })
      .webp({ quality: 80 }).toFile(path.join(dir, `${VIEWS[i]}.webp`));
  }
  console.log(slug, "gutter x", gx0, gx1, "y", gy0, gy1);
}
