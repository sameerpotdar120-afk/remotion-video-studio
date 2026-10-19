import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { PP0, Plush } from './Plush';
import { clamp, pop } from './theme';

// h11_voices (line 7, "मुझे ऊपर से आवाज़ आई है, मुझे France को बचाना है"; the reference's 49.5–52.7 s): close on peasant Joan
// in the village. Soft rays of light come down from above, her stick arms rise and wave as she speaks (mouth talks in
// `talk`), her eyes look up. Transparent (over the village background), 1080×1400, 60 fps, 210 frames.
export const H11Voices: React.FC<{ talk?: [number, number] }> = ({ talk = [10, 190] }) => {
  const f = useCurrentFrame();
  const rays = interpolate(f, [0, 30], [0, 1], clamp);
  const up = pop(f, 6, 24, 1.6);
  const tk = f > talk[0] && f < talk[1] ? Math.max(0, Math.sin(f * 0.5) * 0.6 + 0.3) : 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1400}>
        <defs><linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF6D0" stopOpacity={0.8} /><stop offset="1" stopColor="#FFF6D0" stopOpacity={0} /></linearGradient></defs>
        {[-2, -1, 0, 1, 2].map((k) => (
          <path key={k} d={`M ${540 + k * 60} -40 L ${540 + k * 230 - 70} 1100 L ${540 + k * 230 + 70} 1100 Z`} fill="url(#ray)" opacity={rays * (0.35 + Math.sin(f / 18 + k) * 0.12)} />
        ))}
        <g transform="translate(540 1380) scale(1.05)">
          <Plush who="joan" seed="jv" f={f} pose={{ ...PP0, arms: up, lx: -230 + Math.sin(f / 9) * 30, ly: -300 + Math.cos(f / 9) * 30, rx: 230 + Math.sin(f / 9 + 1) * 30, ry: -300 + Math.cos(f / 9 + 1) * 30,
            mouth: 'oh', talk: tk, lookY: -0.8, brow: 0.6, hop: Math.abs(Math.sin(f / 12)) * 10 }} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
