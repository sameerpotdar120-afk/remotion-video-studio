import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, Card, GreyStage, Iris, PopIn, RC, RImg, Stamp, TypeOn, YearTag, hand } from '../kit/core';
import { Bouncy, Calendar, LoopWheel, PeopleGrid } from '../kit/devices';
import { Host } from '../kit/Host';
import { Char } from '../kit/cast';
import { BgPlate, Fit, Frame, Glyph, Smoke, Snow } from '../kit/scene';
import { Globe } from '../three/Globe';
import { At, Fill, MapLabel, Pin, RMap, Route } from '../map/RMap';

/**
 * CHAPTER 4 · TIME OF TROUBLES (P34–P42): 1598 → 1613.
 * A  P34  an empty throne, a bouncing "?" → CHAOS
 * B  P35  Boris crowned → summer snow on the fields → a mini globe: Peru's volcano erupts (1600)
 * C  P36  20,00,000 dead, a third of the people greyed out
 * D  P37  three identical "Dmitry" cards, FAKE stamps; Poland backs the first
 * E  P38  1610 map: Poland–Lithuania pushes east, its flag on the Kremlin; Sweden bites the north-west
 * F  P39  COLLAPSE #2
 * G  P40  1612: Minin + Pozharsky, volunteers march, the Polish garrison walks out; 4 November
 * H  P41  1613: a nervous 16-year-old Michael Romanov on the throne; a 300-year dynasty
 * I  P42  the loop turns again: collapse → chaos → a new centre
 */
export const C4_FROM = CHAPTERS[3].from;
export const C4_TO = CHAPTERS[4].card;
const P = (n: number) => para(n).f - 6;
const MOSCOW: [number, number] = [37.62, 55.75];

const PolishFlag: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const w = Math.sin(frame / 7) * 3;
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 50 60">
      <rect x={4} y={0} width={2.4} height={60} fill="#6B4A2E" />
      <path d={`M6.4 4 L46 ${5 + w * 0.3} L46 ${17 + w * 0.3} L6.4 16 Z`} fill="#F4F4F4" stroke="#999" strokeWidth={0.5} />
      <path d={`M6.4 16 L46 ${17 + w * 0.3} L46 ${29 + w * 0.3} L6.4 28 Z`} fill="#D4213D" />
    </svg>
  );
};

/* ───────────── A · empty throne ───────────── */
const A: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const noTsar = L(at(34, 'कोई'));
  const empty = L(at(34, 'ख़ाली'));
  const what = L(at(34, 'क्या'));
  const chaos = L(at(34, 'Chaos.'));
  return (
    <GreyStage>
      <Camera from={0}>
        <PopIn x={W * 0.6} y={H * 0.58} start={6}><RImg src="props/throne_gold.png" w={H * 0.75} h={H * 0.75} label="throne" /></PopIn>
        <Bouncy x={W * 0.6} y={H * 0.36} start={noTsar} size={300} color={RC.yellow} />
        <TypeOn text="ताक़त ख़ाली = ?" x={W * 0.6} y={H * 0.1} start={empty} size={110} exit={chaos} />
        <Stamp text="CHAOS" x={W * 0.6} y={H * 0.16} start={chaos} size={180} />
      </Camera>
      <Host x={W * 0.16} y={H * 0.92} height={H * 0.58} offset={base} start={0} gestures={[[0, 'present'], [what, 'shrug'], [chaos, 'handsHead']]} moods={[[0, 'neutral'], [what, 'smug'], [chaos, 'shocked']]} />
      <Sfx at={noTsar} file="pluck_up.wav" volume={0.5} />
      <Sfx at={chaos} file="stamp_slam.wav" volume={0.7} />
    </GreyStage>
  );
};

