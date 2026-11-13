// Preview film: draw(t) is a pure function of time. Each shot renders its 3D frame into the hidden WebGL canvas, which is
// copied to the 2D canvas; shot changes are short cross-dissolves on top of the moving camera (no hard cuts); one-word captions.
import { makeEngine, camera, RES, AA } from './engine.js';
import { THREE, clamp, lerp, seg, ease, eout, lerp3, v3 } from './core.js';
import { buildAlley } from './alley.js';
import { buildCity } from './city.js';
import { buildHall } from './hall.js';
import { buildFront } from './front.js';
import { buildCounter } from './counter.js';
import { Actor, inkBox, plane, flat, tex, fill, frame, glow } from './core.js';
import { LOOKS } from './char.js';

const W = 1080, H = 1920, cv = document.getElementById('cv'), GL = document.getElementById('gl'), ctx = cv.getContext('2d');
const SC = +(new URLSearchParams(location.search).get('scale') || 1); cv.width = W * SC; cv.height = H * SC;   // scale=2 -> 2160x3840 output
const OP = (window.OP = { ready: false }); const Q = new URLSearchParams(location.search);
let DUR = 13.75, WORDS = [], CAPS = [], E, SHOTS = [];
const cam = camera(34);
function aim(from, to, fov) { cam.position.set(...from); cam.fov = fov; cam.updateProjectionMatrix(); cam.lookAt(...to); }

