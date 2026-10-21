import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { Feature, Geometry } from 'geojson';
import { C, H, W } from '../lib/constants';
import { clamp, ease, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, DrawLine } from '../lib/map/layers';
import { PROCLAMATION_LINE } from '../lib/map/data';
import { featurePath, pathGen } from '../lib/map/geo';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, Sfx } from '../lib/fx/particles';
import { Shake } from '../lib/fx/motion';
import { MapTitle } from '../lib/fx/text';
import { Puppet, hop } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { DateCard, MapPuffs, NeonMark, PlaceDot } from './kit';

/**
 * S06 — THE 1763 LINE ON THE MOUNTAINS (8906 → 10111, 20.1 s). Parchment + strong Appalachian relief.
 *  "Native American क़बीलों"       the western frontier flashes; raid smoke at the forts (Pontiac's War, 1763)
 *  "सात October"                   date card 7 October 1763
 *  "Appalachian पहाड़ों"             push in over the mountains, relief strengthens
 *  "एक line खींच दी गई"              the Proclamation Line draws on, dashed red
 *  "कोई नई बस्ती नहीं"              everything west of it greys out + neon X
 *  "जिस ज़मीन के लिए जंग लड़ी"       three settlers hop west toward the line
 *  "उधर जाना मना है"                they bump into it and bounce back (comic)
 */

const WEST: Feature<Geometry> = {
  type: 'Feature', properties: {},
  // west of the line, out to the Mississippi; wound clockwise on screen for d3-geo
  geometry: { type: 'Polygon', coordinates: [[...PROCLAMATION_LINE, [-90, 31], [-90, 46], PROCLAMATION_LINE[0]]] },
};
// 1763 frontier forts hit in Pontiac's War
const FORTS: [number, number][] = [[-83.05, 42.33], [-80.0, 40.44], [-79.06, 43.26], [-84.73, 45.78], [-80.08, 41.94], [-82.9, 41.6]];

const WestShade: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const d = useMemo(() => featurePath(WEST), []);
  if (frame < start) return null;
  const a = ramp(frame, start, 16, ease.out);
  return <path d={d} fill="#5E5A55" opacity={0.62 * a} />;
};

/** The frontier flashes (white → fade) to say "this land is lived on". */
const FrontierFlash: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const d = useMemo(() => featurePath(WEST), []);
  if (frame < start) return null;
  const o = interpolate(frame - start, [0, 4, 34], [0, 0.32, 0], clamp);
  return <path d={d} fill="#F6E7B8" opacity={o} />;
};

/** Settlers hop west to the line, hit it, bounce back east. Screen-space, sized to the map. */
const Settlers: React.FC<{ walkAt: number; bumpAt: number }> = ({ walkAt, bumpAt }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  const [lx] = toScreen(-79.55, 39.3); // the line at this latitude
  const crew = [
    { rig: RIGS.colonist, dy: 0, delay: 0, h: 640 },
    { rig: RIGS.colonistBearded, dy: 150, delay: 8, h: 680 },
    { rig: RIGS.colonistYoung, dy: 290, delay: 16, h: 600 },
  ];
  if (frame < walkAt) return null;
  return (
    <>
      {crew.map((p, i) => {
        const [sx, sy] = toScreen(-75.4, 39.4);
        const arrive = lx + 190;
        const walk = ramp(frame, walkAt + p.delay, bumpAt - walkAt - p.delay, (t) => t);
        const bounce = ramp(frame, bumpAt + p.delay / 2, 20, ease.out);
        const x = sx + i * 200 + (arrive + i * 60 - sx - i * 200) * walk + bounce * 620;
        const y = sy + p.dy + hop(frame < bumpAt ? frame : bumpAt, walkAt + p.delay, 22, 24) - Math.sin(bounce * Math.PI) * 90;
        return (
          <Puppet key={i} rig={p.rig} x={x} y={y} height={p.h} start={walkAt + p.delay} flip seed={`st${i}`}
            moods={[[walkAt, 'smile'], [bumpAt + 2, 'shocked'], [bumpAt + 40, 'angry']]} />
        );
      })}
    </>
  );
};

