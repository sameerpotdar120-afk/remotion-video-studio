import React from 'react';
import { Composition } from 'remotion';
import { MainComposition } from './Video';
import { FlightAttackReel } from './flight-attack/FlightAttackReel';
import { FPS, TOTAL_FRAMES } from './flight-attack/script';

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
      <Composition
        id="FlightAttackReel"
        component={FlightAttackReel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
