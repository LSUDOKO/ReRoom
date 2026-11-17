# ReRoom — Scan it. Remix it. Live in it.

**ReRoom turns a 60-second phone video of your real room into a walkable 3D space, then lets you redesign it with AI-generated furniture that actually works — doors open, drawers slide — and restyle everything in one click.**

Built for the **Manycore Aholo Global 3D AI Hackathon** (theme: *Play in 3D, Create with Aholo*), and designed as a real, launchable product.

> **Hackathon deadline: Thu 19 Nov 2026, 4:30 p.m. IST** (6:00 a.m. EST). Target: submit by **12:00 noon IST**.

---

## Read in this order

| # | File | What it covers |
| --- | --- | --- |
| 00 | `00-product-brief.md` | Problem, users, positioning, competition, business model |
| 01 | `01-features-spec.md` | Every feature with priority and acceptance criteria |
| 02 | `02-user-flows-and-ux.md` | Screens, flows, interactions, UI system |
| 03 | `03-aholo-integration.md` | Every Aholo capability we use, SDK code, pipelines, limits |
| 04 | `04-3d-engine-and-viewer.md` | Aholo Viewer + mesh layer, scale calibration, placement, articulation, lighting |
| 05 | `05-technical-architecture.md` | Stack, folders, API routes, database, jobs, storage, security |
| 06 | `06-asset-library-and-prompts.md` | Seed furniture catalog, style presets, prompt templates, material references |
| 07 | `07-build-plan.md` | Hour-by-hour plan to the deadline + post-hackathon roadmap |
| 08 | `08-claude-code-prompts.md` | Paste-ready prompts for Claude Code, in order |
| 09 | `09-qa-launch-and-operations.md` | Testing, performance, deployment, privacy, monitoring, pricing |
| 10 | `10-hackathon-submission.md` | Judging map, awards, report outline, demo video script, X post |
| 11 | `11-setup-tools-and-references.md` | MCP servers, SDKs, repos, skills, links |
| 12 | `12-risks-and-fallbacks.md` | What can go wrong and the plan B for each |

---

## First message to your Claude Code

```
Read every file in /docs (README, then 00–12) and CLAUDE.md before writing code.
We are building ReRoom. Follow docs/07-build-plan.md step by step and tell me which step you're on.
Before any Aholo call: read refs/aholo-spatial-sdk (README + typescript/examples), the official
SDK docs (https://labs.aholo3d.com/api-docs/en/sdk), and refs/aholo-viewer/docs/ai/skills/use-aholo-viewer/SKILL.md.
Never guess method names. Record what you find in docs/api-notes.md.
The API key lives only in server .env. Never in client code or git.
```

---

## The product in one picture

```
 Phone video of your room ──► Aholo Reality (World API reconstruction) ──► 3DGS room
                                                                           │
 "a mustard velvet reading chair" ──► Lux3D text/image-to-3D ──► retopology │
                                    └► articulation (doors/drawers move)    ▼
                                                              Aholo Viewer: walk inside your room,
                                                              place, move, open, restyle (material transfer)
                                                                           │
                         Before/after · AR (USDZ) · GLB · STL mini print · LuxReal tour video · share link
```

## Accuracy note

Aholo details come from the official hackathon page, the official `aholo-spatial-sdk` README, the Aholo API reference overview and third-party integration docs. The SDK README does **not** document every Lux3D method (part split, articulation, rig, retarget, export, retopology) — read the SDK's `typescript/examples/` and type definitions, and the canonical docs, before coding.
