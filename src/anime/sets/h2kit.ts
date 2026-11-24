// Shared helpers for the cabin / graveyard / campus / stadium sets (same painterly anime look as farm.ts).
import * as THREE from "three";
import { toon } from "../kit";
import { canvasTex, dab } from "../farm";
import { smoothNormals } from "../kit";

// Ink outline that works on static meshes: kit.ts inkMat offsets along objectNormal, which MeshBasicMaterial only declares
// for skinned / env-mapped meshes (so farm.ts ink shells fail to compile on props). This one uses the normal attribute
// and keys the program cache by width (otherwise every width shares the first compiled program).
const inkCache = new Map<string, THREE.MeshBasicMaterial>();
export const inkMatS = (w = 0.02, color = "#1b1416") => { const key = w.toFixed(5) + color; let m = inkCache.get(key); if (m) return m;
  m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", `float inkL = length(normal); vec3 transformed = position + (inkL > 1e-4 ? normal / inkL : vec3(0.0)) * ${w.toFixed(5)};`); };
  m.customProgramCacheKey = () => "inkS" + w.toFixed(5); inkCache.set(key, m); return m; };
export const ink = (m: THREE.Mesh, w = 0.025) => { const o = new THREE.Mesh(smoothNormals(m.geometry), inkMatS(w)); m.add(o); return m; };
export const box = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0, iw = 0.02) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); if (iw) ink(m, iw); return m; };

export const mkRnd = (s: number) => { let seed = s; return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); };
// toon variants: night (shadow goes deep indigo), overcast (grey-violet), day (soft violet like the farm)
export const toonN = (c: string, o: Parameters<typeof toon>[1] = {}) => toon(c, { shadeTint: "#1a1f48", tintAmt: 0.55, ...o });
export const toonO = (c: string, o: Parameters<typeof toon>[1] = {}) => toon(c, { shadeTint: "#55566e", tintAmt: 0.45, ...o });
export const toonD = (c: string, o: Parameters<typeof toon>[1] = {}) => toon(c, { shadeTint: "#4a4478", tintAmt: 0.42, ...o });

// keep a mesh out of the shadow map (glows, light pools, decals): the viewer turns castShadow on for every mesh
const NO_DEPTH = new THREE.ShaderMaterial({ vertexShader: "void main(){ gl_Position = vec4(2.0, 2.0, 2.0, 1.0); }", fragmentShader: "void main(){ discard; }" });
export const noShadow = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { const x = m as THREE.Mesh; if (x.isMesh) { x.customDepthMaterial = NO_DEPTH; x.customDistanceMaterial = NO_DEPTH; } }); return o; };

export const glow = (inner: string, outer = "rgba(0,0,0,0)") => canvasTex(128, 128, (c) => { const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, inner); gr.addColorStop(0.3, inner.replace(/[\d.]+\)$/, "0.35)")); gr.addColorStop(1, outer); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); });
export const glowSprite = (tex: THREE.Texture, size: number, opacity = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, opacity, fog: false })); s.scale.set(size, size, 1); return s; };
// a flat light pool on a floor (additive), e.g. window light spilling onto the porch
export const lightPool = (w: number, d: number, col: string, opacity = 0.5) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: glow(col), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, opacity, polygonOffset: true, polygonOffsetFactor: -4 }));
  m.rotation.x = -Math.PI / 2; return noShadow(m);
};
export const cyl = (rt: number, rb: number, h: number, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0, iw = 0.015, seg = 14) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); if (iw) ink(m, iw); return m; };

