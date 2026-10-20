import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { HEAD, useTZFonts } from '../../timezones/fonts';
import { PoleFlag } from '../motion/Flags';
import { Sticker } from '../motion/W13Sticker';

/**
 * The cover for YouTube Shorts and Instagram Reels: the Arctic beach, both flags crossed on the rock, the two bottles as
 * stickers, the hook above. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const WkCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useTZFonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.06, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.6)' };
  const img = (k: string) => staticFile(`whiskywar/img/${k}`);
  return (
    <AbsoluteFill style={{ background: '#2a3540' }}>
      <Img src={img('wk01_arctic_beach_bg.jpg')} style={{ position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', transform: 'scale(1.06)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0) 38%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.45))' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform="translate(470 1360) rotate(-12)"><PoleFlag kind="canada" f={8} h={720} /></g>
        <g transform="translate(610 1360) rotate(12) scale(-1 1)"><g transform="scale(-1 1)"><PoleFlag kind="denmark" f={20} h={720} /></g></g>
      </svg>
      <div style={{ position: 'absolute', left: 110, top: 1050, width: 260, height: 500, transform: 'rotate(-14deg)' }}><Sticker><Img src={img('wk08_whisky_bottle.png')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></Sticker></div>
      <div style={{ position: 'absolute', left: 730, top: 1040, width: 220, height: 520, transform: 'rotate(12deg)' }}><Sticker><Img src={img('wk07_schnapps_bottle.png')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></Sticker></div>
      {text && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center' }}>
          <div style={{ ...big, fontSize: 112, color: '#fff' }}>49 साल की जंग</div>
          <div style={{ ...big, fontSize: 112, color: '#F5F23A' }}>हथियार: शराब 🍾</div>
          <div style={{ ...big, fontSize: 66, color: '#fff', marginTop: 18, WebkitTextStroke: '9px #000' }}>Canada 🆚 Denmark</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
