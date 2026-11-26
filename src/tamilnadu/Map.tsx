import React from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile } from 'remotion';
import { Cam, GEO } from './cam';

// The plates (tools/brands/build_maps.py: EOX Sentinel-2 + AWS terrain, softened) under the camera, coarse to fine,
// turned black and white (the documentary map style). Each plate is painted as the background of a screen-sized box,
// so the browser only paints the part on screen however deep the zoom (a giant <img> crashed deep-zoom renders).
const SRC = (n: string) => staticFile(`tamilnadu/maps/${n}_geo.jpg`);
const native = (n: string) => { const p = GEO.plates[n]; return (p.bounds[2] - p.bounds[0]) / p.w; };
const rect = (c: Cam, n: string) => {
  const [b0, b1, b2, b3] = GEO.plates[n].bounds;
  return { left: 540 + (b0 - c.x) / c.mpp, top: 960 - (b3 - c.y) / c.mpp, width: (b2 - b0) / c.mpp, height: (b3 - b1) / c.mpp };
};
const covers = (c: Cam, n: string) => { const r = rect(c, n); return r.left <= -40 && r.top <= -40 && r.left + r.width >= 1120 && r.top + r.height >= 1960; };
const FEATHER = 'linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent), linear-gradient(180deg, transparent, #000 5%, #000 95%, transparent)';
export const SEA = '#0b0d10';
const opacityOf = (c: Cam, n: string, first: boolean) => {
  if (first) return 1;
  const k = native(n);
  const r = rect(c, n);
  if (!(r.left < 1080 && r.top < 1920 && r.left + r.width > 0 && r.top + r.height > 0)) return 0;
  // a plate fades in once the camera is within ~2.5x of its native resolution
  return Math.min(1, Math.max(0, (k * 6 - c.mpp) / (k * 3)));
};

let preloaded: Promise<unknown> | null = null;
const usePreload = () => {
  const [h] = React.useState(() => delayRender('tn plates'));
  React.useEffect(() => {
    preloaded ??= Promise.all(GEO.order.map((n) => { const i = new Image(); i.src = SRC(n); return i.decode().catch(() => undefined); }));
    preloaded.then(() => continueRender(h));
  }, [h]);
};

export const MapLayers: React.FC<{ c: Cam }> = ({ c }) => {
  usePreload();
  const vis = GEO.order.map((n, i) => ({ n, o: opacityOf(c, n, i === 0) }));
  let floor = -1;
  vis.forEach((v, i) => { if (v.o >= 1 && covers(c, v.n)) floor = i; });
  return (
    <AbsoluteFill style={{ background: SEA, overflow: 'hidden', filter: 'grayscale(1) contrast(1.38) brightness(0.8)' }}>
      {vis.map(({ n, o }, i) => {
        if (o <= 0 || (i < floor && c.mpp < native(n) / 12)) return null;
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
