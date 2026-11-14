// A 3/4-view character built like the reference's: big egg head, short coat body, jointed limbs, simple hands.
// Local origin = pelvis. d = facing (+1 right, -1 left). Angles in degrees from straight down, + = toward facing side.
import { ctx, lerp, hash, F, Ln, sm, poly, tube, xform, ellD, rectD, blur, at, INK } from './kit.js';
import { SKIN, SKIN_SH, eye, brow, smallHand } from './intro.js';

const R = Math.PI / 180;
const go = (p, a, len, d) => [p[0] + d * Math.sin(a * R) * len, p[1] + Math.cos(a * R) * len];
export const KIT = {
  grey: { coat: '#78808a', dark: '#565d66', sh: '#24262f', helm: '#5b6064', helmSh: '#16181e', boot: '#28262a', belt: '#262224' },
  soviet: { coat: '#6e7a48', dark: '#55603a', sh: '#1d2412', helm: '#7d6650', fur: true, boot: '#2a2622', belt: '#4a3a26' },
  khaki: { coat: '#8b7b52', dark: '#6f623f', sh: '#2c2412', helm: '#6e6a44', helmSh: '#1e1c0c', brodie: true, boot: '#3a2e22', belt: '#5a4a32' },
  irish: { coat: '#6a5e4a', dark: '#544a3a', sh: '#1e1810', helm: '#6e5e4c', helmSh: '#1e160c', boot: '#2e2a22', belt: '#3a3020', patch: true },
  civ: { coat: '#7d95ab', dark: '#5d6c80', sh: '#1a2434', boot: '#3a2a20', shirt: true, trousers: '#4a4a52' },
  civ2: { coat: '#9a7a5a', dark: '#7a5e42', sh: '#2a1a0c', boot: '#2a2420', shirt: true, trousers: '#3e3a36' },
  leader: { coat: '#3e464c', dark: '#30373c', sh: '#0e1218', boot: '#1e1c1c', suit: true, hair: true },
  sam: { coat: '#2d4387', dark: '#22346c', sh: '#0a1230', boot: '#1e1c1c', suit: true, sam: true, trousers: 'stripes' },
};
function limb(a, b, c, w0, w1, col, sh, seed, o = {}) {
  F(tube([a, [lerp(a[0], b[0], 0.5), lerp(a[1], b[1], 0.5)], b, [lerp(b[0], c[0], 0.5), lerp(b[1], c[1], 0.5)], c], [w0, (w0 + w1) / 2 + 2, (w0 + w1) / 2, w1 + 2, w1]), col, { line: 7, seed, shadowCol: sh, shadow: 0.38, off: 0.3, soft: 0.3, ...o });
}
/** o: { x, y, s, d, mood, look, blink, t, lean, tilt, armF:[sh,el], armB:[sh,el], legF:[hip,knee], legB:[hip,knee], kit, hold:fn(handF, handB), handF:'open'|'none', mouth } */
export function fig(o) {
  const k = KIT[o.kit || 'grey'], d = o.d ?? 1, t = o.t || 0;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.s || 1, o.s || 1); ctx.rotate((o.lean || 0) * R * d);
  const neck = [d * 6, -150], shF = [d * 54, -128], shB = [-d * 46, -136], hipF = [d * 24, -4], hipB = [-d * 22, -8];
  // 2-bone reach: arm angles that put the hand on a target point (elbow bends downward)
  const ik = (S0, T0, a = 66, b = 74) => { const vx = T0[0] - S0[0], vy = T0[1] - S0[1], D = Math.min(Math.hypot(vx, vy), a + b - 1), base = Math.atan2(vy, vx);
    const al = Math.acos(Math.max(-1, Math.min(1, (a * a + D * D - b * b) / (2 * a * D)))); let best = null;
    for (const sg of [1, -1]) { const ex = S0[0] + Math.cos(base + sg * al) * a, ey = S0[1] + Math.sin(base + sg * al) * a; if (!best || ey > best[1]) best = [ex, ey]; }
    const ang = (p, q) => Math.atan2(d * (q[0] - p[0]), q[1] - p[1]) / R, sa = ang(S0, best), fa = ang(best, T0); return [sa, fa - sa]; };
  const legB = o.legB || [-6, 6], legF = o.legF || [8, -4], armB = o.armBTo ? ik(shB, o.armBTo) : o.armB || [-10, 14], armF = o.armFTo ? ik(shF, o.armFTo) : o.armF || [10, 20];
  const leg = (hip, [ha, ka], seed, front) => { const kn = go(hip, ha, 70, d), ft = go(kn, ha + ka, 64, d), sa = ha + ka;
    const pants = k.trousers === 'stripes' ? '#f2efe8' : k.trousers || (k.suit ? k.dark : k.coat), mil = !k.suit && !k.shirt;
    const sh1 = go(kn, sa, 22, d), sh2 = go(kn, sa, 40, d);
    if (mil) { // puffy breeches ballooning over short boots
      F(tube([hip, go(hip, ha, 36, d), kn, sh1], [82, 112, 94, 54]), pants, { line: 7, seed, shadowCol: k.sh, shadow: 0.42, off: 0.3, soft: 0.35 });
      F(tube([sh1, ft], [50, 44]), k.boot, { line: 6, seed: seed + 5, shadowCol: '#000', shadow: 0.25, hi: 0.4, soft: 0.2 });
    } else { F(tube([hip, kn, sh2, ft], [62, 56, 52, 48]), pants, { line: 6, seed, shadowCol: k.sh, shadow: 0.4, off: 0.3, soft: 0.3 });
      if (k.trousers === 'stripes') for (let i = -1; i <= 1; i++) Ln(sm([[hip[0] + i * 14, hip[1]], [kn[0] + i * 12, kn[1]], [ft[0] + i * 10, ft[1] - 10]], false), 5, seed + 3 + i, '#c4302c'); }
    // foot: a rounded toe pointing the facing way, flat on the ground line through ft
    const fd = d, toe = sm([[ft[0] - 22 * fd, ft[1] - 16], [ft[0] + 22 * fd, ft[1] - 18], [ft[0] + 40 * fd, ft[1] - 4], [ft[0] + 38 * fd, ft[1] + 10], [ft[0] - 24 * fd, ft[1] + 10]]);
    F(toe, k.boot, { line: 6, seed: seed + 9, shadow: 0.2, hi: 0.4, shadowCol: '#000', soft: 0.2 });
    return ft; };
  const arm = (sh, [sa, ea], seed, front) => { const el = go(sh, sa, 66, d), hd = go(el, sa + ea, 62, d); limb(sh, el, hd, 62, 50, front ? k.coat : shade(k.coat), k.sh, seed);
    Ln(sm([[el[0] - 10, el[1] - 6], [el[0], el[1] + 4], [el[0] + 8, el[1]]], false), 3, seed + 2, 'rgba(20,20,30,0.5)');
    const dir = [d * Math.sin((sa + ea) * R), Math.cos((sa + ea) * R)], h = [hd[0] + dir[0] * 12, hd[1] + dir[1] * 12]; return { h, dir }; };
  const handAt = ({ h, dir }, seed, sz = 0.52, n = 4, len = 0.9) => smallHand(h[0], h[1], Math.atan2(dir[1], dir[0]) - Math.PI, sz, seed, n, len);
  // back limbs
  leg(hipB, legB, 900, false);
  const aB = arm(shB, armB, 910, false); if (o.handB !== 'none') handAt(aB, 915);
  leg(hipF, legF, 920, true);
  // coat: torso + skirt, a little 3/4 (front side wider)
  const torso = sm([[-d * 46, -150], [d * 8, -160], [d * 58, -146], [d * 74, -100], [d * 80, -30], [d * 82, 26], [d * 30, 46], [-d * 40, 46], [-d * 76, 26], [-d * 76, -48], [-d * 66, -120]]);
  F(torso, k.coat, { line: 8, seed: 930, shadowCol: k.sh, shadow: 0.4, soft: 0.3, shadowD: sm([[-d * 40, -146], [-d * 10, -150], [-d * 16, -40], [-d * 12, 44], [-d * 52, 30], [-d * 48, -40], [-d * 50, -110]]) });
  if (k.suit) { F(poly([[d * -8, -150], [d * 30, -150], [d * 12, -96]]), '#f2efe8', { line: 4.5, seed: 931, shadow: 0.1 });
    if (k.sam) { F(sm([[d * -6, -146], [d * 12, -138], [d * 30, -146], [d * 28, -128], [d * 12, -134], [d * -4, -128]]), '#c4302c', { line: 4, seed: 932, shadow: 0.2, hi: 0.3 }); F(sm([[d * 0, -128], [d * 26, -128], [d * 28, 30], [d * 2, 30]]), '#f2efe8', { line: 4.5, seed: 933, shadow: 0.2 }); }
    else F(sm([[d * 8, -146], [d * 18, -146], [d * 20, -96], [d * 13, -86], [d * 6, -96]]), '#15181c', { line: 3.5, seed: 932, shadow: 0.2 });
    Ln(sm([[d * -10, -150], [d * 4, -100], [d * 8, 30]], false), 4, 934); Ln(sm([[d * 32, -150], [d * 20, -100]], false), 4, 935);
    for (const y of [-60, -20]) F(ellD(d * 24, y, 4.5, 4.5), '#1a1c20', { line: 2, seed: y, shadow: 0 }); }
  else if (k.shirt) { F(poly([[d * -12, -150], [d * 28, -150], [d * 8, -118]]), '#ece6d8', { line: 4, seed: 931, shadow: 0.1 }); Ln(sm([[d * 8, -120], [d * 8, 30]], false), 3, 934, 'rgba(20,20,30,0.5)'); for (const y of [-90, -50, -10]) F(ellD(d * 12, y, 4, 4), '#ece6d8', { line: 2, seed: y, shadow: 0 }); }
  else { F(poly([[d * -16, -152], [d * 10, -140], [d * -2, -116]]), k.dark, { line: 4, seed: 931, shadow: 0.2 }); F(poly([[d * 10, -140], [d * 40, -150], [d * 26, -116]]), k.dark, { line: 4, seed: 932, shadow: 0.2 });
    for (const y of [-100, -66]) F(ellD(d * 14, y, 4.5, 4.5), '#2a2a2e', { line: 2, seed: y, shadow: 0 }); Ln(sm([[d * 14, -140], [d * 12, 40]], false), 3, 934, 'rgba(20,20,30,0.5)');
    Ln(sm([[d * 24, 0], [d * 46, -2], [d * 48, 10]], false), 3, 936); Ln(sm([[-d * 36, 4], [-d * 14, 2], [-d * 12, 14]], false), 3, 937); }
  if (k.patch) { for (const [i, c] of [[0, '#3f8a4a'], [1, '#f4f1ea'], [2, '#e88a3a']]) F(rectD(d * (-30 + i * 22) - (d < 0 ? 22 : 0), -126, 22, 60), c, { line: 0, shadow: 0, soft: 0, hi: 0 }); Ln(rectD(d > 0 ? -30 : -36, -126, 66, 60), 4, 948); }
  if (k.fur) for (let i = -3; i <= 3; i++) Ln(sm([[d * i * 17, -140], [d * (i * 18 + 2), -60], [d * i * 19, 40]], false), 3, 945 + i, 'rgba(20,26,10,0.55)');
  if (!k.suit && !k.shirt) { F(sm([[-d * 50, -38], [d * 58, -40], [d * 58, -20], [-d * 50, -18]]), k.belt, { line: 5, seed: 938, shadow: 0.15, hi: 0.3 }); F(rectD(d * 10 - 11, -42, 22, 26, 4), '#8a8a8e', { line: 3.5, seed: 939, shadow: 0.2, hi: 0.4 }); F(rectD(d * 34 - 12, -36, 24, 26, 4), k.belt, { line: 3.5, seed: 940, shadow: 0.2 }); }
  Ln(sm([[d * 30, -10], [d * 36, 20]], false), 3, 941, 'rgba(20,20,30,0.45)');
  // held prop sits between body and front arm
  const aF0 = (() => { const el = go(shF, armF[0], 66, d), hd = go(el, armF[0] + armF[1], 62, d); return hd; })();
  const aF = arm(shF, armF, 950, true);
  if (o.hold) o.hold(aF0, go(go(shB, armB[0], 66, d), armB[0] + armB[1], 62, d), d);
  if (o.handF === 'point') handAt(aF, 955, 0.6, 1, 1.5); else if (o.handF !== 'none') handAt(aF, 955);
  // head
  const hx = neck[0] + d * 10, hy = -218;
  at(hx, hy, (o.tilt || 0) * d, o.hs || 0.72, () => at(-hx, -hy, 0, 1, () => head3q(o, k, hx, hy, d, t)));
  ctx.restore();
}
const shade = (c) => c; // back limbs: same colour, the cel shadow + darker outline already separate them
function head3q(o, k, hx, hy, d, t) {
  const rx = 84, ry = 102, hd = ellD(hx, hy, rx, ry);
  F(hd, SKIN, { line: 7.5, seed: 960, shadow: 0.17, shadowCol: '#7f7b90', shadowD: ellD(hx - d * rx * 0.5, hy + ry * 0.15, rx * 0.72, ry * 1.05), hi: 0.25, soft: 0.25 });
  const m = o.mood || 'neutral', bl = o.blink, lk = o.look || [d * 2, 0];
  const e1 = [hx + d * 4, hy + 16], e2 = [hx + d * 52, hy + 14], sc = m === 'scared' ? 1.05 : 0.86;
  const L = { smug: 0.52, frown: 0.42, neutral: 0.2, sad: 0.32, scared: 0, happy: 0, shout: 0.1, sly: 0.55, focus: 0.5 }[m] ?? 0.2, tl = m === 'frown' || m === 'focus' ? 4 : m === 'sad' ? -4 : 0;
  if (m === 'happy' && !bl) for (const e of [e1, e2]) Ln(sm([[e[0] - 11, e[1] + 4], [e[0], e[1] - 8], [e[0] + 11, e[1] + 4]], false), 5.5, e[0] | 0);
  else if (m === 'focus' && !bl) { eye(e1[0], e1[1], sc, 1, 0, lk); eye(e2[0], e2[1], sc, 0.5, -tl, lk); }
  else { eye(e1[0], e1[1], sc, bl ? 1 : L, tl * d, lk); eye(e2[0], e2[1], sc, bl ? 1 : L, -tl * d, lk); }
  const by = hy - 16;
  if (m === 'frown' || m === 'focus') { brow(e1[0] - 18, by - 6, e1[0] + 14, by + 6, 7, 961, 3); brow(e2[0] - 14, by + 6, e2[0] + 18, by - 6, 7, 962, 3); }
  else if (m === 'sad' || m === 'scared') { brow(e1[0] - 18, by + 4, e1[0] + 14, by - 8, 6.5, 961, 3); brow(e2[0] - 14, by - 8, e2[0] + 18, by + 4, 6.5, 962, 3); }
  else if (m === 'smug' || m === 'sly') { brow(e1[0] - 16, by + 4, e1[0] + 14, by + 4, 6.5, 961, -1); brow(e2[0] - 14, by + 4, e2[0] + 16, by - 2, 6.5, 962, -1); }
  else { brow(e1[0] - 16, by - 2, e1[0] + 14, by - 4, 6, 961, 2); brow(e2[0] - 14, by - 4, e2[0] + 16, by - 2, 6, 962, 2); }
  const mx = hx + d * 32, my = hy + 58, op = m === 'shout' ? 1 : m === 'happy' ? 0.6 : o.talk ? Math.abs(Math.sin(t * 14)) * 0.6 : 0;
  if (op > 0.15) F(sm([[mx - 18, my - 4], [mx + 18, my - 4], [mx + 10, my + 6 + 18 * op], [mx - 10, my + 6 + 18 * op]]), '#5b2626', { line: 4.5, seed: 963, shadow: 0 });
  else if (m === 'scared') F(ellD(mx, my + 2, 8, 11), '#5b2626', { line: 4.5, seed: 963, shadow: 0 });
  else if (m === 'smug' || m === 'frown' || m === 'sad') Ln(sm([[mx - 13, my + 3], [mx, my - 3], [mx + 13, my + 3]], false), 5, 963);
  else Ln(sm([[mx - 13, my], [mx + 2, my + 4], [mx + 13, my - 2]], false), 5, 963);
  if (o.sweat) F(sm([[hx - d * 70, hy - 40], [hx - d * 60, hy - 18], [hx - d * 64, hy - 4], [hx - d * 76, hy - 6], [hx - d * 78, hy - 22]]), '#bfe3f7', { line: 3, seed: 964, shadow: 0.1, hi: 0.5 });
  if (k.hair) {
    F(sm([[hx - 92, hy + 30], [hx - 96, hy - 30], [hx - 70, hy - 84], [hx - 10, hy - 106], [hx + 56, hy - 96], [hx + 90, hy - 56], [hx + 94, hy - 4], [hx + 70, hy - 36], [hx + 20, hy - 56], [hx - 30, hy - 50], [hx - 60, hy - 20], [hx - 80, hy + 20]].map(([x, y]) => [hx + (x - hx) * d, y])), '#6a4128', { line: 6, seed: 965, shadowCol: '#1e0c04', shadow: 0.4, hi: 0.35, soft: 0.3 });
    at(hx + d * 30, hy + 42, -3 * d, 1, () => F(poly([[-17, -11], [17, -12], [22, 11], [-22, 12]]), '#553422', { line: 4.5, seed: 966, shadowCol: '#140602', shadow: 0.35, shadowD: rectD(-30, 2, 60, 20), hi: 0.3 }));
  }
  if (k.sam) {
    F(sm([[mx - 22, my + 10], [mx + 22, my + 10], [mx + 12, my + 56], [mx, my + 70], [mx - 12, my + 56]]), '#f2efe8', { line: 4.5, seed: 967, shadow: 0.2 });
    F(sm([[hx - d * 90, hy - 30], [hx - d * 112, hy + 10], [hx - d * 98, hy + 50], [hx - d * 80, hy + 20]]), '#f2efe8', { line: 4.5, seed: 968, shadow: 0.2 });
    F(ellD(hx, hy - 70, 104, 18), '#f2efe8', { line: 6, seed: 969, shadow: 0.25 }); const top = sm([[hx - 66, hy - 74], [hx - 60, hy - 220], [hx + 60, hy - 220], [hx + 66, hy - 74]]);
    F(top, '#f2efe8', { line: 6, seed: 970, shadow: 0.3, soft: 0.25 }); ctx.save(); ctx.beginPath(); for (const s of [...(window.__P || [])]) void s; ctx.restore();
    for (let i = 0; i < 3; i++) F(poly([[hx - 56 + i * 44, hy - 216], [hx - 34 + i * 44, hy - 216], [hx - 34 + i * 44, hy - 112], [hx - 56 + i * 44, hy - 112]]), '#c4302c', { line: 0, shadow: 0, hi: 0, soft: 0 });
    F(sm([[hx - 66, hy - 74], [hx - 63, hy - 112], [hx + 63, hy - 112], [hx + 66, hy - 74]]), '#24387a', { line: 5, seed: 971, shadow: 0.3 });
    star(hx, hy - 92, 15, '#f7f3ea'); F(ellD(hx, hy - 220, 60, 12), '#e7e3da', { line: 5, seed: 972, shadow: 0.2 });
  }
  if (k.helm) { const H = k.helm;
    if (k.fur) { F(sm([[hx - 98, hy - 20], [hx - 96, hy - 80], [hx - 40, hy - 118], [hx + 40, hy - 118], [hx + 96, hy - 80], [hx + 98, hy - 20], [hx + 60, hy - 34], [hx, hy - 40], [hx - 60, hy - 34]]), H, { line: 6, seed: 973, shadowCol: '#1e1c22', shadow: 0.4, soft: 0.3 });
      F(sm([[hx - 106, hy - 40], [hx, hy - 66], [hx + 106, hy - 40], [hx + 100, hy - 12], [hx, hy - 34], [hx - 100, hy - 12]]), '#a08a72', { line: 5, seed: 974, shadowCol: '#1e1c22', shadow: 0.35 });
      F(sm([[hx - d * 92, hy - 20], [hx - d * 108, hy + 30], [hx - d * 96, hy + 60], [hx - d * 80, hy + 10]]), '#a08a72', { line: 5, seed: 975, shadow: 0.35 }); F(ellD(hx + d * 10, hy - 52, 10, 10), '#b59a5a', { line: 3, seed: 976, shadow: 0.25 }); for (let i = 0; i < 14; i++) { const x = hx - 96 + i * 14; Ln(`M ${x} ${hy - 50 + 6 * hash(i)} l 4 -16`, 2.4, 980 + i, 'rgba(40,36,34,0.55)'); } }
    else if (k.brodie) { F(ellD(hx + d * 6, hy - 42, 132, 24), H, { line: 6, seed: 973, shadowCol: k.helmSh, shadow: 0.35, hi: 0.2 }); F(sm([[hx - 76, hy - 46], [hx - 64, hy - 100], [hx + 6, hy - 120], [hx + 70, hy - 100], [hx + 82, hy - 46]]), H, { line: 6, seed: 974, shadowCol: k.helmSh, shadow: 0.4, hi: 0.3, soft: 0.3 }); }
    else { F(sm([[hx - 104, hy + 8], [hx - 102, hy - 58], [hx - 52, hy - 112], [hx + 14, hy - 124], [hx + 78, hy - 104], [hx + 110, hy - 50], [hx + 114, hy + 8], [hx + 80, hy - 6], [hx, hy - 14], [hx - 74, hy - 6]].map(([x, y]) => [hx + (x - hx) * d, y])), H, { line: 7, seed: 973, shadowCol: k.helmSh, shadow: 0.42, off: 0.2, hi: 0.35, soft: 0.35 });
      F(sm([[hx - 116, hy + 2], [hx, hy - 20], [hx + 124, hy + 4], [hx + 122, hy + 20], [hx, hy], [hx - 116, hy + 20]]), '#4a4f53', { line: 5.5, seed: 975, shadow: 0.3, shadowCol: k.helmSh });
      Ln(sm([[hx - 60 * d, hy - 96], [hx - 20 * d, hy - 112], [hx + 20 * d, hy - 114]], false), 4.5, 976, 'rgba(255,255,255,0.4)'); } }
  if (k.cap) { F(sm([[hx - 92, hy - 36], [hx - 84, hy - 100], [hx, hy - 120], [hx + 84, hy - 100], [hx + 92, hy - 36]]), k.cap, { line: 6, seed: 977, shadowCol: '#101a08', shadow: 0.4, soft: 0.3, hi: 0.25 }); F(sm([[hx - 96, hy - 40], [hx + 96, hy - 40], [hx + 84, hy - 20], [hx - 84, hy - 20]]), '#3a4e28', { line: 5, seed: 978, shadow: 0.3 }); }
}
export function star(x, y, r, col) { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } F(poly(p), col, { line: 2.2, shadow: 0, hi: 0, soft: 0, tex: 0 }); }
/** rifle held between the back hand (trigger) and front hand (fore-end) */
export function rifleIn(hb, hf, d, len = 300) { const a = Math.atan2(hf[1] - hb[1], hf[0] - hb[0]); rifle(hb[0] - Math.cos(a) * 110, hb[1] - Math.sin(a) * 110 + 4, a, len); }
/** bolt-action rifle from butt (bx,by) toward a direction angle (rad) */
export function rifle(bx, by, ang, len = 300, d = 1) { ctx.save(); ctx.translate(bx, by); ctx.scale(d, 1); at(0, 0, ang / R, 1, () => {
  F(sm([[0, -10], [len * 0.55, -9], [len * 0.62, -4], [len * 0.62, 6], [len * 0.3, 8], [len * 0.12, 22], [0, 18]]), '#6a4426', { line: 5, seed: 990, shadow: 0.3, shadowCol: '#2a1206', hi: 0.3 });
  F(rectD(len * 0.3, -16, len * 0.72, 9, 3), '#3a3a3e', { line: 4, seed: 991, shadow: 0.2, hi: 0.4 }); F(rectD(len * 0.36, -24, 16, 10, 2), '#3a3a3e', { line: 3, seed: 992, shadow: 0 }); }); ctx.restore(); }
