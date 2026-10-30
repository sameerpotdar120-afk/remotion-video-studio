import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// s16_tunnel_rush (line 8, a quick insert): flying through a tunnel being built. Concentric horseshoe lining rings
// rush past the camera, work lights streak along both walls, rails run to the vanishing point, and at the far end a
// drill rig's silhouette is lit by a hot glow with sparks. Speed eases from fast to slower. Full frame.
const VX = 540, VY = 900;
const ring = (s: number) => { const w = 560 * s, h = 760 * s; return `M${VX - w},${VY + h * 0.55} V${VY - h * 0.2} A${w},${w * 0.95} 0 0 1 ${VX + w},${VY - h * 0.2} V${VY + h * 0.55}`; };
export const S16TunnelRush: React.FC<{ dur?: number }> = ({ dur = 90 }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], [0, 1], clamp);
  const travel = f * 0.055 - z * z * 1.2;
  return (
    <AbsoluteFill style={{ background: '#0a0806', overflow: 'hidden' }}>
      <svg width={1080} height={1920}>
        <defs>
          <radialGradient id="trG" cx={VX} cy={VY} r={420} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFD58A" /><stop offset="0.25" stopColor="#B26A22" stopOpacity={0.7} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient>
        </defs>
        <rect width={1080} height={1920} fill="#14100C" />
        <circle cx={VX} cy={VY} r={420} fill="url(#trG)" />
        {/* drill rig at the face */}
        <g transform={`translate(${VX},${VY + 40}) scale(0.9)`} fill="#0b0805">
          <rect x={-70} y={-10} width={140} height={60} rx={6} />
          <rect x={-40} y={-60} width={80} height={56} rx={4} />
          <path d="M-60,-10 L-150,-80 L-140,-92 L-46,-28Z M60,-10 L150,-86 L160,-74 L46,-28Z" />
          <rect x={-170} y={-100} width={40} height={14} /><rect x={130} y={-104} width={40} height={14} />
        </g>
        {Array.from({ length: 16 }, (_, i) => {
          const a = random(`sp${i}`) * Math.PI * 2, d = ((f * 6 + random(`sd${i}`) * 80) % 80);
          return <circle key={i} cx={VX + Math.cos(a) * d * 1.6} cy={VY - 50 + Math.sin(a) * d - d * 0.3} r={2.4} fill="#FFE7A0" opacity={1 - d / 80} />;
        })}
        {/* lining rings: depth k in [0,1), scale ~ 1/(1-k) */}
        {Array.from({ length: 22 }, (_, i) => {
          const k = ((i / 22 + travel) % 1 + 1) % 1, s = 0.08 / (1.04 - k);
          if (s > 3) return null;
          const a = Math.min(1, (k - 0.02) * 4) * (s > 1.8 ? (3 - s) / 1.2 : 1);
          return <path key={i} d={ring(s)} fill="none" stroke={i % 3 ? '#8B8F92' : '#C8CDD0'} strokeWidth={Math.max(2, 26 * s)} opacity={Math.max(0, a) * 0.85} />;
        })}
        {/* wall lights */}
        {Array.from({ length: 14 }, (_, i) => {
          const k = ((i / 14 + travel * 1.0) % 1 + 1) % 1, s = 0.08 / (1.04 - k);
          if (s > 3) return null;
          return [-1, 1].map((sd) => {
            const x = VX + sd * 520 * s, y = VY - 40 * s, len = 40 * s * s;
            return <line key={`${i}${sd}`} x1={x} y1={y} x2={x + sd * len} y2={y - len * 0.08} stroke="#FFF2C8" strokeWidth={Math.max(2, 9 * s)} strokeLinecap="round" opacity={Math.min(1, k * 3)} />;
          });
        })}
        {/* rails */}
        <path d={`M${VX - 12},${VY + 60} L${VX - 380},1920 M${VX + 12},${VY + 60} L${VX + 380},1920`} stroke="#C9D0D4" strokeWidth={10} />
        {Array.from({ length: 18 }, (_, i) => {
          const k = ((i / 18 + travel * 1.0) % 1 + 1) % 1, s = 0.08 / (1.04 - k);
          const y = VY + 60 + 520 * s;
          if (y > 1960) return null;
          return <line key={i} x1={VX - 26 - 360 * s} y1={y} x2={VX + 26 + 360 * s} y2={y} stroke="#4A3826" strokeWidth={Math.max(2, 14 * s)} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 47%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)' }} />
    </AbsoluteFill>
  );
};
