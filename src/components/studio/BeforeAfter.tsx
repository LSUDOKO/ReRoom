"use client";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { getEngine } from "@/lib/viewer/instance";
import { Button } from "../ui";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Same camera, two renders: the scan alone vs the current design. */
export async function captureBeforeAfter() {
  const e = getEngine();
  if (!e) return null;
  e.helpers.visible = false;
  e.itemsRoot.visible = false;
  e.invalidate();
  await wait(120);
  const before = e.snapshot();
  e.itemsRoot.visible = true;
  e.invalidate();
  await wait(120);
  const after = e.snapshot();
  e.helpers.visible = true;
  e.invalidate();
  return { before, after };
}

export default function BeforeAfter({ onClose }: { onClose: () => void }) {
  const [shots, setShots] = useState<{ before: string; after: string } | null>(null);
  const [x, setX] = useState(50);
  useEffect(() => {
    captureBeforeAfter().then(setShots);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async () => {
    if (!shots) return;
    const [a, b] = await Promise.all([shots.before, shots.after].map(loadImg));
    const c = document.createElement("canvas");
    c.width = a.width;
    c.height = a.height;
    const g = c.getContext("2d")!;
    const cut = Math.round((x / 100) * c.width);
    g.drawImage(b, 0, 0);
    g.drawImage(a, 0, 0, cut, c.height, 0, 0, cut, c.height);
    g.fillStyle = "#fff";
    g.fillRect(cut - 2, 0, 4, c.height);
    label(g, "Before", 24, c.height - 28);
    label(g, "After", c.width - 110, c.height - 28);
    const link = document.createElement("a");
    link.download = "reroom-before-after.png";
    link.href = c.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="absolute inset-0 z-30 bg-ink">
      {shots ? (
        <div className="relative h-full w-full select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shots.after} alt="Your design" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shots.before} alt="Your room before" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white" style={{ left: `${x}%` }}>
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-1 text-xs font-medium text-ink shadow">⇆</div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            aria-label="Before and after divider"
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
          <span className="absolute bottom-5 left-5 rounded-btn bg-white/90 px-2.5 py-1 text-sm font-medium">Before</span>
          <span className="absolute bottom-5 right-5 rounded-btn bg-white/90 px-2.5 py-1 text-sm font-medium">After</span>
          <div className="absolute right-4 top-4 flex gap-2">
            <Button size="sm" onClick={save}>
              <Download size={14} /> Save image
            </Button>
            <Button size="sm" variant="primary" onClick={onClose}>
              Back to editing
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-on/70">Rendering before and after…</div>
      )}
    </div>
  );
}

const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((res) => {
    const i = new Image();
    i.onload = () => res(i);
    i.src = src;
  });

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number) {
  g.font = "600 22px Inter, sans-serif";
  g.fillStyle = "rgba(255,255,255,.92)";
  g.fillRect(x - 10, y - 26, g.measureText(text).width + 20, 36);
  g.fillStyle = "#121417";
  g.fillText(text, x, y);
}
