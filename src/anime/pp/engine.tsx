// Shot engine for the rest of the film: a shot = a set + actors (VRM characters, optionally on horses) driven by
// pure functions of time + a camera function + effects. Every frame is computed from t alone, so any frame renders on its own.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import type { VRM } from "@pixiv/three-vrm";
import { fist, loadFresh, setMorphs, type HB } from "../kit";
import { findChar } from "../cast2";
import { buildHorse, HORSES, type BuiltHorse, type HorseLook } from "../horse";
import { buildFarm, FARM_SUN, type FarmTime } from "../farm";
import { SETS } from "../sets";
import { applyPose, makeRig, type Pose, type Rig, POSE } from "../rig";

export type V3 = [number, number, number];
export type ActorState = {
  pos: V3; yaw: number; pose: Pose; face?: { [k: string]: number | undefined };
  fall?: number; roll?: number; lift?: number; hidden?: boolean; scale?: number;
  gun?: boolean; aim?: V3; kick?: number; gunScale?: number;     // revolver in the right hand (char ids ending _armed)
  horse?: { speed: number; dist: number };                       // mounted: pos/yaw are the horse's
};
export type ActorSpec = { key: string; char: string; horse?: string | HorseLook; fists?: ("left" | "right")[]; at: (t: number) => ActorState };
export type CamState = { pos: V3; look: V3; fov: number; roll?: number; shake?: number };
export type Ctx = { bone: (key: string, b: HB) => THREE.Vector3; gunTip: (key: string) => THREE.Vector3; t: number };
export type Fx = {
  flash: (p: THREE.Vector3, size: number) => void; smoke: (p: THREE.Vector3, age: number, size?: number, color?: string) => void;
  dust: (p: THREE.Vector3, age: number, size?: number) => void; shard: (p: THREE.Vector3, color: string, size?: number) => void;
  streak: (from: THREE.Vector3, to: THREE.Vector3, k: number) => void; blood: (p: THREE.Vector3, size: number) => void;
};
export type ShotSpec = {
  id: string; dur: number; set: string; light?: "sunset" | "day" | "night" | "none";
  actors: ActorSpec[]; cam: (t: number, c: Ctx) => CamState; fx?: (t: number, c: Ctx, fx: Fx) => void;
  build?: (scene: THREE.Scene) => (t: number) => void;         // shot-specific props (bottles, coffin, ...)
  grade?: "flashback" | "night" | "none"; white?: (t: number) => number; hideHorseHead?: (t: number) => string | null;
  post?: (t: number, c: Ctx) => void;                          // after posing, before the camera (props held in hands, etc.)
};

// ---------- helpers for writing shots ----------
export const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export const ease = { lin: (k: number) => k, io: (k: number) => k * k * (3 - 2 * k), out: (k: number) => 1 - (1 - k) * (1 - k), in: (k: number) => k * k, out3: (k: number) => 1 - (1 - k) ** 3,
  back: (k: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); } };
export const nt = (keys: [number, number, ((k: number) => number)?][], t: number) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1, e] = keys[i]; return v0 + (v1 - v0) * (e ?? ease.io)((t - t0) / (t1 - t0)); } return keys[keys.length - 1][1]; };
export const vt = (keys: [number, V3, ((k: number) => number)?][], t: number): V3 => [0, 1, 2].map((i) => nt(keys.map(([tt, v, e]) => [tt, v[i], e] as [number, number, ((k: number) => number)?]), t)) as V3;
export const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
export const toArr = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];
export const talk = (t: number, a: number, b: number, amt = 0.7): Record<string, number> => (t < a || t > b ? { Fcl_MTH_A: 0 } : { Fcl_MTH_A: amt * Math.max(0, Math.sin((t - a) * 23) * 0.5 + Math.sin((t - a) * 37) * 0.35 + 0.25) });
// a seeded hash so "random" detail is deterministic
export const hash = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- the world ----------
type Actor = { spec: ActorSpec; vrm: VRM; rig: Rig; wrap: THREE.Group; baseRot: number; base: Record<string, number>; morphKeys: Set<string>;
  horse?: BuiltHorse; seat?: THREE.Object3D; hipsLocal?: THREE.Vector3; gun?: THREE.Object3D; grip?: THREE.Object3D; tails: THREE.Object3D[] };
type World = { set: { group: THREE.Group; update: (t: number) => void }; actors: Actor[]; extra?: (t: number) => void; fx: FxPool };

