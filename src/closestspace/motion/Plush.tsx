import React from 'react';
import { random } from 'remotion';
import { C, lerp } from './theme';

// The plush chibi rig (the channel's toy-like figures): a big round head on a stubby bell-shaped body, soft shading,
// dot eyes with a sparkle, thin black stick arms drawn on top when a character gestures. Units: about 1000 tall,
// origin at the ground under the body's centre, facing the viewer.
// Characters: two mountaineers (Everest in orange, Chimborazo in teal) and a rumali-roti cook.

export type Who = 'climberA' | 'climberB' | 'cook';
export type Mouth = 'smile' | 'flat' | 'frown' | 'oh' | 'grin' | 'worried';

export type PlushPose = {
  arms: number; // 0 = hidden, 1 = shown
  lx: number; ly: number; rx: number; ry: number; // hand targets relative to each shoulder
  mouth: Mouth;
  talk: number;
  look: number; lookY: number;
  brow: number; // -1 angry .. 1 raised
  tilt: number;
  lean: number;
  squash: number;
  hop: number;
  sweat: number;
};
export const PP0: PlushPose = { arms: 0, lx: -150, ly: 120, rx: 150, ry: 120, mouth: 'smile', talk: 0, look: 0, lookY: 0, brow: 0, tilt: 0, lean: 0,
  squash: 1, hop: 0, sweat: 0 };

export const blendP = (a: PlushPose, b: PlushPose, t: number): PlushPose => {
  const o = { ...a } as Record<string, number | string>;
  (Object.keys(a) as (keyof PlushPose)[]).forEach((k) => {
    const va = a[k], vb = b[k];
    o[k] = typeof va === 'number' && typeof vb === 'number' ? lerp(va, vb, t) : t < 0.5 ? va : vb;
  });
  return o as unknown as PlushPose;
};

type Look = { body: string; bodyDark: string; skin: string; hat: string; trim: string };
const LOOK: Record<Who, Look> = {
  climberA: { body: '#FF7A1A', bodyDark: '#C24A06', skin: '#F4C9A4', hat: '#D7262E', trim: '#2A2E38' },
  climberB: { body: '#16B3A6', bodyDark: '#0A6E66', skin: '#E9BC92', hat: '#FFC83D', trim: '#2A2E38' },
  cook: { body: '#F6F4EE', bodyDark: '#C9C4B6', skin: '#E2B088', hat: '#FFFFFF', trim: '#E1261C' },
};

const HEAD: [number, number] = [0, -700];
const HR = 215;
const SH: [number, number] = [150, -430];
const BodyPath = 'M -150 -500 C -230 -420 -250 -200 -235 -40 Q -230 0 -190 0 L 190 0 Q 230 0 235 -40 C 250 -200 230 -420 150 -500 Q 0 -560 -150 -500 Z';

const Eyes: React.FC<{ p: PlushPose; blink: number }> = ({ p, blink }) => (
  <g>
    {[-1, 1].map((s) => {
      const x = s * 72 + p.look * 18;
      const h = 34 * (1 - blink);
      return (
        <g key={s}>
          <ellipse cx={x} cy={p.lookY * 10} rx={26} ry={Math.max(3, h)} fill={C.ink} />
          {blink < 0.5 && <circle cx={x - 8} cy={p.lookY * 10 - 12} r={8} fill="#fff" />}
          <path d={`M ${x - 30} ${-58 - p.brow * 12} L ${x + 30} ${-58 - p.brow * 12}`} stroke={C.ink} strokeWidth={12} strokeLinecap="round"
            transform={`rotate(${s * p.brow * 14} ${x} -58)`} />
        </g>
      );
    })}
  </g>
);

const MouthShape: React.FC<{ p: PlushPose; y: number }> = ({ p, y }) => {
  const o = p.talk * 34;
  if (p.mouth === 'oh' || o > 6) return <ellipse cx={0} cy={y} rx={20 + o * 0.2} ry={10 + o * 0.6} fill="#5A1A1A" stroke={C.ink} strokeWidth={6} />;
  if (p.mouth === 'frown') return <path d={`M -34 ${y + 12} Q 0 ${y - 14} 34 ${y + 12}`} stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />;
  if (p.mouth === 'worried') return <path d={`M -30 ${y + 6} Q -15 ${y - 6} 0 ${y + 6} Q 15 ${y - 6} 30 ${y + 6}`} stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />;
  if (p.mouth === 'flat') return <path d={`M -28 ${y} H 28`} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />;
  if (p.mouth === 'grin') return <path d={`M -40 ${y - 8} Q 0 ${y + 44} 40 ${y - 8} Z`} fill="#5A1A1A" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />;
  return <path d={`M -32 ${y - 4} Q 0 ${y + 26} 32 ${y - 4}`} stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />;
};

