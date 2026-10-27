import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, Card, Flash, GreyStage, Iris, PopIn, RC, RImg, Stamp, TypeOn, YearTag, hand } from '../kit/core';
import { Candle, LoopWheel } from '../kit/devices';
import { Host } from '../kit/Host';
import { Char } from '../kit/cast';
import { BgPlate, Fire, Glyph, Rider, ShockLines, Smoke, Snow } from '../kit/scene';
import { At, Fill, MapLabel, Pin, RMap, Route } from '../map/RMap';

/**
 * CHAPTER 3 · IVAN (P25–P33): 1533 → 1598.
 * A  P25  1547 cathedral: the crown comes down on a 16-year-old; "Tsar = Caesar"; EMPEROR
 * B  P26  1533: a three-year-old on a giant throne, boyars squabble over his head; "Ivan never forgot"
 * C  P27  map: Kazan flips to Moscow red → Red Square: St Basil's builds up dome by dome
 * D  P28  1560 dark stage: Anastasia's candle goes out, poison? → the young Tsar becomes the Terrible
 * E  P29  1565: the Oprichnina carved out in black → black riders on a snowy road, dog's head + broom
 * F  P30  1570: route to Novgorod, the city burns, "how many? historians disagree"
 * G  P31  1581: the staff comes down — the heir's portrait gets the black ribbon
 * H  P32  the loop: strong man → order → over the line; Feodor, then nobody
 * I  P33  1598: the Rurik family tree loses its last leaf; the host drops his staff
 */
export const C3_FROM = CHAPTERS[2].from;
export const C3_TO = CHAPTERS[3].card;
const P = (n: number) => para(n).f - 6;
const MOSCOW: [number, number] = [37.62, 55.75];

/* ───────────── A · 1547 the first Tsar ───────────── */
const A: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(25, 'पंद्रह'));
  const ivan = L(at(25, 'Ivan'));
  const sixteen = L(at(25, 'सोलह'));
  const crown = L(at(25, 'राज्याभिषेक'));
  const caesar = L(at(25, 'Caesar'));
  const emperor = L(at(25, 'emperor'));
  const cy = H * 0.16 + (H * 0.18) * ramp(frame, crown - 30, 34, ease.out);
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_cathedral_1547.png" from={0} sky="#7A5A2A" ground="#5A4020" push={0.016} />
      <Camera from={0} keys={[{ at: crown, zoom: 1.12, y: -H * 0.04, dur: 40 }]}>
        <Char who="ivan_iv_young" x={W * 0.5} y={H * 0.95} height={H * 0.5} start={ivan} walk={[{ at: 0, x: W * 0.2 }, { at: ivan, x: W * 0.5, dur: 70 }]}
          gestures={[[ivan, 'down'], [crown + 30, 'cheer'], [emperor, 'hips']]} moods={[[ivan, 'worried'], [crown + 30, 'grin'], [emperor, 'smug']]} />
        {frame >= crown - 30 && frame < crown + 6 && (
          <div style={{ position: 'absolute', left: W * 0.5 - 130, top: cy }}><RImg src="props/cap_of_monomakh.png" w={260} h={260} label="👑" /></div>
        )}
        <ShockLines x={W * 0.5} y={H * 0.5} r={H * 0.36} start={crown + 4} />
        <TypeOn text="उम्र 16" x={W * 0.78} y={H * 0.36} start={sixteen} size={110} color={RC.yellow} exit={caesar - 4} />
        <TypeOn text="Tsar  =" x={W * 0.38} y={H * 0.12} start={L(at(25, 'Tsar', 1))} size={150} color={RC.white} />
        <TypeOn text="Caesar" x={W * 0.6} y={H * 0.12} start={caesar} size={150} color={RC.blue} />
        <Stamp text="EMPEROR" x={W * 0.78} y={H * 0.36} start={emperor} size={120} color="#B8860B" rotate={-8} />
      </Camera>
      <YearTag text="1547" start={tag} />
      <Sfx at={crown} file="sting_crown.wav" volume={0.6} />
      <Sfx at={crown} file="bell_ding.wav" volume={0.4} />
      <Sfx at={emperor} file="stamp_slam.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── B · the boy and the boyars ───────────── */
