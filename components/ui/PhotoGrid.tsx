"use client";
import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "./PhotoViewer";
import { cn } from "@/lib/format";

/** Gallery-page photo grid: tap any photo to open it full screen (swipe + pinch zoom). */
export function PhotoGrid({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [first, ...rest] = images;
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={() => setOpen(0)} className="relative col-span-2 aspect-[4/5] cursor-zoom-in overflow-hidden rounded-[32px] bg-surface sm:aspect-[3/4]" aria-label={`Open photo 1 of ${images.length} full screen`}>
        <Image src={first} alt={`${alt} — photo 1`} fill priority sizes="(max-width: 1024px) 100vw, 60vw" quality={75} className="object-cover object-top" />
      </button>
      {rest.map((src, i) => (
        <button
          key={src}
          type="button"
          onClick={() => setOpen(i + 1)}
          className={cn("relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-[24px] bg-surface", rest.length % 2 === 1 && i === rest.length - 1 && "col-span-2 aspect-[4/5]")}
          aria-label={`Open photo ${i + 2} of ${images.length} full screen`}
        >
          <Image src={src} alt={`${alt} — photo ${i + 2}`} fill sizes="(max-width: 1024px) 50vw, 30vw" quality={70} className="object-cover object-top" />
        </button>
      ))}
      {open !== null && <Lightbox images={images} alt={alt} start={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
