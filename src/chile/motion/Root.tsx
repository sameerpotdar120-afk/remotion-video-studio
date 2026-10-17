import React from 'react';
import { Composition } from 'remotion';
import { M01ChiliLabel } from './M01ChiliLabel';
import { M02LongLetters } from './M02LongLetters';
import { M03ShipToEmoji } from './M03ShipToEmoji';
import { M04TalkingFlag } from './M04TalkingFlag';
import { M05MiniFlags } from './M05MiniFlags';
import { M06BoliviaFace } from './M06BoliviaFace';
import { M07Arrows } from './M07Arrows';
import { M08SendBurst } from './M08SendBurst';
import { M09Title1500 } from './M09Title1500';

export const MotionRoot: React.FC = () => (
  <>
    <Composition id="m01-chili-label" component={M01ChiliLabel} width={700} height={420} fps={60} durationInFrames={300} />
    <Composition id="m02-long-letters" component={M02LongLetters} width={500} height={1400} fps={60} durationInFrames={240} />
    <Composition id="m03-ship-to-emoji" component={M03ShipToEmoji} width={300} height={300} fps={60} durationInFrames={300} />
    <Composition id="m04-flag-talk" component={M04TalkingFlag} width={640} height={480} fps={60} durationInFrames={240} defaultProps={{ mood: 'talk' as const }} />
    <Composition id="m04-flag-shocked" component={M04TalkingFlag} width={640} height={480} fps={60} durationInFrames={240} defaultProps={{ mood: 'shocked' as const }} />
    <Composition id="m04-flag-south" component={M04TalkingFlag} width={640} height={480} fps={60} durationInFrames={240} defaultProps={{ mood: 'south' as const }} />
    <Composition id="m05-mini-flags" component={M05MiniFlags} width={500} height={400} fps={60} durationInFrames={120} />
    <Composition id="m06-bolivia-face" component={M06BoliviaFace} width={600} height={500} fps={60} durationInFrames={300} />
    <Composition id="m07-arrows-wider" component={M07Arrows} width={700} height={1000} fps={60} durationInFrames={150} defaultProps={{ kind: 'wider' as const }} />
    <Composition id="m07-arrows-longer" component={M07Arrows} width={700} height={1000} fps={60} durationInFrames={150} defaultProps={{ kind: 'longer' as const }} />
    <Composition id="m08-send-burst" component={M08SendBurst} width={500} height={500} fps={60} durationInFrames={180} />
    <Composition id="m09-title-1500" component={M09Title1500} width={1080} height={400} fps={60} durationInFrames={180} />
  </>
);
