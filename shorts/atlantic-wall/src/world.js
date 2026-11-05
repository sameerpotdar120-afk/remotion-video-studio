// The Atlantic Wall world: terrain (beach -> dunes), sea, sky + clouds, warships, tank, hedgehogs, stakes, bunker.
// Units are metres. Sea level y = 0; the sea is toward -z, the dunes toward +z, the beach runs along x.
import * as THREE from 'three';

export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ── GLSL helpers ──────────────────────────────────────────────────────────
export const NOISE = /* glsl */`
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
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*snoise(p); p*=2.03; a*=0.5; } return s; }
`;

// ── terrain height (JS mirror of TERRAIN_GLSL) ────────────────────────────
export const BUNKER = { x: 7, z: 21.5, base: 0.4, sx: 9.6, sz: 8.4, h: 4.4, wall: 1.9 };
export const MOUND = { v: 1 };
export function ground(x, z) {
  let h = z < 0 ? 0.075 * z : 0.042 * z + 0.12 * (1 - Math.exp(-z * 0.3));
  h += 0.1 * Math.sin(x * 0.21 + z * 0.13) + 0.06 * Math.sin(x * 0.07 - z * 0.31);
  const ridge = 22 + 2.5 * Math.sin(x * 0.07) + 1.2 * Math.sin(x * 0.19 + 1);
  h += 3.4 * Math.exp(-(((z - ridge) / 5.2) ** 2)) * (0.85 + 0.15 * Math.sin(x * 0.11 + 2));
  h += (z > ridge ? 1.2 * (1 - Math.exp(-(z - ridge) * 0.25)) : 0);
  // the bunker mound: sand heaped over the roof
  const bx = (x - BUNKER.x) / (BUNKER.sx * 0.5 + 2.6), bz = (z - BUNKER.z) / (BUNKER.sz * 0.5 + 2.6), br = Math.sqrt(bx * bx + bz * bz);
  const hm = Math.max(h, BUNKER.base + BUNKER.h + 0.5 - 2.4 * Math.max(0, br - 0.62) ** 1.4 * 3.2 * (br > 0.62 ? 1 : 0));
  h = h + (hm - h) * MOUND.v;
  const cx = x - (BUNKER.x + BUNKER.sx / 2), cz = Math.abs(z - BUNKER.z), wdt = 1.25 + cx * 0.28;
  const e = (cz < wdt + 0.6 ? Math.min(1, (wdt + 0.6 - cz) / 0.6) : 0) * Math.max(0, Math.min(1, (cx + 0.3) / 0.5)) * Math.max(0, Math.min(1, (9 - cx) / 2.5));
  h = h + (Math.min(h, BUNKER.base + 0.85 + Math.max(0, cx) * 0.1) - h) * e * MOUND.v;
  return h;
}
const TERRAIN_GLSL = /* glsl */`
uniform vec4 uHole;   // x, z, radius, amount (0..1)
uniform vec4 uCut;    // cut plane x, z0, z1, on
uniform float uMound;
float ground(float x, float z){
  float h = z < 0.0 ? 0.075*z : 0.042*z + 0.12*(1.0-exp(-z*0.3));
  h += 0.1*sin(x*0.21+z*0.13) + 0.06*sin(x*0.07-z*0.31);
  float ridge = 22.0 + 2.5*sin(x*0.07) + 1.2*sin(x*0.19+1.0);
  h += 3.4*exp(-pow((z-ridge)/5.2,2.0))*(0.85+0.15*sin(x*0.11+2.0));
  h += z > ridge ? 1.2*(1.0-exp(-(z-ridge)*0.25)) : 0.0;
  float bx=(x-${BUNKER.x.toFixed(2)})/(${(BUNKER.sx * 0.5 + 2.6).toFixed(2)}), bz=(z-${BUNKER.z.toFixed(2)})/(${(BUNKER.sz * 0.5 + 2.6).toFixed(2)}), br=sqrt(bx*bx+bz*bz);
  float hm = max(h, ${(BUNKER.base + BUNKER.h + 0.5).toFixed(2)} - (br > 0.62 ? 2.4*pow(max(0.0,br-0.62),1.4)*3.2 : 0.0));
  h = mix(h, hm, uMound);
  float cx = x - ${(BUNKER.x + BUNKER.sx / 2).toFixed(2)}, cz = abs(z - ${BUNKER.z.toFixed(2)}), wdt = 1.25 + cx*0.28;
  float e = clamp((wdt + 0.6 - cz)/0.6, 0.0, 1.0) * clamp((cx + 0.3)/0.5, 0.0, 1.0) * clamp((9.0 - cx)/2.5, 0.0, 1.0);
  h = mix(h, min(h, ${(BUNKER.base + 0.85).toFixed(2)} + max(0.0, cx)*0.1), e*uMound);
  return h; }
float holeMound(float x, float z){ float r = length(vec2(x-uHole.x, (z-uHole.y)*1.15)); return uHole.w * 0.34 * exp(-pow((r-uHole.z*1.28)/(uHole.z*0.42),2.0)); }
`;
export function holeMound(x, z, H) { const r = Math.hypot(x - H.x, (z - H.z) * 1.15); return H.amt * 0.34 * Math.exp(-(((r - H.r * 1.28) / (H.r * 0.42)) ** 2)); }

function cumulative(n, a, b, dens) {
  const M = 3000, xs = [], cs = [0]; let acc = 0; for (let i = 0; i <= M; i++) xs.push(a + (b - a) * i / M);
  for (let i = 1; i <= M; i++) { acc += (dens(xs[i - 1]) + dens(xs[i])) / 2; cs.push(acc); }
  const out = []; let j = 0; for (let k = 0; k <= n; k++) { const tg = acc * k / n; while (j < M && cs[j + 1] < tg) j++; const f = (tg - cs[j]) / ((cs[j + 1] - cs[j]) || 1); out.push(xs[j] + (xs[Math.min(j + 1, M)] - xs[j]) * f); }
  return out;
}

