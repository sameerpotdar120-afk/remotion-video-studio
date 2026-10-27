import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, Card, Flash, GreyStage, Iris, PopIn, RC, RImg, Stamp, TypeOn, YearTag, hand } from '../kit/core';
import { LoopWheel } from '../kit/devices';
import { Host } from '../kit/Host';
import { Char } from '../kit/cast';
import { BgPlate, Fire, Fit, Frame, Glyph, NoSign, Rays, ShockLines, Smoke } from '../kit/scene';
import { At, Fill, MapEyes, MapLabel, Patchwork, Pin, RMap, River, Route, Traveller } from '../map/RMap';

/**
 * CHAPTER 1 · RUS (P5–P16): 862 → 1240.
 * A  P5   map: forests and rivers, no borders; 862 tag + iris; tribes pop; modern countries ghost in then vanish
 * B  P6   chronicle book on the grey stage → forest river: three elders argue, then "come and rule us"
 * C  P7   longship pops on the river, Rurik steps off; LEGEND? stamp; loop wheel lights "strong man"
 * D  P8   grey stage: "Rus" = rowers (oar) + Sweden inset with Roslagen; TRUE STORY? → green tick
 * E  P9   882: route Novgorod → Kyiv; Kievan Rus spreads mustard; trade route Scandinavia → Constantinople
 * F  P10  988 + iris: Vladimir's hall, "religion shopping", four envoys
 * G  P11  envoy 1: no alcohol → Vladimir's face drops, his line in yellow
 * H  P12  envoy 4: Hagia Sophia with light rays; "स्वर्ग या ज़मीन?"; Orthodox chosen
 * I  P13  grey stage: LEGEND?, political deal: Vladimir ⇄ Anna, the church as identity
 * J  P14  map: Rus splits into a patchwork of principalities glaring at each other
 * K  P15  1237: the Horde floods in from the east, riders on routes, Ryazan and Vladimir burn
 * L  P16  1240 + iris: Kyiv burns at dusk → collapse #1
 */
export const C1_FROM = CHAPTERS[0].from;
export const C1_TO = CHAPTERS[1].card;
const P = (n: number) => para(n).f - 6;

/* ───────────── A · 862, a land of forests, rivers and tribes ───────────── */
const A: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const tag = L(at(5, 'आठ'));
  const modern = L(at(5, 'Russia,'));
  const none = L(at(5, 'कोई'));
  const forest = L(at(5, 'जंगल,'));
  const rivers = L(at(5, 'नदियाँ,'));
  const tribes = L(at(5, 'क़बीले,'));
  const fight = L(at(5, 'लड़ते'));
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 36, lat: 55, zoom: 1.05 }, { at: 10, lon: 32, lat: 55, zoom: 1.75, dur: 300 }, { at: forest, lon: 33, lat: 55, zoom: 2.1, dur: 260 }]}
        overlay={
          <>
            <MapLabel lon={37.6} lat={57.5} text="Russia" start={modern} exit={none} size={110} color="rgba(255,255,255,0.9)" />
            <MapLabel lon={31.5} lat={48.8} text="Ukraine" start={modern + 12} exit={none} size={100} color="rgba(255,255,255,0.9)" />
            <MapLabel lon={28} lat={53.4} text="Belarus" start={modern + 24} exit={none} size={90} color="rgba(255,255,255,0.9)" />
            {[[33, 57.6], [36.5, 53], [30, 60.5], [27, 51.5], [38.5, 56]].map(([lo, la], i) => (
              <At key={i} lon={lo} lat={la} start={forest + i * 4} bob={4}><Glyph g="🌲" size={130} /></At>
            ))}
            <MapLabel lon={30.4} lat={51.2} text="Slavs" start={tribes} size={110} color={RC.yellow} />
            <MapLabel lon={35.5} lat={61.2} text="Finns" start={tribes + 8} size={110} color={RC.yellow} />
            <MapLabel lon={24.2} lat={55.8} text="Balts" start={tribes + 16} size={110} color={RC.yellow} />
            <MapLabel lon={38.6} lat={54.2} text="Slavs" start={tribes + 22} size={90} color={RC.yellow} />
            {[[32.6, 55.6], [27.6, 53.8], [34.4, 58.8]].map(([lo, la], i) => (
              <At key={`x${i}`} lon={lo} lat={la} start={fight + i * 6} over={1.3}><Glyph g="⚔️" size={110} /></At>
            ))}
          </>
        }
      >
        <Fill id="rep_russia" color="rgba(255,255,255,0.05)" opacity={0.08} start={modern} exit={none} border="rgba(255,255,255,0.9)" borderPx={4} />
        <Fill id="ukraine" color="rgba(255,255,255,0.05)" opacity={0.08} start={modern + 12} exit={none} border="rgba(255,255,255,0.9)" borderPx={4} />
        <Fill id="rep_belarus" color="rgba(255,255,255,0.05)" opacity={0.08} start={modern + 24} exit={none} border="rgba(255,255,255,0.9)" borderPx={4} />
        {['Dnieper', 'Volga', 'Volkhov', 'W. Dvina', 'Don', 'Oka', 'Desna', 'Neva'].map((r, i) => (
          <River key={r} name={r} start={(i < 3 ? 20 : rivers) + i * 6} dur={90} width={i < 3 ? 6 : 4.5} />
        ))}
      </RMap>
      <YearTag text="862" start={tag} />
      <Iris at={tag + 4} hold={50} />
      <Sfx at={tag} file="tick.wav" volume={0.5} />
      <Sfx at={tribes} file="pop_high.wav" volume={0.5} />
      <Sfx at={fight} file="sting_hit.wav" volume={0.35} />
    </AbsoluteFill>
  );
};

