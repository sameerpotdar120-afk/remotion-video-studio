import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { EV_DURATION_S, Everest } from './Everest';

/** A render-only entry for the Everest Short (public dir: everest). Render with --scale=2 for 4K, --gl=swangle. */
const RenderRoot: React.FC = () => (
  <Composition id="EV4K30" component={Everest} durationInFrames={Math.round(EV_DURATION_S * 30)} fps={30} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
);
registerRoot(RenderRoot);
