import { geoEquirectangular, geoPath, type GeoProjection } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * ONE projection for everything = perfect alignment.
 * Equirectangular (plate carrée) at 240 px per degree — the same grid as NASA's
 * Blue Marble 21600×21600 tiles (90° per tile) and Natural Earth's 21600×10800 rasters.
 * Any raster in plate carrée can be placed exactly by its lon/lat bounds, and every
 * vector path, pin, label and character uses the same lon/lat → px function.
 */
export const PX_PER_DEG = 240;
export const WORLD_W = 360 * PX_PER_DEG; // 86 400 px
export const WORLD_H = 180 * PX_PER_DEG; // 43 200 px

export const projection: GeoProjection = geoEquirectangular()
  .scale(WORLD_W / (2 * Math.PI))
  .translate([WORLD_W / 2, WORLD_H / 2])
  .precision(0.1);

export const pathGen = geoPath(projection);

/** lon/lat → world px. */
export const project = (lon: number, lat: number): [number, number] => [
  (lon + 180) * PX_PER_DEG,
  (90 - lat) * PX_PER_DEG,
];

/** world px → lon/lat */
export const unproject = (x: number, y: number): [number, number] => [x / PX_PER_DEG - 180, 90 - y / PX_PER_DEG];

export const featurePath = (f: Feature<Geometry> | Geometry) => pathGen(f as never) ?? '';

export const byId = (fc: FeatureCollection, id: string) => {
  const f = fc.features.find((x) => x.properties?.id === id || x.properties?.name === id || String(x.id) === id);
  if (!f) throw new Error(`Feature ${id} not found`);
  return f;
};

/** Centroid in lon/lat — use to place faces, labels and pins on a region. */
export const centroidLonLat = (f: Feature<Geometry>): [number, number] => {
  const [x, y] = pathGen.centroid(f as never);
  return unproject(x, y);
};

/** Bounds in lon/lat: [[west, south], [east, north]] */
export const boundsLonLat = (f: Feature<Geometry>): [[number, number], [number, number]] => {
  const [[x0, y0], [x1, y1]] = pathGen.bounds(f as never);
  const [w, n] = unproject(x0, y0);
  const [e, s] = unproject(x1, y1);
  return [[w, s], [e, n]];
};
