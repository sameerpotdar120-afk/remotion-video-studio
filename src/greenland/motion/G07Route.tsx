import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { C, inOut, ramp } from './theme';

// g07_route (line 4, Flóki's voyage, and line 7, Erik sailing west; the reference's longship on a dashed route): a
// dashed ink route draws along `d` (screen px) over `dur` frames, an arrowhead riding its tip, and the creator's
// longship (gl03) rides the tip, bobbing and rolling on a swell with a wake behind it. The ravens (gl04 / gl04b,
// flapping by swapping the two poses every 6 frames) fly out ahead along the route in a loose line; `lost` of them
// keeps going and never comes back (the one Flóki followed). Without images only the route draws.
// Transparent, 1080×1920, 60 fps. `color` is ink brown on the paper map, white on the satellite.
export const G07Route: React.FC<{ d?: string; dur?: number; ship?: string; ravenUp?: string; ravenDown?: string; ravens?: number; w?: number; color?: string }> = ({
  d = 'M 900 1300 C 760 1150 520 1080 300 880', dur = 200, ship, ravenUp, ravenDown, ravens = 3, w = 260, color = C.sepia,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, 0, dur, inOut);
  const ref = React.useRef<SVGPathElement>(null);
  const [L, setL] = React.useState(1000);
  const [pts, setPts] = React.useState<{ x: number; y: number; a: number }[]>([]);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const len = el.getTotalLength();
    setL(len);
    const at = (q: number) => {
      const a = el.getPointAtLength(len * Math.max(0, Math.min(1, q))), b = el.getPointAtLength(Math.min(len, len * q + 2));
      return { x: a.x, y: a.y, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
    };
    // the ship at the tip, the ravens spaced out ahead of it (each one a little further on)
    setPts([at(p), ...Array.from({ length: ravens }, (_, i) => at(p + 0.08 + i * 0.07))]);
  }, [p, d, ravens]);
  const [s, ...rv] = pts;
  const flap = Math.floor(f / 6) % 2;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path ref={ref} d={d} fill="none" stroke="none" />
        <defs><mask id="g07m" maskUnits="userSpaceOnUse" x={-500} y={-500} width={2100} height={2900}><path d={d} fill="none" stroke="#fff" strokeWidth={14} strokeDasharray={`${L * p} ${L * 2}`} /></mask></defs>
        <path d={d} fill="none" stroke={color} strokeWidth={7} strokeDasharray="22 16" strokeDashoffset={-f * 0.6} strokeLinecap="round" mask="url(#g07m)" opacity={0.9} />
        {s && p > 0.02 && p < 0.995 && <path d="M -18 -13 L 6 0 L -18 13" transform={`translate(${s.x},${s.y}) rotate(${s.a})`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      {ship && s && (
        <div style={{ position: 'absolute', left: s.x, top: s.y, transform: `translate(-50%, -78%) translateY(${Math.sin(f / 13) * 6}px) rotate(${Math.sin(f / 17) * 3}deg) scaleX(${Math.abs(s.a) > 90 ? -1 : 1})` }}>
          <svg width={w * 1.4} height={40} style={{ position: 'absolute', left: -w * 0.75, top: w * 0.5, overflow: 'visible' }}>
            {[0, 1].map((k) => <path key={k} d={`M ${w * 0.8} 6 Q ${w * 0.45} ${10 + k * 8} ${w * (0.05 - k * 0.1)} ${8 + k * 12}`} stroke="#fff" strokeWidth={3 - k} fill="none" opacity={0.6 - k * 0.2} strokeDasharray="20 10" strokeDashoffset={f * 2.2} />)}
          </svg>
          <Img src={ship} style={{ width: w, height: w * 0.56, objectFit: 'contain' }} />
        </div>
      )}
      {ravenUp && ravenDown && rv.map((r, i) => (
        <Img key={i} src={flap ^ (i % 2) ? ravenUp : ravenDown} style={{ position: 'absolute', left: r.x, top: r.y - 120 - i * 30 + Math.sin(f / 9 + i) * 12, width: 110, height: 110, objectFit: 'contain',
          transform: `translate(-50%,-50%) scaleX(${Math.abs(r.a) > 90 ? -1 : 1})`, opacity: ramp(f, 10 + i * 8, 24 + i * 8) }} />
      ))}
    </AbsoluteFill>
  );
};
