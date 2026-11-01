import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Cam, GEO } from './cam';

// The plates (tools/build_canadalakes_maps.py: EOX Sentinel-2 + AWS terrain, graded) under the camera, coarse to fine.
// A fine plate fades in once the camera is close enough for it (and its centre is near it); a coarse plate is dropped
// once it would be blown up more than 40× and a fine plate covers the screen, so no layer is ever absurdly large.
const ORDER = ['namerica', 'canada', 'novascotia', 'athabasca', 'stupid', 'shield', 'louise', 'bc', 'bigass'];
const native = (n: string) => { const p = GEO.plates[n]; return (p.bounds[2] - p.bounds[0]) / p.w; };
const rect = (c: Cam, n: string) => {
  const [b0, b1, b2, b3] = GEO.plates[n].bounds;
  return { left: 540 + (b0 - c.x) / c.mpp, top: 960 - (b3 - c.y) / c.mpp, width: (b2 - b0) / c.mpp, height: (b3 - b1) / c.mpp };
};
const covers = (c: Cam, n: string) => { const r = rect(c, n); return r.left <= 0 && r.top <= 0 && r.left + r.width >= 1080 && r.top + r.height >= 1920; };
const FEATHER = 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent), linear-gradient(180deg, transparent, #000 6%, #000 94%, transparent)';
export const SEA = '#0E3A57';
export const opacityOf = (c: Cam, n: string) => {
  if (n === 'namerica') return 1;
  const k = native(n);
  const r = rect(c, n);
  const near = r.left < 1080 && r.top < 1920 && r.left + r.width > 0 && r.top + r.height > 0;
  if (!near) return 0;
  if (n === 'canada') return Math.min(1, Math.max(0, (16000 - c.mpp) / 4000));
  return Math.min(1, Math.max(0, (k * 9 - c.mpp) / (k * 4)));
};
export const MapLayers: React.FC<{ c: Cam }> = ({ c }) => {
  const vis = ORDER.map((n) => ({ n, o: opacityOf(c, n) }));
  // the finest plate fully opaque and covering the screen hides everything coarser that is blown up too far
  let floor = -1;
  vis.forEach((v, i) => { if (v.o >= 1 && covers(c, v.n)) floor = i; });
  return (
    <AbsoluteFill style={{ background: SEA, overflow: 'hidden' }}>
      {vis.map(({ n, o }, i) => {
        if (o <= 0) return null;
        if (i < floor && c.mpp < native(n) / 40) return null;
        const fine = i >= 2;
        return (
          <Img key={n} src={staticFile(`canadalakes/maps/${n}_geo.jpg`)} style={{ position: 'absolute', ...rect(c, n), maxWidth: 'none', opacity: o,
            ...(fine ? { WebkitMaskImage: FEATHER, WebkitMaskComposite: 'source-in', maskImage: FEATHER, maskComposite: 'intersect' } : {}) }} />
        );
      })}
    </AbsoluteFill>
  );
};
