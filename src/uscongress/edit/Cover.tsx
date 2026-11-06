import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Cam, GEO, merc, ringsD, toS } from './cam';
import { Clouds, Grade, HiFill, MAP_GRADE } from './Fx';
import { TITLE, useFonts } from './font';
import { MapLayers } from './Map';
import { K, Pair } from './Props';

/**
 * The cover for YouTube Shorts and Instagram Reels: the US with Wyoming (red) and New York (orange) lit, two senators
 * on each, and the hook: "588,000 = 20 MILLION?" with a HOUSE vs SENATE badge. Everything that matters sits inside the
 * 3:4 crop (y 240–1680).
 */
export const UsCover: React.FC = () => {
  useFonts();
  const [x, y] = merc(-92, 38.5);
  const c: Cam = { x, y, mpp: 5200 };
  const [wx, wy] = toS(c, GEO.points.Wyoming), [nx, ny] = toS(c, GEO.points['New York']);
  const st = { WebkitTextStroke: '14px #0A0F16', paintOrder: 'stroke fill' } as const;
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={c} /></AbsoluteFill>
      <Clouds t={10} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs><filter id="glow"><feGaussianBlur stdDeviation="6" /></filter></defs>
        <path d={ringsD(c, GEO.countries.USA)} fill="#F6EEDC" opacity={0.18} stroke="#fff" strokeWidth={3} />
        <HiFill id="cw" t={10} d={ringsD(c, GEO.states.Wyoming)} color={K.red} alpha={0.85} />
        <HiFill id="cn" t={10} d={ringsD(c, GEO.states['New York'])} color={K.orange} alpha={0.85} />
      </svg>
      <div style={{ position: 'absolute', left: wx - 60, top: wy - 70 }}><Pair s={1} /></div>
      <div style={{ position: 'absolute', left: nx - 60, top: ny - 70 }}><Pair s={1} /></div>
      <Grade t={10} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', fontFamily: TITLE, lineHeight: 1 }}>
        <div style={{ fontSize: 150, color: K.red, ...st }}>588,000</div>
        <div style={{ fontSize: 120, color: '#fff', ...st }}>=</div>
        <div style={{ fontSize: 150, color: K.orange, ...st }}>20 MILLION?</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1360, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '4px 40px 0', background: 'linear-gradient(180deg, #1767C4, #0A3772)', border: '8px solid #fff', borderRadius: 22, transform: 'rotate(-3deg)', boxShadow: '0 14px 30px rgba(0,0,0,0.55)' }}>
          <div style={{ fontFamily: TITLE, fontSize: 112, lineHeight: 1.15, color: '#fff', letterSpacing: 2 }}>HOUSE <span style={{ color: K.gold }}>vs</span> SENATE</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
