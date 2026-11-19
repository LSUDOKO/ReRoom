<p align="center">
  <img src="public/logo-512.png" alt="ReRoom" width="112" />
</p>

<h1 align="center">ReRoom</h1>

<p align="center"><b>Scan it. Remix it. Live in it.</b><br/>
For anyone furnishing a room: see real furniture at its real size in your own room, open its doors, restyle it, and walk through it in the browser or in VR, before you buy. Every room and every 3D object is generated with Aholo.</p>

<p align="center">
  <b><a href="https://reroom.adoranto737.workers.dev">▶ Live site</a></b> ·
  <b><a href="https://reroom.adoranto737.workers.dev/studio?room=industrial-loft">Open the studio</a></b> ·
  <b><a href="https://reroom.adoranto737.workers.dev/xr">Step inside (VR)</a></b> ·
  <b><a href=".github/readme/ReRoom-VR.mp4">🎥 VR film</a></b> ·
  <b><a href=".github/readme/ReRoom-Project-Report.pdf">📄 Project report (PDF)</a></b> ·
  <b><a href="https://reroom.adoranto737.workers.dev/made-with-aholo">Every Aholo asset</a></b>
</p>

<p align="center">
  <a href="https://reroom.adoranto737.workers.dev"><img alt="Live site" src="https://img.shields.io/badge/live%20site-open-1b68fc?style=flat-square&logo=cloudflare&logoColor=white"></a>
  <a href="https://reroom.adoranto737.workers.dev/studio?room=industrial-loft&demo=1"><img alt="Try the studio" src="https://img.shields.io/badge/studio-try%20a%20sample%20room-1f2bff?style=flat-square"></a>
  <a href="https://reroom.adoranto737.workers.dev/made-with-aholo"><img alt="Made with Aholo" src="https://img.shields.io/badge/every%203D%20object-made%20with%20Aholo-aeb4ff?style=flat-square"></a>
  <br/>
  <img alt="Aholo Lux3D" src="https://img.shields.io/badge/Aholo-Lux3D%20·%20World%20·%20Viewer-050712?style=flat-square">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-050712?style=flat-square&logo=nextdotjs&logoColor=white">
  <img alt="React Three Fiber" src="https://img.shields.io/badge/React%20Three%20Fiber-9-050712?style=flat-square&logo=threedotjs&logoColor=white">
  <img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-050712?style=flat-square&logo=cloudflareworkers&logoColor=white">
  <a href="LICENSE"><img alt="MIT" src="https://img.shields.io/badge/code-MIT-f1f2f6?style=flat-square"></a>
  <img alt="Manycore Aholo Global 3D AI Hackathon" src="https://img.shields.io/badge/Manycore%20Aholo-Global%203D%20AI%20Hackathon%202026-1b68fc?style=flat-square">
</p>

<img src=".github/banner.png" alt="ReRoom: the chrome RR wordmark over a torn-paper render of a furnished loft, with the Lux3D armchair" width="100%" />

<p align="center">
  <img src=".github/readme/landing-scroll.gif" alt="Scrolling the ReRoom landing page: the Lux3D armchair travels from section to section, dissolves into particles, draws a wireframe room, flies apart into its parts, changes finish and lands in a phone" width="100%" />
</p>

<p align="center"><a href=".github/readme/ReRoom-Project-Report.pdf"><img src=".github/readme/report-cover.jpg" alt="ReRoom project report, 14 slides: problem, Aholo pipeline, generated assets, comparisons and results" width="100%" /></a><br/><sub>Click for the 14-slide project report (PDF): process, key Aholo assets, before / after comparisons and results.</sub></p>

## What works today (verifiable)

No account, no install, no sign-up wall. Every link opens straight into the product.

