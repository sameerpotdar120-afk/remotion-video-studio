// Scene 1: "Six men ride up to the farm and shoot a man dead."
// One continuous camera move with the gang (pull back -> riders catch up -> orbit round Silas -> over the gun),
// the shot, then a cut to Thomas: hit, hands to chest, stagger (Eli revealed on the porch), plank fall, bounce.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions } from "../engine/Captions";
import words from "../../episodes/anime1/words.json";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import type { VRM } from "@pixiv/three-vrm";
import { fist, loadFresh, setMorphs } from "./kit";
import { CAST } from "./cast";
import { buildHorse, BuiltHorse, HORSES } from "./horse";
import { buildFarm, Farm, SUN_DIR } from "./farm";
import { applyPose, E, makeRig, mix, ntrack, Pose, POSE, Rig, track, withAim, dirL, dirR } from "./rig";

export const S1_FPS = 30, S1_DUR = 4.3;
const T_CUT = 2.9;                       // cut to the victim
const T_SHOT = 2.8;                      // muzzle flash (on "man")
const THOMAS = new THREE.Vector3(0, 0, 8.6), ELI = new THREE.Vector3(-0.12, 0.67, 4.3);

// ---------- the gang: wedge 1-2-3, galloping from the gate (z 37) towards the house (-Z) ----------
type RiderDef = { id: string; horse: string; dx: number; dz: number; ph: number };
const RIDERS: RiderDef[] = [
  { id: "silas_armed", horse: "silas", dx: 0, dz: 0, ph: 0 },
  { id: "bram", horse: "bram", dx: -1.9, dz: 2.4, ph: 0.31 },
  { id: "abel", horse: "abel", dx: 1.9, dz: 2.6, ph: 0.57 },
  { id: "cain", horse: "cain", dx: -3.7, dz: 5.0, ph: 0.13 },
  { id: "jory", horse: "jory", dx: 0.9, dz: 5.4, ph: 0.74 },
  { id: "lucien", horse: "lucien", dx: 3.8, dz: 4.8, ph: 0.46 },
];
// leader speed (m/s): full gallop, easing to a slow walk as he takes aim
const speed = (t: number) => ntrack([[0, 8], [1.35, 8], [2.45, 1.6], [3, 1.2]], t);
const Z0 = 44; const ZT: number[] = []; { let z = Z0; for (let i = 0; i <= 600; i++) { ZT.push(z); z -= speed(i / 100) / 100; } }
const zAt = (t: number) => { const i = Math.max(0, Math.min(599, Math.floor(t * 100))); const k = t * 100 - i; return ZT[i] + (ZT[i + 1] - ZT[i]) * k; };
const distAt = (t: number) => Z0 - zAt(t);
const riderPos = (r: RiderDef, t: number) => new THREE.Vector3(r.dx + Math.sin(t * 1.3 + r.ph * 9) * 0.12, 0, zAt(t) + r.dz);

