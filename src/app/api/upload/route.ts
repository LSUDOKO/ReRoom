import { aholoError, json, rateLimit } from "@/lib/guard";
import { uploadBuffer } from "@/lib/aholo/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX = 500 * 1024 * 1024;
const OK = /\.(mp4|mov|insv|jpe?g|png|webp|glb)$/i;

/** Server-side upload of a raw body (?name=file.mp4) to Aholo asset storage. Returns its URL. */
export async function POST(req: Request) {
  if (!rateLimit(req, 10)) return json({ error: "Too many uploads. Wait a minute." }, 429);
  const name = new URL(req.url).searchParams.get("name") ?? "";
  if (!OK.test(name)) return json({ error: "Use an MP4, MOV, INSV, JPG, PNG or WebP file." }, 400);
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX) return json({ error: "Files must be under 500 MB." }, 413);
  try {
    const buf = Buffer.from(await req.arrayBuffer());
    if (!buf.length) return json({ error: "The file is empty." }, 400);
    return json({ url: await uploadBuffer(buf, name.replace(/[^\w.-]/g, "_")) });
  } catch (e) {
    console.error("[upload]", (e as Error).message);
    return aholoError(e);
  }
}
