import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, Card, Flash, GreyStage, Iris, PopIn, RC, RImg, Stamp, TypeOn, YearTag, hand } from '../kit/core';
import { Candle, LoopWheel, PeopleGrid } from '../kit/devices';
import { Host } from '../kit/Host';
import { Char } from '../kit/cast';
import { BgPlate, Fire, Glyph, Smoke, Snow } from '../kit/scene';
import { At, DashCircle, Fill, Flow, MapLabel, Pin, RMap, Route } from '../map/RMap';

/**
 * CHAPTER 9 · STALIN (P76–P84): 1924 → 1945.
 * A  P76  1924: Lenin's card gets the black ribbon → Stalin's card; his name in dark red
 * B  P77  smoking chimneys pop up across the USSR, a tractor; grain sacks fly out of Ukraine and Kazakhstan; famine
 * C  P78  the Terror: a group photo, faces erased one by one; 6,81,692 (official, 1937–38); camps
 * D  P79  August 1939: Stalin and Hitler cards meet in the middle; Poland torn in two — the Pact
 * E  P80  22 June 1941 + iris: three thick grey arrows drive east; the pact burns
 * F  P81  Leningrad: siege circle, 872 days → Stalingrad: red pincers close
 * G  P82  street by street, floor by floor; February 1943 the German army surrenders
 * H  P83  1945 Berlin; 2,70,00,000 Soviet dead — rows of candles light up
 * I  P84  a superpower — Eastern Europe goes red; the loop: order for freedom; the price
 */
export const C9_FROM = CHAPTERS[8].from;
export const C9_TO = CHAPTERS[9].card;
const P = (n: number) => para(n).f - 6;
const MOSCOW: [number, number] = [37.62, 55.75];

/* ───────────── A · Stalin takes over ───────────── */
const A: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const tag = L(at(76, 'उन्नीस'));
  const died = L(at(76, 'मौत'));
  const power = L(at(76, 'धीरे-धीरे'));
  const stalin = L(at(76, 'Joseph'));
  return (
    <GreyStage>
      <Camera from={0}>
        <Card src="cards/card_lenin.png" x={W * 0.38} y={H * 0.46} w={W * 0.18} start={2} name="Lenin" nameColor={RC.danger} ribbonAt={died} grey={died} />
        <Card src="cards/card_stalin.png" x={W * 0.66} y={H * 0.46} w={W * 0.21} start={power} name="" tilt={3} />
        <TypeOn text="Joseph Stalin" x={W * 0.66} y={H * 0.86} start={stalin} size={140} color={RC.danger} />
        <TypeOn text="सारी ताक़त → एक आदमी" x={W * 0.56} y={H * 0.12} start={power} size={100} color={RC.white} />
      </Camera>
      <Host x={W * 0.13} y={H * 0.92} height={H * 0.5} offset={base} start={0} gestures={[[0, 'present'], [stalin, 'handsHead']]} moods={[[0, 'neutral'], [stalin, 'worried']]} />
      <YearTag text="1924" start={tag} />
      <Sfx at={died} file="bell_toll.wav" volume={0.45} />
      <Sfx at={stalin} file="sub_drop.wav" volume={0.5} />
    </GreyStage>
  );
};

