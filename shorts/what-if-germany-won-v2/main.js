// "What if Germany won WW2" v2 — your VO, 4K 60 fps, every shot at the preview's quality bar.
import { W, H, ctx, clamp, lerp, seg, eob, S, at, caption, vignette, grainAll, DPR } from './kit.js';
import { shot1, shot2, shot3, T } from './intro.js';
import { HQ } from './hq.js';
import { loadGeo } from './geo.js';

const DUR = 94.4, OP = (window.OP = { ready: false });
export const pl = (t, k) => { if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])); return k[k.length - 1][1]; };
const SHOTS = [
  [0, shot1],
  [6.7, (t) => shot2(pl(t, [[6.7, 2.38], [7.2, 3.75], [7.65, 4.2], [7.7, 5.2], [8.15, 5.62], [11.4, 6.17]]))],
  [11.4, HQ.desk],
  [17.2, HQ.dunkirk],
  [21.9, HQ.declare],
  [26.6, (t) => shot2(pl(t, [[26.6, 3.9], [27.9, 5.65]]))],
  [27.9, HQ.summer], [30.6, HQ.blitz], [32.7, HQ.peace],
  [34.7, HQ.ireland],
  [37.7, HQ.porch], [38.8, HQ.arena], [44.8, HQ.stayout],
  [46.8, HQ.mapgrow], [49.8, HQ.globespin], [50.9, HQ.rome], [53.4, HQ.parchment], [65.9, HQ.passport], [69.9, HQ.fear],
  [74.9, HQ.split], [78.9, HQ.road], [82.4, HQ.breakup], [89.0, HQ.globeend], [92.0, HQ.globefinal],
];
let CAPS = [];
function captions(t) { const c = CAPS.find(([a, b]) => t >= a && t < b); if (!c) return; const pop = eob(seg(t, c[0], c[0] + 0.12));
  const txt = c[2], lines = txt.length > 16 && txt.includes(' ') ? (() => { const w = txt.split(' '), h = Math.ceil(w.length / 2); return [w.slice(0, h).join(' '), w.slice(h).join(' ')]; })() : [txt];
  at(540, 1338, 0, lerp(0.85, 1, pop), () => lines.forEach((l, i) => caption(l, 0, i * 64, 60))); }
function draw(t) {
  t = clamp(t, 0, DUR - 1e-4); S.boil = Math.floor(t * 12);
  const base = () => { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; };
  base(); let i = SHOTS.length - 1; while (i > 0 && SHOTS[i][0] > t) i--;
  ctx.save(); SHOTS[i][1](t); ctx.restore(); base();
  vignette(0.2); grainAll(0.06); captions(t);
}
(async () => {
  try { await document.fonts.load('700 100px Fredoka'); CAPS = await (await fetch('captions.json')).json(); await loadGeo();
    OP.duration = () => DUR; OP.draw = draw; OP.frame = (t, q = 0.92) => { draw(t); return document.getElementById('cv').toDataURL('image/jpeg', q); };
    OP.shots = () => SHOTS.map((s, i) => ({ id: 'S' + (i + 1), at: s[0], end: i < SHOTS.length - 1 ? SHOTS[i + 1][0] : DUR, note: '' }));
    OP.captions = () => []; OP.cues = () => []; OP.ready = true;
    const q = new URLSearchParams(location.search); if (!q.has('capture')) { const t0 = performance.now(); const loop = (n) => { draw(((n - t0) / 1000) % DUR); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  } catch (e) { OP.bootError = String(e && e.stack || e); }
})();
