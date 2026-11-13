import React from 'react';
import { AbsoluteFill } from 'remotion';
import { WORLD } from './cam';
import { At, Big, COL, Stopwatch } from './EverySecond';
import { Grade, MAP_GRADE } from './Fx';
import { UI, useFonts } from './font';
import { MapLayers } from './Map';
import { Cut } from './Studio';

/**
 * The cover for YouTube Shorts and Instagram Reels (v2): the edit's world map, the creator's chrome stopwatch with the
 * red one-second ring, and the video's props around it (a newborn, the payment phone, the Earth, a flying email), with
 * "बस 1 सेकंड!" in the top third. Inside the 3:4 crop.
 */
export const EsCover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: '#0E2A55', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={{ x: WORLD[0] + 1.2e6, y: 3.0e6, mpp: 11880 }} /></AbsoluteFill>
      <Grade t={10} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(0,10,25,0.05), rgba(0,10,25,0.55))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: 'linear-gradient(180deg, rgba(5,10,20,0.85) 0%, rgba(5,10,20,0.55) 55%, rgba(5,10,20,0))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 255, textAlign: 'center', lineHeight: 1.05 }}>
        <Big text="बस" size={130} color="#fff" font={UI} /><br />
        <Big text="1 सेकंड!" size={190} color={COL.gold} font={UI} />
      </div>
      <At x={560} y={1080} rot={-6}><Stopwatch p={0.75} size={560} /></At>
      <At x={190} y={830} rot={-14}><Cut k="b_baby_1" w={300} /></At>
      <At x={900} y={820} rot={12}><Cut k="e_phone_paid" w={170} /></At>
      <At x={180} y={1440} rot={-10}><Cut k="e_envelope" w={300} /></At>
      <At x={890} y={1430} rot={0}><Cut k="s_earth" w={300} /></At>
    </AbsoluteFill>
  );
};
