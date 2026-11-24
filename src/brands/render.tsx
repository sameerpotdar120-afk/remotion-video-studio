import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { BR_DURATION_S, Brands } from './Brands';

/** A render-only entry for the Brands Short (public dir: brands). Render with --scale=2 for 4K. */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="BR4K60" component={Brands} durationInFrames={Math.round(BR_DURATION_S * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
    <Composition id="BRTHUMB" component={Brands} durationInFrames={1} fps={60} width={1080} height={1920} defaultProps={{ captions: false, audio: '', thumb: true }} />
    <Composition id="BR30" component={Brands} durationInFrames={Math.round(BR_DURATION_S * 30)} fps={30} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
