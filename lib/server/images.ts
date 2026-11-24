import "server-only";
import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["jpeg", "png", "webp", "heif"]);

export class UploadError extends Error {}

/**
 * Validates an uploaded image by decoding it (not trusting the extension or
 * MIME type), applies EXIF orientation, downsizes and re-encodes to WebP.
 * Re-encoding with sharp drops all metadata, including GPS location.
 */
export async function processImage(file: File, maxEdge = 2000): Promise<{ data: Buffer; contentType: string; ext: string }> {
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`${file.name} is larger than 8 MB.`);
  const input = Buffer.from(await file.arrayBuffer());
  let meta;
  try {
    meta = await sharp(input).metadata();
  } catch {
    throw new UploadError(`${file.name} isn't a supported image.`);
  }
  if (!meta.format || !ALLOWED.has(meta.format)) throw new UploadError(`${file.name}: please upload JPG, PNG or WebP.`);
  const data = await sharp(input)
    .rotate()
    .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return { data, contentType: "image/webp", ext: "webp" };
}
