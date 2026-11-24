// Generates favicon.ico, apple-touch-icon.png, icon.svg and PWA icons from the SVG flower.
import sharp from "sharp";
import fs from "node:fs";

const GREEN = "#1F4D40", GOLD = "#C9A66B";
const flower = (stroke, dot, sw = 2) =>
  [0, 72, 144, 216, 288].map((a) => `<ellipse cx="24" cy="14.2" rx="6.6" ry="9.4" transform="rotate(${a} 24 24)" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`).join("") +
  `<circle cx="24" cy="24" r="2.6" fill="${dot}"/>`;
const svg = (bg, pad = 0, sw = 2) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${48 + 2 * pad} ${48 + 2 * pad}">${bg ? `<rect x="${-pad}" y="${-pad}" width="${48 + 2 * pad}" height="${48 + 2 * pad}" rx="${(48 + 2 * pad) * 0.22}" fill="${bg}"/>` : ""}${flower(GREEN, GOLD, sw)}</svg>`;

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/icon.svg", svg("#F8F5F0", 2));
fs.writeFileSync("public/brand/nool-mal-icon.svg", svg(null));
const png = (size, pad, sw) => sharp(Buffer.from(svg("#F8F5F0", pad, sw))).resize(size, size).png().toBuffer();
fs.writeFileSync("public/apple-touch-icon.png", await png(180, 6, 2));
fs.writeFileSync("public/icon-192.png", await png(192, 6, 2));
fs.writeFileSync("public/icon-512.png", await png(512, 6, 2));
// ICO containing 16/32/48 PNGs
const sizes = [16, 32, 48];
const imgs = await Promise.all(sizes.map((s) => png(s, 1, s <= 16 ? 3 : 2.4)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dir = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(imgs[i].length, 8); e.writeUInt32LE(offset, 12);
  offset += imgs[i].length;
  return e;
});
fs.writeFileSync("public/favicon.ico", Buffer.concat([header, ...dir, ...imgs]));
console.log("brand assets written");
