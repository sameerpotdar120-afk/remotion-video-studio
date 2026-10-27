import React, { createContext, useContext, useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, interpolateColors, random, staticFile, useCurrentFrame } from 'remotion';
import { geoConicConformal, geoPath, type GeoProjection } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import VIEWS from '../maps/views.json';
import TERR from '../maps/territories.json';
import RIVERS from '../maps/rivers.json';
import { H, W } from '../../lib/constants';
import { clamp, ease, ramp } from '../../lib/easing';
import { HAND, RC, hand, pop } from '../kit/core';

/**
 * Satellite map stage for the Russia video (§1.2): real terrain in a conformal conic view, flat translucent
 * territory fills (≈55 % opacity) with thin pale borders, white handwritten labels, yellow teardrop pins.
 * Projection = d3.geoConicConformal with the exact parameters the rasters were baked with (views.json), so
 * every vector, pin and label sits on the terrain to the pixel.
 *
 * Camera: keys in lon/lat + zoom (1 = the whole view fills the frame width). Maps carry the strongest moves
 * (§3: push +10 … +230 %, pull-outs); between keys the camera keeps a slow drift so a map is never still.
 */

export type ViewName = keyof typeof VIEWS;
export type MapCam = { at: number; lon: number; lat: number; zoom: number; dur?: number; easing?: (t: number) => number };

type Ctx = { view: string; proj: GeoProjection; scale: number; toScreen: (lon: number, lat: number) => [number, number]; path: (g: Geometry | Feature) => string };
/** projected SVG paths are pure functions of (view, feature): compute each once (projecting a 10m outline every frame is the slowest thing on a map) */
const PATHS = new Map<string, Map<object, string>>();
const MapCtx = createContext<Ctx | null>(null);
export const useRMap = () => {
  const c = useContext(MapCtx);
  if (!c) throw new Error('useRMap outside RMap');
  return c;
};

const projOf = (name: ViewName) => {
  const v = VIEWS[name] as { lon0: number; parallels: number[]; scale: number; translate: number[] };
  return geoConicConformal()
    .rotate([-v.lon0, 0])
    .parallels([v.parallels[0], v.parallels[1]] as [number, number])
    .scale(v.scale)
    .translate([v.translate[0], v.translate[1]])
    .precision(0.2);
};

const T = TERR as unknown as FeatureCollection;
export const terr = (id: string) => {
  const f = T.features.find((x) => x.id === id);
  if (!f) throw new Error(`territory ${id}`);
  return f as Feature<Geometry, { id: string; label: [number, number]; name?: string }>;
};

const camAt = (frame: number, keys: MapCam[]) => {
  let cur = { lon: keys[0].lon, lat: keys[0].lat, zoom: keys[0].zoom };
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (frame < k.at) break;
    const t = ramp(frame, k.at, k.dur ?? 60, k.easing ?? ease.inOut);
    const p = cur;
    // zoom interpolates in log space (constant perceived speed)
    cur = { lon: p.lon + (k.lon - p.lon) * t, lat: p.lat + (k.lat - p.lat) * t, zoom: Math.exp(Math.log(p.zoom) + (Math.log(k.zoom) - Math.log(p.zoom)) * t) };
    if (t < 1) break;
  }
  return cur;
};

