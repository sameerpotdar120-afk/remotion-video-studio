// Shots built to the preview's quality bar, timed to the user's VO.
import { W, H, ctx, clamp, lerp, seg, eo, eio, eob, hash, vn, S, INK, P, ellD, rectD, F, Ln, grad, strokes, puff, blur, at, cam, sm, poly, tube, xform, hand } from './kit.js';
import { setSkin, SKIN_SH, smallHand, clipTo, shot3, eye, brow } from './intro.js';
const clampv = 0;
import { fig, rifle, rifleIn, star } from './fig.js';
import { WORLD, ROME, ROME_GB } from './lib2.js';
import { drawEurope, drawGlobe, regionFill, REICH_SET, projEU } from './geo.js';

const blink = (t, k = 0) => ((t + k) % 3.1) < 0.1;
const soft = (x, y, rx, ry, a = 0.3, col = '20,14,8') => blur(10, () => { ctx.fillStyle = `rgba(${col},${a})`; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.3); ctx.fill(); });
function stub(name) { return (t) => { grad([[0, '#556'], [1, '#223']], 0, 0, 0, H); ctx.fillStyle = '#fff'; ctx.font = '700 60px Fredoka'; ctx.textAlign = 'center'; ctx.fillText(name + ' (in progress)', 540, 900); }; }

// ── shared painted backgrounds ───────────────────────────────────────────
function cloudBank(x, y, s, base, sh, seed, a = 1) { ctx.save(); ctx.globalAlpha *= a; const b = [];
  for (let i = 0; i < 11; i++) b.push([x + (i - 5) * 56 * s + 20 * vn(seed + i) * s, y - Math.sin((i / 10) * Math.PI) * 120 * s - 24 * hash(seed + i) * s, (56 + 40 * hash(seed + i * 3)) * s]);

  ctx.fillStyle = sh; for (const [cx, cy, r] of b) { ctx.beginPath(); ctx.arc(cx, cy + r * 0.25, r, 0, 6.3); ctx.fill(); }
  ctx.fillStyle = base; for (const [cx, cy, r] of b) { ctx.beginPath(); ctx.arc(cx - r * 0.1, cy - r * 0.08, r * 0.92, 0, 6.3); ctx.fill(); }
  ctx.restore(); }
function beach(t, mood) { // mood: 'summer' | 'storm'
  const st = mood === 'storm';
  grad(st ? [[0, '#56627a'], [0.5, '#8a96aa'], [1, '#c3c8cc']] : [[0, '#7cc4f2'], [0.55, '#a9daf6'], [1, '#d4eefa']], 0, 0, 0, 1300, 0, 0, W, H);
  if (st) { for (const [y, w] of [[60, 700], [130, 520], [210, 380]]) blur(3, () => { ctx.fillStyle = 'rgba(160,172,196,0.55)'; ctx.beginPath(); ctx.ellipse(W - w / 2 + 40, y, w / 2, 9, 0, 0, 6.3); ctx.fill(); });
    for (const [x, y, s2, sd] of [[700, 520, 1.5, 11], [880, 380, 1.3, 12], [420, 760, 1.4, 13], [960, 820, 1.2, 14]]) { cloudBank(x, y + 26 * s2, s2, '#4e5870', '#4e5870', sd); cloudBank(x - 10, y, s2 * 0.96, '#8590a8', '#6a7590', sd); cloudBank(x - 30, y - 24 * s2, s2 * 0.7, 'rgba(190,198,214,0.5)', 'rgba(0,0,0,0)', sd + 5); } }
  // sea strip + far shore line
  if (st) F(sm([[-40, 1010], [400, 1000], [1120, 1016], [1120, 1240], [-40, 1100]]), st ? '#4a5a6c' : '#5f9fc4', { line: 6, seed: 300, shadow: 0, soft: 0, hi: 0.1 });
  if (st) for (let i = 0; i < 6; i++) Ln(`M ${(i * 190 + t * 20) % 1200 - 60} ${1035 + (i % 2) * 22} l 60 -3`, 3, 301 + i, 'rgba(255,255,255,0.55)');
  // sand with a darker dune swoosh like the reference
  const sand = sm([[-60, 1078], [300, 1110], [700, 1180], [1140, 1300], [1140, 1980], [-60, 1980]]);
  F(sand, st ? '#b8b2a6' : '#e9d6ae', { line: 7, seed: 310, shadow: 0, soft: 0, hi: 0.06 });
  ctx.save(); clipTo(sand); blur(24, () => { ctx.fillStyle = st ? 'rgba(110,90,56,0.25)' : 'rgba(190,150,100,0.22)'; ctx.fillRect(-60, 1000, 1200, 60); });
  for (let i = 0; i < 26; i++) { const x = hash(i * 5 + 1) * W, y = 1060 + hash(i * 7 + 2) * 860; Ln(`M ${x} ${y} l ${10 + 8 * hash(i)} -2`, 2.4, 320 + i, 'rgba(140,110,70,0.45)'); }
  ctx.restore();
}

// ── 27.9 "Crush the Soviets before the snow" — kneeling soldier aims at a Soviet under a beach umbrella ──
function umbrella(x, y, rot, s = 1) { at(x, y, rot, s, () => { F(tube([[0, 0], [0, -460]], 12, false), '#d8d3c8', { line: 5, seed: 330, shadow: 0.3 });
  const can = sm([[-260, -380], [-170, -450], [0, -486], [170, -450], [260, -380], [130, -398], [0, -394], [-130, -398]]); F(can, '#f4f1ea', { line: 7, seed: 331, shadow: 0.25, hi: 0.2, soft: 0.2 });
  const und = sm([[-260, -380], [-130, -398], [0, -394], [130, -398], [260, -380], [140, -360], [0, -352], [-140, -360]]); F(und, '#b9a7d6', { line: 6, seed: 336, shadow: 0.3, shadowCol: '#3a2a5a', soft: 0.3 });
  ctx.save(); clipTo(can); for (let i = -3; i < 3; i += 2) { ctx.fillStyle = '#cf5a6e'; ctx.beginPath(); ctx.moveTo(0, -486); ctx.lineTo(i * 88, -380); ctx.lineTo((i + 1) * 88, -380); ctx.closePath(); ctx.fill(); } ctx.restore(); Ln(can, 7, 332);
  for (let i = -3; i <= 3; i++) Ln(`M 0 -486 L ${i * 88} -392`, 2.5, 333 + i, 'rgba(43,34,32,0.5)'); }); }
function summer(t) { setSkin('#f7f4ef');
  ctx.save(); cam(lerp(1.03, 1.0, eo(seg(t, 27.9, 29.0))), W * 0.45, H * 0.6);
  beach(t, 'summer');
  at(360, 1020, -4, 0.9, () => { F(tube([[0, 0], [0, -190]], 8, false), '#6b4a30', { line: 4, seed: 340, shadow: 0.2 }); F(sm([[4, -186], [96, -178], [84, -150], [100, -120], [4, -128]]), '#c4302c', { line: 5, seed: 341, shadow: 0.3, hi: 0.2 }); });
  soft(780, 1300, 220, 40, 0.28); umbrella(596, 1352, 17, 1.5);
  const startle = eob(seg(t, 28.5, 28.8));
  fig({ x: 790, y: 1150, s: 1.14, d: -1, kit: 'soviet', mood: 'scared', handF: 'point', t, blink: blink(t, 1), armF: [lerp(70, 92, startle), lerp(10, 0, startle)], armB: [-14, 96], legF: [16, -6], legB: [-14, 8], tilt: -4 });
  soft(180, 1340, 170, 30, 0.3);
  fig({ x: 160, y: 1244, s: 1.05, d: 1, kit: 'grey', mood: 'focus', t, blink: false, legF: [86, -86], legB: [6, -96], tilt: 14, lean: 14, ...(() => { const B = [10, -168], A = -0.3, at2 = (k) => [B[0] + Math.cos(A) * k, B[1] + Math.sin(A) * k + 8];
      return { armBTo: at2(70), armFTo: at2(176), hold: () => rifle(B[0], B[1], A, 290) }; })() });
  if (t > 28.9 && t < 29.25) { const k = seg(t, 28.9, 29.25); ctx.save(); ctx.globalAlpha = 1 - k; F(ellD(556, 1106, 26 + 26 * k, 16 + 12 * k), '#ffd36a', { line: 4, seed: 350, shadow: 0, hi: 0.6 }); ctx.restore(); }
  ctx.restore(); }

const aim = (d, A = -0.28, len = 290) => { const B = [d * 10, -168], at2 = (k) => [B[0] + d * Math.cos(A) * k, B[1] + Math.sin(A) * k + 8]; return { armBTo: at2(70), armFTo: at2(176), hold: () => rifle(B[0], B[1], A, len, d) }; };
// ── 30.6 "Hit Britain before it regroups" — storm beach, explosion, kneeling rifleman, DUNKIRK sign ──
function boom(x, y, r, k, seed) { if (k <= 0 || k >= 1) return; const a = 1 - seg(k, 0.55, 1), g = eo(seg(k, 0, 0.35));
  ctx.save(); ctx.globalAlpha = a;
  blur(18, () => { ctx.fillStyle = 'rgba(255,200,120,0.6)'; ctx.beginPath(); ctx.arc(x, y, r * 1.3 * g, 0, 6.3); ctx.fill(); });
  for (let i = 0; i < 11; i++) { const ang = i / 11 * 6.28 + seed, dd = r * 0.5 * g, rr = r * (0.34 + 0.18 * hash(seed + i)) * g;
    F(ellD(x + Math.cos(ang) * dd, y + Math.sin(ang) * dd * 0.85, rr, rr), i % 3 ? '#fbe2a8' : '#f6b45a', { line: 0, seed: seed + i, shadowCol: '#b8571c', shadow: 0.45, hi: 0.5, soft: 0.3 }); }
  F(ellD(x, y, r * 0.66 * g, r * 0.72 * g), '#fff8e2', { line: 0, seed: seed + 20, shadow: 0, hi: 0.6 }); blur(14, () => { ctx.fillStyle = 'rgba(255,255,240,0.8)'; ctx.beginPath(); ctx.arc(x, y, r * 0.5 * g, 0, 6.3); ctx.fill(); });
  for (let i = 0; i < 18; i++) { const ang = -0.2 - hash(seed + i * 3) * 2.6, dd = r * (0.9 + 0.8 * hash(i)) * eo(k); F(rectD(x + Math.cos(ang) * dd - 7, y + Math.sin(ang) * dd - 7 - 80 * k, 14, 14, 2), '#5a3218', { line: 0, seed: seed + 40 + i, shadow: 0 }); }
  ctx.restore(); }
function blitz(t) { setSkin('#ecebef');
  const shk = t > 30.75 && t < 31.3 ? (1 - seg(t, 30.75, 31.3)) : 0;
  ctx.save(); ctx.translate(Math.sin(t * 80) * 10 * shk, Math.cos(t * 70) * 7 * shk); cam(1.02, W / 2, H * 0.5);
  beach(t, 'storm');
  at(330, 1470, -6, 1.25, () => { F(tube([[0, 0], [0, 170]], 18, false), '#7a5a3a', { line: 5, seed: 360, shadow: 0.3 }); F(sm([[-130, -66], [130, -74], [136, 14], [-126, 20]]), '#a07c56', { line: 6, seed: 361, shadow: 0.3, hi: 0.2, soft: 0.2 }); hand('DUNKIRK', 2, -24, 54, 3, '#3a2a1a'); });
  boom(80, 1000, 330, seg(t, 30.68, 32.4), 370);
  soft(930, 1394, 170, 30, 0.3);
  fig({ x: 930, y: 1290, s: 1.0, d: -1, kit: 'grey', mood: 'focus', t, blink: false, legF: [86, -86], legB: [6, -96], tilt: 14, lean: 14, ...aim(-1, -0.2) });
  ctx.restore(); }


function softHead(cx, cy, rx, ry, side, seed) { const d = ellD(cx, cy, rx, ry); F(d, '#f7f4ef', { line: 8, seed, shadow: 0, hi: 0.2, soft: 0, tex: 0.12 });
  ctx.save(); clipTo(d); blur(rx * 0.14, () => { ctx.fillStyle = 'rgba(110,105,130,0.24)'; ctx.beginPath(); ctx.ellipse(cx + side * rx * 1.05, cy + ry * 0.35, rx * 0.45, ry * 1.0, 0, 0, 6.3); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx, cy + ry * 1.08, rx * 1.1, ry * 0.32, 0, 0, 6.3); ctx.fill(); }); ctx.restore(); }
