import { aholoError, json } from "@/lib/guard";
import { getWorld } from "@/lib/aholo/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ worldId: string }> }) {
  const { worldId } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(worldId)) return json({ error: "Invalid world id" }, 400);
  try {
    return json(await getWorld(worldId));
  } catch (e) {
    return aholoError(e);
  }
}
