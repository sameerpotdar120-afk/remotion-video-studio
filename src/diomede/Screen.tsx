import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import { Cam, GEO, PLANE, project } from './cam';
import { CYAN, FONT, GOLD, RED } from './Overlays';

type P = [number, number];

/** Map point → final screen pixel, matching the plane's CSS rotate + rotateX + perspective. */
export const toScreen = (c: Cam, at: P): P => {
  const [px, py] = project(c, at[0], at[1]);
  let x = px - PLANE.ox;
  let y = py - PLANE.oy;
  const r = (c.rot * Math.PI) / 180;
  [x, y] = [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
  const a = (c.tilt * Math.PI) / 180;
  const yy = y * Math.cos(a);
  const z = y * Math.sin(a);
  // CSS rotateX: the top of the plane leans away (z < 0), so it shrinks toward the vanishing point
  const s = 1700 / (1700 - z);
  return [540 + x * s, 960 + yy * s];
};

const BIG = GEO.bigCenter;
const LIT = GEO.littleCenter;
const bigTop: P = [BIG[0], GEO.bigBounds[3] - 1500];
const litTop: P = [LIT[0], GEO.littleBounds[3] - 800];

// ---------------------------------------------------------------- calendar + clock widgets
const Calendar: React.FC<{ img: 'today' | 'tomorrow'; label: string; size: number; flip?: number }> = ({ img, label, size, flip = 0 }) => (
  <div style={{ position: 'relative', width: size, height: size, transform: `scaleY(${Math.abs(Math.cos(flip * Math.PI))})` }}>
    <Img src={staticFile(`diomede/img/calendar_${img}.png`)} style={{ width: size, height: size, filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.55))' }} />
    <div style={{
      position: 'absolute', left: 0, right: 0, top: size * 0.47, textAlign: 'center', fontFamily: FONT, fontWeight: 800,
      fontSize: size * (label.length > 3 ? 0.17 : 0.3), color: img === 'today' ? '#1E3A63' : '#8E1420', lineHeight: 1,
      transform: img === 'today' ? 'rotate(-4deg)' : 'rotate(4deg)',
    }}>{label}</div>
  </div>
);

const Clock: React.FC<{ size: number; hours: number; spin?: number }> = ({ size, hours, spin = 0 }) => {
  const hAng = ((hours % 12) / 12) * 360;
  const mAng = ((hours % 1) * 360);
  const r = size / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <Img src={staticFile('diomede/img/clock_face.png')} style={{ width: size, height: size, filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.55))' }} />
      <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0, filter: spin > 0.2 ? `blur(${Math.min(3, spin)}px)` : undefined }}>
        <line x1={r} y1={r} x2={r + Math.sin((hAng * Math.PI) / 180) * r * 0.42} y2={r - Math.cos((hAng * Math.PI) / 180) * r * 0.42}
          stroke="#13223A" strokeWidth={size * 0.045} strokeLinecap="round" />
        <line x1={r} y1={r} x2={r + Math.sin((mAng * Math.PI) / 180) * r * 0.62} y2={r - Math.cos((mAng * Math.PI) / 180) * r * 0.62}
          stroke="#13223A" strokeWidth={size * 0.03} strokeLinecap="round" />
        <circle cx={r} cy={r} r={size * 0.035} fill={GOLD} stroke="#13223A" strokeWidth={2} />
      </svg>
    </div>
  );
};

/** A widget column above one island, with a glowing connector line down to it. */
const Column: React.FC<{ c: Cam; x: number; y: number; target: P; color: string; a: number; children: React.ReactNode }> = ({ c, x, y, target, color, a, children }) => {
  if (a <= 0.001) return null;
  const [tx, ty] = toScreen(c, target);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: a * 0.85, filter: `drop-shadow(0 0 6px ${color})` }}>
        <path d={`M${x},${y}L${tx},${ty}`} stroke={color} strokeWidth={3} strokeDasharray="6 8" fill="none" />
        <circle cx={tx} cy={ty} r={9} fill="#fff" stroke={color} strokeWidth={4} />
      </svg>
      <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: a }}>
        {children}
      </div>
    </>
  );
};

