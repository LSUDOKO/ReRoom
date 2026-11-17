import { readFile } from "node:fs/promises";
import { basename, join, normalize } from "node:path";
import { proxyAllowed } from "../guard";
import { uploadBuffer } from "./server";

// Lux3D needs URLs it can fetch. Local assets (/library/x.glb, /materials/x.jpg) are either
// served from the public site (SITE_URL) or uploaded once to Aholo asset storage.
const cache = new Map<string, string>();

export async function toAholoUrl(ref: string): Promise<string> {
  if (/^https:\/\//.test(ref)) {
    if (!proxyAllowed(ref) && !ref.startsWith(process.env.SITE_URL ?? "\0"))
      throw new Error("Unsupported model URL");
    return ref;
  }
  if (!ref.startsWith("/") || ref.includes("..")) throw new Error("Invalid asset path");
  const site = process.env.SITE_URL;
  if (site && !site.includes("localhost")) return `${site.replace(/\/$/, "")}${ref}`;
  const hit = cache.get(ref);
  if (hit) return hit;
  const file = normalize(join(process.cwd(), "public", ref));
  if (!file.startsWith(join(process.cwd(), "public"))) throw new Error("Invalid asset path");
  const url = await uploadBuffer(await readFile(file), basename(file));
  cache.set(ref, url);
  return url;
}
