import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, clamp, mblur, pop, wobble } from './theme';

// p08_locks (line 2, "Locks हर ship को 26 मीटर ऊपर उठाकर इसी झील में ले जाते हैं, और फिर दूसरी तरफ़ नीचे उतार देते
// हैं"; the reference's 12.0–21.0 s): a cross-section of the canal: the Atlantic, three lock chambers stepping up,
// Gatun Lake on top, three chambers stepping down, the Pacific. The ship sails into each chamber; the gate behind it
// closes, water churns in from the floor culverts (rising bubbles, foam at the surface, "^" arrows), the level rises
// and the ship with it; the gate ahead slides open and it moves on; on the way down the chamber drains ("v").
// A yellow height bar counts 0 → 26 m. Depth everywhere: far blue mountains, hills and jungle at three parallax
// speeds, foreground bushes sliding past, shaded earth with strata, concrete walls with lit faces and shadows,
// water with a lighter surface, moving caustic light and foam lines, a sun glare. The camera follows with eased
// moves, motion blur and a small punch-in each time a lift completes. Opaque scene, 1080×1920, 60 fps; `dur` frames.
const W = 3900;
const SEG = [0, 520, 820, 1120, 1420, 2480, 2780, 3080, 3380, W];
const LV = [0, 8.7, 17.3, 26, 26, 17.3, 8.7, 0, 0];
const yOf = (m: number) => 1300 - m * 24;
export const P08Locks: React.FC<{ dur?: number; ship?: string; labels?: [string, string, string, string] }> = ({ dur = 540, ship, labels = ['Gatun Locks', 'Gatun Lake', 'Pedro Miguel', 'Miraflores'] }) => {
  useFonts();
  const f = useCurrentFrame();
  const spots = [260, 670, 970, 1270, 1950, 2630, 2930, 3230, 3640];
  const lvls = [0, 8.7, 17.3, 26, 26, 17.3, 8.7, 0, 0];
  const n = spots.length - 1, per = dur / n;
  const i = Math.min(n - 1, Math.floor(f / per));
  const u = (f - i * per) / per;
  const mv = interpolate(u, [0.05, 0.5], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const lf = interpolate(u, [0.55, 0.95], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const sx = spots[i] + (spots[i + 1] - spots[i]) * mv;
  const from = lvls[i], to = lvls[i + 1];
  const chamber = i + 1;
  const changing = from !== to;
  const filling = mv >= 1 && changing && lf > 0 && lf < 1;
  const shipM = mv < 1 || !changing ? from : from + (to - from) * lf;
  const segLevel = (k: number) => {
    if (k === chamber && mv >= 1 && changing) return shipM;
    if (k >= 1 && k <= 3) return k <= i ? LV[k] : LV[k - 1];
    if (k >= 5 && k <= 7) return k <= i ? LV[k] : LV[k - 1];
    return LV[k];
  };
  const prev = spots[i] + (spots[i + 1] - spots[i]) * interpolate(u - 1 / per, [0.05, 0.5], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const v = sx - prev;
  const camX = Math.max(0, Math.min(W - 1080, sx - 540));
  const camY = 1080 - yOf(shipM);
  // a small punch-in when each lift completes
  const punch = changing ? wobble(f, i * per + per * 0.95, 2.5, 5) * 0.025 : 0;
  const bob = Math.sin(f / 18) * 3;
  const pitch = Math.sin(f / 23) * 1.2 + (filling ? Math.sin(f / 5) * 0.8 : 0);
  const floorOf = (k: number) => (k === 0 || k === 8 ? yOf(0) + 380 : k === 4 ? yOf(26) + 330 : yOf(Math.min(LV[k - 1], LV[k])) + 120);
  const gateTop = (k: number) => yOf(Math.max(LV[k - 1] ?? 0, LV[k] ?? 0, 0)) - 60;
  const par = (k: number) => -camX * k;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #4FA9E6 0%, #8FD0F5 45%, #D8F0FB 80%)', overflow: 'hidden', transform: `scale(${1 + punch})` }}>
      {/* sun glare */}
      <div style={{ position: 'absolute', left: 760, top: 120, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,250,220,1), rgba(255,240,180,0.5) 25%, rgba(255,230,160,0) 65%)', transform: `scale(${1 + 0.04 * Math.sin(f / 20)})` }} />
      {[0.35, 0.55, 0.8].map((k, j) => <div key={j} style={{ position: 'absolute', left: 970 - 600 * k, top: 330 + 500 * k, width: 60 + 40 * j, height: 60 + 40 * j, borderRadius: '50%', background: 'rgba(255,240,200,0.15)' }} />)}
      {/* clouds (slow parallax) */}
      {Array.from({ length: 7 }, (_, k) => {
        const x = ((random(`cx${k}`) * 2400 + f * (0.2 + random(`cv${k}`) * 0.3) + par(0.08)) % 1700) - 300;
        return <div key={k} style={{ position: 'absolute', left: x, top: 140 + random(`cy${k}`) * 380, width: 260, height: 90, borderRadius: 60, background: 'radial-gradient(ellipse at 40% 35%, #fff, rgba(240,248,255,0.85) 60%, rgba(240,248,255,0) 72%)' }} />;
      })}
      {/* far mountains, then hills (parallax) */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${par(0.15) % 1400} ${camY * 0.3 - 120})`}>
          {[0, 1400, 2800].map((o) => <path key={o} d={`M ${o - 100} 900 L ${o + 200} 640 L ${o + 420} 760 L ${o + 700} 560 L ${o + 1000} 740 L ${o + 1300} 620 L ${o + 1500} 900 Z`} fill="#7FA8C4" opacity={0.75} />)}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: -camX, top: camY, width: W, height: 2600, filter: mblur(v, 0.3, 6) }}>
        <svg width={W} height={2600} style={{ position: 'absolute', top: 0, overflow: 'visible' }}>
          <defs>
            <linearGradient id="lkWater" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7FD8FF" /><stop offset="0.15" stopColor="#45B6EC" /><stop offset="1" stopColor="#1F78B8" /></linearGradient>
            <linearGradient id="lkSea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#4BA8DC" /><stop offset="0.2" stopColor="#2581C2" /><stop offset="1" stopColor="#103E6E" /></linearGradient>
            <linearGradient id="lkEarth" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#9A6A3E" /><stop offset="0.3" stopColor="#82552F" /><stop offset="1" stopColor="#4E3018" /></linearGradient>
            <linearGradient id="lkWall" x1="0" x2="1"><stop offset="0" stopColor="#FBFCFD" /><stop offset="0.6" stopColor="#D9DEE3" /><stop offset="1" stopColor="#A9B0B7" /></linearGradient>
            <linearGradient id="lkHill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#5CAF4E" /><stop offset="1" stopColor="#2F7A33" /></linearGradient>
          </defs>
          <path d={`M 0 ${yOf(14)} C 700 ${yOf(24)} 1100 ${yOf(52)} 1700 ${yOf(56)} C 2300 ${yOf(60)} 2700 ${yOf(44)} 3200 ${yOf(26)} C 3500 ${yOf(18)} 3700 ${yOf(12)} ${W} ${yOf(10)} L ${W} 2600 L 0 2600 Z`} fill="url(#lkHill)" />
          {Array.from({ length: 46 }, (_, k) => {
            const x = 200 + k * 80 + random(`tx${k}`) * 30, top = Math.min(yOf(54), yOf(14 + 40 * Math.sin((x / W) * Math.PI)));
            const sway = Math.sin(f / 30 + k) * 3;
            return (
              <g key={k} transform={`translate(${x + sway} ${top + 34})`}>
                <circle r={56 + 22 * random(`t${k}`)} fill={k % 3 ? '#3C8C38' : '#4EA343'} />
                <circle cx={-14} cy={-16} r={30 + 10 * random(`u${k}`)} fill="#6CC05A" opacity={0.6} />
              </g>
            );
          })}
          {SEG.slice(0, -1).map((x0, k) => {
            const wl = yOf(segLevel(k)) + (k === 4 ? Math.sin(f / 20) * 3 : 0);
            const x1 = SEG[k + 1], h = floorOf(k) - wl + 4;
            const churn = filling && k === chamber;
            return (
              <g key={k}>
                <rect x={x0} y={wl} width={x1 - x0} height={h} fill={k === 0 || k === 8 ? 'url(#lkSea)' : 'url(#lkWater)'} />
                {/* caustic light bands drifting through the water */}
                {Array.from({ length: Math.ceil((x1 - x0) / 120) }, (_, j) => (
                  <path key={j} d={`M ${x0 + j * 120 + ((f * 1.2) % 120)} ${wl + 30} q 30 ${h * 0.25} 0 ${h * 0.5}`} stroke="#fff" strokeWidth={10} opacity={0.07} fill="none" />
                ))}
                <path d={`M ${x0} ${wl + 4} ${Array.from({ length: Math.ceil((x1 - x0) / 24) + 1 }, (_, j) => `L ${x0 + j * 24} ${wl + 4 + Math.sin(f / (churn ? 4 : 9) + j * 0.8 + k) * (churn ? 6 : 3)}`).join(' ')}`} stroke="#fff" strokeWidth={churn ? 7 : 4} opacity={churn ? 0.8 : 0.5} fill="none" />
                {churn && Array.from({ length: 18 }, (_, j) => {
                  const t = ((f * (to > from ? 1 : 0.7) + j * 13) % 50) / 50;
                  const bx = x0 + 30 + random(`bx${k}${j}`) * (x1 - x0 - 60);
                  return <circle key={j} cx={bx + Math.sin(t * 8 + j) * 8} cy={floorOf(k) - 10 - t * (floorOf(k) - wl - 20)} r={4 + 6 * random(`br${j}`)} fill="none" stroke="#E8FBFF" strokeWidth={2.5} opacity={(1 - t) * 0.9} />;
                })}
              </g>
            );
          })}
          <path d={`M 0 ${floorOf(0)} ${SEG.slice(0, -1).map((x0, k) => `L ${x0} ${floorOf(k)} L ${SEG[k + 1]} ${floorOf(k)}`).join(' ')} L ${W} 2600 L 0 2600 Z`} fill="url(#lkEarth)" />
          {Array.from({ length: 5 }, (_, k) => <path key={k} d={`M 0 ${yOf(0) + 480 + k * 140} C 900 ${yOf(0) + 440 + k * 150} 2400 ${yOf(0) + 520 + k * 130} ${W} ${yOf(0) + 470 + k * 140}`} stroke="#3E2612" strokeWidth={3} opacity={0.25} fill="none" />)}
          {Array.from({ length: 50 }, (_, k) => <ellipse key={k} cx={random(`ex${k}`) * W} cy={yOf(0) + 460 + random(`ey${k}`) * 700} rx={14 + 16 * random(`er${k}`)} ry={7} fill="#3E2612" opacity={0.35} />)}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => {
            const x = SEG[k], top = gateTop(k), bottom = Math.max(floorOf(k - 1), floorOf(k));
            const open = Math.abs(sx - x) < 160 && mv > 0.02 && mv < 0.98 ? 1 : 0;
            const slide = open * (bottom - top - 30);
            return (
              <g key={k}>
                <rect x={x + 22} y={top} width={18} height={bottom - top} fill="#000" opacity={0.18} />
                <rect x={x - 22} y={top + slide} width={44} height={bottom - top} fill="url(#lkWall)" stroke="#7D8389" strokeWidth={2} />
                <rect x={x - 30} y={top - 16} width={60} height={18} rx={4} fill="#8E969D" />
                <rect x={x - 30} y={top - 16} width={60} height={6} rx={3} fill="#C3C9CE" />
              </g>
            );
          })}
          {filling && Array.from({ length: 6 }, (_, k) => {
            const t = ((f + k * 9) % 36) / 36, up = to > from;
            return <path key={k} d={up ? 'M -14 8 L 0 -8 L 14 8' : 'M -14 -8 L 0 8 L 14 -8'} transform={`translate(${SEG[chamber] + 50 + k * 45} ${yOf(shipM) + 110 + (up ? -t : t) * 70})`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={1 - t} />;
          })}
        </svg>
        {/* the ship, its waterline foam and reflection */}
        <div style={{ position: 'absolute', left: sx - 170, top: yOf(shipM) - 124 + bob, width: 340, height: 160, transform: `rotate(${pitch}deg)`, transformOrigin: '50% 80%' }}>
          {ship ? <Img src={ship} style={{ width: 340, height: 160, objectFit: 'contain' }} /> : (
            <svg width={340} height={160}>
              <defs><linearGradient id="lkHull" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#C2303A" /><stop offset="0.5" stopColor="#8E1E22" /><stop offset="1" stopColor="#3A0A0C" /></linearGradient></defs>
              <path d="M 10 106 L 304 106 L 330 76 L 330 136 Q 170 156 24 140 Z" fill="url(#lkHull)" stroke="#2A0608" strokeWidth={3} />
              <path d="M 14 112 L 300 112" stroke="#fff" strokeWidth={3} opacity={0.5} />
              {Array.from({ length: 10 }, (_, k) => [0, 1, 2].map((j) => {
                const c = [['#D5603F', '#9A3A24'], ['#3F86CE', '#255386'], ['#53A361', '#33693B'], ['#E39436', '#9F5D1D']][(k * 3 + j) % 4];
                return <g key={`${k}${j}`}><rect x={74 + k * 23} y={84 - j * 17} width={22} height={16} fill={c[1]} /><rect x={74 + k * 23} y={84 - j * 17} width={22} height={5} fill={c[0]} /></g>;
              }))}
              <rect x={24} y={40} width={44} height={68} fill="#F4F4F0" stroke="#9A9A96" strokeWidth={2} />
              {[50, 62, 74, 86].map((y) => <rect key={y} x={28} y={y} width={36} height={5} fill="#2B3A46" />)}
              <rect x={34} y={24} width={14} height={18} fill="#C8202A" />
            </svg>
          )}
        </div>
        <div style={{ position: 'absolute', left: sx - 190, top: yOf(shipM) + 18 + bob, width: 380, height: 18, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)', opacity: 0.7 + 0.3 * Math.sin(f / 6) }} />
        {[[SEG[2], gateTop(2) - 130, labels[0]], [(SEG[4] + SEG[5]) / 2, yOf(26) - 240, labels[1]], [SEG[6], gateTop(6) - 130, labels[2]], [SEG[7] + 150, gateTop(7) - 130, labels[3]]].map(([x, y, t], k) => {
          const near = Math.abs(sx - (x as number)) < 650;
          const s = near ? pop(f % 600, 0, 8) : 0;
          return <div key={k} style={{ position: 'absolute', left: x as number, top: (y as number) + Math.sin(f / 25 + k) * 6, transform: `translate(-50%,0) scale(${s}) rotate(${Math.sin(f / 40 + k) * 1.5}deg)`, padding: '4px 22px 0', borderRadius: 14, background: 'rgba(14,22,32,0.92)', border: '3px solid #fff', fontFamily: UI, fontWeight: 800, fontSize: 46, color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 10px 20px rgba(0,0,0,0.35)' }}>{t as string}</div>;
        })}
      </div>
      {/* foreground bushes sliding past faster (parallax 1.4) */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 10 }, (_, k) => {
          const x = ((k * 520 + par(1.4)) % 5200 + 5200) % 5200 - 400;
          return <g key={k} transform={`translate(${x} ${1930 + Math.sin(f / 25 + k) * 4})`}>{[0, 70, 140].map((d, j) => <circle key={j} cx={d} cy={-30 - j * 10} r={90 - j * 12} fill={j % 2 ? '#24602B' : '#2E7434'} />)}</g>;
        })}
      </svg>
      {i < 4 && (
        <div style={{ position: 'absolute', left: 90, top: 520 }}>
          <div style={{ width: 16, height: 340, background: 'rgba(255,255,255,0.45)', borderRadius: 8, position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            <div style={{ position: 'absolute', bottom: 0, width: 16, height: (shipM / 26) * 340, background: 'linear-gradient(180deg, #FFF0A0, #FFC21F)', borderRadius: 8, boxShadow: '0 0 18px #FFD53D' }} />
          </div>
          <div style={{ position: 'absolute', left: 34, top: 340 - (shipM / 26) * 340 - 44, fontFamily: NUM, fontSize: 76, color: '#fff', whiteSpace: 'nowrap', WebkitTextStroke: '6px #0B1A24', paintOrder: 'stroke fill', textShadow: '0 0 18px rgba(255,220,90,0.7)' }}>{Math.round(shipM)} m</div>
        </div>
      )}
      <div style={{ display: 'none' }}>{C.ink}</div>
    </AbsoluteFill>
  );
};
