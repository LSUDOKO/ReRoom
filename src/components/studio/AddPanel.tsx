"use client";
import clsx from "clsx";
import { Box, Camera, DoorOpen, ImagePlus, Search, Sparkles, Type } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import manifest from "../../../content/manifest.json";
import { CATEGORIES, guessCategory, LIBRARY, libraryAsset, type Category } from "@/lib/catalog";
import { photoToDataUrl } from "@/lib/api";
import { generate, libraryItem } from "@/lib/pipeline";
import { useStudio } from "@/lib/store";
import { dropPoint } from "@/lib/viewer/instance";
import { Button } from "../ui";

const IDEAS = [
  "a mustard velvet reading chair with walnut legs",
  "a tall rattan floor lamp with a paper shade",
  "a low oak bench with a woven seat",
  "a round travertine coffee table",
];

type Tab = "describe" | "photo" | "library";

export default function AddPanel() {
  const [tab, setTab] = useState<Tab>("library");
  const live = useStudio((s) => s.live);
  return (
    <aside className="flex h-full w-full flex-col bg-white">
      <div className="flex gap-1 border-b border-line p-2" role="tablist" aria-label="Add furniture">
        {(
          [
            ["library", "Library", <Box key="i" size={15} />],
            ["describe", "Describe", <Type key="i" size={15} />],
            ["photo", "Photo", <Camera key="i" size={15} />],
          ] as const
        ).map(([id, label, icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={clsx(
              "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-btn text-[13px] font-medium",
              tab === id ? "bg-paper text-ink" : "text-slate hover:text-ink",
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        {tab === "library" && <Library />}
        {tab === "describe" && (live ? <Describe /> : <Offline />)}
        {tab === "photo" && (live ? <Photo /> : <Offline />)}
      </div>
      <Queue />
    </aside>
  );
}

function Offline() {
  return (
    <div className="p-4 text-sm text-slate">
      Live generation is off in demo mode. Everything in the library works, and you can open and restyle any piece.
    </div>
  );
}

function Describe() {
  const [text, setText] = useState("");
  const [articulate, setArticulate] = useState(false);
  const cat = useMemo<Category>(() => guessCategory(text), [text]);
  const canOpen = ["storage", "appliance", "table", "bed", "decor"].includes(cat);
  const submit = () => {
    if (text.trim().length < 3) return;
    generate({ prompt: text.trim(), articulate: articulate && canOpen }, dropPoint());
    setText("");
  };
  return (
    <div className="space-y-3 p-4">
      <label htmlFor="prompt" className="block text-sm font-medium">
        Describe a piece of furniture
      </label>
      <textarea
        id="prompt"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && submit()}
        rows={4}
        maxLength={300}
        placeholder="A mustard velvet reading chair with wooden legs"
        className="w-full resize-none rounded-btn border border-line p-3 text-sm outline-none placeholder:text-mist focus:border-blue"
      />
      <div className="flex items-center justify-between text-xs text-slate">
        <span>
          Looks like: <b className="font-medium text-ink">{CATEGORIES.find((c) => c.id === cat)?.label}</b>
        </span>
        <span>{text.length}/300</span>
      </div>
      <label className={clsx("flex items-start gap-2 text-sm", !canOpen && "opacity-50")}>
        <input type="checkbox" className="mt-0.5 accent-blue" checked={articulate && canOpen} disabled={!canOpen} onChange={(e) => setArticulate(e.target.checked)} />
        <span>
          Make it open
          <span className="block text-xs text-slate">Doors swing and drawers slide (Lux3D articulation, adds about a minute).</span>
        </span>
      </label>
      <Button variant="magic" className="w-full" onClick={submit} disabled={text.trim().length < 3}>
        <Sparkles size={16} /> Generate
      </Button>
      <div className="pt-2">
        <div className="mb-2 text-xs text-slate">Try one of these</div>
        <div className="flex flex-wrap gap-1.5">
          {IDEAS.map((i) => (
            <button key={i} onClick={() => setText(i)} className="rounded-full border border-line px-2.5 py-1 text-left text-xs text-slate hover:border-ink hover:text-ink">
              {i}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Photo() {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const onFile = async (f?: File) => {
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return useStudio.getState().notify("Use a PNG, JPG or WebP photo.", "error");
    setPreview(await photoToDataUrl(f));
  };
  return (
    <div className="space-y-3 p-4">
      <p className="text-sm text-slate">Snap or upload a product photo. Lux3D rebuilds it in 3D at real size.</p>
      <button
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => (e.preventDefault(), onFile(e.dataTransfer.files[0]))}
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-panel border border-dashed border-line bg-paper text-sm text-slate hover:border-blue"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Selected product photo" className="h-full w-full object-contain" />
        ) : (
          <>
            <ImagePlus size={22} />
            Drop a photo or click to choose
          </>
        )}
      </button>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name it (e.g. Rattan lamp)"
        className="h-10 w-full rounded-btn border border-line px-3 text-sm outline-none focus:border-blue"
      />
      <p className="text-xs text-slate">Photos are resized and stripped of location data before upload. Don&apos;t upload photos of people.</p>
      <Button
        variant="magic"
        className="w-full"
        disabled={!preview}
        onClick={() => {
          generate({ image: preview!, name: name.trim() || "Photo item", category: guessCategory(name) }, dropPoint());
          setPreview(null);
          setName("");
        }}
      >
        <Sparkles size={16} /> Build it in 3D
      </Button>
    </div>
  );
}

const available = new Set<string>(manifest.glb as string[]);
const articulated = new Set<string>(manifest.urdf as string[]);
const thumbs = new Set<string>(manifest.thumbs as string[]);

function Library() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const list = LIBRARY.filter(
    (i) => available.has(i.id) && (cat === "all" || i.category === cat) && (!q || `${i.name} ${i.prompt}`.toLowerCase().includes(q.toLowerCase())),
  );
  const cats = CATEGORIES.filter((c) => LIBRARY.some((i) => i.category === c.id && available.has(i.id)));
  const add = (id: string) => {
    const lib = LIBRARY.find((i) => i.id === id)!;
    const it = libraryItem(lib, dropPoint(), articulated.has(id));
    useStudio.getState().commit((items) => [...items, it]);
    useStudio.getState().select(it.uid);
  };
  return (
    <div className="p-3">
      <div className="relative mb-2">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search furniture"
          aria-label="Search furniture"
          className="h-9 w-full rounded-btn border border-line pl-9 pr-3 text-sm outline-none focus:border-blue"
        />
      </div>
      <div className="mb-3 flex flex-wrap gap-1">
        {[{ id: "all" as const, label: "All" }, ...cats].map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={clsx("rounded-full px-2.5 py-1 text-xs", cat === c.id ? "bg-ink text-white" : "bg-paper text-slate hover:text-ink")}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {list.map((i) => (
          <button
            key={i.id}
            onClick={() => add(i.id)}
            className="group relative overflow-hidden rounded-panel border border-line bg-paper text-left hover:border-blue"
            title={`Add ${i.name}`}
          >
            <div className="flex aspect-square items-center justify-center">
              {thumbs.has(i.id) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={libraryAsset(i.id).thumb} alt="" className="h-full w-full object-contain p-2 transition-transform duration-200 group-hover:scale-105" />
              ) : (
                <Box size={28} className="text-mist" />
              )}
            </div>
            <div className="border-t border-line bg-white px-2 py-1.5">
              <div className="truncate text-[13px] font-medium">{i.name}</div>
              <div className="text-[11px] text-slate">
                {Math.round(i.dims.w * 100)}×{Math.round(i.dims.d * 100)}×{Math.round(i.dims.h * 100)} cm
              </div>
            </div>
            {articulated.has(i.id) && (
              <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-ink" title="Has moving parts">
                <DoorOpen size={11} /> Opens
              </span>
            )}
          </button>
        ))}
      </div>
      {!list.length && <p className="p-4 text-center text-sm text-slate">Nothing matches. Describe it instead and Lux3D will make it.</p>}
    </div>
  );
}

function Queue() {
  const jobs = useStudio(useShallow((s) => s.items.filter((i) => i.progress !== undefined || i.status === "failed")));
  if (!jobs.length) return null;
  return (
    <div className="border-t border-line p-3">
      <div className="mb-2 text-xs font-medium text-slate">In progress</div>
      <ul className="space-y-1.5">
        {jobs.map((j) => (
          <li key={j.uid} className={clsx("relative overflow-hidden rounded-btn border border-line px-2.5 py-1.5 text-[13px]", j.status === "generating" && "shimmer")}>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{j.name}</span>
              <span className={clsx("shrink-0 text-xs", j.status === "failed" ? "text-danger" : "text-slate")}>
                {j.status === "failed" ? "Failed" : j.pendingStyle ? "Restyling" : j.status === "generating" ? `${Math.round((j.progress ?? 0) * 100)}%` : "Adding parts"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
