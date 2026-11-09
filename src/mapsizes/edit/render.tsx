import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { MS_DURATION_60, MapSizes } from './MapSizes';
import { MsCover } from './Cover';

/** A render-only entry for the map-sizes edit (a minimal public dir: mapsizes, brand). */
const RenderRoot: React.FC = () => (
  <>
  <Composition id="MapSizes4K60" component={MapSizes} durationInFrames={MS_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  <Composition id="MsCover" component={MsCover} durationInFrames={1} fps={60} width={1080} height={1920} />
  </>
);
registerRoot(RenderRoot);
