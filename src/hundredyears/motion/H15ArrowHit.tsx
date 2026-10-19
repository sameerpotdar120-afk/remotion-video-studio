import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Horse, PP0, Plush } from './Plush';
import { clamp, wobble } from './theme';

// h15_arrow_hit (line 9, "तीर लगने के बाद भी वो मैदान से नहीं हटी"; the reference's 63.2–65.0 s): armoured Joan on her
// warhorse, banner up, bobbing at a trot. An arrow streaks in from the right and sticks in her shoulder (`hit`): a flash,
// a wobble and a wince; then she grits her teeth, raises the banner and trots on. Transparent, 1080×1300, 60 fps, 240 f.
export const H15ArrowHit: React.FC<{ hit?: number }> = ({ hit = 60 }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [hit - 12, hit], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const w = wobble(f, hit, 3, 4);
  const hurt = f >= hit && f < hit + 60;
  const trot = Math.abs(Math.sin(f / 8)) * 18;
  const flash = interpolate(f, [hit, hit + 3, hit + 14], [0, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1300}>
        <g transform={`translate(540 ${1260 - trot * 0.5}) scale(0.7)`}><Horse f={f} run={0.6} /></g>
        <g transform={`translate(560 ${930 - trot}) rotate(${w * 12}) scale(0.75)`}>
          <Plush who="joanArmor" seed="jh" f={f} pose={{ ...PP0, mouth: hurt ? 'worried' : 'grin', brow: hurt ? 0.9 : -0.4, sweat: hurt ? 1 : 0 }} banner={1} />
          {f >= hit - 12 && (
            <g transform={`translate(${f >= hit ? 140 : 140 + (1 - a) * 900} ${-470 - (f >= hit ? 0 : (1 - a) * 200)}) rotate(195)`}>
              <path d="M 0 0 L 170 0" stroke="#6A4A2A" strokeWidth={10} />
              <path d="M 170 0 l -24 -12 M 170 0 l -24 12" stroke="#EDE6D6" strokeWidth={8} />
            </g>
          )}
        </g>
        {flash > 0 && <circle cx={660} cy={590} r={60 + flash * 50} fill="#FFF3B0" opacity={flash} />}
      </svg>
    </AbsoluteFill>
  );
};
