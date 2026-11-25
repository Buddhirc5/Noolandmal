// Shared by the desktop sidebar (client) and the phone "More" page (server).
import { BarChart3, CalendarDays, ClipboardList, CreditCard, FileText, Gauge, History, Inbox, LayoutGrid, Palette, Plus, Users, Video, Wallet } from "lucide-react";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/requests", label: "Orders inbox", icon: Inbox },
  { href: "/admin/orders", label: "Orders board", icon: ClipboardList },
  { href: "/admin/orders/new", label: "New order", icon: Plus },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/documents", label: "Quotes & invoices", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/finance", label: "Money & profit", icon: Wallet },
  { href: "/admin/payments", label: "Payment slips", icon: CreditCard },
  { href: "/admin/schedule", label: "Appointments", icon: CalendarDays },
  { href: "/admin/designs", label: "Designs", icon: LayoutGrid },
  { href: "/admin/catalog", label: "Catalog & prices", icon: Palette },
  { href: "/admin/creators", label: "Creators", icon: Video },
  { href: "/admin/audit", label: "Audit log", icon: History },
];
