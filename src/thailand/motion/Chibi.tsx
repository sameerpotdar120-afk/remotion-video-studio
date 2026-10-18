import React from 'react';
import { random } from 'remotion';
import { C, lerp } from './theme';

// A chibi figure rig (big round head, tube body, short legs), drawn in its own units: about 1000 tall, origin at the
// ground between the feet, facing right (+x). Mirror it with scale(-1, 1) to face left.
// Outfits: the British diplomat (red coat, gold trim, dark hair, whiskers), the French diplomat (navy uniform, white
// pith helmet, medals, moustache), the King of Siam (gold robe, tiered pointed crown; drawn with dignity), a British
// redcoat soldier (shako, white cross-belts, musket) and a Burmese soldier (head wrap, tunic, spear).

export type Outfit = 'brit' | 'fr' | 'king' | 'redcoat' | 'burmese';
export type Face = 'smile' | 'smirk' | 'frown' | 'angry' | 'oh' | 'calm';

export type Pose = {
  nx: number; ny: number; // near hand target, relative to the near shoulder
  fx: number; fy: number; // far hand target, relative to the far shoulder
  nb: number; fb: number; // elbow bend side for each arm (1 or -1; blends through 0 as a straight arm)
  stick: number; // 0..1, the stick (pointer, musket or spear) in the near hand
  stickA: number; // stick angle, degrees (0 = pointing +x, -90 = up)
  turn: number; // -1 (looks back, toward -x) .. 1 (full profile toward +x); 0.35 is a natural 3/4
  tilt: number; // head tilt, degrees
  lean: number; // upper body lean, degrees (+ toward +x)
  squint: number; // 0..1
  brow: number; // -1 (angry, inner down) .. 1 (raised, surprised)
  cross: number; // 0..1 arms crossed (far arm comes in front)
  dx: number; hop: number; // body offset and hop height (units)
  lookX: number; lookY: number;
  face: Face;
};

export const POSE0: Pose = { nx: 30, ny: 230, fx: -20, fy: 230, nb: 1, fb: -1, stick: 0, stickA: 60, turn: 0.35, tilt: 0, lean: 0, squint: 0, brow: 0, cross: 0,
  dx: 0, hop: 0, lookX: 0.4, lookY: 0, face: 'smile' };

// blend two poses; the face switches at the midpoint
export const blend = (a: Pose, b: Pose, t: number): Pose => {
  const o = { ...a } as Record<string, number | string>;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    const va = a[k], vb = b[k];
    o[k] = typeof va === 'number' && typeof vb === 'number' ? lerp(va, vb, t) : t < 0.5 ? va : vb;
  });
  return o as unknown as Pose;
};

type Look = { coat: string; trim: string; trousers: string; skin: string; hair: string; boot: string };
const LOOK: Record<Outfit, Look> = {
  brit: { coat: '#C8202C', trim: '#F2C24B', trousers: '#F4EFE3', skin: '#F7C9A6', hair: '#3A2418', boot: '#1A1210' },
  fr: { coat: '#1F2F6B', trim: '#F2C24B', trousers: '#B5232B', skin: '#EFC39E', hair: '#2A1A12', boot: '#1A1210' },
  king: { coat: '#E8B53A', trim: '#FFF0B8', trousers: '#B8862A', skin: '#D9A178', hair: '#1A1210', boot: '#7A5418' },
  redcoat: { coat: '#C8202C', trim: '#FFFFFF', trousers: '#F4EFE3', skin: '#F7C9A6', hair: '#3A2418', boot: '#1A1210' },
  burmese: { coat: '#F2EAD8', trim: '#8C1C2A', trousers: '#6A2A3A', skin: '#C98E66', hair: '#1A1210', boot: '#5A3A22' },
};

const BONE = 135;
const SH_Y = -470;
const HEAD: [number, number] = [0, -760];
const HR = 230;

