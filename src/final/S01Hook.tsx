import React, { useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, interpolateColors, staticFile, useCurrentFrame } from 'remotion';
import type { Feature, Geometry } from 'geojson';
import { C, H, W } from '../lib/constants';
import { clamp, ease, popScale, ramp, wobble } from '../lib/easing';
import { Map3D, screenOf3D, type Cam3DKey } from '../lib/three/Map3D';
import { TimelineRuler } from '../lib/fx/text';
import { Grade, Sfx } from '../lib/fx/particles';
import { Flash } from '../lib/fx/transitions';
import { DropIn, PopIn, Shake } from '../lib/fx/motion';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { centroidLonLat } from '../lib/map/geo';
import { colonies } from '../lib/map/data';
import { scene } from '../vo/cues';
import { Firework, FloatHearts, HindiTitle, RewindLines, ScreenEyes, YearFlip } from './fx';

/**
 * S01 — HOOK (0 → 962, 16.0 s). 3D map.
 *  "आपको बताया गया"        colonies rise one by one in 3D (N→S), camera tilts from top view
 *  "आज़ादी के लिए"          Grand Union flag swings in, fireworks over the coast, timeline 1776
 *  "सत्रह सौ तिरसठ में यही"  VHS rewind → 1763: sepia, colonies turn British red
 *  "राजा से प्यार"          Britain slides in, crown drops on, colonies get heart-eyes
 *  "तेरह साल"              year counter flips 1763 → 1776, camera orbits, tension
 *  "बंदूक उठा ली"           eyes go angry, colonies flash back to blue, muskets pop up
 *  "जान की बाज़ी"           camera punch-in + shake + heartbeat, red pulse
 */
const ID = (id: string) => colonies.features.find((f) => f.properties?.id === id) as Feature<Geometry>;
const FACES = ['massachusetts', 'new-york', 'pennsylvania', 'virginia', 'north-carolina', 'south-carolina'].map((id) => centroidLonLat(ID(id)));
// small corrections so eyes sit on the visible body of each colony (NY centroid is far inland)
FACES[1] = [-75.2, 42.6];

const Z = 0.62; // top of the extruded colonies

const GrandUnionFlag: React.FC<{ start: number; exit: number }> = ({ start, exit }) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > exit + 20) return null;
  const s = popScale(frame, start);
  const out = ramp(frame, exit, 16, ease.in);
  const sway = Math.sin(frame / 9) * 5;
  return (
    <div style={{ position: 'absolute', left: W * 0.62, top: H * 0.2 + out * H * 0.9, width: 1100,
      transform: `perspective(1600px) rotateY(${-22 + sway}deg) rotateZ(${-5 + sway / 3 + out * 25}deg) scale(${s})`,
      transformOrigin: '0% 50%', opacity: 1 - out }}>
      {/* pole */}
      <div style={{ position: 'absolute', left: -26, top: -40, width: 22, height: 1400, borderRadius: 11,
        background: 'linear-gradient(90deg, #6B4A2B, #C49A64 45%, #5A3B20)' }} />
      <Img src={staticFile('assets/flags/grand_union_1775.png')} style={{ width: 1100, display: 'block',
        boxShadow: '0 40px 80px rgba(0,0,0,0.45)', clipPath: `polygon(0 0, 100% ${2 + sway * 0.4}%, 100% ${98 + sway * 0.4}%, 0 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'multiply',
        background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) ${30 + sway * 3}%, rgba(0,0,0,0) ${55 + sway * 3}%, rgba(0,0,0,0.18) 85%)` }} />
    </div>
  );
};

