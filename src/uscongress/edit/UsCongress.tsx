import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, Cam, DURATION_S, GEO, LOOPF, P, camAt, camMotion, merc, ringsD, shake, tiltAt, toS } from './cam';
import { LABEL, SERIF, TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';
import { Board, Capitol, Hand, Hemicycle, K, LabelBox, LawPaper, Pair, Pen, Person, Tick, WhiteHouse } from './Props';

export const US_DURATION_60 = Math.round(DURATION_S * 60);
const FPS = 60;
const F = (s: number) => Math.round(s * FPS);
const AUDIO = 'uscongress/audio/mix.wav';
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const S = GEO.states;

// ------------------------------------------------------------------ small parts
const Big: React.FC<{ text: string; size: number; color?: string; stroke?: number }> = ({ text, size, color = K.gold, stroke }) => (
  <span style={{ fontFamily: TITLE, fontSize: size, lineHeight: 1, color, WebkitTextStroke: `${stroke ?? Math.round(size / 11)}px ${K.ink}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}66, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const Tag: React.FC<{ text: string; color?: string; size?: number }> = ({ text, color = K.gold, size = 40 }) => (
  <div style={{ padding: `${size * 0.14}px ${size * 0.5}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: TITLE, fontSize: size, color: '#fff', whiteSpace: 'nowrap', letterSpacing: 1, boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: o }}>{children}</div>;
const Pulse: React.FC<{ t: number; t0: number; x: number; y: number; r?: number; color?: string }> = ({ t, t0, x, y, r = 80, color = '#fff' }) => {
  if (t < t0) return null;
  return <>{[0, 0.3].map((k) => { const q = (t - t0 - k) / 0.8; if (q < 0 || q > 1) return null; const e = 1 - (1 - q) ** 3; return <div key={k} style={{ position: 'absolute', left: x - r * e, top: y - r * e, width: 2 * r * e, height: 2 * r * e, borderRadius: '50%', border: `${6 * (1 - q) + 1}px solid ${color}`, opacity: 1 - q }} />; })}</>;
};
const Arrow: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  if (t < t0) return null;
  const p = pop(t, t0, 10, 200), bob = Math.sin((t - t0) * 7) * 8;
  return <svg width={80} height={110} viewBox="-40 -100 80 110" style={{ position: 'absolute', left: x - 40, top: y - 110 + bob, transform: `scale(${p})`, transformOrigin: '50% 100%', overflow: 'visible', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.55))' }}><path d="M-12 -96 H12 V-40 H32 L0 0 L-32 -40 H-12 Z" fill="#fff" /></svg>;
};

// ------------------------------------------------------------------ the map scene
const stateCentre = (n: string) => GEO.statePts[n];
const LON0 = merc(-125, 0)[0], LON1 = merc(-67, 0)[0];
const sweepAt = (n: string) => clamp01((stateCentre(n)[0] - LON0) / (LON1 - LON0));
const LOWER48 = Object.keys(S).filter((n) => n !== 'Alaska' && n !== 'Hawaii' && n !== 'District of Columbia');

const MapVectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const usO = Math.max(win(t, C.wyoming0 - 0.6, C.heres + 0.6, 0.4, 0.5), win(t, C.inhouse - 0.5, C.population + 0.8, 0.3, 0.4), win(t, C.insenate - 0.4, C.senserve + 0.3, 0.3, 0.3), win(t, C.should - 0.5, DURATION_S - 0.5, 0.3, 0.6));
  const wy = Math.max(win(t, C.wyoming0, C.heres + 0.6, 0.2, 0.5), win(t, C.wyoming2 + 0.1, C.each - 0.1, 0.25, 0.3), win(t, C.should, DURATION_S - 0.5, 0.25, 0.6));
  const ny = Math.max(win(t, C.ny0, C.heres + 0.6, 0.2, 0.5), win(t, C.population + 0.3, C.wyoming2 - 0.1, 0.25, 0.25), win(t, C.each - 0.1, C.so + 0.2, 0.3, 0.3), win(t, C.half, DURATION_S - 0.5, 0.25, 0.6));
  const dist = Math.max(ramp(t, C.population + 0.6, C.ny26 + 0.1, linear) * (1 - ramp(t, C.wyoming2 - 0.2, C.wyoming2, linear)), win(t, C.each - 0.1, C.so + 0.2, 0.3, 0.3));
  const dc = win(t, C.heres + 0.4, C.whitehouse + 0.2, 0.4, 0.6);
  const mall = ramp(t, C.andjust, C.capitol - 0.1, inOut) * (1 - ramp(t, C.meets + 0.4, C.meets + 0.8, linear));
  const wh = GEO.points['White House'], cap = GEO.points.Capitol;
  const [wx, wy2] = toS(c, wh), [cx, cy] = toS(c, cap);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="6" /></filter>
        <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.28" /><stop offset="0.55" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      {usO > 0 && (
        <g opacity={usO}>
          <path d={ringsD(c, GEO.countries.USA)} fill="none" stroke="#fff" strokeWidth={3} opacity={0.85} />
          <path d={ringsD(c, LOWER48.flatMap((n) => S[n]))} fill="none" stroke="#fff" strokeWidth={1.4} opacity={0.45} />
        </g>
      )}
      {/* line 8: every state lights up, west to east */}
      {t > C.insenate - 0.1 && t < C.senserve + 0.3 && LOWER48.map((n) => {
        const t0 = C.insenate + 0.05 + sweepAt(n) * 1.3;
        const g = ramp(t, t0, t0 + 0.3, easeOut) * (1 - ramp(t, C.senserve - 0.1, C.senserve + 0.3, linear));
        if (g <= 0) return null;
        const hot = n === 'New York' || n === 'Wyoming' ? win(t, C.nomatter - 0.05, C.n50, 0.15, 0.3) : 0;
        return <path key={n} d={ringsD(c, S[n])} fill={hot ? (n === 'New York' ? K.orange : K.red) : '#fff'} opacity={(0.22 + 0.5 * hot) * g} stroke="#fff" strokeWidth={2} />;
      })}
      {wy > 0 && (
        <g opacity={wy}>
          <path d={ringsD(c, S.Wyoming)} fill="#000" opacity={0.35} transform="translate(6 12)" filter="url(#glow)" />
          <path d={ringsD(c, S.Wyoming)} fill={K.red} opacity={c.mpp < 1500 ? 0.5 : 0.78} />
          <path d={ringsD(c, S.Wyoming)} fill="url(#sheen)" />
          <path d={ringsD(c, S.Wyoming)} fill="none" stroke="#fff" strokeWidth={4} />
        </g>
      )}
      {ny > 0 && (
        <g opacity={ny}>
          <path d={ringsD(c, S['New York'])} fill="#000" opacity={0.35} transform="translate(6 12)" filter="url(#glow)" />
          <path d={ringsD(c, S['New York'])} fill={K.orange} opacity={c.mpp < 1500 ? 0.45 : 0.72} />
          <path d={ringsD(c, S['New York'])} fill="url(#sheen)" />
          <path d={ringsD(c, S['New York'])} fill="none" stroke="#fff" strokeWidth={4} />
        </g>
      )}
      {dist > 0 && (
        <g opacity={dist}>
          {Object.entries(GEO.nyDistricts).map(([k, r]) => {
            const t0 = C.population + 0.7 + (Number(k) - 1) * 0.028;
            const d = ramp(t, t0, t0 + 0.25, easeOut);
            return <path key={k} d={ringsD(c, r)} fill={Number(k) % 2 ? '#FFB55A' : '#E07A10'} fillOpacity={0.35 * d} stroke="#fff" strokeWidth={2.2} strokeOpacity={d} />;
          })}
        </g>
      )}
      {dc > 0 && (
        <g opacity={dc}>
          <path d={ringsD(c, GEO.dcRing)} fill="#6FB2FF" opacity={0.3 * ramp(t, C.heres + 0.6, C.heres + 1.2, linear)} />
          <path d={ringsD(c, GEO.dcRing)} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray={4000} strokeDashoffset={4000 * (1 - ramp(t, C.heres + 0.4, C.heres + 1.4, inOut))} />
        </g>
      )}
      {mall > 0 && <line x1={wx} y1={wy2 + 40} x2={wx + (cx - wx) * mall} y2={wy2 + 40 + (cy - wy2) * mall} stroke={K.gold} strokeWidth={9} strokeDasharray="26 16" strokeLinecap="round" opacity={0.95} />}
    </svg>
  );
};

