import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, Sequence, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { C, clamp, idle, ramp } from './theme';

// g02_name_label (the reference's glowing names, 0:01–0:06): "GREENLAND" in a lush green with a soft glow and grass
// tufts growing up along its top edge and swaying in the wind, or "ICELAND" in icy blue with a frost rim, icicles
// growing down from the letters, a drip falling now and then and sparkles twinkling on the ice. It springs open from
// a flat line in 5 frames (taking over from g01's squeeze), with a light sweep. `fo` offsets the clock (loop close).
// Transparent, 1000×360, 60 fps; centred.
export type Kind = 'green' | 'ice';
export const G02NameLabel: React.FC<{ text?: string; kind?: Kind; size?: number; fo?: number; seed?: number }> = ({ text, kind = 'green', size = 150, fo = 0, seed = 1 }) => {
  useFonts();
  const f = useCurrentFrame() + fo;
  const label = text ?? (kind === 'green' ? 'GREENLAND' : 'ICELAND');
  const g = kind === 'green';
  const [main, deep, glow] = g ? [C.green, C.greenDeep, C.greenGlow] : [C.ice, C.iceDeep, C.iceGlow];
  const open = fo > 0 ? 1 : interpolate(f, [0, 5], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.4)) });
  const grow = fo > 0 ? 1 : ramp(f, 4, 22);
  const [ix, iy, ir] = idle(f, seed, 0.4);
  const sweep = ((f % 150) / 150) * 1.6 - 0.3;
  const W = label.length * size * 0.5;
  const id = `g02${kind}${seed}`;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', transform: `translate(${ix}px, ${iy}px) rotate(${ir}deg) scale(${1 + 0.02 * Math.sin(f / 30)}, ${open})` }}>
        <svg width={W + 120} height={size * 2} viewBox={`${-W / 2 - 60} ${-size} ${W + 120} ${size * 2}`} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', overflow: 'visible' }}>
          {g ? Array.from({ length: Math.round(W / 22) }, (_, i) => {
            // grass tufts along the top edge: three blades each, growing up and swaying with a travelling gust
            const x = -W / 2 + (i + 0.5) * 22 + (random(`${id}x${i}`) - 0.5) * 10;
            const h = (18 + random(`${id}h${i}`) * 26) * grow * (random(`${id}k${i}`) < 0.2 ? 0 : 1);
            const sway = Math.sin(f / 22 - x / 90) * 6 + Math.sin(f / 9 + i) * 1.5;
            const y0 = -size * 0.36;
            return [-0.5, 0, 0.6].map((k, j) => (
              <path key={`${i}${j}`} d={`M ${x + k * 6 - 3} ${y0} Q ${x + k * 10 + sway * 0.5} ${y0 - h * 0.6} ${x + k * 14 + sway} ${y0 - h * (1 - Math.abs(k) * 0.3)} Q ${x + k * 8 + sway * 0.4} ${y0 - h * 0.45} ${x + k * 6 + 3} ${y0} Z`}
                fill={j === 1 ? C.greenGlow : main} stroke={deep} strokeWidth={1.5} />
            ));
          }) : Array.from({ length: Math.round(W / 26) }, (_, i) => {
            // icicles: thin tapering cones under the letters, a drip forming and falling from some of them
            const x = -W / 2 + (i + 0.5) * 26 + (random(`${id}x${i}`) - 0.5) * 12;
            const h = (14 + random(`${id}h${i}`) * 46) * grow;
            const y0 = size * 0.34, w = 5 + random(`${id}w${i}`) * 5;
            const per = 90 + Math.floor(random(`${id}p${i}`) * 120), ph = (f + Math.floor(random(`${id}o${i}`) * per)) % per;
            const drip = random(`${id}d${i}`) < 0.35 && grow >= 1;
            const dy = ph < per * 0.6 ? 0 : ((ph - per * 0.6) / (per * 0.4)) ** 2 * 140;
            return (
              <g key={i}>
                <path d={`M ${x - w} ${y0} L ${x} ${y0 + h} L ${x + w} ${y0} Z`} fill={`url(#${id}ic)`} stroke={C.iceGlow} strokeWidth={1} opacity={0.95} />
                {drip && <circle cx={x} cy={y0 + h + 4 + dy} r={3.5 * Math.min(1, ph / (per * 0.5))} fill={C.iceGlow} opacity={dy > 100 ? 0 : 0.9} />}
              </g>
            );
          })}
          <defs>
            <linearGradient id={`${id}ic`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor={main} stopOpacity={0.5} /></linearGradient>
          </defs>
          {!g && Array.from({ length: 6 }, (_, i) => {
            const per = 70, ph = (f + i * 23) % per, s = Math.sin((ph / per) * Math.PI);
            const x = -W / 2 + random(`${id}sx${i}`) * W, y = (random(`${id}sy${i}`) - 0.5) * size * 0.6;
            return <path key={`s${i}`} d={`M ${x} ${y - 16 * s} L ${x + 3 * s} ${y - 3 * s} L ${x + 16 * s} ${y} L ${x + 3 * s} ${y + 3 * s} L ${x} ${y + 16 * s} L ${x - 3 * s} ${y + 3 * s} L ${x - 16 * s} ${y} L ${x - 3 * s} ${y - 3 * s} Z`} fill="#fff" opacity={s} />;
          })}
        </svg>
        <div style={{ position: 'relative', fontFamily: NUM, fontSize: size, lineHeight: 1, letterSpacing: 2, whiteSpace: 'nowrap', padding: '0 10px',
          color: main, WebkitTextStroke: `${size / 22}px ${deep}`, paintOrder: 'stroke fill',
          backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${(sweep - 0.12) * 100}%, rgba(255,255,255,0.75) ${sweep * 100}%, rgba(255,255,255,0) ${(sweep + 0.12) * 100}%), linear-gradient(180deg, ${glow}, ${main} 55%, ${deep})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(0 0 ${14 + 6 * Math.sin(f / 20)}px ${main}) drop-shadow(0 8px 10px rgba(0,0,0,0.45))` }}>
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** g01 → g02: the highlighter types the name, squeezes flat at `at` (pass `out={at}` to g01), and the glowing name
 *  springs open in its place 4 frames later. */
export const NameMorph: React.FC<{ hi: React.ReactNode; label: React.ReactNode; at: number }> = ({ hi, label, at }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {f < at + 5 && hi}
      <Sequence from={at + 4} layout="none">{label}</Sequence>
    </AbsoluteFill>
  );
};
