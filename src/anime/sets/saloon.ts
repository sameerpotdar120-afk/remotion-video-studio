// Saloon interior at night: warm lamplight (wagon-wheel chandelier with candles, bar sconces, a green-shaded lamp hanging
// over the far poker table) against cool moonlight falling through the windows in long shafts. Long bar with brass rail,
// back bar with bottle shelves + mirror, round poker tables with cards + chips, bentwood chairs, upright piano, stairs up to
// a balcony along the back wall, batwing doors onto the dark street.
// World: metres, y = 0 floor. Room x in [-7, 7], z in [-10, 10]. Doors in the front wall (+Z), bar along the east wall (+X),
// stairs along the west wall, balcony across the back (-Z). The moon is outside to the west-front (-X, +Z).
import * as THREE from "three";
import type { BuiltSet } from "./types";
import { toonE as toonBase, ink, box, reseed, rnd, canvasTex, dab, planks, glowSprite, dustMotes, keyLight, noShadow, noReceive, rod, clearGlowCache } from "./westkit";

// interior: shadows go warm plum instead of the exterior dusk violet
const toonE = (c: string, o: Parameters<typeof toonBase>[1] = {}) => toonBase(c, { shadeTint: "#3a1a22", tintAmt: 0.35, ...o });
const X0 = -7, X1 = 7, Z0 = -10, Z1 = 10, H = 6.6, BAL = 3.4, BALZ = -7.4;
export const MOON_DIR = new THREE.Vector3(-0.62, 0.52, 0.58).normalize();
const TABLE = new THREE.Vector3(-2.8, 0, -5.2);

const wallpaper = () => canvasTex(512, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#6a2a2c"); gr.addColorStop(1, "#5a2226"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = "rgba(40,10,12,0.25)"; g.fillRect(x, 0, 6, 512); g.fillStyle = "rgba(220,160,90,0.12)"; g.fillRect(x + 30, 0, 2, 512); }
  for (let y = 0; y < 512; y += 64) for (let x = 0; x < 512; x += 64) { const cx = x + 32 + ((y / 64) % 2) * 0, cy = y + 32; // damask motif
    g.fillStyle = "rgba(214,160,92,0.35)"; for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + Math.PI / 4; dab(g, cx + Math.cos(a) * 9, cy + Math.sin(a) * 12, 4, 9, a + Math.PI / 2, "rgba(214,160,92,0.2)"); }
    dab(g, cx, cy, 3, 3, 0, "rgba(240,190,110,0.28)"); dab(g, cx, cy - 20, 2.5, 6, 0, "rgba(214,160,92,0.28)"); dab(g, cx, cy + 20, 2.5, 6, 0, "rgba(214,160,92,0.28)"); }
  for (let i = 0; i < 1200; i++) dab(g, rnd() * 512, rnd() * 512, 2 + rnd() * 10, 1 + rnd() * 4, rnd() * 3, rnd() < 0.5 ? "rgba(30,8,10,0.08)" : "rgba(255,200,150,0.05)");
}, [1, 1]);
// night street seen through windows + doors: deep blue sky, stars, moon-lit false fronts across the street, one warm window
const nightStreet = (seedShift: number) => canvasTex(1024, 768, (g) => {
  const sky = g.createLinearGradient(0, 0, 0, 768); sky.addColorStop(0, "#0e1634"); sky.addColorStop(0.55, "#22305e"); sky.addColorStop(1, "#3a4a7a"); g.fillStyle = sky; g.fillRect(0, 0, 1024, 768);
  for (let i = 0; i < 160; i++) { const x = rnd() * 1024, y = rnd() * 420, r = 0.6 + rnd() * 1.6; dab(g, x, y, r, r, 0, `rgba(230,236,255,${0.4 + rnd() * 0.6})`); }
  let x = -40 + seedShift * 30; while (x < 1024) { const w = 160 + rnd() * 180, h = 260 + rnd() * 200, top = 768 - 170 - h;
    const fg = g.createLinearGradient(0, top, 0, 768); fg.addColorStop(0, "#3c4a78"); fg.addColorStop(1, "#1c2244"); g.fillStyle = fg; g.fillRect(x, top, w - 14, h + 170);
    g.fillStyle = "#6a7cb0"; g.fillRect(x, top, w - 14, 6); g.fillStyle = "#141a34"; g.fillRect(x, 768 - 210, w - 14, 18); // cornice + awning
    for (let k = 0; k < 2; k++) { const wx = x + 24 + k * (w / 2 - 6), wy = top + 60; if (rnd() < 0.25) { g.fillStyle = "#ffc46a"; g.fillRect(wx, wy, 34, 48); const gl = g.createRadialGradient(wx + 17, wy + 24, 4, wx + 17, wy + 24, 70); gl.addColorStop(0, "rgba(255,190,100,0.35)"); gl.addColorStop(1, "rgba(255,190,100,0)"); g.fillStyle = gl; g.fillRect(wx - 60, wy - 50, 154, 150); } else { g.fillStyle = "#18203e"; g.fillRect(wx, wy, 34, 48); } }
    x += w; }
  const st = g.createLinearGradient(0, 600, 0, 768); st.addColorStop(0, "#3a4470"); st.addColorStop(1, "#5a6088"); g.fillStyle = st; g.fillRect(0, 610, 1024, 158);
});
const bottleGeo = (h: number, r: number, neck: number) => new THREE.LatheGeometry([[0, 0], [r, 0], [r * 1.05, h * 0.06], [r * 1.05, h * 0.58], [r * 0.7, h * 0.7], [neck, h * 0.78], [neck, h * 0.97], [neck * 1.25, h], [0, h]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
const chair = (wood: THREE.Material) => { const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 18), wood); seat.position.y = 0.46; ink(seat, 0.008); g.add(seat);
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + Math.PI / 4; const leg = rod(new THREE.Vector3(Math.cos(a) * 0.17, 0.45, Math.sin(a) * 0.17), new THREE.Vector3(Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22), 0.018, wood, 6); ink(leg, 0.005); g.add(leg); }
  const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 6, 20, Math.PI), wood); hoop.position.set(0, 0.72, -0.2); ink(hoop, 0.005); g.add(hoop);
  for (const x of [-0.2, 0.2]) g.add(rod(new THREE.Vector3(x, 0.46, -0.2), new THREE.Vector3(x, 0.72, -0.2), 0.016, wood, 6));
  for (const x of [-0.07, 0.07]) g.add(rod(new THREE.Vector3(x, 0.46, -0.2), new THREE.Vector3(x, 0.9, -0.2), 0.012, wood, 5));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.012, 5, 18), wood); ring.rotation.x = Math.PI / 2; ring.position.y = 0.2; g.add(ring);
  return g; }; // faces +Z (sitter looks toward +Z)
