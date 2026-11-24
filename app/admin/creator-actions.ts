"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/auth";
import { setCreatorStatus } from "@/lib/server/creators";
import { CREATOR_STATUSES, type CreatorStatus } from "@/lib/creator";

export async function updateCreatorStatus(formData: FormData) {
  const actor = await requireAdmin();
  const code = String(formData.get("code") ?? "");
  const status = String(formData.get("status") ?? "") as CreatorStatus;
  if (!/^NP-[A-Z0-9]{5}$/.test(code) || !CREATOR_STATUSES.includes(status)) return;
  await setCreatorStatus(code, status, actor);
  revalidatePath("/admin/creators");
}
