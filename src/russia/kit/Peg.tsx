import React from 'react';
import { Img, useCurrentFrame } from 'remotion';
import RIGS from './rigs.generated.json';
import { Face, moodAt, type Mood, type Talk } from '../../lib/character/Face';
import { ease, loop, ramp, wobble } from '../../lib/easing';
import { RC, aa, has, ra, lifeScale } from './core';

/**
 * Peg-doll character for the Russia video (same family as America's Puppet), everything animated on 1s @60:
 *  - body: generated PNG (blank face, no limbs) → rig from prep script; until it arrives, a code-drawn
 *    peg doll in the character's colours (so every preview already moves correctly)
 *  - face: dot eyes, blinks, brows, lip-flap (Face)
 *  - arms: noodle (rubber-hose) arms with white cartoon gloves; poses keyed in frames, eased with overshoot
 *  - legs: stick legs (reference cast, §5) that walk while the character travels; feet plant when idle
 *  - travel: x/y keyframes, walking bob; squash on landing; optional hop
 * x, y = FEET (bottom centre) in px, height = full on-screen height including legs.
 */

export type Hat = 'none' | 'fur' | 'tall' | 'crown' | 'helmet' | 'ushanka' | 'tricorne' | 'bicorne' | 'cap' | 'hood' | 'kokoshnik' | 'shako';
export type Look = { coat: string; trim?: string; hat?: Hat; hatColor?: string; hair?: string; beard?: string; skin?: string; scarf?: string };
export type Gesture = 'down' | 'present' | 'point' | 'fingerUp' | 'shrug' | 'chin' | 'handsHead' | 'wave' | 'hold' | 'fist' | 'cheer' | 'hips';
export type Step = { at: number; x: number; y?: number; dur?: number };

type Rig = { aspect: number; face: { x: number; y: number; w: number }; shoulderL: [number, number]; shoulderR: [number, number] };
const rigOf = (src?: string): Rig | null => (src && has(src) ? ((RIGS as unknown as Record<string, Rig>)[src.split('/').pop()!] ?? null) : null);

const DEFAULT_RIG: Rig = { aspect: 0.62, face: { x: 0.5, y: 0.25, w: 0.62 }, shoulderL: [0.2, 0.55], shoulderR: [0.8, 0.55] };

/** Arm pose per gesture for the RIGHT arm (character facing +x); the left mirrors where noted. angle deg (0 = forward, −90 = up). */
const POSE: Record<Gesture, { R: [number, number, string]; L: [number, number, string] }> = {
  down: { R: [80, 0.55, 'fist'], L: [100, 0.55, 'fist'] },
  present: { R: [-12, 0.95, 'open'], L: [100, 0.55, 'fist'] },
  point: { R: [-22, 1.0, 'point'], L: [100, 0.55, 'fist'] },
  fingerUp: { R: [-78, 0.62, 'pointUp'], L: [100, 0.55, 'fist'] },
  shrug: { R: [-40, 0.55, 'open'], L: [-140, 0.55, 'open'] },
  chin: { R: [-118, 0.5, 'fist'], L: [96, 0.5, 'fist'] },
  handsHead: { R: [-62, 0.78, 'open'], L: [-118, 0.78, 'open'] },
  wave: { R: [-70, 0.85, 'open'], L: [100, 0.55, 'fist'] },
  hold: { R: [10, 0.6, 'hold'], L: [100, 0.55, 'fist'] },
  fist: { R: [-70, 0.8, 'fist'], L: [100, 0.55, 'fist'] },
  cheer: { R: [-60, 0.9, 'fist'], L: [-120, 0.9, 'fist'] },
  hips: { R: [140, 0.42, 'fist'], L: [40, 0.42, 'fist'] },
};

const gestureAt = (frame: number, g: [number, Gesture][]) => {
  let cur: Gesture = g.length ? g[0][1] : 'down', prev: Gesture = cur, since = -999;
  for (const [f, x] of g) if (frame >= f) { prev = cur; cur = x; since = f; }
  return { cur, prev, t: ramp(frame, since, 9, ease.out), since };
};

