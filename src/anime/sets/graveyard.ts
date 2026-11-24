// Hillside graveyard (soft overcast day, slightly desaturated). Fenced plot on a shoulder of a hill, wooden crosses + board
// markers on old grave mounds, one open grave (runs along Z, head at -Z) with the earth heaped on its -X side and an open
// pine coffin on its +X side, mourners on the +X side facing the grave, a lone oak behind. Gate + path downhill towards +Z.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { BuiltSet } from "./types";
import { canvasTex, dab, ink, box } from "../farm";
import { mkRnd, toonO, noShadow, cyl, paintedSky, grassTex, grassField, groundMat, keyLight } from "./h2kit";

const sp = (u: number) => Math.log1p(Math.exp(u));
// terrain: a flat shoulder for the plot, the hill rising behind (-Z, -X) and falling away in front (+Z)
export const graveH = (x: number, z: number) => 0.16 * sp(-z - 9) * (1 + 0.3 * Math.sin(x * 0.11)) + 0.07 * sp(-x - 11) - 0.11 * sp(z - 8) * (1 + 0.25 * Math.sin(x * 0.07 + 1)) + 0.04 * Math.sin(x * 0.21) * sp(Math.abs(z) - 9);
const PIT = { x0: -0.55, x1: 0.55, z0: -1.15, z1: 1.15, depth: 1.8 };

