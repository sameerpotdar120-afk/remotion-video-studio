import React, { useMemo } from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { C, H, W } from '../lib/constants';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, MapPin } from '../lib/map/layers';
import { COLONY_IDS, PLACES } from '../lib/map/data';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, Sfx } from '../lib/fx/particles';
import { Shake, StampSlam } from '../lib/fx/motion';
import { MapTitle } from '../lib/fx/text';
import { Paper3D } from '../lib/fx/depth';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { scene } from '../vo/cues';
import { Counter, DateCard, HomeHidden } from './kit';

/**
 * S14 — INTOLERABLE ACTS + FIRST CONTINENTAL CONGRESS (19806 → 20649, 14.1 s). Frames LOCAL.
 *  "Britain भड़क गया"                 Britain slides in from the east, furious (rage shake)
 *  "Intolerable Acts"                 the Acts spin in
 *  "Boston का port बंद"               punch onto Boston harbour: CLOSED slams
 *  "पाँच September"                   date card 5 September 1774
 *  "First Continental Congress"       twelve colonies fill congress-orange (Georgia sent no one: stays blue); title
 *  "छप्पन delegates"                  counter 56; delegates converge on Philadelphia
 */

const TWELVE = COLONY_IDS.filter((k) => k !== 'georgia');
const FROM: [number, number][] = [[-71.6, 43.6], [-71.8, 42.3], [-71.5, 41.7], [-72.7, 41.6], [-75.5, 42.8], [-74.5, 40.2], [-75.5, 39.0], [-76.8, 39.2], [-78.6, 37.6], [-79.4, 35.6], [-80.9, 33.8]];

const Delegates: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const [px, py] = toScreen(...PLACES.philadelphia);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      {FROM.map(([lon, lat], i) => {
        const p = Math.min(1, Math.max(0, (frame - start - i * 3) / 36));
        const e = 1 - Math.pow(1 - p, 3);
        const [x0, y0] = toScreen(lon, lat);
        return <circle key={i} cx={x0 + (px - x0) * e} cy={y0 + (py - y0) * e} r={20} fill={C.stampRed} stroke="#fff" strokeWidth={6} opacity={p < 1 ? 1 : 0} />;
      })}
    </svg>
  );
};

export const S14Intolerable: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S14_intolerable');
  const angryAt = c.at('Britain भड़क गया');
  const actsAt = c.at('Intolerable Acts');
  const closedAt = c.at('Boston का port बंद');
  const dateAt = c.at('पाँच September');
  const congressAt = c.at('First Continental Congress');
  const delegatesAt = c.at('छप्पन delegates');
  const len = c.duration;
  const gb = useMemo(() => greatBritain1763(), []);

  const camera: CamKey[] = [
    { frame: 0, lon: -71.05, lat: 42.36, span: 3 },
    { frame: 24, lon: -45, lat: 43, span: 76 },
    { frame: closedAt - 6, lon: -46, lat: 43, span: 74 },
    { frame: closedAt + 10, lon: -70.95, lat: 42.33, span: 2.4 }, // punch onto the harbour
    { frame: dateAt - 4, lon: -70.98, lat: 42.34, span: 2.3 },
    { frame: dateAt + 20, lon: -75.5, lat: 39.0, span: 22 },
    { frame: len, lon: -75.3, lat: 39.4, span: 18 },
  ];
  const britainOn = frame < closedAt + 2;

  return (
    <AbsoluteFill>
      <Shake hits={[closedAt + 10, angryAt + 34]} amp={18} dur={10}>
        <Grade look="parchment">
          <MapStage style="parchment" camera={camera} above={[reliefRaster('atlantic', 0.45), reliefRaster('massachusetts', 0.6)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />
                <ColonyFill start={congressAt} per={4} color={C.congressOrange} flash="#FFF1D6" ids={TWELVE} opacity={0.9} />
                <HomeHidden feature={gb} start={-999} />
              </>
            }
            overlay={
              <>
                {britainOn && (
                  <MapCharacter feature={gb} height={1150} start={angryAt}
                    path={[{ at: 0, x: W * 1.15, y: H * 0.5 }, { at: angryAt + 2, x: W * 0.72, y: H * 0.52, dur: 22 }]}
                    moods={[[0, 'furious']]} look={[[0, -1]]} talk={[[actsAt, closedAt]]}
                    glove={[{ at: actsAt + 4, pose: 'fist', angle: 200, reach: 0.9 }]} />
                )}
                <Delegates start={delegatesAt + 10} />
                {frame >= delegatesAt && <MapPin lon={PLACES.philadelphia[0]} lat={PLACES.philadelphia[1]} start={delegatesAt + 40} label="Philadelphia" labelSide="left" />}
              </>
            }
          />
        </Grade>
        {frame >= actsAt && frame < closedAt + 4 && (
          <Paper3D src={staticFile('assets/docs/doc_intolerable_acts.png')} x={W * 0.36} y={H * 0.5} w={1450} h={1450} start={actsAt} baseTilt={[5, 12, -3]} swing={3} />
        )}
        <StampSlam x={W * 0.5} y={H * 0.48} w={1300} h={610} start={closedAt + 10} src={staticFile('assets/props/stamp_closed.png')} exit={dateAt + 10} rotate={-6} />
      </Shake>
      <MapTitle x={W * 0.36} y={H * 0.9} text="Intolerable Acts" date="1774" start={actsAt + 10} exit={closedAt} size={120} />
      <MapTitle x={W * 0.5} y={H * 0.12} text="Boston Harbour" start={closedAt + 26} exit={dateAt + 10} size={110} mode="fade" />
      <DateCard x={W * 0.74} y={H * 0.16} text="5 September 1774" start={dateAt} exit={delegatesAt - 10} />
      <MapTitle x={W * 0.72} y={H * 0.72} text="First Continental Congress" date="Georgia: no delegates" start={congressAt + 10} exit={len - 6} size={110} />
      <Counter x={W * 0.24} y={H * 0.22} to={56} start={delegatesAt} dur={40} size={260} sub="delegates" />

      <Sfx at={angryAt} file="whoosh_fast.wav" volume={0.45} />
      <Sfx at={angryAt + 34} file="impact_boom.wav" volume={0.35} />
      <Sfx at={actsAt} file="paper_swish.wav" volume={0.5} />
      <Sfx at={closedAt} file="whoosh_big.wav" volume={0.4} />
      <Sfx at={closedAt + 10} file="stamp_slam.wav" volume={0.6} />
      <Sfx at={dateAt} file="pop.wav" volume={0.45} />
      {TWELVE.map((_, i) => <Sfx key={i} at={congressAt + i * 4} file="click_soft.wav" volume={0.25} />)}
      <Sfx at={delegatesAt} file="tick.wav" volume={0.3} />
      <Sfx at={delegatesAt + 40} file="pop.wav" volume={0.4} />
    </AbsoluteFill>
  );
};
