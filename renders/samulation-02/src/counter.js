// SET: the prize counter inside the hall: warm cream walls, shelves of novelty prizes, a glass counter, a smug clerk,
// a "PRIZE COUNTER" sign (our own wording), carpet, and the glass exit doors with a THANK YOU sign behind the hero.
// Props that pop up on the counter on their words: snacks, perfume, tokens. A ball bucket for the hero.
import { THREE, tex, fill, frame, grain, lit, glowMat, flat, plane, box, inkBox, glow, point, Actor, rnd } from './core.js';
import { F, Ln, sm, ellD, rectD, INK } from './kit.js';
import { HERO, LOOKS } from './char.js';

function prizeShelf() {
  return tex(1024, 1024, (c, W, H) => { fill(c, W, H, '#f4ead6', '#e8dcc0'); grain(c, W, H, 0.04);
    const cols = ['#e8572a', '#3a8fe0', '#ffcf2a', '#e23ad8', '#3ae28a', '#f29ab8', '#8a5ad8', '#f4f0e6'];
    for (let r = 0; r < 4; r++) { const y0 = 40 + r * 245; F(rectD(10, y0 + 200, W - 20, 22, 4), '#c9a46a', { line: 5, seed: r, shadow: 0.2 });
      let x = 24, k = r * 11;
      while (x < W - 70) { const kind = Math.floor(rnd(k + 2) * 4), w = 56 + rnd(k) * 50, h = 90 + rnd(k + 3) * 80, col = cols[Math.floor(rnd(k + 9) * 8)];
        if (kind === 0) { F(sm([[x, y0 + 200], [x, y0 + 200 - h * 0.6], [x + w * 0.3, y0 + 200 - h], [x + w * 0.7, y0 + 200 - h], [x + w, y0 + 200 - h * 0.6], [x + w, y0 + 200]]), 'rgba(200,235,255,0.95)', { line: 5, seed: k, shadow: 0.1 }); F(rectD(x + w * 0.35, y0 + 200 - h - 18, w * 0.3, 20, 3), col, { line: 4, seed: k + 1, shadow: 0 }); }   // perfume bottle
        else if (kind === 1) { F(rectD(x, y0 + 200 - h, w, h, 8), col, { line: 5, seed: k, shadow: 0.3, soft: 0.2, hi: 0.2 }); c.fillStyle = 'rgba(255,255,255,0.9)'; c.font = '900 20px Mont'; c.textAlign = 'center'; c.fillText('CHIPS', x + w / 2, y0 + 200 - h / 2); }   // snack bag
        else if (kind === 2) { F(ellD(x + w / 2, y0 + 200 - w / 2, w / 2, w / 2), col, { line: 5, seed: k, shadow: 0.25, hi: 0.3 }); F(ellD(x + w / 2 - w * 0.15, y0 + 200 - w * 0.62, 6, 6), INK, { line: 0, ink: false, shadow: 0, soft: 0, hi: 0 }); F(ellD(x + w / 2 + w * 0.15, y0 + 200 - w * 0.62, 6, 6), INK, { line: 0, ink: false, shadow: 0, soft: 0, hi: 0 }); }   // plush toy
        else { F(rectD(x, y0 + 200 - h * 0.7, w, h * 0.7, 4), col, { line: 5, seed: k, shadow: 0.3 }); Ln(`M ${x} ${y0 + 200 - h * 0.35} L ${x + w} ${y0 + 200 - h * 0.35}`, 4, k, 'rgba(255,255,255,0.8)'); }   // gift box
        x += w + 12; k++; } }
    frame(c, W, H, 7); }, { repeat: [2, 1] });
}
export function buildCounter() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#f3dfb0'); scene.fog = new THREE.Fog('#f6dca8', 12, 30);
  const g = new THREE.Group(); scene.add(g);
  const carpetT = tex(256, 256, (c, W, H) => { fill(c, W, H, '#8f1f24'); grain(c, W, H, 0.08);
    for (const [cx, cy] of [[64, 64], [192, 64], [64, 192], [192, 192], [128, 128], [0, 0], [256, 0], [0, 256], [256, 256], [128, 0], [0, 128], [256, 128], [128, 256]]) { c.strokeStyle = '#d99a3a'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx, cy - 26); c.lineTo(cx + 26, cy); c.lineTo(cx, cy + 26); c.lineTo(cx - 26, cy); c.closePath(); c.stroke(); c.fillStyle = '#6a1218'; c.fill(); } }, { repeat: [6, 10] });
  g.add(plane(14, 20, lit(carpetT, { roughness: 0.85 }), [0, 0, -2], [-Math.PI / 2, 0, 0]));
  g.add(plane(14, 20, flat('#f0dcae'), [0, 3.6, -2], [Math.PI / 2, 0, 0]));
  for (let i = 0; i < 4; i++) g.add(plane(0.4, 6, new THREE.MeshBasicMaterial({ color: '#fffdf0' }), [-3 + i * 2, 3.58, -2], [Math.PI / 2, 0, 0]));
  // back wall behind the counter: prize shelves + sign
  g.add(plane(7, 2.4, lit(prizeShelf()), [0.3, 1.9, -3.4]));
  const wallT = tex(1024, 512, (c, W, H) => { fill(c, W, H, '#f0dcae', '#e6cd98'); grain(c, W, H, 0.04); for (let i = 1; i < 8; i++) Ln(`M ${i * 128} 0 L ${i * 128} ${H}`, 3, i, 'rgba(90,60,20,0.35)'); frame(c, W, H, 5); }, { repeat: [3, 1] });
  g.add(plane(16, 3.6, lit(wallT), [0, 1.8, -3.45]));
  const signT = tex(1024, 220, (c, W, H) => { fill(c, W, H, '#ffffff'); c.fillStyle = '#d8262e'; c.fillRect(0, H - 40, W, 40); c.fillRect(0, 0, W, 16);
    c.fillStyle = '#2a2a33'; c.font = '900 116px Mont'; c.textAlign = 'center'; c.fillText('PRIZE COUNTER', W / 2 - 40, 140);
    F(ellD(W - 90, 95, 58, 58), '#d8262e', { line: 6, seed: 1, shadow: 0 }); c.fillStyle = '#fff'; c.font = "700 46px 'IPAGothic', sans-serif"; c.fillText('景品', W - 90, 112); frame(c, W, H, 9); });
  g.add(box(3.6, 0.78, 0.1, [flat('#fff'), flat('#fff'), flat('#fff'), flat('#fff'), glowMat(signT, 0.55), flat('#fff')], [0.3, 3.25, -3.3]));
  // glass counter
  const cabT = tex(1024, 384, (c, W, H) => { fill(c, W, H, '#3a2a22', '#22160f'); for (let i = 0; i < 9; i++) { F(rectD(30 + i * 110, 90, 80, 150, 8), ['#e8572a', '#3a8fe0', '#ffcf2a', '#3ae28a', '#f29ab8'][i % 5], { line: 5, seed: i, shadow: 0.3 }); c.fillStyle = '#fff'; c.font = '800 18px Mont'; c.textAlign = 'center'; c.fillText(['CHIPS', 'CHOCO', 'SODA', 'GUM', 'CANDY'][i % 5], 70 + i * 110, 170); }
    for (let i = 0; i < 7; i++) { c.fillStyle = 'rgba(255,220,140,0.85)'; c.beginPath(); c.arc(80 + i * 140, 300, 14, 0, 6.3); c.fill(); } frame(c, W, H, 9); });
  g.add(box(4.0, 1.0, 0.8, [flat('#2a1c14'), flat('#2a1c14'), flat('#f4ead8'), flat('#2a1c14'), glowMat(cabT, 0.5), flat('#2a1c14')], [0.3, 0.5, -1.6]));
  g.add(inkBox(4.1, 0.06, 0.9, '#f8f2e6', [0.3, 1.03, -1.6]));
  g.add(inkBox(0.5, 0.34, 0.42, '#2a2c3a', [1.6, 1.23, -1.8], { detail: (c, W, H) => { c.fillStyle = '#ff4a2a'; c.font = '900 40px Mont'; c.textAlign = 'center'; c.fillText('04820', W / 2, H * 0.5); } }));
  // exit doors to the left, THANK YOU sign above
  const doorT = tex(512, 768, (c, W, H) => { fill(c, W, H, '#1e2a6a', '#121a48'); for (let i = 0; i < 9; i++) { c.fillStyle = ['#ffcf7a', '#9fd8ff', '#ff6ab0'][i % 3]; c.globalAlpha = 0.6; c.fillRect(30 + i * 52, 260 + rnd(i) * 300, 20, 40 + rnd(i * 3) * 60); } c.globalAlpha = 1;
    Ln(`M ${W / 2} 0 L ${W / 2} ${H}`, 9, 1, INK); c.fillStyle = 'rgba(255,255,255,0.7)'; c.font = '800 26px Mont'; c.textAlign = 'center'; c.fillText('AUTO DOOR', W / 2, 120); frame(c, W, H, 12, '#d8d8e8'); });
  g.add(plane(2.0, 2.7, glowMat(doorT, 0.7), [-3.2, 1.35, -3.38]));
  const tyT = tex(768, 220, (c, W, H) => { fill(c, W, H, '#ffffff'); c.fillStyle = '#d8262e'; c.fillRect(0, H - 34, W, 34); c.fillStyle = '#2a2a33'; c.font = '900 100px Mont'; c.textAlign = 'center'; c.fillText('THANK YOU', W / 2, 135); frame(c, W, H, 9); });
  g.add(plane(2.0, 0.58, lit(tyT), [-3.2, 3.05, -3.36]));
  const matT = tex(512, 256, (c, W, H) => { fill(c, W, H, '#c8262e'); c.fillStyle = '#ffd23a'; c.font = '900 64px Mont'; c.textAlign = 'center'; c.fillText('WELCOME', W / 2, 150); frame(c, W, H, 8, '#ffd23a'); });
  g.add(plane(1.8, 0.9, lit(matT), [-3.2, 0.01, -2.4], [-Math.PI / 2, 0, 0]));
  // the counter props that pop up on their words
  const snack = inkBox(0.22, 0.3, 0.08, '#e8572a', [0, 0, 0], { detail: (c, W, H) => { c.fillStyle = '#fff'; c.font = '900 34px Mont'; c.textAlign = 'center'; c.fillText('CHIPS', W / 2, H / 2 + 12); } });
  const perfume = new THREE.Group(); { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.2, 20), new THREE.MeshStandardMaterial({ color: '#f29ab8', roughness: 0.1, transparent: true, opacity: 0.85 })); b.position.y = 0.1;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12), flat('#ffd23a', { metalness: 0.6, roughness: 0.3 })); cap.position.y = 0.23; perfume.add(b, cap); }
  const tokens = new THREE.Group(); for (let i = 0; i < 4; i++) { const t = inkBox(0.1, 0.04, 0.06, '#ffd23a', [i * 0.04 - 0.06, 0.02 + i * 0.012, (i % 2) * 0.03], { px: 64 }); t.rotation.y = i * 0.4; tokens.add(t); }
  g.add(snack, perfume, tokens);
  const bucket = new THREE.Group(); { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.28, 24), flat('#1a1a22')); m.position.y = 0.14; bucket.add(m);
    for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), flat('#e6e9f2', { roughness: 0.2, metalness: 0.8 })); const a = i * 2.4, r = 0.03 + (i % 4) * 0.03; b.position.set(Math.cos(a) * r, 0.29 + (i % 3) * 0.02, Math.sin(a) * r); bucket.add(b); } }
  g.add(bucket);
  scene.add(new THREE.HemisphereLight('#fff2d8', '#a07850', 1.55)); const key = new THREE.DirectionalLight('#fff0d0', 0.8); key.position.set(-2, 5, 4); scene.add(key);
  g.add(point('#ffe6b0', 8, [0.3, 2.8, 0.2], 8));
  const hero = new Actor(HERO).addTo(scene);
  const clerk = new Actor({ ...LOOKS.B, body: '#2a2a33', sh: '#0a0a12', hat: 'none', hair: 'mop', hairCol: '#1e1a18', hairSh: '#000' }).addTo(scene);
  const guy = new Actor({ name: 'guy', body: '#d8a03a', sh: '#4a2c05', shoe: '#eee', hair: 'topknot', hairCol: '#1e1d26', hairSh: '#000' }).addTo(scene);
  return { scene, hero, clerk, guy, snack, perfume, tokens, bucket };
}
