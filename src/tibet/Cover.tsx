import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { useDevanagariFont } from '../darien/DarienGap';
import { useMontserrat } from '../darien/Brand';
import sizes from '../../public/tibet/img_sizes.json';
import { Tibet } from './Tibet';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
const SZ = sizes as unknown as Record<string, [number, number]>;

/**
 * One cover for YouTube Shorts and Instagram Reels: the glowing plateau from the video (pick the frame with --frame),
 * a big no-fly badge and an airliner turning away. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const TibetCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useDevanagariFont();
  useMontserrat();
  const big: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, lineHeight: 1.06, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.8)' };
  const [pw, ph] = SZ.plane_side;
  const W = 760;
  return (
    <AbsoluteFill>
      <Tibet captions={false} />
      {text && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.5) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center' }}>
            <div style={{ ...big, fontSize: 132, color: '#fff' }}>✈ Planes यहाँ</div>
            <div style={{ ...big, fontSize: 150, color: '#FF3B30' }}>क्यों नहीं उड़ते?</div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1200, textAlign: 'center' }}>
            <span style={{ display: 'inline-block', padding: '10px 40px 18px', borderRadius: 26, background: '#E0262B', border: '7px solid #fff', boxShadow: '0 0 40px rgba(224,38,43,0.8)',
              ...big, WebkitTextStroke: '0px', fontSize: 92, color: '#fff' }}>NO-FLY ZONE 🚫</span>
          </div>
          <img src={staticFile('tibet/img/plane_side.png')} style={{ position: 'absolute', left: 1080 - W + 60, top: 1430, width: W, height: (W * ph) / pw, transform: 'rotate(-10deg)',
            filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.6))' }} />
        </>
      )}
    </AbsoluteFill>
  );
};
