// "What if Germany won WW2" — full film in the Ink Toon style. Shots 1–3: intro.js (approved test), 4–24: shots.js.
import { W, H, ctx, clamp, lerp, seg, eob, S, at, caption, vignette, grainAll } from './kit.js';
import { shot1, shot2, shot3, T } from './intro.js';
import { SHOTS2 } from './shots.js';

const DUR = 89.5, OP = (window.OP = { ready: false });
const SHOTS = [[0, shot1], [T.s2, shot2], [T.s3, shot3], ...SHOTS2];
let CAPS = [];
function captions(t) { const c = CAPS.find(([a, b]) => t >= a && t < b); if (!c) return; const pop = eob(seg(t, c[0], c[0] + 0.12));
  const txt = c[2], lines = txt.length > 16 && txt.includes(' ') ? (() => { const w = txt.split(' '), h = Math.ceil(w.length / 2); return [w.slice(0, h).join(' '), w.slice(h).join(' ')]; })() : [txt];
  at(540, 1338, 0, lerp(0.85, 1, pop), () => lines.forEach((l, i) => caption(l, 0, i * 64, 60))); }
function draw(t) {
  t = clamp(t, 0, DUR - 1e-4); S.boil = Math.floor(t * 12);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  let i = SHOTS.length - 1; while (i > 0 && SHOTS[i][0] > t) i--;
  ctx.save(); SHOTS[i][1](t); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  vignette(0.2); grainAll(0.06); captions(t);
}
(async () => {
  try { await document.fonts.load('700 100px Fredoka'); CAPS = await (await fetch('captions.json')).json();
    OP.duration = () => DUR; OP.draw = draw; OP.frame = (t, q = 0.92) => { draw(t); return document.getElementById('cv').toDataURL('image/jpeg', q); };
    OP.shots = () => SHOTS.map((s, i) => ({ id: 'S' + (i + 1), at: s[0], end: i < SHOTS.length - 1 ? SHOTS[i + 1][0] : DUR, note: '' }));
    OP.captions = () => []; OP.cues = () => []; OP.ready = true;
    const q = new URLSearchParams(location.search); if (!q.has('capture')) { const t0 = performance.now(); const loop = (n) => { draw(((n - t0) / 1000) % DUR); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  } catch (e) { OP.bootError = String(e && e.stack || e); }
})();
