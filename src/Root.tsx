import React from "react";
import { Composition } from "remotion";
import { Episode, ShotStill, totalFrames } from "./ep1/Episode";
import { LongEpisode, longFrames } from "./ep1/Long";
import { CastSheet } from "./ep2/CastSheet";
import { Episode2, ShotStill2, totalFrames2 } from "./ep2/Episode";

export const Root: React.FC = () => (
  <>
    <Composition id="Short" component={Episode} width={1080} height={1920} fps={30} durationInFrames={totalFrames(30)} defaultProps={{ captions: true, music: true }} />
    <Composition id="Long" component={LongEpisode} width={1920} height={1080} fps={30} durationInFrames={longFrames(30)} />
    <Composition id="Short16x9" component={Episode} width={1920} height={1080} fps={30} durationInFrames={totalFrames(30)} defaultProps={{ captions: false, music: true }} />
    <Composition id="Shot" component={ShotStill} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{ id: 1 }} />
    <Composition id="Ep2" component={Episode2} width={1440} height={2560} fps={30} durationInFrames={totalFrames2(30)} defaultProps={{ captions: true, music: true }} />
    <Composition id="Ep2Shot" component={ShotStill2} width={720} height={1280} fps={30} durationInFrames={300} defaultProps={{ id: 1 }} />
    <Composition id="CastSheet" component={CastSheet} width={3840} height={600} fps={30} durationInFrames={1} />
  </>
);
