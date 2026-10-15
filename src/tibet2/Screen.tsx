import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, PLANE, toScreen } from './cam';
import { HEAD, NUM, SUB } from './fonts';
import { AROUND, COL, alongPx, l888Draw, routePx } from './Plane';
import { Rig, has } from './Rig';

const STROKE = (w: number, col = '#120a02') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';

/** Kinetic headline. */
const Big: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; size?: number; color?: string; font?: string; rot?: number }> = ({ t, t0, t1, text, x, y, size = 110, color = '#fff', font = HEAD, rot = -3 }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 260)) + kick(t, t0 + 0.12, 0.06, 24, 9);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.1, textShadow: `${SHADOW}, 0 0 34px ${color}55`, ...STROKE(size > 150 ? 12 : 9) }}>{text}</div>
  );
};
/** A chip: a small boxed line of text. */
const Chip: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; size?: number; rot?: number }> = ({ t, t0, t1, text, x, y, color, size = 52, rot = -2 }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 8, 260));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 800, fontSize: size,
      color: '#fff', background: 'rgba(8,16,26,0.78)', border: `5px solid ${color}`, borderRadius: 16, padding: '6px 26px 0', boxShadow: `${SHADOW}, 0 0 24px ${color}66` }}>{text}</div>
  );
};
/** A callout tag with a pin line (reference style: a bold red tag on the zone). */
const Tag: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; pin?: P; size?: number }> = ({ t, t0, t1, text, x, y, color, pin, size = 56 }) => {
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const out = ramp(t, t1, t1 + 0.25, easeIn);
  const line = ramp(t, t0 - 0.05, t0 + 0.2, easeOut) * (1 - out);
  const s = clamp01(pop(t, t0 + 0.1, 8, 260)) * (1 - out);
  return (
    <>
      {pin && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <line x1={pin[0]} y1={pin[1]} x2={lerp(pin[0], x, line)} y2={lerp(pin[1], y, line)} stroke="#fff" strokeWidth={4} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.7))' }} />
          <circle cx={pin[0]} cy={pin[1]} r={10 * line} fill="#fff" />
        </svg>
      )}
      {s > 0.01 && (
        <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s}) rotate(-2deg)`, whiteSpace: 'nowrap', background: color, color: '#fff', padding: '8px 26px 4px',
          borderRadius: 14, border: '4px solid #fff', fontFamily: HEAD, fontWeight: 800, fontSize: size, boxShadow: `0 10px 24px rgba(0,0,0,0.55), 0 0 22px ${color}aa`, lineHeight: 1.15 }}>{text}</div>
      )}
    </>
  );
};
const Counter: React.FC<{ t: number; t0: number; t1: number; to: number; x: number; y: number; size?: number; color?: string; post?: string; dur?: number }> = ({ t, t0, t1, to, x, y, size = 170, color = COL.gold, post = '', dur = 0.8 }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.2, t1);
  if (a <= 0) return null;
  const v = Math.round(lerp(0, to, ramp(t, t0, t0 + dur, easeOut)));
  const s = clamp01(pop(t, t0, 10, 240)) * (1 + kick(t, t0 + dur, 0.08, 26, 9));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, textAlign: 'center', whiteSpace: 'nowrap',
      fontFamily: NUM, fontSize: size, color, lineHeight: 1, letterSpacing: 2, textShadow: `${SHADOW}, 0 0 30px ${color}66`, ...STROKE(8) }}>{v.toLocaleString('en-IN')}{post}</div>
  );
};

/** The top-view airliner (UE5) at a plane-pixel position, heading in degrees (0 = north/up). */
const TopPlane: React.FC<{ x: number; y: number; hdg: number; size: number; a?: number; shake?: number }> = ({ x, y, hdg, size, a = 1, shake = 0 }) => (
  <div style={{ position: 'absolute', left: x - size / 2 + shake, top: y - size / 2, width: size, height: size, opacity: a, transform: `rotate(${hdg}deg)`, filter: 'drop-shadow(0 16px 12px rgba(0,0,0,0.5))' }}>
    <img src={staticFile('tibet2/img/t2/plane_top.png')} style={{ width: size, height: (size * 1742) / 1800 }} />
  </div>
);

/** Weather over the plateau: drifting storm clouds (screen-blended UE5 render), code-drawn snow and wind streaks. */
const Weather: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.mausam7 - 0.3, C.mausam7 + 0.2, C.utarna8 - 0.2, C.utarna8 + 0.4);
  if (a <= 0) return null;
  const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); };
  const dt = t - C.mausam7;
  const wind = window4(t, C.hawayen7 - 0.2, C.hawayen7, C.utarna8, C.utarna8 + 0.4);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a, pointerEvents: 'none' }}>
      {has('t2/storm') && [[180, 760, 620, 0], [760, 640, 700, 1], [480, 980, 560, 2]].map(([x, y, s, i]) => (
        <img key={i} src={staticFile('tibet2/img/t2/storm.jpg')} style={{ position: 'absolute', left: x - s / 2 + dt * (24 + i * 10), top: y - s / 2 + Math.sin(t * 0.8 + i) * 12, width: s, height: s,
          mixBlendMode: 'screen', opacity: 0.85, transform: `rotate(${dt * (6 + i * 3)}deg)` }} />
      ))}
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {wind > 0 && Array.from({ length: 14 }, (_, i) => {
          const y = 520 + rnd(i) * 900, len = 260 + rnd(i + 5) * 260, sp = 900 + rnd(i + 9) * 700;
          const x = ((dt * sp + rnd(i + 3) * 2000) % 2200) - 600;
          return <path key={i} d={`M${x},${y} q${len / 2},${-30 - rnd(i + 2) * 40} ${len},0`} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.55 * wind} />;
        })}
        {Array.from({ length: 140 }, (_, i) => {
          const sp = 160 + rnd(i) * 260;
          const x = ((rnd(i + 1) * 1300 + dt * sp * 0.8) % 1300) - 110;
          const y = ((rnd(i + 2) * 2100 + dt * sp) % 2100) - 90;
          const r = 2 + rnd(i + 3) * 4.5;
          return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.5 + rnd(i + 4) * 0.4} />;
        })}
      </svg>
    </div>
  );
};

const S = (c: Cam, at: P) => toScreen(c, at);
/** Plane-pixel → screen (for things positioned with project()). */
const planeToScreen = (c: Cam, x: number, y: number): [number, number] => {
  const dx = x - PLANE.ox, dy = y - PLANE.oy, r = (c.rot * Math.PI) / 180;
  return [540 + dx * Math.cos(r) - dy * Math.sin(r), 960 + dx * Math.sin(r) + dy * Math.cos(r)];
};

export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const tib = S(c, GEO.places.tibet_c);
  // the hook plane: follows a route toward the zone, then veers south around it
  const hookU = ramp(t, C.plane1 - 0.6, C.jagah1 + 1.6, inOut);
  const [hx, hy, hh] = routePx(c, AROUND, hookU);
  const [hsx, hsy] = planeToScreen(c, hx, hy);
  const hookA = window4(t, C.plane1 - 0.6, C.plane1 - 0.3, C.kyu1, C.ye2);
  // the weather plane: crosses the plateau, shaking in the turbulence
  const wU = ramp(t, C.hawayen7 - 0.3, C.utarna8 + 0.3, linear);
  const wx = lerp(-150, 1250, wU), wy = 900 + Math.sin(wU * 6) * 40;
  const wShake = window4(t, C.jhatke7 - 0.1, C.jhatke7, C.aasmaan7, C.utarna8) * (kick(t, C.jhatke7, 26, 28, 3) + Math.sin(t * 45) * 6);
  // the L888 plane
  const lU = ramp(t, C.l888 + 0.4, DURATION_S, linear);
  const [lx, ly, lh] = alongPx(c, GEO.l888, lU);
  const [lsx, lsy] = planeToScreen(c, lx, ly);
  const lA = window4(t, C.l888 + 0.3, C.l888 + 0.6, 998, 999) * clamp01(l888Draw(t) * 3 - 2);
  const l888Tag = alongPx(c, GEO.l888, 0.55);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* hook: picture first, then the words */}
      <Big t={t} t0={0.3} t1={C.khaali1 + 0.8} text="FLIGHT MAP" x={540} y={300} size={120} color={COL.radar} font={NUM} rot={-2} />
      <Tag t={t} t0={C.khaali1} t1={C.ye2} text="खाली क्यों?" x={560} y={470} color={COL.red} pin={tib} />
      <Chip t={t} t0={C.india1} t1={C.plane1} text="INDIA के ठीक ऊपर" x={540} y={1440} color={COL.gold} size={50} />
      {hookA > 0 && has('t2/plane_top') && <TopPlane x={hsx} y={hsy} hdg={hh + c.rot} size={300} a={hookA} />}
      <Big t={t} t0={C.gadbad1} t1={C.kyu1} text="⚠ EMERGENCY?" x={540} y={1470} size={84} color={COL.red} font={NUM} rot={0} />
      <Big t={t} t0={C.kyu1 - 0.05} t1={C.ye2 + 0.2} text="क्यों?" x={540} y={330} size={170} color="#fff" rot={3} />

      {/* the plateau */}
      <Tag t={t} t0={C.tibet2} t1={C.france2 - 0.1} text="TIBET का पठार" x={540} y={420} color={COL.red} pin={tib} size={64} />
      <Big t={t} t0={C.chaar2} t1={C.duniya2} text="FRANCE × 4+" x={540} y={330} size={130} color={COL.france} font={NUM} rot={-2} />
      <Chip t={t} t0={C.duniya2} t1={C.zameen3 + 0.4} text="दुनिया का सबसे ऊँचा पठार" x={540} y={330} color={COL.gold} size={54} />
      <Big t={t} t0={C.zameen3 + 0.4} t1={C.everest3 - 0.2} text="HIMALAYA" x={540} y={320} size={130} color="#ffffff" font={NUM} rot={0} />

      {/* the 3D section's words */}
      <Big t={t} t0={C.socho4} t1={C.n10000 - 0.1} text="सोचो…" x={540} y={300} size={110} color="#fff" />
      <Big t={t} t0={C.achanak4} t1={C.oxygen4 - 0.3} text="PRESSURE ↓" x={540} y={300} size={120} color={COL.red} font={NUM} rot={0} />
      <Big t={t} t0={C.minute4 - 0.2} t1={C.pilot5 - 0.2} text="बस कुछ ही मिनट!" x={540} y={330} size={104} color="#fff" rot={-2} />
      <Big t={t} t0={C.par6} t1={C.jagah6 + 0.1} text="पर Tibet में?" x={540} y={300} size={110} color={COL.gold} />
      <Big t={t} t0={C.jagah6} t1={C.mausam7 - 0.2} text="जगह ही नहीं!" x={540} y={300} size={124} color={COL.red} rot={2} />

      {/* weather */}
      <Weather t={t} />
      {has('t2/plane_top') && window4(t, C.hawayen7 - 0.3, C.hawayen7, C.utarna8, C.utarna8 + 0.3) > 0 && (
        <TopPlane x={wx} y={wy} hdg={92 + Math.sin(t * 9) * 6} size={280} a={window4(t, C.hawayen7 - 0.3, C.hawayen7, C.utarna8, C.utarna8 + 0.3)} shake={wShake} />
      )}
      <Chip t={t} t0={C.hawayen7} t1={C.jhatke7} text="तेज़ हवाएँ" x={540} y={330} color={COL.cyan} />
      <Chip t={t} t0={C.jhatke7} t1={C.aasmaan7} text="अचानक झटके" x={540} y={330} color={COL.red} rot={2} />
      <Chip t={t} t0={C.aasmaan7} t1={C.utarna8} text="पल-पल बदलता आसमान" x={540} y={330} color={COL.glow} size={50} />

      {/* the few airports */}
      <Rig set="t2" parts={[{ name: 'airport', box: [0, 0, 1] }]} x={540} y={1260} h={420} t={t} t0={C.airports8 - 0.1} t1={C.par9} entry="rise" />
      <Big t={t} t0={C.airports8} t1={C.par9} text="AIRPORTS गिनती के!" x={540} y={330} size={92} color="#ff6b6b" font={HEAD} rot={-2} />

      {/* L888 */}
      <Big t={t} t0={C.band9 - 0.1} t1={C.raasta9} text="पर रास्ता बंद नहीं!" x={540} y={330} size={96} color={COL.gold} />
      {(() => { const [x, y] = planeToScreen(c, l888Tag[0], l888Tag[1]); return <Tag t={t} t0={C.l888} t1={C.aap10 + 0.2} text="L888" x={x + 10} y={y - 190} color="#c8920a" pin={[x, y]} size={76} />; })()}
      {lA > 0 && has('t2/plane_top') && <TopPlane x={lsx} y={lsy} hdg={lh + c.rot} size={230} a={lA} />}
      <Chip t={t} t0={C.planes9 - 1.6} t1={C.aap10} text="सिर्फ़ खास तैयारी + इजाज़त" x={540} y={1440} color={COL.gold} size={46} rot={0} />
    </AbsoluteFill>
  );
};

/** The split screen's top half: हाँ / ना. */
export const YesNo: React.FC<{ t: number }> = ({ t }) => {
  const b = (txt: string, col: string, d: number, x: number) => {
    const s = clamp01(pop(t, C.haan10 + d, 8, 260)) * (1 + 0.04 * Math.sin(t * 6 + d * 9));
    if (t < C.haan10 + d) return null;
    return <div style={{ position: 'absolute', left: x, top: 650, transform: `translate(-50%,-50%) scale(${s})`, fontFamily: HEAD, fontWeight: 800, fontSize: 96, color: '#fff', background: col,
      border: '6px solid #fff', borderRadius: 28, padding: '6px 54px 0', boxShadow: `${SHADOW}, 0 0 30px ${col}` }}>{txt}</div>;
  };
  return (
    <>
      <Chip t={t} t0={C.pilot10} t1={DURATION_S + 1} text="आप Pilot होते तो?" x={540} y={250} color={COL.gold} size={62} rot={-2} />
      {b('हाँ', '#1fa45a', 0, 330)}{b('ना', '#d23a3a', 0.3, 750)}
    </>
  );
};

/** Whip transitions on the big moves. */
const WHIPS = () => [C.ye2 - 0.2, C.duniya2 - 0.3, C.oxygen4 - 0.25, C.pilot5 - 0.25, C.mausam7 - 0.3, C.airports8 - 0.2, C.par9 - 0.1];
export const Whips: React.FC<{ t: number }> = ({ t }) => (
  <>
    {WHIPS().map((w, i) => {
      const p = ramp(t, w, w + 0.32, linear);
      if (p <= 0 || p >= 1) return null;
      const dir = i % 2 ? -1 : 1;
      return (
        <AbsoluteFill key={i} style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: Math.sin(p * Math.PI) * 0.8,
          background: `linear-gradient(${dir > 0 ? 100 : 80}deg, rgba(255,255,255,0) ${lerp(-40, 100, p) - 25}%, rgba(255,240,200,0.9) ${lerp(-40, 100, p)}%, rgba(255,255,255,0) ${lerp(-40, 100, p) + 25}%)` }} />
      );
    })}
  </>
);

/** Section grades. The flight map: cool and dark with gold. The plateau: teal shadows, warm-red highlights. The sky: crisp cold blue.
 *  The emergency: a red pulse. The storm: grey-blue. L888: warm gold. Highlight roll-off, vignette and film grain on top. */
export const Grade: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const emergency = window4(t, C.achanak4 - 0.05, C.achanak4 + 0.1, C.pilot5 - 0.3, C.pilot5);
  const storm = window4(t, C.mausam7 - 0.3, C.mausam7 + 0.3, C.utarna8, C.utarna8 + 0.5);
  const gold = ramp(t, C.raasta9 - 0.3, C.l888 + 0.5);
  let flash = 0;
  for (const h of [C.khaali1, C.tibet2, C.achanak4, C.jagah6, C.jhatke7, C.l888]) flash = Math.max(flash, window4(t, h - 0.02, h, h + 0.04, h + 0.3));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,70,95,0.24), rgba(0,40,60,0.08) 40%, rgba(255,150,60,0.08) 70%, rgba(255,140,40,0.14))', mixBlendMode: 'soft-light' }} />
      {emergency > 0 && <AbsoluteFill style={{ background: '#ff1a1a', opacity: emergency * (0.12 + 0.12 * Math.abs(Math.sin(t * 6))), mixBlendMode: 'screen' }} />}
      {storm > 0 && <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0e2340, #2b4a6e)', opacity: storm * 0.38, mixBlendMode: 'multiply' }} />}
      {gold > 0 && <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(255,190,90,0.3), rgba(255,140,40,0.18))', opacity: gold, mixBlendMode: 'soft-light' }} />}
      <AbsoluteFill style={{ background: 'rgba(250,236,214,1)', opacity: 0.06, mixBlendMode: 'multiply' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.45), rgba(0,0,0,0) 24%, rgba(0,0,0,0) 70%, rgba(0,6,12,0.55))' }} />
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: 'overlay', backgroundImage: GRAIN, backgroundSize: '256px 256px', backgroundPosition: `${(frame * 73) % 256}px ${(frame * 151) % 256}px` }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.35, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='256' height='256' filter='url(%23n)'/></svg>")`;

