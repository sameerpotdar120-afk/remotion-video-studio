import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, GreyStage, Iris, PopIn, RC, RImg, Stamp, TypeOn, YearTag, hand } from '../kit/core';
import { LoopWheel } from '../kit/devices';
import { Host } from '../kit/Host';
import { Char } from '../kit/cast';
import { BgPlate, Fit, Frame, Glyph, ShockLines } from '../kit/scene';
import { At, Fill, Flow, MapLabel, Patchwork, Pin, RMap, Route, Traveller } from '../map/RMap';

/**
 * CHAPTER 2 · MONGOLS (P17–P24): 1240 → 1480.
 * A  P17  map: the Horde over a patchwork Rus; tribute sacks fly to Sarai; "Tax + वफ़ादारी"
 * B  P18  the Khan's camp: a Rus prince bows for the yarlyk → grey stage "Permission slip"
 * C  P19  map: little Moscow collects the tax, a smirking money bag; Moscow grows
 * D  P20  1242: Swedes and German knights from the west; Nevsky; frozen lake; split screen: fights west, bows east
 * E  P21  1380 Kulikovo: first big win, a Moscow banner; "राज फिर भी ख़त्म नहीं"
 * F  P22  India detour: Afanasy Nikitin walks Tver → Volga → Caspian → Persia → Chaul (~1469)
 * G  P23  1480 + iris: the Ugra standoff, a clock spins, the Horde walks away — no battle
 * H  P24  Ivan III: Moscow the boss, double-headed eagle; loop: strong centre ready; a Tsar "?"
 */
export const C2_FROM = CHAPTERS[1].from;
export const C2_TO = CHAPTERS[2].card;
const P = (n: number) => para(n).f - 6;

const PRIN = ['prin_novgorod', 'prin_pskov', 'prin_polotsk', 'prin_smolensk', 'prin_rostov', 'prin_vladimir_suzdal', 'prin_murom', 'prin_ryazan', 'prin_chernigov', 'prin_kyiv', 'prin_pereyaslavl', 'prin_turov_pinsk', 'prin_volhynia', 'prin_galicia'];
const PRIN_COL = ['#D9B23A', '#C46A2E', '#6B9E3A', '#3E8E8A', '#9E4A7A', '#C8352B', '#7A6ABF', '#D98A2E', '#4A7AC8', '#E0C040', '#8AB04A', '#B85A5A', '#5A9E6A', '#C0803A'];
const SARAI: [number, number] = [46.2, 47.6];
const MOSCOW: [number, number] = [37.62, 55.75];
const NOVGOROD: [number, number] = [31.3, 58.5];

/* ───────────── A · under the Horde ───────────── */
const A: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const yrs = L(at(17, 'ढाई'));
  const notHere = L(at(17, 'Mongols', 1));
  const tax = L(at(17, 'Tax,'));
  const loyal = L(at(17, 'वफ़ादारी।'));
  const srcs: [number, number][] = [[31.6, 59.2], [40, 57], [30.3, 50.4], [32.6, 52], [28.6, 55.4], [40.4, 54.3]];
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 40, lat: 53, zoom: 1.35 }, { at: tax, lon: 40, lat: 52, zoom: 1.55, dur: 200 }]}
        overlay={
          <>
            <Pin lon={SARAI[0]} lat={SARAI[1]} label="Sarai" start={notHere} side="r" />
            <MapLabel lon={56} lat={49.5} text="Golden Horde" start={4} size={130} color="#FFE2B8" />
            {srcs.map((s, i) => (
              <Flow key={i} from={s} to={SARAI} start={tax + i * 6} count={5} every={22} life={60} arc={60}>
                <RImg src="props/tribute_sack.png" w={110} h={110} label="💰" />
              </Flow>
            ))}
            <At lon={46.2} lat={51.5} start={notHere} bob={5}><Glyph g="🏕️" size={110} /></At>
          </>
        }>
        <Patchwork ids={PRIN} colors={PRIN_COL} start={0} stagger={0} opacity={0.5} />
        <Fill id="golden_horde" color={RC.horde} start={0} dur={1} opacity={0.55} pulseAt={[tax, loyal]} />
      </RMap>
      <BigNumber x={W * 0.18} y={H * 0.8} to={250} start={yrs} dur={40} size={170} prefix="~" sub="साल" />
      <PopIn x={W * 0.74} y={H * 0.84} start={tax}><div style={{ ...hand(110, RC.yellow) }}>💰 Tax</div></PopIn>
      <PopIn x={W * 0.9} y={H * 0.84} start={loyal}><div style={{ ...hand(110, RC.white) }}>+ 🙇 वफ़ादारी</div></PopIn>
      <YearTag text="1240 – 1480" start={6} />
      <Sfx at={tax} file="coin.wav" volume={0.6} />
      <Sfx at={loyal} file="pop.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── B · the yarlyk ───────────── */
