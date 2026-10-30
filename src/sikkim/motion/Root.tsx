import React from 'react';
import { Composition } from 'remotion';
import { TestValley } from './TestValley';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="test-valley" component={TestValley} width={1080} height={1920} fps={60} durationInFrames={300} />
  </>
);
