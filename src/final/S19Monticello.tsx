import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../lib/constants';
import { clamp, ease, ramp } from '../lib/easing';
import { Grade, Sfx } from '../lib/fx/particles';
import { WhipIn } from '../lib/fx/transitions';
import { Puppet } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { HindiTitle } from './fx';
import { Plate } from './kit';

/**
 * S19 — THE TWIST: MONTICELLO (26572 → 27228, 10.9 s). Serious beat: no gag, memorial grade, music drops.
 *  "उसी वक़्त"             whip to the Monticello porch: Martha Jefferson and little Patsy
 *  "दो सौ लोग ग़ुलाम"       slow pull-back to the whole estate: the enslaved men and women who worked it
 *  "पाँच लाख लोगों"         the 5,00,000 counter pinned in S03 returns to the corner
 *  "बहुत दूर था"           hold
 */
export const S19Monticello: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S19_monticello');
  const porchAt = c.at('उसी वक़्त');
  const enslavedAt = c.at('दो सौ लोग ग़ुलाम');
  const counterAt = c.at('पाँच लाख लोगों');
  const len = c.duration;
  const workers = [
    { rig: RIGS.enslavedWorkerMan, x: 0.14, y: 0.96, h: 760 },
    { rig: RIGS.enslavedWorkerWoman, x: 0.3, y: 0.9, h: 640 },
    { rig: RIGS.enslavedWorkerMan, x: 0.46, y: 0.86, h: 520 },
    { rig: RIGS.enslavedWorkerWoman, x: 0.62, y: 0.88, h: 560 },
    { rig: RIGS.enslavedWorkerMan, x: 0.78, y: 0.93, h: 680 },
    { rig: RIGS.enslavedWorkerWoman, x: 0.9, y: 0.84, h: 470 },
  ];
  const cross = interpolate(frame, [enslavedAt, enslavedAt + 40], [0, 1], { ...clamp, easing: ease.inOut });

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Grade look="relief" mood="memorial">
        <Sequence durationInFrames={enslavedAt + 40} layout="none">
          <WhipIn>
            <Plate bg="bg_monticello_porch_1776.png" blur={2} camera={[{ frame: 0, x: 0, y: 0, zoom: 1.12 }, { frame: enslavedAt, x: 0, y: 0, zoom: 1.04 }, { frame: enslavedAt + 40, x: 0, y: 0, zoom: 0.9 }]}>
              <Puppet rig={RIGS.marthaJefferson} x={W * 0.42} y={H * 0.98} height={1200} seed="mj" look={1} moods={[[0, 'smile']]} />
              <Puppet rig={RIGS.patsyJefferson} x={W * 0.58} y={H * 1.0} height={760} seed="pj" look={-1} moods={[[0, 'grin']]} />
            </Plate>
          </WhipIn>
        </Sequence>
        <Sequence from={enslavedAt} layout="none">
          <AbsoluteFill style={{ opacity: cross }}>
            <Plate bg="bg_monticello_1776.png" blur={1} camera={[{ frame: 0, x: 0, y: 0, zoom: 1.2 }, { frame: len - enslavedAt, x: 0, y: 0, zoom: 1.02 }]}>
              {workers.map((p, i) => (
                <Puppet key={i} rig={p.rig} x={W * p.x} y={H * p.y} height={p.h} start={10 + i * 8} seed={`ew${i}`} moods={[[0, 'neutral']]} idle={1} />
              ))}
            </Plate>
          </AbsoluteFill>
        </Sequence>
      </Grade>
      <HindiTitle x={W * 0.5} y={H * 0.12} text="Monticello · 1776" start={porchAt + 10} exit={enslavedAt} size={120} />
      <HindiTitle x={W * 0.5} y={H * 0.14} text="लगभग 200 लोग ग़ुलाम" start={enslavedAt + 30} exit={counterAt + 20} size={130} color="#F3E3C4" />
      {frame >= counterAt && (
        <div style={{ opacity: ramp(frame, counterAt, 14, ease.out) }}>
          <HindiTitle x={W - 400} y={235} text="5,00,000" sub="अश्वेत · ज़्यादातर ग़ुलाम" start={counterAt} size={130} color="#F2C14E" />
        </div>
      )}
      <Sfx at={porchAt} file="whoosh_fast.wav" volume={0.35} />
      <Sfx at={counterAt} file="heartbeat_low.wav" volume={0.3} />
    </AbsoluteFill>
  );
};