export const RMap: React.FC<{
  view: ViewName;
  cam: MapCam[];
  drift?: number; // extra zoom per second between moves (§3 median ≈1 %/s)
  from?: number; // drift start
  dim?: number; // darken the terrain (0..1) — night / dramatic beats
  children?: React.ReactNode; // world-space layers (Fill, River, Route) — first; then use <Overlay> for screen-space
  overlay?: React.ReactNode; // screen-space layers (pins, labels, icons)
}> = ({ view, cam, drift = 0.01, from = 0, dim = 0, children, overlay }) => {
  const frame = useCurrentFrame();
  const v = VIEWS[view] as { width: number; height: number; sat: string };
  const proj = useMemo(() => projOf(view), [view]);
  const pathGen = useMemo(() => geoPath(proj), [proj]);
  const c = camAt(frame, cam);
  const zoom = c.zoom * (1 + drift * Math.max(0, frame - from) / 60);
  const scale = (W / v.width) * zoom;
  const [cx, cy] = proj([c.lon, c.lat]) as [number, number];
  const tx = W / 2 - cx * scale;
  const ty = H / 2 - cy * scale;
  const ctx: Ctx = {
    view,
    proj,
    scale,
    toScreen: (lon, lat) => {
      const [x, y] = proj([lon, lat]) as [number, number];
      return [tx + x * scale, ty + y * scale];
    },
    path: (g) => {
      let m = PATHS.get(view);
      if (!m) PATHS.set(view, (m = new Map()));
      let d = m.get(g as object);
      if (d === undefined) m.set(g as object, (d = pathGen(g as never) ?? ''));
      return d;
    },
  };
  return (
    <MapCtx.Provider value={ctx}>
      <AbsoluteFill style={{ background: '#0B2441', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: v.width, height: v.height, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
          <Img src={staticFile(v.sat)} style={{ position: 'absolute', inset: 0, width: v.width, height: v.height, filter: dim ? `brightness(${1 - dim})` : undefined }} />
        </div>
        {/* vector layers in SCREEN space (a world-sized SVG is re-rasterised in full every frame: ~5 s/frame) */}
        <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g transform={`translate(${tx} ${ty}) scale(${scale})`}>{children}</g>
        </svg>
        {overlay}
      </AbsoluteFill>
    </MapCtx.Provider>
  );
};

/* ────────────────────────────── world-space layers ────────────────────────────── */

/**
 * Translucent territory fill with a thin pale border (§1.2, §2.8).
 *  mode 'fade' (default) · 'pop' (elastic scale from its centre) · 'flood' (radial reveal from `origin`) ·
 *  'wipe' (reveal west→east). colors: [[frame, colour], …] recolours (absorption, §2.7).
 */
export const Fill: React.FC<{
  id: string;
  color: string;
  colors?: [number, string][];
  start: number;
  exit?: number;
  mode?: 'fade' | 'pop' | 'flood' | 'wipe';
  dur?: number;
  origin?: [number, number];
  opacity?: number;
  border?: string;
  borderPx?: number;
  pulseAt?: number[];
  offset?: [number, number]; // world px shift (pieces pulling apart)
}> = ({ id, color, colors, start, exit, mode = 'fade', dur, origin, opacity = 0.58, border = 'rgba(255,255,255,0.85)', borderPx = 3, pulseAt = [], offset }) => {
  const frame = useCurrentFrame();
  const { path, proj, view } = useRMap();
  const f = terr(id);
  const d = path(f);
  if (frame < start) return null;
  const D = dur ?? (mode === 'flood' ? 90 : mode === 'wipe' ? 50 : 14);
  const outK = exit !== undefined ? 1 - ramp(frame, exit, 14, ease.in) : 1;
  if (outK <= 0) return null;
  let col = color;
  if (colors?.length) {
    const ks = [[start, color] as [number, string], ...colors];
    for (let i = 1; i < ks.length; i++) {
      if (frame >= ks[i][0]) col = interpolateColors(frame, [ks[i][0], ks[i][0] + 12], [ks[i - 1][1], ks[i][1]]);
    }
  }
  let pulse = 0;
  for (const p of pulseAt) { const u = frame - p; if (u >= 0 && u < 24) pulse = Math.max(pulse, Math.sin((u / 24) * Math.PI)); }
  const [lx, ly] = proj(f.properties.label) as [number, number];
  const k = ramp(frame, start, D, mode === 'flood' ? ease.inOut : ease.out);
  const op = (mode === 'fade' ? k : 1) * outK;
  const v = VIEWS[view as ViewName] as { width: number; height: number };
  let cssClip: string | undefined;
  if (mode === 'flood') {
    const [ox, oy] = proj(origin ?? f.properties.label) as [number, number];
    cssClip = `circle(${9000 * k}px at ${ox}px ${oy}px)`;
  } else if (mode === 'wipe') {
    cssClip = `inset(0 ${Math.max(0, v.width - 12000 * k)}px 0 0)`;
  }
  let transform = '';
  if (mode === 'pop') {
    const s2 = pop(frame, start, 1.08);
    transform = `translate(${lx}px, ${ly}px) scale(${s2}) translate(${-lx}px, ${-ly}px)`;
  }
  if (offset) transform += ` translate(${offset[0]}px, ${offset[1]}px)`;
  // colour: the current colour's raster, cross-faded from the previous one during a recolour
  let prevCol: string | null = null, mix = 1;
  if (colors?.length) {
    const ks = [[start, color] as [number, string], ...colors];
    let cur = ks[0][1];
    for (let i = 1; i < ks.length; i++) if (frame >= ks[i][0]) { prevCol = cur; cur = ks[i][1]; mix = ramp(frame, ks[i][0], 12); }
    col = cur;
    if (mix >= 1) prevCol = null;
  }
  return (
    <foreignObject x={0} y={0} width={v.width} height={v.height} style={{ overflow: 'visible', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: v.width, height: v.height, opacity: op, transform: transform || undefined, transformOrigin: '0 0', clipPath: cssClip }}>
        {prevCol && <FillRaster view={view} id={id} d={d} color={prevCol} alpha={opacity} border={border} borderPx={borderPx} style={{ opacity: 1 - mix }} />}
        <FillRaster view={view} id={id} d={d} color={col} alpha={opacity} border={border} borderPx={borderPx} style={{ opacity: prevCol ? mix : 1 }} />
        {pulse > 0 && <FillRaster view={view} id={id} d={d} color={col} alpha={0.5} border="rgba(0,0,0,0)" borderPx={0} style={{ opacity: pulse * 0.6 }} />}
      </div>
    </foreignObject>
  );
};

/**
 * A territory drawn ONCE into a half-resolution canvas (world coordinates), then only composited. Stroking a
 * 10 m coastline in SVG on every frame cost ≈4 s/frame in software GL; this costs one draw per colour.
 */
const RASTER_K = 0.5;
const FillRaster: React.FC<{ view: string; id: string; d: string; color: string; alpha: number; border: string; borderPx: number; style?: React.CSSProperties }> = ({
  view, d, color, alpha, border, borderPx, style,
}) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const v = VIEWS[view as ViewName] as { width: number; height: number };
  React.useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, c.width, c.height);
    g.setTransform(RASTER_K, 0, 0, RASTER_K, 0, 0);
    const p2 = new Path2D(d);
    g.globalAlpha = Math.min(0.95, alpha);
    g.fillStyle = color;
    g.fill(p2, 'evenodd');
    if (borderPx > 0) {
      g.globalAlpha = 1;
      g.strokeStyle = border;
      g.lineWidth = borderPx * 1.1;
      g.lineJoin = 'round';
      g.stroke(p2);
    }
  }, [d, color, alpha, border, borderPx]);
  return <canvas ref={ref} width={Math.round(v.width * RASTER_K)} height={Math.round(v.height * RASTER_K)} style={{ position: 'absolute', left: 0, top: 0, width: v.width, height: v.height, ...style }} />;
};

