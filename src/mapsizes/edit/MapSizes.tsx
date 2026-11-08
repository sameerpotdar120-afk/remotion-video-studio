import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeIn, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, CUT, Cam, DURATION_S, GEO, LOOPF, P, WORLD, WORLD_MPP, camAt, camMotion, groundCircle, lineD, merc, mercY, moveTrue, ringsD, segment, shake, toS } from './cam';
import { Clouds, Grade, HiFill, MAP_GRADE } from './Fx';
import { HAND, LABEL, SERIF, TITLE, UI, useFonts } from './font';
import { GT, GoreGlobe, SpaceBg } from './Globe';
import { MapLayers } from './Map';
import { Parchment, Ship } from './Parchment';
import sizes from '../../../public/mapsizes/img/img_sizes.json';

export const MS_DURATION_60 = Math.round(DURATION_S * 60);
const FPS = 60;
const F = (s: number) => Math.round(s * FPS);
const AUDIO = 'mapsizes/audio/mix.wav';
const IMG = (k: string) => staticFile(`mapsizes/img/${k}.png`);
const SZ = sizes as unknown as Record<string, { w: number; h: number; screen?: [number, number, number, number] }>;
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const INK = '#0B1830';
const COL = { gl: '#FFC21A', in: '#FF7A12', af: '#9BE01E', red: '#FF3B3B', white: '#F4F6FA' };

// ------------------------------------------------------------------ small parts
const Big: React.FC<{ text: string; size: number; color?: string; font?: string }> = ({ text, size, color = COL.gl, font = TITLE }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.1, color, WebkitTextStroke: `${Math.round(size / 11)}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number; font?: string }> = ({ text, color = COL.gl, size = 40, font = TITLE }) => (
  <div style={{ padding: `${size * 0.12}px ${size * 0.5}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.25, color: '#fff', whiteSpace: 'nowrap', letterSpacing: 1, boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: Math.min(860, Math.max(220, x)), top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: o }}>{children}</div>;
/** A cut-out image of width w centred at (x, y). */
const Cut: React.FC<{ k: string; x: number; y: number; w: number; o?: number; rot?: number; filter?: string; children?: React.ReactNode }> = ({ k, x, y, w, o = 1, rot = 0, filter, children }) => {
  if (o <= 0 || w <= 0) return null;
  const h = (w * SZ[k].h) / SZ[k].w;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: o, transform: `rotate(${rot}deg)` }}>
      {children}
      <Img src={IMG(k)} style={{ position: 'absolute', inset: 0, width: w, height: h, filter: filter ?? 'drop-shadow(0 18px 24px rgba(0,0,0,0.45))' }} />
    </div>
  );
};
/** N, S, E, W around a box on the map. */
const Compass4: React.FC<{ box: [number, number, number, number]; o: number }> = ({ box: [x0, y0, x1, y1], o }) => o <= 0 ? null : (
  <>
    {([['N', (x0 + x1) / 2, y0 - 44], ['S', (x0 + x1) / 2, y1 + 44], ['W', x0 - 44, (y0 + y1) / 2], ['E', x1 + 44, (y0 + y1) / 2]] as [string, number, number][]).map(([l, x, y]) => (
      <At key={l} x={x} y={y} o={o}><Big text={l} size={58} color="#fff" /></At>
    ))}
  </>
);
const bboxOf = (pts: P[]): [number, number, number, number] => [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
const ringsBox = (c: Cam, rings: P[][]) => bboxOf(rings[0].map((p) => toS(c, p)));
/** The measuring line: a glowing red dashed line drawn from a to b, its km counter riding the tip. */
const Measure: React.FC<{ c: Cam; a: P; b: P; p: number; o: number; km: number; dx?: number; dy?: number; label?: [number, number] }> = ({ c, a, b, p, o, km, dx = 0, dy = -70 }) => {
  if (p <= 0 || o <= 0) return null;
  const pts = segment(a, b, p);
  const d = lineD(c, pts);
  const [ex, ey] = toS(c, pts[1]);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: o }}>
        <defs><filter id="mglow"><feGaussianBlur stdDeviation="8" /></filter></defs>
        <path d={d} fill="none" stroke={COL.red} strokeWidth={26} filter="url(#mglow)" opacity={0.7} />
        <path d={d} fill="none" stroke="#fff" strokeWidth={11} strokeLinecap="round" />
        <path d={d} fill="none" stroke={COL.red} strokeWidth={7} strokeLinecap="round" strokeDasharray="22 12" />
        {[toS(c, pts[0]), [ex, ey]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill="#fff" stroke={COL.red} strokeWidth={5} />)}
      </svg>
      <At x={Math.min(900, Math.max(180, ex + dx))} y={ey + dy} o={o}><Tag text={`${fmt(km * p)} KM`} size={52} color={COL.red} /></At>
    </>
  );
};

