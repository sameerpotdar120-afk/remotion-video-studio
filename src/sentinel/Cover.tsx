import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useDevanagariFont } from '../darien/DarienGap';
import { FONT, RED } from './Overlays';
import { Sentinel } from './Sentinel';

/** Shorts / Reels cover: any frame of the video (pick it with --frame), no captions, plus the hook line. */
export const SentinelCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useDevanagariFont();
  const big: React.CSSProperties = {
    fontFamily: FONT, fontWeight: 900, lineHeight: 1.08, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill',
    textShadow: '0 10px 30px rgba(0,0,0,0.8)',
  };
  return (
    <AbsoluteFill>
      <Sentinel captions={false} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 30%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 132, color: '#fff' }}>भारत का सबसे</div>
            <div style={{ ...big, fontSize: 150, color: RED, filter: 'drop-shadow(0 0 26px rgba(255,43,61,0.6))' }}>ख़तरनाक टापू</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
