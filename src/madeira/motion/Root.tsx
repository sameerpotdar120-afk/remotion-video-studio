import React from 'react';
import { Composition } from 'remotion';
import { M10NeonLabel } from './M10NeonLabel';
import { M13Embers } from './M13Embers';
import { M17PinLabel } from './M17PinLabel';
import { M99Reel, REEL_FRAMES, TEST_IMGS } from './M99Reel';

// Standalone pieces; the rest take map geometry or the creator's images as props and are used in the edit (and
// shown in m99-reel on the real map).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="m10-neon-label" component={M10NeonLabel} width={900} height={300} fps={60} durationInFrames={90} defaultProps={{ text: 'MADEIRA' }} />
    <Composition id="m10-neon-count" component={M10NeonLabel} width={900} height={300} fps={60} durationInFrames={120} defaultProps={{ count: [0, 2000, 60] as [number, number, number], suffix: ' km' }} />
    <Composition id="m13-embers" component={M13Embers} width={1080} height={1920} fps={60} durationInFrames={600} />
    <Composition id="m17-pin-label" component={M17PinLabel} width={900} height={520} fps={60} durationInFrames={90} />
    <Composition id="m99-reel" component={M99Reel} width={1080} height={1920} fps={60} durationInFrames={REEL_FRAMES} />
    <Composition id="m99-reel-test" component={M99Reel} width={1080} height={1920} fps={60} durationInFrames={REEL_FRAMES} defaultProps={{ img: TEST_IMGS }} />
  </>
);
