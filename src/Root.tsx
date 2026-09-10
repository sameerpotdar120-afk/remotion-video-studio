import React from 'react';
import { Composition } from 'remotion';
import { MainComposition } from './Video';

export const RemotionRoot: React.FC = () => {
  return (
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
  );
};
