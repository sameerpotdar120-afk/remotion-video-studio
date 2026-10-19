import React from 'react';
import { random } from 'remotion';
import { Banner, Fleur, Shield } from './Heraldry';
import { C, lerp } from './theme';

// The plush chibi rig, after the reference's toy-like figures: a big round head on a stubby bell-shaped body (no legs),
// soft shading, dot eyes with a sparkle, and thin black stick arms drawn on top (as in the reference, where the
// arms appear when a character gestures). Units: about 1000 tall, origin at the ground under the body's centre,
// facing the viewer. Characters: the English and French knights, Edward III, the French king (Philip VI), Joan as a
// peasant and in armour, Charles VII, the judge, an English longbowman.

export type Who = 'knightEN' | 'knightFR' | 'edward' | 'philip' | 'charles' | 'joan' | 'joanArmor' | 'judge' | 'archer';
export type Mouth = 'smile' | 'flat' | 'frown' | 'oh' | 'grin' | 'worried';

export type PlushPose = {
  // stick arms: hand targets relative to each shoulder; arms 0..1 (0 = hidden, as in the reference until a gesture)
  arms: number;
  lx: number; ly: number; rx: number; ry: number;
  mouth: Mouth;
  talk: number; // 0..1 mouth open
  look: number; lookY: number;
  brow: number; // -1 angry .. 1 worried/raised
  tilt: number; // head tilt, degrees
  lean: number; // whole-body lean, degrees
  squash: number; // 1 = none
  hop: number;
  sweat: number; // 0..1
  visor: number; // knights and armoured Joan: 0 open, 1 closed
};
export const PP0: PlushPose = { arms: 0, lx: -150, ly: 120, rx: 150, ry: 120, mouth: 'smile', talk: 0, look: 0, lookY: 0, brow: 0, tilt: 0, lean: 0,
  squash: 1, hop: 0, sweat: 0, visor: 0 };

export const blendP = (a: PlushPose, b: PlushPose, t: number): PlushPose => {
  const o = { ...a } as Record<string, number | string>;
  (Object.keys(a) as (keyof PlushPose)[]).forEach((k) => {
    const va = a[k], vb = b[k];
    o[k] = typeof va === 'number' && typeof vb === 'number' ? lerp(va, vb, t) : t < 0.5 ? va : vb;
  });
  return o as unknown as PlushPose;
};

type Look = { body: string; bodyDark: string; skin: string; hair: string; trim: string };
const LOOK: Record<Who, Look> = {
  knightEN: { body: '#EDEBE6', bodyDark: '#B9B5AC', skin: '#F4C9A4', hair: '#5A3A22', trim: '#CE1124' },
  knightFR: { body: '#2B3FB8', bodyDark: '#18237A', skin: '#F4C9A4', hair: '#3A2418', trim: C.gold },
  edward: { body: '#B3141F', bodyDark: '#6E0A12', skin: '#F4C9A4', hair: '#8A4E22', trim: C.gold },
  philip: { body: '#2342B8', bodyDark: '#142670', skin: '#F2C7A0', hair: '#9A9A9A', trim: C.gold },
  charles: { body: '#2A47C2', bodyDark: '#16297A', skin: '#F4CBA8', hair: '#4A2E18', trim: C.gold },
  joan: { body: '#8A6240', bodyDark: '#5A3E26', skin: '#F6CFAE', hair: '#5A3820', trim: '#D9C7A2' },
  joanArmor: { body: '#C9D1DA', bodyDark: '#7E8893', skin: '#F6CFAE', hair: '#5A3820', trim: '#B3141F' },
  judge: { body: '#23202A', bodyDark: '#0E0C12', skin: '#EBC09A', hair: '#2A1A12', trim: '#9A1420' },
  archer: { body: '#EFEAE0', bodyDark: '#BDB6A6', skin: '#F4C9A4', hair: '#7A4A26', trim: '#CE1124' },
};

