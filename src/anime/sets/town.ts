// Frontier town on a dusty, warm day: one north-south street of false-front clapboard buildings on raised boardwalks with
// awnings, hitching rails, a two-storey SALOON (balcony, batwing doors, big painted sign), water tower + windmill + little
// white church closing the north end, telegraph poles, a parked wagon, barrels, crates, troughs.
// World: metres, y = 0 street. Street runs along Z (north = -Z), 14.4 m between boardwalk edges. Saloon on the east side
// (+X) at z = 0, facing west. Sun high-ish in the west-south-west, so the saloon facade is sunlit.
import * as THREE from "three";
import type { BuiltSet } from "./types";
import { archGeo, toonE, ink, box, reseed, rnd, canvasTex, dab, planks, shingles, stones, grassCard, treeTex, daySky, dayCloud, mesa, groundMat, tufts, dustMotes, keyLight, signTex, rod, noShadow, clearGlowCache } from "./westkit";

export const TOWN_SUN = new THREE.Vector3(-0.62, 0.68, 0.38).normalize();
const FX = 8.6, BW = 2.4, BH = 0.4; // facade line (|x|), boardwalk depth + height

// dirt street tile (16 m wide x 32 m long, repeats along Z): wheel ruts, hoof prints, pebbles, wrapped so it tiles
const streetTex = () => { const W = 1024, H = 2048, S = W / 16; return canvasTex(W, H, (g) => {
  const wrap = (y: number, f: (yy: number) => void) => { f(y); if (y < 60) f(y + H); if (y > H - 60) f(y - H); };
  g.fillStyle = "#d9b089"; g.fillRect(0, 0, W, H);
  const edge = g.createLinearGradient(0, 0, W, 0); edge.addColorStop(0, "rgba(140,96,70,0.35)"); edge.addColorStop(0.12, "rgba(140,96,70,0)"); edge.addColorStop(0.88, "rgba(140,96,70,0)"); edge.addColorStop(1, "rgba(140,96,70,0.35)"); g.fillStyle = edge; g.fillRect(0, 0, W, H);
  const pal = ["rgba(243,206,164,0.22)", "rgba(196,140,104,0.17)", "rgba(226,165,140,0.13)", "rgba(170,140,175,0.10)", "rgba(255,234,200,0.22)"];
  for (let i = 0; i < 26000; i++) { const x = rnd() * W, y = rnd() * H, rx = 3 + rnd() * 12, ry = 1.5 + rnd() * 4, a = rnd() * 3.14, c = pal[(rnd() * pal.length) | 0]; wrap(y, (yy) => dab(g, x, yy, rx, ry, a, c)); }
  for (let i = 0; i < 90; i++) { const x = rnd() * W, y = rnd() * H, r = 60 + rnd() * 220; const c0 = rnd() < 0.5 ? "rgba(250,222,180,0.22)" : "rgba(160,110,92,0.14)"; wrap(y, (yy) => { const gr = g.createRadialGradient(x, yy, 0, x, yy, r); gr.addColorStop(0, c0); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, yy - r, r * 2, r * 2); }); }
  // two pairs of wheel ruts (straight along the street) with lit crests
  for (const cx of [-3.1, -1.5, 1.6, 3.2]) { const x = W / 2 + cx * S; for (const [w, c, o] of [[26, "rgba(140,92,68,0.20)", 0], [10, "rgba(105,68,52,0.24)", 0], [3, "rgba(255,232,196,0.40)", 7]] as [number, string, number][]) {
    g.strokeStyle = c; g.lineWidth = w; g.beginPath(); for (let y = 0; y <= H; y += 32) { const xx = x + o + Math.sin((y / H) * Math.PI * 2) * 6 + Math.sin((y / H) * Math.PI * 6 + cx) * 3; y === 0 ? g.moveTo(xx, y) : g.lineTo(xx, y); } g.stroke(); } }
  // hoof prints down the middle, boot prints near the boardwalks
  for (let i = 0; i < 500; i++) { const x = W / 2 + (rnd() - 0.5) * 7 * S, y = rnd() * H; wrap(y, (yy) => { g.strokeStyle = "rgba(105,68,52,0.22)"; g.lineWidth = 2.2; g.beginPath(); g.arc(x, yy, 3.6, 0.3, Math.PI - 0.3); g.stroke(); g.strokeStyle = "rgba(255,236,206,0.18)"; g.lineWidth = 1.2; g.beginPath(); g.arc(x, yy - 1.2, 3.6, 0.4, Math.PI - 0.4); g.stroke(); }); }
  for (let i = 0; i < 700; i++) { const side = rnd() < 0.5 ? 0.12 : 0.88; const x = (side + (rnd() - 0.5) * 0.16) * W, y = rnd() * H; wrap(y, (yy) => dab(g, x, yy, 2.4, 4.4, 0.2, "rgba(110,72,55,0.2)")); }
  for (let i = 0; i < 4200; i++) { const x = rnd() * W, y = rnd() * H, r = 0.7 + rnd() * 1.6; wrap(y, (yy) => { dab(g, x, yy + 0.8, r, r * 0.7, 0, "rgba(90,60,60,0.45)"); dab(g, x, yy, r, r * 0.7, 0, "#d6b08c"); dab(g, x - r * 0.3, yy - r * 0.3, r * 0.4, r * 0.3, 0, "rgba(255,242,220,0.85)"); }); }
  // a few weeds at the very edges
  for (let i = 0; i < 2600; i++) { const x = rnd() < 0.5 ? rnd() * 0.05 * W : W - rnd() * 0.05 * W, y = rnd() * H; g.strokeStyle = `hsl(${50 + rnd() * 30}, ${30 + rnd() * 25}%, ${34 + rnd() * 28}%)`; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (rnd() - 0.5) * 5, y - 6, x + (rnd() - 0.5) * 8, y - 8 - rnd() * 10); g.stroke(); }
}, [1, 1]); };
// open ground around town: dry dirt + scrub; world [-110,110]^2
const landTex = () => canvasTex(2048, 2048, (g) => {
  g.fillStyle = "#c9a878"; g.fillRect(0, 0, 2048, 2048);
  const pal = ["rgba(180,170,100,0.22)", "rgba(215,185,135,0.25)", "rgba(150,140,90,0.2)", "rgba(235,210,165,0.2)", "rgba(170,140,170,0.08)"];
  for (let i = 0; i < 26000; i++) dab(g, rnd() * 2048, rnd() * 2048, 4 + rnd() * 16, 2 + rnd() * 6, rnd() * 3.14, pal[(rnd() * pal.length) | 0]);
  for (let i = 0; i < 1500; i++) { const x = rnd() * 2048, y = rnd() * 2048, r = 0.8 + rnd() * 1.6; dab(g, x, y + 1, r, r * 0.7, 0, "rgba(90,60,60,0.45)"); dab(g, x, y, r, r * 0.7, 0, "#d2ac88"); }
  for (let i = 0; i < 26000; i++) { const x = rnd() * 2048, y = rnd() * 2048; const wx = x / 2048 * 220 - 110; if (Math.abs(wx) < 24 && rnd() < 0.8) continue;
    g.strokeStyle = `hsl(${48 + rnd() * 34}, ${26 + rnd() * 25}%, ${34 + rnd() * 26}%)`; g.lineWidth = 2; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (rnd() - 0.5) * 6, y - 7, x + (rnd() - 0.5) * 10, y - 9 - rnd() * 12); g.stroke(); }
});

