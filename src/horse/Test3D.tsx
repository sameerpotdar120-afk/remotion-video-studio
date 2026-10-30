import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Figure, Stage, camAt, type CamKey } from './world';
import { StreetSet } from './sets';
import { idle, walk } from './chars';

const CAM: CamKey[] = [[0, [1.6, 1.7, 11], [1.2, 1.6, -4], 34], [300, [1.6, 1.7, 9.5], [1.2, 1.5, -4], 34]];

export const Test3D: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(CAM, f);
  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        <StreetSet />
        <Figure look="oldman" pose={{ ...idle(f), eyes: 'sleepy', mouth: 'line' }} x={3.4} z={0.6} res={14} />
        <Figure look="blue" pose={{ ...walk(f), eyes: 'dot', mouth: 'smile' }} x={-1} z={-0.5} res={10} />
        <Figure look="red" pose={{ ...idle(f, 2), eyes: 'sad', brows: 'sad', mouth: 'frown' }} x={0.2} z={-1.5} res={10} />
      </Stage>
    </AbsoluteFill>
  );
};
