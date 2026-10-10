import React from 'react';
import { easeIn, easeOut, inOut, linear, ramp, window4 } from '../darien/anim';
import { C, Cam, GEO, P, PLANE, project } from './cam';

export const COL = {
  spain: '#F08A2C', france: '#3D66D6', portugal: '#36B060', andorra: '#46C86A', uk: '#D8394A', morocco: '#21B8A6',
  africa: '#F2C468', europe: '#5B8CFF', gold: '#FFD45A',
};

const pathD = (c: Cam, rings: P[][], close = true) =>
  rings.map((r) => r.map((pt, i) => {
    const [px, py] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
  }).join('') + (close ? 'Z' : '')).join('');

const centroid = (rings: P[][]): P => {
  let sx = 0, sy = 0, n = 0;
  for (const r of rings) for (const [x, y] of r) { sx += x; sy += y; n++; }
  return [sx / n, sy / n];
};

/** Colour wash over a country, revealed by a circle growing from `from`, a bright edge on the reveal front. */
const Tint: React.FC<{ id: string; c: Cam; rings: P[][]; color: string; a: number; reveal?: number; from?: P; fill?: number; glow?: number; stroke?: number }> = ({
  id, c, rings, color, a, reveal = 1, from, fill = 0.5, glow = 0, stroke = 3,
}) => {
  if (a <= 0.001 || reveal <= 0.001) return null;
  const d = pathD(c, rings);
  const o = project(c, ...(from ?? centroid(rings)));
  const rad = reveal >= 1 ? 99999 : 20 + reveal * 3000;
  const edge = reveal < 1 ? Math.sin(reveal * Math.PI) : 0;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a,
      filter: glow > 0 ? `drop-shadow(0 0 ${8 * glow}px ${color}) drop-shadow(0 0 ${22 * glow}px ${color})` : undefined }}>
      <defs>
        <clipPath id={`${id}r`}><circle cx={o[0]} cy={o[1]} r={rad} /></clipPath>
        <clipPath id={`${id}s`}><path d={d} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}r)`}>
        <path d={d} fill={color} fillOpacity={fill} />
        <g clipPath={`url(#${id}s)`}><path d={d} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={10} style={{ filter: 'blur(4px)' }} /></g>
        {stroke > 0 && <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />}
      </g>
      {edge > 0.01 && <circle cx={o[0]} cy={o[1]} r={rad} fill="none" stroke="#fff" strokeOpacity={0.6 * edge} strokeWidth={12} clipPath={`url(#${id}s)`} style={{ filter: 'blur(4px)' }} />}
    </svg>
  );
};

/** A glowing border line, drawn on with p, with a light pulse running along it once drawn. */
const Border: React.FC<{ c: Cam; lines: P[][]; p: number; a: number; t: number; color?: string; w?: number }> = ({ c, lines, p, a, t, color = '#FFF4C8', w = 5 }) => {
  if (a <= 0.001 || p <= 0) return null;
  const d = pathD(c, lines, false);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <path d={d} fill="none" stroke={color} strokeWidth={w * 4} strokeOpacity={0.35} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(6px)' }} />
      <path d={d} fill="none" stroke={color} strokeWidth={w} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      {p >= 1 && <path d={d} fill="none" stroke="#fff" strokeWidth={w * 1.8} pathLength={1} strokeDasharray="0.05 1" strokeDashoffset={-((t * 0.4) % 1.05) + 0.05} strokeLinecap="round" style={{ filter: 'blur(2px)' }} />}
    </svg>
  );
};

