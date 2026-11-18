"use client";
// Scroll-driven 3D hero: one fixed, transparent canvas behind the page text. The Lux3D armchair
// travels between sections along a Catmull-Rom curve through the keyframes in
// src/landing/heroKeyframes.ts, trailing the scroll with inertia, and runs one effect per section.
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { resolveKeyframe, useScrollTimeline } from "@/hooks/useScrollTimeline";
import { HERO_KEYFRAMES, HERO_MODELS, MOTION } from "@/landing/heroKeyframes";
import { activeMaterial, useHero } from "@/landing/heroStore";

const HEIGHT = 1.2;
const DEG = Math.PI / 180;
const FOV = 35;
const CAM_Z = 6;

type Models = { chair: string; parts: string | null; materials: string[]; lamp: string };

/** Center the pivot and scale to HEIGHT; returns a fresh clone with its own materials. */
function normalize(scene: THREE.Object3D) {
  const root = scene.clone(true);
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
      m.castShadow = false;
    }
  });
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const s = HEIGHT / Math.max(1e-6, size.y);
  const wrap = new THREE.Group();
  root.position.sub(center);
  wrap.add(root);
  wrap.scale.setScalar(s);
  return wrap;
}

function meshes(o: THREE.Object3D) {
  const out: THREE.Mesh[] = [];
  o.traverse((x) => (x as THREE.Mesh).isMesh && out.push(x as THREE.Mesh));
  return out;
}

function materialsOf(o: THREE.Object3D) {
  return meshes(o).flatMap((m) => (Array.isArray(m.material) ? m.material : [m.material])) as THREE.MeshStandardMaterial[];
}

function setOpacity(o: THREE.Object3D, a: number) {
  o.visible = a > 0.003;
  for (const m of materialsOf(o)) {
    m.opacity = a;
    m.transparent = a < 0.999;
    m.depthWrite = a > 0.5;
  }
}

// Points sampled from the chair surface; they swirl outward as `uMix` rises and reform as it falls.
const POINT_VERT = /* glsl */ `
  uniform float uMix; uniform float uTime; uniform float uSize;
  attribute float aRand; attribute vec3 aColor;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    vec3 p = position;
    float a = uMix * (2.2 + aRand * 3.0) + uTime * 0.35 * uMix;
    float c = cos(a), s = sin(a);
    p.xz = mat2(c, -s, s, c) * p.xz;
    p.xz *= 1.0 + uMix * (0.25 + aRand * 0.6);
    p.y += sin(uTime * 1.3 + aRand * 6.2831) * 0.07 * uMix + uMix * (aRand - 0.5) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aRand * 0.8) / -mv.z;
    vColor = aColor; vAlpha = uMix;
  }`;
