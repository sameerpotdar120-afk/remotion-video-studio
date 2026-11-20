import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { BK_DURATION_S, Baikonur } from './Baikonur';

/** A render-only entry for the Baikonur edit (a minimal public dir: baikonur, brand). */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="BK4K60" component={Baikonur} durationInFrames={Math.round(BK_DURATION_S * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
