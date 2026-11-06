// Shots 4–24 of "What if Germany won WW2" in the Ink Toon style (shots 1–3 come from intro.js).
import { W, H, ctx, clamp, lerp, seg, eo, eio, eob, hash, vn, S, INK, P, ellD, rectD, F, Ln, grad, strokes, puff, blur, at, cam, sm, poly, tube, xform, hand } from './kit.js';
import { setSkin, SKIN_SH, smallHand, clipTo, ell, shot2, flag, tape } from './intro.js';
import { person, star, europe, globe, GERMANY, REICH, ROME, ROME_GB, proj } from './lib2.js';

const blink = (t, k = 0) => ((t + k) % 3.1) < 0.1;
const pop = (t, a, d = 0.25) => eob(seg(t, a, a + d));
const shadowBlob = (x, y, rx, ry, a = 0.35) => blur(12, () => { ctx.fillStyle = `rgba(20,12,6,${a})`; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.3); ctx.fill(); });
const label = (txt, x, y, size, rot = 0, col = INK) => at(x, y, rot, 1, () => hand(txt, 0, 0, size, txt.length * 7, col));

// ── shared sets ──────────────────────────────────────────────────────────
function office(t, dark = 0) {
  grad([[0, '#abc9de'], [0.45, '#94afc4'], [1, '#62778a']], 0, 0, 0, 1220, 0, 0, W, 1220);
  if (dark) { ctx.fillStyle = `rgba(20,30,50,${dark})`; ctx.fillRect(0, 0, W, 1220); }
}
function desk(y = 1198) {
  F(rectD(-30, y, 1140, 1960 - y), '#6e4c33', { line: 9, seed: 320, shadowCol: '#1c0c04', shadow: 0.35, shadowD: rectD(-30, y, 1140, 30), hi: 0.08, soft: 0 });
  grad([[0, 'rgba(120,80,50,0)'], [1, 'rgba(30,15,6,0.4)']], 0, y, 0, 1920, 0, y + 6, W, 1920 - y);
  for (let i = 0; i < 16; i++) { const yy = y + 38 + i * 44 + 14 * hash(i), x0 = hash(i * 3) * 700 - 100; Ln(sm([[x0, yy], [x0 + 140, yy - 4 + 6 * vn(i)], [x0 + 300 + 200 * hash(i * 5), yy + 2]], false), 2.6, 400 + i, 'rgba(35,18,8,0.55)'); }
  Ln(`M -20 ${y + 8} L 1100 ${y + 8}`, 3, 420, 'rgba(255,220,180,0.35)');
}
function beachSky(top, bot) { grad([[0, top], [1, bot]], 0, 0, 0, 1100, 0, 0, W, 1120); }
function sand(y, col = '#ecd59c', sh = '#b4914e') {
  const d = sm([[-60, y + 30], [300, y - 10], [700, y + 10], [1140, y - 20], [1140, 1980], [-60, 1980]]);
  F(d, col, { line: 8, seed: 800, shadow: 0, hi: 0.1, soft: 0 });
  ctx.save(); clipTo(d); blur(30, () => { ctx.fillStyle = sh; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(200, 1700, 600, 160, -0.1, 0, 6.3); ctx.fill(); ctx.beginPath(); ctx.ellipse(950, 1500, 400, 90, 0.1, 0, 6.3); ctx.fill(); });
  for (let i = 0; i < 30; i++) { const x = hash(i * 5) * W, yy = y + 80 + hash(i * 7) * 700; Ln(sm([[x, yy], [x + 16, yy - 4], [x + 30, yy]], false), 2.5, 801 + i, 'rgba(150,110,50,0.5)'); } ctx.restore();
}
function sea(y, col = '#6fb3cf', t = 0) {
  F(rectD(-40, y, 1160, 140), col, { line: 0, shadow: 0, hi: 0, soft: 0, tex: 0.08 });
  for (let i = 0; i < 9; i++) { const x = ((i * 140 + t * 30) % 1260) - 100; Ln(sm([[x, y + 40 + (i % 3) * 30], [x + 30, y + 34 + (i % 3) * 30], [x + 60, y + 40 + (i % 3) * 30]], false), 3, 810 + i, 'rgba(255,255,255,0.7)'); }
}
function rifle(x, y, rot) { at(x, y, rot, 1, () => { F(sm([[-60, -10], [180, -12], [182, 4], [40, 8], [10, 30], [-70, 26]]), '#5a3a22', { line: 6, seed: 820, shadow: 0.3, hi: 0.25 }); F(rectD(60, -18, 200, 12, 4), '#3a3a3e', { line: 5, seed: 821, shadow: 0.2, hi: 0.3 }); }); }
function wallMap(x, y, w, h, t, inner) { // framed map hanging on a wall
  blur(18, () => { ctx.fillStyle = 'rgba(20,10,4,0.45)'; ctx.fillRect(x + 16, y + 24, w, h); });
  F(rectD(x - 18, y - 18, w + 36, h + 36, 6), '#8a5a34', { line: 8, seed: 830, shadowCol: '#2a1206', shadow: 0.35, hi: 0.3 });
  F(rectD(x, y, w, h), '#a9cbe0', { line: 6, seed: 831, shadow: 0, hi: 0.1, soft: 0, tex: 0.12 });
  ctx.save(); clipTo(rectD(x, y, w, h)); inner(); ctx.restore();
}
function tank(x, y, s, col = '#4a5040', rot = 0) { at(x, y, rot, s, () => {
  F(sm([[-90, 10], [90, 10], [104, 34], [80, 56], [-80, 56], [-104, 34]]), '#2c2a28', { line: 6, seed: 840, shadow: 0.2, hi: 0.2 });
  for (let i = 0; i < 5; i++) F(ell(-64 + i * 32, 34, 12, 12), '#5a5652', { line: 3.5, seed: 841 + i, shadow: 0.2 });
  F(sm([[-80, -26], [80, -26], [92, 12], [-92, 12]]), col, { line: 6, seed: 846, shadow: 0.35, hi: 0.3 });
  F(sm([[-40, -64], [36, -64], [48, -24], [-50, -24]]), col, { line: 6, seed: 847, shadow: 0.35, hi: 0.3 });
  F(rectD(40, -54, 110, 14, 6), '#3a3e36', { line: 5, seed: 848, shadow: 0.2 }); }); }

