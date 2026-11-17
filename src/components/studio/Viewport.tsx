"use client";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_DIMS } from "@/lib/catalog";
import { proxied } from "@/lib/api";
import { scaleFor, useStudio, uid, type Item } from "@/lib/store";
import type { Engine, LoadedModel } from "@/lib/viewer/engine";
import { setEngine } from "@/lib/viewer/instance";

type Entry = {
  key: string;
  model?: LoadedModel;
  ghost?: ReturnType<Engine["box"]>;
  loading?: boolean;
  failedKey?: string;
};

/** Which geometry an item should show right now. */
function visualKey(it: Item, styleId: string | null) {
  if (it.status === "generating") return "ghost";
  if (it.status === "failed") return "failed";
  const variant = styleId ? it.variants[styleId] : undefined;
  if (variant) return `glb:${variant}`;
  if (it.urdf) return `urdf:${it.urdf.base}`;
  return it.glb ? `glb:${it.glb}` : "ghost";
}

export default function Viewport({ readOnly = false }: { readOnly?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const entries = useRef(new Map<string, Entry>());
  const selBox = useRef<ReturnType<Engine["box"]> | null>(null);
  const [roomProgress, setRoomProgress] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const room = useStudio((s) => s.room);
  const items = useStudio((s) => s.items);
  const styleId = useStudio((s) => s.styleId);
  const selected = useStudio((s) => s.selected);
  const mode = useStudio((s) => s.mode);
  const mood = useStudio((s) => s.mood);

  // ---- engine lifecycle ----
  useEffect(() => {
    let alive = true;
    let cleanup = () => {};
    import("@/lib/viewer/engine").then(({ Engine }) => {
      if (!alive || !ref.current) return;
      const e = new Engine(ref.current);
      engineRef.current = e;
      setEngine(e);
      const grid = e.grid(12, 0.5);
      e.helpers.add(grid);
      selBox.current = e.box(0x2f6bff);
      selBox.current.visible = false;
      e.helpers.add(selBox.current);
      setReady(true);
      cleanup = () => {
        setEngine(null);
        e.dispose();
      };
    });
    const map = entries.current;
    return () => {
      alive = false;
      map.clear();
      cleanup();
    };
  }, []);

  // ---- room ----
  useEffect(() => {
    const e = engineRef.current;
    if (!e || !ready || !room) return;
    const ctrl = new AbortController();
    e.calibrate(room.calibration);
    const cam = room.camera ?? { position: [0, 1.6, 3.2] as [number, number, number], target: [0, 0.7, 0] as [number, number, number] };
    e.lookFrom(cam.position, cam.target);
    if (room.url) {
      setRoomProgress(0);
      e.loadRoom(proxied(room.url), setRoomProgress, ctrl.signal)
        .then(() => {
          e.calibrate(room.calibration);
          setRoomProgress(null);
        })
        .catch((err) => {
          if (ctrl.signal.aborted) return;
          setRoomProgress(null);
          useStudio.getState().notify(`Couldn't load this room: ${err.message}`, "error");
        });
    }
    return () => ctrl.abort();
    // calibration changes are applied separately below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, room?.id, room?.url]);

  useEffect(() => {
    if (ready && room) engineRef.current?.calibrate(room.calibration);
  }, [ready, room]);

  useEffect(() => {
    if (ready) engineRef.current?.setMood(mood);
  }, [ready, mood]);

  // ---- items → scene ----
  useEffect(() => {
    const e = engineRef.current;
    if (!e || !ready) return;
    const map = entries.current;
    const alive = new Set(items.map((i) => i.uid));

    for (const [id, en] of map) {
      if (!alive.has(id)) {
        if (en.model) e.removeItem(en.model);
        if (en.ghost) e.helpers.remove(en.ghost);
        map.delete(id);
      }
    }

    for (const it of items) {
      const key = visualKey(it, styleId);
      let en = map.get(it.uid);
      if (!en) map.set(it.uid, (en = { key: "" }));

      if (en.key !== key && !en.loading) {
        const prevModel = en.model;
        en.key = key;
        if (key === "ghost" || key === "failed") {
          if (prevModel) e.removeItem(prevModel), (en.model = undefined);
          if (!en.ghost) {
            const d = CATEGORY_DIMS[it.category];
            en.ghost = e.box(key === "failed" ? 0xd93a2b : 0xffb020, d.w, d.h, d.d);
            e.helpers.add(en.ghost);
          }
        } else {
          en.loading = true;
          const entry = en;
          const load = key.startsWith("urdf:")
            ? e.loadUrdf(proxied(it.urdf!.base), (p) => it.urdf!.files?.[p] ?? proxied(it.urdf!.base.replace(/robot\.urdf$/, p)))
            : e.loadModel(proxied(key.slice(4)), undefined, it.category === "textile");
          load
            .then((m) => {
              entry.loading = false;
              if (!map.has(it.uid)) return;
              if (entry.model) e.removeItem(entry.model);
              if (entry.ghost) e.helpers.remove(entry.ghost), (entry.ghost = undefined);
              entry.model = m;
              e.addItem(m);
              useStudio.getState().patch(it.uid, { natural: m.size });
              // re-run sync so transforms/openness apply to the fresh model
              useStudio.setState((s) => ({ items: [...s.items] }));
            })
            .catch((err) => {
              entry.loading = false;
              entry.key = "";
              console.error("[viewport] load failed", key, err);
              useStudio.getState().patch(it.uid, { status: "failed", error: "Couldn't load the model file." });
            });
        }
      }

      // transforms
      const obj = en.model?.root ?? en.ghost;
      if (obj) {
        obj.position.set(...it.position);
        obj.rotation.set(0, it.yaw, 0);
        const s = en.model ? scaleFor(it.category, en.model.size, it.height) : 1;
        obj.scale.set(s, s, s);
        obj.updateMatrixWorld(true);
      }
      if (en.model && e.canArticulate(en.model) && (en.model.openness > 0.5) !== it.open) {
        e.articulate(en.model, it.open);
      }
    }

    // selection box
    const sel = selected ? map.get(selected) : undefined;
    const box = selBox.current!;
    if (sel?.model) {
      const b = e.worldBox(sel.model);
      box.visible = true;
      box.position.set((b.min.x + b.max.x) / 2, 0.002, (b.min.z + b.max.z) / 2);
      // footprint plate on the floor: reads as selection without tinting the model
      box.scale.set(b.max.x - b.min.x + 0.12, 0.012, b.max.z - b.min.z + 0.12);
      box.updateMatrixWorld(true);
    } else box.visible = false;
    e.invalidate();
  }, [ready, items, styleId, selected]);

  // ---- camera modes ----
  useEffect(() => {
    const e = engineRef.current;
    if (!e || !ready) return;
    const c = e.control;
    if (mode === "walk") {
      c.setOptions({ useOrbit: false, moveSpeed: 1.4, lookSpeed: 0.003 });
      const p = e.camera.position;
      e.lookFrom([p.x, 1.6, p.z], [p.x, 1.5, p.z - 1]);
      return e.onFrame(() => {
        if (Math.abs(e.camera.position.y - 1.6) > 1e-3) {
          e.camera.position.y = 1.6;
          return true;
        }
      });
    }
    if (mode === "top") {
      c.setOptions({ useOrbit: true });
      e.lookFrom([0, 9, 0.01], [0, 0, 0]);
    } else {
      c.setOptions({ useOrbit: true, moveSpeed: 1.4 });
      const cam = room?.camera;
      if (cam) e.lookFrom(cam.position, cam.target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, mode]);

  // ---- pointer: select, drag on floor, double-click to open ----
  useEffect(() => {
    const el = ref.current;
    const e = engineRef.current;
    if (!el || !e || !ready || readOnly) return;
    let drag: { uid: string; offset: [number, number]; start: Item[]; moved: boolean } | null = null;
    let downAt: [number, number] | null = null;

    const pickable = () =>
      [...entries.current.entries()]
        .filter(([, en]) => en.model)
        .map(([id, en]) => ({ id, model: en.model! }));

    const onDown = (ev: PointerEvent) => {
      if (ev.button !== 0) return;
      downAt = [ev.clientX, ev.clientY];
      const hit = e.pick(ev.clientX, ev.clientY, pickable());
      if (!hit) return;
      const st = useStudio.getState();
      st.select(hit.id);
      const it = st.items.find((i) => i.uid === hit.id)!;
      const p = e.floorPoint(ev.clientX, ev.clientY);
      drag = { uid: hit.id, offset: p ? [it.position[0] - p.x, it.position[2] - p.z] : [0, 0], start: st.items, moved: false };
      e.control.pointerEnabled = false;
      el.setPointerCapture(ev.pointerId);
      ev.stopImmediatePropagation();
    };
    const onMove = (ev: PointerEvent) => {
      if (!drag) return;
      const p = e.floorPoint(ev.clientX, ev.clientY);
      if (!p) return;
      drag.moved = true;
      const st = useStudio.getState();
      const it = st.items.find((i) => i.uid === drag!.uid);
      if (it) st.patch(it.uid, { position: [p.x + drag.offset[0], 0, p.z + drag.offset[1]] });
      ev.stopImmediatePropagation();
    };
    const onUp = (ev: PointerEvent) => {
      if (drag) {
        if (drag.moved) {
          // record one undo step for the whole drag
          const after = useStudio.getState().items;
          useStudio.setState({ items: drag.start });
          useStudio.getState().commit(() => after);
        }
        drag = null;
        e.control.pointerEnabled = true;
        ev.stopImmediatePropagation();
      } else if (downAt && Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]) < 4) {
        useStudio.getState().select(null);
      }
      downAt = null;
    };
    const onDbl = (ev: MouseEvent) => {
      const hit = e.pick(ev.clientX, ev.clientY, pickable());
      if (!hit) return;
      if (!e.canArticulate(hit.model)) {
        useStudio.getState().notify("This piece has no moving parts. Use “Add moving parts” in the inspector.");
        return;
      }
      const st = useStudio.getState();
      const it = st.items.find((i) => i.uid === hit.id)!;
      st.commit((items) => items.map((i) => (i.uid === hit.id ? { ...i, open: !it.open } : i)));
    };
    el.addEventListener("pointerdown", onDown, { capture: true });
    el.addEventListener("pointermove", onMove, { capture: true });
    el.addEventListener("pointerup", onUp, { capture: true });
    el.addEventListener("dblclick", onDbl);
    return () => {
      el.removeEventListener("pointerdown", onDown, { capture: true });
      el.removeEventListener("pointermove", onMove, { capture: true });
      el.removeEventListener("pointerup", onUp, { capture: true });
      el.removeEventListener("dblclick", onDbl);
    };
  }, [ready, readOnly]);

  // ---- keyboard ----
  useEffect(() => {
    if (readOnly) return;
    const onKey = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      const st = useStudio.getState();
      const mod = ev.ctrlKey || ev.metaKey;
      if (mod && ev.key.toLowerCase() === "z") {
        ev.preventDefault();
        return ev.shiftKey ? st.redo() : st.undo();
      }
      if (mod && ev.key.toLowerCase() === "y") return ev.preventDefault(), st.redo();
      const sel = st.items.find((i) => i.uid === st.selected);
      if (!sel || st.mode === "walk") return;
      const k = ev.key.toLowerCase();
      if (k === "q" || k === "e") {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        const step = ev.shiftKey ? Math.PI / 36 : Math.PI / 12;
        st.commit((items) => items.map((i) => (i.uid === sel.uid ? { ...i, yaw: i.yaw + (k === "q" ? step : -step) } : i)));
      } else if (k === "delete" || k === "backspace") {
        ev.preventDefault();
        st.commit((items) => items.filter((i) => i.uid !== sel.uid));
        st.select(null);
      } else if (mod && k === "d") {
        ev.preventDefault();
        const copy = { ...sel, uid: uid(), position: [sel.position[0] + 0.3, 0, sel.position[2] + 0.3] as [number, number, number] };
        st.commit((items) => [...items, copy]);
        st.select(copy.uid);
      } else if (k === "escape") st.select(null);
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [readOnly]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0f1115]">
      <div ref={ref} className="absolute inset-0 outline-none" aria-label="3D room view" />
      {roomProgress !== null && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto w-72 rounded-panel bg-white/95 p-3 text-sm shadow-lg">
          <div className="mb-2 text-ink">Loading your room…</div>
          <div className="h-1.5 rounded bg-line">
            <div className="h-full rounded bg-blue transition-[width]" style={{ width: `${Math.round(roomProgress * 100)}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
