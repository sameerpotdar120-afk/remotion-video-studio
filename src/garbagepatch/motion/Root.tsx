import React from 'react';
import { Composition } from 'remotion';
import { P02Accent } from './P02Accent';
import { P07CountUp } from './P07CountUp';
import { P10NumRing } from './P10NumRing';
import { P99Reel, REEL_FRAMES, TEST_IMGS } from './P99Reel';

// Standalone pieces; the rest take map geometry or the creator's images as props and are used in the edit (and
// shown in p99-reel on the real map).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="p02-accent" component={P02Accent} width={1000} height={260} fps={60} durationInFrames={120} defaultProps={{ text: 'कचरा', out: 90 }} />
    <Composition id="p07-count-up" component={P07CountUp} width={1000} height={400} fps={60} durationInFrames={150} defaultProps={{ to: 16, unit: ' लाख km²', sub: 'भारत का लगभग आधा' }} />
    <Composition id="p10-num-ring" component={P10NumRing} width={360} height={360} fps={60} durationInFrames={120} defaultProps={{ n: 1, size: 120 }} />
    <Composition id="p99-reel" component={P99Reel} width={1080} height={1920} fps={60} durationInFrames={REEL_FRAMES} />
    <Composition id="p99-reel-test" component={P99Reel} width={1080} height={1920} fps={60} durationInFrames={REEL_FRAMES} defaultProps={{ img: TEST_IMGS }} />
  </>
);