/* ───────────── B · industry and famine ───────────── */
const CITIES: [number, number][] = [[37.6, 55.8], [30.3, 59.9], [60.6, 56.8], [61.4, 55.2], [82.9, 55.0], [73.4, 54.9], [49.1, 55.8], [44.5, 48.7], [36.2, 50.0], [87.1, 53.8], [104.3, 52.3], [58.98, 53.4]];
const B: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const want = L(at(77, 'industrial'));
  const fact = L(at(77, 'Factories'));
  const land = L(at(77, 'किसानों'));
  const collective = L(at(77, 'collective'));
  const tag = L(at(77, 'उन्नीस'));
  const died = L(at(77, 'लाखों'));
  const ukr = L(at(77, 'Ukraine'));
  return (
    <AbsoluteFill>
      <RMap view="eurasia" cam={[{ at: 0, lon: 70, lat: 55, zoom: 1.35 }, { at: land, lon: 50, lat: 50, zoom: 1.7, dur: 120 }]}
        overlay={
          <>
            {CITIES.map(([lo, la], i) => <At key={i} lon={lo} lat={la} start={fact + i * 5}><div style={{ position: 'relative' }}><Smoke x={30} y={-60} size={50} start={0} /><RImg src="props/factory_chimneys.png" w={130} h={130} label="🏭" /></div></At>)}
            <At lon={45} lat={53} start={collective} over={1.2}><RImg src="props/tractor_1930.png" w={200} h={160} label="🚜" /></At>
            <Flow from={[31, 49]} to={MOSCOW} start={land + 20} count={8} every={14} life={50}><RImg src="props/grain_sack.png" w={90} h={90} label="🌾" /></Flow>
            <Flow from={[67, 48]} to={MOSCOW} start={land + 30} count={8} every={14} life={60}><RImg src="props/grain_sack.png" w={90} h={90} label="🌾" /></Flow>
            <MapLabel lon={31} lat={47.6} text="Ukraine" start={ukr} size={100} color={RC.yellow} />
            <MapLabel lon={68} lat={46.4} text="Kazakhstan" start={ukr + 20} size={100} color={RC.yellow} />
          </>
        }>
        <Fill id="ussr_1922" color={RC.sovietRed} start={0} dur={1} opacity={0.55} />
        <Fill id="rep_ukraine" color="#4A4A4A" start={died} opacity={0.5} />
        <Fill id="rep_kazakhstan" color="#4A4A4A" start={died + 10} opacity={0.5} />
      </RMap>
      <TypeOn text="खेती का देश → industrial superpower 🏭" x={W * 0.5} y={H * 0.1} start={want} size={100} color={RC.white} exit={land} />
      <TypeOn text="ज़मीन छीनी → collective farms" x={W * 0.5} y={H * 0.1} start={land} size={100} color={RC.danger} exit={tag} />
      <TypeOn text="1932–33 · अकाल 💀" x={W * 0.5} y={H * 0.1} start={tag} size={120} color={RC.danger} />
      <PeopleGrid x={W * 0.84} y={H * 0.84} cols={10} rows={2} size={44} start={died - 10} greyFrom={died} perRow={10} />
      <TypeOn text="लाखों भूख से मरे" x={W * 0.84} y={H * 0.72} start={died} size={80} color={RC.white} />
      <Sfx at={fact} file="pop.wav" volume={0.5} />
      <Sfx at={died} file="sub_drop.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── C · the Terror ───────────── */
const Cc: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const fear = L(at(78, 'डर'));
  const tag = L(at(78, 'उन्नीस'));
  const party = L(at(78, 'Party'));
  const n = L(at(78, 'सात'));
  const camps = L(at(78, 'labour'));
  const faces = 8;
  return (
    <GreyStage>
      <Camera from={0}>
        <TypeOn text="डर का दौर" x={W * 0.5} y={H * 0.1} start={fear} size={140} color={RC.danger} />
        <div style={{ position: 'absolute', left: W * 0.16, top: H * 0.24, width: W * 0.5, height: H * 0.42, background: '#D8D2C4', borderRadius: 20, boxShadow: '0 30px 60px rgba(0,0,0,0.35)', transform: 'rotate(-2deg)', filter: 'sepia(0.6)' }}>
          {Array.from({ length: faces }, (_, i) => {
            const erased = ramp(frame, party + i * 16, 10, ease.out);
            const x = (i % 4) * 0.24 + 0.06, y = i < 4 ? 0.12 : 0.52;
            return (
              <div key={i} style={{ position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: '18%', height: '38%', opacity: 1 - erased }}>
                <svg viewBox="0 0 20 28" style={{ width: '100%', height: '100%' }}><circle cx={10} cy={7} r={5.5} fill="#5A5248" /><path d="M1 28 Q1 14 10 14 Q19 14 19 28 Z" fill="#5A5248" /></svg>
              </div>
            );
          })}
          {frame >= party && frame < party + faces * 16 + 10 && (() => {
            const i = Math.min(faces - 1, Math.floor((frame - party) / 16));
            const x = (i % 4) * 0.24 + 0.1, y = i < 4 ? 0.2 : 0.6;
            return <div style={{ position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, transform: `translate(${Math.sin(frame / 2) * 10}px, ${Math.cos(frame / 2) * 8}px) rotate(-30deg)` }}><Glyph g="🧽" size={110} /></div>;
          })()}
        </div>
        <BigNumber x={W * 0.8} y={H * 0.36} to={681692} start={n - 10} dur={50} size={170} sub="सरकारी आँकड़ा · 1937–38" />
        <PopIn x={W * 0.8} y={H * 0.72} start={camps}><div style={{ ...hand(100, RC.white), textAlign: 'center' }}>⛓️ labour camps<br /><span style={{ color: RC.danger, fontSize: 80 }}>Gulag · लाखों</span></div></PopIn>
        <TypeOn text="Party · Army generals · आम लोग" x={W * 0.41} y={H * 0.78} start={party} size={84} color={RC.sub} />
      </Camera>
      <YearTag text="1937" start={tag} />
      {Array.from({ length: faces }, (_, i) => <Sfx key={i} at={party + i * 16} file="paper_slide.wav" volume={0.3} />)}
    </GreyStage>
  );
};

