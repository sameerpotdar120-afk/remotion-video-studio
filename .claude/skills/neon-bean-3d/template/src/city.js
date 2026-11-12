// SET 2: a neon shopping street at night that opens into an aerial city grid (the camera cranes up through it).
import { THREE, tex, fill, frame, grain, lit, glowMat, flat, plane, box, inkBox, glow, point, Actor, rnd } from './core.js';
import { F, Ln, sm, ellD, rectD, INK } from './kit.js';
import { LOOKS } from './char.js';
const J = "'IPAGothic', sans-serif";

function facade(seed, base, cols, rows) {   // colour map + emissive map (only the lit windows glow)
  const W = 384, H = 768, lit_ = []; const draw = (em) => (c) => {
    if (em) { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); } else { fill(c, W, H, base[0], base[1]); grain(c, W, H, 0.05, seed); }
    const cw = W / cols, rh = H / rows;
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      const on = rnd(seed * 31 + r * 7 + q * 13) > 0.52, warm = rnd(seed + r * 3 + q) > 0.3, x = q * cw + cw * 0.18, y = r * rh + rh * 0.22, w = cw * 0.64, h = rh * 0.56;
      if (em) { if (on) { c.fillStyle = warm ? '#ffcf7a' : '#9fd8ff'; c.fillRect(x, y, w, h); } }
      else { F(rectD(x, y, w, h, 3), on ? (warm ? '#ffd98f' : '#bfe6ff') : '#23264f', { line: 4, seed: r * 9 + q, shadow: 0, soft: 0, hi: 0, tex: 0 }); if (on) Ln(`M ${x + w / 2} ${y} L ${x + w / 2} ${y + h}`, 2.5, q, INK); }
    }
    if (!em) { for (let r = 1; r < rows; r++) Ln(`M 0 ${r * rh} L ${W} ${r * rh}`, 2.5, r + seed, 'rgba(10,8,40,0.6)'); frame(c, W, H, 6); }
  };
  const map = tex(W, H, draw(false)), em = tex(W, H, draw(true));
  return new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 1.0, roughness: 0.95 });
}
function neon(text, sub, c0, c1, arrow = true) {   // a vertical neon board: stacked letters, katakana, arrow
  return tex(200, 900, (c, W, H) => { fill(c, W, H, c0, c1); c.fillStyle = '#fff6e0'; c.textAlign = 'center';
    c.font = `700 40px ${J}`; c.fillText(sub, W / 2, 62); c.fillRect(30, 80, W - 60, 5);
    c.font = '900 92px Mont'; [...text].forEach((ch, i) => c.fillText(ch, W / 2, 180 + i * (arrow ? 560 : 660) / text.length));
    if (arrow) { c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(W / 2 - 34, 740); c.lineTo(W / 2 + 34, 740); c.lineTo(W / 2 + 34, 800); c.lineTo(W / 2 + 70, 800); c.lineTo(W / 2, 880); c.lineTo(W / 2 - 70, 800); c.lineTo(W / 2 - 34, 800); c.fill(); c.strokeStyle = '#3a1a00'; c.lineWidth = 5; c.stroke(); }
    frame(c, W, H, 9, '#fff0c0'); });
}

