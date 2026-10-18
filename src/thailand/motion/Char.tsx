import React from 'react';
import { random } from 'remotion';
import { BRITAIN, FRANCE, SIAM, CountryShape } from './shapes';
import { C } from './theme';

// A country character in the countryball spirit, but with the real outline (Natural Earth): googly eyes, brows, a mouth,
// stick legs with shoes, and arms that are either sticks with white gloves or big cartoon flexing arms.
// Everything is in the shape's own units (long side 1000); <CountryChar> scales to `size` px for the body's height.
// Origin: the ground point between the feet. The character faces the viewer; `look` moves the pupils.

export type Who = 'britain' | 'france' | 'siam';
export type Mood = 'happy' | 'sad' | 'angry' | 'shifty' | 'scared' | 'smug';
// an arm: the hand's target relative to the shoulder (shape units), elbow bend side (1 / -1), and flex 0..1
export type Arm = { x: number; y: number; bend?: number; flex?: number; hide?: boolean };

type Rig = {
  shape: CountryShape;
  color: string;
  eye: [number, number]; // centre between the eyes
  gap: number; // half the distance between eye centres
  er: number; // eye radius
  mouth: [number, number];
  mw: number; // mouth half width
  sh: [[number, number], [number, number]]; // shoulders (left, right as seen)
  hip: [[number, number], [number, number]];
};

export const RIGS: Record<Who, Rig> = {
  britain: { shape: BRITAIN, color: C.brit, eye: [180, 640], gap: 66, er: 56, mouth: [186, 770], mw: 52,
    sh: [[96, 700], [262, 700]], hip: [[150, 935], [232, 905]] },
  france: { shape: FRANCE, color: C.fr, eye: [560, 400], gap: 140, er: 92, mouth: [565, 600], mw: 105,
    sh: [[300, 560], [905, 520]], hip: [[440, 950], [670, 950]] },
  siam: { shape: SIAM, color: C.siam, eye: [272, 268], gap: 82, er: 62, mouth: [282, 405], mw: 60,
    sh: [[70, 330], [505, 420]], hip: [[268, 972], [318, 990]] },
};

const LEG = 230;

// two-bone IK: elbow for shoulder s → hand h with both bones of length l
const elbow = (s: [number, number], h: [number, number], l: number, bend: number): [number, number] => {
  const dx = h[0] - s[0], dy = h[1] - s[1];
  const d = Math.min(Math.hypot(dx, dy), 2 * l - 0.01);
  const a = Math.atan2(dy, dx);
  const off = Math.acos(d / (2 * l)) * bend;
  return [s[0] + Math.cos(a - off) * l, s[1] + Math.sin(a - off) * l];
};

