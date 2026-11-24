// Pose library for the film (directions in the character's body frame: +X = their left, +Y up, +Z facing).
import { POSE, withAim, dirL, dirR, mix, type Pose } from "../rig";
export { POSE, withAim, dirL, dirR, mix };
const S = Math.sin, C = Math.cos;

export const STAND = POSE.stand;
export const RIDE = POSE.ride;
// natural walk: thigh swing, knee bend on the passing leg, counter-swinging arms, a little spine twist. phase in cycles.
export const walk = (phase: number, amt = 1, base: Pose = STAND): Pose => {
  const a = S(phase * Math.PI * 2) * 0.42 * amt, kL = Math.max(0, S(phase * Math.PI * 2 + 2.2)) * 0.9 * amt, kR = Math.max(0, S(phase * Math.PI * 2 + 2.2 + Math.PI)) * 0.9 * amt;
  return withAim(base, {
    leftUpperLeg: dirL(0.05, -C(a), S(a)), rightUpperLeg: dirR(0.05, -C(-a), S(-a)),
    leftLowerLeg: dirL(0.04, -C(a - kL), S(a - kL)), rightLowerLeg: dirR(0.04, -C(-a - kR), S(-a - kR)),
    leftFoot: dirL(0.06, -0.3, 1), rightFoot: dirR(0.06, -0.3, 1),
    leftUpperArm: dirL(0.22, -0.97, -S(a) * 0.55), rightUpperArm: dirR(0.22, -0.97, S(a) * 0.55),
    leftLowerArm: dirL(0.1, -0.9, 0.35 - S(a) * 0.3), rightLowerArm: dirR(0.1, -0.9, 0.35 + S(a) * 0.3),
  }, { spine: [0.04, S(phase * Math.PI * 2) * 0.08 * amt, 0], head: [0, -S(phase * Math.PI * 2) * 0.05 * amt, 0] });
};
export const walkBob = (phase: number, amt = 1) => Math.abs(C(phase * Math.PI * 2)) * 0.035 * amt - 0.02 * amt;
// gun arm (right) aimed straight ahead at shoulder height, thumb up; recoil kicks the forearm up
export const aimR = (base: Pose, kick = 0, yawOff = 0): Pose => withAim(base, {
  rightUpperArm: [0.1 + yawOff, -0.04 + kick * 0.3, 1, 0], rightLowerArm: [0.12 + yawOff, -0.05 + kick, 1, 1.64], rightHand: [0.12 + yawOff, -0.06 + kick * 1.2, 1, 0] }, { spine: [0.04, 0.18, 0], head: [0.02, 0.14, 0] });
// both hands on the gun, arms out front (the heavy gun)
export const twoHands = (base: Pose, droop = 0): Pose => withAim(base, {
  leftUpperArm: dirL(0.18, -0.55 - droop * 0.4, 0.8), leftLowerArm: dirL(-0.55, -0.05 - droop, 0.85), leftHand: dirL(-0.5, -droop, 0.86),
  rightUpperArm: dirR(0.18, -0.55 - droop * 0.4, 0.8), rightLowerArm: dirR(-0.5, -0.05 - droop, 0.86, 1.64), rightHand: dirR(-0.45, -droop, 0.9) }, { spine: [0.06 + droop * 0.15, 0, 0], head: [-0.05 + droop * 0.2, 0, 0] });
