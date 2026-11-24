import "server-only";
import { NextResponse } from "next/server";
import { canAccess, getOrder } from "./orders";
import { getAdmin, getGuestId, getUser } from "./auth";
import { isValidCode, normalizeCode } from "@/lib/codes";
import type { Order } from "@/lib/types";

/** Resolves an order for a customer-facing API call, or returns an error response. */
export async function orderForRequest(req: Request, rawCode: string): Promise<{ order: Order } | { res: NextResponse }> {
  const code = normalizeCode(rawCode);
  if (!isValidCode(code)) return { res: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  const order = await getOrder(code);
  if (!order) return { res: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  const key = new URL(req.url).searchParams.get("k");
  const [guestId, user, admin] = await Promise.all([getGuestId(), getUser(), getAdmin()]);
  if (!canAccess(order, { key, guestId, userId: user?.id, admin })) return { res: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  return { order };
}
