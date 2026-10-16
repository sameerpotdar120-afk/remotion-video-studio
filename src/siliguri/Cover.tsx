import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HEAD, NUM, useSGFonts } from './fonts';
import { COL } from './Plane';
import { Siliguri } from './Siliguri';

/**
 * One cover for YouTube Shorts and Instagram Reels: the hook's frame (India in blue, the strip in magenta with its
 * 22 KM bar and the red cut), with the name and the number. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const SiliguriCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useSGFonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.02, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.85)' };
  return (
    <AbsoluteFill>
      <Siliguri captions={false} propsOnly />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.65) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 255, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 112, color: '#fff' }}>India का</div>
            <div style={{ ...big, fontFamily: NUM, fontWeight: 400, fontSize: 150, color: COL.gold, letterSpacing: 3 }}>CHICKEN'S NECK</div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1480, textAlign: 'center' }}>
            <span style={{ display: 'inline-block', padding: '14px 40px 6px', borderRadius: 24, background: '#E0262B', border: '7px solid #fff', boxShadow: '0 0 44px rgba(224,38,43,0.85)',
              fontFamily: HEAD, fontWeight: 800, fontSize: 84, lineHeight: 1.15, color: '#fff' }}>सिर्फ़ 22 KM! 😳</span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
