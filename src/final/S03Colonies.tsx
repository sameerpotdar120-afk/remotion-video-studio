import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { Feature, Geometry } from 'geojson';
import { C, H, W } from '../lib/constants';
import { clamp, ease, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, NeonOutline, RegionEyes, colonyPath } from '../lib/map/layers';
import { COLONY_IDS, colonies, vermont } from '../lib/map/data';
import { centroidLonLat, featurePath } from '../lib/map/geo';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, Sfx } from '../lib/fx/particles';
import { PopIn, Shake, StampSlam } from '../lib/fx/motion';
import { MapTitle } from '../lib/fx/text';
import { Paper3D } from '../lib/fx/depth';
import { Puppet } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { AssetImg, asset, hasAsset } from '../lib/assets';
import { scene } from '../vo/cues';
import { HindiTitle } from './fx';

/**
 * S03 — THE 13 COLONIES (1909 → 5333, 57.1 s). Parchment map + real relief. Frames LOCAL to the scene.
 *  "शुरुआत करते हैं इन तेरह colonies"  pull-out from S02's framing; colonies ink in N→S
 *  "Atlantic के किनारे"                 neon outline along the coastal strip
 *  "New Hampshire से Georgia"           the two end labels pop
 *  "पच्चीस लाख" / "पाँच लाख अश्वेत"      two counters in the Atlantic (Indian numbering)
 *  "ये number याद रखना"                 the 5,00,000 counter pins to the top-right corner (returns in S19)
 *  "ये एक देश थे ही नहीं"               every colony gets eyes and bickers
 *  "अपना पैसा"                          three different currencies pop on three colonies
 *  "आपस में ही उलझते"                   push to New England: NY and NH glare over disputed Vermont
 *  "Benjamin Franklin"                  Franklin slides in
 *  "Join, or Die"                       the 1754 cartoon floats in (public-domain scan)
 *  "एक हो जाओ"                          the cartoon's 8 snake pieces flash on their colonies, head to tail
 *                                       (Delaware and Georgia were not in the cartoon, so they stay dark)
 *  "नहीं, शुक्रिया"                      REJECTED slams on the cartoon
 *  "Britain के ख़िलाफ़ क्या खड़े होते"    the colonies turn away from each other
 */

const id = (k: string) => colonies.features.find((f) => f.properties?.id === k) as Feature<Geometry>;
const centre = (k: string) => centroidLonLat(id(k));

// Franklin's 1754 snake, head to tail: N.E., N.Y., N.J., P., M., V., N.C., S.C.
const SNAKE: string[][] = [
  ['new-hampshire', 'massachusetts', 'rhode-island', 'connecticut'],
  ['new-york'],
  ['new-jersey'],
  ['pennsylvania'],
  ['maryland'],
  ['virginia'],
  ['north-carolina'],
  ['south-carolina'],
];

// eyes on every colony; small colonies get small eyes so they stay inside their shape
// reference f300: an eye pair is ~6% of the frame width when the colonies fill ~45% of it
const EYE_SIZE: Record<string, number> = {
  'rhode-island': 40, delaware: 40, connecticut: 56, 'new-jersey': 62, 'new-hampshire': 64, maryland: 66,
  massachusetts: 80,
};
const EYE_DEFAULT = 100;
// centroids that fall outside the visible body of the colony (or on the sea) — nudged by hand
const EYE_AT: Record<string, [number, number]> = {
  'new-york': [-75.4, 42.7],
  maryland: [-76.9, 39.45],
  massachusetts: [-71.9, 42.35],
  virginia: [-78.6, 37.6],
};
const eyeAt = (k: string): [number, number] => EYE_AT[k] ?? (centre(k) as [number, number]);

/** The cartoon's pieces flash white one by one over their colonies (world-space SVG). */
const SnakeFlash: React.FC<{ start: number; per: number }> = ({ start, per }) => {
  const frame = useCurrentFrame();
  const paths = useMemo(() => SNAKE.map((g) => g.map((k) => colonyPath(k))), []);
  return (
    <>
      {paths.map((group, i) => {
        const t = frame - (start + i * per);
        if (t < 0) return null;
        const o = interpolate(t, [0, 3, 18, 60], [0, 0.9, 0.35, 0.18], clamp);
        return group.map((d, j) => <path key={`${i}-${j}`} d={d} fill="#FFF4D6" opacity={o} />);
      })}
    </>
  );
};

