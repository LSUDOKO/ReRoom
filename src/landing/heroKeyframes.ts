// Tune the scroll-driven hero chair here. One keyframe per landing section, in page order.
//
// x / y   viewport-relative position of the chair's center: -1 = left/bottom edge, 1 = right/top edge
// z       depth in world units (negative = further away)
// rotY    yaw in degrees (0 = facing the camera), rotX = pitch in degrees
// scale   1 = the chair is 1.2 units tall
// material  0 velvet · 1 leather · 2 linen · 3 bouclé (fractional values crossfade)
// explode   0–1: the Lux3D part split flies apart
// particles 0–1: the mesh dissolves into points sampled from its surface
// wire      0–1: thin wireframe room drawn around the chair
// room      0–1: floor and two walls for the closing scene
// lamp      0–1: warm lamp light in the closing scene
// anchor    optional CSS selector; the chair moves to that element's center instead of x/y
//
// `mobile` overrides apply below 768 px: the chair stays centered above the text.

export type HeroKeyframe = {
  section: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  rotX: number;
  scale: number;
  material: number;
  explode: number;
  particles: number;
  wire: number;
  room: number;
  lamp: number;
  anchor?: string;
  mobile?: Partial<Omit<HeroKeyframe, "section" | "mobile">>;
};

const base = { z: 0, rotX: 6, material: 0, explode: 0, particles: 0, wire: 0, room: 0, lamp: 0 };

export const HERO_KEYFRAMES: HeroKeyframe[] = [
  { ...base, section: "hero", x: 0.5, y: -0.08, rotY: -28, scale: 1.25, mobile: { x: 0, y: 0.38, scale: 0.72 } },
  { ...base, section: "scan", x: 0, y: -0.02, rotY: 20, scale: 1.05, particles: 1, mobile: { y: 0.4, scale: 0.7 } },
  { ...base, section: "remix", x: 0.48, y: -0.05, rotY: -40, scale: 0.95, wire: 1, mobile: { x: 0, y: 0.42, scale: 0.6 } },
  { ...base, section: "alive", x: 0.52, y: 0.12, rotY: 35, rotX: 12, scale: 1, explode: 1, mobile: { x: 0, y: 0.42, scale: 0.6 } },
  { ...base, section: "styles", x: -0.5, y: -0.02, rotY: 25, scale: 1.15, mobile: { x: 0, y: 0.36, scale: 0.75 } },
  // the chair swims off-screen past the gallery and plans, then comes back for AR
  { ...base, section: "assets", x: 1.35, y: 0.25, rotY: -60, scale: 0.7, mobile: { x: 1.4, y: 0.3, scale: 0.5 } },
  { ...base, section: "pricing", x: 1.35, y: -0.1, rotY: -80, scale: 0.7, mobile: { x: 1.4, y: 0, scale: 0.5 } },
  { ...base, section: "ar", x: 0, y: 0, rotY: -20, scale: 0.27, anchor: "#ar-phone-screen", mobile: { scale: 0.24 } },
  // and again past the Aholo cards and the FAQ, re-entering for the closing room
  { ...base, section: "aholo", x: -1.35, y: 0.1, rotY: 60, scale: 0.7, mobile: { x: -1.4, y: 0.2, scale: 0.5 } },
  { ...base, section: "faq", x: -1.35, y: -0.1, rotY: 40, scale: 0.7, mobile: { x: -1.4, y: 0, scale: 0.5 } },
  { ...base, section: "cta", x: 0.52, y: -0.18, rotY: -35, rotX: 10, scale: 0.9, room: 1, lamp: 1, mobile: { x: 0, y: 0.42, scale: 0.55 } },
];

/** Hero assets, all generated with Aholo Lux3D (see content/site-assets.json). */
export const HERO_MODELS = {
  chair: "/site/hero/chair.glb",
  parts: "/site/hero/chair-parts.glb",
  materials: ["/site/hero/chair.glb", "/site/hero/chair-leather.glb", "/site/hero/chair-linen.glb", "/site/hero/chair-boucle.glb"],
  lamp: "/library/L_TABLE_LAMP.glb",
  poster: "/site/hero/chair-poster.webp",
};

export const MATERIAL_NAMES = ["Velvet", "Leather", "Linen", "Bouclé"];

export const MOTION = {
  scrub: 1.2, // GSAP ScrollTrigger lag, seconds
  inertia: 0.08, // per-frame damping toward the scroll target
  floatAmp: 0.06,
  floatSpeed: 0.8,
  yawDrift: 4, // degrees
  bank: 10, // max roll in degrees when travelling sideways
  parallax: 8, // max tilt toward the cursor in degrees (desktop only)
  particles: 6000,
  particlesMobile: 1500,
  dust: 400,
};
