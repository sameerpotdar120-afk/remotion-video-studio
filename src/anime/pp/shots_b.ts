// Act 2 + 3: the fort test, the hunt at the cabin, the long ride, the funeral, the last one running.
import * as THREE from "three";
import type { ShotSpec, ActorSpec, V3, Ctx } from "./engine";
import { nt, vt, v3, ease, talk, toArr, lerp3 } from "./engine";
import { STAND, RIDE, walk, walkBob, aimR, hover, laugh, pointR, hitBack, sprawl, coffin, stoop, withAim, dirL, dirR } from "./poses";
import { targetRail } from "./props";
import { toon, withInk } from "../kit";

const PETE_HORSE = { coat: "#7a4a2c", mane: "#2a1a12", saddle: "#4a2e1c", blanket: "#3a5a8a", blaze: true };
const DET = { Fcl_BRW_Angry: 0.6, Fcl_EYE_Angry: 0.35 };
const kickAt = (t: number, shots: number[], k = 11) => shots.reduce((m, s) => Math.max(m, t >= s ? Math.exp(-(t - s) * k) : 0), 0);
const flashes = (key: string, shots: number[], size = 0.5) => (t: number, c: Ctx, f: { flash: (p: THREE.Vector3, s: number) => void; smoke: (p: THREE.Vector3, a: number, s?: number) => void }) => {
  for (const s of shots) { const a = t - s; if (a >= 0 && a < 0.07) f.flash(c.gunTip(key), a < 0.035 ? size : size * 0.6); if (a > 0) f.smoke(c.gunTip(key), a, 0.1); } };
const fallBack = (t: number, t0: number, dur = 0.32) => nt([[t0, 0], [t0 + dur, -Math.PI / 2, ease.in], [t0 + dur + 0.07, -Math.PI / 2 + 0.07, ease.out], [t0 + dur + 0.18, -Math.PI / 2, ease.in]], t);

// ================= the fort =================
const FZ = 30; // gate line
// D1: at fifteen he walks in through the open gate; camera backs away in front of him, soldiers come into view
const D1: ShotSpec = { id: "D1", dur: 3.34, set: "fort",
  actors: [
    { key: "pete", char: "pete15", at: (t) => { const z = FZ + 3 - t * 1.95; const ph = (FZ + 3 - z) / 1.45; return { pos: [0.3, walkBob(ph), z], yaw: Math.PI, pose: walk(ph, 0.9), face: DET }; } },
    { key: "s0", char: "soldier0", at: (t) => ({ pos: [-2.4, 0, 24.6], yaw: 0.5, pose: withAim(STAND, { leftUpperArm: dirL(0.4, -0.85, -0.3), leftLowerArm: dirL(-0.6, -0.2, -0.5), rightUpperArm: dirR(0.4, -0.85, -0.3), rightLowerArm: dirR(-0.6, -0.2, -0.5) }), face: { Fcl_MTH_Fun: 0.5 + Math.sin(t * 3) * 0.1 } }) },
    { key: "s2", char: "soldier2", at: () => ({ pos: [2.6, 0, 24.2], yaw: -0.6, pose: STAND, face: { Fcl_MTH_Fun: 0.6 } }) }],
  cam: (t) => { const z = FZ + 3 - t * 1.95; return { pos: [0.55, 1.25, z - nt([[0, 4.2], [3.34, 3.4]], t)], look: [0.25, 1.55, z], fov: 34 }; } };

// D2: the soldiers laugh; the big one points: "Go home, kid!"
const SOLD: [string, V3, number][] = [["soldier0", [-1.5, 0, 23.0], 0.25], ["soldier1", [0.1, 0, 22.4], 0.05], ["soldier2", [1.6, 0, 23.1], -0.3]];
const D2: ShotSpec = { id: "D2", dur: 2.6, set: "fort",
  actors: [
    ...SOLD.map(([char, pos, yaw], i): ActorSpec => ({ key: "s" + i, char, at: (t) => { const big = i === 1, yell = t > 1.44 && t < 2.2;
      return { pos, yaw, pose: big && yell ? pointR(laugh(STAND, t * 0.4), [-0.05, 0.05, 1]) : laugh(STAND, t + i * 0.37), face: { Fcl_MTH_Joy: 0.9, Fcl_EYE_Joy: 0.6, ...(big && yell ? talk(t, 1.44, 2.14, 1) : {}) } }; } })),
    { key: "pete", char: "pete15", at: () => ({ pos: [0.3, 0, 26.6], yaw: Math.PI, pose: STAND, face: DET }) }],
  cam: (t) => ({ pos: vt([[0, [0.95, 1.85, 28.9]], [2.6, [0.85, 1.8, 28.4], ease.io]], t), look: [0.05, 1.45, 22.6], fov: 34 }) };

