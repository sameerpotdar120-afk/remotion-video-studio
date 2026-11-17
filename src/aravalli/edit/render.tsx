import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { AR_DURATION_S, Aravalli } from './Aravalli';

/** A render-only entry for the Aravalli edit (a minimal public dir: aravalli, brand). */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="AR4K60" component={Aravalli} durationInFrames={Math.round(AR_DURATION_S * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
