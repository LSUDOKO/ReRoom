import { json, proxyAllowed } from "@/lib/guard";

export const runtime = "nodejs";

/** Stream an Aholo result file to the browser so it loads same-origin. Allowlisted hosts only. */
export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get("url") ?? "";
  if (!proxyAllowed(url)) return json({ error: "URL not allowed" }, 400);
  const upstream = await fetch(url);
  if (!upstream.ok || !upstream.body) return json({ error: `Upstream ${upstream.status}` }, 502);
  const headers = new Headers({ "cache-control": "private, max-age=3600" });
  for (const h of ["content-type", "content-length"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(upstream.body, { headers });
}
