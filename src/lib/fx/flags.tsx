import React from 'react';

/**
 * Historically correct flags drawn as SVG (never AI-generated — generators get them wrong).
 *  - UnionFlag1707: Great Britain 1707–1801. St George's cross + St Andrew's saltire.
 *    NO red St Patrick's saltire (that was added in 1801).
 *  - GrandUnion: "Continental Colours", raised Jan 1776 — 13 red/white stripes + the 1707 union.
 *    (The 13-star flag was only adopted on 14 June 1777 — do NOT use it for 1776.)
 *  - BourbonFrance: white royal flag sown with gold fleurs-de-lis (not the blue-field royal arms).
 * Use as React components, or render once to PNG for FlagFill/<image>.
 */
const NAVY = '#012169';
const RED = '#C8102E';

export const UnionFlag1707: React.FC<{ width: number }> = ({ width }) => {
  const h = width / 2;
  return (
    <svg width={width} height={h} viewBox="0 0 60 30">
      <rect width="60" height="30" fill={NAVY} />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke={RED} strokeWidth="6" />
    </svg>
  );
};

export const GrandUnion: React.FC<{ width: number }> = ({ width }) => {
  const h = (width * 10) / 19;
  return (
    <svg width={width} height={h} viewBox="0 0 190 100">
      {Array.from({ length: 13 }).map((_, i) => (
        <rect key={i} y={(i * 100) / 13} width="190" height={100 / 13 + 0.2} fill={i % 2 ? '#fff' : '#B22234'} />
      ))}
      <svg x="0" y="0" width="76" height={(100 / 13) * 7} viewBox="0 0 60 30" preserveAspectRatio="none">
        <rect width="60" height="30" fill={NAVY} />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke={RED} strokeWidth="6" />
      </svg>
    </svg>
  );
};

// One heraldic fleur-de-lis in a 100x100 box (centre x = 50): tall central petal, two outward-curling side
// petals, a band across the middle, three short stems below.
const FLEUR =
  'M50 0 C61 13 64 33 56 54 L44 54 C36 33 39 13 50 0 Z' +
  'M57 54 C60 36 72 24 86 27 C99 30 101 47 90 55 C93 46 89 39 81 40 C71 42 66 49 64 54 Z' +
  'M43 54 C40 36 28 24 14 27 C1 30 -1 47 10 55 C7 46 11 39 19 40 C29 42 34 49 36 54 Z' +
  'M29 54 H71 Q74 54 74 57.5 V60 Q74 63.5 71 63.5 H29 Q26 63.5 26 60 V57.5 Q26 54 29 54 Z' +
  'M45 63.5 H55 L53 82 L50 96 L47 82 Z' +
  'M44 63.5 C35 66 28 73 30 85 C34 78 39 73 45 71 Z' +
  'M56 63.5 C65 66 72 73 70 85 C66 78 61 73 55 71 Z';

/** French royal Bourbon flag of the 1770s: off-white field sown with gold fleurs-de-lis (semé), 5 x 3 staggered. */
export const BourbonFrance: React.FC<{ width: number }> = ({ width }) => {
  const size = 0.28; // fleur height in flag units
  const k = size / 100;
  const rows = [0.36, 1.0, 1.64];
  const spots: [number, number][] = [];
  rows.forEach((y, r) => {
    const xs = r % 2 === 0 ? [0.3, 0.9, 1.5, 2.1, 2.7] : [0, 0.6, 1.2, 1.8, 2.4, 3.0];
    xs.forEach((x) => spots.push([x, y]));
  });
  return (
    <svg width={width} height={(width * 2) / 3} viewBox="0 0 3 2">
      <defs>
        <path id="fleur" d={FLEUR} fill="#D4AF37" stroke="#8A6A12" strokeWidth={0.006 / k} strokeLinejoin="round" />
        <clipPath id="field"><rect width="3" height="2" /></clipPath>
      </defs>
      <rect width="3" height="2" fill="#FBFBF5" />
      <g clipPath="url(#field)">
        {spots.map(([x, y], i) => (
          <use key={i} href="#fleur" transform={`translate(${x - 50 * k} ${y - 48 * k}) scale(${k})`} />
        ))}
      </g>
      <rect x="0.005" y="0.005" width="2.99" height="1.99" fill="none" stroke="#BBBBBB" strokeWidth="0.01" />
    </svg>
  );
};
