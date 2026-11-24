import { NextResponse } from "next/server";
import { canAccess, getOrder, markWhatsAppClicked } from "@/lib/server/orders";
import { getGuestId, getUser } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { isValidCode, normalizeCode } from "@/lib/codes";

/** Records that the customer opened WhatsApp for this code (status → quote requested). */
export async function POST(req: Request, ctx: RouteContext<"/api/orders/[code]/whatsapp">) {
  if (!(await rateLimit("wa", 30, 600))) return new NextResponse(null, { status: 429 });
  const code = normalizeCode((await ctx.params).code);
  if (!isValidCode(code)) return new NextResponse(null, { status: 404 });
  const order = await getOrder(code);
  if (!order) return new NextResponse(null, { status: 404 });
  const key = new URL(req.url).searchParams.get("k");
  const guestId = await getGuestId();
  const user = await getUser();
  if (!canAccess(order, { key, guestId, userId: user?.id })) return new NextResponse(null, { status: 403 });
  await markWhatsAppClicked(code, guestId, order.kind);
  return new NextResponse(null, { status: 204 });
}
