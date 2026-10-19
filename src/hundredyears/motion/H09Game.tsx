import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Shield } from './Heraldry';
import { UI, useAnton } from './font';
import { C, clamp, pop } from './theme';

// h09_game (line 6, "France अंदर से टूट गया … खेल ख़त्म हो चुका है"; the reference's 30.8–40.3 s): our own strategy-game
// screen (no real game's art): a dark carved-wood top bar with resource chips, a side panel with three stat bars that slide
// (stability falls to red, army falls, morale flickers), English army stacks (shield tokens) bobbing over the map area,
// then a chat window. England: "North की तरफ़ बढ़ रहा हूँ ⚔️". France: "Truce करें? 🙏". England: "Nope 🙂". France types
// "GG 😞" letter by letter and the cursor clicks SEND. Transparent in the map area (the edit puts the dark political
// map underneath). 1080×1920, 60 fps, 480 frames. `chat` = frame the chat window opens.
const MSG: [string, string, string][] = [['England', 'North की तरफ़ बढ़ रहा हूँ ⚔️', '#E04040'], ['France', 'Truce करें? 🙏', '#5A7BFF'], ['England', 'Nope 🙂', '#E04040']];


export const H09Game: React.FC<{ chat?: number; speed?: number }> = ({ chat = 200, speed = 1 }) => {
  useAnton();
  const f0 = useCurrentFrame();
  const f = f0;
  // the chat runs `speed` times faster once it opens
  const fc = f0 < chat ? f0 : chat + (f0 - chat) * speed;
  const bars: [string, number, number, string][] = [['STABILITY', 0.82, 0.12, '#E05A3A'], ['ARMY', 0.7, 0.3, '#E0B03A'], ['MORALE', 0.6, 0.2, '#5AD06A']];
  const panel = pop(f, 0, 16, 1.4);
  const cw = pop(fc, chat, chat + 16, 1.5);
  const typed = Math.floor(interpolate(fc, [chat + 150, chat + 186], [0, 4], clamp));
  const gg = 'GG 😞'.slice(0, typed === 0 ? 0 : typed >= 4 ? 5 : typed);
  const click = fc > chat + 210;
  const cur = { x: interpolate(fc, [chat + 186, chat + 206], [700, 905], clamp), y: interpolate(fc, [chat + 186, chat + 206], [1420, 1342], clamp) };
  return (
    <AbsoluteFill style={{ fontFamily: UI }}>
      {/* top bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 110, background: 'linear-gradient(#3A2A1C, #22180F)', borderBottom: '6px solid #8A6A3A', display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px',
        transform: `translateY(${(1 - panel) * -120}px)` }}>
        {[['👑', '1429'], ['💰', String(Math.round(interpolate(f, [0, 400], [880, 120], clamp)))], ['⚔️', String(Math.round(interpolate(f, [0, 400], [62, 9], clamp)))], ['🏰', '7']].map(([i, v]) => (
          <div key={i} style={{ background: 'rgba(0,0,0,0.4)', border: '3px solid #8A6A3A', borderRadius: 14, padding: '4px 16px', color: '#F3E6C8', fontSize: 40, fontWeight: 800 }}>{i} {v}</div>
        ))}
      </div>
      {/* stat panel */}
      <div style={{ position: 'absolute', right: 26, top: 150, width: 380, padding: 22, background: 'rgba(28,20,14,0.88)', border: '5px solid #8A6A3A', borderRadius: 18, transform: `translateX(${(1 - panel) * 460}px)` }}>
        <div style={{ color: '#F3E6C8', fontSize: 34, fontWeight: 800, marginBottom: 10 }}>FRANCE ⚜️</div>
        {bars.map(([n, a, b, col], i) => {
          const v = interpolate(f, [30 + i * 20, 200 + i * 20], [a, b], clamp) + (n === 'MORALE' ? Math.sin(f / 5) * 0.03 : 0);
          return (
            <div key={n} style={{ marginBottom: 14 }}>
              <div style={{ color: '#CDBB98', fontSize: 24, fontWeight: 800 }}>{n}</div>
              <div style={{ height: 22, borderRadius: 11, background: '#3A2A1C', overflow: 'hidden', border: '3px solid #5A4428' }}>
                <div style={{ width: `${v * 100}%`, height: '100%', background: v < 0.3 ? '#D03030' : col, transition: 'none' }} />
              </div>
            </div>
          );
        })}
      </div>
      {/* army stacks */}
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {[[380, 760], [520, 880], [300, 1000], [600, 1060]].map(([x, y], i) => {
          const k = pop(f, 20 + i * 12, 36 + i * 12, 2);
          return (
            <g key={i} transform={`translate(${x + Math.sin(f / 12 + i) * 6} ${y + Math.sin(f / 9 + i) * 8}) scale(${k})`}>
              <Shield id="england" r={44} uid={`gs${i}`} />
              <rect x={-34} y={62} width={68} height={26} rx={8} fill="rgba(0,0,0,0.65)" />
              <text x={0} y={82} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily={UI}>{[12, 8, 15, 6][i]}k</text>
            </g>
          );
        })}
      </svg>
      {/* chat */}
      {cw > 0.01 && (
        <div style={{ position: 'absolute', left: 90, top: 980, width: 900, transform: `scale(${cw})`, transformOrigin: '20% 100%', background: 'rgba(24,18,12,0.94)', border: '6px solid #8A6A3A', borderRadius: 22, padding: 28 }}>
          {MSG.map(([who, msg, col], i) => (
            <div key={i} style={{ fontSize: 44, color: '#F3E6C8', marginBottom: 10, opacity: fc > chat + 30 + i * 40 ? 1 : 0, fontWeight: 700 }}>
              <span style={{ color: col, fontStyle: 'italic', fontWeight: 800 }}>{who}:</span> {msg}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
            <div style={{ flex: 1, height: 74, borderRadius: 12, background: '#120D08', border: '3px solid #5A4428', color: '#fff', fontSize: 44, padding: '6px 20px', fontWeight: 800 }}>{gg}{typed > 0 && typed < 4 && Math.floor(fc / 15) % 2 ? '|' : ''}</div>
            <div style={{ width: 170, height: 74, borderRadius: 12, background: click ? '#5A4428' : '#8A6A3A', color: '#F3E6C8', fontSize: 38, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `scale(${click && fc < chat + 222 ? 0.92 : 1})` }}>SEND</div>
          </div>
        </div>
      )}
      {cw > 0.5 && fc > chat + 180 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d={`M ${cur.x} ${cur.y} l 0 56 l 14 -14 l 12 26 l 10 -5 l -12 -25 l 20 0 Z`} fill="#fff" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        </svg>
      )}
    </AbsoluteFill>
  );
};
