import React from 'react';
import { Img, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, graphemes, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { Cam, PLANE, ppdOf, project } from './camera';
import { GEO, LINES, LonLat, RINGS, measure, slice } from './geo';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
const YELLOW = '#FFD21F';
const RED = '#FF2B3D';

// ---------------------------------------------------------------- helpers
type Ring = LonLat[];

const ringsD = (c: Cam, rings: Ring[]) => {
  let d = '';
  for (const r of rings) {
    d += 'M';
    for (let i = 0; i < r.length; i++) {
      const [x, y] = project(c, r[i][0], r[i][1]);
      d += (i ? 'L' : '') + x.toFixed(1) + ',' + y.toFixed(1);
    }
    d += 'Z';
  }
  return d;
};

const lineD = (c: Cam, pts: Ring) => {
  if (pts.length < 2) return '';
  return 'M' + pts.map(([lon, lat]) => project(c, lon, lat).map((v) => v.toFixed(1)).join(',')).join('L');
};

const MEAS = {
  hwNorth: measure(LINES.hwNorth),
  hwSouth: measure(LINES.hwSouth),
  routesSouth: LINES.routesSouth.map(measure),
  routeCross: measure(LINES.routeCross),
  routesNorth: LINES.routesNorth.map(measure),
};

const Svg: React.FC<{ children: React.ReactNode; filter?: string; opacity?: number }> = ({ children, filter, opacity = 1 }) =>
  opacity <= 0.001 ? null : (
    <svg
      width={PLANE.w}
      height={PLANE.h}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', filter, opacity }}
    >
      {children}
    </svg>
  );

/** An HTML element pinned to a lon/lat, kept upright against camera roll and tilt. */
const Pin: React.FC<{
  c: Cam;
  at: LonLat;
  children: React.ReactNode;
  anchor?: 'center' | 'bottom';
  billboard?: boolean;
  style?: React.CSSProperties;
}> = ({ c, at, children, anchor = 'center', billboard = true, style }) => {
  const [x, y] = project(c, at[0], at[1]);
  const upright = billboard ? `rotate(${-c.rot}deg) rotateX(${-c.tilt}deg)` : '';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 0,
        height: 0,
        transform: upright,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: anchor === 'center' ? 'translate(-50%, -50%)' : 'translate(-50%, -100%)',
          transformOrigin: anchor === 'center' ? '50% 50%' : '50% 100%',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const glow = (color: string, r: number, n = 2) =>
  Array.from({ length: n }, (_, i) => `drop-shadow(0 0 ${r * (i + 1)}px ${color})`).join(' ');

// ---------------------------------------------------------------- region colour over time
type RGBA = [number, number, number, number];
const GREEN: RGBA = [40, 196, 64, 0.42];
const GREEN_BRIGHT: RGBA = [52, 222, 82, 0.52];
const REDF: RGBA = [214, 28, 44, 0.55];
const DARKRED: RGBA = [150, 20, 34, 0.62];
const mix = (a: RGBA, b: RGBA, p: number): RGBA => a.map((v, i) => lerp(v, b[i], p)) as RGBA;

const regionFill = (t: number): RGBA => {
  const base: RGBA = [GREEN[0], GREEN[1], GREEN[2], GREEN[3] * ramp(t, 14.42, 15.2, linear)];
  if (t < 17.58) return base;
  if (t < 28.15) return mix(GREEN, REDF, ramp(t, 17.58, 18.2));
  if (t < 50.4) return GREEN;
  if (t < 54.4) return mix(GREEN, GREEN_BRIGHT, window4(t, 50.45, 50.8, 51.2, 51.9));
  if (t < 65.4) return mix(GREEN, GREEN_BRIGHT, ramp(t, 54.4, 55.0));
  if (t < 69.4) return mix(GREEN_BRIGHT, DARKRED, ramp(t, 65.4, 66.4) * 0.35 + ramp(t, 68.1, 68.7) * 0.4);
  return mix(mix(GREEN_BRIGHT, DARKRED, 0.75), GREEN, ramp(t, 69.4, 70.2));
};

// ---------------------------------------------------------------- the layers
export const Overlays: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const k = ppdOf(c);
  const items: React.ReactNode[] = [];

  // --- continents (8.5–12.5)
  const naA = 0.5 * window4(t, 8.45, 8.75, 9.6, 10.4) + 0.16 * window4(t, 10.0, 10.4, 11.8, 12.6);
  const saA = 0.5 * window4(t, 9.5, 9.8, 10.7, 11.4) + 0.16 * window4(t, 11.0, 11.4, 11.8, 12.6);
  if (naA > 0 || saA > 0) {
    items.push(
      <Svg key="cont" filter={glow('rgba(120,210,255,0.8)', 8)}>
        <path d={ringsD(c, RINGS.north)} fill={`rgba(95,195,255,${naA})`} stroke={`rgba(200,240,255,${naA * 1.4})`} strokeWidth={2} />
        <path d={ringsD(c, RINGS.south)} fill={`rgba(95,195,255,${saA})`} stroke={`rgba(200,240,255,${saA * 1.4})`} strokeWidth={2} />
      </Svg>,
    );
  }

  // --- Panama + Colombia (34.1–37.2)
  const bordersA = 1 - ramp(t, 36.7, 37.2, linear);
  if (t > 34.05 && bordersA > 0) {
    const pP = ramp(t, 34.1, 34.8, inOut);
    const pC = ramp(t, 34.75, 35.6, inOut);
    items.push(
      <Svg key="borders" opacity={bordersA} filter={glow('rgba(255,255,255,0.55)', 5)}>
        <path d={ringsD(c, RINGS.colombia)} fill={`rgba(120,62,24,${0.38 * pC})`} stroke="rgba(255,255,255,0.9)" strokeWidth={3}
          pathLength={1} strokeDasharray={`${pC} 1`} />
        <path d={ringsD(c, RINGS.panama)} fill={`rgba(255,255,255,${0.16 * pP})`} stroke="rgba(255,255,255,0.95)" strokeWidth={3}
          pathLength={1} strokeDasharray={`${pP} 1`} />
      </Svg>,
    );
  }

  // --- the Darién region
  const [fr, fg, fb, fa] = regionFill(t);
  const outlineP = t < 28.15 ? ramp(t, 14.42, 15.4, inOut) : 1;
  const regionOn = (t > 14.4 && t < 40.6) || t > 49.0;
  if (regionOn && fa > 0.01) {
    const isRed = t > 17.9 && t < 28.15;
    const white = t > 36.7 && t < 40.6;
    const stroke = isRed ? '#FF8A93' : white ? '#FFFFFF' : '#B8FFC6';
    const glowC = isRed ? 'rgba(255,40,60,0.95)' : white ? 'rgba(255,255,255,0.9)' : 'rgba(60,255,110,0.85)';
    const pulse = 1 + 0.5 * window4(t, 50.45, 50.7, 51.0, 51.8) + 0.4 * window4(t, 60.2, 60.4, 60.7, 61.2);
    const d = ringsD(c, RINGS.region);
    items.push(
      <svg key="regionTint" width={PLANE.w} height={PLANE.h}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', mixBlendMode: 'hard-light' }}>
        <path d={d} fill={`rgba(${fr},${fg},${fb},${Math.min(1, fa * 1.7)})`} />
      </svg>,
      <Svg key="region" filter={glow(glowC, 9 * pulse, 2)}>
        <path d={d} fill={`rgba(${fr},${fg},${fb},${fa * 0.25})`} />
        <path d={d} fill="none" stroke={stroke} strokeWidth={white ? 4 : 3} strokeLinejoin="round"
          pathLength={1} strokeDasharray={`${outlineP} 1`} />
      </Svg>,
    );
  }

  // --- Pan-American Highway, dashed in the hook, solid from 20.4
  const dashedA = 1 - ramp(t, 13.0, 13.8, linear);
  if (t < 13.8) {
    const pN = ramp(t, 0.15, 3.7, inOut);
    const pS = ramp(t, 3.0, 4.5, inOut);
    const bright = 1 + 0.6 * window4(t, 10.6, 10.8, 11.2, 11.7);
    items.push(
      <Svg key="hwd" opacity={dashedA} filter={glow(`rgba(255,190,0,${0.8 * bright})`, 5 * bright)}>
        <path d={lineD(c, slice(LINES.hwNorth, MEAS.hwNorth, pN))} fill="none" stroke={YELLOW} strokeWidth={8}
          strokeDasharray="18 12" strokeLinecap="round" strokeLinejoin="round" />
        <path d={lineD(c, slice(LINES.hwSouth, MEAS.hwSouth, pS))} fill="none" stroke={YELLOW} strokeWidth={8}
          strokeDasharray="18 12" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>,
    );
  }
  const solidA = ramp(t, 20.4, 20.9, linear) * (1 - ramp(t, 26.3, 27.0, linear));
  if (solidA > 0) {
    items.push(
      <Svg key="hws" opacity={solidA} filter={glow('rgba(255,190,0,0.9)', 6)}>
        <path d={lineD(c, LINES.hwNorth)} fill="none" stroke={YELLOW} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        <path d={lineD(c, LINES.hwSouth)} fill="none" stroke={YELLOW} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>,
    );
  }

  // --- migrant routes (49.8–55.2)
  const routesA = ramp(t, 49.8, 50.1, linear) * (1 - ramp(t, 54.5, 55.2, linear));
  if (t > 49.8 && routesA > 0) {
    const ps = LINES.routesSouth.map((r, i) => slice(r, MEAS.routesSouth[i], ramp(t, 49.9 + i * 0.15, 51.4 + i * 0.1, inOut)));
    const pc = slice(LINES.routeCross, MEAS.routeCross, ramp(t, 51.1, 52.4, inOut));
    const pn = LINES.routesNorth.map((r, i) => slice(r, MEAS.routesNorth[i], ramp(t, 52.4 + i * 0.2, 54.1, inOut)));
    items.push(
      <Svg key="routes" opacity={routesA} filter={glow('rgba(255,255,255,0.75)', 4)}>
        {[...ps, pc, ...pn].map((pts, i) => (
          <path key={i} d={lineD(c, pts)} fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Svg>,
    );
  }

  // --- 160 km arrow (28.3–30.9)
  if (t > 28.25 && t < 31.0) {
    const p = ramp(t, 28.3, 29.4, easeOut);
    const [a, b] = GEO.arrow;
    const mid: LonLat = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const A = project(c, lerp(mid[0], a[0], p), lerp(mid[1], a[1], p));
    const B = project(c, lerp(mid[0], b[0], p), lerp(mid[1], b[1], p));
    const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
    const head = (P: number[], dir: number) => {
      const s = 26;
      const a1 = ang + dir * Math.PI + 0.45;
      const a2 = ang + dir * Math.PI - 0.45;
      return `M${P[0] + Math.cos(a1) * s},${P[1] + Math.sin(a1) * s}L${P[0]},${P[1]}L${P[0] + Math.cos(a2) * s},${P[1] + Math.sin(a2) * s}`;
    };
    items.push(
      <Svg key="arrow" opacity={ramp(t, 28.25, 28.4, linear)} filter="drop-shadow(0 0 6px rgba(0,0,0,0.6))">
        <path d={`M${A[0]},${A[1]}L${B[0]},${B[1]}`} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
        <path d={head(A, 1) + head(B, 0)} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>,
    );
    let deg = (ang * 180) / Math.PI;
    if (deg > 90) deg -= 180;
    if (deg < -90) deg += 180;
    const km = Math.round(160 * ramp(t, 28.3, 29.6, easeOut));
    const m = project(c, mid[0], mid[1]);
    const nx = -Math.sin((deg * Math.PI) / 180) * 58;
    const ny = Math.cos((deg * Math.PI) / 180) * -58;
    items.push(
      <div key="arrowlbl" style={{
        position: 'absolute', left: m[0] + nx, top: m[1] + ny, transform: `translate(-50%,-50%) rotate(${deg}deg)`,
        fontFamily: FONT, fontWeight: 800, fontSize: 70, color: '#fff', whiteSpace: 'nowrap',
        textShadow: '0 3px 10px rgba(0,0,0,0.7)', opacity: ramp(t, 28.3, 28.5, linear),
      }}>
        {km} किमी
      </div>,
    );
  }

  // --- gap X (4.95–13.7)
  if (t > 4.9 && t < 13.7) {
    const g: LonLat = [(GEO.hwGap[0][0] + GEO.hwGap[1][0]) / 2, (GEO.hwGap[0][1] + GEO.hwGap[1][1]) / 2];
    const s0 = pop(t, 4.95, 9, 190);
    const pulse = 1 + 0.35 * Math.abs(kick(t, 7.64, 1, 14, 6)) + 0.5 * Math.abs(kick(t, 11.68, 1, 14, 6));
    const split = ramp(t, 12.82, 13.15, inOut);
    const fly = ramp(t, 12.95, 13.6, easeOut) * 260;
    const fade = 1 - ramp(t, 13.3, 13.7, linear);
    const bar = (rot: number, dir: number) => (
      <div style={{
        position: 'absolute', left: 0, top: 0, width: lerp(92, 26, split), height: 26, borderRadius: 13,
        background: '#fff', boxShadow: '0 0 14px 6px rgba(255,40,60,0.95), 0 0 40px 16px rgba(255,30,50,0.6)',
        transform: `translate(-50%,-50%) translateX(${dir * (fly + split * 22)}px) rotate(${lerp(rot, 0, split)}deg)`,
      }} />
    );
    items.push(
      <Pin key="x" c={c} at={g}>
        <div style={{ position: 'relative', width: 0, height: 0, transform: `scale(${s0 * pulse})`, opacity: fade }}>
          {bar(45, -1)}
          {bar(-45, 1)}
        </div>
      </Pin>,
    );
  }

  // --- gap end markers (22.7–26.8)
  const endA = 1 - ramp(t, 26.4, 26.8, linear);
  if (t > 22.65 && endA > 0) {
    for (const [i, at] of GEO.hwGap.entries()) {
      const s = pop(t, 22.7 + i * 0.12);
      const ph = ((t - 22.7) % 1.2) / 1.2;
      items.push(
        <Pin key={`end${i}`} c={c} at={at}>
          <div style={{ position: 'relative', opacity: endA, transform: `scale(${s})` }}>
            {[0, 0.5].map((o) => {
              const q = (ph + o) % 1;
              return (
                <div key={o} style={{
                  position: 'absolute', left: -50 * (0.4 + q), top: -50 * (0.4 + q), width: 100 * (0.4 + q), height: 100 * (0.4 + q),
                  borderRadius: '50%', border: `5px solid ${RED}`, opacity: 1 - q, boxShadow: `0 0 18px ${RED}`,
                }} />
              );
            })}
            <div style={{ position: 'absolute', left: -11, top: -11, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: `0 0 16px 6px ${RED}` }} />
          </div>
        </Pin>,
      );
    }
  }

  // --- skull (18.1–28.15)
  if (t > 18.05 && t < 28.15) {
    const s = pop(t, 18.1, 10, 160) * (1 + 0.05 * Math.sin(t * 5));
    const size = Math.max(46, Math.min(370, k * 0.68));
    items.push(
      <Pin key="skull" c={c} at={GEO.regionCenter}>
        <Img src={staticFile('darien/img/icon_skull.png')} style={{
          width: size, height: size, transform: `scale(${s})`,
          filter: 'drop-shadow(0 0 10px rgba(255,60,80,0.95)) drop-shadow(0 0 28px rgba(255,20,40,0.8))',
        }} />
      </Pin>,
    );
  }

  // --- Panama / Colombia typed labels
  if (t > 34.15 && bordersA > 0) {
    const typed = (s: string, t0: number, t1: number) => {
      const g = graphemes(s);
      return g.slice(0, Math.ceil(g.length * ramp(t, t0, t1, linear))).join('');
    };
    items.push(
      <Pin key="lp" c={c} at={GEO.panamaLabel}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 56, color: '#fff', opacity: bordersA, whiteSpace: 'nowrap',
          textShadow: '0 0 12px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.9)', letterSpacing: 2 }}>{typed('पनामा', 34.15, 34.6)}</div>
      </Pin>,
      <Pin key="lc" c={c} at={GEO.colombiaLabel}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 56, color: '#FFD36A', opacity: bordersA, whiteSpace: 'nowrap',
          textShadow: '0 0 12px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.9)', letterSpacing: 2 }}>{typed('कोलंबिया', 34.85, 35.4)}</div>
      </Pin>,
    );
  }

  // --- Pan-American Highway label (21.0–22.9)
  if (t > 21.0 && t < 22.95) {
    const g = graphemes('पैन-अमेरिकन हाईवे');
    const a = 1 - ramp(t, 22.5, 22.9, linear);
    items.push(
      <Pin key="hwlbl" c={c} at={[-84, 26]}>
        <div style={{ transform: 'perspective(700px) rotateY(-18deg) rotate(-14deg)', whiteSpace: 'nowrap', opacity: a }}>
          {g.map((ch, i) => {
            const s = pop(t, 21.05 + i * 0.03, 12, 220);
            return (
              <span key={i} style={{
                display: 'inline-block', fontFamily: FONT, fontWeight: 800, fontSize: 66, color: '#fff',
                transform: `translateY(${(1 - s) * 30}px)`, opacity: clamp01(s),
                textShadow: '0 0 10px rgba(80,220,255,0.9), 0 0 28px rgba(40,170,255,0.7), 0 3px 8px rgba(0,0,0,0.6)',
              }}>{ch === ' ' ? ' ' : ch}</span>
            );
          })}
        </div>
      </Pin>,
    );
  }

  // --- clouds (38.84–40.6)
  if (t > 38.8) {
    const cl: { at: LonLat; w: number; img: number; d: number }[] = [
      { at: [GEO.regionCenter[0] - 0.35, GEO.regionCenter[1] + 0.6], w: 1.15, img: 2, d: 0 },
      { at: [GEO.regionCenter[0] + 0.3, GEO.regionCenter[1] + 0.25], w: 1.25, img: 3, d: 0.15 },
      { at: [GEO.regionCenter[0] - 0.3, GEO.regionCenter[1] - 0.3], w: 1.35, img: 1, d: 0.3 },
      { at: [GEO.regionCenter[0] + 0.25, GEO.regionCenter[1] - 0.8], w: 1.1, img: 4, d: 0.45 },
    ];
    const a = 1 - ramp(t, 40.45, 40.7, linear);
    if (a > 0) {
      for (const [i, q] of cl.entries()) {
        const s = pop(t, 38.84 + q.d, 14, 120);
        const drift = (t - 38.84) * 0.05;
        items.push(
          <Pin key={`cl${i}`} c={c} at={[q.at[0] + drift, q.at[1]]}>
            <Img src={staticFile(`darien/img/cloud_0${q.img}.png`)} style={{
              width: q.w * k, transform: `scale(${0.4 + 0.6 * s})`, opacity: clamp01(s) * a * 0.96,
              filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.45))',
            }} />
          </Pin>,
        );
      }
    }
  }

  // --- people dots (54.6–59.9)
  if (t > 54.55 && t < 60.0) {
    for (const [i, d] of GEO.dots.entries()) {
      const t0 = 54.6 + d.delay;
      const s = pop(t, t0, 12, 200);
      if (s <= 0) continue;
      const m = ramp(t, t0, 59.5, linear);
      const at: LonLat = [lerp(d.x0, d.x1, m), lerp(d.y0, d.y1, m)];
      const dieT = 57.3 + d.delay * 0.8;
      const red = d.dies ? ramp(t, dieT, dieT + 0.25, linear) : 0;
      const gone = d.dies ? ramp(t, dieT + 0.5, dieT + 1.1, linear) : ramp(t, 59.5, 59.9, linear);
      const col = red > 0.5 ? RED : '#62CDFF';
      items.push(
        <Pin key={`dot${i}`} c={c} at={at}>
          <div style={{
            width: 20, height: 20, background: col, transform: `rotate(45deg) scale(${s * (1 + red * 0.4)})`,
            borderRadius: 3, opacity: 1 - gone, boxShadow: `0 0 10px 3px ${col}, 0 0 2px 1px #fff inset`,
          }} />
        </Pin>,
      );
    }
  }

  // --- wildlife pins (61.08–62.9)
  if (t > 61.0 && t < 62.95) {
    const pins: { img: string; at: LonLat; t0: number }[] = [
      { img: 'pin_snake', at: [GEO.regionCenter[0] - 0.3, GEO.regionCenter[1] + 0.5], t0: 61.08 },
      { img: 'pin_jaguar', at: [GEO.regionCenter[0] - 0.5, GEO.regionCenter[1] + 0.0], t0: 61.38 },
      { img: 'pin_mosquito', at: [GEO.regionCenter[0] + 0.2, GEO.regionCenter[1] + 0.2], t0: 61.68 },
      { img: 'pin_snake', at: [GEO.regionCenter[0] - 0.1, GEO.regionCenter[1] - 0.5], t0: 61.95 },
    ];
    const out = 1 - ramp(t, 62.6, 62.9, easeIn);
    for (const [i, p] of pins.entries()) {
      const s = pop(t, p.t0, 9, 210) * out;
      if (s <= 0) continue;
      items.push(
        <Pin key={`pin${i}`} c={c} at={p.at} anchor="bottom">
          <Img src={staticFile(`darien/img/${p.img}.png`)} style={{
            width: 190, marginBottom: -12, transform: `translateY(${Math.sin((t - p.t0) * 4) * 5}px) scale(${s})`,
            transformOrigin: '50% 90%', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.5))',
          }} />
        </Pin>,
      );
    }
  }

  // --- danger radar (65.0–69.9)
  const dangerA = 1 - ramp(t, 69.4, 69.9, linear);
  if (t > 64.95 && dangerA > 0) {
    const boost = 1 + 0.45 * ramp(t, 68.1, 68.6, easeOut);
    for (const [i, d] of GEO.danger.entries()) {
      const t0 = i < 4 ? 65.0 + i * 0.32 : 67.14 + (i - 4) * 0.28;
      const s = pop(t, t0, 10, 200);
      if (s <= 0) continue;
      const r = d.r * boost;
      items.push(
        <Pin key={`dg${i}`} c={c} at={[d.x, d.y]}>
          <div style={{ position: 'relative', opacity: dangerA, transform: `scale(${s})` }}>
            {[0, 0.5].map((o) => {
              const q = ((t - t0) / 1.4 + o) % 1;
              const R = (20 + 70 * q) * r;
              return <div key={o} style={{ position: 'absolute', left: -R, top: -R, width: 2 * R, height: 2 * R, borderRadius: '50%',
                border: `4px solid rgba(255,40,50,${0.9 * (1 - q)})`, background: `rgba(255,30,40,${0.18 * (1 - q)})` }} />;
            })}
            <div style={{ position: 'absolute', left: -13 * r, top: -13 * r, width: 26 * r, height: 26 * r, borderRadius: '50%',
              background: '#FF2433', boxShadow: '0 0 16px 6px rgba(255,30,40,0.9)' }} />
          </div>
        </Pin>,
      );
    }
  }

  // --- trees growing out of the map (69.5–)
  if (t > 69.45) {
    for (const [i, tr] of GEO.trees.entries()) {
      const s = pop(t, 69.5 + i * 0.07, 11, 150);
      if (s <= 0) continue;
      items.push(
        <Pin key={`tr${i}`} c={c} at={[tr.x, tr.y]} anchor="bottom">
          <Img src={staticFile(`darien/img/tree_0${tr.k}.png`)} style={{
            width: k * 0.5 * tr.s, transform: `scale(${s})`, transformOrigin: '50% 95%', marginBottom: -k * 0.02,
            filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))',
          }} />
        </Pin>,
      );
    }
    // the scared face sits in front of the trees
    const s = pop(t, 69.8, 10, 170);
    const swap = t >= 70.38;
    const squash = swap ? 1 + 0.18 * Math.exp(-(t - 70.38) * 8) * Math.cos((t - 70.38) * 30) : 1;
    items.push(
      <Pin key="emoji" c={c} at={[GEO.regionCenter[0] - 0.05, GEO.regionCenter[1] - 0.15]} anchor="bottom">
        <Img src={staticFile(`darien/img/${swap ? 'emoji_hand_mouth' : 'emoji_worried'}.png`)} style={{
          width: 360, transform: `translateY(${Math.sin(t * 3.2) * 8 - 80}px) scale(${s * squash}, ${s / squash})`,
          filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.5))',
        }} />
      </Pin>,
    );
  }

  return <>{items}</>;
};
