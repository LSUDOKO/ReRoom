import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Armchair,
  BedDouble,
  Box,
  ChevronDown,
  DoorOpen,
  Lamp,
  Layers,
  Palette,
  Ruler,
  Share2,
  Smartphone,
  Sofa,
  Sparkles,
  Wand2,
} from "lucide-react";
import { HeroCanvas, MaterialChips } from "@/components/landing/LandingClient";
import { Shot } from "@/components/landing/Shot";
import { GITHUB_URL, GithubIcon, SiteFooter, SiteHeader } from "@/components/Site";

const FEATURES = [
  { icon: Smartphone, title: "Phone video in", body: "Walk the room for a minute. Aholo Reality does the rest." },
  { icon: Sparkles, title: "Photoreal 3D", body: "A Gaussian-splat copy of your room, light and all." },
  { icon: Layers, title: "Walls hide furniture", body: "Room and pieces share one depth buffer in the Aholo Viewer." },
  { icon: Wand2, title: "No room? Dream one", body: "Describe a room and SpatialGen builds it." },
];

const MARQUEE = ["Sofa", "Wardrobe", "Japandi", "Armchair", "Industrial", "Drawers", "Cyberpunk", "Floor lamp", "Coastal", "Rug", "Luxury", "Sideboard"];

const REMIX = [
  {
    icon: Wand2,
    title: "Describe it",
    tag: "Lux3D text-to-3D",
    body: "Type “a mustard velvet armchair with walnut legs”. Lux3D builds a PBR model at its real-world size.",
    time: "About a minute",
    shot: { name: "ui-describe", widths: [960, 1600, 2400] },
    href: "/studio?room=industrial-loft",
  },
  {
    icon: Smartphone,
    title: "Snap a product photo",
    tag: "Lux3D image-to-3D",
    body: "Seen a lamp you like? One photo becomes a 3D piece you can drop into your room. Location data is stripped first.",
    time: "About a minute",
    shot: { name: "ui-photo", widths: [960, 1600, 2933] },
    href: "/studio?room=coastal-bedroom",
  },
  {
    icon: Sofa,
    title: "Pick from the library",
    tag: "24 Lux3D pieces",
    body: "Sofas, beds, wardrobes, plants and lamps, generated with Lux3D and sized to real catalog dimensions.",
    time: "Instant",
    shot: { name: "ui-library", widths: [960, 1600, 3200] },
    href: "/studio?room=japandi-studio",
  },
];

const STEPS = [
  { n: "01", tag: "60 seconds", title: "Scan your room", body: "Record a slow walk-through on your phone, or describe a dream room.", shot: { name: "before", widths: [1280, 1920, 3840] } },
  { n: "02", tag: "AI furniture", title: "Remix it", body: "Add pieces, drag them into place, restyle the lot in one tap.", shot: { name: "after", widths: [1280, 1920, 3840] } },
  { n: "03", tag: "Doors open", title: "Live in it", body: "Walk through at eye height, open the wardrobe, compare before and after.", shot: { name: "step-open", widths: [1200] } },
];

const STYLES = [
  { id: "original", name: "Original" },
  { id: "japandi", name: "Japandi" },
  { id: "industrial", name: "Industrial" },
  { id: "cyberpunk", name: "Cyberpunk" },
];

const PLANS = [
  { name: "Free", tag: "Beta", price: "0", per: "forever", note: "Everything you need to try your room.", items: ["1 room scan", "5 AI pieces a month", "All 8 styles", "Share links and AR"], cta: "Start free" },
  { name: "Plus", tag: "Most popular", price: "9", per: "per month", note: "For a full move or a big redesign.", items: ["5 room scans", "100 AI pieces a month", "HD tour videos", "No watermark", "Priority generation"], cta: "Try Plus", featured: true },
  { name: "Pro", tag: "Designers", price: "29", per: "per month", note: "Show clients their room before they buy.", items: ["Unlimited rooms", "Client share pages", "Branded exports", "STL and 3MF for printing"], cta: "For designers" },
];

