import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { US_DURATION_60, UsCongress } from './UsCongress';

/** A render-only entry for the House vs Senate edit (a minimal public dir: uscongress, brand). */
const RenderRoot: React.FC = () => (
  <>
  <Composition id="UsCongress4K60" component={UsCongress} durationInFrames={US_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