// ── 32.7 "Leave America alone" — office handshake (hand-authored from the reference's framing) ──
function officeCorner(t) {
  grad([[0, '#e2d6b6'], [1, '#cdbf9a']], 0, 0, 0, H, 0, 0, 480, H); grad([[0, '#e9dfc2'], [1, '#d6c8a2']], 0, 0, 0, H, 480, 0, 600, H);
  F(poly([[-20, -20], [1100, -20], [1100, 150], [480, 200], [-20, 140]]), '#ece4cc', { line: 6, seed: 400, shadow: 0, soft: 0, hi: 0.1 });
  for (const x of [160, 330, 640, 860]) Ln(`M ${x} -10 L ${x + (x - 480) * 0.08} ${x < 480 ? 150 : 175}`, 3, 401 + x, 'rgba(90,80,60,0.45)'); Ln('M -20 70 L 480 110 L 1100 70', 3, 405, 'rgba(90,80,60,0.45)');
  F(poly([[230, -10], [700, -10], [690, 40], [240, 40]]), '#d8d2c2', { line: 5, seed: 406, shadow: 0.2 }); for (let i = 0; i < 9; i++) Ln(`M ${260 + i * 48} -6 L ${262 + i * 48} 36`, 3, 407 + i, 'rgba(60,56,50,0.6)');
  Ln('M 480 195 L 480 1430', 5, 410, 'rgba(70,58,40,0.7)'); blur(30, () => { ctx.fillStyle = 'rgba(80,60,30,0.18)'; ctx.fillRect(460, 180, 60, 1260); });
  // bookshelf with binders (left)
  F(rectD(-30, 210, 270, 1200), '#9a7448', { line: 7, seed: 411, shadowCol: '#3a2206', shadow: 0.3, hi: 0.15 });
  for (let r = 0; r < 4; r++) { const y = 230 + r * 290; F(rectD(-20, y + 250, 250, 22), '#7e5a32', { line: 5, seed: 412 + r, shadow: 0.25 });
    let x = -10; for (let i = 0; x < 200; i++) { const w = 34 + 10 * hash(r * 9 + i), h = 170 + 60 * hash(r * 3 + i), c = (r + i) % 3 === 0 ? '#ece6da' : '#2c3e58';
      F(rectD(x, y + 250 - h, w, h, 3), c, { line: 4, seed: 420 + r * 20 + i, shadow: 0.3, soft: 0.2, hi: 0.15 }); if (c === '#ece6da') F(ellD(x + w / 2, y + 250 - h + 40, 7, 7), '#9a948a', { line: 2.5, seed: 460 + i, shadow: 0 }); x += w + 4; } }
  // world map on the right wall
  F(rectD(608, 172, 420, 488, 4), '#8a6a3e', { line: 7, seed: 470, shadow: 0.3, hi: 0.3 }); F(rectD(628, 192, 380, 448), '#cfe0ea', { line: 4, seed: 471, shadow: 0, tex: 0.1 });
  ctx.save(); clipTo(rectD(628, 192, 380, 448)); const cols = ['#e8a0a0', '#e8d27a', '#9ad08a', '#e8b07a', '#c8a0d8', '#8ac0e0', '#f0c890'];
  WORLD.forEach((p, i) => { const pts = p.map(([lo, la]) => [818 + lo * 1.02, 416 - la * 2.0]); F(poly(pts), cols[i % cols.length], { line: 2.6, seed: 472 + i, shadow: 0, soft: 0, tex: 0.1 }); }); ctx.restore();
  // floor lamp
  F(tube([[518, 420], [518, 1060]], 12, false), '#3a3a3e', { line: 4, seed: 480, shadow: 0.2, hi: 0.4 }); F(sm([[452, 410], [584, 410], [560, 440], [476, 440]]), '#2e2e32', { line: 5, seed: 481, shadow: 0.3, hi: 0.4 });
  // desk (right) and floor
  F(poly([[820, 980], [1100, 920], [1100, 1660], [860, 1700]]), '#a77a48', { line: 7, seed: 482, shadowCol: '#3a2206', shadow: 0.35, shadowD: poly([[820, 1040], [1100, 980], [1100, 1660], [860, 1700]]), hi: 0.2 });
  F(poly([[-20, 1420], [1100, 1380], [1100, 1960], [-20, 1960]]), '#8a826e', { line: 0, shadow: 0, soft: 0, hi: 0.08 }); grad([[0, 'rgba(60,50,30,0)'], [1, 'rgba(40,30,20,0.35)']], 0, 1400, 0, 1920, 0, 1400, W, 520);
  // open file box
  F(poly([[360, 1300], [700, 1290], [710, 1720], [370, 1730]]), '#2c3e5a', { line: 7, seed: 483, shadowCol: '#0a1222', shadow: 0.4, shadowD: rectD(360, 1300, 160, 440), hi: 0.15 });
  for (let i = 0; i < 9; i++) F(poly([[384 + i * 34, 1300], [410 + i * 34, 1300], [416 + i * 34, 1270 - 12 * hash(i)], [388 + i * 34, 1272 - 12 * hash(i)]]), i % 2 ? '#e8e2d0' : '#9aa4b0', { line: 3, seed: 484 + i, shadow: 0.2 });
}
function peace(t) { setSkin('#f7f4ef'); const shake = Math.sin((t - 32.7) * 9) * 6 * (t < 34.2 ? 1 : 0.3), bl = blink(t), bl2 = blink(t, 1.4);
  ctx.save(); cam(lerp(1.0, 1.035, seg(t, 32.7, 34.7)), W / 2, H * 0.5);
  officeCorner(t);
  // ── the leader (left) ──
  F(tube([[150, 1500], [140, 1720]], 92, false), '#2a2826', { line: 6, seed: 500, shadow: 0.3 }); F(tube([[300, 1500], [300, 1720]], 92, false), '#2a2826', { line: 6, seed: 501, shadow: 0.3 });
  for (const x of [140, 300]) F(sm([[x - 56, 1710], [x + 50, 1704], [x + 66, 1730], [x + 60, 1752], [x - 60, 1752]]), '#1a1818', { line: 6, seed: 502 + x, shadow: 0.2, hi: 0.4 });
  const coat = sm([[150, 760], [300, 744], [420, 800], [452, 900], [450, 1200], [458, 1548], [250, 1560], [44, 1548], [56, 1200], [60, 920], [90, 810]]);
  F(coat, '#5e666c', { line: 8, seed: 503, shadowCol: '#141a20', shadow: 0.42, shadowD: sm([[60, 920], [90, 810], [150, 760], [170, 900], [150, 1200], [150, 1556], [44, 1548], [56, 1200]]), soft: 0.3, hi: 0.15 });
  F(poly([[230, 750], [330, 748], [286, 900]]), '#f2efe8', { line: 5, seed: 504, shadow: 0.1 }); F(sm([[278, 760], [302, 760], [312, 860], [292, 886], [276, 860]]), '#15181c', { line: 4, seed: 505, shadow: 0.2, hi: 0.3 });
  F(poly([[150, 760], [236, 748], [286, 900], [250, 1000], [200, 900]]), '#566066', { line: 6, seed: 506, shadow: 0.3, shadowCol: '#141a20' }); F(poly([[330, 748], [420, 800], [380, 900], [310, 980], [292, 900]]), '#525b62', { line: 6, seed: 507, shadow: 0.35, shadowCol: '#141a20' });
  for (const [x, y] of [[300, 1150], [352, 1150], [300, 1200], [352, 1200]]) F(ellD(x, y, 8, 8), '#2a2e32', { line: 3, seed: x + y, shadow: 0 });
  F(sm([[110, 1238], [222, 1220], [226, 1250], [116, 1268]]), '#3c4448', { line: 5, seed: 508, shadow: 0.2 }); F(sm([[268, 1222], [380, 1210], [384, 1236], [272, 1248]]), '#4a5258', { line: 5, seed: 509, shadow: 0.2 });
  Ln('M 300 1260 L 300 1540', 3.5, 510, 'rgba(20,24,30,0.5)'); Ln(sm([[120, 1300], [110, 1420], [130, 1530]], false), 3.5, 511, 'rgba(20,24,30,0.5)');
  // his back arm reaching across to the other man's shoulder
  F(tube([[350, 850], [470, 860], [610, 896]], [96, 88, 80]), '#566066', { line: 7, seed: 512, shadowCol: '#141a20', shadow: 0.4, soft: 0.3 });
  F(sm([[600, 870], [646, 864], [664, 888], [650, 920], [606, 930]]), SKIN_SH ? '#f7f4ef' : '#f7f4ef', { line: 6, seed: 513, shadow: 0.25, shadowCol: SKIN_SH });
  // his front arm down to the handshake
  F(tube([[400, 900], [420, 1030], [470, 1110 + shake]], [100, 92, 84]), '#6c757c', { line: 7, seed: 514, shadowCol: '#141a20', shadow: 0.4, soft: 0.3, shadowD: sm([[340, 900], [400, 1040], [440, 1160], [380, 1100]]) });
  // head
  const hx = 258, hy = 578;
  softHead(hx, hy, 172, 176, -1, 515);
  F(sm([[hx - 170, hy + 40], [hx - 176, hy - 60], [hx - 120, hy - 150], [hx - 20, hy - 182], [hx + 90, hy - 160], [hx + 160, hy - 90], [hx + 174, hy + 10], [hx + 130, hy - 50], [hx + 40, hy - 84], [hx - 40, hy - 80], [hx - 110, hy - 30], [hx - 150, hy + 40]]), '#5e3822', { line: 7, seed: 516, shadowCol: '#1e0c04', shadow: 0.42, shadowD: sm([[hx + 20, hy - 180], [hx + 90, hy - 160], [hx + 160, hy - 90], [hx + 174, hy - 10], [hx + 120, hy - 70], [hx + 60, hy - 120]]), hi: 0.35, soft: 0.3 });
  Ln(sm([[hx - 20, hy - 180], [hx - 40, hy - 140], [hx - 50, hy - 96]], false), 4, 517, 'rgba(30,12,4,0.85)');
  eye(hx - 82, hy + 38, 1.25, bl ? 1 : 0.5, 2); eye(hx + 110, hy + 26, 1.25, bl ? 1 : 0.5, -2);
  brow(hx - 112, hy + 2, hx - 54, hy + 4, 7, 518, -1); brow(hx + 80, hy - 8, hx + 138, hy - 10, 7, 519, -1);
  at(hx + 22, hy + 70, -4, 1, () => F(poly([[-24, -18], [24, -20], [32, 16], [-32, 18]]), '#553422', { line: 5, seed: 520, shadowCol: '#140602', shadow: 0.35, shadowD: rectD(-40, 4, 80, 24), hi: 0.3 }));
  Ln(sm([[hx - 30, hy + 104], [hx, hy + 100], [hx + 30, hy + 96]], false), 5.5, 521);
  // ── Uncle Sam (right) ──
  for (const [x, sd] of [[700, 530], [890, 531]]) { F(tube([[x, 1300], [x + 6, 1720]], 104, false), '#f2efe8', { line: 6, seed: sd, shadow: 0.3, soft: 0.2 }); ctx.save(); clipTo(tube([[x, 1300], [x + 6, 1720]], 104, false)); for (let i = -2; i <= 2; i++) { ctx.fillStyle = '#2d4387'; ctx.fillRect(x + i * 22 - 7, 1290, 14, 440); } ctx.restore(); Ln(tube([[x, 1300], [x + 6, 1720]], 104, false), 6, sd + 2);
    F(sm([[x - 58, 1712], [x + 56, 1706], [x + 70, 1734], [x + 64, 1756], [x - 62, 1756]]), '#4a2a1a', { line: 6, seed: sd + 4, shadow: 0.2, hi: 0.4 }); }
  F(sm([[600, 940], [720, 900], [900, 920], [1010, 1000], [1040, 1300], [1000, 1560], [940, 1460], [930, 1300], [650, 1320], [620, 1100]]), '#2d4387', { line: 8, seed: 532, shadowCol: '#0a1230', shadow: 0.4, shadowD: sm([[900, 920], [1010, 1000], [1040, 1300], [1000, 1560], [940, 1460], [930, 1100]]), soft: 0.3, hi: 0.15 });
  F(sm([[700, 940], [860, 940], [900, 1100], [880, 1310], [790, 1330], [700, 1300], [690, 1100]]), '#f4f1ea', { line: 7, seed: 533, shadow: 0.25, shadowCol: '#7f7b90', soft: 0.25 });
  for (let i = 0; i < 6; i++) F(ellD(782, 1000 + i * 52, 8, 10), '#f4f1ea', { line: 3, seed: 534 + i, shadow: 0.2 }); Ln('M 780 960 L 778 1320', 3, 540, 'rgba(60,56,70,0.5)');
  F(sm([[700, 940], [760, 960], [740, 1100], [690, 1180], [660, 1000]]), '#24387a', { line: 6, seed: 541, shadow: 0.35, shadowCol: '#0a1230' }); F(sm([[860, 940], [910, 930], [930, 1060], [880, 1160], [850, 1000]]), '#24387a', { line: 6, seed: 542, shadow: 0.35, shadowCol: '#0a1230' });
  F(rectD(760, 1290, 130, 40, 8), '#5a9ad8', { line: 5, seed: 543, shadow: 0.2, hi: 0.3 });
  F(tube([[950, 1000], [1010, 1170], [1030, 1300]], [90, 84, 78]), '#2d4387', { line: 7, seed: 544, shadowCol: '#0a1230', shadow: 0.4 }); smallHand(1028, 1330, -1.4, 1.0, 545, 4, 0.9);
  // his arm reaching to the handshake, white cuff
  F(tube([[690, 980], [610, 1060], [532, 1112 + shake]], [96, 88, 80]), '#2d4387', { line: 7, seed: 546, shadowCol: '#0a1230', shadow: 0.4, soft: 0.3 });
  F(tube([[560, 1100 + shake], [534, 1114 + shake]], 72, false), '#f4f1ea', { line: 5, seed: 547, shadow: 0.2 });
  // the clasp
  F(sm([[436, 1090 + shake], [478, 1068 + shake], [530, 1078 + shake], [550, 1110 + shake], [530, 1150 + shake], [480, 1162 + shake], [440, 1140 + shake]]), '#f7f4ef', { line: 6, seed: 548, shadow: 0.25, shadowCol: SKIN_SH });
  for (let i = 0; i < 3; i++) Ln(sm([[452 + i * 4, 1108 + i * 16 + shake], [490 + i * 4, 1104 + i * 16 + shake], [520, 1112 + i * 14 + shake]], false), 2.6, 549 + i, 'rgba(40,32,40,0.7)');
  Ln(sm([[470, 1074 + shake], [500, 1070 + shake], [520, 1084 + shake]], false), 2.6, 552, 'rgba(40,32,40,0.6)');
  // head, hair, goatee, bow tie, hat
  const sx = 765, sy = 740;
  for (const sg of [-1, 1]) F(sm([[sx + sg * 120, sy - 110], [sx + sg * 190, sy - 90], [sx + sg * 226, sy - 30], [sx + sg * 214, sy + 40], [sx + sg * 180, sy + 70], [sx + sg * 186, sy + 20], [sx + sg * 160, sy - 10], [sx + sg * 140, sy - 50]]), '#e2ddd4', { line: 6, seed: 553 + sg, shadow: 0.35, shadowCol: '#7f7b90', soft: 0.25 });
  softHead(sx, sy, 176, 180, 1, 556);
  eye(sx - 66, sy - 8, 1.2, bl2 ? 1 : 0.55, 2); eye(sx + 76, sy - 8, 1.2, bl2 ? 1 : 0.55, -2);
  brow(sx - 104, sy - 46, sx - 40, sy - 44, 7, 557, 1); brow(sx + 44, sy - 44, sx + 110, sy - 46, 7, 558, 1);
  Ln(sm([[sx - 18, sy + 12], [sx, sy + 6], [sx + 18, sy + 12]], false), 5, 559);
  F(sm([[sx - 34, sy + 120], [sx + 30, sy + 116], [sx + 26, sy + 170], [sx + 4, sy + 196], [sx + 20, sy + 220], [sx - 10, sy + 210], [sx - 20, sy + 170]]), '#ece8e0', { line: 6, seed: 560, shadow: 0.3, soft: 0.2 });
  F(sm([[sx - 80, sy + 166], [sx - 10, sy + 190], [sx - 80, sy + 222]]), '#d0322c', { line: 6, seed: 561, shadow: 0.3, hi: 0.3 }); F(sm([[sx + 80, sy + 160], [sx + 12, sy + 188], [sx + 82, sy + 220]]), '#d0322c', { line: 6, seed: 562, shadow: 0.3, hi: 0.3 }); F(ellD(sx, sy + 190, 20, 18), '#b02a24', { line: 5, seed: 563, shadow: 0.2 });
  F(sm([[sx - 250, sy - 170], [sx - 220, sy - 130], [sx - 120, sy - 150], [sx + 120, sy - 150], [sx + 226, sy - 136], [sx + 262, sy - 176], [sx + 270, sy - 120], [sx + 200, sy - 82], [sx, sy - 96], [sx - 200, sy - 80], [sx - 262, sy - 120]]), '#f0e6d2', { line: 7, seed: 564, shadow: 0.35, shadowCol: '#8a7a5a', shadowD: sm([[sx - 262, sy - 120], [sx - 200, sy - 96], [sx, sy - 112], [sx + 200, sy - 98], [sx + 270, sy - 120], [sx + 200, sy - 82], [sx, sy - 96], [sx - 200, sy - 80]]), soft: 0.25 });
  const crown = sm([[sx - 150, sy - 140], [sx - 140, sy - 352], [sx + 160, sy - 348], [sx + 156, sy - 140]]);
  F(crown, '#f2efe8', { line: 7, seed: 565, shadow: 0.3, soft: 0.25 }); ctx.save(); clipTo(crown); for (let i = 0; i < 3; i++) { ctx.fillStyle = '#c4302c'; ctx.fillRect(sx - 104 + i * 92, sy - 360, 46, 240); } ctx.restore();
  F(sm([[sx - 152, sy - 140], [sx - 148, sy - 236], [sx + 158, sy - 236], [sx + 156, sy - 140]]), '#24387a', { line: 6, seed: 566, shadow: 0.3, soft: 0.2 }); star(sx, sy - 188, 40, '#f7f3ea'); Ln(crown, 7, 567);
  ctx.restore(); }


