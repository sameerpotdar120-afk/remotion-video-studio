// The 24 shots. Times are seconds in the 1.10x VO; each shot gets local time t from 0.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Actor, Bg, Depth, Finish, Flash, Scene, Sprite, kf, lin, useT, wob, W, H } from "./lib";

export const CUTS = [0, 0.7, 1.44, 2.04, 2.44, 3.36, 4.54, 4.98, 5.86, 6.56, 7.4, 8.2, 9.36, 9.84, 10.32, 11.36, 12.1, 13.14, 14.28, 15.2, 15.6, 16.56, 17.74, 18.44];
export const END = 19.5;

const S = Math.sin, PI = Math.PI;
const RUN = ["N04", "N05", "N06", "N07", "N08", "N09"];
const RET = ["N20", "N21", "N22", "N23", "N24", "N25"];
const CHG = ["R08", "R09", "R10", "R11", "R12", "R13"];
const HOP = ["R18", "R19", "R20", "R21"];
const SWAT = ["N17", "N18", "N19"];

// 1  "You would never" — legend on a rearing horse at sunset
const Hero: React.FC<{ covered?: boolean }> = ({ covered }) => {
  const t = useT();
  const rear = S(t * 5.5) * 1.6;
  const riders = covered ? [
    // rabbits clinging all over him and the horse (image-space px of N01 drawn at h=900 -> w=1350)
    { k: "R17", x: 690, y: 140, h: 280, r: -8 }, { k: "R16", x: 640, y: 330, h: 300, r: 12 }, { k: "R15", x: 470, y: 340, h: 300, r: -10 },
    { k: "R15", x: 780, y: 520, h: 280, r: 20 }, { k: "R16", x: 380, y: 560, h: 280, r: -25 }, { k: "R17", x: 900, y: 420, h: 240, r: 5 },
    { k: "R15", x: 990, y: 640, h: 260, r: 30 }, { k: "R16", x: 640, y: 640, h: 260, r: 0 }, { k: "R17", x: 1080, y: 520, h: 220, r: 10 },
    { k: "R15", x: 300, y: 700, h: 250, r: -15 }, { k: "R16", x: 820, y: 760, h: 240, r: 8 },
  ] : [];
  return <Scene cam={{ zoom: kf(t, [[0, covered ? 1.12 : 1.0], [1, covered ? 1.22 : 1.1]]), y: covered ? -60 : 0 }} grade="saturate(1.08) contrast(1.05)">
    <Bg k="BG01" z={0.25} over={1.15} panY={0.15} />
    <Sprite k="FX04" x={lin(t, 0, 1, 250, 140)} y={1080} w={1300} z={0.5} opacity={0.55} />
    <Actor k="N01" x={540} y={1800} h={1120} z={1} rot={rear} anchorY={0.9645} shadow={0.6}
      eyes={covered ? { mood: "dead", scale: 1.9, seed: 4 } : { mood: "smug", scale: 1.9, lookX: 0.2, seed: 3 }} mouth={covered ? "frown" : "smirk"}>
      {riders.map((r, i) => <RiderBun key={i} {...r} i={i} />)}
    </Actor>
    <Sprite k="FX04" x={lin(t, 0, 1, 900, 1020)} y={1700} w={1100} z={1.3} opacity={0.35} />
    <Finish warm={0.18} />
  </Scene>;
};
const RiderBun: React.FC<{ k: string; x: number; y: number; h: number; r: number; i: number }> = ({ k, x, y, h, r, i }) => {
  const t = useT(); const wig = S(t * 14 + i) * 3;
  const a = 1; // square images
  return <div style={{ position: "absolute", left: x - (h * a) / 2, top: y - h / 2, width: h * a, height: h, transform: `rotate(${r + wig}deg)` }}>
    <Img src={staticFile(`nap/${k}.webp`)} style={{ width: "100%", height: "100%" }} />
  </div>;
};
export const Shot1 = () => <Hero />;