const B: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const bow = L(at(18, 'झुकना'));
  const letter = L(at(18, 'permission'));
  const yarlyk = L(at(18, 'yarlyk'));
  const think = L(at(18, 'सोचो,'));
  const slip = L(at(18, 'permission', 1));
  const stage = frame >= think;
  const bowK = ramp(frame, bow, 14, ease.out) * (1 - ramp(frame, letter + 30, 14, ease.out));
  return (
    <AbsoluteFill>
      {!stage ? (
        <AbsoluteFill>
          <BgPlate src="bg/bg_steppe_horde_camp.png" from={0} sky="#7FB6E6" ground="#B9C96A" />
          <Camera from={0}>
            <PopIn x={W * 0.7} y={H * 0.66} start={0}><RImg src="props/throne_gold.png" w={H * 0.55} h={H * 0.55} label="Khan's seat" /></PopIn>
            <Char who="batu_khan" x={W * 0.7} y={H * 0.9} height={H * 0.44} start={2} flip gestures={[[0, 'hips'], [letter, 'hold']]} moods={[[0, 'smug']]} />
            <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: `${W * 0.32}px ${H * 0.92}px`, transform: `rotate(${bowK * 22}deg)` }}>
              <Char who="rus_prince" x={W * 0.32} y={H * 0.92} height={H * 0.42} start={6} walk={[{ at: 0, x: W * 0.1 }, { at: 8, x: W * 0.32, dur: 60 }]}
                gestures={[[0, 'down'], [letter + 30, 'cheer']]} moods={[[0, 'worried'], [letter + 30, 'grin']]} />
            </div>
            <PopIn x={W * 0.51} y={H * 0.42} start={yarlyk} tilt={-6}><RImg src="props/yarlyk_scroll.png" w={H * 0.24} h={H * 0.36} label="yarlyk 📜" /></PopIn>
            <TypeOn text="yarlyk" x={W * 0.51} y={H * 0.17} start={yarlyk + 4} size={130} color={RC.blue} />
            <TypeOn text="झुको… 🙇" x={W * 0.3} y={H * 0.36} start={bow} size={90} exit={letter + 20} />
          </Camera>
        </AbsoluteFill>
      ) : (
        <GreyStage>
          <Camera from={think}>
            <PopIn x={W * 0.6} y={H * 0.45} start={think} tilt={-5}><RImg src="props/yarlyk_scroll.png" w={H * 0.36} h={H * 0.54} label="yarlyk 📜" /></PopIn>
            <TypeOn text="Permission slip" x={W * 0.6} y={H * 0.85} start={slip} size={150} color={RC.yellow} />
            <TypeOn text="अपने ही देश के लिए!" x={W * 0.8} y={H * 0.2} start={L(at(18, 'अपने'))} size={90} color={RC.danger} rotate={-4} />
          </Camera>
          <Host x={W * 0.17} y={H * 0.92} height={H * 0.6} offset={base} start={think} gestures={[[think, 'chin'], [slip, 'present']]} moods={[[think, 'smug'], [slip, 'grin']]} />
          <Sfx at={slip} file="pen_draw.wav" volume={0.5} />
        </GreyStage>
      )}
      <Sfx at={bow} file="whoosh_down.wav" volume={0.5} />
      <Sfx at={yarlyk} file="paper_slide.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── C · Moscow the tax collector ───────────── */
