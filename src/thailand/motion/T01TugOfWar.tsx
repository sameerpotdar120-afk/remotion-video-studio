import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { Arm, CountryChar, handPos } from './Char';
import { Paper } from './Paper';
import { clamp, ramp } from './theme';

// t01_tug_of_war (line 3, "Britain और France की दुश्मनी का ही फ़ायदा उठा लिया"): Britain and France strain on a rope with
// Siam in the middle holding it, smug, eyes darting between them. The pair rock about ±3° on a 0.7 s cycle with shuffling
// feet and dust puffs, the rope wobbles; a slow push-in, then a fast zoom onto Siam's face at the end.
// 1080x1920, 60 fps, 240 frames. bg (default true): paper backdrop; false for transparent.

const GY = 1440;
const BX = 285, FX = 830, SX = 550;

const Puff: React.FC<{ x: number; f: number; start: number; dir: number }> = ({ x, f, start, dir }) => {
  const t = (f - start) / 26;
  if (t < 0 || t > 1) return null;
  return (
    <g opacity={(1 - t) * 0.7}>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + dir * (20 + t * 70 + i * 22)} cy={GY - 14 - t * 40 - i * 8} r={14 + t * 26 - i * 3} fill="#CDBF9F" />
      ))}
    </g>
  );
};

export const T01TugOfWar: React.FC<{ bg?: boolean }> = ({ bg = true }) => {
  const f = useCurrentFrame();
  const cyc = Math.sin((f / 42) * Math.PI * 2);
  const tb = -9 + cyc * 3, tf = 9 - cyc * 3;
  // both lean back and pull toward their own side; hands forward at chest height
  const bArm: Arm = { x: 210, y: 40, bend: 1 }, bArm2: Arm = { x: 150, y: 70, bend: 1 };
  const fArm: Arm = { x: -210, y: 30, bend: -1 }, fArm2: Arm = { x: -150, y: 60, bend: -1 };
  const BS = 500, FS = 410, SS = 320;
  const hb = handPos('britain', BS, 1, bArm, tb), hf = handPos('france', FS, 0, fArm, tf);
  const bH: [number, number] = [BX + hb[0], GY + hb[1]];
  const fH: [number, number] = [FX + hf[0], GY + hf[1]];
  const sArmL: Arm = { x: -60, y: 210, bend: -1 }, sArmR: Arm = { x: -150, y: 150, bend: 1 };
  const sh = handPos('siam', SS, 0, sArmL), sh2 = handPos('siam', SS, 1, sArmR);
  const sBob = Math.sin((f / 42) * Math.PI * 2 + 1) * 6;
  const sH: [number, number] = [SX + (sh[0] + sh2[0]) / 2, GY + (sh[1] + sh2[1]) / 2 + sBob * (SS / 1000)];
  const wob = Math.sin(f * 0.5) * 8 + Math.sin(f * 0.21) * 6;
  const rope = `M ${bH[0]} ${bH[1]} Q ${(bH[0] + sH[0]) / 2} ${(bH[1] + sH[1]) / 2 + 24 + wob} ${sH[0]} ${sH[1]} Q ${(sH[0] + fH[0]) / 2} ${(sH[1] + fH[1]) / 2 + 24 - wob} ${fH[0]} ${fH[1]}`;
  // camera: a slow push-in, then a fast zoom onto Siam's face
  const z = ramp(f, 186, 228, Easing.inOut(Easing.cubic));
  const sc = interpolate(f, [0, 186], [1, 1.07], clamp) * (1 + z * 1.9);
  const fx = interpolate(z, [0, 1], [540, SX - 40]), fy = interpolate(z, [0, 1], [1180, GY - SS * 1.02]);
  const shuffle = (k: number) => Math.sin(f * 0.42 + k) * 26;
  const dart = f < 186 ? Math.sign(Math.sin(f / 26)) * 0.75 : interpolate(f, [186, 200, 214, 228, 240], [0.75, -0.75, 0.75, -0.75, 0.2], clamp);
  return (
    <AbsoluteFill>
      {bg && <Paper floor={GY} />}
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <g transform={`translate(540 ${1180 + (fy - 1180) * 0}) scale(${sc}) translate(${-fx} ${-fy}) translate(0 ${(fy - 1180) * 0})`}>
            <Puff x={BX - 40} f={f % 42} start={4} dir={-1} />
            <Puff x={FX + 40} f={(f + 21) % 42} start={4} dir={1} />
            <g transform={`translate(${BX} ${GY})`}>
              <CountryChar who="britain" size={BS} f={f} mood="angry" look={0.8} tilt={tb} armL={bArm2} armR={bArm}
                legs={{ spread: 80, stride: shuffle(0) * 0.5, lift: 10, phase: f * 0.42 }} />
            </g>
            <g transform={`translate(${FX} ${GY})`}>
              <CountryChar who="france" size={FS} f={f} mood="angry" look={-0.8} tilt={tf} armL={fArm} armR={fArm2}
                legs={{ spread: 80, stride: shuffle(2) * 0.5, lift: 10, phase: f * 0.42 + 2 }} />
            </g>
            <path d={rope} stroke="#1D1430" strokeWidth={22} fill="none" strokeLinecap="round" />
            <path d={rope} stroke="#8A5A2B" strokeWidth={13} fill="none" strokeLinecap="round" />
            <path d={rope} stroke="#C9955A" strokeWidth={13} fill="none" strokeDasharray="10 14" strokeDashoffset={-f * 2} />
            <g transform={`translate(${SX} ${GY})`}>
              <CountryChar who="siam" size={SS} f={f} mood="smug" look={dart} bob={sBob} armL={sArmL} armR={sArmR}
                legs={{ spread: 25, stride: 0 }} blinkSeed={`s${random('tug') > 0.5 ? 1 : 0}`} />
            </g>
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
