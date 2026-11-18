// OpenNext copies .env / .env.local into the Worker bundle (.open-next/cloudflare/next-env.mjs).
// ReRoom's server config comes from wrangler vars and secrets instead, so the local key never ships.
import { writeFileSync } from "node:fs";

writeFileSync(
  ".open-next/cloudflare/next-env.mjs",
  ["production", "development", "test"].map((m) => `export const ${m} = {};\n`).join(""),
);
console.log("cf-strip-env: cleared .env values from the Worker bundle");
