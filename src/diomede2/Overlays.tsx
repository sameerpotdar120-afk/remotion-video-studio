import React from 'react';
import { Img, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import { BIG, C, Cam, GEO1, GEO2, LIT, MID, MS, P, PLANE, merc, project, pxPerM } from './cam';
import { BLUE, CYAN, FONT, Laser, Neon, RED, Svg, WavingFlag, glow } from './fx';

const img = (f: string) => staticFile(`diomede/v2/img/${f}`);

// ---------------------------------------------------------------- geometry helpers
const ringsD = (c: Cam, rs: P[][]) => {
  let d = '';
  for (const r of rs) {
    for (let i = 0; i < r.length; i++) {
      const [x, y] = project(c, r[i][0], r[i][1]);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
    }
    d += 'Z';
  }
  return d;
};
const lineD = (c: Cam, pts: P[]) => 'M' + pts.map((p) => project(c, p[0], p[1]).map((v) => v.toFixed(1)).join(',')).join('L');
const boxOf = (c: Cam, rs: P[][]): [number, number, number, number] => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rs) for (const p of r) {
    const [x, y] = project(c, p[0], p[1]);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1];
};
const add = (a: P, dx: number, dy: number): P => [a[0] + dx * MS, a[1] + dy * MS];

/** HTML pinned to a map point, kept upright against camera roll. */
export const Pin: React.FC<{ c: Cam; at: P; children: React.ReactNode; anchor?: 'center' | 'bottom' }> = ({ c, at, children, anchor = 'center' }) => {
  const [x, y] = project(c, at[0], at[1]);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `rotate(${-c.rot}deg)` }}>
      <div style={{ position: 'absolute', left: 0, top: 0, transform: anchor === 'center' ? 'translate(-50%,-50%)' : 'translate(-50%,-100%)' }}>{children}</div>
    </div>
  );
};

export const Label: React.FC<{ text: string; size: number; s?: number; color?: string }> = ({ text, size, s = 1, color = '#fff' }) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, color, whiteSpace: 'nowrap', transform: `scale(${s})`,
    textShadow: '0 3px 6px rgba(0,0,0,0.85), 0 0 18px rgba(0,0,0,0.55)' }}>{text}</div>
);

// the walk across the ice: from Little Diomede's west shore to Big Diomede's east shore
const WALK_A = GEO1.gapA;
const WALK_B = GEO1.gapB;

