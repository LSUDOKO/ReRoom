"use client";
// Everything ReRoom generated with Aholo, browsable on the landing page. Thumbnails only; one
// model-viewer opens on demand, so the page never runs a second always-on 3D canvas.
import Script from "next/script";
import { useEffect, useState } from "react";
import manifest from "../../../content/manifest.json";
import library from "../../../content/library.json";
import rooms from "../../../content/rooms.json";

type Pick = { src: string; name: string; note: string };
const VARIANTS = manifest.variants as Record<string, Record<string, string>>;
const OPENS = new Set(manifest.urdf as string[]);
const HERO = [
  ["Velvet", "/site/hero/chair.glb", "Lux3D text-to-3D (G1), as generated"],
  ["Leather", "/site/hero/chair-leather.glb", "Lux3D material transfer"],
  ["Linen", "/site/hero/chair-linen.glb", "Lux3D material transfer"],
  ["Bouclé", "/site/hero/chair-boucle.glb", "Lux3D material transfer"],
  ["Parts", "/site/hero/chair-parts.glb", "Lux3D part split"],
] as const;
const TABS = ["Furniture", "Finishes", "Hero chair", "Rooms"] as const;

export function AssetGallery() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Furniture");
  const [open, setOpen] = useState<Pick | null>(null);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  const card = "group relative overflow-hidden rounded-[18px] bg-white text-left shadow-[inset_0_0_0_1px_rgba(5,7,18,.06)] transition-transform duration-500 hover:-translate-y-1";
  return (
    <div>
      <Script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js" strategy="lazyOnload" />
      <div role="tablist" aria-label="Asset type" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`mono-label rounded-full px-4 py-2.5 transition-colors ${tab === t ? "bg-ink text-white" : "bg-white text-slate shadow-[inset_0_0_0_1px_rgba(5,7,18,.08)] hover:text-ink"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Furniture" && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {library.map((l) => (
              <li key={l.id}>
                <button className={`${card} w-full`} onClick={() => setOpen({ src: `/library/${l.id}.glb`, name: l.name, note: l.prompt })}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/library/thumbs/${l.id}.webp`} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="block px-3 pb-3 pt-1">
                    <span className="block truncate text-sm font-medium">{l.name}</span>
                    <span className="mono-label text-[10px] text-mist">
                      {OPENS.has(l.id) ? "Opens · " : ""}
                      {VARIANTS[l.id] ? `${Object.keys(VARIANTS[l.id]).length} finishes` : l.category}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "Finishes" && (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(VARIANTS).map(([id, styles]) => {
              const l = library.find((x) => x.id === id);
              return (
                <li key={id} className="flex items-center gap-4 rounded-[18px] bg-white p-3 shadow-[inset_0_0_0_1px_rgba(5,7,18,.06)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/library/thumbs/${id}.webp`} alt="" loading="lazy" className="size-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{l?.name ?? id}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(styles).map(([style, src]) => (
                        <button
                          key={style}
                          onClick={() => setOpen({ src, name: `${l?.name} · ${style}`, note: "Lux3D material transfer from a style reference photo" })}
                          className="mono-label rounded-full bg-paper px-2.5 py-1.5 text-[10px] text-slate transition-colors hover:bg-blue hover:text-white"
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {tab === "Hero chair" && (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {HERO.map(([name, src, note]) => (
              <li key={name}>
                <button className={`${card} w-full`} onClick={() => setOpen({ src, name: `Hero chair · ${name}`, note })}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/site/hero/thumbs/${src.split("/").pop()!.replace(".glb", ".webp")}`}
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/site/hero/chair-poster.webp")}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full bg-paper object-contain p-3 transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="block px-3 pb-3">
                    <span className="block text-sm font-medium">{name}</span>
                    <span className="mono-label text-[10px] text-mist">{note}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "Rooms" && (
          <ul className="grid gap-4 md:grid-cols-3">
            {rooms
              .filter((r) => r.id !== "blank")
              .map((r) => (
                <li key={r.id} className={card}>
                  <a href={`/studio?room=${r.id}`} className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/rooms/${r.id}.jpg`} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="block p-4">
                      <span className="block font-medium">{r.name}</span>
                      <span className="mono-label text-[10px] text-mist">Aholo World SpatialGen · walk it in the studio</span>
                    </span>
                  </a>
                </li>
              ))}
          </ul>
        )}
      </div>

      {open && (
        <div role="dialog" aria-modal aria-label={open.name} className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-md" onClick={() => setOpen(null)}>
          <div className="glass-panel w-full max-w-3xl overflow-hidden bg-ink/80 text-paper" onClick={(e) => e.stopPropagation()}>
            <model-viewer
              src={open.src}
              alt={open.name}
              camera-controls
              auto-rotate
              shadow-intensity="1"
              environment-image="neutral"
              exposure="1.1"
              style={{ width: "100%", height: "min(60vh, 520px)", background: "radial-gradient(closest-side, #1b2a5c, #050712)" }}
            />
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-lg font-semibold tracking-tight">{open.name}</p>
                <p className="mt-1 text-sm font-light text-mist">{open.note}</p>
              </div>
              <button className="glass glass--sm shrink-0" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
