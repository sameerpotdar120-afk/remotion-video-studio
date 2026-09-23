import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './Reel';

export const Root: React.FC = () => (
  <Composition
    id="IraSleepShaming50"
    component={Reel}
    durationInFrames={1200}
    fps={24}
    width={1080}
    height={1920}
  />
);