const Cc: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const city = L(at(19, 'Moscow.'));
  const smart = L(at(19, 'smart'));
  const tax = L(at(19, 'tax'));
  const power = L(at(19, 'ताक़त'));
  const grow = L(at(19, 'धीरे-धीरे'));
  const nb: [number, number][] = [[39.4, 57.2], [40.4, 56.1], [40.0, 54.4], [36.0, 56.9], [34.4, 54.6], [42.2, 55.5]];
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 42, lat: 52, zoom: 1.4 }, { at: 4, lon: 38.5, lat: 55.6, zoom: 3.4, dur: 90 }, { at: grow, lon: 39, lat: 56.5, zoom: 2.4, dur: 120 }]}
        overlay={
          <>
            <Pin lon={MOSCOW[0]} lat={MOSCOW[1]} label="Moscow" start={city} size={80} />
            <At lon={MOSCOW[0]} lat={MOSCOW[1]} dy={-170} start={smart} bob={6}><SmirkBag /></At>
            {nb.map((n, i) => (
              <Flow key={i} from={n} to={MOSCOW} start={tax + i * 5} count={6} every={18} life={44} arc={30}><Glyph g="🪙" size={70} /></Flow>
            ))}
            <Flow from={MOSCOW} to={[44, 52]} start={tax + 40} count={5} every={30} life={70} arc={40}><Glyph g="🪙" size={50} /></Flow>
            <MapLabel lon={44.5} lat={51.8} text="→ Horde" start={tax + 40} size={80} color="#FFE2B8" />
          </>
        }>
        <Patchwork ids={['prin_rostov', 'prin_vladimir_suzdal', 'prin_murom', 'prin_ryazan', 'prin_smolensk', 'prin_novgorod', 'prin_chernigov']} colors={['#9E4A7A', '#8A6ABF', '#7A6ABF', '#D98A2E', '#3E8E8A', '#D9B23A', '#4A7AC8']} start={0} stagger={0} opacity={0.42} />
        <Fill id="muscovy_1300" color={RC.rusRed} start={city} mode="pop" opacity={0.7} exit={grow + 30} />
        <Fill id="muscovy_1462" color={RC.rusRed} start={grow} mode="flood" origin={MOSCOW} dur={80} opacity={0.62} />
      </RMap>
      <TypeOn text="Tax collector 😏" x={W * 0.5} y={H * 0.12} start={tax} size={120} color={RC.yellow} exit={power} />
      <TypeOn text="पैसा 💰 + ताक़त 💪" x={W * 0.5} y={H * 0.12} start={power} size={120} color={RC.yellow} />
      <Sfx at={city} file="pop_low.wav" volume={0.6} />
      <Sfx at={tax} file="coin.wav" volume={0.6} />
      <Sfx at={grow} file="riser.wav" volume={0.4} />
    </AbsoluteFill>
  );
};
const SmirkBag: React.FC = () => (
  <div style={{ position: 'relative', width: 230, height: 230 }}>
    <RImg src="props/money_bag.png" w={230} h={230} label="💰" />
    <svg viewBox="0 0 100 100" style={{ position: 'absolute', left: 50, top: 100, width: 130, height: 130 }}>
      <circle cx={35} cy={30} r={6} fill="#1A1410" /><circle cx={65} cy={30} r={6} fill="#1A1410" />
      <path d="M30 18 L42 24 M70 18 L58 24" stroke="#1A1410" strokeWidth={5} strokeLinecap="round" />
      <path d="M32 52 Q55 66 72 46" stroke="#1A1410" strokeWidth={6} fill="none" strokeLinecap="round" />
    </svg>
  </div>
);

