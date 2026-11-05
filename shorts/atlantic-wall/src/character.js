// A skinned, realistic-proportioned soldier built entirely in code:
//   one continuous SDF-sculpted body (clothes included) bound to a real skeleton (smooth deformation, no seams),
//   a high-resolution sculpted head, two five-fingered skinned hands, a Brodie helmet and webbing.
// API: const c = new Character(); scene.add(c.group);
//      c.rot(name, [x, y, z] degrees)  local rotation from rest   ·  c.curl(side, amount 0..1, thumb)  fingers
//      c.reachArm(side, worldTarget, worldPole) / c.plantLeg(side, worldTarget, worldPole)   two-bone IK
//      c.socket(side) -> Object3D in the palm for props   ·   c.reset()
import * as THREE from 'three';
import { sphere, ellipsoid, capsule, rbox, smin, smax, ssub, noise3, mesh } from './core/sdf.js';
import { NOISE } from './world.js';

const D = THREE.MathUtils.degToRad;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function segDist(p, a, b) { const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]]; const l = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
  const h = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / (l || 1))); return Math.hypot(ap[0] - ab[0] * h, ap[1] - ab[1] * h, ap[2] - ab[2] * h); }

// rest-pose joints (feet at y = 0, facing +z; side s = +1 is the +x side)
const J = {
  hips: [0, 0.94, 0], spine: [0, 1.05, 0], chest: [0, 1.23, 0], neck: [0, 1.47, -0.01], head: [0, 1.585, 0.0],
  sh: (s) => [s * 0.195, 1.405, -0.015], el: (s) => [s * 0.272, 1.128, -0.035], wr: (s) => [s * 0.33, 0.892, -0.005],
  th: (s) => [s * 0.096, 0.915, 0], kn: (s) => [s * 0.1, 0.505, 0.012], an: (s) => [s * 0.104, 0.095, -0.012], toe: (s) => [s * 0.106, 0.03, 0.135],
};
const REG = { skin: 0, shirt: 1, shorts: 2, sock: 3, boot: 4, sole: 5 };
const COL = { skin: [0.62, 0.36, 0.25], shirt: [0.035, 0.045, 0.085], shorts: [0.17, 0.17, 0.19], sock: [0.17, 0.18, 0.1], boot: [0.16, 0.085, 0.045], sole: [0.05, 0.035, 0.025] };

