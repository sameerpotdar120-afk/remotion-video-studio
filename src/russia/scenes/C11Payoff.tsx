import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { Sfx } from '../../lib/fx/particles';
import { at, para, TOTAL } from '../vo/timeline';
import { Camera, GreyStage, PopIn, RC, RImg, Stamp, TypeOn, hand, pop } from '../kit/core';
import { CollapseMarks, LoopWheel, TimelineHUD } from '../kit/devices';
import { Host } from '../kit/Host';
import { Glyph } from '../kit/scene';
import { Globe } from '../three/Globe';
import { Fill, MapLabel, RMap, Route } from '../map/RMap';

/**
 * PAYOFF (P96–P100) + CLOSE (P101).
 * A  P96   the promise kept: recap timeline HUD 862 · 1240 · 1613 · 1917 · 1991 · आज, each collapse lights as named
 * B  P97   why the loop never stops: a huge flat land; invasion arrows pour in from every side — Mongols, Poles,
 *          Swedes, Napoleon, Hitler
 * C  P98   the whole story in 2-second beats under the HUD
 * D  P99   the loop spins once; "डर" in the middle
 * E  P100  back to the opening: the globe, Russia red, four red X marks, the host
 * F  P101  the host waves; one Subscribe button with a bell
 */
export const PAY_FROM = para(96).f - 6;
export const PAY_TO = TOTAL;
const P = (n: number) => para(n).f - 6;
const NODES = ['862', '1240', '1613', '1917', '1991', 'आज'];

/* ───────────── A · four collapses on the HUD ───────────── */
const A: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const promise = L(at(96, 'वादा'));
  const four = L(at(96, 'चार'));
  const c1 = L(at(96, 'बारह'));
  const c2 = L(at(96, 'Ivan'));
  const c3 = L(at(96, 'उन्नीस'));
  const c4 = L(at(96, 'उन्नीस', 1));
  const beats: [number, string, string][] = [[c1, '🔥 Mongols → Kievan Rus', '1240'], [c2, '👑❓ Time of Troubles', '1598–1613'], [c3, '👑⬇️ Tsars का अंत', '1917'], [c4, '☭ 💥 Soviet Union', '1991']];
  return (
    <GreyStage>
      <TimelineHUD nodes={NODES} start={0} active={[[0, 0], [c1, 1], [c2, 2], [c3, 3], [c4, 4]]} collapses={[1, 2, 3, 4]} />
      <Camera from={0}>
        <TypeOn text="वादा पूरा: 4 collapse" x={W * 0.6} y={H * 0.27} start={promise} size={150} color={RC.yellow} />
        {beats.map(([f, txt, yr], i) => (
          <PopIn key={i} x={W * (0.44 + (i % 2) * 0.34)} y={H * (0.5 + Math.floor(i / 2) * 0.26)} start={f} tilt={i % 2 ? 3 : -3}>
            <div style={{ background: '#F4F1EA', borderRadius: 40, padding: '30px 64px', boxShadow: '0 24px 48px rgba(0,0,0,0.3)', textAlign: 'center' }}>
              <div style={{ ...hand(120, RC.danger), textShadow: 'none' }}>✘ #{i + 1} · {yr}</div>
              <div style={{ ...hand(96, '#333'), textShadow: 'none' }}>{txt}</div>
            </div>
          </PopIn>
        ))}
      </Camera>
      <Host x={W * 0.12} y={H * 0.94} height={H * 0.56} offset={base} start={-12} gestures={[[0, 'present'], [four, 'fingerUp'], [c1, 'point']]} moods={[[0, 'neutral'], [c3, 'worried']]} />
      {beats.map(([f], i) => <Sfx key={i} at={f} file="stamp_slam.wav" volume={0.45} />)}
    </GreyStage>
  );
};

