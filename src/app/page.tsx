import Link from "next/link";
import { ArrowRight, DoorOpen } from "lucide-react";
import manifest from "../../content/manifest.json";
import library from "../../content/library.json";
import { AssetGallery } from "@/components/landing/AssetGallery";
import { HeroCanvas, MaterialChips } from "@/components/landing/LandingClient";
import { Motion } from "@/components/landing/Motion";
import { Shot } from "@/components/landing/Shot";
import { GITHUB_URL, GithubIcon, SiteFooter, SiteHeader } from "@/components/Site";
import { LogoMark } from "@/components/ui";

const VARIANTS = Object.values(manifest.variants as Record<string, Record<string, string>>).reduce((n, v) => n + Object.keys(v).length, 0);

// feature icons are clay 3D objects generated with Lux3D (content/site-assets.json, group "icons")
const FEATURES = [
  { icon: "i_scan", title: "Phone video in", body: "Walk the room for a minute. Aholo Reality does the rest." },
  { icon: "i_style", title: "Photoreal 3D", body: "A Gaussian-splat copy of your room, light and all." },
  { icon: "i_size", title: "Real sizes", body: "Room and pieces share one depth buffer and real-world scale." },
  { icon: "i_remix", title: "No room? Dream one", body: "Describe a room and SpatialGen builds it." },
];

