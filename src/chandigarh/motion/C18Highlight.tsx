import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// c18_highlight (line 11, the reference's 1:28 and 1:31: the High Court's curved roof in purple, the Secretariat's
// honeycomb facade swept in magenta): a translucent colour overlay on a region of a photo (`points`, screen px).
// `roof`: it fills in from left to right (16 frames), gets a bright outline and lifts a few px with a shadow.
// `strips`: the colour sweeps across in vertical strips, one after another, each fading as the next arrives, with a
// cyan glow along the base (the reference's facade). Transparent, 1080×1920.
export const C18Highlight: React.FC<{ points: [number, number][]; color?: string; mode?: 'roof' | 'strips'; strips?: number; out?: number }> = ({ points, color = '#8A1FC8', mode = 'roof', strips = 5, out }) => {
  const f = useCurrentFrame();
  const o = out !== undefined ? interpolate(f, [out, out + 12], [1, 0], clamp) : 1;
  const xs = points.map((p) => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
  const poly = `polygon(${points.map(([x, y]) => `${x}px ${y}px`).join(',')})`;
  const d = 'M' + points.map(([x, y]) => `${x},${y}`).join('L') + 'Z';
  if (mode === 'roof') {
    const t = interpolate(f, [0, 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    const lift = 8 * interpolate(f, [12, 24], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
    return (
      <AbsoluteFill style={{ opacity: o }}>
        <AbsoluteFill style={{ clipPath: poly, background: 'rgba(0,0,0,0.35)', transform: `translate(6px, ${10}px)`, filter: 'blur(6px)', opacity: lift / 8 }} />
        <AbsoluteFill style={{ clipPath: poly, transform: `translateY(${-lift}px)` }}>
          <div style={{ position: 'absolute', left: x0, top: 0, width: (x1 - x0) * t, height: 1920, background: color, opacity: 0.55, mixBlendMode: 'multiply' }} />
          <div style={{ position: 'absolute', left: x0, top: 0, width: (x1 - x0) * t, height: 1920, background: color, opacity: 0.14 }} />
        </AbsoluteFill>
        <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible', transform: `translateY(${-lift}px)` }}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={3} pathLength={1} strokeDasharray={`${t} 2`} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        </svg>
      </AbsoluteFill>
    );
  }
  const w = (x1 - x0) / strips;
  return (
    <AbsoluteFill style={{ opacity: o, clipPath: poly }}>
      {Array.from({ length: strips }, (_, i) => {
        const a = interpolate(f, [i * 12, i * 12 + 8, i * 12 + 30, i * 12 + 44], [0, 1, 1, 0.25], clamp);
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: x0 + i * w, top: 0, width: w + 1, height: 1920, background: color, opacity: 0.62 * a, mixBlendMode: 'multiply' }} />
            <div style={{ position: 'absolute', left: x0 + i * w, top: 0, width: w + 1, height: 1920, background: `linear-gradient(0deg, rgba(90,230,255,${0.6 * a}), rgba(0,0,0,0) 18%)` }} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
