// Our anime horses: CC0 Quaternius horse (FBX with Run/Walk/Idle/Jump/Death clips), restyled with toon shading + ink outline,
// a coat colour per rider, mane/tail colour, and our own saddle + bridle + bedroll attached to its bones.
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { inkMat, smoothNormals, toon, withInk } from "./kit";
import { loopSubdivide } from "./subdivide";
export let HORSE_SUBDIV = 1; export const setHorseSubdiv = (n: number) => { HORSE_SUBDIV = n; };

export type HorseLook = { coat: string; mane: string; blaze?: boolean; saddle?: string; blanket?: string };
export const HORSES: Record<string, HorseLook> = {
  silas: { coat: "#363244", mane: "#14121a", saddle: "#3a2418", blanket: "#6b1f24" },   // black stallion
  bram: { coat: "#6b3a1f", mane: "#1a120d", saddle: "#4a2e1c", blanket: "#c99a3c" },    // bay
  jory: { coat: "#d9d2c4", mane: "#3a3230", saddle: "#5a3a22", blanket: "#6b3a8a", blaze: true }, // pale grey
  abel: { coat: "#9a4c22", mane: "#e0c79a", saddle: "#4a2e1c", blanket: "#a8432c" },   // chestnut, flaxen mane
  cain: { coat: "#9a4c22", mane: "#e0c79a", saddle: "#4a2e1c", blanket: "#5f6b34" },   // chestnut, flaxen mane
  lucien: { coat: "#c8a25a", mane: "#f2e6c8", saddle: "#1b1a20", blanket: "#5b3a7a", blaze: true }, // palomino
};

let base: Promise<THREE.Group> | null = null;
const loadBase = (url: string) => (base = base ?? new Promise((res, rej) => new FBXLoader().load(url, res, undefined, rej)));

export type BuiltHorse = { root: THREE.Group; mixer: THREE.AnimationMixer; clips: Record<string, THREE.AnimationClip>; bones: string[]; height: number };
// returns a horse ~1.65 m at the withers, standing on y=0, facing +Z
export const buildHorse = async (url: string, look: HorseLook): Promise<BuiltHorse> => {
  const src = await loadBase(url);
  const { clone } = await import("three/examples/jsm/utils/SkeletonUtils.js");
  const o = clone(src) as THREE.Group; o.animations = src.animations;
  const coatM = toon(look.coat, { shade: 0.6, rim: 0.35 }), maneM = toon(look.mane, { shade: 0.6 });
  const bones: string[] = [];
  o.traverse((m) => {
    m.frustumCulled = false; if ((m as THREE.Bone).isBone) bones.push(m.name);
    const mm = m as THREE.SkinnedMesh; if (!mm.isMesh) return;
    const mats = (Array.isArray(mm.material) ? mm.material : [mm.material]).map((x) => (x.name.includes("003") ? coatM : maneM));
    mm.material = mats.length === 1 ? mats[0] : mats; mm.geometry = HORSE_SUBDIV > 0 && mm.isSkinnedMesh ? loopSubdivide(mm.geometry, HORSE_SUBDIV) : smoothNormals(mm.geometry);
    if (mm.isSkinnedMesh) { mm.geometry.computeBoundingBox(); const gs = mm.geometry.boundingBox!.getSize(new THREE.Vector3()).length(); const ink = new THREE.SkinnedMesh(mm.geometry, inkMat(gs * 0.0028, "#1b1416")); ink.bind(mm.skeleton, mm.bindMatrix); ink.frustumCulled = false; mm.parent!.add(ink); }
  });
  const b = new THREE.Box3().setFromObject(o); const s = 2.15 / (b.max.y - b.min.y); o.scale.setScalar(s); o.position.y = -b.min.y * s;
  const root = new THREE.Group(); root.add(o); root.updateMatrixWorld(true);
  dressHorse(o, look);
  const mixer = new THREE.AnimationMixer(o); const clips: Record<string, THREE.AnimationClip> = {};
  for (const a of src.animations) clips[a.name.split("|").pop()!.toLowerCase()] = a;
  return { root, mixer, clips, bones, height: (b.max.y - b.min.y) * s };
};

