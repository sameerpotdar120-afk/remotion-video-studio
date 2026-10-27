import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, Card, GreyStage, PopIn, RC, RImg, Stamp, TypeOn, YearTag, hand, pop } from '../kit/core';
import { Calendar, LoopWheel } from '../kit/devices';
import { Host } from '../kit/Host';
import { Char } from '../kit/cast';
import { BgPlate, Glyph, ShockLines, Smoke } from '../kit/scene';
import { At, Fill, MapLabel, Pin, RMap, Route, Traveller } from '../map/RMap';

/**
 * CHAPTER 5 · PETER (P43–P50): 1682 → 1725.
 * A  P43  Peter pops in beside the host — twice his height; a tape measure: ≈2 m
 * B  P44  1697: the Grand Embassy route Moscow → Holland → London; Zaandam shipyard, "Pyotr Mikhailov" 😉
 * C  P45  the beard snip: giant shears down a line of boyars; the copper beard token spins
 * D  P46  calendar to 1 January 1700; a navy sails in from nothing
 * E  P47  the Great Northern War: Sweden in blue; 21 years; Poltava 1709
 * F  P48  1703: piles in a swamp → a palace builds up: St Petersburg, Europe's window; the cost
 * G  P49  1718: Alexei against the reforms — portrait with a black ribbon
 * H  P50  1721 Emperor: Russia turns green; the loop lights "order for freedom"; the peasant pays
 */
export const C5_FROM = CHAPTERS[4].from;
export const C5_TO = CHAPTERS[5].card;
const P = (n: number) => para(n).f - 6;
const MOSCOW: [number, number] = [37.62, 55.75];

/* ───────────── A · the tallest Tsar ───────────── */
const A: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tall = L(at(43, 'लंबे,'));
  const peter = L(at(43, 'Peter'));
  const two = L(at(43, 'दो'));
  const tape = ramp(frame, two - 10, 40, ease.out);
  return (
    <GreyStage>
      <Camera from={0}>
        <Char who="peter_great" x={W * 0.46} y={H * 0.96} height={H * 0.76} start={tall - 6} gestures={[[tall, 'hips'], [two, 'wave']]} moods={[[tall, 'smug'], [two, 'grin']]} />
        <TypeOn text="Peter the Great" x={W * 0.8} y={H * 0.2} start={peter} size={130} color={RC.blue} />
        {frame >= two - 10 && (
          <svg width={140} height={H} style={{ position: 'absolute', left: W * 0.6, top: 0, overflow: 'visible' }}>
            <rect x={40} y={H * 0.96 - H * 0.76 * tape} width={60} height={H * 0.76 * tape} fill="#F2C94C" stroke="#8A6A1E" strokeWidth={4} />
            {Array.from({ length: 20 }, (_, i) => (H * 0.76 * i) / 20 < H * 0.76 * tape && <line key={i} x1={40} x2={i % 5 ? 64 : 80} y1={H * 0.96 - (H * 0.76 * i) / 20} y2={H * 0.96 - (H * 0.76 * i) / 20} stroke="#5A4410" strokeWidth={4} />)}
          </svg>
        )}
        <TypeOn text="≈ 2 m 📏" x={W * 0.8} y={H * 0.4} start={two + 20} size={150} color={RC.yellow} />
      </Camera>
      <Host x={W * 0.2} y={H * 0.92} height={H * 0.42} offset={base} start={0} gestures={[[0, 'present'], [tall, 'fingerUp'], [two, 'handsHead']]} moods={[[0, 'smile'], [tall, 'shocked']]} look2={0.8} />
      <Sfx at={tall - 6} file="pop_low.wav" volume={0.6} />
      <Sfx at={two - 10} file="riser.wav" volume={0.4} />
    </GreyStage>
  );
};

