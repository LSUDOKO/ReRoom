"use client";
import manifest from "../../content/manifest.json";
import {
  ARTICULATION_PROMPTS,
  CATEGORY_DIMS,
  CATEGORY_SLOT,
  guessCategory,
  libraryAsset,
  materialPath,
  STYLES,
  type Category,
  type LibraryItem,
} from "./catalog";
import { createTask, loadArticulationZip, pick, waitTask } from "./api";
import { uid, useStudio, type Item } from "./store";

const PREBAKED = manifest.variants as Record<string, Record<string, string>>; // libId -> styleId -> glb

const st = () => useStudio.getState();

export function libraryItem(lib: LibraryItem, position: [number, number, number], hasUrdf: boolean): Item {
  const a = libraryAsset(lib.id);
  return {
    uid: uid(),
    name: lib.name,
    category: lib.category,
    libId: lib.id,
    origin: "library",
    status: "ready",
    glb: a.glb,
    urdf: hasUrdf ? { kind: "urdf", base: a.urdf } : undefined,
    meshRef: a.glb,
    variants: { ...(PREBAKED[lib.id] ?? {}) },
    position,
    yaw: 0,
    height: lib.category === "textile" ? Math.max(lib.dims.w, lib.dims.d) : lib.dims.h,
    open: false,
  };
}

const titleFrom = (prompt: string) => {
  const t = prompt.replace(/^(a|an|the)\s+/i, "").split(/[,.]/)[0].trim();
  return t.charAt(0).toUpperCase() + t.slice(1, 40);
};

/** Text or photo → Lux3D → (optional) articulation. Shows a ghost immediately. */
export async function generate(
  input: { prompt?: string; image?: string; name?: string; category?: Category; articulate?: boolean },
  position: [number, number, number],
) {
  const category = input.category ?? guessCategory(input.prompt ?? input.name ?? "");
  const item: Item = {
    uid: uid(),
    name: input.name ?? (input.prompt ? titleFrom(input.prompt) : "Photo item"),
    category,
    prompt: input.prompt,
    origin: input.image ? "photo" : "text",
    status: "generating",
    progress: 0.02,
    variants: {},
    position,
    yaw: 0,
    height: category === "textile" ? CATEGORY_DIMS[category].w : CATEGORY_DIMS[category].h,
    open: false,
  };
  st().commit((items) => [...items, item]);
  st().select(item.uid);
  const patch = (p: Partial<Item>) => st().patch(item.uid, p);

  try {
    const { taskId, note } = input.image
      ? await createTask("image", { image: input.image })
      : await createTask("text", { prompt: input.prompt });
    if (note) st().notify(note);
    patch({ taskId });
    const res = await waitTask(taskId, 70, (p) => patch({ progress: p * (input.articulate ? 0.6 : 1) }));
    const glb = pick(res.urls, "glb");
    if (!glb) throw new Error("Lux3D returned no model.");
    patch({ status: "ready", glb, meshRef: glb, progress: undefined });
    st().notify(`${item.name} is ready.`, "magic");
    if (input.articulate) await makeArticulated(item.uid);
  } catch (e) {
    patch({ status: "failed", error: (e as Error).message, progress: undefined });
    st().notify((e as Error).message, "error");
  }
}

/** Run Lux3D articulation on an item so its doors / drawers / lid can move. */
export async function makeArticulated(itemUid: string, prompt?: string) {
  const item = st().items.find((i) => i.uid === itemUid);
  if (!item?.meshRef) return;
  const patch = (p: Partial<Item>) => st().patch(itemUid, p);
  try {
    patch({ progress: 0.05 });
    const { taskId } = await createTask("articulate", {
      mesh: item.meshRef,
      prompt: prompt ?? ARTICULATION_PROMPTS[item.category] ?? "the doors and drawers open",
    });
    const res = await waitTask(taskId, 90, (p) => patch({ progress: p }));
    const zip = pick(res.urls, "zip");
    if (!zip) throw new Error("Articulation returned no joint data.");
    patch({ urdf: await loadArticulationZip(zip), progress: undefined });
    st().notify(`${item.name} now opens. Double-click it.`, "magic");
  } catch (e) {
    patch({ progress: undefined });
    st().notify(`Couldn't add moving parts: ${(e as Error).message}`, "error");
  }
}

