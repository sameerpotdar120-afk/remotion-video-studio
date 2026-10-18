import React from 'react';
import { Composition } from 'remotion';
import { M01CircleArrows } from './M01CircleArrows';
import { M02AlarmClock } from './M02AlarmClock';
import { M03ClockBubble } from './M03ClockBubble';
import { M04Steam } from './M04Steam';
import { M05Question } from './M05Question';
import { M06Crack } from './M06Crack';
import { M07RedCross } from './M07RedCross';
import { M08Sunrise } from './M08Sunrise';
import { M09NightSweep } from './M09NightSweep';
import { M10WallClock } from './M10WallClock';
import { M11CommentBubble } from './M11CommentBubble';
import { M12Whip } from './M12Whip';
import { M13TeaLeaves } from './M13TeaLeaves';
import { M14PinPulse } from './M14PinPulse';
import { M15Zzz } from './M15Zzz';
import { M16Sparkle } from './M16Sparkle';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="m01-circle-arrows" component={M01CircleArrows} width={800} height={800} fps={60} durationInFrames={180} />
    <Composition id="m02-alarm-clock" component={M02AlarmClock} width={600} height={700} fps={60} durationInFrames={150} defaultProps={{ h: 10, m: 10 }} />
    <Composition id="m02-alarm-clock-10am" component={M02AlarmClock} width={600} height={700} fps={60} durationInFrames={150} defaultProps={{ h: 10, m: 0 }} />
    <Composition id="m03-clock-bubble-5" component={M03ClockBubble} width={700} height={560} fps={60} durationInFrames={180} defaultProps={{ h: 5, flip: false, tail: 'left' as const }} />
    <Composition id="m03-clock-bubble-6" component={M03ClockBubble} width={700} height={560} fps={60} durationInFrames={180} defaultProps={{ h: 5, flip: true, tail: 'right' as const }} />
    <Composition id="m04-steam" component={M04Steam} width={300} height={420} fps={60} durationInFrames={180} />
    <Composition id="m05-question" component={M05Question} width={400} height={520} fps={60} durationInFrames={120} />
    <Composition id="m06-crack" component={M06Crack} width={360} height={1600} fps={60} durationInFrames={90} />
    <Composition id="m07-red-cross" component={M07RedCross} width={520} height={520} fps={60} durationInFrames={90} />
    <Composition id="m08-sunrise" component={M08Sunrise} width={1000} height={1000} fps={60} durationInFrames={240} defaultProps={{ peek: false }} />
    <Composition id="m08-sun-peek" component={M08Sunrise} width={1000} height={1000} fps={60} durationInFrames={240} defaultProps={{ peek: true }} />
    <Composition id="m09-night-sweep" component={M09NightSweep} width={1080} height={1920} fps={60} durationInFrames={240} defaultProps={{ from: 'right' as const, cover: 0.75 }} />
    <Composition id="m10-clock-plus60" component={M10WallClock} width={600} height={600} fps={60} durationInFrames={180} defaultProps={{ h: 6, m: 0, add: 60, arc: '#3BE07A' }} />
    <Composition id="m10-clock-plus15" component={M10WallClock} width={600} height={600} fps={60} durationInFrames={180} defaultProps={{ h: 6, m: 0, add: 15, arc: '#FF4D6D' }} />
    <Composition id="m11-comment-bubble" component={M11CommentBubble} width={900} height={620} fps={60} durationInFrames={210} />
    <Composition id="m12-whip-left" component={M12Whip} width={1080} height={1920} fps={60} durationInFrames={30} defaultProps={{ dir: 'left' as const }} />
    <Composition id="m12-whip-right" component={M12Whip} width={1080} height={1920} fps={60} durationInFrames={30} defaultProps={{ dir: 'right' as const }} />
    <Composition id="m13-tea-leaves" component={M13TeaLeaves} width={1080} height={1920} fps={60} durationInFrames={300} />
    <Composition id="m14-pin-pulse" component={M14PinPulse} width={420} height={420} fps={60} durationInFrames={240} defaultProps={{ color: '#FF2B3A' }} />
    <Composition id="m15-zzz" component={M15Zzz} width={360} height={460} fps={60} durationInFrames={180} />
    <Composition id="m16-sparkle" component={M16Sparkle} width={640} height={640} fps={60} durationInFrames={72} defaultProps={{ color: '#FFE11A' }} />
  </>
);
