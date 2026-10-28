import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, end, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, Flash, GreyStage, RC, TypeOn, PopIn, hand, pop } from '../kit/core';
import { Bouncy, CollapseMarks, LoopWheel } from '../kit/devices';
import { Host } from '../kit/Host';
import { Globe } from '../three/Globe';
import { Fill, MapLabel, RMap, ShatterFill } from '../map/RMap';

/**
 * 0 · HOOK (P0–P1) + THE TURN (P2–P4).
 *  P0  globe spins to Russia → whole country fills red (elastic pop) → "17,100,000 km²" → host pops in → 4 grey X
 *  P1  cut to the Eurasia map: the red cracks like glass and flies apart → "फिर से खड़ा" pieces snap back → "?"
 *  P2  grey stage, host left; "862 → आज" types on; loop wheel pops in on "loop"
 *  P3  pointer walks the loop node by node as each is said; AGAIN
 *  P4  the four X marks fly to the top-right corner (they stay there all video)
 */
export const OPEN_FROM = 0;
export const OPEN_TO = CHAPTERS[0].card;

const P1 = para(1).f;
const P2 = para(2).f - 8;

/** The host stands in the same spot across the globe → map cut, so the cut never re-pops him. */
const HOST_HOOK = { x: W * 0.86, y: H * 1.12, height: H * 0.62 };
/** Where RussiaFinal's persistent collapse counter sits (CollapseMarks defaults, size 64). */
const MARKS_HOME = { x: W * 0.83, y: H * 0.07, size: 64 };

/** Dark rounded plate behind the grey X marks so they read on the globe and on the grey stage. */
const MarksPlate: React.FC<{ x: number; y: number; size: number; start: number; exit?: number; fade?: number }> = ({ x, y, size, start, exit, fade = 1 }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, start, 1.06) * (exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1);
  if (s <= 0.001) return null;
  const pad = size * 0.22;
  const w = size * 4.9 + pad * 2, h = size * 1.5 + pad * 2;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - pad, width: w, height: h, borderRadius: size * 0.28, opacity: fade,
      background: 'rgba(28,32,40,0.78)', boxShadow: '0 12px 40px rgba(0,0,0,0.35)', transform: `scale(${s})`, transformOrigin: '50% 40%' }} />
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const fill = at(0, 'देश');
  const count = at(0, 'देखते');
  const hostIn = at(0, 'पर');
  const four = at(0, 'चार');
  const fade = ramp(frame, 0, 18, ease.out);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ opacity: fade }}>
        <Globe
          keys={[
            { at: 0, lon: -35, lat: 18, dist: 5.2 },
            { at: 4, lon: 92, lat: 52, dist: 3.35, dur: 150 },
            { at: four - 10, lon: 95, lat: 56, dist: 2.9, dur: 140 },
          ]}
          highlight={{ ids: ['russia_modern'], color: '#D0302A', start: fill, pulse: [four] }}
        />
      </AbsoluteFill>
      {/* soft floor shade so the number + sub-line read over the bright globe */}
      <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 62%, rgba(0,0,0,0.6) 100%)',
        opacity: ramp(frame, count - 6, 16, ease.out) * (1 - ramp(frame, P1 - 6, 10, ease.in)) }} />
      <BigNumber x={W * 0.47} y={H * 0.79} to={17100000} start={count} dur={46} size={230} suffix=" km²" hollow={false} exit={P1 - 6} />
      <TypeOn text="दुनिया का सबसे बड़ा देश" x={W * 0.47} y={H * 0.9} start={count + 24} size={96} color={RC.yellow} exit={P1 - 6} />
      <MarksPlate x={W * 0.5} y={H * 0.06} size={150} start={four - 4} exit={P1 - 2} />
      <CollapseMarks redAt={[]} start={four} slamFrom={four} x={W * 0.5} y={H * 0.06} size={150} exit={P1 - 2} />
      <Host {...HOST_HOOK} start={hostIn} flip offset={0} gestures={[[hostIn, 'present'], [four, 'fingerUp']]} moods={[[hostIn, 'smile'], [four + 20, 'worried']]} />
      <Sfx at={fill} file="pop_low.wav" volume={0.9} />
      <Sfx at={count} file="tick.wav" volume={0.6} />
      {[0, 1, 2, 3].map((i) => <Sfx key={i} at={four + i * 9} file="stamp_slam.wav" volume={0.55} />)}
    </AbsoluteFill>
  );
};

