import React from 'react';
import { random } from 'remotion';
import { C } from './theme';

// Our chibi: an Indian tourist fresh off the plane from Mumbai (the script's "तुम"), in place of the reference's Victorian
// gent. A plush-toy figure: big round head, bell body, stick arms, a black umbrella with four states. Units ~1000 tall,
// origin at the ground under the body's centre. Outfits: 'summer' (yellow tee and shorts, sunglasses on the head: just
// landed), 'coat' (a navy rain jacket over it), 'sun' (sunglasses on).

export type Umbrella = 'none' | 'closed' | 'open' | 'inside';
export type Outfit = 'summer' | 'coat' | 'sun';
export type Mouth = 'smile' | 'grin' | 'oh' | 'frown' | 'worried';
export type Pose = {
  umbrella: Umbrella; open: number; // 0..1 umbrella opening
  outfit: Outfit; mouth: Mouth; brow: number; lean: number; tilt: number; squash: number; hop: number;
  shiver: number; sweat: number; hair: number; // hair blown back 0..1
  arm: number; // umbrella arm angle offset (deg)
};
export const P0: Pose = { umbrella: 'closed', open: 0, outfit: 'summer', mouth: 'smile', brow: 0, lean: 0, tilt: 0, squash: 1, hop: 0, shiver: 0, sweat: 0, hair: 0, arm: 0 };

const HEAD: [number, number] = [0, -700];
const HR = 215;
const BODY = 'M -150 -500 C -230 -420 -250 -200 -235 -40 Q -230 0 -190 0 L 190 0 Q 230 0 235 -40 C 250 -200 230 -420 150 -500 Q 0 -560 -150 -500 Z';

/** The black umbrella. Origin at the hand; the canopy above. `open` 0 = furled stick, 1 = open; 'inside' = blown out. */
export const UmbrellaSvg: React.FC<{ state: Umbrella; open: number; f: number }> = ({ state, open, f }) => {
  if (state === 'none') return null;
  const o = state === 'closed' ? 0 : state === 'inside' ? 1 : open;
  const w = 40 + 420 * o, h = 40 + 170 * o;
  const flip = state === 'inside';
  const flap = flip ? Math.sin(f / 3) * 18 : 0;
  const top = -520;
  return (
    <g>
      <path d={`M 0 0 V ${top + 30}`} stroke="#1A1A1A" strokeWidth={14} strokeLinecap="round" />
      <path d="M 0 0 q 0 40 -34 40 q -30 0 -30 -26" stroke="#5A3A20" strokeWidth={16} fill="none" strokeLinecap="round" />
      {o < 0.05 ? (
        <path d={`M -22 ${top + 60} Q 0 ${top - 10} 22 ${top + 60} L 14 ${top + 260} L -14 ${top + 260} Z`} fill="#1E1E22" stroke={C.ink} strokeWidth={6} />
      ) : flip ? (
        // inside out: the canopy cupped upward, ribs sticking out, flapping
        <g transform={`translate(0 ${top}) rotate(${flap})`}>
          <path d={`M ${-w / 2} ${-h * 0.9} Q 0 ${h * 0.5} ${w / 2} ${-h * 0.9} Q ${w * 0.25} ${-h * 0.3} 0 ${-h * 0.2} Q ${-w * 0.25} ${-h * 0.3} ${-w / 2} ${-h * 0.9} Z`}
            fill="#26262C" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          {[-0.5, -0.25, 0, 0.25, 0.5].map((k) => <path key={k} d={`M 0 ${h * 0.1} L ${w * k * 1.15} ${-h * 1.05}`} stroke="#8A8A92" strokeWidth={5} />)}
        </g>
      ) : (
        <g transform={`translate(0 ${top})`}>
          <path d={`M ${-w / 2} ${h * 0.2} Q ${-w / 2} ${-h} 0 ${-h} Q ${w / 2} ${-h} ${w / 2} ${h * 0.2} Q ${w * 0.375} ${h * 0.05} ${w / 4} ${h * 0.2} Q ${w * 0.125} ${h * 0.05} 0 ${h * 0.2} Q ${-w * 0.125} ${h * 0.05} ${-w / 4} ${h * 0.2} Q ${-w * 0.375} ${h * 0.05} ${-w / 2} ${h * 0.2} Z`}
            fill="#1E1E24" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <path d={`M ${-w * 0.3} ${-h * 0.55} Q 0 ${-h * 0.95} ${w * 0.2} ${-h * 0.7}`} stroke="#fff" strokeWidth={8} opacity={0.22} fill="none" strokeLinecap="round" />
          <circle cx={0} cy={-h - 8} r={9} fill="#C9C9C9" />
        </g>
      )}
    </g>
  );
};

