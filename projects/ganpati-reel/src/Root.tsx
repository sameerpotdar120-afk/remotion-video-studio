import React from 'react';
import {Composition} from 'remotion';
import {GanpatiReel} from './GanpatiReel';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GanpatiReel"
    component={GanpatiReel}
    durationInFrames={1323}
    fps={30}
    width={1080}
    height={1920}
  />
);
