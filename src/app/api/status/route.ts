import { hasKey } from "@/lib/aholo/server";

export const dynamic = "force-dynamic";

/** Whether live Aholo generation is available on this deployment. */
export function GET() {
  return Response.json({ live: hasKey() && process.env.REROOM_DEMO_ONLY !== "1" });
}
