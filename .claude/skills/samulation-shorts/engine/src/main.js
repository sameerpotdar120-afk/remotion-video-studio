// Preview film: draw(t) is a pure function of time. Each shot renders its 3D frame into the hidden WebGL canvas, which is
// copied to the 2D canvas; shot changes are short cross-dissolves on top of the moving camera (no hard cuts); one-word captions.
import { makeEngine, camera, RES, AA } from './engine.js';
import { THREE, clamp, lerp, seg, ease, eout, lerp3, v3 } from './core.js';
import { buildAlley } from './alley.js';
import { buildCity } from './city.js';
import { buildHall } from './hall.js';
import { buildFront } from './front.js';

const W = 1080, H = 1920, cv = document.getElementById('cv'), GL = document.getElementById('gl'), ctx = cv.getContext('2d');
const OP = (window.OP = { ready: false }); const Q = new URLSearchParams(location.search);
let DUR = 13.75, WORDS = [], CAPS = [], E, SHOTS = [];
const cam = camera(34);
function aim(from, to, fov) { cam.position.set(...from); cam.fov = fov; cam.updateProjectionMatrix(); cam.lookAt(...to); }

function build() {
  const A = buildAlley();
  SHOTS.push({ id: 'alley', at: 0, draw(t, d) { d = 2.1;
    const k = t / d, w = t * 5.2;
    aim(lerp3([0.25, 1.5, 3.6], [0.15, 1.45, 2.9], ease(k)), [0.0, 1.9, -9], 54);
    A.hero.at(lerp(-1.7, 0.2, k), 0, -1.3).set({ mood: 'smug', turn: 0.75, walk: w, lookAt: [1, 0.2], armL: [-30 + Math.sin(w) * 40, 120], armR: [30 - Math.sin(w) * 40, 120], headDx: 6 }).face(cam);
    A.a.at(0.55, 0, -9.15).set({ mood: 'neutral', turn: -0.6, armL: [-70, 30], armR: [40, 120] }).face(cam);
    A.b.at(-0.85, 0, -8.75).set({ mood: 'worried', turn: 0.5, lookAt: [1, 0] }).face(cam);
    E.render(A.scene, cam, { bloom: 0.32, bloomThreshold: 0.8, focus: 7, aperture: 0.00022, maxblur: 0.004, vignette: 0.42, grain: 0.012, sat: 1.18, warm: 0.0, exposure: 1.0, t });
  } });
  const C = buildCity();
  SHOTS.push({ id: 'city', at: 2.1, draw(t, d) { d = 2.6;
    const k = clamp(t / d), up = ease(seg(k, 0.25, 1));
    aim(lerp3(lerp3([1.2, 1.7, 9], [0.6, 3.2, 3], ease(seg(k, 0, 0.5))), [3, 62, 6], up), lerp3([0.2, 3.2, -30], [0, 0, -52], up), lerp(50, 46, up));
    C.ppl.forEach((p) => p.face(cam));
    E.render(C.scene, cam, { bloom: 0.36, bloomThreshold: 0.82, focus: lerp(22, 70, up), aperture: 0.00012, maxblur: 0.004, vignette: 0.4, grain: 0.012, sat: 1.2, warm: 0, exposure: 1.0, t });
  } });
  const Hh = buildHall();
  SHOTS.push({ id: 'hall', at: 4.7, draw(t, d) { d = 5.8;
    const k = clamp(t / d);
    aim(lerp3([0, 1.62, 4.2], [0, 1.5, -4.6], k * 0.85 + ease(k) * 0.15), [0, 1.25, -30], 62);
    Hh.seated.forEach((a) => a.set({ sit: true, turn: -a.sx * 0.8, mood: ['neutral', 'worried', 'smug', 'neutral', 'happy'][a.i % 5], lookAt: [-a.sx, 0.1], armL: [a.sx < 0 ? -60 : -20, 60], armR: [a.sx < 0 ? 20 : 60, 60], headDx: -a.sx * 5 }).face(cam));
    const cz = lerp(-17, -3.2, k), w = t * 5.5;
    Hh.carrier.at(-0.22, 0, cz).set({ mood: 'happy', walk: w, turn: 0.3, armL: [40, 60], armR: [75, 40] }).face(cam);
    Hh.stack.position.set(0.42, 0.5 + Math.abs(Math.sin(w)) * 0.03, cz + 0.12); Hh.stack.scale.setScalar(0.85);
    Hh.mMat.emissiveIntensity = 1.0 + 0.25 * Math.sin(t * 19); Hh.cMat.emissiveIntensity = 1.5 + 0.5 * Math.sin(t * 27 + 1);
    Hh.lamps.forEach((l, i) => { l.material.opacity = Math.sin(t * 14 + i * 2.1) > 0.2 ? 0.85 : 0; });
    E.render(Hh.scene, cam, { bloom: 0.34, bloomThreshold: 0.86, focus: 7, aperture: 0.00016, maxblur: 0.004, vignette: 0.3, grain: 0.012, sat: 1.15, warm: 0.03, exposure: 1.0, t });
  } });
  const Fr = buildFront();
  SHOTS.push({ id: 'front', at: 10.5, draw(t, d) { d = 3.25;
    const k = clamp(t / d), w = t * 4.2;
    aim(lerp3([1.4, 1.55, 9.2], [1.0, 1.55, 7.8], ease(k)), lerp3([-0.3, 2.5, -3], [-0.2, 2.35, -3], k), 46);
    Fr.cop.at(lerp(-2.3, 2.0, k), 0, 0.9).set({ mood: 'smug', turn: 0.8, walk: w, lookAt: [0.6, -0.2], armL: [-25 + Math.sin(w) * 30, 120], armR: [25 - Math.sin(w) * 30, 120], headDx: 6 }).face(cam);
    Fr.hero.at(1.55, 0, -1.1).set({ mood: k > 0.45 ? 'shock' : 'neutral', turn: -0.7, lookAt: [-1, 0], armL: [-60, 120], armR: [50, 120] }).face(cam);
    Fr.exitA.at(-1.1, 0, -2.0).set({ mood: 'happy', turn: 0.4, armL: [-40, 100], armR: [40, 100] }).face(cam);
    E.render(Fr.scene, cam, { bloom: 0.36, bloomThreshold: 0.82, focus: 7.5, aperture: 0.00018, maxblur: 0.004, vignette: 0.42, grain: 0.012, sat: 1.18, warm: 0, exposure: 1.0, t });
  } });
}

