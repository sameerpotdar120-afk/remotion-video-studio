import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Twins } from './Twins';
import { HEAD, NUM, useTWFonts } from './fonts';

/**
 * One cover for YouTube Shorts and Instagram Reels: Italy and Vietnam glowing side by side (the hook frame, pick it with --frame),
 * a big "=" between them and the hook. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const TwinsCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useTWFonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.0, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.8)' };
  return (
    <AbsoluteFill>
      {/* the camera pulled back a little so both shapes sit fully in frame */}
      <Twins captions={false} screen={false} zoomOut={1.45} shiftX={-0.22e6} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.6) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 168, color: '#FFD84A' }}>जुड़वा देश!</div>
          </div>
          {/* a big gold "=" between the twins, drawn as two bars */}
          <div style={{ position: 'absolute', left: 540, top: 960, transform: 'translate(-50%,-50%) rotate(-8deg)', display: 'flex', flexDirection: 'column', gap: 34 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ width: 230, height: 52, borderRadius: 14, background: 'linear-gradient(180deg, #fff6c8, #FFD84A 45%, #c99300)', border: '9px solid #000',
                boxShadow: '0 0 40px rgba(255,216,74,0.85), 0 12px 24px rgba(0,0,0,0.7)' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1480, display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontFamily: NUM, fontSize: 76, letterSpacing: 2, color: '#fff', background: 'rgba(8,16,26,0.78)', borderRadius: 16, padding: '12px 34px 4px',
              border: '5px solid #fff', boxShadow: '0 8px 0 rgba(0,0,0,0.35), 0 12px 26px rgba(0,0,0,0.6)' }}>
              ITALY <span style={{ color: '#FFD84A' }}>=</span> VIETNAM?
            </span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
