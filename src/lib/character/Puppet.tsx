import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import { C, T } from '../constants';
import { clamp, ease, loop, popScale, ramp, wobble } from '../easing';
import { Face, moodAt, type Mood, type Talk } from './Face';

/**
 * Cut-out puppet built from ONE generated PNG (blank face, arms tucked in — see asset doc)
 * plus code-drawn face, noodle arms, hands and held props. Everything animates on 1s (60 fps).
 *
 * Coordinates: x,y = the character's FEET (bottom centre) in screen px; height = on-screen height.
 * Rig anchors are fractions of the image box (set once per character in RIGS below).
 */
export type Rig = {
  src: string;
  aspect: number; // image width / height
  face: { x: number; y: number; w: number }; // face centre + width as fractions of the box
  shoulderL: [number, number];
  shoulderR: [number, number];
  skin?: string;
};

export type ArmPose = { at: number; angle: number; reach: number; dur?: number }; // angle deg (0 = right, -90 = up)

export type HeldProp = {
  src: string;
  hand: 'L' | 'R';
  w: number; // px
  pivot: [number, number]; // fraction of the prop image where the hand grips
  angle: { at: number; deg: number; dur?: number }[]; // keyframes (musket: -80 shouldered → 0 aimed)
  recoilAt?: number[]; // frames where it kicks back (gun fire)
  aspect?: number; // image width / height. GPT props are square 2048² canvases (default 1)
};

