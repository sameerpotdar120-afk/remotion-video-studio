import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, Card, GreyStage, Iris, PopIn, RC, RImg, Stamp, TypeOn, YearTag, hand } from '../kit/core';
import { Bouncy, LoopWheel, RedX } from '../kit/devices';
import { Host } from '../kit/Host';
import { Char } from '../kit/cast';
import { BgPlate, Glyph } from '../kit/scene';
import { At, Fill, Flow, MapLabel, Pin, RMap } from '../map/RMap';

/**
 * CHAPTER 6 · CATHERINE (P51–P57): 1762 → 1796.
 * A  P51  twist: the most famous empress wasn't Russian — Sophie, a German princess; "?" over the crown
 * B  P52  1762 palace: Peter III plays with toy soldiers, Catherine and the guards → COUP; a mysterious death
 * C  P53  34 years; the empire grows to the Black Sea; 1783 Crimea flips green — "remember this name"
 * D  P54  the Potemkin village: pretty fronts, the barge sails by, the camera looks behind → EXAGGERATED?
 * E  P55  letters to the philosophers: "Enlightened?"
 * F  P56  reality: serfs sold with the land; 1773 Pugachev rises along the Volga, crushed
 * G  P57  the empire grows, the man at the bottom is pressed down — the pressure builds for 100 years
 */
export const C6_FROM = CHAPTERS[5].from;
export const C6_TO = CHAPTERS[6].card;
const P = (n: number) => para(n).f - 6;

/** Type-on caption on a soft dark plate, for busy photo backgrounds. */
const PlateText: React.FC<{ text: string; x: number; y: number; start: number; size: number; color: string; exit?: number }> = ({ text, x, y, start, size, color, exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const o = ramp(frame, start, 8, ease.out) * (exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1);
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', padding: `${size * 0.14}px ${size * 0.42}px`, borderRadius: size * 0.3, background: 'rgba(24,16,10,0.58)', opacity: o }}>
      <span style={{ ...hand(size, color), visibility: 'hidden' }}>{text}</span>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}>
        <TypeOn text={text} x={0} y={0} start={start} size={size} color={color} />
      </div>
    </div>
  );
};

/* ───────────── A · Sophie ───────────── */
const A: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const twist = L(at(51, 'twist.'));
  const famous = L(at(51, 'मशहूर'));
  const empress = L(at(51, 'महारानी,'));
  const notRussian = L(at(51, 'Russian'));
  const sophie = L(at(51, 'Sophie,'));
  const germany = L(at(51, 'Germany'));
  return (
    <GreyStage>
      <Camera from={0}>
        <TypeOn text="TWIST 🔄" x={W * 0.56} y={H * 0.12} start={twist} size={140} color={RC.yellow} />
        <PopIn x={W * 0.82} y={H * 0.36} start={famous}><div style={{ position: 'relative' }}><RImg src="props/crown_catherine.png" w={H * 0.3} h={H * 0.3} label="👑" /><div style={{ position: 'absolute', right: -60, top: -60 }}><Bouncy x={0} y={0} start={notRussian + 4} size={200} color={RC.danger} /></div></div></PopIn>
        <TypeOn text="Catherine the Great" x={W * 0.82} y={H * 0.58} start={empress} size={84} color={RC.blue} />
        <Card src="cards/card_sophie_princess.png" x={W * 0.52} y={H * 0.5} w={W * 0.2} start={sophie - 10} name="Sophie" tilt={-4} />
        <TypeOn text="Germany से 🏰 (Anhalt-Zerbst)" x={W * 0.56} y={H * 0.92} start={germany} size={96} color={RC.blue} />
      </Camera>
      <Host x={W * 0.15} y={H * 0.92} height={H * 0.56} offset={base} start={0} gestures={[[0, 'fingerUp'], [notRussian, 'shrug'], [sophie, 'present']]} moods={[[0, 'grin'], [notRussian, 'shocked'], [sophie, 'smile']]} />
      <Sfx at={twist} file="sting_hit.wav" volume={0.5} />
      <Sfx at={sophie - 10} file="pop.wav" volume={0.5} />
    </GreyStage>
  );
};

