import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, graphemes, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import sizes from '../../public/coochbehar/img_sizes.json';
import { C, CAPS, Cam, DAHALA, DURATION_S, GEO, P, pxPerM, toScreen } from './cam';
import { COND, HEAD, NUM, SUB } from './fonts';
import { COL, RINGS } from './Plane';

const SZ = sizes as unknown as Record<string, [number, number]>;
const img = (n: string) => staticFile(`coochbehar/img/${n}.png`);
const STROKE = (w: number, col = '#120a02') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';

// ---------------------------------------------------------------- building blocks
/** A miniature at a screen point (bottom-centre anchor): springs in, breathes, can glide along a path, pops out. */
const Actor: React.FC<{
  t: number; t0: number; t1: number; pose: string; x: number; y: number; h: number; flip?: boolean; bob?: number; sway?: number;
  path?: { t0: number; t1: number; x: number; y: number; arc?: number }; shadow?: boolean; rot?: number; glow?: string; drop?: boolean; fadeIn?: number;
}> = ({ t, t0, t1, pose, x, y, h, flip, bob = 4, sway = 0, path, shadow = true, rot = 0, glow, drop = true, fadeIn }) => {
  if (t < t0 - 0.02 || t > t1 + 0.35) return null;
  const s = fadeIn ? 1 : pop(t, t0, 10, 200);
  const fa = fadeIn ? ramp(t, t0, t0 + fadeIn, linear) : 1;
  const out = ramp(t, t1, t1 + 0.3, easeIn);
  const land = fadeIn ? 0 : kick(t, t0 + 0.16, 0.1, 26, 10);
  let px = x, py = y;
  if (path) {
    const q = ramp(t, path.t0, path.t1, inOut);
    px = lerp(x, path.x, q);
    py = lerp(y, path.y, q) - Math.sin(q * Math.PI) * (path.arc ?? 0);
  }
  const [iw, ih] = SZ[pose] ?? [1024, 1024];
  const w = (h * iw) / ih;
  const sc = Math.max(0, s) * (fadeIn ? 1 - out * 0.1 : 1 - out);
  if (sc <= 0.01) return null;
  const breathe = Math.sin((t - t0) * 2.4) * bob;
  const rock = sway ? Math.sin((t - t0) * 2.1) * sway : 0;
  return (
    <div style={{ position: 'absolute', left: px, top: py, width: 0, height: 0, opacity: fa * (fadeIn ? 1 - out : 1) }}>
      {shadow && (
        <div style={{ position: 'absolute', left: -w * 0.34, top: -h * 0.045, width: w * 0.68, height: h * 0.09, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))', transform: `scale(${Math.min(1, sc)})` }} />
      )}
      <div style={{ position: 'absolute', left: -w / 2, top: -h, width: w, height: h, transformOrigin: '50% 100%',
        transform: `translateY(${-(drop && !fadeIn ? (1 - clamp01(s)) * 90 : 0)}px) rotate(${rot + rock}deg) scale(${sc * (1 - land) * (flip ? -1 : 1)}, ${sc * (1 + land) + breathe / h})`,
        filter: `${glow ? `drop-shadow(0 0 18px ${glow}) ` : ''}drop-shadow(0 10px 12px rgba(0,0,0,0.55))` }}>
        <img src={img(pose)} style={{ width: w, height: h, display: 'block' }} />
      </div>
    </div>
  );
};

