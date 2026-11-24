// Compact URL encoding of a customiser configuration so links are shareable:
// ?c=main.blush,accent.%23aa3366&f=satin&o=sleeves-puff,lace-trim&s=M&q=1&n=2026-12-20
import { z } from "zod";
import type { Selections } from "./types";
import { HEX_RE } from "./pricing";

const KEY = /^[a-z0-9-]{1,40}$/;

export const selectionsSchema = z.object({
  version: z.string().regex(KEY).nullable().default(null),
  colors: z.record(z.string().regex(KEY), z.string().refine((v) => KEY.test(v) || HEX_RE.test(v), "Invalid colour")),
  fabric: z.string().regex(KEY),
  options: z.array(z.string().regex(KEY)).max(40),
  size: z.string().regex(/^[A-Za-z0-9-]{1,12}$/),
  qty: z.number().int().min(1).max(50),
  neededBy: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  notes: z.string().max(1000),
});

export function encodeSelections(sel: Selections): URLSearchParams {
  const p = new URLSearchParams();
  if (sel.version) p.set("v", sel.version);
  p.set(
    "c",
    Object.entries(sel.colors)
      .map(([k, v]) => `${k}.${v}`)
      .join(","),
  );
  p.set("f", sel.fabric);
  if (sel.options.length) p.set("o", sel.options.join(","));
  p.set("s", sel.size);
  if (sel.qty !== 1) p.set("q", String(sel.qty));
  if (sel.neededBy) p.set("n", sel.neededBy);
  return p;
}

/** Merges URL params over a base selection; ignores anything malformed. */
export function decodeSelections(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  base: Selections,
): Selections {
  const get = (k: string): string | undefined => {
    if (params instanceof URLSearchParams) return params.get(k) ?? undefined;
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const out: Selections = { ...base, colors: { ...base.colors }, options: [...base.options] };
  const c = get("c");
  if (c) {
    for (const pair of c.split(",")) {
      const i = pair.indexOf(".");
      if (i < 1) continue;
      const k = pair.slice(0, i);
      const v = pair.slice(i + 1);
      if (k in out.colors && (KEY.test(v) || HEX_RE.test(v))) out.colors[k] = v;
    }
  }
  const v = get("v");
  if (v && KEY.test(v)) out.version = v;
  const f = get("f");
  if (f && KEY.test(f)) out.fabric = f;
  const o = get("o");
  if (o !== undefined) out.options = o.split(",").filter((x) => KEY.test(x));
  const s = get("s");
  if (s && /^[A-Za-z0-9-]{1,12}$/.test(s)) out.size = s;
  const q = Number(get("q"));
  if (Number.isInteger(q) && q >= 1 && q <= 50) out.qty = q;
  const n = get("n");
  if (n && /^\d{4}-\d{2}-\d{2}$/.test(n)) out.neededBy = n;
  return out;
}
