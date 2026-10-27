import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, Card, Flash, GreyStage, Iris, PopIn, RC, RImg, Stamp, TypeOn, YearTag, hand } from '../kit/core';
import { Candle, PeopleGrid, RedX } from '../kit/devices';
import { Host } from '../kit/Host';
import { Char } from '../kit/cast';
import { BgPlate, Glyph, ShockLines, Smoke } from '../kit/scene';
import { At, Fill, MapLabel, Pin, RMap, Route } from '../map/RMap';

/**
 * CHAPTER 8 · THE LAST TSAR (P67–P75): 1894 → 1922.
 * A  P67  Nicholas II and his family of seven; "God sent me to rule" ✨
 * B  P68  1904: the map swings east; Japan sinks the navy — the first Asian win over a European power; anger boils
 * C  P69  January 1905: a peaceful march with icons and banners; rifles; flash — Bloody Sunday; respect dies
 * D  P70  1914: fronts as red pincers; soldiers grey out; bread with a red X
 * E  P71  1916 palace: Rasputin whispers to the Empress; "not every story is true"
 * F  P72  February 1917 + iris: the bread line becomes a crowd; soldiers lower rifles; the crown slides off
 * G  P73  October: Lenin, a red star; red floods out of Petrograd
 * H  P74  July 1918: a cellar, seven candles go out one by one
 * I  P75  COLLAPSE #3: Reds vs Whites, arrows everywhere → 1922 the Soviet Union
 */
export const C8_FROM = CHAPTERS[7].from;
export const C8_TO = CHAPTERS[8].card;
const P = (n: number) => para(n).f - 6;
const PETROGRAD: [number, number] = [30.32, 59.94];

/* ───────────── A · Nicholas II ───────────── */
const A: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const last = L(at(67, 'आख़िरी'));
  const fam = L(at(67, 'family'));
  const didnt = L(at(67, 'शायद'));
  const god = L(at(67, 'भगवान'));
  return (
    <GreyStage>
      <Camera from={0}>
        <Card src="cards/card_nicholas_ii.png" x={W * 0.42} y={H * 0.45} w={W * 0.19} start={4} name="Nicholas II" />
        <PopIn x={W * 0.42} y={H * 0.11} start={8}><RImg src="props/crown_catherine.png" w={260} h={260} label="👑" /></PopIn>
        <TypeOn text="आख़िरी Tsar" x={W * 0.42} y={H * 0.86} start={last} size={100} color={RC.danger} />
        <Card src="cards/card_romanov_family.png" x={W * 0.74} y={H * 0.46} w={W * 0.3} h={W * 0.24} start={fam} tilt={3} name="family man 👨‍👩‍👧‍👦" />
        <TypeOn text="Tsar बनना चाहता ही नहीं था? 🤷" x={W * 0.66} y={H * 0.2} start={didnt} size={84} color={RC.sub} exit={god - 10} />
        <TypeOn text="“भगवान ने भेजा है” ✨" x={W * 0.6} y={H * 0.2} start={god} size={110} color={RC.yellow} />
      </Camera>
      <Host x={W * 0.13} y={H * 0.92} height={H * 0.5} offset={base} start={0} gestures={[[0, 'present'], [god, 'fingerUp']]} moods={[[0, 'neutral'], [god, 'smug']]} />
      <Sfx at={4} file="pop.wav" volume={0.5} />
      <Sfx at={god} file="sting_shimmer.wav" volume={0.45} />
    </GreyStage>
  );
};