// ------------------------------------------------------------------ the main satellite map
const GL_FROM: P = GEO.centroids.Greenland;
const GL_TO: P = [51.5, 27.5];
/** Greenland's true-size trip next to India (line 13) and back home for the loop. */
const glTrip = (t: number) => ramp(t, C.ablao + 0.25, C.asli + 0.9, inOut) * (1 - ramp(t, DURATION_S - 1.55, DURATION_S - 0.1, inOut));
const TISSOT: P[] = (() => { const o: P[] = []; for (const lat of [-60, -40, -20, 0, 20, 40, 60, 75]) for (let lon = -165; lon <= 165; lon += 30) o.push([lon + (lat === 75 ? 15 : 0), lat]); return o; })();

const MapVectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const s = (p: P) => toS(c, p);
  const far = c.mpp > 5000;
  // India lifted onto Greenland (line 5) and back; Greenland slid onto Africa (line 6)
  const lift = ramp(t, C.uthakar - 0.05, C.glpar + 0.55, inOut) * (1 - ramp(t, C.africa - 0.3, C.africa + 0.45, inOut));
  const [ix, iy] = s(merc(...GEO.centroids.India)), [gx, gy] = s(merc(-40, 72.5));
  const inDx = (gx - ix) * lift, inDy = (gy - iy) * lift - Math.sin(Math.PI * lift) * 120;
  const slide = t < CUT() - 0.1 ? ramp(t, C.barabar - 2.25, C.barabar - 0.75, inOut) : 0;
  const [ax, ay] = s(merc(20, 4)), [g2x, g2y] = s(merc(-41, 72));
  const glDx = (ax - g2x) * slide, glDy = (ay - g2y) * slide;
  const afOn = t > C.africa - 0.1 && t < CUT() - 0.1;
  const af = ramp(t, C.africa - 0.1, C.africa + 0.5, easeOut);
  // the true-size trip
  const trip = glTrip(t);
  const glRings = moveTrue(GEO.deg.Greenland, GL_FROM, GL_TO, trip);
  const ghost = Math.max(lift > 0.01 ? 0 : 0, trip);
  // Tissot circles
  const tis = t > CUT() ? 1 - ramp(t, C.glbeech + 0.2, C.glbeech + 0.8, linear) : 0;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="glow2"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      {far && <path d={GEO.borders.map((l) => lineD(c, l)).join('')} fill="none" stroke="#fff" strokeWidth={1.3} opacity={0.32} />}
      {/* Greenland: its home outline stays as a dashed ghost while it travels */}
      {(ghost > 0.01 || slide > 0.01) && <path d={ringsD(c, GEO.countries.Greenland)} fill="rgba(255,255,255,0.18)" stroke="#fff" strokeWidth={3} strokeDasharray="14 10" opacity={Math.max(ghost, slide * (1 - ramp(t, C.gadbad + 0.2, C.gadbad + 0.6, linear)))} />}
      {afOn && <HiFill id="af" t={t} d={ringsD(c, GEO.countries.Africa)} color={COL.af} g={af} alpha={0.62} />}
      <g transform={`translate(${glDx} ${glDy})`}><HiFill id="gl" t={t} d={ringsD(c, glRings)} color={COL.gl} alpha={0.82} edge={5} /></g>
      {lift > 0.01 && <path d={ringsD(c, GEO.countries.India)} fill="rgba(255,255,255,0.55)" stroke="#fff" strokeWidth={3} />}
      <g transform={`translate(${inDx} ${inDy}) `}>
        {lift > 0.01 && <path d={ringsD(c, GEO.countries.India)} fill="#000" opacity={0.4 * Math.sin(Math.PI * Math.min(1, lift * 1.2))} transform="translate(18 40)" filter="url(#glow2)" />}
        <HiFill id="in" t={t} d={ringsD(c, GEO.countries.India)} color={COL.in} alpha={0.75} edge={5} />
      </g>
      {tis > 0 && TISSOT.map(([lon, lat], i) => {
        const g = pop(t, C.pole - 0.25 + (Math.abs(lat) / 75) * 1.7 + ((lon + 165) / 330) * 0.25, 11, 200) * tis;
        if (g <= 0) return null;
        const pts = groundCircle(lon, lat, 650);
        const [cx, cy] = s(merc(lon, lat));
        const d = lineD(c, pts) + 'Z';
        return <path key={i} d={d} fill={Math.abs(lat) >= 60 ? 'rgba(255,90,70,0.42)' : 'rgba(255,255,255,0.32)'} stroke="#fff" strokeWidth={2.5} transform={`translate(${cx * (1 - g)} ${cy * (1 - g)}) scale(${g})`} />;
      })}
    </svg>
  );
};