// ---------- poses ----------
const RIDE = POSE.ride;
const silasTrack = (t: number): Pose => track([
  [0, withAim(RIDE, { rightUpperArm: dirR(0.08, -0.88, 0.45), rightLowerArm: dirR(-0.5, -0.15, 0.85), rightHand: dirR(-0.5, -0.2, 0.85) })], // hand resting on the horn
  [0.36, withAim(RIDE, { rightUpperArm: dirR(0.08, -0.88, 0.45), rightLowerArm: dirR(-0.5, -0.15, 0.85), rightHand: dirR(-0.5, -0.2, 0.85) })],
  [0.43, withAim(RIDE, { rightUpperArm: dirR(0.3, -0.95, -0.05), rightLowerArm: dirR(0.05, -1, 0.15), rightHand: dirR(0.05, -1, 0.15) }), E.in],         // hand to the holster
  [0.51, withAim(RIDE, { rightUpperArm: dirR(0.78, -0.5, 0.3), rightLowerArm: dirR(-0.22, 0.97, 0.12, -1.3), rightHand: dirR(-0.1, 1, 0.08, 0) }), E.back], // up beside the face, barrel to the sky
  [1.98, withAim(RIDE, { rightUpperArm: dirR(0.74, -0.55, 0.32), rightLowerArm: dirR(-0.2, 0.97, 0.16, -1.3), rightHand: dirR(-0.1, 1, 0.1, 0) })],
  [2.18, withAim(RIDE, { rightUpperArm: [0.1, -0.04, 1, 0], rightLowerArm: [0.12, -0.04, 1, 1.64], rightHand: [0.12, -0.05, 1, 0] }, { spine: [0.05, 0.2, 0], head: [0.02, 0.15, 0] }), E.inOut], // swing down to aim
  [T_SHOT, withAim(RIDE, { rightUpperArm: [0.1, -0.04, 1, 0], rightLowerArm: [0.12, -0.05, 1, 1.64], rightHand: [0.12, -0.06, 1, 0] }, { spine: [0.05, 0.2, 0], head: [0.02, 0.15, 0] })],
  [T_SHOT + 0.034, withAim(RIDE, { rightUpperArm: [0.1, 0.12, 1, 0], rightLowerArm: [0.12, 0.42, 0.9, 1.64], rightHand: [0.12, 0.5, 0.86, 0] }, { spine: [-0.02, 0.2, 0], head: [-0.04, 0.15, 0] }), E.out], // recoil kick
  [T_SHOT + 0.25, withAim(RIDE, { rightUpperArm: [0.1, -0.02, 1, 0], rightLowerArm: [0.12, 0.02, 1, 1.64], rightHand: [0.12, 0.0, 1, 0] }, { spine: [0.05, 0.2, 0], head: [0.02, 0.15, 0] })],
], t);
const riderVar = (i: number, t: number): Pose => { const b = Math.sin(t * 7.5 + i * 2.1) * 0.05; return withAim(RIDE, {}, { spine: [0.12 + b, 0, 0], head: [-0.1 - b, (i % 2 ? 0.08 : -0.08), 0] }); };

// Thomas: hands half raised ("easy now"), the hit, hands to chest, stagger, stiff fall backwards, bounce
const T_UP = withAim(POSE.stand, { leftUpperArm: dirL(0.7, -0.68, 0.2), leftLowerArm: dirL(0.4, 0.75, 0.5), leftHand: dirL(0.2, 0.95, 0.2), rightUpperArm: dirR(0.7, -0.68, 0.2), rightLowerArm: dirR(0.4, 0.75, 0.5), rightHand: dirR(0.2, 0.95, 0.2) });
const T_JOLT = withAim(POSE.stand, { leftUpperArm: dirL(0.95, -0.1, -0.25), leftLowerArm: dirL(0.85, 0.45, -0.25), leftHand: dirL(0.7, 0.7, -0.2), rightUpperArm: dirR(0.95, -0.1, -0.25), rightLowerArm: dirR(0.85, 0.45, -0.25), rightHand: dirR(0.7, 0.7, -0.2) }, { spine: [-0.22, 0, 0], chest: [-0.12, 0, 0], head: [-0.3, 0, 0] });
const T_CHEST = withAim(POSE.stand, { leftUpperArm: dirL(0.42, -0.82, 0.38), leftLowerArm: dirL(-0.45, 0.62, 0.64), leftHand: dirL(-0.35, 0.8, 0.5), rightUpperArm: dirR(0.42, -0.82, 0.38), rightLowerArm: dirR(-0.45, 0.55, 0.7), rightHand: dirR(-0.35, 0.75, 0.55) }, { spine: [0.18, 0, 0], chest: [0.08, 0, 0], head: [0.25, 0, 0] });
const T_SWAY = withAim(T_CHEST, {}, { spine: [0.1, 0.1, -0.12], chest: [0.05, 0, -0.06], head: [0.1, 0, 0.12] });
const T_FALL = withAim(POSE.stand, { leftUpperArm: dirL(0.7, -0.5, 0.5), leftLowerArm: dirL(0.3, 0.2, 0.93), leftHand: dirL(0.2, 0.3, 0.93), rightUpperArm: dirR(0.7, -0.5, 0.5), rightLowerArm: dirR(0.3, 0.2, 0.93), rightHand: dirR(0.2, 0.3, 0.93) }, { head: [0.35, 0, 0] });
const T_LAND = withAim(POSE.stand, { leftUpperArm: dirL(0.95, 0.3, 0.02), leftLowerArm: dirL(0.8, 0.45, 0.4), leftHand: dirL(0.7, 0.5, 0.5), rightUpperArm: dirR(0.95, 0.3, 0.02), rightLowerArm: dirR(0.8, 0.45, 0.4), rightHand: dirR(0.7, 0.5, 0.5),
  leftUpperLeg: dirL(0.28, -0.95, 0.12), leftLowerLeg: dirL(0.25, -0.96, 0.05), rightUpperLeg: dirR(0.28, -0.95, 0.12), rightLowerLeg: dirR(0.25, -0.96, 0.05) }, { head: [0.25, 0.25, 0] });