/* ───────────── D · Nevsky: fights the West, bows to the East ───────────── */
const D: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const west = L(at(20, 'पश्चिम'));
  const nevsky = L(at(20, 'Alexander'));
  const tag = L(at(20, 'बारह'));
  const lake = L(at(20, 'जमी'));
  const fun = L(at(20, 'मज़ेदार'));
  const bows = L(at(20, 'झुककर'));
  const both = L(at(20, 'दोनों'));
  const phase = frame < lake ? 0 : frame < fun ? 1 : 2;
  const crack = lake + 40;
  return (
    <AbsoluteFill>
      {phase === 0 && (
        <RMap view="ru_west" cam={[{ at: 0, lon: 30, lat: 58, zoom: 2.2 }, { at: west, lon: 27, lat: 58.4, zoom: 2.6, dur: 120 }]}
          overlay={
            <>
              <Pin lon={NOVGOROD[0]} lat={NOVGOROD[1]} label="Novgorod" start={2} />
              <MapLabel lon={20.5} lat={60.6} text="Swedes" start={west + 10} size={100} color="#CFE0FF" />
              <MapLabel lon={23.5} lat={56.2} text="German knights" start={west + 24} size={90} color="#F2F2F2" />
              <At lon={30.7} lat={57.6} start={nevsky} over={1.2}><div style={{ textAlign: 'center' }}><RImg src="chars/alexander_nevsky.png" w={240} h={290} label="Nevsky" /><div style={hand(80, RC.blue)}>Alexander Nevsky</div></div></At>
              <Pin lon={27.7} lat={58.6} label="Lake Peipus" start={tag} side="l" />
            </>
          }>
          <Fill id="novgorod_rep" color="#C46A2E" start={0} dur={1} opacity={0.45} />
          <Route pts={[[18, 60.5], [24, 60.2], [29.5, 59.9]]} start={west + 10} dur={50} width={24} head={RC.sweden} />
          <Route pts={[[21.5, 56.6], [25.5, 57.8], [27.6, 58.5]]} start={west + 24} dur={50} width={24} head="#333" />
          <Route pts={[[31.3, 58.4], [29.4, 58.5], [28.0, 58.6]]} start={nevsky + 30} dur={40} width={30} />
        </RMap>
      )}
      {phase === 1 && (
        <AbsoluteFill>
          <BgPlate src="bg/bg_frozen_lake_1242.png" from={lake} sky="#C9D3DA" ground="#E3EAEE" />
          <Camera from={lake} shake={[{ at: crack, amp: 16, dur: 20 }]}>
            {[0, 1, 2].map((i) => (
              <Char key={i} who="teutonic_knight" x={W * (0.55 + i * 0.12)} y={H * 0.9 + (frame > crack ? ramp(frame, crack + i * 6, 30, ease.in) * H * 0.5 : 0)} height={H * 0.36} start={lake + i * 5} flip seed={`tk${i}`}
                walk={[{ at: lake, x: W * (0.75 + i * 0.12) }, { at: lake + 4, x: W * (0.55 + i * 0.12), dur: 40 }]} moods={[[lake, 'angry'], [crack, 'shocked']]} gestures={[[crack, 'handsHead']]} />
            ))}
            <Char who="alexander_nevsky" x={W * 0.2} y={H * 0.92} height={H * 0.44} start={lake} gestures={[[lake, 'point'], [crack + 20, 'cheer']]} moods={[[lake, 'angry'], [crack + 20, 'grin']]} />
            {frame > crack && <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
              {[0, 1, 2, 3, 4].map((i) => <polyline key={i} points={`${W * 0.66},${H * 0.92} ${W * (0.5 + i * 0.07)},${H * (0.86 + (i % 2) * 0.05)} ${W * (0.42 + i * 0.12)},${H * 0.98}`} fill="none" stroke="#2A3A44" strokeWidth={8} opacity={ramp(frame, crack, 6)} />)}
            </svg>}
            <TypeOn text="1242 · बर्फ़ पर जंग" x={W * 0.5} y={H * 0.14} start={lake + 4} size={110} />
            <Stamp text="LEGEND?" x={W * 0.82} y={H * 0.3} start={crack + 30} size={80} sub="बर्फ़ टूटने वाला हिस्सा" />
          </Camera>
          <Sfx at={crack} file="paper_tear.wav" volume={0.7} />
          <Sfx at={crack + 4} file="impact_boom.wav" volume={0.4} />
        </AbsoluteFill>
      )}
      {phase === 2 && (
        <GreyStage>
          <div style={{ position: 'absolute', left: W / 2 - 6, top: H * 0.08, width: 12, height: H * 0.84, background: '#333', borderRadius: 6 }} />
          <TypeOn text="पश्चिम से: लड़ो ⚔️" x={W * 0.25} y={H * 0.14} start={fun} size={100} color={RC.green} />
          <TypeOn text="पूरब के आगे: झुको 🙇" x={W * 0.75} y={H * 0.14} start={bows} size={100} color={RC.danger} />
          <Char who="alexander_nevsky" x={W * 0.24} y={H * 0.9} height={H * 0.5} start={fun} gestures={[[fun, 'fist']]} moods={[[fun, 'angry']]} />
          <Char who="teutonic_knight" x={W * 0.4} y={H * 0.9} height={H * 0.42} start={fun + 6} flip moods={[[fun, 'worried']]} gestures={[[fun, 'handsHead']]} />
          <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: `${W * 0.62}px ${H * 0.9}px`, transform: `rotate(${ramp(frame, bows + 6, 12, ease.out) * 20}deg)` }}>
            <Char who="alexander_nevsky" x={W * 0.62} y={H * 0.9} height={H * 0.5} start={bows} gestures={[[bows, 'hold']]} moods={[[bows, 'worried']]} />
          </div>
          <Char who="batu_khan" x={W * 0.84} y={H * 0.9} height={H * 0.5} start={bows} flip gestures={[[bows, 'hips']]} moods={[[bows, 'smug']]} />
          <PopIn x={W * 0.72} y={H * 0.48} start={bows + 20}><Glyph g="💰" size={130} /></PopIn>
          <TypeOn text="दोनों से एक साथ नहीं लड़ सकते" x={W * 0.5} y={H * 0.94} start={both} size={90} color={RC.yellow} />
          <Sfx at={fun} file="pluck_up.wav" volume={0.5} />
          <Sfx at={bows + 20} file="coin.wav" volume={0.5} />
        </GreyStage>
      )}
      {phase === 0 && <YearTag text="1242" start={tag} />}
      <Sfx at={west + 10} file="whoosh_fast.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