// ── desk set (the approved preview's) with other characters standing behind it ──
function leaderStand(t, slam = 0) { // standing behind the desk, right of centre (from the reference's framing)
  const bl = blink(t, 0.7), hx = 792, hy = 560;
  F(sm([[540, 1210], [556, 900], [620, 806], [720, 780], [870, 782], [980, 830], [1040, 930], [1060, 1210]]), '#4a565c', { line: 8, seed: 600, shadowCol: '#10181e', shadow: 0.42, shadowD: sm([[940, 800], [1040, 930], [1060, 1210], [960, 1210], [990, 960]]), soft: 0.3, hi: 0.12 });
  F(poly([[740, 784], [850, 784], [796, 900]]), '#f2efe8', { line: 5, seed: 601, shadow: 0.1 }); F(sm([[786, 792], [808, 792], [816, 886], [797, 912], [780, 886]]), '#15181c', { line: 4, seed: 602, shadow: 0.2, hi: 0.3 });
  F(poly([[640, 800], [740, 784], [796, 900], [760, 1000], [700, 900]]), '#42505a', { line: 6, seed: 603, shadow: 0.3, shadowCol: '#10181e' }); F(poly([[850, 784], [960, 810], [900, 920], [830, 1000], [796, 900]]), '#3e4a52', { line: 6, seed: 604, shadow: 0.35, shadowCol: '#10181e' });
  for (const [x, y] of [[760, 960], [830, 960], [760, 1030], [830, 1030], [760, 1100], [830, 1100]]) F(ellD(x, y, 9, 9), '#8a8e7a', { line: 3, seed: x + y, shadow: 0.2, hi: 0.4 });
  // arm down to the desk (slams on "war")
  const hy2 = 1236 - 40 * (1 - slam);
  F(tube([[640, 830], [600, 1000], [640, 1150], [700, hy2 - 10]], [110, 100, 92, 84]), '#66747c', { line: 7, seed: 605, shadowCol: '#10181e', shadow: 0.4, soft: 0.3 });
  F(sm([[660, hy2 - 30], [730, hy2 - 40], [770, hy2 - 10], [764, hy2 + 24], [700, hy2 + 30], [656, hy2 + 10]]), '#f7f4ef', { line: 6, seed: 606, shadow: 0.25, shadowCol: SKIN_SH });
  for (let i = 0; i < 3; i++) Ln(sm([[728 + i * 12, hy2 - 30 + i * 4], [752 + i * 6, hy2 + 14]], false), 2.6, 607 + i, 'rgba(40,32,40,0.7)');
  softHead(hx, hy, 196, 214, 1, 608);
  F(sm([[hx - 196, hy + 40], [hx - 200, hy - 70], [hx - 140, hy - 170], [hx - 30, hy - 214], [hx + 100, hy - 196], [hx + 186, hy - 110], [hx + 198, hy + 30], [hx + 150, hy - 50], [hx + 50, hy - 92], [hx - 50, hy - 90], [hx - 130, hy - 46], [hx - 170, hy + 30]]), '#5e3822', { line: 7, seed: 609, shadowCol: '#1e0c04', shadow: 0.42, shadowD: sm([[hx + 40, hy - 208], [hx + 100, hy - 196], [hx + 186, hy - 110], [hx + 198, hy + 30], [hx + 150, hy - 50], [hx + 80, hy - 140]]), hi: 0.35, soft: 0.3 });
  Ln(sm([[hx - 40, hy - 210], [hx - 54, hy - 150], [hx - 60, hy - 96]], false), 4, 610, 'rgba(30,12,4,0.85)');
  eye(hx - 70, hy + 30, 1.3, bl ? 1 : 0.46, 5); eye(hx + 70, hy + 30, 1.3, bl ? 1 : 0.46, -5);
  brow(hx - 122, hy - 6, hx - 30, hy + 12, 9, 611, 5); brow(hx + 30, hy + 12, hx + 122, hy - 6, 9, 612, 5);
  at(hx, hy + 92, 0, 1, () => F(poly([[-34, -22], [34, -24], [44, 20], [-44, 22]]), '#553422', { line: 5, seed: 613, shadowCol: '#140602', shadow: 0.35, shadowD: rectD(-50, 4, 100, 26), hi: 0.3 }));
}
function tommyBreath(t) { // British soldier with an oxygen tank and mask, eyes shut in relief
  const hx = 300, hy = 800, inh = 0.5 + 0.5 * Math.sin((t - 17.2) * 3), bl = true;
  F(sm([[40, 1210], [60, 960], [140, 870], [260, 840], [420, 860], [500, 940], [520, 1210]]), '#7a5a3a', { line: 8, seed: 620, shadowCol: '#24140a', shadow: 0.42, shadowD: sm([[40, 1210], [60, 960], [140, 870], [180, 1000], [160, 1210]]), soft: 0.3 });
  F(poly([[240, 846], [380, 846], [312, 960]]), '#d9c49a', { line: 5, seed: 621, shadow: 0.15 }); F(sm([[300, 860], [326, 860], [334, 950], [312, 970], [296, 950]]), '#6a4a2a', { line: 4, seed: 622, shadow: 0.2 });
  // tank
  at(436, 990, 6, 1, () => { F(rectD(-46, -170, 92, 330, 30), '#7a8e88', { line: 7, seed: 623, shadowCol: '#1a2422', shadow: 0.4, shadowD: rectD(10, -170, 40, 330), hi: 0.35, soft: 0.25 }); F(rectD(-30, -214, 60, 50, 10), '#3a4442', { line: 5, seed: 624, shadow: 0.3, hi: 0.4 }); F(rectD(-34, -80, 68, 150, 6), '#e8e2d0', { line: 4, seed: 625, shadow: 0.1 });
    ctx.save(); ctx.rotate(-Math.PI / 2); ctx.font = '700 34px Fredoka'; ctx.textAlign = 'center'; ctx.fillStyle = '#2b2220'; ctx.fillText('OXYGEN', 4, 12); ctx.restore(); });
  F(tube([[160, 900], [230, 1040], [360, 1060]], [96, 88, 80]), '#86663f', { line: 7, seed: 626, shadowCol: '#24140a', shadow: 0.4, soft: 0.3 }); smallHand(380, 1056, Math.PI, 1.0, 627, 4, 0.9);
  F(tube([[440, 900], [470, 980], [446, 1000]], [90, 84, 78]), '#86663f', { line: 7, seed: 628, shadowCol: '#24140a', shadow: 0.4, soft: 0.3 }); smallHand(436, 1000, Math.PI * 0.9, 1.0, 629, 4, 0.9);
  softHead(hx, hy, 160, 172, -1, 630);
  Ln(sm([[hx - 78, hy + 6], [hx - 54, hy + 16], [hx - 30, hy + 8]], false), 6, 631); Ln(sm([[hx + 30, hy + 8], [hx + 54, hy + 16], [hx + 78, hy + 6]], false), 6, 632);
  brow(hx - 92, hy - 28, hx - 34, hy - 16, 7, 633, -4); brow(hx + 34, hy - 16, hx + 92, hy - 28, 7, 634, -4);
  // mask + hose
  F(tube([[hx + 40, hy + 120], [hx + 120, hy + 190], [400, 820]], 18, false), '#4a4a4e', { line: 4, seed: 635, shadow: 0.2 });
  at(hx + 18, hy + 92, -14, 1 + 0.04 * inh, () => { F(sm([[-48, -34], [40, -44], [64, 10], [30, 56], [-30, 56], [-60, 10]]), '#a9b0b4', { line: 6, seed: 636, shadowCol: '#2a2e32', shadow: 0.35, hi: 0.5, soft: 0.25 }); Ln(sm([[-30, -20], [0, -30], [30, -24]], false), 3, 637, 'rgba(255,255,255,0.6)'); });
  // brodie helmet
  at(hx, hy - 40, -12, 1, () => { F(sm([[-250, 40], [-200, 0], [-60, -10], [120, -14], [236, 10], [250, 40], [120, 34], [-60, 40]]), '#b0965f', { line: 8, seed: 638, shadowCol: '#3a2c14', shadow: 0.4, shadowD: sm([[-250, 40], [250, 40], [120, 34], [-60, 40]]), hi: 0.2 });
    F(sm([[-180, 6], [-170, -110], [-90, -200], [20, -226], [130, -196], [190, -110], [196, 4], [60, -8], [-60, -6]]), '#c4aa74', { line: 8, seed: 639, shadowCol: '#3a2c14', shadow: 0.38, shadowD: sm([[60, -220], [130, -196], [190, -110], [196, 4], [100, -2], [140, -110]]), hi: 0.4, soft: 0.3 });
    Ln(sm([[-110, -150], [-40, -196], [30, -206]], false), 6, 641, 'rgba(255,250,230,0.5)'); });
  if (inh > 0.6) { ctx.save(); ctx.globalAlpha = (inh - 0.6) * 2; for (let i = 0; i < 3; i++) Ln(sm([[hx - 150 - i * 20, hy + 40 + i * 30], [hx - 190 - i * 20, hy + 34 + i * 30]], false), 4, 640 + i); ctx.restore(); }
}
function usFlagDesk(t, slam) { // the US flag lying on the desk in perspective
  const q = [[470, 1206], [1000, 1190], [1100, 1480], [520, 1500]], L = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const bump = slam > 0 ? 6 * (1 - slam) : 0;
  F(poly(q), '#f2efe8', { line: 6, seed: 650, shadow: 0, soft: 0, tex: 0.1 });
  for (let i = 0; i < 13; i += 2) { const a = L(q[0], q[3], i / 13), b = L(q[1], q[2], i / 13), c = L(q[1], q[2], (i + 1) / 13), d = L(q[0], q[3], (i + 1) / 13); F(poly([a, b, c, d]), '#c4302c', { line: 0, shadow: 0, soft: 0, tex: 0.1, ink: false }); }
  const cq = [q[0], L(q[0], q[1], 0.42), L(L(q[0], q[3], 7 / 13), L(q[1], q[2], 7 / 13), 0.42), L(q[0], q[3], 7 / 13)]; F(poly(cq), '#2d4387', { line: 0, shadow: 0, soft: 0, ink: false });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const p0 = L(L(cq[0], cq[3], (r + 0.5) / 4), L(cq[1], cq[2], (r + 0.5) / 4), (c + 0.5) / 5); star(p0[0], p0[1] + bump, 7, '#f4f1ea'); }
  Ln(poly(q), 6, 651); blur(10, () => { ctx.fillStyle = 'rgba(30,15,6,0.25)'; ctx.fillRect(470, 1480, 640, 30); });
}
function breathe(t) { setSkin('#f7f4ef'); shot3(lerp(6.2, 9.2, seg(t, 17.2, 21.9)), { mid: (tt) => { leaderStand(t, 1); tommyBreath(t); } });
  const k = eob(seg(t, 17.88, 18.2)); if (t > 17.88) { ctx.save(); ctx.globalAlpha = clamp(k * 2) * (1 - seg(t, 21.3, 21.8)); at(540, 300, -4, lerp(1.5, 1, k), () => { F(rectD(-250, -80, 500, 160, 18), '#f1ead8', { line: 8, seed: 660, shadow: 0.15, soft: 0.2 }); hand('338,000', 0, 4, 110, 5); }); ctx.restore(); } }
