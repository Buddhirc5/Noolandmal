import "server-only";
// Minimal A4 quotation / invoice. Pure JS (pdf-lib) so it runs on Vercel functions.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import sharp from "sharp";
import { flowerSvg } from "@/components/brand/flower";
import { site } from "@/config/site";
import type { Settings, StudioDocument } from "@/lib/types";
import { formatPhone } from "@/lib/format";

const INK = rgb(0.06, 0.06, 0.06);
const MUTED = rgb(0.45, 0.45, 0.47);
const LINE = rgb(0.88, 0.88, 0.89);
const SOFT = rgb(0.965, 0.962, 0.958);
const PINK = rgb(0.808, 0.067, 0.49); // #CE117D

const A4 = { w: 595.28, h: 841.89 };
const M = 48; // page margin

/** Helvetica only covers Latin-1; swap anything else for a safe character. */
const safe = (s: string) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E -ÿ–—•]/g, "?");

const money = (n: number) => "LKR " + Math.round(n).toLocaleString("en-LK");
const date = (iso: string | null) => (iso ? new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of safe(text).split(/\n/)) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > width && line) {
        out.push(line);
        line = word;
      } else line = next;
    }
    out.push(line);
  }
  return out;
}

export async function renderDocumentPdf(doc: StudioDocument, settings: Settings): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${doc.kind === "quote" ? "Quotation" : "Invoice"} ${doc.number} · ${site.name}`);
  pdf.setAuthor(site.name);
  pdf.setCreator(site.name);
  const page = pdf.addPage([A4.w, A4.h]);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const flower = await pdf.embedPng(await sharp(Buffer.from(flowerSvg(240))).png().toBuffer());

  const text = (p: PDFPage, s: string, x: number, y: number, o: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; align?: "left" | "right" } = {}) => {
    const font = o.font ?? sans;
    const size = o.size ?? 9.5;
    const str = safe(s);
    const dx = o.align === "right" ? font.widthOfTextAtSize(str, size) : 0;
    p.drawText(str, { x: x - dx, y, size, font, color: o.color ?? INK });
  };
  const hr = (y: number, x1 = M, x2 = A4.w - M, color = LINE, t = 0.6) => page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: t, color });

  const isQuote = doc.kind === "quote";
  let y = A4.h - M;

  // ── Brand ───────────────────────────────────────────────
  page.drawImage(flower, { x: M, y: y - 34, width: 34, height: 34 });
  text(page, "Nool", M + 44, y - 25, { font: serif, size: 24 });
  const wNool = serif.widthOfTextAtSize("Nool ", 24);
  text(page, "&", M + 44 + wNool, y - 25, { font: serif, size: 24, color: PINK });
  text(page, " Mal", M + 44 + wNool + serif.widthOfTextAtSize("&", 24), y - 25, { font: serif, size: 24 });
  text(page, "MADE TO ORDER  ·  SRI LANKA", M + 45, y - 37, { size: 6.5, color: MUTED });

  // ── Title ───────────────────────────────────────────────
  text(page, isQuote ? "Quotation" : "Invoice", A4.w - M, y - 22, { font: bold, size: 22, align: "right" });
  text(page, doc.number, A4.w - M, y - 37, { size: 10, color: MUTED, align: "right" });

  y -= 70;
  const studio = [site.studio.street, site.studio.city, `${site.phoneDisplay}  ·  ${site.url.replace(/^https?:\/\//, "")}`];
  studio.forEach((l, i) => text(page, l, M, y - i * 12, { size: 8.5, color: MUTED }));

  // ── Customer + dates ───────────────────────────────────
  y -= 52;
  const boxH = 64;
  page.drawRectangle({ x: M, y: y - boxH, width: A4.w - 2 * M, height: boxH, color: SOFT });
  text(page, isQuote ? "PREPARED FOR" : "BILLED TO", M + 16, y - 18, { size: 7, color: MUTED });
  text(page, doc.customer_name || "Customer", M + 16, y - 34, { font: bold, size: 12 });
  if (doc.customer_phone) text(page, formatPhone(doc.customer_phone), M + 16, y - 49, { size: 9, color: MUTED });
  const meta: [string, string][] = [
    ["ISSUED", date(doc.issued_on)],
    [isQuote ? "VALID UNTIL" : "DUE", date(doc.due_on)],
    ...(doc.order_code ? ([["ORDER", doc.order_code]] as [string, string][]) : []),
  ];
  meta.forEach(([k, v], i) => {
    const x = A4.w - M - 16 - (meta.length - 1 - i) * 92;
    text(page, k, x, y - 18, { size: 7, color: MUTED, align: "right" });
    text(page, v, x, y - 34, { font: bold, size: 10, align: "right" });
  });

  // ── Items ───────────────────────────────────────────────
  y -= boxH + 34;
  const col = { desc: M, qty: A4.w - M - 190, unit: A4.w - M - 95, amt: A4.w - M };
  text(page, "ITEM", col.desc, y, { size: 7, color: MUTED });
  text(page, "QTY", col.qty, y, { size: 7, color: MUTED, align: "right" });
  text(page, "PRICE", col.unit, y, { size: 7, color: MUTED, align: "right" });
  text(page, "AMOUNT", col.amt, y, { size: 7, color: MUTED, align: "right" });
  y -= 9;
  hr(y, M, A4.w - M, INK, 0.8);
  for (const l of doc.items) {
    const lines = wrap(l.description, sans, 10, col.qty - col.desc - 60);
    y -= 18;
    lines.forEach((ln, i) => text(page, ln, col.desc, y - i * 13, { size: 10 }));
    text(page, String(l.qty), col.qty, y, { size: 10, align: "right" });
    text(page, money(l.unit_price), col.unit, y, { size: 10, align: "right" });
    text(page, money(l.qty * l.unit_price), col.amt, y, { size: 10, align: "right" });
    y -= (lines.length - 1) * 13 + 10;
    hr(y);
  }

  // ── Totals ──────────────────────────────────────────────
  y -= 22;
  const tx = A4.w - M - 210;
  const row = (k: string, v: string, o: { strong?: boolean; color?: ReturnType<typeof rgb> } = {}) => {
    text(page, k, tx, y, { size: o.strong ? 11 : 9.5, font: o.strong ? bold : sans, color: o.strong ? INK : MUTED });
    text(page, v, A4.w - M, y, { size: o.strong ? 11 : 9.5, font: o.strong ? bold : sans, color: o.color ?? INK, align: "right" });
    y -= o.strong ? 20 : 16;
  };
  row("Subtotal", money(doc.subtotal));
  if (doc.discount) row("Discount", `– ${money(doc.discount)}`);
  if (doc.delivery_fee) row("Delivery", money(doc.delivery_fee));
  hr(y + 8, tx, A4.w - M);
  y -= 6;
  row("Total", money(doc.total), { strong: true });
  if (isQuote && doc.advance_amount) row(`Advance to confirm (${doc.advance_percent}%)`, money(doc.advance_amount));
  if (!isQuote) {
    if (doc.paid) row("Paid", `– ${money(doc.paid)}`);
    const due = Math.max(0, doc.total - doc.paid);
    y -= 12;
    page.drawRectangle({ x: tx - 12, y: y - 10, width: A4.w - M - tx + 12, height: 30, color: due ? PINK : SOFT });
    text(page, due ? "Balance due" : "Paid in full", tx, y, { font: bold, size: 11, color: due ? rgb(1, 1, 1) : INK });
    text(page, money(due), A4.w - M - 10, y, { font: bold, size: 11, color: due ? rgb(1, 1, 1) : INK, align: "right" });
    y -= 30;
  }

  // ── Notes ───────────────────────────────────────────────
  let by = Math.min(y - 14, 300);
  if (doc.notes) {
    text(page, "NOTES", M, by, { size: 7, color: MUTED });
    wrap(doc.notes, sans, 9, A4.w - 2 * M)
      .slice(0, 5)
      .forEach((l, i) => text(page, l, M, by - 14 - i * 12, { size: 9 }));
    by -= 30 + Math.min(5, wrap(doc.notes, sans, 9, A4.w - 2 * M).length) * 12;
  }

  // ── Payment + terms ─────────────────────────────────────
  by = Math.min(by, 236);
  hr(by + 12);
  const half = (A4.w - 2 * M) / 2;
  text(page, "PAYMENT", M, by - 4, { size: 7, color: MUTED });
  const bank = settings.bank;
  [bank.accountName, `${bank.bank} · ${bank.branch}`, `Account ${bank.accountNumber}`, `Reference: ${doc.order_code ?? doc.number}`].forEach((l, i) =>
    text(page, l, M, by - 19 - i * 12.5, { size: 9, font: i === 0 ? bold : sans }),
  );
  text(page, "TERMS", M + half, by - 4, { size: 7, color: MUTED });
  const terms = isQuote
    ? [
        `Valid for ${settings.quote_valid_days} days. Once agreed, the price and details stay fixed.`,
        `A ${doc.advance_percent || settings.advance_percent}% advance confirms your order and books your measurement date.`,
        "Colours and fabrics are confirmed against availability before cutting.",
        "Most pieces take 1–3 weeks; detailed patterns can take 3–6 weeks. Rush dates may cost extra.",
      ]
    : [
        "The balance is due before collection or delivery.",
        "Please use the reference above with your bank transfer.",
        "The advance is non-refundable once fabric has been bought or cut.",
        "Your measurements are kept on file for your next order.",
      ];
  let ty = by - 19;
  for (const t of terms) {
    const ls = wrap(t, sans, 8, half - 8);
    text(page, "•", M + half, ty, { size: 8, color: PINK });
    ls.forEach((l, i) => text(page, l, M + half + 9, ty - i * 10.5, { size: 8, color: MUTED }));
    ty -= ls.length * 10.5 + 4;
  }

  // ── Footer ──────────────────────────────────────────────
  page.drawLine({ start: { x: M, y: 70 }, end: { x: M + 28, y: 70 }, thickness: 2, color: PINK });
  text(page, `Thank you for choosing ${site.name}.`, M, 52, { font: serif, size: 13 });
  text(page, `Designed by ${site.designer}  ·  ${site.phoneDisplay}  ·  ${site.url.replace(/^https?:\/\//, "")}`, M, 38, { size: 8, color: MUTED });
  text(page, "Page 1 of 1", A4.w - M, 38, { size: 8, color: MUTED, align: "right" });

  return pdf.save();
}
