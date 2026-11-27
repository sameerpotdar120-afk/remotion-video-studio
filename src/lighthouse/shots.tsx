// The Man Who Wished for the Storm: 101 shots on the creator's VO at 1.10x. Each shot gets local time t.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Actor, Bg, Depth, Finish, Flash, Scene, Sprite, kf, lin, useT, wob, W, H, type Eyes } from "./lib";

const S = Math.sin, PI = Math.PI;
const WALK = ["WN37", "WN38", "WN39", "WN40", "WN41", "WN42"];
const G_DAY = "saturate(1.02) contrast(1.05) brightness(1.04)";
const G_GOLD = "saturate(1.05) contrast(1.05) brightness(1.03)";
const G_STORM = "saturate(0.95) contrast(1.12) brightness(0.9)";
const G_IN = "saturate(1.02) contrast(1.06)";
const G_GREY = "saturate(0.55) contrast(1.02) brightness(0.98)";
const G_SEPIA = "sepia(0.75) saturate(0.9) contrast(1.05)";
const pop = (t: number, at: number, d = 0.14) => Math.max(0, Math.min(1, (t - at) / d));
const bob = (t: number, f: number, a: number, ph = 0) => Math.abs(S(t * f + ph)) * a;
const ease = (k: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
const back = (k: number) => { const c = 1.7; k = Math.max(0, Math.min(1, k)); return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const Black = () => <AbsoluteFill style={{ background: "#000" }} />;
const Rain: React.FC<{ o?: number }> = ({ o = 0.6 }) => { const t = useT();
  const drops = Array.from({ length: 140 }).map((_, i) => { const r1 = ((i * 9301 + 49297) % 233280) / 233280, r2 = ((i * 4271 + 1237) % 9973) / 9973;
    const sp = 1800 + r2 * 900, y = ((r1 * 2400 + t * sp) % 2400) - 240, x = ((r2 * 1500 - t * sp * 0.35) % 1500 + 1500) % 1500 - 200;
    return <line key={i} x1={x} y1={y} x2={x - 18} y2={y + 70 + r1 * 40} stroke="rgba(210,225,255,0.55)" strokeWidth={1.6 + r2 * 1.6} strokeLinecap="round" />; });
  return <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}><svg width={W} height={H}>{drops}</svg></AbsoluteFill>; };
const Lightning: React.FC<{ at: number; x?: number; k?: string }> = ({ at, x = 760, k = "FX01" }) => { const t = useT();
  return t > at && t < at + 0.18 ? <><Sprite k={k} x={x} y={520} w={700} z={0.3} blend="screen" /><Flash at={at} dur={0.15} max={0.55} color="#dfe8ff" /></> : null; };
const Whip: React.FC<{ at: number }> = ({ at }) => { const t = useT(); const k = 1 - Math.min(1, Math.max(0, (t - at) / 0.2));
  return k > 0 ? <AbsoluteFill style={{ backdropFilter: `blur(${k * 26}px)`, WebkitBackdropFilter: `blur(${k * 26}px)` }} /> : null; };
const Gull: React.FC<{ k: string; x: number; y: number; h: number; z?: number; eyes?: Eyes; rot?: number; flip?: boolean }> = (p) =>
  <Actor k={p.k} x={p.x} y={p.y} h={p.h} z={p.z ?? 1.1} rot={p.rot} flip={p.flip} eyes={p.eyes ?? { pupil: 1, seed: 77 }} />;

// ---------- map (parchment + coast + pin + route) ----------
const MapScene: React.FC<{ mode: "pin" | "zoomout" | "route" | "war" | "storm" }> = ({ mode }) => {
  const t = useT();
  const zoom = mode === "pin" ? kf(t, [[0, 2.2], [1.6, 2.0]]) : mode === "zoomout" ? kf(t, [[0, 2.0], [1.6, 1.0]]) : mode === "war" ? kf(t, [[0, 1.0], [1.4, 0.85]]) : 1.0;
  const cx = mode === "war" ? -40 : 0;
  const drop = ease(pop(t, 0.15, 0.35)), bounce = mode === "pin" ? (t > 0.5 && t < 0.75 ? S((t - 0.5) / 0.25 * PI) * 40 : 0) : 0;
  const route = mode === "route" ? Math.min(1, t / 1.6) : 1;
  const P = { x: 470, y: 760 }, R = { x: 500, y: 1150 };
  return <Scene cam={{ zoom, x: cx }} grade="saturate(1.0) contrast(1.04)">
    <Bg k="BG27" z={0.2} over={1.05} />
    <Depth z={1}>
      <Img src={staticFile("lighthouse/MP01.webp")} style={{ position: "absolute", left: 40, top: 430, width: 1000, opacity: 0.95, filter: "brightness(0.55) contrast(1.6)" }} />
      <Img src={staticFile("lighthouse/MP05.webp")} style={{ position: "absolute", left: 760, top: 1360, width: 260, opacity: 0.55 }} />
      <Img src={staticFile("lighthouse/MP02.webp")} style={{ position: "absolute", left: R.x - 60, top: R.y - 50, width: 120, opacity: 0.9 }} />
      {mode === "war" ? <Img src={staticFile("lighthouse/MP06.webp")} style={{ position: "absolute", left: lin(t, 0, 0.6, 1100, 380), top: 1450, width: 900, opacity: 0.95, filter: "brightness(0.55) contrast(1.6)" }} /> : null}
      {mode === "war" && t > 0.6 ? <Img src={staticFile("lighthouse/FX09.webp")} style={{ position: "absolute", left: 380, top: lin(t, 0.6, 1.5, 1350, 1250), width: 420, opacity: lin(t, 0.6, 1.6, 0.9, 0.3) }} /> : null}
      {mode === "storm" ? <Img src={staticFile("lighthouse/FX08.webp")} style={{ position: "absolute", left: lin(t, 0, 1.7, 700, 200), top: 900, width: 900, opacity: 0.85 }} /> : null}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {mode === "route" || mode === "zoomout" ? <path d={`M ${P.x} ${P.y} Q ${P.x - 140} ${(P.y + R.y) / 2} ${R.x} ${R.y}`} fill="none" stroke="#7a1d12" strokeWidth={9} strokeDasharray="22 16"
          pathLength={1} style={{ strokeDasharray: `${route} 1` }} strokeLinecap="round" /> : null}
        {mode === "route" ? <circle cx={P.x} cy={P.y} r={14} fill="#b3261e" stroke="#3a0d08" strokeWidth={4} /> : null}
      </svg>
      {mode === "route" ? (() => { const k = route; const x = (1 - k) * (1 - k) * P.x + 2 * (1 - k) * k * (P.x - 140) + k * k * R.x, y = (1 - k) * (1 - k) * P.y + 2 * (1 - k) * k * ((P.y + R.y) / 2) + k * k * R.y;
        return <Img src={staticFile("lighthouse/MP04.webp")} style={{ position: "absolute", left: x - 70, top: y - 80, width: 140, filter: "brightness(0.6)" }} />; })() : null}
      <Img src={staticFile("lighthouse/MP03.webp")} style={{ position: "absolute", left: R.x - 20, top: R.y - 175 - (1 - drop) * 500 - bounce, width: 170, opacity: drop > 0 ? 1 : 0 }} />
    </Depth>
    <Finish vignette={0.5} />
  </Scene>;
};

// 1 0.00 "You'd never wish" — tower in the storm, wave rising
const L1 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.5, 1.0, 1.1) }} grade={G_STORM} shake={4}>
    <Bg k="BG01" z={0.3} />
    <Sprite k="LT10" x={540} y={1250} w={520} z={0.6} />
    <Sprite k="WV04" x={540} y={lin(t, 0, 1.5, 1900, 1350)} w={1500} z={0.8} />
    <Rain /><Lightning at={0.3} />
    <Finish vignette={0.6} />
  </Scene>; };