export const S06Proclamation: React.FC = () => {
  const c = scene('S06_proclamation');
  const nativeAt = c.at('Native American क़बीलों');
  const dateAt = c.at('सात October');
  const mtnAt = c.at('Appalachian पहाड़ों');
  const lineAt = c.at('एक line खींच दी गई');
  const noAt = c.at('कोई नई बस्ती नहीं');
  const walkAt = c.at('जिस ज़मीन के लिए जंग लड़ी');
  const bumpAt = c.at('उधर जाना मना है');
  const lineD = useMemo(() => pathGen({ type: 'LineString', coordinates: PROCLAMATION_LINE } as never) ?? '', []);

  const camera: CamKey[] = [
    { frame: 0, lon: -52, lat: 41, span: 66 }, // S05's last framing
    { frame: 36, lon: -80.5, lat: 39.5, span: 28 },
    { frame: mtnAt, lon: -79.5, lat: 39.2, span: 22 },
    { frame: lineAt + 10, lon: -79.0, lat: 39.0, span: 18 },
    { frame: walkAt, lon: -78.6, lat: 39.2, span: 13 },
    { frame: c.duration, lon: -78.7, lat: 39.2, span: 12 },
  ];
  const reliefK = interpolate(useCurrentFrame(), [mtnAt, mtnAt + 40], [0.45, 0.85], clamp);

  return (
    <AbsoluteFill>
      <Shake hits={[bumpAt]} amp={12} dur={8}>
        <Grade look="parchment">
          <MapStage
            style="parchment"
            camera={camera}
            above={[reliefRaster('appalachians', reliefK)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.9} />
                <FrontierFlash start={nativeAt} />
                <WestShade start={noAt} />
                <DrawLine d={lineD} start={lineAt} duration={70} color={C.stampRed} width={14} dash={40} />
              </>
            }
            overlay={
              <>
                <MapPuffs points={FORTS} start={nativeAt + 10} per={9} life={dateAt + 60 - nativeAt} />
                <PlaceDot lon={-84.2} lat={43.4} label="Native Nations" start={nativeAt + 20} exit={dateAt} size={96} />
                <Settlers walkAt={walkAt} bumpAt={bumpAt} />
                <WestX start={noAt + 10} />
              </>
            }
          />
        </Grade>
      </Shake>
      <DateCard x={W * 0.72} y={H * 0.16} text="7 October 1763" start={dateAt} exit={lineAt + 120} />
      <MapTitle x={W * 0.72} y={H * 0.86} text="Proclamation Line" date="1763" start={lineAt + 30} mode="type" size={120} exit={walkAt} />

      <Sfx at={nativeAt} file="sting_hit.wav" volume={0.35} />
      {FORTS.map((_, i) => <Sfx key={i} at={nativeAt + 10 + i * 9} file="musket_shot.wav" volume={0.16} />)}
      <Sfx at={dateAt} file="pop.wav" volume={0.45} />
      <Sfx at={mtnAt} file="whoosh_soft.wav" volume={0.4} />
      <Sfx at={lineAt} file="pen_draw.wav" volume={0.5} />
      <Sfx at={noAt + 10} file="sting_hit.wav" volume={0.4} />
      {[0, 22, 44, 66, 88, 110].map((d) => <Sfx key={d} at={walkAt + d} file="click_soft.wav" volume={0.2} />)}
      <Sfx at={bumpAt} file="thud_soft.wav" volume={0.55} />
      <Sfx at={bumpAt + 4} file="pluck_down.wav" volume={0.4} />
    </AbsoluteFill>
  );
};

/** Neon X over the forbidden west. */
const WestX: React.FC<{ start: number }> = ({ start }) => {
  const { toScreen } = useMap();
  const [x, y] = toScreen(-84.5, 39.2);
  return <NeonMark x={Math.max(x, W * 0.18)} y={y} size={520} start={start} exit={start + 150} />;
};