/* ───────────── B · the chronicle, the elders argue ───────────── */
const B: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const forestAt = L(at(6, 'झगड़ों'));
  const call = L(at(6, 'बाहर'));
  const said = L(at(6, 'हमारी'));
  const order = L(at(6, 'पर इसमें'));
  const come = L(at(6, 'आओ,'));
  const inForest = frame >= forestAt;
  return (
    <AbsoluteFill>
      {!inForest ? (
        <GreyStage>
          <Camera from={0}>
            <Frame x={W * 0.6} y={H * 0.46} w={W * 0.44} h={W * 0.29} start={L(at(6, 'कहानी'))} tilt={-3}>
              <RImg src="docs/primary_chronicle_page.png" w={W * 0.44} h={W * 0.29} label="Primary Chronicle (manuscript)" />
            </Frame>
            <TypeOn text="Primary Chronicle · ~1113" x={W * 0.6} y={H * 0.86} start={L(at(6, 'chronicle')) + 14} size={96} color={RC.blue} />
          </Camera>
          <Host x={W * 0.16} y={H * 0.92} height={H * 0.6} offset={base} start={0} gestures={[[0, 'fingerUp'], [L(at(6, 'कहानी')), 'present'], [L(at(6, 'chronicle')), 'point']]} moods={[[0, 'smile']]} />
        </GreyStage>
      ) : (
        <AbsoluteFill>
          <BgPlate src="bg/bg_forest_river_862.png" from={forestAt} sky="#AFC6CF" ground="#55693A" />
          <Camera from={forestAt} drift={0.012}>
            <Char who="slav_elder" x={W * 0.3} y={H * 0.93} height={H * 0.46} start={forestAt + 2} gestures={[[forestAt, 'fist'], [call, 'present'], [come, 'cheer']]} moods={[[forestAt, 'angry'], [call, 'worried'], [come, 'grin']]} shake={[forestAt + 4, call - 4]} talk={[[said, order + 40]]} />
            <Char who="finn_elder" x={W * 0.5} y={H * 0.95} height={H * 0.44} start={forestAt + 6} flip gestures={[[forestAt, 'point'], [call, 'shrug'], [come, 'cheer']]} moods={[[forestAt, 'furious'], [call, 'worried'], [come, 'smile']]} shake={[forestAt + 4, call - 4]} />
            <Char who="balt_elder" x={W * 0.68} y={H * 0.93} height={H * 0.45} start={forestAt + 10} flip gestures={[[forestAt, 'fist'], [call, 'hips'], [come, 'wave']]} moods={[[forestAt, 'angry'], [call, 'neutral'], [come, 'smile']]} hopAt={[come + 10]} />
            <ShockLines x={W * 0.48} y={H * 0.5} r={H * 0.4} start={forestAt + 4} dur={36} />
            <TypeOn text="ये नदी हमारी है!" x={W * 0.3} y={H * 0.36} start={forestAt + 6} exit={call - 6} size={84} />
            <TypeOn text="नहीं, हमारी!" x={W * 0.52} y={H * 0.29} start={forestAt + 30} exit={call - 6} size={84} />
            <TypeOn text="हमारी ज़मीन बड़ी है, अमीर है…" x={W * 0.5} y={H * 0.22} start={said} exit={come - 4} size={92} />
            <TypeOn text="पर order नहीं!" x={W * 0.5} y={H * 0.33} start={order} exit={come - 4} size={110} color={RC.danger} />
            <TypeOn text="आओ, हम पर राज करो!" x={W * 0.5} y={H * 0.27} start={come} size={130} color={RC.yellow} />
          </Camera>
          <Sfx at={forestAt} file="whoosh_soft.wav" volume={0.5} />
          <Sfx at={come} file="sting_shimmer.wav" volume={0.45} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ───────────── C · Rurik arrives ───────────── */
const Cc: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const ship = 2;
  const name = L(at(7, 'Rurik,'));
  const viking2 = L(at(7, 'हाँ,'));
  const hist = L(at(7, 'historians'));
  const lesson = L(at(7, 'पर इस'));
  const onStage = frame >= hist;
  const shipX = W * (1.25 - 0.62 * ramp(frame, ship, 70, ease.out));
  return (
    <AbsoluteFill>
      {!onStage ? (
        <AbsoluteFill>
          <BgPlate src="bg/bg_forest_river_862.png" from={-200} sky="#AFC6CF" ground="#55693A" />
          <Camera from={0} keys={[{ at: viking2, zoom: 1.14, x: W * 0.02, y: 0, dur: 14 }]} focus={[W * 0.45, H * 0.62]}>
            <div style={{ position: 'absolute', left: shipX - W * 0.3, top: H * 0.36 + Math.sin(frame / 18) * 10, transform: `rotate(${Math.sin(frame / 22) * 1.5}deg)` }}>
              <RImg src="props/viking_longship.png" w={W * 0.6} h={W * 0.4} label="viking longship" />
            </div>
            <Char who="rurik_viking" x={W * 0.42} y={H * 0.95} height={H * 0.5} start={L(at(7, 'उसका'))}
              walk={[{ at: 0, x: W * 0.62 }, { at: L(at(7, 'उसका')), x: W * 0.42, dur: 50 }]}
              gestures={[[L(at(7, 'उसका')), 'wave'], [viking2, 'fist']]} moods={[[0, 'smug'], [viking2, 'grin']]} />
            <Char who="slav_elder" x={W * 0.14} y={H * 0.94} height={H * 0.42} start={0} moods={[[0, 'smile'], [viking2, 'shocked']]} hopAt={[viking2 + 4]} />
            <TypeOn text="Rurik" x={W * 0.42} y={H * 0.33} start={name} size={150} color={RC.blue} exit={hist - 4} />
            <TypeOn text="एक Viking!" x={W * 0.68} y={H * 0.22} start={viking2} size={140} color={RC.yellow} exit={hist - 4} />
          </Camera>
          <Sfx at={ship} file="whoosh_big.wav" volume={0.5} />
          <Sfx at={ship + 24} file="pop_low.wav" volume={0.6} />
          <Sfx at={viking2} file="timpani_hit.wav" volume={0.5} />
        </AbsoluteFill>
      ) : (
        <GreyStage>
          <Camera from={hist} drift={0.003}>
            <Char who="rurik_viking" x={W * 0.35} y={H * 0.92} height={H * 0.52} start={hist} exit={lesson - 12} moods={[[hist, 'smug'], [L(at(7, 'शायद')), 'worried']]} gestures={[[hist, 'hips']]} />
            <TypeOn text="Rurik ?" x={W * 0.35} y={H * 0.32} start={hist + 6} size={110} color={RC.blue} exit={lesson - 12} />
            <Stamp text="LEGEND?" x={W * 0.37} y={H * 0.17} start={L(at(7, 'शायद'))} size={130} exit={lesson - 12} />
            <TypeOn text="था भी या नहीं?" x={W * 0.64} y={H * 0.5} start={L(at(7, 'Rurik', 1))} size={130} color={RC.sub} exit={lesson - 16} />
            <LoopWheel x={W * 0.57} y={H * 0.52} r={H * 0.21} start={lesson} small steps={[[lesson + 4, 0], [L(at(7, 'ख़ुद')), 1]]} />
          </Camera>
          <Host x={W * 0.16} y={H * 0.92} height={H * 0.6} offset={base} start={hist} gestures={[[hist, 'present'], [L(at(7, 'शायद')), 'shrug'], [lesson, 'fingerUp'], [L(at(7, 'ख़ुद')), 'present']]}
            moods={[[hist, 'smug'], [lesson, 'neutral']]} />
          <Sfx at={L(at(7, 'शायद'))} file="stamp_slam.wav" volume={0.6} />
          <Sfx at={lesson} file="pop.wav" volume={0.5} />
        </GreyStage>
      )}
    </AbsoluteFill>
  );
};

/* ───────────── D · the name "Rus" = rowers ───────────── */
const D: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const rus = L(at(8, '"Rus"'));
  const norse = L(at(8, 'Norse'));
  const rowers = L(at(8, 'नाव'));
  const sweden = L(at(8, 'Sweden'));
  return (
    <GreyStage>
      <Camera from={0}>
        <TypeOn text="Russia" x={W * 0.46} y={H * 0.3} start={L(at(8, 'मज़ेदार'))} size={260} color={RC.blue} exit={rus - 4} rate={3} />
        <TypeOn text="नाम किसने दिया?" x={W * 0.46} y={H * 0.46} start={L(at(8, 'नाम'))} size={110} color={RC.sub} exit={L(at(8, 'नहीं')) - 4} />
        <TypeOn text="Russians ने नहीं!" x={W * 0.46} y={H * 0.46} start={L(at(8, 'नहीं'))} size={120} color={RC.danger} exit={rus - 4} />
        <Char who="slav_elder" x={W * 0.8} y={H * 0.93} height={H * 0.46} start={L(at(8, 'Russians'))} exit={rus - 4} flip
          gestures={[[0, 'shrug'], [L(at(8, 'historians')), 'hips']]} moods={[[0, 'worried'], [L(at(8, 'नहीं')), 'shocked']]} />
        <PopIn x={W * 0.48} y={H * 0.72} start={L(at(8, 'historians'))} exit={rus - 4}><RImg src="props/books_quill.png" w={H * 0.32} h={H * 0.32} label="books" /></PopIn>
        <TypeOn text="Rus" x={W * 0.42} y={H * 0.36} start={rus} size={300} color={RC.blue} />
        <TypeOn text="← Old Norse" x={W * 0.6} y={H * 0.33} start={norse} size={90} color={RC.sub} />
        <PopIn x={W * 0.44} y={H * 0.66} start={rowers} tilt={-8}><RImg src="props/oar_wooden.png" w={W * 0.26} h={W * 0.26} label="oar" /></PopIn>
        <TypeOn text="= नाव चलाने वाले" x={W * 0.44} y={H * 0.88} start={rowers + 6} size={110} color={RC.yellow} />
        <Frame x={W * 0.77} y={H * 0.52} w={W * 0.3} h={W * 0.3 * 0.56} start={sweden}>
          <Fit w={W * 0.3} h={W * 0.3 * 0.56}>
            <RMap view="europe_wide" cam={[{ at: 0, lon: 17, lat: 60, zoom: 3.2 }]} drift={0.02} from={sweden}
              overlay={<Pin lon={18.6} lat={59.8} label="Roslagen" start={sweden + 12} size={170} />}>
              <Fill id="sweden_modern" color={RC.sweden} start={sweden + 4} opacity={0.4} />
            </RMap>
          </Fit>
        </Frame>
        <Stamp text="TRUE STORY?" x={W * 0.77} y={H * 0.26} start={sweden + 30} size={100} color={RC.stampGreen} sub="ज़्यादातर historians: हाँ ✓" rotate={-6} />
      </Camera>
      <Host x={W * 0.16} y={H * 0.92} height={H * 0.6} offset={base} start={-30} gestures={[[0, 'fingerUp'], [rus, 'present'], [rowers, 'point'], [sweden, 'present']]} moods={[[0, 'grin'], [rowers, 'smile']]} />
      <Sfx at={rus} file="pen_draw.wav" volume={0.5} />
      <Sfx at={rowers} file="pop.wav" volume={0.5} />
      <Sfx at={sweden + 30} file="stamp_slam.wav" volume={0.55} />
    </GreyStage>
  );
};

/* ───────────── E · 882: Kyiv taken, Kievan Rus, the river trade ───────────── */
const NOV: [number, number] = [31.3, 58.5];
const KYIV: [number, number] = [30.5, 50.45];
const E: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const tag = L(at(9, 'आठ'));
  const south = L(at(9, 'दक्षिण'));
  const rus = L(at(9, 'Kievan'));
  const trade = L(at(9, 'नदियों'));
  const scand = L(at(9, 'Scandinavia'));
  const tradePts: [number, number][] = [[18.1, 59.3], [22.5, 59.8], [30.0, 60.0], [32.4, 60.6], NOV, [31.0, 56.0], [31.4, 53.6], KYIV, [32.6, 47.6], [31.6, 46.6], [30.6, 44.6], [28.98, 41.01]];
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 31, lat: 55, zoom: 1.9 }, { at: trade, lon: 27.5, lat: 50.3, zoom: 1.18, dur: 120 }]}
        overlay={
          <>
            <Pin lon={NOV[0]} lat={NOV[1]} label="Novgorod" start={4} />
            <Pin lon={KYIV[0]} lat={KYIV[1]} label="Kyiv" start={south} side="l" />
            <MapLabel lon={31.5} lat={53.4} text="Kievan Rus" start={rus} size={130} color={RC.yellow} />
            <Pin lon={28.98} lat={41.01} label="Constantinople" start={L(at(9, 'Constantinople'))} />
            <Traveller pts={[...tradePts.slice(0, -1), [29.6, 42.4]]} start={trade + 10} dur={L(at(9, 'तक।')) - trade + 30}>
              {(dir) => <div style={{ transform: `scaleX(${dir < 0 ? -1 : 1})` }}><RImg src="props/viking_longship.png" w={300} h={200} label="⛵" /></div>}
            </Traveller>
            <At lon={33} lat={49.4} start={trade + 30} bob={6}><Glyph g="💰" size={90} /></At>
            <At lon={33.6} lat={57.2} start={trade + 50} bob={6}><Glyph g="🧺" size={90} /></At>
          </>
        }>
        <River name="Dnieper" start={0} dur={1} width={6} />
        <River name="Volkhov" start={0} dur={1} width={6} />
        <Route pts={[NOV, [31.6, 56.6], [31.2, 54.2], [30.8, 52.2], KYIV]} start={south} dur={60} width={30} />
        <Fill id="kievan_rus_882" color={RC.rusMustard} start={rus} mode="flood" origin={NOV} dur={70} opacity={0.55} />
        <Route pts={tradePts} start={trade} dur={L(at(9, 'तक।')) - trade} width={18} dotted color="#FFE9A8" head={false} />
      </RMap>
      <YearTag text="882" start={tag} />
      <Sfx at={south} file="whoosh_fast.wav" volume={0.5} />
      <Sfx at={rus} file="sting_shimmer.wav" volume={0.4} />
    </AbsoluteFill>
  );
};

