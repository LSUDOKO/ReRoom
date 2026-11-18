import React from "react";
import { AbsoluteFill, Audio, Composition, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import take from "./take.json";
import { C, FPS, code, display } from "./theme";
import { Field, Glass, INOUT, Label, Logo, Rise, Thumb, p } from "./lib";

// The VR recording plays sped up (a time-lapse of the hands furnishing each room).
const SPEED = 2.2;
type Room = { name: string; line: string; img: string; start: number; end: number; steps: { t: number; title: string }[] };
const ROOMS = take.rooms as Room[];
const roomLen = (r: Room) => Math.round(((r.end - r.start) / SPEED) * FPS);

const HOOK = 0, REVEAL = 240, TOUR = 570;
const TITLE = 75; // chapter card before each room
const TOUR_LEN = ROOMS.reduce((n, r) => n + TITLE + roomLen(r), 0);
const OUTRO = TOUR + TOUR_LEN, TOTAL = OUTRO + 360;

// ── hook ──
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const z = 1.25 - p(f, 0, 240, INOUT) * 0.15;
  return (
    <Field glow={0.6}>
      <AbsoluteFill style={{ opacity: 0.35, transform: `scale(${z})` }}>
        <Img src={staticFile("img/bedroom.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(.6)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,7,18,.5), rgba(5,7,18,.92))" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <Rise at={10} size={84} weight={300} color={C.mist}>Every room starts empty.</Rise>
        <Rise at={90} size={120} weight={800} chrome>What if you could step inside it?</Rise>
      </AbsoluteFill>
    </Field>
  );
};

// ── reveal ──
const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const k = p(f, 6, 40);
  return (
    <Field glow={0.4 + k * 0.8}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${0.7 + 0.3 * k})`, marginTop: -120 }}><Logo size={180} k={k} /></div>
        <div style={{ marginTop: 36, textAlign: "center" }}>
          <Rise at={30} size={150} weight={800} chrome>ReRoom in VR</Rise>
          <Rise at={60} size={56} weight={300}>Step inside the room. Furnish it with your hands.</Rise>
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 44 }}>
          {["Three Aholo rooms", "Hands only", "Real-size furniture"].map((t, i) => (
            <div key={t} style={{ opacity: p(f, 110 + i * 10, 14), transform: `translateY(${(1 - p(f, 110 + i * 10, 20)) * 20}px)` }}><Glass blue={i === 0}>{t}</Glass></div>
          ))}
        </div>
      </AbsoluteFill>
    </Field>
  );
};

// ── one room: a chapter card, then the time-lapse with step captions ──
const Chapter: React.FC<{ r: Room; i: number }> = ({ r, i }) => {
  const f = useCurrentFrame();
  const out = p(f, TITLE - 14, 14, INOUT);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Img src={staticFile(`img/${r.img}`)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.15 - p(f, 0, TITLE) * 0.08})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(5,7,18,.92) 0%, rgba(5,7,18,.55) 55%, rgba(5,7,18,.2) 100%)" }} />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 140 }}>
        <Label k={p(f, 4, 10)}>{`Room ${String(i + 1).padStart(2, "0")} · generated with Aholo World`}</Label>
        <Rise at={6} size={130} weight={800}>{r.name}</Rise>
        <Rise at={18} size={46} weight={300} color={C.paper}>{r.line}</Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const Tour: React.FC<{ r: Room }> = ({ r }) => {
  const f = useCurrentFrame();
  const len = roomLen(r);
  const at = (t: number) => Math.round(((t - r.start) / SPEED) * FPS);
  const steps = r.steps.map((s, i) => ({ ...s, from: at(s.t), to: i + 1 < r.steps.length ? at(r.steps[i + 1].t) : len }));
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ transform: `scale(${1.08 + Math.sin(f / 200) * 0.015})` }}>
        <OffthreadVideo src={staticFile("take.mp4")} startFrom={Math.round(r.start * FPS)} playbackRate={SPEED} muted style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 45%, transparent 60%, rgba(5,7,18,.7) 100%)" }} />
      {steps.map((s, i) => {
        const k = p(f, s.from, 14), o = p(f, s.to - 10, 10, INOUT);
        if (f < s.from - 2 || f > s.to + 2) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 70, top: 90, transform: `translateX(${(1 - k) * -50}px)`, opacity: k * (1 - o) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 30px", borderRadius: 24, background: "rgba(5,7,18,.78)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 0 1px rgba(255,255,255,.08)" }}>
              <div style={{ fontFamily: code, fontSize: 22, color: "#fff", background: C.blue, borderRadius: 99, padding: "6px 14px" }}>Pinch</div>
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: 44, color: C.paper, letterSpacing: "-0.03em" }}>{s.title}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", right: 60, top: 50, display: "flex", alignItems: "center", gap: 12 }}>
        <Label color={C.paper} style={{ fontSize: 20 }}>{`${r.name} · ${SPEED}× time-lapse`}</Label>
      </div>
    </AbsoluteFill>
  );
};

// ── outro ──
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const k = p(f, 0, 40);
  return (
    <Field glow={0.5 + 0.7 * k}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 110, display: "flex", justifyContent: "center", gap: 24, opacity: p(f, 10, 30) }}>
        {["L_SOFA_3", "L_ARMCHAIR", "L_WARDROBE", "L_DRAWERS", "L_FLOOR_LAMP", "L_PLANT_BIG"].map((id, i) => (
          <div key={id} style={{ transform: `translateY(${(1 - p(f, 10 + i * 6, 24)) * 40}px)` }}><Thumb id={id} size={150} /></div>
        ))}
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", paddingTop: 180 }}>
        <Rise at={30} size={120} weight={800} chrome>ReRoom</Rise>
        <Rise at={50} size={48} weight={300}>Scan it. Remix it. Live in it. Now step inside it.</Rise>
        <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 18, opacity: p(f, 100, 20) }}>
          <Label color={C.mist} style={{ fontSize: 22 }}>Every room and every object generated with</Label>
          <Img src={staticFile("img/aholo.svg")} style={{ height: 34 }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.ink, opacity: p(f, 320, 40) }} />
    </Field>
  );
};

const Film: React.FC = () => {
  let at = TOUR;
  const chapters = ROOMS.map((r, i) => {
    const start = at;
    at += TITLE + roomLen(r);
    return (
      <React.Fragment key={r.name}>
        <Sequence from={start} durationInFrames={TITLE}><Chapter r={r} i={i} /></Sequence>
        <Sequence from={start + TITLE} durationInFrames={roomLen(r)}><Tour r={r} /></Sequence>
        <Sequence from={start - 8} durationInFrames={20} layout="none"><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.35} /></Sequence>
      </React.Fragment>
    );
  });
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Sequence from={HOOK} durationInFrames={REVEAL}><Hook /></Sequence>
      <Sequence from={REVEAL} durationInFrames={TOUR - REVEAL}><Reveal /></Sequence>
      {chapters}
      <Sequence from={OUTRO} durationInFrames={TOTAL - OUTRO}><Outro /></Sequence>
      <Sequence from={REVEAL - 8} durationInFrames={20} layout="none"><Audio src={staticFile("audio/sfx_lift.wav")} volume={0.4} /></Sequence>
      <Sequence from={OUTRO - 8} durationInFrames={20} layout="none"><Audio src={staticFile("audio/sfx_lift.wav")} volume={0.4} /></Sequence>
      <Audio src={staticFile("audio/music.mp3")} volume={(fr) => interpolate(fr, [0, 30, TOTAL - 75, TOTAL], [0, 0.85, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
export const FilmComposition: React.FC = () => <Composition id="ReRoomVR" component={Film} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />;
