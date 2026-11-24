import { NextResponse } from "next/server";
import { readLocalFile, type Bucket } from "@/lib/server/storage";

const BUCKETS: Bucket[] = ["designs", "references", "slips"];

/** Local demo mode file server. Private buckets require a valid signed link. */
export async function GET(req: Request, ctx: RouteContext<"/api/files/[bucket]/[...path]">) {
  const { bucket, path } = await ctx.params;
  if (!BUCKETS.includes(bucket as Bucket)) return new NextResponse(null, { status: 404 });
  const url = new URL(req.url);
  const data = readLocalFile(bucket as Bucket, path.join("/"), url.searchParams.get("exp"), url.searchParams.get("sig"));
  if (!data) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "content-type": path.at(-1)?.endsWith(".png") ? "image/png" : "image/webp",
      "cache-control": bucket === "designs" ? "public, max-age=31536000, immutable" : "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
