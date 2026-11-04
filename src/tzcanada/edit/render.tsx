import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { TZ_DURATION_60, TzCanada } from './TzCanada';

/** A render-only entry for the Canada vs USA time zones edit (a minimal public dir: tzcanada, brand). */
const RenderRoot: React.FC = () => (
  <>
  <Composition id="TzCanada4K60" component={TzCanada} durationInFrames={TZ_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
