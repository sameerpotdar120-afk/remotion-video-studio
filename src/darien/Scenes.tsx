import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp } from './anim';
import { RINGS } from './geo';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";

// ---------------------------------------------------------------- B-roll (30.9–34.14)
const SHOTS = [
  { src: 'broll_forest', t0: 30.9, t1: 32.14, s0: 1.55, s1: 1.12, x0: 0, x1: -30, y0: 40, y1: 0, r0: 0, r1: 0 },
  { src: 'broll_swamp', t0: 32.14, t1: 33.18, s0: 1.25, s1: 1.1, x0: 20, x1: -20, y0: 0, y1: 30, r0: -4, r1: 2 },
  { src: 'broll_mountains', t0: 33.18, t1: 34.3, s0: 1.08, s1: 1.22, x0: 0, x1: 0, y0: 30, y1: -20, r0: 0, r1: 0 },
];

export const BRoll: React.FC<{ t: number }> = ({ t }) => {
  const shot = SHOTS.find((s) => t >= s.t0 && t < s.t1) ?? SHOTS[SHOTS.length - 1];
  const p = ramp(t, shot.t0, shot.t1, linear);
  // each cut lands on a quick zoom punch
  const punch = 1 + 0.08 * Math.exp(-(t - shot.t0) * 10);
  const enter = shot === SHOTS[0] ? ramp(t, 30.9, 31.3, easeOut) : 1;
  // mountains zoom away into the map (34.0–34.3)
  const leave = ramp(t, 34.0, 34.3, easeIn);
  const scale = lerp(shot.s0, shot.s1, shot === SHOTS[0] ? easeOut(p) : p) * punch * lerp(1, 2.4, leave);
  const blur = (1 - enter) * 16 + leave * 18;
  return (
    <AbsoluteFill style={{ background: '#000', opacity: 1 - ramp(t, 34.12, 34.3, linear) }}>
      <Img src={staticFile(`darien/img/${shot.src}.png`)} style={{
        position: 'absolute', left: -100, top: 0, width: 1280, height: 1920,
        transform: `translate(${lerp(shot.x0, shot.x1, p)}px, ${lerp(shot.y0, shot.y1, p)}px) scale(${scale}) rotate(${lerp(shot.r0, shot.r1, p)}deg)`,
        filter: `blur(${blur}px) contrast(1.06) saturate(0.95)`,
      }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)' }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- vintage paper map (40.5–49.1)
// local paper coordinates: the sheet is drawn at 1500 x 2250
const PW = 1500;
const PH = 2250;
const C0 = { lon: -77.55, lat: 8.1, k: 330, x: 760, y: 1220 };
const paperXY = (lon: number, lat: number): [number, number] => [C0.x + (lon - C0.lon) * C0.k, C0.y - (lat - C0.lat) * C0.k];

const ring = RINGS.region[0];
const regionD = 'M' + ring.map(([lon, lat]) => paperXY(lon, lat).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z';

// the road (schematic): yellow down from Panama, a red proposed section through the gap, yellow again into Colombia
const roadIn = [[-79.3, 9.95], [-78.75, 9.4], [-78.2, 8.95], [-77.8, 8.62]].map(([a, b]) => paperXY(a, b));
const roadOut = [[-77.0, 7.08], [-76.65, 6.5], [-76.35, 5.85]].map(([a, b]) => paperXY(a, b));
const gapPts: [number, number][] = [];
{
  const P = paperXY(-77.8, 8.62);
  const Q = paperXY(-77.0, 7.08);
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const q = i / n;
    const nx = -(Q[1] - P[1]);
    const ny = Q[0] - P[0];
    const L = Math.hypot(nx, ny) || 1;
    const w = Math.sin(q * Math.PI * 7) * 22 * Math.sin(q * Math.PI);
    gapPts.push([lerp(P[0], Q[0], q) + (nx / L) * w, lerp(P[1], Q[1], q) + (ny / L) * w]);
  }
}
const polyLen = (pts: number[][]) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
const toD = (pts: number[][]) => 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L');
const LEN = { in: polyLen(roadIn), gap: polyLen(gapPts), out: polyLen(roadOut) };

const PaperContent: React.FC<{ t: number }> = ({ t }) => {
  const pIn = ramp(t, 40.9, 42.0, inOut);
  const pGap = ramp(t, 42.05, 43.1, inOut);
  const pOut = ramp(t, 43.1, 43.7, inOut);
  const redPulse = 1 + 0.5 * Math.max(0, Math.sin((t - 43.1) * 6)) * ramp(t, 43.1, 43.4, linear) * (1 - ramp(t, 45.0, 45.4, linear));
  const titleA = ramp(t, 45.2, 45.8, linear);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH }}>
      <Img src={staticFile('darien/img/paper_map_sheet.png')} style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, background: 'rgba(120,110,140,0.10)', mixBlendMode: 'multiply' }} />
      <svg width={PW} height={PH} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={regionD} fill="rgba(70,200,90,0.42)" stroke="#2fbf4a" strokeWidth={10} strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(40,220,80,0.9))' }} />
        <path d={regionD} fill="none" stroke="rgba(20,90,30,0.55)" strokeWidth={2} strokeDasharray="10 8" />
        <path d={toD(roadIn)} fill="none" stroke="#D9A23A" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={`${LEN.in * pIn} ${LEN.in}`} />
        <path d={toD(gapPts)} fill="none" stroke="#A80F1F" strokeWidth={13 * redPulse} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={`${LEN.gap * pGap} ${LEN.gap}`} style={{ filter: `drop-shadow(0 0 ${4 * redPulse}px rgba(200,20,30,0.8))` }} />
        <path d={toD(roadOut)} fill="none" stroke="#D9A23A" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={`${LEN.out * pOut} ${LEN.out}`} />
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 92,
        color: '#3a3833', letterSpacing: 6, opacity: titleA * 0.88,
      }}>
        पैन-अमेरिकन हाईवे
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 205, textAlign: 'center', fontFamily: FONT, fontWeight: 500, fontSize: 40,
        color: '#6d2a22', letterSpacing: 3, opacity: titleA * 0.8,
      }}>
        पनामा — कोलंबिया · प्रस्तावित मार्ग
      </div>
    </div>
  );
};