// 2 1.50 "for the worst storm in history"
const L2 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.4, 1.05, 1.15), rot: wob(t, 3, 1) * 1.5 }} grade={G_STORM} shake={7}>
    <Bg k="BG20" z={0.3} />
    <Sprite k="FX08" x={lin(t, 0, 1.4, -100, 700)} y={700} w={1300} z={0.6} opacity={0.8} />
    <Sprite k="FX08" x={lin(t, 0, 1.4, 1200, 300)} y={1300} w={1100} z={0.8} opacity={0.7} />
    <Rain o={0.7} /><Lightning at={0.5} k="FX02" x={400} />
    <Finish vignette={0.6} />
  </Scene>; };
// 3 2.90 "But in 1703," — grinning at the sky
const L3 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.8, 1.08, 1.16) }} grade={G_STORM}>
    <Bg k="BG20" z={0.3} blur={4} />
    <Actor k="WN25" x={540} y={2000} h={1800} z={1} eyes={{ mood: "smug", lookY: -0.7, seed: 3, scale: 0.72 }} mouth="grin" />
    <Rain o={0.4} /><Lightning at={1.2} />
    <Finish vignette={0.55} />
  </Scene>; };
// 4 4.68 "one man did," — pointing at the sky, gull blown past
const L4 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_STORM} shake={3}>
    <Bg k="BG17" z={0.3} />
    <Actor k="WN23" x={520} y={1960} h={1650} z={1} eyes={{ mood: "neutral", lid: 0.2, seed: 4 }} mouth="grin" />
    <Gull k="GL05" x={lin(t, 0, 1.1, -200, 1300)} y={lin(t, 0, 1.1, 700, 500)} h={380} z={1.2} rot={lin(t, 0, 1.1, -20, 30)} eyes={{ mood: "panic", seed: 5 }} />
    <Rain o={0.5} />
    <Finish vignette={0.55} />
  </Scene>; };
// 5 5.82 "and nobody saw him" — the empty rock with iron bars
const L5 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.2, 1.0, 1.06) }} grade={G_GREY}>
    <Bg k="BG24" z={0.3} />
    <Sprite k="LT12" x={540} y={1330} w={760} z={0.6} />
    <Sprite k="WV12" x={lin(t, 0, 1.2, 300, 600)} y={1350} w={1200} z={0.8} opacity={0.6} />
    <Finish vignette={0.6} />
  </Scene>; };
// 6 7.00 "again." — gull alone on the bars
const L6 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.1, 1.05, 1.12) }} grade={G_GREY}>
    <Bg k="BG25" z={0.3} />
    <Sprite k="PR18" x={540} y={1250} w={700} z={0.8} />
    <Gull k="GL08" x={560} y={1290} h={420} z={0.85} eyes={{ mood: "sad", seed: 6 }} />
    <Finish vignette={0.65} />
  </Scene>; };
// 7 8.08 "It all starts with a rock." — pin drops
const L7 = () => <MapScene mode="pin" />;
// 8 10.48 "14 miles off the coast of England," — zoom out
const L8 = () => <MapScene mode="zoomout" />;
// 9 12.54 "a reef so low the sea swallows it" — tide comes over
const L9 = () => { const t = useT(); const k = Math.min(1, t / 1.4);
  return <Scene cam={{ zoom: lin(t, 0, 1.66, 1.0, 1.05) }} grade={G_DAY}>
    <Bg k="BG02" z={0.3} />
    <AbsoluteFill style={{ opacity: k }}><Bg k="BG03" z={0.3} /></AbsoluteFill>
    <Sprite k="WV14" x={540} y={lin(k, 0, 1, 2200, 1250)} w={1500} z={0.7} opacity={1 - Math.max(0, k - 0.8) * 5} />
    <Finish />
  </Scene>; };
// 10 14.20 "twice a day." — tide time-lapse
const L10 = () => { const t = useT(); const hi = Math.floor(t * 4) % 2 === 1;
  return <Scene cam={{ zoom: 1.05 }} grade={G_DAY}>
    <Bg k={hi ? "BG03" : "BG02"} z={0.3} />
    <AbsoluteFill style={{ background: `rgba(255,190,120,${0.12 + S(t * 6) * 0.1})`, mixBlendMode: "overlay" }} />
    <Finish />
  </Scene>; };
// 11 15.82 "For years," — ship sails in at night
const L11 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_STORM}>
    <Bg k="BG04" z={0.4} over={1.0} panX={-0.3} />
    <Sprite k="SH01" x={lin(t, 0, 0.66, -200, 420)} y={1150} w={700} z={0.7} rot={S(t * 4) * 2} filter="brightness(0.55)" />
    <Finish vignette={0.6} />
  </Scene>; };
// 12 16.48 "it had been tearing open ships"
const L12 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.1 }} grade={G_STORM} shake={lin(t, 0, 1.3, 14, 3)}>
    <Bg k="BG04" z={0.4} over={1.0} panX={0.1} />
    <Sprite k="SH14" x={560} y={1200} w={950} z={0.8} rot={lin(t, 0, 1.3, -3, 6)} />
    <Sprite k="WV06" x={600} y={lin(t, 0, 0.6, 1400, 1000)} w={800} z={0.9} opacity={0.9} />
    <Sprite k="FX06" x={600} y={1050} w={lin(t, 0, 0.5, 300, 900)} z={1} opacity={lin(t, 0.3, 0.9, 1, 0)} />
    <Flash at={0} dur={0.12} max={0.45} />
    <Finish vignette={0.6} />
  </Scene>; };
// 13 17.80 "in the dark." — sinking
const L13 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.06 }} grade={G_STORM} shake={2}>
    <Bg k="BG04" z={0.4} over={1.0} panX={0.4} />
    <Sprite k="SH03" x={540} y={lin(t, 0, 1.1, 1150, 1300)} w={900} z={0.8} rot={lin(t, 0, 1.1, 5, 14)} />
    <Lightning at={0.5} x={300} />
    <Finish vignette={0.65} />
  </Scene>; };
// 14 18.92 "One man had lost two of his own ships" — horrified at the window
const L14 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.7, 1.02, 1.1) }} grade={G_IN}>
    <Bg k="BG07" z={0.3} />
    <Actor k="WN02" x={560} y={1950} h={1650} z={1} shadow={0.4} eyes={{ mood: "shock", seed: 14 }} />
    <Finish vignette={0.5} />
  </Scene>; };
// 15 20.62 "to it," — engraving torn
const L15 = () => { const t = useT(); const k = ease(pop(t, 0.05, 0.4));
  return <Scene cam={{ zoom: 1.05 }} grade={G_IN}>
    <Bg k="BG07" z={0.3} blur={8} />
    <Depth z={1}>
      <div style={{ position: "absolute", left: 140 - k * 120, top: 650, width: 400, height: 560, overflow: "hidden", transform: `rotate(${-k * 14}deg)` }}><Img src={staticFile("lighthouse/PR02.webp")} style={{ width: 800, position: "absolute", left: 0, top: 0 }} /></div>
      <div style={{ position: "absolute", left: 540 + k * 120, top: 650, width: 400, height: 560, overflow: "hidden", transform: `rotate(${k * 14}deg)` }}><Img src={staticFile("lighthouse/PR02.webp")} style={{ width: 800, position: "absolute", left: -400, top: 0 }} /></div>
    </Depth>
    <Sprite k="FX18" x={540} y={900} w={lin(k, 0, 1, 200, 700)} z={1.1} opacity={k} />
    <Finish />
  </Scene>; };
// 16 21.22 "so he decided to do something" — scheming
const L16 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.6, 1.05, 1.12) }} grade={G_IN}>
    <Bg k="BG07" z={0.3} />
    <Actor k="WN30" x={540} y={1960} h={1650} z={1} eyes={{ mood: "scheming", seed: 16 }} mouth="smirk" />
    <Finish />
  </Scene>; };
// 17 22.80 "nobody had ever tried." — sketch, gull squawks at the window
const L17 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_IN}>
    <Bg k="BG07" z={0.3} />
    <Gull k="GL02" x={850} y={lin(pop(t, 0.6), 0, 1, 1500, 1050)} h={500} z={0.7} eyes={{ mood: "shock", seed: 17 }} />
    <Actor k="WN34" x={460} y={1950} h={1600} z={1} eyes={{ mood: "neutral", pupil: 1, browUp: 12, seed: 18 }} mouth="grin" />
    <Finish />
  </Scene>; };
