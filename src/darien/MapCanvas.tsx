import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { Cam, PLANE, ppdOf } from './camera';

type Plate = {
  src: string;
  west: number;
  east: number;
  north: number;
  south: number;
  feather?: number; // fraction of each edge faded out
};

const AMERICAS: Plate = { src: 'darien/maps/map_americas.jpg', west: -180, east: -30, north: 84, south: -60 };
const AMERICAS_HALF: Plate = { ...AMERICAS, src: 'darien/maps/map_americas_half.jpg' };
const DARIEN: Plate = { src: 'darien/maps/map_darien.jpg', west: -84.5, east: -75.5, north: 11, south: 3, feather: 0.07 };

type Source = HTMLImageElement | HTMLCanvasElement;
const cache = new Map<string, Promise<Source>>();

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = staticFile(src);
  });

/** Bake a feathered alpha edge into the plate so it melts into the continent plate. */
const feathered = async (p: Plate): Promise<Source> => {
  const img = await loadImage(p.src);
  if (!p.feather) return img;
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  const f = p.feather;
  const gx = ctx.createLinearGradient(0, 0, c.width, 0);
  gx.addColorStop(0, 'rgba(0,0,0,0)');
  gx.addColorStop(f, 'rgba(0,0,0,1)');
  gx.addColorStop(1 - f, 'rgba(0,0,0,1)');
  gx.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, c.width, c.height);
  const gy = ctx.createLinearGradient(0, 0, 0, c.height);
  gy.addColorStop(0, 'rgba(0,0,0,0)');
  gy.addColorStop(f, 'rgba(0,0,0,1)');
  gy.addColorStop(1 - f, 'rgba(0,0,0,1)');
  gy.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
};

const get = (p: Plate) => {
  if (!cache.has(p.src)) cache.set(p.src, feathered(p));
  return cache.get(p.src)!;
};

const drawPlate = (ctx: CanvasRenderingContext2D, src: Source, p: Plate, cam: Cam, alpha: number) => {
  if (alpha <= 0.001) return;
  const k = ppdOf(cam);
  // visible lon/lat box of the plane
  const vW = cam.lon - PLANE.ox / k;
  const vE = cam.lon + (PLANE.w - PLANE.ox) / k;
  const vN = cam.lat + PLANE.oy / k;
  const vS = cam.lat - (PLANE.h - PLANE.oy) / k;
  const w = Math.max(vW, p.west);
  const e = Math.min(vE, p.east);
  const n = Math.min(vN, p.north);
  const s = Math.max(vS, p.south);
  if (e <= w || n <= s) return;
  const iw = src.width;
  const ih = src.height;
  const sx = ((w - p.west) / (p.east - p.west)) * iw;
  const sy = ((p.north - n) / (p.north - p.south)) * ih;
  const sw = ((e - w) / (p.east - p.west)) * iw;
  const sh = ((n - s) / (p.north - p.south)) * ih;
  const dx = PLANE.ox + (w - cam.lon) * k;
  const dy = PLANE.oy + (cam.lat - n) * k;
  ctx.globalAlpha = alpha;
  ctx.drawImage(src, sx, sy, sw, sh, dx, dy, (e - w) * k, (n - s) * k);
  ctx.globalAlpha = 1;
};

export const MapCanvas: React.FC<{ cam: Cam; style?: React.CSSProperties }> = ({ cam, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [srcs, setSrcs] = useState<Source[] | null>(null);
  const [handle] = useState(() => delayRender('map plates'));

  useEffect(() => {
    Promise.all([get(AMERICAS), get(AMERICAS_HALF), get(DARIEN)])
      .then((s) => {
        setSrcs(s);
        continueRender(handle);
      })
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle]);

  useLayoutEffect(() => {
    const c = ref.current;
    if (!c || !srcs) return;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#06152b';
    ctx.fillRect(0, 0, c.width, c.height);
    const k = ppdOf(cam);
    const [full, half, darien] = srcs;
    const useHalf = k < 32;
    const darienAlpha = Math.min(1, Math.max(0, (k - 26) / 30));
    const darienCovers =
      darienAlpha >= 1 &&
      cam.lon - PLANE.ox / k > DARIEN.west + 0.8 &&
      cam.lon + (PLANE.w - PLANE.ox) / k < DARIEN.east - 0.8 &&
      cam.lat + PLANE.oy / k < DARIEN.north - 0.7 &&
      cam.lat - (PLANE.h - PLANE.oy) / k > DARIEN.south + 0.7;
    if (!darienCovers) drawPlate(ctx, useHalf ? half : full, AMERICAS, cam, 1);
    drawPlate(ctx, darien, DARIEN, cam, darienAlpha);
  }, [cam, srcs]);

  return (
    <canvas
      ref={ref}
      width={PLANE.w}
      height={PLANE.h}
      style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h, ...style }}
    />
  );
};