const B: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const where = L(at(26, 'कहाँ'));
  const three = L(at(26, 'तीन'));
  const father = L(at(26, 'पिता'));
  const mother = L(at(26, 'माँ'));
  const boyars = L(at(26, 'boyars.'));
  const fight = L(at(26, 'आपस'));
  const murder = L(at(26, 'हत्याएँ'));
  const noRespect = L(at(26, 'बच्चे'));
  const never = L(at(26, 'Ivan', 2));
  return (
    <GreyStage>
      <Camera from={0} keys={[{ at: never, zoom: 1.6, x: -W * 0.02, y: -H * 0.12, dur: 14, easing: ease.snap }]} focus={[W * 0.5, H * 0.5]}>
        <PopIn x={W * 0.5} y={H * 0.6} start={where}><RImg src="props/throne_gold.png" w={H * 0.8} h={H * 0.8} label="throne" /></PopIn>
        <Char who="ivan_iv_child" x={W * 0.5} y={H * 0.72} height={H * 0.24} start={where + 10} legs={false}
          moods={[[0, 'neutral'], [father, 'sad'], [fight, 'worried'], [noRespect, 'sad'], [never, 'furious']]} gestures={[[0, 'down'], [fight, 'handsHead']]} />
        <TypeOn text="उम्र 3" x={W * 0.5} y={H * 0.18} start={three} size={130} color={RC.yellow} exit={boyars} />
        <Candle x={W * 0.22} y={H * 0.5} size={130} start={father - 10} outAt={father + 8} exit={boyars} />
        <TypeOn text="पिता" x={W * 0.22} y={H * 0.56} start={father - 6} size={60} color={RC.sub} exit={boyars} />
        <Candle x={W * 0.3} y={H * 0.5} size={130} start={mother - 10} outAt={mother + 8} exit={boyars} />
        <TypeOn text="माँ" x={W * 0.3} y={H * 0.56} start={mother - 6} size={60} color={RC.sub} exit={boyars} />
        {['boyar_a', 'boyar_b', 'boyar_a', 'boyar_b'].map((b, i) => (
          <Char key={i} who={b} x={W * [0.22, 0.34, 0.68, 0.8][i]} y={H * 0.95} height={H * 0.48} start={boyars - 14 + i * 5} flip={i >= 2} seed={`by${i}`}
            gestures={[[0, 'hips'], [fight, i % 2 ? 'fist' : 'point'], [noRespect, 'hips']]} moods={[[0, 'smug'], [fight, 'furious'], [noRespect, 'smug']]}
            shake={[fight, murder + 20]} tint={i >= 2 ? '#7A5A9E' : undefined} />
        ))}
        <TypeOn text="boyars" x={W * 0.5} y={H * 0.16} start={boyars} size={140} color={RC.blue} exit={murder} />
        <ShockLines x={W * 0.5} y={H * 0.6} r={H * 0.45} start={fight} dur={50} />
        <PopIn x={W * 0.62} y={H * 0.3} start={murder} exit={noRespect}><Glyph g="🗡️" size={170} /></PopIn>
        <TypeOn text="महल में हत्याएँ" x={W * 0.5} y={H * 0.12} start={murder} size={110} color={RC.danger} exit={noRespect} />
        <TypeOn text="कोई इज़्ज़त नहीं 😢" x={W * 0.5} y={H * 0.12} start={noRespect} size={110} color={RC.white} exit={never} />
        <TypeOn text="Ivan कभी नहीं भूला…" x={W * 0.5} y={H * 0.86} start={never} size={130} color={RC.danger} />
      </Camera>
      <YearTag text="1533" start={three} />
      <Sfx at={father + 8} file="bell_toll.wav" volume={0.35} />
      <Sfx at={fight} file="sting_hit.wav" volume={0.4} />
      <Sfx at={never} file="timpani_hit.wav" volume={0.55} />
    </GreyStage>
  );
};

