// The volley: rocket physics (thrust while the powder tube burns, gravity, drag; integrated at 240 Hz), solved per rocket so
// it lands on a soldier; checked against our own parapet. Renders the fuse sparks, muzzle flashes, smoke trails, the arrows
// in flight, and every impact (cel cumulus with ink edge on the measured colour ramp, flash, debris, dust ring).
import * as THREE from "three";
import { V } from "../bridge/build";
import { NOINK } from "../bridge/ink";
import { twoTone } from "../bridge/shade";
import { gY, WALL_OUT, WALK_Y, MERLONS } from "./outside";
import { CartLauncher, HOLES } from "./launcher";
import { Soldier } from "./army";

const G = 9.81, THRUST = 14, KD = 0.0045, V0 = 12, DT = 1 / 240;
type P = { t: number; x: number; y: number; z: number };
export type Rocket = { i: number; t0: number; T: number; burn: number; path: P[]; hit: THREE.Vector3; tHit: number };

function fly(p0: THREE.Vector3, dir: THREE.Vector3, burn: number, wob: number) {
  let x = p0.x, y = p0.y, z = p0.z, vx = dir.x * V0, vy = dir.y * V0, vz = dir.z * V0, t = 0; const path: P[] = [{ t: 0, x, y, z }];
  while (t < 7) {
    const sp = Math.hypot(vx, vy, vz), ux = vx / sp, uy = vy / sp, uz = vz / sp, th = t < burn ? THRUST : 0, wl = t < burn ? Math.sin(t * 23 + wob * 6) * 1.6 : 0;
    vx += (ux * th - KD * sp * vx + wl * uz) * DT; vy += (uy * th - KD * sp * vy - G) * DT; vz += (uz * th - KD * sp * vz - wl * ux) * DT;
    x += vx * DT; y += vy * DT; z += vz * DT; t += DT;
    if (Math.round(t / DT) % 4 === 0) path.push({ t, x, y, z });
    if (y <= gY(x, z) + 0.05) { path.push({ t, x, y, z }); break; }
  }
  return { path, T: t, hit: V(x, y, z) };
}
const yawDir = (d: THREE.Vector3, a: number) => V(d.x * Math.cos(a) - d.z * Math.sin(a), d.y, d.x * Math.sin(a) + d.z * Math.cos(a));
function aim(h: THREE.Vector3, axis: THREE.Vector3, T: THREE.Vector3, seed: number) {
  const bearing = (a: THREE.Vector3, b: THREE.Vector3) => Math.atan2(b.z - a.z, b.x - a.x);
  let yaw = 0, burn = 0.5;
  const pitch = (Math.sin(seed * 12.9898) * 0.5) * 0.035; const d0 = axis.clone(); d0.y += pitch; d0.normalize();
  for (let it = 0; it < 3; it++) {
    const d = yawDir(d0, yaw); let lo = 0.05, hi = 2.0;
    for (let k = 0; k < 24; k++) { const b = (lo + hi) / 2, r = fly(h, d, b, seed); const dr = Math.hypot(r.hit.x - h.x, r.hit.z - h.z) - Math.hypot(T.x - h.x, T.z - h.z); if (dr < 0) lo = b; else hi = b; }
    burn = (lo + hi) / 2; const r = fly(h, d, burn, seed); yaw += bearing(h, T) - bearing(h, r.hit);
  }
  const r = fly(h, yawDir(d0, yaw), burn, seed); return { ...r, burn };
}
/** our own parapet must never be touched (the "rockets landing in our wall" failure of the last cut) */
function wallCheck(path: P[]) {
  for (const p of path) if (p.z < WALL_OUT + 0.45 && p.z > WALL_OUT - 0.2) {
    if (p.y < WALK_Y + 0.95) return false;
    for (const m of MERLONS) if (Math.abs(p.x - m.x) < m.w / 2 + 0.03 && p.y < WALK_Y + 1.8) return false;
  }
  return true;
}

