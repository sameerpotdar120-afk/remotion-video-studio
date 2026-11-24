// Act 1 after the shooting: the son on the porch, the neighbor and the revolver, the curse, the rage, then the practice years.
// Times inside a shot start at 0. Farm coordinates: porch deck y 0.67, z 3..5.2; Thomas lies at (0.32, 0, 8.6).
import * as THREE from "three";
import type { ShotSpec, ActorSpec, V3 } from "./engine";
import { nt, vt, v3, ease, talk, hash } from "./engine";
import { STAND, walk, walkBob, twoHands, handsMouth, pointR, stoop, sprawl, aimR, withAim, dirL, dirR, RIDE } from "./poses";
import { targetRail } from "./props";

const ELI: V3 = [-0.12, 0.67, 4.3], AMOS_END: V3 = [0.62, 0.67, 4.35], BODY: V3 = [0.32, 0, 8.6];
const body = (key = "thomas"): ActorSpec => ({ key, char: "thomas", at: () => ({ pos: BODY, yaw: 0, fall: -Math.PI / 2, lift: 0.13, pose: sprawl, face: { Fcl_EYE_Close: 1, Fcl_MTH_O: 0.3 } }) });
const tremble = (t: number) => [Math.sin(t * 31) * 0.025 + Math.sin(t * 17) * 0.02, Math.sin(t * 23 + 1) * 0.03, 0] as [number, number, number];
const SCARED = { Fcl_EYE_Surprised: 0.8, Fcl_BRW_Sorrow: 0.9, Fcl_MTH_O: 0.35 };

// A1: the son watches, hands over his mouth, trembling (4.3-6.6)
const A1: ShotSpec = { id: "A1", dur: 2.3, set: "farm:sunset",
  actors: [{ key: "eli", char: "eli", at: (t) => ({ pos: ELI, yaw: 0.15, pose: withAim(handsMouth(STAND), {}, { head: tremble(t), spine: [0.12 + Math.sin(t * 2.5) * 0.02, 0, 0] }), face: { ...SCARED, Fcl_EYE_Surprised: 0.8 + Math.sin(t * 9) * 0.1 } }) }, body()],
  cam: (t) => ({ pos: vt([[0, [0.25, 1.5, 7.2]], [2.3, [0.05, 1.55, 6.0], ease.out]], t), look: [-0.12, 1.5, 4.3], fov: 30 }) };

// A2: old Amos shuffles in along the porch and presses the revolver into the boy's hands; it drags his arms down (6.6-10.1)
const A2_GIVE = 1.35;
const A2: ShotSpec = { id: "A2", dur: 3.5, set: "farm:sunset",
  actors: [
    { key: "eli", char: "eli_armed", at: (t) => { const k = nt([[A2_GIVE, 0], [A2_GIVE + 0.25, 1, ease.out]], t); const droop = nt([[A2_GIVE + 0.1, 0], [A2_GIVE + 0.45, 0.9, ease.out], [A2_GIVE + 0.9, 0.55], [3.5, 0.62]], t);
      return { pos: ELI, yaw: nt([[0, 0.3], [0.8, 1.2, ease.io]], t), gun: t > A2_GIVE + 0.12, pose: k < 0.05 ? withAim(handsMouth(STAND), {}, { head: tremble(t) }) : twoHands(STAND, droop), face: SCARED }; } },
    { key: "amos", char: "amos_armed", at: (t) => { const walking = t < 1.2; const x = nt([[0, 3.4], [1.2, 0.62, ease.out]], t); const ph = (3.4 - x) / 0.55;
      const reach = nt([[1.0, 0], [A2_GIVE, 1, ease.out], [A2_GIVE + 0.4, 1], [A2_GIVE + 0.8, 0]], t);
      const p = stoop(walking ? walk(ph, 0.6) : STAND, 1); const give = withAim(stoop(STAND, 1.7), { rightUpperArm: dirR(0.05, -0.78, 0.62), rightLowerArm: dirR(-0.3, -0.55, 0.78), rightHand: dirR(-0.3, -0.5, 0.8) });
      return { pos: [x, 0.67 + (walking ? walkBob(ph, 0.6) : 0), 4.35], yaw: -Math.PI / 2, gun: t < A2_GIVE + 0.12, pose: reach > 0.02 ? give : p, face: { Fcl_BRW_Sorrow: 0.9, Fcl_MTH_Down: 0.4 } }; } },
    body()],
  cam: (t) => ({ pos: vt([[0, [2.6, 1.45, 9.4]], [3.5, [1.5, 1.4, 8.9], ease.io]], t), look: vt([[0, [1.3, 1.45, 4.3]], [1.6, [0.3, 1.35, 4.3], ease.io]], t), fov: 34 }) };

