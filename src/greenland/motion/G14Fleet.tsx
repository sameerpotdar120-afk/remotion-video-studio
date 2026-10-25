import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, clamp, pop } from './theme';

// g14_fleet (line 9, "25 जहाज़ भरकर लोग Greenland के लिए निकल पड़े"): 25 sailing routes fan out from `from` (Iceland,
// screen px) toward `to` (Greenland's south-west coast), one after another every `step` frames, each a thin dashed
// line drawing in an arc with a slightly different bend, a small longship (gl03) riding each tip; a big counter ticks
// 1 → 25 with every launch, bumping on each tick, "जहाज़" under it. Transparent, 1080×1920, 60 fps.
export const G14Fleet: React.FC<{ from?: [number, number]; to?: [number, number]; n?: number; step?: number; travel?: number; ship?: string; counter?: [number, number]; color?: string }> = ({
  from = [820, 1180], to = [330, 1060], n = 25, step = 5, travel = 90, ship, counter = [540, 420], color = '#FFFFFF',
}) => {
  useFonts();
  const f = useCurrentFrame();
  const launched = Math.max(0, Math.min(n, Math.floor(f / step) + 1));
  const tick = f % step;
  const bump = launched < n || tick < 8 ? 1 + 0.08 * Math.exp(-tick / 3) : 1;
  const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {Array.from({ length: n }, (_, i) => {
          const at = i * step;
          const p = interpolate(f, [at, at + travel], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
          if (p <= 0) return null;
          const bend = (random(`b${i}`) - 0.5) * L * 0.5 - L * 0.12;
          const ex = to[0] + (random(`ex${i}`) - 0.5) * 120, ey = to[1] + (random(`ey${i}`) - 0.5) * 200;
          const cx = (from[0] + ex) / 2 + (-dy / L) * bend, cy = (from[1] + ey) / 2 + (dx / L) * bend;
          const d = `M ${from[0]} ${from[1]} Q ${cx} ${cy} ${ex} ${ey}`;
          const q = (t: number) => [(1 - t) ** 2 * from[0] + 2 * (1 - t) * t * cx + t * t * ex, (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * cy + t * t * ey];
          const [tx, ty] = q(p), [ux, uy] = q(Math.min(1, p + 0.01));
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={color} strokeWidth={3.5} strokeDasharray={`${p * 1000} 3000`} opacity={0.85} style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.6))' }} />
              {ship ? <image href={ship} x={tx - 34} y={ty - 30} width={68} height={38} transform={`rotate(${Math.sin(f / 11 + i) * 3} ${tx} ${ty}) ${ux < tx ? `translate(${2 * tx},0) scale(-1,1)` : ''}`} />
                : <circle cx={tx} cy={ty} r={7} fill={color} stroke={C.ink} strokeWidth={2} />}
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: counter[0], top: counter[1], transform: `translate(-50%,-50%) scale(${pop(f, 0, 10, 2.2) * bump})`, textAlign: 'center',
        padding: '10px 40px 4px', borderRadius: 30, background: 'rgba(255,255,255,0.94)', border: `6px solid ${C.greenDeep}`, boxShadow: '0 14px 24px rgba(0,0,0,0.35)' }}>
        <div style={{ fontFamily: NUM, fontSize: 170, lineHeight: 1, color: C.greenDeep }}>{launched}</div>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 60, lineHeight: 1.2, color: C.ink }}>जहाज़</div>
      </div>
    </AbsoluteFill>
  );
};