const glassTex = () => canvasTex(128, 128, (c) => { const gr = c.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, "#a8cbe8"); gr.addColorStop(0.45, "#55709a"); gr.addColorStop(1, "#2a3048"); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); c.strokeStyle = "rgba(255,255,255,0.5)"; c.lineWidth = 8; c.beginPath(); c.moveTo(16, 74); c.lineTo(74, 16); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(38, 96); c.lineTo(96, 38); c.stroke(); });
type Shop = { w: number; d: number; h: number; fh: number; col: string; sign: string; signBg?: string; signFg?: string; door?: number; wins?: number[]; upWins?: number[]; shop?: boolean; awning?: boolean; balcony?: boolean; rail?: boolean; step?: boolean; roof?: string; batwing?: boolean };
// false-front clapboard building, facade at local z = 0 facing +Z, boardwalk + awning in front
const shopFront = (o: Shop, glassM: THREE.Material) => {
  const g = new THREE.Group(); const wall = toonE(o.col, { map: planks(o.col, "#4a3426", 12, true), shade: 0.62 }); (wall as unknown as { map: THREE.Texture }).map.wrapS = (wall as unknown as { map: THREE.Texture }).map.wrapT = THREE.RepeatWrapping;
  const trim = toonE("#ece0c6", { shade: 0.66 }); const dark = toonE("#4a3628", { shade: 0.6 });
  const tex = (wall as unknown as { map: THREE.Texture }).map; tex.repeat.set(o.w / 4, o.h / 4);
  g.add(box(o.w - 0.1, o.h, o.d, wall, 0, o.h / 2, -o.d / 2, 0.02));
  // pitched roof behind the false front (ridge front-to-back)
  const rise = Math.min(1.6, o.w * 0.18); const roofM = toonE(o.roof ?? "#8e7e78", { map: shingles(o.roof ? 20 : 15, 14, 40), shade: 0.62 });
  for (const sx of [-1, 1]) { const half = Math.hypot(o.w / 2 + 0.25, rise); const r = box(half, 0.12, o.d + 0.3, roofM, sx * o.w / 4, o.h + rise / 2, -o.d / 2 - 0.1, 0.02); r.rotation.z = -sx * Math.atan2(rise, o.w / 2 + 0.25); g.add(r); }
  const gab = new THREE.Shape([new THREE.Vector2(-o.w / 2 + 0.05, 0), new THREE.Vector2(o.w / 2 - 0.05, 0), new THREE.Vector2(0, rise)]); const gm = new THREE.Mesh(new THREE.ShapeGeometry(gab), wall); gm.position.set(0, o.h, -o.d - 0.001); gm.rotation.y = Math.PI; g.add(gm);
  // false front with cornice (some stepped)
  const ff = box(o.w + 0.1, o.fh, 0.16, wall, 0, o.fh / 2, 0.04, 0.02); g.add(ff);
  g.add(box(o.w + 0.5, 0.26, 0.42, trim, 0, o.fh + 0.05, 0.1, 0.015)); g.add(box(o.w + 0.3, 0.12, 0.26, dark, 0, o.fh - 0.16, 0.08, 0.01));
  for (let x = -o.w / 2; x <= o.w / 2 + 0.01; x += o.w / Math.max(3, Math.round(o.w / 1.6))) g.add(box(0.12, 0.22, 0.2, trim, x, o.fh - 0.32, 0.16, 0)); // dentils
  for (const sx of [-1, 1]) g.add(box(0.2, o.fh, 0.22, trim, sx * (o.w / 2 + 0.02), o.fh / 2, 0.08, 0.01)); // pilasters
  if (o.w > 8) { g.add(box(o.w * 0.4, 0.9, 0.16, wall, 0, o.fh + 0.6, 0.04, 0.015)); g.add(box(o.w * 0.4 + 0.4, 0.22, 0.36, trim, 0, o.fh + 1.1, 0.1, 0.012)); }
  // painted sign board on the false front
  const sw = Math.min(o.w * 0.84, 0.55 * o.sign.length + 1.6), sh = o.balcony ? 1.7 : 1.2; const sy = o.balcony ? o.fh - 1.4 : (o.h > 5 ? o.fh - 1.0 : Math.max(4.2, (o.fh + 3.6) / 2));
  const sMap = signTex(o.sign, { w: 1024, h: Math.round(1024 * sh / sw), bg: o.signBg ?? "#7a5a3e", fg: o.signFg ?? "#f2e2b8", shadow: "rgba(30,18,10,0.6)" });
  g.add(box(sw, sh, 0.08, toonE("#ffffff", { map: sMap, shade: 0.7 }), 0, sy, 0.16, 0.012));
  // door + windows
  const fz = 0.13; const dx = o.door ?? 0;
  if (!o.batwing) { g.add(box(1.2, 2.4, 0.08, toonE("#6a4a34", { map: planks("#6a4a34", "#3a2618", 5), shade: 0.6 }), dx, BH + 1.2, fz, 0.012));
    g.add(box(0.55, 0.9, 0.04, glassM, dx, BH + 1.75, fz + 0.05, 0)); } g.add(box(1.45, 0.14, 0.12, trim, dx, BH + 2.47, fz + 0.03, 0.01)); for (const s of [-1, 1]) g.add(box(0.12, 2.5, 0.12, trim, dx + s * 0.66, BH + 1.25, fz + 0.03, 0.008));
  if (!o.batwing) g.add(box(1.3, 0.4, 0.06, glassM, dx, BH + 2.75, fz, 0)); // transom
  for (const x of o.wins ?? []) { const ww = o.shop ? 2.0 : 1.05, wh = o.shop ? 1.9 : 1.4, wy = o.shop ? BH + 1.45 : BH + 1.7;
    g.add(box(ww, wh, 0.05, glassM, x, wy, fz, 0)); g.add(box(ww + 0.2, 0.12, 0.12, trim, x, wy + wh / 2 + 0.05, fz + 0.03, 0.01)); g.add(box(ww + 0.26, 0.1, 0.18, trim, x, wy - wh / 2 - 0.04, fz + 0.05, 0.01));
    for (const s of [-1, 1]) g.add(box(0.1, wh + 0.1, 0.1, trim, x + s * (ww / 2 + 0.04), wy, fz + 0.03, 0.006)); g.add(box(0.05, wh, 0.07, trim, x, wy, fz + 0.03, 0)); if (!o.shop) g.add(box(ww, 0.05, 0.07, trim, x, wy, fz + 0.03, 0));
    if (o.shop) g.add(box(ww + 0.1, 0.5, 0.08, dark, x, BH + 0.25, fz, 0.008)); }
  for (const x of o.upWins ?? []) { const wy = 5.1; g.add(box(1.0, 1.35, 0.05, glassM, x, wy, fz, 0)); g.add(box(1.2, 0.12, 0.12, trim, x, wy + 0.73, fz + 0.03, 0.01)); g.add(box(1.24, 0.1, 0.18, trim, x, wy - 0.72, fz + 0.05, 0.01)); g.add(box(1.0, 0.05, 0.07, trim, x, wy, fz + 0.03, 0)); for (const s of [-1, 1]) g.add(box(0.1, 1.45, 0.1, trim, x + s * 0.54, wy, fz + 0.03, 0.006)); }
  // boardwalk
  const deck = toonE("#9a7656", { map: planks("#9a7656", "#3a2a1e", 22), shade: 0.6 }); (deck as unknown as { map: THREE.Texture }).map.wrapS = THREE.RepeatWrapping; (deck as unknown as { map: THREE.Texture }).map.repeat.set(o.w / 5, 1);
  const bw = box(o.w + 0.02, 0.12, BW, deck, 0, BH - 0.06, BW / 2 + 0.06, 0.012); bw.rotation.y = 0; g.add(bw);
  g.add(box(o.w + 0.02, BH - 0.12, 0.08, dark, 0, (BH - 0.12) / 2, BW + 0.02, 0)); // skirt
  if (o.step !== false) for (let i = 0; i < 2; i++) g.add(box(1.4, BH / 2, 0.3, deck, dx, BH / 4 + i * BH / 2 - 0.0, BW + 0.2 + (1 - i) * 0.3 - 0.0, 0.01));
  const postX = (n: number) => Array.from({ length: n + 1 }, (_, i) => -o.w / 2 + 0.12 + (o.w - 0.24) * i / n);
  const nP = Math.max(2, Math.round(o.w / 3.2));
  if (o.balcony) { // second-floor balcony over the boardwalk
    for (const x of postX(nP)) { if (Math.abs(x - dx) < 1.0) continue; g.add(box(0.18, 3.4, 0.18, trim, x, BH + 1.7 - 0.2, BW - 0.1, 0.012)); }
    g.add(box(o.w + 0.2, 0.18, BW + 0.2, deck, 0, BH + 3.25, BW / 2, 0.015)); g.add(box(o.w + 0.25, 0.3, 0.1, trim, 0, BH + 3.12, BW + 0.05, 0.01));
    g.add(box(o.w + 0.2, 0.1, 0.1, trim, 0, BH + 4.35, BW - 0.05, 0.01)); for (let x = -o.w / 2 + 0.1; x <= o.w / 2; x += 0.3) g.add(box(0.06, 1.0, 0.06, trim, x, BH + 3.85, BW - 0.05, 0));
    for (const x of postX(nP)) g.add(box(0.14, 1.3, 0.14, trim, x, BH + 3.95, BW - 0.05, 0.008));
    for (const sx of [-1, 1]) { g.add(box(0.1, 0.1, BW, trim, sx * (o.w / 2 + 0.05), BH + 4.35, BW / 2, 0.008)); }
  } else if (o.awning !== false) {
    for (const x of postX(nP)) { if (Math.abs(x - dx) < 1.0) continue; g.add(box(0.15, 2.95, 0.15, trim, x, BH + 1.47, BW - 0.12, 0.01)); }
    const aw = box(o.w + 0.3, 0.1, BW + 0.45, roofM, 0, BH + 3.05, BW / 2 + 0.1, 0.018); aw.rotation.x = 0.13; g.add(aw);
    g.add(box(o.w + 0.3, 0.16, 0.12, trim, 0, BH + 2.9, BW - 0.1, 0.01));
  }
  if (o.rail) for (const [a, b] of [[-o.w / 2 + 1.2, dx - 1.3], [dx + 1.3, o.w / 2 - 1.2]]) { if (b - a < 1.5) continue; for (const x of [a, b]) g.add(box(0.15, 1.1, 0.15, dark, x, 0.55, BW + 1.0, 0.01)); g.add(box(b - a + 0.2, 0.1, 0.1, dark, (a + b) / 2, 1.02, BW + 1.0, 0.01)); }
  return g;
};
const barrel = (col = "#7a5236") => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.85, 16), toonE(col, { map: planks(col, "#3a2618", 8) })); const p = b.geometry.getAttribute("position"); for (let i = 0; i < p.count; i++) { const y = p.getY(i); const s = 1 + 0.1 * (1 - (y / 0.425) ** 2); p.setX(i, p.getX(i) * s); p.setZ(i, p.getZ(i) * s); } b.geometry.computeVertexNormals(); b.position.y = 0.425; ink(b, 0.012); g.add(b);
  for (const y of [0.12, 0.73]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.018, 6, 20), toonE("#3a3a40")); h.rotation.x = Math.PI / 2; h.position.y = y; g.add(h); } return g; };