/* ───────────── F/G/H · 988: Vladimir goes religion shopping ───────────── */
const ENVOY_TINT = ['#3E6B3A', '#7A3E9A', '#2E5E9E', '#B88A2A'];
const FGH: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(10, 'नौ'));
  const vlad = L(at(10, 'Vladimir'));
  const shop = L(at(10, 'shopping'));
  const sent = L(at(10, 'हर'));
  const islam = L(at(11, 'Islam'));
  const butOne = L(at(11, 'बस'));
  const ban = L(at(11, 'शराब'));
  const line = L(at(11, 'पीना'));
  const cpl = L(at(12, 'फिर'));
  const heaven = L(at(12, 'हमें'));
  const chose = L(at(12, 'तो'));
  const cards = ['props/icon_card_mosque.png', 'props/icon_card_synagogue.png', 'props/icon_card_latin_church.png', 'props/hagia_sophia_model.png'];
  const labels = ['Islam', 'Judaism', 'Latin Church', 'Constantinople'];
  const envoyX = (i: number) => W * (0.48 + i * 0.12);
  const enter = L(at(10, 'अट्ठासी'));
  const cardAt = [islam, islam + 50, islam + 90, cpl];
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_kyiv_hall_988.png" from={0} sky="#6B4A30" ground="#4A3220" />
      <Camera from={0} drift={0.002} focus={[W * 0.5, H * 0.62]}>
        <PopIn x={W * 0.2} y={H * 0.63} start={enter}><RImg src="props/throne_wooden.png" w={H * 0.62} h={H * 0.62} label="throne" /></PopIn>
        <Char who="vladimir_prince" x={W * 0.2} y={H * 0.86} height={H * 0.44} start={enter + 8}
          gestures={[[0, 'wave'], [vlad, 'hips'], [shop, 'present'], [islam, 'fingerUp'], [ban, 'handsHead'], [line, 'fist'], [cpl, 'hips'], [heaven, 'handsHead'], [chose, 'cheer']]}
          moods={[[0, 'smug'], [vlad, 'neutral'], [shop, 'grin'], [islam, 'smile'], [ban, 'shocked'], [line, 'angry'], [cpl, 'neutral'], [heaven, 'shocked'], [chose, 'grin']]}
          talk={[[line, line + 150]]} hopAt={[chose + 4]} />
        {[0, 1, 2, 3].map((i) => (
          <Char key={i} who="envoy_kievan" tint={ENVOY_TINT[i]} x={envoyX(i)} y={H * 0.93} height={H * 0.32} start={sent + i * 8} flip seed={`env${i}`}
            walk={[{ at: 0, x: envoyX(i) + W * 0.4 }, { at: sent + i * 8, x: envoyX(i), dur: 50 }]}
            gestures={[[sent, 'down'], [cardAt[i], 'hold']]} moods={[[sent, 'smile'], [heaven, i === 3 ? 'shocked' : 'smile']]} />
        ))}
        <TypeOn text="🛒 Religion shopping" x={W * 0.55} y={H * 0.16} start={shop} size={120} color={RC.yellow} exit={islam - 4} />
        {[0, 1, 2, 3].map((i) => (
          <PopIn key={i} x={i === 3 ? W * 0.62 : envoyX(i)} y={i === 3 ? H * 0.42 : H * 0.44} start={cardAt[i]} exit={i === 3 ? undefined : cpl} tilt={i % 2 ? 4 : -4}>
            <div style={{ background: '#F4F1EA', borderRadius: 24, padding: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center', position: 'relative' }}>
              {i === 3 && <Rays x={H * 0.135} y={H * 0.15} r={H * 0.42} start={cpl + 10} />}
              <RImg src={cards[i]} w={H * (i === 3 ? 0.27 : 0.16)} h={H * (i === 3 ? 0.27 : 0.16)} label={labels[i]} />
              <div style={{ ...hand(i === 3 ? 64 : 44, '#333'), textShadow: 'none' }}>{labels[i]}</div>
            </div>
          </PopIn>
        ))}
        <PopIn x={envoyX(0) + W * 0.06} y={H * 0.2} start={butOne + 10} exit={cpl}>
          <NoSign size={H * 0.18} slashAt={ban}><Glyph g="🍷" size={H * 0.1} /></NoSign>
        </PopIn>
        <TypeOn text="शराब पर पाबंदी?!" x={W * 0.74} y={H * 0.21} start={ban} size={90} color={RC.danger} exit={line - 4} />
        <TypeOn text="पीना तो Rus की ख़ुशी है!" x={W * 0.24} y={H * 0.2} start={line} size={104} color={RC.yellow} exit={cpl} />
        <TypeOn text="स्वर्ग या ज़मीन?" x={W * 0.44} y={H * 0.15} start={heaven} size={130} color={RC.yellow} exit={chose} />
        <TypeOn text="Orthodox Christianity ✓" x={W * 0.4} y={H * 0.15} start={chose + 4} size={100} color={RC.green} />
      </Camera>
      <YearTag text="988" start={tag} />
      <Iris at={tag + 4} hold={40} />
      <Sfx at={shop} file="bell_ding.wav" volume={0.5} />
      {cardAt.map((f, i) => <Sfx key={i} at={f} file="pop.wav" volume={0.5} />)}
      <Sfx at={ban} file="sting_hit.wav" volume={0.45} />
      <Sfx at={heaven} file="sting_shimmer.wav" volume={0.55} />
      <Sfx at={chose} file="bell_ding.wav" volume={0.55} />
    </AbsoluteFill>
  );
};

