// The leg: a parametric surface (theta around the leg, y up) with a wound field computed in the shader.
// Everything about the wound (gap, swelling, fill, scar) is a function of (l, s) = (lateral metres from the
// wound centreline, height y) plus time uniforms, mirrored in JS (disp()) so thread, cells and vessels sit on it.
import * as THREE from 'three';

export const WOUND = { s0: 0.25, s1: 0.37, th0: 0.32, depth: 0.0026, gap: 0.0018 };

// ---------- the shape ----------
const RK = [[0.04, 0.026], [0.08, 0.029], [0.12, 0.033], [0.18, 0.041], [0.25, 0.050], [0.31, 0.054], [0.37, 0.052],
  [0.43, 0.046], [0.49, 0.045], [0.54, 0.049], [0.60, 0.056], [0.70, 0.063], [0.82, 0.068]];
export function R(y) {
  let i = 0; while (i < RK.length - 2 && RK[i + 1][0] < y) i++;
  const p0 = RK[Math.max(i - 1, 0)], p1 = RK[i], p2 = RK[i + 1], p3 = RK[Math.min(i + 2, RK.length - 1)];
  const t = Math.max(0, Math.min(1, (y - p1[0]) / (p2[0] - p1[0]))), t2 = t * t, t3 = t2 * t;
  return 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
}
const bulge = (y) => 0.011 * Math.exp(-(((y - 0.31) / 0.075) ** 2)) + 0.004 * Math.exp(-(((y - 0.57) / 0.06) ** 2));
const shin = (y) => 0.004 * Math.exp(-(((y - 0.3) / 0.12) ** 2));
/** surface point (person faces -z, right side = +x, calf/back = +z) */
export function P(th, y, out = new THREE.Vector3()) {
  const r = R(y), c = Math.cos(th), s = Math.sin(th);
  const back = Math.max(0, s) ** 1.6 * bulge(y) * 0.55, front = Math.max(0, -s) ** 3 * shin(y);
  const ang = (a) => { let d = th - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return d; };
  const med = 0.0105 * Math.exp(-((ang(Math.PI / 2 + 0.6) / 0.62) ** 2) - (((y - 0.295) / 0.072) ** 2));   // inner calf head (bigger, lower)
  const lat = 0.0072 * Math.exp(-((ang(Math.PI / 2 - 0.6) / 0.55) ** 2) - (((y - 0.325) / 0.064) ** 2));   // outer calf head
  const lo = Math.max(0, Math.min(1, (0.2 - y) / 0.09)), achS = lo * lo * (3 - 2 * lo);
  const ach = achS * (0.0028 * Math.exp(-((ang(Math.PI / 2) / 0.22) ** 2)) - 0.0045 * Math.exp(-(((Math.abs(ang(Math.PI / 2)) - 0.75) / 0.35) ** 2)));
  const knee = -0.0042 * Math.exp(-(((y - 0.505) / 0.032) ** 2)) * Math.max(0, s) ** 3;
  const ankle = 0.0042 * Math.exp(-((ang(0.05) / 0.35) ** 2) - (((y - 0.075) / 0.016) ** 2)) + 0.0036 * Math.exp(-((ang(Math.PI - 0.05) / 0.35) ** 2) - (((y - 0.085) / 0.016) ** 2));
  const rr = r + med + lat + ach + knee + ankle;
  return out.set(rr * c * 1.0, y, rr * 1.06 * s + back - front);
}
export function N(th, y, out = new THREE.Vector3()) {
  const e = 1e-4, a = P(th + e, y), b = P(th - e, y), c = P(th, y + e), d = P(th, y - e);
  const dth = a.sub(b), dy = c.sub(d);
  return out.crossVectors(dy, dth).normalize();
}
// wound centreline (radians) as a function of height
export const thc = (y) => WOUND.th0 + 0.022 * Math.sin(y * 92 + 0.4) + 0.012 * Math.sin(y * 233 + 1.7) + (y - 0.31) * 0.35;

