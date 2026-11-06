// INK TOON kit v2: illustrator-style drawing in code.
// Shapes are authored as SVG-like path strings; each gets a base fill, a cel-shadow shape (offset away from the
// light, or an explicit shadow path), a soft highlight, paper grain, and a brush outline whose width swells on the
// shadow side and boils (jitters) 12 times a second like hand-drawn animation.
export const W = 1080, H = 1920;
export const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => clamp((t - a) / ((b - a) || 1e-6));
export const eo = (x) => 1 - Math.pow(1 - x, 3), eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eob = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const vn = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
export const S = { boil: 0, light: [-0.55, -0.85], lw: 0.86 };
export const INK = '#2b2220';

const grainPat = (() => { const c = document.createElement('canvas'); c.width = c.height = 384; const g = c.getContext('2d'), d = g.createImageData(384, 384);
  for (let i = 0; i < d.data.length; i += 4) { const v = 228 + Math.random() * 27; d.data[i] = v; d.data[i + 1] = v * 0.985; d.data[i + 2] = v * 0.95; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return ctx.createPattern(c, 'repeat'); })();

// ── SVG-ish path parser: M L C Q Z (absolute, comma/space separated) → list of polylines ──
const cache = new Map();
export function P(d) {
  if (cache.has(d)) return cache.get(d);
  const tok = d.replace(/([MLCQZ])/g, ' $1 ').replace(/,/g, ' ').trim().split(/\s+/); const subs = []; let cur = null, x = 0, y = 0, i = 0;
  const num = () => +tok[i++];
  while (i < tok.length) { const c = tok[i++];
    if (c === 'M') { x = num(); y = num(); cur = { pts: [[x, y]], closed: false }; subs.push(cur); }
    else if (c === 'L') { while (i < tok.length && !isNaN(+tok[i])) { x = num(); y = num(); cur.pts.push([x, y]); } }
    else if (c === 'C') { while (i < tok.length && !isNaN(+tok[i])) { const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
        for (let k = 1; k <= 14; k++) { const t = k / 14, u = 1 - t; cur.pts.push([u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]); } x = x3; y = y3; } }
    else if (c === 'Q') { while (i < tok.length && !isNaN(+tok[i])) { const x1 = num(), y1 = num(), x2 = num(), y2 = num();
        for (let k = 1; k <= 10; k++) { const t = k / 10, u = 1 - t; cur.pts.push([u * u * x + 2 * u * t * x1 + t * t * x2, u * u * y + 2 * u * t * y1 + t * t * y2]); } x = x2; y = y2; } }
    else if (c === 'Z') { cur.closed = true; }
  }
  cache.set(d, subs); return subs;
}
export function ellD(cx, cy, rx, ry) { const k = 0.5523; return `M ${cx - rx} ${cy} C ${cx - rx} ${cy - ry * k} ${cx - rx * k} ${cy - ry} ${cx} ${cy - ry} C ${cx + rx * k} ${cy - ry} ${cx + rx} ${cy - ry * k} ${cx + rx} ${cy} C ${cx + rx} ${cy + ry * k} ${cx + rx * k} ${cy + ry} ${cx} ${cy + ry} C ${cx - rx * k} ${cy + ry} ${cx - rx} ${cy + ry * k} ${cx - rx} ${cy} Z`; }
export function rectD(x, y, w, h, r = 0) { if (!r) return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  return `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`; }

const jit = (pts, amp, seed) => pts.map(([x, y], i) => [x + amp * vn(i * 0.31 + seed + S.boil * 7.3), y + amp * vn(i * 0.31 + seed + 40 + S.boil * 5.1)]);
function trace(subs) { ctx.beginPath(); for (const s of subs) { ctx.moveTo(s.pts[0][0], s.pts[0][1]); for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i][0], s.pts[i][1]); if (s.closed) ctx.closePath(); } }
const bbox = (subs) => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const s of subs) for (const [x, y] of s.pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; };

