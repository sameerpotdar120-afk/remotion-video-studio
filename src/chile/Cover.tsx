import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Chile } from './Chile';
import { HEAD, useCHFonts } from './fonts';
import { COL } from './regions';

/**
 * Render frame COVER_FRAME. One cover for YouTube Shorts and Instagram Reels: the India beat (Chile laid over India, 3,214 KM vs ~4,300 KM and the
 * +1,000 KM past Kanyakumari) with the question in the open sea below. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const COVER_FRAME = 756;
export const ChileCover: React.FC<{ text?: boolean; res?: number }> = ({ text = true, res = 1 }) => {
  useCHFonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.02, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.85)' };
  return (
    <AbsoluteFill>
      <Chile captions={false} res={res} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.7) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1440, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 118, color: '#fff' }}>Chile इतना लंबा</div>
            <div style={{ ...big, fontSize: 118, color: COL.gold }}>क्यों है? 🤯</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