/** Vermont pulses red while New York and New Hampshire glare at it. */
const VermontDispute: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  const d = useMemo(() => featurePath(vermont), []);
  if (frame < start || frame > end + 12) return null;
  const pulse = 0.35 + 0.3 * Math.abs(Math.sin((frame - start) / 7));
  const out = interpolate(frame, [end, end + 12], [1, 0], clamp);
  return <path d={d} fill={C.stampRed} opacity={pulse * out} stroke="#fff" strokeWidth={10} strokeDasharray="30 20" />;
};

/** Small white serif colony name at the colony (reference f1250), with a short leader to it. */
const ColonyLabel: React.FC<{ k: string; text: string; start: number; exit: number; dx: number; dy: number }> = ({ k, text, start, exit, dx, dy }) => {
  const { toScreen } = useMap();
  const [x, y] = toScreen(...eyeAt(k));
  return <MapTitle x={x + dx} y={y + dy} text={text} start={start} exit={exit} size={84} mode="fade" align={dx < 0 ? 'center' : 'left'} />;
};

/** Three different currencies on three colonies ("हर colony की अपनी सरकार, अपना पैसा"). */
const Currencies: React.FC<{ start: number; exit: number }> = ({ start, exit }) => {
  const { toScreen } = useMap();
  const items: [string, string][] = [
    ['massachusetts', 'props/coin_british_shilling.png'],
    ['pennsylvania', 'props/coin_spanish_dollar.png'],
    ['virginia', 'props/colonial_paper_note.png'],
  ];
  return (
    <>
      {items.map(([k, path], i) => {
        const [x, y] = toScreen(...eyeAt(k));
        return (
          <PopIn key={k} start={start + i * 10} exit={exit} x={x + 40} y={y - 190} w={300} h={300} rotate={i % 2 ? 8 : -8}>
            <AssetImg path={path} w={300} h={300} />
          </PopIn>
        );
      })}
    </>
  );
};

/** The 5,00,000 counter: big in the Atlantic, then shrinks into the top-right corner and stays (it returns in S19). */
const PinnedCounter: React.FC<{ start: number; pinAt: number }> = ({ start, pinAt }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const p = ramp(frame, pinAt, 26, ease.inOut);
  const x = interpolate(p, [0, 1], [W * 0.72, W - 400]);
  const y = interpolate(p, [0, 1], [H * 0.62, 235]);
  const size = interpolate(p, [0, 1], [230, 130]);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0 }}>
      <HindiTitle x={x} y={y} text="5,00,000" sub="अश्वेत · ज़्यादातर ग़ुलाम" start={start} size={size} color="#F2C14E" />
    </div>
  );
};

