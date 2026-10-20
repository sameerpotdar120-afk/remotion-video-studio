import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, H, W } from '../lib/constants';
import { clamp, ease, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, DrawLine, MapPin } from '../lib/map/layers';
import { project } from '../lib/map/geo';
import { PLACES } from '../lib/map/data';
import { Grade, MuzzleSmoke, Sfx } from '../lib/fx/particles';
import { Paper3D } from '../lib/fx/depth';
import { PopIn, Shake } from '../lib/fx/motion';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { scene } from '../vo/cues';
import { HindiTitle, WipeReveal } from './fx';

/**
 * S02 — THE TURN (962 → 1909, 15.8 s). Parchment map. Frames below are LOCAL to the scene.
 *  "आज हम इस पूरी कहानी"      white line-wipe 3D → parchment, colonies ink in, title card
 *  "एक जंगल में चली एक गोली"  push into the Ohio forest: photo card, pin, gunshot
 *  "चार July सत्रह सौ छिहत्तर"  dotted route draws to Philadelphia, pin "4 July 1776"
 *  "हर बार problem को solve"  Britain arrives; problem icons pop along the route
 *  "problem और बड़ी हो गई"     every icon swells, Britain worried
 */
const J = PLACES.jumonvilleGlen;
const P = PLACES.philadelphia;
// route: a gentle arc north of the straight line (world px)
const routeD = (() => {
  const [x0, y0] = project(J[0], J[1]);
  const [x1, y1] = project(P[0], P[1]);
  const cx = (x0 + x1) / 2;
  const cy = Math.min(y0, y1) - Math.abs(x1 - x0) * 0.35;
  return { d: `M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`, x0, y0, cx, cy, x1, y1 };
})();
const routeAt = (t: number): [number, number] => {
  const { x0, y0, cx, cy, x1, y1 } = routeD;
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
};

const ICONS = [
  { src: 'props/crown_gold.png', t: 0.14 },
  { src: 'props/stamp_taxed.png', t: 0.33 },
  { src: 'props/tea_chest.png', t: 0.52 },
  { src: 'props/musket_militia.png', t: 0.71 },
  { src: 'props/quill_inkwell.png', t: 0.9 },
];

