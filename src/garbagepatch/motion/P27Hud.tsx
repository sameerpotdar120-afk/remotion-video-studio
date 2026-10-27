import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { clamp } from './theme';

// p27_hud (line 10, "satellite भी इन्हें नहीं देख पाते। ऊपर से देखो, तो बस नीला पानी"): a satellite camera viewfinder
// over the map: four white corner brackets snap in from the frame edges (10 frames) to a box round `at`, a thin
// crosshair, a scan line sweeping down, a blinking red REC dot and a zoom readout counting up. At `miss` a red ✕ blinks
// in the centre with `missText` (e.g. "कुछ नहीं"). Transparent, 1080×1920.
export const P27Hud: React.FC<{ at?: [number, number]; size?: [number, number]; miss?: number; missText?: string; zoom?: [number, number] }> = ({ at = [540, 960], size = [700, 520], miss, missText = 'कुछ नहीं', zoom = [1, 40] }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const w = size[0] / 2 + (1 - t) * 500, h = size[1] / 2 + (1 - t) * 900, L = 70;
  const scan = ((f % 90) / 90) * size[1] - size[1] / 2;
  const z = interpolate(f, [0, 120], zoom, clamp);
  const m = miss !== undefined && f >= miss && Math.floor((f - miss) / 10) % 2 === 0;
  const corner = (sx: number, sy: number) => `M${at[0] + sx * w},${at[1] + sy * (h - L)} L${at[0] + sx * w},${at[1] + sy * h} L${at[0] + sx * (w - L)},${at[1] + sy * h}`;
  return (
    <AbsoluteFill style={{ opacity: t }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible', filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.6))' }}>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => <path key={i} d={corner(sx, sy)} fill="none" stroke="#fff" strokeWidth={6} />)}
        <line x1={at[0] - 40} y1={at[1]} x2={at[0] + 40} y2={at[1]} stroke="#fff" strokeWidth={2} opacity={0.8} />
        <line x1={at[0]} y1={at[1] - 40} x2={at[0]} y2={at[1] + 40} stroke="#fff" strokeWidth={2} opacity={0.8} />
        <line x1={at[0] - size[0] / 2} y1={at[1] + scan} x2={at[0] + size[0] / 2} y2={at[1] + scan} stroke="#BFF6FF" strokeWidth={3} opacity={0.5} />
        {Math.floor(f / 20) % 2 === 0 && <circle cx={at[0] - w + 36} cy={at[1] - h - 36} r={12} fill="#FF2E3F" />}
        {m && <g transform={`translate(${at[0]} ${at[1]})`} stroke="#FF2E3F" strokeWidth={16} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px #FF2E3F)' }}><line x1={-55} y1={-55} x2={55} y2={55} /><line x1={55} y1={-55} x2={-55} y2={55} /></g>}
      </svg>
      <div style={{ position: 'absolute', left: at[0] - w + 60, top: at[1] - h - 58, fontFamily: NUM, fontSize: 40, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>REC</div>
      <div style={{ position: 'absolute', left: at[0] + w - 220, top: at[1] + h + 14, width: 220, textAlign: 'right', fontFamily: NUM, fontSize: 40, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>{z.toFixed(1)}×</div>
      {m && <div style={{ position: 'absolute', left: at[0], top: at[1] + 90, transform: 'translateX(-50%)', fontFamily: UI, fontWeight: 800, fontSize: 64, color: '#fff', textShadow: '0 0 12px #FF2E3F, 0 4px 8px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}>{missText}</div>}
    </AbsoluteFill>
  );
};