/** A place tag: bold pill on a stem, pinned to a screen point. */
const Tag: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; size?: number; sub?: string; rot?: number; latin?: boolean; up?: number; ink?: string }> = ({
  t, t0, t1, text, x, y, color, size = 60, sub, rot = -3, latin, up = 80, ink = '#140c03',
}) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = pop(t, t0, 9, 240) * (1 - ramp(t, t1, t1 + 0.25, easeIn));
  if (s <= 0.01) return null;
  const stem = ramp(t, t0, t0 + 0.2, easeOut) * up;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <svg width={10} height={up + 10} style={{ position: 'absolute', left: -5, top: -stem, overflow: 'visible' }}>
        <line x1={5} y1={0} x2={5} y2={stem} stroke="#fff" strokeWidth={3} />
        <circle cx={5} cy={stem} r={8} fill="#fff" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div style={{ position: 'absolute', left: 0, top: -stem, transform: `translate(-50%,-100%) rotate(${rot}deg) scale(${s})`, transformOrigin: '50% 100%', textAlign: 'center' }}>
        <div style={{ whiteSpace: 'nowrap', background: `linear-gradient(180deg, ${color}, ${color}dd)`, color: ink, padding: latin ? '8px 26px 2px' : '4px 24px 0', borderRadius: 14,
          fontFamily: latin ? NUM : HEAD, fontWeight: 800, fontSize: size, letterSpacing: latin ? 1.5 : 0, boxShadow: SHADOW, border: '4px solid #140c03', lineHeight: 1.15 }}>{text}</div>
        {sub && <div style={{ marginTop: 8, fontFamily: HEAD, fontWeight: 700, fontSize: size * 0.5, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.95)', whiteSpace: 'nowrap' }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Kinetic text: letters rise in one by one (grapheme-safe), stroked, with a soft drop. */
const Kin: React.FC<{ text: string; t: number; t0: number; t1: number; x: number; y: number; size?: number; color?: string; font?: string; stroke?: number; box?: string; rot?: number; gap?: number }> = ({
  text, t, t0, t1, x, y, size = 72, color = '#fff', font = HEAD, stroke = 8, box, rot = 0, gap = 0.028,
}) => {
  const a = window4(t, t0, t0 + 0.08, t1 - 0.2, t1);
  if (a <= 0) return null;
  const g = graphemes(text);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, opacity: a, textAlign: 'center' }}>
      <div style={{ whiteSpace: 'nowrap', fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.15, textShadow: SHADOW, ...STROKE(stroke),
        ...(box ? { background: box, padding: '6px 28px 2px', borderRadius: 18, boxShadow: SHADOW, transform: `scale(${clamp01(pop(t, t0, 11, 220))})` } : {}) }}>
        {g.map((ch, i) => {
          const p = clamp01(pop(t, t0 + i * gap, 12, 230));
          return <span key={i} style={{ display: 'inline-block', opacity: clamp01(p * 1.5), transform: `translateY(${(1 - p) * 34}px) scale(${lerp(0.6, 1, p)})` }}>{ch === ' ' ? ' ' : ch}</span>;
        })}
      </div>
    </div>
  );
};

/** A slammed stamp with a gold frame. */
const Stamp: React.FC<{ t: number; t0: number; t1: number; children: React.ReactNode; x: number; y: number; rot?: number; color?: string }> = ({ t, t0, t1, children, x, y, rot = -5, color = COL.gold }) => {
  const a = window4(t, t0, t0 + 0.02, t1 - 0.2, t1);
  if (a <= 0) return null;
  const s = ramp(t, t0, t0 + 0.13, easeIn);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.4, 1, s) + kick(t, t0 + 0.13, 0.07, 30, 10)})`, opacity: a * (0.6 + 0.4 * s),
      padding: '10px 36px 6px', border: `10px solid ${color}`, borderRadius: 22, background: 'rgba(14,8,2,0.84)', boxShadow: `0 12px 34px rgba(0,0,0,0.55), 0 0 40px ${color}55`, whiteSpace: 'nowrap', textAlign: 'center' }}>{children}</div>
  );
};

/** A rolling counter (Anton numerals). */
const Counter: React.FC<{ t: number; t0: number; t1: number; to: number; x: number; y: number; size?: number; color?: string; pre?: string; post?: string; dur?: number; sub?: string }> = ({
  t, t0, t1, to, x, y, size = 150, color = COL.gold, pre = '', post = '', dur = 0.7, sub,
}) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.2, t1);
  if (a <= 0) return null;
  const v = Math.round(to * ramp(t, t0, t0 + dur, easeOut));
  const s = clamp01(pop(t, t0, 10, 240));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s * (1 + kick(t, t0 + dur, 0.08, 26, 9))})`, opacity: a, textAlign: 'center' }}>
      <div style={{ fontFamily: NUM, fontSize: size, color, lineHeight: 1, letterSpacing: 2, textShadow: `${SHADOW}, 0 0 30px ${color}66`, ...STROKE(7) }}>{pre}{v.toLocaleString('en-IN')}{post}</div>
      {sub && <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: size * 0.36, color: '#fff', marginTop: 4, textShadow: SHADOW, ...STROKE(5) }}>{sub}</div>}
    </div>
  );
};

