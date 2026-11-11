import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { ES_DURATION_S, EverySecond } from './EverySecond';

/** A render-only entry for the "every second" edit (a minimal public dir: everysecond, brand). */
const RenderRoot: React.FC = () => (
  <>
  <Composition id="EverySecond4K60" component={EverySecond} durationInFrames={Math.round(ES_DURATION_S * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