/* ───────────── I · legend vs political deal ───────────── */
const I: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const legend = L(at(13, 'legend'));
  const deal = L(at(13, 'political'));
  const anna = L(at(13, 'Anna'));
  const result = L(at(13, 'पर'));
  const today = L(at(13, 'आज'));
  return (
    <GreyStage>
      <Camera from={0}>
        <Frame x={W * 0.58} y={H * 0.5} w={W * 0.42} h={W * 0.28} start={-20} exit={deal - 4} tilt={-3}>
          <RImg src="docs/primary_chronicle_page.png" w={W * 0.42} h={W * 0.28} label="Primary Chronicle" />
        </Frame>
        <TypeOn text="आधी कहानी…" x={W * 0.58} y={H * 0.15} start={L(at(13, 'कहानी'))} size={110} color={RC.sub} exit={deal - 4} />
        <Stamp text="LEGEND?" x={W * 0.6} y={H * 0.52} start={legend} size={190} exit={deal - 4} />
        <TypeOn text="political deal 🤝" x={W * 0.56} y={H * 0.17} start={deal} size={130} color={RC.yellow} exit={today - 4} />
        <Char who="vladimir_prince" x={W * 0.45} y={H * 0.86} height={H * 0.48} start={deal + 6} exit={today - 4}
          gestures={[[0, 'present'], [anna, 'cheer']]} moods={[[0, 'smug'], [anna, 'grin']]} />
        <TypeOn text="Vladimir" x={W * 0.45} y={H * 0.92} start={deal + 12} size={80} color={RC.blue} exit={today - 4} />
        <PopIn x={W * 0.635} y={H * 0.52} start={L(at(13, 'मदद'))} exit={today - 4}><Glyph g="⚔️ → 🤝" size={130} /></PopIn>
        <Card src="cards/card_anna_porphyrogenita.png" x={W * 0.82} y={H * 0.52} w={W * 0.17} start={anna - 10} exit={today - 4} name="Anna" tilt={4} />
        <TypeOn text="Basil II की बहन" x={W * 0.82} y={H * 0.9} start={L(at(13, 'बहन'))} size={70} color={RC.sub} exit={today - 4} />
        <PopIn x={W * 0.6} y={H * 0.5} start={today} over={1.15}><RImg src="props/onion_church_small.png" w={H * 0.6} h={H * 0.6} label="⛪ Orthodox church" /></PopIn>
        <TypeOn text="Russia की पहचान" x={W * 0.6} y={H * 0.88} start={L(at(13, 'पहचान'))} size={120} color={RC.yellow} />
      </Camera>
      <Host x={W * 0.15} y={H * 0.92} height={H * 0.6} offset={base} start={-30}
        gestures={[[0, 'present'], [legend, 'shrug'], [deal, 'fingerUp'], [anna, 'present'], [result, 'fingerUp'], [today, 'present']]} moods={[[0, 'smug'], [deal, 'grin'], [result, 'neutral'], [today, 'smile']]} />
      <Sfx at={legend} file="stamp_slam.wav" volume={0.45} />
      <Sfx at={anna} file="pop.wav" volume={0.5} />
      <Sfx at={today} file="bell_ding.wav" volume={0.4} />
    </GreyStage>
  );
};

