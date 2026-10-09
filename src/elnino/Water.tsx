import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { Cam, P, PLANE, merc, project, pxPerM } from './cam';

/**
 * Glowing water masses and wind, drawn on the map plane (they tilt with it).
 * A water mass is a soft "tube" along a spine of (lon, lat, width km) points, grown from its head, then broken up by two
 * fractal-noise textures drifting in the flow direction (AE's Turbulent Displace + Fractal Noise look), with a hot core.
 */
export type Mass = {
  id: string;
  spine: [number, number, number][]; // lon, lat, half-width in km
  color: string;
  core: string;
  a: number; // opacity
  grow: number; // 0..1: how much of the spine is drawn (from the first point)
  tail?: number; // 0..1: how much has drained away from the first point
  flow: number; // noise drift direction along x (+1 east, -1 west)
  t: number;
};

const H = 0.5; // the masses render at half resolution; they are soft anyway
let noiseA: HTMLImageElement | null = null;
let noiseB: HTMLImageElement | null = null;
const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = staticFile(src);
  });
let ready: Promise<void> | null = null;
const loadNoise = () =>
  (ready ??= Promise.all([loadImg('elnino/fx/noise_a.png'), loadImg('elnino/fx/noise_b.png')]).then(([a, b]) => {
    noiseA = a;
    noiseB = b;
  }));

/** Noise image → canvas with alpha = brightness (contrast-shaped), for destination-in. */
const alphaNoise = (img: HTMLImageElement, lo: number, hi: number) => {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const x = c.getContext('2d')!;
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.min(1, Math.max(0, (d.data[i] / 255 - lo) / (hi - lo)));
    d.data[i + 3] = Math.round(255 * v);
    d.data[i] = d.data[i + 1] = d.data[i + 2] = 255;
  }
  x.putImageData(d, 0, 0);
  return c;
};
let nA: HTMLCanvasElement | null = null;
let nB: HTMLCanvasElement | null = null;

const spinePx = (c: Cam, m: Mass) => {
  const k = pxPerM(c) * H;
  return m.spine.map(([lon, lat, km]) => {
    const [x, y] = project(c, ...merc(lon, lat));
    // km → Mercator metres at this latitude
    const w = (km * 1000 * k) / Math.cos((lat * Math.PI) / 180);
    return [x * H, y * H, w] as [number, number, number];
  });
};

/** Points of the spine between fractions a..b of its length (linear along the polyline). */
const cut = (pts: [number, number, number][], a: number, b: number) => {
  const seg: number[] = [];
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d);
    L += d;
  }
  const at = (f: number) => {
    let s = f * L;
    for (let i = 0; i < seg.length; i++) {
      if (s <= seg[i] || i === seg.length - 1) {
        const q = seg[i] ? Math.min(1, s / seg[i]) : 0;
        const p0 = pts[i];
        const p1 = pts[i + 1];
        return [p0[0] + (p1[0] - p0[0]) * q, p0[1] + (p1[1] - p0[1]) * q, p0[2] + (p1[2] - p0[2]) * q] as [number, number, number];
      }
      s -= seg[i];
    }
    return pts[pts.length - 1];
  };
  const out: [number, number, number][] = [];
  const n = 40;
  for (let i = 0; i <= n; i++) out.push(at(a + ((b - a) * i) / n));
  return out;
};

const tube = (ctx: CanvasRenderingContext2D, pts: [number, number, number][], scale: number) => {
  // a chain of overlapping discs gives a smooth, variable-width body with rounded ends
  for (let i = 0; i < pts.length; i++) {
    const [x, y, w] = pts[i];
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1, w * scale), 0, Math.PI * 2);
    ctx.fill();
  }
};

