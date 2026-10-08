import React from 'react';
import { Composition } from 'remotion';
import { MainComposition } from './Video';
import { DarienGap, DARIEN_DURATION } from './darien/DarienGap';
import { DarienCover } from './darien/Cover';
import { DarienCoverWide } from './darien/CoverWide';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DarienGap"
        component={DarienGap}
        durationInFrames={DARIEN_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition id="DarienCover" component={DarienCover} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="DarienCoverWide" component={DarienCoverWide} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition
        id="MainComposition"
        component={MainComposition}
        durationInFrames={240}
        fps={24}
        width={1080}
        height={1920}
        defaultProps={{
          title: 'Documentary Video',
        }}
      />
    </>
  );
};
