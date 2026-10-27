import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { UI, useFonts } from '../motion/font';
import { MapView, PATCH, indiaRing, merc, patchRing, ringsD, toS } from '../motion/MapView';
import { Cam } from './cam';

// The thumbnail (1080×1920; everything that matters inside the middle 3:4 crop, y 240–1680): the creator's trash island
// big under the cyan outline, India beside it at the same scale for the size comparison, a red ✕ pin, and the title.
const IMG = (k: string) => staticFile(`garbagepatch/img/${k}.png`);
export const GarbagePatchCover: React.FC = () => {
  useFonts();
  const c: Cam = { x: PATCH[0] + 900e3, y: PATCH[1] - 450e3, mpp: 5000 };
  const [px, py] = toS(c, PATCH);
  const w = (2 * 1062e3 * 1.3) / c.mpp, h = (2 * 661e3 * 1.3) / c.mpp;
  const ia = merc(-127.5, 10), [ix, iy] = toS(c, ia);
  const glow = (col: string) => `0 0 18px ${col}, 0 0 40px ${col}, 0 8px 14px rgba(0,0,0,0.6)`;
  return (
    <AbsoluteFill style={{ background: '#0d3a5c', overflow: 'hidden' }}>
      <MapView c={c} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={ringsD(c, indiaRing(ia))} fill="#FF9933" fillOpacity={0.6} stroke="#fff" strokeWidth={4} style={{ filter: 'drop-shadow(0 0 14px #FF9933)' }} />
      </svg>
      <Img src={IMG('gp01_trash_island')} style={{ position: 'absolute', left: px - w / 2, top: py - h / 2, width: w, height: h, objectFit: 'contain', filter: 'drop-shadow(0 16px 20px rgba(0,20,40,0.6))' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={ringsD(c, patchRing())} fill="none" stroke="#3FD8FF" strokeWidth={22} opacity={0.6} style={{ filter: 'blur(10px)' }} />
        <path d={ringsD(c, patchRing())} fill="none" stroke="#3FD8FF" strokeWidth={7} />
        <path d={ringsD(c, patchRing())} fill="none" stroke="#fff" strokeWidth={2.5} />
      </svg>
      <div style={{ position: 'absolute', left: ix - 90, top: iy - 30, padding: '4px 22px 0', borderRadius: 14, background: 'rgba(255,255,255,0.95)', fontFamily: UI, fontWeight: 800, fontSize: 52, color: '#0B1620' }}>भारत</div>
      <div style={{ position: 'absolute', left: ix - 330, top: iy - 160, fontFamily: UI, fontWeight: 800, fontSize: 140, color: '#fff', textShadow: glow('#3FD8FF') }}>½</div>
      <Img src={IMG('gp19_map_pin')} style={{ position: 'absolute', left: px - 75, top: py - h * 0.1 - 200, width: 150, height: 210, objectFit: 'contain', filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.5))' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <g transform={`translate(${px} ${py - h * 0.1 - 110})`} stroke="#FF2E3F" strokeWidth={26} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 12px #FF2E3F) drop-shadow(0 6px 6px rgba(0,0,0,0.6))' }}>
          <line x1={-80} y1={-80} x2={80} y2={80} /><line x1={80} y1={-80} x2={-80} y2={80} />
        </g>
      </svg>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,10,20,0.75), rgba(0,0,0,0) 34%, rgba(0,0,0,0) 72%, rgba(0,10,20,0.7))' }} />
      <div style={{ position: 'absolute', left: 30, right: 30, top: 250, textAlign: 'center', fontFamily: UI, fontWeight: 800, lineHeight: 1.12 }}>
        <div style={{ fontSize: 104, color: '#FFD84D', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 8px 16px rgba(0,0,0,0.7)' }}>भारत से आधा बड़ा</div>
        <div style={{ fontSize: 104, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 8px 16px rgba(0,0,0,0.7)' }}>कचरे का island</div>
      </div>
      <div style={{ position: 'absolute', left: 30, right: 30, top: 505, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 80, color: '#fff', WebkitTextStroke: '9px #000', paintOrder: 'stroke fill',
        textShadow: '0 0 18px #FF2E3F, 0 8px 16px rgba(0,0,0,0.7)' }}>किसी नक्शे पर नहीं! ❌</div>
    </AbsoluteFill>
  );
};
