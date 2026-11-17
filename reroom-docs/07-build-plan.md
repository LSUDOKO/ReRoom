# 07 — Build Plan

**Deadline:** Thu 19 Nov 2026, **4:30 p.m. IST**. **Submit target: 12:00 noon IST Thu.**
Start: Wed 18 Nov, ~00:30 IST → ~35 hours including sleep (~22 working hours).

**Rule:** always keep a working demo. Cut from the bottom of the priority list (§4), never the core story: *scan → place → open → restyle → before/after → share/AR*.

---

## Tonight (Wed 00:30 – 02:30) — start the slow things

| Time | Task | Done when |
| --- | --- | --- |
| 00:30 | Register, team, submit project idea (text in `10`) → credits | Credits visible |
| 00:40 | Global API key → `.env`; install tools from `11`; clone `refs/` | `pnpm aholo --help` (or a test script) works |
| 00:55 | **Record your room video** (60 s, good light) | MP4 on laptop |
| 01:05 | Script: upload + `world.reconstructions.create` → **start reconstruction now** | `worldId` logged; job running |
| 01:15 | Script: start a SpatialGen dream room (backup room) | `worldId` logged |
| 01:25 | `content/library.json` (from `06`) → start batch: text-to-3D → retopo → articulation for 6 items | Batch running overnight (2 at a time) |
| 01:45 | Next.js app skeleton + Aholo Viewer spike: load a sample splat from the viewer repo + one GLB | Splat + GLB on screen |
| 02:30 | Sleep | |

## Wednesday (main build day)

| Time | Task | Done when |
| --- | --- | --- |
| 08:00 | Check reconstruction + batch; download all outputs to storage; reroll bad items | Room + ~20 items ready |
| 08:30 | **Viewer integration** (§1 of `04`): room splat + furniture in one scene; occlusion check; decide A/B | Furniture correctly behind/in front of walls |
| 10:00 | Calibration (floor + 2-point scale) + placement (drag, rotate, snap, delete, undo) | Can furnish the room |
| 12:00 | Lunch; record a 30 s progress clip | |
| 12:30 | Worker + DB + jobs: `/api/items/generate` (text + photo), ghost box, materialize | Live generation in editor |
| 14:30 | Articulation playback (double-click to open/close) | Wardrobe opens in my room |
| 15:30 | Restyle: styles.json + material refs + transfer jobs + variant cache + style bar | 3 styles work end-to-end |
| 17:30 | Before/after slider + walk mode | Both work |
| 18:30 | Share link (view-only page) + AR (USDZ export + QR) | Phone opens AR |
| 19:30 | Landing page + onboarding + capture guide + sample rooms + `?demo=1` | Stranger can try it |
| 20:30 | **Feature freeze.** Deploy web (Vercel) + worker (Railway/Render) | Public URL works |
| 20:30–22:30 | Polish: lighting match, contact shadows, materialize effect, sounds, UI copy | Looks like a product |
| 22:30–23:30 | QA (checklist in `09`), fix blockers | No blockers |
| 23:30 | Record raw footage (OBS 1080p60): full story in your real room | Footage saved |

## Thursday (submission)

| Time | Task |
| --- | --- |
| 07:30–09:00 | Edit 90 s demo video (script in `10`); optional LuxReal tour clip |
| 09:00–10:30 | Project report (PDF/PPT) — outline in `10` |
| 10:30–11:00 | GitHub public + README; ModelScope publish; X post #Manycorehackathon |
| 11:00–12:00 | Submit; test every link in an incognito window |
| 12:00–16:30 | Buffer only |

---

## Definition of done (hackathon)

- [ ] Real scanned room loads in the editor at correct scale
- [ ] Text → furniture and photo → furniture work live (with ghost + materialize)
- [ ] ≥ 6 articulated items open/close
- [ ] ≥ 3 styles restyle all added items
- [ ] Before/after, walk mode, share link, AR on phone
- [ ] Landing, onboarding, sample rooms, `?demo=1`
- [ ] Privacy: private by default, delete my data
- [ ] 60 FPS desktop (or 45+ with large room)

## Priority list (cut from the bottom)

1. Room in viewer + calibration + placement (**must**)
2. Seed library + live text-to-furniture (**must**)
3. Articulation playback (**must — differentiator**)
4. Restyle with material transfer (**must**)
5. Before/after (**must**)
6. Share link + AR (**must**)
7. Photo-to-furniture
8. Walk mode
9. Landing polish + onboarding
10. SpatialGen dream room
11. Part editing
12. STL mini-room export
13. Tour video / LuxReal
14. Accounts + projects (guest mode is enough for judging)

## Post-hackathon roadmap

| Phase | Weeks | Scope |
| --- | --- | --- |
| Beta | 1–3 | Accounts, projects, usage meter, email notifications, mobile capture flow, crash fixes, 100 beta users |
| Launch | 4–6 | Stripe plans, designer share pages, brand embed pilot, Product Hunt launch |
| Growth | 7–12 | Hide-real-objects (splat cropping), collaboration, photoreal renders (RenderCloud), shopping list with partner retailers |
