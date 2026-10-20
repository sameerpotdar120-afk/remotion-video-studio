import type { Feature, FeatureCollection, Geometry } from 'geojson';
import coloniesJson from '../../../public/maps/colonies-1775.json';
import vermontJson from '../../../public/maps/vermont-disputed.json';
import landJson from '../../../public/maps/land-50m.geo.json';
import countriesJson from '../../../public/maps/countries-50m.geo.json';

/**
 * Sources (all public domain):
 *  - colonies-1775.json   ← US Census Bureau 2017 state boundaries (us-atlas 3.0.1),
 *                           Maine merged into Massachusetts, West Virginia into Virginia.
 *  - vermont-disputed.json← Vermont, claimed by both New York and New Hampshire in 1775.
 *  - land/countries-50m   ← Natural Earth 1:50m (world-atlas 2.0.2). MODERN borders:
 *                           use them for coastlines only; never show modern borders as 1763 borders.
 * Rebuild with: node scripts/build_colonies.mjs <us-atlas>/states-10m.json <world-atlas> public/maps
 */
export const colonies = coloniesJson as unknown as FeatureCollection;
export const vermont = vermontJson as unknown as Feature<Geometry>;
export const land = landJson as unknown as FeatureCollection;
export const countries = countriesJson as unknown as FeatureCollection;

export const COLONY_IDS = colonies.features
  .slice()
  .sort((a, b) => (a.properties?.order ?? 0) - (b.properties?.order ?? 0))
  .map((f) => f.properties?.id as string);

export const country = (name: string) => {
  const f = countries.features.find((x) => x.properties?.name === name);
  if (!f) throw new Error(`Country ${name} not in Natural Earth 50m`);
  return f;
};

/**
 * Key places (lon, lat). Verified against modern coordinates of the historic sites.
 */
export const PLACES = {
  boston: [-71.0589, 42.3601],
  lexington: [-71.2295, 42.4473],
  concord: [-71.3489, 42.4604],
  bunkerHill: [-71.0608, 42.3763],
  newYork: [-74.006, 40.7128],
  philadelphia: [-75.1652, 39.9526],
  jumonvilleGlen: [-79.6489, 39.8806],
  monticello: [-78.4528, 38.0086],
  london: [-0.1276, 51.5072],
  paris: [2.3522, 48.8566],
} as const satisfies Record<string, readonly [number, number]>;

/**
 * Royal Proclamation Line of 7 Oct 1763 — APPROXIMATE trace along the Appalachian
 * watershed, north → south. Before publishing, check it against a georeferenced copy of
 * the 1763 proclamation map (Library of Congress, public domain) and adjust these points.
 */
export const PROCLAMATION_LINE: [number, number][] = [
  [-71.5, 45.0],
  [-73.4, 44.6],
  [-74.7, 43.6],
  [-75.6, 42.6],
  [-77.6, 42.0],
  [-78.8, 41.0],
  [-79.2, 39.7],
  [-79.9, 38.8],
  [-80.7, 37.5],
  [-81.6, 36.6],
  [-82.6, 35.6],
  [-83.6, 34.9],
  [-84.3, 34.1],
  [-84.9, 31.0],
];