/** Several territories flipping into view one after another (patchwork of principalities, 15 republics). */
export const Patchwork: React.FC<{ ids: string[]; colors: string[]; start: number; stagger?: number; exit?: number; opacity?: number; spread?: { at: number; px: number; center: [number, number] } }> = ({
  ids, colors, start, stagger = 5, exit, opacity = 0.62, spread,
}) => {
  const frame = useCurrentFrame();
  const { proj } = useRMap();
  return (
    <>
      {ids.map((id, i) => {
        let offset: [number, number] | undefined;
        if (spread && frame >= spread.at) {
          const [cx, cy] = proj(spread.center) as [number, number];
          const [lx, ly] = proj(terr(id).properties.label) as [number, number];
          const dx = lx - cx, dy = ly - cy, L = Math.hypot(dx, dy) || 1;
          const t = ramp(frame, spread.at + i * 2, 24, ease.out);
          offset = [(dx / L) * spread.px * t, (dy / L) * spread.px * t];
        }
        return <Fill key={id} id={id} color={colors[i % colors.length]} start={start + i * stagger} exit={exit} mode="pop" opacity={opacity} offset={offset} />;
      })}
    </>
  );
};

/** River that draws on from source to mouth (thin cyan, §Ch1). */
export const River: React.FC<{ name: string; start: number; dur?: number; width?: number; color?: string }> = ({ name, start, dur = 70, width = 5, color = '#7FD3F2' }) => {
  const frame = useCurrentFrame();
  const { path, scale } = useRMap();
  const f = (RIVERS as unknown as FeatureCollection).features.find((x) => x.id === name);
  const d = useMemo(() => (f ? path(f) : ''), [f, path]);
  if (!f || frame < start) return null;
  const k = ramp(frame, start, dur, ease.inOut);
  // no CSS filter here: a filter on a world-sized SVG element is re-rasterised every frame (≈20× slower renders)
  return (
    <g>
      <path d={d} fill="none" stroke="rgba(0,40,80,0.45)" strokeWidth={(width + 4) / scale} strokeLinecap="round" strokeLinejoin="round" pathLength={1}
        strokeDasharray="1 1" strokeDashoffset={1 - k} />
      <path d={d} fill="none" stroke={color} strokeWidth={width / scale} strokeLinecap="round" strokeLinejoin="round" pathLength={1}
        strokeDasharray="1 1" strokeDashoffset={1 - k} />
    </g>
  );
};