// ── S4 11.1 "letting Britain breathe after Dunkirk" ─────────────────────
function s4(t) { const lt = t - 11.1; setSkin('#f7f4ef');
  ctx.save(); cam(lerp(1.0, 1.05, seg(t, 11.1, 13.2)), W / 2, H * 0.5);
  beachSky('#9fc4dc', '#e9eef0'); puff(160, 260, 90, '#ffffff', 'rgba(150,170,190,0.4)', 3); puff(860, 180, 70, '#ffffff', 'rgba(150,170,190,0.4)', 7, 4);
  sea(980, '#6aa8c6', t); F(sm([[640, 1010], [760, 1000], [740, 1040], [660, 1040]]), '#5a5e66', { line: 5, seed: 850, shadow: 0.3 }); F(rectD(690, 950, 16, 60), '#5a5e66', { line: 4, seed: 851, shadow: 0.2 });
  sand(1110);
  at(870, 1160, 4, 1, () => { F(rectD(-10, 0, 20, 240, 4), '#6b4a30', { line: 5, seed: 852, shadow: 0.3 }); F(rectD(-150, -70, 300, 90, 8), '#9a7450', { line: 6, seed: 853, shadow: 0.25, hi: 0.2 }); hand('DUNKIRK', 0, -24, 50, 3, '#2b2220'); });
  const breath = seg(t, 11.78, 12.6), out = seg(t, 12.4, 13.2);
  person({ x: 470, y: 1460, s: 1.15, legs: true, stance: 44, outfit: 'khaki', mood: out > 0 ? 'happy' : 'neutral', t, blink: blink(t), armF: [10, 6], armB: [10, 6], lean: -2 * breath, headTilt: -6 * breath });
  if (out > 0) { ctx.save(); ctx.globalAlpha = 1 - seg(t, 12.9, 13.2) * 0.6; puff(470 + 150 + 120 * out, 1500 - 400, 46 + 30 * out, '#ffffff', 'rgba(150,170,190,0.45)', 11, 4); ctx.restore(); }
  ctx.restore(); }

// ── S5 13.2 "declaring war on the US for no reason" ─────────────────────
function s5(t) { setSkin('#f7f4ef');
  ctx.save(); const shake = t > 13.62 && t < 13.9 ? Math.sin(t * 90) * 8 * (1 - seg(t, 13.62, 13.9)) : 0; ctx.translate(shake, 0); cam(lerp(1.0, 1.06, seg(t, 13.2, 16.7)), W / 2, H * 0.55);
  office(t);
  // US flag on a little desk stand + the declaration
  const slam = t < 13.62 ? -eio(seg(t, 13.2, 13.55)) : 0, shrug = eo(seg(t, 15.0, 15.4));
  person({ x: 540, y: 1360, s: 1.3, outfit: 'leader', mood: shrug > 0 ? 'sly' : 'frown', t, blink: blink(t), softHead: true,
    armF: [lerp(lerp(30, 120, -slam), 70, shrug), lerp(lerp(60, 30, -slam), 70, shrug)], armB: [lerp(20, 70, shrug), lerp(30, 70, shrug)] });
  desk(1300);
  at(560, 1470, -3, 1, () => { blur(8, () => { ctx.fillStyle = 'rgba(25,12,4,0.45)'; ctx.fillRect(-250, -100, 520, 260); });
    F(rectD(-250, -120, 500, 250, 4), '#f1ead8', { line: 6, seed: 860, shadow: 0.12, soft: 0.15 }); hand('DECLARATION', 0, -70, 48, 4); hand('OF WAR', 0, -16, 48, 8);
    for (let i = 0; i < 3; i++) Ln(`M -180 ${40 + i * 26} L ${160 - i * 40} ${40 + i * 26}`, 3, 861 + i, 'rgba(60,40,30,0.5)');
    if (t > 13.62) { const k = pop(t, 13.62, 0.2); at(130, 60, -12, lerp(1.8, 1, k), () => { ctx.globalAlpha = clamp(k * 2); F(rectD(-90, -40, 180, 80, 10), 'rgba(0,0,0,0)', { line: 0, shadow: 0, hi: 0, soft: 0, ink: false }); ctx.strokeStyle = '#c4302c'; ctx.lineWidth = 8; ctx.strokeRect(-90, -40, 180, 80); hand('WAR!', 0, 2, 58, 9, '#c4302c'); }); } });
  at(860, 1380, 0, 1, () => { F(rectD(-6, -240, 12, 250, 3), '#6b4a30', { line: 4, seed: 862, shadow: 0.2 }); F(ell(0, 6, 50, 14), '#4a3020', { line: 5, seed: 863, shadow: 0.2 });
    const fw = (x, y) => [x, y + Math.sin(x * 0.03 - t * 5) * 6]; ctx.save(); clipTo(poly([fw(6, -236), fw(196, -236), fw(196, -110), fw(6, -110)]));
    for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#f4f1ea' : '#c4302c'; ctx.fillRect(0, -236 + i * 18, 210, 18); } ctx.fillStyle = '#24387a'; ctx.fillRect(0, -240, 90, 72); ctx.restore();
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) star(16 + c * 26, -222 + r * 22, 6, '#fff'); Ln(poly([fw(6, -236), fw(196, -236), fw(196, -110), fw(6, -110)]), 5, 864); });
  if (t > 13.62 && t < 14.1) { ctx.save(); ctx.globalAlpha = 1 - seg(t, 13.62, 14.1); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; Ln(`M ${560 + Math.cos(a) * 280} ${1440 + Math.sin(a) * 120} L ${560 + Math.cos(a) * 360} ${1440 + Math.sin(a) * 160}`, 6, 870 + i); } ctx.restore(); }
  if (shrug > 0) { ctx.save(); ctx.globalAlpha = shrug; label('?', 770, 620, 120, 8); ctx.restore(); }
  ctx.restore(); }

// ── S6 16.7 "So let's flip that" — the dial snaps back ──────────────────
function s6(t) { shot2(lerp(3.95, 5.65, seg(t, 16.7, 18.4))); }

// ── S7 18.4 "Germany invades the USSR in the summer" ────────────────────
function umbrella(x, y, rot, t) { at(x, y, rot, 1, () => { F(rectD(-7, -420, 14, 430, 4), '#d8d3c8', { line: 5, seed: 880, shadow: 0.3 });
  const cnp = sm([[-300, -380], [-200, -470], [0, -510], [200, -470], [300, -380], [150, -400], [0, -396], [-150, -400]]); F(cnp, '#f4f1ea', { line: 8, seed: 881, shadow: 0.25, hi: 0.2 });
  ctx.save(); clipTo(cnp); for (let i = -3; i < 3; i += 2) { ctx.fillStyle = '#d9473f'; ctx.beginPath(); ctx.moveTo(0, -510); ctx.lineTo(i * 100, -380); ctx.lineTo((i + 1) * 100, -380); ctx.closePath(); ctx.fill(); } ctx.restore(); Ln(cnp, 8, 882); }); }
function s7(t) { setSkin('#f7f4ef');
  ctx.save(); cam(lerp(1.02, 1.0, seg(t, 18.4, 20.5)), W / 2, H * 0.5);
  beachSky('#7fb8e0', '#e6f1f6'); F(ell(860, 230, 80, 80), '#fff6c8', { line: 0, shadow: 0, hi: 0, soft: 0 }); blur(30, () => { ctx.fillStyle = 'rgba(255,240,180,0.6)'; ctx.beginPath(); ctx.arc(860, 230, 150, 0, 6.3); ctx.fill(); });
  sea(900, '#5ea7cf', t); sand(1040);
  at(720, 1500, 0, 1.45, () => umbrella(0, 0, 6, t));
  const duck = eo(seg(t, 19.3, 19.6));
  person({ x: 760, y: 1470 + duck * 40, s: 1.0, outfit: 'soviet', mood: duck ? 'scared' : 'happy', t, blink: blink(t, 1), armF: [lerp(20, 150, duck), lerp(40, 20, duck)], armB: [lerp(20, 150, duck), lerp(30, 20, duck)], legs: true, stance: 40 });
  const walk = eio(seg(t, 18.4, 19.3)), bobw = Math.abs(Math.sin(t * 10)) * 10 * (1 - seg(t, 19.2, 19.3));
  person({ x: lerp(-80, 270, walk), y: 1560 - bobw, s: 1.05, outfit: 'grey', mood: 'frown', t, blink: blink(t), armF: [70, 20], armB: [60, 40], legs: true, stance: 50, prop: (x, y) => rifle(x - 20, y, -4) });
  ctx.restore(); }