function declare(t) { setSkin('#f7f4ef'); const slam = t >= 24.5 ? 1 - eo(seg(t, 24.5, 24.8)) : -0.0, sh = t > 24.5 && t < 24.9 ? 1 - seg(t, 24.5, 24.9) : 0;
  ctx.save(); ctx.translate(Math.sin(t * 90) * 10 * sh, 0);
  shot3(lerp(6.2, 9.2, seg(t, 21.9, 26.6)), { mid: () => leaderStand(t, t < 24.5 ? 0 : 1), top: () => { usFlagDesk(t, sh); if (sh > 0) { ctx.save(); ctx.globalAlpha = sh; for (let i = 0; i < 8; i++) { const a = -0.2 - i * 0.36; Ln(`M ${730 + Math.cos(a) * 140} ${1240 + Math.sin(a) * 90} L ${730 + Math.cos(a) * 220} ${1240 + Math.sin(a) * 140}`, 6, 670 + i); } ctx.restore(); }
    // the hand lands on the flag
    const hy2 = 1250; if (t >= 24.5) { F(sm([[660, hy2 - 30], [730, hy2 - 40], [770, hy2 - 10], [764, hy2 + 24], [700, hy2 + 30], [656, hy2 + 10]]), '#f7f4ef', { line: 6, seed: 606, shadow: 0.25, shadowCol: SKIN_SH }); for (let i = 0; i < 3; i++) Ln(sm([[728 + i * 12, hy2 - 30 + i * 4], [752 + i * 6, hy2 + 14]], false), 2.6, 607 + i, 'rgba(40,32,40,0.7)'); } } });
  ctx.restore(); }


// ── 34.7 "Ireland stays neutral, so Britain fights alone." — pine forest, X fence, shrugging Irish soldier ──
function pine(x, y, s, col, seed) { at(x, y, 0, s, () => { const lay = [[0, 0, 150], [0, -110, 120], [0, -210, 92], [0, -296, 62]];
  for (const [dx, dy, w] of lay) { const pts = []; const n = 7; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([dx - w + 2 * w * u, dy + (i % 2 ? -14 : 8)]); } pts.push([dx, dy - 150]);
    F(poly(pts), col, { line: 6, seed: seed + dy, shadowCol: '#0c1e0c', shadow: 0.4, shadowD: poly([[dx, dy - 150], [dx + w, dy + 8], [dx + w * 0.1, dy + 8]]), hi: 0.15, soft: 0.2 }); }
  for (let i = 0; i < 6; i++) Ln(`M ${-60 + i * 24} ${-60 - i * 40} l 14 18`, 2.5, seed + 50 + i, 'rgba(160,210,120,0.4)'); }); }
function xfence(y0, x0, x1, seed) { const posts = []; for (let x = x0; x <= x1 + 1; x += 300) posts.push(x);
  for (let i = 0; i < posts.length - 1; i++) { const a = posts[i], b = posts[i + 1]; F(tube([[a, y0 - 70], [b, y0 + 70]], 26, false), '#c29a5e', { line: 6, seed: seed + i, shadow: 0.3, hi: 0.3 }); F(tube([[a, y0 + 70], [b, y0 - 70]], 26, false), '#b48c52', { line: 6, seed: seed + 20 + i, shadow: 0.3, hi: 0.3 }); }
  for (const yy of [y0 - 86, y0 + 86]) F(tube([[x0 - 40, yy], [x1 + 60, yy - 10]], 30, false), '#cfa86a', { line: 6, seed: seed + 40 + yy, shadow: 0.3, hi: 0.35 });
  for (const x of posts) F(rectD(x - 20, y0 - 130, 40, 270, 6), '#a77c44', { line: 6, seed: seed + 60 + x, shadowCol: '#3a2410', shadow: 0.35, hi: 0.3 }); }
function unionJack(x, y, w, h, t, seed) { const fw = (a, b) => [x + a, y + b + Math.sin(a * 0.05 - t * 5) * 6 * (a / w)]; const d = poly([fw(0, 0), fw(w, 0), fw(w, h), fw(0, h)]);
  F(d, '#24387a', { line: 5, seed, shadow: 0.2, soft: 0.2 }); ctx.save(); clipTo(d); ctx.lineCap = 'butt';
  ctx.strokeStyle = '#f4f1ea'; ctx.lineWidth = h * 0.22; ctx.beginPath(); ctx.moveTo(...fw(0, 0)); ctx.lineTo(...fw(w, h)); ctx.moveTo(...fw(w, 0)); ctx.lineTo(...fw(0, h)); ctx.stroke();
  ctx.strokeStyle = '#c4302c'; ctx.lineWidth = h * 0.08; ctx.stroke(); ctx.lineWidth = h * 0.32; ctx.strokeStyle = '#f4f1ea'; ctx.beginPath(); ctx.moveTo(...fw(w / 2, 0)); ctx.lineTo(...fw(w / 2, h)); ctx.moveTo(...fw(0, h / 2)); ctx.lineTo(...fw(w, h / 2)); ctx.stroke();
  ctx.lineWidth = h * 0.18; ctx.strokeStyle = '#c4302c'; ctx.stroke(); ctx.restore(); Ln(d, 5, seed + 1); }
function ireland(t) { setSkin('#f7f4ef'); const dark = seg(t, 36.1, 36.6) * 0.55, brit = eo(seg(t, 36.2, 36.8));
  ctx.save(); cam(lerp(1.0, 1.06, seg(t, 34.7, 37.7)), W * 0.4, H * 0.45);
  grad([[0, '#bcd6e4'], [1, '#e6eef0']], 0, 0, 0, 900, 0, 0, W, 900); puff(60, 80, 70, '#ffffff', 'rgba(170,190,205,0.5)', 3, 4);
  for (const [x, y, sc, c, sd] of [[60, 520, 1.6, '#355e2c', 1], [330, 440, 1.9, '#3d6a32', 2], [620, 480, 1.7, '#365f2d', 3], [880, 420, 2.0, '#3d6a32', 4], [1090, 520, 1.6, '#355e2c', 5], [200, 700, 1.5, '#4a7a3a', 6], [760, 720, 1.5, '#467536', 7], [980, 760, 1.3, '#4a7a3a', 8]]) pine(x, y + 300, sc, c, sd * 100);
  // characters behind the fence
  const shrug = eob(seg(t, 35.5, 35.9));
  fig({ x: 300, y: 960, s: 1.5, d: 1, kit: 'irish', mood: 'neutral', t, blink: blink(t, 0.3), armF: [lerp(20, 70, shrug), lerp(40, 70, shrug)], armB: [lerp(-20, -70, shrug), lerp(60, 70, shrug)], tilt: -6 });
  fig({ x: 700, y: 950, s: 1.5, d: -1, kit: 'grey', mood: 'smug', t, blink: blink(t, 1.6), armF: [40, 60], armB: [20, 70], hold: (hf, hb, d) => rifle(hb[0] + 40, hb[1] + 40, -0.6, 300, d) });
  // grass crest + fence
  const hill = sm([[-60, 1080], [300, 1040], [700, 1010], [1140, 990], [1140, 1980], [-60, 1980]]);
  F(hill, '#5f9442', { line: 8, seed: 700, shadow: 0, soft: 0, hi: 0.1 }); ctx.save(); clipTo(hill); blur(30, () => { ctx.fillStyle = 'rgba(40,80,30,0.35)'; ctx.beginPath(); ctx.ellipse(540, 1900, 900, 400, 0, 0, 6.3); ctx.fill(); });
  for (let i = 0; i < 70; i++) { const x = hash(i * 3) * W, y = 1100 + hash(i * 5) * 800; Ln(sm([[x, y], [x + 6, y - 22], [x + 12, y]], false), 3, 710 + i, i % 3 ? 'rgba(30,64,24,0.5)' : 'rgba(150,200,110,0.5)'); } ctx.restore();
  xfence(1000, 0, 1080, 760);
  at(960, 1060, 6, 1, () => F(tube([[0, 0], [0, -260]], 12, false), '#4a3a2a', { line: 4, seed: 790, shadow: 0.2 })); unionJack(964, 808, 150, 96, t, 791);
  ctx.restore();
  if (dark) { ctx.fillStyle = `rgba(8,14,10,${dark})`; ctx.fillRect(0, 0, W, H); }
  if (brit > 0) { setSkin('#f7f4ef'); fig({ x: lerp(1500, 1000, brit), y: 1690, s: 3.2, d: -1, kit: 'khaki', mood: 'scared', t, blink: false, armF: [60, 40], armB: [10, 10], tilt: -10, lean: -8 }); }
}


