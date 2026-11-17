# Aholo API notes (verified)

Verified on 18 Nov 2026 against `@manycore/aholo-sdk-*` (lux3d 1.10.0, world 1.5.0, asset 1.4.0, core 1.4.0), `@manycore/aholo-viewer` 1.14.0, and live calls with a Global key (`region: 'com'` → `https://api.aholo.ai`). Every Aholo call lives in `src/lib/aholo/server.ts`.

## Lux3D

All `create` calls return a numeric `taskId`. Poll with `lux3d.tasks.retrieve(id)`, which returns `{ status: 0|1|3|4|6, outputs: [{ content }] }`, where 3 means success and 4 or 6 means failed or canceled. `outputs` is positional and can contain the literal `NOT_REQUESTED`, so we select by file extension (`pickUrl`).

| Capability | SDK call | Key params | Output | Measured cost / time |
|---|---|---|---|---|
| Text to 3D | `textTo3d.create` | `prompt`, `style: 'photorealistic'`, `version: 'G1-Turbo'`, `faceCount` 10k–300k, `outputFormat: ['glb']`, `enablePbr`, `aiPredictSize` | `.glb` (PBR, 2048² PNG textures) | 13 credits · ~60 s |
| Image to 3D | `imgTo3d.create` | `img` (URL or data URL) or `imgs[]`; same options | `.glb` | — |
| Material transfer | `materialTransfer.create` | `img`, `meshUrl`, `version: 'v3.0-standard'`, `outputFormat`, `aiPredictSize` / `customSize` (target height **mm**) | `.glb` | 7 credits · ~2 min |
| Articulation | `articulationAnimation.create` | `glbUrl`, `prompt` | **`.zip` with `urdf/robot.urdf` + `urdf/meshes/*.glb`** (not a glTF animation) | 28 credits · ~90 s |
| Part split | `partSplit.create` | `glbUrl` | parts model | — |
| Multi-format export | `multiFormatExport.create` | `modelUrl` (.glb or Lux3D .zip), `outputFormat: usdz \| obj_zip \| fbx_zip \| stl \| 3mf` | order: zip, glb, usdz, obj, fbx, stl, 3mf | — |
| Four-view / image | `imageToFourView`, `multimodalToImage` | `img` and/or `prompt` | images | 12 credits |
| Humanoid rig / retarget | `humanoidAutoRig`, `humanoidAnimationRetarget` | not used (no humans in ReRoom) | | |

Notes:
- **There is no separate retopology endpoint** in SDK 1.10. We set the mesh budget at generation time (`faceCount: 40_000`) and shrink textures offline (`gltf-transform resize 1024 + jpeg`), which takes about 7 MB down to about 1 MB per model.
- `aiPredictSize: true` sometimes overshoots (the wardrobe came out 3.2 m tall). The studio rescales uniformly to the catalog height. Rugs scale by their longest side and are laid flat if generated upright.
- Concurrency-limit errors create no task and cost nothing, so both the client (`createTask`) and the seed scripts back off and retry.

### Articulation URDF format
- Links: `body`, `door_left`, … each with `<visual><mesh filename="meshes/x.glb"/>`.
- Joints: `revolute` or `prismatic`, `<origin xyz rpy>` in the parent frame, `<axis xyz>`, and `<limit lower upper>`. Child meshes are expressed in the joint frame.
- Y is up, the floor is at y = 0 in `body.glb`.
- `Engine.loadUrdf` builds pivot nodes and `Engine.articulate` eases each joint toward its larger-magnitude limit.

## World

| Call | Notes |
|---|---|
| `world.reconstructions.create({ name, resources:[{url,type:'video'\|'image'\|'insv'}], taskQuality, scene })` | `scene` is `'model' \| 'space'`; rooms use `'space'` |
| `world.generations.create({ name, prompt, resources?:[{url,type:'image'}] })` | SpatialGen; about 10 min per room in our runs |
| `world.retrieve(worldId)` | `status`: PENDING / PREPROCESSING / RUNNING / SUCCEEDED / FAILED / CANCELED / TIMEOUT / REJECTED; `assets.splats.urls.{spzPath, plyPath, lodMetaPath}`, `assets.imagery.panoUrl` |

- World splats are **Z-up**. Our calibration maps them as `up: '+z'`, and the floor sits about 1.25 m below the origin for SpatialGen rooms.
- SPZ downloads are 3–5 MB per room.

## Asset

- `asset.uploadBuffer(buf, { filename })` gets a token from `/global/asset/v1/token`, then does an OUS single or block upload, polls, and returns `{ url }`. We use it to give Lux3D reachable URLs for local library models and material swatches (`toAholoUrl`).

## Aholo Viewer (renderer)

- It is its own engine (`@qunhe/egs`), not three.js. Splats and GLB meshes share one depth buffer, so occlusion between a splat floor and furniture works (verified).
- `GLTFLoader.loadGLTF(buffer, { textureLoader: downloadTexture })` gives PBR textures.
- `Animation.AnimationMixer` and `AnimationPlugin` exist for glTF clips. We don't need them because articulation arrives as URDF.
- `Raycaster` exists but doesn't hit splats. Picking uses floor-plane and AABB math.
- Workers are spawned with `new URL('./x-worker.js', import.meta.url)`, which Next's bundlers break. `scripts/patch-viewer.mjs` (postinstall) serves them from `/aholo/`.
- `preserveDrawingBuffer: true` enables before/after snapshots and the MediaRecorder tour.
