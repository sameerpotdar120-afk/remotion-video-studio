import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { SK_DURATION_60, Sikkim } from './Sikkim';

/** A render-only entry for the Sikkim edit (a minimal public dir: sikkim, brand). */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="Sikkim4K60" component={Sikkim} durationInFrames={SK_DURATION_60} fps={60} width={1080} height={1920} />
    <Composition id="SikkimVO" component={Sikkim} durationInFrames={SK_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ audio: 'sikkim/audio/vo.mp3' }} />
  </>
);
registerRoot(RenderRoot);
