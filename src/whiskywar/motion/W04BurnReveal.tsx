import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// w04_burn_reveal (line 2 → the island; the reference's 5.55–6.7 s): the newspaper burns away from the middle outward in
// 0.4 s, glowing orange rims with a charred band inside, sparks flying, revealing what is under it. Wrap the layer to burn
// as `children`; whatever sits behind this component shows through. 1080×1920, 60 fps; the burn runs from `start`.
export const W04BurnReveal: React.FC<{ start?: number; dur?: number; children?: React.ReactNode }> = ({ start = 6, dur = 26, children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [start, start + dur], [0.0, 1.08], { ...clamp, easing: Easing.in(Easing.quad) });
  // a radial gradient combined with noise, thresholded: the hole opens from the centre
  const filt = (id: string, t: number) => {
    const s = 12;
    return (
      <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves={3} seed={11} result="n" />
        <feColorMatrix in="n" type="matrix" values="0.5 0 0 0 0  0.5 0 0 0 0  0.5 0 0 0 0  0 0 0 0 1" result="n2" />
        <feImage href={RADIAL} x="0" y="0" width="1080" height="1920" preserveAspectRatio="none" result="r" />
        <feComposite in="n2" in2="r" operator="arithmetic" k1="0" k2="1" k3="0.7" k4="-0.1" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={s} intercept={-s * (t * 1.1)} />
          <feFuncG type="linear" slope={s} intercept={-s * (t * 1.1)} />
          <feFuncB type="linear" slope={s} intercept={-s * (t * 1.1)} />
        </feComponentTransfer>
      </filter>
    );
  };
  const content = children ?? <div style={{ width: 1080, height: 1920, background: 'repeating-linear-gradient(0deg, #EADFC6 0 18px, #D8CBAE 18px 20px)' }} />;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs>
          {filt('brC', p)}{filt('brH', p - 0.05)}{filt('brG', p - 0.1)}
          <mask id="brmC" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><rect width={1080} height={1920} fill="#fff" filter="url(#brC)" /></mask>
          <mask id="brmH" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><rect width={1080} height={1920} fill="#fff" filter="url(#brH)" /></mask>
          <mask id="brmG" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><rect width={1080} height={1920} fill="#fff" filter="url(#brG)" /></mask>
          <filter id="brglow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={7} /></filter>
        </defs>
        <g mask="url(#brmG)"><rect width={1080} height={1920} fill="#FFB02E" filter="url(#brglow)" /></g>
        <g mask="url(#brmH)"><rect width={1080} height={1920} fill="#2A1406" /></g>
        <g mask="url(#brmC)"><foreignObject width={1080} height={1920}>{content}</foreignObject></g>
        {Array.from({ length: 26 }).map((_, i) => {
          const t0 = start + (i / 26) * dur * 0.8;
          const k = (f - t0) / 40;
          if (k < 0 || k > 1) return null;
          const a = (i * 2.4) % (Math.PI * 2), r0 = 120 + (i % 5) * 60;
          return <circle key={i} cx={540 + Math.cos(a) * (r0 + k * 500)} cy={960 + Math.sin(a) * (r0 + k * 700) - k * 120} r={4 * (1 - k) + 2} fill="#FFC040" opacity={1 - k} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
// distance from the centre as a grey image (white at the edge), so holes open in the middle first
const RADIAL = `data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'><defs><radialGradient id='g' cx='0.5' cy='0.5' r='0.62'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#fff'/></radialGradient></defs><rect width='1080' height='1920' fill='url(#g)'/></svg>")}`;
