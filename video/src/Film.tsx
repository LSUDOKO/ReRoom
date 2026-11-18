import React from "react";
import { AbsoluteFill, Audio, Composition, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import take from "./take.json";
import { C, FPS, code, display } from "./theme";
import { Field, Glass, INOUT, Label, Logo, OUT, Rise, Thumb, p } from "./lib";

// ── timeline (frames @ 30 fps) ───────────────────────────────────────────────
const HOOK = 0, PROBLEM = 330, REVEAL = 1110, ENTER = 1530, TAKE = 1740, TAKE_LEN = 2820, IMPACT = TAKE + TAKE_LEN, OUTRO = IMPACT + 570, TOTAL = OUTRO + 330;

// ── 1. hook ─────────────────────────────────────────────────────────────────
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const room = p(f, 150, 120, INOUT);
  return (
    <Field glow={0.5 + room * 0.5}>
      <AbsoluteFill style={{ opacity: 0.16 + room * 0.25, transform: `scale(${1.25 - room * 0.15})` }}>
        <Img src={staticFile("img/pano.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.1)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,7,18,.55), rgba(5,7,18,.9))" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <Rise at={10} size={72} weight={300} color={C.mist} out={140}>Every empty room</Rise>
        <div style={{ marginTop: -18 }}><Rise at={36} size={72} weight={300} color={C.mist} out={140}>asks one question.</Rise></div>
        <div style={{ position: "absolute" }}>
          <Rise at={160} size={210} weight={800} chrome dur={22}>Will it fit?</Rise>
        </div>
      </AbsoluteFill>
    </Field>
  );
};

// ── 2. problem ──────────────────────────────────────────────────────────────
const Tape: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "relative", width: 1300, height: 90, marginTop: 50 }}>
    <div style={{ position: "absolute", left: 0, top: 0, height: 90, width: 1300 * k, background: "linear-gradient(180deg,#f5d33a,#e1b51c)", borderRadius: 6, overflow: "hidden", boxShadow: "0 20px 40px -20px rgba(0,0,0,.8)" }}>
      {Array.from({ length: 66 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: i * 20, top: 0, width: 2, height: i % 5 === 0 ? 46 : 24, background: "#1d1a10" }}>
          {i % 5 === 0 && <div style={{ position: "absolute", top: 50, left: -10, fontFamily: code, fontSize: 18, color: "#1d1a10" }}>{i * 4}</div>}
        </div>
      ))}
    </div>
  </div>
);
const Problem: React.FC = () => {
  const f = useCurrentFrame();
  const a = 0, b = 250, c = 500;
  const tape = p(f, a + 30, 110, INOUT);
  const qs = [["L_SOFA_3", 330, 380], ["L_ARMCHAIR", 1250, 420], ["L_WARDROBE", 760, 300]] as const;
  const stamp = p(f, c + 70, 10);
  const shake = f > c + 70 && f < c + 82 ? Math.sin(f * 2.6) * (c + 82 - f) : 0;
  return (
    <Field glow={0.6}>
      {/* beat 1: we measure */}
      <Sequence from={a} durationInFrames={b - a} layout="none">
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 160 }}>
          <Label k={p(f, a + 4, 12)}>01 · Today</Label>
          <Rise at={a + 8} size={120} out={b - 16}>So we measure.</Rise>
          <div style={{ opacity: 1 - p(f, b - 16, 12) }}><Tape k={tape} /></div>
          <div style={{ marginTop: 40, fontFamily: code, fontSize: 30, color: C.mist, opacity: p(f, a + 120, 20) * (1 - p(f, b - 16, 12)) }}>alcove 212 cm · sofa 228 cm · door 81 cm</div>
        </AbsoluteFill>
      </Sequence>
      {/* beat 2: we guess */}
      <Sequence from={b} durationInFrames={c - b} layout="none">
        <AbsoluteFill>
          <Img src={staticFile("img/pano.jpg")} style={{ position: "absolute", left: 160, top: 300, width: 1600, height: 560, objectFit: "cover", borderRadius: 28, opacity: 0.85 * p(f, b, 20), filter: "saturate(.7)" }} />
          {qs.map(([id, x, y], i) => {
            const k = p(f, b + 30 + i * 16, 22);
            const wob = Math.sin((f + i * 40) / 14) * 10;
            return (
              <div key={id} style={{ position: "absolute", left: x - 140, top: y + wob, width: 280, height: 280, opacity: 0.85 * k, transform: `scale(${0.6 + 0.4 * k})` }}>
                <Thumb id={id} size={280} style={{ filter: "drop-shadow(0 30px 40px rgba(0,0,0,.6))" }} />
                <div style={{ position: "absolute", right: 10, top: 0, width: 70, height: 70, borderRadius: 99, background: C.blue, color: "#fff", fontFamily: display, fontWeight: 800, fontSize: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 160, top: 110 }}>
            <Label k={p(f, b + 4, 12)}>02 · On a screen</Label>
            <Rise at={b + 8} size={110} out={c - 16}>We guess.</Rise>
          </div>
        </AbsoluteFill>
      </Sequence>
      {/* beat 3: it arrives */}
      <Sequence from={c} durationInFrames={780 - c} layout="none">
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `translateX(${shake}px)` }}>
          <div style={{ position: "relative" }}>
            <Thumb id="L_SOFA_3" size={620} style={{ opacity: p(f, c, 18), filter: `grayscale(${stamp}) brightness(${1 - stamp * 0.4})` }} />
            <div style={{ position: "absolute", left: 60, top: 230, padding: "16px 36px", border: `8px solid ${C.danger}`, borderRadius: 14, color: C.danger, fontFamily: display, fontWeight: 800, fontSize: 92, letterSpacing: "0.04em",
              transform: `rotate(-8deg) scale(${1.8 - 0.8 * stamp})`, opacity: stamp, background: "rgba(5,7,18,.85)" }}>DOESN’T FIT</div>
          </div>
          <div style={{ position: "absolute", bottom: 130, textAlign: "center" }}>
            <Rise at={c + 110} size={64} weight={500}>And we find out when it arrives.</Rise>
            <Rise at={c + 170} size={40} weight={300} color={C.mist}>A photo can’t show scale. Your room can.</Rise>
          </div>
        </AbsoluteFill>
      </Sequence>
    </Field>
  );
};

