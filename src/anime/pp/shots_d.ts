// The poker table, the saloon showdown, and decades later: the handshake and the stadium.
import * as THREE from "three";
import type { ShotSpec, ActorSpec, V3, Ctx } from "./engine";
import { nt, vt, v3, ease, talk, toArr } from "./engine";
import { STAND, walk, walkBob, aimR, laugh, hitBack, sprawl, seated, shake, gunsUp, withAim, dirL, dirR } from "./poses";

// saloon layout (helper 1): poker table at (-2.8, 0, -5.2), doors at z 9.1
const TABLE = v3(-2.8, 0, -5.2);
const seatAt = (a: number): V3 => [TABLE.x + Math.sin(a) * 0.95, -0.42, TABLE.z + Math.cos(a) * 0.95];
const faceTable = (p: V3) => Math.atan2(TABLE.x - p[0], TABLE.z - p[2]);
const SEAT1 = seatAt(Math.PI + 0.55), SEAT2 = seatAt(Math.PI / 2 + 0.7), SEAT3 = seatAt(-Math.PI / 2 + 0.4);
const swingDoors = (scene: THREE.Scene, opens: number[]) => { const L = scene.getObjectByName("saloonDoorL"), R = scene.getObjectByName("saloonDoorR"); const l0 = L?.rotation.y ?? 0, r0 = R?.rotation.y ?? 0;
  return (t: number) => { let a = 0; for (const o of opens) { const k = t - o; if (k > 0) a += Math.exp(-k * 2.2) * Math.sin(k * 9) * 1.1 * (k < 0.08 ? k / 0.08 : 1); } if (L) L.rotation.y = l0 + a; if (R) R.rotation.y = r0 - a; }; };
const flashAt = (key: string, shots: number[], size = 0.5) => (t: number, c: Ctx, f: { flash: (p: THREE.Vector3, s: number) => void; smoke: (p: THREE.Vector3, a: number, s?: number) => void }) => {
  for (const s of shots) { const a = t - s; if (a >= 0 && a < 0.07) f.flash(c.gunTip(key), a < 0.035 ? size : size * 0.6); if (a > 0) f.smoke(c.gunTip(key), a, 0.1); } };

// F2: ...someone shot him the night before for cheating at poker: smug over his cards, a flash from the dark, over he goes
const F2_SHOT = 1.05;
const F2: ShotSpec = { id: "F2", dur: 2.52, set: "saloon",
  actors: [{ key: "luc", char: "lucien", at: (t) => { const hit = t > F2_SHOT; const fall = nt([[F2_SHOT + 0.05, 0], [F2_SHOT + 0.55, -1.35, ease.in], [F2_SHOT + 0.62, -1.28], [F2_SHOT + 0.72, -1.35]], t);
    return { pos: [SEAT2[0], SEAT2[1] + (hit ? nt([[F2_SHOT, 0], [F2_SHOT + 0.5, 0.25]], t) : 0), SEAT2[2]], yaw: faceTable(SEAT2), fall, pose: hit ? withAim(seated, { leftUpperArm: dirL(0.9, 0.3, 0.1), rightUpperArm: dirR(0.9, 0.3, 0.1), leftLowerArm: dirL(0.6, 0.7, 0), rightLowerArm: dirR(0.6, 0.7, 0) }, { head: [-0.4, 0, 0] }) : withAim(seated, { rightUpperArm: dirR(0.2, -0.7, 0.65), rightLowerArm: dirR(-0.3, 0.3, 0.9) }),
      face: hit ? { Fcl_EYE_Surprised: 1, Fcl_MTH_O: 1, Fcl_BRW_Surprised: 1 } : { Fcl_MTH_Fun: 0.8, Fcl_EYE_Joy: 0.3, Fcl_BRW_Angry: 0.2 } }; } }],
  fx: (t, c, f) => { const a = t - F2_SHOT; if (a > -0.02 && a < 0.06) f.flash(v3(TABLE.x + 1.6, 1.35, TABLE.z + 2.4), 0.6); if (a > 0 && a < 0.06) f.streak(v3(TABLE.x + 1.6, 1.35, TABLE.z + 2.4), c.bone("luc", "chest"), a / 0.05);
    for (let i = 0; i < 10; i++) { const k = t - F2_SHOT - 0.05; if (k < 0 || k > 1.2) continue; const p = v3(TABLE.x + Math.sin(i) * 0.3, 0.85 + k * (2 + (i % 3)) - 4.9 * k * k, TABLE.z + Math.cos(i * 1.7) * 0.3); if (p.y > 0.05) f.shard(p, "#f4efe4", 0.07); } },
  white: (t) => (t > F2_SHOT && t < F2_SHOT + 0.04 ? 0.12 : 0),
  cam: (t) => ({ pos: vt([[0, [TABLE.x - 1.35, 1.3, TABLE.z + 1.15]], [2.52, [TABLE.x - 1.2, 1.32, TABLE.z + 1.0], ease.io]], t), look: [SEAT2[0], 0.95, SEAT2[2]], fov: 44, shake: t > F2_SHOT && t < F2_SHOT + 0.15 ? 0.01 : 0 }) };

