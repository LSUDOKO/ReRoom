"use client";
import clsx from "clsx";
import { ArrowRight, CheckCircle2, Film, Lightbulb, Loader2, RotateCcw, Sparkles, Trash2, Upload, Wand2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SAMPLE_ROOMS, type SampleRoom } from "@/lib/catalog";
import { createWorld, getWorld, uploadFile, type WorldStatus } from "@/lib/api";
import { clearAllData } from "@/lib/store";
import { Button } from "./ui";

const KEY = "reroom:rooms";
type MyRoom = SampleRoom & { createdAt: number };

const readRooms = (): MyRoom[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};
const writeRooms = (r: MyRoom[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(r));
  } catch {}
};

const TIPS = [
  { icon: Lightbulb, title: "Light it up", body: "Turn on the lights and open the curtains." },
  { icon: Film, title: "Walk slowly for 30–60 s", body: "Phone at chest height, then one more lap a little higher." },
  { icon: RotateCcw, title: "See every wall and corner", body: "Overlap your path. Don't spin quickly." },
  { icon: CheckCircle2, title: "Avoid mirrors and people", body: "Mirrors facing the camera and moving people blur the scan." },
];

const DREAMS = [
  "a cozy Japandi studio apartment with large windows, warm afternoon light, wooden floor",
  "an industrial loft with exposed brick walls, high ceilings, evening light",
  "a sunny coastal bedroom with white walls and a sea view",
];

