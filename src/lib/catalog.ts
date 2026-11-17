import library from "../../content/library.json";
import rooms from "../../content/rooms.json";
import styles from "../../content/styles.json";

export type Category = "seating" | "table" | "storage" | "bed" | "lighting" | "plant" | "decor" | "textile" | "appliance";
export type Dims = { w: number; d: number; h: number };

export type LibraryItem = {
  id: string;
  name: string;
  category: Category;
  dims: Dims;
  prompt: string;
  articulate?: string;
};

export type Style = (typeof styles)[number];
export type Slot = "wood" | "fabric" | "metal" | "stone";

export type SampleRoom = {
  id: string;
  name: string;
  blurb: string;
  url: string; // .spz / .ply / .sog
  thumb?: string;
  calibration: { up: "+y" | "-y" | "+z" | "-z"; scale: number; yaw: number; offset: [number, number, number] };
  camera?: { position: [number, number, number]; target: [number, number, number] };
  source: "spatialgen" | "scan" | "sample";
  worldId?: string;
};

export const LIBRARY = library as LibraryItem[];
export const STYLES = styles as Style[];
export const SAMPLE_ROOMS = rooms as SampleRoom[];

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "seating", label: "Seating" },
  { id: "table", label: "Tables" },
  { id: "storage", label: "Storage" },
  { id: "bed", label: "Beds" },
  { id: "lighting", label: "Lighting" },
  { id: "plant", label: "Plants" },
  { id: "decor", label: "Decor" },
  { id: "textile", label: "Rugs" },
  { id: "appliance", label: "Appliances" },
];

/** Ghost-box sizes while generating (docs/04 §4). */
export const CATEGORY_DIMS: Record<Category, Dims> = {
  seating: { w: 0.8, d: 0.8, h: 0.95 },
  table: { w: 1.4, d: 0.8, h: 0.75 },
  storage: { w: 1.2, d: 0.6, h: 2.0 },
  bed: { w: 1.6, d: 2.0, h: 0.5 },
  lighting: { w: 0.4, d: 0.4, h: 1.6 },
  plant: { w: 0.5, d: 0.5, h: 1.2 },
  decor: { w: 0.4, d: 0.4, h: 0.5 },
  textile: { w: 2.0, d: 1.4, h: 0.02 },
  appliance: { w: 0.6, d: 0.65, h: 1.5 },
};

/** Which material slot a category takes when restyled (docs/06 §3). */
export const CATEGORY_SLOT: Record<Category, Slot> = {
  seating: "fabric",
  bed: "fabric",
  textile: "fabric",
  table: "wood",
  storage: "wood",
  appliance: "metal",
  lighting: "metal",
  decor: "stone",
  plant: "stone",
};

export const ARTICULATION_PROMPTS: Partial<Record<Category, string>> = {
  storage: "the front doors swing open on vertical hinges and the drawers slide straight out",
  appliance: "the front door swings open on a side hinge",
  table: "the drawer slides straight out forward",
  bed: "the storage drawers under the bed slide out",
  decor: "the lid rotates open on the back hinge",
};

export const materialPath = (styleId: string, slot: Slot) => `/materials/${styleId}_${slot}.jpg`;

export const libraryById = (id: string) => LIBRARY.find((i) => i.id === id);

/** Asset paths for library items. Articulated items ship a URDF folder. */
export const libraryAsset = (id: string) => ({
  glb: `/library/${id}.glb`,
  urdf: `/library/${id}/robot.urdf`,
  thumb: `/library/thumbs/${id}.webp`,
});

/** Guess a category from a free-text prompt. */
export function guessCategory(text: string): Category {
  const t = text.toLowerCase();
  const rules: [Category, RegExp][] = [
    ["bed", /\bbed|crib|mattress/],
    ["storage", /wardrobe|cabinet|drawer|dresser|shelf|bookcase|sideboard|chest|closet|nightstand|credenza|cupboard/],
    ["appliance", /fridge|refrigerator|microwave|oven|washer|stove/],
    ["lighting", /lamp|light|chandelier|sconce|pendant/],
    ["plant", /plant|tree|cactus|fern|monstera|flower/],
    ["textile", /rug|carpet|mat\b|curtain/],
    ["table", /table|desk|console/],
    ["seating", /chair|sofa|couch|stool|bench|armchair|ottoman|seat|pouf|bean ?bag/],
  ];
  return rules.find(([, r]) => r.test(t))?.[0] ?? "decor";
}
