// Caesar & the pirates: 85 shots, timed to the creator's VO at 1.10x. Each shot gets local time t.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Actor, Bg, Depth, Finish, Flash, Scene, Sprite, kf, lin, useT, wob, W, H, type Eyes } from "./lib";

const S = Math.sin, PI = Math.PI;
const GLOW: Eyes = { mood: "glow", seed: 3 };
const WALK = ["HE10", "HE11", "HE12", "HE13", "HE14", "HE15"];
const GAL = ["GA1", "GA2", "GA3", "GA4", "GA5", "GA6"];
const FIRE = ["FX01", "FX02", "FX03"];
const G_DAY = "saturate(1.08) contrast(1.06)";
const G_NIGHT = "saturate(1.12) contrast(1.1) brightness(0.9)";
const G_GOLD = "saturate(1.12) contrast(1.06)";
const G_STORM = "saturate(0.9) contrast(1.1) brightness(0.95)";
const G_TORCH = "saturate(1.1) contrast(1.15) brightness(0.88)";
const G_DUSK = "saturate(1.15) contrast(1.12) brightness(0.9)";

// helpers
const pop = (t: number, at: number, d = 0.14) => Math.max(0, Math.min(1, (t - at) / d)); // 0..1 appear
const overshoot = (k: number) => k <= 0 ? 0 : k >= 1 ? 1 : 1 + 0.25 * S(k * PI) - 0.0 * k; // squash-pop scale
const bob = (t: number, f: number, a: number, ph = 0) => Math.abs(S(t * f + ph)) * a;
const Fire: React.FC<{ x: number; y: number; w: number; z?: number }> = ({ x, y, w, z = 0.5 }) => {
  const t = useT(); const k = FIRE[Math.floor(t * 9) % 3];
  return <><Sprite k={k} x={x} y={y} w={w} z={z} blend="screen" opacity={0.95} sy={1 + S(t * 13) * 0.05} />
    <Sprite k="FX04" x={x} y={y - w * 0.4 - (t * 120) % 80} w={w * 0.9} z={z} blend="screen" opacity={0.6} /></>;
};
const Black = () => <AbsoluteFill style={{ background: "#000" }} />;

// 1 0.0 "You think you know the worst hostage" — captain in despair
const S1 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.6, 1.0, 1.08) }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} />
    <Sprite k="PR12" x={180} y={1560} w={620} z={0.7} />
    <Actor k={t < 0.8 ? "CA01" : "CA02"} x={560} y={1880} h={1560} z={1} shadow={0.5} rot={t < 0.8 ? wob(t, 3, 1) * 2 : S(t * 18) * 2} eyes={{ mood: "sad", seed: 1 }} mouth={t < 0.8 ? "wobble" : "teeth"} />
    <Finish />
  </Scene>; };
// 2 1.6 "in history" — crew glares, hero sips, refill
const S2 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.6, 1.04, 1.1) }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} />
    <Actor k="PG01" x={540} y={1320} h={760} z={0.7} shadow={0.3} eyes={{ mood: "angry", seed: 2 }} mouth="frown" />
    <Actor k={t < 0.8 ? "HE01" : "HE02"} x={560} y={1990} h={1250} z={1} shadow={0.5} />
    {t > 0.8 ? <Sprite k="FX11" x={760} y={1050} w={360} z={1.05} opacity={lin(t, 0.8, 1.0, 0, 1)} /> : null}
    <Finish />
  </Scene>; };
// 3 3.2 "75 BC these pirates" — exhausted crew twitching
const S3 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.7, 1.12, 1.2) }} grade={G_DAY} shake={2}>
    <Bg k="BG01" z={0.3} blur={4} />
    <Actor k="PG01" x={540} y={1750} h={1050} z={1} sy={1 + bob(t, 9, 0.01)} eyes={{ mood: "dead", shake: 0.6, seed: 3 }} mouth="wobble" />
    <Finish />
  </Scene>; };
// 4 4.9 "almost lost their minds" — kid pops in left, old salt right
const S4 = () => { const t = useT(); const a = pop(t, 0, 0.18), b = pop(t, 0.55, 0.18);
  return <Scene cam={{ zoom: 1.06 }} grade={G_DAY} shake={4}>
    <Bg k="BG01" z={0.3} />
    <Actor k="PI01" x={lin(a, 0, 1, -300, 330)} y={1900} h={1450} z={1} shadow={0.4} rot={S(t * 20) * 2} eyes={{ mood: "panic", shake: 1, seed: 4 }} mouth="scream" />
    {t > 0.55 ? <Actor k="PI02" x={lin(b, 0, 1, 1400, 790)} y={1920} h={1420} z={1.05} shadow={0.4} eyes={{ mood: "shock", shake: 0.7, seed: 5 }} /> : null}
    <Finish />
  </Scene>; };
// 5 6.5 "before he even left" — swing behind the hero
const S5 = () => { const t = useT();
  return <Scene cam={{ x: lin(t, 0, 1.8, -80, 60), zoom: lin(t, 0, 1.8, 1.0, 1.08) }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} />
    <Actor k="PG04" x={540} y={1330} h={760} z={0.7} shadow={0.3} eyes={{ mood: "angry", seed: 6 }} mouth="teeth" />
    <Actor k={t < 0.9 ? "HE01" : "HE02"} x={520} y={2000} h={1300} z={1.05} shadow={0.5} />
    {t > 0.9 ? <Sprite k="FX11" x={720} y={1030} w={380} z={1.1} /> : null}
    <Finish />
  </Scene>; };
// 6 8.3 "It starts near a tiny island" — aerial, merchant ship crosses
const S6 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.3, 1.0, 1.08) }} grade={G_DAY}>
    <Bg k="BG03" z={0.5} over={1.0} panX={lin(t, 0, 1.3, -0.6, 0.2)} />
    <Sprite k="PR03" x={lin(t, 0, 1.3, 180, 420)} y={1350} w={300} z={0.55} />
    <Finish />
  </Scene>; };
// 7 9.6 "Aegean Sea" — galleys glide out from behind the island
const S7 = () => { const t = useT(); const row = Math.floor(t * 4) % 2 ? "PR02" : "PR01";
  return <Scene cam={{ zoom: 1.04 }} grade={G_DAY}>
    <Bg k="BG04" z={0.3} over={1.0} panX={-0.3} />
    <Sprite k="PR03" x={lin(t, 0, 1.7, 820, 900)} y={1110} w={360} z={0.5} />
    <Sprite k={row} x={lin(t, 0, 1.7, 80, 300)} y={1150} w={560} z={0.6} />
    <Sprite k={row} x={lin(t, 0, 1.7, -200, 120)} y={1260} w={700} z={0.7} />
    <Finish />
  </Scene>; };
// 8 11.3 "pirate fleet stops a ship" — race in, hooks fly, spray
const S8 = () => { const t = useT(); const row = Math.floor(t * 6) % 2 ? "PR02" : "PR01";
  return <Scene cam={{ zoom: lin(t, 0, 1.3, 1.05, 1.15) }} grade={G_DAY} shake={lin(t, 0, 1.3, 2, 7)}>
    <Bg k="BG04" z={0.3} over={1.0} panX={0.2} />
    <Sprite k="PR03" x={720} y={1200} w={640} z={0.6} />
    <Sprite k={row} x={lin(t, 0, 1.3, -300, 330)} y={1330} w={820} z={0.8} />
    <Sprite k="FX05" x={lin(t, 0, 1.3, -50, 560)} y={1350} w={500} z={0.85} opacity={0.9} />
    {t > 0.6 ? <Sprite k="PR26" x={lin(t, 0.6, 1.3, 300, 700)} y={lin(t, 0.6, 1.3, 1150, 1050)} w={260} z={0.9} rot={t * 300} /> : null}
    <Finish />
  </Scene>; };
