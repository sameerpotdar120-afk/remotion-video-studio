import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

/** The Blender Tunnel 7 shot with monsoon rain composited on top: three depth layers of thin streaks (far ones short
 *  and faint, near ones long, soft and fast), angled in a light wind, drawn on a canvas so thousands of drops stay
 *  cheap. Every drop's position is a pure function of the frame. */
const rnd = (i: number) => {
  const v = Math.sin(i * 127.13 + 41.2) * 43758.5453;
  return v - Math.floor(v);
};

type Layer = { n: number; len: [number, number]; w: number; a: number; speed: number; seed: number; blur: number };
const LAYERS: Layer[] = [
  { n: 1400, len: [16, 30], w: 1, a: 0.24, speed: 62, seed: 1, blur: 0 },
  { n: 420, len: [48, 86], w: 1.6, a: 0.3, speed: 104, seed: 2, blur: 0.6 },
  { n: 70, len: [150, 240], w: 3, a: 0.22, speed: 168, seed: 3, blur: 2.2 },
];
const ANGLE = (9 * Math.PI) / 180;

const Rain: React.FC<{ f: number; width: number; height: number }> = ({ f, width, height }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!.getContext('2d')!;
    c.clearRect(0, 0, width, height);
    const tx = Math.tan(ANGLE);
    for (const L of LAYERS) {
      c.save();
      c.filter = L.blur ? `blur(${L.blur}px)` : 'none';
      c.lineCap = 'round';
      c.lineWidth = L.w;
      const H = height + 300;
      for (let i = 0; i < L.n; i++) {
        const k = L.seed * 10000 + i;
        const len = L.len[0] + rnd(k + 0.3) * (L.len[1] - L.len[0]);
        const sp = L.speed * (0.85 + rnd(k + 0.7) * 0.3);
        const y = ((rnd(k + 0.1) * H + f * sp) % H) - 150;
        const x = rnd(k + 0.5) * (width + 400) - 200 + y * tx;
        const g = c.createLinearGradient(x, y, x - len * tx, y - len);
        g.addColorStop(0, `rgba(225,232,240,${L.a})`);
        g.addColorStop(1, 'rgba(225,232,240,0)');
        c.strokeStyle = g;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x - len * tx, y - len);
        c.stroke();
      }
      c.restore();
    }
  }, [f, width, height]);
  return <canvas ref={ref} width={width} height={height} style={{ position: 'absolute', inset: 0 }} />;
};

export const Tunnel7Rain: React.FC<{ src: string }> = ({ src }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <OffthreadVideo src={staticFile(src)} style={{ width, height }} />
      {/* rain-soaked air: a faint cool veil, heavier at the top of frame */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(190,200,210,0.16) 0%, rgba(190,200,210,0.04) 60%, rgba(190,200,210,0) 100%)' }} />
      <Rain f={f} width={width} height={height} />
    </AbsoluteFill>
  );
};
