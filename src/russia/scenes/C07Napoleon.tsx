import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, Card, Flash, GreyStage, Iris, PopIn, RC, RImg, Stamp, TypeOn, YearTag, hand } from '../kit/core';
import { LoopWheel, PeopleGrid } from '../kit/devices';
import { Host } from '../kit/Host';
import { Char } from '../kit/cast';
import { BgPlate, Fire, Frame, Glyph, Rider, Smoke, Snow } from '../kit/scene';
import { At, Fill, MapLabel, Pin, RMap, Route } from '../map/RMap';

/**
 * CHAPTER 7 · 1812 & THE CENTURY OF REFORMS (P58–P66).
 * A  P58  Napoleon's grey Europe; 600,000+ cross the Niemen — the thickest white route of the film
 * B  P59  Russia retreats burning everything; 7 Sep Borodino: smoke, a flash, no clear winner
 * C  P60  Napoleon rides into an empty Moscow, pleased → the skyline catches fire; who lit it? still debated
 * D  P61  frost creeps in; the route turns back and thins to a thread; land + winter stopped him
 * E  P62  officers see Paris (a thought bubble) → 1825 Senate Square: the Decembrists, crushed by cannon
 * F  P63  1861: chains snap — 23 million freed on paper, two years before Lincoln
 * G  P64  1867: Alaska pops off and slides to the USA — SOLD, $7.2 million, ~2¢ an acre
 * H  P65  1881 + iris: a bomb on a snowy canal street — the Tsar who freed the serfs
 * I  P66  the loop swings back: strong hand again; the countdown to catastrophe begins
 */
export const C7_FROM = CHAPTERS[6].from;
export const C7_TO = CHAPTERS[7].card;
const P = (n: number) => para(n).f - 6;
const MOSCOW: [number, number] = [37.62, 55.75];
const BORODINO: [number, number] = [35.82, 55.52];
const INVASION: [number, number][] = [[23.9, 54.9], [25.3, 54.7], [27.6, 54.4], [30.2, 54.5], [32.05, 54.78], [34.0, 55.1], BORODINO, MOSCOW];