// 9 12.6 "drags off" — pirates swing in on ropes
const S9 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_DAY} shake={5}>
    <Bg k="BG05" z={0.3} />
    <Actor k="PI06" x={lin(t, 0, 0.6, -60, 360)} y={lin(t, 0, 0.6, 1250, 1650)} h={1350} z={0.9} rot={lin(t, 0, 0.6, -25, 10)} eyes={{ mood: "angry", seed: 9 }} mouth="scream" />
    <Actor k="PI07" x={lin(t, 0, 0.6, 1150, 760)} y={lin(t, 0, 0.6, 1300, 1800)} h={1400} z={1} rot={lin(t, 0, 0.6, 25, -8)} eyes={{ mood: "angry", seed: 10 }} mouth="scream" />
    <Finish />
  </Scene>; };
// 10 13.2 "one passenger" — dragged, then strolls calmly
const S10 = () => { const t = useT(); const drag = t < 0.75;
  return <Scene cam={{ zoom: 1.04, x: drag ? 0 : lin(t, 0.75, 1.5, 0, 120) }} grade={G_DAY}>
    <Bg k={drag ? "BG05" : "BG01"} z={0.3} />
    {drag ? <>
      <Actor k="PI05" x={lin(t, 0, 0.75, 380, 620)} y={1880} h={1450} z={1} shadow={0.4} sy={1 + bob(t, 14, 0.015)} eyes={{ mood: "angry", seed: 11 }} />
      <Actor k="HE16" x={lin(t, 0, 0.75, 420, 640)} y={1910} h={1330} z={1.02} shadow={0.4} sy={1 + bob(t, 14, 0.015, 1)} eyes={GLOW} />
    </> : <Actor k={WALK} fps={10} x={lin(t, 0.75, 1.5, 200, 700)} y={1890} h={1450} z={1} shadow={0.4} />}
    <Finish />
  </Scene>; };
// 11 14.7 "Twenty-five years old" — push on the shadowed hood
const S11 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.4, 1.1, 1.5), y: lin(t, 0, 1.4, -200, -560) }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} blur={5} />
    <Actor k="HE03" x={540} y={1950} h={1600} z={1} eyes={GLOW} />
    <Finish vignette={0.6} />
  </Scene>; };
// 12 16.1 "Expensive clothes" — macro on ring
const S12 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.3, 1.0, 1.15) }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} blur={14} />
    <Actor k="HE09" x={540} y={1700} h={1500} z={1} anchorY="center" />
    <Flash at={0.55} dur={0.18} max={0.25} />
    <Finish />
  </Scene>; };
// 13 17.4 "Strangely calm" — swords in, he yawns
const S13 = () => { const t = useT(); const k = pop(t, 0, 0.25);
  return <Scene cam={{ zoom: 1.06 }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} />
    <Actor k="PG04" x={540} y={lin(k, 0, 1, 1600, 1360)} h={800} z={0.75} shadow={0.3} eyes={{ mood: "angry", seed: 13 }} mouth="teeth" />
    <Actor k={t < 0.8 ? "HE03" : "HE04"} x={540} y={1980} h={1380} z={1} shadow={0.5} eyes={t < 0.8 ? GLOW : { mood: "glow", lid: 0.6, seed: 3 }} />
    <Finish />
  </Scene>; };
// 14 19.0 "name their price" — huddle, captain turns
const S14 = () => { const t = useT(); const turn = t > 0.85;
  return <Scene cam={{ zoom: lin(t, 0, 1.7, 1.02, 1.1) }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} />
    {!turn ? <Actor k="PG03" x={540} y={1900} h={1020} z={1} sx={1 + S(t * 8) * 0.01} eyes={{ mood: "scheming", seed: 14 }} mouth="smirk" />
      : <Actor k="CA10" x={540} y={1890} h={1560} z={1} shadow={0.5} eyes={{ mood: "smug", seed: 15 }} mouth="smirk" />}
    <Finish />
  </Scene>; };
// 15 20.7 "Twenty talents of silver" — fingers up, rubs hands, coins glint
const S15 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.6, 1.08, 1.18), y: -120 }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} blur={3} />
    <Actor k={t < 0.7 ? "CA03" : "CA04"} x={560} y={1930} h={1650} z={1} eyes={{ mood: "scheming", seed: 16 }} mouth="grin" />
    <Sprite k="PR06" x={850} y={1760} w={520} z={1.2} />
    <Finish />
  </Scene>; };
// 16 22.3 "A fortune" — coin burst
const S16 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.2, 1.0, 1.1) }} grade={G_DAY}>
    <Bg k="BG23" z={0.3} blur={8} />
    <Sprite k="PR06" x={540} y={1250} w={1100} z={1} />
    <Sprite k="PR19" x={540} y={lin(t, 0, 1.2, 1100, 700)} w={lin(t, 0, 1.2, 600, 1500)} z={1.2} opacity={lin(t, 0.8, 1.2, 1, 0)} />
    <Flash at={0} dur={0.15} max={0.35} />
    <Finish />
  </Scene>; };
// 17 23.5 "They expect him to beg" — lean in, captain points down
const S17 = () => { const t = useT(); const lean = kf(t, [[0, 0], [0.4, 1]]);
  return <Scene cam={{ zoom: lin(t, 0, 1.7, 1.04, 1.12) }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} />
    <Actor k="PG02" x={540} y={lin(lean, 0, 1, 1500, 1620)} h={lin(lean, 0, 1, 760, 900)} z={0.85} eyes={{ mood: "smug", seed: 17 }} mouth="smirk" />
    {t > 0.8 ? <Actor k="CA09" x={lin(pop(t, 0.8, 0.2), 0, 1, 1300, 820)} y={1950} h={1400} z={1} shadow={0.4} eyes={{ mood: "angry", seed: 18 }} mouth="O" /> : null}
    <Finish />
  </Scene>; };
// 18 25.2 "Instead, he laughs in their faces" — punch-in, laugh shake
const S18 = () => { const t = useT();
  return <Scene cam={{ zoom: kf(t, [[0, 1.0], [0.12, 1.14], [2.4, 1.2]]) }} grade={G_DAY} shake={lin(t, 0, 2.5, 9, 4)}>
    <Bg k="BG01" z={0.3} />
    <Actor k="PG01" x={540} y={1300} h={700} z={0.7} eyes={{ mood: "shock", seed: 19 }} />
    <Actor k={t < 1.0 ? "HE05" : "HE06"} x={540} y={1990} h={1400} z={1} shadow={0.5} sy={1 + bob(t, 16, 0.012)} />
    <Finish />
  </Scene>; };
// 19 27.7 "Twenty?" — shocked freeze zoom
const S19 = () => { const t = useT();
  return <Scene cam={{ zoom: kf(t, [[0, 1.0], [0.1, 1.25]]), y: -300 }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} blur={3} />
    <Actor k="CA05" x={540} y={1880} h={1650} z={1} eyes={{ mood: "shock", seed: 20 }} mouth="O" />
    <Flash at={0} dur={0.1} max={0.3} />
    <Finish />
  </Scene>; };
// 20 28.5 "no idea who you've caught" — temple tap, crew looks at each other
const S20 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 2.4, 1.04, 1.1) }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} />
    <Actor k="PG01" x={540} y={1310} h={720} z={0.7} eyes={{ mood: "confused", lookX: S(t * 4) > 0 ? 1 : -1, seed: 21 }} mouth="huh" />
    <Actor k="HE07" x={540} y={1990} h={1400} z={1} shadow={0.5} eyes={{ mood: "glow", seed: 3 }} />
    <Finish />
  </Scene>; };
