import React from 'react';
import { AbsoluteFill } from 'remotion';

// c19_map_grade (look A, the reference's lens): a tilt-shift blur over the top and bottom of the map (backdrop blur
// fading in over the outer 22% of the frame, the middle stays sharp), a dark vignette on all four edges and a faint
// warm wash. Put it above the map and the fills, below labels. `blur` in px. No grain.
export const C19MapGrade: React.FC<{ blur?: number; vignette?: number }> = ({ blur = 7, vignette = 0.55 }) => {
  const band = (top: boolean): React.CSSProperties => ({
    position: 'absolute', left: 0, right: 0, height: 440, [top ? 'top' : 'bottom']: 0, backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`,
    WebkitMaskImage: `linear-gradient(${top ? 180 : 0}deg, #000, transparent)`, maskImage: `linear-gradient(${top ? 180 : 0}deg, #000, transparent)`,
  });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={band(true)} />
      <div style={band(false)} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 62% at 50% 50%, rgba(0,0,0,0) 55%, rgba(10,4,0,${vignette}) 100%)` }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(255,190,120,0.05), rgba(0,0,0,0) 40%, rgba(0,0,0,0) 70%, rgba(40,20,0,0.12))' }} />
    </AbsoluteFill>
  );
};
