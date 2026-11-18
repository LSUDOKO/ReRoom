"use client";
import { unzipSync } from "fflate";
import { useStudio } from "./store";

export type TaskOp = "text" | "image" | "transfer" | "articulate" | "split" | "export";
export type TaskResult = { taskId: number; state: "queued" | "running" | "done" | "failed"; urls: string[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error ?? `Request failed (${res.status})`), { retry: data.retry });
  return data as T;
}

/** Create a Lux3D task; retries while the account's concurrency slots are busy. */
export async function createTask(op: TaskOp, body: Record<string, unknown>) {
  // single choke point for spending credits: demo mode (or no key) never reaches Lux3D,
  // even if a hidden file input or keyboard shortcut slips past a disabled button
  if (!useStudio.getState().live) throw new Error("Live generation is off in demo mode.");
  for (let i = 0; ; i++) {
    try {
      return await post<{ taskId: number; note?: string }>("/api/lux3d", { op, ...body });
    } catch (e) {
      if (!(e as { retry?: boolean }).retry || i > 10) throw e;
      await sleep(8000 + i * 4000);
    }
  }
}

/**
 * Poll a task until done. Lux3D reports no percentage, so progress is a time-based
 * estimate against the typical duration of the op (honest "about" figure in the UI).
 */
export async function waitTask(taskId: number, expectedSec: number, onProgress?: (p: number) => void, signal?: AbortSignal) {
  const start = Date.now();
  for (;;) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const res = await fetch(`/api/lux3d/${taskId}`, { signal });
    const t = (await res.json()) as TaskResult & { error?: string };
    if (!res.ok) throw new Error(t.error ?? "Status check failed");
    if (t.state === "done") return t;
    if (t.state === "failed") throw new Error("Aholo couldn't finish this one.");
    const elapsed = (Date.now() - start) / 1000;
    onProgress?.(Math.min(0.95, 1 - Math.exp(-elapsed / (expectedSec * 0.6))));
    await sleep(4000);
  }
}

export const pick = (urls: string[], ext: string) => urls.find((u) => u.split("?")[0].toLowerCase().endsWith(`.${ext}`));

/** Same-origin URL for an Aholo result file. */
export const proxied = (url: string) => (url.startsWith("/") || url.startsWith("blob:") ? url : `/api/proxy?url=${encodeURIComponent(url)}`);

/** Unzip a Lux3D articulation result (urdf/robot.urdf + urdf/meshes/*.glb) into blob URLs. */
export async function loadArticulationZip(zipUrl: string) {
  const res = await fetch(proxied(zipUrl));
  if (!res.ok) throw new Error("Couldn't download the moving-parts model.");
  const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
  const map: Record<string, string> = {};
  let urdf = "";
  for (const [name, data] of Object.entries(files)) {
    const rel = name.replace(/^urdf\//, "");
    if (!rel || rel.endsWith("/")) continue;
    const type = rel.endsWith(".glb") ? "model/gltf-binary" : "application/xml";
    const url = URL.createObjectURL(new Blob([data as BlobPart], { type }));
    if (rel.endsWith(".urdf")) urdf = url;
    else map[rel] = url;
  }
  if (!urdf) throw new Error("Moving-parts result had no joint data.");
  return { kind: "urdf" as const, base: urdf, files: map };
}

export async function createWorld(body: Record<string, unknown>) {
  return post<{ worldId: string }>("/api/worlds", body);
}

export type WorldStatus = {
  worldId: string;
  status: string;
  progress: number | null;
  spz: string | null;
  ply: string | null;
  pano: string | null;
};

export async function getWorld(worldId: string) {
  const res = await fetch(`/api/worlds/${worldId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Status check failed");
  return data as WorldStatus;
}

/** Upload a file to Aholo asset storage through our server; returns its public URL. */
export function uploadFile(file: File, onProgress?: (p: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/upload?name=${encodeURIComponent(file.name)}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText || "{}");
      if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve(data.url);
      else reject(new Error(data.error ?? `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Upload interrupted. Check your connection and try again."));
    xhr.send(file);
  });
}

/** Downscale a photo to ≤1024 px JPEG; re-encoding also strips EXIF/GPS. */
export async function photoToDataUrl(file: File) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.88);
}