/** Map label in the plane: bold, letter-spaced, with a dark halo; fades and rises in. */
const MapLabel: React.FC<{ c: Cam; at: P; text: string; t: number; t0: number; t1: number; size: number; color?: string }> = ({ c, at, text, t, t0, t1, size, color = '#fff' }) => {
  const a = window4(t, t0, t0 + 0.25, t1 - 0.3, t1);
  if (a <= 0) return null;
  const [x, y] = project(c, at[0], at[1]);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${-c.rot}deg) translateY(${(1 - ramp(t, t0, t0 + 0.35, easeOut)) * 16}px) scale(${0.85 + 0.15 * ramp(t, t0, t0 + 0.35, easeOut)})`,
      opacity: a, fontFamily: "'NotoSerifDeva', 'Noto Serif Devanagari', serif", fontWeight: 900, fontSize: size, color, whiteSpace: 'nowrap', letterSpacing: 2,
      textShadow: '0 3px 10px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.9)' }}>{text}</div>
  );
};

/** A measured line between two map points (the Llívia gap, the 85 m isthmus), with end ticks. */
const Measure: React.FC<{ c: Cam; a: P; b: P; p: number; alpha: number; color?: string }> = ({ c, a, b, p, alpha, color = '#FFE45A' }) => {
  if (alpha <= 0.001 || p <= 0) return null;
  const A = project(c, a[0], a[1]);
  const B = project(c, b[0], b[1]);
  const E = [A[0] + (B[0] - A[0]) * p, A[1] + (B[1] - A[1]) * p];
  const ang = Math.atan2(B[1] - A[1], B[0] - A[0]) + Math.PI / 2;
  const tick = (q: number[]) => `M${q[0] + Math.cos(ang) * 16},${q[1] + Math.sin(ang) * 16} L${q[0] - Math.cos(ang) * 16},${q[1] - Math.sin(ang) * 16}`;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: alpha, filter: `drop-shadow(0 0 6px ${color})` }}>
      <path d={`M${A[0]},${A[1]} L${E[0]},${E[1]}`} stroke={color} strokeWidth={6} strokeDasharray="14 9" strokeLinecap="round" />
      <path d={tick(A)} stroke={color} strokeWidth={6} strokeLinecap="round" />
      {p >= 1 && <path d={tick(B)} stroke={color} strokeWidth={6} strokeLinecap="round" />}
    </svg>
  );
};

// the Peñón's isthmus: ~85 m of sand between the rock's south-west foot and the Moroccan beach
const PEN = GEO.places.penon;
export const ISTHMUS: [P, P] = [[PEN[0] - 95, PEN[1] - 70], [PEN[0] - 175, PEN[1] - 120]];

// ---------------------------------------------------------------- the plane layer
export const PlaneLayers: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const end = window4(t, C.paanch12 - 0.1, C.paanch12 + 0.4, 998, 999);
  // Spain is lit almost the whole way; the neighbours light up as they are named
  const spainA = window4(t, C.spain1 - 0.2, C.spain1 + 0.2, 998, 999);
  const fr = window4(t, C.france1 - 0.1, C.france1 + 0.2, C.dedh - 0.4, C.dedh) + window4(t, C.france4 - 0.1, C.france4 + 0.2, C.bacha + 0.6, C.pashchim + 0.6) * 0.9
    + window4(t, C.nadi, C.nadi + 0.4, C.teesra + 0.6, C.teesra + 1.2) * 0.8 + window4(t, C.andorra - 0.4, C.andorra, C.chautha, C.chautha + 0.6) * 0.8 + end;
  const pt = window4(t, C.portugal - 0.1, C.portugal + 0.2, C.border3, C.border3 + 0.5) + end;
  const an = window4(t, C.andorra - 0.15, C.andorra + 0.2, C.chautha, C.chautha + 0.6) + window4(t, C.baaki, C.baaki + 0.2, C.chupa + 0.6, C.chupa + 1.0) * 0.6 + end;
  const uk = window4(t, C.britain - 0.15, C.britain + 0.2, C.dakshin + 0.5, C.dakshin + 1.0) + end * 0.8;
  const gb = window4(t, C.dakshin, C.dakshin + 0.4, C.khulta + 0.6, C.khulta + 1.1) + window4(t, C.baaki + 0.2, C.baaki + 0.4, C.chupa + 0.6, C.chupa + 1.0) * 0.6 + end;
  const mo = window4(t, C.morocco - 0.15, C.morocco + 0.2, C.sach, C.sach + 0.4) + window4(t, C.baaki + 0.4, C.baaki + 0.6, C.chupa + 0.6, C.chupa + 1.0) * 0.6 + end;
  const af = window4(t, C.africa10 - 0.2, C.africa10 + 0.4, C.zameeni + 1.2, C.do11);
  const eu = window4(t, C.europe - 0.2, C.europe + 0.3, C.zameeni + 1.2, C.do11);
  const lv = window4(t, C.llivia - 0.15, C.llivia + 0.2, C.pashchim + 0.6, C.pashchim + 1.2);
  const ce = window4(t, C.ceuta - 0.15, C.ceuta + 0.2, 998, 999);
  const ml = window4(t, C.melilla - 0.15, C.melilla + 0.2, 998, 999);
  const pn = window4(t, C.chattan - 0.15, C.chattan + 0.2, 998, 999);
  // Pheasant Island flips colour: Spain Feb–Jul, France Aug–Jan, and right now France
  const phA = window4(t, C.tapu - 0.1, C.tapu + 0.3, C.teesra + 0.3, C.teesra + 0.9);
  const phFr = t < C.farvari ? 0.5 : t < C.agast ? 0 : 1;
  return (
    <>
      <Tint id="af" c={c} rings={GEO.africa} color={COL.africa} a={af} fill={0.22} reveal={ramp(t, C.africa10 - 0.2, C.africa10 + 1.0, easeOut)} from={GEO.places.ceuta} stroke={2} />
      <Tint id="eu" c={c} rings={GEO.europe} color={COL.europe} a={eu} fill={0.16} reveal={ramp(t, C.europe - 0.2, C.europe + 1.0, easeOut)} from={GEO.places.gibraltar} stroke={1.5} />
      <Tint id="fr" c={c} rings={GEO.france} color={COL.france} a={Math.min(1, fr)} reveal={ramp(t, C.france1 - 0.1, C.france1 + 0.7, easeOut)} from={GEO.places.paris} glow={window4(t, C.france1, C.france1 + 0.2, C.france1 + 0.5, C.france1 + 0.9)} />
      <Tint id="pt" c={c} rings={GEO.portugal} color={COL.portugal} a={Math.min(1, pt)} reveal={ramp(t, C.portugal - 0.1, C.portugal + 0.6, easeOut)} from={GEO.places.lisbon} glow={window4(t, C.portugal, C.portugal + 0.2, C.portugal + 0.5, C.portugal + 0.9)} />
      <Tint id="es" c={c} rings={GEO.spain} color={COL.spain} a={spainA} fill={0.55} reveal={ramp(t, C.spain1 - 0.2, C.spain1 + 0.8, easeOut)} from={GEO.places.madrid} glow={window4(t, C.spain1, C.spain1 + 0.2, C.spain1 + 0.6, C.spain1 + 1.0)} />
      <Tint id="an" c={c} rings={GEO.andorra} color={COL.andorra} a={Math.min(1, an)} fill={0.6} glow={window4(t, C.andorra, C.andorra + 0.2, C.prince, C.prince + 0.5) + 0.5 * window4(t, C.baaki, C.baaki + 0.2, C.chupa, C.chupa + 0.6)} stroke={4} />
      <Tint id="uk" c={c} rings={GEO.uk} color={COL.uk} a={Math.min(1, uk)} reveal={ramp(t, C.britain - 0.15, C.britain + 0.6, easeOut)} from={GEO.places.london} glow={window4(t, C.britain, C.britain + 0.2, C.britain + 0.5, C.britain + 1.0)} />
      <Tint id="gb" c={c} rings={GEO.gibraltar} color={COL.uk} a={Math.min(1, gb)} fill={0.62} glow={0.8} stroke={4} />
      <Tint id="mo" c={c} rings={GEO.morocco} color={COL.morocco} a={Math.min(1, mo)} reveal={ramp(t, C.morocco - 0.15, C.morocco + 0.7, easeOut)} from={GEO.places.ceuta} glow={window4(t, C.morocco, C.morocco + 0.2, C.morocco + 0.5, C.morocco + 1.0)} />
      <Tint id="lv" c={c} rings={GEO.llivia} color={COL.spain} a={lv} fill={0.68} glow={0.9} stroke={4} />
      <Tint id="ce" c={c} rings={GEO.ceuta} color={COL.spain} a={ce} fill={0.68} glow={0.8} stroke={4} />
      <Tint id="ml" c={c} rings={GEO.melilla} color={COL.spain} a={ml} fill={0.68} glow={0.8} stroke={4} />
      <Tint id="pn" c={c} rings={GEO.penon} color={COL.spain} a={pn} fill={0.55} glow={0.8} stroke={3} />
      <Tint id="ph" c={c} rings={GEO.pheasant} color={phFr > 0.75 ? COL.france : phFr < 0.25 ? COL.spain : '#ffffff'} a={phA} fill={0.55} glow={0.9} stroke={3} />

      {/* the strange borders, drawn on */}
      <Border c={c} t={t} lines={GEO.b_france} p={ramp(t, C.pehle - 0.1, C.ajeeb + 0.4, inOut)} a={window4(t, C.pehle - 0.1, C.pehle + 0.1, C.dedh, C.dedh + 0.5)} />
      <Border c={c} t={t} lines={GEO.b_llivia} p={ramp(t, C.chaaron - 0.2, C.chaaron + 0.6, inOut)} a={window4(t, C.chaaron - 0.2, C.chaaron, C.pashchim + 0.4, C.pashchim + 0.9)} color="#FFE45A" w={4} />
      <Border c={c} t={t} lines={GEO.b_andorra} p={ramp(t, C.andorra - 0.1, C.andorra + 0.7, inOut)} a={window4(t, C.andorra - 0.1, C.andorra + 0.1, C.chautha, C.chautha + 0.5)} color="#C9FFD8" w={4} />
      <Border c={c} t={t} lines={GEO.b_gibraltar} p={ramp(t, C.gib - 0.1, C.gib + 0.6, inOut)} a={window4(t, C.gib - 0.1, C.gib + 0.1, C.darwaza, C.darwaza + 0.4)} color="#FFE45A" w={6} />
      <Border c={c} t={t} lines={GEO.b_ceuta} p={ramp(t, C.ceuta - 0.1, C.ceuta + 0.6, inOut)} a={window4(t, C.ceuta - 0.1, C.ceuta + 0.1, C.tapu11, C.tapu11 + 0.4)} color="#FFE45A" w={4} />
      <Border c={c} t={t} lines={GEO.b_melilla} p={ramp(t, C.melilla - 0.1, C.melilla + 0.6, inOut)} a={window4(t, C.melilla - 0.1, C.melilla + 0.1, C.tapu11, C.tapu11 + 0.4)} color="#FFE45A" w={4} />
      <Measure c={c} a={GEO.llivia_gap[0]} b={GEO.llivia_gap[1]} p={ramp(t, C.dedh - 0.1, C.dedh + 0.7, easeOut)} alpha={window4(t, C.dedh - 0.1, C.dedh + 0.1, C.y1659 - 0.3, C.y1659)} />
      <Measure c={c} a={ISTHMUS[0]} b={ISTHMUS[1]} p={ramp(t, C.m85 - 0.4, C.m85 + 0.3, easeOut)} alpha={window4(t, C.chhota - 0.2, C.chhota, C.sach, C.sach + 0.4)} color="#FFE45A" />

      {/* names */}
      <MapLabel c={c} at={GEO.places.madrid} text="स्पेन" t={t} t0={C.spain1} t1={C.paanch - 0.1} size={78} />
      <MapLabel c={c} at={GEO.places.paris} text="फ्रांस" t={t} t0={C.france1} t1={C.border3} size={70} />
      <MapLabel c={c} at={[GEO.places.lisbon[0] + 9e4, GEO.places.lisbon[1] + 1.2e5]} text="पुर्तगाल" t={t} t0={C.portugal} t1={C.paanch - 0.1} size={54} />
      <MapLabel c={c} at={[GEO.places.llivia[0], GEO.places.llivia[1] + 9e3]} text="लिविया" t={t} t0={C.llivia} t1={C.y1659 - 0.2} size={70} color="#FFE7B0" />
      <MapLabel c={c} at={[GEO.places.llivia[0] + 1.4e4, GEO.places.llivia[1] + 1.6e4]} text="फ्रांस" t={t} t0={C.chaaron} t1={C.y1659 - 0.2} size={58} color="#CFE0FF" />
      <MapLabel c={c} at={[GEO.places.puigcerda[0] - 1.2e4, GEO.places.puigcerda[1] - 1.2e4]} text="स्पेन" t={t} t0={C.chaaron + 0.3} t1={C.y1659 - 0.2} size={58} color="#FFD8B0" />
      <MapLabel c={c} at={[GEO.places.andorra[0], GEO.places.andorra[1] - 2.6e4]} text="अंडोरा" t={t} t0={C.andorra} t1={C.chautha + 0.2} size={66} color="#D8FFE0" />
      <MapLabel c={c} at={[GEO.places.london[0] - 2.5e5, GEO.places.london[1] + 2.5e5]} text="ब्रिटेन" t={t} t0={C.britain} t1={C.dakshin + 0.6} size={70} color="#FFD8DC" />
      <MapLabel c={c} at={[GEO.places.gibraltar[0] + 4.5e3, GEO.places.gibraltar[1] + 4.0e3]} text="जिब्राल्टर" t={t} t0={C.gib} t1={C.darwaza} size={60} color="#FFD8DC" />
      <MapLabel c={c} at={[GEO.places.ceuta[0] - 1.5e4, GEO.places.ceuta[1] - 3.0e5]} text="मोरक्को" t={t} t0={C.morocco} t1={C.do11} size={78} color="#C8FFF6" />
      <MapLabel c={c} at={[GEO.places.ceuta[0] + 4e5, GEO.places.ceuta[1] - 8.5e5]} text="अफ्रीका" t={t} t0={C.africa10} t1={C.do11} size={92} color="#FFE7B0" />
      <MapLabel c={c} at={[GEO.places.madrid[0] + 9e5, GEO.places.madrid[1] + 1.25e6]} text="यूरोप" t={t} t0={C.europe} t1={C.do11} size={92} color="#D6E4FF" />
      <MapLabel c={c} at={[GEO.places.ceuta[0], GEO.places.ceuta[1] - 2.2e4]} text="सेउटा" t={t} t0={C.ceuta} t1={C.tapu11} size={56} color="#FFE7B0" />
      <MapLabel c={c} at={[GEO.places.melilla[0], GEO.places.melilla[1] - 2.2e4]} text="मेलिया" t={t} t0={C.melilla} t1={C.tapu11} size={56} color="#FFE7B0" />
      {/* the closing view: all five neighbours */}
      <MapLabel c={c} at={GEO.places.madrid} text="स्पेन" t={t} t0={C.paanch12} t1={999} size={78} />
      <MapLabel c={c} at={GEO.places.paris} text="फ्रांस" t={t} t0={C.paanch12 + 0.1} t1={999} size={64} />
      <MapLabel c={c} at={[GEO.places.lisbon[0] + 9e4, GEO.places.lisbon[1] + 1.2e5]} text="पुर्तगाल" t={t} t0={C.paanch12 + 0.2} t1={999} size={50} />
      <MapLabel c={c} at={[GEO.places.andorra[0] + 1.2e5, GEO.places.andorra[1] + 1.1e5]} text="अंडोरा" t={t} t0={C.paanch12 + 0.3} t1={999} size={44} color="#D8FFE0" />
      <MapLabel c={c} at={[GEO.places.gibraltar[0] - 2.2e5, GEO.places.gibraltar[1] - 0.6e5]} text="ब्रिटेन (जिब्राल्टर)" t={t} t0={C.paanch12 + 0.4} t1={999} size={40} color="#FFD8DC" />
      <MapLabel c={c} at={[GEO.places.ceuta[0] + 1e5, GEO.places.ceuta[1] - 2.8e5]} text="मोरक्को" t={t} t0={C.paanch12 + 0.5} t1={999} size={56} color="#C8FFF6" />
    </>
  );
};

export { easeIn, easeOut, inOut, linear };
