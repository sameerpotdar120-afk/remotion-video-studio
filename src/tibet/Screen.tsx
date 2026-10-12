import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, graphemes, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import sizes from '../../public/tibet/img_sizes.json';
import { C, CAPS, Cam, DURATION_S, GEO, P, toScreen } from './cam';
import { AROUND, COL, routePt } from './Plane';
import { FLY0, FLY1, FT_Y } from './Fly';

export const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
const SERIF = "'NotoSerifDeva', 'Noto Serif Devanagari', serif";
const MONT = "'Montserrat', sans-serif";
const SZ = sizes as unknown as Record<string, [number, number]>;
const img = (n: string) => staticFile(`tibet/img/${n}.png`);

const Sprite: React.FC<{ t: number; t0: number; t1: number; name: string; x: number; y: number; h: number; rot?: number; flip?: boolean; glow?: string; shake?: number; enter?: 'pop' | 'none' }> = ({
  t, t0, t1, name, x, y, h, rot = 0, flip, glow, shake = 0, enter = 'pop',
}) => {
  if (t < t0 - 0.02 || t > t1 + 0.3) return null;
  const [iw, ih] = SZ[name] ?? [1000, 700];
  const w = (h * iw) / ih;
  const s = (enter === 'pop' ? pop(t, t0, 10, 210) : 1) * (1 - ramp(t, t1, t1 + 0.25, easeIn));
  if (s <= 0.01) return null;
  const sh = shake ? [Math.sin(t * 61) * shake, Math.cos(t * 53) * shake * 0.7] : [0, 0];
  return (
    <img src={img(name)} style={{ position: 'absolute', left: x - w / 2 + sh[0], top: y - h / 2 + sh[1], width: w, height: h, transform: `rotate(${rot}deg) scale(${s * (flip ? -1 : 1)}, ${s})`,
      filter: `${glow ? `drop-shadow(0 0 18px ${glow}) ` : ''}drop-shadow(0 10px 14px rgba(0,0,0,0.45))` }} />
  );
};

const Overlay: React.FC<{ name: string; a: number; x?: number; y?: number; w?: number; sc?: number; rot?: number }> = ({ name, a, x = 540, y = 960, w = 2000, sc = 1, rot = 0 }) => {
  if (a <= 0.001) return null;
  const [iw, ih] = SZ[name] ?? [1536, 1024];
  const h = (w * ih) / iw;
  return <img src={img(name)} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, mixBlendMode: 'screen', transform: `scale(${sc}) rotate(${rot}deg)` }} />;
};

const Label: React.FC<{ text: string; t: number; t0: number; t1: number; x: number; y: number; size?: number; color?: string; box?: string; font?: string; tc?: string }> = ({
  text, t, t0, t1, x, y, size = 58, color = '#fff', box, font = SERIF, tc,
}) => {
  const a = window4(t, t0, t0 + 0.12, t1 - 0.2, t1);
  if (a <= 0) return null;
  const g = graphemes(text);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: a, textAlign: 'center' }}>
      <div style={{ whiteSpace: 'nowrap', fontFamily: font, fontWeight: 900, fontSize: size, color: tc ?? color, textShadow: box ? 'none' : '0 3px 10px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)',
        ...(box ? { background: box, padding: '4px 26px 10px', borderRadius: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.45)', transform: `scale(${clamp01(pop(t, t0, 10, 230))})`, border: '4px solid rgba(255,255,255,0.9)' } : {}) }}>
        {g.map((ch, i) => {
          const p = clamp01(pop(t, t0 + i * 0.025, 12, 220));
          return <span key={i} style={{ display: 'inline-block', opacity: clamp01(p * 1.4), transform: `translateY(${(1 - p) * 20}px)` }}>{ch === ' ' ? ' ' : ch}</span>;
        })}
      </div>
    </div>
  );
};

/** Hook text from frame 0. */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const a = 1 - ramp(t, C.radar2 - 0.3, C.radar2, linear);
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', opacity: a, textShadow: '0 4px 14px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)', lineHeight: 1.1 }}>
      <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 100, color: '#fff' }}>✈ Planes</div>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 92, color: '#fff' }}>यहाँ से क्यों</div>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 110, color: COL.red, transform: `scale(${1 + kick(t, C.udta1, 0.08, 18, 7)})`, WebkitTextStroke: '4px #fff', paintOrder: 'stroke fill' }}>नहीं उड़ते?</div>
    </div>
  );
};

