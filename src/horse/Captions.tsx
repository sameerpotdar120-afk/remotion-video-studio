import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import CAPS from './captions.json';

type W = { f: number; w: string };
const WORDS = CAPS as W[];

/** One word at a time, hard cuts (as measured): white Poppins Bold, thin dark outline, soft shadow, at 73 % height. */
export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  let cur: W | undefined;
  for (const w of WORDS) { if (w.f <= f) cur = w; else break; }
  if (!cur) return null;
  const size = width * 0.061;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: height * 0.728 - size * 0.62, textAlign: 'center',
        fontFamily: 'Poppins', fontWeight: 700, fontSize: size, lineHeight: 1.1, color: '#ffffff', letterSpacing: -0.5,
        WebkitTextStroke: `${size * 0.075}px #1d1712`, paintOrder: 'stroke fill',
        textShadow: `0 ${size * 0.06}px ${size * 0.12}px rgba(0,0,0,0.45)`,
      }}>{cur.w}</div>
    </AbsoluteFill>
  );
};
