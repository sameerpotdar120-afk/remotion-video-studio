import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HEAD, useWWFonts } from './fonts';
import { COL } from './regions';
import { WW3 } from './WW3';

/**
 * Render frame COVER_FRAME. One cover for YouTube Shorts and Instagram Reels: the northern half of the globe in red
 * with the mushroom clouds, the south still safe, and the hook's black title card over the lower caption.
 * Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const COVER_FRAME = 915;
export const WW3Cover: React.FC<{ text?: boolean; res?: number }> = ({ text = true, res = 1 }) => {
  useWWFonts();
  const line: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.05, fontSize: 112 };
  return (
    <AbsoluteFill>
      <WW3 captions={false} res={res} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 66%, rgba(0,0,0,0.75) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1375, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '22px 54px 18px', borderRadius: 18, background: '#050505', border: '5px solid rgba(255,255,255,0.9)',
              boxShadow: '0 0 50px rgba(232,38,58,0.55), 0 16px 40px rgba(0,0,0,0.8)' }}>
              <div style={{ ...line, color: '#fff' }}>WORLD WAR 3 में</div>
              <div style={{ ...line, color: COL.war, fontSize: 124 }}>SAFE कहाँ? 😳</div>
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