/** A big red X drawn over something (two strokes). */
const Cross: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; r?: number }> = ({ t, t0, t1, x, y, r = 120 }) => {
  const a = window4(t, t0, t0 + 0.02, t1 - 0.2, t1);
  if (a <= 0) return null;
  const p1 = ramp(t, t0, t0 + 0.14, easeOut), p2 = ramp(t, t0 + 0.1, t0 + 0.24, easeOut);
  return (
    <svg width={r * 2.4} height={r * 2.4} style={{ position: 'absolute', left: x - r * 1.2, top: y - r * 1.2, overflow: 'visible', opacity: a }}>
      {[[0.2, 0.2, 2.2, 2.2, p1], [2.2, 0.2, 0.2, 2.2, p2]].map(([x0, y0, x1, y1, p], i) => (
        <line key={i} x1={x0 * r} y1={y0 * r} x2={lerp(x0, x1, p) * r} y2={lerp(y0, y1, p) * r} stroke={COL.red} strokeWidth={r * 0.22} strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 10px rgba(255,60,60,0.8)) drop-shadow(0 6px 6px rgba(0,0,0,0.5))' }} />
      ))}
    </svg>
  );
};

/** Black-background overlays from the asset pack, added with screen blending. */
const Overlay: React.FC<{ name: string; a: number; x: number; y: number; w: number; rot?: number; sc?: number }> = ({ name, a, x, y, w, rot = 0, sc = 1 }) => {
  if (a <= 0.001 || !SZ[name]) return null;
  const [iw, ih] = SZ[name];
  const h = (w * ih) / iw;
  return <img src={img(name)} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, mixBlendMode: 'screen', transform: `rotate(${rot}deg) scale(${sc})` }} />;
};

// ---------------------------------------------------------------- set pieces
/** Frame 0: the question, bold. */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const a = 1 - ramp(t, C.raat2 - 0.15, C.raat2 + 0.15, linear);
  if (a <= 0) return null;
  const n = Math.round(111 * ramp(t, C.n111 - 0.15, C.n111 + 0.45, easeOut));
  const k = kick(t, C.n111 + 0.45, 0.1, 26, 8);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 210, opacity: a, textAlign: 'center', lineHeight: 1.08 }}>
      <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 72, color: '#fff', textShadow: SHADOW, ...STROKE(9) }}>क्या आप जानते हैं?</div>
      <div style={{ marginTop: 8, transform: `scale(${1 + k})` }}>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 112, color: '#fff', textShadow: SHADOW, ...STROKE(10) }}>भारत के </span>
        <span style={{ fontFamily: NUM, fontSize: 150, color: COL.saffron, textShadow: `${SHADOW}, 0 0 34px ${COL.saffron}88`, ...STROKE(9) }}>{t < C.n111 - 0.15 ? 111 : n}</span>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 112, color: '#fff', textShadow: SHADOW, ...STROKE(10) }}> गाँव</span>
      </div>
      <div style={{ marginTop: 4, opacity: t < C.bd1 - 0.1 ? 0.0 : 1, transform: `scale(${t < C.bd1 - 0.1 ? 0.6 : clamp01(pop(t, C.bd1 - 0.1, 10, 230))})` }}>
        <span style={{ fontFamily: NUM, fontSize: 104, color: COL.green, letterSpacing: 1, textShadow: `${SHADOW}, 0 0 30px ${COL.green}77`, ...STROKE(8) }}>BANGLADESH</span>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 96, color: '#fff', textShadow: SHADOW, ...STROKE(9) }}> के अंदर?</span>
      </div>
    </div>
  );
};

/** "ज़मीन तुम्हारी, पर देश चुन लो।" as a cinematic quote card. */
const Quote: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.zameen15 - 0.15, t1 = C.n1000 - 0.1;
  const a = window4(t, t0, t0 + 0.25, t1 - 0.25, t1);
  if (a <= 0) return null;
  const s = lerp(0.92, 1.0, ramp(t, t0, t1, linear));
  const w2 = clamp01(pop(t, C.desh15 - 0.25, 11, 220));
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(8,5,2,0.55), rgba(0,0,0,0.85))' }} />
      <div style={{ position: 'absolute', left: 70, right: 70, top: 640, textAlign: 'center', transform: `scale(${s})` }}>
        <div style={{ fontFamily: NUM, fontSize: 190, color: COL.gold, lineHeight: 0.6, opacity: 0.9 }}>“</div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 110, color: '#fff', lineHeight: 1.15, textShadow: SHADOW }}>ज़मीन तुम्हारी,</div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 110, color: COL.gold, lineHeight: 1.15, textShadow: `${SHADOW}, 0 0 30px ${COL.gold}66`, opacity: w2, transform: `translateY(${(1 - w2) * 30}px)` }}>पर देश चुन लो।</div>
      </div>
    </AbsoluteFill>
  );
};