// ── materials ─────────────────────────────────────────────────────────────
function sandMaterial(U) {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0 });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\nvarying vec3 vWP;\n${TERRAIN_GLSL}`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        { float e = 0.12; float x = position.x, z = position.z;
          float gx = (ground(x+e,z)+holeMound(x+e,z)) - (ground(x-e,z)+holeMound(x-e,z)), gz = (ground(x,z+e)+holeMound(x,z+e)) - (ground(x,z-e)+holeMound(x,z-e));
          objectNormal = normalize(vec3(-gx/(2.0*e), 1.0, -gz/(2.0*e))); }`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n transformed.y = ground(transformed.x, transformed.z) + holeMound(transformed.x, transformed.z);\n vWP = (modelMatrix*vec4(transformed,1.0)).xyz;`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWP; uniform float uTide; uniform vec4 uHole; uniform vec4 uCut;\n${NOISE}
      float sandH(vec3 p){ float rip = sin(p.z*7.5 + 2.2*snoise(vec3(p.x*0.35,0.0,p.z*0.35)) + 0.6*sin(p.x*0.9)); return 0.012*rip*rip + 0.004*snoise(p*9.0) + 0.0012*snoise(p*60.0); }`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        { float r = length(vec2(vWP.x-uHole.x, (vWP.z-uHole.y)*1.15)); if (uHole.w > 0.01 && r < uHole.z * mix(0.2, 1.0, uHole.w) * (0.96 + 0.05*sin(atan(vWP.z-uHole.y, vWP.x-uHole.x)*5.0))) discard;
          if (uCut.w > 0.5 && vWP.x < uCut.x && vWP.z > uCut.y && vWP.z < uCut.z) discard; }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        { vec3 p = vWP; float n1 = snoise(p*0.18), n2 = snoise(p*1.7), n3 = snoise(p*14.0);
          vec3 dry = vec3(0.62,0.42,0.17), dryB = vec3(0.70,0.50,0.23);
          vec3 c = mix(dry, dryB, 0.5+0.5*n1) * (0.95 + 0.05*n2 + 0.035*n3);
          float speck = smoothstep(0.82, 0.95, snoise(p*38.0)); c = mix(c, vec3(0.28,0.21,0.14), 0.35*speck);
          float wetLine = 0.32 + uTide + 0.05*sin(p.x*0.5 + n1*2.0);
          float wet = 1.0 - smoothstep(wetLine-0.06, wetLine+0.18, p.y);
          c = mix(c, vec3(0.30,0.22,0.12)*(0.95+0.05*n2), 0.82*wet);
          float strand = smoothstep(0.03, 0.0, abs(p.y - wetLine - 0.02 - 0.03*n2)); c = mix(c, vec3(0.24,0.20,0.15), 0.5*strand);
          diffuseColor.rgb = c; }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        { float wetLine = 0.32 + uTide; float wet = 1.0 - smoothstep(wetLine-0.06, wetLine+0.18, vWP.y); roughnessFactor = mix(0.93, 0.32, wet); }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { vec3 p = vWP; float e = 0.01; float h0 = sandH(p), hx = sandH(p+vec3(e,0.0,0.0)), hz = sandH(p+vec3(0.0,0.0,e));
          vec3 g = vec3((hx-h0)/e, 0.0, (hz-h0)/e); vec3 nW = normalize(vec3(-g.x, 1.0, -g.z));
          vec3 bump = (viewMatrix * vec4(nW - vec3(0.0,1.0,0.0), 0.0)).xyz; normal = normalize(normal + bump * 1.2); }`);
  };
  m.customProgramCacheKey = () => 'sand-v2';
  return m;
}

export function concreteMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88 });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n vWP = (modelMatrix*vec4(transformed,1.0)).xyz; vWN = normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n${NOISE}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        { vec3 p = vWP; float n1 = snoise(p*0.6), n2 = snoise(p*3.0), n3 = snoise(p*22.0);
          vec3 c = vec3(0.36,0.36,0.34) * (0.9 + 0.07*n1 + 0.04*n2 + 0.03*n3);
          float vert = 1.0 - abs(vWN.y);
          float plank = smoothstep(0.012, 0.0, abs(fract(p.y/0.26)-0.5)-0.488) * vert;            // formwork board lines
          c *= 1.0 - 0.12*plank;
          vec2 uv = abs(vWN.x) > 0.5 ? p.zy : p.xy; if (abs(vWN.y) > 0.5) uv = p.xz;
          vec2 cell = fract(uv/vec2(0.9,0.78)) - 0.5; float tie = smoothstep(0.035, 0.02, length(cell*vec2(0.9,0.78)));
          c = mix(c, vec3(0.42,0.36,0.33), 0.75*tie);
          float stain = smoothstep(0.2, 0.9, snoise(vec3(p.x*0.9, p.y*0.25, p.z*0.9))) * vert; c *= 1.0 - 0.1*stain;
          diffuseColor.rgb = c; }`);
  };
  m.customProgramCacheKey = () => 'concrete-v1';
  return m;
}

