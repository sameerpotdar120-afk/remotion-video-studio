import React from 'react';
import { AbsoluteFill, Freeze, Img, staticFile } from 'remotion';
import { HEAD, useTZFonts } from '../../timezones/fonts';
import { H12ArmorUp } from '../motion/H12ArmorUp';

/**
 * The cover for YouTube Shorts and Instagram Reels: armoured Joan on her warhorse with the banner up, over the
 * battlefield, with the hook above. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const HyCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useTZFonts();
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.06, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.6)' };
  return (
    <AbsoluteFill style={{ background: '#1a120c' }}>
      <Img src={staticFile('hundredyears/img/h02_battlefield_bg.jpg')} style={{ position: 'absolute', width: 1080, height: 1920, objectFit: 'cover' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 70%, rgba(255,150,40,0.28), rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0) 40%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5))' }} />
      <div style={{ position: 'absolute', left: 0, top: 300, width: 1080, height: 1500, transform: 'scale(0.84)', transformOrigin: '50% 100%' }}>
        <Freeze frame={200}><H12ArmorUp armor={-200} horse={-200} banner={-200} /></Freeze>
      </div>
      {text && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center' }}>
          <div style={{ ...big, fontSize: 112, color: '#fff' }}>17 साल की लड़की</div>
          <div style={{ ...big, fontSize: 112, color: '#FFD84A' }}>जिसने जंग पलट दी</div>
          <div style={{ ...big, fontSize: 66, color: '#fff', marginTop: 18, WebkitTextStroke: '9px #000' }}>England 🆚 France · 116 साल ⚔️</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