/* ───────────── C · Kazan and St Basil's ───────────── */
const KAZAN: [number, number] = [49.1, 55.8];
const Cc: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const kazan = L(at(27, 'Kazan'));
  const laws = L(at(27, 'क़ानून'));
  const joy = L(at(27, 'Kazan', 1));
  const church = L(at(27, 'रंग-बिरंगा'));
  const name = L(at(27, 'St.'));
  const famous = L(at(27, 'मशहूर'));
  const square = frame >= joy;
  const build = ramp(frame, church - 20, 70, ease.inOut);
  return (
    <AbsoluteFill>
      {!square ? (
        <AbsoluteFill>
          <RMap view="ru_west" cam={[{ at: 0, lon: 42, lat: 56, zoom: 1.7 }, { at: kazan, lon: 46, lat: 56, zoom: 2.3, dur: 80 }]}
            overlay={
              <>
                <Pin lon={MOSCOW[0]} lat={MOSCOW[1]} label="Moscow" start={0} side="l" />
                <Pin lon={KAZAN[0]} lat={KAZAN[1]} label="Kazan" start={4} />
                <At lon={44} lat={53.2} start={laws} bob={5}><div style={{ textAlign: 'center' }}><Glyph g="📜" size={120} /><div style={hand(70, RC.white)}>नए क़ानून</div></div></At>
              </>
            }>
            <Fill id="russia_1584" color={RC.rusRed} start={0} dur={1} opacity={0.4} />
            <Fill id="muscovy_1505" color={RC.rusRed} start={0} dur={1} opacity={0.6} />
            <Fill id="kazan_khanate" color={RC.kazan} colors={[[kazan + 20, RC.rusRed]]} start={0} dur={1} opacity={0.62} pulseAt={[kazan + 20]} />
            <Route pts={[MOSCOW, [42, 56.2], [46, 56.0], KAZAN]} start={kazan - 10} dur={40} width={30} />
          </RMap>
          <Sfx at={kazan + 20} file="pop_low.wav" volume={0.6} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <BgPlate src="bg/bg_red_square_1561.png" from={joy} sky="#BFD4E6" ground="#E8E8EC" />
          <Camera from={joy}>
            <div style={{ position: 'absolute', left: W * 0.62 - H * 0.36, top: H * 0.16, width: H * 0.72, height: H * 0.8, clipPath: `inset(${(1 - build) * 100}% 0 0 0)` }}>
              <RImg src="props/st_basils_cathedral.png" w={H * 0.72} h={H * 0.8} label="St. Basil's ⛪" />
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <PopIn key={i} x={W * 0.62 + (i - 2) * H * 0.12} y={H * (0.24 + Math.abs(i - 2) * 0.05)} start={church + 40 + i * 6} exit={church + 70 + i * 6} over={1.3}>
                <Glyph g="✨" size={80} />
              </PopIn>
            ))}
            <Char who="ivan_iv_young" x={W * 0.22} y={H * 0.95} height={H * 0.46} start={joy} gestures={[[joy, 'cheer'], [name, 'present']]} moods={[[joy, 'grin']]} hopAt={[joy + 10]} />
            <TypeOn text="St. Basil's" x={W * 0.62} y={H * 0.1} start={name} size={150} color={RC.blue} />
            <TypeOn text="Russia की सबसे famous तस्वीर 📸" x={W * 0.55} y={H * 0.92} start={famous} size={96} color={RC.yellow} />
          </Camera>
          {[0, 1, 2, 3, 4].map((i) => <Sfx key={i} at={church + 40 + i * 6} file="pop_high.wav" volume={0.35} />)}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ───────────── D · Anastasia, and Ivan changes ───────────── */
