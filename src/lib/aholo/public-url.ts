import { proxyAllowed } from "../guard";
import { uploadBuffer } from "./server";

// Lux3D needs URLs it can fetch. Local assets (/library/x.glb, /materials/x.jpg) are uploaded once
// to Aholo asset storage: Aholo cannot reliably reach every host (workers.dev is blocked in some regions).
// Asset uploads land under a temp prefix, so cached URLs are reused for 30 minutes only.
const TTL = 30 * 60_000;
const cache = new Map<string, { url: string; at: number }>();

/** Bytes of a file in /public: the ASSETS binding on Cloudflare Workers, the filesystem elsewhere. */
async function readPublic(ref: string): Promise<Buffer> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const assets = (getCloudflareContext().env as unknown as { ASSETS?: { fetch(u: string): Promise<Response> } }).ASSETS;
    if (assets) {
      const res = await assets.fetch(`https://assets.local${ref}`);
      if (!res.ok) throw new Error(`Asset not found: ${ref}`);
      return Buffer.from(await res.arrayBuffer());
    }
  } catch (e) {
    if ((e as Error).message.startsWith("Asset not found")) throw e;
  }
  const [{ readFile }, { join, normalize }] = await Promise.all([import("node:fs/promises"), import("node:path")]);
  const root = join(process.cwd(), "public");
  const file = normalize(join(root, ref));
  if (!file.startsWith(root)) throw new Error("Invalid asset path");
  return readFile(file);
}

export async function toAholoUrl(ref: string): Promise<string> {
  if (typeof ref !== "string") throw new Error("Missing asset reference");
  const m = ref.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/);
  if (m) {
    const buf = Buffer.from(m[2], "base64");
    if (buf.length > 6_000_000) throw new Error("Image is too large");
    return uploadBuffer(buf, `material.${m[1] === "jpeg" ? "jpg" : m[1]}`);
  }
  if (/^https:\/\//.test(ref)) {
    if (!proxyAllowed(ref)) throw new Error("Unsupported model URL");
    return ref;
  }
  if (!/^\/[\w./-]+$/.test(ref) || ref.includes("..")) throw new Error("Invalid asset path");
  const hit = cache.get(ref);
  if (hit && Date.now() - hit.at < TTL) return hit.url;
  const url = await uploadBuffer(await readPublic(ref), ref.split("/").pop()!);
  cache.set(ref, { url, at: Date.now() });
  return url;
}