const title = (text: string, t: number, t0: number, tOut: number, y: number, size: number, color: string, glowC: string) => {
  if (t < t0 || t > tOut + 0.4) return null;
  const p = ramp(t, t0, t0 + 0.35, easeOut);
  const a = ramp(t, t0, t0 + 0.12, linear) * (1 - ramp(t, tOut, tOut + 0.35, linear));
  return (
    <div key={text} style={{
      position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: size, color,
      whiteSpace: 'nowrap', opacity: a, transform: `scale(${lerp(2.3, 1, p)})`, filter: `blur(${(1 - p) * 10}px)`,
      textShadow: `0 0 12px ${glowC}, 0 0 34px ${glowC}, 0 5px 14px rgba(0,0,0,0.6)`,
    }}>{text}</div>
  );
};

export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const out: React.ReactNode[] = [];
  const L = 290; // left column = Big Diomede (Russia)
  const Rr = 790; // right column = Little Diomede (USA)

  // ---- hook calendars: आज (Little) · कल (Big)
  const hookA = 1 - ramp(t, 7.0, 7.35, easeIn);
  if (t > 4.6 && hookA > 0) {
    const sL = pop(t, 4.72, 10, 190);
    const sB = pop(t, 6.34, 10, 190);
    out.push(
      <Column key="hL" c={c} x={Rr} y={760} target={litTop} color={CYAN} a={clamp01(sL) * hookA}>
        <div style={{ transform: `scale(${sL})` }}><Calendar img="today" label="आज" size={300} /></div>
      </Column>,
      <Column key="hB" c={c} x={L} y={760} target={bigTop} color={RED} a={clamp01(sB) * hookA}>
        <div style={{ transform: `scale(${sB})` }}><Calendar img="tomorrow" label="कल" size={300} /></div>
      </Column>,
    );
  }

  // ---- title
  out.push(title('डायोमीडी आइलैंड्स', t, 7.7, 9.2, 300, 118, '#fff', '#3FC6FF'));

  // ---- Monday / Tuesday clocks (17.4 – 23.4)
  const ctA = 1 - ramp(t, 23.2, 23.6, easeIn);
  if (t > 17.3 && ctA > 0) {
    const sCL = pop(t, 17.4, 10, 190);
    const sKL = pop(t, 18.7, 10, 190);
    const sSun = pop(t, 19.42, 9, 200);
    const sCB = pop(t, 20.58, 10, 190);
    const sKB = pop(t, 20.9, 10, 190);
    const spinP = ramp(t, 20.8, 21.75, inOut);
    const hoursB = 8 + 21 * spinP;
    const spinSpeed = spinP > 0 && spinP < 1 ? 3 : 0;
    const flip = ramp(t, 21.6, 21.9, linear);
    const tues = flip > 0.5;
    out.push(
      <Column key="cL" c={c} x={Rr} y={1000} target={litTop} color={CYAN} a={clamp01(sCL) * ctA}>
        <div style={{ position: 'relative', transform: `scale(${sCL})` }}>
          <Clock size={230} hours={8 + ((t * 30) % 60) / 3600} />
          {sSun > 0 && <Img src={staticFile('diomede/img/icon_sunrise.png')} style={{ position: 'absolute', right: -70, top: -60, width: 150, transform: `scale(${sSun})` }} />}
        </div>
        <div style={{ transform: `scale(${sKL})` }}><Calendar img="today" label="सोमवार" size={250} /></div>
      </Column>,
      <Column key="cB" c={c} x={L} y={1000} target={bigTop} color={RED} a={clamp01(sCB) * ctA}>
        <div style={{ position: 'relative', transform: `scale(${sCB})` }}>
          <Clock size={230} hours={hoursB} spin={spinSpeed} />
          {spinP > 0 && (
            <div style={{ position: 'absolute', left: '50%', top: -66, transform: 'translateX(-50%)', fontFamily: FONT, fontWeight: 800, fontSize: 54, color: GOLD,
              whiteSpace: 'nowrap', textShadow: '0 0 14px rgba(255,190,0,0.8), 0 3px 10px rgba(0,0,0,0.9)' }}>+{Math.round(21 * spinP)} घंटे</div>
          )}
        </div>
        <div style={{ transform: `scale(${sKB})` }}><Calendar img="tomorrow" label={tues ? 'मंगलवार' : 'सोमवार'} size={250} flip={flip} /></div>
      </Column>,
    );
  }

  // ---- "?" (26.5 – 27.4)
  if (t > 26.45 && t < 27.5) {
    const s = pop(t, 26.52, 9, 200) * (1 - ramp(t, 27.1, 27.45, easeIn));
    out.push(
      <div key="q" style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 300,
        color: GOLD, transform: `scale(${s})`, textShadow: '0 0 30px rgba(255,190,0,0.8), 0 8px 20px rgba(0,0,0,0.7)' }}>?</div>,
    );
  }

  // ---- 1867 + treaty + quill (27.36 – 31.6)
  out.push(title('1867', t, 27.36, 31.3, 250, 190, '#FFF3C4', 'rgba(255,190,0,0.9)'));
  if (t > 28.8 && t < 31.9) {
    const inP = ramp(t, 28.9, 29.5, easeOut);
    const outP = ramp(t, 31.3, 31.8, easeIn);
    out.push(
      <div key="treaty" style={{ position: 'absolute', left: 600, top: 980, width: 380, transform: `translate(${(1 - inP) * 600 + outP * 600}px, ${(1 - inP) * 120}px) rotate(${lerp(18, 7, inP)}deg)` }}>
        <Img src={staticFile('diomede/img/treaty_parchment.png')} style={{ width: 380, filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.6))' }} />
        {t > 30.1 && t < 31.4 && (() => {
          const q = ramp(t, 30.15, 31.2, linear);
          const qx = 70 + q * 220;
          const qy = 420 + Math.sin(q * Math.PI * 7) * 14 + q * 10;
          return <Img src={staticFile('diomede/img/quill_pen.png')} style={{ position: 'absolute', left: qx - 30, top: qy - 250, width: 260, transform: 'rotate(-8deg)' }} />;
        })()}
      </div>,
    );
  }

  // ---- Cold War: frost + red/blue split + title (34.7 – 40.6)
  const cw = ramp(t, 34.75, 35.6, inOut) * (1 - ramp(t, 40.0, 40.8, linear));
  if (cw > 0) {
    // split along the border's on-screen direction: Russia side red, US side blue
    const gm: P = [(GEO.gapA[0] + GEO.gapB[0]) / 2, (GEO.gapA[1] + GEO.gapB[1]) / 2];
    const s1 = toScreen(c, [gm[0], gm[1] - 20000]);
    const s2 = toScreen(c, [gm[0], gm[1] + 20000]);
    const sB = toScreen(c, BIG);
    const dx = s2[0] - s1[0];
    const dy = s2[1] - s1[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L;
    const ny = dx / L;
    // which side of the line is Russia?
    const side = Math.sign((sB[0] - s1[0]) * nx + (sB[1] - s1[1]) * ny) || 1;
    const ang = (Math.atan2(ny * side, nx * side) * 180) / Math.PI + 90; // CSS gradient angle pointing toward Russia
    out.push(
      <AbsoluteFill key="split" style={{
        background: `linear-gradient(${ang}deg, rgba(40,140,255,0.55) 0%, rgba(40,140,255,0.32) 49.8%, rgba(214,30,45,0.36) 50.2%, rgba(214,30,45,0.55) 100%)`,
        mixBlendMode: 'overlay', opacity: cw,
      }} />,
      <Img key="frost" src={staticFile('diomede/img/frost_overlay.png')} style={{
        position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, mixBlendMode: 'screen',
        opacity: cw * 0.9, transform: `scale(${lerp(1.35, 1.02, ramp(t, 34.75, 35.8, easeOut))})`,
      }} />,
    );
  }
  out.push(title('आइस कर्टन', t, 39.04, 40.2, 300, 150, '#F2FBFF', 'rgba(110,210,255,0.95)'));

  // ---- winter: snowfall (46.0 →)
  const snow = ramp(t, 46.0, 46.8, linear);
  if (snow > 0) {
    const flakes = Array.from({ length: 70 }, (_, i) => {
      const seed = (i * 9301 + 49297) % 233280 / 233280;
      const seed2 = (i * 4271 + 1291) % 1000 / 1000;
      const sp = 90 + seed2 * 160;
      const x = (seed * 1180 + Math.sin(t * 0.8 + i) * 30) % 1180 - 50;
      const y = ((seed2 * 2200 + t * sp) % 2100) - 100;
      const r = 2 + seed * 5;
      return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.55 + seed2 * 0.4} />;
    });
    out.push(<svg key="snow" width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: snow, filter: 'blur(0.6px)' }}>{flakes}</svg>);
  }

  // ---- winter calendars again: आज (Little) · कल (Big), then the question
  const wA = 1;
  if (t > 51.6) {
    const sL = pop(t, 51.76, 10, 190);
    const sB = pop(t, 53.54, 10, 190);
    const pulseL = 1 + 0.12 * window4(t, 55.9, 56.05, 56.5, 56.9);
    const pulseB = 1 + 0.12 * window4(t, 56.85, 57.0, 57.5, 57.9);
    out.push(
      <Column key="wL" c={c} x={Rr} y={700} target={litTop} color={CYAN} a={clamp01(sL) * wA}>
        <div style={{ transform: `scale(${sL * pulseL})` }}><Calendar img="today" label="आज" size={270} /></div>
        {t > 55.85 && <Chip text="आज वाले?" color={CYAN} s={pop(t, 55.92, 10, 200)} />}
      </Column>,
      <Column key="wB" c={c} x={L} y={700} target={bigTop} color={RED} a={clamp01(sB) * wA}>
        <div style={{ transform: `scale(${sB * pulseB})` }}><Calendar img="tomorrow" label="कल" size={270} /></div>
        {t > 56.8 && <Chip text="कल वाले?" color={RED} s={pop(t, 56.88, 10, 200)} />}
      </Column>,
    );
  }
  if (t > 53.9) {
    const s = pop(t, 54.0, 10, 170);
    const bob = Math.sin(t * 3) * 8;
    out.push(
      <Img key="emoji" src={staticFile('diomede/img/emoji_thinking.png')} style={{
        position: 'absolute', left: 540 - 140, top: 1150 + bob, width: 280, transform: `scale(${s}) rotate(${Math.sin(t * 2) * 4}deg)`,
        filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.55))',
      }} />,
    );
  }
  if (t > 57.85) {
    const s = pop(t, 57.92, 9, 210);
    out.push(
      <div key="comment" style={{ position: 'absolute', left: 0, right: 0, top: 1370, display: 'flex', justifyContent: 'center', transform: `scale(${s})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.96)', borderRadius: 60, padding: '14px 34px 14px 22px',
          boxShadow: '0 0 0 4px rgba(255,210,31,0.9), 0 0 30px rgba(255,210,31,0.7), 0 10px 24px rgba(0,0,0,0.5)' }}>
          <svg width={58} height={58} viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#13223A" /></svg>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 54, color: '#13223A' }}>कमेंट करो</div>
          <svg width={40} height={40} viewBox="0 0 24 24" style={{ transform: `translateY(${Math.abs(Math.sin(t * 6)) * 6}px)` }}><path d="M12 4v14M5 12l7 7 7-7" stroke="#13223A" strokeWidth={3} fill="none" strokeLinecap="round" /></svg>
        </div>
      </div>,
    );
  }

  return <>{out}</>;
};

const Chip: React.FC<{ text: string; color: string; s: number }> = ({ text, color, s }) => (
  <div style={{ transform: `scale(${s})`, fontFamily: FONT, fontWeight: 800, fontSize: 52, color: '#fff', padding: '6px 22px', borderRadius: 40,
    background: color, boxShadow: `0 0 24px ${color}, 0 6px 14px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</div>
);

/** Full-frame light: flashes, vignette. */
export const ScreenFX: React.FC<{ t: number }> = ({ t }) => {
  const fx: React.ReactNode[] = [];
  const flash = window4(t, 30.85, 30.92, 30.98, 31.25) * 0.35 + window4(t, 36.76, 36.82, 36.9, 37.2) * 0.4;
  if (flash > 0) fx.push(<AbsoluteFill key="fl" style={{ background: '#E8F6FF', opacity: flash, mixBlendMode: 'screen' }} />);
  fx.push(<AbsoluteFill key="vig" style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)' }} />);
  return <>{fx}</>;
};

export const shake = (t: number) => {
  const hits: [number, number][] = [[1.35, 6], [4.72, 4], [6.34, 4], [7.75, 7], [26.52, 6], [27.4, 8], [30.9, 5], [36.8, 9], [39.05, 8], [42.2, 6], [48.7, 5]];
  let x = 0;
  let y = 0;
  for (const [t0, a] of hits) {
    x += kick(t, t0, a, 38, 9);
    y += kick(t, t0, a * 0.8, 31, 9);
  }
  return [x, y];
};
