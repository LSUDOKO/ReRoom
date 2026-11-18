import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, code, display } from "./theme";

export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const p = (f: number, start: number, dur: number, ease = OUT) =>
  interpolate(f, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

/** The brand field: ink, a slow blue aurora and grain, as on the ReRoom site. */
export const Field: React.FC<{ children?: React.ReactNode; glow?: number }> = ({ children, glow = 1 }) => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 90) * 12, y = 40 + Math.cos(f / 110) * 10;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: glow, background: `radial-gradient(60% 55% at ${x}% ${y}%, rgba(27,104,252,.42), transparent 70%), radial-gradient(45% 40% at ${100 - x}% ${100 - y}%, rgba(31,43,255,.28), transparent 70%)` }} />
      {children}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.6) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

/** A line rising out of a mask: the type move used through the film. */
export const Rise: React.FC<{ at: number; size?: number; color?: string; weight?: number; children: React.ReactNode; out?: number; style?: React.CSSProperties; dur?: number; chrome?: boolean }> = ({
  at, size = 96, color = C.paper, weight = 700, children, out, style, dur = 18, chrome }) => {
  const f = useCurrentFrame();
  const k = p(f, at, dur);
  const o = out === undefined ? 0 : p(f, out, 12, INOUT);
  const text: React.CSSProperties = chrome
    ? { backgroundImage: "linear-gradient(180deg,#ffffff 0%,#cfd3e0 45%,#7d8399 100%)", WebkitBackgroundClip: "text", color: "transparent" }
    : { color };
  return (
    <div style={{ overflow: "hidden", paddingBottom: size * 0.16, lineHeight: 1.04, ...style }}>
      <div style={{ transform: `translateY(${(1 - k) * 115 - o * 115}%)`, fontFamily: display, fontSize: size, fontWeight: weight, letterSpacing: "-0.035em", ...text }}>{children}</div>
    </div>
  );
};

export const Label: React.FC<{ children: React.ReactNode; k?: number; color?: string; style?: React.CSSProperties }> = ({ children, k = 1, color = C.soft, style }) => (
  <div style={{ fontFamily: code, fontSize: 24, letterSpacing: "0.22em", textTransform: "uppercase", color, opacity: k, ...style }}>{children}</div>
);

/** Glass pill, the site's button language. */
export const Glass: React.FC<{ children: React.ReactNode; blue?: boolean; style?: React.CSSProperties }> = ({ children, blue, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "18px 34px", borderRadius: 999, fontFamily: display, fontWeight: 500, fontSize: 32, color: "#fff",
    background: blue ? "linear-gradient(180deg,#3b82ff,#1b68fc 60%,#0e4fd6)" : "rgba(255,255,255,.07)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), inset 0 0 0 1px rgba(255,255,255,.12), 0 20px 50px -20px rgba(27,104,252,.7)", ...style }}>{children}</div>
);

export const Logo: React.FC<{ size: number; k?: number }> = ({ size, k = 1 }) => (
  <Img src={staticFile("img/logo.png")} style={{ width: size, height: size, opacity: k, filter: "drop-shadow(0 24px 60px rgba(27,104,252,.6))" }} />
);

export const Thumb: React.FC<{ id: string; size: number; style?: React.CSSProperties }> = ({ id, size, style }) => (
  <Img src={staticFile(`img/${id}.webp`)} style={{ width: size, height: size, objectFit: "contain", ...style }} />
);
