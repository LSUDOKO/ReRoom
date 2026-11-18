// Records the README GIFs and screenshots from a running app (demo mode; Lux3D POSTs are aborted,
// so recording never spends credits).
//   node --experimental-strip-types scripts/record-readme.mts [baseUrl]
// Needs ffmpeg. Writes .github/readme/*.gif and *.webp.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { chromium, type Page } from "playwright";

const base = process.argv[2] ?? "http://localhost:3100";
const skip = new Set((process.argv[3] ?? "").split(",").filter(Boolean)); // e.g. "landing" to keep an existing GIF
const OUT = ".github/readme";
const TMP = "tmp/rec";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=angle", "--enable-gpu"] });

async function record(name: string, w: number, h: number, run: (p: Page) => Promise<void>, gifWidth = 960, fps = 14) {
  rmSync(TMP, { recursive: true, force: true });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, recordVideo: { dir: TMP, size: { width: w, height: h } } });
  await ctx.addInitScript(() => localStorage.setItem("reroom:onboarded", "1"));
  await ctx.route("**/api/lux3d", (r) => (r.request().method() === "POST" ? r.abort() : r.continue()));
  const p = await ctx.newPage();
  await run(p);
  await ctx.close();
  const video = `${TMP}/${readdirSync(TMP).find((f) => f.endsWith(".webm"))}`;
  renameSync(video, `${TMP}/v.webm`);
  // two-pass palette for clean gradients
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "1.2", "-i", `${TMP}/v.webm`, "-vf", `fps=${fps},scale=${gifWidth}:-1:flags=lanczos,palettegen=stats_mode=diff`, `${TMP}/pal.png`]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "1.2", "-i", `${TMP}/v.webm`, "-i", `${TMP}/pal.png`, "-lavfi", `fps=${fps},scale=${gifWidth}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=sierra2_4a`, `${OUT}/${name}.gif`]);
  console.log("gif", name);
}

const smoothScroll = (p: Page, to: string, ms: number) =>
  p.evaluate(
    ({ to, ms }) =>
      new Promise<void>((done) => {
        const el = document.getElementById(to + "-stop") ?? document.getElementById(to)!;
        const r = el.getBoundingClientRect();
        const from = scrollY;
        const target = r.top + scrollY + Math.min(r.height, innerHeight) / 2 - innerHeight / 2;
        const t0 = performance.now();
        const step = (t: number) => {
          const k = Math.min(1, (t - t0) / ms);
          const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          scrollTo(0, from + (target - from) * e);
          if (k < 1) requestAnimationFrame(step);
          else done();
        };
        requestAnimationFrame(step);
      }),
    { to, ms },
  );

// 1. the landing scroll story
if (!skip.has("landing")) await record("landing-scroll", 1280, 720, async (p) => {
  await p.goto(base + "/");
  await p.waitForFunction(() => document.documentElement.dataset.hero === "ready", null, { timeout: 120_000 });
  await p.waitForTimeout(3200);
  for (const id of ["scan", "remix", "alive", "styles"]) {
    await smoothScroll(p, id, 1700);
    await p.waitForTimeout(1500);
  }
  for (const m of ["Leather", "Linen", "Bouclé"]) {
    await p.getByRole("radio", { name: m }).click();
    await p.waitForTimeout(900);
  }
  for (const id of ["ar", "cta"]) {
    await smoothScroll(p, id, 2200);
    await p.waitForTimeout(1500);
  }
}, 900, 12);

// 2. studio: add a piece, open it, restyle the room
if (!skip.has("studio")) await record("studio-tour", 1280, 760, async (p) => {
  await p.goto(base + "/studio?room=industrial-loft&demo=1");
  await p.waitForTimeout(15_000);
  await p.getByRole("button", { name: /Two-door wardrobe/ }).first().click();
  await p.waitForTimeout(4500);
  const canvas = p.locator("canvas").first();
  const box = (await canvas.boundingBox())!;
  await p.mouse.dblclick(box.x + box.width / 2, box.y + box.height * 0.55);
  await p.waitForTimeout(3000);
  for (const s of ["Japandi", "Industrial", "Cyberpunk", "Original"]) {
    await p.getByRole("button", { name: s, exact: true }).first().click();
    await p.waitForTimeout(2600);
  }
  await p.getByRole("radiogroup", { name: "Camera mode" }).getByText("Top").click();
  await p.waitForTimeout(2200);
  await p.getByRole("radiogroup", { name: "Camera mode" }).getByText("Orbit").click();
  await p.waitForTimeout(1500);
}, 900, 10);

// 3. still screenshots (2x) for the README gallery
const shots = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await shots.addInitScript(() => localStorage.setItem("reroom:onboarded", "1"));
await shots.route("**/api/lux3d", (r) => (r.request().method() === "POST" ? r.abort() : r.continue()));
const s = await shots.newPage();
const snap = async (name: string) => {
  await s.screenshot({ path: `${TMP}/${name}.png` });
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", `${TMP}/${name}.png`, "-vf", "scale=1440:-1:flags=lanczos", "-quality", "86", `${OUT}/${name}.webp`]);
  console.log("shot", name);
};
await s.goto(base + "/");
await s.waitForFunction(() => document.documentElement.dataset.hero === "ready", null, { timeout: 120_000 });
await s.waitForTimeout(4000);
await snap("shot-hero");
for (const id of ["scan", "remix", "alive", "styles", "assets", "aholo", "cta"]) {
  await smoothScroll(s, id, 10);
  await s.waitForTimeout(3600);
  await snap(`shot-${id}`);
}
await s.goto(base + "/studio?room=industrial-loft&demo=1");
await s.waitForTimeout(16_000);
await snap("shot-studio");
await s.getByText("Describe", { exact: true }).first().click();
await s.waitForTimeout(800);
await snap("shot-studio-describe");
await s.goto(base + "/scan");
await s.waitForTimeout(3000);
await snap("shot-scan-page");
await s.goto(base + "/made-with-aholo");
await s.waitForTimeout(2500);
await snap("shot-made-with-aholo");
await browser.close();
