// Episode 3 shot list (episodes/ep3/timing.json). Times inside a shot are seconds from its first word; actions sit on their words.
import React from "react";
import type { CamKeys, Look, V3 } from "../engine/Stage";
import { Toon } from "../engine/Toon";
import { C } from "./cast";
import { nightIn, nightOut, dark, Apartment, APT, StoreFront, HotelRoom, Theater, Fridge, GameBox, Phone, WallClock, Banner } from "./sets";
import { useT, clamp01, smooth, lerp, Debris } from "../ep2/world";

export type Shot = { look: Look; cam: CamKeys; focus: number; Body: React.FC<{ dur: number }> };
const B = (fn: (t: number, dur: number) => React.ReactNode): React.FC<{ dur: number }> => ({ dur }) => { const t = useT(); return <>{fn(t, dur)}</>; };
const inL = nightIn(), outL = nightOut(), dk = dark();
const dim: Look = { ...nightIn(), exposure: 1.15, hemi: { sky: "#5a4cc8", ground: "#1a0820", intensity: 0.55 } };
const FR = APT.fridge;
const NOTE1 = ["GTA 6", "=", "WEDDING"];
const NOTE2 = ["CHAPEL'S BOOKED", "9 AM", "GAME'S IN MY CAR ♥"];

/* fans in the 2013 line */
const Line: React.FC = () => (
  <group>
    {[["fan1", -6.5], ["fan2", -5.2], ["fan3", -3.9], ["fan4", 3.2], ["fan1", 4.5], ["fan2", 5.8], ["fan3", 7.1]].map(([who, x], i) => (
      <Toon key={i} spec={C[who as string]} pose={{ eyes: i % 2 ? "happy" : "dot", mouth: i % 3 ? "smile" : "grin", armR: i % 2 ? "wave" : "down" }} pos={[x as number, 0.12, -1.6 + (i % 2) * 0.25]} seed={i + 2} />
    ))}
  </group>
);

