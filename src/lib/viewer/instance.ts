// Shared handle to the mounted engine for overlays (before/after, snapshots, tour video).
import type { Engine } from "./engine";

let current: Engine | null = null;
export const setEngine = (e: Engine | null) => {
  current = e;
  if (process.env.NODE_ENV === "development") Object.assign(window, { __engine: e });
};
export const getEngine = () => current;

/** Placement point in front of the camera on the floor. */
export function dropPoint(): [number, number, number] {
  const e = current;
  if (!e) return [0, 0, -1];
  const r = e.container.getBoundingClientRect();
  const p = e.floorPoint(r.left + r.width / 2, r.top + r.height * 0.62);
  if (!p || p.distanceTo(e.camera.position) > 8) {
    const c = e.camera.position;
    return [c.x, 0, c.z - 2];
  }
  return [p.x + (Math.random() - 0.5) * 0.3, 0, p.z + (Math.random() - 0.5) * 0.3];
}
