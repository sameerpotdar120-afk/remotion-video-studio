import React, { useLayoutEffect, useRef } from 'react';
import { Cam, PLANE, P, project } from './cam';
import { paintPlates, usePlates } from './Map';
import { Region } from './Plane';

/** Regions lifted out of the satellite map as 3D slabs, the After Effects way: the map around them dims, a soft shadow
 *  falls down-right, extruded side walls in the region's colour, the real satellite texture on the raised top with a
 *  colour grade and a light sheen, and a bevelled, glowing rim. The slab rises with a small overshoot. */

/** Inside which region a smaller one sits, so it rises from its parent's top instead of the ground. */
const PARENT: Record<string, string> = { westbengal: 'india', shobhabazar: 'sutanuti', chitpur: 'sutanuti', maidan: 'gobindapur', central: 'kalikata', highcourt: 'kalikata' };

const backOut = (x: number) => {
  const s = 1.9;
  const u = x - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
};
const hex = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mix = (a: [number, number, number], b: [number, number, number], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k)) as [number, number, number];
const rgb = (c: [number, number, number], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const EARTH: [number, number, number] = [26, 18, 12];

const pathOf = (c: Cam, rings: P[][]) => {
  const p = new Path2D();
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const r of rings) {
    r.forEach((pt, i) => {
      const [x, y] = project(c, pt[0], pt[1]);
      if (i) p.lineTo(x, y);
      else p.moveTo(x, y);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    });
    p.closePath();
  }
  return { p, w: x1 - x0, h: y1 - y0, top: y0, bottom: y1 };
};

export const Cutouts: React.FC<{ cam: Cam; t: number; regions: Region[]; res?: number }> = ({ cam, t, regions, res = 1 }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const srcs = usePlates('kolkata cut-out plates');
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !srcs) return;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(res, 0, 0, res, 0, 0);
    ctx.clearRect(0, 0, PLANE.w, PLANE.h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const live = regions.filter((r) => r.a > 0.002);
    if (!live.length) return;
    // the world around the slabs steps back
    const dim = Math.max(...live.map((r) => r.a));
    ctx.fillStyle = `rgba(4,8,16,${0.42 * dim})`;
    ctx.fillRect(0, 0, PLANE.w, PLANE.h);
    const tops: Record<string, number> = {};
    for (const r of live) {
      const g = pathOf(cam, r.rings);
      const size = Math.min(g.w, g.h);
      if (size < 4) continue;
      const lift = backOut(Math.min(1, r.a));
      const H = Math.max(16, Math.min(72, size * 0.07)) * lift;
      const z0 = PARENT[r.key] && tops[PARENT[r.key]] ? tops[PARENT[r.key]] : 0;
      tops[r.key] = z0 + H;
      const col = hex(r.color);
      const a = Math.min(1, r.a * 1.4);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(0, -z0);
      // contact shadow, falling down-right (light from the upper left)
      ctx.save();
      ctx.filter = `blur(${Math.max(6, H * 0.7)}px)`;
      ctx.translate(H * 0.55, H * 0.35);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fill(g.p);
      ctx.restore();
      // extruded walls: darker at the foot, lit near the top lip
      const steps = Math.ceil(H);
      const foot = mix(EARTH, col, 0.25), lip = mix(EARTH, col, 0.75);
      for (let i = 0; i <= steps; i++) {
        const k = i / Math.max(1, steps);
        ctx.save();
        ctx.translate(0, -i * (H / Math.max(1, steps)));
        ctx.fillStyle = rgb(mix(foot, lip, k * k));
        ctx.fill(g.p);
        ctx.restore();
      }
      // the raised top: the real satellite texture, lifted with the slab
      ctx.save();
      ctx.translate(0, -H);
      ctx.clip(g.p);
      paintPlates(ctx, srcs, cam, res);
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = rgb(col, 0.25 + r.fill * 1.4);
      ctx.fill(g.p);
      ctx.globalCompositeOperation = 'screen';
      const sweep = ((t + r.phase) * 0.18) % 1.6 - 0.3;
      const gy = g.top - H, gh = g.bottom - g.top;
      const sh = ctx.createLinearGradient(0, gy + gh * (sweep - 0.25), 0, gy + gh * (sweep + 0.25));
      sh.addColorStop(0, 'rgba(255,255,255,0)');
      sh.addColorStop(0.5, 'rgba(255,240,210,0.16)');
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sh;
      ctx.fill(g.p);
      ctx.globalCompositeOperation = 'source-over';
      // inner bevel: a light lip on the upper-left edge, a shade on the lower-right
      ctx.lineJoin = 'round';
      ctx.save();
      ctx.translate(-1.5, -1.5);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 7;
      ctx.stroke(g.p);
      ctx.restore();
      ctx.save();
      ctx.translate(2, 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 7;
      ctx.stroke(g.p);
      ctx.restore();
      ctx.restore();
      // the rim: a glow in the region's colour and a hot white line
      ctx.save();
      ctx.translate(0, -H);
      ctx.lineJoin = 'round';
      ctx.shadowColor = rgb(col);
      ctx.shadowBlur = 22;
      ctx.strokeStyle = rgb(mix(col, [255, 255, 255], 0.35), 0.9);
      ctx.lineWidth = 5;
      ctx.stroke(g.p);
      ctx.shadowBlur = 8;
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = 2.2;
      ctx.stroke(g.p);
      ctx.restore();
      ctx.restore();
    }
  }, [cam, t, regions, srcs, res]);
  return (
    <canvas ref={ref} width={PLANE.w * res} height={PLANE.h * res}
      style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h, filter: 'saturate(1.2) contrast(1.16) brightness(1.02)' }} />
  );
};