const D: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(28, 'पंद्रह'));
  const ana = L(at(28, 'Anastasia'));
  const death = L(at(28, 'मौत'));
  const poison = L(at(28, 'ज़हर'));
  const changed = L(at(28, 'बदल'));
  const swapped = frame >= changed;
  return (
    <GreyStage dark>
      <Camera from={0}>
        <Card src="cards/card_anastasia.png" x={W * 0.38} y={H * 0.46} w={W * 0.19} start={4} name="Anastasia" ribbonAt={death + 10} grey={death + 10} exit={changed - 6} />
        <Candle x={W * 0.57} y={H * 0.86} size={200} start={6} outAt={death + 4} exit={changed - 6} />
        <PopIn x={W * 0.7} y={H * 0.42} start={poison} exit={changed - 6}><div style={{ textAlign: 'center' }}><Glyph g="🍷" size={170} /><div style={{ ...hand(90, RC.danger) }}>ज़हर?</div></div></PopIn>
        {!swapped ? (
          <Char who="ivan_iv_young" x={W * 0.84} y={H * 0.95} height={H * 0.46} start={ana} flip moods={[[ana, 'sad'], [poison, 'angry']]} gestures={[[ana, 'handsHead'], [poison, 'fist']]} shake={[poison, changed]} />
        ) : (
          <Char who="ivan_iv_terrible" x={W * 0.5} y={H * 0.97} height={H * 0.62} start={changed} moods={[[changed, 'furious']]} gestures={[[changed, 'fist']]} />
        )}
        <TypeOn text="Ivan बदल गया" x={W * 0.5} y={H * 0.12} start={changed + 6} size={140} color={RC.danger} />
      </Camera>
      <Flash at={changed} dur={8} color="#FFF" />
      <YearTag text="1560" start={tag} />
      <Sfx at={death + 4} file="bell_toll.wav" volume={0.45} />
      <Sfx at={changed} file="sub_drop.wav" volume={0.6} />
      <Sfx at={changed} file="timpani_hit.wav" volume={0.5} />
    </GreyStage>
  );
};

/* ───────────── E · 1565 the Oprichnina ───────────── */
const E: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(29, 'पंद्रह'));
  const opr = L(at(29, 'Oprichnina.'));
  const army = L(at(29, 'फ़ौज।'));
  const black = L(at(29, 'काले'));
  const dog = L(at(29, 'कुत्ते'));
  const broom = L(at(29, 'झाड़ू।'));
  const sniff = L(at(29, 'ग़द्दारों'));
  const sweep = L(at(29, 'साफ़'));
  const road = frame >= army;
  return (
    <AbsoluteFill>
      {!road ? (
        <RMap view="ru_west" cam={[{ at: 0, lon: 40, lat: 57, zoom: 1.8 }, { at: opr, lon: 40, lat: 58, zoom: 2.3, dur: 120 }]}
          overlay={<><Pin lon={MOSCOW[0]} lat={MOSCOW[1]} label="Moscow" start={0} side="l" /><MapLabel lon={41} lat={59.6} text="Oprichnina" start={opr + 10} size={120} color="#FFF" /></>}>
          <Fill id="russia_1584" color={RC.rusRed} start={0} dur={1} opacity={0.55} />
          <Fill id="oprichnina" color={RC.oprich} start={opr} mode="flood" origin={MOSCOW} dur={50} opacity={0.8} />
        </RMap>
      ) : (
        <AbsoluteFill>
          <BgPlate src="bg/bg_snow_road_night.png" from={army} sky="#1E2238" ground="#C9D3E2" pan={-30} />
          <Snow start={army} density={90} wind={-3} />
          <Camera from={army} drift={0.006}>
            {[0, 1, 2].map((i) => (
              <Rider key={i} horse="horse_black" who="oprichnik" x={W * (0.3 + i * 0.22) + Math.sin((frame + i * 20) / 30) * 20} y={H * (0.9 - i * 0.04)} height={H * (0.5 - i * 0.05)} start={army + i * 6} seed={`op${i}`}
                moods={[[army, 'angry']]} />
            ))}
            <TypeOn text="Oprichniki" x={W * 0.5} y={H * 0.12} start={army + 4} size={160} color={RC.danger} />
            <TypeOn text="काले कपड़े · काले घोड़े" x={W * 0.5} y={H * 0.25} start={black} size={96} color={RC.white} exit={dog} />
            <PopIn x={W * 0.2} y={H * 0.36} start={dog}><div style={{ ...hand(90, RC.white) }}>🐕 कुत्ते का सिर →</div></PopIn>
            <PopIn x={W * 0.8} y={H * 0.36} start={broom}><div style={{ ...hand(90, RC.white) }}>← 🧹 झाड़ू</div></PopIn>
            <TypeOn text="ग़द्दारों को सूँघो… 🐕" x={W * 0.5} y={H * 0.25} start={sniff} size={100} color={RC.yellow} />
            <TypeOn text="…और साफ़ कर दो 🧹" x={W * 0.5} y={H * 0.33} start={sweep} size={100} color={RC.danger} />
          </Camera>
          <Sfx at={army} file="whoosh_big.wav" volume={0.5} />
        </AbsoluteFill>
      )}
      <YearTag text="1565" start={tag} />
      <Iris at={tag + 2} hold={36} />
      <Sfx at={opr} file="sub_drop.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── F · 1570 Novgorod ───────────── */
const NOV: [number, number] = [31.3, 58.5];
const F: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const tag = L(at(30, 'पंद्रह'));
  const nov = L(at(30, 'Novgorod'));
  const killed = L(at(30, 'हज़ारों'));
  const howMany = L(at(30, 'कितने,'));
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 36, lat: 57, zoom: 1.9 }, { at: nov, lon: 32.5, lat: 58, zoom: 2.8, dur: 90 }]}
        overlay={
          <>
            <Pin lon={MOSCOW[0]} lat={MOSCOW[1]} label="Moscow" start={0} side="l" />
            <Pin lon={NOV[0]} lat={NOV[1]} label="Novgorod" start={nov} />
            <At lon={NOV[0]} lat={NOV[1]} start={killed - 20}><div style={{ position: 'relative', width: 0, height: 0 }}><Smoke x={0} y={-60} size={110} start={0} /><Fire x={0} y={0} size={170} start={0} /></div></At>
            <At lon={34.4} lat={59.6} start={howMany}><div style={{ ...hand(110, RC.yellow), textAlign: 'center' }}>हज़ारों मारे गए<br /><span style={{ fontSize: 80, color: '#FFF' }}>कितने? बहस है 🤷</span></div></At>
          </>
        }>
        <Fill id="russia_1584" color={RC.rusRed} start={0} dur={1} opacity={0.5} />
        <Fill id="oprichnina" color={RC.oprich} start={0} dur={1} opacity={0.8} />
        <Route pts={[[38.6, 57.2], [35.4, 57.8], [33.0, 58.2], NOV]} start={nov - 20} dur={60} width={34} color="#141414" head={RC.stampRed} />
      </RMap>
      <YearTag text="1570" start={tag} />
      <Sfx at={killed - 20} file="impact_boom.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── G · 1581 the son ───────────── */
