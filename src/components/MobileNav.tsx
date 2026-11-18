"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Phone-width menu for the floating nav: a glass sheet with the section links. */
export function MobileNav({ links }: { links: string[][] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);
  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 flex-col items-center justify-center gap-[5px] rounded-full text-paper hover:bg-white/[.07]"
      >
        <span className={`h-px w-4 bg-current transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`} />
        <span className={`h-px w-4 bg-current transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
      </button>
      {open && (
        <nav
          aria-label="Sections"
          className="rise absolute inset-x-0 top-[calc(100%+8px)] mx-auto w-[min(1180px,calc(100%-24px))] rounded-[24px] bg-ink/90 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.14),inset_0_0_0_1px_rgba(255,255,255,.08),0_30px_60px_-20px_rgba(5,7,18,.9)] backdrop-blur-xl"
        >
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="mono-label block rounded-2xl px-4 py-3.5 text-mist hover:bg-white/[.06] hover:text-white">
              {label}
            </Link>
          ))}
          <Link href="/scan" onClick={() => setOpen(false)} className="mono-label block rounded-2xl px-4 py-3.5 text-mist hover:bg-white/[.06] hover:text-white">
            Scan a room
          </Link>
        </nav>
      )}
    </div>
  );
}
