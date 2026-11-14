import React from 'react';
import { Composition } from 'remotion';
import { MainComposition } from './Video';
import { BridgeShort, BRIDGE_FRAMES } from './videos/bridge/Bridge';
import { NestShort, NEST_FRAMES } from './videos/nest/Nest';

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition id="NestShort" component={NestShort} durationInFrames={NEST_FRAMES} fps={60} width={1080} height={1920} />
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
