import React from 'react';

// Flags drawn in code (simplified, 150×100 viewBox) for round badges.
export type FlagId = 'ae' | 'om' | 'ir' | 'in';

export const FlagArt: React.FC<{ id: FlagId }> = ({ id }) => {
  switch (id) {
    case 'ae':
      return (<>
        <rect width={150} height={33.4} fill="#00732F" /><rect y={33.3} width={150} height={33.4} fill="#fff" /><rect y={66.6} width={150} height={33.4} fill="#000" />
        <rect width={40} height={100} fill="#FF0000" />
      </>);
    case 'om':
      return (<>
        <rect width={150} height={100} fill="#DB161B" />
        <rect x={40} width={110} height={33.4} fill="#fff" /><rect x={40} y={66.6} width={110} height={33.4} fill="#008000" />
        <g transform="translate(20 18)" fill="#fff"><path d="M-9 -9 L9 9 M9 -9 L-9 9" stroke="#fff" strokeWidth={3} /><circle r={5} /></g>
      </>);
    case 'ir':
      return (<>
        <rect width={150} height={33.4} fill="#239F40" /><rect y={33.3} width={150} height={33.4} fill="#fff" /><rect y={66.6} width={150} height={33.4} fill="#DA0000" />
        <g transform="translate(75 50)" fill="none" stroke="#DA0000" strokeWidth={3}><path d="M0 -12 V12 M-8 -8 Q-12 0 -6 10 M8 -8 Q12 0 6 10" /></g>
      </>);
    case 'in':
      return (<>
        <rect width={150} height={34} fill="#FF9933" /><rect y={33} width={150} height={34} fill="#fff" /><rect y={66} width={150} height={34} fill="#138808" />
        <g transform="translate(75 50)" stroke="#000080" fill="none">
          <circle r={14} strokeWidth={2.2} />
          {Array.from({ length: 24 }, (_, i) => { const a = (i * 15 * Math.PI) / 180; return <line key={i} x1={0} y1={0} x2={Math.cos(a) * 14} y2={Math.sin(a) * 14} strokeWidth={0.9} />; })}
          <circle r={2.5} fill="#000080" />
        </g>
      </>);
  }
};

export const Badge: React.FC<{ id: FlagId; r: number }> = ({ id, r }) => (
  <svg width={r * 2 + 24} height={r * 2 + 24} viewBox={`${-r - 12} ${-r - 12} ${r * 2 + 24} ${r * 2 + 24}`} style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.55))' }}>
    <defs><clipPath id={`hb_${id}_${r}`}><circle r={r} /></clipPath></defs>
    <g clipPath={`url(#hb_${id}_${r})`}><g transform={`translate(${-r * 1.5} ${-r}) scale(${(r * 3) / 150} ${(r * 2) / 100})`}><FlagArt id={id} /></g></g>
    <circle r={r} fill="none" stroke="#fff" strokeWidth={Math.max(4, r / 8)} />
  </svg>
);
