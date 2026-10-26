import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Greenland, GL_DURATION_60 } from './Greenland';

/** A render-only entry for the Greenland edit (a minimal public dir: greenland maps, img, fonts, null, audio). */
const RenderRoot: React.FC = () => (
  <Composition id="Greenland4K60" component={Greenland} durationInFrames={GL_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
);
registerRoot(RenderRoot);