/** End card: घर या देश? Two buttons light up as they're said. */
const Question: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.sach17 + 0.6;
  if (t < t0) return null;
  const s = clamp01(pop(t, t0, 11, 190));
  const btn = (label: string, at: number, bg: string, ink: string) => {
    const p = clamp01(pop(t, at - 0.12, 10, 230));
    const hi = window4(t, at, at + 0.1, at + 0.6, at + 0.9);
    return (
      <div style={{ padding: '8px 46px 0', borderRadius: 30, background: bg, border: '6px solid #fff', transform: `scale(${p * (1 + hi * 0.1)})`, opacity: p,
        boxShadow: `0 12px 24px rgba(0,0,0,0.55), 0 0 ${40 * hi}px rgba(255,216,74,0.95)`, fontFamily: HEAD, fontWeight: 800, fontSize: 92, color: ink, whiteSpace: 'nowrap' }}>{label}</div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: s }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', transform: `scale(${lerp(0.85, 1, s)})` }}>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 84, color: '#fff', textShadow: SHADOW, ...STROKE(9) }}>आप किसे चुनेंगे?</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 430, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34 }}>
        {btn('घर', C.ghar17, 'linear-gradient(180deg,#ffe6b0,#f0b45a)', '#2a1606')}
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: '#fff', textShadow: SHADOW, ...STROKE(6), opacity: clamp01(pop(t, C.ghar17 + 0.2, 10, 230)) }}>या</div>
        {btn('देश', C.desh17, 'linear-gradient(180deg,#FF9933 0%,#FF9933 33%,#ffffff 33%,#ffffff 66%,#138808 66%)', '#0b2a8a')}
      </div>
    </AbsoluteFill>
  );
};

/** Labels sit on top of each Dahala ring. */
const ringSide = (c: Cam, r: number, side: 1 | -1): P => {
  const [x, y] = toScreen(c, DAHALA);
  const R = r * pxPerM(c);
  return [Math.min(900, Math.max(180, x + side * R * 0.75)), y - R * 0.7];
};

