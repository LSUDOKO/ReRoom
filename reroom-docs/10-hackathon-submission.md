# 10 — Hackathon Submission

## Key rules (official page)

- Deadline: **19 Nov 2026, 6:00 a.m. EST = 4:30 p.m. IST**. Judging 20–30 Nov; results early December.
- Teams 1–3 (solo allowed, still form a team). **Lux3D is required.**
- Score = 70% expert panel + 30% community panel (50 AI practitioners).
- Credits: more after the team is formed and the idea is submitted; team credits split once among members listed at idea submission.

## Judging map

| Criterion | Weight | ReRoom evidence |
| --- | --- | --- |
| Use of Manycore's tools | 30% | World API reconstruction + generation, Aholo Viewer, Lux3D text/image-to-3D, sizing, retopology, articulation, material transfer, part split, export, LuxReal |
| Fun & engagement | 25% | "Your own room" emotional hook, Style Roulette, opening drawers, walk mode, before/after reveal |
| Innovation | 20% | Real-room 3DGS + generated furniture with working moving parts + whole-room restyle, in a browser |
| Completeness | 20% | Full flow from upload to share/AR; sample rooms; demo mode; deployed |
| Reach | 5% | Before/after GIF on X with #Manycorehackathon |

**Target awards:** First/Second/Third, **Spatial Design Application Award**, Technical Excellence, 3D Printing (mini-room STL), Popularity, VC Magnet (clear business model).

## Idea submission text

> **ReRoom — Scan it. Remix it. Live in it.** Record a 60-second video of your real room; Aholo Reality turns it into a walkable 3D Gaussian-splat space in Aholo Viewer. Describe or photograph any furniture and Aholo Lux3D generates it at real size; articulation makes doors and drawers really open; one-click styles restyle the whole room with Lux3D material transfer. Compare before/after, view items in AR (USDZ), share a link, or export for 3D printing. A consumer-friendly, AI-first spatial design tool built on the full Aholo stack.

## Deliverables

**Required:** (1) Project report PDF/PPT — idea → result, process screenshots, asset iteration comparisons, final images. (2) Working demo link and/or video with real footage.
**Bonus:** X post with #Manycorehackathon (public until results), source code link, ModelScope link (+20 h GPU).

## Report outline (14 pages)

1. Title: ReRoom, tagline, live link + QR, team
2. The problem (can't picture furniture in *your* room) — one photo
3. The product in one image: real room (before) vs remixed (after), same camera
4. How it works: scan → calibrate → create → open → restyle → share/AR
5. **Aholo pipeline: room** — video frames → reconstruction → 3DGS in Aholo Viewer (+ LOD)
6. **Aholo pipeline: furniture** — prompt/photo → Lux3D → retopology → articulation → in-room
7. **Restyle** — one item across 4 styles via material transfer (grid)
8. **Articulation** — wardrobe/drawer/fridge open-close frames
9. Asset iterations — prompt v1/v2/v3 comparisons; what improved and why
10. Engineering — splat + mesh in one scene, calibration, lighting match, queue/caching
11. Every Aholo capability used (table from `03` §1)
12. Product & business — users, plans, unit economics, roadmap
13. Results — numbers (items generated, styles, FPS, time from scan to first placed item), tester quotes
14. Links: live demo, video, GitHub, X post, ModelScope

## 90-second demo video

| Time | Shot | Caption / VO |
| --- | --- | --- |
| 0:00–0:06 | Phone recording your real (messy) room | "This is my room." |
| 0:06–0:14 | Upload → room appears in 3D; fly in | "60 seconds later — it's 3D, thanks to Aholo Reality." |
| 0:14–0:30 | Type "a mustard velvet reading chair" → ghost → materializes; photo of a lamp → lamp | "Describe anything. Lux3D builds it at real size." |
| 0:30–0:42 | Double-click wardrobe → doors open; drawers slide | "And it works. Articulation makes it real." |
| 0:42–0:58 | Style Roulette → Japandi → Industrial → Cyberpunk, whole room changes | "One click. New style. Material transfer." |
| 0:58–1:10 | Walk mode through the new room | "Walk around before you buy anything." |
| 1:10–1:20 | Before/after slider; phone AR of the chair in the real room | "See it in AR. Share it." |
| 1:20–1:30 | Logo, live link, "Built with Aholo" | "ReRoom. Scan it. Remix it. Live in it." |

Capture: OBS 1080p60; use your real room; hide dev overlays; record each feature several times.

## X post template

```
I scanned my messy room with my phone… and redesigned it with AI in 60 seconds. 🛋️✨

ReRoom: your real room in 3D (Aholo Reality) + furniture you describe (Aholo Lux3D)
— doors really open, one click restyles everything.

▶️ Try it: <link>   💻 <github>
#Manycorehackathon
```

## Final checklist

- [ ] Teammates added before idea submission; idea submitted
- [ ] Report uploaded
- [ ] Live link + `?demo=1` link tested in incognito (desktop + phone)
- [ ] Video uploaded (real footage)
- [ ] X post live
- [ ] GitHub public (README, credits, licence)
- [ ] ModelScope link submitted
- [ ] Submitted by 12:00 noon IST Thu 19 Nov