const POINT_FRAG = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.15, d));
  }`;

function SurfacePoints({ source, count, mix }: { source: THREE.Object3D; count: number; mix: React.RefObject<number> }) {
  const { gl } = useThree();
  const geom = useMemo(() => {
    source.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(source.matrixWorld).invert();
    const list = meshes(source);
    const weights = list.map((m) => (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3);
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const palette = [new THREE.Color("#4219fa"), new THREE.Color("#ffc531"), new THREE.Color("#210b7d")];
    const p = new THREE.Vector3();
    let k = 0;
    list.forEach((m, i) => {
      const n = i === list.length - 1 ? count - k : Math.round((weights[i] / total) * count);
      const sampler = new MeshSurfaceSampler(m).build();
      const rel = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
      for (let j = 0; j < n && k < count; j++, k++) {
        sampler.sample(p);
        p.applyMatrix4(rel);
        pos.set([p.x, p.y, p.z], k * 3);
        const c = palette[Math.random() < 0.55 ? 0 : Math.random() < 0.7 ? 1 : 2];
        col.set([c.r, c.g, c.b], k * 3);
        rnd[k] = Math.random();
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
    return g;
  }, [source, count]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: POINT_VERT,
        fragmentShader: POINT_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: { uMix: { value: 0 }, uTime: { value: 0 }, uSize: { value: 26 * Math.min(gl.getPixelRatio(), 1.75) } },
      }),
    [gl],
  );
  const ref = useRef<THREE.Points>(null);
  useFrame((s) => {
    mat.uniforms.uMix.value = mix.current ?? 0;
    mat.uniforms.uTime.value = s.clock.elapsedTime;
    if (ref.current) ref.current.visible = (mix.current ?? 0) > 0.003;
  });
  return <points ref={ref} geometry={geom} material={mat} />;
}

function Dust({ count, opacity }: { count: number; opacity: React.RefObject<number> }) {
  const geom = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) p.set([(Math.random() - 0.5) * 9, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4], i * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);
  const mat = useMemo(() => new THREE.PointsMaterial({ color: "#fff6d8", size: 0.014, transparent: true, depthWrite: false, sizeAttenuation: true }), []);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.015;
    ref.current.position.y = Math.sin(performance.now() / 4000) * 0.08;
    mat.opacity = (opacity.current ?? 0) * 0.55;
    ref.current.visible = mat.opacity > 0.01;
  });
  return <points ref={ref} geometry={geom} material={mat} />;
}

/** Thin outline of a room (floor, two walls, a window) drawn around the chair in the remix section. */
function WireRoom({ opacity }: { opacity: React.RefObject<number> }) {
  const geom = useMemo(() => {
    const y0 = -HEIGHT / 2;
    const h = 2.2;
    const w = 1.6;
    const v = [
      // floor
      [-w, y0, -w], [w, y0, -w], [w, y0, -w], [w, y0, w], [w, y0, w], [-w, y0, w], [-w, y0, w], [-w, y0, -w],
      // back wall
      [-w, y0, -w], [-w, y0 + h, -w], [w, y0, -w], [w, y0 + h, -w], [-w, y0 + h, -w], [w, y0 + h, -w],
      // left wall
      [-w, y0 + h, -w], [-w, y0 + h, w], [-w, y0 + h, w], [-w, y0, w],
      // window on the back wall
      [0.3, y0 + 0.9, -w], [1.1, y0 + 0.9, -w], [1.1, y0 + 0.9, -w], [1.1, y0 + 1.8, -w], [1.1, y0 + 1.8, -w], [0.3, y0 + 1.8, -w], [0.3, y0 + 1.8, -w], [0.3, y0 + 0.9, -w],
      [0.7, y0 + 0.9, -w], [0.7, y0 + 1.8, -w],
    ].flat();
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, []);
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: "#4219fa", transparent: true, depthWrite: false }), []);
  const ref = useRef<THREE.LineSegments>(null);
  useFrame(() => {
    const o = opacity.current ?? 0;
    mat.opacity = o * 0.75;
    if (ref.current) {
      ref.current.visible = o > 0.01;
      ref.current.scale.setScalar(0.9 + o * 0.1);
    }
  });
  return <lineSegments ref={ref} geometry={geom} material={mat} rotation={[0, -0.5, 0]} />;
}

/** Closing scene: floor, two walls and a floor lamp that switches on. */
function RoomCorner({ room, lamp, lampUrl }: { room: React.RefObject<number>; lamp: React.RefObject<number>; lampUrl: string }) {
  const { scene } = useGLTF(lampUrl);
  const lampObj = useMemo(() => {
    const n = normalize(scene);
    n.scale.multiplyScalar(1.45);
    return n;
  }, [scene]);
  const floor = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f6edd3", roughness: 0.9, transparent: true }), []);
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fdf3dc", roughness: 1, transparent: true, side: THREE.DoubleSide }), []);
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const r = room.current ?? 0;
    if (group.current) group.current.visible = r > 0.01;
    floor.opacity = r;
    wall.opacity = r;
    floor.depthWrite = wall.depthWrite = r > 0.5;
    setOpacity(lampObj, r);
    if (light.current) light.current.intensity = (lamp.current ?? 0) * 6;
  });
  const y0 = -HEIGHT / 2;
  return (
    <group ref={group} rotation={[0, -0.6, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y0 - 0.001, 0]} material={floor}>
        <planeGeometry args={[3.4, 3.4]} />
      </mesh>
      <mesh position={[0, y0 + 1.25, -1.7]} material={wall}>
        <planeGeometry args={[3.4, 2.5]} />
      </mesh>
      <mesh position={[-1.7, y0 + 1.25, 0]} rotation={[0, Math.PI / 2, 0]} material={wall}>
        <planeGeometry args={[3.4, 2.5]} />
      </mesh>
      <primitive object={lampObj} position={[-1.05, y0 + 0.87, -1.05]} />
      <pointLight ref={light} position={[-1.05, y0 + 1.55, -0.95]} color="#ffbe6b" distance={4.5} decay={1.6} intensity={0} />
    </group>
  );
}

function Chair({ models, mobile, reduced }: { models: Models; mobile: boolean; reduced: boolean }) {
  const gltfs = useGLTF(models.materials) as unknown as { scene: THREE.Object3D }[];
  const partsGltf = useGLTF(models.parts ?? models.chair) as unknown as { scene: THREE.Object3D };
  const variants = useMemo(() => gltfs.map((g) => normalize(g.scene)), [gltfs]);
  const parts = useMemo(() => {
    if (!models.parts) return null;
    const n = normalize(partsGltf.scene);
    const list = meshes(n);
    n.updateMatrixWorld(true);
    const info = list.map((m) => {
      const c = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
      const dir = c.lengthSq() > 1e-6 ? c.clone().normalize() : new THREE.Vector3(0, 1, 0);
      return { mesh: m, base: m.position.clone(), baseRot: m.rotation.clone(), dir, spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5) };
    });
    return { root: n, info };
  }, [partsGltf, models.parts]);

  const { camera, size } = useThree();
  const { update } = useScrollTimeline(mobile);
  const travel = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const mix = useRef(0);
  const dust = useRef(1);
  const wire = useRef(0);
  const room = useRef(0);
  const lamp = useRef(0);
  const shadow = useRef(1);
  const explode = useRef({ x: 0, v: 0 });
  const mat = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const reducedFade = useRef({ index: -1, t: 1 });
  const target = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    useHero.setState({ available: variants.length, ready: true });
    document.documentElement.dataset.hero = "ready";
    if (mobile) return;
    const onMove = (e: PointerEvent) => (pointer.current = { x: (e.clientX / innerWidth) * 2 - 1, y: -(e.clientY / innerHeight) * 2 + 1 });
    addEventListener("pointermove", onMove);
    return () => removeEventListener("pointermove", onMove);
  }, [variants.length, mobile]);

  // the styles section steps the material with scroll; chips can override it
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: "#styles",
      start: "top center",
      end: "bottom center",
      onUpdate: (self) => useHero.getState().setScrollMaterial(Math.min(3, Math.floor(self.progress * 4))),
    });
    return () => st.kill();
  }, []);

  useFrame((state, dt) => {
    if (!travel.current || !body.current) return;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(1 - MOTION.inertia, Math.min(dt, 0.1) * 60);
    let pose = update();

    // keyframes → world: a Catmull-Rom curve through every section's position
    const cam = camera as THREE.PerspectiveCamera;
    const halfH = Math.tan((cam.fov * DEG) / 2) * CAM_Z;
    const halfW = halfH * (size.width / size.height);
    const pts = HERO_KEYFRAMES.map((kf) => {
      const r = resolveKeyframe(kf, mobile);
      return new THREE.Vector3(r.x * halfW, r.y * halfH, r.z);
    });

    if (reduced) {
      // no inertia or particles: hold the nearest section's pose, fading between poses
      const i = Math.round(pose.segment);
      const kf = resolveKeyframe(HERO_KEYFRAMES[i], mobile);
      pose = { ...kf, segment: i, particles: 0 };
      if (reducedFade.current.index !== i) reducedFade.current = { index: i, t: 0 };
      reducedFade.current.t = Math.min(1, reducedFade.current.t + dt * 2.5);
      travel.current.position.copy(pts[i]);
    } else {
      const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
      curve.getPoint(Math.min(1, pose.segment / (pts.length - 1)), target);
      travel.current.position.lerp(target, k);
    }

    const s = THREE.MathUtils.lerp(travel.current.scale.x, pose.scale, reduced ? 1 : k);
    travel.current.scale.setScalar(s);

    // alive: floating, yaw drift, banking into the direction of travel, cursor parallax
    const float = reduced ? 0 : Math.sin(t * MOTION.floatSpeed) * MOTION.floatAmp;
    const drift = reduced ? 0 : Math.sin(t * 0.3) * MOTION.yawDrift * DEG;
    const vx = reduced ? 0 : target.x - travel.current.position.x;
    const bank = THREE.MathUtils.clamp(-vx * 0.35, -MOTION.bank * DEG, MOTION.bank * DEG);
    const px = mobile || reduced ? 0 : pointer.current.x * MOTION.parallax * DEG;
    const py = mobile || reduced ? 0 : pointer.current.y * MOTION.parallax * DEG;
    body.current.position.y = float;
    const kr = reduced ? 1 : k;
    body.current.rotation.y = THREE.MathUtils.lerp(body.current.rotation.y, pose.rotY * DEG + drift + px, kr);
    body.current.rotation.x = THREE.MathUtils.lerp(body.current.rotation.x, pose.rotX * DEG - py, kr);
    body.current.rotation.z = THREE.MathUtils.lerp(body.current.rotation.z, bank, kr);

    // section effects
    mix.current = reduced ? 0 : pose.particles;
    dust.current = reduced ? 0 : Math.max(0, 1 - pose.segment);
    wire.current = pose.wire;
    room.current = pose.room;
    shadow.current = (1 - mix.current) * THREE.MathUtils.smoothstep(pose.scale, 0.45, 0.8) * (reduced ? reducedFade.current.t : 1);
    lamp.current = THREE.MathUtils.lerp(lamp.current, pose.lamp > 0.85 ? 1 : 0, 0.06);

    // explode with a springy return (under-damped spring toward the scroll value)
    const ex = explode.current;
    if (reduced) ex.x = pose.explode;
    else {
      ex.v += (pose.explode - ex.x) * 90 * Math.min(dt, 0.05);
      ex.v *= Math.pow(0.0009, Math.min(dt, 0.05));
      ex.x += ex.v * Math.min(dt, 0.05);
    }

    // material crossfade (scroll in the styles section, or a chip)
    const inStyles = Math.abs(pose.segment - HERO_KEYFRAMES.findIndex((f) => f.section === "styles")) < 0.6;
    const want = inStyles ? activeMaterial() : 0;
    mat.current = THREE.MathUtils.lerp(mat.current, want, 0.08);

    const fade = reduced ? reducedFade.current.t : 1;
    const showParts = parts && ex.x > 0.015;
    const solid = (1 - mix.current) * fade;
    variants.forEach((v, i) => setOpacity(v, showParts ? 0 : Math.max(0, 1 - Math.abs(mat.current - i)) * solid));
    if (parts) {
      setOpacity(parts.root, showParts ? solid : 0);
      for (const p of parts.info) {
        p.mesh.position.copy(p.base).addScaledVector(p.dir, (ex.x * 0.6) / parts.root.scale.x);
        p.mesh.rotation.set(p.baseRot.x + p.spin.x * ex.x * 0.5, p.baseRot.y + p.spin.y * ex.x * 0.5, p.baseRot.z + p.spin.z * ex.x * 0.5);
      }
    }
  });

  return (
    <>
      <Dust count={mobile ? 150 : MOTION.dust} opacity={dust} />
      <group ref={travel} position={[2, 0, 0]}>
        <group ref={body}>
          {variants.map((v, i) => (
            <primitive key={i} object={v} />
          ))}
          {parts && <primitive object={parts.root} />}
          <SurfacePoints source={variants[0]} count={mobile ? MOTION.particlesMobile : MOTION.particles} mix={mix} />
        </group>
        <WireRoom opacity={wire} />
        <RoomCorner room={room} lamp={lamp} lampUrl={models.lamp} />
        <BlobShadow opacity={shadow} />
      </group>
    </>
  );
}

/** Soft blob shadow under the chair (cheap, and no artifacts on a transparent canvas). */
function BlobShadow({ opacity }: { opacity: React.RefObject<number> }) {
  const mat = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(33,11,125,0.55)");
    grad.addColorStop(0.55, "rgba(33,11,125,0.18)");
    grad.addColorStop(1, "rgba(33,11,125,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
  }, []);
  useFrame(() => (mat.opacity = opacity.current ?? 0));
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -HEIGHT / 2 - 0.005, 0]} material={mat}>
      <planeGeometry args={[1.5, 1.1]} />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[-5, 7, 5]} angle={0.45} penumbra={0.9} intensity={90} color="#fff3dc" />
      <directionalLight position={[4, 3, 2]} intensity={0.6} color="#dcd6ff" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, -4]} scale={[10, 4, 1]} color="#fff4dc" />
        <Lightformer form="rect" intensity={1.2} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={1.4} position={[5, 2, 3]} scale={2} color="#d9d2ff" />
      </Environment>
    </>
  );
}

/** Pauses rendering while the tab is hidden. */
function PauseWhenHidden() {
  const { setFrameloop } = useThree();
  useEffect(() => {
    const on = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, [setFrameloop]);
  return null;
}

async function available(url: string) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}

export default function ScrollHero() {
  const [models, setModels] = useState<Models | null>(null);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setMobile(matchMedia("(max-width: 767px)").matches);
    setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches);
    // fall back to the library armchair until the site assets have been generated
    (async () => {
      const chairOk = await available(HERO_MODELS.chair);
      const chair = chairOk ? HERO_MODELS.chair : "/library/L_ARMCHAIR.glb";
      const extra = chairOk ? await Promise.all(HERO_MODELS.materials.slice(1).map(available)) : [];
      const parts = (await available(HERO_MODELS.parts)) ? HERO_MODELS.parts : null;
      setModels({ chair, parts, materials: [chair, ...HERO_MODELS.materials.slice(1).filter((_, i) => extra[i])], lamp: HERO_MODELS.lamp });
    })();
  }, []);

  useEffect(() => () => ScrollTrigger.getAll().forEach((s) => s.kill()), []);
  useEffect(() => void gsap.ticker.lagSmoothing(0), []);

  if (!models) return null;
  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.75]}
      camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance", toneMappingExposure: 1.35 }}
      style={{ position: "fixed", inset: 0, zIndex: 5, pointerEvents: "none" }}
    >
      <PauseWhenHidden />
      <Lights />
      <Suspense fallback={null}>
        <Chair models={models} mobile={mobile} reduced={reduced} />
      </Suspense>
      {!mobile && !reduced && (
        <EffectComposer multisampling={4}>
          <Bloom luminanceThreshold={0.92} luminanceSmoothing={0.1} intensity={0.35} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