// 2  "guess what" — smug close-up, eyes check left then right
export const Shot2 = () => {
  const t = useT();
  const look = kf(t, [[0, 0], [0.12, -0.9], [0.36, -0.9], [0.46, 0.9], [0.74, 0.9]]);
  return <Scene cam={{ x: lin(t, 0, 0.74, -30, 30), zoom: lin(t, 0, 0.74, 1.04, 1.12) }}>
    <Bg k="BG01" z={0.3} blur={9} over={1.25} panX={0.3} />
    <Sprite k="FX04" x={200} y={600} w={900} z={0.6} opacity={0.35} blur={6} />
    <Actor k="N02" x={560} y={1990} h={1520} z={1} rot={wob(t, 1.5, 2) * 1.2}
      eyes={{ mood: "smug", lookX: look, browUp: kf(t, [[0.3, 0], [0.45, 14]]), seed: 5, motionFrame: 99 }} mouth="smirk" />
    <Finish warm={0.15} />
  </Scene>;
};

// 3  "made Napoleon" — crane up the legend on the eagle terrace
export const Shot3 = () => {
  const t = useT();
  return <Scene cam={{ y: kf(t, [[0, 380], [0.6, -40]]), zoom: kf(t, [[0, 1.28], [0.6, 1.08]]) }} grade="contrast(1.05)">
    <Bg k="BG02" z={0.3} over={1.18} />
    <Actor k="N03" x={540} y={1930} h={1760} z={1} sx={1 + S(t * 4) * 0.004} eyes={{ mood: "neutral", pupil: 0.75, lid: 0.15, browUp: 6, seed: 6, scale: 1.35 }} mouth="smirk" />
    <Finish warm={0.22} />
  </Scene>;
};

// 4  "run" — sprinting at camera, 12 poses/s
export const Shot4 = () => {
  const t = useT(); const d = 0.4;
  const h = lin(t, 0, d, 950, 1750), y = lin(t, 0, d, 1380, 2120);
  return <Scene cam={{ zoom: lin(t, 0, d, 1, 1.08) }} shake={7} shakeSeed={4}>
    <Bg k="BG03" z={0.35} over={1.15} />
    <Actor k={RUN} fps={12} x={540 + S(t * 15) * 18} y={y} h={h} z={1} shadow={0.5} trail={[0, -40]}
      eyes={{ mood: "panic", shake: 0.7, seed: 7 }} mouth="scream" />
    <Sprite k="FX01" x={540} y={y - 40} w={h * 0.9} z={1.05} opacity={0.5} />
    <Finish />
  </Scene>;
};

// 5  "for his life" — head bouncing at stride rhythm, sweat flying
export const Shot5 = () => {
  const t = useT();
  const bounce = Math.abs(S(t * PI * 6)) * 34;
  return <Scene cam={{ zoom: lin(t, 0, 0.92, 1.0, 1.16), y: wob(t, 8, 3) * 18 }} shake={4} shakeSeed={9}>
    <Bg k="BG03" z={0.35} over={1.3} blur={16} panY={lin(t, 0, 0.92, -0.6, 0.6)} />
    <Actor k="N10" x={540} y={1960 - bounce} h={1560} z={1} rot={S(t * PI * 3) * 3}
      eyes={{ mood: "panic", shake: 1, seed: 8 }} mouth={{ lip: [2.44, 3.36], base: "scream" }} />
    {[0, 1].map((i) => <Sprite key={i} k="FX05" x={540 + (i ? 1 : -1) * lin((t + i * 0.3) % 0.6, 0, 0.6, 260, 560)} y={760 - lin((t + i * 0.3) % 0.6, 0, 0.6, 0, 260)} w={420} z={1.2} opacity={lin((t + i * 0.3) % 0.6, 0.35, 0.6, 1, 0)} flip={!!i} />)}
    <Finish />
  </Scene>;
};

// 6  "in 1807" — aerial establishing pan
export const Shot6 = () => {
  const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.18, 1.12, 1.24) }}>
    <Bg k="BG04" z={0.6} over={1.05} panX={lin(t, 0, 1.18, -0.85, 0.55)} />
    <Finish warm={0.08} />
  </Scene>;
};

