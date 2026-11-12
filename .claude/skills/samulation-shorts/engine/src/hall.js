// SET 3: inside the hall. One long symmetric aisle: machine walls both sides, red stools, patterned carpet, light strips.
import { THREE, tex, fill, frame, grain, lit, glowMat, flat, plane, box, inkBox, glow, point, Actor, rnd } from './core.js';
import { F, Ln, sm, ellD, rectD, INK } from './kit.js';
import { LOOKS } from './char.js';
const J = "'IPAGothic', sans-serif";
const LEN = 44, N = 4;   // aisle length; machine designs per texture tile

function machines(em) {   // 4 machines side by side; em = emissive pass (screens + lamps only)
  return (c, W, H) => { const mw = W / N; if (em) { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); } else fill(c, W, H, '#17171f');
    for (let i = 0; i < N; i++) { const x = i * mw, art = [['#ffcf4a', '#e8862a'], ['#5ad0ff', '#2a6fd0'], ['#ffe08a', '#d8a020'], ['#7ae0d0', '#2a8fa8']][i];
      if (!em) { F(rectD(x + 10, 14, mw - 20, H - 28, 26), '#c9ccd8', { line: 7, seed: i, shadow: 0.3, shadowCol: '#30324a' }); F(rectD(x + 30, 330, mw - 60, 120, 14), '#8e92a4', { line: 5, seed: i + 9, shadow: 0.3 });
        F(ellD(x + mw * 0.3, 392, 26, 26), '#2a2c3a', { line: 5, seed: i + 20, shadow: 0 }); for (let b = 0; b < 3; b++) F(ellD(x + mw * (0.55 + b * 0.13), 380, 9, 9), ['#e44', '#fc3', '#3b6'][b], { line: 3, seed: b, shadow: 0 });
        F(rectD(x + 36, 462, mw - 72, 28, 8), '#55586a', { line: 4, seed: i + 30, shadow: 0 }); for (let b = 0; b < 7; b++) { c.fillStyle = '#e8eaf2'; c.beginPath(); c.arc(x + 52 + b * (mw - 104) / 6, 476, 6, 0, 6.3); c.fill(); } }
      // screen
      const sx = x + 34, sy = 44, sw = mw - 68, sh = 260; const gr = c.createLinearGradient(0, sy, 0, sy + sh); gr.addColorStop(0, art[0]); gr.addColorStop(1, art[1]);
      c.fillStyle = gr; c.beginPath(); c.roundRect(sx, sy, sw, sh, 40); c.fill();
      if (i % 2 === 0) { c.fillStyle = em ? '#fff' : '#fff8e0'; c.font = '900 84px Mont'; c.textAlign = 'center'; c.fillText('777', sx + sw / 2, sy + 130); }
      else { c.fillStyle = 'rgba(20,30,70,0.85)'; c.beginPath(); c.moveTo(sx + 20, sy + sh - 30); c.lineTo(sx + sw * 0.4, sy + 70); c.lineTo(sx + sw * 0.6, sy + 150); c.lineTo(sx + sw * 0.75, sy + 100); c.lineTo(sx + sw - 20, sy + sh - 30); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.9)'; c.font = `700 30px ${J}`; c.textAlign = 'center'; c.fillText(['大当り', '海の夢', '黄金', '山の夜'][i], sx + sw / 2, sy + sh - 22);
      if (!em) { c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.roundRect(sx, sy, sw, sh, 40); c.stroke(); }
    } };
}
function counters(em) {   // the data-lamp strip above the machines: red LED numbers
  return (c, W, H) => { const mw = W / N; c.fillStyle = em ? '#000' : '#101016'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < N; i++) { const x = i * mw; if (!em) F(rectD(x + 40, 16, mw - 80, H - 32, 8), '#1c1c26', { line: 5, seed: i, shadow: 0 });
      c.fillStyle = '#ff4a2a'; c.font = '900 54px Mont'; c.textAlign = 'center'; c.fillText(String([795, 396, 333, 758][i]), x + mw / 2, 74); c.font = '800 26px Mont'; c.fillText(['19  8', '02  0', '13  6', '11  4'][i], x + mw / 2, 112); } };
}

