// Our recurring character rig: stick limbs + bean body for volume + big round white head, ink outlines.
// char(x, groundY, s, o): o = { look: OPTION, mood, armL, armR, legSwing, lookX, facing }
import { ctx, S, INK, F, Ln, sm, ellD, tube, blur, poly } from './kit.js';

export const SKIN = '#f7f4ef', SKIN_SH = '#8f8aa3';
const ell = (cx, cy, rx, ry) => ellD(cx, cy, rx, ry);
const clipTo = (cx, cy, rx, ry) => { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.3); ctx.clip(); };

// ── body parts ──────────────────────────────────────────────────────────
function bean(cx, top, w, h, col, sh, seed) {
  // narrower shoulders, full rounded bottom: reads as a soft bean, gives the stick figure volume
  const pts = [[cx - w * 0.36, top + h * 0.06], [cx, top - h * 0.02], [cx + w * 0.36, top + h * 0.06], [cx + w * 0.5, top + h * 0.45],
    [cx + w * 0.47, top + h * 0.82], [cx + w * 0.22, top + h], [cx - w * 0.22, top + h], [cx - w * 0.47, top + h * 0.82], [cx - w * 0.5, top + h * 0.45]];
  F(sm(pts), col, { line: 7, seed, shadow: 0.34, shadowCol: sh, soft: 0.3, hi: 0.18,
    shadowD: sm([[cx + w * 0.12, top], [cx + w * 0.5, top + h * 0.4], [cx + w * 0.42, top + h * 0.9], [cx + w * 0.05, top + h * 1.05], [cx + w * 0.3, top + h * 0.5]]) });
}
export const LIMB = '#5e5a6a', LIMB_SH = '#1c1926';
// limbs are thin TUBES (fill + ink on both edges + light/shadow), not strings: resample a smooth centreline first
function curve(pts, n = 6) {
  const out = []; const [a, b, c] = pts.length === 3 ? pts : [pts[0], pts[1], pts[pts.length - 1]];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]]); }
  return out;
}
function limb(pts, w, seed, w1 = w * 0.82) {
  const c = curve(pts), ws = c.map((_, i) => w + (w1 - w) * i / (c.length - 1));
  F(tube(c, ws), LIMB, { line: 4.2, seed, shadow: 0.35, shadowCol: LIMB_SH, off: 0.35, soft: 0.25, hi: 0.22, tex: 0.1 });
}
function hand(x, y, r, seed) { F(ell(x, y, r * 1.05, r * 0.95), SKIN, { line: 4.5, seed, shadow: 0.2, shadowCol: SKIN_SH, soft: 0.15, hi: 0 }); }
function shoe(x, y, r, d, col, seed) { F(sm([[x - r * 0.8 * d, y - r * 0.75], [x + r * 0.5 * d, y - r * 0.85], [x + r * 1.45 * d, y - r * 0.3], [x + r * 1.4 * d, y + r * 0.25], [x - r * 0.85 * d, y + r * 0.3]]), col, { line: 4.5, seed, shadow: 0.3, soft: 0.2, hi: 0.2 }); }

function headShape(hx, hy, r, seed) {
  F(ell(hx, hy, r, r * 0.97), SKIN, { line: 8, seed, shadow: 0, hi: 0.2, soft: 0.18, shadowCol: SKIN_SH });
  ctx.save(); clipTo(hx, hy, r, r * 0.97);
  blur(r * 0.12, () => { ctx.fillStyle = 'rgba(120,112,150,0.30)'; ctx.beginPath(); ctx.ellipse(hx + r * 0.95, hy + r * 0.35, r * 0.55, r * 1.1, 0.25, 0, 6.3); ctx.fill(); });
  blur(14, () => { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(hx - r * 0.38, hy - r * 0.38, r * 0.32, r * 0.24, -0.5, 0, 6.3); ctx.fill(); });
  ctx.restore();
}

