import React from 'react';
import { AbsoluteFill } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, merc, toScreen } from './cam';
import { HEAD, NUM, SUB } from './fonts';
import { COL } from './Plane';
import { Rig, hinge, strike } from './Rig';

const STROKE = (w: number, col = '#120a02') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';

/** A callout: a pin ring on the place, a thin line, and a white-outlined name box. */
const Label: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; pin?: P; size?: number; ghost?: boolean }> = ({ t, t0, t1, text, x, y, color, pin, size = 50, ghost }) => {
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const out = ramp(t, t1, t1 + 0.25, easeIn);
  const line = ramp(t, t0 - 0.05, t0 + 0.2, easeOut) * (1 - out);
  const s = clamp01(pop(t, t0 + 0.12, 8, 260)) * (1 - out);
  const ring = clamp01(pop(t, t0 - 0.05, 9, 260)) * (1 - out);
  return (
    <>
      {pin && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <line x1={pin[0]} y1={pin[1]} x2={lerp(pin[0], x, line)} y2={lerp(pin[1], y, line)} stroke="#fff" strokeWidth={4} strokeDasharray={ghost ? '10 8' : undefined} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.7))' }} />
          <circle cx={pin[0]} cy={pin[1]} r={20 * ring} fill="none" stroke="#fff" strokeWidth={5} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
          <circle cx={pin[0]} cy={pin[1]} r={8 * ring} fill="#fff" />
        </svg>
      )}
      {s > 0.01 && (
        <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, whiteSpace: 'nowrap', background: ghost ? 'rgba(8,16,26,0.35)' : 'rgba(8,16,26,0.62)', color: '#fff',
          padding: '8px 24px 2px 20px', borderRadius: 10, border: ghost ? '3px dashed rgba(255,255,255,0.85)' : '4px solid #fff', fontFamily: NUM, fontSize: size, letterSpacing: 1.5,
          boxShadow: `0 8px 22px rgba(0,0,0,0.55), 0 0 18px ${color}66`, lineHeight: 1.15, display: 'flex', alignItems: 'center', gap: 14 }}>
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
const Counter: React.FC<{ t: number; t0: number; t1: number; to: number; x: number; y: number; size?: number; color?: string; pre?: string; post?: string; dur?: number }> = ({
  t, t0, t1, to, x, y, size = 170, color = COL.gold, pre = '', post = '', dur = 0.8,
}) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.2, t1);
  if (a <= 0) return null;
  const v = Math.round(lerp(0, to, ramp(t, t0, t0 + dur, easeOut)));
  const s = clamp01(pop(t, t0, 10, 240)) * (1 + kick(t, t0 + dur, 0.08, 26, 9));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, textAlign: 'center', whiteSpace: 'nowrap',
      fontFamily: NUM, fontSize: size, color, lineHeight: 1, letterSpacing: 2, textShadow: `${SHADOW}, 0 0 30px ${color}66`, ...STROKE(8) }}>{pre}{v.toLocaleString('en-IN')}{post}</div>
  );
};