/* ───────────── D · the 1939 pact ───────────── */
const D: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const twist = L(at(79, 'twist,'));
  const tag = L(at(79, 'उन्नीस'));
  const hitler = L(at(79, 'Hitler'));
  const deal = L(at(79, 'समझौता'));
  const noAttack = L(at(79, 'एक-दूसरे'));
  const secret = L(at(79, 'चुपके'));
  const poland = L(at(79, 'Poland'));
  const split = L(at(79, 'बाँट'));
  const time = L(at(79, 'वक़्त'));
  const meet = ramp(frame, deal - 10, 30, ease.inOut);
  const tear = ramp(frame, split, 20, ease.out);
  return (
    <GreyStage>
      <Camera from={0}>
        <TypeOn text="twist 😳" x={W * 0.5} y={H * 0.1} start={twist} size={120} color={RC.yellow} exit={tag + 20} />
        <Card src="cards/card_stalin.png" x={W * (0.2 + meet * 0.16)} y={H * 0.42} w={W * 0.16} start={tag} name="Stalin" nameColor={RC.danger} tilt={-3} />
        <Card src="cards/card_hitler.png" x={W * (0.8 - meet * 0.16)} y={H * 0.42} w={W * 0.16} start={hitler} name="Hitler" nameColor="#555" tilt={3} />
        <PopIn x={W * 0.5} y={H * 0.42} start={deal + 20}><Glyph g="🤝" size={200} /></PopIn>
        <Stamp text="PACT" x={W * 0.5} y={H * 0.16} start={noAttack} size={140} color={RC.danger} />
        {frame >= secret && (
          <div style={{ position: 'absolute', left: W * 0.5 - 260, top: H * 0.66 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ position: 'absolute', left: i * 260 + (i ? 1 : -1) * tear * 70, top: 0, width: 260, height: 300, overflow: 'hidden', transform: `rotate(${(i ? 1 : -1) * tear * 8}deg)` }}>
                <div style={{ position: 'absolute', left: -i * 260, width: 520, height: 300, background: '#F4F1EA', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', ...hand(90, '#333'), textShadow: 'none',
                  clipPath: 'polygon(0 0, 50% 0, 46% 30%, 54% 60%, 48% 100%, 0 100%, 0 0, 100% 0, 100% 100%, 48% 100%)' }}>🗺️ Poland</div>
              </div>
            ))}
          </div>
        )}
        <TypeOn text="चुपके से बँटवारा ✂️" x={W * 0.5} y={H * 0.94} start={poland} size={90} color={RC.danger} />
        <TypeOn text="वक़्त ख़रीद लिया? ⏳" x={W * 0.82} y={H * 0.8} start={time} size={84} color={RC.white} />
      </Camera>
      <YearTag text="August 1939" start={tag} />
      <Sfx at={deal + 20} file="pop_low.wav" volume={0.5} />
      <Sfx at={noAttack} file="stamp_slam.wav" volume={0.6} />
      <Sfx at={split} file="paper_tear.wav" volume={0.7} />
    </GreyStage>
  );
};

