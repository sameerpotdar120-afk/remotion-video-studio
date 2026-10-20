import React from 'react';
import { Composition } from 'remotion';
import { W01FlagFill } from './W01FlagFill';
import { W02WarBadge } from './W02WarBadge';
import { W03Highlight } from './W03Highlight';
import { W04BurnReveal } from './W04BurnReveal';
import { W05RingLabel } from './W05RingLabel';
import { W06TypeTag } from './W06TypeTag';
import { W07Distance } from './W07Distance';
import { W08PinPulse } from './W08PinPulse';
import { W09YearType } from './W09YearType';
import { W10TwoWay } from './W10TwoWay';
import { W11ColorFlash } from './W11ColorFlash';
import { W12HeliRoute } from './W12HeliRoute';
import { W13Sticker } from './W13Sticker';
import { W14FlagSwap } from './W14FlagSwap';
import { W15ScriptNote } from './W15ScriptNote';
import { W16WarArrows } from './W16WarArrows';
import { W17TapeStop } from './W17TapeStop';
import { W18Montage } from './W18Montage';
import { W19IslandSplit } from './W19IslandSplit';
import { W20BorderSweep } from './W20BorderSweep';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="w01-flag-fill" component={W01FlagFill} width={1080} height={1080} fps={60} durationInFrames={90} />
    <Composition id="w02-war-badge" component={W02WarBadge} width={1080} height={1080} fps={60} durationInFrames={150} />
    <Composition id="w03-highlight" component={W03Highlight} width={1080} height={400} fps={60} durationInFrames={40} />
    <Composition id="w04-burn-reveal" component={W04BurnReveal} width={1080} height={1920} fps={60} durationInFrames={60} />
    <Composition id="w05-ring-label" component={W05RingLabel} width={900} height={600} fps={60} durationInFrames={120} />
    <Composition id="w06-type-tag" component={W06TypeTag} width={800} height={300} fps={60} durationInFrames={90} />
    <Composition id="w07-distance" component={W07Distance} width={1080} height={700} fps={60} durationInFrames={120} />
    <Composition id="w08-pin-pulse" component={W08PinPulse} width={600} height={600} fps={60} durationInFrames={120} />
    <Composition id="w09-year-type" component={W09YearType} width={1080} height={500} fps={60} durationInFrames={130} />
    <Composition id="w10-two-way" component={W10TwoWay} width={1080} height={1080} fps={60} durationInFrames={120} />
    <Composition id="w11-color-flash" component={W11ColorFlash} width={1080} height={1920} fps={60} durationInFrames={40} />
    <Composition id="w12-heli-route" component={W12HeliRoute} width={1080} height={1080} fps={60} durationInFrames={120} />
    <Composition id="w13-sticker" component={W13Sticker} width={1080} height={1920} fps={60} durationInFrames={90} />
    <Composition id="w14-flag-swap" component={W14FlagSwap} width={1080} height={1920} fps={60} durationInFrames={120} />
    <Composition id="w15-script-note" component={W15ScriptNote} width={1080} height={1920} fps={60} durationInFrames={180} />
    <Composition id="w16-war-arrows" component={W16WarArrows} width={1080} height={1080} fps={60} durationInFrames={150} />
    <Composition id="w17-tape-stop" component={W17TapeStop} width={1080} height={1920} fps={60} durationInFrames={40} />
    <Composition id="w18-montage" component={W18Montage} width={1080} height={1080} fps={60} durationInFrames={150} />
    <Composition id="w19-island-split" component={W19IslandSplit} width={1080} height={1080} fps={60} durationInFrames={150} />
    <Composition id="w20-border-sweep" component={W20BorderSweep} width={1080} height={1920} fps={60} durationInFrames={100} />
  </>
);
