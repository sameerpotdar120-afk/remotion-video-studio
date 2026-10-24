import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { C, clamp } from './theme';

// w10_crack (line 9, "और ये देश टूट गया"): a jagged crack races along `pts` (screen points, e.g. across the joined
// Federation fill, starting at Jamaica) in 12 frames with a white-hot core and a red glow, branching twice; then the
// two sides of the crack pull apart (the edit moves the fills) while chips and dust fall from it. Transparent,
// 1080×1080, 60 fps.
type Pt = [number, number];
export const W10Crack: React.FC<{ pts?: Pt[] }> = ({ pts = [[160, 700], [360, 560], [470, 600], [620, 430], [760, 470], [920, 300]] }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  // jag the polyline
  const jag: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    for (let k = 0; k < 4; k++) {
      const u = k / 4, n = (random(`cr${i}${k}`) - 0.5) * 34;
      const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
      jag.push([ax + dx * u - (dy / L) * n, ay + dy * u + (dx / L) * n]);
    }
  }
  jag.push(pts[pts.length - 1]);
  const d = jag.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
  let L = 0;
  for (let i = 1; i < jag.length; i++) L += Math.hypot(jag[i][0] - jag[i - 1][0], jag[i][1] - jag[i - 1][1]);
  const br = (i: number, dx: number, dy: number) => {
    const [x, y] = jag[i];
    return `M ${x} ${y} l ${dx * 0.5} ${dy * 0.5} l ${dx * 0.5 + 10} ${dy * 0.5 - 8}`;
  };
  const glow = 1 - interpolate(f, [12, 50], [0, 0.6], clamp);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={d} stroke={C.red} strokeWidth={26} fill="none" opacity={0.45 * glow} strokeDasharray={`${L * p} ${L}`} strokeLinejoin="round" style={{ filter: 'blur(8px)' }} />
        <path d={d} stroke="#120608" strokeWidth={12} fill="none" strokeDasharray={`${L * p} ${L}`} strokeLinejoin="round" />
        <path d={d} stroke="#FFF0E0" strokeWidth={3.5} fill="none" opacity={glow} strokeDasharray={`${L * p} ${L}`} strokeLinejoin="round" />
        {p > 0.4 && <path d={br(6, 60, 70)} stroke="#120608" strokeWidth={6} fill="none" opacity={Math.min(1, (p - 0.4) * 4)} />}
        {p > 0.7 && <path d={br(14, -50, -80)} stroke="#120608" strokeWidth={6} fill="none" opacity={Math.min(1, (p - 0.7) * 4)} />}
      </svg>
      {f > 10 && Array.from({ length: 22 }, (_, i) => {
        const t = interpolate(f, [10 + (i % 6) * 2, 60 + (i % 6) * 2], [0, 1], clamp);
        const [x, y] = jag[Math.floor(random(`ch${i}`) * (jag.length - 1))];
        return <div key={i} style={{ position: 'absolute', left: x + (random(`cx${i}`) - 0.5) * 60 * t, top: y + 260 * t * t, width: 8, height: 6, background: i % 3 ? '#C9C1B2' : C.red, transform: `rotate(${t * 400 + i * 30}deg)`, opacity: 1 - t }} />;
      })}
    </AbsoluteFill>
  );
};
