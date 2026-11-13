// Our own generic chocolate eggs (no real brand artwork):
//  surpriseEgg(): foil-wrapped chocolate egg; .xray(k 0..1) fades the chocolate to glass and lights the toy capsule inside;
//  splitEgg(): plastic two-half egg; .open(k) separates the halves: one holds chocolate cream + spoon, the other the toy.
import { THREE, tex, fill, grain, glowMat, flat } from './core.js';
import { F, Ln, sm, ellD, INK } from './kit.js';

const EGG_Y = 1.3;   // egg = a sphere stretched 1.3x vertically
export function foilTex() {
  return tex(1024, 512, (c, W, H) => {
    fill(c, W, H, '#f6f2ea'); grain(c, W, H, 0.05);
    c.fillStyle = '#e8572a'; c.fillRect(0, H * 0.58, W, H * 0.42);                      // orange lower band
    c.fillStyle = '#ffd23a'; c.fillRect(0, H * 0.56, W, 14);
    for (let i = 0; i < 4; i++) { const x = i * W / 4 + W / 8;                          // a big "?" badge repeating round the egg
      F(ellD(x, H * 0.36, 78, 78), '#e8572a', { line: 7, seed: i, shadow: 0.2, soft: 0.15, hi: 0.3 });
      c.fillStyle = '#fff'; c.font = '900 120px Mont'; c.textAlign = 'center'; c.fillText('?', x, H * 0.36 + 42);
      c.fillStyle = '#7a2a10'; c.font = '900 34px Mont'; c.fillText('CHOCO', x, H * 0.8); }
    for (let i = 0; i < 60; i++) { c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2; c.beginPath(); const y = Math.random() * H; c.moveTo(0, y); c.lineTo(W, y + (Math.random() - 0.5) * 40); c.stroke(); }  // foil crinkles
  });
}
function capsule(col = '#ffcf2a') {   // the toy capsule: two half-spheres + a short barrel
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.35, emissive: new THREE.Color(col), emissiveIntensity: 0 });
  const r = 0.2, h = 0.14;
  const a = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m); a.position.y = h / 2;
  const b = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), m); b.position.y = -h / 2;
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24, 1, true), m);
  const band = new THREE.Mesh(new THREE.TorusGeometry(r * 1.01, 0.012, 6, 32), flat('#b98a10')); band.rotation.x = Math.PI / 2;
  g.add(a, b, c, band); g.userData.mat = m; return g;
}
export function surpriseEgg(scale = 1) {
  const g = new THREE.Group();
  const foil = new THREE.MeshStandardMaterial({ map: foilTex(), roughness: 0.28, metalness: 0.35, transparent: true, opacity: 1 });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 32), foil); shell.scale.set(1, EGG_Y, 1);
  const choc = new THREE.Mesh(new THREE.SphereGeometry(0.47, 40, 28), new THREE.MeshStandardMaterial({ color: '#5a2e18', roughness: 0.4, transparent: true, opacity: 0 }));
  choc.scale.set(1, EGG_Y, 1);
  const outline = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 32), new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide })); outline.scale.set(1.035, EGG_Y * 1.03, 1.035);
  const cap = capsule(); cap.visible = false;
  g.add(outline, shell, choc, cap); g.scale.setScalar(scale);
  g.userData = { foil, choc, cap, outline };
  /** k: 0 = wrapped egg, 0.5 = chocolate (foil gone), 1 = x-ray glass with glowing capsule */
  g.xray = (k, danger = 0) => {
    foil.opacity = 1 - Math.min(1, k * 2); foil.depthWrite = foil.opacity > 0.9;
    choc.material.opacity = k < 0.5 ? Math.min(1, k * 2) : 1 - (k - 0.5) * 1.5; choc.material.color.set(k > 0.5 ? '#9a5a38' : '#5a2e18'); choc.material.depthWrite = choc.material.opacity > 0.9;
    cap.visible = k > 0.5; cap.scale.setScalar(1 + 0.08 * Math.max(0, k - 0.5));
    const m = cap.userData.mat; m.emissiveIntensity = Math.max(0, k - 0.5) * 1.6; m.color.set(danger > 0.5 ? '#ff3a2a' : '#ffcf2a'); m.emissive.set(danger > 0.5 ? '#ff2a1a' : '#ffcf2a');
    outline.visible = k < 0.75;
  };
  g.xray(0); return g;
}

