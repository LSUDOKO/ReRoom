import Link from "next/link";
import { SiteHeader } from "@/components/Site";
import { LogoMark } from "@/components/ui";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="band relative flex min-h-[80vh] flex-1 items-center justify-center overflow-hidden px-5 text-center">
        <div aria-hidden className="field opacity-80" />
        <div aria-hidden className="grain" />
        <div className="relative">
          <p className="mono-label text-white/60">Error 404 · this room is empty</p>
          <h1 className="mt-6 flex items-center justify-center gap-4 text-[clamp(4rem,14vw,10rem)]">
            <LogoMark className="h-[0.7em] w-auto text-[#d9dce6]" />
            <span className="chrome display">404</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg font-light text-white/80">Nothing was ever placed here. Let&apos;s furnish somewhere real.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="glass glass--light">
              Back to the start
            </Link>
            <Link href="/studio?room=industrial-loft" className="glass">
              Open a sample room
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
