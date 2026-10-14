import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Kalpasar } from './Kalpasar';
import { HEAD, NUM, useKPFonts } from './fonts';

/**
 * One cover for YouTube Shorts and Instagram Reels: the wall across the Gulf of Khambhat with the freshwater lake behind it
 * (pick the frame with --frame), the hook and the name. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const KalpasarCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useKPFonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.0, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.8)' };
  return (
    <AbsoluteFill>
      <Kalpasar captions={false} screen={false} zoomOut={1.15} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.6) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 132, color: '#fff' }}>समंदर में</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ ...big, fontFamily: NUM, fontSize: 230, color: '#FFD84A', WebkitTextStroke: '10px #000' }}>60 KM</span>
            </div>
            <div style={{ ...big, fontSize: 140, color: '#fff' }}>दीवार!</div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1460, display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontFamily: NUM, fontSize: 80, letterSpacing: 3, color: '#FFD84A', background: 'rgba(8,16,26,0.8)', borderRadius: 16, padding: '12px 36px 4px',
              border: '5px solid #FFD84A', boxShadow: '0 8px 0 rgba(0,0,0,0.35), 0 12px 26px rgba(0,0,0,0.6), 0 0 30px rgba(255,216,74,0.5)' }}>KALPASAR</span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
