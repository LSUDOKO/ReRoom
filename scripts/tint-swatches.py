"""Re-tint material swatches so each one matches its style's palette (content/styles.json).

ambientCG (CC0) only has a few colors per material, so neutral bases are colorized here.
Usage: python3 scripts/tint-swatches.py   (needs Pillow)
"""
from PIL import Image, ImageOps

M = "public/materials"


def tint(base: str, color: str, out: str, stripes: str | None = None):
    im = Image.open(f"{M}/{base}.jpg").convert("RGB")
    gray = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=2)
    c = tuple(int(color[i : i + 2], 16) for i in (1, 3, 5))
    dark = tuple(int(v * 0.35) for v in c)
    light = tuple(min(255, int(v * 1.25 + 20)) for v in c)
    col = ImageOps.colorize(gray, black=dark, white=light, mid=c)
    if stripes:  # e.g. coastal blue-and-white stripes
        s = tuple(int(stripes[i : i + 2], 16) for i in (1, 3, 5))
        px = col.load()
        for y in range(col.height):
            if (y // 48) % 2:
                for x in range(col.width):
                    r, g, b = px[x, y]
                    px[x, y] = tuple(int(0.35 * v + 0.65 * w) for v, w in zip((r, g, b), s))
    # keep the white studio background around the sphere
    mask = Image.eval(ImageOps.grayscale(im), lambda v: 255 if v > 246 else 0)
    col.paste((255, 255, 255), mask=mask)
    col.save(f"{M}/{out}.jpg", quality=90)


FIXES = [
    # (base swatch, target color, output, stripes)
    ("midcentury_fabric", "#d8cbb5", "japandi_fabric", None),  # oatmeal linen
    ("industrial_metal", "#2b2b2b", "japandi_metal", None),  # matte black steel
    ("japandi_wood", "#ece2d0", "scandi_wood", None),  # white oak
    ("industrial_metal", "#e6e8ea", "scandi_metal", None),  # brushed white metal
    ("midcentury_fabric", "#d9a441", "midcentury_fabric", None),  # mustard velvet
    ("japandi_wood", "#6b4226", "midcentury_wood", None),  # walnut
    ("luxury_metal", "#c9a24a", "midcentury_metal", None),  # brass
    ("midcentury_fabric", "#a8553a", "boho_fabric", None),  # terracotta kilim
    ("luxury_metal", "#9c7a3c", "boho_metal", None),  # antique brass
    ("industrial_stone", "#b5653d", "boho_stone", None),  # terracotta
    ("japandi_wood", "#15151d", "cyberpunk_wood", None),  # black gloss lacquer
    ("industrial_fabric", "#ff2e88", "cyberpunk_fabric", None),  # neon vinyl
    ("industrial_stone", "#19e3ff", "cyberpunk_stone", None),  # glowing acrylic
    ("japandi_wood", "#ece6da", "coastal_wood", None),  # whitewashed wood
    ("midcentury_fabric", "#7fa6c4", "coastal_fabric", "#f4f6f8"),  # blue striped cotton
    ("industrial_metal", "#b9bec4", "coastal_metal", None),  # brushed nickel
    ("industrial_stone", "#d8c7a6", "coastal_stone", None),  # sand
    ("japandi_wood", "#2a1d17", "luxury_wood", None),  # ebony
    ("midcentury_fabric", "#1f5c4a", "luxury_fabric", None),  # emerald velvet
]

# read every base before writing, since some bases are also outputs
bases = {b: Image.open(f"{M}/{b}.jpg").copy() for b, *_ in FIXES}
for b, img in bases.items():
    img.save(f"{M}/_base_{b}.jpg", quality=95)
for b, color, out, stripes in FIXES:
    tint(f"_base_{b}", color, out, stripes)

import glob, os

for f in glob.glob(f"{M}/_base_*.jpg"):
    os.remove(f)
with open(f"{M}/CREDITS.txt", "a") as fh:
    fh.write("\nRe-tinted to style palettes by scripts/tint-swatches.py (derived from the CC0 assets above).\n")
print("tinted", len(FIXES))