// 21 30.9 "Ask for fifty" — hand pops up, captain falls back
const S21 = () => { const t = useT(); const fall = t > 0.55;
  return <Scene cam={{ zoom: 1.06 }} grade={G_DAY} shake={fall ? 8 : 0}>
    <Bg k="BG01" z={0.3} blur={2} />
    <Actor k={fall ? "CA06" : "CA05"} x={560} y={fall ? 1820 : 1700} h={1250} z={0.8} rot={fall ? lin(t, 0.55, 0.9, 0, -18) : 0} eyes={{ mood: fall ? "panic" : "shock", seed: 22 }} mouth={fall ? "scream" : "O"} blur={1.5} />
    <Actor k="HE08" x={540} y={lin(pop(t, 0, 0.12), 0, 1, 2500, 1900)} h={1500} z={1.3} anchorY={0.95} />
    <Finish />
  </Scene>; };
// 22 32.3 "Fifty talents" — finger counting
const S22 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.12, y: -150 }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} blur={3} />
    <Actor k="CA07" x={540} y={1950} h={1680} z={1} rot={wob(t, 4, 2)} eyes={{ mood: "confused", lookY: -0.6, seed: 23 }} mouth="huh" />
    <Finish />
  </Scene>; };
// 23 33.6 "over a tonne of silver" — silver mountain rises, captain hugs it
const S23 = () => { const t = useT(); const rise = kf(t, [[0, 0], [0.5, 1]]);
  return <Scene cam={{ zoom: lin(t, 0, 1.9, 1.0, 1.08) }} grade={G_GOLD}>
    <Bg k="BG07" z={0.3} />
    <Sprite k="PR07" x={540} y={lin(rise, 0, 1, 2300, 1350)} w={1300} z={0.85} />
    {t > 0.8 ? <Actor k="CA08" x={560} y={1950} h={1250} z={1} eyes={{ mood: "neutral", lid: 0.2, seed: 24 }} mouth="grin" /> : null}
    <Flash at={0.45} dur={0.2} max={0.3} color="#fff4d0" />
    <Finish warm={0.2} />
  </Scene>; };
// 24 35.5 "sends his people off" — letter handed over
const S24 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 2.1, 1.02, 1.08) }} grade={G_GOLD}>
    <Bg k="BG02" z={0.3} />
    <Actor k="RM01" x={lin(t, 0, 0.3, 900, 760)} y={1700} h={820} z={0.85} shadow={0.3} sy={1 + bob(t, 5, 0.012)} eyes={{ mood: "neutral", lookY: 0.5, seed: 25 }} />
    <Actor k="HE21" x={330} y={1950} h={1450} z={1} shadow={0.5} />
    <Finish warm={0.15} />
  </Scene>; };
// 25 37.6 "nearby cities to collect it" — boat rows away
const S25 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_GOLD}>
    <Bg k="BG07" z={0.3} panY={-0.3} />
    <Sprite k="PR05" x={lin(t, 0, 1.6, 420, 700)} y={lin(t, 0, 1.6, 1500, 1060)} w={lin(t, 0, 1.6, 700, 170)} z={0.8} rot={S(t * 6) * 1.5} />
    <Finish warm={0.15} />
  </Scene>; };
// 26 39.2 "stays behind… one friend and two servants"
const S26 = () => { const t = useT(); const nails = t > 1.1;
  return <Scene cam={{ zoom: lin(t, 0, 2.6, 1.0, 1.08) }} grade={G_GOLD}>
    <Bg k="BG02" z={0.3} />
    <Actor k="FR03" x={820} y={1700} h={700} z={0.85} shadow={0.3} sx={1 + S(t * 20) * 0.01} eyes={{ mood: "panic", shake: 0.6, seed: 26 }} mouth="wobble" />
    <Actor k={nails ? "FR02" : "FR01"} x={250} y={1760} h={1150} z={0.9} shadow={0.3} eyes={{ mood: "sad", shake: 0.4, seed: 27 }} mouth={nails ? null : "wobble"} />
    <Actor k="HE22" x={560} y={1990} h={1450} z={1} shadow={0.5} />
    <Finish warm={0.15} />
  </Scene>; };
// 27 41.8 "Alone" — pull up and back
const S27 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 0.8, 1.2, 0.95), y: lin(t, 0, 0.8, 0, -100) }} grade={G_GOLD}>
    <Bg k="BG02" z={0.6} over={1.3} />
    <Actor k="HE22" x={540} y={1560} h={520} z={0.6} shadow={0.4} />
    <Actor k="FR01" x={400} y={1550} h={420} z={0.6} shadow={0.3} />
    <Actor k="FR03" x={690} y={1555} h={250} z={0.6} shadow={0.3} />
    <Finish vignette={0.6} />
  </Scene>; };
// 28 42.6 "most dangerous men at sea" — ring closes in; axe then knife
const S28 = () => { const t = useT();
  if (t < 0.9) return <Scene cam={{ zoom: lin(t, 0, 0.9, 1.0, 1.1) }} grade={G_GOLD} shake={3}>
    <Bg k="BG02" z={0.3} />
    {[-1, 0, 1].map((i) => <Actor key={i} k="PG04" x={540 + i * 520} y={lin(t, 0, 0.9, 1450, 1560) + Math.abs(i) * 60} h={lin(t, 0, 0.9, 700, 800)} z={0.8 + Math.abs(i) * 0.1} filter="brightness(0.75)" eyes={{ mood: "angry", seed: 28 + i }} mouth="teeth" />)}
    <Finish vignette={0.6} />
  </Scene>;
  return <Scene cam={{ zoom: 1.1 }} grade={G_GOLD}>
    <Bg k="BG02" z={0.3} blur={6} />
    <Actor k={t < 1.7 ? "PI03" : "PI04"} x={540} y={1960} h={1700} z={1} sx={t < 1.7 ? 1 + S(t * 25) * 0.005 : 1} eyes={{ mood: t < 1.7 ? "scheming" : "shock", seed: 31 }} mouth={t < 1.7 ? "grin" : null} />
    <Finish vignette={0.55} />
  </Scene>; };
// 29 45.2 "this is where it gets weird" — whip in: sunbathing
const S29 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_DAY}>
    <Bg k="BG01" z={0.3} />
    <Actor k="PG01" x={540} y={1360} h={760} z={0.7} eyes={{ mood: "confused", seed: 32 }} mouth="huh" />
    <Actor k="HE19" x={540} y={1880} h={1150} z={1} rot={S(t * 2) * 0.5} eyes={GLOW} />
    <Whip at={0} />
    <Finish />
  </Scene>; };
// 30 47.3 "not a prisoner" — shackles dropped
const S30 = () => { const t = useT(); const fall = Math.min(1, Math.max(0, (t - 0.1) / 0.35));
  return <Scene cam={{ zoom: 1.05 }} grade={G_DAY} shake={t > 0.45 && t < 0.6 ? 6 : 0}>
    <Bg k="BG01" z={0.3} />
    {t < 0.6 ? <Actor k="HE20" x={420} y={1950} h={1500} z={1} shadow={0.5} eyes={GLOW} />
      : <Actor k="PI16" x={540} y={1950} h={1500} z={1} shadow={0.5} eyes={{ mood: "confused", lookY: 0.7, seed: 33 }} mouth="huh" />}
    {t < 0.6 ? <Sprite k="PR10" x={760} y={lin(fall, 0, 1, 1130, 1830)} w={260} z={1.05} rot={fall * 140} /> : null}
    <Finish />
  </Scene>; };
