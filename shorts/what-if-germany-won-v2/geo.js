// Maps and globes from Natural Earth (public domain) data, inked in the Ink Toon style.
import { W, H, ctx, lerp, hash, F, Ln, blur, ellD, rectD, poly, INK } from './kit.js';
import { clipTo } from './intro.js';

export let GEO = null;
export async function loadGeo() { GEO = await (await fetch('data/geo.json')).json(); GEO.eu = GEO.eu.map((f) => ({ n: f.n, p: f.p.map((r) => r.filter(([x]) => x > -35 && x < 66)).filter((r) => r.length > 3) })).filter((f) => f.p.length); }
const R = Math.PI / 180;
export const REICH_SET = new Set(['Germany', 'Poland', 'Austria', 'Czechia', 'France', 'Belgium', 'Netherlands', 'Luxembourg', 'Denmark', 'Norway', 'Lithuania', 'Latvia', 'Estonia', 'Belarus', 'Ukraine', 'Slovakia', 'Hungary', 'Slovenia', 'Croatia', 'Serbia', 'Bosnia and Herz.', 'Montenegro', 'Greece', 'Moldova', 'Romania', 'Bulgaria', 'Albania', 'Macedonia', 'Kosovo']);
/** equirectangular map projection: Germany-centred boxes. c = [x0, y0, lon0, lat0, pxPerDegLat] */
export const projEU = (c) => (lon, lat) => [c[0] + (lon - c[2]) * c[4] * Math.cos(52 * R), c[1] + (c[3] - lat) * c[4]];
const ringPath = (pr, ring) => { ctx.moveTo(...pr(...ring[0])); for (let i = 1; i < ring.length; i++) ctx.lineTo(...pr(...ring[i])); ctx.closePath(); };
/** colour(name) → fill colour or null (default land). o: { sea, land, extra(pr) drawn over land and clipped to it } */
export function drawEurope(c, colour = () => null, o = {}) {
  const pr = projEU(c), feats = GEO.eu;
  ctx.fillStyle = o.sea || '#a8cde4'; ctx.fillRect(-100, -100, W + 200, H + 200);
  // pale coastal glow in the sea
  blur(10, () => { ctx.strokeStyle = o.glow || 'rgba(225,242,250,0.9)'; ctx.lineWidth = 30; ctx.lineJoin = 'round'; ctx.beginPath(); for (const f of feats) for (const r of f.p) ringPath(pr, r); ctx.stroke(); });
  for (let i = 0; i < 26; i++) { const x = hash(i * 7) * W, y = hash(i * 11) * H; Ln(`M ${x} ${y} q 8 -6 16 0 q 8 6 16 0`, 2.2, 700 + i, 'rgba(70,120,160,0.35)'); }
  // thick ink coastline: stroke everything wide, then fill countries over it so only the outer half shows
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.beginPath(); for (const f of feats) for (const r of f.p) ringPath(pr, r); ctx.stroke(); ctx.restore();
  for (const f of feats) { ctx.fillStyle = colour(f.n) || o.land || '#e6dcc4'; ctx.beginPath(); for (const r of f.p) ringPath(pr, r); ctx.fill(); }
  ctx.save(); ctx.beginPath(); for (const f of feats) for (const r of f.p) ringPath(pr, r); ctx.clip();
  if (o.extra) o.extra(pr);
  // paper grain + gentle relief shading
  blur(40, () => { ctx.fillStyle = 'rgba(120,90,50,0.10)'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(hash(i * 3) * W, hash(i * 5) * H, 220, 120, 0, 0, 6.3); ctx.fill(); } });
  ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(60,44,34,0.75)'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.beginPath(); for (const f of feats) for (const r of f.p) ringPath(pr, r); ctx.stroke(); ctx.restore();
  return pr;
}
/** fill a lon/lat polygon over land only (call inside o.extra) */
export function regionFill(pr, pts, col, alpha = 1) { ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = col; ctx.beginPath(); ringPath(pr, pts); ctx.fill(); ctx.restore(); }
/** orthographic globe from the world set; regions: [{ names:Set, col }] or [{ pts, col, alpha }] */
export function drawGlobe(cx, cy, Rr, lon0, lat0, regions = [], o = {}) {
  const cl = Math.cos(lat0 * R), sl = Math.sin(lat0 * R);
  const pr = (lo, la) => { const c = Math.cos(la * R), dl = (lo - lon0) * R, x = c * Math.sin(dl), y = Math.sin(la * R) * cl - c * Math.cos(dl) * sl, z = Math.sin(la * R) * sl + c * Math.cos(dl) * cl;
    if (z < 0) { const n = Math.hypot(x, y) || 1; return [cx + x / n * Rr, cy - y / n * Rr]; } return [cx + x * Rr, cy - y * Rr]; };
  const disc = ellD(cx, cy, Rr, Rr);
  F(disc, o.sea || '#a9cde2', { line: 0, shadow: 0, hi: 0, soft: 0, tex: 0.08, ink: false });
  ctx.save(); clipTo(disc);
  const fill = (f) => { const rg = regions.find((r) => r.names && r.names.has(f.n)); return rg ? rg.col : (o.land || '#e4d8bc'); };
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); for (const f of GEO.w) for (const r of f.p) ringPath(pr, r); ctx.stroke(); ctx.restore();
  for (const f of GEO.w) { ctx.fillStyle = fill(f); ctx.beginPath(); for (const r of f.p) ringPath(pr, r); ctx.fill(); }
  for (const rg of regions) if (rg.pts) { ctx.save(); ctx.beginPath(); for (const f of GEO.w) for (const r of f.p) ringPath(pr, r); ctx.clip(); ctx.globalAlpha = rg.alpha ?? 1; ctx.fillStyle = rg.col; ctx.beginPath(); ringPath(pr, rg.pts); ctx.fill(); ctx.restore(); }
  if (o.borders !== false) { ctx.save(); ctx.strokeStyle = 'rgba(60,44,34,0.5)'; ctx.lineWidth = 1.6; ctx.beginPath(); for (const f of GEO.w) for (const r of f.p) ringPath(pr, r); ctx.stroke(); ctx.restore(); }
  // sphere shading: light from upper-left, dark rim lower-right
  const g = ctx.createRadialGradient(cx - Rr * 0.4, cy - Rr * 0.45, Rr * 0.05, cx, cy, Rr * 1.02); g.addColorStop(0, 'rgba(255,255,255,0.45)'); g.addColorStop(0.5, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(30,40,70,0.45)'); ctx.fillStyle = g; ctx.fillRect(cx - Rr, cy - Rr, 2 * Rr, 2 * Rr);
  if (o.spin) blur(6, () => { ctx.globalAlpha = o.spin; ctx.fillStyle = 'rgba(236,242,248,0.85)'; for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.ellipse(cx, cy - Rr + (i + 0.5) * Rr / 8, Rr * Math.sqrt(Math.max(0, 1 - Math.pow((i + 0.5) / 8 - 1, 2))), 5 + 4 * hash(i), 0, 0, 6.3); ctx.fill(); } });
  ctx.restore();
  Ln(disc, 9, 712);
  return pr;
}
