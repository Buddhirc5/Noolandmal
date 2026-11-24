// Short human-friendly codes (NM-7K4Q2 / CR-3M9XA) and secret access keys.
// Alphabet excludes 0, O, 1 and I so codes can be read aloud and typed safely.
export const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const CODE_LENGTH = 5;
export type CodePrefix = "NM" | "CR";

function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n);
  globalThis.crypto.getRandomValues(b);
  return b;
}

/** Unbiased random code body (rejection sampling; 32 divides 256 so no bias anyway). */
export function generateCode(prefix: CodePrefix, rand: (n: number) => Uint8Array = randomBytes): string {
  const bytes = rand(CODE_LENGTH);
  let body = "";
  for (let i = 0; i < CODE_LENGTH; i++) body += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `${prefix}-${body}`;
}

const CODE_RE = new RegExp(`^(NM|CR)-[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

/** Uppercases, trims and tolerates a missing dash or stray spaces ("nm 7k4q2"). */
export function normalizeCode(input: string): string {
  const s = input.trim().toUpperCase().replace(/[\s_]+/g, "");
  return s.replace(/^(NM|CR)-?/, "$1-");
}

export function isValidCode(code: string, prefix?: CodePrefix): boolean {
  if (!CODE_RE.test(code)) return false;
  return prefix ? code.startsWith(prefix + "-") : true;
}

/** 128-bit URL-safe secret used in private links (/q/…?k=, /r/…?k=). */
export function generateAccessKey(): string {
  const b = randomBytes(16);
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
