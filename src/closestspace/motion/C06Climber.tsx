import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Flag, PP0, Plush, Who, blendP } from './Plush';
import { C, clamp, pop, ramp, wobble } from './theme';

// c06_climber ("Everest, 8,849 मीटर। दुनिया की छत।"): a plush mountaineer scrambles up the last bit of a snowy summit,
// plants a flag (it unfurls and flaps), then throws both arms up and hops, with snow puffs. Our own gag (the reference
// shows only the terrain). Transparent, 1080×1400, 60 fps. `who` climberA (Everest, orange) or climberB (Chimborazo,
// teal); `flag` colour; `plant` = frame the flag goes in.
export const C06Climber: React.FC<{ who?: Who; flag?: string; plant?: number }> = ({ who = 'climberA', flag = C.gold, plant = 60 }) => {
  const f = useCurrentFrame();
  const climb = ramp(f, 0, plant - 10, Easing.out(Easing.cubic));
  const x = interpolate(climb, [0, 1], [180, 480]);
  // feet stay on the left slope (from (-40, 1400) up to the top at (560, 880))
  const y = 880 + (560 - x) * 0.867 + 6 - Math.abs(Math.sin(f / 5)) * 18 * (1 - climb);
  const stab = pop(f, plant, plant + 8, 2.4);
  const up = pop(f, plant + 8, plant + 28, 1.4);
  const cheer = ramp(f, plant + 30, plant + 42);
  const hop = cheer > 0 ? Math.abs(Math.sin((f - plant - 30) / 7)) * 60 : 0;
  const climbP = { ...PP0, arms: 1, lx: -170, ly: -40 + Math.sin(f / 5) * 40, rx: 180, ry: -60 - Math.sin(f / 5) * 40, mouth: 'flat' as const, brow: -0.3, lean: 12 };
  const plantP = { ...PP0, arms: 1, lx: -120, ly: 140, rx: 200, ry: -80, mouth: 'grin' as const, lean: 0 };
  const cheerP = { ...PP0, arms: 1, lx: -230, ly: -300, rx: 230, ry: -300, mouth: 'grin' as const, brow: 0.4, hop, squash: 1 - wobble(f, plant + 30, 3, 4) * 0.06 };
  const pose = cheer > 0 ? blendP(plantP, cheerP, cheer) : climb < 1 ? climbP : plantP;
  const snow = (k: number) => ramp(f, plant + k, plant + k + 30);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1400}>
        <defs>
          <linearGradient id="rockG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9C8E80" /><stop offset="1" stopColor="#4E4339" /></linearGradient>
          <linearGradient id="snowG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#CFE3F5" /></linearGradient>
        </defs>
        {/* the summit: rock with a snow cap, the top at (560, 900) */}
        <path d="M -40 1400 L 560 880 L 1140 1400 Z" fill="url(#rockG)" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        <path d="M 330 1080 L 560 880 L 800 1090 L 720 1060 L 650 1110 L 560 1050 L 470 1110 L 400 1060 Z" fill="url(#snowG)" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 560 880 L 470 1110" stroke="#fff" strokeWidth={6} opacity={0.6} />
        {f >= plant && <g transform={`translate(${590} ${885 + (1 - stab) * -160})`}><Flag f={f} up={up} color={flag} h={520} /></g>}
        {[0, 4, 9].map((k, j) => {
          const s = snow(k);
          return s > 0 && s < 1 ? <circle key={j} cx={590 + (j - 1) * 60 * s} cy={885 - 30 * s} r={10 + 40 * s} fill="#fff" opacity={0.8 * (1 - s)} /> : null;
        })}
        <g transform={`translate(${x} ${y}) scale(0.42)`}><Plush who={who} f={f} pose={pose} /></g>
      </svg>
    </AbsoluteFill>
  );
};
