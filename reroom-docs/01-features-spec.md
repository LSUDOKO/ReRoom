# 01 — Features Spec

Priority: **P0** = hackathon must-have · **P1** = hackathon if time allows · **P2** = launch · **P3** = later.
Every feature has acceptance criteria (AC). "Done" = all AC pass.

---

## A. Capture (room → 3D)

### A1. Upload room video [P0]
- Upload `.mp4`/`.mov` (or Insta360 `.insv`, or ≥ 20 photos) from phone or desktop.
- Capture guide shown before upload (see `02` §3): slow walk, 30–60 s, good light, cover all walls, avoid mirrors.
- **AC:** file uploads with progress bar; resumes on weak network or shows clear retry; max 500 MB; job created in < 3 s after upload.

### A2. Reconstruction job [P0]
- Server uploads to Aholo asset storage → World API `reconstructions.create` (`scene: 'model'`, `taskQuality: 'normal'`) → waits → downloads outputs to our storage.
- Status page: queued → reconstructing → optimizing → ready, with honest time estimate and email/notification when ready (P1).
- **AC:** status updates at least every 30 s; outputs copied to our storage; failure shows a reason and "try again with tips".

### A3. Sample rooms [P0]
- 3 ready-made rooms (your own pre-scanned room + 2 SpatialGen rooms) so anyone can try instantly.
- **AC:** "Try a sample room" opens a room in < 5 s on broadband.

### A4. Dream room from prompt (SpatialGen) [P1]
- "A sunset loft in Tokyo with big windows" → World API `generations.create` (prompt + optional image).
- **AC:** generated world opens in the same editor as a scanned room.

### A5. Scale & floor calibration [P0]
- After a room opens: auto-detect floor (viewer ground/raycast if available), then the user confirms scale by clicking two points on a known length (default suggestion: door height 2.0 m, or "my bed is 2.0 m").
- **AC:** a generated 1 m cube looks 1 m tall next to a real door; floor plane is level; calibration saved with the room.

---

## B. Create (furniture → 3D)

### B1. Text-to-furniture [P0]
- Prompt box: "a mustard velvet reading chair with wooden legs".
- Category + size hints (chair/table/bed/storage/lamp/decor/plant/rug) improve prompts.
- **AC:** item appears as a "generating" ghost (bounding box with shimmer) at the cursor position immediately; replaced by the real model when ready; item has correct approximate real size.

### B2. Photo-to-furniture [P0]
- Upload/snap a product photo (shop, catalog, screenshot) → Lux3D image-to-3D.
- **AC:** same as B1; photo stored privately; faces in photo rejected.

### B3. Seed library [P0]
- ~40 pre-generated furniture items (see `06`) available instantly, already articulated where relevant.
- **AC:** library opens < 1 s; search + category filter; drag into room.

### B4. Real-world sizing [P0]
- Use Lux3D size options (`aiPredictSize` / `customSize`, verify names) plus category defaults; user can type exact W×D×H.
- **AC:** dimension label shows on selection; editing dimensions rescales the model.

### B5. Articulation (moving parts) [P0 — key differentiator]
- For storage/doors/appliances: run Lux3D articulation to get an animated model (doors open, drawers slide).
- In the room: click an articulated item → it opens/closes (plays its animation forward/back).
- **AC:** at least 6 seed items articulated (wardrobe, drawer chest, cabinet, fridge, laptop, door/gate); click toggles with smooth animation; works on generated items when the user ticks "make it open".

### B6. Part editing [P1]
- Lux3D part split → select a part (legs, cushion, frame) → change its material independently.
- **AC:** hover highlights parts; material change affects only that part.

---

## C. Arrange (editor)

### C1. Place / move / rotate / delete [P0]
- Drag on floor, snap to floor, rotate with handle or Q/E, delete key, duplicate (Ctrl+D), undo/redo (Ctrl+Z / Ctrl+Shift+Z).
- Snap: to walls (if collision available), to 15° rotations, to other items' edges.
- **AC:** no item sinks into the floor; undo history ≥ 50 steps; works with mouse and touch.

### C2. Collision & clearance [P1]
- Warn (red outline) when items overlap each other or walls (voxel collision from the scan if the viewer provides it, else bounding boxes vs a user-drawn room outline).
- **AC:** overlapping items show a warning; "walk path" clearance indicator 60 cm optional.

### C3. Hide real objects [P2]
- Paint over a real object in the scan (e.g., old sofa) to hide it (splat cropping by box).
- **AC:** box-cropped splats disappear; can be undone.

---

## D. Restyle

### D1. Style presets [P0]
- 8 styles (see `06`): Japandi, Scandinavian, Industrial, Mid-century, Boho, Cyberpunk, Coastal, Luxury.
- Applying a style runs **material transfer** on every *added* item with that style's reference materials (wood/fabric/metal per item category).
- **AC:** progress shows per item; items update one by one; the previous style is kept (instant switch back).

### D2. Style Roulette [P1]
- Spin → random style → applies D1. Confetti, sound. Fun hook for videos.

### D3. Material from photo [P1]
- Snap any texture (your sofa fabric, a marble sample) → apply to a selected item via material transfer.

---

## E. Experience

### E1. Walk mode [P0]
- First-person WASD + mouse look (desktop), virtual joystick (mobile), eye height 1.6 m, collision with floor (and walls if available).
- **AC:** smooth 60 FPS on mid laptop; can't fall through floor.

### E2. Orbit / top view [P0]
- Orbit around room; top-down plan view for arranging.

### E3. Before / after [P0]
- Slider comparing the original scan vs the current design from the same camera; export as image + short GIF.

### E4. Lighting moods [P1]
- Day / Evening / Night presets: tone mapping exposure + lamp items emit light (point lights on lamps).

---

## F. Share & export

| ID | Feature | Priority | AC |
| --- | --- | --- | --- |
| F1 | Share link (view-only, private by default) | P0 | link opens viewer without login; owner can revoke |
| F2 | AR view (USDZ for iPhone Quick Look; GLB for Android Scene Viewer) of a single item | P0 | QR code on desktop; opens AR on phone |
| F3 | Export GLB of the design (added items with positions) | P1 | opens in Blender with correct placement |
| F4 | Mini-room STL / 3MF for 3D printing (added items arranged on a base) | P1 | slicer opens it without errors |
| F5 | Tour video (in-app camera path recording; LuxReal for cinematic version) | P1 | 1080p MP4 downloadable |
| F6 | Photoreal render (RenderCloud) | P2 | HD image of a chosen view |
| F7 | Shopping list (items + dimensions + style notes) | P2 | PDF/CSV |

---

## G. Accounts, projects, product basics

| ID | Feature | Priority |
| --- | --- | --- |
| G1 | Guest mode with local project (try instantly) | P0 |
| G2 | Sign in (email magic link / Google) and cloud save | P1 |
| G3 | Projects list: rooms, designs, versions | P1 |
| G4 | Usage meter (scans, AI items left this month) | P1 |
| G5 | Settings: units (cm/in), quality preset, language | P1 |
| G6 | Delete my room / my data (privacy) | P0 (required for real users) |
| G7 | Payments (Stripe) for Plus/Pro | P2 |
| G8 | Onboarding tour (3 steps) | P0 |
| G9 | Demo mode `?demo=1` — sample room + library only, no live API calls | P0 |
