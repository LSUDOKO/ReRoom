# 12 — Risks & Fallbacks

| # | Risk | Likelihood | Impact | Mitigation / Plan B |
| --- | --- | --- | --- | --- |
| 1 | Room reconstruction takes hours or fails | High | High | Start tonight; record 2 videos (normal + extra slow); also start a SpatialGen dream room as backup; show sample rooms in the app |
| 2 | Aholo Viewer can't render GLB meshes with splats in one scene | Medium | High | Option B (synced overlay canvas) or C (three.js splat renderer) — decide in the 2-hour spike; keep viewer wrapper isolated |
| 3 | No occlusion between furniture and splat walls | Medium | Medium | Keep furniture away from walls in demo; use contact shadows; option A if supported |
| 4 | Room scale is wrong / floor tilted | High | Medium | 2-point scale + floor fit + 3-click fallback; 1 m cube check |
| 5 | Articulation output isn't a standard GLB animation, or fails on generated items | Medium | High | Use the 6 pre-articulated seed items for the demo; fallback: two-state meshes (closed/open) with cross-fade |
| 6 | Material transfer breaks articulation | Medium | Medium | Transfer on static base then re-articulate, or transfer only non-articulated items; test on 1 item first |
| 7 | Concurrency limit (2) slows everything | High | Medium | Batch overnight; library reuse; queue with retries; restyle only visible items first |
| 8 | Result URLs expire before download | Medium | High | Download immediately in worker; never store Aholo URLs as final |
| 9 | Credits run out | Medium | High | Submit idea early (more credits); cache variants; demo with seed items; monitor balance |
| 10 | Lighting mismatch makes furniture look fake | High | Medium | Contact shadows + env map from room/pano + exposure match (docs/04 §7) |
| 11 | Large splat files load slowly | Medium | Medium | splat-transform LOD; CDN; loading progress; "Low" preset |
| 12 | API method names differ from docs | High | Low | api-notes.md from real SDK types; single wrapper module |
| 13 | Privacy concerns (home scans) | Medium | High (for real users) | Private by default, consent, delete-my-data, signed URLs |
| 14 | Scope creep before deadline | High | High | Feature freeze Wed 20:30 IST; priority list in `07` §4 |
| 15 | Live demo fails during judging | Low | High | `?demo=1` mode + recorded video + sample rooms |

## Demo-mode safety net
`?demo=1`: loads the pre-scanned room, seed library (pre-articulated + pre-restyled variants for 3 styles), no Aholo calls, all features clickable. Link it in the submission next to the live link.
