import Image from "next/image";
import Link from "next/link";
import HeroCompare from "@/components/HeroCompare";
import { GITHUB_URL, SiteFooter, SiteHeader } from "@/components/Site";

const STEPS = [
  {
    title: "Scan",
    body: "Walk your room for a minute with your phone. Aholo Reality rebuilds it as a photoreal 3D space you can step inside.",
    img: "/marketing/step-scan.webp",
  },
  {
    title: "Create",
    body: "Pick from the library, describe anything in words, or snap a product photo. Lux3D builds it with real materials at real size.",
    img: "/marketing/step-create.webp",
  },
  {
    title: "Open",
    body: "Wardrobes swing open, drawers slide out, lids lift. Lux3D articulation finds the hinges so furniture behaves like furniture.",
    img: "/marketing/step-open.webp",
  },
  {
    title: "Restyle",
    body: "One tap turns every piece Japandi, Industrial or Cyberpunk with Lux3D material transfer. Switching back is instant.",
    img: "/marketing/step-restyle.webp",
  },
];

const STYLES = [
  { id: "original", name: "Original" },
  { id: "japandi", name: "Japandi" },
  { id: "industrial", name: "Industrial" },
  { id: "cyberpunk", name: "Cyberpunk" },
];

const AHOLO = [
  ["World API · Reality", "Phone video or Insta360 capture becomes a 3D Gaussian splat room", "Scan"],
  ["World API · SpatialGen", "A sentence becomes a walkable dream room", "Dream rooms, sample rooms"],
  ["Asset API", "Uploads scans, photos and material references", "Scan, restyle"],
  ["Aholo Viewer", "Renders the splat room and every GLB in one depth buffer, so walls hide furniture correctly", "Studio, share pages"],
  ["Lux3D text-to-3D", "Describe a piece, get a PBR model with AI-predicted real size", "Describe"],
  ["Lux3D image-to-3D", "A product photo becomes a 3D model", "Photo"],
  ["Lux3D articulation", "Finds doors, drawers and lids; we drive the joints in the browser", "Open / close"],
  ["Lux3D material transfer", "Restyles each piece from a material reference, cached per style", "Styles, material from photo"],
  ["Lux3D part split", "Splits a model into parts for per-part edits", "Server API (studio UI next)"],
  ["Lux3D multi-format export", "USDZ for iPhone AR, STL and 3MF for 3D printing, OBJ and FBX for DCC tools", "Export"],
];

const PLANS = [
  { name: "Free", price: "$0", per: "", items: ["1 room scan", "5 AI pieces a month", "All 8 styles", "Share links and AR"], cta: "Start free" },
  { name: "Plus", price: "$9", per: "/month", items: ["5 room scans", "100 AI pieces a month", "HD tour videos", "No watermark"], cta: "Try Plus", featured: true },
  { name: "Pro", price: "$29", per: "/month", items: ["Unlimited rooms", "Client share pages", "Branded exports", "Priority generation"], cta: "For designers" },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:pt-20">
          <div>
            <h1 className="font-display text-[clamp(2.6rem,5.5vw,4.4rem)] font-medium leading-[1.02] tracking-[-0.02em]">
              Redesign your real room before you buy a thing.
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-slate">
              Scan your room with your phone, add furniture you describe or photograph, open its doors and drawers, and restyle the whole space in one
              tap. All in the browser.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/scan" className="inline-flex h-12 items-center rounded-btn bg-blue px-6 text-[15px] font-medium text-white hover:bg-blue-deep">
                Scan my room
              </Link>
              <Link href="/studio?room=industrial-loft" className="inline-flex h-12 items-center rounded-btn border border-line px-6 text-[15px] font-medium hover:bg-paper">
                Try a sample room
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate">No account needed. Built on Aholo Reality, SpatialGen, Lux3D and the Aholo Viewer.</p>
          </div>
          <HeroCompare before="/marketing/before.webp" after="/marketing/after.webp" alt="A studio apartment" />
        </section>

        {/* How it works */}
        <section id="how" className="border-t border-line bg-paper py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="max-w-2xl font-display text-4xl leading-tight">From a phone video to a room you can walk through, in four steps.</h2>
            <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="overflow-hidden rounded-panel bg-white">
                  <div className="relative aspect-[4/3] bg-ink">
                    <Image src={s.img} alt={`${s.title} step`} fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-lg text-blue">{i + 1}</span>
                      <h3 className="font-display text-2xl">{s.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Restyle */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
              <h2 className="max-w-xl font-display text-4xl leading-tight">Same room. Same furniture. Four moods.</h2>
              <p className="max-w-sm text-slate">
                Every piece gets a new finish from Lux3D material transfer. Results are cached per piece and style, so flipping back costs nothing.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {STYLES.map((s) => (
                <figure key={s.id} className="overflow-hidden rounded-panel border border-line">
                  <div className="relative aspect-square bg-paper">
                    <Image src={`/marketing/style-${s.id}.webp`} alt={`The room in ${s.name} style`} fill sizes="(min-width: 768px) 280px, 50vw" className="object-cover" />
                  </div>
                  <figcaption className="px-3 py-2 text-sm font-medium">{s.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Aholo */}
        <section id="aholo" className="bg-ink py-20 text-white">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="max-w-2xl font-display text-4xl leading-tight">Built end to end on the Aholo stack.</h2>
            <p className="mt-4 max-w-2xl text-white/70">
              Ten Aholo capabilities, nine of them in the studio today. The API key stays on the server, and every result is fetched through our API.
            </p>
            <div className="mt-10 overflow-x-auto rounded-panel border border-white/10">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-white/5 text-white/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Capability</th>
                    <th className="px-4 py-3 font-medium">What it does in ReRoom</th>
                    <th className="px-4 py-3 font-medium">Where you see it</th>
                  </tr>
                </thead>
                <tbody>
                  {AHOLO.map(([cap, what, where]) => (
                    <tr key={cap} className="border-t border-white/10">
                      <td className="px-4 py-3 font-medium">{cap}</td>
                      <td className="px-4 py-3 text-white/75">{what}</td>
                      <td className="px-4 py-3 text-white/60">{where}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="font-display text-4xl">Simple plans</h2>
            <p className="mt-2 text-slate">Free during the beta. Paid plans arrive at launch.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {PLANS.map((p) => (
                <div key={p.name} className={`rounded-panel border p-6 ${p.featured ? "border-blue shadow-[0_10px_40px_-12px_rgb(47_107_255/0.45)]" : "border-line"}`}>
                  <h3 className="font-display text-2xl">{p.name}</h3>
                  <div className="mt-2">
                    <span className="font-display text-4xl">{p.price}</span>
                    <span className="text-slate">{p.per}</span>
                  </div>
                  <ul className="mt-5 space-y-2 text-sm">
                    {p.items.map((i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-blue">✓</span>
                        {i}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/scan"
                    className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-btn text-sm font-medium ${p.featured ? "bg-blue text-white hover:bg-blue-deep" : "border border-line hover:bg-paper"}`}
                  >
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="border-t border-line bg-amber-soft py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 md:flex-row md:items-center">
            <h2 className="flex-1 font-display text-3xl leading-tight">Your room is one short video away.</h2>
            <div className="flex gap-3">
              <Link href="/scan" className="inline-flex h-12 items-center rounded-btn bg-ink px-6 font-medium text-white">Scan my room</Link>
              <a href={GITHUB_URL} className="inline-flex h-12 items-center rounded-btn border border-ink/20 bg-white px-6 font-medium">View the source</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
