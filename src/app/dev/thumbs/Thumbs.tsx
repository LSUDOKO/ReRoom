"use client";
import { useEffect, useRef, useState } from "react";
import manifest from "../../../../content/manifest.json";

/** Dev tool: render every seed item with the Aholo Viewer and save library thumbnails. */
export default function Thumbs() {
  const ref = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>([]);
  useEffect(() => {
    let dispose = () => {};
    (async () => {
      const { Engine } = await import("@/lib/viewer/engine");
      const e = new Engine(ref.current!);
      dispose = () => e.dispose();
      e.setBackground(0.961, 0.965, 0.973);
      const urdf = new Set<string>(manifest.urdf as string[]);
      const only = new URLSearchParams(location.search).get("only")?.split(",");
      for (const id of (manifest.glb as string[]).filter((i) => !only || only.includes(i))) {
        const m = urdf.has(id)
          ? await e.loadUrdf(`/library/${id}/robot.urdf`, (p) => `/library/${id}/${p}`)
          : await e.loadModel(`/library/${id}.glb`);
        e.addItem(m);
        const s = 1 / Math.max(m.size.w, m.size.h, m.size.d);
        m.root.scale.set(s, s, s);
        m.root.rotation.set(0, -0.5, 0);
        m.root.updateMatrixWorld(true);
        const h = m.size.h * s;
        e.lookFrom([0.9, h * 0.5 + 0.55, 1.35], [0, h * 0.45, 0]);
        await new Promise((r) => setTimeout(r, 600));
        const png = e.snapshot();
        const img = new Image();
        img.src = png;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = c.height = 360;
        const side = Math.min(img.width, img.height);
        c.getContext("2d")!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 360, 360);
        await fetch("/api/dev/thumb", { method: "POST", body: JSON.stringify({ id, data: c.toDataURL("image/webp", 0.86) }) });
        e.removeItem(m);
        setLog((l) => [...l, id]);
      }
      setLog((l) => [...l, "DONE"]);
    })();
    return () => dispose();
  }, []);
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div ref={ref} style={{ width: 600, height: 600, position: "relative" }} />
      <pre>{log.join("\n")}</pre>
    </div>
  );
}
