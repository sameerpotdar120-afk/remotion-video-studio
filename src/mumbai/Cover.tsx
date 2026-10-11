import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { useDevanagariFont } from '../darien/DarienGap';
import sizes from '../../public/mumbai/img_sizes.json';
import { Mumbai } from './Mumbai';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
const SZ = sizes as unknown as Record<string, [number, number]>;

/**
 * One cover for YouTube Shorts and Instagram Reels: a frame of the video (pick it with --frame), no captions,
 * the hook line on top and a Koli fisherman in front. Everything that matters sits inside the 3:4 centre
 * crop Instagram shows on the profile grid (y 240–1680).
 */
export const MumbaiCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useDevanagariFont();
  const big: React.CSSProperties = {
    fontFamily: FONT, fontWeight: 900, lineHeight: 1.08, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill',
    textShadow: '0 10px 30px rgba(0,0,0,0.8)',
  };
  const [fw, fh] = SZ.koli_fisherman;
  const H = 640;
  return (
    <AbsoluteFill>
      <Mumbai captions={false} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.45) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 150, color: '#fff' }}>मुंबई कभी</div>
            <div style={{ ...big, fontSize: 116, color: '#FFD45A', filter: 'drop-shadow(0 0 24px rgba(255,190,60,0.6))' }}>एक शहर था ही नहीं!</div>
          </div>
          <img src={staticFile('mumbai/img/koli_fisherman.png')}
            style={{ position: 'absolute', left: 40, top: 1640 - H, height: H, width: (H * fw) / fh, filter: 'drop-shadow(0 0 18px rgba(255,200,90,0.55)) drop-shadow(0 12px 16px rgba(0,0,0,0.6))' }} />
          <div style={{ position: 'absolute', right: 60, top: 1430, padding: '14px 36px', borderRadius: 28, background: 'rgba(20,14,6,0.72)', border: '5px solid #FFD45A',
            ...big, WebkitTextStroke: '0px', fontSize: 104, color: '#FFD45A' }}>7 द्वीप</div>
        </>
      )}
    </AbsoluteFill>
  );
};