const crate = (s = 0.7, col = "#a07a52") => { const g = new THREE.Group(); g.add(box(s, s, s, toonE(col, { map: planks(col, "#4a3424", 4) }), 0, s / 2, 0, 0.012)); for (const sz of [-1, 1]) { const b = box(s * 1.32, 0.07, 0.03, toonE("#6a4c34"), 0, s / 2, sz * (s / 2 + 0.01), 0); b.rotation.z = 0.78; g.add(b); } return g; };
const wheel = (r: number, mat: THREE.Material, iron: THREE.Material) => { const w = new THREE.Group(); const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.045, 8, 28), mat); ink(rim, 0.008); w.add(rim); const tire = new THREE.Mesh(new THREE.TorusGeometry(r + 0.03, 0.02, 6, 28), iron); w.add(tire);
  for (let k = 0; k < 12; k++) { const s = box(0.035, r * 2, 0.035, mat, 0, 0, 0, 0); s.rotation.z = (k / 12) * Math.PI; w.add(s); } const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 12), mat); hub.rotation.x = Math.PI / 2; w.add(hub); return w; };
const wagon = () => { const g = new THREE.Group(); const wood = toonE("#8a6446", { map: planks("#8a6446", "#3e2a1c", 6, true), shade: 0.6 }); const iron = toonE("#34343a"); const red = toonE("#9a4a38", { shade: 0.6 });
  g.add(box(1.3, 0.5, 3.2, wood, 0, 1.0, 0)); for (const sx of [-1, 1]) g.add(box(0.06, 0.32, 3.2, red, sx * 0.67, 1.12, 0, 0.008));
  for (const [z, r] of [[1.1, 0.42], [-1.15, 0.6]] as [number, number][]) for (const sx of [-1, 1]) { const w = wheel(r, red, iron); w.rotation.y = Math.PI / 2; w.position.set(sx * 0.8, r, z); g.add(w); }
  for (const z of [1.1, -1.15]) g.add(box(1.7, 0.1, 0.1, wood, 0, z > 0 ? 0.42 : 0.6, z, 0.008));
  const tongue = box(0.1, 0.1, 2.6, wood, 0, 0.35, 2.6, 0.008); tongue.rotation.x = 0.18; g.add(tongue);
  g.add(box(1.2, 0.08, 0.5, wood, 0, 1.6, 1.25, 0.008)); // seat
  // canvas-covered load + sacks
  for (const [x, z] of [[-0.3, -0.7], [0.25, -0.5], [0, -1.2]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), toonE("#d8c49a")); s.scale.set(1, 0.65, 1.3); s.position.set(x, 1.4, z); ink(s, 0.01); g.add(s); }
  return g; };
