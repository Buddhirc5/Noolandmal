import { NextResponse } from "next/server";
import { z } from "zod";
import { selectionsSchema } from "@/lib/selections";
import { createConfiguration, ServiceError } from "@/lib/server/orders";
import { getGuestId, getUser } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";

const body = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
  selections: selectionsSchema,
  clientTotal: z.number().finite().nonnegative(),
  name: z.string().trim().max(80).default(""),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+\d\s()-]*$/, "Phone number can only contain digits")
    .default(""),
});

export async function POST(req: Request) {
  if (!(await rateLimit("config", 20, 600))) return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  try {
    const user = await getUser();
    const { config } = await createConfiguration({ ...parsed.data, guestId: await getGuestId(), userId: user?.id ?? null });
    return NextResponse.json({ code: config.code, min: config.price_min, max: config.price_max, total: config.price_total }, { status: 201 });
  } catch (e) {
    if (e instanceof ServiceError) return NextResponse.json({ error: e.message, details: e.details }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Something went wrong saving your design." }, { status: 500 });
  }
}
