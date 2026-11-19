import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import meta from '../../../public/siliguri2/3d/meta.json';

/**
 * The coloured 3D terrain (tools/build_siliguri2_3d.py): AWS Terrain Tiles (SRTM; open data) heights, exaggerated 2.2x,
 * under EOX Sentinel-2 cloudless (CC BY 4.0) textures with the country fills, rivers and snow baked in. One mesh, denser
 * over the corridor; one ground shader samples the wide and the detail texture and draws the animated highlights from
 * two data textures (det_regions / wide_regions). Scene units are km: x east, z south, y up.
 */
export const M = meta as unknown as {
  wide: number[]; det: number[]; bw: number[]; bd: number[]; scale: number; xs: number[]; ys: number[];
  places: Record<string, [number, number]>; gap: [[number, number], [number, number], number]; corridor_c: [number, number];
  chumbi_c: [number, number]; states: string[]; state_c: Record<string, [number, number]>; corridor: [number, number][]; chumbi: [number, number][];
};
export type V3 = [number, number, number];
const R = 6378137;
const mx = (lon: number) => R * (lon * Math.PI) / 180;
const my = (lat: number) => R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const CX = (M.bw[0] + M.bw[2]) / 2, CY = (M.bw[1] + M.bw[3]) / 2;
const sx = (mX: number) => (mX - CX) * M.scale;
const sz = (mY: number) => -(mY - CY) * M.scale;
/** lon/lat -> scene x, z (km). */
export const xz = (lon: number, lat: number): [number, number] => [sx(mx(lon)), sz(my(lat))];
const GW = M.xs.length, GH = M.ys.length;
const XS = M.xs.map(sx), ZS = M.ys.map(sz); // ZS increases to the south

const find = (arr: number[], v: number) => {
  let lo = 0, hi = arr.length - 1;
  if (v <= arr[0]) return [0, 0] as const;
  if (v >= arr[hi]) return [hi - 1, 1] as const;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arr[m] <= v) lo = m; else hi = m; }
  return [lo, (v - arr[lo]) / (arr[lo + 1] - arr[lo])] as const;
};
/** Ground height (scene km) at a scene x, z. */
export const groundXZ = (h: Float32Array, x: number, z: number) => {
  const [i, tx] = find(XS, x), [j, tz] = find(ZS, z);
  const g = (c: number, r: number) => h[r * GW + c];
  return (g(i, j) * (1 - tx) + g(i + 1, j) * tx) * (1 - tz) + (g(i, j + 1) * (1 - tx) + g(i + 1, j + 1) * tx) * tz;
};
/** A lon/lat point, `up` km above the ground, in scene coordinates. */
export const P3 = (h: Float32Array, lon: number, lat: number, up = 0): V3 => { const [x, z] = xz(lon, lat); return [x, Math.max(0, groundXZ(h, x, z)) + up, z]; };

const cache: Record<string, Promise<Float32Array>> = {};
const loadHeights = () => (cache.h ??= fetch(staticFile('siliguri2/3d/height.bin')).then((r) => r.arrayBuffer()).then((b) => new Float32Array(b)));
export const useHeights = () => {
  const [h, setH] = useState<Float32Array | null>(null);
  const [handle] = useState(() => delayRender('sg2 heights'));
  useEffect(() => { loadHeights().then((x) => { setH(x); continueRender(handle); }); }, [handle]);
  return h;
};

export type CamS = { pos: V3; look: V3; fov: number; roll?: number };
const camObj = new THREE.PerspectiveCamera(30, 9 / 16, 0.3, 20000);
/** Screen position (px, in a w x hgt frame) of a scene point for the camera; z<1 means in front. */
export const project = (cam: CamS, w: number, hgt: number, p: V3): [number, number, boolean, number] => {
  const c = camObj;
  c.fov = cam.fov; c.aspect = w / hgt; c.position.set(...cam.pos); c.up.set(0, 1, 0); c.lookAt(...cam.look);
  if (cam.roll) c.rotateZ((cam.roll * Math.PI) / 180);
  c.updateMatrixWorld(); c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p);
  const d = v.distanceTo(c.position);
  v.project(c);
  return [(v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * hgt, v.z < 1, d];
};

/** The animated highlights the ground shader draws (all 0..1 unless noted). */
export type HL = {
  corr?: number; corrLine?: number; corrRed?: number; fort?: number; chumbi?: number; ne?: number; neLine?: number;
  hatch?: number; hatchR?: number; bang?: number; pulse?: number; dim?: number;
};

