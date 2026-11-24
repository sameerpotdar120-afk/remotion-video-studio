// "Hale homestead" - our own anime-style farm environment, built entirely in code (no external assets):
// plank house with porch + steps + stone chimney, fence, windmill, barn, hay, trough, rutted dirt yard, grass tufts,
// distant mesas, painted sunset sky dome with sun + clouds. Toon shading + ink outlines to match the characters.
// World: metres. House at the origin, porch facing +Z. The track comes in from +Z. Sun low in the west-south-west (-X, -Z).
import * as THREE from "three";
import { inkMat, smoothNormals, toon } from "./kit";
// environment toon: shaded side goes dusky violet (sunset backlight), lit side stays warm
const toonE = (c: string, o: Parameters<typeof toon>[1] = {}) => toon(c, { shadeTint: "#3d3766", tintAmt: 0.5, ...o });

let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); } return t;
};
const ink = (m: THREE.Mesh, w = 0.025) => { const o = new THREE.Mesh(smoothNormals(m.geometry), inkMat(w)); m.add(o); return m; };
const box = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0, iw = 0.02) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); if (iw) ink(m, iw); return m; };

// ---------- painted (anime background art) textures ----------
const dab = (g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill(); };
const planks = (base: string, dark: string, boards = 10) => canvasTex(512, 512, (g) => {
  const bw = 512 / boards; const c0 = new THREE.Color(base);
  for (let i = 0; i < boards; i++) {
    const v = 0.9 + rnd() * 0.22; const col = c0.clone().multiplyScalar(v);
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#" + col.clone().lerp(new THREE.Color("#ffd9a8"), 0.12).getHexString()); gr.addColorStop(1, "#" + col.clone().multiplyScalar(0.82).getHexString());
    g.fillStyle = gr; g.fillRect(i * bw, 0, bw, 512);
    for (let k = 0; k < 7; k++) { const x = i * bw + 4 + rnd() * (bw - 8); g.strokeStyle = rnd() < 0.6 ? "rgba(70,45,30,0.22)" : "rgba(255,225,180,0.18)"; g.lineWidth = 1 + rnd() * 1.6; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + (rnd() - 0.5) * 8, 170, x + (rnd() - 0.5) * 8, 340, x + (rnd() - 0.5) * 6, 512); g.stroke(); }
    for (let k = 0; k < 3; k++) dab(g, i * bw + rnd() * bw, rnd() * 512, 6 + rnd() * 14, 20 + rnd() * 50, 0, "rgba(60,40,30,0.08)"); // weathering stains
    if (rnd() < 0.45) { const ky = rnd() * 512; dab(g, i * bw + bw / 2, ky, 5, 8, 0, "rgba(50,30,20,0.55)"); dab(g, i * bw + bw / 2 - 1, ky - 2, 2, 3, 0, "rgba(255,220,170,0.35)"); }
    g.fillStyle = dark; g.fillRect(i * bw, 0, 3, 512); g.fillStyle = "rgba(255,226,180,0.35)"; g.fillRect(i * bw + 3, 0, 2, 512); // gap + lit edge
    for (const y of [60, 450]) { dab(g, i * bw + 8, y, 2.2, 2.2, 0, "#2a2020"); dab(g, i * bw + bw - 8, y, 2.2, 2.2, 0, "#2a2020"); }
  }
}, [1, 1]);
const shingles = () => canvasTex(512, 512, (g) => {
  g.fillStyle = "#5a4044"; g.fillRect(0, 0, 512, 512);
  for (let r = 0; r < 16; r++) for (let c = 0; c < 12; c++) { const x = c * 44 + (r % 2) * 22 - 22, y = r * 32; const l = 42 + rnd() * 12;
    const gr = g.createLinearGradient(0, y, 0, y + 30); gr.addColorStop(0, `hsl(${10 + rnd() * 14}, 30%, ${l + 12}%)`); gr.addColorStop(1, `hsl(${255 + rnd() * 20}, 16%, ${l - 4}%)`);
    g.fillStyle = gr; g.beginPath(); g.roundRect(x + 1, y + 1, 42, 30, [2, 2, 6, 6]); g.fill(); g.fillStyle = "rgba(255,200,160,0.25)"; g.fillRect(x + 3, y + 2, 38, 2);
    if (rnd() < 0.08) dab(g, x + 20, y + 20, 10, 5, 0, "rgba(120,140,70,0.45)"); } // a little moss
}, [3, 2]);
const stones = () => canvasTex(256, 512, (g) => {
  g.fillStyle = "#6a5c5a"; g.fillRect(0, 0, 256, 512);
  for (let y = 0; y < 512; y += 36) for (let x = -20; x < 256; x += 52) { const w = 40 + rnd() * 14, ox = (y / 36) % 2 ? 22 : 0, l = 46 + rnd() * 16;
    const gr = g.createRadialGradient(x + ox + w * 0.35, y + 9, 2, x + ox + w / 2, y + 18, w * 0.8); gr.addColorStop(0, `hsl(28, 18%, ${l + 14}%)`); gr.addColorStop(1, `hsl(260, 10%, ${l - 14}%)`);
    g.fillStyle = gr; g.beginPath(); g.roundRect(x + ox, y + 2, w, 31, 10); g.fill(); g.strokeStyle = "#4a3c3c"; g.lineWidth = 2; g.stroke(); }
}, [1, 2]);
const groundTex = () => canvasTex(2048, 2048, (g) => {
  // painted dust: base wash + thousands of soft brush dabs in warm/rose/lavender, ruts with lit crests, pebbles with highlights, grass + flowers at the edges
  const base = g.createLinearGradient(0, 0, 0, 2048); base.addColorStop(0, "#d9ac80"); base.addColorStop(1, "#e7bf92"); g.fillStyle = base; g.fillRect(0, 0, 2048, 2048);
  const pal = ["rgba(241,203,160,0.20)", "rgba(196,140,104,0.18)", "rgba(226,160,140,0.15)", "rgba(170,140,170,0.12)", "rgba(255,226,186,0.22)"];
  for (let i = 0; i < 26000; i++) dab(g, rnd() * 2048, rnd() * 2048, 4 + rnd() * 18, 2 + rnd() * 6, rnd() * 3.14, pal[(rnd() * pal.length) | 0]);
  for (let i = 0; i < 260; i++) { const x = rnd() * 2048, y = rnd() * 2048, r = 40 + rnd() * 160; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rnd() < 0.5 ? "rgba(250,215,170,0.25)" : "rgba(150,105,90,0.18)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  for (const ox of [-46, 46]) { for (const [w, c] of [[30, "rgba(120,78,60,0.35)"], [14, "rgba(95,60,48,0.4)"], [4, "rgba(255,222,180,0.55)"]] as [number, string][]) { g.strokeStyle = c; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(1024 + ox + (w === 4 ? 12 : 0), 2048); g.bezierCurveTo(1024 + ox + 30, 1650, 1024 + ox - 20, 1350, 1024 + ox, 1140); g.stroke(); } }
  const yard = g.createRadialGradient(1024, 1100, 0, 1024, 1100, 360); yard.addColorStop(0, "rgba(160,110,80,0.30)"); yard.addColorStop(1, "rgba(160,110,80,0)"); g.fillStyle = yard; g.fillRect(560, 650, 920, 900);
  for (let i = 0; i < 320; i++) { const x = 1024 + (rnd() - 0.5) * 320, y = 1200 + rnd() * 840; dab(g, x, y, 5, 8, rnd(), "rgba(110,70,55,0.35)"); }
  for (let i = 0; i < 2600; i++) { const x = rnd() * 2048, y = rnd() * 2048, r = 1.5 + rnd() * 3.5; dab(g, x, y + 1, r, r * 0.7, 0, "rgba(90,60,60,0.45)"); dab(g, x, y, r, r * 0.7, 0, "#cfa987"); dab(g, x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.3, 0, "rgba(255,240,215,0.85)"); }
  for (let i = 0; i < 22000; i++) { const x = rnd() * 2048, y = rnd() * 2048; const d = Math.hypot(x - 1024, (y - 1100) * 0.8); if (d < 480 + rnd() * 220 || Math.abs(x - 1024) < 150) continue;
    g.strokeStyle = `hsl(${48 + rnd() * 40}, ${35 + rnd() * 25}%, ${36 + rnd() * 26}%)`; g.lineWidth = 2.2; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (rnd() - 0.5) * 6, y - 8, x + (rnd() - 0.5) * 10, y - 10 - rnd() * 14); g.stroke();
    if (rnd() < 0.02) { dab(g, x, y - 14, 3, 3, 0, rnd() < 0.5 ? "#fff3d0" : "#ffd25a"); dab(g, x, y - 14, 1.2, 1.2, 0, "#e08a2a"); } }
});
const grassCard = (variant = 0) => canvasTex(256, 256, (g) => {
  // anime grass clump: tapered blades, dark olive roots -> golden lit tips, a warm rim on some blades, a few wildflowers
  for (let i = 0; i < 46; i++) {
    const x = 40 + rnd() * 176, top = 30 + rnd() * 120, bend = (rnd() - 0.5) * 70, w = 4 + rnd() * 5;
    const gr = g.createLinearGradient(0, 256, 0, top); gr.addColorStop(0, "#2f3a24"); gr.addColorStop(0.55, variant ? "#7f8a3a" : "#6f8a3c"); gr.addColorStop(1, rnd() < 0.5 ? "#e8d27a" : "#c9c25e");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - w, 256); g.quadraticCurveTo(x + bend * 0.4, (256 + top) / 2, x + bend, top); g.quadraticCurveTo(x + bend * 0.4 + w * 0.3, (256 + top) / 2, x + w, 256); g.closePath(); g.fill();
    if (rnd() < 0.35) { g.strokeStyle = "rgba(255,214,150,0.7)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + w * 0.6, 240); g.quadraticCurveTo(x + bend * 0.4 + w * 0.3, (256 + top) / 2, x + bend, top); g.stroke(); }
  }
  for (let i = 0; i < (variant ? 6 : 2); i++) { const x = 50 + rnd() * 156, y = 60 + rnd() * 90; g.strokeStyle = "#4a5a2a"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 256); g.lineTo(x, y); g.stroke();
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; dab(g, x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 2.5, a, variant ? "#fff4d8" : "#ffcf4a"); } dab(g, x, y, 3, 3, 0, "#e07a2a"); }
});