const G: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const yr = L(at(31, 'पंद्रह'));
  const argue = L(at(31, 'बहस'));
  const hit = L(at(31, 'मारा।'));
  const died = L(at(31, 'बेटे', 1));
  const card = frame >= died - 10;
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_kremlin_hall_1530s.png" from={0} sky="#3A2A2A" ground="#241A16" dim={0.45} />
      <Camera from={0} shake={[{ at: hit, amp: 26, dur: 18 }]}>
        {!card ? (
          <>
            <Char who="ivan_iv_terrible" x={W * 0.36} y={H * 0.95} height={H * 0.56} start={2} gestures={[[0, 'chin'], [argue, 'point'], [hit - 14, 'cheer'], [hit, 'fist']]} moods={[[0, 'angry'], [argue, 'furious']]}>
              <div style={{ position: 'absolute', left: '70%', top: '-10%', transformOrigin: '50% 90%', transform: `rotate(${frame < hit - 14 ? -10 : frame < hit ? -60 : 40}deg)` }}>
                <RImg src="props/pointed_staff.png" w={70} h={420} label="" />
              </div>
            </Char>
            <Char who="ivan_iv_young" x={W * 0.66} y={H * 0.95} height={H * 0.5} start={4} flip tint="#5A6A8A" seed="tsarevich" moods={[[0, 'angry'], [hit - 10, 'shocked']]} gestures={[[0, 'point'], [hit - 10, 'handsHead']]} fallAt={hit + 6} />
            <TypeOn text="बहस…" x={W * 0.5} y={H * 0.16} start={argue} size={110} exit={hit} />
          </>
        ) : (
          <>
            <Card src="cards/card_tsarevich_ivan.png" x={W * 0.5} y={H * 0.46} w={W * 0.2} start={died - 10} name="बेटा · वारिस" ribbonAt={died + 4} grey={died + 4} />
          </>
        )}
        <TypeOn text="1581" x={W * 0.8} y={H * 0.2} start={yr} size={160} color={RC.danger} />
      </Camera>
      <Flash at={hit} dur={6} />
      <Sfx at={hit} file="impact_boom.wav" volume={0.6} />
      <Sfx at={died + 4} file="bell_toll.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── H/I · the loop; the dynasty ends ───────────── */
