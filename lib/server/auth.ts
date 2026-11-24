import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env, useSupabase } from "./env";
import { readToken, signToken } from "./sign";
import { supabaseAuthClient } from "./supabase-auth";

export const GUEST_COOKIE = "nm_guest";
export const ADMIN_COOKIE = "nm_admin";
const GUEST_RE = /^[a-f0-9-]{36}$/;

export interface SessionUser {
  id: string;
  email: string;
}

export async function getGuestId(): Promise<string | null> {
  const v = (await cookies()).get(GUEST_COOKIE)?.value;
  return v && GUEST_RE.test(v) ? v : null;
}

export const accountsEnabled = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export async function getUser(): Promise<SessionUser | null> {
  if (!accountsEnabled) return null;
  try {
    const sb = await supabaseAuthClient();
    const { data } = await sb.auth.getUser();
    if (!data.user) return null;
    return { id: data.user.id, email: (data.user.email || "").toLowerCase() };
  } catch {
    return null;
  }
}

/** Returns the admin identity (email or "local-admin") or null. */
export async function getAdmin(): Promise<string | null> {
  if (useSupabase && accountsEnabled) {
    const u = await getUser();
    return u && env.adminEmails.includes(u.email) ? u.email : null;
  }
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return readToken(token) === "local-admin" ? "local-admin" : null;
}

export async function requireAdmin(): Promise<string> {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}

/** For route handlers: returns admin or null (caller responds 401). */
export async function adminOrNull() {
  return getAdmin();
}

export async function localAdminLogin(password: string): Promise<boolean> {
  if (useSupabase) return false;
  const expected = env.adminPassword || (env.isProd ? "" : "admin");
  if (!expected || password !== expected) return false;
  (await cookies()).set(ADMIN_COOKIE, signToken("local-admin", 60 * 60 * 12), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProd,
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return true;
}

export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
  if (accountsEnabled) {
    const sb = await supabaseAuthClient();
    await sb.auth.signOut();
  }
}
