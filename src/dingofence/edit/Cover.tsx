import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { AUS, Cam, GEO, lineD, ringsD } from './cam';
import { Clouds, Grade, HiFill, MAP_GRADE } from './Fx';
import { TITLE, useFonts } from './font';
import { MapLayers } from './Map';
import { K } from './Props';

/**
 * The cover for YouTube Shorts and Instagram Reels: Australia with the fence glowing across it, the two sides lit
 * (sheep green, dingo orange), the dingo cut-out big in front, and the hook "5,614 KM FENCE" / "FOR ONE DOG?".
 * Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const DgCover: React.FC = () => {
  useFonts();
  const c: Cam = { x: AUS[0], y: AUS[1] - 250000, mpp: 4600 };
  const d = lineD(c, GEO.fence);
  const st = { WebkitTextStroke: '14px #0A0F16', paintOrder: 'stroke fill' } as const;
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={c} /></AbsoluteFill>
      <Clouds t={10} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs><filter id="glow"><feGaussianBlur stdDeviation="6" /></filter><filter id="glow2"><feGaussianBlur stdDeviation="16" /></filter></defs>
        <HiFill id="cs" t={10} d={ringsD(c, GEO.sides.sheep)} color="#7FD36B" alpha={0.3} />
        <HiFill id="cd" t={10} d={ringsD(c, GEO.sides.dingo)} color="#FF9A3C" alpha={0.22} />
        <path d={d} fill="none" stroke="#3FA9FF" strokeWidth={34} filter="url(#glow2)" opacity={0.85} />
        <path d={d} fill="none" stroke="#fff" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#3FA9FF" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Grade t={10} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', fontFamily: TITLE, lineHeight: 1 }}>
        <div style={{ fontSize: 150, color: '#3FA9FF', ...st }}>5,614 KM</div>
        <div style={{ fontSize: 120, color: '#fff', ...st }}>FENCE</div>
      </div>
      <Img src={staticFile('dingofence/img/d01_dingo_stand.png')} style={{ position: 'absolute', left: 120, top: 1080, width: 700, filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.6))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1500, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '4px 40px 0', background: 'linear-gradient(180deg, #E2333A, #A8161D)', border: '8px solid #fff', borderRadius: 22, transform: 'rotate(-3deg)', boxShadow: '0 14px 30px rgba(0,0,0,0.55)' }}>
          <div style={{ fontFamily: TITLE, fontSize: 104, lineHeight: 1.15, color: '#fff', letterSpacing: 2 }}>FOR ONE <span style={{ color: K.gold }}>DOG?</span></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
