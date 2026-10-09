import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { Cam, GEO, PLANE, pxPerM } from './cam';

type Plate = { src: string; x0: number; y0: number; x1: number; y1: number; feather: number };
const mk = (src: string, b: [number, number, number, number], feather: number): Plate => ({ src, x0: b[0], y0: b[1], x1: b[2], y1: b[3], feather });
const WORLD = mk('elnino/maps/world.jpg', GEO.world.bounds, 0);
const WORLD_S = mk('elnino/maps/world_small.jpg', GEO.world.bounds, 0);
const INDIA = mk('elnino/maps/india.jpg', GEO.india.bounds, 0.12);
const PERU = mk('elnino/maps/peru.jpg', GEO.peru.bounds, 0.12);
const INDO = mk('elnino/maps/indo.jpg', GEO.indo.bounds, 0.1);
const MASK = mk('elnino/maps/ocean_mask.png', GEO.sst.bounds, 0);
const PLATES = [WORLD, WORLD_S, INDIA, PERU, INDO, MASK];
export const SST_DAYS = GEO.sst.days;

type Source = HTMLImageElement | HTMLCanvasElement;
const cache = new Map<string, Promise<Source>>();
const load = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = staticFile(src);
  });
/** Mask PNG (greyscale) → canvas whose alpha is the grey value, for destination-in compositing. */
const asAlpha = async (src: string): Promise<Source> => {
  const img = await load(src);
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    d.data[i + 3] = d.data[i];
    d.data[i] = d.data[i + 1] = d.data[i + 2] = 255;
  }
  ctx.putImageData(d, 0, 0);
  return c;
};
const feathered = async (p: Plate): Promise<Source> => {
  if (p === MASK) return asAlpha(p.src);
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
const sstCache = new Map<string, Promise<HTMLImageElement>>();
const getSst = (day: string) => {
  if (!sstCache.has(day)) sstCache.set(day, load(`elnino/maps/sst/sst_${day}.jpg`));
  return sstCache.get(day)!;
};

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

/** Satellite plates + the NOAA sea-temperature layer (`sst.day` is a fractional index into SST_DAYS, cross-faded). */
export const MapCanvas: React.FC<{ cam: Cam; sst?: { a: number; day: number }; style?: React.CSSProperties }> = ({ cam, sst, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const tmp = useRef<HTMLCanvasElement | null>(null);
  const [srcs, setSrcs] = useState<Source[] | null>(null);
  const [handle] = useState(() => delayRender('elnino plates'));
  const day = sst && sst.a > 0.001 ? sst.day : -1;
  const d0 = Math.max(0, Math.min(SST_DAYS.length - 1, Math.floor(day)));
  const d1 = Math.min(SST_DAYS.length - 1, d0 + 1);
  const [ssts, setSsts] = useState<{ key: string; a: HTMLImageElement; b: HTMLImageElement } | null>(null);
  const key = day >= 0 ? `${d0}-${d1}` : '';

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

  useEffect(() => {
    if (!key) return;
    const h = delayRender('sst ' + key);
    Promise.all([getSst(SST_DAYS[d0]), getSst(SST_DAYS[d1])])
      .then(([a, b]) => {
        setSsts({ key, a, b });
        continueRender(h);
      })
      .catch((e) => {
        console.error(e);
        continueRender(h);
      });
  }, [key, d0, d1]);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !srcs) return;
    const ctx = cv.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#0b2a3f';
    ctx.fillRect(0, 0, cv.width, cv.height);
    const [world, worldS, india, peru, indo, mask] = srcs;
    const mpp = cam.span / 1920;
    const nA = fade(mpp, 3600, 6000);
    const pA = fade(mpp, 3000, 5200);
    const oA = fade(mpp, 5200, 8500);
    const full = (p: Plate, a: number) => a >= 1 && covers(p, cam);
    if (!(full(INDIA, nA) || full(PERU, pA))) draw(ctx, mpp > 12000 ? worldS : world, WORLD, cam, 1);
    draw(ctx, indo, INDO, cam, oA);
    draw(ctx, india, INDIA, cam, nA);
    draw(ctx, peru, PERU, cam, pA);

    if (sst && sst.a > 0.001 && ssts && ssts.key === key) {
      if (!tmp.current) {
        tmp.current = document.createElement('canvas');
        tmp.current.width = PLANE.w;
        tmp.current.height = PLANE.h;
      }
      const t = tmp.current.getContext('2d')!;
      t.globalCompositeOperation = 'source-over';
      t.clearRect(0, 0, PLANE.w, PLANE.h);
      const SST = { ...MASK };
      draw(t, ssts.a, SST, cam, 1);
      if (d1 !== d0) draw(t, ssts.b, SST, cam, day - d0);
      t.globalCompositeOperation = 'destination-in';
      draw(t, mask, MASK, cam, 1);
      t.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = sst.a;
      ctx.drawImage(tmp.current, 0, 0);
      ctx.globalAlpha = 1;
    }
  }, [cam, srcs, sst?.a, day, ssts, key]);

  return (
    <canvas ref={ref} width={PLANE.w} height={PLANE.h}
      style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h, ...style }} />
  );
};