// ── face ────────────────────────────────────────────────────────────────
function eyeOval(x, y, rx, ry, lx = 0, ly = 0) {
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(x + lx, y + ly, rx, ry, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + lx - rx * 0.32, y + ly - ry * 0.4, rx * 0.34, 0, 6.3); ctx.fill();
}
const brow = (x0, y0, x1, y1, w, seed, bend = 0) => Ln(sm([[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 - bend], [x1, y1]], false), w, seed);
export function face(hx0, hy, r, mood = 'neutral', look = [0, 0], turn = 0) {
  const hx = hx0 + turn * r * 0.3; const ex = r * 0.3 * (1 - Math.abs(turn) * 0.18), ey = hy + r * 0.0, erx = r * 0.085, ery = r * 0.13, lx = look[0] * r * 0.06, ly = look[1] * r * 0.05, bw = r * 0.075;
  const L = hx - ex, R = hx + ex, my = hy + r * 0.42;
  if (mood === 'happy') {
    for (const x of [L, R]) Ln(sm([[x - erx * 1.4, ey + ery * 0.4], [x, ey - ery * 0.7], [x + erx * 1.4, ey + ery * 0.4]], false), r * 0.06, x | 0);
    F(sm([[hx - r * 0.24, my - r * 0.08], [hx + r * 0.24, my - r * 0.08], [hx + r * 0.16, my + r * 0.12], [hx, my + r * 0.17], [hx - r * 0.16, my + r * 0.12]]), '#5a1f22', { line: 4.5, shadow: 0, soft: 0, hi: 0, tex: 0 });
    F(sm([[hx - r * 0.1, my + r * 0.1], [hx + r * 0.1, my + r * 0.1], [hx, my + r * 0.165]]), '#e0707a', { line: 0, ink: false, shadow: 0, soft: 0, hi: 0, tex: 0 });
    brow(L - r * 0.12, ey - r * 0.3, L + r * 0.1, ey - r * 0.34, bw, 1, r * 0.03); brow(R - r * 0.1, ey - r * 0.34, R + r * 0.12, ey - r * 0.3, bw, 2, r * 0.03);
  } else if (mood === 'smug') {
    for (const x of [L, R]) { ctx.save(); ctx.beginPath(); ctx.rect(x - r, ey - ery * 0.15, 2 * r, r); ctx.clip(); eyeOval(x, ey, erx, ery, lx + r * 0.03, ly); ctx.restore();
      Ln(sm([[x - erx * 1.6, ey - ery * 0.1], [x + erx * 1.6, ey - ery * 0.25]], false), r * 0.055, x | 0); }
    brow(L - r * 0.13, ey - r * 0.24, L + r * 0.1, ey - r * 0.2, bw, 3); brow(R - r * 0.1, ey - r * 0.3, R + r * 0.13, ey - r * 0.38, bw, 4, r * 0.03);
    Ln(sm([[hx - r * 0.12, my + r * 0.02], [hx + r * 0.08, my + r * 0.03], [hx + r * 0.2, my - r * 0.07]], false), r * 0.055, 5);
  } else if (mood === 'shock') {
    for (const x of [L, R]) { F(ell(x, ey, erx * 2.1, ery * 1.5), '#fff', { line: 4.5, shadow: 0, soft: 0, hi: 0, tex: 0 }); eyeOval(x + lx, ey + ly, erx * 0.8, ery * 0.7); }
    brow(L - r * 0.13, ey - r * 0.36, L + r * 0.1, ey - r * 0.42, bw, 6, r * 0.04); brow(R - r * 0.1, ey - r * 0.42, R + r * 0.13, ey - r * 0.36, bw, 7, r * 0.04);
    F(ell(hx, my + r * 0.06, r * 0.08, r * 0.11), '#5a1f22', { line: 4.5, shadow: 0, soft: 0, hi: 0, tex: 0 });
  } else if (mood === 'worried') {
    for (const x of [L, R]) eyeOval(x, ey, erx, ery * 0.95, lx, ly);
    brow(L - r * 0.13, ey - r * 0.24, L + r * 0.1, ey - r * 0.33, bw, 8); brow(R - r * 0.1, ey - r * 0.33, R + r * 0.13, ey - r * 0.24, bw, 9);
    Ln(sm([[hx - r * 0.15, my + r * 0.06], [hx - r * 0.05, my - r * 0.01], [hx + r * 0.05, my + r * 0.03], [hx + r * 0.15, my - r * 0.02]], false), r * 0.05, 10);
    F(sm([[hx + r * 0.62, hy - r * 0.42], [hx + r * 0.7, hy - r * 0.22], [hx + r * 0.6, hy - r * 0.18], [hx + r * 0.57, hy - r * 0.3]]), '#9fd8f2', { line: 3.5, shadow: 0, soft: 0, hi: 0.3, tex: 0 });
  } else { // neutral, slightly pleased
    for (const x of [L, R]) eyeOval(x, ey, erx, ery, lx, ly);
    brow(L - r * 0.12, ey - r * 0.27, L + r * 0.1, ey - r * 0.29, bw, 11, r * 0.02); brow(R - r * 0.1, ey - r * 0.29, R + r * 0.12, ey - r * 0.27, bw, 12, r * 0.02);
    Ln(sm([[hx - r * 0.13, my - r * 0.01], [hx, my + r * 0.05], [hx + r * 0.13, my - r * 0.01]], false), r * 0.055, 13);
  }
}

