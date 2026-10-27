import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Madeira, MD_DURATION_60 } from './Madeira';

/** A render-only entry for the Madeira edit (a minimal public dir: madeira maps, img, fonts, null, audio; brand). */
const RenderRoot: React.FC = () => (
  <Composition id="Madeira4K60" component={Madeira} durationInFrames={MD_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
);
registerRoot(RenderRoot);
