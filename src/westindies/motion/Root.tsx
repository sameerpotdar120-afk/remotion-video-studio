import React from 'react';
import { Composition } from 'remotion';
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
import { REEL_FRAMES, W99Reel } from './W99Reel';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="w01-magnifier" component={W01Magnifier} width={1080} height={1920} fps={60} durationInFrames={140} />
    <Composition id="w02-cross-stamp" component={W02CrossStamp} width={400} height={400} fps={60} durationInFrames={60} />
    <Composition id="w03-big-count" component={W03BigCount} width={900} height={420} fps={60} durationInFrames={100} />
    <Composition id="w04-speech-bubble" component={W04SpeechBubble} width={700} height={360} fps={60} durationInFrames={90} />
    <Composition id="w05-voyage" component={W05Voyage} width={1080} height={1920} fps={60} durationInFrames={260} />
    <Composition id="w06-columbus" component={W06Columbus} width={600} height={800} fps={60} durationInFrames={120} />
    <Composition id="w07-cricketer" component={W07Cricketer} width={600} height={900} fps={60} durationInFrames={120} />
    <Composition id="w08-ballot" component={W08Ballot} width={600} height={700} fps={60} durationInFrames={90} />
    <Composition id="w09-fed-flag" component={W09FedFlag} width={520} height={640} fps={60} durationInFrames={120} />
    <Composition id="w10-crack" component={W10Crack} width={1080} height={1080} fps={60} durationInFrames={80} />
    <Composition id="w11-title-card" component={W11TitleCard} width={1080} height={640} fps={60} durationInFrames={120} />
    <Composition id="w12-glow-label" component={W12GlowLabel} width={700} height={320} fps={60} durationInFrames={90} />
    <Composition id="w13-parliament" component={W13Parliament} width={900} height={700} fps={60} durationInFrames={140} />
    <Composition id="w99-reel" component={W99Reel} width={1080} height={1920} fps={60} durationInFrames={REEL_FRAMES} />
  </>
);
