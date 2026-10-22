import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { UKWeather, UK_DURATION_60 } from './UKWeather';

/** A render-only entry with just this video, so a sparse checkout (src, public/ukweather, brand, timezones fonts) can
 *  bundle it without the rest of the studio's projects. Same composition as in src/Root.tsx. */
const RenderRoot: React.FC = () => (
  <Composition id="UKWeather4K60" component={UKWeather} durationInFrames={UK_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 2, audio: '' }} />
);
registerRoot(RenderRoot);