// ── 46.8 "So the Reich grows from this to this." — wall map, soldier in front ──
function mapgrow(t) { setSkin('#f2f1f4'); const one = seg(t, 47.95, 48.2), two = eo(seg(t, 48.85, 49.25));
  ctx.save(); cam(lerp(1.0, 1.04, seg(t, 46.8, 49.8)), W * 0.4, H * 0.4);
  ctx.save(); clipTo(rectD(-20, -20, 1120, 1280));
  const red = (k) => `rgb(${lerp(230, 184, k) | 0},${lerp(220, 68, k) | 0},${lerp(196, 58, k) | 0})`;
  drawEurope([430, 760, 10.4, 51, 50], (n) => (n === 'Germany' && one > 0) ? red(one) : (two > 0 && REICH_SET.has(n)) ? red(two) : null,
    { extra: (pr) => { if (two > 0) { const pts = [[26, 44], [40, 44], [40, 47.5], [42, 50], [40, 56], [37, 61], [33, 64], [28, 62], [26, 56]]; regionFill(pr, pts, red(two)); ctx.save(); ctx.strokeStyle = 'rgba(60,44,34,0.75)'; ctx.lineWidth = 2.4; ctx.beginPath(); pts.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](...pr(...p))); ctx.stroke(); ctx.restore(); } } });
  ctx.restore();
  // wall + wainscot under the map
  F(rectD(-20, 1240, 1120, 760), '#9a7a58', { line: 7, seed: 800, shadowCol: '#3a2410', shadow: 0.3, shadowD: rectD(-20, 1240, 1120, 40), hi: 0.1 });
  for (let i = 0; i < 6; i++) Ln(`M ${i * 200 + 40} 1260 L ${i * 200 + 40} 1960`, 3, 801 + i, 'rgba(60,36,16,0.45)'); blur(16, () => { ctx.fillStyle = 'rgba(30,18,6,0.35)'; ctx.fillRect(-20, 1240, 1120, 30); });
  const g = eob(seg(t, 48.9, 49.3));
  fig({ x: 250, y: 2150, s: 4.0, d: 1, kit: 'grey', mood: two > 0 ? 'smug' : 'sly', t, blink: blink(t, 0.4), armF: [lerp(40, 120, g), lerp(80, 40, g)], armB: [lerp(30, 80, g), lerp(70, 50, g)], tilt: -8 });
  ctx.restore(); }


// ── 49.8 / 50.9 / 89 / 92 — the globe on its brass stand; a hand spins it ──
function globeSet(t, lon, lat, regions, spin, year, handK) {
  grad([[0, '#6e604e'], [1, '#4a3e30']], 0, 0, 0, 1440, 0, 0, W, 1460); blur(60, () => { ctx.fillStyle = 'rgba(255,236,200,0.22)'; ctx.beginPath(); ctx.ellipse(500, 760, 520, 560, 0, 0, 6.3); ctx.fill(); });
  F(rectD(-30, 1430, 1140, 560), '#6e4a30', { line: 8, seed: 820, shadowCol: '#1e0c04', shadow: 0.3, shadowD: rectD(-30, 1430, 1140, 30), hi: 0.1 });
  for (let i = 0; i < 12; i++) { const y = 1470 + i * 40 + 10 * hash(i), x0 = hash(i * 3) * 600 - 100; Ln(sm([[x0, y], [x0 + 200, y - 4], [x0 + 420, y + 2]], false), 2.6, 821 + i, 'rgba(35,18,8,0.55)'); }
  // paper, pen, books
  F(poly([[-20, 1500], [380, 1480], [430, 1700], [-20, 1740]]), '#efe8d6', { line: 6, seed: 840, shadow: 0.1, soft: 0.15 }); at(250, 1780, -14, 1, () => { F(rectD(-120, -8, 240, 16, 6), '#2a2624', { line: 4, seed: 841, shadow: 0.2, hi: 0.4 }); F(poly([[-150, 0], [-120, -8], [-120, 8]]), '#c9a95a', { line: 3, seed: 842, shadow: 0 }); });
  for (const [y, c, sd] of [[1250, '#3a4a6a', 843], [1330, '#7a2a2a', 844], [1410, '#4a3a5a', 845]]) F(poly([[800, y], [1100, y - 20], [1110, y + 70], [810, y + 90]]), c, { line: 6, seed: sd, shadow: 0.35, hi: 0.25, soft: 0.2 });
  // stand
  F(sm([[400, 1500], [680, 1500], [640, 1440], [440, 1440]]), '#b8903c', { line: 7, seed: 850, shadowCol: '#4a3008', shadow: 0.35, hi: 0.5 }); F(tube([[540, 1440], [540, 1250]], 50, false), '#c9a24a', { line: 6, seed: 851, shadowCol: '#4a3008', shadow: 0.35, hi: 0.5 });
  F(tube([[220, 1250], [60, 900], [100, 520], [300, 290], [540, 250]], 44, false), '#c9a24a', { line: 6, seed: 852, shadowCol: '#4a3008', shadow: 0.4, hi: 0.55 });
  drawGlobe(540, 800, 500, lon, lat, regions, { spin });
  F(tube([[900, 1220], [1000, 1040], [1040, 800]], 40, false), '#c9a24a', { line: 6, seed: 853, shadowCol: '#4a3008', shadow: 0.4, hi: 0.55 });
  if (year) { F(rectD(370, 120, 380, 120, 16), '#f1ead8', { line: 7, seed: 854, shadow: 0.15 }); hand(year, 560, 182, 78, 4); }
  if (handK > 0) { const x = lerp(1400, 0, eio(handK)); F(sm([[x + 700, 1100], [x + 330, 640], [x + 200, 560], [x + 140, 600], [x + 210, 720], [x + 460, 1180]]), '#f7f4ef', { line: 8, seed: 855, shadowCol: SKIN_SH, shadow: 0.3, soft: 0.25 }); }
}
const ROMAN = [{ pts: ROME, col: '#b04a3e' }, { pts: ROME_GB, col: '#b04a3e' }];
function globespin(t) { setSkin('#f7f4ef'); const hk = seg(t, 50.0, 50.6), lon = 10 + 300 * eo(seg(t, 50.3, 51.5));
  ctx.save(); cam(1.0, W / 2, H / 2); globeSet(t, lon, 34, [{ names: REICH_SET, col: '#b8443a' }, { names: new Set(['Germany']), col: '#b8443a' }], seg(t, 50.4, 50.8) * 0.7, null, hk < 1 ? hk : 0); ctx.restore(); }
function rome(t) { setSkin('#f7f4ef'); const k = eo(seg(t, 50.9, 52.7)), year = Math.round(lerp(1940, 117, k)), lon = lerp(310, 14, k);
  ctx.save(); globeSet(t, lon, 36, ROMAN.map((r) => ({ ...r, alpha: seg(t, 52.5, 52.9) })), (1 - seg(t, 52.2, 52.8)) * 0.7, (k < 0.999 ? year : '117') + ' AD', 0); ctx.restore(); }
function globeend(t) { setSkin('#f7f4ef'); const g = seg(t, 89.84, 90.2);
  ctx.save(); cam(lerp(1.06, 1.0, eo(seg(t, 89.0, 90.2))), W / 2, H * 0.45); globeSet(t, 12, 46, [{ names: new Set(['Germany']), col: `rgba(184,68,58,${g})` }], 0, null, 0); ctx.restore(); }
function globefinal(t) { setSkin('#f7f4ef'); const hk = seg(t, 92.9, 93.4), lon = 12 + 1200 * Math.pow(seg(t, 93.1, 94.4), 1.3);
  ctx.save(); globeSet(t, lon, 46, [{ names: new Set(['Germany']), col: '#b8443a' }], seg(t, 93.2, 93.5) * 0.85, null, hk < 1 ? hk : 0); ctx.restore(); }

// ── 53.4 parchment map: Rome 117 → split 395 → West falls 476 → East to 1453 ──
function parchment(t) { setSkin('#f7f4ef');
  const split = seg(t, 58.24, 58.7), fall = seg(t, 61.04, 61.6), year = t < 58.24 ? '117' : t < 61.04 ? '395' : t < 63.1 ? '476' : '1453';
  ctx.save(); cam(lerp(1.0, 1.05, seg(t, 53.4, 65.9)), W / 2, H * 0.42);
  grad([[0, '#3e3226'], [1, '#2a2018']], 0, 0, 0, H); F(rectD(-30, 300, 1140, 1700), '#5e4430', { line: 0, shadow: 0, soft: 0 });
  for (let i = 0; i < 20; i++) { const y = 320 + i * 82; Ln(sm([[-20, y], [500, y - 6 + 8 * vn(i)], [1100, y + 4]], false), 2.6, 860 + i, 'rgba(30,16,6,0.5)'); }
  blur(14, () => { ctx.fillStyle = 'rgba(20,10,4,0.5)'; ctx.fillRect(40, 470, 1040, 900); });
  const paper = sm([[30, 470], [300, 446], [620, 466], [1060, 440], [1080, 860], [1056, 1330], [600, 1350], [300, 1326], [40, 1356], [56, 900]]);
  F(paper, '#e9dcb8', { line: 7, seed: 870, shadowCol: '#7a5a20', shadow: 0.2, soft: 0.25, hi: 0.2 });
  ctx.save(); clipTo(paper);
  const pr = drawEurope([560, 960, 16, 41, 29], () => null, { sea: '#cdd4cc', glow: 'rgba(240,236,220,0.7)', land: '#efe4c8', extra: (pr) => {
    const westA = 1 - fall, SPL = [[19.3, 60], [19.4, 46], [19.1, 44], [19.6, 42.6], [20.2, 41], [19.8, 39], [20.5, 35], [19.6, 31], [19.2, 20]], line = () => { ctx.beginPath(); SPL.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](...pr(...p))); };
    ctx.save(); line(); ctx.lineTo(-200, pr(0, 20)[1]); ctx.lineTo(-200, pr(0, 60)[1]); ctx.closePath(); ctx.clip(); for (const r of ROMAN) regionFill(pr, r.pts, r.col, westA); ctx.restore();
    ctx.save(); line(); ctx.lineTo(3000, pr(0, 20)[1]); ctx.lineTo(3000, pr(0, 60)[1]); ctx.closePath(); ctx.clip(); for (const r of ROMAN) regionFill(pr, r.pts, split > 0 ? `rgb(${lerp(176, 128, split) | 0},${lerp(58, 64, split) | 0},${lerp(50, 150, split) | 0})` : r.col); ctx.restore(); } });
  ctx.restore(); blur(20, () => { ctx.fillStyle = 'rgba(110,80,30,0.25)'; ctx.fillRect(40, 460, 1020, 40); });
  at(170, 1250, -4, 1, () => hand(year, 0, 0, 74, year.length + 3, '#3a2410'));
  // candle (top-left) with dripping wax and a soft glow
  blur(40, () => { ctx.fillStyle = 'rgba(255,210,120,0.3)'; ctx.beginPath(); ctx.arc(180, 250, 260, 0, 6.3); ctx.fill(); });
  F(ellD(180, 430, 150, 40), '#b8903c', { line: 7, seed: 880, shadowCol: '#4a3008', shadow: 0.35, hi: 0.5 });
  F(sm([[110, 420], [104, 220], [130, 200], [150, 240], [180, 196], [230, 210], [256, 250], [252, 420]]), '#f1e8cc', { line: 7, seed: 881, shadowCol: '#8a7040', shadow: 0.3, soft: 0.3, hi: 0.3 });
  for (const [x, l] of [[120, 120], [200, 80], [240, 140]]) F(tube([[x, 230], [x, 230 + l]], 22, true), '#f4ecd4', { line: 5, seed: 882 + x, shadow: 0.25 });
  const fl = Math.sin(t * 17) * 4; F(sm([[180, 110 + fl], [204, 170], [180, 200], [156, 170]]), '#ffcf5a', { line: 4, seed: 885, shadow: 0, hi: 0.6 }); Ln('M 180 196 L 180 210', 3, 886);
  // two short swords on the table
  for (const [x, y, r, sd] of [[420, 1560, 22, 887], [560, 1640, 18, 890]]) at(x, y, r, 1, () => { F(sm([[-60, -16], [330, -14], [380, 0], [330, 14], [-60, 16]]), '#9aa2a8', { line: 6, seed: sd, shadowCol: '#2a3036', shadow: 0.35, shadowD: rectD(-60, 0, 450, 20), hi: 0.6 }); F(rectD(-80, -34, 22, 68, 6), '#4a3a2a', { line: 5, seed: sd + 1, shadow: 0.3 }); F(tube([[-90, 0], [-210, 0]], 30, false), '#5a3a1e', { line: 5, seed: sd + 2, shadow: 0.3, hi: 0.3 }); F(ellD(-222, 0, 22, 22), '#8a7a6a', { line: 4, seed: sd + 3, shadow: 0.3 }); });
  ctx.restore(); }