// A3: the curse, close on Amos from low (10.1-13.0)
const A3: ShotSpec = { id: "A3", dur: 2.9, set: "farm:sunset",
  actors: [{ key: "amos", char: "amos", at: (t) => ({ pos: AMOS_END, yaw: -Math.PI / 2 + 0.25, pose: withAim(stoop(STAND, 0.6), { rightUpperArm: dirR(0.3, -0.6, 0.7), rightLowerArm: dirR(0.05, 0.4, 0.9), rightHand: dirR(0, 0.6, 0.8) }, { head: [-0.15 + Math.sin(t * 5) * 0.03, 0, Math.sin(t * 3) * 0.04] }),
    face: { Fcl_BRW_Angry: 0.8, Fcl_EYE_Angry: 0.35, ...talk(t, 0.0, 2.75, 0.75) } }) },
    { key: "eli", char: "eli_armed", at: () => ({ pos: ELI, yaw: 1.2, pose: twoHands(STAND, 0.6), face: SCARED }) }],
  cam: (t) => ({ pos: vt([[0, [-0.95, 1.8, 4.75]], [2.9, [-0.6, 1.85, 4.6], ease.io]], t), look: [0.62, 2.0, 4.35], fov: 34 }) };

// A4: "...avenge your father": over the two of them on the porch, Amos points at the body in the yard (13.0-14.7)
const A4: ShotSpec = { id: "A4", dur: 1.7, set: "farm:sunset",
  actors: [
    { key: "amos", char: "amos", at: (t) => ({ pos: AMOS_END, yaw: -0.35, pose: nt([[0, 0], [0.35, 1, ease.out]], t) > 0.5 ? pointR(stoop(STAND, 0.6), [-0.15, -0.35, 1]) : stoop(STAND, 0.6), face: { Fcl_BRW_Angry: 0.8, ...talk(t, 0, 1.6, 0.7) } }) },
    { key: "eli", char: "eli_armed", at: () => ({ pos: ELI, yaw: 0.15, pose: twoHands(STAND, 0.7), face: SCARED }) }, body()],
  cam: (t) => ({ pos: vt([[0, [1.1, 0.45, 12.2]], [1.7, [0.95, 0.5, 11.7], ease.io]], t), look: [0.25, 1.35, 4.6], fov: 36 }) };

// A5: the boy is scared and furious: low close-up, gun in both hands, face turns from fear to rage (14.7-17.2)
const A5: ShotSpec = { id: "A5", dur: 2.5, set: "farm:sunset",
  actors: [{ key: "eli", char: "eli_armed", at: (t) => { const k = nt([[0.7, 0], [1.6, 1, ease.io]], t);
    return { pos: ELI, yaw: 0, pose: withAim(twoHands(STAND, 0.42), {}, { head: [0.05 + Math.sin(t * 29) * 0.01 * (1 - k), 0, 0] }),
      face: { Fcl_EYE_Surprised: 0.8 * (1 - k), Fcl_BRW_Sorrow: 0.9 * (1 - k) + 0.3 * k, Fcl_MTH_O: 0.3 * (1 - k), Fcl_BRW_Angry: k, Fcl_EYE_Angry: 0.55 * k, Fcl_MTH_Angry: 0.6 * k } }; } }],
  cam: (t) => ({ pos: vt([[0, [-0.05, 1.1, 5.75]], [2.5, [-0.1, 1.15, 5.3], ease.io]], t), look: [-0.12, 1.55, 4.3], fov: 32 }) };

// ---------- the practice years ----------
const YARD: V3 = [-6, 0, 14]; // practice spot, facing the bottle rail at z 21.5
const railAt = v3(-6, 0, 21.5);
const shooter = (char: string, shots: number[], scale = 1, droop = 0.35): ActorSpec => ({ key: "kid", char, at: (t) => {
  const kick = shots.reduce((m, s) => Math.max(m, t >= s ? Math.exp(-(t - s) * 9) * 0.9 : 0), 0);
  return { pos: YARD, yaw: 0, scale, pose: withAim(twoHands(STAND, droop * (1 - kick) - kick * 0.6), {}, { spine: [-kick * 0.12, 0, 0] }), aim: [-6, 1.1 + kick * 1.6, 21.5], kick: kick * 0.5, face: { Fcl_BRW_Angry: 0.7, Fcl_EYE_Angry: 0.4, Fcl_MTH_Angry: 0.3 } }; } });
const muzzle = (shots: number[]) => (t: number, c: { gunTip: (k: string) => THREE.Vector3 }, f: { flash: (p: THREE.Vector3, s: number) => void; smoke: (p: THREE.Vector3, a: number, s?: number) => void }) => {
  for (const s of shots) { const a = t - s; if (a >= 0 && a < 0.07) f.flash(c.gunTip("kid"), a < 0.035 ? 0.55 : 0.35); if (a > 0) f.smoke(c.gunTip("kid"), a, 0.12); } };

// C1: the gun is so heavy he needs both hands: it sags, he heaves it back up (21.86-24.0)
const C1: ShotSpec = { id: "C1", dur: 2.14, set: "farm:day",
  actors: [{ key: "kid", char: "eli_armed", at: (t) => { const droop = 0.45 + Math.sin(t * 2.6) * 0.35 + Math.sin(t * 7.3) * 0.05;
    return { pos: YARD, yaw: 0, pose: withAim(twoHands(STAND, droop), {}, { spine: [0.1 + droop * 0.1, 0, Math.sin(t * 3.1) * 0.04] }), aim: [-6, 1.1 - droop * 1.4, 21.5], face: { Fcl_BRW_Angry: 0.5, Fcl_MTH_Angry: 0.5, Fcl_EYE_Angry: 0.2 } }; } }],
  cam: (t) => ({ pos: vt([[0, [-6.05, 0.82, 15.7]], [2.14, [-6.05, 0.86, 15.3], ease.io]], t), look: [-6, 0.95, 14], fov: 36 }) };

