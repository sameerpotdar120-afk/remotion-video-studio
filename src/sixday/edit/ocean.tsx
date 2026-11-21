import React, { useMemo } from 'react';
import * as THREE from 'three';
import { KM_PER_PX, X0, X1, Z0, Z1 } from './geo';

/**
 * A real 3D sea over the map's water: a dense grid that follows the camera, its vertices displaced by Gerstner waves
 * (crests sharpen, troughs widen, the surface really rises and falls), with the fine wind-ripple normals of the
 * reference on top, foam where crests pinch, sky reflection, glints and a darker body in the troughs. It sits on the
 * water only: fragments over land (the coast distance field) are dropped. Wave sizes are in octaves weighted by the
 * view's scale, so there are always visible swells, at any zoom; each moves at its own speed.
 */
const VERT = /* glsl */ `
uniform float uT, uS0, uMix, uLift;
varying vec3 vW; varying vec3 vN; varying float vCrest;
const int NW = 11;
// Gerstner waves for one view scale; two scales (an octave apart) are blended as the camera zooms, so the swells
// never jump or swim.
void gerst(vec2 p, float scale, inout vec3 disp, inout vec3 tx, inout vec3 tz, inout float crest, float w) {
  for (int i = 0; i < NW; i++) {
    float fi = float(i);
    float lam = scale * (0.1 * pow(0.78, fi));
    float k = 6.2832 / lam;
    float a = 1.5708 + 0.55 * sin(fi * 2.1) + 0.18 * cos(fi * 5.3);
    vec2 d = vec2(cos(a), -sin(a));
    float A = lam * 0.022 * w;
    float Q = 0.6;
    float om = 6.2832 * 0.6 / sqrt(lam / scale);
    float ph = k * dot(d, p) - om * uT + fi * 1.37 + log2(scale) * 3.1;
    float c = cos(ph), s = sin(ph);
    disp.x += Q * A * d.x * c; disp.z += Q * A * d.y * c; disp.y += A * s;
    tx += vec3(-Q * d.x * d.x * k * A * s, d.x * k * A * c, -Q * d.x * d.y * k * A * s);
    tz += vec3(-Q * d.x * d.y * k * A * s, d.y * k * A * c, -Q * d.y * d.y * k * A * s);
    crest += max(0.0, s) * Q * k * A;
  }
}
void main() {
  vec3 p = (modelMatrix * vec4(position, 1.0)).xyz;
  vec3 disp = vec3(0.0); vec3 tx = vec3(1.0, 0.0, 0.0), tz = vec3(0.0, 0.0, 1.0);
  float crest = 0.0;
  gerst(p.xz, uS0, disp, tx, tz, crest, 1.0 - uMix);
  gerst(p.xz, uS0 * 2.0, disp, tx, tz, crest, uMix);
  vec3 w = p + disp; w.y += uLift;
  vW = w; vN = normalize(cross(tz, tx)); vCrest = crest;
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
}`;

