import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { ML_DURATION_S, Malacca } from './Malacca';

/** A render-only entry for the Malacca edit (a minimal public dir: malacca, brand). */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="ML4K60" component={Malacca} durationInFrames={Math.round(ML_DURATION_S * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
