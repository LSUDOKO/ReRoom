import Link from "next/link";
import { Logo } from "./ui";

export const GITHUB_URL = "https://github.com/LSUDOKO/reroom";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link href="/" aria-label="ReRoom home"><Logo /></Link>
        <nav className="ml-auto hidden items-center gap-6 text-sm text-slate md:flex">
          <Link href="/#how" className="hover:text-ink">How it works</Link>
          <Link href="/#aholo" className="hover:text-ink">Built on Aholo</Link>
          <Link href="/#pricing" className="hover:text-ink">Pricing</Link>
        </nav>
        <Link href="/studio" className="ml-auto inline-flex h-10 items-center rounded-btn bg-blue px-4 text-sm font-medium text-white hover:bg-blue-deep md:ml-0">
          Open the studio
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-slate md:flex-row md:items-center">
        <div>
          <Logo className="text-ink" />
          <p className="mt-2 max-w-xs">Scan it. Remix it. Live in it. Built for the Manycore Aholo Global 3D AI Hackathon.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 md:ml-auto">
          <Link href="/scan" className="hover:text-ink">Scan a room</Link>
          <Link href="/studio" className="hover:text-ink">Studio</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <a href={GITHUB_URL} className="hover:text-ink">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
