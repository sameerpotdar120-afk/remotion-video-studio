import React from 'react';
import { C } from './theme';

// The two flags drawn in code (both are public symbols): Canada's red-white-red with the 11-point maple leaf, Denmark's
// Dannebrog (red with a white Nordic cross). Each draws into a w×h box at the origin; `wave` 0..1 adds a cloth ripple
// (a shaded sine band) for the waving look.
export const MAPLE = 'M 0 -54 L 7 -40 Q 9 -37 13 -39 L 21 -43 L 15 -18 Q 14 -13 19 -16 L 32 -30 L 35 -22 Q 36 -19 40 -20 L 54 -23 L 49 -9 Q 47 -4 52 -2 L 56 0 L 32 20 Q 28 23 30 28 L 33 37 L 8 32 Q 3 31 3 36 L 4 60 L -4 60 L -3 36 Q -3 31 -8 32 L -33 37 L -30 28 Q -28 23 -32 20 L -56 0 L -52 -2 Q -47 -4 -49 -9 L -54 -23 L -40 -20 Q -36 -19 -35 -22 L -32 -30 L -19 -16 Q -14 -13 -15 -18 L -21 -43 L -13 -39 Q -9 -37 -7 -40 Z';

const Ripple: React.FC<{ id: string; w: number; h: number; f: number; wave: number }> = ({ id, w, h, f, wave }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
        {Array.from({ length: 9 }, (_, i) => {
          const k = i / 8;
          const a = 0.18 * wave * (0.5 + 0.5 * Math.sin(k * Math.PI * 3 - f / 6));
          return <stop key={i} offset={k} stopColor={a > 0.09 ? '#000' : '#fff'} stopOpacity={Math.abs(a - 0.09) * 2} />;
        })}
      </linearGradient>
    </defs>
    <rect width={w} height={h} fill={`url(#${id})`} />
  </>
);

export const CanadaFlag: React.FC<{ w: number; h: number; f?: number; wave?: number; uid?: string }> = ({ w, h, f = 0, wave = 0, uid = 'ca' }) => (
  <g>
    <rect width={w} height={h} fill={C.white} />
    <rect width={w * 0.25} height={h} fill={C.canadaRed} />
    <rect x={w * 0.75} width={w * 0.25} height={h} fill={C.canadaRed} />
    <path d={MAPLE} fill={C.canadaRed} transform={`translate(${w / 2} ${h / 2 - h * 0.02}) scale(${(h * 0.0072).toFixed(4)})`} />
    {wave > 0 && <Ripple id={`rp-${uid}`} w={w} h={h} f={f} wave={wave} />}
  </g>
);

export const DenmarkFlag: React.FC<{ w: number; h: number; f?: number; wave?: number; uid?: string }> = ({ w, h, f = 0, wave = 0, uid = 'dk' }) => (
  <g>
    <rect width={w} height={h} fill={C.denmark} />
    <rect x={w * (12 / 37)} width={w * (4 / 37)} height={h} fill={C.white} />
    <rect y={h * (12 / 28)} width={w} height={h * (4 / 28)} fill={C.white} />
    {wave > 0 && <Ripple id={`rp-${uid}`} w={w} h={h} f={f} wave={wave} />}
  </g>
);

/** A flag on a pole, the cloth bending in the wind (the reference's waving cutout flags). Origin at the pole's foot. */
export const PoleFlag: React.FC<{ kind: 'canada' | 'denmark'; f: number; h?: number; outline?: boolean }> = ({ kind, f, h = 700, outline = true }) => {
  const W = 300, H = kind === 'canada' ? 150 : 227;
  const id = `pf-${kind}-${h}`;
  const pts = Array.from({ length: 13 }, (_, i) => {
    const x = (i / 12) * W;
    return [x, Math.sin(i / 2.2 - f / 5) * 14 * (i / 12)];
  });
  const top = pts.map(([x, y]) => `${x},${y}`).join(' L ');
  const bot = pts.slice().reverse().map(([x, y]) => `${x},${y + H}`).join(' L ');
  return (
    <g>
      <defs><clipPath id={id}><path d={`M ${top} L ${bot} Z`} /></clipPath></defs>
      {outline && <path d={`M 0 0 V ${-h - 12}`} stroke="#fff" strokeWidth={30} strokeLinecap="round" />}
      <path d={`M 0 0 V ${-h - 12}`} stroke="#D8D2C4" strokeWidth={14} strokeLinecap="round" />
      <g transform={`translate(6 ${-h})`}>
        {outline && <path d={`M ${top} L ${bot} Z`} fill="none" stroke="#fff" strokeWidth={14} strokeLinejoin="round" />}
        <g clipPath={`url(#${id})`}>
          {kind === 'canada' ? <CanadaFlag w={W} h={H + 30} f={f} wave={1} uid={id} /> : <DenmarkFlag w={W} h={H + 30} f={f} wave={1} uid={id} />}
        </g>
      </g>
    </g>
  );
};
