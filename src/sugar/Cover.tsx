import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { useDevanagariFont } from '../darien/DarienGap';
import { useMontserrat } from '../darien/Brand';
import sizes from '../../public/sugar/img_sizes.json';
import { Sugar } from './Sugar';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
const MONT = "'Montserrat', sans-serif";
const SZ = sizes as unknown as Record<string, [number, number]>;

/**
 * One cover for YouTube Shorts and Instagram Reels: a frame of the video (pick it with --frame), no captions,
 * the hook on top and the sugar bowl in front. Everything that matters sits inside the 3:4 centre crop
 * Instagram shows on the profile grid (y 240–1680).
 */
export const SugarCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useDevanagariFont();
  useMontserrat();
  const big: React.CSSProperties = {
    fontFamily: FONT, fontWeight: 900, lineHeight: 1.08, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.8)',
  };
  const [bw, bh] = SZ.sugar_bowl;
  const H = 470;
  return (
    <AbsoluteFill>
      <Sugar captions={false} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.5) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 170, color: '#fff' }}>चीनी <span style={{ color: '#FFD84A' }}>= चीन?</span></div>
            <div style={{ ...big, fontSize: 130, color: '#fff', marginTop: 10 }}>मिश्री <span style={{ color: '#7FE3FF' }}>= मिस्र?</span></div>
          </div>
          <img src={staticFile('sugar/img/sugar_bowl.png')}
            style={{ position: 'absolute', left: 50, top: 1660 - H, height: H, width: (H * bw) / bh, filter: 'drop-shadow(0 0 22px rgba(255,230,160,0.6)) drop-shadow(0 12px 16px rgba(0,0,0,0.6))' }} />
          <div style={{ position: 'absolute', right: 50, top: 1400, padding: '12px 30px 18px', borderRadius: 24, background: 'rgba(20,12,4,0.82)', border: '8px solid #FFD84A',
            transform: 'rotate(-5deg)', whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 70, color: '#fff' }}>SUGAR</span>
            <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 70, color: '#FFD84A', margin: '0 14px' }}>=</span>
            <span style={{ ...big, WebkitTextStroke: '0px', fontSize: 78, color: '#FFD84A' }}>शर्करा</span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
