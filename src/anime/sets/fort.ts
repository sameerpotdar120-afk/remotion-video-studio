// Frontier fort, bright late afternoon: log palisade with pointed tops + firing walkway, big open double gate with a lookout
// over it, two corner blockhouses, three plank barracks + an HQ cabin, flagpole with a plain (fictional) flag, field cannon,
// packed-dirt parade ground, target range (rail fence with bottles + tin cans, hay backstop) at the far north end.
// World: metres, y = 0 floor. Gate in the south wall (+Z), targets at the north end (-Z). Sun low in the south-west.
import * as THREE from "three";
import type { BuiltSet } from "./types";
import { toonE, ink, box, reseed, rnd, canvasTex, dab, planks, shingles, stones, barkTex, grassCard, treeTex, daySky, dayCloud, mesa, groundMat, tufts, dustMotes, keyLight, merged, M4, smoothNormals, noShadow, rod, clearGlowCache } from "./westkit";

const X0 = -26, X1 = 26, Z0 = -34, Z1 = 30, GATE = 2.7, WALL_H = 4.6;
export const FORT_SUN = new THREE.Vector3(-0.66, 0.5, 0.56).normalize();

// packed-dirt parade ground inside, dry prairie outside; world [-80,80]^2 mapped onto the canvas (canvas y = world z)
const groundTex = () => canvasTex(2048, 2048, (g) => {
  const S = 2048 / 160, P = (x: number, z: number) => [(x + 80) * S, (z + 80) * S] as const;
  // prairie base
  g.fillStyle = "#b9a96a"; g.fillRect(0, 0, 2048, 2048);
  const pal = ["rgba(150,150,80,0.22)", "rgba(205,185,120,0.22)", "rgba(120,125,70,0.2)", "rgba(225,205,150,0.18)", "rgba(160,140,170,0.08)"];
  for (let i = 0; i < 22000; i++) dab(g, rnd() * 2048, rnd() * 2048, 4 + rnd() * 18, 2 + rnd() * 6, rnd() * 3.14, pal[(rnd() * pal.length) | 0]);
  // trodden dirt around the palisade + the track out of the gate
  const [ax, az] = P(X0 - 3, Z0 - 3), [bx, bz] = P(X1 + 3, Z1 + 3);
  g.fillStyle = "rgba(200,160,110,0.55)"; g.beginPath(); g.roundRect(ax, az, bx - ax, bz - az, 40); g.fill();
  const [gx, gz] = P(0, Z1); g.strokeStyle = "rgba(205,165,115,0.85)"; g.lineCap = "round"; g.lineWidth = 7 * S; g.beginPath(); g.moveTo(gx, gz); g.bezierCurveTo(gx + 10, gz + 200, gx - 60, gz + 380, gx - 20, 2048); g.stroke();
  // parade ground: packed warm dirt
  const [ix, iz] = P(X0, Z0), [jx, jz] = P(X1, Z1); const base = g.createLinearGradient(0, iz, 0, jz); base.addColorStop(0, "#d6b088"); base.addColorStop(1, "#e2bf94"); g.fillStyle = base; g.fillRect(ix, iz, jx - ix, jz - iz);
  // pebbles
  for (let i = 0; i < 1500; i++) { const x = rnd() * 2048, y = rnd() * 2048, r = 0.8 + rnd() * 1.4; dab(g, x, y + 1, r, r * 0.7, 0, "rgba(90,60,60,0.45)"); dab(g, x, y, r, r * 0.7, 0, "#cfa987"); dab(g, x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.3, 0, "rgba(255,240,215,0.85)"); }
  // grass strokes outside the walls (and in the corners inside, where nobody walks)
  for (let i = 0; i < 30000; i++) { const x = rnd() * 2048, y = rnd() * 2048; const wx = x / S - 80, wz = y / S - 80;
    const inside = wx > X0 && wx < X1 && wz > Z0 && wz < Z1; const nearWall = inside && (wx < X0 + 2.5 || wx > X1 - 2.5 || wz < Z0 + 1.6);
    if ((inside && !nearWall) || (!inside && wx > X0 - 3 && wx < X1 + 3 && wz > Z0 - 3 && wz < Z1 + 3 && rnd() < 0.85)) continue;
    if (!inside && Math.abs(wx + (wz - Z1) * 0.05) < 4 && wz > Z1) continue;
    g.strokeStyle = `hsl(${50 + rnd() * 30}, ${30 + rnd() * 25}%, ${34 + rnd() * 28}%)`; g.lineWidth = 2.2; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (rnd() - 0.5) * 6, y - 8, x + (rnd() - 0.5) * 10, y - 10 - rnd() * 14); g.stroke();
    if (rnd() < 0.015) { dab(g, x, y - 14, 3, 3, 0, rnd() < 0.5 ? "#fff3d0" : "#ffd25a"); dab(g, x, y - 14, 1.2, 1.2, 0, "#e08a2a"); } }
});

