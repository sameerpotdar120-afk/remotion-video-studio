import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { clamp, idle } from './theme';

// p33_city_pins (line 7, "किनारे बसे शहरों से"): down the coast, one after another (`step` frames apart), the
// creator's small city skyline (gp20) rises out of the map at each point (scaleY from 0 with a back-ease, from its
// base), a white name tag pops beside it, and a soft light pulses at its foot. `cities` = [x, y, name] in screen px.
// Transparent, 1080×1920.
export const P33CityPins: React.FC<{ src: string; cities: [number, number, string][]; w?: number; step?: number; out?: number }> = ({ src, cities, w = 170, step = 7, out }) => {
  useFonts();
  const f = useCurrentFrame();
  const q = out !== undefined ? interpolate(f, [out, out + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  return (
    <AbsoluteFill>
      {cities.map(([x, y, name], i) => {
        const s = interpolate(f, [i * step, i * step + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) }) * (1 - q);
        if (s <= 0) return null;
        const tag = interpolate(f, [i * step + 6, i * step + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.4)) }) * (1 - q);
        const [ix, iy] = idle(f, i + 9, 0.15);
        const h = w * 0.56, pulse = ((f + i * 9) % 40) / 40;
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: x - 30 - 30 * pulse, top: y - 10 - 10 * pulse, width: 60 + 60 * pulse, height: 20 + 20 * pulse, borderRadius: '50%', background: `rgba(255,230,160,${0.5 * (1 - pulse) * s})` }} />
            <Img src={src} style={{ position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, objectFit: 'contain', transformOrigin: '50% 100%', transform: `scale(${s}, ${s})`, filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.45))' }} />
            <div style={{ position: 'absolute', left: x + w * 0.42 + ix, top: y - h * 0.7 + iy, transform: `scale(${tag})`, transformOrigin: '0% 50%', padding: '2px 14px 0', borderRadius: 10, background: 'rgba(255,255,255,0.95)',
              fontFamily: UI, fontWeight: 800, fontSize: 32, color: '#0B1620', whiteSpace: 'nowrap', boxShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>{name}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