// ---------------------------------------------------------------- the screen layer
export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const at = (k: string) => toScreen(c, GEO.places[k]);
  const cb = at('coochbehar'), dh = toScreen(c, DAHALA), rp = at('rangpur');
  const walk0 = toScreen(c, GEO.walk[0]), walk3 = toScreen(c, GEO.walk[3]);
  const [r1x, r1y] = ringSide(c, RINGS[0].r, 1), [r2x, r2y] = ringSide(c, RINGS[1].r, -1);
  return (
    <AbsoluteFill>
      {/* ---- the hook */}
      <Hook t={t} />
      <Actor t={t} t0={C.n111 + 0.1} t1={C.raat2 - 0.1} pose="village" x={540} y={1460} h={360} bob={2} />
      <Actor t={t} t0={C.raat2 - 0.05} t1={C.jaage2 + 0.1} pose="hut_night" x={540} y={1330} h={560} fadeIn={0.3} bob={1} glow="rgba(140,180,255,0.35)" />
      <Actor t={t} t0={C.jaage2 - 0.1} t1={C.kahani3 - 0.1} pose="hut_dawn" x={540} y={1330} h={560} fadeIn={0.45} bob={1} glow="rgba(255,200,120,0.4)" />
      <Kin text="सोए एक देश में…" t={t} t0={C.soye2 - 0.1} t1={C.kyon2 - 0.1} x={540} y={330} size={92} color={COL.saffron} />
      <Kin text="जागे दूसरे में!" t={t} t0={C.jaage2 - 0.1} t1={C.kyon2 - 0.1} x={540} y={460} size={92} color={COL.green} />
      <Stamp t={t} t0={C.kyon2 - 0.05} t1={C.kahani3 + 0.1} x={540} y={420} rot={-4}>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 120, color: '#fff' }}>पर क्यों?</span>
      </Stamp>

      {/* ---- Cooch Behar, 162 pieces */}
      <Tag t={t} t0={C.cooch3 - 0.05} t1={C.n162 - 0.15} text="COOCH BEHAR" x={cb[0]} y={cb[1]} color={COL.gold} latin size={58} sub="West Bengal" up={110} />
      <Kin text="बॉर्डर = सीधी लकीर?" t={t} t0={C.border3 - 0.1} t1={C.n162 - 0.1} x={540} y={360} size={76} />
      <Cross t={t} t0={C.lakeer3 + 0.35} t1={C.n162 - 0.1} x={540} y={360} r={70} />
      <Counter t={t} t0={C.n162 - 0.1} t1={C.dahala4 - 0.2} to={162} x={540} y={380} size={190} sub="टुकड़े" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center', gap: 22, opacity: window4(t, C.n162 + 0.3, C.n162 + 0.5, C.dahala4 - 0.4, C.dahala4 - 0.2) }}>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 50, color: '#fff', background: COL.saffron, borderRadius: 12, padding: '2px 18px 0', border: '3px solid #140c03' }}>भारत के 111</span>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 50, color: '#fff', background: COL.deepGreen, borderRadius: 12, padding: '2px 18px 0', border: '3px solid #140c03' }}>Bangladesh के 51</span>
      </div>

      {/* ---- Dahala Khagrabari */}
      <Kin text="सबसे अनोखा…" t={t} t0={C.anokha4 - 0.1} t1={C.dahala4 + 0.3} x={540} y={380} size={86} color={COL.gold} />
      <Tag t={t} t0={C.dahala4 + 0.1} t1={C.charon5 - 0.2} text="DAHALA KHAGRABARI" x={dh[0]} y={dh[1] - 70} color={COL.saffron} latin size={50} up={120} />
      <Actor t={t} t0={C.khet5 - 0.15} t1={C.charon5 + 0.2} pose="jute_field" x={dh[0]} y={dh[1] + 150} h={280} glow="rgba(255,159,28,0.6)" />
      <Kin text="भारत का एक खेत" t={t} t0={C.khet5 + 0.1} t1={C.charon5 - 0.1} x={540} y={360} size={84} color={COL.saffron} />
      <Kin text="चारों तरफ़ BANGLADESH" t={t} t0={C.charon5 - 0.05} t1={C.bdi6 - 0.05} x={540} y={360} size={78} color={COL.green} />
      <Tag t={t} t0={C.bdi6 - 0.05} t1={C.bharat6 - 0.1} text="BANGLADESH" x={r2x} y={r2y} color={COL.green} latin size={44} sub="का टुकड़ा" up={60} />
      <Tag t={t} t0={C.bharat6 - 0.05} t1={C.poore6 - 0.1} text="भारत" x={r1x} y={r1y} color={COL.saffron} size={60} sub="का टुकड़ा" up={70} rot={3} />
      <Kin text="पूरे BANGLADESH के बीच!" t={t} t0={C.poore6 - 0.05} t1={C.yaani7 - 0.05} x={540} y={360} size={74} color={COL.green} />
      {/* यानी… the nesting as chips */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: window4(t, C.yaani7 - 0.1, C.yaani7 + 0.1, C.duniya7 - 0.1, C.duniya7 + 0.1) }}>
        {([['भारत', COL.saffron, C.yaani7], ['⊃', '', C.yaani7 + 0.2], ['BD', COL.green, C.doosra7 - 0.1], ['⊃', '', C.doosra7 + 0.3], ['भारत', COL.saffron, C.pehla7 - 0.1]] as [string, string, number][]).map(([s, col, t0], i) => {
          const p = clamp01(pop(t, t0, 10, 240));
          return col
            ? <span key={i} style={{ fontFamily: s === 'BD' ? NUM : HEAD, fontWeight: 800, fontSize: 62, color: '#fff', background: col, borderRadius: 14, padding: s === 'BD' ? '6px 20px 0' : '2px 20px 0', border: '4px solid #140c03', transform: `scale(${p})`, boxShadow: SHADOW }}>{s}</span>
            : <span key={i} style={{ fontFamily: NUM, fontSize: 64, color: '#fff', transform: `scale(${p})`, textShadow: SHADOW }}>{s}</span>;
        })}
      </div>
      <Stamp t={t} t0={C.duniya7 - 0.05} t1={C.chakra7 + 0.05} x={540} y={400} rot={-4}>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 70, color: '#fff' }}>दुनिया में सिर्फ </span>
        <span style={{ fontFamily: NUM, fontSize: 110, color: COL.gold }}>1</span>
      </Stamp>
      <Kin text="चक्रव्यूह!" t={t} t0={C.chakra7 - 0.05} t1={C.kehte8 + 0.1} x={540} y={400} size={140} color={COL.gold} stroke={10} />

      {/* ---- the legend */}
      <Tag t={t} t0={C.kehte8 + 0.4} t1={C.y1947} text="लोककथा" x={170} y={330} color="#E7D3A8" size={44} up={0} rot={-6} />
      <Actor t={t} t0={C.kehte8 + 0.1} t1={C.y1947 - 0.1} pose="chess_kings" x={540} y={1540} h={430} glow="rgba(255,210,120,0.35)" />
      <Tag t={t} t0={C.raja8 - 0.05} t1={C.y1947 - 0.1} text="Cooch Behar के राजा" x={cb[0]} y={cb[1]} color={COL.saffron} size={46} up={90} />
      <Tag t={t} t0={C.raja8 + 0.25} t1={C.y1947 - 0.1} text="Mughal (Rangpur)" x={rp[0]} y={rp[1]} color={COL.green} size={46} up={60} rot={3} />
      <Kin text="गाँव दाँव पर!" t={t} t0={C.daanv8 - 0.1} t1={C.y1947 - 0.1} x={540} y={420} size={96} color={COL.gold} />

      {/* ---- 1947 */}
      <Stamp t={t} t0={C.y1947 - 0.05} t1={C.sochiye10 - 0.1} x={540} y={380} rot={-5} color={COL.red}>
        <div style={{ fontFamily: NUM, fontSize: 140, color: '#fff', lineHeight: 1 }}>1947</div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 60, color: COL.red, lineHeight: 1.2 }}>बँटवारा</div>
      </Stamp>
      <Actor t={t} t0={C.batware9} t1={C.sochiye10 - 0.1} pose="fence" x={540} y={1480} h={300} />
      <Kin text="वहीं फँस गए" t={t} t0={C.phans9 - 0.1} t1={C.sochiye10 - 0.1} x={540} y={640} size={80} color={COL.red} />

      {/* ---- 68 years */}
      <Actor t={t} t0={C.sochiye10 - 0.1} t1={C.bharat11 - 0.1} pose="family" x={540} y={1470} h={560} />
      <Counter t={t} t0={C.n68 - 0.1} t1={C.pehchan10 - 0.05} to={68} x={300} y={420} size={170} post="" sub="साल" />
      <Counter t={t} t0={C.n51k - 0.1} t1={C.pehchan10 - 0.05} to={51000} x={760} y={420} size={130} color={COL.white} sub="लोग" dur={0.9} />
      <Actor t={t} t0={C.pehchan10 - 0.1} t1={C.bharat11 - 0.15} pose="id_card" x={540} y={760} h={360} rot={-6} glow="rgba(255,80,80,0.5)" />
      <Kin text="पहचान: कोई नहीं" t={t} t0={C.pehchan10 + 0.05} t1={C.bharat11 - 0.1} x={540} y={300} size={80} color={COL.red} />
      <Actor t={t} t0={C.bharat11 - 0.15} t1={C.bachche12 - 0.1} pose="office_door" x={290} y={1300} h={430} />
      <Actor t={t} t0={C.bd11 - 0.25} t1={C.bachche12 - 0.1} pose="office_door" x={790} y={1300} h={430} flip />
      <Tag t={t} t0={C.bharat11 - 0.05} t1={C.bachche12 - 0.1} text="भारत सरकार" x={290} y={780} color={COL.saffron} size={46} up={0} />
      <Tag t={t} t0={C.bd11 - 0.15} t1={C.bachche12 - 0.1} text="Bangladesh सरकार" x={790} y={780} color={COL.green} size={42} up={0} rot={3} />
      <Cross t={t} t0={C.sarkar11 + 0.3} t1={C.bachche12 - 0.1} x={290} y={1060} r={110} />
      <Cross t={t} t0={C.bd11 + 0.4} t1={C.bachche12 - 0.1} x={790} y={1060} r={110} />
      <Actor t={t} t0={C.bachche12 - 0.1} t1={C.bukhar12 - 0.1} pose="school_gate" x={540} y={1450} h={480} />
      <Kin text="न SCHOOL" t={t} t0={C.school12 - 0.05} t1={C.bukhar12 - 0.1} x={540} y={380} size={100} color="#fff" />
      <Cross t={t} t0={C.school12 + 0.35} t1={C.bukhar12 - 0.1} x={540} y={380} r={80} />
      <Actor t={t} t0={C.bukhar12 - 0.1} t1={C.sarhad12} pose="medicine" x={540} y={1300} h={300} glow="rgba(255,255,255,0.5)" />
      <Kin text="एक बुखार की दवा…" t={t} t0={C.bukhar12} t1={C.sarhad12 - 0.05} x={540} y={380} size={84} />
      <Actor t={t} t0={C.sarhad12 - 0.5} t1={C.phir13 - 0.1} pose="mother_child" x={walk0[0] - 40} y={walk0[1] + 40} h={300} shadow={false} drop={false} bob={6}
        path={{ t0: C.sarhad12 - 0.5, t1: C.jaan12 + 1.2, x: walk3[0] - 40, y: walk3[1] + 40 }} />
      <Kin text="जान जोखिम में" t={t} t0={C.jaan12 - 0.05} t1={C.phir13 - 0.05} x={540} y={380} size={92} color={COL.red} />

      {/* ---- 31 July 2015 */}
      <Actor t={t} t0={C.phir13 - 0.05} t1={C.itihas13 + 0.1} pose="clock" x={540} y={1380} h={420} glow="rgba(255,216,74,0.5)" />
      <Stamp t={t} t0={C.n31 - 0.05} t1={C.parivar14 - 0.1} x={540} y={400} rot={-3}>
        <div style={{ fontFamily: NUM, fontSize: 112, color: '#fff', lineHeight: 1.05, letterSpacing: 2 }}>31 JULY 2015</div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 58, color: COL.gold, lineHeight: 1.2, opacity: clamp01(pop(t, C.aadhi13 - 0.1, 10, 230)) }}>आधी रात · 12:00</div>
      </Stamp>
      <Kin text="इतिहास बदला" t={t} t0={C.itihas13 - 0.05} t1={C.nakshe13} x={540} y={640} size={84} color={COL.gold} />
      <Kin text="नक्शे बदले" t={t} t0={C.nakshe13 - 0.05} t1={C.parivar14 - 0.1} x={540} y={640} size={84} color={COL.gold} />
      <Actor t={t} t0={C.parivar14 - 0.1} t1={C.zameen15 - 0.1} pose="candles_crowd" x={540} y={1480} h={500} glow="rgba(255,190,90,0.45)" />
      <Kin text="सबसे मुश्किल सवाल" t={t} t0={C.mushkil14 - 0.1} t1={C.zameen15 - 0.1} x={540} y={400} size={84} color="#fff" />
      <Quote t={t} />

      {/* ---- the choice */}
      <Counter t={t} t0={C.n1000 - 0.1} t1={C.sach17 - 0.1} to={1000} pre="~" x={540} y={400} size={180} color={COL.saffron} sub="लोगों ने भारत चुना" />
      <Actor t={t} t0={C.mitti16 - 0.2} t1={C.sach17 - 0.05} pose="old_home_key" x={300} y={1420} h={380} fadeIn={0.4} />
      <Actor t={t} t0={C.n1000 - 0.05} t1={C.sach17 - 0.05} pose="family_leaving" x={560} y={1500} h={330}
        path={{ t0: C.n1000, t1: C.sach17, x: 760, y: 1480 }} />
      <Kin text="तिरंगे को चुना" t={t} t0={C.tirange16 - 0.05} t1={C.mitti16 - 0.1} x={540} y={640} size={84} color="#fff" />

      {/* ---- the question */}
      <Actor t={t} t0={C.sach17 - 0.05} t1={DURATION_S + 1} pose="old_home_key" x={540} y={1360} h={520} fadeIn={0.35} />
      <Question t={t} />

      {/* overlays on top of props */}
      <Overlay name="overlay_mist" a={window4(t, C.raat2 - 0.2, C.raat2 + 0.3, C.kahani3 - 0.2, C.kahani3 + 0.2) * 0.7 + window4(t, C.sochiye10, C.sochiye10 + 0.5, C.phir13 - 0.2, C.phir13) * 0.22}
        x={540} y={1780} w={1800} />
      <Overlay name="overlay_candlelight" a={window4(t, C.parivar14 - 0.2, C.parivar14 + 0.4, C.n1000 - 0.2, C.n1000 + 0.2) * 0.85} x={540} y={1100} w={1500} sc={1 + 0.05 * Math.sin(t)} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- frame-level
