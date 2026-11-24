import { NextResponse } from "next/server";
import { ServiceError, submitSlip } from "@/lib/server/orders";
import { UploadError } from "@/lib/server/images";
import { orderForRequest } from "@/lib/server/order-access";
import { rateLimit } from "@/lib/server/rate-limit";

export async function POST(req: Request, ctx: RouteContext<"/api/orders/[code]/slip">) {
  if (!(await rateLimit("slip", 6, 600))) return NextResponse.json({ error: "Too many uploads. Please wait a few minutes." }, { status: 429 });
  const r = await orderForRequest(req, (await ctx.params).code);
  if ("res" in r) return r.res;
  const form = await req.formData().catch(() => null);
  const file = form?.get("slip");
  const type = form?.get("type") === "final" ? "final" : "advance";
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Choose a photo or screenshot of your slip." }, { status: 400 });
  try {
    await submitSlip(r.order, type, file);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    if (e instanceof ServiceError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof UploadError) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