const HatSvg: React.FC<{ hat: Hat; c: string; w: number }> = ({ hat, c, w }) => {
  // drawn in a 100×100 box centred on the head top; w = head width
  const s = { position: 'absolute' as const, left: -w * 0.35, top: -w * 0.62, width: w * 1.7, height: w * 1.1, overflow: 'visible' as const };
  const ol = { stroke: RC.ink, strokeWidth: 2.2, strokeLinejoin: 'round' as const };
  switch (hat) {
    case 'ushanka':
      return (<svg viewBox="0 0 170 110" style={s}>
        <path d="M30 70 Q28 18 85 14 Q142 18 140 70 Z" fill={c} {...ol} />
        <path d="M26 66 Q85 50 144 66 L146 82 Q85 68 24 82 Z" fill="#7A5232" {...ol} />
        <path d="M24 74 Q6 80 2 100 Q16 104 34 92 Z" fill="#7A5232" {...ol} />
        <path d="M146 74 Q164 80 168 100 Q154 104 136 92 Z" fill="#7A5232" {...ol} /></svg>);
    case 'tall':
      return (<svg viewBox="0 0 170 110" style={{ ...s, top: -w * 1.25, height: w * 1.75 }}><path d="M40 108 L46 6 Q85 -4 124 6 L130 108 Z" fill={c} {...ol} /></svg>);
    case 'crown':
      return (<svg viewBox="0 0 170 110" style={s}><path d="M36 74 Q34 30 85 22 Q136 30 134 74 Z" fill="#D9A520" {...ol} />
        <path d="M30 68 Q85 56 140 68 L140 84 Q85 72 30 84 Z" fill="#3B2A1E" {...ol} /><path d="M85 2 L85 22 M76 10 L94 10" stroke="#D9A520" strokeWidth={6} /></svg>);
    case 'helmet':
      return (<svg viewBox="0 0 170 110" style={s}><path d="M34 76 Q36 22 85 8 Q134 22 136 76 Z" fill="#9AA0A6" {...ol} /><path d="M85 8 L85 -8" stroke="#9AA0A6" strokeWidth={6} /></svg>);
    case 'fur':
      return (<svg viewBox="0 0 170 110" style={s}><path d="M34 78 Q30 30 85 26 Q140 30 136 78 Q85 66 34 78 Z" fill={c} {...ol} /></svg>);
    case 'tricorne':
      return (<svg viewBox="0 0 170 110" style={s}><path d="M8 66 Q85 10 162 66 Q120 54 85 58 Q50 54 8 66 Z" fill={c} {...ol} /></svg>);
    case 'bicorne':
      return (<svg viewBox="0 0 170 110" style={s}><path d="M4 70 Q40 20 85 18 Q130 20 166 70 Q85 56 4 70 Z" fill={c} {...ol} /></svg>);
    case 'cap':
      return (<svg viewBox="0 0 170 110" style={s}><path d="M34 70 Q36 36 85 32 Q134 36 136 70 Z" fill={c} {...ol} /><path d="M86 66 Q130 62 156 74 L88 76 Z" fill={RC.ink} /></svg>);
    case 'shako':
      return (<svg viewBox="0 0 170 110" style={{ ...s, top: -w * 0.95, height: w * 1.45 }}><path d="M44 104 L48 8 L122 8 L126 104 Z" fill={c} {...ol} /><circle cx="85" cy="40" r="10" fill="#D9A520" /></svg>);
    case 'hood':
      return (<svg viewBox="0 0 170 110" style={{ ...s, top: -w * 0.5 }}><path d="M22 110 Q20 10 85 4 Q150 10 148 110 L132 110 Q134 40 85 34 Q36 40 38 110 Z" fill={c} {...ol} /></svg>);
    case 'kokoshnik':
      return (<svg viewBox="0 0 170 110" style={s}><path d="M30 76 Q85 -10 140 76 Z" fill={c} {...ol} /><path d="M40 74 Q85 6 130 74" fill="none" stroke="#F4E9C8" strokeWidth={4} strokeDasharray="2 6" /></svg>);
    default:
      return null;
  }
};

