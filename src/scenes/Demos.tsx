import React, { useMemo } from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { C, H, T, W } from '../lib/constants';
import { MapStage } from '../lib/map/MapStage';
import { ColonyFill, DrawLine, MapPin, NeonOutline, RegionEyes, colonyPath } from '../lib/map/layers';
import { COLONY_IDS, PLACES, PROCLAMATION_LINE, colonies } from '../lib/map/data';
import { centroidLonLat, pathGen } from '../lib/map/geo';
import { MapTitle, TimelineRuler } from '../lib/fx/text';
import { ArrowBob, PopIn, Shake, StampSlam, ZoomPunch } from '../lib/fx/motion';
import { Finish, Grade, ImpactPuff, MuzzleSmoke } from '../lib/fx/particles';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { Puppet } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { Map3D } from '../lib/three/Map3D';

/**
 * DEMO 1 — the hook map beat: push-in, colonies fill N→S (white flash → blue), neon outline,
 * Boston pin, angry eyes cascade, the 1763 Proclamation Line draws on, timeline ruler.
 */
export const DemoMapHook: React.FC = () => {
  const allColonies = useMemo(() => pathGen(colonies as never) ?? '', []);
  const fillEnd = 30 + COLONY_IDS.length * T.fillPerState;
  const procD = useMemo(
    () => pathGen({ type: 'LineString', coordinates: PROCLAMATION_LINE } as never) ?? '',
    [],
  );
  return (
    <AbsoluteFill>
      <Grade>
        <MapStage
          style="parchment"
          camera={[
            { frame: 0, lon: -68, lat: 40, span: 62 },
            { frame: 70, lon: -77.5, lat: 37.2, span: 30 },
            { frame: 420, lon: -78, lat: 37, span: 27 },
          ]}
          world={
            <>
              <ColonyFill start={30} color={C.parchColony} flash="#E9F1FB" />
              <NeonOutline d={allColonies} start={fillEnd + 6} />
              <DrawLine d={procD} start={360} duration={70} color={C.stampRed} width={10} dash={34} />
            </>
          }
          overlay={
            <>
              <MapPin lon={PLACES.boston[0]} lat={PLACES.boston[1]} start={fillEnd + 40} label="Boston" date="March 5, 1770" />
              {COLONY_IDS.map((id, i) => {
                const [lon, lat] = centroidLonLat(colonies.features.find((f) => f.properties?.id === id)!);
                return <RegionEyes key={id} lon={lon} lat={lat} start={300 + i * T.stagger} size={44} mood="angry" look={i % 2 ? 1 : -1} />;
              })}
              <TimelineRuler
                x={W / 2}
                y={120}
                start={20}
                steps={[
                  { at: 20, labels: ['1775', '1776', '1777'] },
                  { at: 150, labels: ['1762', '1763', '1764'] },
                ]}
                exit={290}
              />
              <MapTitle x={W * 0.22} y={H * 0.82} text="Proclamation Line" date="7 October 1763" start={380} mode="type" size={120} align="left" />
            </>
          }
        />
      </Grade>
      <Finish />
    </AbsoluteFill>
  );
};

/**
 * DEMO 2 — Britain as a character: slides across the Atlantic, points with the glove,
 * pulls out the Sugar Act (pop + wobble), DEBT stamp slams, zoom-punch onto the paper.
 */
export const DemoBritain: React.FC = () => {
  const gb = useMemo(() => greatBritain1763(), []);
  return (
    <AbsoluteFill>
      <Shake hits={[70]}>
        <ZoomPunch start={290} to={2.6} focus={[1500, 980]}>
          <Grade>
            <MapStage
              style="parchment"
              camera={[
                { frame: 0, lon: -40, lat: 44, span: 80 },
                { frame: 330, lon: -42, lat: 44, span: 74 },
              ]}
              world={<ColonyFill start={0} per={0} color={C.parchColony} />}
              overlay={
                <>
                  <MapCharacter
                    feature={gb}
                    height={900}
                    start={10}
                    path={[
                      { at: 0, x: 3300, y: 900 },
                      { at: 100, x: 2100, y: 1000 },
                    ]}
                    moods={[[0, 'smug'], [70, 'shocked'], [100, 'smile'], [230, 'grin']]}
                    look={[[0, 0], [120, -1]]}
                    talk={[[130, 200]]}
                    glove={[
                      { at: 130, pose: 'point', angle: 190, reach: 0.9 },
                      { at: 220, pose: 'hold', angle: 200, reach: 0.7 },
                    ]}
                    holding={{ src: staticFile('assets/docs/doc_sugar_act_1764.png'), w: 340, from: 222 }}
                  />
                  <StampSlam
                    x={3000}
                    y={700}
                    w={900}
                    h={360}
                    start={40}
                    src={staticFile('assets/props/stamp_debt.png')}
                    exit={110}
                  />
                  <ArrowBob x={1000} y={700} w={420} h={210} rotate={150} start={150} src={staticFile('assets/icons/arrow_white_block.png')} exit={260} />
                </>
              }
            />
          </Grade>
        </ZoomPunch>
      </Shake>
      <Finish />
    </AbsoluteFill>
  );
};