// 18 24.70 "Build a lighthouse on it"
const L18 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.3, 1.04, 1.1) }} grade={G_IN}>
    <Bg k="BG05" z={0.3} blur={3} />
    <Actor k="WN20" x={420} y={1960} h={1650} z={1} eyes={{ mood: "neutral", pupil: 1, lookY: -0.6, seed: 19 }} mouth="O" />
    <Sprite k="PR03" x={780} y={lin(back(pop(t, 0.2, 0.3)), 0, 1, 1500, 900)} w={560} z={1.1} rot={-6} />
    {t > 0.5 ? <Sprite k="FX20" x={880} y={760} w={lin(t, 0.5, 0.8, 0, 240)} z={1.2} blend="screen" /> : null}
    <Finish />
  </Scene>; };
// 19 26.00 "with his own money." — money bag slam
const L19 = () => { const t = useT(); const slam = t > 0.35;
  return <Scene cam={{ zoom: slam ? 1.12 : 1.04 }} grade={G_IN} shake={slam && t < 0.6 ? 10 : 0}>
    <Bg k="BG07" z={0.3} />
    <Actor k="WN03" x={540} y={1960} h={1700} z={1} eyes={{ mood: "angry", seed: 20 }} mouth="grin" />
    <Sprite k="PR01" x={700} y={lin(pop(t, 0, 0.35), 0, 1, 900, 1560)} w={520} z={1.1} />
    <Flash at={0.35} dur={0.1} max={0.3} color="#ffe2a8" />
    <Finish />
  </Scene>; };
// 20 27.44 "His name was Henry Winstanley," — portrait + light sweep
const L20 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 2.8, 1.0, 1.1) }} grade={G_IN}>
    <Bg k="BG05" z={0.3} blur={6} />
    <Actor k="WN33" x={540} y={2000} h={1800} z={1} eyes={{ mood: "smug", seed: 21 }} mouth={{ lip: [27.44, 29.9], base: "smirk" }} />
    <AbsoluteFill style={{ background: `linear-gradient(110deg, rgba(255,240,200,0) ${lin(t, 0, 1.4, -20, 120) - 10}%, rgba(255,240,200,0.35) ${lin(t, 0, 1.4, -20, 120)}%, rgba(255,240,200,0) ${lin(t, 0, 1.4, -20, 120) + 10}%)`, mixBlendMode: "screen" }} />
    <Finish warm={0.12} />
  </Scene>; };
// 21 30.22 "an engraver,"
const L21 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.08 }} grade={G_IN}>
    <Bg k="BG05" z={0.3} />
    <Actor k="WN04" x={540} y={1960} h={1600} z={1} sx={1 + S(t * 25) * 0.003} eyes={{ mood: "scheming", lookY: 0.7, seed: 22 }} />
    <Sprite k="FX05" x={600} y={1250} w={220} z={1.1} opacity={S(t * 30) > 0 ? 0.9 : 0.3} blend="screen" />
    <Finish />
  </Scene>; };
// 22 31.02 "an inventor,"
const L22 = () => <Scene cam={{ zoom: 1.08 }} grade={G_IN}>
  <Bg k="BG05" z={0.3} />
  <Actor k="WN06" x={540} y={1960} h={1650} z={1} eyes={{ mood: "confused", seed: 23 }} mouth="huh" />
  <Finish />
</Scene>;
// 23 31.86 "a showman who ran a theatre of water tricks"
const L23 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 2.0, 1.0, 1.08) }} grade={G_IN}>
    <Bg k="BG06" z={0.3} />
    <Sprite k="PR04" x={300} y={1250} w={520} z={0.8} />
    {[0, 1, 2].map((i) => <Sprite key={i} k="FX17" x={240 + i * 60} y={900 - bob(t, 6, 80, i)} w={140} z={0.85} opacity={0.85} />)}
    <Actor k="WN05" x={680} y={1960} h={1550} z={1} sy={1 + bob(t, 4, 0.01)} eyes={{ mood: "neutral", lid: 0.2, seed: 24 }} mouth="grin" />
    <Finish warm={0.1} />
  </Scene>; };
// 24 33.84 "in London." — crowd claps
const L24 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_IN}>
    <Bg k="BG06" z={0.3} blur={4} />
    <Actor k="SP05" x={540} y={1950 - bob(t, 12, 12)} h={1000} z={1} eyes={{ mood: "neutral", lid: 0.2, seed: 25 }} mouth="grin" />
    <Finish />
  </Scene>; };
// 25 34.64 "Not an engineer." — confused + the gull judging
const L25 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.06 }} grade={G_IN}>
    <Bg k="BG05" z={0.3} />
    <Actor k="WN06" x={400} y={1960} h={1600} z={1} eyes={{ mood: "confused", seed: 26 }} mouth="huh" />
    <Gull k="GL01" x={850} y={1950} h={800} z={1.1} eyes={{ mood: "sideEye", lookX: -1, seed: 27 }} />
    <Finish />
  </Scene>; };
// 26 36.14 "In the summer of 1696," — route line
const L26 = () => <MapScene mode="route" />;
// 27 38.16 "he and his workers start rowing out"
const L27 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_DAY} shake={2}>
    <Bg k="BG09" z={0.4} over={1.0} panX={lin(t, 0, 1.34, -0.5, 0.0)} />
    <Actor k={["SH05", "SH06"]} fps={4} x={lin(t, 0, 1.34, 250, 700)} y={1500 + S(t * 4) * 15} h={620} z={0.9} rot={S(t * 3) * 2} eyes={{ mood: "neutral", seed: 28, scale: 1.4 }} />
    <Sprite k="WV09" x={lin(t, 0, 1.34, 520, 970)} y={1500} w={420} z={1.0} opacity={0.7} />
    <Finish />
  </Scene>; };
// 28 39.50 "from Plymouth."
const L28 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_DAY}>
    <Bg k="BG08" z={0.4} over={1.0} panX={lin(t, 0, 1.22, 0.2, 0.6)} />
    <Actor k={["SH05", "SH06"]} fps={4} x={lin(t, 0, 1.22, 400, 750)} y={1650} h={480} z={0.8} eyes={{ seed: 29, scale: 1.4 }} />
    <Finish />
  </Scene>; };
// 29 40.72 "They can only work at low tide" — hammering
const L29 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.06 }} grade={G_DAY}>
    <Bg k="BG11" z={0.3} />
    <Actor k={["WK03", "WK04"]} fps={5} x={540} y={1900} h={1350} z={1} eyes={{ mood: "angry", seed: 30 }} mouth="teeth" />
    {Math.floor(t * 5) % 2 === 1 ? <Sprite k="FX05" x={560} y={1650} w={420} z={1.1} blend="screen" /> : null}
    <Finish />
  </Scene>; };
// 30 42.66 "in calm weather," — supervising + gull
const L30 = () => <Scene cam={{ zoom: 1.05 }} grade={G_DAY}>
  <Bg k="BG11" z={0.3} />
  <Actor k="WN10" x={420} y={1960} h={1550} z={1} eyes={{ mood: "neutral", lookY: 0.6, seed: 31 }} mouth="smile" />
  <Gull k="GL07" x={850} y={1900} h={620} z={1.05} eyes={{ mood: "sideEye", seed: 32 }} />
  <Finish />
</Scene>;
// 31 43.12 "and the waves keep washing" — wave sweeps over workers
const L31 = () => { const t = useT(); const wk = t < 0.55 ? "WV01" : t < 0.85 ? "WV02" : "WV03";
  return <Scene cam={{ zoom: 1.04 }} grade={G_DAY} shake={t > 0.7 ? 8 : 2}>
    <Bg k="BG11" z={0.3} />
    <Actor k={t > 0.8 ? "WK05" : "WK06"} x={540} y={1950} h={t > 0.8 ? 800 : 760} z={0.9} eyes={{ mood: t > 0.8 ? "panic" : "dead", seed: 33 }} mouth={t > 0.8 ? "scream" : null} />
    <Sprite k={wk} x={lin(t, 0, 1.28, -300, 600)} y={1500} w={1500} z={1.1} />
    <Finish />
  </Scene>; };
