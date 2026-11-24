import { NextResponse } from "next/server";
import { supabaseAuthClient } from "@/lib/server/supabase-auth";
import { db } from "@/lib/server/db";
import { getGuestId } from "@/lib/server/auth";

/** OAuth / magic-link landing: create the session, then attach this device's guest drafts to the account. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/account";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";
  if (code) {
    const sb = await supabaseAuthClient();
    const { data, error } = await sb.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const guestId = await getGuestId();
      if (guestId) {
        for (const table of ["configurations", "orders", "custom_requests"]) {
          await db.update(table, { guest_id: guestId, user_id: null }, { user_id: data.user.id });
        }
      }
      await db.insert("profiles", { id: data.user.id, email: data.user.email ?? "" }).catch(() => undefined);
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=1", url.origin));
}
