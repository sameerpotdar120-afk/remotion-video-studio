import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { C, FONTS, H, W } from '../lib/constants';
import { SCENES } from '../vo/cues';

/**
 * Full-length ANIMATIC: the real VO + every scene on its exact frames + each cue flashing as it fires.
 * Use it to check sync in Remotion Studio before assets exist; real scenes replace each <Sequence> body.
 */
const SceneCard: React.FC<{ idx: number }> = ({ idx }) => {
  const s = SCENES[idx];
  const frame = useCurrentFrame(); // local to the scene
  const active = [...s.events].reverse().find((e) => frame >= e.frame - s.from);
  return (
    <AbsoluteFill style={{ background: idx % 2 ? '#1E2B33' : '#26343D', color: '#fff', padding: 160, fontFamily: FONTS.serif }}>
      <div style={{ fontSize: 70, color: C.dateYellow }}>{s.id}</div>
      <div style={{ fontSize: 120, fontWeight: 700, marginTop: 20 }}>{s.title}</div>
      <div style={{ fontSize: 56, opacity: 0.7, marginTop: 12 }}>{s.style}</div>
      {active && (
        <div style={{ position: 'absolute', left: 160, right: 160, bottom: 220 }}>
          <div style={{ fontFamily: FONTS.hindi, fontSize: 110, color: C.dateYellow }}>“{active.phrase}”</div>
          <div style={{ fontSize: 64, marginTop: 24, lineHeight: 1.25 }}>{active.action}</div>
        </div>
      )}
      <div style={{ position: 'absolute', right: 160, top: 160, fontSize: 60, opacity: 0.6 }}>
        f {s.from + frame} · {((s.from + frame) / 60).toFixed(2)} s
      </div>
    </AbsoluteFill>
  );
};

export const Animatic: React.FC<{ silent?: boolean }> = ({ silent }) => (
  <AbsoluteFill style={{ width: W, height: H }}>
    {!silent && <Audio src={staticFile('assets/vo/vo_master.mp3')} />}
    {SCENES.map((s, i) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from} name={s.id}>
        <SceneCard idx={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
