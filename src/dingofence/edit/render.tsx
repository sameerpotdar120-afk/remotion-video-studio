import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { DG_DURATION_60, DingoFence } from './DingoFence';
import { DgCover } from './Cover';

/** A render-only entry for the Dingo Fence edit (a minimal public dir: dingofence, brand). */
const RenderRoot: React.FC = () => (
  <>
  <Composition id="DingoFence4K60" component={DingoFence} durationInFrames={DG_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  <Composition id="DgCover" component={DgCover} durationInFrames={1} fps={60} width={1080} height={1920} />
  </>
);
registerRoot(RenderRoot);
