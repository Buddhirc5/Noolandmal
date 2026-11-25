import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ADMIN_LINKS } from "@/components/admin/links";
import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/server/auth";

export const metadata = { title: "More" };

export default async function More() {
  const admin = await requireAdmin();
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">More</h1>
      <nav className="card divide-y divide-line overflow-hidden p-0">
        {ADMIN_LINKS.filter((l) => l.href !== "/admin").map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-h-14 items-center gap-3 px-4 text-[16px] active:bg-surface-2">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-surface text-ink">
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <span className="flex-1">{label}</span>
            <ChevronRight className="size-4 text-muted" aria-hidden />
          </Link>
        ))}
      </nav>
      <div className="card flex items-center justify-between p-4 text-sm">
        <span className="truncate text-muted">{admin}</span>
        <form action={logoutAction}>
          <button className="btn-secondary h-10">Sign out</button>
        </form>
      </div>
    </div>
  );
}