export const Tourist: React.FC<{ pose: Pose; f: number; seed?: string }> = ({ pose: p, f, seed = 'tourist' }) => {
  const [hx, hy] = HEAD;
  let bt = 20 + random(seed) * 60, i = 0;
  while (bt < f - 7 && i < 300) bt += 150 + random(`${seed}${i++}`) * 90;
  const blink = f - bt >= 0 && f - bt < 6 ? Math.sin(((f - bt) / 6) * Math.PI) : 0;
  const sh = p.shiver * Math.sin(f * 2.1) * 6;
  const coat = p.outfit === 'coat';
  const sun = p.outfit === 'sun';
  const body = coat ? ['#2D4A7A', '#16284A'] : ['#FFC93C', '#E39A12'];
  const hand: [number, number] = [190, -360];
  return (
    <g transform={`translate(${sh} ${-p.hop}) rotate(${p.lean}) scale(${1 / Math.sqrt(p.squash)} ${p.squash})`}>
      <defs>
        <radialGradient id={`tb-${seed}`} cx="0.35" cy="0.25" r="0.9"><stop offset="0" stopColor={body[0]} /><stop offset="1" stopColor={body[1]} /></radialGradient>
        <radialGradient id={`th-${seed}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#F3C9A0" /><stop offset="0.6" stopColor="#C98A5E" /><stop offset="1" stopColor="#9A6340" /></radialGradient>
      </defs>
      <ellipse cx={0} cy={p.hop} rx={230} ry={34} fill="#000" opacity={0.22} />
      <path d={BODY} fill={`url(#tb-${seed})`} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
      {!coat && (
        <g>
          {/* a tee with a little palm print, and the backpack straps */}
          <path d="M -40 -330 q 20 -60 40 0 q 20 -60 40 0" stroke="#2E8B57" strokeWidth={10} fill="none" />
          <path d="M 0 -330 V -250" stroke="#7A4A20" strokeWidth={10} />
          <path d="M -120 -490 L -150 -60 M 120 -490 L 150 -60" stroke="#C0392B" strokeWidth={26} strokeLinecap="round" />
        </g>
      )}
      {coat && (
        <g>
          <path d="M 0 -500 V -10" stroke="#0E1A30" strokeWidth={10} />
          {[-400, -300, -200, -100].map((y) => <circle key={y} cx={26} cy={y} r={10} fill="#C9D1DA" />)}
          <path d="M -170 -500 Q 0 -440 170 -500 L 150 -460 Q 0 -400 -150 -460 Z" fill="#20375E" stroke={C.ink} strokeWidth={6} />
        </g>
      )}
      <circle cx={hx} cy={hy} r={HR} fill={`url(#th-${seed})`} stroke={C.ink} strokeWidth={10} />
      {/* hair, blown back by the wind */}
      <path d={`M ${-HR * 0.95} ${hy - 40} C ${-HR * 1.05 - p.hair * 80} ${hy - 260} ${HR * 1.05 - p.hair * 80} ${hy - 260} ${HR * 0.95} ${hy - 40} Q ${HR * 0.5} ${hy - 150} 0 ${hy - 130} Q ${-HR * 0.5} ${hy - 150} ${-HR * 0.95} ${hy - 40} Z`}
        fill="#1B1210" stroke={C.ink} strokeWidth={8} />
      <ellipse cx={hx - 110} cy={hy + 60} rx={34} ry={20} fill="#E37A6A" opacity={0.45} />
      <ellipse cx={hx + 110} cy={hy + 60} rx={34} ry={20} fill="#E37A6A" opacity={0.45} />
      <g transform={`translate(${hx} ${hy}) rotate(${p.tilt})`}>
        {sun ? (
          <g>
            <path d="M -130 -20 H 130" stroke={C.ink} strokeWidth={10} />
            {[-1, 1].map((s) => <rect key={s} x={s * 70 - 56} y={-40} width={112} height={64} rx={26} fill="#101418" stroke={C.ink} strokeWidth={6} />)}
            {[-1, 1].map((s) => <path key={`g${s}`} d={`M ${s * 70 - 30} -24 l 26 -6`} stroke="#fff" strokeWidth={8} opacity={0.6} />)}
          </g>
        ) : (
          [-1, 1].map((s) => (
            <g key={s}>
              <ellipse cx={s * 72} cy={0} rx={26} ry={Math.max(3, 34 * (1 - blink))} fill={C.ink} />
              {blink < 0.5 && <circle cx={s * 72 - 8} cy={-12} r={8} fill="#fff" />}
              <path d={`M ${s * 72 - 30} ${-58 - p.brow * 12} L ${s * 72 + 30} ${-58 - p.brow * 12}`} stroke={C.ink} strokeWidth={12} strokeLinecap="round" transform={`rotate(${s * p.brow * 14} ${s * 72} -58)`} />
            </g>
          ))
        )}
        {!sun && p.outfit === 'summer' && (
          // sunglasses pushed up on the head
          <g transform="translate(0 -150)">{[-1, 1].map((s) => <rect key={s} x={s * 62 - 48} y={-22} width={96} height={46} rx={20} fill="#101418" stroke={C.ink} strokeWidth={5} />)}<path d="M -14 0 H 14" stroke={C.ink} strokeWidth={6} /></g>
        )}
        {p.mouth === 'oh' ? <ellipse cx={0} cy={92} rx={24} ry={30} fill="#5A1A1A" stroke={C.ink} strokeWidth={6} />
          : p.mouth === 'grin' ? <path d="M -44 84 Q 0 140 44 84 Z" fill="#5A1A1A" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          : p.mouth === 'frown' ? <path d="M -34 104 Q 0 78 34 104" stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
          : p.mouth === 'worried' ? <path d="M -30 98 Q -15 86 0 98 Q 15 86 30 98" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
          : <path d="M -32 88 Q 0 118 32 88" stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />}
      </g>
      {p.sweat > 0.01 && <path transform={`translate(${HR * 0.9} ${hy - 80 + p.sweat * 60})`} d="M 0 -36 C 20 -6 24 10 0 24 C -24 10 -20 -6 0 -36 Z" fill="#8FDBFF" stroke={C.ink} strokeWidth={6} opacity={Math.min(1, p.sweat * 3)} />}
      {/* left arm down, right arm holds the umbrella */}
      <path d="M -150 -430 Q -230 -330 -200 -230" stroke={C.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
      <g transform={`translate(${hand[0]} ${hand[1]}) rotate(${p.arm})`}>
        <path d={`M -40 -70 Q -10 -40 0 0`} stroke={C.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
        <UmbrellaSvg state={p.umbrella} open={p.open} f={f} />
        <circle r={22} fill="#C98A5E" stroke={C.ink} strokeWidth={5} />
      </g>
    </g>
  );
};