// ── the clothed body SDF (rest pose) ──────────────────────────────────────
function torsoSDF(q) {
  let d = ellipsoid(q, [0, 1.3, -0.008], [0.172, 0.15, 0.103]);
  d = smin(d, ellipsoid(q, [0, 1.13, 0.0], [0.152, 0.15, 0.102]), 0.06);
  d = smin(d, ellipsoid(q, [0, 1.0, 0.012], [0.148, 0.1, 0.098]), 0.05);
  d = smin(d, ellipsoid(q, [0.066, 1.33, 0.068], [0.074, 0.04, 0.026]), 0.06);                 // pecs: broad and flat
  d = smin(d, ellipsoid(q, [0, 0.915, -0.004], [0.165, 0.1, 0.108]), 0.05);                     // pelvis
  d = smin(d, sphere(q, [0.072, 0.875, -0.052], 0.085), 0.04);                                   // glutes
  d = smin(d, capsule(q, [0.0, 1.42, -0.03], [0.13, 1.405, -0.025], 0.055, 0.05), 0.05);         // trapezius
  d = smin(d, capsule(q, [0, 1.4, -0.012], [0, 1.6, 0.0], 0.054, 0.049), 0.03);                  // neck
  return smin(d, sphere(q, [0.19, 1.395, -0.01], 0.066), 0.045);                               // deltoid
}
function armSDF(q) {
  const y = q[1], sh = J.sh(1), el = J.el(1), wr = J.wr(1);
  let arm = capsule(q, sh, el, 0.053, 0.041);
  arm = smin(arm, ellipsoid(q, lerp3(sh, el, 0.48), [0.046, 0.075, 0.05]), 0.03);                // biceps/triceps
  arm = smin(arm, capsule(q, el, wr, 0.041, 0.028), 0.025);
  arm = smin(arm, ellipsoid(q, lerp3(el, wr, 0.22), [0.043, 0.07, 0.042]), 0.03);                // forearm muscle
  const sleeveY = 1.255;
  if (y > sleeveY - 0.01) arm -= 0.008 * sst(sleeveY - 0.01, sleeveY + 0.01, y);                  // sleeve stands off the arm
  return arm;
}
/** true when a body vertex belongs to the arm on side s (for skin weights) */
export function armOwns(p, s) { const q = [Math.abs(p[0]), p[1], p[2]]; return p[0] * s > 0.1 && armSDF(q) < torsoSDF(q) - 0.002; }
function bodySDF(p) {
  const [x, y, z] = p, ax = Math.abs(x), q = [ax, y, z];
  let d = smin(torsoSDF(q), armSDF(q), 0.035);
  // legs: thigh (shorts to y 0.6), knee, calf, ankle
  const th = J.th(1), kn = J.kn(1), an = J.an(1);
  let leg = capsule(q, th, kn, 0.088, 0.057);
  leg = smin(leg, ellipsoid(q, lerp3(th, kn, 0.4), [0.075, 0.13, 0.08]), 0.04);
  if (y > 0.6) leg -= 0.014 * sst(0.59, 0.62, y);                                                 // loose shorts leg
  leg = smin(leg, sphere(q, [0.1, 0.505, 0.03], 0.05), 0.03);
  leg = smin(leg, capsule(q, kn, an, 0.054, 0.034), 0.03);
  leg = smin(leg, ellipsoid(q, [0.1, 0.36, -0.025], [0.05, 0.1, 0.052]), 0.035);                   // calf
  d = smin(d, leg, 0.03);
  // boots: shaft + foot + sole; rolled sock top
  let boot = capsule(q, [0.104, 0.205, -0.012], [0.104, 0.06, -0.005], 0.05, 0.052);
  boot = smin(boot, rbox(q, [0.106, 0.052, 0.045], [0.048, 0.05, 0.115], 0.035), 0.03);
  boot = Math.min(boot, rbox(q, [0.106, 0.012, 0.045], [0.052, 0.012, 0.122], 0.01));              // sole
  d = smin(d, boot, 0.015);
  d = smin(d, capsule(q, [0.104, 0.215, -0.012], [0.104, 0.235, -0.012], 0.047), 0.01);           // sock roll
  // cloth folds: waist bunching, sleeve and shorts creases
  if (y > 0.95 && y < 1.45 && ax < 0.19) d += 0.0022 * Math.sin(y * 95 + 3 * noise3(x * 8, y * 3, z * 8)) * sst(1.1, 0.96, y);
  if (y > 0.6 && y < 0.95) d += 0.0028 * Math.sin((y + 0.4 * x) * 70 + 4 * noise3(x * 6, y * 4, z * 6));
  return d;
}
function bodyRegion(p) {
  const [x, y] = p, ax = Math.abs(x);
  if (y < 0.022) return 'sole';
  if (y < 0.205) return 'boot';
  if (y < 0.25) return 'sock';
  if (y < 0.6) return 'skin';
  const armZone = ax > 0.205 + Math.max(0, (1.32 - y)) * 0.0 && y < 1.37 && y > 0.75;
  if (armZone) return y > 1.255 ? 'shirt' : 'skin';
  if (y > 1.462) return 'skin';
  if (y > 0.985) return 'shirt';
  return 'shorts';
}

