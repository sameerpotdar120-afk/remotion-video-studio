// Effects, all pure functions of time: explosions, sparks, sand kicks, tracers, aim lines, view cone, arrows, props.
import * as THREE from 'three';
import { rnd, concreteMaterial } from './world.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (x) => 1 - Math.pow(1 - x, 3);
const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3();

/** explosion at pos, starting t0: flash ball, fireball, black+grey smoke, debris chunks (concrete or sand) */
export function explosion(scene, { n = 46, debris = 60, chunk = 'concrete', size = 1, white = false } = {}) {
  const g = new THREE.Group(); scene.add(g);
  const fire = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 3), new THREE.MeshStandardMaterial({ color: '#FFB25A', emissive: '#FF7A1E', emissiveIntensity: 3.5, transparent: true, roughness: 1 })); g.add(fire);
  const smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 }), n); smoke.castShadow = true; g.add(smoke);
  const cM = chunk === 'concrete' ? concreteMaterial() : new THREE.MeshStandardMaterial({ color: chunk === 'water' ? '#E9F4F6' : '#A57C4A', roughness: 1, transparent: chunk === 'water', opacity: 0.85 });
  const deb = new THREE.InstancedMesh(chunk === 'concrete' ? new THREE.BoxGeometry(1, 1, 1) : new THREE.IcosahedronGeometry(1, 1), cM, debris); deb.castShadow = true; g.add(deb);
  const light = new THREE.PointLight('#FF9A40', 0, 30 * size, 2); g.add(light);
  const col = new THREE.Color();
  g.userData.update = (pos, t0, t) => {
    const a = t - t0; g.visible = a > 0 && a < 4.5; if (!g.visible) return;
    g.position.copy(pos);
    const fk = clamp(a / 0.35); fire.scale.setScalar(size * (0.4 + 2.2 * eo(fk))); fire.material.opacity = 1 - clamp((a - 0.15) / 0.4); fire.visible = a < 0.6;
    light.intensity = 300 * size * Math.max(0, 1 - a / 0.5);
    for (let i = 0; i < n; i++) { const r0 = rnd(i * 3 + 1), th = r0 * 6.283, up = 0.3 + rnd(i * 5) * 0.9, sp = (1.2 + 2.4 * rnd(i * 7)) * size;
      const k = eo(clamp(a / (1.2 + rnd(i) * 0.8)));
      P.set(Math.cos(th) * sp * k, up * sp * k + a * 0.6 * size, Math.sin(th) * sp * k);
      const s = size * (0.35 + 0.6 * rnd(i * 11)) * (0.4 + 0.9 * k) * (1 - clamp((a - 2.2) / 1.8));
      M.compose(P, Q.identity(), S.setScalar(Math.max(0.001, s))); smoke.setMatrixAt(i, M);
      const dark = white ? 0.9 + 0.08 * rnd(i * 13) : (i % 3 === 0 ? 0.1 : 0.55 + 0.2 * rnd(i * 13)); col.setRGB(dark, dark * 0.97, dark * 0.93); smoke.setColorAt(i, col); }
    smoke.instanceMatrix.needsUpdate = true; if (smoke.instanceColor) smoke.instanceColor.needsUpdate = true;
    for (let i = 0; i < debris; i++) { const th = rnd(i * 17) * 6.283, v = (4 + 7 * rnd(i * 19)) * size, vy = (5 + 8 * rnd(i * 23)) * size;
      let y = vy * a - 4.9 * a * a; const x = Math.cos(th) * v * a * 0.6, z = Math.sin(th) * v * a * 0.6;
      if (y < -pos.y + 0.05) y = -pos.y + 0.05;
      const s = (0.08 + 0.22 * rnd(i * 29)) * size; Q.setFromEuler(new THREE.Euler(a * 5 + i, a * 3 + i * 2, i));
      M.compose(P.set(x, y, z), Q, S.set(s, s * (chunk === 'concrete' ? 0.8 : 1), s)); deb.setMatrixAt(i, M); }
    deb.instanceMatrix.needsUpdate = true;
  };
  g.visible = false; return g;
}

