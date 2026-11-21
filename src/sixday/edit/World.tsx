import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { GH, GW, KM_PER_PX, V3, VEX, X0, X1, Z0, Z1 } from './geo';

/**
 * The one map world of the Six-Day War video, in the reference's documentary way: a tilted 3D map with felt-like
 * painted countries, dark raised borders, rivers, and an animated sea. Everything is drawn by one ground shader from
 * the distance fields of tools/build_sixday_map.py, so coasts and borders stay sharp from the whole region down to
 * the Straits of Tiran in 4K. Scene units are km (x east, z south, y up).
 */
export type CamS = { pos: V3; look: V3; fov: number; roll?: number };
/** Region ids (see the build script): 1 Egypt, 2 Sinai, 3 Gaza, 4 Israel, 5 West Bank, 6 Golan, 7 Jordan, 8 Syria,
 * 9 Lebanon, 10 Saudi Arabia; other countries share one colour. */
export type Ground = {
  col: [number, number, number][]; // 12 entries (index = id), linear-ish 0..1 colours
  hatch: number[]; // 12 entries 0..1: white diagonal hatching (captured land)
  glow: number[]; // 12 entries 0..1: a lift and a white edge glow
  post: number; // 0 = the borders of 4 June 1967, 1 = the ceasefire lines of 10 June
  fine: number; // 0..1 opacity of the inner region lines (Green Line, Gaza, Golan, Sinai)
  river: number; // 0..1
  dim: number; focus: [number, number]; focusR: number; // darken everything outside a circle (scene km)
  t: number; // seconds, drives the sea
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
uniform sampler2D tSdf, tAux, tIds;
uniform vec4 bnd;
uniform float kmpx, uT, uPost, uFine, uRiver, uBorderW, uRiverW, uHatchP, uDim, uFocusR, fogN, fogF;
uniform vec3 uCol[12]; uniform float uHatch[12]; uniform float uGlow[12];
uniform vec3 uOther, L, camP, fogC; uniform vec2 uFocus;
varying vec3 vPos; varying vec3 vN; varying float vDist;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
// felt: fractal fibres + mottling at every zoom; octaves finer than ~2 px fade out (no shimmer)
float felt(vec2 p, float fw) {
  float s = 0.0, wsum = 0.0, f = 0.02;
  for (int k = 0; k < 9; k++) {
    float fade = clamp(1.6 - fw * f * 3.0, 0.0, 1.0);
    vec2 q = p * f;
    q = vec2(q.x * 0.55 + q.y * 0.35, q.y * 1.6 - q.x * 0.2); // a little directional, like brushed felt
    s += (vnoise(q + float(k) * 7.13) - 0.5) * fade; wsum += fade;
    f *= 2.6;
  }
  return wsum > 0.0 ? s / sqrt(wsum) : 0.0;
}
// the sea: fractal directional ripples, each octave moving at its own (deep-water) speed
vec3 seaN(vec2 p, float fw) {
  vec2 g = vec2(0.0);
  float f = 0.035;
  vec2 warp = vec2(vnoise(p * 0.02), vnoise(p * 0.02 + 9.1)) * 6.0;
  for (int k = 0; k < 9; k++) {
    float fade = clamp(1.25 - fw * f * 4.5, 0.0, 1.0);
    if (fade > 0.0) {
      float a = 0.35 + 0.7 * float(k);
      vec2 d = normalize(vec2(cos(a) * 0.45 + 0.1, 1.0));
      vec2 q = p + warp * (1.0 + float(k) * 0.3);
      float ph = dot(d, q) * f * 6.2832 - uT * sqrt(f) * 2.2 + float(k) * 1.7;
      float r = vnoise(q * f * 0.45 + float(k) * 3.1);
      r = r * r * 1.8;
      g += d * cos(ph) * 0.11 * r * fade;
    }
    f *= 1.85;
  }
  return normalize(vec3(-g.x, 1.0, -g.y));
}

void main() {
  vec2 p = vPos.xz;
  vec2 uv = vec2((p.x - bnd.x) / (bnd.z - bnd.x), (p.y - bnd.y) / (bnd.w - bnd.y));
  float fw = max(length(vec2(dFdx(p.x), dFdy(p.x))), length(vec2(dFdx(p.y), dFdy(p.y)))); // km per screen px
  vec4 sd = texture2D(tSdf, uv);
  vec4 ax = texture2D(tAux, uv);
  float coast = (sd.r * 255.0 - 128.0) / 2.0 * kmpx;
  float dPre = sd.g * 255.0 / 8.0 * kmpx, dPost = sd.b * 255.0 / 8.0 * kmpx, dFine = sd.a * 255.0 / 8.0 * kmpx;
  float dRiv = ax.r * 255.0 / 8.0 * kmpx;
  float aa = max(fw, 0.0001);
  float land = smoothstep(-aa, aa, coast);
  float rw = max(uRiverW, fw * 1.6);
  float riv = smoothstep(rw + aa, rw - aa, dRiv) * uRiver * land;
  vec3 Ld = normalize(L);
  vec3 V = normalize(camP - vPos);

  // ---- land
  int id = int(texture2D(tIds, uv).r * 255.0 + 0.5);
  vec3 base = uOther; float hatch = 0.0, glow = 0.0;
  for (int i = 1; i < 12; i++) { if (i == id) { base = uCol[i]; hatch = uHatch[i]; glow = uGlow[i]; } }
  float fl = felt(p, fw);
  vec3 col = base * (1.0 + fl * 0.30);
  col *= 0.93 + 0.12 * vnoise(p * 0.012) ;
  vec3 n = normalize(vN);
  float lam = dot(n, Ld);
  col *= 0.80 + 0.32 * lam;
  col = mix(col, col * 1.22 + vec3(0.06), glow);
  if (hatch > 0.0) {
    float P = uHatchP;
    float st = smoothstep(0.42, 0.42 + fw / P * 1.5, abs(fract((p.x - p.y) / P) - 0.5));
    col = mix(col, mix(col * 0.82, vec3(0.92, 0.9, 0.84), 0.55), hatch * (1.0 - st));
  }
  // borders: a dark line with a soft shadow beside it, like a raised edge
  float bw = max(uBorderW, fw * 1.2);
  float dB = mix(dPre, dPost, uPost);
  float line = smoothstep(bw + aa, bw - aa, dB);
  float shade = smoothstep(bw * 4.0, bw, dB) * 0.28;
  float fw2 = max(bw * 0.45, fw * 0.8);
  float dash = step(0.45, fract((p.x * 0.7 + p.y) / max(bw * 9.0, fw * 14.0)));
  float fineL = smoothstep(fw2 + aa, fw2 - aa, dFine) * uFine * dash;
  col *= 1.0 - shade;
  col = mix(col, vec3(0.07, 0.065, 0.06), max(line * 0.88, fineL * 0.6));
  // coast: a dark rim on the land side
  float rim = smoothstep(bw * 1.3 + aa, bw * 0.3, coast) * 0.85;
  col = mix(col, vec3(0.08, 0.07, 0.06), rim);
  // glowing edge of highlighted regions (inside the region, along its borders)
  col += vec3(1.0, 0.95, 0.8) * glow * smoothstep(bw * 5.0, bw, min(dFine, min(dB, coast))) * 0.35;

  // ---- water (sea, lakes, rivers, the canal)
  vec3 wn = seaN(p, fw);
  float fres = pow(1.0 - max(dot(wn, V), 0.0), 3.0);
  float spec = pow(max(dot(reflect(-Ld, wn), V), 0.0), 60.0);
  float wl = dot(wn, Ld);
  vec3 deep = vec3(0.085, 0.20, 0.36), light = vec3(0.24, 0.40, 0.60);
  vec3 wc = mix(deep, light, clamp(0.5 + (wl - 0.8) * 3.0, 0.0, 1.0));
  wc = wc * (0.85 + 0.25 * vnoise(p * 0.004 + uT * 0.003)) + vec3(0.35, 0.42, 0.55) * fres * 0.35 + vec3(1.0, 0.97, 0.9) * spec * 0.45;
  float sh = smoothstep(-bw * 10.0, 0.0, coast) * (1.0 - land);
  wc *= 1.0 - 0.38 * sh; // the land's shadow on the water along the coast
  float water = max(1.0 - land, riv);
  col = mix(col, wc, water);

  // spotlight dim
  float dd = length(p - uFocus);
  col *= 1.0 - uDim * smoothstep(uFocusR, uFocusR * 1.7, dd);
  // outside the map and far away: fog
  // beyond the map's edge the textures clamp (the land runs on); darken it away so the edge never reads
  vec2 ov = max(vec2(0.0), max(-uv, uv - 1.0)) * vec2(bnd.z - bnd.x, bnd.w - bnd.y);
  col *= 1.0 - 0.75 * smoothstep(0.0, 260.0, length(ov));
  float fg = smoothstep(fogN, fogF, vDist);
  gl_FragColor = vec4(mix(col, fogC, fg), 1.0);
}`;

const loadTex = (n: string, nearest = false) => new Promise<THREE.Texture>((res) => new THREE.TextureLoader().load(staticFile(`sixday/map/${n}`), (t) => {
  t.colorSpace = THREE.NoColorSpace; t.flipY = false;
  if (nearest) { t.minFilter = THREE.NearestFilter; t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; }
  else { t.anisotropy = 8; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; }
  res(t);
}));
let texP: Promise<Record<string, THREE.Texture>> | null = null;
const loadAll = () => (texP ??= Promise.all([loadTex('sdf.png'), loadTex('aux.png'), loadTex('ids.png', true)]).then(([sdf, aux, ids]) => ({ sdf, aux, ids })));

export const FOG = '#151614';
export const LIGHT: V3 = [-0.45, 0.75, -0.5];

const GroundMesh: React.FC<{ h: Float32Array; tx: Record<string, THREE.Texture>; g: Ground; cam: CamS; dist: number }> = ({ h, tx, g, cam, dist }) => {
  const geom = useMemo(() => {
    const gm = new THREE.BufferGeometry();
    const pos = new Float32Array(GW * GH * 3);
    for (let r = 0; r < GH; r++) for (let c = 0; c < GW; c++) {
      const k = (r * GW + c) * 3;
      pos[k] = X0 + ((X1 - X0) * c) / (GW - 1); pos[k + 1] = (Math.max(0, h[r * GW + c]) * VEX) / 1000; pos[k + 2] = Z0 + ((Z1 - Z0) * r) / (GH - 1);
    }
    const idx = new Uint32Array((GW - 1) * (GH - 1) * 6);
    let q = 0;
    for (let r = 0; r < GH - 1; r++) for (let c = 0; c < GW - 1; c++) {
      const a = r * GW + c, b = a + 1, d = a + GW, e = d + 1;
      idx[q++] = a; idx[q++] = d; idx[q++] = b; idx[q++] = b; idx[q++] = d; idx[q++] = e;
    }
    gm.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    gm.setIndex(new THREE.BufferAttribute(idx, 1));
    gm.computeVertexNormals();
    return gm;
  }, [h]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, extensions: { derivatives: true } as unknown as THREE.ShaderMaterial['extensions'],
    uniforms: {
      tSdf: { value: tx.sdf }, tAux: { value: tx.aux }, tIds: { value: tx.ids }, bnd: { value: new THREE.Vector4(X0, Z0, X1, Z1) },
      kmpx: { value: KM_PER_PX }, uT: { value: 0 }, uPost: { value: 0 }, uFine: { value: 0 }, uRiver: { value: 1 }, uBorderW: { value: 1 },
      uRiverW: { value: 1 }, uHatchP: { value: 10 }, uDim: { value: 0 }, uFocusR: { value: 100 }, uFocus: { value: new THREE.Vector2() },
      fogN: { value: 1000 }, fogF: { value: 3000 }, fogC: { value: new THREE.Color(FOG) },
      uCol: { value: Array.from({ length: 12 }, () => new THREE.Vector3()) }, uHatch: { value: new Array(12).fill(0) }, uGlow: { value: new Array(12).fill(0) },
      uOther: { value: new THREE.Vector3(0.55, 0.5, 0.42) }, L: { value: new THREE.Vector3(...LIGHT) }, camP: { value: new THREE.Vector3() },
    },
  }), [tx]);
  skirtMat = mat;
  const u = mat.uniforms;
  for (let i = 0; i < 12; i++) {
    const c = g.col[i] ?? [0.5, 0.5, 0.5];
    (u.uCol.value as THREE.Vector3[])[i].set(c[0], c[1], c[2]);
    (u.uHatch.value as number[])[i] = g.hatch[i] ?? 0;
    (u.uGlow.value as number[])[i] = g.glow[i] ?? 0;
  }
  u.uT.value = g.t; u.uPost.value = g.post; u.uFine.value = g.fine; u.uRiver.value = g.river;
  u.uBorderW.value = Math.max(0.12, dist * 0.0014); u.uRiverW.value = Math.max(0.25, dist * 0.0022); u.uHatchP.value = Math.max(1.2, dist * 0.016);
  u.uDim.value = g.dim; (u.uFocus.value as THREE.Vector2).set(...g.focus); u.uFocusR.value = g.focusR;
  (u.camP.value as THREE.Vector3).set(...cam.pos);
  u.fogN.value = dist * 1.6; u.fogF.value = dist * 4.5;
  return <mesh geometry={geom} material={mat} />;
};

/** A big flat skirt round the map (just under it) drawn with the same shader, so wide shots never see an edge. */
let skirtMat: THREE.ShaderMaterial | null = null;
const Skirt: React.FC = () => (skirtMat ? <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} material={skirtMat}><planeGeometry args={[7000, 7000, 1, 1]} /></mesh> : null);

const CamRig: React.FC<{ cam: CamS }> = ({ cam }) => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos); c.fov = cam.fov; c.up.set(0, 1, 0); c.lookAt(...cam.look);
  if (cam.roll) c.rotateZ((cam.roll * Math.PI) / 180);
  c.near = Math.max(0.05, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]) * 0.004); c.far = 20000;
  c.updateProjectionMatrix();
  return null;
};

const camObj = new THREE.PerspectiveCamera(30, 16 / 9, 0.3, 20000);
/** Screen position (px, in a w x hgt frame) of a scene point; [x, y, inFront, distance]. */
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

/** The map scene. `children` are three.js objects in scene coordinates (units, cities, labels, arrows, jets ...). */
export const World: React.FC<{ h: Float32Array; cam: CamS; width: number; height: number; g: Ground; children?: React.ReactNode }> = ({ h, cam, width, height, g, children }) => {
  const dist = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  const [tx, setTx] = useState<Record<string, THREE.Texture> | null>(null);
  const [handle] = useState(() => delayRender('sd world'));
  useEffect(() => { loadAll().then(setTx); }, []);
  useEffect(() => { if (tx) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)))); }, [tx, handle]);
  if (!tx) return <div style={{ width, height, background: FOG }} />;
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: cam.fov, near: 0.3, far: 20000, position: cam.pos }} gl={{ antialias: true, preserveDrawingBuffer: true }} style={{ background: FOG }}>
      <CamRig cam={cam} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[LIGHT[0] * 1000, LIGHT[1] * 1000, LIGHT[2] * 1000]} intensity={2.2} />
      <GroundMesh h={h} tx={tx} g={g} cam={cam} dist={dist} />
      <Skirt />
      {children}
    </ThreeCanvas>
  );
};
