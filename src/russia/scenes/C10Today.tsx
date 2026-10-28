import React from 'react';
import { AbsoluteFill, Img, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, CHAPTERS } from '../vo/timeline';
import { BigNumber, Camera, Card, Flash, GreyStage, Iris, PopIn, RC, RImg, Stamp, ra, TypeOn, YearTag, hand } from '../kit/core';
import { Candle, LoopWheel, RedX } from '../kit/devices';
import { Host } from '../kit/Host';
import { Char } from '../kit/cast';
import { BgPlate, Fire, Glyph, Smoke } from '../kit/scene';
import { SputnikOrbit } from '../three/Sputnik';
import { Globe } from '../three/Globe';
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
  const orbit = (frame - gagarin) / 40;
  return (
    <AbsoluteFill>
      {phase === 0 && (
        <GreyStage>
          <Camera from={0}>
            <Card src="cards/card_stalin.png" x={W * 0.4} y={H * 0.44} w={W * 0.2} start={2} name="Stalin" nameColor={RC.danger} ribbonAt={tag + 20} grey={tag + 20} />
            <Candle x={W * 0.4 + W * 0.13} y={H * 0.74} size={H * 0.16} start={tag + 20} />
            <TypeOn text="1953 · Stalin की मौत" x={W * 0.4} y={H * 0.12} start={tag + 14} size={120} color={RC.danger} exit={cold - 6} />
            <PopIn x={W * 0.77} y={H * 0.5} start={cold} tilt={6}><RImg src="props/rocket_vostok.png" w={H * 0.32} h={H * 0.62} /></PopIn>
            <PopIn x={W * 0.6} y={H * 0.46} start={cold + 8}><div style={{ ...hand(130, '#333'), textShadow: 'none' }}>🇺🇸 ⚔️ ☭</div></PopIn>
            <TypeOn text="Cold War 🥶 + Space race 🚀" x={W * 0.6} y={H * 0.9} start={cold} size={100} color={RC.blue} />
          </Camera>
          <Host x={W * 0.12} y={H * 0.95} height={H * 0.56} offset={base} start={0} gestures={[[0, 'present'], [cold, 'point']]} moods={[[0, 'worried'], [cold, 'smile']]} />
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
        <AbsoluteFill style={{ background: 'linear-gradient(#0E1A3A, #5E7FB0 55%, #C9A27A 82%, #6E5A44 82.5%, #4A3E30 100%)' }}>
          <Camera from={something} shake={[{ at: april - 20, amp: 14, dur: 100 }]}>
            <div style={{ position: 'absolute', left: W * 0.26 - 300, top: H * 0.86 - 1370 - lift * H * 1.6 }}>
              <RImg src="props/rocket_vostok.png" w={600} h={1370} label="🚀 Vostok" />
              {frame >= april - 20 && <><Smoke x={300} y={1300} size={320} start={april - 20} color="230,230,230" wind={0.2} /><Fire x={300} y={1400} size={340} start={april - 20} grow={8} seed="rk" /></>}
            </div>
            <Char who="gagarin_spacesuit" seed="yg" x={W * 0.44} y={H * 0.95} height={H * 0.46} start={0} exit={april - 30} gestures={[[0, 'wave']]} moods={[[0, 'smile']]} />
          </Camera>
          {frame >= gagarin && (
            // into orbit: the real 3D Earth in space (outside the launch camera), Gagarin's single orbit as a glowing path
            <AbsoluteFill style={{ opacity: ramp(frame, gagarin, 16, ease.out), background: '#02040A' }}>
              <div style={{ position: 'absolute', left: -W * 0.2, top: 0, width: W, height: H }}>
                <Globe keys={[{ at: 0, lon: 62, lat: 40, dist: 4.3 }]} spinBias={3} />
              </div>
              <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                <defs>
                  <filter id="orbGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={10} /></filter>
                </defs>
                <g transform={`translate(${W * 0.3} ${H * 0.5}) rotate(-16)`}>
                  <ellipse rx={H * 0.42} ry={H * 0.12} fill="none" stroke="rgba(255,220,140,0.3)" strokeWidth={5} strokeDasharray="16 14" />
                  <ellipse rx={H * 0.42} ry={H * 0.12} fill="none" stroke="#FFD27A" strokeWidth={7}
                    strokeDasharray={`${Math.PI * H * 0.56 * Math.min(1, ramp(frame, gagarin, 300))} 99999`} />
                  <circle cx={Math.cos(orbit) * H * 0.42} cy={Math.sin(orbit) * H * 0.12} r={24} fill="#FFF3D0" filter="url(#orbGlow)" />
                  <circle cx={Math.cos(orbit) * H * 0.42} cy={Math.sin(orbit) * H * 0.12} r={12} fill="#FFFFFF" />
                </g>
              </svg>
            </AbsoluteFill>
          )}
          <Card src="cards/card_gagarin.png" x={W * 0.66} y={H * 0.44} w={W * 0.21} start={gagarin - 6} name="Yuri Gagarin" />
          <TypeOn text="108 minutes · पहला इंसान 🌍" x={W * 0.3} y={H * 0.86} start={minutes} size={110} color={RC.yellow} />
          <YearTag text="12 April 1961" start={april} />
          <Iris at={april} hold={30} />
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
        <PopIn x={W * 0.57} y={H * 0.6} start={three - 20}>
          <div style={{ transform: 'scale(1.6)', width: 360, height: 220, background: '#2A2A2A', borderRadius: 20, border: '8px solid #555', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, #FF4040, #8A0000)`, boxShadow: `0 0 ${40 * red}px #FF2020` }} />
            <div style={{ ...hand(50, '#FFDADA'), textShadow: 'none' }}>LAUNCH</div>
          </div>
        </PopIn>
        <Char who="soviet_navy_officer" seed="o1" x={W * 0.22} y={H * 0.97} height={H * 0.48} start={4} gestures={[[0, 'down'], [two, 'point']]} moods={[[0, 'worried'], [two, 'angry']]} shake={[two, no]} />
        <Char who="soviet_navy_officer" seed="o2" tint="#3A5A8A" x={W * 0.38} y={H * 0.97} height={H * 0.46} start={10} gestures={[[0, 'down'], [two + 10, 'point']]} moods={[[0, 'worried'], [two + 10, 'angry']]} shake={[two, no]} />
        <Char who="soviet_navy_officer" seed="arkhipov" tint="#5A6A3A" x={W * 0.78} y={H * 0.97} height={H * 0.5} start={16} flip gestures={[[0, 'down'], [no, 'hips']]} moods={[[0, 'neutral'], [no, 'angry'], [saved, 'smile']]} />
        <TypeOn text="✔ ✔" x={W * 0.3} y={H * 0.36} start={two} size={130} color={RC.green} />
        <TypeOn text="✘ NO" x={W * 0.78} y={H * 0.36} start={no} size={150} color={RC.danger} />
      </Camera>
      <TypeOn text="1962 · Cuba के पास 🌊" x={W * 0.5} y={H * 0.1} start={cuba} size={100} color={RC.white} exit={three} />
      <TypeOn text="3 अफ़सर · 3 हाँ ज़रूरी" x={W * 0.5} y={H * 0.1} start={three} size={100} color={RC.yellow} exit={no} />
      <TypeOn text="Vasily Arkhipov" x={W * 0.5} y={H * 0.1} start={no + 10} size={130} color={RC.blue} />
      <TypeOn text="एक “ना” ने दुनिया बचा ली 🌍" x={W * 0.5} y={H * 0.22} start={saved} size={100} color={RC.yellow} />
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
  const sovRocket = L(at(87, 'Soviet', 1));
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
            <Card src="cards/card_rakesh_sharma.png" x={W * 0.28} y={H * 0.5} w={W * 0.24} start={yr84} name="Rakesh Sharma" />
            <TypeOn text="Soviet rocket 🚀 → अंतरिक्ष" x={W * 0.68} y={H * 0.3} start={sovRocket} size={110} color={RC.white} exit={rakesh} />
            <TypeOn text="पहले भारतीय अंतरिक्ष यात्री 🇮🇳" x={W * 0.68} y={H * 0.3} start={rakesh + 8} size={110} color={RC.white} exit={indira} />
            <TypeOn text="Indira Gandhi: “ऊपर से भारत कैसा दिखता है?”" x={W * 0.68} y={H * 0.42} start={indira} size={88} color="#DDD" />
            <TypeOn text="“सारे जहाँ से अच्छा” 🇮🇳" x={W * 0.68} y={H * 0.62} start={quote} size={150} color={RC.yellow} />
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
        {[0, 1, 2, 3, 4].map((i) => <Char key={i} who="soviet_citizen_1980s" seed={`q${i}`} x={W * (0.11 + i * 0.085)} y={H * 0.96} height={H * 0.4} start={i * 5} moods={[[0, 'sad']]} gestures={[[0, 'down']]} />)}
        <Card src="cards/card_gorbachev.png" x={W * 0.78} y={H * 0.46} w={W * 0.19} start={gorb - 10} name="Gorbachev" />
        <Stamp text="Glasnost · खुलापन" x={W * 0.55} y={H * 0.34} start={glas} size={100} color={RC.stampGreen} rotate={-4} />
        <Stamp text="Perestroika · बदलाव" x={W * 0.57} y={H * 0.5} start={pere} size={100} color={RC.stampGreen} rotate={4} />
      </Camera>
      <TypeOn text="दुकानें ख़ाली 🛒✗ · economy ठप" x={W * 0.4} y={H * 0.17} start={shops} size={110} color={RC.white} />
      <YearTag text="1985" start={gorb} />
      <Sfx at={glas} file="stamp_slam.wav" volume={0.45} />
      <Sfx at={pere} file="stamp_slam.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

/* ───────────── E · Chernobyl, the Wall ───────────── */
const SLAB = `polygon(${W * 0.461}px ${H * 0.255}px, ${W * 0.641}px ${H * 0.205}px, ${W * 0.641}px ${H * 0.72}px, ${W * 0.461}px ${H * 0.70}px)`;
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
  const wallT = Math.max(0, frame - (wall - 10)) / 60;
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
          {/* one painted panel of the photo itself tips over towards camera; the gap shows the lit city behind */}
          <AbsoluteFill style={{ transform: `translateX(${-6 * wallT}px) scale(${1.04 + 0.012 * wallT})` }}>
            {fall > 0 && (
              <AbsoluteFill style={{ clipPath: SLAB, background: 'radial-gradient(ellipse at 55% 75%, rgba(255,200,120,0.55) 0%, rgba(255,200,120,0) 45%), linear-gradient(#121830 0%, #262A48 55%, #6A5048 82%, #2E2828 100%)' }}>
                {[0, 1, 2].map((i) => (
                  <Char key={i} who={i % 2 ? 'russian_1990s' : 'soviet_citizen_1980s'} seed={`bw${i}`} x={W * (0.495 + i * 0.055)} y={H * 0.72} height={H * 0.27} start={fell + 14 + i * 4} gestures={[[0, 'wave']]} moods={[[0, 'smile']]} />
                ))}
              </AbsoluteFill>
            )}
            <AbsoluteFill style={{ clipPath: SLAB, transformOrigin: '55% 71%', transform: `perspective(${W}px) rotateX(${-fall * 78}deg)`, opacity: 1 - ramp(frame, fell + 26, 20, ease.in) }}>
              <Img src={ra('bg/bg_berlin_wall_1989.png')} style={{ width: W, height: H, objectFit: 'cover' }} />
            </AbsoluteFill>
          </AbsoluteFill>
          <Camera from={wall - 10} shake={[{ at: fell + 20, amp: 24, dur: 30 }]}>
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
        overlay={<>{split && REP.map((id, i) => <NumberAt key={id} id={id} n={i + 1} start={fifteen + i * 4} />)}<At lon={40} lat={62} start={resign} exit={ended - 10}><div style={{ ...hand(110, RC.white) }}>Gorbachev: इस्तीफ़ा ✍️</div></At></>}>
        {!split && <Fill id="ussr_1945" color={RC.sovietRed} start={0} dur={1} opacity={0.62} pulseAt={[resign]} />}
        {split && <Patchwork ids={REP} colors={REP_COL} start={ended - 10} stagger={3} opacity={0.65} spread={{ at: ended + 20, px: 40, center: [65, 52] }} />}
      </RMap>
      <Stamp text="COLLAPSE #4" x={W * 0.74} y={H * 0.8} start={fourth} size={200} rotate={-6} />
      <YearTag text="25 December 1991" start={tag} />
      <Iris at={tag + 2} hold={34} />
      <Sfx at={ended - 10} file="glass_break.wav" volume={0.7} />
      <Sfx at={fourth} file="stamp_slam.wav" volume={0.8} />
      <Sfx at={fourth} file="sub_drop.wav" volume={0.5} />
    </AbsoluteFill>
  );
};
/** px nudges so the tiny Baltic / Caucasus badges don't sit on top of each other */
const NUDGE: Record<string, [number, number]> = {
  rep_moldova: [-40, 0], rep_lithuania: [-90, -10], rep_estonia: [40, -30],
  rep_georgia: [-40, -60], rep_armenia: [-80, 30], rep_azerbaijan: [70, 30],
};
const NumberAt: React.FC<{ id: string; n: number; start: number }> = ({ id, n, start }) => {
  const [lon, lat] = terr(id).properties.label;
  const [dx, dy] = NUDGE[id] ?? [0, 0];
  return <At lon={lon} lat={lat} start={start} over={1.3} dx={dx} dy={dy}><div style={{ ...hand(62, '#fff'), background: 'rgba(0,0,0,0.5)', borderRadius: 44, width: 86, height: 86, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div></At>;
};

/* ───────────── G · the 1990s ───────────── */
const G: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const russia = L(at(91, 'Russia,'));
  const nineties = L(at(91, 'नब्बे'));
  const chaos = L(at(91, 'chaos'));
  const infl = L(at(91, 'महँगाई,'));
  const tag = L(at(91, 'उन्नीस', 1));
  const def = L(at(91, 'चुका'));
  const price = Math.round(10 * Math.pow(1.06, Math.max(0, frame - infl)));
  return (
    <GreyStage>
      <Camera from={0}>
        <PopIn x={W * 0.56} y={H * 0.48} start={russia} exit={infl - 10}>
          <div style={{ position: 'relative', width: 820, height: 830, transform: `rotate(${frame >= chaos ? Math.sin(frame / 3) * 1.5 : 0}deg)` }}>
            <RImg src="props/double_headed_eagle.png" w={820} h={830} />
          </div>
        </PopIn>
        {Array.from({ length: 14 }, (_, i) => {
          const t = frame - infl - i * 6;
          if (t < 0) return null;
          return <div key={i} style={{ position: 'absolute', left: W * (0.32 + (i % 7) * 0.08) + Math.sin(t / 10 + i) * 40, top: -100 + t * 9 % (H + 200), transform: `rotate(${t * 3 + i * 40}deg)` }}><RImg src="props/rouble_banknotes.png" w={180} h={110} label="💵" /></div>;
        })}
        <PopIn x={W * 0.56} y={H * 0.5} start={infl} tilt={-8}>
          <div style={{ background: '#F6EBCF', padding: '24px 60px', borderRadius: 16, ...hand(150, '#3A2616'), textShadow: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.35)', fontVariantNumeric: 'tabular-nums' }}>🏷️ ₽ {price.toLocaleString('en-IN')}</div>
        </PopIn>
        <TypeOn text="महँगाई · बेरोज़गारी · crime" x={W * 0.56} y={H * 0.74} start={infl} size={110} color={RC.white} />
        <TypeOn text="1990s" x={W * 0.56} y={H * 0.12} start={nineties} size={130} color={RC.danger} exit={chaos - 4} />
        <TypeOn text="1990s = फिर CHAOS" x={W * 0.56} y={H * 0.12} start={chaos - 4} size={130} color={RC.danger} rate={9} />
        <Char who="russian_1990s" seed="r90" x={W * 0.88} y={H * 0.95} height={H * 0.46} start={chaos} flip moods={[[0, 'worried'], [def, 'sad']]} gestures={[[0, 'down'], [infl, 'handsHead'], [def, 'shrug']]} />
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
          <Camera from={0} keys={[{ at: tv, zoom: 1.25, y: H * 0.06, dur: 60 }]}>
            {/* CRT prop (1600×1429, screen ≈ x 338–1158, y 392–1078) standing on the coffee table */}
            <div style={{ position: 'absolute', left: W * 0.5 - 600, top: H * 0.635 - 1072, width: 1200, height: 1072 }}>
              <div style={{ position: 'absolute', inset: 0 }}><RImg src="props/tv_crt_1999.png" w={1200} h={1072} /></div>
              <div style={{ position: 'absolute', left: 268, top: 308, width: 584, height: 486, overflow: 'hidden', borderRadius: 40, background: '#111', opacity: ramp(frame, tv - 30, 12, ease.out) }}>
                <Card src="cards/card_yeltsin.png" x={292} y={250} w={320} start={tv - 30} tilt={0} />
                <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 3px, rgba(0,0,0,0.1) 3px 6px)' }} />
              </div>
            </div>
          </Camera>
          <TypeOn text="Yeltsin: इस्तीफ़ा 📺" x={W * 0.5} y={H * 0.12} start={tv} size={120} color={RC.white} />
          <TypeOn text="ताक़त → एक कम-जाना officer" x={W * 0.5} y={H * 0.88} start={handed} size={110} color={RC.yellow} />
        </AbsoluteFill>
      ) : (
        <GreyStage>
          <Camera from={putin - 20}>
            <Card src="cards/card_putin.png" x={W * 0.36} y={H * 0.46} w={W * 0.2} start={putin - 10} name="Vladimir Putin" />
            <LoopWheel x={W * 0.67} y={H * 0.5} r={H * 0.17} start={putin} steps={[[putin + 2, 0], [putin + 30, 1]]} />
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
        overlay={<><At lon={60} lat={60} start={econ} bob={6}><div style={{ textAlign: 'center' }}><RImg src="props/oil_barrel.png" w={300} h={300} label="🛢️" style={{ margin: '0 auto' }} /><div style={hand(110, RC.green)}>oil 📈</div></div></At>
          <At lon={95} lat={62} start={econ + 20} bob={6}><div style={{ ...hand(120, RC.green) }}>💼 salary ✓</div></At>
          <At lon={80} lat={52} start={media}><div style={{ position: 'relative' }}><div style={{ ...hand(120, RC.white), whiteSpace: 'nowrap' }}>📰 media · 🗳️ विपक्ष</div><RedX x={430} y={75} w={860} h={170} start={media + 20} /></div></At></>}>
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
            <PopIn x={W * 0.56} y={H * 0.36} start={L(at(94, 'संविधान'))} tilt={-4}><RImg src="props/pact_document.png" w={520} h={560} /></PopIn>
            <TypeOn text="2020 · संविधान बदला 📜" x={W * 0.56} y={H * 0.12} start={yr20} size={110} color={RC.white} />
            <TypeOn text="2024" x={W * 0.44} y={H * 0.7} start={yr20 + 10} size={240} color={RC.white} />
            <RedX x={W * 0.44} y={H * 0.7} w={W * 0.17} h={H * 0.18} start={y2036 - 30} />
            <TypeOn text="→ 2036" x={W * 0.7} y={H * 0.7} start={y2036} size={240} color={RC.danger} />
          </Camera>
          <Host x={W * 0.14} y={H * 0.93} height={H * 0.5} offset={base} start={yr20 - 10} gestures={[[yr20 - 10, 'present'], [y2036, 'point']]} moods={[[yr20 - 10, 'neutral'], [y2036, 'shocked']]} />
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
