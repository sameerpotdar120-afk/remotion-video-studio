import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, onCanvas, poseAt, toS } from './cam';
import { UI, useFonts } from './font';
import { Big, COL, Grade, OldMap } from './Pangea';

/**
 * The cover for YouTube Shorts and Instagram Reels: the edit's old map of Pangea with India lit orange, wedged between
 * Africa, Antarctica and Australia, an arrow onto it, and "भारत यहाँ था!" in the top third. Inside the 3:4 crop.
 */
export const PgCover: React.FC = () => {
  useFonts();
  const t = C.aur_bharat + 1.2;
  const c: Cam = { x: 3600, y: 1900, kpp: 7.4 };
  const [ix, iy] = toS(c, onCanvas(poseAt(t, 'india'), [0, -300]));
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <OldMap c={c} t={t} />
      <Grade t={10} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: 'linear-gradient(180deg, rgba(5,10,20,0.82) 0%, rgba(5,10,20,0.55) 55%, rgba(5,10,20,0))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', lineHeight: 1.05 }}>
        <Big text="भारत" size={190} color={COL.india} font={UI} /><br />
        <Big text="यहाँ था!" size={150} color="#fff" font={UI} />
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={`M${ix + 250},${iy - 260} Q${ix + 230},${iy - 90} ${ix + 60},${iy - 40}`} stroke="#0B1830" strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={`M${ix + 250},${iy - 260} Q${ix + 230},${iy - 90} ${ix + 60},${iy - 40}`} stroke={COL.gold} strokeWidth={18} fill="none" strokeLinecap="round" />
        <path d={`M${ix + 40},${iy - 95} L${ix + 50},${iy - 35} L${ix + 115},${iy - 25}`} stroke="#0B1830" strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${ix + 40},${iy - 95} L${ix + 50},${iy - 35} L${ix + 115},${iy - 25}`} stroke={COL.gold} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};
