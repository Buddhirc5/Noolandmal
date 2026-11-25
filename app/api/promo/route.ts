import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPromo } from "@/lib/server/promos";
import { rateLimit } from "@/lib/server/rate-limit";
import { parsePhone } from "@/lib/phone";

const body = z.object({ code: z.string().max(30), phone: z.string().max(24).optional() });

/** Checks a discount or referral code before the customer saves their design. */
export async function POST(req: Request) {
  if (!(await rateLimit("promo", 20, 600))) return NextResponse.json({ ok: false, error: "Too many tries. Please wait a few minutes." }, { status: 429 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Enter a code." }, { status: 400 });
  const p = parsed.data.phone ? parsePhone(parsed.data.phone) : null;
  const r = await checkPromo(parsed.data.code, p?.ok ? p.e164 : null);
  // never reveal who owns a referral code
  return NextResponse.json(r.ok ? { ok: true, code: r.code, kind: r.kind, label: r.label } : r, { status: r.ok ? 200 : 404 });
}