// D3a: he outshoots every one of them: six fast shots, six bottles burst down the rail
const TZ = -27, SHOOT: V3 = [0, 0, -16], D3_SHOTS = [0.25, 0.47, 0.69, 0.91, 1.13, 1.35];
let railD3: ReturnType<typeof targetRail> | null = null;
const D3a: ShotSpec = { id: "D3a", dur: 1.5, set: "fort",
  actors: [{ key: "pete", char: "pete15_armed", at: (t) => { const k = kickAt(t, D3_SHOTS); const i = Math.min(5, Math.max(0, Math.floor((t - 0.15) / 0.22)));
    return { pos: SHOOT, yaw: Math.PI, pose: aimR(STAND, k * 0.4), aim: [(i - 2.5) * 0.42, 1.25, TZ], kick: k * 0.5, face: DET }; } }],
  build: (scene) => { railD3 = targetRail(scene, v3(0, 0, TZ), 0, D3_SHOTS.map((s, i) => ({ hit: s + 0.04, color: ["#3f8a5a", "#8a5a2c", "#5a7a9a"][i % 3], kind: "bottle" as const }))); return railD3.update; },
  fx: (t, c, f) => { flashes("pete", D3_SHOTS)(t, c, f); railD3?.fx(t, f); },
  cam: (t) => ({ pos: vt([[0, [0.42, 1.7, -14.4]], [1.5, [0.38, 1.68, -14.9], ease.io]], t), look: [-0.2, 1.15, TZ], fov: 32 }) };
// D3b: their jaws drop
const D3b: ShotSpec = { id: "D3b", dur: 1.1, set: "fort",
  actors: SOLD.map(([char], i): ActorSpec => ({ key: "s" + i, char, at: (t) => ({ pos: [-1.0 + i * 0.95, 0, -12.6 - (i % 2) * 0.3], yaw: Math.PI - 0.4 + i * 0.2, pose: withAim(STAND, {}, { head: [-0.1 - nt([[0, 0], [0.25, 0.08]], t), 0, 0], spine: [-0.06, 0, 0] }), face: { Fcl_MTH_O: nt([[0, 0.3], [0.2, 1]], t), Fcl_EYE_Surprised: 1, Fcl_BRW_Surprised: 1 } }) })),
  cam: (t) => ({ pos: vt([[0, [0.0, 1.6, -15.6]], [1.1, [0.0, 1.62, -15.0], ease.out]], t), look: [0, 1.55, -12.7], fov: 34 }) };
// D4: the colonel claps him on the shoulder and names him
const D4: ShotSpec = { id: "D4", dur: 2.5, set: "fort",
  actors: [
    { key: "pete", char: "pete15", at: (t) => ({ pos: [-0.35, 0, -16], yaw: Math.PI - 0.35, pose: STAND, face: { Fcl_MTH_Fun: nt([[1.2, 0], [1.8, 0.45]], t), Fcl_BRW_Angry: 0.2 } }) },
    { key: "col", char: "colonel", at: (t) => ({ pos: [0.45, 0, -15.75], yaw: Math.PI + 0.75, pose: withAim(STAND, { leftUpperArm: dirL(0.25, -0.45, 0.85), leftLowerArm: dirL(-0.2, -0.3, 0.95), leftHand: dirL(-0.2, -0.5, 0.85) }, { spine: [-0.05, 0, 0], head: [-0.05, 0.25, 0] }),
      face: { Fcl_MTH_Joy: 0.6, Fcl_EYE_Joy: 0.5, ...talk(t, 0.5, 2.0, 0.8) } }) }],
  cam: (t) => ({ pos: vt([[0, [0.25, 1.55, -19.2]], [2.5, [0.15, 1.6, -18.5], ease.io]], t), look: [0.05, 1.5, -15.9], fov: 32 }) };

