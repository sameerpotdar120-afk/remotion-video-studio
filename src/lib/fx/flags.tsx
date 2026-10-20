import React from 'react';

/**
 * Historically correct flags drawn as SVG (never AI-generated — generators get them wrong).
 *  - UnionFlag1707: Great Britain 1707–1801. St George's cross + St Andrew's saltire.
 *    NO red St Patrick's saltire (that was added in 1801).
 *  - GrandUnion: "Continental Colours", raised Jan 1776 — 13 red/white stripes + the 1707 union.
 *    (The 13-star flag was only adopted on 14 June 1777 — do NOT use it for 1776.)
 *  - BourbonFrance: plain white royal ensign used by French ships/forts in the period.
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

export const BourbonFrance: React.FC<{ width: number }> = ({ width }) => (
  <svg width={width} height={(width * 2) / 3} viewBox="0 0 3 2">
    <rect width="3" height="2" fill="#FBFBF5" stroke="#bbb" strokeWidth="0.02" />
  </svg>
);
