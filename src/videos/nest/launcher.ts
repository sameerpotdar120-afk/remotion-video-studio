// The loaded "nest of bees" on its two-wheeled cart, built in its own local frame:
//   cart origin on the ground, box axis along local -z (mouth at the front), tilted up by TILT.
// Exposes the world positions of the 32 holes (mouth), the rear fuse ends, the knot and the rope end every frame.
import * as THREE from "three";
import { V, lam } from "../bridge/build";
import { planksHD, beam, ctex } from "../bridge/paint";
import { twoTone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";

export const BR = 0.34, BL = 1.0, HOLE_R = 0.3, TILT = (22 * Math.PI) / 180;
export const HOLES: [number, number][] = (() => {
  const out: [number, number][] = [], s = HOLE_R / 3.6;
  for (let j = -4; j <= 4; j++) for (let i = -5; i <= 5; i++) {
    const x = (i + (((j % 2) + 2) % 2) * 0.5) * s * 1.05, y = j * s * 0.91;
    if (Math.hypot(x, y) < HOLE_R * 0.88) out.push([x, y]);
  }
  return out.sort((a, b) => Math.hypot(...a) - Math.hypot(...b)).slice(0, 32);
})();
export const TARGET = (() => { let best = 24; for (let i = 24; i < 32; i++) if (HOLES[i][0] + HOLES[i][1] * 0.6 > HOLES[best][0] + HOLES[best][1] * 0.6) best = i; return best; })();

/** painted honeycomb plate: oak boards, drilled holes with a dark bore + chipped rim; undrilled ones pencil-marked */
export const plateTex = (drilled: number[]) => ctex("plate_" + drilled.length, 1024, 1024, (g, r) => {
  const S = 1024, k = S / (2 * BR), cx = S / 2, cy = S / 2;
  const cols = ["#c9934f", "#bf8a48", "#d29d5a", "#c48e4c"];
  for (let i = 0; i < 6; i++) { g.fillStyle = cols[i % 4]; g.fillRect(i * S / 6, 0, S / 6, S); }
  g.globalAlpha = 0.18; g.strokeStyle = "#7a4a22"; g.lineWidth = 3;
  for (let i = 0; i < 70; i++) { const x = r() * S, y0 = r() * S; g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + 8, y0 + 120, x - 8, y0 + 240, x + 4, y0 + 360); g.stroke(); }
  g.globalAlpha = 1; g.strokeStyle = "#3a2414"; g.lineWidth = 5;
  for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(i * S / 6, 0); g.lineTo(i * S / 6, S); g.stroke(); }
  HOLES.forEach(([hx, hy], i) => {
    const x = cx + hx * k, y = cy - hy * k, rr = 0.019 * k;
    if (!drilled.includes(i)) {
      g.strokeStyle = "rgba(40,30,30,0.85)"; g.lineWidth = 4; g.beginPath(); g.moveTo(x - rr, y - rr); g.lineTo(x + rr, y + rr); g.moveTo(x + rr, y - rr); g.lineTo(x - rr, y + rr); g.stroke();
      g.beginPath(); g.arc(x, y, rr * 1.15, 0, 7); g.stroke(); return;
    }
    g.fillStyle = "#e8c48a"; g.beginPath(); g.arc(x, y, rr * 1.32, 0, 7); g.fill();
    const gr = g.createRadialGradient(x - rr * 0.3, y - rr * 0.35, rr * 0.1, x, y, rr);
    gr.addColorStop(0, "#0a0503"); gr.addColorStop(0.7, "#1c0e08"); gr.addColorStop(1, "#4a2812"); g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); g.strokeStyle = "#3a2414"; g.lineWidth = 3; g.stroke();
  });
});

/** hexagonal plate with the honeycomb on its +z face (ExtrudeGeometry), centred on its axis */
export const plateMesh = (drilled: number[]) => {
  const hex = new THREE.Shape();
  for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3, p = [Math.cos(a) * BR * 0.985, Math.sin(a) * BR * 0.985]; if (k) hex.lineTo(p[0], p[1]); else hex.moveTo(p[0], p[1]); }
  const g = new THREE.ExtrudeGeometry(hex, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 });
  const t = plateTex(drilled); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.repeat.set(1 / (2 * BR), 1 / (2 * BR)); t.offset.set(0.5, 0.5);
  const m = new THREE.Mesh(g, [lam("n_plate" + drilled.length, () => ({ map: t })), lam("n_plateSide", () => ({ color: "#b98647" }))]);
  m.castShadow = m.receiveShadow = true; return m;
};

