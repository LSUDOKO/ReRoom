"use client";
import clsx from "clsx";
import { Dices } from "lucide-react";
import { useState } from "react";
import { STYLES } from "@/lib/catalog";
import { applyStyle } from "@/lib/pipeline";
import { useStudio } from "@/lib/store";

export default function StyleBar() {
  const styleId = useStudio((s) => s.styleId);
  const restyling = useStudio((s) => s.items.filter((i) => i.pendingStyle).length);
  const [spinning, setSpinning] = useState<string | null>(null);

  const roulette = () => {
    if (spinning) return;
    const pool = STYLES.filter((s) => s.id !== styleId);
    const pickId = pool[Math.floor(Math.random() * pool.length)].id;
    // cycle through chips, slowing down, then land on the pick
    const order = [...STYLES, ...STYLES, ...STYLES].map((s) => s.id);
    const end = order.lastIndexOf(pickId);
    let i = Math.max(0, end - 16);
    const step = () => {
      setSpinning(order[i]);
      if (i >= end) {
        setTimeout(() => {
          setSpinning(null);
          applyStyle(pickId);
        }, 250);
        return;
      }
      i++;
      setTimeout(step, 50 + (16 - (end - i)) * 14);
    };
    step();
  };

  const active = spinning ?? styleId;
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] rounded-panel bg-white/95 p-1.5 shadow-[0_8px_30px_rgb(18_20_23/0.18)] backdrop-blur">
      <button
        onClick={() => applyStyle(null)}
        className={clsx("h-9 shrink-0 rounded-btn px-3 text-[13px] font-medium", !active ? "bg-ink text-white" : "text-slate hover:bg-paper hover:text-ink")}
      >
        Original
      </button>
      {STYLES.map((s) => (
        <button
          key={s.id}
          onClick={() => applyStyle(s.id)}
          title={`${s.name}: ${s.mood}`}
          className={clsx(
            "flex h-9 shrink-0 items-center gap-2 rounded-btn px-2.5 text-[13px] font-medium transition-colors",
            active === s.id ? "bg-ink text-white" : "text-ink hover:bg-paper",
          )}
        >
          <span className="flex -space-x-1" aria-hidden>
            {s.swatch.map((c) => (
              <span key={c} className="size-3.5 rounded-full ring-2 ring-white" style={{ background: c }} />
            ))}
          </span>
          {s.name}
        </button>
      ))}
      <button
        onClick={roulette}
        className="ml-1 flex h-9 shrink-0 items-center gap-1.5 rounded-btn bg-amber px-3 text-[13px] font-medium text-ink hover:brightness-95"
        aria-label="Style Roulette: pick a random style"
      >
        <Dices size={16} className={spinning ? "animate-spin" : ""} /> Roulette
      </button>
      {restyling > 0 && <span className="shimmer shrink-0 rounded-btn px-2 py-1 text-xs text-slate">Restyling {restyling}…</span>}
    </div>
  );
}