// ── 3. reveal ───────────────────────────────────────────────────────────────
const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const k = p(f, 6, 40);
  const ring = p(f, 0, 50, OUT);
  return (
    <Field glow={0.4 + k * 0.8}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "absolute", width: 900 * ring, height: 900 * ring, borderRadius: 999, border: `2px solid rgba(174,180,255,${0.5 * (1 - ring)})` }} />
        <div style={{ transform: `scale(${0.7 + 0.3 * k}) translateY(${(1 - k) * 30}px)`, marginTop: -160 }}><Logo size={190} k={k} /></div>
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <Rise at={34} size={150} weight={800} chrome>ReRoom MR</Rise>
          <Rise at={64} size={58} weight={300} color={C.paper}>Furnish your real room with your hands.</Rise>
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 46 }}>
          {["Meta Quest", "Hands only", "Seated"].map((t, i) => (
            <div key={t} style={{ opacity: p(f, 110 + i * 10, 14), transform: `translateY(${(1 - p(f, 110 + i * 10, 20)) * 20}px)` }}><Glass blue={i === 0}>{t}</Glass></div>
          ))}
        </div>
      </AbsoluteFill>
    </Field>
  );
};

// ── 4a. entering: the cursor taps Enter VR ───────────────────────────────────
const BTN = { x: 1003 + 56, y: 697 + 25 }; // Enter VR on the /xr page at 1920×1080
const Cursor: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-6px,-4px) scale(${1 - press * 0.18})`, transformOrigin: "6px 4px", filter: "drop-shadow(0 10px 18px rgba(0,0,0,.55))" }}>
    <svg width="46" height="56" viewBox="0 0 23 28"><path d="M1 1 L1 21 L6.5 16 L10.5 26 L14 24.5 L10 15 L18 15 Z" fill="#fff" stroke="#050712" strokeWidth="1.6" strokeLinejoin="round" /></svg>
  </div>
);
const Enter: React.FC = () => {
  const f = useCurrentFrame();
  const move = p(f, 24, 46, INOUT);
  const cx = interpolate(move, [0, 1], [1500, BTN.x]), cy = interpolate(move, [0, 1], [980, BTN.y]) - Math.sin(move * Math.PI) * 90;
  const click = 84;
  const press = f >= click && f < click + 8 ? Math.sin(((f - click) / 8) * Math.PI) : 0;
  const ripple = p(f, click, 26);
  const zoom = 1 + p(f, 0, 90, INOUT) * 0.22 + p(f, click + 20, 70, INOUT) * 2.6;
  const ox = (BTN.x / 1920) * 100, oy = (BTN.y / 1080) * 100;
  const flash = p(f, click + 50, 30) * (1 - p(f, click + 100, 20));
  return (
    <Field>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${ox}% ${oy}%` }}>
        <Img src={staticFile("img/xr-page.png")} style={{ width: 1920, height: 1080 }} />
        <div style={{ position: "absolute", left: BTN.x - 90, top: BTN.y - 90, width: 180, height: 180, borderRadius: 999, border: `3px solid rgba(174,180,255,${1 - ripple})`, transform: `scale(${0.3 + ripple})` }} />
        <div style={{ position: "absolute", left: BTN.x - 70, top: BTN.y - 34, width: 140, height: 68, borderRadius: 99, boxShadow: `0 0 ${60 * press}px rgba(27,104,252,${press})` }} />
        <Cursor x={cx} y={cy} press={press} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.9 }} />
      <div style={{ position: "absolute", left: 90, bottom: 80, opacity: p(f, 10, 14) * (1 - p(f, click + 10, 10)) }}>
        <Label>Quest Browser · one tap · no install</Label>
      </div>
    </Field>
  );
};

