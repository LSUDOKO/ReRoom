# 06 — Asset Library, Styles & Prompts

## 1. Prompt template (furniture)

```
{object description}, {material words}, {style words},
realistic furniture product model, real-world proportions, clean geometry,
single object, centered, no background, no people, no text, no logos
```
- Lux3D style: `photorealistic` (default).
- Category size hint passed to Lux3D size options (`aiPredictSize` or `customSize` — verify) and used for the ghost box.
- For articulation candidates add: "closed doors" / "drawers closed" so the base mesh starts closed.

## 2. Seed library (~40 items, pre-generate tonight)

`content/library.json` rows: `{ id, name, category, prompt, dims:{w,d,h}, articulate: bool, articulationPrompt? }`

| ID | Name | Category | Dims W×D×H (m) | Articulate |
| --- | --- | --- | --- | --- |
| L_SOFA_3 | 3-seat sofa | seating | 2.1×0.9×0.85 | – |
| L_ARMCHAIR | Reading armchair | seating | 0.8×0.85×0.95 | – |
| L_LOUNGE | Lounge chair + ottoman | seating | 0.85×0.9×0.9 | – |
| L_DINING_CHAIR | Dining chair | seating | 0.45×0.5×0.85 | – |
| L_STOOL | Bar stool | seating | 0.4×0.4×0.75 | – |
| L_BEANBAG | Bean bag | seating | 0.9×0.9×0.7 | – |
| L_BED_DOUBLE | Double bed | bed | 1.6×2.05×1.0 | – |
| L_BED_SINGLE | Single bed with storage drawers | bed | 0.95×2.0×0.9 | ✅ drawers slide out |
| L_CRIB | Baby crib | bed | 0.7×1.3×0.95 | – |
| L_COFFEE | Coffee table | table | 1.1×0.6×0.42 | – |
| L_DINING | Dining table | table | 1.6×0.9×0.75 | – |
| L_DESK | Writing desk with drawer | table | 1.2×0.6×0.75 | ✅ drawer |
| L_SIDE | Side table | table | 0.45×0.45×0.55 | – |
| L_CONSOLE | Console table | table | 1.2×0.35×0.8 | – |
| L_WARDROBE | Two-door wardrobe | storage | 1.2×0.6×2.0 | ✅ doors swing |
| L_DRAWERS | Chest of drawers | storage | 0.9×0.45×0.9 | ✅ drawers slide |
| L_SIDEBOARD | Sideboard with doors | storage | 1.6×0.45×0.8 | ✅ doors |
| L_BOOKSHELF | Bookshelf | storage | 0.9×0.35×1.9 | – |
| L_TV_UNIT | TV unit with drawers | storage | 1.8×0.4×0.5 | ✅ |
| L_NIGHTSTAND | Nightstand with drawer | storage | 0.45×0.4×0.55 | ✅ |
| L_FRIDGE | Retro fridge | appliance | 0.6×0.65×1.5 | ✅ door |
| L_MICROWAVE | Microwave | appliance | 0.5×0.4×0.3 | ✅ door |
| L_LAPTOP | Laptop | decor | 0.33×0.23×0.02 | ✅ lid |
| L_FLOOR_LAMP | Floor lamp | lighting | 0.4×0.4×1.6 | – (emits light) |
| L_TABLE_LAMP | Table lamp | lighting | 0.3×0.3×0.5 | – (emits light) |
| L_PENDANT | Pendant light | lighting | 0.5×0.5×0.6 | – |
| L_PLANT_BIG | Monstera in pot | plant | 0.7×0.7×1.3 | – |
| L_PLANT_SMALL | Snake plant | plant | 0.3×0.3×0.7 | – |
| L_CACTUS | Cactus trio | plant | 0.4×0.25×0.5 | – |
| L_RUG_RECT | Rectangular rug | textile | 2.0×1.4×0.01 | – |
| L_RUG_ROUND | Round rug | textile | 1.6×1.6×0.01 | – |
| L_CURTAIN | Curtains | textile | 1.5×0.1×2.4 | – |
| L_MIRROR | Floor mirror | decor | 0.6×0.05×1.7 | – |
| L_ART | Framed abstract art | decor | 0.8×0.04×1.0 | – |
| L_VASE | Ceramic vase | decor | 0.25×0.25×0.4 | – |
| L_CLOCK | Wall clock | decor | 0.4×0.05×0.4 | – |
| L_GUITAR | Acoustic guitar on stand | decor | 0.4×0.4×1.0 | – |
| L_SPEAKER | Bookshelf speaker pair | decor | 0.2×0.25×0.35 | – |
| L_CAT_TREE | Cat tree | pet | 0.6×0.6×1.5 | – |
| L_BOX | Storage box with lid | storage | 0.5×0.35×0.3 | ✅ lid |

Write a full natural prompt for each (e.g., L_WARDROBE: "a two-door wooden wardrobe with simple handles, doors closed, light oak wood, modern minimal design").

## 3. Style presets (`content/styles.json`)

Each style has reference images per material slot. Material transfer picks the slot by item category.

| Style | Wood slot | Fabric slot | Metal slot | Stone/other | Mood words |
| --- | --- | --- | --- | --- | --- |
| Japandi | light ash wood | oatmeal linen | matte black steel | paper / rattan | calm, natural, low |
| Scandinavian | white oak | light grey wool | brushed white metal | white ceramic | bright, airy |
| Industrial | dark reclaimed wood | cognac leather | raw black iron | concrete | urban, loft |
| Mid-century | walnut | mustard velvet | brass | terrazzo | retro, warm |
| Boho | rattan / cane | patterned kilim | antique brass | terracotta | layered, plants |
| Cyberpunk | black gloss lacquer | neon-trim vinyl | chrome | glowing acrylic | night, neon |
| Coastal | whitewashed wood | blue striped cotton | brushed nickel | sand / jute | breezy |
| Luxury | dark ebony | emerald velvet | polished gold | marble | rich, glamorous |

Category → slot mapping:
- seating → fabric (cushions) + wood/metal (legs) → if part split exists, transfer per part; otherwise main slot = fabric.
- table, storage, bed → wood.
- lighting → metal.
- decor → stone/ceramic.
- textile → fabric.
- plant → pot only (stone), keep leaves (if part split), otherwise skip plants.

## 4. Material reference images

`content/materials/{style}_{slot}.jpg` — 1024×1024, flat, evenly lit, no shadows, no logos. Sources: your own photos of real materials, or CC0 texture sites (ambientCG, Poly Haven) rendered as a flat swatch.

## 5. Dream-room prompts (SpatialGen samples)

1. "a cozy Japandi studio apartment with large windows, warm afternoon light, wooden floor"
2. "an industrial loft with exposed brick walls, high ceilings, evening light"
3. "a sunny coastal bedroom with white walls and a sea view"

## 6. Articulation prompts (verify input format)

| Item type | Articulation prompt |
| --- | --- |
| Wardrobe / cabinet / sideboard | "the two front doors swing open on vertical hinges" |
| Drawers | "the drawers slide straight out forward" |
| Fridge / microwave | "the front door swings open on a side hinge" |
| Laptop / box | "the lid rotates open on the back hinge" |
| Bed with drawers | "the storage drawers under the bed slide out" |

## 7. Safety filter (prompts)

Block: real people/celebrities, weapons, explicit content, brand names/logos ("IKEA", "Eames" etc. → replace with generic description and tell the user), hateful symbols. Use a keyword list + an LLM moderation call.
