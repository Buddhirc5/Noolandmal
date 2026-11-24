import { NextResponse } from "next/server";
import { acceptQuote, ServiceError } from "@/lib/server/orders";
import { orderForRequest } from "@/lib/server/order-access";
import { rateLimit } from "@/lib/server/rate-limit";

export async function POST(req: Request, ctx: RouteContext<"/api/orders/[code]/accept">) {
  if (!(await rateLimit("accept", 20, 600))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const r = await orderForRequest(req, (await ctx.params).code);
  if ("res" in r) return r.res;
  try {
    await acceptQuote(r.order);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ServiceError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