/* ───────────── B · Boris, summer snow, the volcano ───────────── */
const B: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const boris = L(at(35, 'Boris'));
  const nature = L(at(35, 'क़ुदरत'));
  const tag = L(at(35, 'सोलह'));
  const cold = L(at(35, 'गर्मियों'));
  const sci = L(at(35, 'Scientists'));
  const peru = L(at(35, 'Peru'));
  const village = frame >= nature;
  return (
    <AbsoluteFill>
      {!village ? (
        <GreyStage>
          <Camera from={0}>
            <Char who="boris_godunov" x={W * 0.56} y={H * 0.95} height={H * 0.56} start={boris} gestures={[[boris, 'cheer']]} moods={[[boris, 'grin']]} hopAt={[boris + 30]} />
            <TypeOn text="Boris Godunov" x={W * 0.56} y={H * 0.2} start={boris + 6} size={130} color={RC.blue} />
            <TypeOn text="Ivan का ख़ास आदमी" x={W * 0.56} y={H * 0.3} start={boris + 20} size={80} color={RC.sub} />
          </Camera>
          <Host x={W * 0.16} y={H * 0.92} height={H * 0.58} offset={base} start={0} gestures={[[0, 'present']]} moods={[[0, 'smile']]} />
        </GreyStage>
      ) : (
        <AbsoluteFill>
          <BgPlate src="bg/bg_village_1601.png" from={nature} sky="#8E98A2" ground="#7C8A5A" />
          <AbsoluteFill style={{ background: 'rgba(30,40,60,0.25)', opacity: ramp(frame, nature, 40) }} />
          <Snow start={nature + 10} density={140} wind={1} />
          <Camera from={nature}>
            <Char who="serf_worker" x={W * 0.3} y={H * 0.95} height={H * 0.42} start={nature + 4} moods={[[nature, 'worried'], [cold, 'sad']]} gestures={[[nature, 'handsHead']]} shake={[cold, cold + 200]} />
            <Char who="serf_woman" x={W * 0.45} y={H * 0.95} height={H * 0.4} start={nature + 10} moods={[[nature, 'worried']]} gestures={[[nature, 'chin']]} shake={[cold, cold + 200]} />
            <TypeOn text="गर्मियों में बर्फ़?! ❄️" x={W * 0.38} y={H * 0.18} start={cold} size={110} color={RC.white} />
            <TypeOn text="3 साल फ़सलें बर्बाद" x={W * 0.38} y={H * 0.3} start={tag + 30} size={90} color={RC.yellow} />
            <Frame x={W * 0.77} y={H * 0.44} w={W * 0.34} h={W * 0.34 * 0.62} start={sci} tilt={3}>
              <Fit w={W * 0.34} h={W * 0.34 * 0.62}>
                <Globe keys={[{ at: 0, lon: -20, lat: 10, dist: 3.4 }, { at: 2, lon: -71, lat: -15, dist: 2.7, dur: 70 }]} spinBias={0} />
              </Fit>
              {frame >= peru && <div style={{ position: 'absolute', left: '50%', top: '44%', transform: 'translate(-50%,-50%)' }}>
                <div style={{ position: 'relative' }}><Smoke x={0} y={-80} size={90} start={peru} color="80,70,70" /><PopIn x={0} y={0} start={peru} over={1.3}><RImg src="props/volcano_erupting.png" w={260} h={260} label="🌋" /></PopIn></div>
              </div>}
            </Frame>
            <TypeOn text="1600 · Peru का volcano 🌋" x={W * 0.77} y={H * 0.8} start={peru} size={96} color={RC.yellow} />
          </Camera>
          <Sfx at={peru} file="impact_boom.wav" volume={0.5} />
        </AbsoluteFill>
      )}
      <YearTag text={frame < tag ? '1598' : '1601'} start={boris} />
      <Sfx at={boris} file="sting_crown.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

/* ───────────── C · famine ───────────── */
const Cc: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const n = L(at(36, 'बीस'));
  const third = L(at(36, 'तिहाई'));
  return (
    <GreyStage>
      <Camera from={0}>
        <BigNumber x={W * 0.56} y={H * 0.24} to={2000000} start={n - 10} dur={50} size={250} sub="☠️ लोग मरे (अकाल 1601–03)" />
        <PeopleGrid x={W * 0.56} y={H * 0.66} cols={15} rows={3} size={70} start={n} greyFrom={third} perRow={0} />
        <TypeOn text="≈ एक तिहाई आबादी" x={W * 0.56} y={H * 0.92} start={third} size={100} color={RC.danger} />
      </Camera>
      <Host x={W * 0.13} y={H * 0.92} height={H * 0.52} offset={base} start={0} gestures={[[0, 'present']]} moods={[[0, 'sad']]} />
      <Sfx at={n} file="tick.wav" volume={0.5} />
      <Sfx at={third} file="sub_drop.wav" volume={0.45} />
    </GreyStage>
  );
};

