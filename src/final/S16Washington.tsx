import React, { useMemo } from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FONTS, H, W } from '../lib/constants';
import { ease, popScale, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill } from '../lib/map/layers';
import { COLONY_IDS, colonies } from '../lib/map/data';
import { centroidLonLat } from '../lib/map/geo';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, MuzzleSmoke, PaperTear, Sfx } from '../lib/fx/particles';
import { Shake } from '../lib/fx/motion';
import { ArrowLabel, MapTitle } from '../lib/fx/text';
import { ZoomBlurIn } from '../lib/fx/transitions';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { Puppet, hop, musketMount } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { Counter, HomeHidden, Plate } from './kit';

/**
 * S16 — SECOND CONGRESS, WASHINGTON, BUNKER HILL, OLIVE BRANCH (22533 → 24244, 28.5 s). Frames LOCAL.
 *  "लौटने का रास्ता बंद"          back on the map after the black hold: slow push
 *  "Second Continental Congress"  title, 10 May 1775
 *  "पंद्रह June"                  Continental soldiers pop up across the colonies
 *  "सेनापति बना दिया गया"          General Washington (1775) + arrow label
 *  "इक्कीस साल पहले"               flashback inset: the 22-year-old from the Ohio forest (S04)
 *  "Bunker Hill"                  Breed's Hill plate: redcoats climb the slope, smoke along the redoubt
 *  "एक हज़ार से ज़्यादा"            counter: 1,000+ British killed or wounded
 *  "Olive Branch Petition"        the "Truce?" scroll beside Washington (Congress's petition), sent east
 *  "राजा ने उसे पढ़ा तक नहीं"       the scroll crosses the Atlantic; King George III tears it
 */

const Continentals: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  return (
    <>
      {COLONY_IDS.map((k, i) => {
        const [lon, lat] = centroidLonLat(colonies.features.find((f) => f.properties?.id === k)!);
        const [x, y] = toScreen(lon, lat);
        const small = ['rhode-island', 'delaware', 'connecticut', 'new-jersey'].includes(k);
        return <Puppet key={k} rig={RIGS.continental} x={x} y={y + 60} height={small ? 170 : 240} start={start + i * 4} seed={`co${i}`} moods={[[0, 'angry']]} idle={2} />;
      })}
    </>
  );
};

/** Redcoats climbing Breed's Hill; militia firing from the redoubt. */
const BunkerHill: React.FC<{ countAt: number }> = ({ countAt }) => {
  const frame = useCurrentFrame();
  const musketR = staticFile('assets/props/musket_brown_bess.png');
  const musketM = staticFile('assets/props/musket_militia.png');
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <Puppet key={`m${i}`} rig={RIGS.militia} x={W * (0.12 + i * 0.1)} y={H * 0.62} height={420} seed={`bh${i}`} moods={[[0, 'angry']]}
          mount={musketMount(RIGS.militia, 10, musketM)} />
      ))}
      {Array.from({ length: 7 }).map((_, i) => {
        const p = ramp(frame, i * 8, 300, ease.linear);
        const x = W * (0.95 - i * 0.04) - p * W * 0.25;
        const y = H * (1.02 - (i % 2) * 0.04) - p * H * 0.18 + hop(frame, i * 8, 22, 14);
        return <Puppet key={`r${i}`} rig={RIGS.redcoat} x={x} y={y} height={560 - p * 120} flip seed={`bk${i}`} moods={[[0, 'angry'], [countAt, 'shocked']]}
          mount={musketMount(RIGS.redcoat, 20 + i * 6, musketR)} />;
      })}
      {Array.from({ length: 10 }).map((_, i) => (
        <MuzzleSmoke key={`s${i}`} x={W * (0.2 + (i % 4) * 0.1)} y={H * 0.5} start={12 + i * 22} size={170} dir={1} puffs={5} />
      ))}
    </>
  );
};

