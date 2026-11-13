import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GEO, HOOK, lineD, merc } from './cam';
import { Big } from './RamSetu';
import { UI, useFonts } from './font';
import { MapLayers } from './Map';
import { Cut } from './Studio';

/**
 * The cover for YouTube Shorts and Instagram Reels: the edit's satellite view of the Setu shoals with the gold Setu line,
 * Shri Ram on the Indian shore, floating stones with "राम", and "राम सेतु" over "1480 तक पैदल रास्ता?" in the top third.
 * Inside the 3:4 crop.
 */
export const RsCover: React.FC = () => {
  useFonts();
  const c = { x: merc(79.58, 9.12)[0], y: merc(79.58, 9.12)[1] - 1500, mpp: 36 };
  return (
    <AbsoluteFill style={{ background: '#0E2A55', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: 'contrast(1.1) saturate(1.25) brightness(1.02)' }}><MapLayers c={c} /></AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs><filter id="cg"><feGaussianBlur stdDeviation="9" /></filter></defs>
        <path d={lineD(c, GEO.setu)} fill="none" stroke="#FFC21A" strokeWidth={34} opacity={0.55} filter="url(#cg)" strokeLinecap="round" />
        <path d={lineD(c, GEO.setu)} fill="none" stroke="#FFE9A0" strokeWidth={10} strokeLinecap="round" />
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,170,60,0.35), rgba(255,110,20,0.1) 60%, rgba(60,20,0,0.35))', mixBlendMode: 'soft-light' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: 'linear-gradient(180deg, rgba(5,10,20,0.85) 0%, rgba(5,10,20,0.55) 55%, rgba(5,10,20,0))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', lineHeight: 1.05 }}>
        <Big text="राम सेतु" size={200} color="#FF8A1E" font={UI} /><br />
        <Big text="1480 तक पैदल रास्ता?" size={84} color="#fff" font={UI} />
      </div>
      <div style={{ position: 'absolute', left: 30, top: 820 }}><Cut k="f_shri_ram" w={430} /></div>
      {[[640, 1270, 230], [860, 1380, 200]].map(([x, y, w], i) => (
        <div key={i} style={{ position: 'absolute', left: x - w / 2, top: y - w / 2 }}>
          <div style={{ position: 'relative' }}>
            <Cut k="f_floating_stone" w={w} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '20%', textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: w * 0.3, color: '#FF8A1E', textShadow: '0 0 18px #FFB347, 0 2px 0 #5A2A00' }}>राम</div>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
export const _HOOK = HOOK;
