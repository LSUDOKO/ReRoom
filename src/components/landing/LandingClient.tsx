"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MATERIAL_NAMES } from "@/landing/heroKeyframes";
import { useHero } from "@/landing/heroStore";

const ScrollHero = dynamic(() => import("./ScrollHero"), { ssr: false });

/** Mounts the 3D canvas after first paint so the static poster carries the LCP. */
export function HeroCanvas() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const start = () => setGo(true);
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(start, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(start, 400);
    return () => clearTimeout(id);
  }, []);
  return go ? <ScrollHero /> : null;
}

const SWATCH = ["#d9a227", "#8a4b26", "#d8cbb5", "#f4f1ea"];

/** Material chips for the styles section, synced both ways with the hero chair. */
export function MaterialChips() {
  const { chip, scrollMaterial, available, pick } = useHero();
  const active = Math.min(chip ?? scrollMaterial, available - 1);
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Chair material">
      {MATERIAL_NAMES.map((name, i) => (
        <button
          key={name}
          role="radio"
          aria-checked={active === i}
          disabled={i >= available}
          onClick={() => pick(i)}
          className={`glass glass--sm !min-h-11 !font-sans !text-sm !tracking-normal disabled:opacity-40 ${active === i ? "glass--blue" : ""}`}
        >
          <span className="size-4 rounded-full ring-1 ring-black/10" style={{ background: SWATCH[i] }} />
          {name}
        </button>
      ))}
    </div>
  );
}
