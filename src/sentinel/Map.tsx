import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import plates from '../../public/sentinel/maps/plates.json';
import { Cam, PLANE, pxPerM } from './cam';

type Plate = { src: string; x0: number; y0: number; x1: number; y1: number; feather: number };
const P = plates as unknown as Record<string, { bounds: [number, number, number, number] }>;
const mk = (src: string, key: string, feather: number): Plate => {
  const [x0, y0, x1, y1] = P[key].bounds;
  return { src, x0, y0, x1, y1, feather };
};
const WORLD = mk('sentinel/maps/world.jpg', 'world', 0);
const WORLD_S = mk('sentinel/maps/world_small.jpg', 'world', 0);
const ANDAMAN = mk('sentinel/maps/andaman.jpg', 'andaman', 0.04);
const REGION = mk('sentinel/maps/region.jpg', 'region', 0.25);
const SENTINEL = mk('sentinel/maps/sentinel.jpg', 'sentinel', 0.22);
const ALL = [WORLD, WORLD_S, ANDAMAN, REGION, SENTINEL];

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
  const [handle] = useState(() => delayRender('sentinel plates'));

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
    ctx.fillStyle = '#0b2235';
    ctx.fillRect(0, 0, cv.width, cv.height);
    const [world, worldS, andaman, region, sentinel] = srcs;
    const mpp = cam.span / 1920;
    const sA = fade(mpp, 22, 55);
    const rA = fade(mpp, 110, 260);
    const aA = fade(mpp, 1100, 2600);
    const hide = (p: Plate, a: number) => a >= 1 && covers(p, cam);
    const sFull = hide(SENTINEL, sA);
    const rFull = sFull || hide(REGION, rA);
    const aFull = rFull || hide(ANDAMAN, aA);
    if (!aFull) draw(ctx, mpp > 5000 ? worldS : world, WORLD, cam, 1);
    if (!rFull) draw(ctx, andaman, ANDAMAN, cam, aA);
    if (!sFull) draw(ctx, region, REGION, cam, rA);
    draw(ctx, sentinel, SENTINEL, cam, sA);
  }, [cam, srcs]);

  return (
    <canvas ref={ref} width={PLANE.w} height={PLANE.h}
      style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h, ...style }} />
  );
};
