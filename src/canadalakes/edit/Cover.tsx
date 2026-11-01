import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, GEO, merc, toS } from './cam';
import { Pin, TwoTone, Vectors } from './CanadaLakes';
import { TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';

/**
 * The cover for YouTube Shorts and Instagram Reels: all of Canada in red with its lakes lit cyan (the video's line 1),
 * a pin on Stupid Lake, and the hook: "20 लाख झीलें" / "नाम ख़त्म!". Everything that matters sits inside
 * the 3:4 crop (y 240–1680).
 */
export const CanadaCover: React.FC = () => {
  useFonts();
  const [x, y] = merc(-98, 62.5);
  const c: Cam = { x, y, mpp: 7200 };
  const t = C.another1 + 0.5; // the frame where the fill is red and every dot is lit
  const [sx, sy] = toS(c, GEO.points['Stupid Lake']);
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <MapLayers c={c} />
      <Vectors t={t} c={c} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 26%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.65) 88%)' }} />
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 220px rgba(0,0,0,0.6)' }} />
      <Pin t={10} t0={0} x={sx} y={sy} size={120} label={<TwoTone a="Stupid" b="Lake" size={96} />} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center' }}>
        <div style={{ fontFamily: TITLE, fontSize: 200, lineHeight: 1, color: '#FFD23F', WebkitTextStroke: '14px #0A0F16', paintOrder: 'stroke fill', textShadow: '0 0 40px rgba(255,210,63,0.45)' }}>20 लाख</div>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 130, lineHeight: 1.05, color: '#fff', WebkitTextStroke: '10px #0A0F16', paintOrder: 'stroke fill' }}>झीलें</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1390, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '6px 50px 0', background: 'linear-gradient(180deg, #E2333A, #A8161D)', border: '8px solid #fff', borderRadius: 22, transform: 'rotate(-3deg)', boxShadow: '0 14px 30px rgba(0,0,0,0.55)' }}>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 124, lineHeight: 1.12, color: '#fff' }}>नाम ख़त्म!</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