const mats = () => ({
  plank: lam("n_plank", () => ({ map: planksHD() })), wood: lam("n_wood", () => ({ map: beam() })), dark: lam("n_dark", () => ({ color: "#5b3a24" })),
  brass: twoTone(new THREE.MeshPhongMaterial({ color: "#c8952e", specular: "#ffe2a0", shininess: 50 }), 0.15),
  iron: lam("l_iron", () => ({ color: "#3d414c" })), paper: lam("l_paper", () => ({ color: "#b8322c" })), fuse: lam("l_fuse", () => ({ color: "#3a2a1c" })),
  rope: lam("l_rope", () => ({ color: "#a07a48" })),
});
const mesh = (g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D) => { const o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
const cylBetween = (a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material, parent: THREE.Object3D, seg = 12) => {
  const d = b.clone().sub(a), g = new THREE.CylinderGeometry(r, r, d.length(), seg), o = mesh(g, m, parent);
  o.position.copy(a).add(b).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o;
};

export class CartLauncher {
  root = new THREE.Group();       // cart frame: origin on the walkway, front = local -z
  box = new THREE.Group();        // box frame: axis = local -z, centre at the origin
  arrows: THREE.InstancedMesh;    // the 32 arrow heads + powder tubes visible in the mouth (scaled to 0 once fired)
  private arrowM: THREE.Matrix4[] = [];
  knotL = V(0, -0.12, BL / 2 + 0.16);
  wheels: THREE.Group[] = [];
  slide = 0;                      // arrow #0 pulled out of its hole (m) for the 'paper tube' close-up
  rope: THREE.Vector3[] = [];     // rope polyline in world space (knot -> hero's hand), set by place()
  constructor(parent: THREE.Object3D) {
    const M = mats(), R = this.root;
    // cart: two spoked wheels on an axle, bed, rails, two handles at the back
    for (const sx of [-0.62, 0.62]) {
      const w = new THREE.Group(); w.position.set(sx, 0.42, 0.05); w.rotation.y = Math.PI / 2; R.add(w); this.wheels.push(w);
      mesh(new THREE.TorusGeometry(0.4, 0.04, 10, 40), M.wood, w); mesh(new THREE.TorusGeometry(0.415, 0.014, 6, 40), M.iron, w);
      const hub = new THREE.CylinderGeometry(0.075, 0.075, 0.15, 14); hub.rotateX(Math.PI / 2); mesh(hub, M.brass, w);
      for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; cylBetween(V(0, 0, 0), V(Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0), 0.016, M.wood, w, 8); }
    }
    cylBetween(V(-0.7, 0.42, 0.05), V(0.7, 0.42, 0.05), 0.035, M.iron, R);
    mesh(new THREE.BoxGeometry(1.0, 0.06, 1.25), M.plank, R).position.set(0, 0.66, 0.05);
    for (const sx of [-0.42, 0.42]) { mesh(new THREE.BoxGeometry(0.06, 0.06, 1.9), M.wood, R).position.set(sx, 0.62, 0.6); cylBetween(V(sx, 0.62, 1.5), V(sx, 0.62, 1.65), 0.03, M.wood, R); mesh(new THREE.BoxGeometry(0.05, 0.36, 0.05), M.wood, R).position.set(sx, 0.42, 1.38); }
    // box: hex tube with brass rings, cherry edge rails, honeycomb front plate (all 32 drilled), plain back plate
    this.box.position.set(0, 1.04, -0.05); this.box.rotation.x = TILT; R.add(this.box);
    const tube = new THREE.CylinderGeometry(BR, BR, BL, 6, 1, true); tube.rotateX(Math.PI / 2); tube.rotateZ(Math.PI / 6); mesh(tube, M.plank, this.box);
    for (const z of [-BL / 2, BL / 2]) { const t = new THREE.TorusGeometry(BR * 1.01, 0.026, 8, 6); t.rotateZ(Math.PI / 6); mesh(t, M.brass, this.box).position.z = z; }
    for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; mesh(new THREE.BoxGeometry(0.04, 0.04, BL), M.dark, this.box).position.set(Math.cos(a) * BR, Math.sin(a) * BR, 0); }
    const front = plateMesh(HOLES.map((_, i) => i)); front.rotation.y = Math.PI; front.position.z = -BL / 2 - 0.005; this.box.add(front);
    const back = new THREE.CylinderGeometry(BR * 0.98, BR * 0.98, 0.04, 6); back.rotateX(Math.PI / 2); back.rotateZ(Math.PI / 6); mesh(back, M.plank, this.box).position.z = BL / 2 + 0.02;
    // arrows: iron head + red paper tube showing in each hole (instanced)
    const head = new THREE.ConeGeometry(0.014, 0.07, 8); head.rotateX(-Math.PI / 2); head.translate(0, 0, -0.04);
    const tb = new THREE.CylinderGeometry(0.017, 0.017, 0.16, 10); tb.rotateX(Math.PI / 2); tb.translate(0, 0, 0.09);
    const shaft = new THREE.CylinderGeometry(0.006, 0.006, 0.85, 6); shaft.rotateX(Math.PI / 2); shaft.translate(0, 0, 0.42);
    const parts = [head.toNonIndexed(), tb.toNonIndexed(), shaft.toNonIndexed()], pos: number[] = [], nor: number[] = [], col: number[] = [];
    parts.forEach((p, i) => { pos.push(...(p.attributes.position.array as Float32Array)); nor.push(...(p.attributes.normal.array as Float32Array)); for (let k = 0; k < p.attributes.position.count; k++) col.push(...(i === 1 ? [0.72, 0.2, 0.17] : i === 2 ? [0.79, 0.64, 0.42] : [0.24, 0.25, 0.3])); });
    const ag = new THREE.BufferGeometry(); ag.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); ag.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); ag.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    this.arrows = new THREE.InstancedMesh(ag, twoTone(new THREE.MeshLambertMaterial({ vertexColors: true })), 32);
    HOLES.forEach(([hx, hy], i) => { const m4 = new THREE.Matrix4().makeTranslation(hx, hy, -BL / 2 - 0.01); /* heads poke ~4 cm out of the plate */ this.arrowM.push(m4); this.arrows.setMatrixAt(i, m4); });
    this.box.add(this.arrows);
    // fuses: each hole's rear end -> the knot behind the box
    for (const [hx, hy] of HOLES) { const c = new THREE.CatmullRomCurve3([V(hx, hy, BL / 2 + 0.03), V(hx * 0.6, hy * 0.6, BL / 2 + 0.1), this.knotL.clone()]);
      mesh(new THREE.TubeGeometry(c, 8, 0.0045, 5), M.fuse, this.box); }
    mesh(new THREE.SphereGeometry(0.03, 10, 8), M.fuse, this.box).position.copy(this.knotL);
    parent.add(R);
  }
  /** place the cart (origin, yaw) and lay the rope from the knot to `hand` (world) */
  /** move the cart (rope stays where it was laid) and turn the wheels by the distance rolled */
  move(origin: THREE.Vector3, rolled: number) { this.root.position.copy(origin); this.root.updateMatrixWorld(true); for (const w of this.wheels) w.rotation.z = rolled / 0.4; }
  place(origin: THREE.Vector3, yaw: number, hand: THREE.Vector3, ropeParent: THREE.Object3D, ropeMat?: THREE.Material) {
    this.root.position.copy(origin); this.root.rotation.y = yaw; this.root.updateMatrixWorld(true);
    const k = this.knotW(), mid = k.clone().lerp(hand, 0.5); mid.y = Math.min(k.y, hand.y) - 0.35;
    this.rope = new THREE.CatmullRomCurve3([k, k.clone().add(V(0, -0.12, 0.08)), mid, hand]).getPoints(40);
    if (!this.ropeMesh) { this.ropeMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(this.rope), 60, 0.011, 6), ropeMat || mats().rope); this.ropeMesh.castShadow = true; ropeParent.add(this.ropeMesh); }
  }
  ropeMesh: THREE.Mesh | null = null;
  knotW() { return this.knotL.clone().applyMatrix4(this.box.matrixWorld); }
  holeW(i: number, z = -BL / 2 - 0.02) { return V(HOLES[i][0], HOLES[i][1], z).applyMatrix4(this.box.matrixWorld); }
  rearW(i: number) { return this.holeW(i, BL / 2 + 0.03); }
  axisW() { return V(0, 0, -1).transformDirection(this.box.matrixWorld); }
  /** hide fired arrows */
  setFired(fired: (i: number) => boolean) {
    const z = new THREE.Matrix4().makeScale(0, 0, 0);
    this.arrowM.forEach((m, i) => this.arrows.setMatrixAt(i, fired(i) ? z : i === 0 && this.slide ? new THREE.Matrix4().makeTranslation(0, 0, -this.slide).multiply(m) : m)); this.arrows.instanceMatrix.needsUpdate = true;
  }
}
