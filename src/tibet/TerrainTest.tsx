import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Terrain3D, lonlatToScene } from './Terrain3D';

export const TerrainTest: React.FC = () => {
  const f = useCurrentFrame();
  const [ex, ez] = lonlatToScene(86.925, 27.988);
  const t = f / 30;
  return (
    <AbsoluteFill>
      <Terrain3D width={1080} height={1920} cam={{ pos: [ex - 40 + t * 6, 16, ez + 70 - t * 8], look: [ex, 7, ez], fov: 50 }} />
    </AbsoluteFill>
  );
};
