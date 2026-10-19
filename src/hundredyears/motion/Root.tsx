import React from 'react';
import { Composition } from 'remotion';
import { H00Lineup } from './H00Lineup';
import { H01Duel } from './H01Duel';
import { H02Counter } from './H02Counter';
import { H03Slam } from './H03Slam';
import { H04Edward } from './H04Edward';
import { H05PhilipNo } from './H05PhilipNo';
import { H06Brawl } from './H06Brawl';
import { H07Cavalry } from './H07Cavalry';
import { H08Longbow } from './H08Longbow';
import { H09Game } from './H09Game';
import { H10JoanCard } from './H10JoanCard';
import { H11Voices } from './H11Voices';
import { H12ArmorUp } from './H12ArmorUp';
import { H13Shockwave } from './H13Shockwave';
import { H14PlusOne } from './H14PlusOne';
import { H15ArrowHit } from './H15ArrowHit';
import { H16Coronation } from './H16Coronation';
import { H17Grab } from './H17Grab';
import { H18Trial } from './H18Trial';
import { H19Stake } from './H19Stake';
import { H20Burn } from './H20Burn';
import { H21Banners } from './H21Banners';
import { H22Saint } from './H22Saint';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="h00-lineup" component={H00Lineup} width={1080} height={1920} fps={60} durationInFrames={60} />
    <Composition id="h01-duel" component={H01Duel} width={1080} height={1080} fps={60} durationInFrames={300} defaultProps={{ swoop: 200 }} />
    <Composition id="h02-counter" component={H02Counter} width={900} height={500} fps={60} durationInFrames={200} />
    <Composition id="h03-slam" component={H03Slam} width={1080} height={700} fps={60} durationInFrames={150} />
    <Composition id="h04-edward" component={H04Edward} width={900} height={1100} fps={60} durationInFrames={240} />
    <Composition id="h05-philip-no" component={H05PhilipNo} width={900} height={1100} fps={60} durationInFrames={120} />
    <Composition id="h06-brawl" component={H06Brawl} width={900} height={900} fps={60} durationInFrames={150} />
    <Composition id="h07-cavalry" component={H07Cavalry} width={1080} height={1920} fps={60} durationInFrames={270} />
    <Composition id="h08-longbow" component={H08Longbow} width={1080} height={1920} fps={60} durationInFrames={240} />
    <Composition id="h09-game" component={H09Game} width={1080} height={1920} fps={60} durationInFrames={480} />
    <Composition id="h10-joan-card" component={H10JoanCard} width={900} height={1200} fps={60} durationInFrames={420} />
    <Composition id="h11-voices" component={H11Voices} width={1080} height={1400} fps={60} durationInFrames={210} />
    <Composition id="h12-armor-up" component={H12ArmorUp} width={1080} height={1500} fps={60} durationInFrames={240} />
    <Composition id="h13-shockwave" component={H13Shockwave} width={1080} height={1080} fps={60} durationInFrames={120} />
    <Composition id="h14-plus-one" component={H14PlusOne} width={500} height={400} fps={60} durationInFrames={90} />
    <Composition id="h15-arrow-hit" component={H15ArrowHit} width={1080} height={1300} fps={60} durationInFrames={240} />
    <Composition id="h16-coronation" component={H16Coronation} width={900} height={1200} fps={60} durationInFrames={180} />
    <Composition id="h17-grab" component={H17Grab} width={1080} height={1920} fps={60} durationInFrames={180} />
    <Composition id="h18-trial" component={H18Trial} width={1080} height={1500} fps={60} durationInFrames={300} />
    <Composition id="h19-stake" component={H19Stake} width={900} height={1400} fps={60} durationInFrames={240} defaultProps={{ post: true }} />
    <Composition id="h20-burn" component={H20Burn} width={1080} height={1920} fps={60} durationInFrames={150} />
    <Composition id="h21-banners" component={H21Banners} width={1080} height={1920} fps={60} durationInFrames={300} />
    <Composition id="h22-saint" component={H22Saint} width={900} height={1300} fps={60} durationInFrames={240} />
  </>
);
