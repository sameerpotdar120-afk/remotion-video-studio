import React from 'react';
import { AbsoluteFill, Composition, registerRoot, useCurrentFrame, useVideoConfig } from 'remotion';
import { Easing, interpolate } from 'remotion';
import { Aravalli3D, P3, V3, project, useHeights } from './Terrain3D';
import { LABEL, UI, useFonts } from '../../junagadh/edit/font';

/** A style test for the creator: how the Aravalli looks in 3D on the charcoal documentary map (Nov 17). */
const io = Easing.bezier(0.65, 0, 0.35, 1);
const lerp3 = (a: V3, b: V3, q: number): V3 => [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q, a[2] + (b[2] - a[2]) * q];

const Pin: React.FC<{ x: number; y: number; hi: string; en: string; color: string; o: number; size?: number }> = ({ x, y, hi, en, color, o, size = 46 }) => o <= 0 ? null : (
  <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)', opacity: o, textAlign: 'center' }}>
    <div style={{ padding: '4px 18px 6px', background: 'rgba(8,10,14,0.88)', border: `4px solid ${color}`, borderRadius: 14 }}>
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: size, color: '#fff', lineHeight: 1.05, whiteSpace: 'nowrap' }}>{hi}</div>
      <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: size * 0.42, letterSpacing: 3, color, whiteSpace: 'nowrap' }}>{en}</div>
    </div>
    <div style={{ width: 4, height: 70, background: '#fff', margin: '0 auto' }} />
    <div style={{ width: 18, height: 18, borderRadius: 9, background: color, border: '4px solid #fff', margin: '-4px auto 0' }} />
  </div>
);

const Test: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const h = useHeights();
  if (!h) return <AbsoluteFill style={{ background: '#16181b' }} />;
  // camera: low over Delhi looking down the ridge → along the range → up to the whole range
  const K: { t: number; pos: V3; look: V3 }[] = [
    { t: 0, pos: P3(h, 77.55, 29.05, 70), look: P3(h, 76.9, 28.15, 0) },
    { t: 3.2, pos: P3(h, 76.75, 28.55, 120), look: P3(h, 75.6, 27.0, 0) },
    { t: 6.0, pos: P3(h, 76.2, 28.6, 260), look: P3(h, 74.6, 26.2, 0) },
    { t: 9.0, pos: P3(h, 76.6, 29.6, 640), look: P3(h, 74.3, 25.4, 0) },
  ];
  let i = 1;
  while (i < K.length - 1 && t > K[i].t) i++;
  const a = K[i - 1], b = K[i];
  const q = io(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
  const pos = lerp3(a.pos, b.pos, q), look = lerp3(a.look, b.look, q);
  const cam = { pos, look, fov: 50 };
  const pin = (lon: number, lat: number, up = 1) => project(cam, width, height, P3(h, lon, lat, up));
  const [dx, dy] = pin(77.2, 28.61), [ax, ay] = pin(75.4, 26.75, 4), [tx, ty] = pin(72.0, 27.3, 1);
  const fade = (a0: number, a1: number) => interpolate(t, [a0, a0 + 0.4, a1 - 0.4, a1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#16181b' }}>
      <Aravalli3D h={h} pos={pos} look={look} fov={50} width={width} height={height} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)' }} />
      <Pin x={dx} y={dy} hi="दिल्ली · रायसीना" en="RASHTRAPATI BHAVAN" color="#FFC21A" o={fade(0.2, 4.0)} />
      <Pin x={ax} y={ay} hi="अरावली" en="ARAVALLI · ~700 KM" color="#7DDB5A" o={fade(3.0, 9.0)} size={64} />
      <Pin x={tx} y={ty} hi="थार Desert" en="THAR" color="#E8B060" o={fade(6.2, 9.0)} />
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
        3D terrain: AWS Terrain Tiles (SRTM), heights exaggerated · Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · borders: Natural Earth (India POV)
      </div>
    </AbsoluteFill>
  );
};
registerRoot(() => <Composition id="AravalliTest3D" component={Test} durationInFrames={270} fps={30} width={1080} height={1920} />);
