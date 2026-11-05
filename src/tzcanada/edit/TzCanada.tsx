import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, Cam, DURATION_S, GEO, LOOPF, NA, NA_MPP, P, camAt, camMotion, merc, ringsD, shake, tiltAt, toS } from './cam';
import { LABEL, TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';

export const TZ_DURATION_60 = Math.round(DURATION_S * 60);
const FPS = 60;
const F = (s: number) => Math.round(s * FPS);
const AUDIO = 'tzcanada/audio/mix.wav';
const IMG = (k: string) => staticFile(`tzcanada/img/${k}`);
const RED = '#E2333A', GOLD = '#FFD23F', INK = '#0A0F16';
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));

// ------------------------------------------------------------------ zone colours and clock times
/** One colour per offset band (standard time): Alaska, Pacific, Mountain, Central, Eastern, Atlantic, Newfoundland. */
const BAND: Record<string, string> = { '-10': '#6FC8FF', '-9': '#6FC8FF', '-8': '#3DDC84', '-7': '#FF9F1C', '-6': '#FF4D5E', '-5': '#FFD23F', '-4': '#B57BFF', '-3.5': '#FF7BD5' };
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixC = (a: string, b: string, m: number) => { const x = hex(a), y = hex(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * m)).join(',')})`; };
/** The clock when it is 18:00 UTC. */
const clockOf = (off: number) => {
  const m = (18 + off) * 60, h = Math.floor(m / 60), mm = m - h * 60;
  return `${((h + 11) % 12) + 1}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${h >= 12 ? 'PM' : 'AM'}`;
};
const utcOf = (off: number) => `UTC${off < 0 ? '−' : '+'}${Math.floor(Math.abs(off))}${Math.abs(off) % 1 ? ':30' : ''}`;
const LL = (lon: number, lat: number) => merc(lon, lat);

// ------------------------------------------------------------------ small parts
export const TwoTone: React.FC<{ a: string; b?: string; size?: number }> = ({ a, b, size = 64 }) => (
  <div style={{ display: 'inline-block', fontFamily: TITLE, fontSize: size, lineHeight: 1.05, color: '#fff', whiteSpace: 'nowrap', letterSpacing: 1,
    WebkitTextStroke: `${Math.round(size / 9)}px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
    {a}{b && <> <span style={{ color: GOLD }}>{b}</span></>}
  </div>
);
export const Pin: React.FC<{ t: number; t0: number; x: number; y: number; size?: number; label?: React.ReactNode; side?: 1 | -1 }> = ({ t, t0, x, y, size = 110, label, side = 1 }) => {
  if (t < t0) return null;
  const d = t - t0;
  const fall = d < 0.12 ? -260 * (1 - d / 0.12) ** 2 : 0;
  const sq = d >= 0.12 ? 1 - 0.22 * Math.exp(-(d - 0.12) * 18) * Math.cos((d - 0.12) * 38) : 1;
  const ring = clamp01((d - 0.12) / 0.35);
  const lab = pop(t, t0 + 0.15, 12, 170);
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      <div style={{ position: 'absolute', left: -size * 0.9 * ring, top: -size * 0.3 * ring, width: size * 1.8 * ring, height: size * 0.6 * ring, borderRadius: '50%', border: `${5 * (1 - ring)}px solid rgba(255,255,255,${1 - ring})` }} />
      <svg width={size} height={size * 1.35} viewBox="0 0 40 54" style={{ position: 'absolute', left: -size / 2, top: -size * 1.35 + fall, transform: `scaleY(${sq}) scaleX(${2 - sq})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.5))' }}>
        <path d="M20 53 C20 53 3 31 3 19 A17 17 0 0 1 37 19 C37 31 20 53 20 53 Z" fill={RED} stroke="#fff" strokeWidth={3} />
        <circle cx={20} cy={19} r={6.5} fill="#fff" />
      </svg>
      {label && (
        <div style={{ position: 'absolute', top: -size * 1.75, ...(side === 1 ? { left: -size * 0.2 } : { right: -size * 0.2 }), opacity: Math.min(1, lab), transform: `translateY(${(1 - lab) * 26}px) scale(${0.7 + 0.3 * lab})`, transformOrigin: side === 1 ? '0% 100%' : '100% 100%' }}>{label}</div>
      )}
    </div>
  );
};
/** A boxed tag (UTC offset or clock time) that pops in and can flip to new text. */
const Tag: React.FC<{ t: number; t0: number; x: number; y: number; text: string; text2?: string; flipAt?: number; color: string; size?: number; o?: number }> = ({ t, t0, x, y, text, text2, flipAt, color, size = 34, o = 1 }) => {
  if (t < t0 || o <= 0) return null;
  const p = pop(t, t0, 11, 190);
  let sx = 1, label = text;
  if (text2 && flipAt != null && t > flipAt - 0.1) {
    const q = clamp01((t - (flipAt - 0.1)) / 0.2);
    sx = Math.abs(Math.cos(q * Math.PI));
    label = q < 0.5 ? text : text2;
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) scaleY(${sx})`, opacity: o }}>
      <div style={{ padding: `${size * 0.12}px ${size * 0.45}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: TITLE, fontSize: size, color: '#fff', whiteSpace: 'nowrap', letterSpacing: 1, boxShadow: `0 0 ${size * 0.6}px ${color}66, 0 8px 18px rgba(0,0,0,0.5)` }}>{label}</div>
    </div>
  );
};
/** A wall-clock icon: the creator's clock face (t01) with code-drawn hands; angles in degrees from 12. */
export const Clock: React.FC<{ size: number; hour: number; minute: number; style?: React.CSSProperties }> = ({ size, hour, minute, style }) => (
  <div style={{ position: 'absolute', width: size, height: size * 1.034, ...style }}>
    <Img src={IMG('t01_wall_clock.png')} style={{ width: size, height: size * 1.034 }} />
    <svg width={size} height={size * 1.034} viewBox="0 0 100 103.4" style={{ position: 'absolute', left: 0, top: 0 }}>
      <g transform="translate(50 51.7)">
        <line x1={0} y1={6} x2={0} y2={-22} stroke="#14181f" strokeWidth={4.6} strokeLinecap="round" transform={`rotate(${hour})`} />
        <line x1={0} y1={8} x2={0} y2={-33} stroke="#14181f" strokeWidth={2.8} strokeLinecap="round" transform={`rotate(${minute})`} />
        <line x1={0} y1={9} x2={0} y2={-35} stroke={RED} strokeWidth={1.1} strokeLinecap="round" transform={`rotate(${minute * 12})`} />
        <circle r={3.2} fill="#B08A3E" />
      </g>
    </svg>
  </div>
);
const Padlock: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={IMG('t05_padlock.png')} style={{ position: 'absolute', width: size * 0.754, height: size, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.55))', ...style }} />
);
/** A white ring that pulses out from a point (the reference's ring pulses). */
const Pulse: React.FC<{ t: number; t0: number; x: number; y: number; r?: number; n?: number }> = ({ t, t0, x, y, r = 70, n = 2 }) => {
  if (t < t0) return null;
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const q = (t - t0 - k * 0.35) / 0.9;
        if (q < 0 || q > 1) return null;
        const e = 1 - (1 - q) ** 3;
        return <div key={k} style={{ position: 'absolute', left: x - r * e, top: y - r * e, width: 2 * r * e, height: 2 * r * e, borderRadius: '50%', border: `${6 * (1 - q) + 1}px solid rgba(255,255,255,${1 - q})` }} />;
      })}
      <div style={{ position: 'absolute', left: x - 11, top: y - 11, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 0 16px #fff', transform: `scale(${pop(t, t0, 10, 200)})` }} />
    </>
  );
};
const QMark: React.FC<{ t: number; t0: number; x: number; y: number; size: number; rot: number }> = ({ t, t0, x, y, size, rot }) => {
  if (t < t0) return null;
  const p = pop(t, t0, 9, 210);
  const bob = Math.sin((t - t0) * 5 + x) * 8;
  return <div style={{ position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, fontFamily: TITLE, fontSize: size, color: '#fff', WebkitTextStroke: `${size / 12}px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 10px 24px rgba(0,0,0,0.6)' }}>?</div>;
};

// ------------------------------------------------------------------ the zone map
/** How the zones look at time t: their opacity, how far each has moved from its old colour to its new one, the pale wash. */
const zoneLook = (t: number) => {
  // line 2: develops west first; dims for the distance (line 4) and the close-up; off for the provinces (line 8)
  let o = ramp(t, C.map2 - 2.0, C.map2 - 0.6, linear);
  o *= 1 - ramp(t, C.end6 + 0.1, C.end6 + 0.4, linear) * (1 - ramp(t, C.ulta3 + 0.05, C.ulta3 + 0.3, linear)); // under the clock
  o *= 1 - 0.7 * win(t, C.doori4 + 0.3, C.same4 + 0.2, 0.6, 0.4);
  o *= 1 - win(t, C.ulta5 + 0.3, C.clocks5 + 0.1, 0.4, 0.4);
  o *= 1 - 0.6 * win(t, C.train6 - 0.2, C.aise7 + 0.2, 0.4, 0.4);
  o *= 1 - win(t, C.bc8 - 0.4, C.khisak9 + 0.05, 0.4, 0.05);
  o *= 1 - ramp(t, DURATION_S - 0.85, DURATION_S - 0.1, inOut);
  // new colours from the night of 1 November; straight again in March; weird again 'til then'
  const toNew = Math.min(ramp(t, C.ulta3 + 0.2, C.ulta3 + 0.9, inOut), 1 - ramp(t, C.seedha10, C.seedha10 + 0.6, inOut) * (1 - ramp(t, C.tabtak10, C.tabtak10 + 0.4, inOut)));
  const slip = t > C.khisak9 ? ramp(t, C.khisak9 + 0.25, C.khisak9 + 0.55, inOut) : 1;
  const pale = win(t, C.map2 - 2.4, C.map2 - 0.4, 0.3, 1.2);
  return { o, toNew: t > C.khisak9 && t < C.march10 ? slip : toNew, pale, slipX: t > C.khisak9 && t < C.khisak9 + 0.6 ? 50 * (1 - slip) * clamp01((t - C.khisak9) / 0.1) : 0 };
};
const BAND_ORDER = (z: number) => (z + 10) / 6.5;

export const ZoneMap: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const L = zoneLook(t);
  const zoomK = 0.55 + 0.45 * clamp01((c.mpp - 600) / 2500);
  const countries = [...GEO.countries.Canada, ...GEO.countries['United States of America']];
  const showA1 = Math.max(L.o, L.pale, win(t, C.bc8 - 0.3, C.baaki9 + 0.3, 0.4, 0.4) * 0.7);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.22" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      {L.pale > 0 && <path d={ringsD(c, countries)} fill="#F6EEDC" opacity={L.pale * 0.62} />}
      {L.o > 0 && (
        <g transform={`translate(${L.slipX} 0)`}>
          {GEO.zones.map((z, i) => {
            const dev = clamp01((t - (C.map2 - 2.0) - BAND_ORDER(z.z0) * 0.9) / 0.45);
            const col = z.z0 === z.z1 ? BAND[String(z.z0)] : mixC(BAND[String(z.z0)], BAND[String(z.z1)], L.toNew);
            const flash = z.z0 !== z.z1 ? Math.max(win(t, C.ulta3 + 0.2, C.ulta3 + 1.0, 0.1, 0.6), win(t, C.khisak9 + 0.25, C.khisak9 + 0.9, 0.1, 0.6)) : 0;
            const d = ringsD(c, z.rings);
            return (
              <g key={i} opacity={L.o * dev}>
                <path d={d} fill={col} opacity={0.62 * zoomK} />
                <path d={d} fill="#fff" opacity={flash * 0.5} />
                <path d={d} fill="url(#sheen)" />
              </g>
            );
          })}
        </g>
      )}
      {showA1 > 0 && <path d={ringsD(c, Object.values(GEO.admin1).flat())} fill="none" stroke="#fff" strokeWidth={1.3} opacity={0.4 * showA1} />}
      {Math.max(L.o, L.pale) > 0 && <path d={ringsD(c, countries)} fill="none" stroke="#fff" strokeWidth={3} opacity={0.85 * Math.max(L.o, L.pale)} />}
    </svg>
  );
};

