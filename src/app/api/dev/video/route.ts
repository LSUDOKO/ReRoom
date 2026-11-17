import { writeFile } from "node:fs/promises";

export const runtime = "nodejs";

/** Dev-only: save a canvas recording to tmp/ (used to test the scan pipeline end to end). */
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });
  await writeFile("tmp/walkthrough.webm", Buffer.from(await req.arrayBuffer()));
  return Response.json({ ok: true });
}
