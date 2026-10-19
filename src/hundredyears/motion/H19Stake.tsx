import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { PP0, Plush } from './Plush';
import { C } from './theme';

// h19_stake (line 11, "सिर्फ़ 19 साल की उम्र में…"; the reference's 79.3 s and 85.2–88.7 s): armoured Joan tied to the
// stake (the post and pyre are the creator's h04_stake_pyre image behind her), ropes across her body, a worried, brave
// face with a small sweat drop and slow breathing. No fire on her: the edit burns the picture away instead.
// `post` draws a stand-in post for testing. Transparent, 900×1400, 60 fps, 240 frames.
export const H19Stake: React.FC<{ post?: boolean }> = ({ post = false }) => {
  const f = useCurrentFrame();
  const breathe = 1 + Math.sin(f / 22) * 0.012;
  return (
    <AbsoluteFill>
      <svg width={900} height={1400}>
        {post && <rect x={420} y={80} width={60} height={1300} fill="#7A5A3A" stroke={C.ink} strokeWidth={6} />}
        <g transform={`translate(450 1180) scale(0.8 ${0.8 * breathe})`}>
          <Plush who="joanArmor" seed="js" f={f} pose={{ ...PP0, mouth: 'worried', brow: 0.6, sweat: (f % 120) / 120, lookY: 0.2 }} />
          {[-420, -300, -160].map((y) => <path key={y} d={`M -250 ${y} Q 0 ${y + 40} 250 ${y}`} stroke="#B48A52" strokeWidth={26} fill="none" strokeLinecap="round" />)}
          {[-420, -300, -160].map((y) => <path key={`d${y}`} d={`M -250 ${y} Q 0 ${y + 40} 250 ${y}`} stroke="#7A5A2A" strokeWidth={6} strokeDasharray="14 18" fill="none" />)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
