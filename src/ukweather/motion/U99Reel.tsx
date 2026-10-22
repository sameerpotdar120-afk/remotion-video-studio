import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { NUM, useFonts } from './font';
import { U01TouristPop } from './U01TouristPop';
import { U02WeatherMontage } from './U02WeatherMontage';
import { U03WindBlow } from './U03WindBlow';
import { U04NeonSlam } from './U04NeonSlam';
import { U05Lightning } from './U05Lightning';
import { U06FillDevelop } from './U06FillDevelop';
import { U07Calendar } from './U07Calendar';
import { U08EllipseTitle } from './U08EllipseTitle';
import { U09TiltWorld } from './U09TiltWorld';
import { U10GiantWord } from './U10GiantWord';
import { U11GlowLabel } from './U11GlowLabel';
import { U12RibbonGrow } from './U12RibbonGrow';
import { U13HatchHalo } from './U13HatchHalo';
import { U14DashArrow } from './U14DashArrow';
import { U15FlyAtCamera } from './U15FlyAtCamera';
import { U16WindCurls } from './U16WindCurls';
import { U17AirTag } from './U17AirTag';
import { U18SendUmbrella } from './U18SendUmbrella';

// u99_reel: every component in a row on a map-coloured backdrop, with its id, to check the motion.
const BG: React.FC = () => <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #2F6A62, #0F3348 75%)' }} />;
type Item = [string, number, React.ReactNode];
const box = (w: number, h: number, node: React.ReactNode, top = 960) => (
  <div style={{ position: 'absolute', left: 540 - w / 2, top: top - h / 2, width: w, height: h }}>{node}</div>
);
export const REEL: Item[] = [
  ['u01 tourist pop', 110, box(800, 1000, <U01TouristPop open={40} />)],
  ['u02 weather montage', 300, <U02WeatherMontage />],
  ['u03 wind blow', 90, <U03WindBlow />],
  ['u04 neon slam + u05 lightning', 140, <>{box(1080, 1080, <U04NeonSlam out={110} />)}<Sequence from={40} layout="none"><U05Lightning /></Sequence></>],
  ['u06 fill develop', 70, box(1080, 1080, <U06FillDevelop />)],
  ['u07 calendar', 150, box(1080, 700, <U07Calendar />)],
  ['u08 ellipse title + strike', 160, box(1080, 1080, <U08EllipseTitle strike={110} />)],
  ['u09 tilt world', 240, <U09TiltWorld back={200} />],
  ['u10 giant word + u11 label', 150, <><U10GiantWord out={130} />{box(800, 400, <Sequence from={60} layout="none"><U11GlowLabel /></Sequence>, 1400)}</>],
  ['u12 ribbon grow', 90, box(1080, 1080, <U12RibbonGrow />)],
  ['u13 hatch halo', 130, box(1080, 1080, <U13HatchHalo />)],
  ['u14 dash arrows', 90, <U14DashArrow />],
  ['u15 fly at camera', 110, box(1080, 1080, <U15FlyAtCamera fly={70} />)],
  ['u16 wind curls', 150, <U16WindCurls />],
  ['u17 air tags', 110, <>{box(600, 300, <U17AirTag from="top" />, 600)}{box(600, 300, <Sequence from={12} layout="none"><U17AirTag from="left" lines={['Returning', 'Polar', 'Maritime']} color="#7A3FD8" /></Sequence>, 960)}{box(600, 300, <Sequence from={24} layout="none"><U17AirTag from="bottom" lines={['Tropical', 'Continental']} color="#D8262B" /></Sequence>, 1320)}</>],
  ['u18 send umbrella', 120, box(600, 700, <U18SendUmbrella />)],
];
export const REEL_FRAMES = REEL.reduce((a, [, d]) => a + d, 0);
export const U99Reel: React.FC = () => {
  useFonts();
  let at = 0;
  return (
    <AbsoluteFill>
      <BG />
      {REEL.map(([name, d, node], i) => {
        const from = at;
        at += d;
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            <AbsoluteFill>{node}</AbsoluteFill>
            <div style={{ position: 'absolute', left: 30, top: 30, fontFamily: NUM, fontSize: 40, color: '#fff', opacity: 0.8 }}>{name}</div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