/* ───────────── E · 22 June 1941 ───────────── */
const E: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const tag = L(at(80, 'उन्नीस'));
  const broke = L(at(80, 'तोड़ा,'));
  const attack = L(at(80, 'हमला'));
  const biggest = L(at(80, 'सबसे'));
  const warned = L(at(80, 'चेतावनियाँ'));
  const ignored = L(at(80, 'भरोसा'));
  return (
    <AbsoluteFill>
      <RMap view="europe_wide" cam={[{ at: 0, lon: 22, lat: 52, zoom: 1.3 }, { at: attack, lon: 30, lat: 53, zoom: 1.5, dur: 140 }]}
        overlay={
          <>
            <At lon={14} lat={57.5} start={broke}><div style={{ position: 'relative' }}><div style={{ background: '#F4F1EA', padding: '20px 40px', borderRadius: 14, ...hand(70, '#333'), textShadow: 'none' }}>📜 Pact</div><Fire x={120} y={60} size={110} start={6} /></div></At>
            <At lon={46} lat={50} start={warned}><div style={{ ...hand(80, RC.white), textAlign: 'center' }}>⚠️⚠️⚠️ चेतावनियाँ<br /><span style={{ color: RC.danger }}>भरोसा नहीं किया 🙉</span></div></At>
          </>
        }>
        <Fill id="ussr_1922" color={RC.sovietRed} start={0} dur={1} opacity={0.55} />
        <Fill id="germany_1941" color={RC.germany} start={0} opacity={0.65} />
        <Route pts={[[21, 54.5], [26, 56.4], [29, 58.4], [30.3, 59.6]]} start={attack} dur={60} width={60} endWidth={44} color="#5E6166" head="#2A2A2A" />
        <Route pts={[[22, 52.4], [27.6, 53.9], [32, 54.6], [36.2, 55.4]]} start={attack + 8} dur={60} width={64} endWidth={46} color="#5E6166" head="#2A2A2A" />
        <Route pts={[[23.5, 50.2], [28.5, 49.6], [33, 48.6], [38, 47.6]]} start={attack + 16} dur={60} width={60} endWidth={44} color="#5E6166" head="#2A2A2A" />
      </RMap>
      <TypeOn text="इतिहास का सबसे बड़ा हमला" x={W * 0.5} y={H * 0.12} start={biggest} size={120} color={RC.danger} />
      <YearTag text="22 June 1941" start={tag} />
      <Iris at={tag + 2} hold={40} />
      <Sfx at={attack} file="timpani_roll.wav" volume={0.55} />
      <Sfx at={attack + 20} file="impact_boom.wav" volume={0.5} />
      <Sfx at={ignored} file="pluck_down.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── F · Leningrad, Stalingrad (map) ───────────── */
const LEN: [number, number] = [30.32, 59.94];
const STG: [number, number] = [44.5, 48.7];
const F: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const len = L(at(81, 'Leningrad'));
  const days = L(at(81, 'आठ'));
  const died = L(at(81, 'लाखों'));
  const stg = L(at(81, 'Stalingrad'));
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 31, lat: 59, zoom: 2.6 }, { at: stg - 20, lon: 43, lat: 50, zoom: 2.1, dur: 70 }]}
        overlay={<><Pin lon={LEN[0]} lat={LEN[1]} label="Leningrad" start={len} /><Pin lon={STG[0]} lat={STG[1]} label="Stalingrad" start={stg} side="l" />
          <At lon={33.5} lat={58.2} start={died}><div style={{ ...hand(80, RC.white) }}>🥶 भूख + ठंड</div></At></>}>
        <Fill id="ussr_1922" color={RC.sovietRed} start={0} dur={1} opacity={0.5} />
        <DashCircle at={LEN} r={180} start={len + 10} />
        <Route pts={[[39, 50.4], [42, 49.6], [44.0, 48.95]]} start={stg + 10} dur={40} width={34} color="#E0302A" head={RC.stampRed} />
        <Route pts={[[46.5, 47.0], [45.3, 47.9], [44.7, 48.5]]} start={stg + 18} dur={40} width={34} color="#E0302A" head={RC.stampRed} />
      </RMap>
      <BigNumber x={W * 0.22} y={H * 0.82} to={872} start={days} dur={40} size={200} sub="दिन घेराबंदी" exit={stg} />
      <TypeOn text="जंग का रुख़ यहीं मुड़ा ↩️" x={W * 0.5} y={H * 0.12} start={L(at(81, 'रुख़'))} size={110} color={RC.yellow} />
      <Sfx at={len + 10} file="tick.wav" volume={0.5} />
      <Sfx at={stg + 10} file="whoosh_fast.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── G · Stalingrad street by street ───────────── */
