import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { Cam, GEO, PLANE, pxPerM } from './cam';

type Plate = { src: string; x0: number; y0: number; x1: number; y1: number; feather: number; full: number; none: number };
const mk = (name: string, feather: number, full: number, none: number): Plate => {
  const b = GEO.plates[name].bounds;
  return { src: `ukweather/maps/${name}_geo.jpg`, x0: b[0], y0: b[1], x1: b[2], y1: b[3], feather, full, none };
};
// The GeoLayers-style plates (EOX satellite + terrain/bathymetry hillshade + grade), coarse → fine: the world z4, the
// Atlantic and South America z6, the British Isles and Colombia z8, England z9.
const GEOS = [
  mk('world', 0.0, 1e9, 2e9),
  mk('atlantic', 0.02, 6000, 12000),
  mk('samerica', 0.02, 6000, 12000),
  mk('isles', 0.03, 1500, 3000),
  mk('colombia', 0.03, 1500, 3000),
  mk('england', 0.03, 600, 1200),
];
export type Look = 'geo';
const STACK: Record<Look, Plate[]> = { geo: GEOS };
const BG: Record<Look, string> = { geo: '#0a2238' };
export const SEA_BG = '#0a2238';

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

/** Paints the coarse-to-fine plate stack for a camera into a context already set to plane coordinates.
 *  The coarsest is skipped once a finer plate fully covers the screen. */
export const paintPlates = (ctx: CanvasRenderingContext2D, srcs: Source[], cam: Cam, res: number, PLATES: Plate[] = SAT) => {
  const mpp = cam.span / 1920 / res;
  const a = PLATES.map((p, i) => (i === 0 ? 1 : fade(mpp, p.full, p.none)));
  let start = 0;
  for (let i = PLATES.length - 1; i > 0; i--) if (a[i] >= 1 && covers(PLATES[i], cam)) { start = i; break; }
  for (let i = start; i < PLATES.length; i++) draw(ctx, srcs[i], PLATES[i], cam, i === start ? 1 : a[i]);
};

/** The loaded plates (shared by the map and the 3D cut-outs). */
export const usePlates = (label: string, PLATES: Plate[] = SAT) => {
  const [srcs, setSrcs] = useState<Source[] | null>(null);
  const [handle] = useState(() => delayRender(label));
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
  }, [handle, PLATES]);
  return srcs;
};
export type { Source };

/** res: canvas pixels per CSS pixel. */
export const MapCanvas: React.FC<{ cam: Cam; res?: number; look?: Look }> = (p) => <StackCanvas key={p.look ?? 'geo'} {...p} />;
const StackCanvas: React.FC<{ cam: Cam; res?: number; look?: Look }> = ({ cam, res = 1, look = 'geo' }) => {
  const vintage = true; // the plates are already graded: no sea lift
  const ref = useRef<HTMLCanvasElement>(null);
  const stack = STACK[look];
  const srcs = usePlates(`wk ${look}`, stack);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !srcs) return;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(res, 0, 0, res, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, PLANE.w, PLANE.h);
    // the world sheet: sea colour inside the world plate only, with a soft shadow under it (the backdrop shows outside)
    const wp = stack[0], k = pxPerM(cam);
    const sx = PLANE.ox + (wp.x0 - cam.x) * k, sy = PLANE.oy + (cam.y - wp.y1) * k, sw = (wp.x1 - wp.x0) * k, sh = (wp.y1 - wp.y0) * k;
    ctx.save();
    ctx.shadowColor = 'rgba(8,20,70,0.55)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 24;
    ctx.fillStyle = BG[look];
    ctx.fillRect(sx, sy, sw, sh);
    ctx.restore();
    paintPlates(ctx, srcs, cam, res, stack);
    if (!vintage) {
      // lift the near-black Sentinel-2 sea to a deep teal (anything brighter, i.e. land, is untouched)
      ctx.globalCompositeOperation = 'lighten';
      ctx.fillStyle = '#0f4256';
      ctx.fillRect(sx, sy, sw, sh);
      ctx.globalCompositeOperation = 'source-over';
    }
  }, [cam, srcs, res, vintage, stack, look]);

  return <canvas ref={ref} width={PLANE.w * res} height={PLANE.h * res} style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h }} />;
};