// ---------- the wound field (JS mirror of the GLSL) ----------
const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function taperOf(s, pad = 0) { const t = (s - WOUND.s0 + pad) / (WOUND.s1 - WOUND.s0 + 2 * pad); return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t); }
export function disp(l, s, U) {
  const tp = taperOf(s), al = Math.abs(l), tq = Math.pow(tp, 0.5);
  const gw = Math.max(WOUND.gap * tq * U.open, 0.0013 * tq * (U.chan || 0)) + 1e-6;
  const groove = -WOUND.depth * (1 + 0.5 * (U.chan || 0)) * tq * (1 - sst(gw * 0.55, gw * 1.12, al)) * (1 - U.fill);
  const lip = 0.00035 * tq * U.open * Math.exp(-(((al - gw * 1.3) / 0.0012) ** 2));
  const ts = taperOf(s, 0.012), lumps = 0.84 + 0.13 * Math.sin(6.2832 * (s - WOUND.s0) / 0.0095 + 1.3 + 0.6 * Math.sign(l)) + 0.07 * Math.sin(s * 410 + l * 900);
  const sw = U.swell * 0.0034 * Math.pow(ts, 0.75) * lumps * Math.exp(-(((al - 0.0036) / 0.0052) ** 3));
  const scar = U.scar * 0.00028 * tp * Math.exp(-((l / 0.0017) ** 2));
  return groove + lip + sw + scar;
}
/** world point on the (displaced) skin at lateral l (m), height s, lifted by `lift` along the normal */
export function onSkin(l, s, U, lift = 0, out = new THREE.Vector3()) {
  const th = thc(s) + l / R(s); P(th, s, out); const n = N(th, s);
  return out.addScaledVector(n, disp(l, s, U) + lift);
}
export function frameAt(l, s) {
  const th = thc(s) + l / R(s), n = N(th, s);
  const tl = P(th + 1e-4, s).sub(P(th - 1e-4, s)).normalize();
  const ts = P(thc(s + 1e-4) + l / R(s + 1e-4), s + 1e-4).sub(P(thc(s - 1e-4) + l / R(s - 1e-4), s - 1e-4)).normalize();
  return { n, tl, ts };
}

// ---------- geometry ----------
function cumulativeMap(n, a, b, dens) {   // n+1 samples in [a,b] with density dens(x)
  const M = 4000, xs = [], cs = [0]; let acc = 0;
  for (let i = 0; i <= M; i++) xs.push(a + (b - a) * i / M);
  for (let i = 1; i <= M; i++) { acc += (dens(xs[i - 1]) + dens(xs[i])) / 2; cs.push(acc); }
  const out = []; let j = 0;
  for (let k = 0; k <= n; k++) { const target = acc * k / n; while (j < M && cs[j + 1] < target) j++; const f = (target - cs[j]) / ((cs[j + 1] - cs[j]) || 1); out.push(xs[j] + (xs[Math.min(j + 1, M)] - xs[j]) * f); }
  return out;
}
export function legGeometry({ wound = true, nth = 420, ny = 600, y0 = 0.05, y1 = 0.80 } = {}) {
  const ths = cumulativeMap(nth, WOUND.th0 - Math.PI, WOUND.th0 + Math.PI, (x) => 1 + (wound ? 7 * Math.exp(-(((x - WOUND.th0) / 0.22) ** 2)) + 14 * Math.exp(-(((x - WOUND.th0) / 0.045) ** 2)) : 0));
  const ys = cumulativeMap(ny, y0, y1, (y) => 1 + (wound ? 6 * Math.exp(-(((y - 0.31) / 0.085) ** 2)) : 0));
  const nv = (nth + 1) * (ny + 1);
  const pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3), tl = new Float32Array(nv * 3), ts = new Float32Array(nv * 3), wl = new Float32Array(nv), wsA = new Float32Array(nv);
  const p = new THREE.Vector3(), n = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3();
  let v = 0;
  for (let j = 0; j <= ny; j++) {
    const y = ys[j], r = R(y), c = thc(y);
    for (let i = 0; i <= nth; i++, v++) {
      const th = ths[i]; P(th, y, p); N(th, y, n);
      pos.set([p.x, p.y, p.z], v * 3); nrm.set([n.x, n.y, n.z], v * 3);
      P(th + 1e-4, y, a); P(th - 1e-4, y, b); a.sub(b).normalize(); tl.set([a.x, a.y, a.z], v * 3);
      a.crossVectors(n, a).normalize().negate(); ts.set([a.x, a.y, a.z], v * 3);   // along +y on the surface
      let d = th - c; d = Math.atan2(Math.sin(d), Math.cos(d));
      wl[v] = wound ? d * r : 1.0; wsA[v] = y;
    }
  }
  const idx = new Uint32Array(nth * ny * 6); let k = 0;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nth; i++) {
    const A = j * (nth + 1) + i, B = A + 1, C = A + nth + 1, D = C + 1;
    idx[k++] = A; idx[k++] = C; idx[k++] = B; idx[k++] = B; idx[k++] = C; idx[k++] = D;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  g.setAttribute('aTl', new THREE.BufferAttribute(tl, 3)); g.setAttribute('aTs', new THREE.BufferAttribute(ts, 3));
  g.setAttribute('aWl', new THREE.BufferAttribute(wl, 1)); g.setAttribute('aWs', new THREE.BufferAttribute(wsA, 1));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  // winding check: make faces point outward
  g.computeBoundingSphere();
  return g;
}

