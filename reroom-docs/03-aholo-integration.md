# 03 — Aholo Integration

This is the most important file for the "Use of Manycore Tech's tools" criterion (30% of the score).

> ⚠️ **Verify before coding.** The official SDK README documents asset upload and World reconstruction/generation in detail, but **not** the Lux3D methods for retopology, part split, articulation, rig, retarget or export. Read `refs/aholo-spatial-sdk/typescript/examples/`, the SDK type definitions in `node_modules/@manycore/aholo-sdk-lux3d`, and https://labs.aholo3d.com/api-docs/en/sdk. Record exact names in `docs/api-notes.md`. Wrap everything in `server/src/aholo/` so fixes live in one place.

---

## 1. Capability map

| # | Aholo capability | Product | ReRoom feature | Priority |
| --- | --- | --- | --- | --- |
| 1 | Asset upload | Aholo API (Asset) | Upload room videos, photos, material references | P0 |
| 2 | World reconstruction (Reality) | World API | Room video → 3DGS room | P0 |
| 3 | World generation (SpatialGen) | World API | Dream room from prompt (+1 image) | P1 |
| 4 | Aholo Viewer | open-source renderer | Display + walk + place furniture in 3DGS rooms | P0 |
| 5 | Aholo splat-transform CLI | tool | Convert / LOD the room splats for fast streaming | P1 |
| 6 | Lux3D text-to-3D | Lux3D | Prompt → furniture | P0 |
| 7 | Lux3D image-to-3D | Lux3D | Product photo → furniture | P0 |
| 8 | Lux3D size options | Lux3D | Real-world dimensions (`aiPredictSize` / `customSize`, verify) | P0 |
| 9 | Retopology | Lux3D | Real-time-ready meshes and textures | P0 |
| 10 | Articulation & animation | Lux3D | Doors open, drawers slide | P0 |
| 11 | Material transfer | Lux3D | Style presets, material from photo | P0 |
| 12 | Part split | Lux3D | Edit legs/cushion/frame separately | P1 |
| 13 | Multi-format export | Lux3D | USDZ (AR), STL/3MF (print), FBX/OBJ | P0/P1 |
| 14 | Image-to-four-view | Lux3D | Quick preview while generating (optional) | P2 |
| 15 | RenderCloud | Aholo API | Photoreal stills | P2 |
| 16 | LuxReal | LuxReal | Cinematic room tour video + trailer | P1 |
| 17 | Lux3D MCP | MCP | Claude Code tests & batch help during development | dev |

---

## 2. Keys, regions, limits

- Keys: Global key from labs.aholo3d.com (Global) — the hackathon account. China and Global keys are not interchangeable.
- SDK regions: `cn` → `https://api.aholo3d.cn`, `com` → `https://api.aholo3d.com`. Use `region: 'com'` and let the SDK build URLs.
- Env: `AHOLO_API_KEY` (server only). Never hardcode; never send to the browser.
- Raw REST auth header (if needed): `Authorization: <key>` — **no "Bearer"**.
- All generation is **async**: create → id → wait/poll (10–15 s interval).
- **Result URLs expire after ~2 hours** → copy to our storage immediately.
- **Concurrency:** ~2 in-flight Lux3D generation tasks on Free, ~10 on Pro, shared across generation, material transfer, retopology, articulation, rig, retarget. Over-limit errors create no task and cost nothing → queue + retry.
- Retopology input: static, non-Draco GLB. Compress after.
- SDK errors (from `@manycore/aholo-sdk-core`): `AuthenticationError`, `RateLimitError`, `BusinessError` (has code), `PollingTimeoutError`, `PollingFailedError`.

---

## 3. SDK setup

```bash
pnpm add @manycore/aholo-sdk-asset @manycore/aholo-sdk-world @manycore/aholo-sdk-lux3d @manycore/aholo-sdk-core
```

```ts
// server/src/aholo/clients.ts
import { createAssetClient } from '@manycore/aholo-sdk-asset';
import { createWorldClient } from '@manycore/aholo-sdk-world';
import { createLux3dClient } from '@manycore/aholo-sdk-lux3d';

export const asset = createAssetClient({ region: 'com' });
export const world = createWorldClient({ region: 'com' });
export const lux3d = createLux3dClient({ region: 'com' });
```

### 3.1 Upload + reconstruct a room (documented in the SDK README)
```ts
// server/src/aholo/rooms.ts
export async function reconstructRoom(localVideoPath: string, name: string) {
  const uploaded = await asset.uploadFile(localVideoPath, {
    onProgress: (done: number, total: number) => log('upload', done / total),
  });
  const created = await world.reconstructions.create({
    name,
    resources: [{ url: uploaded.url, type: 'video' }], // 'image' (≥20), 'video' (.mp4/.mov), 'insv' (Insta360)
    taskQuality: 'normal',
    scene: 'model',
  });
  const result = await world.waitFor(created.worldId); // check timeout options in SDK types
  return { worldId: created.worldId, result };          // result has splat/LOD/pano URLs — log and map fields
}
```

