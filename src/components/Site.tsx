import Link from "next/link";
import { Logo } from "./ui";

export const GITHUB_URL = "https://github.com/LSUDOKO/ReRoom";

export function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

/** Cream pill bar on a blue band, as on the landing page. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-blue px-3 pt-3 pb-2 md:px-5">
      <div className="mx-auto grid h-15 max-w-7xl grid-cols-[1fr_auto_1fr] items-center rounded-[18px] bg-cream px-3 shadow-[0_8px_24px_-16px_rgb(20_16_46/0.5)] md:px-4">
        <nav className="flex items-center gap-5 text-sm font-medium text-slate">
          <Link href="/#remix" className="hidden hover:text-ink md:inline">How it works</Link>
          <Link href="/#styles" className="hidden hover:text-ink md:inline">Styles</Link>
          <Link href="/#aholo" className="hidden hover:text-ink lg:inline">Built on Aholo</Link>
          <Link href="/#pricing" className="hidden hover:text-ink lg:inline">Pricing</Link>
          <Link href="/scan" className="hover:text-ink md:hidden">Scan</Link>
        </nav>
        <Link href="/" aria-label="ReRoom home" className="justify-self-center">
          <Logo className="text-ink" />
        </Link>
        <div className="flex items-center justify-end gap-2">
          <Link href="/studio" className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-blue px-3.5 text-sm font-semibold text-white hover:bg-blue-deep md:px-4">
            <span className="sm:hidden">Studio</span>
            <span className="hidden sm:inline">Open the studio</span> <span aria-hidden>→</span>
          </Link>
          <a href={GITHUB_URL} aria-label="Source on GitHub" className="hidden size-10 items-center justify-center rounded-btn bg-amber text-ink hover:brightness-95 sm:flex">
            <GithubIcon />
          </a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-slate md:flex-row md:items-center">
        <div>
          <Logo className="text-ink" />
          <p className="mt-2 max-w-xs">Scan it. Remix it. Live in it. Built for the Manycore Aholo Global 3D AI Hackathon.</p>
        </div>
        <nav className="flex flex-wrap gap-2 md:mx-auto">
          {[
            ["/scan", "Scan a room"],
            ["/studio", "Studio"],
            ["/made-with-aholo", "Made with Aholo"],
            ["/privacy", "Privacy"],
            ["/terms", "Terms"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full bg-amber px-3 py-1.5 text-[13px] font-semibold text-ink hover:brightness-95">
              {label}
            </Link>
          ))}
          <a href={GITHUB_URL} className="rounded-full bg-amber px-3 py-1.5 text-[13px] font-semibold text-ink hover:brightness-95">GitHub</a>
        </nav>
        <p className="text-xs md:text-right">© 2026 ReRoom<br />Every 3D object made with Aholo</p>
      </div>
    </footer>
  );
}
