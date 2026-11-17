// Scan public/library and write content/manifest.json: which seed items exist,
// which ship articulation (URDF), thumbnails, and pre-baked style variants.
import { existsSync, readdirSync, writeFileSync } from "node:fs";
const dir = "public/library";
const files = existsSync(dir) ? readdirSync(dir) : [];
const glb = files.filter((f) => /^L_[A-Z0-9_]+\.glb$/.test(f)).map((f) => f.slice(0, -4));
const urdf = glb.filter((id) => existsSync(`${dir}/${id}/robot.urdf`));
const thumbs = glb.filter((id) => existsSync(`${dir}/thumbs/${id}.webp`));
const variants = {};
for (const f of existsSync(`${dir}/variants`) ? readdirSync(`${dir}/variants`) : []) {
  const m = f.match(/^(L_[A-Z0-9_]+)\.([a-z]+)\.glb$/);
  if (m) (variants[m[1]] ??= {})[m[2]] = `/library/variants/${f}`;
}
writeFileSync("content/manifest.json", JSON.stringify({ glb, urdf, thumbs, variants }, null, 2) + "\n");
console.log(`manifest: ${glb.length} models, ${urdf.length} articulated, ${thumbs.length} thumbs, ${Object.keys(variants).length} restyled`);
