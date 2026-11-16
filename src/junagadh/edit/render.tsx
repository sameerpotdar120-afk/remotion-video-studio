import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { JG_DURATION_S, Junagadh } from './Junagadh';

/** A render-only entry for the Junagadh edit (a minimal public dir: junagadh, brand). */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="JG4K30" component={Junagadh} durationInFrames={Math.round(JG_DURATION_S * 30)} fps={30} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