// tag spots, by band: where the UTC / clock tag sits
const TAGS: [number, number, number][] = [[-9, -152, 63.5], [-8, -120.3, 40.5], [-7, -109, 42.5], [-6, -96, 37.5], [-5, -82.5, 36.5], [-4, -64.5, 47.0], [-3.5, -56.5, 49.3]];
const PROV_SPOT: Record<string, [number, number]> = {
  'British Columbia': [-124.2, 54.6], Alberta: [-114.6, 55.2], Saskatchewan: [-105.8, 54.6], Manitoba: [-97.6, 55.2], 'Northwest Territories': [-118.5, 64.2], Yukon: [-135.6, 63.4],
};
const NEW_TAGS: [string, number][] = [['British Columbia', -7], ['Alberta', -6], ['Manitoba', -5]];

const ZoneTags: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o2 = win(t, C.map2 - 0.2, C.end6 + 0.3, 0.2, 0.3);
  const o3 = win(t, C.ulta3 + 0.5, C.calgary4 - 0.25, 0.2, 0.3);
  return (
    <>
      {o2 > 0 && TAGS.map(([off, lon, lat], i) => {
        const [x, y] = toS(c, LL(lon, lat));
        return <Tag key={off} t={t} t0={C.map2 - 0.1 + i * 0.09} x={x} y={y} text={utcOf(off)} text2={clockOf(off)} flipAt={C.ghadi2 + i * 0.06} color={BAND[String(off)]} size={36} o={o2} />;
      })}
      {o3 > 0 && (
        <>
          {TAGS.filter(([off]) => off !== -9).map(([off, lon, lat], i) => {
            const [x, y] = toS(c, LL(lon, lat - 2));
            return <Tag key={`u${off}`} t={t} t0={C.ulta3 + 0.5 + i * 0.06} x={x} y={y} text={clockOf(off)} color={BAND[String(off)]} size={32} o={o3} />;
          })}
          {NEW_TAGS.map(([n, off], i) => {
            const [x, y] = toS(c, LL(...PROV_SPOT[n]));
            return <Tag key={n} t={t} t0={C.ulta3 + 0.85 + i * 0.12} x={x} y={y} text={clockOf(off)} color={BAND[String(off)]} size={38} o={o3} />;
          })}
        </>
      )}
    </>
  );
};