// soft particle points (world-size sprites) with per-point colour + alpha
const pointsMat = (additive: boolean) => new THREE.ShaderMaterial({
  uniforms: { uScale: { value: 1000 } }, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false,
  vertexShader: `attribute float size; attribute vec4 rgba; varying vec4 vC; uniform float uScale;
    void main(){ vC = rgba; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = clamp(size * uScale / -mv.z, 0.0, 2048.0); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying vec4 vC; void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d, d) * 4.0; if (r > 1.0) discard;
    float a = vC.a * pow(1.0 - r, 1.4); gl_FragColor = vec4(vC.rgb, a); }`,
});
class Puffs {
  pts: THREE.Points; n = 0; private P: Float32Array; private S: Float32Array; private C: Float32Array;
  constructor(parent: THREE.Object3D, private max: number, additive: boolean, order: number) {
    this.P = new Float32Array(max * 3); this.S = new Float32Array(max); this.C = new Float32Array(max * 4);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(this.P, 3)); g.setAttribute("size", new THREE.BufferAttribute(this.S, 1)); g.setAttribute("rgba", new THREE.BufferAttribute(this.C, 4));
    this.pts = new THREE.Points(g, pointsMat(additive)); this.pts.frustumCulled = false; this.pts.layers.set(NOINK); this.pts.renderOrder = order; parent.add(this.pts);
    this.pts.onBeforeRender = (r, _s, cam) => { const h = r.getRenderTarget()?.height ?? r.domElement.height; (this.pts.material as THREE.ShaderMaterial).uniforms.uScale.value = (cam as THREE.PerspectiveCamera).projectionMatrix.elements[5] * h / 2; };
  }
  begin() { this.n = 0; }
  add(x: number, y: number, z: number, size: number, c: THREE.Color, a: number) {
    if (this.n >= this.max || a <= 0.004) return; const i = this.n++;
    this.P[i * 3] = x; this.P[i * 3 + 1] = y; this.P[i * 3 + 2] = z; this.S[i] = size; this.C[i * 4] = c.r; this.C[i * 4 + 1] = c.g; this.C[i * 4 + 2] = c.b; this.C[i * 4 + 3] = Math.min(1, a);
  }
  end() { const g = this.pts.geometry; g.setDrawRange(0, this.n); for (const k of ["position", "size", "rgba"]) (g.attributes[k] as THREE.BufferAttribute).needsUpdate = true; }
}
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const RAMP = ["#fff2c0", "#ffca5f", "#ffb04a", "#ff9a3c", "#f27f33", "#e0602a", "#c16b29", "#7a4a2e", "#33231f"].map((h) => new THREE.Color(h));
const ramp = (u: number, out: THREE.Color) => { const x = Math.max(0, Math.min(0.9999, u)) * (RAMP.length - 1), i = Math.floor(x); return out.copy(RAMP[i]).lerp(RAMP[i + 1], x - i); };

