import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { theme } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Graphics live in the upper part of the frame; captions own the lower third.
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ top: 230, height: 1000, alignItems: 'center', justifyContent: 'center' }}>
    {children}
  </AbsoluteFill>
);

const Plane: React.FC<{ size: number; color?: string; rotate?: number }> = ({
  size,
  color = theme.text,
  rotate = 0,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${rotate}deg)` }}>
    <path
      d="M50 4 C54 4 56 10 56 18 L56 38 L94 58 L94 66 L56 56 L56 78 L68 88 L68 94 L50 89 L32 94 L32 88 L44 78 L44 56 L6 66 L6 58 L44 38 L44 18 C44 10 46 4 50 4 Z"
      fill={color}
    />
  </svg>
);

const Tag: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = theme.accent,
  style,
}) => (
  <div
    style={{
      fontFamily: theme.mono,
      fontWeight: 700,
      fontSize: 34,
      letterSpacing: 4,
      color: '#000',
      background: color,
      padding: '10px 22px',
      textTransform: 'uppercase',
      ...style,
    }}
  >
    {children}
  </div>
);

const useIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 16 } });
};

/* ---------- 1. Hook ---------- */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = frame > 40 ? (random(`h${frame}`) - 0.5) * 18 : 0;
  const tilt = interpolate(frame, [40, 70], [0, 28], clamp);
  const flash = frame > 40 && frame % 12 < 6 ? 1 : 0.35;
  const s = useIn();
  return (
    <Stage>
      <div style={{ transform: `translate(${shake}px, ${shake * 0.6}px) scale(${s})`, textAlign: 'center' }}>
        <Plane size={460} rotate={tilt} />
        <div style={{ marginTop: 30, fontFamily: theme.mono, fontSize: 120, fontWeight: 700, color: theme.text }}>
          FZ1073
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, opacity: flash }}>
          <Tag color={theme.danger}>Cockpit attack</Tag>
        </div>
      </div>
    </Stage>
  );
};

/* ---------- Map ---------- */
// Simple equirectangular box: lon 32..58 E, lat 22..35 N, 900 x 700 px. Illustrative only.
const P = (lon: number, lat: number) => ({ x: ((lon - 32) / 26) * 900, y: ((35 - lat) / 13) * 700 });
const DXB = P(55.3, 25.25);
const TLV = P(34.8, 32.0);
const TUU = P(36.6, 28.37);
const INC = P(38.6, 29.9); // roughly near the Saudi-Jordan border, where the dive was reported

const routePath = `M ${DXB.x} ${DXB.y} Q ${P(45, 29).x} ${P(45, 29).y} ${INC.x} ${INC.y} L ${TLV.x} ${TLV.y}`;
const divertPath = `M ${INC.x} ${INC.y} Q ${P(37.2, 29.6).x} ${P(37.2, 29.6).y} ${TUU.x} ${TUU.y}`;

const City: React.FC<{ p: { x: number; y: number }; label: string; color?: string; dx?: number }> = ({
  p,
  label,
  color = theme.text,
  dx = 24,
}) => (
  <g>
    <circle cx={p.x} cy={p.y} r={12} fill={color} />
    <circle cx={p.x} cy={p.y} r={24} fill="none" stroke={color} strokeWidth={3} opacity={0.5} />
    <text x={p.x + dx} y={p.y + 12} fill={color} fontFamily={theme.font} fontSize={38} textAnchor={dx < 0 ? 'end' : 'start'}>
      {label}
    </text>
  </g>
);

const MapBase: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={900} height={700} viewBox="-20 -20 940 740" style={{ overflow: 'visible' }}>
    {Array.from({ length: 10 }).map((_, i) => (
      <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={700} stroke={theme.line} strokeWidth={2} />
    ))}
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={`h${i}`} x1={0} y1={i * 100} x2={900} y2={i * 100} stroke={theme.line} strokeWidth={2} />
    ))}
    <text x={P(44, 24).x} y={P(44, 24).y} fill={theme.muted} opacity={0.6} fontFamily={theme.mono} fontSize={30} letterSpacing={6} textAnchor="middle">
      SAUDI ARABIA
    </text>
    <text x={P(38.2, 30.9).x} y={P(38.2, 30.9).y} fill={theme.muted} opacity={0.6} fontFamily={theme.mono} fontSize={26} letterSpacing={4}>
      JORDAN
    </text>
    {children}
    <text x={900} y={735} fill={theme.muted} fontFamily={theme.mono} fontSize={22} textAnchor="end">
      ILLUSTRATIVE ROUTE · NOT TO SCALE
    </text>
  </svg>
);

/* ---------- 2. Route ---------- */
export const RouteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [10, 100], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const s = useIn();
  return (
    <Stage>
      <div style={{ transform: `scale(${0.9 + s * 0.1})`, opacity: s }}>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginBottom: 40 }}>
          <Tag>30 Sep 2026</Tag>
          <Tag color={theme.text}>Boeing 737 MAX</Tag>
        </div>
        <MapBase>
          <path d={routePath} fill="none" stroke={theme.muted} strokeWidth={4} strokeDasharray="14 14" opacity={0.5} />
          <path
            d={routePath}
            fill="none"
            stroke={theme.accent}
            strokeWidth={8}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - draw * 0.72}
          />
          <City p={DXB} label="DUBAI" dx={-34} />
          <City p={TLV} label="TEL AVIV" />
        </MapBase>
      </div>
    </Stage>
  );
};

/* ---------- 3. Axe ---------- */
export const AxeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const swing = interpolate(frame % 30, [0, 8, 30], [-35, 25, -35], clamp);
  const hit = frame % 30 > 6 && frame % 30 < 12;
  const s = useIn();
  return (
    <Stage>
      <AbsoluteFill style={{ background: theme.danger, opacity: hit ? 0.18 : 0 }} />
      <div style={{ textAlign: 'center', transform: `scale(${s})` }}>
        <svg width={520} height={520} viewBox="0 0 200 200" style={{ transform: `rotate(${swing}deg)`, transformOrigin: '50% 90%' }}>
          <rect x={92} y={40} width={16} height={150} rx={6} fill="#c9a36a" />
          <path d="M100 30 L170 22 Q182 60 170 98 L100 82 Z" fill="#d7dde5" stroke="#000" strokeWidth={4} />
          <rect x={86} y={150} width={28} height={40} rx={6} fill={theme.danger} />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <Tag color={theme.danger}>Cockpit crash axe</Tag>
        </div>
        <div style={{ marginTop: 26, fontFamily: theme.mono, fontSize: 30, color: theme.muted }}>
          SOURCE: UAE PROSECUTOR GENERAL
        </div>
      </div>
    </Stage>
  );
};

/* ---------- 4. Altitude drop ---------- */
export const DropScene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [8, 80], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const alt = Math.round((34000 - t * 17000) / 100) * 100;
  const shake = t > 0 && t < 1 ? (random(`d${frame}`) - 0.5) * 22 : 0;
  const warn = frame % 10 < 5;
  return (
    <Stage>
      <div style={{ transform: `translate(${shake}px, ${-shake * 0.5}px)`, textAlign: 'center' }}>
        <div style={{ fontFamily: theme.mono, fontSize: 40, color: theme.muted, letterSpacing: 6 }}>ALTITUDE</div>
        <div
          style={{
            fontFamily: theme.mono,
            fontWeight: 700,
            fontSize: 210,
            color: t > 0.2 ? theme.danger : theme.text,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {alt.toLocaleString('en-US')}
        </div>
        <div style={{ fontFamily: theme.mono, fontSize: 52, color: theme.text, marginTop: -10 }}>FEET</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, marginTop: 50 }}>
          <svg width={110} height={150} viewBox="0 0 40 60">
            <path d="M14 0 H26 V38 H38 L20 60 L2 38 H14 Z" fill={theme.danger} />
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: theme.font, fontSize: 76, color: theme.accent }}>~17,000 FT</div>
            <div style={{ fontFamily: theme.font, fontSize: 52, color: theme.text }}>IN UNDER A MINUTE</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50, opacity: warn ? 1 : 0.2 }}>
          <Tag color={theme.danger}>Pull up · Pull up</Tag>
        </div>
      </div>
    </Stage>
  );
};

/* ---------- 5. Cockpit door ---------- */
export const DoorScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const unlockAt = 70;
  const unlocked = frame >= unlockAt;
  const open = spring({ frame: frame - unlockAt - 12, fps, config: { damping: 18 } });
  const shackle = interpolate(frame, [unlockAt, unlockAt + 8], [0, -26], clamp);
  const color = unlocked ? theme.safe : theme.danger;
  return (
    <Stage>
      <div style={{ textAlign: 'center' }}>
        <div style={{ perspective: 1400 }}>
          <div
            style={{
              width: 440,
              height: 640,
              margin: '0 auto',
              background: `linear-gradient(180deg, #2a313c, #161b22)`,
              border: `8px solid ${theme.line}`,
              borderRadius: 18,
              position: 'relative',
              transformOrigin: 'left center',
              transform: `rotateY(${-open * 55}deg)`,
              boxShadow: `0 0 ${unlocked ? 80 : 0}px ${theme.safe}55`,
            }}
          >
            <div style={{ position: 'absolute', top: 60, left: 70, right: 70, height: 150, border: `6px solid ${theme.line}`, borderRadius: 10 }} />
            <svg width={150} height={190} viewBox="0 0 60 76" style={{ position: 'absolute', right: 40, top: 300 }}>
              <path
                d="M14 34 V20 a16 16 0 0 1 32 0 V34"
                fill="none"
                stroke={color}
                strokeWidth={7}
                transform={`translate(0 ${shackle})`}
              />
              <rect x={4} y={32} width={52} height={42} rx={7} fill={color} />
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <Tag color={color}>{unlocked ? 'Door unlocked' : 'Cockpit locked'}</Tag>
        </div>
      </div>
    </Stage>
  );
};