export function buildCity() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#070a24'); scene.fog = new THREE.Fog('#0d1140', 40, 190);
  const g = new THREE.Group(); scene.add(g);
  const mats = [facade(1, ['#4e55a8', '#3a3f86'], 4, 9), facade(2, ['#5a4f9c', '#40387a'], 3, 8), facade(3, ['#3f5aa6', '#2f4484'], 5, 10), facade(4, ['#62589c', '#454078'], 4, 7), facade(5, ['#39468f', '#2a346e'], 3, 6)];
  const roof = flat('#23264f');
  const block = (x, z, w, d, h, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [m, m, roof, roof, m, m]); b.position.set(x, h / 2, z); g.add(b); return b; };
  // ── ground: wet road with lane marks, sidewalks ──
  const roadT = tex(512, 2048, (c, W, H) => { fill(c, W, H, '#262a66', '#1a1c4c'); grain(c, W, H, 0.07); for (let i = 0; i < 16; i++) { c.fillStyle = 'rgba(230,235,255,0.75)'; c.fillRect(W / 2 - 7, i * 128 + 20, 14, 70); }
    c.fillStyle = 'rgba(230,235,255,0.5)'; c.fillRect(40, 0, 8, H); c.fillRect(W - 48, 0, 8, H); });
  roadT.wrapT = THREE.RepeatWrapping; roadT.repeat.set(1, 4);
  g.add(plane(7, 240, lit(roadT, { roughness: 0.22, metalness: 0.1 }), [0, 0, -90], [-Math.PI / 2, 0, 0]));
  g.add(plane(400, 400, flat('#14173e', { roughness: 0.5 }), [0, -0.02, -90], [-Math.PI / 2, 0, 0]));
  for (const sx of [-1, 1]) g.add(inkBox(2.2, 0.16, 240, '#5a5f9f', [sx * 4.6, 0.08, -90], { px: 128 }));
  // ── the main street: two rows of buildings with shop fronts and neon ──
  const signs = [['PACHINKO', 'パチンコ', '#ff2f8a', '#b0125c'], ['SLOTS', 'スロット', '#22c8e8', '#0f7fa8'], ['LUCKY', 'ラッキー', '#ff8a1f', '#c24a08'], ['FEVER', 'フィーバー', '#e23ad8', '#8a1590'], ['BALLS', 'たま', '#3ae28a', '#128a4a']];
  const doorT = tex(256, 256, (c, W, H) => { fill(c, W, H, '#fff0c0', '#ffc970'); Ln(`M ${W / 2} 0 L ${W / 2} ${H}`, 8, 1, INK); F(rectD(20, 20, W - 40, 50, 4), '#e8384a', { line: 5, seed: 2, shadow: 0 }); frame(c, W, H, 10); });
  let k = 0;
  for (let i = 0; i < 16; i++) for (const sx of [-1, 1]) {
    const w = 5 + rnd(k) * 3, h = 9 + rnd(k + 5) * 14, z = 2 - i * 7.2; block(sx * (5.7 + 3), z, 6, 6.6, h, mats[k % 5]);
    const s = signs[(i + (sx > 0 ? 2 : 0)) % signs.length], st = neon(s[0], s[1], s[2], s[3]);
    const sm_ = [flat('#111'), flat('#111'), flat('#111'), flat('#111'), glowMat(st, 1.12), glowMat(st, 1.12)];
    g.add(box(0.95, 4.3, 0.14, sm_, [sx * 5.0, 4.6 + rnd(k + 9) * 1.5, z + 1.2]));
    g.add(plane(2.0, 2.3, glowMat(doorT, 1.0), [sx * 5.68, 1.15, z - 0.6], [0, -sx * Math.PI / 2, 0]));
    // coloured reflection streak on the wet road + haze
    const refl = plane(2.6, 7, new THREE.MeshBasicMaterial({ map: glowTexFor(s[2]), blending: THREE.AdditiveBlending, transparent: true, opacity: 0.5, depthWrite: false }), [sx * 2.6, 0.02, z + 1.2], [-Math.PI / 2, 0, 0]); g.add(refl);
    g.add(glow(s[2], 4.5, [sx * 4.9, 4.4, z + 1.2], 0.1));
    if (i < 6) g.add(point(s[2], 14, [sx * 4.2, 3.2, z + 1.2], 12, 1.5));
    k++;
  }
  // parked van, pole, P sign
  g.add(inkBox(1.9, 1.5, 4.0, '#6a70b0', [-2.3, 0.95, 0.5], { col2: '#4e5494' })); g.add(inkBox(1.7, 0.7, 1.4, '#565c9e', [-2.3, 1.95, 1.2]));
  for (const z of [-0.6, 1.9]) g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 2.0, 16), flat('#0d0d1e')).rotateZ(Math.PI / 2).translateY(2.3).translateZ(z).translateX(0.38));
  const pT = tex(128, 128, (c) => { F(ellD(64, 64, 56, 56), '#ffcf2a', { line: 7, seed: 1, shadow: 0.15 }); c.fillStyle = '#1b1b3a'; c.font = '900 84px Mont'; c.textAlign = 'center'; c.fillText('P', 64, 94); });
  g.add(plane(0.8, 0.8, new THREE.MeshStandardMaterial({ map: pT, emissiveMap: pT, emissive: 0xffffff, emissiveIntensity: 1.2, transparent: true, alphaTest: 0.4 }), [-3.6, 3.3, 3.2]));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 8), flat('#0d0d1e')).translateX(-3.6).translateY(1.7).translateZ(3.18));
  // ── the wider city for the aerial reveal: a grid of blocks with rooftop glow strips ──
  for (let ix = -6; ix <= 6; ix++) for (let iz = 0; iz < 13; iz++) {
    if (Math.abs(ix) <= 1) continue; const x = ix * 17 + (rnd(ix * 9 + iz) - 0.5) * 3, z = 10 - iz * 17, h = 8 + rnd(ix * 5 + iz * 3) * 22;
    block(x, z, 10 + rnd(ix + iz) * 3, 10 + rnd(ix * 2 + iz) * 3, h, mats[Math.abs(ix * 3 + iz) % 5]);
    if (rnd(ix * 7 + iz * 11) > 0.35) { const s = signs[Math.abs(ix + iz) % 5]; const st = neon(s[0], s[1], s[2], s[3], false);
      g.add(box(1.6, 7, 0.2, [flat('#111'), flat('#111'), flat('#111'), flat('#111'), glowMat(st, 1.25), glowMat(st, 1.25)], [x + (ix > 0 ? -6.2 : 6.2), h * 0.55, z + 5.2]));
      g.add(glow(s[2], 12, [x + (ix > 0 ? -6.2 : 6.2), h * 0.5, z + 5.4], 0.14));
      g.add(plane(7, 16, new THREE.MeshBasicMaterial({ map: glowTexFor(s[2]), blending: THREE.AdditiveBlending, transparent: true, opacity: 0.4, depthWrite: false }), [x + (ix > 0 ? -8 : 8), 0.03, z + 5], [-Math.PI / 2, 0, 0])); }
  }
  // cross streets: light strips so the grid reads from above
  for (let iz = 0; iz < 13; iz++) g.add(plane(230, 0.5, new THREE.MeshBasicMaterial({ color: '#8fa8ff', transparent: true, opacity: 0.35 }), [0, 0.04, 1.5 - iz * 17], [-Math.PI / 2, 0, 0]));
  scene.add(new THREE.HemisphereLight('#6a78ff', '#221c5a', 1.5)); const moon = new THREE.DirectionalLight('#9fb0ff', 0.8); moon.position.set(-6, 20, 8); scene.add(moon);
  // people on the pavement
  const ppl = [];
  const looks = [{ ...LOOKS.A }, { ...LOOKS.C, body: '#e0a030', sh: '#4a2a05' }, { ...LOOKS.B, body: '#d84a7a', sh: '#4a0a22' }, { ...LOOKS.A, body: '#8a5ad8', sh: '#22104a', hair: 'mop', hairCol: '#3a2418', hairSh: '#0e0604', trim: 'none' }];
  [[4.2, -3.2], [4.5, -4.3], [-4.3, -9.5], [4.3, -12], [-4.4, -17], [4.2, -19.5]].forEach(([x, z], i) => ppl.push(new Actor(looks[i % 4]).addTo(scene).at(x, 0.16, z).set({ mood: ['neutral', 'happy', 'smug'][i % 3], turn: x > 0 ? -0.5 : 0.5 })));
  return { scene, ppl };
}
const gcache = {};
function glowTexFor(col) { if (!gcache[col]) gcache[col] = tex(128, 256, (c, W, H) => { const gr = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H / 2); gr.addColorStop(0, col); gr.addColorStop(1, '#000'); c.fillStyle = gr; c.save(); c.translate(W / 2, H / 2); c.scale(0.5, 1); c.translate(-W / 2, -H / 2); c.fillRect(-W, 0, W * 3, H); c.restore(); }); return gcache[col]; }
