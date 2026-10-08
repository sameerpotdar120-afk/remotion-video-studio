import React from 'react';
import { AbsoluteFill } from 'remotion';
import { DarienFrame, useDevanagariFont } from './DarienGap';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";

/** Shorts / Reels cover: the broken highway and the red Darién, three words of text. */
export const DarienCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useDevanagariFont();
  const big: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 900,
    lineHeight: 1.05,
    WebkitTextStroke: '10px #000',
    paintOrder: 'stroke fill',
    textShadow: '0 10px 30px rgba(0,0,0,0.8)',
  };
  return (
    <AbsoluteFill>
      <DarienFrame t={24.3} still />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 38%)' }} />
      {text && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center' }}>
          <div style={{ ...big, fontSize: 230, color: '#FFD21F', filter: 'drop-shadow(0 0 26px rgba(255,190,0,0.65))' }}>सड़क</div>
          <div style={{ ...big, fontSize: 168, color: '#ffffff' }}>यहीं ख़त्म</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
