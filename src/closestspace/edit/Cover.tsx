import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HEAD, useTZFonts } from '../../timezones/fonts';
import { C } from './cam';
import { Globe, SpaceBg, globeAt, globePoint } from './Globe';

/**
 * The cover for YouTube Shorts and Instagram Reels: the globe turned to South America with Ecuador glowing and a flare
 * on Chimborazo, the question above and "Everest नहीं" crossed. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const CsCover: React.FC<{ text?: boolean }> = ({ text = true }) => {
  useTZFonts();
  const t = C.ecuador11 + 1.6;
  const g = globeAt(t);
  const p = globePoint(g, -78.817, -1.469);
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.06, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.6)' };
  return (
    <AbsoluteFill style={{ background: '#040b18' }}>
      <SpaceBg t={t} />
      <AbsoluteFill style={{ transform: 'translateY(170px) scale(1.12)' }}>
        <Globe t={t} />
        <div style={{ position: 'absolute', left: p.x - 140, top: p.y - 140, width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, #ffffff 0%, rgba(255,241,184,0.9) 18%, rgba(255,200,61,0.35) 45%, rgba(255,200,61,0) 70%)' }} />
      </AbsoluteFill>
      {text && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center' }}>
          <div style={{ ...big, fontSize: 112, color: '#fff' }}>space के सबसे पास</div>
          <div style={{ ...big, fontSize: 124, color: '#FFC83D' }}>कौन सा देश?</div>
          <div style={{ ...big, fontSize: 70, color: '#fff', marginTop: 20, WebkitTextStroke: '9px #000' }}>Everest नहीं ❌</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
