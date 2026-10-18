import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Chibi, POSE0, Pose, blend } from './Chibi';
import { C, clamp, pop, wobble } from './theme';

// t14_king (line 18, "उन्होंने देश को तेज़ी से modern बनाया: army, railway, कानून, सब नया किया"): the King of Siam, drawn
// with dignity (gold robe, tiered crown, a calm smile), over the throne-room background (t03_throne_room_bg). On each cue
// he raises a hand and a badge pops above him: army (crossed rifles), railway (a steam locomotive), law (a book under a
// balance). Then on "हमला करने का कोई बहाना ही नहीं छोड़ा" a cyan shield closes around him and two push arrows (purple
// from the left, red from the right) bounce off it. Transparent, 1080x1920, 60 fps, 330 frames.

const KX = 540, GY = 1760, K = 0.95;

const Badge: React.FC<{ x: number; y: number; k: number; f: number; children: React.ReactNode }> = ({ x, y, k, f, children }) =>
  k <= 0.01 ? null : (
    <g transform={`translate(${x} ${y + Math.sin(f / 20 + x) * 8}) scale(${k})`}>
      <circle r={118} fill="#000" opacity={0.18} cy={10} />
      <circle r={112} fill="#FFFDF5" stroke="#E2AE45" strokeWidth={14} />
      <circle r={112} fill="none" stroke={C.ink} strokeWidth={6} />
      {children}
    </g>
  );

const Rifles: React.FC = () => (
  <g strokeLinecap="round">
    {[-38, 38].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <path d="M 0 70 L 0 0" stroke={C.ink} strokeWidth={26} />
        <path d="M 0 70 L 0 0" stroke="#8A4E22" strokeWidth={14} />
        <path d="M 0 0 L 0 -80" stroke={C.ink} strokeWidth={14} />
        <path d="M 0 0 L 0 -80" stroke="#555B66" strokeWidth={6} />
      </g>
    ))}
    <path d="M 0 -30 l 9 18 l 20 3 l -15 14 l 4 20 l -18 -10 l -18 10 l 4 -20 l -15 -14 l 20 -3 Z" fill="#E2AE45" stroke={C.ink} strokeWidth={4} transform="translate(0 52) scale(0.8)" />
  </g>
);

const Train: React.FC<{ f: number }> = ({ f }) => (
  <g stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
    <circle cx={-34 - ((f / 2) % 20)} cy={-74 - ((f / 2) % 20)} r={14 + ((f / 2) % 20) * 0.6} fill="#C9C9CF" opacity={0.8} />
    <rect x={-70} y={-30} width={90} height={52} rx={10} fill="#3A6EA5" />
    <rect x={14} y={-58} width={54} height={80} rx={6} fill="#B5232B" />
    <rect x={24} y={-48} width={32} height={24} fill="#BFE3FF" />
    <path d="M -54 -30 V -62 H -30 V -30" fill="#3A3F48" />
    <path d="M -70 22 L -88 40 H -60 Z" fill="#3A3F48" />
    {[-50, -14, 40].map((x) => <circle key={x} cx={x} cy={34} r={17} fill="#3A3F48" />)}
    <path d="M -90 54 H 82" strokeWidth={8} />
  </g>
);

const Law: React.FC = () => (
  <g stroke={C.ink} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
    <path d="M -80 30 Q -40 14 0 30 Q 40 14 80 30 V 74 Q 40 58 0 74 Q -40 58 -80 74 Z" fill="#fff" />
    <path d="M 0 30 V 74" />
    <path d="M -64 44 Q -34 34 -12 44 M 12 44 Q 34 34 64 44 M -64 58 Q -34 48 -12 58 M 12 58 Q 34 48 64 58" strokeWidth={3} />
    <path d="M 0 -78 V 10 M -52 -52 H 52" />
    <path d="M -52 -52 L -72 -12 H -32 Z M 52 -52 L 32 -12 H 72 Z" fill="#E2AE45" />
    <circle cy={-82} r={9} fill="#E2AE45" />
  </g>
);

