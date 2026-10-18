import React from 'react';
import { AbsoluteFill, Freeze } from 'remotion';
import { HEAD, useTZFonts } from '../../timezones/fonts';
import { T01TugOfWar } from '../motion/T01TugOfWar';
import { COL } from './regions';

/**
 * The cover for YouTube Shorts and Instagram Reels: the tug of war (Britain and France pulling, Siam smug in the middle)
 * with the question above. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const ThCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useTZFonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.04, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.6)' };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: 'translateY(120px) scale(1.18)' }}>
        <Freeze frame={128}><T01TugOfWar /></Freeze>
      </AbsoluteFill>
      {text && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center' }}>
          <div style={{ ...big, fontSize: 116, color: '#fff' }}>Thailand कभी</div>
          <div style={{ ...big, fontSize: 116, color: COL.siam }}>ग़ुलाम क्यों नहीं बना?</div>
          <div style={{ ...big, fontSize: 70, color: '#fff', marginTop: 18, WebkitTextStroke: '9px #000' }}>Britain 🆚 France 🤝</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