export function buildHall() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#f3d9a4'); scene.fog = new THREE.Fog('#f6dca8', 10, 46);
  const g = new THREE.Group(); scene.add(g);
  // carpet: deep red with a gold diamond motif
  const carpetT = tex(256, 256, (c, W, H) => { fill(c, W, H, '#8f1f24'); grain(c, W, H, 0.08);
    for (const [cx, cy] of [[64, 64], [192, 64], [64, 192], [192, 192], [128, 128], [0, 0], [256, 0], [0, 256], [256, 256], [128, 0], [0, 128], [256, 128], [128, 256]]) { c.strokeStyle = '#d99a3a'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx, cy - 26); c.lineTo(cx + 26, cy); c.lineTo(cx, cy + 26); c.lineTo(cx - 26, cy); c.closePath(); c.stroke(); c.fillStyle = '#6a1218'; c.fill(); } }, { repeat: [5, 40] });
  g.add(plane(6, LEN + 8, lit(carpetT, { roughness: 0.85 }), [0, 0, -LEN / 2 + 4], [-Math.PI / 2, 0, 0]));
  // ceiling with two long light strips and vents
  const ceilT = tex(512, 512, (c, W, H) => { fill(c, W, H, '#f0dcae'); grain(c, W, H, 0.04); for (let i = 0; i < 4; i++) Ln(`M 0 ${i * 128} L ${W} ${i * 128}`, 3, i, 'rgba(90,60,20,0.35)'); F(rectD(60, 300, 110, 110, 4), '#d8c69a', { line: 5, seed: 3, shadow: 0.2 }); Ln('M 80 330 L 150 330 M 80 355 L 150 355 M 80 380 L 150 380', 3, 4, 'rgba(60,40,10,0.6)'); }, { repeat: [1, 10] });
  g.add(plane(6, LEN + 8, lit(ceilT), [0, 3.5, -LEN / 2 + 4], [Math.PI / 2, 0, 0]));
  const strip = new THREE.MeshBasicMaterial({ color: '#fffdf0' });
  g.add(plane(0.5, LEN, strip, [0, 3.48, -LEN / 2 + 2], [Math.PI / 2, 0, 0])); g.add(glow('#fff2c8', 9, [0, 3.2, -30], 0.45));
  for (let i = 0; i < 7; i++) g.add(point('#ffe6b0', 13, [0, 3.0, 2 - i * 6.5], 11, 1.3));
  // machine walls
  const mMap = tex(1024, 512, machines(false), { repeat: [LEN / 2.4, 1] }), mEm = tex(1024, 512, machines(true), { repeat: [LEN / 2.4, 1] });
  const cMap = tex(1024, 128, counters(false), { repeat: [LEN / 2.4, 1] }), cEm = tex(1024, 128, counters(true), { repeat: [LEN / 2.4, 1] });
  const mMat = new THREE.MeshStandardMaterial({ map: mMap, emissiveMap: mEm, emissive: 0xffffff, emissiveIntensity: 1.1, roughness: 0.6 });
  const cMat = new THREE.MeshStandardMaterial({ map: cMap, emissiveMap: cEm, emissive: 0xffffff, emissiveIntensity: 1.6, roughness: 0.8 });
  const baseT = tex(256, 128, (c, W, H) => { fill(c, W, H, '#1b1b24', '#0e0e14'); for (let i = 0; i < 4; i++) Ln(`M ${i * 64} 0 L ${i * 64} ${H}`, 4, i, '#000'); frame(c, W, H, 5); }, { repeat: [LEN / 2.4, 1] });
  const wallT = tex(256, 256, (c, W, H) => { fill(c, W, H, '#f0dcae', '#e6cd98'); grain(c, W, H, 0.04); frame(c, W, H, 3, 'rgba(90,60,20,0.5)'); }, { repeat: [LEN / 3, 1] });
  for (const sx of [-1, 1]) { const ry = -sx * Math.PI / 2, x = sx * 1.75, zc = -LEN / 2 + 3;
    g.add(plane(LEN, 0.8, lit(baseT), [x, 0.4, zc], [0, ry, 0])); g.add(plane(LEN, 1.2, mMat, [x, 1.4, zc], [0, ry, 0]));
    g.add(plane(LEN, 0.32, cMat, [x + sx * 0.0, 2.16, zc], [0, ry, 0])); g.add(plane(LEN, 1.2, lit(wallT), [x, 2.92, zc], [0, ry, 0]));
    g.add(box(0.35, 0.06, LEN, flat('#2a2a36'), [x - sx * 0.17, 0.82, zc]));                       // ledge under the machines
    for (let i = 0; i < 26; i++) { const z = 1.5 - i * 1.2;                                          // stools
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.12, 20), flat('#c81f2a', { roughness: 0.45 })); seat.position.set(sx * 1.05, 0.62, z); g.add(seat);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8), flat('#d8dae6', { roughness: 0.3, metalness: 0.6 })); pole.position.set(sx * 1.05, 0.3, z); g.add(pole);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 6, 20), flat('#d8dae6', { roughness: 0.3, metalness: 0.6 })); ring.rotation.x = Math.PI / 2; ring.position.set(sx * 1.05, 0.22, z); g.add(ring); }
  }
  const lamps = []; for (let i = 0; i < 10; i++) { const s = glow('#ff3a1a', 0.9, [(i % 2 ? 1 : -1) * 1.7, 2.2, -1.5 - i * 3.1], 0); g.add(s); lamps.push(s); }
  g.add(plane(6, 3.5, new THREE.MeshBasicMaterial({ color: '#fff0c8' }), [0, 1.75, -LEN + 2.5]));   // bright far end
  scene.add(new THREE.HemisphereLight('#fff0d0', '#b06a50', 1.5)); const fillL = new THREE.DirectionalLight('#fff2d8', 0.7); fillL.position.set(0, 4, 6); scene.add(fillL);
  // ── people: seated players and one carrying a tower of full ball boxes ──
  const palette = [{ ...LOOKS.B, body: '#d85a6a', sh: '#4a0f1a' }, { ...LOOKS.C, body: '#3f6fb8', sh: '#0f1f4a' }, { ...LOOKS.A, body: '#3aa878', sh: '#0a3a22' },
    { ...LOOKS.A, body: '#e8a23a', sh: '#5a3505', hair: 'afro', hairCol: '#3a2418', hairSh: '#0e0604', trim: 'none' }, { ...LOOKS.A, body: '#8a5ad8', sh: '#22104a', hair: 'mop', hairCol: '#c9c2b8', hairSh: '#5a544c', trim: 'none' },
    { ...LOOKS.A, body: '#4a4f6a', sh: '#12142a', hair: 'topknot', hairCol: '#1e1d26', hairSh: '#000', trim: 'none' }];
  const seated = [];
  [[-1, 0.3], [1, -0.9], [-1, -2.1], [1, -4.5], [-1, -5.7], [1, -6.9], [-1, -9.3], [1, -10.5], [-1, -12.9], [1, -15.3]].forEach(([sx, z], i) => { const a = new Actor(palette[i % 6]).addTo(scene); a.shadow.visible = false; a.at(sx * 0.9, 0.16, z + 0.3); a.sx = sx; a.i = i; seated.push(a); });
  const carrier = new Actor({ ...LOOKS.A, body: '#f0b84a', sh: '#5a3a05', hair: 'mop', hairCol: '#d8d2c8', hairSh: '#6a645c', trim: 'none' }).addTo(scene);
  const stack = new THREE.Group(); scene.add(stack);
  const ballsT = tex(128, 128, (c, W, H) => { fill(c, W, H, '#111'); for (let i = 0; i < 40; i++) { const x = rnd(i) * W, y = rnd(i * 3) * H; const gr = c.createRadialGradient(x - 3, y - 3, 1, x, y, 11); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#8a8fa0'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, 10, 0, 6.3); c.fill(); } });
  for (let i = 0; i < 5; i++) stack.add(inkBox(0.44, 0.3, 0.34, i % 2 ? '#d8262e' : '#17171d', [0, 0.15 + i * 0.3, 0], { px: 128 }));
  stack.add(plane(0.4, 0.3, lit(ballsT, { roughness: 0.3, metalness: 0.5 }), [0, 1.51, 0], [-Math.PI / 2, 0, 0]));
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), flat('#dfe3ee', { roughness: 0.2, metalness: 0.8 })); b.position.set((rnd(i) - 0.5) * 0.3, 1.54 + rnd(i * 5) * 0.05, (rnd(i * 7) - 0.5) * 0.22); stack.add(b); }
  return { scene, seated, carrier, stack, lamps, mMat, cMat };
}