// ── captions: one word at a time; short words ride with the next ──
const SHORT = /^(a|an|the|to|of|in|on|at|by|and|but|or|so|is|it|he|she|we|i|his|her|my|no|up|for|was|are)$/i;
function buildCaps() {
  const ws = WORDS; CAPS = [];
  for (let i = 0; i < ws.length; i++) { const w = ws[i].w, n = ws[i + 1], bare = w.replace(/[^A-Za-z']/g, '');
    if (n && SHORT.test(bare) && !/[,.!?;:]$/.test(w) && (w + n.w).length <= 11 && n.s - ws[i].e < 0.2) { CAPS.push({ s: ws[i].s, text: w + ' ' + n.w }); i++; } else CAPS.push({ s: ws[i].s, text: w }); }
  CAPS.forEach((c, k) => { c.e = CAPS[k + 1] ? CAPS[k + 1].s : DUR; });
}
function caption(t) {
  const c = CAPS.find((x) => t >= x.s - 0.02 && t < x.e - 0.02); if (!c) return;
  ctx.save(); ctx.font = '900 78px Mont'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const x = 540, y = 1381;
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 6;
  ctx.strokeStyle = '#000'; ctx.lineWidth = 9; ctx.strokeText(c.text, x, y);
  ctx.shadowColor = 'transparent'; ctx.fillStyle = '#fff'; ctx.fillText(c.text, x, y); ctx.restore();
}

/** rubber stamp that slams in (k 0..1): stamp(ctx, 'BANNED', 540, 860, -0.16, seg(t, 1.0, 1.35)) */
function stamp(c, text, x, y, rot, k, col = '#e0262e') {
  if (k <= 0) return; const s = 1 + 1.4 * Math.pow(1 - Math.min(1, k * 1.6), 2); c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha = Math.min(1, k * 3);
  c.lineJoin = 'round'; c.font = '900 150px Mont'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(text).width + 70;
  c.strokeStyle = col; c.lineWidth = 16; c.beginPath(); c.roundRect(-w / 2, -95, w, 190, 24); c.stroke(); c.fillStyle = col; c.fillText(text, 0, 8);
  c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 70; i++) { c.globalAlpha = 0.5; c.beginPath(); c.arc(((i * 97) % w) - w / 2, ((i * 53) % 180) - 90, 3 + (i % 4), 0, 6.3); c.fill(); }
  c.restore();
}
const OV = {};   // OV[shotId] = (ctx, localTime) => draw 2D on top of the 3D frame
const XF = 0.085;   // half-length of the cross-dissolve (s): ~5 frames in total
function renderShot(i, t) { const s = SHOTS[i], end = i < SHOTS.length - 1 ? SHOTS[i + 1].at : DUR; s.draw(t - s.at, end - s.at, t); }
function draw(t) {
  t = clamp(t, 0, DUR - 1e-4); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  let i = SHOTS.length - 1; while (i > 0 && SHOTS[i].at > t) i--;
  renderShot(i, t); ctx.drawImage(GL, 0, 0, W, H);
  const nx = SHOTS[i + 1], pv = i > 0 ? SHOTS[i] : null;
  if (nx && nx.at - t < XF) { renderShot(i + 1, t); ctx.globalAlpha = 0.5 * (1 - (nx.at - t) / XF); ctx.drawImage(GL, 0, 0, W, H); ctx.globalAlpha = 1; }
  else if (pv && t - pv.at < XF) { renderShot(i - 1, t); ctx.globalAlpha = 0.5 * (1 - (t - pv.at) / XF); ctx.drawImage(GL, 0, 0, W, H); ctx.globalAlpha = 1; }
  if (OV[SHOTS[i].id]) OV[SHOTS[i].id](ctx, t - SHOTS[i].at);   // optional 2D overlay per shot (stamps, labels)
  if (!Q.has('nocap')) caption(t);   // ?nocap renders clean frames for thumbnails
}

(async () => {
  try {
    await document.fonts.load('900 80px Mont'); await document.fonts.load('800 80px Mont'); await document.fonts.load('700 80px Fredoka'); await document.fonts.load('700 80px Caladea'); await document.fonts.load("700 40px IPAGothic");
    WORDS = await (await fetch('data/words.json', { cache: 'no-store' })).json(); DUR = Math.max(+(Q.get('dur') || 0), WORDS[WORDS.length - 1].e + 0.6); buildCaps();
    GL.width = Math.round(W * RES); GL.height = Math.round(H * RES);
    E = makeEngine(GL, { w: GL.width, h: GL.height, samples: AA }); build(); SHOTS.sort((a, b) => a.at - b.at);
    OP.duration = () => DUR; OP.draw = draw; OP.frame = (t, q = 0.93) => { draw(t); return cv.toDataURL('image/jpeg', q); };
    OP.shots = () => SHOTS.map((s, i) => ({ id: s.id, at: s.at, end: i < SHOTS.length - 1 ? SHOTS[i + 1].at : DUR, note: '' }));
    OP.captions = () => CAPS.map((c) => ({ s: c.s, e: c.e, text: c.text })); OP.cues = () => []; OP.ready = true;
    if (!Q.has('capture')) draw(+(Q.get('t') || 0));
  } catch (e) { OP.bootError = String((e && e.stack) || e); console.error(e); }
})();
