import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { UK_DURATION_S, UKCountry } from './UK';

/** A render-only entry for the UK edit (a minimal public dir: ukcountry, brand). */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="UK4K60" component={UKCountry} durationInFrames={Math.round(UK_DURATION_S * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