/* ───────────── A/B · invasion, scorched earth, Borodino (map) ───────────── */
const AB: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(58, 'अठारह'));
  const nap = L(at(58, 'Napoleon'));
  const attack = L(at(58, 'हमला'));
  const n = L(at(58, 'छह'));
  const biggest = L(at(58, 'सबसे'));
  const retreat = L(at(59, 'पीछे'));
  const burn = L(at(59, 'जलाती'));
  const borodino = L(at(59, 'सात'));
  const bloody = L(at(59, 'ख़ूनी'));
  const noWin = L(at(59, 'कोई'));
  const battle = frame >= bloody;
  return (
    <AbsoluteFill>
      {!battle ? (
        <RMap view="europe_wide" cam={[{ at: 0, lon: 12, lat: 50, zoom: 1.15 }, { at: attack, lon: 28, lat: 54, zoom: 1.7, dur: 120 }, { at: borodino, lon: 34, lat: 55.2, zoom: 2.8, dur: 90 }]}
          overlay={
            <>
              <At lon={6} lat={48} start={nap} over={1.2}><div style={{ textAlign: 'center' }}><RImg src="chars/napoleon.png" w={220} h={260} label="Napoleon" /><div style={hand(90, RC.white)}>Napoleon</div></div></At>
              <MapLabel lon={8} lat={52.5} text="आधा Europe उसका" start={nap + 30} size={90} color={RC.yellow} />
              {[[29, 54.6], [31.5, 54.9], [33.6, 55.2]].map(([lo, la], i) => <At key={i} lon={lo} lat={la} start={burn + i * 10}><div style={{ position: 'relative', width: 0, height: 0 }}><Fire x={0} y={0} size={90} start={0} seed={`sc${i}`} /></div></At>)}
              <MapLabel lon={31} lat={56.6} text="सब जला दो 🔥" start={burn} size={90} color="#FFD0A0" />
              <Pin lon={BORODINO[0]} lat={BORODINO[1]} label="Borodino" start={borodino} side="l" />
              <Pin lon={MOSCOW[0]} lat={MOSCOW[1]} label="Moscow" start={0} />
            </>
          }>
          <Fill id="napoleon_1812" color={RC.napoleon} start={nap} mode="flood" origin={[2.35, 48.85]} dur={80} opacity={0.62} />
          <Fill id="russia_1812" color={RC.empireGold} start={0} dur={1} opacity={0.45} />
          <Route pts={INVASION} start={attack} dur={retreat - attack + 120} width={70} endWidth={60} />
          <Route pts={[[25.8, 55.2], [29.4, 55.0], [33, 55.4], [35.9, 55.7]]} start={retreat} dur={90} width={22} color="#E8B04A" head={RC.stampRed} />
        </RMap>
      ) : (
        <AbsoluteFill>
          <BgPlate src="bg/bg_borodino_1812.png" from={bloody} sky="#B8B4A8" ground="#7A7A52" />
          <Camera from={bloody} shake={[{ at: bloody + 4, amp: 24, dur: 30 }, { at: bloody + 60, amp: 16, dur: 20 }]}>
            {[0, 1, 2].map((i) => <Char key={`r${i}`} who="russian_soldier_1812" seed={`rs${i}`} x={W * (0.14 + i * 0.1)} y={H * 0.96} height={H * 0.38} start={bloody + i * 3} gestures={[[0, 'fist']]} moods={[[0, 'angry'], [noWin, 'worried']]} />)}
            {[0, 1, 2].map((i) => <Char key={`f${i}`} who="french_soldier" seed={`fs${i}`} x={W * (0.66 + i * 0.1)} y={H * 0.96} height={H * 0.38} start={bloody + i * 3} flip gestures={[[0, 'fist']]} moods={[[0, 'angry'], [noWin, 'worried']]} />)}
            {[0.3, 0.5, 0.7].map((x, i) => <Smoke key={i} x={W * x} y={H * 0.7} size={H * 0.22} start={bloody + i * 8} color="230,230,225" />)}
            <PopIn x={W * 0.5} y={H * 0.56} start={bloody + 30}><RImg src="props/cannon_1812.png" w={H * 0.36} h={H * 0.3} label="💣" /></PopIn>
            <TypeOn text="Borodino" x={W * 0.5} y={H * 0.12} start={bloody} size={150} color={RC.blue} />
            <TypeOn text="कोई साफ़ विजेता नहीं 🤷" x={W * 0.5} y={H * 0.26} start={noWin} size={110} color={RC.yellow} />
          </Camera>
          <Flash at={bloody + 4} dur={6} />
          <Flash at={bloody + 60} dur={4} />
          <Sfx at={bloody + 4} file="impact_boom.wav" volume={0.6} />
          <Sfx at={bloody + 60} file="musket_volley.wav" volume={0.4} />
        </AbsoluteFill>
      )}
      <BigNumber x={W * 0.8} y={H * 0.82} to={600000} start={n} dur={45} size={170} suffix="+" sub="सैनिक · सबसे बड़ी फ़ौज" exit={retreat} />
      <YearTag text={frame < borodino ? '1812' : '7 Sep 1812'} start={tag} />
      <Sfx at={nap} file="whoosh_big.wav" volume={0.45} />
      <Sfx at={attack} file="timpani_roll.wav" volume={0.45} />
      <Sfx at={burn} file="whoosh_soft.wav" volume={0.4} />
    </AbsoluteFill>
  );
};

