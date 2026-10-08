import React from 'react';

/** Flags drawn to spec in code, never by an image model. Both are 3:2 here (US official is 1.9:1, scaled for the card). */
const star = (cx: number, cy: number, r: number) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.382 : r;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(2) + ',' + (cy + Math.sin(a) * rr).toFixed(2);
  }
  return d + 'Z';
};

export const FlagUSA: React.FC<{ w: number }> = ({ w }) => {
  const h = w / 1.9;
  const sh = h / 13;
  const cw = w * 0.4;
  const ch = sh * 7;
  const stars: string[] = [];
  // 9 rows alternating 6 and 5 stars
  for (let r = 0; r < 9; r++) {
    const n = r % 2 === 0 ? 6 : 5;
    for (let i = 0; i < n; i++) {
      const cx = (cw / 12) * (r % 2 === 0 ? 1 + i * 2 : 2 + i * 2);
      const cy = (ch / 10) * (r + 1);
      stars.push(star(cx, cy, h * 0.0308));
    }
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <rect width={w} height={h} fill="#FFFFFF" />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} y={i * 2 * sh} width={w} height={sh} fill="#B22234" />)}
      <rect width={cw} height={ch} fill="#3C3B6E" />
      <path d={stars.join('')} fill="#FFFFFF" />
    </svg>
  );
};

export const FlagRussia: React.FC<{ w: number }> = ({ w }) => {
  const h = w / 1.5;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <rect width={w} height={h / 3} fill="#FFFFFF" />
      <rect y={h / 3} width={w} height={h / 3} fill="#0039A6" />
      <rect y={(2 * h) / 3} width={w} height={h / 3} fill="#D52B1E" />
    </svg>
  );
};
