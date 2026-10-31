import React from 'react';
import { Composition } from 'remotion';
import { Landslide25D } from './Landslide25D';

// Landslide test, 2.5D: a still plate animated in Remotion (compare with the Blender render of the same shot)
export const Root: React.FC = () => (
  <Composition
    id="LandslideTest25D"
    component={Landslide25D}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={150}
    defaultProps={{ dataUrl: 'sikkim/tests/slide_path.json', plate: 'sikkim/tests/plate.jpg', depth: 'sikkim/tests/plate_depth.png' }}
  />
);