const STATS = [
  ["24", "Library pieces, all Lux3D"],
  ["7", "Pieces that really open"],
  ["8", "One-tap styles"],
  ["10", "Aholo capabilities used"],
];

const AHOLO = [
  ["World · Reality", "A phone or Insta360 video becomes a 3D Gaussian-splat room."],
  ["World · SpatialGen", "A sentence becomes a walkable dream room. Our three sample rooms were made this way."],
  ["Aholo Viewer", "Renders the splat room and every model in one depth buffer, so walls hide furniture."],
  ["Lux3D text-to-3D", "Describe a piece, get a PBR model with AI-predicted real size."],
  ["Lux3D image-to-3D", "A product photo becomes a 3D model."],
  ["Lux3D articulation", "Finds doors, drawers and lids. ReRoom drives the joints in the browser."],
  ["Lux3D material transfer", "Re-finishes every piece from one material photo: the eight styles and this page's chair."],
  ["Lux3D part split", "Takes a model apart into its pieces, like the chair above."],
  ["Lux3D export", "USDZ for iPhone AR, STL and 3MF for 3D printing, OBJ and FBX for DCC tools."],
  ["Asset API", "Uploads scans, photos and material references."],
];

const FAQ = [
  ["Do I need an account?", "No. Designs are saved in your browser, and share links carry the design inside the link itself, so nothing about your room is stored on our servers."],
  ["What phone do I need to scan?", "Any phone that records video. Walk slowly for 30–60 seconds, keep the lights on and point the camera at the walls and floor. Insta360 .insv files work too."],
  ["Are the furniture sizes real?", "Yes. Library pieces use real catalog dimensions and generated pieces keep the size Lux3D predicts. You can resize anything in the inspector."],
  ["Can I see a piece in my real room?", "Select it and choose View in your room. iPhone opens AR Quick Look and Android opens Scene Viewer, both at the size you set."],
  ["What happens to my photos and videos?", "Photos are resized and stripped of location data in your browser before upload. Scans go to Aholo only to build your 3D room."],
];

function Doodles() {
  const items = [
    { I: Armchair, c: "left-[4%] top-[18%] size-20 -rotate-12" },
    { I: Lamp, c: "left-[38%] top-[8%] size-14 rotate-6" },
    { I: BedDouble, c: "right-[6%] top-[14%] size-20 rotate-12" },
    { I: Sofa, c: "left-[8%] bottom-[16%] size-24 rotate-6" },
    { I: Box, c: "right-[30%] bottom-[10%] size-12 -rotate-12" },
    { I: Ruler, c: "right-[4%] bottom-[30%] size-16 -rotate-45" },
    { I: Sparkles, c: "left-[46%] bottom-[24%] size-10" },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden text-white/[0.09]">
      {items.map(({ I, c }, i) => (
        <I key={i} strokeWidth={1.25} className={`absolute ${c}`} />
      ))}
    </div>
  );
}

function SpinBadge({ className = "" }: { className?: string }) {
  const text = "SCAN IT • REMIX IT • LIVE IN IT • ";
  return (
    <div aria-hidden className={`relative size-28 ${className}`}>
      <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 size-full">
        <defs>
          <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-current font-display text-[9px] font-semibold tracking-[0.08em]">
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </svg>
      <span className="absolute inset-[30%] flex items-center justify-center rounded-full bg-amber text-ink">
        <ArrowUpRight size={22} strokeWidth={2.5} />
      </span>
    </div>
  );
}

function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`text-[13px] font-semibold tracking-wide ${light ? "text-amber" : "text-blue"}`}>{children}</p>;
}

function MadeWith({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`mt-3 text-xs ${light ? "text-white/60" : "text-slate/80"}`}>{children}</p>;
}