function seaMaterial(U, env) {
  const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.06, metalness: 0, envMap: env, envMapIntensity: 0.9, transparent: true, clearcoat: 0.4, clearcoatRoughness: 0.08 });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\nvarying vec3 vWP; uniform float uTime, uTide; uniform vec3 uWave;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec3 wp0 = (modelMatrix*vec4(transformed,1.0)).xyz;
        float wv = 0.07*sin(wp0.z*0.55 - uTime*1.6 + wp0.x*0.05) + 0.04*sin(wp0.x*0.31 + wp0.z*0.2 - uTime*1.1) + 0.025*sin(wp0.x*1.3 - wp0.z*0.9 + uTime*2.0);
        float crest = uWave.y * exp(-pow((wp0.z - uWave.x)/2.2, 2.0)) * (1.0 + 0.15*sin(wp0.x*0.4));
        float flood = uWave.z * smoothstep(uWave.x + 1.5, uWave.x - 4.0, wp0.z);
        transformed.y += wv + uTide + crest + flood; vWP = (modelMatrix*vec4(transformed,1.0)).xyz;`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWP; uniform float uTime, uTide; uniform vec4 uHole; uniform vec4 uCut; uniform float uMound; uniform vec3 uWave;\n${NOISE}\n${TERRAIN_GLSL.replace('uniform vec4 uHole;', '').replace('uniform vec4 uCut;', '').replace('uniform float uMound;', '')}
        float wavesH(vec3 p){ float fade = 1.0 - smoothstep(30.0, 160.0, length(p - cameraPosition)); return 0.05*snoise(vec3(p.x*0.35, uTime*0.4, p.z*0.5)) + 0.022*fade*snoise(vec3(p.x*1.4, uTime*0.9, p.z*1.8)) + 0.004*fade*snoise(vec3(p.x*4.0, uTime*1.4, p.z*5.0)); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        { vec3 p = vWP; float depth = p.y - ground(p.x, p.z);
          vec3 shallow = vec3(0.10,0.50,0.48), mid = vec3(0.02,0.24,0.36), deep = vec3(0.01,0.08,0.18);
          vec3 c = mix(shallow, mid, smoothstep(0.0, 1.6, depth)); c = mix(c, deep, smoothstep(1.6, 9.0, depth));
          float band = sin(p.z*1.4 + uTime*1.3 + snoise(vec3(p.x*0.12,0.0,p.z*0.1))*3.0);
          float foam = smoothstep(0.32, 0.0, depth) * (0.6 + 0.4*smoothstep(0.2,1.0,snoise(vec3(p.x*0.8, uTime*0.5, p.z*0.8))));
          foam = max(foam, smoothstep(0.92, 1.0, band) * smoothstep(1.8, 0.4, depth) * (0.5+0.5*snoise(vec3(p.x*1.5,uTime,p.z*1.5))));
          foam = max(foam, uWave.y > 0.01 ? smoothstep(2.5, 0.0, abs(p.z - uWave.x + 0.6)) * 0.95 : 0.0);
          foam = max(foam, 0.55*smoothstep(0.55, 0.85, snoise(vec3(p.x*0.6, uTime*0.3, p.z*1.2))) * smoothstep(3.0, 6.0, depth) * 0.6);
          c = mix(c, vec3(0.85,0.90,0.92), clamp(foam,0.0,1.0));
          diffuseColor.rgb = c; diffuseColor.a = smoothstep(0.0, 0.18, depth) * 0.97; }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { vec3 p = vWP; float e = 0.05; float h0 = wavesH(p), hx = wavesH(p+vec3(e,0.0,0.0)), hz = wavesH(p+vec3(0.0,0.0,e));
          vec3 nW = normalize(vec3(-(hx-h0)/e, 1.0, -(hz-h0)/e)); normal = normalize((viewMatrix*vec4(nW,0.0)).xyz); }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n roughnessFactor = 0.07;`);
  };
  m.customProgramCacheKey = () => 'sea-v2';
  return m;
}

// ── props ─────────────────────────────────────────────────────────────────
const std = (c, r = 0.7, mt = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: mt });
function shadowAll(g) { g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; }

export function warship(seed = 1, len = 110) {
  const g = new THREE.Group(), hullM = std('#7C848C', 0.75, 0.2), darkM = std('#3E4348', 0.8), deckM = std('#8D8F8C', 0.85), blackM = std('#26282B', 0.6);
  const half = len / 2, bw = len * 0.055;
  const s = new THREE.Shape(); s.moveTo(-half, -bw * 0.85); s.quadraticCurveTo(-half - bw * 0.4, 0, -half, bw * 0.85); s.lineTo(half * 0.55, bw);
  s.quadraticCurveTo(half * 0.95, bw * 0.6, half + bw * 0.2, 0); s.quadraticCurveTo(half * 0.95, -bw * 0.6, half * 0.55, -bw); s.lineTo(-half, -bw * 0.85);
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: len * 0.07, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.3, bevelSegments: 2, curveSegments: 24 }), hullM);
  hull.rotation.x = -Math.PI / 2; hull.position.y = -len * 0.015; g.add(hull);
  const boot = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: len * 0.018, bevelEnabled: false, curveSegments: 24 }), darkM); boot.rotation.x = -Math.PI / 2; boot.position.y = -len * 0.02; boot.scale.set(1.006, 1.012, 1); g.add(boot);
  const deckY = len * 0.055;
  const box = (w, h, d, x, y, z, m = hullM) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y + h / 2, z); g.add(b); return b; };
  box(len * 0.34, len * 0.04, bw * 1.3, -len * 0.02, deckY, 0);
  box(len * 0.16, len * 0.035, bw * 1.0, len * 0.06, deckY + len * 0.04, 0);
  box(len * 0.06, len * 0.03, bw * 0.8, len * 0.1, deckY + len * 0.075, 0, deckM);
  for (let i = 0; i < 2 + (seed % 2); i++) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(len * 0.014, len * 0.017, len * 0.075, 20), hullM); f.position.set(-len * 0.05 - i * len * 0.06, deckY + len * 0.075, 0); f.rotation.z = 0.08; g.add(f);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(len * 0.0145, len * 0.0145, len * 0.008, 20), blackM); cap.position.set(f.position.x + len * 0.003, deckY + len * 0.113, 0); g.add(cap);
  }
  for (const [x, dir] of [[len * 0.3, 1], [len * 0.2, 1], [-len * 0.3, -1]]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(bw * 0.45, bw * 0.55, len * 0.022, 24), hullM); t.position.set(x, deckY + len * 0.011, 0); g.add(t);
    const sh = box(bw * 0.7, len * 0.018, bw * 0.75, x, deckY + len * 0.012, 0);
    for (const zz of [-0.18, 0.18]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, len * 0.11, 10), darkM); b.rotation.z = -dir * (Math.PI / 2 - 0.06); b.position.set(x + dir * len * 0.06, deckY + len * 0.024, zz * bw); g.add(b); }
    void sh;
  }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, len * 0.24, 8), darkM); mast.position.set(len * 0.12, deckY + len * 0.2, 0); g.add(mast);
  const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, bw * 1.3, 6), darkM); yard.rotation.x = Math.PI / 2; yard.position.set(len * 0.12, deckY + len * 0.26, 0); g.add(yard);
  g.userData.funnelTop = V3(-len * 0.05, deckY + len * 0.12, 0);
  return shadowAll(g);
}