const MapOverlays: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const s = (p: P) => toS(c, p);
  const [wyx, wyy] = s(GEO.points.Wyoming), [nyx, nyy] = s(GEO.points['New York']);
  const [whx, why] = s(GEO.points['White House']), [cpx, cpy] = s(GEO.points.Capitol);
  // line 1: the two arcs flip over the continent
  const arcs = win(t, C.flip - 0.35, C.but + 0.25, 0.25, 0.35);
  const flip = ramp(t, C.flip, C.flip + 1.2, inOut);
  const flipColor = (i: number, n: number) => (i / n < 0.44 + 0.12 * flip ? K.blue : K.red);
  const l1 = win(t, C.wyoming0, C.heres + 0.5, 0.15, 0.4);
  const close = win(t, C.should, DURATION_S - 0.55, 0.2, 0.5);
  const both = Math.max(l1, close);
  return (
    <AbsoluteFill>
      {arcs > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: arcs, transform: `translateY(${(1 - pop(t, C.flip - 0.35, 11, 160)) * 500 + ramp(t, C.but - 0.1, C.but + 0.25, inOut) * 400}px)` }}>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <Hemicycle cx={300} cy={960} n={435} rows={11} r0={95} r1={245} color={flipColor} />
            <Hemicycle cx={790} cy={960} n={100} rows={5} r0={70} r1={190} color={flipColor} />
          </svg>
          <At x={300} y={1010}><Big text="HOUSE" size={58} color="#fff" /></At>
          <At x={790} y={1010}><Big text="SENATE" size={58} color="#fff" /></At>
        </div>
      )}
      {/* line 1: Wyoming and New York, their people, two senators each */}
      {both > 0 && (
        <div style={{ opacity: both }}>
          <At x={wyx} y={wyy - 105} p={pop(t, t > C.should ? C.should : C.wyoming0, 11, 180)}><span style={{ fontFamily: SERIF, fontSize: 56, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.8)', whiteSpace: 'nowrap' }}>Wyoming</span></At>
          <At x={wyx} y={wyy + 95} p={pop(t, t > C.should ? C.half : C.n588 - 0.05, 11, 190)}><Tag text={`${fmt(588000 * (t > C.should ? 1 : ramp(t, C.n588 - 0.05, C.n588 + 0.9, easeOut)))} PEOPLE`} color={K.red} size={38} /></At>
          <At x={wyx} y={wyy - 10} p={pop(t, t > C.should ? C.half + 0.3 : C.senators0 - 0.05, 10, 200)}><Pair s={1.0} /></At>
          {t > C.ny0 - 0.05 && (
            <>
              <At x={nyx} y={nyy - 95} p={pop(t, t > C.should ? C.should + 0.15 : C.ny0, 11, 180)}><span style={{ fontFamily: SERIF, fontSize: 56, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.8)', whiteSpace: 'nowrap' }}>New York</span></At>
              <At x={nyx - 40} y={nyy + 110} p={pop(t, t > C.should ? C.ny20b - 0.1 : C.n20m - 0.05, 11, 190)}><Tag text={`${fmt(20000000 * (t > C.should ? 1 : ramp(t, C.n20m - 0.05, C.n20m + 0.8, easeOut)))} PEOPLE`} color={K.orange} size={38} /></At>
              <At x={nyx} y={nyy} p={pop(t, t > C.should ? C.half + 0.45 : C.n20m + 0.25, 10, 200)}><Pair s={1.0} /></At>
            </>
          )}
          <At x={(wyx + nyx) / 2} y={Math.min(wyy, nyy) - 10} p={pop(t, t > C.should ? C.samevote : C.n20m + 0.45, 9, 220)}><Big text="=" size={170} color="#fff" /></At>
          <At x={(wyx + nyx) / 2} y={Math.min(wyy, nyy) - 200} p={pop(t, t > C.should ? C.yorkers - 0.2 : C.n20m + 0.6, 9, 220)} rot={Math.sin(t * 3) * 6}><Big text="?" size={200} color={K.gold} /></At>
        </div>
      )}
      {/* line 2-3: Washington DC, the White House, the Capitol */}
      {t > C.heres + 0.6 && t < C.this + 0.3 && (
        <At x={540} y={300} p={pop(t, C.heres + 0.8, 11, 170)} o={1 - ramp(t, C.this, C.this + 0.3, linear)}><span style={{ fontFamily: SERIF, fontSize: 96, color: '#fff', textShadow: '0 6px 18px rgba(0,0,0,0.75)', whiteSpace: 'nowrap' }}>Washington, D.C.</span></At>
      )}
      {t > C.this - 0.1 && t < C.meets + 0.9 && (
        <div style={{ opacity: 1 - ramp(t, C.meets + 0.5, C.meets + 0.9, linear) }}>
          <Arrow t={t} t0={C.this + 0.05} x={whx} y={why - 20} />
          <At x={whx} y={why - 330} p={pop(t, C.whitehouse + 0.1, 11, 170) * 0.8}><WhiteHouse flag={Math.sin(t * 6)} /></At>
          <At x={whx} y={why - 150} p={pop(t, C.president0 - 0.1, 11, 190)}><Tag text="WHITE HOUSE" size={40} color="#fff" /></At>
          <Arrow t={t} t0={C.capitol - 0.25} x={cpx} y={cpy - 20} />
          <At x={cpx} y={cpy - 360} p={pop(t, C.capitol, 11, 170) * 0.82}><Capitol dome={ramp(t, C.capitol + 0.15, C.capitol + 0.5, easeOut)} /></At>
          <At x={cpx} y={cpy - 150} p={pop(t, C.meets - 0.4, 11, 190)}><Tag text="CONGRESS" size={40} color={K.orange} /></At>
        </div>
      )}
      {/* line 5: 26 districts, then Wyoming's one */}
      {t > C.population + 0.6 && t < C.wyoming2 && Object.entries(GEO.nyDistrictPts).map(([k, p]) => {
        const [x, y] = s(p);
        const t0 = C.population + 0.75 + (Number(k) - 1) * 0.028;
        const z = 860 / c.mpp;
        return <At key={k} x={x} y={y} p={pop(t, t0, 10, 200) * Math.min(1.6, 0.5 + 0.5 * z)} o={1 - ramp(t, C.wyoming2 - 0.3, C.wyoming2, linear)}><span style={{ fontFamily: TITLE, fontSize: 30, color: '#fff', WebkitTextStroke: `4px ${K.ink}`, paintOrder: 'stroke fill' }}>{k}</span></At>;
      })}
      {t > C.ny26 - 0.05 && t < C.wyoming2 && <At x={540} y={360} p={2.2 - 1.2 * pop(t, C.ny26 - 0.05, 9, 220)} o={1 - ramp(t, C.wyoming2 - 0.3, C.wyoming2, linear)}><Big text="26" size={260} /></At>}
      {t > C.ny26 + 0.1 && t < C.wyoming2 && <At x={540} y={500} p={pop(t, C.ny26 + 0.15, 10, 200)} o={1 - ramp(t, C.wyoming2 - 0.3, C.wyoming2, linear)}><Tag text="DISTRICTS" size={48} color={K.orange} /></At>}
      {t > C.wyoming2 && t < C.each && (
        <div style={{ opacity: 1 - ramp(t, C.each - 0.3, C.each, linear) }}>
          <At x={wyx} y={wyy - 280} p={pop(t, C.wyoming2 + 0.25, 11, 180)}><span style={{ fontFamily: SERIF, fontSize: 92, color: '#fff', textShadow: '0 6px 16px rgba(0,0,0,0.8)' }}>Wyoming</span></At>
          <At x={wyx} y={wyy + 10} p={0.2 + 0.8 * pop(t, C.one - 0.1, 8, 200)} o={ramp(t, C.one - 0.15, C.one, linear)}><Big text="1" size={330} /></At>
          <At x={wyx} y={wyy + 250} p={pop(t, C.one + 0.15, 10, 200)}><Tag text="DISTRICT" size={48} color={K.red} /></At>
        </div>
      )}
      {/* line 6: a representative in every district, every 2 years */}
      {t > C.elects - 0.2 && t < C.so + 0.3 && (
        <div style={{ opacity: 1 - ramp(t, C.so, C.so + 0.3, linear) }}>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            {Object.entries(GEO.nyDistrictPts).map(([k, p]) => { const [x, y] = s(p); const q = pop(t, C.elects + (Number(k) - 1) * 0.03, 10, 200); return q > 0 ? <Person key={k} x={x} y={y + 12} s={0.55 * q} fill="#fff" /> : null; })}
          </svg>
          <Hand text="every 2 years" x={760} y={620} size={74} p={ramp(t, C.twoyears - 0.5, C.twoyears + 0.3, linear)} />
        </div>
      )}
      {/* line 8: two senators in every state, 50 states, 100 senators */}
      {t > C.twosen - 0.1 && t < C.senserve + 0.2 && (
        <div style={{ opacity: 1 - ramp(t, C.senserve - 0.2, C.senserve + 0.2, linear) }}>
          {LOWER48.map((n) => { const [x, y] = s(stateCentre(n)); const q = pop(t, C.twosen + sweepAt(n) * 0.8, 10, 200); return q > 0 ? <At key={n} x={x} y={y - 10} p={0.42 * q}><Pair /></At> : null; })}
          <Pulse t={t} t0={C.nomatter} x={wyx} y={wyy} r={110} />
          <Pulse t={t} t0={C.nomatter + 0.15} x={nyx} y={nyy} r={110} />
          {t > C.n50 - 0.1 && <At x={540} y={330} p={pop(t, C.n50 - 0.1, 10, 200)}><div style={{ textAlign: 'center' }}><Big text={t > C.n100b - 0.1 ? '100' : '50'} size={210} /><div><Tag text={t > C.n100b - 0.1 ? 'SENATORS' : 'STATES'} size={46} color={K.blue} /></div></div></At>}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the blueprint board
/** When the board is on screen: [in start, in end, out start, out end, kind of entrance, kind of exit]. */
const BOARD = () => [
  { a: C.meets + 0.5, b: C.meets + 1.3, c: C.inhouse - 0.3, d: C.inhouse + 0.2, inK: 'ink', outK: 'left' },
  { a: C.so - 0.25, b: C.so + 0.25, c: C.insenate - 0.25, d: C.insenate + 0.25, inK: 'right', outK: 'right' },
  { a: C.senserve - 0.3, b: C.senserve + 0.2, c: C.should - 0.45, d: C.should + 0.35, inK: 'right', outK: 'ink' },
];
type BoardState = { k: number; x: number; mask: number };
const boardAt = (t: number): BoardState | null => {
  const B = BOARD();
  for (let k = 0; k < B.length; k++) {
    const w = B[k];
    if (t < w.a || t > w.d) continue;
    const pin = ramp(t, w.a, w.b, inOut), pout = ramp(t, w.c, w.d, inOut);
    let x = 0, mask = 1;
    if (t < w.b) { if (w.inK === 'ink') mask = pin; else x = (1 - pin) * 1080; } else if (t > w.c) { if (w.outK === 'ink') mask = 1 - pout; else x = (w.outK === 'left' ? -1 : 1) * pout * 1080; }
    return { k, x, mask };
  }
  return null;
};
const INK = [[540, 960, 0], [180, 420, 0.1], [880, 1500, 0.05], [820, 380, 0.18], [240, 1560, 0.14], [560, 1300, 0.08], [90, 980, 0.22], [1000, 900, 0.2]];
const inkMask = (m: number) => INK.map(([x, y, d]) => { const r = Math.max(0, (m - d) / (1 - d)) * 1500; return `radial-gradient(circle at ${x}px ${y}px, #000 ${r * 0.82}px, transparent ${r}px)`; }).join(',');

const BoardScene: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const scroll = 0;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Board dy={t * 12 + scroll} dx={t * 6} />
      {k === 0 && <BoardChambers t={t} />}
      {k === 1 && <BoardDominate t={t} />}
      {k === 2 && <BoardSenateLaw t={t} />}
    </AbsoluteFill>
  );
};

/** 19–26.5: White House over the Capitol, two chambers, 435 and 100. */
const BoardChambers: React.FC<{ t: number }> = ({ t }) => {
  const a = C.meets + 0.6;
  const br = ramp(t, C.chambers - 0.4, C.chambers + 0.2, inOut);
  const hFill = ramp(t, C.house1 + 0.2, C.n435 + 0.3, linear), sFill = ramp(t, C.senate1 + 0.1, C.n100 + 0.2, linear);
  const push = 1 + 0.03 * ramp(t, a, C.inhouse, linear);
  return (
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      <At x={540} y={250} p={pop(t, a + 0.1, 11, 170) * 0.62}><WhiteHouse flag={Math.sin(t * 6)} /></At>
      <At x={540} y={300} p={pop(t, a + 0.2, 11, 190)}><LabelBox text="WHITE HOUSE" x={0} y={0} w={240} size={26} /></At>
      <At x={540} y={540} p={pop(t, a + 0.25, 11, 170) * 0.7}><Capitol /></At>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={`M540 640 V${640 + 50 * Math.min(1, br * 3)}`} stroke="#fff" strokeWidth={5} />
        {br > 0.33 && <path d={`M540 690 H${540 - 270 * clamp01((br - 0.33) * 3)} M540 690 H${540 + 250 * clamp01((br - 0.33) * 3)}`} stroke="#fff" strokeWidth={5} />}
        {br > 0.66 && <path d={`M270 690 V${690 + 40 * clamp01((br - 0.66) * 3)} M790 690 V${690 + 40 * clamp01((br - 0.66) * 3)}`} stroke="#fff" strokeWidth={5} />}
        {Array.from({ length: 72 }, (_, i) => { const q = clamp01(hFill * 78 - i) ; return q > 0 ? <Person key={i} x={130 + (i % 12) * 26} y={860 + Math.floor(i / 12) * 62} s={0.62 * q} /> : null; })}
        {Array.from({ length: 20 }, (_, i) => { const q = clamp01(sFill * 24 - i); return q > 0 ? <Person key={i} x={700 + (i % 5) * 44} y={860 + Math.floor(i / 5) * 62} s={0.62 * q} /> : null; })}
      </svg>
      <LabelBox text="HOUSE OF REPRESENTATIVES" x={270} y={770} w={430} size={30} p={pop(t, C.house1 - 0.05, 10, 200)} />
      <LabelBox text="SENATE" x={790} y={770} w={240} size={30} p={pop(t, C.senate1 - 0.1, 10, 200)} />
      {t > C.house1 && <At x={270} y={1290}><Big text={fmt(435 * ramp(t, C.house1 + 0.2, C.n435, easeOut))} size={150} /></At>}
      {t > C.senate1 && <At x={790} y={1290}><Big text={fmt(100 * ramp(t, C.senate1 + 0.1, C.n100, easeOut))} size={150} /></At>}
    </AbsoluteFill>
  );
};

/** 39.3–44.4: the big states dominate the House (26 to 1, the beam tips), so the Senate exists. */
const NY_SHAPE = () => GEO.states['New York'], WY_SHAPE = () => GEO.states.Wyoming;
const shapeD = (rings: P[][], cx: number, cy: number, size: number) => {
  const pts = rings.flat();
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = size / Math.max(x1 - x0, y1 - y0);
  return rings.map((r) => r.map((p, i) => `${i ? 'L' : 'M'}${(cx + (p[0] - (x0 + x1) / 2) * k).toFixed(1)},${(cy - (p[1] - (y0 + y1) / 2) * k).toFixed(1)}`).join('') + 'Z').join('');
};
const BoardDominate: React.FC<{ t: number }> = ({ t }) => {
  const tip = ramp(t, C.dominate - 0.2, C.dominate + 0.5, (x) => 1 - (1 - x) ** 3) - 0.12 * Math.exp(-6 * Math.max(0, t - C.dominate - 0.5)) * Math.sin(Math.max(0, t - C.dominate - 0.5) * 12);
  const ang = -14 * tip * (1 - ramp(t, C.senateexists + 0.2, C.senateexists + 0.9, inOut));
  const sen = pop(t, C.senateexists - 0.15, 9, 200);
  return (
    <AbsoluteFill>
      <At x={540} y={250} p={pop(t, C.so - 0.1, 11, 190)}><LabelBox text="HOUSE OF REPRESENTATIVES" x={0} y={0} w={560} size={40} /></At>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `rotate(${ang}deg)`, transformOrigin: '540px 1040px' }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <rect x={120} y={1030} width={840} height={20} rx={8} fill="#E9ECF0" />
          <path d={shapeD(NY_SHAPE(), 280, 860, 300)} fill={K.orange} stroke="#fff" strokeWidth={5} />
          <path d={shapeD(WY_SHAPE(), 800, 900, 190)} fill={K.red} stroke="#fff" strokeWidth={5} />
        </svg>
        {Array.from({ length: 26 }, (_, i) => { const q = pop(t, C.so + 0.1 + i * 0.03, 10, 200); return q > 0 ? <div key={i} style={{ position: 'absolute', left: 156 + (i % 9) * 28, top: 905 - Math.floor(i / 9) * 64 + 60, transform: `scale(${q})` }}><svg width={30} height={70} viewBox="-15 -70 30 70"><Person x={0} y={0} s={0.85} /></svg></div> : null; })}
        <div style={{ position: 'absolute', left: 785, top: 965, transform: `scale(${pop(t, C.so + 0.4, 10, 200)})` }}><svg width={30} height={70} viewBox="-15 -70 30 70"><Person x={0} y={0} s={0.85} /></svg></div>
        <At x={280} y={1130} p={pop(t, C.so + 0.2, 10, 200)}><Big text="26" size={130} /></At>
        <At x={800} y={1130} p={pop(t, C.so + 0.45, 10, 200)}><Big text="1" size={130} /></At>
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}><polygon points="540,1050 500,1130 580,1130" fill="#E9ECF0" /></svg>
      {sen > 0 && (
        <>
          <At x={540} y={480} p={sen}><LabelBox text="SENATE" x={0} y={0} w={380} size={70} /></At>
          <div style={{ position: 'absolute', left: 540 - 260 * sen, top: 480 - 110 * sen, width: 520 * sen, height: 220 * sen, borderRadius: '50%', border: `6px solid ${K.gold}`, opacity: clamp01((t - C.senateexists) / 0.2), transform: 'rotate(-4deg)' }} />
        </>
      )}
      <Hand text="big states win" x={300} y={640} size={66} p={ramp(t, C.dominate, C.dominate + 0.7, linear)} rot={-8} />
    </AbsoluteFill>
  );
};

