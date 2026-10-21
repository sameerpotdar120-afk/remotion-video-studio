import React, { useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from 'remotion';
import type { Feature, Geometry } from 'geojson';
import { C, FONTS, H, W } from '../lib/constants';
import { clamp, ease, popScale, ramp } from '../lib/easing';
import { useMap } from '../lib/map/MapStage';
import { featurePath } from '../lib/map/geo';
import { ParallaxPlate, type PlateKey } from '../lib/fx/depth';

/**
 * Shared building blocks for S06–S20. Positions are screen px; x/y are CENTRES unless noted.
 */

const serif = (size: number, color = '#fff'): React.CSSProperties => ({
  fontFamily: FONTS.serif, fontWeight: 700, fontSize: size, color, lineHeight: 1.05, whiteSpace: 'nowrap',
  textShadow: '0 8px 26px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.6)',
});

/** Paint a country's own map shape as sea while it is out walking as a MapCharacter (never two of it). */
export const HomeHidden: React.FC<{ feature: Feature<Geometry>; start: number }> = ({ feature, start }) => {
  const frame = useCurrentFrame();
  const d = useMemo(() => featurePath(feature), [feature]);
  return <path d={d} fill={C.stageParchSea} stroke={C.stageParchSea} strokeWidth={6} opacity={ramp(frame, start, 8, ease.out)} />;
};

/** Date card: a small paper tag that pops in with the date in big serif (ref date cards). */
export const DateCard: React.FC<{ x: number; y: number; text: string; start: number; exit?: number; size?: number }> = ({
  x, y, text, start, exit, size = 120,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  const s = popScale(frame, start) * out;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(-3deg) scale(${s})` }}>
      <div style={{ padding: `${size * 0.22}px ${size * 0.45}px`, background: '#F3E6C4', borderRadius: size * 0.08,
        boxShadow: '0 18px 40px rgba(0,0,0,0.45), inset 0 0 0 6px rgba(120,80,30,0.25)',
        fontFamily: FONTS.serif, fontWeight: 700, fontSize: size, color: '#3A2616', whiteSpace: 'nowrap' }}>{text}</div>
    </div>
  );
};

/** Number that counts up to `to` over `dur` frames (Indian or Western grouping), big serif. */
export const Counter: React.FC<{ x: number; y: number; to: number; start: number; dur?: number; size?: number; prefix?: string; suffix?: string; sub?: string; exit?: number; color?: string }> = ({
  x, y, to, start, dur = 40, size = 230, prefix = '', suffix = '', sub, exit, color = '#fff',
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1;
  if (out <= 0) return null;
  const v = Math.round(to * ramp(frame, start, dur, ease.out));
  const done = frame >= start + dur;
  const punch = done ? 1 + 0.12 * Math.exp(-(frame - start - dur) / 6) : 1;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${popScale(frame, start) * punch * out})`, textAlign: 'center' }}>
      <div style={{ ...serif(size, done ? C.dateYellow : color), fontVariantNumeric: 'tabular-nums' }}>{prefix}{v.toLocaleString('en-IN')}{suffix}</div>
      {sub && <div style={{ fontFamily: FONTS.label, fontWeight: 700, fontSize: size * 0.3, color: '#fff', textShadow: '0 4px 14px rgba(0,0,0,0.6)' }}>{sub}</div>}
    </div>
  );
};

/** Code-drawn neon X / check (when no neon PNG fits): one flicker, strong bloom. */
export const NeonMark: React.FC<{ x: number; y: number; size: number; start: number; kind?: 'x' | 'check'; exit?: number }> = ({
  x, y, size, start, kind = 'x', exit,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  const flick = t < 6 ? 0.4 : t < 12 ? 1 : t < 16 ? 0.4 : 1;
  const col = kind === 'x' ? C.neonRed : C.neonGreen;
  const d = kind === 'x' ? 'M 20 20 L 80 80 M 80 20 L 20 80' : 'M 18 55 L 42 78 L 84 24';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible',
      transform: `scale(${popScale(frame, start) * out})`, opacity: (0.5 + 0.5 * flick) * out,
      filter: `drop-shadow(0 0 ${10 * flick}px ${col}) drop-shadow(0 0 ${28 * flick}px ${col})` }}>
      <path d={d} stroke={col} strokeWidth={13} strokeLinecap="round" fill="none" />
      <path d={d} stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" />
    </svg>
  );
};