// 31 49.1 "acts like their boss" — snap, flinch, stuff flies
const S31 = () => { const t = useT(); const snap = t > 0.55;
  return <Scene cam={{ zoom: snap ? 1.1 : 1.04 }} grade={G_DAY} shake={snap && t < 0.75 ? 7 : 0}>
    <Bg k="BG01" z={0.3} />
    <Actor k="PG04" x={540} y={1330} h={720} z={0.7} sy={snap && t < 0.75 ? 0.95 : 1} eyes={{ mood: snap ? "shock" : "neutral", seed: 34 }} />
    <Actor k={snap ? "HE18" : "HE17"} x={540} y={1990} h={1300} z={1} shadow={0.5} eyes={GLOW} />
    {t > 1.0 ? <Sprite k="PR25" x={lin(t, 1.0, 1.7, 200, 760)} y={lin(t, 1.0, 1.7, 900, 800)} w={600} z={1.15} rot={t * 120} /> : null}
    <Finish />
  </Scene>; };
// 32 50.8 "When he wants to sleep" — yawn by the fire
const S32 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.1, 1.02, 1.08) }} grade={G_NIGHT}>
    <Bg k="BG06" z={0.3} />
    <Fire x={600} y={1250} w={420} />
    <Actor k="HE23" x={330} y={1960} h={1450} z={1} shadow={0.4} sy={1 + S(t * 3) * 0.01} eyes={{ mood: "glow", lid: 0.5, seed: 3 }} />
    <Finish vignette={0.6} />
  </Scene>; };
// 33 51.9 "sends a servant" — tiptoe in
const S33 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.06 }} grade={G_NIGHT}>
    <Bg k="BG06" z={0.3} />
    <Fire x={600} y={1250} w={420} />
    <Actor k="FR04" x={lin(t, 0, 0.9, -100, 520)} y={1940 - bob(t, 7, 25)} h={1450} z={1} shadow={0.4} eyes={{ mood: "scheming", seed: 35 }} mouth="MBP" />
    <Finish vignette={0.6} />
  </Scene>; };
// 34 52.8 "keep it down" — party, hard freeze
const S34 = () => { const t = useT(); const freeze = t > 0.75;
  return <Scene cam={{ zoom: freeze ? 1.12 : 1.04 }} grade={G_NIGHT} shake={freeze ? 0 : 4}>
    <Bg k="BG06" z={0.3} />
    <Fire x={540} y={1300} w={460} />
    <Actor k={freeze ? "PG07" : ["PG05", "PG06"]} fps={8} x={540} y={1880 - (freeze ? 0 : bob(t, 12, 30))} h={1000} z={1} shadow={0.4} eyes={{ mood: freeze ? "shock" : "neutral", lid: freeze ? 0 : 0.2, seed: 36 }} mouth={freeze ? "teeth" : "grin"} />
    <Finish vignette={0.55} />
  </Scene>; };
// 35 54.2 sleeps — hammock sways
const S35 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_NIGHT + " brightness(0.8)"}>
    <Bg k="BG06" z={0.3} />
    <Sprite k="PR09" x={540} y={1380} w={1000} z={0.9} rot={S(t * 3) * 1.5} />
    <Actor k="HE24" x={540} y={1460} h={620} z={0.95} rot={S(t * 3) * 2} />
    <Finish vignette={0.7} />
  </Scene>; };
// 36 54.7 "writes poems and speeches" — scribbling, balls pop in
const S36 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.7, 1.02, 1.1) }} grade={G_NIGHT}>
    <Bg k="BG08" z={0.3} />
    <Actor k="HE25" x={540} y={1900} h={1350} z={1} sx={1 + S(t * 18) * 0.004} eyes={GLOW} />
    {[0, 1, 2].map((i) => t > 0.4 + i * 0.35 ? <Sprite key={i} k="PR22" x={220 + i * 320} y={1830 - i * 30} w={360} z={1.1} rot={i * 40} opacity={pop(t, 0.4 + i * 0.35)} /> : null)}
    <Finish vignette={0.55} />
  </Scene>; };
// 37 56.4 "sit and listen" — orator, bored crew
const S37 = () => { const t = useT(); const crew = t > 0.8 && t < 1.4;
  return <Scene cam={{ zoom: 1.05 }} grade={G_NIGHT}>
    <Bg k="BG06" z={0.3} />
    <Fire x={820} y={1250} w={360} />
    {crew ? <Actor k="PG08" x={540} y={1900} h={900} z={1} eyes={{ mood: "dead", seed: 37 }} mouth="rest" />
      : <Actor k={t < 0.8 ? "HE26" : "HE27"} x={480} y={1960} h={1550} z={1} shadow={0.4} eyes={GLOW} />}
    <Finish vignette={0.55} />
  </Scene>; };
// 38 58.7 "if they don't clap" — nervous claps
const S38 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.3, 1.04, 1.12) }} grade={G_NIGHT}>
    <Bg k="BG06" z={0.3} />
    <Actor k="PG09" x={540} y={1880 - bob(t, 14, 8)} h={980} z={1} eyes={{ mood: "panic", seed: 38 }} eyesEach={[{}, { mood: "angry" }]} mouth="grin" mouthEach={[null, "frown"]} />
    <Finish vignette={0.55} />
  </Scene>; };
// 39 60.0 "illiterate barbarians" — pointing, snap zoom to the brute
const S39 = () => { const t = useT(); const brute = t > 0.9;
  return <Scene cam={{ zoom: brute ? kf(t, [[0.9, 1.0], [1.0, 1.18]]) : 1.05 }} grade={G_NIGHT} shake={brute ? 0 : 5}>
    <Bg k="BG06" z={0.3} blur={brute ? 6 : 0} />
    {brute ? <Actor k="PI08" x={540} y={1980} h={1700} z={1} eyes={{ mood: "sad", seed: 39 }} mouth="wobble" />
      : <Actor k="HE28" x={540} y={1960} h={1550} z={1} shadow={0.4} eyes={{ mood: "glow", seed: 3 }} />}
    <Finish vignette={0.55} />
  </Scene>; };
// 40 61.8 "right to their faces" — nose to nose, sweat
const S40 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.5, 1.05, 1.14) }} grade={G_NIGHT}>
    <Bg k="BG06" z={0.3} blur={6} />
    <Actor k="PI09" x={640} y={1980} h={1700} z={0.9} eyes={{ mood: "shock", shake: 0.5, seed: 40 }} />
    <Sprite k="FX14" x={930} y={lin(t % 0.7, 0, 0.7, 1050, 1300)} w={380} z={0.95} opacity={0.8} />
    <Actor k="HE29" x={150} y={2100} h={1700} z={1.1} />
    <Finish vignette={0.55} />
  </Scene>; };
// 41 63.3 "again and again" — day / sunset jump-cuts
const S41 = () => { const t = useT(); const second = t > 0.75;
  return <Scene cam={{ zoom: 1.05 }} grade={second ? G_GOLD : G_DAY}>
    <Bg k={second ? "BG02" : "BG01"} z={0.3} />
    <Actor k={second ? "PI10" : "CA12"} x={760} y={1880} h={1350} z={0.9} shadow={0.4} eyes={{ mood: "neutral", lid: 0.2, seed: 41 }} mouth="grin" />
    <Actor k="HE30" x={290} y={1980} h={1500} z={1} shadow={0.4} rot={S(t * 20) * 1.5} />
    <Finish />
  </Scene>; };
// 42 64.8 "with a smile" — slow push on the smile
const S42 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 2.0, 1.0, 1.15) }} grade={G_NIGHT}>
    <Black />
    <Actor k="HE31" x={540} y={1020} h={1250} z={1} anchorY="center" eyes={{ mood: "glow", seed: 3, scale: 0.42 }} />
    <Finish vignette={0.7} />
  </Scene>; };