function toyFace() {   // what you see in the toy half: a little rocket toy in a sealed tray
  return tex(512, 664, (c, W, H) => { fill(c, W, H, '#bfe6ff', '#8fc8f0');
    F(sm([[256, 120], [330, 260], [330, 470], [182, 470], [182, 260]]), '#f4f0e6', { line: 8, seed: 1, shadow: 0.25 });
    F(ellD(256, 300, 44, 44), '#3a8fe0', { line: 6, seed: 2, shadow: 0.2, hi: 0.4 });
    F(sm([[182, 400], [120, 520], [182, 480]]), '#e8572a', { line: 6, seed: 3, shadow: 0.2 }); F(sm([[330, 400], [392, 520], [330, 480]]), '#e8572a', { line: 6, seed: 4, shadow: 0.2 });
    F(sm([[210, 470], [256, 580], [302, 470]]), '#ffcf2a', { line: 6, seed: 5, shadow: 0.1, hi: 0.4 });
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(170, 170, 60, 120, -0.4, 0, 6.3); c.fill(); });
}
function chocFace() {   // chocolate cream with two wafer balls and a swirl, plus a little spoon
  return tex(512, 664, (c, W, H) => { fill(c, W, H, '#6a3a1e', '#4a2410');
    F(sm([[60, 330], [150, 250], [256, 300], [360, 240], [452, 330], [360, 420], [256, 370], [150, 430]]), '#f6eee0', { line: 6, seed: 6, shadow: 0.2, hi: 0.3 });
    for (const [x, y] of [[170, 470], [340, 470]]) { F(ellD(x, y, 62, 62), '#d9a050', { line: 6, seed: x, shadow: 0.3, shadowCol: '#5a3008', hi: 0.4 }); for (let i = 0; i < 6; i++) Ln(`M ${x - 50} ${y - 30 + i * 12} L ${x + 50} ${y - 30 + i * 12}`, 2.5, i, 'rgba(90,50,10,0.5)'); }
    F(sm([[250, 90], [280, 90], [276, 230], [254, 230]]), '#f4f0e6', { line: 5, seed: 7, shadow: 0.2 }); F(ellD(265, 250, 30, 40), '#f4f0e6', { line: 5, seed: 8, shadow: 0.2 });
  });
}
export function splitEgg(scale = 1) {
  const g = new THREE.Group(), shellM = new THREE.MeshStandardMaterial({ color: '#f29ab8', roughness: 0.35 });
  const half = (side, faceT) => {   // built split along z, then turned 90deg so the cut runs along x; side>0 = right half
    const h = new THREE.Group(), inner = new THREE.Group(); inner.rotation.y = Math.PI / 2;
    const geo = new THREE.SphereGeometry(0.5, 40, 28, side > 0 ? 0 : Math.PI, Math.PI); const shell = new THREE.Mesh(geo, shellM);
    const out = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide })); out.scale.setScalar(1.035);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.5, 48), new THREE.MeshStandardMaterial({ map: faceT, roughness: 0.6, emissiveMap: faceT, emissive: 0xffffff, emissiveIntensity: 0.25 }));
    if (side > 0) face.rotation.y = Math.PI; face.position.z = side > 0 ? 0.002 : -0.002;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.018, 6, 48), flat('#c25a80'));
    inner.add(out, shell, face, rim); h.add(inner); h.scale.set(1, EGG_Y, 1); return h;
  };
  const A = half(-1, chocFace()), B = half(1, toyFace());   // A shows its face to +x, B to -x when closed
  g.add(A, B); g.scale.setScalar(scale);
  /** k: 0 closed, 1 halves apart and turned to face the camera */
  g.open = (k) => { A.position.x = -0.62 * k; B.position.x = 0.62 * k; A.rotation.y = -1.25 * k; B.rotation.y = 1.25 * k; A.position.y = B.position.y = 0.06 * Math.sin(k * Math.PI); };
  g.open(0); return g;
}
