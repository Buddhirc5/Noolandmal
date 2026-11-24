import "server-only";
import { db } from "./db";
import { audit } from "./orders";
import { generateCode } from "@/lib/codes";
import { normalizePhone } from "@/lib/format";
import type { CreatorApplication, CreatorInput, CreatorStatus } from "@/lib/creator";

const TABLE = "creator_applications";

export async function createCreatorApplication(input: CreatorInput): Promise<CreatorApplication> {
  let code = generateCode("NP");
  for (let i = 0; i < 6 && (await db.get(TABLE, { code })); i++) code = generateCode("NP");
  return db.insert<CreatorApplication>(TABLE, {
    code,
    name: input.name,
    phone: normalizePhone(input.phone),
    email: input.email || null,
    platform: input.platform,
    followers: input.followers,
    handle: input.handle,
    design: input.design || null,
    video_url: input.videoUrl || null,
    notes: input.notes ?? "",
    status: "new",
  });
}

export function listCreatorApplications() {
  return db.list<CreatorApplication>(TABLE, { order: { column: "created_at", ascending: false } });
}

export async function setCreatorStatus(code: string, status: CreatorStatus, actor: string) {
  await db.update(TABLE, { code }, { status });
  await audit(actor, `creator.${status}`, "creator_application", code);
}