// ── head SDF (local to the head joint) ────────────────────────────────────
function headSDF(p) {
  const [x, y, z] = p, ax = Math.abs(x), q = [ax, y, z];
  let d = ellipsoid(q, [0, 0.105, -0.012], [0.077, 0.094, 0.098]);                                // cranium
  d = smin(d, ellipsoid(q, [0, 0.042, 0.03], [0.062, 0.07, 0.078]), 0.03);                         // face mass
  d = smin(d, ellipsoid(q, [0, -0.02, 0.064], [0.034, 0.025, 0.03]), 0.03);                       // chin
  d = smin(d, capsule(q, [0.056, 0.008, -0.002], [0.03, -0.026, 0.058], 0.021, 0.018), 0.03);     // jaw line
  d = smin(d, sphere(q, [0.042, 0.064, 0.062], 0.021), 0.022);                                    // cheekbone
  d = smin(d, capsule(q, [0.0, 0.1, 0.087], [0.047, 0.101, 0.079], 0.0125, 0.009), 0.02);         // brow ridge
  d = ssub(d, sphere(q, [0.03, 0.08, 0.097], 0.0192), 0.007);                                      // eye socket
  d = smin(d, ellipsoid(q, [0.03, 0.0928, 0.0885], [0.0195, 0.0062, 0.0118]), 0.004);             // upper lid
  d = smin(d, ellipsoid(q, [0.03, 0.0672, 0.0895], [0.0165, 0.0038, 0.0092]), 0.003);             // lower lid
  d = smin(d, capsule(q, [0, 0.093, 0.094], [0, 0.052, 0.114], 0.0075, 0.0105), 0.012);           // nose bridge
  d = smin(d, sphere(q, [0, 0.05, 0.1125], 0.0102), 0.01);                                        // nose tip
  d = smin(d, sphere(q, [0.0118, 0.046, 0.104], 0.0078), 0.008);                                  // nostril wings
  d = ssub(d, sphere(q, [0.0068, 0.0405, 0.107], 0.0024), 0.002);                                 // nostrils (underneath)
  d = smin(d, ellipsoid(q, [0, 0.024, 0.098], [0.021, 0.0062, 0.0095]), 0.008);                    // upper lip
  d = smin(d, ellipsoid(q, [0, 0.012, 0.0955], [0.018, 0.0072, 0.0095]), 0.008);                  // lower lip
  d = ssub(d, capsule(q, [-0.02, 0.018, 0.108], [0.02, 0.018, 0.108], 0.0018), 0.002);            // mouth line
  d = smin(d, ellipsoid(q, [0.077, 0.075, -0.004], [0.011, 0.028, 0.019]), 0.008);                // ear
  d = ssub(d, ellipsoid(q, [0.085, 0.074, 0.0], [0.006, 0.018, 0.011]), 0.004);                   // ear bowl
  d = smin(d, capsule(q, [0, -0.11, -0.012], [0, 0.0, -0.005], 0.05, 0.047), 0.03);               // neck into the body
  return d;
}
function headColor(p) {
  const [x, y, z] = p, ax = Math.abs(x);
  let c = COL.skin.slice();
  const lip = Math.exp(-(((y - 0.017) / 0.011) ** 2)) * Math.exp(-((ax / 0.024) ** 2)) * (z > 0.088 ? 1 : 0);
  c = lerp3(c, [0.5, 0.2, 0.17], 0.55 * lip);
  const brow = Math.exp(-(((y - 0.1045 + 0.08 * (ax - 0.03)) / 0.0042) ** 2)) * Math.exp(-(((ax - 0.031) / 0.017) ** 4)) * (z > 0.075 ? 1 : 0);
  c = lerp3(c, [0.09, 0.06, 0.04], 0.85 * brow);
  const stub = sst(0.055, 0.0, y) * sst(0.0, 0.05, z + 0.02) * (1 - lip) * (y > -0.06 ? 1 : 0) * (ax < 0.07 ? 1 : 0);
  c = lerp3(c, [0.32, 0.23, 0.18], 0.45 * stub);
  const cheek = Math.exp(-(((ax - 0.045) / 0.02) ** 2) - (((y - 0.05) / 0.02) ** 2)); c = lerp3(c, [0.66, 0.3, 0.24], 0.25 * cheek);
  const hairline = sst(0.13, 0.15, y) * sst(0.08, 0.0, z); c = lerp3(c, [0.12, 0.08, 0.05], 0.9 * hairline);
  const nose = Math.exp(-((ax / 0.016) ** 2) - (((y - 0.05) / 0.02) ** 2)) * (z > 0.095 ? 1 : 0); c = lerp3(c, [0.68, 0.3, 0.24], 0.3 * nose);
  const ear = sst(0.068, 0.078, ax) * Math.exp(-(((y - 0.075) / 0.03) ** 2)); c = lerp3(c, [0.66, 0.3, 0.25], 0.35 * ear);
  return c;
}

