// Shared toolkit for the fort / town / saloon sets: the farm.ts painterly look, but with a resettable seeded rnd
// (each set calls reseed() first, so every render chunk paints identical textures) and daytime sky/cloud/mesa variants.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { toonE, ink, box } from "../farm";
import { smoothNormals } from "../kit";
export { toonE, ink, box, mergeGeometries, smoothNormals };

let seed = 1;
export const reseed = (s: number) => { seed = s; };
export const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); } return t;
};
export const dab = (g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); g.fill(); };
const hex = (c: THREE.Color) => "#" + c.getHexString();

// a mesh that never casts a shadow, even when a viewer sets castShadow = true on everything (glows, glass, light shafts)
export const noShadow = <T extends THREE.Object3D>(o: T) => { o.traverse((c) => Object.defineProperty(c, "castShadow", { get: () => false, set: () => {}, configurable: true })); return o; };
export const noReceive = <T extends THREE.Object3D>(o: T) => { o.traverse((c) => Object.defineProperty(c, "receiveShadow", { get: () => false, set: () => {}, configurable: true })); return o; };

// ---------- painted textures ----------
export const planks = (base: string, dark: string, boards = 10, horiz = false) => canvasTex(512, 512, (g) => {
  if (horiz) { g.translate(512, 0); g.rotate(Math.PI / 2); }
  const bw = 512 / boards; const c0 = new THREE.Color(base);
  for (let i = 0; i < boards; i++) {
    const v = 0.9 + rnd() * 0.22; const col = c0.clone().multiplyScalar(v);
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, hex(col.clone().lerp(new THREE.Color("#ffd9a8"), 0.12))); gr.addColorStop(1, hex(col.clone().multiplyScalar(0.82)));
    g.fillStyle = gr; g.fillRect(i * bw, 0, bw, 512);
    for (let k = 0; k < 7; k++) { const x = i * bw + 4 + rnd() * (bw - 8); g.strokeStyle = rnd() < 0.6 ? "rgba(70,45,30,0.22)" : "rgba(255,225,180,0.18)"; g.lineWidth = 1 + rnd() * 1.6; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + (rnd() - 0.5) * 8, 170, x + (rnd() - 0.5) * 8, 340, x + (rnd() - 0.5) * 6, 512); g.stroke(); }
    for (let k = 0; k < 3; k++) dab(g, i * bw + rnd() * bw, rnd() * 512, 6 + rnd() * 14, 20 + rnd() * 50, 0, "rgba(60,40,30,0.08)");
    if (rnd() < 0.45) { const ky = rnd() * 512; dab(g, i * bw + bw / 2, ky, 5, 8, 0, "rgba(50,30,20,0.55)"); dab(g, i * bw + bw / 2 - 1, ky - 2, 2, 3, 0, "rgba(255,220,170,0.35)"); }
    g.fillStyle = dark; g.fillRect(i * bw, 0, 3, 512); g.fillStyle = "rgba(255,226,180,0.35)"; g.fillRect(i * bw + 3, 0, 2, 512);
    for (const y of [60, 450]) { dab(g, i * bw + 8, y, 2.2, 2.2, 0, "#2a2020"); dab(g, i * bw + bw - 8, y, 2.2, 2.2, 0, "#2a2020"); }
  }
}, [1, 1]);
export const shingles = (hue = 10, sat = 30, light = 42) => canvasTex(512, 512, (g) => {
  g.fillStyle = `hsl(${hue}, ${sat * 0.6}%, ${light * 0.6}%)`; g.fillRect(0, 0, 512, 512);
  for (let r = 0; r < 16; r++) for (let c = 0; c < 12; c++) { const x = c * 44 + (r % 2) * 22 - 22, y = r * 32; const l = light + rnd() * 12;
    const gr = g.createLinearGradient(0, y, 0, y + 30); gr.addColorStop(0, `hsl(${hue + rnd() * 14}, ${sat}%, ${l + 12}%)`); gr.addColorStop(1, `hsl(${255 + rnd() * 20}, 16%, ${l - 4}%)`);
    g.fillStyle = gr; g.beginPath(); g.roundRect(x + 1, y + 1, 42, 30, [2, 2, 6, 6]); g.fill(); g.fillStyle = "rgba(255,220,180,0.25)"; g.fillRect(x + 3, y + 2, 38, 2);
    if (rnd() < 0.06) dab(g, x + 20, y + 20, 10, 5, 0, "rgba(120,140,70,0.4)"); }
}, [3, 2]);
export const stones = (base = "#6a5c5a") => canvasTex(256, 512, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 256, 512);
  for (let y = 0; y < 512; y += 36) for (let x = -20; x < 256; x += 52) { const w = 40 + rnd() * 14, ox = (y / 36) % 2 ? 22 : 0, l = 46 + rnd() * 16;
    const gr = g.createRadialGradient(x + ox + w * 0.35, y + 9, 2, x + ox + w / 2, y + 18, w * 0.8); gr.addColorStop(0, `hsl(28, 18%, ${l + 14}%)`); gr.addColorStop(1, `hsl(260, 10%, ${l - 14}%)`);
    g.fillStyle = gr; g.beginPath(); g.roundRect(x + ox, y + 2, w, 31, 10); g.fill(); g.strokeStyle = "#4a3c3c"; g.lineWidth = 2; g.stroke(); }
}, [1, 2]);
// bark for upright logs: vertical striations, knots, a warm lit stripe (wraps around a cylinder)
export const barkTex = (base = "#7a5a40") => canvasTex(256, 512, (g) => {
  const c0 = new THREE.Color(base); g.fillStyle = base; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 90; i++) { const x = rnd() * 256; const l = 0.75 + rnd() * 0.5; g.strokeStyle = hex(c0.clone().multiplyScalar(l)); g.lineWidth = 2 + rnd() * 6; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + (rnd() - 0.5) * 16, 170, x + (rnd() - 0.5) * 16, 340, x + (rnd() - 0.5) * 10, 512); g.stroke(); }
  g.globalAlpha = 1;
  for (let i = 0; i < 40; i++) { const x = rnd() * 256, y = rnd() * 512; g.strokeStyle = "rgba(40,25,18,0.45)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 4, y + 20 + rnd() * 50); g.stroke(); }
  for (let i = 0; i < 6; i++) { const x = rnd() * 256, y = rnd() * 512; dab(g, x, y, 7, 10, 0, "rgba(45,28,20,0.6)"); dab(g, x - 2, y - 3, 3, 4, 0, "rgba(255,215,170,0.3)"); }
  const lit = g.createLinearGradient(0, 0, 256, 0); lit.addColorStop(0, "rgba(255,220,170,0)"); lit.addColorStop(0.3, "rgba(255,220,170,0.16)"); lit.addColorStop(0.45, "rgba(255,220,170,0)"); g.fillStyle = lit; g.fillRect(0, 0, 256, 512);
  g.fillStyle = "rgba(60,90,50,0.25)"; for (let i = 0; i < 30; i++) dab(g, rnd() * 256, 470 + rnd() * 42, 10, 6, 0, "rgba(70,90,50,0.25)"); // damp foot
});
export const grassCard = (variant = 0, tip = "#e8d27a") => canvasTex(256, 256, (g) => {
  for (let i = 0; i < 46; i++) {
    const x = 40 + rnd() * 176, top = 30 + rnd() * 120, bend = (rnd() - 0.5) * 70, w = 4 + rnd() * 5;
    const gr = g.createLinearGradient(0, 256, 0, top); gr.addColorStop(0, "#2f3a24"); gr.addColorStop(0.55, variant ? "#7f8a3a" : "#6f8a3c"); gr.addColorStop(1, rnd() < 0.5 ? tip : "#c9c25e");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - w, 256); g.quadraticCurveTo(x + bend * 0.4, (256 + top) / 2, x + bend, top); g.quadraticCurveTo(x + bend * 0.4 + w * 0.3, (256 + top) / 2, x + w, 256); g.closePath(); g.fill();
    if (rnd() < 0.35) { g.strokeStyle = "rgba(255,230,170,0.7)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + w * 0.6, 240); g.quadraticCurveTo(x + bend * 0.4 + w * 0.3, (256 + top) / 2, x + bend, top); g.stroke(); }
  }
  for (let i = 0; i < (variant ? 6 : 2); i++) { const x = 50 + rnd() * 156, y = 60 + rnd() * 90; g.strokeStyle = "#4a5a2a"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 256); g.lineTo(x, y); g.stroke();
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; dab(g, x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 2.5, a, variant ? "#fff4d8" : "#ffcf4a"); } dab(g, x, y, 3, 3, 0, "#e07a2a"); }
});
export const glowTex = (inner: string, outer: string) => canvasTex(256, 256, (c) => { const gr = c.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, inner); gr.addColorStop(0.25, inner.replace(/[\d.]+\)$/, "0.45)")); gr.addColorStop(1, outer); c.fillStyle = gr; c.fillRect(0, 0, 256, 256); });
const glowCache = new Map<string, THREE.Texture>();
// additive glow sprite (always faces camera, never casts shadows)
export const glowSprite = (inner: string, outer: string, size: number, opacity = 1) => {
  const k = inner + outer; if (!glowCache.has(k)) glowCache.set(k, glowTex(inner, outer));
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowCache.get(k)!, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity }));
  s.scale.set(size, size, 1); return s;
};
export const clearGlowCache = () => glowCache.clear();
// painted day tree (cottonwood): billboard sprite
export const treeTex = (dark = "#2c4434", mid = "#5f8a48", lit = "#b8c460", rim = "#ffe6a0") => canvasTex(512, 640, (g) => {
  g.strokeStyle = "#4a3428"; g.lineCap = "round"; g.lineWidth = 24; g.beginPath(); g.moveTo(256, 640); g.quadraticCurveTo(250, 470, 262, 330); g.stroke();
  g.lineWidth = 9; for (const [dx, dy] of [[-90, -110], [100, -120], [-40, -170], [60, -60]]) { g.beginPath(); g.moveTo(258, 420); g.quadraticCurveTo(258 + dx * 0.4, 420 + dy * 0.6, 258 + dx, 420 + dy); g.stroke(); }
  const clumps: [number, number, number][] = []; for (let i = 0; i < 9; i++) { const a = rnd() * Math.PI * 2, d = rnd() * 110; clumps.push([256 + Math.cos(a) * d * 1.3, 240 + Math.sin(a) * d * 0.75, 70 + rnd() * 40]); }
  for (const pass of [0, 1, 2]) for (const [cx, cy, r] of clumps) for (let k = 0; k < 140; k++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r; const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.85; const top = (cy - y) / r;
    if (pass === 0) dab(g, x, y + 6, 9, 6, a, dark);
    if (pass === 1 && top > -0.35) dab(g, x, y, 8, 5, a, top > 0.25 ? lit : mid);
    if (pass === 2 && top > 0.45 && rnd() < 0.5) dab(g, x, y, 6, 4, a, d > r * 0.7 ? rim : lit);
  }
});