// ── 4b. the take: the room being furnished, with step callouts ───────────────
type Step = { n: string; title: string; sub: string; from: number; to: number };
const RATE = (take.end - take.start) / (TAKE_LEN / FPS);
const tf = (sec: number) => Math.round(((sec - take.start) / RATE) * FPS);
const STEPS: Step[] = take.steps.map((s, i) => ({ ...s, n: String(i + 1).padStart(2, "0"), from: tf(s.t), to: i + 1 < take.steps.length ? tf(take.steps[i + 1].t) : TAKE_LEN }));
const Callout: React.FC<{ s: Step }> = ({ s }) => {
  const f = useCurrentFrame();
  const k = p(f, s.from, 18), o = p(f, s.to - 12, 12, INOUT);
  if (f < s.from - 2 || f > s.to + 2) return null;
  return (
    <div style={{ position: "absolute", left: 70, top: 300, width: 560, transform: `translateX(${(1 - k) * -60 - o * 40}px)`, opacity: k * (1 - o) }}>
      <div style={{ padding: "30px 36px", borderRadius: 28, background: "rgba(5,7,18,.78)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 0 1px rgba(255,255,255,.08), 0 30px 60px -20px rgba(0,0,0,.7)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: code, fontSize: 22, color: "#fff", background: C.blue, borderRadius: 99, padding: "6px 14px" }}>{s.n}</div>
          <Label color={C.soft} style={{ fontSize: 20 }}>Pinch</Label>
        </div>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: 50, color: C.paper, marginTop: 16, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{s.title}</div>
        <div style={{ fontFamily: display, fontWeight: 300, fontSize: 28, color: C.mist, marginTop: 12, lineHeight: 1.3 }}>{s.sub}</div>
      </div>
    </div>
  );
};
const Take: React.FC = () => {
  const f = useCurrentFrame();
  const inK = p(f, 0, 30);
  // a slow push-in that breathes across the whole take, cropping the simulator panels at the edges
  const zoom = 1.16 + Math.sin(f / 240) * 0.025;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ transform: `scale(${zoom * (1.06 - 0.06 * inK)})`, transformOrigin: "52% 46%" }}>
        <OffthreadVideo src={staticFile("take.mp4")} startFrom={Math.round(take.start * FPS)} playbackRate={RATE} muted style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 50%, transparent 55%, rgba(5,7,18,.75) 100%)" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: 0.9 * (1 - p(f, 0, 24)) }} />
      {STEPS.map((s) => <Callout key={s.n} s={s} />)}
      <div style={{ position: "absolute", right: 60, top: 50, display: "flex", alignItems: "center", gap: 12, opacity: p(f, 30, 20) }}>
        <div style={{ width: 14, height: 14, borderRadius: 99, background: C.danger, opacity: 0.5 + 0.5 * Math.sin(f / 6) }} />
        <Label color={C.paper} style={{ fontSize: 20 }}>Meta Quest 3 · hand tracking · Aholo room</Label>
      </div>
    </AbsoluteFill>
  );
};