const WD = (word, from = 0) => { const w = WORDS.find((x, i) => i >= from && x.w.toLowerCase().replace(/[^a-z0-9,]/g, '').startsWith(word)); return w ? w.s : 0; };
function toScreen(v) { cam.updateMatrixWorld(); const p = v.clone().project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; }
function clipboard(c, x, y, s, k) {   // 2D prop: patrol log with GAMBLING: NONE + red tick
  if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.08); c.globalAlpha = Math.min(1, k * 3);
  c.fillStyle = '#7a4a22'; c.strokeStyle = '#1a1210'; c.lineWidth = 8; c.beginPath(); c.roundRect(-130, -170, 260, 340, 18); c.fill(); c.stroke();
  c.fillStyle = '#f4f0e6'; c.beginPath(); c.roundRect(-110, -140, 220, 290, 8); c.fill(); c.lineWidth = 4; c.stroke();
  c.fillStyle = '#9aa0b0'; c.fillRect(-45, -182, 90, 40); c.strokeRect(-45, -182, 90, 40);
  c.fillStyle = '#2a2a3a'; c.textAlign = 'center'; c.font = "700 30px Caladea, serif"; c.fillText('PATROL LOG', 0, -95);
  c.font = "700 34px Caladea, serif"; c.fillText('GAMBLING:', 0, -20); c.font = '900 52px Mont'; c.fillText('NONE', -20, 50);
  c.strokeStyle = '#d8262e'; c.lineWidth = 10; c.strokeRect(50, 12, 42, 42); const tk = Math.min(1, Math.max(0, (k - 0.3) / 0.5));
  if (tk > 0) { c.beginPath(); c.moveTo(52, 30); c.lineTo(70, 54); if (tk > 0.5) c.lineTo(70 + (tk - 0.5) * 2 * 40, 54 - (tk - 0.5) * 2 * 70); c.stroke(); }
  for (let i = 0; i < 2; i++) { c.fillStyle = 'rgba(40,40,60,0.35)'; c.fillRect(-80, 90 + i * 22, 160, 6); }
  c.restore();
}
function build() {
  const A = buildAlley(), C = buildCity(), Hh = buildHall(), Fr = buildFront(), K = buildCounter();
  // extra alley cast/props for the window scenes
  const cop = new Actor({ name: 'cop', body: '#2f55b8', sh: '#0a1848', shoe: '#15161f', hat: 'police' }).addTo(A.scene);
  const lady = new Actor({ name: 'lady', body: '#e8742c', sh: '#5a1d05', shoe: '#eee', hair: 'afro', hairCol: '#f2f0ea', hairSh: '#9a968e' }).addTo(A.scene);
  const tokA = new THREE.Group(); for (let i = 0; i < 3; i++) { const t = inkBox(0.07, 0.03, 0.05, '#ffd23a', [i * 0.03, 0.015 + i * 0.01, 0], { px: 64 }); t.rotation.y = i * 0.5; tokA.add(t); } A.scene.add(tokA);
  const billT = tex(256, 128, (c, w, h) => { fill(c, w, h, '#e8e0c0', '#d8cfa8'); c.fillStyle = '#5a6a3a'; c.font = '900 64px Mont'; c.textAlign = 'center'; c.fillText('¥', 60, 86); c.strokeStyle = '#5a6a3a'; c.lineWidth = 5; c.beginPath(); c.arc(170, 64, 34, 0, 6.3); c.stroke(); frame(c, w, h, 6, '#6a5a3a'); });
  const cash = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = plane(0.22, 0.11, new THREE.MeshStandardMaterial({ map: billT, side: THREE.DoubleSide, roughness: 0.9 }), [i * 0.02, 0.005 + i * 0.004, i * 0.015], [-Math.PI / 2, 0, i * 0.15]); cash.add(b); } A.scene.add(cash);
  const hideA = () => { cop.at(0, -50, 0); lady.at(0, -50, 0); tokA.visible = false; cash.visible = false; };
  const R = { bloom: 0.34, bloomThreshold: 0.82, vignette: 0.42, grain: 0.012, sat: 1.18, warm: 0, exposure: 1.0 };

  // S1 alley (0 - 3.45): "You risk three years in prison for gambling in Japan,"
  SHOTS.push({ id: 's1', at: 0, draw(t) { const k = clamp(t / 3.45), w = t * 5.2; hideA();
    aim(lerp3([0.3, 1.55, 3.9], [0.15, 1.48, 2.7], ease(k)), [0.0, 1.85, -9], 54);
    A.hero.at(lerp(-1.6, 0.35, k), 0, -1.3).set({ mood: t > 1.5 ? 'worried' : 'neutral', turn: 0.75, walk: w, lookAt: [1, 0.2], armL: [-30 + Math.sin(w) * 40, 120], armR: [30 - Math.sin(w) * 40, 120], headDx: 6 }).face(cam);
    A.a.at(0.55, 0, -9.15).set({ mood: 'smug', turn: -0.6, armL: [-70, 30], armR: [40, 120] }).face(cam);
    A.b.at(-0.85, 0, -8.75).set({ mood: 'neutral', turn: 0.5, lookAt: [1, 0] }).face(cam);
    E.render(A.scene, cam, { ...R, focus: 7, aperture: 0.00022, maxblur: 0.004, t }); } });
  // S2 city -> aerial (3.45 - 9.7): "but how do 9,000 parlors actually hand you cash without anyone stopping you?"
  SHOTS.push({ id: 's2', at: 3.45, draw(t) { const k = clamp(t / 6.25), up = ease(seg(k, 0.3, 1));
    aim(lerp3(lerp3([1.2, 1.7, 9], [0.6, 3.2, 3], ease(seg(k, 0, 0.5))), [3, 62, 6], up), lerp3([0.2, 3.2, -30], [0, 0, -52], up), lerp(50, 46, up));
    C.ppl.forEach((p) => p.face(cam));
    E.render(C.scene, cam, { bloom: 0.36, bloomThreshold: 0.82, focus: lerp(22, 70, up), aperture: 0.00012, maxblur: 0.004, vignette: 0.4, grain: 0.012, sat: 1.16, exposure: 0.95, t }); } });
  // S3 hall (9.7 - 15.45): "Inside, thousands of machines flash violently, while players fill buckets with steel balls."
  SHOTS.push({ id: 's3', at: 9.7, draw(t) { const k = clamp(t / 5.75);
    aim(lerp3([0, 1.62, 4.2], [0, 1.5, -4.6], k * 0.85 + ease(k) * 0.15), [0, 1.25, -30], 62);
    Hh.seated.forEach((a) => a.set({ sit: true, turn: -a.sx * 0.8, mood: t > 2.0 ? ['happy', 'smug', 'shock', 'neutral', 'happy'][a.i % 5] : 'neutral', lookAt: [-a.sx, 0.1], armL: [a.sx < 0 ? -60 : -20, 60], armR: [a.sx < 0 ? 20 : 60, 60], headDx: -a.sx * 5 }).face(cam));
    const cz = lerp(-17, -3.2, k), w = t * 5.5;
    Hh.carrier.at(-0.22, 0, cz).set({ mood: 'happy', walk: w, turn: 0.3, armL: [40, 60], armR: [75, 40] }).face(cam);
    Hh.stack.position.set(0.42, 0.5 + Math.abs(Math.sin(w)) * 0.03, cz + 0.12); Hh.stack.scale.setScalar(0.85);
    const fl = t > 1.0 && t < 3.0 ? 0.55 : 0.25;   // "flash violently"
    Hh.mMat.emissiveIntensity = 1.0 + fl * Math.sin(t * 23); Hh.cMat.emissiveIntensity = 1.5 + 0.5 * Math.sin(t * 27 + 1);
    Hh.lamps.forEach((l, i) => { l.material.opacity = Math.sin(t * 14 + i * 2.1) > 0.2 ? 0.85 : 0; });
    E.render(Hh.scene, cam, { bloom: 0.34, bloomThreshold: 0.86, focus: 7, aperture: 0.00016, maxblur: 0.004, vignette: 0.3, grain: 0.012, sat: 1.15, warm: 0.03, exposure: 1.0, t }); } });
  // S4 front (15.45 - 19.55): "Police walk right past the doors, yet nobody gets arrested."
  SHOTS.push({ id: 's4', at: 15.45, draw(t) { const k = clamp(t / 4.1), w = t * 4.2;
    aim(lerp3([1.4, 1.55, 9.2], [1.0, 1.55, 7.6], ease(k)), lerp3([-0.3, 2.5, -3], [-0.2, 2.35, -3], k), 46);
    Fr.cop.at(lerp(-2.3, 2.2, k), 0, 0.9).set({ mood: 'smug', turn: 0.8, walk: w, lookAt: [0.6, -0.2], armL: [-25 + Math.sin(w) * 30, 120], armR: [25 - Math.sin(w) * 30, 120], headDx: 6 }).face(cam);
    Fr.hero.at(1.55, 0, -1.1).set({ mood: t > 2.2 ? 'shock' : 'neutral', turn: -0.7, lookAt: [-1, 0], armL: [-60, 120], armR: t > 2.2 ? [70, -40] : [50, 120] }).face(cam);
    Fr.exitA.at(-1.1, 0, -2.0).set({ mood: 'happy', turn: 0.4, armL: [-40, 100], armR: [40, 100] }).face(cam);
    E.render(Fr.scene, cam, { ...R, bloom: 0.36, focus: 7.5, aperture: 0.00018, maxblur: 0.004, t }); } });
  // S5 counter (19.55 - 24.25): "When you win, you try to cash out, but the clerk refuses to hand over money."
  SHOTS.push({ id: 's5', at: 19.55, draw(t) { const k = clamp(t / 4.7), refuse = t > 2.5;
    aim(lerp3([-1.2, 1.6, 4.4], [-0.6, 1.55, 3.4], ease(k)), [0.4, 1.45, -2], 46);
    const arm = [80, refuse ? 20 : -30];
    K.hero.at(-0.6, 0, -0.6).set({ mood: refuse ? 'worried' : 'happy', turn: 0.6, lookAt: [1, 0], armL: [-60, 110], armR: arm }).face(cam);
    const hp = K.hero.hand(arm); K.bucket.position.set(hp.x, hp.y - 0.3, hp.z);
    K.clerk.at(0.6, 0, -2.4).set({ mood: refuse ? 'smug' : 'neutral', turn: -0.4, lookAt: [-1, 0], armL: refuse ? [-120, -20] : [-70, 110], armR: [60, 110] }).face(cam);
    K.guy.at(-3.0, 0, -2.6).set({ mood: 'neutral', turn: 0.5 }).face(cam);
    K.snack.visible = K.perfume.visible = K.tokens.visible = false;
    E.render(K.scene, cam, { bloom: 0.3, bloomThreshold: 0.86, focus: 4, aperture: 0.0002, maxblur: 0.004, vignette: 0.3, grain: 0.012, sat: 1.15, warm: 0.03, t }); } });
  OV.s5 = (c, t) => stamp(c, 'NO CASH', 540, 520, -0.12, seg(t, 3.9, 4.2));
  // S6 counter close (24.25 - 29.4): "Instead, they offer you snacks, perfume, or a few tiny plastic tokens."
  SHOTS.push({ id: 's6', at: 24.25, draw(t, d, T) { const k = clamp(t / 5.15);
    aim(lerp3([0.1, 1.75, 1.6], [0.25, 1.65, 0.9], ease(k)), [0.25, 1.25, -1.6], 44);
    const pop = (obj, wt, x) => { const p = ease(seg(T, wt - 0.05, wt + 0.25)); obj.visible = p > 0; obj.position.set(x, 1.06 + (1 - p) * 0.25, -1.45); obj.scale.setScalar(Math.max(0.01, p)); };
    pop(K.snack, WD('snacks'), -0.25); pop(K.perfume, WD('perfume'), 0.15); pop(K.tokens, WD('tokens'), 0.55); K.snack.position.y += 0.15;
    K.clerk.at(0.6, 0, -2.4).set({ mood: 'happy', turn: -0.2, lookAt: [0, -0.5], armL: [-90, 40], armR: [90, 40] }).face(cam);
    K.hero.at(-0.6, 0, -0.6); K.guy.at(-3.0, 0, -2.6);
    E.render(K.scene, cam, { bloom: 0.3, bloomThreshold: 0.86, focus: 1.3, aperture: 0.0004, maxblur: 0.005, vignette: 0.3, grain: 0.012, sat: 1.15, warm: 0.03, t }); } });
  // S7 exit (29.4 - 32.25): "You grab the tokens and head outside."
  SHOTS.push({ id: 's7', at: 29.4, draw(t, d, T) { const k = clamp(t / 2.85), go = seg(T, WD('head'), 32.25), w = t * 5;
    aim(lerp3([0.2, 1.62, 4.0], [-0.6, 1.6, 3.2], ease(k)), [-1.6, 1.5, -2.6], 48);
    const arm = [70, -10];
    K.hero.at(lerp(-0.4, -3.0, ease(go)), 0, lerp(-0.7, -2.6, ease(go))).set({ mood: 'smug', turn: go > 0 ? -0.75 : -0.3, walk: go > 0 ? w : undefined, lookAt: [-1, 0], armL: [-60, 110], armR: arm }).face(cam);
    const hp = K.hero.hand(arm); K.tokens.visible = true; K.tokens.scale.setScalar(0.8); K.tokens.position.set(hp.x, hp.y - 0.02, hp.z);
    K.snack.visible = K.perfume.visible = false; K.bucket.position.set(0, -10, 0);
    K.clerk.at(0.6, 0, -2.4).set({ mood: 'smug', turn: -0.4, lookAt: [-1, 0] }).face(cam); K.guy.at(-3.6, 0, -1.4).set({ mood: 'neutral', turn: 0.6 }).face(cam);
    E.render(K.scene, cam, { bloom: 0.3, bloomThreshold: 0.86, focus: 4, aperture: 0.0002, maxblur: 0.004, vignette: 0.3, grain: 0.012, sat: 1.15, warm: 0.03, t }); } });
  // S8 alley follow (32.25 - 38.05): "Around the corner, hidden down an alley, is an unmarked concrete wall with a small sliding window."
  SHOTS.push({ id: 's8', at: 32.25, draw(t) { const k = clamp(t / 5.8), w = t * 4.6; hideA();
    aim(lerp3([0.0, 1.7, 1.8], [0.1, 1.6, -4.0], ease(k)), [0.15, lerp(1.4, 1.55, k), -10], 50);
    A.hero.at(lerp(0.2, 0.1, k), 0, lerp(-1.4, -7.4, ease(k))).set({ mood: 'smug', turn: 0.1, walk: w, armL: [-30 + Math.sin(w) * 35, 120], armR: [30 - Math.sin(w) * 35, 120] }).face(cam);
    A.a.at(0, -50, 0); A.b.at(-0.9, 0, -8.75).set({ mood: 'neutral', turn: 0.5 }).face(cam);
    E.render(A.scene, cam, { ...R, focus: 6, aperture: 0.0002, maxblur: 0.004, t }); } });
  // S9 window over-the-shoulder (38.05 - 41.0): "This window is legally an independent shop."
  SHOTS.push({ id: 's9', at: 38.05, draw(t) { const k = clamp(t / 2.95); hideA();
    aim(lerp3([0.6, 1.85, -5.2], [0.45, 1.8, -6.0], ease(k)), [0.15, 1.55, -10], 48);
    A.hero.at(0.05, 0, -8.6).set({ mood: 'smug', turn: 0.05, lookAt: [0.3, 0] }).face(cam); A.a.at(0, -50, 0); A.b.at(0, -50, 0);
    E.render(A.scene, cam, { ...R, focus: 2.5, aperture: 0.0004, maxblur: 0.005, t }); } });
  OV.s9 = (c, t, T) => stamp(c, 'SEPARATE SHOP', 540, 470, -0.1, seg(t, 1.6, 1.95), '#2a9a5a', 0.72);
  // S10 front (41.0 - 43.4): "The parlor only awards novelty prizes,"
  SHOTS.push({ id: 's10', at: 41.0, draw(t) { const k = clamp(t / 2.4);
    aim(lerp3([0.6, 2.0, 7.8], [0.3, 2.1, 6.8], ease(k)), [-0.4, 2.6, -3], 46);
    Fr.cop.at(0, -50, 0); Fr.hero.at(1.6, 0, -1.0).set({ mood: 'smug', turn: -0.6, armR: [150, -70], lookAt: [-1, 0.2] }).face(cam);
    Fr.exitA.at(-1.0, 0, -1.6).set({ mood: 'happy', turn: 0.3, armL: [-60, 40], armR: [60, 40] }).face(cam);
    E.render(Fr.scene, cam, { ...R, bloom: 0.36, focus: 7.5, aperture: 0.00018, maxblur: 0.004, t }); } });
  OV.s10 = (c, t) => stamp(c, 'PRIZES ONLY', 540, 1080, -0.08, seg(t, 1.3, 1.6));
  // S11 alley wide queue (43.4 - 46.5): "and this window just happens to buy them for cash."
  SHOTS.push({ id: 's11', at: 43.4, draw(t) { const k = clamp(t / 3.1); hideA();
    aim(lerp3([0.9, 2.2, 0.2], [0.6, 2.05, -1.6], ease(k)), [0.1, 1.3, -10], 50);
    A.hero.at(0.4, 0, -8.9).set({ mood: 'smug', turn: -0.3 }).face(cam);
    A.a.at(-0.2, 0, -7.9).set({ mood: 'neutral', turn: -0.4 }).face(cam); A.b.at(0.5, 0, -7.0).set({ mood: 'happy', turn: -0.2 }).face(cam);
    lady.at(-0.3, 0, -6.1).set({ mood: 'happy', turn: 0.3 }).face(cam);
    E.render(A.scene, cam, { ...R, focus: 8, aperture: 0.0002, maxblur: 0.004, t }); } });
  OV.s11 = (c, t) => stamp(c, '¥ CASH', 540, 560, -0.12, seg(t, 2.1, 2.4), '#2a9a5a');
  // S12 window close (46.5 - 49.3): "You slide the tokens in, money slides out,"
  SHOTS.push({ id: 's12', at: 46.5, draw(t, d, T) { const k = clamp(t / 2.8); hideA();
    aim(lerp3([1.35, 1.75, -4.9], [1.05, 1.62, -5.8], ease(k)), [0.05, 1.2, -9.85], 42);
    A.hero.at(-0.55, 0, -8.95).set({ mood: 'smug', turn: 0.6, lookAt: [1, -0.3], armR: [95, -10] }).face(cam); tokA.scale.setScalar(3); cash.scale.setScalar(2.4); A.a.at(0, -50, 0); A.b.at(0, -50, 0);
    const tin = ease(seg(T, 46.75, 47.6)), cout = ease(seg(T, 48.2, 49.0));   // 'slide the tokens in' / 'money slides out'
    tokA.visible = tin < 1; tokA.position.set(lerp(-0.15, 0.15, tin), 1.045, lerp(-9.62, -9.9, tin));
    cash.visible = cout > 0; cash.position.set(lerp(0.2, -0.05, cout), 1.045, lerp(-9.9, -9.62, cout));
    E.render(A.scene, cam, { ...R, focus: 4.5, aperture: 0.0003, maxblur: 0.004, exposure: 0.85, t }); } });
  // S13 alley payoff + loop (49.3 - end): "and on paper, nobody gambled, even though..."
  SHOTS.push({ id: 's13', at: 49.3, draw(t) { const k = clamp(t / 3.3); hideA();
    aim(lerp3([0.25, 1.55, -3.3], [0.25, 1.5, 0.5], ease(k)), [0.0, 1.8, -9], 54);   // pulls back toward shot 1's framing
    cop.at(-0.35, 0, -5.6).set({ mood: 'neutral', turn: 0.1, armL: [60, -10], armR: [-60, -10] }).face(cam);
    lady.at(0.75, 0, -6.4).set({ mood: 'happy', turn: -0.4 }).face(cam);
    A.hero.at(0.35, 0, -8.4).set({ mood: 'smug', turn: -0.2 }).face(cam); A.a.at(0.55, 0, -9.15).set({ mood: 'smug', turn: -0.6 }).face(cam); A.b.at(0, -50, 0);
    OV._cb = toScreen(cop.group.position.clone().add(new THREE.Vector3(0.3, 1.42, 0.15)));
    E.render(A.scene, cam, { ...R, focus: 6, aperture: 0.0002, maxblur: 0.004, t }); } });
  OV.s13 = (c, t) => { const [x, y] = OV._cb || [540, 900]; clipboard(c, x, y + 40, clamp(1.05 - t * 0.12, 0.6, 1.05) * 0.8, seg(t, 0.9, 1.6)); };
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
function stamp(c, text, x, y, rot, k, col = '#e0262e', size = 1) {
  if (k <= 0) return; const s = size * (1 + 1.4 * Math.pow(1 - Math.min(1, k * 1.6), 2)); c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha = Math.min(1, k * 3);
  c.lineJoin = 'round'; c.font = '900 150px Mont'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(text).width + 70;
  c.strokeStyle = col; c.lineWidth = 16; c.beginPath(); c.roundRect(-w / 2, -95, w, 190, 24); c.stroke(); c.fillStyle = col; c.fillText(text, 0, 8);
  c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 70; i++) { c.globalAlpha = 0.5; c.beginPath(); c.arc(((i * 97) % w) - w / 2, ((i * 53) % 180) - 90, 3 + (i % 4), 0, 6.3); c.fill(); }
  c.restore();
}
const OV = {};   // OV[shotId] = (ctx, localTime) => draw 2D on top of the 3D frame
const XF = 0.085;   // half-length of the cross-dissolve (s): ~5 frames in total
function renderShot(i, t) { const s = SHOTS[i], end = i < SHOTS.length - 1 ? SHOTS[i + 1].at : DUR; s.draw(t - s.at, end - s.at, t); }
function draw(t) {
  t = clamp(t, 0, DUR - 1e-4); ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.globalAlpha = 1;
  let i = SHOTS.length - 1; while (i > 0 && SHOTS[i].at > t) i--;
  renderShot(i, t); ctx.drawImage(GL, 0, 0, W, H);
  const nx = SHOTS[i + 1], pv = i > 0 ? SHOTS[i] : null;
  if (nx && nx.at - t < XF) { renderShot(i + 1, t); ctx.globalAlpha = 0.5 * (1 - (nx.at - t) / XF); ctx.drawImage(GL, 0, 0, W, H); ctx.globalAlpha = 1; }
  else if (pv && t - pv.at < XF) { renderShot(i - 1, t); ctx.globalAlpha = 0.5 * (1 - (t - pv.at) / XF); ctx.drawImage(GL, 0, 0, W, H); ctx.globalAlpha = 1; }
  if (OV[SHOTS[i].id]) OV[SHOTS[i].id](ctx, t - SHOTS[i].at, t);   // optional 2D overlay per shot (stamps, labels)
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