// ================= the hunt =================
// E1: close on his face, hat brim low: now he goes hunting (farm at dusk)
const E1: ShotSpec = { id: "E1", dur: 1.68, set: "farm:sunset",
  actors: [{ key: "pete", char: "pete15", at: (t) => ({ pos: [2, 0, 24], yaw: Math.PI * 0.06, pose: withAim(STAND, {}, { head: [0.08 - t * 0.02, 0, 0] }), face: { Fcl_BRW_Angry: 0.8, Fcl_EYE_Angry: 0.5, Fcl_MTH_Angry: 0.2 } }) }],
  cam: (t) => ({ pos: vt([[0, [2.12, 1.48, 25.25]], [1.68, [2.1, 1.48, 24.85], ease.io]], t), look: [2.0, 1.5, 24], fov: 30 }) };

// cabin: door at (0, 0.38, 3.1); porch front z 4.75; the track runs out along +z
const BASE = 0.38, DOOR: V3 = [0, BASE, 2.95];
const trackX = (z: number) => Math.sin((z - 4) * 0.045) * 3.2 * Math.min(1, Math.max(0, (z - 4) / 12));
// E2: two of the killers hiding in a cabin: push in from the track to the lit window
const E2: ShotSpec = { id: "E2", dur: 2.38, set: "cabin", grade: "night", actors: [],
  cam: (t) => { const k = ease.io(Math.min(1, t / 2.38)); return { pos: lerp3([trackX(30) + 0.6, 1.9, 30], [-2.45, 1.95, 7.6], k), look: lerp3([0, 2.6, 2], [-1.8, 1.85, 2.6], k), fov: nt([[0, 36], [2.38, 30]], t) }; } };
// E3: the kid rides up slowly
const riderZ = (t: number) => 21 - t * 1.6;
const E3: ShotSpec = { id: "E3", dur: 1.96, set: "cabin", grade: "night",
  actors: [{ key: "pete", char: "pete15", horse: PETE_HORSE, at: (t) => { const z = riderZ(t); return { pos: [trackX(z), 0, z], yaw: Math.PI + 0.05, pose: RIDE, face: DET, horse: { speed: 1.6, dist: (21 - z) } }; } }],
  cam: (t) => { const z = riderZ(t); return { pos: [trackX(z) + 1.3, 0.75, z + 3.2], look: [trackX(z) - 0.3, 2.0, z - 6], fov: 38 }; } };
// E4: one of them runs out onto the porch and grabs the rifle by the door
let rifleE: THREE.Group | null = null, setRifle: THREE.Object3D | null = null;
const makeRifle = (scene: THREE.Scene) => { const g = new THREE.Group(); const wood = toon("#7a4a2c", { shade: 0.5 }), metal = toon("#4a4e5a", { rim: 0.45 });
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.11, 0.05), wood); stock.position.x = -0.32; withInk(stock, 0.003); g.add(stock);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.75, 8), metal); bar.rotation.z = Math.PI / 2; bar.position.x = 0.18; withInk(bar, 0.002); g.add(bar);
  const fore = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.045, 0.04), wood); fore.position.set(0.05, -0.02, 0); g.add(fore); scene.add(g); return g; };
const hideSetRifle = (scene: THREE.Scene) => { scene.traverse((o) => { if (o.type === "Group" && Math.abs(o.position.x - 0.85) < 0.01 && Math.abs(o.position.y - (BASE + 0.04)) < 0.02) setRifle = o; }); };
const holdRifle = (c: Ctx, key: string, aimAt?: THREE.Vector3) => { if (!rifleE) return; const r = c.bone(key, "rightHand"), l = c.bone(key, "leftHand"); rifleE.position.copy(r.clone().lerp(l, 0.35));
  const dir = aimAt ? aimAt.clone().sub(rifleE.position).normalize() : l.clone().sub(r).normalize(); rifleE.quaternion.setFromUnitVectors(v3(1, 0, 0), dir); };
