// Night game: one side of a football stadium under big floodlights. Field along X (centre at the origin, 100 yd + end zones),
// the packed home stand rises on the -Z side. Crowd = instanced simple people that bob, jump and wave (deterministic per t).
// Neutral colours only (blue/white home crowd mixed with assorted coats), no logos, no real school colours.
import * as THREE from "three";
import type { BuiltSet } from "./types";
import { canvasTex, dab } from "../farm";
import { smoothNormals } from "../kit";
import { mkRnd, toonN, noShadow, glow, glowSprite, cyl, paintedSky, keyLight, ink, box, inkMatS } from "./h2kit";

const YD = 0.9144; const HALF_W = 26.67 * YD; const END = 60 * YD; // sideline z = +-24.38, back of end zone x = +-54.86
export const buildStadium = (): BuiltSet => {
  const rnd = mkRnd(311); const g = new THREE.Group();
  // ---------- field: painted turf with mowing stripes, yard lines, hashes, numbers ----------
  const FW = 124, FD = 60, PXX = 4096 / FW, PXZ = 2048 / FD; const F = (x: number, z: number): [number, number] => [(x + FW / 2) * PXX, (z + FD / 2) * PXZ];
  const fieldTex = canvasTex(4096, 2048, (c) => {
    c.fillStyle = "#3e5a3a"; c.fillRect(0, 0, 4096, 2048); // run-off: darker, a touch of the track
    const [ax, az] = F(-END, -HALF_W), [bx, bz] = F(END, HALF_W);
    for (let i = 0; i < 24; i++) { const x0 = -END + i * 5 * YD; const [p] = F(x0, 0), [q] = F(x0 + 5 * YD, 0); c.fillStyle = i % 2 ? "#4f8a3e" : "#5a9846"; c.fillRect(p, az, q - p + 1, bz - az); } // mowing stripes every 5 yd
    for (let i = 0; i < 26000; i++) dab(c, ax + rnd() * (bx - ax), az + rnd() * (bz - az), 3 + rnd() * 10, 1.5 + rnd() * 3, rnd() * 3, ["rgba(120,170,80,0.18)", "rgba(40,70,40,0.16)", "rgba(160,200,110,0.12)"][(rnd() * 3) | 0]);
    for (let i = 0; i < 60; i++) { const x = (rnd() - 0.5) * 2 * 40, z = (rnd() - 0.5) * 2 * 18; const [p, q] = F(x, z); const r = 20 + rnd() * 60; const gr = c.createRadialGradient(p, q, 0, p, q, r); gr.addColorStop(0, "rgba(120,110,70,0.18)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(p - r, q - r, 2 * r, 2 * r); } // worn patches
    // end zones: neutral slate with thin white diagonals
    for (const s of [-1, 1]) { const [p] = F(s * 50 * YD, 0), [q] = F(s * END, 0); const x0 = Math.min(p, q), w = Math.abs(q - p); c.fillStyle = "#355a74"; c.fillRect(x0, az, w, bz - az);
      c.save(); c.beginPath(); c.rect(x0, az, w, bz - az); c.clip(); c.strokeStyle = "rgba(240,244,250,0.55)"; c.lineWidth = 7; for (let k = -40; k < 40; k++) { const o = x0 + k * 70; c.beginPath(); c.moveTo(o, az); c.lineTo(o + (bz - az), bz); c.stroke(); } c.restore(); }
    const white = "rgba(246,248,244,0.95)"; c.fillStyle = white;
    const lw = 0.1 * PXX; for (let y = -50; y <= 50; y += 5) { const [p] = F(y * YD, 0); c.fillRect(p - lw / 2, az, lw, bz - az); }
    for (const s of [-1, 1]) { const [p] = F(s * END, 0); c.fillRect(p - lw, az, lw * 2, bz - az); }
    c.fillRect(ax, az - lw, bx - ax, lw * 2); c.fillRect(ax, bz - lw, bx - ax, lw * 2);                         // sidelines
    for (let y = -49; y <= 49; y++) { if (y % 5 === 0) continue; const [p] = F(y * YD, 0); for (const z of [-HALF_W + 0.3, -6.1, 6.1, HALF_W - 0.9]) { const [, q] = F(0, z); c.fillRect(p - lw / 2, q, lw, 0.6 * PXZ); } } // hashes
    c.font = `bold ${Math.round(1.8 * PXZ)}px sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
    for (let y = -40; y <= 40; y += 10) { const n = 50 - Math.abs(y); const [p] = F(y * YD, 0);
      for (const s of [-1, 1]) { const [, q] = F(0, s * (HALF_W - 11.5)); c.save(); c.translate(p, q); c.rotate(s > 0 ? 0 : Math.PI); c.fillText(n === 50 ? "5 0" : `${n / 10}   0`.replace("   ", " "), 0, 0); c.restore(); } }
    for (let i = 0; i < 9000; i++) { const x = ax + rnd() * (bx - ax), y = az + rnd() * (bz - az); dab(c, x, y, 1 + rnd() * 2, 0.6, rnd() * 3, "rgba(30,60,30,0.22)"); } // scuffs over the paint
  });
  const turfDetail = canvasTex(256, 256, (c) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 2200; i++) { const x = rnd() * 256, y = rnd() * 256; c.strokeStyle = `rgba(${150 + rnd() * 60},${150 + rnd() * 60},${150 + rnd() * 60},0.8)`; c.lineWidth = 1.3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 3, y - 4 - rnd() * 5); c.stroke(); } }, [FW * 1.5, FD * 1.5]);
  const ramp = new THREE.DataTexture(new Uint8Array([110, 120, 160, 255, 200, 205, 215, 255, 255, 255, 255, 255]), 3, 1); ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
  const field = new THREE.Mesh(new THREE.PlaneGeometry(FW, FD), new THREE.MeshToonMaterial({ map: fieldTex, gradientMap: ramp, aoMap: turfDetail, aoMapIntensity: 0.6, emissive: "#2a3a68", emissiveMap: fieldTex, emissiveIntensity: 0.3 })); field.rotation.x = -Math.PI / 2; g.add(field);
  const outer = new THREE.Mesh(new THREE.CircleGeometry(400, 48), new THREE.MeshBasicMaterial({ color: "#0e1424" })); outer.rotation.x = -Math.PI / 2; outer.position.y = -0.03; g.add(noShadow(outer));

  // ---------- goalposts (gooseneck, yellow, padded base) ----------
  const yel = toonN("#f2cc3a", { shade: 0.6, rim: 0.3 }); const pad = toonN("#3a4a6a", { shade: 0.55 });
  for (const s of [-1, 1]) { const gp = new THREE.Group(); const x = s * END;
    gp.add(cyl(0.17, 0.17, 3.05, yel, s * 1.8, 1.52, 0, 0.02, 12)); gp.add(cyl(0.3, 0.3, 2.0, pad, s * 1.8, 1.0, 0, 0.02, 14));
    const neck = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 8, 16, Math.PI / 2), yel); neck.rotation.y = s > 0 ? 0 : Math.PI; neck.position.set(s * 0.9, 3.05, 0); ink(neck, 0.015); gp.add(neck);
    const bar = cyl(0.1, 0.1, 5.64, yel, 0, 3.95, 0, 0.015, 10); bar.rotation.x = Math.PI / 2; gp.add(bar);
    for (const z of [-2.82, 2.82]) gp.add(cyl(0.07, 0.07, 9.2, yel, 0, 3.95 + 4.6, z, 0.012, 10));
    for (const z of [-2.82, 2.82]) { const rib = box(0.03, 1.0, 0.25, new THREE.MeshBasicMaterial({ color: "#e6eef8", toneMapped: false }), 0, 3.95 + 9.0, z, 0.004); gp.add(rib); } // wind ribbons
    gp.position.x = x; g.add(gp); }

  // ---------- the home stand (-Z side) ----------
  const rows = 34, rise = 0.46, deep = 0.86, wallH = 1.7, z0 = -HALF_W - 4.2, SX = 58; // stand front wall at z ~ -28.6
  const concrete = toonN("#8c8c9a", { shade: 0.55, map: canvasTex(256, 256, (c) => { c.fillStyle = "#c4c4cc"; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 900; i++) dab(c, rnd() * 256, rnd() * 256, 2 + rnd() * 8, 1 + rnd() * 3, rnd() * 3, rnd() < 0.5 ? "rgba(90,90,110,0.12)" : "rgba(255,255,255,0.15)"); }, [20, 1]) });
  // stepped concrete as one extruded profile
  const prof = new THREE.Shape(); prof.moveTo(0, 0); prof.lineTo(0, wallH); for (let i = 0; i < rows; i++) { prof.lineTo(i * deep + deep, wallH + i * rise); prof.lineTo(i * deep + deep, wallH + (i + 1) * rise); } prof.lineTo(rows * deep + 1.5, wallH + rows * rise); prof.lineTo(rows * deep + 1.5, 0); prof.closePath();
  const standGeo = new THREE.ExtrudeGeometry(prof, { depth: SX * 2, bevelEnabled: false }); standGeo.rotateY(Math.PI / 2); // profile x -> -Z... rotateY(+90) maps x -> -z, extrude z -> x
  standGeo.translate(-SX, 0, z0); const stand = new THREE.Mesh(standGeo, concrete); ink(stand, 0.03); g.add(stand);
  const rowY = (i: number) => wallH + i * rise, rowZ = (i: number) => z0 - i * deep - deep * 0.55;
  // padded front wall with plain panels + top rail, aisles (stairs), vomitory tunnels
  const wallTex = canvasTex(1024, 64, (c) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? "#28406a" : "#2e4a78"; c.fillRect(i * 64, 0, 64, 64); c.fillStyle = "rgba(240,240,250,0.85)"; c.fillRect(i * 64, 44, 64, 6); c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(i * 64, 0, 2, 64); } }, [8, 1]);
  g.add(box(SX * 2, wallH, 0.3, toonN("#c8d4ec", { map: wallTex, shade: 0.55 }), 0, wallH / 2, z0 + 0.16, 0.02));
  const railM = toonN("#c8ccd8", { shade: 0.5, rim: 0.4 }); { const r = cyl(0.04, 0.04, SX * 2, railM, 0, wallH + 0.95, z0 - 0.25, 0.008, 6); r.rotation.z = Math.PI / 2; g.add(r); for (let x = -SX; x <= SX; x += 3) g.add(cyl(0.03, 0.03, 0.95, railM, x, wallH + 0.47, z0 - 0.25, 0, 6)); }
  const aisles = [-44, -30, -15, 0, 15, 30, 44];
  for (const ax of aisles) { const r = cyl(0.03, 0.03, Math.hypot(rows * deep, rows * rise), railM, ax, wallH + rows * rise / 2 + 0.9, z0 - rows * deep / 2, 0.006, 6); r.rotation.x = -Math.atan2(rows * deep, rows * rise); g.add(r);
    for (let i = 0; i < rows; i++) g.add(box(1.1, 0.06, deep * 0.5, toonN("#e8d24a", { shade: 0.6 }), ax, rowY(i) + 0.03, z0 - i * deep - deep * 0.25, 0)); }
  // bench seats (merged, one per row segment)
  const seatM = toonN("#9aa6bc", { shade: 0.55 }); for (let i = 0; i < rows; i++) { const b = box(SX * 2, 0.06, 0.32, seatM, 0, rowY(i) + 0.45, rowZ(i) + 0.18, 0.006); g.add(b); }
  // press box + back wall + roof edge lights on top of the stand
  const topY = wallH + rows * rise, backZ = z0 - rows * deep - 1.5;
  g.add(box(SX * 2 + 2, 2.4, 0.5, concrete, 0, topY + 1.2, backZ, 0.02));
  const pb = new THREE.Group(); pb.add(box(40, 6, 6, toonN("#5a6274", { shade: 0.5 }), 0, 3, 0, 0.03)); pb.add(box(41, 0.4, 7, toonN("#3a4252", { shade: 0.5 }), 0, 6.2, 0, 0.02));
  const winTex = canvasTex(1024, 64, (c) => { c.fillStyle = "#1a1e2a"; c.fillRect(0, 0, 1024, 64); for (let i = 0; i < 26; i++) { const gr = c.createLinearGradient(0, 8, 0, 56); gr.addColorStop(0, "#fff2c8"); gr.addColorStop(1, "#e8b070"); c.fillStyle = rnd() < 0.85 ? gr : "#3a3a50"; c.fillRect(8 + i * 39, 8, 33, 48); for (let k = 0; k < 2; k++) if (rnd() < 0.6) { c.fillStyle = "rgba(40,30,40,0.8)"; c.beginPath(); c.arc(16 + i * 39 + rnd() * 18, 50, 7, Math.PI, 0); c.fill(); } } });
  const pw = new THREE.Mesh(new THREE.PlaneGeometry(38, 2.2), new THREE.MeshBasicMaterial({ map: winTex, toneMapped: false })); pw.position.set(0, 3.4, 3.02); pb.add(noShadow(pw)); pb.position.set(0, topY + 0.2, backZ - 3.2); g.add(pb);
  // stand end walls
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ShapeGeometry(prof), concrete); e.rotation.y = Math.PI / 2; e.position.set(s * SX * 1.0005, 0, z0); if (s < 0) { e.rotation.y = -Math.PI / 2; e.scale.x = -1; } g.add(e); }

  // ---------- the crowd: instanced bodies, heads, raised arms; bob / jump / wave ----------
  const homeCols = ["#3a5688", "#3a5688", "#ecebe4", "#2c4470", "#ecebe4", "#5a74a4"]; const misc = ["#8a3a3a", "#c89a48", "#4a6a4a", "#6a5a8a", "#a8a8b4", "#3a3a44", "#a86a4a", "#d8ccb0", "#5a4a40", "#7a8a9a"];
  const skin = ["#f2c8a8", "#e0aa84", "#b07a58", "#7a5038", "#f6d8bc"]; const hair = ["#2a1e1a", "#5a3a24", "#c89858", "#1a1a1e", "#8a5a3a", "#d8d0c8"];
  type P = { x: number; y: number; z: number; ph: number; mode: number; s: number }; const ppl: P[] = [];
  for (let i = 0; i < rows; i++) for (let x = -SX + 0.4; x < SX - 0.3; x += 0.58) { if (aisles.some((a) => Math.abs(x - a) < 0.7)) continue; if (rnd() < 0.05) continue; ppl.push({ x: x + (rnd() - 0.5) * 0.14, y: rowY(i), z: rowZ(i) + (rnd() - 0.5) * 0.1, ph: rnd() * 6.28, mode: rnd() < 0.42 ? 2 : rnd() < 0.5 ? 1 : 0, s: 0.92 + rnd() * 0.14 }); }
  const N = ppl.length;
  const crowdMat = (rough = false) => new THREE.MeshToonMaterial({ gradientMap: ramp, color: "#ffffff", emissive: "#1c2448", emissiveIntensity: rough ? 0.5 : 0.4 });
  const bodyGeo = new THREE.CylinderGeometry(0.17, 0.22, 0.95, 8); bodyGeo.translate(0, 0.95 / 2 + 0.55, 0);
  const headGeo = new THREE.SphereGeometry(0.115, 10, 8); headGeo.translate(0, 1.66, 0);
  const hairGeo = new THREE.SphereGeometry(0.122, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55); hairGeo.translate(0, 1.68, -0.01);
  const armGeo = new THREE.BoxGeometry(0.09, 0.62, 0.09); armGeo.translate(0, 0.31, 0);
  const bodies = new THREE.InstancedMesh(bodyGeo, crowdMat(), N), heads = new THREE.InstancedMesh(headGeo, crowdMat(), N), hairs = new THREE.InstancedMesh(hairGeo, crowdMat(), N), arms = new THREE.InstancedMesh(armGeo, crowdMat(), N * 2);
  const col = new THREE.Color(); ppl.forEach((p, i) => { const home = Math.abs(p.x) < 40 ? 0.58 : 0.35; const shirt = rnd() < home ? homeCols[(rnd() * homeCols.length) | 0] : misc[(rnd() * misc.length) | 0];
    bodies.setColorAt(i, col.set(shirt)); heads.setColorAt(i, col.set(skin[(rnd() * skin.length) | 0])); hairs.setColorAt(i, col.set(rnd() < 0.2 ? shirt : hair[(rnd() * hair.length) | 0])); arms.setColorAt(i * 2, col.set(shirt)); arms.setColorAt(i * 2 + 1, col.set(shirt)); });
  for (const m of [bodies, heads, hairs, arms]) { m.frustumCulled = false; g.add(m); }
  // ink outlines for the crowd: instanced back-face shells sharing the same instance matrices
  for (const [m, w] of [[bodies, 0.025], [heads, 0.016], [arms, 0.016]] as [THREE.InstancedMesh, number][]) { const sg = smoothNormals(m.geometry); const p = sg.getAttribute("position") as THREE.BufferAttribute, n = sg.getAttribute("normal") as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + n.getX(i) * w, p.getY(i) + n.getY(i) * w, p.getZ(i) + n.getZ(i) * w); // pre-inflated: inkMat programs share one cached width
    const o = new THREE.InstancedMesh(sg, inkMatS(0), m.count); o.instanceMatrix = m.instanceMatrix; o.frustumCulled = false; noShadow(o); g.add(o); }
  // a few plain hand-held cards and foam fingers (no text) + pom-poms
  const cardM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.45, 0.02), crowdMat(), 60); const cardIdx: number[] = []; for (let k = 0; k < 60; k++) { const i = (rnd() * N) | 0; cardIdx.push(i); cardM.setColorAt(k, col.set(["#f2f2ee", "#f2d24a", "#2e5a9a", "#e86a4a"][k % 4])); } cardM.frustumCulled = false; g.add(cardM);
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3();
  const poseCrowd = (t: number) => { ppl.forEach((p, i) => {
      const beat = t * (p.mode === 2 ? 5.2 : 3.1) + p.ph; const jump = p.mode === 2 ? Math.max(0, Math.sin(beat)) * 0.16 : p.mode === 1 ? Math.abs(Math.sin(beat)) * 0.05 : Math.sin(beat * 0.5) * 0.015; const sway = Math.sin(t * 1.7 + p.ph) * 0.06;
      S.setScalar(p.s); Q.setFromEuler(E.set(0.12, 0, sway)); V.set(p.x, p.y + jump, p.z); M4.compose(V, Q, S); bodies.setMatrixAt(i, M4); heads.setMatrixAt(i, M4); hairs.setMatrixAt(i, M4);
      for (const side of [-1, 1]) { const up = p.mode === 2 ? 2.6 + Math.sin(beat + side) * 0.25 : p.mode === 1 ? (side > 0 ? 2.9 + Math.sin(beat * 2) * 0.35 : 0.15) : 0.15; Q.setFromEuler(E.set(0.1, 0, -side * (Math.PI - up))); V.set(p.x + side * 0.2 * p.s, p.y + jump + 1.38 * p.s, p.z); M4.compose(V, Q, S); arms.setMatrixAt(i * 2 + (side > 0 ? 1 : 0), M4); } });
    cardIdx.forEach((i, k) => { const p = ppl[i]; const beat = t * 3 + p.ph; Q.setFromEuler(E.set(0.15, 0, Math.sin(beat) * 0.2)); V.set(p.x, p.y + 2.0 + Math.abs(Math.sin(beat)) * 0.12, p.z + 0.05); M4.compose(V, Q, S.setScalar(1)); cardM.setMatrixAt(k, M4); });
    for (const m of [bodies, heads, hairs, arms, cardM]) m.instanceMatrix.needsUpdate = true; };
  poseCrowd(0);

  // ---------- floodlight towers: lattice pole, lamp bank, glow, light beams ----------
  const towerM = toonN("#6a7080", { shade: 0.5, rim: 0.3 }); const lampM = new THREE.MeshBasicMaterial({ color: "#f4f8ff", toneMapped: false });
  const beamTex = canvasTex(64, 256, (c) => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "rgba(220,235,255,0.55)"); gr.addColorStop(1, "rgba(200,220,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, 64, 256); const h = c.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, "rgba(0,0,0,1)"); h.addColorStop(0.5, "rgba(0,0,0,0)"); h.addColorStop(1, "rgba(0,0,0,1)"); c.globalCompositeOperation = "destination-out"; c.fillStyle = h; c.fillRect(0, 0, 64, 256); });
  const flareT = glow("rgba(235,242,255,1)"); const haloT = glow("rgba(170,195,255,0.7)");
  const tower = (x: number, z: number, h: number) => { const tg = new THREE.Group(); const L = 1.6;
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) tg.add(box(0.14, h, 0.14, towerM, sx * L / 2, h / 2, sz * L / 2, 0.01));
    for (let y = 2; y < h; y += 2.4) { for (const sz of [-1, 1]) { const b = box(L * 1.4, 0.06, 0.06, towerM, 0, y + 1.2, sz * L / 2, 0); b.rotation.z = 0.98 * (Math.floor(y / 2.4) % 2 ? 1 : -1); tg.add(b); } for (const sx of [-1, 1]) { const b = box(0.06, 0.06, L * 1.4, towerM, sx * L / 2, y + 1.2, 0, 0); b.rotation.x = 0.98 * (Math.floor(y / 2.4) % 2 ? 1 : -1); tg.add(b); } }
    const head = new THREE.Group(); head.position.set(0, h + 2.2, 0); head.add(box(9, 4.6, 0.4, towerM, 0, 0, 0, 0.02)); for (let r = 0; r < 3; r++) head.add(box(9.2, 0.12, 0.6, towerM, 0, -2.1 + r * 1.55, 0.3, 0.01));
    for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { const lx = -3.75 + k * 1.5, ly = -1.5 + r * 1.55; const cup = cyl(0.62, 0.5, 0.5, towerM, lx, ly, 0.35, 0.012, 14); cup.rotation.x = Math.PI / 2; head.add(cup); const lens = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), lampM); lens.position.set(lx, ly, 0.62); head.add(noShadow(lens));
      const f = glowSprite(flareT, 2.6, 0.75); f.position.set(lx, ly, 0.9); head.add(f); }
    const halo = glowSprite(haloT, 26, 0.55); halo.position.set(0, 0, 1.5); head.add(halo);
    // aim the lamp bank at the field centre
    tg.position.set(x, 0, z); tg.add(head); head.rotation.order = "YXZ"; head.rotation.set(0.35, Math.atan2(-x, -z), 0);
    // soft additive beams fanning from the lamps to the field
    const beams: THREE.Mesh[] = []; for (let k = 0; k < (z > 0 ? 0 : 4); k++) { const len = Math.hypot(x, z, h) * 0.9; const b = new THREE.Mesh(new THREE.ConeGeometry(6 + k * 2.5, len, 24, 1, true), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, opacity: 0.07, fog: false }));
      b.geometry.translate(0, -len / 2, 0); b.position.set(x, h + 2.2, z); const tgt = new THREE.Vector3((rnd() - 0.5) * 30 - x * 0.2, 0, (rnd() - 0.5) * 20 - z * 0.15); const d = tgt.clone().sub(b.position).normalize(); b.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d); g.add(noShadow(b)); beams.push(b); }
    g.add(tg); return tg; };
  const TH = 38; for (const [x, z] of [[-42, backZ - 14], [42, backZ - 14], [-62, 38], [62, 38]] as [number, number][]) tower(x, z, TH);
  // scoreboard at the west end (plain, no brand): HOME 21  GUEST 17, 4th quarter clock
  const sb = new THREE.Group(); sb.add(box(14, 6.5, 0.8, toonN("#2a2e3a", { shade: 0.5 }), 0, 0, 0, 0.03)); for (const sx of [-4.5, 4.5]) sb.add(box(0.6, 12, 0.6, towerM, sx, -6.5, -0.5, 0.02));
  const sbTex = canvasTex(1024, 448, (c) => { c.fillStyle = "#0c0e14"; c.fillRect(0, 0, 1024, 448); c.textAlign = "center"; c.fillStyle = "#f4f2e8"; c.font = "bold 64px sans-serif"; c.fillText("HOME", 250, 90); c.fillText("GUEST", 774, 90);
    c.fillStyle = "#ffb84a"; c.font = "bold 180px monospace"; c.fillText("21", 250, 270); c.fillText("17", 774, 270); c.fillStyle = "#ff6a4a"; c.font = "bold 90px monospace"; c.fillText("0:42", 512, 400); c.fillStyle = "#f4f2e8"; c.font = "bold 50px sans-serif"; c.fillText("QTR 4", 512, 200); });
  const sbFace = new THREE.Mesh(new THREE.PlaneGeometry(13, 5.7), new THREE.MeshBasicMaterial({ map: sbTex, toneMapped: false })); sbFace.position.z = 0.42; sb.add(noShadow(sbFace)); sb.position.set(-END - 18, 14, -6); sb.rotation.y = Math.PI / 2; g.add(sb);
  // team benches + a few sideline props on the far (-Z) sideline
  for (const s of [-1, 1]) { g.add(box(14, 0.08, 0.45, toonN("#c8ccd8"), s * 14, 0.48, -HALF_W - 2.3, 0.008)); for (let k = 0; k < 5; k++) g.add(box(0.08, 0.48, 0.4, towerM, s * 14 - 6.5 + k * 3.25, 0.24, -HALF_W - 2.3, 0)); }
  for (const s of [-1, 1]) { const cooler = cyl(0.3, 0.3, 0.6, toonN("#e8823a", { shade: 0.55 }), s * 5.5, 0.3, -HALF_W - 1.8, 0.012, 14); g.add(cooler); g.add(cyl(0.31, 0.31, 0.08, toonN("#f2f2ee"), s * 5.5, 0.64, -HALF_W - 1.8, 0.008, 14)); }
  // sideline markers (plain orange pylons at the goal line corners)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const x of [50 * YD, END]) g.add(box(0.1, 0.45, 0.1, toonN("#ff7a2a", { shade: 0.6 }), sx * x, 0.225, sz * HALF_W, 0.006));

  // ---------- sky + lights ----------
  g.add(paintedSky({ zen: "#050817", mid: "#0f1a3a", hor: "#2a3a66", below: "#0a1020", light: new THREE.Vector3(0, 0.25, -1), lightCol: "#3a4c80", lightPow: 3, stars: 0.5 }));
  // floodlit haze: a big soft glow over the stand roofline
  const haze = glowSprite(glow("rgba(120,150,220,0.6)"), 140, 0.35); haze.position.set(0, topY + 10, backZ - 30); g.add(haze);
  // moths / bugs in the light beams near the camera-side towers? keep it clean: a few floating confetti flecks over the stand
  const NC = 220; const cg = new THREE.BufferGeometry(); const c0 = new Float32Array(NC * 3); const cc = new Float32Array(NC * 3); for (let i = 0; i < NC; i++) { c0.set([(rnd() - 0.5) * 90, 2 + rnd() * 16, z0 - rnd() * 26], i * 3); col.set(["#f2f2ee", "#2e5a9a", "#f2d24a"][i % 3]); cc.set([col.r, col.g, col.b], i * 3); }
  cg.setAttribute("position", new THREE.BufferAttribute(c0.slice(), 3)); cg.setAttribute("color", new THREE.BufferAttribute(cc, 3)); const conf = new THREE.Points(cg, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, toneMapped: false })); g.add(conf);
  g.add(new THREE.HemisphereLight("#7a8cd0", "#1a2a1a", 0.9));
  const key = keyLight("#eef4ff", 2.3, new THREE.Vector3(0.25, 0.75, 0.62), 70, new THREE.Vector3(0, 0, -18)); key.shadow.camera.far = 220; key.position.copy(new THREE.Vector3(0, 0, -18)).addScaledVector(new THREE.Vector3(0.25, 0.75, 0.62).normalize(), 110); g.add(key, key.target);
  const back = new THREE.DirectionalLight("#c4d4ff", 1.0); back.position.set(-20, 40, -80); g.add(back);
  const fieldFill = new THREE.DirectionalLight("#e8f0ff", 0.5); fieldFill.position.set(30, 50, 20); g.add(fieldFill);
  const fog = new THREE.Fog("#141c38", 80, 300);
  return {
    group: g, fog,
    update: (t) => { poseCrowd(t); const p = cg.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < NC; i++) { const y = c0[i * 3 + 1] - ((t * (0.6 + (i % 7) * 0.08)) % 18); p.setXYZ(i, c0[i * 3] + Math.sin(t * 1.5 + i) * 0.5, y < 1.8 ? y + 18 : y, c0[i * 3 + 2] + Math.cos(t + i) * 0.3); } p.needsUpdate = true; },
    cams: {
      main: { pos: [-24, 9, 26], look: [4, 7, -32], fov: 50 },
      field: { pos: [1.2, 0.75, -12.5], look: [0, 1.6, -21.5], fov: 44 },
      crowd: { pos: [-2.5, 2.2, -21.5], look: [2.5, 8.5, -36], fov: 46 },
    },
    marks: { mascot: [0, 0, -21.5], crowdFront: [0.6, rowY(0), rowZ(0) - 0.1] },
  };
};
