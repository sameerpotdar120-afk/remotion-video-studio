import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import sizes from '../../public/kalpasar/img_sizes.json';
import { C, CAPS, Cam, DURATION_S, GEO, P, merc, toScreen } from './cam';
import { HEAD, NUM, SUB } from './fonts';
import { COL, along } from './Plane';

const SZ = sizes as unknown as Record<string, [number, number]>;
const img = (n: string) => staticFile(`kalpasar/img/${n}.png`);
const STROKE = (w: number, col = '#120a02') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';

/** A prop image centred on a screen point; springs in, can turn. Skipped until the asset exists. */
const Prop: React.FC<{ name: string; x: number; y: number; h: number; t: number; t0: number; t1: number; rot?: number; flip?: boolean; glow?: string; blend?: boolean; drop?: boolean }> = ({
  name, x, y, h, t, t0, t1, rot = 0, flip, glow, blend, drop = true,
}) => {
  if (!SZ[name] || t < t0 - 0.02 || t > t1 + 0.35) return null;
  const s = clamp01(pop(t, t0, 8, 220)) * (1 - ramp(t, t1, t1 + 0.3, easeIn));
  if (s <= 0.01) return null;
  const [iw, ih] = SZ[name];
  const w = (h * iw) / ih;
  const bob = Math.sin((t - t0) * 2.2) * 6;
  const dy = drop ? (1 - clamp01(pop(t, t0, 10, 200))) * -120 : 0;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2 + bob + dy, width: w, height: h, opacity: blend ? s : 1, transform: `rotate(${rot}deg) scale(${blend ? 1 : s * (flip ? -1 : 1)}, ${blend ? 1 : s})`,
      mixBlendMode: blend ? 'screen' : undefined, filter: blend ? undefined : `${glow ? `drop-shadow(0 0 22px ${glow}) ` : ''}drop-shadow(0 14px 14px rgba(0,0,0,0.55))` }}>
      <img src={img(name)} style={{ width: w, height: h, display: 'block' }} />
    </div>
  );
};

/** A callout: a pin ring on the place, a thin line, and a white-outlined name box (reference style). */
const Label: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; pin?: P }> = ({ t, t0, t1, text, x, y, color, pin }) => {
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const out = ramp(t, t1, t1 + 0.25, easeIn);
  const line = ramp(t, t0 - 0.05, t0 + 0.2, easeOut) * (1 - out);
  const s = clamp01(pop(t, t0 + 0.12, 8, 260)) * (1 - out);
  const ring = clamp01(pop(t, t0 - 0.05, 9, 260)) * (1 - out);
  return (
    <>
      {pin && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <line x1={pin[0]} y1={pin[1]} x2={lerp(pin[0], x, line)} y2={lerp(pin[1], y, line)} stroke="#fff" strokeWidth={4} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.7))' }} />
          <circle cx={pin[0]} cy={pin[1]} r={20 * ring} fill="none" stroke="#fff" strokeWidth={5} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
          <circle cx={pin[0]} cy={pin[1]} r={8 * ring} fill="#fff" />
        </svg>
      )}
      {s > 0.01 && (
        <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, whiteSpace: 'nowrap', background: 'rgba(8,16,26,0.62)', color: '#fff',
          padding: '8px 24px 2px 20px', borderRadius: 10, border: '4px solid #fff', fontFamily: NUM, fontSize: 50, letterSpacing: 1.5, boxShadow: `0 8px 22px rgba(0,0,0,0.55), 0 0 18px ${color}66`,
          lineHeight: 1.15, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: color, display: 'inline-block', marginTop: -6, boxShadow: `0 0 10px ${color}` }} />{text}
        </div>
      )}
    </>
  );
};

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

/** A rolling counter (Anton numerals). */
const Counter: React.FC<{ t: number; t0: number; t1: number; to: number; x: number; y: number; size?: number; color?: string; pre?: string; post?: string; dur?: number; from?: number }> = ({
  t, t0, t1, to, x, y, size = 170, color = COL.gold, pre = '', post = '', dur = 0.8, from = 0,
}) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.2, t1);
  if (a <= 0) return null;
  const v = Math.round(lerp(from, to, ramp(t, t0, t0 + dur, easeOut)));
  const s = clamp01(pop(t, t0, 10, 240)) * (1 + kick(t, t0 + dur, 0.08, 26, 9));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, textAlign: 'center', whiteSpace: 'nowrap',
      fontFamily: NUM, fontSize: size, color, lineHeight: 1, letterSpacing: 2, textShadow: `${SHADOW}, 0 0 30px ${color}66`, ...STROKE(8) }}>{pre}{v.toLocaleString('en-IN')}{post}</div>
  );
};

