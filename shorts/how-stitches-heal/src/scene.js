// How stitches heal: one continuous shot. Everything is a pure function of film time t.
import * as THREE from 'three';
import { WOUND, R, P, N, thc, disp, onSkin, frameAt, legGeometry, skinMaterial, taperOf } from './leg.js';
import * as SDF from './core/sdf.js';
import { SHADOW } from './core/engine.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t, a, b) => clamp((t - a) / ((b - a) || 1e-6));
const sm = (x) => x * x * (3 - 2 * x);
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x) => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function buildScene(E, W) {   // W = word-time helper: W('word', line)
  const scene = new THREE.Scene();

  // ── sky + environment light ─────────────────────────────────────────────
  const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, toneMapped: false,
    uniforms: { top: { value: new THREE.Color('#1f78e6') }, hor: { value: new THREE.Color('#bfe8ff') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top, hor; varying vec3 vP; void main(){ float k = smoothstep(-0.35, 0.75, vP.y); gl_FragColor = vec4(mix(hor, top, k), 1.0); }' });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(40, 48, 24), skyMat); scene.add(sky);
  const envScene = new THREE.Scene();
  const envSky = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide,
    vertexShader: skyMat.vertexShader, fragmentShader: 'varying vec3 vP; void main(){ float k = smoothstep(-0.4, 0.8, vP.y); vec3 c = mix(vec3(0.55,0.62,0.66), vec3(0.25,0.5,1.0), k); if (vP.y < -0.05) c = vec3(0.35,0.3,0.27); gl_FragColor = vec4(c*1.1, 1.0); }' }));
  envScene.add(envSky);
  const sunDisk = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(14, 12, 9) }));
  sunDisk.position.set(5, 6, 4); envScene.add(sunDisk);
  const pm = new THREE.PMREMGenerator(E.renderer), env = pm.fromScene(envScene, 0.02).texture;
  scene.environment = env;

  const sunDir = V3(0.55, 0.72, 0.42).normalize();
  const sun = new THREE.DirectionalLight('#fff0dc', 3.4); sun.castShadow = true;
  sun.shadow.mapSize.set(Math.max(SHADOW, 2048), Math.max(SHADOW, 2048)); sun.shadow.bias = -0.00005; sun.shadow.normalBias = 0.0;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#a9d2ff', '#7a5a45', 0.55));
  const bounce = new THREE.DirectionalLight('#ffb48a', 0.35); bounce.position.set(-0.3, -1, 0.2); scene.add(bounce);

  // ── the legs ────────────────────────────────────────────────────────────
  const skin = skinMaterial(env); const SU = skin.userData.U;
  const legR = new THREE.Group(); scene.add(legR);
  const legMesh = new THREE.Mesh(legGeometry({ wound: true }), skin); legMesh.castShadow = true; legMesh.receiveShadow = true; legR.add(legMesh);
  const skinL = skinMaterial(env); const legL = new THREE.Group(); scene.add(legL);
  const lm = new THREE.Mesh(legGeometry({ wound: false, nth: 160, ny: 200 }), skinL); lm.castShadow = true; lm.receiveShadow = true;
  const legLInner = new THREE.Group(); legLInner.add(lm); legLInner.scale.x = -1; legL.add(legLInner);

  // hair (instanced tapered strands, combed down and slightly outward)
  function hair(group, count, avoid, seed) {
    const g = new THREE.CylinderGeometry(0.00002, 0.000065, 1, 3, 3, true); g.translate(0, 0.5, 0);
    const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i); pa.setX(i, pa.getX(i) + 0.0007 * y * y); }
    const mat = new THREE.MeshStandardMaterial({ color: '#2a1c14', roughness: 0.55 });
    const im = new THREE.InstancedMesh(g, mat, count); im.castShadow = false;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), n = new THREE.Vector3(), dir = new THREE.Vector3(), up = V3(0, 1, 0), sc = new THREE.Vector3();
    let k = 0;
    for (let i = 0; k < count && i < count * 4; i++) {
      const y = 0.13 + 0.62 * rnd(i * 3 + seed), th = rnd(i * 7 + seed + 1) * Math.PI * 2;
      if (avoid) { let d = th - thc(y); d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d * R(y)) < 0.011 && y > WOUND.s0 - 0.014 && y < WOUND.s1 + 0.014) continue; }
      P(th, y, p); N(th, y, n);
      const tang = V3(0, -1, 0).addScaledVector(n, -n.dot(V3(0, -1, 0))).normalize();
      const side = new THREE.Vector3().crossVectors(n, tang);
      dir.copy(tang).multiplyScalar(0.8).addScaledVector(n, 0.42 + 0.15 * rnd(i + 9)).addScaledVector(side, (rnd(i + 5) - 0.5) * 0.7).normalize();
      q.setFromUnitVectors(up, dir);
      const L = 0.0018 + 0.003 * rnd(i * 11 + seed);
      m.compose(p.clone().addScaledVector(n, -0.0002), q, sc.set(1, L, 1)); im.setMatrixAt(k++, m);
    }
    im.count = k; group.add(im); return im;
  }
  const QP = new URLSearchParams(location.search);
  if (!QP.has('nohair')) { hair(legR, 34000, true, 1); hair(legLInner, 12000, false, 50); }

  // socks, sneakers, shorts (sculpted, then meshed)
  const fabric = (c, r = 0.85) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, sheen: 0.6, sheenRoughness: 0.8, sheenColor: new THREE.Color('#ffffff'), side: THREE.DoubleSide });
  function sock() {
    const pts = []; for (let i = 0; i <= 20; i++) { const y = 0.03 + 0.1 * i / 20; pts.push(new THREE.Vector2(R(y) * 1.08 + 0.0012 + (i === 20 ? -0.001 : 0), y)); }
    const g = new THREE.LatheGeometry(pts, 96); const m = new THREE.Mesh(g, fabric('#93a9e0')); m.scale.z = 1.06; m.castShadow = m.receiveShadow = true; return m;
  }
  const shoeGeo = SDF.mesh((p) => {
    const sole = SDF.rbox(p, [0, 0.014, -0.055], [0.046, 0.014, 0.135], 0.012);
    let up = SDF.ellipsoid(p, [0, 0.04, -0.075], [0.044, 0.042, 0.125]);
    up = SDF.smin(up, SDF.capsule(p, [0, 0.03, 0.035], [0, 0.075, 0.02], 0.042, 0.038), 0.03);
    up = Math.max(up, -(p[1] - 0.012));
    let d = SDF.smin(sole, up, 0.012);
    d = SDF.smax(d, -SDF.capsule(p, [0, 0.07, 0.01], [0, 0.2, 0.005], 0.031, 0.031), 0.006);
    return d;
  }, [[-0.06, -0.005, -0.21], [0.06, 0.12, 0.1]], 0.0028, (p) => {
    if (p[1] < 0.03) return p[1] < 0.012 ? SDF.rgb('#cfc9bd') : SDF.rgb('#ece8de');
    const lace = p[2] < -0.02 && p[2] > -0.12 && Math.abs(p[0]) < 0.022 && p[1] > 0.06 && Math.sin(p[2] * 330) > 0.55;
    return lace ? SDF.rgb('#d6d3cc') : SDF.rgb('#f4f2ec');
  });
  const shoeMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.4 });
  function shoe() { const m = new THREE.Mesh(shoeGeo, shoeMat); m.castShadow = m.receiveShadow = true; return m; }
  function shorts() {
    const pts = []; for (let i = 0; i <= 24; i++) { const y = 0.565 + 0.3 * i / 24; pts.push(new THREE.Vector2(0.071 + 0.016 * (i / 24) + (i === 0 ? -0.0015 : 0), y)); }
    const g = new THREE.LatheGeometry(pts, 128); const pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), a = Math.atan2(z, x);
      const f = 1 + 0.045 * Math.sin(a * 4 + y * 22 + 0.6 * Math.sin(a * 9)) * Math.min(1, (y - 0.565) * 9) + 0.018 * Math.sin(a * 13 - y * 60) + 0.006 * Math.sin(y * 300 + a * 3);
      pa.setX(i, x * f); pa.setZ(i, z * f * 1.06 + (z > 0 ? 0.004 : 0)); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, fabric('#8f90a6', 0.92)); m.castShadow = m.receiveShadow = true;
    const hem = new THREE.Mesh(new THREE.TorusGeometry(0.0705, 0.0022, 10, 128), fabric('#878aa0', 0.92)); hem.rotation.x = Math.PI / 2; hem.position.y = 0.566; hem.scale.y = 1.06;
    const gr = new THREE.Group(); gr.add(m, hem); return gr;
  }
  legR.add(sock(), shoe(), shorts());
  legLInner.add(sock(), shoe(), shorts());

  // ── wound frame ────────────────────────────────────────────────────────
  const S0 = WOUND.s0, S1 = WOUND.s1, SC = 0.31;
  const Ucur = { open: 1, fill: 0, swell: 0, scar: 0 };
  const C = onSkin(0, SC, { open: 0, fill: 1, swell: 0, scar: 0 });
  const Fc = frameAt(0, SC);

  // ── thread (whip stitch) + needle ──────────────────────────────────────
  const NL = 11, SP = 0.0095, AL = 0.0043;
  const loopEnds = (i) => { const sa = S1 - 0.0085 - i * SP; return { sa, sb: sa - SP * 0.5 }; };
  const threadMat = new THREE.MeshPhysicalMaterial({ color: '#f3f3ef', roughness: 0.38, sheen: 0.4, sheenColor: new THREE.Color('#ffffff'), clearcoat: 0.3, clearcoatRoughness: 0.3, transparent: true });
  const TR = 0.00056;
  const loops = []; for (let i = 0; i < NL; i++) { const m = new THREE.Mesh(new THREE.BufferGeometry(), threadMat); m.castShadow = true; m.frustumCulled = false; scene.add(m); loops.push(m); }
  function loopCurve(i, U, h, f = 1, lift = 0) {
    const { sa, sb } = loopEnds(i), pts = [], n = 28;
    for (let k = 0; k <= n; k++) {
      const u = (k / n) * f, l = lerp(-AL, AL, u), s = lerp(sa, sb, u);
      const hh = h * Math.pow(Math.sin(Math.PI * u), 0.7) - 0.0009 * (1 - Math.sin(Math.PI * u)) + lift;
      pts.push(onSkin(l, s, { ...U, fill: 1 }, hh + TR * 0.6));
    }
    return pts;
  }
  const tube = (mesh, pts, r, seg = 40, rs = 8) => { mesh.geometry.dispose(); mesh.geometry = pts.length > 1 ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, rs, false) : new THREE.BufferGeometry(); };

  const steel = new THREE.MeshPhysicalMaterial({ color: '#d7dbe2', metalness: 1, roughness: 0.18, envMapIntensity: 1.3 });
  const needle = new THREE.Mesh(new THREE.BufferGeometry(), steel); needle.castShadow = true; needle.frustumCulled = false; scene.add(needle);
  const tail = new THREE.Mesh(new THREE.BufferGeometry(), threadMat); tail.castShadow = true; tail.frustumCulled = false; scene.add(tail);
  const cutTail = new THREE.Mesh(new THREE.BufferGeometry(), threadMat.clone()); cutTail.castShadow = true; cutTail.frustumCulled = false; scene.add(cutTail);
  const knot = new THREE.Mesh(new THREE.BufferGeometry(), threadMat); knot.castShadow = true; knot.frustumCulled = false; scene.add(knot);

  // needle path: param q in [0, NL]; frac < 0.72 = over the top, else under the skin to the next loop
  function needlePoint(q, U, h) {
    const i = Math.min(Math.floor(q), NL - 1), f = q - i;
    if (f < 0.72) { const u = f / 0.72; const { sa, sb } = loopEnds(i); const l = lerp(-AL, AL, u), s = lerp(sa, sb, u);
      return onSkin(l, s, { ...U, fill: 1 }, h * Math.pow(Math.sin(Math.PI * u), 0.7) - 0.0009 * (1 - Math.sin(Math.PI * u)) + TR); }
    const u = (f - 0.72) / 0.28, a = loopEnds(i), b = loopEnds(Math.min(i + 1, NL - 1));
    const l = lerp(AL, -AL, u), s = lerp(a.sb, b.sa, u); return onSkin(l, s, U, -0.003 * Math.sin(Math.PI * u) - 0.0012);
  }

  // ── scissors ───────────────────────────────────────────────────────────
  function scissors() {
    const root = new THREE.Group(), halves = [];
    const gold = new THREE.MeshPhysicalMaterial({ color: '#d9b25a', metalness: 1, roughness: 0.25 });
    for (const sgn of [1, -1]) {
      const h = new THREE.Group();
      const sh = new THREE.Shape(); sh.moveTo(0, -0.0045); sh.quadraticCurveTo(0.03, -0.004, 0.068, 0.0004); sh.quadraticCurveTo(0.035, 0.0035, 0, 0.0042); sh.lineTo(-0.012, 0.004); sh.lineTo(-0.012, -0.0045);
      const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.0011, bevelEnabled: true, bevelThickness: 0.0004, bevelSize: 0.0004, bevelSegments: 2, curveSegments: 24 }), steel);
      blade.position.z = sgn > 0 ? 0.0008 : -0.0026; blade.scale.y = sgn;
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0028, 0.03, 12), steel); arm.rotation.z = Math.PI / 2 + sgn * 0.32; arm.position.set(-0.024, -sgn * 0.0048, blade.position.z);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0105, 0.0024, 12, 40), steel); ring.position.set(-0.046, -sgn * 0.013, blade.position.z); ring.scale.set(1.25, 1, 1);
      h.add(blade, arm, ring); h.traverse((o) => { if (o.isMesh) o.castShadow = true; }); halves.push(h); root.add(h);
    }
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.0062, 20), new THREE.MeshPhysicalMaterial({ color: '#d9b25a', metalness: 1, roughness: 0.25 }));
    screw.rotation.x = Math.PI / 2; screw.castShadow = true; root.add(screw);
    root.userData.halves = halves; return root;
  }
  const SCI = scissors(); SCI.visible = false; scene.add(SCI);

  // ── cells (glowing, rushing in) ───────────────────────────────────────
  const NC = 170;
  const cellGeo = new THREE.SphereGeometry(1, 18, 12);
  const cellMat = new THREE.MeshPhysicalMaterial({ color: '#fff3ea', emissive: '#ffe2cc', emissiveIntensity: 1.1, roughness: 0.25, transmission: 0, clearcoat: 0.6, transparent: true });
  const cells = new THREE.InstancedMesh(cellGeo, cellMat, NC); cells.frustumCulled = false; cells.castShadow = true; scene.add(cells);
  const cellData = Array.from({ length: NC }, (_, i) => ({ side: i % 2 ? 1 : -1, s: S0 + 0.004 + (S1 - S0 - 0.008) * rnd(i * 13 + 2), l0: 0.012 + 0.018 * rnd(i * 5 + 1), l1: 0.0015 + 0.003 * rnd(i * 17 + 3), d: rnd(i * 19 + 4) * 0.9, r: 0.0005 + 0.0004 * rnd(i * 23 + 5), w: rnd(i * 29 + 6) * 6.28 }));

  // ── collagen fibres (built on the swollen, still-open wound) ──────────
  const USW = { open: 0.24, fill: 0, swell: 1, scar: 0 };
  const colMat = new THREE.MeshPhysicalMaterial({ color: '#f0cdbd', roughness: 0.4, sheen: 0.6, sheenColor: new THREE.Color('#ffe8e0'), emissive: '#2a120c', emissiveIntensity: 0.3, transparent: true });
  const fibres = [];
  const NF = 76;
  for (let i = 0; i < NF; i++) {
    const fam = i % 2 ? 1 : -1, s = S0 + 0.006 + (S1 - S0 - 0.012) * (Math.floor(i / 2) + 0.5 * (i % 2)) / (NF / 2), span = 0.0021 + 0.0005 * rnd(i * 11);
    const pts = []; for (let k = 0; k <= 12; k++) { const u = k / 12, l = lerp(-span, span, u), ss = s + fam * l * (0.75 + 0.35 * rnd(i * 5)) + 0.00025 * Math.sin(u * 7 + i * 1.7) + 0.0006 * (rnd(i * 9) - 0.5);
      pts.push(onSkin(l, ss, { ...USW, fill: 0.5 }, 0.00022 + 0.00025 * Math.sin(Math.PI * u) + 0.00008 * fam)); }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.00011 + 0.00004 * rnd(i * 13), 6, false);
    const m = new THREE.Mesh(g, colMat); m.userData.t0 = 0.85 * (s - S0) / (S1 - S0) + 0.1 * rnd(i * 31); m.userData.n = g.index.count; m.castShadow = true; scene.add(m); fibres.push(m);
  }

  // ── blood vessels (branching network) ─────────────────────────────────
  const vesMat = new THREE.MeshPhysicalMaterial({ color: '#d4170f', emissive: '#7a0800', emissiveIntensity: 0.55, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2, transparent: true });
  const vessels = [], UV = { open: 0.24, fill: 1, swell: 1, scar: 0 };
  let vid = 0;
  function branch(l, s, dirL, dirS, len, rad, dist, depth) {
    const pts = [], n = Math.max(4, Math.round(len / 0.0009)); let cl = l, cs = s, dl = dirL, ds = dirS; const raw = [[cl, cs]];
    for (let k = 1; k <= n; k++) { const a = (rnd(vid * 7 + k * 3) - 0.5) * 0.9; const c = Math.cos(a), sn = Math.sin(a); [dl, ds] = [dl * c - ds * sn, dl * sn + ds * c];
      const m = Math.hypot(dl, ds); dl /= m; ds /= m; if (Math.abs(cl) > 0.0045) dl -= Math.sign(cl) * 1.4 * (Math.abs(cl) - 0.0045) / 0.001; cl += dl * len / n; cs += ds * len / n; cs = clamp(cs, S0 - 0.006, S1 + 0.006); raw.push([cl, cs]); }
    for (const [a, b] of raw) pts.push(onSkin(a, b, UV, rad * 0.6));
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 3, rad, 6, false);
    const m = new THREE.Mesh(g, vesMat); m.userData = { d0: dist, len, n: g.index.count }; m.castShadow = true; scene.add(m); vessels.push(m); vid++;
    if (depth < 3) { const nb = depth === 0 ? 6 : 2;
      for (let b = 0; b < nb; b++) { const f = (b + 0.5 + 0.4 * (rnd(vid * 5 + b) - 0.5)) / nb, [bl, bs] = raw[Math.floor(f * (raw.length - 1))];
        const side = (b % 2 ? 1 : -1) * (depth === 0 ? 1 : (rnd(vid + b) > 0.5 ? 1 : -1));
        branch(bl, bs, side * 0.9, (rnd(vid * 3 + b) - 0.5) * 1.2, len * (depth === 0 ? 0.22 : 0.5), rad * 0.62, dist + f * len, depth + 1); } }
  }
  [[0.0003, 0.300, 0.1, 1, 0.034], [-0.0003, 0.300, -0.1, -1, 0.05], [0.0005, 0.330, 0.2, 1, 0.04], [-0.0004, 0.275, 0.1, -1, 0.03]].forEach(([l, s0, dl, ds, len], i) => branch(l, s0, dl, ds, len, 0.00062, i * 0.002, 0));

  // ── the timeline ──────────────────────────────────────────────────────
  const T = {
    stitchA: 0.25, stitchB: Math.max(3.4, W('pulls', 0) - 0.5),
    tight: W('pulls', 0), tightE: W('tight', 0) + 0.3,
    sciIn: W('but', 1) - 0.3, snip: W('thread', 1) + 0.12, sciOut: W('together', 1) + 0.2,
    glow: W('takes', 1), swell: W('swells', 2) - 0.6, swellE: W('swells', 2) + 0.7,
    cells: W('rushes', 2) - 0.25, cellsE: W('protect', 2) + 0.7,
    weave: W('weaving', 3) - 0.15, weaveE: W('gap', 3) + 0.3, fill: W('building', 3) - 0.3, fillE: W('skin', 3) + 0.4,
    ves: W('blood', 4) - 0.1, vesE: W('feed', 4) + 0.25, vesFade: W('tissue', 4) + 0.2,
    weeks: W('weeks', 5) - 0.6, heal: W('holds', 5), out: W('stitches', 5) - 0.1,
  };
  const TAIL_CUT = 0.0065;

  function state(t) {
    const tighten = eo(seg(t, T.tight, T.tightE));
    const swell = sm(seg(t, T.swell, T.swellE)) * (1 - eio(seg(t, T.weeks, T.heal + 1.2)));
    const fill = sm(seg(t, T.fill, T.fillE));
    const heal = eio(seg(t, T.weeks, T.heal + 1.0));
    return {
      U: { open: lerp(1, 0.24, tighten) * (1 - heal), fill: Math.min(1, fill + heal), swell, scar: heal },
      tighten, heal, scarK: lerp(1, 0.35, seg(t, T.heal + 0.8, 29.8)),
      glow: Math.exp(-(((t - T.glow - 0.3) / 0.45) ** 2)),
      h: lerp(0.0022, 0.0009, tighten) + 0.0006 * swell,
    };
  }

  // ── camera ────────────────────────────────────────────────────────────
  const cam = new THREE.PerspectiveCamera(38, 1440 / 2560, 0.002, 100);
  const side = new THREE.Vector3().crossVectors(V3(0, 1, 0), Fc.n).normalize();
  // [t, dist, azimuth deg (toward the calf), elevation deg (negative = below), look offset y, fov, roll]
  const K = [
    [0.0, 0.66, 26, -14, 0.04, 38, 0],
    [T.tightE + 0.4, 0.40, 22, -12, 0.03, 36, 0],
    [T.swell, 0.215, 16, -9, 0.004, 35, 2],
    [T.cellsE - 0.2, 0.118, 11, -7, 0.0, 34, 7],
    [T.weave + 1.5, 0.078, 7, -6, -0.002, 34, 12],
    [T.vesE - 0.2, 0.072, 4, -5, -0.004, 34, 13],
    [T.vesFade + 0.3, 0.09, 7, -6, 0.0, 34, 10],
    [T.heal + 0.7, 0.66, 25, -14, 0.045, 38, 1],
    [30.0, 0.78, 28, -15, 0.05, 38, 0],
  ];
  function hermite(k, t) {
    let i = 0; while (i < K.length - 2 && K[i + 1][0] <= t) i++;
    const a = K[i], b = K[i + 1], u = clamp((t - a[0]) / (b[0] - a[0]));
    const prev = K[Math.max(i - 1, 0)], next = K[Math.min(i + 2, K.length - 1)];
    const val = (r, j) => (j === 1 ? Math.log(r[j]) : r[j]);
    const m0 = i === 0 ? 0 : (val(b, k) - val(prev, k)) / (b[0] - prev[0]) * (b[0] - a[0]);
    const m1 = i + 1 >= K.length - 1 ? 0 : (val(next, k) - val(a, k)) / (next[0] - a[0]) * (b[0] - a[0]);
    const u2 = u * u, u3 = u2 * u, v = (2 * u3 - 3 * u2 + 1) * val(a, k) + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * val(b, k) + (u3 - u2) * m1;
    return k === 1 ? Math.exp(v) : v;
  }
  function placeCamera(t) {
    const d = hermite(1, t), az = hermite(2, t) * Math.PI / 180, el = hermite(3, t) * Math.PI / 180, ly = hermite(4, t), fov = hermite(5, t), roll = hermite(6, t) * Math.PI / 180;
    const target = C.clone().add(V3(0, ly, 0)).addScaledVector(Fc.n, -0.0);
    const dir = Fc.n.clone().multiplyScalar(Math.cos(az)).addScaledVector(side, Math.sin(az)); dir.y = 0; dir.normalize();
    const pos = target.clone().addScaledVector(dir, d * Math.cos(el)).add(V3(0, d * Math.sin(el), 0));
    // subtle handheld drift
    pos.x += 0.0025 * d * Math.sin(t * 0.7); pos.y += 0.002 * d * Math.sin(t * 0.53 + 1);
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(target);
    cam.rotateZ(roll); cam.fov = fov; cam.updateProjectionMatrix();
    return { d, focus: pos.distanceTo(C) };
  }

  // ── per-frame update ──────────────────────────────────────────────────
  const tmp = new THREE.Matrix4(), q = new THREE.Quaternion(), vs = new THREE.Vector3();
  function update(t) {
    const st = state(t), U = st.U; Object.assign(Ucur, U);
    const camD = hermite(1, t), TRe = TR * (1 + 0.9 * clamp((camD - 0.15) / 0.45));
    SU.uOpen.value = U.open; SU.uFill.value = U.fill; SU.uSwell.value = U.swell; SU.uScar.value = U.scar; SU.uScarK.value = st.scarK; SU.uGlow.value = st.glow; SU.uHeal.value = st.heal;

    // walking: the far leg swings, the near leg sways a touch
    const ph = t * Math.PI * 2 / 1.15;
    legL.position.set(-0.2, 0, -0.02); legL.rotation.set(0, 0, 0);
    legLInner.position.set(0, 0, 0);
    const swing = 0.32 * Math.sin(ph); legL.position.z = -0.09 + 0.22 * Math.sin(ph); legL.position.y = Math.max(0, 0.05 * Math.sin(ph + 1.6)); legL.rotation.x = -swing * 0.5;
    legR.rotation.x = 0.012 * Math.sin(ph * 0.5);

    // stitching: loops appear as the needle passes
    const qn = NL * eio(seg(t, T.stitchA, T.stitchB)) * 0.999 + (t > T.stitchB ? 0.0 : 0);
    const out = seg(t, T.out, T.out + 0.9);
    for (let i = 0; i < NL; i++) {
      const f = t >= T.stitchB ? 1 : clamp((qn - i) / 0.72);
      const ko = clamp(out * 1.6 - i * 0.055);           // pull-out progress (top first)
      if (f <= 0.02 || ko >= 0.98) { loops[i].visible = false; continue; }
      loops[i].visible = true;
      tube(loops[i], loopCurve(i, U, st.h, f, 0.004 * eo(ko)), TRe * (1 - 0.6 * ko), 40, 8);
    }
    threadMat.opacity = 1;
    // top knot / starting tail
    if (qn > 0.05 && out < 0.5) { const a = onSkin(-AL, loopEnds(0).sa, U, TR); const pts = [a, a.clone().addScaledVector(Fc.tl, -0.004).addScaledVector(Fc.ts, 0.003).addScaledVector(Fc.n, 0.0012), a.clone().addScaledVector(Fc.tl, -0.0075).addScaledVector(Fc.ts, 0.0042).addScaledVector(Fc.n, 0.0004)];
      knot.visible = true; tube(knot, pts, TRe, 12, 6); } else knot.visible = false;

    // needle: rides the path during stitching, then pulls the tail out and away
    const B = onSkin(AL, loopEnds(NL - 1).sb, U, TR);
    let nTip = null;
    if (t < T.stitchB) {
      const pts = []; for (let j = 0; j < 20; j++) pts.push(needlePoint(Math.max(0, qn - j * 0.034), U, st.h).addScaledVector(Fc.n, 0.0012 * Math.sin(Math.PI * j / 19)));
      needle.visible = true; tube(needle, pts, 0.00058 * TRe / TR, 30, 10);
      const tp = []; for (let j = 19; j < 52; j++) tp.push(needlePoint(Math.max(0, qn - j * 0.034), U, st.h));
      tail.visible = qn > 0.3; if (tail.visible) tube(tail, tp, TRe, 40, 6);
    } else {
      const k = eio(seg(t, T.stitchB, T.tightE + 1.2));
      nTip = B.clone().addScaledVector(Fc.tl, 0.012 + 0.16 * k).addScaledVector(Fc.ts, -0.004 + 0.02 * k).addScaledVector(Fc.n, 0.004 + 0.05 * k);
      const dir = nTip.clone().sub(B).normalize();
      const pts = []; for (let j = 0; j < 8; j++) pts.push(nTip.clone().addScaledVector(dir, j * 0.0018).addScaledVector(Fc.n, -0.0009 * Math.sin(j / 7 * Math.PI)));
      needle.visible = k < 0.99; if (needle.visible) tube(needle, pts, 0.00034, 20, 8);
      // the tail: straight from the last stitch to the needle, cut by the scissors
      const cut = t > T.snip;
      const cP = B.clone().addScaledVector(dir, TAIL_CUT);
      if (!cut) { tail.visible = true; tube(tail, [B, B.clone().lerp(nTip, 0.5), nTip], TRe, 16, 6); cutTail.visible = false; }
      else {
        const ko = seg(t, T.snip, T.heal);
        tail.visible = out < 0.5; tube(tail, [B, B.clone().lerp(cP, 0.5), cP], TR, 6, 6);
        const fall = seg(t, T.snip, T.snip + 0.7);
        const away = Fc.tl.clone().multiplyScalar(0.02 * fall).addScaledVector(Fc.ts, -0.04 * fall * fall).addScaledVector(Fc.n, 0.01 * fall);
        cutTail.visible = fall < 1; cutTail.material.opacity = 1 - fall;
        if (cutTail.visible) tube(cutTail, [cP.clone().addScaledVector(dir, 0.0006).add(away), nTip.clone().add(away)], TR, 8, 6);
        void ko;
      }
    }

    // scissors: slide in from below-left, snip on "thread", slide out
    const sIn = eo(seg(t, T.sciIn, T.snip - 0.08)), sOut = eio(seg(t, T.snip + 0.25, T.sciOut));
    SCI.visible = t > T.sciIn && sOut < 0.999;
    if (SCI.visible) {
      const cP = B.clone().addScaledVector(Fc.tl, TAIL_CUT);
      const bx = Fc.ts.clone().multiplyScalar(1).addScaledVector(Fc.tl, -0.25).normalize();   // blade axis, pointing up across the tail
      const bz = Fc.n.clone(), by = new THREE.Vector3().crossVectors(bz, bx).normalize();
      const pivot = cP.clone().addScaledVector(bx, -0.03).addScaledVector(bz, 0.0045);
      const off = bx.clone().multiplyScalar(-0.16).addScaledVector(by, 0.05).addScaledVector(bz, 0.03);
      pivot.addScaledVector(off, 1 - sIn).addScaledVector(off, sOut);
      tmp.makeBasis(bx, by, bz); SCI.quaternion.setFromRotationMatrix(tmp); SCI.position.copy(pivot);
      const open = t < T.snip ? 0.32 * sIn : (t < T.snip + 0.12 ? 0.32 * (1 - seg(t, T.snip - 0.02, T.snip + 0.1)) : 0.06 + 0.14 * seg(t, T.snip + 0.12, T.snip + 0.4));
      const ang = t < T.snip - 0.1 ? 0.32 * sIn : open;
      SCI.userData.halves[0].rotation.z = ang / 2; SCI.userData.halves[1].rotation.z = -ang / 2;
    }

    // cells
    const cA = seg(t, T.cells, T.cellsE);
    cells.visible = t > T.cells - 0.1 && t < T.cellsE + 1.8;
    if (cells.visible) for (let i = 0; i < NC; i++) {
      const c = cellData[i], k = eo(clamp((cA - c.d * 0.6) / 0.4)), fade = 1 - seg(t, T.cellsE + 0.2 + c.d * 0.8, T.cellsE + 1.2 + c.d * 0.6);
      const l = c.side * lerp(c.l0, c.l1, k) + 0.0008 * Math.sin(t * 3 + c.w), s = c.s + 0.002 * Math.sin(t * 2 + c.w) * (1 - k);
      const r = c.r * (k > 0.001 ? 1 : 0) * fade * (0.85 + 0.15 * Math.sin(t * 6 + c.w));
      onSkin(l, s, U, r * 0.9, vs); tmp.compose(vs, q.identity(), new THREE.Vector3(r, r * 0.8, r)); cells.setMatrixAt(i, tmp);
    }
    cells.instanceMatrix.needsUpdate = true;

    // collagen
    const wk = seg(t, T.weave, T.weaveE + 0.6), cf = 1 - seg(t, T.fillE - 0.4, T.fillE + 0.6);
    colMat.opacity = cf;
    for (const m of fibres) { const g = clamp((wk * 1.3 - m.userData.t0) / 0.3); m.visible = g > 0.01 && cf > 0.01; m.geometry.setDrawRange(0, Math.floor(m.userData.n * g / 6) * 6); }

    // vessels
    const vk = seg(t, T.ves, T.vesE), vf = 1 - seg(t, T.vesFade, T.vesFade + 1.1);
    vesMat.opacity = vf; vesMat.color.setRGB(lerp(0.55, 0.83, vf), lerp(0.12, 0.09, vf), lerp(0.12, 0.06, vf)); vesMat.emissiveIntensity = 0.55 * vf;
    const front = vk * 0.055;
    for (const m of vessels) { const g = clamp((front - m.userData.d0) / m.userData.len); m.visible = g > 0.01 && vf > 0.01; m.geometry.setDrawRange(0, Math.floor(m.userData.n * g / 6) * 6); }

    // sun + shadows tight around what the camera sees
    const cs = placeCamera(t);
    const box = clamp(cs.d * 0.55, 0.03, 0.45);
    sun.target.position.copy(C); sun.position.copy(C).addScaledVector(sunDir, 1.2);
    Object.assign(sun.shadow.camera, { left: -box, right: box, top: box, bottom: -box, near: 0.2, far: 2.4 }); sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.00002 - box * 0.00012;
    const HIDE = (QP.get('hide') || '').split(',');
    if (HIDE.includes('thread')) [...loops, needle, tail, cutTail, knot].forEach((m) => (m.visible = false));
    if (HIDE.includes('ves')) vessels.forEach((m) => (m.visible = false));
    if (HIDE.includes('col')) fibres.forEach((m) => (m.visible = false));
    if (HIDE.includes('legl')) legL.visible = false;
    if (HIDE.includes('cells')) cells.visible = false;
    return { focus: cs.focus, d: cs.d, st };
  }

  return { scene, cam, update, T };
}