/* ───────────── B · the coup ───────────── */
const B: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const married = L(at(52, 'शादी'));
  const peter3 = L(at(52, 'Peter'));
  const disliked = L(at(52, 'पसंद'));
  const tag = L(at(52, 'सत्रह'));
  const cath = L(at(52, 'Catherine'));
  const coup = L(at(52, 'तख़्ता'));
  const death = L(at(52, 'रहस्यमय'));
  const pushed = ramp(frame, coup + 4, 30, ease.in);
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_palace_room_1762.png" from={0} sky="#CFE0EC" ground="#B89A6A" />
      <Camera from={0} drift={0.004} focus={[W * 0.5, H * 0.9]}>
        <PopIn x={W * 0.13} y={H * 0.84} start={peter3}><RImg src="props/toy_soldiers.png" w={W * 0.14} h={W * 0.095} label="🪖🪖 toy soldiers" /></PopIn>
        <Char who="peter_iii" x={W * (0.3 - pushed * 0.6)} y={H * 0.93} height={H * 0.46} start={married} gestures={[[0, 'cheer'], [disliked, 'hold'], [coup, 'handsHead']]} moods={[[0, 'grin'], [coup, 'shocked']]}
          hopAt={[married + 20, married + 60]} />
        <PlateText text="Peter III 🧸" x={W * 0.3} y={H * 0.37} start={peter3} size={100} color={RC.blue} exit={coup} />
        <PlateText text="किसी को पसंद नहीं 👎" x={W * 0.3} y={H * 0.25} start={disliked} size={90} color={RC.danger} exit={coup} />
        <Char who="catherine_great" x={W * 0.64} y={H * 0.93} height={H * 0.5} start={married + 6} flip gestures={[[0, 'down'], [cath, 'point']]} moods={[[0, 'smug'], [cath, 'angry']]} />
        {[0, 1].map((i) => (
          <Char key={i} who="russian_guard" seed={`g${i}`} x={W * (0.79 + i * 0.12)} y={H * 0.93} height={H * 0.46} start={cath + i * 6} flip
            walk={[{ at: 0, x: W * (1.1 + i * 0.12) }, { at: cath + i * 6, x: W * (0.79 + i * 0.12), dur: 40 }, { at: coup, x: W * (0.28 + i * 0.17), dur: 50 }]} gestures={[[0, 'fist']]} moods={[[0, 'angry']]} />
        ))}
        <Stamp text="COUP" x={W * 0.5} y={H * 0.2} start={coup} size={200} />
        <PlateText text="कुछ दिन बाद… रहस्यमय मौत ❓" x={W * 0.5} y={H * 0.36} start={death} size={96} color={RC.white} />
      </Camera>
      <YearTag text="1762" start={tag} />
      <Iris at={tag + 2} hold={40} />
      <Sfx at={coup} file="stamp_slam.wav" volume={0.8} />
      <Sfx at={coup + 4} file="whoosh_fast.wav" volume={0.5} />
      <Sfx at={death} file="heartbeat_low.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── C · 34 years, the Black Sea, Crimea ───────────── */
const CRIMEA: [number, number] = [34.1, 45.0];
const Cc: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const yrs = L(at(53, 'चौंतीस'));
  const bigger = L(at(53, 'बड़ा'));
  const ottoman = L(at(53, 'Ottoman'));
  const black = L(at(53, 'Black'));
  const tag = L(at(53, 'सत्रह'));
  const crimea = L(at(53, 'Crimea'));
  const remember = L(at(53, 'याद'));
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 38, lat: 52, zoom: 1.3 }, { at: ottoman, lon: 34, lat: 47, zoom: 1.9, dur: 90 }, { at: crimea, lon: 34, lat: 45.3, zoom: 3.2, dur: 70 }]}
        overlay={
          <>
            <MapLabel lon={25} lat={43.2} text="Ottoman Empire" start={ottoman} exit={crimea - 20} size={110} />
            <MapLabel lon={34} lat={43.3} text="Black Sea 🌊" start={black} size={90} color="#CFE7FF" />
            <Pin lon={CRIMEA[0]} lat={CRIMEA[1]} label="Crimea" start={crimea} />
            <At lon={36.6} lat={46.7} start={remember} over={1.2}><div style={{ ...hand(100, RC.yellow) }}>📌 नाम याद रखना!</div></At>
          </>
        }>
        <Fill id="russia_1725" color={RC.peterGreen} start={0} dur={1} opacity={0.55} exit={bigger + 40} />
        <Fill id="ottoman" color={RC.ottoman} start={ottoman - 10} opacity={0.5} />
        <Fill id="crimean_khanate" color={RC.ottoman} colors={[[crimea + 10, RC.peterGreen]]} start={ottoman} opacity={0.6} pulseAt={[crimea + 10, remember]} />
        <Fill id="russia_1796" color={RC.peterGreen} start={bigger} mode="flood" origin={[37.6, 55.7]} dur={110} opacity={0.58} />
      </RMap>
      <BigNumber x={W * 0.86} y={H * 0.8} to={34} start={yrs} dur={30} size={190} sub="साल राज" />
      <YearTag text="1783" start={tag} />
      <Sfx at={bigger} file="riser.wav" volume={0.4} />
      <Sfx at={crimea + 10} file="pop_low.wav" volume={0.6} />
      <Sfx at={remember} file="bell_ding.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