const ik = (s: [number, number], h: [number, number], bend: number): [number, number] => {
  const dx = h[0] - s[0], dy = h[1] - s[1];
  const d = Math.min(Math.hypot(dx, dy), 2 * BONE - 0.01);
  const a = Math.atan2(dy, dx), off = Math.acos(d / (2 * BONE)) * bend;
  return [s[0] + Math.cos(a - off) * BONE, s[1] + Math.sin(a - off) * BONE];
};

const Arm: React.FC<{ s: [number, number]; h: [number, number]; bend: number; L: Look; gloves: boolean }> = ({ s, h, bend, L, gloves }) => {
  const e = ik(s, h, bend);
  const d = `M ${s[0]} ${s[1]} L ${e[0]} ${e[1]} L ${h[0]} ${h[1]}`;
  const a = Math.atan2(h[1] - e[1], h[0] - e[0]);
  const cx = h[0] - Math.cos(a) * 34, cy = h[1] - Math.sin(a) * 34;
  return (
    <g>
      <path d={d} stroke={C.ink} strokeWidth={84} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={L.coat} strokeWidth={66} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r={33} fill={L.trim} stroke={C.ink} strokeWidth={8} />
      <circle cx={h[0]} cy={h[1]} r={44} fill={gloves ? '#fff' : L.skin} stroke={C.ink} strokeWidth={9} />
    </g>
  );
};

const Stick: React.FC<{ h: [number, number]; a: number; k: number; outfit: Outfit }> = ({ h, a, k, outfit }) => {
  if (k < 0.01) return null;
  const r = (a * Math.PI) / 180;
  const len = outfit === 'redcoat' ? 520 : outfit === 'burmese' ? 640 : 360;
  const back = outfit === 'redcoat' ? 200 : outfit === 'burmese' ? 260 : 40;
  const x0 = h[0] - Math.cos(r) * back, y0 = h[1] - Math.sin(r) * back;
  const x1 = h[0] + Math.cos(r) * len * k, y1 = h[1] + Math.sin(r) * len * k;
  if (outfit === 'redcoat') {
    // musket: wooden stock, dark barrel, a bayonet glint
    const xm = h[0] + Math.cos(r) * len * 0.45 * k, ym = h[1] + Math.sin(r) * len * 0.45 * k;
    return (
      <g strokeLinecap="round">
        <path d={`M ${x0} ${y0} L ${xm} ${ym}`} stroke={C.ink} strokeWidth={46} />
        <path d={`M ${x0} ${y0} L ${xm} ${ym}`} stroke="#8A4E22" strokeWidth={32} />
        <path d={`M ${xm} ${ym} L ${x1} ${y1}`} stroke={C.ink} strokeWidth={24} />
        <path d={`M ${xm} ${ym} L ${x1} ${y1}`} stroke="#555B66" strokeWidth={12} />
      </g>
    );
  }
  if (outfit === 'burmese') {
    const tip = 70;
    return (
      <g strokeLinecap="round">
        <path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke={C.ink} strokeWidth={28} />
        <path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke="#A06A34" strokeWidth={14} />
        <path d={`M ${x1 + Math.cos(r) * tip} ${y1 + Math.sin(r) * tip} L ${x1 - Math.sin(r) * 22} ${y1 + Math.cos(r) * 22} L ${x1 + Math.sin(r) * 22} ${y1 - Math.cos(r) * 22} Z`}
          fill="#D8DDE4" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      </g>
    );
  }
  return (
    <g strokeLinecap="round">
      <path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke={C.ink} strokeWidth={26} />
      <path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke="#7A4A26" strokeWidth={14} />
      <circle cx={x1} cy={y1} r={13} fill="#fff" stroke={C.ink} strokeWidth={7} />
    </g>
  );
};