export function smokePlume(n = 26, seed = 1) {
  const m = new THREE.MeshStandardMaterial({ color: '#8E9196', roughness: 1, transparent: true, opacity: 0.92 });
  const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 3), m, n); im.castShadow = false;
  im.userData = { n, seed };
  im.userData.update = (t, scale = 1) => {
    const mx = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const k = ((i / n) + t * 0.06 + rnd(i + seed) * 0.05) % 1; const r = (0.8 + 4.5 * k) * scale * (0.8 + 0.4 * rnd(i * 3 + seed));
      mx.compose(V3((-k * 26 + (rnd(i) - 0.5) * 3) * scale, (k * 22 + 0.5 * Math.sin(i)) * scale, (rnd(i * 7) - 0.5) * 4 * scale), new THREE.Quaternion(), V3(r, r, r)); im.setMatrixAt(i, mx); }
    im.instanceMatrix.needsUpdate = true;
  };
  im.userData.update(0); return im;
}

export function tank() {
  const g = new THREE.Group(), olive = new THREE.MeshStandardMaterial({ color: '#6E7D46', roughness: 0.72, metalness: 0.2 }), dark = std('#2A2A26', 0.85), rub = std('#1E1E1C', 0.9);
  const p = new THREE.Shape(); p.moveTo(-2.9, 0.45); p.lineTo(2.3, 0.45); p.lineTo(3.1, 0.95); p.lineTo(2.2, 1.65); p.lineTo(-2.7, 1.65); p.lineTo(-3.0, 1.2); p.lineTo(-2.9, 0.45);
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(p, { depth: 2.5, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 }), olive); hull.position.z = -1.25; g.add(hull);
  for (const s of [-1, 1]) {
    const tr = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.95, 0.62), rub); tr.position.set(0.05, 0.5, s * 1.45); g.add(tr);
    for (let i = 0; i < 6; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.66, 20), dark); w.rotation.x = Math.PI / 2; w.position.set(-2.35 + i * 0.95, 0.45, s * 1.46); g.add(w);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.7, 12), olive); hub.rotation.x = Math.PI / 2; hub.position.copy(w.position); g.add(hub); }
    const fender = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.08, 0.72), olive); fender.position.set(0.05, 1.0, s * 1.45); g.add(fender);
  }
  const tur = new THREE.Group(); tur.position.set(-0.2, 1.65, 0); g.add(tur);
  const tb = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 0.85, 32), olive); tb.position.y = 0.42; tb.scale.set(1.15, 1, 1); tur.add(tb);
  const mant = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.9), olive); mant.position.set(1.25, 0.42, 0); tur.add(mant);
  const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 3.4, 16), olive); gun.rotation.z = -Math.PI / 2; gun.position.set(3.1, 0.45, 0); tur.add(gun);
  const muz = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 16), dark); muz.rotation.z = -Math.PI / 2; muz.position.set(4.75, 0.45, 0); tur.add(muz);
  const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 20), olive); hatch.position.set(-0.3, 0.9, 0.3); tur.add(hatch);
  g.userData.turret = tur;
  return shadowAll(g);
}

export function hedgehogs(n, placeFn) {
  const L = new THREE.Shape(); const a = 0.16, t = 0.022; L.moveTo(0, 0); L.lineTo(a, 0); L.lineTo(a, t); L.lineTo(t, t); L.lineTo(t, a); L.lineTo(0, a); L.lineTo(0, 0);
  const beam = new THREE.ExtrudeGeometry(L, { depth: 2.0, bevelEnabled: false }); beam.translate(-a / 2, -a / 2, -1.0);
  const m = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55, metalness: 0.7 });
  const group = new THREE.Group(), ims = [];
  const base = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.atan(Math.SQRT1_2), 0, Math.PI / 4, 'ZXY'));
  const axes = [new THREE.Quaternion(), new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), Math.PI / 2), new THREE.Quaternion().setFromAxisAngle(V3(1, 0, 0), Math.PI / 2)];
  for (let k = 0; k < 3; k++) { const im = new THREE.InstancedMesh(beam, m, n); im.castShadow = true; im.receiveShadow = true; group.add(im); ims.push(im); }
  const mx = new THREE.Matrix4(), col = new THREE.Color();
  group.userData.set = (i, pos, yaw, s = 1, vis = 1) => {
    const q0 = new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), yaw).multiply(base);
    for (let k = 0; k < 3; k++) { const q = q0.clone().multiply(axes[k]); mx.compose(pos, q, V3(s * vis, s * vis, s * vis)); ims[k].setMatrixAt(i, mx);
      col.setRGB(0.11 + 0.07 * rnd(i * 3), 0.085 + 0.035 * rnd(i * 5), 0.07 + 0.02 * rnd(i * 7)); ims[k].setColorAt(i, col); }
  };
  group.userData.commit = () => ims.forEach((im) => { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; });
  for (let i = 0; i < n; i++) { const p = placeFn(i); group.userData.set(i, p.pos, p.yaw, p.s ?? 1, p.vis ?? 1); }
  group.userData.commit();
  return group;
}

