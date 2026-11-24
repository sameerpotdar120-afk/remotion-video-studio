// Cabin in the pines (night, moonlit blue, one warm window). Log cabin in a clearing, porch facing +Z, a dirt track
// comes up from +Z. Rifle leaning by the door, two silhouettes behind the lit window (object "windowSilhouettes", hide if not wanted).
import * as THREE from "three";
import type { BuiltSet } from "./types";
import { canvasTex, dab, stones } from "../farm";
import { mkRnd, toonN, noShadow, glow, glowSprite, lightPool, cyl, paintedSky, pine3D, pineTex, grassTex, grassField, groundMat, keyLight, ink, box } from "./h2kit";

const MOON_SKY = new THREE.Vector3(-0.12, 0.27, -1).normalize(); // where the moon sits in the sky (behind the cabin for the approach)
const MOON_KEY = new THREE.Vector3(-0.6, 0.68, 0.42);               // where the moonlight comes from (cheated round to the front-left, anime style)

export const buildCabin = (): BuiltSet => {
  const rnd = mkRnd(41); const g = new THREE.Group();
  // ---------- painted textures ----------
  const logTex = canvasTex(512, 128, (c) => { // bark along the log: long strokes, knots, moonlit top band
    c.fillStyle = "#6a5444"; c.fillRect(0, 0, 512, 128);
    for (let i = 0; i < 420; i++) { const y = rnd() * 128, x = rnd() * 512; c.strokeStyle = rnd() < 0.55 ? "rgba(40,28,24,0.35)" : "rgba(170,150,130,0.22)"; c.lineWidth = 1 + rnd() * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + rnd() * 70, y + (rnd() - 0.5) * 4); c.stroke(); }
    for (let i = 0; i < 6; i++) { const x = rnd() * 512, y = 30 + rnd() * 68; dab(c, x, y, 7, 5, 0, "rgba(35,22,18,0.7)"); dab(c, x - 1, y - 2, 3, 2, 0, "rgba(200,170,140,0.35)"); }
    const gr = c.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "rgba(255,240,220,0.10)"); gr.addColorStop(0.5, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(20,10,20,0.25)"); c.fillStyle = gr; c.fillRect(0, 0, 512, 128);
  });
  logTex.wrapS = logTex.wrapT = THREE.RepeatWrapping;
  const endTex = canvasTex(128, 128, (c) => { c.fillStyle = "#b08a62"; c.fillRect(0, 0, 128, 128); for (let r = 58; r > 4; r -= 6 + rnd() * 3) { c.strokeStyle = "rgba(110,75,50,0.55)"; c.lineWidth = 1.5; c.beginPath(); c.ellipse(64 + rnd() * 2, 64 + rnd() * 2, r, r * 0.96, 0, 0, Math.PI * 2); c.stroke(); }
    c.strokeStyle = "rgba(80,50,35,0.6)"; c.lineWidth = 2; c.beginPath(); c.moveTo(64, 64); c.lineTo(110, 50); c.stroke(); c.strokeStyle = "#3a2a22"; c.lineWidth = 8; c.beginPath(); c.arc(64, 64, 60, 0, Math.PI * 2); c.stroke(); });
  const shakes = canvasTex(512, 512, (c) => { c.fillStyle = "#3e3a40"; c.fillRect(0, 0, 512, 512);
    for (let r = 0; r < 14; r++) for (let k = 0; k < 14; k++) { const x = k * 38 + (r % 2) * 19 - 19 + rnd() * 4, y = r * 37, w = 30 + rnd() * 12, l = 30 + rnd() * 12;
      const gr = c.createLinearGradient(0, y, 0, y + 36); gr.addColorStop(0, `hsl(${25 + rnd() * 20}, 14%, ${l + 10}%)`); gr.addColorStop(1, `hsl(${240 + rnd() * 20}, 12%, ${l - 8}%)`);
      c.fillStyle = gr; c.fillRect(x, y, w, 35); c.fillStyle = "rgba(15,12,22,0.7)"; c.fillRect(x + w, y, 3, 35); c.fillRect(x, y + 33, w, 3); if (rnd() < 0.1) dab(c, x + 15, y + 26, 10, 4, 0, "rgba(90,120,80,0.45)"); }
  }, [3, 2]);
  const plank = (base: string, n: number) => canvasTex(256, 256, (c) => { const bw = 256 / n; for (let i = 0; i < n; i++) { const l = 0.85 + rnd() * 0.25; const col = new THREE.Color(base).multiplyScalar(l); c.fillStyle = "#" + col.getHexString(); c.fillRect(i * bw, 0, bw, 256);
    for (let k = 0; k < 5; k++) { c.strokeStyle = "rgba(30,20,20,0.25)"; c.lineWidth = 1; const x = i * bw + rnd() * bw; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (rnd() - 0.5) * 6, 256); c.stroke(); } c.fillStyle = "#1e1618"; c.fillRect(i * bw, 0, 2, 256); } });

  // ---------- materials ----------
  const logM = toonN("#9a7c64", { map: logTex, shade: 0.5 }); const endM = toonN("#c89c70", { map: endTex, shade: 0.55 });
  const roofM = toonN("#8a8290", { map: shakes, shade: 0.5 }); const trimM = toonN("#6a5242", { shade: 0.5 }); const deckM = toonN("#8a705a", { map: plank("#8a705a", 10), shade: 0.5 });
  const stoneM = toonN("#9a96a4", { map: stones(), shade: 0.55 }); const doorM = toonN("#6e5440", { map: plank("#6e5440", 5), shade: 0.5 });
  const warm = (c: string) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });

  // ---------- sky: moon, stars, a few silver-edged night clouds ----------
  g.add(paintedSky({ zen: "#070b24", mid: "#16285a", hor: "#3b5a8e", below: "#0d1430", light: MOON_SKY, lightCol: "#6f8fd0", lightPow: 10, stars: 1 }));
  const moon = new THREE.Group(); const disc = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshBasicMaterial({ fog: false, toneMapped: false, depthWrite: false, map: canvasTex(256, 256, (c) => {
    const gr = c.createRadialGradient(110, 110, 10, 128, 128, 128); gr.addColorStop(0, "#fffbea"); gr.addColorStop(1, "#d9e2f2"); c.fillStyle = gr; c.beginPath(); c.arc(128, 128, 126, 0, Math.PI * 2); c.fill();
    for (const [x, y, r] of [[95, 90, 28], [150, 120, 22], [120, 170, 30], [170, 75, 14], [80, 150, 12]]) dab(c, x, y, r, r * 0.85, 0.4, "rgba(150,165,200,0.35)"); }), transparent: true }));
  moon.add(disc); const halo = glowSprite(glow("rgba(170,200,255,0.9)"), 90, 0.5); moon.add(halo); const halo2 = glowSprite(glow("rgba(120,150,230,0.6)"), 260, 0.35); moon.add(halo2);
  moon.position.copy(MOON_SKY).multiplyScalar(330); moon.lookAt(0, 0, 0); g.add(noShadow(moon));
  const nightCloud = (w: number) => { const t = canvasTex(1024, 300, (c) => { const lobes: [number, number, number][] = []; for (let i = 0; i < 10; i++) { const u = i / 9; lobes.push([110 + u * 800 + (rnd() - 0.5) * 40, 200 - Math.sin(Math.PI * u) * 60 + rnd() * 20, 30 + Math.sin(Math.PI * u) * 50 + rnd() * 25]); }
      c.save(); c.beginPath(); for (const [x, y, r] of lobes) { c.moveTo(x + r, y); c.ellipse(x, y, r * 1.4, r * 0.7, 0, 0, Math.PI * 2); } c.clip();
      const gr = c.createLinearGradient(0, 80, 0, 260); gr.addColorStop(0, "#5e74a8"); gr.addColorStop(0.5, "#2d3e6e"); gr.addColorStop(1, "#18224a"); c.fillStyle = gr; c.fillRect(0, 0, 1024, 300); c.restore();
      c.save(); c.strokeStyle = "rgba(205,222,255,0.75)"; c.lineWidth = 3; c.shadowColor = "rgba(180,205,255,0.9)"; c.shadowBlur = 8; for (const [x, y, r] of lobes) { c.beginPath(); c.ellipse(x, y, r * 1.4, r * 0.7, 0, Math.PI * 1.08, Math.PI * 1.75); c.stroke(); } c.restore(); });
    return noShadow(new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.29), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false, toneMapped: false, opacity: 0.85 }))); };
  for (let i = 0; i < 12; i++) { const a = Math.PI + (i / 12) * Math.PI * 2 + rnd() * 0.3; const r = 300; const c = nightCloud(70 + rnd() * 90); c.position.set(Math.sin(a) * r, 45 + rnd() * 80, Math.cos(a) * r); c.lookAt(0, c.position.y * 0.6, 0); g.add(c); }

  // ---------- ground: moonlit meadow, dark wood floor, the track, a worn yard ----------
  const groundTex = canvasTex(2048, 2048, (c) => {
    c.fillStyle = "#2c4258"; c.fillRect(0, 0, 2048, 2048);
    const pal = ["rgba(70,110,120,0.20)", "rgba(25,40,70,0.22)", "rgba(110,130,170,0.12)", "rgba(40,70,70,0.2)", "rgba(20,25,50,0.2)"];
    for (let i = 0; i < 24000; i++) dab(c, rnd() * 2048, rnd() * 2048, 4 + rnd() * 18, 2 + rnd() * 6, rnd() * 3.14, pal[(rnd() * pal.length) | 0]);
    // track: plane centre = world (0, 0, 20), 120 m -> 17.07 px/m. Track leaves the porch at z = 4 and runs to +Z with a lazy bend
    const P = (x: number, z: number): [number, number] => [1024 + x * 17.07, 1024 + (z - 20) * 17.07];
    const tx = (z: number) => Math.sin((z - 4) * 0.045) * 3.2 * Math.min(1, (z - 4) / 12);
    for (const [w, col] of [[110, "rgba(95,88,100,0.55)"], [70, "rgba(120,110,120,0.5)"]] as [number, string][]) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = "round"; c.beginPath(); for (let z = 3; z < 80; z += 1) { const [x, y] = P(tx(z), z); if (z === 3) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); }
    for (const ox of [-0.55, 0.55]) { c.strokeStyle = "rgba(55,50,70,0.55)"; c.lineWidth = 9; c.beginPath(); for (let z = 5; z < 80; z += 1) { const [x, y] = P(tx(z) + ox, z); if (z === 5) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
      c.strokeStyle = "rgba(170,180,215,0.35)"; c.lineWidth = 2; c.beginPath(); for (let z = 5; z < 80; z += 1) { const [x, y] = P(tx(z) + ox + 0.18, z); if (z === 5) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); }
    const [yx, yy] = P(0, 4); const yard = c.createRadialGradient(yx, yy, 0, yx, yy, 190); yard.addColorStop(0, "rgba(120,112,125,0.55)"); yard.addColorStop(1, "rgba(120,112,125,0)"); c.fillStyle = yard; c.fillRect(yx - 200, yy - 200, 400, 400);
    for (let i = 0; i < 1800; i++) { const x = rnd() * 2048, y = rnd() * 2048, r = 1.5 + rnd() * 3; dab(c, x, y + 1, r, r * 0.7, 0, "rgba(10,15,30,0.5)"); dab(c, x, y, r, r * 0.7, 0, "#6d7894"); dab(c, x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.3, 0, "rgba(220,230,255,0.7)"); }
    for (let i = 0; i < 16000; i++) { const x = rnd() * 2048, y = rnd() * 2048; c.strokeStyle = `hsl(${180 + rnd() * 40}, ${20 + rnd() * 20}%, ${18 + rnd() * 26}%)`; c.lineWidth = 2; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (rnd() - 0.5) * 6, y - 8, x + (rnd() - 0.5) * 10, y - 10 - rnd() * 12); c.stroke(); }
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), groundMat(groundTex, "#a8b8d8", "#233a78", 0.55, [[70, 78, 130], [150, 160, 205], [225, 232, 255]])); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 20); g.add(ground);
  const far = new THREE.Mesh(new THREE.CircleGeometry(400, 48), new THREE.MeshBasicMaterial({ color: "#121a36" })); far.rotation.x = -Math.PI / 2; far.position.y = -0.05; g.add(noShadow(far));
  const trackX = (z: number) => Math.sin((z - 4) * 0.045) * 3.2 * Math.min(1, Math.max(0, (z - 4) / 12));

  // ---------- the cabin ----------
  const W = 6.4, D = 5, base = 0.38, R = 0.15, step = 0.285, rows = 9, top = base + R + step * (rows - 0.5) + 0.05; // top of the walls ~2.98
  const cab = new THREE.Group(); g.add(cab);
  cab.add(box(W + 0.3, base, D + 0.3, stoneM, 0, base / 2, 0, 0.02)); // stone footing
  const log = (len: number, x: number, y: number, z: number, alongX: boolean) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(R * (0.95 + rnd() * 0.1), R, len, 14), [logM, endM, endM]); m.position.set(x, y, z); if (alongX) m.rotation.z = Math.PI / 2; else m.rotation.x = Math.PI / 2; m.rotation.y += (rnd() - 0.5) * 0.01; ink(m, 0.014); cab.add(m);
    return m; };
  // openings: [x0, x1, y0, y1] in the front wall, [z0, z1, y0, y1] in the left (-X) side wall
  const front: [number, number, number, number][] = [[-0.55, 0.55, 0, base + 2.15], [-2.45, -1.15, base + 0.9, base + 2.0]];
  const side: [number, number, number, number][] = [[-0.6, 0.6, base + 0.95, base + 1.95]];
  const spans = (a: number, b: number, y: number, ops: [number, number, number, number][]) => { let s: [number, number][] = [[a, b]]; for (const [o0, o1, y0, y1] of ops) { if (y + R * 0.6 < y0 || y - R * 0.6 > y1) continue; s = s.flatMap(([p, q]) => { const out: [number, number][] = []; if (o0 > p) out.push([p, Math.min(q, o0)]); if (o1 < q) out.push([Math.max(p, o1), q]); return out; }); } return s.filter(([p, q]) => q - p > 0.05); };
  for (let i = 0; i < rows; i++) {
    const yF = base + R + i * step, yS = yF + step / 2; const ov = 0.32;
    for (const sz of [-1, 1]) for (const [p, q] of spans(-W / 2 - ov, W / 2 + ov, yF, sz > 0 ? front : [])) log(q - p, (p + q) / 2, yF, sz * D / 2, true);
    if (yS < top) for (const sx of [-1, 1]) for (const [p, q] of spans(-D / 2 - ov, D / 2 + ov, yS, sx < 0 ? side : [])) log(q - p, sx * W / 2, yS, (p + q) / 2, false);
  }
  // chinking between the logs (pale mortar strips, gives the classic striped look)
  const chink = toonN("#8a8290", { shade: 0.5 });
  for (let i = 0; i < rows - 1; i++) { const y = base + R + i * step + step / 2; for (const sz of [-1, 1]) for (const [p, q] of spans(-W / 2, W / 2, y, sz > 0 ? front : [])) cab.add(box(q - p, 0.06, 0.2, chink, (p + q) / 2, y, sz * (D / 2 - 0.02), 0));
    for (const sx of [-1, 1]) for (const [p, q] of spans(-D / 2, D / 2, y + step / 2, sx < 0 ? side : [])) cab.add(box(0.2, 0.06, q - p, chink, sx * (W / 2 - 0.02), y + step / 2, (p + q) / 2, 0)); }
  // interior shell: warm lamplit walls seen through the window / door cracks
  const interiorTex = canvasTex(512, 256, (c) => { const gr = c.createRadialGradient(256, 150, 10, 256, 130, 300); gr.addColorStop(0, "#ffcf84"); gr.addColorStop(0.5, "#d9894c"); gr.addColorStop(1, "#5a2e22"); c.fillStyle = gr; c.fillRect(0, 0, 512, 256);
    for (let y = 0; y < 256; y += 22) { c.fillStyle = "rgba(90,40,20,0.25)"; c.fillRect(0, y, 512, 3); }
    c.fillStyle = "rgba(70,32,18,0.8)"; c.fillRect(300, 70, 150, 8); for (let k = 0; k < 6; k++) c.fillRect(305 + k * 24, 46 - (k % 2) * 8, 12, 24 + (k % 2) * 8); // shelf with jars
    c.fillRect(60, 120, 90, 136); c.fillStyle = "rgba(255,230,170,0.5)"; c.fillRect(70, 130, 30, 40); }); // a dresser
  const inside = new THREE.Mesh(new THREE.BoxGeometry(W - 0.32, top - base, D - 0.32), new THREE.MeshBasicMaterial({ map: interiorTex, side: THREE.BackSide, toneMapped: false })); inside.position.set(0, base + (top - base) / 2, 0); cab.add(noShadow(inside));
  // the lit front window: frame, mullions, half-drawn calico curtains, warm glass glow
  const wx = -1.8, wy = base + 1.45, wz = D / 2 + R;
  for (const [w, h, x, y] of [[1.5, 0.12, wx, wy + 0.6], [1.5, 0.14, wx, wy - 0.6], [0.12, 1.25, wx - 0.68, wy], [0.12, 1.25, wx + 0.68, wy]] as [number, number, number, number][]) cab.add(box(w, h, 0.16, trimM, x, y, wz - 0.02, 0.012));
  cab.add(box(1.6, 0.06, 0.32, trimM, wx, wy - 0.68, wz + 0.06, 0.012)); // sill
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 1.1), new THREE.MeshBasicMaterial({ color: "#ffe0a0", transparent: true, opacity: 0.18, toneMapped: false, depthWrite: false })); glass.position.set(wx, wy, wz - 0.05); cab.add(noShadow(glass));
  cab.add(box(0.05, 1.1, 0.05, trimM, wx, wy, wz - 0.03, 0)); cab.add(box(1.26, 0.05, 0.05, trimM, wx, wy, wz - 0.03, 0));
  const curtainTex = canvasTex(128, 256, (c) => { c.fillStyle = "#e8a060"; c.fillRect(0, 0, 128, 256); for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? "rgba(150,60,40,0.35)" : "rgba(255,220,160,0.3)"; c.fillRect(i * 14, 0, 7, 256); } for (let i = 0; i < 60; i++) dab(c, rnd() * 128, rnd() * 256, 3, 3, 0, "rgba(170,50,40,0.6)"); });
  for (const sx of [-1, 1]) { const ct = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 1.12), warm("#ffffff")); (ct.material as THREE.MeshBasicMaterial).map = curtainTex; ct.position.set(wx + sx * 0.47, wy, wz - 0.18); cab.add(noShadow(ct)); }
  // two silhouettes inside (head + shoulders), toggle with getObjectByName("windowSilhouettes")
  const sil = new THREE.Group(); sil.name = "windowSilhouettes"; const silM = new THREE.MeshBasicMaterial({ color: "#3a1c1a", toneMapped: false });
  for (const [x, h, lean] of [[-2.08, 1.72, 0.08], [-1.5, 1.6, -0.1]] as [number, number, number][]) { const p = new THREE.Group(); const sh = new THREE.Shape(); sh.moveTo(-0.26, 0); sh.quadraticCurveTo(-0.25, 0.42, -0.08, 0.48); sh.lineTo(0.08, 0.48); sh.quadraticCurveTo(0.25, 0.42, 0.26, 0); sh.closePath();
    const body = new THREE.Mesh(new THREE.ShapeGeometry(sh), silM); body.position.y = h - 0.78; p.add(body); const head = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), silM); head.scale.y = 1.2; head.position.y = h - 0.15; p.add(head);
    const brim = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.035), silM); brim.position.y = h - 0.07; p.add(brim); const crown = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), silM); crown.position.y = h - 0.01; p.add(crown);
    p.position.set(x, base, D / 2 - 0.9); p.rotation.z = lean * 0.3; sil.add(p); }
  cab.add(noShadow(sil));
  // left side window (dimmer, a second room)
  const sw = box(0.06, 0.95, 1.1, warm("#d98a4a"), -W / 2 + 0.02, base + 1.45, 0, 0); cab.add(noShadow(sw));
  for (const [h, d, y, z] of [[0.12, 1.4, base + 1.98, 0], [0.12, 1.4, base + 0.92, 0], [1.1, 0.1, base + 1.45, -0.62], [1.1, 0.1, base + 1.45, 0.62]] as [number, number, number, number][]) cab.add(box(0.16, h, d, trimM, -W / 2 - R + 0.02, y, z, 0.012));
  // door (closed, a thin warm line of light underneath and at the latch side)
  cab.add(box(1.0, 2.1, 0.08, doorM, 0, base + 1.07, D / 2 + 0.02, 0.014)); for (const y of [base + 0.4, base + 1.75]) cab.add(box(1.0, 0.1, 0.04, trimM, 0, y, D / 2 + 0.08, 0.008));
  cab.add(box(0.05, 0.05, 0.08, toonN("#2a2a30"), 0.38, base + 1.05, D / 2 + 0.1, 0)); cab.add(noShadow(box(1.0, 0.025, 0.02, warm("#ffc070"), 0, base + 0.02, D / 2 + 0.07, 0))); cab.add(noShadow(box(0.02, 2.05, 0.02, warm("#ffb060"), 0.505, base + 1.07, D / 2 + 0.07, 0)));
  for (const sx of [-1, 1]) cab.add(box(0.12, 2.25, 0.18, trimM, sx * 0.57, base + 1.12, D / 2 + 0.06, 0.012)); cab.add(box(1.3, 0.14, 0.2, trimM, 0, base + 2.22, D / 2 + 0.06, 0.012));
  // gable roof (ridge along X) with log gable ends and a ridge log
  const rise = 1.75, over = 0.55; const half = Math.hypot(D / 2 + over, rise);
  for (const sz of [-1, 1]) { const r = box(W + 1.1, 0.16, half, roofM, 0, top + rise / 2 - 0.05, sz * (D / 4 + over / 2), 0.028); r.rotation.x = sz * Math.atan2(rise, D / 2 + over); cab.add(r); }
  cab.add(cyl(0.12, 0.12, W + 1.2, toonN("#7a6250", { shade: 0.5 }), 0, top + rise * 1.02, 0, 0.014).rotateZ(Math.PI / 2));
  for (const sx of [-1, 1]) for (let k = 0; ; k++) { const y = top + 0.12 + k * step; const w = (D / 2) * (1 - (y - top) / rise) * 2; if (w < 0.4) break; log(w, sx * W / 2, y, 0, false); }
  // stone chimney on the right gable + smoke
  const chX = W / 2 + 0.5; cab.add(box(1.1, top + rise + 1.1, 1.0, stoneM, chX, (top + rise + 1.1) / 2, -0.3, 0.02)); cab.add(box(1.25, 0.16, 1.15, toonN("#6c6a78"), chX, top + rise + 1.15, -0.3, 0.014));
  const smokeTex = canvasTex(128, 128, (c) => { for (let i = 0; i < 14; i++) { const x = 30 + rnd() * 68, y = 30 + rnd() * 68, r = 18 + rnd() * 20; const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(170,182,215,0.5)"); gr.addColorStop(1, "rgba(120,135,180,0)"); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); } });
  const smoke: THREE.Sprite[] = []; for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0.5 })); g.add(s); smoke.push(s); }
  const smokeBase = new THREE.Vector3(chX, top + rise + 1.3, -0.3);

  // ---------- porch ----------
  const PD = 2.1, pz = D / 2 + R;
  cab.add(box(W + 0.4, 0.1, PD, deckM, 0, base - 0.02, pz + PD / 2, 0.016));
  for (const x of [-W / 2, W / 2]) for (const z of [pz + 0.2, pz + PD - 0.15]) cab.add(box(0.16, base, 0.16, trimM, x, base / 2, z, 0.01));
  const postX = [-W / 2, -1.1, 1.1, W / 2]; for (const x of postX) cab.add(cyl(0.08, 0.09, 2.35, logM, x, base + 1.17, pz + PD - 0.12, 0.012, 10));
  const proof = box(W + 0.7, 0.1, PD + 0.45, roofM, 0, base + 2.48, pz + PD / 2 + 0.05, 0.022); proof.rotation.x = 0.17; cab.add(proof);
  cab.add(cyl(0.09, 0.09, W + 0.4, logM, 0, base + 2.32, pz + PD - 0.12, 0.012, 10).rotateZ(Math.PI / 2));
  for (let i = 0; i < 2; i++) cab.add(box(1.6, base / 2, 0.34, deckM, 0, (base / 2) * (i + 0.5), pz + PD + 0.17 + (1 - i) * 0.34, 0.012));
  for (const sx of [-1, 1]) { cab.add(cyl(0.05, 0.05, 2.2, logM, sx * 2.25, base + 0.9, pz + PD - 0.12, 0.01, 8).rotateZ(Math.PI / 2)); for (const x of [1.45, 2.25, 3.05]) cab.add(cyl(0.04, 0.04, 0.9, logM, sx * x, base + 0.45, pz + PD - 0.12, 0.008, 6)); }
  // rifle leaning right of the door: stock, receiver, barrel, lever
  const rifle = new THREE.Group(); const wood = toonN("#7a4a2c", { shade: 0.5, rim: 0.2 }), metal = toonN("#4a4e5a", { shade: 0.5, rim: 0.45 });
  const stock = box(0.05, 0.36, 0.11, wood, 0, 0.18, 0, 0.006); stock.scale.set(1, 1, 1); rifle.add(stock); rifle.add(box(0.05, 0.14, 0.06, metal, 0, 0.43, 0.0, 0.005));
  rifle.add(box(0.035, 0.3, 0.045, wood, 0, 0.64, 0.01, 0.005)); rifle.add(cyl(0.011, 0.011, 0.62, metal, 0, 0.79, -0.01, 0.004, 8)); rifle.add(cyl(0.008, 0.008, 0.45, metal, 0, 0.72, 0.016, 0.003, 8));
  const lever = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 6, 12, Math.PI * 1.3), metal); lever.position.set(0, 0.36, 0.05); lever.rotation.y = Math.PI / 2; rifle.add(lever);
  rifle.position.set(0.85, base + 0.04, D / 2 + R + 0.2); rifle.rotation.set(-0.2, 0.15, 0); cab.add(rifle);
  // porch chair, a crate, a lantern on a nail by the door (warm glow + a small point light)
  const chair = new THREE.Group(); for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) chair.add(box(0.05, 0.45, 0.05, trimM, x, 0.22, z, 0.006));
  chair.add(box(0.5, 0.05, 0.48, deckM, 0, 0.46, 0, 0.008)); for (const x of [-0.2, 0.2]) chair.add(box(0.05, 0.5, 0.05, trimM, x, 0.72, -0.22, 0.006)); chair.add(box(0.48, 0.18, 0.04, deckM, 0, 0.88, -0.22, 0.006));
  chair.position.set(1.95, base, pz + 0.55); chair.rotation.y = -0.4; cab.add(chair);
  cab.add(box(0.5, 0.42, 0.45, toonN("#8a6a4c", { map: plank("#8a6a4c", 4) }), 2.7, base + 0.21, pz + 0.35, 0.012));
  const lant = new THREE.Group(); lant.add(box(0.16, 0.24, 0.16, warm("#ffd27a"), 0, 0, 0, 0.008)); lant.add(box(0.2, 0.03, 0.2, toonN("#2c2c34"), 0, 0.13, 0, 0.006)); lant.add(box(0.2, 0.03, 0.2, toonN("#2c2c34"), 0, -0.13, 0, 0.006));
  lant.position.set(-0.95, base + 2.0, pz + 0.12); cab.add(lant); const lantGlow = glowSprite(glow("rgba(255,200,120,0.95)"), 1.4, 0.85); lantGlow.position.set(-0.95, base + 2.0, pz + 0.2); g.add(lantGlow);
  const lantLight = new THREE.PointLight("#ffb46a", 3.2, 9, 1.6); lantLight.position.set(-0.95, base + 1.9, pz + 0.5); g.add(lantLight);
  const winLight = new THREE.PointLight("#ffb060", 4.0, 10, 1.4); winLight.position.set(wx, wy - 0.2, wz + 0.9); g.add(winLight);
  const winGlow = glowSprite(glow("rgba(255,190,110,0.8)"), 2.8, 0.45); winGlow.position.set(wx, wy, wz + 0.15); g.add(winGlow);
  // light spilling out of the window onto the porch and the yard
  const pool1 = lightPool(2.2, 1.8, "rgba(255,190,110,0.9)", 0.45); pool1.position.set(wx, base + 0.04, pz + 0.9); g.add(pool1);
  const pool2 = lightPool(3.4, 4.6, "rgba(255,170,90,0.7)", 0.22); pool2.position.set(wx - 0.3, 0.03, pz + PD + 2.0); g.add(pool2);
  // woodpile against the left wall, chopping stump + axe, water barrel, hitching rail by the track
  for (let r = 0; r < 4; r++) for (let k = 0; k < 9 - r; k++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.5, 9), [logM, endM, endM]); m.rotation.x = Math.PI / 2; m.position.set(-W / 2 - 0.6, 0.11 + r * 0.19, -1.7 + k * 0.23 + r * 0.11); ink(m, 0.008); cab.add(m); }
  const stump = cyl(0.3, 0.34, 0.5, [toonN("#6a5444", { map: logTex }), endM, endM], -W / 2 - 1.7, 0.25, 1.6, 0.012); cab.add(stump);
  const axe = new THREE.Group(); axe.add(box(0.04, 0.75, 0.04, toonN("#a07a50"), 0, 0.37, 0, 0.005)); axe.add(box(0.03, 0.12, 0.2, metal, 0, 0.72, 0.07, 0.005)); axe.position.set(-W / 2 - 1.7, 0.5, 1.6); axe.rotation.set(0.5, 0.3, 0.1); cab.add(axe);
  const barrel = cyl(0.3, 0.27, 0.8, toonN("#5a4838", { map: plank("#5a4838", 8) }), W / 2 - 0.5, base + 0.4, pz + 1.6, 0.014); cab.add(barrel); for (const y of [0.15, 0.65]) cab.add(cyl(0.305, 0.305, 0.04, metal, W / 2 - 0.5, base + y, pz + 1.6, 0, 16));
  const hx = -4.6, hz = 7.5; for (const dx of [-1.1, 1.1]) cab.add(cyl(0.08, 0.09, 1.2, logM, hx + dx, 0.6, hz, 0.012, 8)); cab.add(cyl(0.065, 0.065, 2.6, logM, hx, 1.12, hz, 0.012, 8).rotateZ(Math.PI / 2));

  // ---------- the pine wood: 3D pines round the clearing, painted billboards behind ----------
  const pineM = [toonN("#2f5a4e", { shade: 0.45, rim: 0.25 }), toonN("#28503f", { shade: 0.45, rim: 0.25 }), toonN("#35604c", { shade: 0.45, rim: 0.25 })]; const barkM = toonN("#4a3a34", { shade: 0.5 });
  const camXZ = [[8.5, 15.5], [trackX(30) + 0.6, 30], [2.2, 9.8]]; // keep trunks + boughs away from the shot cameras
  const clear = (x: number, z: number, r: number) => Math.hypot(x * 0.85, z - 1) < r || (z > 3 && Math.abs(x - trackX(z)) < 3.8 + z * 0.02) || camXZ.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < 6);
  let placed = 0; for (let i = 0; i < 900 && placed < 70; i++) { const a = rnd() * Math.PI * 2, d = 13 + rnd() * 32; const x = Math.sin(a) * d * 1.1, z = Math.cos(a) * d + 1; if (clear(x, z, 13)) continue; const h = 9 + rnd() * 9; const p = pine3D(h, pineM[(rnd() * 3) | 0], barkM, rnd, 0.035); p.position.set(x, 0, z); p.rotation.y = rnd() * 6; g.add(p); placed++; }
  for (const [x, z, h] of [[-8.5, -5, 11], [7.8, -6, 13], [-11, 4, 9.5], [10.5, 3, 10], [-6.5, 12, 7], [12, 20, 8.5], [-8, 21, 9]] as [number, number, number][]) { const p = pine3D(h, pineM[(rnd() * 3) | 0], barkM, rnd, 0.03); p.position.set(x, 0, z); g.add(p); }
  const ptex = [pineTex("#1f3a40", "#142630", "rgba(150,190,230,0.55)", rnd), pineTex("#22413f", "#162a2e", "rgba(140,180,225,0.5)", rnd)];
  const pmats = ptex.map((t) => new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: 0.4, toneMapped: false, fog: true }));
  for (let i = 0; i < 260; i++) { const a = rnd() * Math.PI * 2, d = 42 + rnd() * 50; const x = Math.sin(a) * d, z = Math.cos(a) * d + 1; if (z > 30 && Math.abs(x - trackX(z)) < 7) continue; const h = 12 + rnd() * 10; const s = new THREE.Sprite(pmats[i % 2]); s.scale.set(h * 0.5, h, 1); s.position.set(x, h / 2 - 0.4, z); g.add(s); }
  // distant ridge line, dark blue, under the trees
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(180, 180, 40, 64, 1, true), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, transparent: true, depthWrite: false, map: canvasTex(2048, 128, (c) => { c.fillStyle = "#101a38"; c.beginPath(); c.moveTo(0, 128); for (let x = 0; x <= 2048; x += 16) c.lineTo(x, 70 - Math.sin(x * 0.006) * 22 - Math.sin(x * 0.021) * 9 - rnd() * 4); c.lineTo(2048, 128); c.fill(); }) }));
  ridge.position.y = 5; g.add(noShadow(ridge));
  // grass tufts round the clearing edges and along the track (merged, swaying)
  const gtex = grassTex("#14202c", "#2e4a52", ["#6f8fae", "#5a7a8a", "#8aa6c6"], rnd);
  const spots: [number, number, number][] = []; for (let i = 0; i < 1500; i++) { const x = (rnd() - 0.5) * 70, z = (rnd() - 0.35) * 70; if (Math.abs(x) < W / 2 + 1.5 && z > -D / 2 - 1.5 && z < pz + PD + 1.2) continue; if (z > 3 && Math.abs(x - trackX(z)) < 1.6) continue; if (Math.hypot(x, z - 5) < 5 + rnd() * 3) continue; spots.push([x, z, 0.35 + rnd() * 0.5]); }
  const grass = grassField(gtex, spots, rnd); g.add(grass.mesh);
  // fireflies drifting at the edge of the wood
  const N = 70; const ffGeo = new THREE.BufferGeometry(); const ff0 = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const a = rnd() * Math.PI * 2, d = 7 + rnd() * 12; ff0.set([Math.sin(a) * d, 0.4 + rnd() * 2.2, Math.cos(a) * d + 3], i * 3); }
  ffGeo.setAttribute("position", new THREE.BufferAttribute(ff0.slice(), 3)); const ff = new THREE.Points(ffGeo, new THREE.PointsMaterial({ size: 0.16, map: glow("rgba(255,240,170,1)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); g.add(ff);

  // ---------- lights ----------
  g.add(new THREE.HemisphereLight("#5a6cc0", "#121630", 0.9));
  const key = keyLight("#b4c8ff", 1.9, MOON_KEY, 30, new THREE.Vector3(0, 0, 3)); g.add(key, key.target);
  const rim = new THREE.DirectionalLight("#7f9cff", 0.6); rim.position.copy(MOON_SKY).multiplyScalar(50); g.add(rim);

  const fog = new THREE.Fog("#1a2850", 30, 160);
  return {
    group: g, fog,
    update: (t) => {
      grass.setT(t);
      for (let i = 0; i < smoke.length; i++) { const ph = (t * 0.12 + i / smoke.length) % 1; const s = smoke[i]; s.position.set(smokeBase.x + ph * ph * 3.5 + Math.sin(ph * 6 + i) * 0.2, smokeBase.y + ph * 7, smokeBase.z - ph * 1.5); s.scale.setScalar(0.8 + ph * 3.2); (s.material as THREE.SpriteMaterial).opacity = Math.sin(Math.PI * Math.min(1, ph * 1.3)) * 0.45; }
      const fl = 1 + Math.sin(t * 9.1) * 0.05 + Math.sin(t * 13.7) * 0.04; lantLight.intensity = 3.2 * fl; lantGlow.material.opacity = 0.85 * fl; winLight.intensity = 4 * (1 + Math.sin(t * 7.3) * 0.03);
      const p = ffGeo.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < N; i++) p.setXYZ(i, ff0[i * 3] + Math.sin(t * 0.4 + i) * 0.6, ff0[i * 3 + 1] + Math.sin(t * 0.7 + i * 2.3) * 0.25, ff0[i * 3 + 2] + Math.cos(t * 0.35 + i * 1.7) * 0.6); p.needsUpdate = true;
      (ff.material as THREE.PointsMaterial).opacity = 0.75 + Math.sin(t * 2) * 0.2;
    },
    cams: {
      main: { pos: [8.5, 3.5, 15.5], look: [-1.3, 2.1, 1.0], fov: 44 },
      approach: { pos: [trackX(30) + 0.6, 1.9, 30], look: [0, 2.6, 2], fov: 36 },
      window: { pos: [-2.45, 1.95, 6.3], look: [-1.8, 1.85, 2.6], fov: 30 },
      porch: { pos: [2.2, 1.05, 9.8], look: [0.2, 1.8, 3.2], fov: 42 },
    },
    marks: { door: [0, base, pz + 0.45], porch: [-1.2, base, pz + 1.1], rider: [trackX(11), 0, 11], rifle: [0.85, base, pz + 0.35] },
  };
};