const T_BOUNCE = withAim(T_LAND, { leftUpperArm: dirL(0.9, 0.3, 0.3), leftLowerArm: dirL(0.6, 0.4, 0.7), rightUpperArm: dirR(0.9, 0.3, 0.3), rightLowerArm: dirR(0.6, 0.4, 0.7), leftUpperLeg: dirL(0.28, -0.85, 0.45), rightUpperLeg: dirR(0.28, -0.85, 0.45) }, { head: [0.45, 0.25, 0] });
const T_FALL0 = 3.46, T_FALL1 = 3.7;
const thomasTrack = (t: number): Pose => track([[0, T_UP], [T_CUT - 0.01, T_UP], [T_CUT + 0.05, T_JOLT, E.out], [T_CUT + 0.11, T_JOLT], [3.2, T_CHEST, E.inOut], [3.4, T_SWAY], [T_FALL0, T_SWAY], [T_FALL1, T_FALL, E.in], [T_FALL1 + 0.07, T_BOUNCE, E.out], [T_FALL1 + 0.22, T_LAND, E.inOut]], t);
const thomasRig = (t: number) => ({
  x: ntrack([[3.12, 0], [3.42, 0.32, E.inOut]], t), z: ntrack([[T_CUT, 0], [T_CUT + 0.08, -0.12, E.out]], t),
  fall: ntrack([[T_FALL0, 0], [T_FALL1, -Math.PI / 2, E.in], [T_FALL1 + 0.07, -Math.PI / 2 + 0.07, E.out], [T_FALL1 + 0.18, -Math.PI / 2, E.in]], t),
});

