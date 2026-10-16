import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useDevanagariFont } from '../darien/DarienGap';
import { Spain } from './Spain';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";

/**
 * One cover for YouTube Shorts and Instagram Reels: the video's "5 पड़ोसी" reveal (two known, three still "???"), with the
 * open question underneath. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const SpainCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useDevanagariFont();
  const big: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, lineHeight: 1.08, WebkitTextStroke: '11px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.85)' };
  return (
    <AbsoluteFill>
      <Spain captions={false} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.7) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 104, color: '#fff' }}>France, Portugal…</div>
            <div style={{ ...big, fontSize: 138, color: '#FF3B30' }}>बाकी 3 कौन?</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