// ---------- the skin material ----------
const NOISE = /* glsl */`
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;} vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){ const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx); vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y); vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0)); vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3))); }
`;
const FIELD = /* glsl */`
uniform float uOpen, uFill, uSwell, uScar, uScarK, uGlow, uS0, uS1, uDepth, uGap, uHeal, uChan, uFib, uTis;
float taperOf(float s, float pad){ float t=(s-uS0+pad)/(uS1-uS0+2.0*pad); return (t<=0.0||t>=1.0)?0.0:sin(3.14159265*t); }
float disp(float l, float s){
  float tp=taperOf(s,0.0), al=abs(l), tq=sqrt(tp);
  float gw=max(uGap*tq*uOpen, 0.0013*tq*uChan)+1e-6;
  float groove=-uDepth*(1.0+0.5*uChan)*tq*(1.0-smoothstep(gw*0.55,gw*1.12,al))*(1.0-uFill);
  float lip=0.00035*tq*uOpen*exp(-pow((al-gw*1.3)/0.0012,2.0));
  float ts=taperOf(s,0.012), lumps=0.84+0.13*sin(6.2832*(s-uS0)/0.0095+1.3+0.6*sign(l))+0.07*sin(s*410.0+l*900.0);
  float sw=uSwell*0.0034*pow(ts,0.75)*lumps*exp(-pow((al-0.0036)/0.0052,3.0));
  float scar=uScar*0.00028*tp*exp(-pow(l/0.0017,2.0));
  return groove+lip+sw+scar; }
`;

export function skinMaterial(envMap) {
  const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.52, metalness: 0, sheen: 0.35, sheenRoughness: 0.6, sheenColor: new THREE.Color('#ffd9c0'),
    clearcoat: 0.08, clearcoatRoughness: 0.5, envMap, envMapIntensity: 0.7 });
  const U = {
    uOpen: { value: 1 }, uFill: { value: 0 }, uChan: { value: 0 }, uFib: { value: 0 }, uTis: { value: 0 }, uSwell: { value: 0 }, uScar: { value: 0 }, uScarK: { value: 0 }, uGlow: { value: 0 }, uHeal: { value: 0 },
    uS0: { value: WOUND.s0 }, uS1: { value: WOUND.s1 }, uDepth: { value: WOUND.depth }, uGap: { value: WOUND.gap }, uDetail: { value: 1 },
  };
  m.userData.U = U;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
