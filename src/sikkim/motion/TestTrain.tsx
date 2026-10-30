import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Cam3, ll3, routeLL, Valley3D } from './Valley3D';

const A = ll3(routeLL[22][0], routeLL[22][1]);
const CAMS: Cam3[] = [
  { pos: [A[0] + 1.5, 1.8, A[1] + 2.0], look: [A[0], 0.5, A[1]], fov: 40 },
  { pos: [A[0] - 1.5, 3.0, A[1] + 1.5], look: [A[0], 0.5, A[1]], fov: 40 },
  { pos: [A[0] + 0.5, 4.5, A[1] + 2.5], look: [A[0], 0.3, A[1]], fov: 40 },
  { pos: [A[0] + 2.5, 1.2, A[1] + 0.5], look: [A[0], 0.6, A[1]], fov: 40 },
  { pos: [A[0] + 0.9, 1.3, A[1] + 1.1], look: [A[0], 0.6, A[1]], fov: 45 },
  { pos: [A[0] - 0.9, 1.6, A[1] + 1.0], look: [A[0], 0.6, A[1]], fov: 45 },
];
export const TestTrain: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill><Valley3D width={1080} height={1920} t={f / 60} cam={CAMS[f % CAMS.length]} draw={1} train={0.18} mist={0.3} color="#7FFFF8" /></AbsoluteFill>;
};