/** The tide ruler: a measuring pole by the wall, the water racing up past 10 M. */
const TideRuler: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.jwaar13 - 0.1, C.jwaar13 + 0.1, C.zameen13 - 0.1, C.zameen13 + 0.2);
  if (a <= 0) return null;
  const lvl = ramp(t, C.jwaar13, C.n10m + 0.6, easeOut) + 0.03 * Math.sin(t * 7);
  const H = 900, x = 880, y0 = 1500;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: a }}>
      <div style={{ position: 'absolute', left: x - 24, top: y0 - H, width: 48, height: H, background: 'repeating-linear-gradient(180deg, #fff 0 45px, #E0262B 45px 90px)', border: '5px solid #111', borderRadius: 8, boxShadow: SHADOW }} />
      <div style={{ position: 'absolute', left: x - 70, top: y0 - H * lvl, width: 140, height: H * lvl, background: 'linear-gradient(180deg, rgba(120,220,255,0.85), rgba(20,90,160,0.85))', borderTop: '6px solid #E8FDFF', borderRadius: 6 }} />
      <div style={{ position: 'absolute', left: x - 330, top: y0 - H * 0.92 - 40, fontFamily: NUM, fontSize: 96, color: '#E8FDFF', ...STROKE(7), textShadow: SHADOW, opacity: clamp01(lvl * 1.3 - 0.3) }}>10 M+</div>
    </div>
  );
};

/** The closing buttons: हाँ / ना. */
const Buttons: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.haan17 - 0.1, C.haan17, 999, 1000);
  if (a <= 0) return null;
  const b = (txt: string, col: string, d: number, x: number) => {
    const s = clamp01(pop(t, C.haan17 + d, 8, 260)) * (1 + 0.04 * Math.sin(t * 6 + d * 9));
    return <div style={{ position: 'absolute', left: x, top: 640, transform: `translate(-50%,-50%) scale(${s})`, fontFamily: HEAD, fontWeight: 800, fontSize: 96, color: '#fff', background: col,
      border: '6px solid #fff', borderRadius: 28, padding: '6px 54px 0', boxShadow: `${SHADOW}, 0 0 30px ${col}` }}>{txt}</div>;
  };
  return <>{b('हाँ', '#1fa45a', 0, 330)}{b('ना', '#d23a3a', 0.25, 750)}</>;
};

const S = (c: Cam, at: P) => toScreen(c, at);

