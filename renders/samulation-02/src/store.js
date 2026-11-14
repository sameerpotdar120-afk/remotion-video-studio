// SET B: a late-night corner store. Warm interior, candy shelves both sides, checkout counter with a pyramid of eggs,
// a smug clerk, neon OPEN sign in the window, the street at night outside.
import { THREE, tex, fill, frame, grain, lit, glowMat, flat, plane, box, inkBox, glow, point, Actor, rnd } from './core.js';
import { F, Ln, sm, ellD, rectD, INK } from './kit.js';
import { HERO, LOOKS } from './char.js';
import { foilTex, splitEgg } from './eggs.js';

function shelfTex() {   // a shelf bay full of drawn candy boxes and jars
  return tex(1024, 1024, (c, W, H) => { fill(c, W, H, '#7a4a2a', '#5a341c'); grain(c, W, H, 0.05);
    const cols = ['#e8572a', '#3a8fe0', '#ffcf2a', '#e23ad8', '#3ae28a', '#f29ab8', '#8a5ad8', '#f4f0e6'];
    for (let r = 0; r < 4; r++) { const y0 = 40 + r * 245; F(rectD(10, y0 + 200, W - 20, 26, 4), '#c98a4a', { line: 5, seed: r, shadow: 0.25 });
      let x = 24; let k = r * 7;
      while (x < W - 60) { const w = 60 + rnd(k) * 70, h = 110 + rnd(k + 3) * 80, col = cols[Math.floor(rnd(k + 9) * cols.length)];
        if (rnd(k + 5) > 0.7) { F(rectD(x, y0 + 200 - h * 0.8, w, h * 0.8, w * 0.3), 'rgba(220,240,255,0.9)', { line: 5, seed: k, shadow: 0.1 }); for (let b = 0; b < 6; b++) { c.fillStyle = cols[(b + k) % 8]; c.beginPath(); c.arc(x + 14 + rnd(b + k) * (w - 28), y0 + 200 - 16 - rnd(b * 3 + k) * h * 0.55, 10, 0, 6.3); c.fill(); } }
        else { F(rectD(x, y0 + 200 - h, w, h, 6), col, { line: 5, seed: k, shadow: 0.3, soft: 0.2, hi: 0.2 }); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(x + 8, y0 + 200 - h + 18, w - 16, 14); }
        x += w + 10; k++; } }
    frame(c, W, H, 7); }, { repeat: [3, 1] });
}
export function buildStore() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#f6dca8'); scene.fog = new THREE.Fog('#f6dca8', 14, 34);
  const g = new THREE.Group(); scene.add(g);
  const floorT = tex(512, 512, (c, W, H) => { fill(c, W, H, '#e8dcc4'); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) { c.fillStyle = '#c9b48e'; c.fillRect(i * 64, j * 64, 64, 64); } grain(c, W, H, 0.05); }, { repeat: [6, 10] });
  g.add(plane(10, 20, lit(floorT, { roughness: 0.45 }), [0, 0, -4], [-Math.PI / 2, 0, 0]));
  g.add(plane(10, 20, flat('#f0e2c0'), [0, 3.4, -4], [Math.PI / 2, 0, 0]));
  for (let i = 0; i < 4; i++) g.add(plane(1.6, 0.3, new THREE.MeshBasicMaterial({ color: '#fffbea' }), [0, 3.38, 1 - i * 3.2], [Math.PI / 2, 0, 0]));
  const sh = shelfTex();
  for (const sx of [-1, 1]) { g.add(plane(14, 2.6, lit(sh), [sx * 2.6, 1.3, -5], [0, -sx * Math.PI / 2, 0])); g.add(plane(14, 0.8, flat('#e9d4a8'), [sx * 2.6, 3.0, -5], [0, -sx * Math.PI / 2, 0])); }
  // back wall: window with the night street + neon OPEN sign + posters
  const backT = tex(1024, 640, (c, W, H) => { fill(c, W, H, '#f0dcae', '#e6cd98'); grain(c, W, H, 0.04);
    F(rectD(300, 80, 600, 420, 6), '#1c1f5a', { line: 9, seed: 1, shadow: 0 });
    for (let i = 0; i < 9; i++) { c.fillStyle = ['#ffcf7a', '#9fd8ff', '#ff6ab0'][i % 3]; c.globalAlpha = 0.7; c.fillRect(330 + i * 62, 260 + rnd(i) * 160, 26, 30 + rnd(i * 3) * 50); } c.globalAlpha = 1;
    Ln('M 600 80 L 600 500', 7, 2, INK);
    F(rectD(40, 120, 200, 280, 6), '#e8572a', { line: 6, seed: 3, shadow: 0.2 }); c.fillStyle = '#fff'; c.font = '900 48px Mont'; c.textAlign = 'center'; c.fillText('SALE', 140, 230); c.font = '800 26px Mont'; c.fillText('CANDY', 140, 280);
    frame(c, W, H, 6); });
  g.add(plane(5.2, 3.4, lit(backT), [0, 1.7, -11.9]));
  const openT = tex(512, 200, (c, W, H) => { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); c.strokeStyle = '#ff3a8a'; c.lineWidth = 16; c.lineJoin = 'round'; c.font = '900 130px Mont'; c.textAlign = 'center'; c.strokeText('OPEN', W / 2, 150); c.fillStyle = '#ffe0ef'; c.fillText('OPEN', W / 2, 150); });
  g.add(plane(1.3, 0.5, new THREE.MeshBasicMaterial({ map: openT, blending: THREE.AdditiveBlending, transparent: true }), [0.6, 2.2, -11.85]));
  g.add(glow('#ff3a8a', 2.2, [0.6, 2.2, -11.7], 0.25));
  // checkout counter near the camera on the right, register, egg pyramid display on the counter
  g.add(inkBox(1.0, 1.05, 2.6, '#c98a4a', [1.55, 0.525, -1.4], { col2: '#a8703a' }));
  g.add(inkBox(1.1, 0.06, 2.7, '#f4ead8', [1.55, 1.08, -1.4]));
  g.add(inkBox(0.45, 0.32, 0.4, '#3a3f5a', [1.75, 1.27, -2.2], { detail: (c, W, H) => { c.fillStyle = '#3ae28a'; c.fillRect(W * 0.15, H * 0.15, W * 0.7, H * 0.3); } }));
  const foil = new THREE.MeshStandardMaterial({ map: foilTex(), roughness: 0.3, metalness: 0.35 }), eggGeo = new THREE.SphereGeometry(0.05, 20, 14);
  const pyr = new THREE.Group(); g.add(pyr); pyr.position.set(1.35, 1.11, -0.85);
  for (let lv = 0; lv < 4; lv++) { const n = 4 - lv; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const e = new THREE.Mesh(eggGeo, foil); e.scale.set(1, 1.3, 1); e.position.set((i - (n - 1) / 2) * 0.105, 0.065 + lv * 0.115, (j - (n - 1) / 2) * 0.105); pyr.add(e); } }
  const pyrSign = tex(256, 128, (c, W, H) => { fill(c, W, H, '#ffd23a'); c.fillStyle = '#7a2a10'; c.font = '900 40px Mont'; c.textAlign = 'center'; c.fillText('NEW!', W / 2, 60); c.font = '800 24px Mont'; c.fillText('CHOCO EGGS', W / 2, 100); frame(c, W, H, 7); });
  g.add(plane(0.36, 0.18, lit(pyrSign), [1.35, 1.62, -0.85], [0, -0.5, 0]));
  // the split egg for the reveal, sitting on the counter
  const joy = splitEgg(0.32); joy.position.set(1.3, 1.32, -1.75); g.add(joy);
  scene.add(new THREE.HemisphereLight('#fff2d8', '#a07850', 1.6)); const key = new THREE.DirectionalLight('#fff0d0', 0.8); key.position.set(-2, 5, 4); scene.add(key);
  g.add(point('#ffe6b0', 10, [0.5, 2.8, -0.5], 8));
  const hero = new Actor({ ...HERO, body: '#3fa58f', sh: '#0f3a32' }).addTo(scene);
  const clerk = new Actor({ ...LOOKS.B, body: '#d8402e', sh: '#4a0a05' }).addTo(scene);
  const shopper = new Actor({ name: 's', body: '#8a5ad8', sh: '#22104a', shoe: '#eee', hair: 'topknot', hairCol: '#1e1d26', hairSh: '#000' }).addTo(scene);
  return { scene, hero, clerk, shopper, joy, pyr };
}