export const Puppet: React.FC<{
  rig: Rig;
  x: number;
  y: number;
  height: number;
  start?: number; // pops in at this frame
  flip?: boolean;
  moods?: [number, Mood][];
  look?: number;
  talk?: Talk;
  armL?: ArmPose[]; // omit = arm hidden (reference default)
  armR?: ArmPose[];
  handStyle?: 'skin' | 'glove';
  gloveSrc?: string; // white cartoon glove PNG (map characters)
  prop?: HeldProp;
  idle?: number; // idle bob amplitude px
  seed?: string;
  fallAt?: number; // tips over 90° (casualty) — ref f3697–3704 @30
}> = ({
  rig,
  x,
  y,
  height,
  start = 0,
  flip = false,
  moods = [],
  look = 0,
  talk = [],
  armL,
  armR,
  handStyle = 'skin',
  gloveSrc = '',
  prop,
  idle = 4,
  seed = 'p',
  fallAt,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const w = height * rig.aspect;
  const s = popScale(frame, start);
  const bob = wobble(seed, frame, idle, 0.06);
  const fall = fallAt !== undefined ? ramp(frame, fallAt, 12, ease.in) : 0;
  const mood = moodAt(frame, moods);

  const shoulder = (side: 'L' | 'R'): [number, number] => {
    const [fx, fy] = side === 'L' ? rig.shoulderL : rig.shoulderR;
    return [fx * w, fy * height];
  };
  const poseAt = (poses: ArmPose[]) => {
    let prev = poses[0];
    for (const p of poses) {
      if (frame >= p.at) prev = p;
    }
    const i = poses.indexOf(prev);
    const next = poses[i + 1];
    if (!next || frame < next.at) {
      const before = poses[i - 1];
      if (before && frame < prev.at + (prev.dur ?? 10)) {
        const t = ramp(frame, prev.at, prev.dur ?? 10, ease.out);
        return { angle: before.angle + (prev.angle - before.angle) * t, reach: before.reach + (prev.reach - before.reach) * t };
      }
    }
    return prev;
  };
  const armGeo = (side: 'L' | 'R', poses?: ArmPose[]) => {
    if (!poses?.length) return null;
    const [sx, sy] = shoulder(side);
    const { angle, reach } = poseAt(poses);
    const len = height * 0.42 * reach;
    const a = (angle * Math.PI) / 180;
    const hx = sx + Math.cos(a) * len;
    const hy = sy + Math.sin(a) * len;
    // noodle (rubber-hose) arm: quadratic curve with an elbow sag
    const mx = (sx + hx) / 2 - Math.sin(a) * len * 0.18;
    const my = (sy + hy) / 2 + Math.cos(a) * len * 0.18;
    return { d: `M ${sx} ${sy} Q ${mx} ${my} ${hx} ${hy}`, hx, hy, angle };
  };
  const arms = [armGeo('L', armL), armGeo('R', armR)].filter((g): g is NonNullable<typeof g> => g !== null);
  const hr = height * 0.05;
  const armPaths = arms.map((g, i) => (
    <path key={i} d={g.d} fill="none" stroke={C.ink} strokeWidth={height * 0.012} strokeLinecap="round" />
  ));
  const hands = arms.map((g, i) =>
    handStyle === 'glove' ? (
      <Img
        key={i}
        src={gloveSrc}
        style={{
          position: 'absolute',
          left: g.hx - hr * 1.6,
          top: g.hy - hr * 1.6,
          width: hr * 3.2,
          transform: `rotate(${g.angle}deg)`,
        }}
      />
    ) : (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: g.hx - hr * 0.55,
          top: g.hy - hr * 0.55,
          width: hr * 1.1,
          height: hr * 1.1,
          borderRadius: '50%',
          background: rig.skin ?? C.skin,
          border: `${height * 0.008}px solid ${C.ink}`,
        }}
      />
    ),
  );

  const propNode = () => {
    if (!prop) return null;
    const poses = prop.hand === 'L' ? armL : armR;
    const [sx, sy] = shoulder(prop.hand);
    const p = poses?.length ? poseAt(poses) : { angle: 60, reach: 0.6 };
    const len = height * 0.42 * p.reach;
    const a = (p.angle * Math.PI) / 180;
    const hx = sx + Math.cos(a) * len;
    const hy = sy + Math.sin(a) * len;
    // angle keyframes with overshoot (musket raise ref f2373–2380 @30)
    let deg = prop.angle[0].deg;
    for (let i = 1; i < prop.angle.length; i++) {
      const k = prop.angle[i];
      const prevDeg = prop.angle[i - 1].deg;
      if (frame >= k.at) {
        const t = interpolate(frame - k.at, [0, k.dur ?? T.musketRaise], [0, 1], { ...clamp, easing: ease.out });
        const over = Math.sin(Math.min(1, t) * Math.PI) * 4 * Math.sign(k.deg - prevDeg) * (t < 1 ? 1 : 0);
        deg = prevDeg + (k.deg - prevDeg) * t + over;
      }
    }
    const recoil = (prop.recoilAt ?? []).reduce((acc, r) => {
      const t = frame - r;
      return t >= 0 && t < 8 ? acc + (1 - t / 8) * 16 : acc;
    }, 0);
    // image height from its real proportions: assuming 4:1 put a square musket PNG ~0.4×w below the hand
    const ph = prop.w / (prop.aspect ?? 1);
    return (
      <Img
        src={prop.src}
        style={{
          position: 'absolute',
          left: hx - prop.w * prop.pivot[0] - recoil,
          top: hy - ph * prop.pivot[1],
          width: prop.w,
          transformOrigin: `${prop.pivot[0] * 100}% ${prop.pivot[1] * 100}%`,
          transform: `rotate(${deg}deg)`,
        }}
      />
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - height + bob,
        width: w,
        height,
        transformOrigin: '50% 100%',
        transform: `scaleX(${flip ? -1 : 1}) scale(${s}) rotate(${fall * (flip ? -90 : 90)}deg)`,
      }}
    >
      <Img src={rig.src} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          left: rig.face.x * w - (rig.face.w * w) / 2,
          top: rig.face.y * height - (rig.face.w * w) / 2,
          transform: flip ? 'scaleX(-1)' : undefined,
        }}
      >
        <Face size={rig.face.w * w} mood={mood} look={flip ? -look : look} talk={talk} blinkSeed={seed.length} />
      </div>
      <svg width={w} height={height} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {armPaths}
      </svg>
      {hands}
      {propNode()}
    </div>
  );
};

/** A line of identical puppets with staggered timing (musket volley, crowds, armies). */
export const Squad: React.FC<{
  count: number;
  render: (i: number, offset: number) => React.ReactNode;
  stagger?: number;
}> = ({ count, render, stagger = T.musketOffset }) => <>{Array.from({ length: count }).map((_, i) => render(i, i * stagger))}</>;

/** Walk/hop gait for travelling chibis (ref Tea Party gangplank: ~10 f per hop @30). */
export const hop = (frame: number, start: number, period = 20, height = 18) =>
  frame < start ? 0 : -Math.abs(Math.sin(loop(frame - start, period) * Math.PI)) * height;