const BRAM_GRAB = 1.75;
const bramRun = (t: number): { pos: V3; yaw: number; ph: number; running: boolean } => {
  if (t < 0.35) return { pos: [DOOR[0], BASE, DOOR[2] - 0.6], yaw: 0, ph: 0, running: false };
  const p1: V3 = [0.2, BASE, 4.25], p2: V3 = [0.75, BASE, 3.25];
  if (t < 1.05) { const k = (t - 0.35) / 0.7; return { pos: lerp3([DOOR[0], BASE, DOOR[2] - 0.6], p1, ease.out(k)), yaw: 0, ph: k * 1.6, running: true }; }
  if (t < BRAM_GRAB) { const k = (t - 1.05) / (BRAM_GRAB - 1.05); return { pos: lerp3(p1, p2, ease.io(k)), yaw: nt([[1.05, 0], [1.3, Math.PI * 0.85]], t), ph: 1.6 + k, running: true }; }
  return { pos: p2, yaw: nt([[BRAM_GRAB, Math.PI * 0.85], [BRAM_GRAB + 0.5, 0.1]], t), ph: 0, running: false };
};
const bramPose = (t: number) => { const b = bramRun(t); const p = b.running ? walk(b.ph, 1.3) : STAND;
  const raise = nt([[BRAM_GRAB, 0], [BRAM_GRAB + 0.9, 1, ease.io]], t);
  return t < BRAM_GRAB ? p : withAim(STAND, { rightUpperArm: dirR(0.35, -0.6 + raise * 0.5, 0.7), rightLowerArm: dirR(-0.4, -0.3 + raise * 0.3, 0.86), leftUpperArm: dirL(0.15, -0.55 + raise * 0.5, 0.82), leftLowerArm: dirL(-0.6, -0.1 + raise * 0.35, 0.8) }, { spine: [0.1, 0, 0] }); };
const E4: ShotSpec = { id: "E4", dur: 3.1, set: "cabin", grade: "night",
  actors: [{ key: "bram", char: "bram", at: (t) => { const b = bramRun(t); return { pos: b.pos, yaw: b.yaw, pose: bramPose(t), face: { Fcl_BRW_Angry: 1, Fcl_EYE_Angry: 0.6, Fcl_MTH_Angry: 0.6 } }; } }],
  build: (scene) => { rifleE = makeRifle(scene); hideSetRifle(scene); return (t) => { if (setRifle) setRifle.visible = t < BRAM_GRAB; rifleE!.visible = t >= BRAM_GRAB; }; },
  post: (t, c) => { if (t >= BRAM_GRAB) holdRifle(c, "bram"); },
  cam: (t) => ({ pos: vt([[0, [1.7, 1.15, 9.0]], [3.1, [1.3, 1.2, 8.2], ease.io]], t), look: vt([[0, [0.1, 1.7, 3.2]], [3.1, [0.6, 1.7, 3.5], ease.io]], t), fov: 34 }) };
// E5: too slow: over the kid's shoulder, the rifle is still coming up
const KID_STOP: V3 = [trackX(9.2), 0, 9.2];
const kidMounted = (aimAt: () => V3 | undefined, shots: number[], gun: (t: number) => boolean): ActorSpec => ({ key: "pete", char: "pete15_armed", horse: PETE_HORSE, at: (t) => { const k = kickAt(t, shots); const a = aimAt();
  return { pos: KID_STOP, yaw: Math.PI + 0.06, pose: gun(t) ? aimR(RIDE, k * 0.4) : hover(RIDE), gun: gun(t), aim: a, kick: k * 0.5, face: DET, horse: { speed: 0, dist: 0 } }; } });
const E5: ShotSpec = { id: "E5", dur: 0.92, set: "cabin", grade: "night",
  actors: [{ key: "bram", char: "bram", at: (t) => ({ pos: [0.75, BASE, 3.25], yaw: 0.1, pose: bramPose(BRAM_GRAB + 0.45 + t * 0.4), face: { Fcl_BRW_Angry: 1, Fcl_EYE_Angry: 0.6, Fcl_MTH_Angry: 0.6 } }) },
    kidMounted(() => undefined, [], () => false)],
  build: (scene) => { rifleE = makeRifle(scene); hideSetRifle(scene); return () => { if (setRifle) setRifle.visible = false; }; },
  post: (_t, c) => holdRifle(c, "bram"),
  cam: (t, c) => { const h = c.bone("pete", "head"); return { pos: toArr(h.clone().add(v3(0.55, 0.15, 1.1 - t * 0.2))), look: [0.7, 1.7, 3.3], fov: 32 }; } };