/* ───────────── B · the Grand Embassy ───────────── */
const EMBASSY: [number, number][] = [MOSCOW, [30.3, 55.6], [24.1, 56.95], [20.5, 54.7], [13.4, 52.5], [9.0, 52.6], [4.83, 52.44], [2.0, 51.7], [-0.12, 51.5]];
const B: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const behind = L(at(44, 'पीछे'));
  const tag = L(at(44, 'सोलह'));
  const tour = L(at(44, 'दौरा'));
  const notTsar = L(at(44, 'पर'));
  const fake = L(at(44, 'Pyotr'));
  const holland = L(at(44, 'Holland'));
  const think = L(at(44, 'सोचो,'));
  const knew = L(at(44, 'सबको'));
  const yard = frame >= holland;
  return (
    <AbsoluteFill>
      {!yard ? (
        <AbsoluteFill>
          <RMap view="europe_wide" cam={[{ at: 0, lon: 30, lat: 54, zoom: 1.3 }, { at: tour, lon: 18, lat: 53.5, zoom: 1.5, dur: 160 }]}
            overlay={
              <>
                <MapLabel lon={40} lat={58.5} text="Russia" start={0} size={110} />
                <MapLabel lon={8} lat={49.5} text="Europe ✨" start={behind} size={110} color={RC.yellow} />
                <Pin lon={MOSCOW[0]} lat={MOSCOW[1]} label="Moscow" start={0} side="r" />
                <Pin lon={4.83} lat={52.44} label="Zaandam" start={tour + 80} side="t" />
                <Pin lon={-0.12} lat={51.5} label="London" start={tour + 120} side="l" />
                <Traveller pts={EMBASSY} start={tour} dur={150}>{() => <Glyph g="🧳" size={90} />}</Traveller>
                <At lon={20} lat={58.5} start={notTsar} bob={4}><div style={{ ...hand(90, RC.white), textAlign: 'center' }}>👑 ✗ Tsar बनकर नहीं</div></At>
                <At lon={20} lat={47} start={fake}><div style={{ ...hand(110, RC.yellow) }}>"Pyotr Mikhailov" 😉</div></At>
              </>
            }>
            <Fill id="russia_1700" color={RC.rusRed} start={0} dur={1} opacity={0.5} />
            <Route pts={EMBASSY} start={tour} dur={150} width={14} dotted color="#FFE9A8" head={false} />
          </RMap>
          <YearTag text="1697" start={tag} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <BgPlate src="bg/bg_shipyard_zaandam_1697.png" from={holland} sky="#BFD4E6" ground="#A88A5A" />
          <Camera from={holland}>
            <Char who="peter_carpenter" x={W * 0.48} y={H * 0.97} height={H * 0.78} start={holland} gestures={[[holland, 'fist']]} moods={[[holland, 'grin'], [think, 'smug'], [knew, 'shocked']]} hopAt={[holland + 20, holland + 40, holland + 60]}>
              <div style={{ position: 'absolute', left: '78%', top: '38%', transformOrigin: '10% 90%', transform: `rotate(${-40 + Math.abs(Math.sin((frame - holland) / 6)) * 70}deg)` }}><RImg src="props/carpenter_hammer.png" w={180} h={180} label="🔨" /></div>
            </Char>
            {[0, 1].map((i) => (
              <Char key={i} who="serf_worker" tint={i ? '#3E6B8A' : '#8A6A3E'} seed={`dutch${i}`} x={W * (0.2 + i * 0.6)} y={H * 0.96} height={H * 0.36} start={holland + 6 + i * 6} flip={i === 1}
                moods={[[0, 'neutral'], [knew, 'grin']]} gestures={[[0, 'down'], [knew, 'point']]} hopAt={[knew + 10]} />
            ))}
            <TypeOn text="आम मज़दूर? 🤔" x={W * 0.5} y={H * 0.1} start={holland + 30} size={110} exit={think} />
            <TypeOn text="2 मीटर का 'आम' मज़दूर…" x={W * 0.5} y={H * 0.1} start={think} size={110} color={RC.yellow} />
            <TypeOn text="सबको पता था 😂" x={W * 0.5} y={H * 0.22} start={knew} size={120} color={RC.white} />
          </Camera>
          {[0, 1, 2, 3].map((i) => <Sfx key={i} at={holland + 12 + i * 19} file="thud_soft.wav" volume={0.4} />)}
          <Sfx at={knew} file="pluck_up.wav" volume={0.5} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ───────────── C · the beard snip ───────────── */
const Cc: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const force = L(at(45, 'ज़बरदस्ती'));
  const beard = L(at(45, 'दाढ़ी।'));
  const cut = L(at(45, 'कटवाएँ।'));
  const tax = L(at(45, 'tax'));
  const token = L(at(45, 'copper'));
  const snips = [cut - 20, cut + 10, cut + 40];
  const peterX = W * 0.12;
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_peter_court_1698.png" from={0} sky="#D8C9A8" ground="#9A7A52" />
      <Camera from={0}>
        {[0, 1, 2].map((i) => {
          const snipped = frame >= snips[i];
          return (
            <React.Fragment key={i}>
              <Char who={i === 1 ? 'boyar_b' : snipped ? 'boyar_a_beardless' : 'boyar_a'} seed={`bb${i}`} tint={i === 2 ? '#6A7A9E' : undefined}
                x={W * (0.3 + i * 0.22)} y={H * 0.96} height={H * 0.44} start={force + i * 5}
                moods={[[0, 'smug'], [snips[i] - 10, 'worried'], [snips[i], 'shocked']]} gestures={[[0, 'hips'], [snips[i], 'handsHead']]} hopAt={[snips[i] + 2]} />
              {snipped && frame < snips[i] + 50 && (
                <div style={{ position: 'absolute', left: W * (0.32 + i * 0.2) - 60, top: H * 0.6 + ramp(frame, snips[i], 40, ease.in) * H * 0.34, transform: `rotate(${ramp(frame, snips[i], 40) * 90}deg)`, opacity: 1 - ramp(frame, snips[i] + 30, 20) }}>
                  <svg width={120} height={110} viewBox="0 0 12 11"><path d="M1 1 Q6 4 11 1 Q10 9 6 10 Q2 9 1 1 Z" fill={i === 1 ? '#B8B8B8' : '#1E1A16'} stroke="#000" strokeWidth={0.3} /></svg>
                </div>
              )}
              {frame >= snips[i] && <PopIn x={W * (0.32 + i * 0.2)} y={H * 0.3} start={snips[i]} exit={snips[i] + 30} over={1.3}><div style={hand(110, RC.danger)}>SNIP! ✂️</div></PopIn>}
            </React.Fragment>
          );
        })}
        <Char who="peter_great" x={peterX} y={H * 0.99} height={H * 0.6} start={beard} gestures={[[beard, 'hold']]} moods={[[beard, 'grin']]}
          walk={[{ at: 0, x: W * 0.12 }, { at: beard, x: W * 0.82, dur: snips[2] - beard + 20 }]}>
          <div style={{ position: 'absolute', left: '72%', top: '40%', transform: `rotate(${Math.sin(frame / 3) * 8}deg)` }}><RImg src="props/shears_giant.png" w={260} h={260} label="✂️" /></div>
        </Char>
        <TypeOn text="दाढ़ी ✂️" x={W * 0.5} y={H * 0.1} start={beard} size={130} color={RC.yellow} exit={tax} />
        <TypeOn text="दाढ़ी रखनी है? → TAX 💰" x={W * 0.5} y={H * 0.1} start={tax} size={110} color={RC.yellow} />
        {frame >= token && (
          <div style={{ position: 'absolute', left: W * 0.14 - 160, top: H * 0.16, width: 320, height: 320, transform: `scale(${pop(frame, token, 1.15)}) rotateY(${(frame - token) * 6}deg)` }}>
            <RImg src="props/beard_token.png" w={320} h={320} label="🪙 beard token" />
          </div>
        )}
        <TypeOn text="Beard tax token" x={W * 0.14} y={H * 0.5} start={token + 10} size={80} color={RC.blue} />
      </Camera>
      {snips.map((s, i) => <Sfx key={i} at={s} file="paper_tear.wav" volume={0.5} />)}
      <Sfx at={token} file="coin.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── D · New Year 1700 and a navy ───────────── */
const D: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const clothes = L(at(46, 'European'));
  const yr = L(at(46, 'सत्रह'));
  const jan = L(at(46, 'January'));
  const sea = L(at(46, 'समुंदर'));
  const navy = L(at(46, 'navy'));
  const ships = frame >= sea - 10;
  return (
    <AbsoluteFill>
      {!ships ? (
        <GreyStage>
          <Camera from={0}>
            <PopIn x={W * 0.48} y={H * 0.56} start={clothes}><div style={{ ...hand(110, '#333'), textAlign: 'center' }}>🧥 European कपड़े<br /><span style={{ color: RC.danger }}>ज़रूरी!</span></div></PopIn>
            <Calendar x={W * 0.76} y={H * 0.5} size={340} start={yr} pages={['1 Sep', '12', '25', '31']} final={['1', 'January 1700']} per={8} />
            <TypeOn text="नया साल · नई तारीख़ 🎆" x={W * 0.7} y={H * 0.9} start={jan} size={100} color={RC.yellow} />
          </Camera>
          <Host x={W * 0.16} y={H * 0.92} height={H * 0.56} offset={base} start={0} gestures={[[0, 'present'], [jan, 'cheer']]} moods={[[0, 'smile'], [jan, 'grin']]} hopAt={[jan + 10]} />
          <Sfx at={yr} file="paper_swish.wav" volume={0.5} />
        </GreyStage>
      ) : (
        <AbsoluteFill style={{ background: 'linear-gradient(#9CC6E6 0%, #CFE5F2 55%, #3E78A8 56%, #2A5E8E 100%)' }}>
          <Camera from={sea - 10}>
            <TypeOn text="एक ढंग का जहाज़ भी नहीं…" x={W * 0.5} y={H * 0.14} start={sea} size={110} exit={navy} />
            {[0, 1, 2, 3, 4].map((i) => {
              const s = navy + i * 8;
              const x = W * (1.2 - 0.95 * ramp(frame, s, 120, ease.out)) + i * W * 0.18;
              return frame >= s - 2 && (
                <div key={i} style={{ position: 'absolute', left: x - W * 0.1, top: H * (0.36 + (i % 2) * 0.12) + Math.sin((frame + i * 13) / 16) * 10, transform: `rotate(${Math.sin((frame + i * 9) / 20) * 2}deg) scale(${0.7 + (i % 2) * 0.25})` }}>
                  <RImg src="props/ship_russian_1700.png" w={W * 0.22} h={W * 0.15} label="⛵ ship" />
                </div>
              );
            })}
            <TypeOn text="पूरी navy! ⚓" x={W * 0.5} y={H * 0.14} start={navy} size={150} color={RC.yellow} />
          </Camera>
          <Sfx at={navy} file="whoosh_big.wav" volume={0.5} />
          <Sfx at={navy + 20} file="sting_crown.wav" volume={0.4} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ───────────── E · Sweden, Poltava ───────────── */
const POLTAVA: [number, number] = [34.55, 49.59];
const E: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const sweden = L(at(47, 'Sweden'));
  const biggest = L(at(47, 'उत्तर'));
  const years = L(at(47, 'इक्कीस'));
  const tag = L(at(47, 'सत्रह'));
  const poltava = L(at(47, 'Poltava'));
  const beat = L(at(47, 'हराया।'));
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 30, lat: 57, zoom: 1.4 }, { at: poltava - 20, lon: 33, lat: 52, zoom: 1.9, dur: 80 }]}
        overlay={
          <>
            <MapLabel lon={17} lat={62.5} text="Sweden 💪" start={biggest} size={120} color="#D8E6FF" />
            <Pin lon={POLTAVA[0]} lat={POLTAVA[1]} label="Poltava" start={poltava} />
            <At lon={POLTAVA[0]} lat={POLTAVA[1]} dy={-40} start={beat}><Glyph g="💥" size={160} /></At>
          </>
        }>
        <Fill id="russia_1700" color={RC.rusRed} start={0} dur={1} opacity={0.5} />
        <Fill id="sweden_1700" color={RC.sweden} start={sweden} opacity={0.6} pulseAt={[biggest]} />
        <Route pts={[[24, 57], [28, 54.5], [32, 51.5], [34.2, 49.8]]} start={tag - 20} dur={70} width={30} color="#E8F0FF" head={RC.sweden} />
        <Route pts={[[37.6, 55.5], [36.8, 52.6], [35.2, 50.2]]} start={tag} dur={60} width={34} />
      </RMap>
      <BigNumber x={W * 0.84} y={H * 0.8} to={21} start={years} dur={30} size={190} sub="साल की जंग" />
      <Stamp text="SWEDEN हारा" x={W * 0.5} y={H * 0.5} start={beat + 6} size={140} color={RC.stampGreen} />
      <YearTag text="1709" start={tag} />
      <Sfx at={beat} file="impact_boom.wav" volume={0.6} />
      <Sfx at={beat + 6} file="stamp_slam.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── F · St Petersburg ───────────── */
const F: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const swamp = L(at(48, 'दलदल'));
  const tag = L(at(48, 'सत्रह'));
  const city = L(at(48, 'St.'));
  const capital = L(at(48, 'राजधानी'));
  const window = L(at(48, 'खिड़की।'));
  const cost = L(at(48, 'ज़बरदस्ती'));
  const lives = L(at(48, 'हज़ारों'));
  const build = ramp(frame, tag, city - tag + 30, ease.inOut);
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_neva_swamp_1703.png" from={0} sky="#A8B4BC" ground="#6E7A62" />
      <Camera from={0}>
        <div style={{ position: 'absolute', left: W * 0.5 - W * 0.36, top: H * 0.2, width: W * 0.72, height: H * 0.5, clipPath: `inset(${(1 - build) * 100}% 0 0 0)` }}>
          <RImg src="props/palace_facade_baroque.png" w={W * 0.72} h={H * 0.5} label="🏛️ palace" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <Char key={i} who="serf_worker" seed={`pile${i}`} x={W * (0.14 + i * 0.24)} y={H * 0.97} height={H * 0.34} start={swamp + i * 4} moods={[[0, 'worried'], [cost, 'sad']]} gestures={[[0, 'fist']]}
            hopAt={Array.from({ length: 8 }, (_, k) => swamp + 20 + k * 26 + i * 6)} />
        ))}
        <TypeOn text="St. Petersburg" x={W * 0.5} y={H * 0.12} start={city} size={170} color={RC.blue} />
        <TypeOn text="नई राजधानी 👑" x={W * 0.24} y={H * 0.26} start={capital} size={90} color={RC.white} />
        <TypeOn text="Europe की खिड़की 🪟" x={W * 0.76} y={H * 0.26} start={window} size={100} color={RC.yellow} />
        <TypeOn text="हज़ारों मज़दूरों की जान गई" x={W * 0.5} y={H * 0.8} start={lives} size={100} color="#E8E8E8" />
      </Camera>
      {frame >= lives && <AbsoluteFill style={{ background: 'rgba(30,30,40,0.35)', opacity: ramp(frame, lives, 20) }} />}
      <YearTag text="1703" start={tag} />
      {[0, 1, 2, 3, 4, 5].map((k) => <Sfx key={k} at={swamp + 20 + k * 26} file="thud_soft.wav" volume={0.3} />)}
      <Sfx at={city} file="sting_shimmer.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── G · Alexei ───────────── */
