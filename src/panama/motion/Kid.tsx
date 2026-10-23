import React from 'react';
import { random } from 'remotion';
import { C } from './theme';

// Our chibi Panamanian (the reference's local man): a plush-toy figure with a big round head, short dark curly hair,
// warm brown skin, a crisp white shirt with a collar and a small Panama flag badge, stick arms. Units ~1000 tall,
// origin at the ground under the body's centre. Faces: smile, grin, oh, frown, cry (tear streams), and an optional
// "!" or "?" mark popping over the head. One hand can hold a paper cup (`cup`).
export type Face = 'smile' | 'grin' | 'oh' | 'frown' | 'cry' | 'drink';
export type KidPose = { face: Face; mark: '' | '!' | '?'; markK: number; tilt: number; lean: number; squash: number; hop: number; arm: number; cup: number; tears: number };
export const K0: KidPose = { face: 'smile', mark: '', markK: 0, tilt: 0, lean: 0, squash: 1, hop: 0, arm: 0, cup: 0, tears: 0 };

const HEAD: [number, number] = [0, -700];
const HR = 215;
const BODY = 'M -150 -500 C -230 -420 -250 -200 -235 -40 Q -230 0 -190 0 L 190 0 Q 230 0 235 -40 C 250 -200 230 -420 150 -500 Q 0 -560 -150 -500 Z';

const Flag: React.FC = () => (
  <g transform="translate(70 -360)">
    <rect x={-34} y={-24} width={68} height={48} fill="#fff" stroke={C.ink} strokeWidth={4} />
    <rect x={0} y={-24} width={34} height={24} fill="#D21034" />
    <rect x={-34} y={0} width={34} height={24} fill="#005293" />
    <path d="M -17 -16 l 3 7 h 7 l -6 4 l 2 7 l -6 -4 l -6 4 l 2 -7 l -6 -4 h 7 Z" fill="#005293" />
    <path d="M 17 8 l 3 7 h 7 l -6 4 l 2 7 l -6 -4 l -6 4 l 2 -7 l -6 -4 h 7 Z" transform="translate(0 -8) scale(0.9)" fill="#D21034" />
  </g>
);

