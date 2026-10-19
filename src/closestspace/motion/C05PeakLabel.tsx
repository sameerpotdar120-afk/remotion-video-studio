import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, pop, ramp } from './theme';

// c05_peak_label ("Everest, 8,849 मीटर", "Chimborazo, 6,263 मीटर"; the reference's 9.75 s, 12.25–15.5 s and 68.5–72.5 s):
// a red triangle pin drops onto the summit with a ripple, a thin leader line draws up, and a pill label pops on with a
// soft cyan glow: the name, then the height ticks up beneath it. Transparent, 900×700, 60 fps; the summit sits at
// (450, 620). `name` and `height` are text (Hindi or English); `count` = the number to tick up to (0 = no tick).
export const C05PeakLabel: React.FC<{ name?: string; height?: string; count?: number; unit?: string; glow?: string }> = ({
  name = 'Mt Everest', height = '', count = 8849, unit = ' m', glow = 'rgba(120,220,255,0.75)',
}) => {
  useFonts();
  const f = useCurrentFrame();
  const drop = ramp(f, 0, 14, Easing.out(Easing.bounce));
  const rip = ramp(f, 12, 40);
  const lead = ramp(f, 14, 30);
  const pill = pop(f, 26, 42, 2);
  const num = Math.round(count * ramp(f, 40, 90, Easing.out(Easing.cubic)));
  const sub = pop(f, 40, 52, 2);
  const bob = Math.sin(f / 22) * 4;
  return (
    <AbsoluteFill>
      <svg width={900} height={700} style={{ position: 'absolute' }}>
        <ellipse cx={450} cy={622} rx={60 * rip} ry={18 * rip} fill="none" stroke="#fff" strokeWidth={4} opacity={1 - rip} />
        <path d={`M 450 ${600 - 420 * lead} V 600`} stroke="#fff" strokeWidth={4} opacity={0.9} />
        <g transform={`translate(450 ${620 - (1 - drop) * 300})`}>
          <path d="M 0 -6 L 22 -44 L -22 -44 Z" transform="scale(1 -1) translate(0 50)" fill={C.red} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70 + bob, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${pill})` }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 64, color: '#fff', padding: '4px 34px', borderRadius: 60, background: 'rgba(20,40,60,0.55)',
          boxShadow: `0 0 40px ${glow}, 0 0 90px ${glow}`, border: '3px solid rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{name}</div>
        {(count > 0 || height) && (
          <div style={{ marginTop: 12, transform: `scale(${sub})`, fontFamily: NUM, fontSize: 96, color: '#fff', letterSpacing: 2,
            textShadow: `0 0 26px ${glow}, 0 4px 0 rgba(0,0,0,0.4)` }}>{count > 0 ? `${num.toLocaleString('en-IN')}${unit}` : height}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};