// ── pull-down map on a wooden wall (74.9 split, 82.4 break-up) ──
function pulldownWall(inner) {
  grad([[0, '#cbb08a'], [1, '#a88c66']], 0, 0, 0, H); for (let i = 0; i < 14; i++) Ln(`M ${i * 82 + 20} 0 L ${i * 82 + 24} ${H}`, 3, 900 + i, 'rgba(110,80,46,0.4)');
  blur(16, () => { ctx.fillStyle = 'rgba(40,20,6,0.4)'; ctx.fillRect(16, 60, 1060, 1320); });
  F(rectD(-10, 20, 1100, 46, 20), '#7a5a36', { line: 7, seed: 910, shadowCol: '#2a1606', shadow: 0.35, hi: 0.45 });
  ctx.save(); clipTo(rectD(10, 66, 1060, 1290)); inner(); ctx.restore(); Ln(rectD(10, 66, 1060, 1290), 7, 911);
  F(rectD(-10, 1340, 1100, 42, 18), '#7a5a36', { line: 7, seed: 912, shadowCol: '#2a1606', shadow: 0.35, hi: 0.45 });
  Ln('M 540 1382 L 540 1440', 4, 913); F(ellD(540, 1458, 20, 20), '#d2b06a', { line: 5, seed: 914, shadow: 0.3, hi: 0.5 }); F(ellD(540, 1458, 8, 8), '#a88c66', { line: 3, seed: 915, shadow: 0 });
}
const WEST_RED = '#b8443a', EAST_YEL = '#e8c24e';
const EASTLINE = [[22.5, 72], [22.5, 60], [23.5, 56], [24.5, 53], [23.8, 50], [22.5, 48.2], [22.8, 45], [23.5, 42], [26, 40], [26, 30]];
function eastClip(pr, east) { ctx.beginPath(); EASTLINE.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](...pr(...p))); if (east) { ctx.lineTo(3000, pr(0, 30)[1]); ctx.lineTo(3000, pr(0, 72)[1]); } else { ctx.lineTo(-500, pr(0, 30)[1]); ctx.lineTo(-500, pr(0, 72)[1]); } ctx.closePath(); }
const REICH_BIG = new Set([...REICH_SET, 'Russia', 'Finland', 'Italy', 'United Kingdom', 'Ireland', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan']);
const MAPC = [600, 690, 18, 57, 32];
function reichMap(t, eastK, westCol, extra) { const c = MAPC;
  return drawEurope(c, (n) => REICH_BIG.has(n) ? WEST_RED : null, { extra: (pr) => { if (eastK > 0) { ctx.save(); eastClip(pr, true); ctx.clip(); ctx.globalAlpha = eastK; ctx.fillStyle = EAST_YEL; ctx.fillRect(-100, -100, 3000, 3000); ctx.restore(); }
    if (westCol) { ctx.save(); eastClip(pr, false); ctx.clip(); ctx.fillStyle = westCol; ctx.fillRect(-100, -100, 3000, 3000); ctx.restore(); } if (extra) extra(pr); } }); }
function split(t) { const sp = seg(t, 76.64, 77.0), east = seg(t, 77.66, 78.0);
  ctx.save(); cam(lerp(1.0, 1.04, seg(t, 74.9, 78.9)), W / 2, H * 0.4);
  pulldownWall(() => { const gap = 22 * eo(sp);
    ctx.save(); ctx.translate(-gap, 0); const pr = projEU(MAPC); eastClip(pr, false); ctx.clip(); reichMap(t, 0); ctx.restore();
    ctx.save(); ctx.translate(gap, 0); eastClip(pr, true); ctx.clip(); reichMap(t, east); ctx.restore();
    if (sp > 0) { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); EASTLINE.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](...pr(...p))); ctx.stroke(); ctx.restore(); }
    if (east > 0) { ctx.save(); ctx.globalAlpha = east; at(830, 760, -4, 1, () => hand('EAST', 0, 0, 84, 3)); ctx.restore(); }
    const wl = seg(t, 78.2, 78.5); if (wl > 0) { ctx.save(); ctx.globalAlpha = wl; at(330, 820, 4, 1, () => hand('WEST', 0, 0, 84, 7, '#f6efe0')); ctx.restore(); } });
  ctx.restore(); }
function tank(x, y, s, col, rot = 0) { at(x, y, rot, s, () => {
  F(sm([[-100, 12], [100, 12], [116, 38], [92, 62], [-92, 62], [-116, 38]]), '#2c2a28', { line: 6, seed: 940, shadow: 0.2, hi: 0.25 });
  for (let i = 0; i < 6; i++) F(ellD(-70 + i * 28, 38, 11, 11), '#5a5652', { line: 3.5, seed: 941 + i, shadow: 0.2 });
  F(sm([[-90, -30], [90, -30], [102, 14], [-102, 14]]), col, { line: 6, seed: 947, shadow: 0.35, hi: 0.3, soft: 0.25 });
  F(sm([[-46, -74], [40, -74], [54, -28], [-56, -28]]), col, { line: 6, seed: 948, shadow: 0.35, hi: 0.3, soft: 0.25 }); F(rectD(46, -62, 130, 16, 6), '#3a3e36', { line: 5, seed: 949, shadow: 0.2 }); }); }
const NEWC = [['France', '#5a7ac4'], ['Poland', '#9be06a'], ['Netherlands', '#e88a3a'], ['Belgium', '#e8d24a'], ['Czechia', '#c46ac4'], ['Austria', '#e86a9a'], ['Denmark', '#6ac4c4'], ['Norway', '#7a7a8a'], ['Hungary', '#b07ae0'], ['Italy', '#6aa86a'], ['Switzerland', '#d8d8d8']];
function breakup(t) { const form = seg(t, 84.3, 85.0), tanks = seg(t, 85.4, 87.2), lose = seg(t, 87.0, 87.8);
  ctx.save(); cam(lerp(1.0, 1.04, seg(t, 82.4, 89.0)), W / 2, H * 0.4);
  pulldownWall(() => { const pr = projEU(MAPC);
    drawEurope(MAPC, (n) => { const i = NEWC.findIndex(([m]) => m === n); if (i >= 0 && form * NEWC.length > i) return NEWC[i][1]; return REICH_BIG.has(n) ? '#6a6a6c' : null; }, { extra: (pr2) => {
      ctx.save(); eastClip(pr2, true); ctx.clip(); ctx.fillStyle = EAST_YEL; ctx.fillRect(-100, -100, 3000, 3000); ctx.restore();
      if (lose > 0) { ctx.save(); ctx.beginPath(); const [cx, cy] = pr2(26, 52); ctx.moveTo(cx, cy); for (let i = 0; i <= 12; i++) { const a = -1.2 + i * 0.2, r = 240 * lose * (0.7 + 0.5 * hash(i)); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.3); } ctx.closePath(); ctx.fillStyle = '#6a6a6c'; ctx.fill(); ctx.restore(); } } });
    if (tanks > 0) for (let i = 0; i < 4; i++) { const k = eio(clamp(tanks * 1.3 - i * 0.1)), [x0, y0] = pr(0 + i * 1.5, 45 + i * 3), [x1, y1] = pr(19, 46 + i * 3); tank(lerp(x0, x1, k), lerp(y0, y1, k), 0.78, '#5a6a3a', -6 + 4 * i); }
  });
  ctx.restore(); }

// ── 78.9 "One thrives, one rots. Same old imperial cycle." — the road between WEST and EAST ──
function skel(x, y, s) { at(x, y, -64, s, () => { const B = '#efe9da';
  F(ellD(0, -300, 92, 86), B, { line: 7, seed: 960, shadow: 0.25, soft: 0.2 }); for (const d of [-1, 1]) F(ellD(d * 32, -304, 22, 26), INK, { line: 0, shadow: 0, ink: false }); F(poly([[-8, -268], [8, -268], [0, -252]]), INK, { line: 0, shadow: 0, ink: false });
  F(rectD(-40, -246, 80, 30, 8), B, { line: 5, seed: 961, shadow: 0.2 }); for (let i = -2; i <= 2; i++) Ln(`M ${i * 14} -246 L ${i * 14} -218`, 3, 962 + i);
  F(rectD(-8, -210, 16, 220, 6), B, { line: 5, seed: 967, shadow: 0.2 }); for (let i = 0; i < 4; i++) F(sm([[-72, -186 + i * 40], [0, -198 + i * 40], [72, -186 + i * 40], [68, -172 + i * 40], [0, -182 + i * 40], [-68, -172 + i * 40]]), B, { line: 4.5, seed: 968 + i, shadow: 0.2 });
  F(sm([[-60, 0], [60, 0], [44, 40], [-44, 40]]), B, { line: 5, seed: 972, shadow: 0.2 });
  for (const d of [-1, 1]) { F(tube([[d * 30, 30], [d * 50, 170], [d * 44, 300]], 18, false), B, { line: 4.5, seed: 973 + d, shadow: 0.2 }); F(tube([[d * 74, -200], [d * 124, -90], [d * 104, 20]], 16, false), B, { line: 4.5, seed: 976 + d, shadow: 0.2 }); } }); }
function road(t) { setSkin('#f2f1f4'); const rot = seg(t, 80.06, 80.6);
  ctx.save(); cam(lerp(1.0, 1.04, seg(t, 78.9, 82.4)), W / 2, H * 0.3);
  grad([[0, '#9cc6e6'], [1, '#e6eef2']], 0, 0, 0, 680, 0, 0, W, 700); puff(160, 120, 110, '#ffffff', 'rgba(160,180,200,0.4)', 21, 5); puff(900, 60, 90, '#ffffff', 'rgba(160,180,200,0.4)', 22, 4);
  F(sm([[-60, 660], [1140, 640], [1140, 1980], [-60, 1980]]), '#6f9c48', { line: 7, seed: 980, shadow: 0, soft: 0, hi: 0.1 });
  F(sm([[-60, 660], [300, 646], [600, 650], [700, 660], [-60, 700]]), '#8aa6c0', { line: 0, shadow: 0, soft: 0, hi: 0, ink: false });
  for (let i = 0; i < 70; i++) { const x = 560 + hash(i * 3) * 560, y = 680 + hash(i * 5) * 1250; Ln(sm([[x, y], [x + 6, y - 22], [x + 12, y]], false), 3, 981 + i, i % 3 ? 'rgba(36,70,26,0.5)' : 'rgba(160,210,110,0.5)'); }
  const roadD = poly([[300, 650], [720, 650], [1160, 1980], [-240, 1980]]); F(roadD, '#b4a68a', { line: 7, seed: 1050, shadow: 0, soft: 0, hi: 0.06 });
  ctx.save(); clipTo(roadD); blur(26, () => { ctx.fillStyle = 'rgba(90,76,52,0.3)'; ctx.beginPath(); ctx.ellipse(260, 1400, 260, 600, 0.2, 0, 6.3); ctx.fill(); }); for (let i = 0; i < 40; i++) { const x = hash(i * 9) * 1000, y = 700 + hash(i * 13) * 1200; F(ellD(x, y, 6 + 6 * hash(i), 4), 'rgba(90,76,52,0.5)', { line: 0, shadow: 0, ink: false }); } ctx.restore();
  for (let i = 0; i < 7; i++) { const y0 = 680 + i * i * 30, y1 = y0 + 40 + i * 30, w0 = 7 + i * 5; F(poly([[530 - w0, y0], [530 + w0, y0], [530 + w0 * 1.25, y1], [530 - w0 * 1.25, y1]]), '#c8402e', { line: 4.5, seed: 1051 + i, shadowCol: '#5a1008', shadow: 0.3, shadowD: rectD(530, y0, w0 * 2, y1 - y0) });
  }
  const sign = (x, y, txt, r) => at(x, y, r, 1.4, () => { F(rectD(-14, -20, 28, 300, 4), '#7a5636', { line: 5, seed: x, shadow: 0.3 }); F(sm([[-160, -100], [160, -112], [166, 4], [-156, 14]]), '#a07c56', { line: 7, seed: x + 1, shadow: 0.3, hi: 0.2, soft: 0.2 }); for (let i = 0; i < 3; i++) Ln(`M -140 ${-70 + i * 30} L 140 ${-76 + i * 30}`, 2.4, x + 5 + i, 'rgba(70,46,24,0.4)'); hand(txt, 2, -46, 80, x); });
  if (rot > 0) { ctx.save(); ctx.globalAlpha = rot; skel(300, 1040, 1.05); ctx.restore(); }
  if (rot < 1) { ctx.save(); ctx.globalAlpha = 1 - rot; fig({ x: 180, y: 900, s: 1.8, d: 1, kit: 'grey', mood: 'sad', t, blink: blink(t), lean: -60 * eio(rot), armF: [10, 10], armB: [10, 10] }); ctx.restore(); }
  fig({ x: 860, y: 930, s: 2.2, d: -1, kit: 'leader', mood: 'smug', t, blink: blink(t, 1), armFTo: [-52, -196], armB: [6, 10] });
  sign(110, 1660, 'WEST', -28); sign(1010, 1620, 'EAST', 26);
  ctx.restore(); }