/* ───────────── E · 1380 Kulikovo ───────────── */
const E: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(21, 'तेरह'));
  const win = L(at(21, 'हराया।'));
  const but = L(at(21, 'पर'));
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_kulikovo_field_1380.png" from={0} sky="#C9D8DE" ground="#9AA05A" />
      <Camera from={0} shake={[{ at: 30, amp: 10, dur: 60 }]}>
        {[0, 1, 2].map((i) => (
          <Char key={`m${i}`} who="moscow_soldier" x={W * (0.14 + i * 0.1)} y={H * (0.92 - i * 0.02)} height={H * 0.36} start={4 + i * 4} seed={`ms${i}`}
            walk={[{ at: 0, x: W * (0.04 + i * 0.1) }, { at: 10, x: W * (0.2 + i * 0.1), dur: 60 }]} gestures={[[0, 'fist'], [win, 'cheer']]} moods={[[0, 'angry'], [win, 'grin']]} hopAt={[win + 4, win + 30]} />
        ))}
        {[0, 1, 2].map((i) => (
          <Char key={`t${i}`} who="mongol_warrior" x={W * (0.7 + i * 0.1)} y={H * (0.92 - i * 0.02)} height={H * 0.36} start={4 + i * 4} flip seed={`mw${i}`}
            walk={[{ at: 0, x: W * (0.8 + i * 0.1) }, { at: 10, x: W * (0.64 + i * 0.1), dur: 60 }, { at: win, x: W * (1.1 + i * 0.1), dur: 50 }]} gestures={[[0, 'fist'], [win - 10, 'handsHead']]} moods={[[0, 'angry'], [win - 10, 'shocked']]} />
        ))}
        <ShockLines x={W * 0.5} y={H * 0.62} r={H * 0.3} start={30} dur={60} />
        <PopIn x={W * 0.32} y={H * 0.36} start={win}>
          <svg width={260} height={360} viewBox="0 0 26 36"><rect x={2} y={0} width={1.4} height={36} fill="#6B4A2E" /><path d={`M3.4 2 L24 ${3 + Math.sin(frame / 6)} L24 ${15 + Math.sin(frame / 6)} L3.4 14 Z`} fill="#C8352B" stroke="#7A1E1E" strokeWidth={0.4} /><text x={13} y={11} fontSize={7} textAnchor="middle" fill="#FFD84A">☦</text></svg>
        </PopIn>
        <TypeOn text="Kulikovo · पहली बड़ी जीत" x={W * 0.5} y={H * 0.14} start={6} size={120} color={RC.yellow} />
        <TypeOn text="पर Mongol राज अभी बाक़ी…" x={W * 0.6} y={H * 0.26} start={but} size={90} color={RC.danger} />
      </Camera>
      <YearTag text="1380" start={tag} />
      <Sfx at={30} file="musket_volley.wav" volume={0.25} />
      <Sfx at={win} file="sting_crown.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── F · India detour: Afanasy Nikitin ───────────── */