// ── hand SDF (+x side, hanging along -y, palm facing -x, thumb toward +z) ─
const FING = [{ z: 0.028, l: 0.074 }, { z: 0.009, l: 0.082 }, { z: -0.01, l: 0.077 }, { z: -0.027, l: 0.062 }];
function handSDF(p) {
  let d = rbox(p, [0.0, -0.05, 0.0], [0.013, 0.042, 0.038], 0.012);
  d = smin(d, capsule(p, [0, 0.03, -0.002], [0, -0.03, 0], 0.025, 0.03), 0.02);                   // wrist
  for (const f of FING) { const r0 = 0.0098, r1 = 0.0072, y0 = -0.09;
    d = smin(d, capsule(p, [0, y0, f.z], [0, y0 - f.l, f.z * 1.05], r0, r1), 0.006);
    d = smin(d, sphere(p, [0.0, y0 - 0.002, f.z], 0.011), 0.008); }                                 // knuckle
  d = smin(d, ellipsoid(p, [-0.004, -0.045, 0.034], [0.012, 0.026, 0.014]), 0.012);               // thenar
  d = smin(d, capsule(p, [-0.004, -0.03, 0.038], [-0.008, -0.07, 0.07], 0.012, 0.0095), 0.008);  // thumb
  return d;
}

// ── materials ────────────────────────────────────────────────────────────
function charMaterial() {
  const m = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.6, sheen: 0.3, sheenRoughness: 0.7, sheenColor: new THREE.Color('#ffd9c4') });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aReg; varying float vReg; varying vec3 vRest;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n vReg = aReg; vRest = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying float vReg; varying vec3 vRest;\n${NOISE}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        { float r = vReg; roughnessFactor = r < 0.5 ? 0.5 : r < 1.5 ? 0.92 : r < 2.5 ? 0.9 : r < 3.5 ? 0.95 : r < 4.5 ? 0.55 : 0.8; }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        { float r = vReg; vec3 p = vRest;
          if (r > 0.5 && r < 3.5) diffuseColor.rgb *= 0.92 + 0.08*snoise(p*90.0) + 0.05*sin(p.x*1400.0)*sin(p.y*1400.0);
          if (r < 0.5) diffuseColor.rgb *= 0.95 + 0.05*snoise(p*60.0);
          if (r > 3.5 && r < 4.5) diffuseColor.rgb *= 0.85 + 0.25*smoothstep(0.2, 0.8, snoise(p*25.0)); }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { float r = vReg; vec3 p = vRest; float a = 0.0;
          vec3 g = vec3(snoise(p*900.0+3.1), snoise(p*900.0+7.7), snoise(p*900.0+1.3));
          a = r < 0.5 ? 0.06 : (r < 3.5 ? 0.12 : 0.08);
          normal = normalize(normal + (viewMatrix * vec4(g * a, 0.0)).xyz); }`)
      .replace('#include <opaque_fragment>', `
        if (vReg < 0.5) { float lum = dot(outgoingLight, vec3(0.2126,0.7152,0.0722)); float sss = smoothstep(0.5, 0.03, lum);
          outgoingLight = mix(outgoingLight, outgoingLight*vec3(1.25,0.92,0.82) + vec3(0.015,0.003,0.0), 0.6*sss); }
#include <opaque_fragment>`);
  };
  m.customProgramCacheKey = () => 'char-v1';
  return m;
}

