import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, Card, Flash, GreyStage, Iris, PopIn, RC, RImg, Stamp, TypeOn, YearTag, hand } from '../kit/core';
import { LoopWheel, RedX } from '../kit/devices';
import { Host } from '../kit/Host';
import { Char } from '../kit/cast';
import { BgPlate, Fire, Glyph, Smoke } from '../kit/scene';
import { SputnikOrbit } from '../three/Sputnik';
import { At, Fill, MapLabel, Patchwork, Pin, RMap, Route, terr } from '../map/RMap';

/**
 * CHAPTER 10 · TODAY (P85–P95): 1953 → 2022.
 * A  P85  1953; the Cold War; Sputnik orbits in 3D (beep-beep); America panics; 12 April 1961 Gagarin — 108 minutes
 * B  P86  1962 submarine: two hands over LAUNCH, the third man says no — Vasily Arkhipov
 * C  P87  India insert: 1971 friendship treaty; 1984 Rakesh Sharma — "सारे जहाँ से अच्छा"
 * D  P88  empty shelves, queues; Gorbachev: Glasnost · Perestroika
 * E  P89  Chernobyl (truth hidden) → the Berlin Wall falls; the lid comes off
 * F  P90  25 December 1991 + iris: the red map cracks into 15 countries — COLLAPSE #4
 * G  P91  the 1990s: inflation, banknotes fly; 17 August 1998 DEFAULT
 * H  P92  31 December 1999: Yeltsin resigns on TV → Putin; the loop pointer arrives at "strong man"
 * I  P93  order returns: salary, oil — free media and opposition shrink
 * J  P94  2014 Crimea flips (the same Crimea Catherine took); 2020: 2024 struck out → 2036
 * K  P95  24 February 2022 + iris: arrows into Ukraine
 */
export const C10_FROM = CHAPTERS[9].from;
export const C10_TO = para(96).f - 6;
const P = (n: number) => para(n).f - 6;
const REP = ['rep_russia', 'rep_ukraine', 'rep_belarus', 'rep_moldova', 'rep_lithuania', 'rep_latvia', 'rep_estonia', 'rep_georgia', 'rep_armenia', 'rep_azerbaijan', 'rep_kazakhstan', 'rep_uzbekistan', 'rep_turkmenistan', 'rep_kyrgyzstan', 'rep_tajikistan'];
const REP_COL = ['#C8352B', '#E0B23A', '#3E8E5A', '#9E4A7A', '#D98A2E', '#7A3E5A', '#3E7BD8', '#B85A5A', '#E07A3A', '#4AA0A0', '#4FA3D9', '#5A9E3A', '#7A9E3A', '#C04A4A', '#A07AC0'];