// 43 66.8 "when I get out of here" — finger at the camera; crew giggles
const S43 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.6, 1.0, 1.1) }} grade={G_NIGHT}>
    <Bg k="BG06" z={0.3} />
    <Actor k="PG10" x={540} y={1450} h={760} z={0.75} sy={1 + bob(t, 10, 0.015)} eyes={{ mood: "neutral", lid: 0.2, seed: 43 }} mouth="grin" />
    <Actor k="HE32" x={540} y={2000} h={1500} z={1} eyes={GLOW} />
    <Finish vignette={0.55} />
  </Scene>; };
// 44 68.4 "crucify" — whip, lightning, crosses
const S44 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.1, 1.0, 1.1) }} grade={G_DUSK} shake={t < 0.3 ? 8 : 0}>
    <Bg k="BG20" z={0.3} />
    {[-2, -1, 0, 1, 2].map((i) => <Sprite key={i} k="PR15" x={540 + i * 200} y={lin(pop(t, 0.05 + Math.abs(i) * 0.06, 0.25), 0, 1, 1700, 1250)} w={260 - Math.abs(i) * 30} z={0.7} />)}
    <Sprite k="FX08" x={540} y={1500} w={1500} z={0.9} opacity={0.7} />
    {t < 0.25 ? <Sprite k="FX10" x={700} y={500} w={700} z={0.4} blend="screen" /> : null}
    <Flash at={0.02} dur={0.18} max={0.7} />
    <Whip at={0} />
    <Finish vignette={0.6} />
  </Scene>; };
// 45 69.5 "every single one of you" — stick points one by one
const S45 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.06 }} grade={G_NIGHT}>
    <Bg k="BG06" z={0.3} />
    <Actor k="PG08" x={540} y={1500} h={760} z={0.75} eyes={{ mood: "confused", seed: 45 }} only={[Math.floor(t * 4) % 5]} mouth="huh" />
    <Actor k="HE33" x={540} y={2000} h={1300} z={1} rot={S(t * 8) * 3} />
    <Finish vignette={0.55} />
  </Scene>; };
// 46 71.0 "hilarious" — laughter, one falls off the log
const S46 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_NIGHT} shake={3}>
    <Bg k="BG06" z={0.3} />
    <Fire x={540} y={1260} w={380} />
    <Actor k="PG10" x={480} y={1860 - bob(t, 12, 20)} h={980} z={0.9} eyes={{ mood: "neutral", lid: 0.2, seed: 46 }} mouth="grin" />
    {t > 0.8 ? <Actor k="PI12" x={850} y={1950} h={900} z={1} rot={lin(t, 0.8, 1.4, 0, -25)} eyes={{ mood: "neutral", lid: 0.2, seed: 47 }} mouth="A" /> : null}
    <Finish vignette={0.55} />
  </Scene>; };
// 47 73.0 "love this kid" — arm drops round him
const S47 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.08 }} grade={G_NIGHT}>
    <Bg k="BG06" z={0.3} />
    <Actor k="CA11" x={330} y={1920} h={1550} z={0.95} shadow={0.4} eyes={{ mood: "neutral", lid: 0.2, seed: 48 }} mouth="grin" />
    <Actor k="HE22" x={760} y={1960} h={1450} z={1} shadow={0.4} rot={S(t * 6) * 2} />
    <Finish vignette={0.55} />
  </Scene>; };
// 48 74.2 "think he's joking" — pop-ins
const S48 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_NIGHT}>
    <Bg k="BG06" z={0.3} />
    <Actor k="PI10" x={230} y={lin(pop(t, 0), 0, 1, 2600, 1950)} h={1300} z={0.9} eyes={{ mood: "neutral", lid: 0.2, seed: 49 }} mouth="grin" />
    {t > 0.35 ? <Actor k="PI11" x={820} y={lin(pop(t, 0.35), 0, 1, 2600, 1950)} h={1300} z={0.95} eyes={{ mood: "neutral", lid: 0.2, seed: 50 }} mouth="A" /> : null}
    {t > 0.8 ? <Actor k="CA13" x={530} y={lin(pop(t, 0.8), 0, 1, 2700, 2050)} h={1500} z={1} eyes={{ mood: "smug", lid: 0.9, seed: 51 }} mouth="smirk" /> : null}
    <Finish vignette={0.55} />
  </Scene>; };
// 49 75.7 "Thirty-eight days later" — tallies scratch in
const S49 = () => { const t = useT(); const n = Math.min(38, Math.floor(t * 30));
  return <Scene cam={{ zoom: lin(t, 0, 1.3, 1.0, 1.06) }} grade={G_DAY}>
    <Bg k="BG23" z={0.3} />
    <Depth z={0.6}><svg width={W} height={H} style={{ position: "absolute" }}>
      {Array.from({ length: n }).map((_, i) => { const g = Math.floor(i / 5), j = i % 5, gx = 170 + (g % 4) * 200, gy = 600 + Math.floor(g / 4) * 260;
        return j < 4 ? <line key={i} x1={gx + j * 34} y1={gy} x2={gx + j * 34 + 6} y2={gy + 150} stroke="#2a1a0e" strokeWidth={9} strokeLinecap="round" opacity={0.85} />
          : <line key={i} x1={gx - 20} y1={gy + 120} x2={gx + 140} y2={gy + 30} stroke="#2a1a0e" strokeWidth={9} strokeLinecap="round" opacity={0.85} />; })}
    </svg></Depth>
    <Finish />
  </Scene>; };
// 50 77.0 "the ransom arrives" — boat arrives, chests dumped
const S50 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_GOLD}>
    <Bg k="BG07" z={0.3} />
    <Sprite k="PR05" x={lin(t, 0, 0.8, 1300, 720)} y={1260} w={720} z={0.8} />
    {t > 0.7 ? <Sprite k="PR06" x={420} y={lin(pop(t, 0.7, 0.2), 0, 1, 1300, 1640)} w={620} z={0.95} /> : null}
    <Finish warm={0.15} />
  </Scene>; };
// 51 78.4 "He's free" — walks off down the pier
const S51 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_GOLD}>
    <Bg k="BG09" z={0.3} />
    <Actor k={WALK} fps={10} x={lin(t, 0, 0.9, 260, 560)} y={lin(t, 0, 0.9, 1850, 1700)} h={lin(t, 0, 0.9, 1250, 1050)} z={1} shadow={0.4} />
    <Finish warm={0.2} />
  </Scene>; };
// 52 79.3 "run home" — friend runs at camera, then kisses the ground
const S52 = () => { const t = useT(); const kiss = t > 1.0;
  return <Scene cam={{ zoom: 1.04 }} grade={G_DAY}>
    <Bg k="BG07" z={0.3} />
    {kiss ? <Actor k="FR07" x={540} y={1900} h={1100} z={1} shadow={0.4} sy={1 + bob(t, 10, 0.02)} eyes={{ mood: "neutral", lid: 0.2, seed: 52 }} />
      : <Actor k={["FR05", "FR06"]} fps={8} x={540} y={lin(t, 0, 1, 1500, 2050)} h={lin(t, 0, 1, 700, 1600)} z={1} shadow={0.4} eyes={{ mood: "neutral", lid: 0.2, seed: 53 }} mouth="grin" />}
    <Finish />
  </Scene>; };
// 53 81.0 "never look at the sea again" — servants shuffle off
const S53 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_DAY}>
    <Bg k="BG07" z={0.3} />
    <Actor k="FR03" x={lin(t, 0, 1.8, 540, 980)} y={1880 - bob(t, 8, 15)} h={1100} z={1} shadow={0.4} eyes={{ mood: "panic", seed: 54 }} mouth="wobble" />
    <Finish />
  </Scene>; };
