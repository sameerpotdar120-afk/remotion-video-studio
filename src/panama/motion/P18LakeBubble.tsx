import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { idle, pop, ramp } from './theme';

// p18_lake_bubble (line 6, "इसी Gatun Lake का पानी Panama के आधे लोग पीते हैं"; the reference's 52–53 s): a round inset
// "thought bubble" of the lake pops in above the character on a glowing leader line drawn from his head, its rim
// shining, the satellite crop inside slowly drifting and zooming, a small "Gatun Lake" tag under it. `src` is a lake
// crop from our EOX plate (the edit passes it). Transparent, 500×700, 60 fps; the leader starts at (250, 680).
export const P18LakeBubble: React.FC<{ src?: string; label?: string }> = ({ src, label = 'Gatun Lake' }) => {
  useFonts();
  const f = useCurrentFrame();
  const ld = ramp(f, 0, 12);
  const s = pop(f, 8, 20, 2.2);
  const [ix, iy] = idle(f, 8, 0.5);
  return (
    <AbsoluteFill>
      <svg width={500} height={700} style={{ position: 'absolute', inset: 0 }}>
        <path d={`M 250 680 L ${250 + ix * 0.5} ${680 - 330 * ld}`} stroke="#6FE6FF" strokeWidth={6} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #6FE6FF)' }} />
      </svg>
      <div style={{ position: 'absolute', left: 250 + ix, top: 200 + iy, width: 300, height: 300, transform: `translate(-50%,-50%) scale(${s})`, borderRadius: '50%', overflow: 'hidden', border: '8px solid #fff',
        boxShadow: `0 0 ${24 + 10 * Math.sin(f / 8)}px rgba(111,230,255,0.9), 0 12px 24px rgba(0,0,0,0.4)`, background: 'radial-gradient(circle at 45% 45%, #3FB6E8, #1D7FC2 55%, #2F7A3A 56%, #24602D)' }}>
        {src && <Img src={src} style={{ position: 'absolute', width: 420, height: 420, left: -60 + Math.sin(f / 60) * 20, top: -60 + Math.cos(f / 70) * 20, transform: `scale(${1 + 0.05 * Math.sin(f / 50)})` }} />}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 40%)' }} />
      </div>
      {s > 0.5 && <div style={{ position: 'absolute', left: 250 + ix, top: 370 + iy, transform: `translate(-50%,0) scale(${pop(f, 16, 26)})`, padding: '4px 20px 0', borderRadius: 14, background: 'rgba(14,22,32,0.92)', border: '3px solid #fff', fontFamily: UI, fontWeight: 800, fontSize: 38, color: '#fff', whiteSpace: 'nowrap' }}>{label}</div>}
    </AbsoluteFill>
  );
};
