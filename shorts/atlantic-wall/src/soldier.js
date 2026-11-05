// The soldier: the jointed Human rig, re-dressed (navy tee, grey shorts, skin knees, olive socks, brown boots)
// plus a brimmed steel helmet, webbing belt + cross strap, and props that ride in the hands.
import * as THREE from 'three';
import { Human } from './core/human.js';

const lin = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
function recolor(mesh, fn) {
  const g = mesh.geometry.clone(), p = g.attributes.position, c = g.attributes.color;
  for (let i = 0; i < p.count; i++) { const r = fn(p.getX(i), p.getY(i), p.getZ(i)); if (r) c.setXYZ(i, r[0], r[1], r[2]); }
  c.needsUpdate = true; mesh.geometry = g;
}

export class Soldier extends Human {
  constructor() {
    super({ skin: '#D9A07C', shirt: '#26304A', pants: '#62656F', shoes: '#4A3222', hair: '#3B2A1E', iris: '#3E3226' });
    const SK = lin('#D9A07C'), SHORT = lin('#62656F'), SOCK = lin('#59603F'), BOOT = lin('#4A3222'), SOLE = lin('#241812'), SHIRT = lin('#26304A');
    // shorts end above the knee; shins are bare skin, then socks and boots
    for (const k of ['L', 'R']) {
      recolor(this.leg[k].hip.children[0], (x, y) => (y < -0.3 ? SK : null));
      recolor(this.leg[k].kn.children[0], (x, y, z) => (y > -0.33 ? SK : y > -0.385 ? SOCK : y < -0.462 ? SOLE : BOOT));
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.074, 0.011, 10, 40), new THREE.MeshStandardMaterial({ color: '#5A5D67', roughness: 0.9 }));
      cuff.rotation.x = Math.PI / 2; cuff.position.y = -0.3; cuff.castShadow = true; this.leg[k].hip.add(cuff);
    }
    // the shirt hem tucks in; sleeves stay
    recolor(this.spine.children[0], (x, y) => (y < 0.0 && y > -0.06 ? SHIRT : null));
    const olive = new THREE.MeshPhysicalMaterial({ color: '#4E5A34', roughness: 0.55, metalness: 0.25, clearcoat: 0.35, clearcoatRoughness: 0.5 });
    const strapM = new THREE.MeshStandardMaterial({ color: '#7A5A36', roughness: 0.8 });
    // Brodie-style helmet: shallow dome + wide flat brim, tilted a touch forward
    const helm = new THREE.Group(); helm.position.set(0, 0.175, -0.008); helm.rotation.x = -0.06; this.head.add(helm);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.142, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), olive); dome.scale.set(1, 0.98, 1.06); helm.add(dome);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.188, 0.192, 0.01, 64, 1, false), olive); brim.position.y = 0.0; brim.scale.set(1, 1, 1.07); helm.add(brim);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.0065, 8, 64), olive); rim.rotation.x = Math.PI / 2; rim.scale.set(1, 1.07, 1); helm.add(rim);
    const chin = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.005, 6, 40, Math.PI), strapM); chin.rotation.set(0, Math.PI / 2, Math.PI); chin.position.set(0, -0.02, 0.0); chin.scale.set(1, 1.45, 1); helm.add(chin);
    helm.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.helmet = helm;
    const headMeshes = this.head.children.filter((o) => o.isMesh && o.material === this.mat); if (headMeshes.length > 1) headMeshes[headMeshes.length - 1].visible = false;   // hair hides under the helmet
    // webbing: belt + buckle + pouches + cross strap over the right shoulder
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.022, 10, 48), strapM); belt.rotation.x = Math.PI / 2; belt.scale.set(1, 0.7, 1); belt.position.y = 0.0; this.spine.add(belt);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.012), new THREE.MeshStandardMaterial({ color: '#B89A5A', metalness: 0.8, roughness: 0.35 })); buckle.position.set(0, 0.0, 0.118); this.spine.add(buckle);
    for (const s of [-1, 1]) { const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.04), strapM); pouch.position.set(s * 0.12, -0.02, 0.09); pouch.rotation.y = s * 0.5; this.spine.add(pouch); }
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.44, 0.012), strapM); cross.position.set(0.02, 0.24, 0.116); cross.rotation.set(-0.12, 0, -0.62); this.spine.add(cross);
    [belt, buckle, cross].forEach((m) => { m.castShadow = true; });
    // hand sockets (props attach here): at the fist, in forearm space
    this.hand = {};
    for (const k of ['L', 'R']) { const h = new THREE.Group(); h.position.set(0, -0.35, 0.015); this.arm[k].el.add(h); this.hand[k] = h; }
  }
}

const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
/** two-bone IK: put soldier's k ('L'/'R') hand socket at world point `target` (shoulder 0.27, forearm 0.365 to the socket) */
export function reach(sol, k, target, twist = 0) {
  const sh = sol.arm[k].sh, el = sol.arm[k].el; sol.group.updateMatrixWorld(true);
  const parent = sh.parent; _m.copy(parent.matrixWorld).invert();
  const t = _v.copy(target).applyMatrix4(_m).sub(sh.position);
  const L1 = 0.27, L2 = 0.365, d = Math.min(t.length(), L1 + L2 - 1e-3), dir = t.clone().normalize();
  const bend = Math.PI - Math.acos(THREE.MathUtils.clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  const a = Math.acos(THREE.MathUtils.clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const h0 = new THREE.Vector3(0, -Math.cos(a), Math.sin(a));
  sh.quaternion.setFromUnitVectors(h0, dir); if (twist) sh.quaternion.multiply(_q.setFromAxisAngle(h0, twist));
  el.rotation.set(-bend, 0, 0); sol.group.updateMatrixWorld(true);
}

/** a long-handled spade: shaft along -Y from the grip, blade at the end */
export function shovel() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: '#8A6038', roughness: 0.7 }), steel = new THREE.MeshPhysicalMaterial({ color: '#7E8186', metalness: 0.85, roughness: 0.42 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 1.0, 12), wood); shaft.position.y = -0.4; g.add(shaft);
  const grip = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 20), wood); grip.position.y = 0.12; g.add(grip);
  const sh = new THREE.Shape(); sh.moveTo(-0.11, 0); sh.lineTo(0.11, 0); sh.lineTo(0.1, -0.2); sh.quadraticCurveTo(0, -0.32, -0.1, -0.2); sh.lineTo(-0.11, 0);
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.006, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 1 }), steel);
  blade.position.set(0, -0.9, -0.003); blade.rotation.x = 0.18; g.add(blade);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