// 7  "but it was" — frozen, eyes roll down
export const Shot7 = () => {
  const t = useT();
  return <Scene cam={{ zoom: kf(t, [[0, 1.05], [0.44, 1.32]]), y: kf(t, [[0, 0], [0.44, -330]]) }}>
    <Bg k="BG07" z={0.3} over={1.15} blur={2} />
    <Actor k="N11" x={560} y={1890} h={1700} z={1} shadow={0.5} sy={1 - S(t * 30) * 0.002}
      eyes={{ mood: "neutral", lookY: 1, lookX: -0.3, pupil: 0.55, browAngle: -14, scale: 1.2, seed: 9 }} mouth="frown" />
    <Finish />
  </Scene>;
};

// 8  "hungry rabbits" — the rabbit stares down the lens
export const Shot8 = () => {
  const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 0.88, 1.0, 1.16), y: lin(t, 0, 0.88, 0, -210) }}>
    <Bg k="BG05" z={0.3} over={1.15} />
    <Actor k="R01" x={540} y={1840} h={1550} z={1} shadow={0.4} sy={1 + S(t * 9) * 0.006}
      eyes={{ mood: "neutral", pupil: 1, lid: kf(t, [[0.35, 0], [0.42, 1], [0.5, 0], [0.88, 0.25]]), seed: 10 }} mouth="chew" />
    <Finish />
  </Scene>;
};

// 9  beat — the whole field of rabbits rises behind it; everyone blinks at once
export const Shot9 = () => {
  const t = useT();
  const lid = t > 0.42 && t < 0.52 ? 1 : 0;
  const rise = kf(t, [[0, 900], [0.3, 0]]);
  return <Scene cam={{ zoom: 1.1 }}>
    <Bg k="BG05" z={0.3} over={1.15} />
    <Sprite k="R22" x={540} y={1180 + rise} w={1700} z={0.7} />
    <Actor k="R03" x={170} y={1500 + rise * 0.8} h={760} z={0.85} eyes={{ lid, seed: 1 }} />
    <Actor k="R05" x={910} y={1520 + rise * 0.9} h={760} z={0.85} eyes={{ lid, seed: 2 }} />
    <Actor k={t < 0.3 ? "R01" : "R05"} x={540} y={1990} h={1500} z={1} eyes={{ lid, pupil: 1, seed: 3 }} sy={t > 0.3 && t < 0.4 ? 1.03 : 1} />
    <Finish />
  </Scene>;
};

// 10 "To celebrate peace" — the handshake on the raft
export const Shot10 = () => {
  const t = useT();
  const meet = kf(t, [[0, 0], [0.38, 1]]);
  const shake = t > 0.38 ? S((t - 0.38) * 32) * 10 : 0;
  return <Scene cam={{ zoom: lin(t, 0, 0.84, 1.02, 1.1) }}>
    <Bg k="BG06" z={0.25} over={2.0} panY={-0.45} blur={2.5} />
    <Actor k="N12" x={lin(meet, 0, 1, -200, 360)} y={1500 + shake * 0.3} h={1050} z={1} shadow={0.45} eyes={{ lid: 0.3, pupil: 1, scale: 1.5, seed: 11, lookX: 0.6 }} mouth="smile" />
    <Actor k="T01" x={lin(meet, 0, 1, 1300, 740)} y={1500 - shake * 0.3} h={1200} z={1} shadow={0.45} eyes={{ lid: 0.3, pupil: 1, scale: 1.5, seed: 12, lookX: -0.6 }} mouth="smile" />
    <Finish warm={0.12} />
  </Scene>;
};

// 11 "his staff" — Berthier bows, eager
export const Shot11 = () => {
  const t = useT();
  const bow = kf(t, [[0, 0], [0.25, 9], [0.6, 2]]);
  return <Scene cam={{ zoom: lin(t, 0, 0.8, 1.04, 1.12), y: -120 }}>
    <Bg k="BG07" z={0.3} over={1.15} blur={3} />
    <Actor k="B01" x={560} y={1880} h={1720} z={1} rot={bow} sy={1 - bow * 0.003} shadow={0.5}
      eyes={{ mood: "neutral", pupil: 1, browUp: 12, seed: 13 }} mouth={{ lip: [7.4, 8.2], base: "smile" }} />
    <Finish />
  </Scene>;
};