// ── 65.9 passport: "You can't stamp one eagle on every passport and expect peace." ──
function eagleMark(col) { F(sm([[-14, -20], [-50, -70], [-120, -96], [-96, -52], [-136, -40], [-80, -10], [-40, 6], [-30, 44], [-8, 60], [0, 40], [8, 60], [30, 44], [40, 6], [80, -10], [136, -40], [96, -52], [120, -96], [50, -70], [14, -20]]), col, { line: 0, shadow: 0, hi: 0, soft: 0, ink: false }); F(ellD(-2, -40, 20, 20), col, { line: 0, shadow: 0, ink: false }); F(poly([[-20, -44], [-40, -36], [-18, -32]]), col, { line: 0, shadow: 0, ink: false }); }
function romeStreet(t, fire) {
  grad([[0, fire ? '#e08a5a' : '#c9b49a'], [0.5, fire ? '#f0b880' : '#ddd0bc'], [1, '#b89a78']], 0, 0, 0, 900, 0, 0, W, 920);
  F(sm([[-60, 520], [200, 420], [460, 470], [760, 380], [1140, 460], [1140, 900], [-60, 900]]), '#6f8a52', { line: 6, seed: 1150, shadow: 0.3, shadowCol: '#1e2a10', soft: 0.3 });
  const bld = (x, y, w, h, col, sd) => { F(rectD(x, y, w, h), col, { line: 7, seed: sd, shadowCol: '#3a2010', shadow: 0.38, shadowD: rectD(x + w * 0.7, y, w * 0.3, h), soft: 0.3, hi: 0.15 });
    for (let r = 0; r < Math.floor(h / 150); r++) for (let c = 0; c < Math.floor(w / 90); c++) F(sm([[x + 24 + c * 90, y + 130 + r * 150], [x + 24 + c * 90, y + 60 + r * 150], [x + 50 + c * 90, y + 40 + r * 150], [x + 76 + c * 90, y + 60 + r * 150], [x + 76 + c * 90, y + 130 + r * 150]]), '#3a2618', { line: 4, seed: sd + 10 + r * 9 + c, shadow: 0 }); };
  bld(-40, 440, 300, 760, '#b88a62', 1151); bld(240, 560, 220, 640, '#c89a6a', 1152); bld(620, 300, 520, 900, '#a86a4a', 1153);
  for (let i = 0; i < 4; i++) F(sm([[640 + i * 120, 1200], [640 + i * 120, 760], [700 + i * 120, 690], [760 + i * 120, 760], [760 + i * 120, 1200]]), '#3a2014', { line: 5, seed: 1160 + i, shadow: 0 });
  F(rectD(-40, 1180, 1160, 800), '#8a6a4a', { line: 0, shadow: 0, soft: 0 }); for (let i = 0; i < 14; i++) Ln(`M -20 ${1220 + i * 50} L 1100 ${1210 + i * 52}`, 2.6, 1170 + i, 'rgba(50,30,14,0.4)');
  if (fire) { for (let i = 0; i < 7; i++) { const x = 60 + i * 160, h = (180 + 90 * Math.sin(t * 11 + i)) * fire, y = [700, 820, 640, 900, 560, 760, 680][i]; F(sm([[x - 50, y], [x - 16, y - h * 0.6], [x, y - h], [x + 20, y - h * 0.5], [x + 50, y]]), i % 2 ? '#f6b04a' : '#e86a2c', { line: 5, seed: 1190 + i, shadow: 0.2, hi: 0.5 }); }
    blur(30, () => { ctx.globalAlpha = fire * 0.6; ctx.fillStyle = '#5a4a4a'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(150 + i * 220, 300 - 40 * i % 3, 160, 90, 0, 0, 6.3); ctx.fill(); } }); }
}
function passport(t) { setSkin('#f7f4ef'); const fire = seg(t, 68.6, 69.3), st = eob(seg(t, 66.5, 66.7));
  ctx.save(); cam(lerp(1.0, 1.04, seg(t, 65.9, 69.9)), W / 2, H * 0.5);
  romeStreet(t, fire);
  at(540, 760, -18, 0.86, () => {
    blur(24, () => { ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(-560, -620, 1180, 1300); });
    const cover = sm([[-560, -640], [470, -640], [560, -560], [580, 640], [-560, 660]]);
    F(cover, '#d6d4d0', { line: 9, seed: 1200, shadowCol: '#3a3836', shadow: 0.3, shadowD: sm([[-560, 200], [580, 200], [580, 640], [-560, 660]]), soft: 0.3, hi: 0.35 });
    Ln(sm([[-560, 150], [0, 140], [580, 150]], false), 5, 1201, 'rgba(40,38,36,0.6)');
    at(120, 330, 0, 1, () => hand('PASSPORT', 0, 0, 170, 3));
    for (let i = 0; i < 3; i++) Ln(`M -200 ${470 + i * 50} L ${520 - i * 80} ${470 + i * 50}`, 6, 1202 + i, 'rgba(40,38,36,0.7)');
    F(rectD(-500, 420, 270, 290, 14), '#cfe6de', { line: 7, seed: 1205, shadow: 0.15 }); F(ellD(-365, 580, 95, 110), '#f7f4ef', { line: 6, seed: 1206, shadow: 0.2 }); F(ellD(-395, 560, 9, 14), INK, { line: 0, shadow: 0, ink: false }); F(ellD(-335, 560, 9, 14), INK, { line: 0, shadow: 0, ink: false }); Ln(sm([[-385, 620], [-365, 628], [-345, 620]], false), 5, 1207);
    if (t > 66.5) at(-60, -260, -8, lerp(1.6, 1, st), () => { ctx.globalAlpha = clamp(st * 2) * 0.94; ctx.strokeStyle = '#c4302c'; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(0, 0, 300, 0, 6.3); ctx.stroke(); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 252, 0, 6.3); ctx.stroke(); at(0, -30, 0, 2.0, () => eagleMark('#c4302c')); at(60, 170, -8, 1, () => hand('ROME', 0, 0, 84, 2, '#7a2a24')); }); });
  // the hand holding it from the lower left
  F(sm([[-120, 1700], [-80, 1300], [40, 1180], [140, 1200], [180, 1300], [120, 1440], [140, 1700]]), '#f7f4ef', { line: 9, seed: 1210, shadowCol: SKIN_SH, shadow: 0.3, soft: 0.25 });
  F(tube([[110, 1240], [210, 1160], [250, 1120]], [80, 70, 60]), '#f7f4ef', { line: 8, seed: 1211, shadowCol: SKIN_SH, shadow: 0.25 });
  if (t > 66.2 && t < 66.6) { const k = seg(t, 66.2, 66.5); F(tube([[1400, -300], [lerp(1100, 560, k), lerp(-100, 820, k)]], [300, 240]), '#f7f4ef', { line: 8, seed: 1212, shadow: 0.25, shadowCol: SKIN_SH }); }
  ctx.restore(); }


// ── 37.7 / 44.8 the American on his porch ──
function house(t) {
  grad([[0, '#a9cbe0'], [1, '#dde9ee']], 0, 0, 0, 700, 0, 0, W, 720);
  blur(6, () => { ctx.fillStyle = '#6a8a5a'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(i * 140, 300 + 30 * hash(i), 120, 0, 6.3); ctx.fill(); } });
  F(poly([[60, 420], [540, 40], [1020, 420]]), '#3e5aa8', { line: 8, seed: 1300, shadowCol: '#141e40', shadow: 0.35, soft: 0.25 }); for (let i = 0; i < 9; i++) Ln(`M ${300 - i * 30} ${240 + i * 26} L ${780 + i * 30} ${240 + i * 26}`, 3, 1301 + i, 'rgba(14,22,50,0.5)');
  F(tube([[20, 450], [540, 40], [1060, 450]], 40, false), '#f2efe8', { line: 7, seed: 1310, shadow: 0.25, hi: 0.3 });
  F(rectD(440, 180, 200, 230, 4), '#f2efe8', { line: 7, seed: 1311, shadow: 0.2 }); F(rectD(462, 202, 156, 186), '#5a6470', { line: 5, seed: 1312, shadow: 0.2, hi: 0.4 }); Ln('M 462 296 L 618 296', 5, 1313);
  F(rectD(-20, 450, 1120, 1000), '#3e5aa8', { line: 0, shadow: 0, soft: 0 }); for (let i = 0; i < 22; i++) Ln(`M -20 ${470 + i * 36} L 1100 ${470 + i * 36}`, 3, 1320 + i, 'rgba(14,22,50,0.45)');
  F(rectD(-20, 450, 1120, 44), '#f2efe8', { line: 6, seed: 1345, shadow: 0.2 }); F(rectD(-20, 830, 1120, 50), '#f2efe8', { line: 6, seed: 1346, shadow: 0.2 });
  for (const x of [80, 820]) { F(rectD(x, 540, 200, 250, 4), '#f2efe8', { line: 7, seed: 1350 + x, shadow: 0.2 }); F(rectD(x + 20, 560, 160, 210), '#5a6470', { line: 5, seed: 1351 + x, shadow: 0.2, hi: 0.4 }); Ln(`M ${x + 20} 665 L ${x + 180} 665`, 5, 1352 + x); }
  for (const x of [40, 400, 680, 1020]) F(rectD(x, 880, 50, 420), '#f2efe8', { line: 6, seed: 1360 + x, shadowCol: '#5a5a6a', shadow: 0.3, hi: 0.2 });
  for (let i = 0; i < 26; i++) F(rectD(i * 44, 1080, 18, 210), '#f2efe8', { line: 4, seed: 1370 + i, shadow: 0.2 }); F(rectD(-20, 1060, 1120, 30), '#f2efe8', { line: 5, seed: 1398, shadow: 0.2 }); F(rectD(-20, 1290, 1120, 30), '#f2efe8', { line: 5, seed: 1399, shadow: 0.2 });
  F(rectD(-20, 1320, 1120, 700), '#6a9a4a', { line: 0, shadow: 0, soft: 0 }); blur(6, () => { ctx.fillStyle = '#4a7a36'; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(i * 100, 1360, 70, 0, 6.3); ctx.fill(); } });
  for (let i = 0; i < 12; i++) F(rectD(-20 + i * 96, 1700, 92, 46), '#b0583a', { line: 4, seed: 1400 + i, shadow: 0.3 }); F(rectD(-20, 1746, 1120, 300), '#a04e34', { line: 6, seed: 1413, shadow: 0.35 });
  // flag on the gable
  F(tube([[1010, 120], [1110, -40]], 12, false), '#d8d3c8', { line: 4, seed: 1414, shadow: 0.2 }); const fw = (a, b) => [1040 + a, -20 + b + Math.sin(a * 0.04 - t * 5) * 6]; ctx.save(); const fd = poly([fw(0, 0), fw(200, 0), fw(200, 130), fw(0, 130)]); clipTo(fd);
  for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#f4f1ea' : '#c4302c'; ctx.fillRect(1030, -24 + i * 20, 230, 20); } ctx.restore(); Ln(fd, 5, 1415);
}
function yank(t, mood, scarf) { const bl = blink(t, 0.6), hx = 700, hy = 790;
  F(sm([[400, 1990], [430, 1360], [520, 1180], [700, 1140], [880, 1180], [960, 1360], [990, 1990]]), '#7aa078', { line: 8, seed: 1420, shadowCol: '#1e3a20', shadow: 0.35, soft: 0.3 });
  F(sm([[460, 1990], [470, 1420], [560, 1360], [840, 1360], [930, 1420], [940, 1990]]), '#8aa4c8', { line: 8, seed: 1421, shadowCol: '#1e2a48', shadow: 0.35, soft: 0.3, hi: 0.15 });
  for (const x of [540, 860]) { F(tube([[x, 1170], [x, 1380]], 44, false), '#8aa4c8', { line: 6, seed: 1422 + x, shadow: 0.3 }); F(ellD(x, 1390, 18, 18), '#c9a95a', { line: 4, seed: 1423 + x, shadow: 0.2 }); }
  F(rectD(580, 1500, 240, 160, 10), '#7a94b8', { line: 6, seed: 1424, shadow: 0.25 });
  softHead(hx, hy, 232, 248, 1, 1425);
  if (mood === 'worried') { eye(hx - 100, hy + 40, 1.35, bl ? 1 : 0.1, 0, [-4, 0]); eye(hx + 30, hy + 40, 1.35, bl ? 1 : 0.1, 0, [-4, 0]); brow(hx - 150, hy - 2, hx - 60, hy - 24, 8, 1426, 4); brow(hx - 10, hy - 24, hx + 80, hy - 2, 8, 1427, 4); Ln(sm([[hx - 70, hy + 120], [hx - 40, hy + 112], [hx - 10, hy + 120]], false), 6, 1428); F(sm([[hx + 150, hy - 120], [hx + 166, hy - 86], [hx + 158, hy - 66], [hx + 140, hy - 70], [hx + 138, hy - 92]]), '#bfe3f7', { line: 4, seed: 1429, shadow: 0.1, hi: 0.5 }); }
  else { eye(hx - 100, hy + 40, 1.35, bl ? 1 : 0.5, 0); eye(hx + 30, hy + 40, 1.35, bl ? 1 : 0.5, 0); brow(hx - 150, hy - 10, hx - 60, hy - 4, 8, 1426, -2); brow(hx - 10, hy - 4, hx + 80, hy - 10, 8, 1427, -2); Ln(sm([[hx - 76, hy + 116], [hx - 40, hy + 126], [hx - 4, hy + 108]], false), 6, 1428); }
  F(tube([[470, 1060], [700, 1110], [930, 1050]], 80, false), '#7a9a6a', { line: 7, seed: 1430, shadowCol: '#1e3a20', shadow: 0.35, soft: 0.3 }); for (let i = 0; i < 5; i++) Ln(`M ${520 + i * 90} 1040 l 10 60`, 3, 1431 + i, 'rgba(20,40,20,0.45)');
  smallHand(560, 1080, -1.2 + (scarf ? 0.2 : 0), 1.7, 1440, 4, 0.8); smallHand(830, 1070, -1.9 - (scarf ? 0.2 : 0), 1.7, 1441, 4, 0.8);
}
function banner(x, y, rot, l1, l2, col = '#c4302c') { at(x, y, rot, 1, () => { F(sm([[-210, -86], [210, -96], [220, 80], [-200, 92]]), col, { line: 8, seed: 1450, shadow: 0.3, soft: 0.25, hi: 0.2 }); for (const sx of [-196, 200]) F(ellD(sx, -84, 10, 10), '#c9c4b8', { line: 4, seed: 1451 + sx, shadow: 0.2 }); hand(l1, 0, l2 ? -26 : 0, 66, 5, '#f6efe0'); if (l2) hand(l2, 0, 42, 52, 9, '#f6efe0'); }); }
function porch(t) { setSkin('#f7f4ef'); ctx.save(); cam(lerp(1.0, 1.03, seg(t, 37.7, 38.8)), W / 2, H * 0.5); house(t); banner(250, 960, -6, 'AMERICA', 'FIRST'); yank(t, 'worried', true); ctx.restore(); }
function stayout(t) { setSkin('#f7f4ef'); const sh = eob(seg(t, 45.3, 45.7)); ctx.save(); cam(lerp(1.03, 1.0, seg(t, 44.8, 46.8)), W / 2, H * 0.5); house(t); banner(250, 960, -6, 'STAY', 'OUT!');
  yank(t, 'calm', false); ctx.restore(); }
