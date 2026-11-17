"use client";
import clsx from "clsx";
import {
  Columns2,
  Footprints,
  Map as MapIcon,
  Moon,
  Orbit,
  PanelLeft,
  PanelRight,
  Redo2,
  Ruler,
  Share2,
  Sun,
  Sunset,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SAMPLE_ROOMS, type SampleRoom } from "@/lib/catalog";
import { getWorld } from "@/lib/api";
import { loadDesign, saveDesign, useStudio, type Mood } from "@/lib/store";
import { IconButton, Logo, Segmented } from "../ui";
import AddPanel from "./AddPanel";
import BeforeAfter from "./BeforeAfter";
import CalibratePanel, { savedCalibration } from "./CalibratePanel";
import Inspector from "./Inspector";
import Onboarding from "./Onboarding";
import ShareDialog from "./ShareDialog";
import StyleBar from "./StyleBar";
import Toast from "./Toast";
import Viewport from "./Viewport";

export type StudioProps = { roomId?: string; worldId?: string; worldName?: string; demo?: boolean };

export const myRoomsKey = "reroom:rooms";

export function myRooms(): SampleRoom[] {
  try {
    return JSON.parse(localStorage.getItem(myRoomsKey) ?? "[]");
  } catch {
    return [];
  }
}

async function resolveRoom({ roomId, worldId, worldName }: StudioProps): Promise<SampleRoom> {
  if (worldId) {
    const w = await getWorld(worldId);
    const url = w.spz ?? w.ply;
    if (!url) throw new Error(w.status === "SUCCEEDED" ? "This world has no splat file." : "This room is still being built.");
    return {
      id: `world-${worldId}`,
      name: worldName || myRooms().find((r) => r.worldId === worldId)?.name || "My room",
      blurb: "",
      url,
      calibration: { up: "+z", scale: 1, yaw: 0, offset: [0, 1.3, 0] },
      camera: { position: [0, 1.45, 1.6], target: [0, 0.8, -2] },
      source: "scan",
      worldId,
    };
  }
  return SAMPLE_ROOMS.find((r) => r.id === roomId) ?? SAMPLE_ROOMS[0];
}