function ClayIcon({ name, className = "size-20" }: { name: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/site/icons/${name}.webp`} alt="" loading="lazy" className={`${className} object-contain drop-shadow-[0_14px_18px_rgba(27,104,252,.28)] transition-transform duration-700 ease-out hover:-translate-y-1 hover:rotate-[-4deg]`} />;
}

const MARQUEE = ["Sofa", "Wardrobe", "Japandi", "Armchair", "Industrial", "Drawers", "Cyberpunk", "Floor lamp", "Coastal", "Rug", "Luxury", "Sideboard"];

const REMIX = [
  { tag: "Lux3D text-to-3D", title: "Describe it", body: "Type “a mustard velvet armchair with walnut legs”. Lux3D builds a PBR model at its real-world size in about a minute.", shot: { name: "ui-describe", widths: [960, 1600, 2400] } },
  { tag: "Lux3D image-to-3D", title: "Snap a product photo", body: "Seen a lamp you like? One photo becomes a 3D piece in your room. Location data is stripped in your browser first.", shot: { name: "ui-photo", widths: [960, 1600, 2933] } },
  { tag: `${library.length} Lux3D pieces`, title: "Pick from the library", body: "Sofas, beds, wardrobes, plants and lamps, generated with Lux3D and sized to real catalog dimensions.", shot: { name: "ui-library", widths: [960, 1600, 3200] } },
];

const STEPS = [
  { n: "01", title: "Scan your room", body: "A slow phone walk-through, or a sentence for a dream room.", shot: { name: "before", widths: [1280, 1920, 3840] } },
  { n: "02", title: "Remix it", body: "Add pieces, drag them into place, restyle the lot in one tap.", shot: { name: "after", widths: [1280, 1920, 3840] } },
  { n: "03", title: "Live in it", body: "Walk through at eye height, open the wardrobe, compare before and after.", shot: { name: "step-open", widths: [1200] } },
];

const STYLES = [
  { id: "original", name: "Original" },
  { id: "japandi", name: "Japandi" },
  { id: "industrial", name: "Industrial" },
  { id: "cyberpunk", name: "Cyberpunk" },
];

const PLANS = [
  { name: "Free", tag: "Beta", price: "0", per: "forever", items: ["1 room scan", "5 AI pieces a month", "All 8 styles", "Share links and AR"], cta: "Start free" },
  { name: "Plus", tag: "Most popular", price: "9", per: "per month", items: ["5 room scans", "100 AI pieces a month", "HD tour videos", "Priority generation"], cta: "Try Plus", featured: true },
  { name: "Pro", tag: "Designers", price: "29", per: "per month", items: ["Unlimited rooms", "Client share pages", "Branded exports", "STL and 3MF for printing"], cta: "For designers" },
];

const AHOLO = [
  ["World · Reality", "A phone or Insta360 video becomes a 3D Gaussian-splat room."],
  ["World · SpatialGen", "A sentence becomes a walkable room. All three sample rooms were made this way."],
  ["Aholo Viewer", "Splat room and every model in one depth buffer, so walls hide furniture."],
  ["Lux3D text-to-3D", "Describe a piece, get a PBR model with AI-predicted real size."],
  ["Lux3D image-to-3D", "A product photo becomes a 3D model."],
  ["Lux3D articulation", "Finds doors, drawers and lids; ReRoom drives the joints in the browser."],
  ["Lux3D material transfer", "Re-finishes a piece from one material photo: the eight styles and this page's chair."],
  ["Lux3D part split", "Takes a model apart into its pieces, like the chair above."],
  ["Lux3D export", "USDZ for iPhone AR, STL and 3MF for printing, OBJ and FBX for DCC tools."],
  ["Asset API", "Uploads scans, photos and material references."],
];

const FAQ = [
  ["Do I need an account?", "No. Designs are saved in your browser, and share links carry the design inside the link itself, so nothing about your room is stored on our servers."],
  ["What phone do I need to scan?", "Any phone that records video. Walk slowly for 30–60 seconds, keep the lights on and point the camera at the walls and floor. Insta360 .insv files work too."],
  ["Are the furniture sizes real?", "Yes. Library pieces use real catalog dimensions and generated pieces keep the size Lux3D predicts. You can resize anything in the inspector."],
  ["Can I see a piece in my real room?", "Select it and choose View in your room. iPhone opens AR Quick Look and Android opens Scene Viewer, both at the size you set."],
  ["What happens to my photos and videos?", "Photos are resized and stripped of location data in your browser before upload. Scans go to Aholo only to build your 3D room."],
];

function Eyebrow({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="mono-label flex items-center gap-3 text-blue">
      <span className="opacity-60">{n}</span>
      <span className="h-px w-8 bg-current opacity-40" />
      {children}
    </p>
  );
}

function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`display reveal mt-4 text-[clamp(2.4rem,5.2vw,4.4rem)] ${className}`}>{children}</h2>;
}

function TornTop({ ink = false }: { ink?: boolean }) {
  return <div aria-hidden className={`torn-top ${ink ? "ink" : ""}`} />;
}

export default function Home() {
  return (
    <>
      <Motion />
      <HeroCanvas />
      <SiteHeader overlay />
      <main className="flex-1 overflow-x-clip">
        {/* HERO ---------------------------------------------------------------------------------------- */}
        <section id="hero" className="band relative flex min-h-[100svh] items-center overflow-hidden">
          <div aria-hidden className="field" />
          <div aria-hidden className="tear tear-a">
            <div className="fringe" />
            <div className="paper">
              <Shot name="after" widths={[1280, 1920, 3840]} sizes="100vw" alt="" priority />
            </div>
          </div>
          <div aria-hidden className="tear tear-b">
            <div className="fringe" />
            <div className="paper">
              <Shot name="style-japandi" widths={[720, 1440, 2160]} sizes="100vw" alt="" />
            </div>
          </div>
          <div aria-hidden className="grain" />
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <i className="absolute inset-y-0 left-[25%] border-l border-dashed border-white/20" />
            <i className="absolute inset-y-0 left-[75%] border-l border-dashed border-white/20" />
            <i className="absolute inset-x-0 top-[42%] border-t border-dashed border-white/20" />
          </div>
          {[
            ["left-[27%] top-[10%]", "Text to 3D\nLux3D"],
            ["right-[4%] top-[10%] text-right", "Doors that\nopen"],
            ["left-[77%] top-[20%]", "One-tap\nstyles"],
            ["left-[27%] bottom-[9%]", "AR and\nexport"],
            ["left-[77%] bottom-[9%]", "Built on\nAholo"],
          ].map(([pos, text]) => (
            <p key={text} className={`hero-dim mono-label pointer-events-none absolute z-10 hidden whitespace-pre-line text-white/80 mix-blend-difference md:block ${pos}`}>
              {text}
            </p>
          ))}

          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-[52vh] md:pt-24">
            <div className="hero-band hatch dash-x relative max-w-[44rem] px-6 py-8 md:px-10 md:py-10">
              <p className="mono-label absolute -top-7 left-6 text-white/60 md:left-10">Scan it · Remix it · Live in it</p>
              <h1 className="flex items-center gap-[0.22em] text-[clamp(3.6rem,10vw,8.6rem)]">
                <LogoMark className="hero-mark h-[0.78em] w-auto shrink-0 text-[#d9dce6]" />
                <span className="hero-word chrome display bg-[length:100%_260%]">ReRoom</span>
              </h1>
            </div>
            <div className="hero-copy mt-8 max-w-[34rem]">
              <p className="text-[clamp(1.1rem,2vw,1.35rem)] font-light leading-relaxed text-white">
                Scan your room with your phone, add furniture you describe or photograph, open its doors and drawers, and restyle everything. In 3D, in the
                browser.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/scan" className="glass glass--light" data-magnetic>
                  Scan my room <ArrowRight size={16} />
                </Link>
                <Link href="/studio?room=industrial-loft" className="glass" data-magnetic>
                  Try a sample room
                </Link>
              </div>
              <p className="mono-label mt-6 text-white/55">Chair: Lux3D text-to-3D · finishes: material transfer · parts: part split</p>
            </div>
          </div>
          {/* static poster: carries first paint until the 3D chair takes over */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/hero/chair-poster.webp"
            alt="A mustard velvet armchair generated with Aholo Lux3D"
            width={1036}
            height={1036}
            fetchPriority="high"
            className="hero-poster pointer-events-none absolute left-1/2 top-[10%] z-[4] w-[min(78vw,420px)] -translate-x-1/2 transition-opacity duration-700 md:left-auto md:right-[10%] md:top-1/2 md:w-[min(36vw,560px)] md:-translate-y-1/2 md:translate-x-0"
          />
          <a href="#scan" aria-label="Scroll to the story" className="absolute bottom-6 right-6 z-10 hidden h-11 w-7 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,.4)] md:block">
            <span className="cue absolute left-1/2 top-2.5 h-2 w-[3px] -translate-x-1/2 rounded bg-white" />
          </a>
        </section>

        {/* SCAN ---------------------------------------------------------------------------------------- */}
        <section id="scan" className="sheet flex min-h-screen items-center pb-20 pt-32">
          <TornTop />
          <div aria-hidden className="grain" />
          <div aria-hidden className="rails" />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5">
            <div className="mx-auto max-w-2xl text-center">
              <div className="flex justify-center">
                <Eyebrow n="01">Scan</Eyebrow>
              </div>
              <H2>Your real room, in 3D, in a minute.</H2>
              <p className="reveal mx-auto mt-4 max-w-lg text-lg font-light text-slate">Point your phone at the walls, walk slowly, and Aholo Reality turns the video into a room you can step inside.</p>
            </div>
            <div className="mt-14 grid items-center gap-8 md:grid-cols-[1fr_minmax(260px,1.1fr)_1fr]">
              {[FEATURES.slice(0, 2), FEATURES.slice(2)].map((col, ci) => (
                <ul key={ci} className={`space-y-10 ${ci === 1 ? "md:order-3" : ""}`}>
                  {col.map(({ icon, title, body }) => (
                    <li key={title} className="reveal text-center">
                      <ClayIcon name={icon} className="mx-auto size-24" />
                      <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
                      <p className="mx-auto mt-1 max-w-[16rem] text-sm text-slate">{body}</p>
                    </li>
                  ))}
                </ul>
              ))}
              <div id="scan-stop" aria-hidden className="order-first h-[38vh] md:order-2 md:h-[46vh]" />
            </div>
          </div>
        </section>

        {/* MARQUEE ------------------------------------------------------------------------------------- */}
        <div className="band overflow-hidden border-y border-dashed border-white/15 py-5">
          <div data-drift="-12" className="flex">
            <div className="marquee flex w-max gap-10 whitespace-nowrap text-[clamp(1.6rem,3vw,2.4rem)] font-medium tracking-tight">
              {[...MARQUEE, ...MARQUEE].map((w, i) => (
                <span key={i} className="flex items-center gap-10">
                  <span className={i % 3 === 1 ? "chrome" : "text-white/85"}>{w}</span>
                  <span className="text-blue">✳</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* REMIX --------------------------------------------------------------------------------------- */}
        <section id="remix" className="band py-28">
          <div aria-hidden className="grain" />
          <div aria-hidden className="glow -left-40 top-20 w-[640px]" />
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div id="remix-stop" className="grid min-h-[70vh] items-center md:grid-cols-2">
              <div className="max-w-xl">
                <Eyebrow n="02">Remix</Eyebrow>
                <H2>
                  Describe it. Snap it. <span className="chrome">Place it.</span>
                </H2>
                <p className="reveal mt-4 max-w-md text-lg font-light text-mist">
                  Every piece is real 3D with real materials and a real size, so it sits on your floor the way it would at home.
                </p>
              </div>
              <div aria-hidden className="order-first h-[42vh] md:order-none md:h-auto" />
            </div>
            <div className="mt-6 space-y-8">
              {REMIX.map((r, i) => (
                <article key={r.title} className={`grid items-center gap-6 md:grid-cols-2 md:gap-12 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                  <div data-cut className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-navy shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)]">
                    <Shot name={r.shot.name} widths={r.shot.widths} sizes="(min-width: 768px) 600px, 100vw" alt={`${r.title} in the ReRoom studio`} className="object-left-top" />
                  </div>
                  <div className="glass-panel reveal p-8 md:p-10">
                    <span className="mono-label text-ultra-soft">{r.tag}</span>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight">{r.title}</h3>
                    <p className="mt-3 font-light text-mist">{r.body}</p>
                    <Link href="/studio?room=industrial-loft" className="glass glass--sm mt-6">
                      Open in the studio <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ALIVE --------------------------------------------------------------------------------------- */}
        <section id="alive" className="sheet pb-28 pt-32">
          <TornTop />
          <div aria-hidden className="grain" />
          <div aria-hidden className="rails" />
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div id="alive-stop" className="grid min-h-[70vh] items-center md:grid-cols-2">
              <div className="max-w-xl">
                <Eyebrow n="03">Alive</Eyebrow>
                <H2>Furniture that comes alive.</H2>
                <p className="reveal mt-4 max-w-md text-lg font-light text-slate">
                  Lux3D articulation finds every hinge and slide, so wardrobes swing open and drawers glide out right in the browser. Part split takes a
                  piece apart, like the chair you see here.
                </p>
                <ul className="reveal mt-6 space-y-2 text-slate">
                  {["Double-click any piece to open it", `${manifest.urdf.length} library pieces open today`, "Add moving parts to anything you generate"].map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <DoorOpen size={17} className="text-blue" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div aria-hidden className="order-first h-[42vh] md:order-none md:h-auto" />
            </div>
            <div className="relative mt-16">
              <div aria-hidden className="absolute left-0 right-0 top-5 hidden h-px bg-blue/60 md:block" data-line />
              <ol className="grid gap-10 md:grid-cols-3">
                {STEPS.map((s) => (
                  <li key={s.n} className="reveal">
                    <span className="mono-label relative z-10 flex size-10 items-center justify-center rounded-full bg-paper text-blue shadow-[inset_0_0_0_1.5px_var(--color-blue)]">{s.n}</span>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-1 text-sm text-slate">{s.body}</p>
                    <div data-cut className="cut relative mt-5 aspect-[16/10] overflow-hidden bg-navy">
                      <Shot name={s.shot.name} widths={s.shot.widths} sizes="(min-width: 768px) 400px, 100vw" alt={s.title} />
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* STYLES -------------------------------------------------------------------------------------- */}
        <section id="styles" className="band pb-28 pt-36">
          <TornTop ink />
          <div aria-hidden className="grain" />
          <div aria-hidden className="glow -right-40 top-40 w-[700px]" />
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div id="styles-stop" className="grid min-h-[75vh] items-center md:grid-cols-2">
              <div aria-hidden className="h-[40vh] md:h-auto" />
              <div className="max-w-xl">
                <Eyebrow n="04">Restyle</Eyebrow>
                <H2>
                  One room. <span className="chrome">Eight moods.</span>
                </H2>
                <p className="reveal mt-4 max-w-md text-lg font-light text-mist">
                  Lux3D material transfer re-finishes every piece from a single photo of a material. Try it on the chair, then scroll on to see whole rooms
                  change.
                </p>
                <div className="reveal mt-7">
                  <MaterialChips />
                </div>
                <p className="mono-label mt-4 text-mist/70">Velvet as generated · leather, linen, bouclé by material transfer</p>
              </div>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-4">
              {STYLES.map((s, i) => (
                <figure key={s.id} className={i % 2 ? "md:mt-10" : ""}>
                  <div data-cut className="cut relative aspect-[4/5] overflow-hidden bg-navy">
                    <Shot name={`style-${s.id}`} widths={[720, 1440, 2160]} sizes="(min-width: 768px) 300px, 50vw" alt={`The loft in ${s.name} style`} />
                  </div>
                  <figcaption className="mono-label mt-3 text-mist">{s.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ASSETS -------------------------------------------------------------------------------------- */}
        <section id="assets" className="sheet pb-28 pt-32">
          <TornTop />
          <div aria-hidden className="grain" />
          <div aria-hidden className="rails" />
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
              <div>
                <Eyebrow n="05">Made with Aholo</Eyebrow>
                <H2>Every object here was generated, not bought.</H2>
              </div>
              <p className="reveal text-lg font-light text-slate">
                {library.length} Lux3D models, {VARIANTS} restyled finishes, {manifest.urdf.length} articulated pieces, three SpatialGen rooms and the hero
                chair set. Tap any piece to spin it in 3D.
              </p>
            </div>
            <dl className="reveal mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-line md:grid-cols-5">
              {[
                [library.length, "Lux3D models"],
                [VARIANTS, "Restyled finishes"],
                [manifest.urdf.length, "Pieces that open"],
                [3, "SpatialGen rooms"],
                [10, "Aholo capabilities"],
              ].map(([n, label]) => (
                <div key={label} className="bg-white p-6">
                  <dt className="display text-5xl text-blue" data-count={n}>
                    {n}
                  </dt>
                  <dd className="mono-label mt-2 text-slate">{label}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-12">
              <AssetGallery />
            </div>
          </div>
        </section>

        {/* PRICING ------------------------------------------------------------------------------------- */}
        <section id="pricing" className="band pb-28 pt-32">
          <TornTop ink />
          <div aria-hidden className="grain" />
          <div aria-hidden className="glow left-1/2 top-1/3 w-[800px] -translate-x-1/2" />
          <div className="relative z-10 mx-auto max-w-6xl px-5">
            <div className="text-center">
              <div className="flex justify-center">
                <Eyebrow n="06">Plans</Eyebrow>
              </div>
              <H2>
                <span className="chrome">Free</span> while we&apos;re in beta.
              </H2>
              <p className="reveal mt-3 font-light text-mist">Paid plans arrive at launch. No card needed today.</p>
            </div>
            <div className="mt-14 grid items-center gap-5 md:grid-cols-3">
              {PLANS.map((p) => (
                <div key={p.name} className={`reveal glass-panel p-8 ${p.featured ? "py-11 shadow-[inset_0_1px_0_rgba(255,255,255,.25),inset_0_0_0_1px_rgba(27,104,252,.6),0_40px_90px_-30px_rgba(27,104,252,.6)]" : ""}`}>
                  <span className={`mono-label ${p.featured ? "text-ultra-soft" : "text-mist"}`}>{p.tag}</span>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-2xl font-light text-mist">$</span>
                    <span className="display text-7xl">{p.price}</span>
                  </div>
                  <p className="text-sm text-mist">
                    {p.name} · {p.per}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm font-light">
                    {p.items.map((i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="size-1.5 rounded-full bg-blue" />
                        {i}
                      </li>
                    ))}
                  </ul>
                  <Link href="/scan" className={`glass mt-8 w-full ${p.featured ? "glass--blue" : ""}`} data-magnetic>
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AR ------------------------------------------------------------------------------------------ */}
        <section id="ar" className="sheet pb-28 pt-36">
          <TornTop />
          <div aria-hidden className="grain" />
          <div aria-hidden className="rails" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 md:grid-cols-2">
            <div className="relative z-10 max-w-xl">
              <Eyebrow n="07">Take it with you</Eyebrow>
              <H2>See it in your room, for real.</H2>
              <p className="reveal mt-4 max-w-md text-lg font-light text-slate">Scan the code and the piece stands on your floor at the size you chose, through your phone camera.</p>
              <ul className="mt-8 space-y-5">
                {[
                  ["i_scan", "Phone AR", "AR Quick Look on iPhone, Scene Viewer on Android, from a QR code."],
                  ["i_private", "Share a link", "The whole design lives inside the link. Nothing is stored."],
                  ["i_export", "Export anything", "GLB, USDZ, STL, 3MF, OBJ and FBX, from Lux3D multi-format export."],
                  ["i_style", "Before and after", "Same camera, saved as an image to send to anyone."],
                ].map(([icon, t, b]) => (
                  <li key={t} className="reveal flex items-center gap-4">
                    <ClayIcon name={icon} className="size-14 shrink-0" />
                    <span>
                      <span className="block text-lg font-semibold tracking-tight">{t}</span>
                      <span className="text-sm text-slate">{b}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div id="ar-stop" className="relative z-[4] flex justify-center">
              <div className="relative h-[560px] w-[280px] rounded-[48px] bg-ink p-3 shadow-[0_50px_90px_-30px_rgba(5,7,18,.7),inset_0_0_0_1px_rgba(255,255,255,.08)]">
                <div className="absolute left-1/2 top-5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />
                <div id="ar-phone-screen" className="relative h-full w-full overflow-hidden rounded-[38px] bg-navy">
                  <Shot name="before" widths={[1280, 1920]} sizes="280px" alt="A room seen through the phone camera" className="object-[38%_50%]" />
                  <span className="mono-label absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1.5 text-white backdrop-blur">AR · 95 cm tall</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BUILT ON AHOLO ------------------------------------------------------------------------------ */}
        <section id="aholo" className="band pb-28 pt-32">
          <TornTop ink />
          <div aria-hidden className="grain" />
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow n="08">Built on Aholo</Eyebrow>
                <H2 className="max-w-3xl">
                  Ten Aholo tools, <span className="chrome">one product.</span>
                </H2>
              </div>
              <div className="reveal flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/aholo.svg" alt="Aholo" className="h-9 w-auto" />
                <span className="mono-label text-mist">by Manycore</span>
              </div>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {AHOLO.map(([t, b], i) => (
                <div key={t} className="reveal glass-panel p-6">
                  <span className="mono-label text-ultra-soft">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">{t}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-mist">{b}</p>
                </div>
              ))}
            </div>
            <p className="reveal mt-8 text-center">
              <Link href="/made-with-aholo" className="glass glass--sm">
                How this page was made <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </section>

        {/* FAQ ----------------------------------------------------------------------------------------- */}
        <section id="faq" className="sheet pb-32 pt-32">
          <TornTop />
          <div aria-hidden className="grain" />
          <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Eyebrow n="09">FAQ</Eyebrow>
              <H2>The practical questions, answered.</H2>
              <p className="reveal mt-4 max-w-sm font-light text-slate">Still unsure? Open a sample room. No account, no download.</p>
            </div>
            <div className="space-y-3">
              {FAQ.map(([q, a]) => (
                <details key={q} className="paper-panel reveal group p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold tracking-tight">
                    {q}
                    <span className="mono-label flex size-8 shrink-0 items-center justify-center rounded-full bg-blue text-white transition-transform duration-500 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm font-light leading-relaxed text-slate">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA ----------------------------------------------------------------------------------------- */}
        <section id="cta" className="band flex min-h-[92vh] items-center overflow-hidden py-24">
          <TornTop ink />
          <div aria-hidden className="field opacity-80" />
          <div aria-hidden className="grain" />
          <div className="relative z-10 mx-auto grid w-full max-w-7xl px-5 md:grid-cols-2">
            <div className="max-w-xl pt-[44vh] md:pt-0">
              <Eyebrow n="10">Your turn</Eyebrow>
              <h2 className="display reveal mt-4 text-[clamp(3rem,6.4vw,5.6rem)]">
                Your room is one <span className="chrome">video away.</span>
              </h2>
              <p className="reveal mt-4 max-w-md text-lg font-light text-white/80">Scan it tonight, furnish it tomorrow, buy only what fits.</p>
              <div className="reveal mt-8 flex flex-wrap gap-3">
                <Link href="/scan" className="glass glass--light" data-magnetic>
                  Scan my room <ArrowRight size={16} />
                </Link>
                <a href={GITHUB_URL} className="glass" data-magnetic>
                  <GithubIcon size={16} /> View the source
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
