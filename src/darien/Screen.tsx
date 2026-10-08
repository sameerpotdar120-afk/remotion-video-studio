import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { easeIn, easeOut, inOut, lerp, linear, pop, ramp, window4 } from './anim';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";

/** Titles and icons that live in screen space, above the map. */
export const ScreenTitles: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [];

  // "30,000 किमी" counter (1.8–5.0)
  if (t > 1.75 && t < 5.05) {
    const s = pop(t, 1.8, 11, 180);
    const n = Math.round(30000 * ramp(t, 1.85, 3.25, easeOut));
    const a = 1 - ramp(t, 4.6, 5.0, linear);
    out.push(
      <div key="cnt" style={{
        position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: FONT, fontWeight: 800,
        fontSize: 128, color: '#FFF6C8', opacity: a, transform: `scale(${s})`,
        textShadow: '0 0 12px rgba(255,200,0,0.95), 0 0 36px rgba(255,170,0,0.75), 0 4px 12px rgba(0,0,0,0.6)',
      }}>
        {n.toLocaleString('en-US')} <span style={{ fontSize: 88 }}>किमी</span>
      </div>,
    );
  }

  // "डेरियन गैप" title slam (15.54–18.0)
  if (t > 15.5 && t < 18.05) {
    const p = ramp(t, 15.54, 15.9, easeOut);
    const settle = ramp(t, 16.5, 17.2, inOut);
    const scale = lerp(2.6, 1, p) * lerp(1, 0.62, settle);
    const y = lerp(840, 700, settle);
    const a = ramp(t, 15.54, 15.68, linear) * (1 - ramp(t, 17.6, 18.0, linear));
    out.push(
      <div key="title" style={{
        position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: FONT, fontWeight: 800,
        fontSize: 158, color: '#fff', opacity: a, transform: `scale(${scale})`, filter: `blur(${(1 - p) * 10}px)`,
        textShadow: '0 0 12px #40ff70, 0 0 34px #22e050, 0 0 70px #10b838, 0 5px 14px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
      }}>
        डेरियन गैप
      </div>,
    );
  }

  // police icon with ban slash (62.72–65.3)
  if (t > 62.7 && t < 65.35) {
    const s = pop(t, 62.72, 10, 170);
    const fly = ramp(t, 64.78, 65.3, easeIn);
    const slash = ramp(t, 63.98, 64.3, easeOut);
    const size = 400;
    out.push(
      <div key="police" style={{
        position: 'absolute', left: 540 - size / 2, top: 560 - size / 2 - fly * 260, width: size, height: size,
        transform: `scale(${s * lerp(1, 6, fly * fly)}) rotate(${-fly * 18}deg)`, opacity: 1 - ramp(t, 65.0, 65.3, linear),
        filter: `drop-shadow(0 0 16px rgba(255,40,60,0.95)) drop-shadow(0 0 40px rgba(255,20,40,0.6)) blur(${fly * 8}px)`,
      }}>
        <Img src={staticFile('darien/img/icon_police.png')} style={{ width: size, height: size }} />
        <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }}>
          <line x1={size * 0.17} y1={size * 0.17} x2={lerp(size * 0.17, size * 0.83, slash)} y2={lerp(size * 0.17, size * 0.83, slash)}
            stroke="#E3202E" strokeWidth={30} strokeLinecap="round" opacity={slash > 0 ? 1 : 0} />
        </svg>
      </div>,
    );
  }

  return <>{out}</>;
};