// ── the three design options (headwear/accessory/colour = identity) ─────
export const HAIRS3 = {
  S1: { name: 'The Question Mark', hair: 'qmark', hairCol: '#ff5a36', hairSh: '#6b1404' },
  S2: { name: 'The Living Flame', hair: 'flame', hairCol: '#ff7a1a', hair2: '#ffd23a', hairSh: '#a02800', glow: 'rgba(255,150,40,0.55)' },
  S3: { name: 'The Swirl', hair: 'swirl', hairCol: '#3fd0b6', hairSh: '#0c4a40' },
};
export const HAIRS2 = {
  H4: { name: 'Cloud Afro', hair: 'afro', hairCol: '#3a2418', hairSh: '#0e0604' },
  H5: { name: 'Top Knot', hair: 'topknot', hairCol: '#1e1d26', hairSh: '#000' },
  H6: { name: 'Fin Mohawk', hair: 'mohawk', hairCol: '#2a2a33', hairSh: '#000', fin: '#1fb5a4' },
  H7: { name: 'Lightning Bang', hair: 'bolt', hairCol: '#f2c64a', hairSh: '#6b4a05' },
  H8: { name: 'Spring Sprout', hair: 'spring', hairCol: '#2b2622', hairSh: '#000' },
  H9: { name: 'Wing Flicks', hair: 'wings', hairCol: '#2a3150', hairSh: '#05070f' },
};
export const HAIRS = {
  H1: { name: 'Wave Quiff', body: '#5a7fa8', sh: '#16233a', shoe: '#e9e4d8', hair: 'quiff', hairCol: '#22263a', hairSh: '#05060e' },
  H2: { name: 'Flame Spikes', body: '#5a7fa8', sh: '#16233a', shoe: '#e9e4d8', hair: 'spiky', hairCol: '#e8742c', hairSh: '#5a1d05' },
  H3: { name: 'Curtain Mop', body: '#5a7fa8', sh: '#16233a', shoe: '#e9e4d8', hair: 'mop', hairCol: '#7a4a2a', hairSh: '#26120a' },
};
// LOCKED by the user: the hero's signature hair = Flame Spikes (ginger, four spikes swept to one side). Never change.
export const HERO = { name: 'Hero (hair locked: Flame Spikes)', body: '#5a7fa8', sh: '#16233a', shoe: '#e9e4d8', hair: 'spiky', hairCol: '#e8742c', hairSh: '#5a1d05' };
export const LOOKS = {
  HERO,
  A: { name: 'Option A', body: '#35b0a0', sh: '#0f3f3a', shoe: '#e6533f', trim: 'hood' , hair: 'tuft' },
  B: { name: 'Option B', body: '#f2b233', sh: '#5a3a08', shoe: '#2e3a66', trim: 'none', hat: 'beanie' },
  C: { name: 'Option C', body: '#e8664c', sh: '#4a150e', shoe: '#f4f0e6', trim: 'none', hair: 'fringe', phones: true },
};

