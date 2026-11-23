import React from "react";
import { Composition } from "remotion";
import { Episode, ShotStill, totalFrames } from "./ep1/Episode";
import { LongEpisode, longFrames } from "./ep1/Long";
import { CastSheet } from "./ep2/CastSheet";
import { Episode2, ShotStill2, totalFrames2 } from "./ep2/Episode";
import { Episode3, ShotStill3, totalFrames3 } from "./ep3/Episode";
import { Photo3D } from "./photo3d/Photo3D";
import { VrmView } from "./anime/VrmView";
import { CharTurn } from "./anime/CharTurn";

export const Root: React.FC = () => (
  <>
    <Composition id="Short" component={Episode} width={1080} height={1920} fps={30} durationInFrames={totalFrames(30)} defaultProps={{ captions: true, music: true }} />
    <Composition id="Long" component={LongEpisode} width={1920} height={1080} fps={30} durationInFrames={longFrames(30)} />
    <Composition id="Short16x9" component={Episode} width={1920} height={1080} fps={30} durationInFrames={totalFrames(30)} defaultProps={{ captions: false, music: true }} />
    <Composition id="Shot" component={ShotStill} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{ id: 1 }} />
    <Composition id="Ep2" component={Episode2} width={1440} height={2560} fps={30} durationInFrames={totalFrames2(30)} defaultProps={{ captions: true, music: true }} />
    <Composition id="Ep2Shot" component={ShotStill2} width={720} height={1280} fps={30} durationInFrames={300} defaultProps={{ id: 1 }} />
    <Composition id="Ep3" component={Episode3} width={1440} height={2560} fps={30} durationInFrames={totalFrames3(30)} defaultProps={{ captions: true, music: true }} />
    <Composition id="Ep3Shot" component={ShotStill3} width={720} height={1280} fps={30} durationInFrames={300} defaultProps={{ id: 1 }} />
    <Composition id="CharTurn" component={CharTurn} width={720} height={1280} fps={30} durationInFrames={1} />
    <Composition id="VrmView" component={VrmView} width={720} height={1280} fps={30} durationInFrames={1} />
    <Composition id="Photo3D" component={Photo3D} width={1080} height={1080} fps={30} durationInFrames={90} defaultProps={{ photo: "photo3d/test.png", depth: "photo3d/test_depth.png", move: "orbit", strength: 1.3 }} />
    <Composition id="CastSheet" component={CastSheet} width={5000} height={600} fps={30} durationInFrames={1} />
  </>
);
