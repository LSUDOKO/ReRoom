// Screenshots of the landing page, one per section, for review and the README.
//   node --experimental-strip-types scripts/capture.mts [baseUrl] [outDir] [width] [height] [dpr]
// Waits for the 3D hero, then scrolls each section's keyframe stop to the middle of the viewport.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [base = "http://localhost:3100", out = "tmp/shots", w = "1440", h = "900", dpr = "1"] = process.argv.slice(2);
const SECTIONS = ["hero", "scan", "remix", "alive", "styles", "assets", "pricing", "ar", "aholo", "faq", "cta"];

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--enable-gpu"] });
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: Number(dpr) });
const errors: string[] = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 140)));
page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
await page.goto(base + "/", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.documentElement.dataset.hero === "ready", null, { timeout: 120_000 }).catch(() => errors.push("hero never ready"));
await page.waitForTimeout(3000);
for (const id of SECTIONS) {
  await page.evaluate((id) => {
    const el = document.getElementById(id + "-stop") ?? document.getElementById(id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    window.scrollTo(0, id === "hero" ? 0 : r.top + scrollY + Math.min(r.height, innerHeight) / 2 - innerHeight / 2);
  }, id);
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${out}/${w}-${id}.png` });
}
const fps = await page.evaluate(
  () => new Promise<number>((r) => { let n = 0; const t = performance.now(); const f = () => { n++; if (performance.now() - t < 2000) requestAnimationFrame(f); else r(Math.round(n / 2)); }; requestAnimationFrame(f); }),
);
console.log(JSON.stringify({ fps, errors }));
await browser.close();
