import React from 'react';
import { Composition } from 'remotion';
import { KingsGuard, KG_DURATION } from './KingsGuard';

/** Cartoon Animation: its own Remotion entry point, separate from NullDynasty (src/index.ts). */
export const CartoonRoot: React.FC = () => (
  <>
    <Composition id="CartoonKingsGuard" component={KingsGuard} durationInFrames={KG_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
  </>
);