/* ───────────── B · flat land, attacked from every side ───────────── */
const B: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const q = L(at(97, 'सवाल,'));
  const flat = L(at(97, 'सपाट'));
  const noMount = L(at(97, 'पहाड़,'));
  const any = L(at(97, 'हमला'));
  const hist = L(at(97, 'historians'));
  const names: [string, number, [number, number][], string][] = [
    ['Mongols', L(at(97, 'Mongols,')), [[95, 47], [75, 49], [55, 51], [42, 54]], RC.horde],
    ['Poles', L(at(97, 'Poles,')), [[17, 52], [26, 53.5], [34, 55]], RC.poland],
    ['Swedes', L(at(97, 'Swedes,')), [[15, 61], [24, 60], [31, 59]], RC.sweden],
    ['Napoleon', L(at(97, 'Napoleon,')), [[2, 49], [16, 52], [28, 54.5], [36, 55.6]], RC.napoleon],
    ['Hitler', L(at(97, 'Hitler.')), [[12, 51], [24, 52], [36, 51.5], [44, 48.8]], RC.germany],
  ];
  return (
    <AbsoluteFill>
      <RMap view="eurasia" cam={[{ at: 0, lon: 75, lat: 55, zoom: 1.05 }, { at: 1, lon: 70, lat: 57, zoom: 1.2, dur: flat - 1 }, { at: any, lon: 55, lat: 54, zoom: 1.35, dur: 140 }]}
        overlay={<><MapLabel lon={80} lat={63} text="बहुत बड़ी 📏 · बहुत सपाट ➖" start={flat} size={110} color={RC.yellow} />
          <MapLabel lon={60} lat={49} text="न पहाड़ ⛰️✗ · न समुंदर 🌊✗" start={noMount} size={100} />
          {names.map(([n, f, pts]) => <MapLabel key={n} lon={pts[0][0]} lat={pts[0][1] + (n === 'Hitler' ? -2.6 : 2.4)} text={n} start={f} size={92} />)}</>}>
        <Fill id="russia_modern" color={RC.rusRed} start={-2} dur={1} opacity={0.5} pulseAt={[flat]} />
        {names.map(([n, f, pts, c]) => <Route key={n} pts={pts} start={f - 6} dur={40} width={34} color={c === RC.poland ? '#EDEDED' : c} head={RC.stampRed} />)}
      </RMap>
      <TypeOn text="Loop रुकता क्यों नहीं? 🤔" x={W * 0.5} y={H * 0.1} start={q} size={140} color={RC.white} exit={flat} />
      <PopIn x={W * 0.2} y={H * 0.72} start={hist} exit={flat} tilt={-4}>
        <div style={{ background: '#F4F1EA', borderRadius: 36, padding: '28px 48px', boxShadow: '0 24px 48px rgba(0,0,0,0.4)', textAlign: 'center' }}>
          <RImg src="props/books_quill.png" w={H * 0.26} h={H * 0.26} label="📚" style={{ margin: '0 auto' }} />
          <div style={{ ...hand(90, '#333'), textShadow: 'none' }}>historians 📚 👉 ज़मीन</div>
        </div>
      </PopIn>
      {names.map(([n, f]) => <Sfx key={n} at={f - 6} file="whoosh_fast.wav" volume={0.4} />)}
    </AbsoluteFill>
  );
};

