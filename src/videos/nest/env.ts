// Samulation #3: environment dressing for the Ming fort (all procedural, copyright-free). Toon family A: painted
// textures, two-tone light, ink on props/buildings. Builds into the world's static Batch + root.
//   layers: distant ridges + treeline beyond the wall | gate tower with a two-tier upturned tile roof, lanterns, merlon flags |
//   barracks hall, wall stair | courtyard life (trees, well, weapon rack, hay cart, training dummy, firewood, path, rocks,
//   flowers) | instanced grass tufts.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Batch, V, boxGeo, lam } from "../bridge/build";
import { roofHD, ctex, rng, stoneHD, planksHD, beam } from "../bridge/paint";
import { twoTone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";

const plaster = () => ctex("n_plaster", 512, 512, (g, r) => {
  g.fillStyle = "#efe0c2"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) { g.fillStyle = r() > 0.5 ? "rgba(190,160,120,0.12)" : "rgba(255,250,235,0.18)"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 60, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
});
const lattice = () => ctex("n_lattice", 256, 256, (g) => {
  g.fillStyle = "#3a2216"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#f3dfb0";
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) g.fillRect(14 + x * 60, 14 + y * 60, 48, 48);
  g.strokeStyle = "#7a2a20"; g.lineWidth = 16; g.strokeRect(8, 8, 240, 240);
});
const door = () => ctex("n_door", 256, 512, (g) => {
  g.fillStyle = "#9c2c22"; g.fillRect(0, 0, 256, 512); g.fillStyle = "#7a2018"; g.fillRect(124, 0, 8, 512);
  g.fillStyle = "#e0a43c"; for (let y = 0; y < 5; y++) for (let x = 0; x < 4; x++) { g.beginPath(); g.arc(28 + x * 26 + (x > 1 ? 104 : 0) - (x > 1 ? 52 : 0), 70 + y * 90, 7, 0, 7); g.fill(); }
  g.strokeStyle = "#4a140e"; g.lineWidth = 10; g.strokeRect(5, 5, 246, 502);
});
const target = () => ctex("n_target", 256, 256, (g) => {
  const c = ["#f4ead2", "#b8322c", "#f4ead2", "#2d5a8c", "#e0a43c"];
  c.forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(128, 128, 124 - i * 24, 0, 7); g.fill(); });
});

/** hip roof with upturned eaves: a 4-sided frustum whose corner vertices lift (Chinese roof silhouette) */
const hipRoof = (w: number, d: number, h: number, lift: number) => {
  const g = new THREE.CylinderGeometry(0.08, Math.SQRT1_2, 1, 4, 4, false); g.rotateY(Math.PI / 4); g.scale(w, h, d); g.translate(0, h / 2, 0);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = 1 - y / h;                 // t = 1 at the eave
    const corner = Math.abs(x) / (w / 2) * Math.abs(z) / (d / 2);                         // 1 at the corners
    p.setY(i, y - Math.sin(t * Math.PI) * h * 0.18 + Math.pow(t, 3) * lift * corner);     // concave sag + corner lift
  }
  g.computeVertexNormals();
  const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * 0.9, uv.getY(i) * h * 1.6);
  return g;
};

