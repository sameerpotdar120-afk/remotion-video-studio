import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { Captions } from './Captions';
import {
  AxeScene,
  CloseScene,
  DoorScene,
  DropScene,
  HookScene,
  PayoffScene,
  RouteScene,
  RushScene,
  StatusScene,
} from './Scenes';
import { BEATS, SceneId, sceneFrames, TOTAL_FRAMES } from './script';
import { theme } from './theme';

const SCENES: Record<SceneId, React.FC> = {
  hook: HookScene,
  route: RouteScene,
  axe: AxeScene,
  drop: DropScene,
  door: DoorScene,
  rush: RushScene,
  payoff: PayoffScene,
  status: StatusScene,
  close: CloseScene,
};

const FADE = 6;

const SceneFade: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, FADE, duration - FADE, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const zoom = interpolate(frame, [0, duration], [1, 1.04]);
  return <AbsoluteFill style={{ opacity, transform: `scale(${zoom})` }}>{children}</AbsoluteFill>;
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${theme.line}55 2px, transparent 2px), linear-gradient(90deg, ${theme.line}55 2px, transparent 2px)`,
          backgroundSize: '90px 90px',
          backgroundPosition: `0 ${frame * 0.6}px`,
          opacity: 0.5,
        }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.85) 100%)' }} />
    </AbsoluteFill>
  );
};

const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = frame / TOTAL_FRAMES;
  const blink = frame % 24 < 14;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', top: 0, left: 0, height: 10, width: `${progress * 100}%`, background: theme.accent }} />
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 60,
          right: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          fontFamily: theme.mono,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: 3,
        }}
      >
        <div style={{ background: theme.danger, color: '#fff', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', opacity: blink ? 1 : 0.2 }} />
          BREAKING
        </div>
        <div style={{ color: theme.text }}>FLYDUBAI FZ1073</div>
      </div>
    </AbsoluteFill>
  );
};

export const FlightAttackReel: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontWeight: 900 }}>
      <Background />
      {BEATS.map((beat) => {
        const duration = sceneFrames(beat);
        const Scene = SCENES[beat.id];
        const start = from;
        from += duration;
        return (
          <Sequence key={beat.id} from={start} durationInFrames={duration} name={beat.id}>
            <SceneFade duration={duration}>
              <Scene />
            </SceneFade>
            <Captions text={beat.text} durationInFrames={duration} />
          </Sequence>
        );
      })}
      <Header />
    </AbsoluteFill>
  );
};