// ── S8 20.5 "finishes them off" ─────────────────────────────────────────
function s8(t) { setSkin('#e6e5ea');
  ctx.save(); cam(lerp(1.0, 1.05, seg(t, 20.5, 21.6)), W / 2, H * 0.5);
  beachSky('#5f6b7c', '#b8bfc6'); for (let i = 0; i < 5; i++) puff(i * 260 - 40, 160 + 60 * hash(i), 120, '#7a8496', 'rgba(40,46,60,0.5)', 900 + i, 5);
  sea(900, '#4d7488', t); sand(1040, '#c9b98e', '#7d6a40');
  umbrella(840, 1580, 72, t); F(sm([[540, 1600], [640, 1590], [660, 1620], [530, 1630]]), '#5a5856', { line: 6, seed: 901, shadow: 0.3 });
  person({ x: 420, y: 1500, s: 1.1, outfit: 'grey', mood: 'smug', t, blink: blink(t), armF: [10, 8], armB: [10, 8], legs: true, stance: 46 });
  ctx.restore(); }
// ── S9 21.6 "blitzes Britain before they regroup" ───────────────────────
function boom(x, y, r, k, seed) { if (k <= 0 || k >= 1) return; const a = 1 - seg(k, 0.6, 1);
  ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < 9; i++) { const ang = i / 9 * 6.28 + seed, d = r * 0.55 * eo(k); const rr = r * (0.38 + 0.2 * hash(seed + i)) * eo(seg(k, 0, 0.4));
    F(ell(x + Math.cos(ang) * d, y + Math.sin(ang) * d * 0.8, rr, rr), i % 3 ? '#f2a03a' : '#e45b2c', { line: 6, seed: seed + i, shadowCol: '#8a2a0c', shadow: 0.35, hi: 0.4 }); }
  F(ell(x, y, r * 0.42 * eo(seg(k, 0, 0.3)), r * 0.42 * eo(seg(k, 0, 0.3))), '#ffe08a', { line: 6, seed: seed + 20, shadow: 0.2, hi: 0.6 });
  for (let i = 0; i < 14; i++) { const ang = hash(seed + i * 3) * 6.28, d = r * 1.4 * eo(k); F(ell(x + Math.cos(ang) * d, y + Math.sin(ang) * d - 60 * k, 9, 9), '#4a3020', { line: 3, seed: seed + 40 + i, shadow: 0 }); } ctx.restore(); }
function s9(t) { setSkin('#f7f4ef');
  ctx.save(); const sh = Math.max(0, 1 - seg(t, 22.0, 22.6)) * (t > 22.0 ? 1 : 0); ctx.translate(Math.sin(t * 80) * 12 * sh, Math.cos(t * 70) * 8 * sh); cam(1.02, W / 2, H * 0.5);
  beachSky('#8a9db0', '#d9dde0'); sea(900, '#5d8ca6', t); sand(1040, '#d9c48e', '#8d7646');
  at(300, 1250, -6, 1, () => { F(rectD(-10, 0, 20, 230, 4), '#6b4a30', { line: 5, seed: 910, shadow: 0.3 }); F(rectD(-150, -70, 300, 90, 8), '#9a7450', { line: 6, seed: 911, shadow: 0.25, hi: 0.2 }); hand('DUNKIRK', 0, -24, 50, 3); });
  const run = seg(t, 22.1, 23.8);
  person({ x: lerp(640, 1240, run), y: 1560 - Math.abs(Math.sin(t * 12)) * 16 * (run > 0 ? 1 : 0), s: 1.0, outfit: 'khaki', mood: 'scared', t, blink: false, armF: [lerp(20, 70, run), 60], armB: [lerp(20, 60, run), 70], legs: true, stance: run > 0 ? 70 * Math.sin(t * 12) : 40, lean: run > 0 ? 10 : 0 });
  boom(330, 1100, 320, seg(t, 21.95, 23.3), 920); boom(820, 980, 200, seg(t, 22.5, 23.7), 960);
  ctx.restore(); }

// ── S10 23.8 "makes peace with the US. It's wild but honestly doable." ──
function bookshelf(x, y, w, h) { F(rectD(x, y, w, h, 4), '#7a5032', { line: 7, seed: 970, shadowCol: '#2a1206', shadow: 0.35, hi: 0.15 });
  for (let r = 0; r < 4; r++) { const yy = y + 20 + r * (h - 20) / 4; F(rectD(x + 14, yy + (h - 20) / 4 - 16, w - 28, 14), '#5e3c22', { line: 4, seed: 971 + r, shadow: 0.2 });
    let xx = x + 18; for (let i = 0; xx < x + w - 40; i++) { const bw = 18 + 16 * hash(r * 20 + i), bh = (h - 20) / 4 - 30 - 20 * hash(r * 7 + i); F(rectD(xx, yy + (h - 20) / 4 - 16 - bh, bw, bh, 2), ['#9b3a32', '#3d5a7a', '#5a7a3d', '#c9a95a', '#6a4a7a'][(r + i) % 5], { line: 3.5, seed: 980 + r * 30 + i, shadow: 0.25, hi: 0.2, soft: 0 }); xx += bw + 3; } } }
function s10(t) { setSkin('#f7f4ef');
  ctx.save(); cam(lerp(1.0, 1.05, seg(t, 23.8, 28.5)), W / 2, H * 0.5);
  grad([[0, '#e6d9b8'], [1, '#c9b48a']], 0, 0, 0, 1300, 0, 0, W, 1320); bookshelf(20, 260, 300, 900); bookshelf(760, 260, 300, 900);
  wallMap(380, 300, 330, 260, t, () => { europe([380, 300, -12, 72, 9], [{ pts: GERMANY, col: '#c43a30' }]); });
  F(rectD(-30, 1300, 1140, 700), '#5a4030', { line: 8, seed: 990, shadow: 0.3, shadowD: rectD(-30, 1300, 1140, 40) });
  const shake = Math.sin(t * 9) * 4 * (t > 24.1 ? 1 : 0), nod = t > 25.5 ? 3 * Math.sin(t * 5) : 0;
  person({ x: 320, y: 1340, s: 1.2, outfit: 'leader', mood: 'smug', t, blink: blink(t), softHead: true, armF: [70, 6 + shake * 0.3], armB: [10, 6], headTilt: nod });
  person({ x: 760, y: 1340, s: 1.2, outfit: 'sam', mood: t > 25.4 ? 'happy' : 'neutral', t, blink: blink(t, 1.3), flip: true, armF: [70, 6 + shake * 0.3], armB: [10, 6], softHead: true });
  F(sm([[500, 1078 + shake], [580, 1070 + shake], [600, 1100 + shake], [560, 1124 + shake], [500, 1116 + shake]]), '#f7f4ef', { line: 6, seed: 995, shadow: 0.25, shadowCol: SKIN_SH });
  for (const k of [0, 1, 2]) Ln(`M ${520 + k * 18} ${1084 + shake} L ${528 + k * 18} ${1112 + shake}`, 2.6, 996 + k, 'rgba(40,32,40,0.7)');
  ctx.restore(); }