// ---------- years later: the showdown ----------
const PETE_IN = (t: number): V3 => { const z = 10.6 - Math.min(t, 2.4) * 1.4; return [-0.1, walkBob(t * 1.6) * (t < 2.4 ? 1 : 0), z]; };
// J1: he walks into the saloon: the batwing doors burst open, moonlit street behind
const J1: ShotSpec = { id: "J1", dur: 2.78, set: "saloon",
  actors: [{ key: "pete", char: "pete", at: (t) => ({ pos: PETE_IN(t), yaw: Math.PI, pose: t < 2.4 ? walk(t * 1.6) : STAND, face: { Fcl_BRW_Angry: 0.6, Fcl_EYE_Angry: 0.4 } }) }],
  build: (scene) => swingDoors(scene, [0.3]),
  cam: (t) => ({ pos: vt([[0, [0.55, 1.35, 4.2]], [2.78, [0.45, 1.4, 3.6], ease.io]], t), look: [-0.1, 1.55, 8.6], fov: 40 }) };
// the killer's table: Silas seated, a gunman either side
const silasSeated = (o: { laughFrom?: number; talk?: [number, number]; slump?: number }): ActorSpec => ({ key: "silas", char: "silas", at: (t) => {
  const sl = o.slump !== undefined ? nt([[o.slump, 0], [o.slump + 0.35, 1, ease.in], [o.slump + 0.45, 0.93], [o.slump + 0.55, 1]], t) : 0;
  const base = o.laughFrom !== undefined && t > o.laughFrom && !sl ? laugh(seated, t) : seated;
  return { pos: SEAT1, yaw: faceTable(SEAT1), pose: sl ? withAim(seated, { leftUpperArm: dirL(0.3, -0.5, 0.8), rightUpperArm: dirR(0.3, -0.5, 0.8) }, { spine: [0.9 * sl, 0, 0], chest: [0.4 * sl, 0, 0], head: [0.3 * sl, 0, 0.2 * sl] }) : base,
    face: sl ? { Fcl_EYE_Close: 1, Fcl_MTH_O: 0.4 } : { Fcl_MTH_Joy: o.laughFrom !== undefined && t > o.laughFrom ? 0.9 : 0.4, Fcl_EYE_Joy: 0.3, Fcl_BRW_Angry: 0.7, ...(o.talk ? talk(t, o.talk[0], o.talk[1], 0.8) : {}) } }; } });