const G: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const pattern = L(at(49, 'पुराना'));
  const alexei = L(at(49, 'Alexei'));
  const against = L(at(49, 'ख़िलाफ़'));
  const treason = L(at(49, 'देशद्रोह'));
  const yr = L(at(49, 'सत्रह'));
  const died = L(at(49, 'मौत'));
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_dark_study_1718.png" from={0} sky="#2E2620" ground="#1E1814" />
      <Camera from={0}>
        <Char who="peter_great" x={W * 0.24} y={H * 0.97} height={H * 0.76} start={2} gestures={[[0, 'hold'], [treason, 'point']]} moods={[[0, 'angry'], [died, 'sad']]} />
        <TypeOn text="वही पुराना pattern…" x={W * 0.55} y={H * 0.1} start={pattern} size={110} color={RC.danger} />
        <Card src="cards/card_tsarevich_alexei.png" x={W * 0.62} y={H * 0.5} w={W * 0.2} start={alexei} name="Alexei" ribbonAt={died} grey={died} />
        <TypeOn text="reforms के ख़िलाफ़ ✋" x={W * 0.84} y={H * 0.28} start={against} size={80} color={RC.yellow} />
        <Stamp text="देशद्रोह" x={W * 0.85} y={H * 0.62} start={treason} size={110} />
        <TypeOn text="1718" x={W * 0.85} y={H * 0.84} start={yr} size={140} color={RC.danger} />
      </Camera>
      <Sfx at={treason} file="stamp_slam.wav" volume={0.6} />
      <Sfx at={died} file="bell_toll.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── H · Emperor, from above ───────────── */