/** fill a shape: base color, cel shadow, highlight, grain, then ink outline */
export function F(d, color, o = {}) {
  const { shadow = 0.3, shadowCol = '#3d2f48', shadowD = null, off = 0.22, hi = 0.14, tex = 0.16, seed = 0, ink = true, alpha = 1, soft = 0.22 } = o; const line = (o.line ?? 7) * S.lw;
  const subs = P(d).map((s, k) => ({ pts: jit(s.pts, 0.8, seed + k * 13), closed: s.closed }));
  const [x0, y0, x1, y1] = bbox(subs), w = x1 - x0, h = y1 - y0;
  ctx.save(); ctx.globalAlpha *= alpha; trace(subs); ctx.fillStyle = color; ctx.fill(); ctx.clip();
  if (shadow > 0) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = shadowCol; ctx.globalAlpha = shadow * alpha;
    if (shadowD) { trace(P(shadowD).map((s, k) => ({ pts: jit(s.pts, 1.2, seed + 90 + k), closed: s.closed }))); ctx.fill(); }
    else { const dx = -S.light[0] * Math.min(w, 400) * off, dy = -S.light[1] * Math.min(h, 400) * off; ctx.beginPath(); ctx.rect(x0 - 3e3, y0 - 3e3, w + 6e3, h + 6e3);
      for (const s of subs) { ctx.moveTo(s.pts[0][0] - dx, s.pts[0][1] - dy); for (const p of s.pts) ctx.lineTo(p[0] - dx, p[1] - dy); ctx.closePath(); } ctx.fill('evenodd'); } }
  if (soft > 0) { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = alpha; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, gx = S.light[0] * w * 0.5, gy = S.light[1] * h * 0.5, sg = ctx.createLinearGradient(cx + gx, cy + gy, cx - gx, cy - gy);
    sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(1, shadowCol); ctx.globalAlpha = soft * alpha; ctx.fillStyle = sg; ctx.fillRect(x0, y0, w, h); ctx.globalAlpha = alpha; }
  if (hi > 0) { ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = alpha; const cx = (x0 + x1) / 2 + S.light[0] * w * 0.3, cy = (y0 + y1) / 2 + S.light[1] * h * 0.3, g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.55);
    g.addColorStop(0, `rgba(255,248,230,${hi})`); g.addColorStop(1, 'rgba(255,248,230,0)'); ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h); }
  if (tex > 0) { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = tex * alpha; ctx.fillStyle = grainPat; ctx.fillRect(x0, y0, w, h); }
  ctx.restore();
  if (ink && line > 0) for (const s of subs) stroke(s.pts, line, s.closed, seed + 7, INK, alpha);
}
/** ink line along points; swells on the side facing away from the light, tapers at open ends */
export function stroke(pts, w = 6, closed = false, seed = 0, color = INK, alpha = 1) {
  const p = closed ? [...pts, pts[0]] : pts, n = p.length; if (n < 2) return;
  const L = [], R = [];
  for (let i = 0; i < n; i++) { const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const nx = ty, ny = -tx, away = 0.5 + 0.5 * (nx * -S.light[0] + ny * -S.light[1]);
    const u = i / (n - 1), taper = closed ? 1 : Math.min(1, Math.sin(Math.PI * u) * 1.8 + 0.05);
    const ww = w * (0.62 + 0.75 * away) * (0.85 + 0.25 * vn(i * 0.2 + seed + S.boil * 0.7)) * taper / 2;
    L.push([p[i][0] - ty * ww, p[i][1] + tx * ww]); R.push([p[i][0] + ty * ww, p[i][1] - tx * ww]); }
  ctx.save(); ctx.globalAlpha *= alpha; ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); for (const q of L) ctx.lineTo(q[0], q[1]); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.restore();
}
/** detail line from a path string (folds, seams, wrinkles) */
export function Ln(d, w = 4, seed = 0, color = INK, alpha = 1) { for (const s of P(d)) stroke(jit(s.pts, 0.7, seed), w * S.lw, s.closed, seed, color, alpha); }

// ── painting helpers ─────────────────────────────────────────────────────
export function grad(stops, x0, y0, x1, y1, rx = 0, ry = 0, rw = W, rh = H) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); ctx.fillStyle = g; ctx.fillRect(rx, ry, rw, rh); }
export function strokes(x, y, w, h, color, n = 200, seed = 1, alpha = 0.1, len = [30, 120], thick = [4, 14], ang = 0) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
  for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.ellipse(x + hash(i + seed) * w, y + hash(i * 3 + seed) * h, lerp(len[0], len[1], hash(i * 7 + seed)), lerp(thick[0], thick[1], hash(i * 11 + seed)), ang + (hash(i * 13 + seed) - 0.5) * 0.3, 0, 6.3); ctx.fill(); } ctx.restore(); }
export function puff(cx, cy, r, col, sh, seed, n = 6, spread = 1) { const b = []; for (let i = 0; i < n; i++) b.push([cx + (i - (n - 1) / 2) * r * 0.9 * spread + r * 0.2 * vn(seed + i), cy - Math.sin(i / (n - 1) * Math.PI) * r * 0.8 + r * 0.1 * vn(seed + i * 3), r * (0.75 + 0.35 * hash(seed + i))]);
  ctx.save(); ctx.fillStyle = sh; for (const [x, y, rr] of b) { ctx.beginPath(); ctx.arc(x + rr * 0.12, y + rr * 0.2, rr, 0, 6.3); ctx.fill(); } ctx.fillStyle = col; for (const [x, y, rr] of b) { ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.3); ctx.fill(); } ctx.restore(); }