/* ───────────── A · space race ───────────── */
const A: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(85, 'उन्नीस'));
  const cold = L(at(85, 'Cold'));
  const sputnik = L(at(85, 'Sputnik,'));
  const beep = L(at(85, 'beep-beep'));
  const panic = L(at(85, 'खलबली'));
  const something = L(at(85, 'कुछ'));
  const april = L(at(85, 'बारह'));
  const gagarin = L(at(85, 'Yuri'));
  const minutes = L(at(85, 'एक', 1));
  const phase = frame < L(at(85, 'उन्नीस', 1)) - 10 ? 0 : frame < something - 10 ? 1 : 2;
  const lift = ramp(frame, april - 20, 120, ease.in);
  return (
    <AbsoluteFill>
      {phase === 0 && (
        <GreyStage>
          <Camera from={0}>
            <Card src="cards/card_stalin.png" x={W * 0.32} y={H * 0.46} w={W * 0.16} start={2} name="Stalin" nameColor={RC.danger} ribbonAt={tag + 20} grey={tag + 20} />
            <PopIn x={W * 0.7} y={H * 0.46} start={cold}><div style={{ ...hand(160, '#333'), textShadow: 'none' }}>🇺🇸 ⚔️ ☭</div></PopIn>
            <TypeOn text="Cold War 🥶 + Space race 🚀" x={W * 0.66} y={H * 0.74} start={cold} size={100} color={RC.blue} />
          </Camera>
          <YearTag text="1953" start={tag} />
        </GreyStage>
      )}
      {phase === 1 && (
        <AbsoluteFill>
          <SputnikOrbit start={0} />
          <TypeOn text="Sputnik · 1957" x={W * 0.5} y={H * 0.12} start={sputnik} size={140} color={RC.white} />
          <TypeOn text="beep… beep… 📡" x={W * 0.72} y={H * 0.3} start={beep} size={100} color={RC.yellow} />
          <PopIn x={W * 0.2} y={H * 0.76} start={panic}><div style={{ ...hand(100, RC.white), textAlign: 'center' }}>🇺🇸 😱<br />खलबली!</div></PopIn>
          {[0, 1, 2, 3].map((i) => <Sfx key={i} at={beep + i * 36} file="sputnik_beep.wav" volume={0.35} />)}
        </AbsoluteFill>
      )}
      {phase === 2 && (
        <AbsoluteFill style={{ background: 'linear-gradient(#0E1A3A, #5E7FB0 60%, #C9A27A 100%)' }}>
          <Camera from={something} shake={[{ at: april - 20, amp: 14, dur: 100 }]}>
            <div style={{ position: 'absolute', left: W * 0.3 - 130, top: H * 0.2 - lift * H * 1.1 }}>
              <RImg src="props/rocket_vostok.png" w={260} h={760} label="🚀 Vostok" />
              {frame >= april - 20 && <><Smoke x={130} y={760} size={180} start={april - 20} color="230,230,230" wind={0.2} /><Fire x={130} y={820} size={200} start={april - 20} grow={8} seed="rk" /></>}
            </div>
            <Card src="cards/card_gagarin.png" x={W * 0.66} y={H * 0.46} w={W * 0.21} start={gagarin - 6} name="Yuri Gagarin" />
            <TypeOn text="12 April 1961" x={W * 0.66} y={H * 0.12} start={april} size={110} color={RC.white} />
            <TypeOn text="108 minutes · पहला इंसान 🌍" x={W * 0.66} y={H * 0.86} start={minutes} size={96} color={RC.yellow} />
          </Camera>
          <Iris at={april} hold={30} cx={W * 0.66} cy={H * 0.12} />
          <Sfx at={april - 20} file="rocket.wav" volume={0.6} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ───────────── B · Arkhipov ───────────── */
const B: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const nuclear = L(at(86, 'nuclear'));
  const cuba = L(at(86, 'Cuba'));
  const three = L(at(86, 'तीनों'));
  const two = L(at(86, 'दो'));
  const no = L(at(86, 'मना'));
  const saved = L(at(86, 'शायद'));
  const red = 0.5 + 0.5 * Math.sin(frame / 8);
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_submarine_1962.png" from={0} sky="#3A1414" ground="#2A1010" tint={`rgba(255,40,40,${0.18 + red * 0.12})`} />
      <Camera from={0} drift={0.014}>
        <PopIn x={W * 0.5} y={H * 0.62} start={three - 20}>
          <div style={{ width: 360, height: 220, background: '#2A2A2A', borderRadius: 20, border: '8px solid #555', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, #FF4040, #8A0000)`, boxShadow: `0 0 ${40 * red}px #FF2020` }} />
            <div style={{ ...hand(50, '#FFDADA'), textShadow: 'none' }}>LAUNCH</div>
          </div>
        </PopIn>
        <Char who="soviet_navy_officer" seed="o1" x={W * 0.22} y={H * 0.97} height={H * 0.48} start={cuba} gestures={[[0, 'down'], [two, 'point']]} moods={[[0, 'worried'], [two, 'angry']]} shake={[two, no]} />
        <Char who="soviet_navy_officer" seed="o2" tint="#3A5A8A" x={W * 0.38} y={H * 0.97} height={H * 0.46} start={cuba + 6} gestures={[[0, 'down'], [two + 10, 'point']]} moods={[[0, 'worried'], [two + 10, 'angry']]} shake={[two, no]} />
        <Char who="soviet_navy_officer" seed="arkhipov" tint="#5A6A3A" x={W * 0.78} y={H * 0.97} height={H * 0.5} start={cuba + 12} flip gestures={[[0, 'down'], [no, 'hips']]} moods={[[0, 'neutral'], [no, 'angry'], [saved, 'smile']]} />
        <TypeOn text="1962 · Cuba के पास 🌊" x={W * 0.5} y={H * 0.1} start={cuba} size={100} color={RC.white} exit={three} />
        <TypeOn text="3 अफ़सर · 3 हाँ ज़रूरी" x={W * 0.5} y={H * 0.1} start={three} size={100} color={RC.yellow} exit={no} />
        <TypeOn text="✔ ✔" x={W * 0.3} y={H * 0.36} start={two} size={130} color={RC.green} />
        <TypeOn text="✘ NO" x={W * 0.78} y={H * 0.36} start={no} size={150} color={RC.danger} />
        <TypeOn text="Vasily Arkhipov" x={W * 0.5} y={H * 0.1} start={no + 10} size={130} color={RC.blue} />
        <TypeOn text="एक “ना” ने दुनिया बचा ली 🌍" x={W * 0.5} y={H * 0.22} start={saved} size={100} color={RC.yellow} />
      </Camera>
      <Sfx at={nuclear} file="heartbeat_low.wav" volume={0.6} />
      <Sfx at={no} file="stamp_slam.wav" volume={0.6} />
      <Sfx at={saved} file="sting_shimmer.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── C · India–USSR ───────────── */
const Cc: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const close = L(at(87, 'क़रीब'));
  const aug = L(at(87, 'नौ'));
  const treaty = L(at(87, 'संधि'));
  const yr84 = L(at(87, 'उन्नीस', 1));
  const rakesh = L(at(87, 'Rakesh'));
  const indira = L(at(87, 'Indira'));
  const quote = L(at(87, 'सारे'));
  const stage = frame >= yr84 - 10;
  return (
    <AbsoluteFill>
      {!stage ? (
        <RMap view="eurasia" cam={[{ at: 0, lon: 75, lat: 40, zoom: 1.4 }]}
          overlay={<><At lon={78} lat={38} start={treaty} over={1.3}><Glyph g="🤝" size={200} /></At><MapLabel lon={78} lat={22} text="भारत 🇮🇳" start={close} size={120} color={RC.yellow} /><MapLabel lon={80} lat={58} text="USSR" start={close} size={120} /></>}>
          <Fill id="ussr_1945" color={RC.sovietRed} start={0} dur={1} opacity={0.55} />
          <Fill id="india" color="#E8892B" start={close} opacity={0.55} />
        </RMap>
      ) : (
        <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 40%, #1E2A55, #04060E)' }}>
          <Camera from={yr84}>
            <Card src="cards/card_rakesh_sharma.png" x={W * 0.38} y={H * 0.46} w={W * 0.21} start={rakesh - 10} name="Rakesh Sharma" />
            <TypeOn text="पहले भारतीय अंतरिक्ष यात्री 🚀" x={W * 0.38} y={H * 0.1} start={rakesh} size={96} color={RC.white} />
            <TypeOn text="Indira Gandhi: “ऊपर से भारत कैसा दिखता है?”" x={W * 0.68} y={H * 0.72} start={indira} size={76} color="#DDD" />
            <TypeOn text="“सारे जहाँ से अच्छा” 🇮🇳" x={W * 0.68} y={H * 0.84} start={quote} size={130} color={RC.yellow} />
          </Camera>
        </AbsoluteFill>
      )}
      <YearTag text={stage ? '1984' : '9 August 1971'} start={stage ? yr84 : aug} />
      <Sfx at={treaty} file="pop_low.wav" volume={0.6} />
      <Sfx at={quote} file="sting_shimmer.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── D · hollow economy, Gorbachev ───────────── */
const D: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const hollow = L(at(88, 'खोखला'));
  const shops = L(at(88, 'दुकानों'));
  const gorb = L(at(88, 'Mikhail'));
  const glas = L(at(88, 'खुलापन,'));
  const pere = L(at(88, 'बदलाव।'));
  return (
    <AbsoluteFill>
      <BgPlate src="bg/bg_soviet_shop_1985.png" from={0} sky="#B8C8B4" ground="#8A8A7A" />
      <Camera from={0}>
        {[0, 1, 2, 3, 4].map((i) => <Char key={i} who="soviet_citizen_1980s" seed={`q${i}`} x={W * (0.08 + i * 0.09)} y={H * 0.97} height={H * 0.36} start={shops + i * 4} moods={[[0, 'sad']]} gestures={[[0, 'down']]} />)}
        <TypeOn text="दुकानें ख़ाली 🛒✗ · economy ठप" x={W * 0.3} y={H * 0.14} start={shops} size={90} color={RC.white} />
        <Card src="cards/card_gorbachev.png" x={W * 0.74} y={H * 0.44} w={W * 0.19} start={gorb - 10} name="Gorbachev" />
        <Stamp text="Glasnost · खुलापन" x={W * 0.74} y={H * 0.12} start={glas} size={80} color={RC.stampGreen} rotate={-4} />
        <Stamp text="Perestroika · बदलाव" x={W * 0.74} y={H * 0.84} start={pere} size={80} color={RC.stampGreen} rotate={4} />
      </Camera>
      <YearTag text="1985" start={gorb} />
      <Sfx at={glas} file="stamp_slam.wav" volume={0.45} />
      <Sfx at={pere} file="stamp_slam.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

/* ───────────── E · Chernobyl, the Wall ───────────── */
const E: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(89, 'उन्नीस'));
  const cher = L(at(89, 'Chernobyl'));
  const hide = L(at(89, 'छुपाने'));
  const wall = L(at(89, 'Berlin'));
  const fell = L(at(89, 'गिर'));
  const lid = L(at(89, 'ढक्कन'));
  const phase = frame >= wall - 10;
  const fall = ramp(frame, fell, 40, ease.in);
  return (
    <AbsoluteFill>
      {!phase ? (
        <AbsoluteFill>
          <BgPlate src="bg/bg_chernobyl_1986.png" from={0} sky="#14182A" ground="#2A2A2A" />
          <Camera from={0}>
            <Smoke x={W * 0.5} y={H * 0.5} size={H * 0.3} start={cher} color="90,110,110" />
            <TypeOn text="Chernobyl ☢️" x={W * 0.5} y={H * 0.14} start={cher} size={160} color="#9CFF9C" />
            <TypeOn text="सच छुपाया 🤫" x={W * 0.5} y={H * 0.84} start={hide} size={120} color={RC.danger} />
          </Camera>
          <YearTag text="26 April 1986" start={tag} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <BgPlate src="bg/bg_berlin_wall_1989.png" from={wall - 10} sky="#14182A" ground="#3A3A3A" />
          <Camera from={wall - 10} shake={[{ at: fell + 20, amp: 24, dur: 30 }]}>
            <div style={{ position: 'absolute', left: W * 0.2, top: H * 0.36, width: W * 0.6, height: H * 0.44, transformOrigin: '50% 100%', transform: `rotateX(${fall * 80}deg)`, opacity: 1 - fall * 0.6,
              background: 'repeating-linear-gradient(90deg, #9A9A96 0 300px, #7E7E7A 300px 310px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ ...hand(110, '#C83A3A'), padding: 30, textShadow: 'none' }}>🎨 ★ ☮</div>
            </div>
            {frame >= fell + 20 && <Smoke x={W * 0.5} y={H * 0.8} size={H * 0.24} start={fell + 20} color="180,180,180" />}
            <TypeOn text="Berlin Wall गिरी 🧱" x={W * 0.5} y={H * 0.14} start={fell} size={130} color={RC.white} />
            <TypeOn text="ढक्कन खुला → सब बाहर 🫙" x={W * 0.5} y={H * 0.86} start={lid} size={100} color={RC.yellow} />
          </Camera>
          <YearTag text="1989" start={wall - 10} />
          <Sfx at={fell + 20} file="crumble.wav" volume={0.7} />
        </AbsoluteFill>
      )}
      <Sfx at={cher} file="sub_drop.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── F · 1991 — fifteen countries ───────────── */
const F: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(90, 'पच्चीस'));
  const resign = L(at(90, 'इस्तीफ़ा'));
  const ended = L(at(90, 'ख़त्म,'));
  const fifteen = L(at(90, 'पंद्रह'));
  const fourth = L(at(90, 'चौथा'));
  const split = frame >= ended - 10;
  return (
    <AbsoluteFill>
      <RMap view="eurasia" cam={[{ at: 0, lon: 72, lat: 54, zoom: 1.35 }, { at: ended, lon: 65, lat: 52, zoom: 1.25, dur: 120 }]}
        overlay={<>{split && REP.map((id, i) => <NumberAt key={id} id={id} n={i + 1} start={fifteen + i * 4} />)}<At lon={40} lat={62} start={resign}><div style={{ ...hand(80, RC.white) }}>Gorbachev: इस्तीफ़ा ✍️</div></At></>}>
        {!split && <Fill id="ussr_1945" color={RC.sovietRed} start={0} dur={1} opacity={0.62} pulseAt={[resign]} />}
        {split && <Patchwork ids={REP} colors={REP_COL} start={ended - 10} stagger={3} opacity={0.65} spread={{ at: ended + 20, px: 40, center: [65, 52] }} />}
      </RMap>
      <Stamp text="COLLAPSE #4" x={W * 0.5} y={H * 0.82} start={fourth} size={200} rotate={-6} />
      <YearTag text="25 December 1991" start={tag} />
      <Iris at={tag + 2} hold={34} />
      <Sfx at={ended - 10} file="glass_break.wav" volume={0.7} />
      <Sfx at={fourth} file="stamp_slam.wav" volume={0.8} />
      <Sfx at={fourth} file="sub_drop.wav" volume={0.5} />
    </AbsoluteFill>
  );
};
const NumberAt: React.FC<{ id: string; n: number; start: number }> = ({ id, n, start }) => {
  const [lon, lat] = terr(id).properties.label;
  return <At lon={lon} lat={lat} start={start} over={1.3}><div style={{ ...hand(80, '#fff'), background: 'rgba(0,0,0,0.45)', borderRadius: 50, width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div></At>;
};

/* ───────────── G · the 1990s ───────────── */
const G: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const chaos = L(at(91, 'chaos'));
  const infl = L(at(91, 'महँगाई,'));
  const tag = L(at(91, 'उन्नीस', 1));
  const def = L(at(91, 'चुका'));
  const price = Math.round(10 * Math.pow(1.06, Math.max(0, frame - infl)));
  return (
    <GreyStage>
      <Camera from={0}>
        <TypeOn text="1990s = फिर CHAOS" x={W * 0.56} y={H * 0.12} start={chaos} size={130} color={RC.danger} />
        {Array.from({ length: 14 }, (_, i) => {
          const t = frame - infl - i * 6;
          if (t < 0) return null;
          return <div key={i} style={{ position: 'absolute', left: W * (0.32 + (i % 7) * 0.08) + Math.sin(t / 10 + i) * 40, top: -100 + t * 9 % (H + 200), transform: `rotate(${t * 3 + i * 40}deg)` }}><RImg src="props/rouble_banknotes.png" w={180} h={110} label="💵" /></div>;
        })}
        <PopIn x={W * 0.56} y={H * 0.5} start={infl} tilt={-8}>
          <div style={{ background: '#F6EBCF', padding: '24px 60px', borderRadius: 16, ...hand(150, '#3A2616'), textShadow: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.35)', fontVariantNumeric: 'tabular-nums' }}>🏷️ ₽ {price.toLocaleString('en-IN')}</div>
        </PopIn>
        <TypeOn text="महँगाई · बेरोज़गारी · crime" x={W * 0.56} y={H * 0.74} start={infl} size={96} color={RC.white} />
        <Stamp text="DEFAULT" x={W * 0.6} y={H * 0.3} start={def} size={190} />
      </Camera>
      <Host x={W * 0.14} y={H * 0.92} height={H * 0.52} offset={base} start={0} gestures={[[0, 'handsHead'], [def, 'shrug']]} moods={[[0, 'shocked'], [def, 'sad']]} />
      <YearTag text="17 August 1998" start={tag} />
      <Sfx at={infl} file="riser.wav" volume={0.4} />
      <Sfx at={def} file="stamp_slam.wav" volume={0.7} />
    </GreyStage>
  );
};

/* ───────────── H · Yeltsin on TV → Putin ───────────── */
const Hh: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(92, 'इकतीस'));
  const tv = L(at(92, 'TV'));
  const handed = L(at(92, 'ताक़त'));
  const putin = L(at(92, 'Vladimir'));
  const stage = frame >= putin - 20;
  return (
    <AbsoluteFill>
      {!stage ? (
        <AbsoluteFill>
          <BgPlate src="bg/bg_apartment_1999.png" from={0} sky="#3A2E3E" ground="#5A4A3A" />
          <Camera from={0} keys={[{ at: tv, zoom: 1.3, y: H * 0.04, dur: 60 }]}>
            <div style={{ position: 'absolute', left: W * 0.5 - 380, top: H * 0.26 }}>
              <div style={{ position: 'relative', width: 760, height: 620 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: 60, background: 'linear-gradient(#C9C9C9, #8E8E8E)', border: '8px solid #555', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }} />
                <div style={{ position: 'absolute', left: 120, top: 90, width: 520, height: 400, overflow: 'hidden', borderRadius: 30, background: '#111' }}>
                  <Card src="cards/card_yeltsin.png" x={260} y={220} w={300} start={tv - 30} tilt={0} />
                  <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 3px, rgba(0,0,0,0.1) 3px 6px)' }} />
                </div>
                
              </div>
            </div>
            <TypeOn text="Yeltsin: इस्तीफ़ा 📺" x={W * 0.5} y={H * 0.12} start={tv} size={110} color={RC.white} />
            <TypeOn text="ताक़त → एक कम-जाना officer" x={W * 0.5} y={H * 0.88} start={handed} size={90} color={RC.yellow} />
          </Camera>
        </AbsoluteFill>
      ) : (
        <GreyStage>
          <Camera from={putin - 20}>
            <Card src="cards/card_putin.png" x={W * 0.42} y={H * 0.46} w={W * 0.2} start={putin - 10} name="Vladimir Putin" />
            <LoopWheel x={W * 0.76} y={H * 0.5} r={H * 0.2} start={putin} small steps={[[putin + 2, 0], [putin + 30, 1]]} />
          </Camera>
          <Host x={W * 0.13} y={H * 0.92} height={H * 0.5} offset={base} start={putin - 20} gestures={[[putin - 20, 'point']]} moods={[[putin - 20, 'neutral']]} />
        </GreyStage>
      )}
      <YearTag text="31 December 1999" start={tag} />
      <Sfx at={putin - 10} file="pop.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── I · order returns, freedoms shrink ───────────── */
const I: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const order = L(at(93, 'order'));
  const econ = L(at(93, 'economy'));
  const media = L(at(93, 'media'));
  return (
    <AbsoluteFill>
      <RMap view="eurasia" cam={[{ at: 0, lon: 80, lat: 58, zoom: 1.3 }]}
        overlay={<><At lon={60} lat={60} start={econ} bob={6}><div style={{ textAlign: 'center' }}><RImg src="props/oil_barrel.png" w={150} h={150} label="🛢️" /><div style={hand(70, RC.green)}>oil 📈</div></div></At>
          <At lon={95} lat={62} start={econ + 20} bob={6}><div style={{ ...hand(90, RC.green) }}>💼 salary ✓</div></At>
          <At lon={80} lat={52} start={media}><div style={{ position: 'relative' }}><div style={{ ...hand(90, RC.white) }}>📰 media · 🗳️ विपक्ष</div><RedX x={260} y={50} w={560} h={120} start={media + 20} /></div></At></>}>
        <Fill id="russia_modern" color={RC.rusRed} start={0} dur={1} opacity={0.58} />
      </RMap>
      <TypeOn text="फिर से order चाहिए था" x={W * 0.5} y={H * 0.12} start={order} size={110} color={RC.yellow} />
      <Sfx at={econ} file="coin.wav" volume={0.5} />
      <Sfx at={media + 20} file="pluck_down.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── J · 2014 Crimea; 2036 ───────────── */
const J: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const tag = L(at(94, 'दो'));
  const crimea = L(at(94, 'Crimea'));
  const same = L(at(94, 'वही'));
  const yr20 = L(at(94, 'दो', 1));
  const y2036 = L(at(94, 'छत्तीस'));
  const stage = frame >= yr20 - 10;
  return (
    <AbsoluteFill>
      {!stage ? (
        <RMap view="ru_west" cam={[{ at: 0, lon: 35, lat: 47, zoom: 2.2 }, { at: crimea, lon: 34.3, lat: 45.3, zoom: 3.6, dur: 80 }]}
          overlay={<><Pin lon={34.1} lat={45.0} label="Crimea" start={crimea} /><At lon={36.4} lat={46.6} start={same}><div style={{ ...hand(80, RC.yellow) }}>📌 वही Crimea (1783, Catherine)</div></At></>}>
          <Fill id="russia_modern" color={RC.rusRed} start={0} dur={1} opacity={0.5} />
          <Fill id="ukraine" color="#E0B23A" start={0} dur={1} opacity={0.5} />
          <Fill id="crimea" color="#E0B23A" colors={[[crimea + 10, RC.rusRed]]} start={0} dur={1} opacity={0.62} pulseAt={[crimea + 10]} />
        </RMap>
      ) : (
        <GreyStage>
          <Camera from={yr20 - 10}>
            <TypeOn text="2020 · संविधान बदला 📜" x={W * 0.56} y={H * 0.16} start={yr20} size={110} color={RC.white} />
            <TypeOn text="2024" x={W * 0.42} y={H * 0.5} start={yr20 + 20} size={240} color={RC.white} />
            <RedX x={W * 0.42} y={H * 0.5} w={W * 0.2} h={H * 0.2} start={y2036 - 30} />
            <TypeOn text="→ 2036" x={W * 0.7} y={H * 0.5} start={y2036} size={240} color={RC.danger} />
          </Camera>
        </GreyStage>
      )}
      <YearTag text={stage ? '2020' : '18 March 2014'} start={stage ? yr20 : tag} />
      <Sfx at={crimea + 10} file="pop_low.wav" volume={0.6} />
      <Sfx at={y2036} file="sting_hit.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── K · 2022 ───────────── */
const K: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const tag = L(at(95, 'चौबीस'));
  const attack = L(at(95, 'Ukraine'));
  const map = L(at(95, 'नक़्शा'));
  return (
    <AbsoluteFill>
      <RMap view="ru_west" cam={[{ at: 0, lon: 34, lat: 50, zoom: 2.2 }, { at: map, lon: 32, lat: 50, zoom: 1.8, dur: 80 }]}
        overlay={<><Pin lon={30.5} lat={50.45} label="Kyiv" start={attack} side="l" /><MapLabel lon={31} lat={48.4} text="Ukraine" start={4} size={110} /></>}>
        <Fill id="russia_modern" color={RC.rusRed} start={0} dur={1} opacity={0.5} />
        <Fill id="ukraine" color="#E0B23A" start={0} dur={1} opacity={0.5} />
        <Route pts={[[30.8, 52.2], [30.6, 51.2], [30.6, 50.7]]} start={attack} dur={50} width={30} />
        <Route pts={[[37.6, 51.5], [36.4, 50.6], [35.6, 50.3]]} start={attack + 8} dur={50} width={30} />
        <Route pts={[[34.2, 46.2], [34.8, 46.8], [35.6, 47.3]]} start={attack + 16} dur={50} width={30} />
      </RMap>
      <TypeOn text="Ukraine पर हमला" x={W * 0.5} y={H * 0.12} start={attack} size={130} color={RC.danger} />
      <TypeOn text="Europe का नक़्शा फिर हिला" x={W * 0.5} y={H * 0.88} start={map} size={100} color={RC.white} />
      <YearTag text="24 February 2022" start={tag} />
      <Iris at={tag + 2} hold={34} />
      <Sfx at={attack} file="timpani_roll.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

const SHOTS: [number, React.FC<{ base: number }>][] = [
  [C10_FROM, A],
  [P(86), B],
  [P(87), Cc],
  [P(88), D],
  [P(89), E],
  [P(90), F],
  [P(91), G],
  [P(92), Hh],
  [P(93), I],
  [P(94), J],
  [P(95), K],
];

export const C10Today: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map(([from, Comp], i) => {
      const to = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : C10_TO;
      return (
        <Sequence key={i} from={from - C10_FROM} durationInFrames={to - from}>
          <Comp base={from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
