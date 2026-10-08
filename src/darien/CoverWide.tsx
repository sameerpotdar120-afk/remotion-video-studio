import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { useDevanagariFont } from './DarienGap';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";

/** 16:9 thumbnail built from a 2x render of the cover frame. */
export const DarienCoverWide: React.FC = () => {
  useDevanagariFont();
  const big: React.CSSProperties = {
    fontFamily: FONT, fontWeight: 900, lineHeight: 1.0, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill',
    textShadow: '0 8px 24px rgba(0,0,0,0.85)',
  };
  return (
    <AbsoluteFill>
      <Img src={staticFile('darien/cover_wide_bg.jpg')} style={{ width: 1280, height: 720 }} />
      <AbsoluteFill style={{ background: 'linear-gradient(270deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 45%)' }} />
      <div style={{ position: 'absolute', right: 50, top: 170, textAlign: 'right' }}>
        <div style={{ ...big, fontSize: 170, color: '#FFD21F', filter: 'drop-shadow(0 0 20px rgba(255,190,0,0.6))' }}>सड़क</div>
        <div style={{ ...big, fontSize: 124, color: '#fff' }}>यहीं ख़त्म</div>
      </div>
    </AbsoluteFill>
  );
};