/* ───────────── B · Japan 1904 ───────────── */
const B: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const east = L(at(68, 'पूरब'));
  const tag = L(at(68, 'उन्नीस'));
  const russia = L(at(68, 'Russia'));
  const japan = L(at(68, 'Japan'));
  const big = L(at(68, 'बड़ा'));
  const opposite = L(at(68, 'उल्टा'));
  const sank = L(at(68, 'डुबो'));
  const first = L(at(68, 'पहली'));
  const anger = L(at(68, 'ग़ुस्सा'));
  const sink = ramp(frame, sank - 10, 80, ease.in);
  return (
    <AbsoluteFill>
      <RMap view="eurasia" cam={[{ at: 0, lon: 70, lat: 55, zoom: 1.2 }, { at: east, lon: 132, lat: 42, zoom: 2.2, dur: 110 }]}
        overlay={
          <>
            <MapLabel lon={138} lat={37} text="Japan" start={japan} size={110} color="#FFDADA" />
            <MapLabel lon={110} lat={60} text="Russia 💪" start={russia} size={110} />
            <At lon={123} lat={45} start={big}><div style={{ ...hand(84, RC.white), textAlign: 'center' }}>बड़ा 🐘 vs छोटा 🐭</div></At>
            <At lon={126} lat={36.5} start={sank - 20}>
              <div style={{ position: 'relative', transform: `translateY(${sink * 160}px) rotate(${sink * 24}deg)`, opacity: 1 - sink * 0.8 }}><RImg src="props/warship_1904.png" w={540} h={300} label="🚢" /></div>
              {frame >= sank && [0, 1, 2, 3].map((i) => <div key={i} style={{ position: 'absolute', left: 200 + i * 40, top: 90 - ((frame - sank + i * 9) % 40) * 5, width: 34, height: 34, borderRadius: '50%', border: '4px solid #DFF4FF' }} />)}
            </At>
          </>
        }>
        <Fill id="russia_1914" color={RC.empireGold} start={0} dur={1} opacity={0.5} />
        <Fill id="japan" color="#D23A3A" start={japan} opacity={0.65} mode="pop" pulseAt={[sank]} />
      </RMap>
      <Stamp text="Japan जीता!" x={W * 0.5} y={H * 0.2} start={opposite + 10} size={130} color={RC.stampGreen} />
      <TypeOn text="पहली बार कोई Asian देश 🌏" x={W * 0.5} y={H * 0.86} start={first} size={100} color={RC.yellow} exit={anger - 10} />
      <TypeOn text="Russia के अंदर ग़ुस्सा 🔥" x={W * 0.5} y={H * 0.86} start={anger} size={110} color={RC.danger} />
      <YearTag text="1904" start={tag} />
      <Sfx at={opposite} file="sting_hit.wav" volume={0.5} />
      <Sfx at={sank} file="impact_boom.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── C · Bloody Sunday ───────────── */
const Cc: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(69, 'उन्नीस'));
  const workers = L(at(69, 'मज़दूर'));
  const fire = L(at(69, 'गोली'));
  const bloody = L(at(69, 'Bloody'));
  const respect = L(at(69, 'इज़्ज़त'));
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_palace_square_1905.png" from={0} sky="#B4BCC6" ground="#E2E6EC" />
      <Camera from={0} shake={[{ at: fire + 6, amp: 20, dur: 20 }]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Char key={i} who={i % 2 ? 'worker_woman_1917' : 'worker_1905'} seed={`bs${i}`} x={W * (0.14 + i * 0.09)} y={H * (0.96 - (i % 2) * 0.02)} height={H * 0.34} start={tag + 30 + i * 3}
            walk={[{ at: 0, x: W * (-0.2 + i * 0.09) }, { at: tag + 30, x: W * (0.14 + i * 0.09), dur: 150 }]} moods={[[0, 'smile'], [fire, 'shocked'], [bloody, 'sad']]} gestures={[[0, 'hold'], [fire, 'handsHead']]} />
        ))}
        <PopIn x={W * 0.3} y={H * 0.44} start={workers + 20} exit={fire + 4}><RImg src="props/church_banner.png" w={H * 0.26} h={H * 0.4} label="☦ banner" /></PopIn>
        <PopIn x={W * 0.48} y={H * 0.5} start={workers + 30} exit={fire}><div style={{ background: '#F6EBCF', padding: '14px 30px', borderRadius: 10, ...hand(60, '#3A2616'), textShadow: 'none' }}>📜 अर्ज़ी</div></PopIn>
        {[0, 1, 2].map((i) => <Char key={`s${i}`} who="tsarist_soldier_1914" seed={`ts${i}`} x={W * (0.7 + i * 0.1)} y={H * 0.96} height={H * 0.38} start={tag + i * 4} flip gestures={[[0, 'down'], [fire - 20, i === 0 ? 'point' : 'hips']]} moods={[[0, 'neutral'], [fire - 20, 'angry']]} />)}
        <TypeOn text="शांति से… 🕊️" x={W * 0.3} y={H * 0.14} start={workers} size={100} exit={fire} />
        <TypeOn text="Bloody Sunday" x={W * 0.5} y={H * 0.14} start={bloody} size={160} color={RC.danger} />
        <PopIn x={W * 0.42} y={H * 0.3} start={respect}><div style={{ ...hand(120, RC.white) }}>Tsar के लिए इज़्ज़त 💔</div></PopIn>
      </Camera>
      <Flash at={fire + 6} dur={6} />
      <YearTag text="January 1905" start={tag} />
      <Sfx at={fire + 6} file="musket_volley.wav" volume={0.55} />
      <Sfx at={respect} file="glass_break.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