/** A neon PNG generated on pure black: screen-blended so the black disappears and the bloom stays. */
export const NeonPng: React.FC<{ x: number; y: number; size: number; start: number; path: string; exit?: number }> = ({ x, y, size, start, path, exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  const flick = t < 6 ? 0.45 : t < 12 ? 1 : t < 16 ? 0.45 : 1;
  return (
    <Img src={staticFile(`assets/${path}`)} style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size,
      mixBlendMode: 'screen', opacity: flick * out, transform: `scale(${popScale(frame, start) * out})` }} />
  );
};

/** Price tag on a string ("6d" → "3d"). */
export const PriceTag: React.FC<{ x: number; y: number; text: string; start: number; exit?: number; size?: number; rotate?: number }> = ({
  x, y, text, start, exit, size = 170, rotate = -10,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  const swing = Math.sin((frame - start) / 9) * 4 * Math.exp(-(frame - start) / 40);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rotate + swing}deg) scale(${popScale(frame, start) * out})` }}>
      <div style={{ position: 'relative', padding: `${size * 0.15}px ${size * 0.4}px ${size * 0.15}px ${size * 0.55}px`, background: '#F6EBCF',
        clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 18% 100%, 0 50%)', boxShadow: '0 14px 30px rgba(0,0,0,0.4)',
        fontFamily: FONTS.serif, fontWeight: 700, fontSize: size, color: '#3A2616' }}>
        {text}
        <div style={{ position: 'absolute', left: size * 0.2, top: '50%', width: size * 0.16, height: size * 0.16, marginTop: -size * 0.08, borderRadius: '50%', background: '#7A5A34' }} />
      </div>
    </div>
  );
};

/** One photo plate with optional transparent foreground layer, parallax camera, children between. */
export const Plate: React.FC<{ bg: string; fg?: string; camera: PlateKey[]; blur?: number; children?: React.ReactNode; tint?: string }> = ({
  bg, fg, camera, blur = 4, children, tint,
}) => (
  <AbsoluteFill>
    <ParallaxPlate
      camera={camera}
      layers={[{ src: staticFile(`assets/bg/${bg}`), depth: 0.25, blur }, ...(fg ? [{ src: staticFile(`assets/bg/${fg}`), depth: 1 }] : [])]}
    >
      <AbsoluteFill>{children}</AbsoluteFill>
    </ParallaxPlate>
    {tint && <AbsoluteFill style={{ background: tint, mixBlendMode: 'multiply' }} />}
  </AbsoluteFill>
);

/** Small marker of a place on the map (screen layer): a dot with a label. */
export const PlaceDot: React.FC<{ lon: number; lat: number; label: string; start: number; side?: 'l' | 'r'; size?: number; exit?: number; color?: string }> = ({
  lon, lat, label, start, side = 'r', size = 78, exit, color = '#fff',
}) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  const [x, y] = toScreen(lon, lat);
  const s = popScale(frame, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: out }}>
      <div style={{ position: 'absolute', left: -18, top: -18, width: 36, height: 36, borderRadius: '50%', background: C.stampRed, border: '6px solid #fff', transform: `scale(${s})` }} />
      <div style={{ position: 'absolute', top: -size * 0.6, [side === 'r' ? 'left' : 'right']: 40, ...serif(size, color), opacity: ramp(frame, start + 6, 10, ease.out) }}>{label}</div>
    </div>
  );
};

/** Small world-space smoke puffs (frontier raids, battle maps). */
export const MapPuffs: React.FC<{ points: [number, number][]; start: number; per?: number; life?: number; size?: number }> = ({ points, start, per = 8, life = 240, size = 0.6 }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  return (
    <>
      {points.map(([lon, lat], i) => {
        const t = frame - (start + i * per);
        if (t < 0 || frame - start > life) return null;
        const fade = interpolate(frame - start, [life - 20, life], [1, 0], clamp);
        const [x, y] = toScreen(lon, lat);
        const c = (t % 70) / 70;
        return [0, 1, 2].map((k) => {
          const r = (40 + c * 90 + k * 25) * size;
          return <div key={`${i}-${k}`} style={{ position: 'absolute', left: x - r + k * 30 * size, top: y - r - (c * 120 + k * 30) * size, width: r * 2, height: r * 2, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(225,222,216,0.85), rgba(200,196,190,0))', opacity: (1 - c) * 0.85 * fade }} />;
        });
      })}
    </>
  );
};

/** Burst of tiny particles (splashes, sparks). */
export const Splash: React.FC<{ x: number; y: number; start: number; color?: string; n?: number; size?: number }> = ({ x, y, start, color = '#DDF1FF', n = 14, size = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > 30) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = -Math.PI * (0.15 + 0.7 * random(`sp${start}${i}`));
        const v = (10 + 14 * random(`sv${start}${i}`)) * size;
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t + 0.9 * t * t * size;
        const r = (10 + 10 * random(`sr${i}`)) * size;
        return <div key={i} style={{ position: 'absolute', left: px - r, top: py - r, width: r * 2, height: r * 2, borderRadius: '50%', background: color, opacity: interpolate(t, [18, 30], [1, 0], clamp) }} />;
      })}
    </>
  );
};

/** Inline serif label at a screen point (centre). */
export const Label: React.FC<{ x: number; y: number; text: string; start: number; size?: number; exit?: number; color?: string }> = ({ x, y, text, start, size = 90, exit, color = '#fff' }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${popScale(frame, start) * out})`, ...serif(size, color) }}>{text}</div>;
};