/* ───────────── C · Moscow burns ───────────── */
const Cc: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const reached = L(at(60, 'पहुँच'));
  const thought = L(at(60, 'लगा,'));
  const empty = L(at(60, 'ख़ाली'));
  const fire = L(at(60, 'आग'));
  const who = L(at(60, 'आग', 1));
  const glow = ramp(frame, fire, 60, ease.out);
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_moscow_skyline_1812.png" from={0} sky="#C8B89A" ground="#6E5A3E" tint={glow > 0 ? `rgba(255,120,40,${glow * 0.5})` : undefined} />
      <Camera from={0}>
        {Array.from({ length: 9 }, (_, i) => (
          <React.Fragment key={i}>
            <Smoke x={W * (0.06 + i * 0.11)} y={H * 0.5} size={H * 0.2} start={fire + i * 7} color="50,40,36" />
            <Fire x={W * (0.06 + i * 0.11)} y={H * (0.56 + (i % 3) * 0.03)} size={H * (0.14 + (i % 2) * 0.06)} start={fire + i * 7} seed={`mf${i}`} />
          </React.Fragment>
        ))}
        <Rider horse="horse_white" who="napoleon" x={W * (0.2 + 0.35 * ramp(frame, reached - 40, 90, ease.out))} y={H * 0.98} height={H * 0.5} start={reached - 40}
          gallop={frame < reached + 50} moods={[[0, 'smug'], [thought, 'grin'], [empty, 'worried'], [fire, 'shocked']]} gestures={[[0, 'hips'], [fire, 'handsHead']]} seed="nap" />
        <TypeOn text="अब Tsar हार मानेगा 😏" x={W * 0.45} y={H * 0.16} start={thought} size={100} exit={empty} />
        <TypeOn text="…Moscow ख़ाली! 🏚️" x={W * 0.45} y={H * 0.16} start={empty} size={110} color={RC.yellow} exit={fire} />
        <TypeOn text="Moscow जल रहा है" x={W * 0.5} y={H * 0.14} start={fire + 10} size={150} color={RC.danger} />
        <Stamp text="आग किसने लगाई? ❓" x={W * 0.76} y={H * 0.32} start={who} size={90} />
      </Camera>
      <Sfx at={reached - 40} file="whoosh_soft.wav" volume={0.4} />
      <Sfx at={fire} file="impact_boom.wav" volume={0.4} />
      <Sfx at={who} file="stamp_slam.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── D · winter ───────────── */