const pokerTable = (felt: THREE.Material, wood: THREE.Material, R = 0.68) => { const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.06, 32), wood); top.position.y = 0.76; ink(top, 0.01); g.add(top);
  const f = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.08, R - 0.08, 0.02, 32), felt); f.position.y = 0.795; g.add(f);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.72, 10), wood); ped.position.y = 0.37; ink(ped, 0.008); g.add(ped);
  for (let k = 0; k < 4; k++) { const ft = box(0.5, 0.06, 0.08, wood, 0, 0.04, 0, 0.006); ft.rotation.y = (k / 4) * Math.PI; ft.position.set(Math.cos((k / 2) * Math.PI) * 0.0, 0.04, 0); g.add(ft); }
  return g; };
// chips stack + cards; returns group placed on a table top (y = 0.805)
const chips = (n: number, col: string) => { const g = new THREE.Group(); const m = toonE(col, { shade: 0.6, rim: 0.3 }); const edge = toonE("#f2ead8"); for (let i = 0; i < n; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.0045, 14), i % 3 === 2 ? edge : m); c.position.set((rnd() - 0.5) * 0.002, i * 0.0048 + 0.0023, (rnd() - 0.5) * 0.002); g.add(c); } return g; };
const cardTex = (back: boolean) => canvasTex(64, 96, (c) => { c.fillStyle = "#f6f0e2"; c.fillRect(0, 0, 64, 96); if (back) { c.fillStyle = "#8a2a2a"; c.fillRect(5, 5, 54, 86); c.strokeStyle = "#e6c890"; c.lineWidth = 2; for (let k = -96; k < 96; k += 8) { c.beginPath(); c.moveTo(5 + k, 5); c.lineTo(5 + k + 86, 91); c.stroke(); } c.strokeStyle = "#f6f0e2"; c.lineWidth = 3; c.strokeRect(5, 5, 54, 86); } else { const red = rnd() < 0.5; c.fillStyle = red ? "#b8282a" : "#1e1a1e"; c.font = "bold 22px Georgia"; c.fillText(["A", "K", "Q", "J", "7", "9"][(rnd() * 6) | 0], 6, 24); dab(c, 32, 52, 10, 13, 0, red ? "#b8282a" : "#1e1a1e"); } });
const card = (back: boolean, mats: { back: THREE.Material; faces: THREE.Material[] }) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.063, 0.089), back ? mats.back : mats.faces[(rnd() * mats.faces.length) | 0]); m.rotation.x = -Math.PI / 2; return m; };

