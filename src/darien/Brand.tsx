import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from 'remotion';
import { useDevanagariFont } from './DarienGap';

const HINDI = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
const LATIN = "'Montserrat', sans-serif";
const GOLD = 'linear-gradient(180deg, #FFF1A8 0%, #FFD21F 45%, #D99A16 100%)';

let monoPromise: Promise<void> | null = null;
export const useMontserrat = () => {
  const [handle] = useState(() => delayRender('montserrat'));
  useEffect(() => {
    if (!monoPromise) {
      const f = new FontFace('Montserrat', `url(${staticFile('brand/Montserrat.ttf')})`, { weight: '100 900' });
      monoPromise = f.load().then((x) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(x));
    }
    monoPromise.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};

const goldText: React.CSSProperties = {
  background: GOLD,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

/** Gold compass bezel: ticks every 10°, a north pointer, two rings. */
const Bezel: React.FC<{ size: number; r: number }> = ({ size, r }) => {
  const c = size / 2;
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10 * Math.PI) / 180;
    const major = i % 9 === 0;
    const r1 = r - (major ? 26 : 12);
    return (
      <line key={i} x1={c + Math.sin(a) * r1} y1={c - Math.cos(a) * r1} x2={c + Math.sin(a) * (r - 3)} y2={c - Math.cos(a) * (r - 3)}
        stroke="url(#gold)" strokeWidth={major ? 6 : 3} strokeLinecap="round" />
    );
  });
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 0 10px rgba(255,190,40,0.45))' }}>
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF1A8" />
          <stop offset="0.45" stopColor="#FFD21F" />
          <stop offset="1" stopColor="#C98A12" />
        </linearGradient>
      </defs>
      <circle cx={c} cy={c} r={r + 12} fill="none" stroke="url(#gold)" strokeWidth={9} />
      <circle cx={c} cy={c} r={r - 32} fill="none" stroke="url(#gold)" strokeWidth={2} opacity={0.8} />
      {ticks}
      <path d={`M${c},${c - r - 52} L${c - 22},${c - r - 6} L${c + 22},${c - r - 6} Z`} fill="url(#gold)" stroke="#3a2600" strokeWidth={2} />
    </svg>
  );
};

/** 800 x 800 channel logo: India-centred Earth in a gold compass bezel, ND monogram. */
export const ProfilePic: React.FC = () => {
  useDevanagariFont();
  useMontserrat();
  const G = 540;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 50%, #0d1d36 0%, #050b16 55%, #02050b 100%)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 400 - G / 2, top: 410 - G / 2, width: G, height: G, borderRadius: '50%',
        boxShadow: '0 0 30px 6px rgba(70,170,255,0.55), 0 0 90px 20px rgba(40,120,255,0.25)' }} />
      <Img src={staticFile('brand/globe_gpt_clean.png')} style={{ position: 'absolute', left: 400 - G / 2, top: 410 - G / 2, width: G, height: G }} />
      <div style={{ position: 'absolute', left: 400 - G / 2, top: 410 - G / 2, width: G, height: G, borderRadius: '50%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 48%, rgba(2,6,14,0.78) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, top: 10, width: 800, height: 800 }}>
        <Bezel size={800} r={318} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: LATIN, fontWeight: 900,
        fontSize: 210, letterSpacing: -8, lineHeight: 1, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.85))' }}>
        <span style={{ color: '#fff' }}>N</span><span style={goldText}>D</span>
      </div>
    </AbsoluteFill>
  );
};

/** 2560 x 1440 YouTube banner; name, tagline and globe edge all inside the 1546 x 423 mobile-safe strip. */
export const Banner: React.FC = () => {
  useDevanagariFont();
  useMontserrat();
  const G = 860;
  const gx = 1890;
  const gy = 720;
  return (
    <AbsoluteFill style={{ background: '#02050b', overflow: 'hidden' }}>
      <Img src={staticFile('brand/banner_world.jpg')} style={{ position: 'absolute', inset: 0, width: 2560, height: 1440, filter: 'brightness(0.42) saturate(0.8)' }} />
      <Img src={staticFile('brand/glow_lines.png')} style={{ position: 'absolute', left: -200, top: -80, width: 2400, height: 1600, mixBlendMode: 'screen', opacity: 0.55 }} />
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(2,5,11,0.92) 0%, rgba(2,5,11,0.55) 50%, rgba(2,5,11,0.2) 75%, rgba(2,5,11,0.5) 100%)' }} />
      {/* globe, rising from the right edge */}
      <div style={{ position: 'absolute', left: gx - G / 2, top: gy - G / 2, width: G, height: G, borderRadius: '50%',
        boxShadow: '0 0 50px 10px rgba(70,170,255,0.5), 0 0 160px 40px rgba(40,120,255,0.22)' }} />
      <Img src={staticFile('brand/globe_gpt_clean.png')} style={{ position: 'absolute', left: gx - G / 2, top: gy - G / 2, width: G, height: G }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)' }} />
      <div style={{ position: 'absolute', left: 525, top: 556 }}>
        <div style={{ fontFamily: LATIN, fontWeight: 900, fontSize: 138, lineHeight: 1, letterSpacing: -3, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.85))' }}>
          <span style={{ color: '#fff' }}>Null</span><span style={goldText}>Dynasty</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 30 }}>
          <div style={{ width: 70, height: 4, background: GOLD, borderRadius: 2 }} />
          <div style={{ fontFamily: HINDI, fontWeight: 700, fontSize: 56, color: '#F2F6FF', textShadow: '0 3px 12px rgba(0,0,0,0.9)' }}>
            दुनिया का नक्शा ऐसा क्यों है?
          </div>
        </div>
        <div style={{ fontFamily: HINDI, fontWeight: 600, fontSize: 36, color: '#9FB6D6', marginTop: 14, marginLeft: 88, letterSpacing: 1 }}>
          Borders · देश · इतिहास · अनोखी जगहें, हिंदी में
        </div>
      </div>
    </AbsoluteFill>
  );
};