const canvasT = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
let TEX: Record<string, THREE.Texture> | null = null;
const tex = () => TEX ?? (TEX = {
  flash: canvasT(512, 512, (g) => { g.translate(256, 256); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 256); gr.addColorStop(0, "rgba(255,255,240,1)"); gr.addColorStop(0.18, "rgba(255,236,170,0.95)"); gr.addColorStop(0.45, "rgba(255,150,60,0.55)"); gr.addColorStop(1, "rgba(255,90,30,0)"); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 256, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + (i % 3) * 0.13, L = i % 2 ? 250 : 170, w = 0.07; g.fillStyle = "rgba(255,248,215,0.95)"; g.beginPath(); g.moveTo(Math.cos(a - w) * 30, Math.sin(a - w) * 30); g.lineTo(Math.cos(a) * L, Math.sin(a) * L); g.lineTo(Math.cos(a + w) * 30, Math.sin(a + w) * 30); g.fill(); } }),
  puff: canvasT(128, 128, (g) => { let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 7; i++) { const x = 40 + r() * 48, y = 40 + r() * 48, rr = 22 + r() * 20; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,0.6)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); } }),
  streak: canvasT(512, 64, (g) => { const gr = g.createLinearGradient(0, 0, 512, 0); gr.addColorStop(0, "rgba(255,120,40,0)"); gr.addColorStop(0.7, "rgba(255,200,110,0.8)"); gr.addColorStop(1, "rgba(255,250,220,1)"); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 30); g.lineTo(500, 18); g.quadraticCurveTo(512, 32, 500, 46); g.closePath(); g.fill(); }),
  shard: canvasT(32, 32, (g) => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(4, 28); g.lineTo(16, 2); g.lineTo(28, 22); g.closePath(); g.fill(); }),
  blood: canvasT(128, 128, (g) => { g.fillStyle = "rgba(150,20,30,0.95)"; g.beginPath(); g.arc(64, 64, 34, 0, Math.PI * 2); g.fill(); for (let i = 0; i < 8; i++) { const a = i * 0.8; g.beginPath(); g.arc(64 + Math.cos(a) * 40, 64 + Math.sin(a) * 40, 9 - (i % 3) * 2, 0, Math.PI * 2); g.fill(); } }),
});
class FxPool {
  sprites: THREE.Sprite[] = []; used = 0; streakMesh: THREE.Mesh;
  constructor(scene: THREE.Scene) {
    for (let i = 0; i < 260; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; s.renderOrder = 5; scene.add(s); this.sprites.push(s); }
    this.streakMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.06), new THREE.MeshBasicMaterial({ map: tex().streak, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide })); this.streakMesh.visible = false; scene.add(this.streakMesh);
  }
  reset() { for (const s of this.sprites) s.visible = false; this.used = 0; this.streakMesh.visible = false; }
  take(map: THREE.Texture, add: boolean) { const s = this.sprites[this.used++ % this.sprites.length]; const m = s.material as THREE.SpriteMaterial; if (m.map !== map) { m.map = map; m.needsUpdate = true; } m.blending = add ? THREE.AdditiveBlending : THREE.NormalBlending; m.depthTest = !add; m.rotation = 0; m.opacity = 1; m.color.set("#ffffff"); s.visible = true; return s; }
  api(cam: THREE.Camera): Fx { const T = tex(); return {
    flash: (p, size) => { const s = this.take(T.flash, true); s.position.copy(p); s.scale.setScalar(size); (s.material as THREE.SpriteMaterial).rotation = p.x * 13 + p.y * 7; },
    smoke: (p, age, size = 0.25, color = "#e8e2da") => { if (age < 0 || age > 2.2) return; const s = this.take(T.puff, false); s.position.copy(p).add(new THREE.Vector3(0, age * 0.35, 0)); s.scale.setScalar(size * (1 + age * 2.5)); const m = s.material as THREE.SpriteMaterial; m.color.set(color); m.opacity = 0.75 * Math.min(1, age * 10) * (1 - age / 2.2); s.material.depthTest = true; },
    dust: (p, age, size = 0.7) => { if (age < 0 || age > 1.6) return; const s = this.take(T.puff, false); s.position.copy(p).add(new THREE.Vector3(0, age * 0.5, 0)); s.scale.setScalar(size * (1 + age * 2.2)); const m = s.material as THREE.SpriteMaterial; m.color.set("#f0c49c"); m.opacity = 0.5 * Math.min(1, age * 6) * (1 - age / 1.6); },
    shard: (p, color, size = 0.05) => { const s = this.take(T.shard, false); s.position.copy(p); s.scale.setScalar(size); const m = s.material as THREE.SpriteMaterial; m.color.set(color); m.rotation = p.x * 31 + p.z * 17; },
    streak: (from, to, k) => { const p = from.clone().lerp(to, Math.min(1, k)); const d = to.clone().sub(from); const L = Math.min(d.length(), 1.8); const m = this.streakMesh; m.visible = true; m.position.copy(p).addScaledVector(d.normalize(), -L / 2); m.scale.set(L, 1, 1);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), d); m.quaternion.copy(q); const toCam = cam.position.clone().sub(m.position); const axis = d; const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q); const proj = toCam.addScaledVector(axis, -toCam.dot(axis)).normalize(); const ang = Math.atan2(new THREE.Vector3().crossVectors(n, proj).dot(axis), n.dot(proj)); m.rotateX(ang); },
    blood: (p, size) => { const s = this.take(T.blood, false); s.position.copy(p); s.scale.setScalar(size); (s.material as THREE.SpriteMaterial).depthTest = true; },
  }; }
}