/** Flashback inset: the young Washington of 1754 in a sepia circle. */
const Flashback: React.FC<{ start: number; exit: number }> = ({ start, exit }) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > exit + 10) return null;
  const s = popScale(frame, start) * (1 - ramp(frame, exit, 10, ease.in));
  const d = 900;
  return (
    <div style={{ position: 'absolute', left: W * 0.72 - d / 2, top: H * 0.42 - d / 2, width: d, height: d, borderRadius: '50%', overflow: 'hidden', border: '16px solid #F3E3C4',
      boxShadow: '0 30px 60px rgba(0,0,0,0.5)', transform: `scale(${s})`, filter: 'sepia(0.7) contrast(1.05)' }}>
      <Img src={staticFile('assets/bg/bg_forest_ohio_1754_dawn.jpg')} style={{ position: 'absolute', left: -600, top: -200, width: 2200, height: 1240, objectFit: 'cover' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: d, height: d }}>
        <Puppet rig={RIGS.washingtonYoung} x={d / 2} y={d * 1.05} height={860} seed="fb" moods={[[0, 'neutral']]} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: FONTS.serif, fontWeight: 700, fontSize: 110, color: '#fff', textShadow: '0 4px 16px rgba(0,0,0,0.7)' }}>1754</div>
    </div>
  );
};

/** The petition rides east across the Atlantic (screen-space follow of a lon/lat arc). */
const ScrollFlight: React.FC<{ start: number; dur: number }> = ({ start, dur }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start || frame > start + dur + 4) return null;
  const p = ramp(frame, start, dur, ease.inOut);
  const [x0, y0] = toScreen(-75.2, 40.0);
  const [x1, y1] = toScreen(-2.5, 51.8);
  const x = x0 + (x1 - x0) * p;
  const y = y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 420;
  return <Img src={staticFile('assets/docs/doc_olive_branch_scroll.png')} style={{ position: 'absolute', left: x - 200, top: y - 300, width: 400, transform: `rotate(${Math.sin(frame / 6) * 10}deg)` }} />;
};

