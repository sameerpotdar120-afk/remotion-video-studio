import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Terrain3D, lonlatToScene, VEXAG } from './Terrain3D';

const [EX, EZ] = lonlatToScene(86.925, 27.988);
export const FlyTest: React.FC = () => {
  const f = useCurrentFrame();
  const cams: [number, number, number][][] = [
    [[EX - 34, 13, EZ + 6], [EX - 4, 22, EZ - 18]],
    [[EX - 34, 13, EZ + 6], [EX - 4, 10, EZ - 18]],
    [[EX - 34, 13, EZ - 6], [EX - 4, 10, EZ - 18]],
  ];
  const [pos, look] = cams[f];
  return <AbsoluteFill><Terrain3D cam={{ pos, look, fov: 52 }} width={1080} height={1920} /></AbsoluteFill>;
};
void VEXAG;
