import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { AdminNav, AdminTabBar } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/server/auth";
import { dbMode } from "@/lib/server/db";
import { db } from "@/lib/server/db";
import { logoutAction } from "../actions";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Nool & Mal" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [orders, slips] = await Promise.all([db.list<Order>("orders"), db.list("payments", { eq: { status: "pending" } })]);
  const notReceived = orders.filter((o) => o.kind !== "manual" && !o.received_at && o.status === "quote_requested").length;
  return (
    <div className="min-h-dvh bg-ivory lg:grid lg:grid-cols-[240px_1fr]">
      {/* phone: slim top bar; the tab bar is at the bottom */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-paper/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
        <Link href="/admin" aria-label="Admin home" className="flex h-14 items-center">
          <Logo variant="horizontal" size={24} />
        </Link>
        <Link href="/" className="text-[13px] text-muted">
          View site
        </Link>
      </header>
      <aside className="hidden border-r border-line bg-paper p-4 lg:sticky lg:top-0 lg:block lg:h-dvh lg:self-start lg:overflow-y-auto">
        <div className="mb-6">
          <Link href="/admin" aria-label="Admin home">
            <Logo variant="horizontal" size={26} />
          </Link>
        </div>
        <AdminNav badges={{ "/admin/requests": notReceived, "/admin/payments": slips.length }} />
        <div className="mt-6 space-y-2 border-t border-line pt-4 text-xs text-muted">
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
      <div className="min-w-0 px-4 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))] md:px-8 md:pt-8 lg:pb-10">{children}</div>
      <AdminTabBar badge={notReceived} />
    </div>
  );
}
