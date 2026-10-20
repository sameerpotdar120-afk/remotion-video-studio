import React from 'react';

/** Rounds the corners of a polygon with quadratic curves of radius r. */
const roundedPath = (pts: [number, number][], r: number) => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const [px, py] = pts[(i - 1 + n) % n];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[(i + 1) % n];
    const toward = (ax: number, ay: number) => {
      const len = Math.hypot(ax - cx, ay - cy);
      const t = Math.min(r, len / 2) / len;
      return [cx + (ax - cx) * t, cy + (ay - cy) * t];
    };
    const [ax, ay] = toward(px, py);
    const [bx, by] = toward(nx, ny);
    d += `${i === 0 ? 'M' : 'L'}${ax} ${ay} Q${cx} ${cy} ${bx} ${by} `;
  }
  return d + 'Z';
};

/**
 * The reference's chunky white block arrow (f950): solid opaque white, no outline, soft drop shadow.
 * Points right; ArrowBob rotates it. Rendered once to public/assets/icons/arrow_white_block.png.
 */
export const ArrowBlock: React.FC<{ width: number; height: number }> = ({ width: w, height: h }) => {
  const shaftH = 0.36 * h;
  const headH = 0.82 * h;
  const x0 = 0.08 * w;
  const base = 0.56 * w;
  const tip = 0.92 * w;
  const cy = h / 2;
  const pts: [number, number][] = [
    [x0, cy - shaftH / 2],
    [base, cy - shaftH / 2],
    [base, cy - headH / 2],
    [tip, cy],
    [base, cy + headH / 2],
    [base, cy + shaftH / 2],
    [x0, cy + shaftH / 2],
  ];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <filter id="shadow" x="-10%" y="-20%" width="120%" height="140%">
          <feDropShadow dx="0" dy={0.025 * h} stdDeviation={0.03 * h} floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      <path d={roundedPath(pts, 0.02 * w)} fill="#FFFFFF" filter="url(#shadow)" />
    </svg>
  );
};