// ── 5. impact ───────────────────────────────────────────────────────────────
const TILES = [
  ["Hands only", "Every action is one pinch. No controllers, nothing to learn."],
  ["Made for sitting", "The tray rests at your lap. Furniture lands 2 m ahead. Never stand up."],
  ["One tap to start", "A link in the Quest Browser. No install, no account, no wait."],
  ["Real size, real joints", "True dimensions. Doors swing, drawers slide, styles swap in one pinch."],
];
const Impact: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Field>
      <div style={{ position: "absolute", left: 150, top: 120 }}>
        <Label k={p(f, 4, 12)}>Why it matters</Label>
        <Rise at={10} size={96}>See it in your room</Rise>
        <div style={{ marginTop: -10 }}><Rise at={26} size={96} chrome>before it’s in your room.</Rise></div>
      </div>
      <div style={{ position: "absolute", left: 150, right: 150, top: 520, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
        {TILES.map(([h, s], i) => {
          const k = p(f, 70 + i * 16, 26);
          return (
            <div key={h} style={{ padding: "40px 34px", minHeight: 300, borderRadius: 30, background: i === 0 ? "linear-gradient(180deg,rgba(27,104,252,.35),rgba(27,104,252,.12))" : "rgba(255,255,255,.05)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 0 1px rgba(255,255,255,.08)", opacity: k, transform: `translateY(${(1 - k) * 50}px)` }}>
              <div style={{ fontFamily: code, fontSize: 22, color: C.soft }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: 42, color: C.paper, marginTop: 26, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{h}</div>
              <div style={{ fontFamily: display, fontWeight: 300, fontSize: 26, color: C.mist, marginTop: 18, lineHeight: 1.35 }}>{s}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 150, bottom: 90, display: "flex", gap: 60, opacity: p(f, 200, 30) }}>
        {[["8", "real-size pieces"], ["4", "room styles"], ["2", "pieces that open"], ["0", "controllers"]].map(([n, t]) => (
          <div key={t} style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontFamily: display, fontWeight: 800, fontSize: 64, color: C.paper }}>{n}</span>
            <span style={{ fontFamily: code, fontSize: 22, color: C.mist, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t}</span>
          </div>
        ))}
      </div>
    </Field>
  );
};

// ── 6. outro ────────────────────────────────────────────────────────────────
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const k = p(f, 0, 40);
  return (
    <Field glow={0.5 + 0.7 * k}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ marginTop: -80, transform: `scale(${0.8 + 0.2 * k})` }}><Logo size={150} k={k} /></div>
        <Rise at={20} size={130} weight={800} chrome style={{ marginTop: 26 }}>ReRoom MR</Rise>
        <Rise at={44} size={50} weight={300}>Your room. Your hands. Real furniture.</Rise>
        <div style={{ marginTop: 50, opacity: p(f, 90, 20) }}><Glass blue>reroom-mr.adoranto737.workers.dev/xr</Glass></div>
        <div style={{ marginTop: 40, display: "flex", gap: 30, alignItems: "center", opacity: p(f, 130, 20) }}>
          <Label color={C.mist} style={{ fontSize: 20 }}>Built for Meta Quest</Label>
          <span style={{ color: C.line }}>·</span>
          <Label color={C.mist} style={{ fontSize: 20 }}>3D by Aholo</Label>
          <span style={{ color: C.line }}>·</span>
          <Label color={C.mist} style={{ fontSize: 20 }}>WebXR</Label>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.ink, opacity: p(f, 290, 40) }} />
    </Field>
  );
};

// ── assembly ───────────────────────────────────────────────────────────────
const CUTS = [PROBLEM, REVEAL, ENTER, TAKE, IMPACT, OUTRO];
const Film: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <Sequence from={HOOK} durationInFrames={PROBLEM - HOOK}><Hook /></Sequence>
    <Sequence from={PROBLEM} durationInFrames={REVEAL - PROBLEM}><Problem /></Sequence>
    <Sequence from={REVEAL} durationInFrames={ENTER - REVEAL}><Reveal /></Sequence>
    <Sequence from={ENTER} durationInFrames={TAKE - ENTER}><Enter /></Sequence>
    <Sequence from={TAKE} durationInFrames={TAKE_LEN}><Take /></Sequence>
    <Sequence from={IMPACT} durationInFrames={OUTRO - IMPACT}><Impact /></Sequence>
    <Sequence from={OUTRO} durationInFrames={TOTAL - OUTRO}><Outro /></Sequence>
    {CUTS.map((c) => <Sequence key={c} from={c - 8} durationInFrames={20} layout="none"><Audio src={staticFile(c === REVEAL || c === OUTRO ? "audio/sfx_lift.wav" : "audio/sfx_whoosh.wav")} volume={0.35} /></Sequence>)}
    <Sequence from={PROBLEM + 570} durationInFrames={30} layout="none"><Audio src={staticFile("audio/sfx_impact.wav")} volume={0.5} /></Sequence>
    <Sequence from={ENTER + 84} durationInFrames={10} layout="none"><Audio src={staticFile("audio/sfx_click.wav")} volume={0.7} /></Sequence>
    <Audio src={staticFile("audio/music.mp3")} volume={(f) => interpolate(f, [0, 30, TOTAL - 60, TOTAL], [0, 0.85, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
  </AbsoluteFill>
);
export const FilmComposition: React.FC = () => <Composition id="ReRoomMR" component={Film} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />;