const G0: V3 = [-4.15, 0, -6.2], G1: V3 = [-2.0, 0, -6.55];
const gunmanAt = (i: number, o: { draw?: number; shots?: number[]; drop?: number; laughFrom?: number }): ActorSpec => ({ key: "g" + i, char: "gunman" + i, at: (t) => {
  const p = i ? G1 : G0; const drawn = o.draw !== undefined && t > o.draw; const dropped = o.drop !== undefined && t > o.drop; const k = (o.shots ?? []).reduce((m, s) => Math.max(m, t >= s ? Math.exp(-(t - s) * 11) : 0), 0);
  return { pos: [p[0], p[1] + (dropped && t > o.drop! + 0.35 ? 0.12 : 0), p[2]], yaw: Math.atan2(-0.1 - p[0], 2.0 - p[2]) + (i ? 0.1 : -0.1), fall: dropped ? nt([[o.drop!, 0], [o.drop! + 0.4, -Math.PI / 2, ease.in], [o.drop! + 0.48, -Math.PI / 2 + 0.06], [o.drop! + 0.58, -Math.PI / 2]], t) : 0, roll: dropped && i ? nt([[o.drop!, 0], [o.drop! + 0.4, -0.35]], t) : 0,
    pose: dropped ? (t < o.drop! + 0.4 ? hitBack(STAND) : sprawl) : drawn ? aimR(STAND, k * 0.4) : o.laughFrom !== undefined && t > o.laughFrom ? laugh(STAND, t + i) : STAND,
    gun: drawn, aim: drawn && !dropped ? [-0.1, 1.4, 2.0] : undefined, kick: k * 0.4, face: dropped ? { Fcl_EYE_Surprised: 1, Fcl_MTH_O: 1 } : { Fcl_MTH_Fun: 0.7, Fcl_BRW_Angry: 0.7 } }; } });
// J2: the killer laughs with two gunmen at his side
const J2: ShotSpec = { id: "J2", dur: 2.9, set: "saloon",
  actors: [silasSeated({ laughFrom: 0.2 }), gunmanAt(0, { laughFrom: 0.4 }), gunmanAt(1, { laughFrom: 0.3 })],
  cam: (t) => ({ pos: vt([[0, [-1.6, 1.6, -1.6]], [2.9, [-1.9, 1.55, -2.3], ease.io]], t), look: [-3.0, 1.15, -6.0], fov: 42 }) };
// J3: "You came all this way to die, kid?"
const J3: ShotSpec = { id: "J3", dur: 2.52, set: "saloon",
  actors: [silasSeated({ talk: [0.0, 2.15] }), gunmanAt(0, {}), gunmanAt(1, {})],
  cam: (t, c) => { const h = c.bone("silas", "head"); return { pos: toArr(h.clone().add(v3(0.35, 0.05, 1.05 - t * 0.12))), look: toArr(h.clone().add(v3(0, -0.02, 0))), fov: 32 }; } };
// K1: five shots: over his gun; the gunmen fire back
const PETE_POS: V3 = [-0.1, 0, 2.0], K1_SHOTS = [0.05, 0.22, 0.38, 0.55, 0.72];
const peteFiring = (shots: number[], aim: (t: number) => V3): ActorSpec => ({ key: "pete", char: "pete_armed", at: (t) => { const k = shots.reduce((m, s) => Math.max(m, t >= s ? Math.exp(-(t - s) * 12) : 0), 0);
  return { pos: PETE_POS, yaw: Math.atan2(TABLE.x - PETE_POS[0], TABLE.z - PETE_POS[2]), pose: aimR(STAND, k * 0.4), aim: aim(t), kick: k * 0.45, face: { Fcl_BRW_Angry: 0.9, Fcl_EYE_Angry: 0.6, Fcl_MTH_Angry: 0.3 } }; } });
