"use client";
import clsx from "clsx";
import { Copy, DoorClosed, DoorOpen, Download, Palette, RotateCcw, RotateCw, Smartphone, Trash2, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { CATEGORIES, STYLES } from "@/lib/catalog";
import { photoToDataUrl, proxied } from "@/lib/api";
import { exportItem, makeArticulated, materialFromPhoto } from "@/lib/pipeline";
import { formatLen, scaledDims, sizeAxis, uid, useStudio, type Item } from "@/lib/store";
import { Button } from "../ui";
import ArDialog from "./ArDialog";

export default function Inspector() {
  const item = useStudio((s) => s.items.find((i) => i.uid === s.selected));
  if (!item)
    return (
      <aside className="flex h-full flex-col items-center justify-center gap-2 bg-white p-6 text-center text-sm text-slate">
        <div className="font-display text-lg text-ink">Nothing selected</div>
        <p>Click a piece in the room to move, resize, open or restyle it.</p>
        <ul className="mt-3 space-y-1 text-left text-xs">
          <li><Kbd>Drag</Kbd> move on the floor</li>
          <li><Kbd>Q</Kbd> <Kbd>E</Kbd> rotate 15°</li>
          <li><Kbd>Double-click</Kbd> open / close</li>
          <li><Kbd>Ctrl D</Kbd> duplicate · <Kbd>Del</Kbd> remove</li>
          <li><Kbd>Ctrl Z</Kbd> undo</li>
        </ul>
      </aside>
    );
  return <ItemInspector key={item.uid} item={item} />;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded border border-line bg-paper px-1.5 py-0.5 font-sans text-[11px] text-ink">{children}</kbd>;
}

function ItemInspector({ item }: { item: Item }) {
  const units = useStudio((s) => s.units);
  const live = useStudio((s) => s.live);
  const styleId = useStudio((s) => s.styleId);
  const commit = useStudio((s) => s.commit);
  const [ar, setAr] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const photo = useRef<HTMLInputElement>(null);
  const dims = item.natural ? scaledDims(item.natural, item.height, item.category) : null;
  const axis = sizeAxis(item.category) === "width" ? "Width" : "Height";
  const ready = item.status === "ready";
  const update = (p: Partial<Item>) => commit((items) => items.map((i) => (i.uid === item.uid ? { ...i, ...p } : i)));
  const shownStyle = styleId && item.variants[styleId] ? STYLES.find((s) => s.id === styleId) : null;
  const canOpen = !!item.urdf && !shownStyle;
  const busy = item.progress !== undefined;

  const doExport = async (fmt: "usdz" | "stl" | "3mf" | "obj_zip" | "fbx_zip") => {
    setExporting(fmt);
    try {
      const url = await exportItem(item.uid, fmt);
      if (!url) throw new Error("Export returned no file");
      const a = document.createElement("a");
      a.href = proxied(url);
      a.download = `${item.name.replace(/\W+/g, "-")}.${fmt.replace("_zip", ".zip")}`;
      a.click();
      useStudio.getState().notify(`${fmt.toUpperCase().replace("_ZIP", "")} export ready.`, "magic");
    } catch (e) {
      useStudio.getState().notify(`Export failed: ${(e as Error).message}`, "error");
    } finally {
      setExporting(null);
    }
  };

  return (
    <aside className="scroll-thin flex h-full flex-col overflow-y-auto bg-white">
      <div className="border-b border-line p-4">
        <div className="text-xs text-slate">
          {CATEGORIES.find((c) => c.id === item.category)?.label} ·{" "}
          {item.origin === "library" ? "Library" : item.origin === "photo" ? "From your photo" : "Generated from text"}
        </div>
        <h2 className="mt-0.5 font-display text-xl leading-tight">{item.name}</h2>
        {item.prompt && <p className="mt-1 line-clamp-2 text-xs text-slate">“{item.prompt}”</p>}
        {item.status === "failed" && <p className="mt-2 rounded-btn bg-red-50 p-2 text-xs text-danger">{item.error}</p>}
      </div>

      <section className="space-y-3 border-b border-line p-4">
        <div className="text-xs font-medium text-slate">Size</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {(["w", "d", "h"] as const).map((k) => (
            <div key={k} className="rounded-btn bg-paper py-2">
              <div className="text-[11px] text-slate">{{ w: "Width", d: "Depth", h: "Height" }[k]}</div>
              <div className="text-sm font-medium tabular-nums">{dims ? formatLen(dims[k], units) : "—"}</div>
            </div>
          ))}
        </div>
        <label className="block text-xs text-slate">
          {axis}
          <div className="mt-1 flex items-center gap-2">
            <input
              type="range"
              min={0.05}
              max={4}
              step={0.01}
              value={item.height}
              onChange={(e) => useStudio.getState().patch(item.uid, { height: Number(e.target.value) })}
              onPointerUp={(e) => update({ height: Number((e.target as HTMLInputElement).value) })}
              className="flex-1"
              aria-label={axis}
            />
            <input
              type="number"
              min={5}
              max={400}
              value={Math.round(item.height * 100)}
              onChange={(e) => update({ height: Math.max(0.05, Number(e.target.value) / 100) })}
              className="h-8 w-16 rounded-btn border border-line px-2 text-sm tabular-nums"
              aria-label={`${axis} in centimeters`}
            />
            <span>cm</span>
          </div>
        </label>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => update({ yaw: item.yaw + Math.PI / 12 })}>
            <RotateCcw size={14} /> 15°
          </Button>
          <Button size="sm" className="flex-1" onClick={() => update({ yaw: item.yaw - Math.PI / 12 })}>
            <RotateCw size={14} /> 15°
          </Button>
        </div>
      </section>

      <section className="space-y-2 border-b border-line p-4">
        <div className="text-xs font-medium text-slate">Moving parts</div>
        {canOpen ? (
          <Button variant="primary" className="w-full" onClick={() => update({ open: !item.open })}>
            {item.open ? <DoorClosed size={16} /> : <DoorOpen size={16} />}
            {item.open ? "Close it" : "Open it"}
          </Button>
        ) : item.urdf && shownStyle ? (
          <p className="text-xs text-slate">Opening works in the original finish. Switch the style off to try it.</p>
        ) : (
          <Button
            variant="magic"
            className="w-full"
            disabled={!live || !ready || busy || !item.meshRef}
            onClick={() => makeArticulated(item.uid)}
            title={live ? "" : "Needs live generation"}
          >
            <Wand2 size={16} /> {busy ? "Working…" : "Add moving parts"}
          </Button>
        )}
      </section>

      <section className="space-y-2 border-b border-line p-4">
        <div className="text-xs font-medium text-slate">Finish</div>
        <p className="text-xs text-slate">
          {shownStyle ? `Showing the ${shownStyle.name} finish.` : "Original finish."} Pick a style below the room to restyle everything, or use any
          material photo for this piece.
        </p>
        <Button className="w-full" disabled={!live || !ready || busy} onClick={() => photo.current?.click()}>
          <Palette size={16} /> Material from a photo
        </Button>
        <input
          ref={photo}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) materialFromPhoto(item.uid, await photoToDataUrl(f));
            e.target.value = "";
          }}
        />
      </section>

      <section className="space-y-2 border-b border-line p-4">
        <div className="text-xs font-medium text-slate">See it and take it with you</div>
        <Button className="w-full" disabled={!ready || !item.glb} onClick={() => setAr(true)}>
          <Smartphone size={16} /> View in your room (AR)
        </Button>
        <div className="grid grid-cols-3 gap-1.5">
          {item.glb && (
            <a
              href={proxied(item.glb)}
              download={`${item.name.replace(/\W+/g, "-")}.glb`}
              className="inline-flex h-8 items-center justify-center gap-1 rounded-btn border border-line text-[12px] hover:bg-paper"
            >
              <Download size={12} /> GLB
            </a>
          )}
          {(["usdz", "stl", "3mf", "obj_zip", "fbx_zip"] as const).map((f) => (
            <button
              key={f}
              disabled={!live || !ready || !!exporting}
              onClick={() => doExport(f)}
              className={clsx("inline-flex h-8 items-center justify-center gap-1 rounded-btn border border-line text-[12px] hover:bg-paper disabled:opacity-40", exporting === f && "shimmer")}
            >
              {exporting === f ? "…" : f.replace("_zip", "").toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate">USDZ, STL, 3MF, OBJ and FBX are converted by Lux3D multi-format export. STL and 3MF are ready for 3D printing.</p>
      </section>

      <section className="mt-auto flex gap-2 p-4">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            const copy = { ...item, uid: uid(), position: [item.position[0] + 0.3, 0, item.position[2] + 0.3] as [number, number, number] };
            commit((items) => [...items, copy]);
            useStudio.getState().select(copy.uid);
          }}
        >
          <Copy size={14} /> Duplicate
        </Button>
        <Button
          size="sm"
          variant="danger"
          className="flex-1"
          onClick={() => {
            commit((items) => items.filter((i) => i.uid !== item.uid));
            useStudio.getState().select(null);
          }}
        >
          <Trash2 size={14} /> Remove
        </Button>
      </section>
      <ArDialog open={ar} onClose={() => setAr(false)} item={item} />
    </aside>
  );
}