const HI: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const loop = L(at(32, 'loop.'));
  const strong = L(at(32, 'एक'));
  const order = L(at(32, 'order'));
  const over = L(at(32, 'हद'));
  const feodor = L(at(32, 'Feodor.'));
  const after = L(at(32, 'Feodor', 1));
  const nobody = L(at(32, 'कोई'));
  const tag = L(at(33, 'पंद्रह'));
  const tree = L(at(33, 'Rurik'));
  const ended = L(at(33, 'ख़त्म'));
  const treePhase = frame >= tag - 10;
  const leafFall = ramp(frame, ended - 30, 50, ease.in);
  return (
    <GreyStage>
      <Camera from={0}>
        {!treePhase ? (
          <>
            <LoopWheel x={W * 0.62} y={H * 0.5} r={H * 0.26} start={loop} steps={[[strong, 1], [order, 2], [over, 3]]} exit={feodor - 4} />
            <Char who="michael_romanov" tint="#8A8AA0" x={W * 0.62} y={H * 0.95} height={H * 0.4} start={feodor} seed="feodor" moods={[[feodor, 'worried']]} gestures={[[feodor, 'shrug']]} />
            <TypeOn text="Feodor (कमज़ोर)" x={W * 0.62} y={H * 0.42} start={feodor + 4} size={100} color={RC.blue} />
            <TypeOn text="उसके बाद?" x={W * 0.84} y={H * 0.3} start={after} size={100} color={RC.white} />
            <TypeOn text="कोई नहीं 🤷" x={W * 0.84} y={H * 0.42} start={nobody} size={110} color={RC.danger} />
          </>
        ) : (
          <>
            <PopIn x={W * 0.6} y={H * 0.46} start={tag - 10}><RImg src="docs/rurik_family_tree.png" w={H * 0.6} h={H * 0.72} label="Rurik family tree 🌳" /></PopIn>
            <TypeOn text="862 → 1598" x={W * 0.6} y={H * 0.08} start={tree} size={120} color={RC.blue} />
            <div style={{ position: 'absolute', left: W * 0.6 + H * 0.1, top: H * 0.22 + leafFall * H * 0.6, transform: `rotate(${leafFall * 200}deg)`, opacity: frame >= tag ? 1 : 0, filter: `grayscale(${ramp(frame, tag + 10, 20)})` }}><Glyph g="🍂" size={110} /></div>
            <TypeOn text="700+ साल की dynasty ख़त्म" x={W * 0.6} y={H * 0.92} start={ended} size={110} color={RC.danger} />
          </>
        )}
      </Camera>
      <Host x={W * 0.16} y={H * 0.92} height={H * 0.58} offset={base} start={0} dropAt={ended + 6}
        gestures={[[0, 'fingerUp'], [strong, 'present'], [over, 'shrug'], [feodor, 'point'], [nobody, 'shrug'], [tag, 'present']]}
        moods={[[0, 'neutral'], [over, 'worried'], [nobody, 'sad']]} shake={[0, 40]} />
      <Sfx at={over} file="sting_hit.wav" volume={0.45} />
      <Sfx at={nobody} file="pluck_down.wav" volume={0.5} />
      <Sfx at={ended + 22} file="thud_soft.wav" volume={0.7} />
      <YearTag text="1598" start={tag} />
    </GreyStage>
  );
};

const SHOTS: [number, React.FC<{ base: number }>][] = [
  [C3_FROM, A],
  [P(26), B],
  [P(27), Cc],
  [P(28), D],
  [P(29), E],
  [P(30), F],
  [P(31), G],
  [P(32), HI],
];

export const C03Ivan: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map(([from, Comp], i) => {
      const to = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : C3_TO;
      return (
        <Sequence key={i} from={from - C3_FROM} durationInFrames={to - from}>
          <Comp base={from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