/** Code-drawn peg doll in the reference's flat colours: used until the generated PNG is installed. */
const FallbackBody: React.FC<{ look: Look; w: number; h: number }> = ({ look, w, h }) => {
  const skin = look.skin ?? '#F3DCC4';
  const head = w * 0.92;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={w} height={h} viewBox={`0 0 100 ${(h / w) * 100}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {(() => {
          const H2 = (h / w) * 100;
          const top = H2 * 0.42;
          return (
            <g stroke={RC.ink} strokeWidth={2.4} strokeLinejoin="round">
              <path d={`M8 ${H2} Q4 ${top + 6} 50 ${top - 4} Q96 ${top + 6} 92 ${H2} Z`} fill={look.coat} />
              {look.trim && <path d={`M50 ${top} L50 ${H2}`} stroke={look.trim} strokeWidth={7} />}
              {look.scarf && <path d={`M22 ${top + 3} Q50 ${top + 14} 78 ${top + 3} L76 ${top + 12} Q50 ${top + 22} 24 ${top + 12} Z M58 ${top + 12} L64 ${top + 40} L54 ${top + 40} Z`} fill={look.scarf} />}
            </g>
          );
        })()}
      </svg>
      <div style={{ position: 'absolute', left: (w - head) / 2, top: h * 0.04, width: head, height: head, borderRadius: '50%', background: skin,
        border: `${w * 0.024}px solid ${RC.ink}`, boxSizing: 'border-box' }} />
      {look.hair && <div style={{ position: 'absolute', left: (w - head) / 2, top: h * 0.04, width: head, height: head * 0.42, borderRadius: `${head}px ${head}px 30% 30%`,
        background: look.hair, border: `${w * 0.024}px solid ${RC.ink}`, boxSizing: 'border-box' }} />}
      {look.beard && <div style={{ position: 'absolute', left: (w - head * 0.86) / 2, top: h * 0.04 + head * 0.66, width: head * 0.86, height: head * 0.52,
        borderRadius: '20% 20% 50% 50%', background: look.beard, border: `${w * 0.02}px solid ${RC.ink}`, boxSizing: 'border-box' }} />}
      {look.hat && look.hat !== 'none' && (
        <div style={{ position: 'absolute', left: (w - head) / 2, top: h * 0.04, width: head, height: head }}>
          <HatSvg hat={look.hat} c={look.hatColor ?? '#5A3B24'} w={head} />
        </div>
      )}
    </div>
  );
};

const GLOVE: Record<string, string> = { open: 'props/glove_open.png', point: 'props/glove_point.png', pointUp: 'props/glove_point.png', fist: 'props/glove_fist.png', hold: 'props/glove_hold.png' };

export const Peg: React.FC<{
  src?: string; // russia asset, e.g. 'chars/rurik_viking.png'
  look: Look; // fallback colours
  x: number; y: number; height: number;
  start?: number; exit?: number;
  flip?: boolean;
  moods?: [number, Mood][];
  look2?: number; // pupils -1..1
  talk?: Talk;
  gestures?: [number, Gesture][];
  noArms?: boolean;
  walk?: Step[]; // travel keyframes (x/y of the feet); legs walk while moving
  legs?: boolean;
  seed?: string;
  tint?: string; // multiply colour (crowds: same image, different tints)
  shake?: [number, number]; // [from, to] rage/fear tremble
  hopAt?: number[]; // little jumps (surprise / joy)
  fallAt?: number; // tips over
  opacity?: number;
  children?: React.ReactNode; // extra things in body space (held props), coordinates in the box
}> = ({ src, look, x, y, height, start = 0, exit, flip = false, moods = [], look2 = 0, talk = [], gestures = [], noArms, walk, legs = true, seed = 'peg', tint, shake, hopAt = [], fallAt, opacity = 1, children }) => {
  const frame = useCurrentFrame();
  const s = lifeScale(frame, start, exit, 1.08);
  if (s <= 0.001) return null;
  const rig = rigOf(src) ?? DEFAULT_RIG;
  const legH = legs ? height * 0.16 : 0;
  const bodyH = height - legH;
  const w = bodyH * rig.aspect;

  // travel
  let px = x, py = y, moving = false;
  if (walk?.length) {
    px = walk[0].x; py = walk[0].y ?? y;
    for (let i = 1; i < walk.length; i++) {
      const k = walk[i], p = walk[i - 1];
      const dur = k.dur ?? 60;
      if (frame < k.at) break;
      const t = ramp(frame, k.at, dur, ease.inOut);
      px = p.x + (k.x - p.x) * t; py = (p.y ?? y) + ((k.y ?? y) - (p.y ?? y)) * t;
      if (frame < k.at + dur && Math.abs(k.x - p.x) + Math.abs((k.y ?? y) - (p.y ?? y)) > 2) moving = true;
    }
  }
  const stepP = 18;
  const phase = loop(frame, stepP) * Math.PI * 2;
  const walkBob = moving ? -Math.abs(Math.sin(phase)) * height * 0.035 : 0;
  const idleBob = wobble(seed, frame, height * 0.006, 0.05);
  let hop = 0;
  for (const h of hopAt) { const u = frame - h; if (u >= 0 && u < 22) hop -= Math.sin((u / 22) * Math.PI) * height * 0.09; }
  const tremble = shake && frame >= shake[0] && frame <= shake[1] ? Math.sin(frame * 2.1) * height * 0.006 : 0;
  // squash & stretch on entry and on landing from hops
  const sq = 1 + 0.05 * Math.sin(Math.min(1, (frame - start) / 14) * Math.PI) * (frame - start < 14 ? 1 : 0);
  const fall = fallAt !== undefined ? ramp(frame, fallAt, 14, ease.in) : 0;
  const mood = moodAt(frame, moods);

  // arms
  const g = gestureAt(frame, gestures);
  const armPose = (side: 'R' | 'L') => {
    const a = POSE[g.cur][side], b = POSE[g.prev][side];
    const t = g.t;
    const over = t < 1 ? Math.sin(t * Math.PI) * 6 : 0;
    let ang = b[0] + (a[0] - b[0]) * t + over * Math.sign(a[0] - b[0]);
    if (g.cur === 'wave' && side === 'R') ang += Math.sin((frame - g.since) / 5) * 18;
    if (g.cur === 'present' && side === 'R') ang += Math.sin(frame / 22) * 3;
    return { ang, reach: b[1] + (a[1] - b[1]) * t, hand: t > 0.5 ? a[2] : b[2] };
  };
  const arm = (side: 'R' | 'L') => {
    const [fx, fy] = side === 'R' ? rig.shoulderR : rig.shoulderL;
    const sx = fx * w, sy = fy * bodyH;
    const { ang, reach, hand } = armPose(side);
    const len = bodyH * 0.42 * reach;
    const a = (ang * Math.PI) / 180;
    const hx = sx + Math.cos(a) * len, hy = sy + Math.sin(a) * len;
    const mx = (sx + hx) / 2 - Math.sin(a) * len * 0.16, my = (sy + hy) / 2 + Math.cos(a) * len * 0.16;
    return { d: `M ${sx} ${sy} Q ${mx} ${my} ${hx} ${hy}`, hx, hy, ang, hand };
  };
  const arms = noArms ? [] : [arm('L'), arm('R')];
  const gs = bodyH * 0.16;

  // legs: hips at the body's bottom edge
  const hipY = bodyH - bodyH * 0.02;
  const legNodes = legs
    ? [-1, 1].map((side) => {
        const hx = w / 2 + side * w * 0.17;
        const swing = moving ? Math.sin(phase + (side > 0 ? Math.PI : 0)) * 28 : 0;
        const a = ((90 + swing) * Math.PI) / 180;
        const fx = hx + Math.cos(a) * legH * 1.02, fy = hipY + Math.sin(a) * legH * 1.02;
        return (
          <g key={side}>
            <line x1={hx} y1={hipY - legH * 0.1} x2={fx} y2={fy} stroke={RC.ink} strokeWidth={bodyH * 0.016} strokeLinecap="round" />
            <ellipse cx={fx + w * 0.045} cy={fy} rx={w * 0.07} ry={w * 0.035} fill={RC.ink} />
          </g>
        );
      })
    : null;

  const faceW = rig.face.w * w;
  // soft contact shadow on the ground (stays on the floor while hopping, shrinks with height)
  const lift = Math.min(1, -hop / (height * 0.09));
  const shadow = legs && opacity > 0 ? (
    <div style={{ position: 'absolute', left: px - w * 0.5, top: py - w * 0.07, width: w, height: w * 0.14, opacity: opacity * (1 - 0.5 * lift) * (1 - fall),
      transform: `scale(${s * (1 - 0.3 * lift)})`, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(20,14,10,0.42), rgba(20,14,10,0.18) 60%, rgba(20,14,10,0))' }} />
  ) : null;
  return (
    <>
    {shadow}
    <div style={{ position: 'absolute', left: px - w / 2 + tremble, top: py - height + walkBob + idleBob + hop, width: w, height, opacity,
      transformOrigin: '50% 100%', transform: `scaleX(${flip ? -1 : 1}) scale(${s}) scale(${1 / sq}, ${sq}) rotate(${fall * 90}deg)` }}>
      <svg width={w} height={height} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>{legNodes}</svg>
      <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: bodyH }}>
        {has(src ?? '') ? (
          <Img src={ra(src!)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        ) : (
          <FallbackBody look={look} w={w} h={bodyH} />
        )}
        {tint && <div style={{ position: 'absolute', inset: 0, background: tint, mixBlendMode: 'multiply', opacity: 0.35,
          WebkitMaskImage: has(src ?? '') ? `url(${ra(src!)})` : undefined, WebkitMaskSize: '100% 100%' }} />}
        <div style={{ position: 'absolute', left: rig.face.x * w - faceW / 2, top: rig.face.y * bodyH - faceW / 2, transform: flip ? 'scaleX(-1)' : undefined }}>
          <Face size={faceW} mood={mood} look={flip ? -look2 : look2} talk={talk} blinkSeed={seed.length * 7} />
        </div>
        <svg width={w} height={bodyH} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {arms.map((a, i) => <path key={i} d={a.d} fill="none" stroke={RC.ink} strokeWidth={bodyH * 0.016} strokeLinecap="round" />)}
        </svg>
        {arms.map((a, i) => {
          const rot = a.hand === 'pointUp' ? -90 : a.hand === 'open' ? a.ang + 90 : a.ang;
          return (
            <Img key={i} src={aa(GLOVE[a.hand])} style={{ position: 'absolute', left: a.hx - gs, top: a.hy - gs, width: gs * 2, height: gs * 2,
              transform: `rotate(${rot}deg) scaleY(${i === 0 ? -1 : 1})`, transformOrigin: '50% 50%' }} />
          );
        })}
        {children}
      </div>
    </div>
    </>
  );
};

/** The narrator-host's look (until host_narrator.png arrives): ushanka, saffron scarf, mustard coat, brown skin. */
export const HOST_LOOK: Look = { coat: '#D9A93A', trim: '#8A5A22', hat: 'ushanka', hatColor: '#6B4428', skin: '#C68B59', scarf: '#F08A24', hair: undefined };
