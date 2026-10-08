import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import { BIG, C, CAPS, Cam, DURATION_S, GEO1, LIT, MID, MS, P, toScreen } from './cam';
import { ArcArrow, BLUE, FONT, RED, glow } from './fx';

const img = (f: string) => staticFile(f);

// ---------------------------------------------------------------- captions
export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.5;
  if (i < 0 || t > end) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = (i === 0 ? 1 : ramp(t, t0, t0 + 0.1, linear)) * (1 - ramp(t, t1 - 0.02, t1, linear));
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1500, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.25,
      color: '#fff', opacity: a, transform: `translateY(${(1 - ramp(t, t0, t0 + 0.14)) * 8}px)`,
      textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.45)' }}>{text}</div>
  );
};

/** Big kinetic label with 3D perspective: sweeps in from depth, settles, tilted like the reference. */
const Tilt: React.FC<{ text: string; t: number; t0: number; t1: number; x: number; y: number; size: number; rx?: number; rz?: number; color?: string; stroke?: string }> = ({
  text, t, t0, t1, x, y, size, rx = 28, rz = -10, color = '#fff', stroke,
}) => {
  const a = window4(t, t0, t0 + 0.12, t1 - 0.25, t1);
  if (a <= 0) return null;
  const s = pop(t, t0, 12, 170);
  const z = lerp(-900, 0, clamp01(s));
  const blur = Math.max(0, (1 - clamp01((t - t0) / 0.25)) * 8);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, perspective: 900 }}>
      <div style={{ position: 'absolute', transform: `translate(-50%,-50%) rotateX(${rx}deg) rotateZ(${rz}deg) translateZ(${z}px) scale(${0.6 + 0.4 * clamp01(s)})`,
        fontFamily: FONT, fontWeight: 900, fontSize: size, color, whiteSpace: 'nowrap', opacity: a, filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        WebkitTextStroke: stroke, paintOrder: 'stroke fill', textShadow: '0 8px 24px rgba(0,0,0,0.55)' }}>{text}</div>
    </div>
  );
};

// ---------------------------------------------------------------- iris wipe (reference 5.0 s)
const Iris: React.FC<{ t: number }> = ({ t }) => {
  const close = ramp(t, C.four - 0.15, C.four + 0.3, easeIn);
  const open = ramp(t, C.four + 0.3, C.four + 0.85, easeOut);
  if (close <= 0 || open >= 1) return null;
  const r = close < 1 ? lerp(1250, 0, close) : lerp(0, 1250, open);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 540px 900px, rgba(0,0,0,0) ${r}px, rgba(0,0,0,0.85) ${r + 30}px, #000 ${r + 60}px)` }} />
  );
};

