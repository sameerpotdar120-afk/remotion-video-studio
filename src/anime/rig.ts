// Pose rig for our VRM characters: limbs are aimed by direction in the character's own body frame
// (+X = character's left, +Y = up, +Z = facing), torso bones turned by angles in that frame.
// Poses are plain data so scenes can blend them frame by frame (deterministic for Remotion).
import * as THREE from "three";
import type { VRM } from "@pixiv/three-vrm";
import type { HB } from "./kit";

export type Dir = [number, number, number] | [number, number, number, number]; // x y z (+ optional twist, radians)
export type Pose = { aim?: Partial<Record<HB, Dir>>; turn?: Partial<Record<HB, [number, number, number]>> };

const CHILD: Partial<Record<HB, HB>> = {
  leftUpperArm: "leftLowerArm", leftLowerArm: "leftHand", leftHand: "leftMiddleProximal",
  rightUpperArm: "rightLowerArm", rightLowerArm: "rightHand", rightHand: "rightMiddleProximal",
  leftUpperLeg: "leftLowerLeg", leftLowerLeg: "leftFoot", leftFoot: "leftToes",
  rightUpperLeg: "rightLowerLeg", rightLowerLeg: "rightFoot", rightFoot: "rightToes",
};
// hierarchy order so parents are posed before children
const ORDER: HB[] = ["hips", "spine", "chest", "upperChest", "neck", "head",
  "leftShoulder", "leftUpperArm", "leftLowerArm", "leftHand", "rightShoulder", "rightUpperArm", "rightLowerArm", "rightHand",
  "leftUpperLeg", "leftLowerLeg", "leftFoot", "rightUpperLeg", "rightLowerLeg", "rightFoot"];

export type Rig = { vrm: VRM; B: THREE.Matrix3; rest: Map<HB, THREE.Vector3>; base: Map<HB, THREE.Quaternion> };
export const makeRig = (vrm: VRM): Rig => {
  const H = vrm.humanoid; const save = new Map<HB, THREE.Quaternion>();
  for (const b of ORDER) { const n = H.getNormalizedBoneNode(b); if (n) { save.set(b, n.quaternion.clone()); n.quaternion.identity(); } }
  vrm.scene.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(vrm.scene.matrixWorld).invert();
  const P = (b: HB) => H.getNormalizedBoneNode(b)!.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
  const left = P("leftUpperArm").sub(P("rightUpperArm")).normalize(); const up = new THREE.Vector3(0, 1, 0); const fwd = new THREE.Vector3().crossVectors(left, up).normalize();
  const B = new THREE.Matrix3().set(left.x, up.x, fwd.x, left.y, up.y, fwd.y, left.z, up.z, fwd.z);
  const rest = new Map<HB, THREE.Vector3>();
  for (const [b, c] of Object.entries(CHILD) as [HB, HB][]) { const cn = H.getNormalizedBoneNode(c); if (cn) rest.set(b, cn.position.clone().normalize()); }
  for (const [b, q] of save) H.getNormalizedBoneNode(b)!.quaternion.copy(q);
  return { vrm, B, rest, base: save };
};

const tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion();
export const applyPose = (r: Rig, p: Pose) => {
  const H = r.vrm.humanoid; r.vrm.scene.updateMatrixWorld(true);
  const sceneQinv = r.vrm.scene.getWorldQuaternion(new THREE.Quaternion()).invert();
  for (const b of ORDER) {
    const n = H.getNormalizedBoneNode(b); if (!n) continue;
    const t = p.turn?.[b]; const a = p.aim?.[b];
    if (t) { n.quaternion.identity(); const ax = ([[1, 0, 0], [0, 1, 0], [0, 0, 1]] as const);
      for (let i = 0; i < 3; i++) if (t[i]) { const v = new THREE.Vector3(...ax[i]).applyMatrix3(r.B).normalize(); n.quaternion.premultiply(tmpQ.setFromAxisAngle(v, t[i])); } }
    else if (a && r.rest.has(b)) {
      const d = new THREE.Vector3(a[0], a[1], a[2]).normalize().applyMatrix3(r.B).normalize();       // scene-local
      n.parent!.updateWorldMatrix(true, false);
      const pq = n.parent!.getWorldQuaternion(new THREE.Quaternion()).premultiply(sceneQinv);           // parent rel. to scene
      const local = d.clone().applyQuaternion(pq.clone().invert());
      n.quaternion.setFromUnitVectors(r.rest.get(b)!, local);
      if (a[3]) n.quaternion.premultiply(tmpQ2.setFromAxisAngle(local, a[3]));
    }
    n.updateMatrixWorld(true);
  }
};

