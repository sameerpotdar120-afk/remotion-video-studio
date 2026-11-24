import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import metaJson from '../../public/everest/3d/meta.json';

/**
 * The Everest Short's 3D world (tools/everest/build_3d.py): four nested terrain layers (India z6/z7, the Himalaya z9/z10,
 * Everest and Langza z12/z14) from AWS Terrain Tiles (SRTM) under the Midnight-graded EOX Sentinel-2 textures.
 * Scene units are km: x east, z south, y up, origin at Everest's summit (lon/lat), heights from the `h` attribute times
 * uVex (so the Himalaya can rise out of a flat sea floor). One ground shader draws the light, the highlight fills that
 * wipe out from a centre, the old-sea illustration, the summit glow, and everything under the water (caustics and
 * absorption). A water surface and a sky dome complete it.
 */
type Layer = { lonlat: number[]; merc: number[]; scene: number[]; cols: number; rows: number; parent: string | null; tex: number[]; reg?: number[] };
export const META = metaJson as unknown as { origin: [number, number]; scale: number; places: Record<string, [number, number]>; layers: Record<string, Layer>; india_c: [number, number]; hp_c: [number, number] };
export type V3 = [number, number, number];
const R = 6378137;
const mx = (lon: number) => R * (lon * Math.PI) / 180;
const my = (lat: number) => R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const OX = mx(META.origin[0]), OY = my(META.origin[1]);
/** lon/lat -> scene x, z (km). */
export const xz = (lon: number, lat: number): [number, number] => [(mx(lon) - OX) * META.scale, -(my(lat) - OY) * META.scale];
export const PL = META.places;
const ORDER = ['india', 'himal', 'everest', 'langza'] as const;
type LName = (typeof ORDER)[number];

// ------------------------------------------------------------------ heights (for placing things on the ground)
const hcache: Partial<Record<LName, Promise<Float32Array>>> = {};
const loadH = (n: LName) => (hcache[n] ??= fetch(staticFile(`everest/3d/${n}_h.bin`)).then((r) => r.arrayBuffer()).then((b) => new Float32Array(b)));
let HS: Record<string, Float32Array> | null = null;
let hsP: Promise<Record<string, Float32Array>> | null = null;
const loadAllH = () => (hsP ??= Promise.all(ORDER.map(loadH)).then((a) => { HS = Object.fromEntries(ORDER.map((n, i) => [n, a[i]])); return HS; }));
export const useHeights = () => {
  const [h, setH] = useState<Record<string, Float32Array> | null>(HS);
  const [handle] = useState(() => delayRender('ev heights'));
  useEffect(() => { loadAllH().then((x) => { setH(x); continueRender(handle); }); }, [handle]);
  return h;
};
/** Ground height in metres at a lon/lat, from the finest layer that covers it. */
export const groundM = (H: Record<string, Float32Array>, lon: number, lat: number): number => {
  for (const n of ['everest', 'langza', 'himal', 'india'] as LName[]) {
    const L = META.layers[n];
    const [lo0, lo1, la0, la1] = L.lonlat;
    if (lon < lo0 || lon > lo1 || lat < la0 || lat > la1) continue;
    const fx = (mx(lon) - L.merc[0]) / (L.merc[2] - L.merc[0]) * (L.cols - 1);
    const fy = (L.merc[3] - my(lat)) / (L.merc[3] - L.merc[1]) * (L.rows - 1);
    const i = Math.min(L.cols - 2, Math.floor(fx)), j = Math.min(L.rows - 2, Math.floor(fy));
    const tx = fx - i, ty = fy - j, h = H[n], c = L.cols;
    const v = (h[j * c + i] * (1 - tx) + h[j * c + i + 1] * tx) * (1 - ty) + (h[(j + 1) * c + i] * (1 - tx) + h[(j + 1) * c + i + 1] * tx) * ty;
    return v + (n === 'himal' && lon > 86.7 && lon < 87.15 && lat > 27.8 && lat < 28.15 ? 120 : 0);
  }
  return 0;
};
/** A lon/lat point on the ground (plus `up` km), in scene coordinates, for an exaggeration vex. */
export const P3 = (H: Record<string, Float32Array>, lon: number, lat: number, vex: number, up = 0): V3 => {
  const [x, z] = xz(lon, lat);
  return [x, (Math.max(0, groundM(H, lon, lat)) / 1000) * vex + up, z];
};