// parade ground (inside the palisade only), finer: ~3 cm per pixel. canvas x = world x - X0, canvas y = world z - Z0
const paradeTex = () => canvasTex(1664, 2048, (g) => {
  const S = 2048 / (Z1 - Z0), P = (x: number, z: number) => [(x - X0) * S, (z - Z0) * S] as const; const W = 1664, H = 2048;
  const base = g.createLinearGradient(0, 0, 0, H); base.addColorStop(0, "#d4ad86"); base.addColorStop(1, "#e0bd92"); g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) { const x = rnd() * W, y = rnd() * H, r = 60 + rnd() * 260; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rnd() < 0.5 ? "rgba(250,222,180,0.28)" : "rgba(160,110,92,0.16)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  const dirt = ["rgba(241,203,160,0.20)", "rgba(196,140,104,0.16)", "rgba(226,165,140,0.13)", "rgba(170,140,175,0.11)", "rgba(255,232,196,0.20)"];
  for (let i = 0; i < 30000; i++) dab(g, rnd() * W, rnd() * H, 3 + rnd() * 12, 1.5 + rnd() * 4, rnd() * 3.14, dirt[(rnd() * dirt.length) | 0]);
  // wheel ruts: gate -> HQ, soft dark trough + lit crest
  for (const ox of [-0.8, 0.8]) for (const [w, c] of [[30, "rgba(140,92,68,0.14)"], [11, "rgba(105,68,52,0.18)"], [3, "rgba(255,230,190,0.3)"]] as [number, string][]) {
    g.strokeStyle = c; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); const [sx, sz] = P(ox + (w === 4 ? 0.22 : 0), Z1 + 1); g.moveTo(sx, sz); const [m1x, m1z] = P(ox + 1, 14), [m2x, m2z] = P(ox + 9, 2), [ex, ez] = P(ox + 12, Z0 + 11); g.bezierCurveTo(m1x, m1z, m2x, m2z, ex, ez); g.stroke(); }
  // hoof + boot prints along the ruts and round the flagpole
  for (let i = 0; i < 1400; i++) { const u = rnd(); const x = 9 * u * u + (rnd() - 0.5) * 3.5, z = Z1 - u * (Z1 + 10); const [px, pz] = P(x, z); dab(g, px, pz, 3, 5, rnd(), "rgba(110,72,55,0.22)"); }
  const [fx, fz] = P(0, -4); const fr = g.createRadialGradient(fx, fz, 0, fx, fz, 14 * S); fr.addColorStop(0, "rgba(245,218,176,0.35)"); fr.addColorStop(0.75, "rgba(170,120,92,0.10)"); fr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = fr; g.fillRect(fx - 14 * S, fz - 14 * S, 28 * S, 28 * S);
  for (let i = 0; i < 1600; i++) { const a = rnd() * Math.PI * 2, d = (1.5 + rnd() * 12) * S; dab(g, fx + Math.cos(a) * d, fz + Math.sin(a) * d, 2.5, 4.5, a + 1.57, "rgba(110,72,55,0.2)"); }
  // range lane: scuffed, brass casings glinting
  const [rx, rz] = P(-5, Z0 + 3), [rx2, rz2] = P(5, -10); const rl = g.createLinearGradient(0, rz, 0, rz2); rl.addColorStop(0, "rgba(190,140,100,0.25)"); rl.addColorStop(1, "rgba(190,140,100,0)"); g.fillStyle = rl; g.fillRect(rx, rz, rx2 - rx, rz2 - rz);
  for (let i = 0; i < 40; i++) { const [cx, cz] = P((rnd() - 0.5) * 2.5, Z0 + 17 + rnd() * 3); dab(g, cx, cz, 1.6, 0.8, rnd() * 3, "#e0b848"); }
  // pebbles (1-4 cm)
  for (let i = 0; i < 5000; i++) { const x = rnd() * W, y = rnd() * H, r = 0.6 + rnd() * 1.4; dab(g, x, y + 0.8, r, r * 0.7, 0, "rgba(90,60,60,0.45)"); dab(g, x, y, r, r * 0.7, 0, "#d4ae8c"); dab(g, x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.3, 0, "rgba(255,242,220,0.85)"); }
  // tufts of grass + weeds along the walls
  for (let i = 0; i < 26000; i++) { const x = rnd() * W, y = rnd() * H; const wx = x / S, wz = y / S; const d = Math.min(wx, (X1 - X0) - wx, wz) + rnd() * 1.2; if (d > 2.2) continue;
    g.strokeStyle = `hsl(${50 + rnd() * 30}, ${30 + rnd() * 25}%, ${34 + rnd() * 28}%)`; g.lineWidth = 1.6; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (rnd() - 0.5) * 5, y - 6, x + (rnd() - 0.5) * 8, y - 8 - rnd() * 10); g.stroke(); }
  // soft edge to the outer ground
  g.strokeStyle = "rgba(185,169,106,0.5)"; g.lineWidth = 30; g.strokeRect(0, 0, W, H);
});

