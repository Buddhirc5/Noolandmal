import { NextResponse } from "next/server";
import { z } from "zod";
import { logEvent } from "@/lib/server/orders";
import { getGuestId } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";

const schema = z.object({ type: z.string().regex(/^[a-z_]{3,40}$/), code: z.string().max(12).optional(), path: z.string().max(200).optional() });

/** Lightweight analytics beacon (e.g. WhatsApp enquiry clicks). */
export async function POST(req: Request) {
  if (!(await rateLimit("events", 120, 60))) return new NextResponse(null, { status: 429 });
  const body = await req.text();
  let parsed;
  try {
    parsed = schema.safeParse(JSON.parse(body));
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  await logEvent(parsed.data.type, parsed.data.code ?? null, await getGuestId(), { path: parsed.data.path });
  return new NextResponse(null, { status: 204 });
}
