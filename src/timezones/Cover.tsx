import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HEAD, useTZFonts } from './fonts';
import { COL } from './regions';
import { TimeZones } from './TimeZones';

/**
 * Render frame COVER_FRAME. One cover for YouTube Shorts and Instagram Reels: the Mirzapur split (the IST line through
 * the city, +5 and +6, the two friends with their 5:00 and 6:00 clocks) with the question in the land below.
 * Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const COVER_FRAME = 3096;
export const TZCover: React.FC<{ text?: boolean; res?: number }> = ({ text = true, res = 1 }) => {
  useTZFonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.02, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.85)' };
  return (
    <AbsoluteFill>
      <TimeZones captions={false} res={res} nullReady={false} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.75) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1450, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 104, color: '#fff' }}>एक शहर, दो टाइम?</div>
            <div style={{ ...big, fontSize: 96, color: COL.gold }}>Time Zones का राज़ 🤯</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