| What | Try it | Aholo behind it |
|---|---|---|
| A photoreal 3D room you can orbit and walk through | [Industrial loft](https://reroom.adoranto737.workers.dev/studio?room=industrial-loft) · [Coastal bedroom](https://reroom.adoranto737.workers.dev/studio?room=coastal-bedroom) · [Japandi studio](https://reroom.adoranto737.workers.dev/studio?room=japandi-studio) | World · SpatialGen, Aholo Viewer |
| 24 real-size furniture models, dragged onto the floor | Studio → **Library** | Lux3D text-to-3D |
| Doors and drawers that open (7 pieces) | Studio → add the wardrobe → **Open it** | Lux3D articulation (URDF) |
| Eight one-tap styles and Style Roulette | Studio → style bar under the room | Lux3D material transfer |
| Before / after, walk mode, AR, share links, 6 export formats | Studio top bar and inspector | Lux3D multi-format export |
| Hands-only VR in three Aholo rooms | [reroom.adoranto737.workers.dev/xr](https://reroom.adoranto737.workers.dev/xr) in a headset browser | World panoramas + Lux3D models |
| A list of every generated asset with its prompt | [/made-with-aholo](https://reroom.adoranto737.workers.dev/made-with-aholo) | All of the above |

## Why it matters

Furniture is bought on a guess. You measure an alcove, scroll a catalogue, try to picture a 228 cm sofa against a 212 cm wall, and find out on delivery day.

- US shoppers returned an estimated **$890 billion** of goods in 2024, **16.9%** of retail sales ([NRF and Happy Returns, Dec 2024](https://nrf.com/media-center/press-releases/nrf-and-happy-returns-report-2024-retail-returns-total-890-billion)).
- **Seven in ten** Londoners who bought furniture online in the last two years had to rearrange their homes because items did not fit ([ChannelLife, Jan 2026](https://channellife.co.uk/story/londoners-battle-furniture-fit-gap-in-tiny-homes)).
- Returning a sofa can cost **$150–300** in reverse shipping alone ([Claimlane, 2026](https://www.claimlane.com/resources/blog/furniture-returns-management)).

Photos can't show scale and phone AR is a small window. **Why now:** Aholo makes the hard parts cheap enough to do per shopper. A room comes from a phone video or one sentence (World), a piece of furniture from a prompt or photo (Lux3D), and its joints and finishes from the same model (articulation, material transfer).

**ReRoom** turns the guess into a preview, built end to end on the **Aholo** platform by Manycore:

1. **Scan**: walk your room for a minute with your phone. **Aholo World · Reality** rebuilds it as a photoreal 3D Gaussian-splat room. No room handy? **SpatialGen** builds one from a sentence.
2. **Remix**: add pieces from a 24-model library, **describe** anything, or **snap a product photo**. **Lux3D** builds it with PBR materials at its real size.
3. **Open**: wardrobes swing, drawers slide, lids lift. **Lux3D articulation** finds the joints; ReRoom drives them in the browser.
4. **Restyle**: eight one-tap styles plus Style Roulette. **Lux3D material transfer** re-finishes every piece, or uses any material photo you give it.
5. **Live in it**: orbit, top-down, or walk at eye height; compare before and after; place a piece in your real room with **AR**; share a link; export **GLB, USDZ, STL, 3MF, OBJ or FBX**.

Every 3D object on the website, from the hero armchair to the icons, was generated with Aholo too.

## Step inside: ReRoom in VR

<p align="center">
  <a href=".github/readme/ReRoom-VR.mp4"><img src=".github/readme/vr-tour.gif" alt="In VR, a hand pinches furniture from a tray into an Aholo-generated living room: a sofa against the wall, a coffee table, an armchair by the window" width="100%" /></a>
</p>

Put on a VR headset, open **`/xr`** and tap **Enter VR**: you are standing inside a room generated with **Aholo World**. A tray of real-size furniture floats at your lap. Everything is done with your hands:

| Pinch | What happens |
|---|---|
| A card on the tray | That piece stands on the room's floor at its true size |
| A piece, then drag | It slides along the floor, following your hand |
| ⟲ / ⟳ | Turns it, so the sofa faces the TV |
| Open / Close | Doors swing and drawers slide on their real Lux3D joints |
| A style | Japandi, Industrial or Cyberpunk re-finishes every piece at once |
| A room | Switch between the **Japandi studio**, **Industrial loft** and **Coastal bedroom** |

<table>
<tr>
<td width="50%"><img src=".github/readme/vr-japandi.jpg" alt="Japandi studio: a sofa against the wall facing the TV, a coffee table, an armchair and a plant, placed with a pinch" /></td>
<td width="50%"><img src=".github/readme/vr-japandi-industrial.jpg" alt="The same Japandi studio after one pinch on Industrial: the sofa turns rust red" /></td>
</tr>
<tr>
<td align="center"><sub>Japandi studio, furnished piece by piece</sub></td>
<td align="center"><sub>One pinch: the whole room restyled Industrial</sub></td>
</tr>
<tr>
<td><img src=".github/readme/vr-loft.jpg" alt="Industrial loft with brick walls and a city view: a reading armchair, floor lamp and chest of drawers" /></td>
<td><img src=".github/readme/vr-loft-cyberpunk.jpg" alt="The loft restyled Cyberpunk: the armchair turns magenta" /></td>
</tr>
<tr>
<td align="center"><sub>Industrial loft: a reading corner by the big windows</sub></td>
<td align="center"><sub>Restyled Cyberpunk</sub></td>
</tr>
<tr>
<td colspan="2"><img src=".github/readme/vr-bedroom.jpg" alt="Coastal bedroom with a sea view: a wardrobe with its doors open, a plant by the window" /></td>
</tr>
<tr>
<td colspan="2" align="center"><sub>Coastal bedroom: the wardrobe's doors swing open on their real Lux3D joints</sub></td>
</tr>
</table>

**[Watch the VR film](.github/readme/ReRoom-VR.mp4)**: three Aholo rooms furnished piece by piece. In mixed reality, the same tray places the furniture in the room you are actually standing in.

Built with WebXR, `@react-three/xr` and three.js (`src/components/xr/VRRoom.tsx`, maths in `src/lib/xr.ts`). The rooms are Aholo World panoramas projected onto a floor at y = 0, so furniture stands on them. Tested without a headset in the IWER emulator with emulated hands: `node scripts/xr-demo.mjs http://localhost:3000 tmp/tour --vr --tour`. The film's source is in [`video/`](video/README.md).

## See it

<table>
  <tr>
    <td width="50%"><img src=".github/readme/shot-hero.webp" alt="Landing hero: drifting ultramarine field, torn-paper sheets holding renders, the chrome RR wordmark and the Lux3D armchair" /></td>
    <td width="50%"><img src=".github/readme/shot-scan.webp" alt="Scan section: the armchair dissolving into surface-sampled particles between four clay 3D icons" /></td>
  </tr>
  <tr>
    <td><img src=".github/readme/shot-remix.webp" alt="Remix section: the armchair inside a wireframe room" /></td>
    <td><img src=".github/readme/shot-alive.webp" alt="Alive section: the armchair split into its parts by Lux3D part split" /></td>
  </tr>
  <tr>
    <td><img src=".github/readme/shot-styles.webp" alt="Styles section: the armchair with liquid-glass material chips for velvet, leather, linen and bouclé" /></td>
    <td><img src=".github/readme/shot-assets.webp" alt="Made with Aholo section: counts and a gallery of every generated model" /></td>
  </tr>
  <tr>
    <td><img src=".github/readme/shot-aholo.webp" alt="Built on Aholo: the official Aholo wordmark and ten capability cards" /></td>
    <td><img src=".github/readme/shot-cta.webp" alt="Closing section: the armchair in a room corner with a lamp switching on" /></td>
  </tr>
</table>

### The studio

<p align="center"><img src=".github/readme/studio-tour.gif" alt="The ReRoom studio: adding a wardrobe, opening its doors, restyling the room Japandi, Industrial and Cyberpunk, and switching to the top view" width="100%" /></p>

<table>
  <tr>
    <td width="50%"><img src=".github/readme/shot-studio.webp" alt="The dark studio with the furnished industrial loft" /></td>
    <td width="50%"><img src=".github/readme/shot-studio-describe.webp" alt="The Describe tab: type a piece of furniture and Lux3D builds it" /></td>
  </tr>
  <tr>
    <td><img src=".github/readme/shot-scan-page.webp" alt="The scan page: record or upload a room video" /></td>
    <td><img src=".github/readme/shot-made-with-aholo.webp" alt="How this page was made: every asset, its prompt and its Aholo capability" /></td>
  </tr>
</table>

## How to use ReRoom

**Try it with no setup:** open the [sample loft in demo mode](https://reroom.adoranto737.workers.dev/studio?room=industrial-loft&demo=1). Everything in the library works, nothing is generated, and nothing is saved anywhere but your browser.

| Step | What to do | What happens |
|---|---|---|
| **1. Pick a room** | Open a sample room from the landing page, or go to **Scan** and record a slow 30–60 s video (MP4/MOV, or Insta360 `.insv`). | Aholo Reality builds a 3D Gaussian-splat room in a few minutes. You can also type a sentence and SpatialGen builds a dream room. |
| **2. Add furniture** | In the left panel: **Library** (drag in any of 24 pieces), **Describe** (type a piece), or **Photo** (upload a product photo). | Lux3D generates a PBR model at its predicted real size. A ghost shows where it will land while it builds. |
| **3. Arrange** | Drag on the floor to move. `Q`/`E` rotate 15° (`Shift` for 5°), `Ctrl D` duplicates, `Del` removes, `Ctrl Z` undoes. Resize in the inspector. | Pieces stay on the floor and keep real dimensions. The room's walls hide furniture behind them. |
| **4. Open things** | Double-click a wardrobe, chest of drawers, sideboard, fridge or box. For anything you generated, press **Add moving parts**. | Lux3D articulation returns a URDF of links and joints; ReRoom animates the hinges and slides. |
| **5. Restyle** | Pick a style in the bar under the room, or **Roulette**. To use your own material, select a piece and choose **Material from a photo**. | Lux3D material transfer re-finishes each piece. Results are cached per piece and style, so switching back is instant. |
| **6. Look around** | **Orbit**, **Walk** (`W A S D`, drag to look) or **Top**. Change the light: day, evening, night. Open **Before / after**. | The before/after slider compares the empty and furnished room from the same camera, saved as a PNG. |
| **7. Take it with you** | Select a piece and choose **View in your room (AR)**, or export **GLB, USDZ, STL, 3MF, OBJ, FBX**. Press **Share** for a link or a 10-second tour video. | AR opens AR Quick Look on iPhone and Scene Viewer on Android at the size you set. Share links carry the whole design in the URL. |

## How deeply ReRoom uses Aholo

Ten Aholo capabilities, all called from the server with the key kept off the client.

Aholo is load-bearing: without it ReRoom has no rooms, no furniture, no joints and no finishes. Every call goes through one server module, [`src/lib/aholo/server.ts`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/aholo/server.ts), and every Viewer call through [`src/lib/viewer/engine.ts`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/viewer/engine.ts).

| Aholo capability | SDK call (code) | Where you see it in ReRoom |
|---|---|---|
| **World · Reality** | [`world.reconstructions.create`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/aholo/server.ts#L97) | Phone or Insta360 video becomes a 3DGS room (`/scan`) |
| **World · SpatialGen** | [`world.generations.create`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/aholo/server.ts#L107) | A sentence becomes a walkable room; all three sample rooms were made this way |
| **Aholo Viewer** | [`@manycore/aholo-viewer`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/viewer/engine.ts#L29) | The studio renderer: splat room and every GLB share one depth buffer, so walls hide furniture |
| **Lux3D text-to-3D** | [`lux3d.textTo3d.create`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/aholo/server.ts#L29) | "Describe a piece", the 24-model library, the website's hero chair (G1) and clay icons |
| **Lux3D image-to-3D** | [`lux3d.imgTo3d.create`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/aholo/server.ts#L42) | "Snap a photo" |
| **Lux3D articulation** | [`lux3d.articulationAnimation.create`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/aholo/server.ts#L62) | Doors and drawers that open; returns a URDF that [`Engine.loadUrdf`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/viewer/engine.ts#L263) animates |
| **Lux3D material transfer** | [`lux3d.materialTransfer.create`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/aholo/server.ts#L53) | Eight room styles, "material from a photo", the hero chair's leather, linen and bouclé |
| **Lux3D part split** | [`lux3d.partSplit.create`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/aholo/server.ts#L64) | The hero chair flying apart on the landing page |
| **Lux3D multi-format export** | [`lux3d.multiFormatExport.create`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/aholo/server.ts#L68) | USDZ for AR, STL and 3MF for 3D printing, OBJ and FBX for DCC tools |
| **Asset API** | [`asset.uploadBuffer`](https://github.com/LSUDOKO/ReRoom/blob/main/src/lib/aholo/server.ts#L90) | Uploads scans, photos, library models and material references |

**Measured usage** during development, from `lux3d.tasks.list` (`consumedCredits` per task):

| Lux3D task | Tasks | Succeeded | Credits |
|---|---:|---:|---:|
| text-to-3D | 41 | 41 | 540 |
| material transfer | 64 | 63 | 441 |
| articulation | 8 | 8 | 224 |
| part split | 6 | 6 | 180 |
| multi-format export | 3 | 2 | 2 |
| image-to-3D | 1 | 1 | 1 |
| API exploration (multimodal-to-image, four-view, multi-image-to-3D) | 15 | 15 | 200 |
| **Total** | **138** | **136** | **1,588** |

```mermaid
xychart-beta
  title "Lux3D credits by task (measured, 1,588 total)"
  x-axis ["text-to-3D", "material transfer", "articulation", "part split", "API exploration", "export + image-to-3D"]
  y-axis "Credits" 0 --> 600
  bar [540, 441, 224, 180, 200, 3]
```

Plus Aholo World: three SpatialGen rooms and one Reality reconstruction run. Verified method names, parameters, outputs and per-call costs are in [`reroom-docs/api-notes.md`](reroom-docs/api-notes.md).

```mermaid
flowchart LR
  A[Phone video / prompt] -->|/api/upload, /api/worlds| B[Aholo World<br/>Reality / SpatialGen]
  B -->|.spz splat| V[Aholo Viewer<br/>one scene, shared depth]
  P[Prompt / photo] -->|/api/lux3d| L[Lux3D<br/>text / image to 3D]
  L -->|.glb| V
  L -->|meshRef| R[Articulation<br/>URDF joints]
  R -->|zip → blob URLs| V
  L -->|meshRef + swatch| M[Material transfer]
  M -->|variant .glb, cached per style| V
  V --> O[Before/after · Walk · AR · Share · Exports]
```

## Everything we generated with Aholo

All of it lives in this repo, is browsable on the landing page's **Made with Aholo** gallery, and is listed with prompts on [`/made-with-aholo`](https://reroom.adoranto737.workers.dev/made-with-aholo).

<img src=".github/readme/board-library.webp" alt="24 furniture models generated with Lux3D text-to-3D" width="100%" />
<img src=".github/readme/board-finishes.webp" alt="33 restyled finishes made with Lux3D material transfer" width="100%" />
<img src=".github/readme/board-hero.webp" alt="The hero chair: Lux3D G1 text-to-3D in velvet, three material transfers and the part split" width="100%" />
<img src=".github/readme/board-icons.webp" alt="Six clay 3D icons generated with Lux3D in cartoon style" width="100%" />
<img src=".github/readme/board-rooms.webp" alt="Three dream rooms generated with Aholo World SpatialGen" width="100%" />

```mermaid
pie showData
  title "What ships in this repo, by Aholo capability (77 output files)"
  "Lux3D text-to-3D: 24 furniture + hero chair + 6 icons" : 31
  "Lux3D material transfer: 33 + 3 hero finishes" : 36
  "Lux3D articulation: URDF pieces" : 7
  "World SpatialGen: rooms" : 3
```

<sub>Articulated pieces are also counted in the library, so the slices overlap by design: the chart shows which capability produced each output file.</sub>

| Asset set | Count | Aholo capability | Where |
|---|---:|---|---|
| Furniture library | 24 | Lux3D text-to-3D | `public/library/*.glb` |
| Articulated pieces (URDF) | 7 | Lux3D articulation | `public/library/L_*/robot.urdf` |
| Restyled finishes | 33 | Lux3D material transfer | `public/library/variants/` |
| Dream rooms | 3 | World SpatialGen | `public/rooms/*.spz` |
| Hero chair (G1) + 3 finishes + parts + USDZ | 6 | text-to-3D, material transfer, part split, export | `public/site/hero/`, `public/site/ar/` |
| Clay icons | 6 | Lux3D text-to-3D (cartoon) | `public/site/icons/` |

## The website

The landing page is a scroll story in an **ink, paper and ultramarine** system: Outfit and JetBrains Mono, liquid-glass buttons whose highlight follows the cursor, chrome type, torn-paper sheets that tear apart as you scroll, and photos that tear open into view.

- **The 3D chair** is one fixed, transparent React Three Fiber canvas between section backgrounds and text. It travels a Catmull-Rom path through per-section keyframes ([`src/landing/heroKeyframes.ts`](src/landing/heroKeyframes.ts)), trails the scroll with inertia, floats, banks and leans toward the cursor. Each section has its own effect: particle dissolve, wireframe room, part-split explode, four finishes synced with the chips, a landing on the phone screen, and a room corner whose lamp switches on.
- **Performance:** the canvas mounts after first paint behind a poster rendered from the same chair, pixel ratio is capped at 1.75, rendering pauses in hidden tabs, and `prefers-reduced-motion` switches to fades between still poses.
- **Motion:** GSAP for the hero intro, torn sheets, blur-in reveals, paper-cut photo reveals, magnetic buttons, count-ups and the self-drawing step line ([`src/components/landing/Motion.tsx`](src/components/landing/Motion.tsx)).
- **The studio** uses the same tokens in a dark theme (`.studio-dark`), so the dashboard and the site read as one product.

## Status

What has been built and verified (19 November 2026):

| | Feature | How it was verified |
|---|---|---|
| ✅ | Aholo Viewer renders splat rooms and Lux3D GLBs in one depth buffer | Furniture is correctly occluded by the splat floor |
| ✅ | SpatialGen dream rooms | 3 rooms generated and shipped as samples |
| ✅ | Text → 3D, photo → 3D | Live runs through `/api/lux3d`, loaded in the studio via the proxy |
| ✅ | Articulation | All 7 seed pieces plus a live-generated cabinet |
| ✅ | Material transfer restyle | Pre-baked variants for 3 styles, a live restyle, material from a photo (API), the hero chair finishes |
| ✅ | Multi-format export, AR page | USDZ and STL returned; `/ar` renders at the studio size (desktop; not yet on a phone) |
| ✅ | Editor interactions | Driven with real pointer and keyboard events in Playwright |
| ✅ | Landing page 3D hero | Playwright walk of every section at 1440 px and 390 px |
| ✅ | Cloudflare deploy | Live on Workers (OpenNext); live restyle, proxy and a 55 MB upload tested on the deployed site |
| ✅ | Demo mode spends nothing | A file set on a hidden input in demo mode makes 0 `/api/lux3d` requests (tested live) |

## Team

**Arpit Singh** · solo builder: product, design, 3D pipeline, full stack and VR. GitHub [@LSUDOKO](https://github.com/LSUDOKO). Built with AI coding assistance (Claude Code); every claim in this README links to code, a deployed page or a recording.

## Roadmap

- **Next 30 days:** a real 30–60 s phone walkthrough through Aholo Reality, end to end on the deployed site; part-split editing in the studio; ReRoom on a physical VR headset.
- **Next 90 days:** a retailer mode where a store's catalogue is generated with Lux3D and dropped into a shopper's scanned room at true size; shared rooms that two people can furnish together.

## Quick start

Requirements: Node 22+, pnpm, and an Aholo **Global** API key from [labs.aholo3d.com](https://labs.aholo3d.com/api-keys).

```bash
pnpm install                 # also patches Aholo Viewer worker URLs (scripts/patch-viewer.mjs)
cp .env.example .env.local   # then set AHOLO_API_KEY (server-only, never commit it)
pnpm dev                     # http://localhost:3000
```

Open `/studio?room=industrial-loft`, or add `&demo=1` for demo mode with no live Aholo calls.

### Deploy to Cloudflare Workers

```bash
npx wrangler login
npx wrangler kv namespace create REROOM_BUDGET   # put the id in wrangler.jsonc
pnpm cf:deploy                                   # OpenNext build + wrangler deploy
npx wrangler secret put AHOLO_API_KEY            # once, and again whenever you rotate the key
```

`pnpm cf:preview` runs the same build locally in workerd. The build strips `.env.local` values from the Worker bundle (`scripts/cf-strip-env.mjs`); the key only lives in the Worker secret. Credit protection on the deployed site: per-IP and site-wide rate-limit bindings, a per-isolate window, and a daily task budget in KV (`DAILY_TASK_BUDGET`).

### Scripts

| Command | What it does |
|---|---|
| `pnpm seed [ids…]` | Generates the furniture library with Lux3D (text-to-3D → optimize → articulation → URDF). Resumable |
| `tsx --env-file=.env.local scripts/gen-site-assets.mts hero icons` | Generates the website's assets from `content/site-assets.json` (resumable; `--reroll ID --prompt "…"`) |
| `tsx --env-file=.env.local scripts/bake-variants.mts japandi L_SOFA_3 …` | Pre-bakes style variants with material transfer |
| `tsx --env-file=.env.local scripts/gen-world.mts "<prompt>"` | Starts a SpatialGen dream room |
| `node --experimental-strip-types scripts/render-thumbs.mts [url] [group]` | Transparent product renders of every model (model-viewer in headless Chromium) |
| `node --experimental-strip-types scripts/capture.mts [url] [dir] [w] [h] [dpr]` | One screenshot per landing section, plus FPS and console errors |
| `node --experimental-strip-types scripts/record-readme.mts [url]` | Records the README GIFs and screenshots (demo mode, never spends credits) |
| `pnpm test` | Self-checks: prompt guard, proxy allowlist, output picking, sizing, share links |

### Environment

| Variable | Where | Purpose |
|---|---|---|
| `AHOLO_API_KEY` | server | Aholo Global key |
| `AHOLO_REGION` | server | `com` (Global) or `cn` |
| `SITE_URL` | build | Public origin, used for OpenGraph URLs |
| `DAILY_TASK_BUDGET` | server (Workers) | Lux3D + World tasks allowed per UTC day on the deployed site (default 300) |
| `NEXT_PUBLIC_UPLOAD_MAX_MB` | build | Scan upload cap (500 locally, 60 on Workers) |

## Project structure

```
src/
  app/                   landing, /studio, /scan, /view (shared), /ar, /made-with-aholo, privacy, terms
  app/api/               lux3d, worlds, upload, proxy, status
  components/landing/    ScrollHero (R3F), Motion (GSAP), AssetGallery, Shot
  components/studio/     Viewport, AddPanel, Inspector, StyleBar, BeforeAfter, ShareDialog…
  landing/               heroKeyframes.ts (tune the chair per section), heroStore
  lib/aholo/             server.ts: the only module that calls Aholo
  lib/viewer/            engine.ts: the only module that calls the Aholo Viewer
content/                 library, styles, rooms, manifest, site-assets (+ lock)
public/library/          24 Lux3D models, 7 URDF articulations, 33 variants, renders
public/site/             hero chair set, clay icons, AR USDZ
public/rooms/            3 SpatialGen rooms (.spz + panorama)
scripts/                 seed, bake, world, site assets, renders, capture, README recording
```

## Credits

- Built on [Aholo](https://www.aholo.ai) by Manycore: Lux3D, World and the [Aholo Viewer](https://github.com/manycoretech/aholo-viewer) (MIT). The Aholo wordmark in `public/brand/` is a trademark of Manycore, used to credit the platform.
- `src/lib/viewer/camera-control.ts` is adapted from the Aholo Viewer website (MIT).
- Material reference swatches from [ambientCG](https://ambientcg.com) (CC0), listed in `public/materials/CREDITS.txt`.
- Three material reference photos in `content/stock-refs/` are licensed from Adobe Stock; they are **not** covered by the MIT license (see the `LICENSE.txt` there), are not served by the site, and are used only as Lux3D inputs.
- AR via [`<model-viewer>`](https://modelviewer.dev) (Apache-2.0). 3D on the landing page with [React Three Fiber](https://r3f.docs.pmnd.rs) and [drei](https://github.com/pmndrs/drei); motion with [GSAP](https://gsap.com).
- Every furniture model, room, finish and icon in this repo was generated with Aholo Lux3D and Aholo World.

## License

[MIT](LICENSE)