const MapOverlays: React.FC<{ t: number; c: Cam; dim: number }> = ({ t, c, dim }) => {
  const s = (p: P) => toS(c, p);
  const M = GEO.measure;
  const ns = ramp(t, C.n2670 - 0.75, C.n2670 + 1.0, inOut), ew = ramp(t, C.n1050 - 0.95, C.n1050 + 0.6, inOut);
  const lines = 1 - ramp(t, C.area - 0.4, C.area, linear);
  const glBox = ringsBox(c, GEO.countries.Greenland);
  const [gx, gy] = s(merc(-41, 73)), [ix, iy] = s(merc(...GEO.centroids.India));
  const trip = glTrip(t);
  const [tx, ty] = s(merc(GL_TO[0], GL_TO[1]));
  const [afx, afy] = s(merc(20, 4));
  const head = 1 - ramp(t, C.india0 - 0.3, C.india0 + 0.1, linear) + ramp(t, DURATION_S - 0.75, DURATION_S - 0.1, linear);
  return (
    <AbsoluteFill style={{ filter: dim > 0.01 ? `brightness(${1 - 0.4 * dim}) saturate(${1 - 0.5 * dim})` : undefined }}>
      {/* frame 0 (and the loop's last frames) */}
      <At x={540} y={190} o={clamp01(head)}><Big text="भारत > ग्रीनलैंड?" size={112} color="#fff" font={UI} /></At>
      {t > C.dedh - 0.1 && t < C.gl1 + 0.2 && <At x={ix + 10} y={iy - 190} p={pop(t, C.dedh, 10, 200)} o={1 - ramp(t, C.gl1 - 0.1, C.gl1 + 0.2, linear)}><Tag text="1.5× बड़ा" size={56} color={COL.in} font={UI} /></At>}
      {t > C.chhota0 - 0.1 && t < C.gl1 + 0.2 && <At x={gx} y={gy} p={pop(t, C.chhota0, 9, 200)} o={1 - ramp(t, C.gl1 - 0.1, C.gl1 + 0.2, linear)}><Big text="?" size={240} color="#fff" /></At>}
      {/* Greenland measured: north-south, then east-west */}
      <Compass4 box={glBox} o={win(t, C.gl1 + 0.3, C.area, 0.4, 0.4) * (c.mpp < 13000 ? 1 : 0)} />
      <Measure c={c} a={M.glNS[0]} b={M.glNS[1]} p={ns} o={lines * (1 - 0.6 * ramp(t, C.ew - 0.2, C.ew + 0.3, linear))} km={2670} dx={140} dy={-10} />
      <Measure c={c} a={M.glEW[0]} b={M.glEW[1]} p={ew} o={lines} km={1050} dx={-60} dy={-80} />
      {/* the areas */}
      {t > C.n22 - 0.2 && t < C.uthakar + 0.3 && <At x={gx} y={gy + 40} p={pop(t, C.n22 - 0.1, 10, 200)} o={1 - ramp(t, C.uthakar - 0.1, C.uthakar + 0.3, linear)}><Tag text={<>22 लाख km²</>} size={58} color={COL.gl} font={UI} /></At>}
      {t > C.n33 - 0.2 && t < C.uthakar + 0.3 && <At x={ix} y={iy + 160} p={pop(t, C.n33 - 0.1, 10, 200)} o={1 - ramp(t, C.uthakar - 0.1, C.uthakar + 0.3, linear)}><Tag text={<>33 लाख km²</>} size={58} color={COL.in} font={UI} /></At>}
      {/* India on Greenland */}
      {t > C.chhota3 - 0.2 && t < C.africa + 0.1 && <At x={gx + 230} y={gy - 250} p={pop(t, C.chhota3 - 0.1, 10, 200)} o={1 - ramp(t, C.africa - 0.3, C.africa + 0.1, linear)} rot={-6}><Tag text="इतना छोटा?" size={60} color={COL.in} font={UI} /></At>}
      {/* Africa: 14 times, yet the same */}
      {t > C.n14 - 0.2 && t < C.gadbad + 0.5 && <At x={afx} y={afy + 120} p={pop(t, C.n14 - 0.05, 9, 210)} o={1 - ramp(t, C.barabar - 2.4, C.barabar - 2.1, linear)}><Big text="14×" size={190} color={COL.af} /></At>}
      {t > C.barabar - 0.2 && t < C.y1569 + 1.6 && <At x={afx + 280} y={afy - 140} p={pop(t, C.barabar - 0.1, 9, 210)} o={1 - ramp(t, C.gadbad + 0.1, C.gadbad + 0.5, linear)}><Big text="≈" size={220} color="#fff" /></At>}
      {t > C.y1569 - 0.2 && t < C.y1569 + 1.7 && <At x={540} y={250} p={pop(t, C.y1569 - 0.1, 10, 190)}><Big text="1569" size={190} color="#E9C46A" /></At>}
      {/* the stretch: ×10 on Greenland, +15% on India */}
      {t > C.n10 - 0.2 && t < C.ablao + 0.3 && <At x={gx} y={gy} p={pop(t, C.n10 - 0.1, 9, 210)} o={1 - ramp(t, C.ablao, C.ablao + 0.3, linear)}><Big text="×10" size={200} color={COL.red} /></At>}
      {t > C.n15 - 0.2 && t < C.ablao + 0.3 && <At x={ix} y={iy + 170} p={pop(t, C.n15 - 0.1, 9, 210)} o={1 - ramp(t, C.ablao, C.ablao + 0.3, linear)}><Tag text="+15%" size={70} color={COL.in} /></At>}
      {t > C.utna - 0.2 && t < C.glbeech + 0.6 && <At x={540} y={250} p={pop(t, C.utna - 0.1, 10, 190)} o={1 - ramp(t, C.glbeech + 0.2, C.glbeech + 0.6, linear)}><Tag text="ध्रुव के पास = ज़्यादा खिंचाव" size={56} color={COL.red} font={UI} /></At>}
      {/* the real Greenland next to India */}
      {trip > 0.97 && t > C.asligl - 0.2 && <At x={tx} y={ty - 250} p={pop(t, C.asligl - 0.1, 10, 200)} o={1 - ramp(t, DURATION_S - 1.6, DURATION_S - 1.3, linear)}><Tag text="असली ग्रीनलैंड" size={52} color={COL.gl} font={UI} /></At>}
      {t > C.chhota4 - 0.2 && t < DURATION_S - 1.3 && <At x={ix + 20} y={iy + 170} p={pop(t, C.chhota4 - 0.1, 10, 200)} o={1 - ramp(t, DURATION_S - 1.6, DURATION_S - 1.3, linear)}><Tag text="भारत: 33 लाख km²" size={50} color={COL.in} font={UI} /></At>}
      {t > C.chhota4 - 0.2 && t < DURATION_S - 1.3 && <At x={tx} y={ty + 190} p={pop(t, C.chhota4 + 0.15, 10, 200)} o={1 - ramp(t, DURATION_S - 1.6, DURATION_S - 1.3, linear)}><Tag text="22 लाख km²" size={44} color={COL.gl} font={UI} /></At>}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the India panel (lines 2-4, split screen)
const IN_CAM: Cam = { x: merc(82.6, 0)[0], y: mercY(22.4), mpp: 4250 };
const PANEL_TOP = 900;
const panelQ = (t: number) => ramp(t, C.in1 - 0.2, C.in1 + 0.35, inOut) * (1 - ramp(t, C.area - 0.3, C.area + 0.25, inOut));
const IndiaPanel: React.FC<{ t: number; dim: number }> = ({ t, dim }) => {
  const q = panelQ(t);
  if (q <= 0) return null;
  const c: Cam = { ...IN_CAM, mpp: IN_CAM.mpp * (1 - 0.04 * ramp(t, C.in1, C.area, linear)), x: IN_CAM.x + Math.sin(t * LOOPF(19)) * 4000 };
  const M = GEO.measure;
  const ns = ramp(t, C.n3214 - 0.6, C.n3214 + 1.2, inOut), ew = ramp(t, C.n2933 - 0.75, C.n2933 + 0.7, inOut);
  const box = ringsBox(c, GEO.countries.India);
  const top = PANEL_TOP + (1 - q) * 1100;
  return (
    <div style={{ position: 'absolute', left: 0, top, width: 1080, height: 1020, overflow: 'hidden', clipPath: 'polygon(0 70px, 100% 0, 100% 100%, 0 100%)', filter: `drop-shadow(0 -10px 20px rgba(0,0,0,0.5))` }}>
      <div style={{ position: 'absolute', left: 0, top: -450, width: 1080, height: 1920, filter: dim > 0.01 ? `brightness(${1 - 0.4 * dim}) saturate(${1 - 0.5 * dim})` : undefined }}>
        <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={c} /></AbsoluteFill>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <defs><filter id="glow"><feGaussianBlur stdDeviation="6" /></filter></defs>
          <path d={GEO.borders.map((l) => lineD(c, l)).join('')} fill="none" stroke="#fff" strokeWidth={1.4} opacity={0.3} />
          <HiFill id="inp" t={t} d={ringsD(c, GEO.countries.India)} color={COL.in} alpha={0.55} />
        </svg>
        <Compass4 box={box} o={1} />
        <Measure c={c} a={M.inNS[0]} b={M.inNS[1]} p={ns} o={1 - 0.6 * ramp(t, C.ew - 0.2, C.ew + 0.3, linear) + 0.6 * ramp(t, C.dono - 0.2, C.dono + 0.2, linear)} km={3214} dx={150} dy={30} />
        <Measure c={c} a={M.inEW[0]} b={M.inEW[1]} p={ew} o={1} km={2933} dx={-120} dy={-80} />
        {t > C.dono - 0.2 && <At x={760} y={1300} p={pop(t, C.dono, 10, 200)} rot={-4}><Tag text="दोनों तरफ़ भारत आगे" size={54} color={COL.in} font={UI} /></At>}
      </div>
      <svg width={1080} height={80} style={{ position: 'absolute', left: 0, top: 0 }}><line x1={0} y1={72} x2={1080} y2={2} stroke="#fff" strokeWidth={8} /></svg>
    </div>
  );
};

// ------------------------------------------------------------------ the parchment act (Mercator, 1569; lines 8)
const P_IN = () => C.mercator - 0.75;
const P_OUT = () => C.chha - 0.2;
const LISBON: P = [-9.14, 38.72], HAVANA: P = [-82.38, 23.13];
const pcamAt = (t: number): Cam => {
  const q = ramp(t, P_IN(), P_OUT(), linear);
  return { x: merc(-38, 0)[0] + q * 300000, y: mercY(26) + q * 150000, mpp: 15200 * (1 - 0.1 * q) };
};
const ParchmentScene: React.FC<{ t: number }> = ({ t }) => {
  const c = pcamAt(t);
  const s = (p: P) => toS(c, merc(p[0], p[1]));
  const [lx, ly] = s(LISBON), [hx, hy] = s(HAVANA);
  const line = ramp(t, C.seedhi - 0.25, C.seedhi + 0.9, inOut);
  const ang = (Math.atan2(hy - ly, hx - lx) * 180) / Math.PI; // screen angle of the route (0 = east, clockwise)
  const bearing = ang + 90; // compass bearing: 0 = north (up)
  const sail = ramp(t, C.jahaz - 0.15, P_OUT() + 0.2, inOut);
  const shipX = lx - 150 + (hx - lx + 150) * sail, shipY = ly + 40 + (hy - ly - 40) * sail;
  const portrait = win(t, C.mercator - 0.4, C.naavik + 0.4, 0.3, 0.5);
  const cmp = win(t, C.compass - 0.15, C.jahaz + 0.6, 0.2, 0.4);
  const needle = bearing * inOut(ramp(t, C.compass + 0.15, C.compass + 0.9, linear));
  const cw = 470, ch = (cw * SZ.m02_compass.h) / SZ.m02_compass.w;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Parchment c={c} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {line > 0 && <path d={`M${lx},${ly}L${lx + (hx - lx) * line},${ly + (hy - ly) * line}`} fill="none" stroke="#A8322D" strokeWidth={9} strokeDasharray="20 12" strokeLinecap="round" />}
        {t > C.ports - 0.2 && [[lx, ly, 0], [hx, hy, 0.15]].map(([x, y, d], i) => { const q = pop(t, C.ports - 0.1 + d, 10, 200); return q > 0 ? <g key={i} transform={`translate(${x} ${y}) scale(${q})`}><circle r={20} fill="#F4EBD6" stroke="#3E2C1E" strokeWidth={5} /><path d="M0 -11 V11 M-9 4 Q0 14 9 4 M-6 -6 H6" stroke="#3E2C1E" strokeWidth={4} fill="none" strokeLinecap="round" /></g> : null; })}
        {t > C.naavik - 0.2 && <g transform={`translate(${shipX} ${shipY})`}><Ship s={1.9 * pop(t, C.naavik - 0.1, 10, 190)} rock={Math.sin(t * 3) * 4} flip={sail > 0.01} /></g>}
      </svg>
      {t > C.ports && <>
        <At x={lx + 60} y={ly - 120} p={pop(t, C.ports, 10, 200)}><span style={{ fontFamily: SERIF, fontSize: 44, color: '#3E2C1E' }}>Lisbon</span></At>
        <At x={hx + 10} y={hy + 60} p={pop(t, C.ports + 0.15, 10, 200)}><span style={{ fontFamily: SERIF, fontSize: 44, color: '#3E2C1E' }}>Havana</span></At>
      </>}
      {t > C.y1569 && t < C.naavik + 0.6 && (
        <At x={540} y={250} p={t < P_IN() + 0.2 ? 1 : 1} o={1 - ramp(t, C.naavik, C.naavik + 0.5, linear)}>
          <div style={{ padding: '6px 80px', background: 'linear-gradient(180deg, #D7A848, #A87A22)', borderRadius: 8, boxShadow: '0 10px 20px rgba(70,45,20,0.45)', fontFamily: SERIF, fontSize: 130, color: '#3E2C1E', clipPath: 'polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%, 6% 50%)' }}>1569</div>
        </At>
      )}
      {portrait > 0 && (
        <>
          <Cut k="m01_mercator" x={300} y={1000 + (1 - pop(t, C.mercator - 0.4, 11, 170)) * 500} w={560} o={portrait} rot={-3} filter="drop-shadow(0 16px 22px rgba(60,40,20,0.5))" />
          <div style={{ position: 'absolute', left: 560, top: 860, width: 500, opacity: portrait, fontFamily: HAND, fontWeight: 700, fontSize: 92, lineHeight: 1.0, color: '#3E2C1E', clipPath: `inset(-20% ${(1 - ramp(t, C.mercator - 0.1, C.mercator + 0.8, linear)) * 100}% -20% -5%)` }}>Gerardus<br />Mercator</div>
          <div style={{ position: 'absolute', left: 570, top: 1080, opacity: portrait * ramp(t, C.mapb - 0.2, C.mapb + 0.2, linear), fontFamily: UI, fontWeight: 700, fontSize: 48, color: '#5A3A1A' }}>नक्शा बनाने वाला</div>
        </>
      )}
      {cmp > 0 && (
        <Cut k="m02_compass" x={790} y={1310 + (1 - pop(t, C.compass - 0.15, 11, 170)) * 400} w={cw} o={cmp} rot={4}>
          <svg width={cw} height={ch} style={{ position: 'absolute', inset: 0, overflow: 'visible', zIndex: 2 }}>
            <g transform={`translate(${cw * 0.5} ${ch * 0.655}) rotate(${needle})`}>
              <path d={`M0 ${-cw * 0.36} L14 -10 L0 0 L-14 -10 Z`} fill={COL.red} stroke="#fff" strokeWidth={3} />
              <circle r={10} fill="#fff" />
            </g>
          </svg>
        </Cut>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ "everywhere": cards, the school atlas, the phone (line 9)
const E_IN = () => P_OUT();
const E_OUT = () => GT().in;
const WORLD_SRC = staticFile('mapsizes/maps/world_geo.jpg');
const MapCard: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, height: w * 0.69, padding: 10, background: '#F4F1EA', borderRadius: 8, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
    <div style={{ width: '100%', height: '100%', backgroundImage: `url(${WORLD_SRC})`, backgroundSize: '100% 100%', filter: MAP_GRADE }} />
  </div>
);
const CARDS: [number, number, number, number][] = [[250, 420, -9, 0.2], [830, 520, 7, 0.35], [300, 1450, 6, 0.5], [800, 1380, -5, 0.65], [560, 300, 3, 0.8], [560, 1650, -3, 0.95]];
const EverywhereScene: React.FC<{ t: number }> = ({ t }) => {
  const atlas = pop(t, C.school - 0.05, 12, 150), phone = pop(t, C.google - 0.15, 12, 150);
  const aw = 1000, ah = (aw * SZ.m04_atlas.h) / SZ.m04_atlas.w;
  const pw = 600, ph = (pw * SZ.m03_phone_hand.h) / SZ.m03_phone_hand.w;
  const ax = 540, ay = 680 + (1 - atlas) * 1300;
  const px = 640 + (1 - phone) * 900, py = 1330;
  const sa = SZ.m04_atlas.screen as number[], sp = SZ.m03_phone_hand.screen as number[];
  const ka = aw / SZ.m04_atlas.w, kp = pw / SZ.m03_phone_hand.w;
  const cardsO = 1 - ramp(t, C.school - 0.2, C.school + 0.4, linear);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#071726' }}>
      <AbsoluteFill style={{ filter: `${MAP_GRADE} blur(10px) brightness(0.42)`, transform: `scale(${1.25 + 0.05 * ramp(t, E_IN(), E_OUT(), linear)})` }}><MapLayers c={{ x: merc(10, 0)[0], y: mercY(25), mpp: 26000 }} /></AbsoluteFill>
      {cardsO > 0 && <At x={540} y={960} p={pop(t, E_IN() + 0.1, 11, 170)} o={cardsO}><MapCard w={820} /></At>}
      {cardsO > 0 && CARDS.map(([x, y, r, d], i) => <At key={i} x={x} y={y} p={pop(t, E_IN() + 0.4 + d, 10, 200)} o={cardsO} rot={r}><MapCard w={380} /></At>)}
      {atlas > 0 && (
        <div style={{ position: 'absolute', left: ax - aw / 2, top: ay - ah / 2, width: aw, height: ah, transform: 'rotate(-2deg)' }}>
          <div style={{ position: 'absolute', left: sa[0] * ka, top: sa[1] * ka, width: (sa[2] - sa[0]) * ka, height: (sa[3] - sa[1]) * ka, backgroundImage: `url(${WORLD_SRC})`, backgroundSize: '100% 100%', filter: MAP_GRADE,
            WebkitMaskImage: `url(${IMG('m04_atlas_screen')})`, WebkitMaskSize: `${aw}px ${ah}px`, WebkitMaskPosition: `${-sa[0] * ka}px ${-sa[1] * ka}px`, maskImage: `url(${IMG('m04_atlas_screen')})`, maskSize: `${aw}px ${ah}px`, maskPosition: `${-sa[0] * ka}px ${-sa[1] * ka}px` }} />
          <Img src={IMG('m04_atlas')} style={{ position: 'absolute', inset: 0, width: aw, height: ah, filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.55))' }} />
        </div>
      )}
      {phone > 0 && (
        <div style={{ position: 'absolute', left: px - pw / 2, top: py - ph / 2, width: pw, height: ph, transform: 'rotate(4deg)' }}>
          <div style={{ position: 'absolute', left: sp[0] * kp, top: sp[1] * kp, width: (sp[2] - sp[0]) * kp, height: (sp[3] - sp[1]) * kp, overflow: 'hidden', background: '#0E3A57',
            WebkitMaskImage: `url(${IMG('m03_phone_hand_screen')})`, WebkitMaskSize: `${pw}px ${ph}px`, WebkitMaskPosition: `${-sp[0] * kp}px ${-sp[1] * kp}px`, maskImage: `url(${IMG('m03_phone_hand_screen')})`, maskSize: `${pw}px ${ph}px`, maskPosition: `${-sp[0] * kp}px ${-sp[1] * kp}px` }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${WORLD_SRC})`, backgroundSize: `${(sp[2] - sp[0]) * kp * 2.6}px auto`, backgroundPosition: '22% 18%', filter: MAP_GRADE }} />
            <div style={{ position: 'absolute', left: 16, right: 16, top: 26, height: 46, borderRadius: 23, background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
            <svg width={60} height={80} style={{ position: 'absolute', left: '46%', top: '42%' }} viewBox="-30 -70 60 80"><path d="M0 0 C-6 -18 -24 -30 -24 -46 A24 24 0 1 1 24 -46 C24 -30 6 -18 0 0 Z" fill={COL.red} stroke="#fff" strokeWidth={4} /><circle cy={-46} r={9} fill="#fff" /></svg>
          </div>
          <Img src={IMG('m03_phone_hand')} style={{ position: 'absolute', inset: 0, width: pw, height: ph, filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.55))' }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the globe act (lines 10-11)
const GlobeScene: React.FC<{ t: number }> = ({ t }) => {
  const g = GT();
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <SpaceBg t={t} />
      <AbsoluteFill style={{ filter: MAP_GRADE }}><GoreGlobe t={t} /></AbsoluteFill>
      {t > C.chhe - 0.2 && t < C.bichhao + 0.3 && <At x={540} y={330} p={pop(t, C.chhe - 0.1, 10, 200)} o={1 - ramp(t, C.bichhao, C.bichhao + 0.3, linear)}><Tag text="6 टुकड़े" size={70} color={COL.red} font={UI} /></At>}
      {t > C.khali - 0.2 && t < g.out && [[540, 960 - 420, 0], [540, 960 + 420, 180]].map(([x, y, r], i) => (
        <At key={i} x={x} y={y} p={pop(t, C.khali - 0.1 + i * 0.1, 10, 200)} o={1 - ramp(t, C.kheencho + 0.2, C.kheencho + 0.6, linear)} rot={r}>
          <svg width={120} height={170} viewBox="-60 -160 120 170" style={{ overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6))' }}><path d="M-20 0 V-90 H-50 L0 -158 L50 -90 H20 V0 Z" fill="#fff" stroke={COL.red} strokeWidth={6} /></svg>
        </At>
      ))}
      {t > C.kheencho - 0.2 && t < g.out + 0.2 && <At x={540} y={330} p={pop(t, C.kheencho - 0.1, 10, 200)} o={1 - ramp(t, g.out - 0.1, g.out + 0.2, linear)}><Tag text="Mercator map" size={60} color={COL.gl} /></At>}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.gadbad - 0.15, t1: C.mercator - 0.6, from: 0.3 },
  { name: 'B', t0: C.dikkat - 0.05, t1: C.namumkin + 0.1, from: 0.4 },
];
const BAND_TOP = 470;
const splitAt = (t: number) => {
  for (const w of NULL_WIN()) {
    const q = Math.min(ramp(t, w.t0 - 0.2, w.t0 + 0.2, inOut), 1 - ramp(t, w.t1 - 0.2, w.t1 + 0.2, inOut));
    if (q > 0) return { q, w };
  }
  return null;
};
const NullPanel: React.FC<{ t: number; q: number; name: string; t0: number; t1: number; from: number }> = ({ t, q, name, t0, t1, from }) => (
  <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d', borderTop: '6px solid #fff' }}>
    <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 300}px`, transform: `scale(${1.12 + 0.04 * ramp(t, t0, t1, inOut)})` }}>
      <Sequence from={F(t0 - 0.2)} durationInFrames={F(t1 - t0 + 0.6)} layout="none">
        <OffthreadVideo src={staticFile(`mapsizes/null/null_ms_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ captions, credits
const Captions: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  if (t < 0.3 || t > DURATION_S - 0.3) return null;
  let i = -1;
  for (let k = 0; k < CAPS.length; k++) if (CAPS[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = CAPS.slice(g, g + 3);
  const last = words[words.length - 1];
  if (t > last[0] + 1.2 && (!CAPS[g + 3] || t < CAPS[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 66, lineHeight: 1.25, color: '#fff',
      WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, w], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? COL.gl : '#fff' }}>{w} </span>)}
    </div>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders, land: Natural Earth (India POV)';
/** The ink wash into the parchment: overlapping circles growing from the middle. */
const washMask = (m: number) => [0, 0.08, 0.16, 0.24].map((d, i) => { const r = Math.max(0, (m - d) / (1 - d)) * 2300; const ox = [0, 160, -140, 60][i], oy = [0, -120, 90, 200][i]; return `radial-gradient(circle at ${540 + ox * m}px ${700 + oy * m}px, #000 ${r * 0.8}px, transparent ${r}px)`; }).join(',');

export const MapSizes: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const c0 = camAt(t);
  const [sx, sy] = shake(t);
  const mv = camMotion(t);
  const blur = Math.min(12, Math.hypot(mv.vx, mv.vy) * 0.05 + mv.zoom * 5);
  const split = splitAt(t);
  const off = split ? -480 * split.q : 0;
  // which scene: the map (0-47.3, 79.6-98), the parchment (46.9-60.8), everywhere (60.6-67.2), the globe (66.9-79.8)
  const wash = ramp(t, P_IN() - 0.35, P_IN() + 0.45, (q) => q * q * (3 - 2 * q));
  const whip = ramp(t, P_OUT() - 0.05, P_OUT() + 0.3, inOut);
  const toGlobe = ramp(t, E_OUT() - 0.25, E_OUT() + 0.25, inOut);
  const back = ramp(t, CUT() - 0.02, CUT() + 0.35, inOut);
  const mapOn = t < P_IN() + 0.5 || t > CUT() - 0.05;
  const parchOn = t > P_IN() - 0.4 && t < P_OUT() + 0.35;
  const everyOn = t > P_OUT() - 0.05 && t < E_OUT() + 0.3;
  const globeOn = t > E_OUT() - 0.3 && t < CUT() + 0.4;
  // the split-screen India panel dims whichever side is not being measured
  const pq = panelQ(t);
  const glActive = (t > C.ew - 0.2 && t < C.in2 - 0.2) || t > C.dono - 0.2;
  const inActive = (t > C.in1 && t < C.ew - 0.2) || t > C.in2 - 0.2;
  const dimMain = pq * (glActive ? 0 : 1);
  const dimPanel = inActive ? 0 : 1;
  const capTop = pq > 0.5 ? 1560 : split ? 860 : 1470;
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      {mapOn && (
        <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy + off}px)`, opacity: t > CUT() - 0.05 ? back : 1 }}>
          <AbsoluteFill style={{ filter: [blur > 0.6 ? `blur(${blur.toFixed(1)}px)` : '', dimMain > 0.01 ? `brightness(${1 - 0.4 * dimMain}) saturate(${1 - 0.5 * dimMain})` : ''].join(' ') || undefined }}>
            <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={c0} /></AbsoluteFill>
            <Clouds t={t} a={clamp01((c0.mpp - 3000) / 6000) * 0.8} />
            <MapVectors t={t} c={c0} />
          </AbsoluteFill>
          <Grade t={t} />
          <MapOverlays t={t} c={c0} dim={dimMain} />
          <IndiaPanel t={t} dim={dimPanel * pq} />
        </AbsoluteFill>
      )}
      {parchOn && (
        <AbsoluteFill style={{ transform: `translate(${-whip * 1080}px, ${off}px)`, filter: whip > 0.02 && whip < 0.98 ? `blur(${(Math.sin(whip * Math.PI) * 30).toFixed(1)}px)` : undefined, ...(wash < 1 ? { WebkitMaskImage: washMask(wash), maskImage: washMask(wash) } : {}) }}>
          <ParchmentScene t={t} />
          <Grade t={t} board />
        </AbsoluteFill>
      )}
      {everyOn && (
        <AbsoluteFill style={{ transform: `translate(${(1 - whip) * 1080}px, ${off}px) scale(${1 + 0.25 * toGlobe})`, opacity: 1 - toGlobe, filter: whip > 0.02 && whip < 0.98 ? `blur(${(Math.sin(whip * Math.PI) * 30).toFixed(1)}px)` : undefined }}>
          <EverywhereScene t={t} />
          <Grade t={t} board />
        </AbsoluteFill>
      )}
      {globeOn && (
        <AbsoluteFill style={{ transform: `translate(0px, ${off}px)`, opacity: Math.min(toGlobe, 1 - ramp(t, CUT() + 0.05, CUT() + 0.4, linear)) }}>
          <GlobeScene t={t} />
          <Grade t={t} board />
        </AbsoluteFill>
      )}
      {split && <NullPanel t={t} q={split.q} {...split.w} />}
      {captions && <Captions t={t} top={capTop} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={t} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
export { WORLD, WORLD_MPP, easeIn };