export const Overlays: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const k = pxPerM(c);
  const items: React.ReactNode[] = [];

  // ================================================================ 1. the US in its flag, the laser, Russia in its flag
  const worldA = 1 - ramp(t, C.four + 0.05, C.four + 0.3, linear);
  if (worldA > 0) {
    const usA = ramp(t, 0.0, 0.35, linear) * worldA;
    items.push(<WavingFlag key="us48" id="us48" clipD={ringsD(c, GEO2.usa48)} box={boxOf(c, GEO2.usa48)} kind="us" t={t} opacity={usA} />);
    const a = project(c, ...merc(-77, 39));
    const b = project(c, ...merc(37.6, 55.75));
    const p = ramp(t, C.rus - 0.05, C.rus + 0.75, easeOut);
    items.push(<Laser key="laser" a={a} b={b} p={p} t={t} opacity={worldA * (1 - ramp(t, C.ekdusre + 0.2, C.ekdusre + 0.6, linear))} />);
    const ruA = ramp(t, C.rus + 0.7, C.rus + 1.0, linear) * worldA;
    if (ruA > 0) {
      const hit = window4(t, C.rus + 0.7, C.rus + 0.75, C.rus + 0.8, C.rus + 1.3);
      items.push(<WavingFlag key="ru" id="ru" clipD={ringsD(c, GEO2.russia)} box={boxOf(c, GEO2.russia)} kind="ru" t={t} opacity={ruA} />);
      if (hit > 0)
        items.push(
          <Svg key="hit" opacity={hit}>
            <circle cx={b[0]} cy={b[1]} r={60 + 260 * (1 - hit)} fill="none" stroke="#fff" strokeWidth={10 * hit} style={{ filter: glow('#FF4BD8', 10, 2) }} />
          </Svg>,
          <Img key="hitb" src={img('light_burst.png')} style={{ position: 'absolute', width: 620, left: b[0] - 310, top: b[1] - 310, opacity: hit, mixBlendMode: 'screen',
            transform: `rotate(${-c.rot}deg) scale(${0.7 + 0.5 * hit})` }} />,
        );
    }
    const akA = ramp(t, C.ekdusre, C.ekdusre + 0.4, linear) * worldA;
    if (akA > 0) items.push(<WavingFlag key="akw" id="akw" clipD={ringsD(c, GEO2.alaska)} box={boxOf(c, GEO2.alaska)} kind="us" t={t} opacity={akA} />);
  }

  // ================================================================ 2. flat infographic map (after the iris), "connected"
  const flatA = window4(t, C.four + 0.3, C.four + 0.35, C.dono - 0.1, C.dono);
  if (flatA > 0) {
    const ru = ringsD(c, [...GEO2.russia, ...GEO2.chukotka]);
    const ak = ringsD(c, GEO2.alaska);
    const ca = ringsD(c, GEO2.canada);
    items.push(
      <Svg key="flat" opacity={flatA}>
        <rect x={-500} y={-500} width={PLANE.w + 1000} height={PLANE.h + 1000} fill="#9CE8EE" />
        <path d={ca} fill="#EEF4F7" />
        <path d={ru} fill="#FF5363" />
        <path d={ak} fill="#5468FF" />
        <path d={ru + ak} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={3} />
      </Svg>,
    );
    // dashed lines rushing toward the strait from both sides
    const strait = project(c, ...merc(-169.2, 65.75));
    const draw = ramp(t, C.kabhi - 0.1, C.jud + 0.05, inOut);
    if (draw > 0) {
      const lines: React.ReactNode[] = [];
      const fan = [-0.42, -0.21, 0, 0.21, 0.42];
      for (const side of [-1, 1]) {
        fan.forEach((f, i) => {
          const len = 520 + 90 * Math.cos(i);
          const ang = (side < 0 ? Math.PI : 0) + f * side;
          const sx = strait[0] + Math.cos(ang) * len;
          const sy = strait[1] + Math.sin(ang) * len;
          const ex = lerp(sx, strait[0], draw);
          const ey = lerp(sy, strait[1], draw);
          lines.push(<path key={`${side}${i}`} d={`M${sx},${sy}L${ex},${ey}`} stroke="#fff" strokeWidth={7} strokeDasharray="22 16" strokeDashoffset={-t * 120} strokeLinecap="round" opacity={0.95} />);
        });
      }
      items.push(<Svg key="fanl" filter={glow('rgba(255,255,255,0.7)', 5, 1)} opacity={flatA * (1 - ramp(t, C.kaise + 0.2, C.kaise + 0.6, linear))}>{lines}</Svg>);
    }
    const burst = window4(t, C.jud, C.jud + 0.12, C.dekho, C.dono);
    if (burst > 0) {
      const r = 40 + 140 * ramp(t, C.jud, C.jud + 0.5, easeOut);
      items.push(
        <Svg key="burst" opacity={burst}>
          <defs><radialGradient id="bg1"><stop offset="0" stopColor="#fff" /><stop offset="0.3" stopColor="#FFE7FF" stopOpacity={0.95} /><stop offset="1" stopColor="#FF7BEA" stopOpacity={0} /></radialGradient></defs>
          <circle cx={strait[0]} cy={strait[1]} r={r * (1 + 0.08 * Math.sin(t * 18))} fill="url(#bg1)" />
          {Array.from({ length: 12 }, (_, i) => {
            const ang = (i / 12) * Math.PI * 2 + t * 0.6;
            return <path key={i} d={`M${strait[0] + Math.cos(ang) * r * 0.5},${strait[1] + Math.sin(ang) * r * 0.5}L${strait[0] + Math.cos(ang) * r * 1.6},${strait[1] + Math.sin(ang) * r * 1.6}`} stroke="#fff" strokeWidth={4} opacity={0.8} />;
          })}
        </Svg>,
        <Img key="burstb" src={img('light_burst.png')} style={{ position: 'absolute', width: 760, left: strait[0] - 380, top: strait[1] - 380, opacity: burst, mixBlendMode: 'screen',
          transform: `rotate(${-c.rot + t * 8}deg) scale(${0.8 + 0.15 * Math.sin(t * 9)})` }} />,
      );
    }
  }

  // ================================================================ 3. neon Russia / Alaska on satellite
  const neonA = window4(t, C.dono - 0.05, C.dono + 0.25, C.dikhte + 0.1, C.dikhte + 0.5);
  if (neonA > 0) {
    items.push(<Neon key="nru" d={ringsD(c, GEO2.chukotka)} color={RED} a={neonA} />);
    items.push(<Neon key="nak" d={ringsD(c, GEO2.alaska)} color={CYAN} a={neonA} />);
  }

  // ================================================================ 4. the two islands, their label, 3.8 km
  const islA = window4(t, C.dikhte - 0.1, C.dikhte + 0.2, C.little - 0.1, C.little + 0.3);
  if (islA > 0) {
    items.push(
      <Svg key="isl" opacity={islA} filter={glow('rgba(255,255,255,0.95)', 6, 2)}>
        <path d={ringsD(c, [...GEO1.big, ...GEO1.little])} fill="rgba(255,255,255,0.10)" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      </Svg>,
    );
    const sL = pop(t, C.diomede, 11, 200);
    if (sL > 0.01) {
      const lab = add(MID, -800, 6400);
      const [lx, ly] = project(c, lab[0], lab[1]);
      const [bx, by] = project(c, BIG[0], GEO1.bigBounds[3] - 600);
      const [sx, sy] = project(c, LIT[0], GEO1.littleBounds[3] - 300);
      const g = clamp01(sL);
      items.push(
        <Svg key="leaders" opacity={islA}>
          <path d={`M${lx},${ly + 40}L${lerp(lx, bx, g)},${lerp(ly + 40, by, g)}M${lx},${ly + 40}L${lerp(lx, sx, g)},${lerp(ly + 40, sy, g)}`} stroke="#fff" strokeWidth={4} />
        </Svg>,
        <Pin key="dlab" c={c} at={lab} anchor="bottom"><div style={{ opacity: islA }}><Label text="डायोमीडी आइलैंड्स" size={66} s={sL} /></div></Pin>,
      );
    }
    const dA = ramp(t, C.d38 - 0.15, C.d38 + 0.35, easeOut) * islA;
    if (dA > 0) {
      const [ax, ay] = project(c, GEO1.gapA[0], GEO1.gapA[1]);
      const [bx, by] = project(c, GEO1.gapB[0], GEO1.gapB[1]);
      const ang = Math.atan2(by - ay, bx - ax);
      const head = (x: number, y: number, dir: number) => `M${x + 26 * Math.cos(dir + 2.6)},${y + 26 * Math.sin(dir + 2.6)}L${x},${y}L${x + 26 * Math.cos(dir - 2.6)},${y + 26 * Math.sin(dir - 2.6)}`;
      const mx = lerp(ax, bx, 0.5);
      const my = lerp(ay, by, 0.5);
      const ex = lerp(mx, bx, dA);
      const ey = lerp(my, by, dA);
      const sx = lerp(mx, ax, dA);
      const sy = lerp(my, ay, dA);
      items.push(
        <Svg key="dist" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.7))">
          <path d={`M${sx},${sy}L${ex},${ey}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          <path d={head(ex, ey, ang)} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={head(sx, sy, ang + Math.PI)} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>,
        <div key="dkm" style={{ position: 'absolute', left: mx, top: my, width: 0, height: 0 }}>
          <div style={{ position: 'absolute', transform: `translate(-50%,-130%) rotate(${(ang * 180) / Math.PI + (Math.cos(ang) < 0 ? 180 : 0)}deg)`, fontFamily: FONT, fontWeight: 900,
            fontSize: 70, color: '#fff', whiteSpace: 'nowrap', textShadow: '0 3px 8px rgba(0,0,0,0.9)', opacity: dA }}>3.8 किमी</div>
        </div>,
      );
    }
  }

  // ================================================================ border line between the islands (split screen → 1867 → ice)
  const borderA = Math.max(window4(t, C.d38 + 0.9, C.d38 + 1.1, C.bantwara - 0.3, C.bantwara), window4(t, C.jamkar, C.jamkar + 0.4, C.beech, C.beech + 0.4));
  if (borderA > 0)
    items.push(
      <Svg key="border" opacity={borderA} filter={glow('rgba(255,60,80,0.7)', 4, 1)}>
        <path d={GEO1.border.map((p) => lineD(c, p)).join('')} fill="none" stroke={t > C.jamkar ? '#E8283C' : '#fff'} strokeWidth={6} strokeDasharray="20 14" strokeLinecap="round" />
      </Svg>,
    );

  // ================================================================ 5. Little Diomede = USA
  const litA = window4(t, C.little - 0.05, C.little + 0.3, C.gaon - 0.1, C.gaon + 0.1);
  if (litA > 0) {
    const s = pop(t, C.little, 11, 190);
    items.push(<WavingFlag key="lit" id="lit" clipD={ringsD(c, GEO1.little)} box={boxOf(c, GEO1.little)} kind="us" t={t} opacity={litA * clamp01(s)} />);
    items.push(
      <Pin key="litl" c={c} at={add(LIT, 0, 2600)} anchor="bottom">
        <div style={{ opacity: litA, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Label text="लिटिल डायोमीडी" size={64} s={pop(t, C.little + 0.1, 11, 200)} />
          <div style={{ transform: `scale(${pop(t, C.usa2, 10, 210)})`, fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#fff', background: BLUE,
            padding: '4px 22px 8px', borderRadius: 14, boxShadow: '0 8px 18px rgba(0,0,0,0.45)' }}>अमेरिका</div>
        </div>
      </Pin>,
    );
  }

  const vpS = pop(t, C.basa - 0.05, 10, 200) * (1 - ramp(t, C.gaon - 0.25, C.gaon, easeIn));
  if (vpS > 0.01)
    items.push(
      <Pin key="vpin" c={c} at={add(LIT, -1350, -150)} anchor="bottom">
        <Img src={img('pin_village.png')} style={{ width: 230, transform: `scale(${vpS})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.55))' }} />
      </Pin>,
    );

  // ================================================================ 6. Big Diomede = Russia, soldiers
  const bigA = window4(t, C.big - 0.1, C.big + 0.25, C.bantwara - 0.1, C.bantwara + 0.2);
  if (bigA > 0) {
    const s = pop(t, C.big, 11, 190);
    items.push(<WavingFlag key="big" id="big" clipD={ringsD(c, GEO1.big)} box={boxOf(c, GEO1.big)} kind="ru" t={t} opacity={bigA * clamp01(s)} />);
    items.push(
      <Pin key="bigl" c={c} at={add(BIG, 0, 3900)} anchor="bottom">
        <div style={{ opacity: bigA, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Label text="बिग डायोमीडी" size={64} s={pop(t, C.big + 0.1, 11, 200)} />
          <div style={{ transform: `scale(${pop(t, C.rus2, 10, 210)})`, fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#fff', background: RED,
            padding: '4px 22px 8px', borderRadius: 14, boxShadow: '0 8px 18px rgba(0,0,0,0.45)' }}>रशिया</div>
        </div>
      </Pin>,
    );
    const outS = pop(t, C.rus2 - 0.1, 11, 170) * (1 - ramp(t, C.fauj - 0.3, C.fauj, easeIn));
    if (outS > 0.01)
      items.push(
        <Pin key="outpost" c={c} at={add(BIG, 300, 2400)}>
          <Img src={img('outpost_bigdiomede.png')} style={{ width: 380, opacity: bigA, transform: `scale(${outS})`, filter: 'drop-shadow(0 16px 16px rgba(0,0,0,0.55))' }} />
        </Pin>,
        <Pin key="milpin" c={c} at={add(BIG, -1300, 500)} anchor="bottom">
          <Img src={img('pin_military.png')} style={{ width: 220, opacity: bigA, transform: `scale(${pop(t, C.rus2 + 0.15, 10, 210) * (1 - ramp(t, C.fauj - 0.3, C.fauj, easeIn))})`,
            transformOrigin: '50% 100%', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.55))' }} />
        </Pin>,
      );
    const spots: [number, number][] = [[-1000, 1500], [700, -300], [-400, -2300]];
    spots.forEach(([dx, dy], i) => {
      const ss = pop(t, C.fauj - 0.15 + i * 0.16, 10, 220);
      if (ss <= 0.01) return;
      items.push(
        <Pin key={`sol${i}`} c={c} at={add(BIG, dx, dy)} anchor="bottom">
          <div style={{ position: 'relative', opacity: bigA, transform: `scale(${ss})`, transformOrigin: '50% 100%' }}>
            <Img src={img(i === 1 ? 'soldier_avatar_b.png' : 'soldier_avatar_a.png')} style={{ width: 170, display: 'block', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.55))' }} />
            {i === 1 && t > C.fauj + 0.35 && (
              <div style={{ position: 'absolute', left: 130, top: -30, transform: `scale(${pop(t, C.fauj + 0.4, 9, 230)}) rotate(-6deg)`, transformOrigin: '0% 100%',
                fontFamily: FONT, fontWeight: 900, fontSize: 52, color: '#111', background: '#fff', border: '5px solid #111', padding: '2px 20px 8px', whiteSpace: 'nowrap',
                boxShadow: '0 8px 0 rgba(0,0,0,0.35)' }}>कॉमरेड!</div>
            )}
          </div>
        </Pin>,
      );
    });
  }

  // ================================================================ 7. 1867: Alaska Russian → American
  const akA = window4(t, C.bantwara + 0.1, C.bantwara + 0.45, C.sardi + 0.1, C.sardi + 0.5);
  if (akA > 0) {
    const flipP = ramp(t, C.kharida - 0.05, C.kharida + 0.45, inOut);
    const flip = Math.max(0.04, Math.abs(Math.cos(flipP * Math.PI)));
    const akD = ringsD(c, GEO2.alaska);
    const [ax0, , ax1] = boxOf(c, GEO2.alaska);
    const acx = (ax0 + ax1) / 2;
    // Russian Alaska (red) flips like a card into American Alaska (the US flag)
    if (flipP < 0.5)
      items.push(
        <div key="akru" style={{ position: 'absolute', left: 0, top: 0, transformOrigin: `${acx}px 0px`, transform: `scaleX(${flip})` }}>
          <Neon d={akD} color={RED} a={akA} fill={0.55} />
        </div>,
      );
    else items.push(<WavingFlag key="ak1867" id="ak1867" clipD={akD} box={boxOf(c, GEO2.alaska)} kind="us" t={t} opacity={akA * 0.95} flip={flip} />);
    items.push(<Svg key="ru1867" opacity={akA * 0.5}><path d={ringsD(c, GEO2.chukotka)} fill={RED} fillOpacity={0.35} stroke={RED} strokeWidth={4} /></Svg>);
    const bd = ramp(t, C.kharida + 0.35, C.kharida + 1.2, inOut);
    if (bd > 0)
      items.push(
        <Svg key="b1867" filter={glow('rgba(255,255,255,0.9)', 5, 2)} opacity={akA}>
          <path d={GEO1.border.map((p) => lineD(c, p)).join('')} fill="none" stroke="#fff" strokeWidth={7} strokeDasharray="20 14" pathLength={1}
            style={{ strokeDasharray: `${bd} 1` }} />
        </Svg>,
      );
  }

  // ================================================================ 8. winter: the sea turns to ice, the walk
  const iceA = window4(t, C.jamkar - 0.1, C.jamkar + 0.05, C.beech - 0.1, C.beech + 0.35);
  if (iceA > 0) {
    const sweep = ramp(t, C.jamkar - 0.1, C.jamkar + 0.9, inOut);
    const tile = 9000 * MS * k;
    // diagonal sweep from the top-left corner
    const edge = lerp(-PLANE.w * 0.2, PLANE.w * 1.6, sweep);
    items.push(
      <Svg key="ice" opacity={iceA}>
        <defs>
          <pattern id="iceP" patternUnits="userSpaceOnUse" width={tile} height={tile} patternTransform={`translate(${project(c, MID[0], MID[1]).join(' ')}) rotate(12)`}>
            <image href={img('sea_ice_seamless.png')} width={tile} height={tile} preserveAspectRatio="xMidYMid slice" />
          </pattern>
          <clipPath id="iceClip"><path d={`M${-4000},${-4000}L${edge + PLANE.h * 0.6},${-4000}L${edge - PLANE.h * 0.6},${PLANE.h + 4000}L${-4000},${PLANE.h + 4000}Z`} /></clipPath>
          <mask id="iceHoles"><rect x={-4000} y={-4000} width={PLANE.w + 8000} height={PLANE.h + 8000} fill="#fff" /><path d={ringsD(c, [...GEO1.big, ...GEO1.little])} fill="#000" /></mask>
        </defs>
        <g clipPath="url(#iceClip)" mask="url(#iceHoles)">
          <rect x={-4000} y={-4000} width={PLANE.w + 8000} height={PLANE.h + 8000} fill="url(#iceP)" />
          <rect x={-4000} y={-4000} width={PLANE.w + 8000} height={PLANE.h + 8000} fill="#EAF7FF" opacity={0.38} />
        </g>
        <path d={`M${edge + PLANE.h * 0.6},${-4000}L${edge - PLANE.h * 0.6},${PLANE.h + 4000}`} stroke="#fff" strokeWidth={30} opacity={0.75 * (1 - sweep)} style={{ filter: 'blur(14px)' }} />
      </Svg>,
    );
    // frost crystals riding the freezing edge
    if (sweep > 0 && sweep < 1) {
      const x1 = edge + PLANE.h * 0.6;
      const y1 = -4000;
      const x2 = edge - PLANE.h * 0.6;
      const y2 = PLANE.h + 4000;
      const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      for (let i = 0; i < 9; i++) {
        const f = 0.28 + i * 0.06;
        items.push(
          <Img key={`fr${i}`} src={img('frost_edge.png')} style={{ position: 'absolute', width: 900, left: lerp(x1, x2, f) - 450, top: lerp(y1, y2, f) - 300,
            transform: `rotate(${ang - 90}deg)`, opacity: iceA * Math.sin(sweep * Math.PI) }} />,
        );
      }
    }
    // flags waving on the frozen islands
    const fA = ramp(t, C.jamkar + 0.4, C.jamkar + 0.8, linear) * iceA;
    items.push(<WavingFlag key="ilit" id="ilit" clipD={ringsD(c, GEO1.little)} box={boxOf(c, GEO1.little)} kind="us" t={t} opacity={fA} wave={0.7} />);
    items.push(<WavingFlag key="ibig" id="ibig" clipD={ringsD(c, GEO1.big)} box={boxOf(c, GEO1.big)} kind="ru" t={t} opacity={fA} wave={0.7} />);
    // the ice bridge glows
    const br = window4(t, C.pul - 0.05, C.pul + 0.3, C.paidal + 0.2, C.paidal + 0.8);
    if (br > 0)
      items.push(
        <Svg key="bridge" opacity={br} filter={glow('rgba(160,230,255,0.95)', 10, 2)}>
          <path d={lineD(c, [WALK_A, WALK_B])} stroke="#F4FCFF" strokeWidth={18} strokeLinecap="round" opacity={0.85} />
        </Svg>,
      );
    // walker + footprints
    const wp = ramp(t, C.paidal - 0.1, C.beech - 0.3, linear);
    if (t > C.paidal - 0.15 && wp < 1) {
      const pos: P = [lerp(WALK_A[0], WALK_B[0], wp), lerp(WALK_A[1], WALK_B[1], wp)];
      const [sa, sb] = [project(c, WALK_A[0], WALK_A[1]), project(c, WALK_B[0], WALK_B[1])];
      const dirDeg = (Math.atan2(sb[1] - sa[1], sb[0] - sa[0]) * 180) / Math.PI + 90;
      for (let i = 0; i < 6; i++) {
        const f = (i + 0.5) / 7;
        if (f > wp) break;
        items.push(
          <Pin key={`fp${i}`} c={c} at={[lerp(WALK_A[0], WALK_B[0], f), lerp(WALK_A[1], WALK_B[1], f)]}>
            <Img src={img('footprints_ice.png')} style={{ width: 92, opacity: 0.9, transform: `rotate(${dirDeg + c.rot}deg)` }} />
          </Pin>,
        );
      }
      const pose = Math.floor(t / 0.2) % 2 ? 'a' : 'b';
      items.push(
        <Pin key="walker" c={c} at={pos} anchor="bottom">
          <Img src={img(`hiker_${pose}.png`)} style={{ width: 250, filter: 'drop-shadow(0 8px 6px rgba(0,0,0,0.35))', opacity: ramp(t, C.paidal - 0.15, C.paidal + 0.1, linear),
            transform: `translateY(${Math.abs(Math.sin(t * 15.7)) * -5}px) scaleX(${sb[0] < sa[0] ? -1 : 1})` }} />
        </Pin>,
      );
    }
  }

  // ================================================================ 9. the International Date Line
  const dlA = window4(t, C.beech - 0.1, C.beech + 0.1, 99, 100);
  if (dlA > 0) {
    const g = ramp(t, C.beech, C.intl + 0.9, inOut);
    const parts = GEO1.dateline;
    const d = parts.map((p) => lineD(c, p)).join('');
    items.push(
      <Svg key="dl" opacity={dlA} filter={glow('rgba(255,255,255,0.9)', 6, 2)}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={6} pathLength={1} style={{ strokeDasharray: `${g} 1` }} strokeLinejoin="round" />
      </Svg>,
    );
    const txtA = window4(t, C.intl, C.intl + 0.35, C.yaani + 0.1, C.yaani + 0.5);
    if (txtA > 0) {
      const longest = parts.reduce((a, b) => (b.length > a.length ? b : a), parts[0]);
      items.push(
        <Svg key="dlt" opacity={txtA}>
          <defs><path id="dlp" d={lineD(c, longest)} /></defs>
          <text fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))' }}>
            <textPath href="#dlp" startOffset="18%" dy={-22}>इंटरनेशनल डेट लाइन</textPath>
          </text>
        </Svg>,
      );
    }
  }

  return <>{items}</>;
};
