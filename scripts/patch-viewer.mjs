// Aholo Viewer spawns its workers via `new URL("./x-worker.js", import.meta.url)`,
// which Next's bundlers rewrite to a URL the blob-module worker can't import.
// Serve the (self-contained) worker files from /aholo/ instead. Idempotent.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const dist = "node_modules/@manycore/aholo-viewer/dist";
const workers = ["splat-worker.js", "splat-sort-worker.js", "transcoder-worker.js"];
mkdirSync("public/aholo", { recursive: true });
for (const w of workers) copyFileSync(join(dist, w), join("public/aholo", w));

const file = join(dist, "index.js");
let src = readFileSync(file, "utf8");
for (const w of workers) {
  src = src.replaceAll(`new URL("./${w}", import.meta.url)`, `new URL("/aholo/${w}", self.location.origin)`);
}
writeFileSync(file, src);
console.log("aholo-viewer workers patched -> /aholo/");