export function stakes(n, placeFn) {
  const wood = std('#6E4E30', 0.85), mineM = new THREE.MeshStandardMaterial({ color: '#4F5A3A', roughness: 0.6, metalness: 0.4 });
  const pole = new THREE.CylinderGeometry(0.09, 0.11, 2.8, 10); pole.translate(0, 1.4, 0);
  const mine = new THREE.CylinderGeometry(0.17, 0.17, 0.1, 24); mine.translate(0, 2.84, 0);
  const cap = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16); cap.translate(0, 2.91, 0);
  const g = new THREE.Group(), ims = [pole, mine, cap].map((geo, k) => { const im = new THREE.InstancedMesh(geo, k ? mineM : wood, n); im.castShadow = true; im.receiveShadow = true; g.add(im); return im; });
  const mx = new THREE.Matrix4();
  g.userData.set = (i, pos, lean, yaw, withMine = 1, s = 1) => { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(lean, yaw, 0, 'YXZ'));
    ims.forEach((im, k) => { mx.compose(pos, q, k && !withMine ? V3(0, 0, 0) : V3(s, s, s)); im.setMatrixAt(i, mx); }); };
  g.userData.commit = () => ims.forEach((im) => (im.instanceMatrix.needsUpdate = true));
  for (let i = 0; i < n; i++) { const p = placeFn(i); g.userData.set(i, p.pos, p.lean, p.yaw, p.mine ?? 1, p.s ?? 1); }
  g.userData.commit(); return g;
}

export function landingCraft() {
  const g = new THREE.Group(), grey = std('#7D8A91', 0.7, 0.25), dk = std('#4A5358', 0.8);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.6, 3.3), grey); hull.position.y = 0.5; g.add(hull);
  const inner = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.4, 2.7), dk); inner.position.set(0.4, 0.95, 0); g.add(inner);
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.9, 3.1), grey); ramp.position.set(5.3, 1.0, 0); g.add(ramp); g.userData.ramp = ramp;
  const wh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 1.6), grey); wh.position.set(-4.3, 1.8, 0.6); g.add(wh);
  return shadowAll(g);
}

export function grassField(count, placeFn) {
  const bl = new THREE.PlaneGeometry(0.06, 1, 1, 4); bl.translate(0, 0.5, 0);
  const pa = bl.attributes.position, cols = [];
  for (let i = 0; i < pa.count; i++) { const y = pa.getY(i); pa.setX(i, pa.getX(i) * (1 - y * 0.92)); pa.setZ(i, 0.18 * y * y); const c = new THREE.Color().lerpColors(new THREE.Color('#6E7A3C'), new THREE.Color('#C9C77A'), y); cols.push(c.r, c.g, c.b); }
  bl.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); bl.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.8 });
  const im = new THREE.InstancedMesh(bl, m, count); im.castShadow = true; im.receiveShadow = true;
  const mx = new THREE.Matrix4(), col = new THREE.Color(); let k = 0;
  for (let i = 0; i < count * 3 && k < count; i++) { const p = placeFn(i); if (!p) continue;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd(i * 3) - 0.5) * 0.5, rnd(i * 5) * 6.28, (rnd(i * 7) - 0.5) * 0.6));
    mx.compose(p.pos, q, V3(1, p.h, 1)); im.setMatrixAt(k, mx); col.setHSL(0.16 + 0.05 * rnd(i * 11), 0.35 + 0.2 * rnd(i * 13), 0.55 + 0.25 * rnd(i * 17)); im.setColorAt(k, col); k++; }
  im.count = k; return im;
}

export function seagull() {
  const g = new THREE.Group(), w = std('#F2F2EE', 0.6), gr = std('#9EA3A8', 0.6), y = std('#E9A23B', 0.5), k = std('#111111', 0.4);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), w); body.scale.set(1.0, 0.85, 1.9); g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.065, 18, 12), w); head.position.set(0, 0.09, 0.18); g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.08, 10), y); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.08, 0.27); g.add(beak);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), k); e.position.set(s * 0.04, 0.11, 0.22); g.add(e);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.28), gr); wing.position.set(s * 0.1, 0.03, -0.02); wing.rotation.z = s * 0.2; g.add(wing); }
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.12), gr); tail.position.set(0, 0.02, -0.24); g.add(tail);
  for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.12, 6), y); leg.position.set(s * 0.04, -0.13, 0); g.add(leg); }
  return shadowAll(g);
}

