import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GEO, merc, ringsD, toS } from './cam';
import { Big } from './UK';
import { UI, useFonts } from './font';
import { MapLayers } from './Map';
import { Cut, Hue, Slab } from './Studio';

/**
 * The cover for YouTube Shorts and Instagram Reels: the UK on the satellite map with its four countries as raised studio
 * slabs (England red, Scotland blue, Wales green, Northern Ireland orange), the creator's crown and guardsman, and
 * "1 देश या 4?" in the top third. Inside the 3:4 crop.
 */
export const UkCover: React.FC = () => {
  useFonts();
  const [x, y] = merc(-3.4, 54.2);
  const c = { x, y, mpp: 950 };
  const four: [string, Hue][] = [['England', 'red'], ['Scotland', 'blue'], ['Wales', 'green' as Hue], ['NorthernIreland', 'orange' as Hue]];
  return (
    <AbsoluteFill style={{ background: '#0E2A55', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: 'contrast(1.08) saturate(1.2) brightness(1.03)' }}><MapLayers c={c} /></AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {four.map(([k, h]) => { const [cx, cy] = toS(c, GEO.centroids[k]); return <Slab key={k} id={`cv${k}`} t={3} d={ringsD(c, GEO.countries[k])} hue={h} g={1} depth={16} cx={cx} cy={cy} />; })}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: 'linear-gradient(180deg, rgba(5,10,20,0.88) 0%, rgba(5,10,20,0.55) 55%, rgba(5,10,20,0))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 255, textAlign: 'center', lineHeight: 1.0 }}>
        <Big text="1 देश" size={170} color="#fff" font={UI} /><br />
        <Big text="या 4?" size={190} color="#FFC21A" font={UI} />
      </div>
      <div style={{ position: 'absolute', left: 720, top: 760 }}><Cut k="a_crown" w={300} /></div>
      <div style={{ position: 'absolute', left: 30, top: 1050 }}><Cut k="a_guardsman" w={210} /></div>
    </AbsoluteFill>
  );
};
