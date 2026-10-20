import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, H, W } from '../lib/constants';
import { clamp, ease, popScale, ramp } from '../lib/easing';
import { Map3D } from '../lib/three/Map3D';
import { TimelineRuler } from '../lib/fx/text';
import { Finish, Grade } from '../lib/fx/particles';
import { Flash } from '../lib/fx/transitions';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { scene } from '../vo/cues';

/**
 * 10-second preview of the opening (S01), driven by the real VO cues:
 *  "आपको बताया गया"         → 3D colonies rise one by one, camera tilts from top view to oblique
 *  "आज़ादी के लिए"           → Grand Union flag (1776) waves in + timeline 1775 · 1776 · 1777
 *  "सत्रह सौ तिरसठ में यही"  → white flash, timeline REWINDS to 1762 · 1763 · 1764, flag drops away
 *  "राजा से प्यार"           → Britain (map character) slides in over the Atlantic, smiling
 *  "तेरह साल"               → timeline races forward
 */
const FlagWave: React.FC<{ start: number; exit: number }> = ({ start, exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const s = popScale(frame, start);
  const out = ramp(frame, exit, 14, ease.in);
  const sway = Math.sin(frame / 9) * 4;
  return (
    <Img
      src={staticFile('assets/flags/grand_union_1775.png')}
      style={{
        position: 'absolute',
        left: W * 0.66,
        top: H * 0.26 + out * H * 0.8,
        width: 900,
        transform: `perspective(1400px) rotateY(${-18 + sway}deg) rotateZ(${-4 + sway / 3}deg) scale(${s})`,
        boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
        opacity: 1 - out,
      }}
    />
  );
};

export const PreviewHook: React.FC = () => {
  const c = scene('S01_hook');
  const gb = useMemo(() => greatBritain1763(), []);
  const flagAt = c.at('आज़ादी के लिए');
  const rewindAt = c.at('सत्रह सौ तिरसठ में यही');
  const kingAt = c.at('राजा से प्यार');
  const yearsAt = c.at('तेरह साल');
  return (
    <AbsoluteFill>
      <Audio src={staticFile('assets/vo/vo_master.mp3')} />
      <Grade>
        <Map3D
          width={W}
          heightPx={H}
          riseStart={6}
          height={0.5}
          camera={[
            { frame: 0, lon: -74, lat: 39, dist: 78, tilt: 0, yaw: 0 },
            { frame: rewindAt, lon: -76.5, lat: 37.8, dist: 40, tilt: 40, yaw: -10 },
            { frame: kingAt + 40, lon: -66, lat: 38, dist: 52, tilt: 46, yaw: -4 },
          ]}
        />
      </Grade>
      <AbsoluteFill>
        <TimelineRuler
          x={W / 2}
          y={150}
          start={flagAt}
          steps={[
            { at: flagAt, labels: ['1775', '1776', '1777'] },
            { at: rewindAt, labels: ['1762', '1763', '1764'] },
            { at: yearsAt, labels: ['1769', '1770', '1771'] },
            { at: yearsAt + 40, labels: ['1775', '1776', '1777'] },
          ]}
        />
        <FlagWave start={flagAt + 6} exit={rewindAt} />
        <Sequence from={kingAt} layout="none">
          <MapCharacter
            feature={gb}
            height={760}
            path={[
              { at: 0, x: W + 500, y: H * 0.56 },
              { at: 2, x: W * 0.8, y: H * 0.56, dur: 20 },
            ]}
            moods={[[0, 'smile'], [60, 'grin']]}
            look={[[0, -1]]}
          />
        </Sequence>
      </AbsoluteFill>
      <Flash at={rewindAt} dur={10} />
      <RewindLines at={rewindAt} />
      <Finish />
    </AbsoluteFill>
  );
};

/** VHS-style rewind streaks for ~0.4 s (the reference's timeline rewind gag). */
const RewindLines: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 24) return null;
  const o = interpolate(t, [0, 4, 24], [0, 0.6, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: ((i * 263 + t * 140) % H), height: 6 + (i % 3) * 5, background: 'rgba(255,255,255,0.7)', filter: 'blur(2px)' }} />
      ))}
    </AbsoluteFill>
  );
};

export const PREVIEW_COLOR = C.colonyBlue;
