import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { C, H, W } from '../lib/constants';
import { ease, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, NeonOutline } from '../lib/map/layers';
import { COLONY_IDS, colonies, country } from '../lib/map/data';
import { featurePath } from '../lib/map/geo';
import { reliefRaster } from '../lib/map/rasters';
import { greatBritain1763 } from '../lib/character/MapCharacter';
import { Grade, Sfx } from '../lib/fx/particles';
import { Fling } from '../lib/fx/motion';
import { MapTitle } from '../lib/fx/text';
import { Puppet } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { CommonSensePage, DateCard, Label, Plate, Tilted } from './kit';
import { HindiTitle } from './fx';

/**
 * S17 — COMMON SENSE, 10 JANUARY 1776 (24244 → 24998, 12.6 s). Print shop → map. Frames LOCAL.
 *  "दस January"      date card in the print shop; Thomas Paine
 *  "Common Sense"    the 1776 title page swings in (typeset from the original wording)
 *  "छोटा सा द्वीप"    the map: tiny Britain glows next to the huge continent (scale comparison)
 *  "और आग लग गई"     copies fling across the colonies; every colony flares
 */

const NorthAmerica: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const d = useMemo(() => featurePath({ type: 'FeatureCollection', features: [country('United States of America'), country('Canada'), country('Mexico')] } as never), []);
  if (frame < start) return null;
  return <path d={d} fill={C.congressOrange} opacity={0.42 + 0.14 * Math.sin((frame - start) / 9)} />;
};

const PamphletStorm: React.FC<{ start: number }> = ({ start }) => {
  const { toScreen } = useMap();
  const src = staticFile('assets/props/pamphlet_folded.png');
  return (
    <>
      {COLONY_IDS.map((k, i) => {
        const [x, y] = toScreen(-77 + (i % 4) * 1.6, 34 + i * 0.85);
        return <Fling key={k} start={start + i * 4} src={src} x={x - 300} y={y + 200} w={230} vx={14} vy={-22} g={1.4} spin={11} life={40} />;
      })}
    </>
  );
};

export const S17CommonSense: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S17_common_sense');
  const dateAt = c.at('दस January');
  const bookAt = c.at('Common Sense');
  const islandAt = c.at('छोटा सा द्वीप');
  const fireAt = c.at('और आग लग गई');
  const len = c.duration;
  const gb = useMemo(() => featurePath(greatBritain1763()), []);
  const allCol = useMemo(() => featurePath({ type: 'FeatureCollection', features: colonies.features } as never), []);

  const camera: CamKey[] = [
    { frame: 0, lon: -55, lat: 42, span: 130 },
    { frame: fireAt - islandAt - 10, lon: -53, lat: 42, span: 124 },
    { frame: fireAt - islandAt + 16, lon: -75, lat: 39, span: 26 },
    { frame: len - islandAt, lon: -75.5, lat: 39, span: 24 },
  ];

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence durationInFrames={islandAt + 4} layout="none">
        <Grade look="relief">
          <Plate bg="bg_print_shop_1765.jpg" blur={6} camera={[{ frame: 0, x: 0, y: 0, zoom: 1.03 }, { frame: islandAt, x: -60, y: 0, zoom: 1.12 }]}>
            <Puppet rig={RIGS.paine} x={W * 0.26} y={H * 1.03} height={1500} seed="paine" look={1} moods={[[0, 'neutral'], [bookAt + 20, 'smile']]} talk={[[bookAt + 30, islandAt - 10]]} />
          </Plate>
        </Grade>
        <DateCard x={W * 0.26} y={H * 0.12} text="10 January 1776" start={dateAt} />
        <Tilted start={bookAt} x={W * 0.64} y={H * 0.5}>
          <CommonSensePage w={1200} />
        </Tilted>
        <MapTitle x={W * 0.26} y={H * 0.26} text="Thomas Paine" start={dateAt + 20} size={110} mode="fade" />
      </Sequence>
      <Sequence from={islandAt} layout="none">
        <Grade look="parchment">
          <MapStage style="parchment" camera={camera} above={[reliefRaster('atlantic', 0.45)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />
                <NorthAmerica start={10} />
                <path d={gb} fill={C.britainRed} opacity={ramp(frame - islandAt, 10, 10, ease.out)} />
                <ColonyFill start={fireAt - islandAt + 20} per={3} color="#F0A23A" flash="#FFF1D6" opacity={0.9} />
                <NeonOutline d={allCol} start={fireAt - islandAt + 60} hold={120} color="#FFD36A" />
              </>
            }
            overlay={<PamphletStorm start={fireAt - islandAt + 4} />}
          />
        </Grade>
        <Label x={W * 0.82} y={H * 0.22} text="छोटा सा द्वीप" start={14} exit={fireAt - islandAt} size={110} />
        <Label x={W * 0.3} y={H * 0.5} text="पूरा महाद्वीप" start={34} exit={fireAt - islandAt} size={110} color={C.dateYellow} />
        <HindiTitle x={W * 0.5} y={H * 0.12} text="1,00,000+ copies" sub="कुछ ही महीनों में" start={fireAt - islandAt + 40} size={150} />
      </Sequence>

      <Sfx at={dateAt} file="pop.wav" volume={0.4} />
      <Sfx at={bookAt} file="paper_swish.wav" volume={0.5} />
      <Sfx at={islandAt} file="whoosh_soft.wav" volume={0.4} />
      <Sfx at={islandAt + 10} file="pop_low.wav" volume={0.4} />
      <Sfx at={fireAt} file="whoosh_big.wav" volume={0.4} />
      {COLONY_IDS.map((_, i) => <Sfx key={i} at={fireAt + 4 + i * 4} file="paper_slide.wav" volume={0.16} />)}
      <Sfx at={fireAt + 60} file="sting_shimmer.wav" volume={0.35} />
    </AbsoluteFill>
  );
};
