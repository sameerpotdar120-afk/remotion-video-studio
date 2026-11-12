import React from 'react';
import { AbsoluteFill } from 'remotion';
import { WORLD, WORLD_MPP } from './cam';
import { At, Baby, Barrel, Big, COL, Envelope, Rupee, Stopwatch } from './EverySecond';
import { Grade, MAP_GRADE } from './Fx';
import { UI, useFonts } from './font';
import { MapLayers } from './Map';

/**
 * The cover for YouTube Shorts and Instagram Reels: the edit's world map, the big stopwatch from frame 0 with the props
 * of the video around it (babies, ₹ pings, emails, an oil barrel), and "1 सेकंड में इतना कुछ?" in the top third.
 * Inside the 3:4 crop.
 */
export const EsCover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: '#0E2A55', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={{ x: WORLD[0] + 1.2e6, y: 3.0e6, mpp: WORLD_MPP * 0.66 }} /></AbsoluteFill>
      <Grade t={10} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: 'linear-gradient(180deg, rgba(5,10,20,0.85) 0%, rgba(5,10,20,0.55) 55%, rgba(5,10,20,0))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 265, textAlign: 'center', lineHeight: 1.05 }}>
        <Big text="1 सेकंड में" size={160} color={COL.gold} font={UI} /><br />
        <Big text="इतना कुछ?!" size={150} color="#fff" font={UI} />
      </div>
      <At x={540} y={1080}><Stopwatch p={0.62} size={520} /></At>
      <At x={200} y={840} rot={-12}><Baby s={1.9} /></At>
      <At x={870} y={840} rot={10}><Rupee s={3.2} /></At>
      <At x={190} y={1380} rot={8}><Envelope s={2.2} /></At>
      <At x={890} y={1370} rot={-8}><Barrel t={0} s={1.9} i={0} /></At>
    </AbsoluteFill>
  );
};
