import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/server/auth";
import { dbMode } from "@/lib/server/db";
import { db } from "@/lib/server/db";
import { logoutAction } from "../actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Nool & Mal" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [requests, slips] = await Promise.all([db.list("orders", { eq: { status: "quote_requested" } }), db.list("payments", { eq: { status: "pending" } })]);
  return (
    <div className="min-h-dvh bg-ivory lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-paper p-3 lg:sticky lg:top-0 lg:h-dvh lg:self-start lg:border-r lg:border-b-0 lg:p-4">
        <div className="mb-3 flex items-center justify-between lg:mb-6">
          <Link href="/admin" aria-label="Admin home">
            <Logo variant="horizontal" size={26} />
          </Link>
          <Link href="/" className="text-xs text-muted hover:text-green-900 lg:hidden">
            View site
          </Link>
        </div>
        <AdminNav badges={{ "/admin/requests": requests.length, "/admin/payments": slips.length }} />
        <div className="mt-6 hidden space-y-2 border-t border-line pt-4 text-xs text-muted lg:block">
          <p className="truncate">{admin}</p>
          <p>
            Data: <span className="badge">{dbMode === "local" ? "local demo store" : "Supabase"}</span>
          </p>
          <div className="flex gap-3">
            <Link href="/" className="hover:text-green-900">
              View site
            </Link>
            <form action={logoutAction}>
              <button className="hover:text-green-900">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 p-4 md:p-8">{children}</div>
    </div>
  );
}
