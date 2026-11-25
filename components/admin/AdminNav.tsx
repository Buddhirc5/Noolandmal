"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Inbox, Menu, Plus, Wallet } from "lucide-react";
import { ADMIN_LINKS } from "./links";

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ADMIN_LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === "/admin" : href === "/admin/orders" ? path.startsWith(href) && !path.startsWith("/admin/orders/new") : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm whitespace-nowrap transition-colors ${active ? "bg-green-900 text-white" : "text-ink/80 hover:bg-green-50"}`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
            {badges[href] ? <span className={`ml-auto rounded-full px-2 text-xs ${active ? "bg-white/20" : "bg-rose text-white"}`}>{badges[href]}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

const TABS = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/requests", label: "Orders", icon: Inbox },
  { href: "/admin/orders/new", label: "New", icon: Plus },
  { href: "/admin/finance", label: "Money", icon: Wallet },
  { href: "/admin/more", label: "More", icon: Menu },
];

/** Phone tab bar (hidden on desktop, where the sidebar shows). */
export function AdminTabBar({ badge }: { badge: number }) {
  const path = usePathname();
  const activeTab = (href: string) =>
    href === "/admin" ? path === "/admin" : href === "/admin/requests" ? path.startsWith("/admin/requests") || (path.startsWith("/admin/orders") && !path.startsWith("/admin/orders/new")) : path.startsWith(href);
  return (
    <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const on = activeTab(href);
          if (href === "/admin/orders/new")
            return (
              <Link key={href} href={href} aria-label="New order" className="flex flex-col items-center justify-center py-1.5">
                <span className="flex size-12 items-center justify-center rounded-full bg-pink text-white shadow-[0_8px_20px_-6px_rgb(206_17_125/0.6)]">
                  <Icon className="size-6" aria-hidden />
                </span>
              </Link>
            );
          return (
            <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`relative flex flex-col items-center gap-0.5 pt-2.5 pb-2 text-[11px] font-medium ${on ? "text-ink" : "text-muted"}`}>
              <Icon className="size-[22px]" strokeWidth={on ? 2.4 : 1.8} aria-hidden />
              {label}
              {href === "/admin/requests" && badge > 0 && <span className="absolute top-1.5 left-1/2 ml-2 min-w-5 rounded-full bg-pink px-1.5 text-center text-[10px] leading-5 text-white">{badge}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