attribute vec3 aTl; attribute vec3 aTs; attribute float aWl; attribute float aWs;
varying float vWl; varying float vWs; varying vec3 vTlV; varying vec3 vTsV; varying vec3 vTlW; varying vec3 vTsW; varying vec3 vWP;
${FIELD}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
vWl=aWl; vWs=aWs; transformed += normal * disp(aWl, aWs);
vTlV = normalize(normalMatrix * aTl); vTsV = normalize(normalMatrix * aTs);
vTlW = normalize(mat3(modelMatrix) * aTl); vTsW = normalize(mat3(modelMatrix) * aTs);
vWP = (modelMatrix * vec4(transformed,1.0)).xyz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
varying float vWl; varying float vWs; varying vec3 vTlV; varying vec3 vTsV; varying vec3 vTlW; varying vec3 vTsW; varying vec3 vWP;
uniform float uDetail;
${FIELD}
${NOISE}
float skinH(vec3 p){ return 0.000030*snoise(p*2600.0) + 0.000045*snoise(p*900.0) + 0.00006*snoise(p*260.0); }
`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  vec3 p = vWP;
  // base skin: warm tan, mottled, with redness patches, follicle dots and a hair-streak texture
  float n1 = snoise(p*55.0), n2 = snoise(p*240.0), n3 = snoise(p*900.0);
  vec3 base = vec3(0.64,0.31,0.165);
  base = mix(base, vec3(0.62,0.25,0.15), 0.35*smoothstep(-0.2,0.8,n1));
  base *= 0.93 + 0.07*n2 + 0.025*n3;
  float fol = smoothstep(0.62, 0.86, snoise(p*1700.0));
  base *= 1.0 - 0.28*fol*uDetail;
  float streak = snoise(vec3(p.x*1400.0, p.y*90.0, p.z*1400.0));
  base *= 1.0 - 0.10*smoothstep(0.2,0.9,streak);
  // the wound
  float l=vWl, s=vWs, tp=taperOf(s,0.0), al=abs(l), tq=sqrt(tp);
  float gw=max(uGap*tq*uOpen, 0.0013*tq*uChan)+1e-6;
  float gap=(1.0-smoothstep(gw*0.6,gw*1.08,al))*step(0.001,tp);
  vec3 woundIn=mix(vec3(0.16,0.008,0.008), vec3(0.42,0.04,0.03), smoothstep(0.0,gw,al)+0.2*n2);
  vec3 fresh=vec3(0.50,0.11,0.12)*(0.9+0.1*n2+0.06*n3);
  vec3 yel=vec3(0.80,0.52,0.06)*(0.9+0.12*n2+0.05*n3);
  vec3 tis=vec3(0.46,0.12,0.12)*(0.88+0.12*n2+0.06*n3);
  vec3 inside=mix(mix(woundIn, yel, uFib), tis, uTis);
  inside=mix(inside, fresh, uHeal);
  float rim=exp(-pow(al/0.0028,2.0))*tq;
  base=mix(base, vec3(0.42,0.10,0.07), 0.45*rim*uOpen*(1.0-uFill)*(1.0-uHeal));
  float ts=taperOf(s,0.012);
  float swA=uSwell*pow(ts,0.75)*exp(-pow((al-0.0036)/0.0056,4.0));
  base=mix(base, vec3(0.55,0.10,0.12)*(0.88+0.14*n2+0.06*n3), 0.9*smoothstep(0.0,0.7,swA));
  float halo=uSwell*pow(ts,0.9)*exp(-pow((al-0.0098)/0.0028,2.0));
  base=mix(base, vec3(0.62,0.36,0.08), 0.35*halo);
  base=mix(base, inside, gap*(1.0-0.8*uHeal));
  float scarA=uScar*tp*exp(-pow(l/0.0026,2.0));
  base=mix(base, vec3(0.62,0.22,0.20), 0.85*scarA*uScarK);
  diffuseColor.rgb = base;
}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
{ float l=vWl, s=vWs, tp=taperOf(s,0.0), al=abs(l); float gw=max(uGap*sqrt(tp)*uOpen, 0.0013*sqrt(tp)*uChan)+1e-6;
  float gap=(1.0-smoothstep(gw*0.6,gw*1.08,al))*step(0.001,tp);
  float swA=uSwell*pow(taperOf(s,0.012),0.75)*exp(-pow((al-0.0036)/0.0056,4.0));
  roughnessFactor = mix(roughnessFactor, 0.47, smoothstep(0.0,0.8,swA));
  roughnessFactor = mix(roughnessFactor, mix(0.22, 0.4, uTis), gap); }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{ float e=0.00012; float l=vWl, s=vWs;
  float dl=(disp(l+e,s)-disp(l-e,s))/(2.0*e), ds=(disp(l,s+e)-disp(l,s-e))/(2.0*e);
  float h0=skinH(vWP), hl=skinH(vWP+vTlW*e), hs=skinH(vWP+vTsW*e);
  float wfade = 1.0 - 0.92*exp(-pow(l/0.006,2.0))*uSwell;
  dl += uDetail*wfade*(hl-h0)/e; ds += uDetail*wfade*(hs-h0)/e;
  normal = normalize(normal - dl*vTlV - ds*vTsV); }`)
      .replace('#include <opaque_fragment>', `
{ float lum = dot(outgoingLight, vec3(0.2126,0.7152,0.0722));
  float sss = smoothstep(0.55, 0.04, lum);
  outgoingLight = mix(outgoingLight, outgoingLight * vec3(1.22, 0.93, 0.84) + vec3(0.018, 0.004, 0.0), 0.65 * sss);
  outgoingLight = mix(vec3(lum), outgoingLight, 1.06); }
#include <opaque_fragment>`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
{ float tp=taperOf(vWs,0.01); totalEmissiveRadiance += vec3(1.0,0.45,0.15)*uGlow*tp*exp(-pow(vWl/0.005,2.0))*0.6; }`);
  };
  m.customProgramCacheKey = () => 'skin-v3';
  return m;
}
