import React from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile } from 'remotion';
import { Cam, GEO } from './cam';

// The plates (tools/build_mapsizes_maps.py: EOX Sentinel-2 + AWS terrain, graded) under the camera, coarse to fine.
// Each plate is painted as the background of a screen-sized box (background-size/-position place it), so the browser
// only ever paints the part on screen, however far the camera zooms in: a plate drawn as a giant <img> crashed the
// render tab after a few hundred deep-zoom frames. The images are decoded once, before the first frame.
const ORDER = ['world', 'greenland', 'india'];
const SRC = (n: string) => staticFile(`mapsizes/maps/${n}_geo.jpg`);
const native = (n: string) => { const p = GEO.plates[n]; return (p.bounds[2] - p.bounds[0]) / p.w; };
const rect = (c: Cam, n: string) => {
  const [b0, b1, b2, b3] = GEO.plates[n].bounds;
  return { left: 540 + (b0 - c.x) / c.mpp, top: 960 - (b3 - c.y) / c.mpp, width: (b2 - b0) / c.mpp, height: (b3 - b1) / c.mpp };
};
const covers = (c: Cam, n: string) => { const r = rect(c, n); return r.left <= 0 && r.top <= 0 && r.left + r.width >= 1080 && r.top + r.height >= 1920; };
const FEATHER = 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent), linear-gradient(180deg, transparent, #000 6%, #000 94%, transparent)';
export const SEA = '#0E3A57';
export const opacityOf = (c: Cam, n: string) => {
  if (n === 'world') return 1;
  const k = native(n);
  const r = rect(c, n);
  const near = r.left < 1080 && r.top < 1920 && r.left + r.width > 0 && r.top + r.height > 0;
  if (!near) return 0;
  return Math.min(1, Math.max(0, (k * 9 - c.mpp) / (k * 4)));
};

let preloaded: Promise<unknown> | null = null;
const usePreload = () => {
  const [h] = React.useState(() => delayRender('ms plates'));
  React.useEffect(() => {
    if (!preloaded) preloaded = Promise.all(ORDER.map((n) => { const i = new Image(); i.src = SRC(n); return i.decode().catch(() => undefined); }));
    preloaded.then(() => continueRender(h));
  }, [h]);
};

export const MapLayers: React.FC<{ c: Cam }> = ({ c }) => {
  usePreload();
  const vis = ORDER.map((n) => ({ n, o: opacityOf(c, n) }));
  // the finest plate fully opaque and covering the screen hides everything coarser that is blown up too far
  let floor = -1;
  vis.forEach((v, i) => { if (v.o >= 1 && covers(c, v.n)) floor = i; });
  return (
    <AbsoluteFill style={{ background: SEA, overflow: 'hidden' }}>
      {vis.map(({ n, o }, i) => {
        if (o <= 0) return null;
        if (i < floor && c.mpp < native(n) / 30) return null;
        const r = rect(c, n);
        const size = `${r.width}px ${r.height}px`, pos = `${r.left}px ${r.top}px`;
        const fine = i >= 1;
        return (
          <div key={n} style={{ position: 'absolute', inset: 0, opacity: o, backgroundImage: `url(${SRC(n)})`, backgroundSize: size, backgroundPosition: pos, backgroundRepeat: 'no-repeat',
            ...(fine ? { WebkitMaskImage: FEATHER, WebkitMaskSize: size, WebkitMaskPosition: pos, WebkitMaskRepeat: 'no-repeat', WebkitMaskComposite: 'source-in',
              maskImage: FEATHER, maskSize: size, maskPosition: pos, maskRepeat: 'no-repeat', maskComposite: 'intersect' } : {}) }} />
        );
      })}
    </AbsoluteFill>
  );
};