/** Subtitles: Mukta ExtraBold, karaoke (the spoken word lights green), English and numbers in gold. Hidden on frame 0. */
const HOT = /^[0-9,~₹]+|^[A-Za-z]/;
export const Subtitles: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.3;
  if (i < 0 || t < 0.2 || t > end) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = ramp(t, t0, t0 + 0.08, linear) * (1 - ramp(t, t1 - 0.02, t1, linear));
  if (a <= 0) return null;
  const s = lerp(0.86, 1, clamp01(pop(t, t0, 12, 260)));
  const words = text.split(' ');
  const len = words.map((w) => Math.max(1, w.replace(/[…।,?!:.]/g, '').length));
  const tot = len.reduce((x, y) => x + y, 0);
  const span = Math.max(0.3, Math.min(t1, t0 + tot * 0.075) - t0);
  let acc = 0, cur = words.length - 1;
  for (let q = 0; q < words.length; q++) { acc += len[q]; if (t < t0 + (span * acc) / tot) { cur = q; break; } }
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: SUB, fontWeight: 800, fontSize: 58, lineHeight: 1.22,
      color: '#fff', opacity: a, transform: `scale(${s})`, textShadow: '0 4px 0 rgba(0,0,0,0.4), 0 6px 18px rgba(0,0,0,0.7)', ...STROKE(9, '#000') }}>
      {words.map((w, q) => (
        <span key={q} style={{ color: q === cur ? '#7CFF6B' : HOT.test(w) ? COL.gold : '#fff', display: 'inline-block', transform: `scale(${q === cur ? 1.08 : 1})` }}>{w}&nbsp;</span>
      ))}
    </div>
  );
};

export { inOut };