export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.n111 + 0.45, 8], [C.kyon2, 10], [C.n162, 9], [C.duniya7, 8], [C.chakra7, 9], [C.y1947, 12], [C.phans9, 6],
    [C.pehchan10 + 0.05, 6], [C.n31, 10], [C.itihas13, 12], [C.desh15, 6], [C.n1000 + 0.6, 8], [C.desh17, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

/** Scene-by-scene colour: like a Lumetri look per section, plus bloom flashes on the big hits. */
export const Grade: React.FC<{ t: number; night: number; past: number; cold: number }> = ({ t, night, past, cold }) => {
  const flash = Math.max(
    window4(t, C.itihas13 - 0.03, C.itihas13, C.itihas13 + 0.06, C.itihas13 + 0.5) * 0.7,
    window4(t, C.y1947 - 0.02, C.y1947, C.y1947 + 0.04, C.y1947 + 0.3) * 0.45,
    window4(t, C.tirange16 - 0.03, C.tirange16, C.tirange16 + 0.05, C.tirange16 + 0.4) * 0.4,
  );
  const heart = C.jaan12 < t && t < C.phir13 ? Math.max(0, Math.sin((t - C.jaan12) * 7.5)) ** 6 * 0.35 : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* teal shadows / warm highlights split-tone */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,60,80,0.20), rgba(0,40,60,0.08) 40%, rgba(255,150,60,0.06) 70%, rgba(255,140,40,0.12))', mixBlendMode: 'soft-light' }} />
      {/* night: deep blue */}
      {night > 0 && <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0a1a44, #10224a)', opacity: night * 0.42, mixBlendMode: 'multiply' }} />}
      {night > 0 && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 70% 12%, rgba(170,200,255,0.35), rgba(0,0,0,0) 45%)', opacity: night, mixBlendMode: 'screen' }} />}
      {/* the past: warm parchment */}
      {past > 0 && <AbsoluteFill style={{ background: '#7a5528', opacity: past * 0.32, mixBlendMode: 'color' }} />}
      {/* 68 years: cold, drained */}
      {cold > 0 && <AbsoluteFill style={{ background: '#2a3a48', opacity: cold * 0.28, mixBlendMode: 'color' }} />}
      {/* vignette, and a top/bottom gradient so text and captions always read */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.45), rgba(0,0,0,0) 24%, rgba(0,0,0,0) 70%, rgba(0,6,12,0.6))' }} />
      {heart > 0 && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(200,0,0,0.9) 100%)', opacity: heart }} />}
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.55, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