// 32 44.40 "their work away." — knocked over, hat flies
const L32 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.06 }} grade={G_DAY} shake={6}>
    <Bg k="BG11" z={0.3} />
    <Actor k="WN08" x={540} y={1850} h={1400} z={1} rot={lin(t, 0, 1.2, 0, -8)} eyes={{ mood: "panic", seed: 34 }} mouth="scream" />
    <Sprite k="PR12" x={lin(t, 0, 1.2, 500, 950)} y={lin(t, 0, 1.2, 1100, 500)} w={300} z={1.1} rot={t * 400} />
    <Sprite k="WV09" x={400} y={1700} w={900} z={1.1} opacity={lin(t, 0, 0.8, 1, 0)} />
    <Finish />
  </Scene>; };
// 33 45.62 "That entire first summer," — top-down rock, sun sweep
const L33 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.6, 1.0, 1.05), rot: lin(t, 0, 1.6, 0, 6) }} grade={G_DAY}>
    <Bg k="BG10" z={0.3} />
    <AbsoluteFill style={{ background: `linear-gradient(${lin(t, 0, 1.6, 0, 180)}deg, rgba(255,200,120,0.25), rgba(0,0,0,0.25))`, mixBlendMode: "overlay" }} />
    <Finish />
  </Scene>; };
// 34 47.22 "all they manage" — exhausted
const L34 = () => <Scene cam={{ zoom: 1.05 }} grade={G_GOLD}>
  <Bg k="BG12" z={0.3} />
  <Actor k="WK06" x={540} y={1950} h={800} z={0.95} eyes={{ mood: "dead", seed: 35 }} mouth="wobble" />
  <Actor k="WN11" x={830} y={1980} h={900} z={1} eyes={{ mood: "sad", seed: 36 }} />
  <Finish warm={0.15} />
</Scene>;
// 35 48.30 "is 12 holes in the rock." — holes pop in, Jack counts
const L35 = () => { const t = useT(); const n = Math.min(12, Math.floor(t * 12 / 1.2));
  const holes = Array.from({ length: 12 }).map((_, i) => ({ x: 300 + (i % 4) * 160 + (Math.floor(i / 4) % 2) * 60, y: 700 + Math.floor(i / 4) * 200 }));
  return <Scene cam={{ zoom: 1.04 }} grade={G_DAY}>
    <Bg k="BG10" z={0.3} />
    <Depth z={0.5}><svg width={W} height={H} style={{ position: "absolute" }}>
      {holes.slice(0, n).map((h, i) => <g key={i}><ellipse cx={h.x} cy={h.y} rx={26} ry={22} fill="#120d0a" /><ellipse cx={h.x} cy={h.y - 4} rx={30} ry={26} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={4} /></g>)}
    </svg></Depth>
    {t > 1.0 ? <Actor k="WK07" x={540} y={lin(pop(t, 1.0, 0.15), 0, 1, 2700, 2000)} h={1100} z={1} eyes={{ mood: "sad", seed: 37 }} mouth="wobble" /> : null}
    <Finish />
  </Scene>; };
// 36 49.98 "Then it gets worse." — whip, shock turn
const L36 = () => <Scene cam={{ zoom: 1.08 }} grade={G_DAY}>
  <Bg k="BG11" z={0.3} blur={3} />
  <Actor k="WN12" x={540} y={1960} h={1650} z={1} eyes={{ mood: "shock", seed: 38 }} mouth="O" />
  <Whip at={0} />
  <Finish />
</Scene>;
// 37 51.78 "England is at war with France," — map war
const L37 = () => <MapScene mode="war" />;
// 38 53.44 "and in 1697," — privateer sails in, cannon smoke
const L38 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_DAY}>
    <Bg k="BG02" z={0.3} />
    <Sprite k="SH07" x={lin(t, 0, 1.4, 1300, 660)} y={1000} w={700} z={0.6} rot={S(t * 3) * 1.5} />
    {t > 0.7 ? <Sprite k="FX09" x={480} y={950} w={lin(t, 0.7, 1.4, 200, 500)} z={0.65} opacity={lin(t, 0.7, 1.4, 1, 0.3)} /> : null}
    <Finish />
  </Scene>; };
// 39 54.84 "a French privateer sails up," — captain points, laughs
const L39 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.06 }} grade={G_DAY}>
    <Bg k="BG13" z={0.3} />
    <Actor k={t < 0.9 ? "FP01" : "FP02"} x={500} y={1960} h={1650} z={1} eyes={{ mood: "scheming", seed: 39 }} mouth="grin" />
    <Finish />
  </Scene>; };
// 40 56.54 "smashes the work," — axes, planks fly
const L40 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_DAY} shake={8}>
    <Bg k="BG02" z={0.3} />
    <Sprite k="LT03" x={540} y={1200} w={700} z={0.7} rot={S(t * 20) * 2} />
    <Actor k={["FP03", "FP04"]} fps={6} x={540} y={1970} h={900} z={1} eyes={{ mood: "angry", seed: 40 }} mouth="teeth" />
    <Sprite k="PR07" x={lin(t, 0, 1.24, 500, 900)} y={lin(t, 0, 1.24, 1100, 700)} w={500} z={1.1} rot={t * 200} />
    <Sprite k="FX06" x={540} y={1300} w={700} z={1.05} opacity={0.8} />
    <Finish />
  </Scene>; };
// 41 57.78 "and drags Winstanley off" — carried off
const L41 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_DAY} shake={3}>
    <Bg k="BG02" z={0.3} />
    <Actor k="FP05" x={lin(t, 0, 1.22, 350, 750)} y={1900 - bob(t, 10, 15)} h={1000} z={1} eyes={{ mood: "angry", seed: 41 }} eyesEach={[{}, { mood: "panic" }, {}]} mouthEach={["grin", "scream", "grin"]} />
    <Sprite k="PR12" x={lin(t, 0, 1.22, 300, 120)} y={lin(t, 0, 1.22, 1300, 1900)} w={260} z={1.1} rot={t * 300} />
    <Finish />
  </Scene>; };
// 42 59.00 "to France as a prisoner." — cell, door slams
const L42 = () => { const t = useT(); const slam = t > 0.2;
  return <Scene cam={{ zoom: 1.06 }} grade={G_IN} shake={t > 0.2 && t < 0.4 ? 10 : 0}>
    <Bg k="BG14" z={0.3} />
    <Actor k="WN13" x={540} y={1950} h={1500} z={1} eyes={{ mood: "sad", seed: 42 }} mouth="frown" />
    {slam ? null : <Sprite k="PR09" x={lin(pop(t, 0, 0.2), 0, 1, -300, 300)} y={1300} w={700} z={1.2} />}
    <Flash at={0.2} dur={0.08} max={0.25} />
    <Finish vignette={0.6} />
  </Scene>; };
// 43 60.50 "The story goes that King Louis XIV" — sepia, reading
const L43 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.8, 1.0, 1.08) }} grade={G_SEPIA}>
    <Bg k="BG15" z={0.3} />
    <Actor k="LX01" x={540} y={1950} h={1550} z={1} eyes={{ mood: "neutral", lookY: 0.6, seed: 43 }} mouth="frown" />
    <Finish vignette={0.6} />
  </Scene>; };
// 44 62.30 "heard about it" — eyebrow up
const L44 = () => <Scene cam={{ zoom: 1.25, y: -400 }} grade={G_SEPIA}>
  <Bg k="BG15" z={0.3} blur={4} />
  <Actor k="LX01" x={540} y={1950} h={1550} z={1} eyes={{ mood: "confused", browUp: 14, seed: 44 }} mouth="huh" />
  <Finish vignette={0.6} />
