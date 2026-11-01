import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { CA_DURATION_60, CanadaLakes } from './CanadaLakes';
import { CanadaCover } from './Cover';

/** A render-only entry for the Canada lake names edit (a minimal public dir: canadalakes, brand). */
const RenderRoot: React.FC = () => (
  <>
  <Composition id="CanadaLakes4K60" component={CanadaLakes} durationInFrames={CA_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  <Composition id="CanadaCover" component={CanadaCover} durationInFrames={1} fps={60} width={1080} height={1920} />
  </>
);
registerRoot(RenderRoot);