// ── S11 28.5 "Ireland was neutral … worry about the Irish" ──────────────
function pine(x, y, s, col) { at(x, y, 0, s, () => { for (let i = 0; i < 3; i++) F(poly([[0, -300 + i * 80], [130 - i * 10, -120 + i * 70], [-130 + i * 10, -120 + i * 70]]), col, { line: 6, seed: x + i, shadow: 0.35, shadowCol: '#0e1e10', soft: 0.3 }); F(rectD(-16, 30, 32, 60), '#4a3020', { line: 5, seed: x + 9, shadow: 0.3 }); }); }
function unionFlag(x, y, w, h, t) { const fw = (a, b) => [x + a, y + b + Math.sin(a * 0.04 - t * 5) * 8 * (a / w)];
  const d = poly([fw(0, 0), fw(w, 0), fw(w, h), fw(0, h)]); F(d, '#24387a', { line: 6, seed: 1001, shadow: 0.2, soft: 0.2 });
  ctx.save(); clipTo(d); ctx.strokeStyle = '#f4f1ea'; ctx.lineWidth = h * 0.2; ctx.beginPath(); ctx.moveTo(...fw(0, 0)); ctx.lineTo(...fw(w, h)); ctx.moveTo(...fw(w, 0)); ctx.lineTo(...fw(0, h)); ctx.stroke();
  ctx.strokeStyle = '#c4302c'; ctx.lineWidth = h * 0.07; ctx.stroke(); ctx.lineWidth = h * 0.3; ctx.strokeStyle = '#f4f1ea'; ctx.beginPath(); ctx.moveTo(...fw(w / 2, 0)); ctx.lineTo(...fw(w / 2, h)); ctx.moveTo(...fw(0, h / 2)); ctx.lineTo(...fw(w, h / 2)); ctx.stroke();
  ctx.lineWidth = h * 0.17; ctx.strokeStyle = '#c4302c'; ctx.stroke(); ctx.restore(); Ln(d, 5, 1002); }
function s11(t) { setSkin('#ecebef');
  const night = seg(t, 32.4, 33.4) * 0.45;
  ctx.save(); cam(lerp(1.0, 1.08, seg(t, 28.5, 35.5)), W / 2, H * 0.55);
  grad([[0, '#a6c4b4'], [1, '#e4ead8']], 0, 0, 0, 1100, 0, 0, W, 1120);
  for (let i = 0; i < 9; i++) pine(i * 130 - 20, 620 + 40 * hash(i), 1.5 + 0.4 * hash(i * 3), i % 2 ? '#2f5a36' : '#3a6a40');
  F(sm([[-60, 900], [500, 860], [1140, 890], [1140, 1980], [-60, 1980]]), '#6f9a4c', { line: 8, seed: 1010, shadow: 0, soft: 0, hi: 0.1 });
  // Irish soldiers relaxing behind the fence, with a tricolour
  at(330, 760, 0, 1, () => { F(rectD(-5, 0, 10, 220, 3), '#6b4a30', { line: 4, seed: 1011, shadow: 0.2 }); for (const [i, c] of [[0, '#3f8a4a'], [1, '#f4f1ea'], [2, '#e88a3a']]) F(rectD(5 + i * 44, 0, 44, 90), c, { line: 0, shadow: 0.1, hi: 0, soft: 0 }); Ln(rectD(5, 0, 132, 90), 5, 1012); });
  person({ x: 240, y: 1180, s: 0.9, outfit: 'irish', mood: 'happy', t, blink: blink(t, 0.4), armF: [150, 30], armB: [20, 10] });
  person({ x: 520, y: 1190, s: 0.86, outfit: 'irish', mood: 'neutral', t, blink: blink(t, 1.7), armF: [20, 120], armB: [10, 10], headTilt: 6 });
  // wooden fence
  for (let i = 0; i < 8; i++) F(rectD(i * 150 - 10, 1080, 28, 260, 4), '#9a6e44', { line: 6, seed: 1020 + i, shadow: 0.3, hi: 0.2 });
  for (const y of [1130, 1240]) F(rectD(-30, y, 1140, 34, 6), '#a77a4c', { line: 6, seed: 1030 + y, shadow: 0.3, hi: 0.2 });
  for (let i = 0; i < 7; i++) Ln(`M ${i * 150 + 18} 1164 L ${i * 150 + 140} 1240`, 6, 1040 + i, '#7a5232');
  at(900, 980, 0, 1, () => { F(rectD(-6, -100, 12, 520, 3), '#d8d3c8', { line: 4, seed: 1050, shadow: 0.3 }); }); unionFlag(906, 880, 170, 100, t);
  // our soldier hurries past in the foreground, hops on "hopped"
  const hop = seg(t, 31.28, 31.9), hy = -Math.sin(Math.PI * hop) * 260, x = lerp(lerp(-200, 360, eio(seg(t, 28.5, 31.2))), 1300, eio(hop));
  person({ x, y: 1720 + hy, s: 1.4, outfit: 'grey', mood: t > 33.8 ? 'smug' : 'sly', t, blink: blink(t), armF: [hop > 0 ? 150 : 30, 20], armB: [hop > 0 ? 140 : 20, 20], legs: true, stance: hop > 0 ? 80 : 40 * Math.sin(t * 10), lean: hop > 0 ? 12 : 4 });
  if (t > 31.9) person({ x: 800, y: 1760, s: 1.4, outfit: 'grey', mood: t > 34.4 ? 'happy' : 'smug', t, blink: blink(t), armF: [40, 60], armB: [20, 10], legs: true, stance: 50 });
  ctx.restore(); if (night) { ctx.fillStyle = `rgba(10,20,40,${night})`; ctx.fillRect(0, 0, W, H); } }