/** Catmull-Rom through points (lon/lat → world px). */
const smoothPath = (pts: [number, number][]) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
};

/**
 * Army / journey route (§2.7, Russia): thick WHITE brush stroke with a RED arrowhead that draws on;
 * thickness = army size (`widths` tapers it, e.g. Napoleon's retreat). dotted = a traveller's route.
 */
export const Route: React.FC<{
  pts: [number, number][]; // lon/lat
  start: number;
  dur?: number;
  width?: number; // screen px at the start
  endWidth?: number; // screen px at the end (taper)
  color?: string;
  head?: string | false;
  dotted?: boolean;
  exit?: number;
  token?: React.ReactNode; // rides the tip (head icon)
}> = ({ pts, start, dur = 70, width = 26, endWidth, color = '#FFFFFF', head = RC.stampRed, dotted, exit, token }) => {
  const frame = useCurrentFrame();
  const { proj, scale } = useRMap();
  const P = useMemo(() => pts.map((p) => proj(p) as [number, number]), [pts, proj]);
  // dense polyline along the smooth curve
  const dense = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] ?? P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] ?? p2;
      for (let s = 0; s < 24; s++) {
        const t = s / 24, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)) as [number, number]);
      }
    }
    out.push(P[P.length - 1]);
    return out;
  }, [P]);
  if (frame < start) return null;
  const outK = exit !== undefined ? 1 - ramp(frame, exit, 12, ease.in) : 1;
  if (outK <= 0) return null;
  const k = ramp(frame, start, dur, ease.inOut);
  const n = Math.max(2, Math.round(k * (dense.length - 1)) + 1);
  const seg = dense.slice(0, n);
  const w0 = width / scale, w1 = (endWidth ?? width) / scale;
  const tip = seg[seg.length - 1], prev = seg[Math.max(0, seg.length - 4)];
  const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
  // tapered body as a polygon (brush look): offset both sides by the local width
  const left: string[] = [], right: string[] = [];
  seg.forEach((p, i) => {
    const q = seg[Math.min(seg.length - 1, i + 1)], o = seg[Math.max(0, i - 1)];
    const a = Math.atan2(q[1] - o[1], q[0] - o[0]);
    const wi = (w0 + (w1 - w0) * (i / (dense.length - 1))) * (0.92 + 0.08 * Math.sin(i * 0.7)) / 2;
    left.push(`${p[0] - Math.sin(a) * wi},${p[1] + Math.cos(a) * wi}`);
    right.unshift(`${p[0] + Math.sin(a) * wi},${p[1] - Math.cos(a) * wi}`);
  });
  const wTip = w0 + (w1 - w0) * (n / dense.length);
  const hs = Math.max(wTip * 2.4, 34 / scale);
  return (
    <g opacity={outK}>
      {!dotted && <polygon points={[...left, ...right].join(' ')} fill="rgba(0,0,0,0.35)" transform={`translate(0 ${4 / scale})`} />}
      {dotted ? (
        <polyline points={seg.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={w0 * 0.45} strokeLinecap="round" strokeDasharray={`${w0 * 0.1} ${w0 * 0.9}`} />
      ) : (
        <polygon points={[...left, ...right].join(' ')} fill={color} />
      )}
      {head && (
        <polygon points={`${hs},0 ${-hs * 0.55},${hs * 0.62} ${-hs * 0.3},0 ${-hs * 0.55},${-hs * 0.62}`} fill={head}
          transform={`translate(${tip[0]} ${tip[1]}) rotate(${(ang * 180) / Math.PI})`} stroke="#fff" strokeWidth={2 / scale} />
      )}
      {token && <foreignObject x={tip[0]} y={tip[1]} width={1} height={1} style={{ overflow: 'visible' }}>{token}</foreignObject>}
    </g>
  );
};
export { smoothPath };