</Scene>;
// 45 63.18 "and let him go," — wave, door opens, walks out
const L45 = () => { const t = useT(); const out = t > 0.45;
  return <Scene cam={{ zoom: 1.04 }} grade={G_SEPIA}>
    {!out ? <><Bg k="BG15" z={0.3} /><Actor k="LX02" x={540} y={1950} h={1550} z={1} eyes={{ mood: "neutral", lid: 0.2, seed: 45 }} mouth="smile" /></>
      : <><Bg k="BG16" z={0.3} /><Actor k={WALK} fps={10} x={lin(t, 0.45, 1.16, 300, 700)} y={1900} h={1450} z={1} eyes={{ mood: "smug", seed: 46 }} mouth="smirk" /></>}
    <Finish vignette={0.6} />
  </Scene>; };
// 46 64.34 "saying France was at war with England,"
const L46 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.8, 1.04, 1.1) }} grade={G_SEPIA}>
    <Bg k="BG15" z={0.3} />
    <Actor k="LX03" x={540} y={1960} h={1650} z={1} eyes={{ mood: "neutral", lid: 0.3, seed: 47 }} mouth={{ lip: [64.34, 67.4], base: "smile" }} />
    <Finish vignette={0.6} />
  </Scene>; };
// 47 66.14 "not with humanity." — bow, gull squawks
const L47 = () => <Scene cam={{ zoom: 1.05 }} grade={G_SEPIA}>
  <Bg k="BG16" z={0.3} />
  <Actor k="WN32" x={460} y={1960} h={1550} z={1} eyes={{ mood: "neutral", lid: 0.2, seed: 48 }} mouth="grin" />
  <Gull k="GL02" x={860} y={1950} h={700} z={1.05} eyes={{ mood: "shock", seed: 49 }} />
  <Finish vignette={0.6} />
</Scene>;
// 48 67.42 "So he goes straight back" — boat back
const L48 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_DAY}>
    <Bg k="BG09" z={0.4} over={1.0} panX={0.3} />
    <Sprite k="SH16" x={lin(t, 0, 1.18, 150, 700)} y={1450 + S(t * 4) * 12} w={700} z={0.8} rot={S(t * 3) * 2} />
    <Finish />
  </Scene>; };
// 49 68.60 "to his rock." — leap, then hug
const L49 = () => { const t = useT(); const hug = t > 0.55;
  return <Scene cam={{ zoom: 1.05 }} grade={G_DAY}>
    <Bg k="BG11" z={0.3} />
    {!hug ? <Actor k="WN15" x={lin(t, 0, 0.55, 100, 540)} y={lin(t, 0, 0.55, 1500, 1500) - S(t / 0.55 * PI) * 300} h={1100} z={1} anchorY="center" eyes={{ mood: "neutral", lid: 0.2, seed: 50 }} mouth="grin" />
      : <Actor k="WN16" x={540} y={1850} h={1100} z={1} eyes={{ mood: "neutral", lid: 0.5, seed: 51 }} mouth="smile" />}
    <Finish />
  </Scene>; };
// 50 69.84 "And in November 1698," — build sequence LT01 → LT04
const L50 = () => { const t = useT(); const st = Math.min(3, Math.floor(t / 0.5)); const k = ["LT01", "LT02", "LT03", "LT04"][st];
  const sp = 1 + Math.max(0, 0.08 - ((t % 0.5) * 0.4));
  return <Scene cam={{ zoom: 1.03 }} grade={G_GOLD}>
    <Bg k="BG03" z={0.3} filter="sepia(0.2)" />
    <Sprite k={k} x={540} y={1250} w={900} z={0.7} sy={sp} origin="50% 100%" />
    <Sprite k="FX11" x={540} y={1550} w={900} z={0.8} opacity={Math.max(0, 0.7 - (t % 0.5) * 2)} />
    {st === 2 ? <Actor k="WK12" x={180} y={1950} h={900} z={1} eyes={{ seed: 52 }} /> : null}
    {st === 3 ? <Actor k="WK08" x={540} y={2000} h={700} z={1} eyes={{ mood: "neutral", lid: 0.2, seed: 53 }} mouth="grin" /> : null}
    <Finish warm={0.1} />
  </Scene>; };
// 51 71.88 "the light finally shines." — night, beam sweeps
const L51 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 2.1, 1.0, 1.08) }} grade={G_STORM}>
    <Bg k="BG18" z={0.3} />
    <Sprite k="LT05" x={540} y={1250} w={900} z={0.7} />
    <Sprite k="FX04" x={540 + S(t * 2) * 300} y={800} w={1100} z={0.75} blend="screen" opacity={0.85} flip={S(t * 2) < 0} />
    <Sprite k="FX03" x={540} y={810} w={260} z={0.72} blend="screen" opacity={0.8 + S(t * 20) * 0.1} />
    <Finish vignette={0.6} />
  </Scene>; };
// 52 73.98 "Candles" — lighting candles
const L52 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.06 }} grade={G_IN}>
    <Bg k="BG28" z={0.3} />
    <Actor k="WN17" x={400} y={1960} h={1550} z={1} eyes={{ mood: "neutral", lid: 0.2, seed: 54 }} mouth="smile" />
    <Sprite k="PR11" x={820} y={1300} w={420} z={1.05} />
    <Sprite k="FX03" x={815} y={1080} w={300} z={1.06} blend="screen" opacity={0.9 + S(t * 25) * 0.1} />
    <Finish warm={0.2} />
  </Scene>; };
// 53 75.00 "on a wooden tower"
const L53 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.0, 1.6, 1.4), y: -500 }} grade={G_STORM}>
    <Bg k="BG18" z={0.2} />
    <Sprite k="LT05" x={540} y={1250} w={900} z={0.7} />
    <Finish vignette={0.6} />
  </Scene>; };
// 54 76.00 "in the middle of the sea." — pull out
const L54 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.44, 1.5, 0.95) }} grade={G_STORM}>
    <Bg k="BG18" z={0.9} over={1.6} />
    <Sprite k="LT05" x={540} y={1180} w={360} z={0.9} />
    <Sprite k="FX03" x={540} y={1060} w={140} z={0.92} blend="screen" />
    <Finish vignette={0.55} />
  </Scene>; };
// 55 77.44 "That first winter," — storm on the first tower
const L55 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_STORM} shake={4}>
    <Bg k="BG26" z={0.3} />
    <Sprite k="LT05" x={540} y={1250} w={850} z={0.7} rot={wob(t, 3, 2) * 0.5} />
    <Sprite k="WV07" x={lin(t, 0, 1.08, -200, 700)} y={1300} w={1100} z={0.8} opacity={0.8} />
    <Rain /><Lightning at={0.6} />
    <Finish vignette={0.6} />
  </Scene>; };
// 56 78.52 "the waves climb right over the top" — wave rises, pours
const L56 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_STORM} shake={lin(t, 0, 1.28, 4, 12)}>
    <Bg k="BG26" z={0.3} />
    <Sprite k="LT05" x={540} y={1250} w={850} z={0.7} />
    <Sprite k="WV04" x={540} y={lin(t, 0, 1.28, 2300, 1000)} w={1600} z={0.8} />
    {t > 0.9 ? <Sprite k="WV10" x={540} y={600} w={1000} z={0.85} opacity={0.9} /> : null}
    <Rain />
    <Finish vignette={0.6} />
  </Scene>; };
// 57 79.80 "and bury the lantern," — lantern vanishes; WN drenched insert
const L57 = () => { const t = useT(); const ins = t > 0.9;
  return <Scene cam={{ zoom: 1.08 }} grade={G_STORM} shake={6}>
    <Bg k="BG26" z={0.3} />
    {!ins ? <><Sprite k="LT05" x={540} y={1250} w={850} z={0.7} /><Sprite k="WV07" x={540} y={lin(t, 0, 0.9, 900, 500)} w={1500} z={0.85} /><Sprite k="WV06" x={540} y={650} w={900} z={0.86} /></>
      : <Actor k="WN19" x={540} y={1960} h={1600} z={1} eyes={{ mood: "panic", seed: 55 }} mouth="scream" />}
    <Rain />
    <Finish vignette={0.6} />
  </Scene>; };
