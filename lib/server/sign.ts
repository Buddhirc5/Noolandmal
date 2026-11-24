import "server-only";
import crypto from "node:crypto";
import { sessionSecret } from "./env";

export function hmac(value: string): string {
  return crypto.createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function verifyHmac(value: string, sig: string): boolean {
  const expected = hmac(value);
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** "payload.expiry.signature" token */
export function signToken(payload: string, ttlSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  return `${payload}.${exp}.${hmac(`${payload}.${exp}`)}`;
}

export function readToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const sig = parts.pop()!;
  const exp = Number(parts.pop());
  const payload = parts.join(".");
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return null;
  return verifyHmac(`${payload}.${exp}`, sig) ? payload : null;
}
