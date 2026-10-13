import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CoochBehar } from './CoochBehar';
import { HEAD, NUM, useCBFonts } from './fonts';
import { COL } from './Plane';

/**
 * One cover for YouTube Shorts and Instagram Reels: the Dahala Khagrabari rings and the gold चक्रव्यूह spiral from the video
 * (frame 1182), with no on-screen layer, plus a short headline. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const CoochBeharCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useCBFonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.04, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.8)' };
  const chip = (s: string, bg: string, latin = false): React.ReactNode => (
    <span style={{ fontFamily: latin ? NUM : HEAD, fontWeight: 800, fontSize: latin ? 62 : 66, color: '#fff', background: bg, borderRadius: 16, padding: latin ? '8px 22px 2px' : '2px 22px 0',
      border: '5px solid #140c03', boxShadow: '0 8px 0 rgba(0,0,0,0.35), 0 12px 26px rgba(0,0,0,0.6)' }}>{s}</span>
  );
  const sep = <span style={{ fontFamily: NUM, fontSize: 70, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}>⊃</span>;
  return (
    <AbsoluteFill>
      <CoochBehar captions={false} screen={false} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 64%, rgba(0,0,0,0.55) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 124, color: '#fff' }}>दुनिया का सबसे</div>
            <div style={{ ...big, fontSize: 168, color: COL.gold }}>अजीब बॉर्डर!</div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1380, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
            {chip('BD', COL.deepGreen, true)}{sep}{chip('भारत', COL.saffron)}{sep}{chip('BD', COL.deepGreen, true)}{sep}{chip('भारत', COL.saffron)}
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1530, textAlign: 'center' }}>
            <span style={{ fontFamily: NUM, fontSize: 64, letterSpacing: 3, color: '#fff', textShadow: '0 4px 14px rgba(0,0,0,0.9)', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill' }}>COOCH BEHAR</span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
