import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Cam3, ll3, routeLL, Valley3D } from './Valley3D';

// test shots: the gorge rise, the route x-ray, the train, the dusk station
const r0 = ll3(routeLL[0][0], routeLL[0][1]), r1 = ll3(routeLL[routeLL.length - 1][0], routeLL[routeLL.length - 1][1]);
const mid = ll3(routeLL[60][0], routeLL[60][1]);
export const TestValley: React.FC = () => {
  const f = useCurrentFrame();
  const shot = Math.floor(f / 60), u = (f % 60) / 60;
  const shots: { cam: Cam3; draw?: number; xray?: number; train?: number | null; station?: number; dusk?: number; rain?: number }[] = [
    { cam: { pos: [r0[0] + 0.6, 2.2 + u * 0.8, r0[1] + 4.5 - u * 1.5], look: [mid[0], 0.4, mid[1]], fov: 50 } },
    { cam: { pos: [mid[0] + 5, 6, mid[1] + 7], look: [mid[0], 0.4, mid[1]], fov: 45 }, draw: 0.3 + u * 0.7, xray: 0.9 },
    { cam: { pos: [mid[0] - 2.2, 2.4, mid[1] + 2.6], look: [mid[0], 0.6, mid[1]], fov: 40 }, draw: 1, train: 0.4 + u * 0.1 },
    { cam: { pos: [r1[0] + 3, 3, r1[1] + 3.5], look: [r1[0], 0.5, r1[1]], fov: 42 }, draw: 1, station: 1, dusk: 0.8 },
    { cam: { pos: [mid[0] + 3, 3.4, mid[1] + 5], look: [mid[0], 0.8, mid[1]], fov: 50 }, rain: 1, xray: 0 },
  ];
  const s = shots[Math.min(shots.length - 1, shot)];
  return (
    <AbsoluteFill>
      <Valley3D width={1080} height={1920} t={f / 60} {...s} />
      <div style={{ position: 'absolute', left: 20, top: 20, color: '#fff', fontSize: 40 }}>{shot} {interpolate(u, [0, 1], [0, 1]).toFixed(2)}</div>
    </AbsoluteFill>
  );
};