function cloudPts(cx, cy, R, n, amp, a0 = 0, a1 = Math.PI * 2) {
  const pts = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, rr = R * (1 + (i % 2 ? amp : -amp * 0.3)); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return pts;
}
function hairBack(L, hx, hy, r) {
  if (L.hair === 'afro') F(sm(cloudPts(hx, hy - r * 0.32, r * 1.42, 26, 0.07)), L.hairCol, { line: 6, seed: 141, shadow: 0.4, shadowCol: L.hairSh, soft: 0.3, hi: 0.15 });
  if (L.hair === 'mop') {   // fluffy mop volume behind the head
    F(sm([[hx - r * 1.12, hy + r * 0.25], [hx - r * 1.18, hy - r * 0.45], [hx - r * 0.8, hy - r * 1.05], [hx, hy - r * 1.25], [hx + r * 0.8, hy - r * 1.05], [hx + r * 1.18, hy - r * 0.45], [hx + r * 1.12, hy + r * 0.25], [hx + r * 0.9, hy + r * 0.5], [hx - r * 0.9, hy + r * 0.5]]),
      L.hairCol, { line: 6, seed: 101, shadow: 0.4, shadowCol: L.hairSh, soft: 0.3, hi: 0.15 });
  }
}
function headwearBack(L, hx, hy, r) {
  hairBack(L, hx, hy, r);
  if (L.phones) { Ln(sm([[hx - r * 1.0, hy + r * 0.1], [hx - r * 0.75, hy - r * 0.95], [hx, hy - r * 1.22], [hx + r * 0.75, hy - r * 0.95], [hx + r * 1.0, hy + r * 0.1]], false), r * 0.1, 31, '#232a4a'); }
}
function hairFront(L, hx, hy, r) {
  const o = { line: 6, shadow: 0.38, shadowCol: L.hairSh, soft: 0.28, hi: 0.3 };
  const R_ = (pts) => pts.map(([a, b]) => [hx + a * r, hy + b * r]);
  if (L.hair === 'qmark') {   // the hair is the hook of a question mark and the round head is its dot
    F(sm(R_([[-0.5, -0.86], [-0.2, -1.12], [0.02, -1.2], [0.24, -1.12], [0.5, -0.86], [0, -0.74]])), L.hairCol, { ...o, seed: 201 });
    const c = R_([[0.0, -0.95], [0.0, -1.22], [0.14, -1.42], [0.42, -1.58], [0.56, -1.84], [0.42, -2.1], [0.08, -2.22], [-0.3, -2.1], [-0.48, -1.84]]);
    F(tube(c, [0.36, 0.34, 0.34, 0.36, 0.37, 0.37, 0.36, 0.33, 0.27].map((w) => w * r)), L.hairCol, { ...o, seed: 202, off: 0.3 });
    Ln(sm(R_([[0.3, -1.6], [0.44, -1.84], [0.34, -2.04], [0.08, -2.13], [-0.2, -2.05]]), false), r * 0.045, 203, 'rgba(255,255,255,0.55)');
  }
  if (L.hair === 'flame') {   // a living flame tuft: it glows, so it lights up in every dark scene
    ctx.save(); ctx.globalCompositeOperation = 'screen'; blur(r * 0.45, () => { ctx.fillStyle = L.glow; ctx.beginPath(); ctx.ellipse(hx, hy - r * 1.45, r * 1.0, r * 1.15, 0, 0, 6.3); ctx.fill(); }); ctx.restore();
    const fl = [[-0.56, -0.8], [-0.7, -1.15], [-0.46, -1.52], [-0.4, -1.95], [-0.02, -2.32], [0.06, -1.9], [0.44, -1.62], [0.68, -1.18], [0.56, -0.8], [0, -0.68]];
    F(sm(R_(fl), true, 0.85), L.hairCol, { line: 6, seed: 211, shadow: 0.22, shadowCol: L.hairSh, soft: 0.2, hi: 0.3 });
    const inner = (k, dy) => R_(fl.map(([a, b]) => [a * k, (b + 0.72) * k - 0.72 + dy]));
    F(sm(inner(0.62, -0.06), true, 0.85), L.hair2, { line: 0, ink: false, seed: 212, shadow: 0, soft: 0, hi: 0.2, tex: 0.05 });
    F(sm(inner(0.3, -0.1), true, 0.85), '#fffbe0', { line: 0, ink: false, seed: 213, shadow: 0, soft: 0, hi: 0, tex: 0 });
  }
  if (L.hair === 'swirl') {   // soft-serve swirl: three stacked coils and a curled tip
    const tier = (cx, cy, rx, ry, seed) => F(sm(R_([[cx - rx, cy], [cx - rx * 0.8, cy - ry], [cx, cy - ry * 1.25], [cx + rx * 0.85, cy - ry * 0.9], [cx + rx, cy + ry * 0.1], [cx + rx * 0.6, cy + ry], [cx, cy + ry * 1.1], [cx - rx * 0.7, cy + ry * 0.9]])), L.hairCol, { ...o, seed });
    tier(0, -0.95, 0.86, 0.3, 221); tier(0.04, -1.36, 0.64, 0.27, 222); tier(0, -1.72, 0.42, 0.23, 223);
    F(tube(R_([[0.0, -1.85], [0.1, -2.05], [0.3, -2.12], [0.34, -1.98]]), [0.3, 0.24, 0.17, 0.1].map((w) => w * r)), L.hairCol, { ...o, seed: 224 });
    for (const [cy, rx] of [[-1.02, 0.5], [-1.42, 0.36], [-1.77, 0.22]]) Ln(sm(R_([[-rx, cy - 0.06], [-rx * 0.3, cy - 0.2], [rx * 0.5, cy - 0.16]]), false), r * 0.04, 225, 'rgba(255,255,255,0.5)');
  }
  const cap = (edge, seed) => F(sm([[hx - r * 0.99, hy - r * 0.1], [hx - r * 0.9, hy - r * 0.6], [hx - r * 0.5, hy - r * 0.93], [hx, hy - r * 1.03], [hx + r * 0.5, hy - r * 0.93], [hx + r * 0.9, hy - r * 0.6], [hx + r * 0.99, hy - r * 0.1], ...edge]), L.hairCol, { ...o, seed });
  if (L.hair === 'afro') {   // scalloped hairline in front of the cloud
    F(sm([...cloudPts(hx, hy - r * 0.2, r * 1.02, 16, 0.06, Math.PI * 1.08, Math.PI * 1.92), [hx + r * 0.6, hy - r * 0.6], [hx + r * 0.2, hy - r * 0.48], [hx - r * 0.2, hy - r * 0.5], [hx - r * 0.6, hy - r * 0.62]]), L.hairCol, { ...o, seed: 142 });
    for (const [a, b] of [[-0.5, -1.1], [0.1, -1.3], [0.7, -1.05], [-0.9, -0.6], [1.0, -0.5]]) { ctx.fillStyle = 'rgba(255,230,200,0.12)'; ctx.beginPath(); ctx.arc(hx + a * r, hy + b * r, r * 0.16, 0, 6.3); ctx.fill(); }
  }
  if (L.hair === 'topknot') {   // shaved-close cap + a round knot on top with a coloured band
    cap([[hx + r * 0.75, hy - r * 0.48], [hx + r * 0.3, hy - r * 0.6], [hx - r * 0.3, hy - r * 0.6], [hx - r * 0.75, hy - r * 0.48]], 151);
    F(sm([[hx - r * 0.2, hy - r * 1.0], [hx + r * 0.2, hy - r * 1.0], [hx + r * 0.16, hy - r * 1.14], [hx - r * 0.16, hy - r * 1.14]]), L.hairCol, { ...o, seed: 152 });
    F(ellD(hx, hy - r * 1.42, r * 0.34, r * 0.3), L.hairCol, { ...o, seed: 153 });
    F(sm([[hx - r * 0.22, hy - r * 1.08], [hx + r * 0.22, hy - r * 1.08], [hx + r * 0.2, hy - r * 1.2], [hx - r * 0.2, hy - r * 1.2]]), '#e0473c', { line: 4.5, seed: 154, shadow: 0.25, soft: 0.1, hi: 0.2 });
  }
  if (L.hair === 'mohawk') {   // a tall fin leaning back, short dark sides
    cap([[hx + r * 0.8, hy - r * 0.45], [hx, hy - r * 0.6], [hx - r * 0.8, hy - r * 0.45]], 161);
    F(sm([[hx - r * 0.42, hy - r * 0.62], [hx - r * 0.38, hy - r * 1.25], [hx - r * 0.1, hy - r * 1.82], [hx + r * 0.38, hy - r * 1.9], [hx + r * 0.2, hy - r * 1.55], [hx + r * 0.6, hy - r * 1.62], [hx + r * 0.5, hy - r * 1.2], [hx + r * 0.42, hy - r * 0.7]], true, 0.7), L.fin, { ...o, seed: 162, shadowCol: '#06302c' });
    Ln(sm([[hx - r * 0.2, hy - r * 0.8], [hx - r * 0.05, hy - r * 1.4], [hx + r * 0.2, hy - r * 1.75]], false), r * 0.035, 163, 'rgba(220,255,250,0.5)');
  }
  if (L.hair === 'bolt') {   // blond cap with one big zig-zag lightning bang over the forehead
    cap([[hx + r * 0.85, hy - r * 0.5], [hx + r * 0.55, hy - r * 0.55], [hx + r * 0.3, hy - r * 0.3], [hx + r * 0.36, hy - r * 0.58], [hx + r * 0.05, hy - r * 0.5], [hx - r * 0.12, hy - r * 0.18],
      [hx - r * 0.05, hy - r * 0.52], [hx - r * 0.4, hy - r * 0.6], [hx - r * 0.82, hy - r * 0.48]], 171);
    F(poly([[hx - r * 0.42, hy - r * 0.92], [hx + r * 0.12, hy - r * 0.95], [hx - r * 0.04, hy - r * 0.6], [hx + r * 0.3, hy - r * 0.62], [hx - r * 0.16, hy - r * 0.02], [hx - r * 0.02, hy - r * 0.42], [hx - r * 0.36, hy - r * 0.4]]), L.hairCol, { ...o, seed: 173, line: 5.5 });
    for (const k of [-0.5, 0, 0.5]) Ln(sm([[hx + k * r, hy - r * 0.98], [hx + k * r * 1.1 + r * 0.05, hy - r * 0.7]], false), r * 0.03, 172, 'rgba(255,255,230,0.6)');
  }
  if (L.hair === 'spring') {   // one coiled strand bouncing up from the crown, tiny tuft at the base
    const pts = []; for (let i = 0; i <= 48; i++) { const t = i / 48; pts.push([hx + r * 0.08 + Math.sin(t * Math.PI * 7) * r * 0.16 * (1 - t * 0.3), hy - r * 0.98 - t * r * 0.95]); }
    Ln(sm(pts, false), r * 0.07, 181, INK); Ln(sm(pts, false), r * 0.035, 182, L.hairCol);
    F(ellD(hx + r * 0.08, hy - r * 1.98, r * 0.12, r * 0.12), L.hairCol, { ...o, seed: 183 });
    F(sm([[hx - r * 0.3, hy - r * 0.92], [hx - r * 0.1, hy - r * 1.12], [hx + r * 0.08, hy - r * 1.02], [hx + r * 0.3, hy - r * 1.14], [hx + r * 0.4, hy - r * 0.92]]), L.hairCol, { ...o, seed: 184 });
  }
  if (L.hair === 'wings') {   // centre parting, both sides flick up and out like wings
    F(sm([[hx - r * 0.95, hy - r * 0.15], [hx - r * 1.1, hy - r * 0.5], [hx - r * 1.45, hy - r * 0.78], [hx - r * 1.05, hy - r * 0.82], [hx - r * 0.7, hy - r * 1.0], [hx - r * 0.1, hy - r * 1.06], [hx, hy - r * 0.86],
      [hx + r * 0.1, hy - r * 1.06], [hx + r * 0.7, hy - r * 1.0], [hx + r * 1.05, hy - r * 0.82], [hx + r * 1.45, hy - r * 0.78], [hx + r * 1.1, hy - r * 0.5], [hx + r * 0.95, hy - r * 0.15],
      [hx + r * 0.7, hy - r * 0.45], [hx + r * 0.2, hy - r * 0.58], [hx, hy - r * 0.7], [hx - r * 0.2, hy - r * 0.58], [hx - r * 0.7, hy - r * 0.45]], true, 0.75), L.hairCol, { ...o, seed: 191 });
    Ln(sm([[hx, hy - r * 0.86], [hx, hy - r * 0.72]], false), r * 0.03, 192, 'rgba(0,0,0,0.6)');
  }
  if (L.hair === 'quiff') {   // tall wave swept up and curling forward over the front: the silhouette is a breaking wave
    F(sm([[hx - r * 0.98, hy - r * 0.05], [hx - r * 0.95, hy - r * 0.62], [hx - r * 0.6, hy - r * 1.05], [hx - r * 0.05, hy - r * 1.45], [hx + r * 0.55, hy - r * 1.72], [hx + r * 1.08, hy - r * 1.55],
      [hx + r * 1.12, hy - r * 1.22], [hx + r * 0.88, hy - r * 1.05], [hx + r * 0.98, hy - r * 1.32], [hx + r * 0.62, hy - r * 1.3], [hx + r * 0.42, hy - r * 0.95], [hx + r * 0.1, hy - r * 0.68],
      [hx - r * 0.35, hy - r * 0.62], [hx - r * 0.7, hy - r * 0.45]]), L.hairCol, { ...o, seed: 111 });
    Ln(sm([[hx - r * 0.55, hy - r * 0.85], [hx + r * 0.05, hy - r * 1.28], [hx + r * 0.62, hy - r * 1.5]], false), r * 0.035, 112, 'rgba(160,190,255,0.55)');   // sheen strand
    Ln(sm([[hx - r * 0.3, hy - r * 0.78], [hx + r * 0.25, hy - r * 1.1], [hx + r * 0.7, hy - r * 1.22]], false), r * 0.03, 113, 'rgba(0,0,0,0.5)');
  }
  if (L.hair === 'spiky') {   // four flame spikes all leaning to one side (wind-swept), short sides
    F(sm([[hx - r * 0.98, hy - r * 0.1], [hx - r * 1.0, hy - r * 0.62], [hx - r * 0.55, hy - r * 1.32], [hx - r * 0.55, hy - r * 0.95], [hx + r * 0.02, hy - r * 1.55], [hx - r * 0.02, hy - r * 1.02],
      [hx + r * 0.62, hy - r * 1.55], [hx + r * 0.45, hy - r * 1.0], [hx + r * 1.28, hy - r * 1.18], [hx + r * 0.85, hy - r * 0.85], [hx + r * 0.98, hy - r * 0.35], [hx + r * 0.6, hy - r * 0.55],
      [hx + r * 0.2, hy - r * 0.45], [hx - r * 0.25, hy - r * 0.6], [hx - r * 0.65, hy - r * 0.42]], true, 0.55), L.hairCol, { ...o, seed: 121 });
    for (const [a, b] of [[-0.35, -1.1], [0.1, -1.2], [0.55, -1.2]]) Ln(sm([[hx + r * (a + 0.12), hy - r * 0.7], [hx + r * a, hy + r * b * 0.9]], false), r * 0.03, 122, 'rgba(255,220,160,0.55)');
  }
  if (L.hair === 'mop' && L._over) {   // curtain bang sweeping across and falling over one eye
    F(sm([[hx - r * 1.05, hy - r * 0.2], [hx - r * 0.85, hy - r * 0.85], [hx - r * 0.2, hy - r * 1.12], [hx + r * 0.6, hy - r * 0.98], [hx + r * 1.0, hy - r * 0.5], [hx + r * 0.95, hy + r * 0.05],
      [hx + r * 0.72, hy - r * 0.25], [hx + r * 0.58, hy + r * 0.12], [hx + r * 0.38, hy - r * 0.05], [hx + r * 0.1, hy - r * 0.32], [hx - r * 0.3, hy - r * 0.42], [hx - r * 0.7, hy - r * 0.35]]),
      L.hairCol, { ...o, seed: 131 });
    for (const k of [0.1, 0.35, 0.6]) Ln(sm([[hx - r * 0.5 + k * r, hy - r * 0.95], [hx - r * 0.1 + k * r * 1.2, hy - r * 0.55], [hx + k * r * 1.1, hy - r * 0.28]], false), r * 0.028, 132, 'rgba(40,18,8,0.45)');
  }
}
function headwear(L, hx, hy, r) {
  hairFront(L, hx, hy, r);
  if (L.hair === 'tuft') {   // one black swirl cowlick
    F(sm([[hx - r * 0.12, hy - r * 0.9], [hx - r * 0.02, hy - r * 1.32], [hx + r * 0.22, hy - r * 1.38], [hx + r * 0.3, hy - r * 1.2], [hx + r * 0.12, hy - r * 1.18], [hx + r * 0.1, hy - r * 0.93]]), '#24201f', { line: 5, seed: 21, shadow: 0.2, soft: 0, hi: 0.25 });
  }
  if (L.hair === 'fringe') {
    F(sm([[hx - r * 0.95, hy - r * 0.1], [hx - r * 0.85, hy - r * 0.7], [hx - r * 0.3, hy - r * 1.02], [hx + r * 0.4, hy - r * 1.0], [hx + r * 0.9, hy - r * 0.62], [hx + r * 0.97, hy - r * 0.1],
      [hx + r * 0.7, hy - r * 0.42], [hx + r * 0.35, hy - r * 0.48], [hx + r * 0.05, hy - r * 0.38], [hx - r * 0.3, hy - r * 0.5], [hx - r * 0.65, hy - r * 0.42]]), '#5b3a26', { line: 6, seed: 22, shadow: 0.3, shadowCol: '#1e120a', soft: 0.25, hi: 0.2 });
  }
  if (L.hat === 'beanie') {   // sits high on the head so the brows stay visible
    F(sm([[hx - r * 0.93, hy - r * 0.42], [hx - r * 0.82, hy - r * 0.92], [hx - r * 0.35, hy - r * 1.2], [hx + r * 0.35, hy - r * 1.2], [hx + r * 0.82, hy - r * 0.92], [hx + r * 0.93, hy - r * 0.42]]), '#d8453b', { line: 6, seed: 23, shadow: 0.32, shadowCol: '#4a0e0a', soft: 0.25, hi: 0.2 });
    F(sm([[hx - r * 0.98, hy - r * 0.62], [hx + r * 0.98, hy - r * 0.62], [hx + r * 0.96, hy - r * 0.42], [hx - r * 0.96, hy - r * 0.42]]), '#c23a31', { line: 6, seed: 24, shadow: 0.25, shadowCol: '#4a0e0a', soft: 0.1, hi: 0.1 });
    for (let i = -4; i <= 4; i++) Ln(`M ${hx + i * r * 0.2} ${hy - r * 0.6} L ${hx + i * r * 0.2} ${hy - r * 0.45}`, 2.5, 40 + i, 'rgba(60,10,8,0.55)');
    F(ell(hx + r * 0.05, hy - r * 1.28, r * 0.2, r * 0.18), '#f4ede0', { line: 5, seed: 25, shadow: 0.25, soft: 0.2, hi: 0.2 });
  }
  if (L.hat === 'police') {   // peaked cap: navy crown, band, visor, gold badge
    F(sm([[hx - r * 1.0, hy - r * 0.5], [hx - r * 1.05, hy - r * 0.95], [hx - r * 0.5, hy - r * 1.22], [hx + r * 0.5, hy - r * 1.22], [hx + r * 1.05, hy - r * 0.95], [hx + r * 1.0, hy - r * 0.5]]), '#27408f', { line: 6, seed: 301, shadow: 0.35, shadowCol: '#0a1238', soft: 0.25, hi: 0.2 });
    F(sm([[hx - r * 1.0, hy - r * 0.62], [hx + r * 1.0, hy - r * 0.62], [hx + r * 0.98, hy - r * 0.42], [hx - r * 0.98, hy - r * 0.42]]), '#16245a', { line: 5, seed: 302, shadow: 0.2, soft: 0, hi: 0.1 });
    F(sm([[hx - r * 0.85, hy - r * 0.45], [hx + r * 0.85, hy - r * 0.45], [hx + r * 1.0, hy - r * 0.28], [hx, hy - r * 0.2], [hx - r * 1.0, hy - r * 0.28]]), '#111a40', { line: 5, seed: 303, shadow: 0.2, soft: 0, hi: 0.25 });
    F(sm([[hx, hy - r * 1.08], [hx + r * 0.1, hy - r * 0.9], [hx, hy - r * 0.74], [hx - r * 0.1, hy - r * 0.9]]), '#f2c64a', { line: 3.5, seed: 304, shadow: 0, soft: 0, hi: 0.3 });
  }
  if (L.phones) {
    for (const d of [-1, 1]) F(sm([[hx + d * r * 0.86, hy - r * 0.18], [hx + d * r * 1.12, hy - r * 0.14], [hx + d * r * 1.14, hy + r * 0.32], [hx + d * r * 0.86, hy + r * 0.34]]), '#232a4a', { line: 5, seed: 26 + d, shadow: 0.2, soft: 0.2, hi: 0.25 });
  }
}

