"use client";
import { useEffect } from "react";
import type { SampleRoom } from "@/lib/catalog";
import { useStudio } from "@/lib/store";
import { getEngine } from "@/lib/viewer/instance";
import { Button } from "../ui";

type Cal = SampleRoom["calibration"];
const KEY = (id: string) => `reroom:calib:${id}`;

export function savedCalibration(id: string): Cal | null {
  try {
    const raw = localStorage.getItem(KEY(id));
    return raw ? (JSON.parse(raw) as Cal) : null;
  } catch {
    return null;
  }
}

/** Level the floor and set real-world scale. A 1 m cube and a 1.7 m person are shown for reference. */
export default function CalibratePanel({ onClose }: { onClose: () => void }) {
  const room = useStudio((s) => s.room);
  const setRoom = useStudio((s) => s.setRoom);

  useEffect(() => {
    const e = getEngine();
    if (!e) return;
    const cube = e.box(0x4219fa, 1, 1, 1);
    cube.position.set(-0.8, 0, -1.2);
    const person = e.box(0xffc531, 0.45, 1.7, 0.25);
    person.position.set(0.6, 0, -1.2);
    e.helpers.add([cube, person]);
    e.invalidate();
    return () => {
      e.helpers.remove(cube);
      e.helpers.remove(person);
      e.invalidate();
    };
  }, []);

  if (!room) return null;
  const c = room.calibration;
  const set = (p: Partial<Cal>) => {
    const calibration = { ...c, ...p };
    setRoom({ ...room, calibration });
    try {
      localStorage.setItem(KEY(room.id), JSON.stringify(calibration));
    } catch {}
  };

  return (
    <div className="rise w-80 space-y-4 rounded-panel bg-white p-4 shadow-[0_8px_30px_rgb(18_20_23/0.2)]">
      <div>
        <h3 className="font-display text-lg">Calibrate your room</h3>
        <p className="text-xs text-slate">
          Line up the floor grid with the real floor, then scale until the blue 1 m cube and the 1.7 m figure look right next to a door.
        </p>
      </div>
      <label className="block text-xs text-slate">
        Which way is up in the scan
        <select value={c.up} onChange={(e) => set({ up: e.target.value as Cal["up"] })} className="mt-1 h-9 w-full rounded-btn border border-line px-2 text-sm text-ink">
          <option value="+z">Z up (Aholo World default)</option>
          <option value="-y">Y down (OpenCV)</option>
          <option value="+y">Y up (glTF)</option>
          <option value="-z">Z down</option>
        </select>
      </label>
      <Slider label="Floor height" value={c.offset[1]} min={-3} max={3} step={0.01} unit="m" onChange={(v) => set({ offset: [c.offset[0], v, c.offset[2]] })} />
      <Slider label="Scale" value={c.scale} min={0.2} max={5} step={0.01} unit="×" onChange={(v) => set({ scale: v })} />
      <Slider label="Turn room" value={(c.yaw * 180) / Math.PI} min={-180} max={180} step={1} unit="°" onChange={(v) => set({ yaw: (v * Math.PI) / 180 })} />
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => set({ offset: [0, 0, 0], scale: 1, yaw: 0 })}>
          Reset
        </Button>
        <Button size="sm" variant="primary" className="flex-1" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  return (
    <label className="block text-xs text-slate">
      <span className="flex justify-between">
        {label}
        <span className="tabular-nums text-ink">
          {value.toFixed(step < 1 ? 2 : 0)} {unit}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full" />
    </label>
  );
}
