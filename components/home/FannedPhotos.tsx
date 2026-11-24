"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface FanItem {
  src: string;
  alt: string;
  href: string;
}

// [translateX %, rotate deg, scale, z, hidden on phones]
const SLOTS: [number, number, number, number, boolean][] = [
  [-118, -10, 0.78, 1, true],
  [-62, -6, 0.88, 2, false],
  [0, 0, 1, 5, false],
  [62, 6, 0.88, 2, false],
  [118, 10, 0.78, 1, true],
];

/** Rounded photo cards that start stacked and fan out once the page has loaded. */
export function FannedPhotos({ items }: { items: FanItem[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setOpen(true);
    const id = setTimeout(() => setOpen(true), 250);
    return () => clearTimeout(id);
  }, []);
  const offset = Math.floor((SLOTS.length - items.length) / 2);
  return (
    <div className="relative mx-auto h-[380px] w-full max-w-5xl sm:h-[520px]" aria-label="Featured designs">
      {items.map((it, i) => {
        const [x, rot, scale, z, mobileHidden] = SLOTS[i + offset];
        const t = open ? `translateX(calc(-50% + ${x}%)) rotate(${rot}deg) scale(${scale})` : `translateX(-50%) translateY(24px) rotate(${rot / 3}deg) scale(0.9)`;
        return (
          <Link
            key={it.src}
            href={it.href}
            className={`group absolute top-0 left-1/2 h-[340px] w-[240px] overflow-hidden rounded-[30px] bg-surface shadow-[0_30px_60px_-28px_rgb(10_10_10/0.5)] ring-1 ring-black/5 sm:h-[470px] sm:w-[330px] ${mobileHidden ? "hidden md:block" : ""}`}
            style={{
              transform: t,
              zIndex: z,
              opacity: open ? 1 : 0,
              transition: `transform 1100ms cubic-bezier(0.16, 1, 0.3, 1) ${Math.abs(i + offset - 2) * 90}ms, opacity 600ms ease ${Math.abs(i + offset - 2) * 90}ms`,
            }}
          >
            <Image src={it.src} alt={it.alt} fill priority={i + offset === 2} quality={70} sizes="(max-width: 640px) 240px, 330px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
          </Link>
        );
      })}
    </div>
  );
}
