import "server-only";

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  adminEmails: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  adminPassword: process.env.ADMIN_PASSWORD || "",
  sessionSecret: process.env.SESSION_SECRET || "",
  dataDir: process.env.DATA_DIR || (process.env.VERCEL ? "/tmp/noolmal-data" : ".data"),
  isProd: process.env.NODE_ENV === "production",
};

/** Supabase mode when URL + service key are present; otherwise local demo mode. */
export const useSupabase = Boolean(env.supabaseUrl && env.supabaseServiceKey);

export function sessionSecret(): string {
  if (env.sessionSecret) return env.sessionSecret;
  if (env.isProd && useSupabase) throw new Error("SESSION_SECRET must be set in production");
  return "dev-only-insecure-secret-change-me";
}
