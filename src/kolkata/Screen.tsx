import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, merc, toScreen } from './cam';
import { HEAD, NUM, SUB } from './fonts';
import { COL } from './Plane';
import { Part, Rig, has, hinge, strike } from './Rig';

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
      <div style={{ fontSize: 30, letterSpacing: 2, clipPath: `inset(0 ${(1 - clamp01(write * 2)) * 100}% 0 0)` }}>FOUNDER:</div>
      <div style={{ fontSize: 40, clipPath: `inset(0 ${(1 - clamp01(write * 2 - 1)) * 100}% 0 0)` }}>JOB CHARNOCK</div>
      {xA > 0 && (
        <svg width={300} height={160} viewBox="0 0 420 220" style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) scale(${lerp(1.6, 1, xA)})`, overflow: 'visible' }}>
          <path d="M40 30 L380 190 M380 30 L40 190" stroke={COL.red} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={`${xA} 1`} style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))' }} />
        </svg>
      )}
    </div>
  );
};

const S = (c: Cam, at: P) => toScreen(c, at);

/** Scenes of rigged UE5 props. Each piece is its own cut-out, placed with a box [x, y, height] in units of the rig's
 *  height from its centre, and moved on its own pivot. A missing file is skipped. */
const Props: React.FC<{ t: number }> = ({ t }) => {
  // ---- today's street: the tram slides left along the tracks, the taxi drives right, wheels turning
  const street = (t0: number, t1: number) => {
    const taxiX = lerp(-0.95, 0.95, ramp(t, t0 + 0.3, t0 + 4.2, linear));
    const tramX = lerp(0.75, -0.55, ramp(t, t0 + 0.1, t0 + 5.0, linear));
    const spin = (t * 600) % 360;
    const bump = Math.sin(t * 15) * 0.003;
    return (
      <Rig set="k1" parts={[
        { name: 'street', box: [0, -0.02, 1] },
        { name: 'tram', box: [tramX, 0.06, 0.34], a: ramp(t, t0 + 0.1, t0 + 0.4) },
        { name: 'taxi', box: [taxiX, 0.33 + bump, 0.25], a: has('k2/taxi') ? 1 : 0 },
      ].map((p) => ({ ...p, set: p.name === 'street' ? 'k1' : p.name === 'tram' ? 'k3' : 'k2' } as Part))} x={540} y={1200} h={640} t={t} t0={t0} t1={t1} entry="rise">
        <TaxiWheels x={taxiX} y={0.33 + bump} h={0.25} spin={spin} H={640} />
      </Rig>
    );
  };
  // ---- villages: ground, three huts (one design, placed and mirrored), the banyan swaying; huts can lift away
  const village = (x: number, y: number, h: number, t0: number, t1: number, lift = 0, key = 'v') => (
    <Rig key={key} set="k4" parts={[
      { name: 'ground', box: [0, 0.2, 0.62] },
      { name: 'banyan', box: [-0.42, -0.2, 0.78], pivot: [0.5, 0.95], rot: Math.sin(t * 1.2 + x) * 1.4, dy: -lift * 1.3, a: 1 - lift },
      { name: 'palm', box: [0.52, -0.22, 0.72], pivot: [0.5, 0.97], rot: Math.sin(t * 1.8 + x) * 2.2, dy: -lift * 1.4, a: 1 - lift },
      { name: 'hut', box: [0.08, -0.02, 0.4], dy: -lift * 1.0, rot: lift * -8, a: 1 - lift },
      { name: 'hut', box: [0.4, 0.06, 0.34], flip: true, dy: -lift * 1.2, rot: lift * 6, a: 1 - lift },
      { name: 'hut', box: [-0.18, 0.12, 0.3], dy: -lift * 0.9, rot: lift * -4, a: 1 - lift },
    ]} x={x} y={y} h={h} t={t} t0={t0} t1={t1} entry="rise" />
  );
  const liftG = ramp(t, C.gobind6, C.khali6 + 0.2, easeIn);
  // ---- the rent: five coins spin down into the open pouch
  const coins: Part[] = [0, 1, 2, 3, 4].map((i) => {
    const t0 = C.n1300 + 0.1 + i * 0.28;
    const p = ramp(t, t0, t0 + 0.34, easeIn);
    return { name: 'coin', box: [lerp((i - 2) * 0.18, 0, p), lerp(-1.1, -0.12, p), 0.2], sx: Math.cos((t - t0) * 14) * (1 - p) + p * 0.3, rot: (1 - p) * 40, a: t > t0 && p < 1 ? 1 : 0 };
  });
  // ---- the deed: the top rod stays, the paper unrolls down behind the second rod; the quill writes; the seal stamps
  const unroll = ramp(t, C.y1698 + 0.2, C.company5 + 0.3, inOut);
  const sealS = strike(t, C.haq5 + 0.1);
  const writing = window4(t, C.company5, C.company5 + 0.2, C.sabarna5 + 0.8, C.haq5);
  // ---- the fort: it rises, then a close-up of the two gate doors swinging shut; then a cannon fires
  const gate = hinge(t, C.khali6 + 0.45, 0.12, 1, 0.6);
  const fireT = C.yahin7 + 0.15;
  const recoil = t > fireT ? Math.exp(-(t - fireT) * 6) * Math.sin(Math.min(Math.PI / 2, (t - fireT) * 30)) : 0;
  // ---- the family walks away up the path, getting smaller, with a small step bob
  const walk = (i: number, x0: number) => {
    const p = ramp(t, C.gobind6 + 0.1 + i * 0.12, C.khali6 + 0.7, linear);
    const s = lerp(1, 0.55, p);
    return { box: [x0 * s, lerp(0.1, -0.25, p) - Math.abs(Math.sin((t + i) * 6)) * 0.01, 0.62 * s] as [number, number, number] };
  };
  // ---- the gavel
  const gv = strike(t, C.court8 + 1.15);
  return (
    <>
      {street(0.15, C.teen1 - 0.15)}
      {village(220, 1150, 280, C.teen1, C.raj1 - 0.2, 0, 'v1')}
      {village(860, 1170, 280, C.teen1 + 0.15, C.raj1 - 0.2, 0, 'v3')}
      {village(540, 1350, 330, C.teen1 + 0.3, C.raj1 - 0.2, 0, 'v2')}
      <Rig set="k5" parts={[...coins, { name: 'pouch', box: [0, 0.12, 0.8] }]} x={540} y={1020} h={360} t={t} t0={C.n1300 - 0.05} t1={C.to1 - 0.1} entry="pop" />

      {/* Sutanuti: the charkha wheel spins; thread bales drop and stack */}
      <Rig set="k6" parts={[{ name: 'frame', box: [0.1, 0.2, 0.7] }, { name: 'wheel', box: [-0.15, -0.05, 0.85], rot: (t - C.sutanuti2) * 150 }]} x={330} y={1200} h={560} t={t} t0={C.soot2 - 0.1} t1={C.doosra3 - 0.1} entry="slideL" />
      <Rig set="k7" parts={[0, 1, 2].map((i) => {
        const t0 = C.soot2 + 0.3 + i * 0.25;
        const p = ramp(t, t0, t0 + 0.35, easeIn);
        return { name: 'bale', box: [i === 1 ? 0.18 : -0.12 + i * 0.05, lerp(-1.6, 0.2 - i * 0.28, p), 0.42], flip: i === 1, a: p > 0 ? 1 : 0 } as Part;
      })} x={790} y={1230} h={480} t={t} t0={C.soot2 + 0.2} t1={C.doosra3 - 0.1} entry="fade" />

      {/* Gobindapur, and later its emptying */}
      {village(540, 1240, 640, C.gobind3 - 0.1, C.teesra4 - 0.1, 0, 'vg')}
      {village(540, 1250, 620, C.fort6 - 0.1, C.khali6 + 0.3, liftG, 'vg2')}

      {/* Kalikata: the temple, its bell swinging in the frame beside the steps */}
      <Rig set="k8" parts={[
        { name: 'temple', box: [0, 0, 1] },
        { name: 'bell', box: [0.431, 0.135, 0.1], pivot: [0.5, 0.02], rot: Math.sin((t - C.kalikata4) * 5.5) * 16 * Math.exp(-Math.max(0, t - C.kali4) * 0.5) },
      ]} x={540} y={1180} h={720} t={t} t0={C.kalikata4 - 0.05} t1={C.hooghly5 - 0.15} entry="rise" />

      {/* the trading ship sails up the Hooghly, its sails breathing with the wind */}
      <Rig set="k9" parts={[
        { name: 'hull', box: [0, 0.1, 0.8] },
        { name: 'sails', box: [0.04, -0.1, 0.5], pivot: [0.5, 0.95], sx: 1 + 0.03 * Math.sin(t * 2.4), sy: 1 + 0.015 * Math.sin(t * 2.4 + 1) },
      ]} x={lerp(60, 600, ramp(t, C.hooghly5, C.y1698, linear))} y={1150 + Math.sin(t * 2.2) * 10} h={640} t={t} t0={C.hooghly5 + 0.1} t1={C.y1698 - 0.2} entry="slideL" tilt={Math.sin(t * 1.8) * 2} />

      {/* 1698: the deed unrolls, the quill writes, the seal stamps; two hands meet above it */}
      <Rig set="k10" parts={[
        { name: 'paper', box: [0, 0.02, 0.62], clip: [0, 0, 1 - unroll, 0] },
        { name: 'rod_bottom', box: [0, -0.29, 0.36] },
        { name: 'rod_bottom', box: [0, lerp(-0.29, 0.33, unroll), 0.36], flip: true },
        { name: 'quill', box: [0.45 + Math.sin(t * 3) * 0.04, -0.2, 0.55], pivot: [0.05, 0.95], rot: Math.sin(t * 9) * 4 * writing, a: ramp(t, C.company5 - 0.2, C.company5) },
        { name: 'seal', box: [0.42, 0.18, 0.24], dy: -sealS * 0.35, a: t > C.sabarna5 ? 1 : 0 },
      ]} x={540} y={1190} h={600} t={t} t0={C.y1698 - 0.1} t1={C.fort6 - 0.15} entry="rise" />
      <Rig set="k11" parts={(() => {
        const s = 1 - ramp(t, C.sabarna5 - 0.2, C.sabarna5 + 0.7, easeOut);
        return [{ name: 'hand_left', box: [-0.5 - s * 1.4, 0.02, 0.62] }, { name: 'hand_right', box: [0.52 + s * 1.4, -0.02, 0.55] }] as Part[];
      })()} x={540} y={760} h={340} t={t} t0={C.sabarna5 - 0.25} t1={C.fort6 - 0.15} entry="fade" shadow={false} float={0.4} />

      {/* Fort William rises on Gobindapur's ground; the family walks away; close-up: the gates swing shut; a cannon fires */}
      <Rig set="k12" parts={[{ name: 'fort', box: [0, 0, 1] }]} x={540} y={1150} h={560} t={t} t0={C.khali6 - 0.1} t1={C.yahin7 + 0.4} entry="rise" />
      <Rig set="k13" parts={[
        { name: 'grandmother', ...walk(2, -0.5) }, { name: 'mother_child', ...walk(1, 0.05) }, { name: 'father', ...walk(0, 0.55) },
      ]} x={540} y={1430} h={330} t={t} t0={C.gobind6} t1={C.khali6 + 0.7} entry="fade" float={0} />
      <Rig set="k12" parts={[
        { name: 'door', box: [-0.274, 0, 1], pivot: [0, 0.5], sx: gate },
        { name: 'door', box: [0.274, 0, 1], pivot: [1, 0.5], sx: gate, flip: true },
      ]} x={540} y={1120} h={760} t={t} t0={C.khali6 + 0.3} t1={C.yahin7 - 0.15} entry="pop" float={0.3} />
      <Rig set="k12" parts={[
        { name: 'carriage', box: [0, 0.12, 0.55] },
        { name: 'cannon_barrel', box: [0.06 - recoil * 0.12, -0.1, 0.4], pivot: [0.8, 0.5], rot: -6 + recoil * 4 },
      ]} x={560} y={1200} h={520} t={t} t0={C.yahin7 - 0.2} t1={C.yahin7 + 0.9} entry="slideR" />
      <MuzzleFlash t={t} t0={fireT} x={300} y={1150} />

      {/* the capital: a crown settles on its cushion */}
      <Rig set="k14" parts={[
        { name: 'cushion', box: [0, 0.22, 0.5] },
        { name: 'crown', box: [0, -0.12 - (1 - ramp(t, C.raj7, C.raj7 + 0.45, easeIn)) * 0.9, 0.62], dy: t > C.raj7 + 0.45 ? kick(t, C.raj7 + 0.45, 0.02, 22, 9) : 0 },
      ]} x={540} y={1180} h={480} t={t} t0={C.raj7 - 0.4} t1={C.kitab8 - 0.05} entry="pop" glow={COL.gold} />

      {/* the book (closed → open), then the High Court and the gavel */}
      <Rig set="k15" parts={[
        { name: 'closed', box: [0, 0, 0.9], a: 1 - ramp(t, C.kitab8 + 0.35, C.kitab8 + 0.6), sx: lerp(1, 0.2, ramp(t, C.kitab8 + 0.3, C.kitab8 + 0.6, easeIn)) },
        { name: 'open', box: [0, 0.05, 0.62], a: ramp(t, C.kitab8 + 0.45, C.kitab8 + 0.65), sx: lerp(0.3, 1, ramp(t, C.kitab8 + 0.45, C.kitab8 + 0.75, easeOut)) },
      ]} x={540} y={1180} h={600} t={t} t0={C.kitab8 - 0.05} t1={C.court8 + 1.9} entry="rise" sweep={false} />
      <BookText t={t} x={738} y={1150} />
      <Rig set="k16" parts={[{ name: 'court', box: [0, 0, 1] }]} x={540} y={680} h={420} t={t} t0={C.court8 - 0.05} t1={C.pehle8 + 0.2} entry="rise" />
      <Rig set="k17" parts={[
        { name: 'block', box: [-0.22, 0.26, 0.42] },
        { name: 'gavel', box: [0.12, -0.08, 0.5], pivot: [0.95, 0.55], rot: -gv * 38 },
      ]} x={820} y={1400} h={320} t={t} t0={C.court8 + 0.3} t1={C.pehle8 + 0.2} entry="slideR" />

      {/* the ending: the village becomes today's city on the same riverbank */}
      {village(540, 1250, 620, C.matlab9 - 0.05, C.hamesha9 + 0.3, 0, 'vend')}
      {street(C.hamesha9 - 0.1, C.to10 + 0.1)}
    </>
  );
};

/** The taxi's two wheels, in the rig's own space (H = rig height): turning cut-outs once k2/wheel exists, drawn in code until then.
 *  Wheel arches sit at 20% and 79% of the taxi's width, 78% down its height (measured on the cut-out). */
const TaxiWheels: React.FC<{ x: number; y: number; h: number; spin: number; H?: number }> = ({ x, y, h, spin, H = 720 }) => {
  const w = h * 2.8;
  const d = 0.12 * w * H;
  return (
    <>
      {[-0.3, 0.29].map((f, i) => {
        const cx = H / 2 + (x + f * w) * H, cy = H / 2 + (y + 0.28 * h) * H;
        return (
          <div key={i} style={{ position: 'absolute', left: cx - d / 2, top: cy - d / 2, width: d, height: d, transform: `rotate(${spin}deg)` }}>
            {has('k2/wheel') ? <img src={staticFile('kolkata/img/k2/wheel.png')} style={{ width: d, height: d }} /> : (
              <svg viewBox="-50 -50 100 100" width={d} height={d}>
                <defs><radialGradient id={`kkhub${i}`}><stop offset="0" stopColor="#f4f4f4" /><stop offset="1" stopColor="#8a8a8a" /></radialGradient></defs>
                <circle r={48} fill="#141414" stroke="#2a2a2a" strokeWidth={4} />
                <circle r={30} fill="#3a3a3a" />
                <circle r={24} fill={`url(#kkhub${i})`} />
                {[0, 72, 144, 216, 288].map((a) => <rect key={a} x={-2.5} y={-22} width={5} height={14} fill="#d8d8d8" transform={`rotate(${a})`} />)}
                <circle r={7} fill="#eee" />
              </svg>
            )}
          </div>
        );
      })}
    </>
  );
};

/** A cannon's muzzle flash and smoke puff, drawn in code. */
const MuzzleFlash: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const p = (t - t0) / 1.2;
  if (p < 0 || p > 1) return null;
  const flash = Math.max(0, 1 - p * 6);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)' }}>
      <div style={{ position: 'absolute', left: -160, top: -160, width: 320, height: 320, borderRadius: '50%', opacity: flash,
        background: 'radial-gradient(circle, #fff8d0 0%, #ffb347 30%, rgba(255,90,20,0.6) 55%, rgba(255,90,20,0) 72%)', transform: `scale(${0.6 + p * 2})` }} />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ position: 'absolute', left: -120 - i * 40 - p * 160, top: -110 + Math.sin(i * 2.1) * 50 - p * 60, width: 240, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,210,195,0.75), rgba(160,150,140,0) 70%)', opacity: (1 - p) * 0.9, transform: `scale(${0.5 + p * (1.4 + i * 0.2)})`, filter: 'blur(6px)' }} />
      ))}
    </div>
  );
};

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