export function grainAll(a = 0.1) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a; ctx.fillStyle = grainPat; ctx.fillRect(0, 0, W, H); ctx.restore(); }
export function vignette(a = 0.3) { const g = ctx.createRadialGradient(W / 2, H * 0.47, H * 0.28, W / 2, H * 0.5, H * 0.78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(25,12,10,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
export function text(t, x, y, size, col = INK, rot = 0, font = 'Fredoka') { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = `700 ${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(t, 0, 0); ctx.restore(); }
/** run fn inside a transform: translate to (x,y), rotate (deg) around the origin, scale */
export function at(x, y, rot, s, fn) { ctx.save(); ctx.translate(x, y); ctx.rotate((rot || 0) * Math.PI / 180); if (s) ctx.scale(s, s); fn(); ctx.restore(); }
export function cam(z, fx = W / 2, fy = H / 2, ox = 0, oy = 0) { ctx.translate(fx + ox, fy + oy); ctx.scale(z, z); ctx.translate(-fx, -fy); }

// ── authoring helpers ────────────────────────────────────────────────────
/** smooth path string through points (Catmull-Rom → cubic Bézier); closed by default */
export function sm(pts, closed = true, k = 1) {
  const n = pts.length, Q = (i) => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  let d = `M ${pts[0][0]} ${pts[0][1]}`; const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) { const p0 = Q(i - 1), p1 = Q(i), p2 = Q(i + 1), p3 = Q(i + 2);
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6 * k} ${p1[1] + (p2[1] - p0[1]) / 6 * k} ${p2[0] - (p3[0] - p1[0]) / 6 * k} ${p2[1] - (p3[1] - p1[1]) / 6 * k} ${p2[0]} ${p2[1]}`; }
  return d + (closed ? ' Z' : '');
}
/** polygon path string (sharp corners) */
export const poly = (pts) => 'M ' + pts.map((p) => p[0] + ' ' + p[1]).join(' L ') + ' Z';
/** a limb/sleeve: centerline points + widths → closed smooth outline */
export function tube(pts, ws, capEnd = true) {
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const w = (Array.isArray(ws) ? ws[i] : ws) / 2; L.push([pts[i][0] - ty * w, pts[i][1] + tx * w]); R.push([pts[i][0] + ty * w, pts[i][1] - tx * w]); }
  const e = pts[n - 1], s = pts[0], we = (Array.isArray(ws) ? ws[n - 1] : ws) / 2, ws0 = (Array.isArray(ws) ? ws[0] : ws) / 2;
  const a = pts[n - 2], tx = (e[0] - a[0]), ty = (e[1] - a[1]), l = Math.hypot(tx, ty) || 1;
  const cap = capEnd ? [[e[0] + tx / l * we * 0.7, e[1] + ty / l * we * 0.7]] : [];
  const b0 = pts[1], sx = (s[0] - b0[0]), sy = (s[1] - b0[1]), sl = Math.hypot(sx, sy) || 1;
  return sm([...L, ...cap, ...R.reverse(), [s[0] + sx / sl * ws0 * 0.5, s[1] + sy / sl * ws0 * 0.5]]);
}
/** rotate+scale a point list around (cx,cy) then translate */
export const xform = (pts, cx, cy, rot = 0, s = 1, dx = 0, dy = 0) => { const c = Math.cos(rot), si = Math.sin(rot); return pts.map(([x, y]) => [cx + dx + ((x - cx) * c - (y - cy) * si) * s, cy + dy + ((x - cx) * si + (y - cy) * c) * s]); };
/** outlined caption text */
export function caption(t, x, y, size, fill = '#fff', rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = `700 ${size}px Fredoka`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = size * 0.22; ctx.strokeText(t, 0, 0); ctx.fillStyle = fill; ctx.fillText(t, 0, 0); ctx.restore(); }

/** draw fn blurred (soft airbrushed shading) */
export function blur(px, fn, a = 1) { ctx.save(); ctx.filter = `blur(${px}px)`; ctx.globalAlpha *= a; fn(); ctx.restore(); }
/** hand-lettered marker text: each letter slightly rotated, sized and offset */
export function hand(txt, x, y, size, seed = 0, col = INK) { ctx.save(); ctx.font = `700 ${size}px Fredoka`; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  const ws = [...txt].map((c) => ctx.measureText(c).width * 0.94), tot = ws.reduce((a, b) => a + b, 0); let cx = x - tot / 2;
  [...txt].forEach((c, i) => { ctx.save(); ctx.translate(cx + ws[i] / 2, y + (hash(seed + i) - 0.5) * size * 0.14); ctx.rotate((hash(seed + i * 3) - 0.5) * 0.22); const k = 0.92 + 0.16 * hash(seed + i * 7); ctx.scale(k * 0.94, k * 1.12);
    ctx.textAlign = 'center'; ctx.fillText(c, 0, 0); ctx.restore(); cx += ws[i]; }); ctx.restore(); }
