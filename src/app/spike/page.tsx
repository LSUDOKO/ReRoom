"use client";
import { useEffect, useRef } from "react";

export default function Spike() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let dispose = () => {};
    let alive = true;
    (async () => {
      const { Engine } = await import("@/lib/viewer/engine");
      if (!alive) return;
      const e = new Engine(ref.current!);
      dispose = () => e.dispose();
      Object.assign(window, { engine: e });
      e.helpers.add(e.grid());
      const q = new URLSearchParams(location.search);
      await e.loadRoom(q.get("splat") ?? "/rooms/japandi-studio.spz");
      e.calibrate({ up: (q.get("up") as "-y") ?? "-y", scale: 1, yaw: 0, offset: [0, 0, 0] });
      const m = await e.loadUrdf("/library/L_WARDROBE/robot.urdf", (p) => `/library/L_WARDROBE/${p}`);
      e.addItem(m);
      Object.assign(window, { m, ready: true });
    })();
    return () => { alive = false; dispose(); };
  }, []);
  return <div ref={ref} style={{ height: "100vh" }} />;
}