/* ───────────── D · Potemkin villages ───────────── */
const D: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const phrase = L(at(54, 'Potemkin'));
  const tour = L(at(54, 'Catherine'));
  const potemkin = L(at(54, 'Potemkin', 1));
  const fake = L(at(54, 'नक़ली'));
  const show = L(at(54, 'दिखाने'));
  const myth = L(at(54, 'myth'));
  const enemies = L(at(54, 'दुश्मनों'));
  const still = L(at(54, 'phrase', 1));
  const behind = ramp(frame, myth - 10, 40, ease.inOut);
  // the barge sails in on the river, stops beside the village while Catherine admires it, then leaves
  const bargeX = W * (-0.32 + 0.51 * ramp(frame, tour, 150, ease.out) - 0.5 * ramp(frame, myth - 10, 60, ease.in));
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_riverbank_1787.png" from={0} sky="#BFE0F4" ground="#7FA05A" />
      <Camera from={0} drift={0.003} focus={[W * 0.55, H * 0.9]}>
        <TypeOn text="“Potemkin village”" x={W * 0.5} y={H * 0.1} start={phrase} size={140} color={RC.yellow} exit={tour} />
        {frame >= tour && frame < myth + 50 && (
          <div style={{ position: 'absolute', left: bargeX, top: H * 0.42 + Math.sin(frame / 14) * 8, transform: 'scale(0.8)', transformOrigin: '0 0' }}>
            <div style={{ position: 'relative', width: W * 0.28, height: H * 0.24 }}>
              <div style={{ position: 'absolute', left: W * 0.09, top: -H * 0.2 }}><Char who="catherine_great" x={0} y={H * 0.3} height={H * 0.32} start={0} legs={false} gestures={[[0, 'wave'], [fake, 'present'], [show, 'cheer']]} moods={[[0, 'smile'], [show, 'grin']]} /></div>
              <RImg src="props/royal_barge.png" w={W * 0.28} h={H * 0.24} label="🚣 barge" />
            </div>
          </div>
        )}
        <div style={{ position: 'absolute', left: W * 0.38, top: H * 0.3, width: W * 0.54, height: H * 0.5, transform: `perspective(1600px) rotateY(${behind * 160}deg)`, transformStyle: 'preserve-3d' }}>
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}><RImg src="props/potemkin_facade_front.png" w={W * 0.54} h={H * 0.5} label="🏠🏠🏠 pretty village" /></div>
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}><RImg src="props/potemkin_facade_back.png" w={W * 0.54} h={H * 0.5} label="🪵 just planks!" /></div>
        </div>
        <Char who="potemkin" x={W * 0.13} y={H * 0.94} height={H * 0.5} start={phrase - 30} gestures={[[0, 'down'], [potemkin, 'present'], [fake, 'wave'], [myth, 'shrug']]} moods={[[potemkin, 'grin'], [myth, 'worried']]} />
        <TypeOn text="Potemkin" x={W * 0.13} y={H * 0.38} start={potemkin + 4} size={90} color={RC.blue} />
        <TypeOn text="सब ख़ुशहाल है! 😁" x={W * 0.68} y={H * 0.22} start={show} size={100} color={RC.white} exit={myth} />
        <Stamp text="EXAGGERATED?" x={W * 0.62} y={H * 0.2} start={myth + 20} size={120} />
        <PlateText text="दुश्मनों ने बढ़ा-चढ़ाकर फैलाई" x={W * 0.62} y={H * 0.32} start={enemies} size={84} color={RC.white} />
        <TypeOn text="phrase आज भी: किसी भी दिखावे के लिए 🎭" x={W * 0.5} y={H * 0.92} start={still} size={84} color={RC.yellow} />
      </Camera>
      <Sfx at={myth - 10} file="whoosh_soft.wav" volume={0.5} />
      <Sfx at={myth + 20} file="stamp_slam.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── E · letters to philosophers ───────────── */
