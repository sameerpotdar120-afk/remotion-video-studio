import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { KO_DURATION_60, Korea } from './Korea';
import { KoCover } from './Cover';

/** A render-only entry for the Korea edit (a minimal public dir: korea, brand). */
const RenderRoot: React.FC = () => (
  <>
  <Composition id="Korea4K60" component={Korea} durationInFrames={KO_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  <Composition id="KoCover" component={KoCover} durationInFrames={1} fps={60} width={1080} height={1920} />
  </>
);
registerRoot(RenderRoot);
