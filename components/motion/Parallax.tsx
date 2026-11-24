"use client";
import { useEffect, useRef } from "react";

/**
 * Moves its children slower than the page while scrolling (speed 0.3 = 30% of scroll),
 * optionally fading them out — used to let the white sheet glide over the hero.
 */
export function Parallax({ children, speed = 0.3, fade = 0, mode = "exit", className }: { children: React.ReactNode; speed?: number; fade?: number; mode?: "exit" | "center"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.parentElement?.getBoundingClientRect() ?? el.getBoundingClientRect();
      if (mode === "center") {
        // shift relative to how far the block is from the middle of the screen
        const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = `translate3d(0, ${offset * speed}px, 0)`;
        return;
      }
      const scrolled = Math.max(0, -rect.top);
      const p = Math.min(1, scrolled / Math.max(1, rect.height));
      el.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
      if (fade) el.style.opacity = String(Math.max(0, 1 - p * fade));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, fade, mode]);
  return (
    <div ref={ref} className={`will-change-transform ${className ?? ""}`}>
      {children}
    </div>
  );
}