/* ---------- 6. Passengers rush in ---------- */
export const RushScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const people = [0, 1, 2, 3, 4];
  return (
    <Stage>
      <div style={{ width: 900, textAlign: 'center' }}>
        <svg width={900} height={560} viewBox="0 0 900 560">
          {/* fuselage */}
          <rect x={20} y={140} width={860} height={280} rx={140} fill={theme.panel} stroke={theme.line} strokeWidth={6} />
          {/* cockpit at the right end */}
          <rect x={700} y={170} width={150} height={220} rx={90} fill={theme.danger} opacity={0.25} />
          <line x1={700} y1={160} x2={700} y2={400} stroke={theme.safe} strokeWidth={8} />
          <text x={775} y={290} fill={theme.text} fontFamily={theme.mono} fontSize={28} textAnchor="middle">
            COCKPIT
          </text>
          {/* seat rows */}
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={i}>
              <rect x={90 + i * 64} y={175} width={40} height={50} rx={8} fill={theme.line} />
              <rect x={90 + i * 64} y={335} width={40} height={50} rx={8} fill={theme.line} />
            </g>
          ))}
          {people.map((i) => {
            const p = spring({ frame: frame - 6 - i * 7, fps, config: { damping: 20, mass: 0.8 } });
            const x = interpolate(p, [0, 1], [120 + i * 70, 560 + i * 26]);
            const y = 280 + (i % 2 === 0 ? -20 : 20);
            const off = i === 0;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <circle r={26} fill={off ? theme.accent : theme.text} />
                <circle r={40} fill="none" stroke={off ? theme.accent : theme.text} strokeWidth={3} opacity={0.4} />
              </g>
            );
          })}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 10 }}>
          <Tag>Off-duty pilot</Tag>
          <Tag color={theme.text}>Passengers</Tag>
        </div>
      </div>
    </Stage>
  );
};