// palisade: one merged mesh of upright logs with sharpened tops, along a wall segment (skipping an opening)
const palisade = (pts: [number, number][], skip: (x: number, z: number) => boolean) => {
  const parts: { geo: THREE.BufferGeometry; m: THREE.Matrix4 }[] = [];
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 9, 1, true); const cone = new THREE.ConeGeometry(1, 1, 9, 1, true);
  for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1]; const L = Math.hypot(x1 - x0, z1 - z0); const n = Math.round(L / 0.36);
    for (let k = 0; k < n; k++) { const u = (k + 0.5) / n; const x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u; if (skip(x, z)) continue;
      const r = 0.17 + rnd() * 0.035, h = WALL_H - 0.25 + rnd() * 0.5, tip = 0.45 + rnd() * 0.25, lean = (rnd() - 0.5) * 0.03, ry = rnd() * 6;
      parts.push({ geo: cyl, m: M4(x, h / 2, z, lean, ry, lean * 0.7, r, h, r) }); parts.push({ geo: cone, m: M4(x, h + tip / 2 - 0.01, z, lean, ry, lean * 0.7, r, tip, r) }); } }
  const geo = merged(parts); geo.computeVertexNormals();
  const tex = barkTex("#8a6a4e"); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 1.4);
  const m = new THREE.Mesh(geo, toonE("#c09a74", { map: tex, shade: 0.6 })); ink(m, 0.02); return m;
};
// barracks / HQ: plank walls, shingle gable roof, front porch facing +Z (local), door, glass windows, stovepipe
const building = (W: number, D: number, H: number, wallCol: string, opts: { porch?: boolean; door?: number; wins?: number[]; hq?: boolean } = {}) => {
  const g = new THREE.Group(); const wall = toonE(wallCol, { map: planks(wallCol, "#4a3426", 14, true), shade: 0.62 }); const trim = toonE("#e6d8bc", { shade: 0.66 }); const dark = toonE("#4a3628", { shade: 0.6 });
  const body = box(W, H, D, wall, 0, H / 2 + 0.35, 0); ((body.material as THREE.MeshBasicMaterial).map as THREE.Texture).repeat.set(W / 4, H / 3); g.add(body);
  g.add(box(W + 0.2, 0.35, D + 0.2, toonE("#7a6e66", { map: stones(), shade: 0.6 }), 0, 0.175, 0));
  const rise = D * 0.32, over = 0.45; const roofM = toonE("#8f8a90", { map: shingles(225, 10, 44), shade: 0.62 });
  for (const sz of [-1, 1]) { const half = Math.hypot(D / 2 + over, rise); const r = box(W + 0.7, 0.14, half, roofM, 0, H + 0.35 + rise / 2, sz * (D / 4 + over / 2), 0.025); r.rotation.x = sz * Math.atan2(rise, D / 2 + over); g.add(r); }
  const gable = new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(0, rise)]);
  for (const sx of [-1, 1]) { const gm = new THREE.Mesh(new THREE.ShapeGeometry(gable), wall); gm.rotation.y = (Math.PI / 2) * sx; gm.position.set(sx * W / 2 * 1.002, H + 0.35, 0); g.add(gm); }
  g.add(box(W + 0.75, 0.12, 0.12, trim, 0, H + 0.35 + rise, 0, 0.012)); // ridge
  // corner boards
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.14, H, 0.14, trim, sx * W / 2, H / 2 + 0.35, sz * D / 2, 0.008));
  const fz = D / 2 + 0.03;
  const glass = canvasTex(128, 128, (c) => { const gr = c.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, "#9fc4e8"); gr.addColorStop(0.45, "#4b6890"); gr.addColorStop(1, "#2c3650"); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); c.strokeStyle = "rgba(255,255,255,0.55)"; c.lineWidth = 8; c.beginPath(); c.moveTo(20, 70); c.lineTo(70, 20); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(40, 90); c.lineTo(90, 40); c.stroke(); });
  const gm = new THREE.MeshBasicMaterial({ map: glass, toneMapped: false, color: "#d8dce8" });
  for (const x of opts.wins ?? []) { g.add(box(1.0, 1.15, 0.05, gm, x, 1.95, fz, 0)); g.add(box(1.18, 0.1, 0.1, trim, x, 2.58, fz + 0.03, 0.01)); g.add(box(1.24, 0.08, 0.16, trim, x, 1.33, fz + 0.05, 0.01)); for (const s of [-1, 1]) g.add(box(0.09, 1.25, 0.1, trim, x + s * 0.55, 1.95, fz + 0.03, 0.008)); g.add(box(0.05, 1.15, 0.07, trim, x, 1.95, fz + 0.03, 0)); g.add(box(1.0, 0.05, 0.07, trim, x, 1.95, fz + 0.03, 0));
    for (const s of [-1, 1]) g.add(box(0.5, 1.25, 0.05, toonE("#5d7a8c", { map: planks("#5d7a8c", "#2f3e48", 4) }), x + s * 0.83, 1.95, fz + 0.05, 0.008)); } // shutters
  const dx = opts.door ?? 0; g.add(box(1.05, 2.15, 0.08, toonE("#6a4a34", { map: planks("#6a4a34", "#3a2618", 5), shade: 0.6 }), dx, 0.35 + 1.08, fz, 0.012)); g.add(box(1.25, 0.12, 0.12, trim, dx, 0.35 + 2.2, fz + 0.03, 0.01)); for (const s of [-1, 1]) g.add(box(0.1, 2.2, 0.1, trim, dx + s * 0.58, 0.35 + 1.1, fz + 0.03, 0.008));
  g.add(box(0.07, 0.07, 0.07, toonE("#c8a040", { rim: 0.4 }), dx + 0.36, 1.4, fz + 0.06, 0));
  if (opts.porch !== false) { const PD = 1.9; const deck = toonE("#8a6a4e", { map: planks("#8a6a4e", "#3a2a1e", 18), shade: 0.6 });
    g.add(box(W, 0.12, PD, deck, 0, 0.36, D / 2 + PD / 2)); for (let i = 0; i < 2; i++) g.add(box(1.6, 0.17, 0.32, deck, dx, 0.09 + i * 0.17 - 0.0, D / 2 + PD + 0.16 + (1 - i) * 0.32, 0.012));
    const n = Math.max(2, Math.round(W / 3)); for (let i = 0; i <= n; i++) { const x = -W / 2 + 0.12 + (W - 0.24) * i / n; if (Math.abs(x - dx) < 0.9) continue; g.add(box(0.15, 2.45, 0.15, trim, x, 0.36 + 1.22, D / 2 + PD - 0.1, 0.01)); }
    const pr = box(W + 0.4, 0.1, PD + 0.5, roofM, 0, 0.36 + 2.62, D / 2 + PD / 2 + 0.1, 0.02); pr.rotation.x = 0.16; g.add(pr);
    g.add(box(W + 0.4, 0.14, 0.12, trim, 0, 0.36 + 2.45, D / 2 + PD - 0.08, 0.01));
    for (const s of [-1, 1]) g.add(box(W / 2 - 1.2, 0.08, 0.08, dark, s * (W / 4 + 0.6), 1.25, D / 2 + PD - 0.1, 0.01)); }
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.6, 12), toonE("#2e2c30", { rim: 0.35 })); pipe.position.set(W * 0.3, H + 0.35 + rise * 0.6 + 0.6, -D * 0.12); ink(pipe, 0.012); g.add(pipe);
  if (opts.hq) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 12), toonE("#2e2c30")); st.position.set(W * 0.3, H + 0.35 + rise * 0.6 + 1.45, -D * 0.12); g.add(st); }
  return g;
};
// two-storey corner blockhouse (upper floor overhangs, pyramid roof, gun slits)
const blockhouse = () => {
  const g = new THREE.Group(); const logT = planks("#7c5c42", "#3a281c", 9, true); const wall = toonE("#8e6a4c", { map: logT, shade: 0.6 });
  g.add(box(5, 3.4, 5, wall, 0, 1.7, 0)); g.add(box(6.2, 3.0, 6.2, wall, 0, 3.4 + 1.5, 0));
  const roofM = toonE("#8f8a90", { map: shingles(225, 10, 44), shade: 0.62 }); const roof = new THREE.Mesh(new THREE.ConeGeometry(5.0, 2.6, 4, 1), roofM); roof.rotation.y = Math.PI / 4; roof.position.y = 6.4 + 1.3; ink(roof, 0.03); g.add(roof);
  const slit = toonE("#1e1612"); for (const [x, z, ry] of [[0, 3.11, 0], [0, -3.11, 0], [3.11, 0, Math.PI / 2], [-3.11, 0, Math.PI / 2]] as [number, number, number][]) for (const o of [-1.4, 1.4]) { const s = box(0.5, 0.22, 0.04, slit, x + (ry ? 0 : o), 5.0, z + (ry ? o : 0), 0); s.rotation.y = ry; g.add(s); }
  for (const x of [-2.6, 2.6]) for (const z of [-2.6, 2.6]) g.add(box(0.22, 0.6, 0.22, toonE("#5a4232"), x * 1.12, 3.2, z * 1.12, 0.01));
  return g;
};
const cannon = () => {
  const g = new THREE.Group(); const iron = toonE("#3c3f46", { shade: 0.5, rim: 0.45 }); const wood = toonE("#6e4e34", { shade: 0.6 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.19, 1.9, 18), iron); barrel.rotation.x = Math.PI / 2 - 0.12; barrel.position.set(0, 1.0, 0.15); ink(barrel, 0.012); g.add(barrel);
  const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.035, 8, 18), iron); muzzle.position.set(0, 1.11, 1.09); muzzle.rotation.x = -0.12; g.add(muzzle);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 8, 24), wood); w.rotation.y = Math.PI / 2; w.position.set(s * 0.42, 0.6, 0); ink(w, 0.01); g.add(w);
    for (let k = 0; k < 6; k++) { const sp = box(0.04, 1.08, 0.04, wood, s * 0.42, 0.6, 0, 0); sp.rotation.x = (k / 6) * Math.PI; g.add(sp); } g.add(box(0.12, 0.16, 0.16, iron, s * 0.42, 0.6, 0, 0.008)); }
  g.add(box(0.95, 0.08, 0.08, iron, 0, 0.6, 0, 0)); const trail = box(0.32, 0.18, 2.1, wood, 0, 0.42, -0.85, 0.012); trail.rotation.x = -0.22; g.add(trail);
  // cannonball pyramid
  const ball = new THREE.SphereGeometry(0.1, 12, 8); for (const [x, y, z] of [[-0.11, 0.1, 0], [0.11, 0.1, 0], [0, 0.1, 0.19], [0, 0.26, 0.065]]) { const b = new THREE.Mesh(ball, iron); b.position.set(1.0 + x, y, 0.5 + z); g.add(b); }
  return g;
};
const barrel = (col = "#7a5236") => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.85, 16), toonE(col, { map: planks(col, "#3a2618", 8) })); const bulge = b.geometry.getAttribute("position"); for (let i = 0; i < bulge.count; i++) { const y = bulge.getY(i); const s = 1 + 0.1 * (1 - (y / 0.425) ** 2); bulge.setX(i, bulge.getX(i) * s); bulge.setZ(i, bulge.getZ(i) * s); } b.geometry.computeVertexNormals(); b.position.y = 0.425; ink(b, 0.012); g.add(b);
  for (const y of [0.12, 0.73]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.018, 6, 20), toonE("#3a3a40")); h.rotation.x = Math.PI / 2; h.position.y = y; g.add(h); } return g; };