/* ───────────── J · Rus splits into principalities ───────────── */
const PRIN = ['prin_novgorod', 'prin_pskov', 'prin_polotsk', 'prin_smolensk', 'prin_rostov', 'prin_vladimir_suzdal', 'prin_murom', 'prin_ryazan', 'prin_chernigov', 'prin_kyiv', 'prin_pereyaslavl', 'prin_turov_pinsk', 'prin_volhynia', 'prin_galicia'];
const PRIN_COL = ['#D9B23A', '#C46A2E', '#6B9E3A', '#3E8E8A', '#9E4A7A', '#C8352B', '#7A6ABF', '#D98A2E', '#4A7AC8', '#E0C040', '#8AB04A', '#B85A5A', '#5A9E6A', '#C0803A'];
const EYE_AT: [number, number][] = [[31.6, 59.6], [29.0, 57.5], [28.4, 55.3], [32.6, 54.6], [39.6, 58.4], [40.4, 56.4], [42.6, 55.4], [40.2, 53.9], [32.6, 51.8], [30.0, 50.2], [33.8, 49.6], [27.2, 52.0], [24.6, 51.0], [24.2, 49.2]];
const J: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const prob = L(at(14, 'Kievan'));
  const dies = L(at(14, 'राजा'));
  const split = L(at(14, 'बँट'));
  const fight = L(at(14, 'बेटे'));
  const dozens = L(at(14, 'दर्जनों'));
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 32, lat: 54.5, zoom: 1.7 }, { at: split, lon: 32, lat: 54.5, zoom: 2.0, dur: 200 }]}
        overlay={
          <>
            <MapLabel lon={33} lat={55.2} text="Kievan Rus" start={6} exit={split - 10} size={140} color={RC.yellow} />
            <At lon={30.5} lat={52.6} start={dies} exit={split} over={1.2}><Glyph g="👑" size={200} /></At>
            {EYE_AT.map(([lo, la], i) => <MapEyes key={i} lon={lo} lat={la} start={fight + i * 3} size={58} angry look={i % 2 ? -1 : 1} />)}
            <BigNumberAt start={dozens} />
          </>
        }>
        <Fill id="kievan_rus_1000" color={RC.rusMustard} start={0} exit={split + 6} opacity={0.6} pulseAt={[prob]} />
        <Patchwork ids={PRIN} colors={PRIN_COL} start={split} stagger={3} opacity={0.62} spread={{ at: fight, px: 26, center: [32, 54.5] }} />
      </RMap>
      <TypeOn text="बाप मरा → ज़मीन बँटी → भाई लड़े" x={W * 0.5} y={H * 0.9} start={split} size={96} color={RC.white} />
      <YearTag text="1100+" start={dozens} />
      <Sfx at={split} file="paper_tear.wav" volume={0.6} />
      <Sfx at={fight} file="sting_hit.wav" volume={0.35} />
    </AbsoluteFill>
  );
};
const BigNumberAt: React.FC<{ start: number }> = ({ start }) => (
  <BigNumber x={W * 0.84} y={H * 0.32} to={12} start={start} dur={30} size={190} suffix="+" sub="छोटी-छोटी रियासतें" />
);

