import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useDevanagariFont } from '../darien/DarienGap';
import { Diomede } from './Diomede';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";

/** Shorts / Reels cover: any frame of the video (pick it with --frame), no captions, plus a short hook line. */
export const DiomedeCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useDevanagariFont();
  const big: React.CSSProperties = {
    fontFamily: FONT, fontWeight: 900, lineHeight: 1.05, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill',
    textShadow: '0 10px 30px rgba(0,0,0,0.8)',
  };
  return (
    <AbsoluteFill>
      <Diomede captions={false} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 26%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 128, color: '#fff' }}>सिर्फ 3.8 KM</div>
            <div style={{ ...big, fontSize: 118, color: '#FFD21F', filter: 'drop-shadow(0 0 26px rgba(255,190,0,0.65))' }}>पर 1 दिन दूर</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