const Hh: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const yr = L(at(50, 'सत्रह'));
  const emperor = L(at(50, 'Emperor'));
  const power = L(at(50, 'Europe'));
  const above = L(at(50, 'ऊपर'));
  const peasant = L(at(50, 'आम'));
  const stage = frame >= above - 6;
  return (
    <AbsoluteFill>
      {!stage ? (
        <AbsoluteFill>
          <RMap view="eurasia" cam={[{ at: 0, lon: 70, lat: 58, zoom: 1.3 }, { at: emperor, lon: 60, lat: 56, zoom: 1.5, dur: 120 }]}
            overlay={<><At lon={60} lat={60} start={emperor} over={1.2}><div style={{ textAlign: 'center' }}><Glyph g="👑" size={180} /><div style={hand(110, RC.yellow)}>Emperor · 1721</div></div></At>
              <MapLabel lon={85} lat={52} text="Russian Empire" start={power} size={130} color="#E6FFE6" /></>}>
            <Fill id="russia_1725" color={RC.rusRed} colors={[[yr + 10, RC.peterGreen]]} start={0} dur={1} opacity={0.6} pulseAt={[emperor]} />
          </RMap>
          <YearTag text="1721" start={yr} />
        </AbsoluteFill>
      ) : (
        <GreyStage>
          <Camera from={above}>
            <TypeOn text="बदलाव ⬇️ ऊपर से" x={W * 0.56} y={H * 0.14} start={above} size={120} color={RC.yellow} />
            <LoopWheel x={W * 0.48} y={H * 0.55} r={H * 0.22} start={above} small steps={[[above + 4, 1], [above + 40, 2]]} />
            <Char who="serf_worker" x={W * 0.82} y={H * 0.96} height={H * 0.46} start={peasant} moods={[[peasant, 'sad']]} gestures={[[peasant, 'down']]} shake={[peasant + 20, peasant + 300]} />
            <TypeOn text="किसान: और सख़्त 😞" x={W * 0.82} y={H * 0.44} start={peasant + 6} size={90} color={RC.danger} />
          </Camera>
          <Host x={W * 0.14} y={H * 0.92} height={H * 0.52} offset={base} start={above} gestures={[[above, 'fingerUp'], [peasant, 'present']]} moods={[[above, 'neutral'], [peasant, 'sad']]} />
        </GreyStage>
      )}
      <Sfx at={emperor} file="sting_crown.wav" volume={0.55} />
      <Sfx at={yr + 10} file="whoosh_soft.wav" volume={0.4} />
    </AbsoluteFill>
  );
};

const SHOTS: [number, React.FC<{ base: number }>][] = [
  [C5_FROM, A],
  [P(44), B],
  [P(45), Cc],
  [P(46), D],
  [P(47), E],
  [P(48), F],
  [P(49), G],
  [P(50), Hh],
];

export const C05Peter: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map(([from, Comp], i) => {
      const to = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : C5_TO;
      return (
        <Sequence key={i} from={from - C5_FROM} durationInFrames={to - from}>
          <Comp base={from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