/* ───────────── K · 1237: the Mongols ───────────── */
const K: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const east = L(at(15, 'पूरब'));
  const tag = L(at(15, 'बारह'));
  const batu = L(at(15, 'Batu'));
  const fall = L(at(15, 'एक-एक'));
  const ryazan = L(at(15, 'Ryazan,'));
  const vlad = L(at(15, 'Vladimir.'));
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 34, lat: 54, zoom: 1.9 }, { at: 4, lon: 39, lat: 52, zoom: 1.2, dur: 110 }, { at: fall, lon: 39, lat: 55, zoom: 1.8, dur: 90 }]}
        overlay={
          <>
            <MapLabel lon={53} lat={47.6} text="Mongols" start={east + 30} exit={fall} size={150} color="#FFE2B8" />
            <Pin lon={39.7} lat={54.6} label="Ryazan" start={ryazan} side="l" />
            <Pin lon={40.4} lat={56.1} label="Vladimir" start={vlad} />
            <At lon={39.7} lat={54.6} start={ryazan + 8}><FireAt /></At>
            <At lon={40.4} lat={56.1} start={vlad + 8}><FireAt /></At>
            <At lon={53} lat={58} start={batu} exit={fall}><div style={{ textAlign: 'center' }}><RImg src="chars/batu_khan.png" w={620} h={700} label="Batu Khan" /><div style={{ ...hand(120, RC.yellow), marginTop: -60 }}>Batu Khan</div></div></At>
          </>
        }>
        <Fill id="golden_horde" color={RC.horde} start={east} mode="flood" origin={[75, 48]} dur={110} opacity={0.55} />
        <Patchwork ids={PRIN} colors={PRIN_COL} start={0} stagger={0} opacity={0.5} />
        <Route pts={[[66, 51], [56, 52], [48, 53], [42.5, 54.2], [39.7, 54.6]]} start={tag} dur={70} width={34} head={RC.stampRed} />
        <Route pts={[[39.7, 54.6], [40.6, 55.4], [40.4, 56.1]]} start={ryazan + 10} dur={40} width={26} />
      </RMap>
      <YearTag text="1237" start={tag} />
      <Sfx at={east} file="whoosh_big.wav" volume={0.55} />
      <Sfx at={tag} file="timpani_roll.wav" volume={0.4} />
      <Sfx at={ryazan} file="impact_boom.wav" volume={0.4} />
      <Sfx at={vlad} file="impact_boom.wav" volume={0.4} />
    </AbsoluteFill>
  );
};
const FireAt: React.FC = () => (
  <div style={{ position: 'relative', width: 0, height: 0 }}>
    <Smoke x={0} y={-40} size={70} start={0} />
    <Fire x={0} y={0} size={110} start={0} />
  </div>
);