/** weld sparks spraying from pos */
export function sparks(scene, n = 70) {
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#FFF3C4', emissive: '#FFD27A', emissiveIntensity: 6 }), n); scene.add(im);
  const glow = new THREE.PointLight('#BFD8FF', 0, 4, 2); scene.add(glow);
  im.userData.update = (pos, on, t) => { im.visible = on; glow.intensity = on ? 6 + 4 * Math.sin(t * 60) : 0; glow.position.copy(pos); if (!on) return;
    for (let i = 0; i < n; i++) { const ph = (t * 2.2 + rnd(i)) % 1, th = rnd(i * 3) * 6.283, v = 1 + 2.5 * rnd(i * 5);
      const p = V3(pos.x + Math.cos(th) * v * ph, pos.y + (1.5 * rnd(i * 7)) * ph - 4 * ph * ph, pos.z + Math.sin(th) * v * ph);
      const dir = V3(Math.cos(th) * v, 1.5 * rnd(i * 7) - 8 * ph, Math.sin(th) * v).normalize(); Q.setFromUnitVectors(V3(0, 1, 0), dir);
      M.compose(p, Q, S.set(0.006, 0.05 * (1 - ph), 0.006)); im.setMatrixAt(i, M); }
    im.instanceMatrix.needsUpdate = true; };
  im.visible = false; return im;
}

/** quick sand kicks (bullet hits) around a moving point */
export function sandKicks(scene, n = 60) {
  const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: '#B88F5C', roughness: 1 }), n); im.castShadow = true; scene.add(im);
  im.userData.update = (centerFn, on, t, groundFn) => { im.visible = on; if (!on) return;
    for (let i = 0; i < n; i++) { const burst = Math.floor(i / 6), k = i % 6, bt = burst * 0.23 + rnd(burst) * 0.1, a = ((t - bt) % 2.3 + 2.3) % 2.3;
      const c = centerFn(t - a, burst), th = rnd(i * 3) * 6.283, v = 0.6 + 1.2 * rnd(i * 5);
      const x = c.x + Math.cos(th) * v * a * 0.5, z = c.z + Math.sin(th) * v * a * 0.5, y = groundFn(c.x, c.z) + Math.max(0, 3.2 * a - 6 * a * a);
      const s = a < 0.6 ? 0.04 + 0.05 * rnd(i * 7) : 0; M.compose(P.set(x, y, z), Q.identity(), S.setScalar(s)); im.setMatrixAt(i, M); void k; }
    im.instanceMatrix.needsUpdate = true; };
  im.visible = false; return im;
}

/** glowing line segments (tracers, aim lines): set(i, from, to, radius) */
export function beams(scene, n, color, emissive = 4, opacity = 1) {
  const geo = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true); geo.translate(0, 0.5, 0);
  const im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(emissive), transparent: opacity < 1, opacity, depthWrite: opacity >= 1, toneMapped: false }), n); scene.add(im);
  im.userData.set = (i, a, b, r) => { const d = b.clone().sub(a), l = d.length(); Q.setFromUnitVectors(V3(0, 1, 0), d.normalize()); M.compose(a, Q, S.set(r, Math.max(l, 1e-4), r)); im.setMatrixAt(i, M); im.instanceMatrix.needsUpdate = true; };
  im.userData.hide = (i) => { M.makeScale(0, 0, 0); im.setMatrixAt(i, M); im.instanceMatrix.needsUpdate = true; };
  for (let i = 0; i < n; i++) im.userData.hide(i);
  return im;
}

/** a translucent view cone from apex toward dir */
export function viewCone(scene, color = '#FFD54A') {
  const geo = new THREE.ConeGeometry(1, 1, 48, 1, true); geo.translate(0, -0.5, 0); geo.rotateX(-Math.PI / 2);   // apex at origin, opening toward +z
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
  const c = new THREE.Mesh(geo, m); scene.add(c); c.visible = false;
  c.userData.set = (apex, dir, len, radius, op) => { c.visible = op > 0.01; c.position.copy(apex); c.quaternion.setFromUnitVectors(V3(0, 0, 1), dir.clone().normalize()); c.scale.set(radius, radius, len); m.opacity = 0.28 * op; };
  return c;
}

