import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrder } from "@/lib/server/orders";
import { rateLimit } from "@/lib/server/rate-limit";
import { isValidCode, normalizeCode } from "@/lib/codes";
import { phonesMatch } from "@/lib/format";

const body = z.object({ code: z.string().max(12), phone: z.string().max(20) });

/** Code + phone lookup → private link. Same response for "no such code" and "wrong phone". */
export async function POST(req: Request) {
  if (!(await rateLimit("track", 10, 600))) return NextResponse.json({ error: "Too many attempts. Please wait 10 minutes." }, { status: 429 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your code and phone number." }, { status: 400 });
  const code = normalizeCode(parsed.data.code);
  const order = isValidCode(code) ? await getOrder(code) : null;
  if (!order || !order.customer_phone || !phonesMatch(order.customer_phone, parsed.data.phone)) {
    return NextResponse.json({ error: "We couldn't find an order with that code and phone number. Check both, or message us on WhatsApp." }, { status: 404 });
  }
  return NextResponse.json({ url: `/q/${order.code}?k=${order.access_key}` });
}
