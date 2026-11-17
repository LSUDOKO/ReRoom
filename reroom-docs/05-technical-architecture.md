# 05 — Technical Architecture

## 1. Overview

```
┌──────────── Browser (Next.js app) ────────────┐
│ Landing · Editor (Aholo Viewer + furniture)   │
│ Upload (resumable) · Share pages · AR links   │
└───────────────┬───────────────────────▲───────┘
                │ HTTPS (our API only)  │ CDN (GLB, splat LOD, images)
┌───────────────▼───────────────────────┴───────┐
│ API (Next.js route handlers / Hono)           │
│ auth · projects · items · jobs · share        │
├───────────────────────────────────────────────┤
│ Worker (Node, long-running)                   │
│ job queue → Aholo SDK → download → optimize   │
│ → upload to storage → update DB → notify      │
└───────────────┬───────────────────────▲───────┘
                │ SDK (region 'com')     │ results (copy < 2 h)
        ┌───────▼────────────────────────┴──────┐
        │ Aholo: Asset · World · Lux3D · RenderCloud │
        └───────────────────────────────────────┘
DB: Postgres (Supabase/Neon) · Storage: Supabase Storage / R2 / S3 · Email: Resend
```

**Why a separate worker:** reconstruction can take a long time and generation needs polling — serverless functions time out. Run the worker on Railway/Render/Fly (always-on), the web app on Vercel.

## 2. Stack

| Layer | Choice |
| --- | --- |
| Web app | Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui |
| 3D | `@manycore/aholo-viewer` (main) + three.js (helpers, GLB loading/normalizing) |
| State | Zustand (editor), TanStack Query (server data) |
| Auth | Supabase Auth (magic link + Google); guest mode with local storage |
| DB | Postgres (Supabase or Neon) + Drizzle ORM |
| Storage | Supabase Storage (private buckets + signed URLs) or Cloudflare R2 |
| Uploads | tus/resumable upload (Supabase supports TUS) |
| Worker | Node 22 + `@manycore/aholo-sdk-*` ≥ 1.8.0, BullMQ + Redis (Upstash) or a Postgres-backed queue (pg-boss) |
| 3D processing | `@gltf-transform/core` + CLI (meshopt, KTX2 via toktx), `@manycore/aholo-splat-transform` |
| Video | MediaRecorder (in-app), ffmpeg on worker for MP4 |
| Payments (P2) | Stripe Checkout + webhooks |
| Analytics | PostHog; errors: Sentry |
| Email | Resend ("Your room is ready") |
| Hosting | Vercel (web), Railway/Render (worker), CDN via storage provider |

## 3. Monorepo layout

```
reroom/
├─ CLAUDE.md
├─ docs/                      ← this pack + api-notes.md
├─ refs/                      ← cloned reference repos (gitignored)
├─ apps/
│  ├─ web/                    ← Next.js
│  │  ├─ app/
│  │  │  ├─ (marketing)/page.tsx           landing
│  │  │  ├─ scan/page.tsx                  capture guide + upload
│  │  │  ├─ rooms/[id]/page.tsx            status → calibrate → editor
│  │  │  ├─ s/[shareId]/page.tsx           public share viewer
│  │  │  ├─ projects/page.tsx
│  │  │  └─ api/ (rooms, items, styles, jobs, share, upload, export)
│  │  ├─ components/editor/ (Viewport, AddPanel, Inspector, StyleBar, BeforeAfter, WalkControls, Gizmo)
│  │  ├─ lib/three/ (normalize.ts, placement.ts, articulation.ts, lighting.ts, calibrate.ts, commands.ts)
│  │  └─ lib/viewer/ (aholoViewer.ts — the only file that talks to @manycore/aholo-viewer)
│  └─ worker/
│     ├─ src/index.ts         ← queue consumer
│     ├─ src/aholo/ (clients.ts, rooms.ts, furniture.ts, styles.ts, export.ts, errors.ts)
│     ├─ src/pipeline/ (normalize.ts, optimize.ts, storage.ts)
│     └─ src/cli.ts           ← `pnpm aholo …` dev CLI
├─ packages/shared/           ← types (Room, Item, Job, Style), zod schemas
├─ content/
│  ├─ library.json            ← seed furniture catalog (see 06)
│  ├─ styles.json             ← style presets + material refs
│  └─ materials/              ← reference images
└─ scripts/ (seed-library.ts, seed-styles.ts)
```

