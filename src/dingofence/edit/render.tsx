import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { DG_DURATION_60, DingoFence } from './DingoFence';

/** A render-only entry for the Dingo Fence edit (a minimal public dir: dingofence, brand). */
const RenderRoot: React.FC = () => (
  <>
  <Composition id="DingoFence4K60" component={DingoFence} durationInFrames={DG_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