const G: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const street = L(at(82, 'गली-गली,'));
  const floor = L(at(82, 'एक'));
  const german = L(at(82, 'German.'));
  const tag = L(at(82, 'उन्नीस'));
  const surrender = L(at(82, 'हथियार'));
  const retreat = L(at(82, 'पीछे'));
  const flagX = W * (0.12 + 0.18 * Math.min(4, Math.floor(Math.max(0, frame - street) / 40)));
  const section = frame >= floor - 10 && frame < tag - 10;
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_stalingrad_ruins_1942.png" from={0} sky="#8E949C" ground="#C9CED6" />
      <Snow start={0} density={70} />
      <Camera from={0}>
        {!section && frame < tag - 10 && (
          <div style={{ position: 'absolute', left: flagX, top: H * 0.3, transition: 'none' }}>
            <svg width={160} height={240} viewBox="0 0 16 24"><rect x={1} y={0} width={0.8} height={24} fill="#5A4030" /><path d={`M1.8 1 L15 ${1.6 + Math.sin(frame / 6) * 0.6} L15 ${9 + Math.sin(frame / 6) * 0.6} L1.8 8 Z`} fill="#C8352B" /></svg>
          </div>
        )}
        {section && (
          <div style={{ position: 'absolute', left: W * 0.3, top: H * 0.12, width: W * 0.4, height: H * 0.78, background: '#7A7068', border: '10px solid #4A4038', borderRadius: 8 }}>
            {[0, 1, 2].map((k) => <div key={k} style={{ position: 'absolute', left: 0, right: 0, top: `${(k + 1) * 33}%`, height: 10, background: '#4A4038' }} />)}
            <div style={{ position: 'absolute', left: '50%', top: '4%', transform: 'translateX(-50%)', ...hand(70, RC.white) }}>🏚️</div>
          </div>
        )}
        {section && <Char who="soviet_soldier_ww2" x={W * 0.42} y={H * 0.88} height={H * 0.24} start={floor - 6} gestures={[[0, 'fist']]} moods={[[0, 'angry']]} />}
        {section && <Char who="german_soldier_ww2" x={W * 0.58} y={H * 0.62} height={H * 0.24} start={german - 6} flip gestures={[[0, 'fist']]} moods={[[0, 'angry']]} />}
        {section && <TypeOn text="एक floor: Soviet ⬇️ · दूसरा: German ⬆️" x={W * 0.5} y={H * 0.07} start={floor} size={84} color={RC.yellow} />}
        {frame >= tag - 10 && (
          <>
            <Char who="german_general_surrender" x={W * 0.62} y={H * 0.96} height={H * 0.5} start={tag - 10} flip gestures={[[0, 'down'], [surrender, 'cheer']]} moods={[[0, 'sad'], [surrender, 'worried']]} />
            {[0, 1, 2].map((i) => <Char key={i} who="soviet_soldier_ww2" seed={`ss${i}`} x={W * (0.16 + i * 0.1)} y={H * 0.96} height={H * 0.4} start={tag - 6 + i * 4} gestures={[[0, 'point'], [surrender + 20, 'cheer']]} moods={[[0, 'angry'], [surrender + 20, 'grin']]} hopAt={[surrender + 30]} />)}
            <TypeOn text="पहली बार Hitler की पूरी फ़ौज ने हथियार डाले" x={W * 0.5} y={H * 0.12} start={surrender} size={90} color={RC.yellow} />
            <TypeOn text="अब बस पीछे ⬅️" x={W * 0.5} y={H * 0.24} start={retreat} size={90} color={RC.white} />
          </>
        )}
        <TypeOn text="गली-गली · घर-घर" x={W * 0.5} y={H * 0.12} start={street} size={130} color={RC.danger} exit={floor - 10} />
      </Camera>
      <YearTag text={frame < tag ? '1942' : 'February 1943'} start={2} />
      <Sfx at={street} file="musket_volley.wav" volume={0.3} />
      <Sfx at={surrender} file="sting_crown.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

