import React from 'react';
import { Composition } from 'remotion';
import { MainComposition } from './Video';
import { BridgeShort, BRIDGE_FRAMES } from './videos/bridge/Bridge';

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
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