// 12 "threw him a rabbit hunt" — the hunting party, pan along the cages
export const Shot12 = () => {
  const t = useT();
  return <Scene cam={{ x: lin(t, 0, 1.16, -90, 90), zoom: 1.06 }}>
    <Bg k="BG08" z={0.4} over={1.05} panX={lin(t, 0, 1.16, -0.7, 0.2)} />
    <Sprite k="P07" x={150} y={900} w={560} z={0.65} sy={1 + S(t * 6) * 0.02} />
    <Actor k="O01" x={190} y={1420 - Math.abs(S(t * 9)) * 22} h={900} z={0.75} shadow={0.4} eyes={{ mood: "happy", scale: 1.5, seed: 14 }} mouth="smile" />
    <Actor k="D01" x={930} y={1450} h={620} z={0.8} shadow={0.4} eyes={{ seed: 15, scale: 1.2 }} />
    <Actor k="N13" x={560} y={1600} h={1280} z={1} shadow={0.5} rot={wob(t, 2, 4)} eyes={{ mood: "neutral", pupil: 1, browUp: 10, scale: 1.3, seed: 16 }} mouth={{ lip: [8.2, 9.36], base: "smile" }} />
    {[[150, 1820, 0], [540, 1880, 1], [930, 1820, 2]].map(([x, y, i]) =>
      <Sprite key={i} k="P01" x={x} y={y - 150 + Math.abs(S(t * 20 + i * 2)) * -8} w={600} z={1.2} rot={S(t * 23 + i) * 1.6} />)}
    <Finish warm={0.08} />
  </Scene>;
};

// 13 beat — loading the gold musket, evil grin
export const Shot13 = () => {
  const t = useT();
  return <Scene cam={{ zoom: kf(t, [[0, 1.0], [0.12, 1.12]]) }}>
    <Bg k="BG08" z={0.3} over={1.3} blur={10} panX={0.3} />
    <Actor k="N14" x={520} y={1990 - Math.abs(S(t * 16)) * 14} h={1600} z={1}
      eyes={{ mood: "smug", browAngle: 18, seed: 17 }} mouth="smirk" />
    <Finish />
  </Scene>;
};

// 14 "But the rabbits" — the cage door flies open and they pour out
export const Shot14 = () => {
  const t = useT();
  const open = kf(t, [[0.08, 1], [0.22, -0.35]]);
  const hand = kf(t, [[0, 0], [0.08, 1], [0.3, -0.5]]);
  const cageW = 1250, cx = 540, cy = 1150;
  return <Scene cam={{ zoom: lin(t, 0, 0.48, 1.0, 1.08) }} shake={t > 0.08 && t < 0.25 ? 5 : 0}>
    <Bg k="BG08" z={0.3} over={1.25} blur={5} panX={-0.2} />
    <Sprite k="P02" x={cx} y={cy} w={cageW} z={0.9} />
    {[0, 1, 2].map((i) => { const tt = t - 0.14 - i * 0.07; if (tt < 0) return null;
      const k = Math.min(1, tt / 0.34);
      return <Actor key={i} k={CHG} fps={14} cycleStart={i * 0.1} x={cx + (i - 1) * lin(k, 0, 1, 120, 380)} y={lin(k, 0, 1, cy + 220, 1980 + i * 30)} h={lin(k, 0, 1, 300, 1100)} z={1} eyes={{ pupil: 1, seed: 20 + i }} />; })}
    <Depth z={0.95}><div style={{ position: "absolute", left: cx - cageW * 0.43, top: cy - cageW * 0.27, width: cageW * 0.86, height: cageW * 0.54, transform: `scaleX(${open})`, transformOrigin: "0% 50%" }}>
      <Img src={staticFile("nap/P03.webp")} style={{ position: "absolute", left: -cageW * 0.07, top: -cageW * 0.24, width: cageW, height: cageW }} /></div></Depth>
    <Sprite k="O05" x={lin(hand, 0, 1, -500, 120)} y={cy - 40} w={900} z={1.1} />
    <Finish />
  </Scene>;
};

