// Start a SpatialGen dream room and print its worldId:
//   tsx --env-file=.env.local scripts/gen-world.ts "<prompt>"
import { generateWorld, getWorld } from "../src/lib/aholo/server.ts";

async function main() {
  const prompt =
    process.argv[2] ?? "a cozy Japandi studio apartment with large windows, warm afternoon light, wooden floor";
  const id = await generateWorld(prompt);
  console.log("worldId", id, JSON.stringify(await getWorld(id)));
}
main();
