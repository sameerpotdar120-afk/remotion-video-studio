import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { Cam, GEO, PLANE, pxPerM } from './cam';

type Plate = { src: string; x0: number; y0: number; x1: number; y1: number; feather: number };
const mk = (src: string, b: [number, number, number, number], feather: number): Plate => ({ src, x0: b[0], y0: b[1], x1: b[2], y1: b[3], feather });
const WORLD = mk('louisiana/maps/world.jpg', GEO.world.bounds, 0);
const NAM = mk('louisiana/maps/namerica.jpg', GEO.namerica.bounds, 0.06);
const EUR = mk('louisiana/maps/europe.jpg', GEO.europe.bounds, 0.08);
const CARIB = mk('louisiana/maps/carib.jpg', GEO.carib.bounds, 0.08);
const SAT = mk('louisiana/maps/carib_sat.jpg', GEO.carib.bounds, 0.08);
const PLATES = [WORLD, NAM, EUR, CARIB, SAT];

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

const view = (c: Cam) => {
  const k = pxPerM(c);
  return { w: c.x - PLANE.ox / k, e: c.x + (PLANE.w - PLANE.ox) / k, n: c.y + PLANE.oy / k, s: c.y - (PLANE.h - PLANE.oy) / k };
};
const covers = (p: Plate, c: Cam) => {
  const v = view(c);
  const m = p.feather * (p.x1 - p.x0) * 1.05;
  return v.w > p.x0 + m && v.e < p.x1 - m && v.n < p.y1 - m && v.s > p.y0 + m;
};
const overlaps = (p: Plate, c: Cam) => {
  const v = view(c);
  return v.e > p.x0 && v.w < p.x1 && v.n > p.y0 && v.s < p.y1;
};

const draw = (ctx: CanvasRenderingContext2D, src: Source, p: Plate, c: Cam, alpha: number) => {
  if (alpha <= 0.001 || !overlaps(p, c)) return;
  const k = pxPerM(c);
  const v = view(c);
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

/** Parchment plates, finest on top, plus the satellite plate for the Caribbean dive (`sat` 0..1). */
export const MapCanvas: React.FC<{ cam: Cam; sat?: number; style?: React.CSSProperties }> = ({ cam, sat = 0, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [srcs, setSrcs] = useState<Source[] | null>(null);
  const [handle] = useState(() => delayRender('louisiana plates'));
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
    ctx.fillStyle = '#6f9a98';
    ctx.fillRect(0, 0, cv.width, cv.height);
    const [world, nam, eur, carib, satImg] = srcs;
    const mpp = cam.span / 1920;
    const rA = fade(mpp, 3200, 5200);
    const cA = fade(mpp, 1400, 2600);
    const full = (p: Plate, a: number) => a >= 1 && covers(p, cam);
    if (!(full(NAM, rA) || full(EUR, rA) || full(CARIB, cA))) draw(ctx, world, WORLD, cam, 1);
    draw(ctx, nam, NAM, cam, rA);
    draw(ctx, eur, EUR, cam, rA);
    draw(ctx, carib, CARIB, cam, cA);
    if (sat > 0.001) draw(ctx, satImg, SAT, cam, sat);
  }, [cam, srcs, sat]);

  return <canvas ref={ref} width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h, ...style }} />;
};