const E: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const letters = L(at(55, 'letters'));
  const philosophers = L(at(55, 'philosophers'));
  const freedom = L(at(55, 'आज़ादी'));
  return (
    <GreyStage>
      <Camera from={0}>
        <Char who="catherine_great" x={W * 0.32} y={H * 0.96} height={H * 0.6} start={0} gestures={[[0, 'hold'], [freedom, 'present']]} moods={[[0, 'smile'], [freedom, 'smug']]} />
        <PopIn x={W * 0.44} y={H * 0.74} start={4}><RImg src="props/books_quill.png" w={H * 0.26} h={H * 0.26} label="📚✒️" /></PopIn>
        <Card src="cards/card_voltaire.png" x={W * 0.8} y={H * 0.46} w={W * 0.16} start={philosophers} name="Voltaire" tilt={4} />
        <Flow3 start={letters} />
        <TypeOn text="आज़ादी! तर्क! 💡" x={W * 0.6} y={H * 0.16} start={freedom} size={110} color={RC.white} />
        <TypeOn text="Enlightened? 🤔" x={W * 0.6} y={H * 0.28} start={freedom + 40} size={110} color={RC.yellow} />
      </Camera>
      <Sfx at={letters} file="paper_swish.wav" volume={0.5} />
    </GreyStage>
  );
};
const Flow3: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => {
        const u = ramp(frame, start + i * 18, 50, ease.inOut);
        if (frame < start + i * 18 || u >= 1) return null;
        const x = W * (0.42 + 0.34 * u), y = H * (0.5 - Math.sin(u * Math.PI) * 0.22);
        return <div key={i} style={{ position: 'absolute', left: x - 80, top: y - 60, transform: `rotate(${u * 30 - 10}deg)` }}><RImg src="props/letter_sealed.png" w={160} h={120} label="✉️" /></div>;
      })}
    </>
  );
};

