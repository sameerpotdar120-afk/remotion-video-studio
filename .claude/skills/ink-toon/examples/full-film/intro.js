// INK TOON v3: more detail and closer staging to the reference look (soft painted shading, thinner ink, 3/4 heads).
import { W, H, ctx, clamp, lerp, seg, eo, eio, eob, hash, vn, S, INK, P, ellD, rectD, F, stroke, Ln, grad, strokes, puff, grainAll, vignette, at, cam, sm, poly, tube, xform, caption, blur, hand } from './kit.js';

export let SKIN = '#f7f4ef'; export const setSkin = (c) => { SKIN = c; }; export const SKIN_SH0 = 0; let SKIN_SH = '#8a8698';
export const T = { s2: 2.38, s3: 6.18, leap: 9.42 };
export { SKIN_SH };
export const ell = (cx, cy, rx, ry) => ellD(cx, cy, rx, ry);
export const clipTo = (d) => { ctx.beginPath(); for (const s of P(d)) { ctx.moveTo(...s.pts[0]); for (const q of s.pts) ctx.lineTo(...q); ctx.closePath(); } ctx.clip(); };

export function eye(x, y, s, lid = 0, lidTilt = 0, look = [0, 0], skin = SKIN) {
  const ly = y - 21 * s + 40 * s * lid; ctx.save();
  if (lid > 0) { ctx.beginPath(); ctx.moveTo(x - 30 * s, ly - lidTilt * s); ctx.lineTo(x + 30 * s, ly + lidTilt * s); ctx.lineTo(x + 30 * s, y + 40 * s); ctx.lineTo(x - 30 * s, y + 40 * s); ctx.closePath(); ctx.clip(); }
  F(ell(x + look[0] * s, y + look[1] * s, 12 * s, 19 * s), INK, { shadow: 0, hi: 0, tex: 0, ink: false, soft: 0 });
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + (look[0] - 3.5) * s, y + (look[1] - 7) * s, 3.6 * s, 0, 6.3); ctx.fill(); ctx.restore();
  if (lid > 0) {
    Ln(sm([[x - 20 * s, ly - lidTilt * s + 2 * s], [x, ly - 2 * s], [x + 20 * s, ly + lidTilt * s + 2 * s]], false), 7 * s, x | 0); }
}
export const brow = (x0, y0, x1, y1, w = 9, seed = 0, bend = 0) => Ln(sm([[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 - bend], [x1, y1]], false), w, seed);
// a skin-tone head with soft grey form shading on the side away from the light
export function head(cx, cy, rx, ry, seed, shCol = '#7f7b90', shAmt = 0.32, softShade = false) {
  const d = ell(cx, cy, rx, ry);
  if (!softShade) F(d, SKIN, { line: 8, seed, shadow: shAmt, shadowCol: shCol, shadowD: ell(cx + rx * 0.42, cy + ry * 0.2, rx * 0.78, ry * 1.05), hi: 0.25, soft: 0.3 });
  else { F(d, SKIN, { line: 8, seed, shadow: 0, hi: 0.2, soft: 0.25, shadowCol: shCol }); ctx.save(); clipTo(d); blur(rx * 0.12, () => { ctx.fillStyle = 'rgba(110,105,130,0.38)'; ctx.beginPath(); ctx.ellipse(cx + rx * 0.95, cy + ry * 0.35, rx * 0.6, ry * 1.1, 0.2, 0, 6.3); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx, cy + ry * 1.05, rx * 1.1, ry * 0.35, 0, 0, 6.3); ctx.fill(); }); ctx.restore(); }
  ctx.save(); clipTo(d); blur(18, () => { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(cx - rx * 0.35, cy - ry * 0.25, rx * 0.4, ry * 0.45, -0.4, 0, 6.3); ctx.fill(); }); ctx.restore();
}
// simple cartoon hand like the reference: smooth white palm, short rounded finger lobes, thin inner lines
export function smallHand(cx, cy, rot, s, seed = 0, n = 4, len = 1) {
  const p = (pts) => xform(pts, 0, 0, rot, s, cx, cy), O = { line: 5, shadow: 0.25, shadowCol: SKIN_SH, off: 0.3, soft: 0.15 };
  for (let i = 0; i < n; i++) { const y0 = -15 + i * (30 / Math.max(1, n - 1)), L2 = (28 + 6 * (i === 1 || i === 2)) * len;
    F(tube(p([[-6, y0], [-L2 * 0.6, y0 + 1], [-L2, y0 + 3]]), [14, 12, 9]), SKIN, { ...O, line: 4.2, seed: seed + i + 1 }); }
  F(sm(p([[-14, -22], [12, -24], [28, -10], [28, 14], [8, 24], [-14, 20], [-18, 0]])), SKIN, { ...O, seed });
  F(tube(p([[0, -20], [-12, -30], [-24, -32]]), [13, 10, 8]), SKIN, { ...O, line: 4.2, seed: seed + 9 });
}
export function fist(cx, cy, rot, s, seed = 0) { smallHand(cx, cy, 0.12, 1.0, seed, 4, 0.9); }

// a waving flag with smooth fold shading that travels with the wave
export function flag(top, bot, len, t, seed = 0) {
  const N = 16, ph = (u) => u * 3.6 - t * 4.6, edge = (base, amp, o) => { const out = []; for (let i = 0; i <= N; i++) { const u = i / N, w = Math.sin(ph(u) + o) * amp * Math.min(1, u * 1.6);
    out.push([base[0] + u * len - Math.abs(Math.cos(ph(u))) * 10 * u, base[1] - u * 46 + w + 38 * Math.sin(u * Math.PI * 2) * Math.min(1, u * 3)]); } return out; };
  const a = edge(top, 62, 0), b = edge(bot, 56, 0.5), d = sm([...a, ...b.slice().reverse()]);
  F(d, '#c33a30', { line: 8, seed, shadow: 0, hi: 0.1, soft: 0.15, shadowCol: '#4a0d10' });
  ctx.save(); clipTo(d); const g = ctx.createLinearGradient(top[0], 0, top[0] + len, 0);
  for (let i = 0; i <= 24; i++) { const u = i / 24, c = Math.cos(ph(u)); g.addColorStop(u, c < 0 ? `rgba(70,8,12,${-c * 0.55})` : `rgba(255,190,160,${c * 0.18})`); }
  ctx.fillStyle = g; ctx.fillRect(top[0] - 20, 0, len + 60, 1200);
  // a soft fold crease where the cloth turns
  for (let i = 1; i < N; i++) { const u = i / N; if (Math.cos(ph(u)) < -0.92) Ln(sm([[a[i][0], a[i][1] + 20], [lerp(a[i][0], b[i][0], 0.5) + 6, lerp(a[i][1], b[i][1], 0.5)], [b[i][0], b[i][1] - 30]], false), 3, seed + i, 'rgba(50,8,10,0.4)'); }
  ctx.restore();
}

