import React from 'react';
import { Composition } from 'remotion';
import { JioVideo } from './JioVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Jio90s"
      component={JioVideo}
      durationInFrames={2699}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
