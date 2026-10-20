import React from 'react';
import { Composition } from 'remotion';
import { MainComposition } from './Video';
import { FPS, H, W } from './lib/constants';
import { loadFonts } from './lib/fonts';
import { DemoBritain, DemoMap3D, DemoMapHook, DemoVolley } from './scenes/Demos';
import { GrandUnion, UnionFlag1707 } from './lib/fx/flags';
import { Animatic } from './scenes/Animatic';
import { PreviewHook } from './scenes/PreviewHook';
import { TOTAL_FRAMES } from './vo/cues';
import { Final } from './final/Final';

loadFonts();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 4K 60 fps long-form (16:9) */}
      <Composition id="Final-4K" component={Final} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
      <Composition id="Preview-Hook10s" component={PreviewHook} durationInFrames={600} fps={FPS} width={W} height={H} />
      <Composition id="Full-Animatic" component={Animatic} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
      <Composition id="Demo-MapHook" component={DemoMapHook} durationInFrames={480} fps={FPS} width={W} height={H} />
      <Composition id="Demo-Britain" component={DemoBritain} durationInFrames={360} fps={FPS} width={W} height={H} />
      <Composition id="Demo-Map3D" component={DemoMap3D} durationInFrames={480} fps={FPS} width={W} height={H} />
      <Composition id="Demo-Volley" component={DemoVolley} durationInFrames={300} fps={FPS} width={W} height={H} />
      {/* Export flags to PNG once for FlagFill:
          npx remotion still src/index.ts Flag-GrandUnion public/assets/flags/grand_union_1775.png */}
      <Composition id="Flag-GrandUnion" component={() => <GrandUnion width={3800} />} durationInFrames={1} fps={FPS} width={3800} height={2000} />
      <Composition id="Flag-Union1707" component={() => <UnionFlag1707 width={3800} />} durationInFrames={1} fps={FPS} width={3800} height={1900} />
      {/* original vertical starter */}
      <Composition
        id="MainComposition"
        component={MainComposition}
        durationInFrames={240}
        fps={24}
        width={1080}
        height={1920}
        defaultProps={{ title: 'Documentary Video' }}
      />
    </>
  );
};
