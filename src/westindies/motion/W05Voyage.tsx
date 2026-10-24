import React from 'react';
import { AbsoluteFill, Img, random, useCurrentFrame } from 'remotion';
import { Carrack } from './Ships';
import { C, inOut, ramp } from './theme';

// w05_voyage (line 7, "Columbus India का रास्ता ढूँढने निकला था, और पहुँच गया इन islands पर"; the reference's
// 0:33–0:41): Columbus's carrack crosses the Atlantic along the path `d` (screen coordinates, drawn from Spain to the
// Bahamas by the edit), riding a swell (bob and roll), a glowing gold route line drawing on behind it with a dashed
// shimmer, a white wake and spray at the bow. `columbus` (the creator's rig, w06) can ride on deck. Over `dur` frames,
// eased in and out. Transparent, 1080×1920, 60 fps. The edit darkens the map underneath for the crossing.
export const W05Voyage: React.FC<{ d?: string; len?: number; dur?: number; ship?: string; columbus?: React.ReactNode; w?: number }> = ({
  d = 'M 980 600 C 760 700 520 760 300 1180', len = 860, dur = 240, ship, columbus, w = 330,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, 6, 6 + dur, inOut);
  const pathRef = React.useRef<SVGPathElement>(null);
  const [pt, setPt] = React.useState<{ x: number; y: number; a: number }>({ x: 0, y: 0, a: 0 });
  React.useLayoutEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const L = el.getTotalLength();
    const a = el.getPointAtLength(L * p), b = el.getPointAtLength(Math.min(L, L * p + 2));
    setPt({ x: a.x, y: a.y, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI });
  }, [p, d]);
  const goingLeft = Math.abs(pt.a) > 90;
  const bob = Math.sin(f / 13) * 6, roll = Math.sin(f / 17) * 3;
  const appear = ramp(f, 0, 12);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path ref={pathRef} d={d} fill="none" stroke="none" />
        <path d={d} fill="none" stroke={C.gold} strokeWidth={16} opacity={0.25} strokeDasharray={`${len * p} ${len * 2}`} strokeLinecap="round" style={{ filter: 'blur(6px)' }} />
        <path d={d} fill="none" stroke={C.gold} strokeWidth={6} strokeDasharray={`${len * p} ${len * 2}`} strokeLinecap="round" />
        <path d={d} fill="none" stroke="#FFF6CC" strokeWidth={3} strokeDasharray={`18 26`} strokeDashoffset={-f * 2} opacity={0.8} style={{ clipPath: 'none' }} mask="url(#w05m)" />
        <defs><mask id="w05m"><path d={d} fill="none" stroke="#fff" strokeWidth={8} strokeDasharray={`${len * p} ${len * 2}`} /></mask></defs>
      </svg>
      <div style={{ position: 'absolute', left: pt.x, top: pt.y, opacity: appear, transform: `translate(-50%, -82%) translateY(${bob}px) rotate(${roll}deg) scaleX(${goingLeft ? -1 : 1})` }}>
        {/* wake and bow spray */}
        <svg width={w * 1.6} height={w * 0.4} style={{ position: 'absolute', left: -w * 0.9, top: w * 0.42, overflow: 'visible' }}>
          {[0, 1, 2].map((k) => <path key={k} d={`M ${w * 0.9} ${w * 0.04} Q ${w * 0.5} ${w * (0.06 + k * 0.03)} ${w * (0.1 - k * 0.1)} ${w * (0.04 + k * 0.05)}`} stroke="#fff" strokeWidth={3 - k * 0.6} fill="none" opacity={0.55 - k * 0.12} strokeDasharray="22 10" strokeDashoffset={f * 2.4} />)}
          {Array.from({ length: 8 }, (_, i) => {
            const t = ((f * 0.05 + random(`sp${i}`)) % 1);
            return <circle key={i} cx={w * 1.42 + t * 26} cy={w * 0.02 - Math.sin(t * Math.PI) * 18} r={3 * (1 - t) + 1} fill="#fff" opacity={0.8 * (1 - t)} />;
          })}
        </svg>
        {columbus && <div style={{ position: 'absolute', left: w * 0.3, top: -w * 0.34, width: 600, height: 800, transformOrigin: '0 0', transform: `scale(${(w * 0.5) / 800})` }}>{columbus}</div>}
        {ship ? <Img src={ship} style={{ width: w, height: w * 0.56, objectFit: 'contain' }} /> : <Carrack w={w} f={f} />}
      </div>
    </AbsoluteFill>
  );
};