export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const pl = GEO.places;
  const sau = S(c, merc(70.85, 21.7));
  const riverMid = (n: string) => S(c, along(GEO.rivers[n], 0.75));
  const [bx, by] = S(c, pl.bhavnagar), [rx, ry] = S(c, pl.bharuch), [sx, sy] = S(c, pl.surat);
  const damMid = S(c, along(GEO.dam, 0.5));
  const mouth = S(c, GEO.rivers.mahi[GEO.rivers.mahi.length - 1]);
  const lakeC = S(c, merc(72.45, 22.05));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* hook: picture first, then three words */}
      <Big t={t} t0={0} t1={C.kyu1 - 0.1} text="60 KM दीवार?" x={540} y={330} size={150} color={COL.gold} />
      <Big t={t} t0={C.kyu1 - 0.05} t1={C.socho2 + 0.2} text="क्यों?" x={540} y={360} size={170} color="#fff" rot={3} />

      {/* the farmer in Saurashtra */}
      <Label t={t} t0={C.saurashtra2} t1={C.baarish3} text="SAURASHTRA" x={sau[0] + 40} y={Math.max(220, sau[1] - 420)} color={COL.gold} pin={sau} />
      <Prop name="farmer_stand" x={540} y={1150} h={760} t={t} t0={C.socho2 + 0.2} t1={C.baarish3 - 0.1} />
      <Prop name="farmer_worried" x={600} y={1180} h={700} t={t} t0={C.baarish3} t1={C.door4 - 0.1} />
      <Prop name="well_dry" x={250} y={1300} h={360} t={t} t0={C.kuen3} t1={C.door4 - 0.1} />
      <Big t={t} t0={C.baarish3} t1={C.kuen3} text="बारिश कम" x={540} y={330} size={120} color={COL.sand} />
      <Big t={t} t0={C.kuen3} t1={C.khaara3} text="कुएँ सूखे" x={540} y={330} size={120} color={COL.sand} rot={2} />
      <Big t={t} t0={C.khaara3} t1={C.khet3} text="खारा पानी" x={540} y={330} size={120} color="#fff" />
      <Big t={t} t0={C.pyaase3} t1={C.badi4} text="प्यासे खेत" x={540} y={330} size={120} color={COL.red} rot={-2} />

      {/* the rivers and the gulf */}
      <Label t={t} t0={C.gulf5} t1={C.hazaron5} text="GULF OF KHAMBHAT" x={540} y={1450} color={COL.fresh} pin={S(c, pl.gulf)} />
      <Label t={t} t0={C.mahi5} t1={C.hazaron5} text="MAHI" x={riverMid('mahi')[0] + 120} y={riverMid('mahi')[1] - 140} color={COL.fresh} pin={riverMid('mahi')} />
      <Label t={t} t0={C.sabarmati5} t1={C.hazaron5} text="SABARMATI" x={riverMid('sabarmati')[0] - 60} y={riverMid('sabarmati')[1] - 170} color={COL.fresh} pin={riverMid('sabarmati')} />
      <Label t={t} t0={C.dhadhar5} t1={C.hazaron5} text="DHADHAR" x={riverMid('dhadhar')[0] + 80} y={riverMid('dhadhar')[1] + 150} color={COL.fresh} pin={riverMid('dhadhar')} />
      <Chip t={t} t0={C.hazaron5} t1={C.khaare5} text="हज़ारों करोड़ लीटर मीठा पानी" x={540} y={330} color={COL.fresh} size={58} />
      <Prop name="fx_splash" x={mouth[0]} y={mouth[1] + 60} h={420} t={t} t0={C.khaare5} t1={C.tabhi6} blend drop={false} />
      <Big t={t} t0={C.baha5} t1={C.tabhi6} text="बेकार!" x={540} y={330} size={140} color={COL.salt} rot={3} />

      {/* Kalpasar: the wall */}
      <Big t={t} t0={C.kalpasar7} t1={C.bhavnagar8} text="KALPASAR" x={540} y={330} size={170} color={COL.gold} font={NUM} rot={0} />
      <Label t={t} t0={C.bhavnagar8} t1={C.bharti9} text="BHAVNAGAR" x={bx - 60} y={by + 260} color={COL.gold} pin={[bx, by]} />
      <Label t={t} t0={C.bharuch8} t1={C.bharti9} text="BHARUCH" x={Math.min(880, rx - 40)} y={ry + 330} color={COL.gold} pin={[rx, ry]} />
      <Counter t={t} t0={C.km8 - 0.3} t1={C.bharti9} to={60} post=" KM" x={540} y={damMid[1] - 260} />

      {/* tide and gates */}
      <Chip t={t} t0={C.bharti9} t1={C.utregi9} text="भरती ⬆  GATES बंद" x={540} y={330} color={COL.red} />
      <Chip t={t} t0={C.utregi9} t1={C.aaj10} text="उतरी ⬇  GATES खुले" x={540} y={330} color={COL.green} />
      <Prop name="dam_gates" x={540} y={1340} h={560} t={t} t0={C.khulenge9} t1={C.andar9 - 0.2} />
      <Prop name="fx_splash" x={540} y={1440} h={460} t={t} t0={C.khulenge9 + 0.2} t1={C.andar9 - 0.2} blend drop={false} />
      <Chip t={t} t0={C.bahar9} t1={C.andar9} text="खारा पानी बाहर" x={540} y={1650 - 120} color={COL.salt} size={48} />
      <Chip t={t} t0={C.andar9} t1={C.aaj10} text="मीठा पानी अंदर" x={540} y={1650 - 120} color={COL.fresh} size={48} />

      {/* the lake and the 9 districts */}
      <Counter t={t} t0={C.n1600 - 0.3} t1={C.kisan10 - 0.2} to={1600} post=" KM²" x={540} y={lakeC[1] - 40} color="#BFF4FF" size={150} />
      <Chip t={t} t0={C.bharat10} t1={C.kisan10} text="भारत की सबसे बड़ी मीठे पानी की झीलों में से एक" x={540} y={330} color={COL.fresh} size={40} rot={0} />
      <Prop name="farmer_happy" x={300} y={1260} h={640} t={t} t0={C.kisan10 + 0.3} t1={C.bonus11 - 0.1} />
      <Counter t={t} t0={C.n9 - 0.2} t1={C.bonus11} to={9} post=" ज़िले" x={760} y={420} color={COL.green} size={130} dur={0.4} />

      {/* the highway and the railway, and the short way to Surat */}
      <Prop name="dam_top_road" x={540} y={980} h={720} t={t} t0={C.bonus11 + 0.1} t1={C.surat11 - 0.2} />
      <Chip t={t} t0={C.lane11} t1={C.surat11 - 0.2} text="16 LANE HIGHWAY" x={540} y={330} color={COL.gold} />
      <Chip t={t} t0={C.railway11} t1={C.surat11 - 0.2} text="+ RAILWAY" x={540} y={450} color={COL.gold} rot={2} />
      <Label t={t} t0={C.surat11} t1={C.perfect12 - 0.5} text="BHAVNAGAR" x={bx - 80} y={by - 250} color={COL.gold} pin={[bx, by]} />
      <Label t={t} t0={C.surat11 + 0.2} t1={C.perfect12 - 0.5} text="SURAT" x={sx + 30} y={sy + 220} color={COL.gold} pin={[sx, sy]} />
      <Counter t={t} t0={C.n356 - 0.2} t1={C.perfect12 - 0.5} to={356} post=" KM" x={300} y={360} color={COL.red} size={130} />
      <Counter t={t} t0={C.n177 - 0.2} t1={C.perfect12 - 0.5} to={177} from={356} post=" KM" x={780} y={360} color={COL.green} size={130} />
      <Big t={t} t0={C.aadha11} t1={C.n356 - 0.2} text="लगभग आधा!" x={540} y={360} size={120} color={COL.green} />

      {/* the twist */}
      <Big t={t} t0={C.perfect12 - 0.3} t1={C.par12} text="PERFECT?" x={540} y={460} size={150} color={COL.gold} font={NUM} rot={-4} />
      <Big t={t} t0={C.par12 + 0.1} t1={C.jwaar13} text="पर…" x={540} y={460} size={170} color="#fff" />
      <Prop name="fx_wave" x={540} y={1000} h={1500} t={t} t0={C.jwaar13} t1={C.zameen13} blend drop={false} />
      <TideRuler t={t} />
      <Prop name="seabed_cutaway" x={540} y={1050} h={1100} t={t} t0={C.zameen13} t1={C.n50b - 0.1} />
      <Big t={t} t0={C.zameen13 + 0.3} t1={C.daldal13} text="पत्थर? ✗" x={540} y={330} size={110} color="#fff" />
      <Big t={t} t0={C.daldal13} t1={C.n50b} text="दलदल!" x={540} y={330} size={140} color={COL.sand} rot={3} />

      {/* 50 years, the file, the brick, the cost */}
      <Counter t={t} t0={C.n50b - 0.2} t1={C.file14} to={50} post=" साल" x={540} y={360} size={150} />
      <Prop name="file_stack" x={540} y={1080} h={1000} t={t} t0={C.file14} t1={C.eent14 - 0.1} />
      <Prop name="brick" x={540} y={1150} h={380} t={t} t0={C.eent14} t1={C.cost14 - 0.1} />
      <Big t={t} t0={C.eent14 + 0.1} t1={C.cost14} text="एक ईंट भी नहीं!" x={540} y={360} size={110} color={COL.red} />
      <Counter t={t} t0={C.cost14 + 0.2} t1={C.naam15 - 0.2} to={133000} pre="₹" post="" x={540} y={820} size={150} dur={2.0} />
      <Big t={t} t0={C.lakh14 + 0.6} t1={C.naam15 - 0.2} text="करोड़" x={540} y={960} size={110} color={COL.gold} rot={0} />

      {/* the name, the farmer waiting */}
      <Big t={t} t0={C.kalpasar15} t1={C.kisan16} text="KALPASAR" x={540} y={lakeC[1] - 30} size={170} color={COL.gold} font={NUM} rot={0} />
      <Chip t={t} t0={C.iccha15} t1={C.kisan16} text="इच्छा पूरी करने वाली झील" x={540} y={lakeC[1] + 120} color={COL.gold} size={50} rot={0} />
      <Prop name="farmer_waiting" x={540} y={1300} h={560} t={t} t0={C.kisan16 - 0.1} t1={DURATION_S} />
      <Big t={t} t0={C.banega16} t1={C.kalpana16} text="बनेगा?" x={540} y={250} size={130} color={COL.green} />
      <Big t={t} t0={C.kalpana16} t1={C.haan17 - 0.1} text="या कल्पना?" x={540} y={250} size={130} color="#BFF4FF" rot={3} />
      <Buttons t={t} />
    </AbsoluteFill>
  );
};

