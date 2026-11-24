import "server-only";
import { headers } from "next/headers";

// Fixed-window in-memory limiter. Per server instance — good enough to stop
// casual abuse; swap for Upstash/Redis for multi-region production (DECISIONS.md).
const buckets = new Map<string, { count: number; reset: number }>();

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "local").trim();
}

export async function rateLimit(name: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = `${name}:${await clientIp()}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowSeconds * 1000 });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  b.count++;
  return b.count <= limit;
}