export const buildSaloon = (): BuiltSet => {
  reseed(31337); clearGlowCache(); const g = new THREE.Group();
  // ---- shell: floor, walls (wainscot + wallpaper), ceiling with beams ----
  const floorT = planks("#8a5e3e", "#3a2416", 16, true); floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(7, 7);
  const floor = box(X1 - X0, 0.2, Z1 - Z0, toonE("#a87650", { map: floorT, shade: 0.55 }), 0, -0.1, 0, 0); g.add(floor);
  const wp = wallpaper(); wp.wrapS = wp.wrapT = THREE.RepeatWrapping; const wallM = (len: number) => { const t = wp.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(len / 1.1, (H - 1.1) / 1.1); t.needsUpdate = true; return toonE("#d8a890", { map: t, shade: 0.55 }); };
  const wainT = planks("#5a3a26", "#24160e", 10); wainT.wrapS = THREE.RepeatWrapping; const wainM = (len: number) => { const t = wainT.clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(len / 1.2, 1); t.needsUpdate = true; return toonE("#7a5236", { map: t, shade: 0.55 }); };
  const trimM = toonE("#4a2e1e", { shade: 0.6 }); const brass = toonE("#d8a848", { shade: 0.55, rim: 0.6 });
  // walls are built as panels so windows + the door can be real holes (moonlight comes through)
  const T = 0.25;
  const wallPanel = (x0: number, x1: number, y0: number, y1: number, along: "x" | "z", c: number) => { if (x1 - x0 < 0.01 || y1 - y0 < 0.01) return; const len = x1 - x0, mid = (x0 + x1) / 2;
    const addPart = (ya: number, yb: number, mat: THREE.Material) => { if (yb - ya < 0.01) return; const m = along === "x" ? box(len, yb - ya, T, mat, mid, (ya + yb) / 2, c, 0) : box(T, yb - ya, len, mat, c, (ya + yb) / 2, mid, 0); g.add(m); };
    addPart(y0, Math.min(y1, 1.1), wainM(len)); addPart(Math.max(y0, 1.1), y1, wallM(len)); };
  // a wall along an axis with openings [a, b, y0, y1]
  const wall = (along: "x" | "z", c: number, from: number, to: number, holes: [number, number, number, number][]) => {
    let s = from; const hs = [...holes].sort((p, q) => p[0] - q[0]);
    for (const [a, b, y0, y1] of hs) { wallPanel(s, a, 0, H, along, c); wallPanel(a, b, 0, y0, along, c); wallPanel(a, b, y1, H, along, c); s = b; }
    wallPanel(s, to, 0, H, along, c);
    const sgn = Math.sign(-c); // chair rail + skirting on the inner face
    for (const y of [1.1, 0.08]) { const m = along === "x" ? box(to - from, y > 1 ? 0.08 : 0.16, 0.06, trimM, (from + to) / 2, y, c + sgn * (T / 2 + 0.03), 0.006) : box(0.06, y > 1 ? 0.08 : 0.16, to - from, trimM, c + sgn * (T / 2 + 0.03), y, (from + to) / 2, 0.006); g.add(m); }
  };
  const frontWins: [number, number, number, number][] = [[-5.4, -3.6, 1.0, 3.0], [-0.8, 0.8, 0, 2.6], [3.6, 5.4, 1.0, 3.0]];
  const westWins: [number, number, number, number][] = [[1.0, 2.8, 1.0, 3.0], [5.2, 7.0, 1.0, 3.0]];
  wall("x", Z1 + T / 2, X0, X1, frontWins); wall("z", X0 - T / 2, Z0, Z1, westWins); wall("z", X1 + T / 2, Z0, Z1, []); wall("x", Z0 - T / 2, X0, X1, []);
  // upper-storey windows on the front wall (above the balcony line, dark)
  const ceilT = planks("#4a3022", "#1e120c", 12, true); ceilT.wrapS = ceilT.wrapT = THREE.RepeatWrapping; ceilT.repeat.set(5, 5);
  g.add(box(X1 - X0 + 0.6, 0.25, Z1 - Z0 + 0.6, toonE("#5a3a2a", { map: ceilT, shade: 0.55 }), 0, H + 0.125, 0, 0));
  for (let z = Z0 + 2; z < Z1; z += 3.2) g.add(box(X1 - X0, 0.3, 0.26, trimM, 0, H - 0.15, z, 0.012));
  g.add(box(0.3, 0.32, Z1 - Z0, trimM, 0, H - 0.31, 0, 0.012));
  // window frames, mullions (cast shadows into the shafts), glass (no shadow), night street beyond
  const frameM = toonE("#3e2618", { shade: 0.6 }); const glassM = new THREE.MeshBasicMaterial({ color: "#8aa0d8", transparent: true, opacity: 0.12, toneMapped: false, depthWrite: false });
  const winDressing = (wx: number, wz: number, w: number, y0: number, y1: number, along: "x" | "z", seed: number, door = false) => {
    const H2 = y1 - y0, cy = (y0 + y1) / 2; const B = (a: number, b: number, c: number, x: number, y: number, z: number, m: THREE.Material, iw = 0.006) => along === "x" ? box(a, b, c, m, x, y, z, iw) : box(c, b, a, m, z, y, x, iw);
    const inward = -Math.sign(wz); const p = wx, q = wz;
    if (!door) { g.add(B(w + 0.2, 0.12, 0.34, p, y1 + 0.06, q, frameM)); g.add(B(w + 0.3, 0.1, 0.4, p, y0 - 0.05, q + inward * 0.04, frameM)); for (const s of [-1, 1]) g.add(B(0.1, H2, 0.3, p + s * w / 2, cy, q, frameM));
      g.add(B(0.06, H2, 0.08, p, cy, q, frameM)); for (const f of [1 / 3, 2 / 3]) g.add(B(w, 0.06, 0.08, p, y0 + H2 * f, q, frameM));
      const gl = along === "x" ? box(w, H2, 0.02, glassM, p, cy, q, 0) : box(0.02, H2, w, glassM, q, cy, p, 0); g.add(noReceive(noShadow(gl)));
      // curtains (tied back)
      for (const s of [-1, 1]) { const cu = B(0.28, H2 + 0.3, 0.05, p + s * (w / 2 + 0.12), cy + 0.1, q + inward * 0.18, toonE("#4a1c24", { shade: 0.5 }), 0.008); g.add(cu); }
    } else { g.add(B(w + 0.3, 0.16, 0.34, p, y1 + 0.08, q, frameM)); for (const s of [-1, 1]) g.add(B(0.12, H2 + 0.08, 0.32, p + s * (w / 2 + 0.04), cy, q, frameM)); }
    // night backdrop outside
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(9, 6.75), new THREE.MeshBasicMaterial({ map: nightStreet(seed), toneMapped: false, fog: false }));
    const out = -inward * 6; if (along === "x") { bd.position.set(p, 2.4, q + out); bd.rotation.y = Math.sign(q) > 0 ? Math.PI : 0; } else { bd.position.set(q + out, 2.4, p); bd.rotation.y = Math.sign(q) > 0 ? -Math.PI / 2 : Math.PI / 2; }
    g.add(noReceive(noShadow(bd)));
  };
  frontWins.forEach(([a, b, y0, y1], i) => winDressing((a + b) / 2, Z1 + T / 2, b - a, y0, y1, "x", i, i === 1));
  westWins.forEach(([a, b, y0, y1], i) => winDressing((a + b) / 2, X0 - T / 2, b - a, y0, y1, "z", i + 3));
  // outside ground under the backdrops (moonlit boardwalk), so the low door view isn't a void
  for (const [x, z, w, d] of [[0, Z1 + 3.5, 18, 6.5], [X0 - 3.5, 0, 6.5, 22]] as [number, number, number, number][]) g.add(noShadow(box(w, 0.1, d, toonE("#5a6890", { map: planks("#6a7090", "#2a3050", 12, true), shade: 0.6 }), x, -0.05, z, 0)));
  // batwing doors (in the doorway), named so a scene can swing them
  const batM = toonE("#b07a4c", { map: canvasTex(128, 256, (c) => { c.fillStyle = "#a8744a"; c.fillRect(0, 0, 128, 256); for (let y = 20; y < 236; y += 14) { c.fillStyle = "#5a3620"; c.fillRect(14, y, 100, 5); c.fillStyle = "#d0a070"; c.fillRect(14, y + 5, 100, 2); } c.strokeStyle = "#4a2c1a"; c.lineWidth = 12; c.strokeRect(6, 6, 116, 244); }), shade: 0.6 });
  for (const sx of [-1, 1]) { const h = new THREE.Group(); h.name = sx < 0 ? "saloonDoorL" : "saloonDoorR"; h.position.set(sx * 0.78, 1.35, Z1 - 0.05); h.rotation.y = sx * -0.1; g.add(h);
    h.add(box(0.76, 1.1, 0.05, batM, -sx * 0.38, 0, 0, 0.01)); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 16, 1, false, 0, Math.PI), batM); top.rotation.set(Math.PI / 2, 0, sx > 0 ? Math.PI / 2 : -Math.PI / 2); top.scale.set(1, 1, 0.45); top.position.set(-sx * 0.38, 0.55, 0); ink(top, 0.008); h.add(top); }
  // ---- bar ----
  const darkWood = toonE("#5a3420", { map: planks("#5a3420", "#24140c", 6), shade: 0.55, rim: 0.15 }); const barTop = toonE("#4a2416", { shade: 0.5, rim: 0.12 });
  const BX = 4.3, BZ0 = -6.2, BZ1 = 4.2; const BL = BZ1 - BZ0, BZc = (BZ0 + BZ1) / 2;
  g.add(box(0.6, 1.05, BL, darkWood, BX, 0.525, BZc, 0.015));
  g.add(box(0.85, 0.07, BL + 0.15, barTop, BX - 0.05, 1.09, BZc, 0.012));
  for (let z = BZ0 + 0.6; z < BZ1; z += 1.3) g.add(box(0.06, 0.8, 1.05, toonE("#6a4028", { shade: 0.55 }), BX - 0.32, 0.55, z, 0.006)); // raised panels
  g.add(rod(new THREE.Vector3(BX - 0.55, 0.22, BZ0), new THREE.Vector3(BX - 0.55, 0.22, BZ1), 0.03, brass, 10));
  for (let z = BZ0 + 0.5; z < BZ1; z += 2.2) g.add(rod(new THREE.Vector3(BX - 0.55, 0.22, z), new THREE.Vector3(BX - 0.32, 0.22, z), 0.015, brass, 6));
  for (let z = BZ0 + 1.2; z < BZ1; z += 2.6) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.22, 12), brass); sp.position.set(BX - 0.85, 0.11, z); ink(sp, 0.005); g.add(sp); } // spittoons
  // stools
  for (let z = BZ0 + 0.8; z < BZ1 - 0.3; z += 1.25) { const st = new THREE.Group(); st.position.set(BX - 0.95, 0, z); g.add(st); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.07, 16), toonE("#6a2a24", { shade: 0.55 })); s.position.y = 0.76; ink(s, 0.006); st.add(s); st.add(rod(new THREE.Vector3(0, 0.74, 0), new THREE.Vector3(0, 0, 0), 0.03, darkWood, 8)); const bs = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.03, 12), darkWood); bs.position.y = 0.015; st.add(bs); }
  // back bar: cabinet, mirror, shelves of bottles
  g.add(box(0.55, 1.0, BL - 1, darkWood, X1 - 0.3, 0.5, BZc, 0.012)); g.add(box(0.62, 0.06, BL - 0.9, barTop, X1 - 0.3, 1.03, BZc, 0.008));
  const mirT = canvasTex(512, 256, (c) => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#3a2a2a"); gr.addColorStop(1, "#5a3a2a"); c.fillStyle = gr; c.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 14; i++) { const x = rnd() * 512, y = 40 + rnd() * 150, r = 14 + rnd() * 40; const gl = c.createRadialGradient(x, y, 0, x, y, r); gl.addColorStop(0, "rgba(255,200,120,0.55)"); gl.addColorStop(1, "rgba(255,170,90,0)"); c.fillStyle = gl; c.fillRect(x - r, y - r, r * 2, r * 2); }
    c.strokeStyle = "rgba(255,255,255,0.16)"; c.lineWidth = 30; c.beginPath(); c.moveTo(60, 256); c.lineTo(220, 0); c.stroke(); c.lineWidth = 10; c.beginPath(); c.moveTo(140, 256); c.lineTo(300, 0); c.stroke(); });
  const mirror = box(0.04, 1.4, 4.2, new THREE.MeshBasicMaterial({ map: mirT, toneMapped: false }), X1 - 0.02, 2.05, BZc, 0); g.add(mirror);
  g.add(box(0.1, 1.6, 0.14, toonE("#c89838", { rim: 0.5 }), X1 - 0.04, 2.05, BZc - 2.17, 0.006)); g.add(box(0.1, 1.6, 0.14, toonE("#c89838", { rim: 0.5 }), X1 - 0.04, 2.05, BZc + 2.17, 0.006)); g.add(box(0.12, 0.14, 4.5, toonE("#c89838", { rim: 0.5 }), X1 - 0.04, 2.82, BZc, 0.006)); g.add(box(0.12, 0.12, 4.5, toonE("#c89838", { rim: 0.5 }), X1 - 0.04, 1.3, BZc, 0.006));
  g.add(box(0.2, 0.5, BL - 0.4, darkWood, X1 - 0.1, 3.15, BZc, 0.012)); // carved crown
  const bMats = ["#8a4a1a", "#3e6a3a", "#c8a050", "#2a3a2a", "#a8c0b8", "#6a1e1e"].map((c) => toonE(c, { shade: 0.45, rim: 0.7 }));
  const labelM = [toonE("#efe2c0"), toonE("#d8b878"), toonE("#c8d0c0")];
  const shelfZ = [[BZ0 + 0.4, BZc - 2.4], [BZc + 2.4, BZ1 - 0.4]];
  for (const [za, zb] of shelfZ) for (const y of [1.55, 2.15, 2.75]) { g.add(box(0.32, 0.05, zb - za + 0.2, darkWood, X1 - 0.18, y, (za + zb) / 2, 0.006));
    for (let z = za; z < zb; z += 0.16 + rnd() * 0.06) { const h = 0.24 + rnd() * 0.12; const b = new THREE.Mesh(bottleGeo(h, 0.038 + rnd() * 0.012, 0.012), bMats[(rnd() * bMats.length) | 0]); b.position.set(X1 - 0.18 + (rnd() - 0.5) * 0.06, y + 0.025, z); ink(b, 0.004); g.add(b);
      if (rnd() < 0.7) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.041, h * 0.22, 12, 1, true), labelM[(rnd() * 3) | 0]); l.position.y = h * 0.32; b.add(l); } } }
  // bottles, glasses on the bar top
  const glassT = toonE("#d8e8f0", { shade: 0.6, rim: 0.8 });
  for (let z = BZ0 + 0.7; z < BZ1; z += 0.9 + rnd() * 0.7) { if (rnd() < 0.45) { const b = new THREE.Mesh(bottleGeo(0.3, 0.042, 0.013), bMats[(rnd() * 3) | 0]); b.position.set(BX - 0.1 + (rnd() - 0.5) * 0.2, 1.125, z); ink(b, 0.004); g.add(b); }
    const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.028, 0.09, 12), glassT); gl.position.set(BX - 0.25, 1.17, z + 0.25); ink(gl, 0.003); g.add(gl); }
  // painting over the back bar (moonlit mesa landscape, gold frame) + a mounted pair of horns
  const paint = box(0.05, 1.1, 2.0, new THREE.MeshBasicMaterial({ toneMapped: false, color: "#c8b8a8", map: canvasTex(400, 220, (c) => { const s = c.createLinearGradient(0, 0, 0, 220); s.addColorStop(0, "#e8a070"); s.addColorStop(1, "#f4d2a0"); c.fillStyle = s; c.fillRect(0, 0, 400, 220); c.fillStyle = "#8a5a6a"; c.beginPath(); c.moveTo(0, 150); c.lineTo(60, 90); c.lineTo(140, 90); c.lineTo(180, 140); c.lineTo(260, 70); c.lineTo(340, 70); c.lineTo(400, 140); c.lineTo(400, 220); c.lineTo(0, 220); c.fill(); c.fillStyle = "#c88a5a"; c.fillRect(0, 170, 400, 50); dab(c, 320, 40, 18, 18, 0, "#fff2d0"); }) }), X1 - 0.05, 4.4, BZc, 0); g.add(paint);
  g.add(box(0.1, 1.25, 2.15, toonE("#c89838", { rim: 0.5 }), X1 - 0.02, 4.4, BZc, 0.008));
  // ---- poker tables + chairs ----
  const felt = toonE("#2f6a48", { shade: 0.55, map: canvasTex(128, 128, (c) => { c.fillStyle = "#3a7a52"; c.fillRect(0, 0, 128, 128); for (let i = 0; i < 600; i++) dab(c, rnd() * 128, rnd() * 128, 1 + rnd() * 2, 1, rnd() * 3, rnd() < 0.5 ? "rgba(20,60,40,0.25)" : "rgba(120,180,140,0.15)"); }) });
  const tableWood = toonE("#6a3e24", { shade: 0.55, rim: 0.2 }); const chairWood = toonE("#7a4a2c", { shade: 0.55 });
  const cardMats = { back: toonE("#ffffff", { map: cardTex(true), shade: 0.7, side: THREE.DoubleSide }), faces: [0, 1, 2, 3].map(() => toonE("#ffffff", { map: cardTex(false), shade: 0.7, side: THREE.DoubleSide })) };
  const chipCols = ["#b8282a", "#2a4a9a", "#f2ead8", "#1e1a1e", "#2a7a4a"];
  const dressTable = (tg: THREE.Group, seats: number[], busy: boolean) => {
    for (const a of seats) { const cx = Math.sin(a) * 0.62, cz = Math.cos(a) * 0.62;
      // chair at angle a, facing the table centre
      const ch = chair(chairWood); ch.position.set(Math.sin(a) * 0.95, 0, Math.cos(a) * 0.95); ch.rotation.y = a + Math.PI; tg.add(ch);
      if (busy) { for (let k = 0; k < 2; k++) { const s = chips(4 + ((rnd() * 9) | 0), chipCols[(rnd() * 5) | 0]); s.position.set(Math.sin(a + 0.35 * (k ? 1 : -1)) * 0.5, 0.805, Math.cos(a + 0.35 * (k ? 1 : -1)) * 0.5); tg.add(s); }
        for (let k = 0; k < 5; k++) { const c = card(true, cardMats); c.position.set(cx * 0.82 + Math.cos(a) * (k - 2) * 0.012, 0.807 + k * 0.0006, cz * 0.82 - Math.sin(a) * (k - 2) * 0.012); c.rotation.z = a + (k - 2) * 0.12; tg.add(c); } }
    }
    if (busy) { // pot in the middle + a few face-up cards + deck, a bottle and glasses
      for (let k = 0; k < 6; k++) { const s = chips(2 + ((rnd() * 6) | 0), chipCols[(rnd() * 5) | 0]); s.position.set((rnd() - 0.5) * 0.18, 0.805, (rnd() - 0.5) * 0.18); tg.add(s); }
      for (let k = 0; k < 3; k++) { const c = card(false, cardMats); c.position.set(-0.08 + k * 0.075, 0.808, 0.12); c.rotation.z = (rnd() - 0.5) * 0.1; tg.add(c); }
      const deck = box(0.064, 0.02, 0.09, toonE("#a83030", { shade: 0.6 }), 0.18, 0.815, -0.12, 0.003); tg.add(deck);
      const b = new THREE.Mesh(bottleGeo(0.3, 0.04, 0.013), bMats[0]); b.position.set(-0.32, 0.805, -0.22); ink(b, 0.004); tg.add(b);
      for (const [x, z] of [[0.3, 0.3], [-0.35, 0.25], [0.12, -0.42]]) { const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.08, 12), glassT); gl.position.set(x, 0.845, z); ink(gl, 0.003); tg.add(gl); const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.025, 0.035, 12), toonE("#c87a2a", { shade: 0.6 })); wh.position.set(x, 0.823, z); tg.add(wh); }
      const ash = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.025, 14), toonE("#4a4a50", { rim: 0.4 })); ash.position.set(0.38, 0.818, -0.12); tg.add(ash);
    }
  };
  // the far table under its hanging lamp: three seats on the far half, open toward the room
  const seatAng = [Math.PI + 0.1, Math.PI / 2 + 0.25, -Math.PI / 2 - 0.05].map((a) => a + 0.45);
  const far = new THREE.Group(); far.position.copy(TABLE); g.add(far); far.add(pokerTable(felt, tableWood)); dressTable(far, seatAng, true);
  for (const [x, z, n, busy] of [[-2.2, 2.4, 4, true], [1.0, -1.5, 3, false], [-4.6, 5.8, 3, false], [1.4, 5.6, 4, true]] as [number, number, number, boolean][]) { const t2 = new THREE.Group(); t2.position.set(x, 0, z); t2.rotation.y = rnd() * 6; g.add(t2); t2.add(pokerTable(felt, tableWood)); dressTable(t2, Array.from({ length: n }, (_, k) => (k / n) * Math.PI * 2 + rnd() * 0.3), busy); }
  // ---- stairs + balcony ----
  const stepM = toonE("#7a5034", { map: planks("#7a5034", "#2a1a10", 6, true), shade: 0.55 }); const SX = X0 + 0.75, N = 17, RUN = 0.36, SZ0 = 1.6;
  for (let i = 0; i < N; i++) { const y = (i + 1) * BAL / N; g.add(box(1.3, 0.06, RUN + 0.04, stepM, SX, y - 0.03, SZ0 - i * RUN - RUN / 2, 0.006)); g.add(box(1.3, BAL / N, 0.03, darkWood, SX, y - BAL / N / 2 - 0.03, SZ0 - i * RUN, 0)); }
  const sLen = Math.hypot(N * RUN, BAL); const ang = Math.atan2(BAL, N * RUN);
  const stringer = box(0.08, 0.32, sLen, darkWood, SX + 0.68, BAL / 2 - 0.1, SZ0 - N * RUN / 2, 0.01); stringer.rotation.x = ang; g.add(stringer);
  const rail = box(0.08, 0.08, sLen, trimM, SX + 0.68, BAL / 2 + 0.92, SZ0 - N * RUN / 2, 0.008); rail.rotation.x = ang; g.add(rail);
  for (let i = 1; i < N; i += 2) { const y = (i + 1) * BAL / N; g.add(box(0.04, 0.9, 0.04, trimM, SX + 0.68, y + 0.45, SZ0 - i * RUN - RUN / 2, 0)); }
  const newel = box(0.16, 1.2, 0.16, darkWood, SX + 0.68, 0.6, SZ0 + 0.05, 0.01); g.add(newel); const nb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), darkWood); nb.position.set(SX + 0.68, 1.25, SZ0 + 0.05); ink(nb, 0.006); g.add(nb);
  const balT = planks("#7a5034", "#2a1a10", 14, true); balT.wrapS = balT.wrapT = THREE.RepeatWrapping; balT.repeat.set(4, 1);
  g.add(box(X1 - X0, 0.2, BALZ - Z0, toonE("#7a5034", { map: balT, shade: 0.55 }), 0, BAL - 0.1, (Z0 + BALZ) / 2, 0.012));
  g.add(box(X1 - X0, 0.3, 0.12, darkWood, 0, BAL - 0.25, BALZ, 0.01));
  g.add(box(X1 - X0 - 1.5, 0.08, 0.1, trimM, 0.75, BAL + 1.0, BALZ + 0.02, 0.008)); for (let x = X0 + 1.6; x < X1; x += 0.22) g.add(box(0.045, 0.95, 0.045, trimM, x, BAL + 0.5, BALZ + 0.02, 0));
  for (const x of [-3.9, 0.6, 3.6]) { g.add(box(0.2, BAL, 0.2, darkWood, x, BAL / 2, BALZ + 0.05, 0.012)); for (const s of [-1, 1]) { const br = box(0.08, 0.7, 0.08, darkWood, x + s * 0.25, BAL - 0.45, BALZ + 0.05, 0.006); br.rotation.z = s * 0.7; g.add(br); } }
  for (const x of [-2.5, 1.5, 5.0]) { g.add(box(0.95, 2.1, 0.06, toonE("#5a3420", { map: planks("#5a3420", "#24140c", 4), shade: 0.55 }), x, BAL + 1.05, Z0 + 0.04, 0.008)); g.add(box(0.06, 0.06, 0.06, brass, x + 0.33, BAL + 1.0, Z0 + 0.09, 0)); g.add(box(1.15, 0.12, 0.1, trimM, x, BAL + 2.15, Z0 + 0.06, 0.006)); }
  // ---- piano (front-left, against the front wall) ----
  { const p = new THREE.Group(); p.position.set(-6.0, 0, 8.0); p.rotation.y = Math.PI / 2; g.add(p); const pw = toonE("#2e1a12", { shade: 0.5, rim: 0.4 });
    p.add(box(1.5, 1.3, 0.6, pw, 0, 0.65, 0, 0.012)); p.add(box(1.55, 0.06, 0.65, pw, 0, 1.33, 0, 0.008)); p.add(box(1.4, 0.1, 0.3, pw, 0, 0.72, 0.42, 0.008));
    p.add(box(1.3, 0.03, 0.14, toonE("#f2ead8"), 0, 0.785, 0.45, 0.004)); for (let k = 0; k < 18; k++) p.add(box(0.03, 0.02, 0.08, toonE("#141014"), -0.6 + k * 0.071, 0.805, 0.42, 0));
    p.add(box(0.06, 0.62, 0.06, pw, -0.68, 0.36, 0.52, 0.004)); p.add(box(0.06, 0.62, 0.06, pw, 0.68, 0.36, 0.52, 0.004));
    const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 14), toonE("#6a2a24")); stool.position.set(0.1, 0.5, 0.95); ink(stool, 0.005); p.add(stool); p.add(rod(new THREE.Vector3(0.1, 0.48, 0.95), new THREE.Vector3(0.1, 0, 0.95), 0.03, pw, 8));
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 8), toonE("#f2e8d0")); candle.position.set(-0.5, 1.43, 0.1); p.add(candle); const fl = glowSprite("rgba(255,210,130,1)", "rgba(255,140,60,0)", 0.35); fl.position.set(-0.5, 1.54, 0.1); p.add(fl); }
  // ---- lights: wagon-wheel chandelier, bar sconces, hanging lamp over the far table ----
  const warmGlows: THREE.Sprite[] = []; const flames: THREE.Mesh[] = [];
  const flameM = new THREE.MeshBasicMaterial({ color: "#ffe2a0", toneMapped: false });
  const candleAt = (parent: THREE.Object3D, x: number, y: number, z: number) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 8), toonE("#f2e8d0", { shade: 0.7 })); c.position.set(x, y + 0.08, z); parent.add(c); const f = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), flameM); f.scale.set(1, 2, 1); f.position.set(x, y + 0.2, z); parent.add(noShadow(f)); flames.push(f); const s = glowSprite("rgba(255,214,140,1)", "rgba(255,150,70,0)", 0.5, 0.9); s.position.set(x, y + 0.21, z); parent.add(s); warmGlows.push(s); };
  const chand = new THREE.Group(); chand.position.set(0, 4.3, 0.5); g.add(chand); const iron = toonE("#2e2a28", { rim: 0.35 });
  const wheelR = 0.85; const wr = new THREE.Mesh(new THREE.TorusGeometry(wheelR, 0.05, 8, 32), toonE("#5a3a24", { shade: 0.55 })); wr.rotation.x = Math.PI / 2; ink(wr, 0.008); chand.add(wr);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; const sp = box(wheelR * 2, 0.05, 0.05, toonE("#5a3a24"), 0, 0, 0, 0.004); sp.rotation.y = a; if (k < 4) chand.add(sp); candleAt(chand, Math.cos(a) * wheelR, 0.03, Math.sin(a) * wheelR); }
  const hubM = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 12), iron); chand.add(hubM);
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; chand.add(rod(new THREE.Vector3(Math.cos(a) * wheelR, 0, Math.sin(a) * wheelR), new THREE.Vector3(0, 1.1, 0), 0.008, iron, 4)); }
  chand.add(rod(new THREE.Vector3(0, 1.1, 0), new THREE.Vector3(0, H - 4.3, 0), 0.015, iron, 5));
  const chL = new THREE.PointLight("#ffb466", 40, 22, 1.25); chL.position.set(0, 4.1, 0.5); g.add(chL);
  const ambGlow = glowSprite("rgba(255,190,110,0.5)", "rgba(255,150,70,0)", 4.5, 0.55); ambGlow.position.set(0, 4.35, 0.5); g.add(ambGlow);
  // bar sconces on the east wall + their lights
  for (const z of [BZ0 + 0.6, BZ1 - 0.6]) { const sc = new THREE.Group(); sc.position.set(X1 - 0.12, 2.3, z); g.add(sc); sc.add(box(0.06, 0.3, 0.16, brass, 0, 0, 0, 0.004)); sc.add(box(0.2, 0.04, 0.04, brass, -0.1, 0.0, 0, 0)); candleAt(sc, -0.2, 0.02, 0); const L = new THREE.PointLight("#ffb466", 5, 7, 1.7); L.position.set(X1 - 0.6, 2.5, z); g.add(L); }
  // hanging lamp over the far table: chain, green glass shade, bright mantle, pool of light
  const lamp = new THREE.Group(); lamp.position.set(TABLE.x, 2.05, TABLE.z); g.add(lamp);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.36, 0.22, 24, 1, true), new THREE.MeshBasicMaterial({ color: "#2c5a40", side: THREE.FrontSide })); ink(shade, 0.006); lamp.add(shade);
  const shadeIn = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.355, 0.21, 24, 1, true), new THREE.MeshBasicMaterial({ color: "#ffe6b0", toneMapped: false, side: THREE.BackSide })); lamp.add(noShadow(shadeIn));
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), new THREE.MeshBasicMaterial({ color: "#fff2d0", toneMapped: false })); bulb.position.y = -0.06; lamp.add(noShadow(bulb));
  lamp.add(rod(new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, H - 2.05, 0), 0.008, iron, 4)); const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.08, 12), brass); cap.position.y = 0.14; lamp.add(cap);
  const lampGlow = glowSprite("rgba(255,226,160,1)", "rgba(255,170,80,0)", 1.1, 0.9); lampGlow.position.y = -0.1; lamp.add(lampGlow);
  const tL = new THREE.SpotLight("#ffcf8a", 22, 6, 0.95, 0.55, 1.6); tL.position.set(TABLE.x, 1.98, TABLE.z); tL.target.position.set(TABLE.x, 0, TABLE.z); g.add(tL, tL.target);
  const tL2 = new THREE.PointLight("#ffbe78", 2.2, 5, 1.8); tL2.position.set(TABLE.x, 1.9, TABLE.z); g.add(tL2);
  // ---- moonlight: shadow-casting key through the windows, faint blue ambient, light shafts ----
  g.add(new THREE.HemisphereLight("#4a5a9a", "#3a2620", 0.55));
  keyLight(g, MOON_DIR, "#a8bcff", 3.4, 16, 40, new THREE.Vector3(0, 0, 0));
  const shaftM = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, fog: false });
  const toFloor = (c: THREE.Vector3) => c.clone().addScaledVector(MOON_DIR, -(c.y - 0.006) / MOON_DIR.y);
  const paneTex = canvasTex(256, 256, (c) => { c.filter = "blur(5px)"; c.fillStyle = "rgba(150,180,255,0.95)"; c.fillRect(14, 14, 228, 228); c.filter = "blur(2px)"; c.fillStyle = "#000"; c.fillRect(122, 0, 12, 256); c.fillRect(0, 80, 256, 10); c.fillRect(0, 166, 256, 10); });
  const patchM = new THREE.MeshBasicMaterial({ map: paneTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.55, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const shaft = (corners: THREE.Vector3[]) => { const far2 = corners.map(toFloor);
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.Float32BufferAttribute([far2[0], far2[1], far2[2], far2[0], far2[2], far2[3]].flatMap((v) => [v.x, v.y, v.z]), 3)); pg.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2)); g.add(noReceive(noShadow(new THREE.Mesh(pg, patchM)))); const pos: number[] = [], col: number[] = [];
    for (let i = 0; i < 4; i++) { const a = corners[i], b = corners[(i + 1) % 4], c = far2[(i + 1) % 4], e = far2[i]; for (const [p, al] of [[a, 1], [b, 1], [c, 0], [a, 1], [c, 0], [e, 0]] as [THREE.Vector3, number][]) { pos.push(p.x, p.y, p.z); col.push(0.36, 0.46, 0.75, 0.2 * al); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 4)); const m = new THREE.Mesh(geo, shaftM); m.renderOrder = 5; g.add(noReceive(noShadow(m))); };
  for (const [a, b, y0, y1] of westWins) shaft([new THREE.Vector3(X0, y0, a), new THREE.Vector3(X0, y0, b), new THREE.Vector3(X0, y1, b), new THREE.Vector3(X0, y1, a)]);
  for (const [a, b, y0, y1] of frontWins) if (y0 > 0) shaft([new THREE.Vector3(a, y0, Z1), new THREE.Vector3(b, y0, Z1), new THREE.Vector3(b, y1, Z1), new THREE.Vector3(a, y1, Z1)]);
  const dust = dustMotes(500, [X0 + 0.3, 0.2, -2, 2, 3.2, Z1 - 0.3], "rgba(190,210,255,1)", 0.035, 0.55); g.add(dust.pts);
  const smoke = dustMotes(200, [TABLE.x - 0.8, 1.2, TABLE.z - 0.8, TABLE.x + 0.8, 2.0, TABLE.z + 0.8], "rgba(255,220,170,1)", 0.05, 0.35); g.add(smoke.pts);
  g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; const basic = (m.material as THREE.Material).type === "MeshBasicMaterial"; if (!basic) { m.castShadow = true; m.receiveShadow = true; } });
  const fog = new THREE.Fog("#1a1426", 14, 40);
  const seats: [number, number, number][] = seatAng.map((a) => [TABLE.x + Math.sin(a) * 0.95, 0, TABLE.z + Math.cos(a) * 0.95]);
  const marks: Record<string, [number, number, number]> = { door: [-0.1, 0, Z1 - 0.9], table: [TABLE.x, 0, TABLE.z], seat1: seats[0], seat2: seats[1], seat3: seats[2], bar: [BX - 0.95, 0, -0.5] };
  const V = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];
  const cams = {
    main: { pos: V(5.6, 4.3, 8.8), look: V(-3.6, 1.0, -1.0), fov: 56 },
    door: { pos: V(0.75, 1.7, Z1 - 0.3), look: V(-1.3, 1.45, -6), fov: 52 },
    table: { pos: V(0.4, 1.65, 0.2), look: V(TABLE.x, 1.0, TABLE.z), fov: 42 },
    bar: { pos: V(0.6, 1.6, 3.6), look: V(5.2, 1.5, -2.2), fov: 48 },
    poker: { pos: V(TABLE.x + 1.3, 1.25, TABLE.z + 1.3), look: V(TABLE.x, 1.3, TABLE.z), fov: 50 },
  };
  return { group: g, fog, cams, marks, update: (t) => { dust.update(t); smoke.update(t * 0.6); for (let i = 0; i < flames.length; i++) { const f = 1 + Math.sin(t * 11 + i * 1.7) * 0.08 + Math.sin(t * 17.3 + i) * 0.05; flames[i].scale.set(1, 2 * f, 1); warmGlows[i].material.opacity = 0.8 + Math.sin(t * 9 + i * 2.1) * 0.1; } chL.intensity = 40 * (1 + Math.sin(t * 7) * 0.03 + Math.sin(t * 13.1) * 0.02); } };
};