// 15 "were tame" — calm, cute, head tilt
export const Shot15 = () => {
  const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.04, 1.04, 1.1) }}>
    <Bg k="BG05" z={0.3} over={1.15} />
    <Sprite k="R22" x={540} y={1250} w={1800} z={0.65} blur={2} />
    <Actor k="R03" x={540} y={1980} h={1500} z={1} rot={kf(t, [[0, 0], [0.4, -7], [1, -9]])}
      eyes={{ mood: "neutral", pupil: 1, lookX: 0.2, lid: kf(t, [[0.55, 0], [0.6, 1], [0.66, 0]]), seed: 24 }} mouth="smile" />
    <Finish warm={0.1} />
  </Scene>;
};

// 16 "They thought he'd brought" — a wave of heads turns to him
export const Shot16 = () => {
  const t = useT();
  const buns = [[90, 1990, 0], [330, 2050, 1], [560, 1960, 2], [800, 2050, 3], [1010, 1980, 4], [220, 1720, 5], [700, 1730, 6], [930, 1700, 7], [450, 1700, 8]];
  return <Scene cam={{ zoom: lin(t, 0, 0.74, 1.0, 1.06) }}>
    <Bg k="BG10" z={0.3} over={1.12} />
    <Actor k="N13" x={540} y={1280} h={430} z={0.6} shadow={0.4} eyes={{ mood: "panic", scale: 2.2, seed: 25 }} />
    {buns.map(([x, y, i]) => { const turned = t > 0.08 + i * 0.05; const back = i >= 5;
      return <Actor key={i} k={turned ? "R07" : "R06"} flip={x > 540} x={x} y={y} h={back ? 520 : 760} z={back ? 1.05 : 1.2} sy={turned && t < 0.16 + i * 0.05 ? 1.04 : 1} />; })}
    <Finish />
  </Scene>;
};

// 17 "food" — worm's-eye, confused giant with empty hands
export const Shot17 = () => {
  const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.04, 1.0, 1.08), rot: wob(t, 1.5, 6) * 1.5 }}>
    <Bg k="BG09" z={0.3} over={1.15} />
    <Actor k="N15" x={540} y={2080} h={2050} z={1} rot={wob(t, 2, 7) * 1.5}
      eyes={{ mood: "confused", lookY: 0.8, seed: 26, scale: 1.15 }} mouth="huh" />
    <Actor k="R06" x={250} y={2250} h={1000} z={1.5} blur={6} />
    <Actor k="R06" x={900} y={2300} h={1050} z={1.5} blur={7} flip />
    <Finish />
  </Scene>;
};

// 18 "Hundreds charged him" — the stampede
export const Shot18 = () => {
  const t = useT(); const d = 1.14;
  const runners = [[-1, 0.0], [1, 0.12], [-0.4, 0.25], [0.5, 0.36], [0, 0.48]];
  const leap = t > 0.82 ? (t - 0.82) / 0.32 : -1;
  return <Scene cam={{ x: lin(t, 0, d, -60, 60), zoom: lin(t, 0, d, 1.0, 1.1) }} shake={lin(t, 0, d, 5, 14)} shakeSeed={18}>
    <Bg k="BG11" z={0.3} over={1.05} panX={lin(t, 0, d, -0.5, 0.3)} />
    <Sprite k="R23" x={540} y={lin(t, 0, d, 1180, 1420)} w={lin(t, 0, d, 1100, 2100)} z={0.75} />
    <Sprite k="FX01" x={540} y={1320} w={1700} z={0.8} opacity={0.55} />
    {runners.map(([xo, s], i) => { const k = (t - s) / 0.75; if (k < 0 || k > 1.1) return null;
      return <Actor key={i} k={CHG} fps={15} cycleStart={i * 0.13} x={540 + xo * lin(k, 0, 1, 150, 520)} y={lin(k, 0, 1, 1420, 2300)} h={lin(k, 0, 1, 350, 1500)} z={1} trail={[0, -60]}
        eyes={{ mood: "angry", seed: 30 + i, browAngle: 26 }} />; })}
    {leap >= 0 ? <Actor k="R14" x={540} y={lin(leap, 0, 1, 2000, 2900)} h={lin(leap, 0, 1, 1700, 3400)} z={1} blur={lin(leap, 0.5, 1, 0, 6)} eyes={{ mood: "angry", browAngle: 28, seed: 40 }} mouth="scream" /> : null}
    <Flash at={1.06} dur={0.08} max={0.5} />
    <Finish />
  </Scene>;
};

