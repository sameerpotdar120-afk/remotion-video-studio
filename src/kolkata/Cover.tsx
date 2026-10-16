import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COL } from './Plane';
import { HEAD, NUM, useKKFonts } from './fonts';
import { Kolkata } from './Kolkata';

/**
 * One cover for YouTube Shorts and Instagram Reels: the three villages standing up as 3D slabs on today's Kolkata
 * (pick the frame with --frame), with the hook in two lines and the three names. Everything that matters sits inside
 * the 3:4 crop (y 240–1680).
 */
export const KolkataCover: React.FC<{ text?: boolean; res?: number }> = ({ text = true, res = 2 }) => {
  useKKFonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.02, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.85)' };
  return (
    <AbsoluteFill>
      <Kolkata captions={false} cut3d propsOnly res={res} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.6) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 118, color: '#fff' }}>Kolkata कभी</div>
            <div style={{ ...big, fontSize: 150, color: COL.gold, marginTop: 4 }}>सिर्फ़ 3 गाँव था!</div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1500, textAlign: 'center' }}>
            <span style={{ display: 'inline-block', padding: '12px 34px 8px', borderRadius: 22, background: 'rgba(8,16,26,0.86)', border: `6px solid ${COL.gold}`,
              boxShadow: `0 0 40px ${COL.gold}88`, fontFamily: NUM, fontSize: 58, letterSpacing: 2, color: '#fff' }}>
              SUTANUTI · KALIKATA · GOBINDAPUR
            </span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
