import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const MainComposition: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 240], [1, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#111111',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 700, textAlign: 'center' }}>
        {title}
      </div>
    </AbsoluteFill>
  );
};
