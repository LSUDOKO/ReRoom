"use client";
// Page choreography (GSAP): the hero intro, sheets tearing apart on scroll, blur-in reveals,
// paper-cut photo reveals, magnetic liquid-glass buttons, count-ups and the drawn step line.
// Nothing here transforms a <section> or its `-stop` children: the 3D chair reads their rects.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);
const EASE = "expo.out";

export function Motion() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("js");
    const cleanups: (() => void)[] = [];

    // liquid glass: the highlight follows the cursor; [data-magnetic] buttons lean toward it
    const onMove = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>(".glass");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", `${e.clientX - r.left}px`);
      btn.style.setProperty("--my", `${e.clientY - r.top}px`);
      if (!reduce && btn.hasAttribute("data-magnetic"))
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.18, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.5, ease: "power3.out" });
    };
    const onLeave = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest?.<HTMLElement>(".glass");
      if (!btn || btn.contains(e.relatedTarget as Node)) return;
      btn.style.removeProperty("--mx");
      btn.style.removeProperty("--my");
      if (!reduce) gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.45)" });
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerout", onLeave);
    cleanups.push(() => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
    });

    const counts = gsap.utils.toArray<HTMLElement>("[data-count]");
    const countUp = (el: HTMLElement) => {
      const to = Number(el.dataset.count);
      const fmt = (v: number) => Math.round(v).toLocaleString("en-US");
      if (reduce) return void (el.textContent = fmt(to));
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.6, ease: EASE, onUpdate: () => void (el.textContent = fmt(o.v)) });
    };

    if (reduce) {
      counts.forEach(countUp);
      return () => cleanups.forEach((c) => c());
    }

    const ctx = gsap.context(() => {
      // hero intro: two torn sheets slide in from the corners, the band unclips, the chrome wordmark sweeps
      const tl = gsap.timeline({ defaults: { ease: EASE } });
      tl.from(".tear-a", { xPercent: 18, yPercent: -18, opacity: 0, duration: 1.4 })
        .from(".tear-b", { xPercent: -18, yPercent: 18, opacity: 0, duration: 1.4 }, 0.08)
        .fromTo(".hero-band", { clipPath: "inset(0 50% 0 50%)" }, { clipPath: "inset(-300px -300vw -300px -300vw)", duration: 1.1 }, 0.45)
        .from(".hero-mark", { rotate: -90, scale: 0.4, opacity: 0, duration: 1.2, ease: "elastic.out(1, 0.6)" }, 0.9)
        .fromTo(".hero-word", { backgroundPositionY: "100%", opacity: 0 }, { backgroundPositionY: "0%", opacity: 1, duration: 1.6 }, 0.8)
        .from(".hero-dim", { opacity: 0, duration: 0.8, stagger: 0.12 }, 1.2)
        .from(".hero-copy > *", { opacity: 0, y: 18, duration: 0.9, stagger: 0.12 }, 1.2);

      // leaving the hero: the sheets tear apart and the band sinks
      const leave = { trigger: "#hero", start: "top top", end: "bottom top", scrub: true };
      gsap.to(".tear-a", { xPercent: 22, yPercent: -20, rotate: 4, ease: "none", scrollTrigger: leave });
      gsap.to(".tear-b", { xPercent: -22, yPercent: 20, rotate: -4, ease: "none", scrollTrigger: leave });
      gsap.to(".hero-band", { scale: 0.9, opacity: 0.2, ease: "none", scrollTrigger: leave });
      gsap.to(".hero-copy", { y: 80, opacity: 0, ease: "none", scrollTrigger: leave });

      // reveals: blur in from below
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) =>
        gsap.fromTo(el, { opacity: 0, y: 28, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: EASE, scrollTrigger: { trigger: el, start: "top 85%", once: true } }),
      );

      // photos cut out of paper: they tear open from the middle and settle with a slight tilt
      gsap.utils.toArray<HTMLElement>("[data-cut]").forEach((el, i) =>
        gsap.fromTo(
          el,
          { clipPath: "polygon(48% 0, 52% 0, 54% 100%, 46% 100%)", rotate: i % 2 ? 2.5 : -2.5, scale: 0.94 },
          { clipPath: "polygon(-10% 0, 110% 0, 110% 100%, -10% 100%)", rotate: i % 2 ? 0.6 : -0.6, scale: 1, duration: 1.3, ease: EASE, scrollTrigger: { trigger: el, start: "top 82%", once: true } },
        ),
      );

      // the steps line draws itself
      gsap.utils.toArray<HTMLElement>("[data-line]").forEach((el) =>
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0 50%", ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "top 45%", scrub: true } }),
      );

      // marquee rows drift with scroll velocity
      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((el) =>
        gsap.to(el, { xPercent: Number(el.dataset.drift), ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }),
      );

      counts.forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => countUp(el) }));
    });
    cleanups.push(() => ctx.revert());

    // nav: highlight the section in view
    const links = gsap.utils.toArray<HTMLAnchorElement>("[data-nav] a[href^='/#']");
    links.forEach((a) => {
      const id = a.getAttribute("href")!.slice(2);
      const st = ScrollTrigger.create({ trigger: `#${id}`, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && links.forEach((l) => l.toggleAttribute("data-active", l === a)) });
      cleanups.push(() => st.kill());
    });

    return () => cleanups.forEach((c) => c());
  }, []);
  return null;
}