// ── skinning helpers ─────────────────────────────────────────────────────
function skinGeometry(geo, segs, power = 6) {   // segs: [{ bone index, a:[x,y,z], b:[x,y,z], mask?(p) }]
  const pos = geo.attributes.position, n = pos.count, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), p = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    p[0] = pos.getX(i); p[1] = pos.getY(i); p[2] = pos.getZ(i);
    const ws = segs.map((s) => ({ b: s.bone, w: s.mask && !s.mask(p) ? 0 : 1 / Math.pow(segDist(p, s.a, s.b) + 0.012, power) }));
    ws.sort((a, b) => b.w - a.w); const top = ws.slice(0, 4), sum = top.reduce((a, b) => a + b.w, 0) || 1;
    top.forEach((t, k) => { si[i * 4 + k] = t.b; sw[i * 4 + k] = t.w / sum; });
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
}

export class Character {
  constructor() {
    this.group = new THREE.Group();
    const bones = [], B = {}, mk = (name, parent, worldPos) => { const b = new THREE.Bone(); b.name = name; b.userData.wp = worldPos; bones.push(b); B[name] = b;
      if (parent) { b.position.set(worldPos[0] - parent.userData.wp[0], worldPos[1] - parent.userData.wp[1], worldPos[2] - parent.userData.wp[2]); parent.add(b); } else b.position.set(...worldPos); return b; };
    const root = mk('root', null, [0, 0, 0]);
    mk('hips', root, J.hips); mk('spine', B.hips, J.spine); mk('chest', B.spine, J.chest); mk('neck', B.chest, J.neck); mk('head', B.neck, J.head);
    for (const s of [1, -1]) { const k = s > 0 ? 'P' : 'N';
      mk('dl' + k, B.chest, J.sh(s)); mk('sh' + k, B.chest, J.sh(s)); mk('el' + k, B['sh' + k], J.el(s)); mk('wr' + k, B['el' + k], J.wr(s));
      mk('th' + k, B.hips, J.th(s)); mk('kn' + k, B['th' + k], J.kn(s)); mk('an' + k, B['kn' + k], J.an(s));
      FING.forEach((f, i) => { let par = B['wr' + k]; const y0 = J.wr(s)[1] - 0.09; let yy = y0; const segL = [0.42, 0.33, 0.25].map((q) => q * f.l);
        for (let j = 0; j < 3; j++) { const wp = [J.wr(s)[0], yy, J.wr(s)[2] + f.z]; par = mk(`f${i}${j}${k}`, par, wp); yy -= segL[j]; } });
      let par = B['wr' + k]; [[-0.004, -0.03, 0.038], [-0.006, -0.05, 0.054], [-0.008, -0.066, 0.068]].forEach((o, j) => { par = mk(`t${j}${k}`, par, [J.wr(s)[0] - s * o[0] * 0 + o[0] * s, J.wr(s)[1] + o[1], J.wr(s)[2] + o[2]]); });
    }
    this.B = B; this.bones = bones;
    const skeleton = new THREE.Skeleton(bones), idx = (n) => bones.indexOf(B[n]);
    this.mat = charMaterial();

    // body
    const body = mesh(bodySDF, [[-0.36, -0.005, -0.18], [0.36, 1.66, 0.22]], 0.0052, (p) => COL[bodyRegion(p)]);
    const reg = new Float32Array(body.attributes.position.count); for (let i = 0; i < reg.length; i++) reg[i] = REG[bodyRegion([body.attributes.position.getX(i), body.attributes.position.getY(i), body.attributes.position.getZ(i)])];
    body.setAttribute('aReg', new THREE.BufferAttribute(reg, 1));
    const notArm = (p) => !armOwns(p, 1) && !armOwns(p, -1) || p[1] > 1.36;
    const segs = [{ bone: idx('hips'), a: [0, 0.86, 0], b: J.spine, mask: notArm }, { bone: idx('spine'), a: J.spine, b: J.chest, mask: notArm }, { bone: idx('chest'), a: J.chest, b: [0, 1.42, 0], mask: notArm }, { bone: idx('neck'), a: [0, 1.44, 0], b: [0, 1.62, 0] }];
    for (const s of [1, -1]) { const k = s > 0 ? 'P' : 'N', side = (p) => p[0] * s > 0.0;
      segs.push({ bone: idx('chest'), a: [s * 0.06, 1.38, 0], b: [s * 0.15, 1.4, -0.01], mask: side });
      segs.push({ bone: idx('dl' + k), a: [s * 0.15, 1.4, -0.012], b: lerp3(J.sh(s), J.el(s), 0.12), mask: (p) => p[0] * s > 0.12 && p[1] > 1.25 });
      segs.push({ bone: idx('sh' + k), a: lerp3(J.sh(s), J.el(s), 0.25), b: J.el(s), mask: (p) => armOwns(p, s) }); segs.push({ bone: idx('el' + k), a: J.el(s), b: J.wr(s), mask: (p) => armOwns(p, s) });
      segs.push({ bone: idx('th' + k), a: J.th(s), b: J.kn(s), mask: (p) => p[0] * s > 0.0 && p[1] < 0.97 }); segs.push({ bone: idx('kn' + k), a: J.kn(s), b: J.an(s), mask: (p) => p[0] * s > 0.0 });
      segs.push({ bone: idx('an' + k), a: J.an(s), b: J.toe(s), mask: (p) => p[0] * s > 0.0 && p[1] < 0.24 }); }
    skinGeometry(body, segs, 7);
    const bodyM = new THREE.SkinnedMesh(body, this.mat); bodyM.castShadow = bodyM.receiveShadow = true; bodyM.frustumCulled = false;
    bodyM.add(root); bodyM.bind(skeleton); this.group.add(bodyM); this.body = bodyM;

    // head (rigid on the head bone, sculpted finer)
    const hg = mesh(headSDF, [[-0.1, -0.12, -0.12], [0.1, 0.21, 0.135]], 0.0022, headColor);
    const hreg = new Float32Array(hg.attributes.position.count).fill(0); hg.setAttribute('aReg', new THREE.BufferAttribute(hreg, 1));
    const head = new THREE.Mesh(hg, this.mat); head.castShadow = head.receiveShadow = true; head.scale.setScalar(1.07); head.position.y = -0.008; B.head.add(head); this.headMesh = head;
    // eyes
    const eyeW = new THREE.MeshPhysicalMaterial({ color: '#DDD3C8', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
    const irisTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
      gr.addColorStop(0, '#060504'); gr.addColorStop(0.28, '#0a0806'); gr.addColorStop(0.3, '#4a3a26'); gr.addColorStop(0.75, '#5b4a30'); gr.addColorStop(0.95, '#1e1610'); gr.addColorStop(1, '#1a130d');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 90; i++) { const a = i / 90 * 6.283; g.strokeStyle = 'rgba(20,14,8,0.25)'; g.beginPath(); g.moveTo(64 + Math.cos(a) * 20, 64 + Math.sin(a) * 20); g.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58); g.stroke(); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    this.eyes = [];
    for (const s of [1, -1]) { const e = new THREE.Group(); e.position.set(s * 0.03, 0.08, 0.0795); head.add(e);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.0145, 40, 30), eyeW); e.add(ball);
      const ir = new THREE.Mesh(new THREE.CircleGeometry(0.0074, 40), new THREE.MeshPhysicalMaterial({ map: irisTex, roughness: 0.2, clearcoat: 1 })); ir.position.z = 0.01475;
      const glint = new THREE.Mesh(new THREE.CircleGeometry(0.0013, 16), new THREE.MeshBasicMaterial({ color: '#ffffff' })); glint.position.set(0.0022, 0.0024, 0.0149); e.add(glint); e.add(ir);
      this.eyes.push(e); }

