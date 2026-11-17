# 00 — Product Brief

## 1. One-liner

**ReRoom lets anyone redesign their real room in 3D — scan it with a phone, add AI-generated furniture that really works, restyle it in one click, and see it in AR before buying anything.**

Tagline: **Scan it. Remix it. Live in it.**

## 2. Problem

- People redesigning a room can't picture new furniture or styles in *their own* space. Mood boards and catalog photos don't show scale, fit or how it feels to walk around.
- Pro tools (CAD, 3D modeling) take hours to learn and require modeling the room by hand.
- Existing AR apps place one catalog item at a time; they can't generate *anything you describe* or restyle a whole room.

## 3. Solution

1. **Capture:** 30–60 s phone (or 360 camera) video → a photoreal walkable 3D copy of the room (Aholo Reality, 3D Gaussian splats).
2. **Create:** Describe or photograph any furniture → Lux3D builds it with PBR materials at real-world size.
3. **Interact:** Generated furniture has moving parts (Lux3D articulation): open the wardrobe, pull the drawer.
4. **Restyle:** One click turns the whole design Japandi, Industrial, Scandinavian… (Lux3D material transfer).
5. **Decide & share:** Before/after slider, AR view on phone (USDZ), cinematic tour video (LuxReal), share link, exports.

## 4. Target users

| Persona | Need | Hook |
| --- | --- | --- |
| **Renter / first apartment (primary)** | "Will this fit? What style suits my room?" | Free scan + 3 AI items |
| **Home owner planning a makeover** | Try styles before spending money | Style Roulette, before/after |
| **Interior designer / freelancer** | Fast client presentations | Share links, tour video, exports |
| **Furniture maker / small brand** | Show custom pieces in customers' rooms | Photo-to-3D + AR |
| **Content creators** | Room makeover content | Tour videos, before/after |

## 5. Positioning vs. alternatives

| | ReRoom | Catalog AR apps | Pro CAD / room planners | Other Lux3D hackathon tools seen |
| --- | --- | --- | --- | --- |
| Your real room, photoreal | ✅ 3DGS scan | camera passthrough only | manual floor plan | mostly empty viewers / generic scenes |
| Any furniture you describe | ✅ text/photo → 3D | catalog only | catalog / manual modeling | ✅ |
| Working moving parts | ✅ articulation | ❌ | some | rarely |
| One-click restyle | ✅ material transfer | ❌ | manual | some (product colour variants) |
| Walk inside | ✅ | ❌ | ✅ | rarely |
| Learning curve | minutes | minutes | hours | minutes |

**Differentiation:** the only flow that combines a **real-room scan + generated furniture + working articulation + whole-room restyle** in the browser.

## 6. Business model (post-hackathon)

| Plan | Price | Includes |
| --- | --- | --- |
| Free | $0 | 1 room scan, 5 AI items/month, watermark on exports |
| Plus | $9 / month | 5 rooms, 100 AI items, all styles, AR, HD tour video, no watermark |
| Pro (designers) | $29 / month | Unlimited rooms, client share pages, branded exports, priority generation |
| Brands (B2B) | custom | Embed "View in your room" for their catalog (photo-to-3D of real products) |

Unit economics to validate: Aholo cost per scan + per generated item vs. plan price; caching and the shared furniture library reduce cost per user.

## 7. Success metrics

- Activation: % of new users who complete a scan **and** place 1 item (target 40%).
- "Wow" rate: % who use restyle at least once (target 60% of activated).
- Share rate: % of projects shared (target 15%).
- Time to first placed item after scan ready: < 2 minutes.

## 8. Why it fits Manycore & the hackathon

- Manycore's core business is spatial design software (Kujiale / Coohom). ReRoom is a consumer-friendly, AI-first take on the same problem.
- It uses **almost every Aholo capability**: World API reconstruction + generation, Aholo Viewer, Lux3D text/image-to-3D, retopology, material transfer, part split, articulation, export, RenderCloud (optional), LuxReal.
- Partner fit: Insta360 (360 capture — the World API accepts Insta360 `.insv` files).
- Target awards: main prizes, **Spatial Design Application Award**, Technical Excellence, 3D Printing (mini-room STL), Popularity.
