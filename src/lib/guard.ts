// Request guards for the Aholo-backed API routes.

const BLOCKED = [
  /\b(gun|rifle|pistol|weapon|bomb|explosive|knife fight)\b/i,
  /\b(nude|naked|porn|sex|nsfw)\b/i,
  /\b(nazi|swastika|kkk)\b/i,
  /\b(celebrity|president|elon|trump|biden|taylor swift)\b/i,
];

// Brand / designer names are swapped for a generic description (docs/06 §7).
const BRANDS: [RegExp, string][] = [
  [/\bikea\b/gi, "flat-pack"],
  [/\beames\b/gi, "mid-century molded"],
  [/\bknoll\b/gi, "modernist"],
  [/\bherman miller\b/gi, "ergonomic"],
  [/\bwest elm\b/gi, "contemporary"],
  [/\bapple\b/gi, "minimal"],
];

export function checkPrompt(raw: unknown): { ok: true; prompt: string; note?: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "Describe the furniture you want." };
  let prompt = raw.replace(/\s+/g, " ").trim();
  if (prompt.length < 3) return { ok: false, error: "Describe the furniture in a few more words." };
  if (prompt.length > 300) return { ok: false, error: "Keep the description under 300 characters." };
  if (BLOCKED.some((r) => r.test(prompt)))
    return { ok: false, error: "ReRoom only makes furniture and decor. Try describing an object for your room." };
  let note: string | undefined;
  for (const [r, generic] of BRANDS) {
    if (r.test(prompt)) {
      prompt = prompt.replace(r, generic);
      note = "Brand names were replaced with a generic description.";
    }
  }
  return { ok: true, prompt, note };
}

type Limiter = { limit(o: { key: string }): Promise<{ success: boolean }> };
type Kv = { get(k: string): Promise<string | null>; put(k: string, v: string, o?: { expirationTtl: number }): Promise<void> };
export type Bucket = "lux3d" | "worlds" | "upload";
const LOCAL_LIMITS: Record<Bucket, number> = { lux3d: 12, worlds: 3, upload: 6 };

// Per-isolate sliding window. Always applied: on Workers it backs up the rate-limit bindings,
// which are eventually consistent and let a short burst through before they catch up.
const hits = new Map<string, number[]>();
function localWindow(key: string, max: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  if (list.length >= max) return false;
  list.push(now);
  hits.set(key, list);
  return true;
}

/**
 * Protects the Aholo credits. Returns null when the request may go ahead, otherwise the 429 body.
 * On Cloudflare: RL_<BUCKET> per IP, RL_GLOBAL per route, and a daily task budget in KV
 * (DAILY_TASK_BUDGET, default 300 Lux3D/World tasks per UTC day).
 */
export async function rateLimit(req: Request, bucket: Bucket): Promise<{ error: string; retry?: boolean } | null> {
  const ip =
    req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const slow = { error: "Too many requests. Retrying shortly.", retry: bucket === "lux3d" };
  if (!localWindow(`${bucket}:${ip}`, LOCAL_LIMITS[bucket])) return slow;
  let env: Record<string, unknown> | undefined;
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    env = getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    return null; // not running on Workers
  }
  const own = env[`RL_${bucket.toUpperCase()}`] as Limiter | undefined;
  const global = env.RL_GLOBAL as Limiter | undefined;
  const [a, b] = await Promise.all([own?.limit({ key: ip }), global?.limit({ key: bucket })]);
  if (a?.success === false || b?.success === false) return slow;

  const kv = env.REROOM_BUDGET as Kv | undefined;
  if (kv && bucket !== "upload") {
    const key = `tasks:${new Date().toISOString().slice(0, 10)}`;
    const used = Number((await kv.get(key)) ?? 0);
    if (used >= Number(env.DAILY_TASK_BUDGET ?? 300))
      return { error: "Today's free generation budget for this demo is used up. Try the library and demo mode, or come back tomorrow." };
    await kv.put(key, String(used + 1), { expirationTtl: 3 * 86_400 }); // ponytail: approximate count, KV has no atomic increment
  }
  return null;
}

/** Hosts we fetch on behalf of the browser (Aholo result CDNs + asset storage). */
const PROXY_HOSTS = [/\.kujiale\.com$/, /\.aholo3d\.cn$/, /\.aholo3d\.com$/, /\.aholo\.ai$/, /\.aholo\.cn$/, /\.myqcloud\.com$/, /\.qunhe\.cc$/];
export function proxyAllowed(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && PROXY_HOSTS.some((r) => r.test(u.hostname));
  } catch {
    return false;
  }
}

export const json = (data: unknown, status = 200) => Response.json(data, { status });

export function aholoError(e: unknown) {
  const err = e as { name?: string; message?: string; code?: string };
  const name = err?.name ?? "Error";
  if (name === "AuthenticationError") return json({ error: "The Aholo API key was rejected." }, 502);
  if (name === "RateLimitError")
    return json({ error: "Aholo is busy with other tasks right now. Retrying shortly.", retry: true }, 429);
  const msg = err?.message ?? "Aholo request failed";
  if (/concurren|too many|limit/i.test(msg)) return json({ error: "Generation queue is full. Retrying shortly.", retry: true }, 429);
  return json({ error: msg }, 502);
}