// ---------------------------------------------------------------- split screen: RUSSIA | USA along the border
const Split: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const a = window4(t, C.d38 + 0.95, C.d38 + 1.15, C.little - 0.05, C.little + 0.25);
  if (a <= 0) return null;
  const bx = toScreen(c, [(GEO1.gapA[0] + GEO1.gapB[0]) / 2, MID[1]])[0];
  const push = ramp(t, C.d38 + 0.95, C.little + 0.25, linear);
  const sR = pop(t, C.d38 + 1.0, 11, 190);
  const sU = pop(t, C.d38 + 1.15, 11, 190);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: bx, height: 1920, background: 'rgba(170,70,40,0.42)', mixBlendMode: 'multiply' }} />
      <div style={{ position: 'absolute', left: bx, top: 0, right: 0, height: 1920, background: 'rgba(40,90,220,0.42)', mixBlendMode: 'multiply' }} />
      <div style={{ position: 'absolute', left: bx - 3, top: 0, width: 6, height: 1920, backgroundImage: 'repeating-linear-gradient(180deg, #fff 0 22px, transparent 22px 38px)' }} />
      <div style={{ position: 'absolute', right: 1080 - bx + 30, top: 560, transform: `scale(${(0.8 + 0.25 * push) * sR})`, transformOrigin: '100% 50%',
        fontFamily: FONT, fontWeight: 900, fontSize: 120, color: '#fff', textShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>रशिया</div>
      <div style={{ position: 'absolute', left: bx + 30, top: 560, transform: `scale(${(0.8 + 0.25 * push) * sU})`, transformOrigin: '0% 50%',
        fontFamily: FONT, fontWeight: 900, fontSize: 120, color: '#fff', textShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>अमेरिका</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the real village (USCG photo, public domain)
export const villageCover = (t: number) => window4(t, C.gaon - 0.2, C.gaon + 0.05, C.bada - 0.25, C.bada);
const Village: React.FC<{ t: number }> = ({ t }) => {
  const a = villageCover(t);
  if (a <= 0) return null;
  const p = ramp(t, C.gaon - 0.2, C.bada, linear);
  const zoomIn = 1 + 0.5 * (1 - ramp(t, C.gaon - 0.2, C.gaon + 0.35, easeOut));
  const s = (1.0 + 0.12 * p) * zoomIn;
  const pinS = pop(t, C.gaon + 0.15, 10, 200);
  const chipS = pop(t, C.eighty - 0.35, 10, 210);
  const n = Math.round(80 * ramp(t, C.eighty - 0.35, C.eighty + 0.25, easeOut));
  return (
    <AbsoluteFill style={{ opacity: a, background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${s}) translate(${-30 * p}px, 0)` }}>
        <Img src={img('diomede/v2/img/village_uscg_2008.jpg')} style={{ width: 1080, height: 1920, objectFit: 'cover', objectPosition: '42% 50%', filter: 'contrast(1.06) saturate(1.05)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 180px 60px rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'absolute', left: 540, top: 700, width: 0, height: 0 }}>
        <div style={{ position: 'absolute', transform: `translate(-50%,-100%) scale(${pinS})`, transformOrigin: '50% 100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 78, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.85)' }}>डायोमीडी गाँव</div>
          <svg width={40} height={150}><path d="M20 0 L20 120" stroke="#fff" strokeWidth={6} /><path d="M6 110 L20 140 L34 110 Z" fill="#fff" /></svg>
          {chipS > 0.01 && (
            <div style={{ transform: `scale(${chipS})`, display: 'flex', alignItems: 'center', gap: 12, background: '#111', border: '4px solid #FFD21F', borderRadius: 16, padding: '6px 22px 10px' }}>
              <svg width={44} height={44} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4.5" fill="#FFD21F" /><path d="M3 22 Q12 11 21 22 Z" fill="#FFD21F" /></svg>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#FFD21F', fontVariantNumeric: 'tabular-nums' }}>{n}</div>
            </div>
          )}
        </div>
      </div>
      <div style={{ position: 'absolute', right: 20, bottom: 14, fontFamily: 'sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>Photo: U.S. Coast Guard, PO Richard Brahm (2008), public domain</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 1867 stamp
const Stamp: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.y1867 - 0.05, C.y1867 + 0.05, C.sardi - 0.2, C.sardi + 0.2);
  if (a <= 0) return null;
  const slam = ramp(t, C.y1867 - 0.05, C.y1867 + 0.14, easeIn);
  const s = lerp(2.6, 1, slam);
  return (
    <div style={{ position: 'absolute', left: 540, top: 330, width: 0, height: 0, opacity: a }}>
      <div style={{ position: 'absolute', transform: `translate(-50%,-50%) rotate(-8deg) scale(${s})`, width: 560, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Img src={img('darien/img/stamp_ink_frame.png')} style={{ position: 'absolute', inset: 0, width: 560, height: 260, objectFit: 'fill', filter: 'hue-rotate(0deg) saturate(1.4)' }} />
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 170, color: '#E8283C', letterSpacing: 6, opacity: 0.92, mixBlendMode: 'screen' }}>1867</div>
      </div>
      {t > C.kharida && (
        <div style={{ position: 'absolute', left: 0, top: 190, transform: `translate(-50%,0) scale(${pop(t, C.kharida + 0.1, 10, 210)})`, fontFamily: FONT, fontWeight: 900, fontSize: 64,
          color: '#fff', background: BLUE, padding: '4px 26px 10px', borderRadius: 14, whiteSpace: 'nowrap', boxShadow: '0 8px 18px rgba(0,0,0,0.45)' }}>अलास्का → अमेरिका</div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- snow
const Snow: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.sardi - 0.1, C.sardi + 0.6, C.beech + 0.2, C.beech + 0.8);
  if (a <= 0) return null;
  const flakes = Array.from({ length: 70 }, (_, i) => {
    const sp = 90 + ((i * 37) % 60);
    const x = ((i * 157.3) % 1080) + Math.sin(t * 1.3 + i) * 24;
    const y = (((i * 263.7) % 1920) + t * sp) % 1960 - 20;
    const r = 2 + ((i * 7) % 5);
    return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.55 + ((i * 13) % 4) * 0.1} />;
  });
  return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a, filter: 'blur(0.6px)' }}>{flakes}</svg>;
};

// ---------------------------------------------------------------- time travel: day labels, the jump, the sticker
const DayTag: React.FC<{ day: string; time: string; s: number; pulse?: number; color: string }> = ({ day, time, s, pulse = 0, color }) => (
  <div style={{ transform: `scale(${s * (1 + 0.15 * pulse)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: FONT, color: '#fff',
    textShadow: '0 3px 10px rgba(0,0,0,0.85)' }}>
    <div style={{ fontWeight: 900, fontSize: 70, lineHeight: 1.05 }}>{day}</div>
    <div style={{ fontWeight: 700, fontSize: 46, padding: '2px 18px 6px', background: color, borderRadius: 12, marginTop: 6, textShadow: 'none' }}>{time}</div>
  </div>
);

const TimeTravel: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const a = window4(t, C.yaani + 0.3, C.yaani + 0.5, 99, 100);
  if (a <= 0) return null;
  const lit = toScreen(c, [LIT[0], LIT[1] + 3500 * MS]);
  const big = toScreen(c, [BIG[0], BIG[1] + 6500 * MS]);
  const sUS = pop(t, Math.max(C.usa4, C.yaani + 0.35), 10, 200);
  const sRU = pop(t, C.rus4, 10, 200);
  const jump = ramp(t, C.gaye - 0.1, C.gaye + 0.6, inOut);
  const kalP = window4(t, C.kal, C.kal + 0.12, C.kal + 0.3, C.kal + 0.7);
  const stk = pop(t, C.time - 0.1, 9, 170);
  const from: P = [lit[0], lit[1] + 70];
  const to: P = [big[0], big[1] + 70];
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: lit[0], top: lit[1] - 170, transform: 'translate(-50%,-100%)' }}>
        <DayTag day="रविवार" time="दोपहर 3:00" s={sUS} color={BLUE} />
      </div>
      <div style={{ position: 'absolute', left: big[0], top: big[1] - 170, transform: 'translate(-50%,-100%)' }}>
        <DayTag day="सोमवार" time="दोपहर 12:00" s={sRU} pulse={kalP} color={RED} />
        {t > C.kal && (
          <div style={{ position: 'absolute', left: '50%', top: -90, transform: `translateX(-50%) scale(${pop(t, C.kal, 9, 230)}) rotate(-8deg)`, fontFamily: FONT, fontWeight: 900,
            fontSize: 58, color: '#111', background: '#FFD21F', padding: '0 20px 6px', borderRadius: 10, whiteSpace: 'nowrap' }}>कल!</div>
        )}
      </div>
      <ArcArrow a={from} b={to} p={jump} bulge={260} />
      {stk > 0.01 && (
        <div style={{ position: 'absolute', left: (from[0] + to[0]) / 2, top: Math.max(from[1], to[1]) + 230, transform: `translate(-50%,-50%) scale(${stk}) rotate(${-6 + 4 * Math.sin(t * 3)}deg)` }}>
          <Img src={img('sentinel/img/emoji_wave_smile.png')} style={{ width: 330, filter: 'drop-shadow(0 0 0 #fff) drop-shadow(0 14px 18px rgba(0,0,0,0.5))' }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- flashes + vignette
export const ScreenFX: React.FC<{ t: number }> = ({ t }) => {
  const cuts = [C.dono, C.gaon - 0.15, C.bada - 0.1, C.jamkar];
  let flash = 0;
  for (const c of cuts) flash = Math.max(flash, window4(t, c - 0.05, c, c + 0.04, c + 0.22));
  return (
    <>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)' }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff', opacity: flash * 0.75 }} />}
    </>
  );
};

export const shake = (t: number): [number, number] => {
  const hits: [number, number][] = [[C.rus + 0.75, 5], [C.jud, 6], [C.y1867 + 0.14, 9], [C.kharida + 0.2, 4], [C.jamkar, 5], [C.gaye + 0.5, 4]];
  let x = 0;
  let y = 0;
  for (const [t0, a] of hits) {
    x += kick(t, t0, a, 38, 9);
    y += kick(t, t0, a * 0.8, 31, 9);
  }
  return [x, y];
};

export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => (
  <>
    <Tilt text="4 किमी" t={t} t0={C.four + 0.55} t1={C.kaise + 0.3} x={560} y={470} size={190} rx={30} rz={-8} />
    <Tilt text="बेरिंग स्ट्रेट" t={t} t0={C.bering - 0.05} t1={C.zoom + 0.5} x={540} y={720} size={120} rx={32} rz={-12} />
    <Split t={t} c={c} />
    <Stamp t={t} />
    <Snow t={t} />
    {window4(t, C.h21 - 0.1, C.h21 + 0.05, C.yaani + 0.2, C.yaani + 0.5) > 0 && (
      <div style={{ position: 'absolute', left: 540, top: 1260, transform: `translate(-50%,-50%) scale(${pop(t, C.h21 - 0.05, 10, 200)})`,
        opacity: window4(t, C.h21 - 0.1, C.h21 + 0.05, C.yaani + 0.2, C.yaani + 0.5), fontFamily: FONT, fontWeight: 900, fontSize: 96, color: '#111',
        background: '#fff', padding: '4px 34px 12px', borderRadius: 18, boxShadow: '0 10px 24px rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>21 घंटे का फ़र्क</div>
    )}
    <TimeTravel t={t} c={c} />
    <Village t={t} />
    <Iris t={t} />
  </>
);

export { easeIn, easeOut, glow };
