import React, { useMemo } from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { geoEquirectangular, geoPath } from 'd3-geo';
import type { Feature, Geometry, MultiPolygon, Polygon } from 'geojson';
import { C, T } from '../constants';
import { ease, loop, popScale, ramp, wobble } from '../easing';
import { Face, moodAt, type Mood, type Talk } from './Face';
import { country } from '../map/data';

/**
 * Great Britain in 1763 = the island of Great Britain only (England, Wales, Scotland).
 * Natural Earth's "United Kingdom" also contains Northern Ireland (Ireland was a separate
 * kingdom until 1801), so we keep only the largest polygon.
 */
export const greatBritain1763 = (): Feature<Polygon> => {
  const uk = country('United Kingdom') as Feature<MultiPolygon | Polygon>;
  const polys = uk.geometry.type === 'MultiPolygon' ? uk.geometry.coordinates : [uk.geometry.coordinates];
  const area = (ring: number[][]) =>
    Math.abs(ring.reduce((s, [x, y], i) => { const [x2, y2] = ring[(i + 1) % ring.length]; return s + x * y2 - x2 * y; }, 0));
  const biggest = polys.slice().sort((a, b) => area(b[0]) - area(a[0]))[0];
  return { type: 'Feature', properties: { name: 'Great Britain' }, geometry: { type: 'Polygon', coordinates: biggest } };
};

/** Fit any feature into a w×h box and return its SVG path. */
const fitPath = (f: Feature<Geometry>, w: number, h: number) => {
  const proj = geoEquirectangular().fitSize([w, h], f as never);
  return geoPath(proj)(f as never) ?? '';
};

export type GloveKey = { at: number; pose: 'open' | 'point' | 'fist' | 'hold'; angle: number; reach: number };

/**
 * A country shape as a character (reference: red Britain with googly eyes, angry brows,
 * one noodle arm ending in a white cartoon glove).
 * Movement: travel keyframes in screen px (slides across the ocean, ref f650–668 @30),
 * idle squash-bob, rage shake when mood is 'furious' (ref f3160–3191 @30).
 */
export const MapCharacter: React.FC<{
  feature: Feature<Geometry>;
  color?: string;
  height: number; // on-screen height px
  path: { at: number; x: number; y: number; dur?: number }[]; // screen positions over time (centre)
  start?: number;
  moods?: [number, Mood][];
  look?: [number, number][]; // [frame, -1..1]
  talk?: Talk;
  glove?: GloveKey[];
  holding?: { src: string; w: number; from: number; to?: number }; // paper in glove
  face?: { x: number; y: number; w: number }; // fractions of the box (GB: upper-middle, over northern England)
}> = ({
  feature,
  color = C.britainRed,
  height,
  path,
  start = 0,
  moods = [],
  look = [],
  talk = [],
  glove = [],
  holding,
  face = { x: 0.62, y: 0.42, w: 0.55 },
}) => {
  const frame = useCurrentFrame();
  const w = height * 0.62;
  const d = useMemo(() => fitPath(feature, w, height), [feature, w, height]);
  if (frame < start) return null;

  // position along keyframes
  let x = path[0].x;
  let y = path[0].y;
  for (let i = 1; i < path.length; i++) {
    const k = path[i];
    const dur = k.dur ?? T.slideTravel;
    if (frame >= k.at) {
      const t = ramp(frame, k.at, dur, ease.inOut);
      x = path[i - 1].x + (k.x - path[i - 1].x) * t;
      y = path[i - 1].y + (k.y - path[i - 1].y) * t;
    }
  }
  const mood = moodAt(frame, moods);
  const lk = look.reduce((v, [f, l]) => (frame >= f ? l : v), 0);
  const s = popScale(frame, start);
  const rage = mood === 'furious' ? (loop(frame, 4) < 0.5 ? 3 : -3) : 0;
  const squash = 1 + Math.sin(frame / 14) * 0.012;

  // glove arm from the west coast (left side) toward the target angle
  const g = glove.reduce<GloveKey | null>((v, k) => (frame >= k.at ? k : v), null);
  const prev = g ? glove[glove.indexOf(g) - 1] : undefined;
  const t = g && prev ? ramp(frame, g.at, 8, ease.out) : 1;
  const angle = g ? (prev ? prev.angle + (g.angle - prev.angle) * t : g.angle) : 0;
  const reach = g ? (prev ? prev.reach + (g.reach - prev.reach) * t : g.reach * ramp(frame, g.at, 8, ease.out)) : 0;
  const sx = w * 0.2;
  const sy = height * 0.47;
  const len = height * 0.22 * reach; // reference arm ≈ 0.2 × island height at full reach
  const a = (angle * Math.PI) / 180;
  const pump = g?.pose === 'point' ? Math.sin(loop(frame, T.gestureCycle) * Math.PI * 2) * 10 : 0;
  const hx = sx + Math.cos(a) * (len + pump);
  const hy = sy + Math.sin(a) * (len + pump);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2 + rage,
        top: y - height / 2 + wobble('mc', frame, 3, 0.05),
        width: w,
        height,
        transform: `scale(${s}) scaleY(${squash})`,
        transformOrigin: '50% 100%',
      }}
    >
      <svg width={w} height={height} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={d} fill={color} stroke={C.britainRedDark} strokeWidth={4} />
        {g && reach > 0.02 && (
          <path
            d={`M ${sx} ${sy} Q ${(sx + hx) / 2} ${(sy + hy) / 2 + len * 0.2} ${hx} ${hy}`}
            fill="none"
            stroke={C.ink}
            strokeWidth={height * 0.014}
            strokeLinecap="round"
          />
        )}
      </svg>
      {holding && frame >= holding.from && (holding.to === undefined || frame < holding.to) && (
        // held against the body: the paper's right edge sits in the glove, overlapping the coast (ref f1420, f4170)
        <Img
          src={holding.src}
          style={{
            position: 'absolute',
            left: hx - holding.w * 0.82,
            top: hy - holding.w * 0.5,
            width: holding.w,
            transform: `scale(${popScale(frame, holding.from)}) rotate(${-6 + Math.sin(frame / 18) * 2}deg)`,
          }}
        />
      )}
      {g && reach > 0.02 && (() => {
        // glove PNGs point RIGHT with the cuff on the left; mirror when pointing into the left half
        const gs = height * 0.32; // square canvas; the visible glove is ~60% of it
        const left = Math.cos(a) < 0;
        return (
          <Img
            src={staticFile(`assets/props/glove_${g.pose}.png`)}
            style={{
              position: 'absolute',
              left: hx - gs / 2,
              top: hy - gs / 2,
              width: gs,
              transform: left ? `rotate(${angle - 180}deg) scaleX(-1)` : `rotate(${angle}deg)`,
            }}
          />
        );
      })()}
      <div style={{ position: 'absolute', left: face.x * w - (face.w * w) / 2, top: face.y * height - (face.w * w) / 2 }}>
        <Face size={face.w * w} mood={mood} look={lk} talk={talk} style="googly" />
      </div>
    </div>
  );
};
