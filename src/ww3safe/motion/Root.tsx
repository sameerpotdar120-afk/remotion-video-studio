import React from 'react';
import { Composition } from 'remotion';
import { M01TitleBanner } from './M01TitleBanner';
import { M02ImpactFlash } from './M02ImpactFlash';
import { M03Nuke } from './M03Nuke';
import { M04WarSplat } from './M04WarSplat';
import { M05AshFall } from './M05AshFall';
import { M06SpaceBg } from './M06SpaceBg';
import { M07Steam } from './M07Steam';
import { M08CommentBurst } from './M08CommentBurst';

export const MotionRoot: React.FC = () => (
  <>
    <Composition id="m01-title-banner" component={M01TitleBanner} width={1080} height={560} fps={60} durationInFrames={150} />
    <Composition id="m02-impact-flash" component={M02ImpactFlash} width={360} height={360} fps={60} durationInFrames={48} />
    <Composition id="m03-nuke" component={M03Nuke} width={700} height={1000} fps={60} durationInFrames={240} />
    <Composition id="m04-war-splat" component={M04WarSplat} width={420} height={420} fps={60} durationInFrames={240} />
    <Composition id="m05-ash-fall" component={M05AshFall} width={1080} height={1920} fps={60} durationInFrames={360} />
    <Composition id="m06-space-bg" component={M06SpaceBg} width={1080} height={1920} fps={60} durationInFrames={480} />
    <Composition id="m07-steam" component={M07Steam} width={600} height={900} fps={60} durationInFrames={240} />
    <Composition id="m08-comment-burst" component={M08CommentBurst} width={600} height={600} fps={60} durationInFrames={180} />
  </>
);