/* ───────────── D · WWI ───────────── */
const D: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const tag = L(at(70, 'उन्नीस'));
  const noArms = L(at(70, 'हथियार'));
  const dead = L(at(70, 'लाखों'));
  const bread = L(at(70, 'रोटी'));
  return (
    <AbsoluteFill>
      <RMap view="europe_wide" cam={[{ at: 0, lon: 22, lat: 52, zoom: 1.4 }, { at: dead, lon: 26, lat: 53, zoom: 1.6, dur: 120 }]}
        overlay={<><MapLabel lon={11} lat={51} text="Germany" start={4} size={90} /><MapLabel lon={17} lat={47.6} text="Austria" start={10} size={80} /><At lon={36} lat={52} start={noArms} exit={dead - 10}><div style={{ ...hand(120, RC.white), textAlign: 'center' }}>🔫 ✗ · 🧥 ✗</div></At></>}>
        <Fill id="russia_1914" color={RC.empireGold} start={0} dur={1} opacity={0.5} />
        <Fill id="germany_modern" color={RC.germany} start={4} opacity={0.6} />
        <Route pts={[[14, 54], [19, 54.6], [23, 54.0]]} start={8} dur={50} width={44} color="#D0302A" head={RC.stampRed} />
        <Route pts={[[16, 48.2], [21, 49.6], [24.5, 50.6]]} start={14} dur={50} width={44} color="#D0302A" head={RC.stampRed} />
      </RMap>
      <PeopleGrid x={W * 0.74} y={H * 0.74} cols={12} rows={3} size={46} start={dead - 10} greyFrom={dead} perRow={10} color="#6E6A46" />
      <TypeOn text="लाखों सैनिक मारे गए" x={W * 0.74} y={H * 0.56} start={dead} size={90} color={RC.white} />
      <PopIn x={W * 0.2} y={H * 0.7} start={bread}><div style={{ position: 'relative' }}><RImg src="props/bread_loaf.png" w={400} h={300} label="🍞" /><RedX x={200} y={150} w={360} h={300} start={bread + 8} /></div></PopIn>
      <TypeOn text="रोटी की लाइनें ⬆️" x={W * 0.2} y={H * 0.88} start={bread + 6} size={100} color={RC.yellow} />
      <YearTag text="1914" start={tag} />
      <Sfx at={8} file="timpani_roll.wav" volume={0.4} />
      <Sfx at={bread + 8} file="tick.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── E · Rasputin ───────────── */
const E: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const wife = L(at(71, 'पत्नी'));
  const ras = L(at(71, 'Rasputin.'));
  const heal = L(at(71, 'बीमार'));
  const runs = L(at(71, 'देश'));
  const tag = L(at(71, 'उन्नीस'));
  const killed = L(at(71, 'मार'));
  const legend = L(at(71, 'legend'));
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_palace_interior_1916.png" from={0} sky="#4A3A2E" ground="#2E241C" dim={0.15} />
      <Camera from={0} drift={0.004}>
        <Char who="alexandra" x={W * 0.26} y={H * 0.96} height={H * 0.52} start={2} moods={[[0, 'worried'], [heal, 'smile']]} gestures={[[0, 'down']]} look2={0.8} />
        <Char who="rasputin" x={W * 0.54} y={H * 0.97} height={H * 0.6} start={ras - 10} flip gestures={[[0, 'down'], [ras + 20, 'fingerUp'], [heal, 'present']]} moods={[[0, 'smug']]} talk={[[ras, heal + 80]]} />
        <TypeOn text="Tsar की पत्नी · Alexandra" x={W * 0.3} y={H * 0.3} start={wife} size={80} color={RC.white} exit={ras - 10} />
        <TypeOn text="Rasputin" x={W * 0.54} y={H * 0.26} start={ras} size={140} color={RC.blue} />
        <TypeOn text="psst… 🤫" x={W * 0.4} y={H * 0.36} start={ras + 20} size={80} color={RC.white} exit={heal - 10} />
        <TypeOn text="बीमार बेटे को ठीक करेगा? 🙏" x={W * 0.5} y={H * 0.15} start={heal} size={90} color={RC.yellow} exit={runs - 12} />
        <TypeOn text="“देश Rasputin चला रहा है!”" x={W * 0.5} y={H * 0.15} start={runs} size={100} color={RC.danger} />
        <Stamp text="हर कहानी सच नहीं" x={W * 0.79} y={H * 0.56} start={legend} size={90} rotate={-8} />
        <TypeOn text="1916 के आख़िर में मारा गया" x={W * 0.79} y={H * 0.4} start={killed} size={80} color={RC.white} />
      </Camera>
      <YearTag text="1916" start={tag} />
      <Sfx at={legend} file="stamp_slam.wav" volume={0.55} />
    </AbsoluteFill>
  );
};

