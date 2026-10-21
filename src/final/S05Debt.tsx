import React, { useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from 'remotion';
import type { Feature, Geometry } from 'geojson';
import { C, H, W } from '../lib/constants';
import { clamp, ease, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, Territory } from '../lib/map/layers';
import { country } from '../lib/map/data';
import { featurePath } from '../lib/map/geo';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, Sfx } from '../lib/fx/particles';
import { ArrowBob, DropIn, Shake, StampSlam } from '../lib/fx/motion';
import { MapTitle } from '../lib/fx/text';
import { Paper3D } from '../lib/fx/depth';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { scene } from '../vo/cues';
import { HindiTitle } from './fx';

/**
 * S05 — BRITAIN WINS, BRITAIN IS BROKE (7620 → 8906, 21.4 s). Parchment Atlantic. Frames LOCAL to the scene.
 *  "Britain जीत गया"          Britain stands up off the map as a character, smug; a crown drops on it
 *  "Treaty of Paris"          the 1763 treaty floats in (Paper3D)
 *  "France ने Canada"          Canada smash-fills British red
 *  "छोटी सी दिक़्क़त"           Britain's smile drops
 *  "बहुत महँगी"               coins pour out of the bottom of Britain
 *  "क़र्ज़ लगभग दोगुना"         the DEBT stamp comes down on its wooden handle and slams onto Britain; "क़र्ज़ : दोगुना"
 *  "ये bill भरेगा कौन"         eye-darts left/right
 *  "जवाब था, colonies"        Britain slides across the Atlantic and points its glove at the colonies; arrow bobs
 */

/** Paint a country's own map shape as sea while it is out walking as a MapCharacter (never two Britains). */
const HomeHidden: React.FC<{ feature: Feature<Geometry>; start: number }> = ({ feature, start }) => {
  const frame = useCurrentFrame();
  const d = useMemo(() => featurePath(feature), [feature]);
  return <path d={d} fill={C.stageParchSea} stroke={C.stageParchSea} strokeWidth={6} opacity={ramp(frame, start, 8, ease.out)} />;
};

/** Silver shillings drop out of Britain's bottom edge, one after another, and fall out of frame. */
const CoinDrain: React.FC<{ start: number; end: number; x: number; y: number }> = ({ start, end, x, y }) => {
  const frame = useCurrentFrame();
  const src = staticFile('assets/props/coin_british_shilling.png');
  const coins = Math.floor((end - start) / 5);
  return (
    <>
      {Array.from({ length: coins }).map((_, i) => {
        const t = frame - (start + i * 5);
        if (t < 0 || t > 70) return null;
        const dx = (random(`cx${i}`) - 0.5) * 260;
        const vx = (random(`cv${i}`) - 0.5) * 6;
        const s = 150 + random(`cs${i}`) * 70;
        const yy = y + 0.5 * 1.9 * t * t;
        return (
          <Img key={i} src={src} style={{
            position: 'absolute', left: x + dx + vx * t - s / 2, top: yy - s / 2, width: s, height: s,
            transform: `rotate(${(random(`cr${i}`) - 0.5) * 40 + t * 9}deg) scaleX(${0.6 + 0.4 * Math.abs(Math.cos(t / 4))})`,
          }} />
        );
      })}
    </>
  );
};

/** Screen position of Britain over time: home (east) → mid-Atlantic, facing the colonies. */
const britainPath = (slideAt: number) => [
  { at: 0, x: W * 0.8, y: H * 0.44 },
  { at: slideAt, x: W * 0.6, y: H * 0.64, dur: 34 },
];