/** Dashed circle (siege) or dashed border line in world space. */
export const DashCircle: React.FC<{ at: [number, number]; r: number; start: number; color?: string; exit?: number }> = ({ at, r, start, color = RC.stampRed, exit }) => {
  const frame = useCurrentFrame();
  const { proj, scale } = useRMap();
  if (frame < start) return null;
  const [x, y] = proj(at) as [number, number];
  const o = exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1;
  const k = ramp(frame, start, 30, ease.out);
  return (
    <circle cx={x} cy={y} r={(r / scale) * (1.4 - 0.4 * k)} fill="rgba(200,30,43,0.12)" stroke={color} strokeWidth={8 / scale} strokeDasharray={`${26 / scale} ${16 / scale}`}
      opacity={o * k} transform={`rotate(${frame * 0.4} ${x} ${y})`} />
  );
};

/* ────────────────────────────── screen-space layers ────────────────────────────── */

/** Yellow teardrop pin + white handwritten label (§1.2). */
export const Pin: React.FC<{ lon: number; lat: number; label?: string; start: number; exit?: number; side?: 'r' | 'l' | 't'; size?: number; color?: string; labelColor?: string }> = ({
  lon, lat, label, start, exit, side = 'r', size = 64, color = '#F5C518', labelColor = RC.white,
}) => {
  const frame = useCurrentFrame();
  const { toScreen } = useRMap();
  if (frame < start) return null;
  const o = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (o <= 0) return null;
  const [x, y] = toScreen(lon, lat);
  const s = pop(frame, start, 1.15) * o;
  const drop = interpolate(frame - start, [0, 8], [-size * 0.6, 0], { ...clamp, easing: ease.out });
  return (
    <>
      <svg width={size} height={size * 1.4} viewBox="0 0 40 56" style={{ position: 'absolute', left: x - size / 2, top: y - size * 1.4 + drop, overflow: 'visible',
        transform: `scale(${s})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))' }}>
        <path d="M20 56 C 8 38 2 30 2 20 A 18 18 0 1 1 38 20 C 38 30 32 38 20 56 Z" fill={color} stroke="#5A4300" strokeWidth={2} />
        <circle cx="20" cy="20" r="7" fill="#fff" opacity={0.85} />
      </svg>
      {label && (
        <div style={{ position: 'absolute', left: side === 'l' ? x - size * 0.7 : side === 't' ? x : x + size * 0.7, top: side === 't' ? y - size * 1.9 : y - size * 0.75,
          transform: `translate(${side === 'l' ? '-100%' : side === 't' ? '-50%' : '0'}, -50%) scale(${pop(frame, start + 6) * o})`, transformOrigin: side === 'l' ? '100% 50%' : '0 50%',
          ...hand(size * 1.05, labelColor) }}>
          {label}
        </div>
      )}
    </>
  );
};

/** White handwritten label anchored at lon/lat (territory / tribe / sea names). */
export const MapLabel: React.FC<{ lon: number; lat: number; text: string; start: number; exit?: number; size?: number; color?: string; rotate?: number }> = ({
  lon, lat, text, start, exit, size = 96, color = RC.white, rotate = 0,
}) => {
  const frame = useCurrentFrame();
  const { toScreen } = useRMap();
  if (frame < start) return null;
  const o = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (o <= 0) return null;
  const [x, y] = toScreen(lon, lat);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${pop(frame, start) * o})`, ...hand(size, color) }}>
      {text}
    </div>
  );
};