const crate = (s = 0.7, col = "#a07a52") => { const g = new THREE.Group(); const m = toonE(col, { map: planks(col, "#4a3424", 4) }); g.add(box(s, s, s, m, 0, s / 2, 0, 0.012)); const tr = toonE("#6a4c34"); for (const sz of [-1, 1]) { const b = box(s * 1.32, 0.07, 0.03, tr, 0, s / 2, sz * (s / 2 + 0.01), 0); b.rotation.z = 0.78; g.add(b); } return g; };
// target range: rail fence carrying bottles + tin cans, hay bale backstop
const targetRange = (z: number) => {
  const g = new THREE.Group(); const wood = toonE("#8a6c50", { map: planks("#8a6c50", "#4a3424", 3), shade: 0.6 });
  for (let i = 0; i <= 5; i++) { const x = -6 + i * 2.4; const p = box(0.16, 1.25, 0.16, wood, x, 0.62, z, 0.012); p.rotation.y = (rnd() - 0.5) * 0.2; g.add(p); }
  g.add(box(12.3, 0.12, 0.26, wood, 0, 1.18, z, 0.014)); g.add(box(12.3, 0.1, 0.1, wood, 0, 0.62, z, 0.012));
  const glassG = new THREE.MeshToonMaterial({ color: "#5f9a62" }); const glassB = new THREE.MeshToonMaterial({ color: "#8a5a2e" }); const glassC = new THREE.MeshToonMaterial({ color: "#a8c8c0" });
  const bottle = (mat: THREE.Material) => { const pts = [[0, 0], [0.038, 0], [0.04, 0.02], [0.04, 0.17], [0.03, 0.2], [0.014, 0.23], [0.014, 0.29], [0.017, 0.3], [0, 0.3]].map(([x, y]) => new THREE.Vector2(x, y)); const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), mat); ink(m, 0.005);
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.12), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.75, toneMapped: false })); hl.position.set(-0.018, 0.11, 0.036); m.add(noShadow(hl)); return m; };
  const can = (col: string) => { const c = new THREE.Group(); const tin = toonE("#b8bcc4", { shade: 0.55, rim: 0.6 }); const body = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.115, 16), tin); body.position.y = 0.0575; ink(body, 0.005); c.add(body);
    const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.0385, 0.0385, 0.07, 16, 1, true), toonE(col, { shade: 0.6 })); lab.position.y = 0.0575; c.add(lab); return c; };
  const items: THREE.Object3D[] = [];
  for (let i = 0; i < 14; i++) { const x = -5.6 + i * 0.85 + (rnd() - 0.5) * 0.2; const k = i % 3; const it = k === 1 ? can(["#b8402e", "#d9a43a", "#3e6a9a"][i % 3]) : bottle([glassG, glassB, glassC][(i * 7) % 3]); it.position.set(x, 1.24, z + (rnd() - 0.5) * 0.06); it.rotation.y = rnd() * 6; g.add(it); items.push(it); }
  // a knocked-over can + broken glass in the dirt
  const fallen = can("#b8402e"); fallen.rotation.z = Math.PI / 2; fallen.position.set(1.4, 0.04, z + 0.7); g.add(fallen);
  for (let i = 0; i < 12; i++) { const sh = new THREE.Mesh(new THREE.CircleGeometry(0.025 + rnd() * 0.02, 3), glassG); sh.rotation.set(-Math.PI / 2, 0, rnd() * 6); sh.position.set(-2 + rnd() * 5, 0.01, z + 0.3 + rnd() * 0.8); g.add(sh); }
  // hay backstop
  const hayT = canvasTex(256, 128, (c) => { const gr = c.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "#e8c874"); gr.addColorStop(1, "#b8924a"); c.fillStyle = gr; c.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 900; i++) { c.strokeStyle = ["#9a7632", "#f4dc92", "#c9a456", "#7e6a30"][(rnd() * 4) | 0]; c.lineWidth = 1 + rnd(); c.beginPath(); const x = rnd() * 256, y = rnd() * 128; c.moveTo(x, y); c.lineTo(x + 6 + rnd() * 10, y + (rnd() - 0.5) * 7); c.stroke(); }
    c.fillStyle = "#6a4a22"; c.fillRect(70, 0, 4, 128); c.fillRect(182, 0, 4, 128); c.strokeStyle = "rgba(80,55,25,0.6)"; c.lineWidth = 6; c.strokeRect(0, 0, 256, 128); });
  const hayM = toonE("#d6b25e", { map: hayT, shade: 0.62 });
  for (let row = 0; row < 2; row++) for (let i = 0; i < 9 - row; i++) { const b = box(1.1, 0.5, 0.55, hayM, -4.6 + i * 1.16 + row * 0.58 + (rnd() - 0.5) * 0.08, 0.28 + row * 0.55, z - 2.2 + (rnd() - 0.5) * 0.1, 0.014); b.rotation.y = (rnd() - 0.5) * 0.08; g.add(b); }
  return { g, items };
};
// waving cloth flag (vertex animated in update)
const flagCloth = () => {
  const W = 2.4, H = 1.5; const geo = new THREE.PlaneGeometry(W, H, 20, 10); geo.translate(W / 2, 0, 0);
  const tex = canvasTex(512, 320, (c) => { c.fillStyle = "#2f4a78"; c.fillRect(0, 0, 512, 320); c.fillStyle = "#e9dcc0"; c.fillRect(0, 0, 512, 22); c.fillRect(0, 298, 512, 22); c.fillStyle = "#b8423a"; c.fillRect(0, 22, 512, 14); c.fillRect(0, 284, 512, 14);
    c.fillStyle = "#e9dcc0"; c.beginPath(); c.arc(256, 160, 62, 0, Math.PI * 2); c.fill(); c.fillStyle = "#2f4a78"; c.beginPath(); c.arc(256, 160, 46, 0, Math.PI * 2); c.fill(); c.fillStyle = "#e9dcc0"; c.beginPath(); c.arc(256, 160, 14, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 200; i++) dab(c, rnd() * 512, rnd() * 320, 8 + rnd() * 20, 1 + rnd() * 2, 0, "rgba(0,0,0,0.05)"); });
  const m = new THREE.Mesh(geo, toonE("#ffffff", { map: tex, side: THREE.DoubleSide, shade: 0.55 })); const base = (geo.getAttribute("position").array as Float32Array).slice();
  const update = (t: number) => { const p = geo.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; const u = x / W;
    p.setZ(i, u * (Math.sin(x * 2.6 - t * 5.2 + y * 0.6) * 0.2 + Math.sin(x * 4.1 - t * 7.3) * 0.06)); p.setY(i, y - u * u * 0.12 + Math.sin(x * 2.6 - t * 5.2) * 0.03 * u); p.setX(i, x - u * 0.06 * (1 + Math.sin(t * 3 + y))); }
    p.needsUpdate = true; geo.computeVertexNormals(); };
  return { m, update };
};

