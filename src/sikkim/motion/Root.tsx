import React from 'react';
import { Composition } from 'remotion';
import { TestMap } from './TestMap';
import { TestTrain } from './TestTrain';
import { TestValley } from './TestValley';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="test-valley" component={TestValley} width={1080} height={1920} fps={60} durationInFrames={300} />
    <Composition id="test-map" component={TestMap} width={1080} height={1920} fps={60} durationInFrames={1560} />
    <Composition id="test-train" component={TestTrain} width={1080} height={1920} fps={60} durationInFrames={6} />
  </>
);
