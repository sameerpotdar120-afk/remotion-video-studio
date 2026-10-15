import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { HEAD, useT2Fonts } from './fonts';
import { Tibet2 } from './Tibet2';

/**
 * One cover for YouTube Shorts and Instagram Reels: the hook's flight map (frame 140 of the 30 fps cut), the empty plateau
 * glowing red above India, a plane heading into it and the one question. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const Tibet2Cover: React.FC<{ text?: boolean; res?: number }> = ({ text = true, res = 1 }) => {
  useT2Fonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.0, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.85)' };
  const W = 600;
  return (
    <AbsoluteFill>
      <Tibet2 captions={false} screen={false} res={res} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.6) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 255, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 104, color: '#fff' }}>India के ठीक ऊपर</div>
            <div style={{ ...big, fontSize: 168, color: '#FF3B30', marginTop: 6 }}>ये खाली क्यों?</div>
          </div>
          <img src={staticFile('tibet2/img/t2/plane_side.png')} style={{ position: 'absolute', left: 60, top: 1090, width: W, height: (W * 562) / 1800, transform: 'rotate(-14deg)',
            filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.7))' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1475, textAlign: 'center' }}>
            <span style={{ display: 'inline-block', padding: '14px 40px 6px', borderRadius: 24, background: '#E0262B', border: '7px solid #fff', boxShadow: '0 0 44px rgba(224,38,43,0.85)',
              fontFamily: HEAD, fontWeight: 800, fontSize: 84, lineHeight: 1.15, color: '#fff' }}>⚠ उतरने की जगह नहीं!</span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
