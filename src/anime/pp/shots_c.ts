// Town: the flashback (the father speaking out), and the brothers' duel in the street.
import type { ShotSpec, ActorSpec, V3 } from "./engine";
import { nt, vt, v3, ease, talk, toArr, hash } from "./engine";
import { STAND, walk, walkBob, aimR, hover, fistUp, hitBack, sprawl, withAim, dirR } from "./poses";
import { crowd } from "./props";

// ---------- flashback: Thomas speaks from the saloon boardwalk, the town listens; Silas is in the crowd ----------
const SPEAK: V3 = [7.1, 0.4, 6.0];
const people: [number, number, number][] = []; for (let i = 0; i < 16; i++) people.push([3.2 + (i % 4) * 0.85 + hash(i) * 0.3, 0, 3.6 + Math.floor(i / 4) * 1.1 + hash(i + 9) * 0.3]);
const thomasSpeaks = (k0: number): ActorSpec => ({ key: "thomas", char: "thomas", at: (t) => ({ pos: SPEAK, yaw: -Math.PI / 2, pose: fistUp(STAND, nt([[0, k0], [0.4, 1, ease.out]], t)), face: { Fcl_BRW_Angry: 0.6, Fcl_EYE_Angry: 0.2, ...talk(t, 0, 3, 0.85) } }) });
const B1: ShotSpec = { id: "B1", dur: 2.2, set: "town", grade: "flashback",
  actors: [thomasSpeaks(0.3)], build: (scene) => crowd(scene, people, Math.PI / 2),
  cam: (t) => ({ pos: vt([[0, [1.6, 1.45, 6.4]], [2.2, [2.1, 1.5, 6.3], ease.io]], t), look: [7.1, 2.35, 6.0], fov: 34 }) };
const B2: ShotSpec = { id: "B2", dur: 2.1, set: "town", grade: "flashback",
  actors: [thomasSpeaks(1), { key: "silas", char: "silas", at: () => ({ pos: [4.4, 0, 6.3], yaw: Math.PI / 2 - 0.15, pose: STAND, face: { Fcl_BRW_Angry: 0.8 } }) }],
  build: (scene) => crowd(scene, people.filter((_p, i) => i !== 6), Math.PI / 2),
  cam: (t) => ({ pos: vt([[0, [3.1, 1.75, 6.55]], [2.1, [3.25, 2.0, 6.4], ease.io]], t), look: vt([[0, [7.1, 2.3, 6.0]], [2.1, [7.1, 2.45, 6.0], ease.io]], t), fov: 34 }) };
const B3: ShotSpec = { id: "B3", dur: 0.36, set: "town", grade: "flashback",
  actors: [{ key: "silas", char: "silas", at: (t) => ({ pos: [4.4, 0, 6.3], yaw: Math.PI / 2 - 0.15, pose: STAND, face: { Fcl_BRW_Angry: 1, Fcl_EYE_Angry: nt([[0, 0.3], [0.3, 0.85]], t) } }) }],
  cam: (t, c) => { const h = c.bone("silas", "head"); return { pos: toArr(h.clone().add(v3(0.42, 0.02, -0.05))), look: toArr(h.clone().add(v3(0, 0.03, 0))), fov: nt([[0, 26], [0.36, 22]], t) }; } };

// ---------- the brothers: called out of the saloon, both draw, both drop ----------
const PETE: V3 = [-6, 0, 0], TW: [string, V3][] = [["abel_armed", [4.5, 0, 0.75]], ["cain_armed", [4.6, 0, -0.75]]];
const DOOR_X = 7.6;
const twinWalk = (i: number, t: number, t0: number) => { const k = Math.min(1, Math.max(0, (t - t0) / 1.4)); const x = DOOR_X - (DOOR_X - TW[i][1][0]) * ease.out(k); const z = TW[i][1][2] * k; const y = x > 6.2 ? 0.4 : 0;
  return { pos: [x, y + (k > 0 && k < 1 ? walkBob(k * 2.4) : 0), z] as V3, ph: k * 2.4, moving: k > 0 && k < 1 }; };