const NIKITIN: [number, number][] = [[35.9, 56.86], [40, 57.6], [44, 56.3], [49.1, 55.8], [47.6, 51], [48.0, 46.35], [48.3, 42.06], [49.6, 37.3], [52.5, 34.0], [54.4, 31.9], [56.45, 27.1], [62, 23.8], [68, 20.6], [72.93, 18.55]];
const F: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const india = L(at(22, 'भारत'));
  const tver = L(at(22, 'Tver'));
  const name = L(at(22, 'Afanasy'));
  const walk = L(at(22, 'घूमते-घूमते'));
  const yr = L(at(22, 'क़रीब'));
  const book = L(at(22, 'किताब'));
  const old = L(at(22, 'यानी'));
  return (
    <AbsoluteFill>
      <RMap view="india_route" cam={[{ at: 0, lon: 50, lat: 42, zoom: 1.0 }, { at: tver, lon: 40, lat: 52, zoom: 1.6, dur: 60 }, { at: walk, lon: 58, lat: 32, zoom: 1.15, dur: 260 }]}
        overlay={
          <>
            <Pin lon={35.9} lat={56.86} label="Tver" start={tver} side="l" />
            <Pin lon={72.93} lat={18.55} label="Chaul (भारत)" start={walk + 80} side="l" />
            <Traveller pts={NIKITIN} start={walk} dur={240}>
              {(dir) => <div style={{ transform: `scaleX(${dir < 0 ? -1 : 1})` }}><Char who="afanasy_nikitin" x={0} y={0} height={260} start={0} walk={[{ at: 0, x: 0 }, { at: 1, x: 0.5, dur: 600 }]} /></div>}
            </Traveller>
            <MapLabel lon={79} lat={22} text="भारत 🇮🇳" start={india} size={130} color={RC.yellow} />
            <MapLabel lon={51} lat={41.5} text="Caspian" start={walk + 60} size={70} color="#CFE7FF" />
            <MapLabel lon={54} lat={30} text="Persia" start={walk + 100} size={80} color="#FFF" />
          </>
        }>
        <Route pts={NIKITIN} start={walk} dur={240} width={14} dotted color="#FFE9A8" head={false} />
        <Fill id="india" color="#E8892B" start={india} opacity={0.3} mode="fade" />
      </RMap>
      <TypeOn text="Afanasy Nikitin" x={W * 0.5} y={H * 0.1} start={name} size={130} color={RC.blue} />
      <YearTag text="~1469" start={yr} />
      <Frame x={W * 0.84} y={H * 0.72} w={W * 0.22} h={W * 0.16} start={book} tilt={4}>
        <div style={{ width: '100%', height: '100%', background: '#7A3E1E', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...hand(64, '#F4E3C1'), whiteSpace: 'normal' }}>
          Journey Beyond<br />Three Seas 📖
        </div>
      </Frame>
      <TypeOn text="Russia 🤝 भारत: पुरानी कहानी" x={W * 0.42} y={H * 0.9} start={old} size={100} color={RC.yellow} />
      <Sfx at={walk} file="whoosh_soft.wav" volume={0.5} />
      <Sfx at={book} file="paper_slide.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── G · 1480 the Ugra standoff ───────────── */
const G: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(23, 'चौदह'));
  const stop = L(at(23, 'Moscow'));
  const khan = L(at(23, 'Khan'));
  const ugra = L(at(23, 'Ugra'));
  const weeks = L(at(23, 'हफ़्तों'));
  const then = L(at(23, 'फिर?'));
  const back = L(at(23, 'वापस'));
  const noBattle = L(at(23, 'कोई'));
  const endRule = L(at(23, 'ढाई'));
  const spin = ramp(frame, weeks, 80, ease.inOut) * 720;
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_ugra_river_1480.png" from={0} sky="#B6C9D6" ground="#8A8E52" />
      <div style={{ position: 'absolute', left: 0, top: H * 0.5, width: W, height: H * 0.1, background: 'linear-gradient(#4F7FA8, #6E9CC2)', opacity: 0.0 }} />
      <Camera from={0}>
        {[0, 1, 2, 3].map((i) => (
          <Char key={`t${i}`} who="mongol_warrior" x={W * (0.3 + i * 0.13)} y={H * 0.56} height={H * 0.22} start={khan + i * 4} flip seed={`ug${i}`}
            walk={[{ at: 0, x: W * (0.3 + i * 0.13) }, { at: back, x: W * (1.3 + i * 0.13), dur: 120 }]} moods={[[0, 'angry'], [weeks + 40, 'worried'], [back, 'sad']]} gestures={[[0, 'fist'], [weeks + 40, 'chin']]} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <Char key={`m${i}`} who="moscow_soldier" x={W * (0.24 + i * 0.16)} y={H * 0.97} height={H * 0.36} start={stop + i * 4} seed={`um${i}`}
            moods={[[0, 'angry'], [weeks + 40, 'worried'], [back + 30, 'grin']]} gestures={[[0, 'fist'], [back + 30, 'cheer']]} hopAt={[back + 40]} />
        ))}
        <PopIn x={W * 0.5} y={H * 0.3} start={weeks} exit={then}>
          <svg width={260} height={260} viewBox="0 0 100 100"><circle cx={50} cy={50} r={44} fill="#FBF8F1" stroke="#333" strokeWidth={6} /><line x1={50} y1={50} x2={50} y2={18} stroke="#333" strokeWidth={6} strokeLinecap="round" transform={`rotate(${spin} 50 50)`} /><line x1={50} y1={50} x2={72} y2={50} stroke="#C8352B" strokeWidth={5} strokeLinecap="round" transform={`rotate(${spin / 12} 50 50)`} /></svg>
        </PopIn>
        <TypeOn text="हफ़्तों तक… घूरते रहे 👀" x={W * 0.5} y={H * 0.12} start={weeks} size={100} exit={then} />
        <TypeOn text="Ugra नदी" x={W * 0.84} y={H * 0.48} start={ugra} size={80} color="#CFE7FF" />
        <TypeOn text="कोई लड़ाई नहीं हुई" x={W * 0.5} y={H * 0.16} start={noBattle} size={130} color={RC.yellow} />
        <Stamp text="250 साल का राज ख़त्म" x={W * 0.5} y={H * 0.36} start={endRule} size={100} color={RC.stampGreen} rotate={-5} />
      </Camera>
      <YearTag text="1480" start={tag} />
      <Iris at={tag + 2} hold={40} />
      <Sfx at={weeks} file="tick.wav" volume={0.5} />
      <Sfx at={back} file="whoosh_soft.wav" volume={0.5} />
      <Sfx at={noBattle} file="pluck_down.wav" volume={0.5} />
      <Sfx at={endRule} file="stamp_slam.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── H · Ivan III — Moscow is the boss ───────────── */
