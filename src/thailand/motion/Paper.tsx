import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C } from './theme';

// The cutaway backdrop: warm paper with a soft vignette and a faint floor line, as a full-frame layer.
// Pass bg={false} to a scene for a transparent render instead.
export const Paper: React.FC<{ floor?: number }> = ({ floor = 1440 }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920}>
      <defs>
        <radialGradient id="pp-v" cx="0.5" cy="0.48" r="0.75">
          <stop offset="0.55" stopColor={C.paper} />
          <stop offset="1" stopColor="#E9DFC8" />
        </radialGradient>
        <linearGradient id="pp-f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.06} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#pp-v)" />
      <rect y={floor} width={1080} height={1920 - floor} fill="url(#pp-f)" />
      <path d={`M 0 ${floor} H 1080`} stroke="#D9CCAE" strokeWidth={4} />
    </svg>
  </AbsoluteFill>
);