// 19 "climbed his boots" — rabbits crawl up the boots
export const Shot19 = () => {
  const t = useT(); const d = 0.92;
  const climbers = [[330, 0], [740, 0.05], [520, 0.12], [250, 0.3], [820, 0.34], [430, 0.45], [650, 0.5], [350, 0.6], [740, 0.62]];
  return <Scene cam={{ zoom: lin(t, 0, d, 1.0, 1.07), y: lin(t, 0, d, 0, -120) }} shake={2}>
    <Bg k="BG12" z={0.3} over={1.15} />
    <Actor k="N16" x={540} y={1900} h={1900} z={1} shadow={0.6} rot={S(t * 18) * 0.6} />
    {climbers.map(([x, s], i) => { const k = t - s; if (k < 0) return null;
      const step = Math.floor(k / 0.14), frac = (k % 0.14) / 0.14; const climb = (step + Math.min(1, frac * 2.2)) * 120;
      return <Actor key={i} k="R15" x={x + S(i * 3 + t * 9) * 10} y={1850 - climb - (i % 3) * 40} h={560} z={1.02} rot={S(i + t * 11) * 6} anchorY={0.95}
        eyes={i % 2 ? { mood: "happy", seed: 50 + i } : { pupil: 1, seed: 50 + i }} />; })}
    <Finish />
  </Scene>;
};

// 20 beat — swatting with the hat while the staff laughs
export const Shot20 = () => {
  const t = useT();
  return <Scene cam={{ zoom: 1.08 }} shake={8} shakeSeed={20}>
    <Bg k="BG08" z={0.3} over={1.2} blur={4} panX={0.5} />
    <Actor k="B02" x={180} y={1500} h={1000} z={0.7} shadow={0.4} sy={1 + S(t * 30) * 0.01} eyes={{ mood: "happy", scale: 1.4, seed: 60 }} mouth="A" />
    <Actor k="O02" x={920} y={1500} h={980} z={0.7} shadow={0.4} sy={1 + S(t * 28) * 0.01} eyes={{ mood: "happy", scale: 1.4, seed: 61 }} mouth="E" />
    <Actor k={SWAT} fps={10} x={560} y={1930} h={1600} z={1} shadow={0.5}
      eyes={{ mood: "panic", shake: 1, seed: 62 }} mouth="scream">
      <ClingBun />
    </Actor>
    {[0, 1].map((i) => <Sprite key={i} k="FX03" x={i ? 820 : 300} y={i ? 900 : 1100} w={lin((t + i * 0.2) % 0.4, 0, 0.4, 200, 700)} z={1.1} opacity={lin((t + i * 0.2) % 0.4, 0.1, 0.4, 0.9, 0)} />)}
    <Finish />
  </Scene>;
};
const ClingBun = () => { const t = useT(); return <div style={{ position: "absolute", left: 960, top: 900 + S(t * 20) * 20, width: 700, height: 700, transform: `rotate(${S(t * 18) * 14}deg)` }}>
  <Img src={staticFile("nap/R16.webp")} style={{ width: "100%", height: "100%" }} /></div>; };

// 21 "the greatest general" — the hero shot again, buried in rabbits
export const Shot21 = () => <Hero covered />;