// ── S12 35.5 "early in the war, much of the US public was weirdly pro-German" ──
function s12(t) { setSkin('#f7f4ef');
  ctx.save(); cam(lerp(1.0, 1.06, seg(t, 35.5, 40.9)), W / 2, H * 0.55);
  grad([[0, '#9ec8e6'], [1, '#e8f2f6']], 0, 0, 0, 800, 0, 0, W, 820);
  F(poly([[-40, 380], [540, 120], [1120, 380]]), '#5a6a8a', { line: 8, seed: 1100, shadow: 0.3, soft: 0.3 });
  F(rectD(0, 360, W, 900), '#4a6aa0', { line: 8, seed: 1101, shadow: 0.25, shadowD: rectD(0, 360, W, 40), soft: 0.2 });
  for (let i = 0; i < 22; i++) Ln(`M 0 ${400 + i * 38} L 1080 ${400 + i * 38}`, 2.5, 1102 + i, 'rgba(20,30,60,0.45)');
  for (const x of [80, 820]) { F(rectD(x, 470, 180, 220, 4), '#dfe8ee', { line: 7, seed: 1130 + x, shadow: 0.2, hi: 0.3 }); Ln(`M ${x + 90} 470 L ${x + 90} 690 M ${x} 580 L ${x + 180} 580`, 5, 1131 + x); }
  F(rectD(440, 520, 200, 380, 6), '#7a4a2e', { line: 7, seed: 1140, shadow: 0.3, hi: 0.2 }); F(ell(610, 720, 10, 10), '#d8b45a', { line: 3, seed: 1141, shadow: 0 });
  F(rectD(-20, 900, 1120, 60), '#e8e4dc', { line: 7, seed: 1142, shadow: 0.2 }); for (let i = 0; i < 18; i++) F(rectD(i * 62, 960, 22, 200, 3), '#f2efe8', { line: 4, seed: 1150 + i, shadow: 0.2 }); F(rectD(-20, 1080, 1120, 26), '#e8e4dc', { line: 5, seed: 1170, shadow: 0.2 });
  // US flag on the porch
  at(980, 240, 18, 1, () => { F(rectD(-6, 0, 12, 380, 3), '#d8d3c8', { line: 4, seed: 1171, shadow: 0.2 }); });
  const fx = 990, fy = 260; ctx.save(); const fw = (a, b) => [fx + a, fy + b + Math.sin(a * 0.04 - t * 5) * 6]; const fd = poly([fw(0, 0), fw(150, 0), fw(150, 96), fw(0, 96)]); clipTo(fd);
  for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#f4f1ea' : '#c4302c'; ctx.fillRect(fx, fy - 10 + i * 16, 170, 16); } ctx.fillStyle = '#24387a'; ctx.fillRect(fx, fy - 10, 66, 58); ctx.restore(); Ln(fd, 5, 1172);
  F(sm([[-60, 1160], [1140, 1160], [1140, 1980], [-60, 1980]]), '#7aa652', { line: 0, shadow: 0, soft: 0, hi: 0.1 });
  // banner on the railing
  at(250, 1000, -4, 1, () => { F(sm([[-170, -60], [170, -66], [176, 60], [-166, 66]]), '#c4302c', { line: 7, seed: 1180, shadow: 0.25, hi: 0.2 }); hand('GERMANY', 0, -18, 52, 5, '#f4f1ea'); hand('#1', 0, 36, 44, 6, '#f4f1ea'); });
  const cheer = t > 38.0;
  person({ x: 560, y: 1640, s: 1.45, outfit: 'civ', mood: t > 39.1 ? 'happy' : 'neutral', t, blink: blink(t), armF: cheer ? [150 + 10 * Math.sin(t * 8), 20] : [12, 150], armB: [12, 140], talk: t > 36.5 && t < 38.0 });
  ctx.restore(); }

// ── S13 40.9 "If the Nazis hadn't opened the gas chambers, maybe the sympathy would have lasted." ──
function s13(t) { setSkin('#efeef2');
  ctx.save(); cam(lerp(1.0, 1.06, seg(t, 40.9, 45.6)), W / 2, H * 0.5);
  grad([[0, '#4a4440'], [1, '#2a2624']], 0, 0, 0, H); blur(60, () => { ctx.fillStyle = 'rgba(255,230,190,0.25)'; ctx.beginPath(); ctx.ellipse(540, 700, 420, 520, 0, 0, 6.3); ctx.fill(); });
  // crate of hate mail
  F(sm([[160, 760], [920, 760], [960, 1500], [120, 1500]]), '#8a6a44', { line: 9, seed: 1200, shadowCol: '#2a1806', shadow: 0.4, hi: 0.15 });
  F(sm([[180, 300], [900, 300], [920, 760], [160, 760]]), '#a5845a', { line: 9, seed: 1201, shadowCol: '#2a1806', shadow: 0.3, shadowD: rectD(160, 300, 760, 90), hi: 0.15 });
  hand('HATE MAIL', 540, 380, 72, 11, '#b52a24');
  const fill = seg(t, 41.6, 45.0);
  for (let i = 0; i < 26; i++) { const k = clamp(fill * 30 - i), x = 200 + hash(i * 3) * 660, y = lerp(-200, 760 - 40 * (i / 26) * 6 - 20 * hash(i), eo(k)); if (k <= 0) continue;
    at(x, y, (hash(i * 7) - 0.5) * 50, 1, () => { F(rectD(-80, -48, 160, 96, 4), '#f1ead8', { line: 5, seed: 1210 + i, shadow: 0.15, soft: 0.15 }); Ln(sm([[-76, -44], [0, 6], [76, -44]], false), 3, 1250 + i); }); }
  person({ x: 540, y: 1700, s: 1.3, outfit: 'grey', mood: t > 43.9 ? 'sad' : 'scared', t, blink: blink(t), armF: [20, 100], armB: [12, 8], prop: (x, y) => at(x, y - 20, -10, 1, () => { F(rectD(-80, -50, 160, 100, 4), '#f1ead8', { line: 5, seed: 1290, shadow: 0.15 }); Ln(sm([[-76, -46], [0, 4], [76, -46]], false), 3, 1291); }) });
  ctx.restore(); }

// ── S14 45.6 "so now the Reich grows from this to this" ─────────────────
function s14(t) { setSkin('#f7f4ef');
  ctx.save(); cam(lerp(1.0, 1.04, seg(t, 45.6, 49.6)), W / 2, H * 0.4);
  grad([[0, '#8a7a62'], [1, '#5e5040']], 0, 0, 0, H);
  const grow = eio(seg(t, 47.9, 48.5)), first = pop(t, 47.5);
  wallMap(60, 140, 960, 1080, t, () => { europe([60, 140, -11, 71, 25], [{ pts: GERMANY, col: '#c43a30', alpha: clamp(first * 1.2) }, { pts: REICH, col: '#c43a30', alpha: grow }]); });
  person({ x: 300, y: 1880, s: 1.6, outfit: 'grey', mood: t > 48.0 ? 'smug' : 'sly', t, blink: blink(t), armF: [lerp(60, 150, grow), 20], armB: [12, 8], headTilt: -6 });
  ctx.restore(); }