    // hands (skinned to wrist + finger bones)
    this.sockets = {};
    for (const s of [1, -1]) { const k = s > 0 ? 'P' : 'N';
      const hgeo = mesh((p) => handSDF([p[0] * s, p[1], p[2]]), [[-0.05, -0.19, -0.05], [0.05, 0.045, 0.09]], 0.0016, () => COL.skin);
      if (s < 0) hgeo.index.array.reverse();
      const w = J.wr(s), hp = hgeo.attributes.position; for (let i = 0; i < hp.count; i++) hp.setXYZ(i, hp.getX(i) + w[0], hp.getY(i) + w[1], hp.getZ(i) + w[2]);
      hgeo.computeVertexNormals();
      hgeo.setAttribute('aReg', new THREE.BufferAttribute(new Float32Array(hp.count).fill(0), 1));
      const hs = [{ bone: idx('wr' + k), a: [w[0], w[1] + 0.03, w[2]], b: [w[0], w[1] - 0.085, w[2]] }, { bone: idx('el' + k), a: [w[0], w[1] + 0.05, w[2]], b: [w[0], w[1] + 0.2, w[2]] }];
      FING.forEach((f, i) => { const y0 = w[1] - 0.09, L = [0.42, 0.33, 0.25].map((q) => q * f.l); let yy = y0;
        for (let j = 0; j < 3; j++) { hs.push({ bone: idx(`f${i}${j}${k}`), a: [w[0], yy, w[2] + f.z], b: [w[0], yy - L[j], w[2] + f.z * 1.05] }); yy -= L[j]; } });
      const tp = [[-0.004, -0.03, 0.038], [-0.006, -0.05, 0.054], [-0.008, -0.066, 0.068], [-0.009, -0.078, 0.076]].map((o) => [w[0] + o[0] * s, w[1] + o[1], w[2] + o[2]]);
      for (let j = 0; j < 3; j++) hs.push({ bone: idx(`t${j}${k}`), a: tp[j], b: tp[j + 1] });
      skinGeometry(hgeo, hs, 8);
      const hm = new THREE.SkinnedMesh(hgeo, this.mat); hm.castShadow = hm.receiveShadow = true; hm.frustumCulled = false; hm.bind(skeleton, bodyM.bindMatrix); this.group.add(hm);
      const sock = new THREE.Group(); sock.position.set(-s * 0.012, -0.075, 0.012); B['wr' + k].add(sock); this.sockets[k] = sock;
    }