/** The textbook line and the red ✗ that lands on "Founder". Sits on the open book's right page. */
const BookText: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const a = window4(t, C.kitab8 + 0.7, C.kitab8 + 0.9, C.pehle8 - 0.3, C.pehle8);
  if (a <= 0) return null;
  const write = ramp(t, C.kitab8 + 0.8, C.basaya8 + 0.3, linear);
  const xA = ramp(t, C.court8 + 1.1, C.court8 + 1.35, easeOut);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%) rotate(-3deg)', opacity: a, textAlign: 'center', fontFamily: NUM, color: '#3a2412', lineHeight: 1.05 }}>
      <div style={{ fontSize: 46, letterSpacing: 2, clipPath: `inset(0 ${(1 - clamp01(write * 2)) * 100}% 0 0)` }}>FOUNDER:</div>
      <div style={{ fontSize: 66, clipPath: `inset(0 ${(1 - clamp01(write * 2 - 1)) * 100}% 0 0)` }}>JOB CHARNOCK</div>
      {xA > 0 && (
        <svg width={420} height={220} viewBox="0 0 420 220" style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) scale(${lerp(1.6, 1, xA)})`, overflow: 'visible' }}>
          <path d="M40 30 L380 190 M380 30 L40 190" stroke={COL.red} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={`${xA} 1`} style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))' }} />
        </svg>
      )}
    </div>
  );
};

const S = (c: Cam, at: P) => toScreen(c, at);

/** Scenes of rigged UE5 props. Every moving piece is a separate cut-out; positions and pivots are fractions of each set. */
const Props: React.FC<{ t: number }> = ({ t }) => {
  // K1/K2/K3 — today's street corner on the hook, the taxi driving through, the tram sliding past; again at the end
  const hookEnd = C.teen1 - 0.15;
  const endIn = C.hamesha9 - 0.1;
  const taxiX = (t0: number) => lerp(-700, 1800, ramp(t, t0, t0 + 3.6, linear));
  const wheel = (t * 540) % 360;
  const street = (t0: number, t1: number) => (
    <>
      <Rig set="k1" parts={[{ name: 'base' }, { name: 'hero', a: 0 }]} x={540} y={1180} h={760} t={t} t0={t0} t1={t1} entry="rise" />
      <Rig set="k3" parts={[{ name: 'tram' }, { name: 'pantograph', pivot: [0.5, 0.2], rot: Math.sin(t * 3) * 1.5 }]} x={lerp(1200, 360, ramp(t, t0 + 0.2, t0 + 4, linear))} y={1110} h={300}
        t={t} t0={t0 + 0.2} t1={t1} entry="fade" shadow={false} float={0.3} />
      <Rig set="k2" parts={[{ name: 'taxi_body', dy: Math.sin(t * 14) * 0.004 }]} x={taxiX(t0 + 0.4)} y={1390} h={260} t={t} t0={t0 + 0.4} t1={t1} entry="fade" float={0} />
      <WheelPair t={t} x={taxiX(t0 + 0.4)} y={1390} h={260} rot={wheel} t0={t0 + 0.4} t1={t1} />
    </>
  );
  // K4 — villages (three small ones on "तीन गाँव", one big one for Gobindapur and the ending)
  const village = (x: number, y: number, h: number, t0: number, t1: number, lift = 0, key = 'v') => (
    <Rig key={key} set="k4" parts={[
      { name: 'ground' },
      { name: 'banyan', pivot: [0.5, 0.95], rot: Math.sin(t * 1.3 + x) * 1.6, dy: -lift * 1.2, a: 1 - lift },
      { name: 'palm', pivot: [0.5, 0.97], rot: Math.sin(t * 1.9 + x) * 2.4, dy: -lift * 1.4, a: 1 - lift },
      { name: 'hut_a', dy: -lift * 0.9, rot: lift * -8, a: 1 - lift },
      { name: 'hut_b', dy: -lift * 1.1, rot: lift * 6, a: 1 - lift },
      { name: 'hut_c', dy: -lift * 1.0, rot: lift * -4, a: 1 - lift },
    ]} x={x} y={y} h={h} t={t} t0={t0} t1={t1} entry="rise" />
  );
  const liftG = ramp(t, C.gobind6, C.khali6 + 0.5, easeIn);
  // K5 — coins dropping into the pouch
  const coins = [0, 1, 2, 3, 4].map((i) => {
    const t0 = C.n1300 + 0.1 + i * 0.28;
    const p = ramp(t, t0, t0 + 0.32, easeIn);
    return { name: 'coin', dy: lerp(-0.9, -0.05, p) - (i % 2) * 0.02, dx: (i - 2) * 0.05 * (1 - p), rot: (1 - p) * 220 + i * 30, a: t > t0 && p < 1 ? 1 : 0 } as const;
  });
  // K10 — the deed unrolls (rods move apart, the paper is revealed between them), the quill writes, the seal stamps
  const unroll = ramp(t, C.y1698 + 0.2, C.company5 + 0.3, inOut);
  const seal = strike(t, C.haq5 + 0.1);
  // K12 — the fort's gates close, the cannon recoils
  const gate = hinge(t, C.khali6 + 1.3, 1, 0, 0.9);
  const recoil = t > C.yahin7 - 0.4 ? Math.exp(-(t - (C.yahin7 - 0.4)) * 7) * Math.sin(Math.min(Math.PI / 2, (t - (C.yahin7 - 0.4)) * 30)) : 0;
  // K13 — the family walks away (staggered, a small step bob)
  const walk = (i: number) => ({ dx: -ramp(t, C.khali6 + 0.1 + i * 0.15, C.yahin7 + 0.5, linear) * 1.2, dy: -Math.abs(Math.sin((t + i) * 6)) * 0.012 });
  // K17 — the gavel strikes
  const gv = strike(t, C.court8 + 1.15);
  return (
    <>
      {street(0.15, hookEnd)}
      {village(220, 1220, 330, C.teen1, C.raj1 - 0.2, 0, 'v1')}
      {village(540, 1300, 380, C.teen1 + 0.15, C.raj1 - 0.2, 0, 'v2')}
      {village(860, 1220, 330, C.teen1 + 0.3, C.raj1 - 0.2, 0, 'v3')}
      <Rig set="k5" parts={[...coins, { name: 'pouch' }]} x={540} y={1000} h={330} t={t} t0={C.n1300 - 0.05} t1={C.to1 - 0.1} entry="pop" />

      {/* Sutanuti: the charkha spins, thread bales drop and stack */}
      <Rig set="k6" parts={[{ name: 'frame' }, { name: 'wheel', pivot: [0.36, 0.42], rot: (t - C.sutanuti2) * 160 }]} x={330} y={1200} h={560} t={t} t0={C.soot2 - 0.1} t1={C.doosra3 - 0.1} entry="slideL" />
      <Rig set="k7" parts={['c', 'b', 'a'].map((n, i) => {
        const p = ramp(t, C.soot2 + 0.3 + i * 0.25, C.soot2 + 0.65 + i * 0.25, easeIn);
        return { name: `bale_${n}`, dy: lerp(-1.4, 0, p) + (p >= 1 ? kick(t, C.soot2 + 0.65 + i * 0.25, 0.02, 20, 10) : 0), a: p > 0 ? 1 : 0 };
      })} x={790} y={1230} h={480} t={t} t0={C.soot2 + 0.2} t1={C.doosra3 - 0.1} entry="fade" />

      {/* Gobindapur, and later its emptying */}
      {village(540, 1230, 640, C.gobind3 - 0.1, C.teesra4 - 0.1, 0, 'vg')}
      {village(540, 1250, 620, C.fort6 - 0.1, C.khali6 + 0.6, liftG, 'vg2')}

      {/* Kalikata: the temple bell swings */}
      <Rig set="k8" parts={[{ name: 'base' }, { name: 'bell', pivot: [0.82, 0.38], rot: Math.sin((t - C.kalikata4) * 5.5) * 14 * Math.exp(-Math.max(0, t - C.kali4) * 0.6) }]}
        x={540} y={1180} h={720} t={t} t0={C.kalikata4 - 0.05} t1={C.hooghly5 - 0.15} entry="rise" />

      {/* the trading ship sails up the Hooghly, its sails filling */}
      <Rig set="k9" parts={[
        { name: 'hull' },
        ...(['fore', 'main', 'mizzen'] as const).map((s, i) => ({ name: `sails_${s}`, pivot: [0.5, 0.75] as [number, number], sx: 1 + 0.04 * Math.sin(t * 2.4 + i), sy: 1 + 0.02 * Math.sin(t * 2.4 + i + 1) })),
      ]} x={lerp(80, 620, ramp(t, C.hooghly5, C.y1698, linear))} y={1150 + Math.sin(t * 2.2) * 10} h={640} t={t} t0={C.hooghly5 + 0.1} t1={C.y1698 - 0.2} entry="slideL" tilt={Math.sin(t * 1.8) * 2} />

      {/* 1698: the deed, the quill, the seal, and two hands meeting */}
      <Rig set="k10" parts={[
        { name: 'paper', sy: Math.max(0.02, unroll), pivot: [0.5, 0.5] },
        { name: 'rod_top', dy: -0.0 - (1 - unroll) * -0.32 },
        { name: 'rod_bottom', dy: (1 - unroll) * -0.32 },
        { name: 'inkpot' },
        { name: 'quill', pivot: [0.2, 0.9], rot: Math.sin(t * 9) * 4 * window4(t, C.company5, C.company5 + 0.2, C.sabarna5 + 0.8, C.haq5), dx: Math.sin(t * 3) * 0.02 },
        { name: 'seal', dy: -seal * 0.35, sx: 1 + (t > C.haq5 + 0.1 ? kick(t, C.haq5 + 0.1, 0.1, 22, 9) : 0), a: t > C.sabarna5 ? 1 : 0 },
      ]} x={540} y={1180} h={620} t={t} t0={C.y1698 - 0.1} t1={C.fort6 - 0.15} entry="rise" />
      <Rig set="k11" parts={[
        { name: 'hand_left', dx: -(1 - ramp(t, C.sabarna5 - 0.2, C.sabarna5 + 0.7, easeOut)) * 0.9 },
        { name: 'hand_right', dx: (1 - ramp(t, C.sabarna5 - 0.2, C.sabarna5 + 0.7, easeOut)) * 0.9 },
      ]} x={540} y={760} h={360} t={t} t0={C.sabarna5 - 0.25} t1={C.fort6 - 0.15} entry="fade" shadow={false} float={0.4} />

      {/* Fort William rises on Gobindapur's ground, the family walks away, the gates swing shut, a cannon fires */}
      <Rig set="k13" parts={[{ name: 'grandmother', ...walk(2) }, { name: 'mother_child', ...walk(1) }, { name: 'father', ...walk(0) }]} x={700} y={1430} h={330} t={t} t0={C.khali6 - 0.1} t1={C.yahin7 + 0.4} entry="fade" float={0} />
      <Rig set="k12" parts={[
        { name: 'base' },
        { name: 'door_left', pivot: [0.43, 0.6], sx: lerp(1, 0.15, gate) },
        { name: 'door_right', pivot: [0.57, 0.6], sx: lerp(1, 0.15, gate) },
        { name: 'cannon_carriage' },
        { name: 'cannon_barrel', dx: -recoil * 0.03, dy: recoil * 0.01 },
      ]} x={540} y={1150} h={700} t={t} t0={C.khali6 + 0.35} t1={C.yahin7 + 0.6} entry="rise" />

      {/* the capital: a crown settles on its cushion */}
      <Rig set="k14" parts={[{ name: 'cushion' }, { name: 'crown', dy: -(1 - ramp(t, C.raj7, C.raj7 + 0.45, easeIn)) * 0.8 + (t > C.raj7 + 0.45 ? kick(t, C.raj7 + 0.45, 0.02, 22, 9) : 0) }]}
        x={540} y={1180} h={460} t={t} t0={C.raj7 - 0.4} t1={C.kitab8 - 0.05} entry="pop" glow={COL.gold} />

      {/* the book, then the High Court and the gavel */}
      <Rig set="k15" parts={[{ name: 'closed', a: 1 - ramp(t, C.kitab8 + 0.35, C.kitab8 + 0.6), sx: lerp(1, 0.2, ramp(t, C.kitab8 + 0.3, C.kitab8 + 0.6, easeIn)) }, { name: 'open', a: ramp(t, C.kitab8 + 0.45, C.kitab8 + 0.65), sx: lerp(0.3, 1, ramp(t, C.kitab8 + 0.45, C.kitab8 + 0.75, easeOut)) }]}
        x={540} y={1150} h={620} t={t} t0={C.kitab8 - 0.05} t1={C.court8 + 1.9} entry="rise" sweep={false} />
      <BookText t={t} x={700} y={1100} />
      <Rig set="k16" parts={[{ name: 'court' }]} x={540} y={760} h={560} t={t} t0={C.court8 - 0.05} t1={C.pehle8 + 0.2} entry="rise" />
      <Rig set="k17" parts={[{ name: 'block' }, { name: 'gavel', pivot: [0.85, 0.75], rot: -gv * 40 }]} x={820} y={1380} h={300} t={t} t0={C.court8 + 0.3} t1={C.pehle8 + 0.2} entry="slideR" />

      {/* the ending: the village becomes today's city on the same riverbank */}
      {village(540, 1250, 620, C.matlab9 - 0.05, endIn + 0.4, 0, 'vend')}
      {street(endIn, C.to10 + 0.1)}
    </>
  );
};

/** The taxi's two wheels (one cut-out, used twice). Positions are fractions of the taxi body; tuned when the asset lands. */
const WheelPair: React.FC<{ t: number; x: number; y: number; h: number; rot: number; t0: number; t1: number }> = ({ t, x, y, h, rot, t0, t1 }) => (
  <>
    {[-0.62, 0.62].map((f) => (
      <Rig key={f} set="k2" parts={[{ name: 'wheel', rot }]} x={x + f * h} y={y + h * 0.28} h={h * 0.36} t={t} t0={t0} t1={t1} entry="fade" shadow={false} float={0} sweep={false} />
    ))}
  </>
);

export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const pl = GEO.places;
  const su = S(c, pl.sutanuti), ka = S(c, pl.kalikata), go = S(c, pl.gobindapur), fo = S(c, pl.fort), hc = S(c, pl.highcourt);
  const river = S(c, merc(88.338, 22.57));  // mid-channel by the old villages
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <Props t={t} />

      {/* hook: picture first, then three words */}
      <Label t={t} t0={C.kolkata1} t1={C.teen1 - 0.1} text="KOLKATA" x={540} y={470} color={COL.gold} size={64} pin={S(c, merc(88.355, 22.575))} />
      <Big t={t} t0={0.25} t1={C.teen1 - 0.05} text="CITY OF JOY" x={540} y={300} size={140} color={COL.gold} font={NUM} rot={-2} />
      <Big t={t} t0={C.teen1} t1={C.n1300 - 0.1} text="कभी सिर्फ़ 3 गाँव!" x={540} y={320} size={118} color="#fff" />
      <Counter t={t} t0={C.n1300 - 0.1} t1={C.to1} to={1300} pre="₹" x={540} y={330} size={170} />
      <Chip t={t} t0={C.kiraye1 - 0.4} t1={C.to1} text="सालाना किराया" x={540} y={470} color={COL.gold} size={54} />
      <Big t={t} t0={C.raj1 - 0.3} t1={C.pehla2} text="राजधानी कैसे?" x={540} y={330} size={130} color={COL.gold} rot={2} />

      {/* the three villages and today's names */}
      <Label t={t} t0={C.sutanuti2} t1={C.doosra3 - 0.1} text="SUTANUTI" x={540} y={300} color={COL.amber} pin={su} size={60} />
      <Label t={t} t0={C.shobha2} t1={C.doosra3 - 0.1} text="SHOBHABAZAR" x={300} y={470} color={COL.violet} size={40} pin={S(c, merc(88.365, 22.598))} />
      <Label t={t} t0={C.chitpur2} t1={C.doosra3 - 0.1} text="CHITPUR" x={790} y={470} color={COL.coral} size={40} pin={S(c, merc(88.374, 22.612))} />
      <Label t={t} t0={C.gobind3} t1={C.teesra4 - 0.1} text="GOBINDAPUR" x={540} y={300} color={COL.teal} pin={go} size={60} />
      <Label t={t} t0={C.maidan3} t1={C.teesra4 - 0.1} text="MAIDAN" x={300} y={470} color={COL.green} size={40} pin={S(c, merc(88.346, 22.548))} />
      <Label t={t} t0={C.fort3} t1={C.teesra4 - 0.1} text="FORT WILLIAM" x={790} y={470} color={COL.red} size={40} pin={fo} />
      <Label t={t} t0={C.kalikata4} t1={C.hooghly5 - 0.1} text="KALIKATA" x={540} y={300} color={COL.gold} pin={ka} size={60} />
      <Chip t={t} t0={C.kali4 - 0.3} t1={C.central4} text="माँ काली?" x={540} y={460} color={COL.red} size={50} />
      <Label t={t} t0={C.central4} t1={C.hooghly5 - 0.1} text="CENTRAL KOLKATA" x={540} y={470} color={COL.coral} size={40} pin={S(c, merc(88.358, 22.566))} />

      {/* the Hooghly and the trade */}
      <Label t={t} t0={C.hooghly5 + 0.3} t1={C.y1698 - 0.2} text="HOOGHLY" x={760} y={420} color={COL.river} pin={river} size={56} />
      <Chip t={t} t0={C.perfect5 - 0.2} t1={C.y1698 - 0.1} text="व्यापार के लिए PERFECT" x={540} y={300} color={COL.teal} size={56} />

      {/* 1698 */}
      <Big t={t} t0={C.y1698 - 0.1} t1={C.company5} text="1698" x={540} y={310} size={190} color={COL.gold} font={NUM} rot={0} />
      <Chip t={t} t0={C.company5 - 0.1} t1={C.sabarna5 - 0.1} text="EAST INDIA COMPANY" x={540} y={310} color={COL.red} size={58} />
      <Chip t={t} t0={C.sabarna5 - 0.1} t1={C.fort6 - 0.1} text="ज़मींदार: Sabarna Roy Choudhury परिवार" x={540} y={310} color={COL.gold} size={42} rot={0} />
      <Big t={t} t0={C.haq5} t1={C.fort6 - 0.1} text="3 गाँवों का हक़" x={540} y={450} size={90} color="#fff" rot={2} />

      {/* Fort William, Gobindapur emptied */}
      <Label t={t} t0={C.fort6} t1={C.khali6 - 0.1} text="FORT WILLIAM" x={540} y={300} color={COL.red} pin={fo} size={60} />
      <Big t={t} t0={C.khali6} t1={C.yahin7} text="पूरा गाँव खाली!" x={540} y={320} size={112} color={COL.red} rot={-2} />

      {/* one city, the capital */}
      <Label t={t} t0={C.shehar7} t1={C.raj7 - 0.4} text="CALCUTTA" x={540} y={470} color={COL.gold} size={60} pin={S(c, merc(88.352, 22.578))} />
      <Big t={t} t0={C.yahin7 + 0.1} t1={C.british7 - 0.1} text="3 गाँव → 1 शहर" x={540} y={320} size={116} color={COL.gold} rot={0} />
      <Chip t={t} t0={C.british7 - 0.1} t1={C.kitab8 - 0.1} text="BRITISH INDIA की राजधानी" x={540} y={320} color={COL.gold} size={56} />

      {/* the book and the court */}
      <Label t={t} t0={C.court8} t1={C.pehle8 - 0.1} text="CALCUTTA HIGH COURT" x={540} y={300} color={COL.ice} pin={hc} size={50} />
      <Big t={t} t0={C.pehle8} t1={C.matlab9} text="बहुत पहले से!" x={540} y={320} size={120} color={COL.green} rot={2} />

      {/* the ending */}
      <Big t={t} t0={C.basaya9 - 0.2} t1={C.hamesha9} text="किसी ने बसाया नहीं…" x={540} y={320} size={96} color="#fff" />
      <Big t={t} t0={C.hamesha9} t1={C.to10 + 0.2} text="ये हमेशा से यहीं था" x={540} y={320} size={96} color={COL.gold} rot={0} />
    </AbsoluteFill>
  );
};

/** In the split screen's top half: the three names, one under the other, and a send arrow. */
export const NamesCard: React.FC<{ t: number }> = ({ t }) => {
  const names: [string, string][] = [['SUTANUTI', COL.amber], ['GOBINDAPUR', COL.teal], ['KALIKATA', COL.gold]];
  return (
    <>
      {names.map(([n, col], i) => (
        <Chip key={n} t={t} t0={C.to10 + 0.25 + i * 0.25} t1={DURATION_S + 1} text={n} x={540} y={180 + i * 120} color={col} size={64} rot={i % 2 ? 2 : -2} />
      ))}
      <Chip t={t} t0={C.bhejo10} t1={DURATION_S + 1} text="➤ Kolkata वाले दोस्त को भेजो" x={540} y={600} color={COL.green} size={46} rot={0} />
    </>
  );
};

/** Whip transitions on the big moves. */
const WHIPS = () => [C.teen1 - 0.1, C.raj1 - 0.2, C.pehla2 - 0.1, C.doosra3, C.teesra4, C.hooghly5, C.y1698 - 0.3, C.fort6 - 0.1, C.yahin7, C.kitab8, C.matlab9];
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

/** Section grades. Today: teal shadows and gold highlights. The 1690s: warm amber, softer contrast, a little haze.
 *  The fort: cooler and harder. The court: cold. The ending: rich golden light. A soft highlight roll-off (a dimmed
 *  screen bloom instead of pushing brightness) keeps glows from clipping; vignette and film grain on top. */
export const gradeAt = (t: number) => ({
  past: window4(t, C.teen1 - 0.2, C.teen1 + 0.4, C.yahin7, C.yahin7 + 0.6) * (1 - window4(t, C.raj1 - 0.2, C.raj1 + 0.2, C.pehla2 - 0.3, C.pehla2)),
  fort: window4(t, C.fort6 + 0.6, C.khali6, C.yahin7, C.yahin7 + 0.5),
  court: window4(t, C.court8 - 0.2, C.court8 + 0.3, C.pehle8, C.pehle8 + 0.4),
  gold: ramp(t, C.matlab9, C.hamesha9 + 0.4),
});
export const Grade: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const g = gradeAt(t);
  let flash = 0;
  for (const h of [C.teen1, C.n1300, C.y1698, C.khali6, C.court8 + 1.15, C.hamesha9]) flash = Math.max(flash, window4(t, h - 0.02, h, h + 0.04, h + 0.3));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* base split-tone: teal shadows (top) to warm highlights (bottom) */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,80,95,0.26), rgba(0,40,60,0.08) 40%, rgba(255,160,70,0.1) 70%, rgba(255,140,40,0.16))', mixBlendMode: 'soft-light' }} />
      {g.past > 0 && (
        <>
          <AbsoluteFill style={{ background: '#c8862f', opacity: g.past * 0.34, mixBlendMode: 'soft-light' }} />
          <AbsoluteFill style={{ background: '#7a5a34', opacity: g.past * 0.22, mixBlendMode: 'color' }} />
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,214,160,0.22), rgba(255,214,160,0) 65%)', opacity: g.past, mixBlendMode: 'screen' }} />
        </>
      )}
      {g.fort > 0 && <AbsoluteFill style={{ background: 'linear-gradient(180deg, #13263e, #3b2a1e)', opacity: g.fort * 0.32, mixBlendMode: 'multiply' }} />}
      {g.court > 0 && <AbsoluteFill style={{ background: '#1b3550', opacity: g.court * 0.3, mixBlendMode: 'soft-light' }} />}
      {g.gold > 0 && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(255,170,60,0.35), rgba(255,120,40,0.2))', opacity: g.gold, mixBlendMode: 'soft-light' }} />
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(255,200,120,0.35), rgba(255,200,120,0) 60%)', opacity: g.gold, mixBlendMode: 'screen' }} />
        </>
      )}
      {/* highlight roll-off: pull the very top end down a touch so glows stay creamy instead of clipping */}
      <AbsoluteFill style={{ background: 'rgba(250,236,214,1)', opacity: 0.06, mixBlendMode: 'multiply' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.45), rgba(0,0,0,0) 24%, rgba(0,0,0,0) 70%, rgba(0,6,12,0.55))' }} />
      {/* film grain (moves every frame) */}
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: 'overlay', backgroundImage: GRAIN, backgroundSize: '256px 256px', backgroundPosition: `${(frame * 73) % 256}px ${(frame * 151) % 256}px` }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.35, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='256' height='256' filter='url(%23n)'/></svg>")`;

/** Subtitles: Mukta ExtraBold, karaoke (the spoken word lights green), English names and numbers in gold. Hidden on frame 0. */
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
