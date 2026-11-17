import { aholoError, json } from "@/lib/guard";
import { getTask } from "@/lib/aholo/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await ctx.params;
  if (!/^\d+$/.test(taskId)) return json({ error: "Invalid task id" }, 400);
  try {
    return json(await getTask(taskId));
  } catch (e) {
    return aholoError(e);
  }
}