/** Problem icons that sit on the route (screen space) and swell when "problem और बड़ी हो गई". */
const ProblemIcons: React.FC<{ start: number; grow: number }> = ({ start, grow }) => {
  const frame = useCurrentFrame();
  const { scale, cam } = useMap();
  const s2w = (wx: number, wy: number): [number, number] => {
    const [cx, cy] = project(cam.lon, cam.lat);
    return [W / 2 + (wx - cx) * scale, H / 2 + (wy - cy) * scale];
  };
  return (
    <>
      {ICONS.map((ic, i) => {
        const [x, y] = s2w(...routeAt(ic.t));
        const g = ramp(frame, grow + i * 6, 16, ease.out);
        const boing = 1 + g * 0.4 + Math.sin(Math.max(0, frame - grow - i * 6) / 3) * 0.06 * Math.exp(-Math.max(0, frame - grow - i * 6) / 14) * (frame > grow + i * 6 ? 1 : 0);
        return (
          <div key={i} style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y - 170 - g * 60}px)` }}>
            <div style={{ transform: `scale(${boing})` }}>
              <PopIn start={start + i * 14} x={0} y={0} w={300} src={staticFile(`assets/${ic.src}`)} rotate={i % 2 ? 6 : -6} />
            </div>
          </div>
        );
      })}
    </>
  );
};

const JumonvilleSmoke: React.FC<{ at: number }> = ({ at }) => {
  const { toScreen } = useMap();
  const [x, y] = toScreen(J[0], J[1]);
  return <MuzzleSmoke x={x + 30} y={y - 60} start={at} dir={1} size={150} />;
};

export const S02Turn: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S02_turn');
  const gb = useMemo(() => greatBritain1763(), []);
  const forestAt = c.at('एक जंगल में चली एक गोली'); // 195
  const shotAt = forestAt + 80; // "गोली" (1237 abs)
  const julyAt = c.at('चार July सत्रह सौ छिहत्तर'); // 348
  const britainAt = 1534 - c.from; // "Britain ने"
  const solveAt = c.at('हर बार problem को solve'); // 613
  const biggerAt = c.at('problem और बड़ी हो गई'); // 831

  const camera: CamKey[] = [
    { frame: 0, lon: -75.5, lat: 40.2, span: 30 },
    { frame: 150, lon: -77, lat: 40.3, span: 22 },
    { frame: forestAt + 30, lon: -79.2, lat: 40.1, span: 8.5 },
    { frame: julyAt + 10, lon: -77.4, lat: 40.2, span: 9.5 },
    { frame: britainAt - 10, lon: -76.8, lat: 40.4, span: 12.5 },
    { frame: solveAt + 40, lon: -76.5, lat: 40.5, span: 12 },
  ];
  const forestOut = interpolate(frame, [julyAt - 20, julyAt - 4], [1, 0], clamp);

  return (
    <WipeReveal dur={30}>
      <Shake hits={[shotAt]} amp={20} dur={12}>
        <Grade contrast={1.05} saturate={1.05}>
          <MapStage
            style="parchment"
            camera={camera}
            world={
              <>
                <ColonyFill start={12} per={5} color="#4F86C6" flash="#F4EBD3" opacity={0.82} />
                <DrawLine d={routeD.d} start={forestAt + 20} duration={julyAt - forestAt - 20} color={C.stampRed} width={14} dash={34} />
              </>
            }
            overlay={
              <>
                <JumonvilleSmoke at={shotAt} />
                <MapPin lon={J[0]} lat={J[1]} start={forestAt + 10} label="Jumonville Glen" date="28 May 1754" labelSide="left" />
                <MapPin lon={P[0]} lat={P[1]} start={julyAt + 4} label="Philadelphia" date="4 July 1776" />
                <ProblemIcons start={solveAt} grow={biggerAt} />
              </>
            }
          />
        </Grade>
        {forestOut > 0 && (
          <AbsoluteFill style={{ opacity: forestOut }}>
            <Paper3D src={staticFile('assets/bg/bg_forest_ohio_1754_dawn.jpg')} x={W * 0.7} y={H * 0.3} w={1350} h={760}
              start={forestAt + 6} baseTilt={[6, -16, -3]} swing={4} />
          </AbsoluteFill>
        )}
        <MapCharacter
          feature={gb}
          height={760}
          start={britainAt}
          path={[
            { at: britainAt, x: W + 500, y: H * 0.5 },
            { at: britainAt + 2, x: W * 0.86, y: H * 0.5, dur: 22 },
          ]}
          moods={[[britainAt, 'smug'], [solveAt, 'smile'], [biggerAt + 10, 'worried'], [biggerAt + 50, 'shocked']]}
          look={[[britainAt, -1]]}
          glove={[
            { at: solveAt - 6, pose: 'point', angle: 190, reach: 0.9 },
            { at: biggerAt + 10, pose: 'open', angle: 150, reach: 0.5 },
          ]}
        />
        <HindiTitle x={W / 2} y={H * 0.2} text="America आज़ाद कैसे हुआ?" sub="1754 → 1776" start={22} exit={forestAt - 14} size={200} />
      </Shake>

      {/* ── SFX ── */}
      <Sfx at={0} file="paper_slide.wav" volume={0.6} />
      {Array.from({ length: 13 }).map((_, i) => (
        <Sfx key={i} at={12 + i * 5} file="click_soft.wav" volume={0.35} />
      ))}
      <Sfx at={22} file="sting_hit.wav" volume={0.35} />
      <Sfx at={forestAt} file="whoosh_soft.wav" volume={0.6} />
      <Sfx at={forestAt + 6} file="paper_swish.wav" volume={0.6} />
      <Sfx at={forestAt + 10} file="pop.wav" volume={0.5} />
      <Sfx at={forestAt + 20} file="pen_draw.wav" volume={0.35} />
      <Sfx at={shotAt} file="musket_shot.wav" volume={0.85} />
      <Sfx at={julyAt + 4} file="pop.wav" volume={0.5} />
      <Sfx at={julyAt + 18} file="bell_ding.wav" volume={0.35} />
      <Sfx at={britainAt} file="whoosh_big.wav" volume={0.55} />
      {ICONS.map((_, i) => (
        <Sfx key={i} at={solveAt + i * 14} file="pop_high.wav" volume={0.45} />
      ))}
      {ICONS.map((_, i) => (
        <Sfx key={`g${i}`} at={biggerAt + i * 6} file="pop_low.wav" volume={0.4} />
      ))}
      <Sfx at={biggerAt} file="riser.wav" volume={0.4} />
    </WipeReveal>
  );
};