/* ───────────── F · serfs and Pugachev ───────────── */
const F: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const reality = L(at(56, 'हक़ीक़त'));
  const slaves = L(at(56, 'ग़ुलाम,'));
  const sold = L(at(56, 'बेचा'));
  const tag = L(at(56, 'सत्रह'));
  const pug = L(at(56, 'Pugachev'));
  const tsar = L(at(56, 'Tsar'));
  const revolt = L(at(56, 'बग़ावत'));
  const crushed = L(at(56, 'कुचल'));
  const map = frame >= tag - 6;
  return (
    <AbsoluteFill>
      {!map ? (
        <GreyStage>
          <Camera from={0} drift={0.004}>
            <TypeOn text="ज़मीन पर हक़ीक़त 🔄" x={W * 0.56} y={H * 0.1} start={reality} size={110} color={RC.white} />
            {[0, 1, 2].map((i) => (
              <Char key={i} who={i === 1 ? 'serf_woman' : 'serf_worker'} seed={`sf${i}`} x={W * (0.42 + i * 0.16)} y={H * 0.93} height={H * 0.46} start={reality + 10 + i * 5} moods={[[0, 'sad']]} gestures={[[0, 'down']]} />
            ))}
            <TypeOn text="serf = लगभग ग़ुलाम ⛓️" x={W * 0.58} y={H * 0.26} start={slaves} size={110} color={RC.danger} />
            <PopIn x={W * 0.58} y={H * 0.4} start={sold} tilt={-6}><div style={{ background: '#F6EBCF', padding: '20px 40px', borderRadius: 20, ...hand(90, '#3A2616'), textShadow: 'none', boxShadow: '0 14px 30px rgba(0,0,0,0.35)' }}>🏷️ ज़मीन के साथ बिकाऊ</div></PopIn>
          </Camera>
          <Host x={W * 0.14} y={H * 0.92} height={H * 0.52} offset={base} start={0} gestures={[[0, 'present'], [sold, 'handsHead']]} moods={[[0, 'neutral'], [slaves, 'sad'], [sold, 'shocked']]} />
        </GreyStage>
      ) : (
        <AbsoluteFill>
          <RMap view="ru_west" cam={[{ at: 0, lon: 50, lat: 54, zoom: 1.8 }, { at: crushed, lon: 50, lat: 54, zoom: 2.0, dur: 60 }]}
            overlay={
              <>
                <At lon={52} lat={54.6} start={pug} over={1.2}><div style={{ textAlign: 'center' }}><RImg src="chars/pugachev.png" w={250} h={300} label="Pugachev" /><div style={hand(90, RC.yellow)}>Pugachev</div></div></At>
                <At lon={52} lat={57.3} start={tsar}><div style={{ ...hand(84, RC.white) }}>“मैं ही Tsar हूँ!” 👑</div></At>
              </>
            }>
            <Fill id="russia_1796" color={RC.peterGreen} start={0} dur={1} opacity={0.5} />
            <Fill id="pugachev_revolt" color={RC.stampRed} start={revolt - 20} mode="flood" origin={[51.5, 51.8]} dur={60} opacity={0.6} exit={crushed + 30} />
          </RMap>
          <RedX x={W * 0.52} y={H * 0.46} w={W * 0.3} start={crushed} />
          <TypeOn text="बेरहमी से कुचला" x={W * 0.5} y={H * 0.86} start={crushed + 10} size={110} color={RC.danger} />
          <YearTag text="1773" start={tag} />
        </AbsoluteFill>
      )}
      <Sfx at={sold} file="stamp_slam.wav" volume={0.4} />
      <Sfx at={revolt - 20} file="whoosh_big.wav" volume={0.5} />
      <Sfx at={crushed} file="impact_boom.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── G · pressure builds ───────────── */
const G: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const bigger = L(at(57, 'बड़ा'));
  const below = L(at(57, 'नीचे'));
  const pressure = L(at(57, 'दबाव'));
  const g = ramp(frame, bigger, 60, ease.out);
  const p = ramp(frame, below, 60, ease.out);
  const sh = H * (0.6 - p * 0.16); // the serf shrinks under the load, feet stay on the floor
  const sack = ramp(frame, below - 10, 40, ease.out);
  return (
    <GreyStage>
      <Camera from={0}>
        <div style={{ position: 'absolute', left: W * 0.3, top: H * (0.6 - g * 0.1), transform: `translate(-50%,-50%) scale(${1 + g * 0.9})` }}><RImg src="props/crown_catherine.png" w={H * 0.24} h={H * 0.24} label="👑" /></div>
        <TypeOn text="Empire ⬆️" x={W * 0.3} y={H * 0.17} start={bigger} size={120} color={RC.green} />
        <Char who="serf_worker" x={W * 0.7} y={H * 0.94} height={sh} start={2} moods={[[0, 'sad']]} gestures={[[0, 'handsHead']]} shake={[below, below + 300]} />
        {sack > 0 && (
          <div style={{ position: 'absolute', left: W * 0.7, top: H * 0.94 - sh * 0.93, transform: `translate(-50%,-100%) scale(${0.4 + sack * 0.45 + p * 0.15})`, transformOrigin: '50% 100%', opacity: Math.min(1, sack * 3) }}>
            <RImg src="props/tribute_sack.png" w={H * 0.26} h={H * 0.26} label="💰" />
          </div>
        )}
        <TypeOn text="किसान ⬇️" x={W * 0.7} y={H * 0.17} start={below} size={120} color={RC.danger} />
        <TypeOn text="दबाव · 100 साल तक जमा होता रहेगा ⏳" x={W * 0.38} y={H * 0.88} start={pressure} size={96} color={RC.yellow} />
      </Camera>
      <Sfx at={pressure} file="heartbeat_low.wav" volume={0.5} />
    </GreyStage>
  );
};

const SHOTS: [number, React.FC<{ base: number }>][] = [
  [C6_FROM, A],
  [P(52), B],
  [P(53), Cc],
  [P(54), D],
  [P(55), E],
  [P(56), F],
  [P(57), G],
];

export const C06Catherine: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map(([from, Comp], i) => {
      const to = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : C6_TO;
      return (
        <Sequence key={i} from={from - C6_FROM} durationInFrames={to - from}>
          <Comp base={from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
