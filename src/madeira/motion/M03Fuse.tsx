import React from 'react';
import { AbsoluteFill, Img, random, useCurrentFrame } from 'remotion';
import { C, ramp } from './theme';

// m03_fuse (line 3, "तो उन्होंने पूरे जंगल में आग लगा दी"; the reference's 0:05–0:09): a burning fuse runs along `d`
// (the coast, screen px) over `dur` frames: a thin gold line glowing behind the tip, a hot white core at the tip with
// the creator's flame (md04, screen-blended) flickering on it, and sparks spitting off backwards. Transparent.
export const M03Fuse: React.FC<{ d: string; dur?: number; flame?: string }> = ({ d, dur = 150, flame }) => {
  const f = useCurrentFrame();
  const p = ramp(f, 0, dur, (x) => x);
  const ref = React.useRef<SVGPathElement>(null);
  const [tip, setTip] = React.useState<[number, number]>([0, 0]);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const q = el.getPointAtLength(el.getTotalLength() * p);
    setTip([q.x, q.y]);
  }, [p, d]);
  const fl = 1 + 0.18 * Math.sin(f * 1.7) + 0.1 * Math.sin(f * 3.1);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path ref={ref} d={d} fill="none" stroke="none" />
        <path d={d} fill="none" stroke={C.gold} strokeWidth={9} strokeOpacity={0.35} pathLength={1} strokeDasharray={`${p} 2`} strokeLinecap="round" style={{ filter: 'blur(5px)' }} />
        <path d={d} fill="none" stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray={`${p} 2`} strokeLinecap="round" />
        {p > 0 && p < 1 && Array.from({ length: 12 }, (_, i) => {
          const t = ((f * 0.07 + random(`k${i}`)) % 1);
          const a = random(`a${i}`) * Math.PI * 2;
          return <circle key={i} cx={tip[0] + Math.cos(a) * 40 * t} cy={tip[1] + Math.sin(a) * 30 * t - 30 * t} r={2.4 * (1 - t) + 0.6} fill={C.fireHot} opacity={1 - t} />;
        })}
        {p > 0 && p < 1 && <circle cx={tip[0]} cy={tip[1]} r={10 * fl} fill="#FFF6D0" style={{ filter: `drop-shadow(0 0 14px ${C.fire}) drop-shadow(0 0 30px ${C.fire})` }} />}
      </svg>
      {flame && p > 0 && p < 1 && <Img src={flame} style={{ position: 'absolute', left: tip[0] - 45, top: tip[1] - 80, width: 90, height: 90, objectFit: 'contain', mixBlendMode: 'screen', transformOrigin: '50% 90%', transform: `scale(${fl}, ${fl * 1.1})` }} />}
    </AbsoluteFill>
  );
};
