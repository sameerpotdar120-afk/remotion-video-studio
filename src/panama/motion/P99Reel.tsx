import React from 'react';
import { AbsoluteFill, Img, Sequence, random, staticFile, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { P01ShipQueue } from './P01ShipQueue';
import { P02BobArrow } from './P02BobArrow';
import { P03Odometer } from './P03Odometer';
import { P04Sticker } from './P04Sticker';
import { P05Stamp } from './P05Stamp';
import { P06Label } from './P06Label';
import { P07SaltFresh } from './P07SaltFresh';
import { P08Locks } from './P08Locks';
import { P09WaterArc } from './P09WaterArc';
import { P10Pools } from './P10Pools';
import { P11RainCloud } from './P11RainCloud';
import { P12Kid } from './P12Kid';
import { P13Sun } from './P13Sun';
import { P14Waiting } from './P14Waiting';
import { P15ElNino } from './P15ElNino';
import { P16Calendar } from './P16Calendar';
import { P17Auction } from './P17Auction';
import { P18LakeBubble } from './P18LakeBubble';
import { P19Balance } from './P19Balance';
import { P20Dam } from './P20Dam';
import { P21Ecg } from './P21Ecg';
import { P22Route } from './P22Route';

// p99_reel: every component in a row over the real EOX/terrain plates (public/panama/maps) with a slow camera push and
// the house grade, as they will sit in the edit, with its id, to check the motion.
const MapBg: React.FC<{ plate: string; pos?: string; z0?: number; z1?: number }> = ({ plate, pos = '50% 50%', z0 = 1.05, z1 = 1.18 }) => {
  const f = useCurrentFrame();
  const z = z0 + (z1 - z0) * Math.min(1, f / 400);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#0a2238' }}>
      <Img src={staticFile(`panama/maps/${plate}_geo.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${z}) translate(${Math.sin(f / 80) * 10}px, ${Math.cos(f / 90) * 8}px) rotate(${Math.sin(f / 120) * 0.6}deg)`, filter: 'contrast(1.12) saturate(1.2) brightness(1.03)' }} />
    </AbsoluteFill>
  );
};
const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,92,118,0.3), rgba(0,70,96,0.15) 45%, rgba(0,60,90,0.28))', mixBlendMode: 'soft-light' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(255,176,96,0.18), rgba(255,140,60,0) 62%)', mixBlendMode: 'overlay' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 56%, rgba(0,4,12,0.45) 100%)' }} />
  </AbsoluteFill>
);
const SEA: React.FC = () => <MapBg plate="approach" pos="62% 70%" />;
const LAND: React.FC = () => <MapBg plate="canal" pos="38% 45%" />;
const AMER: React.FC = () => <MapBg plate="americas" pos="60% 55%" z0={1.0} z1={1.08} />;
// the drought stage (stand-in until the creator's pc04 lakebed arrives): a hot sky over cracked mud
const DRY: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, #CFE6F0 0%, #F1E9D6 42%, #C9A77A 46%, #8C6A46 100%)' }}>
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <path d="M 0 880 C 200 820 360 860 540 840 C 760 816 900 850 1080 830 L 1080 900 L 0 900 Z" fill="#5E8A4E" opacity={0.9} />
      {Array.from({ length: 140 }, (_, i) => {
        const x = random(`cx${i}`) * 1080, y = 900 + Math.pow(random(`cy${i}`), 1.4) * 1020, w = 30 + (y - 900) * 0.18;
        return <path key={i} d={`M ${x} ${y} l ${w * 0.5} ${w * 0.12} l ${w * 0.2} ${-w * 0.18} M ${x} ${y} l ${-w * 0.4} ${w * 0.15}`} stroke="#5A3E22" strokeWidth={1.5 + (y - 900) / 400} opacity={0.7} fill="none" />;
      })}
    </svg>
  </AbsoluteFill>
);
const CITY: React.FC = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, #8ED0F5 0%, #DDF1FB 40%, #3E8FC0 41%, #2E7BB0 52%, #D8D2C2 53%, #B9B2A2 100%)' }} />;
const STAGE: React.FC = () => <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #233447, #0C141E 75%)' }} />;
type Item = [string, number, React.ReactNode];
const box = (w: number, h: number, node: React.ReactNode, top = 960, left = 540) => (
  <div style={{ position: 'absolute', left: left - w / 2, top: top - h / 2, width: w, height: h }}>{node}</div>
);
export const REEL: Item[] = [
  ['p01 ship queue + p02 arrow + p04 sticker', 200, <><SEA /><P01ShipQueue overtake={90} />{box(300, 300, <P02BobArrow out={80} />, 860, 700)}{box(1080, 500, <P04Sticker />, 330)}</>],
  ['p03 odometer + p06 pill', 150, <><SEA />{box(1000, 260, <P03Odometer to={5300000} dur={60} />, 700)}{box(600, 300, <Sequence from={80} layout="none"><P06Label look="pill" text="SKIP THE LINE" leader={false} /></Sequence>, 1000)}</>],
  ['p06 labels', 100, <><LAND />{box(600, 300, <P06Label text="Gatun Lake" />, 700)}{box(600, 300, <Sequence from={20} layout="none"><P06Label text="Panama Canal" look="red" /></Sequence>, 1150)}</>],
  ['p07 salt / fresh', 110, <><LAND />{box(1080, 1080, <P07SaltFresh />)}</>],
  ['p08 locks', 540, <P08Locks dur={540} />],
  ['p09 water arc + p03 litres', 150, <><AbsoluteFill style={{ background: 'linear-gradient(180deg, #7CC8F2, #DFF3FC)' }} />{box(1080, 1080, <P09WaterArc />)}{box(1000, 260, <P03Odometer from={0} to={200000000} prefix="" suffix="लीटर" indian dur={70} size={120} />, 360)}</>],
  ['p10 pools', 220, <P10Pools n={80} drain={150} />],
  ['p11 rain cloud', 150, <><LAND />{box(800, 800, <P11RainCloud dry={100} />, 700)}</>],
  ['p13 sun + p12 kid (cry, shock)', 240, <><DRY />{box(600, 600, <P13Sun />, 420, 760)}{box(800, 1000, <P12Kid beats={[[0, 'smile', ''], [50, 'cry', ''], [150, 'oh', '!']]} />, 1300)}{box(1000, 260, <Sequence from={60} layout="none"><P03Odometer from={36} to={22} prefix="" suffix="ships" down dur={50} /></Sequence>, 560)}</>],
  ['p14 waiting', 100, <><SEA />{box(600, 600, <P14Waiting />)}</>],
  ['p15 el niño', 120, <><AMER /><P15ElNino y={1050} /></>],
  ['p16 calendar + p17 auction', 170, <><STAGE />{box(1080, 1080, <P17Auction />, 1000)}{box(400, 400, <Sequence from={110} layout="none"><P16Calendar /></Sequence>, 360, 820)}</>],
  ['p05 stamp', 90, <><SEA />{box(1000, 320, <P05Stamp text="RECORD" />)}</>],
  ['p12 kid (drink ?) + p18 lake bubble', 200, <><CITY />{box(800, 1000, <P12Kid beats={[[0, 'drink', ''], [80, 'smile', '?'], [150, 'oh', '!']]} />, 1300)}{box(500, 700, <Sequence from={70} layout="none"><P18LakeBubble /></Sequence>, 560, 620)}</>],
  ['p19 balance', 140, <><LAND />{box(900, 700, <P19Balance />)}</>],
  ['p20 dam + p21 ecg', 170, <><LAND />{box(1080, 1080, <P20Dam />, 1050)}{box(800, 240, <Sequence from={100} layout="none"><P21Ecg /></Sequence>, 360)}</>],
  ['p21 ecg flatline', 120, <><LAND />{box(800, 240, <P21Ecg flat={50} />, 700)}</>],
  ['p22 route', 130, <><AMER /><P22Route /></>],
];
export const REEL_FRAMES = REEL.reduce((a, [, d]) => a + d, 0);
export const P99Reel: React.FC = () => {
  useFonts();
  let at = 0;
  return (
    <AbsoluteFill>
      {REEL.map(([name, d, node], i) => {
        const from = at;
        at += d;
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            <AbsoluteFill>{node}</AbsoluteFill>
            <Grade />
            <div style={{ position: 'absolute', left: 30, top: 30, fontFamily: NUM, fontSize: 40, color: '#fff', opacity: 0.8, textShadow: '0 2px 4px #000' }}>{name}</div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