/** Speech bubble (white, ink outline) with a tail toward (tx, ty). */
export const Bubble: React.FC<{ x: number; y: number; text: string; start: number; exit?: number; size?: number; tail?: 'l' | 'r' }> = ({ x, y, text, start, exit, size = 110, tail = 'l' }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${popScale(frame, start) * out})` }}>
      <div style={{ position: 'relative', background: '#fff', border: '8px solid #231A12', borderRadius: size * 0.5, padding: `${size * 0.25}px ${size * 0.5}px`,
        fontFamily: FONTS.display, fontSize: size, color: '#231A12', whiteSpace: 'nowrap', boxShadow: '0 14px 30px rgba(0,0,0,0.35)' }}>
        {text}
        <div style={{ position: 'absolute', bottom: -size * 0.42, [tail === 'l' ? 'left' : 'right']: size * 0.5, width: 0, height: 0,
          borderLeft: `${size * 0.25}px solid transparent`, borderRight: `${size * 0.25}px solid transparent`, borderTop: `${size * 0.45}px solid #231A12` }} />
      </div>
    </div>
  );
};

export { serif };
export const CENTER = { x: W / 2, y: H / 2 };

/** Punch-in sandwich on a screen point: ease in → hold → punch back out (ref §2.2). */
export const Punch: React.FC<{ start: number; end: number; to: number; focus: [number, number]; dur?: number; children: React.ReactNode }> = ({
  start, end, to, focus, dur = 12, children,
}) => {
  const frame = useCurrentFrame();
  const tin = ramp(frame, start, dur, ease.inOut);
  const tout = ramp(frame, end, dur, ease.inOut);
  const t = tin * (1 - tout);
  const s = 1 + (to - 1) * t;
  const blur = (tin > 0 && tin < 1) || (tout > 0 && tout < 1) ? 6 : 0;
  return (
    <AbsoluteFill style={{ transformOrigin: `${focus[0]}px ${focus[1]}px`, transform: `translate(${(W / 2 - focus[0]) * t}px, ${(H / 2 - focus[1]) * t}px) scale(${s})`, filter: blur ? `blur(${blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

/** A small ship icon sailing along lon/lat waypoints (map screen layer), bobbing. */
export const MapShip: React.FC<{ route: [number, number][]; start: number; dur: number; src: string; w: number; loop?: boolean; flipWhenWest?: boolean; exit?: number }> = ({
  route, start, dur, src, w, loop = false, flipWhenWest = true, exit,
}) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  let p = (frame - start) / dur;
  p = loop ? p % 1 : Math.min(1, p);
  const seg = p * (route.length - 1);
  const i = Math.min(route.length - 2, Math.floor(seg));
  const f = seg - i;
  const [a, b] = [toScreen(...route[i]), toScreen(...route[i + 1])];
  const x = a[0] + (b[0] - a[0]) * f;
  const y = a[1] + (b[1] - a[1]) * f + Math.sin(frame / 7) * 6;
  const west = b[0] < a[0];
  // ship PNGs face LEFT
  return (
    <Img src={staticFile(`assets/props/${src}`)} style={{ position: 'absolute', left: x - w / 2, top: y - w * 0.4, width: w,
      transform: `scaleX(${flipWhenWest && !west ? -1 : 1}) rotate(${Math.sin(frame / 11) * 3}deg) scale(${popScale(frame, start) * out})` }} />
  );
};