/* ───────────── D · the false Dmitrys ───────────── */
const D: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const dead = L(at(37, 'Dmitry'));
  const claim = L(at(37, 'मैं'));
  const poland = L(at(37, 'Poland'));
  const tsar = L(at(37, 'Tsar'));
  const second = L(at(37, 'दूसरा'));
  const third = L(at(37, 'तीसरा।'));
  const cardsAt = [claim, second, third];
  return (
    <GreyStage>
      <Camera from={0}>
        <TypeOn text="असली Dmitry: बचपन में मौत ✝" x={W * 0.56} y={H * 0.1} start={dead} size={90} color={RC.sub} exit={claim} />
        {cardsAt.map((f, i) => (
          <React.Fragment key={i}>
            <Card src="cards/card_false_dmitry.png" x={W * (0.36 + i * 0.22)} y={H * 0.46} w={W * 0.17} start={f} name={`Dmitry ${['I', 'II', 'III'][i]}?`} tilt={[-5, 3, -2][i]} />
            <Stamp text="FAKE" x={W * (0.36 + i * 0.22)} y={H * 0.48} start={f + 40} size={120} rotate={-14} />
          </React.Fragment>
        ))}
        <TypeOn text="“मैं ही Dmitry हूँ!”" x={W * 0.36} y={H * 0.12} start={claim} size={96} color={RC.yellow} exit={second} />
        <PopIn x={W * 0.2} y={H * 0.26} start={poland}><PolishFlag size={160} /></PopIn>
        <PopIn x={W * 0.36} y={H * 0.17} start={tsar}><Glyph g="👑" size={120} /></PopIn>
      </Camera>
      <Host x={W * 0.11} y={H * 0.95} height={H * 0.5} offset={base} start={0} gestures={[[0, 'chin'], [claim, 'point'], [third, 'handsHead']]} moods={[[0, 'neutral'], [claim, 'smug'], [third, 'shocked']]} />
      {cardsAt.map((f, i) => <Sfx key={i} at={f + 40} file="stamp_slam.wav" volume={0.5} />)}
    </GreyStage>
  );
};

/* ───────────── E/F · 1610 Russia almost gone — collapse #2 ───────────── */
const EF: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const tag = L(at(38, 'सोलह'));
  const polish = L(at(38, 'Polish'));
  const kremlin = L(at(38, 'Kremlin'));
  const sweden = L(at(38, 'Sweden'));
  const gone = L(at(38, 'Russia'));
  const second = L(at(39, 'दूसरा'));
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 34, lat: 56, zoom: 1.45 }, { at: kremlin, lon: 36, lat: 56, zoom: 2.0, dur: 80 }, { at: gone, lon: 38, lat: 57, zoom: 1.5, dur: 80 }]}
        overlay={
          <>
            <MapLabel lon={25} lat={52.4} text="Poland–Lithuania" start={polish} size={100} color="#FFF" />
            <At lon={MOSCOW[0]} lat={MOSCOW[1]} dy={-90} start={kremlin} over={1.3}><PolishFlag size={150} /></At>
            <Pin lon={MOSCOW[0]} lat={MOSCOW[1]} label="Kremlin" start={kremlin - 10} side="l" />
            <MapLabel lon={23} lat={62.5} text="Sweden" start={sweden} size={110} color="#D8E6FF" />
          </>
        }>
        <Fill id="russia_1584" color={RC.rusRed} start={0} dur={1} opacity={0.55} exit={polish + 30} />
        <Fill id="russia_1610" color={RC.rusRed} start={polish + 20} dur={20} opacity={0.5} pulseAt={[second]} />
        <Fill id="poland_lithuania_1610" color={RC.poland} start={polish} mode="wipe" dur={70} opacity={0.65} />
        <Fill id="sweden_1610" color={RC.sweden} start={sweden - 10} opacity={0.55} />
        <Fill id="sweden_nibble_1611" color={RC.sweden} start={sweden + 10} mode="flood" origin={[28, 59.5]} dur={50} opacity={0.6} />
        <Route pts={[[24, 53.5], [30, 54.6], [34.6, 55.4], [37.4, 55.7]]} start={polish + 6} dur={60} width={34} color="#F4F4F4" head={RC.stampRed} />
      </RMap>
      <Stamp text="COLLAPSE #2" x={W * 0.5} y={H * 0.5} start={second} size={210} rotate={-7} />
      <YearTag text="1610" start={tag} />
      <Sfx at={polish} file="whoosh_big.wav" volume={0.5} />
      <Sfx at={kremlin} file="pop_low.wav" volume={0.6} />
      <Sfx at={second} file="stamp_slam.wav" volume={0.8} />
      <Sfx at={second} file="sub_drop.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── G · 1612 the comeback from below ───────────── */
