import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { WILookTest, WI_TEST_60 } from './LookTest';

/** A render-only entry for the West Indies edit (a minimal public dir: westindies maps and fonts, brand). */
const RenderRoot: React.FC = () => (
  <Composition id="WILookTest" component={WILookTest} durationInFrames={WI_TEST_60} fps={60} width={1080} height={1920} defaultProps={{ res: 1 }} />
);
registerRoot(RenderRoot);