// ── SHOT 1 ───────────────────────────────────────────────────────────────
export function shot1(t) {
  SKIN = '#e4e3e9';
  ctx.save(); cam(lerp(1.0, 1.045, eio(seg(t, 0, T.s2))), W / 2, H * 0.4);
  grad([[0, '#e6c48c'], [0.3, '#f3d9a2'], [0.6, '#f7e6bc'], [1, '#efdcab']], 0, 0, 0, 1300, 0, 0, W, 1320);
  const g = ctx.createRadialGradient(80, 120, 20, 80, 120, 1000); g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.25, 'rgba(255,248,215,0.7)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1320);
  // sun rays: soft diagonal bands + one bright thin streak
  blur(10, () => { ctx.fillStyle = 'rgba(255,250,228,0.35)'; for (const [y0, w] of [[420, 60], [600, 30], [760, 90]]) { ctx.beginPath(); ctx.moveTo(-50, y0 - w); ctx.lineTo(W + 50, y0 + 380 - w * 0.3); ctx.lineTo(W + 50, y0 + 380 + w * 0.3); ctx.lineTo(-50, y0 + w); ctx.fill(); } });
  blur(2, () => { ctx.strokeStyle = 'rgba(255,255,245,0.85)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-20, 540); ctx.quadraticCurveTo(500, 620, W + 40, 980); ctx.stroke(); });
  ctx.save(); const dr = t * 6;
  puff(70 + dr, 120, 120, '#f6e1b8', 'rgba(200,140,85,0.55)', 4, 5, 1.1); puff(420 + dr, 10, 90, '#f4dcae', 'rgba(200,140,85,0.5)', 9, 4); puff(1020 - dr, 260, 80, '#f5dfb3', 'rgba(200,140,85,0.45)', 13, 4);
  ctx.restore();
  // hill with big painted light/dark swathes
  const hill = sm([[-60, 1310], [250, 1232], [560, 1200], [860, 1218], [1140, 1266], [1140, 1980], [-60, 1980]]);
  F(hill, '#79a24a', { line: 8, seed: 5, shadow: 0, hi: 0.1, soft: 0 });
  ctx.save(); clipTo(hill);
  blur(26, () => { ctx.fillStyle = 'rgba(30,70,30,0.55)'; ctx.beginPath(); ctx.moveTo(-60, 1520); ctx.quadraticCurveTo(500, 1300, 1140, 1420); ctx.lineTo(1140, 1560); ctx.quadraticCurveTo(500, 1460, -60, 1700); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-60, 1800); ctx.quadraticCurveTo(600, 1600, 1140, 1700); ctx.lineTo(1140, 1990); ctx.lineTo(-60, 1990); ctx.fill();
    ctx.fillStyle = 'rgba(200,230,140,0.35)'; ctx.beginPath(); ctx.ellipse(300, 1290, 420, 60, -0.08, 0, 6.3); ctx.fill(); });
  strokes(0, 1220, W, 760, '#4d7a35', 60, 8, 0.18, [40, 120], [6, 12], 0.05);
  for (let i = 0; i < 34; i++) { const x = hash(i * 7 + 1) * W, y = 1320 + hash(i * 9 + 2) * 600; Ln(sm([[x, y], [x + 8, y + 10], [x + 18, y + 2]], false), 3.5, i, 'rgba(170,210,110,0.7)'); }
  ctx.restore();
  for (const [x, s] of [[90, 1.1], [190, 0.8], [700, 1], [960, 1.2], [520, 0.7]]) { const y = 1310 - (x < 560 ? (x / 560) * 108 : 108 - (x - 560) / 580 * 62);
    Ln(sm([[x - 14, y + 6], [x - 8, y - 26 * s], [x, y + 4]], false), 4, x, '#2f4f22'); Ln(sm([[x - 2, y + 4], [x + 6, y - 36 * s], [x + 10, y + 4]], false), 4, x + 1, '#2f4f22'); Ln(sm([[x + 8, y + 6], [x + 20, y - 22 * s], [x + 20, y + 6]], false), 4, x + 2, '#2f4f22'); }

  // flag + pole
  const breathe = Math.sin(t * 2.4) * 4;
  flag([226, 270], [300, 640], 640, t, 21);
  F(tube([[210, 226], [310, 700], [404, 1182]], [20, 20, 20], false), '#5d5e60', { line: 6, seed: 22, shadow: 0.35, shadowCol: '#1e1e26' });

  // ── the soldier ──
  const COAT = '#73797d', CSH = '#2a2c3a', BOOT = '#28262a';
  // breeches + tall boots, one knee forward
  F(sm([[470, 1000], [560, 1010], [548, 1090], [470, 1110], [420, 1090], [420, 1040]]), '#5a5f63', { line: 7, seed: 31, shadowCol: CSH, shadow: 0.35 });
  F(sm([[600, 1010], [690, 1000], [730, 1050], [724, 1100], [668, 1108], [620, 1080]]), '#5a5f63', { line: 7, seed: 32, shadowCol: CSH, shadow: 0.35 });
  F(sm([[426, 1080], [490, 1092], [482, 1170], [470, 1196], [390, 1200], [380, 1180], [420, 1160]]), BOOT, { line: 7, seed: 33, shadow: 0.2, hi: 0.3, shadowCol: '#000' });
  F(sm([[662, 1090], [722, 1088], [722, 1160], [758, 1180], [756, 1200], [668, 1200], [660, 1160]]), BOOT, { line: 7, seed: 34, shadow: 0.2, hi: 0.3, shadowCol: '#000' });
  Ln(sm([[440, 1120], [470, 1124]], false), 3, 35, 'rgba(255,255,255,0.3)'); Ln(sm([[676, 1118], [706, 1116]], false), 3, 36, 'rgba(255,255,255,0.3)');
  // coat skirt with pocket flaps
  F(sm([[466, 866], [692, 866], [726, 980], [744, 1060], [640, 1072], [566, 1060], [470, 1074], [410, 1062], [424, 980]]), COAT, { line: 8, seed: 37, shadowCol: CSH, shadow: 0.38, off: 0.2, soft: 0.3 });
  Ln(sm([[568, 880], [566, 980], [562, 1062]], false), 5, 38);
  Ln(sm([[470, 940], [530, 930], [540, 948]], false), 4.5, 39); Ln(sm([[606, 932], [664, 942], [670, 956]], false), 4.5, 40);
  for (const [pts, sd] of [[[[640, 990], [662, 1030], [700, 1058]], 141], [[[504, 966], [492, 1010], [470, 1050]], 142], [[[600, 1000], [596, 1040]], 143], [[[440, 1010], [430, 1050]], 144]]) Ln(sm(pts, false), 3.5, sd, 'rgba(25,26,34,0.6)');
  // left arm to the pole
  at(0, breathe * 0.4, 0, 1, () => { F(tube([[492, 640], [455, 712], [436, 778], [398, 806], [362, 812]], [88, 80, 72, 64, 58]), COAT, { line: 8, seed: 41, shadowCol: CSH, off: 0.25, shadow: 0.35, soft: 0.3 });
    Ln(sm([[440, 770], [452, 790], [430, 802]], false), 4, 42); Ln(sm([[372, 790], [374, 832]], false), 4, 43); });
  at(0, breathe, 0, 1, () => {
    F(sm([[498, 600], [600, 584], [702, 606], [738, 660], [716, 780], [700, 878], [470, 882], [456, 780], [460, 662]]), COAT, { line: 8, seed: 44, shadowCol: CSH, shadow: 0.38, soft: 0.3, shadowD: sm([[650, 600], [740, 660], [716, 780], [700, 880], [610, 880], [640, 760], [660, 660]]) });
    Ln(sm([[480, 664], [530, 660], [532, 690]], false), 4, 45); Ln(sm([[618, 660], [668, 666], [668, 694]], false), 4, 46);
    for (const y of [700, 770]) F(ell(560, y, 7, 7), '#3a3a3e', { line: 3, seed: y, shadow: 0 });
    Ln(sm([[566, 606], [552, 700], [562, 850]], false), 4, 47, 'rgba(30,30,40,0.6)');
    F(poly([[516, 584], [574, 600], [544, 680]]), '#878d91', { line: 5, seed: 48, shadow: 0.15, shadowCol: CSH }); F(poly([[574, 600], [640, 582], [604, 676]]), '#6b7175', { line: 5, seed: 49, shadow: 0.2, shadowCol: CSH });
    F(poly([[548, 596], [600, 596], [574, 650]]), '#4f5458', { line: 4, seed: 50, shadow: 0 }); // tie/shirt v
    F(sm([[606, 640], [640, 630], [646, 654], [612, 662]]), '#9aa0a3', { line: 3.5, seed: 51, shadow: 0 }); // collar tab (plain)
    // belt: leather with pouch and buckle
    F(sm([[456, 852], [580, 846], [706, 848], [708, 888], [580, 892], [456, 896]]), '#262224', { line: 6, seed: 52, shadow: 0.1, hi: 0.3 });
    F(rectD(514, 850, 44, 40, 8), '#4a4a4e', { line: 4, seed: 53, shadow: 0.2, hi: 0.4 }); F(ell(536, 870, 10, 8), '#9a9a9e', { line: 3, seed: 54, shadow: 0 });
    F(sm([[600, 862], [646, 860], [652, 912], [604, 916]]), '#2c282a', { line: 5, seed: 55, shadow: 0.2, hi: 0.3 }); Ln(sm([[600, 878], [626, 892], [650, 876]], false), 3.5, 56);
    // right arm akimbo, hand on hip
    F(tube([[702, 628], [758, 680], [786, 738], [762, 806], [714, 856]], [88, 80, 72, 66, 60]), COAT, { line: 8, seed: 57, shadowCol: CSH, off: 0.25, shadow: 0.38, soft: 0.3 });
    Ln(sm([[770, 720], [790, 742], [772, 760]], false), 4, 58); for (const [pts, sd] of [[[[684, 700], [672, 740], [676, 780]], 150], [[[488, 790], [500, 820], [494, 846]], 151], [[[730, 690], [748, 700]], 152], [[[600, 720], [620, 760]], 153]]) Ln(sm(pts, false), 3.5, sd, 'rgba(25,26,34,0.55)'); Ln(sm([[740, 830], [726, 850]], false), 4, 59);
    F(sm([[684, 838], [722, 846], [726, 870], [690, 872]]), '#8f9599', { line: 5, seed: 60, shadow: 0.2 }); smallHand(708, 876, 2.2, 0.75, 61, 3, 0.8);
    // head, turned three-quarters, chin up
    const hx = 596, hy = 468 + Math.sin(t * 1.3) * 3;
    at(hx, hy, -6, 1, () => at(-hx, -hy, 0, 1, () => {
      head(hx, hy, 132, 146, 61);
      const blink = (t % 2.9) < 0.12 ? 1 : 0;
      eye(hx - 20, hy + 26, 1.2, blink ? 1 : 0.52, 2); eye(hx + 66, hy + 22, 1.15, blink ? 1 : 0.52, -1);
      brow(hx - 50, hy - 16, hx + 4, hy - 12, 8, 62, -2); brow(hx + 42, hy - 14, hx + 96, hy - 22, 8, 63, -2);
      Ln(sm([[hx + 6, hy + 96], [hx + 24, hy + 88], [hx + 44, hy + 96]], false), 7, 64);
      // helmet, tilted back, with chin strap
      const HEL = '#5b6064';
      F(sm([[hx - 140, hy - 20], [hx - 136, hy - 104], [hx - 72, hy - 170], [hx + 20, hy - 186], [hx + 112, hy - 158], [hx + 158, hy - 86], [hx + 166, hy - 20], [hx + 120, hy - 32], [hx, hy - 44], [hx - 104, hy - 30]]), HEL,
        { line: 8, seed: 65, shadowCol: '#14161e', shadow: 0.4, off: 0.2, hi: 0.35, soft: 0.35 });
      F(sm([[hx - 160, hy - 24], [hx, hy - 54], [hx + 178, hy - 22], [hx + 176, hy + 2], [hx, hy - 24], [hx - 160, hy + 2]]), '#4c5155', { line: 7, seed: 66, shadow: 0.3, shadowCol: '#14161e' });
      Ln(sm([[hx - 92, hy - 146], [hx - 40, hy - 168], [hx + 20, hy - 172]], false), 6, 67, 'rgba(255,255,255,0.4)');
      Ln(sm([[hx + 140, hy], [hx + 120, hy + 80], [hx + 70, hy + 136]], false), 4, 68, '#2a2420');
    }));
  });
  at(0, breathe * 0.4, 0, 1, () => fist(352, 806, 1.4, 0.86, 67));

  // ── the defeated, in the foreground ──
  const OLV = '#667f42', OSH = '#1a2a14';
  F(sm([[600, 1380], [760, 1350], [960, 1384], [1110, 1430], [1110, 1660], [900, 1640], [700, 1580], [612, 1506]]), OLV, { line: 8, seed: 70, shadowCol: OSH, shadow: 0.4, soft: 0.35, shadowD: sm([[612, 1500], [800, 1530], [1110, 1560], [1110, 1660], [700, 1590]]) });
  F(tube([[640, 1400], [780, 1440], [940, 1520], [1100, 1600]], 30, false), '#7d6a46', { line: 5, seed: 71, shadow: 0.2, hi: 0.2 }); F(tube([[960, 1392], [990, 1500], [1000, 1640]], 40, false), '#5a4a32', { line: 5, seed: 68, shadow: 0.2 }); F(rectD(972, 1480, 40, 40, 6), '#a68e58', { line: 4, seed: 69, shadow: 0.2 });
  F(sm([[960, 1400], [1010, 1396], [1020, 1440], [966, 1446]]), '#55703a', { line: 4.5, seed: 72, shadow: 0.2 }); Ln(sm([[700, 1430], [760, 1456], [820, 1446]], false), 4, 73, 'rgba(20,30,14,0.6)');
  F(tube([[760, 1404], [830, 1470], [876, 1516]], [72, 64, 58]), OLV, { line: 7, seed: 74, shadowCol: OSH, shadow: 0.35 });
  smallHand(912, 1530, 2.9, 1.15, 75, 4, 1.05);
  const ax = 486, ay = 1468; ctx.save(); ctx.translate(ax, ay); ctx.rotate(-0.42); ctx.translate(-ax, -ay);
  head(ax, ay, 136, 128, 80);
  for (const [ex, sd] of [[ax - 50, 81], [ax + 30, 82]]) { let d = ''; for (let i = 0; i <= 26; i++) { const a = i * 0.5 + t * 4, r = 2 + i * 0.95; d += (i ? ' L ' : 'M ') + (ex + Math.cos(a) * r) + ' ' + (ay + 30 + Math.sin(a) * r); } Ln(d, 4.5, sd); }
  F(sm([[ax - 30, ay + 82], [ax + 20, ay + 78], [ax + 6, ay + 98], [ax - 20, ay + 98]]), '#4a2424', { line: 5, seed: 83, shadow: 0 });
  F(sm([[ax - 8, ay + 92], [ax + 14, ay + 90], [ax + 18, ay + 118], [ax + 2, ay + 124], [ax - 6, ay + 110]]), '#e3797a', { line: 4.5, seed: 84, shadow: 0.2 });
  const hel = sm([[ax - 160, ay - 6], [ax - 150, ay - 96], [ax - 80, ay - 156], [ax + 20, ay - 166], [ax + 120, ay - 130], [ax + 168, ay - 40], [ax + 150, ay - 10], [ax, ay - 30], [ax - 120, ay + 6]]);
  F(hel, '#5a7438', { line: 8, seed: 85, shadowCol: OSH, shadow: 0.4, hi: 0.25, soft: 0.35 });
  ctx.save(); clipTo(hel); for (let i = -8; i < 10; i++) { Ln(`M ${ax - 200 + i * 34} ${ay - 200} L ${ax + i * 34} ${ay + 20}`, 3, 86 + i, 'rgba(25,40,18,0.65)'); Ln(`M ${ax - 100 + i * 34} ${ay - 200} L ${ax - 300 + i * 34} ${ay + 20}`, 3, 106 + i, 'rgba(25,40,18,0.65)'); } ctx.restore();
  F(tube([[ax + 120, ay - 30], [ax + 150, ay + 40], [ax + 120, ay + 120], [ax + 40, ay + 170]], 16, false), '#4c6a30', { line: 4, seed: 87, shadow: 0.2 }); // loose chin strap
  ctx.restore();
  // soldier B: ear-flap fur hat, crying
  F(sm([[-30, 1640], [160, 1630], [300, 1720], [330, 1940], [-30, 1940]]), '#56693a', { line: 8, seed: 90, shadowCol: OSH, shadow: 0.4, soft: 0.35 });
  for (let i = 0; i < 5; i++) Ln(sm([[20 + i * 40, 1660 + i * 8], [40 + i * 46, 1900]], false), 3, 130 + i, 'rgba(20,30,14,0.4)');
  const bx = 430, by = 1800; ctx.save(); ctx.translate(bx, by); ctx.rotate(0.12); ctx.translate(-bx, -by);
  head(bx, by, 132, 124, 91);
  Ln(sm([[bx - 70, by + 6], [bx - 50, by - 8], [bx - 26, by + 4]], false), 6, 92); Ln(sm([[bx + 14, by + 4], [bx + 38, by - 8], [bx + 60, by + 6]], false), 6, 93);
  for (const [x, sd] of [[bx - 46, 94], [bx + 38, 95]]) F(sm([[x - 8, by + 12], [x + 8, by + 12], [x + 10, by + 50 + 8 * Math.sin(t * 6 + sd)], [x, by + 64], [x - 10, by + 50]]), '#9fd2f0', { line: 3.5, seed: sd, shadow: 0.1, hi: 0.4 });
  Ln(sm([[bx - 24, by + 76], [bx - 12, by + 66], [bx, by + 76], [bx + 12, by + 66], [bx + 24, by + 76]], false), 5, 96);
  const fur = (pts) => { const o = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; o.push(a); o.push([lerp(a[0], b[0], 0.5) + (hash(i + 3) - 0.5) * 14, lerp(a[1], b[1], 0.5) - 9 - 7 * hash(i)]); } return o; };
  const FUR = '#6f6d6a', FSH = '#1e1c22';
  for (const s of [-1, 1]) F(sm([[bx + s * 116, by - 40], [bx + s * 152, by - 24], [bx + s * 162, by + 60], [bx + s * 136, by + 92], [bx + s * 112, by + 30]]), '#5e5c5a', { line: 7, seed: 97 + s, shadowCol: FSH, shadow: 0.35 });
  F(sm(fur([[bx - 150, by - 30], [bx - 146, by - 110], [bx - 70, by - 160], [bx + 60, by - 160], [bx + 146, by - 110], [bx + 150, by - 30], [bx + 100, by - 50], [bx, by - 62], [bx - 100, by - 50]])), '#5a5856', { line: 8, seed: 99, shadowCol: FSH, shadow: 0.4, soft: 0.3 });
  F(sm(fur([[bx - 164, by - 56], [bx - 120, by - 92], [bx, by - 104], [bx + 120, by - 92], [bx + 166, by - 56], [bx + 158, by - 14], [bx, by - 46], [bx - 158, by - 14]])), FUR, { line: 7, seed: 100, shadowCol: FSH, shadow: 0.35, soft: 0.3 });
  for (let i = 0; i < 16; i++) { const x = bx - 150 + i * 20; Ln(`M ${x} ${by - 70 + 6 * hash(i)} L ${x + 6} ${by - 46}`, 3, 101 + i, 'rgba(30,28,30,0.45)'); }
  F(ell(bx, by - 76, 16, 16), '#b59a5a', { line: 4, seed: 120, shadow: 0.25 });
  ctx.restore();
  F(tube([[600, 1960], [650, 1900], [712, 1858]], [70, 64, 58]), '#56693a', { line: 7, seed: 121, shadowCol: OSH, shadow: 0.35 });
  smallHand(736, 1852, 3.2, 1.15, 122, 4, 1.05);
  ctx.restore();
  // warm backlight haze
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; const hz = ctx.createRadialGradient(80, 120, 50, 80, 120, 1500); hz.addColorStop(0, 'rgba(255,220,150,0.55)'); hz.addColorStop(1, 'rgba(255,200,130,0)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// ── SHOT 2 ───────────────────────────────────────────────────────────────
export function tape(cx, cy, w, h, rot, txt, seed) {
  at(cx, cy, rot, 1, () => {
    const pts = [], n = 7;
    for (let i = 0; i <= n; i++) pts.push([w / 2 + (i % 2 ? 26 : -6) + 12 * hash(seed + i), -h / 2 + h * i / n]);
    for (let i = n; i >= 0; i--) pts.push([-w / 2 + (i % 2 ? -26 : 6) - 12 * hash(seed + i + 9), -h / 2 + h * i / n]);
    const d = poly(pts);
    blur(6, () => { ctx.translate(8, 12); F(d, 'rgba(40,36,30,0.35)', { line: 0, shadow: 0, hi: 0, tex: 0, soft: 0, ink: false }); });
    F(d, '#ead27a', { line: 7, seed, shadowCol: '#8a6a1c', shadow: 0.3, shadowD: rectD(-w / 2 - 40, h * 0.22, w + 80, h), hi: 0.25, soft: 0.15 });
    ctx.save(); clipTo(d); for (let i = 0; i < 9; i++) Ln(`M ${-w / 2 + hash(seed + i) * w * 0.5} ${-h / 2 + 10 + hash(seed * 3 + i) * (h - 20)} L ${-w / 2 + hash(seed + i) * w * 0.5 + 80 + 140 * hash(i)} ${-h / 2 + 12 + hash(seed * 3 + i) * (h - 20)}`, 2.5, seed + i, i % 2 ? 'rgba(140,105,30,0.45)' : 'rgba(255,248,200,0.5)'); ctx.restore();
    hand(txt, 0, 4, 104, seed);
  });
}
export function shot2(t) {
  SKIN = '#f7f4ef';
  ctx.save(); cam(lerp(1.05, 1.0, eo(seg(t, T.s2, T.s2 + 1.2))), W / 2, H * 0.45);
  grad([[0, '#cfcfcd'], [0.6, '#bdbdbb'], [1, '#a9aaa9']], W, 0, 0, 1400, 0, 0, W, H);
  // the panel bends: a curved darker region at the left
  const bend = 'M -20 -20 L 160 -20 Q 120 700 520 1040 Q 640 1150 600 1400 L -20 1400 Z';
  ctx.save(); clipTo(bend); grad([[0, 'rgba(120,122,126,0.55)'], [1, 'rgba(150,152,155,0.2)']], 0, 0, 600, 1400, 0, 0, 700, 1400); ctx.restore();
  Ln('M 160 -20 Q 120 700 520 1040', 3, 9, 'rgba(255,255,255,0.35)');
  blur(30, () => { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(820, 300, 300, 500, 0.3, 0, 6.3); ctx.fill(); });
  Ln(sm([[0, 960], [60, 950], [100, 1000], [160, 990]], false), 4.5, 13, '#2e2a2a'); Ln(sm([[100, 1000], [80, 1070], [96, 1110]], false), 4, 14, '#2e2a2a');
  Ln(sm([[760, 150], [820, 108], [870, 112], [920, 80]], false), 4.5, 15, '#2e2a2a'); Ln(sm([[820, 108], [860, 70]], false), 3.5, 16, '#2e2a2a');
  // beveled red light
  const on = t > 5.38 ? (Math.floor((t - 5.38) * 5) % 2 === 0 ? 1 : 0.6) : 0.55, R = (a, b) => `rgb(${lerp(a[0], b[0], on) | 0},${lerp(a[1], b[1], on) | 0},${lerp(a[2], b[2], on) | 0})`;
  const L0 = 336, T0 = 124, LW = 404, LH = 176, b = 22;
  F(rectD(L0, T0, LW, LH, 4), R([120, 10, 12], [190, 20, 20]), { line: 8, seed: 17, shadow: 0, hi: 0, soft: 0 });
  F(poly([[L0, T0], [L0 + LW, T0], [L0 + LW - b, T0 + b], [L0 + b, T0 + b]]), R([170, 30, 30], [240, 70, 60]), { line: 0, shadow: 0, hi: 0, soft: 0, tex: 0.05 });
  F(poly([[L0, T0], [L0 + b, T0 + b], [L0 + b, T0 + LH - b], [L0, T0 + LH]]), R([150, 24, 24], [225, 50, 45]), { line: 0, shadow: 0, hi: 0, soft: 0, tex: 0.05 });
  F(poly([[L0, T0 + LH], [L0 + b, T0 + LH - b], [L0 + LW - b, T0 + LH - b], [L0 + LW, T0 + LH]]), R([80, 6, 8], [130, 10, 12]), { line: 0, shadow: 0, hi: 0, soft: 0, tex: 0.05 });
  F(rectD(L0 + b, T0 + b, LW - 2 * b, LH - 2 * b, 3), R([150, 14, 18], [235, 30, 30]), { line: 5, seed: 18, shadowCol: '#3a0405', shadow: 0.35, shadowD: 'M 358 300 L 358 236 Q 520 260 718 160 L 718 300 Z', hi: 0.2, soft: 0 });
  Ln(sm([[L0 + 40, T0 + 120], [L0 + 60, T0 + 60], [L0 + 140, T0 + 40]], false), 6, 19, `rgba(255,200,190,${0.4 + on * 0.3})`);
  if (t > 5.38 && on > 0.9) { const gg = ctx.createRadialGradient(538, 212, 80, 538, 212, 560); gg.addColorStop(0, 'rgba(255,60,40,0.4)'); gg.addColorStop(1, 'rgba(255,60,40,0)'); ctx.fillStyle = gg; ctx.fillRect(0, 0, W, 900); }
  tape(250, 520, 440, 150, -7, 'WHAT?', 20); tape(820, 522, 430, 145, 6, 'HOW?', 40);
  // desk
  F(rectD(-20, 1390, 1120, 560), '#66472f', { line: 8, seed: 60, shadowCol: '#1e0f06', shadow: 0.4, shadowD: rectD(-20, 1390, 1120, 60), hi: 0.08, soft: 0.25 });
  blur(14, () => { ctx.fillStyle = 'rgba(40,22,10,0.35)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(hash(i + 3) * W, 1480 + i * 80, 260, 8, 0, 0, 6.3); ctx.fill(); } });
  // dial
  const D = [500, 862], turn = eio(seg(t, 5.2, 5.62)), A = lerp(-122, -45, turn) * Math.PI / 180;
  blur(10, () => { ctx.fillStyle = 'rgba(30,30,36,0.35)'; ctx.beginPath(); ctx.arc(D[0] + 20, D[1] + 26, 172, 0, 6.3); ctx.fill(); });
  F(ell(D[0], D[1], 168, 168), '#2a2d32', { line: 9, seed: 70, shadow: 0, hi: 0, soft: 0 });
  for (let i = 0; i < 9; i++) { const a = A + 0.5 + i / 9 * Math.PI * 2, a2 = a + Math.PI * 2 / 9 - 0.05, r0 = 108, r1 = 162, lit = 0.5 + 0.5 * Math.cos((a + a2) / 2 + 2.3), pts = [];
    for (let k = 0; k <= 6; k++) { const q = lerp(a, a2, k / 6); pts.push([D[0] + Math.cos(q) * r1, D[1] + Math.sin(q) * r1]); } for (let k = 6; k >= 0; k--) { const q = lerp(a, a2, k / 6); pts.push([D[0] + Math.cos(q) * r0, D[1] + Math.sin(q) * r0]); }
    F(poly(pts), `rgb(${lerp(52, 128, lit) | 0},${lerp(55, 132, lit) | 0},${lerp(62, 140, lit) | 0})`, { line: 4, seed: 71 + i, shadow: 0, hi: 0.1, tex: 0.08, soft: 0 }); }
  F(ell(D[0], D[1], 106, 106), '#8a9299', { line: 7, seed: 90, shadowCol: '#2a2c38', shadow: 0.35, shadowD: ell(D[0] + 30, D[1] + 34, 100, 100), hi: 0.3, soft: 0.2 });
  // the pointer: a cone on the rim
  const tip = [D[0] + Math.cos(A) * 330, D[1] + Math.sin(A) * 330], bl = [D[0] + Math.cos(A - 0.36) * 150, D[1] + Math.sin(A - 0.36) * 150], br = [D[0] + Math.cos(A + 0.36) * 150, D[1] + Math.sin(A + 0.36) * 150], mid = [D[0] + Math.cos(A) * 158, D[1] + Math.sin(A) * 158];
  F(poly([bl, tip, mid]), '#3a3e44', { line: 0, shadow: 0, hi: 0, tex: 0.05, soft: 0 }); F(poly([mid, tip, br]), '#e6e8ea', { line: 0, shadow: 0, hi: 0, tex: 0.05, soft: 0 });
  F(poly([bl, tip, br, mid]), 'rgba(0,0,0,0)', { line: 7, seed: 92, shadow: 0, hi: 0, tex: 0, soft: 0 });
  // the hand: one smooth mitten-like grip wrapped round the dial's right side, thumb under it
  const rise = eob(seg(t, 3.75, 4.2)); if (rise > 0) {
    const dy = lerp(1100, 0, rise), rot = (A - (-122 * Math.PI / 180)) * 0.5;
    ctx.save(); ctx.translate(D[0], D[1] + dy); ctx.rotate(rot); ctx.translate(-D[0], -D[1]);
    const armD = sm([[410, 1110], [450, 1070], [560, 1058], [612, 1040], [636, 960], [628, 820], [640, 700], [684, 636], [740, 650], [800, 730], [900, 830], [1020, 960], [1160, 1080], [1220, 1200], [1220, 2100], [780, 2100], [660, 1500], [580, 1250], [480, 1150]]);
    F(armD, SKIN, { line: 8, seed: 100, shadowCol: SKIN_SH, shadow: 0.35, soft: 0.25, shadowD: sm([[410, 1110], [480, 1150], [580, 1250], [660, 1500], [780, 2100], [900, 2100], [760, 1500], [660, 1200], [560, 1110]]), hi: 0.2 });
    blur(14, () => { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(980, 1400, 80, 420, -0.5, 0, 6.3); ctx.fill(); });
    Ln(sm([[690, 680], [720, 790], [700, 900], [668, 990]], false), 4, 101, 'rgba(40,34,48,0.75)');
    Ln(sm([[560, 1060], [600, 1090], [650, 1120]], false), 4, 102, 'rgba(40,34,48,0.65)');
    Ln(sm([[790, 760], [800, 800]], false), 3.5, 103, 'rgba(40,34,48,0.5)');
    ctx.restore();
  }
  ctx.restore();
}

// ── SHOT 3/4 ─────────────────────────────────────────────────────────────
export function chair(wob, k = 0) { // k: 0 facing us, 1 swivelled away to the left after he leaps
  const L2 = (p, q) => p.map((v, i) => [lerp(v[0], q[i][0], k), lerp(v[1], q[i][1], k)]);
  const back = L2([[262, 1210], [244, 760], [270, 600], [360, 548], [560, 538], [740, 548], [828, 600], [850, 760], [842, 1210]],
                  [[108, 1206], [64, 780], [74, 690], [190, 660], [400, 638], [600, 624], [648, 652], [700, 900], [778, 1206]]);
  const cx0 = (back[0][0] + back[8][0]) / 2;
  at(540, 1200, wob, 1, () => at(-540, -1200, 0, 1, () => {
    const NAVY = '#26345a', NSH = '#080c1c';
    const posts = [[lerp(190, 40, k), lerp(1020, 1110, k)], [lerp(890, 875, k), lerp(1020, 1110, k)]];
    posts.forEach(([x, y], i) => { F(rectD(x - 20, y, 40, 1220 - y, 6), '#b9bfc6', { line: 6, seed: 202 + i, shadow: 0.35, shadowD: rectD(x + 2, y, 20, 220), hi: 0.5, soft: 0 }); Ln(`M ${x - 6} ${y + 30} L ${x - 6} 1190`, 3, 210 + i, 'rgba(255,255,255,0.7)'); });
    F(sm(back), NAVY, { line: 9, seed: 200, shadowCol: NSH, shadow: 0.5 + 0.15 * k, shadowD: sm([back[5], back[6], back[7], back[8], [back[8][0] - 80, 1210], [back[7][0] - 50, back[7][1]], [back[6][0] - 50, back[6][1] + 10]]), hi: 0.15, soft: 0.3 });
    blur(16, () => { ctx.fillStyle = `rgba(140,160,220,${0.25 * (1 - k)})`; ctx.beginPath(); ctx.ellipse(lerp(380, 220, k), 700, 60, 200, 0.1, 0, 6.3); ctx.fill(); });
    Ln(sm(back.slice(3, 6), false), 4, 199, `rgba(150,170,230,${0.35 + 0.3 * k})`);
    Ln(sm(back.map((p) => [lerp(p[0], cx0, 0.09), lerp(p[1], 880, 0.09)]).slice(0, 9), false), 4, 201, `rgba(6,8,20,${0.6 * (1 - k)})`);
    const pads = [[lerp(190, 40, k), lerp(0, 150, k), -1], [lerp(890, 830, k), lerp(0, 60, k), 1]];
    for (const [cx, dy, s] of pads) F(sm([[cx - 150 * s, 1000 + dy], [cx - 120 * s, 956 + dy], [cx + 70 * s, 946 + dy], [cx + 116 * s, 980 + dy], [cx + 100 * s, 1030 + dy], [cx - 130 * s, 1040 + dy]]), NAVY, { line: 8, seed: 204 + s, shadowCol: NSH, shadow: 0.45, shadowD: rectD(cx - 160, 1006 + dy, 320, 60), hi: 0.25, soft: 0.2 });
  }));
}
export function leader(t, up) {
  const sq = up > 0 ? 1 + Math.min(up / 400, 0.25) : 1;
  ctx.save(); ctx.translate(556, 1200 - up); ctx.scale(1 / Math.sqrt(sq), sq); ctx.translate(-556, -1200);
  const SUIT = '#2f363b', SSH = '#0e1218', HAIR = '#6a4128';
  F(sm([[236, 1236], [262, 1060], [350, 990], [470, 970], [650, 970], [770, 990], [850, 1060], [870, 1236]]), SUIT, { line: 8, seed: 210, shadowCol: SSH, shadow: 0.4, soft: 0.3 });
  F(poly([[500, 976], [612, 976], [560, 1130]]), '#f2efe8', { line: 6, seed: 211, shadow: 0.1 });
  F(sm([[548, 992], [570, 992], [580, 1100], [560, 1146], [540, 1100]]), '#15181c', { line: 5, seed: 212, shadow: 0.2, hi: 0.3 });
  F(poly([[470, 980], [530, 1000], [552, 1180], [500, 1100]]), '#4a5258', { line: 5, seed: 213, shadow: 0.2, shadowCol: SSH }); F(poly([[650, 980], [590, 1000], [568, 1180], [620, 1100]]), '#4a5258', { line: 5, seed: 214, shadow: 0.3, shadowCol: SSH });
  const worry = seg(t, 7.6, 7.9), hx = 548, hy = 742 + Math.sin(t * 1.4) * 3;
  head(hx, hy, 200, 222, 215, '#7f7b90', 0.32, true);
  // hair: dark brown bob with a side part, covering the sides of the head
  const hairD = sm([[hx - 212, hy + 70], [hx - 218, hy - 50], [hx - 170, hy - 160], [hx - 70, hy - 222], [hx + 60, hy - 226], [hx + 170, hy - 170], [hx + 218, hy - 60], [hx + 214, hy + 84], [hx + 188, hy + 40], [hx + 130, hy - 30], [hx + 40, hy - 78], [hx - 50, hy - 100], [hx - 100, hy - 78], [hx - 150, hy - 20], [hx - 182, hy + 50]]);
  F(hairD, HAIR, { line: 8, seed: 216, shadowCol: '#1e0c04', shadow: 0.45, shadowD: sm([[hx + 60, hy - 226], [hx + 170, hy - 170], [hx + 218, hy - 60], [hx + 214, hy + 84], [hx + 188, hy + 40], [hx + 150, hy - 70], [hx + 80, hy - 150]]), hi: 0.35, soft: 0.3 });
  Ln(sm([[hx - 70, hy - 220], [hx - 84, hy - 160], [hx - 92, hy - 96]], false), 4, 240, 'rgba(30,12,4,0.85)');
  Ln(sm([[hx - 50, hy - 224], [hx - 48, hy - 180], [hx - 46, hy - 150]], false), 4, 217, 'rgba(30,12,4,0.8)');
  for (const [a, b] of [[[hx - 150, hy - 140], [hx - 120, hy - 40]], [[hx + 10, hy - 200], [hx + 120, hy - 110]], [[hx + 100, hy - 190], [hx + 180, hy - 80]]]) Ln(sm([a, [lerp(a[0], b[0], 0.5) + 12, lerp(a[1], b[1], 0.5) - 10], b], false), 3.5, a[0] | 0, 'rgba(30,12,4,0.55)');
  blur(10, () => { ctx.fillStyle = 'rgba(255,220,180,0.35)'; ctx.beginPath(); ctx.ellipse(hx - 90, hy - 170, 70, 26, -0.4, 0, 6.3); ctx.fill(); });
  // brooding face
  const blink = (t % 3.3) < 0.1 ? 1 : 0;
  eye(hx - 82, hy + 44, 1.15, blink ? 1 : 0.48 + 0.1 * worry, 5, [2, 3]); eye(hx + 62, hy + 44, 1.15, blink ? 1 : 0.4 + 0.1 * worry, -5, [2, 3]);
  brow(hx - 136, hy + 2 - 6 * worry, hx - 34, hy + 18, 10, 218, 8); brow(hx + 18, hy + 14, hx + 124, hy - 10 - 6 * worry, 10, 219, 8);
  Ln(sm([[hx - 22, hy + 10], [hx - 12, hy + 40], [hx - 16, hy + 64]], false), 3.5, 220); Ln(sm([[hx + 8, hy + 12], [hx + 2, hy + 44]], false), 3.5, 221);
  Ln(sm([[hx - 140, hy + 66], [hx - 120, hy + 76]], false), 3, 222, 'rgba(40,30,40,0.6)'); Ln(sm([[hx + 104, hy + 70], [hx + 124, hy + 62]], false), 3, 223, 'rgba(40,30,40,0.6)');
  if (worry > 0) F(sm([[hx + 168, hy - 10], [hx + 182, hy + 20], [hx + 176, hy + 40], [hx + 160, hy + 36], [hx + 158, hy + 16]]), '#bfe3f7', { line: 4, seed: 224, shadow: 0.1, hi: 0.5, alpha: worry });
  // forearms from the elbows on the desk up to the hands at the mouth
  const AR = { line: 8, shadowCol: SSH, shadow: 0.42, soft: 0.35 };
  F(tube([[290, 1236], [350, 1110], [420, 1000], [452, 956]], [160, 140, 118, 104]), '#58626a', { ...AR, seed: 225, shadowD: sm([[200, 1240], [330, 1080], [420, 1020], [450, 1080], [380, 1240]]) });
  F(tube([[810, 1236], [740, 1110], [640, 1000], [580, 960]], [160, 140, 118, 104]), '#58626a', { ...AR, seed: 226, shadowD: sm([[920, 1240], [760, 1080], [660, 1030], [640, 1100], [720, 1240]]) });
  Ln(sm([[250, 1180], [320, 1070], [420, 980]], false), 5, 241, 'rgba(210,222,232,0.5)'); Ln(sm([[860, 1180], [790, 1070], [690, 1000]], false), 5, 242, 'rgba(210,222,232,0.35)');
  blur(10, () => { ctx.fillStyle = 'rgba(200,215,225,0.35)'; ctx.beginPath(); ctx.ellipse(330, 1130, 18, 90, 0.5, 0, 6.3); ctx.fill(); ctx.beginPath(); ctx.ellipse(760, 1120, 18, 90, -0.5, 0, 6.3); ctx.fill(); });
  // clasped hands, slightly left of center, knuckles at the mouth
  // small dark-brown moustache under the nose, just above the hands
  at(hx - 14, hy + 112, -6, 1, () => { F(poly([[-30, -24], [30, -26], [42, 22], [-42, 24]]), '#553422', { line: 6, seed: 245, shadowCol: '#140602', shadow: 0.35, shadowD: rectD(-50, 4, 100, 30), hi: 0.3, soft: 0.2 });
    for (const x of [-22, -6, 10, 26]) Ln(`M ${x} -14 L ${x - 3} 12`, 2.2, 246 + x, 'rgba(20,8,2,0.5)'); });
  // clasped hands in the reference's simple style: left fist below, right hand draped over it, fingers as thin curves
  ctx.save(); ctx.translate(490, 950); ctx.scale(1.12, 1.12); ctx.translate(-490 + 8, -950 - 14);
  const HO = { line: 6, shadowCol: SKIN_SH, shadow: 0.28, off: 0.22, soft: 0.25 };
  F(sm([[396, 1012], [384, 958], [392, 912], [420, 884], [454, 876], [472, 902], [464, 952], [452, 1002], [426, 1026]]), SKIN, { ...HO, seed: 227 });
  Ln(sm([[408, 920], [424, 900], [446, 892]], false), 2.6, 228, 'rgba(40,32,40,0.75)');
  F(sm([[586, 1034], [542, 1044], [500, 1014], [468, 962], [450, 912], [462, 880], [502, 872], [544, 892], [574, 934], [598, 986]]), SKIN, { ...HO, seed: 229 });
  for (const [pts, sd] of [[[[464, 906], [502, 900], [544, 926]], 230], [[[472, 942], [508, 936], [552, 962]], 231], [[[486, 978], [518, 972], [560, 998]], 232]]) Ln(sm(pts, false), 2.6, sd, 'rgba(40,32,40,0.75)');
  Ln(sm([[452, 912], [446, 930], [456, 944]], false), 2.6, 233, 'rgba(40,32,40,0.7)'); Ln(sm([[460, 946], [456, 962], [468, 976]], false), 2.6, 234, 'rgba(40,32,40,0.7)');
  ctx.restore();
  ctx.restore();
}
export function shot3(t) {
  SKIN = '#f7f4ef';
  const leapT = t - T.leap, wob = leapT > 0 ? Math.sin(leapT * 22) * 4 * Math.exp(-leapT * 4) : 0;
  ctx.save(); cam(lerp(1.0, 1.05, eio(seg(t, T.s3, T.leap))) + (leapT > 0 ? -0.02 * eo(seg(leapT, 0, 0.3)) : 0), W / 2, H * 0.5);
  grad([[0, '#abc9de'], [0.45, '#94afc4'], [1, '#62778a']], 0, 0, 0, 1220, 0, 0, W, 1220);
  blur(40, () => { ctx.fillStyle = 'rgba(40,55,75,0.18)'; ctx.beginPath(); ctx.ellipse(550, 900, 480, 380, 0, 0, 6.3); ctx.fill(); });
  chair(wob, eio(seg(leapT, 0.08, 0.55)));
  const up = leapT > 0 ? 2200 * Math.pow(seg(leapT, 0.05, 0.42), 1.6) : 0;
  if (up < 2100) leader(t, up);
  if (leapT > 0.05 && leapT < 0.8) { ctx.save(); ctx.globalAlpha = 1 - seg(leapT, 0.4, 0.8); for (let i = 0; i < 7; i++) { const x = 330 + i * 75, y0 = 200 + 80 * hash(i); Ln(`M ${x} ${y0 + 600 - up * 0.3} L ${x} ${y0 + 900 - up * 0.25}`, 6, 310 + i); } ctx.restore(); }
  // desk
  F(rectD(-30, 1198, 1140, 760), '#6e4c33', { line: 9, seed: 320, shadowCol: '#1c0c04', shadow: 0.35, shadowD: rectD(-30, 1198, 1140, 30), hi: 0.08, soft: 0 });
  grad([[0, 'rgba(120,80,50,0)'], [1, 'rgba(30,15,6,0.4)']], 0, 1200, 0, 1920, 0, 1206, W, 720);
  blur(8, () => { for (let i = 0; i < 26; i++) { ctx.fillStyle = i % 3 ? 'rgba(40,22,10,0.3)' : 'rgba(170,120,80,0.22)'; ctx.beginPath(); ctx.ellipse(hash(i + 7) * W, 1240 + hash(i * 3 + 1) * 680, 120 + 220 * hash(i * 5), 5, 0, 0, 6.3); ctx.fill(); } });
  for (let i = 0; i < 16; i++) { const y = 1236 + i * 44 + 14 * hash(i), x0 = hash(i * 3) * 700 - 100; Ln(sm([[x0, y], [x0 + 140, y - 4 + 6 * vn(i)], [x0 + 300 + 200 * hash(i * 5), y + 2]], false), 2.6, 400 + i, 'rgba(35,18,8,0.55)'); }
  Ln('M -20 1206 L 1100 1206', 3, 420, 'rgba(255,220,180,0.35)');
  // props
  const flut = leapT > 0 ? Math.sin(leapT * 9) * 0.06 * Math.exp(-leapT * 2) : 0;
  at(480, 1286, flut * 57, 1, () => { blur(6, () => { ctx.fillStyle = 'rgba(30,15,6,0.35)'; ctx.fillRect(-230, -50, 470, 130); }); F(poly([[-218, -76], [216, -78], [250, 60], [-262, 70]]), '#f3f0e8', { line: 6, seed: 330, shadow: 0.1, hi: 0.2, soft: 0.15 }); });
  at(300, 1462, -32 + flut * 120, 1, () => { blur(6, () => { ctx.fillStyle = 'rgba(30,15,6,0.35)'; ctx.fillRect(-110, -60, 240, 150); }); F(rectD(-120, -72, 240, 144, 4), '#f4f1ea', { line: 6, seed: 331, shadow: 0.15, soft: 0.2 }); Ln(sm([[-116, -68], [0, 10], [116, -68]], false), 4, 332); });
  at(40, 1540, 12, 1, () => { F(poly([[-110, -170], [90, -170], [100, 170], [-110, 170]]), '#f1ede4', { line: 7, seed: 333, shadow: 0.2, soft: 0.2 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) if ((r + c) % 2 === 0) F(rectD(-10 + c * 50 - 60, -160 + r * 80, 50, 80), '#26221f', { line: 0, shadow: 0, hi: 0.06, tex: 0.08, soft: 0 });
    F(poly([[-110, 170], [100, 170], [96, 200], [-110, 200]]), '#bdb6aa', { line: 6, seed: 334, shadow: 0.3 }); });
  const pawn = (x, y, s, col) => F(sm([[x - 28 * s, y], [x - 16 * s, y - 20 * s], [x - 10 * s, y - 52 * s], [x - 18 * s, y - 66 * s], [x, y - 92 * s], [x + 18 * s, y - 66 * s], [x + 10 * s, y - 52 * s], [x + 16 * s, y - 20 * s], [x + 28 * s, y]]), col, { line: 6, seed: x + y, shadow: 0.35, hi: 0.3 });
  pawn(104, 1396, 0.9, '#efece4'); pawn(40, 1640, 0.9, '#efece4'); F(ell(30, 1460, 38, 24), '#b33b33', { line: 6, seed: 335, shadow: 0.35, hi: 0.3 });
  at(370, 1676, -2, 1, () => { F(poly([[-148, 34], [148, 34], [140, -20], [-138, -20]]), '#5a3a1e', { line: 6, seed: 340, shadow: 0.35 }); F(poly([[-134, 18], [134, 18], [124, -44], [-122, -44]]), '#c99a48', { line: 6, seed: 341, shadowCol: '#4a2c08', shadow: 0.3, hi: 0.45, soft: 0.25 });
    ctx.font = '700 46px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3e260c'; ctx.save(); ctx.scale(1.1, 1); ctx.fillText('LEADER', 0, -12); ctx.restore(); });
  // the red book in perspective: pages on the left face, rounded spine with gold bands facing us
  const A_ = [578, 1663], B_ = [930, 1550], C_ = [1100, 1636], D_ = [748, 1764], th = 112, dn = (p) => [p[0], p[1] + th];
  blur(12, () => { ctx.fillStyle = 'rgba(25,12,4,0.5)'; ctx.beginPath(); ctx.moveTo(A_[0] + 10, A_[1] + th + 10); ctx.lineTo(D_[0] + 10, D_[1] + th + 14); ctx.lineTo(C_[0] + 20, C_[1] + th + 10); ctx.lineTo(C_[0] + 20, C_[1]); ctx.closePath(); ctx.fill(); });
  F(poly([A_, D_, dn(D_), dn(A_)]), '#ece2c8', { line: 7, seed: 350, shadow: 0.15, soft: 0.2 });
  for (let i = 1; i < 6; i++) Ln(`M ${A_[0] + 6} ${A_[1] + i * 18} L ${D_[0] - 6} ${D_[1] + i * 18}`, 2.4, 351 + i, 'rgba(120,90,60,0.5)');
  const sp = sm([[D_[0] - 4, D_[1] - 6], [lerp(D_[0], C_[0], 0.5), lerp(D_[1], C_[1], 0.5) - 6], [C_[0] + 6, C_[1] - 2], [C_[0] + 14, C_[1] + th / 2], [C_[0] + 4, C_[1] + th + 6], [lerp(D_[0], C_[0], 0.5), lerp(D_[1], C_[1], 0.5) + th + 8], [D_[0] - 2, D_[1] + th + 10], [D_[0] - 12, D_[1] + th / 2]]);
  F(sp, '#9c3936', { line: 8, seed: 358, shadowCol: '#2a0606', shadow: 0.3, shadowD: rectD(0, D_[1] + th * 0.55, W, 300), hi: 0.2, soft: 0.25 });
  for (const k of [0.16, 0.24]) { const p0 = [lerp(D_[0], C_[0], k), lerp(D_[1], C_[1], k)], p1 = [lerp(D_[0], C_[0], k + 0.045), lerp(D_[1], C_[1], k + 0.045)];
    F(sm([[p0[0], p0[1] - 4], [p1[0], p1[1] - 6], [p1[0] + 6, p1[1] + th / 2], [p1[0], p1[1] + th + 6], [p0[0], p0[1] + th + 8], [p0[0] - 6, p0[1] + th / 2]]), '#d3a64e', { line: 4.5, seed: 360 + k * 100, shadow: 0.25, shadowCol: '#4a2c08', hi: 0.4, soft: 0 }); }
  F(poly([[A_[0] - 10, A_[1] - 4], [B_[0] - 4, B_[1] - 10], [C_[0] + 8, C_[1] - 4], [D_[0] + 2, D_[1] - 2]]), '#b04541', { line: 8, seed: 359, shadowCol: '#2a0606', shadow: 0.25, shadowD: poly([[D_[0] - 160, D_[1] - 50], [C_[0], C_[1] - 4], [D_[0] + 2, D_[1] - 2]]), hi: 0.3, soft: 0.2 });
  Ln(`M ${A_[0] + 30} ${A_[1] - 6} L ${B_[0] + 10} ${B_[1] - 8}`, 3, 365, 'rgba(255,200,190,0.35)');
  ctx.restore();
}