export const S03Colonies: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S03_colonies');
  const startAt = c.at('शुरुआत करते हैं इन तेरह colonies');
  const atlanticAt = c.at('Atlantic के किनारे');
  const endsAt = c.at('New Hampshire से Georgia');
  const popAt = c.at('पच्चीस लाख');
  const blackAt = c.at('पाँच लाख अश्वेत');
  const rememberAt = c.at('ये number याद रखना');
  const notCountryAt = c.at('ये एक देश थे ही नहीं');
  const moneyAt = c.at('अपना पैसा');
  const quarrelAt = c.at('आपस में ही उलझते');
  const franklinAt = c.at('Benjamin Franklin');
  const cartoonAt = c.at('Join, or Die');
  const uniteAt = c.at('एक हो जाओ');
  const noAt = c.at('नहीं, शुक्रिया');
  const backsAt = c.at('Britain के ख़िलाफ़ क्या खड़े होते');
  const sceneLen = c.duration;

  const allColonies = useMemo(() => featurePath({ type: 'FeatureCollection', features: COLONY_IDS.map(id) } as never), []);

  // camera: pull out from S02's last framing (punch-out sandwich), slow pushes, New England for the quarrel, back out
  // reference establishing shots are WIDE (f15, f50, f300): the colonies are a strip ~37% of the frame width
  const camera: CamKey[] = [
    { frame: 0, lon: -76.5, lat: 40.5, span: 12.5 },
    { frame: 50, lon: -70.0, lat: 39.5, span: 58 },
    { frame: popAt - 20, lon: -68.0, lat: 39.0, span: 50 },
    { frame: notCountryAt - 10, lon: -73.0, lat: 38.6, span: 40 },
    { frame: quarrelAt - 6, lon: -72.6, lat: 43.1, span: 9.5 },
    { frame: franklinAt - 4, lon: -70.5, lat: 39.0, span: 36 },
    { frame: cartoonAt, lon: -69.5, lat: 38.8, span: 40 },
    { frame: backsAt, lon: -72.0, lat: 38.6, span: 40 },
  ];

  // bickering: each colony glances at a neighbour and back (look ±1), angry from "एक देश थे ही नहीं"
  const look = (i: number) => {
    if (frame >= backsAt) return i % 2 ? 1 : -1; // turned away from each other
    return Math.sin(frame / 11 + i * 1.7) > 0 ? 1 : -1;
  };
  const eyesMood = (k: string): 'neutral' | 'angry' | 'worried' => {
    if (frame >= backsAt) return 'neutral';
    if (frame >= quarrelAt && frame < franklinAt && (k === 'new-york' || k === 'new-hampshire')) return 'angry';
    if (frame >= noAt) return 'worried';
    return 'angry';
  };
  const eyesOut = interpolate(frame, [sceneLen - 20, sceneLen], [1, 0], clamp);
  const franklinH = 1650;
  const cartoonIn = cartoonAt;
  const hasCartoon = hasAsset('docs/pd_join_or_die_1754.png');

  return (
    <AbsoluteFill>
      <Shake hits={[quarrelAt + 18, quarrelAt + 44, noAt]} amp={14} dur={10}>
        <Grade look="parchment">
          <MapStage
            style="parchment"
            camera={camera}
            above={[reliefRaster('na3d')]}
            world={
              <>
                {/* '#4579AD' renders as the reference's #49738A once the paper multiply and grade are applied */}
                <ColonyFill start={startAt + 8} per={14} color="#4579AD" flash="#F4EBD3" opacity={interpolate(frame, [backsAt, backsAt + 30], [0.97, 0.9], clamp)} />
                <NeonOutline d={allColonies} start={atlanticAt} hold={80} />
                <VermontDispute start={quarrelAt} end={franklinAt - 10} />
                <SnakeFlash start={uniteAt} per={18} />
              </>
            }
            overlay={
              <>
                <ColonyLabel k="new-hampshire" text="New Hampshire" start={endsAt} exit={popAt - 10} dx={150} dy={-40} />
                <ColonyLabel k="georgia" text="Georgia" start={endsAt + 30} exit={popAt - 10} dx={-40} dy={40} />
                {frame >= notCountryAt &&
                  COLONY_IDS.map((k, i) => {
                    const [lon, lat] = eyeAt(k);
                    return (
                      <div key={k} style={{ opacity: eyesOut }}>
                        <RegionEyes lon={lon} lat={lat} start={notCountryAt + i * 3} size={EYE_SIZE[k] ?? EYE_DEFAULT} look={look(i)} mood={eyesMood(k)} />
                      </div>
                    );
                  })}
                <Currencies start={moneyAt} exit={quarrelAt - 6} />
              </>
            }
          />
        </Grade>
      </Shake>

      {/* counters live in the Atlantic, then 5,00,000 pins to the corner */}
      <HindiTitle x={W * 0.72} y={H * 0.36} text="25,00,000" sub="लोग · 1775" start={popAt} exit={rememberAt + 4} size={230} />
      <PinnedCounter start={blackAt} pinAt={rememberAt} />

      {/* Franklin: slides in from the left on his name; worried at "नहीं"; looks down when they turn away */}
      <Puppet
        rig={RIGS.franklin}
        x={interpolate(ramp(frame, franklinAt, 18, ease.out), [0, 1], [-700, W * 0.17])}
        y={H + 180}
        height={franklinH}
        start={franklinAt}
        moods={[[franklinAt, 'smile'], [noAt + 6, 'shocked'], [noAt + 50, 'sad']]}
        look={1}
        seed="franklin"
      />

      {/* the 1754 cartoon (public-domain scan) + REJECTED */}
      {frame >= cartoonIn && (
        <AbsoluteFill style={{ opacity: interpolate(frame, [backsAt - 10, backsAt + 8], [1, 0], clamp) }}>
          {hasCartoon ? (
            <Paper3D src={asset('docs/pd_join_or_die_1754.png')} x={W * 0.7} y={H * 0.44} w={1300} h={900} start={cartoonIn} baseTilt={[6, -12, 3]} swing={3} />
          ) : (
            <PopIn start={cartoonIn} x={W * 0.7} y={H * 0.44} w={1300} h={900}>
              <AssetImg path="docs/pd_join_or_die_1754.png" w={1300} h={900} />
            </PopIn>
          )}
          {hasAsset('props/stamp_rejected.png') ? (
            <StampSlam x={W * 0.7} y={H * 0.5} w={980} h={420} start={noAt} src={asset('props/stamp_rejected.png')} />
          ) : (
            <PopIn start={noAt} x={W * 0.7} y={H * 0.5} w={980} h={420} rotate={-8}>
              <AssetImg path="props/stamp_rejected.png" w={980} h={420} />
            </PopIn>
          )}
        </AbsoluteFill>
      )}

      {/* ── SFX (kept under the VO: ~0.3–0.6) ── */}
      <Sfx at={0} file="whoosh_soft.wav" volume={0.45} />
      {COLONY_IDS.map((_, i) => (
        <Sfx key={`f${i}`} at={startAt + 8 + i * 14} file="click_soft.wav" volume={0.3} />
      ))}
      <Sfx at={atlanticAt} file="sting_shimmer.wav" volume={0.35} />
      <Sfx at={endsAt} file="pop.wav" volume={0.45} />
      <Sfx at={endsAt + 30} file="pop.wav" volume={0.45} />
      <Sfx at={popAt} file="sting_hit.wav" volume={0.35} />
      {Array.from({ length: 9 }).map((_, i) => (
        <Sfx key={`t${i}`} at={popAt + 2 + i * 2} file="tick.wav" volume={0.25} />
      ))}
      <Sfx at={blackAt} file="sting_hit.wav" volume={0.32} />
      <Sfx at={rememberAt} file="whoosh_soft.wav" volume={0.4} />
      <Sfx at={rememberAt + 24} file="thud_soft.wav" volume={0.4} />
      {COLONY_IDS.map((_, i) => (
        <Sfx key={`e${i}`} at={notCountryAt + i * 3} file="pop_low.wav" volume={0.22} />
      ))}
      {[0, 1, 2].map((i) => (
        <Sfx key={`c${i}`} at={moneyAt + i * 10} file="pop_high.wav" volume={0.4} />
      ))}
      <Sfx at={quarrelAt - 6} file="whoosh_fast.wav" volume={0.45} />
      <Sfx at={quarrelAt + 18} file="impact_boom.wav" volume={0.3} />
      <Sfx at={quarrelAt + 44} file="impact_boom.wav" volume={0.26} />
      <Sfx at={franklinAt} file="whoosh_fast.wav" volume={0.45} />
      <Sfx at={cartoonIn} file="paper_swish.wav" volume={0.5} />
      {SNAKE.map((_, i) => (
        <Sfx key={`s${i}`} at={uniteAt + i * 18} file="pluck_up.wav" volume={0.3} />
      ))}
      <Sfx at={noAt} file="stamp_slam.wav" volume={0.6} />
      <Sfx at={backsAt} file="pluck_down.wav" volume={0.4} />
    </AbsoluteFill>
  );
};