const FRAG = /* glsl */ `
uniform sampler2D tSdf, tAux; uniform vec4 bnd; uniform float kmpx, uT, uOp;
uniform vec3 L, camP, fogC; uniform float fogN, fogF;
varying vec3 vW; varying vec3 vN; varying float vCrest;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
vec2 ripples(vec2 p, float fw) {
  vec2 g = vec2(0.0); float lam = 60.0;
  for (int k = 0; k < 26; k++) {
    float px = lam / fw; if (px < 2.5) break;
    float wgt = exp(-pow(log2(px / 12.0) / 1.2, 2.0));
    if (wgt > 0.03) {
      float kf = 6.2832 / lam, om = 6.2832 * 1.4 / sqrt(lam);
      for (int j = 0; j < 3; j++) {
        float a = 1.5708 + (float(j) - 1.0) * 0.33 + 0.25 * sin(float(k) * 2.3 + float(j));
        vec2 d = vec2(cos(a), -sin(a));
        float ph = dot(d, p) * kf * (1.0 + 0.13 * float(j)) - uT * om * (1.0 + 0.09 * float(j)) + float(k * 3 + j) * 1.913;
        float st = 0.5 + 0.5 * sin(dot(vec2(-d.y, d.x), p) * kf * 0.23 + float(k + j));
        g += d * cos(ph) * wgt * st * 0.26;
      }
    }
    lam *= 0.72;
  }
  return g;
}
void main() {
  vec2 p = vW.xz;
  vec2 uv = vec2((p.x - bnd.x) / (bnd.z - bnd.x), (p.y - bnd.y) / (bnd.w - bnd.y));
  float coast = (texture2D(tSdf, uv).r * 255.0 - 128.0) / 2.0 * kmpx;
  float fw = max(length(vec2(dFdx(p.x), dFdy(p.x))), length(vec2(dFdx(p.y), dFdy(p.y))));
  float inSea = smoothstep(fw * 1.5, -fw * 0.5, coast);        // 1 on water, fades to 0 just before the shore
  bool outside = uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0;
  if (outside) inSea = 1.0;
  if (inSea < 0.01) discard;
  vec2 rg = ripples(p, fw);
  vec3 n = normalize(vN + vec3(-rg.x, 0.0, -rg.y) * 0.9);
  vec3 V = normalize(camP - vW), Ld = normalize(L);
  float ndv = max(dot(n, V), 0.0);
  float fres = 0.03 + 0.97 * pow(1.0 - ndv, 5.0);
  vec3 R = reflect(-V, n);
  vec3 sky = mix(vec3(0.5, 0.52, 0.68), vec3(0.82, 0.8, 0.93), clamp(R.y * 1.3, 0.0, 1.0));
  float h = clamp(vCrest * 0.8, 0.0, 1.0);
  vec3 body = mix(vec3(0.17, 0.25, 0.38), vec3(0.33, 0.41, 0.56), clamp(0.45 + n.y * 0.0 + dot(n.xz, vec2(0.55, -0.83)) * 3.0, 0.0, 1.0));
  body += vec3(0.05, 0.12, 0.12) * h;                         // light through the thin crests
  vec3 col = mix(body, sky, clamp(fres * 2.0, 0.0, 0.85));
  float spec = pow(max(dot(reflect(-Ld, n), V), 0.0), 120.0);
  col += vec3(1.0, 0.97, 0.9) * spec * 0.9;
  float foam = smoothstep(0.55, 0.95, vCrest) * (0.55 + 0.45 * vnoise(p / max(fw * 6.0, 0.001) + uT * 0.5));
  foam += smoothstep(-fw * 6.0, 0.0, coast) * 0.35 * (0.6 + 0.4 * sin(uT * 2.0 + coast / max(fw, 0.001) * 0.5));  // surf along the shore
  col = mix(col, vec3(0.9, 0.93, 0.95), clamp(foam, 0.0, 0.8));
  float dist = length(camP - vW);
  col = mix(col, fogC, smoothstep(fogN, fogF, dist));
  gl_FragColor = vec4(col, inSea * uOp);
}`;

export const Ocean: React.FC<{ look: [number, number, number]; dist: number; t: number; cam: [number, number, number]; tx: Record<string, THREE.Texture>; fog: [number, number]; light: [number, number, number]; fogC: string; op?: number }> = ({ look, dist, t, cam, tx, fog, light, fogC, op = 1 }) => {
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(1, 1, 360, 360); g.rotateX(-Math.PI / 2); return g; }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: true,
    extensions: { derivatives: true } as unknown as THREE.ShaderMaterial['extensions'],
    uniforms: {
      uT: { value: 0 }, uS0: { value: 100 }, uMix: { value: 0 }, uLift: { value: 0 }, uOp: { value: 1 },
      tSdf: { value: tx.sdf }, tAux: { value: tx.aux }, bnd: { value: new THREE.Vector4(X0, Z0, X1, Z1) }, kmpx: { value: KM_PER_PX },
      L: { value: new THREE.Vector3() }, camP: { value: new THREE.Vector3() }, fogC: { value: new THREE.Color() }, fogN: { value: 1000 }, fogF: { value: 3000 },
    },
  }), [tx]);
  const span = dist * 5.5;
  const cell = span / 360;
  // follow the camera, snapped to the grid cell so the surface does not swim
  const cx = Math.round(look[0] / cell) * cell, cz = Math.round(look[2] / cell) * cell;
  const u = mat.uniforms;
  const lg = Math.log2(dist), s0 = Math.pow(2, Math.floor(lg));
  u.uT.value = t; u.uS0.value = s0; u.uMix.value = lg - Math.floor(lg); u.uLift.value = dist * 0.1 * 0.022 * 2.2; u.uOp.value = op;
  (u.L.value as THREE.Vector3).set(...light); (u.camP.value as THREE.Vector3).set(...cam);
  (u.fogC.value as THREE.Color).set(fogC); u.fogN.value = fog[0]; u.fogF.value = fog[1];
  return <mesh geometry={geo} material={mat} position={[cx, 0, cz]} scale={[span, 1, span]} renderOrder={5} />;
};
