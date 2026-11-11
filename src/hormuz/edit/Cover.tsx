import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, merc } from './cam';
import { Grade } from './Fx';
import { UI, useFonts } from './font';
import { Big, Cut, World } from './Hormuz';

/**
 * The cover for YouTube Shorts and Instagram Reels: the edit's 3D satellite map over Musandam with the canal cut across
 * it (UAE and Oman raised), the tanker lane, a tanker, and the hook "Canal क्यों नहीं?". Inside the 3:4 crop.
 */
export const HzCover: React.FC = () => {
  useFonts();
  const [x, y] = merc(56.15, 25.95);
  const c: Cam = { x, y, mpp: 175, tilt: 44, yaw: -8 };
  const t = C.oman1 + 0.2;
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <World t={t} c={c} atlas={0} />
      <Grade t={10} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 700, background: 'linear-gradient(180deg, rgba(5,10,20,0.85) 0%, rgba(5,10,20,0.6) 50%, rgba(5,10,20,0))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center', lineHeight: 1.05 }}>
        <Big text="Canal" size={170} color="#FFC21A" font={UI} /><br />
        <Big text="क्यों नहीं?" size={140} color="#fff" font={UI} />
      </div>
      <div style={{ position: 'absolute', left: 20, top: 900, transform: 'rotate(-12deg)' }}><Cut k="h01_tanker" w={430} /></div>
    </AbsoluteFill>
  );
};