/** The radar's own header (our design; no app logo). */
const RadarHeader: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  if (a <= 0.001) return null;
  const blink = Math.sin(t * 8) > 0 ? 1 : 0.35;
  return (
    <div style={{ position: 'absolute', left: 60, top: 180, opacity: a, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#ff3b30', opacity: blink, boxShadow: '0 0 12px #ff3b30' }} />
      <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 44, color: '#fff', letterSpacing: 3 }}>LIVE FLIGHT RADAR</div>
    </div>
  );
};

const Badge: React.FC<{ t: number; t0: number; t1: number; n: number; x: number; y: number; label?: string; color?: string }> = ({ t, t0, t1, n, x, y, label, color = COL.red }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = pop(t, t0, 9, 240) * (1 - ramp(t, t1, t1 + 0.25, easeIn));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 110, height: 110, borderRadius: '50%', background: color, border: '6px solid #fff', boxShadow: `0 0 24px ${color}, 0 8px 18px rgba(0,0,0,0.5)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 66, color: '#fff' }}>{n}</div>
      {label && <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 70, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.9)', whiteSpace: 'nowrap' }}>{label}</div>}
    </div>
  );
};

/** Warning triangle (code-drawn). */
const Warn: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; size?: number }> = ({ t, t0, t1, x, y, size = 200 }) => {
  if (t < t0 || t > t1 + 0.25) return null;
  const s = pop(t, t0, 8, 260) * (1 - ramp(t, t1, t1 + 0.2, easeIn));
  const flash = 0.7 + 0.3 * Math.abs(Math.sin((t - t0) * 9));
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `scale(${s})`, overflow: 'visible', opacity: flash,
      filter: 'drop-shadow(0 0 18px rgba(255,40,40,0.95))' }}>
      <path d="M50,6 L95,88 L5,88 Z" fill="#E0262B" stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
      <rect x={45} y={32} width={10} height={32} rx={4} fill="#fff" />
      <circle cx={50} cy={75} r={6} fill="#fff" />
    </svg>
  );
};

/** Red ✗. */
const Cross: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; size?: number }> = ({ t, t0, t1, x, y, size = 170 }) => {
  if (t < t0 || t > t1 + 0.25) return null;
  const p = ramp(t, t0, t0 + 0.3, easeOut);
  const s = 1 - ramp(t, t1, t1 + 0.2, easeIn);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', transform: `scale(${s * (1 + kick(t, t0 + 0.3, 0.08, 26, 9))})`,
      filter: 'drop-shadow(0 0 14px rgba(255,40,40,0.9))' }}>
      <path d="M15,15 L85,85 M85,15 L15,85" stroke="#fff" strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
      <path d="M15,15 L85,85 M85,15 L15,85" stroke="#E0262B" strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
    </svg>
  );
};

/** No-entry sign over the airport tower. */
const NoEntry: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; size?: number }> = ({ t, t0, t1, x, y, size = 380 }) => {
  if (t < t0 || t > t1 + 0.25) return null;
  const s = pop(t, t0, 9, 230) * (1 - ramp(t, t1, t1 + 0.2, easeIn));
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `scale(${s})`, overflow: 'visible', filter: 'drop-shadow(0 0 12px rgba(255,40,40,0.8))' }}>
      <circle cx={50} cy={50} r={44} fill="none" stroke="#fff" strokeWidth={14} />
      <circle cx={50} cy={50} r={44} fill="none" stroke="#E0262B" strokeWidth={9} />
      <path d="M19,19 L81,81" stroke="#fff" strokeWidth={14} />
      <path d="M19,19 L81,81" stroke="#E0262B" strokeWidth={9} />
    </svg>
  );
};

/** 15-minute oxygen timer counting down. */
const Timer: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  if (t < t0 || t > t1 + 0.25) return null;
  const s = pop(t, t0, 10, 220) * (1 - ramp(t, t1, t1 + 0.2, easeIn));
  const secs = Math.max(0, 15 * 60 - Math.floor((t - t0) * 140));
  const mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');
  return (
    <div style={{ position: 'absolute', left: 760, top: 980, transform: `translate(-50%,-50%) scale(${s})`, padding: '10px 30px 14px', borderRadius: 20, background: 'rgba(10,10,12,0.85)',
      border: '5px solid #ff3b30', boxShadow: '0 0 24px rgba(255,59,48,0.7)', textAlign: 'center' }}>
      <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 92, color: '#ff3b30', letterSpacing: 4, fontVariantNumeric: 'tabular-nums' }}>{mm}:{ss}</div>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, color: '#fff' }}>Oxygen बाकी</div>
    </div>
  );
};

/** End card. */
const Question: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.tum11 - 0.3;
  if (t < t0) return null;
  const s = clamp01(pop(t, t0, 11, 190));
  const btn = (label: string, at: number, bg: string, fg: string) => {
    const p = clamp01(pop(t, at - 0.15, 10, 230));
    const hi = window4(t, at, at + 0.1, at + 0.5, at + 0.8);
    return (
      <div style={{ padding: '14px 40px 22px', borderRadius: 30, background: bg, border: '5px solid #fff', transform: `scale(${p * (1 + hi * 0.08)})`, opacity: p,
        boxShadow: `0 10px 22px rgba(0,0,0,0.5), 0 0 ${30 * hi}px rgba(255,255,255,0.8)`, fontFamily: SERIF, fontWeight: 900, fontSize: 70, color: fg, whiteSpace: 'nowrap' }}>{label}</div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: s }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', transform: `scale(${lerp(0.85, 1, s)})`, textShadow: '0 4px 14px rgba(0,0,0,0.9)' }}>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 100, color: '#fff' }}>तुम Pilot होते तो?</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', gap: 34 }}>
        {btn('सीधा ✈️', C.seedha11, COL.red, '#fff')}
        {btn('घूमकर ↩️', C.ghoom11, '#ffffff', '#1b1206')}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the screen layer
export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const at = (k: string) => toScreen(c, GEO.places[k]);
  const tib = at('tibet_c');
  const inFly = t >= FLY0() && t <= FLY1();
  const planeY = FT_Y(35000);
  const diveQ = ramp(t, C.pilot7 + 0.2, C.zameen7, inOut);
  const lhasa = at('lhasa');
  return (
    <AbsoluteFill>
      {/* ---- hook: planes curving around the red zone */}
      {t < C.radar2 && AROUND.map((r, i) => {
        const u = clamp01((t - 0.6 - i * 0.25) / 2.6);
        if (u <= 0 || u >= 1) return null;
        const [x, y] = routePt(c, r, u);
        const [x2, y2] = routePt(c, r, Math.min(1, u + 0.01));
        const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI + 90;
        return <img key={i} src={img('plane_top')} style={{ position: 'absolute', left: x - 45, top: y - 45, width: 90, height: 90, objectFit: 'contain', transform: `rotate(${ang}deg)`, filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.5))' }} />;
      })}
      <Hook t={t} />

      {/* ---- radar */}
      <RadarHeader t={t} a={window4(t, C.radar2 - 0.2, C.radar2 + 0.1, C.pathar3 - 0.3, C.pathar3)} />
      <Label text="खाली!" t={t} t0={C.khaali2} t1={C.pathar3 - 0.1} x={tib[0]} y={tib[1]} size={84} color="#fff" box={COL.red} />

      {/* ---- the plateau and India */}
      <Label text="Tibet का पठार" t={t} t0={C.pathar3 - 0.05} t1={C.bharat3 - 0.1} x={tib[0]} y={tib[1]} size={78} box={COL.red} />
      <Label text="≈ 25 लाख km²" t={t} t0={C.lakh3 - 0.05} t1={C.wajah4} x={540} y={420} size={86} color="#fff" box="rgba(20,10,10,0.75)" />
      <Label text="भारत का लगभग 3/4" t={t} t0={C.chauthai3 - 0.05} t1={C.wajah4} x={540} y={560} size={70} color={COL.gold} />
      <Badge t={t} t0={C.teen4 - 0.05} t1={C.pehli5 - 0.4} n={1} x={300} y={1180} />
      <Badge t={t} t0={C.teen4 + 0.12} t1={C.pehli5 - 0.4} n={2} x={540} y={1180} />
      <Badge t={t} t0={C.teen4 + 0.24} t1={C.pehli5 - 0.4} n={3} x={780} y={1180} />

      {/* ---- 1 · height (over the 3D fly-over) */}
      {inFly && <Overlay name="overlay_clouds" a={window4(t, FLY0() - 0.05, FLY0() + 0.05, FLY0() + 0.35, FLY0() + 0.8)} sc={lerp(1, 2.6, ramp(t, FLY0(), FLY0() + 0.8, linear))} />}
      <Badge t={t} t0={C.pehli5} t1={C.ft14800 - 0.1} n={1} x={540} y={300} label="ऊँचाई" />
      <Label text="दुनिया का सबसे ऊँचा पठार" t={t} t0={C.sabse5 - 0.05} t1={C.ft14800 - 0.1} x={540} y={470} size={60} />
      <Sprite t={t} t0={C.plane6 - 0.1} t1={C.pilot7 + 0.1} name="plane_side" x={lerp(620, 700, ramp(t, C.plane6, C.pilot7, linear))} y={planeY} h={200}
        shake={t > C.gir6 ? 3 : 0} glow={t > C.gir6 ? 'rgba(255,40,40,0.9)' : undefined} />
      <Overlay name="overlay_red_alarm" a={window4(t, C.gir6 - 0.05, C.gir6 + 0.1, C.pilot7 - 0.2, C.pilot7 + 0.2) * (0.55 + 0.45 * Math.abs(Math.sin(t * 6)))} w={2400} />
      <Warn t={t} t0={C.gir6 - 0.05} t1={C.pilot7} x={820} y={planeY - 150} size={170} />
      <Label text="Cabin Pressure ↓" t={t} t0={C.gir6} t1={C.oxygen6 - 0.1} x={600} y={760} size={64} color="#fff" box="rgba(200,20,20,0.85)" font={MONT} />
      <Sprite t={t} t0={C.oxygen6 - 0.1} t1={C.pilot7 + 0.2} name="oxygen_masks" x={430} y={980} h={430} />
      <Timer t={t} t0={C.min15 - 0.1} t1={C.pilot7 + 0.3} />
      <Sprite t={t} t0={C.pilot7 + 0.1} t1={FLY1() - 0.2} name="plane_dive" x={lerp(700, 640, diveQ)} y={lerp(planeY, FT_Y(10000) - 40, diveQ)} h={230} enter="none"
        glow="rgba(255,60,60,0.7)" />
      <Label text="नीचे ज़मीन ही 15,000 ft!" t={t} t0={C.zameen7 - 0.05} t1={FLY1() - 0.1} x={600} y={1430} size={58} color="#fff" box="rgba(200,20,20,0.85)" />
      <Cross t={t} t0={C.ft15000 + 0.1} t1={FLY1() - 0.1} x={740} y={FT_Y(10000) - 40} />

      {/* ---- 2 · weather */}
      <Badge t={t} t0={C.doosri8} t1={C.teesri9 - 0.3} n={2} x={540} y={300} label="मौसम" />
      <Overlay name="overlay_wind" a={window4(t, C.hawayen8 - 0.3, C.hawayen8, C.teesri9 - 0.4, C.teesri9) * 0.9} x={lerp(380, 700, ramp(t, C.hawayen8 - 0.3, C.teesri9, linear))} w={2200} />
      <Overlay name="overlay_snow" a={window4(t, C.doosri8, C.doosri8 + 0.4, C.teesri9 - 0.4, C.teesri9) * 0.85} y={lerp(900, 1060, ramp(t, C.doosri8, C.teesri9, linear))} w={1500} />
      <Sprite t={t} t0={C.doosri8 + 0.2} t1={C.teesri9 - 0.3} name="storm_cloud" x={tib[0] + 40} y={tib[1] - 140} h={360} />
      <Sprite t={t} t0={C.turb8 - 0.2} t1={C.teesri9 - 0.3} name="plane_top" x={lerp(tib[0] - 330, tib[0] + 200, ramp(t, C.turb8 - 0.2, C.teesri9, linear))} y={tib[1] + 120} h={140} rot={90}
        shake={9} />
      <Label text="Turbulence" t={t} t0={C.turb8 - 0.05} t1={C.teesri9 - 0.3} x={540} y={470} size={80} color="#fff" font={MONT} box="rgba(30,40,60,0.8)" />

      {/* ---- 3 · airports */}
      <Badge t={t} t0={C.teesri9} t1={C.gadbad10 - 0.3} n={3} x={540} y={300} label="Airports" />
      <Sprite t={t} t0={C.emergency9 - 0.1} t1={C.gadbad10 - 0.2} name="airport_tower" x={tib[0] - 40} y={tib[1] + 10} h={330} />
      <NoEntry t={t} t0={C.airports9 - 0.05} t1={C.gadbad10 - 0.2} x={tib[0] - 40} y={tib[1] + 10} />
      <Label text="गिने-चुने Airports" t={t} t0={C.airports9} t1={C.patli9} x={540} y={470} size={70} color="#fff" box="rgba(200,20,20,0.85)" />
      <Label text="पतली हवा" t={t} t0={C.patli9 - 0.05} t1={C.gadbad10 - 0.2} x={540} y={470} size={70} color="#fff" box="rgba(30,40,60,0.85)" />
      <Label text="Lhasa" t={t} t0={C.airports9 + 0.2} t1={C.gadbad10 + 0.4} x={lhasa[0] + 70} y={lhasa[1] + 46} size={40} font={MONT} />

      {/* ---- around, and the question */}
      {t > C.gadbad10 && AROUND.map((r, i) => {
        const u = clamp01((t - C.gadbad10 - 0.4 - i * 0.25) / 2.4);
        if (u <= 0 || u >= 1) return null;
        const [x, y] = routePt(c, r, u);
        const [x2, y2] = routePt(c, r, Math.min(1, u + 0.01));
        const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI + 90;
        return <img key={i} src={img('plane_top')} style={{ position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, objectFit: 'contain', transform: `rotate(${ang}deg)`, filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.5))' }} />;
      })}
      <Label text="घूमकर जाना ही सुरक्षित" t={t} t0={C.ghoom10 - 0.1} t1={C.tum11 - 0.3} x={540} y={420} size={68} color="#fff" box="rgba(10,60,30,0.85)" />
      <Question t={t} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- frame-level
export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.udta1, 8], [C.khaali2, 8], [C.teen4, 7], [C.gir6, 12], [C.ft15000, 10], [C.turb8, 12], [C.airports9, 8]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const flash = Math.max(window4(t, FLY0() - 0.05, FLY0(), FLY0() + 0.05, FLY0() + 0.3) * 0.6, window4(t, FLY1() - 0.05, FLY1(), FLY1() + 0.05, FLY1() + 0.3) * 0.6);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,10,20,0.3), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,8,16,0.45))' }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#ffffff', opacity: flash * 0.6 }} />}
    </AbsoluteFill>
  );
};

export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.4;
  if (i < 0 || t > end || t > C.tum11 - 0.3) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = (i === 0 ? 1 : ramp(t, t0, t0 + 0.1, linear)) * (1 - ramp(t, t1 - 0.02, t1, linear));
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1580, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.25,
      color: '#fff', opacity: a, transform: `translateY(${(1 - ramp(t, t0, t0 + 0.14)) * 8}px)`,
      textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.45)' }}>{text}</div>
  );
};

export type { P };
export { easeOut };