// E6: the kid shoots first: low on Bram, he's thrown back through the doorway, flat on his back
const E6_HIT = 0.2;
const E6: ShotSpec = { id: "E6", dur: 1.62, set: "cabin", grade: "night",
  actors: [{ key: "bram", char: "bram", at: (t) => ({ pos: [0.75, BASE + (t > E6_HIT + 0.3 ? 0.12 : 0), 3.25 - nt([[E6_HIT, 0], [E6_HIT + 0.3, 0.35, ease.out]], t)], yaw: 0.1, fall: fallBack(t, E6_HIT + 0.08, 0.34), pose: t < E6_HIT ? bramPose(BRAM_GRAB + 0.9) : t < E6_HIT + 0.42 ? hitBack(STAND) : sprawl,
    face: (t < E6_HIT ? { Fcl_BRW_Angry: 1, Fcl_MTH_Angry: 0.6 } : { Fcl_EYE_Surprised: 1, Fcl_MTH_O: 1, Fcl_BRW_Surprised: 1 }) as Record<string, number> }) }],
  build: (scene) => { rifleE = makeRifle(scene); hideSetRifle(scene); return (t) => { if (setRifle) setRifle.visible = false; if (t > E6_HIT && rifleE) { rifleE.visible = true; } }; },
  post: (t, c) => { if (!rifleE) return; if (t < E6_HIT) holdRifle(c, "bram"); else { const a = t - E6_HIT; rifleE.position.set(0.95 + a * 1.2, Math.max(BASE + 0.05, 1.5 + a * 2.5 - 4.9 * a * a), 3.4 + a * 0.4); rifleE.rotation.set(a * 6, 0.4, a * 9); } },
  fx: (t, _c, f) => { const a = t - (E6_HIT - 0.06); if (a > 0 && a < 0.08) f.streak(v3(2.5, 1.7, 9), v3(0.75, 1.55, 3.4), a / 0.06); },
  white: (t) => (t > E6_HIT - 0.06 && t < E6_HIT - 0.02 ? 0.15 : 0),
  cam: (t) => ({ pos: vt([[0, [0.6, 0.75, 6.2]], [1.62, [0.6, 0.85, 5.6], ease.out]], t), look: vt([[0, [0.75, 1.85, 3.25]], [1.0, [0.7, 0.9, 2.6], ease.io]], t), fov: 38, shake: t > E6_HIT && t < E6_HIT + 0.2 ? 0.02 : 0 }) };
// E7: the second one reaches for his gun in the doorway; the kid's gun in the foreground drops him too
const E7_DRAW = 0.75, E7_SHOT = 2.2;
const E7: ShotSpec = { id: "E7", dur: 3.86, set: "cabin", grade: "night",
  actors: [
    { key: "jory", char: "jory_armed", at: (t) => { const reach = nt([[0.4, 0], [E7_DRAW, 1, ease.out]], t); const up = nt([[E7_DRAW + 0.3, 0], [E7_SHOT, 0.8, ease.in]], t);
      return { pos: [-0.05, BASE, 3.05 - (t > E7_SHOT ? nt([[E7_SHOT, 0], [E7_SHOT + 0.3, 0.4, ease.out]], t) : 0)], yaw: 0.05, fall: fallBack(t, E7_SHOT + 0.1, 0.36), lift: t > E7_SHOT + 0.4 ? 0.12 : 0,
        pose: t > E7_SHOT ? (t < E7_SHOT + 0.45 ? hitBack(STAND) : sprawl) : reach < 0.5 ? STAND : up > 0.05 ? aimR(STAND, -0.4 * (1 - up)) : hover(STAND), gun: t > E7_DRAW + 0.25, aim: t > E7_DRAW + 0.3 && t < E7_SHOT ? [KID_STOP[0], 2.4 - (1 - up) * 2, KID_STOP[2]] : undefined,
        face: (t < E7_SHOT ? { Fcl_MTH_Fun: 0.9, Fcl_EYE_Angry: 0.5, Fcl_BRW_Angry: 0.8 } : { Fcl_EYE_Surprised: 1, Fcl_MTH_O: 1 }) as Record<string, number> }; } },
    kidMounted(() => [0, 1.5, 3.1], [E7_SHOT], () => true)],
  fx: (t, c, f) => flashes("pete", [E7_SHOT], 0.45)(t, c, f),
  hideHorseHead: () => "pete",
  cam: (t, c) => { const hand = c.bone("pete", "rightHand"); const pos = hand.clone().add(v3(0.12, 0.12, 0.42)); const dH = hand.clone().sub(pos).normalize(), dT = v3(0, 1.5, 3.1).sub(pos).normalize();
    return { pos: toArr(pos), look: toArr(pos.clone().add(dH.multiplyScalar(0.4).add(dT.multiplyScalar(0.6)).normalize().multiplyScalar(10))), fov: 44, shake: t > E7_SHOT && t < E7_SHOT + 0.12 ? 0.008 : 0 }; } };
