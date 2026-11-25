import { describe, expect, it } from "vitest";
import { normalizeCode, promoDiscount, CODE_RE } from "@/lib/promo";

describe("promo codes", () => {
  it("normalises what people type", () => {
    expect(normalizeCode(" homecoming 10 ")).toBe("HOMECOMING10");
    expect(CODE_RE.test("HOMECOMING10")).toBe(true);
    expect(CODE_RE.test("A!")).toBe(false);
  });
  it("percent codes round to the nearest 100", () => {
    expect(promoDiscount({ type: "percent", value: 10, minTotal: 0 }, 18_500)).toBe(1_900); // 1,850 rounds up
    expect(promoDiscount({ type: "percent", value: 15, minTotal: 0 }, 21_500)).toBe(3_200);
  });
  it("fixed codes never exceed the subtotal", () => {
    expect(promoDiscount({ type: "fixed", value: 1_000, minTotal: 0 }, 14_000)).toBe(1_000);
    expect(promoDiscount({ type: "fixed", value: 5_000, minTotal: 0 }, 3_000)).toBe(3_000);
  });
  it("respects the minimum order", () => {
    expect(promoDiscount({ type: "percent", value: 10, minTotal: 20_000 }, 18_500)).toBe(0);
    expect(promoDiscount({ type: "percent", value: 10, minTotal: 20_000 }, 25_000)).toBe(2_500);
  });
});