const Hat: React.FC<{ outfit: Outfit; L: Look; turn: number }> = ({ outfit, L, turn }) => {
  const [hx, hy] = HEAD;
  const o = turn * 30;
  if (outfit === 'brit') {
    // dark swept hair and mutton-chop whiskers
    return (
      <g>
        <path d={`M ${hx - HR * 0.98} ${hy - 10} C ${hx - HR} ${hy - HR * 1.15} ${hx + HR * 0.9} ${hy - HR * 1.25} ${hx + HR * 1.0} ${hy - 40}
          C ${hx + HR * 0.7} ${hy - HR * 0.75} ${hx + o} ${hy - HR * 0.7} ${hx - HR * 0.5} ${hy - HR * 0.55} C ${hx - HR * 0.7} ${hy - HR * 0.3} ${hx - HR * 0.8} ${hy} ${hx - HR * 0.98} ${hy - 10} Z`}
          fill={L.hair} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
        <path d={`M ${hx - HR * 0.72 + o} ${hy - 60} L ${hx - HR * 0.66 + o} ${hy + 70}`} stroke={L.hair} strokeWidth={44} strokeLinecap="round" />
      </g>
    );
  }
  if (outfit === 'fr') {
    // white colonial pith helmet: dome, band, brim and a small spike
    return (
      <g stroke={C.ink} strokeWidth={10} strokeLinejoin="round">
        <path d={`M ${hx - HR * 1.12} ${hy - HR * 0.42} Q ${hx} ${hy - HR * 0.62} ${hx + HR * 1.18} ${hy - HR * 0.38} Q ${hx + HR * 1.25} ${hy - HR * 0.22} ${hx + HR * 1.05} ${hy - HR * 0.25}
          Q ${hx} ${hy - HR * 0.45} ${hx - HR * 1.02} ${hy - HR * 0.27} Z`} fill="#F7F3E8" />
        <path d={`M ${hx - HR * 0.86} ${hy - HR * 0.47} C ${hx - HR * 0.9} ${hy - HR * 1.4} ${hx + HR * 0.9} ${hy - HR * 1.4} ${hx + HR * 0.88} ${hy - HR * 0.47} Z`} fill="#FBF8F0" />
        <path d={`M ${hx - HR * 0.86} ${hy - HR * 0.55} Q ${hx} ${hy - HR * 0.68} ${hx + HR * 0.88} ${hy - HR * 0.55}`} stroke="#1F2F6B" strokeWidth={30} fill="none" />
        <circle cx={hx} cy={hy - HR * 1.18} r={18} fill={L.trim} />
      </g>
    );
  }
  if (outfit === 'king') {
    // a tiered, pointed golden crown (chada style) with a jewel
    return (
      <g stroke={C.ink} strokeWidth={9} strokeLinejoin="round">
        <path d={`M ${hx - HR * 0.78} ${hy - HR * 0.5} L ${hx + HR * 0.78} ${hy - HR * 0.5} L ${hx + HR * 0.62} ${hy - HR * 0.82} L ${hx - HR * 0.62} ${hy - HR * 0.82} Z`} fill="#F2B632" />
        <path d={`M ${hx - HR * 0.6} ${hy - HR * 0.82} L ${hx + HR * 0.6} ${hy - HR * 0.82} L ${hx + HR * 0.4} ${hy - HR * 1.2} L ${hx - HR * 0.4} ${hy - HR * 1.2} Z`} fill="#F6C84A" />
        <path d={`M ${hx - HR * 0.38} ${hy - HR * 1.2} L ${hx + HR * 0.38} ${hy - HR * 1.2} L ${hx + HR * 0.2} ${hy - HR * 1.6} L ${hx - HR * 0.2} ${hy - HR * 1.6} Z`} fill="#F9D865" />
        <path d={`M ${hx - HR * 0.2} ${hy - HR * 1.6} L ${hx + HR * 0.2} ${hy - HR * 1.6} L ${hx} ${hy - HR * 2.25} Z`} fill="#FBE27A" />
        <circle cx={hx} cy={hy - HR * 0.66} r={20} fill="#D2232A" />
        <path d={`M ${hx - HR * 0.78} ${hy - HR * 0.5} Q ${hx - HR * 1.02} ${hy - HR * 0.3} ${hx - HR * 0.92} ${hy} M ${hx + HR * 0.78} ${hy - HR * 0.5} Q ${hx + HR * 1.02} ${hy - HR * 0.3} ${hx + HR * 0.92} ${hy}`}
          stroke="#F2B632" strokeWidth={26} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (outfit === 'redcoat') {
    // black shako with a white plume
    return (
      <g stroke={C.ink} strokeWidth={9} strokeLinejoin="round">
        <path d={`M ${hx - HR * 0.72} ${hy - HR * 0.45} L ${hx + HR * 0.72} ${hy - HR * 0.45} L ${hx + HR * 0.62} ${hy - HR * 1.25} L ${hx - HR * 0.62} ${hy - HR * 1.25} Z`} fill="#15151C" />
        <path d={`M ${hx - HR * 0.9} ${hy - HR * 0.45} L ${hx + HR * 1.05} ${hy - HR * 0.4}`} stroke="#15151C" strokeWidth={30} strokeLinecap="round" />
        <rect x={hx - 30} y={hy - HR * 0.95} width={60} height={60} rx={10} fill="#F2C24B" />
        <ellipse cx={hx} cy={hy - HR * 1.42} rx={34} ry={56} fill="#fff" />
      </g>
    );
  }
  // burmese: a wrapped head cloth (gaung baung) with the knot on the side
  return (
    <g stroke={C.ink} strokeWidth={9} strokeLinejoin="round">
      <path d={`M ${hx - HR * 0.98} ${hy - HR * 0.25} C ${hx - HR * 1.0} ${hy - HR * 1.15} ${hx + HR} ${hy - HR * 1.15} ${hx + HR * 0.98} ${hy - HR * 0.25}
        Q ${hx} ${hy - HR * 0.5} ${hx - HR * 0.98} ${hy - HR * 0.25} Z`} fill="#F4EBD8" />
      <path d={`M ${hx - HR * 0.6} ${hy - HR * 0.8} Q ${hx} ${hy - HR * 0.6} ${hx + HR * 0.6} ${hy - HR * 0.8}`} stroke="#C9B48E" strokeWidth={12} fill="none" />
      <path d={`M ${hx + HR * 0.6} ${hy - HR * 0.75} q 120 -60 150 30 q -60 0 -120 30 Z`} fill="#F4EBD8" />
    </g>
  );
};

export type ChibiProps = { outfit: Outfit; pose: Pose; f: number; talk?: number; seed?: string };

const blinkAt = (f: number, seed: string) => {
  let t = 15 + random(seed) * 50;
  let i = 0;
  while (t < f - 8 && i < 400) t += 150 + random(`${seed}-${i++}`) * 100;
  const k = f - t;
  return k >= 0 && k < 7 ? Math.sin((k / 7) * Math.PI) : 0;
};

export const Chibi: React.FC<ChibiProps> = ({ outfit, pose: p, f, talk = 0, seed = outfit }) => {
  const L = LOOK[outfit];
  const gloves = outfit === 'brit' || outfit === 'fr' || outfit === 'redcoat';
  const [hx, hy] = HEAD;
  const blink = blinkAt(f, seed);
  const lid = Math.min(1, Math.max(p.squint * 0.55, blink));
  const fc = hx + 40 + p.turn * 75; // face centre x
  const eyeY = hy - 10;
  const er = 46;
  const eyes = [fc - 64 + p.turn * 10, fc + 64 - p.turn * 18];
  const nearS: [number, number] = [118, SH_Y];
  const farS: [number, number] = [-118, SH_Y];
  const nearH: [number, number] = [nearS[0] + p.nx, nearS[1] + p.ny];
  const farH: [number, number] = [farS[0] + p.fx, farS[1] + p.fy];
  const robe = outfit === 'king';
  const body = (
    <g>
      {robe
        ? <path d="M -170 -520 Q -200 -260 -235 -40 Q 0 -10 235 -40 Q 200 -260 170 -520 Q 0 -560 -170 -520 Z" fill={L.coat} stroke={C.ink} strokeWidth={12} strokeLinejoin="round" />
        : <rect x={-160} y={-540} width={320} height={420} rx={120} fill={L.coat} stroke={C.ink} strokeWidth={12} />}
      {robe && (
        <g>
          <path d="M -40 -520 L 0 -60 L 40 -520" fill="none" stroke={L.trim} strokeWidth={22} />
          <path d="M -225 -90 Q 0 -60 225 -90" fill="none" stroke="#B8862A" strokeWidth={26} />
          <path d="M -160 -470 Q 0 -400 160 -470" fill="none" stroke={L.trim} strokeWidth={30} />
          {[-110, 0, 110].map((x) => <circle key={x} cx={x} cy={-300} r={14} fill="#FFF0B8" />)}
        </g>
      )}
      {(outfit === 'brit' || outfit === 'fr') && (
        <g>
          <path d="M -30 -530 L -30 -130 M 30 -530 L 30 -130" stroke={L.trim} strokeWidth={14} />
          {[-460, -390, -320, -250].map((y) => <circle key={y} cx={78} cy={y} r={13} fill={L.trim} stroke={C.ink} strokeWidth={5} />)}
          <rect x={-162} y={-260} width={324} height={42} fill={outfit === 'brit' ? '#F4EFE3' : L.trim} stroke={C.ink} strokeWidth={8} />
          <path d="M -120 -540 Q 0 -500 120 -540" stroke={L.trim} strokeWidth={26} fill="none" strokeLinecap="round" />
        </g>
      )}
      {outfit === 'fr' && (
        <g>
          {[[-10, '#D2232A'], [40, '#F2C24B'], [90, '#3A7BD5']].map(([x, col]) => (
            <g key={x as number} transform={`translate(${-110 + (x as number) * 0.9} -420)`}>
              <rect x={-14} y={-26} width={28} height={30} fill={col as string} stroke={C.ink} strokeWidth={4} />
              <circle cy={22} r={17} fill="#F2C24B" stroke={C.ink} strokeWidth={5} />
            </g>
          ))}
          <ellipse cx={-150} cy={-505} rx={55} ry={24} fill={L.trim} stroke={C.ink} strokeWidth={7} />
          <ellipse cx={150} cy={-505} rx={55} ry={24} fill={L.trim} stroke={C.ink} strokeWidth={7} />
        </g>
      )}
      {outfit === 'redcoat' && <path d="M -140 -500 L 140 -200 M 140 -500 L -140 -200" stroke="#fff" strokeWidth={30} />}
      {outfit === 'burmese' && <path d="M -160 -300 H 160" stroke={L.trim} strokeWidth={36} />}
    </g>
  );
  const head = (
    <g transform={`rotate(${p.tilt} ${hx} ${hy + HR * 0.8})`}>
      <circle cx={hx - HR * 0.82 + p.turn * 30} cy={hy + 20} r={44} fill={L.skin} stroke={C.ink} strokeWidth={10} />
      <circle cx={hx} cy={hy} r={HR} fill={L.skin} stroke={C.ink} strokeWidth={12} />
      <ellipse cx={fc - 70} cy={hy + 95} rx={42} ry={24} fill="#F08A8A" opacity={0.45} />
      <ellipse cx={fc + 95} cy={hy + 95} rx={36} ry={22} fill="#F08A8A" opacity={0.45} />
      {eyes.map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy={eyeY} rx={er * 0.78} ry={er * (1 - lid)} fill="#fff" stroke={C.ink} strokeWidth={8} />
          {lid < 0.85 && <circle cx={x + p.lookX * 14} cy={eyeY + p.lookY * 12 + 4} r={er * 0.48 * Math.min(1, (1 - lid) * 1.4)} fill={C.ink} />}
          {lid < 0.6 && <circle cx={x + p.lookX * 14 - 8} cy={eyeY + p.lookY * 12 - 8} r={7} fill="#fff" />}
          <path d={`M ${x - 40} ${eyeY - 72 - p.brow * 18} L ${x + 40} ${eyeY - 72 - p.brow * 18}`} stroke={L.hair === '#1A1210' && outfit === 'king' ? '#1A1210' : L.hair}
            strokeWidth={18} strokeLinecap="round" transform={`rotate(${(i === 0 ? 1 : -1) * p.brow * -16} ${x} ${eyeY - 72})`} />
        </g>
      ))}
      <path d={`M ${fc + 6} ${hy + 30} q 22 22 -6 34`} stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
      {(() => {
        const mx = fc + 10, my = hy + 120, o = talk * 40;
        if (p.face === 'oh' || o > 6) return <ellipse cx={mx} cy={my} rx={30 + o * 0.2} ry={14 + o * 0.7} fill="#5A1520" stroke={C.ink} strokeWidth={8} />;
        if (p.face === 'frown') return <path d={`M ${mx - 38} ${my + 14} Q ${mx} ${my - 18} ${mx + 38} ${my + 14}`} stroke={C.ink} strokeWidth={10} fill="none" strokeLinecap="round" />;
        if (p.face === 'angry') return <path d={`M ${mx - 36} ${my} H ${mx + 36}`} stroke={C.ink} strokeWidth={11} strokeLinecap="round" />;
        if (p.face === 'smirk') return <path d={`M ${mx - 34} ${my + 6} Q ${mx + 10} ${my + 22} ${mx + 40} ${my - 14}`} stroke={C.ink} strokeWidth={10} fill="none" strokeLinecap="round" />;
        if (p.face === 'calm') return <path d={`M ${mx - 28} ${my} Q ${mx} ${my + 16} ${mx + 28} ${my}`} stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />;
        return <path d={`M ${mx - 42} ${my - 6} Q ${mx} ${my + 48} ${mx + 42} ${my - 6} Z`} fill="#5A1520" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />;
      })()}
      {outfit === 'fr' && (
        <path d={`M ${fc + 10} ${hy + 78} q -40 -22 -80 6 q -20 14 -36 -4 M ${fc + 10} ${hy + 78} q 40 -22 80 6 q 20 14 36 -4`} stroke={L.hair} strokeWidth={20} fill="none" strokeLinecap="round" />
      )}
      <Hat outfit={outfit} L={L} turn={p.turn} />
    </g>
  );
  const crossed = p.cross > 0.5;
  return (
    <g transform={`translate(${p.dx} ${-p.hop})`}>
      <ellipse cx={0} cy={p.hop - 6} rx={200 - p.hop * 0.3} ry={34} fill="#000" opacity={0.2} />
      {/* legs */}
      {[-62, 62].map((x) => (
        <g key={x}>
          <path d={`M ${x} -200 L ${x + 6} -40`} stroke={C.ink} strokeWidth={92} strokeLinecap="round" />
          <path d={`M ${x} -200 L ${x + 6} -40`} stroke={L.trousers} strokeWidth={74} strokeLinecap="round" />
          <path d={`M ${x - 40} -20 Q ${x + 6} -80 ${x + 78} -26 Q ${x + 84} 4 ${x - 40} 0 Z`} fill={L.boot} stroke={C.ink} strokeWidth={8} />
        </g>
      ))}
      <g transform={`rotate(${p.lean} 0 -200)`}>
        {!crossed && <Arm s={farS} h={farH} bend={p.fb} L={L} gloves={gloves} />}
        {body}
        {head}
        {crossed && <Arm s={farS} h={farH} bend={-p.fb} L={L} gloves={gloves} />}
        <Stick h={nearH} a={p.stickA} k={p.stick} outfit={outfit} />
        <Arm s={nearS} h={nearH} bend={p.nb} L={L} gloves={gloves} />
      </g>
    </g>
  );
};