// painted sky dome: three-band gradient + optional light source glow + optional stars + optional soft overcast mottling
export const paintedSky = (o: { zen: string; mid: string; hor: string; light?: THREE.Vector3; lightCol?: string; lightPow?: number; stars?: number; mottle?: number; below?: string }) => {
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
    uniforms: { zen: { value: new THREE.Color(o.zen) }, mid: { value: new THREE.Color(o.mid) }, hor: { value: new THREE.Color(o.hor) }, below: { value: new THREE.Color(o.below ?? o.hor) },
      L: { value: (o.light ?? new THREE.Vector3(0, 1, 0)).clone().normalize() }, LC: { value: new THREE.Color(o.lightCol ?? "#000000") }, LP: { value: o.lightPow ?? 8 }, stars: { value: o.stars ?? 0 }, mottle: { value: o.mottle ?? 0 } },
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform vec3 zen, mid, hor, below, L, LC; uniform float LP, stars, mottle; varying vec3 vD;
      float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y), mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
      void main(){ vec3 d = normalize(vD); float h = clamp(d.y, -0.1, 1.0);
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.22, h)); c = mix(c, zen, smoothstep(0.2, 0.85, h));
        float s = max(dot(d, L), 0.0); c += LC * (pow(s, LP) * 0.5 + pow(s, LP * 8.0) * 0.4);
        if (mottle > 0.0) { float n = n3(d * 6.0) * 0.6 + n3(d * 14.0) * 0.3 + n3(d * 30.0) * 0.1; c = mix(c, c * vec3(0.9, 0.9, 0.97), smoothstep(0.45, 0.7, n) * mottle); c = mix(c, c * 1.06 + 0.02, smoothstep(0.55, 0.3, n) * mottle * 0.6); }
        if (stars > 0.0) { vec3 p = d * 220.0; vec3 cell = floor(p); float r = h3(cell);
          if (r > 0.93) { vec3 j = vec3(h3(cell + 3.1), h3(cell + 7.7), h3(cell + 1.9)) - 0.5; float dist = length(fract(p) - 0.5 - j * 0.5);
            float big = step(0.992, r); float st = smoothstep(0.09 + big * 0.1, 0.0, dist) * (0.35 + 0.65 * h3(cell + 11.0));
            c += vec3(0.85, 0.9, 1.0) * st * stars * smoothstep(0.04, 0.35, h) * (1.0 - pow(s, 30.0)); } }
        if (d.y < 0.0) c = mix(c, below, smoothstep(0.0, -0.05, d.y));
        gl_FragColor = vec4(c, 1.0); }` });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 64, 32), m); return noShadow(mesh);
};

// cone pine with a ragged skirt on every tier: toon shaded + inked, reads from any angle
export const pine3D = (h: number, mat: THREE.Material, trunkMat: THREE.Material, rnd: () => number, iw = 0.03) => {
  const g = new THREE.Group(); const tiers = 4; const tr = cyl(h * 0.035, h * 0.05, h * 0.3, trunkMat, 0, h * 0.15, 0, iw * 0.6, 8); g.add(tr);
  for (let i = 0; i < tiers; i++) { const u = i / tiers; const th = h * (0.42 - u * 0.06), r = h * (0.26 - u * 0.055); const geo = new THREE.ConeGeometry(r, th, 18, 2, true);
    const p = geo.getAttribute("position") as THREE.BufferAttribute; for (let k = 0; k < p.count; k++) { const y = p.getY(k); if (y < -th / 2 + 0.001) { const a = Math.atan2(p.getZ(k), p.getX(k)); const zig = (Math.round(a / (Math.PI * 2) * 18) % 2 ? 0.78 : 1.0) * (0.92 + rnd() * 0.16); p.setX(k, p.getX(k) * zig); p.setZ(k, p.getZ(k) * zig); p.setY(k, y - (zig > 0.9 ? th * 0.06 : 0)); } }
    geo.computeVertexNormals(); const c = new THREE.Mesh(geo, mat); c.position.y = h * 0.22 + u * h * 0.2 + th / 2; c.rotation.y = rnd() * 6; ink(c, iw); g.add(c); }
  return g;
};
// painted pine billboard (for the far wood): tiered boughs, dark body, cool rim on the lit (left) side
export const pineTex = (body: string, dark: string, rim: string, rnd: () => number) => canvasTex(256, 512, (g) => {
  g.fillStyle = "#2a1e1a"; g.fillRect(122, 380, 12, 132);
  const tiers = 9; for (let i = 0; i < tiers; i++) { const u = i / (tiers - 1); const y = 470 - u * 420, w = 115 * (1 - u * 0.85) + 8;
    for (const [col, off] of [[dark, 6], [body, 0]] as [string, number][]) { g.fillStyle = col; g.beginPath(); g.moveTo(128, y - 70 - off); const n = 7; for (let k = 0; k <= n; k++) { const x = 128 - w + (2 * w * k) / n; g.lineTo(x, y + off + (k % 2 ? -6 : 8) + rnd() * 6); } g.closePath(); g.fill(); }
    g.strokeStyle = rim; g.lineWidth = 3; g.lineCap = "round"; for (let k = 0; k < 5; k++) { const x = 128 - w * (0.3 + rnd() * 0.65); g.beginPath(); g.moveTo(x, y + 2); g.lineTo(x + 10 + rnd() * 10, y - 14 - rnd() * 10); g.stroke(); } }
  for (let i = 0; i < 260; i++) dab(g, 60 + rnd() * 136, 40 + rnd() * 430, 3, 1.5, rnd() * 3, "rgba(0,0,0,0.12)");
});
// soft grass clump card with a custom palette
export const grassTex = (root: string, midC: string, tips: string[], rnd: () => number, flowers?: string[]) => canvasTex(256, 256, (g) => {
  for (let i = 0; i < 46; i++) { const x = 40 + rnd() * 176, top = 30 + rnd() * 120, bend = (rnd() - 0.5) * 70, w = 4 + rnd() * 5;
    const gr = g.createLinearGradient(0, 256, 0, top); gr.addColorStop(0, root); gr.addColorStop(0.55, midC); gr.addColorStop(1, tips[(rnd() * tips.length) | 0]);
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - w, 256); g.quadraticCurveTo(x + bend * 0.4, (256 + top) / 2, x + bend, top); g.quadraticCurveTo(x + bend * 0.4 + w * 0.3, (256 + top) / 2, x + w, 256); g.closePath(); g.fill(); }
  if (flowers) for (let i = 0; i < 3; i++) { const x = 50 + rnd() * 156, y = 60 + rnd() * 90; g.strokeStyle = root; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 256); g.lineTo(x, y); g.stroke(); for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; dab(g, x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 2.5, a, flowers[i % flowers.length]); } }
});
// all grass cards merged into one swaying mesh (two crossed quads per tuft): cheap to draw, sway via a time uniform
export const grassField = (tex: THREE.Texture, spots: [number, number, number][], rnd: () => number) => {
  const pos: number[] = [], uv: number[] = [], ph: number[] = [], idx: number[] = []; let v = 0;
  for (const [x, z, s] of spots) for (const ry of [0, Math.PI / 2]) { const a = ry + rnd() * 3; const cx = Math.cos(a) * s * 0.6, cz = Math.sin(a) * s * 0.6; const p = x * 0.3 + z * 0.2;
    pos.push(x - cx, -0.02, z - cz, x + cx, -0.02, z + cz, x + cx, s - 0.02, z + cz, x - cx, s - 0.02, z - cz); uv.push(0, 0, 1, 0, 1, 1, 0, 1); ph.push(p, p, p, p); idx.push(v, v + 1, v + 2, v, v + 2, v + 3); v += 4; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.setAttribute("ph", new THREE.Float32BufferAttribute(ph, 1)); geo.setIndex(idx); geo.computeVertexNormals();
  const uT = { value: 0 }; const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide });
  mat.onBeforeCompile = (s) => { s.uniforms.uT = uT; s.vertexShader = "uniform float uT; attribute float ph;\n" + s.vertexShader.replace("#include <begin_vertex>", "vec3 transformed = vec3(position); transformed.x += sin(uT * 1.6 + ph) * 0.06 * uv.y; transformed.z += cos(uT * 1.3 + ph) * 0.04 * uv.y;"); };
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; return { mesh: m, setT: (t: number) => { uT.value = t; } };
};
// three's toon material with a 3-step ramp + emissive lift, for big painted grounds that must receive shadows
export const groundMat = (tex: THREE.Texture, color: string, lift: string, liftAmt: number, ramp: [number, number, number][]) => {
  const r = new THREE.DataTexture(new Uint8Array(ramp.flatMap((c) => [...c, 255])), ramp.length, 1); r.minFilter = r.magFilter = THREE.NearestFilter; r.needsUpdate = true;
  return new THREE.MeshToonMaterial({ color, map: tex, gradientMap: r, emissive: lift, emissiveMap: tex, emissiveIntensity: liftAmt });
};
export const keyLight = (col: string, intensity: number, dir: THREE.Vector3, half = 35, center = new THREE.Vector3()) => {
  const l = new THREE.DirectionalLight(col, intensity); l.position.copy(center).addScaledVector(dir.clone().normalize(), 80); l.target.position.copy(center); l.castShadow = true;
  l.shadow.mapSize.set(4096, 4096); const c = l.shadow.camera; c.left = -half; c.right = half; c.top = half; c.bottom = -half; c.near = 1; c.far = 180; l.shadow.bias = -0.0004; l.shadow.normalBias = 0.02;
  return l;
};
