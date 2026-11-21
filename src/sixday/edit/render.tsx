import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { DURATION_S, SHORTS, SixDayLong, SixDayShort } from './SixDay';

/** A render-only entry for the Six-Day War edit (a minimal public dir: sixday). 4K = these sizes with --scale=2. */
const RenderRoot: React.FC = () => (
  <>
    <Composition id="SDLong" component={SixDayLong} durationInFrames={Math.round(DURATION_S * 30)} fps={30} width={1920} height={1080} defaultProps={{ audio: '' }} />
    {SHORTS.map((s, i) => (
      <Composition key={s.name} id={`SDShort${i + 1}`} component={SixDayShort} durationInFrames={Math.round((s.t1 - s.t0) * 30)} fps={30} width={1080} height={1920} defaultProps={{ n: i, audio: '' }} />
    ))}
  </>
);
registerRoot(RenderRoot);