/** 51.7–70: the Senate arc (6 years, a third every 2, 35 this time); the federal law; then both chambers fill (Null B). */
const BoardSenateLaw: React.FC<{ t: number }> = ({ t }) => {
  const arcIn = pop(t, C.senserve - 0.2, 11, 170);
  const arcOut = ramp(t, C.topass - 0.3, C.topass + 0.2, inOut);
  const third = (i: number) => i % 3 === 0;
  const n35 = (i: number) => i < 35;
  const glow = (i: number) => (t > C.n35 - 0.1 ? (n35(i) ? 1 : 0) : t > C.third ? (third(i) ? 0.6 + 0.4 * Math.sin(t * 8) : 0) : 0);
  const sColor = (i: number) => (t > C.n35 - 0.1 ? (n35(i) ? K.gold : 'rgba(255,255,255,0.35)') : t > C.third ? (third(i) ? K.gold : '#fff') : '#fff');
  // the law: paper travels House -> Senate -> White House
  const law = t > C.topass - 0.1 && t < C.thatswhy + 0.2;
  const lp = (() => {
    const H: P = [280, 900], Sn: P = [800, 900], Wh: P = [540, 560], In: P = [540, 2200];
    const seg = (a: P, b: P, q: number): P => [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
    if (t < C.both) return seg(In, H, ramp(t, C.topass, C.federal + 0.2, easeOut));
    if (t < C.signs - 0.9) return seg(H, Sn, ramp(t, C.both + 0.25, C.both + 0.75, inOut));
    return seg(Sn, Wh, ramp(t, C.signs - 0.9, C.signs - 0.3, inOut));
  })();
  const fillB = ramp(t, C.thatswhy + 0.1, C.whoever + 0.8, linear);
  const bothO = win(t, C.thatswhy, C.should + 0.4, 0.3, 0.4);
  return (
    <AbsoluteFill>
      {arcOut < 1 && (
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - arcOut, transform: `scale(${arcIn * (1 - 0.3 * arcOut)}) translateY(${-arcOut * 300}px)`, transformOrigin: '540px 900px' }}>
          <At x={540} y={420}><LabelBox text="SENATE" x={0} y={0} w={320} size={56} /></At>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <Hemicycle cx={540} cy={1060} n={100} rows={5} r0={200} r1={430} color={sColor} glow={glow} />
          </svg>
          <At x={540} y={1000} p={pop(t, C.senserve + 0.2, 10, 200)}><Big text="100" size={130} color="#fff" /></At>
          <Hand text="6 years" x={230} y={1160} size={84} p={ramp(t, C.six - 0.15, C.six + 0.4, linear)} rot={-8} />
          <Hand text="every 2 years: about 1/3" x={600} y={1240} size={62} p={ramp(t, C.third - 0.1, C.third + 0.9, linear)} rot={-4} color="#fff" />
          {t > C.n35 - 0.15 && <At x={540} y={1350} p={pop(t, C.n35 - 0.1, 10, 200)}><Tag text="35 SEATS · NOV 3, 2026" size={50} color={K.gold} /></At>}
        </div>
      )}
      {law && (
        <div style={{ opacity: 1 - ramp(t, C.thatswhy - 0.2, C.thatswhy + 0.2, linear) }}>
          <At x={540} y={360} p={pop(t, C.topass, 11, 170) * 0.55}><WhiteHouse flag={Math.sin(t * 6)} /></At>
          <LabelBox text="HOUSE" x={280} y={1080} w={250} size={44} p={pop(t, C.topass + 0.1, 10, 200)} />
          <LabelBox text="SENATE" x={800} y={1080} w={250} size={44} p={pop(t, C.topass + 0.2, 10, 200)} />
          <Tick t={t} t0={C.both + 0.1} x={280} y={1190} />
          <Tick t={t} t0={C.both + 0.8} x={800} y={1190} />
          <At x={lp[0]} y={lp[1]} rot={Math.sin(t * 2) * 3} p={0.95}><LawPaper sign={ramp(t, C.signs - 0.1, C.signs + 0.5, linear)} seal={pop(t, C.signs + 0.55, 9, 220)} /></At>
          {t > C.signs - 0.5 && (() => { const q = ramp(t, C.signs - 0.1, C.signs + 0.5, linear); const px = lp[0] - 90 + 120 * q, py = lp[1] + 120 + Math.sin(q * 18) * 10; return <div style={{ position: 'absolute', left: px - 30, top: py - 190, transform: `rotate(30deg) translateY(${(1 - pop(t, C.signs - 0.5, 10, 160)) * -300}px)`, transformOrigin: '30px 190px' }}><Pen /></div>; })()}
        </div>
      )}
      {bothO > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: bothO }}>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <Hemicycle cx={290} cy={1080} n={435} rows={11} r0={80} r1={235} fill={fillB} color={(i, n) => (i < n * 0.5 ? K.blue : K.red)} />
            <Hemicycle cx={800} cy={1080} n={100} rows={5} r0={60} r1={190} fill={fillB} color={(i, n) => (i < n * 0.5 ? K.blue : K.red)} />
          </svg>
          <At x={290} y={1130} p={pop(t, C.thatswhy + 0.2, 10, 200)}><Big text="HOUSE" size={54} color="#fff" /></At>
          <At x={800} y={1130} p={pop(t, C.thatswhy + 0.3, 10, 200)}><Big text="SENATE" size={54} color="#fff" /></At>
          {t > C.whoever && <div style={{ position: 'absolute', left: 120, top: 740, width: 840, height: 440, borderRadius: 40, border: `6px solid ${K.gold}`, opacity: clamp01((t - C.whoever) / 0.2), transform: `scale(${pop(t, C.whoever, 10, 200)})` }} />}
          {t > C.whoever && <At x={540} y={700} p={pop(t, C.bothch, 10, 200)}><Tag text="WHOEVER HOLDS BOTH" size={44} color={K.gold} /></At>}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.each - 0.1, t1: C.so - 0.6, from: 0.1 },
  { name: 'B', t0: C.thatswhy - 0.1, t1: C.reach - 0.9, from: 0.6 },
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
        <OffthreadVideo src={staticFile(`uscongress/null/null_us_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ captions, grade, credits
const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t < 0.3 || t > DURATION_S - 0.3) return null;
  let i = -1;
  for (let k = 0; k < CAPS.length; k++) if (CAPS[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = CAPS.slice(g, g + 3);
  const last = words[words.length - 1];
  if (t > last[0] + 1.2 && (!CAPS[g + 3] || t < CAPS[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 1470, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: '#fff', textTransform: 'uppercase',
      WebkitTextStroke: `10px ${K.ink}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, w], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? K.gold : '#fff' }}>{w} </span>)}
    </div>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · DC aerial: USGS The National Map · borders: Natural Earth · districts: US Census Bureau';
