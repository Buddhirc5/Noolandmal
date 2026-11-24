import { NextResponse } from "next/server";
import { customRequestSchema, MAX_PHOTOS } from "@/lib/custom-request";
import { createCustomRequest, ServiceError } from "@/lib/server/orders";
import { UploadError } from "@/lib/server/images";
import { getGuestId, getUser } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";

export async function POST(req: Request) {
  if (!(await rateLimit("custom", 6, 600))) return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try smaller photos." }, { status: 400 });
  }
  const fields = Object.fromEntries(["name", "phone", "occasion", "neededBy", "budget", "referenceUrl", "notes", "sizeNotes"].map((k) => [k, (form.get(k) as string | null) ?? undefined]));
  const parsed = customRequestSchema.safeParse(fields);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_PHOTOS) return NextResponse.json({ error: `Up to ${MAX_PHOTOS} photos please.` }, { status: 400 });
  const v = parsed.data;
  if (!v.referenceUrl && !files.length && !v.notes) return NextResponse.json({ error: "Add a link, a photo or a description." }, { status: 400 });
  try {
    const user = await getUser();
    const { order, fileCount } = await createCustomRequest({
      name: v.name,
      phone: v.phone,
      occasion: v.occasion,
      neededBy: v.neededBy || null,
      budget: v.budget || null,
      referenceUrl: v.referenceUrl || null,
      notes: v.notes ?? "",
      sizeNotes: v.sizeNotes ?? "",
      files,
      guestId: await getGuestId(),
      userId: user?.id ?? null,
    });
    return NextResponse.json({ code: order.code, path: `/r/${order.code}?k=${order.access_key}`, photoCount: fileCount }, { status: 201 });
  } catch (e) {
    if (e instanceof UploadError || e instanceof ServiceError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Something went wrong saving your request." }, { status: 500 });
  }
}
