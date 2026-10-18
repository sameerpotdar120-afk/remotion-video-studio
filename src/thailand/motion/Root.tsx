import React from 'react';
import { Composition } from 'remotion';
import { T00Chibis } from './T00Chibis';
import { T00Lineup } from './T00Lineup';
import { T01TugOfWar } from './T01TugOfWar';
import { T02Flex } from './T02Flex';
import { T03Balance } from './T03Balance';
import { T04Electric } from './T04Electric';
import { T05Clash } from './T05Clash';
import { T06Diplomats } from './T06Diplomats';
import { T07Gloves } from './T07Gloves';
import { T08Padlock } from './T08Padlock';
import { T09Chevrons } from './T09Chevrons';
import { T10Gunboat } from './T10Gunboat';
import { T11Question } from './T11Question';
import { T12FlagBalls } from './T12FlagBalls';
import { T13Soldiers } from './T13Soldiers';
import { T14King } from './T14King';
import { T15Heart } from './T15Heart';
import { T16Dodge } from './T16Dodge';
import { T17Send } from './T17Send';
import { T99Reel } from './T99Reel';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="t00-lineup" component={T00Lineup} width={1080} height={1920} fps={60} durationInFrames={120} />
    <Composition id="t00-chibis" component={T00Chibis} width={1080} height={1920} fps={60} durationInFrames={120} />
    <Composition id="t01-tug-of-war" component={T01TugOfWar} width={1080} height={1920} fps={60} durationInFrames={240} defaultProps={{ bg: true }} />
    <Composition id="t02-flex" component={T02Flex} width={1080} height={1920} fps={60} durationInFrames={240} defaultProps={{ bg: true }} />
    <Composition id="t03-balance" component={T03Balance} width={1080} height={1920} fps={60} durationInFrames={240} defaultProps={{ bg: true, into: 'france' as const }} />
    <Composition id="t06-diplomats" component={T06Diplomats} width={1080} height={1920} fps={60} durationInFrames={840} defaultProps={{ cues: [70, 200, 340, 500, 630, 770], walk: 0 }} />
    <Composition id="t04-electric-border" component={T04Electric} width={1080} height={1920} fps={60} durationInFrames={180} />
    <Composition id="t05-clash" component={T05Clash} width={1080} height={1920} fps={60} durationInFrames={150} />
    <Composition id="t07-gloves" component={T07Gloves} width={1080} height={1920} fps={60} durationInFrames={180} />
    <Composition id="t08-padlock" component={T08Padlock} width={600} height={700} fps={60} durationInFrames={150} />
    <Composition id="t09-chevrons" component={T09Chevrons} width={1080} height={1920} fps={60} durationInFrames={120} />
    <Composition id="t10-gunboat" component={T10Gunboat} width={1200} height={700} fps={60} durationInFrames={240} />
    <Composition id="t11-question" component={T11Question} width={600} height={800} fps={60} durationInFrames={120} />
    <Composition id="t12-flag-balls" component={T12FlagBalls} width={1080} height={1920} fps={60} durationInFrames={180} />
    <Composition id="t13-soldiers" component={T13Soldiers} width={1080} height={1920} fps={60} durationInFrames={240} />
    <Composition id="t14-king" component={T14King} width={1080} height={1920} fps={60} durationInFrames={330} />
    <Composition id="t15-heart" component={T15Heart} width={600} height={600} fps={60} durationInFrames={180} />
    <Composition id="t16-dodge" component={T16Dodge} width={1080} height={1080} fps={60} durationInFrames={150} />
    <Composition id="t17-send" component={T17Send} width={700} height={700} fps={60} durationInFrames={150} />
    <Composition id="t99-reel" component={T99Reel} width={1080} height={1920} fps={60} durationInFrames={3640} />
  </>
);
