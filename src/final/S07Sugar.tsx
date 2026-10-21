import React, { useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, H, W } from '../lib/constants';
import { clamp, ease, popScale, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill } from '../lib/map/layers';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, Sfx } from '../lib/fx/particles';
import { PopIn } from '../lib/fx/motion';
import { MapTitle, StrikeThrough } from '../lib/fx/text';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { scene } from '../vo/cues';
import { HindiTitle } from './fx';
import { HomeHidden, Label, MapShip, NeonMark, PriceTag, Punch } from './kit';

/**
 * S07 — SUGAR ACT 1764 (10111 → 11690, 26.3 s). Parchment Atlantic → the coast → Atlantic. Frames LOCAL.
 *  "फिर आया Sugar Act"            Britain (west of home, mid-Atlantic) holds up the Sugar Act; punch-in on the paper
 *  "tax बढ़ाया नहीं, घटाया"         a molasses barrel with a "6d" price tag
 *  "छह pence से सीधा तीन pence"     6d struck through, "3d" pops
 *  "सब smuggling"                  little brigs sneak along the coast at night-blue
 *  "Navy सख़्ती से वसूली"           Royal Navy frigates circle the coast
 *  "jury ही नहीं"                  courthouse icon, "Jury" label + neon X
 *  "जेब तक पहुँच गया"              Britain's arm stretches across the ocean into Massachusetts and pulls out a coin (gag)
 */

const COAST_SMUGGLE: [number, number][][] = [
  [[-66, 36], [-70.4, 41.2], [-70.9, 42.3]],
  [[-66, 33], [-73.5, 39.5], [-74.0, 40.6]],
  [[-68, 31], [-75.3, 37.0], [-76.3, 38.9]],
];
// navy patrol loop just off the coast, Maine → Carolinas → back
const PATROL: [number, number][] = [[-67.5, 44], [-69.5, 41.2], [-72.5, 39.8], [-74.5, 37.5], [-75.0, 35.0], [-73.0, 34.5], [-70.5, 37.5], [-68.0, 40.5], [-67.5, 44]];

const MolassesDeal: React.FC<{ tagAt: number; cutAt: number; exit: number }> = ({ tagAt, cutAt, exit }) => {
  const frame = useCurrentFrame();
  if (frame < tagAt - 10 || frame > exit + 12) return null;
  const out = 1 - ramp(frame, exit, 10, ease.in);
  const bx = W * 0.3;
  const by = H * 0.56;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <PopIn start={tagAt - 10} x={bx} y={by} w={900} h={900}>
        <Img src={staticFile('assets/props/molasses_barrel.png')} style={{ width: 900, height: 900, objectFit: 'contain' }} />
      </PopIn>
      <Label x={bx} y={by + 520} text="Molasses" start={tagAt} size={90} />
      <PriceTag x={bx + 560} y={by - 220} text="6d" start={tagAt} size={190} />
      <StrikeThrough x={bx + 470} y={by - 220} w={260} start={cutAt} width={18} />
      <PriceTag x={bx + 760} y={by + 60} text="3d" start={cutAt + 16} size={220} rotate={8} />
      <Label x={bx + 560} y={by - 40} text="per gallon" start={tagAt + 10} size={70} />
    </AbsoluteFill>
  );
};

const Jury: React.FC<{ at: number; exit: number }> = ({ at, exit }) => {
  const { toScreen } = useMap();
  const [x, y] = toScreen(-71.06, 42.36);
  return (
    <>
      <PopIn start={at} exit={exit} x={x + 520} y={y + 60} w={560} h={560}>
        <Img src={staticFile('assets/icons/courthouse_icon.png')} style={{ width: 560, height: 560 }} />
      </PopIn>
      <Label x={x + 520} y={y + 420} text="Jury" start={at + 8} exit={exit} size={110} />
      <NeonMark x={x + 520} y={y + 420} size={300} start={at + 26} exit={exit} />
      <Label x={x + 520} y={y - 300} text="Admiralty Court" start={at + 40} exit={exit} size={84} color={C.dateYellow} />
    </>
  );
};

/** A coin pops out of Massachusetts into Britain's glove and rides back with it. */
const PocketCoin: React.FC<{ at: number; britain: [number, number] }> = ({ at, britain }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < at) return null;
  const [mx, my] = toScreen(-71.8, 42.4);
  const back = ramp(frame, at + 34, 26, ease.inOut);
  const x = mx + (britain[0] - 300 - mx) * back;
  const y = my - 160 * popScale(frame, at) + (britain[1] - my) * back;
  return <Img src={staticFile('assets/props/coin_british_shilling.png')} style={{ position: 'absolute', left: x - 110, top: y - 110, width: 220, height: 220, transform: `rotate(${frame * 6}deg)` }} />;
};