// 22 "alive retreated" — everyone runs for the carriage
export const Shot22 = () => {
  const t = useT(); const d = 1.18;
  return <Scene cam={{ x: lin(t, 0, d, -120, 120), zoom: 1.04 }} shake={6} shakeSeed={22}>
    <Bg k="BG13" z={0.35} over={1.05} panX={lin(t, 0, d, -0.7, 0.5)} />
    <Sprite k="P04" x={lin(t, 0, d, 1350, 1000)} y={1060} w={820} z={0.55} />
    <Actor k={["O03", "O04"]} fps={9} x={lin(t, 0, d, 820, 1000)} y={1500} h={820} z={0.75} flip shadow={0.4} eyes={{ mood: "panic", scale: 1.5, seed: 70 }} mouth="scream" />
    <Actor k={["B03", "B04"]} fps={8} x={lin(t, 0, d, 200, 420)} y={1560} h={900} z={0.8} shadow={0.4} eyes={{ mood: "panic", scale: 1.5, seed: 71 }} mouth="O" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <Actor key={i} k={HOP} fps={12} cycleStart={i * 0.11} x={lin(t, 0, d, 0 - i * 110, 430 - i * 75) + (i % 2) * 60} y={1900 + (i % 3) * 70} h={460 + (i % 3) * 60} z={1.05 + (i % 3) * 0.05} shadow={0.3}
      eyes={{ mood: "angry", seed: 72 + i, scale: 1.2 }} />)}
    <Actor k={RET} fps={12} x={lin(t, 0, d, 440, 620)} y={1830} h={1150} z={1} shadow={0.5} trail={[-50, 0]} flip
      eyes={{ mood: "panic", lookX: 1, shake: 0.8, seed: 73 }} mouth="scream" />
    <Finish />
  </Scene>;
};

// 23 "to his carriage" — the dive, the slam
export const Shot23 = () => {
  const t = useT();
  const k = Math.min(1, t / 0.5);
  const slam = t > 0.55;
  return <Scene cam={{ zoom: slam ? 1.14 : lin(t, 0, 0.55, 1.0, 1.1) }} shake={slam ? lin(t, 0.55, 0.7, 26, 4) : 3} shakeSeed={23}>
    <Bg k="BG13" z={0.35} over={1.1} panX={0.6} />
    <Actor k="P04" face={false} x={760} y={1500} h={1050} z={0.95} anchorY={0.8512} />
    {!slam ? <Actor k="N26" x={lin(k, 0, 1, -100, 640)} y={lin(k, 0, 1, 1420, 1260) - S(k * PI) * 200} h={760} z={1} rot={lin(k, 0, 1, -10, 6)} anchorY="center" trail={[-90, 0]} /> : null}
    <Sprite k="P05" x={400} y={1105} w={410} z={0.96} opacity={slam ? 1 : 0} />
    {t > 0.3 ? <Actor k="R14" x={lin(t, 0.3, 0.6, -150, 420)} y={lin(t, 0.3, 0.6, 1900, 1550)} h={620} z={1.1} sx={t > 0.6 ? 1.12 : 1} sy={t > 0.6 ? 0.9 : 1} eyes={{ mood: t > 0.6 ? "dead" : "angry", seed: 80 }} /> : null}
    <Flash at={0.55} dur={0.1} max={0.45} />
    <Finish />
  </Scene>;
};

// 24 the end — carriage gone; the rabbit sits on its rock, smug
export const Shot24 = () => {
  const t = useT(); const d = 1.06;
  return <Scene cam={{ zoom: lin(t, 0, d, 1.0, 1.08), y: -60 }}>
    <Bg k="BG14" z={0.3} over={1.12} />
    <Sprite k="FX06" x={lin(t, 0, d, 560, 700)} y={lin(t, 0, d, 960, 900)} w={lin(t, 0, d, 700, 420)} z={0.5} opacity={0.8} />
    <Sprite k="P06" x={lin(t, 0, d, 640, 760)} y={lin(t, 0, d, 960, 880)} w={lin(t, 0, d, 520, 230)} z={0.5} />
    <Actor k="R02" x={540} y={1700} h={1350} z={1} shadow={0.5} sy={1 + S(t * 4) * 0.006}
      eyes={{ mood: "smug", lid: kf(t, [[0.5, 0.45], [0.62, 1], [0.75, 0.45]]), lookX: 0.1, seed: 90 }} mouth="smirk" />
    <Finish warm={0.25} />
  </Scene>;
};

export const SHOTS = [Shot1, Shot2, Shot3, Shot4, Shot5, Shot6, Shot7, Shot8, Shot9, Shot10, Shot11, Shot12, Shot13, Shot14, Shot15, Shot16, Shot17, Shot18, Shot19, Shot20, Shot21, Shot22, Shot23, Shot24];
export { AbsoluteFill, W, H };