/* ───────────── H · the cost ───────────── */
const Hh: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const berlin = L(at(83, 'Berlin'));
  const n = L(at(83, 'दो'));
  const most = L(at(83, 'इतना'));
  return (
    <GreyStage dark>
      <Camera from={0} drift={0.006}>
        <TypeOn text="1945 · Berlin 🏁" x={W * 0.5} y={H * 0.1} start={berlin} size={110} color="#E8E8E8" />
        <BigNumber x={W * 0.5} y={H * 0.32} to={27000000} start={n - 10} dur={60} size={240} sub="Soviet लोग मारे गए" color="#F2F2F2" />
        {Array.from({ length: 24 }, (_, i) => (
          <Candle key={i} x={W * (0.08 + (i % 12) * 0.076)} y={H * (0.74 + Math.floor(i / 12) * 0.18)} size={90} start={n + i * 4} />
        ))}
        <TypeOn text="किसी और देश का इतना नुक़सान नहीं" x={W * 0.5} y={H * 0.48} start={most} size={90} color={RC.yellow} />
      </Camera>
      <Sfx at={n} file="bell_toll.wav" volume={0.45} />
    </GreyStage>
  );
};

/* ───────────── I · superpower — at what price ───────────── */
const I: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const won = L(at(84, 'जीता,'));
  const sp = L(at(84, 'superpowers'));
  const price = L(at(84, 'कीमत?'));
  const stage = frame >= price - 10;
  return (
    <AbsoluteFill>
      {!stage ? (
        <RMap view="europe_wide" cam={[{ at: 0, lon: 30, lat: 53, zoom: 1.3 }, { at: 4, lon: 34, lat: 52, zoom: 1.05, dur: 100 }]}
          overlay={<At lon={42} lat={58} start={sp} over={1.2}><div style={{ background: '#C8352B', padding: '24px 50px', borderRadius: 60, ...hand(100, '#FFD84A'), boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>⭐ SUPERPOWER</div></At>}>
          <Fill id="ussr_1945" color={RC.sovietRed} start={0} dur={1} opacity={0.6} />
          <Fill id="eastern_bloc" color={RC.sovietRed} start={won} mode="flood" origin={[30, 52]} dur={70} opacity={0.5} />
        </RMap>
      ) : (
        <GreyStage>
          <Camera from={price - 10}>
            <LoopWheel x={W * 0.6} y={H * 0.52} r={H * 0.27} start={price - 10} steps={[[price - 6, 2]]} center={{ text: 'कीमत?', at: price, color: RC.danger }} />
          </Camera>
          <TypeOn text="आज़ादी 🕊️ + करोड़ों ज़िंदगियाँ" x={W * 0.6} y={H * 0.92} start={price + 30} size={100} color={RC.danger} />
          <Host x={W * 0.14} y={H * 0.92} height={H * 0.52} offset={base} start={price - 10} gestures={[[price - 10, 'shrug']]} moods={[[price - 10, 'sad']]} />
        </GreyStage>
      )}
      <Sfx at={sp} file="sting_crown.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

const SHOTS: [number, React.FC<{ base: number }>][] = [
  [C9_FROM, A],
  [P(77), B],
  [P(78), Cc],
  [P(79), D],
  [P(80), E],
  [P(81), F],
  [P(82), G],
  [P(83), Hh],
  [P(84), I],
];

export const C09Stalin: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map(([from, Comp], i) => {
      const to = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : C9_TO;
      return (
        <Sequence key={i} from={from - C9_FROM} durationInFrames={to - from}>
          <Comp base={from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