/**
 * DEMO 3 — Boston Massacre volley: snowball hits the front soldier, muskets rise with an
 * 8-frame stagger, recoil + muzzle smoke, screen shake. Characters are cut-out puppets.
 */
export const DemoVolley: React.FC = () => {
  const soldiers = [0, 1, 2];
  const fire = 200;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#9AA3AD, #C9CED3 55%, #7D7F82)' }}>
      <Shake hits={[fire]} amp={22}>
        <Grade>
          <AbsoluteFill>
            {soldiers.map((i) => (
              <Puppet
                key={i}
                rig={RIGS.redcoat}
                x={1500 + i * 520}
                y={2050 - i * 40}
                height={1500 - i * 60}
                flip
                seed={`s${i}`}
                moods={[[0, 'neutral'], [70, i === 0 ? 'shocked' : 'neutral'], [110, 'angry']]}
                armR={[{ at: 0, angle: 80, reach: 0.55 }, { at: 120 + i * T.musketOffset, angle: 10, reach: 0.75, dur: T.musketRaise }]}
                prop={{
                  src: staticFile('assets/props/musket_brown_bess.png'),
                  hand: 'R',
                  w: 1100,
                  pivot: [0.72, 0.5],
                  angle: [
                    { at: 0, deg: -78 },
                    { at: 120 + i * T.musketOffset, deg: 0, dur: T.musketRaise },
                  ],
                  recoilAt: [fire + i * 2],
                }}
              />
            ))}
            {soldiers.map((i) => {
              // muzzle = hand position (mirrored right shoulder + arm) minus the musket length left of the grip
              const h = 1500 - i * 60;
              const left = 1500 + i * 520 - h / 2;
              const hand: [number, number] = [left + (1 - 0.64) * h - Math.cos((10 * Math.PI) / 180) * h * 0.42 * 0.75, 2050 - i * 40 - h + 0.52 * h + Math.sin((10 * Math.PI) / 180) * h * 0.42 * 0.75];
              return <MuzzleSmoke key={`m${i}`} x={hand[0] - 1100 * 0.72} y={hand[1]} start={fire + i * 2} size={260} />;
            })}
            <ImpactPuff x={1500} y={900} start={70} />
            <PopIn x={600} y={1500} w={900} h={900} start={20}>
              <Puppet rig={RIGS.colonist} x={450} y={900} height={900} talk={[[20, 60]]} moods={[[0, 'angry']]} seed="c" armR={[{ at: 20, angle: -60, reach: 0.8 }]} />
            </PopIn>
          </AbsoluteFill>
        </Grade>
      </Shake>
      <Finish />
    </AbsoluteFill>
  );
};

export const colonyD = colonyPath;

/**
 * DEMO 4 — REAL 3D map: colonies rise as extruded blocks with spring overshoot and shadows,
 * camera tilts from top-down into a dramatic oblique and slowly orbits.
 * Render: npx remotion render src/index.ts Demo-Map3D out/map3d.mp4 --gl=angle   (or --gl=swangle on CPU)
 */
export const DemoMap3D: React.FC<{ look?: 'classic' | 'parchment' | 'relief' | 'flat' }> = ({ look = 'classic' }) => (
  <AbsoluteFill>
    <Grade>
      <Map3D
        width={W}
        heightPx={H}
        look={look}
        riseStart={30}
        camera={[
          { frame: 0, lon: -76, lat: 38.5, dist: 70, tilt: 0, yaw: 0 },
          { frame: 150, lon: -77, lat: 37.5, dist: 38, tilt: 42, yaw: -12 },
          { frame: 420, lon: -76.5, lat: 38.5, dist: 30, tilt: 50, yaw: 8 },
        ]}
      />
    </Grade>
    <AbsoluteFill>
      <MapTitle x={W / 2} y={H * 0.12} text="The Thirteen Colonies" date="1775" start={250} size={150} />
    </AbsoluteFill>
    <Finish />
  </AbsoluteFill>
);