const SHOT1 = 0.55, SHOT2 = 0.7, DRAW = 0.15;
const peteDuel = (gunOut: (t: number) => boolean, shots: number[], aim: (t: number) => V3 | undefined): ActorSpec => ({ key: "pete", char: "pete15_armed", at: (t) => {
  const k = shots.reduce((m, s) => Math.max(m, t >= s ? Math.exp(-(t - s) * 11) : 0), 0);
  return { pos: PETE, yaw: Math.PI / 2, pose: gunOut(t) ? aimR(STAND, k * 0.4) : hover(STAND), gun: gunOut(t), aim: aim(t), kick: k * 0.45, face: { Fcl_BRW_Angry: 0.75, Fcl_EYE_Angry: 0.55 } }; } });
const twin = (i: number, o: { walkFrom?: number; draw?: number; drop?: number }): ActorSpec => ({ key: "t" + i, char: TW[i][0], at: (t) => {
  const w = o.walkFrom !== undefined ? twinWalk(i, t, o.walkFrom) : { pos: TW[i][1], ph: 0, moving: false };
  const drawn = o.draw !== undefined && t > o.draw; const dropped = o.drop !== undefined && t > o.drop;
  return { pos: w.pos, yaw: -Math.PI / 2 + (i ? -0.1 : 0.1), pose: dropped ? (t < (o.drop ?? 0) + 0.4 ? hitBack(STAND) : sprawl) : drawn ? aimR(STAND) : w.moving ? walk(w.ph) : hover(STAND),
    fall: dropped ? nt([[o.drop!, 0], [o.drop! + 0.38, i ? -Math.PI / 2 : -Math.PI / 2, ease.in], [o.drop! + 0.45, -Math.PI / 2 + 0.06], [o.drop! + 0.55, -Math.PI / 2]], t) : 0, roll: dropped && i ? nt([[o.drop!, 0], [o.drop! + 0.4, 0.25]], t) : 0, lift: dropped && t > o.drop! + 0.35 ? 0.12 : 0,
    gun: drawn, aim: drawn && !dropped ? [PETE[0], 1.4, PETE[2]] : undefined, face: dropped ? { Fcl_EYE_Surprised: 1, Fcl_MTH_O: 1 } : { Fcl_BRW_Angry: 0.9, Fcl_EYE_Angry: 0.4, Fcl_MTH_Angry: 0.4 } }; } });

// H1: next are two brothers: his gun hand hovers by the holster; the brothers stand at the saloon door
const H1: ShotSpec = { id: "H1", dur: 1.46, set: "town",
  actors: [peteDuel(() => false, [], () => undefined), { key: "t0", char: TW[0][0], at: () => ({ pos: [7.3, 0.4, 0.55], yaw: -Math.PI / 2, pose: STAND, gun: false }) }, { key: "t1", char: TW[1][0], at: () => ({ pos: [7.35, 0.4, -0.6], yaw: -Math.PI / 2, pose: STAND, gun: false }) }],
  cam: (t) => ({ pos: vt([[0, [-6.75, 0.95, 0.62]], [1.46, [-6.6, 0.98, 0.6], ease.io]], t), look: [4, 1.1, 0.05], fov: 30 }) };
// H2: he calls them outside: they push out through the doors and walk down into the street
const H2: ShotSpec = { id: "H2", dur: 1.58, set: "town",
  actors: [{ key: "pete", char: "pete15_armed", at: (t) => ({ pos: PETE, yaw: Math.PI / 2, pose: hover(STAND), gun: false, face: { Fcl_BRW_Angry: 0.7, ...talk(t, 0, 0.9, 0.9) } }) }, twin(0, { walkFrom: 0.05 }), twin(1, { walkFrom: 0.2 })],
  cam: (t) => ({ pos: vt([[0, [-8.4, 1.75, -1.0]], [1.58, [-8.1, 1.7, -0.95], ease.io]], t), look: [4.6, 1.3, 0.1], fov: 34 }) };
