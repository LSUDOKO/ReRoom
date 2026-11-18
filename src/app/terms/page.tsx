import { SiteFooter, SiteHeader } from "@/components/Site";

export const metadata = { title: "Terms" };

export default function Terms() {
  return (
    <>
      <SiteHeader />
      <main className="sheet flex-1"><div className="mx-auto max-w-2xl px-5 py-16 font-light leading-relaxed">
        <h1 className="display text-5xl">Terms</h1>
        <p className="mt-2 text-sm text-slate">Last updated 18 November 2026.</p>
        <ul className="mt-6 list-disc space-y-3 pl-5">
          <li>Use ReRoom for spaces you own or have permission to capture.</li>
          <li>ReRoom generates furniture and decor only. Prompts for weapons, explicit content, real people or brand logos are refused or rewritten.</li>
          <li>AI-generated models are approximations. Check real dimensions before buying or building anything.</li>
          <li>Models and exports you create are yours to use. Seed library models were generated with Aholo Lux3D for this project.</li>
          <li>The service is provided as is during the beta.</li>
        </ul>
      </div></main>
      <SiteFooter />
    </>
  );
}
