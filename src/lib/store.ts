"use client";
import { create } from "zustand";
import type { Category, Dims, SampleRoom } from "./catalog";

/** Where an item's geometry comes from. Local paths are served from /public; remote from Aholo via /api/proxy. */
export type Source =
  | { kind: "glb"; url: string }
  | { kind: "urdf"; base: string; files?: Record<string, string> }; // base dir (…/robot.urdf); files = blob urls for live results

export type ItemStatus = "generating" | "ready" | "failed";

export type Item = {
  uid: string;
  name: string;
  category: Category;
  libId?: string;
  prompt?: string;
  origin: "library" | "text" | "photo";
  status: ItemStatus;
  progress?: number; // 0..1 estimate while generating
  error?: string;
  taskId?: number;
  /** Static mesh (always) + optional articulated version. */
  glb?: string;
  urdf?: Source & { kind: "urdf" };
  /** Aholo-fetchable mesh reference for chained Lux3D ops (library path or fresh result URL). */
  meshRef?: string;
  variants: Record<string, string>; // styleId -> glb url
  pendingStyle?: string;
  position: [number, number, number];
  yaw: number;
  height: number; // target size in meters: height, or longest side for rugs (uniform scale)
  natural?: Dims; // size of the loaded model before scaling
  open: boolean;
};

export type Mode = "orbit" | "walk" | "top";
export type Mood = "day" | "evening" | "night";

type Snapshot = Item[];

type State = {
  room: SampleRoom | null;
  items: Item[];
  selected: string | null;
  mode: Mode;
  mood: Mood;
  styleId: string | null;
  units: "cm" | "in";
  past: Snapshot[];
  future: Snapshot[];
  live: boolean;
  toast: { id: number; text: string; tone?: "info" | "error" | "magic" } | null;

  setRoom: (r: SampleRoom | null) => void;
  setLive: (v: boolean) => void;
  setMode: (m: Mode) => void;
  setMood: (m: Mood) => void;
  setUnits: (u: "cm" | "in") => void;
  select: (uid: string | null) => void;
  /** Mutations that should be undoable go through commit(). */
  commit: (fn: (items: Item[]) => Item[]) => void;
  /** Non-undoable patch (progress, async results). */
  patch: (uid: string, p: Partial<Item>) => void;
  setStyle: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  notify: (text: string, tone?: "info" | "error" | "magic") => void;
  load: (items: Item[], styleId: string | null) => void;
};

const MAX_HISTORY = 60;

export const useStudio = create<State>((set, get) => ({
  room: null,
  items: [],
  selected: null,
  mode: "orbit",
  mood: "day",
  styleId: null,
  units: "cm",
  past: [],
  future: [],
  live: false,
  toast: null,

  setRoom: (room) => set({ room }),
  setLive: (live) => set({ live }),
  setMode: (mode) => set({ mode }),
  setMood: (mood) => set({ mood }),
  setUnits: (units) => set({ units }),
  select: (selected) => set({ selected }),
  commit: (fn) =>
    set((s) => ({
      past: [...s.past.slice(-MAX_HISTORY + 1), s.items],
      future: [],
      items: fn(s.items),
    })),
  patch: (uid, p) => set((s) => ({ items: s.items.map((i) => (i.uid === uid ? { ...i, ...p } : i)) })),
  setStyle: (styleId) => set({ styleId }),
  undo: () => {
    const { past, items, future } = get();
    if (!past.length) return;
    set({ items: past[past.length - 1], past: past.slice(0, -1), future: [items, ...future] });
  },
  redo: () => {
    const { past, items, future } = get();
    if (!future.length) return;
    set({ items: future[0], future: future.slice(1), past: [...past, items] });
  },
  notify: (text, tone = "info") => set({ toast: { id: Date.now(), text, tone } }),
  load: (items, styleId) => set({ items, styleId, past: [], future: [], selected: null }),
}));

export const uid = () => Math.random().toString(36).slice(2, 10);

export const formatLen = (m: number, units: "cm" | "in") =>
  units === "cm" ? `${Math.round(m * 100)} cm` : `${Math.round(m * 39.37)} in`;

/** Rugs scale by their longest side; everything else by height. `size` is that target in meters. */
export const sizeAxis = (category: string) => (category === "textile" ? "width" : "height");
export const scaleFor = (category: string, natural: Dims, size: number) =>
  size / ((category === "textile" ? Math.max(natural.w, natural.d) : natural.h) || 1);

export const scaledDims = (natural: Dims, size: number, category = ""): Dims => {
  const s = scaleFor(category, natural, size);
  return { w: natural.w * s, d: natural.d * s, h: natural.h * s };
};

// ---------- persistence (guest mode: localStorage) ----------

export type SavedDesign = { v: 1; roomId: string; styleId: string | null; items: Item[]; savedAt: number };

const KEY = (roomId: string) => `reroom:design:${roomId}`;

/** Only items whose assets survive a reload (local files) are persisted fully. */
export function saveDesign(roomId: string, items: Item[], styleId: string | null) {
  try {
    // drop session-only state: in-flight jobs and blob: URLs from live articulation results
    const keep = items
      .filter((i) => i.status === "ready")
      .map((i) => ({ ...i, progress: undefined, pendingStyle: undefined, urdf: i.urdf?.files ? undefined : i.urdf, open: false }));
    const data: SavedDesign = { v: 1, roomId, styleId, items: keep, savedAt: Date.now() };
    localStorage.setItem(KEY(roomId), JSON.stringify(data));
  } catch {}
}

export function loadDesign(roomId: string): SavedDesign | null {
  try {
    const raw = localStorage.getItem(KEY(roomId));
    return raw ? (JSON.parse(raw) as SavedDesign) : null;
  } catch {
    return null;
  }
}

export function clearAllData() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("reroom:"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}
