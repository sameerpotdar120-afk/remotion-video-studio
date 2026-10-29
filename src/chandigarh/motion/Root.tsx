import React from 'react';
import { Composition } from 'remotion';
import { C07Pill } from './C07Pill';
import { C99Reel, REEL_FRAMES } from './C99Reel';

// Standalone pieces; the rest take map geometry or the creator's images as props and are used in the edit (and the
// code-only ones are shown in c99-reel on the real plates).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="c07-pill" component={C07Pill} width={1000} height={300} fps={60} durationInFrames={120} defaultProps={{ text: 'माँ चंडी मंदिर', out: 90 }} />
    <Composition id="c99-reel" component={C99Reel} width={1080} height={1920} fps={60} durationInFrames={REEL_FRAMES} />
  </>
);
