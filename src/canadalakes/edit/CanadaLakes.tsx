import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, kick, linear, pop, ramp } from '../../darien/anim';
import { QuestionStorm } from '../motion/QuestionStorm';
import { ThoughtBubble } from '../motion/ThoughtBubble';
import { PeopleCrowd } from '../motion/PeopleCrowd';
import { C, CAPS, Cam, DURATION_S, GEO, LOOPF, P, camAt, camMotion, merc, ringsD, shake, toS } from './cam';
import { LABEL, TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';

export const CA_DURATION_60 = Math.round(DURATION_S * 60);
const FPS = 60;
const F = (s: number) => Math.round(s * FPS);
const AUDIO = 'canadalakes/audio/mix.wav';
const IMG = (k: string) => staticFile(`canadalakes/img/${k}`);
const RED = '#E2333A', CYAN = '#3FE6F0', GOLD = '#FFD23F';

/** A layer that lives from t0 to t1 (seconds) with its own frame clock starting at 0. */
const At: React.FC<{ t0: number; t1: number; children: React.ReactNode }> = ({ t0, t1, children }) => (
  <Sequence from={F(t0)} durationInFrames={Math.max(1, F(t1) - F(t0))} layout="none">{children}</Sequence>
);
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));

// ------------------------------------------------------------------ labels (the reference's two-tone boxed labels)
const TwoTone: React.FC<{ a: string; b: string; size?: number }> = ({ a, b, size = 64 }) => (
  <div style={{ display: 'inline-block', fontFamily: TITLE, fontSize: size, lineHeight: 1.05, color: '#fff', whiteSpace: 'nowrap', letterSpacing: 1,
    WebkitTextStroke: `${Math.round(size / 9)}px #0A0F16`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
    {a} <span style={{ color: GOLD }}>{b}</span>
  </div>
);
const Pin: React.FC<{ t: number; t0: number; x: number; y: number; size?: number; label?: React.ReactNode; side?: 1 | -1 }> = ({ t, t0, x, y, size = 110, label, side = 1 }) => {
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
/** Big word slam (the reference's "nightmare…"): flies in huge from the top left, bounces down to size. */
const Slam: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; children: React.ReactNode }> = ({ t, t0, t1, x, y, children }) => {
  if (t < t0 || t > t1) return null;
  const p = pop(t, t0, 9, 200, 0.8);
  const s = 3.2 - 2.2 * p;
  const o = Math.min(clamp01((t - t0) / 0.08), 1 - ramp(t, t1 - 0.2, t1, linear));
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) translate(${(1 - p) * -300}px, ${(1 - p) * -500}px) scale(${s}) rotate(${(1 - p) * -12 - 3}deg)`, opacity: o }}>{children}</div>;
};
const TypeText: React.FC<{ t: number; t0: number; per: number; text: string; style: React.CSSProperties; accentFrom?: number }> = ({ t, t0, per, text, style, accentFrom }) => {
  if (t < t0) return null;
  const ch = Array.from(text);
  const n = Math.min(ch.length, Math.floor((t - t0) / per) + 1);
  return (
    <span style={style}>
      {ch.slice(0, n).map((c, i) => <span key={i} style={accentFrom != null && i >= accentFrom ? { color: GOLD } : undefined}>{c}</span>)}
      {n < ch.length && <span style={{ opacity: 0.85 }}>|</span>}
    </span>
  );
};

// ------------------------------------------------------------------ the map scene
const LAKES = GEO.lakes, PROV = GEO.provinces, PT = GEO.points;
type Fill = { key: string; rings: P[][]; color: string; t0: number; t1: number; edge?: string };
const FILLS: Fill[] = [
  { key: 'can', rings: GEO.countries.Canada, color: RED, t0: C.bees1 + 0.9, t1: DURATION_S, edge: '#fff' },
  { key: 'bc', rings: PROV['British Columbia'], color: '#FF7A2E', t0: C.bc7 + 0.2, t1: C.another7 - 0.4, edge: '#fff' },
  { key: 'mb', rings: PROV.Manitoba, color: '#FF7A2E', t0: C.manitoba8 + 0.2, t1: C.stupid8 - 0.5, edge: '#fff' },
  { key: 'ns', rings: PROV['Nova Scotia'], color: '#FF9A2E', t0: C.nova8 + 0.15, t1: C.bigass8 - 0.6, edge: '#fff' },
];
const LAKE_FILLS: Fill[] = [
  { key: 'ath', rings: LAKES['Lake Athabasca'], color: CYAN, t0: C.athabasca3 + 0.25, t1: C.end3 + 0.4 },
  { key: 'an', rings: LAKES['Another Lake'], color: CYAN, t0: C.another7 + 0.05, t1: C.end7 + 0.2 },
  { key: 'aan', rings: LAKES['And Another Lake'], color: CYAN, t0: C.andanother7 + 0.05, t1: C.end7 + 0.2 },
  { key: 'st', rings: LAKES['Stupid Lake'], color: CYAN, t0: C.stupid8, t1: C.nova8 + 0.3 },
  { key: 'ba', rings: LAKES['Big Ass Lake'], color: '#0B0F14', t0: C.bigass8 - 0.1, t1: C.par9 + 0.5 },
  { key: 'pk', rings: LAKES['Pekwachnamaykoskwaskwaypinwanik Lake'], color: CYAN, t0: C.name9 + 0.2, t1: C.socho11 + 0.8 },
];
const sp = (c: Cam, k: string) => toS(c, PT[k]);

const Vectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  // Canada: white flash, then red (the reference's 0.7–1.6 s), dimmer while zoomed in
  const can = FILLS[0];
  const white = ramp(t, can.t0, can.t0 + 0.08, linear) * (1 - ramp(t, can.t0 + 0.25, can.t0 + 0.75, inOut));
  const red = ramp(t, can.t0 + 0.2, can.t0 + 0.75, inOut) * clamp01((c.mpp - 1500) / 3000) * (1 - ramp(t, C.socho11, C.socho11 + 1.2, inOut));
  const dots = Math.max(win(t, C.bees1 + 1.4, C.end1 + 0.1, 0.9, 0.3), win(t, C.bees2 - 1.4, C.har2 + 0.3, 0.6, 0.3));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.28" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      {(red > 0 || white > 0) && (
        <g>
          <path d={ringsD(c, can.rings)} fill={RED} opacity={red * (0.72 - 0.25 * dots)} />
          <path d={ringsD(c, can.rings)} fill="#fff" opacity={white * 0.85} />
          <path d={ringsD(c, can.rings)} fill="url(#sheen)" opacity={red} />
          <path d={ringsD(c, can.rings)} fill="none" stroke="#fff" strokeWidth={2.5} opacity={Math.max(red, white) * 0.9} />
        </g>
      )}
      {dots > 0 && (
        <g opacity={dots}>
          {GEO.dots.map((p, i) => {
            const on = clamp01((t - (C.bees1 + 1.4) - (i % 97) * 0.012) / 0.2) || clamp01((t - (C.bees2 - 1.4)) / 0.4);
            const [x, y] = toS(c, p);
            if (x < -10 || x > 1090 || y < -10 || y > 1930) return null;
            return <circle key={i} cx={x} cy={y} r={2.2 + 1.2 * Math.sin(i * 7.1 + t * 4) ** 2} fill={CYAN} opacity={on} />;
          })}
        </g>
      )}
      {FILLS.slice(1).map((f) => {
        const o = win(t, f.t0, f.t1, 0.3, 0.35);
        if (o <= 0) return null;
        const lift = pop(t, f.t0, 12, 160);
        const d = ringsD(c, f.rings);
        const [cx, cy] = toS(c, f.rings[0][0]);
        return (
          <g key={f.key} opacity={o} transform={`translate(${cx} ${cy}) scale(${0.9 + 0.1 * lift}) translate(${-cx} ${-cy})`}>
            <path d={d} fill="#000" opacity={0.35} transform="translate(8 14)" filter="url(#glow)" />
            <path d={d} fill={f.color} opacity={0.85} />
            <path d={d} fill="url(#sheen)" />
            <path d={d} fill="none" stroke="#fff" strokeWidth={4} filter="url(#glow)" opacity={0.7} />
            <path d={d} fill="none" stroke="#fff" strokeWidth={3} />
          </g>
        );
      })}
      {LAKE_FILLS.map((f) => {
        const o = win(t, f.t0, f.t1, 0.35, 0.35);
        if (o <= 0) return null;
        const d = ringsD(c, f.rings);
        const g = ramp(t, f.t0, f.t0 + 0.5, easeOut);
        return (
          <g key={f.key} opacity={o}>
            <path d={d} fill={f.color} opacity={(f.color === CYAN ? 0.62 : 0.85) * g} />
            <path d={d} fill="none" stroke="#fff" strokeWidth={4} filter="url(#glow)" opacity={0.8 * g} />
            <path d={d} fill="none" stroke="#fff" strokeWidth={3} opacity={g} />
          </g>
        );
      })}
    </svg>
  );
};

const MapOverlays: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const count = Math.round(2000000 * ramp(t, C.bees1 + 1.5, C.another1 - 0.3, easeOut));
  const countB = win(t, C.bees2 - 1.2, C.har2 + 0.2);
  const ind = (n: number) => n.toLocaleString('en-IN');
  const [ax, ay] = sp(c, 'Lake Athabasca');
  const [anx, any] = sp(c, 'Another Lake');
  const [aax, aay] = sp(c, 'And Another Lake');
  const [stx, sty] = sp(c, 'Stupid Lake');
  const [bax, bay] = sp(c, 'Big Ass Lake');
  const [pkx, pky] = sp(c, 'Pekwachnamaykoskwaskwaypinwanik Lake');
  const out9 = 1 - ramp(t, C.socho11 + 0.3, C.socho11 + 1.2, linear);
  return (
    <AbsoluteFill>
      {/* line 1 and 2: the count */}
      {(t > C.bees1 + 1.4 && t < C.end1 + 0.3) || countB > 0 ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: t < C.end1 + 0.3 ? win(t, C.bees1 + 1.4, C.end1 + 0.3, 0.2, 0.3) : countB,
          transform: `scale(${0.85 + 0.15 * pop(t, C.bees1 + 1.4, 10, 160)})` }}>
          <span style={{ fontFamily: TITLE, fontSize: 132, color: GOLD, WebkitTextStroke: '14px #0A0F16', paintOrder: 'stroke fill', textShadow: '0 0 30px rgba(255,210,63,0.5)' }}>+{ind(t < C.end1 + 0.3 ? count : 2000000)}</span>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 70, color: '#fff', marginTop: -18, textShadow: '0 4px 14px rgba(0,0,0,0.7)' }}>झीलें</div>
        </div>
      ) : null}
      <Slam t={t} t0={C.another1} t1={C.end1 + 0.15} x={540} y={820}>
        <TwoTone a="Another" b="Lake?" size={120} />
      </Slam>
      {/* line 3: First Nations, Athabasca */}
      {t > C.first3 - 0.1 && t < C.athabasca3 - 0.2 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', opacity: win(t, C.first3 - 0.1, C.athabasca3 - 0.2), transform: `scale(${pop(t, C.first3 - 0.1, 10, 170)})` }}>
          <div style={{ display: 'inline-block', padding: '10px 34px', background: 'rgba(10,15,22,0.85)', border: `5px solid ${CYAN}`, borderRadius: 18, fontFamily: TITLE, fontSize: 84, color: '#fff', letterSpacing: 2 }}>FIRST NATIONS</div>
        </div>
      )}
      {t > C.athabasca3 && t < C.end3 + 0.4 && (
        <div style={{ opacity: 1 - ramp(t, C.end3, C.end3 + 0.4, linear) }}>
          <Pin t={t} t0={C.athabasca3 + 0.2} x={ax} y={ay} size={120} label={<TwoTone a="Lake" b="Athabasca" size={84} />} />
          <div style={{ position: 'absolute', left: 60, right: 60, top: 1180, textAlign: 'center' }}>
            <TypeText t={t} t0={C.matlab3 + 0.3} per={0.06} text={'"जहाँ सरकंडे उगते हैं"'} style={{ fontFamily: UI, fontWeight: 800, fontSize: 88, color: GOLD, textShadow: '0 6px 18px rgba(0,0,0,0.75)', WebkitTextStroke: '3px #0A0F16' }} />
          </div>
        </div>
      )}
      {/* line 7: the two lakes, a few hundred metres apart */}
      {t > C.another7 && t < C.end7 + 0.3 && (
        <div style={{ opacity: 1 - ramp(t, C.end7, C.end7 + 0.3, linear) }}>
          <Pin t={t} t0={C.another7} x={anx} y={any} size={130} label={<TwoTone a="Another" b="Lake" size={92} />} />
          {t > C.kuch7 && (() => {
            const p = ramp(t, C.kuch7, C.kuch7 + 0.6, easeOut);
            const x2 = anx + (aax - anx) * p, y2 = any + (aay - any) * p;
            return (
              <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
                <line x1={anx} y1={any} x2={x2} y2={y2} stroke="#fff" strokeWidth={7} strokeDasharray="22 16" strokeDashoffset={-t * 120} />
                <g opacity={ramp(t, C.kuch7 + 0.4, C.kuch7 + 0.7, linear)}>
                  <rect x={(anx + aax) / 2 - 190} y={(any + aay) / 2 + 40} width={380} height={96} rx={18} fill="rgba(10,15,22,0.88)" stroke={GOLD} strokeWidth={4} />
                  <text x={(anx + aax) / 2} y={(any + aay) / 2 + 106} textAnchor="middle" fontFamily={UI} fontWeight={800} fontSize={58} fill="#fff">कुछ सौ मीटर</text>
                </g>
              </svg>
            );
          })()}
          <Pin t={t} t0={C.andanother7} x={aax} y={aay} size={130} side={-1} label={<TwoTone a="And Another" b="Lake" size={78} />} />
        </div>
      )}
      {/* line 8 */}
      {t > C.stupid8 - 0.2 && t < C.nova8 + 0.2 && <Pin t={t} t0={C.stupid8 - 0.15} x={stx} y={sty} size={130} label={<TwoTone a="Stupid" b="Lake" size={100} />} />}
      {t > C.y1953 - 0.1 && t < C.bigass8 - 0.5 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: win(t, C.y1953 - 0.1, C.bigass8 - 0.5), transform: `scale(${2.4 - 1.4 * pop(t, C.y1953 - 0.1, 9, 220)}) rotate(-6deg)` }}>
          <div style={{ display: 'inline-block', padding: '0 34px', border: `10px solid ${RED}`, borderRadius: 16, fontFamily: TITLE, fontSize: 170, color: RED, background: 'rgba(255,255,255,0.88)', letterSpacing: 6 }}>1953</div>
        </div>
      )}
      {t > C.bigass8 - 0.15 && t < C.par9 + 0.4 && (
        <div style={{ opacity: 1 - ramp(t, C.par9, C.par9 + 0.4, linear) }}>
          <Pin t={t} t0={C.bigass8 - 0.1} x={bax} y={bay} size={130} label={<TwoTone a="Big Ass" b="Lake" size={104} />} />
        </div>
      )}
      {/* line 9: every named lake on the map, then the long name */}
      {t > C.par9 + 0.5 && t < C.name9 - 0.1 && (
        <div style={{ opacity: 1 - ramp(t, C.name9 - 0.4, C.name9 - 0.1, linear) }}>
          {['Lake Athabasca', 'Lake Louise', 'Another Lake', 'Stupid Lake', 'Big Ass Lake', 'Lake Mistassini', 'Lake Nipigon'].map((k, i) => {
            const [x, y] = sp(c, k);
            return <Pin key={k} t={t} t0={C.par9 + 0.55 + i * 0.12} x={x} y={y} size={64} label={<span style={{ fontFamily: LABEL, fontWeight: 800, fontSize: 30, color: '#fff', textShadow: '0 2px 6px #000', whiteSpace: 'nowrap' }}>{k}</span>} />;
          })}
        </div>
      )}
      {t > C.name9 && t < DURATION_S && (
        <div style={{ opacity: Math.min(out9, 1 - win(t, C.billi10 - 0.5, C.cree10 - 0.1, 0.15, 0.15)) }}>
          <Pin t={t} t0={C.name9 + 0.1} x={pkx} y={pky} size={120} />
          <div style={{ position: 'absolute', left: 30, right: 30, top: pky - 330, textAlign: 'center', transform: `scale(${pop(t, C.name9 + 0.2, 12, 170)})` }}>
            <div style={{ display: 'inline-block', padding: '14px 26px', background: 'rgba(10,15,22,0.88)', borderRadius: 18, border: '4px solid #fff' }}>
              <TypeText t={t} t0={C.name9 + 0.2} per={(C.end9 - C.name9 - 0.6) / 31} text="Pekwachnamaykoskwaskwaypinwanik" accentFrom={31} style={{ fontFamily: TITLE, fontSize: 54, color: '#fff', letterSpacing: 1 }} />
              <span style={{ fontFamily: TITLE, fontSize: 54, color: GOLD, opacity: ramp(t, C.end9 - 0.4, C.end9 - 0.2, linear) }}> Lake</span>
            </div>
          </div>
          {t > C.cree10 && (
            <>
              <div style={{ position: 'absolute', left: 0, right: 0, top: pky - 470, textAlign: 'center', transform: `scale(${pop(t, C.cree10 + 0.15, 10, 180)})` }}>
                <span style={{ padding: '6px 30px', background: CYAN, borderRadius: 14, fontFamily: TITLE, fontSize: 70, color: '#0A0F16', letterSpacing: 3 }}>CREE</span>
              </div>
              <div style={{ position: 'absolute', left: 50, right: 50, top: pky + 90, textAlign: 'center' }}>
                <TypeText t={t} t0={C.matlab10 + 0.3} per={0.045} text={'"जहाँ जंगली ट्राउट मछली काँटे से पकड़ी जाती है"'} style={{ fontFamily: UI, fontWeight: 800, fontSize: 70, lineHeight: 1.25, color: GOLD, WebkitTextStroke: '3px #0A0F16', textShadow: '0 6px 18px rgba(0,0,0,0.75)' }} />
              </div>
            </>
          )}
        </div>
      )}
      {/* the trout, swinging down on its line */}
      {t > C.trout10 - 0.3 && (() => {
        const p = pop(t, C.trout10 - 0.3, 8, 120);
        const sw = Math.sin((t - C.trout10) * 5.5) * 7 * Math.exp(-(t - C.trout10) * 0.6) + Math.sin(t * LOOPF(23)) * 2;
        const o = 1 - ramp(t, C.socho11 + 0.2, C.socho11 + 0.9, linear);
        return (
          <div style={{ position: 'absolute', left: 790, top: -1800 + 2800 * p, width: 260, height: 634, transformOrigin: '50% 0%', transform: `rotate(${sw}deg)`, opacity: o, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.55))' }}>
            <div style={{ position: 'absolute', left: 128, top: -2000, width: 3, height: 2000, background: 'rgba(240,240,240,0.9)' }} />
            <Img src={IMG('c07_trout_hook.png')} style={{ width: 260, height: 634 }} />
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ full-screen inserts
/** Line 2: the two mapmakers panic in the map office, Canada (with the dots) on the board behind them. */
const MapRoom: React.FC<{ t: number }> = ({ t }) => {
  const a = C.canada2, b = C.bees2 - 1.5;
  if (t < a - 0.05 || t > b + 0.3) return null;
  const o = Math.min(ramp(t, a - 0.05, a + 0.1, linear), 1 - ramp(t, b, b + 0.3, linear));
  const push = 1 + 0.06 * ramp(t, a, b, linear);
  const board: Cam = { x: merc(-97, 60)[0], y: merc(-97, 60)[1], mpp: 9800 * (1080 / 700) };
  const shk = kick(t, a + 0.35, 10, 30, 7);
  return (
    <AbsoluteFill style={{ opacity: o, background: '#2a1d14', transform: `scale(${push})` }}>
      {/* the board: the map behind the green key */}
      <div style={{ position: 'absolute', left: 192, top: 290, width: 700, height: 560, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -190, top: -680, width: 1080, height: 1920, transform: 'scale(0.648)', transformOrigin: '540px 960px' }}>
          <MapLayers c={board} />
          <Vectors t={Math.max(t, C.bees1 + 3)} c={board} />
        </div>
      </div>
      <Img src={IMG('c06_map_room.png')} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920 }} />
      <Img src={IMG('c04_cartographer_a.png')} style={{ position: 'absolute', left: -40 + shk, top: 1920 - 1440 * pop(t, a + 0.1, 11, 170) + 260, width: 590, height: 1355, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.5))' }} />
      <Img src={IMG('c05_cartographer_b.png')} style={{ position: 'absolute', left: 500 - shk, top: 1920 - 1440 * pop(t, a + 0.3, 11, 170) + 250, width: 700, height: 1350, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.5))' }} />
    </AbsoluteFill>
  );
};

/** Line 4: Lake Louise whips in as a card (the lake from the satellite, filled), named for Princess Louise. */
const LouiseCard: React.FC<{ t: number }> = ({ t }) => {
  const a = C.kuch4 + 0.25, b = C.end4 + 0.1;
  if (t < a || t > b + 0.15) return null;
  const pin = ramp(t, a, a + 0.09, easeOut), pout = ramp(t, b, b + 0.12, (x) => x * x * x);
  const x = (1 - pin) * 1300 - pout * 1300;
  const blur = (1 - pin) * 34 + pout * 34;
  const lc = GEO.points['Lake Louise'];
  const cam: Cam = { x: lc[0] - 350, y: lc[1] - 500, mpp: 3.4 - 0.4 * ramp(t, a, b, linear) };
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 1000, height: 1300, transform: `translateX(${x}px) rotate(${-2 * pin}deg)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined, border: '14px solid #fff', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', overflow: 'hidden', background: '#0b1a12' }}>
        <div style={{ position: 'absolute', left: -40, top: -310, width: 1080, height: 1920 }}>
          <MapLayers c={cam} />
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <path d={ringsD(cam, GEO.lakes['Lake Louise'])} fill={CYAN} opacity={0.45 * ramp(t, C.louise4 - 0.1, C.louise4 + 0.3, linear)} />
            <path d={ringsD(cam, GEO.lakes['Lake Louise'])} fill="none" stroke="#fff" strokeWidth={4} opacity={ramp(t, C.louise4 - 0.1, C.louise4 + 0.3, linear)} />
          </svg>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', opacity: win(t, C.princess4 - 0.2, C.louise4 - 0.1, 0.15, 0.15), transform: `scale(${pop(t, C.princess4 - 0.2, 11, 180)})` }}>
          <svg width={120} height={84} viewBox="0 0 60 42"><path d="M4 38 L8 12 L20 26 L30 6 L40 26 L52 12 L56 38 Z" fill={GOLD} stroke="#0A0F16" strokeWidth={3} /></svg>
          <div><TwoTone a="Princess" b="Louise" size={96} /></div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', opacity: ramp(t, C.louise4 - 0.1, C.louise4 + 0.1, linear), transform: `scale(${pop(t, C.louise4 - 0.1, 10, 190)})` }}>
          <TwoTone a="Lake" b="Louise" size={130} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Line 5: Long, Clear and Mirror Lake stack in as three panels (the reference's 34–37 s). */
const Panels: React.FC<{ t: number }> = ({ t }) => {
  const a = C.long5 - 0.15, b = C.jheelen6 + 0.1;
  if (t < a || t > b + 0.2) return null;
  const items: [string, string, number][] = [['l01_long_lake.jpg', 'Long', C.long5 - 0.15], ['l02_clear_lake.jpg', 'Clear', C.clear5 - 0.12], ['l03_mirror_lake.jpg', 'Mirror', C.mirror5 - 0.12]];
  const out = ramp(t, b, b + 0.2, linear);
  return (
    <AbsoluteFill style={{ background: '#0a0f14', opacity: 1 - out }}>
      {items.map(([img, word, t0], i) => {
        if (t < t0) return null;
        const p = ramp(t, t0, t0 + 0.14, easeOut);
        const push = 1.08 - 0.06 * ramp(t, t0, b, linear);
        return (
          <div key={img} style={{ position: 'absolute', left: 0, top: 18 + i * 634, width: 1080, height: 616, overflow: 'hidden', transform: `translateX(${(1 - p) * (i % 2 ? -1100 : 1100)}px)`, filter: p < 1 ? `blur(${(1 - p) * 26}px)` : undefined, borderTop: '6px solid #fff', borderBottom: '6px solid #fff' }}>
            <Img src={IMG(img)} style={{ position: 'absolute', left: 0, top: -2, width: 1080, height: 620, objectFit: 'cover', transform: `scale(${push})` }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center', transform: `scale(${pop(t, t0 + 0.08, 10, 190)})` }}><TwoTone a={word} b="Lake" size={120} /></div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Line 10: the cat walks across the keyboard of an old computer showing the long-name lake. */
const CatDesk: React.FC<{ t: number }> = ({ t }) => {
  const a = C.billi10 - 0.5, b = C.cree10 - 0.1;
  if (t < a - 0.05 || t > b + 0.2) return null;
  const o = Math.min(ramp(t, a - 0.05, a + 0.12, linear), 1 - ramp(t, b, b + 0.2, linear));
  const pk = GEO.points['Pekwachnamaykoskwaskwaypinwanik Lake'];
  const screen: Cam = { x: pk[0], y: pk[1] - 2400, mpp: 17 * (1080 / 812) };
  const walk = ramp(t, a + 0.15, b + 0.2, linear);
  const step = t * 9;
  const cx = -760 + 1900 * walk, cy = 1265 - Math.abs(Math.sin(step)) * 16;
  return (
    <AbsoluteFill style={{ opacity: o, background: '#2a1d14', transform: `scale(${1.02 + 0.04 * ramp(t, a, b, linear)})` }}>
      <div style={{ position: 'absolute', left: 134, top: 381, width: 812, height: 631, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -134, top: -644, width: 1080, height: 1920, transform: 'scale(0.752)', transformOrigin: '540px 960px' }}>
          <MapLayers c={screen} />
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <path d={ringsD(screen, GEO.lakes['Pekwachnamaykoskwaskwaypinwanik Lake'])} fill={CYAN} opacity={0.6} stroke="#fff" strokeWidth={4} />
          </svg>
        </div>
        <div style={{ position: 'absolute', left: 30, right: 30, top: 70, textAlign: 'center', fontFamily: TITLE, fontSize: 38, color: '#fff', background: 'rgba(10,15,22,0.8)', padding: '6px 0', borderRadius: 10 }}>Pekwachnamaykoskwaskwaypinwanik Lake</div>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 5px)', mixBlendMode: 'multiply' }} />
      </div>
      <Img src={IMG('c03_crt_desk.png')} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920 }} />
      {/* tail first (behind the body), swaying from its base */}
      <div style={{ position: 'absolute', left: cx - 70, top: cy - 300, width: 190, height: 516, transformOrigin: '50% 100%', transform: `rotate(${-20 + Math.sin(t * 6) * 14}deg)` }}>
        <Img src={IMG('c02_cat_tail.png')} style={{ width: 190, height: 516 }} />
      </div>
      <Img src={IMG('c01_cat.png')} style={{ position: 'absolute', left: cx, top: cy - 110, width: 760, height: 533, transform: `rotate(${Math.sin(step) * 2.5}deg)`, filter: 'drop-shadow(0 20px 22px rgba(0,0,0,0.5))' }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.phir5 - 0.1, t1: C.long5 - 0.2, from: 0.2 },
  { name: 'B', t0: C.official8 + 0.6, t1: C.par9 + 0.1, from: 2.0 },
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
        <OffthreadVideo src={staticFile(`canadalakes/null/null_ca_${name}1.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
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
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders, lakes: Natural Earth · small lakes traced from Sentinel-2';
const Grade: React.FC<{ t: number }> = () => (
  <>
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.45))' }} />
    <AbsoluteFill style={{ boxShadow: 'inset 0 0 240px rgba(0,0,0,0.55)' }} />
  </>
);

export const CanadaLakes: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const c0 = camAt(t);
  const [sx, sy] = shake(t);
  const mv = camMotion(t);
  const blur = Math.min(14, Math.hypot(mv.vx, mv.vy) * 0.06 + mv.zoom * 6);
  const split = splitAt(t);
  const fullInsert = (t > C.canada2 - 0.05 && t < C.bees2 - 1.2) || (t > C.long5 - 0.15 && t < C.jheelen6 + 0.3) || (t > C.billi10 - 0.55 && t < C.cree10 + 0.1);
  const mapOff = split ? -480 * split.q : 0;
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy + mapOff}px)` }}>
        <AbsoluteFill style={{ filter: blur > 0.6 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
          <MapLayers c={c0} />
          <Vectors t={t} c={c0} />
        </AbsoluteFill>
        <Grade t={t} />
        <MapOverlays t={t} c={c0} />
        <At t0={C.har2 - 0.05} t1={C.shuru3 + 0.8}><QuestionStorm n={180} popEvery={0.3} collapseAt={F(C.shuru3 - C.har2 + 0.05)} font={TITLE} /></At>
        <At t0={C.phir5 - 0.05} t1={C.long5}><ThoughtBubble x={640} y={980} size={760} /></At>
        <At t0={C.shikari6 - 0.1} t1={C.end6 + 0.3}>
          <div style={{ opacity: 1 }}><PeopleCrowd x={560} y={1150} n={24} h={300} spread={860} every={2} /></div>
        </At>
        {t > C.wahi6 && t < C.end6 + 0.3 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: win(t, C.wahi6, C.end6 + 0.3), transform: `scale(${2.2 - 1.2 * pop(t, C.wahi6, 9, 220)}) rotate(-5deg)` }}>
            <span style={{ display: 'inline-block', padding: '0 30px', border: `9px solid ${RED}`, borderRadius: 14, fontFamily: TITLE, fontSize: 120, color: RED, background: 'rgba(255,255,255,0.9)', letterSpacing: 6 }}>OFFICIAL</span>
          </div>
        )}
      </AbsoluteFill>
      <LouiseCard t={t} />
      <MapRoom t={t} />
      <Panels t={t} />
      <CatDesk t={t} />
      {split && <NullPanel t={t} q={split.q} {...split.w} />}
      {captions && !split && <Captions t={t} />}
      {!fullInsert && <div style={{ position: 'absolute', left: 20, right: 20, bottom: 18, textAlign: 'center', fontFamily: LABEL, fontSize: 15, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>}
      <Watermark t={t} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