// 58 81.46 "so he wraps the whole tower" — scaffold rising, hammering
const L58 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_GOLD}>
    <Bg k="BG12" z={0.3} />
    <Sprite k="LT06" x={680} y={lin(t, 0, 1.74, 1350, 1250)} w={800} z={0.7} />
    <Actor k="WN35" x={290} y={1980} h={1250} z={1} sy={1 + S(t * 18) * 0.008} eyes={{ mood: "angry", lookY: 0.6, seed: 56 }} />
    <Finish warm={0.15} />
  </Scene>; };
// 59 83.20 "inside a bigger one," — grows, stone carried
const L59 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_GOLD}>
    <Bg k="BG12" z={0.3} />
    <Sprite k="LT07" x={540} y={1300} w={lin(back(pop(t, 0, 0.5)), 0, 1, 600, 850)} z={0.7} origin="50% 100%" />
    <Actor k="WK12" x={lin(t, 0, 0.98, 200, 360)} y={1980} h={1100} z={1} eyes={{ mood: "angry", seed: 57 }} mouth="teeth" />
    <Finish warm={0.15} />
  </Scene>; };
// 60 84.18 "taller," — stretch up
const L60 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.02 }} grade={G_GOLD}>
    <Bg k="BG12" z={0.3} />
    <Sprite k="LT07" x={540} y={1300} w={850} z={0.7} sy={lin(t, 0, 0.5, 0.85, 1.12)} origin="50% 100%" />
    <Finish warm={0.15} />
  </Scene>; };
// 61 84.82 "thicker," — widen
const L61 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.02 }} grade={G_GOLD}>
    <Bg k="BG12" z={0.3} />
    <Sprite k="LT07" x={540} y={1300} w={lin(t, 0, 0.25, 850, 980)} z={0.7} sy={1.12 * 850 / lin(t, 0, 0.25, 850, 980)} origin="50% 100%" />
    <Finish warm={0.15} />
  </Scene>; };
// 62 85.10 "and because he's a showman," — arms wide
const L62 = () => <Scene cam={{ zoom: 1.05 }} grade={G_GOLD}>
  <Bg k="BG12" z={0.3} />
  <Actor k="WN05" x={540} y={1960} h={1600} z={1} eyes={{ mood: "neutral", lid: 0.2, seed: 58 }} mouth="grin" />
  <Finish warm={0.2} />
</Scene>;
// 63 86.68 "covered in carvings," — carving pops on
const L63 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_GOLD}>
    <Bg k="BG12" z={0.3} blur={3} />
    <Actor k="WK13" x={420} y={1980} h={1600} z={1} eyes={{ mood: "scheming", seed: 59 }} />
    <Sprite k="PR21" x={800} y={900} w={lin(back(pop(t, 0.3, 0.3)), 0, 1, 0, 420)} z={1.1} />
    <Finish warm={0.15} />
  </Scene>; };
// 64 87.92 "ironwork," — palace tower, glint
const L64 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.2, y: -300 }} grade={G_DAY}>
    <Bg k="BG03" z={0.2} />
    <Sprite k="LT08" x={540} y={1250} w={900} z={0.7} />
    <Sprite k="FX20" x={330} y={720} w={lin(t, 0.1, 0.4, 0, 260)} z={0.8} blend="screen" />
    <Finish />
  </Scene>; };
// 65 88.60 "and an open balcony." — waving from the balcony
const L65 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_DAY}>
    <Bg k="BG03" z={0.3} />
    <Sprite k="LT08" x={540} y={2600} w={2200} z={0.8} />
    <Actor k="WN21" x={560} y={1350} h={900} z={0.82} rot={S(t * 8) * 2} eyes={{ mood: "neutral", lid: 0.2, seed: 60 }} mouth="grin" />
    <Finish />
  </Scene>; };
// 66 90.02 "A palace on a rock." — golden hero shot, gulls
const L66 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.82, 1.0, 1.08) }} grade={G_GOLD}>
    <Bg k="BG12" z={0.3} />
    <Sprite k="LT09" x={540} y={1250} w={950} z={0.7} />
    {[0, 1].map((i) => <Actor key={i} k={["GL03", "GL04"]} fps={5} cycleStart={i * 0.1} x={lin(t, 0, 1.82, 100 + i * 700, 400 + i * 600)} y={500 + i * 150} h={200} z={0.9} />)}
    <Finish warm={0.25} />
  </Scene>; };
// 67 91.84 "For five years," — ship passes, beam
const L67 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_GOLD}>
    <Bg k="BG18" z={0.3} />
    <Sprite k="LT10" x={300} y={1150} w={500} z={0.5} filter="brightness(0.8)" />
    <Sprite k="FX04" x={300 + 420} y={915} w={840} z={0.55} blend="screen" opacity={0.75} />
    <Sprite k="SH11" x={lin(t, 0, 1.18, 1300, 700)} y={1300} w={700} z={0.7} />
    <Finish vignette={0.55} />
  </Scene>; };
// 68 93.02 "it works." — thumbs up
const L68 = () => <Scene cam={{ zoom: 1.08 }} grade={G_DAY}>
  <Bg k="BG03" z={0.3} blur={5} />
  <Actor k="WN29" x={540} y={1980} h={1700} z={1} eyes={{ mood: "smug", lid: 0.9, seed: 61 }} mouth="smirk" />
  <Finish />
</Scene>;
// 69 94.04 "Ships finally have a light to steer by,"
const L69 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_GOLD}>
    <Bg k="BG18" z={0.3} />
    <Sprite k="LT10" x={760} y={1100} w={420} z={0.5} filter="brightness(0.85)" />
    <Sprite k="FX04" x={760 - 360} y={895} w={720} z={0.55} blend="screen" opacity={0.75} flip />
    <Sprite k="SH11" x={lin(t, 0, 2.38, -200, 500)} y={1350} w={620} z={0.7} />
    <Sprite k="SH01" x={lin(t, 0, 2.38, 1250, 900)} y={1220} w={420} z={0.6} filter="brightness(0.6)" />
    <Finish vignette={0.55} />
  </Scene>; };
// 70 96.42 "but people keep warning him."
const L70 = () => <Scene cam={{ zoom: 1.05 }} grade={G_DAY}>
  <Bg k="BG19" z={0.3} />
  <Actor k="FD01" x={540} y={1960} h={1500} z={1} eyes={{ mood: "panic", seed: 62 }} mouth="O" />
  <Finish />
</Scene>;
// 71 98.20 "One day," — finger wag
const L71 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.1 }} grade={G_DAY}>
    <Bg k="BG19" z={0.3} blur={3} />
    <Actor k="FD02" x={540} y={1980} h={1700} z={1} rot={S(t * 18) * 1.5} eyes={{ mood: "angry", seed: 63 }} mouth={{ lip: [98.2, 99.0], base: "frown" }} />
    <Finish />
  </Scene>; };
// 72 98.98 "the sea will take it," — battered tower, wave rises
const L72 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_STORM} shake={4}>
    <Bg k="BG26" z={0.3} />
    <Sprite k="LT10" x={540} y={1250} w={850} z={0.7} />
    <Sprite k="WV04" x={540} y={lin(t, 0, 1.3, 2300, 1400)} w={1500} z={0.8} />
    <Rain />
    <Finish vignette={0.6} />
  </Scene>; };
// 73 100.28 "and his answer became famous." — dismissive wave
const L73 = () => <Scene cam={{ zoom: 1.05 }} grade={G_DAY}>
  <Bg k="BG19" z={0.3} />
  <Actor k="FD04" x={250} y={1700} h={900} z={0.8} eyes={{ mood: "sad", seed: 64 }} />
  <Actor k="WN22" x={680} y={1980} h={1600} z={1} eyes={{ mood: "smug", seed: 65 }} mouth="smirk" />
  <Finish />