export const S01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S01_hook');
  const gb = useMemo(() => greatBritain1763(), []);
  const flagAt = c.at('आज़ादी के लिए'); // 112
  const rewindAt = c.at('सत्रह सौ तिरसठ में यही'); // 256
  const kingAt = c.at('राजा से प्यार'); // 399
  const yearsAt = c.at('तेरह साल'); // 548
  const gunAt = c.at('बंदूक उठा ली'); // 783
  const lifeAt = c.at('जान की बाज़ी'); // 860

  const cam: Cam3DKey[] = [
    { frame: 0, lon: -74.5, lat: 39.5, dist: 50, tilt: 0, yaw: 0 },
    { frame: flagAt + 60, lon: -75.5, lat: 37.6, dist: 52, tilt: 34, yaw: -8 },
    { frame: rewindAt + 20, lon: -76, lat: 37.6, dist: 46, tilt: 40, yaw: -12 },
    { frame: kingAt + 40, lon: -70.5, lat: 37.4, dist: 50, tilt: 46, yaw: -4 },
    { frame: gunAt, lon: -73.5, lat: 37.8, dist: 42, tilt: 50, yaw: 8 },
    { frame: lifeAt, lon: -74.2, lat: 38.4, dist: 40, tilt: 52, yaw: 9 },
    { frame: lifeAt + 12, lon: -74.4, lat: 39.4, dist: 27, tilt: 56, yaw: 10 }, // PUNCH
    { frame: 990, lon: -74.5, lat: 39.6, dist: 24, tilt: 57, yaw: 11 },
  ];
  // patriot blue → (rewind) British red → (guns) back to blue
  const colonyColor = interpolateColors(
    frame,
    [rewindAt, rewindAt + 8, gunAt, gunAt + 10],
    [C.colonyBlue, '#C8423F', '#C8423F', C.colonyBlue],
  );
  const sepia = interpolate(frame, [rewindAt, rewindAt + 8, yearsAt + 120, gunAt], [0, 0.55, 0.4, 0], clamp);
  const pulse = frame >= lifeAt ? Math.max(0, Math.sin(((frame - lifeAt) / 26) * Math.PI)) * interpolate(frame, [lifeAt, 962], [0.35, 0.1], clamp) : 0;
  const scr = (lon: number, lat: number) => screenOf3D(cam, frame, lon, lat, Z, W, H);

  return (
    <AbsoluteFill style={{ background: C.parchSea }}>
      <Shake hits={[lifeAt, lifeAt + 26]} amp={26} dur={14}>
        <Grade contrast={1.06} saturate={1.1 - sepia * 0.6}>
          <AbsoluteFill style={{ filter: sepia > 0 ? `sepia(${sepia})` : undefined }}>
            <Map3D width={W} heightPx={H} riseStart={6} height={0.55} camera={cam} colonyColor={colonyColor} />
          </AbsoluteFill>
        </Grade>

        {/* fireworks over the coast for "आज़ादी" */}
        {[
          { s: flagAt - 30, x: W * 0.3, y: H * 0.26, c: '#FFD84A' },
          { s: flagAt - 6, x: W * 0.47, y: H * 0.18, c: '#FF5468' },
          { s: flagAt + 22, x: W * 0.2, y: H * 0.38, c: '#9FD3FF' },
          { s: flagAt + 50, x: W * 0.4, y: H * 0.3, c: '#FFFFFF' },
        ].map((f) => (
          <Firework key={f.s} start={f.s} x={f.x} y={f.y} color={f.c} />
        ))}
        <GrandUnionFlag start={flagAt + 4} exit={rewindAt} />
        <HindiTitle x={W * 0.3} y={H * 0.78} text="आज़ादी" sub="4 JULY 1776" start={flagAt + 2} exit={rewindAt - 4} size={230} />

        {/* 1763: heart-eyes on the colonies, Britain + crown */}
        {FACES.map(([lon, lat], i) => {
          const [x, y] = scr(lon, lat);
          return (
            <React.Fragment key={i}>
              <ScreenEyes x={x} y={y - 30} start={kingAt + 20 + i * 4} size={58} look={1}
                mood={frame < gunAt ? 'love' : 'angry'} />
              <FloatHearts x={x} y={y - 80} start={kingAt + 34 + i * 6} count={3} exit={yearsAt + 40} />
            </React.Fragment>
          );
        })}
        <MapCharacter
          feature={gb}
          height={820}
          start={kingAt}
          path={[
            { at: kingAt, x: W + 600, y: H * 0.55 },
            { at: kingAt + 2, x: W * 0.82, y: H * 0.55, dur: 24 },
          ]}
          moods={[[kingAt, 'smile'], [kingAt + 70, 'grin'], [yearsAt + 60, 'smug'], [gunAt + 4, 'shocked'], [lifeAt + 30, 'angry']]}
          look={[[kingAt, -1]]}
        />
        <Crown start={kingAt + 34} x={W * 0.82 - 110} y={H * 0.55 - 360} />

        {/* 13 years */}
        <YearFlip x={W * 0.5} y={H * 0.82} from={1763} to={1776} start={yearsAt} per={17} exit={gunAt - 6} />
        <HindiTitle x={W * 0.5} y={H * 0.82} text="सिर्फ़ 13 साल" start={yearsAt + 13 * 17 + 4} exit={gunAt + 70} size={170} color="#fff" />

        {/* guns up */}
        {[2, 3, 5].map((k, i) => {
          const [x, y] = scr(FACES[k][0], FACES[k][1]);
          return <PopIn key={k} start={gunAt + 6 + i * 8} x={x - 30} y={y - 210} w={460} rotate={-34 + i * 8} src={staticFile('assets/props/musket_militia.png')} />;
        })}

        <TimelineRuler
          x={W / 2}
          y={110}
          start={flagAt}
          exit={yearsAt - 10}
          steps={[
            { at: flagAt, labels: ['1775', '1776', '1777'] },
            { at: rewindAt, labels: ['1762', '1763', '1764'] },
          ]}
        />
      </Shake>

      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(120,0,0,0) 40%, rgba(120,0,0,${pulse}) 100%)` }} />
      <Flash at={rewindAt} dur={10} />
      <RewindLines at={rewindAt} />

      {/* ── SFX ── */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <Sfx key={i} at={6 + i * 14} file="pop_low.wav" volume={0.35} />
      ))}
      <Sfx at={0} file="whoosh_soft.wav" volume={0.5} />
      {[flagAt - 30, flagAt - 6, flagAt + 22, flagAt + 50].map((s) => (
        <Sfx key={s} at={s} file="firework.wav" volume={0.5} />
      ))}
      <Sfx at={flagAt + 2} file="whoosh_fast.wav" volume={0.6} />
      <Sfx at={rewindAt - 8} file="rewind_tape.wav" volume={0.75} />
      <Sfx at={kingAt} file="whoosh_big.wav" volume={0.55} />
      <Sfx at={kingAt + 34 + 12} file="sting_shimmer.wav" volume={0.5} />
      {FACES.map((_, i) => (
        <Sfx key={i} at={kingAt + 20 + i * 4} file="pop_high.wav" volume={0.3} />
      ))}
      {Array.from({ length: 13 }).map((_, i) => (
        <Sfx key={i} at={yearsAt + i * 17} file="tick.wav" volume={0.7} />
      ))}
      <Sfx at={yearsAt + 13 * 17} file="stamp_slam.wav" volume={0.5} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} at={gunAt + 6 + i * 8} file="musket_cock.wav" volume={0.8} />
      ))}
      <Sfx at={lifeAt - 2} file="impact_boom.wav" volume={0.7} />
      <Sfx at={lifeAt + 4} file="heartbeat_low.wav" volume={0.9} />
      <Sfx at={lifeAt + 56} file="heartbeat_low.wav" volume={0.7} />
      <Sfx at={952} file="whoosh_big.wav" volume={0.55} />
    </AbsoluteFill>
  );
};

/** Golden crown drops onto Britain's head and keeps bobbing with it. */
const Crown: React.FC<{ start: number; x: number; y: number }> = ({ start, x, y }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  return (
    <div style={{ position: 'absolute', left: 0, top: wobble('mc', frame, 3, 0.05) }}>
      <DropIn start={start} src={staticFile('assets/props/crown_gold.png')} x={x} y={y} w={330} fall={12} spin={-20} rotate={12} />
    </div>
  );
};