export const S07Sugar: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S07_sugar');
  const actAt = c.at('फिर आया Sugar Act');
  const tagAt = c.at('tax बढ़ाया नहीं, घटाया');
  const cutAt = c.at('छह pence से सीधा तीन pence');
  const smuggleAt = c.at('सब smuggling');
  const navyAt = c.at('Navy सख़्ती से वसूली');
  const juryAt = c.at('jury ही नहीं');
  const pocketAt = c.at('जेब तक पहुँच गया');
  const len = c.duration;
  const gb = useMemo(() => greatBritain1763(), []);
  const gbAt: [number, number] = [W * 0.74, H * 0.5];

  const camera: CamKey[] = [
    { frame: 0, lon: -78.7, lat: 39.2, span: 12 }, // S06's last framing
    { frame: 30, lon: -40, lat: 44, span: 82 },
    { frame: smuggleAt - 14, lon: -42, lat: 43, span: 78 },
    { frame: smuggleAt + 14, lon: -71.5, lat: 39.5, span: 22 },
    { frame: juryAt + 120, lon: -71.0, lat: 40.0, span: 20 },
    { frame: pocketAt - 20, lon: -71.0, lat: 40.0, span: 20 },
    { frame: pocketAt + 10, lon: -42, lat: 43, span: 80 },
    { frame: len, lon: -44, lat: 43, span: 76 },
  ];
  const britainOn = frame < smuggleAt + 6 || frame >= pocketAt + 4;

  return (
    <AbsoluteFill>
      <Punch start={actAt + 40} end={tagAt - 14} to={2.1} focus={[gbAt[0] - 420, gbAt[1] + 30]}>
        <Grade look="parchment">
          <MapStage
            style="parchment"
            camera={camera}
            above={[reliefRaster('atlantic', 0.45)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />
                <HomeHidden feature={gb} start={-999} />
              </>
            }
            overlay={
              <>
                {COAST_SMUGGLE.map((r, i) => (
                  <MapShip key={`s${i}`} route={r} start={smuggleAt + 10 + i * 14} dur={150} src="ship_brig.png" w={300} exit={navyAt + 40} />
                ))}
                {[0, 1, 2].map((i) => (
                  <MapShip key={`n${i}`} route={PATROL} start={navyAt + i * 10} dur={420} loop src="ship_navy_warship.png" w={440}
                    exit={juryAt - 12} />
                ))}
                <Label x={W * 0.74} y={H * 0.16} text="Royal Navy" start={navyAt + 20} exit={juryAt} size={110} />
                <Label x={W * 0.3} y={H * 0.16} text="Smuggling" start={smuggleAt + 20} exit={navyAt + 20} size={110} color={C.dateYellow} />
                <Jury at={juryAt} exit={pocketAt - 20} />
                {britainOn && (
                  <MapCharacter
                    feature={gb}
                    height={1100}
                    start={frame >= pocketAt ? pocketAt + 4 : 0}
                    path={[{ at: 0, x: gbAt[0], y: gbAt[1] }]}
                    moods={[[0, 'smug'], [actAt + 30, 'grin'], [pocketAt + 4, 'smug'], [pocketAt + 70, 'grin']]}
                    look={[[0, -1]]}
                    talk={[[actAt + 10, actAt + 90]]}
                    glove={
                      frame < pocketAt
                        ? [{ at: actAt, pose: 'hold', angle: 182, reach: 0.6 }]
                        : [
                            { at: pocketAt + 8, pose: 'open', angle: 186, reach: 1 },
                            { at: pocketAt + 18, pose: 'open', angle: 190, reach: 6.2 },
                            { at: pocketAt + 34, pose: 'fist', angle: 188, reach: 6.2 },
                            { at: pocketAt + 44, pose: 'fist', angle: 182, reach: 0.8 },
                          ]
                    }
                    holding={frame < pocketAt ? { src: staticFile('assets/docs/doc_sugar_act_1764.png'), w: 640, from: actAt + 6 } : undefined}
                  />
                )}
                {frame >= pocketAt && <PocketCoin at={pocketAt + 30} britain={gbAt} />}
              </>
            }
          />
        </Grade>
      </Punch>
      <MapTitle x={W * 0.5} y={H * 0.12} text="Sugar Act" date="5 April 1764" start={actAt + 20} exit={tagAt - 20} size={150} />
      <MolassesDeal tagAt={tagAt} cutAt={cutAt} exit={smuggleAt - 10} />
      <HindiTitle x={W * 0.5} y={H * 0.86} text="जेब तक" start={pocketAt + 40} size={170} exit={len - 6} />

      <Sfx at={0} file="whoosh_soft.wav" volume={0.4} />
      <Sfx at={actAt + 6} file="paper_slide.wav" volume={0.5} />
      <Sfx at={actAt + 40} file="whoosh_fast.wav" volume={0.4} />
      <Sfx at={tagAt - 10} file="thud_soft.wav" volume={0.4} />
      <Sfx at={tagAt} file="pop.wav" volume={0.45} />
      <Sfx at={cutAt} file="pen_draw.wav" volume={0.5} />
      <Sfx at={cutAt + 16} file="pop_high.wav" volume={0.45} />
      <Sfx at={smuggleAt} file="whoosh_soft.wav" volume={0.4} />
      <Sfx at={navyAt} file="sting_hit.wav" volume={0.35} />
      <Sfx at={juryAt} file="pop.wav" volume={0.4} />
      <Sfx at={juryAt + 26} file="sting_hit.wav" volume={0.4} />
      <Sfx at={pocketAt + 18} file="whoosh_fast.wav" volume={0.45} />
      <Sfx at={pocketAt + 34} file="bell_ding.wav" volume={0.35} />
    </AbsoluteFill>
  );
};