const Hh: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const ivan = L(at(24, 'Ivan'));
  const joined = L(at(24, 'जोड़-जोड़कर'));
  const chaosEnd = L(at(24, 'Chaos'));
  const centre = L(at(24, 'केंद्र'));
  const tsar = L(at(24, 'Tsar'));
  return (
    <GreyStage>
      <Camera from={0}>
        <Char who="ivan_iii" x={W * 0.42} y={H * 0.9} height={H * 0.52} start={ivan} gestures={[[ivan, 'hips'], [joined, 'present'], [tsar, 'chin']]} moods={[[ivan, 'smug'], [tsar, 'neutral']]} />
        <TypeOn text="Ivan III" x={W * 0.42} y={H * 0.3} start={ivan + 4} size={120} color={RC.blue} />
        <PopIn x={W * 0.42} y={H * 0.14} start={ivan + 20}><RImg src="props/double_headed_eagle.png" w={H * 0.2} h={H * 0.2} label="🦅🦅" /></PopIn>
        <Frame x={W * 0.75} y={H * 0.42} w={W * 0.36} h={W * 0.36 * 0.56} start={joined} tilt={3} exit={chaosEnd - 4}>
          <Fit w={W * 0.36} h={W * 0.36 * 0.56}>
            <RMap view="ru_west" cam={[{ at: 0, lon: 42, lat: 59, zoom: 1.8 }]} drift={0.02} from={joined}>
              <Fill id="muscovy_1462" color={RC.rusRed} start={0} dur={1} opacity={0.6} exit={joined + 40} />
              <Fill id="muscovy_1505" color={RC.rusRed} start={joined + 20} mode="flood" origin={MOSCOW} dur={70} opacity={0.62} />
            </RMap>
          </Fit>
        </Frame>
        <TypeOn text="Moscow अब बॉस 😎" x={W * 0.75} y={H * 0.74} start={joined + 30} size={110} color={RC.yellow} exit={chaosEnd - 4} />
        <LoopWheel x={W * 0.78} y={H * 0.5} r={H * 0.18} start={chaosEnd} small steps={[[chaosEnd + 2, 0], [centre, 1]]} exit={tsar - 4} />
        <PopIn x={W * 0.75} y={H * 0.45} start={tsar}><div style={{ position: 'relative' }}><RImg src="props/cap_of_monomakh.png" w={H * 0.3} h={H * 0.3} label="👑" /><div style={{ position: 'absolute', right: -40, top: -40, ...hand(180, RC.yellow) }}>?</div></div></PopIn>
        <TypeOn text="अब बस एक Tsar चाहिए…" x={W * 0.72} y={H * 0.8} start={tsar + 6} size={100} />
      </Camera>
      <Host x={W * 0.14} y={H * 0.92} height={H * 0.56} offset={base} start={0} gestures={[[0, 'present'], [chaosEnd, 'fingerUp'], [tsar, 'chin']]} moods={[[0, 'smile'], [tsar, 'smug']]} />
      <Sfx at={ivan} file="sting_crown.wav" volume={0.45} />
      <Sfx at={joined + 20} file="riser.wav" volume={0.35} />
      <Sfx at={tsar} file="pop.wav" volume={0.5} />
    </GreyStage>
  );
};

const SHOTS: [number, React.FC<{ base: number }>][] = [
  [C2_FROM, A],
  [P(18), B],
  [P(19), Cc],
  [P(20), D],
  [P(21), E],
  [P(22), F],
  [P(23), G],
  [P(24), Hh],
];

export const C02Mongols: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map(([from, Comp], i) => {
      const to = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : C2_TO;
      return (
        <Sequence key={i} from={from - C2_FROM} durationInFrames={to - from}>
          <Comp base={from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
