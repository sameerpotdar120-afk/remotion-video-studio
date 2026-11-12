import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { PgCover } from './Cover';
import { PG_DURATION_S, Pangea } from './Pangea';

/** A render-only entry for the Pangea edit (a minimal public dir: pangea, brand). */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="PgCover" component={PgCover} durationInFrames={1} fps={60} width={1080} height={1920} />
    <Composition id="Pangea4K60" component={Pangea} durationInFrames={Math.round(PG_DURATION_S * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: true, audio: '' }} />
  </>
);
registerRoot(RenderRoot);