const K1: ShotSpec = { id: "K1", dur: 1.32, set: "saloon",
  actors: [peteFiring(K1_SHOTS, (t) => (t < 0.3 ? [G0[0], 1.4, G0[2]] : t < 0.6 ? [G1[0], 1.4, G1[2]] : [SEAT1[0], 0.95, SEAT1[2]])), silasSeated({}), gunmanAt(0, { draw: -0.2, shots: [0.12] }), gunmanAt(1, { draw: -0.2, shots: [0.45] })],
  fx: (t, c, f) => { flashAt("pete", K1_SHOTS, 0.2)(t, c, f); flashAt("g0", [0.12], 0.4)(t, c, f); flashAt("g1", [0.45], 0.4)(t, c, f); },
  white: (t) => (K1_SHOTS.some((s) => t > s && t < s + 0.034) ? 0.08 : 0), hideHorseHead: () => null,
  cam: (t, c) => { const hand = c.bone("pete", "rightHand"); const pos = hand.clone().add(v3(0.25, 0.14, 0.45)); const dH = hand.clone().sub(pos).normalize(), dT = v3(-3, 1.2, -6).sub(pos).normalize();
    return { pos: toArr(pos), look: toArr(pos.clone().add(dH.multiplyScalar(0.4).add(dT.multiplyScalar(0.6)).normalize().multiplyScalar(10))), fov: 46, shake: K1_SHOTS.some((s) => t > s && t < s + 0.1) ? 0.008 : 0 }; } };
// K2: three men hit the floor
const K2: ShotSpec = { id: "K2", dur: 1.56, set: "saloon",
  actors: [silasSeated({ slump: 0.62 }), gunmanAt(0, { draw: -1, drop: 0.0 }), gunmanAt(1, { draw: -1, drop: 0.28 })],
  fx: (t, _c, f) => { for (const [x, z, d] of [[G0[0] - 0.9, G0[2], 0.42], [G1[0] - 0.9, G1[2], 0.7]] as [number, number, number][]) for (let k = 0; k < 3; k++) f.dust(v3(x + k * 0.3, 0.1, z), t - d - k * 0.03, 0.35); },
  cam: (t) => ({ pos: vt([[0, [-0.9, 1.3, -1.9]], [1.56, [-1.2, 1.15, -2.4], ease.out]], t), look: [-3.0, 0.8, -6.1], fov: 46, shake: t < 0.15 ? 0.006 : 0 }) };
// K3: the kid is bleeding, but he's still standing
const K3: ShotSpec = { id: "K3", dur: 3.02, set: "saloon",
  actors: [{ key: "pete", char: "pete_armed", at: (t) => { const br = Math.sin(t * 3.2) * 0.04; return { pos: PETE_POS, yaw: Math.atan2(TABLE.x - PETE_POS[0], TABLE.z - PETE_POS[2]) + 0.4, pose: withAim(STAND, { leftUpperArm: dirL(0.2, -0.8, 0.55), leftLowerArm: dirL(-0.75, 0.35, 0.5), rightUpperArm: dirR(0.2, -0.95, 0.2), rightLowerArm: dirR(0.1, -0.97, 0.2) }, { spine: [0.06 + br, 0, 0.04], head: [0.08 - br, 0, 0] }), face: { Fcl_BRW_Angry: 0.6, Fcl_EYE_Angry: 0.3, Fcl_MTH_Angry: 0.4 } }; } }],
  fx: (t, c, f) => { const sh = c.bone("pete", "rightUpperArm").clone().lerp(c.bone("pete", "rightShoulder"), 0.3).add(v3(0, 0, 0.0)); const toCam = v3(0, 0, 0); void toCam; f.blood(sh.add(v3(0.06, -0.05, 0.08)), 0.12 + Math.min(0.06, t * 0.03));
    for (let i = 0; i < 5; i++) f.smoke(v3(-0.6 + i * 0.4, 1.6 + (i % 2) * 0.3, 0.8 - i * 0.5), (t * 0.4 + i * 0.37) % 2.2, 0.5, "#9a90a0"); },
  cam: (t, c) => { const h = c.bone("pete", "chest"); return { pos: toArr(h.clone().add(v3(-1.1, 0.1, -2.6 + t * 0.25))), look: toArr(h.clone().add(v3(0, 0.15, 0))), fov: 34 }; } };
