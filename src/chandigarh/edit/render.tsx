import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { CG_DURATION_60, Chandigarh } from './Chandigarh';

/** A render-only entry for the Chandigarh edit (a minimal public dir: chandigarh maps, img, fonts, null, audio; brand). */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="Chandigarh4K60" component={Chandigarh} durationInFrames={CG_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true }} />
    <Composition id="ChandigarhSilent" component={Chandigarh} durationInFrames={CG_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
