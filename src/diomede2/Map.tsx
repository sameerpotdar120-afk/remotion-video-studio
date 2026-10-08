import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import v1 from '../../public/diomede/maps/plates.json';
import { Cam, GEO2, PLANE, pxPerM } from './cam';

type Plate = { src: string; x0: number; y0: number; x1: number; y1: number; feather: number };
const P1 = v1 as unknown as Record<string, { x0: number; x1: number; y0: number; y1: number }>;
const [wx0, wy0, wx1, wy1] = GEO2.plate.bounds;
const WORLD2: Plate = { src: 'diomede/v2/maps/world2.jpg', x0: wx0, y0: wy0, x1: wx1, y1: wy1, feather: 0 };
const WORLD2_S: Plate = { ...WORLD2, src: 'diomede/v2/maps/world2_small.jpg' };
const PACIFIC: Plate = { src: 'diomede/maps/world_merc.jpg', ...P1.world, feather: 0.03 };
const BERING: Plate = { src: 'diomede/maps/bering_merc.jpg', ...P1.bering, feather: 0.1 };
const ISLANDS: Plate = { src: 'diomede/maps/islands_merc.jpg', ...P1.islands, feather: 0.14 };
const ALL = [WORLD2, WORLD2_S, PACIFIC, BERING, ISLANDS];

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

/** Visible plane extent in Mercator metres. */
const view = (c: Cam) => {
  const k = pxPerM(c);
  return { w: c.x - PLANE.ox / k, e: c.x + (PLANE.w - PLANE.ox) / k, n: c.y + PLANE.oy / k, s: c.y - (PLANE.h - PLANE.oy) / k };
};
const covers = (p: Plate, c: Cam) => {
  const v = view(c);
  const m = p.feather * (p.x1 - p.x0) * 1.05;
  return v.w > p.x0 + m && v.e < p.x1 - m && v.n < p.y1 - m && v.s > p.y0 + m;
};

const draw = (ctx: CanvasRenderingContext2D, src: Source, p: Plate, c: Cam, alpha: number) => {
  if (alpha <= 0.001) return;
  const k = pxPerM(c);
  const v = view(c);
  const w = Math.max(v.w, p.x0);
  const e = Math.min(v.e, p.x1);
  const n = Math.min(v.n, p.y1);
  const s = Math.max(v.s, p.y0);
  if (e <= w || n <= s) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    src,
    ((w - p.x0) / (p.x1 - p.x0)) * src.width,
    ((p.y1 - n) / (p.y1 - p.y0)) * src.height,
    ((e - w) / (p.x1 - p.x0)) * src.width,
    ((n - s) / (p.y1 - p.y0)) * src.height,
    PLANE.ox + (w - c.x) * k,
    PLANE.oy + (c.y - n) * k,
    (e - w) * k,
    (n - s) * k,
  );
  ctx.globalAlpha = 1;
};

const fade = (mpp: number, full: number, none: number) => Math.min(1, Math.max(0, (none - mpp) / (none - full)));

export const MapCanvas: React.FC<{ cam: Cam; style?: React.CSSProperties }> = ({ cam, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [srcs, setSrcs] = useState<Source[] | null>(null);
  const [handle] = useState(() => delayRender('diomede2 plates'));

  useEffect(() => {
    Promise.all(ALL.map(get))
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
    ctx.fillStyle = '#0a2236';
    ctx.fillRect(0, 0, cv.width, cv.height);
    const [world, worldS, pacific, bering, islands] = srcs;
    const mpp = cam.span / 1920;
    const iA = fade(mpp, 150, 400);
    const bA = fade(mpp, 1500, 3500);
    const pA = fade(mpp, 2600, 6000);
    const hide = (p: Plate, a: number) => a >= 1 && covers(p, cam);
    const iFull = hide(ISLANDS, iA);
    const bFull = iFull || hide(BERING, bA);
    const pFull = bFull || hide(PACIFIC, pA);
    if (!pFull) draw(ctx, mpp > 9000 ? worldS : world, WORLD2, cam, 1);
    if (!bFull) draw(ctx, pacific, PACIFIC, cam, pA);
    if (!iFull) draw(ctx, bering, BERING, cam, bA);
    draw(ctx, islands, ISLANDS, cam, iA);
  }, [cam, srcs]);

  return (
    <canvas ref={ref} width={PLANE.w} height={PLANE.h}
      style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h, ...style }} />
  );
};