export function char(x, gy, s, o = {}) {
  const L = o.look || LOOKS.A, legH = 210 * s, bodyH = 245 * s, bodyW = 170 * s, r = 108 * s;
  const top = gy - legH - bodyH * 0.9, hx = x + (o.headDx || 0) * s, hy = top - r * 0.48, sw = o.legSwing || 0;
  const hipY = top + bodyH * 0.88, sh = top + bodyH * 0.3;
  // contact shadow
  if (!o.noShadow) blur(10, () => { ctx.fillStyle = 'rgba(20,10,30,0.28)'; ctx.beginPath(); ctx.ellipse(x, gy + 4, 120 * s, 16 * s, 0, 0, 6.3); ctx.fill(); });
  const aL = o.armL || [-70, 110], aR = o.armR || [70, 110];     // hand offsets from the shoulder
  // back arm (left), legs, body, front arm
  limb([[x - bodyW * 0.4, sh], [x - bodyW * 0.4 + aL[0] * s * 0.5, sh + aL[1] * s * 0.55 - 6 * s], [x - bodyW * 0.4 + aL[0] * s, sh + aL[1] * s]], 18 * s, 51, 15 * s);
  hand(x - bodyW * 0.4 + aL[0] * s, sh + aL[1] * s, 16 * s, 52);
  if (o.sit) {   // seated: thighs forward toward the facing side, shins down
    const dir = Math.sign(o.turn || 1);
    for (const d of [-1, 1]) { const kx = x + dir * (70 + d * 10) * s, ky = hipY + 14 * s, fx = kx + dir * 8 * s, fy = hipY + legH * 0.78;
      limb([[x + d * 26 * s, hipY - 4 * s], [(x + kx) / 2, hipY + 2 * s], [kx, ky]], 24 * s, 60 + d, 22 * s); limb([[kx, ky], [kx + dir * 6 * s, (ky + fy) / 2], [fx, fy]], 22 * s, 64 + d, 19 * s);
      shoe(fx + dir * 4 * s, fy + 8 * s, 20 * s, dir, L.shoe, 62 + d); }
  } else
  for (const d of [-1, 1]) {
    const ph = o.walk == null ? null : o.walk + (d > 0 ? Math.PI : 0);
    const fx = ph == null ? x + d * 30 * s + d * sw * 30 * s : x + d * 14 * s + Math.sin(ph) * 62 * s, fy = ph == null ? gy : gy - Math.max(0, Math.cos(ph)) * 22 * s;
    const kx = ph == null ? x + d * 56 * s + d * sw * 10 * s : x + d * 20 * s + Math.sin(ph) * 30 * s + (o.turn || 0) * 26 * s;
    limb([[x + d * 34 * s, hipY - 6 * s], [kx, hipY + legH * 0.52], [fx, fy - 16 * s]], 24 * s, 60 + d, 19 * s);
    shoe(fx + (ph == null ? d : (o.turn || 1)) * 4 * s, fy - 6 * s, 20 * s, ph == null ? d : Math.sign(o.turn || 1), L.shoe, 62 + d);
  }
  bean(x, top, bodyW, bodyH, L.body, L.sh, 70);
  if (L.trim === 'hood') {   // hood collar + drawstrings
    F(sm([[x - bodyW * 0.42, top + bodyH * 0.03], [x, top + bodyH * 0.16], [x + bodyW * 0.42, top + bodyH * 0.03], [x + bodyW * 0.3, top + bodyH * 0.13], [x, top + bodyH * 0.24], [x - bodyW * 0.3, top + bodyH * 0.13]]), '#2b9585', { line: 5, seed: 71, shadow: 0.3, shadowCol: '#0f3f3a', soft: 0.2, hi: 0.1 });
    for (const d of [-1, 1]) { Ln(sm([[x + d * 18 * s, top + bodyH * 0.2], [x + d * 22 * s, top + bodyH * 0.36]], false), 3.5 * s, 72 + d, '#f4f0e6'); F(ell(x + d * 22 * s, top + bodyH * 0.38, 4.5 * s, 6 * s), '#f4f0e6', { line: 3, shadow: 0, soft: 0, hi: 0, tex: 0 }); }
    Ln(sm([[x - bodyW * 0.3, top + bodyH * 0.72], [x + bodyW * 0.3, top + bodyH * 0.72]], false), 3.5 * s, 74, 'rgba(15,63,58,0.6)');   // pocket line
  }
  limb([[x + bodyW * 0.4, sh], [x + bodyW * 0.4 + aR[0] * s * 0.5, sh + aR[1] * s * 0.55 - 6 * s], [x + bodyW * 0.4 + aR[0] * s, sh + aR[1] * s]], 18 * s, 53, 15 * s);
  hand(x + bodyW * 0.4 + aR[0] * s, sh + aR[1] * s, 16 * s, 54);
  headwearBack(L, hx, hy, r);
  headShape(hx, hy, r, 80);
  headwear(L, hx, hy, r);
  face(hx, hy, r, o.mood || 'neutral', o.lookAt || [0, 0], o.turn || 0);
  if (o.over) o.over(hx, hy, r);
  hairOver(L, hx, hy, r);
  return { hx, hy, r };
}

function hairOver(L, hx, hy, r) { if (L.hair === 'mop') hairFront({ ...L, _over: true }, hx, hy, r); }
export function headOnly(x, y, r, L, mood, look) {
  headwearBack(L, x, y, r); headShape(x, y, r, 90); headwear(L, x, y, r); face(x, y, r, mood, look); hairOver(L, x, y, r);
}
