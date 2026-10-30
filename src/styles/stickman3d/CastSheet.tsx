import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CAST, drawChar, drawFx, type Pose } from './chars';
import { HORSES, drawHorse, type HorsePose } from './animals';

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
    if (f > 30) { const hp2: [string, HorsePose][] = [['brown', { mode: 'gallop', t: 0.1 }], ['black', { mode: 'gallop', t: 0.45 }], ['brown', { mode: 'graze' }], ['black', { mode: 'rear', t: 0.25 }], ['black', { mode: 'buck', t: 0.25 }], ['tan', { mode: 'stand' }]]; hp2.forEach(([k, p], i) => { g.save(); g.translate(c.width * (0.25 + (i % 2) * 0.5), c.height * (0.08 + Math.floor(i / 2) * 0.3)); g.scale(8, 8); drawHorse(g, HORSES[k], p); g.restore(); }); return; }
    const cw = c.width / 5, ch = c.height / 3, s = ch / 135;
    ROWS.forEach((row, r) => row.forEach(([k, p], i) => {
      g.save(); g.translate(cw * i + cw / 2, ch * r + ch * 0.12); g.scale(s, s);
      drawChar(g, CAST[k], p); drawFx(g, p, f);
      g.restore();
    }));
    const hp: [string, HorsePose][] = [['brown', { mode: 'gallop', t: 0.1 }], ['black', { mode: 'gallop', t: 0.6 }], ['brown', { mode: 'graze' }], ['black', { mode: 'rear', t: 0.25 }], ['black', { mode: 'buck', t: 0.25 }], ['tan', { mode: 'stand' }]];
    hp.forEach(([k, p], i) => { g.save(); g.translate(c.width * (0.18 + (i % 3) * 0.32), c.height * (0.02 + Math.floor(i / 3) * 0.1)); g.scale(5, 5); drawHorse(g, HORSES[k], p); g.restore(); });
  }, [f]);
  return <AbsoluteFill><canvas ref={ref} width={2160} height={3840} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>;
};