// C2: he practices: wide from the side, recoil throws his arms up, the bottles burst (24.0-25.8)
let railC2: ReturnType<typeof targetRail> | null = null, railC3: ReturnType<typeof targetRail> | null = null;
const C2_SHOTS = [0.45, 1.1];
const C2: ShotSpec = { id: "C2", dur: 1.8, set: "farm:sunset",
  actors: [shooter("eli_armed", C2_SHOTS, 1, 0.25)],
  build: (scene) => { railC2 = targetRail(scene, railAt, 0, [{ hit: 0.5, color: "#3f8a5a", kind: "bottle" }, { hit: 99, color: "#8a5a2c", kind: "bottle" }, { hit: 1.15, color: "#5a7a9a", kind: "bottle" }, { hit: 99, color: "#3f8a5a", kind: "bottle" }]); return railC2.update; },
  fx: (t, c, f) => { muzzle(C2_SHOTS)(t, c, f); railC2?.fx(t, f); },
  cam: (t) => ({ pos: vt([[0, [-5.62, 0.98, 12.35]], [1.8, [-5.66, 1.0, 12.7], ease.io]], t), look: [-6.3, 0.95, 21.5], fov: 34 }) };

// C3: every day: noon (older, steadier) then a night shot lit by the muzzle flash (25.8-26.6)
const C3a_SHOTS = [0.12];
const C3a: ShotSpec = { id: "C3a", dur: 0.35, set: "farm:day", actors: [shooter("eli_armed", C3a_SHOTS, 1.12, 0.1)],
  build: (scene) => { railC3 = targetRail(scene, railAt, 0, [{ hit: 0.16, color: "#8a5a2c", kind: "bottle" }, { hit: 99, color: "#3f8a5a", kind: "bottle" }]); return railC3.update; },
  fx: (t, c, f) => { muzzle(C3a_SHOTS)(t, c, f); railC3?.fx(t, f); }, cam: () => ({ pos: [-5.7, 0.85, 16.3], look: [-6, 0.95, 14], fov: 36 }) };
const C3b_SHOTS = [0.12, 0.3];
const C3b: ShotSpec = { id: "C3b", dur: 0.45, set: "farm:night", actors: [shooter("eli_armed", C3b_SHOTS, 1.2, 0.05)], grade: "night",
  fx: (t, c, f) => muzzle(C3b_SHOTS)(t, c, f), white: (t) => (C3b_SHOTS.some((s) => t >= s && t < s + 0.034) ? 0.12 : 0),
  cam: () => ({ pos: [-3.9, 1.15, 14.5], look: [-6, 1.05, 14.25], fov: 34 }) };

// C4: for years: fifteen now, three fast shots, cans jump off the rail (26.6-27.66)
const C4_SHOTS = [0.15, 0.42, 0.68];
const C4: ShotSpec = { id: "C4", dur: 1.06, set: "farm:day",
  actors: [{ key: "kid", char: "pete15_armed", at: (t) => { const kick = C4_SHOTS.reduce((m, s) => Math.max(m, t >= s ? Math.exp(-(t - s) * 12) : 0), 0);
    return { pos: YARD, yaw: 0, pose: aimR(STAND, kick * 0.5), aim: [-6.4 + nt([[0, 0], [0.3, 0.42], [0.55, 0.84]], t), 2.05, 21.5], kick: kick * 0.45, face: { Fcl_BRW_Angry: 0.6, Fcl_EYE_Angry: 0.45 } }; } }],
  build: (scene) => targetRail(scene, railAt, 0, [{ hit: 0.2, color: "#b8bcc4", kind: "can" }, { hit: 0.47, color: "#c23a32", kind: "can" }, { hit: 0.73, color: "#b8bcc4", kind: "can" }]).update,
  fx: (t, c, f) => muzzle(C4_SHOTS)(t, c, f),
  cam: (t) => ({ pos: vt([[0, [-5.72, 1.45, 11.95]], [1.06, [-5.7, 1.48, 12.15], ease.io]], t), look: [-6.15, 1.25, 21.5], fov: 32 }) };

export const ACT_A: { at: number; spec: ShotSpec }[] = [
  { at: 4.3, spec: A1 }, { at: 6.6, spec: A2 }, { at: 10.1, spec: A3 }, { at: 13.0, spec: A4 }, { at: 14.7, spec: A5 },
  { at: 21.86, spec: C1 }, { at: 24.0, spec: C2 }, { at: 25.8, spec: C3a }, { at: 26.15, spec: C3b }, { at: 26.6, spec: C4 },
];
void hash; void RIDE; void dirL;
