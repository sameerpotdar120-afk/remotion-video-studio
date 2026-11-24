// College campus, decades later (sunny late morning). A Georgian red-brick hall with white trim, portico and cupola,
// a mown lawn with a pale path up to the steps, a big old shade tree, lamp posts, benches, hedges and flower beds.
// Hall front faces +Z, its steps end at z = -12; the two men meet on the path near the origin.
import * as THREE from "three";
import type { BuiltSet } from "./types";
import { canvasTex, dab } from "../farm";
import { mkRnd, toonD, noShadow, cyl, paintedSky, grassTex, grassField, groundMat, keyLight, ink, box } from "./h2kit";

export const buildCampus = (): BuiltSet => {
  const rnd = mkRnd(2024); const g = new THREE.Group();
  // ---------- painted textures ----------
  const brickImg = canvasTex(512, 512, (c) => { c.fillStyle = "#e6dccc"; c.fillRect(0, 0, 512, 512); const rows = 8, bh = 512 / rows, bw = 128;
    for (let r = 0; r < rows; r++) for (let k = -1; k < 5; k++) { const x = k * bw + (r % 2) * bw / 2 + 3, y = r * bh + 3, w = bw - 6, h = bh - 6; const l = 34 + rnd() * 12, hue = 8 + rnd() * 10;
      const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, `hsl(${hue}, 48%, ${l + 8}%)`); gr.addColorStop(1, `hsl(${hue + 345}, 40%, ${l - 4}%)`); c.fillStyle = gr; c.beginPath(); c.roundRect(x, y, w, h, 4); c.fill();
      for (let i = 0; i < 6; i++) dab(c, x + rnd() * w, y + rnd() * h, 4 + rnd() * 10, 2 + rnd() * 4, 0, rnd() < 0.5 ? "rgba(90,30,25,0.18)" : "rgba(255,200,170,0.16)"); c.fillStyle = "rgba(255,225,200,0.3)"; c.fillRect(x + 2, y + 1, w - 4, 3); }
    for (let i = 0; i < 40; i++) dab(c, rnd() * 512, rnd() * 512, 20 + rnd() * 50, 10 + rnd() * 30, 0, "rgba(120,90,80,0.06)"); });
  brickImg.wrapS = brickImg.wrapT = THREE.RepeatWrapping; const brickMats = new Map<string, THREE.Material>();
  const brick = (_w: number, _h: number, col = "#f4e8e0") => { let m = brickMats.get(col); if (!m) { m = toonD(col, { map: brickImg, shade: 0.62 }); brickMats.set(col, m); } return m; };
  // brick boxes get their UVs in metres (one texture tile = 1.2 m), so the courses keep real size on every face
  const BT = 1.2; const brickBox = (w: number, h: number, d: number, col: string | undefined, x: number, y: number, z: number, iw: number) => { const m = box(w, h, d, brick(w, h, col), x, y, z, iw);
    const uv = m.geometry.getAttribute("uv") as THREE.BufferAttribute; const dims: [number, number][] = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / BT, uv.getY(i) * dims[f][1] / BT); } return m; };
  const winTex = canvasTex(256, 384, (c) => { // white 6-over-6 sash, glass reflecting the sky, warm interior hint, diagonal glint
    const gr = c.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, "#9cc4e8"); gr.addColorStop(0.45, "#5a7ea8"); gr.addColorStop(0.55, "#3e4e6e"); gr.addColorStop(1, "#5a5060"); c.fillStyle = gr; c.fillRect(0, 0, 256, 384);
    c.fillStyle = "rgba(255,220,170,0.25)"; c.fillRect(30, 230, 90, 120); c.strokeStyle = "rgba(255,255,255,0.35)"; c.lineWidth = 26; c.beginPath(); c.moveTo(-20, 160); c.lineTo(160, -20); c.stroke(); c.lineWidth = 10; c.beginPath(); c.moveTo(60, 380); c.lineTo(260, 180); c.stroke();
    c.fillStyle = "#f6f4ee"; c.fillRect(0, 0, 256, 16); c.fillRect(0, 368, 256, 16); c.fillRect(0, 0, 16, 384); c.fillRect(240, 0, 16, 384); c.fillRect(0, 184, 256, 18);
    for (const x of [85, 165]) c.fillRect(x, 0, 8, 384); for (const y of [92, 284]) c.fillRect(0, y, 256, 8); c.fillStyle = "rgba(60,60,80,0.35)"; c.fillRect(0, 202, 256, 4); });
  const slate = canvasTex(512, 512, (c) => { c.fillStyle = "#4a5060"; c.fillRect(0, 0, 512, 512); for (let r = 0; r < 16; r++) for (let k = 0; k < 11; k++) { const x = k * 48 + (r % 2) * 24 - 24, y = r * 32, l = 30 + rnd() * 10;
    const gr = c.createLinearGradient(0, y, 0, y + 30); gr.addColorStop(0, `hsl(220, 12%, ${l + 10}%)`); gr.addColorStop(1, `hsl(240, 14%, ${l - 4}%)`); c.fillStyle = gr; c.fillRect(x + 1, y + 1, 46, 30); c.fillStyle = "rgba(200,215,240,0.25)"; c.fillRect(x + 2, y + 2, 44, 2); } }, [6, 2]);

  // ---------- materials ----------
  const white = toonD("#f4f1e8", { shade: 0.72, rim: 0.12 }); const stone = toonD("#e4ddd0", { shade: 0.7 }); const doorM = toonD("#2e5a46", { shade: 0.6 }); const ironM = toonD("#262a30", { shade: 0.6, rim: 0.4 });
  const glassM = new THREE.MeshBasicMaterial({ map: winTex });

  // ---------- the hall ----------
  const hall = new THREE.Group(); const W = 34, D = 14, FL = 3.9, NF = 3, HH = FL * NF + 0.8, ZF = -12 - 3.2; // front wall plane z = ZF
  hall.add(brickBox(W, HH, D, undefined, 0, HH / 2, ZF - D / 2, 0.03));
  hall.add(box(W + 0.3, 0.7, D + 0.3, stone, 0, 0.35, ZF - D / 2, 0.02));                                     // stone plinth
  for (let f = 1; f < NF; f++) hall.add(box(W + 0.12, 0.22, D + 0.12, white, 0, f * FL + 0.5, ZF - D / 2, 0.012)); // belt courses
  hall.add(box(W + 0.7, 0.55, D + 0.7, white, 0, HH + 0.1, ZF - D / 2, 0.02)); hall.add(box(W + 0.95, 0.16, D + 0.95, white, 0, HH + 0.43, ZF - D / 2, 0.015)); // cornice
  for (const sx of [-1, 1]) for (let q = 0; q < 14; q++) hall.add(box(q % 2 ? 0.55 : 0.8, 0.42, 0.06, white, sx * (W / 2 - (q % 2 ? 0.27 : 0.4)), 0.9 + q * 0.9, ZF + 0.03, 0.006)); // quoins
  // windows: 3 floors x 4 bays each side of the centre block, white lintels with keystones + sills
  const winAt = (x: number, y: number, w: number, h: number, z: number) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassM); p.position.set(x, y, z + 0.02); hall.add(p);
    hall.add(box(w + 0.32, 0.26, 0.14, white, x, y + h / 2 + 0.13, z + 0.05, 0.008)); hall.add(box(0.26, 0.34, 0.16, white, x, y + h / 2 + 0.15, z + 0.08, 0.006)); hall.add(box(w + 0.24, 0.1, 0.22, white, x, y - h / 2 - 0.05, z + 0.08, 0.008));
    for (const s of [-1, 1]) hall.add(box(0.08, h + 0.08, 0.1, white, x + s * (w / 2 + 0.02), y, z + 0.04, 0)); };
  const bays = [-14.2, -10.9, -7.6, 7.6, 10.9, 14.2];
  for (let f = 0; f < NF; f++) for (const x of bays) winAt(x, 0.7 + f * FL + 1.85, 1.35, f === 0 ? 2.3 : 2.1, ZF);
  // centre block: projects 1.2 m, pediment, portico of four columns, double door with fanlight
  const CW = 11, CP = 1.2; hall.add(brickBox(CW, HH, CP, undefined, 0, HH / 2, ZF + CP / 2, 0.03));
  for (let f = 1; f < NF; f++) hall.add(box(CW + 0.12, 0.22, CP + 0.12, white, 0, f * FL + 0.5, ZF + CP / 2, 0.012));
  hall.add(box(CW + 0.7, 0.55, CP + 0.7, white, 0, HH + 0.1, ZF + CP / 2, 0.02));
  for (let f = 1; f < NF; f++) for (const x of [-3.4, 0, 3.4]) winAt(x, 0.7 + f * FL + 1.85, 1.35, 2.1, ZF + CP);
  const ped = new THREE.Shape([new THREE.Vector2(-CW / 2 - 0.35, 0), new THREE.Vector2(CW / 2 + 0.35, 0), new THREE.Vector2(0, 2.6)]); const pm = new THREE.Mesh(new THREE.ExtrudeGeometry(ped, { depth: 0.6, bevelEnabled: false }), white); pm.position.set(0, HH + 0.38, ZF + CP - 0.45); ink(pm, 0.02); hall.add(pm);
  const tym = new THREE.Shape([new THREE.Vector2(-CW / 2 + 0.4, 0), new THREE.Vector2(CW / 2 - 0.4, 0), new THREE.Vector2(0, 1.95)]); const tm = new THREE.Mesh(new THREE.ShapeGeometry(tym), toonD("#e8e2d4", { shade: 0.65 })); tm.position.set(0, HH + 0.6, ZF + CP + 0.17); hall.add(tm);
  const oc = new THREE.Mesh(new THREE.CircleGeometry(0.55, 32), new THREE.MeshBasicMaterial({ map: winTex })); oc.position.set(0, HH + 1.25, ZF + CP + 0.19); hall.add(oc); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.07, 6, 32), white); ring.position.copy(oc.position); ink(ring, 0.008); hall.add(ring);
  // portico
  const PD = 3.2, PZ = ZF + CP; const colH = FL + 1.0;
  for (const x of [-3.3, -1.1, 1.1, 3.3]) { const c = cyl(0.26, 0.3, colH, white, x, 1.2 + colH / 2, PZ + PD - 0.4, 0.014, 20); hall.add(c); hall.add(box(0.75, 0.22, 0.75, white, x, 1.31 + 0.0, PZ + PD - 0.4, 0.008)); hall.add(box(0.72, 0.2, 0.72, white, x, 1.2 + colH - 0.1, PZ + PD - 0.4, 0.008)); }
  hall.add(box(7.8, 0.7, PD + 0.2, white, 0, 1.2 + colH + 0.35, PZ + PD / 2 - 0.1, 0.02));
  const pped = new THREE.Shape([new THREE.Vector2(-4.1, 0), new THREE.Vector2(4.1, 0), new THREE.Vector2(0, 1.7)]); const ppm = new THREE.Mesh(new THREE.ExtrudeGeometry(pped, { depth: PD + 0.2, bevelEnabled: false }), white); ppm.position.set(0, 1.2 + colH + 0.7, PZ - 0.2); ink(ppm, 0.02); hall.add(ppm);
  hall.add(box(8.2, 0.12, PD + 0.3, toonD("#5a6070", { map: slate }), 0, 1.2 + colH + 0.75, PZ + PD / 2 - 0.1, 0)); // soffit line
  hall.add(box(8.4, 1.2, PD + 0.6, stone, 0, 0.6, PZ + PD / 2, 0.02)); // porch platform
  for (let i = 0; i < 4; i++) hall.add(box(6.4, 0.3, 0.4, stone, 0, 0.15 + i * 0.3 - 0.0, PZ + PD + 0.3 + (3 - i) * 0.4 - 0.1, 0.012)); // steps down to the lawn (front edge at z ~ -12)
  hall.add(box(2.4, 3.0, 0.12, doorM, 0, 1.2 + 1.5, PZ + 0.06, 0.012)); hall.add(box(0.05, 3.0, 0.16, toonD("#1e3a2e"), 0, 2.7, PZ + 0.08, 0)); for (const s of [-1, 1]) for (const y of [2.0, 3.3]) hall.add(box(0.9, 0.9, 0.04, toonD("#3a6a54", { shade: 0.6 }), s * 0.6, y, PZ + 0.13, 0.006));
  const fan = new THREE.Mesh(new THREE.CircleGeometry(1.2, 32, 0, Math.PI), new THREE.MeshBasicMaterial({ map: winTex })); fan.position.set(0, 4.25, PZ + 0.07); hall.add(fan); const fr = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.1, 6, 24, Math.PI), white); fr.position.copy(fan.position); fr.position.z += 0.04; ink(fr, 0.008); hall.add(fr);
  for (const s of [-1, 1]) { const l = new THREE.Group(); l.add(box(0.28, 0.4, 0.28, new THREE.MeshBasicMaterial({ color: "#fff2d0", toneMapped: false }), 0, 0, 0, 0.006)); l.add(box(0.36, 0.06, 0.36, ironM, 0, 0.23, 0, 0.004)); l.position.set(s * 1.8, 3.2, PZ + 0.3); hall.add(l); }
  // roof: hipped slate + cupola with clock and a plain weathervane, brick chimneys at the ends
  const roofM = toonD("#6a7284", { map: slate, shade: 0.6 }); const rH = 3.6;
  const roofGeo = new THREE.BufferGeometry(); { const x0 = W / 2 + 0.35, z0 = D / 2 + 0.35, rx = W / 2 - D / 2; const v = [[-x0, 0, -z0], [x0, 0, -z0], [x0, 0, z0], [-x0, 0, z0], [-rx, rH, 0], [rx, rH, 0]];
    const tri = [[3, 2, 5], [3, 5, 4], [1, 0, 4], [1, 4, 5], [2, 1, 5], [0, 3, 4]]; const pos: number[] = [], uv: number[] = []; for (const t of tri) for (const i of t) { pos.push(...v[i]); uv.push(v[i][0] / 4, (v[i][1] + Math.abs(v[i][2])) / 4); }
    roofGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); roofGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); roofGeo.computeVertexNormals(); }
  const roof = new THREE.Mesh(roofGeo, roofM); roof.position.set(0, HH + 0.5, ZF - D / 2); ink(roof, 0.03); hall.add(roof);
  for (const sx of [-1, 1]) { hall.add(brickBox(1.4, 3.4, 1.0, undefined, sx * (W / 2 - 2.5), HH + 2.6, ZF - D / 2 - 2.5, 0.015)); hall.add(box(1.6, 0.2, 1.2, white, sx * (W / 2 - 2.5), HH + 4.35, ZF - D / 2 - 2.5, 0.01)); }
  const cup = new THREE.Group(); cup.position.set(0, HH + 0.5 + rH - 0.3, ZF - D / 2);
  cup.add(box(3.2, 1.6, 3.2, white, 0, 0.8, 0, 0.02)); cup.add(cyl(1.25, 1.25, 2.4, white, 0, 2.8, 0, 0.018, 8)); cup.add(box(3.0, 0.3, 3.0, white, 0, 1.75, 0, 0.012)); cup.add(cyl(1.5, 1.5, 0.3, white, 0, 4.1, 0, 0.014, 8));
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + Math.PI / 8; const op = box(0.5, 1.6, 0.06, toonD("#2a3040"), Math.sin(a) * 1.2, 2.75, Math.cos(a) * 1.2, 0); op.rotation.y = a; cup.add(op); }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.35, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toonD("#6f9a8a", { shade: 0.6, rim: 0.2 })); dome.position.y = 4.25; dome.scale.y = 1.2; ink(dome, 0.016); cup.add(dome); // weathered copper
  cup.add(cyl(0.04, 0.04, 2.0, ironM, 0, 6.6, 0, 0.004, 6)); const arrow = box(1.2, 0.06, 0.04, ironM, 0, 7.2, 0, 0.004); arrow.rotation.y = 0.7; cup.add(arrow); const tail = box(0.3, 0.3, 0.03, ironM, -0.45, 7.2, 0, 0.004); arrow.add(tail); tail.position.set(-0.6, 0, 0); tail.rotation.z = Math.PI / 4;
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.62, 40), new THREE.MeshBasicMaterial({ map: canvasTex(256, 256, (c) => { c.fillStyle = "#f8f4e8"; c.beginPath(); c.arc(128, 128, 126, 0, Math.PI * 2); c.fill(); c.strokeStyle = "#1e1e24"; c.lineWidth = 8; c.stroke();
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; c.lineWidth = k % 3 ? 4 : 9; c.beginPath(); c.moveTo(128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); c.lineTo(128 + Math.sin(a) * 114, 128 - Math.cos(a) * 114); c.stroke(); }
    c.lineCap = "round"; c.lineWidth = 9; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + 50 * Math.sin(-0.5), 128 - 50 * Math.cos(-0.5)); c.stroke(); c.lineWidth = 6; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + 85 * Math.sin(1.57 * 0.0), 128 - 85); c.stroke(); }) }));
  clock.position.set(0, 0.8, 1.62); cup.add(clock); hall.add(cup);
  g.add(hall);
  // side wings of neighbouring halls (simpler), angled in at the edges of the quad
  for (const s of [-1, 1]) { const wg = new THREE.Group(); const w = 24, h = 2 * FL + 0.8; wg.add(brickBox(w, h, 12, "#ead8cc", 0, h / 2, 0, 0.03)); wg.add(box(w + 0.6, 0.5, 12.6, white, 0, h + 0.1, 0, 0.02));
    const r2 = new THREE.Mesh(roofGeo, roofM); r2.scale.set(w / W, 0.7, 12 / D); r2.position.y = h + 0.35; ink(r2, 0.03); wg.add(r2);
    for (let f = 0; f < 2; f++) for (let k = 0; k < 6; k++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.1), glassM); p.position.set(-w / 2 + 2.2 + k * 3.9, 2.4 + f * FL, 6.02); wg.add(p); wg.add(box(1.6, 0.22, 0.12, white, p.position.x, p.position.y + 1.18, 6.06, 0.006)); wg.add(box(1.5, 0.1, 0.2, white, p.position.x, p.position.y - 1.1, 6.08, 0.006)); }
    wg.position.set(s * 36, 0, -6); wg.rotation.y = -s * 1.15; g.add(wg); }

  // ---------- ground: striped lawn, pale path with brick edging, flower beds ----------
  const GS = 140, PX = 2048 / GS; const P = (x: number, z: number): [number, number] => [(x + GS / 2) * PX, (z + GS / 2) * PX];
  const pathX = (z: number) => (z > 6 ? Math.sin((z - 6) * 0.08) * 3 : 0);
  const lawnTex = canvasTex(2048, 2048, (c) => {
    c.fillStyle = "#6fa04a"; c.fillRect(0, 0, 2048, 2048);
    for (let i = 0; i < 24; i++) { const [x0] = P(-GS / 2 + i * 6, 0); c.fillStyle = i % 2 ? "rgba(255,255,200,0.07)" : "rgba(20,60,20,0.06)"; c.fillRect(x0, 0, 6 * PX, 2048); } // mowing stripes
    for (let i = 0; i < 26000; i++) dab(c, rnd() * 2048, rnd() * 2048, 3 + rnd() * 14, 2 + rnd() * 5, rnd() * 3, ["rgba(150,200,90,0.2)", "rgba(60,110,50,0.18)", "rgba(200,220,120,0.14)", "rgba(90,140,110,0.12)"][(rnd() * 4) | 0]);
    for (let i = 0; i < 20000; i++) { const x = rnd() * 2048, y = rnd() * 2048; c.strokeStyle = `hsl(${85 + rnd() * 30}, ${40 + rnd() * 20}%, ${32 + rnd() * 28}%)`; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 4, y - 5 - rnd() * 6); c.stroke(); }
    // path (3 m wide) + cross path in front of the steps
    const stroke = (pts: [number, number][], w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w * PX; c.lineCap = "butt"; c.lineJoin = "round"; c.beginPath(); pts.forEach(([x, z], i) => { const [a, b] = P(x, z); if (i) c.lineTo(a, b); else c.moveTo(a, b); }); c.stroke(); };
    const main: [number, number][] = []; for (let z = -12.2; z < 70; z += 1) main.push([pathX(z), z]);
    stroke(main, 3.4, "#a8584a"); stroke(main, 3.0, "#e6dccb"); stroke([[-30, -10.5], [30, -10.5]], 3.4, "#a8584a"); stroke([[-30, -10.5], [30, -10.5]], 3.0, "#e6dccb");
    for (let i = 0; i < 9000; i++) { const z = -12 + rnd() * 80, x = pathX(z) + (rnd() - 0.5) * 2.9; const [a, b] = P(x, z); dab(c, a, b, 1 + rnd() * 2, 0.8 + rnd(), rnd() * 3, rnd() < 0.5 ? "rgba(170,160,150,0.5)" : "rgba(255,250,240,0.5)"); }
    for (let i = 0; i < 5000; i++) { const x = (rnd() - 0.5) * 60, z = -10.5 + (rnd() - 0.5) * 2.9; const [a, b] = P(x, z); dab(c, a, b, 1 + rnd() * 2, 0.8 + rnd(), rnd() * 3, rnd() < 0.5 ? "rgba(170,160,150,0.5)" : "rgba(255,250,240,0.5)"); }
    // flower beds along the hall front
    for (const s of [-1, 1]) { const [a, b] = P(s * 11, -14.6); c.fillStyle = "#6a4a3a"; c.beginPath(); c.roundRect(a - 7 * PX, b - 0.9 * PX, 14 * PX, 1.8 * PX, 8); c.fill(); }
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(GS, GS), groundMat(lawnTex, "#f2f6e8", "#5a6aa0", 0.3, [[160, 165, 200], [215, 220, 225], [255, 252, 245]])); ground.rotation.x = -Math.PI / 2; g.add(ground);
  const far = new THREE.Mesh(new THREE.CircleGeometry(400, 48), new THREE.MeshBasicMaterial({ color: "#86a86a" })); far.rotation.x = -Math.PI / 2; far.position.y = -0.05; g.add(noShadow(far));
  // close-up detail around the meeting spot (fine path gravel + grass edge)
  const DW = 14, DPX = 2048 / DW; const dTex = canvasTex(2048, 2048, (c) => { c.fillStyle = "#6fa04a"; c.fillRect(0, 0, 2048, 2048);
    for (let i = 0; i < 26000; i++) dab(c, rnd() * 2048, rnd() * 2048, 3 + rnd() * 10, 2 + rnd() * 4, rnd() * 3, ["rgba(150,200,90,0.2)", "rgba(60,110,50,0.18)", "rgba(200,220,120,0.14)"][(rnd() * 3) | 0]);
    for (let i = 0; i < 60000; i++) { const x = rnd() * 2048, y = rnd() * 2048; c.strokeStyle = `hsl(${85 + rnd() * 30}, ${40 + rnd() * 20}%, ${30 + rnd() * 32}%)`; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (rnd() - 0.5) * 6, y - 8, x + (rnd() - 0.5) * 10, y - 10 - rnd() * 14); c.stroke(); }
    const cx = 1024, hw = 1.5 * DPX; c.fillStyle = "#a8584a"; c.fillRect(cx - hw - 0.2 * DPX, 0, 2 * hw + 0.4 * DPX, 2048); c.fillStyle = "#e2d8c6"; c.fillRect(cx - hw, 0, 2 * hw, 2048);
    for (let k = 0; k < 2048 / (0.23 * DPX); k++) for (const s of [-1, 1]) { const y = k * 0.23 * DPX; c.fillStyle = `hsl(${8 + rnd() * 8}, 45%, ${34 + rnd() * 10}%)`; c.fillRect(cx + s * (hw + 0.1 * DPX) - 0.09 * DPX, y + 2, 0.18 * DPX, 0.21 * DPX); }
    for (let i = 0; i < 26000; i++) { const x = cx + (rnd() - 0.5) * 2 * hw, y = rnd() * 2048, r = 1.5 + rnd() * 3; dab(c, x, y + 1, r, r * 0.7, 0, "rgba(110,100,95,0.35)"); dab(c, x, y, r, r * 0.7, 0, rnd() < 0.5 ? "#efe7d8" : "#d4c8b6"); }
    c.globalCompositeOperation = "destination-in"; const m = c.createRadialGradient(1024, 1024, 650, 1024, 1024, 1024); m.addColorStop(0, "rgba(0,0,0,1)"); m.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = m; c.fillRect(0, 0, 2048, 2048); c.globalCompositeOperation = "source-over"; });
  const dm = groundMat(dTex, "#f2f6e8", "#5a6aa0", 0.3, [[160, 165, 200], [215, 220, 225], [255, 252, 245]]); dm.transparent = true; dm.depthWrite = false; dm.polygonOffset = true; dm.polygonOffsetFactor = -2;
  const detail = new THREE.Mesh(new THREE.PlaneGeometry(DW, DW), dm); detail.rotation.x = -Math.PI / 2; detail.position.set(0, 0.003, 0); detail.renderOrder = 1; g.add(noShadow(detail));

  // ---------- the big tree: a broad old elm shading the lawn to the left of the path ----------
  const tree = new THREE.Group(); const bark = toonD("#c4b4a4", { shade: 0.55, map: canvasTex(128, 256, (c) => { c.fillStyle = "#6a5648"; c.fillRect(0, 0, 128, 256); for (let i = 0; i < 120; i++) { c.strokeStyle = rnd() < 0.5 ? "rgba(30,20,20,0.5)" : "rgba(170,150,130,0.3)"; c.lineWidth = 1 + rnd() * 3; const x = rnd() * 128; c.beginPath(); c.moveTo(x, rnd() * 256); c.lineTo(x + (rnd() - 0.5) * 6, rnd() * 256); c.stroke(); } }, [2, 2]) });
  const limb = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number) => { const d = b.clone().sub(a); const m = cyl(r1, r0, d.length(), bark, 0, 0, 0, 0.025, 12); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); tree.add(m); };
  const T1 = new THREE.Vector3(0.3, 4.2, 0.2); limb(new THREE.Vector3(0, -0.3, 0), T1, 0.75, 0.5);
  const leafTex = canvasTex(256, 256, (c) => { c.fillStyle = "#e0ecc8"; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 1100; i++) dab(c, rnd() * 256, rnd() * 256, 5 + rnd() * 5, 3 + rnd() * 2, rnd() * 3, ["rgba(70,110,50,0.35)", "rgba(255,255,220,0.4)", "rgba(140,180,90,0.35)"][(rnd() * 3) | 0]); }, [3, 2]);
  const leafM = ["#6aa04a", "#7cb054", "#5a9048"].map((c) => toonD(c, { shade: 0.5, rim: 0.15, map: leafTex, shadeTint: "#2e4a5a", tintAmt: 0.5 }));
  const blob = (r: number, at: THREE.Vector3, m: THREE.Material) => { const geo = new THREE.SphereGeometry(r, 28, 18); const p = geo.getAttribute("position") as THREE.BufferAttribute; for (let v = 0; v < p.count; v++) { const n = 1 + 0.1 * Math.sin(p.getX(v) * 3.1 + at.x) * Math.sin(p.getY(v) * 4.3) * Math.sin(p.getZ(v) * 2.7 + at.z); p.setXYZ(v, p.getX(v) * n, p.getY(v) * n * 0.72, p.getZ(v) * n); } geo.computeVertexNormals(); const cl = new THREE.Mesh(geo, m); cl.position.copy(at); ink(cl, 0.04); tree.add(cl); };
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + rnd() * 0.4; const end = new THREE.Vector3(Math.cos(a) * (4 + rnd() * 2.5), 8 + rnd() * 2.5, Math.sin(a) * (4 + rnd() * 2.5)); limb(T1, end, 0.38, 0.14);
    for (let k = 0; k < 2; k++) blob(2.0 + rnd() * 1.2, end.clone().add(new THREE.Vector3((rnd() - 0.5) * 2.4, (rnd() - 0.1) * 1.4, (rnd() - 0.5) * 2.4)), leafM[(rnd() * 3) | 0]); }
  blob(3.6, new THREE.Vector3(0.4, 11.4, 0.2), leafM[1]); blob(3.0, new THREE.Vector3(-2, 10.6, -1.8), leafM[0]);
  tree.position.set(-6.8, 0, -5.5); g.add(tree);
  // fallen-leaf + root flare ring under it
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; const r = cyl(0.1, 0.28, 0.9, bark, -6.8 + Math.cos(a) * 0.7, 0.1, -5.5 + Math.sin(a) * 0.7, 0.012, 8); r.rotation.set(Math.sin(a) * 1.05, 0, -Math.cos(a) * 1.05); g.add(r); }
  // ---------- hedges, flower beds, lamp posts, benches ----------
  const hedgeM = toonD("#4e8a44", { shade: 0.5, map: leafTex, shadeTint: "#2e4a5a", tintAmt: 0.5 });
  for (const s of [-1, 1]) for (let k = 0; k < 9; k++) { const x = s * (4.6 + k * 1.45); if (Math.abs(x) > W / 2 - 0.5) continue; const h = new THREE.Mesh(new THREE.SphereGeometry(0.85, 18, 12), hedgeM); h.scale.set(1, 0.95, 0.8); h.position.set(x, 0.7, ZF + 0.7); ink(h, 0.02); g.add(h); }
  const fcol = ["#f2c84a", "#e86a5a", "#f4f0f4", "#c88ad8", "#ff9a4a"];
  for (const s of [-1, 1]) for (let k = 0; k < 80; k++) { const x = s * 11 + (rnd() - 0.5) * 13.4, z = -14.6 + (rnd() - 0.5) * 1.5; const f = new THREE.Mesh(new THREE.SphereGeometry(0.09 + rnd() * 0.05, 8, 6), toonD(fcol[k % 5], { shade: 0.65 })); f.position.set(x, 0.18 + rnd() * 0.2, z); g.add(f); }
  const lamp = (x: number, z: number) => { const l = new THREE.Group(); l.add(cyl(0.07, 0.11, 3.6, ironM, 0, 1.8, 0, 0.008, 10)); l.add(cyl(0.18, 0.22, 0.3, ironM, 0, 0.15, 0, 0.008, 10)); l.add(cyl(0.24, 0.12, 0.6, toonD("#fbf6e6", { shade: 0.85 }), 0, 3.95, 0, 0.008, 6)); l.add(cyl(0.05, 0.3, 0.22, ironM, 0, 4.35, 0, 0.008, 6)); l.position.set(x, 0, z); g.add(l); };
  for (const z of [7, 19]) for (const s of [-1, 1]) lamp(pathX(z) + s * 2.4, z); lamp(-10, -9.2); lamp(10, -9.2);
  const bench = (x: number, z: number, ry: number) => { const b = new THREE.Group(); const wood = toonD("#a06a44", { shade: 0.6 }); for (let k = 0; k < 3; k++) b.add(box(1.8, 0.05, 0.13, wood, 0, 0.45, -0.18 + k * 0.17, 0.006)); for (let k = 0; k < 2; k++) b.add(box(1.8, 0.12, 0.04, wood, 0, 0.65 + k * 0.18, -0.3, 0.006));
    for (const sx of [-0.75, 0.75]) { b.add(box(0.06, 0.45, 0.5, ironM, sx, 0.22, -0.05, 0.004)); b.add(box(0.06, 0.5, 0.06, ironM, sx, 0.7, -0.3, 0.004)); } b.position.set(x, 0, z); b.rotation.y = ry; g.add(b); };
  bench(-3.3, 4.5, Math.PI / 2); bench(3.3, -5, -Math.PI / 2); bench(-5.2, -2.6, 0.9);

  // ---------- sky, clouds, distant trees ----------
  const SUN = new THREE.Vector3(0.45, 0.75, 0.5).normalize();
  g.add(paintedSky({ zen: "#5a8ed2", mid: "#8cbcec", hor: "#d8ecf6", below: "#9ab88a", light: SUN, lightCol: "#fff4dc", lightPow: 6 }));
  const dayCloud = (w: number) => { const t = canvasTex(1024, 420, (c) => { const lobes: [number, number, number][] = []; const n = 9; for (let i = 0; i < n; i++) { const u = i / (n - 1); lobes.push([140 + u * 740 + (rnd() - 0.5) * 30, 340 - (50 + rnd() * 40 + 80 * Math.sin(Math.PI * u)) * 0.8, 50 + rnd() * 40 + 80 * Math.sin(Math.PI * u)]); }
      const shape = () => { c.beginPath(); for (const [x, y, r] of lobes) { c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2); } c.rect(130, 300, 770, 50); };
      c.save(); shape(); c.clip(); const body = c.createLinearGradient(0, 30, 0, 360); body.addColorStop(0, "#ffffff"); body.addColorStop(0.5, "#f4f6fb"); body.addColorStop(0.8, "#c8d4ec"); body.addColorStop(1, "#a4b4d8"); c.fillStyle = body; c.fillRect(0, 0, 1024, 420);
      for (const [x, y, r] of lobes) dab(c, x, y + r * 0.55, r * 0.95, r * 0.45, 0, "rgba(140,160,210,0.2)"); c.restore(); });
    return noShadow(new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.41), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false, toneMapped: false }))); };
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + rnd() * 0.3; const r = 290 + rnd() * 50; const c = dayCloud(70 + rnd() * 100); c.position.set(Math.sin(a) * r, 40 + rnd() * 80, Math.cos(a) * r); c.lookAt(0, c.position.y * 0.6, 0); g.add(c); }
  const treeTexDay = canvasTex(512, 640, (c) => { c.strokeStyle = "#5a4636"; c.lineCap = "round"; c.lineWidth = 22; c.beginPath(); c.moveTo(256, 640); c.lineTo(258, 360); c.stroke();
    const cl: [number, number, number][] = []; for (let i = 0; i < 9; i++) { const a = rnd() * Math.PI * 2, d = rnd() * 110; cl.push([256 + Math.cos(a) * d * 1.3, 250 + Math.sin(a) * d * 0.75, 70 + rnd() * 40]); }
    for (const pass of [0, 1, 2]) for (const [cx, cy, r] of cl) for (let k = 0; k < 140; k++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r; const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.85; const top = (cy - y) / r;
      if (pass === 0) dab(c, x, y + 6, 9, 6, a, "#3e6a4a"); if (pass === 1 && top > -0.35) dab(c, x, y, 8, 5, a, top > 0.25 ? "#8ec060" : "#5e9a4c"); if (pass === 2 && top > 0.45 && rnd() < 0.5) dab(c, x, y, 6, 4, a, "#c8e08a"); } });
  const tsm = new THREE.SpriteMaterial({ map: treeTexDay, transparent: true, alphaTest: 0.3, toneMapped: false });
  for (let i = 0; i < 70; i++) { const a = rnd() * Math.PI * 2, d = 50 + rnd() * 50; const x = Math.sin(a) * d, z = Math.cos(a) * d - 10; if (z > 0 && Math.abs(x) < 18) continue; const s = new THREE.Sprite(tsm); const sc = 11 + rnd() * 8; s.scale.set(sc * 0.8, sc, 1); s.position.set(x, sc / 2 - 0.3, z); g.add(s); }
  for (const [x, z, sc] of [[22, -2, 12], [-24, 8, 13], [26, 14, 11], [-18, -26, 14], [16, -30, 13]] as [number, number, number][]) { const s = new THREE.Sprite(tsm); s.scale.set(sc * 0.8, sc, 1); s.position.set(x, sc / 2 - 0.3, z); g.add(s); }
  // grass tufts on the lawn edges (merged, swaying)
  const gt = grassTex("#2e4a24", "#5f9440", ["#b4d468", "#9cc458", "#d4e48a"], rnd, ["#ffffff", "#f8e060"]);
  const spots: [number, number, number][] = []; for (let i = 0; i < 900; i++) { const x = (rnd() - 0.5) * 50, z = -10 + rnd() * 45; if (Math.abs(x - pathX(z)) < 2.2 || Math.abs(z + 10.5) < 2.2) continue; if (Math.hypot(x + 6.8, z + 5.5) < 1.2) continue; spots.push([x, z, 0.14 + rnd() * 0.18]); }
  const grass = grassField(gt, spots, rnd); g.add(grass.mesh);

  // ---------- lights ----------
  g.add(new THREE.HemisphereLight("#cfe0ff", "#6a7a4a", 1.25));
  const key = keyLight("#fff0d6", 2.4, SUN, 40, new THREE.Vector3(0, 0, -8)); g.add(key, key.target);
  const fill = new THREE.DirectionalLight("#b8c8ff", 0.4); fill.position.set(-30, 12, 20); g.add(fill);
  const fog = new THREE.Fog("#d4e6f2", 70, 320);
  return {
    group: g, fog,
    update: (t) => { grass.setT(t); },
    cams: {
      main: { pos: [12, 2.4, 19], look: [-3.0, 5.5, -13], fov: 52 },
      handshake: { pos: [2.6, 1.5, 4.9], look: [-0.35, 1.45, 0], fov: 36 },
    },
    marks: { manA: [-0.5, 0, 0], manB: [0.5, 0, 0] },
  };
};
