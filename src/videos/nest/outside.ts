// Outside the fort: the grassy hill falling away from the outer wall face (z = -11) to the plain where the army stands,
// the outer parapet with merlons and the launcher's embrasure, and the remaining three fort walls (for wide/aerial shots).
import * as THREE from "three";
import { Batch, V, boxGeo, lam } from "../bridge/build";
import { stoneHD, grassHD, rep, rng } from "../bridge/paint";

export const WALL_OUT = -11.0, WALK_Y = 7.35;
/** ground height outside the wall (y), 0 at the wall foot, ~-6 at 50 m out, gentle undulation */
export const gY = (x: number, z: number) => {
  if (z > WALL_OUT) return 0;
  const d = WALL_OUT - z;
  return -Math.min(d, 70) * 0.12 - Math.max(0, d - 70) * 0.03 + Math.sin(x * 0.09 + z * 0.05) * 0.6 * Math.min(1, d / 15) + Math.sin(x * 0.027 - z * 0.04) * 1.1 * Math.min(1, d / 30);
};
/** launcher embrasure on the outer parapet */
export const LX = 1.0;
export const MERLONS: { x: number; w: number }[] = (() => {
  const out: { x: number; w: number }[] = [];
  for (let x = -39.25; x < 40; x += 1.7) { if (Math.abs(x - LX) < 1.2) continue; out.push({ x, w: 0.95 }); }
  return out;
})();

export function buildOutside(b: Batch, root: THREE.Object3D) {
  const turf = lam("o_turf", () => ({ map: rep(grassHD(), 1, 1), color: "#9fbf72" }));
  const stone = lam("n_wall", () => ({}));
  const cope = lam("n_cope", () => ({}));
  const out = lam("o_out", () => ({ map: stoneHD("o_outHD", ["#b8b3a8", "#ada89d", "#c2bdb2", "#a39e94"], "#7f7a72") }));
  // hill: a grid displaced by gY (outside only), 400 x 300 m
  const g = new THREE.PlaneGeometry(400, 300, 200, 150); g.rotateX(-Math.PI / 2); g.translate(0, 0, WALL_OUT - 150);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { p.setY(i, gY(p.getX(i), p.getZ(i)) - 0.02); uv.setXY(i, uv.getX(i) * 100, uv.getY(i) * 75); }
  g.computeVertexNormals(); b.add(g, turf);
  // outer face of the wall + foot plinth
  b.add(boxGeo(V(-40, -8, WALL_OUT - 0.25), V(40, 7, WALL_OUT + 0.01), 2), out);
  b.add(boxGeo(V(-40, -8, WALL_OUT - 0.9), V(40, 0.6, WALL_OUT - 0.2), 2), out);
  // outer parapet: low wall + merlons, gap for the launcher
  b.add(boxGeo(V(-40, WALK_Y, WALL_OUT - 0.2), V(40, WALK_Y + 0.9, WALL_OUT + 0.45), 2), cope);
  for (const m of MERLONS) b.add(boxGeo(V(m.x - m.w / 2, WALK_Y + 0.9, WALL_OUT - 0.2), V(m.x + m.w / 2, WALK_Y + 1.75, WALL_OUT + 0.45), 2), cope);
  // the other three walls of the fort (side walls at x = +-40, back wall at z = 34), with merlons on the outer edge
  for (const sx of [-1, 1]) {
    b.add(boxGeo(V(sx * 40 - 2.1, -8, -11.2), V(sx * 40 + 2.1, 7, 34), 2), stone);
    for (let z = -10; z < 34; z += 1.7) b.add(boxGeo(V(sx * 40 + sx * 1.4 - 0.35, 7, z), V(sx * 40 + sx * 1.4 + 0.35, 7.9, z + 0.95), 2), cope);
  }
  b.add(boxGeo(V(-42, 0, 32), V(42, 7, 36), 2), stone);
  for (let x = -41; x < 42; x += 1.7) b.add(boxGeo(V(x, 7, 35.3), V(x + 0.95, 7.9, 36)), cope);
  // corner towers
  for (const [x, z] of [[-40, -9], [40, -9], [-40, 34], [40, 34]]) {
    b.add(boxGeo(V(x - 3.2, -8, z - 3.2), V(x + 3.2, 10, z + 3.2), 2), stone);
    for (let k = 0; k < 4; k++) for (const s of [-1, 1]) b.add(boxGeo(V(x - 3.2 + k * 1.7, 10, z + s * 3.2 - 0.35), V(x - 2.4 + k * 1.7, 10.9, z + s * 3.2 + 0.35)), cope);
  }
  // scattered trees on the plain (round canopies), kept away from the army ground
  const leafA = lam("e_leafA", () => ({ color: "#4f9a3e" })), leafB = lam("e_leafB", () => ({ color: "#3d7f35" })), bark = lam("e_bark", () => ({ color: "#6b4a30" }));
  for (let i = 0; i < 60; i++) { const r = rng(i + 1200), x = -160 + r() * 320, z = -20 - r() * 220; if (Math.abs(x) < 26 && z > -80) continue;
    const y = gY(x, z), s = 1.4 + r() * 1.4, t = new THREE.CylinderGeometry(0.2 * s, 0.26 * s, 2.4 * s, 8); t.translate(x, y + 1.2 * s, z); b.add(t, bark);
    for (let k = 0; k < 4; k++) { const c = new THREE.IcosahedronGeometry(s * (0.9 + r() * 0.4), 1); c.translate(x + (r() - 0.5) * s, y + 2.8 * s + r() * s, z + (r() - 0.5) * s); b.add(c, k % 2 ? leafA : leafB); } }
}
