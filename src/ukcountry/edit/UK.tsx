import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, Cam, DURATION_S, GEO, LOOPF, P, camAt, camSpeed, lineD, merc, ringsD, rollAt, shake, toS } from './cam';
import { ASPECT } from './assets';
import { LABEL, SERIF, TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';
import { Cut, Hue, Slab } from './Studio';

export const UK_DURATION_S = DURATION_S;
const AUDIO = 'ukcountry/audio/mix.wav';
const DARK = '#0B1830';
const COL = { gold: '#FFC21A', red: '#E8202A', blue: '#1F5FD6', green: '#1FA34A', orange: '#FF8A1E', white: '#F4F4F4', saffron: '#FF8A1E', irl: '#169B62' };
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const has = (k: string) => !!ASPECT[k];

// ------------------------------------------------------------------ type
export const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string; ink?: string }> = ({ text, size, color = '#fff', font = TITLE, ink = DARK }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 11)}px ${ink}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number; font?: string }> = ({ text, color = COL.gold, size = 46, font = UI }) => (
  <div style={{ padding: `${size * 0.1}px ${size * 0.5}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: '#fff', whiteSpace: 'nowrap', boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
export const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: o }}>{children}</div>;
const Img: React.FC<{ k: string; w: number; label?: string }> = ({ k, w, label }) => has(k) ? <Cut k={k} w={w} /> : (
  <div style={{ width: w, height: w * 0.7, borderRadius: 24, background: 'rgba(255,240,210,0.15)', border: '4px dashed rgba(255,240,210,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LABEL, fontSize: 28, color: '#FFE7C0' }}>{label ?? k}</div>
);
/** A place on the map: a pulsing pin and a name plate (Hindi + English). */
const Place: React.FC<{ t: number; t0: number; x: number; y: number; hi: string; en: string; color?: string; up?: boolean; o?: number }> = ({ t, t0, x, y, hi, en, color = COL.gold, up = true, o = 1 }) => {
  const p = pop(t, t0, 10, 200);
  if (p <= 0 || o <= 0) return null;
  const ph = ((t - t0) * 1.1) % 1;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: o }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <circle cx={x} cy={y} r={12 + 40 * ph} fill="none" stroke={color} strokeWidth={5} opacity={(1 - ph) * p} />
        <circle cx={x} cy={y} r={11 * p} fill={color} stroke="#fff" strokeWidth={4} />
        <line x1={x} y1={y + (up ? -14 : 14)} x2={x} y2={y + (up ? -60 : 60) * p} stroke="#fff" strokeWidth={4} />
      </svg>
      <div style={{ position: 'absolute', left: x, top: y + (up ? -64 : 64), transform: `translate(-50%, ${up ? '-100%' : '0'}) scale(${p})`, transformOrigin: up ? '50% 100%' : '50% 0', textAlign: 'center', padding: '4px 18px 6px', background: 'rgba(8,12,20,0.88)', border: `4px solid ${color}`, borderRadius: 16, boxShadow: `0 0 22px ${color}66` }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 44, lineHeight: 1.05, color: '#fff', whiteSpace: 'nowrap' }}>{hi}</div>
        <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: 20, letterSpacing: 3, color, whiteSpace: 'nowrap' }}>{en}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ flags and badges drawn in code
const Flag: React.FC<{ k: 'eng' | 'sco' | 'wal' | 'irl'; w?: number }> = ({ k, w = 120 }) => {
  const h = w * 0.62;
  return (
    <svg width={w} height={h} viewBox="0 0 100 62" style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))', borderRadius: 4 }}>
      {k === 'eng' && <><rect width={100} height={62} fill="#fff" /><rect x={42} width={16} height={62} fill="#CE1124" /><rect y={23} width={100} height={16} fill="#CE1124" /></>}
      {k === 'sco' && <><rect width={100} height={62} fill="#0065BD" /><path d="M0,0 L100,62 M100,0 L0,62" stroke="#fff" strokeWidth={12} /></>}
      {k === 'wal' && <><rect width={100} height={31} fill="#fff" /><rect y={31} width={100} height={31} fill="#00B140" /><path d="M28,40 q8,-22 26,-18 q10,-10 18,0 q-8,2 -10,8 q12,4 10,14 q-10,-6 -18,-2 q-4,8 -14,6 q2,-6 -4,-8 q-6,6 -8,0z" fill="#D30731" /></>}
      {k === 'irl' && <><rect width={33.4} height={62} fill="#169B62" /><rect x={33.3} width={33.4} height={62} fill="#fff" /><rect x={66.6} width={33.4} height={62} fill="#FF883E" /></>}
      <rect width={100} height={62} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
    </svg>
  );
};
/** A glowing hex badge with one of the creator's props inside (the reference's crown / passport / soldier badges). */
const Badge: React.FC<{ color: string; k: string; size?: number; t: number }> = ({ color, k, size = 300, t }) => {
  const r = size / 2;
  const pts = Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i - Math.PI / 2; return `${(r + Math.cos(a) * r * 0.92).toFixed(1)},${(r + Math.sin(a) * r * 0.92).toFixed(1)}`; }).join(' ');
  return (
    <div style={{ position: 'relative', width: size, height: size, transform: `translateY(${Math.sin(t * 2.2 + size) * 6}px)` }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <polygon points={pts} fill={color} opacity={0.35} transform={`translate(0 0) scale(1.0)`} style={{ filter: 'blur(14px)' }} />
        <polygon points={pts} fill={color} stroke="#fff" strokeWidth={8} />
        <polygon points={pts} fill="url(#hexgloss)" />
        <defs><linearGradient id="hexgloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.35" /><stop offset="0.55" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{has(k) ? <Cut k={k} w={size * (ASPECT[k] < 0.6 ? 0.42 : 0.72)} /> : <div style={{ fontFamily: LABEL, color: '#fff', fontSize: 22 }}>{k}</div>}</div>
    </div>
  );
};
const Stamp: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const d = t - t0;
  if (d < 0) return null;
  const s = d < 0.18 ? 2.4 - 1.4 * (d / 0.18) : 1 + 0.04 * Math.exp(-8 * (d - 0.18)) * Math.cos((d - 0.18) * 30);
  return (
    <div style={{ transform: `rotate(-12deg) scale(${s})`, opacity: Math.min(1, d * 8), padding: '6px 30px', border: '10px solid #E8202A', borderRadius: 18, fontFamily: UI, fontWeight: 800, fontSize: 96, color: '#E8202A', background: 'rgba(255,245,235,0.82)', letterSpacing: 2, lineHeight: 1.1, textAlign: 'center' }}>
      रिश्वत<div style={{ fontFamily: TITLE, fontSize: 40, letterSpacing: 8 }}>BRIBED</div>
    </div>
  );
};

// ------------------------------------------------------------------ the map layer: country slabs, white flashes, partition lines
type CK = 'England' | 'Scotland' | 'Wales' | 'NorthernIreland' | 'Ireland' | 'India';
const MapVectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const d = (k: CK) => ringsD(c, GEO.countries[k]);
  const ce = (k: CK) => toS(c, GEO.centroids[k]);
  // each country: when it is shown, its colour, and white "flash" moments (the reference's white reveal)
  const flashAt = (t0: number) => Math.max(0, 1 - Math.abs(t - t0 - 0.12) / 0.22);
  const four = win(t, C.char1 - 0.2, C.parl1, 0.2, 0.4) + win(t, C.andar + 1.4, C.shuruat + 0.4, 0.3, 0.4) + win(t, C.gb - 0.2, C.ireland1 + 0.5, 0.3, 0.4) + win(t, C.ukd - 0.2, C.irish + 0.4, 0.3, 0.4) + win(t, C.fullname - 0.3, DURATION_S - 2.2, 0.4, 1.0);
  const flashes: Record<string, number[]> = {
    England: [C.char1 - 0.2, C.eng_list, C.gb, C.ukd, C.sovereign], Scotland: [C.char1 - 0.1, C.scot_list, C.gb, C.ukd, C.sovereign],
    Wales: [C.char1, C.wales_list, C.gb, C.ukd, C.sovereign], NorthernIreland: [C.char1 + 0.1, C.ni_list, C.ukd, C.sovereign],
  };
  const colourOf: Record<string, Hue> = { England: 'red', Scotland: 'blue', Wales: 'green' as Hue, NorthernIreland: 'orange' as Hue };
  // story moments
  const walesConq = ramp(t, C.jeet - 0.1, C.jeet + 0.8, inOut);
  const walesO = win(t, C.shuruat - 0.2, C.baari + 0.4, 0.4, 0.4);
  const engO = win(t, C.shuruat - 0.2, C.london1 + 0.8, 0.4, 0.4) + win(t, C.n1707 - 0.2, C.gb, 0.3, 0.3);
  const scoO = win(t, C.baari - 0.2, C.london1 + 0.8, 0.4, 0.4) + win(t, C.n1707 - 0.2, C.gb, 0.3, 0.3);
  const irlO = win(t, C.ireland1 - 0.3, C.ukd, 0.4, 0.3) + win(t, C.irish - 0.2, C.london2 + 0.5, 0.4, 0.5);
  const irlFree = ramp(t, C.n1922 - 0.1, C.n1922 + 0.9, inOut);
  const niO = win(t, C.n1922 + 0.4, C.london2 + 0.5, 0.4, 0.5);
  const indiaO = win(t, 0, C.uk1 + 0.4, 0.01, 0.5) + win(t, C.n1947 - 0.3, C.naam + 0.4, 0.4, 0.5) + win(t, C.agli + 1.0, DURATION_S + 1, 0.8, 0.1);
  const nibO = win(t, C.batwara - 0.1, C.n1947 + 0.4, 0.3, 0.4), nibDraw = ramp(t, C.batwara, C.london2 + 1.2, inOut);
  const inbO = win(t, C.n1947 + 0.2, C.naam + 0.3, 0.3, 0.4), inbDraw = ramp(t, C.n1947 + 0.3, C.bharat + 1.2, inOut);
  const one = ramp(t, C.sovereign + 0.1, C.sovereign + 0.5, inOut) * (1 - ramp(t, C.nation - 0.2, C.nation + 0.5, inOut));
  const len = 4000;
  const [ix, iy] = ce('India');
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <path d={GEO.borders.map((l) => lineD(c, l)).join('')} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.3} />
      {indiaO > 0.01 && <Slab id="ind" t={t} d={d('India')} hue="red" g={clamp01(indiaO)} depth={18} cx={ix} cy={iy} s={0.97 + 0.04 * Math.sin(t * LOOPF(23))} />}
      {(['England', 'Scotland', 'Wales', 'NorthernIreland'] as CK[]).map((k) => {
        const [cx, cy] = ce(k);
        const g = clamp01(four + (k === 'England' ? engO : 0) + (k === 'Scotland' ? scoO : 0) + (k === 'NorthernIreland' ? niO : 0));
        let hue: Hue = colourOf[k];
        if (k === 'Wales' && walesO > 0.01) hue = walesConq > 0.5 ? 'red' : ('green' as Hue);
        const gg = k === 'Wales' ? clamp01(g + walesO) : g;
        if (one > 0.01) hue = 'red';
        const fl = Math.max(...flashes[k].map(flashAt));
        return (
          <g key={k}>
            <Slab id={`c${k}`} t={t} d={d(k)} hue={hue} g={gg} depth={12} cx={cx} cy={cy} s={0.98 + 0.03 * pop(t, flashes[k][1] - 0.05, 9, 190) * (t < C.capital + 0.5 ? 1 : 0)} />
            {fl > 0 && <path d={d(k)} fill="#fff" opacity={fl} />}
          </g>
        );
      })}
      {irlO > 0.01 && <Slab id="irl" t={t} d={d('Ireland')} hue={(irlFree > 0.5 ? 'green' : 'orange') as Hue} g={clamp01(irlO)} depth={12} cx={ce('Ireland')[0] - 24 * irlFree} cy={ce('Ireland')[1]} dx={-24 * irlFree} />}
      {nibO > 0 && GEO.nib.map((l, i) => <path key={i} d={lineD(c, l)} fill="none" stroke="#fff" strokeWidth={7} strokeDasharray={`${len * nibDraw} ${len}`} opacity={nibO} strokeLinecap="round" />)}
      {inbO > 0 && GEO.inb.map((l, i) => <path key={`i${i}`} d={lineD(c, l)} fill="none" stroke="#fff" strokeWidth={7} strokeDasharray={`${len * 2 * inbDraw} ${len * 2}`} opacity={inbO} strokeLinecap="round" />)}
    </svg>
  );
};

// ------------------------------------------------------------------ the scenes
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');
const Scenes: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const w = (a: number, b: number, fi = 0.25, fo = 0.3) => win(t, a, b, fi, fo);
  const s = (k: string) => toS(c, GEO.places[k]);
  const ce = (k: string) => toS(c, GEO.centroids[k]);
  const [lx, ly] = s('london'), [ex, ey] = s('edinburgh'), [dx, dy] = s('dublin');
  // the hook's kinetic title (frame 0 and the loop's end): a giant word sweeping past the camera
  const kin = Math.max(1 - ramp(t, 1.4, 2.2, linear), ramp(t, DURATION_S - 1.6, DURATION_S - 0.05, linear));
  const kq = t < 3 ? t / 2.2 : clamp01((DURATION_S - t) / 1.6);
  // the crown hop Edinburgh → London (1603)
  const hop = ramp(t, C.raja - 0.2, C.london1 + 0.2, inOut);
  const hx = ex + (lx - ex) * hop, hy = ey + (ly - ey) * hop - Math.sin(hop * Math.PI) * 220;
  return (
    <>
      {kin > 0.01 && <At x={540 + 300 * (0.5 - kq)} y={760} o={kin} p={2.6 - 1.6 * clamp01(kq)} rot={-8}><Big text="अंग्रेज़" size={240} font={UI} color="#fff" /></At>}
      {t > C.n200 - 0.2 && t < C.uk1 && <At x={540} y={330} p={pop(t, C.n200 - 0.1, 10, 200)} o={w(C.n200 - 0.2, C.uk1)}><Big text={<>~{fmt(200 * easeOut(ramp(t, C.n200 - 0.1, C.n200 + 0.8, linear)))} साल</>} size={140} font={UI} color={COL.gold} /></At>}
      {t > C.char1 - 0.2 && t < C.parl1 && <At x={540} y={330} p={pop(t, C.char1 - 0.1, 8, 240)} o={w(C.char1 - 0.2, C.parl1)}><Big text="1 = 4 ?" size={170} color="#fff" /></At>}
      {t > C.n1801a - 0.2 && t < C.king - 0.2 && <At x={540} y={330} p={pop(t, C.n1801a - 0.1, 9, 220)} o={w(C.n1801a - 0.2, C.king - 0.2)}><Big text="1801" size={170} font={SERIF} color="#FFE9B0" /></At>}
      {t > C.bribe + 0.1 && t < C.king - 0.2 && <At x={dx} y={dy} o={w(C.bribe + 0.1, C.king - 0.2)}><Stamp t={t} t0={C.bribe + 0.3} /></At>}
      {t > C.bribe + 0.25 && t < C.kaise + 0.8 && has('p_coin_burst') && <At x={dx} y={dy} p={0.4 + 1.3 * easeOut(clamp01((t - C.bribe - 0.3) / 0.8))} o={1 - clamp01((t - C.bribe - 1.1) / 0.6)}><Cut k="p_coin_burst" w={760} /></At>}
      {t > C.kaise - 0.1 && t < C.king && <At x={860} y={1180} p={pop(t, C.kaise, 8, 240)} o={w(C.kaise - 0.1, C.king)} rot={8}><Big text="?" size={280} color={COL.gold} /></At>}
      {/* one King, one Passport, one Army */}
      {t > C.king - 0.2 && t < C.andar + 0.8 && (() => {
        const sink = ramp(t, C.andar - 0.1, C.andar + 0.7, inOut);
        const base = ce('England');
        const pos = [[540, 640], [330, 900], [750, 900]].map(([x, y]) => [x + (base[0] - x) * sink, y + (base[1] - y) * sink]);
        const items: [string, string, number][] = [['a_crown', '#E8B10A', C.king], ['a_passport', '#2D6BE0', C.passport], ['a_guardsman', '#D3202A', C.army]];
        return items.map(([k, col, t0], i) => <At key={k} x={pos[i][0]} y={pos[i][1]} p={pop(t, t0 - 0.1, 9, 220) * (1 - 0.85 * sink)} o={1 - ramp(t, C.andar + 0.4, C.andar + 0.8, linear)}><Badge color={col} k={k} t={t} /></At>);
      })()}
      {t > C.king - 0.2 && t < C.andar && <At x={540} y={330} o={w(C.king - 0.2, C.andar)}><Big text={<>1 King · 1 Passport · 1 Army</>} size={66} color="#fff" /></At>}
      {/* four countries, capitals */}
      {([['eng_list', 'England', 'इंग्लैंड', 'ENGLAND', COL.red], ['scot_list', 'Scotland', 'स्कॉटलैंड', 'SCOTLAND', COL.blue], ['wales_list', 'Wales', 'वेल्स', 'WALES', COL.green], ['ni_list', 'NorthernIreland', 'नॉर्दर्न आयरलैंड', 'NORTHERN IRELAND', COL.orange]] as const).map(([cue, k, hi, en, col]) => {
        const [x, y] = ce(k);
        if (t < C[cue] - 0.2 || t > C.vishwas + 0.2) return null;
        return <At key={k} x={x} y={y + (k === 'NorthernIreland' ? -40 : 0)} p={pop(t, C[cue] - 0.05, 9, 220)} o={w(C[cue] - 0.2, C.vishwas + 0.2)}><div style={{ textAlign: 'center' }}><Big text={hi} size={k === 'NorthernIreland' ? 46 : 56} font={UI} color="#fff" ink={DARK} /><div style={{ fontFamily: LABEL, fontSize: 18, letterSpacing: 3, color: col, fontWeight: 700 }}>{en}</div></div></At>;
      })}
      {t > C.capital - 0.3 && t < C.vishwas + 0.3 && ([['london', 'लंदन', 'LONDON', COL.red], ['edinburgh', 'एडिनबरा', 'EDINBURGH', COL.blue], ['cardiff', 'कार्डिफ़', 'CARDIFF', COL.green], ['belfast', 'बेलफ़ास्ट', 'BELFAST', COL.orange]] as const).map(([k, hi, en, col], i) => { const [x, y] = s(k); return <Place key={k} t={t} t0={C.capital - 0.2 + i * 0.12} x={x} y={y} hi={hi} en={en} color={col} up={k !== 'cardiff'} o={w(C.capital - 0.3, C.vishwas + 0.3)} />; })}
      {/* the sports proof */}
      {t > C.cricket - 0.3 && t < C.football + 0.2 && <At x={ce('England')[0] + 60} y={ce('England')[1] - 40} p={pop(t, C.cricket - 0.2, 10, 190)} o={w(C.cricket - 0.3, C.football + 0.2)}><Img k="k_cricket" w={300} label="cricket" /></At>}
      {t > C.engwales - 0.2 && t < C.football + 0.3 && <At x={540} y={250} p={pop(t, C.engwales - 0.1, 10, 200)} o={w(C.engwales - 0.2, C.football + 0.3)}><Tag text={<>ECB = <span style={{ color: '#FF6B6B' }}>England</span> + <span style={{ color: '#5BE07F' }}>Wales</span></>} size={56} font={TITLE} /></At>}
      {t > C.football - 0.2 && t < C.teamgb + 0.2 && (['England', 'Scotland', 'Wales', 'NorthernIreland'] as const).map((k, i) => {
        const [x, y] = ce(k);
        const merge = ramp(t, C.olympics - 0.1, C.olympics + 0.7, inOut);
        const mx = x + (540 - x) * merge, my = y + (900 - y) * merge;
        return <At key={k} x={mx} y={my} p={pop(t, C.football + i * 0.15, 9, 220) * (1 - 0.6 * merge)} o={w(C.football - 0.2, C.teamgb + 0.2) * (1 - ramp(t, C.olympics + 0.5, C.olympics + 0.8, linear))}><Img k="k_football" w={150} label="⚽" /></At>;
      })}
      {t > C.olympics + 0.4 && t < C.shuruat + 0.3 && <At x={540} y={900} p={pop(t, C.olympics + 0.5, 10, 190)} o={w(C.olympics + 0.4, C.shuruat + 0.3)}><Img k="k_torch_medal" w={360} label="torch + medal" /></At>}
      {t > C.teamgb - 0.2 && t < C.shuruat + 0.3 && <At x={540} y={330} p={pop(t, C.teamgb - 0.1, 9, 220)} o={w(C.teamgb - 0.2, C.shuruat + 0.3)}><Big text="TEAM GB" size={150} color={COL.gold} /></At>}
      {/* Wales */}
      {t > C.n13 - 0.2 && t < C.baari && <At x={540} y={330} p={pop(t, C.n13 - 0.1, 9, 220)} o={w(C.n13 - 0.2, C.baari)}><Big text="XIII" size={170} font={SERIF} color="#FFE9B0" /></At>}
      {t > C.n13 - 0.2 && t < C.jeet + 0.6 && <At x={ce('Wales')[0]} y={ce('Wales')[1]} p={pop(t, C.n13, 10, 200)} o={w(C.n13 - 0.2, C.jeet + 0.6)}><Flag k="wal" w={130} /></At>}
      {t > C.jeet - 0.3 && t < C.baari && <At x={ce('England')[0] - 40} y={ce('England')[1]} p={pop(t, C.jeet - 0.2, 10, 200)} o={w(C.jeet - 0.3, C.baari)}><Flag k="eng" w={150} /></At>}
      {t > C.kilon - 0.4 && t < C.baari + 0.3 && Object.entries(GEO.castles).map(([n, p], i) => { const [x, y] = toS(c, p); return <At key={n} x={x} y={y - 30} p={pop(t, C.kilon - 0.3 + i * 0.12, 10, 220)} o={w(C.kilon - 0.4, C.baari + 0.3)}>{has('w_castle') ? <Cut k="w_castle" w={120} /> : <div style={{ width: 40, height: 40, background: '#9A9A9A', border: '3px solid #444' }} />}</At>; })}
      {/* Scotland */}
      {t > C.baari - 0.2 && t < C.n1603 && <At x={ce('Scotland')[0]} y={ce('Scotland')[1]} p={pop(t, C.baari, 10, 200)} o={w(C.baari - 0.2, C.n1603)}><Flag k="sco" w={140} /></At>}
      {t > C.scots - 0.2 && t < C.n1603 + 0.3 && (() => { const [x, y] = toS(c, merc(-2.6, 55.4)); const clash = Math.max(0, Math.sin((t - C.scots) * 9)) * 10; return <At x={x} y={y} p={pop(t, C.scots - 0.1, 9, 220)} o={w(C.scots - 0.2, C.n1603 + 0.3)} rot={clash}><Img k="s_swords" w={360} label="swords" /></At>; })()}
      {t > C.n1603 - 0.2 && t < C.panama && <At x={540} y={330} p={pop(t, C.n1603 - 0.1, 9, 220)} o={w(C.n1603 - 0.2, C.panama)}><Big text="1603" size={170} font={SERIF} color="#FFE9B0" /></At>}
      {t > C.raja - 0.3 && t < C.panama && <>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: w(C.raja - 0.3, C.panama) }}><path d={`M${ex},${ey} Q${(ex + lx) / 2 + 120},${Math.min(ey, ly) - 260} ${lx},${ly}`} fill="none" stroke="#FFE9A0" strokeWidth={5} strokeDasharray="14 12" /></svg>
        <At x={hx} y={hy} p={pop(t, C.raja - 0.2, 10, 200)} o={w(C.raja - 0.3, C.panama)}><Img k="a_crown" w={170} label="crown" /></At>
        {t > C.london1 - 0.3 && <Place t={t} t0={C.london1 - 0.2} x={lx} y={ly} hi="लंदन" en="LONDON" color={COL.red} up={false} o={w(C.london1 - 0.3, C.panama)} />}
      </>}
      {t > C.panama - 0.2 && t < C.n1707 && (() => {
        const sink = ramp(t, C.doob - 0.6, C.doob + 0.8, inOut);
        const [px, py] = s('panama');
        return <>
          <Place t={t} t0={C.panama} x={px} y={py} hi="पनामा" en="PANAMA · DARIÉN 1698" color={COL.gold} o={w(C.panama - 0.2, C.n1707)} />
          <At x={540} y={1180 + 120 * sink} p={pop(t, C.panama + 0.2, 10, 180)} o={w(C.panama - 0.2, C.n1707) * (1 - 0.5 * sink)} rot={-6 - 22 * sink}><Img k="s_ship_sinking" w={620} label="sinking ship" /></At>
          {t > C.doob - 0.4 && <At x={px - 220} y={py + 520} p={pop(t, C.doob - 0.3, 10, 200)} o={w(C.doob - 0.4, C.n1707)}><Img k="s_treasure" w={300} label="treasure" /></At>}
        </>;
      })()}
      {t > C.n1707 - 0.2 && t < C.gb + 0.4 && <At x={540} y={330} p={pop(t, C.n1707 - 0.1, 9, 220)} o={w(C.n1707 - 0.2, C.gb + 0.4)}><Big text="1707" size={170} font={SERIF} color="#FFE9B0" /></At>}
      {t > C.kanoon - 0.4 && t < C.gb + 0.4 && ([['s_scales', -260, 0.0], ['s_gavel', 0, 0.45], ['s_kirk', 260, 0.9]] as const).map(([k, ox, d0]) => { const [x, y] = ce('Scotland'); return <At key={k} x={x + ox} y={y + 330} p={pop(t, C.kanoon - 0.3 + d0, 10, 200)} o={w(C.kanoon - 0.4, C.gb + 0.4)}><Img k={k} w={210} label={k} /></At>; })}
      {t > C.gb - 0.2 && t < C.ireland1 + 0.3 && <At x={540} y={330} p={pop(t, C.gb, 9, 220)} o={w(C.gb - 0.2, C.ireland1 + 0.3)}><Big text="Great Britain" size={130} font={SERIF} color="#fff" /></At>}
      {/* Ireland */}
      {t > C.ireland1 - 0.2 && t < C.ukd && <At x={ce('Ireland')[0]} y={ce('Ireland')[1] + 120} p={pop(t, C.ireland1, 10, 200)} o={w(C.ireland1 - 0.2, C.ukd)}><div style={{ textAlign: 'center' }}><Big text="आयरलैंड" size={70} font={UI} /><div style={{ fontFamily: LABEL, fontSize: 22, letterSpacing: 3, color: COL.orange, fontWeight: 700 }}>IRELAND</div></div></At>}
      {t > C.parl2 - 0.3 && t < C.ukd && <At x={dx} y={dy - 140} p={pop(t, C.parl2 - 0.2, 10, 180)} o={w(C.parl2 - 0.3, C.ukd)}><Img k="i_parliament_dublin" w={520} label="Irish Parliament" /></At>}
      {t > C.n1801b - 0.2 && t < C.ukd && <At x={540} y={330} p={pop(t, C.n1801b - 0.1, 9, 220)} o={w(C.n1801b - 0.2, C.ukd)}><Big text="1801" size={170} font={SERIF} color="#FFE9B0" /></At>}
      {t > C.khitab - 0.3 && t < C.ukd && (() => { const q = ramp(t, C.khitab - 0.2, C.khitab + 0.7, inOut); return <At x={900 + (dx - 900) * q} y={1500 + (dy - 60 - 1500) * q} p={pop(t, C.khitab - 0.2, 10, 190) * (1 - 0.4 * q)} o={w(C.khitab - 0.3, C.ukd)}><Img k="p_coronet_money" w={280} label="coronet + money" /></At>; })()}
      {t > C.khitab + 0.6 && t < C.ukd && <At x={dx} y={dy + 120} o={w(C.khitab + 0.6, C.ukd)}><Stamp t={t} t0={C.khitab + 0.8} /></At>}
      {t > C.vote - 0.2 && t < C.ukd && <At x={540} y={1260} p={pop(t, C.vote - 0.1, 9, 220)} o={w(C.vote - 0.2, C.ukd)}><Tag text="✔ VOTE: UNION" size={44} color="#5BE07F" font={TITLE} /></At>}
      {t > C.ukd - 0.2 && t < C.irish + 0.2 && <At x={540} y={330} p={pop(t, C.ukd, 9, 220)} o={w(C.ukd - 0.2, C.irish + 0.2)}><Big text="United Kingdom" size={120} font={SERIF} color="#fff" /></At>}
      {t > C.n1916 - 0.3 && t < C.uttar && <At x={dx + 40} y={dy - 150} p={pop(t, C.n1916 - 0.2, 10, 180)} o={w(C.n1916 - 0.3, C.uttar)}><Img k="i_gpo_dublin" w={460} label="GPO Dublin" /></At>}
      {t > C.n1916 - 0.2 && t < C.uttar && <At x={300} y={330} p={pop(t, C.n1916 - 0.1, 10, 200)} o={w(C.n1916 - 0.2, C.uttar)} rot={-4}><Tag text="1916 · Easter Rising" size={44} color={COL.irl} font={TITLE} /></At>}
      {t > C.jung - 0.2 && t < C.uttar && <At x={760} y={440} p={pop(t, C.jung - 0.1, 10, 200)} o={w(C.jung - 0.2, C.uttar)} rot={4}><Tag text="1919–21 · आज़ादी की जंग" size={42} color={COL.irl} /></At>}
      {t > C.n1922 - 0.2 && t < C.batwara && <At x={ce('Ireland')[0] - 30} y={ce('Ireland')[1]} p={pop(t, C.n1922, 10, 200)} o={w(C.n1922 - 0.2, C.batwara)}><div style={{ textAlign: 'center' }}><Flag k="irl" w={150} /><div><Big text="1922" size={80} font={SERIF} color="#fff" /></div></div></At>}
      {t > C.uttar - 0.2 && t < C.batwara + 0.4 && (() => { const [x, y] = ce('NorthernIreland'); return <Place t={t} t0={C.uttar - 0.1} x={x} y={y} hi="नॉर्दर्न आयरलैंड" en="STAYED IN THE UK" color={COL.orange} o={w(C.uttar - 0.2, C.batwara + 0.4)} />; })()}
      {/* partition: London's parliament, Ireland then India */}
      {t > C.batwara - 0.2 && t < C.n1947 + 0.3 && <At x={lx} y={ly - 120} p={pop(t, C.batwara - 0.1, 10, 180)} o={w(C.batwara - 0.2, C.n1947 + 0.3)}><Img k="l_westminster" w={420} label="Westminster" /></At>}
      {t > C.batwara && t < C.n1947 + 0.3 && <At x={540} y={250} p={pop(t, C.batwara + 0.1, 10, 200)} o={w(C.batwara, C.n1947 + 0.3)}><Tag text="1921 · आयरलैंड का बँटवारा" size={46} color="#fff" /></At>}
      {t > C.n1947 - 0.1 && t < C.naam + 0.2 && <At x={540} y={250} p={pop(t, C.n1947, 9, 200)} o={w(C.n1947 - 0.1, C.naam + 0.2)}><Big text="1947" size={170} font={SERIF} color="#FFD2C4" /></At>}
      {/* the full name, one sovereign state */}
      {t > C.fullname - 0.2 && t < C.char3 + 0.2 && (() => {
        const parts = ['United Kingdom', 'of Great Britain', 'and Northern Ireland'];
        return <At x={540} y={360} o={w(C.fullname - 0.2, C.char3 + 0.2)}><div style={{ textAlign: 'center', lineHeight: 1.1 }}>{parts.map((p, i) => { const pp = pop(t, C.fullname + i * 1.05, 10, 200); return <div key={i} style={{ transform: `scale(${pp})`, opacity: Math.min(1, pp * 2) }}><Big text={p} size={i ? 76 : 100} font={SERIF} color={i === 2 ? '#FFB37A' : i === 1 ? '#9EC2FF' : '#fff'} /></div>; })}</div></At>;
      })()}
      {t > C.sovereign - 0.1 && t < C.agli && <At x={ce('England')[0]} y={ce('England')[1] - 60} p={pop(t, C.sovereign + 0.1, 8, 240)} o={w(C.sovereign - 0.1, C.agli)}><Big text="1" size={260} color="#fff" /></At>}
      {t > C.sovereign - 0.1 && t < C.agli && <At x={540} y={330} p={pop(t, C.sovereign, 9, 220)} o={w(C.sovereign - 0.1, C.agli)}><Big text={<>4 देश · 1 Sovereign State</>} size={76} font={UI} color={COL.gold} /></At>}
      {t > C.nation - 0.2 && t < C.agli + 0.4 && (['England', 'Scotland', 'Wales', 'NorthernIreland'] as const).map((k, i) => { const [x, y] = ce(k); const fl = { England: 'eng', Scotland: 'sco', Wales: 'wal', NorthernIreland: 'eng' }[k] as 'eng'; return k === 'NorthernIreland' ? null : <At key={k} x={x} y={y} p={pop(t, C.nation - 0.1 + i * 0.12, 10, 200)} o={w(C.nation - 0.2, C.agli + 0.4)}><Flag k={fl} w={110} /></At>; })}
    </>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.vishwas - 0.1, t1: C.engwales + 0.7, from: 0.2 },
  { name: 'B', t0: C.batwara - 0.1, t1: C.bharat + 1.0, from: 0.3 },
];
const BAND_TOP = 470;
const splitAt = (t: number) => {
  for (const w of NULL_WIN()) {
    const q = Math.min(ramp(t, w.t0 - 0.2, w.t0 + 0.2, inOut), 1 - ramp(t, w.t1 - 0.2, w.t1 + 0.2, inOut));
    if (q > 0) return { q, w };
  }
  return null;
};
const NullPanel: React.FC<{ t: number; q: number; name: string; t0: number; t1: number; from: number; fps: number }> = ({ t, q, name, t0, t1, from, fps }) => (
  <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d', borderTop: '6px solid #fff' }}>
    <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 300}px`, transform: `scale(${1.12 + 0.04 * ramp(t, t0, t1, inOut)})` }}>
      <Sequence from={Math.round((t0 - 0.2) * fps)} durationInFrames={Math.round((t1 - t0 + 0.6) * fps)} layout="none">
        <OffthreadVideo src={staticFile(`ukcountry/null/null_uk_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ captions, grade, credits
const Captions: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  if (t < 0.05 || t > DURATION_S - 0.3) return null;
  let i = -1;
  for (let k = 0; k < CAPS.length; k++) if (CAPS[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = CAPS.slice(g, g + 3);
  const last = words[words.length - 1];
  if (t > last[0] + 1.2 && (!CAPS[g + 3] || t < CAPS[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 66, lineHeight: 1.25, color: '#fff', WebkitTextStroke: `10px ${DARK}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, w], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? COL.gold : '#fff' }}>{w} </span>)}
    </div>
  );
};
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 38 * Math.sin(t * LOOPF(3) + 1.1), ly = 30 + 22 * Math.sin(t * LOOPF(2) + 0.4);
  const sombre = win(t, C.batwara - 0.3, C.naam, 0.6, 0.6);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,92,118,0.3), rgba(0,70,96,0.15) 45%, rgba(0,60,90,0.28))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,196,128,0.28), rgba(255,140,70,0.06) 26%, rgba(255,120,60,0) 46%)`, mixBlendMode: 'screen', opacity: 0.5 + 0.2 * Math.sin(t * LOOPF(8)) }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 56%, rgba(0,4,12,0.42) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.26), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 76%, rgba(0,6,12,0.4))' }} />
      <AbsoluteFill style={{ background: 'rgba(10,14,24,1)', mixBlendMode: 'multiply', opacity: 0.35 * sombre }} />
    </AbsoluteFill>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders: Natural Earth (India POV) · flags drawn in code';

export const UKCountry: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const c = camAt(t);
  const [sx, sy] = shake(t);
  const sp = camSpeed(t);
  const blur = Math.min(12, sp.pan * 0.25 + sp.zoom * 260);
  const split = splitAt(t);
  return (
    <AbsoluteFill style={{ background: '#0E2A55', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) rotate(${rollAt(t).toFixed(3)}deg) scale(1.05)` }}>
        <AbsoluteFill style={{ filter: blur > 0.7 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
          <AbsoluteFill style={{ filter: 'contrast(1.08) saturate(1.2) brightness(1.03)' }}><MapLayers c={c} /></AbsoluteFill>
          <MapVectors t={t} c={c} />
        </AbsoluteFill>
        <Grade t={t} />
        <Scenes t={t} c={c} />
      </AbsoluteFill>
      {split && <NullPanel t={t} q={split.q} {...split.w} fps={fps} />}
      {captions && <Captions t={t} top={split ? 860 : 1500} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={(t * 98) / DURATION_S} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