// ---------- camera ----------
type Cam = { pos: THREE.Vector3; look: THREE.Vector3; fov: number };
const camAt = (t: number, head: THREE.Vector3, hand: THREE.Vector3): Cam => {
  const z = zAt(t);
  if (t < 2.0) {
    const d = ntrack([[0, 2.9], [0.35, 3.4, E.lin], [1.25, 15, E.inOut], [1.98, 6.8, E.inOut]], t);
    const h = ntrack([[0, 1.85], [1.25, 2.35], [1.98, 2.3]], t);
    const lz = ntrack([[0, 0], [1.25, 3.0], [1.98, 1.2]], t), ly = ntrack([[0, 2.05], [1.25, 1.9], [1.98, 2.15]], t);
    return { pos: new THREE.Vector3(0.15, h, z - d), look: new THREE.Vector3(0, ly, z + lz), fov: 34 };
  }
  if (t < T_CUT) {
    const k = ntrack([[2.0, 0], [2.42, 1, E.inOut]], t);
    const c = head.clone().lerp(hand, k);
    const phi = ntrack([[2.0, 0], [2.3, 1.55, E.in], [2.55, 2.95, E.out], [T_CUT, 3.03]], t);
    const r = ntrack([[2.0, 6.8], [2.28, 1.35, E.inOut], [2.55, 0.74, E.inOut], [T_CUT, 0.7]], t);
    const h = ntrack([[2.0, -0.2], [2.3, 0.05], [2.55, 0.14], [T_CUT, 0.15]], t);
    const pos = c.clone().add(new THREE.Vector3(Math.sin(phi) * r, h, -Math.cos(phi) * r));
    const lk = ntrack([[2.0, 0], [2.28, 0.0], [2.5, 1, E.inOut]], t);
    const dH0 = hand.clone().sub(pos).normalize(), dT0 = new THREE.Vector3(THOMAS.x, 1.3, THOMAS.z).sub(pos).normalize();
    const look = head.clone().lerp(hand.clone().add(new THREE.Vector3(0, 0, -0.25)), ntrack([[2.24, 0], [2.42, 1, E.inOut]], t)); void dH0; void dT0; void lk;
    // settle tight behind the gun hand: revolver big in the lower left, Thomas + the house beyond
    const k2 = ntrack([[2.36, 0], [2.56, 1, E.inOut]], t);
    const ots = hand.clone().add(new THREE.Vector3(0.16, 0.13, 0.46 + (t - 2.56) * 0.1));
    // aim the view between the gun hand (lower left) and Thomas (centre right)
    const dH = hand.clone().add(new THREE.Vector3(0, -0.02, -0.12)).sub(ots).normalize(), dT = new THREE.Vector3(THOMAS.x, 1.3, THOMAS.z).sub(ots).normalize();
    const otsLook = ots.clone().add(dH.multiplyScalar(0.42).add(dT.multiplyScalar(0.58)).normalize().multiplyScalar(10));
    return { pos: pos.lerp(ots, k2), look: look.lerp(otsLook, k2), fov: ntrack([[2.0, 34], [2.36, 34], [2.56, 46, E.inOut]], t) };
  }
  const pz = ntrack([[T_CUT, 16.0], [T_FALL0, 15.3, E.lin], [T_FALL1 + 0.15, 13.4, E.inOut], [S1_DUR, 13.1, E.lin]], t);
  const py = ntrack([[T_CUT, 1.3], [T_FALL0, 1.3], [T_FALL1 + 0.15, 2.0, E.inOut]], t);
  const ly = ntrack([[T_CUT, 1.3], [T_FALL0, 1.3], [T_FALL1 + 0.15, 0.6, E.inOut]], t);
  const lz = ntrack([[T_CUT, 8.0], [T_FALL1 + 0.15, 7.2, E.inOut]], t);
  return { pos: new THREE.Vector3(0.25, py, pz), look: new THREE.Vector3(0.1, ly, lz), fov: 30 };
};

// ---------- fx textures ----------
const canvasT = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
const flashTex = () => canvasT(512, 512, (g) => { g.translate(256, 256);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, 256); gr.addColorStop(0, "rgba(255,255,240,1)"); gr.addColorStop(0.18, "rgba(255,236,170,0.95)"); gr.addColorStop(0.45, "rgba(255,150,60,0.55)"); gr.addColorStop(1, "rgba(255,90,30,0)"); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 256, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + (i % 3) * 0.13, L = i % 2 ? 250 : 170, w = 0.07; g.fillStyle = "rgba(255,248,215,0.95)"; g.beginPath(); g.moveTo(Math.cos(a - w) * 30, Math.sin(a - w) * 30); g.lineTo(Math.cos(a) * L, Math.sin(a) * L); g.lineTo(Math.cos(a + w) * 30, Math.sin(a + w) * 30); g.fill(); } });
const dustTex = () => canvasT(128, 128, (g) => { for (let i = 0; i < 7; i++) { const x = 40 + Math.random() * 48, y = 40 + Math.random() * 48, r = 22 + Math.random() * 20; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); } });
const streakTex = () => canvasT(512, 64, (g) => { const gr = g.createLinearGradient(0, 0, 512, 0); gr.addColorStop(0, "rgba(255,120,40,0)"); gr.addColorStop(0.7, "rgba(255,200,110,0.8)"); gr.addColorStop(1, "rgba(255,250,220,1)"); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 30); g.lineTo(500, 18); g.quadraticCurveTo(512, 32, 500, 46); g.closePath(); g.fill(); });
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