/* ───────────── F · February 1917 ───────────── */
const F: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(72, 'उन्नीस'));
  const bread = L(at(72, 'रोटी'));
  const revo = L(at(72, 'revolution'));
  const refuse = L(at(72, 'सैनिकों'));
  const days = L(at(72, 'कुछ'));
  const ended = L(at(72, 'ख़त्म।'));
  const abd = L(at(72, 'गद्दी'));
  const crownFall = ramp(frame, abd - 10, 30, ease.in);
  const stage = frame >= ended - 20;
  return (
    <AbsoluteFill>
      {!stage ? (
        <AbsoluteFill>
          <BgPlate src="bg/bg_petrograd_street_1917.png" from={0} sky="#A8B0BA" ground="#D8DEE6" />
          <Camera from={0}>
            {Array.from({ length: 7 }, (_, i) => (
              <Char key={i} who={i % 2 ? 'worker_woman_1917' : 'worker_1905'} seed={`pq${i}`} x={W * (0.1 + i * 0.075)} y={H * 0.96} height={H * 0.32} start={bread - 20 + i * 3}
                moods={[[0, 'sad'], [revo, 'angry']]} gestures={[[0, 'down'], [revo, 'fist']]} hopAt={[revo + i * 5]} />
            ))}
            {['रोटी 🍞', 'ज़मीन 🌾', 'शांति 🕊️'].map((t, i) => (
              <PopIn key={i} x={W * (0.18 + i * 0.18)} y={H * 0.42} start={revo + i * 10} tilt={i % 2 ? 4 : -4}>
                <div style={{ background: '#C8352B', padding: '18px 40px', borderRadius: 10, ...hand(80, '#fff'), boxShadow: '0 10px 24px rgba(0,0,0,0.3)' }}>{t}</div>
              </PopIn>
            ))}
            {[0, 1].map((i) => <Char key={`s${i}`} who="tsarist_soldier_1914" seed={`fs${i}`} x={W * (0.72 + i * 0.16)} y={H * 0.96} height={H * 0.38} start={refuse - 30} flip gestures={[[0, 'point'], [refuse, 'shrug']]} moods={[[0, 'angry'], [refuse, 'smile']]} />)}
            <TypeOn text="गोली नहीं चलाएँगे ✋" x={W * 0.77} y={H * 0.4} start={refuse + 10} size={80} color={RC.green} />
            <TypeOn text="revolution ✊" x={W * 0.4} y={H * 0.14} start={revo} size={150} color={RC.danger} />
          </Camera>
        </AbsoluteFill>
      ) : (
        <GreyStage>
          <Camera from={ended - 20}>
            <PopIn x={W * 0.66} y={H * 0.62} start={ended - 20}><RImg src="props/throne_gold.png" w={H * 0.5} h={H * 0.62} label="throne" /></PopIn>
            <Char who="nicholas_ii" x={W * 0.42} y={H * 0.96} height={H * 0.6} start={ended - 20} moods={[[0, 'sad'], [abd, 'shocked']]} gestures={[[0, 'down'], [abd, 'handsHead']]} />
            <div style={{ position: 'absolute', left: W * 0.42 - 110 - crownFall * 260, top: H * 0.3 + crownFall * H * 0.56, transform: `rotate(${-crownFall * 140}deg)` }}><RImg src="props/crown_catherine.png" w={220} h={220} label="👑" /></div>
            <TypeOn text="300 साल · Romanov dynasty ख़त्म" x={W * 0.5} y={H * 0.2} start={ended - 10} size={110} color={RC.danger} />
          </Camera>
        </GreyStage>
      )}
      <YearTag text="February 1917" start={tag} />
      <Iris at={tag + 2} hold={36} />
      <Sfx at={revo} file="snare_roll.wav" volume={0.4} />
      <Sfx at={abd + 18} file="thud_soft.wav" volume={0.7} />
    </AbsoluteFill>
  );
};

