// Shared parts for the full film: character rig, Europe map, globe, captions.
import { W, H, ctx, clamp, lerp, seg, eo, eio, eob, hash, vn, S, INK, P, ellD, rectD, F, Ln, grad, blur, at, sm, poly, tube, xform, hand } from './kit.js';
import { SKIN, SKIN_SH, eye, brow, head, smallHand, clipTo, ell } from './intro.js';

// ── character rig ────────────────────────────────────────────────────────
// Local coords: waist centre (0,0); head centre (0,-440). o: { x, y, s, flip, lean, outfit, mood, look, t, armF, armB,
// legs, blink, headTilt, talk }. Arms: [shoulderDeg, elbowDeg] measured from straight down, + = outward/up.
export const OUT = {
  grey: { coat: '#73797d', sh: '#2a2c3a', gear: 'round', gearCol: '#5b6064', belt: true },
  khaki: { coat: '#8b7b52', sh: '#2e2614', gear: 'brodie', gearCol: '#6e6a44', belt: true },
  soviet: { coat: '#6f7a4a', sh: '#1f2614', gear: 'fur', gearCol: '#5c5a57', belt: true },
  irish: { coat: '#5a7440', sh: '#1a2a12', gear: 'cap', gearCol: '#4c6534', belt: true },
  leader: { coat: '#3a4248', sh: '#0e1218', gear: 'hair', suit: true },
  sam: { coat: '#2d4182', sh: '#0c1430', gear: 'tophat', suit: true, sam: true },
  civ: { coat: '#7f93a6', sh: '#1e2a38', gear: null, civ: true },
};
const armPts = (side, sx, sy, a1, a2, l1 = 120, l2 = 112) => { const r = Math.PI / 180, e = [sx + side * Math.sin(a1 * r) * l1, sy + Math.cos(a1 * r) * l1], a = a1 + a2, h = [e[0] + side * Math.sin(a * r) * l2, e[1] + Math.cos(a * r) * l2]; return { e, h, dir: [side * Math.sin(a * r), Math.cos(a * r)] }; };
function arm(o, side, pose, c) {
  const [a1, a2] = pose, { e, h, dir } = armPts(side, side * 108, -262, a1, a2);
  F(tube([[side * 108, -262], [lerp(side * 108, e[0], 0.5), lerp(-262, e[1], 0.5)], e, [lerp(e[0], h[0], 0.5), lerp(e[1], h[1], 0.5)], h], [80, 76, 70, 64, 58]), c.coat, { line: 7, seed: 500 + side * 7, shadowCol: c.sh, shadow: 0.36, off: 0.25, soft: 0.3 });
  Ln(sm([[e[0] - 14 * side, e[1] - 8], [e[0], e[1] + 6], [e[0] + 10 * side, e[1] + 2]], false), 3.5, 510 + side, 'rgba(20,20,30,0.55)');
  if (o.hold !== side) smallHand(h[0] + dir[0] * 18, h[1] + dir[1] * 18, Math.atan2(dir[1], dir[0]) - Math.PI, 1.05, 520 + side * 3, 4, 0.95);
  return [h[0] + dir[0] * 30, h[1] + dir[1] * 30];
}
function gear(c, hx, hy, t) {
  const g = c.gear;
  if (g === 'round') {
    F(sm([[hx - 140, hy - 20], [hx - 136, hy - 104], [hx - 72, hy - 170], [hx + 20, hy - 186], [hx + 112, hy - 158], [hx + 158, hy - 86], [hx + 166, hy - 20], [hx + 120, hy - 32], [hx, hy - 44], [hx - 104, hy - 30]]), c.gearCol, { line: 8, seed: 530, shadowCol: '#14161e', shadow: 0.4, off: 0.2, hi: 0.35, soft: 0.35 });
    F(sm([[hx - 160, hy - 24], [hx, hy - 54], [hx + 178, hy - 22], [hx + 176, hy + 2], [hx, hy - 24], [hx - 160, hy + 2]]), '#4c5155', { line: 7, seed: 531, shadow: 0.3, shadowCol: '#14161e' });
    Ln(sm([[hx - 92, hy - 146], [hx - 40, hy - 168], [hx + 20, hy - 172]], false), 6, 532, 'rgba(255,255,255,0.4)');
  } else if (g === 'brodie') {
    F(ell(hx, hy - 52, 196, 34), c.gearCol, { line: 8, seed: 533, shadowCol: '#1a180a', shadow: 0.35, hi: 0.2 });
    F(sm([[hx - 112, hy - 60], [hx - 96, hy - 130], [hx, hy - 160], [hx + 96, hy - 130], [hx + 112, hy - 60]]), c.gearCol, { line: 8, seed: 534, shadowCol: '#1a180a', shadow: 0.4, hi: 0.3, soft: 0.3 });
    Ln(sm([[hx - 60, hy - 130], [hx, hy - 146], [hx + 40, hy - 142]], false), 5, 535, 'rgba(255,255,240,0.35)');
  } else if (g === 'fur') {
    const fur = (pts) => { const o = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; o.push(a); o.push([lerp(a[0], b[0], 0.5) + (hash(i + 3) - 0.5) * 14, lerp(a[1], b[1], 0.5) - 9 - 7 * hash(i)]); } return o; };
    for (const s of [-1, 1]) F(sm([[hx + s * 116, hy - 40], [hx + s * 152, hy - 24], [hx + s * 162, hy + 60], [hx + s * 136, hy + 92], [hx + s * 112, hy + 30]]), '#5e5c5a', { line: 7, seed: 536 + s, shadowCol: '#1e1c22', shadow: 0.35 });
    F(sm(fur([[hx - 150, hy - 30], [hx - 146, hy - 110], [hx - 70, hy - 170], [hx + 60, hy - 170], [hx + 146, hy - 110], [hx + 150, hy - 30], [hx + 100, hy - 50], [hx, hy - 62], [hx - 100, hy - 50]])), '#5a5856', { line: 8, seed: 538, shadowCol: '#1e1c22', shadow: 0.4, soft: 0.3 });
    F(sm(fur([[hx - 164, hy - 56], [hx - 120, hy - 92], [hx, hy - 104], [hx + 120, hy - 92], [hx + 166, hy - 56], [hx + 158, hy - 14], [hx, hy - 46], [hx - 158, hy - 14]])), c.gearCol, { line: 7, seed: 539, shadowCol: '#1e1c22', shadow: 0.35, soft: 0.3 });
    F(ell(hx, hy - 76, 15, 15), '#b59a5a', { line: 4, seed: 540, shadow: 0.25 });
  } else if (g === 'cap') {
    F(sm([[hx - 130, hy - 50], [hx - 118, hy - 140], [hx, hy - 170], [hx + 118, hy - 140], [hx + 130, hy - 50]]), c.gearCol, { line: 8, seed: 541, shadowCol: '#101a08', shadow: 0.4, soft: 0.3, hi: 0.25 });
    F(sm([[hx - 136, hy - 54], [hx + 136, hy - 54], [hx + 120, hy - 26], [hx - 120, hy - 26]]), '#3a4e28', { line: 7, seed: 542, shadow: 0.3, shadowCol: '#101a08' });
    F(ell(hx, hy - 96, 14, 14), '#c9a95a', { line: 4, seed: 543, shadow: 0.2 });
  } else if (g === 'hair') {
    const hairD = sm([[hx - 140, hy + 46], [hx - 146, hy - 34], [hx - 116, hy - 108], [hx - 48, hy - 150], [hx + 40, hy - 152], [hx + 116, hy - 114], [hx + 146, hy - 40], [hx + 144, hy + 56], [hx + 128, hy + 26], [hx + 88, hy - 20], [hx + 28, hy - 52], [hx - 34, hy - 68], [hx - 68, hy - 52], [hx - 100, hy - 14], [hx - 122, hy + 34]]);
    F(hairD, '#6a4128', { line: 8, seed: 544, shadowCol: '#1e0c04', shadow: 0.45, shadowD: sm([[hx + 40, hy - 152], [hx + 116, hy - 114], [hx + 146, hy - 40], [hx + 144, hy + 56], [hx + 128, hy + 26], [hx + 100, hy - 46], [hx + 54, hy - 100]]), hi: 0.35, soft: 0.3 });
    Ln(sm([[hx - 48, hy - 148], [hx - 56, hy - 108], [hx - 62, hy - 66]], false), 4, 545, 'rgba(30,12,4,0.85)');
  } else if (g === 'tophat') {
    F(ell(hx, hy - 96, 150, 26), '#f2efe8', { line: 7, seed: 546, shadow: 0.25, hi: 0.2 });
    F(sm([[hx - 104, hy - 104], [hx - 96, hy - 300], [hx + 96, hy - 300], [hx + 104, hy - 104]]), '#f2efe8', { line: 8, seed: 547, shadow: 0.3, soft: 0.25 });
    for (let i = 0; i < 4; i++) F(rectD(hx - 100 + i * 54, hy - 296, 26, 140), '#c4302c', { line: 0, shadow: 0, hi: 0, soft: 0, tex: 0.1 });
    F(sm([[hx - 104, hy - 104], [hx - 100, hy - 160], [hx + 100, hy - 160], [hx + 104, hy - 104]]), '#24387a', { line: 6, seed: 548, shadow: 0.3 });
    for (let i = 0; i < 4; i++) star(hx - 66 + i * 44, hy - 132, 13, '#f7f3ea');
    F(ell(hx, hy - 300, 98, 18), '#e7e3da', { line: 7, seed: 549, shadow: 0.2 });
  }
}
export function star(x, y, r, col) { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } F(poly(p), col, { line: 2.5, shadow: 0, hi: 0, soft: 0, tex: 0 }); }
function face(o, hx, hy) {
  const m = o.mood || 'neutral', lk = o.look || [0, 0], bl = o.blink ? 1 : 0, ex = 46, ey = hy + 22;
  const L = { smug: 0.5, frown: 0.42, neutral: 0.22, sad: 0.3, scared: 0, happy: 0, shout: 0.1, sly: 0.55 }[m] ?? 0.2;
  const tilt = m === 'frown' ? 5 : m === 'sad' ? -5 : 0, sc = m === 'scared' ? 1.35 : 1.18;
  if (m === 'happy' && !bl) { for (const d of [-1, 1]) Ln(sm([[hx + d * ex - 16, ey + 6], [hx + d * ex, ey - 10], [hx + d * ex + 16, ey + 6]], false), 7, 560 + d); }
  else { eye(hx - ex, ey, sc, bl ? 1 : L, tilt, lk); eye(hx + ex, ey, sc, bl ? 1 : L, -tilt, lk); }
  const by = hy - 20;
  if (m === 'frown') { brow(hx - 92, by - 12, hx - 18, by + 10, 10, 561, 6); brow(hx + 18, by + 10, hx + 92, by - 12, 10, 562, 6); Ln(sm([[hx - 8, by + 4], [hx - 4, by + 26]], false), 3.5, 563); }
  else if (m === 'sad' || m === 'scared') { brow(hx - 90, by + 6, hx - 22, by - 14, 9, 561, 4); brow(hx + 22, by - 14, hx + 90, by + 6, 9, 562, 4); }
  else if (m === 'smug' || m === 'sly') { brow(hx - 84, by + 4, hx - 22, by + 6, 9, 561, -2); brow(hx + 22, by + 6, hx + 84, by - 2, 9, 562, -2); }
  else { brow(hx - 84, by - 6, hx - 22, by - 8, 8, 561, 3); brow(hx + 22, by - 8, hx + 84, by - 6, 8, 562, 3); }
  const my = hy + 94, talk = o.talk ? Math.abs(Math.sin(o.t * 14)) : 0;
  if (m === 'happy' || m === 'shout' || talk > 0.2) { const op = m === 'shout' ? 1 : m === 'happy' ? 0.7 : talk * 0.6; F(sm([[hx - 30, my - 6], [hx + 30, my - 6], [hx + 18, my + 10 + 26 * op], [hx - 18, my + 10 + 26 * op]]), '#5b2626', { line: 6, seed: 564, shadow: 0 }); }
  else if (m === 'scared') F(ell(hx, my + 4, 14, 18), '#5b2626', { line: 6, seed: 564, shadow: 0 });
  else if (m === 'sly') Ln(sm([[hx - 26, my], [hx + 4, my + 6], [hx + 30, my - 8]], false), 7, 564);
  else Ln(sm([[hx - 22, my + 4], [hx, my - 4], [hx + 22, my + 4]], false), 7, 564);
  if (m === 'scared' || o.sweat) F(sm([[hx + 120, hy - 50], [hx + 134, hy - 20], [hx + 128, hy], [hx + 112, hy - 4], [hx + 110, hy - 24]]), '#bfe3f7', { line: 4, seed: 565, shadow: 0.1, hi: 0.5 });
}
export function person(o) {
  const c = OUT[o.outfit || 'grey'], t = o.t || 0, bob = Math.sin(t * 2.4 + (o.x || 0)) * 3;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale((o.s || 1) * (o.flip ? -1 : 1), o.s || 1); ctx.rotate((o.lean || 0) * Math.PI / 180);
  const armB = o.armB || [12, 8], armF = o.armF || [12, 8];
  // legs
  if (o.legs) {
    for (const s of [-1, 1]) { const kx = s * (o.stance || 60);
      F(tube([[s * 52, 60], [kx, 200], [kx * 1.05, 300]], [100, 86, 76]), c.civ ? '#4a5560' : c.coat, { line: 7, seed: 570 + s, shadowCol: c.sh, shadow: 0.4 });
      F(sm([[kx * 1.05 - 44, 270], [kx * 1.05 + 30, 266], [kx * 1.05 + s * 70, 300], [kx * 1.05 + s * 66, 330], [kx * 1.05 - 50, 332]]), '#28262a', { line: 7, seed: 572 + s, shadow: 0.2, hi: 0.3, shadowCol: '#000' }); }
  }
  // back arm
  const flipSide = o.frontSide || 1;
  arm(o, -flipSide, armB, c);
  // torso
  F(sm([[-112, -300], [0, -318], [112, -300], [134, -250], [124, -120], [124, o.legs ? 110 : 520], [-124, o.legs ? 110 : 520], [-124, -120], [-134, -250]]), c.coat, { line: 8, seed: 580, shadowCol: c.sh, shadow: 0.38, soft: 0.3, shadowD: sm([[60, -310], [134, -250], [124, -120], [124, 120], [60, 120], [80, -120], [90, -240]]) });
  if (c.suit) {
    F(poly([[-50, -312], [50, -312], [0, -190]]), '#f2efe8', { line: 6, seed: 581, shadow: 0.1 });
    if (c.sam) { F(sm([[-46, -304], [0, -288], [46, -304], [40, -276], [0, -282], [-40, -276]]), '#c4302c', { line: 5, seed: 582, shadow: 0.2, hi: 0.3 }); F(sm([[-30, -270], [30, -270], [36, 20], [-36, 20]]), '#f2efe8', { line: 6, seed: 583, shadow: 0.2 }); for (const y of [-220, -150, -80]) F(ell(0, y, 7, 7), '#24387a', { line: 3, seed: y, shadow: 0 }); }
    else F(sm([[-12, -300], [12, -300], [18, -190], [0, -160], [-18, -190]]), '#15181c', { line: 5, seed: 582, shadow: 0.2, hi: 0.3 });
    F(poly([[-62, -306], [-14, -290], [-20, -150], [-56, -220]]), c.coat, { line: 5, seed: 584, shadow: 0.3, shadowCol: c.sh }); F(poly([[62, -306], [14, -290], [20, -150], [56, -220]]), c.coat, { line: 5, seed: 585, shadow: 0.45, shadowCol: c.sh });
  } else if (c.civ) {
    F(poly([[-40, -312], [40, -312], [0, -260]]), '#e9e4d8', { line: 5, seed: 581, shadow: 0.1 });
    for (const y of [-240, -170, -100, -30]) F(ell(0, y, 6, 6), '#e9e4d8', { line: 3, seed: y, shadow: 0 });
    Ln('M 0 -300 L 0 20', 3.5, 586, 'rgba(20,20,30,0.5)');
  } else {
    F(poly([[-50, -312], [0, -296], [-26, -246]]), c.coat, { line: 5, seed: 581, shadow: 0.2, shadowCol: c.sh }); F(poly([[50, -312], [0, -296], [26, -246]]), c.coat, { line: 5, seed: 582, shadow: 0.35, shadowCol: c.sh });
    for (const y of [-220, -150]) F(ell(0, y, 7, 7), '#3a3a3e', { line: 3, seed: y, shadow: 0 });
    Ln('M 0 -296 L 0 0', 3.5, 586, 'rgba(20,20,30,0.5)');
    Ln(sm([[-92, -240], [-50, -236], [-48, -214]], false), 4, 587); Ln(sm([[92, -240], [50, -236], [48, -214]], false), 4, 588);
    if (c.belt) { F(sm([[-126, -30], [126, -30], [128, 10], [-126, 12]]), '#262224', { line: 6, seed: 589, shadow: 0.1, hi: 0.3 }); F(rectD(-20, -32, 40, 44, 7), '#4a4a4e', { line: 4, seed: 590, shadow: 0.2, hi: 0.4 }); }
  }
  for (const [pts, sd] of [[[[-80, -140], [-90, -100]], 591], [[[70, -90], [84, -50]], 592]]) Ln(sm(pts, false), 3.5, sd, 'rgba(20,20,30,0.45)');
  // head
  const hx = 0, hy = -440 + bob;
  at(hx, hy, o.headTilt || 0, 1, () => at(-hx, -hy, 0, 1, () => {
    head(hx, hy, 132, 146, 600, '#7f7b90', 0.32, !!o.softHead);
    if (c.sam) { F(sm([[hx - 50, hy + 112], [hx + 50, hy + 112], [hx + 30, hy + 196], [hx, hy + 222], [hx - 30, hy + 196]]), '#f2efe8', { line: 6, seed: 601, shadow: 0.2 }); for (const s of [-1, 1]) F(sm([[hx + s * 126, hy - 40], [hx + s * 150, hy], [hx + s * 140, hy + 60], [hx + s * 120, hy + 30]]), '#f2efe8', { line: 6, seed: 602 + s, shadow: 0.2 }); }
    face(o, hx, hy);
    if (c.gear === 'hair') at(hx - 4, hy + 80, -3, 1, () => { F(poly([[-26, -18], [26, -20], [34, 16], [-34, 18]]), '#553422', { line: 6, seed: 603, shadowCol: '#140602', shadow: 0.35, shadowD: rectD(-50, 4, 100, 30), hi: 0.3 }); });
    gear(c, hx, hy, t);
  }));
  // front arm
  const hand = arm(o, flipSide, armF, c);
  if (o.prop) o.prop(hand[0], hand[1]);
  ctx.restore();
}

