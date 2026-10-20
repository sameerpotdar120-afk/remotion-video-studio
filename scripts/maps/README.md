# Map raster builders

```bash
# 1. download AWS Terrain Tiles + reproject to plate carrée (writes <region>_elev.npy + _meta.json into CACHE)
python3 scripts/maps/build_terrain.py CACHE OUTDIR world atlantic europe india eastcoast appalachians massachusetts
# 2. repair spikes, burn in lakes, write hillshade / oceandepth / landmask / height + regions.json
python3 scripts/maps/derive_rasters.py CACHE public/assets/maps_raster public/maps/lakes-na-10m.json LAKES_WORLD.geojson
# 3. visual alignment check: vectors + pins over the terrain
python3 scripts/maps/check_alignment.py . eastcoast out/check_eastcoast.jpg land-50m.geo.json
```
`LAKES_WORLD.geojson` = Natural Earth `ne_10m_lakes.geojson` (raw.githubusercontent.com/nvkelso/natural-earth-vector)
with reservoirs and canals removed. Sources and licences: `public/assets/maps_raster/SOURCES.md`.