/** A summit flag on a pole, waving. `up` 0..1 unfurls it. Origin at the pole's foot. */
export const Flag: React.FC<{ f: number; up: number; color: string; h?: number }> = ({ f, up, color, h = 700 }) => (
  <g>
    <path d={`M 0 0 V ${-h}`} stroke="#5B5F6B" strokeWidth={20} strokeLinecap="round" />
    <circle cx={0} cy={-h - 10} r={16} fill={C.gold} stroke={C.ink} strokeWidth={5} />
    <g transform={`translate(8 ${-h + 10}) scale(${up} 1)`}>
      <path d={`M 0 0 Q 110 ${-18 + Math.sin(f / 5) * 16} 240 ${Math.sin(f / 5 + 1) * 20} L 240 ${150 + Math.sin(f / 5 + 1) * 20} Q 110 ${130 + Math.sin(f / 5) * 16} 0 150 Z`}
        fill={color} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M 20 22 Q 110 ${8 + Math.sin(f / 5) * 12} 200 ${24 + Math.sin(f / 5 + 1) * 16}`} stroke="#fff" strokeWidth={10} opacity={0.35} fill="none" strokeLinecap="round" />
    </g>
  </g>
);

export const Plush: React.FC<{ who: Who; pose: PlushPose; f: number; seed?: string }> = ({ who, pose: p, f, seed = who }) => {
  const L = LOOK[who];
  const [hx, hy] = HEAD;
  let bt = 20 + random(seed) * 60, i = 0;
  while (bt < f - 7 && i < 300) bt += 150 + random(`${seed}${i++}`) * 90;
  const blink = f - bt >= 0 && f - bt < 6 ? Math.sin(((f - bt) / 6) * Math.PI) : 0;
  const uid = `${who}-${seed}`;
  const climber = who !== 'cook';
  const arm = (side: -1 | 1) => {
    if (p.arms < 0.02) return null;
    const sx = SH[0] * side, sy = SH[1];
    const tx = side < 0 ? p.lx : p.rx, ty = side < 0 ? p.ly : p.ry;
    const ex = sx + tx * 0.5 + side * 40, ey = sy + ty * 0.5 + 30;
    const k = p.arms;
    const hxp = sx + tx * k, hyp = sy + ty * k;
    return (
      <g>
        <path d={`M ${sx} ${sy} Q ${sx + (ex - sx) * k} ${sy + (ey - sy) * k} ${hxp} ${hyp}`} stroke={C.ink} strokeWidth={11} fill="none" strokeLinecap="round" />
        {climber && <circle cx={hxp} cy={hyp} r={22} fill={L.trim} stroke={C.ink} strokeWidth={5} />}
      </g>
    );
  };
  return (
    <g transform={`translate(0 ${-p.hop}) rotate(${p.lean} 0 0) scale(${1 / Math.sqrt(p.squash)} ${p.squash})`}>
      <defs>
        <radialGradient id={`bg-${uid}`} cx="0.35" cy="0.25" r="0.9"><stop offset="0" stopColor={L.body} /><stop offset="1" stopColor={L.bodyDark} /></radialGradient>
        <radialGradient id={`hg-${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFE6D2" /><stop offset="0.6" stopColor={L.skin} /><stop offset="1" stopColor="#D9A07C" /></radialGradient>
      </defs>
      <ellipse cx={0} cy={p.hop} rx={230} ry={34} fill="#000" opacity={0.22} />
      {/* body: a puffy down jacket (quilt lines, zip, fur hood ring) or a chef's coat */}
      <path d={BodyPath} fill={`url(#bg-${uid})`} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
      {climber && (
        <g>
          {[-380, -270, -160, -60].map((y) => <path key={y} d={`M -225 ${y} Q 0 ${y + 40} 225 ${y}`} stroke={L.bodyDark} strokeWidth={9} fill="none" opacity={0.55} />)}
          <path d="M 0 -500 V -10" stroke={L.trim} strokeWidth={12} />
          <path d="M -170 -500 Q 0 -440 170 -500 Q 0 -540 -170 -500 Z" fill="#EDE6DA" stroke={C.ink} strokeWidth={7} />
          <path d="M -235 -40 Q 0 20 235 -40 L 232 -10 Q 0 46 -232 -10 Z" fill={L.trim} opacity={0.85} />
        </g>
      )}
      {!climber && (
        <g>
          {[[-60, -380], [60, -380], [-60, -270], [60, -270], [-60, -160], [60, -160]].map(([x, y], j) => <circle key={j} cx={x} cy={y} r={14} fill="#D9D3C4" stroke={C.ink} strokeWidth={4} />)}
          <path d="M -150 -500 L 0 -400 L 150 -500" stroke={C.ink} strokeWidth={8} fill="none" />
          <path d="M -120 -480 L 120 -480 L 60 -420 L 0 -450 L -60 -420 Z" fill={L.trim} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        </g>
      )}
      {/* face */}
      <circle cx={hx} cy={hy} r={HR} fill={`url(#hg-${uid})`} stroke={C.ink} strokeWidth={10} />
      <ellipse cx={hx - 110} cy={hy + 60} rx={34} ry={20} fill="#F08A8A" opacity={0.55} />
      <ellipse cx={hx + 110} cy={hy + 60} rx={34} ry={20} fill="#F08A8A" opacity={0.55} />
      <g transform={`translate(${hx} ${hy}) rotate(${p.tilt})`}>
        <Eyes p={p} blink={blink} />
        <MouthShape p={p} y={92} />
      </g>
      {/* headwear */}
      {climber ? (
        <g stroke={C.ink} strokeWidth={9} strokeLinejoin="round">
          {/* knit beanie with a pompom and a fold, goggles pushed up on it */}
          <path d={`M ${-HR * 0.98} ${hy - 40} C ${-HR * 1.02} ${hy - 300} ${HR * 1.02} ${hy - 300} ${HR * 0.98} ${hy - 40} Z`} fill={L.hat} />
          <path d={`M ${-HR * 1.02} ${hy - 40} Q 0 ${hy - 10} ${HR * 1.02} ${hy - 40} L ${HR * 1.0} ${hy - 110} Q 0 ${hy - 140} ${-HR * 1.0} ${hy - 110} Z`} fill={L.hat} />
          {[-120, -60, 0, 60, 120].map((x) => <path key={x} d={`M ${x} ${hy - 50} V ${hy - 100}`} stroke={C.ink} strokeWidth={4} opacity={0.4} />)}
          <circle cx={0} cy={hy - 270} r={48} fill="#fff" />
          <path d={`M ${-HR * 0.95} ${hy - 150} Q 0 ${hy - 120} ${HR * 0.95} ${hy - 150}`} stroke="#2A2E38" strokeWidth={22} fill="none" />
          {[-1, 1].map((s) => <ellipse key={s} cx={s * 72} cy={hy - 150} rx={64} ry={44} fill="#7FD6FF" stroke="#2A2E38" strokeWidth={12} />)}
          {[-1, 1].map((s) => <path key={`g${s}`} d={`M ${s * 72 - 30} ${hy - 165} q 20 -12 40 0`} stroke="#fff" strokeWidth={8} fill="none" opacity={0.8} />)}
        </g>
      ) : (
        <g stroke={C.ink} strokeWidth={9} strokeLinejoin="round">
          {/* a tall chef's toque */}
          <path d={`M ${-HR * 0.8} ${hy - 120} L ${-HR * 0.75} ${hy - 300} C ${-HR * 1.2} ${hy - 330} ${-HR * 1.05} ${hy - 520} ${-HR * 0.5} ${hy - 470} C ${-HR * 0.4} ${hy - 590} ${HR * 0.4} ${hy - 590} ${HR * 0.5} ${hy - 470} C ${HR * 1.05} ${hy - 520} ${HR * 1.2} ${hy - 330} ${HR * 0.75} ${hy - 300} L ${HR * 0.8} ${hy - 120} Z`} fill="#fff" />
          <path d={`M ${-HR * 0.8} ${hy - 170} Q 0 ${hy - 150} ${HR * 0.8} ${hy - 170}`} stroke="#D9D3C4" strokeWidth={8} fill="none" />
          <path d={`M -70 ${hy + 52} Q -35 ${hy + 34} 0 ${hy + 50} Q 35 ${hy + 34} 70 ${hy + 52}`} stroke="#3A2418" strokeWidth={16} fill="none" strokeLinecap="round" />
        </g>
      )}
      {arm(-1)}{arm(1)}
      {p.sweat > 0.01 && (
        <g transform={`translate(${HR * 0.9} ${hy - 80 + p.sweat * 60})`} opacity={Math.min(1, p.sweat * 3)}>
          <path d="M 0 -36 C 20 -6 24 10 0 24 C -24 10 -20 -6 0 -36 Z" fill="#8FDBFF" stroke={C.ink} strokeWidth={6} />
        </g>
      )}
    </g>
  );
};

export const SHOULDER = SH;