// ---------- day sky ----------
export const daySky = (sun: THREE.Vector3, o: { zen?: string; upper?: string; hor?: string; warm?: string } = {}) => {
  const C = (s: string) => new THREE.Color(s);
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
    uniforms: { sun: { value: sun }, zen: { value: C(o.zen ?? "#2f63c4") }, upper: { value: C(o.upper ?? "#5d9ae6") }, hor: { value: C(o.hor ?? "#dbe8f2") }, warm: { value: C(o.warm ?? "#ffe2b8") } },
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform vec3 sun, zen, upper, hor, warm; varying vec3 vD;
      void main(){ float h = clamp(vD.y, -0.1, 1.0); float s = max(dot(vD, sun), 0.0);
        vec3 c = mix(hor, upper, smoothstep(0.0, 0.32, h)); c = mix(c, zen, smoothstep(0.3, 0.95, h));
        c = mix(c, warm, (1.0 - smoothstep(0.0, 0.22, h)) * (0.35 + 0.45 * pow(s, 2.0)));   // warm late-afternoon band low on the sun side
        c += vec3(1.0,0.85,0.6) * pow(s, 12.0) * 0.35 + vec3(1.0,0.97,0.88) * pow(s, 300.0) * 0.9;
        if (vD.y < 0.0) c = mix(c, hor * vec3(0.95,0.9,0.85), smoothstep(0.0, -0.06, vD.y));
        gl_FragColor = vec4(c, 1.0); }` });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 64, 32), m); mesh.renderOrder = -10; return noShadow(noReceive(mesh));
};
// soft day cumulus: bright cream top, peach mid (late sun), blue-lavender underside
export const dayCloud = (w: number, warmth: number) => { const t = canvasTex(1024, 420, (g) => {
    const lobes: [number, number, number][] = []; const n = 8 + ((rnd() * 5) | 0);
    for (let i = 0; i < n; i++) { const u = i / (n - 1); const x = 130 + u * 760 + (rnd() - 0.5) * 30, r = 50 + rnd() * 50 + 70 * Math.sin(Math.PI * u); lobes.push([x, 352 - r * 0.8, r]); }
    for (let i = 0; i < 5; i++) { const x = 260 + rnd() * 500, r = 60 + rnd() * 70; lobes.push([x, 290 - r * 0.9, r]); }
    const shape = () => { g.beginPath(); for (const [x, y, r] of lobes) { g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2); } g.rect(120, 300, 790, 60); };
    g.save(); g.filter = "blur(2px)"; shape(); g.fillStyle = "#c9d2ea"; g.fill(); g.restore();
    g.save(); shape(); g.clip();
    const body = g.createLinearGradient(0, 30, 0, 365); body.addColorStop(0, "#ffffff"); body.addColorStop(0.45, warmth > 0.5 ? "#fff2e2" : "#f7f7fb"); body.addColorStop(0.78, "#dfe2f2"); body.addColorStop(1, "#b3bbdc"); g.fillStyle = body; g.fillRect(0, 0, 1024, 420);
    g.filter = "blur(14px)";
    for (const [x, y, r] of lobes) { g.fillStyle = "rgba(150,160,210,0.22)"; g.beginPath(); g.ellipse(x + r * 0.25, y + r * 0.6, r * 0.8, r * 0.42, 0, 0, Math.PI * 2); g.fill(); }
    for (const [x, y, r] of lobes) { g.fillStyle = `rgba(255,${238 + warmth * 6},${214 + warmth * 10},${0.55 + warmth * 0.2})`; g.beginPath(); g.ellipse(x - r * 0.2, y - r * 0.45, r * 0.62, r * 0.36, 0, 0, Math.PI * 2); g.fill(); }
    g.filter = "none";
    g.restore();
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.41), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false, toneMapped: false }));
  return noShadow(noReceive(m)); };
// stepped butte (vertex-painted, hazed toward a sky colour by distance)
export const mesa = (w: number, h: number, lit: string, shade: string, haze: number, hazeCol = "#c9d6ee", rimCol = "#ffe0b0") => {
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(-w * 0.38, h * 0.55); sh.lineTo(-w * 0.3, h * 0.6); sh.lineTo(-w * 0.24, h); sh.lineTo(w * 0.22, h); sh.lineTo(w * 0.3, h * 0.62); sh.lineTo(w * 0.4, h * 0.5); sh.lineTo(w / 2, 0); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: w * 0.2, bevelEnabled: false }).toNonIndexed(); geo.computeVertexNormals();
  const pos = geo.getAttribute("position"), nor = geo.getAttribute("normal"); const cols = new Float32Array(pos.count * 3); const L = new THREE.Color(lit), S = new THREE.Color(shade), Hz = new THREE.Color(hazeCol);
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / h; const up = Math.max(0, nor.getY(i)); const c = S.clone().lerp(L, Math.min(1, up * 0.8 + y * 0.35)); c.lerp(Hz, haze * (0.6 + 0.4 * (1 - y))); cols.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  const mat = new THREE.ShaderMaterial({ uniforms: { uH: { value: h }, uRim: { value: new THREE.Color(rimCol) }, uHz: { value: haze } }, vertexColors: true, fog: false, toneMapped: false,
    vertexShader: `varying vec3 vC; varying vec3 vP; void main(){ vC = color; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uH; uniform vec3 uRim; uniform float uHz; varying vec3 vC; varying vec3 vP; void main(){
      float y = vP.y / uH; float wob = sin(vP.x * 0.21) * 0.06 + sin(vP.x * 0.07 + 1.3) * 0.08;
      float band = smoothstep(0.42, 0.5, fract(y * 6.0 + wob)) * (1.0 - smoothstep(0.82, 0.9, fract(y * 6.0 + wob)));
      vec3 c = vC * (1.0 - band * 0.09 * (1.0 - uHz));
      c = mix(c, uRim, smoothstep(0.9, 1.0, y) * 0.45 * (1.0 - uHz * 0.6));
      c = mix(c, c * vec3(0.86, 0.84, 1.0), smoothstep(0.35, 0.0, y) * 0.5);
      gl_FragColor = vec4(c, 1.0); }` });
  return noShadow(noReceive(new THREE.Mesh(geo, mat))); };
// painted ground with three's toon ramp (receives the long shadows), like the farm
export const groundMat = (tex: THREE.Texture, color = "#f0d2a8", emissive = "#9a86c8", ei = 0.42, ramp: [number, number, number][] = [[125, 118, 175], [190, 172, 190], [255, 240, 225]]) => {
  const r = new THREE.DataTexture(new Uint8Array(ramp.flatMap((c) => [...c, 255])), ramp.length, 1); r.minFilter = r.magFilter = THREE.NearestFilter; r.needsUpdate = true;
  return new THREE.MeshToonMaterial({ color, map: tex, gradientMap: r, emissive, emissiveMap: tex, emissiveIntensity: ei });
};
// grass tufts: crossed cards, returns the blade meshes so update() can sway them
export const tufts = (g: THREE.Group, n: number, place: () => [number, number] | null, mats: THREE.Material[], size = [0.5, 0.9]) => {
  const out: THREE.Mesh[] = []; const geo = new THREE.PlaneGeometry(1.2, 1); geo.translate(0, 0.5, 0);
  for (let i = 0; i < n; i++) { const p = place(); if (!p) continue; const s = size[0] + rnd() * size[1]; const m = mats[rnd() < 0.3 ? 1 : 0];
    for (const ry of [0, Math.PI / 2]) { const q = new THREE.Mesh(geo, m); q.scale.setScalar(s); q.position.set(p[0], -0.02, p[1]); q.rotation.y = ry + rnd(); g.add(q); out.push(q); } }
  return out;
};
// dust motes catching the light
export const dustMotes = (n: number, box3: [number, number, number, number, number, number], color = "rgba(255,236,200,1)", size = 0.07, opacity = 0.7) => {
  const geo = new THREE.BufferGeometry(); const dp = new Float32Array(n * 3); const [x0, y0, z0, x1, y1, z1] = box3;
  for (let i = 0; i < n; i++) dp.set([x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0), z0 + rnd() * (z1 - z0)], i * 3); geo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size, map: glowTex(color, color.replace(/[\d.]+\)$/, "0)")), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity }));
  const base = dp.slice(); const H = y1 - y0;
  const update = (t: number) => { const p = geo.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) { p.setY(i, y0 + ((base[i * 3 + 1] - y0 + t * 0.1 + Math.sin(t + i) * 0.05) % H + H) % H); p.setX(i, base[i * 3] + Math.sin(t * 0.5 + i * 0.7) * 0.25); } p.needsUpdate = true; };
  return { pts, update };
};
// a directional key light + its target, inside the set's group
export const keyLight = (g: THREE.Group, dir: THREE.Vector3, color: string, intensity: number, half: number, dist = 90, center = new THREE.Vector3()) => {
  const L = new THREE.DirectionalLight(color, intensity); L.position.copy(center).addScaledVector(dir, dist); L.target.position.copy(center); g.add(L, L.target);
  L.castShadow = true; L.shadow.mapSize.set(4096, 4096); const c = L.shadow.camera; c.left = -half; c.right = half; c.top = half; c.bottom = -half; c.near = 1; c.far = dist * 2; L.shadow.bias = -0.0004; L.shadow.normalBias = 0.02;
  return L;
};
// merged geometry helper: list of [geometry, matrix] -> one geometry
export const merged = (parts: { geo: THREE.BufferGeometry; m: THREE.Matrix4 }[]) => mergeGeometries(parts.map(({ geo, m }) => { const g2 = geo.index ? geo.toNonIndexed() : geo.clone(); g2.applyMatrix4(m); return g2; }), false)!;
export const M4 = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
// half-ellipse arch in the XY plane (base on y = 0, centred on x = 0, rising to h), d thick: batwing door tops
export const archGeo = (w: number, h: number, d: number) => { const s = new THREE.Shape(); s.moveTo(w / 2, 0); s.absellipse(0, 0, w / 2, h, 0, Math.PI, false); s.lineTo(w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 20 }); geo.translate(0, 0, -d / 2); return geo; };
// a cylinder between two points (ropes, rails, pipes)
export const rod = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 8) => { const d = b.clone().sub(a); const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
// painted text sign board texture (hand-lettered, slightly uneven)
export const signTex = (text: string, o: { w?: number; h?: number; bg?: string; fg?: string; edge?: string; font?: string; shadow?: string } = {}) => canvasTex(o.w ?? 1024, o.h ?? 256, (c) => {
  const W = o.w ?? 1024, H = o.h ?? 256; const bg = new THREE.Color(o.bg ?? "#8a6a4a");
  for (let i = 0; i < 6; i++) { const gr = c.createLinearGradient(0, (H / 6) * i, 0, (H / 6) * (i + 1)); const v = 0.92 + rnd() * 0.14; gr.addColorStop(0, hex(bg.clone().multiplyScalar(v * 1.05))); gr.addColorStop(1, hex(bg.clone().multiplyScalar(v * 0.88))); c.fillStyle = gr; c.fillRect(0, (H / 6) * i, W, H / 6 + 1); c.fillStyle = "rgba(40,25,15,0.4)"; c.fillRect(0, (H / 6) * (i + 1) - 2, W, 2); }
  for (let i = 0; i < 160; i++) { c.strokeStyle = rnd() < 0.5 ? "rgba(60,40,25,0.15)" : "rgba(255,230,190,0.12)"; c.lineWidth = 1 + rnd() * 2; const y = rnd() * H; c.beginPath(); c.moveTo(rnd() * W, y); c.lineTo(rnd() * W, y + (rnd() - 0.5) * 4); c.stroke(); }
  c.strokeStyle = o.edge ?? "#3a2616"; c.lineWidth = H * 0.06; c.strokeRect(H * 0.04, H * 0.04, W - H * 0.08, H - H * 0.08);
  c.font = o.font ?? `bold ${H * 0.62}px Georgia, serif`; c.textAlign = "center"; c.textBaseline = "middle";
  if (o.shadow) { c.fillStyle = o.shadow; c.fillText(text, W / 2 + H * 0.025, H * 0.53 + H * 0.025); }
  c.fillStyle = o.fg ?? "#f2e2b8"; c.fillText(text, W / 2, H * 0.53);
  for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${rnd() < 0.5 ? "60,40,25" : "255,240,210"},${0.05 + rnd() * 0.12})`; c.fillRect(rnd() * W, rnd() * H, 2 + rnd() * 8, 1 + rnd() * 2); } // chipped paint
});
