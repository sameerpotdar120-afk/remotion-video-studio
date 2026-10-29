import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// c09_line_morph (line 5–6, the reference's 0:33–0:36: the city's outline becomes a human body, the body becomes the
// plan's square frame): black hand-drawn line art on paper. `shapes` are closed outlines in a unit box (0..1, x right,
// y down), each resampled to the same number of points; `keys` = [frame, shape index] morphs between them
// point-to-point (ease-in-out, 30 frames by default) through a twisting in-between, like the reference. The first
// shape draws on over `drawDur` frames. The line boils a pixel every 6 frames. `box` = [x, y, w, h] in screen px.
const N = 240;
export const resample = (pts: number[][], n = N): number[][] => {
  const ring = [...pts, pts[0]];
  const seg = ring.slice(1).map((p, i) => Math.hypot(p[0] - ring[i][0], p[1] - ring[i][1]));
  const L = seg.reduce((a, b) => a + b, 0);
  const out: number[][] = [];
  let j = 0, acc = 0;
  for (let k = 0; k < n; k++) {
    const t = (k / n) * L;
    while (j < seg.length - 1 && acc + seg[j] < t) { acc += seg[j]; j++; }
    const u = seg[j] ? (t - acc) / seg[j] : 0;
    out.push([ring[j][0] + (ring[j + 1][0] - ring[j][0]) * u, ring[j][1] + (ring[j + 1][1] - ring[j][1]) * u]);
  }
  // start from the top-most point so morphs don't spin
  let s = 0;
  out.forEach((p, i) => { if (p[1] < out[s][1]) s = i; });
  return [...out.slice(s), ...out.slice(0, s)];
};
/** A standing human figure, front view, in a unit box (head at the top). */
export const BODY: number[][] = (() => {
  const half = [[0.5, 0.0], [0.56, 0.01], [0.59, 0.05], [0.59, 0.1], [0.56, 0.14], [0.55, 0.17], [0.62, 0.19], [0.71, 0.22], [0.75, 0.28], [0.78, 0.4], [0.81, 0.5], [0.84, 0.54],
    [0.82, 0.56], [0.78, 0.53], [0.73, 0.42], [0.7, 0.33], [0.68, 0.42], [0.67, 0.52], [0.66, 0.6], [0.64, 0.75], [0.63, 0.92], [0.66, 0.99], [0.56, 1.0], [0.55, 0.92], [0.54, 0.76], [0.52, 0.62], [0.5, 0.58]];
  const left = half.slice(0, -1).reverse().map(([x, y]) => [1 - x, y]);
  return [...half, ...left.slice(0, -1)];
})();
export const SQUARE: number[][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
/** A closed ring in screen px or metres, normalised into a unit box keeping its aspect (y down). */
export const unit = (ring: number[][], flipY = false) => {
  const xs = ring.map((p) => p[0]), ys = ring.map((p) => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys), s = Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0);
  return ring.map(([x, y]) => [(x - x0) / s, flipY ? 1 - (y - y0) / s : (y - y0) / s]);
};
export const C09LineMorph: React.FC<{ shapes: number[][][]; keys: [number, number][]; box: [number, number, number, number]; width?: number; drawDur?: number; morph?: number; color?: string; glow?: number }> = ({
  shapes, keys, box, width = 4, drawDur = 16, morph = 20, color = '#111', glow = 0,
}) => {
  const f = useCurrentFrame();
  const R = React.useMemo(() => shapes.map((s) => resample(s)), [shapes]);
  let a = keys[0][1], b = keys[0][1], u = 0;
  for (let i = 1; i < keys.length; i++) if (f >= keys[i][0]) { a = keys[i - 1][1]; b = keys[i][1]; u = interpolate(f, [keys[i][0], keys[i][0] + morph], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }); if (u < 1) break; a = b; }
  const twist = Math.sin(u * Math.PI) * 0.35;
  const boil = Math.floor(f / 6);
  const [x0, y0, w, h] = box;
  const pts = R[a].map((p, i) => {
    const q = R[b][i];
    let x = p[0] + (q[0] - p[0]) * u, y = p[1] + (q[1] - p[1]) * u;
    x += twist * (y - 0.5) * 0.3; y += twist * Math.sin(i / 9) * 0.03;
    const j = Math.sin(boil * 12.9 + i * 0.7) * 0.0025;
    return [x0 + (x + j) * w, y0 + (y + j) * h];
  });
  const d = 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
  const draw = interpolate(f, [keys[0][0], keys[0][0] + drawDur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        {glow > 0 && <path d={d} fill="none" stroke="#FFD27A" strokeWidth={width * 5} opacity={glow * 0.6} style={{ filter: 'blur(8px)' }} />}
        <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${draw} 2`} />
      </svg>
    </AbsoluteFill>
  );
};