const Glove: React.FC<{ x: number; y: number; r: number; a: number }> = ({ x, y, r, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <ellipse cx={r * 0.55} cy={-r * 0.55} rx={r * 0.42} ry={r * 0.3} fill={C.glove} stroke={C.ink} strokeWidth={r * 0.2} transform={`rotate(-40 ${r * 0.55} ${-r * 0.55})`} />
    <circle r={r} fill={C.glove} stroke={C.ink} strokeWidth={r * 0.22} />
    <path d={`M ${-r * 0.2} ${-r * 0.35} Q ${r * 0.25} ${-r * 0.05} ${-r * 0.1} ${r * 0.45}`} stroke={C.ink} strokeWidth={r * 0.1} fill="none" strokeLinecap="round" opacity={0.5} />
  </g>
);

const ArmPath: React.FC<{ s: [number, number]; arm: Arm; color: string; scale: number }> = ({ s, arm, color, scale }) => {
  if (arm.hide) return null;
  const flex = arm.flex ?? 0;
  const h: [number, number] = [s[0] + arm.x, s[1] + arm.y];
  const l = (150 + 40 * flex) * scale;
  const e = elbow(s, h, l, arm.bend ?? 1);
  const handA = (Math.atan2(h[1] - e[1], h[0] - e[0]) * 180) / Math.PI;
  const thin = 18 * scale;
  if (flex < 0.02) {
    return (
      <g>
        <path d={`M ${s[0]} ${s[1]} L ${e[0]} ${e[1]} L ${h[0]} ${h[1]}`} stroke={C.ink} strokeWidth={thin} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Glove x={h[0]} y={h[1]} r={34 * scale} a={handA} />
      </g>
    );
  }
  // a big cartoon arm: thick capsule bones in the body colour, a bicep bump on the upper arm's outer side
  const up = 54 * flex * scale + thin, fo = 40 * flex * scale + thin;
  const mx = (s[0] + e[0]) / 2, my = (s[1] + e[1]) / 2;
  const ux = e[0] - s[0], uy = e[1] - s[1], ul = Math.hypot(ux, uy) || 1;
  const nx = (-uy / ul) * -(arm.bend ?? 1), ny = (ux / ul) * -(arm.bend ?? 1);
  const br = 62 * flex * scale;
  const bx = mx + nx * up * 0.42, by = my + ny * up * 0.42;
  const pieces = (w: number, col: string) => (
    <g stroke={col} fill={col} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M ${s[0]} ${s[1]} L ${e[0]} ${e[1]}`} strokeWidth={up + w} fill="none" />
      <path d={`M ${e[0]} ${e[1]} L ${h[0]} ${h[1]}`} strokeWidth={fo + w} fill="none" />
      <circle cx={bx} cy={by} r={br + w / 2} stroke="none" />
    </g>
  );
  return (
    <g>
      {pieces(14 * scale, C.ink)}
      {pieces(0, color)}
      <path d={`M ${bx - br * 0.5} ${by - br * 0.45} Q ${bx} ${by - br * 0.85} ${bx + br * 0.5} ${by - br * 0.45}`} stroke="#fff" strokeOpacity={0.45} strokeWidth={10 * scale} fill="none" strokeLinecap="round" />
      <Glove x={h[0]} y={h[1]} r={(40 + 12 * flex) * scale} a={handA} />
    </g>
  );
};

const Eye: React.FC<{ x: number; y: number; r: number; look: number; lookY: number; lid: number; lidTilt: number; color: string; uid: string }> = (
  { x, y, r, look, lookY, lid, lidTilt, color, uid }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs><clipPath id={uid}><ellipse rx={r} ry={r * 1.15} /></clipPath></defs>
    <ellipse rx={r} ry={r * 1.15} fill="#fff" />
    <g clipPath={`url(#${uid})`}>
      <circle cx={look * r * 0.42} cy={lookY * r * 0.42 + r * 0.08} r={r * 0.5} fill={C.ink} />
      <circle cx={look * r * 0.42 - r * 0.17} cy={lookY * r * 0.42 - r * 0.12} r={r * 0.15} fill="#fff" />
      {/* the upper lid: a body-coloured cap that comes down by `lid` (0 open, 1 shut) and tilts for moods */}
      <rect x={-r * 1.6} y={-r * 2.4} width={r * 3.2} height={r * 1.25 + lid * r * 2.3} fill={color} transform={`rotate(${lidTilt})`} />
    </g>
    <ellipse rx={r} ry={r * 1.15} fill="none" stroke={C.ink} strokeWidth={r * 0.14} />
  </g>
);

const Mouth: React.FC<{ x: number; y: number; w: number; mood: Mood; talk: number }> = ({ x, y, w, mood, talk }) => {
  const sw = w * 0.16;
  const open = talk * w * 0.7;
  const dark = '#3A0D16';
  let d: React.ReactNode;
  if (mood === 'happy') {
    const hh = w * 0.55 + open * 0.6;
    d = (<g>
      <path d={`M ${-w} 0 Q 0 ${hh * 1.6} ${w} 0 Q 0 ${hh * 0.35} ${-w} 0 Z`} fill={dark} stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
      <ellipse cx={w * 0.1} cy={hh * 0.72} rx={w * 0.38} ry={hh * 0.22} fill="#F06A7A" />
    </g>);
  } else if (mood === 'sad') {
    d = open > 2
      ? <ellipse cy={w * 0.15} rx={w * 0.45} ry={w * 0.12 + open * 0.5} fill={dark} stroke={C.ink} strokeWidth={sw} />
      : <path d={`M ${-w * 0.8} ${w * 0.35} Q 0 ${-w * 0.35} ${w * 0.8} ${w * 0.35}`} stroke={C.ink} strokeWidth={sw} fill="none" strokeLinecap="round" />;
  } else if (mood === 'angry') {
    const hh = w * 0.28 + open * 0.5;
    d = (<g>
      <rect x={-w * 0.8} y={-hh / 2} width={w * 1.6} height={hh} rx={hh * 0.3} fill="#fff" stroke={C.ink} strokeWidth={sw} />
      <path d={`M ${-w * 0.8} 0 H ${w * 0.8} M ${-w * 0.27} ${-hh / 2} V ${hh / 2} M ${w * 0.27} ${-hh / 2} V ${hh / 2}`} stroke={C.ink} strokeWidth={sw * 0.55} />
    </g>);
  } else if (mood === 'scared') {
    d = <ellipse rx={w * 0.38} ry={w * 0.42 + open * 0.4} fill={dark} stroke={C.ink} strokeWidth={sw} />;
  } else {
    // shifty / smug: a lopsided smirk, opening a little when talking
    d = open > 2
      ? <path d={`M ${-w * 0.7} ${w * 0.05} Q ${w * 0.1} ${w * 0.25 + open} ${w * 0.8} ${-w * 0.25} Q ${w * 0.05} ${w * 0.2} ${-w * 0.7} ${w * 0.05} Z`} fill={dark} stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
      : <path d={`M ${-w * 0.7} ${w * 0.1} Q ${w * 0.1} ${w * 0.4} ${w * 0.8} ${-w * 0.25}`} stroke={C.ink} strokeWidth={sw} fill="none" strokeLinecap="round" />;
  }
  return <g transform={`translate(${x} ${y})`}>{d}</g>;
};

// mood → [lid amount, lid tilt for the left eye in degrees (mirrored for the right), brow tilt, brow lift]
const FACE: Record<Mood, [number, number, number, number]> = {
  happy: [0.05, 0, -6, 0.15],
  sad: [0.32, -14, -18, 0],
  angry: [0.3, 18, 24, -0.1],
  shifty: [0.42, 0, 4, 0],
  scared: [0, 0, -14, 0.35],
  smug: [0.38, -6, 8, 0.05],
};

export type CharProps = {
  who: Who;
  size: number; // body height in px
  f: number; // frame, for blinks
  mood?: Mood;
  look?: number;
  lookY?: number;
  talk?: number; // mouth open 0..1
  armL?: Arm;
  armR?: Arm;
  legs?: { phase?: number; stride?: number; spread?: number; lift?: number };
  bob?: number; // body bob in shape units
  squash?: number; // 1 = none
  tilt?: number; // whole-body rock in degrees, about the feet
  shadow?: boolean;
  blinkSeed?: string;
};

// blink: every 2.4–4 s for 7 frames, timed by a seeded random sequence so each character blinks on its own beat
const blinkAt = (f: number, seed: string) => {
  let t = 20 + random(seed) * 60;
  let i = 0;
  while (t < f - 8 && i < 400) t += 144 + random(`${seed}-${i++}`) * 96;
  const k = f - t;
  return k >= 0 && k < 7 ? Math.sin((k / 7) * Math.PI) : 0;
};

export const CountryChar: React.FC<CharProps> = (p) => {
  const rig = RIGS[p.who];
  const { w, h, d } = rig.shape;
  const s = p.size / h;
  const mood = p.mood ?? 'happy';
  const [lid, lidTilt, browTilt, browLift] = FACE[mood];
  const blink = blinkAt(p.f, p.blinkSeed ?? p.who);
  const L = p.legs ?? {};
  const uid = `${p.who}-${p.blinkSeed ?? ''}`;
  const bob = p.bob ?? 0;
  const sq = p.squash ?? 1;
  const leg = (i: 0 | 1) => {
    const hp = rig.hip[i];
    const side = i === 0 ? -1 : 1;
    const ph = (L.phase ?? 0) + i * Math.PI;
    const fx = hp[0] + side * (L.spread ?? 30) + Math.sin(ph) * (L.stride ?? 0);
    const fy = h + LEG - Math.max(0, Math.cos(ph)) * (L.lift ?? 0);
    return (
      <g key={i}>
        <path d={`M ${hp[0]} ${hp[1]} L ${fx} ${fy - 18}`} stroke={C.ink} strokeWidth={20} strokeLinecap="round" />
        <ellipse cx={fx + side * 30} cy={fy - 16} rx={58} ry={28} fill={C.ink} />
        <ellipse cx={fx + side * 18} cy={fy - 30} rx={22} ry={8} fill="#fff" opacity={0.35} />
      </g>
    );
  };
  const [ex, ey] = rig.eye;
  const brow = (i: 0 | 1) => {
    const side = i === 0 ? -1 : 1;
    const cx = ex + side * rig.gap, cy = ey - rig.er * (1.45 + browLift);
    return <path key={i} d={`M ${cx - rig.er * 0.7} ${cy} L ${cx + rig.er * 0.7} ${cy}`} stroke={C.ink} strokeWidth={rig.er * 0.28} strokeLinecap="round"
      transform={`rotate(${browTilt * -side} ${cx} ${cy})`} />;
  };
  return (
    <g transform={`rotate(${p.tilt ?? 0}) scale(${s}) translate(${-w / 2} ${-(h + LEG)})`}>
      {p.shadow !== false && <ellipse cx={w / 2} cy={h + LEG - 10} rx={w * 0.55} ry={46} fill="#000" opacity={0.18} />}
      {leg(0)}{leg(1)}
      <g transform={`translate(0 ${bob}) translate(${w / 2} ${h}) scale(${1 / Math.sqrt(sq)} ${sq}) translate(${-w / 2} ${-h})`}>
        <defs>
          <linearGradient id={`sh-${uid}`} x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.32} />
            <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.22} />
          </linearGradient>
        </defs>
        <path d={d} fill={rig.color} stroke={C.ink} strokeWidth={16} strokeLinejoin="round" />
        <path d={d} fill={`url(#sh-${uid})`} />
        <Eye x={ex - rig.gap} y={ey} r={rig.er} look={p.look ?? 0} lookY={p.lookY ?? 0} lid={Math.max(lid, blink)} lidTilt={lidTilt} color={rig.color} uid={`el-${uid}`} />
        <Eye x={ex + rig.gap} y={ey} r={rig.er} look={p.look ?? 0} lookY={p.lookY ?? 0} lid={Math.max(mood === 'smug' ? lid * 0.6 : lid, blink)} lidTilt={-lidTilt} color={rig.color} uid={`er-${uid}`} />
        {brow(0)}{brow(1)}
        <Mouth x={rig.mouth[0]} y={rig.mouth[1]} w={rig.mw} mood={mood} talk={p.talk ?? 0} />
        {p.armL && <ArmPath s={rig.sh[0]} arm={p.armL} color={rig.color} scale={1} />}
        {p.armR && <ArmPath s={rig.sh[1]} arm={p.armR} color={rig.color} scale={1} />}
      </g>
    </g>
  );
};

// a hand's position relative to the character's origin (ground between the feet), in px, ignoring bob and squash
export const handPos = (who: Who, size: number, side: 0 | 1, arm: Arm, tilt = 0): [number, number] => {
  const rig = RIGS[who];
  const s = size / rig.shape.h;
  const x = (rig.sh[side][0] + arm.x - rig.shape.w / 2) * s, y = (rig.sh[side][1] + arm.y - (rig.shape.h + LEG)) * s;
  const a = (tilt * Math.PI) / 180;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
};

// a talking mouth flap for a line: 0 outside [a, b], a lively 0..1 inside
export const talkAt = (f: number, a: number, b: number, seed = 't') => {
  if (f < a || f > b) return 0;
  const k = f - a;
  return Math.max(0, Math.sin(k * 0.55 + random(seed) * 6) * 0.5 + Math.sin(k * 0.23) * 0.3 + 0.35) * Math.min(1, k / 4, (b - f) / 4);
};