/* ───────────── C · the whole story in beats ───────────── */
const C: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const beats: [number, string, string, number][] = [
    [L(at(98, 'Chaos')), 'props/viking_longship.png', 'Vikings बुलाए ⛵', 1],
    [L(at(98, 'Mongols')), 'props/yarlyk_scroll.png', 'Moscow की ताक़त 📜', 1],
    [L(at(98, 'Ivan')), 'chars/oprichnik.png', 'order → डर 🐕', 2],
    [L(at(98, 'उसके')), 'props/throne_gold.png', 'chaos → Romanovs 🪑', 2],
    [L(at(98, 'Peter')), 'props/shears_giant.png', 'Empire · किसानों की पीठ पर ✂️', 3],
    [L(at(98, 'Tsars')), 'props/crown_catherine.png', 'ढीले पड़े → गिरे 👑⬇️', 3],
    [L(at(98, 'Stalin')), 'cards/card_stalin.png', 'superpower · करोड़ों जानें', 4],
    [L(at(98, 'Soviet')), 'cards/card_putin.jpg', 'गिरा → chaos → फिर एक ताक़तवर आदमी', 5],
  ];
  let cur = 0;
  beats.forEach(([f], i) => { if (frame >= f) cur = i; });
  const [, src, txt, node] = beats[cur];
  return (
    <GreyStage>
      <TimelineHUD nodes={NODES} start={0} active={beats.map(([f, , , n]) => [f, Math.min(5, n)] as [number, number])} collapses={[1, 2, 3, 4]} />
      <Camera from={0}>
        <TypeOn text="पूरी कहानी एक साथ 👀" x={W * 0.5} y={H * 0.48} start={L(at(98, 'अब')) - 24} size={170} color={RC.yellow} exit={beats[0][0]} />
        {frame >= beats[0][0] && (
          <div key={cur} style={{ position: 'absolute', left: W * 0.5, top: H * 0.56, transform: `translate(-50%, -50%) scale(${0.72 + 0.28 * pop(frame, beats[cur][0], 1.1)})`, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: '#F4F1EA', borderRadius: 36, padding: 24, boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
              <RImg src={src} w={H * 0.52} h={H * 0.52} label={txt} />
            </div>
            <div style={{ ...hand(130, RC.white), marginTop: 30 }}>{txt}</div>
          </div>
        )}
      </Camera>
      {beats.map(([f], i) => <Sfx key={i} at={f} file="whoosh_soft.wav" volume={0.35} />)}
    </GreyStage>
  );
};

/* ───────────── D · fear at the centre of the loop ───────────── */
const D: React.FC<{ base: number }> = ({ base }) => {
  const L = (f: number) => f - base;
  const danger = L(at(99, 'ख़तरा'));
  const strong = L(at(99, 'ताक़तवर'));
  const order = L(at(99, 'order'));
  const over = L(at(99, 'हद'));
  const breaks = L(at(99, 'टूटता'));
  const one = L(at(99, 'एक', 1));
  return (
    <GreyStage>
      <Camera from={0}>
        <LoopWheel x={W * 0.5} y={H * 0.45} r={H * 0.27} start={-12} steps={[[danger, 0], [strong, 1], [order, 2], [over, 3], [breaks, 4]]} spinAt={breaks + 30} center={{ text: 'डर', at: danger + 10 }} />
        <TypeOn text="सब कुछ एक ही आदमी पर टिका ☝️" x={W * 0.56} y={H * 0.88} start={one} size={120} color={RC.yellow} />
      </Camera>
      <Host x={W * 0.12} y={H * 0.94} height={H * 0.56} offset={base} start={-12} gestures={[[0, 'present'], [strong, 'fingerUp'], [over, 'shrug'], [breaks, 'handsHead']]} moods={[[0, 'neutral'], [over, 'worried'], [breaks, 'shocked']]} />
      <Sfx at={danger + 10} file="heartbeat_low.wav" volume={0.55} />
      <Sfx at={breaks} file="glass_break.wav" volume={0.5} />
    </GreyStage>
  );
};

/* ───────────── E/F · back to the opening; subscribe ───────────── */
const EF: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const L = (f: number) => f - base;
  const notWeak = L(at(100, 'कमज़ोर'));
  const hands = L(at(100, 'सौंप'));
  const falls = L(at(100, 'गिरता', 1));
  const close = L(at(101, 'Loop'));
  const sub = L(at(101, 'subscribe'));
  const end = TOTAL - base;
  const bell = sub + 45;
  return (
    <AbsoluteFill>
      <Globe keys={[{ at: 0, lon: 80, lat: 50, dist: 3.4 }, { at: 2, lon: 95, lat: 56, dist: 2.9, dur: 200 }, { at: close, lon: 95, lat: 56, dist: 4.2, dur: end - close }]}
        highlight={{ ids: ['russia_modern'], color: '#D0302A', start: 0, pulse: [hands, falls] }} spinBias={2} />
      <CollapseMarks redAt={[0, 0, 0, 0]} start={0} x={W * 0.5} y={H * 0.06} size={150} />
      <TypeOn text="कमज़ोर नहीं…" x={W * 0.3} y={H * 0.74} start={notWeak} size={140} color={RC.white} exit={hands} />
      <TypeOn text="सारी ताक़त ➡️ एक आदमी" x={W * 0.32} y={H * 0.74} start={hands} size={140} color={RC.yellow} exit={close} />
      <TypeOn text="वो गिरा → देश गिरा" x={W * 0.32} y={H * 0.86} start={falls} size={140} color={RC.danger} exit={close} />
      <TypeOn text="Loop टूटेगा? ⏳" x={W * 0.32} y={H * 0.74} start={close} size={160} color={RC.white} />
      <Host x={W * 0.86} y={H * 0.95} height={H * 0.6} flip offset={base} start={0} gestures={[[0, 'present'], [close, 'shrug'], [sub, 'wave']]} moods={[[0, 'neutral'], [close, 'smug'], [sub, 'grin']]} hopAt={[sub + 4]} />
      {frame >= sub && (
        <div style={{ position: 'absolute', left: W * 0.32, top: H * 0.88, transform: `translate(-50%, -50%) scale(${pop(frame, sub, 1.15) * (frame > bell && frame < bell + 10 ? 0.92 : 1)})` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 30, background: frame > bell ? '#7A7A7A' : '#E62117', borderRadius: 26, padding: '26px 60px', boxShadow: '0 20px 40px rgba(0,0,0,0.45)' }}>
            <span style={{ fontFamily: '"Anton", sans-serif', fontSize: 140, color: '#fff', letterSpacing: 4 }}>{frame > bell ? 'SUBSCRIBED' : 'SUBSCRIBE'}</span>
            <span style={{ transform: `rotate(${frame > bell + 10 ? Math.sin((frame - bell) / 3) * 20 * Math.exp(-(frame - bell) / 30) : 0}deg)`, display: 'inline-block' }}><RImg src="props/subscribe_bell.png" w={150} h={150} label="🔔" /></span>
          </div>
        </div>
      )}
      <AbsoluteFill style={{ background: '#000', opacity: ramp(frame, end - 40, 40, ease.in) }} />
      <Sfx at={sub} file="pop_high.wav" volume={0.6} />
      <Sfx at={bell} file="click_soft.wav" volume={0.7} />
      <Sfx at={bell + 10} file="bell_ding.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

const SHOTS: [number, React.FC<{ base: number }>][] = [
  [PAY_FROM, A],
  [P(97), B],
  [P(98), C],
  [P(99), D],
  [P(100), EF],
];

export const C11Payoff: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map(([from, Comp], i) => {
      const to = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : PAY_TO;
      return (
        <Sequence key={i} from={from - PAY_FROM} durationInFrames={to - from}>
          <Comp base={from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