const D: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const winter = L(at(61, 'सर्दी'));
  const back = L(at(61, 'लौटना'));
  const melt = L(at(61, 'पिघलती'));
  const few = L(at(61, 'बहुत'));
  const stopped = L(at(61, 'जिस'));
  const frost = ramp(frame, winter - 20, 120, ease.out);
  const RET: [number, number][] = [...INVASION].reverse();
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 31, lat: 55, zoom: 2.1 }, { at: back, lon: 28, lat: 55, zoom: 1.8, dur: 160 }]}
        overlay={
          <>
            <Pin lon={MOSCOW[0]} lat={MOSCOW[1]} label="Moscow" start={0} />
            {[[33, 56.2], [29.5, 55.6], [26, 55.8], [35, 54.4]].map(([lo, la], i) => <At key={i} lon={lo} lat={la} start={winter + i * 10} bob={6}><Glyph g="❄️" size={90} /></At>)}
          </>
        }>
        <Fill id="russia_1812" color={RC.empireGold} start={0} dur={1} opacity={0.45} />
        <Route pts={RET} start={back} dur={few - back + 60} width={60} endWidth={6} />
      </RMap>
      <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0) ${70 - frost * 35}%, rgba(235,245,255,${0.92 * frost}) 100%)` }} />
      <Snow start={winter} density={140} wind={-4} />
      <TypeOn text="बिना खाना · बिना छत · सर्दी ❄️" x={W * 0.5} y={H * 0.12} start={L(at(61, 'बिना'))} size={100} color="#1E2A44" exit={melt} />
      <TypeOn text="फ़ौज पिघलती गई…" x={W * 0.5} y={H * 0.12} start={melt} size={120} color="#1E2A44" exit={stopped} />
      <PeopleGrid x={W * 0.78} y={H * 0.78} cols={10} rows={3} size={44} start={melt} greyFrom={melt + 10} perRow={14} color="#2F4E8C" />
      <TypeOn text="ज़मीन 🌲 + सर्दी ❄️ = रोक दिया" x={W * 0.45} y={H * 0.12} start={stopped} size={120} color={RC.danger} />
      <Sfx at={winter} file="whoosh_soft.wav" volume={0.5} />
      <Sfx at={stopped} file="sting_hit.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── E · Paris → Decembrists ───────────── */
const E: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const side = L(at(62, 'side'));
  const paris = L(at(62, 'Paris'));
  const saw = L(at(62, 'Tsar'));
  const tag = L(at(62, 'अठारह'));
  const revolt = L(at(62, 'बग़ावत'));
  const crushed = L(at(62, 'तोपों'));
  const square = frame >= tag - 6;
  return (
    <AbsoluteFill>
      {!square ? (
        <GreyStage>
          <Camera from={0}>
            <TypeOn text="Side effect 💭" x={W * 0.5} y={H * 0.1} start={side} size={110} color={RC.yellow} />
            {[0, 1].map((i) => <Char key={i} who="decembrist_officer" seed={`do${i}`} x={W * (0.3 + i * 0.14)} y={H * 0.96} height={H * 0.46} start={side + 10 + i * 6} gestures={[[0, 'chin']]} moods={[[0, 'neutral'], [saw, 'shocked']]} look2={0.8} />)}
            <PopIn x={W * 0.7} y={H * 0.42} start={paris}>
              <div style={{ position: 'relative' }}>
                <svg width={W * 0.4} height={H * 0.48} viewBox="0 0 100 60" style={{ position: 'absolute', left: -W * 0.2, top: -H * 0.24 }}><ellipse cx={50} cy={28} rx={48} ry={27} fill="#fff" stroke="#333" strokeWidth={0.8} /><circle cx={10} cy={58} r={3} fill="#fff" stroke="#333" strokeWidth={0.6} /></svg>
                <div style={{ position: 'absolute', left: -W * 0.16, top: -H * 0.18, width: W * 0.32, height: H * 0.3, borderRadius: '50%', overflow: 'hidden' }}><RImg src="bg/bg_paris_1814.png" w={W * 0.32} h={H * 0.3} label="🗼✗ Paris 1814" /></div>
              </div>
            </PopIn>
            <TypeOn text="Tsar के बिना भी देश चलता है?!" x={W * 0.7} y={H * 0.78} start={saw} size={90} color={RC.blue} />
          </Camera>
        </GreyStage>
      ) : (
        <AbsoluteFill>
          <BgPlate src="bg/bg_senate_square_1825.png" from={tag - 6} sky="#AEB8C4" ground="#D8DEE6" />
          <Snow start={tag} density={70} />
          <Camera from={tag} shake={[{ at: crushed + 6, amp: 26, dur: 24 }]}>
            {[0, 1, 2, 3].map((i) => <Char key={i} who="decembrist_officer" seed={`dc${i}`} x={W * (0.56 + i * 0.1)} y={H * 0.96} height={H * 0.4} start={tag + i * 4} flip gestures={[[0, 'fist'], [crushed + 6, 'handsHead']]} moods={[[0, 'angry'], [crushed + 6, 'shocked']]} fallAt={i % 2 ? crushed + 10 : undefined} />)}
            <PopIn x={W * 0.18} y={H * 0.84} start={revolt}><RImg src="props/cannon_1812.png" w={H * 0.4} h={H * 0.3} label="💣 cannon" /></PopIn>
            <TypeOn text="Decembrists" x={W * 0.5} y={H * 0.12} start={tag + 4} size={150} color={RC.blue} />
            <TypeOn text="तोपों से कुचला" x={W * 0.5} y={H * 0.25} start={crushed + 8} size={110} color={RC.danger} />
          </Camera>
          <Flash at={crushed + 6} dur={6} />
          <Sfx at={crushed + 6} file="impact_boom.wav" volume={0.7} />
        </AbsoluteFill>
      )}
      <YearTag text={square ? '1825' : '1814'} start={paris} />
      <Sfx at={paris} file="sting_shimmer.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

/* ───────────── F · 1861 serfs freed ───────────── */
const F: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(63, 'फिर'));
  const alex = L(at(63, 'Alexander'));
  const ended = L(at(63, 'serfdom'));
  const n = L(at(63, 'दो'));
  const lincoln = L(at(63, 'America'));
  return (
    <GreyStage>
      <Camera from={0}>
        <Char who="alexander_ii" x={W * 0.2} y={H * 0.96} height={H * 0.56} start={alex - 10} gestures={[[0, 'hold'], [ended, 'cheer']]} moods={[[0, 'neutral'], [ended, 'grin']]} />
        <TypeOn text="Alexander II" x={W * 0.2} y={H * 0.32} start={alex} size={100} color={RC.blue} />
        <PeopleGrid x={W * 0.62} y={H * 0.56} cols={14} rows={3} size={70} start={tag} color="#7A7A7A" />
        {Array.from({ length: 6 }, (_, i) => frame >= ended + i * 6 && (
          <div key={i} style={{ position: 'absolute', left: W * (0.42 + i * 0.075), top: H * 0.66 - ramp(frame, ended + i * 6, 30, ease.out) * H * 0.1, opacity: 1 - ramp(frame, ended + i * 6 + 20, 20), transform: `rotate(${(i % 2 ? 1 : -1) * ramp(frame, ended + i * 6, 30) * 40}deg)` }}><Glyph g="⛓️" size={90} /></div>
        ))}
        <BigNumber x={W * 0.62} y={H * 0.2} to={23000000} start={n} dur={50} size={190} suffix="+" sub="काग़ज़ पर आज़ाद" />
        <TypeOn text="🇺🇸 Lincoln से 2 साल पहले" x={W * 0.62} y={H * 0.88} start={lincoln} size={100} color={RC.yellow} />
      </Camera>
      <YearTag text="1861" start={tag} />
      <Sfx at={ended} file="paper_tear.wav" volume={0.5} />
      <Sfx at={ended + 2} file="sting_crown.wav" volume={0.45} />
    </GreyStage>
  );
};

/* ───────────── G · Alaska sold ───────────── */
const G: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(64, 'अठारह'));
  const alaska = L(at(64, 'Alaska,'));
  const sold = L(at(64, 'बेच'));
  const price = L(at(64, 'बहत्तर'));
  const acre = L(at(64, 'cent'));
  const slide = ramp(frame, sold, 60, ease.inOut);
  return (
    <AbsoluteFill>
      <RMap view="eurasia" cam={[{ at: 0, lon: 120, lat: 60, zoom: 1.2 }, { at: 4, lon: 185, lat: 62, zoom: 2.3, dur: 100 }]}
        overlay={<><MapLabel lon={205} lat={66} text="Alaska" start={alaska} size={110} /><At lon={200} lat={57} start={acre}><div style={{ ...hand(84, RC.yellow) }}>≈ 2¢ / acre 🤯</div></At></>}>
        <Fill id="russia_1812" color={RC.empireGold} start={0} dur={1} opacity={0.5} />
        <Fill id="alaska" color={RC.empireGold} colors={[[sold + 30, '#3D6FD8']]} start={0} dur={1} opacity={0.6} pulseAt={[alaska]} offset={[slide * 120, slide * 30]} />
      </RMap>
      <Stamp text="SOLD" x={W * 0.62} y={H * 0.36} start={sold + 20} size={200} />
      <BigNumber x={W * 0.3} y={H * 0.8} to={7200000} start={price} dur={40} size={170} prefix="$" sub="1867 में · America को" />
      <YearTag text="1867" start={tag} />
      <Sfx at={sold + 20} file="stamp_slam.wav" volume={0.7} />
      <Sfx at={price} file="coin.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── H · 1881 ───────────── */
const Hh: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const strange = L(at(65, 'अजीब'));
  const tag = L(at(65, 'अठारह'));
  const same = L(at(65, 'उसी'));
  const bomb = L(at(65, 'बम'));
  const card = frame >= bomb + 30;
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_canal_street_1881.png" from={0} sky="#B4BCC6" ground="#E2E6EC" />
      <Snow start={0} density={60} />
      <Camera from={0} shake={[{ at: bomb, amp: 30, dur: 26 }]}>
        {!card ? (
          <>
            <div style={{ position: 'absolute', left: W * (0.1 + 0.45 * ramp(frame, tag - 30, bomb - tag + 30, ease.linear)) - W * 0.13, top: H * 0.58 + Math.abs(Math.sin(frame / 5)) * 6 }}>
              <RImg src="props/carriage_1881.png" w={W * 0.26} h={H * 0.3} label="🛷 carriage" />
            </div>
            <PopIn x={W * 0.62} y={H * 0.62} start={bomb - 20} exit={bomb}><Glyph g="💣" size={120} /></PopIn>
            {frame >= bomb && <><Smoke x={W * 0.56} y={H * 0.7} size={H * 0.3} start={bomb} color="70,70,70" /><Fire x={W * 0.56} y={H * 0.82} size={H * 0.2} start={bomb} grow={6} exit={bomb + 40} /></>}
          </>
        ) : (
          <Card src="cards/card_alexander_ii.png" x={W * 0.5} y={H * 0.46} w={W * 0.2} start={bomb + 30} name="Alexander II" ribbonAt={bomb + 40} grey={bomb + 40} />
        )}
        <TypeOn text="reformer का अंजाम… 😬" x={W * 0.5} y={H * 0.12} start={strange} size={110} exit={same} />
        <TypeOn text="वही Tsar जिसने serfs को आज़ाद किया" x={W * 0.5} y={H * 0.12} start={same} size={100} color={RC.yellow} />
      </Camera>
      <Flash at={bomb} dur={8} />
      <YearTag text="1881" start={tag} />
      <Iris at={tag + 2} hold={30} />
      <Sfx at={bomb} file="impact_boom.wav" volume={0.8} />
      <Sfx at={bomb + 40} file="bell_toll.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── I · back to the iron fist; countdown ───────────── */
const I: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tsars = L(at(66, 'Tsars'));
  const none = L(at(66, 'ढील'));
  const strict = L(at(66, 'सख़्ती।'));
  const count = L(at(66, 'उलटी'));
  const c = Math.max(0, 3 - Math.floor((frame - count) / 18));
  return (
    <GreyStage>
      <Camera from={0}>
        <LoopWheel x={W * 0.56} y={H * 0.52} r={H * 0.27} start={0} steps={[[0, 2], [tsars, 1]]} center={{ text: 'फिर सख़्ती ✊', at: strict }} />
        {frame >= count && <PopIn x={W * 0.86} y={H * 0.5} start={count} key={c}><div style={{ ...hand(320, RC.danger) }}>{c > 0 ? c : '💥'}</div></PopIn>}
        <TypeOn text="तबाही की उलटी गिनती…" x={W * 0.56} y={H * 0.92} start={count} size={100} color={RC.danger} />
      </Camera>
      <Host x={W * 0.13} y={H * 0.92} height={H * 0.52} offset={base} start={0} gestures={[[0, 'present'], [none, 'fist'], [count, 'handsHead']]} moods={[[0, 'neutral'], [none, 'angry'], [count, 'shocked']]} />
      {[0, 1, 2].map((i) => <Sfx key={i} at={count + i * 18} file="tick.wav" volume={0.6} />)}
      <Sfx at={count + 54} file="sub_drop.wav" volume={0.6} />
    </GreyStage>
  );
};

const SHOTS: [number, React.FC<{ base: number }>][] = [
  [C7_FROM, AB],
  [P(60), Cc],
  [P(61), D],
  [P(62), E],
  [P(63), F],
  [P(64), G],
  [P(65), Hh],
  [P(66), I],
];

export const C07Napoleon: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map(([from, Comp], i) => {
      const to = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : C7_TO;
      return (
        <Sequence key={i} from={from - C7_FROM} durationInFrames={to - from}>
          <Comp base={from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
