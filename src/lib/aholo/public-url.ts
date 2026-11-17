import { readFile } from "node:fs/promises";
import { basename, join, normalize } from "node:path";
import { proxyAllowed } from "../guard";
import { uploadBuffer } from "./server";

// Lux3D needs URLs it can fetch. Local assets (/library/x.glb, /materials/x.jpg) are either
// served from the public site (SITE_URL) or uploaded once to Aholo asset storage.
// Asset uploads land under a temp prefix, so cached URLs are reused for 30 minutes only.
const TTL = 30 * 60_000;
const cache = new Map<string, { url: string; at: number }>();

export async function toAholoUrl(ref: string): Promise<string> {
  if (typeof ref !== "string") throw new Error("Missing asset reference");
  const m = ref.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/);
  if (m) {
    const buf = Buffer.from(m[2], "base64");
    if (buf.length > 6_000_000) throw new Error("Image is too large");
    return uploadBuffer(buf, `material.${m[1] === "jpeg" ? "jpg" : m[1]}`);
  }
  if (/^https:\/\//.test(ref)) {
    if (!proxyAllowed(ref) && !ref.startsWith(process.env.SITE_URL ?? "\0"))
      throw new Error("Unsupported model URL");
    return ref;
  }
  if (!ref.startsWith("/") || ref.includes("..")) throw new Error("Invalid asset path");
  const site = process.env.SITE_URL;
  if (site && !site.includes("localhost")) return `${site.replace(/\/$/, "")}${ref}`;
  const hit = cache.get(ref);
  if (hit && Date.now() - hit.at < TTL) return hit.url;
  const file = normalize(join(process.cwd(), "public", ref));
  if (!file.startsWith(join(process.cwd(), "public"))) throw new Error("Invalid asset path");
  const url = await uploadBuffer(await readFile(file), basename(file));
  cache.set(ref, { url, at: Date.now() });
  return url;
}
