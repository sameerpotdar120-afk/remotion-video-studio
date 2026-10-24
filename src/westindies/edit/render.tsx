import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { WestIndies, WI_DURATION_60 } from './WestIndies';
import { WiCover } from './Cover';

/** A render-only entry for the West Indies edit (a minimal public dir: westindies maps, fonts, null, audio; brand;
 *  timezones fonts). Same composition as in src/Root.tsx. */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="WestIndies4K60" component={WestIndies} durationInFrames={WI_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 2, audio: '' }} />
    <Composition id="WiCover" component={WiCover} durationInFrames={1} fps={60} width={1080} height={1920} defaultProps={{ text: true, res: 2 }} />
  </>
);
registerRoot(RenderRoot);
