// Renders transparent-background WebP thumbnails of GLB models with <model-viewer> in headless Chromium.
//   node --experimental-strip-types scripts/render-thumbs.mts [baseUrl]
// Needs the dev server (models are loaded from it). Writes:
//   public/library/thumbs/<ID>.webp        library models (used by the studio and the landing gallery)
//   public/site/hero/thumbs/<name>.webp    the hero chair finishes and parts
//   public/library/variants/thumbs/<file>.webp  restyled finishes
import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const base = process.argv[2] ?? "http://localhost:3100";
const library = JSON.parse(readFileSync("content/library.json", "utf8")) as { id: string; category: string }[];
const manifest = JSON.parse(readFileSync("content/manifest.json", "utf8")) as { variants: Record<string, Record<string, string>> };

const jobs: { src: string; out: string; orbit: string }[] = [
  ...library.map((l) => ({ src: `/library/${l.id}.glb`, out: `public/library/thumbs/${l.id}.webp`, orbit: l.category === "textile" ? "30deg 25deg 105%" : "35deg 75deg 105%" })),
  ...["chair", "chair-leather", "chair-linen", "chair-boucle", "chair-parts"].map((n) => ({ src: `/site/hero/${n}.glb`, out: `public/site/hero/thumbs/${n}.webp`, orbit: "-30deg 78deg 105%" })),
  ...Object.values(manifest.variants).flatMap((v) => Object.values(v)).map((src) => ({ src, out: `public/library/variants/thumbs/${src.split("/").pop()!.replace(".glb", ".webp")}`, orbit: "35deg 75deg 105%" })),
];

const browser = await chromium.launch({ args: ["--use-gl=angle", "--enable-gpu"] });
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
await page.goto(base + "/site/review.html"); // a static HTML page on the same origin as the models, so their fetches aren't cross-origin
await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}model-viewer{width:512px;height:512px;--poster-color:transparent}</style>
<script>self.ModelViewerElement = { meshoptDecoderLocation: "https://cdn.jsdelivr.net/npm/meshoptimizer@0.21.0/meshopt_decoder.js" };</script>
<script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js"></script>
<model-viewer id="mv" environment-image="neutral" exposure="1.05" shadow-intensity="1" shadow-softness="0.9" interaction-prompt="none"></model-viewer>`);
await page.waitForFunction(() => customElements.get("model-viewer"));

let done = 0;
for (const j of jobs) {
  const data = await page.evaluate(
    async ({ src, orbit }) => {
      const mv = document.getElementById("mv") as HTMLElement & { src: string; cameraOrbit: string; toDataURL(t: string, q: number): string; updateComplete: Promise<void> };
      const loaded = new Promise((r, x) => {
        mv.addEventListener("load", r, { once: true });
        mv.addEventListener("error", () => x(new Error("load failed: " + src)), { once: true });
        setTimeout(() => x(new Error("timeout: " + src)), 60_000);
      });
      mv.cameraOrbit = orbit;
      mv.src = src;
      await loaded;
      await new Promise((r) => setTimeout(r, 400));
      return mv.toDataURL("image/webp", 0.9);
    },
    { src: base + j.src, orbit: j.orbit },
  );
  if (done === 0) console.log("first thumbnail rendered");
  mkdirSync(dirname(j.out), { recursive: true });
  writeFileSync(j.out, Buffer.from(data.split(",")[1], "base64"));
  done++;
}
console.log(`rendered ${done} thumbnails`);
await browser.close();