const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.5))' }} />
    <AbsoluteFill style={{ boxShadow: 'inset 0 0 240px rgba(0,0,0,0.5)' }} />
  </>
);

export const UsCongress: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const c0 = camAt(t);
  const [sx, sy] = shake(t);
  const mv = camMotion(t);
  const blur = Math.min(14, Math.hypot(mv.vx, mv.vy) * 0.06 + mv.zoom * 6);
  const split = splitAt(t);
  const off = split ? -480 * split.q : 0;
  const tilt = tiltAt(t);
  const bd = boardAt(t);
  const boardFull = bd && bd.x === 0 && bd.mask >= 1;
  const mapX = bd && bd.x !== 0 ? bd.x + (bd.x < 0 ? 1080 : -1080) : 0;
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      {!boardFull && (
        <AbsoluteFill style={{ transform: `translate(${sx + mapX}px, ${sy + off}px)` }}>
          <AbsoluteFill style={{ transform: tilt > 0.01 ? `perspective(1600px) rotateX(${tilt.toFixed(2)}deg) scale(${1 + tilt * 0.032})` : undefined, transformOrigin: '50% 60%' }}>
            <AbsoluteFill style={{ filter: blur > 0.6 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
              <MapLayers c={c0} />
              <MapVectors t={t} c={c0} />
            </AbsoluteFill>
          </AbsoluteFill>
          <Grade />
          <MapOverlays t={t} c={c0} />
        </AbsoluteFill>
      )}
      {bd && (
        <AbsoluteFill style={{ transform: `translate(${bd.x}px, ${off}px)`, ...(bd.mask < 1 ? { WebkitMaskImage: inkMask(bd.mask), maskImage: inkMask(bd.mask) } : {}) }}>
          <BoardScene t={t} k={bd.k} />
        </AbsoluteFill>
      )}
      {split && <NullPanel t={t} q={split.q} {...split.w} />}
      {captions && !split && <Captions t={t} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={t} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
export { LOOPF };
