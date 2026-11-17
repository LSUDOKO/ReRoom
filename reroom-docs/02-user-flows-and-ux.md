# 02 — User Flows & UX

## 1. Core flow (the 60-second story)

```
Landing → "Scan my room" or "Try a sample room"
   → Capture guide → Upload video → Reconstruction status (meanwhile: browse library / try sample room)
   → Room ready → Calibrate scale (2 clicks) → Editor
   → Add furniture (prompt / photo / library) → Place → Open drawers
   → Restyle (style chips / Style Roulette) → Walk mode
   → Before/After → Share link / AR / Export / Tour video
```

## 2. Screens

| # | Screen | Key elements | Notes |
| --- | --- | --- | --- |
| 1 | Landing | Hero: before/after video loop of a real room; CTA "Scan my room", secondary "Try a sample room"; 3 feature tiles; "Built with Aholo" strip | Must load < 2 s; video is a short MP4 |
| 2 | Capture guide | 4 illustrated tips; "Record now" (mobile camera) or "Upload video"; supported: mp4, mov, insv, ≥20 photos | Show good vs bad example clips |
| 3 | Upload + status | Progress bar; job stages; time estimate; "While you wait: try a sample room"; email me when ready | Never a blank spinner |
| 4 | Calibrate | Room view; floor auto-detected highlight; "Click two points you know the distance between" + length input (default 2.0 m door) | Skippable with "Use estimated scale" |
| 5 | **Editor** (main) | Left: Add panel (Prompt / Photo / Library); center: 3D view; right: Inspector (selected item: dimensions, material, style, open/close, delete); top: mode switch (Orbit / Walk / Top), Style chips, Undo/Redo, Before/After, Share | See layout §4 |
| 6 | Style Roulette | Wheel overlay; spin; result chip; apply | Fun, quick |
| 7 | Before/After | Full-screen slider; "Save image", "Make GIF" | Same camera both states |
| 8 | Share | Link toggle (off by default), copy; QR for AR; export buttons (GLB, STL, USDZ per item, MP4) | Privacy note |
| 9 | Projects | Grid of rooms & designs; usage meter | P1 |
| 10 | Settings | Units, quality, language, delete data | |

## 3. Capture guide text (show to users)

1. **Light it up.** Turn on lights, open curtains.
2. **Walk slowly** around the room for 30–60 seconds, phone at chest height, then once more higher.
3. **See every wall and corner.** Overlap your path; don't spin quickly.
4. **Avoid** mirrors facing the camera, people moving, and very dark corners.

## 4. Editor layout (desktop 1440×900)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ReRoom ▸ My Bedroom      [Orbit|Walk|Top]  [Japandi][Industrial][…][🎲]  ↶ ↷  [Before/After] [Share] │
├──────────────┬───────────────────────────────────────────────┬───────────────┤
│ ADD          │                                               │ INSPECTOR     │
│ [Prompt]     │                                               │ Reading Chair │
│ "a mustard…" │             3D ROOM VIEW                      │ W 78 D 82 H 96│
│ [Generate]   │      (Aholo Viewer: scan + furniture)         │ Style: Japandi│
│ [Photo ↑]    │                                               │ Material ▾    │
│ LIBRARY      │                                               │ [Open/Close]  │
│ ▢ ▢ ▢ ▢      │                                               │ [Duplicate]   │
│ ▢ ▢ ▢ ▢      │                                               │ [Delete]      │
│ Generating:  │                                               │ [View in AR]  │
│ • Chair 62%  │                                               │               │
└──────────────┴───────────────────────────────────────────────┴───────────────┘
```

Mobile (390×844): 3D view full screen; bottom sheet with tabs Add / Style / Item; floating mode switch; virtual joystick in Walk mode.

## 5. Interactions

| Action | Desktop | Touch |
| --- | --- | --- |
| Orbit / look | Right-drag (orbit), mouse (walk, pointer lock) | 1-finger drag |
| Pan / zoom | Middle-drag / wheel | 2-finger pan / pinch |
| Select item | Click | Tap |
| Move item | Drag on floor | Drag |
| Rotate item | Q / E (15°), or ring handle | Rotate handle |
| Open/close articulated item | Double-click or Inspector button | Double-tap |
| Delete / duplicate | Del / Ctrl+D | Inspector buttons |
| Undo / redo | Ctrl+Z / Ctrl+Shift+Z | Buttons |
| Walk | WASD + mouse | Left joystick + drag to look |

## 6. Generation UX (never make users wait idle)

1. User submits prompt → instantly a **ghost box** (estimated size for the category) appears where they'll place it, with a shimmer and percentage.
2. They can keep arranging or generate more (queue shows in the left panel).
3. When ready → ghost "materializes": dissolve-in shader from bottom to top + soft chime.
4. If generation fails → ghost turns amber with "Retry" / "Pick similar from library".

## 7. Visual design system

| Token | Value |
| --- | --- |
| Primary | #2F6BFF (action blue) |
| Accent | #FFB020 (warm amber, for "magic"/AI moments) |
| Surface | #FFFFFF / #F5F6F8 (light UI so photoreal rooms read well) |
| Text | #121417 / #5B6270 |
| Radius | 12 px panels, 8 px buttons |
| Font | Inter (UI), "Fraunces" or "DM Serif Display" (marketing headings) |
| Icons | Lucide |
| Motion | 150–250 ms ease-out; materialize 600 ms |

Tone of copy: friendly, short, confident. ("Your room is ready." "Try Japandi?")

## 8. Accessibility

- All buttons keyboard-reachable; visible focus.
- Color is never the only signal (icons + labels on warnings).
- Reduced motion setting disables camera bobbing and big transitions.
- Text contrast ≥ 4.5:1.