const LIGHTS: Record<string, (s: THREE.Scene) => void> = {
  sunset: (s) => { const sun = FARM_SUN.sunset.clone().multiplyScalar(70); s.add(new THREE.HemisphereLight("#c4bde6", "#6e5a70", 0.85)); const d = keyLight("#ffc28a", 2.6, sun); s.add(d); const f = new THREE.DirectionalLight("#ffd0b0", 0.55); f.position.set(10, 6, 40); s.add(f); },
  day: (s) => { const sun = FARM_SUN.day.clone().multiplyScalar(70); s.add(new THREE.HemisphereLight("#dfe8ff", "#8a7a68", 1.0)); s.add(keyLight("#fff1dc", 2.4, sun)); const f = new THREE.DirectionalLight("#cfe0ff", 0.45); f.position.set(-20, 10, 30); s.add(f); },
  night: (s) => { const moon = FARM_SUN.night.clone().multiplyScalar(70); s.add(new THREE.HemisphereLight("#5a6aa8", "#1a1a30", 0.7)); s.add(keyLight("#a8b8ff", 1.3, moon)); const f = new THREE.DirectionalLight("#8090d0", 0.35); f.position.set(10, 6, 40); s.add(f); },
};
const keyLight = (color: string, i: number, pos: THREE.Vector3) => { const d = new THREE.DirectionalLight(color, i); d.position.copy(pos); d.castShadow = true; d.shadow.mapSize.set(4096, 4096); const c = d.shadow.camera as THREE.OrthographicCamera; c.left = -40; c.right = 40; c.top = 40; c.bottom = -40; c.near = 1; c.far = 170; d.shadow.bias = -0.0004; return d; };

const castAll = (o: THREE.Object3D) => o.traverse((m) => { if ((m as THREE.Mesh).isMesh) { m.castShadow = true; m.receiveShadow = true; } });
const loadActor = async (scene: THREE.Scene, spec: ActorSpec): Promise<Actor> => {
  const def = findChar(spec.char); const vrm = await loadFresh(staticFile(def.base)); const b = def.build(vrm); vrm.update(0);
  for (const s of spec.fists ?? []) fist(vrm, s, 0.8);
  const rig = makeRig(vrm); const baseRot = vrm.scene.rotation.y; const wrap = new THREE.Group(); wrap.add(vrm.scene); scene.add(wrap); castAll(vrm.scene);
  let gun: THREE.Object3D | undefined, grip: THREE.Object3D | undefined; const tails: THREE.Object3D[] = [];
  vrm.scene.traverse((o) => { if (o.name === "gun") gun = o; if (o.name === "holsterGrip") grip = o; if (o.name === "coatTail") tails.push(o); });
  const a: Actor = { spec, vrm, rig, wrap, baseRot, base: b.face ?? {}, morphKeys: new Set(Object.keys(b.face ?? {})), gun, grip, tails };
  if (spec.horse) {
    const look = typeof spec.horse === "string" ? HORSES[spec.horse] : spec.horse; const h = await buildHorse(staticFile("anime/Horse.fbx"), look); scene.add(h.root); castAll(h.root); a.horse = h;
    h.root.traverse((o) => { if (o.name === "seat") a.seat = o; });
    for (const c of ["run", "walk", "idle"]) if (h.clips[c]) h.mixer.clipAction(h.clips[c]).play();
    applyPose(rig, POSE.ride); vrm.update(0); wrap.updateMatrixWorld(true);
    a.hipsLocal = wrap.worldToLocal(vrm.humanoid.getRawBoneNode("hips")!.getWorldPosition(new THREE.Vector3()));
  }
  return a;
};

