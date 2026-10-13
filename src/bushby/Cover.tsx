import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Bushby } from './Bushby';
import { HEAD, NUM, useBBFonts } from './fonts';
import { COL, SZ } from './kit';

/**
 * One cover for YouTube Shorts and Instagram Reels: the globe with the whole route glowing (pick the frame with --frame),
 * Karl (AI illustration) with his cart, and the hook. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const BushbyCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useBBFonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.0, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.8)' };
  const [kw, kh] = SZ.karl_front;
  const H = 820;
  const chip = (s: string): React.ReactNode => (
    <span style={{ position: 'relative', display: 'inline-block', fontFamily: NUM, fontSize: 64, letterSpacing: 2, color: '#fff', background: 'rgba(14,8,2,0.82)', borderRadius: 16,
      padding: '10px 26px 4px', border: '5px solid #fff', boxShadow: '0 8px 0 rgba(0,0,0,0.35), 0 12px 26px rgba(0,0,0,0.6)' }}>
      {s}
      <span style={{ position: 'absolute', left: -10, right: -10, top: '48%', height: 10, background: '#E0262B', borderRadius: 6, transform: 'rotate(-14deg)', boxShadow: '0 0 12px rgba(224,38,43,0.9)' }} />
    </span>
  );
  return (
    <AbsoluteFill>
      <Bushby captions={false} screen={false} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center' }}>
            <div>
              <span style={{ ...big, fontFamily: NUM, fontSize: 260, color: COL.gold, WebkitTextStroke: '10px #000' }}>28</span>
              <span style={{ ...big, fontSize: 160, color: '#fff' }}> साल</span>
            </div>
            <div style={{ ...big, fontSize: 132, color: '#fff' }}>पैदल!</div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', gap: 18 }}>
            {chip('CAR')}{chip('SHIP')}{chip('PLANE')}
          </div>
          <img src={staticFile('bushby/img/karl_front.png')} style={{ position: 'absolute', left: 540 - (H * kw) / kh / 2, top: 1680 - H, height: H, width: (H * kw) / kh,
            filter: 'drop-shadow(0 0 24px rgba(255,216,74,0.45)) drop-shadow(0 14px 18px rgba(0,0,0,0.6))' }} />
        </>
      )}
    </AbsoluteFill>
  );
};
