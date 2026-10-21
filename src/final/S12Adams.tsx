import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { FONTS, H, W } from '../lib/constants';
import { clamp, popScale } from '../lib/easing';
import { Grade, Sfx } from '../lib/fx/particles';
import { PopIn } from '../lib/fx/motion';
import { MapTitle } from '../lib/fx/text';
import { WhipIn } from '../lib/fx/transitions';
import { Puppet } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { HindiTitle } from './fx';
import { Plate } from './kit';

/**
 * S12 — JOHN ADAMS DEFENDS THE SOLDIERS (17487 → 18006, 8.7 s). Courtroom plate. Frames LOCAL.
 *  "John Adams ने लड़ा"   Adams argues (talking) before the bench; two redcoats in the dock look worried
 *  "दूसरे President"      a small portrait card: "2nd President of the USA"
 *  "बरी हो गए"            the gavel taps; the soldiers smile
 */
export const S12Adams: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S12_adams');
  const adamsAt = c.at('John Adams ने लड़ा');
  const presAt = c.at('दूसरे President');
  const freeAt = c.at('बरी हो गए');
  const len = c.duration;
  const tap = (f: number) => {
    const t = frame - f;
    return t >= 0 && t < 14 ? interpolate(t, [0, 4, 14], [0, -32, 0], clamp) : 0;
  };
  return (
    <AbsoluteFill>
      <WhipIn>
        <Grade look="relief">
          <Plate bg="bg_courtroom_1765.png" camera={[{ frame: 0, x: 0, y: 0, zoom: 1.04 }, { frame: len, x: -80, y: 0, zoom: 1.14 }]} blur={3}>
            <Puppet rig={RIGS.redcoat} x={W * 0.7} y={H * 0.92} height={1000} flip seed="dk1" moods={[[0, 'worried'], [freeAt + 8, 'grin']]} />
            <Puppet rig={RIGS.redcoatOfficer} x={W * 0.84} y={H * 0.96} height={1100} flip seed="dk2" moods={[[0, 'worried'], [freeAt + 12, 'smile']]} />
            <Puppet rig={RIGS.johnAdams} x={W * 0.32} y={H * 1.03} height={1500} seed="ja" look={1}
              moods={[[0, 'angry'], [presAt, 'neutral'], [freeAt + 6, 'smile']]} talk={[[adamsAt + 6, presAt - 10], [presAt + 40, freeAt - 10]]} />
          </Plate>
        </Grade>
      </WhipIn>
      <MapTitle x={W * 0.32} y={H * 0.12} text="John Adams" date="Boston · 1770" start={adamsAt + 10} size={140} exit={presAt} />
      {/* the "2nd President" card */}
      <PopIn start={presAt} exit={freeAt - 10} x={W * 0.6} y={H * 0.26} w={760} h={360} rotate={-4}>
        <div style={{ width: 760, height: 360, background: '#F3E6C4', borderRadius: 18, boxShadow: '0 20px 40px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.serif, fontWeight: 700, color: '#3A2616' }}>
          <div style={{ fontSize: 120 }}>2nd</div>
          <div style={{ fontSize: 62 }}>President of the USA</div>
          <div style={{ fontSize: 48, color: '#8A6A40' }}>1797–1801</div>
        </div>
      </PopIn>
      {frame >= freeAt - 8 && (
        <Img src={staticFile('assets/props/gavel_wood.png')} style={{ position: 'absolute', left: W * 0.5 - 300, top: H * 0.36 + tap(freeAt) + tap(freeAt + 16), width: 600, height: 600,
          transform: `scale(${popScale(frame, freeAt - 8)}) rotate(${tap(freeAt) * 0.4}deg)` }} />
      )}
      <HindiTitle x={W * 0.5} y={H * 0.84} text="बरी" sub="Captain Preston + 8 में से 6 soldiers" start={freeAt + 6} size={190} />

      <Sfx at={0} file="whoosh_fast.wav" volume={0.4} />
      <Sfx at={presAt} file="pop.wav" volume={0.45} />
      <Sfx at={freeAt} file="thud_soft.wav" volume={0.55} />
      <Sfx at={freeAt + 16} file="thud_soft.wav" volume={0.5} />
      <Sfx at={freeAt + 22} file="sting_shimmer.wav" volume={0.3} />
    </AbsoluteFill>
  );
};