export const buildFort = (): BuiltSet => {
  reseed(4242); clearGlowCache(); const g = new THREE.Group();
  // ---- sky, clouds, distant buttes ----
  g.add(daySky(FORT_SUN, { hor: "#e2e6e8" }));
  const sunFlat = new THREE.Vector3(FORT_SUN.x, 0, FORT_SUN.z).normalize();
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2 + (rnd() - 0.5) * 0.2; const r = 260 + rnd() * 70; const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a)); const warm = Math.max(0, d.dot(sunFlat));
    const c = dayCloud(70 + rnd() * 100, warm); c.position.set(d.x * r, 40 + rnd() * 80, d.z * r); c.lookAt(0, c.position.y * 0.6, 0); g.add(c); }
  const HZ = "#dfe2e6"; const ring = (n: number, r: number, lit: string, shade: string, haze: number, hMin: number, hMax: number) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + rnd() * 0.35; const m = mesa((30 + rnd() * 50) * r / 150, hMin + rnd() * (hMax - hMin), lit, shade, haze, HZ); m.position.set(Math.sin(a) * r, -1, Math.cos(a) * r); m.lookAt(0, 0, 0); g.add(m); } };
  ring(9, 385, "#efcfae", "#a9b0d2", 0.72, 34, 62); ring(10, 350, "#e8b48e", "#9a96c2", 0.52, 18, 40); ring(12, 315, "#dda07a", "#8a7aa6", 0.34, 8, 20);
  // ---- ground ----
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), groundMat(groundTex(), "#f2dcb4", "#9a8ec8", 0.4)); ground.rotation.x = -Math.PI / 2; g.add(ground);
  const pmat = groundMat(paradeTex(), "#f2dcb4", "#9a8ec8", 0.4); pmat.polygonOffset = true; pmat.polygonOffsetFactor = -2; pmat.polygonOffsetUnits = -2;
  const parade = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), pmat); parade.rotation.x = -Math.PI / 2; parade.position.set((X0 + X1) / 2, 0.004, (Z0 + Z1) / 2); g.add(parade);
  const far = new THREE.Mesh(new THREE.CircleGeometry(420, 64), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(1024, 1024, (c) => { c.fillStyle = "#a99b5e"; c.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 9000; i++) { const x = rnd() * 1024, y = rnd() * 1024; dab(c, x, y, 1 + rnd() * 3, 0.6 + rnd() * 1.2, 0, ["rgba(120,120,70,0.5)", "rgba(200,180,120,0.45)", "rgba(90,100,70,0.5)", "rgba(150,140,150,0.25)"][(rnd() * 4) | 0]); } }) })); far.rotation.x = -Math.PI / 2; far.position.y = -0.04; g.add(noShadow(far));
  // ---- palisade + walkway ----
  const inGate = (x: number, z: number) => z > Z1 - 0.5 && Math.abs(x) < GATE;
  g.add(palisade([[X0, Z1], [X0, Z0], [X1, Z0], [X1, Z1], [X0, Z1]], inGate));
  const deckM = toonE("#8a6a4e", { map: planks("#8a6a4e", "#3a2a1e", 18), shade: 0.6 }); const postM = toonE("#6e5038", { shade: 0.6 });
  const walk = (ax: number, az: number, bx: number, bz: number, nx: number, nz: number) => { const L = Math.hypot(bx - ax, bz - az); const cx = (ax + bx) / 2 + nx * 0.75, cz = (az + bz) / 2 + nz * 0.75; const d = box(Math.abs(bx - ax) + Math.abs(nx) * 1.2, 0.12, Math.abs(bz - az) + Math.abs(nz) * 1.2, deckM, cx, 2.6, cz, 0.012); g.add(d);
    const n = Math.round(L / 3.2); for (let i = 0; i <= n; i++) { const u = i / n; const x = ax + (bx - ax) * u + nx * 1.25, z = az + (bz - az) * u + nz * 1.25; if (Math.abs(x) < GATE + 0.6 && z > Z1 - 2) continue; g.add(box(0.16, 2.6, 0.16, postM, x, 1.3, z, 0.01)); const br = box(0.08, 1.4, 0.08, postM, x - nx * 0.5, 1.95, z - nz * 0.5, 0); br.rotation.set(nz * 0.7, 0, -nx * 0.7); g.add(br); } };
  walk(X0 + 0.25, Z0 + 1.5, X0 + 0.25, Z1 - 1.5, 1, 0); walk(X1 - 0.25, Z0 + 1.5, X1 - 0.25, Z1 - 1.5, -1, 0); walk(X0 + 1.5, Z0 + 0.25, X1 - 1.5, Z0 + 0.25, 0, 1);
  walk(X0 + 1.5, Z1 - 0.25, -GATE - 0.3, Z1 - 0.25, 0, -1); walk(GATE + 0.3, Z1 - 0.25, X1 - 1.5, Z1 - 0.25, 0, -1);
  // ladders up to the walkway by the gate
  for (const sx of [-1, 1]) { const lx = sx * (GATE + 3.2); for (const o of [-0.25, 0.25]) { const r = box(0.07, 3.0, 0.07, postM, lx + o, 1.4, Z1 - 2.15, 0.006); r.rotation.x = -0.25; g.add(r); } for (let k = 0; k < 8; k++) g.add(box(0.5, 0.05, 0.05, postM, lx, 0.25 + k * 0.33, Z1 - 2.15 - 0.36 + k * 0.083 + 0.0, 0)); }
  // ---- gate: big posts, lintel with lookout, two plank leaves swung open inward ----
  const gpM = toonE("#6e5038", { map: barkTex("#6e5038"), shade: 0.6 });
  for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 6.4, 12), gpM); p.position.set(sx * (GATE + 0.05), 3.2, Z1); ink(p, 0.02); g.add(p); const cap = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.6, 12), gpM); cap.position.set(sx * (GATE + 0.05), 6.7, Z1); ink(cap, 0.02); g.add(cap); }
  g.add(box(2 * GATE + 1.2, 0.36, 0.42, postM, 0, 5.2, Z1, 0.02));
  g.add(box(2 * GATE + 2.4, 0.12, 2.0, deckM, 0, 5.45, Z1 - 0.4, 0.014)); // lookout floor over the gate
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.12, 2.0, 0.12, postM, sx * (GATE + 1.0), 6.45, Z1 - 0.4 + sz * 0.88, 0.01));
  for (const sz of [-1, 1]) g.add(box(2 * GATE + 2.2, 0.08, 0.08, postM, 0, 6.5, Z1 - 0.4 + sz * 0.88, 0.008));
  const lr = box(2 * GATE + 2.9, 0.12, 2.6, toonE("#8f8a90", { map: shingles(225, 10, 44), shade: 0.62 }), 0, 7.55, Z1 - 0.4, 0.02); lr.rotation.x = 0.14; g.add(lr);
  for (const sx of [-1, 1]) { const brace = box(0.12, 1.6, 0.12, postM, sx * (GATE - 0.35), 4.6, Z1 - 0.05, 0.008); brace.rotation.z = sx * 0.7; g.add(brace); }
  const leafM = toonE("#8a6648", { map: planks("#8a6648", "#3e2a1c", 8), shade: 0.6 });
  for (const sx of [-1, 1]) { const hinge = new THREE.Group(); hinge.position.set(sx * (GATE - 0.25), 0, Z1 - 0.1); hinge.rotation.y = sx * -1.75; g.add(hinge);
    const LW = GATE - 0.3; const leaf = box(LW, 4.3, 0.16, leafM, -sx * LW / 2, 2.25, 0, 0.018); hinge.add(leaf);
    for (const y of [0.8, 3.7]) hinge.add(box(LW, 0.2, 0.08, postM, -sx * LW / 2, y, -0.12, 0.01));
    const zb = box(0.18, Math.hypot(LW, 2.9), 0.08, postM, -sx * LW / 2, 2.25, -0.12, 0.01); zb.rotation.z = sx * Math.atan2(LW, 2.9); hinge.add(zb);
    for (let k = 0; k < LW / 0.5; k++) hinge.add(box(0.06, 0.06, 0.04, toonE("#2a2626"), -sx * (0.25 + k * 0.5), 3.7, 0.1, 0)); }
  // ---- buildings ----
  const bh1 = blockhouse(); bh1.position.set(X0 + 1.2, 0, Z0 + 1.2); bh1.rotation.y = 0.785; g.add(bh1);
  const bh2 = blockhouse(); bh2.position.set(X1 - 1.2, 0, Z1 - 1.2); bh2.rotation.y = 0.785; g.add(bh2);
  const b1 = building(16, 6, 3.0, "#a88a6a", { door: 0, wins: [-5.2, -2.4, 2.4, 5.2] }); b1.position.set(X0 + 6.5, 0, 6); b1.rotation.y = Math.PI / 2; g.add(b1);
  const b2 = building(16, 6, 3.0, "#9e8466", { door: -2, wins: [-5.6, 1.2, 4.2] }); b2.position.set(X0 + 6.5, 0, -16); b2.rotation.y = Math.PI / 2; g.add(b2);
  const b3 = building(18, 6, 3.0, "#a88a6a", { door: 2, wins: [-6, -3, 0, 5.5] }); b3.position.set(X1 - 6.5, 0, -8); b3.rotation.y = -Math.PI / 2; g.add(b3);
  const hq = building(10, 7, 3.4, "#c9b694", { door: 0, wins: [-3, 3], hq: true }); hq.position.set(13, 0, Z0 + 7); hq.rotation.y = -0.2; g.add(hq);
  // stable lean-to by the east wall near the gate: roof on posts, hay, a water trough, hitching rail
  const st = new THREE.Group(); st.position.set(X1 - 4, 0, 17); g.add(st);
  for (const z of [-4, 0, 4]) st.add(box(0.16, 2.6, 0.16, postM, -1.6, 1.3, z, 0.01));
  const sr = box(4.4, 0.12, 9.2, toonE("#8f8a90", { map: shingles(225, 10, 44), shade: 0.62 }), 0.3, 2.85, 0, 0.02); sr.rotation.z = -0.18; st.add(sr);
  const hayT2 = canvasTex(256, 128, (c) => { c.fillStyle = "#d6b25e"; c.fillRect(0, 0, 256, 128); for (let i = 0; i < 500; i++) { c.strokeStyle = rnd() < 0.5 ? "#a8853a" : "#f0d58a"; c.beginPath(); const x = rnd() * 256, y = rnd() * 128; c.moveTo(x, y); c.lineTo(x + 9, y + (rnd() - 0.5) * 4); c.stroke(); } });
  for (const [x, y, z] of [[0.5, 0.3, -3], [0.5, 0.3, -1.8], [0.5, 0.9, -2.4]]) st.add(box(0.6, 0.55, 1.15, toonE("#d6b25e", { map: hayT2 }), x, y, z, 0.012));
  st.add(box(0.7, 0.55, 2.2, toonE("#6a5040", { map: planks("#6a5040", "#3a2a1e", 6) }), -2.6, 0.28, 1.5)); st.add(box(0.5, 0.04, 2.0, new THREE.MeshBasicMaterial({ color: "#7aa3c8" }), -2.6, 0.5, 1.5, 0));
  for (const z of [-3.5, 3.5]) st.add(box(0.14, 1.1, 0.14, postM, -3.6, 0.55, z, 0.01)); st.add(box(0.09, 0.09, 7.2, postM, -3.6, 1.05, 0, 0.01));
  // ---- flagpole + flag ----
  const FP = new THREE.Vector3(0, 0, -4); const poleM = toonE("#ece4d4", { shade: 0.66 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 12, 12), poleM); pole.position.set(FP.x, 6, FP.z); ink(pole, 0.012); g.add(pole);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), toonE("#e0b040", { rim: 0.5 })); ball.position.set(FP.x, 12.1, FP.z); ink(ball, 0.01); g.add(ball);
  g.add(box(1.4, 0.3, 1.4, toonE("#9a8e84", { map: stones(), shade: 0.6 }), FP.x, 0.15, FP.z, 0.015)); g.add(box(1.0, 0.25, 1.0, toonE("#a89a8c", { map: stones(), shade: 0.6 }), FP.x, 0.42, FP.z, 0.012));
  const flag = flagCloth(); const flagG = new THREE.Group(); flagG.position.set(FP.x + 0.08, 11.0, FP.z); flagG.rotation.y = 0.55; flagG.add(flag.m); g.add(flagG);
  g.add(rod(new THREE.Vector3(FP.x + 0.08, 11.85, FP.z), new THREE.Vector3(FP.x + 0.1, 0.8, FP.z + 0.02), 0.008, toonE("#d8cdb8")));
  const can1 = cannon(); can1.position.set(-4.2, 0, -5.5); can1.rotation.y = 0.5; g.add(can1);
  const can2 = cannon(); can2.position.set(4.2, 0, -5.5); can2.rotation.y = -0.5; g.add(can2);
  // ---- props ----
  for (const [x, z, c] of [[X0 + 10.6, 13, "#7a5236"], [X0 + 10.5, 13.75, "#6e4a30"], [X0 + 11.2, 13.4, "#7a5236"], [X1 - 10.3, 3.0, "#7a5236"], [X1 - 10.4, 3.8, "#6e4a30"], [9.6, Z0 + 8.4, "#7a5236"]] as [number, number, string][]) { const b = barrel(c); b.position.set(x, 0, z); g.add(b); }
  for (const [x, z, s, r] of [[X0 + 10.8, 11.6, 0.7, 0.2], [X0 + 10.9, 11.6, 0.55, 0.5], [7.5, -15, 0.7, 0.1], [8.2, -15.4, 0.6, 0.6], [-7.4, -14.6, 0.7, -0.3], [X1 - 10.5, 5.0, 0.7, 0.3]] as [number, number, number, number][]) { const c = crate(s); c.position.set(x, 0, z); c.rotation.y = r; g.add(c); }
  const tri = crate(0.55); tri.position.set(X0 + 10.85, 0.7, 11.6); g.add(tri);
  // water pump + trough near the barracks
  const pump = new THREE.Group(); pump.position.set(-8.5, 0, 12); g.add(pump); pump.add(box(0.22, 1.2, 0.22, toonE("#3d5a4c", { rim: 0.3 }), 0, 0.6, 0, 0.012)); const handle = box(0.06, 0.06, 0.8, toonE("#3d5a4c"), 0, 1.15, 0.3, 0.006); handle.rotation.x = -0.4; pump.add(handle); pump.add(box(0.06, 0.06, 0.3, toonE("#3d5a4c"), 0, 0.95, -0.2, 0.006));
  pump.add(box(1.8, 0.5, 0.6, toonE("#6a5040", { map: planks("#6a5040", "#3a2a1e", 6) }), 0, 0.25, -0.75)); pump.add(box(1.6, 0.04, 0.42, new THREE.MeshBasicMaterial({ color: "#7aa8cc" }), 0, 0.46, -0.75, 0));
  // bench outside barracks 1
  for (const [x, z, ry] of [[X0 + 10.3, 3.5, Math.PI / 2], [X1 - 10.3, -12, Math.PI / 2]] as [number, number, number][]) { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; g.add(b); b.add(box(2.0, 0.08, 0.38, postM, 0, 0.46, 0, 0.01)); for (const s of [-0.8, 0.8]) b.add(box(0.08, 0.44, 0.34, postM, s, 0.22, 0, 0.006)); }
  // target range at the north end
  const TZ = Z0 + 5; g.add(targetRange(TZ).g);
  // ---- outside: trees, tufts, dust ----
  const tt = [treeTex(), treeTex("#2e4630", "#5d7f44", "#a6b85a")]; const tms = tt.map((t) => new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: 0.3, toneMapped: false, color: "#f4f0e8" }));
  for (const [x, z, sc] of [[-40, -20, 13], [-46, 2, 11], [38, -30, 14], [-34, 40, 12], [44, 18, 11], [52, -6, 10], [-12, -48, 12], [18, -50, 13], [-56, -34, 10], [30, 52, 10], [-24, 60, 11], [-7, 78, 12], [11, 96, 14], [3, 120, 12]] as [number, number, number][]) { const t2 = new THREE.Sprite(tms[(rnd() * 2) | 0]); t2.scale.set(sc * 0.8, sc, 1); t2.position.set(x, sc / 2 - 0.3, z); g.add(t2); }
  const gms = [grassCard(0, "#efe08a"), grassCard(1, "#e8d27a")].map((t) => new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide }));
  const blades = tufts(g, 1300, () => { const x = (rnd() - 0.5) * 150, z = (rnd() - 0.5) * 150; const inside = x > X0 - 2.5 && x < X1 + 2.5 && z > Z0 - 2.5 && z < Z1 + 2.5; if (inside) return null; if (Math.abs(x + (z - Z1) * 0.05) < 4.5 && z > Z1) return null; if (x > -2 && x < 22 && z > 44 && z < 70) return null; return [x, z]; }, gms);
  blades.push(...tufts(g, 220, () => { const side = (rnd() * 3) | 0; const u = rnd(); const x = side === 0 ? X0 + 0.6 + rnd() * 1.4 : side === 1 ? X1 - 0.6 - rnd() * 1.4 : X0 + 2 + u * (X1 - X0 - 4); const z = side === 2 ? Z0 + 0.6 + rnd() * 0.8 : Z0 + 2 + u * (Z1 - Z0 - 6); if (Math.abs(x) < 7 && z < Z0 + 3) return null; return [x, z]; }, gms, [0.35, 0.5]));
  const dust = dustMotes(500, [-14, 0, -24, 14, 6, 28]); g.add(dust.pts);
  // ---- lights ----
  g.add(new THREE.HemisphereLight("#c4d6ff", "#8a7466", 0.95));
  keyLight(g, FORT_SUN, "#ffe2b8", 2.6, 46, 95, new THREE.Vector3(0, 0, -2));
  const fill = new THREE.DirectionalLight("#a8bcff", 0.4); fill.position.set(30, 10, -20); g.add(fill);
  const fog = new THREE.Fog("#e4e2d8", 140, 520);
  g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; const basic = (m.material as THREE.Material).type === "MeshBasicMaterial"; if (!basic) { m.castShadow = true; m.receiveShadow = true; } });
  ground.castShadow = false; parade.castShadow = false;
  const marks: Record<string, [number, number, number]> = {
    gate: [0.3, 0, Z1 - 2.5], yard1: [-1.35, 0, 2], yard2: [-0.45, 0, 2], yard3: [0.45, 0, 2], yard4: [1.35, 0, 2],
    shooter: [0, 0, TZ + 13], targets: [0, 0, TZ],
  };
  const cams = {
    main: { pos: [10, 15, 58] as [number, number, number], look: [-2, 1, -6] as [number, number, number], fov: 40 },
    gate: { pos: [3.2, 1.3, Z1 - 17] as [number, number, number], look: [-0.4, 2.9, Z1] as [number, number, number], fov: 46 },
    yard: { pos: [3.0, 1.5, 11.8] as [number, number, number], look: [0.2, 1.15, 2] as [number, number, number], fov: 32 },
    targets: { pos: [0.42, 1.66, TZ + 14.5] as [number, number, number], look: [-1.1, 1.0, TZ] as [number, number, number], fov: 34 },
  };
  return { group: g, fog, cams, marks, update: (t) => { flag.update(t); dust.update(t); for (const q of blades) q.rotation.z = Math.sin(t * 1.6 + q.position.x * 0.3 + q.position.z * 0.2) * 0.06; } };
};
