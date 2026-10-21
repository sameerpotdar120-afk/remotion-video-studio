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
import { S06Proclamation } from './S06Proclamation';
import { S07Sugar } from './S07Sugar';
import { S08Stamp } from './S08Stamp';
import { S09Repeal } from './S09Repeal';
import { S10Townshend } from './S10Townshend';
import { S11Massacre } from './S11Massacre';
import { S12Adams } from './S12Adams';
import { S13Tea } from './S13Tea';
import { S14Intolerable } from './S14Intolerable';
import { S15Lexington } from './S15Lexington';

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
  S06_proclamation: { comp: S06Proclamation },
  S07_sugar: { comp: S07Sugar },
  S08_stamp: { comp: S08Stamp },
  S09_repeal: { comp: S09Repeal },
  S10_townshend: { comp: S10Townshend },
  S11_massacre: { comp: S11Massacre },
  S12_adams: { comp: S12Adams },
  S13_tea: { comp: S13Tea },
  S14_intolerable: { comp: S14Intolerable },
  S15_lexington: { comp: S15Lexington },
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