export const S05Debt: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S05_debt');
  const winAt = c.at('Britain जीत गया');
  const treatyAt = c.at('Treaty of Paris');
  const canadaAt = c.at('France ने Canada');
  const problemAt = c.at('छोटी सी दिक़्क़त');
  const costAt = c.at('बहुत महँगी');
  const debtAt = c.at('क़र्ज़ लगभग दोगुना');
  const billAt = c.at('ये bill भरेगा कौन');
  const answerAt = c.at('जवाब था, colonies');
  const len = c.duration;
  const gb = useMemo(() => greatBritain1763(), []);
  const canada = useMemo(() => country('Canada'), []);
  const gbH = 1150;

  // Atlantic framing: colonies at the left edge, Britain on the right; punch-out from S04's world, slow drift
  const camera: CamKey[] = [
    { frame: 0, lon: 10, lat: 30, span: 150 },
    { frame: 30, lon: -38, lat: 46, span: 86 },
    { frame: answerAt - 4, lon: -42, lat: 45, span: 82 },
    { frame: answerAt + 30, lon: -50, lat: 42, span: 70 }, // push toward the colonies as Britain points
    { frame: len, lon: -52, lat: 41, span: 66 },
  ];
  const stampLand = debtAt + 22; // handle wind-up + 6

  return (
    <AbsoluteFill>
      <Shake hits={[stampLand, canadaAt]} amp={16} dur={10}>
        <Grade look="parchment">
          <MapStage
            style="parchment"
            camera={camera}
            above={[reliefRaster('atlantic', 0.45)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />
                <Territory feature={canada} start={canadaAt} to={C.britainRed} mode="smash" opacity={0.85} />
                <HomeHidden feature={gb} start={winAt + 2} />
              </>
            }
            overlay={<BritainActor gb={gb} gbH={gbH} {...{ winAt, problemAt, costAt, debtAt, billAt, answerAt, stampLand, len }} />}
          />
        </Grade>
      </Shake>
      {/* the treaty, left of Britain; leaves before Canada changes hands so the fill reads */}
      {frame >= treatyAt && frame < canadaAt + 60 && (
        <AbsoluteFill style={{ opacity: interpolate(frame, [canadaAt + 40, canadaAt + 60], [1, 0], clamp) }}>
          <Paper3D src={staticFile('assets/docs/doc_treaty_of_paris_1763.png')} x={W * 0.5} y={H * 0.48} w={820} h={1150} start={treatyAt} baseTilt={[6, 12, -4]} swing={3} />
          <MapTitle x={W * 0.5} y={H * 0.9} text="Treaty of Paris" date="10 February 1763" start={treatyAt + 6} size={110} />
        </AbsoluteFill>
      )}
      <MapTitle x={W * 0.2} y={H * 0.12} text="Canada" date="France → Britain" start={canadaAt + 4} exit={problemAt} size={120} mode="fade" />
      <HindiTitle x={W * 0.5} y={H * 0.14} text="क़र्ज़ : दोगुना" start={stampLand + 10} exit={billAt + 30} size={190} color="#FFF4E0" />

      {/* ── SFX (under VO) ── */}
      <Sfx at={0} file="whoosh_soft.wav" volume={0.4} />
      <Sfx at={winAt + 4} file="pop_low.wav" volume={0.45} />
      <Sfx at={winAt + 26} file="sting_crown.wav" volume={0.45} />
      <Sfx at={treatyAt} file="paper_swish.wav" volume={0.5} />
      <Sfx at={canadaAt} file="sting_hit.wav" volume={0.45} />
      <Sfx at={problemAt} file="pluck_down.wav" volume={0.4} />
      {Array.from({ length: 12 }).map((_, i) => (
        <Sfx key={i} at={costAt + 4 + i * 10} file="tick.wav" volume={0.22} />
      ))}
      <Sfx at={debtAt} file="whoosh_soft.wav" volume={0.35} />
      <Sfx at={stampLand} file="stamp_slam.wav" volume={0.6} />
      <Sfx at={billAt} file="pluck_up.wav" volume={0.3} />
      <Sfx at={billAt + 18} file="pluck_up.wav" volume={0.3} />
      <Sfx at={answerAt} file="whoosh_fast.wav" volume={0.45} />
      <Sfx at={answerAt + 34} file="pop.wav" volume={0.4} />
    </AbsoluteFill>
  );
};

const BritainActor: React.FC<{
  gb: Feature<Geometry>; gbH: number; winAt: number; problemAt: number; costAt: number; debtAt: number;
  billAt: number; answerAt: number; stampLand: number; len: number;
}> = ({ gb, gbH, winAt, problemAt, costAt, debtAt, billAt, answerAt, stampLand, len }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  const path = britainPath(answerAt);
  const atHome = frame < answerAt;
  const [cx, cy] = [path[0].x, path[0].y];
  const [colX, colY] = toScreen(-75, 39);
  // eye-darts on "ये bill भरेगा कौन": left, right, left, then lock on the colonies
  const dart: [number, number][] = [[0, -1], [winAt + 40, 0], [billAt, -1], [billAt + 16, 1], [billAt + 32, -1], [billAt + 48, 1], [answerAt, -1]];
  return (
    <>
      <MapCharacter
        feature={gb}
        height={gbH}
        start={winAt}
        path={path}
        moods={[[winAt, 'smug'], [problemAt, 'worried'], [costAt, 'shocked'], [stampLand + 4, 'sad'], [billAt, 'worried'], [answerAt + 20, 'grin']]}
        look={dart}
        talk={[[answerAt + 40, len - 10]]}
        glove={[
          { at: answerAt + 20, pose: 'open', angle: 200, reach: 0.7 },
          { at: answerAt + 36, pose: 'point', angle: 188, reach: 1 },
        ]}
      />
      {/* crown drops onto Britain's head on the win, falls off on the debt */}
      {frame < stampLand + 2 && (
        <DropIn start={winAt + 18} src={staticFile('assets/props/crown_gold.png')} x={cx + 60} y={cy - gbH * 0.4} w={300} h={300} rotate={-8} />
      )}
      {atHome && <CoinDrain start={costAt + 4} end={debtAt + 30} x={cx - 40} y={cy + gbH * 0.42} />}
      <StampSlam x={cx - 10} y={cy + gbH * 0.26} w={720} h={340} start={debtAt} src={staticFile('assets/props/stamp_debt.png')}
        handleSrc={staticFile('assets/props/stamp_handle_wood.png')} exit={answerAt - 6} />
      <ArrowBob x={colX + 420} y={colY - 260} w={480} h={240} rotate={150} start={answerAt + 40} src={staticFile('assets/icons/arrow_white_block.png')} />
      <MapTitle x={colX} y={colY + 360} text="13 Colonies" start={answerAt + 46} size={110} mode="fade" />
    </>
  );
};
