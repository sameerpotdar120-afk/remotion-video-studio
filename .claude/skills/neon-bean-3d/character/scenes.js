// Character design sheet: 3 options, each = full body + 4 expressions.
import { W, H, ctx, S, grad, text, blur, vignette, grainAll, caption } from './kit.js';
import { char, headOnly, LOOKS, HAIRS, HAIRS2, HAIRS3 } from './char.js';
const OP = (window.OP = { ready: false }), DUR = 1;
const q = new URLSearchParams(location.search), ONLY = q.get('opt') || window.ONLY_OPT;

function silhouette(fn) {   // draw into an offscreen canvas, then fill everything opaque with black
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const main = ctx.canvas; return { c, g };
}
function hairSheet() {
  S.boil = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1;
  grad([[0, '#2c2f5e'], [1, '#191a33']], 0, 0, 0, H);
  const keys = ['H1', 'H2', 'H3'], rh = H / 3;
  keys.forEach((k, i) => {
    const L = HAIRS[k], y0 = i * rh;
    if (i) { ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(40, y0); ctx.lineTo(W - 40, y0); ctx.stroke(); }
    blur(40, () => { ctx.fillStyle = 'rgba(255,200,140,0.16)'; ctx.beginPath(); ctx.ellipse(220, y0 + rh * 0.55, 210, rh * 0.42, 0, 0, 6.3); ctx.fill(); });
    char(220, y0 + rh * 0.95, 0.7, { look: L, mood: 'neutral', armL: [-60, 120], armR: [70, 115] });
    headOnly(560, y0 + rh * 0.42, 105, L, 'happy');
    headOnly(800, y0 + rh * 0.36, 62, L, 'smug'); headOnly(800, y0 + rh * 0.72, 62, L, 'shock');
    // silhouette test: whole figure in solid black at feed size
    ctx.save(); ctx.translate(960, y0 + rh * 0.2); ctx.scale(0.22, 0.22); ctx.translate(-220, -(y0 + rh * 0.95) + rh * 2.2);
    ctx.filter = 'brightness(0)'; char(220, y0 + rh * 0.95, 0.7, { look: L }); ctx.filter = 'none'; ctx.restore();
    text('silhouette', 975, y0 + rh * 0.86, 24, 'rgba(255,255,255,0.6)');
    text(L.name, 560, y0 + 52, 44, '#ffd36b');
  });
  vignette(0.25); grainAll(0.05);
}
function hairSheet2() {
  S.boil = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1;
  grad([[0, '#2c2f5e'], [1, '#191a33']], 0, 0, 0, H);
  const base = { body: '#5a7fa8', sh: '#16233a', shoe: '#e9e4d8' };
  Object.keys(HAIRS2).forEach((k, i) => {
    const L = { ...base, ...HAIRS2[k] }, cx = (i % 2) * 540 + 270, y0 = Math.floor(i / 2) * 640;
    if (i % 2) { ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(540, y0 + 30); ctx.lineTo(540, y0 + 610); ctx.stroke(); }
    if (i >= 2 && i % 2 === 0) { ctx.beginPath(); ctx.moveTo(40, y0); ctx.lineTo(W - 40, y0); ctx.stroke(); }
    blur(40, () => { ctx.fillStyle = 'rgba(255,200,140,0.14)'; ctx.beginPath(); ctx.ellipse(cx - 40, y0 + 330, 200, 230, 0, 0, 6.3); ctx.fill(); });
    headOnly(cx - 50, y0 + 360, 120, L, i % 3 === 1 ? 'smug' : i % 3 === 2 ? 'happy' : 'neutral');
    ctx.save(); ctx.filter = 'brightness(0)'; char(cx + 190, y0 + 590, 0.32, { look: L }); ctx.filter = 'none'; ctx.restore();
    text(L.name, cx, y0 + 60, 42, '#ffd36b'); text(k, cx + 190, y0 + 620, 22, 'rgba(255,255,255,0.5)');
  });
  vignette(0.25); grainAll(0.05);
}
function hairSheet3() {
  S.boil = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1;
  grad([[0, '#232655'], [1, '#12132a']], 0, 0, 0, H);
  const base = { body: '#5a7fa8', sh: '#16233a', shoe: '#e9e4d8' }, rh = H / 3;
  Object.keys(HAIRS3).forEach((k, i) => {
    const L = { ...base, ...HAIRS3[k] }, y0 = i * rh;
    if (i) { ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(40, y0); ctx.lineTo(W - 40, y0); ctx.stroke(); }
    blur(50, () => { ctx.fillStyle = 'rgba(150,120,255,0.14)'; ctx.beginPath(); ctx.ellipse(400, y0 + rh * 0.6, 380, rh * 0.42, 0, 0, 6.3); ctx.fill(); });
    char(190, y0 + rh * 0.96, 0.5, { look: L, mood: 'neutral', armL: [-60, 120], armR: [70, 115] });
    headOnly(560, y0 + rh * 0.66, 118, L, ['smug', 'happy', 'neutral'][i]);
    ctx.save(); ctx.filter = 'brightness(0)'; char(920, y0 + rh * 0.9, 0.36, { look: L }); ctx.filter = 'none'; ctx.restore();
    text('silhouette', 920, y0 + rh * 0.96, 22, 'rgba(255,255,255,0.55)');
    text(L.name, 540, y0 + 48, 44, '#ffd36b');
  });
  vignette(0.25); grainAll(0.05);
}
function sheet(t) {
  if (q.get('sheet') === 'hair3') return hairSheet3();
  if (q.get('sheet') === 'hair2') return hairSheet2();
  if (q.get('sheet') === 'hair') return hairSheet();
  S.boil = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1;
  grad([[0, '#2c2f5e'], [1, '#191a33']], 0, 0, 0, H);
  const rows = ONLY ? [ONLY] : ['A', 'B', 'C'], rh = H / rows.length;
  rows.forEach((k, i) => {
    const L = LOOKS[k], y0 = i * rh, sc = ONLY ? 1.35 : 0.78;
    blur(40, () => { ctx.fillStyle = 'rgba(255,200,140,0.18)'; ctx.beginPath(); ctx.ellipse(250, y0 + rh * 0.55, 230, rh * 0.42, 0, 0, 6.3); ctx.fill(); });
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 3; if (i) { ctx.beginPath(); ctx.moveTo(40, y0); ctx.lineTo(W - 40, y0); ctx.stroke(); }
    char(ONLY ? 360 : 250, y0 + rh * (ONLY ? 0.6 : 0.93), sc, { look: L, mood: 'neutral', armL: [-60, 120], armR: [85, -40] });
    const moods = ['happy', 'smug', 'shock', 'worried'], hr = ONLY ? 92 : 62;
    moods.forEach((m, j) => {
      const hx = ONLY ? 300 + (j % 2) * 420 : 560 + (j % 2) * 300, hy = ONLY ? H * 0.8 + Math.floor(j / 2) * 0 + (j >= 2 ? 0 : 0) : y0 + rh * 0.3 + Math.floor(j / 2) * rh * 0.42;
      if (ONLY) { headOnly(170 + j * 250, H * 0.84, 92, L, m, [0, 0]); text(m, 170 + j * 250, H * 0.84 + 135, 38, '#fff'); }
      else { headOnly(hx, hy, hr, L, m, [0, 0]); text(m, hx, hy + hr + 38, 30, 'rgba(255,255,255,0.8)'); }
    });
    text(L.name, ONLY ? W / 2 : 870, ONLY ? 90 : y0 + 50, ONLY ? 60 : 40, '#ffd36b');
  });
  vignette(0.25); grainAll(0.05);
}
(async () => {
  try { await document.fonts.load('700 100px Fredoka'); await document.fonts.load('900 100px Mont');
    OP.duration = () => DUR; OP.draw = sheet; OP.frame = (t, qq = 0.92) => { sheet(t); return document.getElementById('cv').toDataURL('image/jpeg', qq); };
    OP.shots = () => [{ id: 'S1', at: 0, end: DUR, note: 'sheet' }]; OP.captions = () => []; OP.cues = () => []; OP.ready = true;
    if (!q.has('capture')) sheet(0);
  } catch (e) { OP.bootError = String((e && e.stack) || e); }
})();
