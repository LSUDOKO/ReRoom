import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const runtime = "nodejs";

/** Dev-only: save renders from the studio (library thumbnails, marketing shots) into /public. */
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });
  const { id, path, data } = await req.json();
  const rel = path ?? `library/thumbs/${id}.webp`;
  if (!/^(library\/thumbs|marketing)\/[\w.-]+\.webp$/.test(rel) || !String(data).startsWith("data:image/webp;base64,"))
    return new Response("Bad", { status: 400 });
  const file = `public/${rel}`;
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(String(data).split(",")[1], "base64"));
  return Response.json({ ok: true });
}
