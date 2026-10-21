import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Finish } from '../lib/fx/particles';
import { SCENES } from '../vo/cues';
import { Animatic } from '../scenes/Animatic';
import { Bgm, Vo } from './fx';
import { S01Hook } from './S01Hook';
import { S02Turn } from './S02Turn';
import { S03Colonies } from './S03Colonies';
import { S04FirstShot } from './S04FirstShot';
import { S05Debt } from './S05Debt';

/**
 * FINAL 4K60 cut. Each scene is a <Sequence> on its exact VO frames; finished scenes replace the
 * animatic card. Render in chunks for review, e.g. chunk 1:
 *   npx remotion render src/index.ts Final-4K out/chunk01.mp4 --frames=0-1908 --gl=swangle
 */
const BUILT: Record<string, { comp: React.FC; tail?: number }> = {
  S01_hook: { comp: S01Hook, tail: 30 }, // stays under S02's 30-frame wipe
  S02_turn: { comp: S02Turn },
  S03_colonies: { comp: S03Colonies },
  S04_first_shot: { comp: S04FirstShot },
  S05_debt: { comp: S05Debt },
};

export const Final: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Sequence name="animatic (unbuilt scenes)" layout="none">
      <AbsoluteFill>
        <Animatic silent />
      </AbsoluteFill>
    </Sequence>
    {SCENES.map((s) => {
      const b = BUILT[s.id];
      if (!b) return null;
      return (
        <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.to - s.from + (b.tail ?? 0)}>
          <b.comp />
        </Sequence>
      );
    })}
    <Sequence name="finish">
      <Finish />
    </Sequence>
    <Vo />
    <Bgm />
  </AbsoluteFill>
);
