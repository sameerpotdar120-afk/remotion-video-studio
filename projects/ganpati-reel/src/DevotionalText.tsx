import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

export const DevotionalText: React.FC<{
  line: string;
  accent?: string;
  durationInFrames: number;
}> = ({line, accent, durationInFrames}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        right: 80,
        bottom: 150,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: interpolate(
          frame,
          [0, 7, durationInFrames - 8, durationInFrames - 1],
          [0, 1, 1, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          },
        ),
        translate: interpolate(frame, [0, 9], ['0px 34px', '0px 0px'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.spring({damping: 200}),
        }),
        scale: interpolate(frame, [0, 10], [0.93, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.spring({damping: 200}),
          output: 'perceptual-scale',
        }),
      }}
    >
      <div
        style={{
          maxWidth: 920,
          padding: '18px 42px 20px',
          border: '2px solid rgba(255,218,133,0.72)',
          borderRadius: 28,
          color: '#fff7df',
          background: 'linear-gradient(135deg, rgba(102,0,0,0.84), rgba(169,28,0,0.78))',
          boxShadow: '0 12px 50px rgba(34,0,0,0.45), inset 0 0 30px rgba(255,174,54,0.14)',
          fontFamily: 'Mukta',
          fontSize: 88,
          fontWeight: 700,
          lineHeight: 0.98,
          letterSpacing: 1,
          textAlign: 'center',
          textShadow: '0 4px 0 #6f1300, 0 8px 18px rgba(0,0,0,0.55)',
        }}
      >
        {line}
      </div>
      {accent ? (
        <div
          style={{
            marginTop: 14,
            color: '#ffd989',
            fontFamily: 'Montserrat',
            fontSize: 35,
            fontWeight: 900,
            letterSpacing: 8,
            textShadow: '0 3px 12px rgba(0,0,0,0.8)',
          }}
        >
          {accent}
        </div>
      ) : null}
    </div>
  );
};
