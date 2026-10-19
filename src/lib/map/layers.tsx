import React, { useMemo } from 'react';
import { interpolate, interpolateColors, staticFile, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import type { Feature, Geometry } from 'geojson';
import { C, T } from '../constants';
import { clamp, ease, loop, popScale, ramp } from '../easing';
import { featurePath, pathGen, project } from './geo';
import { colonies, COLONY_IDS } from './data';
import { useMap } from './MapStage';

/* ───────────────────────── WORLD-LAYER (SVG, world px) ───────────────────────── */

/**
 * Colonies fill one by one, north → south. Each state flashes WHITE then settles to blue
 * (two-step fill measured in the reference: f8–57 @30fps).
 */
export const ColonyFill: React.FC<{
  start: number;
  per?: number; // frames between states
  color?: string;
  flash?: string;
  ids?: string[];
  opacity?: number;
}> = ({ start, per = T.fillPerState, color = C.colonyBlue, flash = C.colonyBlueLight, ids = COLONY_IDS, opacity = 0.92 }) => {
  const frame = useCurrentFrame();
  const paths = useMemo(
    () => ids.map((id) => featurePath(colonies.features.find((f) => f.properties?.id === id) as Feature<Geometry>)),
    [ids],
  );
  return (
    <g>
      {paths.map((d, i) => {
        const s = start + i * per;
        const a = ramp(frame, s, 6, ease.out); // appear
        const c = ramp(frame, s + 6, per * 1.4, ease.inOut); // white → color
        return (
          <path
            key={ids[i]}
            d={d}
            fill={interpolateColors(c, [0, 1], [flash, color])}
            fillOpacity={a * opacity}
            stroke="#FFFFFF"
            strokeOpacity={0.55 * a}
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </g>
  );
};

/** Neon outline that snaps on in 1 frame, holds, then fades (ref f58–81 @30). */
export const NeonOutline: React.FC<{ d: string; start: number; hold?: number; color?: string; width?: number }> = ({
  d,
  start,
  hold = T.neonOn,
  color = C.neonWhite,
  width = 6,
}) => {
  const frame = useCurrentFrame();
  const on = frame >= start ? 1 : 0;
  const off = interpolate(frame, [start + hold, start + hold + 6], [1, 0], clamp);
  const o = on * off;
  if (o <= 0) return null;
  return (
    <g style={{ filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 28px ${color})` }}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeOpacity={o} vectorEffect="non-scaling-stroke" />
    </g>
  );
};

/** Draw a path on (borders, routes, the 1763 Proclamation Line). Dashes optional. */
export const DrawLine: React.FC<{
  d: string;
  start: number;
  duration: number;
  color?: string;
  width?: number;
  dash?: number; // screen px dash length (0 = solid)
}> = ({ d, start, duration, color = C.stampRed, width = 7, dash = 0 }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start, duration, ease.inOut);
  const { strokeDasharray, strokeDashoffset } = evolvePath(p, d);
  const { scale } = useMap();
  return (
    <g>
      {/* reveal mask drawn with evolvePath, real dashes drawn inside it */}
      <mask id={`m-${start}`}>
        <path
          d={d}
          fill="none"
          stroke="#fff"
          strokeWidth={(width * 3) / scale}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </mask>
      <path
        d={d}
        mask={`url(#m-${start})`}
        fill="none"
        stroke={color}
        strokeWidth={width / scale}
        strokeLinecap="round"
        strokeDasharray={dash ? `${dash / scale} ${(dash * 0.7) / scale}` : undefined}
      />
    </g>
  );
};

/**
 * Territory flood. mode 'fade' = colour cross-fade (French land → British red, ref f497–512),
 * mode 'smash' = appears in ONE frame (ref f916).
 */
export const Territory: React.FC<{
  feature: Feature<Geometry> | Geometry;
  start: number;
  from?: string;
  to: string;
  mode?: 'fade' | 'smash';
  duration?: number;
  opacity?: number;
}> = ({ feature, start, from, to, mode = 'fade', duration = 30, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const d = useMemo(() => featurePath(feature), [feature]);
  if (frame < start && !from) return null;
  const t = mode === 'smash' ? (frame >= start ? 1 : 0) : ramp(frame, start, duration, ease.inOut);
  const fill = from ? interpolateColors(t, [0, 1], [from, to]) : to;
  return <path d={d} fill={fill} fillOpacity={from ? opacity : t * opacity} />;
};

/**
 * Flag cloth on a region: the flag image is clipped to the region, revealed radially from a
 * seed point (ref f82–99 @30) and "waves" with an SVG turbulence displacement.
 * Use the 1707–1801 Union Flag (NO St Patrick's saltire) and, for 1776, the Grand Union Flag.
 */
export const FlagFill: React.FC<{
  d: string;
  href: string;
  seed: [number, number]; // lon/lat where the reveal starts
  start: number;
  duration?: number;
  bbox: [[number, number], [number, number]]; // lon/lat [[w,s],[e,n]] to stretch the flag over
}> = ({ d, href, seed, start, duration = 34, bbox }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start, duration, ease.out);
  const [sx, sy] = project(seed[0], seed[1]);
  const [x0, y0] = project(bbox[0][0], bbox[1][1]);
  const [x1, y1] = project(bbox[1][0], bbox[0][1]);
  const r = Math.hypot(x1 - x0, y1 - y0) * p;
  const id = `flag-${start}`;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={d} />
        </clipPath>
        <filter id={`${id}-wave`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves={2} seed={Math.floor(frame / 2)} />
          <feDisplacementMap in="SourceGraphic" scale={(x1 - x0) * 0.025} />
        </filter>
      </defs>
      <mask id={`${id}-mask`}>
        <circle cx={sx} cy={sy} r={r} fill="#fff" />
      </mask>
      <g clipPath={`url(#${id}-clip)`}>
        <image
          href={href}
          x={x0}
          y={y0}
          width={x1 - x0}
          height={y1 - y0}
          preserveAspectRatio="none"
          mask={`url(#${id}-mask)`}
          filter={`url(#${id}-wave)`}
        />
      </g>
    </g>
  );
};

/** Helper for scenes: SVG path of any colony id. */
export const colonyPath = (id: string) =>
  pathGen(colonies.features.find((f) => f.properties?.id === id) as never) ?? '';

/* ───────────────────────── SCREEN-LAYER (HTML, screen px) ───────────────────────── */

/** Red teardrop pin: dot grows (overshoot) → ripple ring → label wipes on (ref f2056–2076 @30). */
export const MapPin: React.FC<{
  lon: number;
  lat: number;
  start: number;
  label?: string;
  date?: string;
  labelSide?: 'right' | 'left';
}> = ({ lon, lat, start, label, date, labelSide = 'right' }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  const [x, y] = toScreen(lon, lat);
  if (frame < start) return null;
  const s = popScale(frame, start);
  const ripple = ramp(frame, start + 8, T.ripple, ease.out);
  const wipe = ramp(frame, start + 14, T.labelWipe, ease.out);
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      <div
        style={{
          position: 'absolute',
          left: -160 * ripple,
          top: -160 * ripple,
          width: 320 * ripple,
          height: 320 * ripple,
          borderRadius: '50%',
          border: `8px solid ${C.stampRed}`,
          opacity: 1 - ripple,
        }}
      />
      <svg
        width={90}
        height={120}
        viewBox="0 0 30 40"
        style={{ position: 'absolute', left: -45, top: -120, transform: `scale(${s})`, transformOrigin: '50% 100%' }}
      >
        <path d="M15 40 C15 40 2 24 2 14 A13 13 0 0 1 28 14 C28 24 15 40 15 40Z" fill={C.stampRed} stroke="#fff" strokeWidth={2} />
        <circle cx={15} cy={14} r={5} fill="#fff" />
      </svg>
      {label && (
        <div
          style={{
            position: 'absolute',
            top: -110,
            [labelSide === 'right' ? 'left' : 'right']: 70,
            clipPath: `inset(0 ${100 - wipe * 100}% 0 0)`,
            whiteSpace: 'nowrap',
            color: '#fff',
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            fontSize: 96,
            textShadow: '0 6px 18px rgba(0,0,0,0.55)',
            lineHeight: 1,
          }}
        >
          {label}
          {date && <div style={{ fontSize: 46, fontWeight: 600, color: C.dateYellow, marginTop: 10 }}>{date}</div>}
        </div>
      )}
    </div>
  );
};

/** Cartoon eyes (+ optional brows) placed on a map region. Pops in with a 1–3 f stagger. */
export const RegionEyes: React.FC<{
  lon: number;
  lat: number;
  start: number;
  size?: number;
  look?: number; // -1 left … 1 right
  mood?: 'neutral' | 'angry' | 'worried';
}> = ({ lon, lat, start, size = 70, look = 0, mood = 'neutral' }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const [x, y] = toScreen(lon, lat);
  const s = popScale(frame, start);
  const blink = loop(frame + Math.round(lon * 37), T.blinkEvery) < T.blink / T.blinkEvery ? 0.12 : 1;
  const brow = mood === 'angry' ? 18 : mood === 'worried' ? -14 : 0;
  return (
    <svg
      width={size * 2.4}
      height={size * 1.6}
      viewBox="0 0 120 80"
      style={{ position: 'absolute', left: x - size * 1.2, top: y - size * 0.8, transform: `scale(${s})` }}
    >
      {[34, 86].map((cx, i) => (
        <g key={cx}>
          <ellipse cx={cx} cy={44} rx={20} ry={24 * blink} fill="#fff" stroke={C.outline} strokeWidth={4} />
          <circle cx={cx + look * 8} cy={46} r={9 * blink} fill={C.ink} />
          {mood !== 'neutral' && (
            <line
              x1={cx - 20}
              y1={14 + (i === 0 ? -brow / 3 : brow / 3)}
              x2={cx + 20}
              y2={14 + (i === 0 ? brow / 3 : -brow / 3)}
              stroke={C.ink}
              strokeWidth={7}
              strokeLinecap="round"
            />
          )}
        </g>
      ))}
    </svg>
  );
};
