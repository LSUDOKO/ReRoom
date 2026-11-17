/**
 * Pre-bake style variants for seed items with Lux3D material transfer, so the demo restyles
 * instantly and never re-bills (docs/03 §4.3 variant cache).
 *   tsx --env-file=.env.local scripts/bake-variants.mts japandi,industrial L_ARMCHAIR L_SOFA_3 ...
 */
import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { getTask, materialTransfer, pickUrl, uploadBuffer } from "../src/lib/aholo/server.ts";
import { optimize } from "./seed-library.mts";

const SLOT: Record<string, string> = {
  seating: "fabric", bed: "fabric", textile: "fabric", table: "wood", storage: "wood",
  appliance: "metal", lighting: "metal", decor: "stone", plant: "stone",
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uploaded = new Map<string, string>();
async function up(path: string) {
  if (!uploaded.has(path)) uploaded.set(path, await uploadBuffer(await readFile(path), basename(path)));
  return uploaded.get(path)!;
}

async function main() {
  const [stylesArg, ...ids] = process.argv.slice(2);
  const styles = stylesArg.split(",");
  const lib: { id: string; category: string }[] = JSON.parse(await readFile("content/library.json", "utf8"));
  mkdirSync("public/library/variants", { recursive: true });
  const jobs = ids.flatMap((id) => styles.map((s) => ({ id, s })));
  const run = async () => {
    for (let j; (j = jobs.shift()); ) {
      const out = `public/library/variants/${j.id}.${j.s}.glb`;
      if (existsSync(out)) continue;
      try {
        const cat = lib.find((i) => i.id === j!.id)!.category;
        const [mesh, mat] = await Promise.all([up(`public/library/${j.id}.glb`), up(`public/materials/${j.s}_${SLOT[cat]}.jpg`)]);
        let task = 0;
        for (let i = 0; !task; i++) {
          try { task = await materialTransfer(mesh, mat); } catch (e) { if (i > 8) throw e; await sleep(15000); }
        }
        console.log(`${j.id}.${j.s}: task ${task}`);
        for (;;) {
          const t = await getTask(task);
          if (t.state === "failed") throw new Error("failed");
          if (t.state === "done") {
            const url = pickUrl(t.urls, "glb")!;
            await writeFile(out, Buffer.from(await (await fetch(url)).arrayBuffer()));
            optimize(out);
            console.log(`${j.id}.${j.s}: saved`);
            break;
          }
          await sleep(8000);
        }
      } catch (e) {
        console.error(`FAILED ${j.id}.${j.s}: ${(e as Error).message}`);
      }
    }
  };
  await Promise.all([run(), run()]);
  console.log("bake done");
}
main();