// H3a: both draw at once (over his shoulder)
const H3a: ShotSpec = { id: "H3a", dur: 0.7, set: "town",
  actors: [peteDuel(() => false, [], () => undefined), twin(0, { draw: DRAW }), twin(1, { draw: DRAW + 0.03 })],
  cam: () => ({ pos: [-6.7, 1.75, 0.42], look: [4.5, 1.25, 0], fov: 26 }) };
// H3b: but he is faster: two shots from the hip, low and in front of him
const H3b: ShotSpec = { id: "H3b", dur: 0.74, set: "town",
  actors: [peteDuel((t) => t > 0.05, [0.12, 0.34], () => [4.5, 1.35, 0])],
  fx: (t, c, f) => { for (const s of [0.12, 0.34]) { const a = t - s; if (a >= 0 && a < 0.07) f.flash(c.gunTip("pete"), a < 0.035 ? 0.55 : 0.35); if (a > 0) f.smoke(c.gunTip("pete"), a, 0.1); } },
  white: (t) => (t > 0.12 && t < 0.15 ? 0.12 : 0),
  cam: (t) => ({ pos: vt([[0, [-4.6, 1.05, -0.6]], [0.74, [-4.75, 1.08, -0.55], ease.io]], t), look: [-6, 1.5, 0.05], fov: 34, shake: t > 0.12 && t < 0.4 ? 0.012 : 0 }) };
// H4: both drop: one backwards, one twisting sideways, dust kicks up as they hit the street
const H4: ShotSpec = { id: "H4", dur: 1.2, set: "town",
  actors: [twin(0, { draw: -1, drop: 0.0 }), twin(1, { draw: -1, drop: 0.08 })],
  fx: (t, _c, f) => { for (const [i, d] of [[0, 0.38], [1, 0.46]] as [number, number][]) for (let k = 0; k < 4; k++) f.dust(v3(TW[i][1][0] + 0.9 + k * 0.25, 0.1, TW[i][1][2] + (k - 1.5) * 0.3), t - d - k * 0.02, 0.45); },
  cam: (t) => ({ pos: vt([[0, [-0.6, 1.3, 0.3]], [1.2, [0.2, 1.1, 0.2], ease.out]], t), look: [4.9, 0.8, 0], fov: 34 }) };
// H5: five down, one left: he spins the gun back into the holster
const H5: ShotSpec = { id: "H5", dur: 0.96, set: "town",
  actors: [{ key: "pete", char: "pete15_armed", at: (t) => ({ pos: PETE, yaw: Math.PI / 2 - 0.4, pose: t < 0.45 ? withAim(STAND, { rightUpperArm: dirR(0.3, -0.85, 0.3), rightLowerArm: dirR(-0.1, -0.4, 0.9) }) : hover(STAND), gun: t < 0.45, face: { Fcl_BRW_Angry: 0.5, Fcl_EYE_Angry: 0.4 } }) }],
  cam: (t, c) => { const h = c.bone("pete", "head"); return { pos: toArr(h.clone().add(v3(1.15, -0.2, -0.35 + t * 0.08))), look: toArr(h.clone().add(v3(0, -0.15, 0))), fov: 30 }; } };

export const ACT_C: { at: number; spec: ShotSpec }[] = [
  { at: 17.2, spec: B1 }, { at: 19.4, spec: B2 }, { at: 21.5, spec: B3 },
  { at: 66.96, spec: H1 }, { at: 68.42, spec: H2 }, { at: 70.0, spec: H3a }, { at: 70.7, spec: H3b }, { at: 71.44, spec: H4 }, { at: 72.64, spec: H5 },
];
void SHOT1; void SHOT2;
