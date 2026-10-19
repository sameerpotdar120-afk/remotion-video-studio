import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { PP0, Plush } from './Plush';
import { C, clamp } from './theme';

// h17_grab (line 11, "Burgundy के सैनिकों ने उसे पकड़कर England को बेच दिया"; the reference's 75.8–77.8 s): a white
// cartoon glove on a long black curving arm shoots out from `from` (Burgundy, in the edit), grabs the little Joan figure
// at `at`, and pulls her back along the arm to `to` (Rouen); on the way, a coin bag flies the other way to `pay`
// (England). Points are frame pixels. Transparent, 1080×1920, 60 fps, 180 frames.
type Pt = [number, number];
const Glove: React.FC<{ open: number }> = ({ open }) => (
  <g stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
    <rect x={-70} y={-30} width={34} height={60} rx={10} fill="#EDEDED" />
    <path d={`M -40 -40 Q 10 -56 34 ${-30 - open * 20} Q 60 ${-20 - open * 10} 56 0 Q 60 ${20 + open * 10} 34 ${30 + open * 20} Q 0 46 -40 40 Z`} fill="#fff" />
    <path d={`M -10 -40 Q 4 -70 26 -58`} fill="none" />
  </g>
);

export const H17Grab: React.FC<{ from?: Pt; at?: Pt; to?: Pt; pay?: Pt }> = ({ from = [880, 700], at = [540, 1000], to = [430, 820], pay = [300, 420] }) => {
  const f = useCurrentFrame();
  const reach = interpolate(f, [0, 22], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const pull = interpolate(f, [40, 90], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const tip: Pt = [from[0] + (at[0] - from[0]) * reach + (to[0] - at[0]) * pull, from[1] + (at[1] - from[1]) * reach + (to[1] - at[1]) * pull];
  const mid: Pt = [(from[0] + tip[0]) / 2, Math.min(from[1], tip[1]) - 160];
  const grabbed = f >= 26;
  const ang = (Math.atan2(tip[1] - mid[1], tip[0] - mid[0]) * 180) / Math.PI;
  const bag = interpolate(f, [70, 110], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const bx = to[0] + (pay[0] - to[0]) * bag, by = to[1] + (pay[1] - to[1]) * bag - Math.sin(bag * Math.PI) * 200;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <path d={`M ${from[0]} ${from[1]} Q ${mid[0]} ${mid[1]} ${tip[0]} ${tip[1]}`} stroke={C.ink} strokeWidth={16} fill="none" strokeLinecap="round" />
        <g transform={`translate(${grabbed ? tip[0] : at[0]} ${grabbed ? tip[1] + 30 : at[1]}) scale(0.16)`}>
          <Plush who="joanArmor" seed="jg" f={f} pose={{ ...PP0, mouth: grabbed ? 'oh' : 'smile', brow: grabbed ? 1 : 0, arms: grabbed ? 1 : 0, lx: -220, ly: -220, rx: 220, ry: -220 }} />
        </g>
        <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${ang}) scale(1.1)`}><Glove open={grabbed ? 0 : 1} /></g>
        {f >= 70 && bag < 1 && (
          <g transform={`translate(${bx} ${by}) rotate(${bag * 360})`}>
            <path d="M -40 -10 Q -50 50 0 56 Q 50 50 40 -10 Q 20 -30 0 -26 Q -20 -30 -40 -10 Z" fill="#C89A3A" stroke={C.ink} strokeWidth={6} />
            <path d="M -18 -30 L 18 -30" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
            <circle cx={0} cy={18} r={14} fill="#F4C542" stroke={C.ink} strokeWidth={4} />
          </g>
        )}
        {bag >= 1 && f < 140 && <circle cx={pay[0]} cy={pay[1]} r={30 + (f - 110) * 3} fill="none" stroke="#F4C542" strokeWidth={8} opacity={Math.max(0, 1 - (f - 110) / 30)} />}
      </svg>
    </AbsoluteFill>
  );
};