const waterTower = () => { const g = new THREE.Group(); const wood = toonE("#7a6250", { shade: 0.6 }); const H = 9;
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const leg = box(0.26, H, 0.26, wood, sx * 2.1, H / 2, sz * 2.1, 0.015); leg.rotation.set(sz * 0.05, 0, -sx * 0.05); g.add(leg); }
  for (const y of [2.5, 5.5]) for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]] as [number[], number[]][]) { const s = 2.1 - y * 0.012; g.add(rod(new THREE.Vector3(a[0] * s, y, a[1] * s), new THREE.Vector3(b[0] * s, y + 2.6, b[1] * s), 0.05, wood, 5)); g.add(rod(new THREE.Vector3(a[0] * s, y + 2.6, a[1] * s), new THREE.Vector3(b[0] * s, y, b[1] * s), 0.05, wood, 5)); }
  const tankM = toonE("#9a7a5a", { map: planks("#9a7a5a", "#4a3424", 24), shade: 0.6 }); const tank = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.8, 3.8, 28), tankM); tank.position.y = H + 2; ink(tank, 0.025); g.add(tank);
  for (const y of [H + 0.6, H + 1.6, H + 2.6, H + 3.5]) { const h = new THREE.Mesh(new THREE.TorusGeometry(2.76, 0.035, 6, 40), toonE("#3a3a40")); h.rotation.x = Math.PI / 2; h.position.y = y; g.add(h); }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.05, 1.6, 28), toonE("#8e7e78", { map: shingles(15, 14, 40), shade: 0.62 })); roof.position.y = H + 4.7; ink(roof, 0.025); g.add(roof);
  g.add(box(5, 0.16, 5, wood, 0, H, 0, 0.015)); const spout = rod(new THREE.Vector3(2.6, H + 0.6, 0), new THREE.Vector3(3.6, H - 1.2, 0), 0.1, toonE("#4a4a50"), 10); g.add(spout);
  return g; };