// ------------------------------------------------------------------ camera
export type CamS = { pos: V3; look: V3; fov: number; roll?: number };
const camObj = new THREE.PerspectiveCamera(30, 9 / 16, 0.01, 30000);
const setCam = (c: THREE.PerspectiveCamera, cam: CamS, aspect: number) => {
  c.fov = cam.fov; c.aspect = aspect; c.position.set(...cam.pos); c.up.set(0, 1, 0); c.lookAt(...cam.look);
  if (cam.roll) c.rotateZ((cam.roll * Math.PI) / 180);
  const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  c.near = Math.max(0.005, d * 0.004); c.far = Math.max(4000, d * 60);
  c.updateMatrixWorld(); c.updateProjectionMatrix();
};
/** Screen position (px in a w x h frame) of a scene point; [x, y, inFront, distance]. */
export const project = (cam: CamS, w: number, h: number, p: V3): [number, number, boolean, number] => {
  setCam(camObj, cam, w / h);
  const v = new THREE.Vector3(...p);
  const d = v.distanceTo(camObj.position);
  v.project(camObj);
  return [(v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * h, v.z < 1, d];
};
/** Pixels per km at distance d for the camera's fov, in a frame `h` px tall. */
export const pxPerKm = (cam: CamS, h: number, d: number) => h / (2 * d * Math.tan((cam.fov * Math.PI) / 360));

// ------------------------------------------------------------------ the look
export type HL = {
  vex: number; t: number;
  india?: number; indiaR?: number; indiaLine?: number; hp?: number; hpR?: number; hpLine?: number; nepalLine?: number;
  north?: number; northR?: number; // the old-sea illustration over the land north of India (0..1, wipe radius km from Everest)
  spot?: number; spotC?: [number, number]; spotR?: number; spotCol?: V3; // a glow lying on the ground
  water?: number; waterY?: number; // water on (0..1) and its level (scene km)
  dim?: number; desat?: number;
};
export const HAZE = '#2a3a4c';
const HAZE3: V3 = [0.165, 0.227, 0.298];
const SUN: V3 = [-0.76, 0.5, 0.32];

const VERT = /* glsl */ `
attribute float h; attribute vec2 g;
uniform float uVex;
varying vec3 vW; varying vec3 vN; varying float vH; varying float vDist;
void main() {
  vec3 p = vec3(position.x, h * 0.001 * uVex, position.z);
  if (h < 0.0) p.y = h * 0.001 * min(uVex, 1.0) * 0.4;
  vH = h;
  vN = normalize(vec3(-g.x * 0.001 * uVex, 1.0, -g.y * 0.001 * uVex));
  vec4 w = modelMatrix * vec4(p, 1.0);
  vW = w.xyz;
  vec4 mv = viewMatrix * w;
  vDist = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
uniform sampler2D tSelf, tPar, tRegA, tRegB;
uniform vec4 bSelf, bPar, bReg; uniform float hasPar, hasReg, edgeK, isRoot;
uniform vec3 L, hazeC, camP; uniform float fogN, fogF, uT;
uniform float uIndia, uIndiaR, uIndiaLine, uHP, uHPR, uHPLine, uNepalLine, uNorth, uNorthR, uDim, uDesat;
uniform vec2 indiaC, hpC; uniform float uSpot, uSpotR; uniform vec2 uSpotC; uniform vec3 uSpotCol;
uniform float uWater, uWaterY;
varying vec3 vW; varying vec3 vN; varying float vH; varying float vDist;
vec2 uvOf(vec4 b, vec2 p) { return vec2((p.x - b.x) / (b.z - b.x), (p.y - b.y) / (b.w - b.y)); }
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
float caust(vec2 p, float t) {
  float c = 0.0; vec2 q = p;
  for (int i = 0; i < 3; i++) {
    q = q * 1.7 + vec2(sin(q.y * 1.3 + t * 0.9), cos(q.x * 1.1 - t * 0.7));
    c += abs(sin(q.x) * sin(q.y));
  }
  return pow(1.0 - c / 3.0, 4.0);
}
void main() {
  vec2 p = vW.xz;
  vec2 us = uvOf(bSelf, p);
  vec3 col = texture2D(tSelf, us).rgb;
  if (hasPar > 0.5) {
    float e = min(min(us.x, 1.0 - us.x), min(us.y, 1.0 - us.y));
    float k = smoothstep(0.0, edgeK, e);
    if (k < 1.0) col = mix(texture2D(tPar, uvOf(bPar, p)).rgb, col, k);
  }
  vec3 n = normalize(vN);
  float near = 1.0 - smoothstep(2.0, 14.0, vDist);
  if (near > 0.0) {
    vec2 q = p * 55.0;
    float e = 0.15;
    float r0 = vnoise(q) + 0.5 * vnoise(q * 2.3), rx = vnoise(q + vec2(e, 0.0)) + 0.5 * vnoise((q + vec2(e, 0.0)) * 2.3), rz = vnoise(q + vec2(0.0, e)) + 0.5 * vnoise((q + vec2(0.0, e)) * 2.3);
    float steep = 1.0 - n.y;
    n = normalize(n + vec3(-(rx - r0), 0.0, -(rz - r0)) * near * (0.4 + 1.4 * steep));
  }
  float lam = max(dot(n, normalize(L)), 0.0);
  float sky = 0.5 + 0.5 * n.y;
  col *= 0.2 + 0.98 * lam + 0.1 * sky;
  col *= mix(1.0, 0.76, smoothstep(0.35, 0.85, 1.0 - vN.y));
  col = col * (1.0 + col / 2.4) / (1.0 + col);           // soft shoulder: snow keeps its detail
  float lum = dot(col, vec3(0.3, 0.59, 0.11));
  col = mix(col, col * vec3(0.82, 0.95, 1.12), 0.55 * (1.0 - smoothstep(0.1, 0.6, lum)));  // Midnight: cool shadows
  col = (col - 0.5) * 1.08 + 0.5 - 0.035;
  col = mix(col, vec3(lum), uDesat);
  col *= 1.0 - uDim;
  // ---- highlights (region masks on the India and Himalaya layers)
  if (hasReg > 0.5) {
    vec2 ur = uvOf(bReg, p);
    vec3 ra = texture2D(tRegA, ur).rgb, rb = texture2D(tRegB, ur).rgb;
    float wi = 1.0 - smoothstep(uIndiaR - 60.0, uIndiaR, length(p - indiaC));
    float edgeI = smoothstep(uIndiaR - 60.0, uIndiaR, length(p - indiaC)) * (1.0 - step(uIndiaR, length(p - indiaC)));
    vec3 cI = vec3(1.0, 0.66, 0.1);
    col = mix(col, col * vec3(1.5, 1.08, 0.45) + cI * 0.22, ra.r * wi * uIndia * 0.8);
    col += cI * ra.r * edgeI * uIndia * 0.6;
    float wh = 1.0 - smoothstep(uHPR - 25.0, uHPR, length(p - hpC));
    vec3 cH = vec3(1.0, 0.2, 0.5);
    col = mix(col, col * vec3(1.35, 0.7, 0.95) + cH * 0.16, ra.g * wh * uHP * 0.6);
    col += cH * ra.g * (smoothstep(uHPR - 25.0, uHPR, length(p - hpC)) * (1.0 - step(uHPR, length(p - hpC)))) * uHP * 0.7;
    // the old-sea illustration: the land north of India becomes glowing shallow sea, wiping out from Everest
    float wn = 1.0 - smoothstep(uNorthR - 80.0, uNorthR, length(p));
    float seaN = ra.b * wn * uNorth;
    float swell = vnoise(p * 0.012 + vec2(uT * 0.05, 0.0)) * 0.6 + vnoise(p * 0.04 - vec2(0.0, uT * 0.08)) * 0.4;
    vec3 seaC = mix(vec3(0.02, 0.14, 0.26), vec3(0.05, 0.42, 0.62), swell) + vec3(0.2, 0.5, 0.55) * caust(p * 0.03, uT * 0.6) * 0.18;
    col = mix(col, seaC, seaN * 0.9);
    col = mix(col, vec3(1.0), rb.r * uIndiaLine * 0.95);
    col += vec3(0.4, 0.8, 1.0) * rb.r * uIndiaLine * 0.35;
    col = mix(col, vec3(1.0, 0.93, 0.8), rb.g * uHPLine * 0.95);
    col = mix(col, vec3(0.85), rb.b * uNepalLine * 0.6);
  }
  // a glow lying flat on the ground
  float sd = length(p - uSpotC);
  col += uSpotCol * uSpot * (exp(-pow(sd / max(uSpotR, 0.001), 2.0)) * 0.55 + smoothstep(uSpotR * 1.05, uSpotR, sd) * smoothstep(uSpotR * 0.85, uSpotR, sd) * 0.9);
  // ---- under the water: absorption and caustics
  float depth = uWaterY - vW.y;
  if (uWater > 0.0 && depth > 0.0) {
    float c = caust(p * 9.0, uT * 1.6) + 0.6 * caust(p * 23.0 + 3.1, uT * 2.1);
    vec3 deep = vec3(0.02, 0.17, 0.24);
    float a = 1.0 - exp(-depth * 1.4);
    vec3 under = mix(col * vec3(0.55, 0.9, 1.05), deep, a * 0.85) + vec3(0.35, 0.75, 0.8) * c * exp(-depth * 1.2) * 0.55;
    col = mix(col, under, uWater * smoothstep(0.0, 0.03, depth));
  }
  // haze
  float camUnder = (uWater > 0.0 && camP.y < uWaterY) ? 1.0 : 0.0;
  vec3 fogC = mix(hazeC, vec3(0.03, 0.2, 0.27), camUnder);
  float f = smoothstep(fogN, fogF, vDist);
  if (camUnder > 0.5) f = max(f, (1.0 - exp(-vDist * 0.11)) * 0.92);
  if (isRoot > 0.5) f = max(f, 1.0 - smoothstep(0.0, 0.07, min(min(us.x, 1.0 - us.x), min(us.y, 1.0 - us.y))));
  gl_FragColor = vec4(mix(col, fogC, f), 1.0);
}`;

const loadTex = (n: string, srgb: boolean) => new Promise<THREE.Texture>((res) => new THREE.TextureLoader().load(staticFile(`everest/3d/${n}`), (t) => {
  t.colorSpace = srgb ? THREE.NoColorSpace : THREE.NoColorSpace;
  t.anisotropy = 16; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.flipY = false;
  res(t);
}));
type Tex = Record<string, THREE.Texture>;
let texP: Promise<Tex> | null = null;
const loadAllTex = () => (texP ??= Promise.all([
  ...ORDER.map((n) => loadTex(`${n}_tex.jpg`, true)), loadTex('india_reg_a.png', false), loadTex('india_reg_b.png', false),
  loadTex('himal_reg_a.png', false), loadTex('himal_reg_b.png', false),
]).then((a) => ({ india: a[0], himal: a[1], everest: a[2], langza: a[3], india_ra: a[4], india_rb: a[5], himal_ra: a[6], himal_rb: a[7] })));

const box4 = (s: number[]) => new THREE.Vector4(s[0], s[1], s[2], s[3]); // x0, z0 (north), x1, z1 (south)

const useGeom = (n: LName, h: Float32Array) => useMemo(() => {
  const L = META.layers[n];
  const { cols: W, rows: Hh } = L;
  const [x0, z0, x1, z1] = L.scene;
  const pos = new Float32Array(W * Hh * 3), grad = new Float32Array(W * Hh * 2);
  const dx = (x1 - x0) / (W - 1), dz = (z1 - z0) / (Hh - 1);
  for (let r = 0; r < Hh; r++) for (let c = 0; c < W; c++) {
    const k = r * W + c;
    pos[k * 3] = x0 + c * dx; pos[k * 3 + 1] = 0; pos[k * 3 + 2] = z0 + r * dz;
    const hl = h[r * W + Math.max(0, c - 1)], hr = h[r * W + Math.min(W - 1, c + 1)];
    const hu = h[Math.max(0, r - 1) * W + c], hd = h[Math.min(Hh - 1, r + 1) * W + c];
    grad[k * 2] = Math.max(0, hr) - Math.max(0, hl); grad[k * 2] /= (c > 0 && c < W - 1 ? 2 : 1) * dx;
    grad[k * 2 + 1] = Math.max(0, hd) - Math.max(0, hu); grad[k * 2 + 1] /= (r > 0 && r < Hh - 1 ? 2 : 1) * dz;
  }
  const idx = new Uint32Array((W - 1) * (Hh - 1) * 6);
  let q = 0;
  for (let r = 0; r < Hh - 1; r++) for (let c = 0; c < W - 1; c++) {
    const a = r * W + c, b = a + 1, d = a + W, e = d + 1;
    idx[q++] = a; idx[q++] = d; idx[q++] = b; idx[q++] = b; idx[q++] = d; idx[q++] = e;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('h', new THREE.BufferAttribute(h, 1));
  g.setAttribute('g', new THREE.BufferAttribute(grad, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3((x0 + x1) / 2, 4, (z0 + z1) / 2), Math.hypot(x1 - x0, z1 - z0) / 2 + 20);
  return g;
}, [n, h]);

const Ground: React.FC<{ n: LName; h: Float32Array; tx: Tex; hl: HL; cam: CamS; fog: [number, number]; rank: number }> = ({ n, h, tx, hl, cam, fog, rank }) => {
  const geom = useGeom(n, h);
  const L = META.layers[n];
  const mat = useMemo(() => {
    const par = L.parent as LName | null;
    const reg = true;
    const rn = n === 'india' ? 'india' : 'himal';
    const m = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      uniforms: {
        tSelf: { value: tx[n] }, tPar: { value: par ? tx[par] : tx[n] }, tRegA: { value: tx[`${rn}_ra`] }, tRegB: { value: tx[`${rn}_rb`] }, bReg: { value: box4(META.layers[rn].scene) },
        bSelf: { value: box4(L.scene) }, bPar: { value: box4(par ? META.layers[par].scene : L.scene) }, hasPar: { value: par ? 1 : 0 }, hasReg: { value: reg ? 1 : 0 }, isRoot: { value: par ? 0 : 1 },
        edgeK: { value: n === 'himal' ? 0.03 : 0.06 },
        L: { value: new THREE.Vector3(...SUN) }, hazeC: { value: new THREE.Vector3(...HAZE3) }, camP: { value: new THREE.Vector3() },
        fogN: { value: 400 }, fogF: { value: 1600 }, uT: { value: 0 }, uVex: { value: 1 },
        uIndia: { value: 0 }, uIndiaR: { value: 0 }, uIndiaLine: { value: 0 }, uHP: { value: 0 }, uHPR: { value: 0 }, uHPLine: { value: 0 }, uNepalLine: { value: 0 },
        uNorth: { value: 0 }, uNorthR: { value: 0 }, uDim: { value: 0 }, uDesat: { value: 0 },
        indiaC: { value: new THREE.Vector2(...xz(...META.india_c)) }, hpC: { value: new THREE.Vector2(...xz(...META.hp_c)) },
        uSpot: { value: 0 }, uSpotR: { value: 1 }, uSpotC: { value: new THREE.Vector2() }, uSpotCol: { value: new THREE.Vector3(1, 0.8, 0.3) },
        uWater: { value: 0 }, uWaterY: { value: 0 },
      },
      polygonOffset: rank > 0, polygonOffsetFactor: -2 * rank, polygonOffsetUnits: -4 * rank,
    });
    return m;
  }, [tx, n, L, rank]);
  const u = mat.uniforms;
  u.uVex.value = hl.vex; u.uT.value = hl.t; (u.camP.value as THREE.Vector3).set(...cam.pos);
  u.fogN.value = fog[0]; u.fogF.value = fog[1];
  u.uIndia.value = hl.india ?? 0; u.uIndiaR.value = hl.indiaR ?? 1e5; u.uIndiaLine.value = hl.indiaLine ?? 0;
  u.uHP.value = hl.hp ?? 0; u.uHPR.value = hl.hpR ?? 1e5; u.uHPLine.value = hl.hpLine ?? 0; u.uNepalLine.value = hl.nepalLine ?? 0;
  u.uNorth.value = hl.north ?? 0; u.uNorthR.value = hl.northR ?? 1e5; u.uDim.value = hl.dim ?? 0; u.uDesat.value = hl.desat ?? 0;
  u.uSpot.value = hl.spot ?? 0; u.uSpotR.value = hl.spotR ?? 1;
  if (hl.spotC) (u.uSpotC.value as THREE.Vector2).set(...xz(...hl.spotC));
  if (hl.spotCol) (u.uSpotCol.value as THREE.Vector3).set(...hl.spotCol);
  u.uWater.value = hl.water ?? 0; u.uWaterY.value = hl.waterY ?? 0;
  return <mesh geometry={geom} material={mat} renderOrder={rank} />;
};

// ------------------------------------------------------------------ water surface (seen from above and from below)
const WVERT = /* glsl */ `
varying vec3 vW;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const WFRAG = /* glsl */ `
uniform vec3 camP, L; uniform float uT, uOp, uScale;
varying vec3 vW;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
float hgt(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * vnoise(p + vec2(uT * 0.35 * (1.0 + float(i) * 0.3), uT * 0.2)); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= 0.5; }
  return s;
}
void main() {
  vec2 p = vW.xz / uScale;
  float e = 0.02;
  float h0 = hgt(p), hx = hgt(p + vec2(e, 0.0)), hz = hgt(p + vec2(0.0, e));
  vec3 n = normalize(vec3(-(hx - h0) / e * 0.06, 1.0, -(hz - h0) / e * 0.06));
  vec3 V = normalize(camP - vW);
  bool below = camP.y < vW.y;
  vec3 col; float a;
  if (!below) {
    float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, V), 0.0), 5.0);
    vec3 body = vec3(0.02, 0.16, 0.22);
    vec3 skyc = vec3(0.32, 0.45, 0.58);
    col = mix(body, skyc, clamp(fres * 1.6, 0.0, 0.9));
    col += vec3(1.0, 0.92, 0.75) * pow(max(dot(reflect(-normalize(L), n), V), 0.0), 160.0) * 1.2;
    a = 0.55 + 0.4 * fres;
  } else {
    vec3 nb = -n;
    float win = pow(max(dot(-V, vec3(0.0, 1.0, 0.0)), 0.0), 2.0);
    float rip = smoothstep(0.35, 0.95, h0 * 1.4 - 0.2);
    col = mix(vec3(0.05, 0.3, 0.38), vec3(0.55, 0.88, 0.92), win * 0.8 + rip * 0.45);
    col += vec3(1.0, 0.97, 0.85) * pow(max(dot(refract(-V, nb, 0.75), normalize(L)), 0.0), 40.0) * 0.8;
    a = 0.82;
  }
  float d = length(camP - vW);
  a *= 1.0 - smoothstep(uScale * 60.0, uScale * 140.0, d);
  gl_FragColor = vec4(col, a * uOp);
}`;
const Water: React.FC<{ y: number; op: number; t: number; cam: CamS; scale: number }> = ({ y, op, t, cam, scale }) => {
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(1, 1, 1, 1); g.rotateX(-Math.PI / 2); return g; }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: WVERT, fragmentShader: WFRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { camP: { value: new THREE.Vector3() }, L: { value: new THREE.Vector3(...SUN) }, uT: { value: 0 }, uOp: { value: 1 }, uScale: { value: 1 } },
  }), []);
  const u = mat.uniforms;
  (u.camP.value as THREE.Vector3).set(...cam.pos); u.uT.value = t; u.uOp.value = op; u.uScale.value = scale;
  if (op <= 0.001) return null;
  return <mesh geometry={geo} material={mat} position={[cam.look[0], y, cam.look[2]]} scale={[scale * 400, 1, scale * 400]} renderOrder={10} />;
};

// ------------------------------------------------------------------ sky dome
const SVERT = /* glsl */ `varying vec3 vD; void main() { vD = normalize(position); gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }`;
const SFRAG = /* glsl */ `
uniform vec3 hazeC; uniform float uUnder; varying vec3 vD;
void main() {
  float y = vD.y;
  vec3 top = vec3(0.035, 0.08, 0.15), mid = vec3(0.12, 0.2, 0.3);
  vec3 c = mix(hazeC, mid, smoothstep(-0.02, 0.12, y));
  c = mix(c, top, smoothstep(0.12, 0.6, y));
  c += vec3(0.25, 0.18, 0.1) * exp(-pow((y - 0.02) / 0.09, 2.0)) * 0.3;
  c = mix(c, vec3(0.03, 0.2, 0.27) + vec3(0.12, 0.3, 0.3) * smoothstep(0.0, 1.0, y), uUnder);
  gl_FragColor = vec4(c, 1.0);
}`;
const Sky: React.FC<{ cam: CamS; under: number }> = ({ cam, under }) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: SVERT, fragmentShader: SFRAG, side: THREE.BackSide, depthWrite: false,
    uniforms: { hazeC: { value: new THREE.Vector3(...HAZE3) }, uUnder: { value: 0 } } }), []);
  mat.uniforms.uUnder.value = under;
  const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  const r = Math.max(3000, d * 40);
  return <mesh material={mat} position={cam.pos} scale={[r, r, r]} renderOrder={-1}><sphereGeometry args={[1, 32, 16]} /></mesh>;
};

const CamRig: React.FC<{ cam: CamS; w: number; h: number }> = ({ cam, w, h }) => {
  const { camera } = useThree();
  setCam(camera as THREE.PerspectiveCamera, cam, w / h);
  return null;
};

/** The world. `show` picks the layers (frustum culling handles the rest). */
export const World: React.FC<{ H: Record<string, Float32Array>; cam: CamS; hl: HL; width: number; height: number; show?: LName[]; children?: React.ReactNode }> = ({ H, cam, hl, width, height, show = ['india', 'himal', 'everest', 'langza'], children }) => {
  const [tx, setTx] = useState<Tex | null>(null);
  const [handle] = useState(() => delayRender('ev world'));
  useEffect(() => { loadAllTex().then(setTx); }, []);
  useEffect(() => { if (tx) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)))); }, [tx, handle]);
  const dist = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  const under = (hl.water ?? 0) > 0 && cam.pos[1] < (hl.waterY ?? 0) ? 1 : 0;
  if (!tx) return <div style={{ width, height, background: HAZE }} />;
  const fog: [number, number] = [dist * 1.6, dist * 6.5];
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: cam.fov, near: 0.01, far: 30000, position: cam.pos }} gl={{ antialias: true, preserveDrawingBuffer: true }} style={{ background: HAZE }}>
      <CamRig cam={cam} w={width} h={height} />
      <Sky cam={cam} under={under} />
      {ORDER.filter((n) => show.includes(n)).map((n) => <Ground key={n} n={n} h={H[n]} tx={tx} hl={hl} cam={cam} fog={fog} rank={ORDER.indexOf(n)} />)}
      <Water y={hl.waterY ?? 0} op={hl.water ?? 0} t={hl.t} cam={cam} scale={Math.max(0.05, dist * 0.06)} />
      {children}
    </ThreeCanvas>
  );
};
