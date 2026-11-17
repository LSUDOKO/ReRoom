// Download CC0 material reference swatches (ambientCG) used by Lux3D material transfer.
// public/materials/{style}_{slot}.jpg
import { writeFile } from "node:fs/promises";
const Q = {
  japandi:   { wood: ["Wood", 3], fabric: ["Fabric", 0], metal: ["Metal", 15], stone: ["Wicker", 0] },
  scandi:    { wood: ["Wood", 8], fabric: ["Fabric", 4], metal: ["Metal", 22], stone: ["Tiles", 0] },
  industrial:{ wood: ["Wood", 20], fabric: ["Leather", 0], metal: ["Metal", 4], stone: ["Concrete", 0] },
  midcentury:{ wood: ["Wood", 1], fabric: ["Fabric", 8], metal: ["Metal", 0], stone: ["Terrazzo", 0] },
  boho:      { wood: ["Wicker", 1], fabric: ["Fabric", 12], metal: ["Metal", 9], stone: ["Bricks", 0] },
  cyberpunk: { wood: ["Plastic", 0], fabric: ["Leather", 3], metal: ["Metal", 1], stone: ["Plastic", 3] },
  coastal:   { wood: ["Wood", 14], fabric: ["Fabric", 20], metal: ["Metal", 6], stone: ["Ground", 0] },
  luxury:    { wood: ["Wood", 30], fabric: ["Fabric", 16], metal: ["Metal", 12], stone: ["Marble", 0] },
};
const cache = {};
async function list(q) {
  return (cache[q] ??= fetch(`https://ambientcg.com/api/v2/full_json?q=${q}&limit=40&include=imageData`).then((r) => r.json()).then((d) => d.foundAssets));
}
const credits = [];
for (const [style, slots] of Object.entries(Q))
  for (const [slot, [q, i]] of Object.entries(slots)) {
    const assets = await list(q);
    const a = assets[i % assets.length];
    const url = a.previewImage["1024-JPG-FFFFFF"];
    await writeFile(`public/materials/${style}_${slot}.jpg`, Buffer.from(await (await fetch(url)).arrayBuffer()));
    credits.push(`${style}_${slot}.jpg: ambientCG ${a.assetId} (CC0)`);
    console.log(style, slot, a.assetId);
  }
await writeFile("public/materials/CREDITS.txt", credits.join("\n") + "\n");
