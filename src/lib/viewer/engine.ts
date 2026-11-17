// The only module that touches @manycore/aholo-viewer. Browser-only.
// World convention: meters, Y-up, floor at y = 0, furniture pivot bottom-center.
import {
  AmbientLight,
  Animation,
  BackgroundMode,
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  GLTFLoader,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Plane,
  Quaternion,
  Ray,
  Scene3D,
  SplatLoader,
  SplatUtils,
  ToneMapping,
  Vector3,
  createViewer,
  downloadTexture,
  setViewerConfig,
  type Viewer,
} from "@manycore/aholo-viewer";
import { CameraControl } from "./camera-control";

export type Calibration = {
  /** Which axis of the source splat points up. */
  up: "+y" | "-y" | "+z" | "-z";
  scale: number;
  yaw: number; // radians
  offset: [number, number, number]; // meters, applied after rotate/scale
};

export const DEFAULT_CALIBRATION: Calibration = { up: "-y", scale: 1, yaw: 0, offset: [0, 0, 0] };

/** A movable part from a Lux3D articulation URDF. */
export type Joint = {
  node: Object3D;
  type: "revolute" | "prismatic";
  axis: Vector3;
  lower: number;
  upper: number;
  origin: Vector3;
};

export type LoadedModel = {
  root: Object3D; // pivot node we transform (position / yaw / scale)
  model: Object3D; // normalized glb scene inside root
  size: { w: number; d: number; h: number }; // natural size after normalization (m)
  mixer?: InstanceType<typeof Animation.AnimationMixer>;
  actions: InstanceType<typeof Animation.AnimationAction>[];
  joints: Joint[];
  openness: number; // 0 closed .. 1 open
};

/** Resolve a URDF-relative mesh path ("meshes/door.glb") to a fetchable URL. */
export type UrdfResolver = (path: string) => string;

type Frame = (dt: number) => boolean | void;

const fileType = (url: string) => {
  const u = url.split("?")[0].toLowerCase();
  if (u.endsWith(".spz")) return SplatLoader.SplatFileType.SPZ;
  if (u.endsWith(".sog")) return SplatLoader.SplatFileType.SOG;
  if (u.endsWith(".splat")) return SplatLoader.SplatFileType.SPLAT;
  if (u.endsWith(".ksplat")) return SplatLoader.SplatFileType.KSPLAT;
  return SplatLoader.SplatFileType.PLY;
};

export class Engine {
  readonly viewer: Viewer;
  readonly scene: Scene3D;
  readonly camera: PerspectiveCamera;
  readonly control: CameraControl;
  readonly roomRoot = new Object3D(); // calibrated container for the splat
  readonly itemsRoot = new Object3D();
  readonly helpers = new Object3D();
  private splat?: Object3D;
  readonly ambient = new AmbientLight(0xffffff, 0.9);
  readonly sun = new DirectionalLight(0xffffff, 1.4);
  private anim = new Animation.AnimationPlugin();
  private frames = new Set<Frame>();
  private raf = 0;
  private last = 0;
  private dirty = true;
  private ro: ResizeObserver;
  private disposed = false;

  constructor(readonly container: HTMLElement) {
    this.viewer = createViewer(`reroom-${Math.random().toString(36).slice(2)}`, container, {
      antialiasing: true,
      preserveDrawingBuffer: true, // needed for snapshots / before-after
    });
    setViewerConfig(this.viewer, {
      pixelRatio: Math.min(window.devicePixelRatio, 2) / window.devicePixelRatio,
      pipeline: {
        Background: {
          background: { active: BackgroundMode.BasicBackground, basic: { color: new Color(0.06, 0.07, 0.09) } },
          ground: { enabled: false },
        },
        Splatting: {
          enabled: true,
          composite: { enabled: true, highPrecisionEnabled: true, toneMapping: ToneMapping.Neutral },
        },
        TAA: { enabled: false },
      },
    });
    this.scene = new Scene3D();
    this.camera = new PerspectiveCamera(60, 1, 0.05, 500);
    this.viewer.setScene(this.scene);
    this.viewer.setCamera(this.camera);
    this.viewer.requestRenderHandler = () => (this.dirty = true);
    this.anim.registerToViewer(this.viewer);

    this.scene.add([this.roomRoot, this.itemsRoot, this.helpers]);
    this.sun.position.set(2, 5, 3);
    this.scene.add([this.ambient, this.sun]);

    this.camera.up.set(0, 1, 0);
    this.camera.position.set(0, 1.6, 3.5);
    this.camera.lookAt(new Vector3(0, 0.8, 0));
    this.control = new CameraControl(this.camera, container, {
      useOrbit: true,
      orbitCenter: { x: 0, y: 0.8, z: 0 },
      moveSpeed: 1.4,
      shiftMultiplier: 2,
    });

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.raf = requestAnimationFrame(this.tick);
  }

