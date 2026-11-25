"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/format";

type View = "small" | "large";
const KEY = "nm_grid_view";

/** Two-per-row small tiles (default) or large cards; remembered on this device. */
export function GridView({ count, children }: { count: number; children: React.ReactNode }) {
  const [view, setView] = useState<View>("small");
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "small" || v === "large") setView(v);
    } catch {}
  }, []);
  const choose = (v: View) => {
    setView(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
  };
  return (
    <>
      <div className="mt-8 flex items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {count} design{count === 1 ? "" : "s"}
        </p>
        <div className="flex rounded-full bg-surface p-1" role="radiogroup" aria-label="Layout">
          {(["small", "large"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={view === v}
              aria-label={v === "small" ? "Small tiles" : "Large cards"}
              onClick={() => choose(v)}
              className={cn("flex size-9 items-center justify-center rounded-full transition-colors", view === v ? "bg-ink text-white" : "text-ink")}
            >
              {v === "small" ? (
                <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
                  <rect x="1" y="1" width="6" height="6" rx="1.5" />
                  <rect x="9" y="1" width="6" height="6" rx="1.5" />
                  <rect x="1" y="9" width="6" height="6" rx="1.5" />
                  <rect x="9" y="9" width="6" height="6" rx="1.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
                  <rect x="1" y="1" width="14" height="14" rx="2.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
      <div data-view={view} className={cn("group/tiles mt-4 grid", view === "small" ? "grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4" : "gap-5 sm:grid-cols-2 lg:grid-cols-3")}>
        {children}
      </div>
    </>
  );
}