const Cracks: React.FC = () => {
  const frame = useCurrentFrame() + P1;
  const brk = at(1, 'और');
  const mend = at(1, 'फिर');
  const q = at(1, 'क्यों');
  const how = at(1, 'वापस');
  const L = (f: number) => f - P1;
  return (
    <AbsoluteFill>
      <RMap
        view="eurasia"
        from={0}
        cam={[{ at: 0, lon: 88, lat: 60, zoom: 1.32 }, { at: L(q), lon: 80, lat: 58, zoom: 1.42, dur: 120 }]}
        overlay={
          <>
            <Bouncy x={W * 0.5} y={H * 0.42} start={L(q)} size={420} color={RC.yellow} />
            <TypeOn text="फिर से खड़ा!" x={W * 0.5} y={H * 0.72} start={L(mend) + 8} size={150} color={RC.yellow} exit={L(at(1, 'बार-बार')) - 12} />
            <TypeOn text="बार-बार क्यों?" x={W * 0.5} y={H * 0.72} start={L(at(1, 'बार-बार'))} size={150} color={RC.white} />
            <TypeOn text="और हर बार वापस?" x={W * 0.5} y={H * 0.84} start={L(how)} size={120} color={RC.yellow} />
          </>
        }
      >
        <ShatterFill id="russia_modern" color="#D0302A" center={[90, 61]} start={0} breakAt={L(brk) + 4} mendAt={L(mend)} pieces={10} />
      </RMap>
      <Host {...HOST_HOOK} flip offset={P1} start={-60} gestures={[[0, 'handsHead'], [L(mend), 'present']]}
        moods={[[0, 'shocked'], [L(mend) + 10, 'smile'], [L(q), 'worried']]} hopAt={[L(mend) + 6]} />
      <Flash at={L(brk) + 4} dur={4} />
      <Sfx at={L(brk) + 4} file="impact_boom.wav" volume={0.5} />
      <Sfx at={L(brk) + 5} file="paper_tear.wav" volume={0.7} />
      <Sfx at={L(mend)} file="whoosh_fast.wav" volume={0.6} />
      <Sfx at={L(q)} file="pluck_up.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

const Turn: React.FC = () => {
  const frame = useCurrentFrame() + P2;
  const L = (f: number) => f - P2;
  const steps: [number, number][] = [
    [L(at(3, 'पहले')), 0],
    [L(at(3, 'एक ताक़तवर')), 1],
    [L(at(3, 'लोग order')), 2],
    [L(at(3, 'हद')), 3],
    [L(at(3, 'बिखर')), 4],
    [L(at(3, 'loop')), 0],
  ];
  const wheel = L(at(2, 'loop'));
  const four = L(at(4, 'ये चार'));
  const card = L(at(2, 'आज'));
  // P4: the counter flies home to the top-right corner, where RussiaFinal's persistent marks take over
  const MK = { x: W * 0.57, y: H * 0.3, size: 230 };
  const fly = ramp(frame - P2, L(at(4, 'गिनेंगे')), 40, ease.inOut);
  const k = 1 + (MARKS_HOME.size / MK.size - 1) * fly;
  const dx = (MARKS_HOME.x - MK.x) * fly, dy = (MARKS_HOME.y - MK.y) * fly;
  const cardW = W * 0.4, cardH = cardW * (3240 / 5760);
  return (
    <GreyStage>
      <Camera from={0}>
        <PopIn x={W * 0.57} y={H * 0.55} start={card} exit={wheel - 8} tilt={-2}>
          <div style={{ width: cardW, height: cardH, borderRadius: 36, overflow: 'hidden', border: '10px solid #F4F1EA', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
            <Img src={staticFile('russia/maps/eurasia_sat.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + 0.0006 * Math.max(0, frame - P2 - card)})` }} />
          </div>
        </PopIn>
        <TypeOn text="862" x={W * 0.48} y={H * 0.19} start={L(at(2, 'आठ'))} size={200} color={RC.blue} exit={wheel - 8} />
        <TypeOn text="→  आज" x={W * 0.65} y={H * 0.19} start={L(at(2, 'आज', 1))} size={200} color={RC.danger} exit={wheel - 8} />
        <PopIn x={W * 0.57} y={H * 0.79} start={L(at(2, 'map'))} exit={wheel - 8} tilt={-3}>
          <div style={{ ...hand(110, RC.white), padding: '20px 50px', background: 'rgba(30,60,90,0.92)', borderRadius: 30, whiteSpace: 'nowrap' }}>🗺️ map पर</div>
        </PopIn>
        <LoopWheel x={W * 0.55} y={H * 0.53} r={H * 0.23} start={wheel} labelsAt={steps.slice(0, 5).map(([f]) => f)} steps={steps}
          center={{ text: 'AGAIN ↻', at: steps[5][0] + 4 }} exit={four - 4} />
        <TypeOn text="याद रखना!" x={W * 0.57} y={H * 0.62} start={L(at(4, 'याद'))} size={150} color={RC.yellow} />
        <TypeOn text="हम हर एक को गिनेंगे" x={W * 0.57} y={H * 0.74} start={L(at(4, 'हम'))} size={100} color={RC.sub} />
      </Camera>
      <AbsoluteFill style={{ transformOrigin: `${MK.x}px ${MK.y}px`, transform: `translate(${dx}px, ${dy}px) scale(${k})` }}>
        <MarksPlate x={MK.x} y={MK.y} size={MK.size} start={four - 4} fade={1 - fly} />
        <CollapseMarks redAt={[]} start={four} slamFrom={four} x={MK.x} y={MK.y} size={MK.size} />
      </AbsoluteFill>
      <Host x={W * 0.13} y={H * 0.92} height={H * 0.56} offset={P2} start={0}
        gestures={[[0, 'present'], [wheel, 'point'], [steps[2][0], 'fingerUp'], [steps[4][0], 'handsHead'], [steps[5][0], 'present'], [four, 'fingerUp']]}
        moods={[[0, 'smile'], [steps[3][0], 'worried'], [steps[4][0], 'shocked'], [steps[5][0], 'smug']]} />
      {steps.map(([f], i) => <Sfx key={i} at={f} file="tick.wav" volume={0.55} />)}
      <Sfx at={wheel} file="pop.wav" volume={0.7} />
      <Sfx at={steps[5][0] + 4} file="sting_hit.wav" volume={0.5} />
      {[0, 1, 2, 3].map((i) => <Sfx key={i} at={four + i * 9} file="stamp_slam.wav" volume={0.45} />)}
    </GreyStage>
  );
};

export const S00Open: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={P1}><Hook /></Sequence>
    <Sequence from={P1} durationInFrames={P2 - P1}><Cracks /></Sequence>
    <Sequence from={P2} durationInFrames={OPEN_TO - P2}><Turn /></Sequence>
  </AbsoluteFill>
);
