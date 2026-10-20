import React, { useMemo } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import type { Feature, Geometry } from 'geojson';
import { C, H, T, W } from '../lib/constants';
import { MapStage } from '../lib/map/MapStage';
import { ColonyFill, DrawLine, MapPin, NeonOutline, RegionEyes, colonyPath } from '../lib/map/layers';
import { COLONY_IDS, PLACES, PROCLAMATION_LINE, colonies } from '../lib/map/data';
import { centroidLonLat, featurePath, pathGen } from '../lib/map/geo';
import { ease, ramp } from '../lib/easing';
import { MapTitle, TimelineRuler } from '../lib/fx/text';
import { ArrowBob, PopIn, Shake, StampSlam, ZoomPunch } from '../lib/fx/motion';
import { Finish, Grade, ImpactPuff, MuzzleSmoke } from '../lib/fx/particles';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { Puppet, musketMount, mountTip } from '../lib/character/Puppet';
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
              <MapTitle x={W * 0.6} y={H * 0.84} text="Proclamation Line" date="7 October 1763" start={380} mode="type" size={120} align="left" />
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
/** Paint a country's own map shape as sea while it is out walking as a MapCharacter (never two Britains). */
const HomeHidden: React.FC<{ feature: Feature<Geometry>; start: number }> = ({ feature, start }) => {
  const frame = useCurrentFrame();
  const d = useMemo(() => featurePath(feature), [feature]);
  return <path d={d} fill={C.stageParchSea} stroke={C.stageParchSea} strokeWidth={6} opacity={ramp(frame, start, 8, ease.out)} />;
};

export const DemoBritain: React.FC = () => {
  const gb = useMemo(() => greatBritain1763(), []);
  return (
    <AbsoluteFill>
      <Shake hits={[70]}>
        <ZoomPunch start={290} to={2.2} focus={[2050, 1100]}>
          <Grade>
            <MapStage
              style="parchment"
              camera={[
                { frame: 0, lon: -40, lat: 44, span: 80 },
                { frame: 330, lon: -42, lat: 44, span: 74 },
              ]}
              world={
                <>
                  <ColonyFill start={0} per={0} color={C.parchColony} />
                  <HomeHidden feature={gb} start={10} />
                </>
              }
              overlay={
                <>
                  <MapCharacter
                    feature={gb}
                    height={1250}
                    start={10}
                    path={[
                      { at: 0, x: 3300, y: 900 },
                      { at: 100, x: 2250, y: 1080 },
                    ]}
                    moods={[[0, 'smug'], [70, 'shocked'], [100, 'smile'], [230, 'grin']]}
                    look={[[0, 0], [120, -1]]}
                    talk={[[130, 200]]}
                    glove={[
                      { at: 110, pose: 'open', angle: 205, reach: 0.75 },
                      { at: 150, pose: 'point', angle: 186, reach: 1 },
                      { at: 220, pose: 'hold', angle: 178, reach: 0.55 },
                    ]}
                    holding={{ src: staticFile('assets/docs/doc_sugar_act_1764.png'), w: 620, from: 222 }}
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
 * DEMO 3 — Boston Massacre volley, staged like the reference (f2300–2440 @30): a CLOSE-UP of three redcoats
 * in depth on the King Street plate, heads ~1/3 of the frame, cropped at the thighs. No arms are drawn: each
 * musket rests across the chest (muzzle up past the hat), swings up like a lever, and presents under the chin,
 * staggered 8 f per soldier. Snowball hit → angry brows → volley, smoke, shake.
 */
export const DemoVolley: React.FC = () => {
  const frame = useCurrentFrame();
  const fire = 200;
  const musket = staticFile('assets/props/musket_brown_bess.png');
  const rig = RIGS.redcoat;
  // drawn back → front; the front-left soldier is largest and on top, as in the reference
  // depth like ref f2300: middle soldier smaller and HIGHER (further away), front pair large and overlapping it
  const squad = [
    { x: 2050, y: 2035, height: 2050, raise: 128 }, // back, middle
    { x: 2900, y: 2595, height: 2450, raise: 136 }, // front right
    { x: 1150, y: 2600, height: 2640, raise: 120 }, // front left: largest, raises first
  ];
  const mounts = squad.map((p, i) => musketMount(rig, p.raise, musket, { recoilAt: [fire + i * 3] }));
  return (
    <AbsoluteFill style={{ background: '#0E1622' }}>
      <Shake hits={[fire]} amp={22}>
        <Grade>
          <AbsoluteFill>
            <Img
              src={staticFile('assets/bg/bg_king_street_boston_1770_night.jpg')}
              style={{ width: W, height: H, objectFit: 'cover', filter: 'blur(9px) brightness(0.92)', transform: 'scale(1.08)' }}
            />
            {squad.map((p, i) => (
              <Puppet
                key={i}
                rig={rig}
                x={p.x}
                y={p.y}
                height={p.height}
                flip
                seed={`s${i}`}
                moods={[[0, 'neutral'], [70, i === 2 ? 'shocked' : 'neutral'], [p.raise - 12, 'angry']]}
                mount={mounts[i]}
              />
            ))}
            {squad.map((p, i) => {
              const [mx, my] = mountTip(mounts[i], fire + i * 3, { ...p, flip: true, aspect: rig.aspect });
              return <MuzzleSmoke key={`m${i}`} x={mx} y={my} start={fire + i * 3} size={300} />;
            })}
            <ImpactPuff x={1180} y={360} start={70} />
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
export const DemoMap3D: React.FC<{ look?: 'classic' | 'parchment' | 'relief' | 'flat'; graded?: boolean }> = ({ look = 'classic', graded = true }) => (
  <AbsoluteFill>
    <Grade look={look === 'classic' || !graded ? undefined : look} contrast={look !== 'classic' && !graded ? 1 : undefined} saturate={look !== 'classic' && !graded ? 1 : undefined}>
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