const church = () => { const g = new THREE.Group(); const wall = toonE("#ece4d2", { map: planks("#ece4d2", "#8a8070", 14, true), shade: 0.68 }); const roofM = toonE("#7a6a70", { map: shingles(250, 8, 38), shade: 0.62 });
  const W = 7, D = 12, H = 4.6; g.add(box(W, H, D, wall, 0, H / 2, -D / 2)); ((g.children[0] as THREE.Mesh).material as unknown as { map: THREE.Texture }).map.repeat.set(2, 1.4);
  const rise = 3.2; for (const sx of [-1, 1]) { const half = Math.hypot(W / 2 + 0.4, rise); const r = box(half, 0.14, D + 0.6, roofM, sx * W / 4, H + rise / 2, -D / 2, 0.02); r.rotation.z = -sx * Math.atan2(rise, W / 2 + 0.4); g.add(r); }
  const gab = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(0, rise)]); const gm = new THREE.Mesh(new THREE.ShapeGeometry(gab), wall); gm.position.set(0, H, 0.001); g.add(gm);
  g.add(box(2.2, 4, 2.2, wall, 0, H + 2, 0.4, 0.02)); g.add(box(2.5, 0.2, 2.5, toonE("#d8ccb4"), 0, H + 4.1, 0.4, 0.012)); g.add(box(1.8, 1.6, 1.8, wall, 0, H + 5, 0.4, 0.015));
  const sp = new THREE.Mesh(new THREE.ConeGeometry(1.45, 4.2, 4), roofM); sp.rotation.y = Math.PI / 4; sp.position.set(0, H + 7.9, 0.4); ink(sp, 0.02); g.add(sp);
  const belfry = toonE("#2a2430"); g.add(box(0.9, 1.0, 1.82, belfry, 0, H + 5, 0.4, 0)); g.add(box(1.82, 1.0, 0.9, belfry, 0, H + 5, 0.4, 0));
  g.add(box(1.4, 2.5, 0.08, toonE("#7a5236", { map: planks("#7a5236", "#3a2618", 4) }), 0, 1.25, 1.52, 0.01)); for (const x of [-2.2, 2.2]) { const w = box(0.9, 1.6, 0.06, new THREE.MeshBasicMaterial({ color: "#5a6a8a" }), x, 2.4, 0.03, 0.006); g.add(w); }
  g.add(box(2.4, 0.3, 1.2, toonE("#b0a494", { map: stones() }), 0, 0.15, 0.9, 0.01)); return g; };
const telePole = (h = 7.2) => { const g = new THREE.Group(); const wood = toonE("#6e5a48", { shade: 0.6 }); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, h, 8), wood); p.position.y = h / 2; ink(p, 0.01); g.add(p); g.add(box(1.6, 0.12, 0.12, wood, 0, h - 0.4, 0, 0.008));
  for (const x of [-0.65, 0.65]) { const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 8), toonE("#8ab0a0", { rim: 0.4 })); ins.position.set(x, h - 0.27, 0); g.add(ins); } return g; };