type World = { farm: Farm; riders: { def: RiderDef; vrm: VRM; rig: Rig; horse: BuiltHorse; baseRot: number; hipsRel: THREE.Vector3; seat: THREE.Object3D; gun?: THREE.Object3D; grip?: THREE.Object3D; tails: THREE.Object3D[] }[];
  thomas: { vrm: VRM; rig: Rig; wrap: THREE.Group; baseRot: number }; eli: { vrm: VRM; rig: Rig }; flash: THREE.Sprite; streak: THREE.Mesh; dust: THREE.Sprite[] };

const loadChar = async (id: string) => { const def = CAST.find((c) => c.id === id)!; const vrm = await loadFresh(staticFile(def.base)); const b = def.build(vrm); vrm.update(0); setMorphs(vrm, b.face ?? {}); return { vrm, face: b.face ?? {} }; };
const castAll = (o: THREE.Object3D) => o.traverse((m) => { if ((m as THREE.Mesh).isMesh) { m.castShadow = true; m.receiveShadow = true; } });

const Scene: React.FC<{ dbg?: string }> = ({ dbg }) => {
  const { scene, camera, advance } = useThree(); const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const [h] = React.useState(() => delayRender("scene1", { timeoutInMilliseconds: 900000 }));
  const [w, setW] = React.useState<World | null>(null);
  React.useEffect(() => { (async () => {
    const farm = buildFarm(); scene.add(farm.group); scene.fog = farm.group.userData.fog as THREE.Fog;
    const riders: World["riders"] = [];
    for (const def of RIDERS) {
      const { vrm } = await loadChar(def.id); const horse = await buildHorse(staticFile("anime/Horse.fbx"), HORSES[def.horse]);
      fist(vrm, "left", 0.8); if (def.id !== "silas_armed") fist(vrm, "right", 0.8);
      const rig = makeRig(vrm); const baseRot = vrm.scene.rotation.y; scene.add(vrm.scene); scene.add(horse.root); castAll(vrm.scene); castAll(horse.root);
      horse.root.rotation.y = Math.PI; vrm.scene.rotation.y = baseRot + Math.PI;
      applyPose(rig, RIDE); vrm.update(0); vrm.scene.updateMatrixWorld(true);
      const hipsRel = vrm.humanoid.getRawBoneNode("hips")!.getWorldPosition(new THREE.Vector3()).sub(vrm.scene.position);
      let seat: THREE.Object3D | undefined; horse.root.traverse((o) => { if (o.name === "seat") seat = o; });
      let gun: THREE.Object3D | undefined, grip: THREE.Object3D | undefined; const tails: THREE.Object3D[] = []; vrm.scene.traverse((o) => { if (o.name === "gun") gun = o; if (o.name === "holsterGrip") grip = o; if (o.name === "coatTail") tails.push(o); });
      const run = horse.clips.run, walk = horse.clips.walk; horse.mixer.clipAction(run).play(); if (walk) horse.mixer.clipAction(walk).play();
      riders.push({ def, vrm, rig, horse, baseRot, hipsRel, seat: seat!, gun, grip, tails });
    }
    const th = await loadChar("thomas"); const wrap = new THREE.Group(); wrap.position.copy(THOMAS); scene.add(wrap); const tBase = th.vrm.scene.rotation.y; wrap.add(th.vrm.scene); th.vrm.scene.position.set(0, 0, 0.06); castAll(th.vrm.scene);
    const tRig = makeRig(th.vrm);
    const el = await loadChar("eli"); el.vrm.scene.position.copy(ELI); scene.add(el.vrm.scene); castAll(el.vrm.scene); const eRig = makeRig(el.vrm);
    setMorphs(el.vrm, { Fcl_EYE_Surprised: 0.6, Fcl_BRW_Sorrow: 0.7, Fcl_MTH_O: 0.25 });
    applyPose(eRig, withAim(POSE.stand, { leftUpperArm: dirL(0.15, -0.97, 0.15), leftLowerArm: dirL(-0.25, -0.6, 0.75), rightUpperArm: dirR(0.15, -0.97, 0.15), rightLowerArm: dirR(-0.25, -0.6, 0.75) })); el.vrm.update(0);
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex(), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false })); flash.visible = false; flash.renderOrder = 10; scene.add(flash);
    const streak = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.08), new THREE.MeshBasicMaterial({ map: streakTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide })); streak.visible = false; scene.add(streak);
    const dt = dustTex(); const dust: THREE.Sprite[] = [];
    for (let i = 0; i < RIDERS.length * 70; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dt, color: "#f0c49c", transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; scene.add(s); dust.push(s); }
    setW({ farm, riders, thomas: { vrm: th.vrm, rig: tRig, wrap, baseRot: tBase }, eli: { vrm: el.vrm, rig: eRig }, flash, streak, dust });
  })().catch((e) => { console.error(e); continueRender(h); }); }, []);

  React.useEffect(() => { if (!w) return; setTimeout(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); }, 500); }, [w]);

  const t = frame / fps;
  if (w) {
    w.farm.update(t);
    let head = new THREE.Vector3(), hand = new THREE.Vector3();
    // everything that moves, posed for time tt; dt > 0 also steps the hair / clothing springs
    const poseWorld = (tt: number, dt: number) => {
      w.riders.forEach((r, i) => {
        const p = riderPos(r.def, tt); r.horse.root.position.copy(p);
        const v = speed(tt); const runW = THREE.MathUtils.clamp((v - 2.5) / 3, 0, 1);
        const stride = distAt(tt) / 5.2 + r.def.ph;
        const ar = r.horse.mixer.clipAction(r.horse.clips.run); ar.time = (stride % 1) * r.horse.clips.run.duration; ar.setEffectiveWeight(runW);
        if (r.horse.clips.walk) { const aw = r.horse.mixer.clipAction(r.horse.clips.walk); aw.time = ((distAt(tt) / 1.9 + r.def.ph) % 1) * r.horse.clips.walk.duration; aw.setEffectiveWeight(1 - runW); }
        r.horse.mixer.update(0);
        if (i === 0) { const hd = r.horse.root.getObjectByName("Head"); if (hd) { hd.scale.setScalar(tt >= 2.42 && tt < T_CUT ? 0.001 : 1); } } // camera cheat: keep the ears out of the over-the-gun shot
        r.horse.root.updateMatrixWorld(true);
        // the rider rises and settles twice a stride (out of step with the others), tails fly back
        const bob = Math.sin(stride * Math.PI * 4) * runW, lift = Math.max(0, bob) * 0.045;
        const seatW = r.seat.getWorldPosition(new THREE.Vector3());
        r.vrm.scene.position.copy(seatW).add(new THREE.Vector3(0, 0.1 + lift, 0.02)).sub(r.hipsRel);
        r.vrm.scene.rotation.y = r.baseRot + Math.PI; r.vrm.scene.updateMatrixWorld(true);
        const pose = i === 0 ? silasTrack(tt) : riderVar(i, tt);
        const tn = pose.turn ?? (pose.turn = {}); const sp = tn.spine ?? [0, 0, 0], hd = tn.head ?? [0, 0, 0];
        tn.spine = [sp[0] + bob * 0.06, sp[1], sp[2]]; tn.head = [hd[0] - bob * 0.05, hd[1], hd[2]];
        applyPose(r.rig, pose);
        for (const ct of r.tails) ct.rotation.x = -(0.25 + 0.12 * Math.sin(stride * Math.PI * 4 + 1.2)) * runW - 0.05;
        r.vrm.update(dt);
        if (r.gun) r.gun.visible = tt >= 0.45; if (r.grip) r.grip.visible = tt < 0.45;
        // once he aims, the revolver points straight at Thomas (top up), with the recoil kick on the shot
        if (r.gun && tt > 1.98) {
          const g = r.gun; const gp = g.getWorldPosition(new THREE.Vector3()); const tgt = new THREE.Vector3(THOMAS.x, 1.35, THOMAS.z);
          const kick = ntrack([[T_SHOT, 0], [T_SHOT + 0.034, 0.42, E.out], [T_SHOT + 0.3, 0, E.inOut]], tt);
          const x = tgt.sub(gp).normalize(); const side = new THREE.Vector3().crossVectors(x, new THREE.Vector3(0, 1, 0)).normalize(); x.applyAxisAngle(side, kick);
          const y = new THREE.Vector3(0, 1, 0).addScaledVector(x, -x.y).normalize(); const z = new THREE.Vector3().crossVectors(x, y);
          const qW = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
          const pq = g.parent!.getWorldQuaternion(new THREE.Quaternion()).invert(); const want = pq.multiply(qW);
          if (!g.userData.q0) g.userData.q0 = g.quaternion.clone();
          g.quaternion.copy((g.userData.q0 as THREE.Quaternion).clone().slerp(want, ntrack([[1.98, 0], [2.18, 1, E.inOut]], tt))); g.scale.setScalar(ntrack([[2.0, 1], [2.3, 1.6], [2.5, 2.3]], tt)); g.updateMatrixWorld(true);
        } else if (r.gun?.userData.q0) { r.gun.quaternion.copy(r.gun.userData.q0 as THREE.Quaternion); r.gun.scale.setScalar(1); }
        if (i === 0) { head = r.vrm.humanoid.getRawBoneNode("head")!.getWorldPosition(new THREE.Vector3()); hand = r.vrm.humanoid.getRawBoneNode("rightHand")!.getWorldPosition(new THREE.Vector3()); }
      });
      // Thomas
      const tr = thomasRig(tt);
      w.thomas.wrap.position.set(THOMAS.x + tr.x, 0.13 * Math.pow(Math.max(0, Math.sin(-tr.fall)), 6), THOMAS.z + tr.z); w.thomas.wrap.rotation.set(tr.fall, 0, 0); w.thomas.wrap.updateMatrixWorld(true);
      applyPose(w.thomas.rig, thomasTrack(tt)); w.thomas.vrm.update(dt);
      w.eli.vrm.update(dt);
    };
    // springs (hair, ribbons) are simulated over the last 0.4 s every frame, so any frame renders the same on its own
    const SUB = 1 / 30, K = 12; const all = [...w.riders.map((r) => r.vrm), w.thomas.vrm, w.eli.vrm];
    for (const v of all) v.springBoneManager?.reset();
    for (let k = K; k >= 1; k--) poseWorld(t - k * SUB, k === K ? 0 : SUB);
    poseWorld(t, SUB);
    setMorphs(w.thomas.vrm, t < T_CUT ? { Fcl_BRW_Sorrow: 0.5, Fcl_MTH_O: 0.15, Fcl_EYE_Surprised: 0 } : { Fcl_BRW_Sorrow: 0.9, Fcl_EYE_Surprised: t < T_FALL1 ? 0.9 : 0.3, Fcl_MTH_O: 0.8 });
    // muzzle flash on the gun barrel
    const gun = w.riders[0].gun; const fl = t >= T_SHOT && t < T_SHOT + 0.067 && t < T_CUT;
    w.flash.visible = !!gun && fl; if (gun && fl) { const m = gun.localToWorld(new THREE.Vector3(0.22, 0.012, 0)); w.flash.position.copy(m); w.flash.scale.setScalar(t < T_SHOT + 0.034 ? 0.42 : 0.3); w.flash.material.rotation = t * 37; }
    // bullet streak into Thomas just after the cut
    const sk = (t - T_CUT) / 0.07; w.streak.visible = sk >= 0 && sk <= 1;
    if (w.streak.visible) { const chest = new THREE.Vector3(THOMAS.x, 1.35, THOMAS.z + 0.15); const from = chest.clone().add(new THREE.Vector3(-2.2, 0.15, 2.5)); const p = from.clone().lerp(chest, Math.min(1, sk * 1.2)); w.streak.position.copy(p); w.streak.scale.set(1.6, 1, 1); w.streak.lookAt(p.clone().add(new THREE.Vector3(0, 0, 1))); w.streak.rotation.z = Math.atan2(chest.y - from.y, chest.x - from.x); }
    // hoof dust
    let k = 0; w.riders.forEach((r, i) => { for (let j = 0; j < 70; j++, k++) { const s = w.dust[k]; const tb = -1.4 + j * 0.08 + rnd(i * 97 + j) * 0.04; const age = t - tb; if (age < 0 || age > 1.6 || speed(tb) < 3) { s.visible = false; continue; }
      const p = riderPos(r.def, tb); s.visible = true; const sx = (rnd(j * 3.1 + i) - 0.5) * 1.4; s.position.set(p.x + sx * (1 + age), 0.25 + age * 0.55, p.z + 1.0 + age * 0.7); s.scale.setScalar(0.7 + age * 2.2); (s.material as THREE.SpriteMaterial).opacity = 0.5 * Math.min(1, age * 6) * (1 - age / 1.6); } });
    // camera
    const c = camera as THREE.PerspectiveCamera; const cam = camAt(t, head, hand);
    if (dbg === "side") { cam.pos.copy(head).add(new THREE.Vector3(2.2, -0.3, -0.6)); cam.look.copy(head).add(new THREE.Vector3(0, -0.3, -0.5)); cam.fov = 40; }
    if (dbg === "top") { cam.pos.copy(head).add(new THREE.Vector3(0.6, 1.2, 1.2)); cam.look.copy(hand); cam.fov = 40; } c.position.copy(cam.pos); c.lookAt(cam.look); c.fov = cam.fov; c.near = 0.05; c.far = 1000; c.updateProjectionMatrix();
  }
  const sun = SUN_DIR.clone().multiplyScalar(70); const yard = t >= T_CUT;
  return (<><hemisphereLight args={[yard ? "#aab2ea" : "#c4bde6", yard ? "#4e4a70" : "#6e5a70", yard ? 0.75 : 0.85]} /><directionalLight position={[sun.x, sun.y, sun.z]} intensity={2.6} color="#ffc28a" castShadow shadow-mapSize-width={4096} shadow-mapSize-height={4096} shadow-camera-left={-62} shadow-camera-right={62} shadow-camera-top={62} shadow-camera-bottom={-62} shadow-camera-near={1} shadow-camera-far={170} shadow-bias={-0.0004} /><directionalLight position={[10, 6, 40]} intensity={yard ? 0.2 : 0.55} color={yard ? "#a8b8ff" : "#ffd0b0"} /></>);
};

export const Scene1: React.FC<{ dbg?: string; captions?: boolean; audio?: boolean }> = ({ dbg, captions = true, audio = true }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  const white = t >= T_SHOT && t < T_SHOT + 0.034 ? 0.18 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: 34, position: [0, 2, 20], far: 1000 }} gl={{ antialias: true }} shadows><Scene dbg={dbg} /></ThreeCanvas>
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 42%, rgba(255,210,170,0) 55%, rgba(60,30,70,0.35) 100%)" }} />
      <AbsoluteFill style={{ pointerEvents: "none", background: "linear-gradient(rgba(255,170,120,0.10), rgba(120,90,190,0.10))", mixBlendMode: "soft-light" }} />
      {white ? <AbsoluteFill style={{ pointerEvents: "none", background: `rgba(255,240,210,${white})` }} /> : null}
      {captions ? <Captions words={words} y={0.72} /> : null}
      {audio ? <Audio src={staticFile("anime1/mix.wav")} /> : null}
    </AbsoluteFill>
  );
};