/** Full-frame light, weather and transition effects. */
export const ScreenFX: React.FC<{ t: number }> = ({ t }) => {
  const fx: React.ReactNode[] = [];

  // dark mood: "पर क्यों?" (26.4–28.2)
  const dark = ramp(t, 26.35, 26.9, inOut) * (1 - ramp(t, 27.95, 28.2, linear));
  if (dark > 0) {
    fx.push(
      <Img key="fog" src={staticFile('darien/img/overlay_fog.png')} style={{
        position: 'absolute', left: -60, top: -60, width: 1200, height: 2040, mixBlendMode: 'screen', opacity: 0.75 * dark,
        transform: `scale(${1.05 + (t - 26.4) * 0.03})`,
      }} />,
      <Img key="emb" src={staticFile('darien/img/overlay_embers.png')} style={{
        position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, mixBlendMode: 'screen', opacity: 0.6 * dark,
        transform: `translateY(${-(t - 26.4) * 70}px) scale(1.12)`,
      }} />,
      <AbsoluteFill key="dv" style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)', opacity: dark }} />,
    );
  }

  // red danger pulses
  const red = window4(t, 24.9, 25.05, 25.3, 25.9) * 0.8 + window4(t, 57.6, 57.75, 58.0, 58.7) * 0.6 + window4(t, 68.05, 68.2, 68.5, 69.2) * 0.7;
  if (red > 0) {
    fx.push(<AbsoluteFill key="redv" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(160,0,10,0) 45%, rgba(190,0,20,0.75) 100%)', opacity: red }} />);
  }

  // humid haze (38.0–40.6) and rain (38.9–40.6)
  const haze = ramp(t, 38.0, 38.6, inOut) * (1 - ramp(t, 40.4, 40.7, linear));
  if (haze > 0) {
    fx.push(
      <Img key="haze" src={staticFile('darien/img/overlay_fog.png')} style={{
        position: 'absolute', left: -100, top: -100, width: 1280, height: 2120, mixBlendMode: 'screen', opacity: 0.35 * haze,
        transform: `translateX(${(t - 38) * 25}px)`,
      }} />,
    );
  }
  const rain = ramp(t, 38.9, 39.3, linear) * (1 - ramp(t, 40.4, 40.7, linear));
  if (rain > 0) {
    const off = (t * 2600) % 400;
    fx.push(
      <div key="rain" style={{
        position: 'absolute', left: -300, top: -300, width: 1680, height: 2520, opacity: 0.32 * rain, transform: 'rotate(12deg)',
        backgroundImage: 'repeating-linear-gradient(90deg, rgba(220,235,255,0) 0px, rgba(220,235,255,0) 21px, rgba(220,235,255,0.75) 22px, rgba(220,235,255,0) 23px), linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)',
        maskImage: 'repeating-linear-gradient(180deg, transparent 0px, black 40px, black 120px, transparent 200px, transparent 400px)',
        WebkitMaskImage: 'repeating-linear-gradient(180deg, transparent 0px, black 40px, black 120px, transparent 200px, transparent 400px)',
        WebkitMaskPosition: `0 ${off}px`, maskPosition: `0 ${off}px`,
      }} />,
    );
  }
  const thunder = window4(t, 39.62, 39.66, 39.72, 39.9) * 0.55 + window4(t, 39.95, 39.98, 40.02, 40.2) * 0.35;
  if (thunder > 0) fx.push(<AbsoluteFill key="th" style={{ background: '#dfe8ff', opacity: thunder, mixBlendMode: 'screen' }} />);

  // zoom-through flash into the B-roll (30.6–31.1)
  const flash = window4(t, 30.62, 30.86, 30.92, 31.15);
  if (flash > 0) fx.push(<AbsoluteFill key="fl" style={{ background: '#ffffff', opacity: flash * 0.9 }} />);

  // light leak into the paper map (40.25–41.2)
  const leak = window4(t, 40.25, 40.55, 40.75, 41.2);
  if (leak > 0) {
    fx.push(
      <Img key="leak" src={staticFile('darien/img/overlay_lightleak.png')} style={{
        position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, mixBlendMode: 'screen', opacity: leak,
        transform: `translateX(${lerp(-380, 260, ramp(t, 40.25, 41.2, linear))}px) scale(1.5)`,
      }} />,
      <AbsoluteFill key="leakw" style={{ background: 'linear-gradient(135deg, #ff7ad9, #ffe58a)', mixBlendMode: 'screen', opacity: leak * 0.55 }} />,
    );
  }

  // iris back to satellite (48.85–49.45)
  if (t > 48.85 && t < 49.45) {
    const r = t < 49.1 ? lerp(1500, 0, ramp(t, 48.85, 49.1, easeIn)) : lerp(0, 1500, ramp(t, 49.1, 49.45, easeOut));
    fx.push(
      <AbsoluteFill key="iris" style={{
        background: `radial-gradient(circle at 540px 960px, rgba(0,0,0,0) ${r}px, rgba(0,0,0,1) ${r + 60}px)`,
      }} />,
    );
  }

  // always-on vignette
  fx.push(<AbsoluteFill key="vig" style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)' }} />);

  return <>{fx}</>;
};
