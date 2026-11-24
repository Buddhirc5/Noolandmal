import "server-only";
import fs from "node:fs";
import path from "node:path";
import { env, useSupabase } from "./env";
import { supabaseAdmin } from "./db";
import { hmac, verifyHmac } from "./sign";

export type Bucket = "designs" | "references" | "slips";
export const PUBLIC_BUCKETS: Bucket[] = ["designs"];

const safe = (p: string) => p.replace(/\.\.+/g, "").replace(/^\/+/, "");
const localPath = (bucket: Bucket, p: string) => path.join(env.dataDir, "storage", bucket, safe(p));

export async function putFile(bucket: Bucket, p: string, data: Buffer, contentType: string): Promise<string> {
  if (useSupabase) {
    const { error } = await supabaseAdmin().storage.from(bucket).upload(p, data, { contentType, upsert: false });
    if (error) throw new Error(`upload: ${error.message}`);
    return p;
  }
  const file = localPath(bucket, p);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  return p;
}

export async function removeFile(bucket: Bucket, p: string) {
  if (useSupabase) {
    await supabaseAdmin().storage.from(bucket).remove([p]);
    return;
  }
  try {
    fs.unlinkSync(localPath(bucket, p));
  } catch {}
}

export function publicUrl(bucket: Bucket, p: string): string {
  if (useSupabase) return supabaseAdmin().storage.from(bucket).getPublicUrl(p).data.publicUrl;
  return `/api/files/${bucket}/${safe(p)}`;
}

/** Short-lived link to a private file (references, payment slips). */
export async function signedUrl(bucket: Bucket, p: string, seconds = 600): Promise<string> {
  if (useSupabase) {
    const { data, error } = await supabaseAdmin().storage.from(bucket).createSignedUrl(p, seconds);
    if (error || !data) throw new Error(`sign: ${error?.message}`);
    return data.signedUrl;
  }
  const exp = Math.floor(Date.now() / 1000) + seconds;
  const sig = hmac(`${bucket}/${safe(p)}:${exp}`);
  return `/api/files/${bucket}/${safe(p)}?exp=${exp}&sig=${sig}`;
}

/** Local mode only: read a file if the link is public or correctly signed. */
export function readLocalFile(bucket: Bucket, p: string, exp?: string | null, sig?: string | null): Buffer | null {
  if (useSupabase) return null;
  if (!PUBLIC_BUCKETS.includes(bucket)) {
    const e = Number(exp);
    if (!sig || !Number.isFinite(e) || e < Date.now() / 1000) return null;
    if (!verifyHmac(`${bucket}/${safe(p)}:${e}`, sig)) return null;
  }
  try {
    return fs.readFileSync(localPath(bucket, p));
  } catch {
    return null;
  }
}
