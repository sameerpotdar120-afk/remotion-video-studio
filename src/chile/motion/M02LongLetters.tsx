import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';

// m02_long_letters: "लंबाऽऽऽऽऽ" (ऽ = the Hindi sign for a stretched vowel) letters pop one by one up a gentle arc, a thin white arc draws beside them, then the
// letters shrink to dots and fade. 500x1400, 60 fps, 240 frames. Transparent. (Place it along Chile and rotate.)

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
// Hindi font: put Mukta-Bold.ttf (Google Fonts, OFL) at public/fonts/Mukta-Bold.ttf, as in the last batch.
const useMukta = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const font = new FontFace('Mukta', `url(${staticFile('fonts/Mukta-Bold.ttf')})`, { weight: '700' });
    font.load().then((f) => { (document.fonts as unknown as { add: (x: FontFace) => void }).add(f); }).catch(() => undefined).finally(() => continueRender(handle));
  }, [handle]);
};

const PARTS = ['लं', 'बा', 'ऽ', 'ऽ', 'ऽ', 'ऽ', 'ऽ'];

export const M02LongLetters: React.FC = () => {
  useMukta();
  const f = useCurrentFrame();
  const arc = interpolate(f, [0, 70], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const out = interpolate(f, [170, 220], [0, 1], { ...c, easing: Easing.in(Easing.quad) });
  // points along a soft arc from bottom (y 1300) to top (y 100)
  const at = (u: number) => ({ x: 250 + Math.sin(u * Math.PI) * 90, y: 1300 - u * 1200 });
  return (
    <AbsoluteFill>
      <svg width={500} height={1400} style={{ position: 'absolute' }}>
        <path d={`M ${at(0).x + 110} ${at(0).y} Q ${at(0.5).x + 200} ${at(0.5).y} ${at(1).x + 110} ${at(1).y}`} fill="none" stroke="#fff" strokeWidth={6}
          strokeLinecap="round" pathLength={1} strokeDasharray={`${arc} 1`} opacity={1 - out} />
      </svg>
      {PARTS.map((p, i) => {
        const u = i / (PARTS.length - 1);
        const { x, y } = at(u);
        const t0 = 6 + i * 8;
        const s = interpolate(f, [t0, t0 + 7, t0 + 12], [0, 1.25, 1], { ...c, easing: Easing.out(Easing.quad) }) * (1 - out * 0.85);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(-90deg) scale(${s})`, opacity: 1 - out * out,
            fontFamily: '"Mukta", "Noto Sans Devanagari", sans-serif', fontWeight: 700, fontSize: 150, color: '#fff', whiteSpace: 'nowrap',
            textShadow: '0 6px 0 rgba(0,0,0,0.35), 0 10px 22px rgba(0,0,0,0.6)' }}>{p}</div>
        );
      })}
    </AbsoluteFill>
  );
};
