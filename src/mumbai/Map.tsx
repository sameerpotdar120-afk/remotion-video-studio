import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { Cam, GEO, P, PLANE, project, pxPerM } from './cam';

type Plate = { src: string; x0: number; y0: number; x1: number; y1: number; feather: number };
const mk = (src: string, b: [number, number, number, number], feather: number): Plate => ({ src, x0: b[0], y0: b[1], x1: b[2], y1: b[3], feather });
const SAT_IN = mk('mumbai/maps/india_sat.jpg', GEO.india.bounds, 0.05);
const SAT_KO = mk('mumbai/maps/konkan_sat.jpg', GEO.konkan.bounds, 0.08);
const SAT_MU = mk('mumbai/maps/mumbai_sat.jpg', GEO.mumbai.bounds, 0.07);
const CH_WO = mk('mumbai/maps/world_chart.jpg', GEO.world_chart.bounds, 0.03);
const CH_KO = mk('mumbai/maps/konkan_chart.jpg', GEO.konkan_chart.bounds, 0.08);
const CH_MU = mk('mumbai/maps/mumbai_chart_sea.jpg', GEO.mumbai.bounds, 0.07);
const CH_LAND = mk('mumbai/maps/mumbai_chart_land.jpg', GEO.mumbai.bounds, 0);
const PLATES = [SAT_IN, SAT_KO, SAT_MU, CH_WO, CH_KO, CH_MU, CH_LAND];
export const SEA_BG = '#628f8b';

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
const view = (c: Cam, margin = 1.1) => {
  const k = pxPerM(c);
  const hw = (540 * margin) / k;
  const hh = (960 * margin) / k;
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

/** A patch of live land: rings, optionally limited to the union of growing circles, or to east of a flood front. */
export type LandDraw = { rings: P[][]; a: number; circles?: { at: P; r: number }[]; eastOf?: number };

const ringsPath = (c: Cam, rings: P[][]) => {
  const p = new Path2D();
  for (const r of rings) {
    r.forEach((pt, i) => {
      const [x, y] = project(c, pt[0], pt[1]);
      if (i) p.lineTo(x, y);
      else p.moveTo(x, y);
    });
    p.closePath();
  }
  return p;
};

/** Coarse-to-fine stack: the coarsest is skipped once a finer plate fully covers the screen. */
const stack = (ctx: CanvasRenderingContext2D, c: Cam, layers: [Source, Plate, number][], alpha: number) => {
  let start = 0;
  for (let i = layers.length - 1; i > 0; i--) if (layers[i][2] >= 1 && covers(layers[i][1], c)) { start = i; break; }
  for (let i = start; i < layers.length; i++) draw(ctx, layers[i][0], layers[i][1], c, (i === start ? 1 : layers[i][2]) * alpha);
};

/**
 * The map: nautical-chart plates (the islands' land drawn live from the land paper through a clip), with the
 * Sentinel-2 satellite plates cross-faded on top by `sat` (0..1).
 */
export const MapCanvas: React.FC<{ cam: Cam; sat: number; land: LandDraw[] }> = ({ cam, sat, land }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [srcs, setSrcs] = useState<Source[] | null>(null);
  const [handle] = useState(() => delayRender('mumbai plates'));
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
    const [sIn, sKo, sMu, cWo, cKo, cMu, cLand] = srcs;
    const mpp = cam.span / 1920;
    const koA = fade(mpp, 260, 700);
    const muA = fade(mpp, 26, 60);
    ctx.fillStyle = SEA_BG;
    ctx.fillRect(0, 0, cv.width, cv.height);
    if (sat < 0.999) {
      stack(ctx, cam, [[cWo, CH_WO, 1], [cKo, CH_KO, koA], [cMu, CH_MU, muA]], 1);
      // live land (the island city as it is in the story at this moment)
      for (const l of land) {
        if (l.a <= 0.001 || !l.rings.length) continue;
        ctx.save();
        ctx.clip(ringsPath(cam, l.rings));
        if (l.circles) {
          const p = new Path2D();
          for (const ci of l.circles) {
            if (ci.r <= 0) continue;
            const [x, y] = project(cam, ci.at[0], ci.at[1]);
            p.moveTo(x + ci.r * pxPerM(cam), y);
            p.arc(x, y, ci.r * pxPerM(cam), 0, Math.PI * 2);
          }
          ctx.clip(p);
        }
        if (l.eastOf !== undefined) {
          const [fx] = project(cam, l.eastOf, cam.y);
          ctx.beginPath();
          ctx.rect(fx, -10, cv.width - fx + 20, cv.height + 20);
          ctx.clip();
        }
        draw(ctx, cLand, CH_LAND, cam, l.a);
        ctx.restore();
      }
    }
    if (sat > 0.001) {
      ctx.save();
      if (sat < 0.999) ctx.globalAlpha = 1;
      const a = sat;
      // keep the satellite opaque against the chart: draw its own stack with the overall alpha
      const tmpAlpha = (x: number) => x * a;
      const layers: [Source, Plate, number][] = [[sIn, SAT_IN, 1], [sKo, SAT_KO, fade(mpp, 200, 600)], [sMu, SAT_MU, fade(mpp, 22, 55)]];
      let start = 0;
      for (let i = layers.length - 1; i > 0; i--) if (layers[i][2] >= 1 && covers(layers[i][1], cam)) { start = i; break; }
      for (let i = start; i < layers.length; i++) draw(ctx, layers[i][0], layers[i][1], cam, tmpAlpha(i === start ? 1 : layers[i][2]));
      ctx.restore();
    }
  }, [cam, srcs, sat, land]);

  return <canvas ref={ref} width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h }} />;
};
