import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Arms, BannerPin } from './Heraldry';
import { clamp, pop } from './theme';

// h21_banners (line 12, "1453 में France ने ये जंग जीत ली"; the reference's 90.8–95.9 s): banner pins pop in over the map:
// St George crosses for England's holdings and fleur-de-lis for France. Then France's banners multiply (`spread`) while
// the English ones slide out to the edges and vanish, all but one (Calais, `keep`). Pins are frame pixels; the edit
// projects real places. Transparent, 1080×1920, 60 fps, 300 frames.
type Pin = { id: Arms; x: number; y: number; t: number; out?: [number, number] };
const DEF: Pin[] = [
  { id: 'england', x: 420, y: 760, t: 0, out: [-200, 600] }, { id: 'england', x: 600, y: 700, t: 6 }, { id: 'england', x: 330, y: 1000, t: 12, out: [-220, 1100] },
  { id: 'england', x: 520, y: 1180, t: 18, out: [300, 2100] }, { id: 'france', x: 650, y: 980, t: 24 }, { id: 'france', x: 760, y: 1100, t: 30 },
  { id: 'france', x: 520, y: 900, t: 120 }, { id: 'france', x: 420, y: 1080, t: 132 }, { id: 'france', x: 560, y: 1300, t: 144 }, { id: 'france', x: 720, y: 1300, t: 156 },
  { id: 'france', x: 380, y: 1260, t: 168 }, { id: 'france', x: 640, y: 1160, t: 180 },
];

export const H21Banners: React.FC<{ pins?: Pin[]; flee?: number }> = ({ pins = DEF, flee = 120 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {pins.map((p, i) => {
          if (f < p.t) return null;
          const k = pop(f, p.t, p.t + 12, 2.4);
          const go = p.out ? interpolate(f, [flee + i * 8, flee + i * 8 + 40], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
          const x = p.out ? p.x + (p.out[0] - p.x) * go : p.x, y = p.out ? p.y + (p.out[1] - p.y) * go : p.y;
          return (
            <g key={i} transform={`translate(${x} ${y + Math.sin(f / 14 + i) * 5}) scale(${k * (1 - go * 0.5)})`} opacity={1 - go}>
              <path d="M 0 40 L 0 80" stroke="#fff" strokeWidth={6} />
              <BannerPin id={p.id} w={96} uid={`p${i}`} wave={Math.sin(f / 8 + i) * 6} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
