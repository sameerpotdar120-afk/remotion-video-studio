import React from 'react';
import { Composition, Still, registerRoot } from 'remotion';
import { ChandigarhCover } from './Cover';
import { CG_DURATION_60, Chandigarh } from './Chandigarh';

/** A render-only entry for the Chandigarh edit (a minimal public dir: chandigarh maps, img, fonts, null, audio; brand). */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="Chandigarh4K60" component={Chandigarh} durationInFrames={CG_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true }} />
    <Composition id="ChandigarhSilent" component={Chandigarh} durationInFrames={CG_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
    <Still id="ChandigarhCover" component={ChandigarhCover} width={1080} height={1920} />
  </>
);
registerRoot(RenderRoot);
