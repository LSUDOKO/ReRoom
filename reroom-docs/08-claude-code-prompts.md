# 08 — Prompts for Claude Code (paste in order)

Start every session with Prompt 0. One prompt at a time; test; commit.

---

## Prompt 0 — Session context
```
You are building ReRoom (docs in /docs, rules in CLAUDE.md). Read README and 00–12 first.
Follow docs/07-build-plan.md; tell me which step you're on and what "done" means for it.
Rules:
- Aholo calls only in apps/worker (or server routes) via @manycore/aholo-sdk-* >= 1.8.0, region 'com'.
  AHOLO_API_KEY never in client code or git.
- Before writing any Aholo call, read refs/aholo-spatial-sdk (README + typescript/examples),
  the SDK type definitions, and https://labs.aholo3d.com/api-docs/en/sdk. Don't guess names.
  Keep docs/api-notes.md updated with exact methods, params and output fields.
- For the 3D viewer, read refs/aholo-viewer docs and .claude/skills/use-aholo-viewer first.
- Download every Aholo result immediately (URLs expire ~2 h). Respect AHOLO_MAX_CONCURRENCY.
- Use Context7 for library docs. After each UI feature, open the app with Playwright,
  screenshot it, check the console, and fix errors.
- Keep a working demo at all times. Ask me before changing scope.
```

## Prompt 1 — Setup + API notes
```
1) Create the monorepo from docs/05 §3 (Next.js 15 web app, Node worker, shared package).
2) Install @manycore/aholo-sdk-asset, -world, -lux3d, -core (>=1.8.0) in the worker.
3) Read the SDK examples and types. Write docs/api-notes.md covering: asset.uploadFile,
   world.reconstructions.create, world.generations.create, world.waitFor (+ timeout options,
   output fields), Lux3D text-to-3D, image-to-3D (size options), retopology, material transfer,
   articulation, part split, export (formats), task waiting, error classes.
4) Build apps/worker/src/cli.ts as `pnpm aholo <cmd>` for each capability (with --out for downloads).
Show me api-notes.md before continuing.
```

## Prompt 2 — Start slow jobs now
```
Using the CLI:
1) Upload ./capture/room.mp4 and start a reconstruction (scene 'model', quality 'normal'). Log worldId.
2) Start a SpatialGen generation with the first dream-room prompt in docs/06 §5. Log worldId.
3) Write scripts/seed-library.ts: reads content/library.json (create it from docs/06 §2 with full
   prompts), runs text-to-3D → retopology (15k tris / 1024 tex) → articulation for items with
   articulate=true → downloads → normalizes → uploads to storage → writes content/library.lock.json.
   Resumable, concurrency-limited. Start it in the background and tell me how to monitor it.
```

## Prompt 3 — Viewer spike (decide architecture)
```
Spike per docs/04 §1: in apps/web create /spike that loads (a) a sample splat from
refs/aholo-viewer examples and (b) one GLB from the library into @manycore/aholo-viewer.
Answer the 5 questions in docs/04 §1 in docs/api-notes.md with evidence (screenshots via Playwright).
Recommend option A, B or C and implement lib/viewer/aholoViewer.ts as the only wrapper.
```

## Prompt 4 — Room loading + calibration
```
Implement rooms: status page (polls /api/rooms/:id), room loading in the viewer from our storage
URLs, and calibration per docs/04 §3 (floor fit with fallback 3-click, 2-point scale, save to DB,
1 m reference cube check). Use my real room (worldId from Prompt 2) as the first test.
```

## Prompt 5 — Editor & placement
```
Build the editor layout in docs/02 §4 and placement system in docs/04 §4–5: library panel with
search/categories, drag to place on floor, rotate (Q/E), delete, duplicate, undo/redo (command
pattern), selection outline, dimension labels, contact shadows, lighting match (docs/04 §7).
Save placements to the design (guest: localStorage; signed-in: DB).
```

## Prompt 6 — Live generation
```
Implement /api/items/generate (text + photo) and worker chain per docs/03 §4.2 with jobs table,
queue, retries, library reuse by embedding similarity, safety filter (docs/06 §7).
Client: ghost box with category size at cursor, progress, materialize dissolve, failure state
with Retry / similar from library.
```

## Prompt 7 — Articulation
```
Implement articulation playback per docs/04 §6: load clips, toggle open/close on double-click or
Inspector button, reverse play, SFX. Add "Make it open" checkbox for generated storage items that
triggers the articulation job. Verify all 6+ seed articulated items in my room.
```

## Prompt 8 — Restyle
```
Implement styles per docs/03 §4.3 and docs/06 §3: styles.json, material reference images,
category→slot mapping, transfer jobs only for missing variants, variant cache, style chips +
Style Roulette, progress per item, instant switch back.
```

## Prompt 9 — Before/after, walk, share, AR
```
Implement before/after slider + PNG/GIF export (docs/04 §9), walk mode (docs/04 §8),
share links (private by default, revocable, /s/[shareId] viewer), and AR: export USDZ via
Lux3D export (iOS Quick Look link) + GLB Scene Viewer intent (Android) + QR code on desktop.
```

## Prompt 10 — Product polish
```
Build landing page, capture guide, onboarding tour (3 steps), sample rooms, settings (units,
quality), delete-my-data, ?demo=1 mode (no Aholo calls). Apply the design system in docs/02 §7.
Add PostHog events from docs/09 §5 and Sentry. Then run the QA checklist in docs/09 §1 with
Playwright and fix failures.
```

## Prompt 11 — Deploy
```
Deploy web to Vercel and worker to Railway/Render with env vars from docs/05 §7. Verify signed
URLs, CORS, and a full flow on the public URL in an incognito window and on a phone.
Write README: GIF, live link, features, "Built with Aholo" table (docs/03 §1), setup, credits.
```

## Prompt 12 — Optional extras (only if time)
```
In order, stop when time runs out: photo material swap (D3), SpatialGen dream room flow (A4),
part editing (B6), mini-room STL export (F4), in-app tour recording (F5).
```