/* ───────────── L · 1240: Kyiv falls — collapse #1 ───────────── */
const Lx: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const tag = L(at(16, 'बारह'));
  const end_ = L(at(16, 'Kievan'));
  const first = L(at(16, 'पहला'));
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_kyiv_burning_1240.png" from={0} sky="#4A2A2A" ground="#2A1E1E" push={0.02} />
      <Camera from={0} shake={[{ at: 8, amp: 14, dur: 20 }, { at: first, amp: 22, dur: 24 }]}>
        {[0.12, 0.3, 0.5, 0.7, 0.88].map((x, i) => <Fire key={i} x={W * x} y={H * (0.47 + (i % 2) * 0.03)} size={H * (0.12 + (i % 3) * 0.03)} start={6 + i * 5} seed={`k${i}`} />)}
        {[0.25, 0.6, 0.8].map((x, i) => <Smoke key={i} x={W * x} y={H * 0.4} size={H * 0.18} start={i * 6} />)}
        <TypeOn text="Kyiv · 1240" x={W * 0.5} y={H * 0.2} start={6} size={150} color={RC.white} />
        <TypeOn text="Kievan Rus ख़त्म" x={W * 0.5} y={H * 0.34} start={end_} size={130} color={RC.danger} />
        <Stamp text="COLLAPSE #1" x={W * 0.5} y={H * 0.6} start={first} size={210} rotate={-7} />
      </Camera>
      <YearTag text="1240" start={tag} />
      <Iris at={tag + 2} hold={30} />
      <Sfx at={8} file="impact_boom.wav" volume={0.5} />
      <Sfx at={first} file="stamp_slam.wav" volume={0.8} />
      <Sfx at={first} file="sub_drop.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── assembly ───────────── */
const SHOTS: [number, React.FC<{ base: number }>][] = [
  [C1_FROM, A],
  [P(6), B],
  [P(7), Cc],
  [P(8), D],
  [P(9), E],
  [P(10), FGH],
  [P(13), I],
  [P(14), J],
  [P(15), K],
  [P(16), Lx],
];

export const C01Rus: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map(([from, Comp], i) => {
      const to = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : C1_TO;
      return (
        <Sequence key={i} from={from - C1_FROM} durationInFrames={to - from}>
          <Comp base={from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
