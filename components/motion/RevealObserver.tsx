"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer for the whole site: any element with [data-reveal] fades/slides in
 * when it enters the viewport. Children with [data-reveal-stagger] get increasing delays.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal-stagger]").forEach((parent) => {
        Array.from(parent.children).forEach((child, i) => {
          const el = child as HTMLElement;
          if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
          el.style.setProperty("--reveal-delay", `${Math.min(i, 8) * 80}ms`);
        });
      });
      // Every element still waiting to appear is (re)checked — including ones armed on an
      // earlier visit. Going "back" restores the previous page's DOM as it was, so armed
      // elements must be observed again or they would stay invisible.
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])").forEach((el) => {
        const r = el.getBoundingClientRect();
        // never hide what's already on screen — it would delay the first paint
        if (reduce || (r.top < window.innerHeight * 0.92 && r.bottom > 0)) {
          el.setAttribute("data-in", "");
          return;
        }
        el.setAttribute("data-armed", "");
        io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    // back/forward restores (browser cache or the router's kept page) and scroll restoration
    const rescan = () => requestAnimationFrame(scan);
    window.addEventListener("pageshow", rescan);
    window.addEventListener("popstate", rescan);
    const late = window.setTimeout(scan, 400);
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pageshow", rescan);
      window.removeEventListener("popstate", rescan);
      window.clearTimeout(late);
    };
  }, [pathname]);
  return null;
}
