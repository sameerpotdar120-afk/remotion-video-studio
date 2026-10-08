import raw from './geo.json';

/** Geo data prepared by build_geo.py. Paths use x = lon, y = -lat. */
export type LonLat = [number, number];
type Ring = LonLat[];

export type GeoData = {
  region: string;
  regionCenter: LonLat;
  regionBounds: [number, number, number, number];
  panama: string;
  colombia: string;
  north: string;
  south: string;
  hwNorth: string;
  hwSouth: string;
  hwGap: [LonLat, LonLat];
  arrow: [LonLat, LonLat];
  arrowAngle: number;
  routesSouth: string[];
  routeCross: string;
  routesNorth: string[];
  dots: { x0: number; y0: number; x1: number; y1: number; dies: boolean; delay: number }[];
  danger: { x: number; y: number; r: number }[];
  trees: { x: number; y: number; k: number; s: number }[];
  panamaLabel: LonLat;
  colombiaLabel: LonLat;
};

export const GEO = raw as unknown as GeoData;

/** Parse "M..L..Z" path data into rings of [lon, lat]. */
export const parseRings = (d: string): Ring[] => {
  const rings: Ring[] = [];
  for (const part of d.split('M')) {
    if (!part) continue;
    const ring: Ring = [];
    for (const pt of part.replace(/Z/g, '').split('L')) {
      const [x, y] = pt.split(',').map(Number);
      if (Number.isFinite(x) && Number.isFinite(y)) ring.push([x, -y]);
    }
    if (ring.length) rings.push(ring);
  }
  return rings;
};

export const RINGS = {
  // exterior only: the gulfs are stored as holes and read as dark blobs on screen
  region: parseRings(GEO.region).slice(0, 1),
  panama: parseRings(GEO.panama),
  colombia: parseRings(GEO.colombia),
  north: parseRings(GEO.north),
  south: parseRings(GEO.south),
};

export const LINES = {
  hwNorth: parseRings(GEO.hwNorth)[0],
  hwSouth: parseRings(GEO.hwSouth)[0],
  routesSouth: GEO.routesSouth.map((d) => parseRings(d)[0]),
  routeCross: parseRings(GEO.routeCross)[0],
  routesNorth: GEO.routesNorth.map((d) => parseRings(d)[0]),
};

/** Cumulative-length helper for drawing a polyline on progressively. */
export const measure = (pts: Ring) => {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return cum;
};

export const slice = (pts: Ring, cum: number[], p: number): Ring => {
  if (p <= 0) return [];
  const target = cum[cum.length - 1] * Math.min(1, p);
  const out: Ring = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (cum[i] <= target) {
      out.push(pts[i]);
      continue;
    }
    const seg = cum[i] - cum[i - 1] || 1;
    const k = (target - cum[i - 1]) / seg;
    out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]);
    break;
  }
  return out;
};
