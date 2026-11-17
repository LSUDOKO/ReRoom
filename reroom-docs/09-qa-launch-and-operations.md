# 09 — QA, Launch & Operations

## 1. QA checklist (run before every deploy)

### Core flow
- [ ] Landing loads < 2 s; CTA works on desktop + phone
- [ ] Upload 300 MB video on slow network → resumes after disconnect
- [ ] Reconstruction status updates; failure shows tips + retry
- [ ] Sample room opens < 5 s
- [ ] Calibration: 1 m cube looks right next to a door
- [ ] Place, move, rotate, delete, duplicate, undo/redo 20 steps
- [ ] Text generation: ghost → materialize; failure → retry/similar
- [ ] Photo generation works; face photo rejected
- [ ] Articulated items open/close smoothly; reverse works mid-animation
- [ ] Restyle 3 styles; switch back instantly (cached)
- [ ] Before/after slider + PNG export
- [ ] Walk mode: can't fall through floor; pointer lock exit with Esc
- [ ] Share link opens logged-out; revoke works
- [ ] AR: iPhone Quick Look opens USDZ; Android Scene Viewer opens GLB
- [ ] `?demo=1` works with network blocked to Aholo
- [ ] Delete my data removes DB rows + storage files

### Browsers & devices
- Chrome, Edge, Safari (macOS + iOS), Firefox (desktop), Android Chrome.
- Low-end laptop: "Low" quality preset auto-selected if FPS < 30 for 3 s.

### Performance budget
| Metric | Target |
| --- | --- |
| Landing LCP | < 2.0 s |
| Editor first room frame | < 4 s desktop broadband |
| FPS editor (desktop) | ≥ 55 |
| JS bundle (editor route) | < 1.5 MB gz excluding viewer WASM/workers |
| Item GLB | ≤ 2 MB (hero ≤ 4 MB) |

## 2. Testing

- Unit: placement math, calibration (fit plane, scale), command undo/redo, style mapping (Vitest).
- Integration: worker pipeline with a mocked Aholo (fixtures of SDK responses) — includes concurrency-limit retry, 401, timeout, success + download.
- E2E: Playwright script for the core flow on sample room (`?demo=1`) — run in CI on each PR.
- Visual: Playwright screenshots of editor states for regression.

## 3. Deployment

| Piece | Host | Notes |
| --- | --- | --- |
| Web (Next.js) | Vercel | Env vars; image domains for storage CDN |
| Worker | Railway / Render / Fly | Always-on; 1 instance; health endpoint; restarts resume jobs from DB |
| DB | Supabase / Neon | Daily backups |
| Storage | Supabase Storage / R2 | Private buckets; signed URLs; CDN caching for library items (public) |
| Redis (if BullMQ) | Upstash | — |

CI: GitHub Actions — typecheck, lint, unit, E2E on `?demo=1`, then deploy on `main`.

## 4. Monitoring

- Sentry (web + worker) with release tags.
- Worker metrics: jobs queued/running/failed per kind, average duration per Aholo capability, retry counts.
- Daily Aholo usage/credit check (MCP "check balance" or account page) → alert on threshold.
- Uptime ping on web + worker health.

## 5. Analytics events (PostHog)

`landing_view`, `scan_started`, `upload_completed`, `room_ready`, `calibration_done`, `item_generated` (source, ms), `item_placed`, `articulation_toggled`, `style_applied` (style), `roulette_spun`, `before_after_viewed`, `share_created`, `ar_opened`, `export_downloaded` (format), `signup`, `upgrade_clicked`.

## 6. Privacy, legal, safety

- Privacy policy: what's collected (videos, photos, scans), purpose, retention (delete scans after 90 days of inactivity unless saved), third-party processing (Aholo/Manycore for generation and reconstruction), user rights (export, delete).
- Terms: acceptable use (no scanning other people's homes without consent, no prohibited content), AI-generated content disclaimer (dimensions approximate).
- Consent checkbox before first scan upload.
- Content moderation on prompts and photos (see `06` §7); report button on share pages.
- Check the hackathon FAQ "Who owns the intellectual property in my project?" before commercial launch.

## 7. Pricing & billing (P2)

- Stripe Checkout for Plus ($9/mo) and Pro ($29/mo); customer portal for cancel.
- Webhooks update `users.plan`; `usage` table enforces quotas (scans/items per month).
- Free tier watermark on exports.

## 8. Launch plan (after hackathon)

1. Private beta (100 users): designers + renters communities; collect 20 before/after examples.
2. Content: TikTok/Reels/YouTube Shorts "my room → dream room in 60 s".
3. Product Hunt launch with sample rooms and a live demo.
4. B2B pilot: 2–3 small furniture brands — "View in your room" embed.
