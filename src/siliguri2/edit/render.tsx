import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { SG_DURATION_S, Siliguri2 } from './Siliguri2';

/** A render-only entry for the Siliguri v2 edit (a minimal public dir: siliguri2, brand). */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="SG4K60" component={Siliguri2} durationInFrames={Math.round(SG_DURATION_S * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
