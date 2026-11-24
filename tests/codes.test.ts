import { describe, expect, it } from "vitest";
import { CODE_ALPHABET, generateAccessKey, generateCode, isValidCode, normalizeCode } from "@/lib/codes";
import { encodeSelections, decodeSelections } from "@/lib/selections";
import { buildMessage, buildWhatsAppLink } from "@/lib/whatsapp";

describe("codes", () => {
  it("generates NM-XXXXX codes from the unambiguous alphabet", () => {
    for (let i = 0; i < 500; i++) {
      const c = generateCode("NM");
      expect(c).toMatch(/^NM-[A-Z2-9]{5}$/);
      expect(c.slice(3)).not.toMatch(/[01OI]/);
      expect(isValidCode(c, "NM")).toBe(true);
    }
  });

  it("is deterministic given random bytes", () => {
    const code = generateCode("CR", () => new Uint8Array([0, 1, 2, 31, 32]));
    expect(code).toBe(`CR-${CODE_ALPHABET[0]}${CODE_ALPHABET[1]}${CODE_ALPHABET[2]}${CODE_ALPHABET[31]}${CODE_ALPHABET[0]}`);
  });

  it("rarely collides", () => {
    const set = new Set(Array.from({ length: 2000 }, () => generateCode("NM")));
    expect(set.size).toBeGreaterThan(1990);
  });

  it("normalises user input", () => {
    expect(normalizeCode(" nm7k4q2 ")).toBe("NM-7K4Q2");
    expect(normalizeCode("cr-3m9xa")).toBe("CR-3M9XA");
    expect(isValidCode("NM-7K4Q0")).toBe(false);
    expect(isValidCode("XX-7K4Q2")).toBe(false);
  });

  it("access keys are long and url-safe", () => {
    const k = generateAccessKey();
    expect(k).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });
});

describe("selection url encoding", () => {
  it("round-trips", () => {
    const sel = { version: "with-ornaments", colors: { main: "blush", accent: "#aa3366" }, fabric: "satin", options: ["sleeves-puff", "det-bow"], size: "L", qty: 2, neededBy: "2026-12-20", measurements: null, notes: "" };
    const p = encodeSelections(sel);
    const back = decodeSelections(new URLSearchParams(p.toString()), { ...sel, colors: { main: "x", accent: "y" }, options: [], qty: 1, measurements: null, neededBy: null });
    expect(back).toEqual(sel);
  });

  it("ignores malformed values", () => {
    const base = { version: null, colors: { main: "blush" }, fabric: "satin", options: [], size: "M", qty: 1, measurements: null, neededBy: null, notes: "" };
    const out = decodeSelections(new URLSearchParams("c=main.<script>,evil.red&q=999&n=tomorrow"), base);
    expect(out).toEqual(base);
  });
});

describe("whatsapp", () => {
  it("builds the design quote message", () => {
    const msg = buildMessage("design", {
      code: "NM-7K4Q2",
      designName: "Blush Leaf Tulle Gown",
      colours: [{ region: "Main", colour: "Blush" }],
      fabric: "Satin",
      options: ["Puff sleeves"],
      size: "I'll send my measurements: size M",
      qty: 1,
      neededBy: null,
      min: 18500,
      max: 18500,
      link: "https://example.com/d/NM-7K4Q2",
    });
    expect(msg).toContain("I'd like a quotation for design *NM-7K4Q2*.");
    expect(msg).toContain("Starting price: LKR 18,500");
    expect(msg).toContain("Measurements: I'll send my measurements: size M");
    expect(msg).toContain("Link: https://example.com/d/NM-7K4Q2");
  });

  it("encodes into a wa.me link", () => {
    const link = buildWhatsAppLink("enquiry", {}, { to: "+94 77 123 4567" });
    expect(link.startsWith("https://wa.me/94771234567?text=")).toBe(true);
    expect(decodeURIComponent(link.split("text=")[1])).toContain("Nool & Mal");
  });
});
