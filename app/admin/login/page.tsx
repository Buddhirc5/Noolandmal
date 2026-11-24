import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { SignInPanel } from "@/components/auth/SignInPanel";
import { accountsEnabled, getAdmin, getUser, localAdminLogin } from "@/lib/server/auth";
import { useSupabase } from "@/lib/server/env";
import { rateLimit } from "@/lib/server/rate-limit";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

async function login(formData: FormData) {
  "use server";
  if (!(await rateLimit("admin-login", 8, 600))) redirect("/admin/login?error=rate");
  const ok = await localAdminLogin(String(formData.get("password") ?? ""));
  redirect(ok ? "/admin" : "/admin/login?error=1");
}

export default async function AdminLogin({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const user = await getUser();
  const supabaseMode = useSupabase && accountsEnabled;
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ivory p-4">
      <div className="card w-full max-w-sm p-7">
        <Logo variant="horizontal" size={30} />
        <h1 className="mt-6 font-serif text-3xl font-semibold text-green-900">Studio admin</h1>
        {supabaseMode ? (
          <>
            {user && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-[#8a2f2a]">{user.email} isn&apos;t on the admin list. Ask the owner to add it to ADMIN_EMAILS.</p>}
            <p className="mt-2 mb-6 text-sm text-muted">Sign in with an email on the admin allowlist.</p>
            <SignInPanel next="/admin" />
          </>
        ) : (
          <form action={login} className="mt-6 space-y-3">
            <p className="text-sm text-muted">Local demo mode — sign in with ADMIN_PASSWORD{process.env.NODE_ENV !== "production" && !process.env.ADMIN_PASSWORD ? " (default: admin)" : ""}.</p>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
            {error && <p role="alert" className="text-sm text-danger">{error === "rate" ? "Too many attempts. Try again in 10 minutes." : "Incorrect password."}</p>}
            <button className="btn-primary w-full">Sign in</button>
          </form>
        )}
      </div>
    </div>
  );
}
