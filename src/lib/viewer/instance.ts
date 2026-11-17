// Shared handle to the mounted engine for overlays (before/after, snapshots, tour video).
import type { Engine } from "./engine";

let current: Engine | null = null;
export const setEngine = (e: Engine | null) => {
  current = e;
  if (process.env.NODE_ENV === "development") Object.assign(window, { __engine: e });
};
export const getEngine = () => current;

/** Placement point in front of the camera on the floor (≤ 4 m away, never behind). */
export function dropPoint(): [number, number, number] {
  const e = current;
  if (!e) return [0, 0, -1];
  const r = e.container.getBoundingClientRect();
  const c = e.camera.position;
  const ray = e.ray(r.left + r.width / 2, r.top + r.height / 2);
  const fx = ray.direction.x, fz = ray.direction.z;
  const len = Math.hypot(fx, fz) || 1;
  const p = e.floorPoint(r.left + r.width / 2, r.top + r.height * 0.62);
  const jitter = () => (Math.random() - 0.5) * 0.3;
  const d = p ? Math.hypot(p.x - c.x, p.z - c.z) : Infinity;
  if (p && d > 0.5 && d < 4) return [p.x + jitter(), 0, p.z + jitter()];
  return [c.x + (fx / len) * 2.2 + jitter(), 0, c.z + (fz / len) * 2.2 + jitter()];
}

/** Yaw that turns a piece's front (+Z) toward the camera. */
export function facingYaw(p: [number, number, number]) {
  const c = current?.camera.position;
  if (!c) return 0;
  const a = Math.atan2(c.x - p[0], c.z - p[2]);
  return Math.round(a / (Math.PI / 12)) * (Math.PI / 12); // snap to 15°
}