## 4. Data model (Postgres)

```sql
create table users (id uuid primary key, email text unique, plan text default 'free', created_at timestamptz default now());

create table rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id),
  name text,
  source text,                -- 'scan' | 'generated' | 'sample'
  status text,                -- uploading | queued | reconstructing | optimizing | ready | failed
  world_id text,              -- Aholo worldId
  splat_url text, lod_url text, pano_url text,
  calibration jsonb,          -- {scale, rotation:[x,y,z,w], offset:[x,y,z]}
  error text,
  created_at timestamptz default now()
);

create table designs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  name text, style_id text,
  share_id text unique,       -- null = private
  thumbnail_url text,
  updated_at timestamptz default now()
);

create table items (            -- library + user-generated models
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,              -- null for shared library
  name text, category text, prompt text, source text, -- 'text' | 'photo' | 'library'
  glb_url text, articulated_glb_url text, parts_glb_url text,
  dims jsonb,                 -- {w,d,h} meters
  variants jsonb default '{}',-- {styleId: glbUrl}
  status text, prompt_embedding vector(1536),
  created_at timestamptz default now()
);

create table placements (
  id uuid primary key default gen_random_uuid(),
  design_id uuid references designs(id) on delete cascade,
  item_id uuid references items(id),
  position real[3], rotation_y real, scale real[3],
  material_overrides jsonb default '{}'
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  kind text,                  -- reconstruct | generate_world | text3d | img3d | retopo | articulate | transfer | split | export
  ref_id uuid,                -- room or item id
  stage text, aholo_task_id text,
  input jsonb, output jsonb, attempts int default 0, error text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table usage (user_id uuid, month text, scans int default 0, items int default 0, primary key (user_id, month));
```
Row-level security: users only see their rooms/designs/items; share pages read via `share_id` with a server-side signed URL.

## 5. API routes

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/upload/room` | Start resumable upload → returns upload URL |
| POST | `/api/rooms` | Create room from uploaded file → enqueue `reconstruct` |
| POST | `/api/rooms/generate` | Prompt (+image) → enqueue `generate_world` |
| GET | `/api/rooms/:id` | Room + status + URLs (signed) |
| PATCH | `/api/rooms/:id/calibration` | Save scale/floor |
| POST | `/api/items/generate` | `{prompt | photoUrl, category, dims?, articulate?}` → enqueue chain |
| GET | `/api/items/:id` | Item status + URLs |
| GET | `/api/library?q=&category=` | Seed + shared items |
| POST | `/api/designs/:id/style` | Apply style → enqueue transfers for items missing that variant |
| PUT | `/api/designs/:id` | Save placements |
| POST | `/api/designs/:id/share` | Toggle share link |
| POST | `/api/export` | `{itemId|designId, format}` → enqueue export |
| GET | `/api/jobs/:id` | Job status (client polls every 3 s, or Supabase Realtime) |
| DELETE | `/api/me` | Delete all my data |

## 6. Security & privacy (real users scan their homes)

- Room scans are **private by default**; share links are opt-in and revocable.
- Storage buckets private; signed URLs (1 h) for viewing.
- Strip EXIF/GPS from uploaded photos; don't log file contents.
- Photo uploads: reject images with faces (face detection) for furniture photos.
- Prompt safety filter (no people, weapons, explicit content, brands/logos).
- Rate limits per user/IP on generation endpoints.
- Secrets only in server/worker env; never in the client bundle (check with a build-time grep).
- "Delete my data" removes DB rows **and** storage objects.
- Terms + privacy policy pages (scan data use, AI-generated content, retention).

## 7. Environment variables

```
# worker + server only
AHOLO_API_KEY=
AHOLO_REGION=com
AHOLO_MAX_CONCURRENCY=2
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
REDIS_URL=
RESEND_API_KEY=
SENTRY_DSN=
# client-safe
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
```
