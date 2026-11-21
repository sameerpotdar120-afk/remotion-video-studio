import React from 'react';
import { AbsoluteFill } from 'remotion';

/**
 * The finishing pass over the whole frame (map, props and cards together), a cinematic teal-and-orange grade:
 * - per-channel curves (an SVG feComponentTransfer "LUT"): teal shadows, warm highlights, deep blacks;
 * - bloom: a blurred bright pass screened back on, so fire, glints and gold labels glow;
 * - tilt-shift: the top and bottom of the frame drift out of focus (a miniature/documentary look);
 * - a strong vignette. No grain (house rule).
 */
const TABLES = {
  r: '0 0.04 0.13 0.27 0.44 0.62 0.78 0.91 0.98',
  g: '0.012 0.06 0.15 0.28 0.43 0.59 0.74 0.87 0.95',
  b: '0.05 0.10 0.19 0.30 0.43 0.56 0.68 0.79 0.87',
};
export const Grade: React.FC<{ width: number; children: React.ReactNode; bloom?: number; tilt?: number; vig?: number; id?: string }> = ({ width, children, bloom = 0.55, tilt = 1, vig = 1, id = 'sdgrade' }) => {
  const k = width / 1920;
  return (
    <AbsoluteFill>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feComponentTransfer in="SourceGraphic" result="g">
            <feFuncR type="table" tableValues={TABLES.r} />
            <feFuncG type="table" tableValues={TABLES.g} />
            <feFuncB type="table" tableValues={TABLES.b} />
          </feComponentTransfer>
          <feColorMatrix in="g" type="saturate" values="0.92" result="gs" />
          <feComponentTransfer in="gs" result="bright">
            <feFuncR type="linear" slope="3.4" intercept="-2.5" />
            <feFuncG type="linear" slope="3.4" intercept="-2.5" />
            <feFuncB type="linear" slope="3.4" intercept="-2.5" />
          </feComponentTransfer>
          <feGaussianBlur in="bright" stdDeviation={14 * k} result="bl" />
          <feComposite in="bl" in2="gs" operator="arithmetic" k1="0" k2={bloom} k3="1" k4="0" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#${id})` }}>{children}</AbsoluteFill>
      {tilt > 0 && (
        <>
          <AbsoluteFill style={{ backdropFilter: `blur(${5 * k * tilt}px)`, WebkitMaskImage: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.6) 12%, transparent 30%, transparent 78%, rgba(0,0,0,0.7) 100%)', maskImage: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.6) 12%, transparent 30%, transparent 78%, rgba(0,0,0,0.7) 100%)' }} />
        </>
      )}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 50%, rgba(4,8,10,${0.62 * vig}) 100%)`, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
