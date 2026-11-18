import { aholoError, checkPrompt, json, rateLimit } from "@/lib/guard";
import { toAholoUrl } from "@/lib/aholo/public-url";
import {
  articulate,
  imgTo3d,
  materialTransfer,
  multiExport,
  partSplit,
  textTo3d,
  type ExportFormat,
} from "@/lib/aholo/server";

export const runtime = "nodejs";

const FORMATS: ExportFormat[] = ["usdz", "obj_zip", "fbx_zip", "stl", "3mf"];
const isImage = (s: unknown): s is string =>
  typeof s === "string" && (/^data:image\/(png|jpe?g|webp);base64,/.test(s) || /^https:\/\//.test(s));

/**
 * Create a Lux3D task and return its id. The browser polls /api/lux3d/:taskId.
 * ops: text | image | transfer | articulate | split | export
 */
export async function POST(req: Request) {
  if (!(await rateLimit(req, "lux3d"))) return json({ error: "Too many requests. Retrying shortly.", retry: true }, 429);
  const body = await req.json().catch(() => ({}));
  try {
    switch (body.op) {
      case "text": {
        const p = checkPrompt(body.prompt);
        if (!p.ok) return json({ error: p.error }, 400);
        return json({ taskId: await textTo3d(p.prompt), note: p.note });
      }
      case "image": {
        if (!isImage(body.image)) return json({ error: "Upload a PNG, JPG or WebP photo." }, 400);
        if (body.image.length > 6_000_000) return json({ error: "Photo is too large. Use one under 4 MB." }, 400);
        return json({ taskId: await imgTo3d(body.image) });
      }
      case "transfer": {
        const [mesh, material] = await Promise.all([toAholoUrl(body.mesh), toAholoUrl(body.material)]);
        return json({ taskId: await materialTransfer(mesh, material) });
      }
      case "articulate": {
        const p = checkPrompt(body.prompt ?? "the doors and drawers open");
        if (!p.ok) return json({ error: p.error }, 400);
        return json({ taskId: await articulate(await toAholoUrl(body.mesh), p.prompt) });
      }
      case "split":
        return json({ taskId: await partSplit(await toAholoUrl(body.mesh)) });
      case "export": {
        const formats = (Array.isArray(body.formats) ? body.formats : []).filter((f: ExportFormat) =>
          FORMATS.includes(f),
        );
        if (!formats.length) return json({ error: "Pick at least one export format." }, 400);
        return json({ taskId: await multiExport(await toAholoUrl(body.mesh), formats) });
      }
      default:
        return json({ error: "Unknown operation" }, 400);
    }
  } catch (e) {
    console.error("[lux3d]", body.op, (e as Error).message);
    return aholoError(e);
  }
}