// ── S15/S16 globe on a stand, a hand spins it; years roll back to Rome ──
function globeDesk(t, lon, lat, regions, spin, yearTxt, pointK) {
  grad([[0, '#6e5a46'], [1, '#3e3024']], 0, 0, 0, H); blur(60, () => { ctx.fillStyle = 'rgba(255,230,190,0.2)'; ctx.beginPath(); ctx.ellipse(540, 800, 500, 600, 0, 0, 6.3); ctx.fill(); });
  desk(1480);
  shadowBlob(540, 1520, 300, 50, 0.5);
  F(sm([[400, 1530], [680, 1530], [640, 1480], [440, 1480]]), '#8a5a2c', { line: 7, seed: 1300, shadow: 0.3, hi: 0.3 }); F(rectD(520, 1240, 40, 250, 6), '#a06a34', { line: 6, seed: 1301, shadow: 0.3, hi: 0.3 });
  globe(540, 880, 380, lon, lat, regions, { spin });
  const arc = sm([[130, 1140], [120, 860], [200, 560], [390, 440], [540, 410]], false); F(tube([[150, 1150], [124, 880], [190, 600], [370, 470], [540, 470]], 30, false), '#c99a48', { line: 6, seed: 1302, shadow: 0.3, hi: 0.5 }); void arc;
  if (yearTxt) { F(rectD(340, 150, 400, 110, 14), '#f1ead8', { line: 7, seed: 1303, shadow: 0.15 }); hand(yearTxt, 540, 206, 72, 4); }
  if (pointK > 0) { const px = lerp(1300, 600, eo(pointK)), py = lerp(1300, 860, eo(pointK)); F(tube([[px + 600, py + 520], [px + 120, py + 100], [px, py]], [220, 150, 70]), '#f7f4ef', { line: 8, seed: 1304, shadowCol: SKIN_SH, shadow: 0.3, soft: 0.25 }); }
}
function s15(t) { setSkin('#f7f4ef'); const swipe = seg(t, 50.0, 50.5), lon = 15 + 260 * eo(seg(t, 50.2, 52.4));
  ctx.save(); cam(1.0, W / 2, H / 2); globeDesk(t, lon, 30, [{ pts: REICH, col: '#c43a30' }], seg(t, 50.3, 50.8) * (1 - seg(t, 51.8, 52.4)) * 0.6, null, 0);
  if (swipe > 0 && swipe < 1) { const x = lerp(1300, -300, eio(swipe)); F(tube([[x + 700, 1500], [x + 200, 1000], [x, 900]], [260, 180, 110]), '#f7f4ef', { line: 8, seed: 1310, shadowCol: SKIN_SH, shadow: 0.3 }); }
  ctx.restore(); }
function s16(t) { setSkin('#f7f4ef');
  const k = eo(seg(t, 52.4, 55.6)), year = Math.round(lerp(1993, 117, k)), lon = lerp(-600, 15, k);
  ctx.save(); globeDesk(t, lon, 34, [{ pts: ROME, col: '#a8322c', alpha: seg(t, 55.5, 55.9) }, { pts: ROME_GB, col: '#a8322c', alpha: seg(t, 55.5, 55.9) }], (1 - seg(t, 54.8, 55.6)) * 0.7, (year > 1000 ? year : year + ' AD') + '', seg(t, 55.7, 56.2)); ctx.restore(); }

// ── S17 57.0 parchment map: "Too big to hold. Too many people forced under one flag." ──
function s17(t) { setSkin('#f7f4ef');
  ctx.save(); cam(lerp(1.0, 1.05, seg(t, 57.0, 60.6)), W / 2, H * 0.5);
  grad([[0, '#4a3828'], [1, '#2e2218']], 0, 0, 0, H);
  const paper = sm([[60, 380], [520, 350], [1030, 390], [1050, 1250], [560, 1290], [40, 1260]]);
  F(paper, '#e6d6ac', { line: 8, seed: 1400, shadowCol: '#6a4a1a', shadow: 0.25, soft: 0.3, hi: 0.2 });
  ctx.save(); clipTo(paper); const split = seg(t, 58.4, 58.9);
  europe([60, 330, -12, 58, 22], [{ pts: ROME, col: '#a8322c' }, { pts: ROME_GB, col: '#a8322c' }, { pts: [[19, 48], [60, 48], [60, 20], [19, 20]], col: '#7a3a8a', alpha: split }], { land: '#efe2bf' }); ctx.restore();
  blur(20, () => { ctx.fillStyle = 'rgba(80,50,10,0.25)'; ctx.fillRect(60, 360, 980, 60); });
  if (split > 0) { ctx.save(); ctx.globalAlpha = split; hand('395 AD', 760, 1200, 56, 6, '#3a2410'); ctx.restore(); }
  // candle + sword
  F(rectD(110, 1340, 110, 260, 10), '#efe6cc', { line: 7, seed: 1401, shadow: 0.25, hi: 0.3 }); F(ell(165, 1600, 110, 26), '#b8954a', { line: 6, seed: 1402, shadow: 0.3, hi: 0.4 });
  const fl = 1 + 0.08 * Math.sin(t * 17); F(sm([[165, 1250 - 30 * fl], [190, 1300], [165, 1340], [140, 1300]]), '#ffc94a', { line: 4, seed: 1403, shadow: 0, hi: 0.5 }); blur(30, () => { ctx.fillStyle = 'rgba(255,200,100,0.35)'; ctx.beginPath(); ctx.arc(165, 1290, 140, 0, 6.3); ctx.fill(); });
  at(640, 1620, -10, 1, () => { F(sm([[-300, -16], [200, -16], [260, 0], [200, 16], [-300, 16]]), '#c9ccd0', { line: 6, seed: 1404, shadow: 0.3, hi: 0.5 }); F(rectD(-340, -50, 30, 100, 6), '#8a6a2a', { line: 5, seed: 1405, shadow: 0.3 }); F(rectD(-440, -14, 100, 28, 8), '#5a3a1a', { line: 5, seed: 1406, shadow: 0.3 }); });
  ctx.restore(); }