// K4: all six are dead: he walks out through the doors into the moonlight
const K4: ShotSpec = { id: "K4", dur: 1.82, set: "saloon",
  actors: [{ key: "pete", char: "pete", at: (t) => { const z = 6.2 + t * 1.5; return { pos: [-0.1, walkBob(t * 1.7), z], yaw: 0, pose: walk(t * 1.7, 0.8), face: { Fcl_BRW_Sorrow: 0.3 } }; } }],
  build: (scene) => swingDoors(scene, [1.5]),
  cam: () => ({ pos: [-0.6, 1.55, 1.6], look: [-0.1, 1.5, 9.5], fov: 40 }) };

// ---------- decades later ----------
// L1: a college makes the old gunfighter its mascot: the handshake on the lawn
const L1: ShotSpec = { id: "L1", dur: 3.76, set: "campus",
  actors: [{ key: "pete", char: "pete_old", at: (t) => ({ pos: [-0.48, 0, 0], yaw: Math.PI / 2, pose: shake(withAim(STAND, {}, { spine: [0.08, 0, 0] }), t), face: { Fcl_MTH_Fun: 0.5, Fcl_EYE_Joy: 0.2 } }) },
    { key: "dean", char: "dean", at: (t) => ({ pos: [0.48, 0, 0], yaw: -Math.PI / 2, pose: shake(STAND, t), face: { Fcl_MTH_Joy: 0.7, Fcl_EYE_Joy: 0.5, ...talk(t, 0.3, 2.8, 0.7) } }) }],
  cam: (t) => ({ pos: vt([[0, [2.4, 1.5, 4.8]], [3.76, [1.9, 1.48, 3.9], ease.io]], t), look: [-0.2, 1.4, 0], fov: 36 }) };
// L2-L4: the stadium: the mascot fires up the crowd
const MASCOT = (t: number): ActorSpec => ({ key: "m", char: "mascot", at: (tt) => { const t2 = tt + t; const hop = Math.abs(Math.sin(t2 * 4.2)) * 0.18;
  return { pos: [0, hop, -21.5], yaw: Math.sin(t2 * 0.9) * 0.25, pose: withAim(gunsUp(STAND, t2), { leftUpperLeg: dirL(0.15, -1, hop * 0.8), rightUpperLeg: dirR(0.15, -1, hop * 0.8) }), face: { Fcl_MTH_Joy: 1, Fcl_EYE_Joy: 0.4 } }; } });
const L2: ShotSpec = { id: "L2", dur: 1.82, set: "stadium", actors: [MASCOT(0)], cam: (t) => ({ pos: vt([[0, [1.4, 0.7, -13.0]], [1.82, [0.9, 0.85, -15.2], ease.io]], t), look: [0, 1.8, -21.5], fov: 42 }) };
const L3: ShotSpec = { id: "L3", dur: 2.63, set: "stadium", actors: [], cam: (t) => ({ pos: [-2.5, 2.2, -21.5], look: vt([[0, [-3.5, 8.5, -36]], [2.63, [6.5, 8.5, -36], ease.io]], t), fov: 44 }) };
const L4: ShotSpec = { id: "L4", dur: 4.67, set: "stadium", actors: [MASCOT(4)],
  black: (t) => nt([[3.9, 0], [4.67, 1]], t),
  cam: (t) => ({ pos: vt([[0, [0.6, 1.1, -14.0]], [4.67, [0.2, 1.7, -18.6], ease.io]], t), look: vt([[0, [0, 1.8, -21.5]], [4.67, [0, 2.0, -21.5]]], t), fov: 40 }) };

export const ACT_D: { at: number; spec: ShotSpec }[] = [
  { at: 59.18, spec: F2 },
  { at: 77.1, spec: J1 }, { at: 79.88, spec: J2 }, { at: 82.78, spec: J3 }, { at: 85.3, spec: K1 }, { at: 86.62, spec: K2 }, { at: 88.18, spec: K3 }, { at: 91.2, spec: K4 },
  { at: 93.02, spec: L1 }, { at: 96.78, spec: L2 }, { at: 98.6, spec: L3 }, { at: 101.23, spec: L4 },
];
