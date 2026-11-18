import Script from "next/script";
import Link from "next/link";
import { Logo } from "@/components/ui";

export const metadata = { title: "View in your room" };

/** AR page: model-viewer handles WebXR, Android Scene Viewer and iOS Quick Look (auto USDZ). */
export default async function Ar({ searchParams }: PageProps<"/ar">) {
  const q = await searchParams;
  const src = typeof q.src === "string" && /^(https?:\/\/|\/)/.test(q.src) ? q.src : "/library/L_ARMCHAIR.glb";
  const name = typeof q.name === "string" ? q.name.slice(0, 60) : "Furniture";
  const k = Math.min(10, Math.max(0.01, Number(q.scale) || 1));
  return (
    <main className="flex min-h-dvh flex-col bg-paper">
      <Script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js" strategy="afterInteractive" />
      <header className="flex items-center justify-between p-4">
        <Link href="/"><Logo /></Link>
        <span className="text-sm text-slate">{name}</span>
      </header>
      <model-viewer
        src={src}
        alt={name}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        scale={`${k} ${k} ${k}`}
        camera-controls
        shadow-intensity="1"
        environment-image="neutral"
        style={{ flex: 1, width: "100%", minHeight: "60dvh", background: "transparent" }}
      >
        <button slot="ar-button" className="absolute bottom-6 left-1/2 h-12 -translate-x-1/2 rounded-[8px] bg-[#4219FA] px-6 text-[15px] font-medium text-white shadow-lg">
          Place it in my room
        </button>
      </model-viewer>
      <p className="p-4 text-center text-xs text-slate">Shown at real size. Move your phone slowly to find the floor.</p>
    </main>
  );
}