/* ---------- 7. Payoff: diversion and landing ---------- */
export const PayoffScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(frame, [70, 140], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const landed = spring({ frame: frame - 140, fps, config: { damping: 14 } });
  const counter = Math.round(interpolate(frame, [0, 40], [0, 182], clamp));
  return (
    <Stage>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: theme.font, fontSize: 150, color: theme.safe, lineHeight: 1 }}>{counter}</div>
        <div style={{ fontFamily: theme.mono, fontSize: 36, color: theme.text, letterSpacing: 4, marginBottom: 20 }}>
          PEOPLE ON BOARD · ALL LANDED
        </div>
        <div style={{ transform: 'scale(0.82)', transformOrigin: 'top center' }}>
          <MapBase>
            <path d={routePath} fill="none" stroke={theme.muted} strokeWidth={4} strokeDasharray="14 14" opacity={0.4} />
            <path
              d={divertPath}
              fill="none"
              stroke={theme.safe}
              strokeWidth={9}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - draw}
            />
            <circle cx={INC.x} cy={INC.y} r={16} fill={theme.danger} />
            <City p={DXB} label="DUBAI" dx={-34} color={theme.muted} />
            <City p={TLV} label="TEL AVIV" color={theme.muted} />
            <g opacity={landed}>
              <City p={TUU} label="TABUK" color={theme.safe} dx={-34} />
            </g>
          </MapBase>
        </div>
      </div>
    </Stage>
  );
};

/* ---------- 8. Status ---------- */
const Card: React.FC<{ title: string; body: string; color: string; delay: number }> = ({ title, body, color, delay }) => {
  const s = useIn(delay);
  return (
    <div
      style={{
        width: 900,
        background: theme.panel,
        borderLeft: `14px solid ${color}`,
        padding: '40px 44px',
        transform: `translateX(${(1 - s) * 120}px)`,
        opacity: s,
      }}
    >
      <div style={{ fontFamily: theme.mono, fontSize: 32, color: theme.muted, letterSpacing: 4 }}>{title}</div>
      <div style={{ fontFamily: theme.font, fontSize: 64, color, marginTop: 10 }}>{body}</div>
    </div>
  );
};

export const StatusScene: React.FC = () => (
  <Stage>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Card title="CAPTAIN SMIT MACHCHHAR" body="STABLE CONDITION" color={theme.safe} delay={4} />
      <Card title="ACCUSED CO-PILOT" body="WITH UAE INVESTIGATORS" color={theme.danger} delay={50} />
    </div>
  </Stage>
);

/* ---------- 9. Close ---------- */
export const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useIn(4);
  const pulse = 1 + Math.sin(frame / 4) * 0.03;
  return (
    <Stage>
      <div style={{ textAlign: 'center', transform: `scale(${s * pulse})` }}>
        <Plane size={260} color={theme.accent} />
        <div style={{ fontFamily: theme.font, fontSize: 96, color: theme.text, marginTop: 30 }}>FOLLOW</div>
        <div style={{ fontFamily: theme.mono, fontSize: 38, color: theme.muted, letterSpacing: 4 }}>
          FOR INVESTIGATION UPDATES
        </div>
      </div>
    </Stage>
  );
};