const poseActor = (a: Actor, t: number, dt: number) => {
  const s = a.spec.at(t); a.wrap.visible = !s.hidden; if (a.horse) a.horse.root.visible = !s.hidden; if (s.hidden) return s;
  a.vrm.scene.rotation.y = a.baseRot; a.vrm.scene.scale.setScalar(a.vrm.scene.scale.x); // keep build scale
  if (a.horse && s.horse) {
    const h = a.horse; h.root.position.set(...s.pos); h.root.rotation.y = s.yaw; // horse model faces +Z, like the characters
    const v = s.horse.speed; const runW = THREE.MathUtils.clamp((v - 3) / 3, 0, 1), walkW = (1 - runW) * THREE.MathUtils.clamp(v / 0.6, 0, 1), idleW = 1 - runW - walkW;
    const set = (n: string, w: number, cyc: number) => { const c = h.clips[n]; if (!c) return; const ac = h.mixer.clipAction(c); ac.time = ((cyc % 1) + 1) % 1 * c.duration; ac.setEffectiveWeight(w); };
    set("run", runW, s.horse.dist / 5.2); set("walk", walkW, s.horse.dist / 1.9); set("idle", idleW, t / 3);
    h.mixer.update(0); h.root.updateMatrixWorld(true);
    const stride = s.horse.dist / 5.2; const bob = Math.sin(stride * Math.PI * 4) * runW; const lift = Math.max(0, bob) * 0.045;
    const seatW = a.seat!.getWorldPosition(new THREE.Vector3());
    a.wrap.rotation.set(0, s.yaw, 0); const off = a.hipsLocal!.clone().applyEuler(a.wrap.rotation);
    a.wrap.position.copy(seatW).add(new THREE.Vector3(0, 0.1 + lift, 0)).sub(off);
    const tn = s.pose.turn ?? (s.pose.turn = {}); const sp = tn.spine ?? [0, 0, 0]; tn.spine = [sp[0] + bob * 0.06, sp[1], sp[2]];
    for (const ct of a.tails) { if (!ct.userData.q0) ct.userData.q0 = ct.quaternion.clone(); ct.quaternion.copy(ct.userData.q0 as THREE.Quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (0.22 + 0.1 * Math.sin(stride * Math.PI * 4 + 1.2)) * runW + 0.04)); }
  } else {
    a.wrap.position.set(s.pos[0], s.pos[1] + (s.lift ?? 0), s.pos[2]); a.wrap.rotation.set(0, s.yaw, 0, "YXZ");
    if (s.fall) a.wrap.rotateX(s.fall); if (s.roll) a.wrap.rotateZ(s.roll);
  }
  if (s.scale) a.wrap.scale.setScalar(s.scale);
  a.wrap.updateMatrixWorld(true);
  applyPose(a.rig, s.pose);
  a.vrm.update(dt);
  if (a.gun) a.gun.visible = s.gun ?? true; if (a.grip) a.grip.visible = a.gun ? !(s.gun ?? true) : true;
  if (a.gun && s.aim) { const g = a.gun; g.updateMatrixWorld(true); const gp = g.getWorldPosition(new THREE.Vector3()); const x = v3(...s.aim).sub(gp).normalize(); const side = new THREE.Vector3().crossVectors(x, v3(0, 1, 0)).normalize(); if (s.kick) x.applyAxisAngle(side, s.kick);
    const y = v3(0, 1, 0).addScaledVector(x, -x.y).normalize(); const z = new THREE.Vector3().crossVectors(x, y); const qW = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    if (!g.userData.q0) g.userData.q0 = g.quaternion.clone(); g.quaternion.copy(g.parent!.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(qW)); }
  else if (a.gun?.userData.q0) a.gun.quaternion.copy(a.gun.userData.q0 as THREE.Quaternion);
  if (a.gun) a.gun.scale.setScalar(s.gunScale ?? 1);
  const face: Record<string, number | undefined> = { ...a.base, ...(s.face ?? {}) }; for (const k of Object.keys(face)) a.morphKeys.add(k); const full: Record<string, number> = {}; for (const k of a.morphKeys) full[k] = face[k] ?? 0; setMorphs(a.vrm, full);
  return s;
};