export const Kid: React.FC<{ pose: KidPose; f: number; seed?: string }> = ({ pose: p, f, seed = 'kid' }) => {
  const [hx, hy] = HEAD;
  let bt = 30 + random(seed) * 50, i = 0;
  while (bt < f - 7 && i < 300) bt += 140 + random(`${seed}${i++}`) * 90;
  const blink = f - bt >= 0 && f - bt < 6 ? Math.sin(((f - bt) / 6) * Math.PI) : 0;
  const cry = p.face === 'cry';
  return (
    <g transform={`translate(0 ${-p.hop}) rotate(${p.lean}) scale(${1 / Math.sqrt(p.squash)} ${p.squash})`}>
      <defs>
        <radialGradient id={`kb-${seed}`} cx="0.35" cy="0.25" r="0.9"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#D9DEE4" /></radialGradient>
        <radialGradient id={`kh-${seed}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#D9A274" /><stop offset="0.6" stopColor="#A86D45" /><stop offset="1" stopColor="#7E4E2E" /></radialGradient>
      </defs>
      <ellipse cx={0} cy={p.hop} rx={230} ry={34} fill="#000" opacity={0.22} />
      <path d={BODY} fill={`url(#kb-${seed})`} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
      {/* collar, buttons, the flag badge */}
      <path d="M -90 -505 L 0 -430 L 90 -505 L 60 -520 L 0 -470 L -60 -520 Z" fill="#fff" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      {[-400, -300, -200, -100].map((y) => <circle key={y} cx={0} cy={y} r={9} fill="#C9D1DA" stroke={C.ink} strokeWidth={3} />)}
      <Flag />
      <circle cx={hx} cy={hy} r={HR} fill={`url(#kh-${seed})`} stroke={C.ink} strokeWidth={10} />
      {/* short curly hair */}
      <g>
        {Array.from({ length: 9 }, (_, k) => {
          const a = Math.PI * (1.05 + (k / 8) * 0.9);
          return <circle key={k} cx={hx + Math.cos(a) * HR * 0.86} cy={hy + Math.sin(a) * HR * 0.86 - 10} r={58} fill="#17100C" stroke={C.ink} strokeWidth={6} />;
        })}
        <path d={`M ${-HR * 0.9} ${hy - 60} Q 0 ${hy - 170} ${HR * 0.9} ${hy - 60} Q 0 ${hy - 120} ${-HR * 0.9} ${hy - 60} Z`} fill="#17100C" />
      </g>
      <ellipse cx={hx - 110} cy={hy + 60} rx={34} ry={20} fill="#E06A5A" opacity={0.4} />
      <ellipse cx={hx + 110} cy={hy + 60} rx={34} ry={20} fill="#E06A5A" opacity={0.4} />
      <g transform={`translate(${hx} ${hy}) rotate(${p.tilt})`}>
        {[-1, 1].map((s) => (
          <g key={s}>
            {p.face === 'oh' ? <circle cx={s * 72} cy={0} r={30} fill="#fff" stroke={C.ink} strokeWidth={7} /> : null}
            <ellipse cx={s * 72} cy={0} rx={p.face === 'oh' ? 14 : 24} ry={Math.max(3, (p.face === 'oh' ? 16 : cry ? 18 : 32) * (1 - blink))} fill={C.ink} />
            {blink < 0.5 && <circle cx={s * 72 - 7} cy={-10} r={7} fill="#fff" />}
            <path d={`M ${s * 72 - 30} ${-62} L ${s * 72 + 30} ${-62}`} stroke={C.ink} strokeWidth={12} strokeLinecap="round" transform={`rotate(${s * (cry ? -18 : p.face === 'frown' ? 14 : 0)} ${s * 72} -62)`} />
          </g>
        ))}
        {p.face === 'oh' ? <ellipse cx={0} cy={96} rx={22} ry={28} fill="#5A1A1A" stroke={C.ink} strokeWidth={6} />
          : p.face === 'grin' || p.face === 'drink' ? <path d="M -44 84 Q 0 140 44 84 Z" fill="#5A1A1A" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          : p.face === 'frown' || cry ? <path d="M -34 108 Q 0 80 34 108" stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
          : <path d="M -32 88 Q 0 118 32 88" stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />}
        {p.tears > 0.01 && [-1, 1].map((s) => (
          <g key={`t${s}`} opacity={Math.min(1, p.tears * 2)}>
            <path d={`M ${s * 72} 24 Q ${s * 80} ${70 + 40 * p.tears} ${s * 70} ${120 + 60 * p.tears}`} stroke="#7FD3FF" strokeWidth={16} fill="none" strokeLinecap="round" />
            {Array.from({ length: 3 }, (_, k) => {
              const t = ((f + k * 8 + (s > 0 ? 4 : 0)) % 24) / 24;
              return <path key={k} transform={`translate(${s * (74 + t * 30)} ${130 + t * 160})`} d="M 0 -14 C 8 -2 10 6 0 12 C -10 6 -8 -2 0 -14 Z" fill="#9EE0FF" stroke={C.ink} strokeWidth={3} opacity={1 - t} />;
            })}
          </g>
        ))}
      </g>
      {/* arms: the left one hangs, the right one can lift a cup to the mouth */}
      <path d="M -150 -430 Q -230 -330 -200 -230" stroke={C.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
      <g transform={`translate(190 -400) rotate(${-p.arm})`}>
        <path d={`M 0 0 Q 60 80 40 ${160 - p.cup * 80}`} stroke={C.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
        {p.cup > 0.01 && <g transform={`translate(40 ${160 - p.cup * 80})`}><path d="M -26 -60 L 26 -60 L 18 10 L -18 10 Z" fill="#F4F4F0" stroke={C.ink} strokeWidth={6} /><rect x={-24} y={-48} width={48} height={14} fill="#7FD3FF" /></g>}
        <circle cx={40} cy={160 - p.cup * 80} r={20} fill="#A86D45" stroke={C.ink} strokeWidth={5} />
      </g>
      {p.mark && p.markK > 0.01 && (
        <g transform={`translate(${HR * 0.95} ${hy - HR - 40}) rotate(12) scale(${p.markK})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily="'PCAnton', Impact, sans-serif" fontSize={190} fill={p.mark === '!' ? '#E5262B' : '#FFC83D'} stroke={C.ink} strokeWidth={12} paintOrder="stroke">{p.mark}</text>
        </g>
      )}
    </g>
  );
};
