# Map rasters — sources, licences, how they were made

Everything in this folder was built from **open map data only**: no imagery from Google, Apple, Bing, Mapbox, any
YouTuber, or the reference video. Built in this repo from:

| Data | From | Licence |
|---|---|---|
| Elevation + ocean depth | **AWS Terrain Tiles** ("terrarium", `s3.amazonaws.com/elevation-tiles-prod`), built by Mapzen/Tilezen from 3DEP, SRTM, GMTED2010, ETOPO1, EU-DEM, Canada CDEM, UK EA and others | Open data, **attribution required**: the block is in `docs/CREDITS_DESCRIPTION.md` |
| Lakes (burned into the masks) | **Natural Earth** 1:10m lakes (`nvkelso/natural-earth-vector`) | Public domain |

## Files

`regions.json` holds the exact bounds of every region. All rasters are **plate carrée** (equirectangular, x ∝ lon, y ∝ lat):
the projection `src/lib/map/geo.ts` uses. Pixel → lon/lat: `lon = west + (x + 0.5) / pxPerDegree`,
`lat = north − (y + 0.5) / pxPerDegree`.

| Region | Bounds (W, S, E, N) | Size | px/° | Used for |
|---|---|---|---|---|
| `world` | −180, −60, 180, 75 | 3840×1440 | 10.67 | S04 "World War", India pulse, S20 war map |
| `atlantic` | −82, 25, 5, 62 | 5220×2220 | 60 | Britain ↔ colonies (S05, S07, S14, S16) |
| `europe` | −12, 34, 32, 62 | 2640×1680 | 60 | S04 "Europe", Britain close |
| `india` | 66, 6, 98, 36 | 1920×1800 | 60 | S04 "हमारे भारत तक", S13 Bengal |
| `eastcoast` | −86, 28, −64, 48 | 3960×3600 | 180 | the 13 colonies (most map shots) |
| `appalachians` | −86, 33, −72, 45 | 3360×2880 | 240 | S04 Ohio country tilt, S06 Proclamation Line |
| `massachusetts` | −72, 41.8, −69.8, 43 | 3840×2095 | 1745.5 | S15 Lexington / Concord / Revere route |

Per region:

| File | What | Encoding |
|---|---|---|
| `hillshade_<r>.jpg` | Shaded relief, land only | Light from 315° at 40° + fill from 270°. **Flat ground = 204 (0.8)**, so `mix-blend-mode: multiply` darkens shadows and leaves flat land and ocean untouched. Vertical exaggeration per region in `regions.json`. |
| `oceandepth_<r>.jpg` | Ocean depth | 255 at the coast and on land, falling with √(depth/4000 m) to 0 in the deep ocean. Lakes = 215. This gives the light **continental shelf** band the reference's satellite ocean has. |
| `landmask_<r>.png` | Land = 255, water = 0 | Lakes are water. Specks below ~0.012°² are removed. |
| `height_<r>.png` | Heightmap for 3D displacement | `round(sqrt(elev / metresAtWhite) * 255)`, sea and lakes = 0. `metresAtWhite` is in `regions.json`. ≤ 2048 px wide (enough for a displaced mesh). |

Also in `public/maps/`:

| File | What |
|---|---|
| `rivers-na-10m.json` | Natural Earth 10m rivers for North America (incl. the North America supplement), **canals removed** (the Erie Canal is 1825). Has the Ohio, Allegheny, Monongahela, Potomac, Hudson, Delaware, Susquehanna, St. Lawrence, Mohawk and James. |
| `lakes-na-10m.json` | Natural Earth 10m lakes, North America, **reservoirs removed** (e.g. Allegheny Reservoir 1965, Quabbin 1939). |
| `rivers-world-major.json` | Natural Earth 10m rivers, scalerank ≤ 4, worldwide (Ganges for Bengal). |
| `land-10m.geo.json`, `countries-10m.geo.json` | Natural Earth 1:10m via world-atlas (from the source zip). **Coastlines only:** never show modern borders as 1760s borders. |
| `coast-massachusetts-terrain.json` | Shoreline traced from `landmask_massachusetts.png`: much finer than 10m for the S15 close-up. |

## Quality checks done

- **Alignment:** Natural Earth coastlines and `colonies-1775.json` overlaid on every raster, with pins at Boston, New York,
  Philadelphia, Cape Cod's tip, Lexington, Concord, the Forks of the Ohio and Jumonville Glen. All sit on the terrain
  coastline.
- **Elevations spot-checked:** Mt Wachusett 608 m (true 611), Lexington Green 69 m (62), Concord North Bridge 36 m (40),
  Pack Monadnock 696 m (698), Appalachian max 1,997 m (Mt Mitchell 2,037).
- **Spikes repaired:** the source tiles contain isolated bad pixels (down to −15,127 m off Cape Cod). Each was replaced
  with its 5×5 median; counts per region are in `regions.json`.
- **Coast staircase removed:** at Cape Cod the z12 data mixes in a coarse source, which made blocky shores. A median
  filter on the land/sea edge plus speck removal fixes it.

## Known limits — read before using a region

1. **Boston is modern.** The terrain includes ~150 years of landfill (Back Bay, South Boston, the airport). In 1775 Boston
   was a near-island joined to the mainland by the narrow Neck. **Do not use `massachusetts` rasters or
   `coast-massachusetts-terrain.json` for a close-up of 1770s Boston** (S11 pin zoom, S14 port closed). Those need the
   1775 shoreline traced from a public-domain period map. Lexington, Concord and the Revere route are inland and fine.
2. **No seabed near the US coast at z12.** In `massachusetts`, Massachusetts Bay reads 0 m (no bathymetry at that zoom),
   so its ocean-depth map is flat. Fine for the flat/parchment close-up look the reference uses there.
3. **Upper St. Lawrence** is a line in Natural Earth, not a polygon, so it stays land in the masks. Draw it from
   `rivers-na-10m.json`.
4. **This is terrain, not satellite imagery.** The reference's satellite look needs NASA Blue Marble, which this
   environment's network policy currently blocks (see the session notes). These rasters do not imitate it.

## Rebuild

`scripts/maps/` (see its README): `build_terrain.py` → `derive_rasters.py` → `check_alignment.py`.