// ── the world ─────────────────────────────────────────────────────────────
export function buildWorld(E) {
  const scene = new THREE.Scene();
  const U = { uHole: { value: new THREE.Vector4(0, 6, 0.9, 0) }, uCut: { value: new THREE.Vector4(0, 0, 0, 0) }, uTide: { value: 0 }, uTime: { value: 0 }, uMound: { value: 1 }, uWave: { value: new THREE.Vector3(-30, 0, 0) } };

  // sky + clouds (also baked into the environment map)
  const sunDir = V3(-0.42, 0.62, 0.66).normalize();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(9000, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false, uniforms: { uSun: { value: sunDir } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec3 vD; uniform vec3 uSun;
      void main(){ float y = max(vD.y, 0.0);
        vec3 zen = vec3(0.10, 0.36, 0.86), mid = vec3(0.30, 0.58, 0.93), hor = vec3(0.80, 0.89, 0.95);
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, y)); c = mix(c, zen, smoothstep(0.15, 0.85, y));
        float sd = max(dot(vD, uSun), 0.0); c += vec3(1.0, 0.86, 0.62) * (0.18 * pow(sd, 8.0) + 0.6 * pow(sd, 400.0));
        if (vD.y < 0.0) c = hor * 0.92;
        gl_FragColor = vec4(pow(c, vec3(2.2)), 1.0);
#include <colorspace_fragment>
}` }));
  const cloudMat = new THREE.ShaderMaterial({ side: THREE.BackSide, transparent: true, depthWrite: false, fog: false, uniforms: { uTime: U.uTime, uSun: { value: sunDir } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    toneMapped: false,
    fragmentShader: `varying vec3 vD; uniform float uTime; uniform vec3 uSun; ${NOISE}
      void main(){ if (vD.y < 0.015) discard; vec2 p = vD.xz / (vD.y + 0.06) * 1.6 + vec2(uTime*0.01, 0.0);
        float d = fbm(vec3(p*0.9, 0.3)) * 0.9 + 0.35*fbm(vec3(p*2.6, 1.7));
        float cov = smoothstep(0.02, 0.42, d);
        float lit = smoothstep(-0.3, 0.6, fbm(vec3(p*0.9 + uSun.xz*0.08, 0.3)) - d*0.6);
        vec3 col = mix(vec3(0.60,0.66,0.76), vec3(1.0,0.99,0.97), 0.4 + 0.6*lit);
        float a = cov * smoothstep(0.015, 0.12, vD.y) * 0.95;
        gl_FragColor = vec4(pow(col, vec3(2.2)), a);
#include <colorspace_fragment>
}` });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(8000, 64, 32), cloudMat); clouds.renderOrder = -1;
  const envScene = new THREE.Scene(); envScene.add(sky.clone(), clouds.clone());
  const envGround = new THREE.Mesh(new THREE.CircleGeometry(4000, 32), new THREE.MeshBasicMaterial({ color: '#B8A178' })); envGround.rotation.x = -Math.PI / 2; envGround.position.y = -5; envScene.add(envGround);
  const pm = new THREE.PMREMGenerator(E.renderer), env = pm.fromScene(envScene, 0.02, 1, 20000).texture;
  scene.add(sky, clouds); scene.environment = env; scene.environmentIntensity = 0.45;
  scene.fog = new THREE.FogExp2('#CCDFEE', 0.00045);

  // sun + fill
  const sun = new THREE.DirectionalLight('#FFE9CC', 2.9); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0002; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#C9DDF2', '#C49A5E', 0.32));

  // terrain (dense near the action)
  const xs = cumulative(560, -140, 140, (x) => 1 + 7 * Math.exp(-(((x - 3) / 16) ** 2)));
  const zs = cumulative(420, -40, 75, (z) => 1 + 6 * Math.exp(-(((z - 12) / 14) ** 2)));
  const nx = xs.length, nz = zs.length, pos = new Float32Array(nx * nz * 3); let v = 0;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { pos[v++] = xs[i]; pos[v++] = ground(xs[i], zs[j]); pos[v++] = zs[j]; }
  const idx = []; for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, c, b, b, c, d); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); tg.setIndex(idx); tg.computeVertexNormals();
  const sand = sandMaterial(U), terrain = new THREE.Mesh(tg, sand); terrain.receiveShadow = true; terrain.castShadow = true; scene.add(terrain);
  // far ground beyond the dense patch
  const far = new THREE.Mesh(new THREE.PlaneGeometry(4000, 2000), new THREE.MeshStandardMaterial({ color: '#B9925A', roughness: 1 })); far.rotation.x = -Math.PI / 2; far.position.set(0, -6, 900); far.receiveShadow = true; scene.add(far);

  // sea
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(9000, 6000, 400, 300), seaMaterial(U, env)); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0, -2960); sea.receiveShadow = true; scene.add(sea);
  // a fine-grained near-shore sea patch so waves are smooth close up
  const seaNear = new THREE.Mesh(new THREE.PlaneGeometry(300, 60, 600, 160), sea.material); seaNear.rotation.x = -Math.PI / 2; seaNear.position.set(0, 0.002, -10); seaNear.receiveShadow = true; scene.add(seaNear);
  sea.position.z = -10 - 30 - 3000; // the big plane starts where the near patch ends

  // the dug hole: walls + floor, lumpy sand
  const pitG = new THREE.CylinderGeometry(1, 0.62, 1, 64, 6, true); pitG.translate(0, -0.5, 0);
  const pitPA = pitG.attributes.position; for (let i = 0; i < pitPA.count; i++) { const x = pitPA.getX(i), y = pitPA.getY(i), z = pitPA.getZ(i), a = Math.atan2(z, x); const k = 1 + 0.05 * Math.sin(a * 5) + 0.04 * Math.sin(a * 11 + y * 6); pitPA.setX(i, x * k); pitPA.setZ(i, z * k / 1.15); }
  pitG.computeVertexNormals();
  const pitM = new THREE.MeshStandardMaterial({ color: '#7A5A34', roughness: 0.95, side: THREE.BackSide }), pit = new THREE.Mesh(pitG, pitM); pit.receiveShadow = true; scene.add(pit);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(0.62, 48), new THREE.MeshStandardMaterial({ color: '#6A4D2C', roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.scale.y = 1 / 1.15; floor.receiveShadow = true; scene.add(floor);
  const setHole = (x, z, r, amt, depth = 1.1) => { U.uHole.value.set(x, z, r, amt); const top = ground(x, z); pit.visible = floor.visible = amt > 0.01;
    pit.position.set(x, top + 0.02, z); pit.scale.set(r * Math.max(0.2, amt), depth * amt, r * Math.max(0.2, amt)); floor.position.set(x, top + 0.02 - depth * amt + 0.01, z); floor.scale.set(r * Math.max(0.2, amt), r * Math.max(0.2, amt) / 1.15, 1); };

  // sand clods flying from the shovel
  const clodM = new THREE.MeshStandardMaterial({ color: '#A07A48', roughness: 1 });
  const clods = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), clodM, 60); clods.castShadow = true; clods.count = 0; scene.add(clods);

  // ships, smoke
  const ships = [], plumes = [];
  [[-150, -900, 0.0, 130], [-40, -1150, 0.25, 110], [-300, -1300, -0.1, 125], [90, -1400, 0.1, 105]].forEach(([x, z, yaw, len], i) => {
    const s = warship(i + 1, len); s.position.set(x, 0, z); s.rotation.y = Math.PI / 2 + yaw; scene.add(s); ships.push(s);
    const pl = smokePlume(24, i * 13); const ft = s.userData.funnelTop.clone(); s.localToWorld(ft); pl.position.copy(ft); scene.add(pl); plumes.push(pl);
  });

  // bunker (casemate) with an embrasure that faces down the beach (+x), a seaward wing wall, and a cutaway side (-x)
  const B = BUNKER, conc = concreteMaterial(), bunker = new THREE.Group(); bunker.position.set(B.x, B.base, B.z); scene.add(bunker);
  const hx = B.sx / 2, hz = B.sz / 2, wt = B.wall, roofT = 1.9, inH = B.h - roofT;
  const cbox = (w, h, d, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), conc); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; bunker.add(b); return b; };
  cbox(B.sx, 0.5, B.sz, 0, -0.25, 0);                                                    // floor slab
  cbox(B.sx, roofT, B.sz, 0, inH + roofT / 2, 0);                                        // roof
  cbox(B.sx, inH, wt, 0, inH / 2, -hz + wt / 2);                                         // sea wall
  cbox(B.sx, inH, wt, 0, inH / 2, hz - wt / 2);                                          // back wall
  const ew = 1.7, eh = 0.62, ey = 1.25;                                                  // embrasure in the +x wall
  cbox(wt, ey - eh / 2, B.sz - 2 * wt, hx - wt / 2, (ey - eh / 2) / 2, 0);
  cbox(wt, inH - (ey + eh / 2), B.sz - 2 * wt, hx - wt / 2, (ey + eh / 2 + inH) / 2, 0);
  cbox(wt, eh, (B.sz - 2 * wt - ew) / 2, hx - wt / 2, ey, -(ew / 2 + (B.sz - 2 * wt - ew) / 4));
  cbox(wt, eh, (B.sz - 2 * wt - ew) / 2, hx - wt / 2, ey, (ew / 2 + (B.sz - 2 * wt - ew) / 4));
  const westWall = cbox(wt, inH, B.sz - 2 * wt, -hx + wt / 2, inH / 2, 0);
  const wing = cbox(3.6, inH + roofT, wt * 0.9, hx + 1.8, (inH + roofT) / 2 - 0.3, -hz + wt * 0.45);   // seaward shield wall
  void wing;
  // interior: bulb, stove, crates, bench, cards, MG
  const interior = new THREE.Group(); bunker.add(interior);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), new THREE.MeshStandardMaterial({ color: '#FFF4D6', emissive: '#FFE2A8', emissiveIntensity: 6 })); bulb.position.set(-0.3, inH - 0.45, 0.2); interior.add(bulb);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.42, 6), std('#111')); cord.position.set(-0.3, inH - 0.22, 0.2); interior.add(cord);
  const lamp = new THREE.PointLight('#FFD9A0', 16, 10, 1.4); lamp.position.copy(bulb.position); interior.add(lamp);
  const stove = new THREE.Group(); stove.position.set(1.4, 0, 1.6); interior.add(stove); stove.name = 'stove';
  const sb = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.75, 28), std('#232325', 0.5, 0.6)); sb.position.y = 0.42; stove.add(sb);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.16), new THREE.MeshStandardMaterial({ color: '#FFB060', emissive: '#FF8A2A', emissiveIntensity: 5 })); door.position.set(-0.335, 0.4, 0); door.rotation.y = -Math.PI / 2; stove.add(door);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, inH, 12), std('#1A1A1C', 0.5, 0.6)); pipe.position.y = 0.75 + (inH - 0.75) / 2; stove.add(pipe);
  const glow = new THREE.PointLight('#FF8A3A', 3, 4, 2); glow.position.set(-0.6, 0.45, 0); stove.add(glow);
  const woodM = new THREE.MeshStandardMaterial({ color: '#A57C4A', roughness: 0.8 });
  const crate = (w, h, d, x, y, z, r = 0) => { const c = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), woodM); c.position.set(x, y + h / 2, z); c.rotation.y = r; c.castShadow = c.receiveShadow = true; interior.add(c); return c; };
  crate(0.75, 0.55, 0.6, -1.3, 0, 1.1, 0.1); crate(0.6, 0.45, 0.5, -1.25, 0.55, 1.1, -0.15); crate(0.7, 0.5, 0.55, -0.6, 0, 1.25, 0.05);
  const bench = crate(1.6, 0.42, 0.45, 0.2, 0, -0.9, 0); void bench;
  for (let i = 0; i < 5; i++) { const card = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.004, 0.13), std(i % 2 ? '#F4F1E8' : '#E8E2D2', 0.6)); card.position.set(-0.5 + i * 0.07, 0.505, 1.2 + (rnd(i) - 0.5) * 0.08); card.rotation.y = (rnd(i * 3) - 0.5) * 0.8; card.name = 'card'; interior.add(card); }
  const gull = seagull(); gull.position.set(hx - wt * 0.6, ey - eh / 2 + 0.14, 0.4); gull.rotation.y = -Math.PI / 2 - 0.4; bunker.add(gull);
  const mg = new THREE.Group(); mg.position.set(hx - wt - 0.5, 0, 0); bunker.add(mg);
  const tripod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 1.1, 8), std('#222', 0.5, 0.6)); tripod.position.y = 0.55; mg.add(tripod);
  const mgun = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.12), std('#1E1E1E', 0.45, 0.7)); mgun.position.set(0.25, 1.15, 0); mg.add(mgun);
  const mbar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 10), std('#141414', 0.4, 0.8)); mbar.rotation.z = Math.PI / 2; mbar.position.set(1.1, 1.17, 0); mg.add(mbar);
  shadowAll(interior);

  // sand cross-section cap for the cutaway (in the plane x = cutX, facing -x)
  const capM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, side: THREE.DoubleSide });
  capM.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>', '#include <begin_vertex>\n vWP = (modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWP;\n${NOISE}`).replace('#include <color_fragment>', `#include <color_fragment>
      { float n = snoise(vWP*vec3(0.2,1.6,0.2)); float layer = sin(vWP.y*9.0 + n*2.5); vec3 c = mix(vec3(0.40,0.28,0.15), vec3(0.52,0.38,0.21), 0.5+0.5*layer);
        c *= 0.88 + 0.12*smoothstep(-2.0, 4.0, vWP.y); c *= 0.95 + 0.05*snoise(vWP*12.0); diffuseColor.rgb = c; }`);
  };
  const cap = new THREE.Mesh(new THREE.BufferGeometry(), capM); cap.receiveShadow = true; scene.add(cap);
  const setCut = (on, cutX = B.x - hx, z0 = 10, z1 = 40) => {
    U.uCut.value.set(cutX, z0, z1, on ? 1 : 0); cap.visible = on; westWall.visible = !on;
    if (!on) return;
    const by0 = B.base - 0.5, by1 = B.base + B.h, bz0 = B.z - hz, bz1 = B.z + hz, X = cutX - 0.012;
    const pts = [], idx = [];
    const strip = (za, zb, bot, topFn) => { const n = Math.max(2, Math.ceil((zb - za) / 0.2)); const b = pts.length / 3;
      for (let i = 0; i <= n; i++) { const z = za + (zb - za) * i / n; pts.push(X, bot, z, X, topFn(z), z); }
      for (let i = 0; i < n; i++) { const a = b + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } };
    strip(z0, bz0, -20, (z) => ground(cutX, z));            // left of the bunker
    strip(bz1, z1, -20, (z) => ground(cutX, z));            // right of the bunker
    strip(bz0, bz1, by1, (z) => ground(cutX, z));           // sand over the roof
    strip(bz0, bz1, -20, () => by0);                        // ground under the floor
    cap.geometry.dispose(); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(idx);
    g.computeVertexNormals(); cap.geometry = g;
  };
  setCut(false);

  // dune grass (skips the beach and the cutaway slice)
  const grass = grassField(26000, (i) => { const x = -60 + 130 * rnd(i * 2 + 1), z = 13 + 30 * rnd(i * 3 + 2), h = ground(x, z); if (h < 1.5 + 0.6 * rnd(i)) return null;
    if (Math.abs(x - B.x) < hx + 0.3 && Math.abs(z - B.z) < hz + 0.3 && rnd(i * 9) < 0.35) return null;
    return { pos: V3(x, h - 0.03, z), h: 0.35 + 0.55 * rnd(i * 5) }; });
  scene.add(grass);
  const gOrig = []; { const m = new THREE.Matrix4(); for (let i = 0; i < grass.count; i++) { grass.getMatrixAt(i, m); gOrig.push(m.clone()); } }
  let gState = 'x', gCut = [false, 0];
  const updGrass = () => { const on = gCut[0], cutX = gCut[1], mv = Math.round(MOUND.v * 40) / 40, key = on + ':' + cutX + ':' + mv; if (key === gState) return; gState = key;
    const zero = new THREE.Matrix4().makeScale(0, 0, 0), p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), m = new THREE.Matrix4();
    for (let i = 0; i < gOrig.length; i++) { gOrig[i].decompose(p, q, sc);
      if (on && p.x < cutX + 0.4 && p.z > 10 && p.z < 40) { grass.setMatrixAt(i, zero); continue; }
      const nearB = Math.abs(p.x - B.x) < B.sx / 2 + 3 && Math.abs(p.z - B.z) < B.sz / 2 + 3;
      if (nearB && mv < 1) { const k = Math.max(0, (mv - 0.6) / 0.4); p.y = ground(p.x, p.z) - 0.03; m.compose(p, q, sc.clone().multiply(new THREE.Vector3(k, k, k))); grass.setMatrixAt(i, m); }
      else grass.setMatrixAt(i, gOrig[i]); }
    grass.instanceMatrix.needsUpdate = true; };
  const grassMask = (on, cutX) => { gCut = [on, cutX]; updGrass(); };
  const setMound = (v) => { MOUND.v = v; U.uMound.value = v; updGrass(); };

  return { scene, U, sun, sunDir, setHole, clods, ships, plumes, bunker, interior, setCut, grassMask, setMound, terrain, env, gull, lamp, pit, floor, stove, door, glow };
}
