import type { Metadata } from "next";
import Link from "next/link";
import manifest from "../../../content/site-assets.json";
import lock from "../../../content/site-assets.lock.json";
import { SiteFooter, SiteHeader } from "@/components/Site";

export const metadata: Metadata = {
  title: "How this page was made",
  description: "Every 3D object and room on the ReRoom website was generated with the Aholo platform. Here is each asset, its prompt and the Aholo capability behind it.",
};

type Asset = { id: string; group: string; capability: string; prompt?: string; existing?: string; out?: string; note?: string; op?: string };
type LockRow = { status: string; out?: string; tris?: number; bytes?: number; prompt?: string };

const GROUPS: Record<string, string> = {
  hero: "Hero chair",
  scan: "Scan",
  remix: "Remix furniture",
  alive: "Furniture that opens",
  styles: "Styles",
  dream: "Dream rooms",
};

export default function MadeWithAholo() {
  const rows = manifest.assets as Asset[];
  const locks = lock as Record<string, LockRow>;
  const groups = [...new Set(rows.map((a) => a.group))];
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <section className="scallop-bottom bg-blue pb-16 pt-10 text-white [--scallop:var(--color-blue)]">
          <div className="mx-auto max-w-5xl px-5">
            <h1 className="font-display text-[clamp(2.8rem,6vw,4.8rem)] font-bold leading-[0.95]">
              How this page <span className="squiggle">was made.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-white/80">
              Every 3D object and room on this site was generated with Aholo: Lux3D for furniture, finishes, parts and exports, and Aholo World for
              rooms. Nothing is a purchased model. The list below is generated from{" "}
              <code className="rounded bg-white/15 px-1.5 py-0.5 text-[13px]">content/site-assets.json</code>, the same file the generator script runs from.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-5xl space-y-12 px-5 pb-24 pt-20">
          {groups.map((g) => (
            <section key={g}>
              <h2 className="font-display text-3xl font-bold">{GROUPS[g] ?? g}</h2>
              <div className="mt-4 overflow-hidden rounded-card bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream-deep text-slate">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Asset</th>
                      <th className="px-5 py-3 font-semibold">Aholo capability</th>
                      <th className="hidden px-5 py-3 font-semibold md:table-cell">Prompt or source</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows
                      .filter((a) => a.group === g)
                      .map((a) => {
                        const l = locks[a.id];
                        const out = l?.out ?? a.existing;
                        const done = l?.status === "done" || !!a.existing;
                        return (
                          <tr key={a.id} className="border-t border-line align-top">
                            <td className="px-5 py-3 font-semibold">
                              {out && !out.includes("*") ? (
                                <a href={out} className="text-blue underline-offset-4 hover:underline">{a.id}</a>
                              ) : (
                                a.id
                              )}
                            </td>
                            <td className="px-5 py-3">{a.capability}</td>
                            <td className="hidden max-w-sm px-5 py-3 text-slate md:table-cell">
                              {l?.prompt ?? a.prompt ?? (a.existing ? `Reused from the app: ${a.existing}` : a.note ?? "")}
                              {l?.tris ? <span className="mt-1 block text-xs">{l.tris.toLocaleString()} triangles · {((l.bytes ?? 0) / 1e6).toFixed(2)} MB</span> : null}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${done ? "bg-amber text-ink" : "bg-cream-deep text-slate"}`}>
                                {done ? "Made with Aholo" : "Planned"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
          <p className="text-sm text-slate">
            Material reference photos used as Lux3D inputs are licensed from Adobe Stock and are not shown on this site. Generated models can be checked
            on the <a href="/site/review.html" className="text-blue underline-offset-4 hover:underline">asset review page</a>, or{" "}
            <Link href="/studio" className="text-blue underline-offset-4 hover:underline">opened in the studio</Link>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
