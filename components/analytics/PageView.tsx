"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Counts one page view per route change (anonymous; uses the guest cookie server-side). */
export function PageView() {
  const path = usePathname();
  useEffect(() => {
    if (!path || /bot|crawler|spider|lighthouse/i.test(navigator.userAgent)) return;
    const body = JSON.stringify({ type: "page_view", path });
    if (!navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) {
      fetch("/api/events", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [path]);
  return null;
}