### 3.2 Generate a dream room
```ts
export async function generateRoom(prompt: string, imageUrl?: string) {
  const created = await world.generations.create({
    prompt,
    ...(imageUrl ? { resources: [{ url: imageUrl, type: 'image' }] } : {}), // max 1 image
  });
  return world.waitFor(created.worldId);
}
```

### 3.3 Furniture (Lux3D) — confirm names in SDK types
```ts
// Documented: image-to-3D + waitFor
const taskId = await lux3d.imgTo3d.create({ img: photoUrl /* + size options, version */ });
const res = await lux3d.tasks.waitFor(taskId);

// To confirm in SDK types/examples (names below are placeholders):
// lux3d.textTo3d.create({ prompt, style: 'photorealistic', ... })
// lux3d.retopology.create({ meshUrl, faceCount / triangle budget, textureSize })
// lux3d.materialTransfer.create({ img: materialRefUrl, meshUrl })
// lux3d.articulation.create({ meshUrl, prompt: 'doors swing open' ... })
// lux3d.partSplit.create({ meshUrl })
// lux3d.export.create({ meshUrl or zipUrl, format: 'usdz' | 'stl' | '3mf' | 'fbx_zip' | 'obj_zip' })
```
SDK v1.8.0 release notes say Lux3D SDK 1.8.0 added **part split, articulation & animation, humanoid auto-rig and animation retarget** for TypeScript, Java and Python — install ≥ 1.8.0.

---

## 4. Pipelines

### 4.1 Room pipeline
```
client upload (resumable) → our storage (private)
→ server: asset.uploadFile → world.reconstructions.create → world.waitFor (poll; update job stage)
→ download outputs (splat / LOD / pano / mesh if any) → our storage
→ optional: aholo-splat-transform → LOD chunks for streaming
→ room.status = 'ready' → notify user
```
Expect reconstruction to take a long time (minutes to hours). **For the hackathon: scan your demo room tonight.**

### 4.2 Furniture pipeline (runtime)
```
prompt/photo → safety filter → library lookup (similar prompt? reuse instantly)
→ queue → Lux3D text/image-to-3D (style photorealistic, size hints)
→ download → retopology (≈ 15k tris, 1024 tex; hero items 30k/2048)
→ if category ∈ {wardrobe, cabinet, drawer chest, fridge, door, box, laptop, oven} and user wants: articulation
→ download → normalize (pivot bottom-center, meters, +Z forward) → compress (meshopt + KTX2)
→ storage/CDN → client replaces ghost
```

### 4.3 Restyle pipeline
```
style preset → for each added item: pick reference material by category (wood/fabric/metal/stone)
→ material transfer (img = reference, meshUrl = item GLB)
→ (if item is articulated: transfer on the static version, then re-run articulation, OR transfer before articulation — test which keeps animation) 
→ store as variant: item.variants[styleId] → client swaps
```
Cache: (itemId, styleId) → variant URL, so switching back is instant and never re-billed.

### 4.4 Part editing pipeline [P1]
```
item GLB → part split → parts GLB (named/indexed) → client shows parts
→ selected part + material photo → material transfer on that part only → recombine in client
```

### 4.5 Export pipeline
```
single item → export usdz (iOS AR) / glb (Android Scene Viewer)
mini-room → combine added items on a base plate (client/three.js) → GLB → export stl/3mf
```

### 4.6 Tour video
- In-app: record a camera path (Catmull-Rom through user-placed waypoints) with `MediaRecorder` on the canvas → MP4/WebM.
- Cinematic: feed clips/renders to **LuxReal** for a polished tour; use it in the demo video and as a P2 "Cinematic tour" export.

---

## 5. Queue & jobs

- Table `jobs` (see `05`): kind, stage, input, output, aholo ids, attempts.
- Worker loop with `MAX_IN_FLIGHT = Number(process.env.AHOLO_MAX_CONCURRENCY ?? 2)` for Lux3D; World API jobs in a separate lane (limit 1–2).
- Poll every 12 s; timeout per stage (Lux3D 15 min, World 3 h); on `RateLimitError` / concurrency error → re-queue with backoff; on failure → retry once with simplified prompt → mark failed.
- **Immediately** download every output and store it; never persist Aholo URLs as final.

## 6. Cost control

- Shared furniture library: identical/similar prompts reuse existing models (embedding similarity ≥ 0.92).
- Style variants cached per item.
- Free tier quotas (see `00`).
- Show credits/usage in admin; alert when daily spend exceeds threshold.

## 7. Dev-time tools

- **Lux3D MCP** in Claude Code for quick tests (get the **Global** MCP URL from aholo.ai → "Set Up MCP"; the public skill package is China-region only).
- `pnpm aholo` CLI (built by Claude on the SDK): `text3d | img3d | retopo | transfer | articulate | split | export | world-recon | world-gen | status | batch`.