</Scene>;
// 74 102.62 "He said he only wished he could be inside it"
const L74 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 2.22, 1.02, 1.1) }} grade={G_STORM}>
    <Bg k="BG20" z={0.3} />
    <Actor k="WN23" x={540} y={1980} h={1650} z={1} eyes={{ mood: "neutral", lid: 0.2, seed: 66 }} mouth={{ lip: [102.62, 104.84], base: "grin" }} />
    <Finish vignette={0.55} />
  </Scene>; };
// 75 104.84 "during the greatest storm that ever blew," — grin close-up, lightning
const L75 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 2.58, 1.05, 1.18) }} grade={G_STORM}>
    <Bg k="BG20" z={0.3} blur={3} />
    <Actor k="WN25" x={540} y={2000} h={1800} z={1} eyes={{ mood: "smug", lookY: -0.6, seed: 67, scale: 0.72 }} mouth={{ lip: [104.84, 107.42], base: "grin" }} />
    <Lightning at={1.6} x={300} />
    <Finish vignette={0.55} />
  </Scene>; };
// 76 107.42 "just to see what it would do." — laughing, gull horrified
const L76 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_DAY} shake={2}>
    <Bg k="BG19" z={0.3} />
    <Actor k="WN36" x={420} y={1980} h={1600} z={1} sy={1 + bob(t, 12, 0.012)} eyes={{ mood: "neutral", lid: 0.2, seed: 68 }} mouth="A" />
    <Gull k="GL02" x={870} y={1960} h={760} z={1.05} eyes={{ mood: "shock", seed: 69 }} />
    <Finish />
  </Scene>; };
// 77 109.38 "In November 1703," — map with storm clouds
const L77 = () => <MapScene mode="storm" />;
// 78 111.16 "he rows out to repair it"
const L78 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_GREY + " brightness(0.92)"}>
    <Bg k="BG09" z={0.4} over={1.0} panX={-0.2} filter="saturate(0.6) brightness(0.85)" />
    <Sprite k="SH12" x={lin(t, 0, 1.44, 200, 700)} y={1450 + S(t * 4) * 15} w={800} z={0.8} rot={S(t * 3) * 3} />
    <Finish vignette={0.55} />
  </Scene>; };
// 79 112.60 "with his workers"
const L79 = () => <Scene cam={{ zoom: 1.05 }} grade={G_GREY}>
  <Bg k="BG24" z={0.3} />
  <Actor k="WK11" x={540} y={1960} h={900} z={1} eyes={{ mood: "panic", lookY: -0.8, seed: 70 }} mouth="wobble" />
  <Finish vignette={0.55} />
</Scene>;
// 80 113.18 "and the keepers,"
const L80 = () => <Scene cam={{ zoom: 1.05 }} grade={G_GREY}>
  <Bg k="BG24" z={0.3} />
  <Actor k="KP01" x={540} y={1960} h={1300} z={1} eyes={{ mood: "sad", seed: 71 }} mouth="wobble" />
  <Finish vignette={0.55} />
</Scene>;
// 81 113.96 "and on the night of the 26th," — clouds roll over the tower
const L81 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 2.18, 1.0, 1.08) }} grade={G_STORM} shake={3}>
    <Bg k="BG17" z={0.3} />
    <Sprite k="LT10" x={540} y={1150} w={780} z={0.6} />
    <Sprite k="FX08" x={lin(t, 0, 2.18, 1400, 400)} y={450} w={1500} z={0.7} opacity={0.9} />
    <Rain o={0.5} />
    <Finish vignette={0.6} />
  </Scene>; };
// 82 116.14 "he gets his wish." — at the lantern window, the wave outside
const L82 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.52, 1.04, 1.14) }} grade={G_STORM} shake={lin(t, 0, 1.52, 2, 10)}>
    <Bg k="BG28" z={0.3} />
    <Sprite k="WV04" x={540} y={lin(t, 0, 1.52, 1800, 900)} w={1300} z={0.35} opacity={0.85} />
    <Actor k="WN26" x={540} y={2000} h={1700} z={1} eyes={{ mood: "shock", seed: 72 }} mouth="O" />
    <Lightning at={0.9} x={800} />
    <Finish vignette={0.6} />
  </Scene>; };
// 83 117.66 "The worst storm ever recorded in Britain" — sky chaos
const L83 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.54, 1.05, 1.15), rot: wob(t, 4, 3) * 2 }} grade={G_STORM} shake={12}>
    <Bg k="BG20" z={0.3} />
    <Sprite k="FX08" x={lin(t, 0, 1.54, 1300, -100)} y={800} w={1400} z={0.6} opacity={0.85} />
    <Rain o={0.8} /><Lightning at={0.2} k="FX02" x={300} /><Lightning at={1.0} />
    <Finish vignette={0.6} />
  </Scene>; };
// 84 119.20 "tears across the country." — windmill, trees, roof
const L84 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_STORM} shake={9}>
    <Bg k="BG21" z={0.4} over={1.0} panX={lin(t, 0, 1.44, -0.5, 0.4)} />
    <Sprite k="PR15" x={200} y={1350} w={600} z={0.6} rot={S(t * 7) * 6} origin="50% 100%" />
    <Sprite k="PR14" x={720} y={1250} w={550} z={0.65} rot={S(t * 5) * 3} />
    <Sprite k="PR16" x={500} y={1650} w={650} z={0.8} />
    <Sprite k="FX15" x={lin(t, 0, 1.44, 300, 1000)} y={lin(t, 0, 1.44, 1450, 1000)} w={600} z={0.9} />
    <Sprite k="FX07" x={lin(t, 0, 1.44, -100, 1200)} y={900} w={800} z={1.1} />
    <Rain />
    <Finish vignette={0.6} />
  </Scene>; };
// 85 120.64 (wind) — people leaning into it
const L85 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_STORM} shake={7}>
    <Bg k="BG19" z={0.3} filter="brightness(0.5) saturate(0.7)" />
    <Actor k="SP06" x={540 + S(t * 9) * 12} y={1960} h={1000} z={1} rot={-4} eyes={{ mood: "panic", seed: 73 }} mouth="scream" />
    <Sprite k="FX07" x={lin(t, 0, 1.04, -100, 1200)} y={1000} w={700} z={1.1} />
    <Rain />
    <Finish vignette={0.6} />
  </Scene>; };
// 86 121.68 "Thirteen Navy warships go down,"
const L86 = () => { const t = useT(); const sink = t > 1.5;
  return <Scene cam={{ zoom: 1.05 }} grade={G_STORM} shake={8}>
    <Bg k="BG22" z={0.4} over={1.0} panX={lin(t, 0, 2.3, -0.4, 0.4)} />
    {!sink ? <Actor k={["SH08", "SH09"]} fps={3} face={false} x={540} y={1550 + S(t * 3) * 40} h={760} z={0.8} />
      : <Sprite k="SH10" x={540} y={lin(t, 1.5, 2.3, 1300, 1450)} w={1000} z={0.8} />}
    <Sprite k="WV07" x={lin(t, 0, 2.3, 1200, -200)} y={1600} w={1200} z={0.9} opacity={0.8} />
    <Rain /><Lightning at={0.8} x={300} />
    <Finish vignette={0.6} />
  </Scene>; };
// 87 123.98 "thousands of people die." — black sea, slow push
const L87 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.76, 1.0, 1.06) }} grade={G_STORM + " brightness(0.75)"}>
    <Bg k="BG26" z={0.3} />
    <Rain o={0.4} />
    <Finish vignette={0.75} />
  </Scene>; };
// 88 125.74 "The next morning," — grey dawn
const L88 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 0.88, 1.0, 1.04) }} grade={G_GREY}>
    <Bg k="BG23" z={0.3} />
    <Sprite k="WV12" x={lin(t, 0, 0.88, 300, 600)} y={1100} w={1400} z={0.6} opacity={0.6} />
    <Finish vignette={0.55} />
  </Scene>; };
// 89 126.62 "people on the shore look out to sea."
const L89 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 2.14, 1.0, 1.06) }} grade={G_GREY}>
    <Bg k="BG23" z={0.3} />
    <Actor k="SP01" x={540} y={1980} h={1300} z={1} />
    <Finish vignette={0.55} />
  </Scene>; };
