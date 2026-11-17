"use client";
import { Check, Clapperboard, Copy, Link2 } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { encodeDesign } from "@/lib/share";
import { useStudio } from "@/lib/store";
import { getEngine } from "@/lib/viewer/instance";
import { Button, Modal } from "../ui";

export default function ShareDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState("");
  const [recording, setRecording] = useState<number | null>(null);
  const room = useStudio((s) => s.room);
  const items = useStudio((s) => s.items);
  const styleId = useStudio((s) => s.styleId);

  const link = enabled && room ? `${location.origin}/view#${encodeDesign(room, styleId, items)}` : "";
  const expiring = items.some((i) => i.glb && !i.glb.startsWith("/"));
  useEffect(() => {
    if (link) QRCode.toDataURL(link, { margin: 1, width: 180 }).then(setQr);
  }, [link]);

  return (
    <Modal open={open} onClose={onClose} title="Share your design">
      <div className="space-y-5">
        <label className="flex items-start gap-3 rounded-panel border border-line p-3">
          <input type="checkbox" className="mt-1 accent-blue" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <span className="text-sm">
            <span className="font-medium">Create a view-only link</span>
            <span className="block text-xs text-slate">
              The design is packed into the link itself and isn&apos;t stored on our servers. Anyone with the link can look around and open doors.
            </span>
          </span>
        </label>
        {link && (
          <div className="rise space-y-3">
            <div className="flex gap-2">
              <input readOnly value={link} className="h-10 min-w-0 flex-1 rounded-btn border border-line bg-paper px-3 text-xs text-slate" aria-label="Share link" />
              <Button
                variant="primary"
                onClick={async () => {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {qr && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="QR code for the share link" width={96} height={96} className="rounded-btn border border-line" />
              )}
              <p className="text-xs text-slate">
                <Link2 size={12} className="mr-1 inline" />
                Scan to open the design on a phone.
                {expiring && " Pieces generated in this session load from Aholo for about two hours."}
              </p>
            </div>
          </div>
        )}
        <div className="border-t border-line pt-4">
          <div className="mb-2 text-sm font-medium">Tour video</div>
          <p className="mb-3 text-xs text-slate">Records a slow 360° walk-around of your room as a video file.</p>
          <Button className="w-full" disabled={recording !== null} onClick={() => recordTour(setRecording)}>
            <Clapperboard size={16} /> {recording !== null ? `Recording… ${recording}s` : "Record a 10-second tour"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Orbit the camera around the room and record the canvas with MediaRecorder. */
async function recordTour(onTick: (s: number | null) => void) {
  const e = getEngine();
  const canvas = e?.canvas();
  if (!e || !canvas) return;
  const stream = canvas.captureStream(30);
  const mime = ["video/mp4;codecs=avc1", "video/webm;codecs=vp9", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (ev) => chunks.push(ev.data);
  const center = e.control.getState().orbitCenter;
  const start = e.camera.position.clone();
  const r = Math.max(1.2, Math.hypot(start.x - center.x, start.z - center.z));
  const a0 = Math.atan2(start.z - center.z, start.x - center.x);
  const DUR = 10;
  let t = 0;
  e.helpers.visible = false;
  const stop = e.onFrame((dt) => {
    t += dt;
    const a = a0 + (t / DUR) * Math.PI * 2;
    e.lookFrom([center.x + Math.cos(a) * r, start.y, center.z + Math.sin(a) * r], [center.x, center.y, center.z]);
    onTick(Math.max(0, Math.ceil(DUR - t)));
    if (t >= DUR) {
      stop();
      rec.stop();
    }
    return true;
  });
  rec.onstop = () => {
    e.helpers.visible = true;
    onTick(null);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(chunks, { type: mime }));
    a.download = `reroom-tour.${mime.includes("mp4") ? "mp4" : "webm"}`;
    a.click();
  };
  rec.start(250);
}