// ---- tack: measured on the actual rest-pose surface so it sits on the coat ----
const skinnedPoints = (o: THREE.Object3D) => { const pts: THREE.Vector3[] = []; o.traverse((m) => { const sm = m as THREE.SkinnedMesh; if (!sm.isSkinnedMesh || (sm.material as THREE.Material).type === "MeshBasicMaterial") return; const pos = sm.geometry.getAttribute("position"); for (let i = 0; i < pos.count; i += 1) { const v = new THREE.Vector3(); sm.getVertexPosition(i, v); pts.push(v.applyMatrix4(sm.matrixWorld)); } }); return pts; };
const boneW = (o: THREE.Object3D, n: string) => { let r: THREE.Object3D | undefined; o.traverse((b) => { if (b.name === n && (b as THREE.Bone).isBone) r = b; }); return r!; };
const stripeTex = (base: string, line: string) => { const c = document.createElement("canvas"); c.width = 256; c.height = 64; const g = c.getContext("2d")!; g.fillStyle = base; g.fillRect(0, 0, 256, 64); g.fillStyle = line; for (let x = 0; x < 256; x += 32) { g.fillRect(x, 0, 6, 64); g.fillRect(x + 12, 0, 2, 64); } g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 0, 256, 4); g.fillRect(0, 60, 256, 4); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
const attachTo = (bone: THREE.Object3D, m: THREE.Object3D) => { bone.updateMatrixWorld(true); bone.attach(m); };
const inked = (m: THREE.Mesh, w = 0.006) => { withInk(m, w); return m; };
const dressHorse = (o: THREE.Object3D, look: HorseLook) => {
  o.updateMatrixWorld(true);
  const pts = skinnedPoints(o);
  const torso = boneW(o, "Torso"), head = boneW(o, "Head"), headEnd = boneW(o, "Head_end"), neck = boneW(o, "Neck");
  const T = torso.getWorldPosition(new THREE.Vector3()), H = head.getWorldPosition(new THREE.Vector3()), HE = headEnd.getWorldPosition(new THREE.Vector3());
  // back surface + body half-width at the saddle
  const near = pts.filter((p) => Math.abs(p.z - T.z) < 0.35 && p.y > T.y - 0.1); const topY = Math.max(...near.map((p) => p.y)); const halfW = Math.max(...near.map((p) => Math.abs(p.x - T.x)));
  (globalThis as unknown as { __hdbg: string }).__hdbg = `pts ${pts.length} near ${near.length} topY ${topY.toFixed(2)} halfW ${halfW.toFixed(2)} T ${T.toArray().map((x) => x.toFixed(2))} H ${H.toArray().map((x) => x.toFixed(2))} sample ${pts[0]?.toArray().map((x) => x.toFixed(2))} ${pts[500]?.toArray().map((x) => x.toFixed(2))}`;
  const leather = toon(look.saddle ?? "#4a2e1c", { shade: 0.6, rim: 0.15 });
  // blanket: a curved pad draped over the back
  const blanket = new THREE.Mesh(new THREE.CylinderGeometry(halfW * 1.06, halfW * 1.06, 0.62, 32, 1, true, Math.PI * 0.6, Math.PI * 0.8), toon(look.blanket ?? "#8a2f22", { map: stripeTex(look.blanket ?? "#8a2f22", "#e8dcc0"), side: THREE.DoubleSide, shade: 0.7 }));
  blanket.rotation.x = Math.PI / 2; blanket.position.set(T.x, topY - halfW * 1.05 + 0.012, T.z - 0.02); inked(blanket, 0.005); attachTo(torso, blanket);
  // seat, raised cantle at the back, horn at the front
  const seat = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), leather); seat.scale.set(halfW * 0.9, 0.07, 0.24); seat.position.set(T.x, topY + 0.005, T.z); seat.name = "seat"; inked(seat, 0.005); attachTo(torso, seat);
  const cantle = new THREE.Mesh(new THREE.TorusGeometry(halfW * 0.55, 0.028, 8, 20, Math.PI), leather); cantle.position.set(T.x, topY + 0.02, T.z - 0.2); cantle.scale.set(1, 0.9, 1); inked(cantle, 0.004); attachTo(torso, cantle);
  const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.11, 12), leather); horn.position.set(T.x, topY + 0.07, T.z + 0.2); horn.rotation.x = 0.25; inked(horn, 0.004); attachTo(torso, horn);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 14), leather); cap.position.set(T.x, topY + 0.13, T.z + 0.215); attachTo(torso, cap);
  // stirrups on straps
  for (const sx of [-1, 1]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.5, 0.012), leather); strap.position.set(T.x + sx * (halfW + 0.02), topY - 0.25, T.z + 0.04); strap.rotation.z = -sx * 0.06; attachTo(torso, strap);
    const st = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 14), toon("#6a5a4a")); st.position.set(T.x + sx * (halfW + 0.035), topY - 0.52, T.z + 0.04); st.rotation.y = Math.PI / 2; inked(st, 0.003); attachTo(torso, st);
  }
  // head: eyes, bridle, reins, blaze
  const dir = HE.clone().sub(H).normalize();
  // eye: take a slice across the head ~30% of the way from the poll to the muzzle; eye sits high on the side of that slice
  const L = H.distanceTo(HE);
  const slice = (t: number, w = 0.05) => { const c = H.clone().addScaledVector(dir, L * t); return pts.filter((p) => { const v = p.clone().sub(H); const along = v.dot(dir); if (Math.abs(along - L * t) > w) return false; return p.distanceTo(c) < 0.2; }); };
  const sl = slice(0.3); const sTop = Math.max(...sl.map((p) => p.y)), sBot = Math.min(...sl.map((p) => p.y));
  const eyeC = H.clone().addScaledVector(dir, L * 0.3); eyeC.y = sTop - (sTop - sBot) * 0.22;
  const atH = sl.filter((p) => Math.abs(p.y - eyeC.y) < 0.05); const hw = Math.max(0.04, ...atH.map((p) => Math.abs(p.x - eyeC.x)));
  for (const sx of [-1, 1]) {
    const eye = new THREE.Group();
    const white = new THREE.Mesh(new THREE.CircleGeometry(0.034, 20), new THREE.MeshBasicMaterial({ color: "#f4efe6" })); white.scale.set(1, 0.85, 1); eye.add(white);
    const iris = new THREE.Mesh(new THREE.CircleGeometry(0.024, 20), new THREE.MeshBasicMaterial({ color: "#2a1a12" })); iris.position.set(0.004, -0.002, 0.001); eye.add(iris);
    const hl = new THREE.Mesh(new THREE.CircleGeometry(0.008, 12), new THREE.MeshBasicMaterial({ color: "#ffffff" })); hl.position.set(0.012, 0.01, 0.002); eye.add(hl);
    const lid = new THREE.Mesh(new THREE.RingGeometry(0.033, 0.04, 20, 1, 0, Math.PI), new THREE.MeshBasicMaterial({ color: "#1b1416" })); lid.position.z = 0.002; eye.add(lid);
    eye.position.set(eyeC.x + sx * (hw + 0.006), eyeC.y, eyeC.z); eye.lookAt(eyeC.x + sx * 5, eyeC.y + 0.4, eyeC.z + 1.6); attachTo(head, eye);
  }
  const bridleM = toon("#3a2418", { shade: 0.6 });
  const nose = H.clone().addScaledVector(dir, H.distanceTo(HE) * 0.75);
  const np = pts.filter((p) => p.distanceTo(nose) < 0.25); const nw = Math.max(0.05, ...np.map((p) => Math.abs(p.x - nose.x)));
  const band = new THREE.Mesh(new THREE.TorusGeometry(nw * 1.05, 0.012, 6, 24), bridleM); band.position.copy(nose); band.lookAt(nose.clone().add(dir)); attachTo(head, band);
  const pollSl = slice(0.04, 0.06); const pw = Math.max(0.05, ...pollSl.map((p) => Math.abs(p.x - H.x))); const brow = new THREE.Mesh(new THREE.TorusGeometry(pw * 1.05, 0.012, 6, 24), bridleM); brow.position.copy(H).addScaledVector(dir, L * 0.04); brow.lookAt(brow.position.clone().add(dir)); attachTo(head, brow);
  for (const sx of [-1, 1]) {
    const a = nose.clone().add(new THREE.Vector3(sx * nw, 0, 0)), b2 = new THREE.Vector3(T.x + sx * 0.06, topY + 0.1, T.z + 0.3);
    const mid = a.clone().lerp(b2, 0.5).add(new THREE.Vector3(0, -0.12, 0));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b2);
    const rein = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.008, 5), bridleM); attachTo(neck, rein);
  }
  if (look.blaze) { const bl = new THREE.Mesh(new THREE.PlaneGeometry(0.06, H.distanceTo(HE) * 0.8), new THREE.MeshBasicMaterial({ color: "#f1ece4", side: THREE.DoubleSide }));
    const fp = slice(0.45, 0.08); const top = fp.reduce((m, p) => (p.y > m.y ? p : m), fp[0] ?? eyeC);
    bl.position.copy(H.clone().lerp(HE, 0.45)); bl.position.y = top.y + 0.004; bl.lookAt(bl.position.clone().add(new THREE.Vector3(0, 1, 0))); bl.rotateZ(0); attachTo(head, bl); }
};