// ── Europe map (lon/lat polygons, hand-simplified) ──────────────────────
const EU = [[-9.5, 37], [-5.6, 36], [-2, 36.8], [0, 38.8], [0.5, 40.5], [3, 42], [3.5, 43.2], [6, 43.1], [7.5, 43.8], [9, 44.4], [10.5, 43.5], [12, 42], [14, 41], [15.6, 40.1], [16, 38], [15.7, 38], [17, 39], [18.5, 40.2], [17, 41], [16, 41.9], [14, 42.5], [13.5, 43.6], [12.3, 44.5], [12.5, 45.5], [13.7, 45.6], [15, 45], [16, 43.5], [18.5, 42.4], [19.5, 41.8], [19.4, 40.3], [21, 38.5], [21.6, 37], [22.5, 36.5], [23, 38], [24, 38.2], [22.9, 40.5], [24, 40.8], [26, 40.8], [26.3, 41.3], [28, 41], [29, 41.2], [28, 42.5], [28.6, 43.5], [29.7, 45.2], [30.7, 46.5], [32, 46.5], [33, 45.3], [33.6, 44.5], [35.5, 45], [36.5, 45.4], [35, 46.2], [35, 46.8], [38, 47.2], [39, 47], [37.5, 44.7], [39.5, 43.5], [41.5, 41.5], [60, 41], [60, 72], [45, 68], [41, 67], [36, 69.5], [33, 69.3], [30, 70], [28, 71], [25, 71], [20, 70], [16, 69], [14, 67.5], [12.5, 65.5], [10.5, 64], [7, 62.5], [5, 61.5], [5, 60], [5.5, 58.8], [7, 58], [8, 58.1], [10.5, 59.2], [11.5, 58], [12.5, 56.2], [14, 55.4], [16, 56.2], [16.5, 57.5], [18.5, 59.4], [17.5, 61], [17.5, 62.5], [21, 64.5], [22.5, 65.8], [25, 65.7], [25.4, 64.9], [21.5, 63], [21.5, 61], [22.5, 60.2], [25, 60.2], [28, 60.5], [30, 60], [28, 59.5], [23.5, 59.3], [23.5, 58.3], [24.3, 57.5], [21, 57], [21, 56], [21.2, 55.2], [19.5, 54.5], [18.6, 54.4], [16.5, 54.5], [14, 54], [12.5, 54.4], [11, 54], [10, 54.5], [9.8, 55], [10.6, 56.5], [10.3, 57.6], [8.6, 57.1], [8.1, 55.6], [8.6, 54.9], [8.8, 54], [8, 53.6], [7, 53.5], [5, 53.3], [4.5, 52.5], [3.7, 51.4], [2.5, 51.1], [1.6, 50.9], [1.6, 50.2], [0.2, 49.7], [-1.3, 49.6], [-1.3, 48.8], [-3, 48.8], [-4.7, 48.5], [-4.3, 47.8], [-2.5, 47.3], [-1.2, 46], [-1.2, 44.7], [-1.5, 43.4], [-4, 43.4], [-8, 43.7], [-9.3, 43], [-8.8, 42], [-8.9, 40.5], [-9.5, 38.8], [-8.8, 38.3], [-8.8, 37.2]];
const GB = [[-5.7, 50.1], [-3, 50.6], [1.4, 51.2], [1.7, 52.6], [0.3, 53.4], [-0.3, 54.5], [-1.6, 55.6], [-2, 56], [-1.8, 57.5], [-3.5, 58.6], [-5, 58.6], [-6.2, 57.5], [-5.6, 56.3], [-5, 55], [-3, 54.9], [-3.4, 54.3], [-3, 53.4], [-4.6, 53.3], [-4.2, 52.3], [-5.3, 51.8], [-3.2, 51.4], [-4.5, 51.2]];
const IE = [[-6, 52.2], [-6.2, 53.5], [-5.6, 54.6], [-7.2, 55.3], [-8.5, 54.7], [-10, 54], [-9.5, 52.5], [-10.2, 51.6], [-8, 51.6]];
const ISLES = [[[12.4, 38], [15.6, 38.3], [15.1, 36.7], [12.5, 37.6]], [[8.4, 39], [9.6, 39.2], [9.7, 41], [8.2, 40.9]], [[8.6, 41.4], [9.4, 41.4], [9.4, 43], [8.6, 42.4]], [[23.5, 35.3], [26.3, 35.1], [26, 35.4], [23.6, 35.6]]];
const ANAT = [[29.2, 41.2], [31, 41.2], [33, 42], [36, 41.7], [41.5, 41.5], [60, 41], [60, 30], [36, 30], [36, 36.6], [33, 36.1], [30.5, 36.3], [28, 36.7], [27, 38], [26.2, 40], [26.7, 40.4]];
const AFR = [[-20, 34], [-6, 35.8], [-2, 35.1], [3, 36.8], [10, 37.2], [11, 36.8], [10.5, 35], [10, 34], [11, 33], [15, 32.3], [20, 31.2], [25, 31.7], [30, 31.4], [32, 31.2], [34.5, 31.5], [36, 30], [36, 20], [-20, 20]];
export const LANDS = [EU, GB, IE, ...ISLES, ANAT, AFR];
export const GERMANY = [[6.1, 50.8], [6.4, 49.5], [8, 49], [7.6, 47.6], [9.5, 47.6], [13, 47.5], [13.8, 48.6], [12.4, 50.2], [15, 51], [14.8, 52.1], [14.2, 53.9], [13, 54.6], [11, 54.2], [9.9, 54.8], [8.6, 54.9], [8.8, 54], [7, 53.5], [7, 52.3], [6, 51.8]];
export const REICH = [[-6, 48.6], [-1.6, 43.3], [3, 42.5], [7.5, 43.8], [13.5, 45.8], [16, 44], [20, 42], [26, 41], [30, 45.6], [40, 47.5], [50, 46], [50, 64], [32, 64], [26, 61], [22, 59], [16, 56.5], [8.5, 57.8], [6, 53.6], [2, 51.2], [-6, 48.6]];
export const ROME = [[-11, 44.5], [-5, 48.6], [-2, 51], [4, 51.8], [6.5, 51.5], [7.5, 50], [8.5, 48.8], [10, 48.2], [12, 48.5], [14.5, 48.2], [16.5, 48], [18.5, 47.5], [19.5, 45.8], [21.5, 44.8], [23, 45.5], [25, 46.2], [27, 45.6], [28.7, 45.3], [30, 45.6], [33, 44.8], [35, 45], [38, 44], [41.5, 41.5], [43, 40.5], [44.5, 38.5], [45, 36], [47, 33], [48.5, 30.5], [45, 30], [40, 32], [36.5, 30.5], [35.5, 29], [34, 29.5], [32.5, 24], [31.5, 22], [30.5, 24], [30, 28.5], [28, 30.5], [25, 31], [20, 30], [15, 30.5], [12, 31.3], [10, 32.5], [8, 33.5], [5, 34.5], [0, 34], [-4, 34], [-7, 33], [-10, 34]];
export const ROME_GB = [[-6, 49.8], [2, 50.5], [2, 55], [-6, 55]];
export const proj = (box) => (lon, lat) => [box[0] + (lon - box[2]) * 0.62 * box[4], box[1] + (box[3] - lat) * box[4]];
const pathOf = (pr, pts) => poly(pts.map(([lo, la]) => pr(lo, la)));
/** draw a map inside a rect; box = [x, y, lon0, lat0, pxPerDeg]; regions: [{ pts, col, alpha }] filled over land */
export function europe(box, regions = [], o = {}) {
  const pr = proj(box), landD = LANDS.map((p) => pathOf(pr, p)).join(' ');
  F(landD, o.land || '#ece2c6', { line: 6, seed: 700, shadow: 0, hi: 0, soft: 0, tex: 0.12 });
  ctx.save(); clipTo(landD);
  for (const r of regions) { if (!r || r.alpha === 0) continue; ctx.save(); ctx.globalAlpha = r.alpha ?? 1; clipTo(pathOf(pr, r.pts)); ctx.fillStyle = r.col; ctx.fillRect(-2e3, -2e3, 6e3, 6e3);
    ctx.restore();
    if (r.edge !== false) Ln(pathOf(pr, r.pts), 3.5, 701, 'rgba(40,24,20,0.7)'); }
  ctx.restore();
  for (const p of LANDS) Ln(pathOf(pr, p), 5.5, 702);
  return pr;
}
// orthographic globe with simplified continents
export const WORLD = [EU, GB, IE, ANAT, AFR.slice(0, -2).concat([[51, 12], [43, 11], [40, 0], [40, -15], [35, -25], [20, -35], [17, -29], [12, -17], [13, -5], [9, 4], [-8, 4], [-17, 14], [-17, 21]]),
  [[60, 72], [100, 77], [140, 72], [180, 68], [180, 62], [160, 60], [140, 54], [130, 42], [122, 40], [120, 30], [110, 20], [105, 10], [100, 14], [92, 22], [80, 12], [72, 20], [66, 25], [57, 25], [50, 30], [48, 28], [36, 30], [60, 41]],
  [[-168, 66], [-140, 70], [-110, 69], [-90, 72], [-80, 63], [-64, 60], [-56, 50], [-66, 45], [-70, 42], [-76, 35], [-81, 30], [-80, 25], [-90, 30], [-97, 26], [-97, 20], [-90, 21], [-87, 15], [-83, 10], [-79, 8], [-92, 14], [-105, 20], [-112, 30], [-118, 34], [-124, 42], [-124, 48], [-135, 57], [-150, 60], [-165, 60]],
  [[-79, 8], [-60, 10], [-50, 0], [-35, -8], [-40, -22], [-48, -26], [-58, -35], [-65, -42], [-68, -54], [-75, -50], [-73, -40], [-71, -18], [-81, -5], [-80, 1]],
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [151, -34], [145, -38], [138, -35], [131, -31], [117, -35], [115, -32]],
  [[-50, 60], [-42, 60], [-20, 70], [-25, 80], [-60, 80], [-70, 76]]];
