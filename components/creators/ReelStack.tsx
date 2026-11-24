"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/format";

export interface Reel {
  label: string;
  caption: string;
  images: string[];
}

const STEP_MS = 2600;
// [x offset %, rotate deg, scale, z]
const SLOTS: [number, number, number, number][] = [
  [-72, -8, 0.84, 1],
  [0, 0, 1, 3],
  [72, 8, 0.84, 1],
];

/**
 * Three phone-sized "stories" built from real photos. Each frame steps through
 * its photos with a slow zoom and story-style progress bars, so it reads like
 * a short video without being one.
 */
export function ReelStack({ reels }: { reels: Reel[] }) {
  const [tick, setTick] = useState(0);
  const [motion, setMotion] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMotion(false);
      setOpen(true);
      return;
    }
    const t = setTimeout(() => setOpen(true), 200);
    const id = setInterval(() => setTick((n) => n + 1), STEP_MS);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, []);

  return (
    <div className="relative mx-auto h-[430px] w-full max-w-4xl sm:h-[560px]" aria-hidden>
      {reels.map((r, i) => {
        const [x, rot, scale, z] = SLOTS[i];
        const frame = motion ? (tick + i) % r.images.length : 0;
        const src = r.images[frame];
        return (
          <div
            key={r.label}
            className={cn(
              "absolute top-0 left-1/2 aspect-[9/16] h-[400px] overflow-hidden rounded-[30px] bg-ink shadow-[0_36px_70px_-30px_rgb(82_6_48/0.6)] ring-1 ring-black/10 transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] sm:h-[530px]",
              i !== 1 && "max-sm:opacity-90",
            )}
            style={{
              zIndex: z,
              transform: open ? `translateX(calc(-50% + ${x}%)) rotate(${rot}deg) scale(${scale})` : `translateX(-50%) translateY(30px) scale(0.9)`,
            }}
          >
            <Image key={src} src={src} alt="" fill sizes="(max-width: 640px) 230px, 300px" className={cn("object-cover object-top", motion && "animate-reel-zoom")} />
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
            <div className="absolute inset-x-3 top-3 flex gap-1">
              {r.images.map((_, j) => (
                <span key={j} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
                  {j < frame && <span className="absolute inset-0 bg-white" />}
                  {j === frame && <span key={tick} className={cn("absolute inset-0 origin-left bg-white", motion && "[animation:progress_2.6s_linear_both]")} />}
                </span>
              ))}
            </div>
            <div className="absolute top-7 left-3 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-pink text-[10px] font-semibold text-white ring-2 ring-white/70">NM</span>
              <span className="text-[12px] font-semibold text-white drop-shadow">{r.label}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pt-16 pb-4">
              <p className="accent text-[1.6rem] leading-none text-white">{r.caption}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
