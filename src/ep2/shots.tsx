// Episode 2 shot list: one entry per voice line (episodes/ep2/shots.json). Times inside a shot are seconds from its first word;
// every action is placed on its word (see the comments: "word" @ seconds).
import React from "react";
import type { CamKeys, Look, V3 } from "../engine/Stage";
import { Toon } from "../engine/Toon";
import { C } from "./cast";
import { dayLook, duskLook, stormLook, garageLook, Town, Garage, Cockpit, Gantry } from "./sets";
import { Plains, Oak, ArrowSign, Car, Debris, Dust, Money, Rain, Board, LawnChair, Chainsaw, TREE, crashZ, useT, clamp01, smooth, lerp } from "./world";

export type Shot = { look: Look; cam: CamKeys; focus: number; Body: React.FC<{ dur: number }> };
const B = (fn: (t: number, dur: number) => React.ReactNode): React.FC<{ dur: number }> => ({ dur }) => { const t = useT(); return <>{fn(t, dur)}</>; };

const day = dayLook(), dusk = duskLook(), storm = stormLook(), garage = garageLook();
const ARROW: V3 = [TREE[0] - 1.05, 3.1, TREE[2] + 0.55];
const AROT = -Math.PI / 4;
const TOW: V3 = [9.0, 0, 9.5];
const CHAIR: V3 = [7.9, 0, 4.6];
const grassNear = (x: number, z: number, n = 5000, r = 9) => ({ center: [x, 0, z] as V3, radius: r, count: n });

