import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { TITLE, UI, useFonts } from '../motion/font';

/**
 * The cover for YouTube Shorts and Instagram Reels: the Blender train nosing out of its tunnel portal with the
 * headlights on (frame 82 of public/sikkim/blender/train.mp4), and the hook on top: "SIKKIM / ट्रेन क्यों नहीं?",
 * with a "0 STATIONS" stamp under the train. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const SikkimCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: '#05080a', overflow: 'hidden' }}>
      {/* pushed in a little on the portal and the train's nose */}
      <Img src={staticFile('sikkim/cover/train_f082.png')} style={{ position: 'absolute', left: -80, top: -60, width: 1240, height: 2204, filter: 'contrast(1.08) saturate(1.12) brightness(1.04)' }} />
      {/* headlight bloom */}
      <div style={{ position: 'absolute', left: 490, top: 975, width: 300, height: 180, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,236,200,0.55), rgba(255,200,140,0) 70%)', mixBlendMode: 'screen' }} />
      {/* darken top and bottom so the words read */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.75) 100%)' }} />
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 220px rgba(0,0,0,0.65)' }} />
      {text && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center' }}>
            <div style={{ fontFamily: TITLE, fontSize: 230, lineHeight: 1, color: '#fff', letterSpacing: 6, WebkitTextStroke: '12px #0A0F16', paintOrder: 'stroke fill', textShadow: '0 0 44px rgba(47,230,208,0.5), 0 10px 26px rgba(0,0,0,0.6)' }}>SIKKIM</div>
            <div style={{ display: 'inline-block', marginTop: 18, padding: '4px 44px 0', background: 'linear-gradient(180deg, #E2333A, #A8161D)', border: '7px solid #fff', borderRadius: 20, transform: 'rotate(-3deg)', boxShadow: '0 12px 26px rgba(0,0,0,0.5)' }}>
              <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 112, lineHeight: 1.12, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.25)' }}>ट्रेन क्यों नहीं?</div>
            </div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 22, padding: '10px 40px 6px', background: 'rgba(8,14,18,0.82)', border: '5px solid #2FE6D0', borderRadius: 18, boxShadow: '0 10px 24px rgba(0,0,0,0.5)' }}>
              <span style={{ fontFamily: TITLE, fontSize: 130, color: '#2FE6D0', lineHeight: 1 }}>0</span>
              <span style={{ fontFamily: TITLE, fontSize: 74, color: '#fff', letterSpacing: 4, lineHeight: 1 }}>RAILWAY STATIONS</span>
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