const HEAD: [number, number] = [0, -700];
const HR = 215;
const SH: [number, number] = [150, -430];

const BodyPath = 'M -150 -500 C -230 -420 -250 -200 -235 -40 Q -230 0 -190 0 L 190 0 Q 230 0 235 -40 C 250 -200 230 -420 150 -500 Q 0 -560 -150 -500 Z';

const Eyes: React.FC<{ p: PlushPose; blink: number; y: number; gap?: number }> = ({ p, blink, y, gap = 72 }) => (
  <g>
    {[-1, 1].map((s) => {
      const x = s * gap + p.look * 18;
      const h = 34 * (1 - blink);
      return (
        <g key={s}>
          <ellipse cx={x} cy={y + p.lookY * 10} rx={26} ry={Math.max(3, h)} fill={C.ink} />
          {blink < 0.5 && <circle cx={x - 8} cy={y + p.lookY * 10 - 12} r={8} fill="#fff" />}
          <path d={`M ${x - 30} ${y - 58 - p.brow * 12} L ${x + 30} ${y - 58 - p.brow * 12}`} stroke={C.ink} strokeWidth={12} strokeLinecap="round"
            transform={`rotate(${s * p.brow * 14} ${x} ${y - 58})`} />
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

const Crown: React.FC<{ y: number; w: number; gems?: string }> = ({ y, w, gems = '#C8102E' }) => (
  <g stroke={C.ink} strokeWidth={7} strokeLinejoin="round">
    <path d={`M ${-w} ${y} L ${-w} ${y - 90} L ${-w * 0.55} ${y - 40} L ${-w * 0.2} ${y - 120} L 0 ${y - 50} L ${w * 0.2} ${y - 120} L ${w * 0.55} ${y - 40} L ${w} ${y - 90} L ${w} ${y} Z`} fill="#F4C542" />
    <rect x={-w} y={y - 18} width={w * 2} height={30} fill="#E0A82A" />
    {[-0.6, 0, 0.6].map((k) => <circle key={k} cx={w * k} cy={y - 3} r={11} fill={gems} />)}
    {[-1, -0.2, 0.2, 1].map((k) => <circle key={k} cx={w * k} cy={y - (Math.abs(k) === 1 ? 92 : 122)} r={10} fill="#fff" />)}
  </g>
);

export const Plush: React.FC<{ who: Who; pose: PlushPose; f: number; seed?: string; shield?: boolean; banner?: number; bow?: number; scroll?: boolean; crown?: number }> = ({
  who, pose: p, f, seed = who, shield = false, banner = 0, bow = 0, scroll = false, crown = 1,
}) => {
  const L = LOOK[who];
  const [hx, hy] = HEAD;
  // blink every 2.5–4 s for 6 frames
  let bt = 20 + random(seed) * 60, i = 0;
  while (bt < f - 7 && i < 300) bt += 150 + random(`${seed}${i++}`) * 90;
  const blink = f - bt >= 0 && f - bt < 6 ? Math.sin(((f - bt) / 6) * Math.PI) : 0;
  const uid = `${who}-${seed}`;
  const helmEN = who === 'knightEN', helmFR = who === 'knightFR', armour = who === 'joanArmor';
  const knight = helmEN || helmFR;
  const arm = (side: -1 | 1) => {
    if (p.arms < 0.02) return null;
    const sx = SH[0] * side, sy = SH[1];
    const tx = side < 0 ? p.lx : p.rx, ty = side < 0 ? p.ly : p.ry;
    const ex = sx + tx * 0.5 + side * 40, ey = sy + ty * 0.5 + 30;
    const k = p.arms;
    return <path d={`M ${sx} ${sy} Q ${sx + (ex - sx) * k} ${sy + (ey - sy) * k} ${sx + tx * k} ${sy + ty * k}`} stroke={C.ink} strokeWidth={11} fill="none" strokeLinecap="round" />;
  };
  const body = (
    <g>
      <defs>
        <radialGradient id={`bg-${uid}`} cx="0.35" cy="0.25" r="0.9"><stop offset="0" stopColor={L.body} /><stop offset="1" stopColor={L.bodyDark} /></radialGradient>
        <radialGradient id={`hg-${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFE6D2" /><stop offset="0.6" stopColor={L.skin} /><stop offset="1" stopColor="#D9A07C" /></radialGradient>
      </defs>
      <path d={BodyPath} fill={`url(#bg-${uid})`} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
      {(knight || who === 'archer') && <path d="M -235 -40 Q 0 30 235 -40 L 230 -10 Q 0 50 -230 -10 Z" fill={L.bodyDark} opacity={0.5} />}
      {(helmEN || who === 'archer') && <g><rect x={-38} y={-500} width={76} height={480} fill="#CE1124" /><rect x={-190} y={-320} width={380} height={70} fill="#CE1124" /></g>}
      {helmFR && [[-90, -360], [90, -360], [0, -230], [-130, -120], [130, -120]].map(([x, y], j) => <Fleur key={j} x={x} y={y} s={0.75} />)}
      {who === 'edward' && (
        <g>
          <path d="M -150 -500 C -220 -420 -235 -250 -230 -120 L -90 -60 L -60 -470 Z" fill="#fff" stroke={C.ink} strokeWidth={8} />
          <path d="M 150 -500 C 220 -420 235 -250 230 -120 L 90 -60 L 60 -470 Z" fill="#fff" stroke={C.ink} strokeWidth={8} />
          {[[-170, -400], [-190, -280], [-160, -170], [170, -400], [190, -280], [160, -170], [-120, -330], [120, -330]].map(([x, y], j) => <path key={j} d={`M ${x} ${y} l 6 14 l -12 0 Z`} fill={C.ink} />)}
          {[-300, -190].map((y) => <path key={y} d={`M -40 ${y} q 20 -30 40 0 q 20 -30 40 0 l -10 30 h -60 Z`} fill={C.gold} stroke={C.ink} strokeWidth={4} />)}
        </g>
      )}
      {(who === 'philip' || who === 'charles') && (
        <g>
          <path d="M -160 -490 Q 0 -400 160 -490 L 150 -440 Q 0 -360 -150 -440 Z" fill="#fff" stroke={C.ink} strokeWidth={7} />
          {[[-110, -300], [0, -250], [110, -300], [-80, -140], [80, -140]].map(([x, y], j) => <Fleur key={j} x={x} y={y} s={0.6} />)}
        </g>
      )}
      {who === 'joan' && (
        <g>
          <path d="M -120 -330 L 120 -330 L 160 -20 L -160 -20 Z" fill="#D9C7A2" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <path d="M -150 -340 H 150" stroke="#5A3E26" strokeWidth={20} strokeLinecap="round" />
          <path d="M -110 -260 L 110 -250 M -120 -180 L 120 -170 M -130 -100 L 130 -90" stroke="#B9A57E" strokeWidth={5} opacity={0.7} />
        </g>
      )}
      {armour && (
        <g>
          <path d="M -140 -490 Q 0 -540 140 -490 L 120 -250 Q 0 -200 -120 -250 Z" fill="#DDE3EA" stroke={C.ink} strokeWidth={7} />
          <path d="M -60 -470 Q 0 -500 60 -470 L 50 -300 Q 0 -280 -50 -300 Z" fill="#fff" opacity={0.5} />
          <path d="M -230 -150 Q 0 -90 230 -150 L 236 -40 Q 0 20 -236 -40 Z" fill="#1F3FB0" stroke={C.ink} strokeWidth={7} />
          {[-140, -45, 50, 145].map((x) => <Fleur key={x} x={x} y={-80} s={0.42} />)}
          <path d="M -200 -480 C -280 -350 -290 -150 -260 -10 L -230 -10 C -250 -160 -240 -340 -170 -470 Z" fill="#B3141F" stroke={C.ink} strokeWidth={6} />
          <path d="M 200 -480 C 280 -350 290 -150 260 -10 L 230 -10 C 250 -160 240 -340 170 -470 Z" fill="#B3141F" stroke={C.ink} strokeWidth={6} />
        </g>
      )}
      {who === 'judge' && (
        <g>
          <path d="M -150 -500 L -40 -500 L -10 0 L -190 0 Q -230 0 -235 -40 C -250 -200 -230 -420 -150 -500 Z" fill="none" stroke={L.trim} strokeWidth={14} />
          <path d="M 150 -500 L 40 -500 L 10 0 L 190 0 Q 230 0 235 -40 C 250 -200 230 -420 150 -500 Z" fill="none" stroke={L.trim} strokeWidth={14} />
          <path d="M 0 -330 V -230 M -30 -295 H 30" stroke="#E8E2D6" strokeWidth={14} strokeLinecap="round" />
          <rect x={-140} y={-210} width={280} height={34} fill="#3A2A1A" stroke={C.ink} strokeWidth={5} />
          <rect x={-20} y={-214} width={40} height={42} fill={C.gold} stroke={C.ink} strokeWidth={4} />
        </g>
      )}
    </g>
  );
  const face = (
    <g>
      <circle cx={hx} cy={hy} r={HR} fill={`url(#hg-${uid})`} stroke={C.ink} strokeWidth={10} />
      <ellipse cx={hx - 110} cy={hy + 60} rx={34} ry={20} fill="#F08A8A" opacity={0.5} />
      <ellipse cx={hx + 110} cy={hy + 60} rx={34} ry={20} fill="#F08A8A" opacity={0.5} />
      <g transform={`translate(${hx} ${hy})`}>
        <Eyes p={p} blink={blink} y={0} />
        <MouthShape p={p} y={92} />
      </g>
    </g>
  );
  // hair, hats and helmets
  const top = (() => {
    if (helmEN) {
      // a flat-topped great helm, eye slits, breathing holes, closed
      return (
        <g stroke={C.ink} strokeWidth={9} strokeLinejoin="round">
          <path d={`M ${-HR * 0.98} ${hy + 120} L ${-HR * 0.98} ${hy - 150} Q 0 ${hy - 250} ${HR * 0.98} ${hy - 150} L ${HR * 0.98} ${hy + 120} Q 0 ${hy + 190} ${-HR * 0.98} ${hy + 120} Z`} fill="url(#steel)" />
          <path d={`M ${-HR * 0.85} ${hy - 20} H ${-20} M ${20} ${hy - 20} H ${HR * 0.85}`} stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
          <path d={`M 0 ${hy - 200} V ${hy + 150}`} stroke="#E8C24A" strokeWidth={22} />
          {[[-90, 50], [-60, 90], [-110, 90], [90, 50], [60, 90], [110, 90]].map(([x, y], j) => <circle key={j} cx={x} cy={hy + y} r={7} fill={C.ink} stroke="none" />)}
        </g>
      );
    }
    if (helmFR || armour) {
      // a rounded bascinet / sallet with a visor that opens up (visor 0) or closes (1)
      const v = p.visor;
      return (
        <g stroke={C.ink} strokeWidth={9} strokeLinejoin="round">
          <path d={`M ${-HR * 1.02} ${hy + 40} C ${-HR * 1.05} ${hy - 260} ${HR * 1.05} ${hy - 260} ${HR * 1.02} ${hy + 40} L ${HR * 0.8} ${hy + 40} C ${HR * 0.7} ${hy - 140} ${-HR * 0.7} ${hy - 140} ${-HR * 0.8} ${hy + 40} Z`} fill="url(#steel)" />
          {armour && <path d={`M ${-HR * 0.8} ${hy - 30} Q 0 ${hy - 130} ${HR * 0.8} ${hy - 30} L ${HR * 0.85} ${hy - 90} Q 0 ${hy - 190} ${-HR * 0.85} ${hy - 90} Z`} fill={L.hair} stroke="none" />}
          <g transform={`translate(0 ${hy - 40}) scale(1 ${0.2 + 0.8 * v}) translate(0 ${-(hy - 40)})`} opacity={v > 0.05 ? 1 : 0}>
            <path d={`M ${-HR * 0.8} ${hy - 40} Q 0 ${hy - 90} ${HR * 0.8} ${hy - 40} L ${HR * 0.6} ${hy + 120} Q 0 ${hy + 230} ${-HR * 0.6} ${hy + 120} Z`} fill="url(#steel)" />
            {[-40, 0, 40].map((y) => <path key={y} d={`M -80 ${hy + y} H 80`} stroke={C.ink} strokeWidth={8} />)}
          </g>
          {helmFR && <path d={`M 0 ${hy - 210} q 40 -70 10 -120`} stroke={C.white} strokeWidth={30} fill="none" strokeLinecap="round" />}
        </g>
      );
    }
    if (who === 'archer') {
      return (
        <g stroke={C.ink} strokeWidth={8} strokeLinejoin="round">
          <path d={`M ${-HR * 1.3} ${hy - 100} Q 0 ${hy - 160} ${HR * 1.3} ${hy - 100} Q ${HR * 0.9} ${hy - 300} 0 ${hy - 300} Q ${-HR * 0.9} ${hy - 300} ${-HR * 1.3} ${hy - 100} Z`} fill="url(#steel)" />
        </g>
      );
    }
    if (who === 'joan') {
      return (
        <g stroke={C.ink} strokeWidth={8} strokeLinejoin="round">
          <path d={`M ${-HR * 1.02} ${hy + 30} C ${-HR * 1.1} ${hy - 230} ${HR * 1.1} ${hy - 230} ${HR * 1.02} ${hy + 30} C ${HR * 0.9} ${hy - 80} ${-HR * 0.9} ${hy - 80} ${-HR * 1.02} ${hy + 30} Z`} fill="#E8DCC2" />
          <path d={`M ${-HR * 0.75} ${hy - 70} Q 0 ${hy - 130} ${HR * 0.75} ${hy - 70} Q ${HR * 0.5} ${hy - 30} 0 ${hy - 50} Q ${-HR * 0.5} ${hy - 30} ${-HR * 0.75} ${hy - 70} Z`} fill={L.hair} />
        </g>
      );
    }
    if (who === 'judge') {
      return (
        <g stroke={C.ink} strokeWidth={9} strokeLinejoin="round">
          <path d={`M ${-HR * 1.25} ${hy + 220} C ${-HR * 1.4} ${hy - 200} ${-HR * 0.6} ${hy - 300} 0 ${hy - 290} C ${HR * 0.6} ${hy - 300} ${HR * 1.4} ${hy - 200} ${HR * 1.25} ${hy + 220} L ${HR * 0.85} ${hy + 160} C ${HR * 0.95} ${hy - 120} ${-HR * 0.95} ${hy - 120} ${-HR * 0.85} ${hy + 160} Z`} fill="#2B2733" />
          <path d={`M ${-HR * 0.7} ${hy + 110} Q 0 ${hy + 260} ${HR * 0.7} ${hy + 110} Q 0 ${hy + 170} ${-HR * 0.7} ${hy + 110} Z`} fill={L.hair} />
        </g>
      );
    }
    // kings and Charles: hair, beard (Edward, Philip), crown
    const beard = who === 'edward' || who === 'philip';
    return (
      <g>
        <path d={`M ${-HR * 0.98} ${hy + 40} C ${-HR * 1.05} ${hy - 200} ${HR * 1.05} ${hy - 200} ${HR * 0.98} ${hy + 40} L ${HR * 0.82} ${hy - 30} Q 0 ${hy - 130} ${-HR * 0.82} ${hy - 30} Z`} fill={L.hair} stroke={C.ink} strokeWidth={8} />
        {beard && <path d={`M ${-HR * 0.8} ${hy + 40} Q ${-HR * 0.7} ${hy + 250} 0 ${hy + 260} Q ${HR * 0.7} ${hy + 250} ${HR * 0.8} ${hy + 40} Q ${HR * 0.5} ${hy + 120} 30 ${hy + 125} L -30 ${hy + 125} Q ${-HR * 0.5} ${hy + 120} ${-HR * 0.8} ${hy + 40} Z`} fill={L.hair} stroke={C.ink} strokeWidth={8} />}
        {beard && <path d={`M -60 ${hy + 70} Q 0 ${hy + 50} 60 ${hy + 70}`} stroke={L.hair} strokeWidth={22} fill="none" strokeLinecap="round" />}
        {crown > 0.01 && <g transform={`translate(0 ${(1 - crown) * -500})`} opacity={Math.min(1, crown * 3)}><Crown y={hy - 150} w={HR * 0.85} /></g>}
      </g>
    );
  })();
  // props in the right hand
  const hand: [number, number] = [SH[0] + p.rx * p.arms, SH[1] + p.ry * p.arms];
  return (
    <g transform={`translate(0 ${-p.hop}) rotate(${p.lean} 0 0) translate(0 0) scale(${1 / Math.sqrt(p.squash)} ${p.squash})`}>
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4F7FA" /><stop offset="0.45" stopColor="#C9D1DA" /><stop offset="1" stopColor="#7E8893" /></linearGradient>
      </defs>
      <ellipse cx={0} cy={p.hop} rx={230} ry={34} fill="#000" opacity={0.22} />
      {banner > 0.01 && (
        <g transform={`translate(-200 -300)`}>
          <path d="M 0 0 V -760" stroke="#6A4A2A" strokeWidth={22} strokeLinecap="round" />
          <circle cx={0} cy={-770} r={18} fill={C.gold} stroke={C.ink} strokeWidth={5} />
          <g transform={`translate(10 -740) scale(${banner} 1)`}>
            <path d={`M 0 0 Q 120 ${-20 + Math.sin(f / 6) * 16} 260 ${Math.sin(f / 6 + 1) * 22} L 300 ${60 + Math.sin(f / 6 + 1) * 22} L 260 ${120 + Math.sin(f / 6 + 2) * 22} Q 120 ${130 + Math.sin(f / 6) * 16} 0 150 Z`}
              fill="#FBF6E8" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            {[[70, 40], [150, 70], [220, 40], [90, 105], [200, 105]].map(([x, y], j) => <Fleur key={j} x={x} y={y + Math.sin(f / 6 + x / 80) * 10} s={0.32} />)}
          </g>
        </g>
      )}
      {bow > 0.01 && (
        <g transform={`translate(${-SH[0] - 120} ${SH[1] + 40})`}>
          <path d={`M 0 -330 Q ${-150 - bow * 40} 0 0 330`} stroke="#8A5A2B" strokeWidth={20} fill="none" strokeLinecap="round" />
          <path d={`M 0 -330 L ${bow * 170} 0 L 0 330`} stroke="#EDE6D6" strokeWidth={5} fill="none" />
          {bow > 0.2 && <path d={`M ${bow * 170} 0 L -210 0`} stroke="#6A4A2A" strokeWidth={9} />}
          {bow > 0.2 && <path d="M -210 0 l 36 -14 l 0 28 Z" fill="#555B66" />}
        </g>
      )}
      {body}
      {face}
      {top}
      {shield && <g transform="translate(-120 -230)"><Shield id={who === 'knightEN' ? 'england' : 'france'} r={120} uid={uid} /></g>}
      {arm(-1)}{arm(1)}
      {knight && p.arms > 0.02 && (
        // the sword in the right hand, angle following the arm
        <g transform={`translate(${hand[0]} ${hand[1]}) rotate(${(Math.atan2(p.ry, p.rx) * 180) / Math.PI - 90})`}>
          <rect x={-12} y={-30} width={24} height={60} rx={6} fill="#6A4A2A" stroke={C.ink} strokeWidth={5} />
          <rect x={-50} y={-44} width={100} height={18} rx={6} fill={C.gold} stroke={C.ink} strokeWidth={5} />
          <path d="M -16 -44 L -16 -330 L 0 -370 L 16 -330 L 16 -44 Z" fill="url(#steel)" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        </g>
      )}
      {scroll && (
        <g transform={`translate(${hand[0] - 40} ${hand[1] - 120})`}>
          <rect x={-120} y={-10} width={240} height={300} rx={10} fill="#F6EBCF" stroke={C.ink} strokeWidth={7} />
          <rect x={-135} y={-30} width={270} height={34} rx={17} fill="#E6D3A4" stroke={C.ink} strokeWidth={6} />
          <rect x={-135} y={280} width={270} height={34} rx={17} fill="#E6D3A4" stroke={C.ink} strokeWidth={6} />
          {[40, 80, 120, 160, 200].map((y) => <path key={y} d={`M -90 ${y} H ${70 - (y % 3) * 20}`} stroke="#B9A57E" strokeWidth={8} strokeLinecap="round" />)}
          <circle cx={60} cy={250} r={26} fill="#B3141F" stroke={C.ink} strokeWidth={5} />
        </g>
      )}
      {p.sweat > 0.01 && (
        <g transform={`translate(${HR * 0.9} ${hy - 80 + p.sweat * 60})`} opacity={Math.min(1, p.sweat * 3)}>
          <path d="M 0 -36 C 20 -6 24 10 0 24 C -24 10 -20 -6 0 -36 Z" fill="#8FDBFF" stroke={C.ink} strokeWidth={6} />
        </g>
      )}
    </g>
  );
};

// A caparisoned warhorse (blue with gold fleur-de-lis, an armoured head), facing left, origin at the ground centre.
// gallop: 0..1 leg cycle phase when moving; set `run` to animate legs.
export const Horse: React.FC<{ f: number; run?: number }> = ({ f, run = 0 }) => {
  const ph = (f / 7) * Math.PI;
  const leg = (x: number, k: number) => {
    const a = run * Math.sin(ph + k) * 22;
    return <path key={x} d={`M ${x} -120 l ${Math.sin((a * Math.PI) / 180) * 110} 110`} stroke="#3A2A1A" strokeWidth={46} strokeLinecap="round" />;
  };
  return (
    <g>
      <ellipse cx={0} cy={0} rx={420} ry={40} fill="#000" opacity={0.22} />
      {leg(-250, 0)}{leg(-150, 2)}{leg(170, 1)}{leg(270, 3)}
      <path d="M -330 -560 C -470 -620 -560 -560 -560 -470 L -600 -380 Q -560 -340 -500 -360 L -420 -420 L -320 -360 Z" fill="url(#steel)" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
      <circle cx={-500} cy={-480} r={14} fill={C.ink} />
      <path d="M -380 -460 C -400 -200 -380 -110 -330 -90 L 360 -90 C 420 -110 430 -250 400 -420 C 360 -520 -300 -540 -380 -460 Z" fill="#2342B8" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
      <path d="M -380 -170 Q 0 -120 400 -170" stroke={C.gold} strokeWidth={16} fill="none" />
      {[[-240, -380], [-100, -300], [40, -380], [180, -300], [300, -380], [-180, -220], [100, -220], [260, -220]].map(([x, y], j) => <Fleur key={j} x={x} y={y} s={0.55} />)}
      <path d="M 400 -400 q 80 40 60 160" stroke="#3A2A1A" strokeWidth={26} fill="none" strokeLinecap="round" />
    </g>
  );
};

export { Banner, Shield };
