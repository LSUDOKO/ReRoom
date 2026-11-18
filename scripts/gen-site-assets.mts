// Generates the website's 3D assets with Aholo, following content/site-assets.json.
//
//   tsx --env-file=.env.local scripts/gen-site-assets.mts hero            # one group
//   tsx --env-file=.env.local scripts/gen-site-assets.mts H_CHAIR_LINEN   # one asset
//   tsx --env-file=.env.local scripts/gen-site-assets.mts --reroll H_CHAIR --prompt "..."
//
// Resumable: finished steps are recorded in content/site-assets.lock.json. Results are downloaded
// right away (Aholo URLs expire after about 2 h) into assets-raw/, then optimized for the web into
// public/<out> (meshoptimizer simplify to the triangle budget, WebP textures, meshopt compression).
// Writes public/site/review.html: a turntable of every generated model to check before using it.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getTask, lux3d, materialTransfer, multiExport, partSplit, uploadBuffer } from "../src/lib/aholo/server.ts";
import { toAholoUrl } from "../src/lib/aholo/public-url.ts";

type Asset = {
  id: string;
  group: string;
  capability: string;
  op?: "text" | "split" | "transfer" | "export" | "pending";
  prompt?: string;
  version?: "G1" | "G1-Turbo";
  style?: "photorealistic" | "cartoon";
  faceCount?: number;
  input?: string;
  ref?: string;
  format?: "usdz";
  out?: string;
  existing?: string;
  web?: { tris: number; texture: number };
};
type Lock = Record<string, { status: "done" | "failed" | "running"; taskId?: number; raw?: string; out?: string; tris?: number; bytes?: number; prompt?: string; at: string }>;

const MANIFEST = "content/site-assets.json";
const LOCK = "content/site-assets.lock.json";
const RAW = "assets-raw";
const CONCURRENCY = Number(process.env.AHOLO_MAX_CONCURRENCY ?? 2);

const assets: Asset[] = JSON.parse(readFileSync(MANIFEST, "utf8")).assets;
const lock: Lock = existsSync(LOCK) ? JSON.parse(readFileSync(LOCK, "utf8")) : {};
const saveLock = () => writeFileSync(LOCK, JSON.stringify(lock, null, 2) + "\n");

const args = process.argv.slice(2);
const reroll = args.includes("--reroll") ? args[args.indexOf("--reroll") + 1] : undefined;
const newPrompt = args.includes("--prompt") ? args[args.indexOf("--prompt") + 1] : undefined;
const wanted = new Set(args.filter((a, i) => !a.startsWith("--") && !["--reroll", "--prompt"].includes(args[i - 1])));
if (reroll) wanted.add(reroll);
const selected = assets.filter((a) => wanted.has(a.id) || wanted.has(a.group));
if (!selected.length) {
  console.log("Usage: gen-site-assets.mts <group|id...>  groups:", [...new Set(assets.map((a) => a.group))].join(", "));
  process.exit(1);
}
if (reroll) delete lock[reroll];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitTask(id: number, label: string) {
  const t0 = Date.now();
  for (;;) {
    const t = await getTask(id);
    if (t.state === "done") return t.urls;
    if (t.state === "failed") throw new Error(`${label}: task ${id} failed`);
    process.stdout.write(`\r${label}: ${t.state} ${Math.round((Date.now() - t0) / 1000)}s   `);
    await sleep(12_000);
  }
}

