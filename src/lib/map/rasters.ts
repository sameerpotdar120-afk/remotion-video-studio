import { staticFile } from 'remotion';
import REGIONS from '../../../public/assets/maps_raster/regions.json';

/**
 * Terrain rasters built from open data (public/assets/maps_raster/SOURCES.md).
 * Every raster is plate carrée, placed by its lon/lat bounds — the same grid as src/lib/map/geo.ts.
 */
export type RasterRegion = keyof typeof REGIONS;
export type MapLook = 'parchment' | 'relief' | 'flat';

export const region = (r: RasterRegion) => {
  const g = REGIONS[r];
  return {
    west: g.west,
    south: g.south,
    east: g.east,
    north: g.north,
    look: (look: MapLook) => staticFile(`assets/maps_raster/look_${look}_${r}.jpg`),
    height: staticFile(`assets/maps_raster/${g.heightmap.file}`),
    hillshade: staticFile(`assets/maps_raster/hillshade_${r}.jpg`),
    oceanDepth: staticFile(`assets/maps_raster/oceandepth_${r}.jpg`),
    landMask: staticFile(`assets/maps_raster/landmask_${r}.png`),
    metresAtWhite: g.heightmap.metresAtWhite,
  };
};