/** Meridians, every 15°, sweeping west to east (line 2). */
const Meridians: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o = win(t, C.east2 - 0.1, C.end6 + 0.2, 0.2, 0.5);
  if (o <= 0) return null;
  const sweep = ramp(t, C.east2, C.east2 + 1.4, inOut);
  const lons = Array.from({ length: 10 }, (_, i) => -165 + i * 15);
  const x0 = toS(c, LL(-170, 0))[0], x1 = toS(c, LL(-35, 0))[0];
  const xs = x0 + (x1 - x0) * sweep;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
      {lons.map((lon) => {
        const [x] = toS(c, LL(lon, 0));
        const d = clamp01((xs - x) / 120);
        if (d <= 0) return null;
        return <line key={lon} x1={x} y1={-20} x2={x} y2={-20 + 1960 * d} stroke="#fff" strokeWidth={2.2} opacity={0.75} />;
      })}
      {sweep > 0 && sweep < 1 && <line x1={xs} y1={0} x2={xs} y2={1920} stroke="#fff" strokeWidth={8} opacity={0.7} filter="url(#glow)" />}
    </svg>
  );
};

// ------------------------------------------------------------------ the map scene: line by line overlays
const MapOverlays: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const PT = GEO.points;
  const S = (k: string) => toS(c, PT[k]);
  const [vx, vy] = S('Vancouver'), [sx, sy] = S('Seattle'), [cx, cy] = S('Calgary'), [dx, dy] = S('Destin');
  const rail = GEO.rail.map((p) => toS(c, p));
  const railD = (p: number) => {
    // the first p (0..1) of the rail polyline
    const seg = rail.slice(1).map((q, i) => Math.hypot(q[0] - rail[i][0], q[1] - rail[i][1]));
    const tot = seg.reduce((a, b) => a + b, 0);
    let left = tot * p, d = `M${rail[0][0]},${rail[0][1]}`, at: P = rail[0];
    for (let i = 0; i < seg.length; i++) {
      if (left <= 0) break;
      const k = Math.min(1, left / seg[i]);
      at = [rail[i][0] + (rail[i + 1][0] - rail[i][0]) * k, rail[i][1] + (rail[i + 1][1] - rail[i][1]) * k];
      d += `L${at[0].toFixed(1)},${at[1].toFixed(1)}`;
      left -= seg[i];
    }
    return { d, at };
  };
  // line 1: the hook (pins, the rail, 3H down and 5H back); line 6: the train runs it (4H)
  const hook = win(t, C.vancouver1 + 0.5, C.kyu2 + 0.3, 0.1, 0.3);
  const railOn = Math.max(hook, win(t, C.train6 - 0.2, C.ghadi6 + 0.1, 0.3, 0.1));
  const railP = t < C.kyu2 + 0.5 ? ramp(t, C.seattle1 + 0.55, C.seattle1 + 1.3, inOut) : ramp(t, C.train6, C.train6 + 0.7, inOut);
  const R = railD(railP);
  const trainP = t < C.four6 + 0.4 ? ramp(t, C.train6 + 0.5, C.four6 + 0.3, inOut) : 1 - ramp(t, C.four6 + 0.5, C.ghadi6 - 0.05, inOut);
  const train = railD(trainP).at;
  // line 4
  const l4 = win(t, C.calgary4 - 0.2, C.ulta5 + 0.4, 0.1, 0.35);
  const lineP = ramp(t, C.doori4 + 0.9, C.km4 + 0.1, inOut);
  const mer4 = ramp(t, C.deg4 - 0.75, C.deg4 - 0.2, inOut);
  // line 5
  const l5 = win(t, C.ulta5 + 0.5, C.train6 - 0.1, 0.1, 0.3);
  const ring5 = ramp(t, C.ulta5 + 0.55, C.vancouver5 - 0.3, inOut);
  const mer5 = ramp(t, C.lon5 - 0.2, C.lon5 + 0.4, inOut);
  const yMid = (vy + sy) / 2;
  return (
    <AbsoluteFill>
      {/* ---------------- line 1 + 6: the rail line and the train */}
      {railOn > 0 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: railOn }}>
          <path d={R.d} fill="none" stroke="#000" strokeOpacity={0.45} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" transform="translate(4 8)" filter="url(#glow)" />
          <path d={R.d} fill="none" stroke="#fff" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
          <path d={R.d} fill="none" stroke={RED} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <path d={R.d} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="16 22" strokeDashoffset={-t * 60} strokeLinecap="round" />
        </svg>
      )}
      {hook > 0 && (
        <div style={{ opacity: hook }}>
          <Pin t={t} t0={C.vancouver1 + 0.55} x={vx} y={vy} size={120} label={<TwoTone a="Vancouver" size={84} />} />
          <Pin t={t} t0={C.seattle1 + 0.45} x={sx} y={sy} size={120} side={-1} label={<TwoTone a="Seattle" size={84} />} />
          <Tag t={t} t0={C.three1 - 0.05} x={(vx + sx) / 2 + 250} y={yMid - 120} text="↓ 3 घंटे" color="#3DDC84" size={78} />
          <Tag t={t} t0={C.five1 - 0.05} x={(vx + sx) / 2 + 250} y={yMid + 80} text="↑ 5 घंटे" color={RED} size={78} />
        </div>
      )}
      {t > C.kyu2 - 0.05 && t < C.kyu2 + 0.9 && <QMark t={t} t0={C.kyu2 - 0.05} x={540} y={760} size={420 * (1 - 0.3 * ramp(t, C.kyu2 + 0.5, C.kyu2 + 0.9, linear))} rot={-8} />}
      {t > C.train6 - 0.2 && t < C.ghadi6 + 0.2 && (
        <div style={{ opacity: win(t, C.train6 + 0.4, C.ghadi6 + 0.2, 0.2, 0.2) }}>
          <Pin t={t} t0={C.train6 - 0.2} x={vx} y={vy} size={100} label={<TwoTone a="Vancouver" size={66} />} />
          <Pin t={t} t0={C.train6 - 0.1} x={sx} y={sy} size={100} side={-1} label={<TwoTone a="Seattle" size={66} />} />
          <div style={{ position: 'absolute', left: train[0] - 170, top: train[1] - 70, width: 340, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.92)', boxShadow: '0 0 30px rgba(255,255,255,0.6), 0 10px 18px rgba(0,0,0,0.5)', transform: `scaleX(${trainP < 1 && t > C.four6 + 0.4 ? -1 : 1})` }}>
            <Img src={IMG('t02_train.png')} style={{ position: 'absolute', left: 14, top: 8, width: 312, height: 36 }} />
          </div>
          <Tag t={t} t0={C.four6 - 0.05} x={train[0] + 250} y={train[1] - 40} text="4H" color={GOLD} size={110} />
        </div>
      )}

      {/* ---------------- line 4: Calgary and Destin */}
      {l4 > 0 && (
        <div style={{ opacity: l4 }}>
          {mer4 > 0 && (
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
              {[cx, dx].map((x, i) => <line key={i} x1={x} y1={-20} x2={x} y2={-20 + 1960 * mer4} stroke="#fff" strokeWidth={4} strokeDasharray="18 12" />)}
              {t > C.deg4 - 0.2 && (() => {
                const p = ramp(t, C.deg4 - 0.2, C.deg4 + 0.3, easeOut), y = Math.max(cy, dy) + 210, m = (cx + dx) / 2;
                return (
                  <g>
                    <line x1={m - (m - cx) * p} y1={y} x2={m + (dx - m) * p} y2={y} stroke={GOLD} strokeWidth={7} />
                    <path d={`M${m - (m - cx) * p + 22},${y - 16} L${m - (m - cx) * p},${y} L${m - (m - cx) * p + 22},${y + 16}`} fill="none" stroke={GOLD} strokeWidth={7} />
                    <path d={`M${m + (dx - m) * p - 22},${y - 16} L${m + (dx - m) * p},${y} L${m + (dx - m) * p - 22},${y + 16}`} fill="none" stroke={GOLD} strokeWidth={7} />
                  </g>
                );
              })()}
            </svg>
          )}
          {lineP > 0 && (
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
              <line x1={cx} y1={cy} x2={cx + (dx - cx) * lineP} y2={cy + (dy - cy) * lineP} stroke="#000" strokeOpacity={0.4} strokeWidth={14} transform="translate(4 8)" />
              <line x1={cx} y1={cy} x2={cx + (dx - cx) * lineP} y2={cy + (dy - cy) * lineP} stroke={GOLD} strokeWidth={9} strokeLinecap="round" />
            </svg>
          )}
          <Pulse t={t} t0={C.calgary4 - 0.05} x={cx} y={cy} r={90} n={2} />
          <Pin t={t} t0={C.calgary4} x={cx} y={cy} size={110} label={<TwoTone a="Calgary" size={74} />} />
          <Pulse t={t} t0={C.destin4 + 0.05} x={dx} y={dy} r={90} n={2} />
          <Pin t={t} t0={C.destin4 + 0.05} x={dx} y={dy} size={110} side={-1} label={<TwoTone a="Destin" size={74} />} />
          <Tag t={t} t0={C.km4 - 0.05} x={(cx + dx) / 2 + 90} y={(cy + dy) / 2 - 40} text="3,231 KM" color={GOLD} size={64} o={1 - ramp(t, C.same4 - 0.2, C.same4 + 0.1, linear)} />
          <Tag t={t} t0={C.deg4} x={(cx + dx) / 2} y={Math.max(cy, dy) + 290} text="27.6°" color={GOLD} size={84} o={1 - ramp(t, C.same4 - 0.2, C.same4 + 0.1, linear)} />
          <Tag t={t} t0={C.same4 + 0.6} x={cx} y={cy + 110} text={clockOf(-6)} color={BAND['-6']} size={70} />
          <Tag t={t} t0={C.same4 + 0.75} x={dx} y={dy + 110} text={clockOf(-6)} color={BAND['-6']} size={70} />
          {t > C.same4 + 1.1 && <div style={{ position: 'absolute', left: (cx + dx) / 2, top: (cy + dy) / 2 + 60, transform: `translate(-50%,-50%) scale(${pop(t, C.same4 + 1.1, 10, 200)})` }}><TwoTone a="=" size={190} /></div>}
        </div>
      )}

      {/* ---------------- line 5: Vancouver and Seattle */}
      {l5 > 0 && (
        <div style={{ opacity: l5 }}>
          {ring5 > 0 && ring5 < 1 && (
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
              <circle cx={vx} cy={vy} r={150} fill="none" stroke="#fff" strokeWidth={9} strokeDasharray={`${2 * Math.PI * 150 * ramp(t, C.ulta5 + 0.55, C.ulta5 + 1.05, easeOut)} 2000`} transform={`rotate(-90 ${vx} ${vy})`} opacity={1 - ramp(t, C.vancouver5 - 0.6, C.vancouver5 - 0.3, linear)} />
            </svg>
          )}
          {mer5 > 0 && (
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
              {[vx, sx].map((x, i) => <line key={i} x1={x} y1={-20} x2={x} y2={-20 + 1960 * mer5} stroke="#fff" strokeWidth={4} strokeDasharray="18 12" />)}
              {t > C.kam5 - 0.1 && (() => {
                const p = ramp(t, C.kam5 - 0.1, C.kam5 + 0.3, easeOut), y = yMid, m = (vx + sx) / 2;
                return <line x1={m - (m - vx) * p} y1={y} x2={m + (sx - m) * p} y2={y} stroke={GOLD} strokeWidth={8} />;
              })()}
            </svg>
          )}
          <Pin t={t} t0={C.vancouver5 + 0.05} x={vx} y={vy} size={110} side={-1} label={<TwoTone a="Vancouver" size={70} />} />
          <Pin t={t} t0={C.seattle5} x={sx} y={sy} size={110} label={<TwoTone a="Seattle" size={70} />} />
          <Tag t={t} t0={C.lon5 + 0.1} x={vx - 20} y={vy + 130} text="123.12° W" color="#fff" size={44} o={1 - ramp(t, C.clocks5 - 0.3, C.clocks5, linear)} />
          <Tag t={t} t0={C.lon5 + 0.3} x={sx + 20} y={sy - 230} text="122.33° W" color="#fff" size={44} o={1 - ramp(t, C.clocks5 - 0.3, C.clocks5, linear)} />
          <Tag t={t} t0={C.kam5} x={(vx + sx) / 2} y={yMid - 80} text="0.79°" color={GOLD} size={92} o={1 - ramp(t, C.clocks5 - 0.3, C.clocks5, linear)} />
          <Tag t={t} t0={C.clocks5 + 0.5} x={vx + 230} y={vy + 10} text={clockOf(-7)} color={BAND['-7']} size={66} />
          <Tag t={t} t0={C.clocks5 + 0.9} x={sx + 230} y={sy + 10} text={clockOf(-8)} color={BAND['-8']} size={66} />
          <Tag t={t} t0={C.ghante5 - 0.05} x={(vx + sx) / 2 + 280} y={yMid} text="1 घंटा" color={GOLD} size={64} />
        </div>
      )}

      {/* ---------------- line 7: dozens more (rings and question marks) */}
      {t > C.aise7 + 0.3 && t < C.bc8 && (
        <div style={{ opacity: 1 - ramp(t, C.bc8 - 0.4, C.bc8, linear) }}>
          {RINGS.map(([lon, lat], i) => { const [x, y] = toS(c, LL(lon, lat)); return <Pulse key={i} t={t} t0={C.aise7 + 0.5 + i * 0.17} x={x} y={y} r={60} n={2} />; })}
          {QS.map(([lon, lat, s, r], i) => { const [x, y] = toS(c, LL(lon, lat)); return <QMark key={i} t={t} t0={C.kaise7 - 1.6 + i * 0.16} x={x} y={y} size={s} rot={r} />; })}
        </div>
      )}

      {/* ---------------- line 8 + 9: the provinces, their clocks, the padlocks; everyone else's clocks */}
      <Provinces t={t} c={c} />
      <OthersClocks t={t} c={c} />

      {/* ---------------- line 10: March */}
      {t > C.march10 - 0.1 && t < C.seedha10 + 0.4 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', opacity: win(t, C.march10 - 0.1, C.seedha10 + 0.4, 0.1, 0.3), transform: `scale(${pop(t, C.march10 - 0.1, 10, 190)})` }}>
          <div style={{ display: 'inline-block', width: 330, borderRadius: 26, overflow: 'hidden', background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.55)', border: `6px solid ${INK}` }}>
            <div style={{ background: RED, color: '#fff', fontFamily: TITLE, fontSize: 70, letterSpacing: 4, padding: '6px 0' }}>MARCH</div>
            <div style={{ fontFamily: TITLE, fontSize: 64, color: INK, padding: '8px 0 10px' }}>⏰ +1H</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
const RINGS: [number, number][] = [[-114.07, 51.04], [-86.5, 30.39], [-123.12, 49.28], [-122.33, 47.61], [-97.14, 49.9], [-93.27, 44.98], [-104.6, 50.45], [-113.5, 53.55],
  [-114.37, 62.45], [-135.05, 60.72], [-79.38, 43.65], [-104.99, 39.74], [-112.07, 33.45], [-87.63, 41.88], [-89.25, 48.38]];
const QS: [number, number, number, number][] = [[-120, 55, 200, -10], [-100, 38, 230, 8], [-85, 47, 180, -6], [-112, 63, 170, 12], [-78, 36, 160, -12], [-96, 57, 210, 4]];

const PROV_ON: [string, string][] = [['British Columbia', 'bc8'], ['Alberta', 'alberta8'], ['Manitoba', 'manitoba8'], ['Northwest Territories', 'nwt8'], ['Saskatchewan', 'sask8'], ['Yukon', 'yukon8']];
const Provinces: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const end = 1 - ramp(t, C.march10 - 0.2, C.march10 + 0.4, linear);
  if (t < C.bc8 - 0.1 || end <= 0) return null;
  const big = 1 - 0.45 * ramp(t, C.baaki9, C.baaki9 + 0.6, inOut); // the continent view: smaller icons
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: end }}>
        {PROV_ON.map(([n, cue]) => {
          const t0 = C[cue];
          if (t < t0) return null;
          const d = ringsD(c, GEO.provinces[n]);
          const g = ramp(t, t0, t0 + 0.35, easeOut);
          const fill = 0.5 * (1 - 0.45 * ramp(t, C.baaki9, C.baaki9 + 0.6, linear));
          return (
            <g key={n}>
              <path d={d} fill="#F6EEDC" opacity={fill * g} />
              <path d={d} fill="none" stroke="#fff" strokeWidth={6} filter="url(#glow)" opacity={0.8 * g} />
              <path d={d} fill="none" stroke="#fff" strokeWidth={3.5} opacity={g} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, opacity: end }}>
        {PROV_ON.map(([n, cue], i) => {
          const t0 = C[cue];
          if (t < t0) return null;
          const [x, y] = toS(c, LL(...PROV_SPOT[n]));
          const lateJoin = n === 'Saskatchewan' || n === 'Yukon';
          const clockAt = lateJoin ? t0 + 0.15 : C.chhod8 + i * 0.1;
          const lockAt = lateJoin ? t0 + 0.55 : C.chhod8 + 0.9 + i * 0.12;
          const flip = clamp01((t - lockAt) / 0.22);
          const sx = Math.abs(Math.cos(flip * Math.PI));
          const pulse = 1 + 0.25 * Math.max(0, Math.sin(Math.PI * clamp01((t - C.ruke9) / 0.45))) + 0.04 * Math.sin(t * LOOPF(41) + i);
          const s = 150 * big;
          const lab = n === 'Northwest Territories' ? 'NW Territories' : n;
          return (
            <React.Fragment key={n}>
              <div style={{ position: 'absolute', left: x, top: y + s * 0.6, transform: `translate(-50%,0) scale(${pop(t, t0 + 0.05, 11, 180) * big})`, opacity: 1 - ramp(t, t0 + 1.6, t0 + 1.9, linear) }}>
                <TwoTone a={lab} size={46} />
              </div>
              {t > clockAt && (
                <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${pop(t, clockAt, 11, 190) * pulse}) scaleX(${sx})` }}>
                  {flip < 0.5
                    ? <Clock size={s} hour={60} minute={0} style={{ left: 0, top: 0, position: 'relative' }} />
                    : <Padlock size={s * 1.05} style={{ position: 'relative' }} />}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

const OTHER: [number, number][] = [[-120.2, 44.5], [-118.8, 36.8], [-105.0, 39.7], [-98.0, 34.5], [-88.5, 41.9], [-84.4, 33.0], [-75.5, 40.0], [-79.4, 47.0], [-70.5, 47.5], [-64.0, 45.7], [-150.0, 63.0], [-111.5, 34.0]];
const OthersClocks: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o = win(t, C.baaki9 - 0.1, C.khisak9 + 0.2, 0.1, 0.3);
  if (o <= 0) return null;
  const back = ramp(t, C.peeche9 - 0.2, C.peeche9 + 0.8, inOut);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      {OTHER.map(([lon, lat], i) => {
        const [x, y] = toS(c, LL(lon, lat));
        const s = 96;
        return (
          <div key={i} style={{ position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, transform: `scale(${pop(t, C.baaki9 + i * 0.07, 11, 190)})` }}>
            <Clock size={s} hour={60 - 30 * back} minute={-360 * back} style={{ left: 0, top: 0 }} />
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ full-screen inserts
/** Line 3: the wall clock, 1 November, the hands run to 2:00, then everyone falls back an hour and it drops away. */
const ClockInsert: React.FC<{ t: number }> = ({ t }) => {
  const a = C.nov3 - 0.1, b = C.ulta3 + 0.35;
  if (t < a || t > b + 0.5) return null;
  const pin = ramp(t, a, a + 0.18, easeOut);
  const drop = ramp(t, b, b + 0.45, (x) => x * x * x);
  const toTwo = ramp(t, C.raat3 - 0.4, C.raat3 + 0.35, inOut);
  const fallBack = ramp(t, C.ulta3 - 0.1, C.ulta3 + 0.3, inOut);
  const minute = 360 * toTwo - 360 * fallBack + 6 * ((t - a) * 2);
  const hour = 30 + 30 * toTwo - 30 * fallBack;
  const push = 1 + 0.05 * ramp(t, a, b, linear);
  const blur = (1 - pin) * 30 + drop * 40;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #22344d 0%, #0b1220 70%)`, opacity: 1 - ramp(t, b + 0.1, b + 0.45, linear) }}>
      <div style={{ position: 'absolute', left: 60, top: 420, width: 960, height: 993, transform: `translateY(${(1 - pin) * -1200 + drop * 1900}px) scale(${push}) rotate(${(1 - pin) * -14 + drop * 18 + Math.sin(t * LOOPF(29)) * 1.2}deg)`, filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px) drop-shadow(0 30px 40px rgba(0,0,0,0.6))` : 'drop-shadow(0 30px 40px rgba(0,0,0,0.6))' }}>
        <Clock size={960} hour={hour} minute={minute} style={{ left: 0, top: 0 }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', transform: `scale(${pop(t, a + 0.1, 10, 190)}) translateY(${drop * 1600}px)` }}>
        <div style={{ display: 'inline-block', padding: '8px 44px', background: '#fff', borderRadius: 22, border: `8px solid ${RED}`, fontFamily: UI, fontWeight: 800, fontSize: 104, lineHeight: 1.15, color: INK, transform: 'rotate(-3deg)', boxShadow: '0 16px 30px rgba(0,0,0,0.5)' }}>1 नवंबर</div>
      </div>
      {t > C.raat3 + 0.2 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1450, textAlign: 'center', transform: `scale(${pop(t, C.raat3 + 0.2, 10, 190)}) translateY(${drop * 1600}px)` }}>
          <TwoTone a="रात" b={fallBack > 0.5 ? '1:00' : '2:00'} size={150} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Line 6: 'par ghadi dekho': the station, the split-flap board (3H there, 5H back), the traveller checks his watch. */
const FLAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:';
const Flaps: React.FC<{ t: number; t0: number; text: string; size: number; color?: string }> = ({ t, t0, text, size, color = '#fff' }) => (
  <span style={{ display: 'inline-flex', gap: size * 0.06 }}>
    {Array.from(text).map((ch, i) => {
      const settle = t0 + 0.035 * i + 0.2;
      const shown = t >= settle || ch === ' ' ? ch : t < t0 ? ' ' : FLAP[Math.floor((t * 30 + i * 7) % FLAP.length)];
      const flip = t < settle && t >= t0 ? (t * 30) % 1 : 0;
      return (
        <span key={i} style={{ position: 'relative', width: size * 0.62, height: size * 1.16, background: ch === ' ' ? 'transparent' : '#141820', borderRadius: size * 0.08, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: TITLE, fontSize: size, color, overflow: 'hidden' }}>
          <span style={{ transform: `scaleY(${1 - 0.6 * flip})` }}>{shown}</span>
          {ch !== ' ' && <span style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: 'rgba(0,0,0,0.75)' }} />}
        </span>
      );
    })}
  </span>
);
const StationInsert: React.FC<{ t: number }> = ({ t }) => {
  const a = C.ghadi6 - 0.15, b = C.aise7 + 0.1;
  if (t < a || t > b + 0.3) return null;
  const pin = ramp(t, a, a + 0.14, easeOut), pout = ramp(t, b, b + 0.25, (x) => x * x);
  const push = 1.04 + 0.05 * ramp(t, a, b, linear);
  const trainX = -2100 + 3400 * ramp(t, a + 0.1, C.go6 + 0.2, inOut);
  const man = pop(t, C.ghadi6 + 0.25, 11, 170);
  const shakeHead = Math.sin((t - C.back6) * 18) * 4 * clamp01((t - C.back6) / 0.1) * Math.exp(-Math.max(0, t - C.back6) * 2);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', transform: `translateX(${(1 - pin) * 1100 - pout * 1100}px)`, filter: (1 - pin) + pout > 0.02 ? `blur(${((1 - pin) + pout) * 30}px)` : undefined }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: '50% 40%' }}>
        <Img src={IMG('t03_station.jpg')} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920 }} />
        {/* the board fills the station's green screen (51,396)-(1029,877) */}
        <div style={{ position: 'absolute', left: 51, top: 396, width: 978, height: 481, background: '#07090d', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 34, padding: '0 34px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: LABEL, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: GOLD }}><span>DEPARTS</span><span>ARRIVES</span><span>TIME</span></div>
          {[[C.go6, 'VAC 1:00', 'SEA 4:00', '3H', '#3DDC84'], [C.back6, 'SEA 4:00', 'VAC 9:00', '5H', RED]].map(([t0, from, to, dur, col]) => (
            <div key={String(from)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Flaps t={t} t0={Number(t0) - 0.2} text={String(from)} size={62} />
              <span style={{ fontFamily: TITLE, fontSize: 60, color: GOLD, opacity: t > Number(t0) ? 1 : 0.2 }}>→</span>
              <Flaps t={t} t0={Number(t0) + 0.15} text={String(to)} size={62} />
              <span style={{ display: 'inline-block', minWidth: 140, textAlign: 'center', fontFamily: TITLE, fontSize: 70, color: '#07090d', background: String(col), borderRadius: 14, transform: `scale(${pop(t, Number(t0) + 0.75, 9, 210)})`, boxShadow: `0 0 30px ${col}` }}>{dur}</span>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 51, top: 396, width: 978, height: 481, background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 40%)', pointerEvents: 'none' }} />
        {/* the train runs through on the tracks */}
        <Img src={IMG('t02_train.png')} style={{ position: 'absolute', left: trainX, top: 1120, width: 2100, height: 243, filter: `blur(${t < C.go6 ? 3 : 0}px)` }} />
        {/* the traveller, checking his watch */}
        <div style={{ position: 'absolute', left: 470, top: 1920 - 1150 * man, width: 580, height: 1152, transformOrigin: '50% 100%', transform: `rotate(${shakeHead * 0.4 + Math.sin(t * LOOPF(37)) * 0.8}deg)` }}>
          <Img src={IMG('t04_traveller.png')} style={{ width: 580, height: 1152, filter: 'drop-shadow(0 20px 22px rgba(0,0,0,0.5))' }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.clocks5 - 0.2, t1: C.train6 + 0.25, from: 0.3 },
  { name: 'B', t0: C.kaise7 - 1.1, t1: C.bc8 + 1.0, from: 0.1 },
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
        <OffthreadVideo src={staticFile(`tzcanada/null/null_tz_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ captions, grade, credits
const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t < 0.3 || t > DURATION_S - 0.3) return null; // frame 0 and the last frame match for the loop
  let i = -1;
  for (let k = 0; k < CAPS.length; k++) if (CAPS[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = CAPS.slice(g, g + 3);
  const nextT = CAPS[g + 3]?.[0] ?? DURATION_S;
  if (t > nextT + 0.6 || (CAPS[g + 3] && t > CAPS[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1240, textAlign: 'center', fontFamily: UI, fontWeight: 700, fontSize: 46, color: '#fff', textShadow: '0 3px 10px rgba(0,0,0,0.9), 0 0 2px #000' }}>
      {words.map(([wt, w], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0.0 }}>{w} </span>)}
    </div>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders, time zones: Natural Earth';
const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.45))' }} />
    <AbsoluteFill style={{ boxShadow: 'inset 0 0 240px rgba(0,0,0,0.55)' }} />
  </>
);

export const TzCanada: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const c0 = camAt(t);
  const [sx, sy] = shake(t);
  const mv = camMotion(t);
  const blur = Math.min(14, Math.hypot(mv.vx, mv.vy) * 0.06 + mv.zoom * 6);
  const split = splitAt(t);
  const mapOff = split ? -480 * split.q : 0;
  const tilt = tiltAt(t);
  const fullInsert = (t > C.nov3 && t < C.ulta3 + 0.5) || (t > C.ghadi6 && t < C.aise7 + 0.2);
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy + mapOff}px)` }}>
        <AbsoluteFill style={{ transform: tilt > 0.01 ? `perspective(1600px) rotateX(${tilt.toFixed(2)}deg) scale(${1 + tilt * 0.024})` : undefined, transformOrigin: '50% 60%' }}>
          <AbsoluteFill style={{ filter: blur > 0.6 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
            <MapLayers c={c0} />
            <ZoneMap t={t} c={c0} />
            <Meridians t={t} c={c0} />
          </AbsoluteFill>
        </AbsoluteFill>
        <Grade />
        <ZoneTags t={t} c={c0} />
        <MapOverlays t={t} c={c0} />
      </AbsoluteFill>
      <ClockInsert t={t} />
      <StationInsert t={t} />
      {split && <NullPanel t={t} q={split.q} {...split.w} />}
      {captions && !split && <Captions t={t} />}
      {!fullInsert && <div style={{ position: 'absolute', left: 20, right: 20, bottom: 18, textAlign: 'center', fontFamily: LABEL, fontSize: 15, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>}
      <Watermark t={t} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
export { NA, NA_MPP };