export const PaperScene: React.FC<{ t: number }> = ({ t }) => {
  // camera keyframes on the tilted sheet
  const p1 = ramp(t, 40.5, 43.1, inOut); // follow the road down into the gap
  const p2 = ramp(t, 43.1, 45.0, linear); // slow slide along the red section
  const p3 = ramp(t, 45.1, 46.5, inOut); // pull back to reveal the title
  const scale = lerp(lerp(lerp(1.55, 1.35, p1), 1.3, p2), 0.82, p3);
  const tx = lerp(lerp(lerp(-120, -60, p1), -40, p2), 0, p3);
  const ty = lerp(lerp(lerp(560, 120, p1), 40, p2), 250, p3);
  const rx = lerp(lerp(38, 34, p1), 26, p3);
  const rz = lerp(lerp(-14, -10, p1), -7, p3);

  // stamp beat: hand in 46.92, press 47.82, out 48.4
  const press = t >= 47.82 && t < 48.35;
  const handIn = ramp(t, 46.92, 47.7, easeOut);
  const handOut = ramp(t, 48.35, 48.85, easeIn);
  const dip = press ? 0 : 1;
  const shakeX = kick(t, 47.84, 14, 40, 10);
  const shakeY = kick(t, 47.84, 10, 33, 10);
  const mark = t >= 47.84 ? pop(t, 47.84, 14, 400) : 0;
  const markX = 560;
  const markY = 1010;

  const transform = `translate(${540 + tx}px, ${960 + ty}px) scale(${scale}) rotateX(${rx}deg) rotateZ(${rz}deg) translate(${-PW / 2}px, ${-PH / 2}px)`;
  return (
    <AbsoluteFill style={{ background: '#15171b', overflow: 'hidden', opacity: ramp(t, 40.55, 40.75, linear) }}>
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
        <AbsoluteFill style={{ perspective: 1500, perspectiveOrigin: '540px 760px' }}>
          {/* out-of-focus copy behind */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, transformOrigin: '0 0', transform, filter: 'blur(9px)' }}>
            <PaperContent t={t} />
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{
          perspective: 1500, perspectiveOrigin: '540px 760px',
          maskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 72%, transparent 96%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 72%, transparent 96%)',
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, transformOrigin: '0 0', transform }}>
            <PaperContent t={t} />
          </div>
        </AbsoluteFill>

        {/* stamp impression, screen space so the hand can land exactly on it */}
        {mark > 0 && (
          <div style={{
            position: 'absolute', left: markX, top: markY, width: 0, height: 0,
            transform: `perspective(900px) rotateX(24deg) rotate(-16deg) scale(${lerp(1.25, 1, Math.min(1, mark))})`,
          }}>
            <div style={{ position: 'absolute', left: -230, top: -115, width: 460, height: 230, opacity: Math.min(1, mark) * 0.92 }}>
              <Img src={staticFile('darien/img/stamp_ink_frame.png')} style={{ width: 460, height: 230, position: 'absolute' }} />
              <div style={{
                position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: FONT, fontWeight: 900,
                fontSize: 130, color: '#B3122E', letterSpacing: 4, mixBlendMode: 'multiply',
              }}>
                नाकाम
              </div>
            </div>
          </div>
        )}

        {/* the hand */}
        {t > 46.9 && t < 48.9 && (
          <Img src={staticFile(`darien/img/${press ? 'hand_stamp_down' : 'hand_stamp_up'}.png`)} style={{
            position: 'absolute', width: 1050, height: 1050,
            left: markX - (press ? 327 : 270) + lerp(700, 0, handIn) + handOut * 750,
            top: markY - (press ? 840 : 700) - dip * 60 + lerp(500, 0, handIn) + handOut * 600,
            transform: `rotate(${lerp(-8, -14, handIn)}deg)`,
            filter: 'drop-shadow(-20px 30px 30px rgba(0,0,0,0.45))',
          }} />
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)' }} />
    </AbsoluteFill>
  );
};