/** Anything (icon, token, character) placed at lon/lat in screen space; pops in, optional float bob. */
export const At: React.FC<{ lon: number; lat: number; start: number; exit?: number; over?: number; bob?: number; children: React.ReactNode; dx?: number; dy?: number }> = ({
  lon, lat, start, exit, over = 1.12, bob = 0, children, dx = 0, dy = 0,
}) => {
  const frame = useCurrentFrame();
  const { toScreen } = useRMap();
  if (frame < start) return null;
  const o = exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1;
  if (o <= 0) return null;
  const [x, y] = toScreen(lon, lat);
  const b = bob ? Math.sin(frame / 14 + lon) * bob : 0;
  return (
    <div style={{ position: 'absolute', left: x + dx, top: y + dy + b, transform: `translate(-50%, -50%) scale(${pop(frame, start, over) * o})` }}>{children}</div>
  );
};

/** Moves a screen-space token along lon/lat points over [start, start+dur] (riders, ships, traders). */
export const Traveller: React.FC<{ pts: [number, number][]; start: number; dur: number; children: (dir: number) => React.ReactNode; exit?: number }> = ({ pts, start, dur, children, exit }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useRMap();
  if (frame < start) return null;
  if (exit !== undefined && frame > exit) return null;
  const k = ramp(frame, start, dur, ease.inOut);
  const S = pts.map((p) => toScreen(p[0], p[1]));
  const L: number[] = [0];
  for (let i = 1; i < S.length; i++) L.push(L[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
  const target = k * L[L.length - 1];
  let i = 1;
  while (i < S.length - 1 && L[i] < target) i++;
  const u = (target - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  const x = S[i - 1][0] + (S[i][0] - S[i - 1][0]) * u, y = S[i - 1][1] + (S[i][1] - S[i - 1][1]) * u;
  const dir = Math.sign(S[i][0] - S[i - 1][0]) || 1;
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) scale(${pop(frame, start)})` }}>{children(dir)}</div>;
};

/** Googly eyes on a territory (diplomacy gags, "glaring at each other"). */
export const MapEyes: React.FC<{ lon: number; lat: number; start: number; size?: number; look?: number; angry?: boolean; exit?: number }> = ({ lon, lat, start, size = 70, look = 0, angry, exit }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useRMap();
  if (frame < start) return null;
  if (exit !== undefined && frame > exit) return null;
  const [x, y] = toScreen(lon, lat);
  const blink = (frame + Math.round(lon * 13)) % 150 < 5;
  const l = look + Math.sin(frame / 25 + lat) * 0.25;
  return (
    <svg width={size * 2.2} height={size} viewBox="0 0 110 50" style={{ position: 'absolute', left: x - size * 1.1, top: y - size / 2, overflow: 'visible', transform: `scale(${pop(frame, start, 1.2)})` }}>
      {[30, 80].map((cx, i) => (
        <g key={cx}>
          <ellipse cx={cx} cy={25} rx={20} ry={blink ? 2 : 22} fill="#fff" stroke={RC.ink} strokeWidth={3.5} />
          {!blink && <circle cx={cx + l * 8} cy={28} r={8} fill={RC.ink} />}
          {angry && <line x1={cx - 20} y1={i === 0 ? -6 : 4} x2={cx + 20} y2={i === 0 ? 4 : -6} stroke={RC.ink} strokeWidth={6} strokeLinecap="round" />}
        </g>
      ))}
    </svg>
  );
};

/** Floating icon sprite drifting between two lon/lat points (tribute sacks, coins, grain). */
export const Flow: React.FC<{ from: [number, number]; to: [number, number]; start: number; count?: number; every?: number; life?: number; children: React.ReactNode; exit?: number; arc?: number }> = ({
  from, to, start, count = 6, every = 14, life = 46, children, exit, arc = 80,
}) => {
  const frame = useCurrentFrame();
  const { toScreen } = useRMap();
  if (frame < start) return null;
  const [ax, ay] = toScreen(from[0], from[1]);
  const [bx, by] = toScreen(to[0], to[1]);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const t0 = start + i * every;
    const u = (frame - t0) / life;
    if (u < 0 || u > 1) continue;
    if (exit !== undefined && t0 > exit) continue;
    const e = ease.inOut(u);
    const x = ax + (bx - ax) * e, y = ay + (by - ay) * e - Math.sin(u * Math.PI) * arc;
    nodes.push(<div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${Math.min(1, u * 6, (1 - u) * 6)}) rotate(${(random(`fl${i}`) - 0.5) * 30}deg)` }}>{children}</div>);
  }
  return <>{nodes}</>;
};

