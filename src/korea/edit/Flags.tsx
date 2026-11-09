import React from 'react';

// National flags and emblems drawn in code (simplified, 150×100 viewBox), for round badges on the map.
export type FlagId = 'kp' | 'kr' | 'su' | 'us' | 'un' | 'cn' | 'in' | 'jp';

const star = (cx: number, cy: number, r: number, rot = 0) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((i * 36 + rot - 90) * Math.PI) / 180, rr = i % 2 ? r * 0.4 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return pts.join(' ');
};

const Trigram: React.FC<{ x: number; y: number; rot: number; gaps: boolean[] }> = ({ x, y, rot, gaps }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {gaps.map((g, i) => (g
      ? <g key={i}><rect x={-12} y={-10 + i * 7.5} width={10.5} height={5} fill="#111" /><rect x={1.5} y={-10 + i * 7.5} width={10.5} height={5} fill="#111" /></g>
      : <rect key={i} x={-12} y={-10 + i * 7.5} width={24} height={5} fill="#111" />))}
  </g>
);

export const FlagArt: React.FC<{ id: FlagId }> = ({ id }) => {
  switch (id) {
    case 'kp':
      return (<>
        <rect width={150} height={100} fill="#024FA2" />
        <rect y={16} width={150} height={68} fill="#fff" />
        <rect y={20} width={150} height={60} fill="#ED1C27" />
        <circle cx={52} cy={50} r={20} fill="#fff" />
        <polygon points={star(52, 51, 19)} fill="#ED1C27" />
      </>);
    case 'kr':
      return (<>
        <rect width={150} height={100} fill="#fff" />
        <g transform="translate(75 50) rotate(-33.7)">
          <circle r={25} fill="#0047A0" />
          <path d="M-25 0 A25 25 0 0 1 25 0 A12.5 12.5 0 0 1 0 0 A12.5 12.5 0 0 0 -25 0 Z" fill="#CD2E3A" />
        </g>
        <Trigram x={33} y={24} rot={-33.7} gaps={[false, false, false]} />
        <Trigram x={117} y={76} rot={-33.7} gaps={[true, true, true]} />
        <Trigram x={117} y={24} rot={33.7} gaps={[true, false, true]} />
        <Trigram x={33} y={76} rot={33.7} gaps={[false, true, false]} />
      </>);
    case 'su':
      return (<>
        <rect width={150} height={100} fill="#CC0000" />
        <polygon points={star(38, 18, 8)} fill="none" stroke="#FFD700" strokeWidth={2} />
        <path d="M24 56 A20 20 0 1 0 54 32 L50 36 A15 15 0 1 1 28 52 Z" fill="#FFD700" />
        <path d="M28 70 L52 44 M46 38 L58 50" stroke="#FFD700" strokeWidth={6} strokeLinecap="round" />
      </>);
    case 'us':
      return (<>
        {Array.from({ length: 13 }, (_, i) => <rect key={i} y={(i * 100) / 13} width={150} height={100 / 13 + 0.3} fill={i % 2 ? '#fff' : '#B22234'} />)}
        <rect width={64} height={54} fill="#3C3B6E" />
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={6 + (i % 6) * 10.5 + (Math.floor(i / 6) % 2) * 5} cy={6 + Math.floor(i / 6) * 10.5} r={2.3} fill="#fff" />)}
      </>);
    case 'un':
      return (<>
        <rect width={150} height={100} fill="#4B92DB" />
        <g transform="translate(75 48)" fill="none" stroke="#fff" strokeWidth={3}>
          <circle r={24} />
          <circle r={12} />
          <path d="M-24 0 H24 M0 -24 V24" />
          <path d="M-32 -6 Q-36 22 -12 34 M32 -6 Q36 22 12 34" strokeWidth={4} />
        </g>
      </>);
    case 'cn':
      return (<>
        <rect width={150} height={100} fill="#DE2910" />
        <polygon points={star(25, 25, 15)} fill="#FFDE00" />
        {[[50, 10, 23], [60, 20, 45], [60, 35, 0], [50, 45, 23]].map(([x, y, r], i) => <polygon key={i} points={star(x, y, 5, r)} fill="#FFDE00" />)}
      </>);
    case 'in':
      return (<>
        <rect width={150} height={34} fill="#FF9933" />
        <rect y={33} width={150} height={34} fill="#fff" />
        <rect y={66} width={150} height={34} fill="#138808" />
        <g transform="translate(75 50)" stroke="#000080" fill="none">
          <circle r={14} strokeWidth={2.2} />
          {Array.from({ length: 24 }, (_, i) => { const a = (i * 15 * Math.PI) / 180; return <line key={i} x1={0} y1={0} x2={Math.cos(a) * 14} y2={Math.sin(a) * 14} strokeWidth={0.9} />; })}
          <circle r={2.5} fill="#000080" />
        </g>
      </>);
    case 'jp':
      return (<>
        <rect width={150} height={100} fill="#fff" />
        <circle cx={75} cy={50} r={30} fill="#BC002D" />
      </>);
  }
};

/** A round badge: the flag in a circle with a white rim and a drop shadow. r is the radius in px. */
export const Badge: React.FC<{ id: FlagId; r: number }> = ({ id, r }) => (
  <svg width={r * 2 + 24} height={r * 2 + 24} viewBox={`${-r - 12} ${-r - 12} ${r * 2 + 24} ${r * 2 + 24}`} style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.55))' }}>
    <defs><clipPath id={`bc_${id}_${r}`}><circle r={r} /></clipPath></defs>
    <g clipPath={`url(#bc_${id}_${r})`}>
      <g transform={`translate(${-r * 1.5} ${-r}) scale(${(r * 3) / 150} ${(r * 2) / 100})`}><FlagArt id={id} /></g>
    </g>
    <circle r={r} fill="none" stroke="#fff" strokeWidth={Math.max(4, r / 8)} />
  </svg>
);

/** A rectangular flag with a thin white edge. */
export const Flag: React.FC<{ id: FlagId; w: number }> = ({ id, w }) => (
  <svg width={w} height={(w * 2) / 3} viewBox="0 0 150 100" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))', border: '3px solid #fff', borderRadius: 4 }}><FlagArt id={id} /></svg>
);
