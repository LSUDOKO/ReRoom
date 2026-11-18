"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { HERO_KEYFRAMES, MOTION, type HeroKeyframe } from "@/landing/heroKeyframes";

gsap.registerPlugin(ScrollTrigger);

export type Pose = Omit<HeroKeyframe, "section" | "mobile" | "anchor"> & { segment: number };

const NUMERIC = ["x", "y", "z", "rotY", "rotX", "scale", "material", "explode", "particles", "wire", "room", "lamp"] as const;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Where a section's keyframe sits: an optional `#<section>-stop` element, else the section itself. */
export const stopElement = (section: string) => document.getElementById(`${section}-stop`) ?? document.getElementById(section);

export function resolveKeyframe(k: HeroKeyframe, mobile: boolean): HeroKeyframe {
  const r = mobile && k.mobile ? { ...k, ...k.mobile } : { ...k };
  if (k.anchor && typeof document !== "undefined") {
    const el = document.querySelector(k.anchor);
    const sec = stopElement(k.section);
    if (el && sec) {
      // anchor position relative to the viewport when its section is centered on screen
      const a = el.getBoundingClientRect();
      const s = sec.getBoundingClientRect();
      const cy = a.top + a.height / 2 - (s.top + s.height / 2) + innerHeight / 2;
      r.x = ((a.left + a.width / 2) / innerWidth) * 2 - 1;
      r.y = -((cy / innerHeight) * 2 - 1);
    }
  }
  return r;
}

/**
 * Master scroll timeline. Page progress 0→1 is scrubbed by GSAP ScrollTrigger (lagging the
 * scrollbar by MOTION.scrub seconds); each section's keyframe sits at the progress where that
 * section is centered in the viewport. Returns a ref with the current interpolated pose.
 */
export function useScrollTimeline(mobile: boolean) {
  const pose = useRef<Pose>({ ...HERO_KEYFRAMES[0], segment: 0 });
  const progress = useRef({ value: 0 });
  const stops = useRef<number[]>([]);

  useEffect(() => {
    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      stops.current = HERO_KEYFRAMES.map((k) => {
        const el = stopElement(k.section);
        if (!el) return 0;
        const top = el.getBoundingClientRect().top + scrollY;
        return Math.min(1, Math.max(0, (top + el.offsetHeight / 2 - innerHeight / 2) / max));
      });
      stops.current[0] = 0;
    };
    measure();
    const tween = gsap.to(progress.current, {
      value: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: MOTION.scrub, onRefresh: measure },
    });
    addEventListener("resize", measure);
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      removeEventListener("resize", measure);
    };
  }, []);

  /** Call once per frame: interpolates between the two surrounding keyframes. */
  const update = () => {
    const p = progress.current.value;
    const s = stops.current;
    let i = 0;
    while (i < s.length - 2 && p > s[i + 1]) i++;
    const span = Math.max(1e-6, (s[i + 1] ?? 1) - (s[i] ?? 0));
    const t = smooth(Math.min(1, Math.max(0, (p - (s[i] ?? 0)) / span)));
    const a = resolveKeyframe(HERO_KEYFRAMES[i], mobile);
    const b = resolveKeyframe(HERO_KEYFRAMES[Math.min(i + 1, HERO_KEYFRAMES.length - 1)], mobile);
    const out = { segment: i + t } as Pose;
    for (const key of NUMERIC) out[key] = a[key] + (b[key] - a[key]) * t;
    pose.current = out;
    return out;
  };

  return { pose, update, progress };
}
