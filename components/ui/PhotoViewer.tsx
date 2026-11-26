"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/format";

/* ─────────────────────────────────────────────────────────────────────────────
   SwipeGallery: the photo strip on a page. Swipe (or use the arrows) between
   photos; tap one to open the full-screen viewer.
   ───────────────────────────────────────────────────────────────────────────── */
export function SwipeGallery({
  images,
  alt,
  index,
  onIndex,
  className,
  aspect = "aspect-[4/5]",
  sizes = "(max-width: 1024px) 100vw, 55vw",
}: {
  images: string[];
  alt: string;
  index: number;
  onIndex: (i: number) => void;
  className?: string;
  aspect?: string;
  sizes?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const fromScroll = useRef(false);

  // follow the visible slide as the customer swipes
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index && i >= 0 && i < images.length) {
      fromScroll.current = true;
      onIndex(i);
    }
  };

  // thumbnails / colour changes move the strip
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (fromScroll.current) {
      fromScroll.current = false;
      return;
    }
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }, [index]);

  // a new photo set (colour / version change) starts at the first photo
  useEffect(() => {
    track.current?.scrollTo({ left: 0 });
  }, [images]);

  const go = (d: number) => onIndex(Math.max(0, Math.min(images.length - 1, index + d)));

  return (
    <div className={cn("group/sg relative", className)}>
      <div
        ref={track}
        onScroll={onScroll}
        className={cn("flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-[32px] bg-surface [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", aspect)}
        aria-roledescription="carousel"
        aria-label={`${alt} photos`}
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpen(i)}
            className={cn("relative h-full w-full shrink-0 snap-center snap-always cursor-zoom-in", aspect)}
            aria-label={`Open photo ${i + 1} of ${images.length} full screen`}
          >
            <Image src={src} alt={`${alt}, photo ${i + 1} of ${images.length}`} fill priority={i === 0} loading={i === 0 ? undefined : "lazy"} quality={70} sizes={sizes} className="object-cover" />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden>
            {images.map((src, i) => (
              <span key={src} className={cn("h-1.5 rounded-full bg-white shadow-[0_0_4px_rgb(0_0_0/0.35)] transition-all duration-300", i === index ? "w-5" : "w-1.5 opacity-60")} />
            ))}
          </div>
          <span className="pointer-events-none absolute top-4 right-4 rounded-full bg-black/45 px-2.5 py-1 text-[12px] font-medium text-white tabular-nums backdrop-blur" aria-live="polite">
            {index + 1} / {images.length}
          </span>
          <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous photo" className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink opacity-0 shadow transition-opacity group-hover/sg:opacity-100 disabled:!opacity-0 lg:flex">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button type="button" onClick={() => go(1)} disabled={index === images.length - 1} aria-label="Next photo" className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink opacity-0 shadow transition-opacity group-hover/sg:opacity-100 disabled:!opacity-0 lg:flex">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </>
      )}

      {open !== null && (
        <Lightbox
          images={images}
          alt={alt}
          start={open}
          onClose={(last) => {
            setOpen(null);
            onIndex(last);
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Lightbox: full-screen photos. Swipe between them; pinch or double-tap to
   zoom; drag to look around while zoomed.
   ───────────────────────────────────────────────────────────────────────────── */
export function Lightbox({ images, alt, start, onClose }: { images: string[]; alt: string; start: number; onClose: (last: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);
  const [zoomed, setZoomed] = useState(false);
  const indexRef = useRef(start);
  indexRef.current = index;

  const close = useCallback(() => onClose(indexRef.current), [onClose]);
  const go = useCallback(
    (d: number) => {
      const el = track.current;
      if (!el) return;
      const i = Math.max(0, Math.min(images.length - 1, indexRef.current + d));
      el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    },
    [images.length],
  );

  useEffect(() => {
    const el = track.current;
    if (el) el.scrollLeft = start * el.clientWidth;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [start, close, go]);

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col bg-black text-white" role="dialog" aria-modal="true" aria-label={`${alt} photos`}>
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
        <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] tabular-nums" aria-live="polite">
          {index + 1} / {images.length}
        </span>
        <button type="button" onClick={close} className="flex size-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close">
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div
        ref={track}
        onScroll={() => {
          const el = track.current;
          if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className={cn("flex h-full w-full snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", zoomed ? "overflow-hidden" : "overflow-x-auto")}
      >
        {images.map((src, i) => (
          <ZoomSlide key={src} src={src} alt={`${alt}, photo ${i + 1} of ${images.length}`} active={i === index} near={Math.abs(i - index) <= 1} onZoom={setZoomed} />
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous photo" className="absolute top-1/2 left-4 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-0 md:flex">
            <ChevronLeft className="size-6" aria-hidden />
          </button>
          <button type="button" onClick={() => go(1)} disabled={index === images.length - 1} aria-label="Next photo" className="absolute top-1/2 right-4 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-0 md:flex">
            <ChevronRight className="size-6" aria-hidden />
          </button>
        </>
      )}
      <p className={cn("pointer-events-none absolute inset-x-0 bottom-[max(env(safe-area-inset-bottom),16px)] text-center text-[12px] text-white/60 transition-opacity", zoomed && "opacity-0")}>Pinch or double-tap to zoom</p>
    </div>,
    document.body,
  );
}

const MAX = 4;

function ZoomSlide({ src, alt, active, near, onZoom }: { src: string; alt: string; active: boolean; near: boolean; onZoom: (z: boolean) => void }) {
  const [loaded, setLoaded] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });
  const [animate, setAnimate] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; s: number; x: number; y: number; cx: number; cy: number } | null>(null);
  const pan = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const lastTap = useRef(0);

  // leaving a slide resets its zoom
  useEffect(() => {
    if (!active) setT({ s: 1, x: 0, y: 0 });
  }, [active]);
  useEffect(() => {
    if (active) onZoom(t.s > 1.01);
  }, [t.s, active, onZoom]);

  /** keep the photo covering the screen while zoomed */
  const clamp = (s: number, x: number, y: number) => {
    const el = box.current;
    if (!el || s <= 1) return { s: Math.max(1, s), x: 0, y: 0 };
    const mx = (el.clientWidth * (s - 1)) / 2;
    const my = (el.clientHeight * (s - 1)) / 2;
    return { s, x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) };
  };
  /** zoom to `s` keeping the point (px, py) — relative to the centre — still */
  const zoomAt = (s: number, px: number, py: number, from = t) => clamp(s, px - ((px - from.x) * s) / from.s, py - ((py - from.y) * s) / from.s);
  const rel = (cx: number, cy: number) => {
    const r = box.current!.getBoundingClientRect();
    return { px: cx - r.left - r.width / 2, py: cy - r.top - r.height / 2 };
  };

  const onDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setAnimate(false);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const c = rel((a.x + b.x) / 2, (a.y + b.y) / 2);
      gesture.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), s: t.s, x: t.x, y: t.y, cx: c.px, cy: c.py };
      pan.current = null;
    } else if (pointers.current.size === 1 && t.s > 1) {
      pan.current = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y };
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (g && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const s = Math.max(1, Math.min(MAX, (g.s * Math.hypot(a.x - b.x, a.y - b.y)) / g.dist));
      setT(zoomAt(s, g.cx, g.cy, { s: g.s, x: g.x, y: g.y }));
    } else if (pan.current) {
      setT((cur) => clamp(cur.s, pan.current!.tx + e.clientX - pan.current!.x, pan.current!.ty + e.clientY - pan.current!.y));
    }
  };

  const onUp = (e: React.PointerEvent) => {
    const wasPinch = pointers.current.size >= 2;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
    if (pointers.current.size === 0) pan.current = null;
    if (wasPinch) return;
    // double tap / double click: zoom in on that spot, or back out
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setAnimate(true);
      const { px, py } = rel(e.clientX, e.clientY);
      setT(t.s > 1.01 ? { s: 1, x: 0, y: 0 } : zoomAt(2.5, px, py));
      lastTap.current = 0;
    } else lastTap.current = now;
  };

  return (
    <div
      ref={box}
      className="relative h-full w-full shrink-0 snap-center snap-always overflow-hidden select-none"
      style={{ touchAction: t.s > 1.01 ? "none" : "pan-x" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onWheel={(e) => {
        if (!e.ctrlKey && Math.abs(e.deltaY) < 40) return;
        const { px, py } = rel(e.clientX, e.clientY);
        setT(zoomAt(Math.max(1, Math.min(MAX, t.s * (e.deltaY < 0 ? 1.25 : 0.8))), px, py));
      }}
    >
      {!loaded && <span className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-white/25 border-t-white" aria-hidden />}
      <div className={cn("absolute inset-0", animate && "transition-transform duration-300 ease-out")} style={{ transform: `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.s})` }}>
        <Image src={src} alt={alt} fill sizes="100vw" quality={85} draggable={false} loading={near ? "eager" : "lazy"} onLoad={() => setLoaded(true)} className={cn("pointer-events-none object-contain transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")} />
      </div>
    </div>
  );
}