const G: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const below = L(at(40, 'नीचे'));
  const minin = L(at(40, 'Minin'));
  const poz = L(at(40, 'Pozharsky'));
  const army = L(at(40, 'फ़ौज'));
  const tag = L(at(40, 'सोलह'));
  const free = L(at(40, 'आज़ाद'));
  const nov = L(at(40, 'चार'));
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_kremlin_exterior_1612.png" from={0} sky="#C9B48A" ground="#8A7A52" />
      <Camera from={0}>
        <Char who="kuzma_minin" x={W * 0.18} y={H * 0.95} height={H * 0.44} start={minin} gestures={[[minin, 'fist'], [free, 'cheer']]} moods={[[minin, 'angry'], [free, 'grin']]} />
        <Char who="dmitry_pozharsky" x={W * 0.32} y={H * 0.95} height={H * 0.46} start={poz} gestures={[[poz, 'point'], [free, 'cheer']]} moods={[[poz, 'angry'], [free, 'grin']]} />
        <TypeOn text="Minin" x={W * 0.18} y={H * 0.44} start={minin + 4} size={90} color={RC.blue} />
        <TypeOn text="Pozharsky" x={W * 0.33} y={H * 0.4} start={poz + 4} size={90} color={RC.blue} />
        <TypeOn text="ऊपर से नहीं, नीचे से ⬆️" x={W * 0.5} y={H * 0.12} start={below} size={110} color={RC.yellow} exit={tag} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Char key={i} who="militia_volunteer" x={W * (0.4 + i * 0.07)} y={H * (0.97 - (i % 2) * 0.02)} height={H * 0.3} start={army + i * 4} seed={`mv${i}`}
            walk={[{ at: 0, x: W * (-0.1 - i * 0.07) }, { at: army + i * 4, x: W * (0.42 + i * 0.07), dur: 120 }]} moods={[[0, 'angry'], [free, 'grin']]} gestures={[[0, 'fist'], [free, 'cheer']]} />
        ))}
        <Char who="polish_hussar" x={W * 0.86} y={H * 0.82} height={H * 0.32} start={4} flip
          walk={[{ at: 0, x: W * 0.86 }, { at: free, x: W * 1.25, dur: 90 }]} moods={[[0, 'smug'], [army + 40, 'worried'], [free, 'shocked']]} gestures={[[0, 'hips'], [free, 'handsHead']]} />
        <Calendar x={W * 0.8} y={H * 0.36} size={220} start={nov} pages={['1', '2', '3']} final={['4', 'November']} per={6} />
        {frame >= nov + 40 && <PopIn x={W * 0.9} y={H * 0.2} start={nov + 40}><Glyph g="✅" size={110} /></PopIn>}
        <TypeOn text="आज भी छुट्टी 🎉" x={W * 0.8} y={H * 0.56} start={nov + 30} size={80} color={RC.green} />
      </Camera>
      <YearTag text="1612" start={tag} />
      <Sfx at={army} file="snare_roll.wav" volume={0.4} />
      <Sfx at={free} file="sting_crown.wav" volume={0.5} />
      <Sfx at={nov} file="paper_swish.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── H/I · 1613 Michael Romanov — the loop turns ───────────── */
const HI: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(41, 'सोलह'));
  const chose = L(at(41, 'Tsar'));
  const sixteen = L(at(41, 'सोलह', 1));
  const michael = L(at(41, 'Michael'));
  const dyn = L(at(41, 'Romanov', 1));
  const loop = L(at(42, 'Loop'));
  const centre = L(at(42, 'केंद्र'));
  const loopPhase = frame >= loop - 4;
  return (
    <GreyStage>
      <Camera from={0}>
        {!loopPhase ? (
          <>
            <PopIn x={W * 0.56} y={H * 0.58} start={4}><RImg src="props/throne_gold.png" w={H * 0.78} h={H * 0.78} label="throne" /></PopIn>
            <Char who="michael_romanov" x={W * 0.56} y={H * 0.74} height={H * 0.4} start={chose} legs={false} moods={[[chose, 'worried'], [dyn, 'smile']]} gestures={[[chose, 'down'], [dyn, 'wave']]} shake={[chose, dyn]} />
            <TypeOn text="Michael Romanov" x={W * 0.56} y={H * 0.12} start={michael} size={130} color={RC.blue} />
            <TypeOn text="उम्र 16 😰" x={W * 0.82} y={H * 0.36} start={sixteen} size={110} color={RC.yellow} />
            <BigNumber x={W * 0.82} y={H * 0.66} to={300} start={dyn + 20} dur={40} size={170} sub="साल · Romanov dynasty" />
          </>
        ) : (
          <LoopWheel x={W * 0.6} y={H * 0.52} r={H * 0.28} start={loop - 4} steps={[[loop - 4, 4], [loop + 6, 0], [centre, 1]]} />
        )}
      </Camera>
      <Host x={W * 0.15} y={H * 0.92} height={H * 0.56} offset={base} start={0} gestures={[[0, 'present'], [sixteen, 'fingerUp'], [loop, 'point']]} moods={[[0, 'smile'], [sixteen, 'grin'], [loop, 'smug']]} />
      <YearTag text="1613" start={tag} />
      <Iris at={tag + 2} hold={36} />
      <Sfx at={chose} file="sting_crown.wav" volume={0.5} />
      <Sfx at={loop} file="whoosh_soft.wav" volume={0.5} />
    </GreyStage>
  );
};

const SHOTS: [number, React.FC<{ base: number }>][] = [
  [C4_FROM, A],
  [P(35), B],
  [P(36), Cc],
  [P(37), D],
  [P(38), EF],
  [P(40), G],
  [P(41), HI],
];

export const C04Troubles: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map(([from, Comp], i) => {
      const to = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : C4_TO;
      return (
        <Sequence key={i} from={from - C4_FROM} durationInFrames={to - from}>
          <Comp base={from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
