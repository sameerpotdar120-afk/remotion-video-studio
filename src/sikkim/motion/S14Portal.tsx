import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { LABEL, useFonts } from './font';
import { C, clamp } from './theme';

// s14_portal (line 11, the reference's 0:39–0:44): an illustrated tunnel portal in a Himalayan rock face, all drawn in
// code. Layered rock strata with cracks, a concrete horseshoe portal with its lining rings receding into a lit interior
// (work lights streaming along the walls), rock bolts and a steel mesh on the slope above, a drain channel at the
// foot. The camera pushes in slowly. Labels pop on thin leader lines at `labels` (frames): STABILIZE, DRAINAGE,
// VENTILATION, LINING; then a process strip types along the bottom from `strip`. Full frame.
const CX = 540, CY = 1080, PW = 300, PH = 360; // portal centre bottom, half-width, height
const arch = (w: number, h: number, cx = CX, by = CY) => `M${cx - w},${by} V${by - h + w} A${w},${w} 0 0 1 ${cx + w},${by - h + w} V${by}Z`;
const LABELS: [string, number, number, number, number][] = [ // text, anchor x, y, label x, y
  ['STABILIZE', 420, 560, 170, 360],
  ['VENTILATION', 600, 780, 860, 420],
  ['LINING', 790, 900, 880, 1260],
  ['DRAINAGE', 400, 1110, 180, 1340],
];
export const S14Portal: React.FC<{ labels?: number[]; strip?: number; out?: number }> = ({ labels = [30, 46, 62, 78], strip = 96, out }) => {
  useFonts();
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 400], [1, 1.28], clamp);
  const In = interpolate(f, [0, 10], [0, 1], clamp);
  const O = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  const steps = ['STABILIZE', 'LINE', 'DRAIN', 'VENTILATE'];
  const st = strip !== undefined ? f - strip : -1;
  return (
    <AbsoluteFill style={{ background: '#0b1014', opacity: In * O, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${CX}px ${CY - 200}px` }}>
        <svg width={1080} height={1920}>
          <defs>
            <linearGradient id="ptSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1A2731" /><stop offset="1" stopColor="#334550" /></linearGradient>
            <radialGradient id="ptIn" cx="50%" cy="72%" r="60%"><stop offset="0" stopColor="#FFE9B0" /><stop offset="0.25" stopColor="#E5A64A" /><stop offset="0.7" stopColor="#3A2A1A" /><stop offset="1" stopColor="#120D08" /></radialGradient>
            <pattern id="ptMesh" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0,0 V22 M0,0 H22" stroke="#9AA6AE" strokeWidth={1.4} opacity={0.55} /></pattern>
            <linearGradient id="ptConc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8D969C" /><stop offset="0.5" stopColor="#C9CFD3" /><stop offset="1" stopColor="#7C858B" /></linearGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#ptSky)" />
          {/* far ridges */}
          <path d="M0,520 L120,380 L220,440 L360,260 L470,360 L600,210 L720,330 L860,250 L1080,400 V900 H0Z" fill="#26343D" />
          <path d="M360,260 L400,300 L380,298 L360,282 L340,300Z M600,210 L640,252 L612,246 L592,262 L578,244Z" fill="#DDE6EC" />
          {/* rock face strata */}
          {Array.from({ length: 9 }, (_, i) => {
            const y = 470 + i * 150;
            const pts = Array.from({ length: 13 }, (_, k) => `${k * 90},${y + (random(`sy${i}${k}`) - 0.5) * 60 + Math.sin(k * 0.8 + i) * 18}`).join(' L');
            const col = ['#3B4A52', '#44545C', '#3A464D', '#4B5B62', '#404F57'][i % 5];
            return <path key={i} d={`M-10,1920 L-10,${y} L${pts} L1090,${y} L1090,1920Z`} fill={col} stroke="#252F35" strokeWidth={3} />;
          })}
          {Array.from({ length: 26 }, (_, i) => {
            const x = random(`cx${i}`) * 1080, y = 520 + random(`cy${i}`) * 1200;
            return <path key={i} d={`M${x},${y} l${(random(`c1${i}`) - 0.5) * 60},${30 + random(`c2${i}`) * 50} l${(random(`c3${i}`) - 0.5) * 50},${20 + random(`c4${i}`) * 40}`} stroke="#1E272C" strokeWidth={3} fill="none" opacity={0.8} />;
          })}
          {/* mesh and bolts on the slope above the portal */}
          <path d="M150,560 Q540,470 930,560 L930,760 Q540,700 150,760Z" fill="url(#ptMesh)" />
          {Array.from({ length: 18 }, (_, i) => {
            const x = 190 + (i % 6) * 140, y = 580 + Math.floor(i / 6) * 60 - Math.sin(((x - 150) / 780) * Math.PI) * 60;
            return <g key={i}><circle cx={x} cy={y} r={9} fill="#C8D0D5" stroke="#1d2428" strokeWidth={3} /><circle cx={x} cy={y} r={3} fill="#1d2428" /></g>;
          })}
          {/* portal: headwall, ring, interior */}
          <rect x={CX - PW - 110} y={CY - PH - 90} width={(PW + 110) * 2} height={PH + 90} fill="#5D676D" stroke="#2C3439" strokeWidth={4} />
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={CX - PW - 110} x2={CX + PW + 110} y1={CY - PH - 90 + i * 64} y2={CY - PH - 90 + i * 64} stroke="#4C565C" strokeWidth={2} />)}
          <path d={arch(PW + 40, PH + 40)} fill="url(#ptConc)" stroke="#2C3439" strokeWidth={4} />
          <path d={arch(PW, PH)} fill="url(#ptIn)" />
          {[0.82, 0.66, 0.52, 0.4, 0.3, 0.22].map((s, i) => (
            <path key={i} d={arch(PW * s, PH * s, CX, CY - (1 - s) * 70)} fill="none" stroke="#A9B2B8" strokeWidth={6 * s} opacity={0.55 - i * 0.06} />
          ))}
          {/* work lights streaming along the walls */}
          {Array.from({ length: 10 }, (_, i) => {
            const ph = ((f / 40 + i / 10) % 1), s = 1 - ph * 0.8;
            return [-1, 1].map((sd) => <circle key={`${i}${sd}`} cx={CX + sd * PW * s * 0.86} cy={CY - PH * s * 0.62 - (1 - s) * 70} r={8 * s + 1} fill="#FFF4D0" opacity={0.95 * s} style={{ filter: 'blur(1px)' }} />);
          })}
          <path d={`M${CX - PW},${CY} L${CX - PW * 0.22},${CY - 70} L${CX + PW * 0.22},${CY - 70} L${CX + PW},${CY}Z`} fill="#2A2018" opacity={0.85} />
          {/* rails into the tunnel */}
          <path d={`M${CX - 120},${CY + 400} L${CX - 26},${CY - 70} M${CX + 120},${CY + 400} L${CX + 26},${CY - 70}`} stroke="#D7DEE2" strokeWidth={6} />
          {/* ground, drain */}
          <path d={`M0,${CY} H1080 V1920 H0Z`} fill="#2B353B" />
          <path d={`M${CX - 120},${CY + 400} L${CX - 26},${CY} M${CX + 120},${CY + 400} L${CX + 26},${CY}`} stroke="#D7DEE2" strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => { const t = i / 8, y = CY + 12 + t * t * 390, w = 30 + t * 130; return <rect key={i} x={CX - w} y={y} width={w * 2} height={6 + t * 10} fill="#6E5A44" />; })}
          <path d={`M${CX - PW - 60},${CY + 10} L${CX - PW - 220},${CY + 520}`} stroke="#0E1418" strokeWidth={26} />
          <path d={`M${CX - PW - 60},${CY + 10} L${CX - PW - 220},${CY + 520}`} stroke="#4FA8D8" strokeWidth={10} strokeDasharray="18 22" strokeDashoffset={-f * 3} opacity={0.8} />
          {/* ventilation fan above the crown */}
          <g transform={`translate(${CX},${CY - PH - 40})`}>
            <rect x={-70} y={-34} width={140} height={68} rx={10} fill="#2F383E" stroke="#AEB8BE" strokeWidth={3} />
            <g transform={`rotate(${f * 14})`}>{[0, 1, 2].map((k) => <path key={k} d="M0,0 C10,-8 22,-6 26,0 C22,6 10,8 0,0Z" transform={`rotate(${k * 120}) scale(1)`} fill="#D5DCE0" />)}</g>
          </g>
        </svg>
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {LABELS.map(([t, ax, ay, lx, ly], i) => {
          const p = interpolate(f, [labels[i], labels[i] + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          if (p <= 0) return null;
          // anchors follow the push
          const sx = CX + (ax - CX) * push, sy = CY - 200 + (ay - (CY - 200)) * push;
          const ex = sx + (lx - sx) * p, ey = sy + (ly - sy) * p;
          const w = t.length * 24 + 40;
          return (
            <g key={t}>
              <circle cx={sx} cy={sy} r={10} fill="#fff" stroke={C.cyan} strokeWidth={4} />
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#fff" strokeWidth={3} />
              <g opacity={p} transform={`translate(${lx - w / 2},${ly - 30})`}>
                <rect width={w} height={60} rx={6} fill="rgba(8,12,16,0.9)" stroke={C.cyan} strokeWidth={2} />
                <text x={w / 2} y={41} textAnchor="middle" fontFamily={LABEL} fontWeight={800} fontSize={32} letterSpacing={3} fill="#fff">{t}</text>
              </g>
            </g>
          );
        })}
      </svg>
      {st >= 0 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 230, display: 'flex', justifyContent: 'center', gap: 10, fontFamily: LABEL, fontWeight: 800, fontSize: 34, letterSpacing: 2 }}>
        {steps.map((s, i) => {
          const p = interpolate(st, [i * 9, i * 9 + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
          return <React.Fragment key={s}>
            {i > 0 && <span style={{ color: C.cyan, opacity: p, alignSelf: 'center' }}>→</span>}
            <span style={{ background: i === steps.length - 1 && p >= 1 ? C.cyan : '#fff', color: C.ink, padding: '8px 14px', transform: `scale(${p})`, display: 'inline-block' }}>{s}</span>
          </React.Fragment>;
        })}
      </div>}
    </AbsoluteFill>
  );
};