/* the day world around the oak, with optional extras */
const World: React.FC<{ look?: "day" | "dusk" | "night"; arrow?: number; tree?: "tree" | "stump" | "fallen" | "none"; grass?: { center: V3; radius: number; count: number }[]; tow?: boolean; skid?: boolean; children?: React.ReactNode; treeShake?: number; wrecks?: number }> =
  ({ look = "day", arrow = 0, tree = "tree", grass = [], tow, skid, children, treeShake = 0, wrecks = 0 }) => (
  <group>
    <Plains night={look === "night"} grass={grass} skid={skid} />
    {tree === "tree" ? <Oak shake={treeShake} /> : null}
    {tree === "stump" || tree === "fallen" ? <Oak stump /> : null}
    {tree === "fallen" ? <Oak fall={1} fallDir={0} /> : null}
    {arrow > 0 && tree === "tree" ? <ArrowSign pos={ARROW} rotY={AROT} lit={arrow} night={look === "night"} /> : null}
    {tow ? <TowTruck /> : null}
    {wrecks > 0 ? <Car kind="sedan" color="#c9a227" pos={[4.6, 0, 10.5]} rotY={Math.PI - 0.7} crumple={1} /> : null}
    {wrecks > 1 ? <Car kind="van" color="#3a6ea8" pos={[8.6, 0, -4.5]} rotY={Math.PI + 0.4} crumple={1} /> : null}
    {children}
  </group>
);
const TowTruck: React.FC<{ pos?: V3 }> = ({ pos = TOW }) => (
  <group>
    <Car kind="tow" color="#c9302a" pos={pos} rotY={Math.PI} />
    <Board pos={[pos[0] + 0.0, 2.25, pos[2] + 0.4]} rotY={-0.6} w={2.3} h={1.0} k="towsign" draw={(g) => {
      const W = g.canvas.width, H = g.canvas.height; g.fillStyle = "#f6ead2"; g.fillRect(0, 0, W, H); g.strokeStyle = "#c9302a"; g.lineWidth = 14; g.strokeRect(7, 7, W - 14, H - 14);
      g.fillStyle = "#c9302a"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${H * 0.36}px Arial Black, Arial, sans-serif`; g.fillText("TREE TOWING", W / 2, H * 0.36);
      g.fillStyle = "#2a6a3a"; g.font = `900 ${H * 0.26}px Arial, sans-serif`; g.fillText("$ CASH ONLY $", W / 2, H * 0.72);
    }} />
  </group>
);

/* a car that drifts out of its lane and hits the oak at tHit */
const DriftCrash: React.FC<{ t: number; tHit: number; kind?: "sedan" | "van" | "cruiser"; color: string; z0?: number; lights?: boolean; x0?: number; xHit?: number; zHit?: number; seed?: number }> = ({ t, tHit, kind = "sedan", color, z0 = 45, lights, x0 = 1.75, xHit = 5.1, zHit = 2.95, seed = 3 }) => {
  const s = crashZ(t, z0, zHit, tHit);
  const k = clamp01((z0 - s.z) / (z0 - zHit));
  const x = lerp(x0, xHit, smooth(Math.max(0, (k - 0.35) / 0.65)));
  const yaw = Math.PI - (s.after < 0 ? 0.25 * Math.sin(Math.PI * clamp01((k - 0.35) / 0.65)) : 0.2) - (s.after >= 0 ? 0.08 * smooth(s.after * 4) : 0);
  const pitch = s.after >= 0 ? 0.07 * Math.exp(-s.after * 5) * Math.sin(s.after * 18) : 0;
  return (
    <group>
      <Car kind={kind} color={color} pos={[x, 0, s.z]} rotY={yaw} crumple={s.crumple} dist={z0 - s.z} lights={lights} pitch={-pitch} flash={kind === "cruiser" && false} />
      <Debris origin={[5.4, 0.8, 1.2]} t0={tHit} seed={seed} dir={[-0.4, 0.7, 1]} />
      <Debris origin={[6.2, 6, 0]} t0={tHit} n={30} colors={["#4a8a26", "#6fb238", "#3d7a1e"]} speed={2} size={0.12} seed={seed + 7} dir={[0, -0.2, 0]} />
      <Dust origin={[5.4, 0.2, 1.4]} t0={tHit} n={10} spread={1.6} size={1.6} seed={seed} />
    </group>
  );
};

/* stump flip: the car hits the stump at speed and stands on its nose */
const StumpFlip: React.FC<{ t: number; tHit: number; z0: number; color?: string; kind?: "cruiser" | "sedan"; lights?: boolean; occupant?: boolean }> = ({ t, tHit, z0, color = "#f2f2ee", kind = "cruiser", lights, occupant }) => {
  const zHit = 3.0, v = (z0 - zHit) / tHit, a = t - tHit;
  const z = a < 0 ? z0 - v * t : zHit - Math.min(0.8, a * 1.6);
  const k = clamp01((z0 - z) / (z0 - zHit));
  const x = lerp(1.75, 6.0, smooth(Math.max(0, (k - 0.3) / 0.7)));
  const pitch = a < 0 ? 0 : a < 0.45 ? 1.38 * Math.sin((a / 0.45) * Math.PI / 2) : 1.38 + 0.04 * Math.sin((a - 0.45) * 10) * Math.exp(-(a - 0.45) * 3);
  return (
    <group>
      <Car kind={kind} color={color} pos={[x, 0, z]} rotY={Math.PI - 0.12 * smooth(k)} pitch={pitch} crumple={a > 0 ? clamp01(a / 0.1) * 0.6 : 0} dist={z0 - z} lights={lights} glass={occupant ? 0.25 : 0.55}>
        {occupant ? <Toon spec={C.sheriff} pose={{ eyes: a > 0 ? "shock" : "happy", mouth: a > 0 ? "o" : "grin", armL: "hold", armR: "hold" }} pos={[0.4, 0.3, 0.1]} h={1.32} /> : null}
      </Car>
      <Debris origin={[6.2, 0.6, 1.5]} t0={tHit} seed={11} dir={[0, 1, 0.6]} speed={5} />
      <Dust origin={[6.2, 0.2, 1.6]} t0={tHit} n={12} spread={2} size={1.8} seed={4} />
    </group>
  );
};

/* the sheriff's cruiser rolling slowly (15 mph = 6.7 m/s) */
const V15 = 6.7;

export const SHOTS: Record<number, Shot> = {
  /* 1 "If you put the only tree for 20 miles" - our guy drops a seed, "tree" @1.04: the oak bursts out of the ground and flings him */
  1: { look: day, focus: 4.5, cam: { from: [7.6, 1.15, 5.2], to: [9.4, 3.2, 13.5], lookFrom: [5.9, 1.05, 0.4], lookTo: [5.6, 3.6, 0], fov: 50, fovTo: 56, ease: "inout" },
    Body: B((t) => {
      const g = t < 0.95 ? 0 : 1 + 0.12 * Math.sin(clamp01((t - 0.95) / 0.45) * Math.PI) * Math.exp(-(t - 0.95) * 2);
      const grow = t < 0.95 ? 0.001 : Math.min(g, smooth((t - 0.95) / 0.38) * g);
      const fly = clamp01((t - 1.0) / 0.75);
      const hp: V3 = t < 1.0 ? [5.3, 0, 1.1] : [5.3 - fly * 2.6, Math.max(0, 2.6 * Math.sin(fly * Math.PI) * (1 - fly * 0.3)), 1.1 + fly * 3.2];
      const roll = t < 1.0 ? 0 : t < 1.75 ? fly * 5.5 : 1.45;
      return (
        <World tree="none" grass={[grassNear(6, 3, 7000, 10)]}>
          <Oak grow={grow} />
          <mesh position={[TREE[0], 0.02, TREE[2]]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[t < 0.95 ? 0.6 : 1.4, 24]} /><meshStandardMaterial color="#5a3e26" roughness={1} /></mesh>
          <Dust origin={[TREE[0], 0.2, TREE[2]]} t0={0.95} n={16} spread={2.2} size={1.8} color="#8a6a45" />
          <Debris origin={[TREE[0], 0.3, TREE[2]]} t0={0.95} n={36} colors={["#5a3e26", "#7a5a3a", "#3a2a1a"]} speed={5} seed={21} dir={[0, 1, 0]} />
          <group position={hp} rotation={[0, 0, roll]}>
            <Toon spec={C.hero} pose={t < 1.0 ? { armR: t < 0.5 ? "point" : "down", eyes: "smug", mouth: "smirk" } : t < 1.75 ? { eyes: "shock", mouth: "o", armL: "up", armR: "up" } : { eyes: "closed", mouth: "wavy", sit: true }} pos={[0, 0, 0]} yaw={0.5} />
          </group>
        </World>
      );
    }) },
  /* 2 "beside a dead straight road" - wide, the tree beside the endless road */
  2: { look: day, focus: 22, cam: { from: [1.2, 1.9, 24], to: [0.6, 2.4, 30], lookFrom: [3.0, 3.6, -20], lookTo: [2.4, 3.2, -40], fov: 55, ease: "out" },
    Body: B(() => <World grass={[grassNear(8, 14, 5000, 12)]}><Toon spec={C.hero} pose={{ eyes: "closed", mouth: "wavy", sit: true }} pos={[2.7, 0, 4.3]} /></World>) },
  /* 3 "you'll never stop people wrecking their cars on it" - "wrecking" @1.0: a car drifts off its lane into the trunk */
  3: { look: day, focus: 14, cam: { from: [-1.6, 1.8, 17], to: [-1.0, 1.7, 14.5], lookFrom: [5.0, 1.6, 0], fov: 50, ease: "out" },
    Body: B((t) => <World grass={[grassNear(9, 6, 5000, 10)]} treeShake={t > 1.0 ? Math.exp(-(t - 1.0) * 4) : 0}><DriftCrash t={t} tHit={1.0} color="#b8322a" z0={34} /></World>) },
  /* 4 "Here's why. You see, the road is flat," - low glide down the centre line, dips to the asphalt on "flat" @2.0 */
  4: { look: day, focus: 40, cam: { from: [0, 1.3, 38], to: [0.1, 0.35, 22], lookFrom: [0, 1.0, -200], lookTo: [0, 0.3, -200], fov: 52, ease: "inout" },
    Body: B(() => <World wrecks={1} />) },
  /* 5 "empty, and straight as a ruler" - rise high: the road ruler-straight to the horizon */
  5: { look: day, focus: 60, cam: { from: [0, 1.0, 22], to: [0.5, 15, 44], lookFrom: [0, 0.6, -150], lookTo: [0, 0, -120], fov: 52, ease: "inout" },
    Body: B(() => <World />) },
  /* 6 "And right at the edge stands one tree." - crane down to the lone oak at the road's edge ("tree" @1.68) */
  6: { look: day, focus: 18, cam: { from: [-4, 9, 32], to: [0.2, 3.0, 17], lookFrom: [4, 2, -10], lookTo: [6.2, 4.4, 0], fov: 50, ease: "inout" },
    Body: B(() => <World grass={[grassNear(8, 8, 4000, 10)]} />) },
  /* 7 "Yet every week, somebody plows into it." - the DAYS SINCE LAST CRASH board flips 7 -> 0 on "plows" @1.44 as a van hits */
  7: { look: day, focus: 6, cam: { from: [2.4, 1.55, 17.5], to: [2.9, 1.5, 15.8], lookFrom: [5.3, 1.6, 6], lookTo: [5.6, 1.7, 4], fov: 50 },
    Body: B((t) => (
      <World grass={[grassNear(8, 10, 5000, 10)]} treeShake={t > 1.44 ? Math.exp(-(t - 1.44) * 4) : 0}>
        <DriftCrash t={t} tHit={1.44} kind="van" color="#3a6ea8" z0={40} seed={7} />
        <Board pos={[5.2, 0, 11]} rotY={-0.35} w={1.5} h={1.7} post={0.9} k={"days" + (t < 1.5 ? 7 : 0)} draw={(g) => {
          const W = g.canvas.width, H = g.canvas.height; g.fillStyle = "#f2f0e8"; g.fillRect(0, 0, W, H); g.fillStyle = "#c62b22"; g.fillRect(0, 0, W, H * 0.34);
          g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${H * 0.09}px Arial Black, Arial`; ["DAYS SINCE", "LAST CRASH"].forEach((l, i) => g.fillText(l, W / 2, H * (0.11 + i * 0.12)));
          g.fillStyle = "#1a1a1e"; g.fillRect(W * 0.25, H * 0.42, W * 0.5, H * 0.5); g.fillStyle = "#f2f0e8"; g.font = `900 ${H * 0.42}px Arial Black, Arial`; g.fillText(t < 1.5 ? "7" : "0", W / 2, H * 0.68);
        }} />
      </World>
    )) },
  /* 8 "So the town bolts a giant glowing arrow to the trunk," - workers on ladders, lights on at "glowing" @1.54 */
  8: { look: day, focus: 5.5, cam: { from: [2.6, 1.0, 7.4], to: [3.0, 1.3, 6.2], lookFrom: [6.0, 2.6, 0.6], lookTo: [5.9, 3.0, 0.5], fov: 54 },
    Body: B((t) => {
      const up = smooth(t / 1.2);
      return (
        <World arrow={t > 1.54 ? 1 : 0} grass={[grassNear(6, 4, 4000, 7)]}>
          {t <= 1.54 ? <ArrowSign pos={[ARROW[0], lerp(1.6, ARROW[1], up), ARROW[2]]} rotY={AROT} lit={0} /> : null}
          <Ladder pos={[4.6, 0, 1.6]} />
          <Toon spec={C.worker1} pose={{ armR: "up", armL: "hold", eyes: "dot", mouth: t > 1.54 ? "grin" : "flat" }} pos={[4.75, 1.25, 1.75]} />
          <Toon spec={C.worker2} pose={{ armL: "point", armR: "hips", eyes: t > 1.54 ? "happy" : "dot", mouth: "smile", talk: t < 1.4 }} pos={[3.4, 0, 3.6]} seed={2} />
          <Debris origin={[ARROW[0], ARROW[1], ARROW[2] + 0.3]} t0={1.0} n={10} colors={["#ffd860"]} speed={2} size={0.05} seed={31} />
        </World>
      );
    }) },
  /* 9 "so nobody can miss it. The crashes double." - dusk, the arrow glows; a second car hits on "double" @2.1 */
  9: { look: dusk, focus: 16, cam: { from: [-0.6, 1.7, 21], to: [0.4, 1.9, 17.5], lookFrom: [5.5, 2.6, 0], fov: 50 },
    Body: B((t) => (
      <World look="dusk" arrow={1} wrecks={1} treeShake={t > 2.1 ? Math.exp(-(t - 2.1) * 4) : 0}>
        <DriftCrash t={t} tHit={2.1} color="#2e8a6a" z0={52} lights xHit={4.0} zHit={6.4} seed={13} />
      </World>
    )) },
  /* 10 "Our guy, the local tow truck driver," - our guy and his TREE TOWING truck */
  10: { look: day, focus: 4.2, cam: { from: [5.4, 1.45, 15.6], to: [5.9, 1.5, 14.6], lookFrom: [8.3, 1.6, 11], lookTo: [8.1, 1.55, 10.8], fov: 50 },
    Body: B((t) => (
      <World arrow={1} tow wrecks={2} grass={[grassNear(7, 12, 4000, 7)]}>
        <Toon spec={C.hero} pose={{ armR: t > 0.8 ? "point" : "hips", armL: "hips", eyes: "smug", mouth: "smirk" }} pos={[7.4, 0, 11.6]} />
      </World>
    )) },
  /* 11 "sets up a lawn chair beside it. Business has never been better." - chair opens @0.7, he sits; cash rains on "better" @2.94 */
  11: { look: day, focus: 3.6, cam: { from: [5.3, 1.3, 8.0], to: [5.8, 1.15, 7.2], lookFrom: [7.8, 1.0, 4.4], fov: 52 },
    Body: B((t) => (
      <World arrow={1} tow wrecks={2} grass={[grassNear(7, 6, 5000, 7)]}>
        <LawnChair pos={CHAIR} rotY={-Math.PI / 2 - 0.4} open={smooth((t - 0.5) / 0.4)} />
        <Toon spec={C.hero} pose={t < 1.1 ? { armR: "hold", eyes: "smug", mouth: "smirk" } : { sit: true, armL: t > 2.9 ? "up" : "hips", armR: t > 2.9 ? "up" : "hips", eyes: t > 2.9 ? "happy" : "smug", mouth: t > 2.9 ? "grin" : "smirk" }} pos={t < 1.1 ? [7.3, 0, 5.2] : [CHAIR[0] - 0.1, 0.05, CHAIR[2]]} />
        <Money origin={[CHAIR[0], 0, CHAIR[2]]} t0={2.85} n={40} seed={5} area={3} />
      </World>
    )) },
  /* 12 "Finally, the sheriff drives out to see it." - the cruiser pulls away from the SHERIFF office */
  12: { look: day, focus: 9, cam: { from: [-7.5, 1.5, 7.5], to: [5, 1.7, 8.5], lookFrom: [-1, 1.4, -1.5], lookTo: [14, 1.3, 0], fov: 50, ease: "inout" },
    Body: B((t) => {
      const x = -2 + 13 * smooth(t / 2.6) + t * 2;
      return (
        <Town>
          <Car kind="cruiser" color="#f2f2ee" pos={[x, 0, 1.8]} rotY={Math.PI / 2} dist={x} glass={0.3}>
            <Toon spec={C.sheriff} pose={{ eyes: "angry", mouth: "flat", armL: "hold", armR: "hold" }} pos={[-0.4, 0.12, 0.1]} h={1.55} />
          </Car>
          <Toon spec={C.driver2} pose={{ armR: "wave", eyes: "dot", mouth: "smile" }} pos={[-9, 0.16, -6.2]} seed={4} />
        </Town>
      );
    }) },
  /* 13 "He creeps along at 15 miles an hour," - YOUR SPEED sign shows 15 on "15" @0.94 */
  13: { look: day, focus: 8, cam: { from: [-6.5, 1.5, 9.5], to: [-6.0, 1.45, 6.5], lookFrom: [3.0, 1.5, 6], lookTo: [3.0, 1.5, 2.5], fov: 50 },
    Body: B((t) => {
      const z = 13 - V15 * t;
      return (
        <World>
          <Toon spec={C.driver2} pose={{ walk: 0.8, eyes: "dot", mouth: "smile" }} pos={[0, 0, 0]} path={{ from: [-4.6, 0, 1.5], to: [-4.6, 0, 6], start: 0, end: 2.6 }} seed={6} />
          <Car kind="cruiser" color="#f2f2ee" pos={[1.75, 0, z]} rotY={Math.PI} dist={13 - z} glass={0.3}>
            <Toon spec={C.sheriff} pose={{ eyes: "wide", mouth: "flat", armL: "hold", armR: "hold" }} pos={[0.4, 0.3, 0.1]} h={1.32} />
          </Car>
          <Board pos={[4.9, 0, 3.0]} rotY={-1.05} w={1.2} h={1.5} post={1.3} posts={1} k={"speed" + (t > 0.94 ? 15 : 0)} glow={0.15} draw={(g) => {
            const W = g.canvas.width, H = g.canvas.height; g.fillStyle = "#f2f0e8"; g.fillRect(0, 0, W, H); g.fillStyle = "#1a1a1e"; g.textAlign = "center"; g.textBaseline = "middle";
            g.font = `900 ${H * 0.13}px Arial`; g.fillText("YOUR", W / 2, H * 0.12); g.fillText("SPEED", W / 2, H * 0.26);
            g.fillRect(W * 0.12, H * 0.38, W * 0.76, H * 0.55); g.fillStyle = "#ffcf2a"; g.font = `900 ${H * 0.4}px Courier New, monospace`; if (t > 0.94) g.fillText("15", W / 2, H * 0.67);
          }} />
        </World>
      );
    }) },
  /* 14 "both hands glued to the wheel," - close on the sheriff through the window, staring */
  14: { look: day, focus: 2.9, cam: { from: [-1.6, 1.62, 20.5], to: [-1.5, 1.6, 20.5 - V15 * 2.0], lookFrom: [1.35, 1.2, 20.4], lookTo: [1.35, 1.2, 20.4 - V15 * 2.0], fov: 34, ease: "linear", sway: 0.4 },
    Body: B((t) => {
      const z = 20.6 - V15 * t;
      return (
        <World>
          <Car kind="cruiser" color="#f2f2ee" pos={[1.75, 0, z]} rotY={Math.PI} dist={20 - z} glass={0.12}>
            <Toon spec={C.sheriff} pose={{ eyes: "wide", mouth: "flat", armL: "hold", armR: "hold", sweat: true, look: 1 }} pos={[0.4, 0.3, 0.1]} h={1.32} />
          </Car>
        </World>
      );
    }) },
  /* 15 "and smacks straight into it." - a slow, gentle bonk into the trunk @0.3 */
  15: { look: day, focus: 6.5, cam: { from: [2.6, 1.35, 9.4], to: [2.9, 1.35, 8.6], lookFrom: [5.8, 1.4, 1.8], fov: 50 },
    Body: B((t) => {
      const s = crashZ(t, 3.15 + V15 * 0.3, 3.15, 0.3);
      return (
        <World arrow={1} tow treeShake={t > 0.3 ? Math.exp(-(t - 0.3) * 4) * 0.6 : 0} grass={[grassNear(6, 6, 4000, 7)]}>
          <Car kind="cruiser" color="#f2f2ee" pos={[5.25, 0, s.z]} rotY={Math.PI - 0.15} crumple={s.crumple * 0.35} dist={6 - s.z} glass={0.3} pitch={s.after > 0 ? -0.04 * Math.exp(-s.after * 5) * Math.sin(s.after * 20) : 0}>
            <Toon spec={C.sheriff} pose={{ eyes: s.after > 0 ? "shock" : "wide", mouth: s.after > 0 ? "o" : "flat", armL: "hold", armR: "hold" }} pos={[0.4, 0.3, 0.1]} h={1.32} />
          </Car>
          <Debris origin={[6.2, 6, 0]} t0={0.3} n={30} colors={["#4a8a26", "#6fb238"]} speed={1.5} size={0.12} seed={41} dir={[0, -0.2, 0]} />
        </World>
      );
    }) },
  /* 16 "He storms out, grabs a chainsaw off the tow truck," - furious walk to the truck, the saw comes up on "chainsaw" @1.44 */
  16: { look: day, focus: 6, cam: { from: [3.4, 1.55, 12.5], to: [4.2, 1.6, 11.6], lookFrom: [7.0, 1.5, 6.5], lookTo: [7.8, 1.6, 7.8], fov: 50 },
    Body: B((t) => {
      const k = smooth(t / 1.3);
      const p: V3 = [lerp(4.4, 7.4, k), 0, lerp(4.4, 8.2, k)];
      return (
        <World arrow={1} tow grass={[grassNear(7, 7, 4000, 7)]}>
          <Car kind="cruiser" color="#f2f2ee" pos={[5.25, 0, 3.15]} rotY={Math.PI - 0.15} crumple={0.35} />
          <Toon spec={C.sheriff} pose={t < 1.44 ? { walk: 1.3, eyes: "angry", mouth: "frown" } : { armR: "up", armL: "hips", eyes: "angry", mouth: "grin" }} pos={p} path={{ from: [4.4, 0, 4.4], to: [7.4, 0, 8.2], start: 0, end: 1.3 }} />
          {t > 1.44 ? <Chainsaw pos={[7.75, 2.0, 8.1]} rotZ={0.6} rotY={-0.5} run /> : null}
          <Toon spec={C.hero} pose={{ sit: true, eyes: t > 1.44 ? "shock" : "dot", mouth: t > 1.44 ? "o" : "smile" }} pos={[CHAIR[0] - 0.1, 0.05, CHAIR[2]]} />
          <LawnChair pos={CHAIR} rotY={-Math.PI / 2 - 0.4} />
        </World>
      );
    }) },
  /* 17 "and cuts the tree down," - sawdust, the oak tips and falls on "down" @0.76 */
  17: { look: day, focus: 18, cam: { from: [-1.2, 2.4, 17], to: [-0.6, 2.8, 15.5], lookFrom: [8, 4.2, 0], fov: 54 },
    Body: B((t) => {
      // falling rigid rod about its base: th'' = (3g / 2L) sin(th), from a small start angle
      let th = 0.02, w = 0; const dt = 1 / 240, L = 9; for (let s = 0.08; s < t; s += dt) { if (th >= Math.PI / 2) { th = Math.PI / 2; break; } w += (3 * 9.81 / (2 * L)) * Math.sin(th) * dt; th += w * dt; }
      const fall = t < 0.08 ? 0 : th / (Math.PI / 2);
      const landT = 0.08 + 1.05;
      return (
        <World tree="none" tow grass={[grassNear(9, 6, 4000, 10)]}>
          <Oak stump />
          <Oak fall={fall} fallDir={0} />
          <Toon spec={C.sheriff} pose={{ armR: "up", armL: "hips", eyes: "angry", mouth: "grin" }} pos={[4.6, 0, 1.4]} />
          <Chainsaw pos={[5.0, 0.9, 0.9]} rotY={-1.2} run={t < 0.5} />
          <Debris origin={[5.6, 0.6, 0.6]} t0={0} n={40} colors={["#e8c98a", "#d8b47a"]} speed={2.5} size={0.05} seed={51} dir={[-1, 0.5, 0.5]} />
          <Dust origin={[13, 0.3, 0]} t0={landT} n={16} spread={4} size={2.6} seed={8} />
        </World>
      );
    }) },
  /* 18 "while our guy watches his paycheck hit the dirt." - our guy in his chair; his cash blows away on "dirt" @2.04 */
  18: { look: day, focus: 3.4, cam: { from: [5.6, 1.25, 8.6], to: [5.9, 1.15, 7.8], lookFrom: [7.8, 1.0, 4.6], fov: 50 },
    Body: B((t) => (
      <World tree="fallen" tow grass={[grassNear(7, 6, 4000, 7)]}>
        <LawnChair pos={CHAIR} rotY={-Math.PI / 2 - 0.4} />
        <Toon spec={C.hero} pose={{ sit: true, eyes: "sad", mouth: "wavy", sweat: t > 1.2 }} pos={[CHAIR[0] - 0.1, 0.05, CHAIR[2]]} />
        <Money origin={[CHAIR[0], 0, CHAIR[2]]} t0={2.0} n={26} mode="blow" seed={6} area={1.5} />
      </World>
    )) },
  /* 19 "The day his cruiser is fixed," - in the garage the cruiser shines, our guy hands over the keys */
  19: { look: garage, focus: 7, cam: { from: [-1.0, 1.7, 9.5], to: [-0.6, 1.6, 8.4], lookFrom: [0.3, 1.2, 0.5], fov: 54 },
    Body: B((t) => (
      <Garage>
        <Car kind="cruiser" color="#f2f2ee" pos={[0, 0, 0]} rotY={0.35} />
        <Toon spec={C.hero} pose={{ armR: "hold", prop: "coin", eyes: "smug", mouth: "smirk" }} pos={[2.4, 0, 2.2]} />
        <Toon spec={C.sheriff} pose={{ eyes: "happy", mouth: "grin", armL: "wave" }} pos={[-1.8, 0, 2.6]} seed={3} />
        <Debris origin={[0, 1.5, 0.5]} t0={0.1} n={14} colors={["#fff6c0"]} speed={1.2} size={0.05} seed={61} dir={[0, 1, 0]} />
        {t > 0 ? null : null}
      </Garage>
    )) },
  /* 20 "the sheriff heads back out to enjoy his empty road," - tracking alongside, the sheriff grinning */
  20: { look: day, focus: 4, cam: { from: [-2.6, 1.6, 140], to: [-2.6, 1.6, 140 - 22 * 3.0], lookFrom: [1.75, 1.2, 137], lookTo: [1.75, 1.2, 137 - 22 * 3.0], fov: 46, ease: "linear", sway: 0.6 },
    Body: B((t) => {
      const z = 138 - 22 * t;
      return (
        <World tree="stump">
          <Car kind="cruiser" color="#f2f2ee" pos={[1.75, 0, z]} rotY={Math.PI} dist={138 - z} glass={0.15} bob={Math.sin(t * 9) * 0.01}>
            <Toon spec={C.sheriff} pose={{ eyes: "happy", mouth: "grin", armL: "hold", armR: "wave" }} pos={[0.4, 0.3, 0.1]} h={1.32} />
          </Car>
        </World>
      );
    }) },
  /* 21 "and slams right into the stump." - the cruiser hits the stump on "stump" @1.4 and stands on its nose */
  21: { look: day, focus: 11, cam: { from: [-1.2, 1.7, 14.5], to: [-0.8, 1.9, 13.2], lookFrom: [5.6, 1.4, 1], fov: 52 },
    Body: B((t) => <World tree="stump" grass={[grassNear(8, 5, 4000, 8)]}><StumpFlip t={t} tHit={1.35} z0={40} occupant /></World>) },
  /* 22 "So how does this keep happening?" - lighting change: stormy night, rain, the driver's view */
  22: { look: storm, focus: 30, cam: { from: [1.4, 1.2, 90], to: [1.5, 1.2, 74], lookFrom: [1.6, 1.0, 0], lookTo: [2.0, 1.1, 0], fov: 58, ease: "linear", sway: 0.3 },
    Body: B((t) => (
      <World look="night" arrow={1}>
        <Rain center={[1.5, 0, 75]} area={[26, 14, 40]} count={2600} />
        <Cockpit />
        {t > 0.6 && t < 0.75 ? <directionalLight position={[10, 40, 20]} intensity={5} color="#cfd8ff" /> : null}
      </World>
    )) },
  /* 23 "Well, it's called target fixation." - the green overhead sign emerges from the rain, filling the frame on "target" @0.88 */
  23: { look: storm, focus: 20, cam: { from: [1.4, 1.2, 72], to: [1.45, 1.25, 56], lookFrom: [1.0, 3.8, 36], lookTo: [0.4, 5.0, 36], fov: 56, ease: "out", sway: 0.3 },
    Body: B(() => (
      <World look="night" arrow={1}>
        <Gantry z={36} glow={0.35} />
        <Rain center={[1.5, 0, 60]} area={[26, 14, 40]} count={2600} />
        <Cockpit />
      </World>
    )) },
  /* 24 "After miles of nothing, that tree stands out like a lighthouse." - dark plains, the arrow is the only light; a pair of headlights crawls toward it */
  24: { look: storm, focus: 40, cam: { from: [-26, 13, 62], to: [-18, 9, 44], lookFrom: [5, 2, -2], fov: 50, ease: "inout" },
    Body: B((t) => (
      <World look="night" arrow={1.4}>
        <Car kind="sedan" color="#5a6a8a" pos={[1.75, 0, 90 - t * 12]} rotY={Math.PI} lights dist={t * 12} />
        <Rain center={[-18, 0, 48]} area={[40, 20, 40]} count={2400} />
      </World>
    )) },
  /* 25 "Add a glowing arrow, and it's impossible to ignore." - driver's view toward the arrow, it flares on "glowing" @0.34 */
  25: { look: storm, focus: 25, cam: { from: [1.5, 1.2, 46], to: [1.7, 1.2, 30], lookFrom: [5.5, 2.6, 0], lookTo: [5.4, 2.8, 0], fov: 54, ease: "linear", sway: 0.3 },
    Body: B((t) => (
      <World look="night" arrow={t > 0.34 ? 1.6 + 0.4 * Math.sin(t * 6) : 0.6}>
        <Rain center={[1.5, 0, 36]} area={[26, 14, 30]} count={2400} />
        <Cockpit arrowGlow={t > 0.34 ? 1 : 0.3} />
      </World>
    )) },
  /* 26 "Every driver's eyes lock onto it and won't let go." - extreme close-up, the eyes lock and glow on "lock" @0.96 */
  26: { look: { ...stormLook(), sky: undefined, fog: "#0c0f18", fogNear: 3, fogFar: 14, aperture: 0.6 }, focus: 1.0, cam: { from: [0, 1.42, 1.25], to: [0, 1.44, 0.95], lookFrom: [0, 1.38, 0], fov: 34 },
    Body: B((t) => (
      <group>
        <Toon spec={C.sheriff} pose={{ eyes: t > 0.96 ? "glow" : "wide", mouth: "flat", look: 0 }} pos={[0, 0, 0]} light={t > 0.96 ? 0.55 : 0.3} />
        <pointLight position={[0, 1.4, 1.6]} intensity={t > 0.96 ? 10 : 4} distance={6} color="#ff8a3a" />
        <mesh position={[0, 1.4, -0.6]}><planeGeometry args={[6, 6]} /><meshStandardMaterial color="#10131c" /></mesh>
      </group>
    )) },
  /* 27 "And while they stare, their hands quietly steer the car toward it," - close on the wheel, it turns on "steer" @2.28; the arrow drifts to the centre */
  27: { look: storm, focus: 1.0, cam: { from: [1.6, 1.2, 40], to: [1.9, 1.2, 26], lookFrom: [1.6, -5.4, 31.5], lookTo: [4.6, 1.3, 0], fov: 62, fovTo: 54, ease: "inout", sway: 0.2 },
    Body: B((t) => (
      <World look="night" arrow={1.5}>
        <Rain center={[1.6, 0, 33]} area={[20, 12, 30]} count={2000} />
        <Cockpit steer={-0.6 * smooth((t - 2.1) / 1.6)} fixed arrowGlow={1} />
      </World>
    )) },
  /* 28 "even when it's just a stump." - headlights sweep onto the stump with the arrow; the car flips on "stump" @1.08 */
  28: { look: storm, focus: 11, cam: { from: [-1.2, 1.6, 14.5], to: [-0.9, 1.8, 13.4], lookFrom: [5.6, 1.2, 1], fov: 52 },
    Body: B((t) => (
      <World look="night" tree="stump">
        <ArrowSign pos={[TREE[0] + 0.6, 1.25, TREE[2] - 1.4]} rotY={AROT} lit={1.5} night scale={0.7} />
        <Rain center={[3, 0, 8]} area={[24, 14, 24]} count={2400} />
        <StumpFlip t={t} tHit={1.08} z0={34} kind="sedan" color="#5a6a8a" lights />
      </World>
    )) },
};

const Ladder: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos} rotation={[0, 0.5, -0.22]}>
    {[-0.25, 0.25].map((x) => <mesh key={x} position={[x, 1.6, 0]} castShadow><boxGeometry args={[0.06, 3.3, 0.06]} /><meshStandardMaterial color="#c9b48a" /></mesh>)}
    {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[0, 0.25 + i * 0.36, 0]}><boxGeometry args={[0.5, 0.04, 0.05]} /><meshStandardMaterial color="#c9b48a" /></mesh>)}
  </group>
);

export const SHOT_IDS = Object.keys(SHOTS).map(Number);
