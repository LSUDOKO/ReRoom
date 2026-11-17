// The only module that talks to the Aholo platform. Server-side only:
// the API key is read from AHOLO_API_KEY and never reaches the browser.
import { createAssetClient, type AssetClient } from "@manycore/aholo-sdk-asset";
import { createLux3dClient, type Lux3dClient } from "@manycore/aholo-sdk-lux3d";
import { createWorldClient, type WorldClient } from "@manycore/aholo-sdk-world";

const region = (process.env.AHOLO_REGION as "com" | "cn" | undefined) ?? "com";

let _asset: AssetClient | undefined;
let _lux3d: Lux3dClient | undefined;
let _world: WorldClient | undefined;

export const asset = () => (_asset ??= createAssetClient({ region }));
export const lux3d = () => (_lux3d ??= createLux3dClient({ region }));
export const world = () => (_world ??= createWorldClient({ region }));

export const hasKey = () => Boolean(process.env.AHOLO_API_KEY);

/** Furniture prompt template (docs/06 §1). */
export function furniturePrompt(description: string) {
  return `${description.trim()}, realistic furniture product model, real-world proportions, clean geometry, single object, centered, no background, no people, no text, no logos`;
}

// Default mesh budget: real-time friendly. Lux3D has no separate retopology
// endpoint in SDK 1.10; the face budget is set at generation time.
export const FACE_COUNT = 40_000;

export async function textTo3d(prompt: string, opts: { img?: string } = {}) {
  return lux3d().textTo3d.create({
    prompt: furniturePrompt(prompt),
    style: "photorealistic",
    version: "G1-Turbo",
    faceCount: FACE_COUNT,
    outputFormat: ["glb"],
    enablePbr: true,
    aiPredictSize: true,
    ...(opts.img ? { img: opts.img } : {}),
  });
}

export async function imgTo3d(img: string) {
  return lux3d().imgTo3d.create({
    img,
    version: "G1-Turbo",
    faceCount: FACE_COUNT,
    outputFormat: ["glb"],
    enablePbr: true,
    aiPredictSize: true,
  });
}

export async function materialTransfer(meshUrl: string, img: string) {
  return lux3d().materialTransfer.create({
    img,
    meshUrl,
    version: "v3.0-standard",
    outputFormat: ["glb"],
  });
}

export const articulate = (glbUrl: string, prompt: string) =>
  lux3d().articulationAnimation.create({ glbUrl, prompt });

export const partSplit = (glbUrl: string) => lux3d().partSplit.create({ glbUrl });

export type ExportFormat = "usdz" | "obj_zip" | "fbx_zip" | "stl" | "3mf";
export const multiExport = (modelUrl: string, outputFormat: ExportFormat[]) =>
  lux3d().multiFormatExport.create({ modelUrl, outputFormat });

export type TaskState = "queued" | "running" | "done" | "failed";

export async function getTask(taskId: string | number) {
  const r = await lux3d().tasks.retrieve(taskId);
  const state: TaskState =
    r.status === 3 ? "done" : r.status === 4 || r.status === 6 ? "failed" : r.status === 1 ? "running" : "queued";
  const urls = r.outputs
    .map((o) => o.content ?? "")
    .filter((c) => c && c !== "NOT_REQUESTED" && c !== "null");
  return { taskId: r.taskId, state, urls };
}

/** Outputs are positional and may contain JSON arrays; select by extension. */
export function pickUrl(urls: string[], ext: string) {
  const e = ext.toLowerCase();
  return urls.find((u) => u.split("?")[0].toLowerCase().endsWith(`.${e}`));
}

export async function uploadBuffer(data: Buffer, filename: string) {
  const r = await asset().uploadBuffer(data, { filename });
  return r.url;
}

export const getUploadToken = () => asset().getUploadToken();

export async function reconstruct(name: string, url: string, type: "video" | "image" | "insv") {
  const r = await world().reconstructions.create({
    name,
    resources: [{ url, type }],
    taskQuality: "normal",
    scene: "space",
  });
  return r.worldId as string;
}

export async function generateWorld(prompt: string, imageUrl?: string) {
  const r = await world().generations.create({
    name: prompt.slice(0, 40),
    prompt,
    ...(imageUrl ? { resources: [{ url: imageUrl, type: "image" as const }] } : {}),
  });
  return r.worldId as string;
}

export async function getWorld(worldId: string) {
  const d = await world().retrieve(worldId);
  const urls = d.assets?.splats?.urls;
  return {
    worldId: d.worldId,
    status: d.status,
    progress: d.progress ?? null,
    spz: urls?.spzPath ?? null,
    ply: urls?.plyPath ?? null,
    lodMeta: urls?.lodMetaPath ?? null,
    pano: d.assets?.imagery?.panoUrl ?? null,
  };
}