// ---------- anime sky ----------
export const SUN_DIR = new THREE.Vector3(-0.12, 0.23, -1).normalize();
export type FarmTime = "sunset" | "day" | "night";
const SKY: Record<FarmTime, number[][]> = { sunset: [[0.17, 0.22, 0.52], [0.38, 0.42, 0.78], [0.96, 0.56, 0.62], [1.0, 0.84, 0.6], [1.0, 0.78, 0.5]], day: [[0.22, 0.42, 0.82], [0.42, 0.62, 0.94], [0.72, 0.84, 0.97], [0.93, 0.92, 0.86], [1.0, 0.97, 0.9]], night: [[0.02, 0.03, 0.09], [0.05, 0.07, 0.18], [0.1, 0.12, 0.27], [0.18, 0.18, 0.33], [0.55, 0.62, 0.8]] };
const skyDome = (time: FarmTime = "sunset", sun = SUN_DIR) => { const P = SKY[time].map((c) => new THREE.Vector3(...c));
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { sun: { value: sun }, cZen: { value: P[0] }, cUp: { value: P[1] }, cMid: { value: P[2] }, cHor: { value: P[3] }, cSun: { value: P[4] } },
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform vec3 sun; uniform vec3 cZen, cUp, cMid, cHor, cSun; varying vec3 vD;
      void main(){ float h = clamp(vD.y, -0.1, 1.0); float s = max(dot(vD, sun), 0.0);
        vec3 zen = cZen, upper = cUp, mid = cMid, hor = cHor;
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.14, h)); c = mix(c, upper, smoothstep(0.12, 0.42, h)); c = mix(c, zen, smoothstep(0.42, 0.9, h));
        c = mix(c, cSun, pow(s, 4.0) * 0.55);                 // warm wash around the sun
        c += vec3(1.0,0.7,0.4) * pow(s, 24.0) * 0.5 + vec3(1.0,0.95,0.8) * pow(s, 400.0) * 0.8;
        if (vD.y < 0.0) c = mix(c, cHor * 0.8, smoothstep(0.0, -0.06, vD.y));
        gl_FragColor = vec4(pow(max(c, 0.0), vec3(2.2)), 1.0);
        #include <colorspace_fragment>
      }` });
  return new THREE.Mesh(new THREE.SphereGeometry(400, 64, 32), m);
};
const glowTex = (inner: string, outer: string) => canvasTex(256, 256, (c) => { const gr = c.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, inner); gr.addColorStop(0.25, inner.replace(/[\d.]+\)$/, "0.45)")); gr.addColorStop(1, outer); c.fillStyle = gr; c.fillRect(0, 0, 256, 256); });
const sunDisc = () => { const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(11, 48), new THREE.MeshBasicMaterial({ color: "#fffaf0", depthWrite: false, fog: false, toneMapped: false })); g.add(disc);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(70, 48), new THREE.MeshBasicMaterial({ map: glowTex("rgba(255,236,190,0.95)", "rgba(255,150,90,0)"), transparent: true, depthWrite: false, fog: false, toneMapped: false, blending: THREE.AdditiveBlending, opacity: 0.55 })); halo.position.z = -0.5; g.add(halo);
  // anime light rays: soft wedges fanning out from the sun
  const rays = new THREE.Mesh(new THREE.CircleGeometry(260, 64), new THREE.MeshBasicMaterial({ map: canvasTex(1024, 1024, (c) => { c.translate(512, 512); for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2 + rnd() * 0.1, wdt = 0.02 + rnd() * 0.05; const gr = c.createRadialGradient(0, 0, 20, 0, 0, 512); gr.addColorStop(0, "rgba(255,230,180,0.35)"); gr.addColorStop(1, "rgba(255,200,150,0)"); c.fillStyle = gr; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 512, a, a + wdt); c.closePath(); c.fill(); } }), transparent: true, depthWrite: false, fog: false, toneMapped: false, blending: THREE.AdditiveBlending, opacity: 0.32 }));
  rays.position.z = -1; rays.name = "sunRays"; g.add(rays);
  g.position.copy(SUN_DIR).multiplyScalar(360); g.lookAt(0, 0, 0); return g; };
const cloud = (w: number, nearSun: number) => { const t = canvasTex(1024, 420, (g) => {
    // anime cumulus: soft lumpy silhouette, warm lit top, peach middle, violet underside, gold rim when the sun is behind
    const lobes: [number, number, number][] = []; const n = 8 + ((rnd() * 5) | 0);
    for (let i = 0; i < n; i++) { const u = i / (n - 1); const x = 130 + u * 760 + (rnd() - 0.5) * 30, r = 50 + rnd() * 50 + 70 * Math.sin(Math.PI * u); lobes.push([x, 352 - r * 0.8, r]); }
    for (let i = 0; i < 5; i++) { const x = 260 + rnd() * 500, r = 60 + rnd() * 70; lobes.push([x, 290 - r * 0.9, r]); }
    const shape = () => { g.beginPath(); for (const [x, y, r] of lobes) { g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2); } g.rect(120, 300, 790, 60); };
    g.save(); g.filter = "blur(2px)"; g.shadowColor = `rgba(255,${190 + nearSun * 50},${140 + nearSun * 60},${0.35 + nearSun * 0.5})`; g.shadowBlur = 22 + nearSun * 26; shape(); g.fillStyle = "#e7a3a4"; g.fill(); g.restore();
    g.save(); shape(); g.clip();
    const body = g.createLinearGradient(0, 30, 0, 365); body.addColorStop(0, "#fff0dc"); body.addColorStop(0.35, "#ffc9a6"); body.addColorStop(0.7, "#e99aa4"); body.addColorStop(1, "#9c86b6"); g.fillStyle = body; g.fillRect(0, 0, 1024, 420);
    for (const [x, y, r] of lobes) { g.fillStyle = "rgba(150,110,170,0.16)"; g.beginPath(); g.ellipse(x, y + r * 0.55, r * 0.95, r * 0.5, 0, 0, Math.PI * 2); g.fill(); } // soft shade under each lump
    g.restore();
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.41), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false, toneMapped: false })); };
// painted cottonwood: trunk + branches, foliage clumps dark inside, lit gold-green tops, sunset rim
const treeTex = () => canvasTex(512, 640, (g) => {
  g.strokeStyle = "#4a3428"; g.lineCap = "round"; g.lineWidth = 24; g.beginPath(); g.moveTo(256, 640); g.quadraticCurveTo(250, 470, 262, 330); g.stroke();
  g.lineWidth = 9; for (const [dx, dy] of [[-90, -110], [100, -120], [-40, -170], [60, -60]]) { g.beginPath(); g.moveTo(258, 420); g.quadraticCurveTo(258 + dx * 0.4, 420 + dy * 0.6, 258 + dx, 420 + dy); g.stroke(); }
  // canopy painted from leaf dabs: shaded underside first, lit gold-green crown on top, sunset rim on the outer edge
  const clumps: [number, number, number][] = []; for (let i = 0; i < 9; i++) { const a = rnd() * Math.PI * 2, d = rnd() * 110; clumps.push([256 + Math.cos(a) * d * 1.3, 240 + Math.sin(a) * d * 0.75, 70 + rnd() * 40]); }
  for (const pass of [0, 1, 2]) for (const [cx, cy, r] of clumps) for (let k = 0; k < 140; k++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r; const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.85; const top = (cy - y) / r;
    if (pass === 0) dab(g, x, y + 6, 9, 6, a, "#2c4434");
    if (pass === 1 && top > -0.35) dab(g, x, y, 8, 5, a, top > 0.25 ? "#a8b25a" : "#5f7f48");
    if (pass === 2 && top > 0.45 && rnd() < 0.5) dab(g, x, y, 6, 4, a, d > r * 0.7 ? "#ffd48a" : "#d9d27a");
  }
});
// ---------- buildings ----------
const house = () => {
  const g = new THREE.Group();
  const wall = toonE("#b39272", { map: planks("#b39272", "#5a4232", 14), shade: 0.62 }); const trim = toonE("#6a4e38", { shade: 0.6 });
  const W = 9, D = 6, H = 3.1, base = 0.55;
  const body = box(W, H, D, wall, 0, base + H / 2, 0); (body.material as unknown as THREE.MeshBasicMaterial).map!.repeat.set(3, 1); g.add(body);
  g.add(box(W + 0.3, base, D + 0.3, toonE("#6f6a66", { map: stones(), shade: 0.6 }), 0, base / 2, 0));
  // gable roof
  const roofM = toonE("#c07a5c", { map: shingles(), shade: 0.62 }); const rise = 2.0, over = 0.5;
  for (const sx of [-1, 1]) { const half = Math.hypot(D / 2 + over, rise); const r = box(W + 0.8, 0.16, half, roofM, 0, base + H + rise / 2, sx * (D / 4 + over / 2), 0.025); r.rotation.x = sx * Math.atan2(rise, D / 2 + over); g.add(r); }
  const gable = new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(0, rise)]);
  for (const sx of [-1, 1]) { const gm = new THREE.Mesh(new THREE.ShapeGeometry(gable), wall); gm.rotation.y = Math.PI / 2 * sx; gm.position.set(sx * W / 2 * 1.001, base + H, 0); g.add(gm); }
  // porch: deck, posts, lean-to roof, steps, railing
  const deck = toonE("#7d5f45", { map: planks("#7d5f45", "#3a2a1e", 20), shade: 0.6 });
  const PD = 2.2; g.add(box(W, 0.12, PD, deck, 0, base + 0.06, D / 2 + PD / 2));
  for (const x of [-W / 2 + 0.15, -1.7, 1.7, W / 2 - 0.15]) g.add(box(0.16, 2.7, 0.16, trim, x, base + 1.35, D / 2 + PD - 0.12));
  const pr = box(W + 0.4, 0.12, PD + 0.5, roofM, 0, base + 2.85, D / 2 + PD / 2 + 0.1, 0.02); pr.rotation.x = -0.18; g.add(pr);
  for (let i = 0; i < 3; i++) g.add(box(2.6, base / 3, 0.36, deck, 0, base / 3 * (i + 0.5), D / 2 + PD + 0.18 + (2 - i) * 0.36, 0.015));
  for (const sx of [-1, 1]) { g.add(box(2.4, 0.08, 0.08, trim, sx * 3.0, base + 0.95, D / 2 + PD - 0.12, 0.012)); for (let k = 0; k < 7; k++) g.add(box(0.05, 0.9, 0.05, trim, sx * (2.0 + k * 0.33), base + 0.5, D / 2 + PD - 0.12, 0)); }
  // door + glowing windows
  g.add(box(1.1, 2.15, 0.08, toonE("#3f2c22", { shade: 0.6 }), 0, base + 1.1, D / 2 + 0.03, 0.012));
  const glow = new THREE.MeshBasicMaterial({ color: "#ffd48a", toneMapped: false });
  for (const x of [-2.9, 2.9]) { g.add(box(1.25, 1.1, 0.06, glow, x, base + 1.65, D / 2 + 0.02, 0)); g.add(box(1.4, 0.09, 0.1, trim, x, base + 2.24, D / 2 + 0.05, 0.01)); g.add(box(1.4, 0.09, 0.1, trim, x, base + 1.06, D / 2 + 0.05, 0.01)); g.add(box(0.07, 1.1, 0.09, trim, x, base + 1.65, D / 2 + 0.05, 0)); g.add(box(1.25, 0.06, 0.09, trim, x, base + 1.65, D / 2 + 0.05, 0)); }
  // stone chimney on the right gable
  const ch = box(1.0, 5.6, 0.9, toonE("#b8a898", { map: stones(), shade: 0.66 }), W / 2 + 0.45, 2.8, -0.6); g.add(ch);
  g.add(box(1.2, 0.18, 1.1, toonE("#8a7a70"), W / 2 + 0.45, 5.65, -0.6));
  // porch lantern by the door (warm glow), a bench and two crates
  const lant = box(0.18, 0.28, 0.18, new THREE.MeshBasicMaterial({ color: "#ffd27a", toneMapped: false }), 0.9, base + 2.05, D / 2 + 0.15, 0.008); g.add(lant);
  const lg = new THREE.Mesh(new THREE.CircleGeometry(0.9, 32), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (c) => { const gr = c.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, "rgba(255,210,130,0.85)"); gr.addColorStop(1, "rgba(255,160,80,0)"); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); }), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
  lg.position.set(0.9, base + 2.05, D / 2 + 0.3); g.add(lg);
  g.add(box(1.8, 0.08, 0.45, trim, -2.9, base + 0.5, D / 2 + 0.45, 0.012)); for (const x of [-3.7, -2.1]) g.add(box(0.08, 0.44, 0.4, trim, x, base + 0.27, D / 2 + 0.45, 0));
  g.add(box(0.6, 0.5, 0.6, toonE("#8a6a4a", { map: planks("#8a6a4a", "#4a3424", 4) }), 3.7, base + 0.31, D / 2 + 0.6, 0.012)); g.add(box(0.5, 0.42, 0.5, toonE("#7a5a3e", { map: planks("#7a5a3e", "#4a3424", 4) }), 3.75, base + 0.77, D / 2 + 0.62, 0.012));
  // water barrel + rocking chair silhouette by the porch
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.3, 0.85, 16), toonE("#6a4a32")); barrel.position.set(-W / 2 + 0.7, base + 0.55, D / 2 + 0.5); ink(barrel, 0.015); g.add(barrel);
  return g;
};
const windmill = () => {
  const g = new THREE.Group(); const wood = toonE("#6b5a4a", { shade: 0.6 }); const Hh = 8.5;
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const leg = box(0.12, Hh, 0.12, wood, sx * 0.75, Hh / 2, sz * 0.75, 0.012); leg.rotation.set(sz * 0.08, 0, -sx * 0.08); g.add(leg); }
  for (let y = 1.5; y < Hh; y += 2) { const s = 1 - y / Hh * 0.5; g.add(box(1.6 * s, 0.07, 0.07, wood, 0, y, 0.75 * s, 0)); g.add(box(1.6 * s, 0.07, 0.07, wood, 0, y, -0.75 * s, 0)); g.add(box(0.07, 0.07, 1.6 * s, wood, 0.75 * s, y, 0, 0)); g.add(box(0.07, 0.07, 1.6 * s, wood, -0.75 * s, y, 0, 0)); }
  const hub = new THREE.Group(); hub.position.set(0, Hh + 0.2, 0.45); hub.name = "windmillWheel";
  const blade = toonE("#b9a88c", { shade: 0.6 });
  for (let i = 0; i < 16; i++) { const b = box(0.28, 1.5, 0.03, blade, 0, 0.95, 0, 0.008); const p = new THREE.Group(); p.add(b); p.rotation.z = (i / 16) * Math.PI * 2; b.rotation.y = 0.5; hub.add(p); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.04, 6, 40), wood); hub.add(ring);
  g.add(hub);
  const tail = box(0.05, 0.9, 1.6, toonE("#8a3a2a"), 0, Hh + 0.2, -1.1, 0.01); g.add(tail);
  return g;
};
const barn = () => {
  const g = new THREE.Group(); const red = toonE("#8a3b2c", { map: planks("#8a3b2c", "#4a1e16", 16), shade: 0.6 }); const W = 9, D = 11, H = 4.2;
  const b = box(W, H, D, red, 0, H / 2, 0); (b.material as unknown as THREE.MeshBasicMaterial).map!.repeat.set(3, 1); g.add(b);
  const roofM = toonE("#b06a56", { map: shingles(), shade: 0.62 });
  for (const sx of [-1, 1]) { const r1 = box(2.9, 0.15, D + 0.6, roofM, sx * 3.25, H + 0.75, 0, 0.025); r1.rotation.z = -sx * 0.95; g.add(r1); const r2 = box(2.6, 0.15, D + 0.6, roofM, sx * 1.2, H + 2.0, 0, 0.025); r2.rotation.z = -sx * 0.35; g.add(r2); }
  const gab = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(2.45, 1.45), new THREE.Vector2(0, 2.45), new THREE.Vector2(-2.45, 1.45)]);
  for (const sz of [-1, 1]) { const gm = new THREE.Mesh(new THREE.ShapeGeometry(gab), red); gm.position.set(0, H, sz * D / 2 * 1.001); if (sz < 0) gm.rotation.y = Math.PI; g.add(gm); }
  const white = toonE("#e8dfcf"); g.add(box(3.4, 3.2, 0.08, toonE("#5a2a20"), 0, 1.6, D / 2 + 0.03, 0.012));
  const x1 = box(0.14, 4.3, 0.1, white, 0, 1.6, D / 2 + 0.08, 0); x1.rotation.z = 0.82; g.add(x1); const x2 = box(0.14, 4.3, 0.1, white, 0, 1.6, D / 2 + 0.08, 0); x2.rotation.z = -0.82; g.add(x2);
  return g;
};
const hay = () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.2, 20), toonE("#d6b25e", { map: canvasTex(256, 128, (g) => { g.fillStyle = "#d6b25e"; g.fillRect(0, 0, 256, 128); for (let i = 0; i < 500; i++) { g.strokeStyle = rnd() < 0.5 ? "#a8853a" : "#f0d58a"; g.beginPath(); const x = rnd() * 256, y = rnd() * 128; g.moveTo(x, y); g.lineTo(x + 8, y + (rnd() - 0.5) * 4); g.stroke(); } }) })); m.rotation.z = Math.PI / 2; ink(m, 0.02); return m; };
const fence = (pts: [number, number][], gapAt?: (x: number, z: number) => boolean) => {
  const g = new THREE.Group(); const wood = toonE("#7a6450", { shade: 0.6 });
  for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1]; const L = Math.hypot(x1 - x0, z1 - z0); const n = Math.ceil(L / 2.6);
    for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, z = z0 + (z1 - z0) * k / n; if (gapAt?.(x, z)) continue; const p = box(0.14, 1.35, 0.14, wood, x, 0.67, z, 0.012); p.rotation.y = rnd() * 0.3; g.add(p);
      if (k < n) { const xm = x + (x1 - x0) / n / 2, zm = z + (z1 - z0) / n / 2; if (gapAt?.(xm, zm) || gapAt?.(x + (x1 - x0) / n, z + (z1 - z0) / n)) continue;
        for (const y of [0.55, 1.05]) { const r = box(L / n + 0.1, 0.08, 0.08, wood, xm, y + (rnd() - 0.5) * 0.06, zm, 0.01); r.rotation.y = -Math.atan2(z1 - z0, x1 - x0); g.add(r); } } } }
  return g;
};
const mesa = (w: number, h: number, lit: string, shade: string, haze: number) => { // stepped butte: painted vertex colours (warm sunlit top/edges, violet shadow), hazed by distance
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(-w * 0.38, h * 0.55); sh.lineTo(-w * 0.3, h * 0.6); sh.lineTo(-w * 0.24, h); sh.lineTo(w * 0.22, h); sh.lineTo(w * 0.3, h * 0.62); sh.lineTo(w * 0.4, h * 0.5); sh.lineTo(w / 2, 0); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: w * 0.2, bevelEnabled: false }).toNonIndexed(); geo.computeVertexNormals();
  const pos = geo.getAttribute("position"), nor = geo.getAttribute("normal"); const cols = new Float32Array(pos.count * 3); const L = new THREE.Color(lit), S = new THREE.Color(shade), Hz = new THREE.Color("#f2b9a0");
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / h; const up = Math.max(0, nor.getY(i)); const c = S.clone().lerp(L, Math.min(1, up * 0.8 + y * 0.35)); c.lerp(Hz, haze * (0.6 + 0.4 * (1 - y))); cols.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  const mat = new THREE.ShaderMaterial({ uniforms: { uH: { value: h }, uRim: { value: new THREE.Color("#ffd2a0") }, uHz: { value: haze }, uDim: { value: new THREE.Vector3(1, 1, 1) } }, vertexColors: true, fog: false, toneMapped: false,
    vertexShader: `varying vec3 vC; varying vec3 vP; varying vec3 vN; void main(){ vC = color; vP = position; vN = normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uH; uniform vec3 uRim; uniform float uHz; uniform vec3 uDim; varying vec3 vC; varying vec3 vP; varying vec3 vN; void main(){
      float y = vP.y / uH; float wob = sin(vP.x * 0.21) * 0.06 + sin(vP.x * 0.07 + 1.3) * 0.08;
      float band = smoothstep(0.42, 0.5, fract(y * 6.0 + wob)) * (1.0 - smoothstep(0.82, 0.9, fract(y * 6.0 + wob)));
      vec3 c = vC * (1.0 - band * 0.09 * (1.0 - uHz));                       // horizontal strata
      c = mix(c, uRim, smoothstep(0.9, 1.0, y) * 0.45 * (1.0 - uHz * 0.6));    // sunlit rim along the top
      c = mix(c, c * vec3(0.86, 0.82, 1.0), smoothstep(0.35, 0.0, y) * 0.5);   // cool foot
      gl_FragColor = vec4(pow(max(c * uDim, 0.0), vec3(2.2)), 1.0);
      #include <colorspace_fragment>
      }` });
  return new THREE.Mesh(geo, mat); };

export type Farm = { group: THREE.Group; update: (t: number) => void };
export const FARM_SUN: Record<FarmTime, THREE.Vector3> = { sunset: SUN_DIR, day: new THREE.Vector3(0.45, 0.75, -0.5).normalize(), night: new THREE.Vector3(0.35, 0.42, -0.84).normalize() };
export const buildFarm = (time: FarmTime = "sunset"): Farm => {
  seed = 7; const g = new THREE.Group();
  g.add(skyDome(time, FARM_SUN[time])); const sd = sunDisc(); g.add(sd);
  if (time !== "sunset") { sd.position.copy(FARM_SUN[time]).multiplyScalar(360); sd.lookAt(0, 0, 0); const rays = sd.getObjectByName("sunRays"); if (rays) rays.visible = false;
    sd.scale.setScalar(time === "night" ? 0.7 : 0.6); sd.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined; if (m && !m.map) m.color.set(time === "night" ? "#e8eeff" : "#fffef6"); if (m && m.map) m.opacity = time === "night" ? 0.35 : 0.5; }); }
  if (time === "night") { const sg = new THREE.BufferGeometry(); const sp: number[] = []; for (let i = 0; i < 900; i++) { const a = rnd() * Math.PI * 2, e = 0.08 + rnd() * 1.3; sp.push(Math.cos(e) * Math.sin(a) * 380, Math.sin(e) * 380, Math.cos(e) * Math.cos(a) * 380); } sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3)); g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: "#eef2ff", size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 }))); }
  // clouds in a ring, more of them on the sun side
  for (let i = 0; i < 22; i++) { const a = -Math.PI + (i / 21) * Math.PI * 2 + (rnd() - 0.5) * 0.15; const r = 280 + rnd() * 60; const dirTo = new THREE.Vector3(Math.sin(a), 0, Math.cos(a)); const nearSun = Math.max(0, dirTo.dot(new THREE.Vector3(SUN_DIR.x, 0, SUN_DIR.z).normalize()));
    const c = cloud(80 + rnd() * 110, nearSun); c.position.set(dirTo.x * r, 28 + rnd() * 70, dirTo.z * r); c.lookAt(0, c.position.y * 0.7, 0); g.add(c); }
  // distant mesas (three depth layers, cooler + lighter further away)
  const ring = (n: number, r: number, lit: string, shade: string, haze: number, hMin: number, hMax: number) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + rnd() * 0.3; const m = mesa(30 + rnd() * 50, hMin + rnd() * (hMax - hMin), lit, shade, haze); m.position.set(Math.sin(a) * r, -1, Math.cos(a) * r); m.lookAt(0, 0, 0); g.add(m); } };
  ring(9, 260, "#f2b28c", "#9c86b8", 0.55, 18, 40); ring(11, 190, "#e89a78", "#7d6496", 0.3, 10, 26); ring(13, 130, "#d98a66", "#6a4e78", 0.12, 4, 12);
  // ground
  // ground uses three's own toon material (3-step ramp) so it receives the long sunset shadows
  const ramp = new THREE.DataTexture(new Uint8Array([125, 118, 175, 255, 190, 172, 190, 255, 255, 240, 225, 255]), 3, 1); ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
  const gTex = groundTex(); const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshToonMaterial({ color: "#f0d2a8", map: gTex, gradientMap: ramp, emissive: "#9a86c8", emissiveMap: gTex, emissiveIntensity: 0.42 })); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 10);
  (ground.material as unknown as THREE.MeshBasicMaterial).map!.repeat.set(1, 1); g.add(ground);
  const far = new THREE.Mesh(new THREE.CircleGeometry(400, 64), new THREE.MeshBasicMaterial({ color: "#c89a72" })); far.rotation.x = -Math.PI / 2; far.position.y = -0.05; g.add(far);
  // grass tufts (crossed cards) away from the track + yard
  const gms = [grassCard(0), grassCard(1)].map((t) => new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide }));
  const grassBlades: THREE.Mesh[] = [];
  for (let i = 0; i < 2600; i++) { const x = (rnd() - 0.5) * 130, z = (rnd() - 0.3) * 130; if (Math.abs(x) < 3.8 && z > 4) continue; if (Math.hypot(x, (z - 2) * 0.9) < 13 + rnd() * 7) continue;
    const s = 0.6 + rnd() * 0.9; const m = gms[rnd() < 0.3 ? 1 : 0]; for (const ry of [0, Math.PI / 2]) { const q = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.2, s), m); q.position.set(x, s / 2 - 0.02, z); q.rotation.y = ry + rnd(); g.add(q); grassBlades.push(q); } }
  // painted cottonwoods (billboards) around the homestead
  const tt = treeTex(); const tm = new THREE.SpriteMaterial({ map: tt, transparent: true, alphaTest: 0.3, toneMapped: false });
  for (const [x, z, sc] of [[-24, -18, 13], [-30, -6, 11], [30, -20, 14], [-9, -22, 12], [36, 6, 10], [-38, 18, 9], [44, -2, 9]] as [number, number, number][]) { const t2 = new THREE.Sprite(tm); t2.scale.set(sc * 0.8, sc, 1); t2.position.set(x, sc / 2 - 0.3, z); g.add(t2); }
  // floating dust motes catching the low sun
  const dustGeo = new THREE.BufferGeometry(); const dp = new Float32Array(600 * 3); for (let i = 0; i < 600; i++) dp.set([(rnd() - 0.5) * 40, rnd() * 6, -4 + rnd() * 50], i * 3); dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.07, map: glowTex("rgba(255,236,200,1)", "rgba(255,200,150,0)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.7 })); g.add(dust); const dust0 = dp.slice();
  // buildings + props
  g.add(house());
  const wm = windmill(); wm.position.set(-13, 0, -3); wm.rotation.y = 0.5; g.add(wm);
  const bn = barn(); bn.position.set(17, 0, -9); bn.rotation.y = -0.35; g.add(bn);
  for (const [x, z] of [[11.5, -3], [12.8, -2.2], [12.1, -4.2]]) { const h2 = hay(); h2.position.set(x, 0.75, z); h2.rotation.y = rnd(); g.add(h2); }
  const trough = box(2.2, 0.55, 0.7, toonE("#6a5040", { map: planks("#6a5040", "#3a2a1e", 6) }), -7.5, 0.28, 7.5); g.add(trough); g.add(box(2.0, 0.04, 0.5, new THREE.MeshBasicMaterial({ color: "#7aa3b8" }), -7.5, 0.5, 7.5, 0));
  const GZ = 58; // gate line: far enough back that the gang rides in inside the fence
  g.add(fence([[-22, GZ], [-22, -14], [26, -14], [26, GZ], [-22, GZ]], (x, z) => Math.abs(x) < 4 && z > GZ - 1));
  // ranch gate over the track entrance: two tall posts, crossbar, hanging sign "HALE"
  const gw = toonE("#6a5240", { shade: 0.6 });
  for (const sx of [-1, 1]) g.add(box(0.32, 4.6, 0.32, gw, sx * 4.1, 2.3, GZ, 0.02));
  g.add(box(9.2, 0.32, 0.36, gw, 0, 4.45, GZ, 0.02));
  const sign = box(2.6, 0.75, 0.08, toonE("#8a6a4a", { map: canvasTex(512, 160, (c) => { c.fillStyle = "#8a6a4a"; c.fillRect(0, 0, 512, 160); c.strokeStyle = "#4a3424"; c.lineWidth = 10; c.strokeRect(6, 6, 500, 148); c.fillStyle = "#2a1c14"; c.font = "bold 92px serif"; c.textAlign = "center"; c.fillText("HALE", 256, 115); }) }), 0, 3.55, GZ, 0.012);
  g.add(sign); for (const sx of [-1, 1]) g.add(box(0.03, 0.55, 0.03, toonE("#3a3a3a"), sx * 1.0, 4.05, GZ, 0));
  // atmosphere
  const fog = new THREE.Fog(time === "day" ? "#d9e2ee" : time === "night" ? "#1c2240" : "#f0b49a", time === "night" ? 40 : 70, 330);
  if (time !== "sunset") g.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial & { uniforms?: Record<string, { value: unknown }> } | undefined; if (!m) return;
    if (m.map && m.transparent && (o as THREE.Mesh).geometry?.type === "PlaneGeometry" && (o as THREE.Mesh).position.y > 20) m.color.set(time === "night" ? "#3c4876" : "#ffffff"); // clouds
    if (m.uniforms?.uDim) (m.uniforms.uDim.value as THREE.Vector3).set(...(time === "night" ? [0.22, 0.25, 0.42] : [0.86, 0.9, 1.0]) as [number, number, number]); });
  const wheel = g.getObjectByName("windmillWheel")!;
  g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; const mat = m.material as THREE.Material; if (mat.type === "ShaderMaterial" && (mat as THREE.ShaderMaterial).uniforms?.sun) return;
    const basic = mat.type === "MeshBasicMaterial"; m.receiveShadow = !basic || m === far; m.castShadow = !basic || !!(mat as THREE.MeshBasicMaterial).alphaTest; });
  ground.castShadow = false; far.receiveShadow = false;
  return { group: Object.assign(g, { userData: { fog } }), update: (t) => { wheel.rotation.z = -t * 1.4; const p = dustGeo.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) { p.setY(i, (dust0[i * 3 + 1] + t * 0.12 + Math.sin(t + i) * 0.05) % 6); p.setX(i, dust0[i * 3] + Math.sin(t * 0.5 + i * 0.7) * 0.3); } p.needsUpdate = true; for (const q of grassBlades) q.rotation.z = Math.sin(t * 1.6 + q.position.x * 0.3 + q.position.z * 0.2) * 0.06; } };
};

// toolkit for the other sets (same painterly anime look)
export { toonE, canvasTex, ink, box, dab, planks, shingles, stones, groundTex, grassCard, skyDome, glowTex, sunDisc, cloud, treeTex, house, windmill, barn, hay, fence, mesa, rnd as farmRnd };
