import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CAST, drawChar, drawFx, type Pose } from './chars';

/** Dev sheet: every look in a few poses/expressions, to check the drawing at a glance. */
const ROWS: [string, Pose][][] = [
  [['oldman', { eyes: 'sleepy', mouth: 'line' }], ['oldman', { eyes: 'sleepy', mouth: 'open', brows: 'raised', armR: { a: 75, e: 10 } }], ['oldman', { eyes: 'closed', mouth: 'smile', armL: { a: 35, e: 40 }, armR: { a: 35, e: 40 } }], ['blue', { eyes: 'star', mouth: 'grin', armL: { a: 150, e: -20 }, armR: { a: 150, e: -20 }, sparkles: 1 }], ['blue', { eyes: 'angry', brows: 'angry', mouth: 'frown', anger: 1 }]],
  [['red', { eyes: 'sad', brows: 'sad', mouth: 'frown' }], ['yellow', { eyes: 'dot', mouth: 'smile' }], ['green', { eyes: 'happy', mouth: 'open' }], ['son', { eyes: 'wide', mouth: 'o', sweat: true }], ['son', { eyes: 'sad', brows: 'sad', mouth: 'wavy', bandage: true, crutch: true }]],
  [['soldier', { eyes: 'angry', brows: 'angry', mouth: 'flat', spear: true }], ['soldier2', { eyes: 'dot', mouth: 'line', spear: true }], ['modern', { eyes: 'wide', mouth: 'o', holdBag: true }], ['woman', { eyes: 'happy', mouth: 'smile', armL: { a: 60, e: 30 } }], ['son', { eyes: 'dizzy', mouth: 'o', dizzy: 1, armL: { a: 120 }, armR: { a: 120 }, legL: 20, legR: -10 }]],
];

export const CastSheet: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  useLayoutEffect(() => {
    const c = ref.current!; const g = c.getContext('2d')!;
    g.fillStyle = '#e9dcc0'; g.fillRect(0, 0, c.width, c.height);
    const cw = c.width / 5, ch = c.height / 3, s = ch / 135;
    ROWS.forEach((row, r) => row.forEach(([k, p], i) => {
      g.save(); g.translate(cw * i + cw / 2, ch * r + ch * 0.12); g.scale(s, s);
      drawChar(g, CAST[k], p); drawFx(g, p, f);
      g.restore();
    }));
  }, [f]);
  return <AbsoluteFill><canvas ref={ref} width={2160} height={3840} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>;
};