// ── S18 60.6 passport + eagle stamp, the city burns on "harmony" ─────────
function eagle(x, y, s, col) { at(x, y, 0, s, () => { F(sm([[-120, -20], [-60, -60], [-20, -30], [0, -70], [20, -30], [60, -60], [120, -20], [60, 0], [30, 50], [0, 30], [-30, 50], [-60, 0]]), col, { line: 0, shadow: 0, hi: 0, soft: 0, tex: 0, ink: false }); }); }
function s18(t) { setSkin('#f7f4ef'); const burn = seg(t, 62.6, 63.2);
  ctx.save(); cam(lerp(1.0, 1.05, seg(t, 60.6, 63.7)), W / 2, H * 0.5);
  grad([[0, burn ? '#e07a3a' : '#9aa6b0'], [1, burn ? '#f2b45a' : '#d4d0c4']], 0, 0, 0, 900, 0, 0, W, 920);
  for (let i = 0; i < 6; i++) { const x = i * 190 - 20; F(rectD(x, 520 + 60 * hash(i), 150, 600), '#b9a88a', { line: 6, seed: 1500 + i, shadow: 0.35, soft: 0.3 }); for (let c = 0; c < 3; c++) F(rectD(x + 14 + c * 46, 620 + 60 * hash(i), 30, 120, 12), '#3e3428', { line: 4, seed: 1510 + i * 3 + c, shadow: 0 }); }
  F(rectD(-20, 1100, 1120, 900), '#7a6a52', { line: 0, shadow: 0, soft: 0 });
  if (burn) for (let i = 0; i < 8; i++) { const x = 60 + i * 130, h = (160 + 80 * Math.sin(t * 12 + i)) * burn; F(sm([[x - 50, 1120], [x, 1120 - h], [x + 50, 1120]]), i % 2 ? '#f2a03a' : '#e45b2c', { line: 5, seed: 1520 + i, shadow: 0.2, hi: 0.5 }); }
  // the passport held up
  at(520, 1200, -8, 1, () => { F(rectD(-300, -400, 600, 760, 20), '#8a2a28', { line: 9, seed: 1530, shadowCol: '#2a0606', shadow: 0.3, soft: 0.25 });
    F(rectD(-270, -370, 540, 700, 10), '#f1ead8', { line: 6, seed: 1531, shadow: 0.12, soft: 0.15 });
    hand('PASSPORT', 60, -300, 64, 3); F(rectD(-240, -220, 170, 200, 6), '#dfe6ea', { line: 6, seed: 1532, shadow: 0.1 }); F(ell(-155, -110, 56, 64), '#f7f4ef', { line: 5, seed: 1533, shadow: 0.2 }); F(ell(-175, -120, 6, 9), INK, { line: 0, shadow: 0, ink: false }); F(ell(-135, -120, 6, 9), INK, { line: 0, shadow: 0, ink: false }); Ln(sm([[-170, -84], [-155, -78], [-140, -84]], false), 4, 1534);
    for (let i = 0; i < 4; i++) Ln(`M -30 ${-180 + i * 40} L ${220 - i * 30} ${-180 + i * 40}`, 4, 1535 + i, 'rgba(60,40,30,0.5)');
    const st = pop(t, 61.04, 0.18); if (t > 61.04) at(40, 150, -14, lerp(1.6, 1, st), () => { ctx.globalAlpha = clamp(st * 2) * 0.9; ctx.strokeStyle = '#c4302c'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 150, 0, 6.3); ctx.stroke(); eagle(0, -10, 0.95, '#c4302c'); hand('ROME', 0, 96, 44, 2, '#c4302c'); });
    smallHand(-300, 300, 0.4, 2.6, 1540, 4, 1.0); });
  if (t > 60.9 && t < 61.2) { const k = seg(t, 60.9, 61.04); F(tube([[1300, -200], [lerp(1100, 700, k), lerp(-100, 1100, k)]], [200, 160]), '#f7f4ef', { line: 8, seed: 1541, shadow: 0.25, shadowCol: SKIN_SH }); }
  ctx.restore(); }

// ── S19/S20 pull-down map: "best case scenario?" → East / West Reich ────
function pulldown(t, unroll, inner) {
  grad([[0, '#c9a77a'], [1, '#9a7a52']], 0, 0, 0, H); for (let i = 0; i < 12; i++) Ln(`M ${i * 96} 0 L ${i * 96} ${H}`, 3, 1600 + i, 'rgba(90,60,30,0.35)');
  const h = 1180 * unroll; blur(16, () => { ctx.fillStyle = 'rgba(40,20,6,0.4)'; ctx.fillRect(84, 150, 920, h + 30); });
  F(rectD(70, 130, 940, 40, 18), '#6a4a2a', { line: 7, seed: 1610, shadow: 0.3, hi: 0.4 });
  F(rectD(90, 160, 900, Math.max(10, h)), '#efe6cc', { line: 7, seed: 1611, shadow: 0.1, soft: 0.2, hi: 0.15 });
  if (inner && unroll > 0.98) { ctx.save(); clipTo(rectD(100, 170, 880, h - 20)); inner(); ctx.restore(); }
  F(rectD(70, 150 + h, 940, 36, 16), '#6a4a2a', { line: 7, seed: 1612, shadow: 0.3, hi: 0.4 }); Ln(`M 540 ${186 + h} L 540 ${260 + h}`, 4, 1613); F(ell(540, 280 + h, 22, 22), '#c9a95a', { line: 5, seed: 1614, shadow: 0.3, hi: 0.4 });
}
function s19(t) { ctx.save(); cam(lerp(1.0, 1.03, seg(t, 63.7, 65.7)), W / 2, H * 0.4); pulldown(t, eob(seg(t, 63.8, 64.6)), null); ctx.restore(); }
const EASTR = [[24, 30], [60, 30], [60, 75], [24, 75]];
function s20(t) { ctx.save(); cam(lerp(1.0, 1.04, seg(t, 65.7, 70.5)), W / 2, H * 0.45);
  const sp = seg(t, 66.8, 67.3), east = seg(t, 68.2, 68.6), gap = 30 * eo(sp);
  pulldown(t, 1, () => {
    ctx.fillStyle = '#a9cbe0'; ctx.fillRect(100, 170, 880, 1160);
    ctx.save(); ctx.translate(-gap, 0); ctx.beginPath(); ctx.rect(0, 0, 100 + 880 * 0.52, H); ctx.clip(); europe([100, 170, -11, 71, 24], [{ pts: REICH, col: '#c43a30' }]); ctx.restore();
    ctx.save(); ctx.translate(gap, 0); ctx.beginPath(); ctx.rect(100 + 880 * 0.52, 0, W, H); ctx.clip(); europe([100, 170, -11, 71, 24], [{ pts: REICH, col: east ? `rgb(${lerp(196, 232, east) | 0},${lerp(58, 196, east) | 0},${lerp(48, 70, east) | 0})` : '#c43a30' }]); ctx.restore();
    if (sp > 0) Ln(`M ${100 + 880 * 0.52} 170 L ${100 + 880 * 0.52 + 20} 600 L ${100 + 880 * 0.52 - 16} 900 L ${100 + 880 * 0.52 + 10} 1330`, 6, 1620, `rgba(43,34,32,${sp})`);
    if (east) { ctx.save(); ctx.globalAlpha = east; hand('EAST', 760, 820, 76, 3); ctx.restore(); }
    const wl = seg(t, 69.4, 69.8); if (wl) { ctx.save(); ctx.globalAlpha = wl; hand('WEST', 360, 900, 76, 7, '#f4f1ea'); ctx.restore(); } });
  ctx.restore(); }

// ── S21 70.5 "One thrives, one will eventually rot. Same old imperial cycle." ──
function skeleton(x, y, s, t) { at(x, y, -70, s, () => {
  F(ell(0, -300, 90, 84), '#efe9da', { line: 7, seed: 1700, shadow: 0.25, soft: 0.2 }); for (const d of [-1, 1]) F(ell(d * 32, -306, 20, 24), '#2b2220', { line: 0, shadow: 0, ink: false }); F(poly([[-6, -270], [6, -270], [0, -256]]), '#2b2220', { line: 0, shadow: 0, ink: false }); for (let i = -2; i <= 2; i++) Ln(`M ${i * 14} -240 L ${i * 14} -222`, 4, 1701 + i);
  F(rectD(-8, -210, 16, 220, 6), '#efe9da', { line: 5, seed: 1710, shadow: 0.2 }); for (let i = 0; i < 4; i++) F(sm([[-70, -190 + i * 40], [0, -200 + i * 40], [70, -190 + i * 40], [66, -176 + i * 40], [0, -186 + i * 40], [-66, -176 + i * 40]]), '#efe9da', { line: 4.5, seed: 1720 + i, shadow: 0.2 });
  for (const d of [-1, 1]) { F(tube([[d * 30, 20], [d * 50, 150], [d * 46, 280]], 18, false), '#efe9da', { line: 4.5, seed: 1730 + d, shadow: 0.2 }); F(tube([[d * 70, -200], [d * 120, -90], [d * 100, 20]], 16, false), '#efe9da', { line: 4.5, seed: 1740 + d, shadow: 0.2 }); } }); }