// 54 82.8 "Not him." — slow push on the silhouette
const S54 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 0.9, 1.0, 1.08) }} grade={G_GOLD}>
    <Bg k="BG09" z={0.3} />
    <Actor k="HE22" x={540} y={1800} h={1300} z={1} filter="brightness(0.6)" />
    <Finish warm={0.25} vignette={0.6} />
  </Scene>; };
// 55 83.7 "port of Miletus" — pan the harbour
const S55 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_DAY}>
    <Bg k="BG10" z={0.6} over={1.0} panX={lin(t, 0, 1.3, -0.8, 0.3)} />
    <Finish />
  </Scene>; };
// 56 85.0 "raises ships and men" — slam → cheer
const S56 = () => { const t = useT(); const cheer = t > 0.6;
  return <Scene cam={{ zoom: 1.06 }} grade={G_DAY} shake={t > 0.25 && t < 0.4 ? 8 : 0}>
    <Bg k="BG11" z={0.3} />
    <Actor k={cheer ? "RM04" : "RM03"} x={600} y={1560} h={860} z={0.8} sy={cheer ? 1 + bob(t, 10, 0.02) : 1} eyes={{ mood: cheer ? "neutral" : "smug", lid: cheer ? 0.2 : undefined, seed: 56 }} mouth={cheer ? "grin" : "smirk"} />
    <Actor k="HE35" x={330} y={2000} h={1500} z={1} />
    <Finish />
  </Scene>; };
// 57 86.3 "and sails" — galleys surge across the storm sea
const S57 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.04 }} grade={G_STORM} shake={3}>
    <Bg k="BG12" z={0.3} over={1.0} panX={lin(t, 0, 1.3, -0.5, 0.2)} />
    {[0, 1, 2].map((i) => <Sprite key={i} k="PR04" x={lin(t, 0, 1.3, -300 + i * 250, 300 + i * 300)} y={1050 + i * 220} w={420 + i * 220} z={0.6 + i * 0.15} rot={S(t * 3 + i) * 2} />)}
    <Sprite k="FX05" x={lin(t, 0, 1.3, 400, 800)} y={1650} w={700} z={1.0} opacity={0.8} />
    <Finish />
  </Scene>; };
// 58 87.6 "right back to that island" — at the bow
const S58 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.4, 1.0, 1.1) }} grade={G_STORM} shake={4}>
    <Bg k="BG12" z={0.3} over={1.0} panX={0.4} />
    <Actor k="HE34" x={540} y={1990} h={1600} z={1} rot={S(t * 2.5) * 2} />
    <Sprite k="FX05" x={300 + (t * 400) % 500} y={1500} w={600} z={1.15} opacity={0.75} />
    <Finish />
  </Scene>; };
// 59 89.0 "still there" — lazy camp
const S59 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.4, 1.0, 1.05) }} grade={G_GOLD}>
    <Bg k="BG13" z={0.3} />
    <Sprite k="PR01" x={850} y={1080} w={420} z={0.45} rot={S(t * 1.5) * 1} />
    <Actor k="PG08" x={540} y={1880} h={880} z={1} sy={1 + S(t * 2) * 0.01} eyes={{ mood: "smug", lid: 0.8, seed: 59 }} />
    <Finish warm={0.15} />
  </Scene>; };
// 60 90.4 "still anchored" — crab on the rope
const S60 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_GOLD}>
    <Bg k="BG14" z={0.3} />
    <Sprite k="PR18" x={540 + S(t * 3) * 6} y={900} w={1300} z={1} rot={-20} />
    <Finish />
  </Scene>; };
// 61 91.4 "counting his silver" — coins fall in slow motion; fleet on horizon
const S61 = () => { const t = useT(); const look = t > 0.8;
  return <Scene cam={{ zoom: look ? lin(t, 0.8, 1.9, 1.08, 1.16) : 1.04 }} grade={G_GOLD}>
    <Bg k="BG13" z={0.3} />
    {look ? <Sprite k="PR04" x={lin(t, 0.8, 1.9, 1300, 900)} y={1000} w={420} z={0.4} /> : null}
    {look ? <Actor k="CA18" x={540} y={1960} h={1600} z={1} eyes={{ mood: "shock", lookY: -0.5, seed: 61 }} mouth="O" />
      : <Actor k="PG11" x={540} y={1880} h={930} z={1} eyes={{ mood: "neutral", lid: 0.2, lookY: 0.6, seed: 62 }} mouth="grin" />}
    <Finish warm={0.15} />
  </Scene>; };
// 62 93.3 "captures most of them" — charge vs flee
const S62 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_STORM} shake={7}>
    <Bg k="BG07" z={0.3} filter="saturate(0.7) brightness(0.85)" />
    <Actor k={["PI14", "PI15"]} fps={10} x={lin(t, 0, 1.3, 700, 150)} y={1880} h={900} z={0.95} flip eyes={{ mood: "panic", seed: 63 }} mouth="scream" />
    <Actor k={["RM05", "RM06"]} fps={10} x={lin(t, 0, 1.3, 1200, 600)} y={1930} h={980} z={1} flip trail={[-60, 0]} eyes={{ mood: "angry", seed: 64 }} mouth="teeth" />
    <Sprite k="FX06" x={lin(t, 0, 1.3, 1000, 500)} y={1850} w={600} z={1.1} opacity={0.85} />
    <Finish />
  </Scene>; };
// 63 94.6 "takes the money back" — chest carried off; captain reaches
const S63 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_STORM}>
    <Bg k="BG07" z={0.3} filter="saturate(0.7) brightness(0.85)" />
    <Actor k="RM07" x={lin(t, 0, 1.0, 600, 1300)} y={1750} h={760} z={0.85} sy={1 + bob(t, 10, 0.015)} eyes={{ mood: "smug", seed: 65 }} />
    <Actor k="CA14" x={380} y={1950} h={1350} z={1} eyes={{ mood: "sad", seed: 66 }} mouth="wobble" />
    <Finish />
  </Scene>; };
// 64 95.6 "locks them up" — chained walk
const S64 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade={G_STORM}>
    <Bg k="BG15" z={0.3} />
    <Actor k="PG12" x={lin(t, 0, 0.9, 400, 640)} y={1880 - bob(t, 8, 10)} h={900} z={0.9} eyes={{ mood: "sad", seed: 67 }} mouth="wobble" />
    <Actor k="RM10" x={900} y={1950} h={1150} z={1} />
    <Finish />
  </Scene>; };
// 65 96.5 "Pergamon" — door slams, shake
const S65 = () => { const t = useT(); const slam = t > 0.45;
  return <Scene cam={{ zoom: slam ? 1.12 : 1.04 }} grade={G_TORCH} shake={slam ? lin(t, 0.45, 0.8, 18, 2) : 0}>
    <Bg k="BG16" z={0.3} />
    <Actor k="CA15" x={380} y={1950} h={1350} z={0.9} eyes={{ mood: "panic", seed: 68 }} mouth="scream" />
    <Actor k="PI13" x={780} y={1990} h={1250} z={0.95} eyes={{ mood: "panic", seed: 69 }} />
    <Sprite k="PR14" x={540} y={1450} w={1200} z={1.05} />
    {slam ? <Sprite k="PR13" x={lin(pop(t, 0.45, 0.08), 0, 1, -400, 540)} y={1250} w={1200} z={1.2} /> : null}
    <Flash at={0.45} dur={0.1} max={0.5} />
    <Finish vignette={0.6} />
  </Scene>; };
