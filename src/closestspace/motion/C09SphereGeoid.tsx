import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { C, pop, ramp } from './theme';

// c09_sphere_geoid ("पर वो perfect गोल ball भी नहीं है।"; the reference's 35.2–38.4 s): a white ring traces once round
// the globe (r = `r` around the centre), the first word pops above with a curved hand-drawn arrow down to the globe;
// at `strike` a red line slashes through it, its letters scramble and fall, and the second word types in letter by
// letter with a bounce, keeping the arrow. Transparent, 1080×1080, 60 fps; the globe centre is (540, 640).
const scramble = 'अआइकखगघचजटडतदनपबमयरलवसह#@*%';
export const C09SphereGeoid: React.FC<{ r?: number; first?: string; second?: string; strike?: number }> = ({ r = 300, first = 'गोल', second = 'Geoid', strike = 90 }) => {
  useFonts();
  const f = useCurrentFrame();
  const ring = ramp(f, 0, 30, Easing.inOut(Easing.cubic));
  const ringOut = ramp(f, 34, 46);
  const w1 = pop(f, 18, 32, 2);
  const arrow = ramp(f, 26, 44);
  const st = ramp(f, strike, strike + 8);
  const gone = ramp(f, strike + 12, strike + 26);
  const typed = Math.floor(ramp(f, strike + 20, strike + 44, (t) => t) * (second.length + 0.99));
  const C0 = [540, 640];
  const circ = 2 * Math.PI * r;
  const label = (txt: string, extra: React.CSSProperties) => (
    <div style={{ position: 'absolute', left: 600, top: 40, fontFamily: UI, fontWeight: 800, fontSize: 104, color: '#fff', whiteSpace: 'nowrap',
      textShadow: '0 6px 0 rgba(0,0,0,0.35), 0 0 24px rgba(0,0,0,0.4)', ...extra }}>{txt}</div>
  );
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080} style={{ position: 'absolute' }}>
        <circle cx={C0[0]} cy={C0[1]} r={r + 22} fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round"
          strokeDasharray={`${circ * ring} ${circ}`} transform={`rotate(110 ${C0[0]} ${C0[1]})`} opacity={1 - ringOut} />
        <path d={`M 720 200 C 700 260 660 300 ${C0[0] + 60} ${C0[1] - r - 16}`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round"
          strokeDasharray="300" strokeDashoffset={300 * (1 - arrow)} />
        {arrow > 0.9 && <path d={`M ${C0[0] + 60} ${C0[1] - r - 16} l 4 -36 M ${C0[0] + 60} ${C0[1] - r - 16} l 34 -10`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />}
      </svg>
      {gone < 1 && label(
        gone > 0 ? first.split('').map((ch, i) => (Math.floor(f / 2 + i) % 3 === 0 ? scramble[(f + i * 7) % scramble.length] : ch)).join('') : first,
        { transform: `scale(${w1}) translateY(${gone * 160}px) rotate(${gone * 18}deg)`, opacity: 1 - gone, transformOrigin: '0 50%' },
      )}
      {st > 0 && gone < 1 && (
        <svg width={1080} height={1080} style={{ position: 'absolute' }}>
          <path d={`M 590 ${125} L ${590 + 260 * st} ${112}`} stroke={C.red} strokeWidth={14} strokeLinecap="round" opacity={1 - gone} />
        </svg>
      )}
      {typed > 0 && (
        <div style={{ position: 'absolute', left: 600, top: 40, fontFamily: UI, fontWeight: 800, fontSize: 104, color: '#fff', whiteSpace: 'nowrap',
          textShadow: '0 6px 0 rgba(0,0,0,0.35), 0 0 24px rgba(0,0,0,0.4)' }}>
          {second.slice(0, Math.min(typed, second.length) - 1)}
          <span style={{ display: 'inline-block', transform: `scale(${f >= strike + 44 ? 1 : 1 + 0.45 * Math.max(0, 1 - ((f - strike - 20) % 5) / 5)})`, transformOrigin: '50% 80%' }}>
            {second[Math.min(typed, second.length) - 1]}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
