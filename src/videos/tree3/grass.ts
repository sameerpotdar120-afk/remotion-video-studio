// Samulation #5 tree3 - roadside verge grass + fields (helper 1). Contract: see world.ts.
// - verge grass |x| 4.95..10.4 : instanced clumps of real tapered curved blades (+ seed stalks, weeds, a few flowers)
// - right field x > 10.6        : lush young green wheat (real blades near the camera path, sparser/larger further out)
// - left field  x < -10.6       : freshly ploughed brown soil with furrows parallel to the road (real displaced ridges) + sparse weeds
// - a ground-hugging layer under everything beyond the shoulders with procedural shading (crop rows, tramlines, patchwork,
//   furrows, wind-wave brightness) so the land reads as continuous fields out to the horizon.
// Density follows the camera path (x ~ 9.3, z 150 -> 72, looking -Z): instances are only placed where the camera can see them,
// with density falling off with the closest distance at which the camera ever sees that spot.
import * as THREE from "three";
import { VERGE, FENCE_X, WIND, rng, groundY, Part } from "./world";

/* ------------------------------------------------------------------ helpers ------------------------------------------------------------------ */
const CAMX = 9.3, CAMZ0 = 150, CAMZ1 = 72, HALF = 0.4; // HALF ~ tan(half horizontal fov) at the widest lens (+ margin)

/** closest distance at which the camera sees ground point (x,z); Infinity if never visible */
function seenDist(x: number, z: number): number {
  if (z > CAMZ0 - 1.5) return Infinity;
  const a = Math.abs(x - CAMX);
  if (a > HALF * (CAMZ0 - z) + 1.5) return Infinity;
  const dz = z >= CAMZ1 ? 0 : CAMZ1 - z;
  return Math.max(Math.sqrt(a * a + dz * dz + 1.6), a / HALF);
}