// 66 97.5 "But there's a problem" — scroll handed over
const S66 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade="saturate(1.05)">
    <Bg k="BG18" z={0.3} />
    <Actor k="RM02" x={760} y={1880} h={1300} z={0.95} shadow={0.4} eyes={{ mood: "sad", seed: 70 }} mouth="wobble" />
    <Actor k="HE22" x={300} y={1980} h={1500} z={1} shadow={0.4} />
    <Finish />
  </Scene>; };
// 67 98.7 "the governor's job" — grapes, yawn
const S67 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.8, 1.02, 1.1) }}>
    <Bg k="BG18" z={0.3} />
    <Actor k={t < 1.0 ? "GV01" : "GV02"} x={540} y={1900} h={1450} z={1} shadow={0.4} eyes={{ mood: t < 1.0 ? "smug" : "dead", seed: 71 }} mouth={t < 1.0 ? "chew" : null} />
    <Finish warm={0.15} />
  </Scene>; };
// 68 100.5 "eye on all that silver" — greed escalates
const S68 = () => { const t = useT(); const k = t < 0.9 ? "GV04" : t < 1.8 ? "GV05" : "GV06";
  return <Scene cam={{ zoom: lin(t, 0, 3.0, 1.06, 1.14) }}>
    <Bg k="BG18" z={0.3} blur={5} />
    {k === "GV04" ? <Sprite k="PR08" x={900} y={1500} w={500} z={0.8} /> : null}
    <Actor k={k} x={540} y={1980} h={1550} z={1} eyes={{ mood: k === "GV04" ? "sideEye" : k === "GV05" ? "scheming" : "smug", lookX: k === "GV04" ? 1 : 0, seed: 72 }} mouth={k === "GV06" ? null : "smirk"} />
    <Finish warm={0.15} />
  </Scene>; };
// 69 103.5 "think about it" — wave, chin stroke
const S69 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }}>
    <Bg k="BG18" z={0.3} />
    <Actor k={t < 0.9 ? "GV07" : "GV08"} x={700} y={1890} h={1500} z={0.95} shadow={0.4} rot={t < 0.9 ? S(t * 9) * 1.5 : 0} eyes={{ mood: t < 0.9 ? "smug" : "sideEye", lookX: 1, seed: 73 }} mouth={{ lip: [103.48, 105.26], base: "smirk" }} />
    <Actor k="HE22" x={230} y={1990} h={1500} z={1} shadow={0.4} />
    <Finish warm={0.12} />
  </Scene>; };
// 70 105.6 "doesn't wait" — whip turn out
const S70 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.06, x: lin(t, 0, 0.9, 0, 120) }}>
    <Bg k="BG18" z={0.3} blur={3} />
    <Actor k="HE36" x={lin(t, 0, 0.9, 540, 800)} y={1990} h={1550} z={1} shadow={0.4} trail={[-50, 0]} />
    <Finish />
  </Scene>; };
// 71 106.5 "races back to the prison" — mount, then the gallop
const S71 = () => { const t = useT();
  if (t < 0.6) return <Scene cam={{ zoom: 1.05 }} grade={G_NIGHT}>
    <Bg k="BG17" z={0.3} />
    <Actor k="PR27" face={false} x={560} y={1880} h={1250} z={0.95} shadow={0.4} />
    <Actor k="HE37" x={lin(t, 0, 0.6, 200, 400)} y={1950} h={1350} z={1} eyes={GLOW} />
    <Finish vignette={0.6} />
  </Scene>;
  const tt = t - 0.6;
  return <Scene cam={{ zoom: 1.05 }} grade={G_NIGHT} shake={4}>
    <Bg k="BG19" z={0.6} over={1.0} panX={lin(tt, 0, 1.9, -0.8, 0.8)} blur={2} />
    <Actor k={GAL} fps={12} x={540 + S(tt * 3) * 40} y={1560 - Math.abs(S(tt * PI * 6)) * 30} h={700} z={1} trail={[-80, 0]} />
    <Sprite k="FX07" x={lin(tt % 0.5, 0, 0.5, 360, -100)} y={1560} w={500} z={1.1} opacity={lin(tt % 0.5, 0, 0.5, 0.8, 0)} />
    <Finish vignette={0.6} />
  </Scene>; };
// 72 109.0 "before the governor can decide" — snoring
const S72 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.08 }}>
    <Bg k="BG18" z={0.3} />
    <Actor k="GV03" x={540} y={1900} h={1450} z={1} sy={1 + S(t * 6) * 0.012} eyes={{ lid: 1, seed: 74 }} mouth="O" />
    <Finish warm={0.15} />
  </Scene>; };
// 73 109.7 bursts in — door kicked open, splinters
const S73 = () => { const t = useT();
  return <Scene cam={{ zoom: kf(t, [[0, 1.0], [0.15, 1.12]]) }} grade={G_TORCH} shake={lin(t, 0, 0.6, 16, 3)}>
    <Bg k="BG16" z={0.3} />
    <Actor k="RM12" x={800} y={1900} h={950} z={0.85} eyes={{ mood: "shock", seed: 75 }} mouth="O" />
    <Actor k="HE37" x={420} y={1990} h={1550} z={1} eyes={GLOW} />
    <Sprite k="FX12" x={540} y={1250} w={lin(t, 0, 0.5, 600, 1300)} z={1.1} opacity={lin(t, 0.2, 0.7, 1, 0)} />
    <Flash at={0} dur={0.12} max={0.5} color="#ffd9a0" />
    <Finish vignette={0.6} />
  </Scene>; };
// 74 110.5 "drags the pirates out"
const S74 = () => { const t = useT(); const drag = t > 0.8;
  return <Scene cam={{ zoom: 1.06 }} grade={G_TORCH} shake={drag ? 4 : 1}>
    <Bg k="BG16" z={0.3} />
    {!drag ? <>
      <Actor k="CA15" x={380} y={1950} h={1350} z={0.9} eyes={{ mood: "panic", shake: 1, seed: 76 }} mouth="scream" />
      <Actor k="PI13" x={780} y={1990} h={1250} z={0.95} eyes={{ mood: "panic", shake: 1, seed: 77 }} />
      <Sprite k="PR14" x={540} y={1450} w={1200} z={1.05} />
    </> : <>
      <Actor k="PG12" x={lin(t, 0.8, 1.7, 300, 520)} y={1880} h={850} z={0.9} eyes={{ mood: "panic", seed: 78 }} />
      <Actor k="RM09" x={lin(t, 0.8, 1.7, 700, 900)} y={1950} h={1000} z={1} eyes={{ mood: "angry", seed: 79 }} />
    </>}
    <Finish vignette={0.6} />
  </Scene>; };
// 75 112.2 "exactly what he promised" — they look up in horror
const S75 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.9, 1.02, 1.1) }} grade={G_TORCH}>
    <Bg k="BG17" z={0.3} />
    <Actor k="PG12" x={540} y={1620} h={760} z={0.8} sy={0.94} eyes={{ mood: t > 0.8 ? "shock" : "sad", lookY: t > 0.8 ? -1 : 0.6, seed: 80 }} />
    <Actor k="HE38" x={540} y={2050} h={1500} z={1} />
    <Finish vignette={0.65} />
  </Scene>; };
// 76 114.1 "goes on a cross" — whip; crosses rise in silhouette
const S76 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 2.1, 1.0, 1.08) }} grade={G_DUSK}>
    <Bg k="BG20" z={0.3} />
    {t < 0.9 ? <Sprite k="PR16" x={540} y={lin(pop(t, 0, 0.4), 0, 1, 1500, 1180)} w={1000} z={0.5} />
      : [-3, -2, -1, 0, 1, 2, 3].map((i) => <Sprite key={i} k="PR15" x={540 + i * 150} y={1220 - (3 - Math.abs(i)) * 25} w={200 - Math.abs(i) * 18} z={0.6} />)}
    <Sprite k="FX08" x={lin(t, 0, 2.1, 400, 650)} y={1450} w={1600} z={0.9} opacity={0.75} />
    <Whip at={0} />
    <Finish vignette={0.65} />
  </Scene>; };
