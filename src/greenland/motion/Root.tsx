import React from 'react';
import { Composition } from 'remotion';
import { G01Highlighter } from './G01Highlighter';
import { G02NameLabel } from './G02NameLabel';
import { G06RomanIX } from './G06RomanIX';
import { G08Snow } from './G08Snow';
import { G11HandLabel } from './G11HandLabel';
import { G12Stamp } from './G12Stamp';
import { G13Alert } from './G13Alert';
import { G15TitleCard } from './G15TitleCard';
import { G99Reel, REEL_FRAMES } from './G99Reel';

// The pieces that stand alone. g03, g04, g05, g07, g09, g10 and g14 take map geometry or other layers as props, so
// they are used inside the edit (and shown in g99-reel on the real map).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="g01-highlighter" component={G01Highlighter} width={900} height={260} fps={60} durationInFrames={90} />
    <Composition id="g02-greenland" component={G02NameLabel} width={1000} height={360} fps={60} durationInFrames={180} defaultProps={{ kind: 'green' as const }} />
    <Composition id="g02-iceland" component={G02NameLabel} width={1000} height={360} fps={60} durationInFrames={180} defaultProps={{ kind: 'ice' as const }} />
    <Composition id="g06-roman-ix" component={G06RomanIX} width={800} height={520} fps={60} durationInFrames={90} />
    <Composition id="g08-snow" component={G08Snow} width={1080} height={1920} fps={60} durationInFrames={600} />
    <Composition id="g11-hand-label" component={G11HandLabel} width={900} height={700} fps={60} durationInFrames={90} />
    <Composition id="g12-exile-stamp" component={G12Stamp} width={900} height={500} fps={60} durationInFrames={80} />
    <Composition id="g12-clickbait-stamp" component={G12Stamp} width={900} height={500} fps={60} durationInFrames={80} defaultProps={{ text: 'CLICKBAIT', sub: '1000 साल पुराना', seed: 'c' }} />
    <Composition id="g13-alert" component={G13Alert} width={400} height={400} fps={60} durationInFrames={90} />
    <Composition id="g15-title-card" component={G15TitleCard} width={1080} height={760} fps={60} durationInFrames={120} />
    <Composition id="g99-reel" component={G99Reel} width={1080} height={1920} fps={60} durationInFrames={REEL_FRAMES} />
  </>
);