// hand hovering by the holster, fingers ready
export const hover = (base: Pose): Pose => withAim(base, { rightUpperArm: dirR(0.32, -0.94, 0.0), rightLowerArm: dirR(0.15, -0.96, 0.25), rightHand: dirR(0.1, -1, 0.15) });
// hands to mouth (shock)
export const handsMouth = (base: Pose): Pose => withAim(base, { leftUpperArm: dirL(0.3, -0.72, 0.62), leftLowerArm: dirL(-0.32, 0.85, 0.42), leftHand: dirL(-0.25, 0.92, 0.3), rightUpperArm: dirR(0.3, -0.72, 0.62), rightLowerArm: dirR(-0.32, 0.85, 0.42), rightHand: dirR(-0.25, 0.92, 0.3) }, { spine: [0.1, 0, 0], head: [0.08, 0, 0] });
// pointing with the right arm (direction in body frame)
export const pointR = (base: Pose, d: [number, number, number] = [-0.3, 0.1, 1]): Pose => withAim(base, { rightUpperArm: [d[0], d[1], d[2], 0], rightLowerArm: [d[0], d[1] + 0.05, d[2], 0], rightHand: [d[0], d[1] + 0.05, d[2], 0] });
// fist raised high (speech)
export const fistUp = (base: Pose, k = 1): Pose => withAim(base, { rightUpperArm: dirR(0.45, 0.4 * k - 0.6 * (1 - k), 0.25), rightLowerArm: dirR(0.05, 1 * k - 0.3 * (1 - k), 0.1), rightHand: dirR(0, 1, 0.1) });
// laughing: head back, shoulders up, hand on belly
export const laugh = (base: Pose, t: number): Pose => { const b = S(t * 22) * 0.06; return withAim(base, { leftUpperArm: dirL(0.3, -0.85, 0.4), leftLowerArm: dirL(-0.8, 0.05, 0.6), leftHand: dirL(-0.8, -0.1, 0.5) }, { spine: [-0.12 - b, 0, 0], chest: [-0.06 - b, 0, 0], head: [-0.25 - b * 2, 0, 0] }); };
// hit: thrown back, arms out
export const hitBack = (base: Pose): Pose => withAim(base, { leftUpperArm: dirL(0.95, -0.1, -0.25), leftLowerArm: dirL(0.85, 0.45, -0.25), rightUpperArm: dirR(0.95, -0.1, -0.25), rightLowerArm: dirR(0.85, 0.45, -0.25) }, { spine: [-0.25, 0, 0], chest: [-0.12, 0, 0], head: [-0.35, 0, 0] });
// lying spread-eagle (use with fall = -PI/2)
export const sprawl = withAim(STAND, { leftUpperArm: dirL(0.95, 0.3, 0.02), leftLowerArm: dirL(0.8, 0.45, 0.4), rightUpperArm: dirR(0.95, 0.3, 0.02), rightLowerArm: dirR(0.8, 0.45, 0.4),
  leftUpperLeg: dirL(0.28, -0.95, 0.12), leftLowerLeg: dirL(0.25, -0.96, 0.05), rightUpperLeg: dirR(0.28, -0.95, 0.12), rightLowerLeg: dirR(0.25, -0.96, 0.05) }, { head: [0.25, 0.25, 0] });
// lying in a coffin: arms crossed on the chest
export const coffin = withAim(STAND, { leftUpperArm: dirL(0.2, -0.85, 0.45), leftLowerArm: dirL(-0.9, 0.3, 0.3), rightUpperArm: dirR(0.2, -0.85, 0.45), rightLowerArm: dirR(-0.9, 0.35, 0.25) });
// seated (chair): thighs forward, shins down; forearms on the table
export const seated = withAim(STAND, { leftUpperLeg: dirL(0.12, -0.05, 1), leftLowerLeg: dirL(0.08, -1, 0.05), rightUpperLeg: dirR(0.12, -0.05, 1), rightLowerLeg: dirR(0.08, -1, 0.05),
  leftUpperArm: dirL(0.25, -0.8, 0.5), leftLowerArm: dirL(-0.2, -0.1, 1), rightUpperArm: dirR(0.25, -0.8, 0.5), rightLowerArm: dirR(-0.2, -0.1, 1) }, { spine: [0.08, 0, 0] });
// handshake (right arm forward, low)
export const shake = (base: Pose, t: number): Pose => { const b = S(t * 12) * 0.08; return withAim(base, { rightUpperArm: dirR(0.05, -0.75, 0.65), rightLowerArm: dirR(-0.25, -0.1 + b, 1), rightHand: dirR(-0.25, b, 1) }); };
// stooped old man
export const stoop = (base: Pose, k = 1): Pose => withAim(base, {}, { spine: [0.22 * k, 0, 0], chest: [0.12 * k, 0, 0], neck: [-0.1 * k, 0, 0], head: [-0.12 * k, 0, 0] });
// both revolvers raised high (mascot)
export const gunsUp = (base: Pose, t: number): Pose => { const b = S(t * 9) * 0.12; return withAim(base, { leftUpperArm: dirL(0.55, 0.75 + b, 0.2), leftLowerArm: dirL(0.1, 1, 0.1), leftHand: dirL(0, 1, 0.1), rightUpperArm: dirR(0.55, 0.75 - b, 0.2), rightLowerArm: dirR(0.1, 1, 0.1, 1.64), rightHand: dirR(0, 1, 0.1) }); };