/** white 3D arrow from a to b; double = heads both ends; curved = arc through mid lifted by `bend` */
export function arrow(scene, color = '#FFFFFF') {
  const g = new THREE.Group(); scene.add(g); g.visible = false;
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, roughness: 0.4 });
  const shaft = new THREE.Mesh(new THREE.BufferGeometry(), mat), h1 = new THREE.Mesh(new THREE.ConeGeometry(1, 2.2, 20), mat), h2 = h1.clone(); g.add(shaft, h1, h2);
  [shaft, h1, h2].forEach((m) => { m.castShadow = true; });
  g.userData.set = (a, b, { r = 0.05, double = false, bend = 0, up = V3(0, 1, 0), grow = 1 } = {}) => {
    g.visible = grow > 0.01; if (!g.visible) return;
    const mid = a.clone().lerp(b, 0.5).addScaledVector(up, bend), curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const pts = []; for (let i = 0; i <= 40; i++) { const u = (double ? 0.5 - grow / 2 : 0) + (double ? grow : grow) * i / 40; pts.push(curve.getPoint(clamp(u))); }
    shaft.geometry.dispose(); shaft.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 10, false);
    const tip = pts[pts.length - 1], tdir = tip.clone().sub(pts[pts.length - 3]).normalize();
    h1.position.copy(tip).addScaledVector(tdir, r * 1.6); h1.quaternion.setFromUnitVectors(V3(0, 1, 0), tdir); h1.scale.setScalar(r * 2.4);
    h2.visible = double; if (double) { const t0 = pts[0], d0 = t0.clone().sub(pts[2]).normalize(); h2.position.copy(t0).addScaledVector(d0, r * 1.6); h2.quaternion.setFromUnitVectors(V3(0, 1, 0), d0); h2.scale.setScalar(r * 2.4); }
  };
  return g;
}

/** the first lookout: a thin-walled concrete box (pieces can be hidden when it's blown up) */
export function lookoutBox() {
  const g = new THREE.Group(), m = concreteMaterial(), w = 2.6, h = 1.6, t = 0.16;
  const add = (sx, sy, sz, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
  add(w, h, t, 0, h / 2, w / 2 - t / 2); add(t, h, w, -w / 2 + t / 2, h / 2, 0); add(t, h, w, w / 2 - t / 2, h / 2, 0);
  add(w * 0.32, h, t, -w * 0.34, h / 2, -w / 2 + t / 2); add(w * 0.32, h, t, w * 0.34, h / 2, -w / 2 + t / 2); add(w * 0.36, h * 0.35, t, 0, h * 0.175, -w / 2 + t / 2);
  g.userData.rise = (k) => g.children.forEach((c) => { c.scale.y = Math.max(0.001, k); c.position.y = (c.geometry.parameters.height * k) / 2 + (c === g.children[5] ? 0 : 0); });
  return g;
}

/** a wooden formwork frame + a pour bucket */
export function bucket() {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: '#8A8F93', metalness: 0.6, roughness: 0.45 });
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.28, 24, 1, true), m); b.material.side = THREE.DoubleSide; g.add(b);
  const bot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), m); bot.rotation.x = Math.PI / 2; bot.position.y = -0.14; g.add(bot);
  const fill = new THREE.Mesh(new THREE.CircleGeometry(0.145, 24), new THREE.MeshStandardMaterial({ color: '#7E7E78', roughness: 0.9 })); fill.rotation.x = -Math.PI / 2; fill.position.y = 0.08; g.add(fill);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return g;
}
export function hammer() {
  const g = new THREE.Group(), wood = new THREE.MeshStandardMaterial({ color: '#8A6038', roughness: 0.7 }), steel = new THREE.MeshStandardMaterial({ color: '#3B3D40', metalness: 0.8, roughness: 0.4 });
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.62, 12), wood); h.position.y = -0.24; g.add(h);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.09, 0.09), steel); head.position.y = -0.56; g.add(head);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return g;
}
export function torch() {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: '#2B2D30', metalness: 0.7, roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.32, 10), m); body.position.y = -0.12; g.add(body);
  const nz = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.08, 10), new THREE.MeshStandardMaterial({ color: '#B8893A', metalness: 0.9, roughness: 0.3 })); nz.position.y = -0.31; g.add(nz);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return g;
}
export function sandwich() {
  const g = new THREE.Group(), bread = new THREE.MeshStandardMaterial({ color: '#D9B27A', roughness: 0.9 }), crust = new THREE.MeshStandardMaterial({ color: '#9C6A34', roughness: 0.9 });
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.014, 0.11), bread); a.position.y = 0.007; g.add(a);
  const f = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.01, 0.105), new THREE.MeshStandardMaterial({ color: '#C24E3A', roughness: 0.7 })); f.position.y = 0.019; g.add(f);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.014, 0.11), crust); b.position.y = 0.031; g.add(b);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return g;
}