const VERT = /* glsl */ `
varying vec3 vPos; varying vec3 vN; varying float vDist;
void main() {
  vPos = position; vN = normal;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDist = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = /* glsl */ `
uniform sampler2D tWide, tDet, rDet, rWide;
uniform vec4 bW, bD;
uniform vec3 L, fogC; uniform float fogN, fogF;
uniform float uCorr, uCorrLine, uCorrRed, uFort, uChumbi, uNE, uNELine, uHatch, uHatchR, uBang, uPulse, uDim;
uniform vec2 hatchC;
varying vec3 vPos; varying vec3 vN; varying float vDist;
vec2 uvOf(vec4 b, vec2 p) { return vec2((p.x - b.x) / (b.z - b.x), 1.0 - (p.y - b.y) / (b.w - b.y)); }
void main() {
  vec2 p = vPos.xz;
  vec2 uw = uvOf(bW, p), ud = uvOf(bD, p);
  vec3 col = texture2D(tWide, uw).rgb;
  float inD = smoothstep(0.0, 0.025, min(min(ud.x, 1.0 - ud.x), min(ud.y, 1.0 - ud.y)));
  if (inD > 0.0) col = mix(col, texture2D(tDet, ud).rgb, inD);
  vec3 n = normalize(vN);
  float lam = max(dot(n, normalize(L)), 0.0);
  col *= 0.62 + 0.62 * lam;
  col *= 1.0 - uDim;
  // ---- highlights
  vec3 rd = inD > 0.0 ? texture2D(rDet, ud).rgb * inD : vec3(0.0);
  vec3 rw = texture2D(rWide, uw).rgb;
  float pulse = 0.75 + 0.25 * uPulse;
  // the corridor: an orange-red glow lying on the ground, its outline, and the blue "fortress" outline
  col = mix(col, col * vec3(1.15, 0.55, 0.4) + vec3(0.28, 0.06, 0.0), rd.r * uCorrRed * 0.6);
  col += vec3(1.0, 0.32, 0.08) * rd.r * uCorr * 0.55 * pulse;
  col = mix(col, vec3(1.0, 0.85, 0.55), rd.g * uCorrLine);
  col = mix(col, col * vec3(0.4, 0.75, 1.6) + vec3(0.0, 0.10, 0.35), rd.r * uFort * 0.8);
  col = mix(col, vec3(0.55, 0.85, 1.0), rd.g * uFort);
  col += vec3(0.2, 0.55, 1.0) * rd.g * uFort * 0.6;
  // the Chumbi Valley wedge: a hot red pulse
  col += vec3(1.0, 0.08, 0.05) * rd.b * uChumbi * 0.7 * pulse;
  // the Northeast states, one by one
  float id = floor(rw.r * 8.0 + 0.5);
  if (id > 0.5) {
    float s = clamp(uNE - (id - 1.0), 0.0, 1.0);
    col = mix(col, col * vec3(0.6, 0.95, 1.5) + vec3(0.05, 0.18, 0.45), s * 0.85);
  }
  col = mix(col, vec3(1.0), rw.g * uNELine * 0.9);
  // the "Greater Bangladesh" claim: green hatching creeping over the Northeast from Bangladesh
  if (id > 0.5 && uHatch > 0.0) {
    float r = length(p - hatchC);
    float inside = 1.0 - smoothstep(uHatchR - 12.0, uHatchR, r);
    float st = step(0.5, fract((p.x + p.y) / 9.0));
    col = mix(col, vec3(0.15, 0.95, 0.3) * (0.6 + 0.5 * st), inside * uHatch * (0.25 + 0.5 * st));
  }
  col += vec3(0.1, 0.8, 0.2) * rw.b * uBang * 0.35 * pulse;
  // fog
  float f = smoothstep(fogN, fogF, vDist);
  gl_FragColor = vec4(mix(col, fogC, f), 1.0);
}`;

const loadTex = (n: string, data = false) => new Promise<THREE.Texture>((res) => new THREE.TextureLoader().load(staticFile(`siliguri2/3d/${n}`), (t) => {
  if (!data) t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 16; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  res(t);
}));

const box4 = (b: number[]) => new THREE.Vector4(sx(b[0]), sz(b[3]), sx(b[2]), sz(b[1]));

const Ground: React.FC<{ h: Float32Array; tx: Record<string, THREE.Texture>; hl: HL; fog: [number, number] }> = ({ h, tx, hl, fog }) => {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(GW * GH * 3);
    for (let r = 0; r < GH; r++) for (let c = 0; c < GW; c++) {
      const k = (r * GW + c) * 3;
      pos[k] = XS[c]; pos[k + 1] = h[r * GW + c]; pos[k + 2] = ZS[r];
    }
    const idx = new Uint32Array((GW - 1) * (GH - 1) * 6);
    let q = 0;
    for (let r = 0; r < GH - 1; r++) for (let c = 0; c < GW - 1; c++) {
      const a = r * GW + c, b = a + 1, d = a + GW, e = d + 1;
      idx[q++] = a; idx[q++] = d; idx[q++] = b; idx[q++] = b; idx[q++] = d; idx[q++] = e;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeVertexNormals();
    return g;
  }, [h]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      tWide: { value: tx.wide }, tDet: { value: tx.det }, rDet: { value: tx.rdet }, rWide: { value: tx.rwide },
      bW: { value: box4(M.bw) }, bD: { value: box4(M.bd) }, L: { value: new THREE.Vector3(-0.55, 0.62, -0.55) },
      fogC: { value: new THREE.Color(FOG) }, fogN: { value: 400 }, fogF: { value: 1600 },
      uCorr: { value: 0 }, uCorrLine: { value: 0 }, uCorrRed: { value: 0 }, uFort: { value: 0 }, uChumbi: { value: 0 }, uNE: { value: 0 },
      uNELine: { value: 0 }, uHatch: { value: 0 }, uHatchR: { value: 0 }, uBang: { value: 0 }, uPulse: { value: 0 }, uDim: { value: 0 },
      hatchC: { value: new THREE.Vector2(...xz(90.0, 24.3)) },
    },
  }), [tx]);
  const u = mat.uniforms;
  u.uCorr.value = hl.corr ?? 0; u.uCorrLine.value = hl.corrLine ?? 0; u.uCorrRed.value = hl.corrRed ?? 0; u.uFort.value = hl.fort ?? 0;
  u.uChumbi.value = hl.chumbi ?? 0; u.uNE.value = hl.ne ?? 0; u.uNELine.value = hl.neLine ?? 0; u.uHatch.value = hl.hatch ?? 0;
  u.uHatchR.value = hl.hatchR ?? 0; u.uBang.value = hl.bang ?? 0; u.uPulse.value = hl.pulse ?? 0; u.uDim.value = hl.dim ?? 0;
  u.fogN.value = fog[0]; u.fogF.value = fog[1];
  return <mesh geometry={geom} material={mat} />;
};

const CamRig: React.FC<{ cam: CamS }> = ({ cam }) => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos); c.fov = cam.fov; c.up.set(0, 1, 0); c.lookAt(...cam.look);
  if (cam.roll) c.rotateZ((cam.roll * Math.PI) / 180);
  c.near = 0.3; c.far = 20000;
  c.updateProjectionMatrix();
  return null;
};

export const FOG = '#0d1a22';
let texP: Promise<Record<string, THREE.Texture>> | null = null;
const loadAll = () => (texP ??= Promise.all([loadTex('tex_wide.jpg'), loadTex('tex_det.jpg'), loadTex('det_regions.png', true), loadTex('wide_regions.png', true)])
  .then(([wide, det, rdet, rwide]) => ({ wide, det, rdet, rwide })));

/** The terrain scene. `children` are extra three.js objects (jets, contrails, clouds, labels) in scene coordinates. */
export const Terrain: React.FC<{ h: Float32Array; cam: CamS; width: number; height: number; hl: HL; children?: React.ReactNode }> = ({ h, cam, width, height, hl, children }) => {
  const dist = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  const [tx, setTx] = useState<Record<string, THREE.Texture> | null>(null);
  const [handle] = useState(() => delayRender('sg2 3d'));
  useEffect(() => { loadAll().then(setTx); }, []);
  useEffect(() => { if (tx) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)))); }, [tx, handle]);
  if (!tx) return <div style={{ width, height, background: FOG }} />;
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: cam.fov, near: 0.3, far: 20000, position: cam.pos }} gl={{ antialias: true, preserveDrawingBuffer: true }} style={{ background: FOG }}>
      <CamRig cam={cam} />
      <Ground h={h} tx={tx} hl={hl} fog={[dist * 1.1, dist * 3.2]} />
      {children}
    </ThreeCanvas>
  );
};
export const useLast = <T,>(v: T) => { const r = useRef(v); r.current = v; return r; };