export const buildTown = (): BuiltSet => {
  reseed(8128); clearGlowCache(); const g = new THREE.Group();
  g.add(daySky(TOWN_SUN, { zen: "#3a6cc0", upper: "#79a6dc", hor: "#f2dec2", warm: "#ffd9aa" }));
  const sunFlat = new THREE.Vector3(TOWN_SUN.x, 0, TOWN_SUN.z).normalize();
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2 + (rnd() - 0.5) * 0.25; const r = 250 + rnd() * 80; const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a)); const c = dayCloud(60 + rnd() * 90, Math.max(0, d.dot(sunFlat))); c.position.set(d.x * r, 50 + rnd() * 80, d.z * r); c.lookAt(0, c.position.y * 0.6, 0); g.add(c); }
  const HZ = "#ecdcc4"; const ring = (n: number, r: number, lit: string, shade: string, haze: number, hMin: number, hMax: number) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + rnd() * 0.35; const m = mesa((30 + rnd() * 50) * r / 150, hMin + rnd() * (hMax - hMin), lit, shade, haze, HZ); m.position.set(Math.sin(a) * r, -1, Math.cos(a) * r); m.lookAt(0, 0, 0); g.add(m); } };
  ring(9, 385, "#f0cfae", "#b0a8c8", 0.7, 30, 56); ring(10, 350, "#e8b08a", "#a090b8", 0.5, 16, 36); ring(12, 318, "#dc9c76", "#8c76a0", 0.3, 7, 18);
  // ground: open land + the street on top
  const land = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), groundMat(landTex(), "#f2dcb4", "#9a8ec8", 0.4)); land.rotation.x = -Math.PI / 2; g.add(land);
  const far = new THREE.Mesh(new THREE.CircleGeometry(420, 64), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(1024, 1024, (c) => { c.fillStyle = "#b8986a"; c.fillRect(0, 0, 1024, 1024); for (let i = 0; i < 9000; i++) dab(c, rnd() * 1024, rnd() * 1024, 1 + rnd() * 3, 0.6 + rnd() * 1.2, 0, ["rgba(140,130,80,0.5)", "rgba(210,180,130,0.45)", "rgba(110,110,80,0.4)", "rgba(160,140,160,0.25)"][(rnd() * 4) | 0]); }) })); far.rotation.x = -Math.PI / 2; far.position.y = -0.04; g.add(noShadow(far));
  const sTex = streetTex(); sTex.repeat.set(1, 140 / 32); const smat = groundMat(sTex, "#f4dcb6", "#9a8ec8", 0.4); smat.polygonOffset = true; smat.polygonOffsetFactor = -2; smat.polygonOffsetUnits = -2;
  const street = new THREE.Mesh(new THREE.PlaneGeometry(16, 140), smat); street.rotation.x = -Math.PI / 2; street.position.set(0, 0.004, -10); g.add(street);
  const glassM = new THREE.MeshBasicMaterial({ map: glassTex(), toneMapped: false, color: "#dcdce6" });
  // ---- buildings (z = centre along the street) ----
  const west: [number, Shop][] = [
    [33, { w: 12, d: 14, h: 5.2, fh: 7.2, col: "#9a6a50", sign: "LIVERY", door: -3, wins: [2.6], awning: false, rail: true, roof: "#8a6a5a" }],
    [21.5, { w: 9, d: 12, h: 4.2, fh: 6.4, col: "#c8b48e", sign: "GENERAL STORE", shop: true, door: 0, wins: [-2.8, 2.8], rail: true }],
    [11.5, { w: 8, d: 12, h: 4.4, fh: 6.6, col: "#8a96a2", sign: "BANK", signBg: "#2e3e54", door: 0, wins: [-2.4, 2.4] }],
    [0, { w: 12, d: 14, h: 7.4, fh: 9.0, col: "#d8c8a4", sign: "HOTEL", signBg: "#5a2e2a", door: 0, wins: [-3.6, -2.0, 2.0, 3.6], upWins: [-4.2, -1.4, 1.4, 4.2], balcony: true }],
    [-11.5, { w: 6.5, d: 10, h: 4.0, fh: 5.8, col: "#a05a48", sign: "BARBER", door: -1.2, wins: [1.4], rail: true }],
    [-20.5, { w: 8.5, d: 11, h: 4.2, fh: 6.2, col: "#b89a78", sign: "SHERIFF", signBg: "#3a2a20", door: 1.5, wins: [-1.8] }],
    [-30, { w: 7.5, d: 10, h: 4.0, fh: 6.0, col: "#7a8a68", sign: "ASSAY OFFICE", door: 0, wins: [-2.2, 2.2], rail: true }],
    [-40, { w: 9.5, d: 12, h: 4.4, fh: 6.6, col: "#c8a878", sign: "DRY GOODS", shop: true, door: 0, wins: [-2.9, 2.9] }],
  ];
  const east: [number, Shop][] = [
    [32, { w: 9, d: 12, h: 4.2, fh: 6.0, col: "#8e7a6a", sign: "BLACKSMITH", door: 0, wins: [-2.6, 2.6], rail: true }],
    [21, { w: 10, d: 13, h: 7.0, fh: 8.2, col: "#b4a07c", sign: "BOARDING HOUSE", door: 2.5, wins: [-2.5, 0], upWins: [-3, 0, 3] }],
    [11.2, { w: 7, d: 10, h: 4.0, fh: 5.8, col: "#7e8ea0", sign: "TELEGRAPH", door: -1.5, wins: [1.4] }],
    [0, { w: 13, d: 16, h: 7.6, fh: 10.0, col: "#a8744e", sign: "SALOON", signBg: "#6a2420", signFg: "#ffe2a0", door: 0, wins: [-4.2, 4.2], upWins: [-4.6, -1.6, 1.6, 4.6], balcony: true, rail: true, batwing: true }],
    [-11.8, { w: 8, d: 11, h: 4.2, fh: 6.2, col: "#d8c8a4", sign: "BAKERY", shop: true, door: -2, wins: [1.6] }],
    [-21, { w: 7.5, d: 10, h: 4.0, fh: 6.0, col: "#8a6a58", sign: "GUNSMITH", door: 1.6, wins: [-1.6], rail: true }],
    [-30.5, { w: 8, d: 11, h: 4.2, fh: 6.0, col: "#6e6a70", sign: "UNDERTAKER", signBg: "#1e1a20", signFg: "#e6e2da", door: -1.8, wins: [1.6] }],
    [-40.5, { w: 9, d: 11, h: 4.2, fh: 6.4, col: "#b08a64", sign: "POST OFFICE", door: 0, wins: [-2.7, 2.7] }],
  ];
  let saloon: THREE.Group | null = null;
  for (const [z, o] of west) { const b = shopFront(o, glassM); b.position.set(-FX, 0, z); b.rotation.y = Math.PI / 2; g.add(b); }
  for (const [z, o] of east) { const b = shopFront(o, glassM); b.position.set(FX, 0, z); b.rotation.y = -Math.PI / 2; g.add(b); if (o.sign === "SALOON") saloon = b; }
  // saloon extras (local coords: facade z=0 facing +Z): batwing doors in a dark doorway, lamps, a bench, piano-glow inside
  const sal = saloon!; const fz = 0.13;
  sal.add(box(1.3, 2.4, 0.06, new THREE.MeshBasicMaterial({ color: "#2a1a14" }), 0, BH + 1.2, fz + 0.02, 0)); // dark interior
  sal.add(box(1.2, 0.45, 0.04, new THREE.MeshBasicMaterial({ color: "#7a4a24", toneMapped: false }), 0, BH + 2.1, fz + 0.04, 0)); // warm glow inside
  const batM = toonE("#c08a58", { map: canvasTex(128, 256, (c) => { c.fillStyle = "#b8845a"; c.fillRect(0, 0, 128, 256); for (let y = 20; y < 236; y += 14) { c.fillStyle = "#5a3620"; c.fillRect(14, y, 100, 5); c.fillStyle = "#b88a5e"; c.fillRect(14, y + 5, 100, 2); } c.strokeStyle = "#4a2c1a"; c.lineWidth = 12; c.strokeRect(6, 6, 116, 244); }), shade: 0.6 });
  for (const sx of [-1, 1]) { const h = new THREE.Group(); h.name = sx < 0 ? "saloonDoorL" : "saloonDoorR"; h.position.set(sx * 0.6, BH + 1.35, fz + 0.1); h.rotation.y = sx * 0.12; sal.add(h);
    const leaf = box(0.58, 1.1, 0.05, batM, -sx * 0.29, 0, 0, 0.01); h.add(leaf); const top = new THREE.Mesh(archGeo(0.58, 0.14, 0.05), batM); top.position.set(-sx * 0.29, 0.55, 0); h.add(top); ink(top, 0.008); }
  for (const s of [-1, 1]) { const lamp = new THREE.Group(); lamp.position.set(s * 1.4, BH + 2.5, fz + 0.25); sal.add(lamp); lamp.add(box(0.22, 0.06, 0.22, toonE("#2e2a28", { rim: 0.4 }), 0, 0.12, 0.03, 0.006)); lamp.add(box(0.2, 0.05, 0.2, toonE("#2e2a28"), 0, -0.14, 0.03, 0.006)); lamp.add(box(0.16, 0.2, 0.16, new THREE.MeshBasicMaterial({ color: "#f0e2b0", toneMapped: false }), 0, -0.02, 0.03, 0)); lamp.add(box(0.05, 0.05, 0.25, toonE("#2e2a28"), 0, 0.1, -0.12, 0)); }
  { const b = new THREE.Group(); b.position.set(-4.3, BH, 0.6); sal.add(b); b.add(box(2.0, 0.08, 0.4, toonE("#5a3e2c"), 0, 0.46, 0, 0.01)); for (const s of [-0.8, 0.8]) b.add(box(0.08, 0.44, 0.36, toonE("#5a3e2c"), s, 0.22, 0, 0.006)); }
  // ---- north end: church, water tower, windmill, corral ----
  const ch = church(); ch.position.set(0, 0, -64); g.add(ch);
  const wt = waterTower(); wt.position.set(15.5, 0, -50); wt.rotation.y = 0.3; g.add(wt);
  const wm = new THREE.Group(); wm.position.set(-17, 0, -52); g.add(wm); { const wood = toonE("#6b5a4a", { shade: 0.6 }); const Hh = 10; for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const leg = box(0.12, Hh, 0.12, wood, sx * 0.8, Hh / 2, sz * 0.8, 0.012); leg.rotation.set(sz * 0.08, 0, -sx * 0.08); wm.add(leg); }
    const hub = new THREE.Group(); hub.position.set(0, Hh + 0.2, 0.45); hub.name = "townWheel"; const blade = toonE("#c9b89c", { shade: 0.6 }); for (let i = 0; i < 16; i++) { const b = box(0.28, 1.5, 0.03, blade, 0, 0.95, 0, 0.008); const p = new THREE.Group(); p.add(b); p.rotation.z = (i / 16) * Math.PI * 2; b.rotation.y = 0.5; hub.add(p); } hub.add(new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.04, 6, 40), wood)); wm.add(hub); wm.add(box(0.05, 0.9, 1.6, toonE("#8a3a2a"), 0, Hh + 0.2, -1.1, 0.01)); wm.rotation.y = 0.6; }
  // ---- street furniture ----
  const tp: THREE.Vector3[] = []; for (let z = 40; z >= -58; z -= 19.5) { const p = telePole(); p.position.set(-FX + BW + 0.35, 0, z); p.rotation.y = Math.PI / 2; g.add(p); tp.push(new THREE.Vector3(-FX + BW + 0.35, 6.93, z)); }
  const wireM = toonE("#2a2626"); for (let i = 0; i < tp.length - 1; i++) for (const dz of [-0.65, 0.65]) { const a = tp[i].clone(), b = tp[i + 1].clone(); a.x += dz; b.x += dz; const pts: THREE.Vector3[] = []; for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push(a.clone().lerp(b, u).add(new THREE.Vector3(0, -Math.sin(u * Math.PI) * 0.45, 0))); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.012, 4), wireM)); }
  const wg = wagon(); wg.position.set(-4.4, 0, 19); wg.rotation.y = 0.08; g.add(wg);
  for (const [x, z, c] of [[-6.8, 27.2, "#7a5236"], [-6.6, 26.5, "#6e4a30"], [6.8, 15.6, "#7a5236"], [6.7, -7.4, "#6e4a30"], [7.4, -7.8, "#7a5236"], [-6.8, -15.8, "#7a5236"], [6.9, -26, "#6e4a30"]] as [number, number, string][]) { const b = barrel(c); b.position.set(x, Math.abs(x) < FX - BW ? 0 : BH, z); g.add(b); }
  for (const [x, z, s, r] of [[-7.3, 18, 0.7, 0.2], [-7.4, 17.2, 0.55, 0.6], [7.2, -16.5, 0.7, 0.1], [-7.2, -42.6, 0.65, 0.4]] as [number, number, number, number][]) { const c = crate(s); c.position.set(x, BH, z); c.rotation.y = r; g.add(c); }
  const trough = (x: number, z: number) => { g.add(box(0.7, 0.55, 2.4, toonE("#6a5040", { map: planks("#6a5040", "#3a2a1e", 6) }), x, 0.28, z)); g.add(box(0.5, 0.04, 2.2, new THREE.MeshBasicMaterial({ color: "#7aa8c8" }), x, 0.5, z, 0)); };
  trough(5.2, 7.6); trough(-5.2, 30);
  // tumbleweed resting against the bank's boardwalk
  { const tw = new THREE.Group(); tw.position.set(1.9, 0.33, 16.5); g.add(tw); const twM = toonE("#a88a5a", { shade: 0.6 }); for (let i = 0; i < 26; i++) { const t2 = new THREE.Mesh(new THREE.TorusGeometry(0.22 + rnd() * 0.12, 0.012, 4, 14), twM); t2.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6); tw.add(t2); } }
  // ---- scrub, trees, tufts, dust ----
  const tt = [treeTex("#3a4a30", "#6a8a48", "#b8c068"), treeTex("#34462e", "#64804a", "#aab860")]; const tms = tt.map((t) => new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: 0.3, toneMapped: false, color: "#f4eee2" }));
  for (const [x, z, sc] of [[-26, 30, 11], [-30, -8, 12], [28, -26, 13], [30, 14, 11], [-24, -42, 10], [26, 44, 10], [-9, -78, 12], [12, -82, 11], [-36, 56, 12], [42, -2, 12]] as [number, number, number][]) { const t2 = new THREE.Sprite(tms[(rnd() * 2) | 0]); t2.scale.set(sc * 0.8, sc, 1); t2.position.set(x, sc / 2 - 0.3, z); g.add(t2); }
  const gms = [grassCard(0, "#efe08a"), grassCard(1, "#e8d27a")].map((t) => new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide }));
  const blades = tufts(g, 1200, () => { const x = (rnd() - 0.5) * 200, z = (rnd() - 0.5) * 200; if (Math.abs(x) < 23 && z > -58 && z < 46) return null; if (Math.abs(x) < 7.5) return null; return [x, z]; }, gms);
  blades.push(...tufts(g, 160, () => { const x = (rnd() < 0.5 ? -1 : 1) * (5.9 + rnd() * 0.4), z = -50 + rnd() * 92; return [x, z]; }, gms, [0.3, 0.4]));
  const dust = dustMotes(600, [-8, 0, -30, 8, 5, 30], "rgba(255,230,190,1)", 0.06, 0.6); g.add(dust.pts);
  // ---- lights ----
  g.add(new THREE.HemisphereLight("#c8d2f2", "#9a7a62", 0.95));
  keyLight(g, TOWN_SUN, "#ffe4bc", 2.7, 60, 110, new THREE.Vector3(0, 0, -6));
  const fill = new THREE.DirectionalLight("#b0c0ff", 0.38); fill.position.set(30, 10, -20); g.add(fill);
  const fog = new THREE.Fog("#ecd8ba", 90, 460);
  g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; const basic = (m.material as THREE.Material).type === "MeshBasicMaterial"; if (!basic) { m.castShadow = true; m.receiveShadow = true; } });
  land.castShadow = false; street.castShadow = false;
  const wheelHub = g.getObjectByName("townWheel")!;
  const marks: Record<string, [number, number, number]> = {
    saloonDoor: [FX - 0.9, BH, 0], duelA: [-0.4, 0, -8], duelB: [-0.4, 0, 2], twinsL: [-FX + 1.1, BH, 4.6], twinsR: [-FX + 1.1, BH, 3.8],
  };
  const V = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];
  const cams = {
    main: { pos: V(3, 13, 50), look: V(0, 2, -14), fov: 42 },
    street: { pos: V(0.35, 0.4, 26), look: V(0, 5.6, -30), fov: 44 },
    saloonFront: { pos: V(-5.2, 1.6, -2.6), look: V(FX, 4.4, 0.6), fov: 46 },
    duel: { pos: V(0.45, 0.85, 5.0), look: V(-1.0, 1.4, -8), fov: 38 },
  };
  return { group: g, fog, cams, marks, update: (t) => { dust.update(t); wheelHub.rotation.z = -t * 1.2; for (const q of blades) q.rotation.z = Math.sin(t * 1.6 + q.position.x * 0.3 + q.position.z * 0.2) * 0.06; } };
};