function s21(t) { setSkin('#ecebef');
  ctx.save(); cam(lerp(1.0, 1.05, seg(t, 70.5, 74.9)), W / 2, H * 0.55);
  grad([[0, '#a9cde6'], [1, '#e6eef0']], 0, 0, 0, 800, 0, 0, W, 820); puff(200, 260, 90, '#fff', 'rgba(150,170,190,0.4)', 21); puff(860, 200, 70, '#fff', 'rgba(150,170,190,0.4)', 22, 4);
  F(sm([[-60, 760], [1140, 760], [1140, 1980], [-60, 1980]]), '#7aa652', { line: 0, shadow: 0, soft: 0, hi: 0.1 });
  F(poly([[500, 760], [580, 760], [900, 1980], [180, 1980]]), '#b59a72', { line: 7, seed: 1750, shadow: 0, soft: 0, hi: 0.1 });
  for (let i = 0; i < 6; i++) { const y0 = 800 + i * i * 34, y1 = y0 + 30 + i * 18; F(poly([[536 - i * 3, y0], [544 + i * 3, y0], [546 + i * 5, y1], [534 - i * 5, y1]]), '#c4302c', { line: 3, seed: 1751 + i, shadow: 0.2 }); }
  const sign = (x, y, txt, r) => at(x, y, r, 1, () => { F(rectD(-10, 0, 20, 200, 4), '#6b4a30', { line: 5, seed: x, shadow: 0.3 }); F(rectD(-120, -60, 240, 84, 8), '#9a7450', { line: 6, seed: x + 1, shadow: 0.25, hi: 0.2 }); hand(txt, 0, -18, 52, x); });
  sign(170, 1500, 'WEST', -6); sign(920, 1480, 'EAST', 5);
  const rot = seg(t, 71.6, 72.4);
  if (rot < 1) person({ x: 250, y: 1400, s: 1.1, outfit: 'grey', mood: 'sad', t, blink: blink(t), armF: [10, 8], armB: [10, 8], legs: true, stance: 40, lean: -60 * rot, });
  if (rot > 0) { ctx.save(); ctx.globalAlpha = rot; skeleton(240, 1700, 0.9, t); ctx.restore(); }
  person({ x: 820, y: 1380, s: 1.15, outfit: 'leader', mood: 'smug', t, blink: blink(t, 1), softHead: true, armF: [30, 110], armB: [12, 8], legs: true, stance: 40 });
  ctx.restore(); }

// ── S22 74.9 the rotting Reich breaks up; countries form and push on the other ──
const COUNTRIES = [{ pts: [[-6, 41], [8, 41], [8.5, 51.5], [-6, 51.5]], col: '#5a7ac4' }, { pts: [[14.5, 49], [24, 49], [24, 56], [14.5, 56]], col: '#d06a9a' }, { pts: [[2.5, 49.4], [7.2, 49.4], [7.2, 54], [2.5, 54]], col: '#e8a23a' },
  { pts: [[6.2, 47.2], [15, 47.2], [15, 55], [6.2, 55]], col: '#7a7a7a' }, { pts: [[12.5, 44], [24, 44], [24, 49], [12.5, 49]], col: '#9a5ac4' }, { pts: [[5, 55], [24, 55], [24, 72], [5, 72]], col: '#5aa47a' }];
function s22(t) { ctx.save(); cam(lerp(1.0, 1.04, seg(t, 74.9, 83.9)), W / 2, H * 0.45);
  const form = seg(t, 77.5, 78.8), tanks = seg(t, 79.8, 82.0), crack = seg(t, 82.3, 82.9);
  pulldown(t, 1, () => {
    ctx.fillStyle = '#a9cbe0'; ctx.fillRect(100, 170, 880, 1160);
    const regs = [{ pts: REICH, col: '#6e6e70' }, { pts: [[24, 30], [50, 30], [50, 66], [24, 66]], col: '#e8c446', alpha: 1 - 0.55 * crack }];
    COUNTRIES.forEach((c, i) => regs.push({ pts: c.pts.map(([a, b]) => [a, b]), col: c.col, alpha: clamp(form * 6 - i) }));
    const pr = europe([100, 170, -11, 71, 24], regs);
    if (crack > 0) { const [cx, cy] = pr(34, 52); for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; Ln(sm([[cx, cy], [cx + Math.cos(a) * 90 * crack, cy + Math.sin(a) * 90 * crack], [cx + Math.cos(a + 0.2) * 190 * crack, cy + Math.sin(a + 0.2) * 190 * crack]], false), 5, 1800 + i); } }
    if (tanks > 0) for (let i = 0; i < 4; i++) { const [x0, y0] = pr(16, 48 + i * 3), [x1, y1] = pr(26, 47 + i * 3.4); tank(lerp(x0, x1, eio(clamp(tanks * 1.4 - i * 0.12))), lerp(y0, y1, eio(clamp(tanks * 1.4 - i * 0.12))), 0.55, '#4a5040'); }
  });
  ctx.restore(); }

// ── S23 83.9 "And in the end, Germany is right back where it started." / S24 "time for world war three" ──
function s23(t) { setSkin('#f7f4ef'); const g = pop(t, 85.28, 0.3);
  ctx.save(); cam(lerp(1.08, 1.0, eo(seg(t, 83.9, 85.2))), W / 2, H * 0.45); globeDesk(t, 15, 48, [{ pts: GERMANY, col: '#c43a30', alpha: g }], 0, null, 0); ctx.restore(); }
function s24(t) { setSkin('#f7f4ef'); const sw = seg(t, 87.9, 88.4), lon = 15 + 900 * eo(seg(t, 88.1, 89.5));
  ctx.save(); globeDesk(t, lon, 48, [{ pts: GERMANY, col: '#c43a30' }], seg(t, 88.2, 88.5) * 0.85, null, 0);
  if (sw > 0 && sw < 1) { const x = lerp(1300, -300, eio(sw)); F(tube([[x + 700, 1500], [x + 200, 1000], [x, 900]], [260, 180, 110]), '#f7f4ef', { line: 8, seed: 1900, shadowCol: SKIN_SH, shadow: 0.3 }); }
  ctx.restore(); }

export const SHOTS2 = [[11.1, s4], [13.2, s5], [16.7, s6], [18.4, s7], [20.5, s8], [21.6, s9], [23.8, s10], [28.5, s11], [35.5, s12], [40.9, s13], [45.6, s14], [49.6, s15], [52.4, s16], [57.0, s17], [60.6, s18], [63.7, s19], [65.7, s20], [70.5, s21], [74.9, s22], [83.9, s23], [87.5, s24]];
