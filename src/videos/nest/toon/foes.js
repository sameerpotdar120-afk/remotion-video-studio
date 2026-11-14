// Enemy army cards v2 (crowd-readable, after the reference): gold tunics over dark lamellar, steel cone helmets with red plumes,
// yellow banners with a black beast sigil, round shields. Poses: march / shock / fly (blown off his feet). Feet at bottom centre.
import { setCtx, S, F, tube, sm, ellD, Ln } from './kit.js';
import { char, LOOKS } from './char.js';
const spear = (x, y) => { F(tube([[x - 4, y + 260], [x + 6, y - 330]], [9, 9]), '#6b4a2e', { line: 3.5, seed: 530, shadow: 0.3, soft: 0.2, hi: 0.2 }); F(sm([[x + 6, y - 330], [x - 7, y - 362], [x + 8, y - 430], [x + 22, y - 360]]), '#c9ccd2', { line: 3.5, seed: 531, shadow: 0.3, soft: 0.2, hi: 0.6 }); F(sm([[x - 2, y - 326], [x + 14, y - 326], [x + 18, y - 300], [x - 6, y - 300]]), '#c4202a', { line: 2.5, seed: 532, shadow: 0.2, soft: 0.1, hi: 0.2 }); };
const banner = (x, y, col, sig) => { F(tube([[x, y + 250], [x + 4, y - 560]], [9, 9]), '#4a3422', { line: 3, seed: 540, shadow: 0.3, soft: 0.2, hi: 0.2 });
  F(sm([[x + 4, y - 556], [x + 205, y - 548], [x + 196, y - 470], [x + 215, y - 392], [x + 4, y - 380]]), col, { line: 4.5, seed: 541, shadow: 0.3, soft: 0.2, hi: 0.25 });
  F(sm([[x + 60, y - 500], [x + 95, y - 520], [x + 150, y - 500], [x + 160, y - 455], [x + 130, y - 430], [x + 120, y - 460], [x + 85, y - 440], [x + 70, y - 470]]), sig, { line: 2.5, seed: 542, shadow: 0, soft: 0, hi: 0.1 });
  F(ellD(x + 4, y - 566, 12, 12), '#d9b04a', { line: 2.5, seed: 543, shadow: 0.2, soft: 0, hi: 0.4 }); };
const shield = (x, y, col) => { F(ellD(x, y, 78, 78), '#7a5532', { line: 5, seed: 550, shadow: 0.35, soft: 0.2, hi: 0.2 }); F(ellD(x, y, 62, 62), col, { line: 3, seed: 551, shadow: 0.25, soft: 0.2, hi: 0.25 }); F(ellD(x, y, 18, 18), '#c9ccd2', { line: 3, seed: 552, shadow: 0.2, soft: 0, hi: 0.6 });
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; F(ellD(x + Math.cos(a) * 70, y + Math.sin(a) * 70, 5, 5), '#d9b04a', { line: 1.5, seed: 553 + i, shadow: 0, soft: 0, hi: 0.4 }); } };
function make(look, st, extra, front) {
  const AK = 1.4, PX = 300, c = document.createElement('canvas'); c.width = (640 + 2 * PX) * AK; c.height = 1250 * AK; const g = c.getContext('2d'); setCtx(g); S.boil = 0;
  g.setTransform(AK, 0, 0, AK, 0, 0); g.translate(PX, 220); if (extra) extra(); char(320, 1000, 1.02, { look, noShadow: true, ...st }); if (front) front();
  const d = g.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, x1 = 0, y0 = c.height, y1 = 0; for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) if (d[(y * c.width + x) * 4 + 3] > 10) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const feetY = (1000 + 220 + 8) * AK, cx = (320 + PX) * AK, half = Math.max(cx - x0, x1 - cx) + 4, bot = Math.max(feetY, y1 + 4), o = document.createElement('canvas'); o.width = half * 2; o.height = bot - y0 + 4; o.getContext('2d').drawImage(c, cx - half, y0, half * 2, o.height, 0, 0, half * 2, o.height);
  return { canvas: o, wm: o.width / AK / 690 * 1.72, hm: o.height / AK / 690 * 1.72, feet: (feetY - y0) / o.height };
}
export const makeFoes = () => { const out = {}, bodies = ['#d9a82a', '#cf9a22', '#e0b43a', '#b88a2a', '#d4a030', '#c99428'], furs = ['#3b2a1e', '#5a4632', '#2a2420'], shields = ['#b8262c', '#1d1d22', '#d9a82a'];
  for (let v = 0; v < 6; v++) {
    const look = { ...LOOKS.FOE, body: bodies[v], sh: '#5a3a08', quiltCol: 'rgba(60,30,0,0.35)', trimCol: '#2a2420', belt: '#2a1d14', furCol: furs[v % 3], plume: '#e02a2a' }, sw = (v % 3) * 0.3 - 0.3;
    const mk = (pose, st, kind) => { const hand = 320 + 69 + 41;
      if (kind === 'banner') return make(look, st, null, () => banner(hand, 697, '#f2c230', '#1d1d22'));
      if (kind === 'shield') return make(look, st, null, () => { spear(hand, 697); shield(320 - 40, 760, shields[v % 3]); });
      return make(look, st, null, () => spear(hand, 697)); };
    for (const kind of ['spear', 'shield', 'banner']) {
      out[`f2_march_${kind}_${v}`] = mk('march', { mood: v % 2 ? 'neutral' : 'smug', armR: [40, 60], legSwing: sw, lookAt: [0, 0.1] }, kind);
      out[`f2_shock_${kind}_${v}`] = mk('shock', { mood: 'shock', armL: [-60, -150], armR: [40, 60], legSwing: sw, lookAt: [0, -0.2] }, kind); }
    out[`f2_fly_${v}`] = make(look, { mood: 'shock', armL: [-150, -90], armR: [150, -90], legSwing: 0.9, lookAt: [0, -0.3] }, null, null);
    out[`f2_down_${v}`] = make(look, { mood: 'shock', armL: [-120, 40], armR: [120, 40], legSwing: 0.2, lookAt: [0, 0] }, null, null); }
  return out; };
