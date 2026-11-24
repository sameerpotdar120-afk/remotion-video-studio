import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import gj from '../../public/everest/3d/globe.json';

/**
 * India's drift north on the Midnight globe (tools/everest/build_globe.py). One shader on the sphere: the present-day
 * India is hidden under open sea while a copy of it (its own satellite pixels, a gold rim) slides north by `dlat`
 * degrees, leaving a glowing trail; the strip of sea between its northern edge and Asia's shore (India's present
 * northern edge) is the Tethys, which narrows to nothing at the collision. A simplified illustration ("सरल चित्रण").
 */
const G = gj as unknown as { edge_lon0: number; edge_step: number; edge: (number | null)[]; india_c: [number, number] };
export const INDIA_C = G.india_c;

export const onSphere = (lon: number, lat: number, r = 1): THREE.Vector3 => {
  const phi = ((lon + 180) / 360) * Math.PI * 2, b = (lat * Math.PI) / 180;
  return new THREE.Vector3(-Math.cos(phi) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(phi) * Math.cos(b) * r);
};

const VERT = /* glsl */ `
varying vec3 vP; varying vec3 vN; varying vec3 vW;
void main() { vP = normalize(position); vN = normalize(normalMatrix * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const FRAG = /* glsl */ `
uniform sampler2D tG, tI, tE; uniform float dlat, dlat0, uHide, uTethys, uTrail, uRim, uT, uFlash, uAsia; uniform vec2 cI; uniform vec3 L, camP;
varying vec3 vP; varying vec3 vN; varying vec3 vW;
const float PI = 3.14159265;
vec2 uvOf(float lon, float lat) { return vec2((lon + 180.0) / 360.0, (90.0 - lat) / 180.0); }
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
void main() {
  float lat = degrees(asin(clamp(vP.y, -1.0, 1.0)));
  float lon = degrees(atan(vP.z, -vP.x)) - 180.0;
  if (lon < -180.0) lon += 360.0;
  vec3 col = texture2D(tG, uvOf(lon, lat)).rgb;
  vec3 sea = vec3(0.018, 0.06, 0.1);
  float here = texture2D(tI, uvOf(lon, lat)).r;
  col = mix(col, sea + vec3(0.0, 0.02, 0.03) * vnoise(vec2(lon, lat) * 0.6), here * uHide);
  // the Tethys: between the moving India's north edge and Asia's shore
  float el = texture2D(tE, vec2((lon - 66.0) / 32.0, 0.5)).r * 25.0 + 15.0;
  float inLon = smoothstep(66.2, 69.5, lon) * (1.0 - smoothstep(94.5, 97.8, lon)) * step(15.6, el);
  float moved = texture2D(tI, uvOf(lon, lat - dlat)).r;
  float strip = inLon * smoothstep(el + dlat - 1.2, el + dlat + 0.6, lat) * (1.0 - smoothstep(el - 0.4, el + 1.2, lat)) * (1.0 - moved);
  float wv = 0.5 + 0.5 * sin(lat * 2.2 - uT * 1.8 + sin(lon * 0.7) * 1.5) * sin(lon * 0.9 + uT * 0.7);
  vec3 teth = mix(vec3(0.03, 0.3, 0.6), vec3(0.15, 0.62, 0.92), wv * 0.6);
  col = mix(col, teth, strip * uTethys * 0.62);
  col += vec3(0.1, 0.45, 0.9) * strip * uTethys * 0.12;
  // Asia's southern shore lights up as India arrives
  float shore = inLon * exp(-pow((lat - el - 0.6) / 0.9, 2.0)) * (1.0 - moved);
  col += vec3(1.0, 0.35, 0.15) * shore * uAsia * 0.6;
  // the trail behind India's centre
  float dl = lat - (cI.y + dlat);
  float tr = (1.0 - smoothstep(0.25, 0.9, abs(lon - cI.x))) * step(dlat0 - dlat, dl) * step(dl, 0.0) * exp(dl * 0.08);
  col += vec3(1.0, 0.8, 0.3) * tr * uTrail * 0.9;
  // the moving India: its own satellite pixels, warmed, with a gold rim
  vec2 mu = uvOf(lon, lat - dlat);
  vec4 mi = texture2D(tI, mu);
  vec3 ic = texture2D(tG, mu).rgb * vec3(1.18, 1.05, 0.8) + vec3(0.06, 0.035, 0.0);
  col = mix(col, ic, mi.r);
  col = mix(col, vec3(1.0, 0.82, 0.35), mi.g * uRim);
  col += vec3(1.0, 0.7, 0.25) * mi.g * uRim * 0.5;
  col += vec3(1.0, 0.9, 0.7) * uFlash * shore * 2.0;
  // light
  vec3 n = normalize(vN);
  float lam = max(dot(normalize(vP), normalize(L)), 0.0);
  col *= 0.35 + 0.95 * lam;
  vec3 V = normalize(camP - vW);
  float rim = pow(1.0 - max(dot(normalize(vW), V), 0.0), 3.0);
  col += vec3(0.25, 0.55, 1.0) * rim * 0.55;
  gl_FragColor = vec4(col, 1.0);
}`;

let texP: Promise<THREE.Texture[]> | null = null;
const load = (n: string) => new Promise<THREE.Texture>((res) => new THREE.TextureLoader().load(staticFile(`everest/3d/${n}`), (t) => {
  t.flipY = false; t.anisotropy = 16; t.colorSpace = THREE.NoColorSpace; res(t);
}));
const edgeTex = () => {
  const n = G.edge.length;
  const d = new Uint8Array(n * 4);
  G.edge.forEach((e, i) => { d[i * 4] = e === null ? 0 : Math.round(Math.min(1, Math.max(0, (e - 15) / 25)) * 255); d[i * 4 + 3] = 255; });
  const t = new THREE.DataTexture(d, n, 1, THREE.RGBAFormat);
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.needsUpdate = true;
  return t;
};

const Rig: React.FC<{ lon: number; lat: number; dist: number; roll: number }> = ({ lon, lat, dist, roll }) => {
  const { camera } = useThree();
  camera.position.copy(onSphere(lon, lat, dist));
  camera.up.set(0, 1, 0);
  camera.lookAt(0, 0, 0);
  camera.rotateZ((roll * Math.PI) / 180);
  return null;
};

export type GlobeState = { lon: number; lat: number; dist: number; roll: number; dlat: number; dlat0: number; hide: number; tethys: number; trail: number; rim: number; asia: number; flash: number; t: number };

export const Globe: React.FC<{ s: GlobeState; width: number; height: number }> = ({ s, width, height }) => {
  const [tx, setTx] = useState<THREE.Texture[] | null>(null);
  const [h] = useState(() => delayRender('ev globe'));
  useEffect(() => { (texP ??= Promise.all([load('globe_tex.jpg'), load('globe_india.png')])).then(setTx); }, []);
  useEffect(() => { if (tx) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h)))); }, [tx, h]);
  const mat = useMemo(() => tx && new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      tG: { value: tx[0] }, tI: { value: tx[1] }, tE: { value: edgeTex() }, dlat: { value: 0 }, dlat0: { value: 0 }, uHide: { value: 0 }, uTethys: { value: 0 },
      uTrail: { value: 0 }, uRim: { value: 0 }, uT: { value: 0 }, uFlash: { value: 0 }, uAsia: { value: 0 }, cI: { value: new THREE.Vector2(...INDIA_C) },
      L: { value: new THREE.Vector3() }, camP: { value: new THREE.Vector3() },
    },
  }), [tx]);
  if (!tx || !mat) return <div style={{ width, height, background: '#030a12' }} />;
  const u = mat.uniforms;
  u.dlat.value = s.dlat; u.dlat0.value = s.dlat0; u.uHide.value = s.hide; u.uTethys.value = s.tethys; u.uTrail.value = s.trail; u.uRim.value = s.rim;
  u.uT.value = s.t; u.uFlash.value = s.flash; u.uAsia.value = s.asia;
  (u.L.value as THREE.Vector3).copy(onSphere(s.lon - 40, s.lat + 20, 1));
  (u.camP.value as THREE.Vector3).copy(onSphere(s.lon, s.lat, s.dist));
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 32, near: 0.01, far: 100, position: onSphere(s.lon, s.lat, s.dist).toArray() as [number, number, number] }}
      gl={{ antialias: true, preserveDrawingBuffer: true }} style={{ background: '#030a12' }}>
      <Rig lon={s.lon} lat={s.lat} dist={s.dist} roll={s.roll} />
      <mesh material={mat}><sphereGeometry args={[1, 256, 192]} /></mesh>
      <mesh><sphereGeometry args={[1.045, 96, 64]} /><meshBasicMaterial color="#5f9cff" transparent opacity={0.1} side={THREE.BackSide} /></mesh>
    </ThreeCanvas>
  );
};