export function buildEnv(b: Batch, root: THREE.Object3D) {
  const M = {
    roof: lam("e_roof", () => ({ map: roofHD("#4d6b66") })),
    roofRed: lam("e_roofRed", () => ({ map: roofHD("#8a3a2a") })),
    plaster: lam("e_plaster", () => ({ map: plaster() })),
    red: lam("e_red", () => ({ color: "#a8322a" })),
    darkwood: lam("e_darkwood", () => ({ color: "#5b3a24" })),
    wood: lam("e_wood", () => ({ map: beam() })),
    plank: lam("e_plank", () => ({ map: planksHD() })),
    lattice: lam("e_lattice", () => ({ map: lattice() })),
    door: lam("e_door", () => ({ map: door() })),
    stone: lam("e_stone", () => ({ map: stoneHD("e_stone", ["#cfc3ae", "#c5b8a2", "#d8ccb8", "#bcae97"], "#8f816d") })),
    flag: lam("e_flagS", () => ({ map: stoneHD("e_flagS", ["#d9cdb8", "#cec1aa", "#e1d6c4", "#c6b8a1"], "#9c8e78") })),
    gold: lam("e_gold", () => ({ color: "#e0a43c" })),
    hay: lam("e_hay", () => ({ color: "#e8c46a" })),
    straw: lam("e_straw", () => ({ color: "#d9b25c" })),
    target: lam("e_target", () => ({ map: target() })),
    rock: lam("e_rock", () => ({ color: "#9a958c" })),
    bark: lam("e_bark", () => ({ color: "#6b4a30" })),
    leafA: lam("e_leafA", () => ({ color: "#4f9a3e" })), leafB: lam("e_leafB", () => ({ color: "#3d7f35" })), leafC: lam("e_leafC", () => ({ color: "#67ad48" })),
    water: lam("e_water", () => ({ color: "#2f6f9a" })),
    flagY: lam("e_flagY", () => ({ color: "#e8b62c" })), flagR: lam("e_flagR", () => ({ color: "#c23a2c" })),
  };
  const add = (g: THREE.BufferGeometry, m: THREE.Material) => b.add(g, m);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, m: THREE.Material, tile = 0) => add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile), m);
  const cyl = (x: number, y: number, z: number, r: number, h: number, m: THREE.Material, seg = 14, r2 = r) => { const g = new THREE.CylinderGeometry(r, r2, h, seg); g.translate(x, y + h / 2, z); add(g, m); };

  // ---------------- beyond the wall: ridges (far -> near) + treeline, hazed by the fog ----------------
  const ridge = (z: number, base: number, amp: number, seed: number, col: string) => {
    const r = rng(seed), pts: number[] = [], N = 70, X0 = -260, X1 = 260;
    let h = 0.5; for (let i = 0; i <= N; i++) { h = Math.min(1, Math.max(0, h + (r() - 0.5) * 0.5)); pts.push(base + amp * (0.35 + 0.65 * h) * (0.7 + 0.3 * Math.sin(i * 0.4 + seed))); }
    const pos: number[] = [];
    for (let i = 0; i < N; i++) { const xa = X0 + (X1 - X0) * i / N, xb = X0 + (X1 - X0) * (i + 1) / N;
      pos.push(xa, -5, z, xb, -5, z, xb, pts[i + 1], z, xa, -5, z, xb, pts[i + 1], z, xa, pts[i], z); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, fog: true })); m.layers.set(NOINK); root.add(m);
  };
  ridge(-330, 14, 70, 3, "#a9bfd6"); ridge(-240, 8, 48, 7, "#8fb0b8"); ridge(-150, 2, 30, 11, "#78a07a");
  // treeline just outside the wall: canopy tops peek over the battlements
  for (let i = 0; i < 26; i++) { const r = rng(i + 300), x = -36 + i * 2.9 + r() * 1.5, z = -14 - r() * 6, s = 2.2 + r() * 1.6;
    for (let k = 0; k < 3; k++) { const g = new THREE.IcosahedronGeometry(s * (0.7 + r() * 0.4), 1); g.translate(x + (r() - 0.5) * s, 6.5 + s * 1.3 + r() * s * 0.8, z + (r() - 0.5) * s); add(g, k % 2 ? M.leafB : M.leafA); } }

  // ---------------- gate tower on the wall (right of the action): two-tier hall, red pillars, upturned tile roofs ----------------
  const GX = 7.5, GZ = -8.9, GY = 7.35;
  box(GX - 3.6, GY, GZ - 2.4, GX + 3.6, GY + 0.35, GZ + 2.4, M.stone, 2);
  for (const dx of [-3, -1, 1, 3]) for (const dz of [-1.9, 1.9]) cyl(GX + dx, GY + 0.35, GZ + dz, 0.16, 2.6, M.red, 12);
  box(GX - 3.1, GY + 0.35, GZ - 1.6, GX + 3.1, GY + 2.6, GZ + 1.55, M.plaster, 2);
  box(GX - 0.7, GY + 0.35, GZ + 1.56, GX + 0.7, GY + 2.3, GZ + 1.6, M.door);
  for (const dx of [-2.1, 2.1]) box(GX + dx - 0.55, GY + 1.1, GZ + 1.56, GX + dx + 0.55, GY + 2.1, GZ + 1.6, M.lattice);
  box(GX - 3.9, GY + 2.9, GZ - 2.7, GX + 3.9, GY + 3.05, GZ + 2.7, M.darkwood);
  { const g = hipRoof(8.6, 6.0, 1.5, 0.75); g.translate(GX, GY + 2.95, GZ); add(g, M.roof); }
  box(GX - 2.2, GY + 3.9, GZ - 1.3, GX + 2.2, GY + 5.3, GZ + 1.3, M.plaster, 2);
  for (const dx of [-1.8, 1.8]) cyl(GX + dx, GY + 3.9, GZ + 1.2, 0.12, 1.4, M.red, 10);
  { const g = hipRoof(6.0, 4.2, 1.6, 0.6); g.translate(GX, GY + 5.25, GZ); add(g, M.roof); }
  box(GX - 1.6, GY + 6.75, GZ - 0.08, GX + 1.6, GY + 6.95, GZ + 0.08, M.darkwood);
  // red paper lanterns under the eaves (emissive core blooms a little)
  const lantern = new THREE.MeshLambertMaterial({ color: "#d8402e", emissive: new THREE.Color("#ff6a2a"), emissiveIntensity: 0.6 });
  for (const dx of [-2.5, 2.5]) { const g = new THREE.SphereGeometry(0.28, 14, 10); g.scale(1, 1.25, 1); const m = new THREE.Mesh(g, twoTone(lantern)); m.position.set(GX + dx, GY + 2.2, GZ + 2.3); root.add(m);
    cyl(GX + dx, GY + 2.5, GZ + 2.3, 0.012, 0.42, M.darkwood, 5); }

  // ---------------- small flags on every other merlon ----------------
  for (let x = -38.5, i = 0; x < 40; x += 3.4, i++) {
    cyl(x + 0.47, 8.25, -7.0, 0.025, 1.6, M.darkwood, 5);
    const pos = [x + 0.47, 9.8, -7.0, x + 0.47, 9.25, -7.0, x + 1.25, 9.55, -7.0];
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0.5], 2)); g.computeVertexNormals();
    add(g, i % 2 ? M.flagY : M.flagR);
  }

  // ---------------- barracks hall (left background) ----------------
  const BX = -8.0, BZ = -2.4;
  box(BX - 4, 0, BZ - 2.2, BX + 4, 0.35, BZ + 2.2, M.stone, 2);
  box(BX - 3.6, 0.35, BZ - 1.8, BX + 3.6, 3.1, BZ + 1.6, M.plaster, 2);
  for (const dx of [-3.4, -1.2, 1.2, 3.4]) cyl(BX + dx, 0.35, BZ + 1.85, 0.15, 2.9, M.red, 12);
  box(BX - 0.65, 0.35, BZ + 1.6, BX + 0.65, 2.45, BZ + 1.66, M.door);
  for (const dx of [-2.4, 2.4]) box(BX + dx - 0.6, 1.2, BZ + 1.6, BX + dx + 0.6, 2.3, BZ + 1.66, M.lattice);
  box(BX - 4.1, 3.1, BZ - 2.3, BX + 4.1, 3.25, BZ + 2.4, M.darkwood);
  { const g = hipRoof(9.4, 5.6, 1.9, 0.7); g.translate(BX, 3.2, BZ + 0.05); add(g, M.roofRed); }
  for (const dx of [-1.6, 1.6]) { const g = new THREE.SphereGeometry(0.22, 12, 8); g.scale(1, 1.25, 1); const m = new THREE.Mesh(g, twoTone(lantern.clone())); m.position.set(BX + dx, 2.75, BZ + 2.25); root.add(m); }

  // ---------------- wooden stair up to the wall walk (right) ----------------
  for (let i = 0; i < 12; i++) box(11.5 + i * 0.5, 0, -6.75, 12.0 + i * 0.5, 0.6 * (i + 1), -5.4, M.stone, 2);
  for (let i = 0; i < 12; i += 2) cyl(11.75 + i * 0.5, 0.6 * (i + 1), -5.45, 0.03, 0.9, M.darkwood, 6);

  // ---------------- courtyard life ----------------
  // flagstone path from the gate to the work area
  for (let i = 0; i < 22; i++) { const r = rng(i + 500), t = i / 21, x = 6.5 - t * 6.0 + (r() - 0.5) * 0.5, z = -5.4 + t * 9.5;
    const g = new THREE.CylinderGeometry(0.42 + r() * 0.2, 0.44 + r() * 0.2, 0.05, 7); g.rotateY(r() * 3); g.scale(1.2, 1, 0.9); g.translate(x, 0.02, z); add(g, M.flag); }
  // trees in the courtyard (round toon canopies)
  const tree = (x: number, z: number, s: number, seed: number) => { const r = rng(seed); cyl(x, 0, z, 0.18 * s, 2.6 * s, M.bark, 9, 0.24 * s);
    for (let k = 0; k < 7; k++) { const g = new THREE.IcosahedronGeometry(s * (0.75 + r() * 0.45), 2); g.translate(x + (r() - 0.5) * 1.6 * s, 2.7 * s + r() * 1.3 * s, z + (r() - 0.5) * 1.4 * s); add(g, [M.leafA, M.leafB, M.leafC][k % 3]); } };
  tree(-3.6, -4.2, 1.15, 1); tree(4.3, -3.8, 1.0, 2); tree(-12.5, 2.5, 1.3, 3); tree(10.5, 1.0, 1.25, 4);
  // stone well
  { const wx = 8.6, wz = 1.2; const ring = new THREE.CylinderGeometry(0.85, 0.9, 0.75, 20, 1, true); ring.translate(wx, 0.375, wz); add(ring, M.stone);
    const rim = new THREE.TorusGeometry(0.86, 0.09, 8, 24); rim.rotateX(Math.PI / 2); rim.translate(wx, 0.76, wz); add(rim, M.stone);
    const wat = new THREE.CircleGeometry(0.8, 20); wat.rotateX(-Math.PI / 2); wat.translate(wx, 0.45, wz); add(wat, M.water);
    for (const dx of [-0.8, 0.8]) box(wx + dx - 0.06, 0, wz - 0.06, wx + dx + 0.06, 2.0, wz + 0.06, M.darkwood);
    box(wx - 0.95, 1.95, wz - 0.07, wx + 0.95, 2.07, wz + 0.07, M.darkwood);
    const rf = hipRoof(2.3, 1.4, 0.55, 0.2); rf.translate(wx, 2.05, wz); add(rf, M.roof); cyl(wx + 0.05, 1.2, wz, 0.13, 0.22, M.wood, 10); }
  // weapon rack with spears and halberds (left, mid-ground)
  { const rx = -5.2, rz = 1.8; for (const dx of [-0.8, 0.8]) box(rx + dx - 0.05, 0, rz - 0.05, rx + dx + 0.05, 1.7, rz + 0.05, M.darkwood);
    box(rx - 0.9, 1.45, rz - 0.06, rx + 0.9, 1.55, rz + 0.06, M.darkwood); box(rx - 0.9, 0.35, rz - 0.06, rx + 0.9, 0.45, rz + 0.06, M.darkwood);
    for (let i = 0; i < 7; i++) { const x = rx - 0.65 + i * 0.22; cyl(x, 0.05, rz + 0.1, 0.02, 2.3, M.wood, 6);
      const tip = new THREE.ConeGeometry(0.045, 0.28, 6); tip.translate(x, 2.48, rz + 0.1); add(tip, M.stone);
      if (i % 3 === 1) { const ax = new THREE.BoxGeometry(0.28, 0.16, 0.02); ax.translate(x + 0.1, 2.2, rz + 0.1); add(ax, M.stone); }
      const tas = new THREE.SphereGeometry(0.05, 8, 6); tas.translate(x, 2.32, rz + 0.1); add(tas, M.flagR); } }
  // hay cart (right, mid-ground)
  { const cx = 6.6, cz = 4.6; box(cx - 1.1, 0.55, cz - 0.6, cx + 1.1, 0.65, cz + 0.6, M.plank, 1);
    for (const s of [-1, 1]) box(cx - 1.1, 0.65, cz + s * 0.6 - 0.04, cx + 1.1, 1.0, cz + s * 0.6 + 0.04, M.plank, 1);
    for (const s of [-1, 1]) { const w = new THREE.TorusGeometry(0.42, 0.06, 8, 16); w.translate(cx - 0.2, 0.42, cz + s * 0.68); add(w, M.darkwood);
      const hub = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 10); hub.rotateX(Math.PI / 2); hub.translate(cx - 0.2, 0.42, cz + s * 0.68); add(hub, M.darkwood);
      for (let k = 0; k < 6; k++) { const sp = new THREE.BoxGeometry(0.04, 0.8, 0.03); sp.rotateZ(k * Math.PI / 6); sp.translate(cx - 0.2, 0.42, cz + s * 0.68); add(sp, M.darkwood); } }
    box(cx + 1.1, 0.55, cz - 0.05, cx + 2.4, 0.62, cz + 0.05, M.darkwood);
    for (let k = 0; k < 6; k++) { const r = rng(k + 40), g = new THREE.SphereGeometry(0.45, 10, 8); g.scale(1.2, 0.7, 1); g.translate(cx - 0.7 + k * 0.28, 1.05 + r() * 0.15, cz + (r() - 0.5) * 0.4); add(g, M.hay); } }
  // straw training dummy with a painted target (left foreground-mid)
  { const dx = -3.3, dz = 4.4; cyl(dx, 0, dz, 0.05, 1.7, M.darkwood, 8); const body = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 12); body.translate(dx, 1.15, dz); add(body, M.straw);
    const head = new THREE.SphereGeometry(0.2, 12, 10); head.translate(dx, 1.75, dz); add(head, M.straw); box(dx - 0.55, 1.35, dz - 0.04, dx + 0.55, 1.43, dz + 0.04, M.darkwood);
    const tg = new THREE.CircleGeometry(0.2, 24); tg.translate(dx, 1.2, dz + 0.31); add(tg, M.target); }
  // firewood stack + archery target by the wall
  for (let row = 0; row < 4; row++) for (let i = 0; i < 7 - row; i++) { const g = new THREE.CylinderGeometry(0.11, 0.11, 1.0, 8); g.rotateX(Math.PI / 2); g.translate(-0.7 + i * 0.23 + row * 0.115, 0.11 + row * 0.2, -5.6); add(g, M.wood); }
  { const tg = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 24); tg.rotateX(Math.PI / 2); tg.rotateX(-0.25); tg.translate(1.6, 0.9, -5.4); add(tg, M.straw);
    const f = new THREE.CircleGeometry(0.55, 24); f.rotateX(-0.25); f.translate(1.6, 0.92, -5.31); add(f, M.target);
    for (const dx of [-0.4, 0.4]) box(1.6 + dx - 0.04, 0, -5.7, 1.6 + dx + 0.04, 0.95, -5.6, M.darkwood); }
  // rocks + flowers scattered
  for (let i = 0; i < 18; i++) { const r = rng(i + 700), g = new THREE.DodecahedronGeometry(0.12 + r() * 0.22, 0); g.scale(1.3, 0.7, 1); g.translate(-9 + r() * 18, 0.05, -4 + r() * 15); add(g, M.rock); }
  const petal = [lam("e_fl1", () => ({ color: "#f2d24a" })), lam("e_fl2", () => ({ color: "#f4f0e8" })), lam("e_fl3", () => ({ color: "#d8607a" }))];
  for (let i = 0; i < 70; i++) { const r = rng(i + 900), x = -9 + r() * 18, z = -3 + r() * 16; if (Math.hypot(x + 0.1, (z - 8) * 1.3) < 2.4) continue;
    const g = new THREE.IcosahedronGeometry(0.05, 0); g.translate(x, 0.12, z); add(g, petal[i % 3]); }

}

