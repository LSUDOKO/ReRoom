/**
 * Pre-generate the seed furniture library with Aholo Lux3D.
 *   text-to-3D (G1-Turbo, PBR, 40k faces) -> download GLB -> optimize
 *   -> articulation (items with an `articulate` prompt) -> URDF zip -> unzip -> optimize parts
 * Resumable: items already present in public/library are skipped.
 *
 *   tsx --env-file=.env.local scripts/seed-library.mts                 # all items
 *   tsx --env-file=.env.local scripts/seed-library.mts L_WARDROBE ...  # only these ids
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { unzipSync } from "fflate";
import { articulate, getTask, pickUrl, textTo3d } from "../src/lib/aholo/server.ts";

type Item = { id: string; name: string; prompt: string; articulate?: string };
const OUT = "public/library";
const LOCK = "content/library.lock.json";
const CONCURRENCY = Number(process.env.AHOLO_MAX_CONCURRENCY ?? 2);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitTask(id: number, label: string) {
  const started = Date.now();
  for (;;) {
    const t = await getTask(id);
    if (t.state === "done") return t.urls;
    if (t.state === "failed") throw new Error(`${label}: task ${id} failed`);
    if (Date.now() - started > 20 * 60_000) throw new Error(`${label}: timeout`);
    await sleep(10_000);
  }
}

async function fetchBytes(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

/** 1024px JPEG textures: ~7 MB -> ~1 MB per model, same geometry. */
export function optimize(path: string) {
  const tmp = `${path}.tmp.glb`;
  execFileSync("gltf-transform", ["resize", path, tmp, "--width", "1024", "--height", "1024"], { stdio: "ignore" });
  execFileSync("gltf-transform", ["jpeg", tmp, path, "--formats", "*", "--quality", "85"], { stdio: "ignore" });
  execFileSync("rm", ["-f", tmp]);
}

/** Articulation output is a zip: urdf/robot.urdf + urdf/meshes/*.glb */
export async function saveUrdfZip(zip: Uint8Array, dir: string) {
  const files = unzipSync(zip);
  mkdirSync(join(dir, "meshes"), { recursive: true });
  for (const [name, data] of Object.entries(files)) {
    const rel = name.replace(/^urdf\//, "");
    if (!rel || rel.endsWith("/")) continue;
    await writeFile(join(dir, rel), data);
  }
  for (const f of await readdir(join(dir, "meshes"))) if (f.endsWith(".glb")) optimize(join(dir, "meshes", f));
}

/** Concurrency-limit errors create no task and cost nothing: back off and retry. */
async function create(fn: () => Promise<number>, label: string) {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i >= 8) throw e;
      console.log(`  ${label}: create failed (${(e as Error).message}); retry in ${15 * (i + 1)}s`);
      await sleep(15_000 * (i + 1));
    }
  }
}

async function run(item: Item, lock: Record<string, Record<string, unknown>>) {
  const base = `${OUT}/${item.id}.glb`;
  const urdfDir = `${OUT}/${item.id}`;
  lock[item.id] ??= {};
  let glbUrl = lock[item.id].glbUrl as string | undefined;
  if (!existsSync(base)) {
    const id = await create(() => textTo3d(item.prompt), item.id);
    console.log(`${item.id}: text-to-3d task ${id}`);
    const urls = await waitTask(id, item.id);
    glbUrl = pickUrl(urls, "glb");
    if (!glbUrl) throw new Error(`${item.id}: no glb in ${urls.join(",")}`);
    await writeFile(base, await fetchBytes(glbUrl));
    optimize(base);
    Object.assign(lock[item.id], { textTask: id, glbUrl, at: Date.now() });
    console.log(`${item.id}: saved ${base}`);
  }
  if (item.articulate && !existsSync(`${urdfDir}/robot.urdf`)) {
    // Source URLs expire after ~2 h; re-generate rather than chain a stale URL.
    if (!glbUrl || Date.now() - Number(lock[item.id].at ?? 0) > 90 * 60_000)
      return console.log(`${item.id}: source url stale, delete ${base} to regenerate with articulation`);
    const id = await create(() => articulate(glbUrl!, item.articulate!), `${item.id}/articulate`);
    console.log(`${item.id}: articulation task ${id}`);
    const urls = await waitTask(id, `${item.id}/articulate`);
    const zip = pickUrl(urls, "zip");
    if (!zip) throw new Error(`${item.id}: no articulation zip in ${urls.join(",")}`);
    await saveUrdfZip(await fetchBytes(zip), urdfDir);
    Object.assign(lock[item.id], { articulateTask: id });
    console.log(`${item.id}: saved ${urdfDir}/robot.urdf`);
  }
}

async function main() {
  const all: Item[] = JSON.parse(await readFile("content/library.json", "utf8"));
  const only = process.argv.slice(2);
  const queue = all.filter((i) => only.length === 0 || only.includes(i.id));
  const lock = existsSync(LOCK) ? JSON.parse(await readFile(LOCK, "utf8")) : {};
  const save = () => writeFile(LOCK, JSON.stringify(lock, null, 2));

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let item; (item = queue.shift()); ) {
        try {
          await run(item, lock);
        } catch (e) {
          console.error(`FAILED ${item.id}: ${(e as Error).message}`);
        }
        await save();
      }
    }),
  );
  console.log("seed done");
}

if (import.meta.url === `file://${process.argv[1]}`) main();