export const S16Washington: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S16_washington');
  const backAt = c.at('लौटने का रास्ता बंद');
  const congressAt = c.at('Second Continental Congress');
  const juneAt = c.at('पंद्रह June');
  const generalAt = c.at('सेनापति बना दिया गया');
  const flashAt = c.at('इक्कीस साल पहले');
  const bunkerAt = c.at('Bunker Hill');
  const countAt = c.at('एक हज़ार से ज़्यादा');
  const olivAt = c.at('Olive Branch Petition');
  const kingAt = c.at('राजा ने उसे पढ़ा तक नहीं');
  const len = c.duration;
  const gb = useMemo(() => greatBritain1763(), []);

  const cam1: CamKey[] = [
    { frame: 0, lon: -75, lat: 39.5, span: 24 },
    { frame: bunkerAt, lon: -75.5, lat: 39.4, span: 21 },
  ];
  const cam2: CamKey[] = [
    { frame: 0, lon: -75.0, lat: 40.0, span: 22 },
    { frame: kingAt - olivAt - 30, lon: -74.5, lat: 40.2, span: 20 },
    { frame: kingAt - olivAt + 10, lon: -40, lat: 46, span: 80 },
    { frame: kingAt - olivAt + 60, lon: -8, lat: 51.5, span: 26 },
    { frame: len - olivAt, lon: -6, lat: 51.8, span: 22 },
  ];
  const kingLocal = kingAt - olivAt;

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* 1 · the map: congress, the army, the general */}
      <Sequence durationInFrames={bunkerAt + 6} layout="none">
        <Grade look="parchment">
          <MapStage style="parchment" camera={cam1} above={[reliefRaster('eastcoast', 0.5)]}
            world={<ColonyFill start={backAt} per={6} color="#4579AD" flash="#F4EBD3" opacity={0.92} />}
            overlay={<Continentals start={juneAt + 10} />} />
        </Grade>
        <MapTitle x={W * 0.7} y={H * 0.16} text="Second Continental Congress" date="10 May 1775" start={congressAt} exit={generalAt - 10} size={110} />
        {frame >= generalAt && (
          <>
            <Puppet rig={RIGS.washington} x={W * 0.3} y={H * 1.04} height={1500} start={generalAt} seed="gw75" look={1}
              moods={[[0, 'neutral'], [flashAt + 30, 'smile']]} />
            <ArrowLabel x={W * 0.56} y={H * 0.12} text="General George Washington" to={[W * 0.36, H * 0.34]} start={generalAt + 8} size={96} />
            <MapTitle x={W * 0.56} y={H * 0.22} text="" date="15 June 1775 · Commander-in-Chief" start={generalAt + 14} size={110} mode="fade" />
          </>
        )}
        <Flashback start={flashAt} exit={bunkerAt - 10} />
      </Sequence>

      {/* 2 · Bunker Hill */}
      <Sequence from={bunkerAt} durationInFrames={olivAt - bunkerAt} layout="none">
        <ZoomBlurIn dur={8}>
          <Shake hits={[12, 34, 56, 78, 100]} amp={10} dur={6}>
            <Grade look="relief">
              <Plate bg="bg_breeds_hill_1775.png" blur={2} camera={[{ frame: 0, x: 0, y: 0, zoom: 1.02 }, { frame: olivAt - bunkerAt, x: 60, y: 20, zoom: 1.14 }]}>
                <BunkerHill countAt={countAt - bunkerAt} />
              </Plate>
            </Grade>
          </Shake>
          <MapTitle x={W * 0.7} y={H * 0.1} text="Bunker Hill" date="17 June 1775" start={8} size={150} />
          <Counter x={W * 0.7} y={H * 0.32} to={1000} start={countAt - bunkerAt} dur={50} size={220} suffix="+" sub="British killed or wounded" />
        </ZoomBlurIn>
      </Sequence>

      {/* 3 · the Olive Branch Petition, across the ocean, torn */}
      <Sequence from={olivAt} layout="none">
        <Grade look="parchment">
          <MapStage style="parchment" camera={cam2} above={[reliefRaster('atlantic', 0.45)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />
                <HomeHidden feature={gb} start={kingLocal + 50} />
              </>
            }
            overlay={
              <>
                <ScrollFlight start={kingLocal - 30} dur={80} />
                {frame >= kingAt + 50 && (
                  <MapCharacter feature={gb} height={900} start={kingLocal + 50} path={[{ at: 0, x: W * 0.78, y: H * 0.5 }]} moods={[[0, 'smug'], [kingLocal + 80, 'angry']]} look={[[0, -1]]} />
                )}
              </>
            }
          />
        </Grade>
        {frame < kingAt - 30 && (
          <>
            <Puppet rig={RIGS.washington} x={W * 0.3} y={H * 1.04} height={1500} seed="gw75b" look={1} moods={[[0, 'worried']]} />
            <Img src={staticFile('assets/docs/doc_olive_branch_scroll.png')} style={{ position: 'absolute', left: W * 0.46, top: H * 0.24, height: 1000,
              transform: `rotate(${-6 + Math.sin(frame / 18) * 2}deg) scale(${popScale(frame, olivAt + 4)})` }} />
            <MapTitle x={W * 0.7} y={H * 0.86} text="Olive Branch Petition" date="Congress · July 1775" start={6} size={110} />
          </>
        )}
        {frame >= kingAt + 60 && (
          <>
            <Puppet rig={RIGS.kingGeorge} x={W * 0.38} y={H * 1.04} height={1500} start={kingLocal + 60} seed="kg" look={1}
              moods={[[0, 'smug'], [kingLocal + 90, 'angry']]} />
            <PaperTear x={W * 0.64} y={H * 0.48} w={560} h={840} src={staticFile('assets/docs/doc_olive_branch_scroll.png')} tearAt={kingLocal + 100} flingAt={kingLocal + 112} />
            <MapTitle x={W * 0.38} y={H * 0.1} text="King George III" start={kingLocal + 66} size={120} mode="fade" />
          </>
        )}
      </Sequence>

      <Sfx at={backAt} file="whoosh_soft.wav" volume={0.35} />
      <Sfx at={congressAt} file="sting_shimmer.wav" volume={0.3} />
      {COLONY_IDS.map((_, i) => <Sfx key={i} at={juneAt + 10 + i * 4} file="pop_low.wav" volume={0.2} />)}
      <Sfx at={generalAt} file="sting_crown.wav" volume={0.4} />
      <Sfx at={flashAt} file="rewind_tape.wav" volume={0.35} />
      <Sfx at={bunkerAt} file="whoosh_big.wav" volume={0.4} />
      {[12, 34, 56, 78, 100, 122, 144].map((d) => <Sfx key={d} at={bunkerAt + d} file="musket_shot.wav" volume={0.22} />)}
      <Sfx at={countAt} file="tick.wav" volume={0.3} />
      <Sfx at={olivAt} file="paper_slide.wav" volume={0.45} />
      <Sfx at={kingAt - 30} file="whoosh_big.wav" volume={0.4} />
      <Sfx at={kingAt + 60} file="pop.wav" volume={0.35} />
      <Sfx at={kingAt + 100} file="paper_tear.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

