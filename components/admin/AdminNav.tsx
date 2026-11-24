"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, CreditCard, Gauge, History, Inbox, LayoutGrid, Palette, Users } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/requests", label: "Requests", icon: Inbox },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/schedule", label: "Measurements", icon: CalendarDays },
  { href: "/admin/designs", label: "Designs", icon: LayoutGrid },
  { href: "/admin/catalog", label: "Catalog & prices", icon: Palette },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/audit", label: "Audit log", icon: History },
];

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
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