// ponytail: one restyle run at a time; a second click waits for the first to finish.
let restyling: Promise<void> = Promise.resolve();

/** Apply a style to every placed item via Lux3D material transfer (cached per item × style). */
export function applyStyle(styleId: string | null) {
  st().setStyle(styleId);
  if (!styleId) return;
  const style = STYLES.find((s) => s.id === styleId)!;
  const todo = st().items.filter((i) => i.status === "ready" && !i.variants[styleId] && i.meshRef);
  if (!todo.length) return st().notify(`${style.name} applied.`, "magic");
  if (!st().live) return st().notify(`${style.name} needs live generation for items without a cached finish.`);
  st().notify(`Restyling ${todo.length} item${todo.length > 1 ? "s" : ""} in ${style.name}…`, "magic");
  restyling = restyling.then(() => runTransfers(todo, styleId));
}

async function runTransfers(todo: Item[], styleId: string) {
  const queue = [...todo];
  const worker = async () => {
    for (let it; (it = queue.shift()); ) {
      const patch = (p: Partial<Item>) => st().patch(it!.uid, p);
      try {
        patch({ pendingStyle: styleId, progress: 0.05 });
        const { taskId } = await createTask("transfer", {
          mesh: it.meshRef,
          material: materialPath(styleId, CATEGORY_SLOT[it.category]),
        });
        const res = await waitTask(taskId, 60, (p) => patch({ progress: p }));
        const glb = pick(res.urls, "glb");
        if (!glb) throw new Error("no model");
        const cur = st().items.find((i) => i.uid === it!.uid);
        patch({ variants: { ...(cur?.variants ?? {}), [styleId]: glb }, pendingStyle: undefined, progress: undefined });
      } catch (e) {
        patch({ pendingStyle: undefined, progress: undefined });
        st().notify(`Couldn't restyle ${it.name}: ${(e as Error).message}`, "error");
      }
    }
  };
  await Promise.all([worker(), worker()]);
}

/** Restyle one item from any material photo (docs D3). */
export async function materialFromPhoto(itemUid: string, image: string) {
  const it = st().items.find((i) => i.uid === itemUid);
  if (!it?.meshRef) return;
  const key = `custom-${Date.now()}`;
  const patch = (p: Partial<Item>) => st().patch(itemUid, p);
  try {
    patch({ pendingStyle: key, progress: 0.05 });
    const { taskId } = await createTask("transfer", { mesh: it.meshRef, material: image });
    const res = await waitTask(taskId, 60, (p) => patch({ progress: p }));
    const glb = pick(res.urls, "glb");
    if (!glb) throw new Error("no model");
    // a custom finish becomes the item's new base mesh
    patch({ glb, meshRef: glb, urdf: undefined, variants: {}, pendingStyle: undefined, progress: undefined });
    st().notify(`${it.name} has its new finish.`, "magic");
  } catch (e) {
    patch({ pendingStyle: undefined, progress: undefined });
    st().notify(`Couldn't apply that material: ${(e as Error).message}`, "error");
  }
}

/** Lux3D multi-format export (USDZ / STL / 3MF / OBJ / FBX) for one item. */
export async function exportItem(itemUid: string, format: "usdz" | "stl" | "3mf" | "obj_zip" | "fbx_zip") {
  const it = st().items.find((i) => i.uid === itemUid);
  if (!it?.meshRef) return null;
  const { taskId } = await createTask("export", { mesh: it.meshRef, formats: [format] });
  const res = await waitTask(taskId, 40);
  return pick(res.urls, format.endsWith("_zip") ? "zip" : format) ?? null;
}
