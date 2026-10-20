import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { pop, ramp } from './theme';

// w16_war_arrows (line 8, "अब Canada ने क्या किया होगा? जंग का ऐलान?"; the reference's 39.2–42.2 s): three thick red
// arrows shoot out of the west in staggered arcs and converge on the island, and tiny planes and tanks pop up and creep
// along behind them, like a war-plan map. The edit floods Canada red under it. Transparent, 1080×1080, 60 fps; the
// arrows start at x ≈ 60 and meet at `target`.
const Plane: React.FC = () => <path d="M -14 0 L 14 0 M 0 -10 L 4 0 L 0 10 M -12 -5 L -10 0 L -12 5" stroke="#3A0A0A" strokeWidth={4} fill="none" strokeLinecap="round" />;
const Tank: React.FC = () => (
  <g fill="#3A0A0A"><rect x={-14} y={-5} width={28} height={10} rx={4} /><rect x={-6} y={-11} width={12} height={7} rx={2} /><rect x={4} y={-9} width={16} height={3} /></g>
);
export const W16WarArrows: React.FC<{ target?: [number, number] }> = ({ target = [960, 560] }) => {
  const f = useCurrentFrame();
  const starts: [number, number, number][] = [[60, 300, -150], [60, 560, 0], [60, 820, 150]];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        {starts.map(([x0, y0, bend], i) => {
          const k = ramp(f, i * 5, i * 5 + 30, Easing.inOut(Easing.cubic));
          const [x1, y1] = target;
          const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + bend * 0.6 - (bend === 0 ? 0 : 0);
          const ang = (Math.atan2(y1 - my, x1 - mx) * 180) / Math.PI;
          // the head along the curve
          const t = k, hx = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, hy = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1;
          const tx = 2 * (1 - t) * (mx - x0) + 2 * t * (x1 - mx), ty = 2 * (1 - t) * (my - y0) + 2 * t * (y1 - my);
          return (
            <g key={i}>
              <path d={`M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`} stroke="#E8262B" strokeWidth={20} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${k * 0.97} 1`} />
              {k > 0.02 && <path d="M -18 -26 L 30 0 L -18 26 Z" fill="#E8262B" transform={`translate(${hx} ${hy}) rotate(${(Math.atan2(ty, tx) * 180) / Math.PI || ang})`} />}
            </g>
          );
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const s = pop(f, 20 + i * 3, 30 + i * 3, 2.4);
          const x = 110 + (i % 3) * 70 + Math.max(0, f - 40) * 0.6, y = 280 + Math.floor(i / 3) * 260 + (i % 2) * 40;
          return s > 0 ? <g key={i} transform={`translate(${x} ${y}) scale(${s * 1.6})`}>{i % 2 ? <Tank /> : <Plane />}</g> : null;
        })}
        <circle cx={target[0]} cy={target[1]} r={12 + 4 * Math.sin(f / 4)} fill="#5A4BD0" stroke="#fff" strokeWidth={4} />
      </svg>
    </AbsoluteFill>
  );
};
