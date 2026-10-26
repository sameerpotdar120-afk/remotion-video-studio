import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Cam, GEO } from './cam';

// The bright plates (tools/build_greenland_maps.py: EOX Sentinel-2 + AWS terrain, graded light) under the camera:
// the North Atlantic at z6, and Iceland at z8 on top (its edges feathered) once the camera is close. `paper` (0..1)
// lays the 9th-century paper version of the North Atlantic over them, with the creator's parchment multiplied on.
const plate = (c: Cam, name: string) => {
  const p = GEO.plates[name], [b0, b1, b2, b3] = p.bounds;
  return { left: 540 + (b0 - c.x) / c.mpp, top: 960 - (b3 - c.y) / c.mpp, width: (b2 - b0) / c.mpp, height: (b3 - b1) / c.mpp };
};
const FEATHER = 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent), linear-gradient(180deg, transparent, #000 8%, #000 92%, transparent)';
export const SEA = '#1A5E86';
export const MapLayers: React.FC<{ c: Cam; paper?: number; parchment?: string }> = ({ c, paper = 0 }) => {
  const ice = Math.min(1, Math.max(0, (2600 - c.mpp) / 900));
  return (
    <AbsoluteFill style={{ background: SEA, overflow: 'hidden' }}>
      {paper < 1 && <Img src={staticFile('greenland/maps/atlantic_geo.jpg')} style={{ position: 'absolute', ...plate(c, 'atlantic'), maxWidth: 'none' }} />}
      {paper < 1 && ice > 0 && (
        <Img src={staticFile('greenland/maps/iceland_geo.jpg')} style={{ position: 'absolute', ...plate(c, 'iceland'), maxWidth: 'none', opacity: ice,
          WebkitMaskImage: FEATHER, WebkitMaskComposite: 'source-in', maskImage: FEATHER, maskComposite: 'intersect' }} />
      )}
      {paper > 0 && (
        <AbsoluteFill style={{ opacity: paper }}>
          <AbsoluteFill style={{ background: '#CDBF9E' }} />
          <Img src={staticFile('greenland/maps/atlantic_paper.jpg')} style={{ position: 'absolute', ...plate(c, 'atlantic'), maxWidth: 'none' }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
