import { NextResponse } from "next/server";
import { z } from "zod";
import { bookSlot, ServiceError } from "@/lib/server/orders";
import { orderForRequest } from "@/lib/server/order-access";
import { rateLimit } from "@/lib/server/rate-limit";

const body = z.object({ slotId: z.string().min(1).max(64), mode: z.enum(["studio", "home"]), address: z.string().trim().max(400).nullable() });

export async function POST(req: Request, ctx: RouteContext<"/api/orders/[code]/book">) {
  if (!(await rateLimit("book", 10, 600))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const r = await orderForRequest(req, (await ctx.params).code);
  if ("res" in r) return r.res;
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking" }, { status: 400 });
  try {
    await bookSlot(r.order, parsed.data.slotId, parsed.data.mode, parsed.data.address || null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ServiceError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
