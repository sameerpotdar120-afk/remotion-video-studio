import React from 'react';
import { Composition } from 'remotion';
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
import { REEL_FRAMES, P99Reel } from './P99Reel';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="p01-ship-queue" component={P01ShipQueue} width={1080} height={1920} fps={60} durationInFrames={240} />
    <Composition id="p02-bob-arrow" component={P02BobArrow} width={300} height={300} fps={60} durationInFrames={60} />
    <Composition id="p03-odometer" component={P03Odometer} width={1000} height={260} fps={60} durationInFrames={120} />
    <Composition id="p04-sticker" component={P04Sticker} width={1080} height={500} fps={60} durationInFrames={180} />
    <Composition id="p05-stamp" component={P05Stamp} width={1000} height={320} fps={60} durationInFrames={90} />
    <Composition id="p06-label" component={P06Label} width={600} height={300} fps={60} durationInFrames={90} />
    <Composition id="p07-salt-fresh" component={P07SaltFresh} width={1080} height={1080} fps={60} durationInFrames={110} />
    <Composition id="p08-locks" component={P08Locks} width={1080} height={1920} fps={60} durationInFrames={540} />
    <Composition id="p09-water-arc" component={P09WaterArc} width={1080} height={1080} fps={60} durationInFrames={150} />
    <Composition id="p10-pools" component={P10Pools} width={1080} height={1920} fps={60} durationInFrames={220} />
    <Composition id="p11-rain-cloud" component={P11RainCloud} width={800} height={800} fps={60} durationInFrames={150} />
    <Composition id="p12-kid" component={P12Kid} width={800} height={1000} fps={60} durationInFrames={440} />
    <Composition id="p13-sun" component={P13Sun} width={600} height={600} fps={60} durationInFrames={150} />
    <Composition id="p14-waiting" component={P14Waiting} width={600} height={600} fps={60} durationInFrames={100} />
    <Composition id="p15-el-nino" component={P15ElNino} width={1080} height={1920} fps={60} durationInFrames={120} />
    <Composition id="p16-calendar" component={P16Calendar} width={400} height={400} fps={60} durationInFrames={90} />
    <Composition id="p17-auction" component={P17Auction} width={1080} height={1080} fps={60} durationInFrames={140} />
    <Composition id="p18-lake-bubble" component={P18LakeBubble} width={500} height={700} fps={60} durationInFrames={100} />
    <Composition id="p19-balance" component={P19Balance} width={900} height={700} fps={60} durationInFrames={140} />
    <Composition id="p20-dam" component={P20Dam} width={1080} height={1080} fps={60} durationInFrames={140} />
    <Composition id="p21-ecg" component={P21Ecg} width={800} height={240} fps={60} durationInFrames={180} />
    <Composition id="p22-route" component={P22Route} width={1080} height={1920} fps={60} durationInFrames={130} />
    <Composition id="p99-reel" component={P99Reel} width={1080} height={1920} fps={60} durationInFrames={REEL_FRAMES} />
  </>
);
