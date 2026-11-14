// Samulation channel art: ?what=banner (2560x1440, YouTube safe area 1546x423 in the centre) or ?what=avatar (800x800, shown as a circle).
// Background = our 3D neon street rendered at the asset's aspect; the hero (2D rig) and the logotype are painted on top.
import * as THREE from 'three';
import { makeEngine } from './engine.js';
import { buildCity } from './city.js';
import { setCtx, S, blur } from './kit.js';
import { char, HERO } from './char.js';

const Q = new URLSearchParams(location.search), WHAT = Q.get('what') || 'banner';
const cv = document.getElementById('cv'), GL = document.getElementById('gl');
const [W, H] = WHAT === 'avatar' ? [800, 800] : [2560, 1440];   // banner and poses are 2560x1440
cv.width = W; cv.height = H; GL.width = W; GL.height = H;
const ctx = cv.getContext('2d'); const OP = (window.OP = { ready: false });

function logotype(x, y, size, align = 'center') {   // SAMULATION: white heavy letters, "SAM" in gold, ink outline, orange glow
  ctx.save(); ctx.font = `900 ${size}px Mont`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const a = 'SAM', b = 'ULATION', wa = ctx.measureText(a).width, wb = ctx.measureText(b).width, sp = size * 0.02, x0 = align === 'center' ? x - (wa + wb + sp) / 2 : x;
  ctx.shadowColor = 'rgba(255,120,30,0.85)'; ctx.shadowBlur = size * 0.35; ctx.fillStyle = '#000'; ctx.fillText(a + b, x0, y); ctx.shadowColor = 'transparent';
  ctx.lineWidth = size * 0.14; ctx.strokeStyle = '#140c1e'; ctx.strokeText(a, x0, y); ctx.strokeText(b, x0 + wa + sp, y);
  const g = ctx.createLinearGradient(0, y - size * 0.8, 0, y); g.addColorStop(0, '#fff3a6'); g.addColorStop(0.5, '#f6c23a'); g.addColorStop(1, '#c9780e');
  ctx.fillStyle = g; ctx.fillText(a, x0, y);
  const g2 = ctx.createLinearGradient(0, y - size * 0.8, 0, y); g2.addColorStop(0, '#ffffff'); g2.addColorStop(1, '#dfe4ff');
  ctx.fillStyle = g2; ctx.fillText(b, x0 + wa + sp, y);
  ctx.restore();
  return x0 + wa + wb + sp;
}
function hero(x, gy, s, o = {}) { setCtx(ctx); S.boil = 0; char(x, gy, s, { look: HERO, ...o }); }

function render() {
  const E = makeEngine(GL, { w: W, h: H, samples: 4 });
  const C = buildCity();
  const cam = new THREE.PerspectiveCamera(WHAT === 'avatar' ? 50 : 40, W / H, 0.05, 800);
  if (WHAT !== 'avatar') { cam.position.set(0.3, 2.2, 7.5); cam.lookAt(0, 3.6, -40); }
  else { cam.position.set(0.4, 2.8, 4); cam.lookAt(0, 4.2, -30); }
  C.ppl.forEach((p) => p.face(cam));
  E.render(C.scene, cam, { bloom: 0.4, bloomThreshold: 0.8, focus: 3, aperture: 0.0016, maxblur: 0.012, vignette: 0.45, grain: 0.012, sat: 1.15, exposure: 0.95 });
  ctx.drawImage(GL, 0, 0, W, H);
  if (WHAT === 'banner') {
    // darken the centre band so the logo and hero read on every device (safe area 1546x423 centred)
    const g = ctx.createLinearGradient(0, H / 2 - 300, 0, H / 2 + 300); g.addColorStop(0, 'rgba(8,8,30,0)'); g.addColorStop(0.5, 'rgba(8,8,30,0.62)'); g.addColorStop(1, 'rgba(8,8,30,0)');
    ctx.fillStyle = g; ctx.fillRect(0, H / 2 - 300, W, 600);
    // hero, waist-up, left part of the safe area, smug, pointing at the name
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H / 2 + 211); ctx.clip();
    hero(700, 1195, 1.0, { mood: 'smug', armR: [95, -55], armL: [-60, 110], lookAt: [1, 0], turn: 0.25 });
    ctx.restore();
    const end = logotype(890, 735, 150, 'left');
    ctx.save(); ctx.font = '800 44px Mont'; ctx.textAlign = 'left'; ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#120a1e';
    const tag = 'HOW THE WORLD REALLY WORKS'; ctx.strokeText(tag, 898, 818); ctx.fillStyle = '#ffd36b'; ctx.fillText(tag, 898, 818); window._logoEnd = end; ctx.restore();
    if (Q.has('guides')) { ctx.strokeStyle = '#0f0'; ctx.lineWidth = 4; ctx.strokeRect((W - 1546) / 2, (H - 423) / 2, 1546, 423); ctx.strokeStyle = '#ff0'; ctx.strokeRect((W - 2560) / 2, (H - 423) / 2, 2560, 423); }
  } else if (WHAT === 'avatar') {
    blur(40, () => { ctx.fillStyle = 'rgba(10,8,40,0.35)'; ctx.fillRect(0, 0, W, H); });
    const g = ctx.createRadialGradient(400, 360, 40, 400, 400, 420); g.addColorStop(0, 'rgba(255,150,50,0.55)'); g.addColorStop(0.55, 'rgba(120,60,200,0.15)'); g.addColorStop(1, 'rgba(10,8,40,0.6)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    hero(400, 1185, 1.42, { mood: Q.get('mood') || 'smug', armL: [-60, 110], armR: [60, 110], lookAt: [0.4, 0] });
    if (Q.has('guides')) { ctx.strokeStyle = '#0f0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(400, 400, 400, 0, 6.3); ctx.stroke(); }  }
  if (WHAT === 'poses') {   // hero pose sheet over the banner background
    ctx.fillStyle = 'rgba(8,8,30,0.55)'; ctx.fillRect(0, 0, W, H);
    const P = [['neutral', {}], ['walk', { walk: 1.2, turn: 0.75, mood: 'smug', armL: [-50, 110], armR: [50, 110] }], ['point', { mood: 'smug', armR: [150, -70], turn: 0.3 }],
      ['shock', { mood: 'shock', armL: [-70, -40], armR: [70, -40] }], ['worried', { mood: 'worried', armL: [-40, 60], armR: [40, 60] }], ['happy', { mood: 'happy', armL: [-90, -80], armR: [90, -80] }],
      ['shrug', { mood: 'smug', armL: [-95, -25], armR: [95, -25] }], ['3/4 turn', { turn: -0.7, mood: 'neutral', lookAt: [-1, 0] }]];
    P.forEach(([n, o], i) => { const x = 170 + i * 315; hero(x, 1130, 0.95, o); ctx.font = '800 54px Mont'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd36b'; ctx.fillText(n, x, 1260); });
    logotype(1280, 200, 120);
  }
}
(async () => {
  try {
    await document.fonts.load('900 100px Mont'); await document.fonts.load('800 100px Mont'); await document.fonts.load('700 100px Fredoka'); await document.fonts.load('700 40px IPAGothic');
    render();
    OP.duration = () => 1; OP.draw = () => {}; OP.frame = (t, q = 0.95) => cv.toDataURL('image/png');
    OP.shots = () => [{ id: WHAT, at: 0, end: 1, note: '' }]; OP.captions = () => []; OP.cues = () => []; OP.ready = true;
  } catch (e) { OP.bootError = String((e && e.stack) || e); console.error(e); }
})();
