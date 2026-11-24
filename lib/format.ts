export function lkr(n: number): string {
  return "LKR " + Math.round(n).toLocaleString("en-LK");
}

export function lkrRange(min: number, max: number): string {
  return `LKR ${Math.round(min).toLocaleString("en-LK")} – ${Math.round(max).toLocaleString("en-LK")}`;
}

export function formatDate(iso: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso.length === 10 ? iso + "T00:00:00" : iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { timeZone: "Asia/Colombo", ...opts });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Colombo",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Normalises Sri Lankan phone numbers to E.164 digits (94XXXXXXXXX). */
export function normalizePhone(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0") && d.length === 10) d = "94" + d.slice(1);
  if (d.length === 9) d = "94" + d;
  return d;
}

export function phonesMatch(a: string, b: string): boolean {
  const x = normalizePhone(a);
  const y = normalizePhone(b);
  return x.length >= 9 && y.length >= 9 && x.slice(-9) === y.slice(-9);
}

export function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}
