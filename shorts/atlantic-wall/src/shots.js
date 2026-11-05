// HOW A FOXHOLE BECOMES THE ATLANTIC WALL — the full shot list (25 shots), every cut on its word.
import * as THREE from 'three';
import { Wd, L } from './core/timing.js';
import { buildWorld, ground, holeMound, rnd, BUNKER, hedgehogs, stakes, tank, landingCraft, seagull, concreteMaterial } from './world.js';
import { shovel } from './soldier.js';
import { Character } from './character.js';
import { explosion, sparks, sandKicks, beams, viewCone, arrow, lookoutBox, bucket, hammer, torch, sandwich } from './fx.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / ((b - a) || 1e-6));
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x) => 1 - Math.pow(1 - x, 3);
const LV = (a, b, k) => a.clone().lerp(b, k);

export function buildShots(E) {
  const S = [], CUES = [], cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const W = (w, l) => Wd(w, l), cut = (i) => (i === 0 ? 0 : L(i) - 0.1);
  const Wo = buildWorld(E), scene = Wo.scene, U = Wo.U, B = BUNKER, hx = B.sx / 2, hz = B.sz / 2;
  const cam = new THREE.PerspectiveCamera(40, 9 / 16, 0.05, 20000);

  // ── cast & props ─────────────────────────────────────────────────────
  const C = new Character(); scene.add(C.group); const sol = C;
  const spade = shovel(); scene.add(spade);
  const buck = bucket(); scene.add(buck); const pourM = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 1, 10), new THREE.MeshStandardMaterial({ color: '#8A8A84', roughness: 0.85 })); scene.add(pourM);
  const ham = hammer(); scene.add(ham); const tor = torch(); scene.add(tor); const sw = sandwich(); scene.add(sw);
  const tk = tank(); scene.add(tk);
  const lcs = [landingCraft(), landingCraft(), landingCraft()]; lcs.forEach((l) => scene.add(l));
  const look = lookoutBox(); scene.add(look);
  const LX = B.x - 1.0, LZ = B.z - 3.4;
  const HOG = 46, hogPos = [];
  const hogs = hedgehogs(HOG, (i) => { const x = -34 + 68 * ((i + rnd(i) * 0.6) / HOG), z = 1.6 + 7.5 * rnd(i * 5 + 3); hogPos.push({ x, z, yaw: rnd(i * 9) * 6.28 }); return { pos: V3(x, ground(x, z) + 0.62, z), yaw: hogPos[i].yaw }; });
  scene.add(hogs);
  const STK = 30, stkPos = [];
  const stk = stakes(STK, (i) => { const x = -40 + 80 * (i / STK) + rnd(i) * 1.5, z = -6 - 4 * rnd(i * 3); stkPos.push({ x, z, yaw: (rnd(i * 7) - 0.5) * 0.3 }); return { pos: V3(x, ground(x, z) - 0.3, z), lean: -0.45, yaw: stkPos[i].yaw }; });
  scene.add(stk);
  const boom = explosion(scene, { chunk: 'concrete', size: 0.75 }), splash = explosion(scene, { chunk: 'water', size: 0.9, debris: 70, white: true });
  const spk = sparks(scene), kicks = sandKicks(scene), tracers = beams(scene, 10, '#FFB347', 5), lasers = beams(scene, 4, '#FF4646', 3.5, 0.85);
  const cone = viewCone(scene), arrA = arrow(scene), arrB = arrow(scene);
  const gull2 = seagull(); scene.add(gull2);
  const waterIn = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshPhysicalMaterial({ color: '#3D8E95', roughness: 0.08, transparent: true, opacity: 0.88 })); waterIn.rotation.x = -Math.PI / 2; scene.add(waterIn);
  const cards = Wo.interior.children.filter((o) => o.name === 'card'), stove = Wo.stove;
  const muzzle = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFC266').multiplyScalar(6), toneMapped: false })); scene.add(muzzle);

  // ── tunnel set (a cross-section diorama, built away from the beach) ──
  const TX = 260, tset = new THREE.Group(); tset.position.set(TX, 0, 0); scene.add(tset);
  const secM = new THREE.MeshStandardMaterial({ color: '#B08550', roughness: 1 }), secD = new THREE.MeshStandardMaterial({ color: '#6E4F2C', roughness: 1 }), tim = new THREE.MeshStandardMaterial({ color: '#7A5632', roughness: 0.8 });
  { const top = (x) => 3.2 + 0.5 * Math.sin(x * 0.35) + 0.3 * Math.sin(x * 0.9 + 1), pts = [], idx = [];
    const strip = (x0, x1, bot, topF) => { const n = Math.ceil((x1 - x0) / 0.25), b = pts.length / 3; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; pts.push(x, bot, 0, x, topF(x), 0); } for (let i = 0; i < n; i++) { const a = b + i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } };
    strip(-14, 14, 2.4, top); strip(-14, 14, -6, () => 0.0);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(idx); g.computeVertexNormals();
    const face = new THREE.Mesh(g, secM); face.receiveShadow = true; tset.add(face);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(28, 2.4), secD); back.position.set(0, 1.2, -1.6); tset.add(back);
    const floorT = new THREE.Mesh(new THREE.PlaneGeometry(28, 1.6), secD); floorT.rotation.x = -Math.PI / 2; floorT.position.set(0, 0.0, -0.8); tset.add(floorT);
    const grassTop = new THREE.Mesh(new THREE.PlaneGeometry(28, 6), new THREE.MeshStandardMaterial({ color: '#C9A468', roughness: 1 })); grassTop.rotation.x = -Math.PI / 2; grassTop.position.set(0, 3.2, -3); tset.add(grassTop);
    tset.userData.frames = [];
    for (let i = 0; i < 20; i++) { const fr = new THREE.Group(); fr.position.set(-11.5 + i * 1.2, 0, -0.8); tset.add(fr); tset.userData.frames.push(fr);
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.3, 0.12), tim); p1.position.set(0, 1.15, 0.65); const p2 = p1.clone(); p2.position.z = -0.65; const bm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 1.5), tim); bm.position.y = 2.3; fr.add(p1, p2, bm);
      if (i % 3 === 0) { const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFE2A8').multiplyScalar(4), toneMapped: false })); bulb.position.set(0.6, 2.1, 0); fr.add(bulb); } }
    for (const zz of [-0.35, 0.35]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(28, 0.04, 0.04), new THREE.MeshStandardMaterial({ color: '#5A5A5E', metalness: 0.8, roughness: 0.4 })); rail.position.set(0, 0.05, -0.8 + zz); tset.add(rail); }
    for (let i = 0; i < 4; i++) { const l = new THREE.PointLight('#FFD39A', 6, 6, 1.5); l.position.set(-9 + i * 6, 2.0, -0.4); tset.add(l); }
    const bunkEnd = new THREE.Mesh(new THREE.BoxGeometry(3, 3.6, 3.4), concreteMaterial()); bunkEnd.position.set(-13, 1.6, -1.4); tset.add(bunkEnd);
    const tent = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.4, 4), new THREE.MeshStandardMaterial({ color: '#6B6E45', roughness: 0.9 })); tent.position.set(11.5, 4.4, -2.5); tent.rotation.y = Math.PI / 4; tset.add(tent);
    for (let i = 0; i < 4; i++) { const cr = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.5), new THREE.MeshStandardMaterial({ color: '#A57C4A', roughness: 0.8 })); cr.position.set(8.5 + i * 0.7, 3.4 + (i % 2) * 0.45, -1.8); tset.add(cr); }
    const cart = new THREE.Group(); const cb = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.75), new THREE.MeshStandardMaterial({ color: '#5E6348', metalness: 0.4, roughness: 0.7 })); cb.position.y = 0.42; cart.add(cb);
    for (const [ax, az] of [[-0.35, -0.38], [0.35, -0.38], [-0.35, 0.38], [0.35, 0.38]]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 14), new THREE.MeshStandardMaterial({ color: '#222' })); wh.rotation.x = Math.PI / 2; wh.position.set(ax, 0.13, az); cart.add(wh); }
    const box2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.4), new THREE.MeshStandardMaterial({ color: '#4E5A34', roughness: 0.8 })); box2.position.set(0.1, 0.8, 0); cart.add(box2);
    cart.position.set(0, 0, -0.8); tset.add(cart); tset.userData.cart = cart;
    tset.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); tset.visible = false; }

  // ── helpers ──────────────────────────────────────────────────────────
  const L2W = (o, x, y, z) => o.localToWorld(V3(x, y, z)), DIR = (o, x, y, z) => V3(x, y, z).transformDirection(o.matrixWorld);
  const sunAt = (target, box) => { const s = Wo.sun; s.target.position.copy(target); s.position.copy(target).addScaledVector(Wo.sunDir, 80);
    Object.assign(s.shadow.camera, { left: -box, right: box, top: box, bottom: -box, near: 1, far: 200 }); s.shadow.camera.updateProjectionMatrix(); };
  const place = (o, x, z, yOff = 0) => o.position.set(x, ground(x, z) + yOff, z);
  const heading = (o, dx, dz) => (o.rotation.y = Math.atan2(dx, dz));
  const rampOpen = (lc, k) => { const a = -1.4 * k, r = lc.userData.ramp; r.rotation.set(0, 0, a); r.position.set(5.3 + Math.sin(-a) * 0.95, 0.05 + Math.cos(a) * 0.95, 0); };
  const hideAll = () => { [spade, buck, pourM, ham, tor, sw, tk, look, gull2, waterIn, muzzle, arrA, arrB].forEach((o) => (o.visible = false)); lcs.forEach((l) => (l.visible = false));
    hogs.visible = false; stk.visible = false; cone.visible = false; tset.visible = false; spk.visible = false; kicks.visible = false; boom.visible = false; splash.visible = false;
    for (let i = 0; i < 10; i++) tracers.userData.hide(i); for (let i = 0; i < 4; i++) lasers.userData.hide(i);
    Wo.clods.count = 0; Wo.setHole(0, 6, 0.95, 0); Wo.setCut(false); Wo.grassMask(false, 0); U.uTide.value = 0; U.uWave.value.set(-40, 0, 0);
    Wo.setMound(1); C.group.visible = true; C.group.rotation.set(0, 0, 0); Wo.bunker.visible = true; Wo.gull.visible = true; stove.visible = true; stove.scale.setScalar(1); cards.forEach((c) => (c.visible = true)); };
  const frame = (t) => { U.uTime.value = t; Wo.plumes.forEach((p) => p.userData.update(t, 1)); };
  const render = (t, tgt, lk = {}) => E.render(scene, cam, { focus: cam.position.distanceTo(tgt), aperture: 0.00006, maxblur: 0.003, ao: 1.0, aoRadius: 0.6, t, vignette: 0.22, ...lk });
  const setCam = (from, to, k, tgt0, tgt1, fov = 38) => { cam.position.copy(LV(from, to, k)); cam.lookAt(LV(tgt0, tgt1 || tgt0, k)); cam.fov = fov; cam.updateProjectionMatrix(); };
  const hogSet = (i, vis) => { const h = hogPos[i]; hogs.userData.set(i, V3(h.x, ground(h.x, h.z) + 0.62 * vis, h.z), h.yaw, 1, vis); };
  const allHogs = () => { hogs.visible = true; for (let i = 0; i < HOG; i++) hogSet(i, 1); hogs.userData.commit(); };
  const stkSet = (i, vis, mine) => { const s = stkPos[i]; stk.userData.set(i, V3(s.x, ground(s.x, s.z) - 0.3 - (1 - vis) * 2.8, s.z), -0.45, s.yaw, mine); };
  const allStk = () => { stk.visible = true; for (let i = 0; i < STK; i++) stkSet(i, 1, 1); stk.userData.commit(); };

  // character motion library (degrees; +x swings forward; knees bend with negative x)
  const pose = { stand(t = 0) { C.reset(); C.rot('chest', [1.5 * Math.sin(t * 1.6), 0, 0]); C.rot('shP', [2, 0, 5]); C.rot('shN', [2, 0, -5]); C.rot('elP', [12, 0, 0]); C.rot('elN', [12, 0, 0]); C.curl('P', 0.35); C.curl('N', 0.35); },
    walk(ph, amt = 1, lean = 4) { C.reset(); const s = Math.sin(ph); C.rot('thP', [24 * s * amt, 0, 0]); C.rot('thN', [-24 * s * amt, 0, 0]);
      C.rot('knP', [-(Math.max(0, -Math.sin(ph + 0.5)) * 48 + 6) * amt, 0, 0]); C.rot('knN', [-(Math.max(0, Math.sin(ph + 0.5)) * 48 + 6) * amt, 0, 0]);
      C.rot('anP', [8 * s * amt, 0, 0]); C.rot('anN', [-8 * s * amt, 0, 0]);
      C.rot('shP', [-22 * s * amt, 0, 6]); C.rot('shN', [22 * s * amt, 0, -6]); C.rot('elP', [22 + 10 * amt, 0, 0]); C.rot('elN', [22 + 10 * amt, 0, 0]);
      C.rot('spine', [lean, 4 * s * amt, 0]); C.rot('head', [-lean * 0.6, -3 * s, 0]); C.B.hips.position.y = 0.94 - 0.02 * amt * Math.abs(Math.cos(ph)); C.curl('P', 0.5); C.curl('N', 0.5); },
    run(ph) { pose.walk(ph, 1.55, 14); C.rot('elP', [80, 0, 0]); C.rot('elN', [80, 0, 0]); C.curl('P', 0.9); C.curl('N', 0.9); C.B.hips.position.y = 0.92 - 0.05 * Math.abs(Math.cos(ph)); },
    sit() { C.reset(); C.B.hips.position.y = 0.5; C.rot('thP', [88, 0, 4]); C.rot('thN', [88, 0, -4]); C.rot('knP', [-88, 0, 0]); C.rot('knN', [-88, 0, 0]); C.rot('spine', [4, 0, 0]); C.rot('shP', [25, 0, 8]); C.rot('shN', [25, 0, -8]); C.rot('elP', [55, 0, 0]); C.rot('elN', [55, 0, 0]); C.curl('P', 0.4); C.curl('N', 0.4); },
    crouch() { C.reset(); C.B.hips.position.y = 0.58; C.rot('thP', [70, 0, 10]); C.rot('thN', [95, 0, -8]); C.rot('knP', [-120, 0, 0]); C.rot('knN', [-95, 0, 0]); C.rot('spine', [24, 0, 0]); C.rot('chest', [12, 0, 0]); C.rot('head', [10, 0, 0]); },
    cheer(t) { C.reset(); const k = 0.5 + 0.5 * Math.sin(t * 8); C.rot('chest', [-6, 0, 0]); C.rot('head', [-14, 0, 0]); C.rot('shP', [0, 0, 150 + 10 * k]); C.rot('shN', [0, 0, -150 - 10 * k]); C.rot('elP', [18, 0, 0]); C.rot('elN', [18, 0, 0]); C.curl('P', 0.85); C.curl('N', 0.85); C.B.hips.position.y = 0.94 + 0.03 * k; },
    flail(t) { C.reset(); const k = Math.sin(t * 9); C.rot('chest', [-10, 8 * k, 0]); C.rot('head', [-20, 0, 0]); C.rot('shP', [20 * k, 0, 140 + 20 * k]); C.rot('shN', [-20 * k, 0, -140 + 20 * k]); C.rot('elP', [30, 0, 0]); C.rot('elN', [30, 0, 0]); C.curl('P', 0.2); C.curl('N', 0.2); } };
  const feetDown = () => { C.group.updateMatrixWorld(true); let lift = 0; for (const k of ['P', 'N']) { const a = C.B['an' + k].getWorldPosition(V3(0, 0, 0)), gy = ground(a.x, a.z) + 0.095; lift = Math.max(lift, gy - a.y); } C.group.position.y += lift; C.group.updateMatrixWorld(true); };
  const fin = () => C.finish();
  const lookoutAt = (k = 1) => { look.visible = true; place(look, LX, LZ); look.rotation.y = 0.15; look.userData.rise(k); };

  // ═══ 1 · dig a hole on the beach to hide from warships ═══════════════
  const tLose = W('lose', 0) - 0.1, tFloods = W('floods', 0) - 0.15;
  S.push({ id: 'S01', at: 0, note: 'digging the foxhole, warships on the horizon', draw(lt, d, t, blit) {
    frame(t); hideAll(); const H = { x: 0, z: 6, r: 0.95, amt: clamp(0.25 + t * 0.22, 0, 0.9) }; Wo.setHole(H.x, H.z, H.r, H.amt, 1.15);
    const sx = -1.25, sz = 6.1; C.group.position.set(sx, ground(sx, sz) + holeMound(sx, sz, H) + 0.03, sz); C.group.rotation.set(0, Math.PI / 2 - 0.15, 0);
    const k = 0.5 + 0.5 * Math.sin(t * 5.2); C.reset(); C.group.updateMatrixWorld(true);
    C.B.hips.position.y = 0.94 - 0.07 - 0.02 * k; C.rot('hips', [12 + 4 * k, 0, 0]); C.rot('spine', [14 + 6 * k, 0, 0]); C.rot('chest', [10 + 5 * k, 6, 0]); C.rot('neck', [8, 0, 0]); C.rot('head', [14, -6, 0]); C.group.updateMatrixWorld(true);
    for (const [k2, x, z] of [['P', 0.17, 0.08], ['N', -0.15, -0.12]]) { const fp = L2W(C.group, x, 0.095, z); fp.y = ground(fp.x, fp.z) + holeMound(fp.x, fp.z, H) + 0.095; C.plantLeg(k2, fp, DIR(C.group, 0, 0.1, 1)); }
    spade.visible = true; C.group.updateMatrixWorld(true);
    const tip = V3(-0.42 + 0.12 * k, ground(0, 6) - 0.4 - 0.12 * k, 6.08), top = L2W(C.group, -0.02, 1.12 - 0.08 * k, 0.48 + 0.08 * k), dir = tip.clone().sub(top).normalize();
    spade.position.copy(top); spade.quaternion.setFromUnitVectors(V3(0, -1, 0), dir); spade.rotateY(Math.PI / 2);
    C.reachArm('N', top.clone().addScaledVector(dir, 0.03).add(V3(0, 0.07, 0)), DIR(C.group, -1, -0.3, -0.5)); C.reachArm('P', top.clone().addScaledVector(dir, 0.4).add(V3(0, 0.07, 0)), DIR(C.group, 1, -0.3, -0.5));
    C.curl('P', 0.85, 0.6); C.curl('N', 0.85, 0.6); fin();
    const mx = new THREE.Matrix4(); Wo.clods.count = 34;
    for (let i = 0; i < 34; i++) { const ph = (t * 1.3 + rnd(i)) % 1, a = rnd(i * 3) * 6.28, sp = 1.2 + 1.6 * rnd(i * 5);
      const p = V3(0.15 + Math.cos(a) * 0.2 + ph * sp * 0.9, ground(0, 6) + 0.25 + ph * 2.4 - ph * ph * 3.1, 6 + Math.sin(a) * 0.4 + ph * (rnd(i * 7) - 0.4) * 1.6);
      const r = 0.018 + 0.035 * rnd(i * 11); mx.compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(i, i * 2, 0)), V3(r, r * 0.8, r)); Wo.clods.setMatrixAt(i, mx); }
    Wo.clods.instanceMatrix.needsUpdate = true;
    const tgt = V3(-0.35, ground(0, 6) + 0.72, 6.0), kk = eio(lt / d);
    setCam(V3(1.25, ground(1, 11.8) + 1.12, 11.8), V3(1.0, ground(1, 11) + 1.05, 10.6), kk, V3(-0.65, tgt.y + 0.18, 6.0), null, 38);
    sunAt(tgt, 9); render(t, tgt, { aperture: 0.00012 }); blit();
  } });
  cue(0.4, 'thud', { gain: 0.25 });

  // ═══ 2 · the first wave comes in ═════════════════════════════════════
  S.push({ id: 'S02', at: tLose, note: 'crouched in the hole, a wave rolls in', draw(lt, d, t, blit) {
    frame(t); hideAll(); Wo.setHole(0, 6, 0.95, 0.9, 1.15);
    const wz = lerp(-14, 3.5, eio(seg(t, tLose, tFloods + 0.3))); U.uWave.value.set(wz, 1.5, 0.45 * seg(t, tLose + 0.6, tFloods));
    pose.crouch(); C.B.hips.position.y = 0.72; C.rot('head', [-10, 0, 0]); C.rot('shP', [40, 0, 20]); C.rot('shN', [40, 0, -20]); C.rot('elP', [70, 0, 0]); C.rot('elN', [70, 0, 0]);
    C.group.position.set(0.05, ground(0, 6) - 1.03 + 0.01, 6.15); C.group.rotation.set(0, Math.PI + 0.15, 0); fin();
    const tgt = V3(0, ground(0, 6) + 0.2, 6), k = eio(lt / d);
    setCam(V3(2.8, ground(2.8, 10.5) + 2.2, 10.6), V3(2.3, ground(2.3, 10) + 1.9, 9.9), k, V3(-0.8, 0.2, -2), V3(-0.6, 0.2, 0), 42);
    sunAt(tgt, 12); render(t, tgt); blit();
  } });
  cue(tLose + 0.3, 'whoosh', { gain: 0.45, dur: 1.6 });

  // ═══ 3 · the sea floods in, the walls cave in ═══════════════════════
  const tCave = W('cave', 0) - 0.1;
  S.push({ id: 'S03', at: tFloods, note: 'flooded hole, sand walls slump in on him', draw(lt, d, t, blit) {
    frame(t); hideAll();
    const wz = lerp(3.5, 16, eo(seg(t, tFloods, tFloods + 1.6))); U.uWave.value.set(wz, 0.9 * (1 - seg(t, tFloods + 1.2, tFloods + 2.4)), 0.35 * (1 - seg(t, tFloods + 1.8, tCave + 1.4)));
    const amt = lerp(0.9, 0.42, eio(seg(t, tCave, tCave + 1.1))); Wo.setHole(0, 6, 0.95, amt, 1.15);
    waterIn.visible = true; const wl = lerp(-0.9, -0.12, eo(seg(t, tFloods, tFloods + 1.2))); waterIn.position.set(0, ground(0, 6) + wl * amt / 0.9, 6); waterIn.scale.setScalar(0.95 * Math.max(0.25, amt) * lerp(0.7, 1.05, seg(t, tFloods, tFloods + 1.2)));
    pose.flail(t); C.group.position.set(0.05, ground(0, 6) - 1.0 - 0.45 * seg(t, tCave, tCave + 1.1), 6.1); C.group.rotation.set(0, Math.PI * 0.8, 0); fin();
    const mx = new THREE.Matrix4(); Wo.clods.count = 40; const ck = seg(t, tCave - 0.1, tCave + 1.2);
    for (let i = 0; i < 40; i++) { const a = rnd(i * 3) * 6.28, r0 = 1.2 * (0.8 + 0.3 * rnd(i)), ph = clamp(ck * 1.3 - rnd(i * 5) * 0.3);
      const p = V3(Math.cos(a) * r0 * (1 - 0.6 * ph), ground(0, 6) + 0.1 - 0.9 * ph * ph, 6 + Math.sin(a) * r0 * (1 - 0.6 * ph) / 1.15); const r = ck > 0 && ck < 1 ? 0.05 + 0.08 * rnd(i * 7) : 0;
      mx.compose(p, new THREE.Quaternion(), V3(r, r * 0.8, r)); Wo.clods.setMatrixAt(i, mx); } Wo.clods.instanceMatrix.needsUpdate = true;
    const tgt = V3(0, ground(0, 6) - 0.3, 6), k = eio(lt / d);
    setCam(V3(-3.2, ground(-3, 8.6) + 2.4, 9.2), V3(-2.4, ground(-2.4, 8.2) + 1.9, 8.4), k, tgt, null, 40);
    sunAt(tgt, 10); render(t, tgt); blit();
  } });
  cue(tFloods, 'slide', { gain: 0.4, dur: 1.4 }); cue(tCave, 'thud', { gain: 0.5 });

  // ═══ 4 · move up behind the dunes ═══════════════════════════════════
  const tPour = W('pour', 1) - 0.2;
  S.push({ id: 'S04', at: cut(1), note: 'walking up the dune with a bucket', draw(lt, d, t, blit) {
    frame(t); hideAll(); Wo.setMound(0); Wo.bunker.visible = false;
    const k = lt / d, p0 = V3(LX - 6.5, 0, LZ - 7.5), p1 = V3(LX - 2.2, 0, LZ - 1.4), p = LV(p0, p1, k);
    pose.walk(t * 7.5, 1, 9); C.group.position.set(p.x, ground(p.x, p.z), p.z); heading(C.group, p1.x - p0.x, p1.z - p0.z); fin(); feetDown();
    buck.visible = true; buck.position.copy(L2W(C.group, -0.33, 0.62, 0.02));
    const tgt = V3(p.x, ground(p.x, p.z) + 1.0, p.z);
    setCam(V3(p.x + 4.5, ground(p.x + 4, p.z - 4) + 3.2, p.z - 5.5), V3(p.x + 4.2, ground(p.x + 4, p.z - 4) + 3.4, p.z - 4.6), k, tgt, null, 38);
    sunAt(tgt, 12); render(t, tgt); blit();
  } });

  // ═══ 5 · pour concrete around your hole ═════════════════════════════
  S.push({ id: 'S05', at: tPour, note: 'concrete lookout rises as he pours', draw(lt, d, t, blit) {
    frame(t); hideAll(); Wo.setMound(0); Wo.bunker.visible = false; lookoutAt(lerp(0.12, 1, eio(seg(t, tPour + 0.1, cut(2) - 0.15))));
    pose.stand(t); C.group.position.set(LX - 1.85, ground(LX - 1.85, LZ + 0.2), LZ + 0.2); C.group.rotation.set(0, Math.PI / 2 + 0.1, 0);
    C.rot('spine', [12, 0, 0]); C.rot('chest', [8, 0, 0]); C.group.updateMatrixWorld(true);
    const bp = L2W(C.group, 0.05, 1.45, 0.62); buck.visible = true; buck.position.copy(bp); buck.rotation.set(0, C.group.rotation.y, 0); buck.rotateX(1.25);
    C.reachArm('P', bp.clone().add(V3(0, 0.1, 0.0)), DIR(C.group, 1, -1, 0)); C.reachArm('N', bp.clone().add(DIR(C.group, 0, -0.12, -0.05)), DIR(C.group, -1, -1, 0)); C.curl('P', 0.8); C.curl('N', 0.8); fin();
    pourM.visible = true; const lip = L2W(C.group, 0.05, 1.42, 0.84), fl = V3(lip.x + 0.25, ground(LX, LZ) + 0.6, lip.z); pourM.position.copy(lip.clone().lerp(fl, 0.5)); pourM.scale.set(1, lip.distanceTo(fl), 1); pourM.quaternion.setFromUnitVectors(V3(0, 1, 0), fl.clone().sub(lip).normalize());
    const tgt = V3(LX - 0.5, ground(LX, LZ) + 1.0, LZ), a = lerp(-0.9, -0.3, eio(lt / d));
    cam.position.set(LX + Math.sin(a) * 7.5, ground(LX, LZ) + 3.6, LZ - Math.cos(a) * 7.5); cam.lookAt(tgt); cam.fov = 38; cam.updateProjectionMatrix();
    sunAt(tgt, 10); render(t, tgt); blit();
  } });
  cue(tPour + 0.2, 'slide', { gain: 0.35, dur: 1.6 });

  // ═══ 6 · now it's a lookout ═════════════════════════════════════════
  const tBut2 = W('but', 2) - 0.1;
  const lookPose = (t) => { pose.stand(t); C.group.position.set(LX + 0.05, ground(LX, LZ) + 0.22, LZ + 0.15); C.group.rotation.set(0, Math.PI + 0.15, 0);
    C.rot('shP', [150, 0, 20]); C.rot('shN', [150, 0, -20]); C.rot('elP', [120, 0, 0]); C.rot('elN', [120, 0, 0]); C.rot('head', [-4, 5 * Math.sin(t * 2), 0]); C.curl('P', 0.7); C.curl('N', 0.7); fin(); };
  S.push({ id: 'S06', at: cut(2), note: 'peering out of the lookout box', draw(lt, d, t, blit) {
    frame(t); hideAll(); Wo.setMound(0); Wo.bunker.visible = false; lookoutAt(1); lookPose(t);
    const tgt = V3(LX, ground(LX, LZ) + 1.55, LZ), k = eio(lt / d);
    setCam(V3(LX + 1.8, ground(LX, LZ) + 2.6, LZ - 7.5), V3(LX + 1.2, ground(LX, LZ) + 2.3, LZ - 5.6), k, tgt, null, 36);
    sunAt(tgt, 8); render(t, tgt, { aperture: 0.0001 }); blit();
  } });

  // ═══ 7 · a grey box on a yellow beach is easy to spot ════════════════
  const tOne = W('one', 2) - 0.15, ship = Wo.ships[1], shipHome = ship.position.clone(), shipRot = ship.rotation.y;
  S.push({ id: 'S07', at: tBut2, note: "from the sea: the warship's sights on the grey box", draw(lt, d, t, blit) {
    frame(t); hideAll(); Wo.setMound(0); Wo.bunker.visible = false; lookoutAt(1); lookPose(t);
    ship.position.set(LX - 46, 0, -150); ship.rotation.y = Math.PI / 2 + 0.35;
    const tgt = V3(LX, ground(LX, LZ) + 0.9, LZ), k = eio(lt / d);
    setCam(V3(LX - 52, 22, -192), V3(LX - 50, 20, -186), k, LV(V3(LX - 30, 8, -110), tgt, 0.85), LV(V3(LX - 30, 8, -110), tgt, 0.97), lerp(20, 9, eio(seg(t, W('grey', 2), W('spot', 2)))));
    sunAt(tgt, 60); render(t, tgt, { aperture: 0, ao: 0.6 }); blit();
    ship.position.copy(shipHome); ship.rotation.y = shipRot;
  } });
  cue(tBut2 + 0.2, 'whoosh', { gain: 0.3 });

  // ═══ 8 · one shell flattens it ══════════════════════════════════════
  const tBoom = W('shell', 2) + 0.1;
  S.push({ id: 'S08', at: tOne, note: 'the shell hits: concrete and sand everywhere', draw(lt, d, t, blit) {
    frame(t); hideAll(); Wo.setMound(0); Wo.bunker.visible = false;
    if (t < tBoom + 0.12) lookoutAt(1);
    boom.userData.update(V3(LX, ground(LX, LZ) + 0.6, LZ), tBoom, t);
    if (t < tBoom) lookPose(t);
    else { const fly = seg(t, tBoom + 0.05, tBoom + 1.1); pose.flail(t); C.group.position.set(LX + 0.05 + 3.2 * fly, ground(LX + 3.2 * fly, LZ + 2.5 * fly) - 0.05 + 2.4 * Math.sin(fly * Math.PI), LZ + 0.15 + 2.5 * fly); C.group.rotation.set(-fly * 1.2, Math.PI + 0.15, fly * 0.8); fin(); }
    const shake = t > tBoom ? Math.max(0, 1 - (t - tBoom) / 0.8) * 0.12 : 0;
    const tgt = V3(LX, ground(LX, LZ) + 1.2, LZ); cam.position.set(LX + 12.5 + shake * Math.sin(t * 80), ground(LX, LZ) + 4.2 + shake * Math.cos(t * 70), LZ - 11); cam.lookAt(tgt); cam.fov = 42; cam.updateProjectionMatrix();
    sunAt(tgt, 14); render(t, tgt); blit();
  } });
  cue(tBoom, 'slam', { gain: 0.9 }); cue(tOne + 0.05, 'whoosh', { gain: 0.4, dur: 0.5 });

  // ═══ 9 · walls thicker than you are tall ════════════════════════════
  const tBury = W('bury', 3) - 0.15;
  const cutRoom = () => { Wo.setCut(true); Wo.grassMask(true, B.x - hx); };
  S.push({ id: 'S09', at: cut(3), note: 'cutaway: walls as thick as he is tall (arrows)', draw(lt, d, t, blit) {
    frame(t); hideAll(); Wo.setMound(0); cutRoom(); Wo.gull.visible = false; stove.visible = false; cards.forEach((c) => (c.visible = false));
    pose.stand(t); C.group.position.set(B.x - 2.0, B.base, B.z + 0.9); C.group.rotation.set(0, -Math.PI / 2 + 0.3, 0); fin();
    const g1 = eo(seg(t, W('thicker', 3) - 0.1, W('thicker', 3) + 0.5)), g2 = eo(seg(t, W('tall', 3) - 0.3, W('tall', 3) + 0.3));
    const xA = B.x - hx - 0.08; arrA.userData.set(V3(xA, B.base + 1.4, B.z + hz - B.wall), V3(xA, B.base + 1.4, B.z + hz), { r: 0.045, double: true, grow: g1 });
    arrB.userData.set(V3(xA + 0.6, B.base + 0.02, B.z + 0.4), V3(xA + 0.6, B.base + 1.8, B.z + 0.4), { r: 0.04, double: true, grow: g2 });
    const tgt = V3(B.x - 1.2, B.base + 1.6, B.z + 1.2), k = eio(lt / d);
    setCam(V3(B.x - 14, B.base + 3.2, B.z - 0.5), V3(B.x - 11.5, B.base + 2.8, B.z + 0.4), k, tgt, null, 40);
    sunAt(tgt, 14); render(t, tgt); blit();
  } });

  // ═══ 10 · bury it under sand and grass ══════════════════════════════
  S.push({ id: 'S10', at: tBury, note: 'sand heaps over the bunker, grass grows: just another dune', draw(lt, d, t, blit) {
    frame(t); hideAll(); Wo.setMound(eio(seg(t, tBury + 0.1, W('dune', 3) + 0.1)));
    const sx = B.x - hx - 2.3, sz = B.z - 3; pose.stand(t); C.rot('spine', [25, 0, 0]); C.rot('chest', [10, 0, 0]); C.rot('shP', [55 + 20 * Math.sin(t * 6), 0, 10]); C.rot('shN', [55 + 20 * Math.sin(t * 6), 0, -10]); C.rot('elP', [30, 0, 0]); C.rot('elN', [30, 0, 0]);
    C.group.position.set(sx, ground(sx, sz), sz); C.group.rotation.set(0, Math.PI / 2 + 0.6, 0); fin(); feetDown();
    const tgt = V3(B.x, B.base + 3.4, B.z), a = lerp(-2.4, -1.9, eio(lt / d));
    cam.position.set(B.x + Math.cos(a) * 19, 9.5, B.z + Math.sin(a) * 19); cam.lookAt(tgt); cam.fov = 40; cam.updateProjectionMatrix();
    sunAt(tgt, 22); render(t, tgt, { aperture: 0 }); blit();
  } });
  cue(tBury, 'slide', { gain: 0.4, dur: 2 });

  // ═══ 11 · now it's a hideout ═══════════════════════════════════════
  const tBut4 = W('but', 4) - 0.1;
  S.push({ id: 'S11', at: cut(4), note: 'inside the hideout, sitting on a crate', draw(lt, d, t, blit) {
    frame(t); hideAll(); cutRoom(); Wo.gull.visible = false; stove.visible = false; cards.forEach((c) => (c.visible = false));
    pose.sit(); C.rot('head', [-6, -10, 0]); C.group.position.set(B.x - 1.25, B.base + 0.05, B.z + 1.0); C.group.rotation.set(0, -Math.PI / 2 + 0.6, 0); fin();
    const tgt = V3(B.x - 0.9, B.base + 1.1, B.z + 0.6), k = eio(lt / d);
    setCam(V3(B.x - 11, B.base + 2.2, B.z - 1.4), V3(B.x - 8.6, B.base + 1.9, B.z - 0.6), k, tgt, null, 38);
    sunAt(tgt, 12); render(t, tgt); blit();
  } });

  // ═══ 12 · tanks roll off the boats and up the sand ══════════════════
  const lcPos = V3(-6, 0, -6.5);
  S.push({ id: 'S12', at: tBut4, note: 'landing craft ramp drops, tank drives up the beach', draw(lt, d, t, blit) {
    frame(t); hideAll(); C.group.visible = false;
    const lc = lcs[0]; lc.visible = true; lc.position.set(lcPos.x, -0.25, lcPos.z); lc.rotation.set(0, -Math.PI / 2, 0); rampOpen(lc, eio(seg(t, tBut4 + 0.1, tBut4 + 0.8)));
    const k = eio(seg(t, tBut4 + 0.7, cut(5))), tz = lerp(lcPos.z + 0.5, 7, k), tx = lcPos.x;
    tk.visible = true; tk.position.set(tx, Math.max(ground(tx, tz), 0.15) + 0.06 + 0.03 * Math.sin(t * 14), tz); tk.rotation.set(0, -Math.PI / 2, 0);
    const tgt = V3(tx, 1.2, tz);
    cam.position.set(tx + 15, 4.2, tz + 9 - 3 * k); cam.lookAt(tgt.x - 1, tgt.y - 0.3, tgt.z - 2); cam.fov = 42; cam.updateProjectionMatrix();
    sunAt(tgt, 16); render(t, tgt); blit();
  } });
  cue(tBut4 + 0.4, 'thud', { gain: 0.6 }); cue(tBut4 + 0.8, 'slide', { gain: 0.5, dur: 2.2 });

  // ═══ 13 · weld steel beams into spiky crosses ═══════════════════════
  const tScatter = W('scatter', 5) - 0.1;
  S.push({ id: 'S13', at: cut(5), note: 'welding a hedgehog, sparks flying', draw(lt, d, t, blit) {
    frame(t); hideAll(); hogs.visible = true; for (let i = 0; i < HOG; i++) hogSet(i, i === 7 ? 1 : 0); hogs.userData.commit();
    const h = hogPos[7], hp = V3(h.x, ground(h.x, h.z) + 0.62, h.z);
    pose.crouch(); const sx = h.x - 0.95, sz = h.z + 0.3; C.group.position.set(sx, ground(sx, sz), sz); heading(C.group, h.x - sx, h.z - sz);
    C.group.updateMatrixWorld(true); const wp = hp.clone().add(V3(0, 0.1, 0)); C.reachArm('P', wp.clone().add(V3(-0.15, 0.05, 0.05)), DIR(C.group, 1, -1, 0)); C.reachArm('N', wp.clone().add(V3(-0.25, 0.15, -0.15)), DIR(C.group, -1, -1, 0)); C.curl('P', 0.8); C.curl('N', 0.7); fin();
    tor.visible = true; tor.position.copy(C.sockets.P.getWorldPosition(V3(0, 0, 0))); tor.quaternion.setFromUnitVectors(V3(0, -1, 0), wp.clone().sub(tor.position).normalize());
    spk.userData.update(wp, true, t);
    const tgt = wp.clone(), a = lerp(0.6, 1.1, eio(lt / d));
    cam.position.set(h.x - 0.5 + 0.6 * (a - 0.85), wp.y + 0.7, h.z + 3.6); cam.lookAt(tgt.x - 0.45, tgt.y + 0.1, tgt.z); cam.fov = 38; cam.updateProjectionMatrix();
    sunAt(tgt, 6); render(t, tgt, { aperture: 0.00015, bloom: 0.35 }); blit();
  } });
  cue(cut(5) + 0.3, 'sizzle', { gain: 0.35, dur: 2.6 });

  // ═══ 14 · scatter them everywhere — Czech hedgehogs ═════════════════
  const tTanks = W('tanks', 5) - 0.1;
  S.push({ id: 'S14', at: tScatter, note: 'top-down: hedgehogs pop up across the beach', draw(lt, d, t, blit) {
    frame(t); hideAll(); hogs.visible = true;
    for (let i = 0; i < HOG; i++) { const order = (hogPos[i].x + 34) / 68, k = eo(seg(t, tScatter + 0.15 + order * 1.6, tScatter + 0.45 + order * 1.6)); hogSet(i, Math.max(0.0001, k)); } hogs.userData.commit();
    C.group.position.set(-2, ground(-2, 11), 11); pose.stand(t); C.group.rotation.set(0, Math.PI, 0); fin();
    const tgt = V3(0, 0.5, 5.5), k = eio(lt / d);
    setCam(V3(-6, 26, 18), V3(4, 23, 16), k, tgt, V3(2, 0.5, 5), 44);
    sunAt(tgt, 40); render(t, tgt, { aperture: 0, aoRadius: 0.9 }); blit();
  } });
  for (let i = 0; i < 6; i++) cue(tScatter + 0.3 + i * 0.3, 'tock', { gain: 0.3 });

  // ═══ 15 · tanks get stuck right on top of them ══════════════════════
  S.push({ id: 'S15', at: tTanks, note: 'tank climbs onto a hedgehog and sticks', draw(lt, d, t, blit) {
    frame(t); hideAll(); allHogs(); C.group.visible = false;
    const tx = 2.2, tzStop = 4.6, k = eio(seg(t, tTanks + 0.1, W('top', 5) + 0.1)), tz = lerp(-1.5, tzStop, k), climb = seg(t, W('stuck', 5) - 0.4, W('top', 5));
    tk.visible = true; tk.position.set(tx, ground(tx, tz) + 0.06 + 0.56 * eio(climb), tz); tk.rotation.set(0.05 * climb, -Math.PI / 2 + 0.25, 0.24 * eio(climb));
    hogs.userData.set(0, V3(tx + 0.42, ground(tx + 0.42, tzStop + 1.6) + 0.62, tzStop + 1.6), 0.4); hogs.userData.commit();
    const tgt = V3(tx, 1.2, tz + 0.8), kk = eio(lt / d);
    setCam(V3(tx + 15, 4.4, tz - 5.5), V3(tx + 13, 3.8, tz - 3), kk, tgt, null, 40);
    sunAt(tgt, 16); render(t, tgt); blit();
  } });
  cue(W('stuck', 5), 'slam', { gain: 0.6 });

  // ═══ 16 · at high tide, the boats float right over them ═════════════
  S.push({ id: 'S16', at: cut(6), note: 'tide rises over the hedgehogs; a boat floats over', draw(lt, d, t, blit) {
    frame(t); hideAll(); allHogs(); C.group.visible = false;
    U.uTide.value = 1.7 * eio(seg(t, W('high', 6) - 0.3, W('tide', 6) + 0.6));
    const lc = lcs[0]; lc.visible = true; const bz = lerp(-14, 7.5, eio(seg(t, W('boats', 6) - 0.6, cut(7)))); lc.position.set(-4, U.uTide.value - 0.3 + 0.05 * Math.sin(t * 2), bz); lc.rotation.set(0.02 * Math.sin(t * 1.7), -Math.PI / 2, 0.015 * Math.sin(t * 2.3)); rampOpen(lc, 0);
    const tgt = V3(-3, 0.8, 4), k = eio(lt / d);
    setCam(V3(9, 2.4, 12), V3(8, 3.0, 11), k, tgt, null, 40);
    sunAt(tgt, 20); render(t, tgt); blit();
  } });
  cue(W('high', 6), 'bubbles', { gain: 0.35, dur: 2 });

  // ═══ 17 · hammer wooden stakes into the shallows, mine on every tip ═
  const tBoats7 = W('boats', 7) - 0.15;
  S.push({ id: 'S17', at: cut(7), note: 'waist-deep, hammering stakes; mines on top', draw(lt, d, t, blit) {
    frame(t); hideAll(); stk.visible = true; U.uTide.value = 0.6;
    for (let i = 0; i < STK; i++) { const order = i / STK, vis = eo(seg(t, W('stakes', 7) - 0.2 + order * 1.0, W('stakes', 7) + 0.1 + order * 1.0)), mine = t > W('mine', 7) - 0.1 + order * 0.6 ? 1 : 0; stkSet(i, Math.max(0.0001, vis), mine); } stk.userData.commit();
    const s = stkPos[12], sx = s.x - 0.75, sz = s.z + 0.5, sw2 = Math.sin(t * 6.5);
    pose.stand(t); C.rot('spine', [8, 0, 0]); C.group.position.set(sx, ground(sx, sz) + 0.1, sz); heading(C.group, s.x - sx, s.z - sz); C.group.updateMatrixWorld(true);
    const hand = L2W(C.group, 0.0, 1.55 + 0.35 * sw2, 0.35 + 0.1 * sw2); C.reachArm('P', hand, DIR(C.group, 1, -0.5, -0.5)); C.reachArm('N', hand.clone().add(DIR(C.group, 0, -0.1, -0.02)), DIR(C.group, -1, -0.5, -0.5)); C.curl('P', 0.9); C.curl('N', 0.9); fin();
    ham.visible = true; ham.position.copy(C.sockets.P.getWorldPosition(V3(0, 0, 0))); ham.quaternion.setFromUnitVectors(V3(0, -1, 0), V3(s.x, ground(s.x, s.z) + 2.6, s.z).sub(ham.position).normalize());
    const tgt = V3(sx + 0.4, 1.3, sz - 0.3), k = eio(lt / d);
    setCam(V3(sx + 5.5, 1.6, sz + 3.5), V3(sx + 4.2, 1.8, sz + 2.6), k, tgt, V3(sx - 1, 1.6, sz - 1.5), 40);
    sunAt(tgt, 14); render(t, tgt); blit();
  } });
  for (let i = 0; i < 5; i++) cue(cut(7) + 0.4 + i * 0.97, 'tock', { gain: 0.5 });

  // ═══ 18 · boats blow open before they even land ═════════════════════
  const tHit = W('blow', 7);
  S.push({ id: 'S18', at: tBoats7, note: 'a landing craft hits a mined stake', draw(lt, d, t, blit) {
    frame(t); hideAll(); allStk(); U.uTide.value = 0.6; C.group.visible = false;
    const s = stkPos[15], lc = lcs[0]; lc.visible = true; const bz = lerp(-30, s.z - 5.6, seg(t, tBoats7, tHit)), after = seg(t, tHit, tHit + 1.5);
    lc.position.set(s.x - 0.5, 0.3 + 0.05 * Math.sin(t * 2) - 1.2 * after, t < tHit ? bz : s.z - 5.6); lc.rotation.set(0.35 * after, -Math.PI / 2, -0.25 * after); rampOpen(lc, 0);
    splash.userData.update(V3(s.x, 0.8, s.z - 0.8), tHit, t);
    const tgt = V3(s.x - 0.5, 1.2, s.z - 4), shake = t > tHit ? Math.max(0, 1 - (t - tHit) / 0.7) * 0.15 : 0;
    cam.position.set(s.x + 22 + shake * Math.sin(t * 77), 8.5 + shake * Math.cos(t * 63), s.z + 14); cam.lookAt(tgt); cam.fov = 38; cam.updateProjectionMatrix();
    sunAt(tgt, 22); render(t, tgt); blit();
  } });
  cue(tHit, 'slam', { gain: 0.9 }); cue(tHit + 0.05, 'bubbles', { gain: 0.4, dur: 1.2 });

  // ═══ 19 · running across open sand for ammo gets you shot ═══════════
  const tSo8 = W('so', 8) - 0.1;
  S.push({ id: 'S19', at: cut(8), note: 'sprinting across the beach, bullets kicking sand', draw(lt, d, t, blit) {
    frame(t); hideAll(); allHogs();
    const x = lerp(-10, 6, lt / d), z = 10.5; pose.run(t * 11); C.group.position.set(x, ground(x, z), z); C.group.rotation.set(0, Math.PI / 2, 0); fin(); feetDown();
    kicks.userData.update((tt, b) => V3(lerp(-10, 6, clamp((tt - cut(8)) / (tSo8 - cut(8)))) + (rnd(b) - 0.3) * 2.2, 0, z + (rnd(b * 3) - 0.5) * 2.4), true, t, ground);
    const tgt = V3(x + 0.8, ground(x, z) + 1.0, z);
    cam.position.set(x + 1.6, ground(x, z) + 1.4, z - 6.2); cam.lookAt(tgt); cam.fov = 40; cam.updateProjectionMatrix();
    sunAt(tgt, 12); render(t, tgt, { aperture: 0.00009 }); blit();
  } });
  cue(cut(8) + 0.2, 'zip', { gain: 0.3 }); cue(cut(8) + 0.9, 'zip', { gain: 0.3 }); cue(cut(8) + 1.6, 'zip', { gain: 0.3 });

  // ═══ 20 · dig a tunnel back to camp (cross-section) ═════════════════
  S.push({ id: 'S20', at: tSo8, note: 'underground cross-section: tunnel back to camp, cart rolls', draw(lt, d, t, blit) {
    frame(t); hideAll(); tset.visible = true;
    const reveal = eio(seg(t, tSo8 + 0.1, cut(9) - 0.2)); tset.userData.frames.forEach((f, i) => { f.visible = (i / 19) < reveal; });
    const cx = lerp(9, -8, eio(seg(t, tSo8 + 0.3, cut(9)))); tset.userData.cart.position.x = cx;
    pose.walk(t * 7, 0.8, 18); C.rot('shP', [70, 0, 10]); C.rot('shN', [70, 0, -10]); C.rot('elP', [20, 0, 0]); C.rot('elN', [20, 0, 0]); C.group.position.set(TX + cx + 1.15, 0.0, -0.8); C.group.rotation.set(0, -Math.PI / 2, 0); fin();
    const tgt = V3(TX + cx * 0.4, 1.6, -0.8);
    cam.position.set(TX + cx * 0.3, 1.9, 11); cam.lookAt(tgt.x, 1.4, tgt.z); cam.fov = 40; cam.updateProjectionMatrix();
    sunAt(V3(TX, 1, 0), 18); render(t, tgt, { aperture: 0 }); blit();
  } });
  cue(tSo8 + 0.3, 'slide', { gain: 0.35, dur: 1.8 });

  // ═══ 21 · your window doesn't face the sea — it faces sideways ══════
  const tShips = W('ships', 9) - 0.2, emb = V3(B.x + hx + 0.2, B.base + 1.25, B.z);
  S.push({ id: 'S21', at: cut(9), note: 'aerial: arrow swings the window from the sea to down the beach', draw(lt, d, t, blit) {
    frame(t); hideAll(); allHogs(); allStk(); C.group.visible = false;
    const sw3 = eio(seg(t, W('faces', 9), W('sideways', 9) + 0.5)), ang = lerp(-Math.PI / 2, -0.25, sw3), dir = V3(Math.cos(ang), 0, Math.sin(ang));
    const show = seg(t, cut(9) + 0.2, cut(9) + 0.6), a0 = emb.clone().add(V3(0.4, 2.8, 0)), a1 = a0.clone().addScaledVector(dir, 6);
    arrA.userData.set(a0, a1, { r: 0.12, grow: show, bend: 0.5 });
    const tgt = V3(B.x + 4, 2.5, B.z - 2), k = eio(lt / d);
    setCam(V3(B.x - 6, 26, B.z - 18), V3(B.x - 2, 24, B.z - 16), k, tgt, null, 40);
    sunAt(tgt, 26); render(t, tgt, { aperture: 0 }); blit();
  } });
  cue(W('faces', 9), 'whoosh', { gain: 0.4 });

  // ═══ 22 · the ships can't see it, but you see every boat that lands ═
  const tEnf = W("that's", 9) - 0.1;
  S.push({ id: 'S22', at: tShips, note: 'red aim lines blocked; yellow view cone sweeps the landing boats', draw(lt, d, t, blit) {
    frame(t); hideAll(); allHogs(); allStk(); C.group.visible = false;
    const wall = V3(B.x + hx + 1.8, B.base + 2.4, B.z - hz);
    for (let i = 0; i < 3; i++) { const g = seg(t, tShips + 0.1 + i * 0.15, tShips + 0.6 + i * 0.15), from = V3(-60 + i * 50, 12, -160); lasers.userData.set(i, from, from.clone().lerp(wall.clone().add(V3(i * 0.6 - 0.6, i * 0.3, 0)), Math.max(0.001, g)), 0.06); }
    lcs.forEach((l, i) => { l.visible = true; const bz = lerp(-16, -2.2, eio(seg(t, tShips + i * 0.4, W('lands', 9) + i * 0.3))); l.position.set(18 + i * 12, -0.25 + 0.04 * Math.sin(t * 2 + i), bz); l.rotation.set(0, -Math.PI / 2, 0); rampOpen(l, seg(t, W('lands', 9) + i * 0.3, W('lands', 9) + 0.6 + i * 0.3)); });
    const cop = eo(seg(t, W('but', 9) - 0.1, W('see', 9) + 0.3)), sweep = Math.sin(t * 1.2) * 0.12;
    cone.userData.set(emb, V3(1, -0.08, -0.38 + sweep), 46, 14, cop);
    const tgt = V3(B.x + 16, 1.0, B.z - 9), k = eio(lt / d);
    setCam(V3(B.x - 9, 14, B.z + 7), V3(B.x - 7, 12.5, B.z + 4), k, tgt, null, 44);
    sunAt(tgt, 40); render(t, tgt, { aperture: 0 }); blit();
  } });

  // ═══ 23 · that's enfilade fire ══════════════════════════════════════
  S.push({ id: 'S23', at: tEnf, note: 'behind the gunner: tracers stream down the beach', draw(lt, d, t, blit) {
    frame(t); hideAll(); allHogs(); allStk(); Wo.gull.visible = false;
    lcs.forEach((l, i) => { l.visible = true; l.position.set(18 + i * 12, -0.25, -2.2); l.rotation.set(0, -Math.PI / 2, 0); rampOpen(l, 1); });
    pose.stand(t); C.rot('spine', [14, 0, 0]); C.rot('shP', [70, 0, 15]); C.rot('shN', [70, 0, -15]); C.rot('elP', [40, 0, 0]); C.rot('elN', [40, 0, 0]); C.curl('P', 0.9); C.curl('N', 0.9);
    C.group.position.set(B.x + hx - B.wall - 1.25, B.base, B.z - 0.05); C.group.rotation.set(0, Math.PI / 2, 0); fin();
    const mz = V3(B.x + hx - B.wall + 0.65, B.base + 1.17, B.z); muzzle.visible = Math.sin(t * 60) > 0.2; muzzle.position.copy(mz).add(V3(0.5, 0, 0)); muzzle.scale.setScalar(0.8 + 0.6 * rnd(Math.floor(t * 30)));
    for (let i = 0; i < 10; i++) { const ph = (t * 3.2 + i / 10) % 1, dir = V3(1, -0.05 - 0.02 * rnd(i), -0.32 + 0.12 * (rnd(i * 3) - 0.5)).normalize(); const a = mz.clone().addScaledVector(dir, 2 + ph * 60); tracers.userData.set(i, a, a.clone().addScaledVector(dir, 2.2), 0.025); }
    const tgt = V3(B.x + 30, 0.5, B.z - 10), k = eio(lt / d);
    setCam(V3(B.x + hx - B.wall - 3.6, B.base + 2.05, B.z + 1.25), V3(B.x + hx - B.wall - 3.2, B.base + 1.95, B.z + 1.1), k, tgt, null, 44);
    sunAt(V3(B.x + 10, 1, B.z - 5), 30); render(t, tgt, { aperture: 0, bloom: 0.3, exposure: 1.05 }); blit();
  } });
  for (let i = 0; i < 9; i++) cue(tEnf + 0.15 + i * 0.12, 'tock', { gain: 0.4 });

  // ═══ 24 · a stove, a deck of cards, and a seagull that steals your sandwich ═
  const tGull = W('seagull', 10);
  S.push({ id: 'S24', at: cut(10), note: 'cosy: stove pops in, cards, a gull steals the sandwich', draw(lt, d, t, blit) {
    frame(t); hideAll(); cutRoom(); Wo.gull.visible = false;
    stove.visible = t > W('stove', 10) - 0.05; stove.scale.setScalar(Math.max(0.001, eo(seg(t, W('stove', 10) - 0.05, W('stove', 10) + 0.25))));
    cards.forEach((c, i) => { c.visible = t > W('cards', 10) - 0.1 + i * 0.05; });
    pose.sit(); C.rot('head', [-4, -8, 0]); C.group.position.set(B.x - 1.2, B.base + 0.05, B.z + 0.25); C.group.rotation.set(0, Math.PI / 2 + 0.3, 0);
    const grab = seg(t, W('steals', 10) - 0.1, W('sandwich', 10) + 0.3); if (grab > 0) { C.rot('shN', [80 + 40 * grab, 0, -10]); C.rot('elN', [30, 0, 0]); C.rot('head', [-20, 0, 0]); }
    fin();
    const plate = L2W(Wo.bunker, -0.55, 0.52, 1.25); sw.visible = true;
    const gk = eio(seg(t, tGull - 0.2, W('steals', 10) + 0.1)), out = eio(seg(t, W('steals', 10) + 0.15, W('sandwich', 10) + 0.5));
    gull2.visible = t > tGull - 0.25; const win = L2W(Wo.bunker, hx - 0.4, 1.4, 0.0), land = plate.clone().add(V3(0, 0.05, 0.1));
    const gp = out > 0 ? LV(land, win.clone().add(V3(1.5, 0.6, 0)), out) : LV(win, land, gk); gp.y += Math.sin((out > 0 ? out : gk) * Math.PI) * 0.6;
    gull2.position.copy(gp); gull2.rotation.set(0, out > 0 ? Math.PI / 2 : -Math.PI / 2, 0);
    if (out > 0) sw.position.copy(gp).add(V3(0, -0.02, 0.0)); else sw.position.copy(plate);
    const tgt = V3(B.x - 0.4, B.base + 1.1, B.z + 0.6), k = eio(lt / d);
    setCam(V3(B.x - 9.5, B.base + 2.1, B.z - 1.2), V3(B.x - 7.6, B.base + 1.8, B.z - 0.4), k, tgt, null, 38);
    sunAt(tgt, 12); render(t, tgt); blit();
  } });
  cue(W('stove', 10), 'pop', { gain: 0.45 }); cue(W('cards', 10), 'pop', { gain: 0.35 }); cue(tGull, 'whoosh', { gain: 0.35 });

  // ═══ 25 · congratulations: you've built a piece of the Atlantic Wall ═
  S.push({ id: 'S25', at: cut(11), note: 'cutaway reveal pulls back to the whole defence line', draw(lt, d, t, blit) {
    frame(t); hideAll(); cutRoom(); U.uTide.value = 0.12; allHogs(); allStk();
    lcs[0].visible = true; place(lcs[0], 22, -9, -0.4); lcs[0].rotation.set(0, Math.PI / 2 + 0.3, 0); rampOpen(lcs[0], 0);
    pose.cheer(t); C.group.position.set(B.x - 1.0, B.base, B.z + 0.4); C.group.rotation.set(0, -Math.PI / 2 + 0.25, 0); fin();
    const tgt = V3(B.x - 0.2, B.base + 1.7, B.z - 0.4), k = eio(lt / d);
    setCam(V3(B.x - 13.5, B.base + 3.2, B.z - 4.2), V3(B.x - 30, B.base + 9.5, B.z - 9), k, tgt, V3(B.x + 2, B.base + 1.5, B.z - 4), 40);
    sunAt(tgt, lerp(14, 30, k)); render(t, tgt, { aperture: 0 }); blit();
  } });
  cue(cut(11), 'sparkle', { gain: 0.4 }); cue(W('atlantic', 11), 'boing', { gain: 0.25 });

  return { shots: S, cues: CUES };
}