export const T14King: React.FC<{ cues?: number[]; shield?: number }> = ({ cues = [40, 100, 160], shield = 230 }) => {
  const f = useCurrentFrame();
  const base: Pose = { ...POSE0, turn: 0, lookX: 0, face: 'calm', nx: 70, ny: 170, fx: -70, fy: 170, nb: 1, fb: -1 };
  const raise = (side: 'n' | 'f'): Pose => side === 'n'
    ? { ...base, nx: 150, ny: -200, nb: -1, lookX: 0.6, lookY: -0.6, face: 'smile', tilt: 4 }
    : { ...base, fx: -150, fy: -200, fb: 1, lookX: -0.6, lookY: -0.6, face: 'smile', tilt: -4 };
  const poses: [number, Pose][] = [[0, base], [cues[0], raise('f')], [cues[1], { ...base, lookY: -0.8, face: 'smile', nx: 60, ny: -230, nb: -1, fx: -60, fy: -230, fb: 1 }],
    [cues[2], raise('n')], [shield - 10, { ...base, face: 'calm', nx: 120, ny: 40, fx: -120, fy: 40 }]];
  let p = poses[0][1];
  for (let i = 1; i < poses.length; i++) {
    if (f < poses[i][0]) break;
    p = blend(p, poses[i][1], interpolate(f, [poses[i][0], poses[i][0] + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.2)) }));
  }
  p = { ...p, hop: Math.max(0, Math.sin(f / 30)) * 6 };
  const sh = pop(f, shield, shield + 18, 1.6);
  const arrow = (side: 1 | -1, start: number, col: string) => {
    const t = interpolate(f, [start, start + 18], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    const bounce = f > start + 18 ? interpolate(f, [start + 18, start + 50], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
    if (f < start) return null;
    const hitX = KX - side * 430;
    const x = (bounce ? hitX - side * 300 * bounce : hitX - side * 500 * (1 - t));
    const y = 1150 - (bounce ? -Math.sin(bounce * Math.PI) * 120 + bounce * 200 : 0);
    const rot = side === 1 ? 0 : 180;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot + (bounce ? -side * bounce * 160 : 0)})`} opacity={1 - Math.max(0, bounce - 0.6) * 2.5}>
        <path d="M -150 -26 H 40 V -60 L 120 0 L 40 60 V 26 H -150 Z" fill={col} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
      </g>
    );
  };
  const hitFlash = (start: number, side: 1 | -1) => {
    const k = interpolate(f, [start + 18, start + 22, start + 34], [0, 1, 0], clamp);
    return k > 0 ? <circle cx={KX - side * 430} cy={1150} r={60 + k * 40} fill="#E8FDFF" opacity={k} filter="url(#kg)" /> : null;
  };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs><filter id="kg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={16} /></filter></defs>
        <g transform={`translate(${KX} ${GY}) scale(${K})`}>
          <Chibi outfit="king" pose={p} f={f} seed="king" />
        </g>
        <Badge x={260} y={560} k={pop(f, cues[0] + 6, cues[0] + 20, 2.2) * (1 - wobble(f, cues[0] + 20, 3, 6) * 0.05)} f={f}><Rifles /></Badge>
        <Badge x={540} y={420} k={pop(f, cues[1] + 6, cues[1] + 20, 2.2)} f={f}><Train f={f} /></Badge>
        <Badge x={820} y={560} k={pop(f, cues[2] + 6, cues[2] + 20, 2.2)} f={f}><Law /></Badge>
        {sh > 0.01 && (
          <g transform={`translate(${KX} 1180) scale(${sh})`}>
            <path d="M 0 -760 Q 330 -700 440 -620 Q 470 -120 0 560 Q -470 -120 -440 -620 Q -330 -700 0 -760 Z" fill={C.cyan} opacity={0.14 + Math.sin(f / 10) * 0.04} />
            <path d="M 0 -760 Q 330 -700 440 -620 Q 470 -120 0 560 Q -470 -120 -440 -620 Q -330 -700 0 -760 Z" fill="none" stroke={C.cyan} strokeWidth={30} opacity={0.5} filter="url(#kg)" />
            <path d="M 0 -760 Q 330 -700 440 -620 Q 470 -120 0 560 Q -470 -120 -440 -620 Q -330 -700 0 -760 Z" fill="none" stroke="#E8FDFF" strokeWidth={8} />
          </g>
        )}
        {arrow(1, shield + 30, '#B51CC9')}
        {arrow(-1, shield + 44, '#F03A0B')}
        {hitFlash(shield + 30, 1)}
        {hitFlash(shield + 44, -1)}
      </svg>
    </AbsoluteFill>
  );
};
