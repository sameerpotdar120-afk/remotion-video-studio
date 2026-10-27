import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { GarbagePatch, GP_DURATION_60 } from './GarbagePatch';

/** A render-only entry for the Garbage Patch edit (a minimal public dir: garbagepatch maps, img, fonts, null, audio; brand). */
const RenderRoot: React.FC = () => (
  <Composition id="GarbagePatch4K60" component={GarbagePatch} durationInFrames={GP_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true }} />
);
registerRoot(RenderRoot);
