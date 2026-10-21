import React from 'react';
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { H, W } from '../lib/constants';
import { clamp, ease, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, RegionEyes } from '../lib/map/layers';
import { COLONY_IDS, PLACES, colonies } from '../lib/map/data';
import { centroidLonLat } from '../lib/map/geo';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, Sfx } from '../lib/fx/particles';
import { Shake, StampSlam } from '../lib/fx/motion';
import { MapTitle } from '../lib/fx/text';
import { Puppet, hop } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { Label, MapShip } from './kit';

/**
 * S10 — TOWNSHEND ACTS + TROOPS (14698 → 15355, 10.9 s). Frames LOCAL.
 *  "Townshend Acts"        the duties list slides in over the map
 *  "काँच / paint / काग़ज़ / चाय"  TAXED stamps land on Glass, Paint, Paper, Tea (Lead goes with Paint)
 *  "फिर से ग़ुस्सा"         back on the map: every colony glares
 *  "Boston में अपनी फ़ौज"   a file of redcoats marches into Boston; troop ships in the harbour
 */

// row centres on doc_townshend_list.png, as fractions of the 2048² canvas (measured)
const ROWS = { glass: 0.446, lead: 0.514, paint: 0.586, paper: 0.657, tea: 0.726 };
const ROW_X = 0.5;

const DutyList: React.FC<{ glassAt: number; paintAt: number; paperAt: number; teaAt: number; exit: number }> = ({ glassAt, paintAt, paperAt, teaAt, exit }) => {
  const frame = useCurrentFrame();
  const S = 1950;
  const cx = W * 0.5;
  const cy = H * 0.5;
  const inT = ramp(frame, 0, 14, ease.out);
  const out = ramp(frame, exit, 12, ease.in);
  const x = cx + (1 - inT) * W * 0.8 - out * W;
  const stamp = (row: number, at: number, i: number) => (
    <StampSlam key={i} x={x + S * (ROW_X + 0.3) - S / 2} y={cy + (row - 0.5) * S} w={300} h={124} start={at} rotate={-10 + i * 3}
      src={staticFile('assets/props/stamp_taxed.png')} />
  );
  return (
    <>
      <Img src={staticFile('assets/docs/doc_townshend_list.png')} style={{ position: 'absolute', left: x - S / 2, top: cy - S / 2, width: S, height: S,
        transform: `rotate(${(1 - inT) * 8}deg)`, filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.45))' }} />
      {stamp(ROWS.glass, glassAt, 0)}
      {stamp(ROWS.lead, paintAt - 6, 1)}
      {stamp(ROWS.paint, paintAt, 2)}
      {stamp(ROWS.paper, paperAt, 3)}
      {stamp(ROWS.tea, teaAt, 4)}
    </>
  );
};

/** A file of redcoats marches west along the Boston waterfront. */
const RedcoatsMarch: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const [bx, by] = toScreen(...PLACES.boston);
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => {
        const p = ramp(frame, start + i * 5, 50, ease.out);
        const x = bx + 200 - p * 1100 + i * 190;
        const y = by + 40 + hop(frame, start + i * 5, 20, 20) * (p < 1 ? 1 : 0);
        return <Puppet key={i} rig={RIGS.redcoat} x={x} y={y} height={430} start={start + i * 5} flip seed={`rc${i}`} moods={[[0, 'angry']]} idle={0} />;
      })}
    </>
  );
};

export const S10Townshend: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S10_townshend');
  const actAt = c.at('Townshend Acts');
  const glassAt = c.at('काँच');
  const paintAt = c.at('paint');
  const paperAt = c.at('काग़ज़');
  const teaAt = c.at('और चाय पर tax');
  const angryAt = c.at('फिर से ग़ुस्सा');
  const troopsAt = c.at('Boston में अपनी फ़ौज');
  const len = c.duration;

  const camera: CamKey[] = [
    { frame: 0, lon: -10, lat: 50, span: 40 },
    { frame: angryAt - 20, lon: -40, lat: 44, span: 60 },
    { frame: angryAt + 10, lon: -74, lat: 39.5, span: 28 },
    { frame: troopsAt - 10, lon: -73.5, lat: 40.0, span: 26 },
    { frame: troopsAt + 14, lon: -70.9, lat: 42.25, span: 4.2 }, // punch onto Boston
    { frame: len, lon: -70.95, lat: 42.3, span: 3.9 },
  ];
  const eyesOut = interpolate(frame, [troopsAt, troopsAt + 12], [1, 0], clamp);

  return (
    <AbsoluteFill>
      <Shake hits={[glassAt, paintAt, paperAt, teaAt]} amp={10} dur={6}>
        <Grade look="parchment">
          <MapStage style="parchment" camera={camera} above={[reliefRaster('eastcoast', 0.5), reliefRaster('massachusetts', 0.6)]}
            world={<ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />}
            overlay={
              <>
                {frame >= angryAt && eyesOut > 0 &&
                  COLONY_IDS.map((k, i) => {
                    const [lon, lat] = centroidLonLat(colonies.features.find((f) => f.properties?.id === k)!);
                    return (
                      <div key={k} style={{ opacity: eyesOut }}>
                        <RegionEyes lon={lon} lat={lat} start={angryAt + i * 2} size={['rhode-island', 'delaware'].includes(k) ? 50 : 84} mood="angry" look={-1} />
                      </div>
                    );
                  })}
                <RedcoatsMarch start={troopsAt + 18} />
                <MapShip route={[[-70.55, 42.42], [-70.9, 42.36]]} start={troopsAt + 10} dur={60} src="ship_navy_warship.png" w={620} />
                <MapShip route={[[-70.5, 42.32], [-70.86, 42.3]]} start={troopsAt + 22} dur={60} src="ship_navy_warship.png" w={540} />
              </>
            }
          />
        </Grade>
        <Sequence durationInFrames={angryAt + 12} layout="none">
          <DutyList glassAt={glassAt} paintAt={paintAt} paperAt={paperAt} teaAt={teaAt} exit={angryAt - 12} />
        </Sequence>
      </Shake>
      <MapTitle x={W * 0.5} y={H * 0.08} text="Townshend Acts" date="1767" start={actAt + 6} exit={angryAt - 12} size={120} />
      <Label x={W * 0.5} y={H * 0.12} text="Boston, 1768" start={troopsAt + 24} size={120} />

      <Sfx at={actAt} file="paper_slide.wav" volume={0.5} />
      {[glassAt, paintAt - 6, paintAt, paperAt, teaAt].map((f, i) => <Sfx key={i} at={f} file="stamp_slam.wav" volume={0.42} />)}
      <Sfx at={angryAt} file="whoosh_soft.wav" volume={0.4} />
      {COLONY_IDS.map((_, i) => <Sfx key={`e${i}`} at={angryAt + i * 2} file="pop_low.wav" volume={0.18} />)}
      <Sfx at={troopsAt} file="whoosh_fast.wav" volume={0.45} />
      <Sfx at={troopsAt + 18} file="snare_roll.wav" volume={0.35} />
    </AbsoluteFill>
  );
};
