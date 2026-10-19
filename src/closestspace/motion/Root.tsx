import React from 'react';
import { Composition } from 'remotion';
import { C01PeakPins } from './C01PeakPins';
import { C02GlowWord } from './C02GlowWord';
import { C03Magnifier } from './C03Magnifier';
import { C04ZoomBlur } from './C04ZoomBlur';
import { C05PeakLabel } from './C05PeakLabel';
import { C06Climber } from './C06Climber';
import { C07RedX } from './C07RedX';
import { C08FlatEarth } from './C08FlatEarth';
import { C09SphereGeoid } from './C09SphereGeoid';
import { C10SpinArrows } from './C10SpinArrows';
import { C11RumaliRoti } from './C11RumaliRoti';
import { C12LumpyGlow } from './C12LumpyGlow';
import { C13Geoid } from './C13Geoid';
import { C14RadiusLines } from './C14RadiusLines';
import { C15TapeMeasure } from './C15TapeMeasure';
import { C16AnswerType } from './C16AnswerType';
import { C17SendPop } from './C17SendPop';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="c01-peak-pins" component={C01PeakPins} width={1080} height={1920} fps={60} durationInFrames={240} />
    <Composition id="c02-glow-word" component={C02GlowWord} width={1080} height={700} fps={60} durationInFrames={200} />
    <Composition id="c03-magnifier" component={C03Magnifier} width={1080} height={1920} fps={60} durationInFrames={240} />
    <Composition id="c04-zoom-blur" component={C04ZoomBlur} width={1080} height={1920} fps={60} durationInFrames={60} />
    <Composition id="c05-peak-label" component={C05PeakLabel} width={900} height={700} fps={60} durationInFrames={150} />
    <Composition id="c06-climber" component={C06Climber} width={1080} height={1400} fps={60} durationInFrames={200} />
    <Composition id="c07-red-x" component={C07RedX} width={1080} height={1920} fps={60} durationInFrames={110} />
    <Composition id="c08-flat-earth" component={C08FlatEarth} width={1080} height={1920} fps={60} durationInFrames={130} />
    <Composition id="c09-sphere-geoid" component={C09SphereGeoid} width={1080} height={1080} fps={60} durationInFrames={160} />
    <Composition id="c10-spin-arrows" component={C10SpinArrows} width={1080} height={1080} fps={60} durationInFrames={270} />
    <Composition id="c11-rumali-roti" component={C11RumaliRoti} width={1080} height={1400} fps={60} durationInFrames={300} />
    <Composition id="c12-lumpy-glow" component={C12LumpyGlow} width={1080} height={1080} fps={60} durationInFrames={150} />
    <Composition id="c13-geoid" component={C13Geoid} width={1080} height={1080} fps={60} durationInFrames={480} />
    <Composition id="c14-radius-lines" component={C14RadiusLines} width={1080} height={1080} fps={60} durationInFrames={180} />
    <Composition id="c15-tape-measure" component={C15TapeMeasure} width={1080} height={1080} fps={60} durationInFrames={200} />
    <Composition id="c16-answer-type" component={C16AnswerType} width={1080} height={1080} fps={60} durationInFrames={180} />
    <Composition id="c17-send-pop" component={C17SendPop} width={600} height={600} fps={60} durationInFrames={120} />
  </>
);
