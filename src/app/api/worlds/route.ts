import { aholoError, json, rateLimit } from "@/lib/guard";
import { generateWorld, reconstruct } from "@/lib/aholo/server";

export const runtime = "nodejs";

/** Start a World job: reconstruct a scan (video / photos / insv) or generate a dream room. */
export async function POST(req: Request) {
  if (!rateLimit(req, 6)) return json({ error: "Too many requests. Wait a minute and try again." }, 429);
  const body = await req.json().catch(() => ({}));
  try {
    if (body.mode === "generate") {
      const prompt = String(body.prompt ?? "").trim();
      if (prompt.length < 8) return json({ error: "Describe the room in a sentence." }, 400);
      return json({ worldId: await generateWorld(prompt.slice(0, 500), body.imageUrl || undefined) });
    }
    if (body.mode === "reconstruct") {
      if (typeof body.url !== "string" || !body.url.startsWith("https://"))
        return json({ error: "Upload the video first." }, 400);
      const type = ["video", "image", "insv"].includes(body.type) ? body.type : "video";
      return json({ worldId: await reconstruct(String(body.name ?? "My room").slice(0, 60), body.url, type) });
    }
    return json({ error: "Unknown mode" }, 400);
  } catch (e) {
    console.error("[worlds]", (e as Error).message);
    return aholoError(e);
  }
}
