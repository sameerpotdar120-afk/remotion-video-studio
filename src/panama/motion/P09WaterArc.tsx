import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { ramp } from './theme';

// p09_water_arc (line 3, "हर एक ship के साथ करीब 20 करोड़ लीटर मीठा पानी समुंदर में बह जाता है"; the reference's
// 21–26 s): a thick glowing ribbon of fresh water arcs from the lake (left) over the locks down into the sea (right).
// It grows along the arc in 24 frames, then bright dashes keep streaming along it, droplets spray off the outer edge,
// and a splash ring pulses where it lands. Transparent, 1080×1080, 60 fps.
const bez = (t: number, p: number[]) => {
  const u = 1 - t;
  return [u * u * p[0] + 2 * u * t * p[2] + t * t * p[4], u * u * p[1] + 2 * u * t * p[3] + t * t * p[5]];
};
export const P09WaterArc: React.FC<{ p?: number[] }> = ({ p = [140, 560, 560, 40, 960, 820] }) => {
  const f = useCurrentFrame();
  const k = ramp(f, 0, 24);
  const pts = Array.from({ length: 41 }, (_, i) => bez((i / 40) * k, p));
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [ex, ey] = bez(1, p);
  const ring = ((f % 30) / 30);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="arcG" x1="0" x2="1"><stop offset="0" stopColor="#BFF4FF" /><stop offset="1" stopColor="#5FD0FF" /></linearGradient>
        </defs>
        <path d={d} stroke="#6FE6FF" strokeWidth={60} fill="none" strokeLinecap="round" opacity={0.25} style={{ filter: 'blur(14px)' }} />
        <path d={d} stroke="url(#arcG)" strokeWidth={30} fill="none" strokeLinecap="round" opacity={0.9} />
        <path d={d} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="40 60" strokeDashoffset={-f * 9} opacity={0.9} />
        {k > 0.5 && Array.from({ length: 16 }, (_, i) => {
          const t = ((f * 0.02 + random(`dt${i}`)) % 1);
          const [x, y] = bez(Math.min(k, t), p);
          const life = ((f + i * 5) % 20) / 20;
          return <circle key={i} cx={x + (random(`dx${i}`) - 0.3) * 40 * life} cy={y - 20 * life + 40 * life * life} r={5 + 4 * random(`dr${i}`)} fill="#E8FBFF" opacity={1 - life} />;
        })}
        {k >= 1 && (
          <g transform={`translate(${ex} ${ey})`}>
            <ellipse rx={40 + 90 * ring} ry={(40 + 90 * ring) * 0.3} fill="none" stroke="#fff" strokeWidth={5} opacity={1 - ring} />
            <ellipse rx={50} ry={14} fill="#E8FBFF" opacity={0.7 + 0.3 * Math.sin(f / 4)} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
