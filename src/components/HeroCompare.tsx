"use client";
import Image from "next/image";
import { useState } from "react";

/** The landing hero: a real before/after from the ReRoom studio, same camera, draggable. */
export default function HeroCompare({ before, after, alt }: { before: string; after: string; alt: string }) {
  const [x, setX] = useState(42);
  return (
    <div className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-[20px] bg-ink shadow-[0_30px_80px_-20px_rgb(18_20_23/0.45)]">
      <Image src={after} alt={`${alt}, redesigned`} fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
        <Image src={before} alt={`${alt}, before`} fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white" style={{ left: `${x}%` }}>
        <div className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#121417" strokeWidth="2" aria-hidden>
            <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </div>
      </div>
      <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium">Before</span>
      <span className="absolute bottom-4 right-4 rounded-full bg-amber px-3 py-1 text-xs font-medium">Remixed in ReRoom</span>
      <input
        type="range"
        min={0}
        max={100}
        value={x}
        onChange={(e) => setX(Number(e.target.value))}
        aria-label="Drag to compare before and after"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