/* ───────────── G · October: Lenin ───────────── */
const G: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const notLast = L(at(73, 'नई'));
  const fell = L(at(73, 'टिकी।'));
  const oct = L(at(73, 'October'));
  const lenin = L(at(73, 'Lenin'));
  const seized = L(at(73, 'क़ब्ज़ा'));
  const map = frame >= seized - 20;
  return (
    <AbsoluteFill>
      {!map ? (
        <GreyStage>
          <Camera from={0}>
            <TypeOn text="नई सरकार ❌ टिकी नहीं" x={W * 0.5} y={H * 0.2} start={notLast} size={100} color={RC.sub} />
            <PopIn x={W * 0.56} y={H * 0.56} start={notLast} exit={lenin - 14}><div style={{ position: 'relative' }}><RImg src="props/throne_wooden.png" w={H * 0.42} h={H * 0.52} label="throne" /><RedX x={H * 0.21} y={H * 0.26} w={H * 0.4} h={H * 0.4} start={fell} /></div></PopIn>
            <Char who="red_guard_1917" seed="g8" x={W * 0.84} y={H * 0.94} height={H * 0.44} start={oct} flip gestures={[[0, 'down'], [lenin, 'fist']]} moods={[[0, 'angry']]} />
            <Card src="cards/card_lenin.png" x={W * 0.56} y={H * 0.5} w={W * 0.2} start={lenin - 10} name="Lenin" nameColor={RC.danger} />
            <PopIn x={W * 0.66} y={H * 0.24} start={lenin + 10} over={1.3}><Glyph g="⭐" size={160} /></PopIn>
            <TypeOn text="October 1917 · Bolsheviks" x={W * 0.56} y={H * 0.9} start={oct} size={100} color={RC.danger} />
          </Camera>
          <Host x={W * 0.14} y={H * 0.92} height={H * 0.52} offset={base} start={0} gestures={[[0, 'shrug'], [lenin, 'present']]} moods={[[0, 'neutral'], [lenin, 'shocked']]} />
        </GreyStage>
      ) : (
        <RMap view="ru_west" cam={[{ at: 0, lon: 34, lat: 58, zoom: 1.6 }]}
          overlay={<Pin lon={PETROGRAD[0]} lat={PETROGRAD[1]} label="Petrograd" start={seized - 16} />}>
          <Fill id="russia_1914" color={RC.empireGold} start={0} dur={1} opacity={0.4} />
          <Fill id="ussr_1922" color={RC.sovietRed} start={seized - 10} mode="flood" origin={PETROGRAD} dur={110} opacity={0.6} />
        </RMap>
      )}
      <Sfx at={lenin - 10} file="pop.wav" volume={0.5} />
      <Sfx at={seized - 10} file="whoosh_big.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── H · the cellar ───────────── */
const Hh: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const tag = L(at(74, 'उन्नीस'));
  const cellar = L(at(74, 'तहख़ाने'));
  const shot = L(at(74, 'गोली'));
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_cellar_1918.png" from={0} sky="#2A2420" ground="#1A1612" dim={0.35} />
      <Camera from={0} drift={0.006}>
        {Array.from({ length: 7 }, (_, i) => (
          <Candle key={i} x={W * (0.2 + i * 0.1)} y={H * 0.9} size={170} start={6 + i * 4} outAt={shot + 6 + i * 14} />
        ))}
        <TypeOn text="Yekaterinburg" x={W * 0.5} y={H * 0.12} start={cellar} size={120} color="#EAE2D6" />
        <Card src="cards/card_romanov_family.png" x={W * 0.5} y={H * 0.42} w={W * 0.27} h={W * 0.21} start={L(at(74, 'Nicholas,'))} tilt={-2} grey={shot} name="Nicholas · पत्नी · 5 बच्चे" nameColor="#F2E6CF" />
      </Camera>
      <YearTag text="July 1918" start={tag} />
      {Array.from({ length: 7 }, (_, i) => <Sfx key={i} at={shot + 6 + i * 14} file="tick.wav" volume={0.3} />)}
      <Sfx at={shot + 6} file="bell_toll.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── I · collapse #3, civil war, USSR ───────────── */
const I: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const third = L(at(75, 'तीसरा'));
  const civil = L(at(75, 'civil'));
  const red = L(at(75, 'Red'));
  const tag = L(at(75, 'उन्नीस'));
  const ussr = L(at(75, 'Soviet'));
  const shake = frame >= civil && frame < red + 40;
  return (
    <AbsoluteFill>
      <RMap view="eurasia" cam={[{ at: 0, lon: 60, lat: 56, zoom: 1.4 }, { at: ussr, lon: 80, lat: 56, zoom: 1.25, dur: 90 }]}
        overlay={<><MapLabel lon={33} lat={59} text="Reds" start={civil} exit={ussr - 10} size={110} color="#FFB0A8" /><MapLabel lon={92} lat={61} text="Whites" start={civil + 10} exit={ussr - 10} size={110} color="#FFFFFF" /><MapLabel lon={90} lat={55} text="Soviet Union ☭" start={ussr} size={140} color={RC.yellow} /></>}>
        <Fill id="russia_1914" color={RC.empireGold} start={0} dur={1} opacity={0.5} exit={civil} />
        <Fill id="ussr_1922" color={RC.sovietRed} start={civil} opacity={shake ? 0.4 + 0.2 * Math.sin(frame / 3) : 0.62} />
        {frame < ussr && <Fill id="rep_kazakhstan" color="#EDEAE2" start={civil + 6} exit={red + 30} opacity={0.6} />}
        <Route pts={[[90, 56], [72, 56], [58, 56]]} start={civil + 10} dur={40} width={30} color="#F4F4F4" head="#555" exit={red + 30} />
        <Route pts={[[40, 46], [39, 50], [38, 53.5]]} start={civil + 20} dur={40} width={30} color="#F4F4F4" head="#555" exit={red + 30} />
        <Route pts={[[38, 55.5], [50, 56], [62, 56]]} start={red} dur={40} width={36} color="#E0302A" head={RC.stampRed} exit={ussr} />
        <Route pts={[[37.6, 55], [39, 50], [40, 46]]} start={red + 10} dur={40} width={36} color="#E0302A" head={RC.stampRed} exit={ussr} />
      </RMap>
      <Stamp text="COLLAPSE #3" x={W * 0.5} y={H * 0.48} start={third} size={210} rotate={-7} exit={civil} />
      <TypeOn text="civil war ⚔️" x={W * 0.5} y={H * 0.12} start={civil} size={130} color={RC.white} exit={ussr} />
      <YearTag text={frame < tag ? '1918' : '1922'} start={0} />
      <Sfx at={third} file="stamp_slam.wav" volume={0.8} />
      <Sfx at={third} file="sub_drop.wav" volume={0.5} />
      <Sfx at={ussr} file="sting_crown.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

const SHOTS: [number, React.FC<{ base: number }>][] = [
  [C8_FROM, A],
  [P(68), B],
  [P(69), Cc],
  [P(70), D],
  [P(71), E],
  [P(72), F],
  [P(73), G],
  [P(74), Hh],
  [P(75), I],
];

export const C08LastTsar: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map(([from, Comp], i) => {
      const to = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : C8_TO;
      return (
        <Sequence key={i} from={from - C8_FROM} durationInFrames={to - from}>
          <Comp base={from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