export class Volley {
  rockets: Rocket[] = [];
  private smoke: Puffs; private glow: Puffs;
  private bodies: THREE.InstancedMesh; private fire: THREE.InstancedMesh; private clouds: THREE.InstancedMesh; private debris: THREE.InstancedMesh;
  private c = new THREE.Color(); private m4 = new THREE.Matrix4(); private q = new THREE.Quaternion(); private s3 = new THREE.Vector3();
  constructor(parent: THREE.Object3D, private L: CartLauncher, army: Soldier[], private T: { light: number; knot: number; first: number; gap: number }) {
    // ---- solve the volley ----
    const used = new Set<number>(), axis = L.axisW(), targets: THREE.Vector3[] = [];
    HOLES.forEach((_, i) => {
      let best: Soldier | null = null;
      for (let k = 0; k < 500 && !best; k++) { const s = army[Math.floor(hash(i * 31.7 + k * 1.37) * army.length)];
        if (!used.has(s.id) && targets.every((t) => Math.hypot(t.x - s.x, t.z - s.z) > 2.3)) best = s; }
      best = best || army[(i * 7) % army.length]; used.add(best.id);
      const tg = V(best.x + (hash(i * 1.9) - 0.5) * 0.6, 0, best.z + (hash(i * 2.3) - 0.5) * 0.6); tg.y = gY(tg.x, tg.z); targets.push(tg);
      const a = aim(L.holeW(i), axis, tg, i + 1);
      if (!wallCheck(a.path)) throw new Error(`rocket ${i} would touch our parapet`);
      const t0 = T.first + i * T.gap + hash(i * 6.1) * 0.012;
      this.rockets.push({ i, t0, T: a.T, burn: a.burn, path: a.path, hit: a.hit, tHit: t0 + a.T });
    });
    // ---- render objects ----
    this.smoke = new Puffs(parent, 9000, false, 4); this.glow = new Puffs(parent, 3000, true, 6);
    const shaft = new THREE.CylinderGeometry(0.008, 0.008, 0.9, 5); shaft.rotateX(Math.PI / 2); shaft.translate(0, 0, 0.45);
    this.bodies = new THREE.InstancedMesh(shaft, twoTone(new THREE.MeshLambertMaterial({ color: "#c9a46a" })), 32); this.bodies.frustumCulled = false; parent.add(this.bodies);
    this.fire = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: true }), 32 * 10); this.fire.frustumCulled = false; parent.add(this.fire);
    this.clouds = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), twoTone(new THREE.MeshLambertMaterial({ color: "#ffffff" })), 32 * 12); this.clouds.frustumCulled = false; this.clouds.castShadow = false; parent.add(this.clouds);
    this.debris = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.6, 0.8), twoTone(new THREE.MeshLambertMaterial({ color: "#4a3420" })), 32 * 16); this.debris.frustumCulled = false; parent.add(this.debris);
  }
  hits() { return this.rockets.map((r) => ({ t: r.tHit, x: r.hit.x, z: r.hit.z })); }
  posAt(r: Rocket, t: number) {
    const u = Math.max(0, Math.min(t - r.t0, r.T)), P = r.path; let i = Math.min(P.length - 2, Math.floor(u / (P[1].t - P[0].t)));
    while (i > 0 && P[i].t > u) i--; while (i < P.length - 2 && P[i + 1].t < u) i++;
    const a = P[i], b = P[i + 1], k = Math.max(0, Math.min(1, (u - a.t) / ((b.t - a.t) || 1e-6)));
    return V(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, a.z + (b.z - a.z) * k);
  }
  update(t: number, camPos?: THREE.Vector3) {
    const sm = this.smoke, gl = this.glow, c = this.c, L = this.L, Tm = this.T;
    sm.begin(); gl.begin();
    L.setFired((i) => t >= this.rockets[i].t0);
    // ---- fuse: spark runs the rope (hand -> knot), then every fuse (knot -> rear of its hole) ----
    if (t >= Tm.light && t < Tm.knot) { const u = (t - Tm.light) / (Tm.knot - Tm.light), R = L.rope, idx = (1 - u) * (R.length - 1), i0 = Math.floor(idx), p = R[i0].clone().lerp(R[Math.min(R.length - 1, i0 + 1)], idx - i0);
      this.spark(p, t, 1); for (let k = 1; k < 10; k++) { const uu = Math.max(0, u - k * 0.02), j = (1 - uu) * (R.length - 1), q = R[Math.floor(j)]; sm.add(q.x, q.y + k * 0.02, q.z, 0.05 + k * 0.03, c.set("#dedad2"), 0.35 * (1 - k / 10)); } }
    for (const r of this.rockets) if (t >= Tm.knot && t < r.t0) { const u = (t - Tm.knot) / (r.t0 - Tm.knot); this.spark(L.knotW().lerp(L.rearW(r.i), u), t, 0.55); }
    // ---- rockets: muzzle flash + backblast, smoke trail (thick while the tube burns), body + flame ----
    let nb = 0;
    for (const r of this.rockets) {
      const a = t - r.t0; if (a < 0) continue;
      const mouth = L.holeW(r.i), rear = L.rearW(r.i), ax = L.axisW();
      if (a < 0.12) { gl.add(mouth.x, mouth.y, mouth.z, 0.9 * (1 - a / 0.12) + 0.2, c.set("#ffd27a"), 1); gl.add(rear.x, rear.y, rear.z, 0.6, c.set("#ffae48"), 0.8); }
      for (let k = 0; k < 3; k++) { const ag = a - k * 0.06; if (ag < 0 || ag > 5) continue; const e = Math.exp(-ag / 1.8);
        sm.add(mouth.x + ax.x * ag * 0.8 + (hash(r.i * 9 + k) - 0.5) * ag * 0.6, mouth.y + ag * 0.35, mouth.z + ax.z * ag * 0.8, 0.25 + ag * 0.7, c.set("#eceae4"), 0.35 * e);
        sm.add(rear.x - ax.x * ag * 0.6, rear.y + ag * 0.45, rear.z - ax.z * ag * 0.6, 0.22 + ag * 0.6, c.set("#e2dfd8"), 0.28 * e); }
      const u = Math.min(a, r.T);
      for (let s = 0; s <= u; s += 0.02) { const p = this.posAt(r, r.t0 + s), age = t - (r.t0 + s), burnK = s < r.burn + 0.25 ? 1 : 0.5;
        const near = camPos ? Math.min(1, Math.max(0, (p.distanceTo(camPos) - 5) / 12)) ** 1.5 : 1;
        sm.add(p.x + Math.sin(s * 5 + r.i) * age * 0.1, p.y + age * 0.3, p.z, (0.18 + age * 0.6) * burnK, c.set(age < 0.15 ? "#fff8ea" : "#f3f1ec"), 0.75 * Math.exp(-age / 3.2) * Math.min(1, s * 10) * near); }
      if (a < r.T) { const p = this.posAt(r, t), p2 = this.posAt(r, t - 0.02), d = p.clone().sub(p2).normalize();
        this.m4.compose(p.clone().addScaledVector(d, -0.9), this.q.setFromUnitVectors(V(0, 0, 1), d), this.s3.set(1, 1, 1)); this.bodies.setMatrixAt(nb++, this.m4);
        const f = p.clone().addScaledVector(d, -0.25), burning = a < r.burn + 0.25; gl.add(f.x, f.y, f.z, burning ? 0.7 : 0.25, c.set("#ff9d38"), 1); gl.add(f.x, f.y, f.z, burning ? 0.3 : 0.1, c.set("#fff6d8"), 1); }
    }
    this.bodies.count = nb; this.bodies.instanceMatrix.needsUpdate = true;
    // ---- impacts ----
    let nf = 0, nc = 0, nd = 0;
    for (const r of this.rockets) {
      const a = t - r.tHit; if (a < 0 || a > 8) continue; const h = r.hit, y0 = gY(h.x, h.z), sd = r.i * 17;
      if (a < 0.14) { gl.add(h.x, y0 + 1, h.z, 9 * (1 - a / 0.14) + 2, c.set("#fff3c4"), 0.9); }
      for (let k = 0; k < 10; k++) {   // fireball: cel spheres growing fast (full size in ~3 f at 30 fps), colour ramp over 35 f, then smoke
        const g = hash(sd + k * 5), ox = (hash(sd + k * 7) - 0.5) * 1.4, oz = (hash(sd + k * 11) - 0.5) * 1.4, grow = 1 - Math.exp(-a / 0.07);
        const sz = (0.32 + g * 0.38) * grow * (1 + a * 0.3), rise = a * (1.0 + g * 0.8);
        if (a < 1.17) { this.m4.compose(V(h.x + ox * grow, y0 + 0.5 + rise + g * 0.9, h.z + oz * grow), this.q.identity(), this.s3.setScalar(sz)); this.fire.setMatrixAt(nf, this.m4); this.fire.setColorAt(nf++, ramp(a / 1.17 * 0.75 + g * 0.1, c)); }
      }
      for (let k = 0; k < 12; k++) {   // smoke column: cumulus that takes over and holds >= 70 f (30 fps), drifting up
        const g = hash(sd + k * 13), st = 0.35 + g * 0.5; if (a < st) continue; const aa = a - st;
        const sz = (0.45 + g * 0.5) * (1 + aa * 0.35) * Math.min(1, aa * 4) * (a > 6 ? Math.max(0, 1 - (a - 6) / 2) : 1);
        this.m4.compose(V(h.x + (hash(sd + k) - 0.5) * 2.2, y0 + 0.8 + aa * (0.9 + g) + g * 1.6, h.z + (hash(sd + k * 3) - 0.5) * 2.2), this.q.identity(), this.s3.setScalar(sz));
        this.clouds.setMatrixAt(nc, this.m4); this.clouds.setColorAt(nc++, c.set(k % 3 ? "#5e5148" : "#7d7064"));
      }
      for (let k = 0; k < 16; k++) { const vh = 2 + hash(sd + k * 13) * 6, an = hash(sd + k * 17) * 6.283, vz = 3 + hash(sd + k * 19) * 6, y = y0 + 0.3 + vz * a - 4.9 * a * a;
        if (a > 3 || y < y0 - 0.3) continue; this.m4.compose(V(h.x + Math.cos(an) * vh * a, y, h.z + Math.sin(an) * vh * a), this.q.setFromAxisAngle(V(1, 0.3, 0.2).normalize(), a * 9 + k), this.s3.setScalar(0.08 + hash(k + sd) * 0.1));
        this.debris.setMatrixAt(nd++, this.m4); }
      if (a < 2) for (let k = 0; k < 10; k++) { const an = k / 10 * 6.283 + r.i, rr = 0.3 + a * 3.2 * Math.exp(-a * 0.6);   // dust ring along the ground
        sm.add(h.x + Math.cos(an) * rr, y0 + 0.3 + a * 0.3, h.z + Math.sin(an) * rr, 1.0 + a * 1.2, c.set("#b59a78"), 0.35 * Math.exp(-a / 1.1) * Math.min(1, a * 8)); }
      if (a < 0.5) for (let k = 0; k < 14; k++) { const vh = 8 + hash(sd + k * 23) * 14, an = hash(sd + k * 29) * 6.283, vz = 6 + hash(sd + k * 31) * 12;
        gl.add(h.x + Math.cos(an) * vh * a, y0 + 0.5 + vz * a - 4.9 * a * a, h.z + Math.sin(an) * vh * a, 0.12, c.set("#ffd27a"), 1 - a / 0.5); }
    }
    for (const [m, n] of [[this.fire, nf], [this.clouds, nc], [this.debris, nd]] as [THREE.InstancedMesh, number][]) { m.count = n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    sm.end(); gl.end();
  }
  private spark(p: THREE.Vector3, t: number, big: number) {
    const f = Math.floor(t * 60), c = this.c;
    for (let k = 0; k < 12; k++) { const a = hash(k * 7 + f) * 6.28, r2 = hash(k * 3 + f) * 0.07 * big; this.glow.add(p.x + Math.cos(a) * r2, p.y + Math.abs(Math.sin(a)) * r2 * 1.5, p.z + Math.sin(a * 1.3) * r2, (0.025 + hash(k) * 0.025) * big, c.set(k % 3 ? "#ff9d38" : "#fff2c0"), 1); }
    this.glow.add(p.x, p.y, p.z, 0.12 * big, c.set("#fff2c0"), 1); this.glow.add(p.x, p.y, p.z, 0.32 * big, c.set("#ff9d38"), 0.55);
  }
}
