# 04 — 3D Engine & Viewer

## 1. The key decision: one scene, splats + meshes together

The room is a **3D Gaussian splat (3DGS)**; furniture is **meshes (GLB)**. They must render in the **same depth space**, or furniture will float "on top" of walls and look fake.

| Option | How | Pros | Cons | Decision |
| --- | --- | --- | --- | --- |
| **A. Aholo Viewer as the main renderer** | Load room splats AND furniture GLBs into `@manycore/aholo-viewer` | Uses Aholo stack fully; correct occlusion; LOD streaming; collision from 3DGS (reported) | Must learn its API; check GLB/animation support | **Try first (Day 0)** |
| B. Aholo Viewer + three.js overlay | Two canvases, synced camera | Familiar three.js for furniture | No true occlusion between layers; sync complexity | Fallback |
| C. three.js only with a generic splat renderer | e.g. an open-source three.js splat library | Full control | Loses "Aholo Viewer" points | Last resort |

**Day-0 spike (2 hours max):** in `refs/aholo-viewer`, open the Playground examples and `docs/ai/skills/use-aholo-viewer/SKILL.md`. Answer in `docs/api-notes.md`:
1. Can it load a GLB mesh next to a splat? With PBR materials? With animations (articulation clips)?
2. Is depth shared (mesh hidden behind a splat wall)?
3. Raycast API (to pick floor/items)? Ground/collision API (to walk and snap)?
4. Can we access a `THREE.Scene`/camera, or does it use its own engine?
5. Render-loop hook for custom animation updates?

Install the viewer's own AI skill into Claude Code:
```bash
mkdir -p .claude/skills && cp -r refs/aholo-viewer/docs/ai/skills/use-aholo-viewer .claude/skills/
```

Viewer facts: npm `@manycore/aholo-viewer`, MIT; manual at https://aholojs.dev; Node ≥ 22.22.1 and pnpm to build from source; chunked streaming LOD for large 3DGS scenes; Playground examples as `<slug>.json` + `<slug>.ts`.

---

## 2. Coordinate system & units

- 1 unit = 1 meter. Y up. Floor at y = 0 after calibration.
- Room transform = `scale (calibration) × rotation (level floor) × translation (floor to 0)` applied to the splat root.
- Furniture pivot: bottom-center; forward = +Z.

## 3. Scale & floor calibration

Reconstructions may not be at real-world scale. Steps:
1. **Floor:** cast many downward rays from the camera area; fit a plane (RANSAC) to hit points → rotate so the plane is horizontal and at y = 0. Fallback: user clicks 3 points on the floor.
2. **Scale:** user clicks two points on a known length (door height, bed length) and types the distance → `scale = real / measured`.
3. Save `{scale, rotation, offset}` in `rooms.calibration`.
4. Sanity check: render a 1 m reference cube + a 1.7 m human silhouette next to the door for 3 s.

## 4. Placement system

- **Ghost while generating:** box with category default size (chair 0.8×0.8×0.95, sofa 2.1×0.9×0.85, bed 2.0×1.6×0.5, wardrobe 1.2×0.6×2.0, table 1.4×0.8×0.75, lamp 0.4×0.4×1.6, plant 0.5×0.5×1.2, rug 2.0×1.4×0.01).
- **Drag:** raycast floor plane (fast, reliable) → snap y = 0; optional raycast against splat collision for walls.
- **Wall snap:** if within 15 cm of a wall (collision raycast or user-drawn outline), align back to wall.
- **Rotation:** 15° steps (Q/E), free with Shift.
- **Selection:** outline (post-process or inverted hull) + dimension labels (W×D×H) in cm/in.
- **Undo/redo:** command pattern (`AddItem`, `MoveItem`, `RotateItem`, `DeleteItem`, `ApplyStyle`, `SetDims`).

## 5. Normalizing generated models

On import of every GLB:
1. Compute bounding box → translate so bottom-center is at origin.
2. Rotate so the longest horizontal axis is X (or keep generator's facing if consistent; test a few).
3. Scale to target dimensions (from size option, category default, or user input).
4. Ensure materials are `MeshStandardMaterial`/PBR; enable shadows.
5. Generate simple collider (oriented bounding box).

## 6. Articulation playback

- Articulated GLB contains animation clip(s) (verify output format).
- Load with an `AnimationMixer` (three.js) or the viewer's animation API; clip action `clampWhenFinished = true`, `loop = LoopOnce`.
- Toggle: open → play timeScale +1; close → play timeScale −1 from the end. Duration ~0.8 s; ease via clip.
- Sound: soft "click" / "slide" SFX.
- If the viewer can't play GLB animations: fallback to a three.js overlay for the selected item while interacting, or bake 2 states (closed/open meshes) and cross-fade.

## 7. Lighting the furniture to match the room

3DGS rooms have **baked** lighting; meshes need lights. To make furniture look like it belongs:
1. **Environment map from the room:** render a cube map from the room center using the splats (if the viewer allows render-to-texture) → PMREM → `scene.environment`. Fallback: SpatialGen/room panorama (if output) or a neutral interior HDRI (Poly Haven).
2. **Exposure match:** sample average luminance of the splat render around the item vs the item render; adjust item material envMapIntensity (0.6–1.4).
3. **Contact shadows:** soft blob/contact shadow under every item (drei `ContactShadows` style or a baked shadow decal). This alone fixes "floating" furniture.
4. **Ambient occlusion:** light SSAO on meshes only.
5. **Color grade** the whole frame lightly so both layers share tone.

## 8. Walk mode

- First-person camera at 1.6 m; WASD, mouse look (pointer lock); speed 1.4 m/s (Shift 2.5).
- Collision: floor at y = 0; walls via viewer collision/voxels if available, else room outline polygon drawn by user during calibration (P1).
- Head bob off by default.

## 9. Before / after

- Two render passes from the same camera: (a) room only (all added items hidden, cropped real objects restored), (b) current design.
- Slider composites in a canvas; export PNG; GIF = 2 s crossfade (gif.js or ffmpeg.wasm).

## 10. Performance targets

| Metric | Desktop (mid laptop) | Mobile (recent phone) |
| --- | --- | --- |
| FPS | 60 | 30 |
| Room splats visible (via LOD) | ≤ 3–5 M | ≤ 1–1.5 M |
| Furniture items | 40 | 20 |
| Item triangles | ≤ 15k each (hero 30k) | same, LOD 50% |
| First room view | < 4 s | < 7 s |

Techniques: splat LOD streaming, KTX2 textures, meshopt geometry, instancing for duplicates, dispose unused items, pause rendering when idle (render on demand in editor).