export const SHOTS: Record<number, Shot> = {
  /* 1 "If you promise to marry her when GTA 6 comes out," - release night flash-forward: our guy on one knee, box open, ring glowing; push in */
  1: { look: dim, focus: 1.9, cam: { from: [0.4, 1.2, 4.6], to: [0.2, 1.0, 2.6], lookFrom: [0.05, 0.95, 0.9], lookTo: [0.15, 0.95, 1.0], fov: 46 },
    Body: B((t) => (
      <Apartment lights="dim" tvGlow={0.9}>
        <Toon spec={C.hero} pose={{ sit: true, armR: "hold", armL: "hold", eyes: "smug", mouth: "smirk" }} pos={[0, 0, 0.8]} />
        <GameBox pos={[0.3, 0.62, 1.2]} rot={[-0.2, -0.2, 0]} scale={1.5} open={smooth((t - 0.6) / 0.8)} ring />
        <WallClock pos={[2.2, 2.55, -3.9]} text="12:00" sub="AM · NOV 19" scale={0.9} />
      </Apartment>
    )) },
  /* 2 "you'll spend 13 years dodging a wedding." - a wall calendar races from 2013 to 2026 while he sweats on the couch */
  2: { look: inL, focus: 2.6, cam: { from: [1.2, 1.35, -1.9], to: [1.5, 1.3, -1.5], lookFrom: [2.2, 1.35, 0.8], fov: 52 },
    Body: B((t) => {
      const yr = Math.min(2026, 2013 + Math.floor(clamp01(t / 2.4) * 13));
      return (
        <Apartment tvGlow={0.9}>
          <Toon spec={C.hero} pose={{ sit: true, eyes: t > 1.6 ? "shock" : "half", mouth: "wavy", sweat: t > 1.2, armL: "hold", armR: "hold" }} pos={[2.2, 0.35, 0.65]} />
          <Banner pos={[2.9, 2.15, 1.2]} rotY={Math.PI} text={String(yr)} sub="WEDDING: TBD" w={1.5} h={0.85} color="#2a3a8a" />
        </Apartment>
      );
    }) },
  /* 3 "But nobody warned you what she'd do on release night." - slow, ominous push to the old sticky note on the fridge */
  3: { look: dim, focus: 1.4, cam: { from: [-2.5, 1.5, -0.4], to: [-3.05, 1.25, -2.15], lookFrom: [-3.2, 1.2, -3.1], fov: 46, ease: "inout" },
    Body: B(() => <Apartment lights="dim"><Fridge pos={FR} note={{ key: "n1", lines: NOTE1, age: 0.85 }} /></Apartment>) },
  /* 4 "It's 2013." - midnight launch line outside a neon game store, crane down */
  4: { look: outL, focus: 9, cam: { from: [0, 7.5, 12], to: [0.4, 2.4, 8.5], lookFrom: [0, 1.5, -2], fov: 52, ease: "out" },
    Body: B(() => <StoreFront><Line /><Toon spec={C.hero} pose={{ eyes: "happy", mouth: "grin" }} pos={[-0.6, 0.12, -1.4]} /><Toon spec={C.gf} pose={{ eyes: "dot", mouth: "smile" }} pos={[0.7, 0.12, -1.4]} seed={3} /></StoreFront>) },
  /* 5 "Our guy is standing in line for GTA 5 at midnight, and his girlfriend asks," - two-shot in the line */
  5: { look: outL, focus: 3.4, cam: { from: [-0.6, 1.45, 3.0], to: [0.0, 1.4, 2.4], lookFrom: [0.05, 1.25, -1.4], fov: 46 },
    Body: B((t) => (
      <StoreFront>
        <Line />
        <Toon spec={C.hero} pose={{ eyes: "happy", mouth: "grin", armR: "wave", look: 1 }} pos={[-0.6, 0.12, -1.4]} />
        <Toon spec={C.gf} pose={{ eyes: t > 3.0 ? "dot" : "happy", mouth: t > 3.0 ? "open" : "smile", talk: t > 3.1, look: -1 }} pos={[0.7, 0.12, -1.4]} seed={3} />
      </StoreFront>
    )) },
  /* 6 "so when are we getting married?" - close on her */
  6: { look: outL, focus: 1.9, cam: { from: [0.95, 1.6, 0.55], to: [0.85, 1.58, 0.35], lookFrom: [0.7, 1.45, -1.4], fov: 36 },
    Body: B(() => <StoreFront><Toon spec={C.gf} pose={{ eyes: "dot", mouth: "open", talk: true, look: -1, armL: "hips" }} pos={[0.7, 0.12, -1.4]} seed={3} /><Toon spec={C.fan4} pose={{}} pos={[3.2, 0.12, -1.6]} /></StoreFront>) },
  /* 7 "He grins. When GTA 6 comes out," - close on our guy, smug grin */
  7: { look: outL, focus: 1.9, cam: { from: [-0.85, 1.6, 0.55], to: [-0.75, 1.58, 0.3], lookFrom: [-0.6, 1.45, -1.4], fov: 36 },
    Body: B((t) => <StoreFront><Toon spec={C.hero} pose={{ eyes: "smug", mouth: t < 0.6 ? "smirk" : "grin", talk: t > 0.9, armR: "point" }} pos={[-0.6, 0.12, -1.4]} /><Toon spec={C.fan3} pose={{}} pos={[-3.9, 0.12, -1.6]} /></StoreFront>) },
  /* 8 "the last one took five years. Easy." - he flashes five fingers; she narrows her eyes */
  8: { look: outL, focus: 3, cam: { from: [0.2, 1.35, 2.7], to: [0.1, 1.3, 2.3], lookFrom: [0.05, 1.35, -1.4], fov: 44 },
    Body: B((t) => (
      <StoreFront>
        <Line />
        <Toon spec={C.hero} pose={{ eyes: t > 1.6 ? "smug" : "happy", mouth: "grin", armR: "up", armL: t > 1.6 ? "shrug" : "down" }} pos={[-0.6, 0.12, -1.4]} />
        <Toon spec={C.gf} pose={{ eyes: "half", mouth: "flat", armL: "cross", armR: "cross" }} pos={[0.7, 0.12, -1.4]} seed={3} />
        <GameBox pos={[-1.15, 1.25, -1.3]} num="V" sub="GTA" scale={2.2} />
      </StoreFront>
    )) },
  /* 9 "She writes it on a sticky note and slaps it on the fridge." - the note slaps on at "slaps" @1.28 */
  9: { look: inL, focus: 2.6, cam: { from: [-1.3, 1.5, 0.3], to: [-1.6, 1.45, -0.2], lookFrom: [-2.9, 1.2, -3.0], fov: 48 },
    Body: B((t) => (
      <Apartment>
        <Fridge pos={FR} note={{ key: "n1", lines: NOTE1, age: 0, slap: 1.2 }} />
        <Toon spec={C.gf} pose={{ eyes: t > 1.3 ? "smug" : "dot", mouth: t > 1.3 ? "smile" : "flat", armR: t > 1.0 && t < 1.5 ? "point" : "hold" }} pos={[-2.5, 0, -2.5]} seed={3} />
      </Apartment>
    )) },
  /* 10 "Years pass." - time-lapse: the room's light cycles, the clock spins through the years */
  10: { look: inL, focus: 5, cam: { from: [3.6, 2.6, 3.8], to: [3.3, 2.5, 3.4], lookFrom: [-0.5, 1.2, -2.2], fov: 54 },
    Body: B((t) => {
      const yr = 2014 + Math.floor(clamp01(t / 1.2) * 7);
      return (
        <Apartment lights={Math.floor(t * 8) % 2 ? "on" : "dim"} tvGlow={0.4 + 0.5 * (Math.floor(t * 6) % 2)} stack={1 + Math.floor(t * 1.6)}>
          <Fridge pos={FR} note={{ key: "n1", lines: NOTE1, age: clamp01(t / 1.2) * 0.4 }} />
          <WallClock pos={[-0.2, 2.3, -3.88]} text={String(yr)} sub="" scale={0.9} />
          <Toon spec={C.hero} pose={{ sit: true, armL: "hold", armR: "hold", eyes: "happy", mouth: "grin" }} pos={[2.2, 0.35, 0.65]} />
        </Apartment>
      );
    }) },
  /* 11 "Rockstar keeps re-releasing GTA 5," - copies pile up on the coffee table */
  11: { look: inL, focus: 2.2, cam: { from: [3.6, 1.2, 0.6], to: [3.3, 1.1, 0.2], lookFrom: [2.0, 0.45, -1.1], fov: 46 },
    Body: B((t) => <Apartment stack={1 + Math.min(3, Math.floor(t / 0.55))}><Toon spec={C.hero} pose={{ sit: true, eyes: "happy", mouth: "grin", armR: "up" }} pos={[2.2, 0.35, 0.65]} /></Apartment>) },
  /* 12 "and every time she points at the fridge, he hands her a shiny new copy." - she points (@0.9), he hands her a box (@2.1) */
  12: { look: inL, focus: 3.4, cam: { from: [0.6, 1.45, 3.6], to: [0.3, 1.4, 3.1], lookFrom: [-0.8, 1.2, -0.6], fov: 50 },
    Body: B((t) => {
      const k = smooth((t - 2.0) / 0.5);
      return (
        <Apartment stack={4}>
          <Fridge pos={FR} note={{ key: "n1", lines: NOTE1, age: 0.4 }} />
          <Toon spec={C.gf} pose={{ eyes: t > 2.6 ? "half" : "angry", mouth: "flat", armR: t > 0.8 && t < 2.2 ? "point" : "hold", armL: "hips" }} pos={[-1.6, 0, -0.9]} seed={3} />
          <Toon spec={C.hero} pose={{ eyes: "happy", mouth: "grin", armL: t > 1.8 && t < 2.6 ? "point" : "down", armR: "hips" }} pos={[0.1, 0, -0.4]} />
          <GameBox pos={[lerp(-0.25, -1.2, k), lerp(1.1, 1.0, k), lerp(-0.25, -0.75, k)]} rot={[0, 0.3, 0]} num="V" sub="GTA" scale={2.2} />
          <Debris origin={[-0.6, 1.2, -0.5]} t0={2.4} n={12} colors={["#fff6c0"]} speed={1.2} size={0.04} seed={5} dir={[0, 1, 0]} />
        </Apartment>
      );
    }) },
  /* 13 "The note turns yellow." - macro on the note, it yellows and curls */
  13: { look: inL, focus: 0.9, cam: { from: [-3.15, 1.2, -2.15], to: [-3.18, 1.17, -2.45], lookFrom: [-3.2, 1.15, -3.1], fov: 40 },
    Body: B((t) => <Apartment><Fridge pos={FR} note={{ key: "n1", lines: NOTE1, age: 0.4 + clamp01(t / 1.8) * 0.6 }} /></Apartment>) },
  /* 14 "Then, in 2022, a teenager leaks GTA 6, using a hotel TV and an Amazon fire stick." - hotel room, hacking screen */
  14: { look: { ...dk, fog: "#0a0a14", fogFar: 26 }, focus: 3, cam: { from: [2.6, 1.6, 3.8], to: [1.8, 1.45, 3.0], lookFrom: [-0.6, 1.2, -1.6], lookTo: [-1.2, 1.3, -2.2], fov: 50 },
    Body: B((t) => (
      <HotelRoom>
        <Toon spec={C.teen} pose={{ sit: true, eyes: t > 3.4 ? "smug" : "dot", mouth: t > 3.4 ? "grin" : "flat", armR: "point", look: -1 }} pos={[0.4, 0.55, 0.4]} />
        <Banner pos={[1.9, 2.7, -2.85]} text="2022" sub="" w={1.4} h={0.7} color="#3a2a6a" />
      </HotelRoom>
    )) },
  /* 15 "Our guy stares at the fridge like it's a ticking bomb." - over-the-shoulder: the note, him sweating, red pulse */
  15: { look: dim, focus: 3.2, cam: { from: [-1.2, 1.6, 1.4], to: [-1.6, 1.55, 0.7], lookFrom: [-3.0, 1.25, -3.1], fov: 46 },
    Body: B((t) => (
      <Apartment lights="dim">
        <Fridge pos={FR} note={{ key: "n1", lines: NOTE1, age: 0.9 }} />
        <Toon spec={C.hero} pose={{ eyes: "shock", mouth: "wavy", sweat: true, shiver: true }} pos={[-2.0, 0, -0.6]} />
        <pointLight position={[-3.1, 1.6, -2.4]} intensity={4 + 4 * Math.max(0, Math.sin(t * 6))} distance={4} color="#ff2a3a" />
      </Apartment>
    )) },
  /* 16 "The trailer drops. 90 million views in one day." - the counter races to 90,000,000 on "day" @2.8 */
  16: { look: { ...dk, fog: "#0a0410", fogFar: 60 }, focus: 14, cam: { from: [0, 2.6, 12], to: [0, 3.2, 8], lookFrom: [0, 4.0, -8], lookTo: [0, 4.4, -8], fov: 56 },
    Body: B((t) => <Theater views={90421491 * Math.pow(clamp01(t / 2.8), 2.2)} />) },
  /* 17 "She texts him one emoji. A ring." - his phone lights up: a ring */
  17: { look: dim, focus: 0.5, cam: { from: [2.25, 1.15, 1.25], to: [2.25, 1.1, 1.05], lookFrom: [2.25, 0.95, 0.75], fov: 40 },
    Body: B((t) => (
      <Apartment lights="dim" tvGlow={0.9}>
        <Phone pos={[2.25, 0.95, 0.78]} rot={[-0.35, 0, 0]} screen={t > 0.6 ? "ring" : "trailer"} scale={1.8} />
        <Toon spec={C.hero} pose={{ sit: true, eyes: t > 1.6 ? "shock" : "dot", mouth: t > 1.6 ? "o" : "flat" }} pos={[2.2, 0.35, 0.3]} />
      </Apartment>
    )) },
  /* 18 "So he prays for a delay." - on his knees by the couch, hands together */
  18: { look: dim, focus: 1.9, cam: { from: [1.2, 1.15, -1.9], to: [1.4, 1.1, -1.5], lookFrom: [2.0, 0.85, 0.0], fov: 48 },
    Body: B(() => (
      <Apartment lights="dim" tvGlow={1}>
        <Toon spec={C.hero} pose={{ sit: true, armL: "warm", armR: "warm", eyes: "closed", mouth: "wavy" }} pos={[2.0, 0, 0.0]} />
        <pointLight position={[2.0, 3, 0.5]} intensity={6} distance={4} color="#fff2c0" />
      </Apartment>
    )) },
  /* 19 "Rockstar delivers. Twice." - DELAYED slams down, then DELAYED AGAIN on "Twice" @1.24 */
  19: { look: dk, focus: 4, cam: { from: [0.2, 2.0, 2.6], to: [0.1, 2.0, 2.0], lookFrom: [0.2, 2.0, -3.8], fov: 50 },
    Body: B((t) => (
      <Apartment lights="dim" tvGlow={1.2}>
        <Banner pos={[-0.6, 2.4, -3.7]} text="DELAYED" sub="TO MAY 2026" drop={clamp01(t / 0.3)} />
        {t > 1.2 ? <Banner pos={[0.7, 1.5, -3.5]} text="AGAIN" sub="NOV 19, 2026" drop={clamp01((t - 1.2) / 0.3)} color="#8a0a2a" /> : null}
        <Toon spec={C.hero} pose={{ eyes: "happy", mouth: "grin", armL: "up", armR: "up" }} pos={[1.6, 0, -1.6]} />
      </Apartment>
    )) },
  /* 20 "Each time he tells her they just need more time to get it right." - he explains, she isn't buying it */
  20: { look: inL, focus: 3.0, cam: { from: [-0.3, 1.45, 2.8], to: [-0.2, 1.4, 2.3], lookFrom: [-0.2, 1.25, -0.75], fov: 48 },
    Body: B((t) => (
      <Apartment stack={4}>
        <Toon spec={C.hero} pose={{ eyes: "smug", mouth: "smile", talk: true, armR: "shrug", armL: "shrug" }} pos={[0.5, 0, -0.6]} />
        <Toon spec={C.gf} pose={{ eyes: t > 2.0 ? "half" : "angry", mouth: "flat", armL: "cross", armR: "cross" }} pos={[-0.9, 0, -0.9]} seed={3} />
      </Apartment>
    )) },
  /* 21 "Finally, release night. Midnight." - the clock flips 11:59 PM -> 12:00 AM on "Midnight" @1.92 */
  21: { look: dk, focus: 1.6, cam: { from: [0.9, 2.3, -2.0], to: [0.9, 2.3, -2.4], lookFrom: [0.9, 2.3, -3.88], fov: 40 },
    Body: B((t) => <Apartment lights="dim" tvGlow={0.8}><WallClock pos={[0.9, 2.3, -3.86]} text={t < 1.9 ? "11:59" : "12:00"} sub={t < 1.9 ? "PM · NOV 18" : "AM · NOV 19"} scale={0.9} /></Apartment>) },
  /* 22 "He's got a ring hidden in the game box, ready to kneel." - he slips in the door, the box opens on "ring" @0.9 */
  22: { look: dim, focus: 2.4, cam: { from: [-2.6, 1.3, 3.4], to: [-2.9, 1.2, 2.8], lookFrom: [-3.7, 1.0, 1.2], fov: 48 },
    Body: B((t) => {
      const k = smooth(t / 1.8);
      return (
        <Apartment lights="dim" doorOpen={1 - smooth((t - 1.6) / 0.6)}>
          <Toon spec={C.hero} pose={{ walk: k < 1 ? 0.6 : 0, eyes: "smug", mouth: "smirk", armR: "hold" }} pos={[0, 0, 0]} path={{ from: [-4.5, 0, 1.4], to: [-3.4, 0, 1.0], start: 0, end: 1.8 }} />
          <GameBox pos={[lerp(-4.15, -3.05, k), 0.95, lerp(1.75, 1.4, k)]} rot={[0, 0.6, 0]} scale={1.5} open={smooth((t - 0.8) / 0.6)} ring />
        </Apartment>
      );
    }) },
  /* 23 "But the apartment's empty." - wide, dark, nobody there; he freezes */
  23: { look: dk, focus: 5.5, cam: { from: [1.6, 2.4, 3.9], to: [1.4, 2.3, 3.6], lookFrom: [-2.2, 1.0, 0.0], fov: 58 },
    Body: B(() => (
      <Apartment lights="off" tvGlow={0.15}>
        <Toon spec={C.hero} pose={{ eyes: "shock", mouth: "o", armR: "hold" }} pos={[-3.2, 0, 0.9]} />
        <GameBox pos={[-2.95, 0.95, 1.2]} rot={[0, 0.6, 0]} scale={1.5} open={1} ring />
      </Apartment>
    )) },
  /* 24 "Just a new sticky note on the fridge. Chapel's booked. 9am, game's in my car." - push in to the new note */
  24: { look: dim, focus: 0.8, cam: { from: [-2.6, 1.5, -0.6], to: [-3.12, 1.18, -2.6], lookFrom: [-3.2, 1.15, -3.1], fov: 42, ease: "inout" },
    Body: B(() => <Apartment lights="dim"><Fridge pos={FR} note={{ key: "n2", lines: NOTE2, age: 0 }} /></Apartment>) },
  /* 25 "And for the first time in 13 years, he's racing out the door for something bigger than GTA." - he sprints down the neon street, box under his arm */
  25: { look: outL, focus: 5, cam: { from: [-6, 1.5, 6.5], to: [5, 1.8, 7.0], lookFrom: [-4, 1.2, 2.0], lookTo: [9, 1.3, 2.0], fov: 52, ease: "linear" },
    Body: B((t) => {
      const x = -5.5 + t * 2.4;
      return (
        <StoreFront>
          <Toon spec={C.hero} pose={{ walk: 2.2, eyes: "happy", mouth: "grin", armR: "hold" }} pos={[x, 0.02, 2.0]} />
          <GameBox pos={[x + 0.35, 1.05, 2.15]} rot={[0, 0.2, 0]} scale={2.2} num="6" sub="GTA" />
        </StoreFront>
      );
    }) },
};
