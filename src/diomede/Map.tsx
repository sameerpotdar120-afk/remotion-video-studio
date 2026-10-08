import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import plates from '../../public/diomede/maps/plates.json';
import { Cam, PLANE, pxPerM } from './cam';

type Plate = { src: string; x0: number; x1: number; y0: number; y1: number; feather: number };

const P = plates as Record<string, { x0: number; x1: number; y0: number; y1: number }>;
const WORLD: Plate = { src: 'diomede/maps/world_merc.jpg', ...P.world, feather: 0 };
const WORLD_HALF: Plate = { ...WORLD, src: 'diomede/maps/world_merc_half.jpg' };
const BERING: Plate = { src: 'diomede/maps/bering_merc.jpg', ...P.bering, feather: 0.08 };
const ISLANDS: Plate = { src: 'diomede/maps/islands_merc.jpg', ...P.islands, feather: 0.12 };

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
  const f = p.feather;
  for (const horiz of [true, false]) {
    const g = horiz ? ctx.createLinearGradient(0, 0, c.width, 0) : ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(f, 'rgba(0,0,0,1)');
    g.addColorStop(1 - f, 'rgba(0,0,0,1)');
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

/** Draw the visible part of a plate; returns true if the plate covers the whole plane. */
const draw = (ctx: CanvasRenderingContext2D, src: Source, p: Plate, c: Cam, alpha: number) => {
  if (alpha <= 0.001) return false;
  const k = pxPerM(c);
  const vW = c.x - PLANE.ox / k;
  const vE = c.x + (PLANE.w - PLANE.ox) / k;
  const vN = c.y + PLANE.oy / k;
  const vS = c.y - (PLANE.h - PLANE.oy) / k;
  const w = Math.max(vW, p.x0);
  const e = Math.min(vE, p.x1);
  const n = Math.min(vN, p.y1);
  const s = Math.max(vS, p.y0);
  if (e <= w || n <= s) return false;
  const iw = src.width;
  const ih = src.height;
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    src,
    ((w - p.x0) / (p.x1 - p.x0)) * iw,
    ((p.y1 - n) / (p.y1 - p.y0)) * ih,
    ((e - w) / (p.x1 - p.x0)) * iw,
    ((n - s) / (p.y1 - p.y0)) * ih,
    PLANE.ox + (w - c.x) * k,
    PLANE.oy + (c.y - n) * k,
    (e - w) * k,
    (n - s) * k,
  );
  ctx.globalAlpha = 1;
  const m = p.feather * (p.x1 - p.x0) * 1.05;
  return alpha >= 1 && vW > p.x0 + m && vE < p.x1 - m && vN < p.y1 - m && vS > p.y0 + m;
};

export const MapCanvas: React.FC<{ cam: Cam; style?: React.CSSProperties }> = ({ cam, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [srcs, setSrcs] = useState<Source[] | null>(null);
  const [handle] = useState(() => delayRender('diomede plates'));

  useEffect(() => {
    Promise.all([get(WORLD), get(WORLD_HALF), get(BERING), get(ISLANDS)])
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
    ctx.fillStyle = '#071a33';
    ctx.fillRect(0, 0, cv.width, cv.height);
    const k = pxPerM(cam);
    const [world, half, bering, islands] = srcs;
    // metres per screen pixel decides which plates are worth drawing
    const mpp = 1 / k;
    const islA = Math.min(1, Math.max(0, (400 - mpp) / 250));
    const berA = Math.min(1, Math.max(0, (3500 - mpp) / 2000));
    // draw coarse → fine; skip a coarse plate when a finer one covers the whole plane
    const coverI = islA >= 1 && (() => {
      const m = ISLANDS.feather * (ISLANDS.x1 - ISLANDS.x0) * 1.05;
      return cam.x - PLANE.ox / k > ISLANDS.x0 + m && cam.x + (PLANE.w - PLANE.ox) / k < ISLANDS.x1 - m &&
        cam.y + PLANE.oy / k < ISLANDS.y1 - m && cam.y - (PLANE.h - PLANE.oy) / k > ISLANDS.y0 + m;
    })();
    const coverB = berA >= 1 && (() => {
      const m = BERING.feather * (BERING.x1 - BERING.x0) * 1.05;
      return cam.x - PLANE.ox / k > BERING.x0 + m && cam.x + (PLANE.w - PLANE.ox) / k < BERING.x1 - m &&
        cam.y + PLANE.oy / k < BERING.y1 - m && cam.y - (PLANE.h - PLANE.oy) / k > BERING.y0 + m;
    })();
    if (!coverB && !coverI) draw(ctx, mpp > 4000 ? half : world, WORLD, cam, 1);
    if (!coverI) draw(ctx, bering, BERING, cam, berA);
    draw(ctx, islands, ISLANDS, cam, islA);
  }, [cam, srcs]);

  return (
    <canvas ref={ref} width={PLANE.w} height={PLANE.h}
      style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h, ...style }} />
  );
};
