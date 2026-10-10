import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { Cam, GEO, PLANE, pxPerM } from './cam';

type Plate = { src: string; x0: number; y0: number; x1: number; y1: number; feather: number; full: number; none: number };
const mk = (name: string, feather: number, full: number, none: number): Plate => {
  const b = GEO.plates[name].bounds;
  return { src: `spain/maps/${name}_sat.jpg`, x0: b[0], y0: b[1], x1: b[2], y1: b[3], feather, full, none };
};
// coarse → fine; each fades in as the camera zooms past about 3× its native resolution
const PLATES = [
  mk('europe', 0.05, 1e9, 2e9),
  mk('iberia', 0.06, 1800, 3500),
  mk('alboran', 0.07, 450, 900),
  mk('strait', 0.07, 230, 450),
  mk('cerdanya', 0.07, 115, 230),
  mk('gibraltar', 0.07, 30, 60),
  mk('bidasoa', 0.06, 20, 40),
  mk('penon', 0.08, 8, 16),
];
export const SEA_BG = '#0b1e2c';

type Source = HTMLImageElement | HTMLCanvasElement;
const cache = new Map<string, Promise<Source>>();
const load = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = staticFile(src);
  });
const feathered = async (p: Plate): Promise<Source> => {
  const img = await load(p.src);
  if (!p.feather) return img;
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  for (const horiz of [true, false]) {
    const g = horiz ? ctx.createLinearGradient(0, 0, c.width, 0) : ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(p.feather, 'rgba(0,0,0,1)');
    g.addColorStop(1 - p.feather, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  return c;
};
const get = (p: Plate) => {
  if (!cache.has(p.src)) cache.set(p.src, feathered(p));
  return cache.get(p.src)!;
};

/** What the screen (1080×1920 at the plane's centre, plus a margin) sees, in Mercator metres. */
const view = (c: Cam, margin = 1.25) => {
  const k = pxPerM(c);
  const hw = (1100 * margin) / k;
  const hh = (1100 * margin) / k;
  return { w: c.x - hw, e: c.x + hw, n: c.y + hh, s: c.y - hh };
};
const covers = (p: Plate, c: Cam) => {
  const v = view(c);
  const m = p.feather * (p.x1 - p.x0) * 1.05;
  return v.w > p.x0 + m && v.e < p.x1 - m && v.n < p.y1 - m && v.s > p.y0 + m;
};
const overlaps = (p: Plate, c: Cam) => {
  const v = view(c, 1.4);
  return v.e > p.x0 && v.w < p.x1 && v.n > p.y0 && v.s < p.y1;
};

const draw = (ctx: CanvasRenderingContext2D, src: Source, p: Plate, c: Cam, alpha: number) => {
  if (alpha <= 0.001 || !overlaps(p, c)) return;
  const k = pxPerM(c);
  const v = view(c, 1.4);
  const w = Math.max(v.w, p.x0);
  const e = Math.min(v.e, p.x1);
  const n = Math.min(v.n, p.y1);
  const s = Math.max(v.s, p.y0);
  if (e <= w || n <= s) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(src, ((w - p.x0) / (p.x1 - p.x0)) * src.width, ((p.y1 - n) / (p.y1 - p.y0)) * src.height,
    ((e - w) / (p.x1 - p.x0)) * src.width, ((n - s) / (p.y1 - p.y0)) * src.height,
    PLANE.ox + (w - c.x) * k, PLANE.oy + (c.y - n) * k, (e - w) * k, (n - s) * k);
  ctx.globalAlpha = 1;
};

const fade = (mpp: number, full: number, none: number) => Math.min(1, Math.max(0, (none - mpp) / (none - full)));

/** Coarse-to-fine stack: the coarsest is skipped once a finer plate fully covers the screen. */
export const MapCanvas: React.FC<{ cam: Cam }> = ({ cam }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [srcs, setSrcs] = useState<Source[] | null>(null);
  const [handle] = useState(() => delayRender('spain plates'));
  useEffect(() => {
    Promise.all(PLATES.map(get))
      .then((s) => {
        setSrcs(s);
        continueRender(handle);
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !srcs) return;
    const ctx = cv.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = SEA_BG;
    ctx.fillRect(0, 0, cv.width, cv.height);
    const mpp = cam.span / 1920;
    const a = PLATES.map((p, i) => (i === 0 ? 1 : fade(mpp, p.full, p.none)));
    let start = 0;
    for (let i = PLATES.length - 1; i > 0; i--) if (a[i] >= 1 && covers(PLATES[i], cam)) { start = i; break; }
    for (let i = start; i < PLATES.length; i++) draw(ctx, srcs[i], PLATES[i], cam, i === start ? 1 : a[i]);
    // lift the near-black Sentinel-2 sea to a deep navy (anything brighter, i.e. land, is untouched)
    ctx.globalCompositeOperation = 'lighten';
    ctx.fillStyle = '#0f3550';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.globalCompositeOperation = 'source-over';
  }, [cam, srcs]);

  return <canvas ref={ref} width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h }} />;
};
