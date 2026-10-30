import React from 'react';
import { Composition } from 'remotion';
import { MainComposition } from './Video';
import { FPS, H, W } from './lib/constants';
import { loadFonts } from './lib/fonts';
import { DemoBritain, DemoMap3D, DemoMapHook, DemoVolley } from './scenes/Demos';
import { BourbonFrance, GrandUnion, UnionFlag1707 } from './lib/fx/flags';
import { ArrowBlock } from './lib/fx/arrow';
import { Animatic } from './scenes/Animatic';
import { PreviewHook } from './scenes/PreviewHook';
import { TOTAL_FRAMES } from './vo/cues';
import { Final } from './final/Final';
import { RigSheet } from './scenes/RigSheet';
import { Thumbnail } from './thumb/Thumbnail';
import { RussiaFinal, RUSSIA_TOTAL } from './russia/RussiaFinal';
import { Hiroshima, TOTAL as HIROSHIMA_TOTAL } from './hiroshima/Hiroshima';
import { CastSheet } from './styles/stickman3d/CastSheet';
import { Test3D } from './horse/Test3D';
import { Horse, HORSE_TOTAL } from './horse/Horse';

loadFonts();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 4K 60 fps long-form (16:9) */}
      <Composition id="Final-4K" component={Final} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
      <Composition id="Russia-4K" component={RussiaFinal} durationInFrames={RUSSIA_TOTAL} fps={FPS} width={W} height={H} />
      <Composition id="Russia-Audio" component={RussiaFinal} durationInFrames={RUSSIA_TOTAL} fps={FPS} width={640} height={360} defaultProps={{ audioOnly: true }} />
      <Composition id="Horse-4K" component={Horse} durationInFrames={HORSE_TOTAL} fps={60} width={2160} height={3840} />
      <Composition id="Horse-Test3D" component={Test3D} durationInFrames={300} fps={60} width={2160} height={3840} />
      <Composition id="Horse-CastSheet" component={CastSheet} durationInFrames={60} fps={60} width={2160} height={3840} />
      <Composition id="Hiroshima-4K" component={Hiroshima} durationInFrames={HIROSHIMA_TOTAL} fps={60} width={2160} height={3840} />
      <Composition id="Thumb-4K" component={Thumbnail} durationInFrames={60} fps={FPS} width={W} height={H} />
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
      <Composition id="Rig-Sheet" component={RigSheet} durationInFrames={60} fps={FPS} width={W} height={H} />
      <Composition id="Flag-Bourbon" component={() => <BourbonFrance width={3600} />} durationInFrames={1} fps={30} width={3600} height={2400} />
      <Composition id="Icon-Arrow" component={() => <ArrowBlock width={2048} height={1024} />} durationInFrames={1} fps={30} width={2048} height={1024} />
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