// 90 128.76 "Through the telescope," — raising it
const L90 = () => <Scene cam={{ zoom: 1.06 }} grade={G_GREY}>
  <Bg k="BG23" z={0.3} />
  <Actor k="SP02" x={540} y={1980} h={1700} z={1} eyes={{ mood: "neutral", seed: 74 }} />
  <Finish vignette={0.55} />
</Scene>;
// 91 129.96 "there is nothing there." — telescope mask
const L91 = () => { const t = useT(); const r = 430;
  return <Scene cam={{ zoom: 1.0, x: wob(t, 2, 4) * 30 }} grade={G_GREY}>
    <Bg k="BG24" z={1} over={1.4} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${540 + wob(t, 2, 5) * 20}px 960px, rgba(0,0,0,0) ${r - 25}px, rgba(4,8,14,1) ${r + 15}px)` }} />
  </Scene>; };
// 92 131.54 "No tower,"
const L92 = () => <Scene cam={{ zoom: 1.04 }} grade={G_GREY}>
  <Bg k="BG25" z={0.3} />
  <Sprite k="LT12" x={540} y={1250} w={800} z={0.6} />
  <Finish vignette={0.6} />
</Scene>;
// 93 132.44 "no light," — glow fades on black
const L93 = () => { const t = useT();
  return <Scene cam={{ zoom: 1 }}>
    <Black />
    <Sprite k="FX03" x={540} y={900} w={500} z={1} blend="screen" opacity={lin(t, 0, 0.9, 1, 0)} />
  </Scene>; };
// 94 133.42 "just a few bent iron bars" — close, dripping
const L94 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.58, 1.1, 1.18) }} grade={G_GREY}>
    <Bg k="BG25" z={0.3} blur={6} />
    <Sprite k="PR18" x={540} y={1100} w={1000} z={0.9} />
    <Sprite k="WV13" x={540} y={lin(t, 0, 1.58, 700, 760)} w={800} z={0.95} opacity={0.7} />
    <Finish vignette={0.6} />
  </Scene>; };
// 95 135.00 "sticking out of the rock." — wide, gull on one leg
const L95 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.74, 1.0, 1.05) }} grade={G_GREY}>
    <Bg k="BG25" z={0.3} />
    <Sprite k="LT12" x={540} y={1250} w={800} z={0.6} />
    <Gull k="GL07" x={640} y={1180} h={300} z={0.62} eyes={{ mood: "sad", seed: 75 }} />
    <Finish vignette={0.6} />
  </Scene>; };
// 96 136.74 "Henry Winstanley and the men inside" — portrait fading in sepia
const L96 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.46, 1.0, 1.05) }} grade={G_SEPIA + " brightness(0.9)"}>
    <Black />
    <AbsoluteFill style={{ opacity: kf(t, [[0, 0], [0.3, 1], [1.2, 1], [1.46, 0.2]]) }}>
      <Actor k="WN33" x={540} y={2000} h={1800} z={1} />
    </AbsoluteFill>
    <Finish vignette={0.7} />
  </Scene>; };
// 97 138.20 "were never found." — the shore, no eyes, grey
const L97 = () => { const t = useT(); const second = t > 0.95;
  return <Scene cam={{ zoom: 1.04 }} grade={G_GREY}>
    <Bg k="BG23" z={0.3} />
    <Actor k={second ? "SP04" : "SP03"} x={540} y={1980} h={1650} z={1} />
    <Finish vignette={0.65} />
  </Scene>; };
// 98 140.08 "And just days later," — night rain
const L98 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.56, 1.0, 1.05) }} grade={G_STORM + " brightness(0.8)"}>
    <Bg k="BG26" z={0.3} />
    <Rain o={0.5} />
    <Finish vignette={0.7} />
  </Scene>; };
// 99 141.64 "a ship sailing home in the dark" — bow at camera, lantern swinging
const L99 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.66, 1.0, 1.12) }} grade={G_STORM + " brightness(0.85)"}>
    <Bg k="BG26" z={0.3} />
    <Sprite k="SH13" x={540} y={lin(t, 0, 1.66, 1150, 1250)} w={lin(t, 0, 1.66, 800, 1300)} z={0.8} rot={S(t * 2) * 3} />
    <Sprite k="PR20" x={260} y={700} w={260} z={1.1} rot={S(t * 3) * 14} origin="50% 0%" />
    <Rain o={0.5} />
    <Finish vignette={0.7} />
  </Scene>; };
// 100 143.30 "hit that same rock" — smash
const L100 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.1 }} grade={G_STORM} shake={lin(t, 0, 1.3, 18, 3)}>
    <Bg k="BG17" z={0.3} />
    <Sprite k="SH14" x={540} y={1150} w={1050} z={0.8} rot={lin(t, 0, 1.3, 0, 8)} />
    <Sprite k="FX06" x={540} y={1100} w={lin(t, 0, 0.6, 400, 1200)} z={0.9} opacity={lin(t, 0.3, 1.0, 1, 0)} />
    <Sprite k="WV06" x={600} y={1000} w={900} z={0.85} />
    <Flash at={0} dur={0.12} max={0.6} />
    <Finish vignette={0.6} />
  </Scene>; };
// 101 144.60 "because there was no light anymore." — black, then the gull alone
const L101 = () => { const t = useT(); const end = t > 1.4;
  return end ? <Scene cam={{ zoom: lin(t, 1.4, 3.4, 1.0, 1.08) }} grade={G_GREY}>
    <Bg k="BG25" z={0.3} />
    <Sprite k="LT12" x={540} y={1250} w={800} z={0.6} />
    <Gull k="GL08" x={600} y={1200} h={300} z={0.62} eyes={{ mood: "sad", seed: 76 }} />
    <AbsoluteFill style={{ background: "#000", opacity: lin(t, 1.4, 1.8, 1, 0) + lin(t, 3.0, 3.4, 0, 1) }} />
    <Finish vignette={0.7} />
  </Scene> : <Black />; };

export const SHOTS = [L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13, L14, L15, L16, L17, L18, L19, L20, L21, L22, L23, L24, L25, L26, L27, L28, L29, L30,
  L31, L32, L33, L34, L35, L36, L37, L38, L39, L40, L41, L42, L43, L44, L45, L46, L47, L48, L49, L50, L51, L52, L53, L54, L55, L56, L57, L58, L59, L60,
  L61, L62, L63, L64, L65, L66, L67, L68, L69, L70, L71, L72, L73, L74, L75, L76, L77, L78, L79, L80, L81, L82, L83, L84, L85, L86, L87, L88, L89, L90,
  L91, L92, L93, L94, L95, L96, L97, L98, L99, L100, L101];
export const CUTS = [0, 1.5, 2.9, 4.68, 5.82, 7.0, 8.08, 10.48, 12.54, 14.2, 15.82, 16.48, 17.8, 18.92, 20.62, 21.22, 22.8, 24.7, 26.0, 27.44,
  30.22, 31.02, 31.86, 33.84, 34.64, 36.14, 38.16, 39.5, 40.72, 42.66, 43.12, 44.4, 45.62, 47.22, 48.3, 49.98, 51.78, 53.44, 54.84, 56.54,
  57.78, 59.0, 60.5, 62.3, 63.18, 64.34, 66.14, 67.42, 68.6, 69.84, 71.88, 73.98, 75.0, 76.0, 77.44, 78.52, 79.8, 81.46, 83.2, 84.18,
  84.82, 85.1, 86.68, 87.92, 88.6, 90.02, 91.84, 93.02, 94.04, 96.42, 98.2, 98.98, 100.28, 102.62, 104.84, 107.42, 109.38, 111.16, 112.6, 113.18,
  113.96, 116.14, 117.66, 119.2, 120.64, 121.68, 123.98, 125.74, 126.62, 128.76, 129.96, 131.54, 132.44, 133.42, 135.0, 136.74, 138.2, 140.08, 141.64, 143.3, 144.6];
export const END = 148.0;
export { Img, staticFile, Depth };