/** Whip transitions on the big moves. */
const WHIPS = () => [C.deewar1 - 0.35, C.socho2 + 0.1, C.door4 - 0.1, C.gulf5 - 0.2, C.kalpasar7 - 0.2, C.aaj10, C.kisan10, C.bonus11, C.surat11, C.par12, C.n50b, C.naam15, C.kisan16];
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

/** Section grades: the NullDynasty teal-and-gold base, a warm dry tint on the farmer's land, sepia for "50 साल पहले",
 *  a cold storm for the twist, and a flash on the big hits. */
export const gradeAt = (t: number) => ({
  dry: window4(t, C.baarish3 - 0.2, C.baarish3 + 0.4, C.door4, C.door4 + 0.6),
  sepia: window4(t, C.tabhi6 - 0.1, C.tabhi6 + 0.3, C.kalpasar7 - 0.3, C.kalpasar7 + 0.2),
  storm: window4(t, C.par12 - 0.1, C.par12 + 0.3, C.n50b - 0.3, C.n50b + 0.3),
});
export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const g = gradeAt(t);
  let flash = 0;
  for (const h of [C.deewar1, C.kalpasar7, C.par12, C.n10m, C.file14 + 0.2, C.lakh14]) flash = Math.max(flash, window4(t, h - 0.02, h, h + 0.04, h + 0.3));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,70,90,0.24), rgba(0,40,60,0.08) 40%, rgba(255,150,60,0.08) 70%, rgba(255,140,40,0.14))', mixBlendMode: 'soft-light' }} />
      {g.dry > 0 && <AbsoluteFill style={{ background: '#b06a1e', opacity: g.dry * 0.28, mixBlendMode: 'soft-light' }} />}
      {g.sepia > 0 && <AbsoluteFill style={{ background: '#8a6a3a', opacity: g.sepia * 0.55, mixBlendMode: 'color' }} />}
      {g.storm > 0 && <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0e2340, #2b4a6e)', opacity: g.storm * 0.4, mixBlendMode: 'multiply' }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.45), rgba(0,0,0,0) 24%, rgba(0,0,0,0) 70%, rgba(0,6,12,0.55))' }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.35, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

/** Subtitles: Mukta ExtraBold, karaoke (the spoken word lights green), English names and numbers in gold. Hidden on frame 0. */
const HOT = /^[0-9,~₹]+|^[A-Za-z]/;
export const Subtitles: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.3;
  if (i < 0 || t < C.suna1 + 0.2 || t > end) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = ramp(t, t0, t0 + 0.08, linear) * (1 - ramp(t, t1 - 0.02, t1, linear));
  if (a <= 0) return null;
  const s = lerp(0.86, 1, clamp01(pop(t, t0, 12, 260)));
  const words = text.split(' ');
  const len = words.map((w) => Math.max(1, w.replace(/[…।,?!:]/g, '').length));
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

/** The lightbulb over the old map while Null has the idea (top half). */
export const IdeaBulb: React.FC<{ t: number }> = ({ t }) => (
  <Prop name="lightbulb" x={800} y={300} h={300} t={t} t0={C.idea6} t1={C.kalpasar7 - 0.2} glow={COL.gold} />
);

export { inOut };