export const buildGraveyard = (): BuiltSet => {
  const rnd = mkRnd(77); const g = new THREE.Group(); const H = graveH;
  // ---------- textures ----------
  const wood = (base: string, n: number, w = 256, h = 256) => canvasTex(w, h, (c) => { const bw = w / n; for (let i = 0; i < n; i++) { const col = new THREE.Color(base).multiplyScalar(0.86 + rnd() * 0.24); c.fillStyle = "#" + col.getHexString(); c.fillRect(i * bw, 0, bw, h);
    for (let k = 0; k < 6; k++) { c.strokeStyle = rnd() < 0.6 ? "rgba(40,35,40,0.25)" : "rgba(255,250,240,0.18)"; c.lineWidth = 1 + rnd(); const x = i * bw + rnd() * bw; c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + (rnd() - 0.5) * 6, h / 3, x + (rnd() - 0.5) * 6, (2 * h) / 3, x + (rnd() - 0.5) * 5, h); c.stroke(); }
    for (let k = 0; k < 3; k++) dab(c, i * bw + rnd() * bw, rnd() * h, 4 + rnd() * 8, 10 + rnd() * 30, 0, "rgba(60,60,70,0.1)"); if (n > 1) { c.fillStyle = "rgba(30,28,34,0.8)"; c.fillRect(i * bw, 0, 2, h); } } });
  const earthTex = (light: boolean) => canvasTex(512, 512, (c) => { c.fillStyle = light ? "#7a6656" : "#4e3e36"; c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5000; i++) dab(c, rnd() * 512, rnd() * 512, 2 + rnd() * 9, 1.5 + rnd() * 4, rnd() * 3, ["rgba(140,120,100,0.25)", "rgba(50,38,34,0.3)", "rgba(110,100,110,0.18)", "rgba(170,150,130,0.2)"][(rnd() * 4) | 0]);
    for (let i = 0; i < 260; i++) { const x = rnd() * 512, y = rnd() * 512, r = 2 + rnd() * 5; dab(c, x, y + 1, r, r * 0.7, 0, "rgba(30,25,25,0.5)"); dab(c, x, y, r, r * 0.7, 0, "#8a7a6e"); dab(c, x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.3, 0, "rgba(235,230,225,0.6)"); }
    for (let i = 0; i < 40; i++) { c.strokeStyle = "rgba(60,45,35,0.6)"; c.lineWidth = 1.5; const x = rnd() * 512, y = rnd() * 512; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 10, y + 6, x + 20 + rnd() * 10, y + rnd() * 10); c.stroke(); } });
  // ground: 100 m plane centred at origin, 20.48 px/m; the grave pit is cut out with alpha
  const PX = 20.48; const P = (x: number, z: number): [number, number] => [1024 + x * PX, 1024 + z * PX];
  const gTex = canvasTex(2048, 2048, (c) => {
    c.fillStyle = "#7f8f6a"; c.fillRect(0, 0, 2048, 2048);
    const pal = ["rgba(150,160,120,0.22)", "rgba(90,105,80,0.22)", "rgba(165,160,140,0.15)", "rgba(110,110,125,0.14)", "rgba(185,180,150,0.15)"];
    for (let i = 0; i < 26000; i++) dab(c, rnd() * 2048, rnd() * 2048, 4 + rnd() * 18, 2 + rnd() * 6, rnd() * 3.14, pal[(rnd() * pal.length) | 0]);
    // path from the gate (z = 6.5) downhill, and worn grass inside the plot
    c.strokeStyle = "rgba(150,130,105,0.6)"; c.lineWidth = 46; c.lineCap = "round"; c.beginPath(); const [a0, b0] = P(0.3, 4); c.moveTo(a0, b0); for (let z = 4; z < 50; z += 2) { const [a, b] = P(Math.sin(z * 0.09) * 2.5, z); c.lineTo(a, b); } c.stroke();
    c.strokeStyle = "rgba(175,155,125,0.45)"; c.lineWidth = 20; c.stroke();
    const [cx, cy] = P(0.6, 0); const wear = c.createRadialGradient(cx, cy, 0, cx, cy, 120); wear.addColorStop(0, "rgba(120,100,80,0.55)"); wear.addColorStop(1, "rgba(120,100,80,0)"); c.fillStyle = wear; c.fillRect(cx - 130, cy - 130, 260, 260);
    // trampled earth round the pit + spill from the mound
    for (let i = 0; i < 900; i++) { const x = -2.6 + rnd() * 4.6, z = -2 + rnd() * 4; const [a, b] = P(x, z); dab(c, a, b, 2 + rnd() * 6, 1 + rnd() * 3, rnd() * 3, rnd() < 0.5 ? "rgba(90,70,55,0.4)" : "rgba(120,100,80,0.35)"); }
    for (let i = 0; i < 1600; i++) { const x = rnd() * 2048, y = rnd() * 2048, r = 1.5 + rnd() * 3; dab(c, x, y + 1, r, r * 0.7, 0, "rgba(50,50,50,0.35)"); dab(c, x, y, r, r * 0.7, 0, "#b4ae9e"); dab(c, x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.3, 0, "rgba(255,255,250,0.7)"); }
    for (let i = 0; i < 24000; i++) { const x = rnd() * 2048, y = rnd() * 2048; c.strokeStyle = `hsl(${62 + rnd() * 40}, ${14 + rnd() * 18}%, ${32 + rnd() * 30}%)`; c.lineWidth = 2; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (rnd() - 0.5) * 6, y - 8, x + (rnd() - 0.5) * 10, y - 10 - rnd() * 14); c.stroke();
      if (rnd() < 0.012) { dab(c, x, y - 12, 2.5, 2.5, 0, rnd() < 0.5 ? "#f2efe6" : "#d8c8e8"); } }
    // the pit: dark rim, then cut out
    const [p0, q0] = P(PIT.x0, PIT.z0), [p1, q1] = P(PIT.x1, PIT.z1); c.strokeStyle = "rgba(60,45,38,0.7)"; c.lineWidth = 8; c.strokeRect(p0 - 3, q0 - 3, p1 - p0 + 6, q1 - q0 + 6); c.clearRect(p0, q0, p1 - p0, q1 - q0);
  });
  const ggeo = new THREE.PlaneGeometry(100, 100, 200, 200); ggeo.rotateX(-Math.PI / 2); { const p = ggeo.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i))); ggeo.computeVertexNormals(); }
  const gm = groundMat(gTex, "#e4e6dc", "#6e7088", 0.45, [[150, 150, 165], [200, 202, 205], [240, 240, 236]]); gm.alphaTest = 0.5; gm.transparent = false;
  const ground = new THREE.Mesh(ggeo, gm); g.add(ground);
  // close-up detail patch over the plot (85 px/m): fine grass strokes, trodden earth, the pit cut out; edges fade into the big ground
  const DW = 24, DC = [0.25, -0.5], DPX = 2048 / DW; const Q = (x: number, z: number): [number, number] => [(x - DC[0] + DW / 2) * DPX, (z - DC[1] + DW / 2) * DPX];
  const dTex = canvasTex(2048, 2048, (c) => {
    c.fillStyle = "#7f8f6a"; c.fillRect(0, 0, 2048, 2048);
    for (let i = 0; i < 30000; i++) dab(c, rnd() * 2048, rnd() * 2048, 3 + rnd() * 12, 2 + rnd() * 4, rnd() * 3.14, ["rgba(150,160,120,0.22)", "rgba(90,105,80,0.22)", "rgba(165,160,140,0.15)", "rgba(110,110,125,0.14)"][(rnd() * 4) | 0]);
    // gate path + trampled earth round the grave
    c.lineCap = "round"; for (const [w, col] of [[150, "rgba(140,120,96,0.45)"], [90, "rgba(160,140,112,0.45)"]] as [number, string][]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); const [a0, b0] = Q(0.8, 1.5); c.moveTo(a0, b0); for (let z = 1.5; z < 12; z += 0.5) { const [a, b] = Q(0.8 + (z - 1.5) * 0.04, z); c.lineTo(a, b); } c.stroke(); }
    const [cx, cy] = Q(0.4, 0); const wear = c.createRadialGradient(cx, cy, 0, cx, cy, 300); wear.addColorStop(0, "rgba(112,92,74,0.85)"); wear.addColorStop(0.6, "rgba(120,100,80,0.45)"); wear.addColorStop(1, "rgba(120,100,80,0)"); c.fillStyle = wear; c.beginPath(); c.ellipse(cx, cy, 300, 330, 0, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 5000; i++) { const x = -2.8 + rnd() * 5.6, z = -2.6 + rnd() * 5.2; if (Math.hypot(x - 0.4, z) > 2.9 * (0.6 + rnd() * 0.5)) continue; const [a, b] = Q(x, z); dab(c, a, b, 2 + rnd() * 7, 1 + rnd() * 3, rnd() * 3, ["rgba(80,62,50,0.45)", "rgba(130,110,90,0.4)", "rgba(100,82,68,0.4)"][(rnd() * 3) | 0]); }
    for (let i = 0; i < 260; i++) { const [a, b] = Q(-0.6 - rnd() * 1.8, -1.6 + rnd() * 3.4); const r = 2 + rnd() * 6; dab(c, a, b + 1, r, r * 0.7, 0, "rgba(40,30,28,0.5)"); dab(c, a, b, r, r * 0.7, 0, "#6e5a4c"); dab(c, a - r * 0.3, b - r * 0.3, r * 0.4, r * 0.3, 0, "rgba(200,180,160,0.5)"); } // earth clods
    for (let i = 0; i < 2200; i++) { const x = rnd() * 2048, y = rnd() * 2048, r = 1.5 + rnd() * 3; dab(c, x, y + 1, r, r * 0.7, 0, "rgba(50,50,50,0.35)"); dab(c, x, y, r, r * 0.7, 0, "#b4ae9e"); dab(c, x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.3, 0, "rgba(255,255,250,0.7)"); }
    for (let i = 0; i < 70000; i++) { const x = rnd() * 2048, y = rnd() * 2048; const wx = x / DPX - DW / 2 + DC[0], wz = y / DPX - DW / 2 + DC[1]; const worn = Math.hypot(wx - 0.4, wz) < 2.6 || (wz > 1.5 && Math.abs(wx - 0.9) < 0.45); if (worn && rnd() < 0.85) continue;
      c.strokeStyle = `hsl(${62 + rnd() * 40}, ${14 + rnd() * 18}%, ${30 + rnd() * 32}%)`; c.lineWidth = 1.6 + rnd(); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (rnd() - 0.5) * 5, y - 6, x + (rnd() - 0.5) * 9, y - 8 - rnd() * 12); c.stroke();
      if (rnd() < 0.006) { dab(c, x, y - 10, 2.5, 2.5, 0, rnd() < 0.5 ? "#f2efe6" : "#d8c8e8"); dab(c, x, y - 10, 1, 1, 0, "#e8c860"); } }
    const [p0, q0] = Q(PIT.x0, PIT.z0), [p1, q1] = Q(PIT.x1, PIT.z1); c.strokeStyle = "rgba(55,40,34,0.85)"; c.lineWidth = 14; c.strokeRect(p0 - 5, q0 - 5, p1 - p0 + 10, q1 - q0 + 10); c.clearRect(p0, q0, p1 - p0, q1 - q0);
    // fade the patch edge: keep the pixels, set alpha by a soft border mask
    c.globalCompositeOperation = "destination-in"; const m = c.createRadialGradient(1024, 1024, 700, 1024, 1024, 1024); m.addColorStop(0, "rgba(0,0,0,1)"); m.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = m; c.fillRect(0, 0, 2048, 2048); c.globalCompositeOperation = "source-over";
  });
  const dgeo = new THREE.PlaneGeometry(DW, DW, 96, 96); dgeo.rotateX(-Math.PI / 2); dgeo.translate(DC[0], 0, DC[1]); { const p = dgeo.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i)) + 0.004); dgeo.computeVertexNormals(); }
  const dm = groundMat(dTex, "#e4e6dc", "#6e7088", 0.45, [[150, 150, 165], [200, 202, 205], [240, 240, 236]]); dm.transparent = true; dm.alphaTest = 0.02; dm.polygonOffset = true; dm.polygonOffsetFactor = -2; dm.depthWrite = false;
  const detail = new THREE.Mesh(dgeo, dm); detail.renderOrder = 1; g.add(noShadow(detail));
  const far = new THREE.Mesh(new THREE.CircleGeometry(400, 48), new THREE.MeshBasicMaterial({ color: "#8e9680" })); far.rotation.x = -Math.PI / 2; far.position.y = -6; g.add(noShadow(far));
  // the pit: open-top box seen from inside (earth walls), a little water-dark at the bottom
  const pitM = new THREE.MeshToonMaterial({ map: earthTex(true), side: THREE.BackSide, color: "#c8b8aa", emissive: "#4a3a40", emissiveIntensity: 0.5 });
  const pit = new THREE.Mesh(new THREE.BoxGeometry(PIT.x1 - PIT.x0, PIT.depth, PIT.z1 - PIT.z0), pitM); pit.position.set((PIT.x0 + PIT.x1) / 2, -PIT.depth / 2 + 0.001, (PIT.z0 + PIT.z1) / 2); g.add(pit);
  const shade = new THREE.Mesh(new THREE.PlaneGeometry(PIT.x1 - PIT.x0, PIT.z1 - PIT.z0), new THREE.MeshBasicMaterial({ color: "#1a1418", transparent: true, opacity: 0.55, depthWrite: false })); shade.rotation.x = -Math.PI / 2; shade.position.set(0, -PIT.depth + 0.02, 0); g.add(noShadow(shade));

  // ---------- sky: soft overcast, mottled, low cloud banks ----------
  g.add(paintedSky({ zen: "#8a93aa", mid: "#b2b6c4", hor: "#d9d6d2", below: "#a4a89a", light: new THREE.Vector3(0.3, 0.6, -1), lightCol: "#f4ece0", lightPow: 4, mottle: 1 }));
  const cloudBank = (w: number) => noShadow(new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.3), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, fog: false, toneMapped: false, opacity: 0.9, map: canvasTex(1024, 300, (c) => {
    const lobes: [number, number, number][] = []; for (let i = 0; i < 14; i++) { const u = i / 13; lobes.push([80 + u * 860, 210 - Math.sin(Math.PI * u) * 70 + rnd() * 25, 40 + Math.sin(Math.PI * u) * 55 + rnd() * 30]); }
    c.save(); c.filter = "blur(3px)"; c.beginPath(); for (const [x, y, r] of lobes) { c.moveTo(x + r * 1.5, y); c.ellipse(x, y, r * 1.5, r * 0.75, 0, 0, Math.PI * 2); } c.rect(60, 210, 900, 60); c.clip();
    const gr = c.createLinearGradient(0, 60, 0, 280); gr.addColorStop(0, "#eeece8"); gr.addColorStop(0.45, "#c4c4cc"); gr.addColorStop(1, "#9a9cae"); c.fillStyle = gr; c.fillRect(0, 0, 1024, 300);
    for (const [x, y, r] of lobes) dab(c, x, y + r * 0.45, r * 1.3, r * 0.4, 0, "rgba(120,120,145,0.18)"); c.restore(); }) })));
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2 + rnd() * 0.2; const r = 280 + rnd() * 40; const c = cloudBank(110 + rnd() * 120); c.position.set(Math.sin(a) * r, 20 + rnd() * 60, Math.cos(a) * r); c.lookAt(0, c.position.y * 0.6, 0); g.add(c); }
  // rolling hills in three hazed layers (painted bands on open cylinders)
  const hillBand = (rad: number, top: string, bot: string, amp: number, y: number, freq: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, 60, 96, 1, true), new THREE.MeshBasicMaterial({ side: THREE.BackSide, transparent: true, depthWrite: false, fog: false, map: canvasTex(4096, 256, (c) => {
      const gr = c.createLinearGradient(0, 60, 0, 256); gr.addColorStop(0, top); gr.addColorStop(1, bot); c.fillStyle = gr; c.beginPath(); c.moveTo(0, 256); const ph = rnd() * 10;
      for (let x = 0; x <= 4096; x += 8) c.lineTo(x, 170 - amp * (0.55 + 0.45 * Math.sin(x * 0.0015 * freq + ph)) - amp * 0.3 * Math.sin(x * 0.006 * freq + ph * 2)); c.lineTo(4096, 256); c.fill();
      for (let i = 0; i < 160; i++) { const x = rnd() * 4096; const yy = 170 - amp * (0.55 + 0.45 * Math.sin(x * 0.0015 * freq + ph)) - amp * 0.3 * Math.sin(x * 0.006 * freq + ph * 2); dab(c, x, yy + 4, 6 + rnd() * 10, 5 + rnd() * 6, 0, bot); } }) })); m.position.y = y; return noShadow(m); };
  g.add(hillBand(300, "#b9bec0", "#c8cac6", 70, 8, 1), hillBand(230, "#9aa596", "#aab2a2", 80, 2, 1.6), hillBand(170, "#7d8c6c", "#8e9a7c", 60, -4, 2.3));

  // ---------- materials ----------
  const crossM = [toonO("#8a7f74", { map: wood("#8a7f74", 1), shade: 0.6 }), toonO("#6e665e", { map: wood("#6e665e", 1), shade: 0.6 }), toonO("#a49a8a", { map: wood("#a49a8a", 1), shade: 0.6 }), toonO("#d8d4c8", { map: wood("#d8d4c8", 1), shade: 0.66 })];
  const pine = toonO("#b89a72", { map: wood("#b89a72", 4, 256, 512), shade: 0.62 }); const lining = toonO("#e4dfd2", { shade: 0.7, map: canvasTex(256, 256, (c) => { c.fillStyle = "#e8e2d4"; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 30; i++) { c.strokeStyle = "rgba(150,140,140,0.3)"; c.lineWidth = 3; c.beginPath(); c.moveTo(i * 9, 0); c.bezierCurveTo(i * 9 + 8, 80, i * 9 - 8, 170, i * 9 + 4, 256); c.stroke(); } }) });
  const moundM = toonO("#d4c2b0", { map: earthTex(true), shade: 0.58 }); const oldMoundM = toonO("#7a8466", { shade: 0.6 });

  // ---------- the open grave, earth heap, coffin, shovel, lowering ropes ----------
  const heap = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), moundM); { const p = heap.geometry.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) { const n = 1 + 0.08 * Math.sin(p.getX(i) * 9) * Math.cos(p.getZ(i) * 7) + 0.05 * Math.sin(p.getZ(i) * 17); p.setXYZ(i, p.getX(i) * n, p.getY(i) * n, p.getZ(i) * n); } heap.geometry.computeVertexNormals(); }
  heap.scale.set(0.85, 0.75, 1.5); heap.position.set(-1.55, -0.02, 0.1); ink(heap, 0.02); g.add(heap);
  for (let i = 0; i < 9; i++) { const cl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06 + rnd() * 0.07, 0), moundM); cl.position.set(-0.75 - rnd() * 0.5, 0.03, -1.4 + rnd() * 2.8); cl.rotation.set(rnd(), rnd(), rnd()); ink(cl, 0.008); g.add(cl); }
  const shovel = new THREE.Group(); shovel.add(box(0.035, 1.1, 0.035, toonO("#9a7a58"), 0, 0.55, 0, 0.006)); shovel.add(box(0.14, 0.05, 0.03, toonO("#9a7a58"), 0, 1.1, 0, 0.005)); shovel.add(box(0.24, 0.3, 0.02, toonO("#6a6e78", { rim: 0.4 }), 0, -0.1, 0, 0.006));
  shovel.position.set(-1.6, 0.55, -0.9); shovel.rotation.set(0.15, 0.6, -0.12); g.add(shovel);
  // toe-pincher coffin: 6-sided outline, plank walls, cloth lining, lid propped against the heap side
  const L = 2.0, wS = 0.62, wH = 0.44, wF = 0.32, sh = 0.62; // length, shoulder width, head width, foot width, shoulder from head
  const outline: [number, number][] = [[-wH / 2, -L / 2], [wH / 2, -L / 2], [wS / 2, -L / 2 + sh], [wF / 2, L / 2], [-wF / 2, L / 2], [-wS / 2, -L / 2 + sh]];
  const coffin = new THREE.Group(); const CH = 0.42, T = 0.035;
  const outShape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, z)));
  const bottom = new THREE.Mesh(new THREE.ExtrudeGeometry(outShape, { depth: T, bevelEnabled: false }), pine); bottom.rotation.x = Math.PI / 2; bottom.position.y = T; coffin.add(bottom);
  for (let i = 0; i < 6; i++) { const [x0, z0] = outline[i], [x1, z1] = outline[(i + 1) % 6]; const len = Math.hypot(x1 - x0, z1 - z0); const nx = -(z1 - z0) / len, nz = (x1 - x0) / len; const w = box(len + T, CH, T, pine, (x0 + x1) / 2 - nx * T / 2, CH / 2, (z0 + z1) / 2 - nz * T / 2, 0.01); w.rotation.y = -Math.atan2(z1 - z0, x1 - x0); coffin.add(w); }
  const inner = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x * 0.88, z * 0.95)))), lining); inner.rotation.x = Math.PI / 2; inner.scale.z = -1; inner.position.y = T + 0.015; coffin.add(inner);
  const pillow = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 8), lining); pillow.scale.set(1.1, 0.35, 0.6); pillow.position.set(0, T + 0.06, -L / 2 + 0.2); coffin.add(pillow);
  coffin.position.set(1.4, 0, 0); g.add(coffin);
  const lidG = new THREE.Group(); const lid = new THREE.Mesh(new THREE.ExtrudeGeometry(outShape, { depth: T, bevelEnabled: false }), pine); ink(lid, 0.01); lid.rotation.set(-Math.PI / 2, 0, 0); lid.position.set(0, 0, 0); lidG.rotation.set(0, Math.PI / 2 - 0.15, 0.12); lidG.position.set(1.0, 0.02, -2.5);
  lidG.add(lid); g.add(lidG);
  for (const z of [-0.6, 0.6]) { const rope = cyl(0.014, 0.014, 3.6, toonO("#c8b48c"), 0.05, 0.02, z, 0.004, 6); rope.rotation.z = Math.PI / 2; g.add(rope); }
  // the head marker of the new grave: fresh pale cross
  const cross = (x: number, z: number, h: number, mat: THREE.Material, tilt: number, ry: number, board = false) => { const c = new THREE.Group();
    if (board) { const s = new THREE.Shape(); s.moveTo(-0.2, 0); s.lineTo(-0.2, h - 0.15); s.quadraticCurveTo(0, h + 0.08, 0.2, h - 0.15); s.lineTo(0.2, 0); s.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false }), mat); m.position.z = -0.02; ink(m, 0.012); c.add(m); }
    else { c.add(box(0.08, h, 0.06, mat, 0, h / 2, 0, 0.012)); c.add(box(0.5 + h * 0.1, 0.07, 0.06, mat, 0, h * 0.72, 0.005, 0.012)); }
    c.position.set(x, H(x, z) - 0.05, z); c.rotation.set(tilt * 0.6, ry, tilt); g.add(c); return c; };
  cross(0, -1.55, 1.15, crossM[3], 0.0, 0.0);
  // old graves: rows of mounds with crosses / boards, some leaning, a few stones round the mounds
  const rows = [[-6.5, -5.2], [-6.5, -2.2], [-6.5, 3.2], [3.8, -5.2], [3.8, -2.4], [6.8, -5.2], [6.8, -2.2], [6.8, 2.2], [-3.6, -5.2], [-3.6, 3.4], [0.6, -5.4], [-6.5, 0.6], [6.8, 4.9]];
  for (const [x, z] of rows) { const xx = x + (rnd() - 0.5) * 0.4, zz = z + (rnd() - 0.5) * 0.3; const old = rnd() < 0.7;
    const mnd = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), old ? oldMoundM : moundM); mnd.scale.set(0.5, old ? 0.14 : 0.25, 1.0); mnd.position.set(xx, H(xx, zz + 1.05) - 0.03, zz + 1.05); ink(mnd, 0.012); g.add(mnd);
    for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; if (rnd() < 0.3) continue; const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.07 + rnd() * 0.05, 0), toonO("#a8a6a8")); st.position.set(xx + Math.cos(a) * 0.52, H(xx, zz + 1.05) + 0.02, zz + 1.05 + Math.sin(a) * 1.02); ink(st, 0.006); g.add(st); }
    cross(xx, zz, 0.9 + rnd() * 0.4, crossM[(rnd() * 3) | 0], (rnd() - 0.5) * 0.25, (rnd() - 0.5) * 0.25, rnd() < 0.3); }
  // wild flowers left on a couple of graves
  for (const [x, z] of [[3.8, -1.6], [-6.5, -1.4], [6.8, -4.3]]) for (let k = 0; k < 5; k++) { const st = cyl(0.006, 0.006, 0.25, toonO("#5a6a44"), x + (rnd() - 0.5) * 0.2, H(x, z) + 0.1, z + (rnd() - 0.5) * 0.2, 0, 4); st.rotation.z = 1.3; g.add(st); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), toonO(["#e8e4f0", "#c8a8d8", "#f0d878"][k % 3])); fl.position.set(st.position.x + 0.12, st.position.y + 0.02, st.position.z); g.add(fl); }

  // ---------- picket fence round the plot (merged, ink outline), gate at the front ----------
  const FX0 = -9, FX1 = 9.5, FZ0 = -7.5, FZ1 = 6.5; const fenceM = toonO("#c9c4b8", { map: wood("#c9c4b8", 1), shade: 0.6 });
  const pk = new THREE.Shape(); pk.moveTo(-0.04, 0); pk.lineTo(-0.04, 0.85); pk.lineTo(0, 0.95); pk.lineTo(0.04, 0.85); pk.lineTo(0.04, 0); pk.closePath(); const pkGeo = new THREE.ExtrudeGeometry(pk, { depth: 0.022, bevelEnabled: false }); pkGeo.deleteAttribute("uv"); pkGeo.translate(0, 0, -0.011);
  const geos: THREE.BufferGeometry[] = []; const railGeos: THREE.BufferGeometry[] = []; const posts: [number, number][] = [];
  const side = (ax: number, az: number, bx: number, bz: number, gap?: [number, number]) => { const len = Math.hypot(bx - ax, bz - az); const ang = -Math.atan2(bz - az, bx - ax); const n = Math.floor(len / 0.17);
    for (let i = 0; i <= n; i++) { const u = i / n; const x = ax + (bx - ax) * u, z = az + (bz - az) * u; const along = u * len; if (gap && along > gap[0] && along < gap[1]) continue; if (rnd() < 0.04) continue;
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, H(x, z) - 0.05, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd() - 0.5) * 0.08, ang, (rnd() - 0.5) * 0.1)), new THREE.Vector3(1, 0.9 + rnd() * 0.15, 1)); geos.push(pkGeo.clone().applyMatrix4(m)); }
    const segs = Math.ceil(len / 2.4); for (let s = 0; s < segs; s++) { const u0 = s / segs, u1 = (s + 1) / segs; const x0 = ax + (bx - ax) * u0, z0 = az + (bz - az) * u0, x1 = ax + (bx - ax) * u1, z1 = az + (bz - az) * u1; posts.push([x0, z0]);
      if (gap && ((u0 * len > gap[0] - 0.1 && u0 * len < gap[1]) || (u1 * len > gap[0] && u1 * len < gap[1] + 0.1))) continue;
      for (const y of [0.25, 0.68]) { const rg = new THREE.BoxGeometry(Math.hypot(x1 - x0, z1 - z0), 0.07, 0.035); rg.deleteAttribute("uv"); const y0 = H(x0, z0), y1 = H(x1, z1); rg.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2 + y, (z0 + z1) / 2 - 0.03 * Math.cos(ang)), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ang, Math.atan2(y1 - y0, Math.hypot(x1 - x0, z1 - z0)))), new THREE.Vector3(1, 1, 1))); railGeos.push(rg); } } };
  side(FX0, FZ0, FX1, FZ0); side(FX1, FZ0, FX1, FZ1); side(FX1, FZ1, FX0, FZ1, [8.3, 10.2]); side(FX0, FZ1, FX0, FZ0);
  const fenceMesh = new THREE.Mesh(mergeGeometries(geos), fenceM); ink(fenceMesh, 0.008); g.add(fenceMesh); const rails = new THREE.Mesh(mergeGeometries(railGeos), fenceM); ink(rails, 0.008); g.add(rails);
  for (const [x, z] of posts) g.add(box(0.1, 1.05, 0.1, fenceM, x, H(x, z) + 0.45, z, 0.01));
  // gate: two taller posts, one leaf swung open
  const gx0 = 9.5 - 8.3, gx1 = 9.5 - 10.2; for (const x of [gx0, gx1]) g.add(box(0.14, 1.4, 0.14, fenceM, x, H(x, FZ1) + 0.62, FZ1, 0.012));
  const leaf = new THREE.Group(); for (let i = 0; i < 10; i++) leaf.add(box(0.08, 0.85, 0.022, fenceM, 0.1 + i * 0.17, 0.48, 0, 0.006)); for (const y of [0.25, 0.68]) leaf.add(box(1.75, 0.07, 0.035, fenceM, 0.87, y, -0.03, 0.006));
  leaf.position.set(gx1, H(gx1, FZ1), FZ1); leaf.rotation.y = -1.2; g.add(leaf);

  // ---------- the lone oak behind the plot ----------
  const oak = new THREE.Group(); const bark = toonO("#d2c6ba", { shade: 0.55, map: canvasTex(128, 256, (c) => { c.fillStyle = "#5e5048"; c.fillRect(0, 0, 128, 256); for (let i = 0; i < 90; i++) { c.strokeStyle = rnd() < 0.5 ? "rgba(30,25,25,0.5)" : "rgba(150,140,130,0.3)"; c.lineWidth = 1 + rnd() * 2; const x = rnd() * 128; c.beginPath(); c.moveTo(x, rnd() * 256); c.lineTo(x + (rnd() - 0.5) * 6, rnd() * 256); c.stroke(); } }) });
  const limb = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number) => { const d = b.clone().sub(a); const m = cyl(r1, r0, d.length(), bark, 0, 0, 0, 0.02, 10); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); oak.add(m); };
  const T0 = new THREE.Vector3(0, 0, 0), T1 = new THREE.Vector3(0.2, 3.2, 0); limb(T0, T1, 0.42, 0.3);
  const leafTex = canvasTex(256, 256, (c) => { c.fillStyle = "#c8d0b8"; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 900; i++) dab(c, rnd() * 256, rnd() * 256, 5 + rnd() * 5, 3 + rnd() * 2, rnd() * 3, ["rgba(90,110,80,0.3)", "rgba(240,245,220,0.35)", "rgba(150,170,130,0.3)"][(rnd() * 3) | 0]); }, [3, 2]);
  const leafM = ["#7a8c68", "#8a9a72", "#6e8064"].map((c) => toonO(c, { shade: 0.5, rim: 0.12, map: leafTex }));
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + rnd() * 0.5; const end = new THREE.Vector3(Math.cos(a) * (2.4 + rnd() * 1.4), 5 + rnd() * 2.2, Math.sin(a) * (2.4 + rnd() * 1.4)); limb(T1, end, 0.26, 0.1); if (i === 2) continue; // one bare limb
    for (let k = 0; k < 3; k++) { const geo = new THREE.SphereGeometry(1.2 + rnd() * 0.8, 28, 18); const p = geo.getAttribute("position") as THREE.BufferAttribute; for (let v = 0; v < p.count; v++) { const n = 1 + 0.12 * Math.sin(p.getX(v) * 4 + k) * Math.sin(p.getY(v) * 5) * Math.sin(p.getZ(v) * 3 + i); p.setXYZ(v, p.getX(v) * n, p.getY(v) * n * 0.75, p.getZ(v) * n); } geo.computeVertexNormals();
      const cl = new THREE.Mesh(geo, leafM[(rnd() * 3) | 0]); cl.position.copy(end).add(new THREE.Vector3((rnd() - 0.5) * 1.6, (rnd() - 0.2) * 1.0, (rnd() - 0.5) * 1.6)); ink(cl, 0.035); oak.add(cl); } }
  const crown = new THREE.Mesh(new THREE.SphereGeometry(2.2, 28, 18), leafM[1]); crown.scale.set(1, 0.7, 1); crown.position.set(0.3, 7.6, 0); ink(crown, 0.035); oak.add(crown);
  oak.position.set(-5.6, H(-5.6, -9.6) - 0.1, -9.6); oak.rotation.y = 0.4; g.add(oak);
  // fallen leaves under the oak
  // a few shrubs + distant tree billboards along the slope
  const bushTex = canvasTex(256, 256, (c) => { for (const pass of [0, 1, 2]) for (let k = 0; k < 400; k++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 100; const x = 128 + Math.cos(a) * d * 1.1, y = 150 + Math.sin(a) * d * 0.8; const top = (150 - y) / 100;
    if (pass === 0) dab(c, x, y + 6, 9, 6, a, "#4a5848"); if (pass === 1 && top > -0.3) dab(c, x, y, 8, 5, a, "#6f8060"); if (pass === 2 && top > 0.35 && rnd() < 0.5) dab(c, x, y, 6, 4, a, "#a4ae88"); } });
  const bm = new THREE.SpriteMaterial({ map: bushTex, transparent: true, alphaTest: 0.3, toneMapped: false });
  for (let i = 0; i < 90; i++) { const a = rnd() * Math.PI * 2, d = 16 + rnd() * 34; const x = Math.sin(a) * d, z = Math.cos(a) * d; if (z > 6 && Math.abs(x - Math.sin(z * 0.09) * 2.5) < 4) continue; const s = new THREE.Sprite(bm); const sc = d > 30 ? 5 + rnd() * 6 : 1.4 + rnd() * 1.8; s.scale.set(sc, sc * 0.8, 1); s.position.set(x, H(x, z) + sc * 0.36, z); g.add(s); }
  // grass tufts (merged) outside the trodden ground
  const gt = grassTex("#3c4636", "#71805c", ["#b0b48c", "#9aa47c", "#c8c4a4"], rnd, ["#eeeae0", "#d4c4e0"]);
  const spots: [number, number, number][] = []; for (let i = 0; i < 1500; i++) { const x = (rnd() - 0.5) * 50, z = (rnd() - 0.5) * 50; if (Math.hypot(x - 0.6, z) < 4.2) continue; if (z > 5 && Math.abs(x - Math.sin(z * 0.09) * 2.5) < 1.2) continue; spots.push([x, z, 0.25 + rnd() * 0.4]); }
  const grass = grassField(gt, spots, rnd); { const p = grass.mesh.geometry.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < p.count; i += 4) { const cx = (p.getX(i) + p.getX(i + 1)) / 2, cz = (p.getZ(i) + p.getZ(i + 1)) / 2; const y = H(cx, cz); for (let k = 0; k < 4; k++) p.setY(i + k, p.getY(i + k) + y); } } g.add(grass.mesh);
  // a couple of crows on the fence rail
  const crowM = toonO("#2a2a34", { shade: 0.6, rim: 0.3 }); const crows: THREE.Group[] = [];
  for (const [x, z] of [[FX1, -1.5], [FX1, 0.2]] as [number, number][]) { const c = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), crowM); b.scale.set(1, 0.85, 1.6); c.add(b); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), crowM); hd.position.set(0, 0.08, 0.12); c.add(hd);
    const bk = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.07, 6), toonO("#3a3a40")); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.075, 0.2); c.add(bk); const tl = box(0.09, 0.02, 0.14, crowM, 0, -0.02, -0.17, 0.004); tl.rotation.x = -0.4; c.add(tl); for (const m of [b, hd]) ink(m, 0.006);
    c.position.set(x, H(x, z) + 0.73 + 0.07, z); c.rotation.y = -Math.PI / 2 + (rnd() - 0.5); g.add(c); crows.push(c); }

  // ---------- lights: big soft overcast sky, a weak high key for gentle shadows ----------
  g.add(new THREE.HemisphereLight("#e4e6f0", "#7a7a66", 1.5));
  const key = keyLight("#fff2e2", 0.95, new THREE.Vector3(0.35, 1, 0.25), 22); g.add(key, key.target);
  const fill = new THREE.DirectionalLight("#c8d0ff", 0.35); fill.position.set(-10, 6, 12); g.add(fill);
  const fog = new THREE.Fog("#c6c8cc", 35, 230);
  const mournX = 2.75;
  return {
    group: g, fog,
    update: (t) => { grass.setT(t); crows.forEach((c, i) => { c.children[1].rotation.y = Math.sin(t * 1.3 + i * 2) > 0.6 ? 0.6 : Math.sin(t * 0.5 + i) * 0.15; }); },
    cams: {
      main: { pos: [8.5, 3.3, 15], look: [-0.4, 0.9, -1.2], fov: 42 },
      overhead: { pos: [1.4, 5.6, 0.45], look: [1.4, 0, 0.0], fov: 38 },
      mourners: { pos: [-3.0, 1.75, 5.6], look: [mournX - 0.3, 1.2, -0.4], fov: 40 },
    },
    marks: { coffin: [1.4, 0, 0], mourner1: [mournX, 0, -1.55], mourner2: [mournX + 0.2, 0, -0.5], mourner3: [mournX + 0.15, 0, 0.55], mourner4: [mournX, 0, 1.6], kid: [mournX - 0.55, 0, 2.45] },
  };
};