export const WaterCanvas: React.FC<{ cam: Cam; masses: Mass[] }> = ({ cam, masses }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const work = useRef<HTMLCanvasElement | null>(null);
  const [ok, setOk] = useState(!!noiseA);
  const [handle] = useState(() => (noiseA ? null : delayRender('noise')));
  useEffect(() => {
    if (ok) return;
    loadNoise().then(() => {
      setOk(true);
      if (handle !== null) continueRender(handle);
    });
  }, [ok, handle]);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !ok || !noiseA || !noiseB) return;
    nA ??= alphaNoise(noiseA, 0.18, 0.75);
    nB ??= alphaNoise(noiseB, 0.3, 0.9);
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (!work.current) {
      work.current = document.createElement('canvas');
      work.current.width = cv.width;
      work.current.height = cv.height;
    }
    const w = work.current.getContext('2d')!;
    for (const m of masses) {
      if (m.a <= 0.001 || m.grow <= 0.001) continue;
      const pts = cut(spinePx(cam, m), m.tail ?? 0, m.grow);
      const meanW = pts.reduce((s, p) => s + p[2], 0) / pts.length;
      // 1) soft body
      w.globalCompositeOperation = 'source-over';
      w.clearRect(0, 0, cv.width, cv.height);
      w.filter = `blur(${(meanW * 0.55).toFixed(1)}px)`;
      w.fillStyle = m.color;
      tube(w, pts, 0.85);
      w.filter = 'none';
      // 2) break it up with drifting fractal noise (scale follows the zoom so the texture sticks to the ocean)
      const sc = Math.max(0.6, Math.min(3, meanW / 90));
      const drift = m.t * 22 * m.flow;
      w.globalCompositeOperation = 'destination-in';
      const pa = w.createPattern(nA, 'repeat')!;
      pa.setTransform(new DOMMatrix().translateSelf(drift, m.t * 4).scaleSelf(sc, sc * 0.7));
      w.fillStyle = pa;
      w.fillRect(0, 0, cv.width, cv.height);
      ctx.globalAlpha = m.a * 0.95;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(work.current, 0, 0);
      // 3) wide outer bloom
      w.globalCompositeOperation = 'source-over';
      w.clearRect(0, 0, cv.width, cv.height);
      w.filter = `blur(${(meanW * 1.1).toFixed(1)}px)`;
      w.fillStyle = m.color;
      tube(w, pts, 1.15);
      w.filter = 'none';
      ctx.globalAlpha = m.a * 0.42;
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(work.current, 0, 0);
      // 4) hot core with a second, finer noise drifting faster
      w.clearRect(0, 0, cv.width, cv.height);
      w.filter = `blur(${(meanW * 0.35).toFixed(1)}px)`;
      w.fillStyle = m.core;
      tube(w, pts, 0.42);
      w.filter = 'none';
      w.globalCompositeOperation = 'destination-in';
      const pb = w.createPattern(nB, 'repeat')!;
      pb.setTransform(new DOMMatrix().translateSelf(drift * 1.8, -m.t * 6).scaleSelf(sc * 0.8, sc * 0.55));
      w.fillStyle = pb;
      w.fillRect(0, 0, cv.width, cv.height);
      ctx.globalAlpha = m.a * 0.7;
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(work.current, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }, [cam, masses, ok]);

  return (
    <canvas ref={ref} width={PLANE.w * H} height={PLANE.h * H}
      style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h }} />
  );
};

// ---------------------------------------------------------------- trade winds
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Wind streaks blowing east → west across the tropical Pacific: each streak is a tapered, fading trail riding a gently
 * wavy lane. `a` fades them, `n` thins them (0..1 of the full count), `speed` scales their speed (weakening winds).
 */
export const WindCanvas: React.FC<{ cam: Cam; t: number; a: number; n?: number; speed?: number; lon0?: number; lon1?: number }> = ({
  cam, t, a, n = 1, speed = 1, lon0 = 105, lon1 = 285,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (a <= 0.001) return;
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const N = 90;
    const span = lon1 - lon0;
    for (let i = 0; i < N; i++) {
      if (rnd(i, 1) > n) continue;
      const lat = -16 + 34 * rnd(i, 2);
      const v = (14 + 10 * rnd(i, 3)) * speed; // degrees of longitude per second
      const len = 9 + 14 * rnd(i, 4); // trail length, degrees
      const ph = rnd(i, 5) * span;
      // each streak travels west and wraps; it fades in/out near the ends of its lane
      const head = lon1 - ((ph + t * v) % (span + len));
      const life = Math.min(1, (lon1 - head) / 12, (head - lon0 + len) / 12);
      if (life <= 0) continue;
      const wav = rnd(i, 6) * 6.28;
      const pts: P[] = [];
      const M = 16;
      for (let j = 0; j <= M; j++) {
        const lon = head + (len * j) / M;
        const la = lat + 1.6 * Math.sin(lon * 0.045 + wav) + 0.8 * Math.sin(lon * 0.11 + wav * 2);
        const [x, y] = project(cam, ...merc(lon > 340 ? lon - 360 : lon, la));
        pts.push([x * H, y * H]);
      }
      const wpx = Math.max(0.8, Math.min(3.2, (pxPerM(cam) * 2.2e4) * H));
      for (let j = 0; j < M; j++) {
        const f = 1 - j / M; // 1 at the head
        ctx.strokeStyle = `rgba(255,255,255,${(a * life * 0.85 * f * f).toFixed(3)})`;
        ctx.lineWidth = wpx * (0.35 + 0.65 * f);
        ctx.beginPath();
        ctx.moveTo(pts[j][0], pts[j][1]);
        ctx.lineTo(pts[j + 1][0], pts[j + 1][1]);
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }, [cam, t, a, n, speed, lon0, lon1]);
  return (
    <canvas ref={ref} width={PLANE.w * H} height={PLANE.h * H}
      style={{ position: 'absolute', left: 0, top: 0, width: PLANE.w, height: PLANE.h, filter: 'drop-shadow(0 0 3px rgba(190,240,255,0.7))' }} />
  );
};