// ── 38.8 Madison Square Garden, 1939 — 20,000 people (crowd from behind, no symbols) ──
function arena(t) { setSkin('#ecebef'); const num = eob(seg(t, 40.38, 40.7));
  ctx.save(); cam(lerp(1.0, 1.06, seg(t, 38.8, 44.8)), W / 2, H * 0.4);
  grad([[0, '#2a2430'], [1, '#4a3e40']], 0, 0, 0, H);
  blur(50, () => { ctx.fillStyle = 'rgba(255,220,160,0.35)'; ctx.beginPath(); ctx.ellipse(540, 560, 520, 260, 0, 0, 6.3); ctx.fill(); });
  for (let r = 0; r < 4; r++) { F(poly([[-40, 300 + r * 70], [1120, 300 + r * 70], [1120, 340 + r * 70], [-40, 340 + r * 70]]), r % 2 ? '#3a3036' : '#463a3e', { line: 3, seed: 1460 + r, shadow: 0, soft: 0 }); for (let i = 0; i < 40; i++) F(ellD(i * 28 + (r % 2) * 14, 300 + r * 70, 10, 12), '#6a5e66', { line: 0, shadow: 0, ink: false }); }
  F(rectD(260, 520, 560, 220, 6), '#7a2a2a', { line: 7, seed: 1470, shadowCol: '#2a0a0a', shadow: 0.35, soft: 0.3 }); for (let i = 0; i < 9; i++) Ln(`M ${280 + i * 62} 530 L ${284 + i * 62} 730`, 3, 1471 + i, 'rgba(30,8,8,0.5)');
  F(rectD(220, 740, 640, 80, 6), '#5a4030', { line: 7, seed: 1480, shadow: 0.35, hi: 0.2 }); for (const x of [380, 540, 700]) F(rectD(x - 10, 650, 20, 100, 4), '#2a2624', { line: 4, seed: 1481 + x, shadow: 0.2 });
  for (const [x, y] of [[180, 420], [900, 420]]) blur(20, () => { ctx.fillStyle = 'rgba(255,240,200,0.5)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 200, 1000); ctx.lineTo(x + 200, 1000); ctx.closePath(); ctx.fill(); });
  // the crowd, seen from behind, row after row
  for (let r = 0; r < 9; r++) { const y = 900 + r * r * 14 + r * 70, s = 0.5 + r * 0.16, n = Math.ceil(1240 / (130 * s));
    for (let i = 0; i < n; i++) { const x = -60 + i * 130 * s + (r % 2) * 60 * s + 10 * vn(i + r * 7), bob = Math.sin(t * 6 + i * 1.3 + r) * 4 * s;
      F(sm([[x - 70 * s, y + 200 * s], [x - 64 * s, y + 70 * s], [x, y + 46 * s], [x + 64 * s, y + 70 * s], [x + 70 * s, y + 200 * s]]), ['#4a4a5a', '#5a4a3e', '#3e4a5a', '#5a5048'][(i + r) % 4], { line: 5 * s, seed: 1500 + r * 40 + i, shadow: 0.35, shadowCol: '#100c10', soft: 0.25 });
      F(ellD(x, y + bob, 52 * s, 56 * s), '#d8d6dc', { line: 6 * s, seed: 1700 + r * 40 + i, shadow: 0.35, shadowCol: '#3a3440', soft: 0.3 });
      if ((i + r) % 3 === 0) F(sm([[x - 58 * s, y - 20 * s + bob], [x, y - 60 * s + bob], [x + 58 * s, y - 20 * s + bob], [x + 70 * s, y - 6 * s + bob], [x - 70 * s, y - 6 * s + bob]]), '#3a3434', { line: 4 * s, seed: 1900 + r * 40 + i, shadow: 0.2 }); } }
  ctx.restore();
  at(540, 260, -4, 1, () => { F(rectD(-300, -110, 600, 220, 20), '#f1ead8', { line: 9, seed: 1990, shadow: 0.15, soft: 0.2 }); hand('1939', 0, -40, 70, 3, '#7a2a24'); if (t > 40.38) { ctx.save(); ctx.globalAlpha = clamp(num * 2); at(0, 40, 0, lerp(1.4, 1, num), () => hand('20,000', 0, 0, 96, 6)); ctx.restore(); } });
}
// ── 69.9 "holds people by fear, not loyalty" — civilians in a row under a soldier's long shadow ──
function fear(t) { setSkin('#ecebef'); const sh = eo(seg(t, 70.4, 71.8)), shake = Math.sin(t * 40) * 3 * sh;
  ctx.save(); cam(lerp(1.0, 1.05, seg(t, 69.9, 74.9)), W / 2, H * 0.55);
  grad([[0, '#8a7a6e'], [1, '#6e625a']], 0, 0, 0, 1500, 0, 0, W, 1500);
  for (let r = 0; r < 20; r++) for (let c = 0; c < 8; c++) F(rectD(c * 150 - (r % 2) * 75 - 20, r * 74, 142, 66, 6), r % 3 === c % 3 ? '#9a887a' : '#8e7e72', { line: 3, seed: 2040 + r * 9 + c, shadow: 0.2, shadowCol: '#2a2018', soft: 0.15, tex: 0.12 });
  F(rectD(-20, 1480, 1120, 520), '#5e544c', { line: 6, seed: 2200, shadow: 0, soft: 0 });
  [[200, 'civ', 1], [540, 'civ2', -1], [880, 'civ', -1]].forEach(([x, kit, d], i) => fig({ x: x + shake * (i - 1), y: 1560, s: 2.0, d, kit, mood: 'scared', sweat: true, t, blink: false, armF: [10, 150], armB: [-6, 30], tilt: Math.sin(t * 30 + i) * 1.5 + (sh > 0.5 ? -6 * d : 0) }));
  // the long shadow of a helmeted soldier slides over them
  ctx.save(); ctx.globalAlpha = 0.62 * sh; ctx.fillStyle = '#0e0c12'; const sx = lerp(1700, 540, sh), sy = 520;
  ctx.beginPath(); ctx.ellipse(sx, sy, 470, 420, 0, Math.PI, 0); ctx.lineTo(sx + 560, sy + 30); ctx.lineTo(sx + 560, sy + 90); ctx.lineTo(sx - 560, sy + 90); ctx.lineTo(sx - 560, sy + 30); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(sx, sy + 340, 330, 300, 0, 0, 6.3); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx - 700, 2000); ctx.lineTo(sx - 520, sy + 640); ctx.lineTo(sx + 520, sy + 640); ctx.lineTo(sx + 700, 2000); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.restore(); }
// ── 11.4 desk with a wall calendar: June 1941 → a Russian winter ──
function deskCal(t) { setSkin('#f7f4ef'); const flip = seg(t, 15.1, 15.5), snow = seg(t, 16.3, 16.7);
  shot3(lerp(6.18, 9.3, seg(t, 11.4, 17.2)), { top: () => {} });
  at(930, 240, 4, 1, () => { F(rectD(-120, -150, 240, 300, 10), '#f4f1ea', { line: 7, seed: 2020, shadow: 0.2, soft: 0.2 }); F(rectD(-120, -150, 240, 70, 10), '#b8443a', { line: 6, seed: 2021, shadow: 0.2 });
    hand(flip < 0.5 ? 'JUNE' : 'DEC', 0, -114, 50, 3, '#f4f1ea'); hand('1941', 0, 30, 70, 6); for (let i = 0; i < 4; i++) Ln(`M -90 ${80 + i * 0} L 90 ${80}`, 2.5, 2022, 'rgba(40,30,30,0.35)');
    if (flip > 0 && flip < 1) { ctx.save(); ctx.scale(1, Math.abs(Math.cos(flip * Math.PI))); F(rectD(-120, -80, 240, 230, 6), '#ece6d8', { line: 6, seed: 2023, shadow: 0.2 }); ctx.restore(); } });
  if (snow > 0) { ctx.save(); ctx.globalAlpha = snow; ctx.fillStyle = 'rgba(200,220,240,0.25)'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 90; i++) { const x = (hash(i) * W + (t - 16.3) * 60 * hash(i * 3)) % W, y = (hash(i * 5) * H + (t - 16.3) * 260 * (0.6 + hash(i * 7))) % H; F(ellD(x, y, 6 + 6 * hash(i * 9), 6 + 6 * hash(i * 9)), '#ffffff', { line: 2.5, seed: 2030 + i, shadow: 0, soft: 0, tex: 0 }); } ctx.restore(); } }

export const HQ = {
  desk: deskCal,
  dunkirk: breathe, declare, summer, blitz, peace,
  ireland, porch, arena, stayout,
  mapgrow, globespin, rome, parchment, passport, fear,
  split, road, breakup, globeend, globefinal,
};
