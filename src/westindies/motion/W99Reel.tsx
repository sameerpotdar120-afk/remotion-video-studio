import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { C } from './theme';
import { W01Magnifier } from './W01Magnifier';
import { W02CrossStamp } from './W02CrossStamp';
import { W03BigCount } from './W03BigCount';
import { W04SpeechBubble } from './W04SpeechBubble';
import { W05Voyage } from './W05Voyage';
import { W06Columbus } from './W06Columbus';
import { W07Cricketer } from './W07Cricketer';
import { W08Ballot } from './W08Ballot';
import { W09FedFlag } from './W09FedFlag';
import { W10Crack } from './W10Crack';
import { W11TitleCard } from './W11TitleCard';
import { W12GlowLabel } from './W12GlowLabel';
import { W13Parliament } from './W13Parliament';

// w99_reel: every component in a row over a dark "Midnight" map (a preview of the grade: the satellite pulled down
// and cooled, the sea near-black navy, the shallows kept turquoise), with a slow push, as they will sit in the edit.
export const MIDNIGHT = 'brightness(0.62) contrast(1.18) saturate(0.85) hue-rotate(-6deg)';
const Dark: React.FC<{ pos?: string; z0?: number; z1?: number }> = ({ pos = '60% 36%', z0 = 2.4, z1 = 2.65 }) => {
  const f = useCurrentFrame();
  const z = z0 + (z1 - z0) * Math.min(1, f / 400);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: C.night }}>
      <Img src={staticFile('panama/maps/americas_geo.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${z}) translate(${Math.sin(f / 80) * 10}px, ${Math.cos(f / 90) * 8}px)`, filter: MIDNIGHT }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(4,14,26,0.55), rgba(4,14,26,0.15) 40%, rgba(4,14,26,0.55))' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,4,10,0.6) 100%)' }} />
    </AbsoluteFill>
  );
};
const box = (w: number, h: number, node: React.ReactNode, top = 960, left = 540) => (
  <div style={{ position: 'absolute', left: left - w / 2, top: top - h / 2, width: w, height: h }}>{node}</div>
);
type Item = [string, number, React.ReactNode];
export const REEL: Item[] = [
  ['w11 title card + w01 magnifier', 200, <><Dark pos="50% 40%" z0={1.0} z1={1.1} />{box(1080, 640, <W11TitleCard />, 380)}<Sequence from={40} layout="none"><W01Magnifier /></Sequence></>],
  ['w03 big count + w12 label', 150, <><Dark />{box(900, 420, <W03BigCount />, 700)}{box(700, 320, <Sequence from={60} layout="none"><W12GlowLabel text="13 आज़ाद देश" /></Sequence>, 1200)}</>],
  ['w02 cross stamps', 120, <><Dark />{[[380, 760], [640, 900], [500, 1150]].map(([x, y], i) => <React.Fragment key={i}>{box(400, 400, <Sequence from={i * 18} layout="none"><W02CrossStamp seed={`r${i}`} /></Sequence>, y, x)}</React.Fragment>)}</>],
  ['w07 cricketer', 150, <><Dark />{box(600, 900, <W07Cricketer />, 1100)}</>],
  ['w12 labels (East / West Indies)', 120, <><Dark pos="50% 40%" z0={1.0} z1={1.06} />{box(700, 320, <W12GlowLabel text="WEST INDIES" />, 900, 360)}{box(700, 320, <Sequence from={30} layout="none"><W12GlowLabel text="EAST INDIES" color={C.gold} /></Sequence>, 700, 760)}</>],
  ['w05 voyage + w06 Columbus', 300, <><AbsoluteFill style={{ background: C.night }} /><W05Voyage columbus={<W06Columbus raise={60} />} /></>],
  ['w04 speech bubble', 110, <><Dark />{box(700, 360, <W04SpeechBubble />, 800)}</>],
  ['w13 parliament + w09 flag', 160, <><Dark />{box(900, 700, <W13Parliament />, 1000)}</>],
  ['w08 ballot', 110, <><Dark />{box(600, 700, <W08Ballot />, 980)}</>],
  ['w10 crack', 100, <><Dark />{box(1080, 1080, <W10Crack />, 960)}</>],
  ['w09 flag', 100, <><Dark />{box(520, 640, <W09FedFlag hoist={false} />, 960)}</>],
];
export const REEL_FRAMES = REEL.reduce((a, [, d]) => a + d, 0);
export const W99Reel: React.FC = () => {
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
            <div style={{ position: 'absolute', left: 30, top: 30, fontFamily: NUM, fontSize: 40, color: '#fff', opacity: 0.8, textShadow: '0 2px 4px #000' }}>{name}</div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
