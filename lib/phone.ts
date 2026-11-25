// One rule for every phone number on the site and in the admin.
// Sri Lankan mobiles are accepted however people type them (0771234567,
// 077 123 4567, 771234567, +94 77 123 4567) and stored as 94771234567.
// Numbers from other countries must start with + and the country code.
import { z } from "zod";

export type PhoneResult = { ok: true; e164: string; display: string } | { ok: false; error: string };

export const PHONE_HINT = "Sri Lankan mobile, e.g. 077 123 4567";
const SL_MOBILE = /^947[0-8]\d{7}$/;

export function parsePhone(input: string): PhoneResult {
  const raw = (input ?? "").trim();
  if (!raw) return { ok: false, error: "Enter your WhatsApp number" };
  if (/[^\d\s+().-]/.test(raw)) return { ok: false, error: "Use digits only, e.g. 077 123 4567" };
  const international = raw.startsWith("+") || raw.startsWith("00");
  let d = raw.replace(/\D/g, "");
  if (raw.startsWith("00")) d = d.slice(2);

  if (international && !d.startsWith("94")) {
    if (d.length < 8 || d.length > 15) return { ok: false, error: "Check the number — include the country code after +" };
    return { ok: true, e164: d, display: `+${d}` };
  }

  // Sri Lanka: 0XXXXXXXXX, XXXXXXXXX or 94XXXXXXXXX
  if (!international && d.startsWith("0")) d = "94" + d.slice(1);
  else if (!international && d.length === 9) d = "94" + d;
  if (!d.startsWith("94") || d.length !== 11) {
    const local = d.startsWith("94") ? d.length - 2 : d.replace(/^0/, "").length;
    return { ok: false, error: local < 9 ? "That number is too short — mobiles have 10 digits, e.g. 077 123 4567" : "That number is too long — mobiles have 10 digits, e.g. 077 123 4567" };
  }
  if (!SL_MOBILE.test(d))
    return {
      ok: false,
      error: d.startsWith("947") ? "Sri Lankan mobiles start with 070–078 — please check the number" : "Please use a mobile number — it starts with 07, e.g. 077 123 4567",
    };
  return { ok: true, e164: d, display: `+94 ${d.slice(2, 4)} ${d.slice(4, 7)} ${d.slice(7)}` };
}

/** Required phone field for zod schemas (keeps what was typed; normalise on save). */
export const phoneField = (message?: string) =>
  z
    .string()
    .trim()
    .max(24)
    .superRefine((v, ctx) => {
      const r = parsePhone(v);
      if (!r.ok) ctx.addIssue({ code: "custom", message: v ? r.error : (message ?? r.error) });
    });

/** Optional phone field: empty is fine, anything typed must be valid. */
export const optionalPhoneField = () =>
  z
    .string()
    .trim()
    .max(24)
    .superRefine((v, ctx) => {
      if (!v) return;
      const r = parsePhone(v);
      if (!r.ok) ctx.addIssue({ code: "custom", message: r.error });
    });