async function download(url: string, file: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

/** Aholo-fetchable URL for an earlier step's raw output (uploaded fresh: asset URLs are temporary). */
async function inputUrl(id: string) {
  const raw = lock[id]?.raw;
  if (!raw || !existsSync(raw)) throw new Error(`${id} has no raw output yet`);
  return uploadBuffer(readFileSync(raw), raw.split("/").pop()!);
}

const gt = (...a: string[]) => execFileSync("npx", ["gltf-transform", ...a], { stdio: "pipe" }).toString();

function triangles(file: string) {
  const out = gt("inspect", file, "--format", "csv");
  // the MESHES csv block has an `indices` column; sum glPrimitives as a fallback-free estimate
  const meshes = out.split("\n").filter((l) => /TRIANGLES/.test(l));
  return meshes.reduce((n, l) => n + Number(l.split(",")[4]?.replace(/\D/g, "") || 0), 0);
}

function optimize(raw: string, out: string, web: { tris: number; texture: number }, keepParts = false) {
  mkdirSync(dirname(out), { recursive: true });
  const tris = triangles(raw);
  const ratio = Math.min(1, web.tris / Math.max(1, tris)).toFixed(4);
  const tmp = `${out}.tmp.glb`;
  gt("optimize", raw, tmp, "--simplify-ratio", ratio, "--simplify-error", "0.002", "--texture-size", String(web.texture), "--texture-compress", "webp", "--compress", "false", ...(keepParts ? ["--join", "false", "--flatten", "false"] : []));
  gt("meshopt", tmp, out);
  execFileSync("rm", ["-f", tmp]);
  return { tris: triangles(out), bytes: readFileSync(out).length };
}

async function run(a: Asset) {
  if (lock[a.id]?.status === "done") return console.log(`✓ ${a.id} (cached)`);
  if (a.existing) {
    lock[a.id] = { status: "done", out: a.existing, at: new Date().toISOString() };
    return console.log(`✓ ${a.id} reuses ${a.existing}`);
  }
  if (a.op === "pending" || !a.op) return console.log(`… ${a.id}: pending (${(a as { note?: string }).note ?? "manual"})`);

  let taskId: number;
  const prompt = a.id === reroll && newPrompt ? newPrompt : a.prompt;
  if (lock[a.id]?.status === "running" && lock[a.id].taskId) taskId = lock[a.id].taskId!; // resume, don't pay twice
  else if (a.op === "text")
    taskId = await lux3d().textTo3d.create({
      prompt: prompt!,
      style: a.style ?? "photorealistic",
      version: a.version ?? "G1-Turbo",
      faceCount: a.faceCount ?? 40_000,
      outputFormat: ["glb"],
      enablePbr: true,
      aiPredictSize: true,
    });
  else if (a.op === "split") taskId = await partSplit(await inputUrl(a.input!));
  else if (a.op === "transfer") {
    // licensed references live outside /public (not served by the site); upload them directly
    const ref = a.ref!.startsWith("content/") ? await uploadBuffer(readFileSync(a.ref!), a.ref!.split("/").pop()!) : await toAholoUrl(a.ref!);
    taskId = await materialTransfer(await inputUrl(a.input!), ref);
  }
  else taskId = await multiExport(await inputUrl(a.input!), [a.format!]);
  console.log(`→ ${a.id}: task ${taskId} (${a.capability})`);
  lock[a.id] = { status: "running", taskId, prompt, at: new Date().toISOString() };
  saveLock();

  try {
    const urls = await waitTask(taskId, a.id);
    const ext = a.op === "export" ? a.format! : "glb";
    const url = urls.find((u) => u.split("?")[0].toLowerCase().endsWith(`.${ext}`)) ?? urls[0];
    const raw = await download(url, join(RAW, `${a.id}.${ext}`));
    const out = join("public", a.out!);
    const stats = a.web ? optimize(raw, out, a.web, a.op === "split") : (mkdirSync(dirname(out), { recursive: true }), writeFileSync(out, readFileSync(raw)), { bytes: readFileSync(raw).length });
    lock[a.id] = { status: "done", taskId, raw, out: `/${a.out}`, prompt, ...stats, at: new Date().toISOString() };
    console.log(`\n✓ ${a.id} → /${a.out} ${JSON.stringify(stats)}`);
  } catch (e) {
    // a failed task is final; anything else (network, download) keeps the task resumable
    if (/task \d+ failed/.test((e as Error).message)) lock[a.id] = { status: "failed", taskId, at: new Date().toISOString() };
    console.log(`\n✗ ${a.id}: ${(e as Error).message}`);
  } finally {
    saveLock();
  }
}

// dependency order: an asset runs once its input is done; up to CONCURRENCY at a time
const pending = [...selected];
const running = new Set<Promise<void>>();
while (pending.length || running.size) {
  const i = pending.findIndex((a) => !a.input || lock[a.input]?.status === "done" || !selected.some((s) => s.id === a.input));
  if (i >= 0 && running.size < CONCURRENCY) {
    const p: Promise<void> = run(pending.splice(i, 1)[0]).finally(() => running.delete(p));
    running.add(p);
    continue;
  }
  if (!running.size) {
    console.log("Blocked:", pending.map((a) => `${a.id} (needs ${a.input})`).join(", "));
    break;
  }
  await Promise.race(running);
}
saveLock();

// review page: a turntable of every generated GLB
const rows = assets
  .filter((a) => lock[a.id]?.status === "done" && /\.glb$/.test(lock[a.id].out ?? ""))
  .map((a) => {
    const l = lock[a.id];
    const meta = [a.capability, l.tris ? `${l.tris.toLocaleString()} tris` : "", l.bytes ? `${(l.bytes / 1e6).toFixed(2)} MB` : ""].filter(Boolean).join(" · ");
    return `<figure><model-viewer src="${l.out}" auto-rotate camera-controls shadow-intensity="1" exposure="1.1"></model-viewer><figcaption><b>${a.id}</b><br>${meta}${l.prompt ? `<br><i>${l.prompt}</i>` : ""}</figcaption></figure>`;
  })
  .join("\n");
mkdirSync("public/site", { recursive: true });
writeFileSync(
  "public/site/review.html",
  `<!doctype html><meta charset="utf-8"><title>ReRoom site assets review</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<script>self.ModelViewerElement = { meshoptDecoderLocation: "https://cdn.jsdelivr.net/npm/meshoptimizer@0.21.0/meshopt_decoder.js" };</script>
<script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js"></script>
<style>body{font:300 15px Outfit,system-ui,sans-serif;background:#050712;color:#f1f2f6;margin:32px}h1{font-weight:600;letter-spacing:-.03em;font-size:40px;margin:0 0 4px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-top:24px}figure{margin:0;border-radius:20px;padding:12px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}model-viewer{width:100%;height:300px;background:radial-gradient(closest-side,#1b2a5c,#050712);border-radius:14px}figcaption{padding-top:10px;line-height:1.45;color:#9aa0b4}figcaption b{font:500 12px "JetBrains Mono",monospace;letter-spacing:.06em;color:#fff}</style>
<h1>Site assets review</h1><p>Every model below was generated with Aholo Lux3D for the ReRoom website.</p><main>${rows}</main>`,
);
console.log("Review page: /site/review.html");
