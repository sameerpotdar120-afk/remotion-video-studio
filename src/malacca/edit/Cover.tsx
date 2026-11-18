import React from 'react';
import { AbsoluteFill, Composition, Img, registerRoot, staticFile } from 'remotion';
import { GEO, merc, ringsD, toS } from './cam';
import { ASPECT } from './assets';
import { FlatHL, MapPerson } from './Doc';
import { UI, useFonts } from './font';
import { MapLayers } from './Map';

/**
 * The cover for YouTube Shorts and Instagram Reels, in the documentary style: China red, India blue, the Andaman &
 * Nicobar Islands and the Malacca Strait lit, the oil route with the tanker on it, Xi and Modi, and "China का सबसे बड़ा
 * डर!" in the top third. Inside the 3:4 crop. Own entry (not render.tsx).
 */
const Big: React.FC<{ text: string; size: number; color: string }> = ({ text, size, color }) => (
  <span style={{ fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 11)}px #0B1830`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const MlCover: React.FC = () => {
  useFonts();
  const [x, y] = merc(96.5, 13.5);
  const c = { x, y, mpp: 1750 };
  const [ix, iy] = toS(c, merc(86.0, 23.0)), [cx, cy] = toS(c, merc(101.0, 26.0)), [ax, ay] = toS(c, merc(93.0, 10.0));
  const route = GEO.route.map((p) => toS(c, p));
  const d = route.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('');
  const [tx, ty] = toS(c, merc(98.6, 4.6));
  const [sx, sy] = toS(c, merc(100.2, 3.4)), [nx, ny] = toS(c, merc(92.9, 11.0));
  const strait = GEO.route.slice(8, 13).map((p) => toS(c, p)).map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('');
  const tw = 300, th = tw / ASPECT.t_tanker;
  return (
    <AbsoluteFill style={{ background: '#101215', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: 'grayscale(1) contrast(1.3) brightness(0.98)' }}><MapLayers c={c} /></AbsoluteFill>
      {(['fill', 'line'] as const).map((pass) => (
        <svg key={pass} width={1080} height={1920} style={{ position: 'absolute', inset: 0, ...(pass === 'fill' ? { mixBlendMode: 'hard-light' as const } : {}) }}>
          <FlatHL id="cvC" d={ringsD(c, GEO.countries.China)} fill="red" g={1} cx={cx} cy={cy} pass={pass} />
          <FlatHL id="cvI" d={ringsD(c, GEO.mainland)} fill="blue" g={1} cx={ix} cy={iy} pass={pass} />
          <FlatHL id="cvA" d={ringsD(c, GEO.andaman)} fill="blue" g={1} cx={ax} cy={ay} stroke={4} pass={pass} />
        </svg>
      ))}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={strait} fill="none" stroke="#7FC4FF" strokeWidth={90} opacity={0.35} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#E3262E" strokeWidth={10} opacity={0.6} strokeLinecap="round" />
        <path d={d} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="16 14" />
      </svg>
      <div style={{ position: 'absolute', left: tx - tw / 2, top: ty - th * 0.8, width: tw }}>
        <div style={{ position: 'absolute', left: tw * 0.1, right: tw * 0.1, top: th * 0.72, height: th * 0.16, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.6), rgba(0,0,0,0) 70%)' }} />
        <Img src={staticFile('malacca/img/t_tanker.png')} style={{ width: tw, position: 'relative' }} />
      </div>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 700, background: 'linear-gradient(180deg, rgba(5,8,12,0.92) 0%, rgba(5,8,12,0.55) 55%, rgba(5,8,12,0))' }} />
      <MapPerson who={{ k: 'x_xi_jinping', hi: 'शी जिनपिंग', en: 'XI JINPING', bar: '#E3262E' }} t={9} t0={0} x={820} bottom={1080} h={420} label={false} />
      <MapPerson who={{ k: 'm_narendra_modi', hi: 'नरेंद्र मोदी', en: 'NARENDRA MODI', bar: '#2F7BFF' }} t={9} t0={0} x={210} bottom={1700} h={400} label={false} />
      {([[sx + 40, sy + 40, 'Malacca Strait', '#7FC4FF'], [nx - 10, ny - 70, 'अंडमान-निकोबार', '#2F7BFF']] as const).map(([lx, ly, txt, col]) => (
        <div key={txt} style={{ position: 'absolute', left: lx, top: ly, transform: 'translate(-50%,-50%)', padding: '4px 16px', background: 'rgba(8,12,20,0.9)', border: `4px solid ${col}`, borderRadius: 14, fontFamily: UI, fontWeight: 800, fontSize: 38, color: '#fff', whiteSpace: 'nowrap' }}>{txt}</div>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', lineHeight: 1.0 }}>
        <Big text="China का" size={140} color="#fff" /><br />
        <Big text="सबसे बड़ा डर!" size={160} color="#FF5A5F" />
      </div>
      <div style={{ position: 'absolute', right: 26, top: 1620, padding: '2px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.55)', fontFamily: 'sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>AI illustration</div>
    </AbsoluteFill>
  );
};
registerRoot(() => <Composition id="MlCover" component={MlCover} durationInFrames={1} fps={30} width={1080} height={1920} />);
