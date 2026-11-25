"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, ClipboardList, CreditCard, Gauge, History, Inbox, LayoutGrid, Palette, Plus, Users, Video, Wallet } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/requests", label: "Codes inbox", icon: Inbox },
  { href: "/admin/orders", label: "Orders board", icon: ClipboardList },
  { href: "/admin/orders/new", label: "New order", icon: Plus },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/finance", label: "Money & profit", icon: Wallet },
  { href: "/admin/payments", label: "Payment slips", icon: CreditCard },
  { href: "/admin/schedule", label: "Appointments", icon: CalendarDays },
  { href: "/admin/designs", label: "Designs", icon: LayoutGrid },
  { href: "/admin/catalog", label: "Catalog & prices", icon: Palette },
  { href: "/admin/creators", label: "Creators", icon: Video },
  { href: "/admin/audit", label: "Audit log", icon: History },
];

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(({ href, label, icon: Icon }) => {
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