// blend two poses (directions lerped + normalised, angles lerped); missing entries are taken from the other pose
export const mix = (a: Pose, b: Pose, k: number): Pose => {
  const out: Pose = { aim: {}, turn: {} };
  const keysA = new Set([...Object.keys(a.aim ?? {}), ...Object.keys(b.aim ?? {})]) as Set<HB>;
  for (const key of keysA) { const x = a.aim?.[key] ?? b.aim![key]!, y = b.aim?.[key] ?? x; const vx = new THREE.Vector3(x[0], x[1], x[2]).normalize(), vy = new THREE.Vector3(y[0], y[1], y[2]).normalize(); const v = vx.lerp(vy, k);
    if (v.lengthSq() < 1e-4) v.set(0, 0, 1); out.aim![key] = [v.x, v.y, v.z, (x[3] ?? 0) * (1 - k) + (y[3] ?? 0) * k]; }
  const keysT = new Set([...Object.keys(a.turn ?? {}), ...Object.keys(b.turn ?? {})]) as Set<HB>;
  for (const key of keysT) { const x = a.turn?.[key] ?? [0, 0, 0], y = b.turn?.[key] ?? [0, 0, 0]; out.turn![key] = [x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k, x[2] + (y[2] - x[2]) * k]; }
  return out;
};
// keyframed pose track: [time, pose, ease?]
export type Ease = (k: number) => number;
export const E = {
  lin: (k: number) => k, inOut: (k: number) => k * k * (3 - 2 * k), out: (k: number) => 1 - (1 - k) * (1 - k), in: (k: number) => k * k,
  back: (k: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }, // overshoot
};
export const track = (keys: [number, Pose, Ease?][], t: number): Pose => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, p0] = keys[i - 1], [t1, p1, e] = keys[i]; return mix(p0, p1, (e ?? E.inOut)((t - t0) / (t1 - t0))); }
  return keys[keys.length - 1][1];
};
// number track
export const ntrack = (keys: [number, number, Ease?][], t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1, e] = keys[i]; return v0 + (v1 - v0) * (e ?? E.inOut)((t - t0) / (t1 - t0)); }
  return keys[keys.length - 1][1];
};

// ---------- library poses (body frame) ----------
const L = (x: number, y: number, z: number, tw = 0): Dir => [x, y, z, tw];
const R = (x: number, y: number, z: number, tw = 0): Dir => [-x, y, z, -tw]; // mirror of a left-side direction
export const POSE = {
  ride: { aim: { leftUpperLeg: L(0.42, -0.62, 0.66), leftLowerLeg: L(0.1, -0.96, -0.12), leftFoot: L(0.12, -0.25, 1), rightUpperLeg: R(0.42, -0.62, 0.66), rightLowerLeg: R(0.1, -0.96, -0.12), rightFoot: R(0.12, -0.25, 1),
    leftUpperArm: L(0.22, -0.9, 0.32), leftLowerArm: L(-0.25, -0.3, 0.92), leftHand: L(-0.2, -0.3, 0.93), rightUpperArm: R(0.22, -0.9, 0.32), rightLowerArm: R(-0.25, -0.3, 0.92), rightHand: R(-0.2, -0.3, 0.93) },
    turn: { spine: [0.12, 0, 0], chest: [0.04, 0, 0], head: [-0.1, 0, 0] } } as Pose,
  stand: { aim: { leftUpperArm: L(0.22, -0.97, 0.02), leftLowerArm: L(0.08, -0.97, 0.18), leftHand: L(0.05, -0.97, 0.2), rightUpperArm: R(0.22, -0.97, 0.02), rightLowerArm: R(0.08, -0.97, 0.18), rightHand: R(0.05, -0.97, 0.2),
    leftUpperLeg: L(0.06, -1, 0), leftLowerLeg: L(0.04, -1, 0), leftFoot: L(0.06, -0.35, 1), rightUpperLeg: R(0.06, -1, 0), rightLowerLeg: R(0.04, -1, 0), rightFoot: R(0.06, -0.35, 1) }, turn: {} } as Pose,
};
export const withAim = (p: Pose, aim: Pose["aim"], turn?: Pose["turn"]): Pose => ({ aim: { ...p.aim, ...aim }, turn: { ...p.turn, ...(turn ?? {}) } });
export { L as dirL, R as dirR };