export default function Home() {
  return (
    <>
      <HeroCanvas />
      <SiteHeader />
      <main className="flex-1 overflow-x-clip">
        {/* HERO */}
        <section id="hero" className="scallop-bottom relative flex min-h-[calc(100svh-80px)] items-center bg-blue text-white [--scallop:var(--color-blue)]">
          <Doodles />
          <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 pb-24 pt-10 md:grid-cols-[1.05fr_0.95fr] md:pb-28">
            <div className="max-w-[40rem] pt-[46vh] md:pt-0">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["L_ARMCHAIR", "L_WARDROBE", "L_PLANT_BIG"].map((id) => (
                    <span key={id} className="relative size-9 overflow-hidden rounded-full bg-cream ring-2 ring-blue">
                      <Image src={`/library/thumbs/${id}.webp`} alt="" fill sizes="36px" className="object-cover" />
                    </span>
                  ))}
                </div>
                <p className="text-[13px] leading-tight text-white/80">
                  Built on <span className="font-semibold text-white">Aholo</span>
                  <br />
                  Lux3D · World · Viewer
                </p>
              </div>
              <h1 className="mt-6 font-display text-[clamp(3.2rem,7.4vw,6.4rem)] font-bold leading-[0.92]">
                Redesign Your Real Room <span className="squiggle whitespace-nowrap">In One Tap</span>
              </h1>
              <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-white/80">
                Scan your room with your phone, add furniture you describe or photograph, open its doors and drawers, and restyle everything. All in
                the browser.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/scan" className="inline-flex h-13 items-center gap-2 rounded-btn bg-cream px-6 text-[15px] font-semibold text-blue hover:bg-white">
                  Scan my room <ArrowRight size={17} />
                </Link>
                <Link href="/studio?room=industrial-loft" className="inline-flex h-13 items-center gap-2 rounded-btn bg-amber px-6 text-[15px] font-semibold text-ink hover:brightness-95">
                  Try a sample room
                </Link>
              </div>
              <MadeWith light>The chair: Aholo Lux3D text-to-3D, four finishes by Lux3D material transfer, parts by Lux3D part split.</MadeWith>
            </div>
            <div className="relative hidden md:block">
              <SpinBadge className="absolute -left-6 bottom-6 text-white" />
            </div>
          </div>
          {/* static poster: carries first paint until the 3D chair takes over */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/hero/chair-poster.webp"
            alt="A mustard velvet armchair generated with Aholo Lux3D"
            width={1600}
            height={1600}
            fetchPriority="high"
            className="hero-poster pointer-events-none absolute left-1/2 top-[8%] z-[4] w-[min(78vw,420px)] -translate-x-1/2 transition-opacity duration-700 md:left-auto md:right-[10%] md:top-1/2 md:w-[min(36vw,560px)] md:-translate-y-1/2 md:translate-x-0"
          />
        </section>

        {/* SCAN */}
        <section id="scan" className="relative flex min-h-screen items-center bg-cream pb-16 pt-28">
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>Scan</Eyebrow>
              <h2 className="mt-2 font-display text-[clamp(2.6rem,5vw,4.2rem)] font-bold leading-[0.95] text-ink">
                Your real room, in 3D, <span className="squiggle">in a minute.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-slate">Point your phone at the walls, walk slowly, and Aholo Reality turns the video into a room you can step inside.</p>
            </div>
            <div className="mt-14 grid items-center gap-8 md:grid-cols-[1fr_minmax(260px,1.1fr)_1fr]">
              {[FEATURES.slice(0, 2), FEATURES.slice(2)].map((col, ci) => (
                <ul key={ci} className={`space-y-10 ${ci === 1 ? "md:order-3" : ""}`}>
                  {col.map(({ icon: I, title, body }) => (
                    <li key={title} className="text-center">
                      <I className="mx-auto size-11 text-blue" strokeWidth={1.4} />
                      <h3 className="mt-3 font-display text-2xl font-bold">{title}</h3>
                      <p className="mx-auto mt-1 max-w-[16rem] text-sm text-slate">{body}</p>
                    </li>
                  ))}
                </ul>
              ))}
              <div id="scan-stop" aria-hidden className="order-first h-[38vh] md:order-2 md:h-[46vh]" />
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="relative z-10 -rotate-1 overflow-hidden bg-blue py-4 text-white">
          <div className="marquee flex w-max gap-8 whitespace-nowrap font-display text-2xl font-semibold uppercase">
            {[...MARQUEE, ...MARQUEE].map((w, i) => (
              <span key={i} className="flex items-center gap-8">
                {w} <span className="text-amber">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* REMIX */}
        <section id="remix" className="relative bg-cream py-28">
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div id="remix-stop" className="grid min-h-[70vh] items-center md:grid-cols-2">
              <div className="max-w-xl">
                <Eyebrow>Remix</Eyebrow>
                <h2 className="mt-2 font-display text-[clamp(2.6rem,5vw,4.2rem)] font-bold leading-[0.95]">
                  Describe it. Snap it. <span className="squiggle">Place it.</span>
                </h2>
                <p className="mt-4 max-w-md text-slate">
                  Every piece is real 3D with real materials and a real size, so it sits on your floor the way it would at home.
                </p>
              </div>
              <div aria-hidden className="order-first h-[42vh] md:order-none md:h-auto" />
            </div>
            <div className="mt-10 space-y-10">
              {REMIX.map((r, i) => (
                <article key={r.title} className={`grid items-center gap-6 md:grid-cols-2 md:gap-14 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-cream-deep">
                    <Shot name={r.shot.name} widths={r.shot.widths} sizes="(min-width: 768px) 600px, 100vw" alt={`${r.title} in the ReRoom studio`} className="object-left-top" />
                  </div>
                  <div className="rounded-card bg-white p-7 md:p-9">
                    <r.icon className="size-12 text-blue" strokeWidth={1.3} />
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-3xl font-bold">{r.title}</h3>
                      <span className="rounded-full bg-amber px-2.5 py-1 text-[11px] font-bold text-ink">{r.tag}</span>
                    </div>
                    <p className="mt-3 text-slate">{r.body}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                      <span className="font-display text-xl font-semibold">{r.time}</span>
                      <Link href={r.href} aria-label={`${r.title} in the studio`} className="flex size-10 items-center justify-center rounded-full bg-blue text-white hover:bg-blue-deep">
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ALIVE */}
        <section id="alive" className="scallop-top scallop-bottom relative bg-blue py-24 text-white [--scallop:var(--color-blue)]">
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div id="alive-stop" className="grid min-h-[70vh] items-center md:grid-cols-2">
              <div className="max-w-xl">
                <Eyebrow light>How it works</Eyebrow>
                <h2 className="mt-2 font-display text-[clamp(2.6rem,5vw,4.2rem)] font-bold leading-[0.95]">
                  Furniture that <span className="squiggle">comes alive.</span>
                </h2>
                <p className="mt-4 max-w-md text-white/80">
                  Lux3D articulation finds every hinge and slide, so wardrobes swing open and drawers glide out right in the browser. Part split takes a
                  piece apart, like the chair you see here.
                </p>
                <ul className="mt-6 space-y-2 text-white/85">
                  {["Double-click any piece to open it", "Seven library pieces open today", "Add moving parts to anything you generate"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <DoorOpen size={17} className="text-amber" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div aria-hidden className="order-first h-[42vh] md:order-none md:h-auto" />
            </div>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.n} className={i === 1 ? "md:mt-10" : i === 2 ? "md:-mt-6" : "md:mt-16"}>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-6xl font-bold italic text-amber">{s.n}</span>
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold">{s.tag}</span>
                  </div>
                  <div className="mt-3 overflow-hidden rounded-card bg-cream text-ink">
                    <div className="p-6">
                      <h3 className="font-display text-2xl font-bold">{s.title}</h3>
                      <p className="mt-2 text-sm text-slate">{s.body}</p>
                    </div>
                    <div className="relative mx-3 mb-3 aspect-[16/10] overflow-hidden rounded-[20px] bg-blue">
                      <Shot name={s.shot.name} widths={s.shot.widths} sizes="(min-width: 768px) 400px, 100vw" alt={s.title} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* STYLES */}
        <section id="styles" className="relative bg-cream pb-24 pt-36">
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div id="styles-stop" className="grid min-h-[75vh] items-center md:grid-cols-2">
              <div aria-hidden className="h-[40vh] md:h-auto" />
              <div className="max-w-xl">
                <Eyebrow>Restyle</Eyebrow>
                <h2 className="mt-2 font-display text-[clamp(2.6rem,5vw,4.2rem)] font-bold leading-[0.95]">
                  One room. <span className="squiggle">Eight moods.</span>
                </h2>
                <p className="mt-4 max-w-md text-slate">
                  Lux3D material transfer re-finishes every piece from a single photo of a material. Try it on the chair, then scroll on to see whole
                  rooms change.
                </p>
                <div className="mt-6">
                  <MaterialChips />
                </div>
                <MadeWith>Each finish is a separate Lux3D material transfer of the same chair.</MadeWith>
              </div>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
              {STYLES.map((s) => (
                <figure key={s.id}>
                  <div className="relative aspect-square overflow-hidden rounded-card bg-cream-deep">
                    <Shot name={`style-${s.id}`} widths={[720, 1440, 2160]} sizes="(min-width: 768px) 300px, 50vw" alt={`The loft in ${s.name} style`} />
                  </div>
                  <figcaption className="mt-2 font-display text-xl font-semibold">{s.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="relative bg-cream pb-28">
          <div className="relative z-10 mx-auto max-w-6xl px-5">
            <div className="text-center">
              <Eyebrow>Plans</Eyebrow>
              <h2 className="mt-2 font-display text-[clamp(2.6rem,5vw,4.2rem)] font-bold leading-[0.95]">
                <span className="squiggle">Free</span> while we&apos;re in beta.
              </h2>
              <p className="mt-3 text-slate">Paid plans arrive at launch. No card needed today.</p>
            </div>
            <div className="mt-12 grid items-center gap-5 md:grid-cols-3">
              {PLANS.map((p) => (
                <div key={p.name} className={`rounded-card p-7 ${p.featured ? "bg-blue py-10 text-white shadow-[0_24px_60px_-24px_rgb(66_25_250/0.7)]" : "bg-white"}`}>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${p.featured ? "bg-white text-blue" : "bg-amber text-ink"}`}>{p.tag}</span>
                  <div className="mt-5 flex items-baseline gap-1 font-display">
                    <span className="text-2xl font-semibold">$</span>
                    <span className="text-6xl font-bold">{p.price}</span>
                  </div>
                  <p className={`text-sm ${p.featured ? "text-white/70" : "text-slate"}`}>
                    {p.name} · {p.per}
                  </p>
                  <p className={`mt-3 text-sm ${p.featured ? "text-white/85" : "text-slate"}`}>{p.note}</p>
                  <ul className="mt-5 space-y-2.5 text-sm">
                    {p.items.map((i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className={`flex size-5 items-center justify-center rounded-full text-[11px] ${p.featured ? "bg-white text-blue" : "bg-blue text-white"}`}>✓</span>
                        {i}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/scan"
                    className={`mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn text-sm font-semibold ${p.featured ? "bg-white text-blue hover:bg-cream" : "bg-blue text-white hover:bg-blue-deep"}`}
                  >
                    {p.cta} <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="scallop-top scallop-bottom relative bg-blue py-14 text-white [--scallop:var(--color-blue)]">
          <dl className="relative z-10 mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 md:grid-cols-4">
            {STATS.map(([n, label]) => (
              <div key={label} className="text-center">
                <dt className="font-display text-7xl font-bold italic">{n}</dt>
                <dd className="mt-1 text-sm text-white/75">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* AR */}
        <section id="ar" className="relative bg-cream pb-24 pt-36">
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 md:grid-cols-2">
            <div className="relative z-10 max-w-xl">
              <Eyebrow>Take it with you</Eyebrow>
              <h2 className="mt-2 font-display text-[clamp(2.6rem,5vw,4.2rem)] font-bold leading-[0.95]">
                See it in your room, <span className="squiggle">for real.</span>
              </h2>
              <p className="mt-4 max-w-md text-slate">Scan the code and the piece stands on your floor at the size you chose, through your phone camera.</p>
              <ul className="mt-8 space-y-5">
                {[
                  [Smartphone, "Phone AR", "AR Quick Look on iPhone, Scene Viewer on Android, from a QR code."],
                  [Share2, "Share a link", "The whole design lives inside the link. Nothing is stored."],
                  [Box, "Export anything", "GLB, USDZ, STL, 3MF, OBJ and FBX, from Lux3D multi-format export."],
                  [Palette, "Before and after", "Same camera, saved as an image to send to anyone."],
                ].map(([I, t, b]) => {
                  const Icon = I as typeof Box;
                  return (
                    <li key={t as string} className="flex gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-soft text-blue">
                        <Icon size={20} />
                      </span>
                      <span>
                        <span className="block font-display text-xl font-bold">{t as string}</span>
                        <span className="text-sm text-slate">{b as string}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div id="ar-stop" className="relative z-[4] flex justify-center">
              <div className="relative h-[560px] w-[280px] rounded-[48px] bg-ink p-3 shadow-[0_40px_80px_-30px_rgb(33_11_125/0.6)]">
                <div className="absolute left-1/2 top-5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />
                <div id="ar-phone-screen" className="relative h-full w-full overflow-hidden rounded-[38px] bg-cream-deep">
                  <Shot name="before" widths={[1280, 1920]} sizes="280px" alt="A room seen through the phone camera" className="object-[38%_50%]" />
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink">AR · 95 cm tall</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BUILT ON AHOLO */}
        <section id="aholo" className="relative bg-cream pb-24">
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div className="text-center">
              <Eyebrow>Built on Aholo</Eyebrow>
              <h2 className="mt-2 font-display text-[clamp(2.6rem,5vw,4.2rem)] font-bold leading-[0.95]">
                Ten Aholo tools, <span className="squiggle">one product.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-slate">The API key stays on our server, and every 3D object on this page was generated with Aholo.</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {AHOLO.map(([t, b]) => (
                <div key={t} className="rounded-[22px] bg-navy p-5 text-white">
                  <span className="text-amber">✦</span>
                  <h3 className="mt-2 font-display text-xl font-bold">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{b}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm">
              <Link href="/made-with-aholo" className="font-semibold text-blue underline-offset-4 hover:underline">
                How this page was made
              </Link>
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative bg-cream pb-32">
          <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="mt-2 font-display text-[clamp(2.6rem,5vw,4.2rem)] font-bold leading-[0.95]">
                The practical <span className="squiggle">questions, answered.</span>
              </h2>
              <p className="mt-4 max-w-sm text-slate">Still unsure? Open a sample room. No account, no download.</p>
            </div>
            <div className="space-y-3">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group rounded-[20px] bg-white p-5 open:shadow-[0_12px_30px_-18px_rgb(33_11_125/0.35)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-bold">
                    {q}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue text-white transition-transform group-open:rotate-180">
                      <ChevronDown size={17} />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="scallop-top relative flex min-h-[90vh] items-center bg-blue py-24 text-white [--scallop:var(--color-blue)]">
          <Doodles />
          <div className="relative z-10 mx-auto grid w-full max-w-7xl px-5 md:grid-cols-2">
            <div className="max-w-xl pt-[44vh] md:pt-0">
              <Eyebrow light>Your turn</Eyebrow>
              <h2 className="mt-2 font-display text-[clamp(3rem,6vw,5.4rem)] font-bold leading-[0.92]">
                Your room is one <span className="squiggle">video away.</span>
              </h2>
              <p className="mt-4 max-w-md text-white/80">Scan it tonight, furnish it tomorrow, buy only what fits.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/scan" className="inline-flex h-13 items-center gap-2 rounded-btn bg-cream px-6 text-[15px] font-semibold text-blue hover:bg-white">
                  Scan my room <ArrowRight size={17} />
                </Link>
                <a href={GITHUB_URL} className="inline-flex h-13 items-center gap-2 rounded-btn bg-amber px-6 text-[15px] font-semibold text-ink hover:brightness-95">
                  <GithubIcon size={17} /> View the source
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
