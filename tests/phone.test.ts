import { describe, expect, it } from "vitest";
import { parsePhone } from "@/lib/phone";
import { normalizePhone, phonesMatch } from "@/lib/format";

const ok = (s: string) => {
  const r = parsePhone(s);
  return r.ok ? r.e164 : null;
};

describe("Sri Lankan phone numbers", () => {
  it("accepts the ways people type a mobile", () => {
    for (const s of ["0771234567", "077 123 4567", "077-123-4567", "771234567", "+94771234567", "+94 77 123 4567", "94771234567", "0094771234567", " 0771234567 "]) {
      expect(ok(s), s).toBe("94771234567");
    }
  });
  it("accepts every mobile network prefix 070–078", () => {
    for (const p of ["70", "71", "72", "74", "75", "76", "77", "78"]) expect(ok(`0${p}1234567`), p).toBe(`94${p}1234567`);
  });
  it("formats for display", () => {
    const r = parsePhone("0771234567");
    expect(r.ok && r.display).toBe("+94 77 123 4567");
  });
  it("rejects wrong lengths with a helpful message", () => {
    expect(parsePhone("077123456")).toMatchObject({ ok: false, error: expect.stringMatching(/too short/) });
    expect(parsePhone("07712345678")).toMatchObject({ ok: false, error: expect.stringMatching(/too long/) });
    expect(parsePhone("077123")).toMatchObject({ ok: false });
    expect(parsePhone("")).toMatchObject({ ok: false });
  });
  it("rejects landlines and non-mobile prefixes", () => {
    expect(parsePhone("0112345678")).toMatchObject({ ok: false, error: expect.stringMatching(/starts with 07/) });
    expect(parsePhone("0791234567")).toMatchObject({ ok: false, error: expect.stringMatching(/070–078/) });
  });
  it("rejects letters", () => {
    expect(parsePhone("077-ABC-4567")).toMatchObject({ ok: false, error: expect.stringMatching(/digits/) });
  });
  it("accepts overseas numbers only with + and a country code", () => {
    expect(ok("+44 7700 900123")).toBe("447700900123");
    expect(ok("+1 415 555 0100")).toBe("14155550100");
    expect(ok("447700900123")).toBeNull();
  });
  it("normalisePhone and phonesMatch agree with the parser", () => {
    expect(normalizePhone("077 123 4567")).toBe("94771234567");
    expect(normalizePhone("+44 7700 900123")).toBe("447700900123");
    expect(phonesMatch("0771234567", "+94 77 123 4567")).toBe(true);
  });
});
