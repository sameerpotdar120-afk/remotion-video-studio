import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { HZ_DURATION_S, Hormuz } from './Hormuz';

/** A render-only entry for the Hormuz edit (a minimal public dir: hormuz, brand). Timing is in seconds, so the 60 and
 *  120 fps compositions are the same edit. */
const RenderRoot: React.FC = () => (
  <>
  <Composition id="Hormuz4K60" component={Hormuz} durationInFrames={Math.round(HZ_DURATION_S * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  <Composition id="Hormuz4K120" component={Hormuz} durationInFrames={Math.round(HZ_DURATION_S * 120)} fps={120} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
