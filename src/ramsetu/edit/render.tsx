import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { RS_DURATION_S, RamSetu } from './RamSetu';

/** A render-only entry for the Ram Setu edit (a minimal public dir: ramsetu, brand). */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="RamSetu4K60" component={RamSetu} durationInFrames={Math.round(RS_DURATION_S * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