export default function Studio(props: StudioProps) {
  const room = useStudio((s) => s.room);
  const mode = useStudio((s) => s.mode);
  const mood = useStudio((s) => s.mood);
  const past = useStudio((s) => s.past.length);
  const future = useStudio((s) => s.future.length);
  const live = useStudio((s) => s.live);
  const [compare, setCompare] = useState(false);
  const [share, setShare] = useState(false);
  const [calibrate, setCalibrate] = useState(false);
  const [left, setLeft] = useState(true);
  const [right, setRight] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // boot: room + saved design + live status
  useEffect(() => {
    const st = useStudio.getState();
    if (process.env.NODE_ENV === "development") Object.assign(window, { __studio: useStudio });
    fetch("/api/status")
      .then((r) => r.json())
      .then((s) => st.setLive(!!s.live && !props.demo))
      .catch(() => st.setLive(false));
    resolveRoom(props)
      .then((r) => {
        const cal = savedCalibration(r.id);
        st.setRoom(cal ? { ...r, calibration: cal } : r);
        const saved = loadDesign(r.id);
        st.load(saved?.items ?? [], saved?.styleId ?? null);
      })
      .catch((e) => setError(e.message));
    if (window.innerWidth < 900) (setLeft(false), setRight(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autosave (guest mode → this browser only)
  useEffect(
    () =>
      useStudio.subscribe((s, prev) => {
        if (s.room && (s.items !== prev.items || s.styleId !== prev.styleId)) saveDesign(s.room.id, s.items, s.styleId);
      }),
    [],
  );

  const st = useStudio.getState();
  if (error)
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
        <Logo />
        <p className="max-w-sm text-slate">{error}</p>
        <Link href="/scan" className="text-blue underline">Back to my rooms</Link>
      </div>
    );

  return (
    <div className="flex h-dvh flex-col bg-paper">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-3">
        <Link href="/" aria-label="ReRoom home"><Logo className="text-[19px]" /></Link>
        <span className="hidden truncate text-sm text-slate md:inline">/ {room?.name ?? "Loading…"}</span>
        {!live && <span className="hidden rounded-full bg-amber-soft px-2 py-0.5 text-xs font-medium text-ink sm:inline">Demo mode</span>}
        <div className="mx-auto">
          <Segmented
            label="Camera mode"
            value={mode}
            onChange={(m) => st.setMode(m)}
            options={[
              { id: "orbit", label: "Orbit", icon: <Orbit size={14} /> },
              { id: "walk", label: "Walk", icon: <Footprints size={14} /> },
              { id: "top", label: "Top", icon: <MapIcon size={14} /> },
            ]}
          />
        </div>
        <div className="flex items-center gap-0.5">
          <IconButton label="Undo (Ctrl Z)" onClick={st.undo} disabled={!past}><Undo2 size={17} /></IconButton>
          <IconButton label="Redo (Ctrl Shift Z)" onClick={st.redo} disabled={!future}><Redo2 size={17} /></IconButton>
          <span className="mx-1 h-6 w-px bg-line" />
          {(["day", "evening", "night"] as Mood[]).map((m) => (
            <IconButton key={m} label={`${m[0].toUpperCase()}${m.slice(1)} light`} active={mood === m} onClick={() => st.setMood(m)}>
              {m === "day" ? <Sun size={16} /> : m === "evening" ? <Sunset size={16} /> : <Moon size={16} />}
            </IconButton>
          ))}
          <span className="mx-1 h-6 w-px bg-line" />
          <IconButton label="Calibrate floor and scale" active={calibrate} onClick={() => setCalibrate((v) => !v)}><Ruler size={17} /></IconButton>
          <IconButton label="Before / after" active={compare} onClick={() => setCompare(true)}><Columns2 size={17} /></IconButton>
          <button onClick={() => setShare(true)} className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-btn bg-blue px-3 text-[13px] font-medium text-white hover:bg-blue-deep">
            <Share2 size={15} /> Share
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <div className={clsx("absolute inset-y-0 left-0 z-20 w-72 border-r border-line transition-transform md:static md:translate-x-0", left ? "translate-x-0" : "-translate-x-full md:hidden")}>
          <AddPanel />
        </div>
        <main className="relative min-w-0 flex-1">
          <Viewport />
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center">
            <div className="pointer-events-auto max-w-full"><StyleBar /></div>
          </div>
          <div className="absolute left-3 top-3 flex gap-1.5">
            <IconButton label={left ? "Hide add panel" : "Show add panel"} onClick={() => setLeft((v) => !v)} className="bg-white/90 shadow"><PanelLeft size={17} /></IconButton>
          </div>
          <div className="absolute right-3 top-3 flex gap-1.5">
            <IconButton label={right ? "Hide inspector" : "Show inspector"} onClick={() => setRight((v) => !v)} className="bg-white/90 shadow"><PanelRight size={17} /></IconButton>
          </div>
          {calibrate && (
            <div className="absolute left-14 top-3 z-10">
              <CalibratePanel onClose={() => setCalibrate(false)} />
            </div>
          )}
          {mode === "walk" && (
            <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-btn bg-ink/80 px-3 py-1.5 text-xs text-white">
              W A S D to walk · drag to look · Shift to hurry
            </div>
          )}
          {compare && <BeforeAfter onClose={() => setCompare(false)} />}
          <Toast />
        </main>
        <div className={clsx("absolute inset-y-0 right-0 z-20 w-72 border-l border-line transition-transform md:static md:translate-x-0", right ? "translate-x-0" : "translate-x-full md:hidden")}>
          <Inspector />
        </div>
      </div>
      <ShareDialog open={share} onClose={() => setShare(false)} />
      <Onboarding />
    </div>
  );
}