export default function ScanFlow() {
  const [rooms, setRooms] = useState<MyRoom[]>([]);
  const [live, setLive] = useState<boolean | null>(null);
  useEffect(() => {
    setRooms(readRooms());
    fetch("/api/status").then((r) => r.json()).then((s) => setLive(!!s.live)).catch(() => setLive(false));
  }, []);
  const add = (r: MyRoom) => {
    const next = [r, ...readRooms().filter((x) => x.id !== r.id)];
    writeRooms(next);
    setRooms(next);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-10">
        <Capture live={live} onStarted={add} />
        <Dream live={live} onStarted={add} />
      </div>
      <aside className="space-y-8">
        <MyRooms rooms={rooms} onChange={setRooms} />
        <section>
          <h2 className="font-display text-2xl">Sample rooms</h2>
          <p className="mb-3 text-sm text-slate">Open one instantly while your scan builds.</p>
          <div className="grid gap-3">
            {SAMPLE_ROOMS.map((r) => (
              <Link key={r.id} href={`/studio?room=${r.id}`} className="group flex items-center gap-3 rounded-panel border border-line p-2 hover:border-blue">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-btn bg-paper">
                  {r.thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumb} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{r.name}</div>
                  <div className="truncate text-xs text-slate">{r.blurb}</div>
                </div>
                <ArrowRight size={16} className="mr-2 text-mist group-hover:text-blue" />
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function Capture({ live, onStarted }: { live: boolean | null; onStarted: (r: MyRoom) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("My room");
  const [consent, setConsent] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (!file) return;
    setError(null);
    try {
      setProgress(0);
      const url = await uploadFile(file, setProgress);
      const type = /\.insv$/i.test(file.name) ? "insv" : file.type.startsWith("image/") ? "image" : "video";
      const { worldId } = await createWorld({ mode: "reconstruct", url, type, name });
      onStarted(room(worldId, name, "scan"));
      setFile(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress(null);
    }
  };

  return (
    <section>
      <h1 className="font-display text-4xl leading-tight">Scan your room</h1>
      <p className="mt-2 max-w-xl text-slate">
        Record a slow 30–60 second video on your phone. Aholo Reality turns it into a photoreal 3D room you can walk through.
      </p>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {TIPS.map((t, i) => (
          <li key={t.title} className="flex gap-3 rounded-panel bg-paper p-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-medium">{i + 1}</span>
            <span>
              <span className="block font-medium">{t.title}</span>
              <span className="text-sm text-slate">{t.body}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 space-y-3 rounded-panel border border-line p-5">
        <button
          onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => (e.preventDefault(), setFile(e.dataTransfer.files[0] ?? null))}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-panel border border-dashed border-line bg-paper py-8 text-sm text-slate hover:border-blue"
        >
          <Upload size={22} />
          {file ? <span className="font-medium text-ink">{file.name} · {(file.size / 1e6).toFixed(1)} MB</span> : "Drop a video here, or click to record or choose one"}
          <span className="text-xs">MP4, MOV or Insta360 INSV · up to 500 MB</span>
        </button>
        <input
          ref={input}
          type="file"
          hidden
          accept="video/mp4,video/quicktime,.mov,.mp4,.insv"
          capture="environment"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Room name" className="h-10 w-full rounded-btn border border-line px-3 text-sm" />
        <label className="flex items-start gap-2 text-sm text-slate">
          <input type="checkbox" className="mt-0.5 accent-blue" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            This is my space (or I have permission), and I agree the video is processed by Aholo to build the 3D room. See the{" "}
            <Link href="/privacy" className="text-blue underline">privacy note</Link>.
          </span>
        </label>
        {progress !== null && (
          <div className="h-1.5 rounded bg-line">
            <div className="h-full rounded bg-blue transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}
        {error && <p className="rounded-btn bg-red-50 p-2 text-sm text-danger">{error} Check the tips above and try again.</p>}
        <Button variant="primary" className="w-full" disabled={!file || !consent || progress !== null || live === false} onClick={start}>
          {progress !== null ? <><Loader2 size={16} className="animate-spin" /> Uploading {Math.round(progress * 100)}%</> : "Build my 3D room"}
        </Button>
        {live === false && <p className="text-xs text-slate">Scanning is off on this demo deployment. Try a sample room.</p>}
      </div>
    </section>
  );
}

function Dream({ live, onStarted }: { live: boolean | null; onStarted: (r: MyRoom) => void }) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      const { worldId } = await createWorld({ mode: "generate", prompt });
      onStarted(room(worldId, prompt.split(/[,.]/)[0].replace(/^(a|an)\s+/i, "").slice(0, 40), "spatialgen"));
      setPrompt("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="rounded-panel bg-amber-soft p-6">
      <h2 className="flex items-center gap-2 font-display text-2xl">
        <Wand2 size={20} /> No room to scan? Dream one up
      </h2>
      <p className="mt-1 text-sm text-slate">Describe a room and Aholo SpatialGen builds it as a walkable 3D space in about ten minutes.</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="A sunset loft in Tokyo with big windows"
        className="mt-4 w-full resize-none rounded-btn border border-line bg-white p-3 text-sm outline-none focus:border-blue"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {DREAMS.map((d) => (
          <button key={d} onClick={() => setPrompt(d)} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate hover:text-ink">
            {d.split(",")[0]}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <Button variant="magic" className="mt-4 bg-ink text-white hover:bg-ink" disabled={prompt.trim().length < 8 || busy || live === false} onClick={go}>
        <Sparkles size={16} /> {busy ? "Starting…" : "Generate this room"}
      </Button>
    </section>
  );
}

function room(worldId: string, name: string, source: SampleRoom["source"]): MyRoom {
  return {
    id: `world-${worldId}`,
    worldId,
    name,
    blurb: source === "scan" ? "Your scan" : "Generated with SpatialGen",
    url: "",
    calibration: { up: "+z", scale: 1, yaw: 0, offset: [0, 1.3, 0] },
    source,
    createdAt: Date.now(),
  };
}

const STAGE: Record<string, string> = {
  PENDING: "Queued",
  PREPROCESSING: "Preparing frames",
  RUNNING: "Reconstructing",
  SUCCEEDED: "Ready",
  FAILED: "Failed",
  CANCELED: "Canceled",
  TIMEOUT: "Timed out",
  REJECTED: "Rejected",
};

function MyRooms({ rooms, onChange }: { rooms: MyRoom[]; onChange: (r: MyRoom[]) => void }) {
  const [status, setStatus] = useState<Record<string, WorldStatus>>({});
  const router = useRouter();
  useEffect(() => {
    if (!rooms.length) return;
    let alive = true;
    const poll = async () => {
      const entries = await Promise.all(rooms.map((r) => getWorld(r.worldId!).then((s) => [r.worldId!, s] as const).catch(() => null)));
      if (alive) setStatus(Object.fromEntries(entries.filter(Boolean) as [string, WorldStatus][]));
    };
    poll();
    const t = setInterval(poll, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [rooms]);

  return (
    <section>
      <h2 className="font-display text-2xl">My rooms</h2>
      {!rooms.length ? (
        <p className="mt-1 text-sm text-slate">Rooms you scan or generate appear here. They&apos;re listed on this device only.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rooms.map((r) => {
            const s = status[r.worldId!];
            const ready = s?.status === "SUCCEEDED";
            const failed = s && ["FAILED", "CANCELED", "TIMEOUT", "REJECTED"].includes(s.status);
            return (
              <li key={r.id} className="flex items-center gap-3 rounded-panel border border-line p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{r.name}</div>
                  <div className={clsx("text-xs", failed ? "text-danger" : "text-slate")}>
                    {s ? STAGE[s.status] ?? s.status : "Checking…"}
                    {s?.status === "RUNNING" && s.progress ? ` · ${Math.round(s.progress * 100)}%` : ""}
                    {!ready && !failed && " · we keep checking while this page is open"}
                  </div>
                </div>
                {ready ? (
                  <Button size="sm" variant="primary" onClick={() => router.push(`/studio?world=${r.worldId}&name=${encodeURIComponent(r.name)}`)}>
                    Open
                  </Button>
                ) : failed ? null : (
                  <Loader2 size={16} className="animate-spin text-mist" />
                )}
                <button
                  aria-label={`Remove ${r.name}`}
                  className="text-mist hover:text-danger"
                  onClick={() => {
                    const next = rooms.filter((x) => x.id !== r.id);
                    writeRooms(next);
                    onChange(next);
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button
        className="mt-3 text-xs text-slate underline hover:text-danger"
        onClick={() => {
          if (!confirm("Delete all rooms and designs saved on this device?")) return;
          clearAllData();
          onChange([]);
        }}
      >
        Delete my data on this device
      </button>
    </section>
  );
}
