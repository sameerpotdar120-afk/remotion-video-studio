import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { KO_DURATION_60, Korea } from './Korea';

/** A render-only entry for the Korea edit (a minimal public dir: korea, brand). */
const RenderRoot: React.FC = () => (
  <>
  <Composition id="Korea4K60" component={Korea} durationInFrames={KO_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
