import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp } from './theme';

// m12_player (line 10, "एक लड़का पैदा हुआ, Cristiano Ronaldo"; the reference's 0:56–1:01): the creator's Ronaldo
// cut-out on the island. `mode="run"` (md13, dribbling): he runs in place over the map with a stride bob (two dips
// per stride), a forward lean that rocks with each step and a contact shadow that squashes with the bob, entering
// from 1.6× (rushing at the camera) and settling. `mode="pop"` (md14, the celebration; md16, the boy): he springs up
// from 0 with a landing squash, gold rays fan out behind and a flash ring goes out. `h` his height; anchored
// bottom-centre (feet on the box's bottom edge).
export const M12Player: React.FC<{ src: string; ratio: number; h?: number; mode?: 'run' | 'pop'; out?: number }> = ({ src, ratio, h = 700, mode = 'run', out }) => {
  const f = useCurrentFrame();
  const w = h / ratio;
  const o = out !== undefined ? 1 - interpolate(f, [out, out + 10], [0, 1], clamp) : 1;
  const stride = (f / 9) * Math.PI;
  const bob = mode === 'run' ? Math.abs(Math.sin(stride)) * 14 : 0;
  const lean = mode === 'run' ? Math.sin(stride) * 1.5 : 0;
  const enter = mode === 'run' ? interpolate(f, [0, 18], [1.6, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.6)) });
  const sq = mode === 'pop' && f > 8 ? 1 - 0.08 * Math.exp(-(f - 8) / 4) * Math.cos((f - 8) / 2) : 1;
  const rays = mode === 'pop' ? interpolate(f, [4, 18], [0, 1], clamp) : 0;
  const ring = mode === 'pop' ? interpolate(f, [6, 30], [0, 1], clamp) : 1;
  return (
    <AbsoluteFill style={{ opacity: o * Math.min(1, f / 4) }}>
      {rays > 0 && (
        <svg width={w * 3} height={w * 3} viewBox="-1 -1 2 2" style={{ position: 'absolute', left: '50%', bottom: h * 0.35, marginLeft: -w * 1.5, marginBottom: -w * 1.5, transform: `rotate(${f * 0.4}deg) scale(${rays})`, opacity: 0.6 }}>
          {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <path key={i} d={`M 0 0 L ${Math.cos(a - 0.08)} ${Math.sin(a - 0.08)} L ${Math.cos(a + 0.08)} ${Math.sin(a + 0.08)} Z`} fill={C.gold} opacity={i % 2 ? 0.5 : 0.25} />; })}
        </svg>
      )}
      {ring < 1 && <div style={{ position: 'absolute', left: '50%', bottom: h * 0.4, width: w * 2 * ring, height: w * 2 * ring, marginLeft: -w * ring, marginBottom: -w * ring, borderRadius: '50%', border: `${8 * (1 - ring)}px solid #fff`, opacity: 1 - ring }} />}
      <div style={{ position: 'absolute', left: '50%', bottom: -h * 0.02, width: w * 0.7, height: h * 0.06, marginLeft: -w * 0.35, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', filter: 'blur(8px)', transform: `scaleX(${1 - bob / 60})` }} />
      <div style={{ position: 'absolute', left: '50%', bottom: 0, width: w, height: h, marginLeft: -w / 2, transformOrigin: '50% 100%', transform: `translateY(${-bob}px) rotate(${lean}deg) scale(${enter * (2 - sq)}, ${enter * sq})` }}>
        <Img src={src} style={{ width: w, height: h, filter: 'drop-shadow(0 18px 20px rgba(0,0,0,0.5))' }} />
      </div>
    </AbsoluteFill>
  );
};