/** Subtitles: Mukta ExtraBold with a heavy outline; numbers and English names pop in gold. */
const HOT = /^[0-9,~]+|^[A-Za-z]/;
export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.4;
  const quote = window4(t, C.zameen15 - 0.15, C.zameen15 + 0.1, C.n1000 - 0.35, C.n1000 - 0.1);
  if (i < 0 || t < C.raat2 - 0.1 || t > end || t > C.sach17 + 0.5) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = (i === 0 ? 1 : ramp(t, t0, t0 + 0.08, linear)) * (1 - ramp(t, t1 - 0.02, t1, linear)) * (1 - quote);
  if (a <= 0) return null;
  const s = i === 0 ? 1 : lerp(0.86, 1, clamp01(pop(t, t0, 12, 260)));
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 1580, textAlign: 'center', fontFamily: SUB, fontWeight: 800, fontSize: 60, lineHeight: 1.22,
      color: '#fff', opacity: a, transform: `scale(${s})`, textShadow: '0 4px 0 rgba(0,0,0,0.4), 0 6px 18px rgba(0,0,0,0.7)', ...STROKE(9, '#000') }}>
      {text.split(' ').map((w, k) => (
        <span key={k} style={{ color: HOT.test(w) ? COL.gold : '#fff' }}>{w}{' '}</span>
      ))}
    </div>
  );
};

export { COND, easeIn, easeOut, inOut, linear };
