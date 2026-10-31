import React from 'react';
import { Composition } from 'remotion';
import { Landslide25D } from './Landslide25D';
import { Tunnel7Rain } from './Tunnel7Rain';

// Landslide test, 2.5D: a still plate animated in Remotion (compare with the Blender render of the same shot)
export const Root: React.FC = () => (
  <>
  <Composition
    id="LandslideTest25D"
    component={Landslide25D}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={150}
    defaultProps={{ dataUrl: 'sikkim/tests/slide_path.json', plate: 'sikkim/tests/plate.jpg', depth: 'sikkim/tests/plate_depth.png' }}
  />
  {/* line 10, VO 60.78-70.6 s: the Blender render with composited rain */}
  <Composition id="Tunnel7" component={Tunnel7Rain} width={1080} height={1920} fps={30} durationInFrames={295} defaultProps={{ src: 'sikkim/tests/tunnel7_blender.mp4' }} />
  </>
);