  private resize() {
    if (this.disposed) return;
    this.viewer.resize();
    const { clientWidth: w, clientHeight: h } = this.container;
    if (w && h) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    this.dirty = true;
  }

  private tick = (time: number) => {
    if (this.disposed) return;
    const dt = this.last ? Math.min((time - this.last) / 1000, 0.1) : 0;
    this.last = time;
    // always run controls: `dirty || update()` would skip input whenever a render is already pending
    const moved = this.control.update(dt);
    let render = this.dirty || moved;
    for (const f of this.frames) render = f(dt) || render;
    if (render) {
      this.dirty = false;
      this.scene.notifySceneChange();
      this.viewer.render();
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  onFrame(f: Frame) {
    this.frames.add(f);
    return () => void this.frames.delete(f);
  }

  invalidate() {
    this.dirty = true;
  }

  // ---------- room (3DGS) ----------

  async loadRoom(url: string, onProgress?: (p: number) => void, signal?: AbortSignal) {
    const res = await fetch(url, { signal });
    if (!res.ok || !res.body) throw new Error(`Room download failed (${res.status})`);
    const total = Number(res.headers.get("content-length") ?? 0);
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      got += value.length;
      if (total) onProgress?.(got / total);
    }
    const buf = new Uint8Array(got);
    let o = 0;
    for (const c of chunks) (buf.set(c, o), (o += c.length));
    const data = await SplatLoader.parseSplatData(fileType(url), buf, SplatLoader.SplatPackType.Compressed);
    const splat = (await SplatUtils.createSplat(data)) as unknown as Object3D;
    if (this.disposed) return;
    if (this.splat) this.roomRoot.remove(this.splat);
    this.splat = splat;
    this.roomRoot.add(splat);
    this.dirty = true;
    return splat;
  }

  setRoomVisible(v: boolean) {
    this.roomRoot.visible = v;
    this.dirty = true;
  }

  /** Apply calibration: rotate source up-axis to +Y, yaw, scale, then offset. */
  calibrate(c: Calibration) {
    const r = this.roomRoot;
    // Euler order XYZ: base rotation brings the source up-axis to +Y; yaw spins around Y.
    const base: Record<Calibration["up"], [number, number]> = {
      "+y": [0, 0],
      "-y": [Math.PI, 0],
      "+z": [-Math.PI / 2, 0],
      "-z": [Math.PI / 2, 0],
    };
    const [bx] = base[c.up];
    r.rotation.set(bx, c.yaw, 0, "YXZ");
    r.scale.set(c.scale, c.scale, c.scale);
    r.position.set(c.offset[0], c.offset[1], c.offset[2]);
    r.updateMatrixWorld(true);
    this.dirty = true;
  }

  /** Bounds of the room in world space (after calibration). */
  roomBounds() {
    if (!this.splat) return null;
    const b = new Box3().setFromObject(this.roomRoot);
    return b.isEmpty() ? null : b;
  }

  // ---------- furniture (GLB) ----------

  private async parseGlb(url: string, signal?: AbortSignal) {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Model download failed (${res.status})`);
    const buf = await res.arrayBuffer();
    return GLTFLoader.loadGLTF(buf, { textureLoader: downloadTexture });
  }

  /** Wrap `model` in a root and move it so its bottom-center sits at the origin. */
  private normalize(model: Object3D) {
    const root = new Object3D();
    root.add(model);
    model.updateMatrixWorld(true);
    const box = new Box3().setFromObject(model);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);
    model.position.set(model.position.x - center.x, model.position.y - box.min.y, model.position.z - center.z);
    return { root, size: { w: size.x, d: size.z, h: size.y } };
  }

  /**
   * Load a Lux3D articulation result: robot.urdf + one GLB per link.
   * Child meshes are expressed in their joint frame; the joint origin is in the parent frame.
   */
  async loadUrdf(urdfUrl: string, resolve: UrdfResolver, signal?: AbortSignal): Promise<LoadedModel> {
    const res = await fetch(urdfUrl, { signal });
    if (!res.ok) throw new Error(`URDF download failed (${res.status})`);
    const xml = new DOMParser().parseFromString(await res.text(), "application/xml");
    const nums = (s: string | null | undefined, d = "0 0 0") => (s ?? d).trim().split(/\s+/).map(Number);

    const linkNodes = new Map<string, Object3D>();
    await Promise.all(
      [...xml.querySelectorAll("robot > link")].map(async (link) => {
        const name = link.getAttribute("name")!;
        const node = new Object3D();
        const mesh = link.querySelector("visual mesh")?.getAttribute("filename");
        if (mesh) node.add((await this.parseGlb(resolve(mesh), signal)).scene as unknown as Object3D);
        linkNodes.set(name, node);
      }),
    );

    const children = new Set<string>();
    const joints: Joint[] = [];
    for (const j of xml.querySelectorAll("robot > joint")) {
      const parent = linkNodes.get(j.querySelector("parent")!.getAttribute("link")!)!;
      const childName = j.querySelector("child")!.getAttribute("link")!;
      const child = linkNodes.get(childName)!;
      children.add(childName);
      // pivot node at the joint origin; the child mesh lives in the pivot's frame
      const pivot = new Object3D();
      const [x, y, z] = nums(j.querySelector("origin")?.getAttribute("xyz"));
      const [rr, rp, ry] = nums(j.querySelector("origin")?.getAttribute("rpy"));
      pivot.position.set(x, y, z);
      pivot.rotation.set(rr, rp, ry, "ZYX");
      pivot.add(child);
      parent.add(pivot);
      const type = j.getAttribute("type");
      if (type === "revolute" || type === "prismatic" || type === "continuous") {
        const [ax, ay, az] = nums(j.querySelector("axis")?.getAttribute("xyz"), "1 0 0");
        const lim = j.querySelector("limit");
        let lower = Number(lim?.getAttribute("lower") ?? 0);
        let upper = Number(lim?.getAttribute("upper") ?? (type === "prismatic" ? 0.3 : Math.PI / 2));
        if (type === "continuous") (lower = 0), (upper = Math.PI / 2);
        joints.push({
          node: child,
          type: type === "prismatic" ? "prismatic" : "revolute",
          axis: new Vector3(ax, ay, az).normalize(),
          lower,
          upper,
          origin: new Vector3(),
        });
      }
    }
    const rootLink = [...linkNodes.keys()].find((n) => !children.has(n)) ?? [...linkNodes.keys()][0];
    const model = new Object3D();
    model.add(linkNodes.get(rootLink)!);
    const { root, size } = this.normalize(model);
    return { root, model, size, actions: [], joints, openness: 0 };
  }

  /** `flat`: lay a model on the floor if it came out standing up (rugs). */
  async loadModel(url: string, signal?: AbortSignal, flat = false): Promise<LoadedModel> {
    const parsed = await this.parseGlb(url, signal);
    const model = parsed.scene as unknown as Object3D;
    if (flat) {
      model.updateMatrixWorld(true);
      const s = new Vector3();
      new Box3().setFromObject(model).getSize(s);
      if (s.y > 3 * Math.min(s.x, s.z)) model.rotation.set(s.z < s.x ? -Math.PI / 2 : 0, 0, s.z < s.x ? 0 : Math.PI / 2);
    }
    const { root, size } = this.normalize(model);

    let mixer: LoadedModel["mixer"];
    const actions: LoadedModel["actions"] = [];
    const clips = (parsed.animations ?? []) as unknown as Parameters<
      InstanceType<typeof Animation.AnimationMixer>["clipAction"]
    >[0][];
    if (clips.length) {
      mixer = new Animation.AnimationMixer(model);
      this.anim.add(mixer);
      for (const clip of clips) {
        const a = mixer.clipAction(clip);
        a.setLoop(Animation.Loop.Once, 1);
        a.pauseWhenFinished = true;
        a.active = false;
        a.time = 0;
        actions.push(a);
      }
      mixer.setTime(0);
    }
    return { root, model, size, mixer, actions, joints: [], openness: 0 };
  }

  /** Pose URDF joints at openness t (0..1). Opens toward the limit with the larger magnitude. */
  private poseJoints(m: LoadedModel, t: number) {
    for (const j of m.joints) {
      const target = Math.abs(j.upper) >= Math.abs(j.lower) ? j.upper : j.lower;
      const v = target * t;
      if (j.type === "revolute") {
        const q = new Quaternion().setFromAxisAngle(j.axis, v);
        j.node.quaternion.copy(q);
      } else {
        j.node.position.set(j.axis.x * v, j.axis.y * v, j.axis.z * v);
      }
    }
    m.openness = t;
  }

  addItem(m: LoadedModel) {
    this.itemsRoot.add(m.root);
    this.dirty = true;
  }

  removeItem(m: LoadedModel) {
    this.itemsRoot.remove(m.root);
    if (m.mixer) this.anim.remove(m.mixer);
    this.dirty = true;
  }

  canArticulate(m: LoadedModel) {
    return m.joints.length > 0 || m.actions.length > 0;
  }

  /** Play articulation forward (open) or backward (close). Returns duration (s). */
  articulate(m: LoadedModel, open: boolean) {
    if (m.joints.length) {
      const from = m.openness;
      const to = open ? 1 : 0;
      const dur = 0.9 * Math.abs(to - from);
      let t = 0;
      const stop = this.onFrame((dt) => {
        t = Math.min(1, t + dt / Math.max(dur, 0.001));
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
        this.poseJoints(m, from + (to - from) * e);
        if (t >= 1) stop();
        return true;
      });
      return dur;
    }
    let dur = 0;
    for (const a of m.actions) {
      dur = Math.max(dur, a.timeDuration);
      if (!a.active) {
        a.active = true;
        a.weight = 1;
        a.time = open ? 0 : a.timeDuration;
      }
      a.paused = false;
      a.speed = open ? 1 : -1;
    }
    // Keep rendering while the clip plays.
    const until = performance.now() + dur * 1000 + 100;
    const stop = this.onFrame(() => {
      if (performance.now() > until) stop();
      return true;
    });
    return dur;
  }

  // ---------- lighting & camera ----------

  /** Lighting moods for the furniture layer (the scan keeps its baked light). */
  setMood(mood: "day" | "evening" | "night") {
    const m = {
      day: { a: [0xffffff, 0.9], s: [0xffffff, 1.4] },
      evening: { a: [0xffd2a8, 0.7], s: [0xffa060, 1.1] },
      night: { a: [0x8fa4ff, 0.35], s: [0xc9d4ff, 0.45] },
    }[mood];
    this.ambient.color = new Color(m.a[0]);
    this.ambient.intensity = m.a[1];
    this.sun.color = new Color(m.s[0]);
    this.sun.intensity = m.s[1];
    this.dirty = true;
  }

  setBackground(r: number, g: number, b: number) {
    setViewerConfig(this.viewer, {
      pipeline: { Background: { background: { active: BackgroundMode.BasicBackground, basic: { color: new Color(r, g, b) } } } },
    });
    this.dirty = true;
  }

  lookFrom(position: [number, number, number], target: [number, number, number]) {
    this.camera.position.set(...position);
    this.camera.lookAt(new Vector3(...target));
    this.control.setOrbitCenter({ x: target[0], y: target[1], z: target[2] });
    this.dirty = true;
  }

  // ---------- picking ----------

  /** World ray through a container pixel. */
  ray(clientX: number, clientY: number) {
    const rect = this.container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.camera.updateMatrixWorld(true);
    const origin = this.camera.position.clone();
    const target = new Vector3(x, y, 0.5).unproject(this.camera);
    const dir = target.sub(origin).normalize();
    return new Ray(origin, dir);
  }

  /** Intersection with the floor plane (y = height). */
  floorPoint(clientX: number, clientY: number, height = 0) {
    const r = this.ray(clientX, clientY);
    const p = new Vector3();
    return r.intersectPlane(new Plane(new Vector3(0, 1, 0), -height), p) ? p : null;
  }

  /** Nearest item whose world AABB the ray hits. */
  pick<T extends { model: LoadedModel }>(clientX: number, clientY: number, items: T[]) {
    const r = this.ray(clientX, clientY);
    let best: T | null = null;
    let bestT = Infinity;
    for (const it of items) {
      it.model.root.updateMatrixWorld(true);
      const b = new Box3().setFromObject(it.model.root);
      const t = rayBox(r.origin, r.direction, b.min, b.max);
      if (t !== null && t < bestT) (bestT = t), (best = it);
    }
    return best;
  }

  worldBox(m: LoadedModel) {
    m.root.updateMatrixWorld(true);
    return new Box3().setFromObject(m.root);
  }

  // ---------- helpers ----------

  /** Wireframe box used for ghosts, selection and the 1 m reference cube. */
  box(color: number, w = 1, h = 1, d = 1, opacity = 0.35) {
    const g = new BufferGeometry();
    const x = w / 2, z = d / 2;
    const v = [
      [-x, 0, -z], [x, 0, -z], [x, 0, z], [-x, 0, z],
      [-x, h, -z], [x, h, -z], [x, h, z], [-x, h, z],
    ];
    // thin triangles per edge would be heavy; draw 6 faces translucent instead
    const f = [0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 4, 3, 4, 0];
    g.setAttribute("position", new BufferAttribute(new Float32Array(v.flat()), 3));
    g.setIndex(new BufferAttribute(new Uint16Array(f), 1));
    const mat = new MeshBasicMaterial({ color, transparent: true, opacity });
    (mat as unknown as { depthWrite: boolean }).depthWrite = false;
    (mat as unknown as { side: number }).side = 2;
    return new Mesh(g, mat);
  }

  /** Floor grid made of thin quads. */
  grid(size = 10, step = 0.5) {
    const pos: number[] = [];
    const idx: number[] = [];
    const t = 0.006;
    const quad = (x0: number, z0: number, x1: number, z1: number) => {
      const i = pos.length / 3;
      pos.push(x0, 0.001, z0, x1, 0.001, z0, x1, 0.001, z1, x0, 0.001, z1);
      idx.push(i, i + 1, i + 2, i, i + 2, i + 3);
    };
    for (let s = -size / 2; s <= size / 2 + 1e-6; s += step) {
      quad(s - t, -size / 2, s + t, size / 2);
      quad(-size / 2, s - t, size / 2, s + t);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
    g.setIndex(new BufferAttribute(new Uint32Array(idx), 1));
    const mat = new MeshBasicMaterial({ color: 0x8fb3ff, transparent: true, opacity: 0.35 });
    return new Mesh(g, mat);
  }

  /** PNG data URL of the current frame. */
  snapshot() {
    this.scene.notifySceneChange();
    this.viewer.render();
    const canvas = this.container.querySelector("canvas");
    return canvas?.toDataURL("image/png") ?? "";
  }

  canvas() {
    return this.container.querySelector("canvas");
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.control.dispose();
    this.viewer.requestRenderHandler = undefined;
    this.viewer.destroy();
  }
}

/** Slab test; returns distance along ray or null. */
function rayBox(o: Vector3, d: Vector3, min: Vector3, max: Vector3) {
  let t0 = -Infinity, t1 = Infinity;
  for (const k of ["x", "y", "z"] as const) {
    const inv = 1 / d[k];
    let a = (min[k] - o[k]) * inv, b = (max[k] - o[k]) * inv;
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a);
    t1 = Math.min(t1, b);
  }
  return t1 >= Math.max(t0, 0) ? Math.max(t0, 0) : null;
}