const ShotScene: React.FC<{ spec: ShotSpec; t: number }> = ({ spec, t }) => {
  const { scene, camera, advance } = useThree();
  const [h] = React.useState(() => delayRender("shot " + spec.id, { timeoutInMilliseconds: 900000 }));
  const [w, setW] = React.useState<World | null>(null);
  React.useEffect(() => { (async () => {
    let set: World["set"];
    if (spec.set.startsWith("farm")) { const time = (spec.set.split(":")[1] ?? "sunset") as FarmTime; const f = buildFarm(time); set = f; scene.fog = f.group.userData.fog as THREE.Fog; (LIGHTS[spec.light ?? time] ?? (() => {}))(scene); }
    else { const b = SETS[spec.set](); set = b; if (b.fog) scene.fog = b.fog; if (spec.light && spec.light !== "none") LIGHTS[spec.light](scene); }
    scene.add(set.group); castAll(set.group);
    const actors: Actor[] = []; for (const a of spec.actors) actors.push(await loadActor(scene, a));
    const extra = spec.build?.(scene);
    setW({ set, actors, extra, fx: new FxPool(scene) });
  })().catch((e) => { console.error("SHOT LOAD FAILED", spec.id, e); continueRender(h); }); }, []);
  React.useEffect(() => { if (!w) return; setTimeout(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); }, 400); }, [w]);
  if (w) {
    w.set.update(t); w.extra?.(t);
    // hair + coat springs: simulate the last ~0.27 s every frame (deterministic per frame)
    const SUB = 1 / 30, K = 8; for (const a of w.actors) a.vrm.springBoneManager?.reset();
    for (let k = K; k >= 1; k--) for (const a of w.actors) poseActor(a, t - k * SUB, k === K ? 0 : SUB);
    for (const a of w.actors) poseActor(a, t, SUB);
    const hh = spec.hideHorseHead?.(t); for (const a of w.actors) { const hd = a.horse?.root.getObjectByName("Head"); if (hd) hd.scale.setScalar(hh === a.spec.key ? 0.001 : 1); }
    const byKey = (k: string) => w.actors.find((a) => a.spec.key === k)!;
    const ctx: Ctx = { t, bone: (k, b) => byKey(k).vrm.humanoid.getRawBoneNode(b)!.getWorldPosition(new THREE.Vector3()),
      gunTip: (k) => { const g = byKey(k).gun; return g ? g.localToWorld(new THREE.Vector3(0.2, 0.012, 0)) : byKey(k).vrm.humanoid.getRawBoneNode("rightHand")!.getWorldPosition(new THREE.Vector3()); } };
    spec.post?.(t, ctx);
    const c = camera as THREE.PerspectiveCamera; const cs = spec.cam(t, ctx);
    c.position.set(...cs.pos); if (cs.shake) c.position.add(v3(Math.sin(t * 61) * cs.shake, Math.sin(t * 47 + 1) * cs.shake, 0)); c.lookAt(...cs.look); if (cs.roll) c.rotateZ(cs.roll); c.fov = cs.fov; c.near = 0.04; c.far = 1000; c.updateProjectionMatrix(); c.updateMatrixWorld(true);
    w.fx.reset(); spec.fx?.(t, ctx, w.fx.api(c));
  }
  return null;
};

const GRADE: Record<string, React.CSSProperties> = {
  flashback: { background: "linear-gradient(rgba(255,214,150,0.22), rgba(200,140,90,0.22))", mixBlendMode: "multiply" },
  night: { background: "linear-gradient(rgba(60,70,140,0.10), rgba(20,20,60,0.18))", mixBlendMode: "multiply" },
};
export const ShotView: React.FC<{ spec: ShotSpec }> = ({ spec }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps; const white = spec.white?.(t) ?? 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", filter: spec.grade === "flashback" ? "sepia(0.35) saturate(0.85) contrast(1.05)" : undefined }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: 34, position: [0, 2, 20], far: 1000 }} gl={{ antialias: true }} shadows><ShotScene spec={spec} t={t} /></ThreeCanvas>
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 42%, rgba(255,210,170,0) 55%, rgba(60,30,70,0.35) 100%)" }} />
      <AbsoluteFill style={{ pointerEvents: "none", background: "linear-gradient(rgba(255,170,120,0.10), rgba(120,90,190,0.10))", mixBlendMode: "soft-light" }} />
      {spec.grade && GRADE[spec.grade] ? <AbsoluteFill style={{ pointerEvents: "none", ...GRADE[spec.grade] }} /> : null}
      {white ? <AbsoluteFill style={{ pointerEvents: "none", background: `rgba(255,240,210,${white})` }} /> : null}
    </AbsoluteFill>
  );
};
