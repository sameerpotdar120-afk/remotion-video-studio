import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, clamp, mblur, pop } from './theme';

// p08_locks (line 2, "Locks हर ship को 26 मीटर ऊपर उठाकर इसी झील में ले जाते हैं, और फिर दूसरी तरफ़ नीचे उतार देते
// हैं"; the reference's 12.0–21.0 s): a flat cross-section of the canal: the Atlantic, three lock chambers stepping up,
// Gatun Lake on top, three chambers stepping down, the Pacific. The ship (side view) sails into each chamber; the
// chamber's water rises with small "^" arrows (or falls with "v"), the ship rises or sinks with it, a yellow height
// bar counts 0 → 26 m on the way up; the gate in front opens (slides down) and the ship moves on. The camera follows
// the ship (eased, with motion blur on the fast moves), clouds drift, the lake surface ripples, tags pop for each
// set of locks. Opaque scene, 1080×1920, 60 fps; `dur` frames for the whole crossing. `ship` = the creator's side view.
const W = 3900;
const SEG = [0, 520, 820, 1120, 1420, 2480, 2780, 3080, 3380, W]; // sea | 3 up | lake | 3 down | sea
const LV = [0, 8.7, 17.3, 26, 26, 17.3, 8.7, 0, 0]; // water level of each segment once the ship has passed through
const yOf = (m: number) => 1300 - m * 24;
export const P08Locks: React.FC<{ dur?: number; ship?: string; labels?: [string, string, string, string] }> = ({ dur = 540, ship, labels = ['Gatun Locks', 'Gatun Lake', 'Pedro Miguel', 'Miraflores'] }) => {
  useFonts();
  const f = useCurrentFrame();
  // the ship visits: sea → c1 → c2 → c3 → lake → c5 → c6 → c7 → sea
  const spots = [260, 670, 970, 1270, 1950, 2630, 2930, 3230, 3640];
  const lvls = [0, 8.7, 17.3, 26, 26, 17.3, 8.7, 0, 0];
  const n = spots.length - 1, per = dur / n;
  const i = Math.min(n - 1, Math.floor(f / per));
  const u = (f - i * per) / per;
  const mv = interpolate(u, [0.05, 0.5], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const lf = interpolate(u, [0.55, 0.95], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const sx = spots[i] + (spots[i + 1] - spots[i]) * mv;
  const from = lvls[i], to = lvls[i + 1];
  // inside a chamber the ship first arrives at the old level, then the chamber fills or drains to the new one
  const chamber = i + 1; // segment index the ship is heading into
  const changing = from !== to;
  const shipM = mv < 1 || !changing ? from : from + (to - from) * lf;
  const segLevel = (k: number) => {
    if (k === chamber && mv >= 1 && changing) return shipM;
    if (k >= 1 && k <= 3) return k <= i ? LV[k] : LV[k - 1];
    if (k >= 5 && k <= 7) return k <= i ? LV[k] : LV[k - 1] === 26 ? 26 : LV[k - 1];
    return LV[k];
  };
  const prev = spots[i] + (spots[i + 1] - spots[i]) * interpolate(u - 1 / per, [0.05, 0.5], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const v = sx - prev;
  const camX = Math.max(0, Math.min(W - 1080, sx - 540));
  const camY = 1080 - yOf(shipM); // the ship rides at about y = 960 on screen
  const bob = Math.sin(f / 18) * 3;
  const floorOf = (k: number) => (k === 0 || k === 8 ? yOf(0) + 380 : k === 4 ? yOf(26) + 330 : yOf(Math.min(LV[k - 1], LV[k])) + 120);
  const gateTop = (k: number) => yOf(Math.max(LV[k - 1] ?? 0, LV[k] ?? 0, 0)) - 60;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #6CC0F0, #B9E3FA 55%, #E0F4FC)', overflow: 'hidden' }}>
      {Array.from({ length: 6 }, (_, k) => {
        const x = ((random(`cx${k}`) * 1600 + f * (0.3 + random(`cv${k}`) * 0.4)) % 1500) - 220;
        return <div key={k} style={{ position: 'absolute', left: x, top: 120 + random(`cy${k}`) * 420, width: 240, height: 84, borderRadius: 60, background: 'rgba(255,255,255,0.9)', filter: 'blur(5px)' }} />;
      })}
      <div style={{ position: 'absolute', left: -camX, top: camY, width: W, height: 2600, filter: mblur(v, 0.3, 6) }}>
        <svg width={W} height={2600} style={{ position: 'absolute', top: 0, overflow: 'visible' }}>
          {/* jungle hills behind the lake */}
          <path d={`M 0 ${yOf(14)} C 700 ${yOf(24)} 1100 ${yOf(52)} 1700 ${yOf(56)} C 2300 ${yOf(60)} 2700 ${yOf(44)} 3200 ${yOf(26)} C 3500 ${yOf(18)} 3700 ${yOf(12)} ${W} ${yOf(10)} L ${W} 2600 L 0 2600 Z`} fill={C.hill} />
          {Array.from({ length: 34 }, (_, k) => {
            const x = 300 + k * 100, top = Math.min(yOf(54), yOf(14 + 40 * Math.sin((x / W) * Math.PI)));
            return <circle key={k} cx={x} cy={top + 30} r={62 + 22 * random(`t${k}`)} fill={k % 2 ? '#357E33' : '#4A9C40'} />;
          })}
          {/* water in every segment */}
          {SEG.slice(0, -1).map((x0, k) => {
            const wl = yOf(segLevel(k)) + (k === 4 ? Math.sin(f / 20) * 3 : 0);
            return (
              <g key={k}>
                <rect x={x0} y={wl} width={SEG[k + 1] - x0} height={floorOf(k) - wl + 4} fill={k === 0 || k === 8 ? C.waterDeep : C.water} />
                <path d={`M ${x0} ${wl + 6} ${Array.from({ length: Math.ceil((SEG[k + 1] - x0) / 30) + 1 }, (_, j) => `L ${x0 + j * 30} ${wl + 6 + Math.sin(f / 9 + j + k) * 3}`).join(' ')}`} stroke="#fff" strokeWidth={3} opacity={0.45} fill="none" />
              </g>
            );
          })}
          {/* the earth under the canal, following each segment's floor */}
          <path d={`M 0 ${floorOf(0)} ${SEG.slice(0, -1).map((x0, k) => `L ${x0} ${floorOf(k)} L ${SEG[k + 1]} ${floorOf(k)}`).join(' ')} L ${W} 2600 L 0 2600 Z`} fill={C.earth} />
          {Array.from({ length: 40 }, (_, k) => <ellipse key={k} cx={random(`ex${k}`) * W} cy={yOf(0) + 460 + random(`ey${k}`) * 600} rx={22} ry={8} fill={C.earthDark} opacity={0.55} />)}
          {/* lock walls and gates */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => {
            const x = SEG[k], top = gateTop(k), bottom = Math.max(floorOf(k - 1), floorOf(k));
            const near = Math.abs(sx - x) < 160 && mv > 0 && mv < 1;
            const open = near ? 1 : 0;
            return (
              <g key={k}>
                <rect x={x - 22} y={top + open * (bottom - top - 30)} width={44} height={bottom - top} fill="#E4E7EA" stroke="#7D8389" strokeWidth={3} />
                <rect x={x - 30} y={top - 14} width={60} height={16} rx={4} fill="#B9BFC5" />
              </g>
            );
          })}
          {mv >= 1 && changing && lf > 0 && lf < 1 && Array.from({ length: 6 }, (_, k) => {
            const t = ((f + k * 9) % 36) / 36, up = to > from;
            return <path key={k} d={up ? 'M -14 8 L 0 -8 L 14 8' : 'M -14 -8 L 0 8 L 14 -8'} transform={`translate(${SEG[chamber] + 50 + k * 45} ${yOf(shipM) + 110 + (up ? -t : t) * 70})`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={1 - t} />;
          })}
        </svg>
        <div style={{ position: 'absolute', left: sx - 160, top: yOf(shipM) - 118 + bob, width: 320, height: 150, transform: `rotate(${Math.sin(f / 23) * 1.2}deg)` }}>
          {ship ? <Img src={ship} style={{ width: 320, height: 150, objectFit: 'contain' }} /> : (
            <svg width={320} height={150}>
              <path d="M 10 100 L 290 100 L 312 74 L 312 128 Q 160 146 22 132 Z" fill="#8E1E22" stroke="#4A0E10" strokeWidth={3} />
              {Array.from({ length: 9 }, (_, k) => [0, 1, 2].map((j) => <rect key={`${k}${j}`} x={70 + k * 24} y={78 - j * 17} width={22} height={16} fill={['#B84A2E', '#2F6DB5', '#3F8A4E', '#D9822B'][(k + j) % 4]} stroke="#00000033" />))}
              <rect x={22} y={40} width={40} height={62} fill="#F2F2EE" stroke="#999" />
            </svg>
          )}
        </div>
        {[[SEG[2], gateTop(2) - 130, labels[0]], [(SEG[4] + SEG[5]) / 2, yOf(26) - 240, labels[1]], [SEG[6], gateTop(6) - 130, labels[2]], [SEG[7] + 150, gateTop(7) - 130, labels[3]]].map(([x, y, t], k) => {
          const s = Math.abs(sx - (x as number)) < 650 ? pop(f % 1000, 0, 8) : 0;
          return <div key={k} style={{ position: 'absolute', left: x as number, top: (y as number) + Math.sin(f / 25 + k) * 5, transform: `translate(-50%,0) scale(${s})`, padding: '4px 22px 0', borderRadius: 14, background: 'rgba(14,22,32,0.92)', border: '3px solid #fff', fontFamily: UI, fontWeight: 800, fontSize: 44, color: '#fff', whiteSpace: 'nowrap' }}>{t as string}</div>;
        })}
      </div>
      {i < 4 && (
        <div style={{ position: 'absolute', left: 90, top: 520, opacity: shipM > 0.1 || i > 0 ? 1 : 0.0 }}>
          <div style={{ width: 16, height: 340, background: 'rgba(255,255,255,0.45)', borderRadius: 8, position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: 0, width: 16, height: (shipM / 26) * 340, background: '#FFD53D', borderRadius: 8, boxShadow: '0 0 16px #FFD53D' }} />
          </div>
          <div style={{ position: 'absolute', left: 34, top: 340 - (shipM / 26) * 340 - 44, fontFamily: NUM, fontSize: 72, color: '#fff', whiteSpace: 'nowrap', WebkitTextStroke: '6px #0B1A24', paintOrder: 'stroke fill' }}>{Math.round(shipM)} m</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
