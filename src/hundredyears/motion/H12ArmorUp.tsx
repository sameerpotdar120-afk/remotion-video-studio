import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Horse, PP0, Plush } from './Plush';
import { clamp, wobble } from './theme';

// h12_armor_up (line 8, "उसके हाथ के झंडे ने हारी हुई फ़ौज में जान फूँक दी"; the reference's 53.2–56.0 s): the armour drops
// onto peasant Joan from the top with motion blur and a squash, and she becomes armoured Joan; the warhorse slides in
// from the bottom-left under her with a bounce; the banner unfurls on its pole. Frames `armor`, `horse`, `banner`.
// Transparent (over the village background), 1080×1500, 60 fps, 240 frames.
export const H12ArmorUp: React.FC<{ armor?: number; horse?: number; banner?: number }> = ({ armor = 20, horse = 70, banner = 120 }) => {
  const f = useCurrentFrame();
  const drop = interpolate(f, [armor, armor + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const on = f >= armor + 10;
  const sq = on ? 1 - wobble(f, armor + 10, 3, 7) * 0.15 : 1;
  const hs = interpolate(f, [horse, horse + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const lift = interpolate(f, [horse + 4, horse + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const bn = interpolate(f, [banner, banner + 24], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const jy = 1430 - lift * 330;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1500}>
        {f >= horse && (
          <g transform={`translate(${interpolate(hs, [0, 1], [-500, 560])} ${1450 + (1 - hs) * 300}) scale(0.75)`}><Horse f={f} run={hs < 1 ? 1 : 0} /></g>
        )}
        <g transform={`translate(540 ${jy}) scale(${0.85 / Math.sqrt(sq)} ${0.85 * sq})`}>
          <Plush who={on ? 'joanArmor' : 'joan'} seed="ja" f={f} pose={{ ...PP0, mouth: on ? 'grin' : 'oh', brow: on ? -0.2 : 0.8, visor: 0 }} shield={false} banner={bn} />
        </g>
        {!on && drop > 0 && (
          // the falling armour (breastplate, cape and helmet) with a motion streak
          <g transform={`translate(540 ${interpolate(drop, [0, 1], [-400, jy - 520])}) scale(0.85)`} opacity={0.95}>
            <rect x={-160} y={-900} width={320} height={500} fill="#C9D1DA" opacity={0.35} />
            <path d="M -140 -490 Q 0 -540 140 -490 L 120 -250 Q 0 -200 -120 -250 Z" fill="#DDE3EA" stroke="#1D1610" strokeWidth={7} />
            <path d="M -220 -900 C -230 -1150 230 -1150 220 -900 L 170 -900 C 160 -1050 -160 -1050 -170 -900 Z" fill="#C9D1DA" stroke="#1D1610" strokeWidth={8} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