    // helmet (Brodie: shallow bowl, wide flat brim, rolled edge) + chin strap
    const olive = new THREE.MeshPhysicalMaterial({ color: '#4B5532', roughness: 0.62, metalness: 0.3, clearcoat: 0.25, clearcoatRoughness: 0.6 });
    olive.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vO;').replace('#include <begin_vertex>', '#include <begin_vertex>\n vO = position;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vO;\n${NOISE}`).replace('#include <color_fragment>', `#include <color_fragment>\n diffuseColor.rgb *= 0.9 + 0.12*snoise(vO*60.0); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.32,0.3,0.26), 0.6*smoothstep(0.72, 0.85, snoise(vO*45.0)));`); };
    const prof = [[0.0, 0.096], [0.05, 0.092], [0.09, 0.075], [0.118, 0.048], [0.132, 0.02], [0.138, 0.004], [0.17, -0.002], [0.188, -0.004], [0.196, 0.0], [0.198, 0.006], [0.192, 0.004], [0.17, 0.002], [0.135, 0.01], [0.128, 0.03], [0.11, 0.06], [0.07, 0.083], [0.0, 0.088]].map(([r, y]) => new THREE.Vector2(r, y));
    const helm = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), olive); helm.scale.set(0.93, 1, 1.02); helm.position.set(0, 0.137, -0.008); helm.rotation.x = -0.05; helm.castShadow = true; helm.receiveShadow = true; B.head.add(helm); this.helmet = helm;
    const strapM = new THREE.MeshStandardMaterial({ color: '#6B4E30', roughness: 0.85 });
    const chin = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.004, 6, 48, Math.PI), strapM); chin.rotation.set(0, Math.PI / 2, Math.PI); chin.position.set(0, 0.105, 0.018); chin.scale.set(1, 1.42, 0.9); chin.castShadow = true; B.head.add(chin);
    // belt + buckle + pouches + cross strap (on the hips/chest bones)
    const beltM = new THREE.MeshStandardMaterial({ color: '#7A5B37', roughness: 0.8 });
    const belt = new THREE.Mesh(new THREE.TorusGeometry(1, 0.15, 10, 64), beltM); belt.rotation.x = Math.PI / 2; belt.scale.set(0.158, 0.11, 0.155); belt.position.set(0, 0.04, 0.005); belt.castShadow = true; B.hips.add(belt);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.036, 0.01), new THREE.MeshStandardMaterial({ color: '#B39758', metalness: 0.85, roughness: 0.32 })); buckle.position.set(0, 0.04, 0.112); B.hips.add(buckle);
    for (const s of [-1, 1]) { const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.08, 0.045), beltM); pouch.position.set(s * 0.115, 0.02, 0.085); pouch.rotation.y = s * 0.55; pouch.castShadow = true; B.hips.add(pouch); }
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.47, 0.01), beltM); cross.position.set(0.02, 0.06, 0.112); cross.rotation.set(-0.15, 0, -0.6); cross.castShadow = true; B.chest.add(cross);

    this.rest = new Map(bones.map((b) => [b, b.quaternion.clone()]));
    this.reset();
  }
  reset() { this.bones.forEach((b) => b.quaternion.copy(this.rest.get(b))); this.B.hips.position.set(...J.hips); this.group.updateMatrixWorld(true); }
  /** after posing: helper bones follow (deltoids take half the upper-arm rotation, so shoulders don't tear) */
  finish() { for (const k of ['P', 'N']) { const sh = this.B['sh' + k], dl = this.B['dl' + k]; dl.quaternion.copy(this.rest.get(dl)).slerp(sh.quaternion, 0.5); } this.group.updateMatrixWorld(true); }
  rot(name, e) { const b = this.B[name]; b.quaternion.copy(this.rest.get(b)).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(D(e[0] || 0), D(e[1] || 0), D(e[2] || 0), 'YXZ'))); }
  curl(k, a, thumb = a) { for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const s = k === 'P' ? 1 : -1; this.rot(`f${i}${j}${k}`, [0, 0, -s * a * [62, 78, 55][j]]); }
    for (let j = 0; j < 3; j++) { const s = k === 'P' ? 1 : -1; this.rot(`t${j}${k}`, [thumb * 25, 0, -s * thumb * [15, 30, 25][j]]); } }
  socket(k) { return this.sockets[k]; }
  /** generic two-bone IK: rotate bone a (and its child bone b) so the tip of b lands on target, bending toward pole */
  _ik(a, b, c, target, pole) {
    this.group.updateMatrixWorld(true);
    const A = a.getWorldPosition(new THREE.Vector3()), Bp = b.getWorldPosition(new THREE.Vector3()), Cp = c.getWorldPosition(new THREE.Vector3());
    const L1 = A.distanceTo(Bp), L2 = Bp.distanceTo(Cp), T = target.clone(); let d = A.distanceTo(T); d = Math.min(Math.max(d, Math.abs(L1 - L2) + 1e-3), L1 + L2 - 1e-3);
    const n = T.clone().sub(A).normalize(), x = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - x * x));
    const pp = pole.clone().sub(n.clone().multiplyScalar(pole.dot(n))).normalize(), E = A.clone().addScaledVector(n, x).addScaledVector(pp, h), W = A.clone().addScaledVector(n, d);
    const aim = (bone, from, to, childW) => { const cur = childW.clone().sub(from).normalize(), want = to.clone().sub(from).normalize();
      const pq = bone.parent.getWorldQuaternion(new THREE.Quaternion()), wq = bone.getWorldQuaternion(new THREE.Quaternion());
      const nq = new THREE.Quaternion().setFromUnitVectors(cur, want).multiply(wq); bone.quaternion.copy(pq.invert().multiply(nq)); this.group.updateMatrixWorld(true); };
    aim(a, A, E, Bp); const Bn = b.getWorldPosition(new THREE.Vector3()), Cn = c.getWorldPosition(new THREE.Vector3()); aim(b, Bn, W, Cn);
  }
  reachArm(k, target, pole) { this._ik(this.B['sh' + k], this.B['el' + k], this.B['wr' + k], target, pole); }
  plantLeg(k, target, pole) { this._ik(this.B['th' + k], this.B['kn' + k], this.B['an' + k], target, pole); }
}