// ---------------- dense blade grass (refs: thousands of blades, dark roots -> light yellow-green tips) ----------------
/** instanced curved blades; density falls off with distance from `focus` (where the camera looks) */
export function grassField(root: THREE.Object3D, focus: THREE.Vector3, keepOut: (x: number, z: number) => number) {
  // one blade: 4 segments, tapered, bent, vertex colour root -> tip
  const seg = 4, pos: number[] = [], colr: number[] = [], idx: number[] = [];
  const root0 = new THREE.Color("#3a7222"), mid = new THREE.Color("#72b83a"), tip = new THREE.Color("#d2ec82"), c = new THREE.Color();
  for (let i = 0; i <= seg; i++) { const t = i / seg, w = 0.022 * (1 - t * 0.92), bend = t * t * 0.09;
    pos.push(-w, t, bend, w, t, bend);
    (t < 0.5 ? c.copy(root0).lerp(mid, t * 2) : c.copy(mid).lerp(tip, (t - 0.5) * 2)); colr.push(c.r, c.g, c.b, c.r, c.g, c.b);
    if (i < seg) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const blade = new THREE.BufferGeometry(); blade.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); blade.setAttribute("color", new THREE.Float32BufferAttribute(colr, 3)); blade.setIndex(idx); blade.computeVertexNormals();
  // normals point up-ish so blades light like a lawn, not like paper strips
  const nr = blade.attributes.normal as THREE.BufferAttribute; for (let i = 0; i < nr.count; i++) nr.setXYZ(i, 0, 0.85, 0.53);
  const mat = twoTone(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  const N = 170000, inst = new THREE.InstancedMesh(blade, mat, N), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), tint = new THREE.Color();
  const r = rng(7777); let n = 0;
  for (let i = 0; i < N * 6 && n < N; i++) {
    const rad = Math.pow(r(), 0.75) * 20, a = r() * Math.PI * 2, x = focus.x + Math.cos(a) * rad, z = focus.z + Math.sin(a) * rad * 0.85;
    const keep = keepOut(x, z); if (keep <= 0 || r() > keep) continue;
    const h = 0.2 + r() * 0.26 + (r() > 0.9 ? 0.2 : 0);
    e.set((r() - 0.5) * 0.5, r() * Math.PI * 2, (r() - 0.5) * 0.5); m4.compose(V(x, 0, z), q.setFromEuler(e), sc.set(1, h, 1)); inst.setMatrixAt(n, m4);
    const k = 0.82 + r() * 0.3; inst.setColorAt(n, tint.setRGB(k * (0.95 + r() * 0.1), k, k * (0.85 + r() * 0.15))); n++;
  }
  inst.count = n; inst.receiveShadow = true; inst.castShadow = false; inst.layers.set(NOINK); inst.frustumCulled = false; root.add(inst);
  return n;
}