export function globe(cx, cy, R, lon0, lat0, regions = [], o = {}) {
  const r = Math.PI / 180, cl = Math.cos(lat0 * r), sl = Math.sin(lat0 * r);
  const pr = (lo, la) => { const c = Math.cos(la * r), dl = (lo - lon0) * r, x = c * Math.sin(dl), y = Math.sin(la * r) * cl - c * Math.cos(dl) * sl, z = Math.sin(la * r) * sl + c * Math.cos(dl) * cl;
    if (z < 0) { const n = Math.hypot(x, y) || 1; return [cx + x / n * R, cy - y / n * R]; } return [cx + x * R, cy - y * R]; };
  const dens = (pts) => { const o2 = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; for (let k = 0; k < 3; k++) o2.push([lerp(a[0], b[0], k / 3), lerp(a[1], b[1], k / 3)]); } return o2; };
  const disc = ell(cx, cy, R, R);
  F(disc, o.sea || '#9cc2dd', { line: 9, seed: 710, shadow: 0, hi: 0, soft: 0, tex: 0.1 });
  ctx.save(); clipTo(disc);
  const landD = WORLD.map((p) => poly(dens(p).map(([a, b]) => pr(a, b)))).join(' ');
  F(landD, o.land || '#ece2c6', { line: 0, shadow: 0, hi: 0, soft: 0, tex: 0.1, ink: false });
  ctx.save(); clipTo(landD); for (const rg of regions) { ctx.save(); ctx.globalAlpha = rg.alpha ?? 1; clipTo(poly(dens(rg.pts).map(([a, b]) => pr(a, b)))); ctx.fillStyle = rg.col; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); ctx.restore(); } ctx.restore();
  for (const p of WORLD) Ln(poly(dens(p).map(([a, b]) => pr(a, b))), 4, 711, 'rgba(43,34,32,0.85)');
  // grid + sphere shading
  for (let lo = -180; lo < 180; lo += 30) { let d = ''; for (let la = -80; la <= 80; la += 10) { const q = pr(lo, la); d += (d ? ' L ' : 'M ') + q[0] + ' ' + q[1]; } }
  const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R * 1.05); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(0.55, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(20,30,60,0.45)'); ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  if (o.spin) blur(8, () => { ctx.globalAlpha = o.spin; ctx.fillStyle = '#dfe9f2'; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.ellipse(cx, cy - R + i * R / 7, R * 0.95, 6, 0, 0, 6.3); ctx.fill(); } });
  ctx.restore();
  Ln(disc, 9, 712);
}