export const HANDFONT = HAND;

/**
 * A territory that cracks like glass: jagged wedges around `center` (lon/lat), crack lines flash white,
 * pieces drift apart at `breakAt` and snap back together at `mendAt` (Russia breaks · rises again).
 */
export const ShatterFill: React.FC<{ id: string; color: string; center: [number, number]; start: number; breakAt: number; mendAt?: number; pieces?: number; exit?: number; opacity?: number }> = ({
  id, color, center, start, breakAt, mendAt, pieces = 9, exit, opacity = 0.62,
}) => {
  const frame = useCurrentFrame();
  const { path, proj, scale } = useRMap();
  const d = useMemo(() => path(terr(id)), [id, path]);
  if (frame < start) return null;
  const o = exit !== undefined ? 1 - ramp(frame, exit, 12, ease.in) : 1;
  const [cx, cy] = proj(center) as [number, number];
  const R = 40000;
  const angs = Array.from({ length: pieces }, (_, i) => ((i + 0.5 * random(`sa${i}`)) / pieces) * Math.PI * 2);
  const apart = frame < breakAt ? 0 : ramp(frame, breakAt + 6, 26, ease.out) * (mendAt !== undefined ? 1 - ramp(frame, mendAt, 18, ease.inOut) : 1);
  const crackK = frame < breakAt ? 0 : ramp(frame, breakAt, 7, ease.out);
  const crackFade = mendAt !== undefined ? 1 - ramp(frame, mendAt + 10, 12, ease.out) : 1;
  return (
    <g opacity={o}>
      <defs>
        {angs.map((a, i) => {
          const b = angs[(i + 1) % pieces] + (i === pieces - 1 ? Math.PI * 2 : 0);
          // jagged wedge edge: a few kinks along each ray
          const ray = (t: number, k: number) => {
            const pts: string[] = [];
            for (let s = 1; s <= 5; s++) {
              const rr = (s / 5) * R * (s === 5 ? 1 : 0.06 * s);
              const j = (random(`j${k}${s}`) - 0.5) * 0.25;
              pts.push(`${cx + Math.cos(t + j) * rr},${cy + Math.sin(t + j) * rr}`);
            }
            return pts;
          };
          const pts = [`${cx},${cy}`, ...ray(a, i), ...ray(b, (i + 1) % pieces).reverse()];
          return <clipPath key={i} id={`sh-${id}-${i}`}><polygon points={pts.join(' ')} /></clipPath>;
        })}
      </defs>
      {angs.map((a, i) => {
        const mid = a + Math.PI / pieces;
        const dist = (90 + 60 * random(`sd${i}`)) / scale * apart;
        const rot = (random(`sr${i}`) - 0.5) * 8 * apart;
        return (
          <g key={i} clipPath={`url(#sh-${id}-${i})`} transform={`translate(${Math.cos(mid) * dist} ${Math.sin(mid) * dist}) rotate(${rot} ${cx} ${cy})`}>
            <path d={d} fill={color} fillOpacity={opacity} stroke="rgba(255,255,255,0.9)" strokeWidth={3 / scale} fillRule="evenodd" />
          </g>
        );
      })}
      <clipPath id={`shc-${id}`}><path d={d} /></clipPath>
      <g clipPath={`url(#shc-${id})`}>
      {crackK > 0 && crackFade > 0 && angs.map((a, i) => {
        const pts: string[] = [`${cx},${cy}`];
        for (let s = 1; s <= 6; s++) {
          const rr = (s / 6) * (1500 / scale) * crackK * 2.2;
          const j = (random(`j${i}${Math.min(5, s)}`) - 0.5) * 0.25;
          pts.push(`${cx + Math.cos(a + j) * rr},${cy + Math.sin(a + j) * rr}`);
        }
        return <polyline key={i} points={pts.join(' ')} fill="none" stroke="#fff" strokeWidth={(7 / scale) * (1 - apart * 0.5)} opacity={crackFade} strokeLinejoin="bevel" />;
      })}
      </g>
    </g>
  );
};