// E8: two down, four to go: close, smoke curling off the barrel held up by his face
const E8: ShotSpec = { id: "E8", dur: 1.52, set: "cabin", grade: "night",
  actors: [{ key: "pete", char: "pete15_armed", horse: PETE_HORSE, at: () => ({ pos: KID_STOP, yaw: Math.PI + 0.06, pose: withAim(RIDE, { rightUpperArm: dirR(0.78, -0.5, 0.3), rightLowerArm: dirR(-0.22, 0.97, 0.12, -1.3), rightHand: dirR(-0.1, 1, 0.08, 0) }), face: DET, horse: { speed: 0, dist: 0 } }) }],
  fx: (t, c, f) => { for (let i = 0; i < 6; i++) f.smoke(c.gunTip("pete").add(v3(Math.sin(t * 2 + i) * 0.03, i * 0.05, 0)), (t * 0.5 + i * 0.25) % 1.6, 0.06); },
  cam: (t, c) => { const h = c.bone("pete", "head"); return { pos: toArr(h.clone().add(v3(0.25, -0.05, -1.25 + t * 0.15))), look: toArr(h.clone().add(v3(-0.08, -0.05, 0))), fov: 32 }; } };

// ================= the long ride =================
// F1: he rides for days: silhouette at a gallop against the setting sun
const F1: ShotSpec = { id: "F1", dur: 3.44, set: "farm:sunset",
  actors: [{ key: "pete", char: "pete15", horse: PETE_HORSE, at: (t) => ({ pos: [-14 + t * 8, 0, -30], yaw: Math.PI / 2, pose: RIDE, face: DET, horse: { speed: 8, dist: t * 8 } }) }],
  cam: (t) => ({ pos: [-14 + t * 8 - 1.5, 1.0, -21.5], look: [-14 + t * 8 + 0.6, 2.2, -30], fov: 36 }) };

// ================= the funeral =================
// G1: overhead on the open coffin: the third one, laid out; the kid leans in with the barrel, just to make sure
const COF: V3 = [1.4, 0.06, 0.82];
const G1: ShotSpec = { id: "G1", dur: 3.9, set: "graveyard",
  actors: [
    { key: "luc", char: "lucien", at: () => ({ pos: COF, yaw: 0, fall: -Math.PI / 2, lift: 0.12, pose: coffin, face: { Fcl_EYE_Close: 1 } }) },
    { key: "pete", char: "pete15_armed", at: (t) => { const lean = nt([[0.8, 0], [1.6, 1, ease.io], [3.0, 1], [3.6, 0.2]], t);
      return { pos: [2.55, 0, 0.05], yaw: -Math.PI / 2, pose: withAim(STAND, { rightUpperArm: dirR(0.15, -0.6, 0.8), rightLowerArm: dirR(-0.1, -0.75 - lean * 0.1, 0.65), rightHand: dirR(0, -0.8, 0.6, 0) }, { spine: [0.35 * lean, 0, 0], chest: [0.15 * lean, 0, 0], head: [0.25 * lean, 0, 0] }), face: { Fcl_BRW_Angry: 0.5, Fcl_EYE_Angry: 0.3 } }; } },
    { key: "m1", char: "amos", at: () => ({ pos: [2.9, 0, -1.3], yaw: -Math.PI / 2 - 0.3, pose: stoop(withAim(STAND, { leftUpperArm: dirL(0.2, -0.8, 0.55), leftLowerArm: dirL(-0.7, 0.1, 0.7) }), 0.8), face: { Fcl_BRW_Sorrow: 0.8 } }) },
    { key: "m2", char: "dean", at: () => ({ pos: [2.85, 0, 1.45], yaw: -Math.PI / 2 + 0.3, pose: STAND, face: { Fcl_BRW_Sorrow: 0.5, Fcl_MTH_Down: 0.4 } }) }],
  cam: (t) => { const a = t * 0.1; return { pos: [1.55 + Math.sin(a) * 0.6, nt([[0, 6.4], [3.9, 4.8, ease.io]], t), 0.4 + Math.cos(a) * 0.6], look: [1.6, 0, 0.3], fov: 40 }; } };
