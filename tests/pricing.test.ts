import { describe, expect, it } from "vitest";
import { computePrice, defaultSelections, toggleOption, validateSelections, conflictReason } from "@/lib/pricing";
import * as seed from "@/data/seed";
import type { Catalog } from "@/lib/types";

const catalog: Catalog = {
  palette: seed.palette,
  fabrics: seed.fabrics,
  groups: seed.addonGroups,
  options: seed.addonOptions,
  rules: seed.addonRules,
  sizes: seed.sizes,
  settings: seed.settings,
};
const design = seed.designs.find((d) => d.slug === "everyday-aline-cotton-frock")!;
const regions = seed.designRegions.filter((r) => r.design_id === design.id);
const today = new Date(2026, 10, 24); // 24 Nov 2026

describe("computePrice", () => {
  it("shows only the starting (base) price", () => {
    const sel = defaultSelections(design, regions, catalog);
    const p = computePrice(catalog, design, sel, today);
    expect(p.total).toBe(design.base_price);
    expect(p.min).toBe(p.total);
    expect(p.max).toBe(p.total);
    expect(p.lines).toHaveLength(1);
    expect(p.lines[0]).toMatchObject({ kind: "base", amount: design.base_price });
  });

  it("ignores fabric, details, measurements and colours — those are quoted on WhatsApp", () => {
    const sel = {
      ...defaultSelections(design, regions, catalog),
      fabric: "linen",
      options: ["lining-full"],
      size: "own",
      colors: { main: "#123456", accent: "ivory" },
    };
    expect(computePrice(catalog, design, sel, today).total).toBe(design.base_price);
  });

  it("multiplies by quantity", () => {
    const sel = { ...defaultSelections(design, regions, catalog), qty: 3 };
    expect(computePrice(catalog, design, sel, today).total).toBe(design.base_price * 3);
  });

  it("flags rush dates without adding a fee", () => {
    const base = defaultSelections(design, regions, catalog);
    const relaxed = computePrice(catalog, design, { ...base, neededBy: "2027-01-31" }, today);
    expect(relaxed.rush).toBe(false);
    const rushed = computePrice(catalog, design, { ...base, neededBy: "2026-11-29" }, today); // 5 days
    expect(rushed.rush).toBe(true);
    expect(rushed.tooSoon).toBe(false);
    expect(rushed.rushFee).toBe(0);
    expect(rushed.total).toBe(relaxed.total);
    const tooSoon = computePrice(catalog, design, { ...base, neededBy: "2026-11-26" }, today); // 2 days
    expect(tooSoon.tooSoon).toBe(true);
  });

  it("defaults to measuring at the studio", () => {
    expect(defaultSelections(design, regions, catalog).size).toBe("studio");
  });
});

describe("versions", () => {
  const withVersions = {
    ...design,
    versions: [
      { key: "with-ornaments", name: "With ornaments", price: 3500, images: ["/a.webp"] },
      { key: "simple", name: "Simple", price: -1000, images: ["/b.webp"] },
    ],
  };
  it("adds the version price to the estimate", () => {
    const base = defaultSelections(withVersions, regions, catalog);
    const plain = computePrice(catalog, withVersions, base, today);
    const ornate = computePrice(catalog, withVersions, { ...base, version: "with-ornaments" }, today);
    const simple = computePrice(catalog, withVersions, { ...base, version: "simple" }, today);
    expect(ornate.total - plain.total).toBe(3500);
    expect(simple.total - plain.total).toBe(-1000);
    expect(ornate.lines.find((l) => l.kind === "version")?.label).toBe("With ornaments");
  });
  it("rejects a version the design doesn't have", () => {
    const base = defaultSelections(withVersions, regions, catalog);
    expect(validateSelections(catalog, withVersions, regions, { ...base, version: "with-ornaments" }).ok).toBe(true);
    expect(validateSelections(catalog, withVersions, regions, { ...base, version: "nope" }).ok).toBe(false);
  });
});

describe("options & validation", () => {
  it("replaces the choice in single-select groups", () => {
    const next = toggleOption(catalog, ["sleeves-cap"], "sleeves-puff");
    expect(next).toEqual(["sleeves-puff"]);
  });

  it("blocks incompatible combinations with a reason", () => {
    expect(conflictReason("sleeves-long", ["neck-off-shoulder"], catalog.rules)).toMatch(/Off-shoulder/);
    expect(toggleOption(catalog, ["neck-off-shoulder"], "sleeves-long")).toEqual(["neck-off-shoulder"]);
  });

  it("accepts the default selection", () => {
    const sel = defaultSelections(design, regions, catalog);
    expect(validateSelections(catalog, design, regions, sel)).toEqual({ ok: true, errors: [] });
  });

  it("rejects unknown options, unavailable colours and conflicts", () => {
    const sel = defaultSelections(design, regions, catalog);
    const bad = validateSelections(catalog, design, regions, {
      ...sel,
      fabric: "linen",
      colors: { main: "rose-pink", accent: "ivory" }, // rose-pink not available in linen
      options: ["neck-off-shoulder", "sleeves-long", "not-real"],
    });
    expect(bad.ok).toBe(false);
    expect(bad.errors.join(" ")).toMatch(/Rose Pink isn't available in Linen/);
    expect(bad.errors.join(" ")).toMatch(/Unknown option/);
    expect(bad.errors.join(" ")).toMatch(/Off-shoulder/);
  });

  it("rejects options from groups the design doesn't offer", () => {
    const gown = seed.designs.find((d) => d.slug === "cocoa-tiered-maxi-skirt-set")!;
    const gRegions = seed.designRegions.filter((r) => r.design_id === gown.id);
    const sel = { ...defaultSelections(gown, gRegions, catalog), options: ["sleeves-puff"] };
    expect(validateSelections(catalog, gown, gRegions, sel).ok).toBe(false);
  });

  it("every seeded design validates with its defaults", () => {
    for (const d of seed.designs) {
      const r = seed.designRegions.filter((x) => x.design_id === d.id);
      const res = validateSelections(catalog, d, r, defaultSelections(d, r, catalog));
      expect(res.errors, d.slug).toEqual([]);
    }
  });
});
