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

/**
 * Body-mounted prop (reference volley, f2300–2440 @30): NO arms are drawn — the musket sits on the body.
 * Keys are in the puppet box, in the direction the character FACES (+x before any flip):
 *   x, y = where the prop's pivot sits (fractions of the box) · deg = prop direction (0 = facing direction,
 *   negative = up). The image is mirrored when needed so the muzzle always points the facing way.
 */
export type MountKey = { at: number; x: number; y: number; deg: number; dur?: number };
export type BodyProp = {
  src: string;
  len: number; // canvas width as a fraction of the puppet BOX WIDTH
  aspect?: number; // image width / height (GPT props: square = 1)
  pivot: [number, number]; // pivot in the image AFTER mirroring (musket: the lock)
  mirror?: boolean; // musket PNGs point LEFT; puppets face +x inside their box, so mirror them
  keys: MountKey[];
  recoilAt?: number[];
};

/**
 * Reference musket handling for a rig: "port arms" (lock at the chest, muzzle up and back past the hat)
 * → lever swing → "present" (lock under the chin, barrel level, slight dip). Raise 16–20 f @60.
 */
export const musketMount = (rig: Rig, raiseAt: number, src: string, opts: { dur?: number; recoilAt?: number[] } = {}): BodyProp => {
  const faceH = rig.face.w * rig.aspect; // face diameter as a fraction of box height
  const chin = rig.face.y + faceH * 0.46;
  return {
    src,
    len: 1.35, // ref: musket ≈ 1.9 head widths
    pivot: [0.33, 0.5], // the lock: thickest point of musket_brown_bess.png at x 0.67, mirrored
    mirror: true,
    keys: [
      { at: 0, x: rig.face.x - 0.04, y: chin + 0.2, deg: -112 }, // ref f2300: 22° off vertical, muzzle up and back
      { at: raiseAt, x: rig.face.x + 0.05, y: chin + 0.015, deg: 3, dur: opts.dur ?? T.musketRaise + 6 },
    ],
    recoilAt: opts.recoilAt,
  };
};

/** Where a body-mounted prop's far end (e.g. the muzzle) is on screen — for smoke and flashes. */
export const mountTip = (
  m: BodyProp,
  frame: number,
  p: { x: number; y: number; height: number; flip?: boolean; aspect: number },
  tip = 0.97,
): [number, number] => {
  const k = mountAt(m, frame);
  const w = p.height * p.aspect;
  const L = m.len * w;
  const a = (k.deg * Math.PI) / 180;
  const bx = k.x * w + Math.cos(a) * L * (tip - m.pivot[0]);
  const by = k.y * p.height + Math.sin(a) * L * (tip - m.pivot[0]);
  return [p.x - w / 2 + (p.flip ? w - bx : bx), p.y - p.height + by];
};

const mountAt = (m: BodyProp, frame: number) => {
  let cur = { x: m.keys[0].x, y: m.keys[0].y, deg: m.keys[0].deg };
  for (let i = 1; i < m.keys.length; i++) {
    const k = m.keys[i];
    const prev = m.keys[i - 1];
    if (frame < k.at) break;
    const t = interpolate(frame - k.at, [0, k.dur ?? T.musketRaise], [0, 1], { ...clamp, easing: ease.out });
    // small overshoot past the target angle, then settle (ref f2373–2380 @30)
    const over = t < 1 ? Math.sin(t * Math.PI) * 5 * Math.sign(k.deg - prev.deg) : 0;
    cur = { x: prev.x + (k.x - prev.x) * t, y: prev.y + (k.y - prev.y) * t, deg: prev.deg + (k.deg - prev.deg) * t + over };
  }
  return cur;
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
  handStyle?: 'none' | 'skin' | 'glove'; // reference humans: bare line arms, no hand shape
  gloveSrc?: string; // white cartoon glove PNG (map characters)
  prop?: HeldProp;
  mount?: BodyProp;
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
  handStyle = 'none',
  gloveSrc = '',
  prop,
  mount,
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
    handStyle === 'none' ? null : handStyle === 'glove' ? (
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

  const mountNode = () => {
    if (!mount) return null;
    const k = mountAt(mount, frame);
    const L = mount.len * w;
    const ih = L / (mount.aspect ?? 1);
    const recoil = (mount.recoilAt ?? []).reduce((acc, r) => {
      const t = frame - r;
      return t >= 0 && t < 8 ? acc + (1 - t / 8) * height * 0.012 : acc;
    }, 0);
    const a = (k.deg * Math.PI) / 180;
    const px = k.x * w - Math.cos(a) * recoil;
    const py = k.y * height - Math.sin(a) * recoil;
    // rotate about the pivot (outer); mirror about the image centre (inner) so the pivot stays put
    return (
      <div
        style={{
          position: 'absolute',
          left: px - L * mount.pivot[0],
          top: py - ih * mount.pivot[1],
          width: L,
          height: ih,
          transformOrigin: `${mount.pivot[0] * 100}% ${mount.pivot[1] * 100}%`,
          transform: `rotate(${k.deg}deg)`,
        }}
      >
        <Img src={mount.src} style={{ width: '100%', height: '100%', transform: mount.mirror ? 'scaleX(-1)' : undefined }} />
      </div>
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
      {mountNode()}
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