function hash2(x: number, y: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
const fbm2 = (x: number, y: number) => (vnoise(x, y) * 0.62 + vnoise(x * 2.1 + 7.3, y * 2.1 - 3.1) * 0.38);

/** height of the terrain mesh Tree3.tsx builds (PlaneGeometry 6000 x 6000, 300 segs, sampled from groundY - 0.03),
 *  reproduced so our layer never sinks under its coarse triangles. We sit on max(groundY, that). */
function coarseTerrain(x: number, z: number): number {
  const S = 20, X0 = -3000, Z0 = -4100;
  const gx = (x - X0) / S, gz = (z - Z0) / S;
  const ix = Math.floor(gx), iz = Math.floor(gz), u = gx - ix, v = gz - iz;
  const h = (i: number, j: number) => groundY(X0 + i * S, Z0 + j * S) - 0.03;
  const ha = h(ix, iz), hb = h(ix, iz + 1), hc = h(ix + 1, iz + 1), hd = h(ix + 1, iz);
  return u + v <= 1 ? ha + u * (hd - ha) + v * (hb - ha) : hc + (1 - u) * (hb - hc) + (1 - v) * (hd - hc);
}
const surfY = (x: number, z: number) => Math.max(groundY(x, z), coarseTerrain(x, z)) + 0.006;

/* furrow profile of the ploughed field (shared by JS geometry and GLSL) */
const FUR_P = 0.78, FUR_H = 0.16;
function furrow(x: number, z: number): number {
  const s = x / FUR_P, i = Math.floor(s), f = s - i;
  const amp = 0.75 + 0.5 * hash2(i, 991) + 0.25 * (vnoise(i * 0.7, z * 0.35) - 0.5);
  const sh = Math.pow(Math.max(0, Math.sin(Math.PI * f)), 0.8);
  return FUR_H * amp * sh;
}

/* ------------------------------------------------------------------ GLSL ------------------------------------------------------------------ */
const NOISE_GLSL = /* glsl */ `
uniform float uTime;
float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(h12(i), h12(i + vec2(1., 0.)), u.x), mix(h12(i + vec2(0., 1.)), h12(i + vec2(1., 1.)), u.x), u.y); }
const vec2 WDIR = vec2(0.78, -0.626);
// travelling gust field, bands elongated across the wind, rolling along +x / -z at ~4.5 m/s
float gust(vec2 p, float t){
  vec2 q = p - WDIR * t * 4.5;
  float u = dot(q, WDIR), v = dot(q, vec2(-WDIR.y, WDIR.x));
  float g = vn(vec2(u * 0.075, v * 0.028)) * 0.65 + vn(vec2(u * 0.19, v * 0.07) + 5.3) * 0.35;
  return smoothstep(0.2, 0.85, g);
}
`;

type WindOpts = { amp: number; flutter: number; upBias: number; waveBright: number };

/** MeshStandardMaterial with wind sway (grows with height above the instance origin), soft up-biased normals and wave brightness */
function vegMaterial(o: WindOpts & { rough: number }): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: o.rough, metalness: 0, side: THREE.DoubleSide });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTime = WIND;
    s.uniforms.uAmp = { value: o.amp }; s.uniforms.uFlut = { value: o.flutter };
    s.uniforms.uUpBias = { value: o.upBias }; s.uniforms.uWave = { value: o.waveBright };
    s.vertexShader = s.vertexShader
      .replace("#include <common>", `#include <common>\n${NOISE_GLSL}\nuniform float uAmp, uFlut; varying float vGust; varying float vHH;`)
      .replace("#include <project_vertex>", /* glsl */ `
        vec4 ip = vec4(transformed, 1.0);
        vec3 org = vec3(0.0);
        #ifdef USE_INSTANCING
          ip = instanceMatrix * ip; org = instanceMatrix[3].xyz;
        #endif
        vec4 wp4 = modelMatrix * ip;
        vec3 worg = (modelMatrix * vec4(org, 1.0)).xyz;
        float hh = max(wp4.y - worg.y, 0.0);
        float g = gust(worg.xz, uTime);
        float ph = h12(worg.xz * 1.37 + 0.5) * 6.2831;
        float fl = sin(uTime * (4.5 + ph * 0.5) + ph + hh * 2.5) + 0.5 * sin(uTime * 9.1 + ph * 2.0);
        vec2 off = WDIR * (uAmp * hh * hh * (0.3 + 1.2 * g)) + vec2(-WDIR.y, WDIR.x) * (fl * uFlut * hh * hh);
        wp4.xz += off;
        wp4.y -= 0.5 * dot(off, off) / max(hh, 0.05);
        vGust = g; vHH = hh;
        vec4 mvPosition = viewMatrix * wp4;
        gl_Position = projectionMatrix * mvPosition;`);
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", `#include <common>\nuniform float uUpBias, uWave; varying float vGust; varying float vHH;`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n diffuseColor.rgb *= 1.0 + uWave * (vGust - 0.45) * clamp(vHH * 3.0, 0.0, 1.0);`)
      .replace("#include <normal_fragment_begin>", `#include <normal_fragment_begin>
        { vec3 upV = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz); normal = normalize(normal + upV * uUpBias); }`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        totalEmissiveRadiance += diffuseColor.rgb * 0.12 * clamp(vHH * 2.0, 0.0, 1.0);`); // light through thin leaves
  };
  m.customProgramCacheKey = () => `veg-${o.amp}-${o.flutter}-${o.upBias}-${o.waveBright}`;
  return m;
}

/* ------------------------------------------------------------------ geometry ------------------------------------------------------------------ */
class Geo {
  pos: number[] = []; nor: number[] = []; col: number[] = []; idx: number[] = [];
  /** strip along centreline pts with widths ws (0 = single tip vertex) across `side`; colours per point */
  ribbon(pts: THREE.Vector3[], ws: number[], side: THREE.Vector3, cols: THREE.Color[]) {
    const n = pts.length; const base = this.pos.length / 3; const rowStart: number[] = []; const rowCount: number[] = [];
    const t = new THREE.Vector3(), nn = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      t.subVectors(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)]).normalize();
      nn.crossVectors(side, t).normalize();
      rowStart.push(this.pos.length / 3 - base);
      const push = (p: THREE.Vector3) => { this.pos.push(p.x, p.y, p.z); this.nor.push(nn.x, nn.y, nn.z); this.col.push(cols[i].r, cols[i].g, cols[i].b); };
      if (ws[i] <= 0) { push(pts[i]); rowCount.push(1); }
      else { push(pts[i].clone().addScaledVector(side, -ws[i] / 2)); push(pts[i].clone().addScaledVector(side, ws[i] / 2)); rowCount.push(2); }
    }
    for (let i = 0; i < n - 1; i++) {
      const a = base + rowStart[i], b = base + rowStart[i + 1];
      if (rowCount[i] === 2 && rowCount[i + 1] === 2) { this.idx.push(a, a + 1, b, a + 1, b + 1, b); }
      else if (rowCount[i] === 2) { this.idx.push(a, a + 1, b); }
      else if (rowCount[i + 1] === 2) { this.idx.push(a, b + 1, b); }
    }
  }
  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(this.col, 3));
    g.setIndex(this.idx); g.computeBoundingSphere(); g.computeBoundingBox();
    return g;
  }
}

const C = (r: number, g: number, b: number) => new THREE.Color(r, g, b); // linear
const lerpC = (a: THREE.Color, b: THREE.Color, t: number) => a.clone().lerp(b, t);

type BladeSpec = { h: number; w: number; lean: number; droop: number; segs: number; base: THREE.Color; mid: THREE.Color; tip: THREE.Color };
/** one tapered curved blade from (x0,0,z0): leans along `dir`, droops quadratically, flat face toward the lean */
function addBlade(geo: Geo, x0: number, z0: number, dir: number, twist: number, s: BladeSpec) {
  const d = new THREE.Vector3(Math.cos(dir), 0, Math.sin(dir));
  const side = new THREE.Vector3(-d.z, 0, d.x).applyAxisAngle(new THREE.Vector3(0, 1, 0), twist);
  const pts: THREE.Vector3[] = [], ws: number[] = [], cols: THREE.Color[] = [];
  for (let i = 0; i <= s.segs; i++) {
    const t = i / s.segs;
    const horiz = s.h * (s.lean * t + s.droop * t * t);
    const up = s.h * (t - 0.55 * s.droop * t * t * t) * Math.sqrt(Math.max(0.2, 1 - s.lean * s.lean * 0.5));
    pts.push(new THREE.Vector3(x0 + d.x * horiz, up, z0 + d.z * horiz));
    ws.push(i === s.segs ? 0 : s.w * (1 - Math.pow(t, 1.6) * 0.85));
    cols.push(t < 0.5 ? lerpC(s.base, s.mid, t * 2) : lerpC(s.mid, s.tip, (t - 0.5) * 2));
  }
  geo.ribbon(pts, ws, side, cols);
}

/** verge grass clump: K wispy blades */
function grassClump(seed: number, K: number): THREE.BufferGeometry {
  const r = rng(seed); const geo = new Geo();
  for (let k = 0; k < K; k++) {
    const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.07;
    const hue = r();
    const mid = hue < 0.55 ? C(0.085, 0.19, 0.022) : hue < 0.85 ? C(0.12, 0.22, 0.025) : C(0.07, 0.15, 0.03);
    const dry = r() < 0.12;
    const tip = dry ? C(0.36, 0.3, 0.12) : lerpC(mid, C(0.2, 0.33, 0.05), 0.5 + r() * 0.3);
    addBlade(geo, Math.cos(a) * rr, Math.sin(a) * rr, a + (r() - 0.5) * 1.2, (r() - 0.5) * 0.8, {
      h: 0.45 + 0.55 * r(), w: 0.006 + 0.007 * r(), lean: 0.1 + 0.35 * r(), droop: 0.1 + 0.45 * r(), segs: 3,
      base: C(0.022, 0.04, 0.01), mid, tip,
    });
  }
  return geo.build();
}

/** young wheat plant: a few broad arching leaves from one point, vivid slightly blue-green */
function wheatClump(seed: number, K: number): THREE.BufferGeometry {
  const r = rng(seed); const geo = new Geo();
  for (let k = 0; k < K; k++) {
    const a = (k / K) * Math.PI * 2 + r() * 0.8, rr = r() * 0.02;
    const mid = lerpC(C(0.08, 0.2, 0.03), C(0.11, 0.23, 0.035), r());
    addBlade(geo, Math.cos(a) * rr, Math.sin(a) * rr, a, (r() - 0.5) * 0.5, {
      h: 0.55 + 0.45 * r(), w: 0.011 + 0.007 * r(), lean: 0.15 + 0.3 * r(), droop: 0.25 + 0.4 * r(), segs: 3,
      base: C(0.03, 0.06, 0.012), mid, tip: lerpC(mid, C(0.17, 0.3, 0.06), 0.6),
    });
  }
  return geo.build();
}

/** tall seed-head stalks (timothy / brome-like) */
function seedClump(seed: number): THREE.BufferGeometry {
  const r = rng(seed); const geo = new Geo();
  for (let k = 0; k < 3; k++) {
    const a = r() * Math.PI * 2, x0 = Math.cos(a) * 0.03, z0 = Math.sin(a) * 0.03;
    const H = 0.7 + 0.35 * r(), lean = 0.06 + 0.12 * r(), dir = r() * Math.PI * 2;
    const d = new THREE.Vector3(Math.cos(dir), 0, Math.sin(dir));
    const stemC = [C(0.05, 0.08, 0.02), C(0.13, 0.17, 0.05), C(0.24, 0.24, 0.1)];
    const pts: THREE.Vector3[] = [], ws: number[] = [], cols: THREE.Color[] = [];
    const P = (t: number) => new THREE.Vector3(x0 + d.x * H * lean * t * t, H * t, z0 + d.z * H * lean * t * t);
    for (let i = 0; i <= 3; i++) { const t = (i / 3) * 0.86; pts.push(P(t)); ws.push(0.0035); cols.push(stemC[Math.min(2, i)]); }
    const side = new THREE.Vector3(-d.z, 0, d.x);
    geo.ribbon(pts, ws, side, cols);
    // head: two crossed spindles
    const headC = r() < 0.5 ? C(0.3, 0.27, 0.13) : C(0.2, 0.22, 0.09);
    for (const rot of [0, Math.PI / 2]) {
      const sd = side.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
      const hp: THREE.Vector3[] = [], hw: number[] = [], hc: THREE.Color[] = [];
      for (let i = 0; i <= 3; i++) { const t = 0.84 + 0.16 * (i / 3); hp.push(P(t)); hw.push(i === 3 ? 0 : 0.014 * Math.sin(Math.PI * (0.25 + 0.75 * i / 3))); hc.push(headC.clone().multiplyScalar(0.8 + 0.3 * i / 3)); }
      geo.ribbon(hp, hw, sd, hc);
    }
  }
  return geo.build();
}

/** broadleaf weed rosette (plantain / dock-like), optional flower (dandelion yellow or yarrow white) */
function weedClump(seed: number, flower: 0 | 1 | 2): THREE.BufferGeometry {
  const r = rng(seed); const geo = new Geo(); const K = 5 + Math.floor(r() * 3);
  for (let k = 0; k < K; k++) {
    const a = (k / K) * Math.PI * 2 + r() * 0.5, d = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const L = 0.16 + 0.14 * r(), up = 0.35 + 0.4 * r(), w = 0.045 + 0.03 * r();
    const pts: THREE.Vector3[] = [], ws: number[] = [], cols: THREE.Color[] = [];
    for (let i = 0; i <= 4; i++) {
      const t = i / 4; pts.push(new THREE.Vector3(d.x * L * t, L * (up * t - 0.35 * up * t * t) + 0.01, d.z * L * t));
      ws.push(i === 4 ? 0 : w * Math.sin(Math.PI * (0.12 + 0.88 * t)));
      cols.push(lerpC(C(0.03, 0.06, 0.02), C(0.07, 0.15, 0.045), t));
    }
    geo.ribbon(pts, ws, new THREE.Vector3(-d.z, 0, d.x), cols);
  }
  if (flower) {
    const H = flower === 1 ? 0.28 + 0.1 * r() : 0.55 + 0.15 * r();
    geo.ribbon([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.01, H * 0.5, 0), new THREE.Vector3(0.02, H, 0.01)], [0.004, 0.004, 0.004], new THREE.Vector3(1, 0, 0), [C(0.04, 0.08, 0.02), C(0.06, 0.11, 0.03), C(0.07, 0.12, 0.03)]);
    const fc = flower === 1 ? C(0.85, 0.55, 0.02) : C(0.75, 0.74, 0.66);
    const R = flower === 1 ? 0.02 : 0.045;
    for (const rot of [0, Math.PI / 3, (2 * Math.PI) / 3]) {   // flat-ish head from 3 crossed petals strips
      const sd = new THREE.Vector3(Math.cos(rot), 0, Math.sin(rot));
      const pd = new THREE.Vector3(-sd.z, 0.25, sd.x).normalize();
      geo.ribbon([new THREE.Vector3(0.02, H + 0.003, 0.01).addScaledVector(pd, -R), new THREE.Vector3(0.02, H + 0.008, 0.01), new THREE.Vector3(0.02, H + 0.003, 0.01).addScaledVector(pd, R)],
        [R * 0.9, R * 2, R * 0.9], sd, [fc, fc, fc]);
    }
  }
  return geo.build();
}

/* ------------------------------------------------------------------ scattering ------------------------------------------------------------------ */
type Inst = { x: number; z: number; y: number; rot: number; sxz: number; sy: number; tilt: number; c: THREE.Color };
class Batch {
  chunks = new Map<string, Inst[]>();
  constructor(public geos: THREE.BufferGeometry[], public mat: THREE.Material, public chunk = 16) {}
  add(i: Inst, variant: number) {
    const key = `${variant}:${Math.floor(i.x / this.chunk)}:${Math.floor(i.z / this.chunk)}`;
    let a = this.chunks.get(key); if (!a) { a = []; this.chunks.set(key, a); } a.push(i);
  }
  build(root: THREE.Object3D): { tris: number; inst: number } {
    let tris = 0, inst = 0;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
    const keys = [...this.chunks.keys()].sort();
    for (const key of keys) {
      const list = this.chunks.get(key)!; const v = Number(key.split(":")[0]); const geo = this.geos[v];
      const im = new THREE.InstancedMesh(geo, this.mat, list.length);
      list.forEach((it, k) => {
        e.set(it.tilt * Math.cos(it.rot * 3.1), it.rot, it.tilt * Math.sin(it.rot * 2.3)); q.setFromEuler(e);
        m.compose(p.set(it.x, it.y, it.z), q, s.set(it.sxz, it.sy, it.sxz)); im.setMatrixAt(k, m); im.setColorAt(k, it.c);
      });
      im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.computeBoundingSphere(); if (im.boundingSphere) im.boundingSphere.radius += 0.8;
      im.receiveShadow = true; im.castShadow = false; root.add(im);
      tris += (geo.index!.count / 3) * list.length; inst += list.length;
    }
    return { tris, inst };
  }
}

/** iterate cells over a rectangle, emitting Poisson-ish samples with expected density dens(x,z) (per m^2) */
function scatter(x0: number, x1: number, z0: number, z1: number, cell: number, r: () => number,
  dens: (x: number, z: number) => number, emit: (x: number, z: number, d: number) => void) {
  for (let z = z0; z < z1; z += cell) for (let x = x0; x < x1; x += cell) {
    const d = dens(x + cell / 2, z + cell / 2); if (d <= 0) continue;
    const n = d * cell * cell; let k = Math.floor(n); if (r() < n - k) k++;
    for (let i = 0; i < k; i++) emit(x + r() * cell, z + r() * cell, d);
  }
}

/* ------------------------------------------------------------------ ground layer ------------------------------------------------------------------ */
const GROUND_FS = /* glsl */ `
varying vec3 vWPos;
float fbm3(vec2 p){ return vn(p) * 0.55 + vn(p * 2.07 + 11.3) * 0.3 + vn(p * 4.3 - 7.1) * 0.15; }
float aaLine(float x, float period, float halfw, float fw){ float d = abs(fract(x / period + 0.5) - 0.5) * period; return 1.0 - smoothstep(halfw - fw, halfw + fw, d); }
float furrowH(float x, float z){
  float s = x / ${FUR_P.toFixed(3)}; float i = floor(s), f = fract(s);
  float amp = 0.75 + 0.5 * h12(vec2(i, 991.0) * 0.731) + 0.25 * (vn(vec2(i * 0.7, z * 0.35)) - 0.5);
  return amp * pow(max(sin(3.14159 * f), 0.0), 0.8);
}
vec3 groundColor(vec3 wp, out float soil, out vec3 nW){
  vec2 p = wp.xz; float ax = abs(p.x); nW = vec3(0.0, 1.0, 0.0); soil = 0.0;
  float dc = distance(cameraPosition.xz, p);
  // verge thatch: dark green with dry patches, under the grass blades
  float n1 = fbm3(p * 1.3), n2 = vn(p * 0.25);
  vec3 verge = mix(vec3(0.035, 0.07, 0.015), vec3(0.09, 0.08, 0.04), smoothstep(0.55, 0.85, n1) * 0.55) * (0.8 + 0.4 * n2);
  if (ax < ${(FENCE_X + 0.2).toFixed(2)}) return verge;
  float fw = fwidth(p.x);
  if (p.x > 0.0) {
    // young wheat canopy: patchwork of fields, rows along z, tramlines, wind waves
    vec2 cellId = floor((p + vec2(vn(p * 0.01) * 60.0, vn(p * 0.012 + 3.0) * 60.0)) / vec2(380.0, 520.0));
    float fh = h12(cellId + 0.37);
    vec3 a = mix(vec3(0.07, 0.17, 0.025), vec3(0.1, 0.2, 0.03), fh);
    vec3 b = mix(vec3(0.11, 0.21, 0.03), vec3(0.075, 0.15, 0.03), fh);
    vec3 c = mix(a, b, smoothstep(0.3, 0.75, fbm3(p * 0.02 + 3.1)));
    c *= 0.86 + 0.28 * fbm3(p * 0.18);
    c *= 0.9 + 0.2 * vn(p * vec2(0.6, 0.08));
    float rows = 0.5 + 0.5 * cos(6.2831 * p.x / 0.17);
    c *= mix(0.72 + 0.28 * rows, 0.9, smoothstep(0.25, 0.7, fw / 0.17));
    float tram = aaLine(p.x - 13.0, 24.0, 0.25, fw) + aaLine(p.x - 14.8, 24.0, 0.25, fw);
    c = mix(c, c * vec3(1.15, 1.05, 0.8) * 0.85, clamp(tram, 0.0, 1.0) * 0.6);
    float g = gust(p, uTime);
    c *= 1.0 + 0.3 * (g - 0.45);
    c *= mix(0.6, 1.0, smoothstep(4.0, 45.0, dc));   // near: we see down between leaves (darker)
    return c;
  }
  // ploughed soil on the left: furrows parallel to the road
  soil = 1.0;
  float fh = furrowH(p.x, p.y);
  vec3 dark = vec3(0.075, 0.048, 0.027), light = vec3(0.19, 0.13, 0.078);
  float clod = fbm3(p * vec2(4.0, 2.2));
  vec3 c = mix(dark, light, clamp(fh * 0.75 + clod * 0.35 - 0.1, 0.0, 1.0));
  c *= 0.82 + 0.36 * fbm3(p * 0.03 + 9.0);
  float fade = smoothstep(0.15, 0.5, fw / ${FUR_P.toFixed(3)});
  c = mix(c, (dark + light) * 0.48 * (0.82 + 0.36 * fbm3(p * 0.03 + 9.0)), fade);
  float e = 0.02; float dh = (furrowH(p.x + e, p.y) - furrowH(p.x - e, p.y)) / (2.0 * e) * ${FUR_H.toFixed(3)};
  nW = normalize(vec3(-dh * (1.0 - fade), 1.0, 0.0));
  // sparse weed specks
  float wd = step(0.93, h12(floor(p * 3.0) + 0.5)) * (1.0 - fade);
  c = mix(c, vec3(0.06, 0.12, 0.03), wd * 0.7);
  return c;
}
`;

function groundMaterial(opts: { proceduralNormal: boolean; discardPlough: boolean }): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0 });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTime = WIND;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", `#include <common>\n${NOISE_GLSL}\n${GROUND_FS}\nfloat gSoil; vec3 gNW;`)
      .replace("#include <color_fragment>", `#include <color_fragment>
        ${opts.discardPlough ? `if (vWPos.x < -10.5 && vWPos.x > ${PLOUGH_X1.toFixed(1)} && vWPos.z < ${PLOUGH_Z0.toFixed(1)} && vWPos.z > ${PLOUGH_Z1.toFixed(1)}) discard;` : ""}
        diffuseColor.rgb = groundColor(vWPos, gSoil, gNW);`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
        ${opts.proceduralNormal ? "if (gSoil > 0.5) normal = normalize((viewMatrix * vec4(gNW, 0.0)).xyz);" : ""}`)
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(0.85, 1.0, gSoil);");
  };
  m.customProgramCacheKey = () => `ground-${opts.proceduralNormal}-${opts.discardPlough}`;
  return m;
}

/** ground-hugging layer on one side (sx = +1 / -1), from the shoulder edge to the horizon */
function groundLayer(sx: number, mat: THREE.Material): THREE.Mesh {
  const xs: number[] = []; for (let x = VERGE[0]; x < 12; x += 0.25) xs.push(x);
  let step = 0.5; for (let x = 12; x < 3000; x += step) { xs.push(x); step *= 1.07; } xs.push(3000);
  const zs: number[] = []; let zs0 = 400;
  for (let z = zs0; z > 170; z -= 8) zs.push(z);
  for (let z = 170; z > -100; z -= 2) zs.push(z);
  step = 2; for (let z = -100; z > -2600; z -= step) { zs.push(z); step = Math.min(step * 1.05, 60); } zs.push(-2600);
  const pos: number[] = [], idx: number[] = [];
  for (const z of zs) for (const ax of xs) { const x = sx * ax; pos.push(x, surfY(x, z), z); }
  const W = xs.length;
  for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < W - 1; i++) {
    const a = j * W + i, b = a + 1, c = a + W, d = c + 1;
    if (sx > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, mat); mesh.receiveShadow = true; return mesh;
}

/* ploughed field near strip with real displaced furrows */
const PLOUGH_X1 = -70, PLOUGH_Z0 = 130, PLOUGH_Z1 = -700;
function ploughMesh(mat: THREE.Material): THREE.Mesh {
  const xs: number[] = []; for (let x = -10.55; x > PLOUGH_X1; x -= FUR_P / 8) xs.push(x);
  const zs: number[] = []; for (let z = PLOUGH_Z0; z > PLOUGH_Z1; z -= z > -150 ? 1.5 : 4) zs.push(z);
  const pos: number[] = [], idx: number[] = [];
  for (const z of zs) for (const x of xs) {
    const edge = Math.min(1, (-10.55 - x) / 0.6);   // ramp up from the fence-line headland
    pos.push(x, surfY(x, z) + 0.004 + furrow(x, z) * edge, z);
  }
  const W = xs.length;
  for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < W - 1; i++) { const a = j * W + i, b = a + 1, c = a + W, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, mat); mesh.receiveShadow = true; return mesh;
}

/* ------------------------------------------------------------------ build ------------------------------------------------------------------ */
export const GRASS_STATS = { grassTris: 0, fieldTris: 0, groundTris: 0, instances: 0 };

export async function buildGrass(): Promise<Part> {
  const root = new THREE.Group(); root.name = "grass+fields";
  const r = rng(51723);

  // ground layers
  const gMat = groundMaterial({ proceduralNormal: true, discardPlough: true });
  const pMat = groundMaterial({ proceduralNormal: false, discardPlough: false });
  const layers = [groundLayer(1, gMat), groundLayer(-1, gMat), ploughMesh(pMat)];
  for (const l of layers) { root.add(l); GRASS_STATS.groundTris += l.geometry.index!.count / 3; }

  // materials + geometry variants
  const grassMat = vegMaterial({ amp: 0.5, flutter: 0.05, upBias: 0.9, waveBright: 0.18, rough: 0.7 });
  const wheatMat = vegMaterial({ amp: 0.42, flutter: 0.035, upBias: 1.0, waveBright: 0.35, rough: 0.62 });
  const extraMat = vegMaterial({ amp: 0.3, flutter: 0.05, upBias: 0.5, waveBright: 0.1, rough: 0.75 });
  const grass = new Batch([grassClump(11, 9), grassClump(12, 9), grassClump(13, 9)], grassMat);
  const wheat = new Batch([wheatClump(21, 6), wheatClump(22, 6), wheatClump(23, 6)], wheatMat, 24);
  const extra = new Batch([seedClump(31), seedClump(32), weedClump(41, 0), weedClump(42, 1), weedClump(43, 2)], extraMat);

  const tint = new THREE.Color();
  // ---- verge grass (both sides)
  const G0 = 95, GR = 6.5;                       // clumps per m^2 near the camera, falloff radius
  const vergeDens = (x: number, z: number) => {
    const d = seenDist(x, z); if (!isFinite(d) || d > 420) return 0;
    return G0 * Math.min(1, (GR / d) ** 2) + (d < 60 ? 0.25 : 0);
  };
  for (const sx of [1, -1]) {
    scatter(VERGE[0] + 0.05, FENCE_X + 0.15, -400, 160, 0.5, r, (ax, z) => vergeDens(sx * ax, z), (ax, z, dn) => {
      const x = sx * ax;
      const spread = Math.min(3.2, Math.sqrt(G0 / dn));
      const patch = fbm2(x * 0.35, z * 0.35), patch2 = vnoise(x * 0.09 + 40, z * 0.09);
      // shorter near the road (mown strip), tall and wispy toward the fence
      const mow = 0.6 + 0.4 * Math.min(1, Math.max(0, (ax - 5.4) / 1.6));
      const h = (0.42 + 0.28 * patch + 0.12 * r()) * mow;             // clump template ~0.45-1.0 m -> real 0.2-0.7 m
      const yel = Math.max(0, patch2 - 0.55) * 1.6;
      tint.setRGB(0.88 + 0.22 * yel + 0.12 * r(), 0.92 + 0.1 * r(), 0.82 - 0.25 * yel + 0.1 * r());
      grass.add({ x, z, y: surfY(x, z) - 0.02, rot: r() * 6.283, sxz: spread * (0.8 + 0.4 * r()), sy: h * (1 + (spread - 1) * 0.08), tilt: (r() - 0.5) * 0.25, c: tint.clone() }, Math.floor(r() * 3));
      const d = seenDist(x, z);
      if (d < 45 && r() < 0.035) {   // seed stalks + weeds near the camera
        const v = 2 + Math.floor(r() * 3);
        extra.add({ x: x + (r() - 0.5) * 0.3, z: z + (r() - 0.5) * 0.3, y: surfY(x, z) - 0.02, rot: r() * 6.283, sxz: 1, sy: 0.75 + 0.35 * r(), tilt: 0, c: new THREE.Color(1, 1, 1) }, v);
      }
      if (d < 60 && r() < 0.05 && ax > 6.2) {
        extra.add({ x, z, y: surfY(x, z) - 0.02, rot: r() * 6.283, sxz: 1, sy: (0.7 + 0.3 * r()) * mow, tilt: 0.1, c: new THREE.Color(1, 1, 1) }, Math.floor(r() * 2));
      }
    });
  }

  // ---- right field: young green wheat
  const W0 = 70, WR = 7;
  const wheatDens = (x: number, z: number) => {
    const d = seenDist(x, z); if (!isFinite(d) || d > 180) return 0;
    return W0 * Math.min(1, (WR / d) ** 2.2);
  };
  scatter(FENCE_X + 0.25, 140, -260, 160, 1, r, wheatDens, (x, z, dn) => {
    const spread = Math.min(3.0, Math.sqrt(W0 / dn));
    const patch = fbm2(x * 0.08, z * 0.08);
    tint.setRGB(0.9 + 0.15 * patch + 0.08 * r(), 0.95 + 0.1 * r(), 0.9 + 0.1 * r());
    wheat.add({ x, z, y: surfY(x, z) - 0.02, rot: r() * 6.283, sxz: spread * (0.85 + 0.3 * r()), sy: (0.48 + 0.1 * patch + 0.08 * r()) * (1 + (spread - 1) * 0.1), tilt: (r() - 0.5) * 0.15, c: tint.clone() }, Math.floor(r() * 3));
  });

  // ---- left ploughed field: sparse weeds in the furrows
  scatter(-60, -10.8, -500, 120, 2, r, (x, z) => { const d = seenDist(x, z); return isFinite(d) && d < 260 ? 0.12 : 0; }, (x, z) => {
    extra.add({ x, z, y: surfY(x, z) + 0.02, rot: r() * 6.283, sxz: 1.3, sy: 0.6 + 0.5 * r(), tilt: 0, c: new THREE.Color(0.9, 1, 0.85) }, 2 + Math.floor(r() * 2));
  });

  const sg = grass.build(root), sw = wheat.build(root), se = extra.build(root);
  GRASS_STATS.grassTris = sg.tris + se.tris; GRASS_STATS.fieldTris = sw.tris; GRASS_STATS.instances = sg.inst + sw.inst + se.inst;
  console.log(`[grass] verge ${sg.inst} clumps ${(sg.tris / 1e6).toFixed(2)}M tris, extras ${se.inst} ${(se.tris / 1e6).toFixed(2)}M, wheat ${sw.inst} ${(sw.tris / 1e6).toFixed(2)}M, ground ${(GRASS_STATS.groundTris / 1e6).toFixed(2)}M`);

  return { object: root, update: () => {} };
}
