// tsx --env-file=.env.local scripts/world-status.mts <worldId>
import { getWorld } from "../src/lib/aholo/server.ts";
console.log(JSON.stringify(await getWorld(process.argv[2]), null, 1));