// ---------------- 3D stone blocks on the inner wall face (refs: bevelled blocks with real relief) ----------------
export function stoneBlocks(root: THREE.Object3D, x0: number, x1: number, y0: number, y1: number, zFace: number, seed = 1) {
  const geo = new RoundedBoxGeometry(1, 1, 1, 2, 0.07);
  const mat = twoTone(new THREE.MeshLambertMaterial({ map: stoneHD("e_block", ["#e4e0d8", "#e4e0d8", "#e4e0d8", "#e4e0d8"], "#e4e0d8") }));
  const list: THREE.Matrix4[] = [], cols: THREE.Color[] = [], r = rng(seed), H = 0.62;
  const pal = ["#bdb8ad", "#b1aca1", "#c8c3b8", "#a7a297", "#c1bbae", "#9f9a90"];
  for (let row = 0, y = y0; y < y1 - 0.05; row++, y += H) {
    let x = x0 - (row % 2) * 0.5 - r() * 0.3;
    while (x < x1) { const w = 1.0 + r() * 0.7, h = Math.min(H, y1 - y) - 0.035, d = 0.16 + r() * 0.05;
      list.push(new THREE.Matrix4().compose(V(x + w / 2, y + h / 2 + 0.017, zFace + d / 2 - 0.06), new THREE.Quaternion(), V(w - 0.035, h, d)));
      cols.push(new THREE.Color(pal[Math.floor(r() * pal.length)])); x += w; }
  }
  const inst = new THREE.InstancedMesh(geo, mat, list.length);
  list.forEach((m, i) => { inst.setMatrixAt(i, m); inst.setColorAt(i, cols[i]); });
  inst.castShadow = true; inst.receiveShadow = true; inst.layers.set(NOINK); root.add(inst);
}