// G2: three down: he touches his hat brim and walks off
const G2: ShotSpec = { id: "G2", dur: 1.36, set: "graveyard",
  actors: [{ key: "pete", char: "pete15", at: (t) => { const k = nt([[0, 0], [0.35, 1], [0.75, 0]], t); const w = Math.max(0, t - 0.6); const ph = w * 1.3;
    return { pos: [2.55 + w * 1.6, walkBob(ph) * (w > 0 ? 1 : 0), 0.05 + w * 0.6], yaw: w > 0 ? Math.PI / 2 - 0.35 : -Math.PI / 2 + 0.6, pose: w > 0 ? walk(ph) : withAim(STAND, { rightUpperArm: dirR(0.6, 0.1 * k - 0.6 * (1 - k), 0.4), rightLowerArm: dirR(-0.3, 0.9 * k - 0.6 * (1 - k), 0.3) }), face: DET }; } }],
  cam: (t) => ({ pos: vt([[0, [-0.6, 1.5, 3.4]], [1.36, [-0.4, 1.5, 3.6], ease.io]], t), look: vt([[0, [2.55, 1.45, 0.2]], [1.36, [3.6, 1.4, 0.6], ease.io]], t), fov: 34 }) };

// ================= the last one runs =================
// I0: one left: Silas, older, in the dark, eyes sliding sideways
const I0: ShotSpec = { id: "I0", dur: 0.92, set: "farm:night", grade: "night",
  actors: [{ key: "silas", char: "silas", at: (t) => ({ pos: [0, 0, 30], yaw: Math.PI, pose: withAim(STAND, {}, { head: [0.05, nt([[0, 0], [0.6, 0.35]], t), 0] }), face: { Fcl_BRW_Angry: 0.6, Fcl_EYE_Angry: 0.2, Fcl_MTH_Down: 0.5 } }) }],
  cam: (t) => ({ pos: vt([[0, [0.1, 1.82, 28.6]], [0.92, [0.08, 1.82, 28.85], ease.io]], t), look: [0, 1.85, 30], fov: 30 }) };
// I1: he runs far out west: the black horse at full gallop into the sunset
const I1: ShotSpec = { id: "I1", dur: 2.58, set: "farm:sunset",
  actors: [{ key: "silas", char: "silas", horse: "silas", at: (t) => ({ pos: [2 + Math.sin(t) * 0.3, 0, 20 - t * 9], yaw: Math.PI, pose: withAim(RIDE, {}, { spine: [0.2, 0, 0] }), horse: { speed: 9, dist: t * 9 } }) }],
  cam: (t) => ({ pos: [3.4, 1.6, 26 - t * 4], look: [2, 2.0, 20 - t * 9], fov: 34 }) };

export const ACT_B: { at: number; spec: ShotSpec }[] = [
  { at: 27.66, spec: D1 }, { at: 31.0, spec: D2 }, { at: 33.6, spec: D3a }, { at: 35.1, spec: D3b }, { at: 36.2, spec: D4 },
  { at: 38.7, spec: E1 }, { at: 40.38, spec: E2 }, { at: 42.76, spec: E3 }, { at: 44.72, spec: E4 }, { at: 47.82, spec: E5 }, { at: 48.74, spec: E6 }, { at: 50.36, spec: E7 }, { at: 54.22, spec: E8 },
  { at: 55.74, spec: F1 }, { at: 61.7, spec: G1 }, { at: 65.6, spec: G2 }, { at: 73.6, spec: I0 }, { at: 74.52, spec: I1 },
];
void pointR;