// 77 116.2 "treated him well" — warm memory
const S77 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.6, 1.0, 1.06) }} grade="sepia(0.35) saturate(1.1) brightness(1.05)">
    <Bg k="BG06" z={0.3} blur={3} />
    <Fire x={540} y={1250} w={360} />
    <Actor k="CA17" x={320} y={1920} h={1350} z={0.95} eyes={{ mood: "neutral", lid: 0.2, seed: 81 }} mouth="smile" />
    <Actor k="HE39" x={780} y={1960} h={1350} z={1} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.7) 100%)" }} />
    <Finish />
  </Scene>; };
// 78 117.8 throats line — black, sound only
const S78 = () => <Black />;
// 79 119.4 "wouldn't suffer up there" — fog, dawn
const S79 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.8, 1.0, 1.05) }} grade="saturate(0.8)">
    <Bg k="BG21" z={0.3} />
    <Sprite k="PR16" x={540} y={1170} w={900} z={0.5} opacity={0.55} blur={2} />
    <Sprite k="FX08" x={lin(t, 0, 1.8, 300, 700)} y={1300} w={1700} z={0.8} opacity={0.85} />
    <Finish vignette={0.6} />
  </Scene>; };
// 80 121.2 "a rich kid" — memory: mocking
const S80 = () => { const t = useT();
  return <Scene cam={{ zoom: 1.05 }} grade="sepia(0.3) saturate(1.05)">
    <Bg k="BG01" z={0.3} />
    <Actor k="PG10" x={540} y={1450} h={760} z={0.75} sy={1 + bob(t, 10, 0.015)} eyes={{ mood: "neutral", lid: 0.2, seed: 82 }} mouth="grin" />
    <Actor k="HE03" x={540} y={2000} h={1300} z={1} eyes={GLOW} />
    <Finish vignette={0.6} />
  </Scene>; };
// 81 123.5 "actually kidnapped the man" — legions fill the valley
const S81 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.5, 1.0, 1.08) }} grade={G_GOLD}>
    <Bg k="BG22" z={0.4} over={1.0} panX={lin(t, 0, 1.5, -0.3, 0.1)} />
    <Sprite k="RM11" x={560} y={lin(t, 0, 1.5, 1280, 1230)} w={lin(t, 0, 1.5, 900, 1100)} z={0.6} />
    <Actor k="HE22" x={540} y={1990} h={900} z={1} filter="brightness(0.55)" />
    <Finish warm={0.2} />
  </Scene>; };
// 82 125.0 "one day rule Rome" — legion close, eagle flare
const S82 = () => { const t = useT(); const eagle = t > 0.9;
  return <Scene cam={{ zoom: lin(t, 0, 1.8, 1.0, 1.1) }} grade={G_GOLD}>
    {eagle ? <><Bg k="BG24" z={0.3} /><Sprite k="PR17" x={540} y={lin(t, 0.9, 1.8, 1100, 980)} w={900} z={1} /><Flash at={0.9} dur={0.3} max={0.5} color="#fff2cc" /></>
      : <><Bg k="BG22" z={0.3} over={1.0} panX={0.1} /><Actor k="RM11" x={540} y={lin(t, 0, 0.9, 1800, 1900)} h={lin(t, 0, 0.9, 900, 1050)} z={1} eyes={{ mood: "angry", seed: 83 }} /></>}
    <Finish warm={0.25} />
  </Scene>; };
// 83 126.8 "That hostage was" — slow turn
const S83 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 1.2, 1.04, 1.12) }} grade={G_GOLD}>
    <Bg k="BG07" z={0.3} />
    <Actor k="HE40" x={540} y={1990} h={1550} z={1} sx={lin(t, 0, 1.2, 0.97, 1)} eyes={GLOW} />
    <Finish warm={0.2} vignette={0.6} />
  </Scene>; };
// 84 128.0 "Julius Caesar" — REVEAL
const S84 = () => { const t = useT(); const second = t > 1.0;
  return <Scene cam={{ zoom: kf(t, [[0, 1.0], [0.15, 1.1], [2.5, 1.16]]) }} grade={G_GOLD}>
    <Bg k="BG07" z={0.3} blur={4} />
    <Actor k={second ? "HE42" : "HE41"} x={540} y={1990} h={1650} z={1} eyes={{ mood: second ? "smug" : "neutral", pupil: 0.9, seed: 84 }} mouth={second ? "smirk" : "smile"} />
    <Flash at={0} dur={0.35} max={0.85} color="#fff1c4" />
    <Finish warm={0.3} />
  </Scene>; };
// 85 130.5 "always kept his promises" — final push; crosses on the far hill
const S85 = () => { const t = useT();
  return <Scene cam={{ zoom: lin(t, 0, 3.8, 1.04, 1.14) }} grade={G_GOLD}>
    <Bg k="BG07" z={0.3} />
    <Sprite k="PR16" x={830} y={760} w={260} z={0.35} opacity={0.75} />
    <Actor k="HE42" x={540} y={1990} h={1500} z={1} eyes={{ mood: "smug", lid: kf(t, [[1.2, 0.45], [1.35, 1], [1.5, 0.45]]), seed: 85 }} mouth="smirk" />
    <Finish warm={0.3} />
  </Scene>; };

// whip-blur transition: the first frames of a shot come in with a hard directional smear
const Whip: React.FC<{ at: number }> = ({ at }) => {
  const t = useT(); const k = 1 - Math.min(1, Math.max(0, (t - at) / 0.2));
  return k > 0 ? <AbsoluteFill style={{ backdropFilter: `blur(${k * 26}px)`, WebkitBackdropFilter: `blur(${k * 26}px)`, background: `rgba(255,240,220,${k * 0.15})` }} /> : null;
};

export const SHOTS = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30,
  S31, S32, S33, S34, S35, S36, S37, S38, S39, S40, S41, S42, S43, S44, S45, S46, S47, S48, S49, S50, S51, S52, S53, S54, S55, S56, S57, S58, S59, S60,
  S61, S62, S63, S64, S65, S66, S67, S68, S69, S70, S71, S72, S73, S74, S75, S76, S77, S78, S79, S80, S81, S82, S83, S84, S85];
export const CUTS = [0.0, 1.6, 3.2, 4.9, 6.5, 8.28, 9.6, 11.26, 12.6, 13.2, 14.66, 16.06, 17.4, 18.98, 20.68, 22.3, 23.54, 25.18, 27.7, 28.52, 30.94, 32.32, 33.58, 35.52, 37.6, 39.2, 41.78, 42.6,
  45.16, 47.28, 49.06, 50.76, 51.9, 52.8, 54.2, 54.68, 56.4, 58.66, 60.0, 61.8, 63.3, 64.8, 66.82, 68.4, 69.5, 71.0, 72.96, 74.22, 75.72, 77.0, 78.36,
  79.28, 81.0, 82.82, 83.72, 85.0, 86.3, 87.6, 88.96, 90.4, 91.36, 93.26, 94.6, 95.6, 96.5, 97.52, 98.68, 100.5, 103.48, 105.62, 106.5, 109.0, 109.7,
  110.46, 112.2, 114.14, 116.18, 117.8, 119.4, 121.18, 123.46, 125.0, 126.76, 128.0, 130.5];
export const END = 134.3;
export { Img, staticFile };
