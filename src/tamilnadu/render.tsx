import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { TN_DURATION_S, TamilNadu } from './TamilNadu';

/** A render-only entry for the Tamil Nadu letters Short (public dir: tamilnadu). Render with --scale=2 for 4K, --gl=swangle. */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="TN4K60" component={TamilNadu} durationInFrames={Math.round(TN_DURATION_S * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
    <Composition id="TN30" component={TamilNadu} durationInFrames={Math.round(TN_DURATION_S * 30)} fps={30} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
    <Composition id="TNTHUMB" component={TamilNadu} durationInFrames={1} fps={60} width={1080} height={1920} defaultProps={{ captions: false, audio: '', thumb: true }} />
  </>
);
registerRoot(RenderRoot);
