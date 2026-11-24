import { NextResponse } from "next/server";
import { creatorSchema } from "@/lib/creator";
import { createCreatorApplication } from "@/lib/server/creators";
import { rateLimit } from "@/lib/server/rate-limit";

export async function POST(req: Request) {
  if (!(await rateLimit("creator", 5, 600))) return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  const parsed = creatorSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  try {
    const app = await createCreatorApplication(parsed.data);
    return NextResponse.json({ code: app.code }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong sending your application." }, { status: 500 });
  }
}
